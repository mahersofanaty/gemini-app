export type Language = 'de' | 'en' | 'ar';

export type CurrentScreen = 
  | 'home' 
  | 'wizard' 
  | 'order-status' 
  | 'faq' 
  | 'contact' 
  | 'impressum' 
  | 'datenschutz' 
  | 'agb' 
  | 'widerruf'
  | 'admin';

export type WizardStep = 
  | 'step1-fahrzeugdaten'
  | 'step2-sicherheitscode-zbi'
  | 'step3-stempelplaketten'
  | 'step4-kennzeichenreservierung'
  | 'step5-kundendaten'
  | 'step6-zusammenfassung'
  | 'payment' 
  | 'processing' 
  | 'success';

export type PlateConfiguration = 'standard_two' | 'single_rear' | 'seasonal' | 'electric' | 'historical';

export interface VehicleData {
  licensePlate: string; // Raw input (e.g. "D-AB 123", "ME-XY 1234", "b ab 123")
  licensePlateNormalized: string; // Clean normalized representation (e.g. "D-AB 123")
  licensePlateCity: string; // City identifier (e.g. "D", "ME", "B")
  licensePlateLetters: string; // Middle letters (e.g. "AB", "XY")
  licensePlateNumbers: string; // Number part (e.g. "123", "1234")
  licensePlateSuffix?: string; // Optional "E" or "H"
  
  vin: string; // 17 characters FIN/VIN (optional if not required for specific workflow)
  vinNotRequired: boolean; // Flag when user indicates VIN is not required or not at hand
  
  issueDateZBI: string; // Datum der Ausstellung der aktuellen Zulassungsbescheinigung Teil I (YYYY-MM-DD)
  registrationDistrict: string; // Zulassungsbezirk (e.g. "Düsseldorf", "Kreis Mettmann", "Berlin")
  
  plateConfiguration: PlateConfiguration;
  vehicleType: 'pkw' | 'lkw' | 'motorrad' | 'anhaenger' | 'sonstige';
}

export interface SecurityCodesData {
  zbISecurityCode: string; // Masked by default, never logged or stored in plain text
  zbISecurityCodeEncrypted?: string; // Client-side encrypted at rest
  validationRuleLength: 7 | 8; // Configurable validation rule (7 standard vs 8)
  
  // Stempelplaketten
  frontPlateCode: string; // Front plate seal code (for 2-plate vehicles)
  frontPlateCodeEncrypted?: string;
  rearPlateCode: string; // Rear plate seal code
  rearPlateCodeEncrypted?: string;
  singlePlateCode: string; // For single-plate vehicles (Motorrad, Anhänger)
  singlePlateCodeEncrypted?: string;
  
  confirmedLabelsScratched: boolean; // Obligatory warning confirmation
}

export interface CustomerData {
  salutation: 'herr' | 'frau' | 'divers' | 'firma';
  firstName: string;
  lastName: string;
  companyName?: string;
  email: string;
  phone: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
  ibanForTaxRefund?: string; // Optional for Hauptzollamt refund of excess motor vehicle tax
  reason?: 'sale' | 'scrapping' | 'temporary' | 'export' | 'other' | string;
}

export interface PlateReservationData {
  reservePlate: boolean; // Ja or Nein
  reservationPin?: string; // 4-digit PIN
  reservationDurationMonths: number; // 3, 6, or 12 months
}

export type PaymentMethod = 'paypal' | 'klarna' | 'sepa' | 'card' | 'apple_google_pay';

export interface OrderRecord {
  orderId: string;
  createdAt: string;
  status: 'eingegangen' | 'bezahlt' | 'submitted_to_ikfz' | 'erfolgreich_abgemeldet' | 'manuelle_pruefung' | 'abgelehnt' | 'storniert' | 'erstattet' | string;
  displayStatus?: string;
  authorityName?: string;
  statusMessage?: string;
  ikfzStatus?: string;
  vehicle: VehicleData;
  // Security codes are strictly masked in records/admin displays and encrypted at rest
  securityCodesMasked: {
    zbISecurityCodeMasked: string;
    frontPlateCodeMasked?: string;
    rearPlateCodeMasked?: string;
    singlePlateCodeMasked?: string;
  };
  securityCodesEncrypted?: string; // Encrypted sensitive payload at rest
  encryptedSecurityPayload?: string;
  customer: CustomerData;
  plateReservation: PlateReservationData;
  pricing: {
    serviceFee: number; // 19.90 €
    authorityFee: number; // 2.70 €
    reservationFee: number; // 0 or 12.80 €
    vatAmount: number; // included in service fee (19%)
    totalAmount: number;
  };
  dataConfirmationChecked: boolean; // "Ich bestätige, dass alle Angaben vollständig und korrekt sind."
  paymentMethod: PaymentMethod;
  deRegistrationTimestamp?: string;
  deRegistrationReference?: string;
  downloadToken?: string;
}
