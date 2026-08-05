import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LANGUAGE } from "./language";

import enCommon from "./locales/en/common.json";
import enSidebar from "./locales/en/sidebar.json";
import enAgents from "./locales/en/agents.json";
import enConversations from "./locales/en/conversations.json";
import enSettings from "./locales/en/settings.json";
import enBilling from "./locales/en/billing.json";
import enKnowledge from "./locales/en/knowledge.json";
import enAuth from "./locales/en/auth.json";

import arCommon from "./locales/ar/common.json";
import arSidebar from "./locales/ar/sidebar.json";
import arAgents from "./locales/ar/agents.json";
import arConversations from "./locales/ar/conversations.json";
import arSettings from "./locales/ar/settings.json";
import arBilling from "./locales/ar/billing.json";
import arKnowledge from "./locales/ar/knowledge.json";
import arAuth from "./locales/ar/auth.json";

export const resources = {
  en: {
    common: enCommon,
    sidebar: enSidebar,
    agents: enAgents,
    conversations: enConversations,
    settings: enSettings,
    billing: enBilling,
    knowledge: enKnowledge,
    auth: enAuth,
  },
  ar: {
    common: arCommon,
    sidebar: arSidebar,
    agents: arAgents,
    conversations: arConversations,
    settings: arSettings,
    billing: arBilling,
    knowledge: arKnowledge,
    auth: arAuth,
  },
} as const;

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: "en",
    defaultNS: "common",
    ns: [
      "common",
      "sidebar",
      "agents",
      "conversations",
      "settings",
      "billing",
      "knowledge",
      "auth",
    ],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

export default i18n;
