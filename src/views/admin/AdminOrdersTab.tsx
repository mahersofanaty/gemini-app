import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  ChevronRight, 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  XCircle, 
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

interface OrderItem {
  id: number;
  publicOrderId: string;
  createdAt: string;
  updatedAt: string;
  licensePlate: string;
  registrationDistrict: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: string;
  totalPrice: string;
  currency: string;
  paymentProvider?: string;
  paymentStatus?: string;
  ikfzReference?: string;
}

interface AdminOrdersTabProps {
  orders: OrderItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectOrder: (publicOrderId: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  isLoading,
  onRefresh,
  onSelectOrder,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'erfolgreich_abgemeldet':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Erfolgreich abgemeldet</span>
          </span>
        );
      case 'submitted_to_ikfz':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>An i-KfZ übermittelt</span>
          </span>
        );
      case 'manuelle_pruefung':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertOctagon className="w-3 h-3" />
            <span>Manuelle Prüfung</span>
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Clock className="w-3 h-3" />
            <span>Bezahlt (Wartet)</span>
          </span>
        );
      case 'erstattet':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <RotateCcw className="w-3 h-3" />
            <span>Erstattet</span>
          </span>
        );
      case 'abgelehnt':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>Abgelehnt</span>
          </span>
        );
      case 'storniert':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span>Storniert</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Suche nach Order ID, Kennzeichen, Kunde..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-hidden focus:border-blue-600 focus:bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 font-medium outline-hidden"
            >
              <option value="all">Alle Aufträge</option>
              <option value="erfolgreich_abgemeldet">Erfolgreich abgemeldet</option>
              <option value="manuelle_pruefung">Manuelle Prüfung</option>
              <option value="submitted_to_ikfz">An i-KfZ übermittelt</option>
              <option value="paid">Bezahlt</option>
              <option value="abgelehnt">Abgelehnt</option>
              <option value="erstattet">Erstattet</option>
              <option value="storniert">Storniert</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 cursor-pointer transition-colors"
            title="Aktualisieren"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders Table matching exact required columns:
          - Order ID
          - Date
          - Kennzeichen
          - Customer
          - Status
          - Payment
          - Created
          - Updated
          (NO security codes!)
      */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-4">Kennzeichen</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-3">Updated</th>
                <th className="py-3 px-3 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Lade Auftragsdaten...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Keine Aufträge entsprechend den Suchkriterien gefunden.
                  </td>
                </tr>
              ) : (
                orders.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectOrder(item.publicOrderId)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    {/* 1. Order ID */}
                    <td className="py-3 px-4 font-mono font-bold text-blue-900 whitespace-nowrap">
                      {item.publicOrderId}
                    </td>

                    {/* 2. Date */}
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap font-medium">
                      {new Date(item.createdAt).toLocaleDateString('de-DE')}
                    </td>

                    {/* 3. Kennzeichen (German plate style) */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center border border-slate-400 rounded bg-white px-2 py-0.5 shadow-2xs font-mono font-bold text-slate-900 tracking-wider">
                        <span className="w-1.5 h-3.5 bg-blue-700 rounded-2xs mr-1 inline-block shrink-0" />
                        <span>{item.licensePlate}</span>
                      </div>
                    </td>

                    {/* 4. Customer */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{item.customerName}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[170px]">{item.customerEmail}</p>
                    </td>

                    {/* 5. Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* 6. Payment */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">
                          {Number(item.totalPrice).toFixed(2)} {item.currency || '€'}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          {item.paymentProvider || 'Standard'}
                        </span>
                      </div>
                    </td>

                    {/* 7. Created */}
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(item.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                    </td>

                    {/* 8. Updated */}
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(item.updatedAt || item.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOrder(item.publicOrderId);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            Angezeigt: <strong>{orders.length}</strong> Aufträge
          </span>
          <span className="text-[11px] text-slate-400">
            * Gemäß Sicherheitsrichtlinie werden sensible Rubbel-Sicherheitscodes in dieser Tabellenübersicht niemals ausgegeben.
          </span>
        </div>
      </div>
    </div>
  );
};
