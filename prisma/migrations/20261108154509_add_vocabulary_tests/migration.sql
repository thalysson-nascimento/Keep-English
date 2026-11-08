-- CreateTable
CREATE TABLE "VocabularyTest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "VocabularyTest_completedAt_idx" ON "VocabularyTest"("completedAt");
