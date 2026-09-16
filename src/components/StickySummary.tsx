import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { VehicleData, PlateReservationData } from '../types';

interface StickySummaryProps {
  vehicle: VehicleData;
  reservation: PlateReservationData;
  serviceFee?: number;
  authorityFee?: number;
  reservationFee?: number;
}

export const StickySummary: React.FC<StickySummaryProps> = ({
  vehicle,
  reservation,
  serviceFee = 19.90,
  authorityFee = 2.70,
  reservationFee = 12.80,
}) => {
  const { t } = useLanguage();
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const effectiveReservationFee = reservation.reservePlate ? reservationFee : 0.00;
  const total = serviceFee + authorityFee + effectiveReservationFee;
  const vatAmount = (serviceFee * 0.19) / 1.19; // 19% German VAT within the gross service fee

  const hasPlate = Boolean(vehicle.licensePlateNormalized || vehicle.licensePlate || (vehicle.licensePlateCity && vehicle.licensePlateNumbers));
  const formattedPlate = vehicle.licensePlateNormalized 
    || vehicle.licensePlate 
    || (hasPlate ? `${vehicle.licensePlateCity} ${vehicle.licensePlateLetters} ${vehicle.licensePlateNumbers}`.toUpperCase() : 'Noch nicht erfasst');

  return (
    <>
      {/* Desktop Sticky Sidebar Card */}
      <aside aria-label="Bestellübersicht" className="hidden lg:block sticky top-24 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          {/* Header */}
          <div className="border-b border-slate-100 pb-4 mb-4">
            <span className="text-[11px] font-bold tracking-wider uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              Kostenaufstellung
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-2">
              {t.priceBreakdownTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Feste Preise ohne versteckte Aufschläge
            </p>
          </div>

          {/* Vehicle summary chip if available */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 mb-5">
            <div className="text-[11px] text-slate-500 font-medium">Fahrzeug:</div>
            <div className="font-mono font-bold text-sm text-slate-900 mt-0.5 flex items-center justify-between">
              <span>{formattedPlate}</span>
              {hasPlate && (
                <span className="text-[10px] font-sans px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                  Erfasst
                </span>
              )}
            </div>
            {vehicle.vin && (
              <div className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                FIN: {vehicle.vin}
              </div>
            )}
          </div>

          {/* Line items with strict distinction */}
          <div className="space-y-3.5 text-xs text-slate-600">
            {/* 1. Our Service Fee */}
            <div className="pb-2 border-b border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">
                    {t.priceServiceFeeLabel}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {t.priceServiceFeeDetail}
                  </div>
                </div>
                <div className="font-mono font-bold text-sm text-slate-900 whitespace-nowrap">
                  {serviceFee.toFixed(2).replace('.', ',')} €
                </div>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Darin enthalten: 19% MwSt. ({vatAmount.toFixed(2).replace('.', ',')} €)
              </div>
            </div>

            {/* 2. Official Authority Fee */}
            <div className="pb-2 border-b border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-slate-900">
                    {t.priceAuthorityFeeLabel}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {t.priceAuthorityFeeDetail}
                  </div>
                </div>
                <div className="font-mono font-bold text-slate-900 whitespace-nowrap">
                  {authorityFee.toFixed(2).replace('.', ',')} €
                </div>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Gebührenordnung für Maßnahmen im Straßenverkehr (GebOSt)
              </div>
            </div>

            {/* 3. Optional Reservation Fee */}
            {reservation.reservePlate ? (
              <div className="pb-2 border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {t.priceReservationFeeLabel}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Amtliche Reservierungsgebühr ({reservation.reservationDurationMonths} Mon.)
                    </div>
                  </div>
                  <div className="font-mono font-bold text-slate-900 whitespace-nowrap">
                    {reservationFee.toFixed(2).replace('.', ',')} €
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 flex justify-between py-1">
                <span>Kennzeichen-Reservierung:</span>
                <span className="italic">Nicht gewählt (0,00 €)</span>
              </div>
            )}
          </div>

          {/* Total Amount */}
          <div className="mt-5 pt-4 border-t-2 border-slate-200">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-base font-extrabold text-slate-900">
                  {t.priceTotalLabel}
                </span>
                <span className="block text-[11px] text-slate-500">
                  {t.priceVatIncluded}
                </span>
              </div>
              <span className="text-2xl font-black text-blue-700 font-mono">
                {total.toFixed(2).replace('.', ',')} €
              </span>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5 text-xs text-slate-500">
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sofortige Übermittlung ans KBA</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Automatischer Abmeldebescheid (PDF)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>SSL 256-Bit Banken-Verschlüsselung</span>
            </div>
          </div>

          {/* Private Commercial Provider Note */}
          <div className="mt-4 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-900 leading-snug">
            <strong>Gewerblicher Anbieter:</strong> Servicepauschale 19,90 € für die Online-Abwicklung. Kein amtliches Portal.
          </div>
        </div>
      </aside>

      {/* Mobile Collapsible Bottom Sticky Bar */}
      <aside aria-label="Mobile Bestellübersicht" className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-2xl">
        {/* Expandable details */}
        {mobileExpanded && (
          <div className="p-4 bg-slate-50 border-b border-slate-200 max-h-64 overflow-y-auto space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-700">
              <span>{t.priceServiceFeeLabel}:</span>
              <span className="font-mono font-bold">{serviceFee.toFixed(2).replace('.', ',')} €</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>{t.priceAuthorityFeeLabel}:</span>
              <span className="font-mono font-bold">{authorityFee.toFixed(2).replace('.', ',')} €</span>
            </div>
            {reservation.reservePlate && (
              <div className="flex justify-between text-slate-700">
                <span>{t.priceReservationFeeLabel}:</span>
                <span className="font-mono font-bold">{reservationFee.toFixed(2).replace('.', ',')} €</span>
              </div>
            )}
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
              Privater Dienstleister · Alle Beträge inkl. MwSt.
            </div>
          </div>
        )}

        {/* Compact bottom summary bar */}
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMobileExpanded(!mobileExpanded)}
            className="text-left focus:outline-none flex items-center gap-1.5"
          >
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Gesamtbetrag (inkl. Gebühren)
              </div>
              <div className="text-xl font-black text-blue-700 font-mono">
                {total.toFixed(2).replace('.', ',')} €
              </div>
            </div>
            {mobileExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
          </button>

          <div className="text-right text-[11px] text-slate-500">
            <div>19,90 € Servicegebühr</div>
            <div>+ 2,70 € Behörde</div>
          </div>
        </div>
      </aside>
    </>
  );
};
