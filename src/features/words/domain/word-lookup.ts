export interface WordLookup {
  word: string;
  translation: string;
  example: string;
  sourceLanguage: "en" | "pt";
  correctedWord: string | null;
}
