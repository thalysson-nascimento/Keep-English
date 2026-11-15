import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { getPrismaClient } from "../src/core/database/prisma";
import { createPrismaTestsRepository } from "../src/features/tests/infrastructure/prisma-tests-repository";
import {
  confirmReward,
  createRewardRequest,
  getRewardStatus,
} from "../src/features/tests/infrastructure/rewarded-test-access";

test(
  "PostgreSQL reward is scoped, verified, consumed once and deleted with the account",
  { timeout: 180000 },
  async () => {
    const prisma = getPrismaClient();
    const ownerId = randomUUID();
    const otherId = randomUUID();
    const now = new Date();
    const previousTest = new Date(now.getTime() - 60_000);
    try {
      await prisma.user.create({
        data: {
          id: ownerId,
          name: "Temporary reward test",
          email: `${ownerId}@example.com`,
        },
      });
      await prisma.user.create({
        data: {
          id: otherId,
          name: "Temporary reward control",
          email: `${otherId}@example.com`,
        },
      });
      const request = await createRewardRequest(ownerId, previousTest);
      const owner = createPrismaTestsRepository(ownerId);
      const other = createPrismaTestsRepository(otherId);
      assert.equal(await owner.findRewardForTest(previousTest, now), false);
      assert.equal(await getRewardStatus(otherId, request.id, now), "pending");
      assert.equal(
        await other.recordCompletion(
          { score: 1, total: 1, completedAt: now },
          previousTest,
        ),
        false,
      );
      const transactionId = randomUUID();
      assert.equal(await confirmReward(request.id, transactionId, now), true);
      assert.equal(await confirmReward(request.id, transactionId, now), true);
      assert.equal(
        await confirmReward(randomUUID(), transactionId, now),
        false,
      );
      assert.equal(await owner.findRewardForTest(previousTest, now), true);
      assert.equal(
        await owner.findRewardForTest(
          previousTest,
          new Date(now.getTime() + 31 * 60_000),
        ),
        false,
      );
      const results = await Promise.all([
        owner.recordCompletion(
          { score: 1, total: 1, completedAt: now },
          previousTest,
        ),
        owner.recordCompletion(
          { score: 1, total: 1, completedAt: now },
          previousTest,
        ),
      ]);
      assert.equal(results.filter(Boolean).length, 1);
      assert.equal(
        await prisma.vocabularyTest.count({ where: { userId: ownerId } }),
        1,
      );
      assert.equal(await owner.findRewardForTest(previousTest, now), false);
      await prisma.user.delete({ where: { id: ownerId } });
      assert.equal(
        await prisma.rewardedTestAccess.count({ where: { userId: ownerId } }),
        0,
      );
      assert.equal(await prisma.user.count({ where: { id: otherId } }), 1);
    } finally {
      try {
        await prisma.user.deleteMany({
          where: { id: { in: [ownerId, otherId] } },
        });
      } finally {
        await prisma.$disconnect();
      }
    }
  },
);
