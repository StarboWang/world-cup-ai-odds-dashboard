import type { Match, OddsSnapshot, Team } from "@/lib/types";

type TeamSeed = {
  id: string;
  name: string;
  shortName: string;
  flag: string;
  confederation: string;
  fifaRank: number;
  elo: number;
  attack: number;
  defense: number;
  form: number;
};

const TEAM_SEEDS: TeamSeed[] = [
  { id: "mexico", name: "Mexico", shortName: "MEX", flag: "🇲🇽", confederation: "CONCACAF", fifaRank: 13, elo: 1815, attack: 1.17, defense: 0.93, form: 0.08 },
  { id: "south_africa", name: "South Africa", shortName: "RSA", flag: "🇿🇦", confederation: "CAF", fifaRank: 55, elo: 1610, attack: 0.96, defense: 1.05, form: 0.02 },
  { id: "germany", name: "Germany", shortName: "GER", flag: "🇩🇪", confederation: "UEFA", fifaRank: 9, elo: 1910, attack: 1.32, defense: 0.86, form: 0.13 },
  { id: "curacao", name: "Curacao", shortName: "CUW", flag: "🇨🇼", confederation: "CONCACAF", fifaRank: 82, elo: 1508, attack: 0.78, defense: 1.25, form: 0.04 },
  { id: "ivory_coast", name: "Ivory Coast", shortName: "CIV", flag: "🇨🇮", confederation: "CAF", fifaRank: 38, elo: 1698, attack: 1.08, defense: 1.01, form: 0.1 },
  { id: "ecuador", name: "Ecuador", shortName: "ECU", flag: "🇪🇨", confederation: "CONMEBOL", fifaRank: 24, elo: 1762, attack: 1.04, defense: 0.9, form: 0.06 },
  { id: "netherlands", name: "Netherlands", shortName: "NED", flag: "🇳🇱", confederation: "UEFA", fifaRank: 7, elo: 1952, attack: 1.28, defense: 0.84, form: 0.1 },
  { id: "japan", name: "Japan", shortName: "JPN", flag: "🇯🇵", confederation: "AFC", fifaRank: 18, elo: 1798, attack: 1.16, defense: 0.94, form: 0.12 },
  { id: "sweden", name: "Sweden", shortName: "SWE", flag: "🇸🇪", confederation: "UEFA", fifaRank: 32, elo: 1724, attack: 1.02, defense: 0.97, form: -0.02 },
  { id: "tunisia", name: "Tunisia", shortName: "TUN", flag: "🇹🇳", confederation: "CAF", fifaRank: 41, elo: 1684, attack: 0.96, defense: 0.96, form: 0.01 },
  { id: "brazil", name: "Brazil", shortName: "BRA", flag: "🇧🇷", confederation: "CONMEBOL", fifaRank: 5, elo: 1986, attack: 1.34, defense: 0.82, form: 0.07 },
  { id: "morocco", name: "Morocco", shortName: "MAR", flag: "🇲🇦", confederation: "CAF", fifaRank: 12, elo: 1840, attack: 1.12, defense: 0.87, form: 0.08 },
  { id: "argentina", name: "Argentina", shortName: "ARG", flag: "🇦🇷", confederation: "CONMEBOL", fifaRank: 1, elo: 2038, attack: 1.35, defense: 0.8, form: 0.12 },
  { id: "france", name: "France", shortName: "FRA", flag: "🇫🇷", confederation: "UEFA", fifaRank: 2, elo: 2010, attack: 1.33, defense: 0.82, form: 0.1 },
  { id: "spain", name: "Spain", shortName: "ESP", flag: "🇪🇸", confederation: "UEFA", fifaRank: 3, elo: 1996, attack: 1.29, defense: 0.83, form: 0.11 },
  { id: "england", name: "England", shortName: "ENG", flag: "🏴", confederation: "UEFA", fifaRank: 4, elo: 1988, attack: 1.3, defense: 0.84, form: 0.09 },
  { id: "portugal", name: "Portugal", shortName: "POR", flag: "🇵🇹", confederation: "UEFA", fifaRank: 6, elo: 1968, attack: 1.27, defense: 0.85, form: 0.08 },
  { id: "belgium", name: "Belgium", shortName: "BEL", flag: "🇧🇪", confederation: "UEFA", fifaRank: 8, elo: 1918, attack: 1.22, defense: 0.9, form: 0.04 },
  { id: "croatia", name: "Croatia", shortName: "CRO", flag: "🇭🇷", confederation: "UEFA", fifaRank: 10, elo: 1888, attack: 1.12, defense: 0.88, form: 0.05 },
  { id: "uruguay", name: "Uruguay", shortName: "URU", flag: "🇺🇾", confederation: "CONMEBOL", fifaRank: 11, elo: 1878, attack: 1.18, defense: 0.88, form: 0.07 },
  { id: "usa", name: "United States", shortName: "USA", flag: "🇺🇸", confederation: "CONCACAF", fifaRank: 14, elo: 1810, attack: 1.1, defense: 0.96, form: 0.04 },
  { id: "colombia", name: "Colombia", shortName: "COL", flag: "🇨🇴", confederation: "CONMEBOL", fifaRank: 15, elo: 1832, attack: 1.15, defense: 0.91, form: 0.08 },
  { id: "italy", name: "Italy", shortName: "ITA", flag: "🇮🇹", confederation: "UEFA", fifaRank: 16, elo: 1846, attack: 1.1, defense: 0.86, form: 0.03 },
  { id: "switzerland", name: "Switzerland", shortName: "SUI", flag: "🇨🇭", confederation: "UEFA", fifaRank: 17, elo: 1795, attack: 1.05, defense: 0.91, form: 0.02 },
  { id: "denmark", name: "Denmark", shortName: "DEN", flag: "🇩🇰", confederation: "UEFA", fifaRank: 19, elo: 1786, attack: 1.09, defense: 0.9, form: 0.03 },
  { id: "senegal", name: "Senegal", shortName: "SEN", flag: "🇸🇳", confederation: "CAF", fifaRank: 20, elo: 1772, attack: 1.08, defense: 0.92, form: 0.06 },
  { id: "austria", name: "Austria", shortName: "AUT", flag: "🇦🇹", confederation: "UEFA", fifaRank: 21, elo: 1768, attack: 1.07, defense: 0.93, form: 0.05 },
  { id: "iran", name: "Iran", shortName: "IRN", flag: "🇮🇷", confederation: "AFC", fifaRank: 22, elo: 1746, attack: 1.06, defense: 0.94, form: 0.04 },
  { id: "korea_republic", name: "Korea Republic", shortName: "KOR", flag: "🇰🇷", confederation: "AFC", fifaRank: 23, elo: 1740, attack: 1.08, defense: 0.96, form: 0.04 },
  { id: "australia", name: "Australia", shortName: "AUS", flag: "🇦🇺", confederation: "AFC", fifaRank: 25, elo: 1710, attack: 1.0, defense: 0.98, form: 0.02 },
  { id: "serbia", name: "Serbia", shortName: "SRB", flag: "🇷🇸", confederation: "UEFA", fifaRank: 26, elo: 1720, attack: 1.08, defense: 1.0, form: 0.01 },
  { id: "poland", name: "Poland", shortName: "POL", flag: "🇵🇱", confederation: "UEFA", fifaRank: 27, elo: 1712, attack: 1.04, defense: 0.99, form: 0.01 },
  { id: "turkey", name: "Turkey", shortName: "TUR", flag: "🇹🇷", confederation: "UEFA", fifaRank: 28, elo: 1718, attack: 1.09, defense: 1.02, form: 0.04 },
  { id: "ukraine", name: "Ukraine", shortName: "UKR", flag: "🇺🇦", confederation: "UEFA", fifaRank: 29, elo: 1715, attack: 1.05, defense: 0.97, form: 0.03 },
  { id: "canada", name: "Canada", shortName: "CAN", flag: "🇨🇦", confederation: "CONCACAF", fifaRank: 30, elo: 1702, attack: 1.07, defense: 1.01, form: 0.05 },
  { id: "norway", name: "Norway", shortName: "NOR", flag: "🇳🇴", confederation: "UEFA", fifaRank: 31, elo: 1719, attack: 1.14, defense: 1.03, form: 0.04 },
  { id: "czechia", name: "Czechia", shortName: "CZE", flag: "🇨🇿", confederation: "UEFA", fifaRank: 33, elo: 1694, attack: 1.02, defense: 0.99, form: 0.01 },
  { id: "egypt", name: "Egypt", shortName: "EGY", flag: "🇪🇬", confederation: "CAF", fifaRank: 34, elo: 1688, attack: 1.04, defense: 0.98, form: 0.03 },
  { id: "algeria", name: "Algeria", shortName: "ALG", flag: "🇩🇿", confederation: "CAF", fifaRank: 35, elo: 1680, attack: 1.03, defense: 0.99, form: 0.02 },
  { id: "nigeria", name: "Nigeria", shortName: "NGA", flag: "🇳🇬", confederation: "CAF", fifaRank: 36, elo: 1678, attack: 1.06, defense: 1.0, form: 0.03 },
  { id: "panama", name: "Panama", shortName: "PAN", flag: "🇵🇦", confederation: "CONCACAF", fifaRank: 37, elo: 1660, attack: 0.98, defense: 1.02, form: 0.02 },
  { id: "paraguay", name: "Paraguay", shortName: "PAR", flag: "🇵🇾", confederation: "CONMEBOL", fifaRank: 39, elo: 1668, attack: 0.98, defense: 0.96, form: 0.01 },
  { id: "chile", name: "Chile", shortName: "CHI", flag: "🇨🇱", confederation: "CONMEBOL", fifaRank: 40, elo: 1662, attack: 1.0, defense: 1.01, form: -0.01 },
  { id: "peru", name: "Peru", shortName: "PER", flag: "🇵🇪", confederation: "CONMEBOL", fifaRank: 42, elo: 1650, attack: 0.97, defense: 1.0, form: -0.01 },
  { id: "qatar", name: "Qatar", shortName: "QAT", flag: "🇶🇦", confederation: "AFC", fifaRank: 43, elo: 1648, attack: 0.99, defense: 1.03, form: 0.01 },
  { id: "saudi_arabia", name: "Saudi Arabia", shortName: "KSA", flag: "🇸🇦", confederation: "AFC", fifaRank: 44, elo: 1638, attack: 0.97, defense: 1.04, form: 0.01 },
  { id: "ghana", name: "Ghana", shortName: "GHA", flag: "🇬🇭", confederation: "CAF", fifaRank: 45, elo: 1630, attack: 1.0, defense: 1.04, form: 0 },
  { id: "costa_rica", name: "Costa Rica", shortName: "CRC", flag: "🇨🇷", confederation: "CONCACAF", fifaRank: 46, elo: 1626, attack: 0.95, defense: 1.03, form: 0 },
  { id: "new_zealand", name: "New Zealand", shortName: "NZL", flag: "🇳🇿", confederation: "OFC", fifaRank: 47, elo: 1608, attack: 0.94, defense: 1.06, form: 0.01 }
];

export const TEAMS: Record<string, Team> = Object.fromEntries(
  TEAM_SEEDS.map((team) => [
    team.id,
    {
      id: team.id,
      name: team.name,
      shortName: team.shortName,
      flag: team.flag,
      confederation: team.confederation,
      rating: {
        fifaRank: team.fifaRank,
        elo: team.elo,
        attack: team.attack,
        defense: team.defense,
        form: team.form
      }
    }
  ])
);

const GROUPS = [
  ["mexico", "south_africa", "uruguay", "qatar"],
  ["brazil", "morocco", "canada", "new_zealand"],
  ["sweden", "tunisia", "colombia", "saudi_arabia"],
  ["argentina", "denmark", "senegal", "costa_rica"],
  ["germany", "curacao", "usa", "ghana"],
  ["ivory_coast", "ecuador", "portugal", "iran"],
  ["france", "korea_republic", "croatia", "panama"],
  ["netherlands", "japan", "australia", "egypt"],
  ["spain", "paraguay", "serbia", "peru"],
  ["england", "chile", "algeria", "czechia"],
  ["belgium", "turkey", "poland", "qatar"],
  ["italy", "switzerland", "norway", "nigeria"]
];

const VENUES = [
  ["Estadio Azteca", "Mexico City"],
  ["MetLife Stadium", "New York/New Jersey"],
  ["Lincoln Financial Field", "Philadelphia"],
  ["AT&T Stadium", "Dallas"],
  ["BC Place", "Vancouver"],
  ["Hard Rock Stadium", "Miami"],
  ["SoFi Stadium", "Los Angeles"],
  ["Lumen Field", "Seattle"],
  ["Mercedes-Benz Stadium", "Atlanta"],
  ["Levi's Stadium", "San Francisco Bay Area"],
  ["NRG Stadium", "Houston"],
  ["Gillette Stadium", "Boston"],
  ["BMO Field", "Toronto"],
  ["GEHA Field at Arrowhead Stadium", "Kansas City"],
  ["Estadio Akron", "Guadalajara"],
  ["Estadio BBVA", "Monterrey"]
];

const WEATHER = ["Warm afternoon, light wind", "Indoor controlled conditions", "Hot and humid", "Humid, possible late showers", "Mild evening, altitude advantage for Mexico"];

function kickoffFor(index: number) {
  const start = Date.UTC(2026, 5, 11, 19, 0, 0);
  const kickoff = new Date(start + index * 3 * 60 * 60 * 1000);
  return kickoff.toISOString();
}

function makeSignals(home: Team, away: Team, index: number) {
  const eloDiff = home.rating.elo - away.rating.elo;
  return [
    {
      label: eloDiff >= 0 ? `${home.name} Elo edge` : `${away.name} Elo edge`,
      impact: Math.max(-0.04, Math.min(0.04, eloDiff / 9000)),
      source: "rating model"
    },
    {
      label: index % 2 === 0 ? "Set-piece and transition profile" : "Rest and travel adjustment",
      impact: index % 2 === 0 ? 0.015 : -0.01,
      source: "schedule prior"
    }
  ];
}

function makeMatch(index: number, homeId: string, awayId: string, groupIndex: number, roundLabel: string): Match {
  const homeTeam = TEAMS[homeId];
  const awayTeam = TEAMS[awayId];
  const [venue, city] = VENUES[index % VENUES.length];
  const kickoff = kickoffFor(index);
  const status = index === 0 ? "final" : "scheduled";

  return {
    id: `${kickoff.slice(0, 10)}-${homeId}-${awayId}`,
    kickoff,
    venue,
    city,
    stage: "Group Stage",
    group: `Group ${String.fromCharCode(65 + groupIndex)}`,
    homeTeam,
    awayTeam,
    status,
    homeScore: status === "final" ? 2 : null,
    awayScore: status === "final" ? 1 : null,
    weather: WEATHER[index % WEATHER.length],
    newsSignals: makeSignals(homeTeam, awayTeam, index)
  };
}

function buildGroupMatches() {
  let index = 0;
  const pairings = [
    [0, 1],
    [2, 3],
    [0, 2],
    [1, 3],
    [0, 3],
    [1, 2]
  ];

  return GROUPS.flatMap((group, groupIndex) =>
    pairings.map(([homeIndex, awayIndex]) => makeMatch(index++, group[homeIndex], group[awayIndex], groupIndex, `Matchday ${Math.floor(index / 2) + 1}`))
  );
}

function buildKnockoutMatches(offset: number): Match[] {
  const rounds = [
    { stage: "Round of 32", count: 16 },
    { stage: "Round of 16", count: 8 },
    { stage: "Quarterfinal", count: 4 },
    { stage: "Semifinal", count: 2 },
    { stage: "Third-place Match", count: 1 },
    { stage: "Final", count: 1 }
  ];
  let index = offset;
  let slot = 1;

  return rounds.flatMap((round) =>
    Array.from({ length: round.count }, () => {
      const [venue, city] = VENUES[index % VENUES.length];
      const kickoff = kickoffFor(index++);
      const homeTeam = {
        ...TEAMS[(TEAM_SEEDS[(slot * 2) % TEAM_SEEDS.length]).id],
        id: `${round.stage.toLowerCase().replace(/\s+/g, "-")}-${slot}-home`,
        name: `${round.stage} Seed ${slot}A`,
        shortName: `S${slot}A`,
        flag: "🏆"
      };
      const awayTeam = {
        ...TEAMS[(TEAM_SEEDS[(slot * 2 + 1) % TEAM_SEEDS.length]).id],
        id: `${round.stage.toLowerCase().replace(/\s+/g, "-")}-${slot}-away`,
        name: `${round.stage} Seed ${slot}B`,
        shortName: `S${slot}B`,
        flag: "🏆"
      };
      const match: Match = {
        id: `${kickoff.slice(0, 10)}-${round.stage.toLowerCase().replace(/\s+/g, "-")}-${slot}`,
        kickoff,
        venue,
        city,
        stage: round.stage,
        group: "Knockout",
        homeTeam,
        awayTeam,
        status: "scheduled",
        homeScore: null,
        awayScore: null,
        weather: WEATHER[index % WEATHER.length],
        newsSignals: makeSignals(homeTeam, awayTeam, index)
      };
      slot += 1;
      return match;
    })
  );
}

const GROUP_MATCHES = buildGroupMatches();
export const DEMO_MATCHES: Match[] = [...GROUP_MATCHES, ...buildKnockoutMatches(GROUP_MATCHES.length)];

const capturedAt = "2026-06-14T10:30:00Z";

function h2hSnapshot(match: Match, prices: [number, number, number], bookmaker = "FanDuel"): OddsSnapshot {
  return {
    matchId: match.id,
    source: "cached-demo",
    stale: false,
    capturedAt,
    bookmakers: [
      {
        key: bookmaker.toLowerCase().replace(/\s+/g, "-"),
        title: bookmaker,
        lastUpdate: capturedAt,
        markets: [
          {
            key: "h2h",
            lastUpdate: capturedAt,
            outcomes: [
              { name: match.homeTeam.name, price: prices[0] },
              { name: "Draw", price: prices[1] },
              { name: match.awayTeam.name, price: prices[2] }
            ]
          }
        ]
      }
    ]
  };
}

const ODDS_PRICES: [number, number, number][] = [
  [1.62, 3.85, 5.8],
  [1.05, 12, 31],
  [3.35, 3.2, 2.25],
  [2.0, 3.45, 3.85],
  [1.95, 3.25, 4.2],
  [1.82, 3.65, 4.5],
  [1.34, 5.2, 8.4],
  [1.76, 3.55, 4.8],
  [2.15, 3.15, 3.55],
  [1.7, 3.75, 5.2],
  [2.55, 3.0, 2.95],
  [1.52, 4.1, 6.5]
];

export const DEMO_ODDS: OddsSnapshot[] = DEMO_MATCHES.map((match, index) => h2hSnapshot(match, ODDS_PRICES[index % ODDS_PRICES.length], index % 2 === 0 ? "FanDuel" : "BetMGM"));
