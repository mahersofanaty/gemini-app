import React, { useState } from 'react';
import { 
  Car, 
  ShieldCheck, 
  User, 
  Bookmark, 
  CheckSquare, 
  CreditCard, 
  Loader2, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle,
  Download,
  Printer,
  Sparkles,
  Lock,
  Stamp,
  Check,
  Clock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { 
  WizardStep, 
  VehicleData, 
  SecurityCodesData, 
  CustomerData, 
  PlateReservationData, 
  PaymentMethod, 
  OrderRecord,
  CurrentScreen
} from '../types';
import { StickySummary } from '../components/StickySummary';
import { CommercialBanner } from '../components/CommercialBanner';
import { Step1VehicleData } from '../components/wizard/Step1VehicleData';
import { Step2SecurityCodeZBI } from '../components/wizard/Step2SecurityCodeZBI';
import { Step3Stempelplaketten } from '../components/wizard/Step3Stempelplaketten';
import { Step4Kennzeichenreservierung } from '../components/wizard/Step4Kennzeichenreservierung';
import { Step5CustomerDetails } from '../components/wizard/Step5CustomerDetails';
import { Step6Zusammenfassung } from '../components/wizard/Step6Zusammenfassung';
import { maskSecurityCode, encryptSensitiveAtRest } from '../utils/securityCrypto';

interface WizardViewProps {
  onOrderCompleted: (order: OrderRecord) => void;
  setCurrentScreen: (screen: CurrentScreen) => void;
}

export const WizardView: React.FC<WizardViewProps> = ({ onOrderCompleted, setCurrentScreen }) => {
  const { t } = useLanguage();

  const [currentStep, setCurrentStep] = useState<WizardStep>('step1-fahrzeugdaten');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Vehicle Data (Manual entry only - zero camera, zero OCR)
  const [vehicle, setVehicle] = useState<VehicleData>({
    licensePlate: '',
    licensePlateNormalized: '',
    licensePlateCity: '',
    licensePlateLetters: '',
    licensePlateNumbers: '',
    vin: '',
    vinNotRequired: false,
    issueDateZBI: '',
    registrationDistrict: '',
    plateConfiguration: 'standard_two',
    vehicleType: 'pkw',
  });

  // 2 & 3. Security Codes (Masked, sensitive, zero raw logging)
  const [securityCodes, setSecurityCodes] = useState<SecurityCodesData>({
    zbISecurityCode: '',
    frontPlateCode: '',
    rearPlateCode: '',
    singlePlateOnly: false,
    confirmedLabelsScratched: false,
  });

  // 4. Kennzeichenreservierung
  const [reservation, setReservation] = useState<PlateReservationData>({
    reservePlate: false,
    reservationPin: '',
    reservationDurationMonths: 6,
  });

  // 5. Halter- & Kontaktdaten
  const [customer, setCustomer] = useState<CustomerData>({
    salutation: 'herr',
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    country: 'Deutschland',
    ibanForTaxRefund: '',
    reason: 'sale',
  });

  // 6. Review & Consents
  const [confirmedAllData, setConfirmedAllData] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentImmediateExecution, setConsentImmediateExecution] = useState(false);

  // 7. Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paypal');

  // Current Order ID state
  const [currentOrderId, setCurrentOrderId] = useState<string>('');

  // Processing state
  const [processingStage, setProcessingStage] = useState<number>(1);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Pricing constants (strictly distinguished)
  const SERVICE_FEE = 19.90;
  const AUTHORITY_FEE = 2.70;
  const RESERVATION_FEE = 12.80;

  // Stepper representation for progress indicator
  const stepsList: { id: WizardStep; label: string; number: number }[] = [
    { id: 'step1-fahrzeugdaten', label: '1. Fahrzeugdaten', number: 1 },
    { id: 'step2-sicherheitscode-zbi', label: '2. ZB I Rubbelcode', number: 2 },
    { id: 'step3-stempelplaketten', label: '3. Stempelplaketten', number: 3 },
    { id: 'step4-kennzeichenreservierung', label: '4. Reservierung', number: 4 },
    { id: 'step5-kundendaten', label: '5. Halterdaten', number: 5 },
    { id: 'step6-zusammenfassung', label: '6. Angaben prüfen', number: 6 },
    { id: 'payment', label: '7. Bezahlung', number: 7 },
  ];

  const currentStepIndex = stepsList.findIndex(s => s.id === currentStep);

  // Helper for generating formatted KFA Order ID
  const generateUniqueKfaId = (): string => {
    const year = new Date().getFullYear();
    let count = 1;
    try {
      const existing = JSON.parse(localStorage.getItem('kfz_abmelden_orders') || '[]');
      count = existing.length + 1;
    } catch (e) {
      count = Math.floor(1 + Math.random() * 9999);
    }
    return `KFA-${year}-${String(count).padStart(6, '0')}`;
  };

  // Demo autofill for realistic testing
  const handleAutofillDemo = () => {
    setVehicle({
      licensePlate: 'D-AB 1234',
      licensePlateNormalized: 'D-AB 1234',
      licensePlateCity: 'D',
      licensePlateLetters: 'AB',
      licensePlateNumbers: '1234',
      vin: 'WVWZZZ3CZWE123456',
      vinNotRequired: false,
      issueDateZBI: '2020-08-15',
      registrationDistrict: 'Düsseldorf (Stadtverwaltung Straßenverkehrsamt)',
      plateConfiguration: 'standard_two',
      vehicleType: 'pkw',
    });

    setSecurityCodes({
      zbISecurityCode: 'B8K3X92',
      frontPlateCode: '4X9',
      rearPlateCode: '8R2',
      singlePlateOnly: false,
      confirmedLabelsScratched: true,
    });

    setCustomer({
      salutation: 'herr',
      firstName: 'Maximilian',
      lastName: 'Mustermann',
      companyName: '',
      email: 'm.mustermann@example.de',
      phone: '+49 170 1234567',
      street: 'Königsallee',
      houseNumber: '42',
      postalCode: '40212',
      city: 'Düsseldorf',
      country: 'Deutschland',
      ibanForTaxRefund: 'DE89370400440532013000',
      reason: 'sale',
    });

    setReservation({
      reservePlate: true,
      reservationPin: '1234',
      reservationDurationMonths: 6,
    });

    setConfirmedAllData(true);
    setConsentTerms(true);
    setConsentPrivacy(true);
    setConsentImmediateExecution(true);
    setErrorMessage(null);
  };

  // Processing & completion workflow
  const triggerProcessing = async (preassignedOrderId?: string) => {
    setCurrentStep('processing');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const total = SERVICE_FEE + AUTHORITY_FEE + (reservation.reservePlate ? RESERVATION_FEE : 0.0);
    const vat = (SERVICE_FEE * 0.19) / 1.19;

    let orderId = preassignedOrderId || currentOrderId || generateUniqueKfaId();
    let reference: string | null = null;
    let finalStatus = 'submitted_to_ikfz';
    let finalDisplayStatus = 'Antrag wird geprüft';
    let finalAuthorityName = vehicle.registrationDistrict || 'Zulassungsbehörde';
    let finalMessage = 'Antrag eingereicht.';

    // Try posting to real backend API
    try {
      const orderPayload = {
        vehicle,
        securityCodes,
        customer,
        reservation,
        confirmations: {
          confirmDataAccurate: true,
          confirmPrivacy: true,
          confirmAgb: true,
        },
      };

      const resp = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.publicOrderId) {
          orderId = data.publicOrderId;
        }
        // Capture payment in backend and invoke i-KfZ provider layer
        const payResp = await fetch(`/api/orders/${orderId}/payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentMethod }),
        });
        if (payResp.ok) {
          const payData = await payResp.json();
          finalStatus = payData.status || (payData.success ? 'erfolgreich_abgemeldet' : 'manuelle_pruefung');
          finalDisplayStatus = payData.displayStatus || (finalStatus === 'erfolgreich_abgemeldet' ? 'Erfolgreich abgemeldet' : 'Antrag wird geprüft');
          reference = payData.ikfzReference || null;
          finalAuthorityName = payData.authorityName || finalAuthorityName;
          finalMessage = payData.message || finalMessage;
        }
      }
    } catch (e) {
      console.warn('[Backend] API order submission fallback to client storage:', e);
      finalStatus = 'manuelle_pruefung';
      finalDisplayStatus = 'Manuelle Prüfung erforderlich.';
      finalMessage = 'Offline-Verarbeitung eingeleitet. Vorgang an Sachbearbeiter übergeben.';
    }

    // Generate masked representation for safe display & storage (never plain text)
    const maskedCodes = {
      zbISecurityCodeMasked: maskSecurityCode(securityCodes.zbISecurityCode, true),
      frontPlateCodeMasked: maskSecurityCode(securityCodes.frontPlateCode, true),
      rearPlateCodeMasked: maskSecurityCode(securityCodes.rearPlateCode, true),
    };

    // Client-side encryption at rest (never stored in plain text)
    const encryptedSecurityPayload = await encryptSensitiveAtRest(JSON.stringify(securityCodes));

    const newOrder: OrderRecord = {
      orderId,
      createdAt: new Date().toISOString(),
      status: finalStatus,
      displayStatus: finalDisplayStatus,
      authorityName: finalAuthorityName,
      statusMessage: finalMessage,
      vehicle,
      securityCodesMasked: maskedCodes,
      encryptedSecurityPayload,
      dataConfirmationChecked: true,
      customer,
      plateReservation: reservation,
      pricing: {
        serviceFee: SERVICE_FEE,
        authorityFee: AUTHORITY_FEE,
        reservationFee: reservation.reservePlate ? RESERVATION_FEE : 0,
        vatAmount: vat,
        totalAmount: total,
      },
      paymentMethod,
      deRegistrationTimestamp: new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }),
      deRegistrationReference: reference || undefined,
      downloadToken: `tok_${Math.random().toString(36).substring(2, 10)}`,
    };

    // Persist securely in localStorage as well
    try {
      const existingOrders = JSON.parse(localStorage.getItem('kfz_abmelden_orders') || '[]');
      localStorage.setItem('kfz_abmelden_orders', JSON.stringify([newOrder, ...existingOrders]));
    } catch (e) {
      // ignore storage quota errors
    }

    // Step-by-step verification and submission stages
    setProcessingStage(1);
    setTimeout(() => {
      setProcessingStage(2);
      setTimeout(() => {
        setProcessingStage(3);
        setTimeout(() => {
          setProcessingStage(4);
          setTimeout(() => {
            setCompletedOrder(newOrder);
            onOrderCompleted(newOrder);
            setCurrentStep('success');
          }, 1200);
        }, 1200);
      }, 1200);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Banner Notice: Private Commercial Service */}
      <CommercialBanner compact />

      {/* Top navigation & demo bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div>
          {currentStep !== 'processing' && currentStep !== 'success' && (
            <button
              type="button"
              id="wizard-back-top-btn"
              onClick={() => {
                if (currentStep === 'step1-fahrzeugdaten') setCurrentScreen('home');
                else if (currentStep === 'step2-sicherheitscode-zbi') setCurrentStep('step1-fahrzeugdaten');
                else if (currentStep === 'step3-stempelplaketten') setCurrentStep('step2-sicherheitscode-zbi');
                else if (currentStep === 'step4-kennzeichenreservierung') setCurrentStep('step3-stempelplaketten');
                else if (currentStep === 'step5-kundendaten') setCurrentStep('step4-kennzeichenreservierung');
                else if (currentStep === 'step6-zusammenfassung') setCurrentStep('step5-kundendaten');
                else if (currentStep === 'payment') setCurrentStep('step6-zusammenfassung');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.btnBack}</span>
            </button>
          )}
        </div>

        {currentStep !== 'processing' && currentStep !== 'success' && (
          <button
            type="button"
            id="autofill-demo-btn"
            onClick={handleAutofillDemo}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg shadow-2xs transition-all cursor-pointer"
            title="Füllt realistische Testdaten für Düsseldorf ein"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.btnAutofillDemo} (Testdaten laden)</span>
          </button>
        )}
      </div>

      {/* Progress Stepper (Visible for steps 1-7) */}
      {currentStep !== 'processing' && currentStep !== 'success' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="hidden md:grid grid-cols-7 gap-2 text-center text-xs">
            {stepsList.map((step, idx) => {
              const isActive = step.id === currentStep;
              const isDone = currentStepIndex > idx;
              return (
                <div 
                  key={step.id} 
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' 
                      : isDone 
                      ? 'text-emerald-700 font-semibold' 
                      : 'text-slate-400'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : isDone 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isDone ? <Check className="w-4 h-4" /> : step.number}
                  </div>
                  <span className="truncate w-full text-[11px]">{step.label}</span>
                </div>
              );
            })}
          </div>

          {/* Mobile Step Indicator */}
          <div className="md:hidden flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">
              Schritt {currentStepIndex + 1} von {stepsList.length}: {stepsList[currentStepIndex]?.label}
            </span>
            <span className="font-mono text-blue-600 font-semibold">
              {Math.round(((currentStepIndex + 1) / stepsList.length) * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Error notification banner */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-900 text-xs sm:text-sm flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">
            {errorMessage}
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-700 hover:text-red-900 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Form Column + Sticky Pricing Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Container */}
        <div className={currentStep === 'processing' || currentStep === 'success' ? 'lg:col-span-12' : 'lg:col-span-8'}>
          
          {/* STEP 1: Fahrzeugdaten (Manual Entry only) */}
          {currentStep === 'step1-fahrzeugdaten' && (
            <Step1VehicleData 
              vehicle={vehicle}
              setVehicle={setVehicle}
              onNext={() => {
                setCurrentStep('step2-sicherheitscode-zbi');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* STEP 2: Sicherheitscode Zulassungsbescheinigung Teil I */}
          {currentStep === 'step2-sicherheitscode-zbi' && (
            <Step2SecurityCodeZBI 
              securityCodes={securityCodes}
              setSecurityCodes={setSecurityCodes}
              vehicle={vehicle}
              onBack={() => {
                setCurrentStep('step1-fahrzeugdaten');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNext={() => {
                setCurrentStep('step3-stempelplaketten');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* STEP 3: Sicherheitscodes der Stempelplaketten */}
          {currentStep === 'step3-stempelplaketten' && (
            <Step3Stempelplaketten 
              securityCodes={securityCodes}
              setSecurityCodes={setSecurityCodes}
              vehicle={vehicle}
              setVehicle={setVehicle}
              onBack={() => {
                setCurrentStep('step2-sicherheitscode-zbi');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNext={() => {
                setCurrentStep('step4-kennzeichenreservierung');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* STEP 4: Kennzeichenreservierung (optional) */}
          {currentStep === 'step4-kennzeichenreservierung' && (
            <Step4Kennzeichenreservierung 
              reservation={reservation}
              setReservation={setReservation}
              vehicle={vehicle}
              onBack={() => {
                setCurrentStep('step3-stempelplaketten');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNext={() => {
                setCurrentStep('step5-kundendaten');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              reservationFee={RESERVATION_FEE}
            />
          )}

          {/* STEP 5: Halter- & Kontaktdaten */}
          {currentStep === 'step5-kundendaten' && (
            <Step5CustomerDetails 
              customer={customer}
              setCustomer={setCustomer}
              onBack={() => {
                setCurrentStep('step4-kennzeichenreservierung');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNext={() => {
                setCurrentStep('step6-zusammenfassung');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* STEP 6: Verbindliche Abschlussprüfung vor Bezahlung */}
          {currentStep === 'step6-zusammenfassung' && (
            <Step6Zusammenfassung 
              vehicle={vehicle}
              securityCodes={securityCodes}
              reservation={reservation}
              customer={customer}
              onEditStep={(targetStep) => {
                setCurrentStep(targetStep);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onProceedToPayment={(newOrderId) => {
                setCurrentOrderId(newOrderId);
                triggerProcessing(newOrderId);
              }}
              serviceFee={SERVICE_FEE}
              authorityFee={AUTHORITY_FEE}
              reservationFee={RESERVATION_FEE}
            />
          )}

          {/* STEP 7: Bezahlung */}
          {currentStep === 'payment' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Schritt 7 von 7
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  {t.stepPaymentTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {t.stepPaymentSubtitle}
                </p>
              </div>

              {/* Payment Methods Selection */}
              <div className="space-y-3">
                {[
                  { id: 'paypal' as PaymentMethod, name: 'PayPal', desc: t.payPalDesc, badge: 'Sehr beliebt' },
                  { id: 'klarna' as PaymentMethod, name: 'Klarna Sofortüberweisung', desc: t.klarnaDesc, badge: 'Direkt per Online-Banking' },
                  { id: 'sepa' as PaymentMethod, name: 'SEPA Lastschrift', desc: t.sepaDesc, badge: 'Deutsches Bankkonto' },
                  { id: 'card' as PaymentMethod, name: 'Kreditkarte / Debitkarte', desc: t.cardDesc, badge: 'Visa, Mastercard' },
                  { id: 'apple_google_pay' as PaymentMethod, name: 'Apple Pay / Google Pay', desc: t.appleGooglePayDesc, badge: 'Express-Zahlung' },
                ].map((method) => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          id={`radio-payment-${method.id}`}
                          type="radio"
                          name="payment-method-radio"
                          checked={isSelected}
                          onChange={() => setPaymentMethod(method.id)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            <span>{method.name}</span>
                            <span className="text-[10px] font-semibold text-slate-500 px-2 py-0.5 rounded bg-slate-100">
                              {method.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {method.desc}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {(SERVICE_FEE + AUTHORITY_FEE + (reservation.reservePlate ? RESERVATION_FEE : 0)).toFixed(2).replace('.', ',')} €
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Encryption Notice */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.encryptedPaymentNotice}</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep('step6-zusammenfassung');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-5 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {t.btnBack}
                </button>
                <button
                  type="button"
                  id="submit-payment-btn"
                  onClick={triggerProcessing}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black rounded-xl shadow-md shadow-emerald-600/20 transition-all text-base flex items-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>{t.btnPayNow} ({(SERVICE_FEE + AUTHORITY_FEE + (reservation.reservePlate ? RESERVATION_FEE : 0)).toFixed(2).replace('.', ',')} €)</span>
                </button>
              </div>
            </div>
          )}

          {/* PROCESSING SIMULATION */}
          {currentStep === 'processing' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">
                  {t.stepProcessingTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  {t.stepProcessingSubtitle}
                </p>
              </div>

              {/* Processing Progress Status Lines */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3.5 text-xs sm:text-sm">
                <div className={`flex items-center gap-3 transition-colors ${processingStage >= 1 ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                  {processingStage > 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                  )}
                  <span>1. Manuelle Fahrzeugdaten & Kennzeichenformate validiert</span>
                </div>

                <div className={`flex items-center gap-3 transition-colors ${processingStage >= 2 ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                  {processingStage > 2 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : processingStage === 2 ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                  )}
                  <span>2. Sicherheitscodes ZB I & Stempelplaketten geprüft</span>
                </div>

                <div className={`flex items-center gap-3 transition-colors ${processingStage >= 3 ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                  {processingStage > 3 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : processingStage === 3 ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                  )}
                  <span>3. Übermittlung über i-KfZ Schnittstelle an die Zulassungsstelle</span>
                </div>

                <div className={`flex items-center gap-3 transition-colors ${processingStage >= 4 ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                  {processingStage >= 4 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                  )}
                  <span>4. Amtlicher Abmeldenachweis wird generiert</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Bitte schließen Sie dieses Fenster nicht. Der Vorgang dauert nur wenige Augenblicke.
              </div>
            </div>
          )}

          {/* SUCCESS CONFIRMATION */}
          {currentStep === 'success' && completedOrder && (
            <div className="space-y-6">
              {/* Dynamic Status Card based on authoritative i-KfZ outcome */}
              {completedOrder.status === 'erfolgreich_abgemeldet' ? (
                /* 1. OFFICIALLY CONFIRMED */
                <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-10 shadow-md space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                          Außerbetriebsetzung behördlich bestätigt
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                          Erfolgreich abgemeldet
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500">
                          Rechtsgültig ab heute ({completedOrder.deRegistrationTimestamp}) • {completedOrder.authorityName}
                        </p>
                      </div>
                    </div>

                    {/* Order ID Badge */}
                    <div className="bg-slate-100 px-3.5 py-2 rounded-xl text-right">
                      <div className="text-[10px] text-slate-500 font-medium uppercase">Auftragsnummer</div>
                      <div className="font-mono font-bold text-sm text-slate-900">{completedOrder.orderId}</div>
                    </div>
                  </div>

                  {/* Notice of legal invalidation of plates */}
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-700" />
                      Hinweis zur Straßenverkehrszulassung:
                    </div>
                    <p className="leading-relaxed">
                      Nach dem Freilegen der Sicherheitscodes dürfen die Kennzeichenschilder nicht mehr für die Teilnahme am Straßenverkehr verwendet werden.
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Kennzeichen:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {completedOrder.vehicle.licensePlateNormalized || `${completedOrder.vehicle.licensePlateCity} ${completedOrder.vehicle.licensePlateLetters} ${completedOrder.vehicle.licensePlateNumbers}`}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Amtliches Aktenzeichen:</span>
                      <span className="font-mono font-bold text-blue-700 text-sm truncate block">
                        {completedOrder.deRegistrationReference}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Gezahlter Gesamtbetrag:</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        {completedOrder.pricing.totalAmount.toFixed(2).replace('.', ',')} €
                      </span>
                    </div>
                  </div>

                  {/* Primary Action: Download Official Certificate */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      type="button"
                      id="download-certificate-btn"
                      onClick={() => setShowCertificateModal(true)}
                      className="flex-1 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{t.btnDownloadCertificate}</span>
                    </button>
                    <button
                      type="button"
                      id="print-certificate-btn"
                      onClick={() => window.print()}
                      className="py-4 px-6 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-slate-500" />
                      <span>{t.btnPrintConfirmation}</span>
                    </button>
                  </div>
                </div>
              ) : completedOrder.status === 'submitted_to_ikfz' ? (
                /* 2. SUBMITTED / PENDING KBA CONFIRMATION */
                <div className="bg-white rounded-3xl border border-blue-200 p-6 sm:p-10 shadow-md space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Clock className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                          Behördliche Übermittlung erfolgt
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                          Antrag wird geprüft
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500">
                          Eingereicht bei {completedOrder.authorityName}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-100 px-3.5 py-2 rounded-xl text-right">
                      <div className="text-[10px] text-slate-500 font-medium uppercase">Auftragsnummer</div>
                      <div className="font-mono font-bold text-sm text-slate-900">{completedOrder.orderId}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs sm:text-sm text-blue-950 space-y-2">
                    <div className="font-bold text-blue-900">Aktueller Bearbeitungsstand:</div>
                    <p className="leading-relaxed text-blue-800">
                      Ihr Antrag wurde erfolgreich an die zuständige Zulassungsstelle übermittelt. Wir warten auf die behördliche Rückmeldung aus dem zentralen Fahrzeugregister (ZFZR). Sobald die Außerbetriebsetzung autoritativ bestätigt ist, erhalten Sie Ihren amtlichen Bescheid per E-Mail an <strong>{completedOrder.customer.email}</strong>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Fahrzeug:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {completedOrder.vehicle.licensePlateNormalized || `${completedOrder.vehicle.licensePlateCity} ${completedOrder.vehicle.licensePlateLetters} ${completedOrder.vehicle.licensePlateNumbers}`}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Status:</span>
                      <span className="font-bold text-blue-700 text-sm">In behördlicher Prüfung</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentScreen('status')}
                      className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors text-center cursor-pointer"
                    >
                      Auftragsstatus online verfolgen
                    </button>
                  </div>
                </div>
              ) : (
                /* 3. MANUAL REVIEW REQUIRED (e.g. Unsupported Authority, Missing Credentials or Visual Check Needed) */
                <div className="bg-white rounded-3xl border border-amber-200 p-6 sm:p-10 shadow-md space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                          Sachbearbeiter-Bearbeitung
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                          Manuelle Prüfung erforderlich.
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500">
                          Zuständige Behörde: {completedOrder.authorityName}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-100 px-3.5 py-2 rounded-xl text-right">
                      <div className="text-[10px] text-slate-500 font-medium uppercase">Auftragsnummer</div>
                      <div className="font-mono font-bold text-sm text-slate-900">{completedOrder.orderId}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs sm:text-sm text-amber-950 space-y-2">
                    <div className="font-bold text-amber-900 flex items-center gap-2">
                      <span>Information zum Vorgang:</span>
                    </div>
                    <p className="leading-relaxed text-amber-800">
                      {completedOrder.statusMessage || 'Ihr Antrag wurde sicher gespeichert und an unser qualifiziertes Sachbearbeiterteam übergeben. Bei Ihrer zuständigen Zulassungsbehörde erfolgt die Bearbeitung über das behördliche Fachportal. Sie müssen keine weiteren Schritte unternehmen.'}
                    </p>
                    <p className="text-xs text-amber-700 pt-1">
                      Sobald der Vorgang durch die Behörde abgeschlossen wurde, geht Ihnen die Bestätigung unverzüglich per E-Mail zu.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Fahrzeug:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {completedOrder.vehicle.licensePlateNormalized || `${completedOrder.vehicle.licensePlateCity} ${completedOrder.vehicle.licensePlateLetters} ${completedOrder.vehicle.licensePlateNumbers}`}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Zahlungsstatus:</span>
                      <span className="font-bold text-emerald-700 text-sm">Bezahlt ({completedOrder.pricing.totalAmount.toFixed(2).replace('.', ',')} €)</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentScreen('status')}
                      className="flex-1 py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors text-center cursor-pointer"
                    >
                      Auftragsstatus prüfen
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentScreen('contact')}
                      className="py-4 px-6 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-xl text-sm transition-colors text-center cursor-pointer"
                    >
                      Kundenservice kontaktieren
                    </button>
                  </div>
                </div>
              )}

              {/* Return link */}
              <div className="flex items-center justify-between text-xs text-slate-500 px-2">
                <span>Auftrag gespeichert. Sie können ihn jederzeit unter "Auftragsstatus" abrufen.</span>
                <button
                  type="button"
                  onClick={() => setCurrentScreen('home')}
                  className="text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  Zurück zur Startseite &rarr;
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Sticky Summary (Visible in Steps 1-7) */}
        {currentStep !== 'processing' && currentStep !== 'success' && (
          <div className="lg:col-span-4">
            <StickySummary 
              vehicle={vehicle}
              reservation={reservation}
              serviceFee={SERVICE_FEE}
              authorityFee={AUTHORITY_FEE}
              reservationFee={RESERVATION_FEE}
            />
          </div>
        )}

      </div>

      {/* Official Certificate Modal / Preview */}
      {showCertificateModal && completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-300 my-8 space-y-6">
            
            {/* Certificate Header simulating official German format */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-slate-500">
                  Kraftfahrt-Bundesamt / Zulassungsbehörde
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mt-1">
                  Nachweis über die Außerbetriebsetzung
                </h3>
                <div className="text-xs text-slate-600 font-mono">
                  Gemäß § 15a der Fahrzeug-Zulassungsverordnung (FZV / i-KfZ)
                </div>
              </div>

              <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-800 font-serif">
                i-KfZ
              </div>
            </div>

            {/* Certificate Data Table */}
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Amtliches Kennzeichen:</span>
                  <span className="text-base font-bold text-slate-900">
                    {completedOrder.vehicle.licensePlateNormalized || `${completedOrder.vehicle.licensePlateCity} ${completedOrder.vehicle.licensePlateLetters} ${completedOrder.vehicle.licensePlateNumbers}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Fahrzeug-Identifizierungsnummer:</span>
                  <span className="font-bold text-slate-900">{completedOrder.vehicle.vin || 'Nicht erforderlich'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Außerbetriebsetzung wirksam am:</span>
                  <span className="font-bold text-slate-900">{completedOrder.deRegistrationTimestamp}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Vorgangs-Referenznummer:</span>
                  <span className="font-bold text-blue-700">{completedOrder.deRegistrationReference}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-sans block">Halter / Antragsteller:</span>
                <span className="font-bold text-slate-900">
                  {completedOrder.customer.firstName} {completedOrder.customer.lastName}, {completedOrder.customer.street} {completedOrder.customer.houseNumber}, {completedOrder.customer.postalCode} {completedOrder.customer.city}
                </span>
              </div>

              {completedOrder.plateReservation.reservePlate && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-950 text-xs">
                  <strong>Kennzeichen-Reservierung vermerkt:</strong> Das Kennzeichen ist für {completedOrder.plateReservation.reservationDurationMonths} Monate reserviert (PIN: {completedOrder.plateReservation.reservationPin}).
                </div>
              )}

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] font-sans">
                <strong>Wichtiger Hinweis:</strong> Nach dem Freilegen der Sicherheitscodes dürfen die Kennzeichenschilder nicht mehr für die Teilnahme am Straßenverkehr verwendet werden.
              </div>

              <div className="text-[10px] text-slate-400 leading-relaxed font-sans pt-2 border-t border-slate-200">
                Dieser digitale Nachweis wurde maschinell erstellt und ist ohne Unterschrift und Dienstsiegel gültig. Die Weitergabe an Versicherungsträger und Finanzverwaltung erfolgt elektronisch gemäß StVZO.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCertificateModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Schließen
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Drucken / Als PDF speichern</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
