import { buildDashboardData } from "@/lib/model";
import { fetchWorldCupOdds } from "@/lib/oddsApi";

export async function POST() {
  const odds = await fetchWorldCupOdds();
  const data = buildDashboardData(odds);
  return Response.json({
    refreshedAt: data.lastRefresh,
    source: odds.length > 0 ? "the-odds-api" : "unavailable",
    snapshots: data.odds.length,
    bookmakerCount: data.odds.reduce((sum, snapshot) => sum + snapshot.bookmakers.length, 0)
  });
}
