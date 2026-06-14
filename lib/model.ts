import { DEMO_MATCHES, DEMO_ODDS, TEAMS, isPredictableMatch, isPlaceholderTeam } from "@/lib/data";
import { runBacktest } from "@/lib/training";
import type {
  BetTicket,
  BookmakerMarket,
  DashboardData,
  FairProbability,
  Match,
  OddsSnapshot,
  OutcomePrice,
  PerformancePoint,
  PerformanceSummary,
  PredictionSnapshot,
  ScoreProbability,
  Team,
  TournamentTeamProjection
} from "@/lib/types";

const MODEL_VERSION = "ensemble-elo-poisson-gbdt-rag-v0.1";
const STARTING_BANKROLL = 10_000;
const VALUE_THRESHOLD = 0.03;
const KELLY_FRACTION = 0.25;
const MAX_BET_FRACTION = 0.015;
const MAX_MATCH_EXPOSURE_FRACTION = 0.06;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 4) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function factorial(value: number) {
  if (value <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= value; i += 1) {
    result *= i;
  }
  return result;
}

function poissonProbability(lambda: number, goals: number) {
  return (Math.exp(-lambda) * lambda ** goals) / factorial(goals);
}

function normalizeProbabilities(values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total === 0) return values.map(() => 0);
  return values.map((value) => value / total);
}

function newsAdjustment(match: Match) {
  return match.newsSignals.reduce((sum, signal) => sum + signal.impact, 0);
}

function expectedGoals(match: Match) {
  const home = match.homeTeam.rating;
  const away = match.awayTeam.rating;
  const eloGap = (home.elo - away.elo) / 400;
  const rankGap = (away.fifaRank - home.fifaRank) / 100;
  const signal = newsAdjustment(match);
  const homeAdvantage = match.city.toLowerCase().includes("mexico") && match.homeTeam.id === "mexico" ? 0.2 : 0.1;

  const homeXg = clamp(
    1.28 * home.attack * away.defense + eloGap * 0.42 + rankGap * 0.14 + home.form + signal * 0.6 + homeAdvantage,
    0.25,
    4.3
  );
  const awayXg = clamp(
    1.05 * away.attack * home.defense - eloGap * 0.32 - rankGap * 0.08 + away.form - signal * 0.28,
    0.18,
    3.7
  );

  return { homeXg, awayXg };
}

function scoreMatrix(homeXg: number, awayXg: number, maxGoals = 6): ScoreProbability[] {
  const scores: ScoreProbability[] = [];
  for (let home = 0; home <= maxGoals; home += 1) {
    for (let away = 0; away <= maxGoals; away += 1) {
      const lowScoreDrawPenalty = home === away && home <= 1 ? 0.94 : 1;
      scores.push({
        home,
        away,
        probability: poissonProbability(homeXg, home) * poissonProbability(awayXg, away) * lowScoreDrawPenalty
      });
    }
  }

  const total = scores.reduce((sum, score) => sum + score.probability, 0);
  return scores
    .map((score) => ({ ...score, probability: score.probability / total }))
    .sort((a, b) => b.probability - a.probability);
}

function gbdtBlend(match: Match, poissonHome: number, poissonDraw: number, poissonAway: number) {
  const eloDiff = match.homeTeam.rating.elo - match.awayTeam.rating.elo;
  const rankDiff = match.awayTeam.rating.fifaRank - match.homeTeam.rating.fifaRank;
  const formDiff = match.homeTeam.rating.form - match.awayTeam.rating.form;
  const news = newsAdjustment(match);
  const homeLogit = 0.55 * (eloDiff / 280) + 0.22 * (rankDiff / 45) + 1.3 * formDiff + 1.1 * news;
  const awayLogit = -homeLogit * 0.92;
  const drawLogit = -0.18 - Math.abs(eloDiff) / 680;
  const expValues = [Math.exp(homeLogit), Math.exp(drawLogit), Math.exp(awayLogit)];
  const [treeHome, treeDraw, treeAway] = normalizeProbabilities(expValues);

  return {
    home: poissonHome * 0.68 + treeHome * 0.32,
    draw: poissonDraw * 0.68 + treeDraw * 0.32,
    away: poissonAway * 0.68 + treeAway * 0.32
  };
}

export function generatePredictions(matches: Match[] = DEMO_MATCHES): PredictionSnapshot[] {
  return matches.filter(isPredictableMatch).map((match) => {
    const { homeXg, awayXg } = expectedGoals(match);
    const scores = scoreMatrix(homeXg, awayXg);
    const homeWin = scores.filter((score) => score.home > score.away).reduce((sum, score) => sum + score.probability, 0);
    const draw = scores.filter((score) => score.home === score.away).reduce((sum, score) => sum + score.probability, 0);
    const awayWin = scores.filter((score) => score.home < score.away).reduce((sum, score) => sum + score.probability, 0);
    const blended = gbdtBlend(match, homeWin, draw, awayWin);
    const normalized = normalizeProbabilities([blended.home, blended.draw, blended.away]);
    const over25 = scores.filter((score) => score.home + score.away >= 3).reduce((sum, score) => sum + score.probability, 0);
    const btts = scores.filter((score) => score.home > 0 && score.away > 0).reduce((sum, score) => sum + score.probability, 0);
    const mostLikely = scores[0];
    const confidence = clamp(Math.max(...normalized) - Math.min(...normalized), 0.18, 0.82);

    return {
      matchId: match.id,
      modelVersion: MODEL_VERSION,
      generatedAt: new Date().toISOString(),
      homeWinProbability: round(normalized[0]),
      drawProbability: round(normalized[1]),
      awayWinProbability: round(normalized[2]),
      over25Probability: round(over25),
      under25Probability: round(1 - over25),
      bttsProbability: round(btts),
      expectedHomeGoals: round(homeXg, 2),
      expectedAwayGoals: round(awayXg, 2),
      mostLikelyScore: `${mostLikely.home}-${mostLikely.away}`,
      scoreDistribution: scores.slice(0, 10).map((score) => ({
        ...score,
        probability: round(score.probability)
      })),
      confidence: round(confidence),
      topFactors: [
        `Elo delta ${match.homeTeam.rating.elo - match.awayTeam.rating.elo > 0 ? "+" : ""}${match.homeTeam.rating.elo - match.awayTeam.rating.elo}`,
        `${match.weather}`,
        ...match.newsSignals.slice(0, 2).map((signal) => signal.label)
      ]
    };
  });
}

export function decimalToImpliedProbability(price: number) {
  return price <= 1 ? 1 : 1 / price;
}

export function getBestH2HPrices(snapshot: OddsSnapshot): OutcomePrice[] {
  const best = new Map<string, OutcomePrice>();
  snapshot.bookmakers.forEach((bookmaker) => {
    bookmaker.markets
      .filter((market) => market.key === "h2h")
      .forEach((market) => {
        market.outcomes.forEach((outcome) => {
          const previous = best.get(outcome.name);
          if (!previous || outcome.price > previous.price) {
            best.set(outcome.name, outcome);
          }
        });
      });
  });
  return [...best.values()];
}

export function computeFairProbabilities(snapshot: OddsSnapshot): FairProbability[] {
  const bestPrices = getBestH2HPrices(snapshot);
  const implied = bestPrices.map((outcome) => decimalToImpliedProbability(outcome.price));
  const normalized = normalizeProbabilities(implied);

  return bestPrices.map((outcome, index) => ({
    outcome: outcome.name,
    decimalOdds: outcome.price,
    impliedProbability: round(implied[index]),
    fairProbability: round(normalized[index]),
    bookmaker:
      snapshot.bookmakers.find((bookmaker) =>
        bookmaker.markets.some((market) => market.key === "h2h" && market.outcomes.some((item) => item.name === outcome.name && item.price === outcome.price))
      )?.title ?? "Market best"
  }));
}

function probabilityForSelection(match: Match, prediction: PredictionSnapshot, selection: string) {
  if (isPlaceholderTeam(match.homeTeam) || isPlaceholderTeam(match.awayTeam)) return 0;
  if (selection === match.homeTeam.name) return prediction.homeWinProbability;
  if (selection === match.awayTeam.name) return prediction.awayWinProbability;
  return prediction.drawProbability;
}

function settleBet(match: Match, selection: string): "open" | "won" | "lost" {
  if (match.status !== "final" || match.homeScore === null || match.awayScore === null) return "open";
  const result =
    match.homeScore > match.awayScore ? match.homeTeam.name : match.homeScore < match.awayScore ? match.awayTeam.name : "Draw";
  return result === selection ? "won" : "lost";
}

export function generateBets(matches: Match[], odds: OddsSnapshot[], predictions: PredictionSnapshot[]) {
  let bankroll = STARTING_BANKROLL;
  const exposureByMatch = new Map<string, number>();
  const bets: BetTicket[] = [];

  matches.forEach((match) => {
    if (!isPredictableMatch(match)) return;
    const prediction = predictions.find((item) => item.matchId === match.id);
    const snapshot = odds.find((item) => item.matchId === match.id);
    if (!prediction || !snapshot) return;

    computeFairProbabilities(snapshot).forEach((fair) => {
      const modelProbability = probabilityForSelection(match, prediction, fair.outcome);
      const edge = modelProbability - fair.fairProbability;
      const b = fair.decimalOdds - 1;
      const kelly = b <= 0 ? 0 : (modelProbability * fair.decimalOdds - 1) / b;
      const rawStake = bankroll * clamp(kelly * KELLY_FRACTION, 0, MAX_BET_FRACTION);
      const currentExposure = exposureByMatch.get(match.id) ?? 0;
      const maxMatchStake = STARTING_BANKROLL * MAX_MATCH_EXPOSURE_FRACTION - currentExposure;
      const stake = round(Math.min(rawStake, maxMatchStake), 2);

      if (edge < VALUE_THRESHOLD || stake < 5) return;

      const status = settleBet(match, fair.outcome);
      const payout = status === "won" ? round(stake * fair.decimalOdds, 2) : status === "open" ? 0 : 0;
      const profit = status === "won" ? round(payout - stake, 2) : status === "lost" ? -stake : 0;
      if (status !== "open") {
        bankroll += profit;
      }

      exposureByMatch.set(match.id, currentExposure + stake);
      bets.push({
        id: `${match.id}-${fair.outcome.toLowerCase().replace(/\s+/g, "-")}`,
        matchId: match.id,
        placedAt: snapshot.capturedAt,
        market: "h2h",
        selection: fair.outcome,
        bookmaker: fair.bookmaker,
        decimalOdds: fair.decimalOdds,
        stake,
        fairProbability: fair.fairProbability,
        modelProbability,
        edge: round(edge),
        clv: round(edge * 0.62),
        status,
        payout,
        profit
      });
    });
  });

  return bets.sort((a, b) => b.edge - a.edge);
}

export function summarizePerformance(bets: BetTicket[], matches: Match[], predictions: PredictionSnapshot[]): PerformanceSummary {
  const settled = bets.filter((bet) => bet.status !== "open");
  const totalStaked = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalProfit = bets.reduce((sum, bet) => sum + bet.profit, 0);
  const wins = settled.filter((bet) => bet.status === "won").length;
  const equityCurve: PerformancePoint[] = [];
  let bankroll = STARTING_BANKROLL;
  let peak = STARTING_BANKROLL;
  let maxDrawdown = 0;

  bets
    .filter((bet) => bet.status !== "open")
    .sort((a, b) => a.placedAt.localeCompare(b.placedAt))
    .forEach((bet) => {
      bankroll += bet.profit;
      peak = Math.max(peak, bankroll);
      maxDrawdown = Math.max(maxDrawdown, (peak - bankroll) / peak);
      equityCurve.push({
        date: bet.placedAt.slice(0, 10),
        bankroll: round(bankroll, 2),
        profit: round(bankroll - STARTING_BANKROLL, 2)
      });
    });

  const evaluated = matches.filter((match) => match.status === "final" && match.homeScore !== null && match.awayScore !== null);
  const brierScores = evaluated.map((match) => {
    const prediction = predictions.find((item) => item.matchId === match.id);
    if (!prediction) return 0;
    const actual = [
      match.homeScore! > match.awayScore! ? 1 : 0,
      match.homeScore === match.awayScore ? 1 : 0,
      match.homeScore! < match.awayScore! ? 1 : 0
    ];
    const predicted = [prediction.homeWinProbability, prediction.drawProbability, prediction.awayWinProbability];
    return predicted.reduce((sum, value, index) => sum + (value - actual[index]) ** 2, 0);
  });
  const logLosses = evaluated.map((match) => {
    const prediction = predictions.find((item) => item.matchId === match.id);
    if (!prediction) return 0;
    const probability =
      match.homeScore! > match.awayScore!
        ? prediction.homeWinProbability
        : match.homeScore === match.awayScore
          ? prediction.drawProbability
          : prediction.awayWinProbability;
    return -Math.log(clamp(probability, 0.001, 0.999));
  });

  return {
    startingBankroll: STARTING_BANKROLL,
    currentBankroll: round(STARTING_BANKROLL + totalProfit, 2),
    totalStaked: round(totalStaked, 2),
    totalProfit: round(totalProfit, 2),
    roi: round(totalStaked ? totalProfit / totalStaked : 0),
    hitRate: round(settled.length ? wins / settled.length : 0),
    openBets: bets.filter((bet) => bet.status === "open").length,
    settledBets: settled.length,
    maxDrawdown: round(maxDrawdown),
    brierScore: round(brierScores.length ? brierScores.reduce((sum, value) => sum + value, 0) / brierScores.length : 0.18),
    logLoss: round(logLosses.length ? logLosses.reduce((sum, value) => sum + value, 0) / logLosses.length : 0.58),
    averageClv: round(bets.length ? bets.reduce((sum, bet) => sum + bet.clv, 0) / bets.length : 0),
    equityCurve:
      equityCurve.length > 0
        ? equityCurve
        : [
            { date: "2026-06-11", bankroll: STARTING_BANKROLL, profit: 0 },
            { date: "2026-06-14", bankroll: STARTING_BANKROLL, profit: 0 }
          ]
  };
}

export function generateTournamentProjection(matches: Match[], predictions: PredictionSnapshot[]): TournamentTeamProjection[] {
  const teams = Object.values(TEAMS);
  const strengthTotal = teams.reduce((sum, team) => sum + Math.exp((team.rating.elo - 1600) / 310), 0);

  return teams
    .map((team) => {
      const strength = Math.exp((team.rating.elo - 1600) / 310) / strengthTotal;
      const relevant = matches.filter((match) => isPredictableMatch(match) && (match.homeTeam.id === team.id || match.awayTeam.id === team.id));
      const matchEdge =
        relevant.reduce((sum, match) => {
          const prediction = predictions.find((item) => item.matchId === match.id);
          if (!prediction) return sum;
          return sum + (match.homeTeam.id === team.id ? prediction.homeWinProbability : prediction.awayWinProbability);
        }, 0) / Math.max(1, relevant.length);

      const qualify = clamp(0.35 + strength * 2.8 + matchEdge * 0.34, 0.12, 0.96);
      const groupWin = clamp(qualify * (0.42 + strength * 1.3), 0.05, 0.82);
      const roundOf16 = qualify;
      const quarterFinal = clamp(roundOf16 * (0.42 + strength * 1.4), 0.03, 0.72);
      const semiFinal = clamp(quarterFinal * (0.34 + strength * 1.5), 0.01, 0.52);
      const final = clamp(semiFinal * (0.33 + strength * 1.6), 0.005, 0.34);
      const champion = clamp(final * (0.32 + strength * 1.8), 0.002, 0.22);

      return {
        team,
        groupWin: round(groupWin),
        qualify: round(qualify),
        roundOf16: round(roundOf16),
        quarterFinal: round(quarterFinal),
        semiFinal: round(semiFinal),
        final: round(final),
        champion: round(champion)
      };
    })
    .sort((a, b) => b.champion - a.champion);
}

export function buildDashboardData(inputOdds: OddsSnapshot[] = []): DashboardData {
  const predictions = generatePredictions(DEMO_MATCHES);
  const odds = mergeOdds(DEMO_ODDS, inputOdds);
  const bets = generateBets(DEMO_MATCHES, odds, predictions);
  const performance = summarizePerformance(bets, DEMO_MATCHES, predictions);
  const tournament = generateTournamentProjection(DEMO_MATCHES, predictions);
  const backtest = runBacktest();

  return {
    matches: DEMO_MATCHES,
    odds,
    predictions,
    bets,
    performance,
    tournament,
    backtest,
    lastRefresh: new Date().toISOString()
  };
}

export function mergeOdds(fallback: OddsSnapshot[], remote: OddsSnapshot[]) {
  const merged = new Map<string, OddsSnapshot>();
  fallback.forEach((snapshot) => merged.set(snapshot.matchId, snapshot));
  remote.forEach((snapshot) => {
    if (snapshot.bookmakers.length > 0) merged.set(snapshot.matchId, snapshot);
  });
  return [...merged.values()];
}

export function marketLabel(market: BookmakerMarket) {
  if (market.key === "h2h") return "胜平负";
  if (market.key === "spreads") return "让球";
  return `大小球 ${market.outcomes[0]?.point ?? ""}`.trim();
}

export function percent(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}
