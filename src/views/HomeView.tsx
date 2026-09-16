import React from 'react';
import { 
  Car, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Lock, 
  Check, 
  HelpCircle, 
  Sparkles,
  Zap,
  Building2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CommercialBanner } from '../components/CommercialBanner';
import { PlateGraphic } from '../components/PlateGraphic';
import { CurrentScreen } from '../types';

interface HomeViewProps {
  onStartWizard: () => void;
  setCurrentScreen: (screen: CurrentScreen) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onStartWizard, setCurrentScreen }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Top Commercial Disclaimer Banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
        <CommercialBanner />
      </div>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-b from-white to-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm text-center lg:text-left relative overflow-hidden">
          {/* Subtle decorative background accent */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-50/60 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-5 text-left">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <Zap className="w-3.5 h-3.5" />
                  {t.heroBadgeSpeed}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Bundesweit in ganz Deutschland
                </span>
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                {t.heroTitle}
              </h1>
              <p className="text-lg font-bold text-blue-700">
                {t.heroHighlight}
              </p>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                {t.heroSubtitle}
              </p>

              {/* Bullet points */}
              <ul className="space-y-2 text-sm text-slate-700 pt-1">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Sofortiger Abmeldebescheid (PDF):</strong> Offiziell anerkannt für Versicherung & Zoll</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Feste Gebühr:</strong> 19,90 € Service-Pauschale zzgl. 2,70 € Behördengebühr</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>100% Manuelle Eingabe:</strong> Kein Foto-Scan nötig, maximale Datensicherheit</span>
                </li>
              </ul>

              {/* Hero Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  id="hero-start-btn"
                  onClick={onStartWizard}
                  className="inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base font-bold px-7 py-3.5 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <span>{t.btnStartNow}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  id="hero-check-status-btn"
                  onClick={() => setCurrentScreen('order-status')}
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-sm font-semibold px-5 py-3.5 rounded-xl transition-all"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Bestehenden Auftrag abfragen</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-2 pt-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Geschützte Übertragung · Verschlüsselte i-KfZ Schnittstelle</span>
              </div>
            </div>

            {/* Right Hero Card: Fee Box & Interactive Plate preview */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Kostenrechner
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Festpreis-Garantie
                  </span>
                </div>

                {/* Euro Plate display */}
                <div className="text-center py-2">
                  <div className="text-xs text-slate-500 mb-2 font-medium">Beispiel-Kennzeichen:</div>
                  <PlateGraphic city="B" letters="MW" numbers="2026" />
                </div>

                {/* Price Breakdown in Hero */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs border border-slate-200/80">
                  <div className="flex justify-between items-center text-slate-700">
                    <span>Gewerblicher Service (KFZ Abmelden Online):</span>
                    <span className="font-mono font-bold text-slate-900">19,90 €</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pl-2">
                    inkl. 19% MwSt. (3,18 €)
                  </div>
                  
                  <div className="flex justify-between items-center text-slate-700 pt-1 border-t border-slate-200">
                    <span>Amtliche Behördengebühr (i-KfZ GebOSt):</span>
                    <span className="font-mono font-bold text-slate-900">2,70 €</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pl-2">
                    Weiterleitung 1:1 an die Zulassungsstelle
                  </div>

                  <div className="pt-3 border-t-2 border-slate-200 flex justify-between items-baseline">
                    <span className="font-bold text-sm text-slate-900">Gesamtbetrag:</span>
                    <span className="text-xl font-black text-blue-700 font-mono">22,60 €</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 text-center">
                  Gewerblicher Dienstleister. Keine versteckten Abos oder Zusatzkosten.
                </div>

                <button
                  type="button"
                  id="hero-card-cta-btn"
                  onClick={onStartWizard}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-xs"
                >
                  Jetzt in 2 Minuten abmelden &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Steps Explainer Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Einfacher Ablauf
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {t.heroStepsTitle}
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            In wenigen unkomplizierten Schritten von zu Hause aus erledigt – rund um die Uhr.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-base mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                {t.step1Title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.step1Desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-500">
              Dauer: ca. 60 Sekunden
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-base mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                {t.step2Title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.step2Desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-500">
              Mit Münze freirubbeln
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-base mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                {t.step3Title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.step3Desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-500">
              PayPal, Klarna, SEPA & Co.
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-base mb-4">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                {t.step4Title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.step4Desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-emerald-700 font-semibold">
              Sofortiger Download
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Local Bureau vs Online */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Vergleich
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {t.comparisonTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bureau */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center gap-2.5 font-bold text-slate-800 text-base mb-4">
                <Building2 className="w-5 h-5 text-slate-500" />
                <span>Klassischer Weg: Zulassungsstelle vor Ort</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Oft 2 bis 6 Wochen Wartezeit auf einen freien Behördentermin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Anfahrt im Berufsverkehr, Parkplatzsuche und Wartezimmer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Verlust von Urlaubstagen oder Arbeitszeit durch feste Öffnungszeiten</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Physische Kennzeichenschilder müssen vor Ort vorgelegt werden</span>
                </li>
              </ul>
            </div>

            {/* Our Service */}
            <div className="bg-blue-50/70 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center gap-2.5 font-bold text-blue-900 text-base mb-4">
                <Zap className="w-5 h-5 text-blue-600" />
                <span>KFZ Abmelden Online (Privater Dienst)</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-blue-950">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 font-bold shrink-0 mt-0.5" />
                  <span><strong>24/7 sofort verfügbar:</strong> Auch am Wochenende und feiertags</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 font-bold shrink-0 mt-0.5" />
                  <span><strong>In 2 Minuten erledigt:</strong> Bequem vom Sofa oder unterwegs per Smartphone</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 font-bold shrink-0 mt-0.5" />
                  <span><strong>Rechtsgültiger Bescheid:</strong> Sofortiges PDF für Versicherung & Zoll</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 font-bold shrink-0 mt-0.5" />
                  <span><strong>Transparenter Festpreis:</strong> 19,90 € Service-Entgelt zzgl. Behördengebühr</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Prerequisites Checklist */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg">
          <div className="max-w-2xl mb-6">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Vorab-Prüfung
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold mt-1">
              {t.prerequisitesTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Für das offizielle i-KfZ-Verfahren müssen folgende Kriterien erfüllt sein:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
            <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700">
              <div className="text-emerald-400 font-bold text-sm mb-2">
                1. Zulassung ab 2015
              </div>
              <p className="text-slate-300 leading-relaxed">
                {t.prereq1}
              </p>
            </div>

            <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700">
              <div className="text-emerald-400 font-bold text-sm mb-2">
                2. Plaketten mit QR-Code
              </div>
              <p className="text-slate-300 leading-relaxed">
                {t.prereq2}
              </p>
            </div>

            <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700">
              <div className="text-emerald-400 font-bold text-sm mb-2">
                3. Manuelle Eingabe
              </div>
              <p className="text-slate-300 leading-relaxed">
                {t.prereq3}
              </p>
            </div>
          </div>

          {/* CTA Banner inside dark section */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Erfüllen Sie diese Kriterien? Dann können Sie die Abmeldung jetzt sofort starten.
            </div>
            <button
              type="button"
              id="prereq-cta-start-btn"
              onClick={onStartWizard}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              Jetzt starten (19,90 € Servicegebühr) &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Customer Trust Reviews */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Erfahrungsberichte
          </span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            Das sagen Kunden in ganz Deutschland
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Über 15.000 erfolgreich abgewickelte Online-Abmeldungen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-xs space-y-2.5">
            <div className="text-amber-400 font-bold tracking-wider">★★★★★</div>
            <p className="text-slate-700 italic">
              "Unglaublich schnell. Beim Bürgeramt in Berlin hätte ich 4 Wochen auf einen Termin gewartet. Hier war alles nach 3 Minuten erledigt und ich hatte die Bestätigung direkt als PDF!"
            </p>
            <div className="font-bold text-slate-900 pt-2 border-t border-slate-100">
              Michael B., Berlin (BMW 3er)
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-xs space-y-2.5">
            <div className="text-amber-400 font-bold tracking-wider">★★★★★</div>
            <p className="text-slate-700 italic">
              "Sehr transparente Kosten: Genau wie beschrieben 19,90 € Service plus die 2,70 € Gebühr. Die Versicherung hat die Abmeldung sofort anerkannt. Toller privater Service."
            </p>
            <div className="font-bold text-slate-900 pt-2 border-t border-slate-100">
              Sandra K., München (VW Golf)
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-xs space-y-2.5">
            <div className="text-amber-400 font-bold tracking-wider">★★★★★</div>
            <p className="text-slate-700 italic">
              "Die Anleitung für die Rubbelcodes auf Kennzeichen und Fahrzeugschein war super verständlich. Kein Foto-Upload nötig, einfach per Hand eingetippt. Sehr sicher."
            </p>
            <div className="font-bold text-slate-900 pt-2 border-t border-slate-100">
              Tarek A., Köln (Mercedes C-Klasse)
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-lg font-bold text-slate-900">
              Haben Sie noch Fragen zum Ablauf oder zu den Gebühren?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Lesen Sie unsere Antworten zu Versicherung, Kfz-Steuer, Kennzeichen und Zulassungsbezirken.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCurrentScreen('faq')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs whitespace-nowrap transition-colors"
          >
            Häufige Fragen (FAQ) lesen &rarr;
          </button>
        </div>
      </section>
    </div>
  );
};
