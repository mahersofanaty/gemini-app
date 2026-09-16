import React, { useState } from 'react';
import { 
  Car, 
  ShieldCheck, 
  Globe, 
  Search, 
  HelpCircle, 
  PhoneCall, 
  Menu, 
  X, 
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CurrentScreen, Language } from '../types';

interface HeaderProps {
  currentScreen: CurrentScreen;
  setCurrentScreen: (screen: CurrentScreen) => void;
  onStartWizard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  setCurrentScreen,
  onStartWizard
}) => {
  const { language, setLanguage, t, isRtl } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home' as CurrentScreen, label: t.navHome },
    { id: 'faq' as CurrentScreen, label: t.navFaq },
    { id: 'order-status' as CurrentScreen, label: t.navStatus },
    { id: 'contact' as CurrentScreen, label: t.navContact },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top micro bar for trust & commercial clarity */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-medium text-slate-200">
              Offizielle i-KfZ Übermittlung · Bundesweit in allen 400+ Zulassungsbezirken
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hidden sm:flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Privater Dienstleister (19,90 € Servicegebühr)
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              24/7 Digitaler Sofortbescheid
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo / Brand Name */}
          <button 
            type="button"
            id="brand-logo-btn"
            onClick={() => {
              setCurrentScreen('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-blue-900/10 group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight font-sans">
                  {t.brandName}
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Gewerblicher Dienst
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Außerbetriebsetzung über digitale i-KfZ Schnittstelle
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setCurrentScreen(item.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action & Language Selectors */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div className="relative flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-slate-500 mx-1.5 hidden sm:inline-block" />
              {(['de', 'en', 'ar'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  id={`lang-btn-${lang}`}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 rounded transition-all ${
                    language === lang 
                      ? 'bg-white text-blue-700 shadow-xs font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={lang === 'de' ? 'Deutsch' : lang === 'en' ? 'English' : 'العربية'}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Quick CTA Button */}
            <button
              id="header-cta-start-btn"
              onClick={onStartWizard}
              className="hidden sm:inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold px-4 py-2.5 rounded-lg shadow-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>{t.navStart}</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
            Navigation
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => {
                setCurrentScreen(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-base font-medium flex items-center justify-between ${
                currentScreen === item.id 
                  ? 'bg-blue-50 text-blue-700 font-bold' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{item.label}</span>
              {currentScreen === item.id && <span className="w-2 h-2 rounded-full bg-blue-600" />}
            </button>
          ))}
          <div className="pt-2">
            <button
              id="mobile-nav-cta-btn"
              onClick={() => {
                onStartWizard();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm text-base"
            >
              <FileCheck className="w-5 h-5" />
              <span>{t.btnStartNow}</span>
            </button>
          </div>
          <div className="pt-2 px-2 text-xs text-slate-500">
            Privater gewerblicher Dienstleister · 19,90 € Servicegebühr zzgl. amtl. Gebühren
          </div>
        </div>
      )}
    </header>
  );
};
