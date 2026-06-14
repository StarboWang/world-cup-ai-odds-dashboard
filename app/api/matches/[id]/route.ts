import type { NextRequest } from "next/server";
import { buildDashboardData, computeFairProbabilities } from "@/lib/model";
import { fetchWorldCupOdds } from "@/lib/oddsApi";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
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
