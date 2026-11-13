import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getPrismaClient } from "@/core/database/prisma";
import { avatarSchema, defaultAvatar } from "@/features/auth/domain/avatars";

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} must be set before creating the authentication instance.`,
    );
  }

  return value;
}

function getAuthBaseURL(): string {
  const baseURL = getRequiredEnvironmentVariable("BETTER_AUTH_URL");
  let parsedURL: URL;

  try {
    parsedURL = new URL(baseURL);
  } catch {
    throw new Error("BETTER_AUTH_URL must be a valid HTTP or HTTPS URL.");
  }

  const isHttpProtocol =
    parsedURL.protocol === "http:" || parsedURL.protocol === "https:";

  if (!isHttpProtocol || parsedURL.username || parsedURL.password) {
    throw new Error("BETTER_AUTH_URL must be a valid HTTP or HTTPS URL.");
  }

  return baseURL;
}

export function createAuth() {
  const secret = getRequiredEnvironmentVariable("BETTER_AUTH_SECRET");

  if (secret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be at least 32 characters long.");
  }

  const baseURL = getAuthBaseURL();
  const prisma = getPrismaClient();

  return betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    secret,
    baseURL,
    user: {
      additionalFields: {
        avatar: {
          type: "string",
          required: true,
          input: true,
          defaultValue: defaultAvatar,
          validator: { input: avatarSchema },
        },
      },
    },
    emailAndPassword: {
      enabled: true,
    },
    databaseHooks: {
      user: {
        create: {
          async before(user) {
            if (!avatarSchema.safeParse(user.avatar).success) {
              return false;
            }
          },
          async after(user) {
            await prisma.$transaction([
              prisma.word.updateMany({
                where: { userId: null },
                data: { userId: user.id },
              }),
              prisma.dailyGoal.updateMany({
                where: { userId: null },
                data: { userId: user.id },
              }),
              prisma.vocabularyTest.updateMany({
                where: { userId: null },
                data: { userId: user.id },
              }),
            ]);
          },
        },
      },
    },
  });
}
