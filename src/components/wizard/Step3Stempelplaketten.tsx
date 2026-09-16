import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import { SecurityCodesData, VehicleData, PlateConfiguration } from '../../types';
import { validateBadgeSecurityCode } from '../../utils/securityCrypto';

interface Step3StempelplakettenProps {
  vehicle: VehicleData;
  setVehicle: React.Dispatch<React.SetStateAction<VehicleData>>;
  securityCodes: SecurityCodesData;
  setSecurityCodes: React.Dispatch<React.SetStateAction<SecurityCodesData>>;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Stempelplaketten: React.FC<Step3StempelplakettenProps> = ({
  vehicle,
  setVehicle,
  securityCodes,
  setSecurityCodes,
  onNext,
  onBack,
}) => {
  // Masked states
  const [maskFront, setMaskFront] = useState<boolean>(true);
  const [maskRear, setMaskRear] = useState<boolean>(true);
  const [maskSingle, setMaskSingle] = useState<boolean>(true);

  const [touched, setTouched] = useState({
    front: false,
    rear: false,
    single: false,
    confirmation: false,
  });

  const isSinglePlate = vehicle.plateConfiguration === 'single_rear' || vehicle.vehicleType === 'motorrad' || vehicle.vehicleType === 'anhaenger';

  // Validations
  const frontValidation = isSinglePlate 
    ? { isValid: true, normalized: '' }
    : validateBadgeSecurityCode(securityCodes.frontPlateCode, 'Kennzeichen vorne');

  const rearValidation = isSinglePlate
    ? { isValid: true, normalized: '' }
    : validateBadgeSecurityCode(securityCodes.rearPlateCode, 'Kennzeichen hinten');

  const singleValidation = !isSinglePlate
    ? { isValid: true, normalized: '' }
    : validateBadgeSecurityCode(securityCodes.singlePlateCode || securityCodes.rearPlateCode, 'Kennzeichen (hinten)');

  const isFormValid = isSinglePlate
    ? singleValidation.isValid && securityCodes.confirmedLabelsScratched
    : frontValidation.isValid && rearValidation.isValid && securityCodes.confirmedLabelsScratched;

  const handleFrontChange = (val: string) => {
    const cleaned = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setSecurityCodes(prev => ({ ...prev, frontPlateCode: cleaned }));
    setTouched(prev => ({ ...prev, front: true }));
  };

  const handleRearChange = (val: string) => {
    const cleaned = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setSecurityCodes(prev => ({ ...prev, rearPlateCode: cleaned }));
    setTouched(prev => ({ ...prev, rear: true }));
  };

  const handleSingleChange = (val: string) => {
    const cleaned = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setSecurityCodes(prev => ({ 
      ...prev, 
      singlePlateCode: cleaned,
      rearPlateCode: cleaned // synchronize for backend compatibility
    }));
    setTouched(prev => ({ ...prev, single: true }));
  };

  const handlePlateConfigChange = (config: PlateConfiguration) => {
    setVehicle(prev => ({
      ...prev,
      plateConfiguration: config,
      vehicleType: config === 'single_rear' ? 'motorrad' : prev.vehicleType,
    }));
  };

  const handleAutofillDemoPlates = () => {
    if (isSinglePlate) {
      setSecurityCodes(prev => ({
        ...prev,
        singlePlateCode: '4X9',
        rearPlateCode: '4X9',
        confirmedLabelsScratched: true,
      }));
    } else {
      setSecurityCodes(prev => ({
        ...prev,
        frontPlateCode: '4X9',
        rearPlateCode: '8R2',
        confirmedLabelsScratched: true,
      }));
    }
    setTouched({ front: true, rear: true, single: true, confirmation: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ front: true, rear: true, single: true, confirmation: true });
    if (isFormValid) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" id="step3-stempelplaketten-form">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
          <ShieldCheck className="w-4 h-4" />
          <span>Schritt 3 von 6 &bull; Stempelplaketten</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mt-1">
          Sicherheitscodes der Stempelplaketten
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Geben Sie die freigelegten 3-stelligen Sicherheitscodes der amtlichen Siegelplaketten Ihrer Kennzeichenschilder ein.
        </p>
      </div>

      {/* Mandatory Explanation (Strict Prompt Requirement) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 text-xs sm:text-sm flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-900 block">Zweck der Erhebung:</span>
          <p className="font-semibold text-blue-900 leading-relaxed">
            "Die Sicherheitscodes werden benötigt, damit der Online-Abmeldevorgang durchgeführt werden kann."
          </p>
          <p className="text-xs text-blue-700">
            Über diese kryptografischen Codes verifiziert die zuständige Zulassungsstelle automatisiert, dass Sie im physischen Besitz der Kennzeichenschilder sind und diese ordnungsgemäß entwertet wurden.
          </p>
        </div>
      </div>

      {/* Special Plate Configurations Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Kennzeichen-Konfiguration für Ihr Fahrzeug
          </label>
          <button
            type="button"
            onClick={handleAutofillDemoPlates}
            className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Beispielcodes einsetzen</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handlePlateConfigChange('standard_two')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              !isSinglePlate
                ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="font-bold text-xs text-slate-900 block">
              Standard: 2 Kennzeichenschilder
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              PKW, LKW, Wohnmobil &bull; Plakette vorne & Plakette hinten
            </span>
          </button>

          <button
            type="button"
            onClick={() => handlePlateConfigChange('single_rear')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              isSinglePlate
                ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="font-bold text-xs text-slate-900 block">
              Nur 1 Kennzeichenschild (Hinten)
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Motorrad, Leichtkraftrad, Quad, Trike, Anhänger
            </span>
          </button>
        </div>
      </div>

      {/* Manual Input Fields for Codes */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
        {!isSinglePlate ? (
          /* Standard Two Plates */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Front Plate */}
            <div className="space-y-3">
              <div>
                <label 
                  htmlFor="front-plate-code-input" 
                  className="text-sm font-bold text-slate-900 block"
                >
                  Sicherheitscode Kennzeichen vorne <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-500">
                  3-stelliger Code der Stempelplakette auf dem vorderen Schild
                </span>
              </div>

              <div className="relative">
                <div className="absolute left-3.5 top-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="front-plate-code-input"
                  type={maskFront ? 'password' : 'text'}
                  required
                  maxLength={3}
                  value={securityCodes.frontPlateCode}
                  onChange={(e) => handleFrontChange(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, front: true }))}
                  placeholder="z.B. 4X9"
                  className={`w-full pl-10 pr-20 py-3 bg-slate-50 border rounded-xl font-mono text-base tracking-widest text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                    touched.front && !frontValidation.isValid
                      ? 'border-red-400 bg-red-50/50'
                      : securityCodes.frontPlateCode && frontValidation.isValid
                        ? 'border-emerald-500 bg-emerald-50/30'
                        : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  id="toggle-mask-front-btn"
                  onClick={() => setMaskFront(prev => !prev)}
                  className="absolute right-3 top-3 p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                  title={maskFront ? 'Code anzeigen' : 'Code verbergen'}
                >
                  {maskFront ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {touched.front && !frontValidation.isValid && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{frontValidation.errorMessage}</span>
                </p>
              )}
            </div>

            {/* Rear Plate */}
            <div className="space-y-3">
              <div>
                <label 
                  htmlFor="rear-plate-code-input" 
                  className="text-sm font-bold text-slate-900 block"
                >
                  Sicherheitscode Kennzeichen hinten <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-500">
                  3-stelliger Code der Stempelplakette auf dem hinteren Schild
                </span>
              </div>

              <div className="relative">
                <div className="absolute left-3.5 top-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="rear-plate-code-input"
                  type={maskRear ? 'password' : 'text'}
                  required
                  maxLength={3}
                  value={securityCodes.rearPlateCode}
                  onChange={(e) => handleRearChange(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, rear: true }))}
                  placeholder="z.B. 8R2"
                  className={`w-full pl-10 pr-20 py-3 bg-slate-50 border rounded-xl font-mono text-base tracking-widest text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                    touched.rear && !rearValidation.isValid
                      ? 'border-red-400 bg-red-50/50'
                      : securityCodes.rearPlateCode && rearValidation.isValid
                        ? 'border-emerald-500 bg-emerald-50/30'
                        : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  id="toggle-mask-rear-btn"
                  onClick={() => setMaskRear(prev => !prev)}
                  className="absolute right-3 top-3 p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                  title={maskRear ? 'Code anzeigen' : 'Code verbergen'}
                >
                  {maskRear ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {touched.rear && !rearValidation.isValid && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{rearValidation.errorMessage}</span>
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Single Plate (Motorcycle / Trailer) */
          <div className="space-y-3 max-w-md">
            <div>
              <label 
                htmlFor="single-plate-code-input" 
                className="text-sm font-bold text-slate-900 block"
              >
                Sicherheitscode Kennzeichen (hinten) <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-500">
                3-stelliger Code der Stempelplakette Ihres einteiligen Kennzeichens
              </span>
            </div>

            <div className="relative">
              <div className="absolute left-3.5 top-3.5 text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="single-plate-code-input"
                type={maskSingle ? 'password' : 'text'}
                required
                maxLength={3}
                value={securityCodes.singlePlateCode || securityCodes.rearPlateCode}
                onChange={(e) => handleSingleChange(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, single: true }))}
                placeholder="z.B. 4X9"
                className={`w-full pl-10 pr-20 py-3 bg-slate-50 border rounded-xl font-mono text-base tracking-widest text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                  touched.single && !singleValidation.isValid
                    ? 'border-red-400 bg-red-50/50'
                    : (securityCodes.singlePlateCode || securityCodes.rearPlateCode) && singleValidation.isValid
                      ? 'border-emerald-500 bg-emerald-50/30'
                      : 'border-slate-300'
                }`}
              />
              <button
                type="button"
                id="toggle-mask-single-btn"
                onClick={() => setMaskSingle(prev => !prev)}
                className="absolute right-3 top-3 p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                title={maskSingle ? 'Code anzeigen' : 'Code verbergen'}
              >
                {maskSingle ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            {touched.single && !singleValidation.isValid && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{singleValidation.errorMessage}</span>
              </p>
            )}
          </div>
        )}

        {/* Visual Schematic Instruction for Badges (Pure Manual, Zero camera/scan) */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-center p-1 shrink-0">
            <span className="text-[9px] font-bold text-amber-800 uppercase">Plakette</span>
            <span className="font-mono font-black text-xs text-amber-900">4X9</span>
            <span className="text-[8px] text-amber-600">3 Zeichen</span>
          </div>
          <div className="space-y-1 text-slate-600 text-xs">
            <p className="font-semibold text-slate-800">
              Anleitung zum Freilegen der Stempelplakette:
            </p>
            <p className="text-[11px] leading-relaxed">
              Die runden Zulassungsplaketten auf Ihren Kennzeichenschildern besitzen eine abziehbare oder freizurubbelnde Schutzschicht. Ziehen Sie diese vorsichtig ab, bis der 3-stellige Buchstabencode sichtbar wird.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Warning & Confirmation Box (Strict Prompt Requirement) */}
      <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
              Wichtiger gesetzlicher Warnhinweis:
            </span>
            <p className="text-xs sm:text-sm font-bold text-amber-950 leading-snug">
              "Bitte prüfen Sie alle Angaben sorgfältig. Nach dem Freilegen der Sicherheitscodes dürfen die Kennzeichenschilder nicht mehr für die Teilnahme am Straßenverkehr verwendet werden."
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              Mit dem Freilegen der Plaketten gelten die Kennzeichenschilder rechtlich als entwertet (§ 15a FZV). Eine Weiterfahrt auf öffentlichen Straßen ist ab diesem Zeitpunkt unzulässig.
            </p>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-amber-200/80">
          <input
            type="checkbox"
            id="checkbox-confirm-labels-scratched"
            checked={securityCodes.confirmedLabelsScratched}
            onChange={(e) => {
              setSecurityCodes(prev => ({
                ...prev,
                confirmedLabelsScratched: e.target.checked,
              }));
              setTouched(prev => ({ ...prev, confirmation: true }));
            }}
            className="mt-1 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
          />
          <span className="text-xs font-semibold text-amber-950">
            Ich habe den Warnhinweis gelesen und bestätige, dass ich die Stempelplaketten freigelegt bzw. abgezogen habe und mir bewusst bin, dass die Kennzeichenschilder damit entwertet sind. <span className="text-red-600">*</span>
          </span>
        </label>

        {touched.confirmation && !securityCodes.confirmedLabelsScratched && (
          <p className="text-xs text-red-600 flex items-center gap-1 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Bitte bestätigen Sie diesen Hinweis, um mit dem Abmeldeauftrag fortzufahren.</span>
          </p>
        )}
      </div>

      {/* Commercial Provider Notice (Strict Prompt Requirement: Do not claim government authority) */}
      <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <strong>Hinweis zum Dienstleister:</strong> KFZ Abmelden Online ist ein privates Dienstleistungsunternehmen und keine staatliche Behörde. Wir verarbeiten Ihre eingegebenen Daten und übermitteln den Außerbetriebsetzungsantrag in Ihrem Namen über die bundesweite i-KfZ-Schnittstelle an Ihre örtliche Zulassungsbehörde.
      </div>

      {/* Navigation Buttons */}
      <div className="pt-2 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-xl border border-slate-300 font-semibold text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zu Schritt 2</span>
        </button>

        <button
          type="submit"
          id="btn-step3-next"
          disabled={!isFormValid}
          className={`px-7 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
            isFormValid
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>Weiter zu Schritt 4: Kennzeichenreservierung</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
