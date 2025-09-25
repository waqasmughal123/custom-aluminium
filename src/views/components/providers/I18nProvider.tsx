'use client';

import i18n from 'i18next';
import { ReactNode } from 'react';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import { locales, defaultLanguage } from '@/utils/locales';

// Initialize i18n immediately when module loads
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          translation: locales.en,
        },
      },
      lng: defaultLanguage,
      fallbackLng: defaultLanguage,
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      debug: process.env.NODE_ENV === 'development',
    });
}

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}; 