import React from 'react';
import { ShieldCheck, ArrowLeft, FileText, Scale, Lock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CurrentScreen } from '../types';

interface LegalViewProps {
  screen: 'impressum' | 'datenschutz' | 'agb' | 'widerruf';
  setCurrentScreen: (screen: CurrentScreen) => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ screen, setCurrentScreen }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentScreen('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Zurück zur Startseite</span>
        </button>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setCurrentScreen('impressum')}
            className={`px-2.5 py-1 rounded-lg transition-all ${screen === 'impressum' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Impressum
          </button>
          <button
            onClick={() => setCurrentScreen('datenschutz')}
            className={`px-2.5 py-1 rounded-lg transition-all ${screen === 'datenschutz' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Datenschutz
          </button>
          <button
            onClick={() => setCurrentScreen('agb')}
            className={`px-2.5 py-1 rounded-lg transition-all ${screen === 'agb' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            AGB
          </button>
          <button
            onClick={() => setCurrentScreen('widerruf')}
            className={`px-2.5 py-1 rounded-lg transition-all ${screen === 'widerruf' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Widerrufsbelehrung
          </button>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs text-xs sm:text-sm text-slate-700 leading-relaxed space-y-6">
        
        {/* ================= IMPRESSUM ================= */}
        {screen === 'impressum' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Gesetzliche Anbieterkennzeichnung
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Impressum gemäß § 5 TMG / DDG
              </h1>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <strong>Klarstellung zum Status:</strong> KFZ Abmelden Online ist ein privates, gewerbliches Unternehmen und steht in keinem behördlichen Auftrag oder Arbeitsverhältnis zu Bundes- oder Landesbehörden.
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900">Angaben gemäß § 5 TMG / DDG</h2>
              <p>
                <strong>KFZ Abmelden Online GmbH</strong><br />
                Friedrichstraße 120<br />
                10117 Berlin<br />
                Deutschland
              </p>
              <p>
                <strong>Vertreten durch die Geschäftsführung:</strong><br />
                Dr. Maximilian Weber, Dipl.-Kfm. Stefan Becker
              </p>
              <p>
                <strong>Kontakt:</strong><br />
                Telefon: +49 (0) 30 8941 2000<br />
                E-Mail: impressum@kfz-abmelden-online.de<br />
                Internet: www.kfz-abmelden-online.de
              </p>
              <p>
                <strong>Registereintrag:</strong><br />
                Eintragung im Handelsregister.<br />
                Registergericht: Amtsgericht Charlottenburg (Berlin)<br />
                Registernummer: HRB 248910 B
              </p>
              <p>
                <strong>Umsatzsteuer-ID:</strong><br />
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                DE 349 812 405
              </p>
              <p>
                <strong>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:</strong><br />
                Dr. Maximilian Weber<br />
                Friedrichstraße 120, 10117 Berlin
              </p>
            </div>
          </div>
        )}

        {/* ================= DATENSCHUTZ ================= */}
        {screen === 'datenschutz' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                DSGVO-Konformität
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Datenschutzerklärung
              </h1>
            </div>

            <p>
              Der Schutz Ihrer persönlichen Daten und Ihrer Fahrzeugdaten hat für die KFZ Abmelden Online GmbH höchste Priorität. Nachfolgend informieren wir Sie über Art, Umfang und Zweck der Erhebung und Verwendung personenbezogener Daten.
            </p>

            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900">1. Verantwortliche Stelle</h2>
              <p>
                KFZ Abmelden Online GmbH, Friedrichstraße 120, 10117 Berlin.<br />
                E-Mail des Datenschutzbeauftragten: datenschutz@kfz-abmelden-online.de
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900">2. Erhebung und Speicherung fahrzeugbezogener Daten</h2>
              <p>
                Zur Durchführung der Außerbetriebsetzung (Abmeldung) Ihres Kraftfahrzeugs über die digitale i-KfZ-Schnittstelle erheben wir ausschließlich die hierfür gesetzlich vorgeschriebenen Daten:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Amtliches Kennzeichen</li>
                <li>Fahrzeug-Identifizierungsnummer (FIN)</li>
                <li>Sicherheitscode der Zulassungsbescheinigung Teil I</li>
                <li>Sicherheitscodes der Siegelplaketten (Vorder- und Hinterkennzeichen)</li>
                <li>Name, Vorname und Anschrift des Fahrzeughalters / Antragstellers</li>
                <li>E-Mail-Adresse zur Übermittlung des digitalen Abmeldebescheids</li>
              </ul>
              <p className="font-semibold text-slate-900">
                Wichtiger Hinweis: Es erfolgt kein Foto-Upload oder Kamera-Scan. Alle Daten werden von Ihnen manuell eingegeben und verschlüsselt transportiert.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900">3. Rechtsgrundlage und Datenlöschung</h2>
              <p>
                Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO zur Erfüllung des mit Ihnen geschlossenen Dienstleistungsvertrags. Nach erfolgreicher Übermittlung an die zuständige Zulassungsstelle und Ablauf der gesetzlichen Aufbewahrungsfristen werden die sensiblen Sicherheitscodes unverzüglich gelöscht.
              </p>
            </div>
          </div>
        )}

        {/* ================= AGB ================= */}
        {screen === 'agb' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Vertragsbedingungen
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Allgemeine Geschäftsbedingungen (AGB)
              </h1>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900">§ 1 Geltungsbereich und Vertragsgegenstand</h2>
              <p>
                (1) Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge über die Erbringung von Dienstleistungen zur Online-Außerbetriebsetzung von Kraftfahrzeugen zwischen der KFZ Abmelden Online GmbH (nachfolgend „Dienstleister“) und dem Kunden.
              </p>
              <p>
                (2) Der Dienstleister erbringt eine <strong>private, gewerbliche Geschäftsbesorgung</strong>. Der Dienstleister ist keine Behörde und handelt im Namen und im Auftrag des Kunden zur elektronischen Übermittlung der Abmeldedaten an die zuständige Zulassungsstelle über die behördliche i-KfZ-Schnittstelle.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900">§ 2 Preise und Zahlungsbedingungen</h2>
              <p>
                (1) Für die Bearbeitung und Bereitstellung des Online-Services berechnet der Dienstleister ein <strong>Dienstleistungsentgelt in Höhe von 19,90 EUR (inkl. 19% gesetzlicher Mehrwertsteuer)</strong>.
              </p>
              <p>
                (2) Hinzu kommen die amtlichen Gebühren der jeweiligen Zulassungsbehörde (i-KfZ GebOSt), welche transparent ausgewiesen und 1:1 weitergeleitet werden (in der Regel 2,70 EUR, sowie ggf. 12,80 EUR bei gewünschter Kennzeichenreservierung).
              </p>
              <p>
                (3) Die Zahlung erfolgt vor der Übermittlung an die Behördenschnittstelle über die angebotenen Zahlungsverfahren (PayPal, Klarna Sofort, SEPA Lastschrift, Kreditkarte).
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900">§ 3 Mitwirkungspflichten des Kunden</h2>
              <p>
                Der Kunde ist verpflichtet, die Daten (FIN, Kennzeichen, Sicherheitscodes) wahrheitsgemäß und fehlerfrei einzugeben. Für Verzögerungen oder Ablehnungen durch die Behörde aufgrund fehlerhafter Angaben haftet der Dienstleister nicht.
              </p>
            </div>
          </div>
        )}

        {/* ================= WIDERRUFSBELEHRUNG ================= */}
        {screen === 'widerruf' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Verbraucherinformation
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Widerrufsbelehrung & Muster-Widerrufsformular
              </h1>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs">
              <strong>Besonderer Hinweis zum vorzeitigen Erlöschen:</strong> Ihr Widerrufsrecht erlischt bei einem Vertrag zur Erbringung von Dienstleistungen vorzeitig, wenn wir die Dienstleistung vollständig erbracht haben und mit der Ausführung der Dienstleistung erst begonnen haben, nachdem Sie dazu Ihre ausdrückliche Zustimmung gegeben und gleichzeitig Ihre Kenntnis davon bestätigt haben (§ 356 Abs. 4 BGB).
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900">Widerrufsrecht</h2>
              <p>
                Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
              </p>
              <p>
                Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (KFZ Abmelden Online GmbH, Friedrichstraße 120, 10117 Berlin, E-Mail: widerruf@kfz-abmelden-online.de) mittels einer eindeutigen Erklärung über Ihren Entschluss informieren.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900">Muster-Widerrufsformular</h2>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 space-y-1">
                <p>An: KFZ Abmelden Online GmbH, Friedrichstraße 120, 10117 Berlin, E-Mail: widerruf@kfz-abmelden-online.de</p>
                <p>Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung (*):</p>
                <p>Auftragsnummer: ________________________</p>
                <p>Bestellt am (*): ________________________</p>
                <p>Name des/der Verbraucher(s): ________________________</p>
                <p>Anschrift: ________________________</p>
                <p>Datum / Unterschrift (nur bei Papier)</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
