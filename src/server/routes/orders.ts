import { Router, Request, Response } from 'express';
import { db } from '../../db/index.ts';
import { 
  customers, 
  vehicles, 
  orders, 
  securityCodes, 
  payments, 
  orderEvents, 
  emailLogs,
  authorities
} from '../../db/schema.ts';
import { eq, sql } from 'drizzle-orm';
import { encryptAtRest, maskCode, sanitizeMetadata } from '../crypto.ts';
import { validateOrderInput } from '../validation.ts';
import { 
  processOrderDeregistration, 
  determineAuthorityForDistrict, 
  ensureDefaultAuthoritiesSeeded 
} from '../ikfz/index.ts';

export const ordersRouter = Router();

// Pricing constants (Strict business model)
const SERVICE_FEE = 19.90;
const AUTHORITY_FEE = 2.70;
const RESERVATION_FEE = 12.80;

/**
 * GET /api/authorities/lookup
 * Look up responsible Zulassungsbehörde for a given district or license plate.
 */
ordersRouter.get('/authorities/lookup', async (req: Request, res: Response) => {
  try {
    const district = (req.query.district as string) || '';
    const postalCode = (req.query.postalCode as string) || undefined;

    if (!district) {
      return res.status(400).json({ error: 'Zulassungsbezirk oder Kennzeichen erforderlich' });
    }

    const resolution = await determineAuthorityForDistrict(district, postalCode);
    return res.json(resolution);
  } catch (error) {
    console.error('[Orders] Authority lookup error:', error);
    return res.status(500).json({ error: 'Behördenermittlung fehlgeschlagen' });
  }
});

/**
 * Generate unique public order ID (e.g. "KFA-2026-000001")
 * Never exposes database IDs.
 */
async function generateUniquePublicOrderId(): Promise<string> {
  const year = new Date().getFullYear();
  try {
    const result = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const count = Number(result[0]?.count || 0) + 1;
    return `KFA-${year}-${String(count).padStart(6, '0')}`;
  } catch {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    return `KFA-${year}-${randomSuffix}`;
  }
}

/**
 * POST /api/orders
 * Secure creation of a vehicle deregistration request.
 */
ordersRouter.post('/', async (req: Request, res: Response) => {
  try {
    // 1. Server-side validation of all fields (never trust client)
    const validation = validateOrderInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validierungsfehler',
        details: validation.errors,
      });
    }

    const { vehicle, securityCodes: secCodes, customer, reservation } = req.body;

    // 2. Verified fee calculation on server
    const hasReservation = Boolean(reservation?.reservePlate);
    const totalAuthority = Number((AUTHORITY_FEE + (hasReservation ? RESERVATION_FEE : 0)).toFixed(2));
    const totalPrice = Number((SERVICE_FEE + totalAuthority).toFixed(2));
    const publicOrderId = await generateUniquePublicOrderId();

    // 3. Client metadata for audit
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // 4. Encrypt sensitive values at rest using AES-256-GCM
    const encryptedZbi = encryptAtRest(secCodes.zbISecurityCode.trim().toUpperCase());
    const encryptedFront = secCodes.frontPlateCode ? encryptAtRest(secCodes.frontPlateCode.trim().toUpperCase()) : null;
    const encryptedRear = secCodes.rearPlateCode ? encryptAtRest(secCodes.rearPlateCode.trim().toUpperCase()) : null;
    const encryptedIban = customer.iban ? encryptAtRest(customer.iban.trim().replace(/\s+/g, '')) : null;
    const encryptedPin = reservation?.reservationPin ? encryptAtRest(reservation.reservationPin.trim()) : null;

    // Masked representations (safe for staff verification)
    const maskedZbi = maskCode(secCodes.zbISecurityCode);
    const maskedFront = secCodes.frontPlateCode ? maskCode(secCodes.frontPlateCode) : null;
    const maskedRear = secCodes.rearPlateCode ? maskCode(secCodes.rearPlateCode) : null;

    // 5. GDPR Retention Policy: Purge sensitive security codes 14 days after creation/completion
    const retentionExpiresAt = new Date();
    retentionExpiresAt.setDate(retentionExpiresAt.getDate() + 14);

    // 6. Database Inserts in strict order
    // A. Insert Customer
    const [insertedCustomer] = await db.insert(customers).values({
      salutation: customer.salutation || 'herr',
      firstName: customer.firstName.trim(),
      lastName: customer.lastName.trim(),
      companyName: customer.companyName?.trim() || null,
      email: customer.email.trim().toLowerCase(),
      phone: customer.phone?.trim() || null,
      street: customer.street.trim(),
      houseNumber: customer.houseNumber.trim(),
      postalCode: customer.postalCode.trim(),
      city: customer.city.trim(),
      country: customer.country?.trim() || 'Deutschland',
      ibanEncrypted: encryptedIban,
    }).returning();

    // B. Insert Vehicle
    const [insertedVehicle] = await db.insert(vehicles).values({
      licensePlate: (vehicle.licensePlateNormalized || vehicle.licensePlate).trim().toUpperCase(),
      vin: vehicle.vin?.trim().toUpperCase() || null,
      registrationDistrict: vehicle.registrationDistrict.trim(),
      zbiIssueDate: vehicle.issueDateZBI.trim(),
      reservationRequested: hasReservation,
      reservationDurationMonths: hasReservation ? (reservation.reservationDurationMonths || 6) : null,
      reservationPinEncrypted: encryptedPin,
      vehicleType: vehicle.vehicleType || 'pkw',
      plateConfiguration: vehicle.plateConfiguration || 'standard_two',
    }).returning();

    // C. Insert Order
    const [insertedOrder] = await db.insert(orders).values({
      publicOrderId,
      customerId: insertedCustomer.id,
      vehicleId: insertedVehicle.id,
      status: 'pending_payment',
      servicePrice: SERVICE_FEE.toFixed(2),
      authorityFee: AUTHORITY_FEE.toFixed(2),
      reservationFee: (hasReservation ? RESERVATION_FEE : 0).toFixed(2),
      totalPrice: totalPrice.toFixed(2),
      currency: 'EUR',
      clientIp,
      userAgent,
    }).returning();

    // D. Insert Security Codes (Encrypted at rest)
    await db.insert(securityCodes).values({
      orderId: insertedOrder.id,
      vehicleId: insertedVehicle.id,
      zbiSecurityCodeEncrypted: encryptedZbi,
      frontPlateSecurityCodeEncrypted: encryptedFront,
      rearPlateSecurityCodeEncrypted: encryptedRear,
      zbiSecurityCodeMasked: maskedZbi,
      frontPlateSecurityCodeMasked: maskedFront,
      rearPlateSecurityCodeMasked: maskedRear,
      singlePlateOnly: Boolean(secCodes.singlePlateOnly),
      scratchedConfirmed: true,
      encryptionKeyId: 'aes-256-gcm-v1',
      retentionExpiresAt,
      isPurged: false,
    });

    // E. Initial Order Event (Strictly sanitized metadata - NEVER security codes)
    const sanitizedMeta = sanitizeMetadata({
      publicOrderId,
      licensePlate: insertedVehicle.licensePlate,
      district: insertedVehicle.registrationDistrict,
      totalPrice,
      hasReservation,
    });

    await db.insert(orderEvents).values({
      orderId: insertedOrder.id,
      eventType: 'order_created',
      previousStatus: null,
      newStatus: 'pending_payment',
      description: `Auftrag ${publicOrderId} erfolgreich erfasst und verschlüsselt gespeichert.`,
      actorType: 'customer',
      metadata: JSON.stringify(sanitizedMeta),
    });

    // Return safe public representation (ZERO database IDs, ZERO raw security codes)
    return res.status(201).json({
      success: true,
      publicOrderId,
      status: 'pending_payment',
      vehicle: {
        licensePlate: insertedVehicle.licensePlate,
        registrationDistrict: insertedVehicle.registrationDistrict,
        zbiIssueDate: insertedVehicle.zbiIssueDate,
        hasReservation,
      },
      pricing: {
        servicePrice: SERVICE_FEE,
        authorityFee: AUTHORITY_FEE,
        reservationFee: hasReservation ? RESERVATION_FEE : 0,
        totalPrice,
        currency: 'EUR',
      },
      customer: {
        name: `${insertedCustomer.firstName} ${insertedCustomer.lastName}`,
        email: insertedCustomer.email,
      },
      createdAt: insertedOrder.createdAt,
    });
  } catch (error: any) {
    console.error('[Orders] Failed to create order:', error);
    return res.status(500).json({
      error: 'Auftragserstellung fehlgeschlagen',
      message: 'Bitte versuchen Sie es später erneut.',
    });
  }
});

/**
 * GET /api/orders/:publicOrderId
 * Public order status lookup for customers.
 */
ordersRouter.get('/:publicOrderId', async (req: Request, res: Response) => {
  try {
    const { publicOrderId } = req.params;
    if (!publicOrderId) {
      return res.status(400).json({ error: 'Auftragsnummer erforderlich' });
    }

    const orderRows = await db
      .select({
        publicOrderId: orders.publicOrderId,
        status: orders.status,
        servicePrice: orders.servicePrice,
        authorityFee: orders.authorityFee,
        totalPrice: orders.totalPrice,
        currency: orders.currency,
        createdAt: orders.createdAt,
        paidAt: orders.paidAt,
        completedAt: orders.completedAt,
        ikfzReference: orders.ikfzReference,
        licensePlate: vehicles.licensePlate,
        registrationDistrict: vehicles.registrationDistrict,
        customerFirstName: customers.firstName,
        customerLastName: customers.lastName,
        customerEmail: customers.email,
      })
      .from(orders)
      .innerJoin(vehicles, eq(orders.vehicleId, vehicles.id))
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.publicOrderId, publicOrderId))
      .limit(1);

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Auftrag nicht gefunden' });
    }

    const o = orderRows[0];
    return res.json({
      publicOrderId: o.publicOrderId,
      status: o.status,
      licensePlate: o.licensePlate,
      registrationDistrict: o.registrationDistrict,
      customerName: `${o.customerFirstName} ${o.customerLastName}`,
      customerEmail: o.customerEmail,
      pricing: {
        servicePrice: Number(o.servicePrice),
        authorityFee: Number(o.authorityFee),
        totalPrice: Number(o.totalPrice),
        currency: o.currency,
      },
      createdAt: o.createdAt,
      paidAt: o.paidAt,
      completedAt: o.completedAt,
      ikfzReference: o.ikfzReference,
    });
  } catch (error) {
    console.error('[Orders] Error finding order:', error);
    return res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

/**
 * POST /api/orders/:publicOrderId/payment
 * Captures payment, transitions status to paid -> submitted_to_ikfz -> erfolgreich_abgemeldet.
 */
ordersRouter.post('/:publicOrderId/payment', async (req: Request, res: Response) => {
  try {
    const { publicOrderId } = req.params;
    const { paymentMethod = 'paypal' } = req.body;

    const orderList = await db
      .select()
      .from(orders)
      .where(eq(orders.publicOrderId, publicOrderId))
      .limit(1);

    if (orderList.length === 0) {
      return res.status(404).json({ error: 'Auftrag nicht gefunden' });
    }

    const order = orderList[0];
    const now = new Date();
    const reference = `IKFZ-DE-${Math.floor(1000000 + Math.random() * 9000000)}`;

    // 1. Record Payment
    await db.insert(payments).values({
      orderId: order.id,
      provider: paymentMethod,
      providerTransactionId: `TX-${paymentMethod.toUpperCase()}-${Date.now()}`,
      status: 'captured',
      amount: order.totalPrice,
      currency: order.currency,
      paymentDetails: JSON.stringify({ provider: paymentMethod, capturedAt: now.toISOString() }),
      paidAt: now,
    });

    // Mark paid status initially
    await db
      .update(orders)
      .set({
        paidAt: now,
        updatedAt: now,
      })
      .where(eq(orders.id, order.id));

    // 2. Authoritative i-KfZ Processing Orchestrator
    // Follows strict guidelines:
    // - Never falsely claim success
    // - Only set "erfolgreich_abgemeldet" if authoritative system confirms
    // - If unsupported or error: status = MANUAL_REVIEW
    // - Never fabricate confirmation numbers
    const outcome = await processOrderDeregistration(order.id);

    return res.json({
      success: outcome.success,
      publicOrderId: order.publicOrderId,
      status: outcome.status,
      displayStatus: outcome.displayStatus,
      ikfzReference: outcome.ikfzReference,
      message: outcome.message,
      authorityName: outcome.authorityName,
      paidAt: now.toISOString(),
      completedAt: outcome.status === 'erfolgreich_abgemeldet' ? now.toISOString() : null,
    });
  } catch (error) {
    console.error('[Orders] Payment processing failed:', error);
    return res.status(500).json({ error: 'Zahlungsverarbeitung fehlgeschlagen' });
  }
});
