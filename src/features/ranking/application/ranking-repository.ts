export interface RankingUser {
  id: string;
  name: string;
  avatar: string;
}

export interface RankingWordActivity {
  userId: string | null;
  createdAt: Date;
}

export interface RankingTestActivity {
  userId: string | null;
  score: number;
  completedAt: Date;
}

export interface RankingRepository {
  findUsers(): Promise<RankingUser[]>;
  findWordsCreatedSince(date: Date): Promise<RankingWordActivity[]>;
  findTestsCompletedSince(date: Date): Promise<RankingTestActivity[]>;
}
