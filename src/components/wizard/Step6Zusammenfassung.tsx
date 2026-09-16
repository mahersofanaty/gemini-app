import React, { useState } from 'react';
import { 
  FileCheck2, 
  Car, 
  ShieldCheck, 
  User, 
  Bookmark, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  CreditCard,
  Building2,
  Edit3,
  HelpCircle,
  Clock,
  ChevronRight,
  Shield
} from 'lucide-react';
import { 
  VehicleData, 
  SecurityCodesData, 
  CustomerData, 
  PlateReservationData,
  WizardStep 
} from '../../types';
import { maskSecurityCode } from '../../utils/securityCrypto';

interface Step6ZusammenfassungProps {
  vehicle: VehicleData;
  securityCodes: SecurityCodesData;
  customer: CustomerData;
  reservation: PlateReservationData;
  onEditStep: (step: WizardStep) => void;
  onProceedToPayment: (orderId: string) => void;
  serviceFee?: number;
  authorityFee?: number;
  reservationFee?: number;
}

export function generateKfaOrderId(): string {
  const year = new Date().getFullYear();
  let count = 1;
  try {
    const existing = JSON.parse(localStorage.getItem('kfz_abmelden_orders') || '[]');
    count = existing.length + 1;
  } catch (e) {
    count = Math.floor(1 + Math.random() * 9999);
  }
  const padded = String(count).padStart(6, '0');
  return `KFA-${year}-${padded}`;
}

export const Step6Zusammenfassung: React.FC<Step6ZusammenfassungProps> = ({
  vehicle,
  securityCodes,
  customer,
  reservation,
  onEditStep,
  onProceedToPayment,
  serviceFee = 19.90,
  authorityFee = 2.70,
  reservationFee = 12.80,
}) => {
  // Required confirmations (all 3 must be true to enable "Kostenpflichtig bestellen")
  const [confirmDataAccurate, setConfirmDataAccurate] = useState(false);
  const [confirmPrivacy, setConfirmPrivacy] = useState(false);
  const [confirmAgb, setConfirmAgb] = useState(false);

  // Pre-payment modal state
  const [showPrePaymentSummary, setShowPrePaymentSummary] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'paypal' | 'klarna' | 'sepa' | 'card' | 'apple_google_pay'>('paypal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic fee calculation
  const totalAuthorityFee = authorityFee + (reservation.reservePlate ? reservationFee : 0);
  const totalCalculated = Number((serviceFee + totalAuthorityFee).toFixed(2));
  const vatAmount = Number(((serviceFee / 1.19) * 0.19).toFixed(2));

  // Determine single-plate configuration
  const isSinglePlate = vehicle.plateConfiguration === 'single_rear' || 
    vehicle.vehicleType === 'motorrad' || 
    vehicle.vehicleType === 'anhaenger' || 
    securityCodes.singlePlateOnly;

  // Validation state: All 3 mandatory confirmations must be true
  const isFormValid = confirmDataAccurate && confirmPrivacy && confirmAgb;

  const handleOrderButtonClick = () => {
    if (!isFormValid) return;
    const orderId = generateKfaOrderId();
    setGeneratedOrderId(orderId);
    setShowPrePaymentSummary(true);
  };

  const handleConfirmAndPay = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onProceedToPayment(generatedOrderId);
    }, 400);
  };

  return (
    <div className="space-y-8" id="step6-final-verification-page">
      {/* Title as requested: "Bitte prüfen Sie Ihre Angaben" */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
          <FileCheck2 className="w-4 h-4" />
          <span>Verbindliche Abschlussprüfung</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight" id="verification-page-title">
          Bitte prüfen Sie Ihre Angaben
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Vor der verbindlichen Beauftragung bitten wir Sie, alle nachfolgenden Daten sorgfältig zu überprüfen.
        </p>
      </div>

      {/* Mandatory Commercial Service Notice */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
        <Building2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-900 block">
            Gewerblicher Dienstleister (Keine staatliche Behörde)
          </span>
          <p className="leading-relaxed text-slate-600">
            <strong>KFZ Abmelden Online</strong> ist ein privates Unternehmen. Wir bereiten Ihren Antrag auf Außerbetriebsetzung auf, prüfen die Eingaben auf Plausibilität und übermitteln den Vorgang elektronisch an die zuständige Zulassungsbehörde.
          </p>
        </div>
      </div>

      {/* 4 Clearly Separated Cards as requested */}
      <div className="space-y-5">
        
        {/* ================= CARD 1: FAHRZEUG ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4" id="card-fahrzeug">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Car className="w-4 h-4 text-blue-600" />
              <span>Fahrzeug</span>
            </div>
            <button
              type="button"
              id="btn-edit-fahrzeug"
              onClick={() => onEditStep('step1-fahrzeugdaten')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Ändern</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Kennzeichen */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Kennzeichen:</span>
              <span className="font-mono font-bold text-base text-slate-900 mt-0.5 block tracking-wide">
                {vehicle.licensePlateNormalized || vehicle.licensePlate || 'Nicht angegeben'}
              </span>
            </div>

            {/* FIN if provided */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Fahrzeug-Identifizierungsnummer (FIN):</span>
              <span className="font-mono font-semibold text-slate-800 mt-0.5 block truncate">
                {vehicle.vin ? vehicle.vin : (vehicle.vinNotRequired ? 'Nicht erforderlich' : 'Keine FIN angegeben')}
              </span>
            </div>

            {/* Zulassungsbezirk */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Zulassungsbezirk:</span>
              <span className="font-semibold text-slate-800 mt-0.5 block leading-snug">
                {vehicle.registrationDistrict || 'Zuständige Zulassungsbehörde'}
              </span>
            </div>

            {/* Datum der Ausstellung ZB I */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Datum der Ausstellung ZB I:</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {vehicle.issueDateZBI || 'Keine Angabe'}
              </span>
            </div>
          </div>
        </div>

        {/* ================= CARD 2: SICHERHEITSCODES ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4" id="card-sicherheitscodes">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Sicherheitscodes</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium flex items-center gap-1 border border-emerald-200">
                <Lock className="w-3 h-3 text-emerald-600" />
                Vollständig maskiert
              </span>
              <button
                type="button"
                id="btn-edit-sicherheitscodes"
                onClick={() => onEditStep('step2-sicherheitscode-zbi')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Ändern</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* ZB I Sicherheitscode: strictly masked */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">ZB I Sicherheitscode:</span>
              <div className="font-mono font-bold text-base tracking-widest text-slate-900 mt-1 flex items-center gap-1.5">
                <span id="masked-zbi-code">{maskSecurityCode(securityCodes.zbISecurityCode, true)}</span>
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
              <span className="text-[10px] text-emerald-700 font-medium block mt-1">✓ 7-stellig erfasst</span>
            </div>

            {/* Kennzeichen Sicherheitscode vorne: strictly masked */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Kennzeichen Sicherheitscode vorne:</span>
              {isSinglePlate ? (
                <div className="font-medium text-slate-500 mt-1">
                  Entfällt (Einzelschild-Fahrzeug)
                </div>
              ) : (
                <>
                  <div className="font-mono font-bold text-base tracking-widest text-slate-900 mt-1 flex items-center gap-1.5">
                    <span id="masked-front-plate-code">{maskSecurityCode(securityCodes.frontPlateCode, true)}</span>
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium block mt-1">✓ 3-stellig erfasst</span>
                </>
              )}
            </div>

            {/* Kennzeichen Sicherheitscode hinten: strictly masked */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Kennzeichen Sicherheitscode hinten:</span>
              <div className="font-mono font-bold text-base tracking-widest text-slate-900 mt-1 flex items-center gap-1.5">
                <span id="masked-rear-plate-code">
                  {maskSecurityCode(securityCodes.singlePlateCode || securityCodes.rearPlateCode, true)}
                </span>
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
              <span className="text-[10px] text-emerald-700 font-medium block mt-1">✓ 3-stellig erfasst</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>
              <strong>Datenschutzhinweis:</strong> Sicherheitscodes werden auf dieser Übersichtsseite gemäß Vorgabe ausschließlich maskiert angezeigt und niemals im Klartext übertragen.
            </span>
          </div>
        </div>

        {/* ================= CARD 3: KUNDE ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4" id="card-kunde">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <User className="w-4 h-4 text-blue-600" />
              <span>Kunde</span>
            </div>
            <button
              type="button"
              id="btn-edit-kunde"
              onClick={() => onEditStep('step5-kundendaten')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Ändern</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Name */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Name:</span>
              <span className="font-semibold text-slate-900 mt-0.5 block text-sm">
                {customer.salutation === 'frau' ? 'Frau' : customer.salutation === 'herr' ? 'Herr' : ''} {customer.firstName} {customer.lastName}
              </span>
              {customer.companyName && (
                <span className="text-[10px] text-slate-500 block truncate">Fa. {customer.companyName}</span>
              )}
            </div>

            {/* Email */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Email:</span>
              <span className="font-semibold text-slate-900 mt-0.5 block truncate">
                {customer.email || 'Keine E-Mail angegeben'}
              </span>
              <span className="text-[10px] text-blue-700 block">Zustelladresse für PDF-Bescheid</span>
            </div>

            {/* Address */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Address:</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {customer.street} {customer.houseNumber}
              </span>
              <span className="text-slate-600 block">
                {customer.postalCode} {customer.city}, {customer.country || 'Deutschland'}
              </span>
            </div>

            {/* Phone */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Phone:</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {customer.phone || 'Keine Telefonnummer angegeben'}
              </span>
              <span className="text-[10px] text-slate-400 block">Für behördliche Rückfragen</span>
            </div>
          </div>
        </div>

        {/* ================= CARD 4: SERVICE ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4" id="card-service">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Bookmark className="w-4 h-4 text-blue-600" />
              <span>Service & Gebühren</span>
            </div>
            {reservation.reservePlate && (
              <button
                type="button"
                id="btn-edit-reservation"
                onClick={() => onEditStep('step4-kennzeichenreservierung')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Reservierung ändern</span>
              </button>
            )}
          </div>

          <div className="space-y-3 text-xs">
            {/* Service Item 1: KFZ Online-Abmeldung */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="font-bold text-slate-900 text-sm block">KFZ Online-Abmeldung</span>
                <span className="text-slate-500 text-[11px]">
                  Online-Außerbetriebsetzung über die Schnittstelle der Zulassungsbehörde (i-KfZ)
                </span>
              </div>
              <span className="font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200 text-right self-start sm:self-auto">
                Sofortige Ausführung
              </span>
            </div>

            {/* Pricing Details Breakdown */}
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2.5">
              {/* Service fee */}
              <div className="flex justify-between items-center text-slate-700">
                <div>
                  <span className="font-medium text-slate-900">Service fee (KFZ Abmelden Online):</span>
                  <span className="text-[11px] text-slate-500 block">
                    Gewerbliche Bearbeitungsgebühr inkl. 19% MwSt. ({vatAmount.toFixed(2).replace('.', ',')} €)
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                  {serviceFee.toFixed(2).replace('.', ',')} EUR
                </span>
              </div>

              {/* Official authority fee: dynamically displayed if applicable */}
              <div className="flex justify-between items-center text-slate-700 pt-2 border-t border-blue-200/50">
                <div>
                  <span className="font-medium text-slate-900">Official authority fee (i-KfZ GebOSt):</span>
                  <span className="text-[11px] text-slate-500 block">
                    Gesetzliche Gebühr der Zulassungsbehörde für die Außerbetriebsetzung
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                  {authorityFee.toFixed(2).replace('.', ',')} EUR
                </span>
              </div>

              {/* Optional Reservation fee */}
              {reservation.reservePlate && (
                <div className="flex justify-between items-center text-slate-700 pt-2 border-t border-blue-200/50">
                  <div>
                    <span className="font-medium text-slate-900">Kennzeichen-Reservierung ({reservation.reservationDurationMonths} Monate):</span>
                    <span className="text-[11px] text-slate-500 block">
                      Amtliche Vormerkgebühr der Zulassungsstelle (PIN: {reservation.reservationPin || 'Standard'})
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                    {reservationFee.toFixed(2).replace('.', ',')} EUR
                  </span>
                </div>
              )}

              {/* Total: dynamically calculated */}
              <div className="flex justify-between items-baseline pt-3 border-t-2 border-blue-200 text-blue-950 font-black">
                <div>
                  <span className="text-sm uppercase tracking-wider block">Total (Gesamtbetrag inkl. MwSt.):</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Verbindlicher Endpreis &bull; Keine weiteren Kosten
                  </span>
                </div>
                <span className="text-xl sm:text-2xl font-mono text-blue-700" id="dynamically-calculated-total">
                  {totalCalculated.toFixed(2).replace('.', ',')} EUR
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ================= RELEVANT CONSUMER INFORMATION BEFORE PAYMENT ================= */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-700 space-y-3" id="consumer-legal-notice">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>Gesetzliche Verbraucherinformationen vor Vertragsschluss (§ 312j BGB)</span>
        </h4>
        <div className="space-y-2 leading-relaxed text-slate-600">
          <p>
            <strong>Widerrufsbelehrung bei digitalen Dienstleistungen:</strong> Sie haben das Recht, binnen 14 Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Bei einer Dienstleistung erlischt das Widerrufsrecht jedoch vorzeitig, wenn wir die Dienstleistung vollständig erbracht haben und mit der Ausführung der Dienstleistung erst begonnen haben, nachdem Sie dazu Ihre ausdrückliche Zustimmung gegeben und gleichzeitig Ihre Kenntnis davon bestätigt haben, dass Sie Ihr Widerrufsrecht bei vollständiger Vertragserfüllung verlieren (§ 356 Abs. 4 BGB).
          </p>
          <p>
            <strong>Wirkung der Außerbetriebsetzung:</strong> Nach dem Freilegen der Sicherheitscodes dürfen die Kennzeichenschilder nicht mehr für die Teilnahme am Straßenverkehr verwendet werden. Das Fahrzeug darf auf öffentlichen Straßen weder gefahren noch abgestellt werden (§ 15a FZV).
          </p>
        </div>
      </div>

      {/* ================= MANDATORY CONFIRMATIONS ================= */}
      <div className="bg-amber-50/60 border-2 border-amber-300 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs" id="mandatory-confirmations-box">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
          Erforderliche Bestätigungen für die Bestellung
        </span>

        <div className="space-y-3">
          {/* Confirmation 1 */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id="confirm-all-data-accurate"
              checked={confirmDataAccurate}
              onChange={(e) => setConfirmDataAccurate(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded text-blue-600 border-slate-400 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
              Ich habe alle Angaben sorgfältig geprüft und bestätige, dass sie korrekt sind. <span className="text-red-500">*</span>
            </span>
          </label>

          {/* Confirmation 2 */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id="confirm-privacy-policy"
              checked={confirmPrivacy}
              onChange={(e) => setConfirmPrivacy(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded text-blue-600 border-slate-400 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
              Ich bestätige, dass ich die Datenschutzbestimmungen gelesen habe. <span className="text-red-500">*</span>
            </span>
          </label>

          {/* Confirmation 3 */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id="confirm-terms-and-conditions"
              checked={confirmAgb}
              onChange={(e) => setConfirmAgb(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded text-blue-600 border-slate-400 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
              Ich akzeptiere die AGB. <span className="text-red-500">*</span>
            </span>
          </label>
        </div>

        {!isFormValid && (
          <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-xs text-amber-900 flex items-center gap-2 mt-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
            <span>
              Bitte aktivieren Sie alle drei Pflichtfelder oben, um den Button &bdquo;Kostenpflichtig bestellen&ldquo; freizuschalten.
            </span>
          </div>
        )}
      </div>

      {/* ================= ORDER ACTION BUTTON ================= */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onEditStep('step5-kundendaten')}
          className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-300 font-semibold text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zu den Kundendaten</span>
        </button>

        {/* The "Kostenpflichtig bestellen" button must remain disabled until all mandatory confirmations are completed */}
        <button
          type="button"
          id="btn-kostenpflichtig-bestellen"
          disabled={!isFormValid}
          onClick={handleOrderButtonClick}
          className={`w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md ${
            isFormValid
              ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white cursor-pointer hover:shadow-emerald-600/30'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span>Kostenpflichtig bestellen ({totalCalculated.toFixed(2).replace('.', ',')} EUR)</span>
        </button>
      </div>

      {/* ================= PRE-PAYMENT SUMMARY MODAL ================= */}
      {showPrePaymentSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded">
                  Bestellübersicht vor Bezahlung
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Auftrag {generatedOrderId}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Eindeutige Auftragsnummer generiert &bull; Keine internen Datenbank-IDs
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* Summary Highlights */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Auftragsnummer:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{generatedOrderId}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Fahrzeug-Kennzeichen:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {vehicle.licensePlateNormalized || vehicle.licensePlate}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Antragsteller:</span>
                <span className="font-semibold text-slate-900">
                  {customer.firstName} {customer.lastName}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Zustelladresse:</span>
                <span className="font-semibold text-blue-700">{customer.email}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 text-sm font-black text-slate-900">
                <span>Gesamtbetrag:</span>
                <span className="text-xl font-mono text-emerald-700">
                  {totalCalculated.toFixed(2).replace('.', ',')} EUR
                </span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Zahlungsart wählen
              </label>
              <div className="space-y-2">
                {[
                  { id: 'paypal', name: 'PayPal', badge: 'Käuferschutz' },
                  { id: 'klarna', name: 'Klarna Sofortüberweisung', badge: 'Online-Banking' },
                  { id: 'card', name: 'Kreditkarte (Visa / Mastercard)', badge: 'Echtzeit' },
                  { id: 'apple_google_pay', name: 'Apple Pay / Google Pay', badge: 'Express' },
                  { id: 'sepa', name: 'SEPA Lastschrift', badge: 'Bankkonto' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPaymentMethod(item.id as any)}
                    className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-between text-xs transition-all ${
                      selectedPaymentMethod === item.id 
                        ? 'border-blue-600 bg-blue-50/60 font-bold text-blue-950' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="modal-payment-choice"
                        checked={selectedPaymentMethod === item.id}
                        onChange={() => setSelectedPaymentMethod(item.id as any)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowPrePaymentSummary(false)}
                className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Zurück zur Prüfung
              </button>

              <button
                type="button"
                id="btn-confirm-and-redirect-payment"
                disabled={isSubmitting}
                onClick={handleConfirmAndPay}
                className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Weiterleitung zu {selectedPaymentMethod.toUpperCase()}...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Jetzt sicher bezahlen ({totalCalculated.toFixed(2).replace('.', ',')} EUR)</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
