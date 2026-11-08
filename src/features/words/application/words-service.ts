import type { NewWord, Word } from "@/features/words/domain/word";
import type { WordsRepository } from "./words-repository";

export interface WordInput {
  word: string;
  translation: string;
  example: string | null;
}

export function normalizeWord(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export async function createWord(
  repository: WordsRepository,
  input: WordInput,
): Promise<Word | null> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const newWord: NewWord = {
    ...input,
    wordKey: normalizeWord(input.word),
    translationKey: normalizeWord(input.translation),
  };

  return repository.create(newWord);
}

export function searchWords(
  repository: WordsRepository,
  query: string,
): Promise<{ words: Word[]; total: number }> {
  return repository.search(normalizeWord(query));
}

export async function getWordsPage(
  repository: WordsRepository,
  query: string,
  offset: number,
  limit: number,
): Promise<{ words: Word[]; total: number; hasMore: boolean }> {
  const result = await repository.findPage(normalizeWord(query), offset, limit);

  return {
    ...result,
    hasMore: offset + result.words.length < result.total,
  };
}
