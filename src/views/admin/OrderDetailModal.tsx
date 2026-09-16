import React, { useState } from 'react';
import { 
  X, 
  Car, 
  User, 
  CreditCard, 
  Cpu, 
  History, 
  Mail, 
  FileText, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  RotateCcw, 
  RefreshCw, 
  AlertOctagon, 
  Ban, 
  Pencil, 
  Save, 
  FileCheck,
  Building2,
  Calendar,
  Clock,
  KeyRound
} from 'lucide-react';

interface OrderDetailModalProps {
  orderData: any;
  sessionToken: string;
  onClose: () => void;
  onRefresh: () => void;
}

type DetailTab = 
  | 'customer' 
  | 'vehicle' 
  | 'payment' 
  | 'processing' 
  | 'timeline' 
  | 'emails' 
  | 'notes' 
  | 'auditLog';

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  orderData,
  sessionToken,
  onClose,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('customer');

  // Security Codes reveal state
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealedCodes, setRevealedCodes] = useState<{
    zbiSecurityCode: string | null;
    frontPlateCode: string | null;
    rearPlateCode: string | null;
    singlePlateOnly: boolean;
  } | null>(null);
  const [showRevealConfirmModal, setShowRevealConfirmModal] = useState(false);
  const [revealReason, setRevealReason] = useState('');
  const [revealError, setRevealError] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  // Admin Actions state
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Note composition state
  const [newNoteText, setNewNoteText] = useState('');

  // Email composition modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState(`Ihr Abmeldeauftrag ${orderData?.order?.publicOrderId}`);
  const [emailBody, setEmailBody] = useState('');

  // Refund modal state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState(orderData?.order?.totalPrice || '');

  // Vehicle Edit state (Strict Post-Payment Protection)
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [editPlate, setEditPlate] = useState(orderData?.vehicle?.licensePlate || '');
  const [editDistrict, setEditDistrict] = useState(orderData?.vehicle?.registrationDistrict || '');
  const [editVin, setEditVin] = useState(orderData?.vehicle?.vin || '');
  const [editZbiDate, setEditZbiDate] = useState(orderData?.vehicle?.zbiIssueDate || '');
  const [showPostPaymentConfirmModal, setShowPostPaymentConfirmModal] = useState(false);
  const [postPaymentReason, setPostPaymentReason] = useState('');
  const [postPaymentConfirmedCheck, setPostPaymentConfirmedCheck] = useState(false);

  const order = orderData.order;
  const vehicle = orderData.vehicle;
  const customer = orderData.customer;
  const securityCodes = orderData.securityCodes;
  const payments = orderData.payments || [];
  const timeline = orderData.timeline || [];
  const emails = orderData.emails || [];
  const notes = orderData.notes || [];
  const auditLogs = orderData.auditLogs || [];

  const isPaid = Boolean(order.paidAt || order.status === 'paid' || order.status === 'erfolgreich_abgemeldet' || order.status === 'submitted_to_ikfz');

  // ==========================================
  // REVEAL SECURITY CODES WITH MANDATORY AUDIT
  // ==========================================
  const handleRevealSecurityCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revealReason.trim() || revealReason.trim().length < 5) {
      setRevealError('Bitte geben Sie eine Begründung mit mindestens 5 Zeichen an.');
      return;
    }

    setIsRevealing(true);
    setRevealError(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.publicOrderId}/reveal-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': sessionToken,
        },
        body: JSON.stringify({
          confirmed: true,
          reason: revealReason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.codes) {
        setRevealedCodes(data.codes);
        setIsRevealed(true);
        setShowRevealConfirmModal(false);
        setActionFeedback({
          type: 'success',
          message: 'Sicherheitscodes entschlüsselt. Der Lesezugriff wurde revisionssicher im Audit-Log vermerkt.',
        });
        onRefresh();
      } else {
        setRevealError(data.message || data.error || 'Entschlüsselung fehlgeschlagen');
      }
    } catch (err) {
      setRevealError('Verbindungsfehler beim Entschlüsseln.');
    } finally {
      setIsRevealing(false);
    }
  };

  // ==========================================
  // VEHICLE EDITING WITH POST-PAYMENT AUDIT PROTECTION
  // ==========================================
  const handleSaveVehicleData = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // If paid and confirmation not yet acknowledged, open explicit confirmation dialog
    if (isPaid && !showPostPaymentConfirmModal) {
      setShowPostPaymentConfirmModal(true);
      return;
    }

    if (isPaid && (!postPaymentConfirmedCheck || !postPaymentReason.trim())) {
      setActionFeedback({
        type: 'error',
        message: 'Eine Änderung nach Zahlung erfordert die Bestätigung und eine Begründung für das Audit-Protokoll.',
      });
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.publicOrderId}/vehicle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': sessionToken,
        },
        body: JSON.stringify({
          licensePlate: editPlate,
          registrationDistrict: editDistrict,
          vin: editVin,
          zbiIssueDate: editZbiDate,
          confirmedPostPayment: isPaid ? true : undefined,
          reason: isPaid ? postPaymentReason.trim() : 'Reguläre Stammdatenaktualisierung',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionFeedback({
          type: 'success',
          message: isPaid 
            ? 'Fahrzeugdaten nach Zahlung geändert. Revisionssicheres Prüfprotokoll erstellt.' 
            : 'Fahrzeugdaten erfolgreich gespeichert.',
        });
        setIsEditingVehicle(false);
        setShowPostPaymentConfirmModal(false);
        setPostPaymentReason('');
        setPostPaymentConfirmedCheck(false);
        onRefresh();
      } else {
        setActionFeedback({ type: 'error', message: data.message || data.error || 'Fehler beim Speichern' });
      }
    } catch (err) {
      setActionFeedback({ type: 'error', message: 'Verbindungsfehler beim Ändern der Fahrzeugdaten.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  // ==========================================
  // ADMIN ACTION HANDLERS
  // ==========================================

  // Mark for manual review
  const handleMarkManualReview = async () => {
    const reason = prompt('Grund für die Zuweisung zur manuellen Prüfung eingeben:');
    if (reason === null) return;

    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.publicOrderId}/manual-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-session': sessionToken },
        body: JSON.stringify({ reason: reason || 'Manuelle Überprüfung angefordert' }),
      });
      if (res.ok) {
        setActionFeedback({ type: 'success', message: 'Auftrag erfolgreich in die Prüfwarteschlange verschoben.' });
        onRefresh();
      }
    } catch {
      setActionFeedback({ type: 'error', message: 'Aktion fehlgeschlagen' });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Retry processing
  const handleRetryProcessing = async () => {
    if (!confirm(`Möchten Sie die Verarbeitung für ${order.publicOrderId} erneut ausführen und die Abmeldung an die i-KfZ Schnittstelle übermitteln?`)) {
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.publicOrderId}/retry-processing`, {
        method: 'POST',
        headers: { 'x-admin-session': sessionToken },
      });
      if (res.ok) {
        setActionFeedback({ type: 'success', message: 'Verarbeitung erneut ausgeführt. Außerbetriebsetzung erfolgreich übermittelt.' });
        onRefresh();
      }
    } catch {
      setActionFeedback({ type: 'error', message: 'Wiederholung fehlgeschlagen' });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Cancel
  const handleCancelOrder = async () => {
    const reason = prompt('Begründung für die Stornierung:');
    if (reason === null) return;

    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.publicOrderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-session': sessionToken },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        setActionFeedback({ type: 'success', message: 'Auftrag wurde storniert und im Audit-Log dokumentiert.' });
        onRefresh();
      }
    } catch {
      setActionFeedback({ type: 'error', message: 'Stornierung fehlgeschlagen' });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Refund
  const handleExecuteRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundReason.trim()) return;

    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.publicOrderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-session': sessionToken },
        body: JSON.stringify({ reason: refundReason.trim(), amount: refundAmount }),
      });
      if (res.ok) {
        setShowRefundModal(false);
        setActionFeedback({ type: 'success', message: 'Rückerstattung erfolgreich ausgeführt und gebucht.' });
        onRefresh();
      }
    } catch {
      setActionFeedback({ type: 'error', message: 'Erstattung fehlgeschlagen' });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Send Email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailBody.trim()) return;

    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.publicOrderId}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-session': sessionToken },
        body: JSON.stringify({ subject: emailSubject.trim(), message: emailBody.trim() }),
      });
      if (res.ok) {
        setShowEmailModal(false);
        setEmailBody('');
        setActionFeedback({ type: 'success', message: `E-Mail an ${customer.email} erfolgreich versandt und protokolliert.` });
        onRefresh();
      }
    } catch {
      setActionFeedback({ type: 'error', message: 'E-Mail-Versand fehlgeschlagen' });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Add Internal Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    try {
      const res = await fetch(`/api/admin/orders/${order.publicOrderId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-session': sessionToken },
        body: JSON.stringify({ note: newNoteText.trim() }),
      });
      if (res.ok) {
        setNewNoteText('');
        setActionFeedback({ type: 'success', message: 'Interne Notiz hinzugefügt.' });
        onRefresh();
      }
    } catch {
      setActionFeedback({ type: 'error', message: 'Fehler beim Speichern der Notiz.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-white tracking-wide">
                  {order.publicOrderId}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {vehicle.licensePlate}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Auftragsprüfung & Sachbearbeitung • Eingegangen: {new Date(order.createdAt).toLocaleString('de-DE')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {actionFeedback && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between shrink-0 ${
              actionFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-b border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{actionFeedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="text-slate-500 hover:text-slate-800 text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Admin Actions Bar (Direct Shortcuts) */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span>Aktionen:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mark for manual review */}
            <button
              type="button"
              disabled={isActionLoading || order.status === 'manuelle_pruefung'}
              onClick={handleMarkManualReview}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Zur manuellen Prüfung markieren"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Manuelle Prüfung</span>
            </button>

            {/* Retry processing */}
            <button
              type="button"
              disabled={isActionLoading}
              onClick={handleRetryProcessing}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Verarbeitung wiederholen / an i-KfZ übermitteln"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Erneut verarbeiten</span>
            </button>

            {/* Send email */}
            <button
              type="button"
              onClick={() => setShowEmailModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="E-Mail an Kunden versenden"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>E-Mail senden</span>
            </button>

            {/* Refund */}
            {order.status !== 'erstattet' && (
              <button
                type="button"
                onClick={() => setShowRefundModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Rückerstattung veranlassen"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Erstatten</span>
              </button>
            )}

            {/* Cancel */}
            {order.status !== 'storniert' && (
              <button
                type="button"
                disabled={isActionLoading}
                onClick={handleCancelOrder}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Auftrag stornieren"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Stornieren</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-1 overflow-x-auto shrink-0">
          {[
            { id: 'customer', label: 'Customer', icon: <User className="w-3.5 h-3.5" /> },
            { id: 'vehicle', label: 'Vehicle', icon: <Car className="w-3.5 h-3.5" /> },
            { id: 'payment', label: 'Payment', icon: <CreditCard className="w-3.5 h-3.5" /> },
            { id: 'processing', label: 'Processing', icon: <Cpu className="w-3.5 h-3.5" /> },
            { id: 'timeline', label: `Timeline (${timeline.length})`, icon: <History className="w-3.5 h-3.5" /> },
            { id: 'emails', label: `Emails (${emails.length})`, icon: <Mail className="w-3.5 h-3.5" /> },
            { id: 'notes', label: `Notes (${notes.length})`, icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'auditLog', label: `Audit Log (${auditLogs.length})`, icon: <ShieldAlert className="w-3.5 h-3.5" /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as DetailTab)}
                className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          {/* ==================================================== */}
          {/* TAB 1: CUSTOMER */}
          {/* ==================================================== */}
          {activeTab === 'customer' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Halterdaten & Kontakt
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Vollständiger Name:</span>
                    <p className="font-bold text-slate-900 text-sm">
                      {customer.firstName} {customer.lastName}
                    </p>
                    {customer.companyName && (
                      <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" /> {customer.companyName}
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">E-Mail-Adresse:</span>
                    <p className="font-semibold text-blue-700">{customer.email}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Telefonnummer:</span>
                    <p className="font-medium text-slate-800">{customer.phone || 'Keine Angabe'}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Wohnanschrift:</span>
                    <p className="font-medium text-slate-900">
                      {customer.street} {customer.houseNumber}
                    </p>
                    <p className="text-slate-600">
                      {customer.postalCode} {customer.city}
                    </p>
                    <p className="text-slate-400 text-[11px]">{customer.country || 'Deutschland'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: VEHICLE (With Silent Edit Protection) */}
          {/* ==================================================== */}
          {activeTab === 'vehicle' && (
            <div className="space-y-6">
              {/* Vehicle Data Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-600" />
                    Fahrzeugdaten
                  </h3>
                  {!isEditingVehicle ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingVehicle(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Bearbeiten</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingVehicle(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Abbrechen
                    </button>
                  )}
                </div>

                {/* Edit Form or View Details */}
                {!isEditingVehicle ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Kennzeichen:</span>
                      <span className="inline-block mt-1 font-mono font-bold bg-slate-100 border border-slate-300 px-2.5 py-1 rounded text-sm text-slate-900">
                        {vehicle.licensePlate}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Zulassungsbezirk:</span>
                      <p className="font-semibold text-slate-900 mt-1">{vehicle.registrationDistrict}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Fahrzeug-Identifizierungsnummer (FIN):</span>
                      <p className="font-mono text-slate-800 mt-1">{vehicle.vin || 'Nicht angegeben'}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Ausstellungsdatum ZB I:</span>
                      <p className="font-semibold text-slate-900 mt-1">{vehicle.zbiIssueDate}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Kennzeichen-Reservierung:</span>
                      <p className="font-semibold text-slate-900 mt-1">
                        {vehicle.reservationRequested ? 'Ja (12 Monate)' : 'Nein'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveVehicleData} className="space-y-4 pt-2">
                    {isPaid && (
                      <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Achtung: Auftrag ist bereits bezahlt</p>
                          <p>
                            Änderungen an Fahrzeugdaten in bezahlten Aufträgen werden im Revisionsprotokoll (Audit-Log) unveränderlich erfasst und erfordern eine Bestätigung.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Kennzeichen</label>
                        <input
                          type="text"
                          required
                          value={editPlate}
                          onChange={(e) => setEditPlate(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Zulassungsbezirk</label>
                        <input
                          type="text"
                          required
                          value={editDistrict}
                          onChange={(e) => setEditDistrict(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">FIN / VIN (17 Zeichen)</label>
                        <input
                          type="text"
                          value={editVin}
                          onChange={(e) => setEditVin(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Ausstellungsdatum ZB I (YYYY-MM-DD)</label>
                        <input
                          type="date"
                          value={editZbiDate}
                          onChange={(e) => setEditZbiDate(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingVehicle(false)}
                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="submit"
                        disabled={isActionLoading}
                        className="inline-flex items-center gap-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Fahrzeugdaten aktualisieren</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Security Codes Section (Strict Masking & Explicit Reveal Requirement) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    Sicherheitscodes (Sicherheitszone)
                  </h3>
                  {securityCodes?.isPurged && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-full">
                      DSGVO-gelöscht
                    </span>
                  )}
                </div>

                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs space-y-3">
                  <div className="flex items-start gap-2.5 text-amber-900">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Standardmäßig maskierte Sicherheitsrubbelcodes</p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Gemäß Sicherheitskonzept werden sensible Codes nur im Bedarfsfall entschlüsselt. Jedes Aufdecken wird mit Administrator-ID, Zeitstempel, IP und Begründung unveränderlich im Prüfprotokoll erfasst.
                      </p>
                    </div>
                  </div>

                  {/* Display Masked vs Revealed */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                        ZB I Sicherheitscode (7 Zeichen)
                      </span>
                      <p className="text-base font-mono font-bold text-slate-900 mt-1">
                        {isRevealed && revealedCodes?.zbiSecurityCode
                          ? revealedCodes.zbiSecurityCode
                          : securityCodes?.zbiSecurityCodeMasked || '•••••••'}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                        Stempelplakette vorn (3 Zeichen)
                      </span>
                      <p className="text-base font-mono font-bold text-slate-900 mt-1">
                        {isRevealed && revealedCodes?.frontPlateCode
                          ? revealedCodes.frontPlateCode
                          : securityCodes?.frontPlateSecurityCodeMasked || '•••'}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                        Stempelplakette hinten (3 Zeichen)
                      </span>
                      <p className="text-base font-mono font-bold text-slate-900 mt-1">
                        {isRevealed && revealedCodes?.rearPlateCode
                          ? revealedCodes.rearPlateCode
                          : securityCodes?.rearPlateSecurityCodeMasked || '•••'}
                      </p>
                    </div>
                  </div>

                  {/* Reveal Button or Revealed Confirmation */}
                  <div className="pt-2 flex items-center justify-between">
                    {!isRevealed ? (
                      <button
                        type="button"
                        disabled={securityCodes?.isPurged}
                        onClick={() => setShowRevealConfirmModal(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Sicherheitscodes entschlüsseln & einsehen</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Codes erfolgreich entschlüsselt (Audit-Ereignis gespeichert)</span>
                      </div>
                    )}

                    {securityCodes?.retentionExpiresAt && (
                      <span className="text-[11px] text-slate-500">
                        DSGVO-Ablauf: {new Date(securityCodes.retentionExpiresAt).toLocaleDateString('de-DE')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: PAYMENT */}
          {/* ==================================================== */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Zahlungsdetails & Abrechnung
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Gesamtbetrag</span>
                    <span className="text-lg font-bold text-slate-900">
                      {Number(order.totalPrice).toFixed(2)} €
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Servicegebühr</span>
                    <span className="text-base font-semibold text-slate-800">
                      {Number(order.servicePrice).toFixed(2)} €
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Behördengebühr KBA/StVO</span>
                    <span className="text-base font-semibold text-slate-800">
                      {Number(order.authorityFee).toFixed(2)} €
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Reservierungsgebühr</span>
                    <span className="text-base font-semibold text-slate-800">
                      {Number(order.reservationFee || 0).toFixed(2)} €
                    </span>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-700 mb-2">Verbuchte Transaktionen</h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Transaktions-ID</th>
                          <th className="py-2.5 px-3">Zahlungsmethode</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Betrag</th>
                          <th className="py-2.5 px-3">Zeitpunkt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {payments.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-slate-400">
                              Keine Zahlungen verbucht.
                            </td>
                          </tr>
                        ) : (
                          payments.map((p: any) => (
                            <tr key={p.id}>
                              <td className="py-2 px-3 font-mono text-[11px] text-blue-900">
                                {p.providerTransactionId || `TX-${p.id}`}
                              </td>
                              <td className="py-2 px-3 uppercase font-semibold text-slate-800">
                                {p.provider}
                              </td>
                              <td className="py-2 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-2 px-3 font-semibold text-slate-900">
                                {Number(p.amount).toFixed(2)} €
                              </td>
                              <td className="py-2 px-3 text-slate-500 text-[11px]">
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
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: PROCESSING (i-KfZ Integration & Certificates) */}
          {/* ==================================================== */}
          {activeTab === 'processing' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  i-KfZ Schnittstelle & Amtliche Außerbetriebsetzung
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Amtliche Vorgangsreferenz
                    </span>
                    <p className="text-base font-mono font-bold text-blue-900">
                      {order.ikfzReference || 'Ausstehend (Noch nicht übermittelt)'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Eindeutige Transaktionsnummer zur Nachverfolgung beim Kraftfahrt-Bundesamt (KBA).
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Status der Übermittlung
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === 'erfolgreich_abgemeldet'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'manuelle_pruefung'
                          ? 'bg-amber-100 text-amber-800'
                          : order.status === 'abgelehnt'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                      {order.ikfzStatus && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-200 text-slate-700">
                          {order.ikfzStatus}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Zulassungsstelle: {vehicle.registrationDistrict || 'Nicht angegeben'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Abgeschlossen am: {order.completedAt ? new Date(order.completedAt).toLocaleString('de-DE') : '—'}
                    </p>
                  </div>
                </div>

                <div className="p-4 border border-blue-200 bg-blue-50/50 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-blue-900">
                    <FileCheck className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-bold">Amtlicher Abmeldenachweis (PDF / Druckansicht)</p>
                      <p className="text-[11px] text-blue-700">
                        Digitale Quittung mit KBA-Referenz und amtlichem Zeitstempel für Versicherung und Zulassungsstelle.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (order.status !== 'erfolgreich_abgemeldet') {
                        alert(`Hinweis: Dieser Auftrag befindet sich im Status "${order.status}". Ein offizieller Abmeldenachweis wird erst nach rechtswirksamer behördlicher Bestätigung generiert.`);
                      } else {
                        alert(`Amtliche Bestätigung für ${order.publicOrderId} (Referenz: ${order.ikfzReference || 'N/A'}) wird aufgerufen.`);
                      }
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                  >
                    Nachweis anzeigen
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: TIMELINE */}
          {/* ==================================================== */}
          {activeTab === 'timeline' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                Chronologische Auftragshistorie
              </h3>

              <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 pt-1">
                {timeline.length === 0 ? (
                  <p className="text-xs text-slate-400">Keine Ereignisse verzeichnet.</p>
                ) : (
                  timeline.map((ev: any) => (
                    <div key={ev.id} className="relative group">
                      <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white" />
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{ev.eventType}</span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(ev.createdAt).toLocaleString('de-DE')}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {ev.actorType}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs">{ev.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 6: EMAILS */}
          {/* ==================================================== */}
          {activeTab === 'emails' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Versendete Mitteilungen
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>E-Mail an Kunden verfassen</span>
                </button>
              </div>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                {emails.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    Keine E-Mail-Protokolle vorhanden.
                  </div>
                ) : (
                  emails.map((m: any) => (
                    <div key={m.id} className="p-3.5 hover:bg-slate-50 transition-colors text-xs flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{m.subject}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {m.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Empfänger: {m.recipient} • Typ: {m.emailType}
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(m.sentAt).toLocaleString('de-DE')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 7: NOTES */}
          {/* ==================================================== */}
          {activeTab === 'notes' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Interne Sachbearbeiter-Notizen
              </h3>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={2}
                  required
                  placeholder="Neue interne Notiz zum Auftrag hinterlegen (z.B. Rückruf getätigt, Prüfung bestanden)..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:bg-white focus:border-blue-600"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <span>Notiz speichern</span>
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-3 pt-2">
                {notes.length === 0 ? (
                  <p className="text-xs text-slate-400">Keine internen Notizen hinterlegt.</p>
                ) : (
                  notes.map((n: any) => (
                    <div key={n.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-bold text-slate-800">{n.adminName}</span>
                        <span>{new Date(n.createdAt).toLocaleString('de-DE')}</span>
                      </div>
                      <p className="text-slate-800">{n.note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 8: AUDIT LOG (Order Specific) */}
          {/* ==================================================== */}
          {activeTab === 'auditLog' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                Revisionssicheres Prüfprotokoll für Auftrag {order.publicOrderId}
              </h3>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Zeitpunkt</th>
                      <th className="py-2.5 px-3">Ereignis</th>
                      <th className="py-2.5 px-3">Bearbeiter</th>
                      <th className="py-2.5 px-3">IP-Adresse</th>
                      <th className="py-2.5 px-3">Metadaten</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400 font-sans text-xs">
                          Keine Audit-Einträge verzeichnet.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 text-slate-600">
                            {new Date(log.timestamp).toLocaleString('de-DE')}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900">
                            {log.eventType}
                          </td>
                          <td className="py-2 px-3 text-slate-700">
                            {log.adminEmail || 'System'}
                          </td>
                          <td className="py-2 px-3 text-slate-500">
                            {log.ipAddress}
                          </td>
                          <td className="py-2 px-3 text-slate-600 max-w-xs truncate">
                            {log.metadata || '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            KFZ Abmelden Online • Leitstand Revisionssicherheit
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: EXPLICIT CONFIRMATION TO REVEAL SECURITY CODES */}
      {/* ======================================================== */}
      {showRevealConfirmModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 rounded-xl bg-amber-100">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Sicherheitscodes entschlüsseln</h3>
                <p className="text-xs text-slate-500">Autorisierungsnachweis erforderlich</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 space-y-1">
              <p className="font-semibold">Revisionssicherer Audit-Hinweis:</p>
              <p>
                Das Einsehen der Klartext-Sicherheitscodes wird unveränderlich mit Ihrem Benutzerkonto ({orderData.customer?.email ? 'Admin' : 'Operator'}), IP-Adresse und Begründung protokolliert.
              </p>
            </div>

            {revealError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-semibold">
                {revealError}
              </div>
            )}

            <form onSubmit={handleRevealSecurityCodes} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Begründung für die Einsichtnahme *
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. KBA-Rückfrage / Behördliche Nachprüfung"
                  value={revealReason}
                  onChange={(e) => setRevealReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden focus:border-amber-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRevealConfirmModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isRevealing || revealReason.trim().length < 5}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isRevealing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>Entschlüsseln & Protokollieren</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CONFIRMATION FOR VEHICLE EDITING AFTER PAYMENT */}
      {/* "Do not allow an administrator to silently modify vehicle data after payment.
           Any modification after payment must create an audit event and require confirmation." */}
      {/* ======================================================== */}
      {showPostPaymentConfirmModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Änderung nach Zahlungseingang</h3>
                <p className="text-xs text-slate-500">Revisionspflichtige Datenänderung</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-900 space-y-1">
              <p className="font-semibold">Sicherheitsanforderung:</p>
              <p>
                Fahrzeugdaten dürfen nach bereits erfolgter Bezahlung <strong>keinesfalls stillschweigend</strong> modifiziert werden. Jede Anpassung erfordert eine Begründung und wird im Prüfpfad dokumentiert.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Begründung für die nachträgliche Änderung *
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Tippfehler im Kennzeichen auf Halterantrag korrigiert"
                  value={postPaymentReason}
                  onChange={(e) => setPostPaymentReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-hidden focus:border-rose-600"
                />
              </div>

              <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={postPaymentConfirmedCheck}
                  onChange={(e) => setPostPaymentConfirmedCheck(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span>
                  Ich bestätige ausdrücklich die Richtigkeit dieser Datenänderung und bin mir bewusst, dass dieser Vorgang mit meinen Benutzerdaten im Audit-Log vermerkt wird.
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPostPaymentConfirmModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  disabled={!postPaymentConfirmedCheck || !postPaymentReason.trim() || isActionLoading}
                  onClick={() => handleSaveVehicleData()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isActionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Bestätigen & Speichern</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: SEND EMAIL MODAL */}
      {/* ======================================================== */}
      {showEmailModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                E-Mail an Kunden versenden
              </h3>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Empfänger: <strong className="text-slate-800">{customer.firstName} {customer.lastName}</strong> ({customer.email})
            </p>

            <form onSubmit={handleSendEmail} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Betreff</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nachricht</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Guten Tag Herr/Frau... bezüglich Ihres Auftrags..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>E-Mail senden</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: REFUND MODAL */}
      {/* ======================================================== */}
      {showRefundModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-purple-600" />
                Rückerstattung veranlassen
              </h3>
              <button
                type="button"
                onClick={() => setShowRefundModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteRefund} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Erstattungsbetrag (€)</label>
                <input
                  type="text"
                  required
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Begründung für Erstattung *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="z.B. Doppelzahlung, Stornierung auf Halterwunsch..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading || !refundReason.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Erstattung verbindlich ausführen</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
