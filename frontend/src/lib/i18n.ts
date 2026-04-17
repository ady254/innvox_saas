import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import ur from '../locales/ur.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ur: { translation: ur },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

// Handle RTL for Urdu
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    const dir = lng === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lng;
    
    // Add font specific classes or alignments if needed globally
    if (lng === 'ur') {
       document.documentElement.classList.add('font-urdu');
    } else {
       document.documentElement.classList.remove('font-urdu');
    }
  }
});

export default i18n;
