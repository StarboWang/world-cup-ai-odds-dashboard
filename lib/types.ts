export type Market = "h2h" | "spreads" | "totals";
export type MatchStatus = "scheduled" | "live" | "final";
export type BetStatus = "open" | "won" | "lost" | "push";

export interface TeamRating {
  fifaRank: number;
  elo: number;
  attack: number;
  defense: number;
  form: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  flag: string;
  confederation: string;
  rating: TeamRating;
}

export interface Match {
  id: string;
  kickoff: string;
  kickoffLabel?: string;
  venue: string;
  city: string;
  stage: string;
  group: string;
  homeTeam: Team;
  awayTeam: Team;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  weather: string;
  newsSignals: NewsSignal[];
}

export interface NewsSignal {
  label: string;
  impact: number;
  source: string;
}

export interface OutcomePrice {
  name: string;
  price: number;
  point?: number;
}

export interface BookmakerMarket {
  key: Market;
  lastUpdate: string;
  outcomes: OutcomePrice[];
}

export interface BookmakerOdds {
  key: string;
  title: string;
  lastUpdate: string;
  markets: BookmakerMarket[];
}

export interface OddsSnapshot {
  matchId: string;
  source: "the-odds-api" | "cached-demo";
  stale: boolean;
  capturedAt: string;
  bookmakers: BookmakerOdds[];
}

export interface FairProbability {
  outcome: string;
  decimalOdds: number;
  impliedProbability: number;
  fairProbability: number;
  bookmaker: string;
}

export interface ScoreProbability {
  home: number;
  away: number;
  probability: number;
}

export interface PredictionSnapshot {
  matchId: string;
  modelVersion: string;
  generatedAt: string;
  homeWinProbability: number;
  drawProbability: number;
  awayWinProbability: number;
  over25Probability: number;
  under25Probability: number;
  bttsProbability: number;
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  mostLikelyScore: string;
  scoreDistribution: ScoreProbability[];
  confidence: number;
  topFactors: string[];
}

export interface BetTicket {
  id: string;
  matchId: string;
  placedAt: string;
  market: Market;
  selection: string;
  bookmaker: string;
  decimalOdds: number;
  stake: number;
  fairProbability: number;
  modelProbability: number;
  edge: number;
  clv: number;
  status: BetStatus;
  payout: number;
  profit: number;
}

export interface PerformancePoint {
  date: string;
  bankroll: number;
  profit: number;
}

export interface PerformanceSummary {
  startingBankroll: number;
  currentBankroll: number;
  totalStaked: number;
  totalProfit: number;
  roi: number;
  hitRate: number;
  openBets: number;
  settledBets: number;
  maxDrawdown: number;
  brierScore: number;
  logLoss: number;
  averageClv: number;
  equityCurve: PerformancePoint[];
}

export interface TournamentTeamProjection {
  team: Team;
  groupWin: number;
  qualify: number;
  roundOf16: number;
  quarterFinal: number;
  semiFinal: number;
  final: number;
  champion: number;
}

export interface HistoricalMatchSample {
  id: string;
  playedAt: string;
  homeTeam: string;
  awayTeam: string;
  neutralSite: boolean;
  eloDiff: number;
  rankDiff: number;
  formDiff: number;
  restDiff: number;
  marketHomeProbability: number;
  marketDrawProbability: number;
  marketAwayProbability: number;
  homeGoals: number;
  awayGoals: number;
}

export interface FeatureWeight {
  feature: string;
  homeWeight: number;
  drawWeight: number;
  awayWeight: number;
  importance: number;
}

export interface BacktestBucket {
  label: string;
  predicted: number;
  observed: number;
  matches: number;
}

export interface BacktestReport {
  modelVersion: string;
  trainedMatches: number;
  testedMatches: number;
  trainingWindow: string;
  generatedAt: string;
  accuracy: number;
  brierScore: number;
  logLoss: number;
  calibrationSlope: number;
  calibrationIntercept: number;
  featureWeights: FeatureWeight[];
  calibrationBuckets: BacktestBucket[];
  notes: string[];
}

export interface DashboardData {
  matches: Match[];
  odds: OddsSnapshot[];
  predictions: PredictionSnapshot[];
  bets: BetTicket[];
  performance: PerformanceSummary;
  tournament: TournamentTeamProjection[];
  backtest: BacktestReport;
  lastRefresh: string;
}
