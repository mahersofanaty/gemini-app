import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Car, 
  AlertOctagon, 
  Users, 
  Mail, 
  RotateCcw, 
  ShieldAlert, 
  Settings as SettingsIcon, 
  RefreshCw, 
  Eye, 
  Search, 
  Save, 
  Trash2, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { AdminKpiCards, DashboardKpis } from './AdminKpiCards.tsx';

interface AdminSectionsProps {
  sessionToken: string;
  onSelectOrder: (publicOrderId: string) => void;
  kpis: DashboardKpis;
  onNavigateToSection: (section: any) => void;
}

// ==========================================
// 1. SECTION: ÜBERSICHT
// ==========================================
export const OverviewSection: React.FC<AdminSectionsProps> = ({
  sessionToken,
  onSelectOrder,
  kpis,
  onNavigateToSection,
}) => {
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/orders?limit=6', {
      headers: { 'x-admin-session': sessionToken },
    })
      .then((r) => r.json())
      .then((d) => setRecentOrders(d.orders || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [sessionToken]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Übersicht Leitstand</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Echtzeit-Kennzahlen, Betriebsstatus und anstehende Vorgänge zur Kfz-Online-Außerbetriebsetzung.
        </p>
      </div>

      {/* KPI Cards (Exact requested 8 KPIs) */}
      <AdminKpiCards kpis={kpis} onNavigateToSection={onNavigateToSection} />

      {/* Quick Action & Highlight Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manual Review Alert Card */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4" />
                Manuelle Prüfung
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                {kpis.manualReviewQueue} offen
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vorgänge mit unleserlichen Rubbelcodes, Unstimmigkeiten bei Plaketten oder Rückfragen von Zulassungsbehörden.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Prioritätswarteschlange</span>
            <button
              type="button"
              onClick={() => onNavigateToSection('manuelle_pruefung')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
            >
              Zur Prüfwarteschlange →
            </button>
          </div>
        </div>

        {/* Recent Orders Overview */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Neueste Aufträge
            </h3>
            <button
              type="button"
              onClick={() => onNavigateToSection('auftraege')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Alle Aufträge anzeigen →
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {isLoading ? (
              <p className="py-4 text-center text-slate-400">Lade Vorgänge...</p>
            ) : recentOrders.length === 0 ? (
              <p className="py-4 text-center text-slate-400">Keine aktuellen Aufträge.</p>
            ) : (
              recentOrders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => onSelectOrder(o.publicOrderId)}
                  className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-blue-900">{o.publicOrderId}</span>
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold text-[11px]">
                      {o.licensePlate}
                    </span>
                    <span className="text-slate-500 truncate max-w-[150px]">{o.customerName}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{Number(o.totalPrice).toFixed(2)} €</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. SECTION: ZAHLUNGEN
// ==========================================
export const PaymentsSection: React.FC<{ sessionToken: string; onSelectOrder: (id: string) => void }> = ({
  sessionToken,
  onSelectOrder,
}) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/payments', { headers: { 'x-admin-session': sessionToken } })
      .then((r) => r.json())
      .then((d) => setPayments(d.payments || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [sessionToken]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Zahlungen</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Übersicht über alle verbuchten Transaktionen, Provider-IDs und Zahlungsstatus.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Zahlungs-ID</th>
                <th className="py-3 px-4">Auftrag</th>
                <th className="py-3 px-4">Kunde</th>
                <th className="py-3 px-3">Provider</th>
                <th className="py-3 px-4">Transaktions-Referenz</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Betrag</th>
                <th className="py-3 px-4">Datum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                    Lade Zahlungen...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                    Keine Zahlungen verzeichnet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => onSelectOrder(p.publicOrderId)}
                    className="hover:bg-slate-50 cursor-pointer font-sans"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">PAY-{p.id}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-800">{p.publicOrderId}</td>
                    <td className="py-3 px-4 text-slate-900 font-medium">{p.customerName}</td>
                    <td className="py-3 px-3 uppercase font-bold text-slate-700">{p.provider}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[10px]">
                      {p.providerTransactionId || '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {Number(p.amount).toFixed(2)} €
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(p.createdAt).toLocaleString('de-DE')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. SECTION: ABMELDUNGEN
// ==========================================
export const DeregistrationsSection: React.FC<{ sessionToken: string; onSelectOrder: (id: string) => void }> = ({
  sessionToken,
  onSelectOrder,
}) => {
  const [list, setList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/deregistrations', { headers: { 'x-admin-session': sessionToken } })
      .then((r) => r.json())
      .then((d) => setList(d.deregistrations || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [sessionToken]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Abmeldungen (i-KfZ Status)</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Außerbetriebsetzungen mit amtlichen Vorgangsreferenzen und KBA-Rückmeldungen.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Auftrag</th>
                <th className="py-3 px-4">Kennzeichen</th>
                <th className="py-3 px-4">Zulassungsbezirk</th>
                <th className="py-3 px-4">Kunde</th>
                <th className="py-3 px-4">i-KfZ Referenz</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4">Abmeldedatum</th>
                <th className="py-3 px-3 text-right">Nachweis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Lade Abmeldungen...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Keine Abmeldevorgänge gefunden.
                  </td>
                </tr>
              ) : (
                list.map((d) => (
                  <tr
                    key={d.orderId}
                    onClick={() => onSelectOrder(d.publicOrderId)}
                    className="hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">{d.publicOrderId}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                        {d.licensePlate}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{d.registrationDistrict}</td>
                    <td className="py-3 px-4 text-slate-900 font-medium">{d.customerName}</td>
                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                      {d.ikfzReference || '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === 'erfolgreich_abgemeldet'
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.status === 'submitted_to_ikfz'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {d.completedAt ? new Date(d.completedAt).toLocaleString('de-DE') : 'Ausstehend'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOrder(d.publicOrderId);
                        }}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                      >
                        Öffnen
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. SECTION: MANUELLE PRÜFUNG
// ==========================================
export const ManualReviewSection: React.FC<{ sessionToken: string; onSelectOrder: (id: string) => void }> = ({
  sessionToken,
  onSelectOrder,
}) => {
  const [queue, setQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/manual-review', { headers: { 'x-admin-session': sessionToken } })
      .then((r) => r.json())
      .then((d) => setQueue(d.queue || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [sessionToken]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manuelle Prüfung</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Prüfwarteschlange für Vorgänge mit Klärungsbedarf oder Plausibilitätsprüfungen vor Behördenfreigabe.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Lade Prüfwarteschlange...</div>
        ) : queue.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">Keine offenen Prüffälle</p>
            <p className="text-xs text-slate-500">Alle eingegangenen Abmeldungen sind verarbeitet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {queue.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectOrder(item.publicOrderId)}
                className="p-4 hover:bg-amber-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-900 text-sm">{item.publicOrderId}</span>
                    <span className="font-mono bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-xs font-bold">
                      {item.licensePlate}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      Prüfbedarf
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">
                    Kunde: <strong className="text-slate-900">{item.customerName}</strong> • {item.customerEmail} • {item.registrationDistrict}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Eingegangen: {new Date(item.createdAt).toLocaleString('de-DE')}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOrder(item.publicOrderId);
                    }}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    Vorgang prüfen & freigeben
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 6. SECTION: KUNDEN
// ==========================================
export const CustomersSection: React.FC<{ sessionToken: string }> = ({ sessionToken }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/customers', { headers: { 'x-admin-session': sessionToken } })
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [sessionToken]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Kundenverwaltung</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verzeichnis aller Fahrzeughalter, Kontaktadressen und bisherigen Abmeldeaufträge.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Kunden-ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">E-Mail</th>
                <th className="py-3 px-3">Telefon</th>
                <th className="py-3 px-4">Anschrift</th>
                <th className="py-3 px-3">Aufträge</th>
                <th className="py-3 px-3">Gesamtumsatz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Lade Kunden...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Keine Kunden verzeichnet.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">CUST-{c.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {c.firstName} {c.lastName}
                    </td>
                    <td className="py-3 px-4 text-blue-700">{c.email}</td>
                    <td className="py-3 px-3 text-slate-600">{c.phone || '—'}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {c.street} {c.houseNumber}, {c.postalCode} {c.city}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{c.orderCount}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {Number(c.totalSpend).toFixed(2)} €
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 7. SECTION: E-MAILS
// ==========================================
export const EmailsSection: React.FC<{ sessionToken: string }> = ({ sessionToken }) => {
  const [emails, setEmails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/emails', { headers: { 'x-admin-session': sessionToken } })
      .then((r) => r.json())
      .then((d) => setEmails(d.emails || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [sessionToken]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">E-Mail-Protokolle</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ausgangsbuch aller Bestätigungsmails, Quittungen und Sachbearbeiter-Nachrichten.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Auftrag</th>
                <th className="py-3 px-4">Empfänger</th>
                <th className="py-3 px-4">Betreff</th>
                <th className="py-3 px-3">Typ</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4">Versandzeitpunkt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Lade E-Mails...
                  </td>
                </tr>
              ) : emails.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Keine E-Mails vorhanden.
                  </td>
                </tr>
              ) : (
                emails.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">{e.publicOrderId || '—'}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{e.recipient}</td>
                    <td className="py-3 px-4 text-slate-900 font-semibold">{e.subject}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{e.emailType}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(e.sentAt).toLocaleString('de-DE')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 8. SECTION: RÜCKERSTATTUNGEN
// ==========================================
export const RefundsSection: React.FC<{ sessionToken: string; onSelectOrder: (id: string) => void }> = ({
  sessionToken,
  onSelectOrder,
}) => {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/refunds', { headers: { 'x-admin-session': sessionToken } })
      .then((r) => r.json())
      .then((d) => setRefunds(d.refunds || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [sessionToken]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Rückerstattungen</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Dokumentierte Gutschriften und Stornozahlungen inklusive Sachbearbeiter-Vermerk.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Erstattungs-ID</th>
                <th className="py-3 px-4">Auftrag</th>
                <th className="py-3 px-4">Kunde</th>
                <th className="py-3 px-3">Betrag</th>
                <th className="py-3 px-4">Begründung</th>
                <th className="py-3 px-3">Bearbeiter</th>
                <th className="py-3 px-4">Ausgeführt am</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Lade Rückerstattungen...
                  </td>
                </tr>
              ) : refunds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Keine Rückerstattungen verzeichnet.
                  </td>
                </tr>
              ) : (
                refunds.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => onSelectOrder(r.publicOrderId)}
                    className="hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-purple-900">REF-{r.id}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">{r.publicOrderId}</td>
                    <td className="py-3 px-4 text-slate-900 font-medium">{r.customerName}</td>
                    <td className="py-3 px-3 font-bold text-purple-700">
                      {Number(r.amount).toFixed(2)} €
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs">{r.reason}</td>
                    <td className="py-3 px-3 text-slate-600">{r.adminName || 'Admin'}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(r.processedAt || r.createdAt).toLocaleString('de-DE')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 9. SECTION: AUDIT LOG
// ==========================================
export const AuditLogSection: React.FC<{ sessionToken: string }> = ({ sessionToken }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = () => {
    setIsLoading(true);
    fetch(`/api/admin/audit-logs?eventType=${eventTypeFilter}`, {
      headers: { 'x-admin-session': sessionToken },
    })
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [sessionToken, eventTypeFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Revisionssicheres Audit-Log</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Unveränderliches Protokoll aller administrativen Zugriffe, Code-Aufdeckungen und Nachänderungen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="py-1.5 px-3 text-xs border border-slate-200 rounded-lg bg-white font-medium outline-hidden"
          >
            <option value="all">Alle Ereignisse</option>
            <option value="security_codes_revealed">Sicherheitscodes entschlüsselt (Reveal)</option>
            <option value="vehicle_data_modified_post_payment">Fahrzeugdaten nach Zahlung geändert</option>
            <option value="refund_issued">Rückerstattung veranlasst</option>
            <option value="admin_login">Admin Login</option>
            <option value="retention_executed">DSGVO Bereinigung ausgeführt</option>
          </select>

          <button
            type="button"
            onClick={fetchLogs}
            className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Zeitstempel</th>
                <th className="py-3 px-4">Ereignistyp</th>
                <th className="py-3 px-3">Auftrag</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-3">IP-Adresse</th>
                <th className="py-3 px-4">Revisionsdaten (Metadata)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                    Lade Audit-Log...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                    Keine Logeinträge gefunden.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString('de-DE')}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          l.eventType === 'security_codes_revealed'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : l.eventType === 'vehicle_data_modified_post_payment'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {l.eventType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-blue-900 font-bold">
                      {l.publicOrderId || '—'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">
                      {l.adminEmail || 'System'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{l.ipAddress}</td>
                    <td className="py-2.5 px-4 text-slate-600 max-w-sm truncate" title={l.metadata}>
                      {l.metadata || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 10. SECTION: EINSTELLUNGEN
// ==========================================
export const SettingsSection: React.FC<{ sessionToken: string }> = ({ sessionToken }) => {
  const [settings, setSettings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [purgeStatus, setPurgeStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings', { headers: { 'x-admin-session': sessionToken } })
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [sessionToken]);

  const handleUpdateSetting = (key: string, value: string) => {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-session': sessionToken },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        setSaveStatus('Einstellungen erfolgreich gespeichert und im Audit-Log vermerkt.');
        setTimeout(() => setSaveStatus(null), 4000);
      }
    } catch {
      setSaveStatus('Fehler beim Speichern');
    }
  };

  const handleExecuteRetention = async () => {
    if (!confirm('DSGVO-Aufbewahrungsrichtlinie jetzt sofort ausführen? Alle Sicherheitscodes älter als 14 Tage werden permanent vernichtet.')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/retention/execute', {
        method: 'POST',
        headers: { 'x-admin-session': sessionToken },
      });
      const data = await res.json();
      setPurgeStatus(data.message || 'Ausgeführt.');
      setTimeout(() => setPurgeStatus(null), 5000);
    } catch {
      setPurgeStatus('Fehler beim Ausführen der Löschrichtlinie.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">System-Einstellungen</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tarifkonfiguration, behördliche i-KfZ Schnittstelle und automatische DSGVO-Löschfristen.
        </p>
      </div>

      {saveStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveStatus}</span>
        </div>
      )}

      {purgeStatus && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>{purgeStatus}</span>
        </div>
      )}

      {/* Pricing Settings */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-blue-600" />
          Preise & Gebührenkonfiguration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {settings.map((s) => (
            <div key={s.key}>
              <label className="block text-slate-700 font-bold mb-1">{s.key}</label>
              <input
                type="text"
                value={s.value}
                onChange={(e) => handleUpdateSetting(s.key, e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              />
              <p className="text-[10px] text-slate-400 mt-1">{s.description}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Einstellungen speichern</span>
          </button>
        </div>
      </div>

      {/* GDPR Data Purge / Retention Policy */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-600" />
          DSGVO Löschroutine (14-Tage Aufbewahrungsfrist)
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Gemäß § 15 e-GovG und Art. 17 DSGVO dürfen sensible Rubbel-Sicherheitscodes nach Abschluss der Kfz-Außerbetriebsetzung maximal 14 Tage zwischengespeichert werden. Danach werden die verschlüsselten Klartextfelder durch den Platzhalter <code>[PURGED_BY_GDPR_RETENTION_POLICY]</code> überschrieben.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleExecuteRetention}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>DSGVO-Bereinigung manuell auslösen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
