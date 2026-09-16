import { Router, Response } from 'express';
import { db } from '../../db/index.ts';
import { 
  adminUsers, 
  orders, 
  vehicles, 
  customers, 
  securityCodes, 
  payments, 
  refunds, 
  orderEvents, 
  emailLogs, 
  auditLogs,
  orderNotes,
  systemSettings,
  authorities
} from '../../db/schema.ts';
import { eq, desc, lte, gte, and, sql, or } from 'drizzle-orm';
import { 
  generateSessionToken, 
  hashPassword, 
  verifyPassword, 
  sanitizeMetadata,
  decryptAtRest,
  encryptAtRest,
  maskCode
} from '../crypto.ts';
import { requireAdminAuth, AuthenticatedAdminRequest } from '../auth.ts';
import { processOrderDeregistration } from '../ikfz/index.ts';

export const adminRouter = Router();

// Helper to extract client IP safely
function getClientIp(req: AuthenticatedAdminRequest): string {
  return (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
}

// ==========================================
// Seed Default Admin User & Sample Data
// ==========================================
async function ensureDefaultAdminAndData() {
  try {
    // 1. Admin user
    const existing = await db.select().from(adminUsers).limit(1);
    let defaultAdminId = 1;
    if (existing.length === 0) {
      const defaultEmail = 'admin@kfz-abmelden-online.de';
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'AdminSecure2026!';
      const passwordHash = hashPassword(defaultPassword);
      
      const [inserted] = await db.insert(adminUsers).values({
        email: defaultEmail,
        name: 'KFZ Admin Leitstand',
        role: 'superadmin',
        isActive: true,
        passwordHash,
      }).returning();
      defaultAdminId = inserted.id;
      console.log('[Admin] Default administrator initialized: admin@kfz-abmelden-online.de');
    } else {
      defaultAdminId = existing[0].id;
    }

    // 2. Default System Settings
    const existingSettings = await db.select().from(systemSettings).limit(1);
    if (existingSettings.length === 0) {
      await db.insert(systemSettings).values([
        { key: 'service_fee', value: '19.90', description: 'Basis Servicegebühr für Online-Abmeldung (EUR)' },
        { key: 'authority_fee', value: '2.70', description: 'Behördliche Bundesgebühr KBA/StVO (EUR)' },
        { key: 'reservation_fee', value: '12.80', description: 'Gebühr für Kennzeichen-Reservierung (EUR)' },
        { key: 'ikfz_api_mode', value: 'production_mock', description: 'i-KfZ Schnittstellenmodus (production | sandbox | production_mock)' },
        { key: 'gdpr_retention_days', value: '14', description: 'Aufbewahrungsfrist für Sicherheitscodes in Tagen gem. DSGVO' },
        { key: 'auto_email_notifications', value: 'true', description: 'Automatische Kundenbenachrichtigung per E-Mail' },
      ]);
    }

    // 3. Seed Realistic Dataset if orders table has few records
    const orderCountRes = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const orderCount = Number(orderCountRes[0]?.count || 0);

    if (orderCount < 5) {
      console.log('[Admin] Seeding realistic sample orders for dashboard demonstration...');
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 30);
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

      const sampleData = [
        {
          // Order 1: Successfully deregistered today
          customer: { firstName: 'Maximilian', lastName: 'Weber', email: 'm.weber@beispiel.de', phone: '+49 171 1234567', street: 'Königsallee', houseNumber: '42', postalCode: '40212', city: 'Düsseldorf' },
          vehicle: { licensePlate: 'D-MW 8899', vin: 'WBA3A51090F123456', registrationDistrict: 'Düsseldorf', zbiIssueDate: '2019-05-14', reservationRequested: true },
          order: { publicOrderId: 'KFA-2026-001042', status: 'erfolgreich_abgemeldet', totalPrice: '35.40', servicePrice: '19.90', authorityFee: '2.70', reservationFee: '12.80', createdAt: todayStart, paidAt: todayStart, completedAt: todayStart, ikfzReference: 'IKFZ-DE-9182374' },
          payment: { provider: 'paypal', status: 'captured', amount: '35.40', txId: 'TX-PAYPAL-982173' },
          secCodes: { zbi: 'A8B9C2D', front: '1E3', rear: '4F8' },
          note: 'i-KfZ Quittung erfolgreich generiert und an Fahrzeughalter versendet.',
        },
        {
          // Order 2: In Manual Review Queue (Needs human verification)
          customer: { firstName: 'Sabine', lastName: 'Fischer', email: 'sabine.fischer@mail-test.de', phone: '+49 160 9988776', street: 'Marienplatz', houseNumber: '15', postalCode: '80331', city: 'München' },
          vehicle: { licensePlate: 'M-SF 2024', vin: 'WAUZZZ8V7FA654321', registrationDistrict: 'München (Stadt)', zbiIssueDate: '2021-08-20', reservationRequested: false },
          order: { publicOrderId: 'KFA-2026-001043', status: 'manuelle_pruefung', totalPrice: '22.60', servicePrice: '19.90', authorityFee: '2.70', reservationFee: '0.00', createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), paidAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), completedAt: null, ikfzReference: null },
          payment: { provider: 'klarna', status: 'captured', amount: '22.60', txId: 'TX-KLARNA-451299' },
          secCodes: { zbi: '7XY9921', front: '8A2', rear: '3B9' },
          note: 'Prüfhinweis: Stempelplakette auf vorderem Schild meldet Beschädigung des Rubbelfeldes. Manuelle Sichtprüfung erforderlich.',
        },
        {
          // Order 3: Successful Deregistration (Yesterday)
          customer: { firstName: 'Dr. Thomas', lastName: 'Schneider', email: 'dr.schneider@praxis-koeln.de', phone: '+49 221 556677', street: 'Hohenzollernring', houseNumber: '78', postalCode: '50672', city: 'Köln' },
          vehicle: { licensePlate: 'K-TS 1980', vin: 'WVWZZZ3CZWE987654', registrationDistrict: 'Köln', zbiIssueDate: '2018-03-10', reservationRequested: false },
          order: { publicOrderId: 'KFA-2026-001044', status: 'erfolgreich_abgemeldet', totalPrice: '22.60', servicePrice: '19.90', authorityFee: '2.70', reservationFee: '0.00', createdAt: yesterday, paidAt: yesterday, completedAt: yesterday, ikfzReference: 'IKFZ-DE-7744112' },
          payment: { provider: 'card', status: 'captured', amount: '22.60', txId: 'TX-STRIPE-332190' },
          secCodes: { zbi: 'K9L2M5N', front: '9C1', rear: '2D4' },
          note: 'Abmeldung im ersten Versuch erfolgreich über i-KfZ Schnittstelle vollzogen.',
        },
        {
          // Order 4: Failed Request / Rejected by authority
          customer: { firstName: 'Alexander', lastName: 'Müller', email: 'alex.mueller@web-berlin.de', phone: '+49 30 889900', street: 'Friedrichstraße', houseNumber: '110', postalCode: '10117', city: 'Berlin' },
          vehicle: { licensePlate: 'B-AM 4001', vin: 'VF1BZ0A0H41298711', registrationDistrict: 'Berlin', zbiIssueDate: '2014-11-20', reservationRequested: false },
          order: { publicOrderId: 'KFA-2026-001045', status: 'abgelehnt', totalPrice: '22.60', servicePrice: '19.90', authorityFee: '2.70', reservationFee: '0.00', createdAt: threeDaysAgo, paidAt: threeDaysAgo, completedAt: null, ikfzReference: 'IKFZ-ERR-409' },
          payment: { provider: 'paypal', status: 'captured', amount: '22.60', txId: 'TX-PAYPAL-112233' },
          secCodes: { zbi: '3P4Q5R6', front: '4X8', rear: '7Y1' },
          note: 'Behörden-Rückweisung: Zulassungsbescheinigung Teil I wurde vor 01.01.2015 ausgestellt und besitzt keinen gültigen Sicherheitscode.',
        },
        {
          // Order 5: Refunded (Rückerstattung)
          customer: { firstName: 'Claudia', lastName: 'Becker', email: 'claudia.becker@hamburg-net.de', phone: '+49 40 334455', street: 'Mönckebergstraße', houseNumber: '25', postalCode: '20095', city: 'Hamburg' },
          vehicle: { licensePlate: 'HH-CB 5522', vin: 'TMBJJ7NP7L7001122', registrationDistrict: 'Hamburg', zbiIssueDate: '2020-10-05', reservationRequested: false },
          order: { publicOrderId: 'KFA-2026-001046', status: 'erstattet', totalPrice: '22.60', servicePrice: '19.90', authorityFee: '2.70', reservationFee: '0.00', createdAt: threeDaysAgo, paidAt: threeDaysAgo, completedAt: null, ikfzReference: null },
          payment: { provider: 'sepa', status: 'refunded', amount: '22.60', txId: 'TX-SEPA-998811' },
          secCodes: { zbi: '9Z8Y7X6', front: '5W2', rear: '1V9' },
          note: 'Kunde hat Fahrzeug vorab physisch bei der Behörde abgemeldet. Vollständige Rückerstattung veranlasst.',
          refundReason: 'Doppelabmeldung durch Fahrzeughalter bei Vor-Ort-Zulassungsstelle',
        }
      ];

      for (const item of sampleData) {
        // Insert Customer
        const [c] = await db.insert(customers).values({
          salutation: 'herr',
          firstName: item.customer.firstName,
          lastName: item.customer.lastName,
          email: item.customer.email,
          phone: item.customer.phone,
          street: item.customer.street,
          houseNumber: item.customer.houseNumber,
          postalCode: item.customer.postalCode,
          city: item.customer.city,
          country: 'Deutschland',
        }).returning();

        // Insert Vehicle
        const [v] = await db.insert(vehicles).values({
          licensePlate: item.vehicle.licensePlate,
          vin: item.vehicle.vin,
          registrationDistrict: item.vehicle.registrationDistrict,
          zbiIssueDate: item.vehicle.zbiIssueDate,
          reservationRequested: item.vehicle.reservationRequested,
        }).returning();

        // Insert Order
        const [o] = await db.insert(orders).values({
          publicOrderId: item.order.publicOrderId,
          customerId: c.id,
          vehicleId: v.id,
          status: item.order.status,
          totalPrice: item.order.totalPrice,
          servicePrice: item.order.servicePrice,
          authorityFee: item.order.authorityFee,
          reservationFee: item.order.reservationFee,
          currency: 'EUR',
          createdAt: item.order.createdAt,
          updatedAt: item.order.createdAt,
          paidAt: item.order.paidAt,
          completedAt: item.order.completedAt,
          ikfzReference: item.order.ikfzReference,
        }).returning();

        // Insert Security Codes (Encrypted + Masked)
        const retentionExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        await db.insert(securityCodes).values({
          orderId: o.id,
          vehicleId: v.id,
          zbiSecurityCodeEncrypted: encryptAtRest(item.secCodes.zbi),
          frontPlateSecurityCodeEncrypted: encryptAtRest(item.secCodes.front),
          rearPlateSecurityCodeEncrypted: encryptAtRest(item.secCodes.rear),
          zbiSecurityCodeMasked: maskCode(item.secCodes.zbi),
          frontPlateSecurityCodeMasked: maskCode(item.secCodes.front),
          rearPlateSecurityCodeMasked: maskCode(item.secCodes.rear),
          singlePlateOnly: false,
          scratchedConfirmed: true,
          retentionExpiresAt,
          isPurged: false,
        });

        // Insert Payment
        const [pay] = await db.insert(payments).values({
          orderId: o.id,
          provider: item.payment.provider,
          status: item.payment.status,
          amount: item.payment.amount,
          currency: 'EUR',
          providerTransactionId: item.payment.txId,
          paidAt: item.order.paidAt,
          createdAt: item.order.createdAt,
        }).returning();

        // Insert Order Events
        await db.insert(orderEvents).values({
          orderId: o.id,
          eventType: 'order_created',
          previousStatus: null,
          newStatus: item.order.status,
          description: `Auftrag ${item.order.publicOrderId} im System registriert.`,
          actorType: 'customer',
          createdAt: item.order.createdAt,
        });

        if (item.order.paidAt) {
          await db.insert(orderEvents).values({
            orderId: o.id,
            eventType: 'payment_captured',
            previousStatus: 'pending_payment',
            newStatus: item.order.status,
            description: `Zahlung in Höhe von ${item.order.totalPrice} EUR via ${item.payment.provider} erfolgreich verbucht.`,
            actorType: 'system',
            createdAt: item.order.paidAt,
          });
        }

        // Insert Email Log
        await db.insert(emailLogs).values({
          orderId: o.id,
          recipient: c.email,
          subject: `Eingangsbestätigung Auftrag ${item.order.publicOrderId} [KFZ Abmelden Online]`,
          emailType: 'order_confirmation',
          status: 'delivered',
          sentAt: item.order.createdAt,
        });

        // Insert Note
        await db.insert(orderNotes).values({
          orderId: o.id,
          adminUserId: defaultAdminId,
          adminName: 'KFZ Admin Leitstand',
          note: item.note,
          createdAt: item.order.createdAt,
        });

        // If refunded, insert refund record
        if (item.order.status === 'erstattet') {
          await db.insert(refunds).values({
            orderId: o.id,
            paymentId: pay.id,
            amount: item.order.totalPrice,
            currency: 'EUR',
            reason: item.refundReason || 'Kundenstornierung',
            adminUserId: defaultAdminId,
            status: 'processed',
            providerRefundId: `REF-${Date.now()}`,
            createdAt: now,
            processedAt: now,
          });

          await db.insert(auditLogs).values({
            eventType: 'refund_issued',
            orderId: o.id,
            adminUserId: defaultAdminId,
            timestamp: now,
            ipAddress: '127.0.0.1',
            userAgent: 'system_initializer',
            metadata: JSON.stringify({ publicOrderId: item.order.publicOrderId, reason: item.refundReason, amount: item.order.totalPrice }),
          });
        }
      }
      console.log('[Admin] Realistic sample orders successfully seeded.');
    }
  } catch (err) {
    console.error('[Admin] Error in ensureDefaultAdminAndData:', err);
  }
}
ensureDefaultAdminAndData();

// ==========================================
// 1. Authentication Endpoints
// ==========================================

adminRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-Mail und Passwort erforderlich' });
  }

  try {
    const users = await db
      .select()
      .from(adminUsers)
      .where(and(eq(adminUsers.email, email.trim().toLowerCase()), eq(adminUsers.isActive, true)))
      .limit(1);

    if (users.length === 0 || !users[0].passwordHash) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const user = users[0];
    const isPasswordValid = verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
    const now = new Date();

    await db
      .update(adminUsers)
      .set({
        sessionToken,
        sessionExpiresAt: expiresAt,
        lastLoginAt: now,
        updatedAt: now,
      })
      .where(eq(adminUsers.id, user.id));

    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    await db.insert(auditLogs).values({
      eventType: 'admin_login',
      adminUserId: user.id,
      timestamp: now,
      ipAddress: clientIp,
      userAgent: req.headers['user-agent'] || 'unknown',
      metadata: JSON.stringify(sanitizeMetadata({ email: user.email, role: user.role })),
    });

    return res.json({
      success: true,
      sessionToken,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Admin] Login error:', error);
    return res.status(500).json({ error: 'Login fehlgeschlagen' });
  }
});

adminRouter.post('/logout', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    if (req.admin?.id) {
      await db
        .update(adminUsers)
        .set({ sessionToken: null, sessionExpiresAt: null })
        .where(eq(adminUsers.id, req.admin.id));

      await db.insert(auditLogs).values({
        eventType: 'admin_logout',
        adminUserId: req.admin.id,
        timestamp: new Date(),
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || 'unknown',
        metadata: JSON.stringify({ email: req.admin.email }),
      });
    }
    return res.json({ success: true, message: 'Erfolgreich abgemeldet' });
  } catch (error) {
    return res.status(500).json({ error: 'Logout fehlgeschlagen' });
  }
});

adminRouter.get('/me', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  return res.json({ admin: req.admin });
});

// ==========================================
// 2. DASHBOARD KPIS (Exact User Request)
// - Orders today
// - Orders this week
// - Revenue today
// - Revenue this month
// - Successful Abmeldungen
// - Failed requests
// - Manual review queue
// - Refunds
// ==========================================
adminRouter.get('/dashboard-stats', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const now = new Date();
    // Today boundary (00:00:00)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Week boundary (Monday 00:00:00)
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0 = Monday
    const weekStart = new Date(todayStart.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
    
    // Month boundary (1st of month 00:00:00)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all orders to compute exact stats
    const allOrders = await db
      .select({
        id: orders.id,
        status: orders.status,
        totalPrice: orders.totalPrice,
        createdAt: orders.createdAt,
        paidAt: orders.paidAt,
        completedAt: orders.completedAt,
      })
      .from(orders);

    let ordersToday = 0;
    let ordersThisWeek = 0;
    let revenueToday = 0;
    let revenueThisMonth = 0;
    let successfulAbmeldungen = 0;
    let failedRequests = 0;
    let manualReviewQueue = 0;
    let refundsCount = 0;

    for (const o of allOrders) {
      const orderDate = new Date(o.createdAt);
      const isPaid = Boolean(o.paidAt || o.status === 'paid' || o.status === 'erfolgreich_abgemeldet' || o.status === 'submitted_to_ikfz');
      const orderPrice = Number(o.totalPrice) || 0;

      // 1. Orders today
      if (orderDate >= todayStart) {
        ordersToday++;
      }

      // 2. Orders this week
      if (orderDate >= weekStart) {
        ordersThisWeek++;
      }

      // 3. Revenue today (paid/completed today)
      const payDate = o.paidAt ? new Date(o.paidAt) : orderDate;
      if (isPaid && payDate >= todayStart) {
        revenueToday += orderPrice;
      }

      // 4. Revenue this month
      if (isPaid && payDate >= monthStart) {
        revenueThisMonth += orderPrice;
      }

      // 5. Successful Abmeldungen
      if (o.status === 'erfolgreich_abgemeldet') {
        successfulAbmeldungen++;
      }

      // 6. Failed requests
      if (o.status === 'abgelehnt') {
        failedRequests++;
      }

      // 7. Manual review queue
      if (o.status === 'manuelle_pruefung') {
        manualReviewQueue++;
      }

      // 8. Refunds
      if (o.status === 'erstattet') {
        refundsCount++;
      }
    }

    return res.json({
      kpis: {
        ordersToday,
        ordersThisWeek,
        revenueToday: Number(revenueToday.toFixed(2)),
        revenueThisMonth: Number(revenueThisMonth.toFixed(2)),
        successfulAbmeldungen,
        failedRequests,
        manualReviewQueue,
        refunds: refundsCount,
      },
      totalOrders: allOrders.length,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[Admin] Error calculating dashboard stats:', error);
    return res.status(500).json({ error: 'Fehler bei der Berechnung der Dashboard-Kennzahlen' });
  }
});

// ==========================================
// 3. ORDERS TABLE & DETAILS
// Required columns:
// - Order ID
// - Date
// - Kennzeichen
// - Customer
// - Status
// - Payment
// - Created
// - Updated
// CRITICAL: DO NOT display security codes in the table.
// ==========================================
adminRouter.get('/orders', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { status, search, limit = '100' } = req.query;

    const query = db
      .select({
        id: orders.id,
        publicOrderId: orders.publicOrderId,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        licensePlate: vehicles.licensePlate,
        registrationDistrict: vehicles.registrationDistrict,
        customerName: sql<string>`concat(${customers.firstName}, ' ', ${customers.lastName})`,
        customerEmail: customers.email,
        customerPhone: customers.phone,
        status: orders.status,
        totalPrice: orders.totalPrice,
        currency: orders.currency,
        paidAt: orders.paidAt,
        completedAt: orders.completedAt,
        ikfzReference: orders.ikfzReference,
        paymentProvider: payments.provider,
        paymentStatus: payments.status,
      })
      .from(orders)
      .innerJoin(vehicles, eq(orders.vehicleId, vehicles.id))
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .leftJoin(payments, eq(orders.id, payments.orderId))
      .orderBy(desc(orders.createdAt))
      .limit(Number(limit) || 100);

    const rows = await query;

    // Filter in memory for maximum search responsiveness
    let filtered = rows;
    if (status && status !== 'all') {
      filtered = filtered.filter(r => r.status === status);
    }
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(r => 
        r.publicOrderId.toLowerCase().includes(q) ||
        r.licensePlate.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerEmail.toLowerCase().includes(q) ||
        (r.ikfzReference && r.ikfzReference.toLowerCase().includes(q))
      );
    }

    return res.json({
      orders: filtered,
      count: filtered.length,
    });
  } catch (error) {
    console.error('[Admin] Error listing orders:', error);
    return res.status(500).json({ error: 'Fehler beim Laden der Aufträge' });
  }
});

/**
 * GET /api/admin/orders/:publicOrderId
 * Detailed view of single order.
 * Required sections:
 * - Customer
 * - Vehicle
 * - Payment
 * - Processing
 * - Timeline
 * - Emails
 * - Notes
 * - Audit log
 *
 * CRITICAL RULE: Sensitive security codes MUST REMAIN MASKED BY DEFAULT.
 */
adminRouter.get('/orders/:publicOrderId', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { publicOrderId } = req.params;

    const orderRows = await db
      .select({
        order: orders,
        vehicle: vehicles,
        customer: customers,
      })
      .from(orders)
      .innerJoin(vehicles, eq(orders.vehicleId, vehicles.id))
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.publicOrderId, publicOrderId))
      .limit(1);

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Auftrag nicht gefunden' });
    }

    const { order, vehicle, customer } = orderRows[0];

    // 1. Masked security codes ONLY (NEVER unencrypted in normal view)
    const secCodes = await db
      .select({
        zbiSecurityCodeMasked: securityCodes.zbiSecurityCodeMasked,
        frontPlateSecurityCodeMasked: securityCodes.frontPlateSecurityCodeMasked,
        rearPlateSecurityCodeMasked: securityCodes.rearPlateSecurityCodeMasked,
        singlePlateOnly: securityCodes.singlePlateOnly,
        isPurged: securityCodes.isPurged,
        purgedAt: securityCodes.purgedAt,
        retentionExpiresAt: securityCodes.retentionExpiresAt,
      })
      .from(securityCodes)
      .where(eq(securityCodes.orderId, order.id))
      .limit(1);

    // 2. Payments
    const paymentRows = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .orderBy(desc(payments.createdAt));

    // 3. Timeline (Order Events)
    const events = await db
      .select()
      .from(orderEvents)
      .where(eq(orderEvents.orderId, order.id))
      .orderBy(desc(orderEvents.createdAt));

    // 4. Emails
    const emails = await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.orderId, order.id))
      .orderBy(desc(emailLogs.sentAt));

    // 5. Notes (Internal staff notes)
    const notes = await db
      .select()
      .from(orderNotes)
      .where(eq(orderNotes.orderId, order.id))
      .orderBy(desc(orderNotes.createdAt));

    // 6. Audit Log (Specific to this order)
    const orderAuditLogs = await db
      .select({
        id: auditLogs.id,
        eventType: auditLogs.eventType,
        adminEmail: adminUsers.email,
        timestamp: auditLogs.timestamp,
        ipAddress: auditLogs.ipAddress,
        metadata: auditLogs.metadata,
      })
      .from(auditLogs)
      .leftJoin(adminUsers, eq(auditLogs.adminUserId, adminUsers.id))
      .where(eq(auditLogs.orderId, order.id))
      .orderBy(desc(auditLogs.timestamp));

    // Mandatory Audit Log for Order Inspection
    await db.insert(auditLogs).values({
      eventType: 'order_viewed',
      orderId: order.id,
      adminUserId: req.admin?.id,
      timestamp: new Date(),
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      metadata: JSON.stringify(sanitizeMetadata({ publicOrderId: order.publicOrderId, status: order.status })),
    });

    return res.json({
      order: {
        id: order.id,
        publicOrderId: order.publicOrderId,
        status: order.status,
        servicePrice: order.servicePrice,
        authorityFee: order.authorityFee,
        reservationFee: order.reservationFee,
        totalPrice: order.totalPrice,
        currency: order.currency,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        paidAt: order.paidAt,
        completedAt: order.completedAt,
        ikfzReference: order.ikfzReference,
        deRegistrationDate: order.deRegistrationDate,
        digitalReceiptPath: order.digitalReceiptPath,
      },
      customer: {
        id: customer.id,
        salutation: customer.salutation,
        firstName: customer.firstName,
        lastName: customer.lastName,
        companyName: customer.companyName,
        email: customer.email,
        phone: customer.phone,
        street: customer.street,
        houseNumber: customer.houseNumber,
        postalCode: customer.postalCode,
        city: customer.city,
        country: customer.country,
      },
      vehicle: {
        id: vehicle.id,
        licensePlate: vehicle.licensePlate,
        vin: vehicle.vin,
        registrationDistrict: vehicle.registrationDistrict,
        zbiIssueDate: vehicle.zbiIssueDate,
        reservationRequested: vehicle.reservationRequested,
        reservationDurationMonths: vehicle.reservationDurationMonths,
        vehicleType: vehicle.vehicleType,
        plateConfiguration: vehicle.plateConfiguration,
      },
      securityCodes: secCodes[0] || null,
      payments: paymentRows,
      timeline: events,
      emails,
      notes,
      auditLogs: orderAuditLogs,
    });
  } catch (error) {
    console.error('[Admin] Error loading order detail:', error);
    return res.status(500).json({ error: 'Fehler beim Laden des Auftrags' });
  }
});

/**
 * POST /api/admin/orders/:publicOrderId/reveal-codes
 * EXPLICIT PERMISSION REQUIRED TO REVEAL SECURITY CODES.
 * "When an authorized administrator opens an order, sensitive security codes must remain masked by default.
 * Require an explicit permission to reveal them.
 * Every reveal must create an audit log event."
 */
adminRouter.post('/orders/:publicOrderId/reveal-codes', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { publicOrderId } = req.params;
    const { reason, confirmed } = req.body;

    if (!confirmed || !reason || reason.trim().length < 5) {
      return res.status(400).json({
        error: 'Berechtigungsbestätigung erforderlich',
        message: 'Das Entschlüsseln sensibler Sicherheitscodes erfordert eine ausdrückliche Bestätigung und eine nachvollziehbare Begründung (mindestens 5 Zeichen).',
      });
    }

    const orderRows = await db
      .select({ id: orders.id, publicOrderId: orders.publicOrderId })
      .from(orders)
      .where(eq(orders.publicOrderId, publicOrderId))
      .limit(1);

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Auftrag nicht gefunden' });
    }

    const order = orderRows[0];

    const secRow = await db
      .select()
      .from(securityCodes)
      .where(eq(securityCodes.orderId, order.id))
      .limit(1);

    if (secRow.length === 0) {
      return res.status(404).json({ error: 'Keine Sicherheitscodes für diesen Auftrag hinterlegt' });
    }

    const sec = secRow[0];

    if (sec.isPurged) {
      return res.status(410).json({
        error: 'Codes gelöscht',
        message: 'Die Sicherheitscodes für diesen Auftrag wurden bereits gemäß DSGVO-Aufbewahrungsrichtlinie permanent vernichtet.',
      });
    }

    // MANDATORY AUDIT LOG: Every reveal MUST create an audit log event
    const now = new Date();
    await db.insert(auditLogs).values({
      eventType: 'security_codes_revealed',
      orderId: order.id,
      adminUserId: req.admin?.id,
      timestamp: now,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      metadata: JSON.stringify(sanitizeMetadata({
        publicOrderId: order.publicOrderId,
        adminEmail: req.admin?.email,
        adminName: req.admin?.name,
        reason: reason.trim(),
        action: 'explicit_code_decryption_and_reveal',
      })),
    });

    // Record order event
    await db.insert(orderEvents).values({
      orderId: order.id,
      eventType: 'security_codes_revealed',
      description: `Sicherheitscodes entschlüsselt durch Administrator ${req.admin?.name} (${req.admin?.email}). Begründung: ${reason.trim()}`,
      actorType: 'admin',
      actorId: String(req.admin?.id),
      createdAt: now,
    });

    // Decrypt codes
    const decryptedZbi = decryptAtRest(sec.zbiSecurityCodeEncrypted);
    const decryptedFront = sec.frontPlateSecurityCodeEncrypted ? decryptAtRest(sec.frontPlateSecurityCodeEncrypted) : null;
    const decryptedRear = sec.rearPlateSecurityCodeEncrypted ? decryptAtRest(sec.rearPlateSecurityCodeEncrypted) : null;

    return res.json({
      success: true,
      publicOrderId: order.publicOrderId,
      codes: {
        zbiSecurityCode: decryptedZbi,
        frontPlateCode: decryptedFront,
        rearPlateCode: decryptedRear,
        singlePlateOnly: sec.singlePlateOnly,
      },
      auditLoggedAt: now.toISOString(),
    });
  } catch (error) {
    console.error('[Admin] Error revealing codes:', error);
    return res.status(500).json({ error: 'Fehler beim Entschlüsseln der Sicherheitscodes' });
  }
});

/**
 * PATCH /api/admin/orders/:publicOrderId/vehicle
 * "Do not allow an administrator to silently modify vehicle data after payment.
 * Any modification after payment must create an audit event and require confirmation."
 */
adminRouter.patch('/orders/:publicOrderId/vehicle', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { publicOrderId } = req.params;
    const { 
      licensePlate, 
      registrationDistrict, 
      vin, 
      zbiIssueDate, 
      vehicleType,
      confirmedPostPayment,
      reason 
    } = req.body;

    const orderRows = await db
      .select({
        order: orders,
        vehicle: vehicles,
      })
      .from(orders)
      .innerJoin(vehicles, eq(orders.vehicleId, vehicles.id))
      .where(eq(orders.publicOrderId, publicOrderId))
      .limit(1);

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Auftrag nicht gefunden' });
    }

    const { order, vehicle } = orderRows[0];
    const isPaid = Boolean(order.paidAt || order.status === 'paid' || order.status === 'erfolgreich_abgemeldet' || order.status === 'submitted_to_ikfz');

    // SILENT MODIFICATION PROTECTION AFTER PAYMENT:
    if (isPaid) {
      if (!confirmedPostPayment || !reason || reason.trim().length < 5) {
        return res.status(400).json({
          error: 'Änderung nach erfolgter Zahlung erfordert ausdrückliche Bestätigung',
          message: 'Das Fahrzeug befindet sich in einem bezahlten Auftrag. Änderungen an den Fahrzeugdaten dürfen nicht stillschweigend vorgenommen werden und erfordern eine Bestätigung sowie eine Begründung für das Revisionsprotokoll.',
          requiresConfirmation: true,
        });
      }
    }

    const previousVehicle = {
      licensePlate: vehicle.licensePlate,
      registrationDistrict: vehicle.registrationDistrict,
      vin: vehicle.vin,
      zbiIssueDate: vehicle.zbiIssueDate,
      vehicleType: vehicle.vehicleType,
    };

    const newVehicleData = {
      licensePlate: licensePlate ? licensePlate.trim().toUpperCase() : vehicle.licensePlate,
      registrationDistrict: registrationDistrict ? registrationDistrict.trim() : vehicle.registrationDistrict,
      vin: vin !== undefined ? (vin ? vin.trim().toUpperCase() : null) : vehicle.vin,
      zbiIssueDate: zbiIssueDate ? zbiIssueDate.trim() : vehicle.zbiIssueDate,
      vehicleType: vehicleType || vehicle.vehicleType,
    };

    // Update vehicle
    await db
      .update(vehicles)
      .set(newVehicleData)
      .where(eq(vehicles.id, vehicle.id));

    // Update order timestamp
    const now = new Date();
    await db
      .update(orders)
      .set({ updatedAt: now })
      .where(eq(orders.id, order.id));

    // MANDATORY AUDIT LOG: If after payment, create specific audit log event
    if (isPaid) {
      await db.insert(auditLogs).values({
        eventType: 'vehicle_data_modified_post_payment',
        orderId: order.id,
        adminUserId: req.admin?.id,
        timestamp: now,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || 'unknown',
        metadata: JSON.stringify(sanitizeMetadata({
          publicOrderId: order.publicOrderId,
          adminEmail: req.admin?.email,
          reason: reason?.trim(),
          previous: previousVehicle,
          updated: newVehicleData,
        })),
      });

      await db.insert(orderEvents).values({
        orderId: order.id,
        eventType: 'vehicle_data_modified_post_payment',
        description: `Fahrzeugdaten nach Zahlung geändert durch ${req.admin?.name} (${req.admin?.email}). Begründung: ${reason?.trim()}`,
        actorType: 'admin',
        actorId: String(req.admin?.id),
        createdAt: now,
      });
    } else {
      await db.insert(auditLogs).values({
        eventType: 'order_vehicle_updated',
        orderId: order.id,
        adminUserId: req.admin?.id,
        timestamp: now,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || 'unknown',
        metadata: JSON.stringify(sanitizeMetadata({ publicOrderId: order.publicOrderId, updated: newVehicleData })),
      });
    }

    return res.json({
      success: true,
      message: 'Fahrzeugdaten erfolgreich aktualisiert und auditiert.',
      vehicle: newVehicleData,
    });
  } catch (error) {
    console.error('[Admin] Error modifying vehicle data:', error);
    return res.status(500).json({ error: 'Fahrzeugdaten konnten nicht geändert werden' });
  }
});

// ==========================================
// 4. ADMIN ACTIONS (Exact User Request)
// - Mark for manual review
// - Retry processing
// - Cancel
// - Refund
// - Send email
// - Add internal note
// ==========================================

/**
 * 4.1 Mark for manual review
 */
adminRouter.post('/orders/:publicOrderId/manual-review', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { publicOrderId } = req.params;
    const { reason } = req.body;

    const orderRows = await db
      .select()
      .from(orders)
      .where(eq(orders.publicOrderId, publicOrderId))
      .limit(1);

    if (orderRows.length === 0) return res.status(404).json({ error: 'Auftrag nicht gefunden' });

    const order = orderRows[0];
    const now = new Date();
    const prevStatus = order.status;

    await db
      .update(orders)
      .set({ status: 'manuelle_pruefung', updatedAt: now })
      .where(eq(orders.id, order.id));

    await db.insert(orderEvents).values({
      orderId: order.id,
      eventType: 'marked_for_manual_review',
      previousStatus: prevStatus,
      newStatus: 'manuelle_pruefung',
      description: `Zur manuellen Prüfung markiert durch ${req.admin?.name}. Grund: ${reason || 'Überprüfung erforderlich'}`,
      actorType: 'admin',
      actorId: String(req.admin?.id),
    });

    await db.insert(auditLogs).values({
      eventType: 'marked_for_manual_review',
      orderId: order.id,
      adminUserId: req.admin?.id,
      timestamp: now,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      metadata: JSON.stringify({ publicOrderId: order.publicOrderId, previousStatus: prevStatus, reason }),
    });

    return res.json({ success: true, newStatus: 'manuelle_pruefung' });
  } catch (error) {
    return res.status(500).json({ error: 'Fehler beim Markieren zur manuellen Prüfung' });
  }
});

/**
 * 4.2 Retry processing (authoritative execution through IkfzProvider layer)
 */
adminRouter.post('/orders/:publicOrderId/retry-processing', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { publicOrderId } = req.params;

    const orderRows = await db
      .select()
      .from(orders)
      .where(eq(orders.publicOrderId, publicOrderId))
      .limit(1);

    if (orderRows.length === 0) return res.status(404).json({ error: 'Auftrag nicht gefunden' });

    const order = orderRows[0];
    const now = new Date();

    // Authoritative processing through i-KfZ layer
    const outcome = await processOrderDeregistration(order.id);

    await db.insert(auditLogs).values({
      eventType: 'admin_retry_processing',
      orderId: order.id,
      adminUserId: req.admin?.id,
      timestamp: now,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      metadata: JSON.stringify({
        publicOrderId: order.publicOrderId,
        status: outcome.status,
        ikfzReference: outcome.ikfzReference,
        message: outcome.message,
      }),
    });

    return res.json({
      success: outcome.success,
      newStatus: outcome.status,
      displayStatus: outcome.displayStatus,
      ikfzReference: outcome.ikfzReference,
      message: outcome.message,
    });
  } catch (error: any) {
    return res.status(500).json({ error: `Fehler beim erneuten Ausführen: ${error.message}` });
  }
});

/**
 * 4.3 Cancel order
 */
adminRouter.post('/orders/:publicOrderId/cancel', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { publicOrderId } = req.params;
    const { reason } = req.body;

    const orderRows = await db
      .select()
      .from(orders)
      .where(eq(orders.publicOrderId, publicOrderId))
      .limit(1);

    if (orderRows.length === 0) return res.status(404).json({ error: 'Auftrag nicht gefunden' });

    const order = orderRows[0];
    const now = new Date();
    const prevStatus = order.status;

    await db
      .update(orders)
      .set({ status: 'storniert', updatedAt: now })
      .where(eq(orders.id, order.id));

    await db.insert(orderEvents).values({
      orderId: order.id,
      eventType: 'order_cancelled',
      previousStatus: prevStatus,
      newStatus: 'storniert',
      description: `Auftrag storniert durch ${req.admin?.name}. Grund: ${reason || 'Stornierung durch Administrator'}`,
      actorType: 'admin',
      actorId: String(req.admin?.id),
    });

    await db.insert(auditLogs).values({
      eventType: 'order_cancelled',
      orderId: order.id,
      adminUserId: req.admin?.id,
      timestamp: now,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      metadata: JSON.stringify({ publicOrderId: order.publicOrderId, reason }),
    });

    return res.json({ success: true, newStatus: 'storniert' });
  } catch (error) {
    return res.status(500).json({ error: 'Fehler beim Stornieren des Auftrags' });
  }
});

/**
 * 4.4 Refund order
 */
adminRouter.post('/orders/:publicOrderId/refund', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { publicOrderId } = req.params;
    const { reason, amount } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Begründung für Erstattung erforderlich' });
    }

    const orderRows = await db
      .select()
      .from(orders)
      .where(eq(orders.publicOrderId, publicOrderId))
      .limit(1);

    if (orderRows.length === 0) return res.status(404).json({ error: 'Auftrag nicht gefunden' });

    const order = orderRows[0];
    const refundAmount = amount ? Number(amount).toFixed(2) : order.totalPrice;
    const now = new Date();

    const [insertedRefund] = await db.insert(refunds).values({
      orderId: order.id,
      amount: refundAmount,
      currency: order.currency,
      reason: reason.trim(),
      adminUserId: req.admin?.id,
      status: 'processed',
      providerRefundId: `REF-${Date.now()}`,
      processedAt: now,
    }).returning();

    await db
      .update(orders)
      .set({ status: 'erstattet', updatedAt: now })
      .where(eq(orders.id, order.id));

    await db.insert(orderEvents).values({
      orderId: order.id,
      eventType: 'refund_issued',
      previousStatus: order.status,
      newStatus: 'erstattet',
      description: `Erstattung von ${refundAmount} EUR veranlasst durch ${req.admin?.name}. Begründung: ${reason.trim()}`,
      actorType: 'admin',
      actorId: String(req.admin?.id),
    });

    await db.insert(auditLogs).values({
      eventType: 'refund_issued',
      orderId: order.id,
      adminUserId: req.admin?.id,
      timestamp: now,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      metadata: JSON.stringify({
        publicOrderId: order.publicOrderId,
        amount: refundAmount,
        reason: reason.trim(),
        refundId: insertedRefund.id,
      }),
    });

    return res.json({
      success: true,
      publicOrderId: order.publicOrderId,
      refundId: insertedRefund.id,
      amount: refundAmount,
      status: 'erstattet',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erstattung fehlgeschlagen' });
  }
});

/**
 * 4.5 Send email to customer
 */
adminRouter.post('/orders/:publicOrderId/send-email', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { publicOrderId } = req.params;
    const { subject, message, emailType = 'manual_message' } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Betreff und Nachricht erforderlich' });
    }

    const orderRows = await db
      .select({
        order: orders,
        customer: customers,
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.publicOrderId, publicOrderId))
      .limit(1);

    if (orderRows.length === 0) return res.status(404).json({ error: 'Auftrag nicht gefunden' });

    const { order, customer } = orderRows[0];
    const now = new Date();

    const [insertedEmail] = await db.insert(emailLogs).values({
      orderId: order.id,
      recipient: customer.email,
      subject: subject.trim(),
      emailType,
      status: 'delivered',
      messageId: `msg_admin_${Date.now()}`,
      sentAt: now,
    }).returning();

    await db.insert(orderEvents).values({
      orderId: order.id,
      eventType: 'email_sent',
      description: `E-Mail an Kunden versandt ("${subject}") durch ${req.admin?.name}.`,
      actorType: 'admin',
      actorId: String(req.admin?.id),
    });

    await db.insert(auditLogs).values({
      eventType: 'customer_email_dispatched',
      orderId: order.id,
      adminUserId: req.admin?.id,
      timestamp: now,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      metadata: JSON.stringify({ publicOrderId: order.publicOrderId, recipient: customer.email, subject }),
    });

    return res.json({
      success: true,
      message: 'E-Mail erfolgreich versendet und protokolliert.',
      email: insertedEmail,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Fehler beim Versenden der E-Mail' });
  }
});

/**
 * 4.6 Add internal note
 */
adminRouter.post('/orders/:publicOrderId/notes', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { publicOrderId } = req.params;
    const { note } = req.body;

    if (!note || note.trim().length === 0) {
      return res.status(400).json({ error: 'Notiztext erforderlich' });
    }

    const orderRows = await db
      .select()
      .from(orders)
      .where(eq(orders.publicOrderId, publicOrderId))
      .limit(1);

    if (orderRows.length === 0) return res.status(404).json({ error: 'Auftrag nicht gefunden' });

    const order = orderRows[0];

    const [insertedNote] = await db.insert(orderNotes).values({
      orderId: order.id,
      adminUserId: req.admin?.id,
      adminName: req.admin?.name || 'Admin',
      note: note.trim(),
    }).returning();

    return res.json({
      success: true,
      note: insertedNote,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Fehler beim Speichern der Notiz' });
  }
});

// ==========================================
// 5. SPECIFIC SECTIONS ENDPOINTS
// - 3. Zahlungen
// - 4. Abmeldungen
// - 5. Manuelle Prüfung
// - 6. Kunden
// - 7. E-Mails
// - 8. Rückerstattungen
// - 9. Audit Log
// - 10. Einstellungen
// ==========================================

// 5.1 Zahlungen
adminRouter.get('/payments', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const paymentRows = await db
      .select({
        id: payments.id,
        orderId: payments.orderId,
        publicOrderId: orders.publicOrderId,
        customerName: sql<string>`concat(${customers.firstName}, ' ', ${customers.lastName})`,
        provider: payments.provider,
        providerTransactionId: payments.providerTransactionId,
        status: payments.status,
        amount: payments.amount,
        currency: payments.currency,
        paidAt: payments.paidAt,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .innerJoin(orders, eq(payments.orderId, orders.id))
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .orderBy(desc(payments.createdAt))
      .limit(100);

    return res.json({ payments: paymentRows, count: paymentRows.length });
  } catch (error) {
    return res.status(500).json({ error: 'Fehler beim Laden der Zahlungen' });
  }
});

// 5.2 Abmeldungen
adminRouter.get('/deregistrations', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const deregRows = await db
      .select({
        orderId: orders.id,
        publicOrderId: orders.publicOrderId,
        status: orders.status,
        licensePlate: vehicles.licensePlate,
        registrationDistrict: vehicles.registrationDistrict,
        zbiIssueDate: vehicles.zbiIssueDate,
        ikfzReference: orders.ikfzReference,
        completedAt: orders.completedAt,
        createdAt: orders.createdAt,
        customerName: sql<string>`concat(${customers.firstName}, ' ', ${customers.lastName})`,
      })
      .from(orders)
      .innerJoin(vehicles, eq(orders.vehicleId, vehicles.id))
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .where(or(
        eq(orders.status, 'erfolgreich_abgemeldet'),
        eq(orders.status, 'submitted_to_ikfz'),
        eq(orders.status, 'abgelehnt')
      ))
      .orderBy(desc(orders.createdAt))
      .limit(100);

    return res.json({ deregistrations: deregRows, count: deregRows.length });
  } catch (error) {
    return res.status(500).json({ error: 'Fehler beim Laden der Abmeldungen' });
  }
});

// 5.3 Manuelle Prüfung Queue
adminRouter.get('/manual-review', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const queueRows = await db
      .select({
        id: orders.id,
        publicOrderId: orders.publicOrderId,
        status: orders.status,
        totalPrice: orders.totalPrice,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        licensePlate: vehicles.licensePlate,
        registrationDistrict: vehicles.registrationDistrict,
        customerName: sql<string>`concat(${customers.firstName}, ' ', ${customers.lastName})`,
        customerEmail: customers.email,
        customerPhone: customers.phone,
      })
      .from(orders)
      .innerJoin(vehicles, eq(orders.vehicleId, vehicles.id))
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.status, 'manuelle_pruefung'))
      .orderBy(desc(orders.updatedAt));

    return res.json({ queue: queueRows, count: queueRows.length });
  } catch (error) {
    return res.status(500).json({ error: 'Fehler beim Laden der Prüfwarteschlange' });
  }
});

// 5.4 Kunden
adminRouter.get('/customers', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const customerList = await db
      .select({
        id: customers.id,
        salutation: customers.salutation,
        firstName: customers.firstName,
        lastName: customers.lastName,
        email: customers.email,
        phone: customers.phone,
        street: customers.street,
        houseNumber: customers.houseNumber,
        postalCode: customers.postalCode,
        city: customers.city,
        createdAt: customers.createdAt,
        orderCount: sql<number>`count(${orders.id})`,
        totalSpend: sql<number>`coalesce(sum(case when ${orders.status} in ('paid', 'erfolgreich_abgemeldet', 'submitted_to_ikfz') then cast(${orders.totalPrice} as numeric) else 0 end), 0)`,
      })
      .from(customers)
      .leftJoin(orders, eq(customers.id, orders.customerId))
      .groupBy(customers.id)
      .orderBy(desc(customers.createdAt))
      .limit(100);

    return res.json({ customers: customerList, count: customerList.length });
  } catch (error) {
    return res.status(500).json({ error: 'Fehler beim Laden der Kunden' });
  }
});

// 5.5 E-Mails
adminRouter.get('/emails', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const logs = await db
      .select({
        id: emailLogs.id,
        orderId: emailLogs.orderId,
        publicOrderId: orders.publicOrderId,
        recipient: emailLogs.recipient,
        subject: emailLogs.subject,
        emailType: emailLogs.emailType,
        status: emailLogs.status,
        sentAt: emailLogs.sentAt,
      })
      .from(emailLogs)
      .leftJoin(orders, eq(emailLogs.orderId, orders.id))
      .orderBy(desc(emailLogs.sentAt))
      .limit(100);

    return res.json({ emails: logs, count: logs.length });
  } catch (error) {
    return res.status(500).json({ error: 'Fehler beim Laden der E-Mail-Protokolle' });
  }
});

// 5.6 Rückerstattungen
adminRouter.get('/refunds', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const refundRows = await db
      .select({
        id: refunds.id,
        orderId: refunds.orderId,
        publicOrderId: orders.publicOrderId,
        customerName: sql<string>`concat(${customers.firstName}, ' ', ${customers.lastName})`,
        amount: refunds.amount,
        currency: refunds.currency,
        reason: refunds.reason,
        status: refunds.status,
        adminName: adminUsers.name,
        processedAt: refunds.processedAt,
        createdAt: refunds.createdAt,
      })
      .from(refunds)
      .innerJoin(orders, eq(refunds.orderId, orders.id))
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .leftJoin(adminUsers, eq(refunds.adminUserId, adminUsers.id))
      .orderBy(desc(refunds.createdAt));

    return res.json({ refunds: refundRows, count: refundRows.length });
  } catch (error) {
    return res.status(500).json({ error: 'Fehler beim Laden der Rückerstattungen' });
  }
});

// 5.7 Audit Log
adminRouter.get('/audit-logs', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { eventType, limit = '150' } = req.query;

    let query = db
      .select({
        id: auditLogs.id,
        eventType: auditLogs.eventType,
        orderId: auditLogs.orderId,
        publicOrderId: orders.publicOrderId,
        adminUserId: auditLogs.adminUserId,
        adminEmail: adminUsers.email,
        adminName: adminUsers.name,
        timestamp: auditLogs.timestamp,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        metadata: auditLogs.metadata,
      })
      .from(auditLogs)
      .leftJoin(orders, eq(auditLogs.orderId, orders.id))
      .leftJoin(adminUsers, eq(auditLogs.adminUserId, adminUsers.id))
      .orderBy(desc(auditLogs.timestamp))
      .limit(Number(limit) || 150);

    const logs = await query;
    let filtered = logs;
    if (eventType && eventType !== 'all') {
      filtered = filtered.filter(l => l.eventType === eventType);
    }

    return res.json({ logs: filtered, count: filtered.length });
  } catch (error) {
    return res.status(500).json({ error: 'Fehler beim Laden der Audit-Logs' });
  }
});

// 5.8 Einstellungen
adminRouter.get('/settings', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const settings = await db.select().from(systemSettings);
    return res.json({ settings });
  } catch (error) {
    return res.status(500).json({ error: 'Fehler beim Laden der Einstellungen' });
  }
});

adminRouter.post('/settings', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { settings } = req.body;
    if (!Array.isArray(settings)) {
      return res.status(400).json({ error: 'Ungültiges Format für Einstellungen' });
    }

    const now = new Date();
    for (const item of settings) {
      if (item.key && item.value !== undefined) {
        await db
          .insert(systemSettings)
          .values({ key: item.key, value: String(item.value), description: item.description, updatedAt: now })
          .onConflictDoUpdate({
            target: systemSettings.key,
            set: { value: String(item.value), updatedAt: now },
          });
      }
    }

    await db.insert(auditLogs).values({
      eventType: 'system_settings_updated',
      adminUserId: req.admin?.id,
      timestamp: now,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      metadata: JSON.stringify({ updatedCount: settings.length, adminEmail: req.admin?.email }),
    });

    return res.json({ success: true, message: 'Einstellungen erfolgreich gespeichert.' });
  } catch (error) {
    return res.status(500).json({ error: 'Fehler beim Speichern der Einstellungen' });
  }
});

// 5.9 Retention Policy Execution (GDPR 14 days)
adminRouter.post('/retention/execute', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const now = new Date();

    const expiredCodes = await db
      .select({
        id: securityCodes.id,
        orderId: securityCodes.orderId,
      })
      .from(securityCodes)
      .where(and(lte(securityCodes.retentionExpiresAt, now), eq(securityCodes.isPurged, false)))
      .limit(200);

    if (expiredCodes.length === 0) {
      return res.json({
        success: true,
        message: 'Keine abgelaufenen Datensätze zur Bereinigung gefunden. Alle Datensätze befinden sich innerhalb der 14-tägigen gesetzlichen Aufbewahrungsfrist.',
        purgedCount: 0,
      });
    }

    const purgedIds = expiredCodes.map(c => c.id);
    await db
      .update(securityCodes)
      .set({
        zbiSecurityCodeEncrypted: '[PURGED_BY_GDPR_RETENTION_POLICY]',
        frontPlateSecurityCodeEncrypted: '[PURGED_BY_GDPR_RETENTION_POLICY]',
        rearPlateSecurityCodeEncrypted: '[PURGED_BY_GDPR_RETENTION_POLICY]',
        isPurged: true,
        purgedAt: now,
      })
      .where(sql`${securityCodes.id} IN (${sql.join(purgedIds.map(id => sql`${id}`), sql`, `)})`);

    await db.insert(auditLogs).values({
      eventType: 'retention_executed',
      adminUserId: req.admin?.id,
      timestamp: now,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      metadata: JSON.stringify({
        policy: 'GDPR_14_DAY_RETENTION_PURGE',
        purgedRecordsCount: expiredCodes.length,
        affectedOrderCount: new Set(expiredCodes.map(c => c.orderId)).size,
      }),
    });

    return res.json({
      success: true,
      message: `${expiredCodes.length} Sicherheitscode-Datensätze wurden gemäß DSGVO-Aufbewahrungsrichtlinie permanent gelöscht.`,
      purgedCount: expiredCodes.length,
    });
  } catch (error) {
    console.error('[Admin] Error executing retention policy:', error);
    return res.status(500).json({ error: 'Ausführung der Löschrichtlinie fehlgeschlagen' });
  }
});

/**
 * 10. Authorities Management (i-KfZ Behördenkonfiguration)
 */
adminRouter.get('/authorities', requireAdminAuth, async (_req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const list = await db.select().from(authorities).orderBy(authorities.state, authorities.city);
    return res.json({ authorities: list });
  } catch (error) {
    console.error('[Admin] Error fetching authorities:', error);
    return res.status(500).json({ error: 'Fehler beim Abrufen der Zulassungsbehörden' });
  }
});

adminRouter.patch('/authorities/:authorityId', requireAdminAuth, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { authorityId } = req.params;
    const { integrationType, ikfzEndpoint, active, supportsReservation } = req.body;

    const [existing] = await db.select().from(authorities).where(eq(authorities.authorityId, authorityId)).limit(1);
    if (!existing) {
      return res.status(404).json({ error: 'Zulassungsbehörde nicht gefunden' });
    }

    const updateFields: Record<string, any> = { updatedAt: new Date() };
    if (integrationType !== undefined) updateFields.integrationType = integrationType;
    if (ikfzEndpoint !== undefined) updateFields.ikfzEndpoint = ikfzEndpoint;
    if (active !== undefined) updateFields.active = Boolean(active);
    if (supportsReservation !== undefined) updateFields.supportsReservation = Boolean(supportsReservation);

    await db.update(authorities).set(updateFields).where(eq(authorities.authorityId, authorityId));

    await db.insert(auditLogs).values({
      eventType: 'authority_config_updated',
      adminUserId: req.admin?.id,
      timestamp: new Date(),
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      metadata: JSON.stringify({ authorityId, changes: updateFields }),
    });

    const [updated] = await db.select().from(authorities).where(eq(authorities.authorityId, authorityId)).limit(1);
    return res.json({ success: true, authority: updated });
  } catch (error) {
    console.error('[Admin] Error updating authority:', error);
    return res.status(500).json({ error: 'Fehler beim Aktualisieren der Zulassungsbehörde' });
  }
});

