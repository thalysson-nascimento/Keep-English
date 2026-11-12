export interface VocabularyTestWord {
  id: string;
  word: string;
  translation: string;
}

export interface VocabularyQuestion extends VocabularyTestWord {
  options: string[] | null;
}

export interface TestAccessState {
  goal: number | null;
  todayWords: number;
  wordCount: number;
  lastTestAt: number | null;
}

export type TestLockReason = "words" | "goal" | "cooldown" | null;

export const testCooldownMilliseconds = 30 * 60 * 1000;
export const maxVocabularyTestQuestionCount = 20;

function shuffle<T>(values: readonly T[]): T[] {
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export function createVocabularyQuestions(
  words: readonly VocabularyTestWord[],
  questionCount: number,
): VocabularyQuestion[] {
  return shuffle(words)
    .slice(0, questionCount)
    .map((word) => {
      const alternatives = [
        ...new Set(
          words
            .filter(
              (candidate) =>
                candidate.id !== word.id &&
                candidate.word.toLowerCase() !== word.word.toLowerCase(),
            )
            .map((candidate) => candidate.word),
        ),
      ];
      const options =
        alternatives.length < 3 || Math.random() <= 0.3
          ? null
          : shuffle([word.word, ...shuffle(alternatives).slice(0, 3)]);

      return { ...word, options };
    });
}

export function getTestLockReason(
  access: TestAccessState,
  now: number,
): TestLockReason {
  if (access.wordCount === 0) {
    return "words";
  }

  if (access.goal === null || access.todayWords < access.goal) {
    return "goal";
  }

  if (
    access.lastTestAt !== null &&
    access.lastTestAt + testCooldownMilliseconds > now
  ) {
    return "cooldown";
  }

  return null;
}

export function getTestCooldownRemaining(
  lastTestAt: number | null,
  now: number,
): number {
  if (lastTestAt === null) {
    return 0;
  }

  return Math.max(0, lastTestAt + testCooldownMilliseconds - now);
}

export function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z ]/g, "")
    .trim();
}

export function formatTestCountdown(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutesLabel = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secondsLabel = String(seconds % 60).padStart(2, "0");

  return `${minutesLabel}:${secondsLabel}`;
}
