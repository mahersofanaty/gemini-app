import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { translations, TranslationSet } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationSet;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('de');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kfz_abmelden_lang', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('kfz_abmelden_lang') as Language;
    if (saved && (saved === 'de' || saved === 'en' || saved === 'ar')) {
      setLanguageState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
    } else {
      document.documentElement.lang = 'de';
      document.documentElement.dir = 'ltr';
    }
  }, []);

  const isRtl = language === 'ar';
  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
