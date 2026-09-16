import React from 'react';
import { 
  CalendarDays, 
  TrendingUp, 
  Euro, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon, 
  RotateCcw 
} from 'lucide-react';

export interface DashboardKpis {
  ordersToday: number;
  ordersThisWeek: number;
  revenueToday: number;
  revenueThisMonth: number;
  successfulAbmeldungen: number;
  failedRequests: number;
  manualReviewQueue: number;
  refunds: number;
}

interface AdminKpiCardsProps {
  kpis: DashboardKpis;
  onNavigateToSection?: (section: any) => void;
}

export const AdminKpiCards: React.FC<AdminKpiCardsProps> = ({ kpis, onNavigateToSection }) => {
  const cards = [
    {
      id: 'ordersToday',
      title: 'Aufträge heute',
      subtitle: 'Orders today',
      value: kpis.ordersToday,
      unit: '',
      icon: <CalendarDays className="w-4 h-4 text-blue-600" />,
      bgColor: 'bg-blue-50/70',
      borderColor: 'border-blue-200/80',
      textColor: 'text-blue-900',
      action: () => onNavigateToSection?.('auftraege'),
    },
    {
      id: 'ordersThisWeek',
      title: 'Aufträge diese Woche',
      subtitle: 'Orders this week',
      value: kpis.ordersThisWeek,
      unit: '',
      icon: <TrendingUp className="w-4 h-4 text-indigo-600" />,
      bgColor: 'bg-indigo-50/70',
      borderColor: 'border-indigo-200/80',
      textColor: 'text-indigo-900',
      action: () => onNavigateToSection?.('auftraege'),
    },
    {
      id: 'revenueToday',
      title: 'Umsatz heute',
      subtitle: 'Revenue today',
      value: kpis.revenueToday.toFixed(2),
      unit: ' €',
      icon: <Euro className="w-4 h-4 text-emerald-600" />,
      bgColor: 'bg-emerald-50/70',
      borderColor: 'border-emerald-200/80',
      textColor: 'text-emerald-900',
      action: () => onNavigateToSection?.('zahlungen'),
    },
    {
      id: 'revenueThisMonth',
      title: 'Umsatz dieser Monat',
      subtitle: 'Revenue this month',
      value: kpis.revenueThisMonth.toFixed(2),
      unit: ' €',
      icon: <CreditCard className="w-4 h-4 text-teal-600" />,
      bgColor: 'bg-teal-50/70',
      borderColor: 'border-teal-200/80',
      textColor: 'text-teal-900',
      action: () => onNavigateToSection?.('zahlungen'),
    },
    {
      id: 'successfulAbmeldungen',
      title: 'Erfolgreiche Abmeldungen',
      subtitle: 'Successful Abmeldungen',
      value: kpis.successfulAbmeldungen,
      unit: '',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-700" />,
      bgColor: 'bg-emerald-50/50',
      borderColor: 'border-emerald-300',
      textColor: 'text-emerald-900',
      action: () => onNavigateToSection?.('abmeldungen'),
    },
    {
      id: 'failedRequests',
      title: 'Fehlgeschlagene Anfragen',
      subtitle: 'Failed requests',
      value: kpis.failedRequests,
      unit: '',
      icon: <XCircle className="w-4 h-4 text-rose-600" />,
      bgColor: 'bg-rose-50/70',
      borderColor: 'border-rose-200/80',
      textColor: 'text-rose-900',
      action: () => onNavigateToSection?.('auftraege'),
    },
    {
      id: 'manualReviewQueue',
      title: 'Manuelle Prüfung',
      subtitle: 'Manual review queue',
      value: kpis.manualReviewQueue,
      unit: '',
      icon: <AlertOctagon className="w-4 h-4 text-amber-600" />,
      bgColor: kpis.manualReviewQueue > 0 ? 'bg-amber-100/70' : 'bg-amber-50/50',
      borderColor: kpis.manualReviewQueue > 0 ? 'border-amber-400' : 'border-amber-200',
      textColor: 'text-amber-900',
      highlightBadge: kpis.manualReviewQueue > 0 ? 'Handlungsbedarf' : undefined,
      action: () => onNavigateToSection?.('manuelle_pruefung'),
    },
    {
      id: 'refunds',
      title: 'Rückerstattungen',
      subtitle: 'Refunds',
      value: kpis.refunds,
      unit: '',
      icon: <RotateCcw className="w-4 h-4 text-purple-600" />,
      bgColor: 'bg-purple-50/70',
      borderColor: 'border-purple-200/80',
      textColor: 'text-purple-900',
      action: () => onNavigateToSection?.('rueckerstattungen'),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((c) => (
        <div
          key={c.id}
          onClick={c.action}
          className={`p-4 rounded-xl border ${c.borderColor} ${c.bgColor} transition-all duration-150 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                {c.subtitle}
              </span>
              <h3 className="text-xs font-bold text-slate-800 mt-0.5">{c.title}</h3>
            </div>
            <div className="p-2 rounded-lg bg-white shadow-xs shrink-0">{c.icon}</div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <span className={`text-2xl font-black tracking-tight ${c.textColor}`}>
              {c.value}
              <span className="text-base font-semibold">{c.unit}</span>
            </span>
            {c.highlightBadge && (
              <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                {c.highlightBadge}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
