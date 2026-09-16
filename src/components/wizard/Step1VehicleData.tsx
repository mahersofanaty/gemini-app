import React, { useState, useEffect } from 'react';
import { 
  Car, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  Info, 
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import { VehicleData, PlateConfiguration } from '../../types';
import { 
  parseAndNormalizePlate, 
  validateGermanVIN, 
  validateZBIssueDate,
  GERMAN_DISTRICTS_MAP 
} from '../../utils/plateValidation';

interface Step1VehicleDataProps {
  vehicle: VehicleData;
  setVehicle: React.Dispatch<React.SetStateAction<VehicleData>>;
  onNext: () => void;
}

export const Step1VehicleData: React.FC<Step1VehicleDataProps> = ({
  vehicle,
  setVehicle,
  onNext,
}) => {
  // Local validation states & touch tracking
  const [touched, setTouched] = useState({
    licensePlate: false,
    vin: false,
    issueDateZBI: false,
    registrationDistrict: false,
  });

  const [rawPlateInput, setRawPlateInput] = useState(vehicle.licensePlate || vehicle.licensePlateNormalized || '');
  const [plateResult, setPlateResult] = useState(parseAndNormalizePlate(rawPlateInput));

  // Parse plate on input change
  useEffect(() => {
    const result = parseAndNormalizePlate(rawPlateInput);
    setPlateResult(result);

    if (result.isValid) {
      setVehicle(prev => ({
        ...prev,
        licensePlate: rawPlateInput,
        licensePlateNormalized: result.normalized,
        licensePlateCity: result.city,
        licensePlateLetters: result.letters,
        licensePlateNumbers: result.numbers,
        licensePlateSuffix: result.suffix,
        // Auto-fill district if not yet customized
        registrationDistrict: prev.registrationDistrict || result.suggestedDistrict,
      }));
    } else {
      setVehicle(prev => ({
        ...prev,
        licensePlate: rawPlateInput,
        licensePlateNormalized: '',
      }));
    }
  }, [rawPlateInput, setVehicle]);

  // VIN validation
  const vinValidation = vehicle.vinNotRequired 
    ? { isValid: true } 
    : vehicle.vin 
      ? validateGermanVIN(vehicle.vin)
      : { isValid: true }; // optional if empty or user selects not required

  // ZB I Date validation
  const dateValidation = vehicle.issueDateZBI 
    ? validateZBIssueDate(vehicle.issueDateZBI)
    : { isValid: false, errorMessage: 'Bitte geben Sie das Ausstellungsdatum an.' };

  // District validation
  const isDistrictValid = vehicle.registrationDistrict.trim().length >= 2;

  // Overall step validation
  const isStepValid = plateResult.isValid && 
    (vehicle.vinNotRequired || (vehicle.vin.trim().length === 0 || vinValidation.isValid)) &&
    dateValidation.isValid && 
    isDistrictValid;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      licensePlate: true,
      vin: true,
      issueDateZBI: true,
      registrationDistrict: true,
    });

    if (!plateResult.isValid) {
      return;
    }
    if (!vehicle.vinNotRequired && vehicle.vin && !vinValidation.isValid) {
      return;
    }
    if (!dateValidation.isValid) {
      return;
    }
    if (!isDistrictValid) {
      return;
    }

    onNext();
  };

  // Quick preset test plates
  const setExamplePlate = (plate: string) => {
    setRawPlateInput(plate);
    setTouched(prev => ({ ...prev, licensePlate: true }));
  };

  return (
    <form onSubmit={handleContinue} className="space-y-8" id="step1-vehicle-form">
      {/* Header Info */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
          <Car className="w-4 h-4" />
          <span>Schritt 1 von 6 &bull; Fahrzeugdaten</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mt-1">
          Fahrzeug- und Kennzeichendaten erfassen
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Geben Sie die Daten Ihres Fahrzeugs manuell ein. Ein Scan oder Bildupload ist aus Datenschutzgründen nicht erforderlich.
        </p>
      </div>

      {/* Field 1: Kennzeichen */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="license-plate-input" className="text-sm font-bold text-slate-900">
            1. Amtliches Kennzeichen <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Beispiele:</span>
            <button
              type="button"
              onClick={() => setExamplePlate('D-AB 123')}
              className="text-blue-600 hover:underline font-mono font-medium"
            >
              D-AB 123
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => setExamplePlate('ME-XY 1234')}
              className="text-blue-600 hover:underline font-mono font-medium"
            >
              ME-XY 1234
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => setExamplePlate('B-AB 123')}
              className="text-blue-600 hover:underline font-mono font-medium"
            >
              B-AB 123
            </button>
          </div>
        </div>

        <div>
          <input
            id="license-plate-input"
            type="text"
            required
            value={rawPlateInput}
            onChange={(e) => {
              setRawPlateInput(e.target.value);
              setTouched(prev => ({ ...prev, licensePlate: true }));
            }}
            onBlur={() => setTouched(prev => ({ ...prev, licensePlate: true }))}
            placeholder="z.B. D-AB 123, ME-XY 1234 oder B-AB 123"
            className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl font-mono text-base tracking-wider uppercase text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
              touched.licensePlate && !plateResult.isValid 
                ? 'border-red-400 bg-red-50/50' 
                : plateResult.isValid 
                  ? 'border-emerald-500 bg-emerald-50/30' 
                  : 'border-slate-300'
            }`}
          />
          
          {/* Real-time German plate normalizer confirmation */}
          {rawPlateInput.trim().length > 0 && (
            <div className="mt-3 p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border-slate-200">
              <div className="flex items-center gap-2.5">
                {plateResult.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                )}
                <div className="text-xs">
                  <span className="text-slate-500 block">Normalisiertes Kennzeichen (amtliches Format):</span>
                  {plateResult.isValid ? (
                    <span className="font-mono font-black text-sm text-slate-900">
                      {plateResult.normalized}
                    </span>
                  ) : (
                    <span className="text-amber-700 font-medium">
                      {plateResult.errorMessage || 'Bitte vollständiges Kennzeichen eingeben.'}
                    </span>
                  )}
                </div>
              </div>

              {/* Graphical German Euro-Plate Preview */}
              {plateResult.isValid && (
                <div className="inline-flex items-center bg-white border-2 border-slate-900 rounded-lg px-2.5 py-1 font-mono font-black text-slate-900 shadow-xs self-start sm:self-auto">
                  <div className="w-4 h-6 bg-blue-700 rounded-xs flex flex-col items-center justify-between py-0.5 mr-2 text-[7px] text-white select-none">
                    <span className="leading-none text-yellow-300">★</span>
                    <span className="font-bold leading-none">D</span>
                  </div>
                  <span className="text-sm tracking-wider mr-2">{plateResult.city}</span>
                  <div className="w-3 h-3 rounded-full border border-slate-400 mr-2 bg-slate-100 flex items-center justify-center text-[6px] text-slate-500">
                    ◎
                  </div>
                  <span className="text-sm tracking-wider">
                    {plateResult.letters} {plateResult.numbers}
                    {plateResult.suffix ? ` ${plateResult.suffix}` : ''}
                  </span>
                </div>
              )}
            </div>
          )}

          {touched.licensePlate && !plateResult.isValid && rawPlateInput.trim().length === 0 && (
            <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Das Kennzeichen ist ein Pflichtfeld.</span>
            </p>
          )}
        </div>
      </div>

      {/* Field 2: FIN/VIN (Fahrzeug-Identifikationsnummer) - Optional Workflow */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <label htmlFor="vin-input" className="text-sm font-bold text-slate-900 block">
              2. Fahrzeug-Identifikationsnummer (FIN / VIN)
            </label>
            <span className="text-xs text-slate-500">
              Optional, falls für Ihren speziellen behördlichen Abmeldevorgang nicht erforderlich
            </span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
            {vehicle.vinNotRequired ? 'Als optional markiert' : 'Empfohlen'}
          </span>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input
              id="vin-input"
              type="text"
              disabled={vehicle.vinNotRequired}
              value={vehicle.vin}
              maxLength={17}
              onChange={(e) => {
                const val = e.target.value.toUpperCase().replace(/\s/g, '');
                setVehicle(prev => ({ ...prev, vin: val }));
                setTouched(prev => ({ ...prev, vin: true }));
              }}
              onBlur={() => setTouched(prev => ({ ...prev, vin: true }))}
              placeholder={vehicle.vinNotRequired ? 'FIN für diesen Vorgang nicht benötigt' : 'z.B. WBA3A51090F184920 (17 Zeichen)'}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl font-mono text-sm tracking-wider uppercase text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                vehicle.vinNotRequired 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' 
                  : touched.vin && vehicle.vin && !vinValidation.isValid
                    ? 'border-red-400 bg-red-50/50'
                    : vehicle.vin && vinValidation.isValid
                      ? 'border-emerald-500 bg-emerald-50/30'
                      : 'border-slate-300'
              }`}
            />
            {!vehicle.vinNotRequired && (
              <span className="absolute right-3.5 top-3.5 text-xs font-mono text-slate-400">
                {vehicle.vin.length}/17
              </span>
            )}
          </div>

          {/* Optional checkbox toggle */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="vin-not-required-checkbox"
              checked={vehicle.vinNotRequired}
              onChange={(e) => {
                setVehicle(prev => ({
                  ...prev,
                  vinNotRequired: e.target.checked,
                  vin: e.target.checked ? '' : prev.vin,
                }));
              }}
              className="mt-0.5 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            <div>
              <span className="font-semibold text-slate-900 block">
                FIN für diesen Abmeldevorgang nicht erforderlich oder liegt nicht vor
              </span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Bei Standard-Außerbetriebsetzungen über die i-KfZ-Stufe genügt in den meisten Zulassungsbezirken das Kennzeichen sowie der Sicherheitscode der ZB I.
              </p>
            </div>
          </label>

          {touched.vin && !vehicle.vinNotRequired && vehicle.vin && !vinValidation.isValid && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{vinValidation.errorMessage}</span>
            </p>
          )}
        </div>
      </div>

      {/* Field 3: Datum der Ausstellung der aktuellen Zulassungsbescheinigung Teil I */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <label htmlFor="issue-date-zbi-input" className="text-sm font-bold text-slate-900 block">
            3. Datum der Ausstellung der aktuellen Zulassungsbescheinigung Teil I <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Zu finden auf Seite 2 Ihres Fahrzeugscheins (unter Feld "Datum" neben der Stempelung). Muss ab dem <strong>01.01.2015</strong> sein.
          </p>
        </div>

        <div>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              id="issue-date-zbi-input"
              type="date"
              required
              min="2015-01-01"
              max={new Date().toISOString().split('T')[0]}
              value={vehicle.issueDateZBI}
              onChange={(e) => {
                setVehicle(prev => ({ ...prev, issueDateZBI: e.target.value }));
                setTouched(prev => ({ ...prev, issueDateZBI: true }));
              }}
              onBlur={() => setTouched(prev => ({ ...prev, issueDateZBI: true }))}
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                touched.issueDateZBI && !dateValidation.isValid 
                  ? 'border-red-400 bg-red-50/50' 
                  : vehicle.issueDateZBI && dateValidation.isValid
                    ? 'border-emerald-500 bg-emerald-50/30'
                    : 'border-slate-300'
              }`}
            />
          </div>

          {touched.issueDateZBI && !dateValidation.isValid && (
            <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{dateValidation.errorMessage}</span>
            </p>
          )}

          {vehicle.issueDateZBI && dateValidation.isValid && (
            <p className="text-xs text-emerald-700 mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Dokument ist für die digitale Online-Abmeldung qualifiziert (Ausstellung nach dem 01.01.2015).</span>
            </p>
          )}
        </div>
      </div>

      {/* Field 4: Zulassungsbezirk */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <label htmlFor="district-input" className="text-sm font-bold text-slate-900 block">
            4. Zulassungsbezirk (Zuständige Kfz-Zulassungsbehörde) <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Wird automatisch anhand des Kennzeichen-Kürzels ermittelt. Sie können die Angabe bei Bedarf anpassen.
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              id="district-input"
              type="text"
              required
              value={vehicle.registrationDistrict}
              onChange={(e) => {
                setVehicle(prev => ({ ...prev, registrationDistrict: e.target.value }));
                setTouched(prev => ({ ...prev, registrationDistrict: true }));
              }}
              onBlur={() => setTouched(prev => ({ ...prev, registrationDistrict: true }))}
              placeholder="z.B. Landeshauptstadt Düsseldorf oder Kreis Mettmann"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                touched.registrationDistrict && !isDistrictValid
                  ? 'border-red-400 bg-red-50/50'
                  : 'border-slate-300'
              }`}
            />
          </div>

          {touched.registrationDistrict && !isDistrictValid && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Bitte geben Sie den zuständigen Zulassungsbezirk an.</span>
            </p>
          )}
        </div>
      </div>

      {/* Vehicle Type & Plate Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <label className="text-sm font-bold text-slate-900 block">
          Fahrzeugtyp & Kennzeichen-Konfiguration
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setVehicle(prev => ({ ...prev, vehicleType: 'pkw', plateConfiguration: 'standard_two' }))}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              vehicle.plateConfiguration === 'standard_two' && vehicle.vehicleType === 'pkw'
                ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="font-bold text-xs text-slate-900 block">PKW / LKW (2 Schilder)</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Vorne & Hinten je eine Plakette</span>
          </button>

          <button
            type="button"
            onClick={() => setVehicle(prev => ({ ...prev, vehicleType: 'motorrad', plateConfiguration: 'single_rear' }))}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              vehicle.plateConfiguration === 'single_rear'
                ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="font-bold text-xs text-slate-900 block">Motorrad / Anhänger</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Nur 1 Schild (hinten)</span>
          </button>

          <button
            type="button"
            onClick={() => setVehicle(prev => ({ ...prev, vehicleType: 'pkw', plateConfiguration: 'electric' }))}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              vehicle.plateConfiguration === 'electric'
                ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="font-bold text-xs text-slate-900 block">E-Kennzeichen / Saison</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Sonderkennzeichen mit Zusatz</span>
          </button>
        </div>
      </div>

      {/* Action / Next Button */}
      <div className="pt-2 flex items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          {plateResult.isValid ? (
            <span className="text-emerald-700 font-medium">
              ✓ Bereit für Schritt 2: Sicherheitscode ZB I
            </span>
          ) : (
            <span>Bitte korrigieren Sie die markierten Pflichtangaben.</span>
          )}
        </div>

        <button
          type="submit"
          id="btn-step1-next"
          disabled={!isStepValid}
          className={`px-7 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
            isStepValid
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>Weiter zu Schritt 2</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
