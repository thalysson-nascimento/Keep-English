import type { NewWord, Word } from "@/features/words/domain/word";

export interface GoalCompletionContext {
  dateKey: string;
  dayStart: Date;
  goal: number;
  xp: number;
}

export interface WordsRepository {
  countCreatedSince(date: Date): Promise<number>;
  create(
    word: NewWord,
    goalCompletion: GoalCompletionContext,
  ): Promise<Word | null>;
  delete(id: string): Promise<boolean>;
  existsByWordKey(wordKey: string): Promise<boolean>;
  findCreatedSince(date: Date): Promise<Date[]>;
  findAll(): Promise<Word[]>;
  findAllCreatedAt(): Promise<Date[]>;
  findPage(
    query: string,
    offset: number,
    limit: number,
  ): Promise<{ words: Word[]; total: number }>;
  findRecent(limit: number): Promise<Word[]>;
  getCount(): Promise<number>;
  search(query: string): Promise<{
    words: Word[];
    total: number;
  }>;
}
