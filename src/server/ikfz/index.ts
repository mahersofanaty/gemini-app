import { IkfzProvider, AuthorityConfig, IkfzAuthoritativeStatus } from './types.ts';
import { MockIkfzProvider } from './mock-provider.ts';
import { ProductionIkfzProvider } from './production-provider.ts';
import { determineAuthorityForDistrict, ensureDefaultAuthoritiesSeeded } from './authority-resolver.ts';
import { db } from '../../db/index.ts';
import { orders, vehicles, customers, securityCodes, orderEvents, emailLogs, auditLogs } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import { decryptAtRest, sanitizeMetadata } from '../crypto.ts';

export * from './types.ts';
export * from './mock-provider.ts';
export * from './production-provider.ts';
export * from './authority-resolver.ts';

// Singleton instances
const mockProviderInstance = new MockIkfzProvider();
const prodProviderInstance = new ProductionIkfzProvider();

/**
 * Returns the appropriate provider instance according to authority config & environment.
 */
export function getIkfzProvider(authority?: AuthorityConfig | null): IkfzProvider {
  // If explicitly configured for production API and in production mode:
  if (authority?.integrationType === 'production_api') {
    return prodProviderInstance;
  }
  // If global environment explicitly requests production:
  if (process.env.IKFZ_MODE === 'production') {
    return prodProviderInstance;
  }
  // Default to Mock provider for development and test scenarios
  return mockProviderInstance;
}

export interface DeregistrationProcessingOutcome {
  success: boolean;
  status: 'erfolgreich_abgemeldet' | 'submitted_to_ikfz' | 'manuelle_pruefung' | 'abgelehnt';
  ikfzReference: string | null;
  displayStatus: 'Erfolgreich abgemeldet' | 'Antrag wird geprüft' | 'Manuelle Prüfung erforderlich.';
  message: string;
  authorityName?: string;
}

/**
 * Authoritative Order Deregistration Orchestrator
 * Strictly complies with:
 * - Determine responsible authority based on vehicle registration district.
 * - If no supported integration exists: status = MANUAL_REVIEW.
 * - Never falsely tell the customer that the vehicle has been deregistered.
 * - Only display "Erfolgreich abgemeldet" when the authoritative system confirms the transaction.
 * - Otherwise display "Antrag wird geprüft" or "Manuelle Prüfung erforderlich."
 * - Store the official confirmation/reference number if supplied by the authority.
 * - Never fabricate confirmation numbers.
 */
export async function processOrderDeregistration(orderId: number): Promise<DeregistrationProcessingOutcome> {
  await ensureDefaultAuthoritiesSeeded();

  // 1. Fetch Order and related entities
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    throw new Error(`Auftrag ID ${orderId} nicht gefunden.`);
  }

  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, order.vehicleId)).limit(1);
  if (!vehicle) {
    throw new Error(`Fahrzeug zu Auftrag ${orderId} nicht gefunden.`);
  }

  const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId)).limit(1);
  if (!customer) {
    throw new Error(`Kunde zu Auftrag ${orderId} nicht gefunden.`);
  }

  const [codes] = await db.select().from(securityCodes).where(eq(securityCodes.orderId, order.id)).limit(1);
  if (!codes) {
    throw new Error(`Sicherheitscodes zu Auftrag ${orderId} nicht gefunden.`);
  }

  // 2. Determine responsible Zulassungsbehörde based on district and license plate
  const resolution = await determineAuthorityForDistrict(
    vehicle.registrationDistrict || vehicle.licensePlate,
    customer.postalCode
  );

  const now = new Date();

  // 3. Fallback: If no supported integration exists -> status = MANUAL_REVIEW
  if (!resolution.supported || !resolution.authority || resolution.requiresManualReview) {
    const reasonText = resolution.reason || 'Keine automatisierte behördliche i-KfZ Anbindung verfügbar. Vorgang an manuelle Prüfung übergeben.';

    await db
      .update(orders)
      .set({
        status: 'manuelle_pruefung',
        authorityId: resolution.authority?.authorityId || 'UNSUPPORTED',
        ikfzStatus: 'MANUAL_REVIEW',
        ikfzReference: null, // NEVER fabricate confirmation numbers!
        updatedAt: now,
      })
      .where(eq(orders.id, order.id));

    await db.insert(orderEvents).values({
      orderId: order.id,
      eventType: 'manual_review_required',
      previousStatus: order.status,
      newStatus: 'manuelle_pruefung',
      description: reasonText,
      actorType: 'system',
      metadata: JSON.stringify(sanitizeMetadata({
        district: vehicle.registrationDistrict,
        authorityId: resolution.authority?.authorityId || 'NONE',
        reason: reasonText,
      })),
    });

    return {
      success: false,
      status: 'manuelle_pruefung',
      ikfzReference: null,
      displayStatus: 'Manuelle Prüfung erforderlich.',
      message: reasonText,
      authorityName: resolution.authority?.name,
    };
  }

  const authority = resolution.authority;

  // 4. Select appropriate provider
  const provider = getIkfzProvider(authority);

  // 5. Decrypt sensitive codes strictly in isolated memory for submission
  const decryptedZbi = decryptAtRest(codes.zbiSecurityCodeEncrypted);
  const decryptedFront = codes.frontPlateSecurityCodeEncrypted ? decryptAtRest(codes.frontPlateSecurityCodeEncrypted) : null;
  const decryptedRear = codes.rearPlateSecurityCodeEncrypted ? decryptAtRest(codes.rearPlateSecurityCodeEncrypted) : null;
  const decryptedPin = vehicle.reservationPinEncrypted ? decryptAtRest(vehicle.reservationPinEncrypted) : null;

  // 6. Validate via provider
  const val = await provider.validateRequest({
    licensePlate: vehicle.licensePlate,
    vin: vehicle.vin || undefined,
    zbiIssueDate: vehicle.zbiIssueDate,
    zbiSecurityCode: decryptedZbi,
    frontPlateSecurityCode: decryptedFront,
    rearPlateSecurityCode: decryptedRear,
    singlePlateOnly: codes.singlePlateOnly,
    authority,
  });

  if (!val.isValid || val.requiresManualReview) {
    const errorMsg = val.errors.join('; ') || 'Sicherheitscodes erfordern Sichtprüfung.';

    await db
      .update(orders)
      .set({
        status: 'manuelle_pruefung',
        authorityId: authority.authorityId,
        ikfzStatus: 'MANUAL_REVIEW',
        ikfzReference: null,
        updatedAt: now,
      })
      .where(eq(orders.id, order.id));

    await db.insert(orderEvents).values({
      orderId: order.id,
      eventType: 'validation_failed_manual_review',
      previousStatus: order.status,
      newStatus: 'manuelle_pruefung',
      description: `Formatüberprüfung der Sicherheitscodes ergab Klärungsbedarf: ${errorMsg}`,
      actorType: 'system',
      metadata: JSON.stringify(sanitizeMetadata({ errors: val.errors, warnings: val.warnings })),
    });

    return {
      success: false,
      status: 'manuelle_pruefung',
      ikfzReference: null,
      displayStatus: 'Manuelle Prüfung erforderlich.',
      message: errorMsg,
      authorityName: authority.name,
    };
  }

  // 7. Submit deregistration to authoritative system
  try {
    const result = await provider.submitDeregistration({
      orderId: order.id,
      publicOrderId: order.publicOrderId,
      licensePlate: vehicle.licensePlate,
      vin: vehicle.vin,
      zbiIssueDate: vehicle.zbiIssueDate,
      zbiSecurityCode: decryptedZbi,
      frontPlateSecurityCode: decryptedFront,
      rearPlateSecurityCode: decryptedRear,
      singlePlateOnly: codes.singlePlateOnly,
      reservationRequested: vehicle.reservationRequested,
      reservationPin: decryptedPin,
      reservationDurationMonths: vehicle.reservationDurationMonths,
      authority,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerEmail: customer.email,
    });

    // 8. Handle Authoritative Outcome
    // RULE: Only display "Erfolgreich abgemeldet" when the authoritative system confirms the transaction!
    if (result.status === 'CONFIRMED' && result.ikfzReference) {
      await db
        .update(orders)
        .set({
          status: 'erfolgreich_abgemeldet',
          authorityId: authority.authorityId,
          ikfzStatus: 'CONFIRMED',
          ikfzReference: result.ikfzReference, // Official confirmation stored!
          deRegistrationDate: result.deRegistrationDate || now.toISOString().split('T')[0],
          ikfzOfficialDocument: result.confirmationDocument || null,
          completedAt: now,
          updatedAt: now,
        })
        .where(eq(orders.id, order.id));

      await db.insert(orderEvents).values({
        orderId: order.id,
        eventType: 'ikfz_confirmed',
        previousStatus: order.status,
        newStatus: 'erfolgreich_abgemeldet',
        description: `Außerbetriebsetzung durch ${authority.name} bestätigt. Amtliches Aktenzeichen: ${result.ikfzReference}`,
        actorType: 'system',
        metadata: JSON.stringify(sanitizeMetadata({
          reference: result.ikfzReference,
          authority: authority.name,
          date: result.deRegistrationDate,
        })),
      });

      // Dispatch official confirmation email log
      await db.insert(emailLogs).values({
        orderId: order.id,
        recipient: customer.email,
        subject: `Offizielle Abmeldebestätigung: Vorgang ${order.publicOrderId} (${result.ikfzReference})`,
        emailType: 'deregistration_notice',
        status: 'sent',
        messageId: `msg_${Date.now()}`,
      });

      return {
        success: true,
        status: 'erfolgreich_abgemeldet',
        ikfzReference: result.ikfzReference,
        displayStatus: 'Erfolgreich abgemeldet',
        message: result.message || 'Fahrzeug erfolgreich behördlich außer Betrieb gesetzt.',
        authorityName: authority.name,
      };
    } else if (result.status === 'PENDING') {
      await db
        .update(orders)
        .set({
          status: 'submitted_to_ikfz',
          authorityId: authority.authorityId,
          ikfzStatus: 'PENDING',
          ikfzReference: result.ikfzReference || null,
          updatedAt: now,
        })
        .where(eq(orders.id, order.id));

      await db.insert(orderEvents).values({
        orderId: order.id,
        eventType: 'ikfz_pending',
        previousStatus: order.status,
        newStatus: 'submitted_to_ikfz',
        description: `Antrag an ${authority.name} übermittelt. Wartet auf amtliche KBA-Bestätigung.`,
        actorType: 'system',
        metadata: JSON.stringify(sanitizeMetadata({ authority: authority.name })),
      });

      return {
        success: true,
        status: 'submitted_to_ikfz',
        ikfzReference: result.ikfzReference || null,
        displayStatus: 'Antrag wird geprüft',
        message: 'Der Antrag wurde erfolgreich eingereicht und wird aktuell von der Zulassungsstelle verarbeitet.',
        authorityName: authority.name,
      };
    } else if (result.status === 'REJECTED') {
      await db
        .update(orders)
        .set({
          status: 'abgelehnt',
          authorityId: authority.authorityId,
          ikfzStatus: 'REJECTED',
          ikfzReference: null,
          updatedAt: now,
        })
        .where(eq(orders.id, order.id));

      await db.insert(orderEvents).values({
        orderId: order.id,
        eventType: 'ikfz_rejected',
        previousStatus: order.status,
        newStatus: 'abgelehnt',
        description: `Antrag von Zulassungsstelle abgelehnt: ${result.message}`,
        actorType: 'system',
        metadata: JSON.stringify(sanitizeMetadata({ reason: result.message })),
      });

      return {
        success: false,
        status: 'abgelehnt',
        ikfzReference: null,
        displayStatus: 'Manuelle Prüfung erforderlich.',
        message: result.message || 'Antrag wurde von der Zulassungsstelle abgelehnt.',
        authorityName: authority.name,
      };
    } else {
      // MANUAL_REVIEW
      await db
        .update(orders)
        .set({
          status: 'manuelle_pruefung',
          authorityId: authority.authorityId,
          ikfzStatus: 'MANUAL_REVIEW',
          ikfzReference: null, // NEVER fabricate!
          updatedAt: now,
        })
        .where(eq(orders.id, order.id));

      await db.insert(orderEvents).values({
        orderId: order.id,
        eventType: 'ikfz_manual_review_queued',
        previousStatus: order.status,
        newStatus: 'manuelle_pruefung',
        description: result.authorityNotes || result.message || 'Vorgang erfordert manuelle Sachbearbeitung.',
        actorType: 'system',
        metadata: JSON.stringify(sanitizeMetadata({ reason: result.message })),
      });

      return {
        success: false,
        status: 'manuelle_pruefung',
        ikfzReference: null,
        displayStatus: 'Manuelle Prüfung erforderlich.',
        message: result.message || 'Manuelle Prüfung durch Sachbearbeiter erforderlich.',
        authorityName: authority.name,
      };
    }
  } catch (err: any) {
    console.error('[IkfzOrchestrator] Error during deregistration:', err);
    await provider.handleFailure(order.id, err);

    await db
      .update(orders)
      .set({
        status: 'manuelle_pruefung',
        ikfzStatus: 'MANUAL_REVIEW',
        ikfzReference: null,
        updatedAt: now,
      })
      .where(eq(orders.id, order.id));

    return {
      success: false,
      status: 'manuelle_pruefung',
      ikfzReference: null,
      displayStatus: 'Manuelle Prüfung erforderlich.',
      message: 'Systemstörung bei Behördenübermittlung. Antrag wurde gesichert und in die manuelle Prüfung übergeben.',
      authorityName: authority.name,
    };
  }
}
