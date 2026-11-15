CREATE TABLE "RewardedTestAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "forTestAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "transactionId" TEXT,
    "consumedAt" TIMESTAMP(3),
    CONSTRAINT "RewardedTestAccess_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RewardedTestAccess_transactionId_key" ON "RewardedTestAccess"("transactionId");
CREATE UNIQUE INDEX "RewardedTestAccess_userId_forTestAt_key" ON "RewardedTestAccess"("userId", "forTestAt");
CREATE INDEX "RewardedTestAccess_userId_expiresAt_idx" ON "RewardedTestAccess"("userId", "expiresAt");
ALTER TABLE "RewardedTestAccess" ADD CONSTRAINT "RewardedTestAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
