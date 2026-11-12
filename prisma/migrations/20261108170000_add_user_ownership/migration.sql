DROP INDEX "Word_wordKey_key";
DROP INDEX "DailyGoal_dateKey_key";

ALTER TABLE "Word" ADD COLUMN "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyGoal" ADD COLUMN "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VocabularyTest" ADD COLUMN "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Word_userId_wordKey_key" ON "Word"("userId", "wordKey");
CREATE INDEX "Word_userId_createdAt_idx" ON "Word"("userId", "createdAt");
CREATE UNIQUE INDEX "DailyGoal_userId_dateKey_key" ON "DailyGoal"("userId", "dateKey");
CREATE INDEX "DailyGoal_userId_idx" ON "DailyGoal"("userId");
CREATE INDEX "VocabularyTest_userId_completedAt_idx" ON "VocabularyTest"("userId", "completedAt");

UPDATE "Word"
SET "userId" = (SELECT "id" FROM "User" ORDER BY "createdAt", "id" LIMIT 1)
WHERE "userId" IS NULL
  AND EXISTS (SELECT 1 FROM "User");

UPDATE "DailyGoal"
SET "userId" = (SELECT "id" FROM "User" ORDER BY "createdAt", "id" LIMIT 1)
WHERE "userId" IS NULL
  AND EXISTS (SELECT 1 FROM "User");

UPDATE "VocabularyTest"
SET "userId" = (SELECT "id" FROM "User" ORDER BY "createdAt", "id" LIMIT 1)
WHERE "userId" IS NULL
  AND EXISTS (SELECT 1 FROM "User");
