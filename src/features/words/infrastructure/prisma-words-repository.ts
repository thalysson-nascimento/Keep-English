import "server-only";

import { Prisma, PrismaClient } from "@prisma/client";
import type { WordsRepository } from "@/features/words/application/words-repository";
import type { NewWord, Word } from "@/features/words/domain/word";
import { getPrismaClient } from "@/core/database/prisma";

const wordSelect = {
  id: true,
  word: true,
  translation: true,
  example: true,
  createdAt: true,
} satisfies Prisma.WordSelect;

type PrismaWord = Prisma.WordGetPayload<{ select: typeof wordSelect }>;

function toWord(record: PrismaWord): Word {
  return {
    id: record.id,
    word: record.word,
    translation: record.translation,
    example: record.example,
    createdAt: record.createdAt,
  };
}

export function createPrismaWordsRepository(
  userId: string,
  prisma: PrismaClient = getPrismaClient(),
): WordsRepository {
  return {
    countCreatedSince(date: Date): Promise<number> {
      return prisma.word.count({
        where: { userId, createdAt: { gte: date } },
      });
    },

    async create(word: NewWord): Promise<Word | null> {
      try {
        const record = await prisma.word.create({
          data: { ...word, userId },
          select: wordSelect,
        });
        return toWord(record);
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          return null;
        }

        throw error;
      }
    },

    async delete(id: string): Promise<boolean> {
      const result = await prisma.word.deleteMany({ where: { id, userId } });
      return result.count > 0;
    },

    async existsByWordKey(wordKey: string): Promise<boolean> {
      const record = await prisma.word.findFirst({
        where: { userId, wordKey },
        select: { id: true },
      });

      return record !== null;
    },

    async findCreatedSince(date: Date): Promise<Date[]> {
      const records = await prisma.word.findMany({
        where: { userId, createdAt: { gte: date } },
        select: { createdAt: true },
      });

      return records.map(({ createdAt }) => createdAt);
    },

    async findAll(): Promise<Word[]> {
      const records = await prisma.word.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: wordSelect,
      });

      return records.map(toWord);
    },

    async findAllCreatedAt(): Promise<Date[]> {
      const records = await prisma.word.findMany({
        where: { userId },
        select: { createdAt: true },
      });

      return records.map(({ createdAt }) => createdAt);
    },

    async findPage(
      query: string,
      offset: number,
      limit: number,
    ): Promise<{ words: Word[]; total: number }> {
      const where: Prisma.WordWhereInput = query
        ? {
            userId,
            OR: [
              { wordKey: { contains: query } },
              { translationKey: { contains: query } },
            ],
          }
        : { userId };
      const [records, total] = await Promise.all([
        prisma.word.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limit,
          select: wordSelect,
        }),
        prisma.word.count({ where }),
      ]);

      return { words: records.map(toWord), total };
    },

    async findRecent(limit: number): Promise<Word[]> {
      const records = await prisma.word.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: wordSelect,
      });

      return records.map(toWord);
    },

    getCount(): Promise<number> {
      return prisma.word.count({ where: { userId } });
    },

    async search(query: string): Promise<{ words: Word[]; total: number }> {
      const where: Prisma.WordWhereInput = {
        userId,
        OR: [
          { wordKey: { contains: query } },
          { translationKey: { contains: query } },
        ],
      };
      const [records, total] = await Promise.all([
        prisma.word.findMany({
          where,
          orderBy: { createdAt: "desc" },
          select: wordSelect,
        }),
        prisma.word.count({ where }),
      ]);

      return { words: records.map(toWord), total };
    },
  };
}
