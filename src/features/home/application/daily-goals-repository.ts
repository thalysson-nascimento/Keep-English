export interface DailyGoal {
  dateKey: string;
  goal: number;
}

export interface DailyGoalCompletion extends DailyGoal {
  xp: number;
  completedAt: Date;
}

export interface DailyGoalsRepository {
  findSince(dateKey: string): Promise<DailyGoal[]>;
  findLatestCompletion(dateKey: string): Promise<DailyGoalCompletion | null>;
  findToday(dateKey: string): Promise<DailyGoal | null>;
  getTotalXp(): Promise<number>;
  save(dateKey: string, goal: number): Promise<void>;
}
