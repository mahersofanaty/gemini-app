import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, Clock, AlertCircle, Download, FileText, Building2, HelpCircle, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { OrderRecord, CurrentScreen } from '../types';

interface OrderStatusViewProps {
  setCurrentScreen: (screen: CurrentScreen) => void;
}

interface DisplayableOrderStatus {
  orderId: string;
  createdAt: string;
  status: string;
  licensePlate: string;
  vin?: string;
  registrationDistrict?: string;
  customerName?: string;
  customerEmail?: string;
  totalPrice?: number;
  paidAt?: string | null;
  completedAt?: string | null;
  ikfzReference?: string | null;
  paymentMethod?: string;
}

export const OrderStatusView: React.FC<OrderStatusViewProps> = ({ setCurrentScreen }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localOrders, setLocalOrders] = useState<OrderRecord[]>([]);
  const [foundStatus, setFoundStatus] = useState<DisplayableOrderStatus | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    // Load client-side stored orders
    try {
      const stored = localStorage.getItem('kfz_abmelden_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        setLocalOrders(parsed);
      }
    } catch (e) {
      console.error('Failed to read local orders:', e);
    }
  }, []);

  const executeSearch = async (queryRaw: string) => {
    const query = queryRaw.trim();
    if (!query) {
      setFoundStatus(null);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      // 1. First attempt: Query live backend API
      const apiResp = await fetch(`/api/orders/${encodeURIComponent(query.toUpperCase())}`);
      if (apiResp.ok) {
        const data = await apiResp.json();
        setFoundStatus({
          orderId: data.publicOrderId,
          createdAt: data.createdAt,
          status: data.status,
          licensePlate: data.licensePlate,
          registrationDistrict: data.registrationDistrict,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          totalPrice: data.pricing?.totalPrice,
          paidAt: data.paidAt,
          completedAt: data.completedAt,
          ikfzReference: data.ikfzReference,
        });
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('[OrderStatus] Backend query error, falling back to local records:', err);
    }

    // 2. Fallback: Search in client storage records
    const normalizedQuery = query.toUpperCase().replace(/\s|-/g, '');
    const localMatch = localOrders.find(o => {
      const idMatch = o.orderId.toUpperCase().includes(query.toUpperCase());
      const vinMatch = o.vehicle.vin && o.vehicle.vin.toUpperCase().includes(query.toUpperCase());
      const plateCombined = `${o.vehicle.licensePlateCity}${o.vehicle.licensePlateLetters}${o.vehicle.licensePlateNumbers}`.toUpperCase().replace(/\s|-/g, '');
      const plateMatch = plateCombined.includes(normalizedQuery);
      const emailMatch = o.customer.email.toLowerCase().includes(query.toLowerCase());
      return idMatch || vinMatch || plateMatch || emailMatch;
    });

    if (localMatch) {
      setFoundStatus({
        orderId: localMatch.orderId,
        createdAt: localMatch.createdAt,
        status: localMatch.status,
        licensePlate: localMatch.vehicle.licensePlateNormalized || `${localMatch.vehicle.licensePlateCity} ${localMatch.vehicle.licensePlateLetters} ${localMatch.vehicle.licensePlateNumbers}`,
        vin: localMatch.vehicle.vin,
        registrationDistrict: localMatch.vehicle.registrationDistrict || localMatch.authorityName,
        customerName: `${localMatch.customer.firstName} ${localMatch.customer.lastName}`,
        customerEmail: localMatch.customer.email,
        totalPrice: localMatch.pricing.totalAmount,
        paidAt: localMatch.deRegistrationTimestamp,
        completedAt: localMatch.status === 'erfolgreich_abgemeldet' ? localMatch.deRegistrationTimestamp : null,
        ikfzReference: localMatch.deRegistrationReference,
        paymentMethod: localMatch.paymentMethod,
      });
    } else {
      setFoundStatus(null);
    }

    setIsLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchTerm);
  };

  const handleQuickDemoClick = () => {
    // If local orders exist, use the first one, or search the sample
    const targetId = localOrders.length > 0 ? localOrders[0].orderId : 'KFA-2026-000001';
    setSearchTerm(targetId);
    executeSearch(targetId);
  };

  // Status visual classification strictly adhering to rules:
  // - Only display "Erfolgreich abgemeldet" when confirmed by authoritative system
  // - Otherwise display "Antrag wird geprüft" or "Manuelle Prüfung erforderlich."
  const isConfirmed = foundStatus?.status === 'erfolgreich_abgemeldet';
  const isReview = foundStatus?.status === 'manuelle_pruefung';
  const isRejected = foundStatus?.status === 'abgelehnt';
  const isPending = !isConfirmed && !isReview && !isRejected; // 'submitted_to_ikfz', 'eingereicht', etc.

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Search Box Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Offizieller Status-Check
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900" id="order-status-heading">
          {t.statusSearchTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Ermitteln Sie den aktuellen behördlichen Bearbeitungsstand Ihres Abmeldeantrags in Echtzeit.
        </p>
      </div>

      {/* Search Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <form onSubmit={handleSearch} className="space-y-4">
          <label htmlFor="search-order-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            {t.orderNumberLabel}, FIN oder Kennzeichen
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="search-order-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="z.B. KFA-2026-000001, B-MW 2026 oder Fahrgestellnummer"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              id="search-order-btn"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Prüfe Status...</span>
                </>
              ) : (
                <span>{t.btnCheckStatus}</span>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
            <span>Tipp: Verwenden Sie Ihre Auftragsnummer aus der Bestätigungs-E-Mail.</span>
            {localOrders.length > 0 && (
              <button
                type="button"
                id="quick-demo-search-btn"
                onClick={handleQuickDemoClick}
                className="text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                Letzten Auftrag abfragen ({localOrders[0].orderId})
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search Result */}
      {foundStatus && (
        <div className={`bg-white rounded-3xl border p-6 sm:p-8 shadow-sm space-y-6 ${
          isConfirmed 
            ? 'border-emerald-200' 
            : isReview 
            ? 'border-amber-200' 
            : isRejected 
            ? 'border-rose-200' 
            : 'border-blue-200'
        }`}>
          {/* Status Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">
                Auftragsnummer: {foundStatus.orderId}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {foundStatus.licensePlate}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Eingereicht am {new Date(foundStatus.createdAt).toLocaleDateString('de-DE')} • {foundStatus.registrationDistrict || 'Zulassungsbehörde'}
              </p>
            </div>

            {/* Authoritative Status Badge */}
            <div>
              {isConfirmed ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Erfolgreich abgemeldet</span>
                </div>
              ) : isReview ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Manuelle Prüfung erforderlich.</span>
                </div>
              ) : isRejected ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>Antrag abgelehnt</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
                  <Clock className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>Antrag wird geprüft</span>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Narrative Section based strictly on actual status */}
          {isConfirmed ? (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 space-y-2">
              <div className="font-bold flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Amtlich bestätigt durch die Zulassungsstelle</span>
              </div>
              <p className="leading-relaxed text-emerald-900">
                Die Außerbetriebsetzung wurde im örtlichen und zentralen Fahrzeugregister (ZFZR) des Kraftfahrt-Bundesamtes erfolgreich verbucht. Das Fahrzeug ist rechtswirksam abgemeldet.
              </p>
              {foundStatus.ikfzReference && (
                <div className="text-xs pt-1 font-mono text-emerald-800">
                  <strong>Amtliches Aktenzeichen / Referenz:</strong> {foundStatus.ikfzReference}
                </div>
              )}
            </div>
          ) : isReview ? (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs sm:text-sm text-amber-950 space-y-2">
              <div className="font-bold flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Manuelle Prüfung erforderlich</span>
              </div>
              <p className="leading-relaxed text-amber-800">
                Ihr Abmeldeantrag wurde sicher entgegengenommen und befindet sich zur qualifizierten Bearbeitung bei unserem Fachteam. Dies ist erforderlich, wenn die zuständige Zulassungsbehörde eine manuelle Fallabwicklung vorschreibt oder Stempelplakettendaten gesondert abgeglichen werden.
              </p>
              <p className="text-xs text-amber-700 font-medium">
                Sie müssen nichts weiter veranlassen. Wir informieren Sie unverzüglich per E-Mail, sobald die behördliche Bestätigung vorliegt.
              </p>
            </div>
          ) : isRejected ? (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs sm:text-sm text-rose-950 space-y-2">
              <div className="font-bold flex items-center gap-2 text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                <span>Behördliche Ablehnung</span>
              </div>
              <p className="leading-relaxed text-rose-800">
                Die zuständige Zulassungsbehörde konnte den Abmeldeantrag nicht vollziehen. Mögliche Ursachen sind ungültige Sicherheitscodes, abweichende Halterdaten oder ein gesperrtes Fahrzeugregister.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs sm:text-sm text-blue-950 space-y-2">
              <div className="font-bold flex items-center gap-2 text-blue-900">
                <Clock className="w-4 h-4 text-blue-700 shrink-0" />
                <span>Antrag wird geprüft</span>
              </div>
              <p className="leading-relaxed text-blue-800">
                Ihr Antrag wurde an die zuständige Zulassungsstelle übermittelt. Wir warten auf die behördliche Rückmeldung aus dem Fahrzeugregister. Sobald die Bestätigung vorliegt, wird der Status hier automatisch aktualisiert.
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-slate-500 block">Zuständige Behörde:</span>
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{foundStatus.registrationDistrict || 'Örtliche Zulassungsbehörde'}</span>
              </div>
              {foundStatus.customerEmail && (
                <div className="text-slate-500 text-[11px] pt-1">
                  Mitteilungen an: {foundStatus.customerEmail}
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-slate-500 block">Amtliche Vorgangsdaten:</span>
              {foundStatus.ikfzReference ? (
                <div className="font-mono font-bold text-sm text-blue-700">
                  Ref: {foundStatus.ikfzReference}
                </div>
              ) : (
                <div className="text-slate-500 text-xs italic">
                  Aktenzeichen wird nach Bestätigung vergeben
                </div>
              )}
              {foundStatus.completedAt && (
                <div className="text-slate-600 text-xs">
                  Abmeldedatum: {foundStatus.completedAt}
                </div>
              )}
            </div>
          </div>

          {/* Pricing Recap */}
          {foundStatus.totalPrice && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs flex flex-wrap justify-between items-center gap-2">
              <div>
                <span className="text-slate-500">Service- & Behördenentgelt:</span>
                <span className="font-bold text-slate-900 ml-2">{foundStatus.totalPrice.toFixed(2).replace('.', ',')} €</span>
              </div>
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zahlung eingegangen</span>
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            {isConfirmed ? (
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Amtliche Abmeldebestätigung drucken / speichern (PDF)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => executeSearch(foundStatus.orderId)}
                className="flex-1 py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>Status jetzt aktualisieren</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setCurrentScreen('contact')}
              className="py-3 px-5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Frage zu diesem Auftrag stellen
            </button>
          </div>
        </div>
      )}

      {/* Not Found state */}
      {hasSearched && !foundStatus && !isLoading && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">
            Kein passender Abmeldeauftrag gefunden
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Unter den eingegebenen Daten konnte kein Auftrag ermittelt werden. Bitte prüfen Sie die Schreibweise der Auftragsnummer (z. B. KFA-2026-000001) oder des Kennzeichens.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setCurrentScreen('wizard')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Neues Fahrzeug jetzt abmelden &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

