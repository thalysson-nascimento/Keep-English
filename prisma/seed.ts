import { config } from "dotenv";
import { hashPassword } from "better-auth/crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

config({ path: [".env.development.local", ".env"] });

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before seeding the test user.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl, max: 1 }),
});

async function seedTestUser(
  email: string,
  name: string,
  password: string,
): Promise<string> {
  // The seed password may be shorter than the public sign-up minimum.
  const passwordHash = await hashPassword(password);

  const userId = await prisma.$transaction(async (transaction) => {
    const user = await transaction.user.upsert({
      where: { email },
      update: { name },
      create: { name, email },
      select: { id: true },
    });

    const credentialAccount = await transaction.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
      select: { id: true },
    });

    if (credentialAccount) {
      await transaction.account.update({
        where: { id: credentialAccount.id },
        data: { password: passwordHash },
      });
      return user.id;
    }

    await transaction.account.create({
      data: {
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: passwordHash,
      },
    });
    return user.id;
  });

  console.info(`Seeded test account ${email}.`);
  return userId;
}

async function seedDeletionData(userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.word.upsert({
      where: { userId_wordKey: { userId, wordKey: "habit" } },
      update: {},
      create: {
        userId,
        word: "habit",
        translation: "hábito",
        wordKey: "habit",
        translationKey: "habito",
        example: "Reading is a daily habit.",
      },
    }),
    prisma.dailyGoal.upsert({
      where: { userId_dateKey: { userId, dateKey: "2026-11-15" } },
      update: {},
      create: { userId, dateKey: "2026-11-15", goal: 1 },
    }),
    prisma.dailyGoalCompletion.upsert({
      where: {
        userId_dateKey_goal: { userId, dateKey: "2026-11-15", goal: 1 },
      },
      update: {},
      create: { userId, dateKey: "2026-11-15", goal: 1, xp: 10 },
    }),
    prisma.vocabularyTest.upsert({
      where: { id: `${userId}-deletion-demo` },
      update: {},
      create: { id: `${userId}-deletion-demo`, userId, score: 1, total: 1 },
    }),
  ]);
}

async function main(): Promise<void> {
  try {
    // Intentionally public credentials for the closed-test accounts only.
    const password = "123456";
    if (process.argv.includes("--deletion-test")) {
      const userId = await seedTestUser(
        "delete@test.com",
        "Conta para excluir",
        password,
      );
      await seedDeletionData(userId);
      return;
    }
    await seedTestUser("user@test.com", "User Test", password);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
