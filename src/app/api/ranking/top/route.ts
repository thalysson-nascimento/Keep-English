import { getRankingForRequest } from "@/features/ranking/presentation/ranking-request";

export async function GET(request: Request) {
  const ranking = await getRankingForRequest(request);

  if (!ranking) {
    return Response.json(
      { error: "Autenticação necessária." },
      { status: 401 },
    );
  }

  return Response.json(ranking.top);
}
