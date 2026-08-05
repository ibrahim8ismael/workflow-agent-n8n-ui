export type LanguageCode = "en" | "ar";
export type Direction = "ltr" | "rtl";

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  dir: Direction;
  locale: string;
}

export const SUPPORTED_LANGUAGES: Record<LanguageCode, LanguageInfo> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
    locale: "en-US",
  },
  ar: {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    dir: "rtl",
    locale: "ar-EG",
  },
};

export const DEFAULT_LANGUAGE: LanguageCode = "en";
export const LANGUAGE_STORAGE_KEY = "woops.language";

export function getDirection(lang: LanguageCode): Direction {
  return SUPPORTED_LANGUAGES[lang]?.dir || "ltr";
}
