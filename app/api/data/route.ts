import { buildDashboardData } from "@/lib/model";
import { fetchWorldCupOdds } from "@/lib/oddsApi";

export async function GET() {
  const odds = await fetchWorldCupOdds();
  return Response.json(buildDashboardData(odds));
}
