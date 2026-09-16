import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building
} from 'lucide-react';
import { CustomerData } from '../../types';

interface Step5CustomerDetailsProps {
  customer: CustomerData;
  setCustomer: React.Dispatch<React.SetStateAction<CustomerData>>;
  onNext: () => void;
  onBack: () => void;
}

export const Step5CustomerDetails: React.FC<Step5CustomerDetailsProps> = ({
  customer,
  setCustomer,
  onNext,
  onBack,
}) => {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Field validation helpers for German addresses and email
  const validateEmail = (email: string) => {
    const trimmed = email.trim();
    if (!trimmed) return 'Die E-Mail-Adresse ist ein Pflichtfeld.';
    // Standard RFC 5322 compliant regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return 'Bitte geben Sie eine gültige E-Mail-Adresse ein (z.B. name@example.de).';
    }
    return null;
  };

  const validatePhone = (phone: string) => {
    const trimmed = phone.trim();
    if (!trimmed) return 'Die Telefonnummer ist ein Pflichtfeld für eventuelle Rückfragen der Behörde.';
    // German phone regex: allows +, spaces, brackets, digits, min 6 digits
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (digitsOnly.length < 6 || digitsOnly.length > 16) {
      return 'Bitte geben Sie eine gültige Telefonnummer an (mindestens 6 Ziffern).';
    }
    return null;
  };

  const validatePLZ = (plz: string) => {
    const trimmed = plz.trim();
    if (!trimmed) return 'Die Postleitzahl ist erforderlich.';
    // German postal codes are exactly 5 digits
    if (!/^\d{5}$/.test(trimmed)) {
      return 'Eine deutsche Postleitzahl (PLZ) muss aus genau 5 Ziffern bestehen.';
    }
    return null;
  };

  const validateRequired = (val: string, fieldName: string, minLen = 2) => {
    const trimmed = val.trim();
    if (!trimmed) return `${fieldName} ist ein Pflichtfeld.`;
    if (trimmed.length < minLen) return `${fieldName} muss mindestens ${minLen} Zeichen enthalten.`;
    return null;
  };

  const validateHouseNumber = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return 'Hausnummer ist erforderlich.';
    if (!/^[0-9]+[a-zA-Z0-9\s\-\/]*$/.test(trimmed)) {
      return 'Bitte geben Sie eine gültige Hausnummer ein (z.B. 12 oder 14a).';
    }
    return null;
  };

  const errors = {
    firstName: validateRequired(customer.firstName, 'Vorname'),
    lastName: validateRequired(customer.lastName, 'Nachname'),
    email: validateEmail(customer.email),
    phone: validatePhone(customer.phone),
    street: validateRequired(customer.street, 'Straße'),
    houseNumber: validateHouseNumber(customer.houseNumber),
    postalCode: validatePLZ(customer.postalCode),
    city: validateRequired(customer.city, 'Ort'),
  };

  const isFormValid = Object.values(errors).every(err => err === null);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mark all as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      street: true,
      houseNumber: true,
      postalCode: true,
      city: true,
    });

    if (isFormValid) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" id="step5-customer-form">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
          <User className="w-4 h-4" />
          <span>Schritt 5 von 6 &bull; Halter- und Kundendaten</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mt-1">
          Angaben zum Antragsteller & Halter
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Geben Sie Ihre Anschrift für die amtliche Zuordnung und den Versand des digitalen Abmeldebescheids ein.
        </p>
      </div>

      {/* Main Form Fields Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Anrede */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Anrede
          </label>
          <div className="flex flex-wrap gap-2">
            {(['herr', 'frau', 'divers', 'firma'] as const).map((sal) => (
              <button
                key={sal}
                type="button"
                onClick={() => setCustomer(prev => ({ ...prev, salutation: sal }))}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  customer.salutation === sal
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {sal === 'herr' ? 'Herr' : sal === 'frau' ? 'Frau' : sal === 'divers' ? 'Divers' : 'Firma'}
              </button>
            ))}
          </div>
        </div>

        {/* Vorname & Nachname */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Vorname */}
          <div className="space-y-1.5">
            <label htmlFor="customer-firstname" className="text-xs font-bold text-slate-800 block">
              Vorname <span className="text-red-500">*</span>
            </label>
            <input
              id="customer-firstname"
              type="text"
              required
              value={customer.firstName}
              onChange={(e) => setCustomer(prev => ({ ...prev, firstName: e.target.value }))}
              onBlur={() => handleBlur('firstName')}
              placeholder="z.B. Maximilian"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                touched.firstName && errors.firstName
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-slate-300'
              }`}
            />
            {touched.firstName && errors.firstName && (
              <p className="text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.firstName}</span>
              </p>
            )}
          </div>

          {/* Nachname */}
          <div className="space-y-1.5">
            <label htmlFor="customer-lastname" className="text-xs font-bold text-slate-800 block">
              Nachname <span className="text-red-500">*</span>
            </label>
            <input
              id="customer-lastname"
              type="text"
              required
              value={customer.lastName}
              onChange={(e) => setCustomer(prev => ({ ...prev, lastName: e.target.value }))}
              onBlur={() => handleBlur('lastName')}
              placeholder="z.B. Mustermann"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                touched.lastName && errors.lastName
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-slate-300'
              }`}
            />
            {touched.lastName && errors.lastName && (
              <p className="text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.lastName}</span>
              </p>
            )}
          </div>
        </div>

        {/* E-Mail & Telefonnummer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* E-Mail */}
          <div className="space-y-1.5">
            <label htmlFor="customer-email" className="text-xs font-bold text-slate-800 block">
              E-Mail-Adresse <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="customer-email"
                type="email"
                required
                value={customer.email}
                onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                onBlur={() => handleBlur('email')}
                placeholder="name@example.de"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                  touched.email && errors.email
                    ? 'border-red-400 bg-red-50/50'
                    : 'border-slate-300'
                }`}
              />
            </div>
            {touched.email && errors.email && (
              <p className="text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
            <p className="text-[10px] text-slate-400">
              An diese Adresse wird der digitale Abmeldenachweis (PDF) zugestellt.
            </p>
          </div>

          {/* Telefonnummer */}
          <div className="space-y-1.5">
            <label htmlFor="customer-phone" className="text-xs font-bold text-slate-800 block">
              Telefonnummer <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="customer-phone"
                type="tel"
                required
                value={customer.phone}
                onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                onBlur={() => handleBlur('phone')}
                placeholder="+49 170 1234567"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                  touched.phone && errors.phone
                    ? 'border-red-400 bg-red-50/50'
                    : 'border-slate-300'
                }`}
              />
            </div>
            {touched.phone && errors.phone && (
              <p className="text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Adresse: Straße & Hausnummer */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Straße */}
          <div className="sm:col-span-8 space-y-1.5">
            <label htmlFor="customer-street" className="text-xs font-bold text-slate-800 block">
              Straße <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="customer-street"
                type="text"
                required
                value={customer.street}
                onChange={(e) => setCustomer(prev => ({ ...prev, street: e.target.value }))}
                onBlur={() => handleBlur('street')}
                placeholder="Friedrichstraße"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                  touched.street && errors.street
                    ? 'border-red-400 bg-red-50/50'
                    : 'border-slate-300'
                }`}
              />
            </div>
            {touched.street && errors.street && (
              <p className="text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.street}</span>
              </p>
            )}
          </div>

          {/* Hausnummer */}
          <div className="sm:col-span-4 space-y-1.5">
            <label htmlFor="customer-housenumber" className="text-xs font-bold text-slate-800 block">
              Hausnummer <span className="text-red-500">*</span>
            </label>
            <input
              id="customer-housenumber"
              type="text"
              required
              value={customer.houseNumber}
              onChange={(e) => setCustomer(prev => ({ ...prev, houseNumber: e.target.value }))}
              onBlur={() => handleBlur('houseNumber')}
              placeholder="42a"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                touched.houseNumber && errors.houseNumber
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-slate-300'
              }`}
            />
            {touched.houseNumber && errors.houseNumber && (
              <p className="text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.houseNumber}</span>
              </p>
            )}
          </div>
        </div>

        {/* Adresse: PLZ & Ort */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* PLZ */}
          <div className="sm:col-span-4 space-y-1.5">
            <label htmlFor="customer-plz" className="text-xs font-bold text-slate-800 block">
              PLZ (5 Ziffern) <span className="text-red-500">*</span>
            </label>
            <input
              id="customer-plz"
              type="text"
              maxLength={5}
              required
              value={customer.postalCode}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '');
                setCustomer(prev => ({ ...prev, postalCode: cleaned }));
              }}
              onBlur={() => handleBlur('postalCode')}
              placeholder="10117"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-mono text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                touched.postalCode && errors.postalCode
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-slate-300'
              }`}
            />
            {touched.postalCode && errors.postalCode && (
              <p className="text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.postalCode}</span>
              </p>
            )}
          </div>

          {/* Ort */}
          <div className="sm:col-span-8 space-y-1.5">
            <label htmlFor="customer-city" className="text-xs font-bold text-slate-800 block">
              Ort <span className="text-red-500">*</span>
            </label>
            <input
              id="customer-city"
              type="text"
              required
              value={customer.city}
              onChange={(e) => setCustomer(prev => ({ ...prev, city: e.target.value }))}
              onBlur={() => handleBlur('city')}
              placeholder="Berlin"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                touched.city && errors.city
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-slate-300'
              }`}
            />
            {touched.city && errors.city && (
              <p className="text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.city}</span>
              </p>
            )}
          </div>
        </div>

        {/* Optional IBAN for Kfz-Steuer refund */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="customer-iban" className="text-xs font-bold text-slate-800 block">
              IBAN für eventuelle Kfz-Steuer-Rückerstattung (optional)
            </label>
            <span className="text-[10px] text-slate-400">Hauptzollamt</span>
          </div>
          <div className="relative">
            <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="customer-iban"
              type="text"
              value={customer.ibanForTaxRefund || ''}
              onChange={(e) => {
                const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                setCustomer(prev => ({ ...prev, ibanForTaxRefund: val }));
              }}
              placeholder="DE89 3704 0044 0532 0130 00"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono tracking-wider text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Zu viel gezahlte Kfz-Steuer wird Ihnen vom zuständigen Hauptzollamt automatisch erstattet.
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-2 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-xl border border-slate-300 font-semibold text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zu Schritt 4</span>
        </button>

        <button
          type="submit"
          id="btn-step5-next"
          disabled={!isFormValid}
          className={`px-7 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
            isFormValid
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>Weiter zu Schritt 6: Zusammenfassung</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
