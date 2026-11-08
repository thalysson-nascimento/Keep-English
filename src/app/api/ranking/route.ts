import { z } from "zod";
import { getRankingForRequest } from "@/features/ranking/presentation/ranking-request";
import { getWeeklyRankingPage } from "@/features/ranking/application/weekly-ranking";

const paginationSchema = z.object({
  offset: z.coerce.number().int().min(0).max(100000).default(0),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = paginationSchema.safeParse({
    offset: url.searchParams.get("offset") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return Response.json({ error: "Paginação inválida." }, { status: 400 });
  }

  const ranking = await getRankingForRequest(request);

  if (!ranking) {
    return Response.json(
      { error: "Autenticação necessária." },
      { status: 401 },
    );
  }

  return Response.json(
    getWeeklyRankingPage(
      ranking.entries,
      parsed.data.offset,
      parsed.data.limit,
    ),
  );
}
