import "server-only";

import { getPrismaClient } from "@/core/database/prisma";
import type { ProfileRepository } from "@/features/profile/application/profile-repository";

export function createPrismaProfileRepository(): ProfileRepository {
  const prisma = getPrismaClient();

  return {
    findById(userId) {
      return prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
        },
      });
    },
  };
}
