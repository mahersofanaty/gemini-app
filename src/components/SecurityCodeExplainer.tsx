import React, { useState } from 'react';
import { HelpCircle, Eye, EyeOff, ShieldCheck, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const SecurityCodeExplainer: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'zbi' | 'plakette'>('zbi');
  const [simulatedScratchZBI, setSimulatedScratchZBI] = useState(false);
  const [simulatedScratchPlate, setSimulatedScratchPlate] = useState(false);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Visuelle Anleitung
          </span>
          <h4 className="text-base font-bold text-slate-900">
            Wo finde ich die benötigten Sicherheitscodes?
          </h4>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-200/80 p-1 rounded-lg text-xs font-semibold">
          <button
            type="button"
            id="tab-zbi-btn"
            onClick={() => setActiveTab('zbi')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'zbi' 
                ? 'bg-white text-blue-700 shadow-xs font-bold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fahrzeugschein (Teil I)
          </button>
          <button
            type="button"
            id="tab-plakette-btn"
            onClick={() => setActiveTab('plakette')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'plakette' 
                ? 'bg-white text-blue-700 shadow-xs font-bold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kennzeichen-Plaketten
          </button>
        </div>
      </div>

      {/* Tab 1: Fahrzeugschein ZB I */}
      {activeTab === 'zbi' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p className="font-semibold text-slate-900">
              1. Rückseite der Zulassungsbescheinigung Teil I (Zulassung ab 01.01.2015)
            </p>
            <p>
              Auf der Rückseite des Fahrzeugscheins befindet sich ein grünes, verdecktes Rubbelfeld mit der Aufschrift <em>"Sicherheitscode"</em>.
            </p>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Vorgehensweise:
              </div>
              <p className="text-slate-600">
                1. Reiben Sie das grüne Feld vorsichtig mit einer Münze oder dem Fingernagel frei.
              </p>
              <p className="text-slate-600">
                2. Darunter erscheint ein <strong>7-stelliger alphanumerischer Code</strong> (z.B. <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">A7B3X9K</code>).
              </p>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              *Hinweis: Wenn Ihr Fahrzeugschein vor 2015 ausgestellt wurde, besitzt er keinen Sicherheitscode. In diesem Fall ist keine i-KfZ Online-Abmeldung möglich.
            </p>
          </div>

          {/* Interactive Graphic Simulation */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[280px] bg-emerald-50/70 border-2 border-emerald-600/40 rounded-xl p-4 shadow-sm relative">
              <div className="text-[9px] font-mono text-emerald-800 uppercase tracking-widest text-center border-b border-emerald-200 pb-1 mb-3">
                Zulassungsbescheinigung Teil I (Rückseite)
              </div>
              
              <div className="space-y-2 text-[10px] text-slate-600 font-mono">
                <div className="h-2 bg-emerald-200/50 rounded w-3/4"></div>
                <div className="h-2 bg-emerald-200/50 rounded w-1/2"></div>
              </div>

              {/* Rubbelfeld */}
              <div className="mt-4 pt-3 border-t border-dashed border-emerald-300">
                <div className="text-[10px] font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Sicherheitscode:</span>
                  <button
                    type="button"
                    onClick={() => setSimulatedScratchZBI(!simulatedScratchZBI)}
                    className="text-[10px] text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    {simulatedScratchZBI ? 'Wieder verdecken' : 'Vorschau freirubbeln'}
                  </button>
                </div>

                <div 
                  onClick={() => setSimulatedScratchZBI(!simulatedScratchZBI)}
                  className={`h-11 rounded-lg border flex items-center justify-center font-mono font-bold text-sm cursor-pointer transition-all ${
                    simulatedScratchZBI 
                      ? 'bg-amber-100 border-amber-400 text-slate-900' 
                      : 'bg-gradient-to-r from-emerald-600 to-teal-700 border-emerald-800 text-emerald-100 shadow-inner'
                  }`}
                >
                  {simulatedScratchZBI ? (
                    <span className="tracking-widest">A 7 B 3 X 9 K</span>
                  ) : (
                    <span className="text-xs opacity-90">Hier freirubbeln 🪙</span>
                  )}
                </div>
              </div>

              <div className="text-[9px] text-center text-slate-400 mt-2">
                Schematische Darstellung des Original-Rubbelfelds
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Nummernschild Plaketten */}
      {activeTab === 'plakette' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p className="font-semibold text-slate-900">
              2. Stempelplaketten auf den Nummernschildern (Vorne & Hinten)
            </p>
            <p>
              Auf den Kennzeichenschildern befinden sich die runden Zulassungsplaketten der Zulassungsstelle (Bundesland-Wappen).
            </p>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Vorgehensweise:
              </div>
              <p className="text-slate-600">
                1. Ziehen Sie die obere Schutzschicht der Plakette ab oder rubbeln Sie den Code frei.
              </p>
              <p className="text-slate-600">
                2. Darunter befindet sich jeweils ein <strong>3-stelliger Sicherheitscode</strong> (z.B. <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">4X9</code> vorne und <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">8R2</code> hinten).
              </p>
              <p className="text-slate-600">
                3. Durch das Freilegen wird die Plakette unwiderruflich zerstört (Entwertung des Kennzeichens).
              </p>
            </div>
          </div>

          {/* Interactive Graphic Simulation */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[280px] bg-slate-100 border border-slate-300 rounded-xl p-4 shadow-sm text-center">
              <div className="text-[10px] font-bold text-slate-700 mb-2">
                Stempelplakette (Kennzeichen)
              </div>

              <div 
                onClick={() => setSimulatedScratchPlate(!simulatedScratchPlate)}
                className="w-24 h-24 mx-auto rounded-full cursor-pointer flex flex-col items-center justify-center transition-all border-4 shadow-md relative"
                style={{
                  backgroundColor: simulatedScratchPlate ? '#FEF3C7' : '#DBEAFE',
                  borderColor: simulatedScratchPlate ? '#D97706' : '#2563EB'
                }}
              >
                {simulatedScratchPlate ? (
                  <>
                    <span className="text-[9px] font-bold uppercase text-amber-900">Code</span>
                    <span className="text-lg font-mono font-black text-slate-900 tracking-wider">4X9</span>
                    <span className="text-[8px] text-amber-800 font-bold">ENTWERTET</span>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-800 font-serif font-bold text-sm">
                      §
                    </div>
                    <span className="text-[9px] font-bold text-blue-900 mt-1">Klicken zum Abziehen</span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSimulatedScratchPlate(!simulatedScratchPlate)}
                className="mt-3 text-xs text-blue-600 hover:text-blue-800 underline"
              >
                {simulatedScratchPlate ? 'Plakette wiederherstellen (Demo)' : 'Plakette abziehen (Demo)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security notice regarding no camera scanning */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Manuelle Eingabe für maximale Datensicherheit:</strong> Es ist kein Kamera-Scan oder Foto-Upload nötig. Sie tippen die Codes einfach direkt in die Textfelder ein.
        </span>
      </div>
    </div>
  );
};
