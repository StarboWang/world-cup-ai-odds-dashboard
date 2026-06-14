import { buildDashboardData } from "@/lib/model";
import { fetchWorldCupOdds } from "@/lib/oddsApi";

export async function GET() {
  const odds = await fetchWorldCupOdds();
  const data = buildDashboardData(odds);
  return Response.json(data.performance);
}
