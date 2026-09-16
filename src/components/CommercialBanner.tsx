import React from 'react';
import { ShieldAlert, Info, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const CommercialBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 py-2 px-4 text-xs text-amber-900 flex items-center justify-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-200 text-amber-950">
          {t.commercialDisclaimerBadge}
        </span>
        <span>
          {t.commercialDisclaimerHeader}: <strong>19,90 € Servicegebühr</strong> zzgl. amtl. i-KfZ Gebühren.
        </span>
      </div>
    );
  }

  return (
    <aside aria-label="Rechtlicher Hinweis" className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 md:p-5 shadow-xs text-amber-950 my-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="text-sm leading-relaxed space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block px-2.5 py-0.5 bg-amber-200 text-amber-900 font-bold text-xs rounded uppercase tracking-wide">
              {t.commercialDisclaimerBadge}
            </span>
            <span className="font-semibold text-amber-950">
              {t.commercialDisclaimerHeader}
            </span>
          </div>
          <p className="text-amber-900/90">
            {t.commercialDisclaimerDetail}
          </p>
          <div className="pt-1 text-xs text-amber-800 flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium">
              <Info className="w-3.5 h-3.5" />
              Keine amtliche Bundes- oder Landesbehörde
            </span>
            <span>·</span>
            <span>Transparente Festpreis-Pauschale 19,90 €</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
