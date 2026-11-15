import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { config } from "dotenv";
import { hashPassword } from "better-auth/crypto";
import { createAuth } from "../src/core/auth/auth";
import { getPrismaClient } from "../src/core/database/prisma";

config({ path: [".env.development.local", ".env"], quiet: true });

test(
  "account deletion authorizes the session, removes related data and preserves another account",
  { timeout: 180000 },
  async () => {
    // All writes are restricted to disposable fixtures created by this test.
    const databaseUrl =
      process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;
    assert.ok(
      databaseUrl && /^postgres(?:ql)?:\/\//.test(databaseUrl),
      "Configure a PostgreSQL DATABASE_URL before running the integration test.",
    );
    const prisma = getPrismaClient();
    const fixtureId = randomUUID();
    const ownerId = `deletion-test-${fixtureId}`;
    const otherId = `deletion-control-${fixtureId}`;
    const email = `deletion-${fixtureId}@example.com`;
    const password = randomUUID();
    process.env.BETTER_AUTH_URL = "http://localhost:3000";
    process.env.BETTER_AUTH_SECRET ||= randomUUID() + randomUUID();
    const auth = createAuth();

    function deletion(cookie?: string, origin = "http://localhost:3000") {
      return auth.handler(
        new Request("http://localhost:3000/api/auth/delete-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: origin,
            ...(cookie ? { Cookie: cookie } : {}),
          },
          // A browser-supplied userId must never determine the account being deleted.
          body: JSON.stringify({ userId: otherId }),
        }),
      );
    }

    try {
      await prisma.user.create({
        data: {
          id: ownerId,
          name: "Disposable deletion test",
          email,
          accounts: {
            create: {
              accountId: ownerId,
              providerId: "credential",
              password: await hashPassword(password),
            },
          },
          words: {
            create: {
              word: "habit",
              translation: "hábito",
              wordKey: "habit",
              translationKey: "habito",
            },
          },
          dailyGoals: { create: { dateKey: "2026-11-15", goal: 5 } },
          dailyGoalCompletions: {
            create: { dateKey: "2026-11-15", goal: 5, xp: 50 },
          },
          vocabularyTests: { create: { score: 1, total: 1 } },
        },
      });
      await prisma.user.create({
        data: {
          id: otherId,
          name: "Disposable control account",
          email: `control-${fixtureId}@example.com`,
          words: {
            create: {
              word: "keep",
              translation: "manter",
              wordKey: "keep",
              translationKey: "manter",
            },
          },
        },
      });

      assert.equal((await deletion()).status, 401);
      const login = await auth.api.signInEmail({
        body: { email, password },
        asResponse: true,
      });
      assert.equal(login.status, 200);
      const cookie = login.headers
        .getSetCookie()
        .map((value) => value.split(";")[0])
        .join("; ");
      assert.ok(cookie);
      assert.equal(
        (await deletion(cookie, "https://untrusted.example")).status,
        403,
      );
      assert.equal(await prisma.user.count({ where: { id: ownerId } }), 1);

      await prisma.session.updateMany({
        where: { userId: ownerId },
        data: { createdAt: new Date(Date.now() - 2 * 86400_000) },
      });
      const stale = await deletion(cookie);
      assert.equal(stale.status, 400);
      assert.equal((await stale.json()).code, "SESSION_EXPIRED");
      assert.equal(await prisma.word.count({ where: { userId: ownerId } }), 1);

      await prisma.session.updateMany({
        where: { userId: ownerId },
        data: { createdAt: new Date() },
      });
      await prisma.session.create({
        data: {
          userId: ownerId,
          token: randomUUID(),
          expiresAt: new Date(Date.now() + 86400_000),
        },
      });
      const response = await deletion(cookie);
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), {
        success: true,
        message: "User deleted",
      });
      assert.ok(
        response.headers
          .getSetCookie()
          .some((value) => value.includes("Max-Age=0")),
      );
      assert.equal(await prisma.user.count({ where: { id: ownerId } }), 0);
      for (const count of await Promise.all([
        prisma.account.count({ where: { userId: ownerId } }),
        prisma.session.count({ where: { userId: ownerId } }),
        prisma.word.count({ where: { userId: ownerId } }),
        prisma.dailyGoal.count({ where: { userId: ownerId } }),
        prisma.dailyGoalCompletion.count({ where: { userId: ownerId } }),
        prisma.vocabularyTest.count({ where: { userId: ownerId } }),
      ]))
        assert.equal(count, 0);
      assert.equal(await prisma.user.count({ where: { id: otherId } }), 1);
      assert.equal(await prisma.word.count({ where: { userId: otherId } }), 1);
      assert.equal((await deletion(cookie)).status, 401);
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
