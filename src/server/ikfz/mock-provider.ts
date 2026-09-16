import {
  IkfzProvider,
  IkfzValidationRequest,
  IkfzValidationResult,
  IkfzSubmissionRequest,
  IkfzSubmissionResult,
  IkfzStatusResult,
  IkfzConfirmationResult,
  IkfzReservationRequest,
  IkfzReservationResult,
  IkfzFailureResult,
  AuthorityConfig,
} from './types.ts';
import { db } from '../../db/index.ts';
import { orderEvents, auditLogs } from '../../db/schema.ts';
import { sanitizeMetadata } from '../crypto.ts';

/**
 * MockIkfzProvider
 * Development and testing provider.
 * Implements strict format verification, edge-case simulation (FAIL, MANUAL, CONFIRMED),
 * and generates realistic test certificates.
 */
export class MockIkfzProvider implements IkfzProvider {
  readonly providerName = 'MockIkfzProvider (Entwicklungs- & Testumgebung)';
  readonly isMock = true;

  /**
   * Validate request structure before submission
   */
  async validateRequest(request: IkfzValidationRequest): Promise<IkfzValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. ZB I Security Code check (7 alphanumeric chars according to StVZO)
    const cleanZbi = (request.zbiSecurityCode || '').trim();
    if (!cleanZbi) {
      errors.push('ZB I Sicherheitscode fehlt.');
    } else if (cleanZbi.length !== 7) {
      errors.push(`ZB I Sicherheitscode muss exakt 7 Zeichen lang sein (aktuell: ${cleanZbi.length}).`);
    } else if (!/^[A-Za-z0-9]{7}$/.test(cleanZbi)) {
      errors.push('ZB I Sicherheitscode darf nur alphanumerische Zeichen enthalten.');
    }

    // 2. Front plate code check (3 alphanumeric chars)
    if (!request.singlePlateOnly) {
      const cleanFront = (request.frontPlateSecurityCode || '').trim();
      if (!cleanFront) {
        errors.push('Vorderer Stempelplaketten-Code fehlt.');
      } else if (cleanFront.length !== 3) {
        errors.push(`Vorderer Stempelplaketten-Code muss exakt 3 Zeichen lang sein (aktuell: ${cleanFront.length}).`);
      }
    }

    // 3. Rear plate code check (3 alphanumeric chars)
    const cleanRear = (request.rearPlateSecurityCode || '').trim();
    if (!cleanRear) {
      errors.push('Hinterer Stempelplaketten-Code fehlt.');
    } else if (cleanRear.length !== 3) {
      errors.push(`Hinterer Stempelplaketten-Code muss exakt 3 Zeichen lang sein (aktuell: ${cleanRear.length}).`);
    }

    // 4. Authority check
    if (!request.authority.active) {
      errors.push(`Die Zulassungsbehörde ${request.authority.name} ist derzeit inaktiv.`);
    }

    // 5. Check if plate triggers special review in test environment
    const isReviewTrigger = request.licensePlate.includes('REVIEW') || request.licensePlate.includes('PRUEF');
    if (isReviewTrigger) {
      warnings.push('Test-Modus: Kennzeichen erfordert manuelle Sachbearbeiter-Prüfung.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      requiresManualReview: isReviewTrigger,
    };
  }

  /**
   * Submit deregistration in mock/test mode
   */
  async submitDeregistration(request: IkfzSubmissionRequest): Promise<IkfzSubmissionResult> {
    // Check validation first
    const val = await this.validateRequest({
      licensePlate: request.licensePlate,
      vin: request.vin || undefined,
      zbiIssueDate: request.zbiIssueDate,
      zbiSecurityCode: request.zbiSecurityCode,
      frontPlateSecurityCode: request.frontPlateSecurityCode,
      rearPlateSecurityCode: request.rearPlateSecurityCode,
      singlePlateOnly: request.singlePlateOnly,
      authority: request.authority,
    });

    if (!val.isValid) {
      return {
        status: 'MANUAL_REVIEW',
        message: `Validierungsfehler: ${val.errors.join(', ')}`,
        authorityNotes: 'Code-Format ungültig, Überweisung an manuelle Prüfung.',
      };
    }

    // Test triggers for simulating different outcomes:
    const plateUpper = request.licensePlate.toUpperCase();

    // Rejection Simulation (e.g. test plate containing FAIL or REJECT)
    if (plateUpper.includes('FAIL') || plateUpper.includes('REJECT') || request.zbiSecurityCode === '0000000') {
      return {
        status: 'REJECTED',
        message: 'Ablehnung durch Zulassungsbehörde: Sicherheitscode im zentralen Fahrzeugregister (ZFZR) nicht verifizierbar.',
        authorityNotes: 'Ungültiger oder bereits entwerteter Sicherheitscode.',
      };
    }

    // Manual Review Simulation (e.g. test plate containing REVIEW or MANUELL)
    if (plateUpper.includes('REVIEW') || plateUpper.includes('MANUELL') || plateUpper.includes('PRUEF')) {
      return {
        status: 'MANUAL_REVIEW',
        message: 'Antrag wurde an die manuelle Prüfwarteschlange der Zulassungsstelle übergeben.',
        authorityNotes: 'Abweichung im ZB I Ausstellungsdatum festgestellt, benötigt Sachbearbeiter-Sichtung.',
      };
    }

    // Official Mock Confirmation (Authoritative simulation in test environment)
    const todayStr = new Date().toISOString().split('T')[0];
    const testReference = `IKFZ-TEST-AUTH-${Math.floor(1000000 + Math.random() * 9000000)}`;

    let reservationRef: string | null = null;
    if (request.reservationRequested) {
      reservationRef = `RES-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    // Create a mock official confirmation receipt
    const officialReceipt = JSON.stringify({
      authoritativeIssuer: request.authority.name,
      authorityId: request.authority.authorityId,
      referenceNumber: testReference,
      licensePlate: request.licensePlate,
      vin: request.vin || 'N/A',
      effectiveDate: todayStr,
      kbaNotificationStatus: 'TRANSMITTED',
      customsNotificationStatus: 'TRANSMITTED',
      reservationPin: request.reservationPin || null,
      securityCheckPassed: true,
      mode: 'MOCK_TEST_AUTHORITATIVE_CONFIRMATION',
    });

    return {
      status: 'CONFIRMED',
      ikfzReference: testReference,
      deRegistrationDate: todayStr,
      confirmationDocument: officialReceipt,
      reservationReference: reservationRef || undefined,
      officialFeeCaptured: 2.70,
      message: `Außerbetriebsetzung durch ${request.authority.name} autorisiert und bestätigt.`,
      authorityNotes: 'Prüfung der Rubbel-Sicherheitscodes und ZFZR-Abgleich positiv.',
      authoritativeRawResponse: {
        statusCode: 200,
        ikfzTransactionId: testReference,
        state: 'SUCCESS',
      },
    };
  }

  /**
   * Status query
   */
  async getStatus(transactionId: string, authority?: AuthorityConfig): Promise<IkfzStatusResult> {
    return {
      status: 'CONFIRMED',
      ikfzReference: transactionId,
      message: 'Vorgang im KBA-Zentralregister als außer Betrieb gesetzt geführt.',
      lastCheckedAt: new Date().toISOString(),
    };
  }

  /**
   * Confirmation retrieval
   */
  async getConfirmation(transactionId: string, authority?: AuthorityConfig): Promise<IkfzConfirmationResult> {
    const todayStr = new Date().toISOString().split('T')[0];
    return {
      isAvailable: true,
      ikfzReference: transactionId,
      deRegistrationDate: todayStr,
      filename: `Abmeldebescheinigung_${transactionId}.pdf`,
      mimeType: 'application/pdf',
      documentBase64: 'JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDw...', // Mock PDF header
      verificationUrl: `https://test.kba-online.de/verify/${transactionId}`,
    };
  }

  /**
   * Reserve license plate
   */
  async reserveLicensePlate(request: IkfzReservationRequest): Promise<IkfzReservationResult> {
    if (!request.authority.supportsReservation) {
      return {
        isReserved: false,
        message: `Behörde ${request.authority.name} unterstützt keine Online-Kennzeichenreservierung.`,
      };
    }

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + (request.durationMonths || 6));

    return {
      isReserved: true,
      reservationPin: request.pin || String(Math.floor(1000 + Math.random() * 9000)),
      expiresAt: expiryDate.toISOString().split('T')[0],
      reservationFee: 12.80,
      message: `Kennzeichen ${request.licensePlate} für ${request.customerName} bis ${expiryDate.toLocaleDateString('de-DE')} reserviert.`,
    };
  }

  /**
   * Handle failure
   */
  async handleFailure(orderId: number, error: Error | any): Promise<IkfzFailureResult> {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[MockIkfzProvider] Failure on order ${orderId}:`, errorMsg);

    try {
      await db.insert(auditLogs).values({
        eventType: 'ikfz_submission_failed',
        orderId,
        adminUserId: null,
        ipAddress: '127.0.0.1',
        userAgent: 'MockIkfzProvider/1.0',
        metadata: JSON.stringify(sanitizeMetadata({ error: errorMsg, provider: this.providerName })),
      });
    } catch {
      // ignore
    }

    return {
      orderStatus: 'manuelle_pruefung',
      reason: errorMsg,
      technicalDetails: 'Fehler in Mock-Verarbeitung erkannt, an manuelle Prüfung übergeben.',
      requiresManualIntervention: true,
      notifiedCustomer: false,
    };
  }
}
