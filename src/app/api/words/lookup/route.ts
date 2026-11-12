import { z } from "zod";
import { getSessionFromHeaders } from "@/core/auth/session";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";
import { lookupWord } from "@/features/words/infrastructure/public-word-lookup";
import { normalizeWord } from "@/features/words/application/words-service";

const lookupInputSchema = z.object({
  word: z.string().trim().min(1).max(80),
  skipCorrection: z.boolean().default(false),
});

export async function POST(request: Request) {
  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    return Response.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const parsedBody = lookupInputSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json({ error: "Palavra inválida." }, { status: 400 });
  }

  let lookup: Awaited<ReturnType<typeof lookupWord>>;

  try {
    lookup = await lookupWord(
      parsedBody.data.word,
      parsedBody.data.skipCorrection,
    );
  } catch {
    return Response.json(
      { error: "Não foi possível consultar os serviços de tradução." },
      { status: 502 },
    );
  }

  const duplicate = await createPrismaWordsRepository(
    session.user.id,
  ).existsByWordKey(normalizeWord(lookup.word));

  return Response.json({ lookup, duplicate });
}
