import rawSchedule from "@/lib/wc26-schedule.json";
import type { Match, OddsSnapshot, Team } from "@/lib/types";

type RawSchedule = typeof rawSchedule;
type RawGame = RawSchedule["games"]["games"][number];
type RawTeam = RawSchedule["teams"]["teams"][number];
type RawStadium = RawSchedule["stadiums"]["stadiums"][number];

type TeamSeed = {
  fifaRank: number;
  elo: number;
  attack: number;
  defense: number;
  form: number;
  confederation: string;
};

const DEFAULT_RATING: TeamSeed = {
  fifaRank: 75,
  elo: 1550,
  attack: 0.98,
  defense: 1.02,
  form: 0,
  confederation: "TBD"
};

const TEAM_RATINGS: Record<string, TeamSeed> = {
  Algeria: { fifaRank: 35, elo: 1680, attack: 1.03, defense: 0.99, form: 0.02, confederation: "CAF" },
  Argentina: { fifaRank: 1, elo: 2038, attack: 1.35, defense: 0.8, form: 0.12, confederation: "CONMEBOL" },
  Australia: { fifaRank: 25, elo: 1710, attack: 1, defense: 0.98, form: 0.02, confederation: "AFC" },
  Austria: { fifaRank: 21, elo: 1768, attack: 1.07, defense: 0.93, form: 0.05, confederation: "UEFA" },
  Belgium: { fifaRank: 8, elo: 1918, attack: 1.22, defense: 0.9, form: 0.04, confederation: "UEFA" },
  "Bosnia and Herzegovina": { fifaRank: 70, elo: 1585, attack: 0.99, defense: 1.03, form: 0.01, confederation: "UEFA" },
  Brazil: { fifaRank: 5, elo: 1986, attack: 1.34, defense: 0.82, form: 0.07, confederation: "CONMEBOL" },
  Canada: { fifaRank: 30, elo: 1702, attack: 1.07, defense: 1.01, form: 0.05, confederation: "CONCACAF" },
  "Cape Verde": { fifaRank: 65, elo: 1578, attack: 0.95, defense: 1.02, form: 0.03, confederation: "CAF" },
  Colombia: { fifaRank: 15, elo: 1832, attack: 1.15, defense: 0.91, form: 0.08, confederation: "CONMEBOL" },
  Croatia: { fifaRank: 10, elo: 1888, attack: 1.12, defense: 0.88, form: 0.05, confederation: "UEFA" },
  "Curaçao": { fifaRank: 82, elo: 1508, attack: 0.78, defense: 1.25, form: 0.04, confederation: "CONCACAF" },
  "Czech Republic": { fifaRank: 33, elo: 1694, attack: 1.02, defense: 0.99, form: 0.01, confederation: "UEFA" },
  "Democratic Republic of the Congo": { fifaRank: 61, elo: 1605, attack: 0.98, defense: 1.04, form: 0.02, confederation: "CAF" },
  Ecuador: { fifaRank: 24, elo: 1762, attack: 1.04, defense: 0.9, form: 0.06, confederation: "CONMEBOL" },
  Egypt: { fifaRank: 34, elo: 1688, attack: 1.04, defense: 0.98, form: 0.03, confederation: "CAF" },
  England: { fifaRank: 4, elo: 1988, attack: 1.3, defense: 0.84, form: 0.09, confederation: "UEFA" },
  France: { fifaRank: 2, elo: 2010, attack: 1.33, defense: 0.82, form: 0.1, confederation: "UEFA" },
  Germany: { fifaRank: 9, elo: 1910, attack: 1.32, defense: 0.86, form: 0.13, confederation: "UEFA" },
  Ghana: { fifaRank: 45, elo: 1630, attack: 1, defense: 1.04, form: 0, confederation: "CAF" },
  Haiti: { fifaRank: 86, elo: 1494, attack: 0.88, defense: 1.12, form: 0.01, confederation: "CONCACAF" },
  Iran: { fifaRank: 22, elo: 1746, attack: 1.06, defense: 0.94, form: 0.04, confederation: "AFC" },
  Iraq: { fifaRank: 58, elo: 1608, attack: 0.97, defense: 1.01, form: 0.02, confederation: "AFC" },
  "Ivory Coast": { fifaRank: 38, elo: 1698, attack: 1.08, defense: 1.01, form: 0.1, confederation: "CAF" },
  Japan: { fifaRank: 18, elo: 1798, attack: 1.16, defense: 0.94, form: 0.12, confederation: "AFC" },
  Jordan: { fifaRank: 62, elo: 1596, attack: 0.96, defense: 1.04, form: 0.04, confederation: "AFC" },
  Mexico: { fifaRank: 13, elo: 1815, attack: 1.17, defense: 0.93, form: 0.08, confederation: "CONCACAF" },
  Morocco: { fifaRank: 12, elo: 1840, attack: 1.12, defense: 0.87, form: 0.08, confederation: "CAF" },
  Netherlands: { fifaRank: 7, elo: 1952, attack: 1.28, defense: 0.84, form: 0.1, confederation: "UEFA" },
  "New Zealand": { fifaRank: 47, elo: 1608, attack: 0.94, defense: 1.06, form: 0.01, confederation: "OFC" },
  Norway: { fifaRank: 31, elo: 1719, attack: 1.14, defense: 1.03, form: 0.04, confederation: "UEFA" },
  Panama: { fifaRank: 37, elo: 1660, attack: 0.98, defense: 1.02, form: 0.02, confederation: "CONCACAF" },
  Paraguay: { fifaRank: 39, elo: 1668, attack: 0.98, defense: 0.96, form: 0.01, confederation: "CONMEBOL" },
  Portugal: { fifaRank: 6, elo: 1968, attack: 1.27, defense: 0.85, form: 0.08, confederation: "UEFA" },
  Qatar: { fifaRank: 43, elo: 1648, attack: 0.99, defense: 1.03, form: 0.01, confederation: "AFC" },
  "Saudi Arabia": { fifaRank: 44, elo: 1638, attack: 0.97, defense: 1.04, form: 0.01, confederation: "AFC" },
  Scotland: { fifaRank: 48, elo: 1665, attack: 1.01, defense: 0.99, form: 0.01, confederation: "UEFA" },
  Senegal: { fifaRank: 20, elo: 1772, attack: 1.08, defense: 0.92, form: 0.06, confederation: "CAF" },
  "South Africa": { fifaRank: 55, elo: 1610, attack: 0.96, defense: 1.05, form: 0.02, confederation: "CAF" },
  "South Korea": { fifaRank: 23, elo: 1740, attack: 1.08, defense: 0.96, form: 0.04, confederation: "AFC" },
  Spain: { fifaRank: 3, elo: 1996, attack: 1.29, defense: 0.83, form: 0.11, confederation: "UEFA" },
  Sweden: { fifaRank: 32, elo: 1724, attack: 1.02, defense: 0.97, form: -0.02, confederation: "UEFA" },
  Switzerland: { fifaRank: 17, elo: 1795, attack: 1.05, defense: 0.91, form: 0.02, confederation: "UEFA" },
  Tunisia: { fifaRank: 41, elo: 1684, attack: 0.96, defense: 0.96, form: 0.01, confederation: "CAF" },
  Turkey: { fifaRank: 28, elo: 1718, attack: 1.09, defense: 1.02, form: 0.04, confederation: "UEFA" },
  "United States": { fifaRank: 14, elo: 1810, attack: 1.1, defense: 0.96, form: 0.04, confederation: "CONCACAF" },
  Uruguay: { fifaRank: 11, elo: 1878, attack: 1.18, defense: 0.88, form: 0.07, confederation: "CONMEBOL" },
  Uzbekistan: { fifaRank: 57, elo: 1612, attack: 0.96, defense: 1.01, form: 0.03, confederation: "AFC" }
};

const FLAG_FALLBACKS: Record<string, string> = {
  Argentina: "🇦🇷",
  Australia: "🇦🇺",
  Austria: "🇦🇹",
  Belgium: "🇧🇪",
  Brazil: "🇧🇷",
  Canada: "🇨🇦",
  Colombia: "🇨🇴",
  Croatia: "🇭🇷",
  Ecuador: "🇪🇨",
  Egypt: "🇪🇬",
  England: "🏴",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Ghana: "🇬🇭",
  Iran: "🇮🇷",
  Japan: "🇯🇵",
  Mexico: "🇲🇽",
  Morocco: "🇲🇦",
  Netherlands: "🇳🇱",
  "New Zealand": "🇳🇿",
  Norway: "🇳🇴",
  Panama: "🇵🇦",
  Paraguay: "🇵🇾",
  Portugal: "🇵🇹",
  Qatar: "🇶🇦",
  Senegal: "🇸🇳",
  Spain: "🇪🇸",
  Sweden: "🇸🇪",
  Switzerland: "🇨🇭",
  Tunisia: "🇹🇳",
  Turkey: "🇹🇷",
  "United States": "🇺🇸",
  Uruguay: "🇺🇾"
};

const STAGE_LABELS: Record<string, string> = {
  group: "Group Stage",
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarterfinal",
  sf: "Semifinal",
  third: "Third-place Match",
  final: "Final"
};

const weatherByRegion: Record<string, string> = {
  Central: "赛程真实；天气为赛前通用估计，临场需接天气源确认",
  Eastern: "赛程真实；东部赛区湿热和晚场节奏需临场确认",
  Western: "赛程真实；西部赛区旅行距离和开球时间影响更大"
};

export const SCHEDULE_SOURCE = {
  source: rawSchedule.source,
  updatedAt: rawSchedule.updatedAt,
  note: "2026 World Cup 104-match schedule snapshot; unknown knockout participants are kept as qualification slots."
};

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function flagFromTeam(team: RawTeam) {
  if (FLAG_FALLBACKS[team.name_en]) return FLAG_FALLBACKS[team.name_en];
  if (!team.iso2 || team.iso2.length !== 2) return "🏳";
  return team.iso2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

function makeTeam(team: RawTeam): Team {
  const rating = TEAM_RATINGS[team.name_en] ?? DEFAULT_RATING;
  return {
    id: slug(team.name_en),
    name: team.name_en,
    shortName: team.fifa_code,
    flag: flagFromTeam(team),
    confederation: rating.confederation,
    rating: {
      fifaRank: rating.fifaRank,
      elo: rating.elo,
      attack: rating.attack,
      defense: rating.defense,
      form: rating.form
    }
  };
}

const teamsByRawId = new Map(rawSchedule.teams.teams.map((team) => [String(team.id), makeTeam(team)]));
const stadiumsByRawId = new Map(rawSchedule.stadiums.stadiums.map((stadium) => [String(stadium.id), stadium]));

export const TEAMS: Record<string, Team> = Object.fromEntries([...teamsByRawId.values()].map((team) => [team.id, team]));

export function isPlaceholderTeam(team: Team) {
  return team.id.startsWith("slot-");
}

export function isPredictableMatch(match: Match) {
  return !isPlaceholderTeam(match.homeTeam) && !isPlaceholderTeam(match.awayTeam);
}

function labelToChineseSlot(label: string) {
  return label
    .replace(/^Winner Group ([A-L])$/i, "$1 组第一")
    .replace(/^Runner-up Group ([A-L])$/i, "$1 组第二")
    .replace(/^3rd Group (.+)$/i, "$1 组第三候选")
    .replace(/^Winner Match (\d+)$/i, "第 $1 场胜者")
    .replace(/^Loser Match (\d+)$/i, "第 $1 场负者");
}

function makeSlotTeam(rawLabel: string, side: "home" | "away", matchId: string): Team {
  const english = rawLabel || "Team TBD";
  return {
    id: `slot-${matchId}-${side}`,
    name: labelToChineseSlot(english),
    shortName: "TBD",
    flag: "待",
    confederation: "TBD",
    rating: {
      fifaRank: DEFAULT_RATING.fifaRank,
      elo: DEFAULT_RATING.elo,
      attack: DEFAULT_RATING.attack,
      defense: DEFAULT_RATING.defense,
      form: DEFAULT_RATING.form
    }
  };
}

function getTeam(game: RawGame, side: "home" | "away"): Team {
  const rawId = side === "home" ? game.home_team_id : game.away_team_id;
  const team = teamsByRawId.get(String(rawId));
  if (team) return team;
  return makeSlotTeam(side === "home" ? "home_team_label" in game ? String(game.home_team_label) : "" : "away_team_label" in game ? String(game.away_team_label) : "", side, game.id);
}

function kickoffUtc(localDate: string) {
  const [date, time] = localDate.split(" ");
  const [month, day, year] = date.split("/").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute)).toISOString();
}

function scoreValue(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function statusFor(game: RawGame) {
  if (String(game.finished).toUpperCase() === "TRUE") return "final" as const;
  if (String(game.time_elapsed).toLowerCase() === "live") return "live" as const;
  return "scheduled" as const;
}

function makeSignals(homeTeam: Team, awayTeam: Team, game: RawGame) {
  if (isPlaceholderTeam(homeTeam) || isPlaceholderTeam(awayTeam)) {
    return [
      {
        label: "Knockout participants are not known yet",
        impact: 0,
        source: "official schedule slot"
      }
    ];
  }

  const eloDiff = homeTeam.rating.elo - awayTeam.rating.elo;
  return [
    {
      label: eloDiff >= 0 ? `${homeTeam.name} Elo edge` : `${awayTeam.name} Elo edge`,
      impact: Math.max(-0.04, Math.min(0.04, eloDiff / 9000)),
      source: "rating model"
    },
    {
      label: `Match ${game.id} verified schedule slot`,
      impact: 0,
      source: rawSchedule.source
    }
  ];
}

function makeMatch(game: RawGame): Match {
  const homeTeam = getTeam(game, "home");
  const awayTeam = getTeam(game, "away");
  const stadium = stadiumsByRawId.get(String(game.stadium_id)) as RawStadium | undefined;
  const kickoff = kickoffUtc(game.local_date);
  const status = statusFor(game);
  const stage = STAGE_LABELS[String(game.type).toLowerCase()] ?? "Group Stage";

  return {
    id: `match-${String(game.id).padStart(3, "0")}`,
    kickoff,
    kickoffLabel: game.local_date,
    venue: stadium?.fifa_name ?? stadium?.name_en ?? "TBD venue",
    city: stadium?.city_en ?? "TBD city",
    stage,
    group: stage === "Group Stage" ? `Group ${game.group}` : "Knockout",
    homeTeam,
    awayTeam,
    status,
    homeScore: status === "final" ? scoreValue(game.home_score) : null,
    awayScore: status === "final" ? scoreValue(game.away_score) : null,
    weather: weatherByRegion[stadium?.region ?? ""] ?? "赛程真实；临场天气待接入",
    newsSignals: makeSignals(homeTeam, awayTeam, game)
  };
}

export const DEMO_MATCHES: Match[] = rawSchedule.games.games
  .slice()
  .sort((a, b) => Number(a.id) - Number(b.id))
  .map(makeMatch);

export const DEMO_ODDS: OddsSnapshot[] = [];
