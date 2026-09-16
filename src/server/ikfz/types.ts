/**
 * i-KfZ Integration Architecture Types
 * Strictly adhering to official e-Government & KBA (Kraftfahrt-Bundesamt) guidelines.
 */

export interface AuthorityConfig {
  id?: number;
  authorityId: string; // e.g. "DE-BY-MUC", "DE-BE-BER", "DE-NW-DUS"
  name: string; // e.g. "Kreisverwaltungsreferat München - Kraftfahrzeugzulassung"
  state: string; // e.g. "Bayern"
  city: string; // e.g. "München"
  postalCodes: string; // Comma-separated or JSON string of PLZ
  ikfzEndpoint?: string | null; // Documented official i-KfZ API endpoint
  integrationType: 'mock' | 'production_api' | 'portal_manual' | 'unsupported';
  active: boolean;
  districtCodes: string; // Comma-separated prefix, e.g. "M", "B", "D", "K", "HH"
  contactEmail?: string | null;
  contactPhone?: string | null;
  supportsReservation: boolean;
}

export interface IkfzValidationRequest {
  licensePlate: string;
  vin?: string;
  zbiIssueDate: string;
  zbiSecurityCode: string; // Decrypted within isolated provider layer only
  frontPlateSecurityCode?: string | null;
  rearPlateSecurityCode?: string | null;
  singlePlateOnly?: boolean;
  authority: AuthorityConfig;
}

export interface IkfzValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiresManualReview: boolean;
}

export interface IkfzSubmissionRequest {
  orderId: number;
  publicOrderId: string;
  licensePlate: string;
  vin?: string | null;
  zbiIssueDate: string;
  zbiSecurityCode: string; // Decrypted strictly in-memory during submission
  frontPlateSecurityCode?: string | null;
  rearPlateSecurityCode?: string | null;
  singlePlateOnly?: boolean;
  reservationRequested?: boolean;
  reservationPin?: string | null;
  reservationDurationMonths?: number | null;
  authority: AuthorityConfig;
  customerName: string;
  customerEmail: string;
}

export type IkfzAuthoritativeStatus = 
  | 'CONFIRMED'       // Authoritatively confirmed by the official agency
  | 'PENDING'         // Submitted, awaiting authoritative batch or manual verification
  | 'MANUAL_REVIEW'   // Requires human operator review (e.g. scratch code damage or no automated interface)
  | 'REJECTED';       // Explicitly rejected by the authoritative system

export interface IkfzSubmissionResult {
  status: IkfzAuthoritativeStatus;
  ikfzReference?: string | null; // ONLY present if authoritative system issued it!
  deRegistrationDate?: string | null;
  confirmationDocument?: string | null; // Official receipt / certificate if supplied
  reservationReference?: string | null;
  officialFeeCaptured?: number;
  message: string;
  authorityNotes?: string;
  authoritativeRawResponse?: Record<string, any>;
}

export interface IkfzStatusResult {
  status: IkfzAuthoritativeStatus;
  ikfzReference?: string | null;
  message: string;
  lastCheckedAt: string;
  estimatedCompletion?: string | null;
}

export interface IkfzConfirmationResult {
  isAvailable: boolean;
  ikfzReference?: string | null;
  deRegistrationDate?: string | null;
  documentBase64?: string | null;
  mimeType?: string;
  filename?: string;
  verificationUrl?: string | null;
}

export interface IkfzReservationRequest {
  licensePlate: string;
  durationMonths: number;
  pin?: string | null;
  authority: AuthorityConfig;
  customerName: string;
}

export interface IkfzReservationResult {
  isReserved: boolean;
  reservationPin?: string | null;
  expiresAt?: string | null;
  reservationFee?: number;
  message: string;
}

export interface IkfzFailureResult {
  orderStatus: 'manuelle_pruefung' | 'abgelehnt';
  reason: string;
  technicalDetails?: string;
  requiresManualIntervention: boolean;
  notifiedCustomer: boolean;
}

/**
 * Abstract i-KfZ Provider Interface
 * Every integration provider (Mock or Production) must implement this contract.
 */
export interface IkfzProvider {
  readonly providerName: string;
  readonly isMock: boolean;

  /**
   * Validates the vehicle, code syntax, and authority requirements.
   */
  validateRequest(request: IkfzValidationRequest): Promise<IkfzValidationResult>;

  /**
   * Submits the deregistration to the authoritative provider.
   * NEVER claims success unless authoritative confirmation is received.
   */
  submitDeregistration(request: IkfzSubmissionRequest): Promise<IkfzSubmissionResult>;

  /**
   * Queries the current status of an ongoing transaction from the authority.
   */
  getStatus(transactionId: string, authority?: AuthorityConfig): Promise<IkfzStatusResult>;

  /**
   * Retrieves official confirmation document / certificate from the authority.
   */
  getConfirmation(transactionId: string, authority?: AuthorityConfig): Promise<IkfzConfirmationResult>;

  /**
   * Reserves the license plate for the previous keeper if officially supported.
   */
  reserveLicensePlate(request: IkfzReservationRequest): Promise<IkfzReservationResult>;

  /**
   * Handles failure gracefully, writing audit logs and transitioning to manual review.
   */
  handleFailure(orderId: number, error: Error | any): Promise<IkfzFailureResult>;
}
