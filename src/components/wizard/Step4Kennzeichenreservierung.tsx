import React from 'react';
import { 
  Bookmark, 
  Check, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Info, 
  Calendar, 
  KeyRound, 
  ShieldCheck,
  Building2 
} from 'lucide-react';
import { PlateReservationData, VehicleData } from '../../types';

interface Step4KennzeichenreservierungProps {
  vehicle: VehicleData;
  reservation: PlateReservationData;
  setReservation: React.Dispatch<React.SetStateAction<PlateReservationData>>;
  onNext: () => void;
  onBack: () => void;
}

export const Step4Kennzeichenreservierung: React.FC<Step4KennzeichenreservierungProps> = ({
  vehicle,
  reservation,
  setReservation,
  onNext,
  onBack,
}) => {
  const displayPlate = vehicle.licensePlateNormalized || vehicle.licensePlate || 'Ihr Kennzeichen';

  const handleSelectOption = (reserve: boolean) => {
    setReservation(prev => ({
      ...prev,
      reservePlate: reserve,
      reservationPin: reserve ? (prev.reservationPin || '1234') : '',
    }));
  };

  const handleDurationChange = (months: number) => {
    setReservation(prev => ({
      ...prev,
      reservationDurationMonths: months,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" id="step4-reservation-form">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
          <Bookmark className="w-4 h-4" />
          <span>Schritt 4 von 6 &bull; Kennzeichenreservierung</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mt-1">
          Bisheriges Kennzeichen reservieren
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Sichern Sie sich Ihr Kennzeichen für Ihr nächstes Fahrzeug oder eine spätere Wiederzulassung.
        </p>
      </div>

      {/* Main Question Card (Strict Prompt Requirement) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Kennzeichen: <span className="font-mono font-black text-slate-900 text-sm">{displayPlate}</span>
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
            Möchten Sie Ihr bisheriges Kennzeichen für eine spätere Wiederzulassung reservieren?
          </h3>
          <p className="text-xs text-slate-500">
            Wählen Sie eine der Optionen:
          </p>
        </div>

        {/* Options Grid: Ja / Nein */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
          {/* Option: Ja */}
          <button
            type="button"
            id="btn-reserve-yes"
            onClick={() => handleSelectOption(true)}
            className={`p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
              reservation.reservePlate
                ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className="font-black text-base text-slate-900">Ja</span>
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                reservation.reservePlate ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
              }`}>
                {reservation.reservePlate && <Check className="w-4 h-4" />}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-900 block">
                Kennzeichen reservieren
              </span>
              <span className="text-[11px] text-slate-500 block">
                Bleibt für Sie bei der Zulassungsstelle blockiert
              </span>
              <span className="text-xs font-bold text-slate-800 pt-1 block">
                +12,80 € <span className="text-[10px] font-normal text-slate-500">(amtliche GebOSt)</span>
              </span>
            </div>
          </button>

          {/* Option: Nein */}
          <button
            type="button"
            id="btn-reserve-no"
            onClick={() => handleSelectOption(false)}
            className={`p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
              !reservation.reservePlate
                ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className="font-black text-base text-slate-900">Nein</span>
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                !reservation.reservePlate ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
              }`}>
                {!reservation.reservePlate && <Check className="w-4 h-4" />}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 block">
                Keine Reservierung
              </span>
              <span className="text-[11px] text-slate-500 block">
                Kennzeichen wird für die Allgemeinheit freigegeben
              </span>
              <span className="text-xs font-bold text-emerald-700 pt-1 block">
                0,00 € <span className="text-[10px] font-normal text-slate-500">(keine Zusatzkosten)</span>
              </span>
            </div>
          </button>
        </div>

        {/* If Ja: Show Required Banner & Explanation (Strict Prompt Requirement) */}
        {reservation.reservePlate && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 sm:p-6 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-black uppercase tracking-wider">
                Status
              </span>
              <h4 className="text-base font-black text-blue-950">
                Kennzeichenreservierung gewünscht
              </h4>
            </div>

            {/* Strict Explanation Requirement */}
            <div className="p-4 rounded-xl bg-white border border-blue-100 space-y-2 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block">
                    Zuständigkeit der Zulassungsbehörde:
                  </span>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    Die tatsächliche Verfügbarkeit und die Dauer der Reservierung sind abhängig von der jeweils zuständigen Zulassungsbehörde Ihres Zulassungsbezirks ({vehicle.registrationDistrict || 'Ihre lokale Zulassungsstelle'}).
                  </p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Die amtliche Reservierungsfrist beträgt in den meisten Landkreisen und kreisfreien Städten zwischen 3 Monaten und bis zu 12 Monaten.
                  </p>
                </div>
              </div>
            </div>

            {/* Duration Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {[3, 6, 12].map((months) => (
                <button
                  key={months}
                  type="button"
                  onClick={() => handleDurationChange(months)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    reservation.reservationDurationMonths === months
                      ? 'border-blue-600 bg-white shadow-2xs font-bold text-blue-700'
                      : 'border-blue-200 bg-white/70 text-slate-700 hover:bg-white'
                  }`}
                >
                  <span className="text-xs block font-bold">{months} Monate</span>
                  <span className="text-[10px] text-slate-500">Gewünschter Zeitraum</span>
                </button>
              ))}
            </div>

            {/* Optional PIN for Re-Registration */}
            <div className="bg-white p-4 rounded-xl border border-blue-100 space-y-2">
              <label htmlFor="reservation-pin-input" className="text-xs font-bold text-slate-900 block">
                Sicherheits-PIN für die spätere Wiederzulassung (4-stellig)
              </label>
              <div className="relative max-w-xs">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="reservation-pin-input"
                  type="text"
                  maxLength={4}
                  value={reservation.reservationPin || ''}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, '');
                    setReservation(prev => ({ ...prev, reservationPin: cleaned }));
                  }}
                  placeholder="z.B. 1234"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono tracking-widest text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Diese PIN wird auf Ihrem Abmeldebescheid vermerkt und dient bei der nächsten Zulassung als Nachweis Ihrer Berechtigung.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="pt-2 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-xl border border-slate-300 font-semibold text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zu Schritt 3</span>
        </button>

        <button
          type="submit"
          id="btn-step4-next"
          className="px-7 py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer"
        >
          <span>Weiter zu Schritt 5: Halterdaten</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
