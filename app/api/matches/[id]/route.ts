import { buildDashboardData, computeFairProbabilities } from "@/lib/model";
import { fetchWorldCupOdds } from "@/lib/oddsApi";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const odds = await fetchWorldCupOdds();
  const data = buildDashboardData(odds);
  const match = data.matches.find((item) => item.id === id);
  if (!match) {
    return Response.json({ error: "Match not found" }, { status: 404 });
  }

  const snapshot = data.odds.find((item) => item.matchId === id);
  return Response.json({
    match,
    prediction: data.predictions.find((item) => item.matchId === id),
    odds: snapshot,
    fairProbabilities: snapshot ? computeFairProbabilities(snapshot) : [],
    bets: data.bets.filter((item) => item.matchId === id)
  });
}
