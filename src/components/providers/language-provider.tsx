"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import i18n from "@/i18n/config";
import {
  DEFAULT_LANGUAGE,
  Direction,
  LanguageCode,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  getDirection,
} from "@/i18n/language";

interface LanguageContextType {
  language: LanguageCode;
  direction: Direction;
  isRTL: boolean;
  setLanguage: (lang: LanguageCode) => void;
  changeLanguage: (lang: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function updateHtmlAttributes(lang: LanguageCode) {
  const dir = getDirection(lang);
  if (typeof document === "undefined") return;

  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
  document.documentElement.classList.toggle("rtl", dir === "rtl");
  document.documentElement.classList.toggle("ltr", dir === "ltr");
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode | null;
        if (stored && SUPPORTED_LANGUAGES[stored]) setLanguageState(stored);
      } catch {
        // Keep the default language when browser storage is unavailable.
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    i18n.changeLanguage(language);
    updateHtmlAttributes(language);
  }, [language]);

  const changeLanguage = (newLang: LanguageCode) => {
    if (!SUPPORTED_LANGUAGES[newLang]) return;
    setLanguageState(newLang);
    i18n.changeLanguage(newLang);
    updateHtmlAttributes(newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch (e) {
      console.error("Failed to save language preference", e);
    }
  };

  const direction = getDirection(language);
  const isRTL = direction === "rtl";

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        isRTL,
        setLanguage: changeLanguage,
        changeLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
