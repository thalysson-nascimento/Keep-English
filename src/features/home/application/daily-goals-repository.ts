export interface DailyGoal {
  dateKey: string;
  goal: number;
}

export interface DailyGoalsRepository {
  findSince(dateKey: string): Promise<DailyGoal[]>;
  findToday(dateKey: string): Promise<DailyGoal | null>;
  save(dateKey: string, goal: number): Promise<void>;
}
