export const supportedLocales = ["pt-BR", "en"] as const;

export type Locale = (typeof supportedLocales)[number];

interface LanguagePreference {
  language: string;
  quality: number;
  order: number;
}

function parseLanguagePreference(
  value: string,
  order: number,
): LanguagePreference {
  const [language = "", ...parameters] = value.trim().split(";");
  const qualityParameter = parameters.find((parameter) =>
    parameter.trim().startsWith("q="),
  );
  const parsedQuality = qualityParameter
    ? Number(qualityParameter.trim().slice(2))
    : 1;

  return {
    language: language.toLowerCase(),
    quality: Number.isFinite(parsedQuality) ? parsedQuality : 0,
    order,
  };
}

function matchLocale(language: string): Locale | null {
  if (language === "en" || language.startsWith("en-")) {
    return "en";
  }

  if (language === "pt" || language.startsWith("pt-")) {
    return "pt-BR";
  }

  return null;
}

export function resolveLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) {
    return "pt-BR";
  }

  const preferences = acceptLanguage
    .split(",")
    .map(parseLanguagePreference)
    .filter((preference) => preference.quality > 0)
    .sort(
      (left, right) => right.quality - left.quality || left.order - right.order,
    );

  for (const preference of preferences) {
    const locale = matchLocale(preference.language);

    if (locale) {
      return locale;
    }
  }

  return "pt-BR";
}

export function getIntlLocale(locale: Locale): string {
  return locale === "en" ? "en-US" : "pt-BR";
}

export function formatOrdinal(locale: Locale, position: number): string {
  if (locale === "pt-BR") {
    return `${position}º`;
  }

  const remainder = position % 100;
  const suffix =
    remainder >= 11 && remainder <= 13
      ? "th"
      : position % 10 === 1
        ? "st"
        : position % 10 === 2
          ? "nd"
          : position % 10 === 3
            ? "rd"
            : "th";

  return `${position}${suffix}`;
}
