import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CurrentScreen } from '../types';

interface ContactViewProps {
  setCurrentScreen: (screen: CurrentScreen) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ setCurrentScreen }) => {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    subject: 'Allgemeine Frage',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Kundenservice
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          {t.navContact}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Unser deutsches Support-Team hilft Ihnen gerne bei allen Fragen rund um Ihre Fahrzeugabmeldung.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Information Column */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-900 text-base">
              Erreichbarkeit & Servicezeiten
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Telefon-Hotline</span>
                  <p className="text-slate-500 mt-0.5">+49 (0) 30 8941 2000</p>
                  <p className="text-[11px] text-slate-400">Mo–Fr: 08:00 – 18:00 Uhr</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">E-Mail Support</span>
                  <p className="text-slate-500 mt-0.5">support@kfz-abmelden-online.de</p>
                  <p className="text-[11px] text-slate-400">Antwortzeit i.d.R. unter 2 Stunden</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Postanschrift</span>
                  <p className="text-slate-500 mt-0.5 leading-snug">
                    KFZ Abmelden Online GmbH<br />
                    Friedrichstraße 120<br />
                    10117 Berlin, Deutschland
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Gewerblicher Dienstleister mit Sitz in Berlin</span>
            </div>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="md:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Nachricht erfolgreich übermittelt!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                  Vielen Dank für Ihre Nachricht. Unser Support-Team wird sich schnellstmöglich unter <strong>{formData.email}</strong> bei Ihnen melden.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', orderNumber: '', subject: 'Allgemeine Frage', message: '' });
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition-colors"
                >
                  Neue Nachricht verfassen
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
                  Nachricht an das Serviceteam senden
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Ihr Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Max Mustermann"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Ihre E-Mail-Adresse <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="ihre-email@domain.de"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Auftragsnummer (falls vorhanden)
                    </label>
                    <input
                      type="text"
                      placeholder="z.B. KFZ-2026-..."
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Thema
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Allgemeine Frage">Allgemeine Frage</option>
                      <option value="Status meines Auftrags">Status meines Auftrags</option>
                      <option value="Sicherheitscodes nicht lesbar">Sicherheitscodes nicht lesbar</option>
                      <option value="Rechnung & Bezahlung">Rechnung & Bezahlung</option>
                      <option value="Technische Unterstützung">Technische Unterstützung</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Ihre Nachricht <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Beschreiben Sie Ihr Anliegen so detailliert wie möglich..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  id="submit-contact-form-btn"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Nachricht jetzt absenden</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
