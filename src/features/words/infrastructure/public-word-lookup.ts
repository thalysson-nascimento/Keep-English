import "server-only";

import { z } from "zod";
import { normalizeWord } from "@/features/words/application/words-service";
import type { WordLookup } from "@/features/words/domain/word-lookup";

const datamuseSchema = z.array(z.object({ word: z.string() }));
const languageToolSchema = z.object({
  matches: z.array(
    z.object({
      rule: z.object({ issueType: z.string() }).nullable().optional(),
      replacements: z.array(z.object({ value: z.string() })).optional(),
    }),
  ),
});
const memorySchema = z.object({
  responseData: z.object({ translatedText: z.string() }),
  responseStatus: z.union([z.number(), z.string()]),
  responseDetails: z.string().optional(),
});
const tatoebaSchema = z.object({
  data: z.array(z.object({ text: z.string().optional() })).optional(),
});

function looksPortuguese(value: string): boolean {
  return (
    /[ãõçáéíóúâêôà]/i.test(value) ||
    /(ção|ções|são|dade|mente|agem|ável|ível|inho|inha)$/i.test(value) ||
    /(^|\s)(eu|você|vocês|ele|ela|nós|eles|elas|uma|umas|uns|não|muito|muita|meu|minha|seu|sua|de|do|da|dos|das|que|com|para|por|mas|está|estão|são|foi|tem|têm)(?=\s|$)/i.test(
      value,
    )
  );
}

async function getEnglishSuggestion(word: string): Promise<{
  valid: boolean;
  suggestion: string;
}> {
  const response = await fetch(
    `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&max=3`,
    { signal: AbortSignal.timeout(8000) },
  );

  if (!response.ok) {
    throw new Error("O serviço de ortografia está indisponível.");
  }

  const results = datamuseSchema.parse(await response.json());
  const suggestion = results[0]?.word ?? "";

  return {
    valid: results.some(({ word: result }) => result === word.toLowerCase()),
    suggestion,
  };
}

async function getPortugueseSuggestion(word: string): Promise<{
  valid: boolean;
  suggestion: string;
}> {
  const response = await fetch("https://api.languagetoolplus.com/v2/check", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ language: "pt-BR", text: word }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error("O serviço de ortografia está indisponível.");
  }

  const result = languageToolSchema.parse(await response.json());
  const match = result.matches.find(
    ({ rule }) => rule?.issueType === "misspelling",
  );

  return {
    valid: match === undefined,
    suggestion: match?.replacements?.[0]?.value ?? "",
  };
}

async function correctSpelling(word: string): Promise<string> {
  if (/\s/.test(word)) {
    return word;
  }

  try {
    if (looksPortuguese(word)) {
      const result = await getPortugueseSuggestion(word);
      return result.valid || !result.suggestion ? word : result.suggestion;
    }

    const english = await getEnglishSuggestion(word);

    if (english.valid) {
      return word;
    }

    try {
      const portuguese = await getPortugueseSuggestion(word);

      if (portuguese.valid) {
        return word;
      }

      return english.suggestion || portuguese.suggestion || word;
    } catch {
      return word;
    }
  } catch {
    return word;
  }
}

async function translate(
  word: string,
  languagePair: "en|pt-BR" | "pt-BR|en-US",
): Promise<string> {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", word);
  url.searchParams.set("langpair", languagePair);

  const response = await fetch(url, { signal: AbortSignal.timeout(12000) });

  if (!response.ok) {
    throw new Error(
      `O serviço de tradução respondeu com HTTP ${response.status}.`,
    );
  }

  const result = memorySchema.parse(await response.json());

  if (
    String(result.responseStatus) !== "200" ||
    !result.responseData.translatedText.trim()
  ) {
    throw new Error(
      result.responseDetails || "Não foi possível traduzir a palavra.",
    );
  }

  return result.responseData.translatedText.trim().replace(/\.$/, "");
}

async function findExample(word: string): Promise<string> {
  const normalized = word.trim().toLowerCase();
  const words = normalized.split(/\s+/);
  const forms = new Set([normalized]);

  if (words.length >= 3) {
    return `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}${
      /[.!?]$/.test(word) ? "" : "."
    }`;
  }

  if (words.length === 1) {
    if (/ies$/.test(normalized)) {
      forms.add(`${normalized.slice(0, -3)}y`);
    } else if (/(ses|xes|ches|shes)$/.test(normalized)) {
      forms.add(normalized.slice(0, -2));
    } else if (/s$/.test(normalized)) {
      forms.add(normalized.slice(0, -1));
    }

    if (/ing$/.test(normalized) && normalized.length > 5) {
      forms.add(normalized.slice(0, -3));
    }

    if (/ed$/.test(normalized) && normalized.length > 4) {
      forms.add(normalized.slice(0, -2));
      forms.add(normalized.slice(0, -1));
    }
  }

  const query = words.length === 2 ? `"${normalized}"` : [...forms].join(" | ");
  const url = new URL("https://api.tatoeba.org/v1/sentences");
  url.search = new URLSearchParams({
    lang: "eng",
    q: query,
    sort: "relevance",
    is_unapproved: "no",
    word_count: "4-14",
    limit: "20",
    showtrans: "none",
  }).toString();

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });

    if (!response.ok) {
      return "";
    }

    const result = tatoebaSchema.parse(await response.json());
    const sentences = (result.data ?? [])
      .map(({ text }) => text)
      .filter((text): text is string => Boolean(text));
    const escapedForms = [...forms].map((form) =>
      form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    );
    const exactWord = new RegExp(`\\b(${escapedForms.join("|")})\\b`, "i");

    return (
      sentences.find((sentence) => exactWord.test(sentence)) ??
      sentences[0] ??
      ""
    );
  } catch {
    return "";
  }
}

export async function lookupWord(
  input: string,
  skipCorrection = false,
): Promise<WordLookup> {
  const correctedWord = skipCorrection ? input : await correctSpelling(input);
  const wasCorrected = correctedWord.toLowerCase() !== input.toLowerCase();
  const word = correctedWord;
  let sourceLanguage: "en" | "pt" = "en";
  let translation: string;

  if (looksPortuguese(word)) {
    sourceLanguage = "pt";
    translation = await translate(word, "pt-BR|en-US");
  } else {
    translation = await translate(word, "en|pt-BR");

    if (normalizeWord(translation) === normalizeWord(word)) {
      sourceLanguage = "pt";
      translation = await translate(word, "pt-BR|en-US");
    }
  }

  const translatedWord =
    sourceLanguage === "pt" ? translation.toLowerCase() : word;
  const meaning = sourceLanguage === "pt" ? word : translation;
  const example = await findExample(translatedWord);

  return {
    word: translatedWord,
    translation: meaning,
    example,
    sourceLanguage,
    correctedWord: wasCorrected ? correctedWord : null,
  };
}
