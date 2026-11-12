import { z } from "zod";
import { getSessionFromHeaders } from "@/core/auth/session";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";

const wordIdSchema = z.string().cuid();

interface WordRouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, context: WordRouteContext) {
  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    return Response.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  const { id } = await context.params;
  const parsedId = wordIdSchema.safeParse(id);

  if (!parsedId.success) {
    return Response.json({ error: "Identificador inválido." }, { status: 400 });
  }

  const deleted = await createPrismaWordsRepository(session.user.id).delete(
    parsedId.data,
  );

  if (!deleted) {
    return Response.json({ error: "Palavra não encontrada." }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
