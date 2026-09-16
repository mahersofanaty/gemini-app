import React from 'react';
import { ShieldCheck, Lock, Check, HelpCircle, Phone, Mail, MapPin, ExternalLink, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CurrentScreen } from '../types';

interface FooterProps {
  setCurrentScreen: (screen: CurrentScreen) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentScreen }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Prominent Legal Disclaimer Box */}
        <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/80 mb-10">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="font-bold text-white flex items-center gap-2">
                <span>{t.commercialDisclaimerHeader}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-semibold uppercase">
                  Privater Dienstleister
                </span>
              </div>
              <p className="text-slate-400">
                {t.footerCommercialNotice} Die behördliche Außerbetriebsetzung wird im Wege der Bevollmächtigung über das behördliche Portal des Kraftfahrt-Bundesamtes (KBA) bzw. die zuständigen kommunalen Zulassungsbehörden gemäß Fahrzeug-Zulassungsverordnung (FZV / i-KfZ Stufe 4) durchgeführt.
              </p>
              <div className="text-xs text-slate-400 pt-1 flex flex-wrap gap-x-4 gap-y-1">
                <span>✓ Unser Servicepreis: <strong>19,90 €</strong> (inkl. 19% MwSt.)</span>
                <span>✓ Behördengebühr: <strong>2,70 €</strong></span>
                <span>✓ Keine versteckten Kosten</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-white text-lg">
              <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm">
                KFZ
              </span>
              <span>{t.brandName}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ihr digitaler Dienstleister für die unkomplizierte, schnelle und rechtssichere Abmeldung von Kraftfahrzeugen in ganz Deutschland.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-Bit TLS</span>
              </div>
              <span className="text-slate-600">·</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>DSGVO-konform</span>
              </div>
            </div>
          </div>

          {/* Service Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm tracking-wide uppercase">
              Online-Dienste
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => setCurrentScreen('wizard')}
                  className="hover:text-white transition-colors"
                >
                  Fahrzeug jetzt online abmelden
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentScreen('order-status')}
                  className="hover:text-white transition-colors"
                >
                  Auftragsstatus abfragen & Bescheid laden
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentScreen('faq')}
                  className="hover:text-white transition-colors"
                >
                  Anleitung: Wo finde ich die Rubbelcodes?
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentScreen('faq')}
                  className="hover:text-white transition-colors"
                >
                  i-KfZ Voraussetzungen (ab 2015)
                </button>
              </li>
            </ul>
          </div>

          {/* Legal / Rechtliches */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm tracking-wide uppercase">
              Rechtliches & Verbraucherschutz
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  id="footer-impressum-btn"
                  onClick={() => setCurrentScreen('impressum')}
                  className="hover:text-white transition-colors"
                >
                  {t.legalImpressum}
                </button>
              </li>
              <li>
                <button
                  id="footer-datenschutz-btn"
                  onClick={() => setCurrentScreen('datenschutz')}
                  className="hover:text-white transition-colors"
                >
                  {t.legalDatenschutz}
                </button>
              </li>
              <li>
                <button
                  id="footer-agb-btn"
                  onClick={() => setCurrentScreen('agb')}
                  className="hover:text-white transition-colors"
                >
                  {t.legalAgb}
                </button>
              </li>
              <li>
                <button
                  id="footer-widerruf-btn"
                  onClick={() => setCurrentScreen('widerruf')}
                  className="hover:text-white transition-colors"
                >
                  {t.legalWiderruf}
                </button>
              </li>
              <li className="pt-2 border-t border-slate-800">
                <button
                  id="footer-admin-btn"
                  onClick={() => setCurrentScreen('admin')}
                  className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 text-[11px]"
                >
                  <Lock className="w-3 h-3" />
                  <span>Mitarbeiter-Leitstand (Admin)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact / Help */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm tracking-wide uppercase">
              Kundenservice & Hilfe
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>support@kfz-abmelden-online.de</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Mo–Fr: 08:00 – 18:00 Uhr</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>Friedrichstraße 120, 10117 Berlin, Deutschland</span>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setCurrentScreen('contact')}
                  className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                >
                  Zum Kontaktformular &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment badges & certifications */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 mr-2">Sichere Zahlungsmethoden:</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700">PayPal</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700">Klarna Sofort</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700">SEPA Lastschrift</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700">Visa / Mastercard</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700">Apple Pay / Google Pay</span>
          </div>

          <div>
            © {new Date().getFullYear()} KFZ Abmelden Online. {t.footerRights}
          </div>
        </div>
      </div>
    </footer>
  );
};
