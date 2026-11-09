"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import type { Locale } from "./config";
import {
  translate,
  type TranslationKey,
  type TranslationValues,
} from "./messages";

const LocaleContext = createContext<Locale | null>(null);

interface LocaleProviderProps {
  children: ReactNode;
  locale: Locale;
}

export function LocaleProvider({ children, locale }: LocaleProviderProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useI18n() {
  const locale = useContext(LocaleContext);

  if (!locale) {
    throw new Error("useI18n must be used within a LocaleProvider.");
  }

  const t = useCallback(
    (key: TranslationKey, values?: TranslationValues) =>
      translate(locale, key, values),
    [locale],
  );

  return { locale, t };
}
