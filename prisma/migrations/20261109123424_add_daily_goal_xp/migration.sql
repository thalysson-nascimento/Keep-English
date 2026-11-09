-- CreateTable
CREATE TABLE "DailyGoalCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dateKey" TEXT NOT NULL,
    "goal" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "DailyGoalCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DailyGoalCompletion_userId_dateKey_completedAt_idx" ON "DailyGoalCompletion"("userId", "dateKey", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DailyGoalCompletion_userId_dateKey_goal_key" ON "DailyGoalCompletion"("userId", "dateKey", "goal");
