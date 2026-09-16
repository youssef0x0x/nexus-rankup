import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import sq from './locales/sq.json';

export const supportedLanguages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'sq', label: 'Shqip', flag: '🇦🇱' },
] as const;

let storedLanguage: string | null = null;
try {
  storedLanguage = typeof window !== 'undefined' ? window.localStorage.getItem('nexus-language') : null;
} catch {
  storedLanguage = null;
}
const initialLanguage = supportedLanguages.some((language) => language.code === storedLanguage) ? storedLanguage! : 'en';

const updateDocumentLanguage = (language: string) => {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
};

i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, ar: { translation: ar }, es: { translation: es }, fr: { translation: fr }, de: { translation: de }, ja: { translation: ja }, ko: { translation: ko }, sq: { translation: sq } },
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

updateDocumentLanguage(initialLanguage);
i18n.on('languageChanged', (language) => {
  try {
    window.localStorage.setItem('nexus-language', language);
  } catch {
    // Continue updating the document even when storage is unavailable.
  }
  updateDocumentLanguage(language);
});

export default i18n;
