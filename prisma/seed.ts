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

async function seedTestUser(password: string): Promise<void> {
  // The seed password may be shorter than the public sign-up minimum.
  const passwordHash = await hashPassword(password);

  await prisma.$transaction(async (transaction) => {
    const user = await transaction.user.upsert({
      where: { email: "user@test.com" },
      update: { name: "User Test" },
      create: { name: "User Test", email: "user@test.com" },
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
      return;
    }

    await transaction.account.create({
      data: {
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: passwordHash,
      },
    });
  });

  console.info("Seeded test account user@test.com.");
}

async function main(): Promise<void> {
  try {
    const password = process.env.LOGIN_DEFAULT_PASSWORD;
    if (!password) {
      throw new Error(
        "LOGIN_DEFAULT_PASSWORD must be set before seeding the test user.",
      );
    }

    await seedTestUser(password);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
