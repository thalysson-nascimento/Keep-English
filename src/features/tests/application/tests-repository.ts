export interface VocabularyTestResult {
  score: number;
  total: number;
  completedAt: Date;
}

export interface StoredVocabularyTestResult extends VocabularyTestResult {
  id: string;
}

export interface TestsRepository {
  findAll(): Promise<StoredVocabularyTestResult[]>;
  findLatestCompletion(): Promise<Date | null>;
  findRewardForTest(completedAt: Date, now: Date): Promise<boolean>;
  recordCompletion(
    result: VocabularyTestResult,
    rewardForTestAt?: Date,
  ): Promise<boolean>;
}
