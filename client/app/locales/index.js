import { en } from './en';
import { vi } from './vi';

export const translations = {
  en,
  vi
};

export const defaultLanguage = 'en';
export const supportedLanguages = ['en', 'vi'];

export const getTranslation = (language = defaultLanguage) => {
  return translations[language] || translations[defaultLanguage];
};
