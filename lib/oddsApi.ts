import { DEMO_MATCHES } from "@/lib/data";
import type { BookmakerOdds, Market, OddsSnapshot } from "@/lib/types";

interface OddsApiOutcome {
  name: string;
  price: number;
  point?: number;
}

interface OddsApiMarket {
  key: Market;
  last_update: string;
  outcomes: OddsApiOutcome[];
}

interface OddsApiBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsApiMarket[];
}

interface OddsApiEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
}

const ODDS_API_BASE = "https://api.the-odds-api.com/v4";
const SPORT_KEY = "soccer_fifa_world_cup";

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function findMatchId(event: OddsApiEvent) {
  const home = normalizeName(event.home_team);
  const away = normalizeName(event.away_team);
  const commenceDate = event.commence_time.slice(0, 10);

  const exact = DEMO_MATCHES.find((match) => {
    const matchHome = normalizeName(match.homeTeam.name);
    const matchAway = normalizeName(match.awayTeam.name);
    return (
      match.kickoff.slice(0, 10) === commenceDate &&
      ((matchHome === home && matchAway === away) || (matchHome === away && matchAway === home))
    );
  });

  if (exact) return exact.id;

  const fuzzy = DEMO_MATCHES.find((match) => {
    const homeName = normalizeName(match.homeTeam.name);
    const awayName = normalizeName(match.awayTeam.name);
    return (
      (home.includes(homeName) || homeName.includes(home)) &&
      (away.includes(awayName) || awayName.includes(away))
    );
  });

  return fuzzy?.id;
}

function mapBookmakers(bookmakers: OddsApiBookmaker[]): BookmakerOdds[] {
  return bookmakers.map((bookmaker) => ({
    key: bookmaker.key,
    title: bookmaker.title,
    lastUpdate: bookmaker.last_update,
    markets: bookmaker.markets.map((market) => ({
      key: market.key,
      lastUpdate: market.last_update,
      outcomes: market.outcomes.map((outcome) => ({
        name: outcome.name,
        price: outcome.price,
        point: outcome.point
      }))
    }))
  }));
}

export async function fetchWorldCupOdds(): Promise<OddsSnapshot[]> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams({
    apiKey,
    regions: process.env.ODDS_API_REGIONS ?? "us,uk,eu",
    markets: process.env.ODDS_API_MARKETS ?? "h2h,spreads,totals",
    oddsFormat: "decimal",
    dateFormat: "iso"
  });

  const bookmakers = process.env.ODDS_API_BOOKMAKERS;
  if (bookmakers) params.set("bookmakers", bookmakers);

  const response = await fetch(`${ODDS_API_BASE}/sports/${SPORT_KEY}/odds?${params.toString()}`, {
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    return [];
  }

  const events = (await response.json()) as OddsApiEvent[];
  const capturedAt = new Date().toISOString();
  const snapshots: OddsSnapshot[] = [];

  events.forEach((event) => {
    const matchId = findMatchId(event);
    if (!matchId) return;

    snapshots.push({
      matchId,
      source: "the-odds-api",
      stale: false,
      capturedAt,
      bookmakers: mapBookmakers(event.bookmakers)
    });
  });

  return snapshots;
}
