import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ShieldCheck, ArrowRight, FileCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CurrentScreen } from '../types';

interface FAQViewProps {
  onStartWizard: () => void;
  setCurrentScreen: (screen: CurrentScreen) => void;
}

interface FAQItem {
  question: string;
  answer: React.ReactNode;
  category: string;
}

export const FAQView: React.FC<FAQViewProps> = ({ onStartWizard, setCurrentScreen }) => {
  const { t } = useLanguage();
  const [openIndices, setOpenIndices] = useState<number[]>([0, 1]);

  const toggleIndex = (index: number) => {
    if (openIndices.includes(index)) {
      setOpenIndices(openIndices.filter(i => i !== index));
    } else {
      setOpenIndices([...openIndices, index]);
    }
  };

  const faqs: FAQItem[] = [
    {
      category: 'Kosten & Gebühren',
      question: 'Welche Kosten fallen für die Online-Abmeldung genau an?',
      answer: (
        <div className="space-y-2">
          <p>
            Unser Preismodell ist vollkommen transparent und gesetzestreu aufgeschlüsselt:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li><strong>19,90 € Service-Entgelt:</strong> Dies ist unsere gewerbliche Bearbeitungsgebühr (inkl. 19% MwSt.) für die Bereitstellung des Online-Dienstes, die Validierung und die automatisierte Übermittlung an die Behördenschnittstelle.</li>
            <li><strong>2,70 € Amtliche Behördengebühr:</strong> Dies ist die bundeseinheitliche Gebühr gemäß GebOSt (Gebührenordnung für Maßnahmen im Straßenverkehr) für die Außerbetriebsetzung über i-KfZ. Diese Gebühr leiten wir 1:1 an die zuständige Zulassungsstelle weiter.</li>
            <li><strong>Optional 12,80 €:</strong> Falls Sie Ihr Kennzeichen für eine spätere Wiederzulassung reservieren möchten.</li>
          </ul>
          <p className="pt-1 font-semibold text-slate-900">
            Der Standard-Gesamtbetrag ohne Kennzeichenreservierung beträgt somit exakt 22,60 €.
          </p>
        </div>
      )
    },
    {
      category: 'Allgemein',
      question: 'Ist dieser Dienst ein offizielles staatliches Behördenportal?',
      answer: (
        <p>
          <strong>Nein.</strong> KFZ Abmelden Online ist ein <em>privater, gewerblicher Dienstleister</em>. Wir handeln im Auftrag unserer Kunden und übermitteln die Abmeldedaten über die standardisierte i-KfZ Schnittstelle des Kraftfahrt-Bundesamtes (KBA) an die zuständigen Zulassungsbehörden. Der Vorteil für Sie: Kein Termin vor Ort, kein mühsames Warten, keine eID-PIN-Pflicht und eine extrem einfache Benutzerführung.
        </p>
      )
    },
    {
      category: 'Voraussetzungen',
      question: 'Welche Fahrzeuge können online abgemeldet werden?',
      answer: (
        <div className="space-y-2">
          <p>
            Nahezu alle Kraftfahrzeuge (Pkw, Lkw, Motorräder, Anhänger, Wohnmobile), sofern folgende behördliche Kriterien erfüllt sind:
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li><strong>Zulassung ab dem 01.01.2015:</strong> Die Zulassungsbescheinigung Teil I (Fahrzeugschein) muss nach diesem Datum ausgestellt worden sein und besitzt auf der Rückseite ein grünes Rubbelfeld mit Sicherheitscode.</li>
            <li><strong>Sicherheitscodes auf den Kennzeichen:</strong> Die Stempelplaketten der Kennzeichenschilder verfügen über einen abziehbaren/freirubbelbaren Sicherheitscode.</li>
          </ol>
        </div>
      )
    },
    {
      category: 'Sicherheitscodes',
      question: 'Muss ich Dokumente scannen oder Fotos hochladen?',
      answer: (
        <p>
          <strong>Nein!</strong> Aus Gründen des Datenschutzes und zur Vermeidung von Scan-Fehlern tippen Sie alle Daten (FIN, Kennzeichen und die freigerubbelten Sicherheitscodes) bequem manuell per Tastatur oder Smartphone-Tastatur ein. Es wird weder eine Kamera noch ein Datei-Upload benötigt.
        </p>
      )
    },
    {
      category: 'Versicherung & Steuer',
      question: 'Wie erfahren Kfz-Versicherung und Hauptzollamt von der Abmeldung?',
      answer: (
        <p>
          Dies geschieht <strong>vollautomatisch</strong>: Sobald die Außerbetriebsetzung über die i-KfZ-Schnittstelle registriert ist, übermittelt die Zulassungsbehörde die Abmeldebestätigung auf digitalem Weg direkt an Ihre Kfz-Haftpflichtversicherung sowie an das Hauptzollamt (zuständig für die Kraftfahrzeugsteuer). Sie müssen sich um nichts weiter kümmern. Eventuell zu viel gezahlte Kfz-Steuer wird Ihnen vom Zollamt zurücküberwiesen.
        </p>
      )
    },
    {
      category: 'Kennzeichen',
      question: 'Was mache ich mit den physischen Nummernschildern nach der Abmeldung?',
      answer: (
        <p>
          Durch das Freilegen der Rubbelcodes bzw. das Abziehen der Stempelplaketten sind die Kennzeichenschilder <strong>rechtlich entwertet</strong>. Sie dürfen mit diesen Schildern nicht mehr am öffentlichen Straßenverkehr teilnehmen. Sie müssen die Schilder nicht bei der Behörde abgeben, sondern können sie behalten oder entsorgen.
        </p>
      )
    },
    {
      category: 'Kennzeichen',
      question: 'Kann ich mein altes Kennzeichen für mein nächstes Auto behalten?',
      answer: (
        <p>
          Ja! In Schritt 4 unseres Abmelde-Assistenten können Sie die Option <em>Kennzeichenreservierung</em> aktivieren. Wir hinterlegen Ihre Wunsch-PIN bei der Zulassungsstelle, sodass das Kennzeichen bis zu 12 Monate für Sie blockiert bleibt.
        </p>
      )
    },
    {
      category: 'Rechtliches',
      question: 'Erhalte ich eine offizielle Bestätigung für meine Unterlagen?',
      answer: (
        <p>
          Ja. Unmittelbar nach der erfolgreichen Übermittlung generiert das System Ihren offiziellen <strong>digitalen Abmeldenachweis (PDF)</strong> gemäß § 15a FZV. Diesen können Sie sofort herunterladen, ausdrucken und er wird Ihnen zusätzlich per E-Mail zugestellt.
        </p>
      )
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Wissensdatenbank
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          {t.navFaq}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Alle wichtigen Antworten zur Online-Außerbetriebsetzung in Deutschland
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndices.includes(idx);
          return (
            <div 
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
            >
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors focus:outline-none"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {faq.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 pt-1">
                    {faq.question}
                  </h3>
                </div>
                <div className="p-1 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 leading-relaxed bg-white">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help box */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-lg font-bold">
            Haben Sie eine spezielle Frage zu Ihrem Fahrzeugschein?
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Unser Kundensupport berät Sie gerne persönlich zu Ihrem Einzelfall.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setCurrentScreen('contact')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            Kontaktieren Sie uns
          </button>
          <button
            type="button"
            onClick={onStartWizard}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Jetzt abmelden &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
