import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { useAppStore } from '../stores/appStore';

i18n
  .use(new Backend(null, { loadPath: "./locales/{{lng}}/{{ns}}.json" }))
  .use(new LanguageDetector(null, { caches: ["cookie"], lookupCookie: "locale" }))
  .use(initReactI18next)
  .init({
    load: "languageOnly",
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    supportedLngs: ["en", "tr"],
    ns: ["common"]
  });

export default i18n;

i18n.on("initialized", () => {
  useAppStore.getState().changeLocale(i18n.language);
})
