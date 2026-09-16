import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  Car, 
  AlertOctagon, 
  Users, 
  Mail, 
  RotateCcw, 
  ShieldAlert, 
  Settings, 
  LogOut, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export type AdminSection = 
  | 'uebersicht'
  | 'auftraege'
  | 'zahlungen'
  | 'abmeldungen'
  | 'manuelle_pruefung'
  | 'kunden'
  | 'emails'
  | 'rueckerstattungen'
  | 'audit_log'
  | 'einstellungen';

interface AdminSidebarProps {
  activeSection: AdminSection;
  setActiveSection: (sec: AdminSection) => void;
  manualQueueCount: number;
  adminUser: { name: string; email: string; role: string };
  onLogout: () => void;
  onReturnToApp: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  setActiveSection,
  manualQueueCount,
  adminUser,
  onLogout,
  onReturnToApp,
}) => {
  const navItems: { id: AdminSection; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'uebersicht', label: '1. Übersicht', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'auftraege', label: '2. Aufträge', icon: <FileText className="w-4 h-4" /> },
    { id: 'zahlungen', label: '3. Zahlungen', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'abmeldungen', label: '4. Abmeldungen', icon: <Car className="w-4 h-4" /> },
    { 
      id: 'manuelle_pruefung', 
      label: '5. Manuelle Prüfung', 
      icon: <AlertOctagon className="w-4 h-4" />,
      badge: manualQueueCount > 0 ? manualQueueCount : undefined,
      badgeColor: 'bg-amber-500 text-white'
    },
    { id: 'kunden', label: '6. Kunden', icon: <Users className="w-4 h-4" /> },
    { id: 'emails', label: '7. E-Mails', icon: <Mail className="w-4 h-4" /> },
    { id: 'rueckerstattungen', label: '8. Rückerstattungen', icon: <RotateCcw className="w-4 h-4" /> },
    { id: 'audit_log', label: '9. Audit Log', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'einstellungen', label: '10. Einstellungen', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight text-white block">
            KFZ Abmelden Online
          </span>
          <span className="text-[11px] font-mono text-blue-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Leitstand v2.4 (Postgres)
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Hauptbereiche
        </div>
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-700 text-white'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User info & Exit */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-white truncate">{adminUser.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono">
              {adminUser.role}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">{adminUser.email}</p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onReturnToApp}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs transition-colors cursor-pointer"
            title="Zurück zum Portal"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Zur App</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-300 rounded text-xs transition-colors cursor-pointer"
            title="Sitzung beenden"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
