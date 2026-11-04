// path: src/lang/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationBN from "@/lang/locales/bn/index.json";
import translationEN from '@/lang/locales/en/index.json';

// const preferredLanguage = localStorage.getItem('lang');

// the translations
const resources = {
    en: { translation: translationEN },
    bn: { translation: translationBN }
};

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng: 'en', // default language
        fallbackLng: 'en', // fallback language if the preferred language is not available
        debug: process.env.NODE_ENV !== "production",
        saveMissing: true, // send not translated keys to the backend
        saveMissingTo: 'all', // send all missing keys to the backend

        keySeparator: false, // we do not use keys in form messages.welcome

        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;