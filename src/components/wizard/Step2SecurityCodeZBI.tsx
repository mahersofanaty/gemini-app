import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight,
  SlidersHorizontal,
  Info,
  Sparkles
} from 'lucide-react';
import { SecurityCodesData } from '../../types';
import { validateZBISecurityCode } from '../../utils/securityCrypto';

interface Step2SecurityCodeZBIProps {
  securityCodes: SecurityCodesData;
  setSecurityCodes: React.Dispatch<React.SetStateAction<SecurityCodesData>>;
  onNext: () => void;
  onBack: () => void;
}

export const Step2SecurityCodeZBI: React.FC<Step2SecurityCodeZBIProps> = ({
  securityCodes,
  setSecurityCodes,
  onNext,
  onBack,
}) => {
  // Masked by default
  const [isMasked, setIsMasked] = useState<boolean>(true);
  const [isRuleConfigOpen, setIsRuleConfigOpen] = useState<boolean>(false);
  const [touched, setTouched] = useState<boolean>(false);
  const [simulatedScratch, setSimulatedScratch] = useState<boolean>(false);

  // Active validation rule (7 or 8 alphanumeric characters)
  const validationRuleLength = securityCodes.validationRuleLength || 7;

  const validation = validateZBISecurityCode(securityCodes.zbISecurityCode, {
    requiredLength: validationRuleLength,
  });

  const handleInputChange = (val: string) => {
    // Only permit alphanumeric characters, convert to uppercase
    const cleaned = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setSecurityCodes(prev => ({
      ...prev,
      zbISecurityCode: cleaned,
    }));
    setTouched(true);
  };

  const handleRuleChange = (length: 7 | 8) => {
    setSecurityCodes(prev => ({
      ...prev,
      validationRuleLength: length,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (validation.isValid) {
      onNext();
    }
  };

  const applyDemoCode = () => {
    setSecurityCodes(prev => ({
      ...prev,
      zbISecurityCode: 'A7B3X9K',
    }));
    setSimulatedScratch(true);
    setTouched(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" id="step2-zbi-form">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
          <ShieldCheck className="w-4 h-4" />
          <span>Schritt 2 von 6 &bull; Zulassungsbescheinigung Teil I</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mt-1">
          Sicherheitscode der Zulassungsbescheinigung Teil I
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Legen Sie das grüne Rubbelfeld auf der Rückseite Ihres Fahrzeugscheins vorsichtig frei und tragen Sie den darunter befindlichen Sicherheitscode ein.
        </p>
      </div>

      {/* Visual Instruction Diagram (No camera, 100% manual entry schematic) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Position des Sicherheitscodes auf dem Fahrzeugschein</span>
          </div>
          <button
            type="button"
            onClick={applyDemoCode}
            className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Beispielcode einsetzen</span>
          </button>
        </div>

        {/* Schematic SVG/CSS diagram of Zulassungsbescheinigung Teil I */}
        <div className="bg-emerald-900/10 border-2 border-emerald-600/30 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-xs text-slate-700 max-w-sm">
              <p className="font-bold text-slate-900 text-sm">
                Rückseite der Zulassungsbescheinigung Teil I:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                <li>Suchen Sie das markierte grüne Feld <em>"Sicherheitscode"</em>.</li>
                <li>Rubbeln Sie die Beschichtung vorsichtig mit einer Münze ab.</li>
                <li>Geben Sie den zum Vorschein kommenden 7-stelligen Code manuell ein.</li>
              </ul>
            </div>

            {/* Interactive Schematic Badge Card */}
            <div className="bg-white border-2 border-emerald-600 rounded-xl p-4 shadow-sm w-full sm:w-64 space-y-2 text-center select-none">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                BUNDESREPUBLIK DEUTSCHLAND
              </div>
              <div className="text-xs font-bold text-slate-800">
                Zulassungsbescheinigung Teil I
              </div>
              <div className="py-2">
                <div 
                  onClick={() => setSimulatedScratch(prev => !prev)}
                  className={`p-3 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
                    simulatedScratch || securityCodes.zbISecurityCode
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                      : 'border-amber-400 bg-amber-50/80 text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                    Rubbelfeld
                  </div>
                  <div className="font-mono font-black text-sm tracking-widest">
                    {simulatedScratch || securityCodes.zbISecurityCode 
                      ? (securityCodes.zbISecurityCode || 'A7B3X9K') 
                      : '░ ░ ░ ░ ░ ░ ░'}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    {simulatedScratch || securityCodes.zbISecurityCode 
                      ? '✓ Freigelegt' 
                      : 'Hier vorsichtig freirubbeln'}
                  </div>
                </div>
              </div>
              <div className="text-[9px] text-slate-400">
                Dokumentensicherheit § 15a FZV
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <label 
              htmlFor="zbi-security-code-input" 
              className="text-sm font-bold text-slate-900 block"
            >
              Sicherheitscode der Zulassungsbescheinigung Teil I <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Genau {validationRuleLength} alphanumerische Zeichen (z.B. A7B3X9K)
            </p>
          </div>

          {/* Configurable validation rule toggle */}
          <button
            type="button"
            onClick={() => setIsRuleConfigOpen(prev => !prev)}
            className="text-xs text-slate-600 hover:text-blue-600 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Validierungsregeln ({validationRuleLength} Zeichen)</span>
          </button>
        </div>

        {/* Validation Rule Drawer / Options */}
        {isRuleConfigOpen && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-800 block">
              Konfigurierbare Prüfregel für den ZB I Sicherheitscode:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleRuleChange(7)}
                className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                  validationRuleLength === 7
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                7 Zeichen (Standard i-KfZ ab 2015)
              </button>
              <button
                type="button"
                onClick={() => handleRuleChange(8)}
                className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                  validationRuleLength === 8
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                8 Zeichen (Erweiterte Sonderformate)
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Regel: Nur Großbuchstaben (A–Z) und Ziffern (0–9). Keine Leerzeichen oder Sonderzeichen.
            </p>
          </div>
        )}

        {/* Input with Masked Toggle */}
        <div className="space-y-2">
          <div className="relative">
            <div className="absolute left-3.5 top-3.5 text-slate-400">
              <Lock className="w-4 h-4" />
            </div>

            <input
              id="zbi-security-code-input"
              type={isMasked ? 'password' : 'text'}
              autoComplete="off"
              required
              maxLength={validationRuleLength}
              value={securityCodes.zbISecurityCode}
              onChange={(e) => handleInputChange(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder={`Genau ${validationRuleLength} Zeichen (z.B. A7B3X9K)`}
              className={`w-full pl-10 pr-24 py-3.5 bg-slate-50 border rounded-xl font-mono text-base tracking-widest text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors ${
                touched && !validation.isValid
                  ? 'border-red-400 bg-red-50/50'
                  : securityCodes.zbISecurityCode && validation.isValid
                    ? 'border-emerald-500 bg-emerald-50/30'
                    : 'border-slate-300'
              }`}
            />

            {/* Show/Hide button */}
            <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
              <button
                type="button"
                id="toggle-mask-zbi-btn"
                onClick={() => setIsMasked(prev => !prev)}
                aria-label={isMasked ? 'Code im Klartext anzeigen' : 'Code maskieren'}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                title={isMasked ? 'Code anzeigen' : 'Code verbergen'}
              >
                {isMasked ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>

              <span className="text-xs font-mono text-slate-400 pr-2">
                {securityCodes.zbISecurityCode.length}/{validationRuleLength}
              </span>
            </div>
          </div>

          {/* Validation Feedback Messages */}
          {touched && !validation.isValid && (
            <p className="text-xs text-red-600 flex items-center gap-1 pt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{validation.errorMessage}</span>
            </p>
          )}

          {securityCodes.zbISecurityCode && validation.isValid && (
            <p className="text-xs text-emerald-700 flex items-center gap-1 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Sicherheitscode formal gültig ({validationRuleLength} Zeichen).</span>
            </p>
          )}
        </div>

        {/* Security & Privacy Commitment */}
        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Datenschutz & Verschlüsselung:</span>
            <p className="text-[11px] text-blue-800 leading-snug">
              Ihr Sicherheitscode wird standardmäßig maskiert dargestellt, im Ruhezustand (at-rest) mit AES-256 verschlüsselt gespeichert und in System-Logs niemals im Klartext erfasst.
            </p>
          </div>
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
          <span>Zurück zu Schritt 1</span>
        </button>

        <button
          type="submit"
          id="btn-step2-next"
          disabled={!validation.isValid}
          className={`px-7 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
            validation.isValid
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>Weiter zu Schritt 3: Stempelplaketten</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
