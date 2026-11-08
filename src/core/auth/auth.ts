import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getPrismaClient } from "@/core/database/prisma";

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

  return betterAuth({
    database: prismaAdapter(getPrismaClient(), { provider: "postgresql" }),
    secret,
    baseURL,
    emailAndPassword: {
      enabled: false,
    },
  });
}
