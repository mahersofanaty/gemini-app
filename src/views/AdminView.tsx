import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  AlertCircle, 
  KeyRound,
  ArrowRight
} from 'lucide-react';
import { CurrentScreen } from '../types.ts';
import { AdminSidebar, AdminSection } from './admin/AdminSidebar.tsx';
import { DashboardKpis } from './admin/AdminKpiCards.tsx';
import { AdminOrdersTab } from './admin/AdminOrdersTab.tsx';
import { OrderDetailModal } from './admin/OrderDetailModal.tsx';
import {
  OverviewSection,
  PaymentsSection,
  DeregistrationsSection,
  ManualReviewSection,
  CustomersSection,
  EmailsSection,
  RefundsSection,
  AuditLogSection,
  SettingsSection,
} from './admin/AdminSections.tsx';

interface AdminViewProps {
  setCurrentScreen: (screen: CurrentScreen) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ setCurrentScreen }) => {
  // Authentication & Session
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return localStorage.getItem('kfz_admin_session_token');
  });
  const [adminUser, setAdminUser] = useState<{ id: number; name: string; email: string; role: string } | null>(() => {
    const saved = localStorage.getItem('kfz_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('admin@kfz-abmelden-online.de');
  const [loginPassword, setLoginPassword] = useState('AdminSecure2026!');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Navigation Section (1-10)
  const [activeSection, setActiveSection] = useState<AdminSection>('uebersicht');

  // KPI Stats State
  const [kpis, setKpis] = useState<DashboardKpis>({
    ordersToday: 0,
    ordersThisWeek: 0,
    revenueToday: 0,
    revenueThisMonth: 0,
    successfulAbmeldungen: 0,
    failedRequests: 0,
    manualReviewQueue: 0,
    refunds: 0,
  });

  // Orders Tab State
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Order Detail Modal State
  const [selectedPublicOrderId, setSelectedPublicOrderId] = useState<string | null>(null);
  const [orderDetailData, setOrderDetailData] = useState<any | null>(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);

  // ==========================================
  // Fetch Dashboard Stats
  // ==========================================
  const fetchDashboardStats = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const res = await fetch('/api/admin/dashboard-stats', {
        headers: { 'x-admin-session': sessionToken },
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (data.kpis) {
        setKpis(data.kpis);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  }, [sessionToken]);

  // ==========================================
  // Fetch Orders Table Data
  // ==========================================
  const fetchOrders = useCallback(async () => {
    if (!sessionToken) return;
    setOrdersLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (orderStatusFilter && orderStatusFilter !== 'all') {
        queryParams.append('status', orderStatusFilter);
      }
      if (orderSearch.trim()) {
        queryParams.append('search', orderSearch.trim());
      }

      const res = await fetch(`/api/admin/orders?${queryParams.toString()}`, {
        headers: { 'x-admin-session': sessionToken },
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, [sessionToken, orderStatusFilter, orderSearch]);

  // ==========================================
  // Fetch Order Detail
  // ==========================================
  const fetchOrderDetail = useCallback(async (publicOrderId: string) => {
    if (!sessionToken) return;
    setOrderDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${publicOrderId}`, {
        headers: { 'x-admin-session': sessionToken },
      });
      if (res.ok) {
        const data = await res.json();
        setOrderDetailData(data);
        setSelectedPublicOrderId(publicOrderId);
      }
    } catch (err) {
      console.error('Error loading order details:', err);
    } finally {
      setOrderDetailLoading(false);
    }
  }, [sessionToken]);

  // Sync on session Token or active section changes
  useEffect(() => {
    if (sessionToken) {
      fetchDashboardStats();
      if (activeSection === 'auftraege' || activeSection === 'uebersicht') {
        fetchOrders();
      }
    }
  }, [sessionToken, activeSection, fetchDashboardStats, fetchOrders]);

  // Debounced order search
  useEffect(() => {
    if (!sessionToken) return;
    const timer = setTimeout(() => {
      fetchOrders();
    }, 250);
    return () => clearTimeout(timer);
  }, [orderSearch, orderStatusFilter, fetchOrders, sessionToken]);

  // ==========================================
  // Login Handler
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });

      const data = await res.json();
      if (res.ok && data.sessionToken) {
        setSessionToken(data.sessionToken);
        setAdminUser(data.user);
        localStorage.setItem('kfz_admin_session_token', data.sessionToken);
        localStorage.setItem('kfz_admin_user', JSON.stringify(data.user));
      } else {
        setLoginError(data.error || 'Anmeldung fehlgeschlagen');
      }
    } catch {
      setLoginError('Verbindungsfehler zum Backend');
    } finally {
      setLoginLoading(false);
    }
  };

  // ==========================================
  // Logout Handler
  // ==========================================
  const handleLogout = async () => {
    try {
      if (sessionToken) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { 'x-admin-session': sessionToken },
        });
      }
    } catch {
      // ignore
    } finally {
      setSessionToken(null);
      setAdminUser(null);
      localStorage.removeItem('kfz_admin_session_token');
      localStorage.removeItem('kfz_admin_user');
      setSelectedPublicOrderId(null);
      setOrderDetailData(null);
    }
  };

  // ====================================================
  // 1. UN-AUTHENTICATED: SECURE ADMIN LOGIN SCREEN
  // ====================================================
  if (!sessionToken || !adminUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-xl text-white mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Admin Leitstand
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            KFZ Abmelden Online • Revisionssicheres Administrationsportal
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 text-slate-200">
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Administrator E-Mail
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs outline-hidden focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Passwort
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs outline-hidden focus:border-blue-500 font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  {loginLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4" />
                  )}
                  <span>Im Leitstand anmelden</span>
                </button>
              </div>

              {/* Developer hint */}
              <div className="mt-4 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Bereitgestellte Anmeldedaten</span>
                </div>
                <p>E-Mail: <code className="text-white">admin@kfz-abmelden-online.de</code></p>
                <p>Passwort: <code className="text-white">AdminSecure2026!</code></p>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentScreen('home')}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  ← Zurück zur Startseite
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // 2. AUTHENTICATED: COMPREHENSIVE GERMAN ADMIN DASHBOARD
  // ====================================================
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row antialiased">
      {/* 1. Sidebar Navigation (Sections 1 to 10) */}
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={(sec) => {
          setActiveSection(sec);
          if (sec === 'auftraege' || sec === 'uebersicht') {
            fetchOrders();
          }
          fetchDashboardStats();
        }}
        manualQueueCount={kpis.manualReviewQueue}
        adminUser={adminUser}
        onLogout={handleLogout}
        onReturnToApp={() => setCurrentScreen('home')}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-h-screen">
        {/* Dynamic Section Rendering */}
        {activeSection === 'uebersicht' && (
          <OverviewSection
            sessionToken={sessionToken}
            onSelectOrder={(id) => fetchOrderDetail(id)}
            kpis={kpis}
            onNavigateToSection={(sec) => setActiveSection(sec)}
          />
        )}

        {activeSection === 'auftraege' && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Auftragsverwaltung</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Vollständige Tabelle aller Kfz-Abmeldungen. Sicherheitscodes werden aus Datenschutzgründen in dieser Liste niemals im Klartext übertragen.
              </p>
            </div>
            <AdminOrdersTab
              orders={orders}
              isLoading={ordersLoading}
              onRefresh={fetchOrders}
              onSelectOrder={(id) => fetchOrderDetail(id)}
              searchQuery={orderSearch}
              setSearchQuery={setOrderSearch}
              statusFilter={orderStatusFilter}
              setStatusFilter={setOrderStatusFilter}
            />
          </div>
        )}

        {activeSection === 'zahlungen' && (
          <PaymentsSection
            sessionToken={sessionToken}
            onSelectOrder={(id) => fetchOrderDetail(id)}
          />
        )}

        {activeSection === 'abmeldungen' && (
          <DeregistrationsSection
            sessionToken={sessionToken}
            onSelectOrder={(id) => fetchOrderDetail(id)}
          />
        )}

        {activeSection === 'manuelle_pruefung' && (
          <ManualReviewSection
            sessionToken={sessionToken}
            onSelectOrder={(id) => fetchOrderDetail(id)}
          />
        )}

        {activeSection === 'kunden' && (
          <CustomersSection sessionToken={sessionToken} />
        )}

        {activeSection === 'emails' && (
          <EmailsSection sessionToken={sessionToken} />
        )}

        {activeSection === 'rueckerstattungen' && (
          <RefundsSection
            sessionToken={sessionToken}
            onSelectOrder={(id) => fetchOrderDetail(id)}
          />
        )}

        {activeSection === 'audit_log' && (
          <AuditLogSection sessionToken={sessionToken} />
        )}

        {activeSection === 'einstellungen' && (
          <SettingsSection sessionToken={sessionToken} />
        )}
      </main>

      {/* 3. Order Detail Page / Modal (Full Feature) */}
      {selectedPublicOrderId && orderDetailData && (
        <OrderDetailModal
          orderData={orderDetailData}
          sessionToken={sessionToken}
          onClose={() => {
            setSelectedPublicOrderId(null);
            setOrderDetailData(null);
          }}
          onRefresh={() => {
            fetchOrderDetail(selectedPublicOrderId);
            fetchOrders();
            fetchDashboardStats();
          }}
        />
      )}

      {/* Loading overlay for order detail */}
      {orderDetailLoading && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-2xs flex items-center justify-center">
          <div className="bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold text-slate-800">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Lade Auftragsdetails...</span>
          </div>
        </div>
      )}
    </div>
  );
};
