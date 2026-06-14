import { buildDashboardData } from "@/lib/model";
import { fetchWorldCupOdds } from "@/lib/oddsApi";

export async function POST() {
  const odds = await fetchWorldCupOdds();
  const data = buildDashboardData(odds);
  return Response.json({
    generatedAt: data.lastRefresh,
    modelVersion: data.predictions[0]?.modelVersion,
    predictions: data.predictions.length,
    recommendedBets: data.bets.length,
    performance: data.performance
  });
}
