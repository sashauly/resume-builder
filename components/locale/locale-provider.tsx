'use client';

import type React from 'react';

import { createContext, useState, useEffect } from 'react';

type LocaleContextType = {
  locale: 'en' | 'ru';
  setLocale: (locale: 'en' | 'ru') => void;
};

export const LocaleContext = createContext<LocaleContextType | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<'en' | 'ru'>('en');

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as 'en' | 'ru' | null;
    if (savedLocale) {
      setLocaleState(savedLocale);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'ru') {
        setLocaleState('ru');
      }
    }
  }, []);

  const setLocale = (newLocale: 'en' | 'ru') => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}
