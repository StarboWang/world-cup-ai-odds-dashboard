import type { Match, OddsSnapshot, Team } from "@/lib/types";

export const TEAMS: Record<string, Team> = {
  mexico: {
    id: "mexico",
    name: "Mexico",
    shortName: "MEX",
    flag: "🇲🇽",
    confederation: "CONCACAF",
    rating: { fifaRank: 13, elo: 1815, attack: 1.17, defense: 0.93, form: 0.08 }
  },
  south_africa: {
    id: "south_africa",
    name: "South Africa",
    shortName: "RSA",
    flag: "🇿🇦",
    confederation: "CAF",
    rating: { fifaRank: 55, elo: 1610, attack: 0.96, defense: 1.05, form: 0.02 }
  },
  germany: {
    id: "germany",
    name: "Germany",
    shortName: "GER",
    flag: "🇩🇪",
    confederation: "UEFA",
    rating: { fifaRank: 9, elo: 1910, attack: 1.32, defense: 0.86, form: 0.13 }
  },
  curacao: {
    id: "curacao",
    name: "Curacao",
    shortName: "CUW",
    flag: "🇨🇼",
    confederation: "CONCACAF",
    rating: { fifaRank: 82, elo: 1508, attack: 0.78, defense: 1.25, form: 0.04 }
  },
  ivory_coast: {
    id: "ivory_coast",
    name: "Ivory Coast",
    shortName: "CIV",
    flag: "🇨🇮",
    confederation: "CAF",
    rating: { fifaRank: 38, elo: 1698, attack: 1.08, defense: 1.01, form: 0.1 }
  },
  ecuador: {
    id: "ecuador",
    name: "Ecuador",
    shortName: "ECU",
    flag: "🇪🇨",
    confederation: "CONMEBOL",
    rating: { fifaRank: 24, elo: 1762, attack: 1.04, defense: 0.9, form: 0.06 }
  },
  netherlands: {
    id: "netherlands",
    name: "Netherlands",
    shortName: "NED",
    flag: "🇳🇱",
    confederation: "UEFA",
    rating: { fifaRank: 7, elo: 1952, attack: 1.28, defense: 0.84, form: 0.1 }
  },
  japan: {
    id: "japan",
    name: "Japan",
    shortName: "JPN",
    flag: "🇯🇵",
    confederation: "AFC",
    rating: { fifaRank: 18, elo: 1798, attack: 1.16, defense: 0.94, form: 0.12 }
  },
  sweden: {
    id: "sweden",
    name: "Sweden",
    shortName: "SWE",
    flag: "🇸🇪",
    confederation: "UEFA",
    rating: { fifaRank: 32, elo: 1724, attack: 1.02, defense: 0.97, form: -0.02 }
  },
  tunisia: {
    id: "tunisia",
    name: "Tunisia",
    shortName: "TUN",
    flag: "🇹🇳",
    confederation: "CAF",
    rating: { fifaRank: 41, elo: 1684, attack: 0.96, defense: 0.96, form: 0.01 }
  },
  brazil: {
    id: "brazil",
    name: "Brazil",
    shortName: "BRA",
    flag: "🇧🇷",
    confederation: "CONMEBOL",
    rating: { fifaRank: 5, elo: 1986, attack: 1.34, defense: 0.82, form: 0.07 }
  },
  morocco: {
    id: "morocco",
    name: "Morocco",
    shortName: "MAR",
    flag: "🇲🇦",
    confederation: "CAF",
    rating: { fifaRank: 12, elo: 1840, attack: 1.12, defense: 0.87, form: 0.08 }
  }
};

export const DEMO_MATCHES: Match[] = [
  {
    id: "2026-06-11-mexico-south-africa",
    kickoff: "2026-06-11T19:00:00Z",
    venue: "Estadio Azteca",
    city: "Mexico City",
    stage: "Group Stage",
    group: "Group A",
    homeTeam: TEAMS.mexico,
    awayTeam: TEAMS.south_africa,
    status: "final",
    homeScore: 2,
    awayScore: 1,
    weather: "Mild evening, altitude advantage for Mexico",
    newsSignals: [
      { label: "Mexico altitude familiarity", impact: 0.04, source: "venue model" },
      { label: "South Africa compact low block", impact: -0.01, source: "tactical prior" }
    ]
  },
  {
    id: "2026-06-14-germany-curacao",
    kickoff: "2026-06-14T17:00:00Z",
    venue: "MetLife Stadium",
    city: "New York/New Jersey",
    stage: "Group Stage",
    group: "Group E",
    homeTeam: TEAMS.germany,
    awayTeam: TEAMS.curacao,
    status: "scheduled",
    homeScore: null,
    awayScore: null,
    weather: "Warm afternoon, light wind",
    newsSignals: [
      { label: "Germany expected to rotate front line", impact: -0.02, source: "LLM news agent demo" },
      { label: "Curacao goalkeeper in strong club form", impact: -0.01, source: "LLM news agent demo" }
    ]
  },
  {
    id: "2026-06-14-ivory-coast-ecuador",
    kickoff: "2026-06-14T20:00:00Z",
    venue: "Lincoln Financial Field",
    city: "Philadelphia",
    stage: "Group Stage",
    group: "Group F",
    homeTeam: TEAMS.ivory_coast,
    awayTeam: TEAMS.ecuador,
    status: "scheduled",
    homeScore: null,
    awayScore: null,
    weather: "Humid, possible late showers",
    newsSignals: [
      { label: "Ecuador defensive continuity", impact: 0.02, source: "LLM news agent demo" },
      { label: "Ivory Coast set-piece edge", impact: 0.02, source: "LLM news agent demo" }
    ]
  },
  {
    id: "2026-06-14-netherlands-japan",
    kickoff: "2026-06-14T23:00:00Z",
    venue: "AT&T Stadium",
    city: "Dallas",
    stage: "Group Stage",
    group: "Group H",
    homeTeam: TEAMS.netherlands,
    awayTeam: TEAMS.japan,
    status: "scheduled",
    homeScore: null,
    awayScore: null,
    weather: "Indoor controlled conditions",
    newsSignals: [
      { label: "Japan transition threat", impact: 0.03, source: "LLM news agent demo" },
      { label: "Netherlands aerial mismatch", impact: 0.02, source: "LLM news agent demo" }
    ]
  },
  {
    id: "2026-06-14-sweden-tunisia",
    kickoff: "2026-06-15T02:00:00Z",
    venue: "BC Place",
    city: "Vancouver",
    stage: "Group Stage",
    group: "Group C",
    homeTeam: TEAMS.sweden,
    awayTeam: TEAMS.tunisia,
    status: "scheduled",
    homeScore: null,
    awayScore: null,
    weather: "Indoor controlled conditions",
    newsSignals: [
      { label: "Tunisia defensive shape lowers total", impact: -0.03, source: "LLM news agent demo" },
      { label: "Sweden set-piece volume", impact: 0.02, source: "LLM news agent demo" }
    ]
  },
  {
    id: "2026-06-16-brazil-morocco",
    kickoff: "2026-06-16T22:00:00Z",
    venue: "Hard Rock Stadium",
    city: "Miami",
    stage: "Group Stage",
    group: "Group B",
    homeTeam: TEAMS.brazil,
    awayTeam: TEAMS.morocco,
    status: "scheduled",
    homeScore: null,
    awayScore: null,
    weather: "Hot and humid",
    newsSignals: [
      { label: "Morocco rest defense travels well", impact: 0.01, source: "LLM news agent demo" },
      { label: "Brazil forward depth advantage", impact: 0.03, source: "LLM news agent demo" }
    ]
  }
];

const capturedAt = "2026-06-14T10:30:00Z";

export const DEMO_ODDS: OddsSnapshot[] = [
  {
    matchId: "2026-06-11-mexico-south-africa",
    source: "cached-demo",
    stale: false,
    capturedAt: "2026-06-11T18:45:00Z",
    bookmakers: [
      {
        key: "betmgm",
        title: "BetMGM",
        lastUpdate: "2026-06-11T18:42:00Z",
        markets: [
          {
            key: "h2h",
            lastUpdate: "2026-06-11T18:42:00Z",
            outcomes: [
              { name: "Mexico", price: 1.62 },
              { name: "Draw", price: 3.85 },
              { name: "South Africa", price: 5.8 }
            ]
          }
        ]
      }
    ]
  },
  {
    matchId: "2026-06-14-germany-curacao",
    source: "cached-demo",
    stale: false,
    capturedAt,
    bookmakers: [
      {
        key: "draftkings",
        title: "DraftKings",
        lastUpdate: capturedAt,
        markets: [
          {
            key: "h2h",
            lastUpdate: capturedAt,
            outcomes: [
              { name: "Germany", price: 1.05 },
              { name: "Draw", price: 12.0 },
              { name: "Curacao", price: 31.0 }
            ]
          },
          {
            key: "totals",
            lastUpdate: capturedAt,
            outcomes: [
              { name: "Over", point: 3.5, price: 1.95 },
              { name: "Under", point: 3.5, price: 1.87 }
            ]
          }
        ]
      },
      {
        key: "fanduel",
        title: "FanDuel",
        lastUpdate: capturedAt,
        markets: [
          {
            key: "h2h",
            lastUpdate: capturedAt,
            outcomes: [
              { name: "Germany", price: 1.04 },
              { name: "Draw", price: 12.5 },
              { name: "Curacao", price: 34.0 }
            ]
          }
        ]
      }
    ]
  },
  {
    matchId: "2026-06-14-ivory-coast-ecuador",
    source: "cached-demo",
    stale: false,
    capturedAt,
    bookmakers: [
      {
        key: "betmgm",
        title: "BetMGM",
        lastUpdate: capturedAt,
        markets: [
          {
            key: "h2h",
            lastUpdate: capturedAt,
            outcomes: [
              { name: "Ivory Coast", price: 3.05 },
              { name: "Draw", price: 3.15 },
              { name: "Ecuador", price: 2.38 }
            ]
          },
          {
            key: "totals",
            lastUpdate: capturedAt,
            outcomes: [
              { name: "Over", point: 2.5, price: 2.16 },
              { name: "Under", point: 2.5, price: 1.72 }
            ]
          }
        ]
      }
    ]
  },
  {
    matchId: "2026-06-14-netherlands-japan",
    source: "cached-demo",
    stale: false,
    capturedAt,
    bookmakers: [
      {
        key: "draftkings",
        title: "DraftKings",
        lastUpdate: capturedAt,
        markets: [
          {
            key: "h2h",
            lastUpdate: capturedAt,
            outcomes: [
              { name: "Netherlands", price: 1.76 },
              { name: "Draw", price: 3.8 },
              { name: "Japan", price: 4.65 }
            ]
          },
          {
            key: "totals",
            lastUpdate: capturedAt,
            outcomes: [
              { name: "Over", point: 2.5, price: 1.94 },
              { name: "Under", point: 2.5, price: 1.9 }
            ]
          }
        ]
      }
    ]
  },
  {
    matchId: "2026-06-14-sweden-tunisia",
    source: "cached-demo",
    stale: false,
    capturedAt,
    bookmakers: [
      {
        key: "bet365",
        title: "bet365",
        lastUpdate: capturedAt,
        markets: [
          {
            key: "h2h",
            lastUpdate: capturedAt,
            outcomes: [
              { name: "Sweden", price: 2.02 },
              { name: "Draw", price: 3.22 },
              { name: "Tunisia", price: 3.95 }
            ]
          },
          {
            key: "totals",
            lastUpdate: capturedAt,
            outcomes: [
              { name: "Over", point: 2.5, price: 2.23 },
              { name: "Under", point: 2.5, price: 1.68 }
            ]
          }
        ]
      }
    ]
  },
  {
    matchId: "2026-06-16-brazil-morocco",
    source: "cached-demo",
    stale: false,
    capturedAt,
    bookmakers: [
      {
        key: "fanduel",
        title: "FanDuel",
        lastUpdate: capturedAt,
        markets: [
          {
            key: "h2h",
            lastUpdate: capturedAt,
            outcomes: [
              { name: "Brazil", price: 1.82 },
              { name: "Draw", price: 3.55 },
              { name: "Morocco", price: 4.7 }
            ]
          },
          {
            key: "totals",
            lastUpdate: capturedAt,
            outcomes: [
              { name: "Over", point: 2.5, price: 1.98 },
              { name: "Under", point: 2.5, price: 1.86 }
            ]
          }
        ]
      }
    ]
  }
];
