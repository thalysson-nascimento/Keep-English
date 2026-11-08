export interface Word {
  id: string;
  word: string;
  translation: string;
  example: string | null;
  createdAt: Date;
}

export interface NewWord {
  word: string;
  translation: string;
  example: string | null;
  wordKey: string;
  translationKey: string;
}
