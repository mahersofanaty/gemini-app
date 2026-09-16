import { Language } from '../types';

export interface TranslationSet {
  // Navigation & General
  brandName: string;
  brandTagline: string;
  commercialDisclaimerBadge: string;
  commercialDisclaimerHeader: string;
  commercialDisclaimerDetail: string;
  navHome: string;
  navStart: string;
  navStatus: string;
  navFaq: string;
  navContact: string;
  languageSelect: string;

  // Buttons & Controls
  btnStartNow: string;
  btnContinue: string;
  btnBack: string;
  btnPayNow: string;
  btnDownloadCertificate: string;
  btnPrintConfirmation: string;
  btnCheckStatus: string;
  btnAutofillDemo: string;
  btnSupportHelp: string;

  // Price & Breakdown
  priceBreakdownTitle: string;
  priceServiceFeeLabel: string;
  priceServiceFeeDetail: string;
  priceAuthorityFeeLabel: string;
  priceAuthorityFeeDetail: string;
  priceReservationFeeLabel: string;
  priceTotalLabel: string;
  priceVatIncluded: string;
  priceGuaranteedSecure: string;

  // Landing Page
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroBadgeSpeed: string;
  heroBadgeNoWait: string;
  heroBadgeLegal: string;
  heroStepsTitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  prerequisitesTitle: string;
  prereq1: string;
  prereq2: string;
  prereq3: string;
  comparisonTitle: string;
  comparisonBureau: string;
  comparisonOurService: string;

  // Wizard Steps
  stepVehicleTitle: string;
  stepVehicleSubtitle: string;
  stepSecurityTitle: string;
  stepSecuritySubtitle: string;
  stepCustomerTitle: string;
  stepCustomerSubtitle: string;
  stepReservationTitle: string;
  stepReservationSubtitle: string;
  stepReviewTitle: string;
  stepReviewSubtitle: string;
  stepPaymentTitle: string;
  stepPaymentSubtitle: string;
  stepProcessingTitle: string;
  stepProcessingSubtitle: string;
  stepSuccessTitle: string;
  stepSuccessSubtitle: string;

  // Form Fields & Hints
  plateCityPlaceholder: string;
  plateLettersPlaceholder: string;
  plateNumbersPlaceholder: string;
  plateLabel: string;
  plateHint: string;
  vinLabel: string;
  vinPlaceholder: string;
  vinHint: string;
  issueDateLabel: string;
  issueDateHint: string;
  vehicleTypeLabel: string;
  
  zbICodeLabel: string;
  zbICodePlaceholder: string;
  zbICodeHint: string;
  frontPlateCodeLabel: string;
  frontPlateCodePlaceholder: string;
  frontPlateCodeHint: string;
  rearPlateCodeLabel: string;
  rearPlateCodePlaceholder: string;
  rearPlateCodeHint: string;
  labelsScratchedConfirmation: string;
  noCameraNotice: string;

  salutationLabel: string;
  salutationMr: string;
  salutationMs: string;
  salutationDiverse: string;
  salutationCompany: string;
  firstNameLabel: string;
  lastNameLabel: string;
  companyNameLabel: string;
  emailLabel: string;
  emailHint: string;
  phoneLabel: string;
  phoneHint: string;
  streetLabel: string;
  houseNoLabel: string;
  zipLabel: string;
  cityLabel: string;
  ibanLabel: string;
  ibanHint: string;
  reasonLabel: string;
  reasonSale: string;
  reasonScrap: string;
  reasonTemporary: string;
  reasonExport: string;
  reasonOther: string;

  reservationQuestion: string;
  reservationDesc: string;
  reservationDurationLabel: string;
  reservationMonths3: string;
  reservationMonths6: string;
  reservationMonths12: string;
  reservationPinLabel: string;
  reservationPinHint: string;

  // Legal Checkboxes
  termsConsentLabel: string;
  privacyConsentLabel: string;
  immediateExecutionConsentLabel: string;
  immediateExecutionConsentDetail: string;

  // Payment
  paymentSelectMethod: string;
  payPalDesc: string;
  klarnaDesc: string;
  sepaDesc: string;
  cardDesc: string;
  appleGooglePayDesc: string;
  encryptedPaymentNotice: string;

  // Status Check
  statusSearchTitle: string;
  statusSearchSubtitle: string;
  orderNumberLabel: string;
  statusFoundTitle: string;
  currentStatusLabel: string;

  // Footer & Disclaimers
  footerCommercialNotice: string;
  footerRights: string;
  legalImpressum: string;
  legalDatenschutz: string;
  legalAgb: string;
  legalWiderruf: string;
}

export const translations: Record<Language, TranslationSet> = {
  de: {
    brandName: 'KFZ Abmelden Online',
    brandTagline: 'Privater Dienst für die bequeme Fahrzeugabmeldung in Deutschland',
    commercialDisclaimerBadge: 'Privater Dienstleister',
    commercialDisclaimerHeader: 'Wichtiger rechtlicher Hinweis: Privater gewerblicher Dienst',
    commercialDisclaimerDetail: 'Wir sind kein amtliches Portal und keine staatliche Zulassungsbehörde. Als zugelassener gewerblicher Dienstleister übernehmen wir für Sie die digitale Abmeldung (Außerbetriebsetzung) Ihres Fahrzeugs über die behördliche i-KfZ-Schnittstelle. Hierfür berechnen wir ein Service-Entgelt von 19,90 € zzgl. behördlicher Gebühren.',
    navHome: 'Startseite',
    navStart: 'Online Abmelden',
    navStatus: 'Auftragsstatus',
    navFaq: 'Häufige Fragen (FAQ)',
    navContact: 'Hilfe & Kontakt',
    languageSelect: 'Sprache / Language',

    btnStartNow: 'Jetzt Fahrzeug abmelden',
    btnContinue: 'Weiter zur nächsten Seite',
    btnBack: 'Zurück',
    btnPayNow: 'Zahlungspflichtig bestellen & abmelden',
    btnDownloadCertificate: 'Offizielle Abmeldebescheinigung (PDF) herunterladen',
    btnPrintConfirmation: 'Bestätigung drucken',
    btnCheckStatus: 'Status abfragen',
    btnAutofillDemo: 'Beispieldaten ausfüllen (Test)',
    btnSupportHelp: 'Frage stellen',

    priceBreakdownTitle: 'Transparente Kostenübersicht',
    priceServiceFeeLabel: 'Unser Service-Entgelt (KFZ Abmelden Online)',
    priceServiceFeeDetail: 'Gewerblicher Bearbeitungsservice inkl. 19% MwSt. (3,18 €)',
    priceAuthorityFeeLabel: 'Amtliche Behördengebühr (i-KfZ GebOSt)',
    priceAuthorityFeeDetail: 'Wird 1:1 an die zuständige Zulassungsstelle weitergeleitet',
    priceReservationFeeLabel: 'Amtliche Kennzeichen-Reservierung',
    priceTotalLabel: 'Gesamtbetrag',
    priceVatIncluded: 'inkl. gesetzlicher Mehrwertsteuer',
    priceGuaranteedSecure: '256-Bit SSL-verschlüsselt · TÜV-geprüfter Datenschutzstandard',

    heroTitle: 'Fahrzeug online abmelden in 2 Minuten',
    heroHighlight: 'Ohne Behördengang. Ohne Wartezeit.',
    heroSubtitle: 'Bequeme Außerbetriebsetzung für Pkw, Motorräder und Anhänger. Unser privater Service übermittelt Ihre Abmeldedaten direkt an das Kraftfahrt-Bundesamt (KBA). Versicherung und Zollamt werden automatisch benachrichtigt.',
    heroBadgeSpeed: 'Sofortige Gültigkeit ab heute',
    heroBadgeNoWait: 'Kein Termin bei der Zulassungsstelle nötig',
    heroBadgeLegal: 'Offiziell gültiger digitaler Abmeldenachweis',
    heroStepsTitle: 'So einfach funktioniert die Online-Abmeldung',
    step1Title: '1. Fahrzeugdaten eingeben',
    step1Desc: 'Geben Sie Ihr Kennzeichen und die 17-stellige Fahrzeug-Identifizierungsnummer (FIN) aus dem Fahrzeugschein ein.',
    step2Title: '2. Sicherheitscodes freilegen',
    step2Desc: 'Rubbeln Sie den verdeckten 7-stelligen Code auf der Zulassungsbescheinigung Teil I sowie die Codes der Nummernschilder frei.',
    step3Title: '3. Kontaktdaten & Auftrag',
    step3Desc: 'Prüfen Sie alle Angaben und wählen Sie Ihre bevorzugte Zahlungsmethode.',
    step4Title: '4. Sofortiger Abmeldebescheid',
    step4Desc: 'Sie erhalten den behördlich anerkannten Abmeldenachweis sofort digital als PDF zum Download.',
    prerequisitesTitle: 'Voraussetzungen für die Online-Abmeldung',
    prereq1: 'Zulassung nach dem 01.01.2015: Ihr Fahrzeugschein (Zulassungsbescheinigung Teil I) besitzt ein verdecktes Sicherheits-Rubbelfeld.',
    prereq2: 'Neue Stempelplaketten: Auf den Kennzeichenschildern befinden sich Plaketten mit QR-Code und Sicherheitscode unter der Schutzschicht.',
    prereq3: 'Manuelle Dateneingabe: Halten Sie Fahrzeugschein und Kennzeichen griffbereit. Alle Daten werden aus Datenschutzgründen manuell eingetragen.',
    comparisonTitle: 'Bürgeramt vor Ort vs. Unser Online-Service',
    comparisonBureau: 'Klassische Zulassungsstelle: Terminwartezeit 2–6 Wochen, Anfahrtsweg, Parkplatzsuche, Wartezimmer, Warten auf Stempel.',
    comparisonOurService: 'Unser Online-Dienst: 24/7 erreichbar, in 2 Minuten erledigt, 19,90 € Service-Pauschale, sofortige Rechtsgültigkeit.',

    stepVehicleTitle: 'Schritt 1: Fahrzeugdaten erfassen',
    stepVehicleSubtitle: 'Tragen Sie Kennzeichen und Fahrzeug-Identifikationsnummer manuell ein',
    stepSecurityTitle: 'Schritt 2: Sicherheitscodes eingeben',
    stepSecuritySubtitle: 'Verdeckte Codes aus Fahrzeugschein und Nummernschild-Plaketten eintragen',
    stepCustomerTitle: 'Schritt 3: Halter- & Kontaktdaten',
    stepCustomerSubtitle: 'Ihre Adressdaten für den Zustellungsnachweis und Steuererstattung',
    stepReservationTitle: 'Schritt 4: Kennzeichenreservierung (Optional)',
    stepReservationSubtitle: 'Möchten Sie das Kennzeichen für ein Nachfolgefahrzeug reservieren?',
    stepReviewTitle: 'Schritt 5: Angaben überprüfen & Kosten',
    stepReviewSubtitle: 'Überprüfen Sie alle eingegebenen Daten vor der kostenpflichtigen Übermittlung',
    stepPaymentTitle: 'Schritt 6: Bezahlung',
    stepPaymentSubtitle: 'Wählen Sie Ihre gewünschte sichere Zahlungsmethode',
    stepProcessingTitle: 'Schritt 7: Automatische Übermittlung',
    stepProcessingSubtitle: 'Ihre Abmeldung wird über die i-KfZ-Behördenschnittstelle verarbeitet',
    stepSuccessTitle: 'Schritt 8: Fahrzeug erfolgreich abgemeldet!',
    stepSuccessSubtitle: 'Ihr digitaler Abmeldebescheid wurde erteilt und ist rechtsgültig',

    plateCityPlaceholder: 'B',
    plateLettersPlaceholder: 'MW',
    plateNumbersPlaceholder: '1234',
    plateLabel: 'Amtliches Kennzeichen',
    plateHint: 'z.B. B für Berlin, HH für Hamburg, M für München + Buchstaben & Ziffern',
    vinLabel: 'Fahrzeug-Identifizierungsnummer (FIN / Fahrgestellnummer)',
    vinPlaceholder: 'WBA3A51090F123456 (17 Zeichen)',
    vinHint: 'Exakt 17 Zeichen. Finden Sie im Fahrzeugschein (Zulassungsbescheinigung Teil I) im Feld (E).',
    issueDateLabel: 'Ausstellungsdatum der Zulassungsbescheinigung Teil I',
    issueDateHint: 'Muss nach dem 01.01.2015 liegen (Feld auf der Rückseite)',
    vehicleTypeLabel: 'Fahrzeugart',

    zbICodeLabel: 'Sicherheitscode Fahrzeugschein (Zulassungsbescheinigung Teil I)',
    zbICodePlaceholder: '7-stellig, z.B. A7B3X9K',
    zbICodeHint: 'Unter der grünen Rubbelfläche auf der Rückseite des Scheins. Bitte vorsichtig freirubbeln.',
    frontPlateCodeLabel: 'Sicherheitscode Stempelplakette Vorderes Kennzeichen',
    frontPlateCodePlaceholder: '3-stellig / alphanumerisch, z.B. 4X9',
    frontPlateCodeHint: 'Unter der abziehbaren Plakette des vorderen Kennzeichens.',
    rearPlateCodeLabel: 'Sicherheitscode Stempelplakette Hinteres Kennzeichen',
    rearPlateCodePlaceholder: '3-stellig / alphanumerisch, z.B. 8R2',
    rearPlateCodeHint: 'Unter der abziehbaren Plakette des hinteren Kennzeichens.',
    labelsScratchedConfirmation: 'Ich bestätige, dass ich die Siegelplaketten auf den Kennzeichenschildern sowie das Rubbelfeld auf der Zulassungsbescheinigung Teil I ordnungsgemäß freigelegt habe. Mir ist bewusst, dass die Kennzeichen damit entwertet sind.',
    noCameraNotice: 'Hinweis: Kein Foto-Upload erforderlich. Alle Codes werden sicher und direkt per Hand eingetragen.',

    salutationLabel: 'Anrede',
    salutationMr: 'Herr',
    salutationMs: 'Frau',
    salutationDiverse: 'Divers',
    salutationCompany: 'Firma',
    firstNameLabel: 'Vorname',
    lastNameLabel: 'Nachname',
    companyNameLabel: 'Firmenname',
    emailLabel: 'E-Mail-Adresse',
    emailHint: 'Hierhin wird Ihre offizielle Abmeldebescheinigung (PDF) gesendet.',
    phoneLabel: 'Telefonnummer (für Rückfragen)',
    phoneHint: 'Optional, nur bei behördlichen Rückfragen',
    streetLabel: 'Straße',
    houseNoLabel: 'Hausnummer',
    zipLabel: 'Postleitzahl',
    cityLabel: 'Wohnort',
    ibanLabel: 'IBAN für Erstattung der Kfz-Steuer (Optional)',
    ibanHint: 'Das Hauptzollamt erstattet zu viel gezahlte Kfz-Steuer automatisch auf dieses Konto.',
    reasonLabel: 'Grund der Außerbetriebsetzung',
    reasonSale: 'Verkauf des Fahrzeugs',
    reasonScrap: 'Verschrottung / Verwertung',
    reasonTemporary: 'Vorübergehende Stilllegung (z.B. Winterpause)',
    reasonExport: 'Ausfuhr / Export ins Ausland',
    reasonOther: 'Sonstiger Grund',

    reservationQuestion: 'Möchten Sie das Kennzeichen für spätere Wiederzulassung reservieren?',
    reservationDesc: 'Das Kennzeichen wird bei der Zulassungsstelle für Sie blockiert, sodass niemand anderes es übernehmen kann.',
    reservationDurationLabel: 'Reservierungsdauer',
    reservationMonths3: '3 Monate (+ 12,80 € inkl. Behördengebühr)',
    reservationMonths6: '6 Monate (+ 12,80 € inkl. Behördengebühr)',
    reservationMonths12: '12 Monate (+ 12,80 € inkl. Behördengebühr)',
    reservationPinLabel: 'Wunsch-PIN / Reservierungs-PIN',
    reservationPinHint: '4-stelliger Zahlencode, den Sie bei der späteren Neuzulassung angeben.',

    termsConsentLabel: 'Ich habe die Allgemeinen Geschäftsbedingungen (AGB) gelesen und erkläre mich mit deren Geltung einverstanden.',
    privacyConsentLabel: 'Ich stimme der Verarbeitung meiner personenbezogenen Daten und Fahrzeugdaten gemäß der Datenschutzerklärung zu.',
    immediateExecutionConsentLabel: 'Ausdrückliche Zustimmung zum vorzeitigen Beginn der Dienstleistung:',
    immediateExecutionConsentDetail: 'Ich verbuche ausdrücklich, dass Sie mit der Dienstleistung (Übermittlung der Außerbetriebsetzung an das KBA/i-KfZ) vor Ablauf der gesetzlichen Widerrufsfrist beginnen. Mir ist bekannt, dass mein Widerrufsrecht bei vollständiger Erbringung der Dienstleistung erlischt (§ 356 Abs. 4 BGB).',

    paymentSelectMethod: 'Zahlungsart wählen',
    payPalDesc: 'Schnell und sicher mit PayPal bezahlen',
    klarnaDesc: 'Sofortüberweisung über Ihr Online-Banking',
    sepaDesc: 'Bequeme SEPA-Lastschrift von deutschem Bankkonto',
    cardDesc: 'Visa, Mastercard oder Debitkarte',
    appleGooglePayDesc: 'Express-Checkout mit Wallet',
    encryptedPaymentNotice: 'Ihre Zahlungsdaten werden banküblich mit 256-Bit SSL verschlüsselt verarbeitet.',

    statusSearchTitle: 'Auftragsstatus abfragen',
    statusSearchSubtitle: 'Geben Sie Ihre Auftragsnummer oder FIN ein, um den aktuellen Bearbeitungsstand zu prüfen.',
    orderNumberLabel: 'Auftragsnummer (z.B. KFZ-2026-89412)',
    statusFoundTitle: 'Auftragsdetails gefunden',
    currentStatusLabel: 'Aktueller Bearbeitungsstatus',

    footerCommercialNotice: 'KFZ Abmelden Online ist ein privater kommerzieller Dienstleister. Wir stehen in keinem behördlichen Auftrag und handeln im Namen des Kunden zur digitalen Abwicklung bei der Zulassungsstelle.',
    footerRights: 'Alle Rechte vorbehalten.',
    legalImpressum: 'Impressum',
    legalDatenschutz: 'Datenschutz',
    legalAgb: 'AGB',
    legalWiderruf: 'Widerrufsbelehrung',
  },
  en: {
    brandName: 'KFZ Abmelden Online',
    brandTagline: 'Private commercial service for convenient vehicle deregistration in Germany',
    commercialDisclaimerBadge: 'Private Service Provider',
    commercialDisclaimerHeader: 'Important Legal Notice: Private Commercial Service',
    commercialDisclaimerDetail: 'We are not a government portal or official vehicle registration office. As a licensed commercial service provider, we process the digital deregistration (Außerbetriebsetzung) of your German vehicle on your behalf via the official i-KfZ gateway. We charge a service fee of €19.90 plus applicable government authority fees.',
    navHome: 'Home',
    navStart: 'Deregister Online',
    navStatus: 'Order Status',
    navFaq: 'FAQ',
    navContact: 'Help & Contact',
    languageSelect: 'Language',

    btnStartNow: 'Deregister Vehicle Now',
    btnContinue: 'Continue to Next Step',
    btnBack: 'Back',
    btnPayNow: 'Place Order & Deregister (€19.90 + Fees)',
    btnDownloadCertificate: 'Download Official Deregistration Certificate (PDF)',
    btnPrintConfirmation: 'Print Confirmation',
    btnCheckStatus: 'Check Status',
    btnAutofillDemo: 'Fill Sample Test Data',
    btnSupportHelp: 'Ask a Question',

    priceBreakdownTitle: 'Transparent Cost Breakdown',
    priceServiceFeeLabel: 'Our Service Fee (KFZ Abmelden Online)',
    priceServiceFeeDetail: 'Commercial processing service incl. 19% German VAT (€3.18)',
    priceAuthorityFeeLabel: 'Official Authority Fee (i-KfZ GebOSt)',
    priceAuthorityFeeDetail: 'Forwarded 1:1 to the responsible German registration authority',
    priceReservationFeeLabel: 'Official License Plate Reservation',
    priceTotalLabel: 'Total Amount',
    priceVatIncluded: 'includes statutory VAT',
    priceGuaranteedSecure: '256-Bit SSL Encrypted · High Security German Standards',

    heroTitle: 'Deregister Your German Vehicle in 2 Minutes',
    heroHighlight: 'No queues. No appointments at the registration office.',
    heroSubtitle: 'Convenient vehicle deregistration (Abmeldung) for cars, motorcycles, and trailers. Our private service submits your deregistration directly to the Kraftfahrt-Bundesamt (KBA). Insurance and customs tax authorities are notified automatically.',
    heroBadgeSpeed: 'Valid immediately from today',
    heroBadgeNoWait: 'No appointment needed at the registration office',
    heroBadgeLegal: 'Official legally recognized digital certificate',
    heroStepsTitle: 'How Online Deregistration Works',
    step1Title: '1. Enter Vehicle Details',
    step1Desc: 'Enter your German license plate and 17-digit Vehicle Identification Number (VIN/FIN).',
    step2Title: '2. Reveal Security Codes',
    step2Desc: 'Scratch off the concealed 7-digit code on Registration Certificate Part I and the plate stickers.',
    step3Title: '3. Contact & Order Review',
    step3Desc: 'Check your details and select your preferred secure payment method.',
    step4Title: '4. Instant Confirmation PDF',
    step4Desc: 'Receive the official government-recognized deregistration certificate immediately as a PDF download.',
    prerequisitesTitle: 'Requirements for Online Deregistration',
    prereq1: 'Registration after Jan 1, 2015: Your Zulassungsbescheinigung Teil I has a silver/green scratch-off security label.',
    prereq2: 'New plate seal badges: Your license plates have security badges with QR code and scratch field.',
    prereq3: 'Manual data entry: Keep your vehicle papers and plates ready. Data is entered manually for privacy and precision.',
    comparisonTitle: 'Registration Office in Person vs. Our Online Service',
    comparisonBureau: 'In-person office: Wait 2–6 weeks for an appointment, commute, parking, waiting room, manual stamping.',
    comparisonOurService: 'Our online service: Available 24/7, completed in 2 minutes, €19.90 service fee, instant legal validity.',

    stepVehicleTitle: 'Step 1: Vehicle Information',
    stepVehicleSubtitle: 'Enter license plate and 17-character VIN manually',
    stepSecurityTitle: 'Step 2: Security Codes',
    stepSecuritySubtitle: 'Enter the revealed codes from vehicle document and plate stickers',
    stepCustomerTitle: 'Step 3: Customer & Contact Details',
    stepCustomerSubtitle: 'Your address for delivery verification and vehicle tax refund',
    stepReservationTitle: 'Step 4: Plate Reservation (Optional)',
    stepReservationSubtitle: 'Would you like to reserve your license plate for your next car?',
    stepReviewTitle: 'Step 5: Review Order & Costs',
    stepReviewSubtitle: 'Review all entered data prior to binding order submission',
    stepPaymentTitle: 'Step 6: Secure Payment',
    stepPaymentSubtitle: 'Select your preferred payment method',
    stepProcessingTitle: 'Step 7: Automated Authority Transmission',
    stepProcessingSubtitle: 'Your deregistration is being communicated to the German i-KfZ gateway',
    stepSuccessTitle: 'Step 8: Vehicle Successfully Deregistered!',
    stepSuccessSubtitle: 'Your digital deregistration certificate has been issued and is legally binding',

    plateCityPlaceholder: 'B',
    plateLettersPlaceholder: 'MW',
    plateNumbersPlaceholder: '1234',
    plateLabel: 'Official License Plate (Amtliches Kennzeichen)',
    plateHint: 'e.g. B for Berlin, M for Munich, HH for Hamburg + letters & numbers',
    vinLabel: 'Vehicle Identification Number (VIN / FIN)',
    vinPlaceholder: 'WBA3A51090F123456 (17 characters)',
    vinHint: 'Exactly 17 characters. Found in Zulassungsbescheinigung Teil I in field (E).',
    issueDateLabel: 'Document Issue Date (Zulassungsbescheinigung Teil I)',
    issueDateHint: 'Must be issued after January 1, 2015 (back of the document)',
    vehicleTypeLabel: 'Vehicle Type',

    zbICodeLabel: 'Security Code from Vehicle Registration Certificate (Part I)',
    zbICodePlaceholder: '7-digit, e.g. A7B3X9K',
    zbICodeHint: 'Located under the green/silver scratch field on the back of the document. Gently scratch to reveal.',
    frontPlateCodeLabel: 'Security Code Front License Plate Badge',
    frontPlateCodePlaceholder: '3-digit / alphanumeric, e.g. 4X9',
    frontPlateCodeHint: 'Located under the seal sticker on your front license plate.',
    rearPlateCodeLabel: 'Security Code Rear License Plate Badge',
    rearPlateCodePlaceholder: '3-digit / alphanumeric, e.g. 8R2',
    rearPlateCodeHint: 'Located under the seal sticker on your rear license plate.',
    labelsScratchedConfirmation: 'I confirm that I have properly scratched off the seal stickers on both license plates and on the Zulassungsbescheinigung Teil I. I understand that the plates are invalidated.',
    noCameraNotice: 'Note: No camera or image upload required. All codes are entered manually and securely.',

    salutationLabel: 'Salutation',
    salutationMr: 'Mr.',
    salutationMs: 'Ms.',
    salutationDiverse: 'Diverse',
    salutationCompany: 'Company',
    firstNameLabel: 'First Name',
    lastNameLabel: 'Last Name',
    companyNameLabel: 'Company Name',
    emailLabel: 'Email Address',
    emailHint: 'Your official deregistration certificate (PDF) will be sent here.',
    phoneLabel: 'Phone Number (for queries)',
    phoneHint: 'Optional, used only in case of processing inquiries',
    streetLabel: 'Street',
    houseNoLabel: 'House No.',
    zipLabel: 'Postal Code',
    cityLabel: 'City',
    ibanLabel: 'IBAN for Vehicle Tax Refund (Optional)',
    ibanHint: 'German customs (Hauptzollamt) automatically refunds excess vehicle tax to this bank account.',
    reasonLabel: 'Reason for Deregistration',
    reasonSale: 'Vehicle sale',
    reasonScrap: 'Scrapping / disposal',
    reasonTemporary: 'Temporary pause (e.g. winter break)',
    reasonExport: 'Export abroad',
    reasonOther: 'Other reason',

    reservationQuestion: 'Would you like to reserve this license plate for future use?',
    reservationDesc: 'The license plate number will be reserved exclusively under your name at the registration office.',
    reservationDurationLabel: 'Reservation Duration',
    reservationMonths3: '3 Months (+ €12.80 incl. authority fee)',
    reservationMonths6: '6 Months (+ €12.80 incl. authority fee)',
    reservationMonths12: '12 Months (+ €12.80 incl. authority fee)',
    reservationPinLabel: 'Personal Reservation PIN',
    reservationPinHint: '4-digit code to provide when registering your next vehicle.',

    termsConsentLabel: 'I have read and agree to the General Terms and Conditions (AGB).',
    privacyConsentLabel: 'I agree to the processing of my personal and vehicle data in accordance with the Privacy Policy.',
    immediateExecutionConsentLabel: 'Explicit consent to immediate service performance:',
    immediateExecutionConsentDetail: 'I explicitly request and agree that you begin processing the vehicle deregistration before the statutory 14-day cancellation period expires. I understand that my right of withdrawal expires once the digital service has been completely fulfilled (§ 356 para. 4 German Civil Code BGB).',

    paymentSelectMethod: 'Select Payment Method',
    payPalDesc: 'Fast and secure payment with PayPal',
    klarnaDesc: 'Instant bank transfer via Klarna Sofort',
    sepaDesc: 'Direct debit from SEPA bank account',
    cardDesc: 'Visa, Mastercard or debit card',
    appleGooglePayDesc: 'Express checkout via digital wallet',
    encryptedPaymentNotice: 'Your payment information is protected by industry standard 256-bit SSL encryption.',

    statusSearchTitle: 'Check Order Status',
    statusSearchSubtitle: 'Enter your order reference or VIN to check processing status in real time.',
    orderNumberLabel: 'Order Number (e.g. KFZ-2026-89412)',
    statusFoundTitle: 'Order Details Found',
    currentStatusLabel: 'Current Processing Status',

    footerCommercialNotice: 'KFZ Abmelden Online is a private commercial service provider. We do not represent any government authority and act on behalf of customers for automated submission to the German vehicle registry.',
    footerRights: 'All rights reserved.',
    legalImpressum: 'Imprint / Legal Notice',
    legalDatenschutz: 'Privacy Policy',
    legalAgb: 'Terms of Service',
    legalWiderruf: 'Right of Withdrawal',
  },
  ar: {
    brandName: 'KFZ Abmelden Online',
    brandTagline: 'خدمة تجارية خاصة وموثوقة لإلغاء تسجيل المركبات في ألمانيا عبر الإنترنت',
    commercialDisclaimerBadge: 'مزود خدمة تجاري خاص',
    commercialDisclaimerHeader: 'إشعار قانوني مهم: مزود خدمة تجاري خاص وغير حكومي',
    commercialDisclaimerDetail: 'نحن لسنا موقعاً حكومياً أو هيئة ترخيص رسمية في ألمانيا. نحن شركة خدمة تجارية خاصة مرخصة نقوم بالنيابة عنك بإلغاء تسجيل مركبتك رقمياً عبر البوابة الرسمية (i-KfZ). مقابل هذه الخدمة نتقاضى رسوماً قدرها 19.90 يورو بالإضافة إلى الرسوم الرسمية للدوائر الحكومية.',
    navHome: 'الرئيسية',
    navStart: 'إلغاء التسجيل أونلاين',
    navStatus: 'حالة الطلب',
    navFaq: 'الأسئلة الشائعة',
    navContact: 'المساعدة والاتصال',
    languageSelect: 'اللغة / Language',

    btnStartNow: 'إلغاء تسجيل السيارة الآن',
    btnContinue: 'المتابعة للخطوة التالية',
    btnBack: 'رجوع',
    btnPayNow: 'تأكيد الطلب والدفع (19.90 يورو + الرسوم)',
    btnDownloadCertificate: 'تحميل شهادة إلغاء التسجيل الرسمية (PDF)',
    btnPrintConfirmation: 'طباعة الإيصال',
    btnCheckStatus: 'فحص حالة الطلب',
    btnAutofillDemo: 'تعبئة بيانات تجريبية',
    btnSupportHelp: 'طلب مساعدة',

    priceBreakdownTitle: 'تفاصيل التكاليف والرسوم بوضوح',
    priceServiceFeeLabel: 'رسوم خدمتنا (KFZ Abmelden Online)',
    priceServiceFeeDetail: 'رسوم معالجة تجارية شاملة 19% ضريبة القيمة المضافة (3.18 €)',
    priceAuthorityFeeLabel: 'الرسوم الرسمية لهيئة المرور (i-KfZ)',
    priceAuthorityFeeDetail: 'تُحول بالكامل لصالح مكتب تسجيل السيارات الألماني',
    priceReservationFeeLabel: 'رسوم حجز لوحة الأرقام الرسمية',
    priceTotalLabel: 'المبلغ الإجمالي',
    priceVatIncluded: 'شامل ضريبة القيمة المضافة',
    priceGuaranteedSecure: 'تشفير 256 بت SSL · معايير أمان وخصوصية بيانات ألمانية عالية',

    heroTitle: 'إلغاء تسجيل سيارتك في ألمانيا خلال دقيقتين',
    heroHighlight: 'دون الحاجة للذهاب إلى البلدية أو الانتظار لأسابيع',
    heroSubtitle: 'خدمة مريحة للسيارات والدراجات النارية والمقطورات. نقوم بتقديم بيانات الإلغاء مباشرة إلى الهيئة الاتحادية للسيارات (KBA). يتم إخطار التأمين ومكتب ضرائب السيارات تلقائياً.',
    heroBadgeSpeed: 'ساري المفعول فوراً من اليوم',
    heroBadgeNoWait: 'بدون حجز موعد في دائرة المرور (Zulassungsstelle)',
    heroBadgeLegal: 'شهادة رقمية رسمية ومعتمدة قانونياً',
    heroStepsTitle: 'خطوات إلغاء التسجيل عبر الإنترنت',
    step1Title: '1. إدخال بيانات المركبة',
    step1Desc: 'أدخل رقم اللوحة ورقم الشاسيه (FIN) المكون من 17 خانة من رخصة السيارة (Teil I).',
    step2Title: '2. كشف الرموز السرية',
    step2Desc: 'قشط الرمز السري ذي 7 خانات في رخصة السيارة ورموز ملصقات اللوحات.',
    step3Title: '3. بيانات التواصل ومراجعة الطلب',
    step3Desc: 'تأكد من صحة البيانات واختر طريقة الدفع المناسبة لك.',
    step4Title: '4. استلام شهادة الإلغاء فوراً',
    step4Desc: 'تحصل فوراً على شهادة إلغاء التسجيل الرسمية بصيغة PDF قابلة للتحميل.',
    prerequisitesTitle: 'شروط إلغاء التسجيل الإلكتروني',
    prereq1: 'تاريخ الترخيص بعد 01.01.2015: رخصة السيارة تحتوي على حقل كشط سري بالأمان.',
    prereq2: 'ملصقات لوحات حديثة: لوحات السيارة تحتوي على شفرة QR ورمز حماية تحت ملصق الختم.',
    prereq3: 'إدخال يدوي: جهز رخصة السيارة واللوحات. يتم إدخال كافة الرموز يدوياً حفاظاً على الدقة والخصوصية.',
    comparisonTitle: 'دائرة المرور التقليدية مقابل خدمتنا الإلكترونية',
    comparisonBureau: 'دائرة المرور التقليدية: انتظار موعد من 2 إلى 6 أسابيع، زحام مروري، انتظار في الصالة، ختم يدوي.',
    comparisonOurService: 'خدمتنا أونلاين: متوفرة على مدار الساعة 24/7، تكتمل في دقيقتين، 19.90 يورو فقط، سريان فوري.',

    stepVehicleTitle: 'الخطوة 1: بيانات المركبة',
    stepVehicleSubtitle: 'أدخل رقم اللوحة ورقم الشاسيه يدوياً',
    stepSecurityTitle: 'الخطوة 2: الرموز السرية',
    stepSecuritySubtitle: 'أدخل الرموز التي تم كشفها من رخصة السيارة وملصقات اللوحات',
    stepCustomerTitle: 'الخطوة 3: بيانات المالك والتواصل',
    stepCustomerSubtitle: 'عنوانك لإثبات الاستلام واسترداد ضريبة السيارات',
    stepReservationTitle: 'الخطوة 4: حجز لوحة الأرقام (اختياري)',
    stepReservationSubtitle: 'هل ترغب بحفظ لوحة الأرقام لسيارتك القادمة؟',
    stepReviewTitle: 'الخطوة 5: مراجعة البيانات والتكاليف',
    stepReviewSubtitle: 'يرجى مراجعة كافة البيانات قبل الإرسال الملزم',
    stepPaymentTitle: 'الخطوة 6: الدفع الآمن',
    stepPaymentSubtitle: 'اختر طريقة الدفع المناسبة لك',
    stepProcessingTitle: 'الخطوة 7: الإرسال الآلي للنظام الحكومي',
    stepProcessingSubtitle: 'يتم معالجة الطلب وإرساله عبر بوابة i-KfZ للجهات الرسمية',
    stepSuccessTitle: 'الخطوة 8: تم إلغاء تسجيل المركبة بنجاح!',
    stepSuccessSubtitle: 'تم إصدار شهادة الإلغاء الرقمية الرسمية وهي ملزمة قانونياً',

    plateCityPlaceholder: 'B',
    plateLettersPlaceholder: 'MW',
    plateNumbersPlaceholder: '1234',
    plateLabel: 'رقم اللوحة الرسمي (Amtliches Kennzeichen)',
    plateHint: 'مثال: B لبرلين، HH لهامبورغ، M لميونخ متبوعة بالأحرف والأرقام',
    vinLabel: 'رقم تعريف المركبة / الشاسيه (FIN / VIN)',
    vinPlaceholder: 'WBA3A51090F123456 (17 حرفاً ورقماً)',
    vinHint: '17 حرفاً بالضبط. موجود في رخصة السيارة (Teil I) بالحقل (E).',
    issueDateLabel: 'تاريخ إصدار رخصة السيارة (Teil I)',
    issueDateHint: 'يجب أن يكون بعد 01.01.2015 (مدون على ظهر الرخصة)',
    vehicleTypeLabel: 'نوع المركبة',

    zbICodeLabel: 'الرمز السري في رخصة السيارة (Teil I)',
    zbICodePlaceholder: '7 خانات، مثلاً A7B3X9K',
    zbICodeHint: 'يوجد تحت الطبقة الخضراء/الفضية القابلة للكشط على ظهر الرخصة.',
    frontPlateCodeLabel: 'الرمز السري لملصق اللوحة الأمامية',
    frontPlateCodePlaceholder: '3 خانات، مثلاً 4X9',
    frontPlateCodeHint: 'موجود أسفل ملصق ختم اللوحة الأمامية بعد إزالته.',
    rearPlateCodeLabel: 'الرمز السري لملصق اللوحة الخلفية',
    rearPlateCodePlaceholder: '3 خانات، مثلاً 8R2',
    rearPlateCodeHint: 'موجود أسفل ملصق ختم اللوحة الخلفية بعد إزالته.',
    labelsScratchedConfirmation: 'أقر بأنني قمت بكشط وإزالة ملصقات الأختام من اللوحات ومن رخصة السيارة وأعلم أن اللوحات تعتبر ملغاة رسمياً.',
    noCameraNotice: 'ملاحظة: لا يُطلب تحميل صور أو مسح كاميرا. يتم إدخال كافة البيانات والرموز يدوياً بأمان.',

    salutationLabel: 'اللقب',
    salutationMr: 'سيد',
    salutationMs: 'سيدة',
    salutationDiverse: 'غير محدد',
    salutationCompany: 'شركة',
    firstNameLabel: 'الاسم الأول',
    lastNameLabel: 'الكنية / اسم العائلة',
    companyNameLabel: 'اسم الشركة',
    emailLabel: 'البريد الإلكتروني',
    emailHint: 'سيتم إرسال شهادة الإلغاء الرسمية (PDF) إلى هذا البريد.',
    phoneLabel: 'رقم الهاتف (للاستفسار)',
    phoneHint: 'اختياري، يستخدم فقط في حال وجود استفسار رسمي',
    streetLabel: 'الشارع',
    houseNoLabel: 'رقم البناء',
    zipLabel: 'الرمز البريدي',
    cityLabel: 'المدينة',
    ibanLabel: 'رقم الحساب البنكي (IBAN) لاسترداد الضريبة (اختياري)',
    ibanHint: 'تقوم دائرة الجمارك الألمانية باسترداد فائض ضريبة السيارات تلقائياً لهذا الحساب.',
    reasonLabel: 'سبب إلغاء التسجيل',
    reasonSale: 'بيع السيارة',
    reasonScrap: 'تسقيط / إتلاف المركبة',
    reasonTemporary: 'إيقاف مؤقت (مثلاً فترة الشتاء)',
    reasonExport: 'تصدير للخارج',
    reasonOther: 'سبب آخر',

    reservationQuestion: 'هل ترغب بحجز لوحة الأرقام لإعادة استخدامها لاحقاً؟',
    reservationDesc: 'يتم حجز اللوحة باسمك لدى دائرة المرور حتى لا يأخذها شخص آخر.',
    reservationDurationLabel: 'مدة الحجز',
    reservationMonths3: '3 أشهر (+ 12.80 € شاملة رسوم الدائرة)',
    reservationMonths6: '6 أشهر (+ 12.80 € شاملة رسوم الدائرة)',
    reservationMonths12: '12 شهراً (+ 12.80 € شاملة رسوم الدائرة)',
    reservationPinLabel: 'رمز الحجز السري (PIN)',
    reservationPinHint: 'رمز مكون من 4 أرقام تبرزه عند تسجيل سيارتك القادمة.',

    termsConsentLabel: 'لقد قرأت الشروط والأحكام العامة (AGB) وأوافق عليها.',
    privacyConsentLabel: 'أوافق على معالجة بياناتي الشخصية وبيانات المركبة وفقاً لسياسة الخصوصية.',
    immediateExecutionConsentLabel: 'الموافقة الصريحة على البدء الفوري بتقديم الخدمة:',
    immediateExecutionConsentDetail: 'أطلب صراحة البدء الفوري بإلغاء تسجيل المركبة قبل انقضاء مهلة التراجع القانونية (14 يوماً)، وأعلم أن حقي في الإلغاء يسقط بمجرد إتمام الخدمة بالكامل (§ 356 الفقرة 4 من القانون المدني الألماني BGB).',

    paymentSelectMethod: 'اختر طريقة الدفع',
    payPalDesc: 'دفع سريع وآمن عبر PayPal',
    klarnaDesc: 'تحويل بنكي فوري عبر Klarna Sofort',
    sepaDesc: 'خصم بنكي مباشر SEPA من حساب ألماني',
    cardDesc: 'فيزا أو ماستركارد أو بطاقة بنكية',
    appleGooglePayDesc: 'دفع سريع عبر المحفظة الإلكترونية',
    encryptedPaymentNotice: 'تتم معالجة بيانات الدفع بأعلى معايير التشفير البنكي 256-Bit SSL.',

    statusSearchTitle: 'فحص حالة المعاملة',
    statusSearchSubtitle: 'أدخل رقم الطلب أو رقم الشاسيه لمعرفة حالة معالجة الإلغاء فورياً.',
    orderNumberLabel: 'رقم الطلب (مثال: KFZ-2026-89412)',
    statusFoundTitle: 'تم العثور على بيانات الطلب',
    currentStatusLabel: 'حالة المعاملة الحالية',

    footerCommercialNotice: 'KFZ Abmelden Online هو مزود خدمة تجاري خاص، ولسنا جهة حكومية. نعمل بناءً على تفويض من العميل لإتمام المعاملة إلكترونياً لدى هيئة المرور.',
    footerRights: 'جميع الحقوق محفوظة.',
    legalImpressum: 'بيانات النشر والمسؤولية (Impressum)',
    legalDatenschutz: 'حماية البيانات (Datenschutz)',
    legalAgb: 'الشروط والأحكام (AGB)',
    legalWiderruf: 'سياسة حق الرجوع (Widerrufsbelehrung)',
  }
};
