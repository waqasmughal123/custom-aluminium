import en from './en.json';

// Export all available locales
export const locales = {
  en,
};

// Export available language codes
export const availableLanguages = ['en'] as const;

// Export default language
export const defaultLanguage = 'en';

// Type for supported languages
export type SupportedLanguage = typeof availableLanguages[number];

// TODO: Add more languages when needed
// import fr from './fr.json';
// import es from './es.json';
// 
// export const locales = {
//   en,
//   fr,
//   es,
// };
//
// export const availableLanguages = ['en', 'fr', 'es'] as const; 