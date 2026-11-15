import "server-only";

import { getPrismaClient } from "@/core/database/prisma";

export async function createRewardRequest(userId: string, forTestAt: Date) {
  const prisma = getPrismaClient();
  return prisma.rewardedTestAccess.upsert({
    where: { userId_forTestAt: { userId, forTestAt } },
    update: {},
    create: {
      userId,
      forTestAt,
      expiresAt: new Date(forTestAt.getTime() + 30 * 60 * 1000),
    },
    select: { id: true, verifiedAt: true, expiresAt: true },
  });
}

export async function getRewardStatus(
  userId: string,
  requestId: string,
  now: Date,
) {
  const reward = await getPrismaClient().rewardedTestAccess.findFirst({
    where: { id: requestId, userId, expiresAt: { gt: now }, consumedAt: null },
    select: { verifiedAt: true },
  });
  return reward?.verifiedAt ? "granted" : "pending";
}

export async function confirmReward(
  requestId: string,
  transactionId: string,
  now: Date,
) {
  // A transaction id can grant only one reward; duplicate callbacks are idempotent.
  const prisma = getPrismaClient();
  const alreadyVerified = await prisma.rewardedTestAccess.findUnique({
    where: { transactionId },
    select: { id: true },
  });
  if (alreadyVerified) return alreadyVerified.id === requestId;
  const result = await prisma.rewardedTestAccess.updateMany({
    where: {
      id: requestId,
      verifiedAt: null,
      consumedAt: null,
      expiresAt: { gt: now },
    },
    data: { verifiedAt: now, transactionId },
  });
  return result.count === 1;
}
