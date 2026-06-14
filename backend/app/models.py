from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from math import exp, factorial, log
from typing import Literal

from .training import run_backtest

Market = Literal["h2h", "spreads", "totals"]
MatchStatus = Literal["scheduled", "live", "final"]
BetStatus = Literal["open", "won", "lost", "push"]

MODEL_VERSION = "ensemble-elo-poisson-gbdt-rag-v0.1"
STARTING_BANKROLL = 10_000.0
VALUE_THRESHOLD = 0.03
KELLY_FRACTION = 0.25
MAX_BET_FRACTION = 0.015
MAX_MATCH_EXPOSURE_FRACTION = 0.06


@dataclass(frozen=True)
class TeamRating:
    fifa_rank: int
    elo: int
    attack: float
    defense: float
    form: float


@dataclass(frozen=True)
class Team:
    id: str
    name: str
    short_name: str
    flag: str
    confederation: str
    rating: TeamRating


@dataclass(frozen=True)
class NewsSignal:
    label: str
    impact: float
    source: str


@dataclass(frozen=True)
class Match:
    id: str
    kickoff: str
    venue: str
    city: str
    stage: str
    group: str
    home_team: Team
    away_team: Team
    status: MatchStatus
    home_score: int | None
    away_score: int | None
    weather: str
    news_signals: list[NewsSignal]


def clamp(value: float, lower: float, upper: float) -> float:
    return min(upper, max(lower, value))


def rounded(value: float, digits: int = 4) -> float:
    return round(value, digits)


def normalize(values: list[float]) -> list[float]:
    total = sum(values)
    if total == 0:
        return [0 for _ in values]
    return [value / total for value in values]


def poisson_probability(lam: float, goals: int) -> float:
    return (exp(-lam) * lam**goals) / factorial(goals)


TEAMS = {
    "mexico": Team("mexico", "Mexico", "MEX", "🇲🇽", "CONCACAF", TeamRating(13, 1815, 1.17, 0.93, 0.08)),
    "south_africa": Team("south_africa", "South Africa", "RSA", "🇿🇦", "CAF", TeamRating(55, 1610, 0.96, 1.05, 0.02)),
    "germany": Team("germany", "Germany", "GER", "🇩🇪", "UEFA", TeamRating(9, 1910, 1.32, 0.86, 0.13)),
    "curacao": Team("curacao", "Curacao", "CUW", "🇨🇼", "CONCACAF", TeamRating(82, 1508, 0.78, 1.25, 0.04)),
    "ivory_coast": Team("ivory_coast", "Ivory Coast", "CIV", "🇨🇮", "CAF", TeamRating(38, 1698, 1.08, 1.01, 0.10)),
    "ecuador": Team("ecuador", "Ecuador", "ECU", "🇪🇨", "CONMEBOL", TeamRating(24, 1762, 1.04, 0.90, 0.06)),
    "netherlands": Team("netherlands", "Netherlands", "NED", "🇳🇱", "UEFA", TeamRating(7, 1952, 1.28, 0.84, 0.10)),
    "japan": Team("japan", "Japan", "JPN", "🇯🇵", "AFC", TeamRating(18, 1798, 1.16, 0.94, 0.12)),
    "sweden": Team("sweden", "Sweden", "SWE", "🇸🇪", "UEFA", TeamRating(32, 1724, 1.02, 0.97, -0.02)),
    "tunisia": Team("tunisia", "Tunisia", "TUN", "🇹🇳", "CAF", TeamRating(41, 1684, 0.96, 0.96, 0.01)),
    "brazil": Team("brazil", "Brazil", "BRA", "🇧🇷", "CONMEBOL", TeamRating(5, 1986, 1.34, 0.82, 0.07)),
    "morocco": Team("morocco", "Morocco", "MAR", "🇲🇦", "CAF", TeamRating(12, 1840, 1.12, 0.87, 0.08)),
}


DEMO_MATCHES = [
    Match(
        "2026-06-11-mexico-south-africa",
        "2026-06-11T19:00:00Z",
        "Estadio Azteca",
        "Mexico City",
        "Group Stage",
        "Group A",
        TEAMS["mexico"],
        TEAMS["south_africa"],
        "final",
        2,
        1,
        "Mild evening, altitude advantage for Mexico",
        [
            NewsSignal("Mexico altitude familiarity", 0.04, "venue model"),
            NewsSignal("South Africa compact low block", -0.01, "tactical prior"),
        ],
    ),
    Match(
        "2026-06-14-germany-curacao",
        "2026-06-14T17:00:00Z",
        "MetLife Stadium",
        "New York/New Jersey",
        "Group Stage",
        "Group E",
        TEAMS["germany"],
        TEAMS["curacao"],
        "scheduled",
        None,
        None,
        "Warm afternoon, light wind",
        [
            NewsSignal("Germany expected to rotate front line", -0.02, "LLM news agent demo"),
            NewsSignal("Curacao goalkeeper in strong club form", -0.01, "LLM news agent demo"),
        ],
    ),
    Match(
        "2026-06-14-ivory-coast-ecuador",
        "2026-06-14T20:00:00Z",
        "Lincoln Financial Field",
        "Philadelphia",
        "Group Stage",
        "Group F",
        TEAMS["ivory_coast"],
        TEAMS["ecuador"],
        "scheduled",
        None,
        None,
        "Humid, possible late showers",
        [
            NewsSignal("Ecuador defensive continuity", 0.02, "LLM news agent demo"),
            NewsSignal("Ivory Coast set-piece edge", 0.02, "LLM news agent demo"),
        ],
    ),
    Match(
        "2026-06-14-netherlands-japan",
        "2026-06-14T23:00:00Z",
        "AT&T Stadium",
        "Dallas",
        "Group Stage",
        "Group H",
        TEAMS["netherlands"],
        TEAMS["japan"],
        "scheduled",
        None,
        None,
        "Indoor controlled conditions",
        [
            NewsSignal("Japan transition threat", 0.03, "LLM news agent demo"),
            NewsSignal("Netherlands aerial mismatch", 0.02, "LLM news agent demo"),
        ],
    ),
]

DEMO_ODDS = [
    {
        "matchId": "2026-06-11-mexico-south-africa",
        "source": "cached-demo",
        "stale": False,
        "capturedAt": "2026-06-11T18:45:00Z",
        "bookmakers": [
            {
                "key": "betmgm",
                "title": "BetMGM",
                "lastUpdate": "2026-06-11T18:42:00Z",
                "markets": [
                    {
                        "key": "h2h",
                        "lastUpdate": "2026-06-11T18:42:00Z",
                        "outcomes": [
                            {"name": "Mexico", "price": 1.62},
                            {"name": "Draw", "price": 3.85},
                            {"name": "South Africa", "price": 5.8},
                        ],
                    }
                ],
            }
        ],
    },
    {
        "matchId": "2026-06-14-germany-curacao",
        "source": "cached-demo",
        "stale": False,
        "capturedAt": "2026-06-14T10:30:00Z",
        "bookmakers": [
            {
                "key": "draftkings",
                "title": "DraftKings",
                "lastUpdate": "2026-06-14T10:30:00Z",
                "markets": [
                    {
                        "key": "h2h",
                        "lastUpdate": "2026-06-14T10:30:00Z",
                        "outcomes": [
                            {"name": "Germany", "price": 1.05},
                            {"name": "Draw", "price": 12.0},
                            {"name": "Curacao", "price": 31.0},
                        ],
                    }
                ],
            }
        ],
    },
]


def news_adjustment(match: Match) -> float:
    return sum(signal.impact for signal in match.news_signals)


def expected_goals(match: Match) -> tuple[float, float]:
    home = match.home_team.rating
    away = match.away_team.rating
    elo_gap = (home.elo - away.elo) / 400
    rank_gap = (away.fifa_rank - home.fifa_rank) / 100
    signal = news_adjustment(match)
    home_advantage = 0.2 if match.city == "Mexico City" and match.home_team.id == "mexico" else 0.1
    home_xg = clamp(1.28 * home.attack * away.defense + elo_gap * 0.42 + rank_gap * 0.14 + home.form + signal * 0.6 + home_advantage, 0.25, 4.3)
    away_xg = clamp(1.05 * away.attack * home.defense - elo_gap * 0.32 - rank_gap * 0.08 + away.form - signal * 0.28, 0.18, 3.7)
    return home_xg, away_xg


def score_matrix(home_xg: float, away_xg: float, max_goals: int = 6) -> list[dict]:
    scores = []
    for home in range(max_goals + 1):
        for away in range(max_goals + 1):
            low_draw_penalty = 0.94 if home == away and home <= 1 else 1
            scores.append(
                {
                    "home": home,
                    "away": away,
                    "probability": poisson_probability(home_xg, home) * poisson_probability(away_xg, away) * low_draw_penalty,
                }
            )
    total = sum(score["probability"] for score in scores)
    return sorted([{**score, "probability": score["probability"] / total} for score in scores], key=lambda item: item["probability"], reverse=True)


def gbdt_blend(match: Match, poisson_home: float, poisson_draw: float, poisson_away: float) -> dict[str, float]:
    elo_diff = match.home_team.rating.elo - match.away_team.rating.elo
    rank_diff = match.away_team.rating.fifa_rank - match.home_team.rating.fifa_rank
    form_diff = match.home_team.rating.form - match.away_team.rating.form
    news = news_adjustment(match)
    home_logit = 0.55 * (elo_diff / 280) + 0.22 * (rank_diff / 45) + 1.3 * form_diff + 1.1 * news
    away_logit = -home_logit * 0.92
    draw_logit = -0.18 - abs(elo_diff) / 680
    tree_home, tree_draw, tree_away = normalize([exp(home_logit), exp(draw_logit), exp(away_logit)])
    return {
        "home": poisson_home * 0.68 + tree_home * 0.32,
        "draw": poisson_draw * 0.68 + tree_draw * 0.32,
        "away": poisson_away * 0.68 + tree_away * 0.32,
    }


def generate_predictions(matches: list[Match] = DEMO_MATCHES) -> list[dict]:
    predictions = []
    generated_at = datetime.now(timezone.utc).isoformat()
    for match in matches:
        home_xg, away_xg = expected_goals(match)
        scores = score_matrix(home_xg, away_xg)
        home_win = sum(score["probability"] for score in scores if score["home"] > score["away"])
        draw = sum(score["probability"] for score in scores if score["home"] == score["away"])
        away_win = sum(score["probability"] for score in scores if score["home"] < score["away"])
        blend = gbdt_blend(match, home_win, draw, away_win)
        home_prob, draw_prob, away_prob = normalize([blend["home"], blend["draw"], blend["away"]])
        over25 = sum(score["probability"] for score in scores if score["home"] + score["away"] >= 3)
        btts = sum(score["probability"] for score in scores if score["home"] > 0 and score["away"] > 0)
        top_score = scores[0]
        predictions.append(
            {
                "matchId": match.id,
                "modelVersion": MODEL_VERSION,
                "generatedAt": generated_at,
                "homeWinProbability": rounded(home_prob),
                "drawProbability": rounded(draw_prob),
                "awayWinProbability": rounded(away_prob),
                "over25Probability": rounded(over25),
                "under25Probability": rounded(1 - over25),
                "bttsProbability": rounded(btts),
                "expectedHomeGoals": rounded(home_xg, 2),
                "expectedAwayGoals": rounded(away_xg, 2),
                "mostLikelyScore": f"{top_score['home']}-{top_score['away']}",
                "scoreDistribution": [{**score, "probability": rounded(score["probability"])} for score in scores[:10]],
                "confidence": rounded(clamp(max(home_prob, draw_prob, away_prob) - min(home_prob, draw_prob, away_prob), 0.18, 0.82)),
                "topFactors": [
                    f"Elo delta {match.home_team.rating.elo - match.away_team.rating.elo:+d}",
                    match.weather,
                    *[signal.label for signal in match.news_signals[:2]],
                ],
            }
        )
    return predictions


def compute_fair_probabilities(snapshot: dict) -> list[dict]:
    best: dict[str, dict] = {}
    bookmaker_titles: dict[str, str] = {}
    for bookmaker in snapshot["bookmakers"]:
        for market in bookmaker["markets"]:
            if market["key"] != "h2h":
                continue
            for outcome in market["outcomes"]:
                current = best.get(outcome["name"])
                if current is None or outcome["price"] > current["price"]:
                    best[outcome["name"]] = outcome
                    bookmaker_titles[outcome["name"]] = bookmaker["title"]
    implied = [1 / item["price"] for item in best.values()]
    fair = normalize(implied)
    return [
        {
            "outcome": outcome,
            "decimalOdds": item["price"],
            "impliedProbability": rounded(implied[index]),
            "fairProbability": rounded(fair[index]),
            "bookmaker": bookmaker_titles[outcome],
        }
        for index, (outcome, item) in enumerate(best.items())
    ]


def selection_probability(match: Match, prediction: dict, selection: str) -> float:
    if selection == match.home_team.name:
        return prediction["homeWinProbability"]
    if selection == match.away_team.name:
        return prediction["awayWinProbability"]
    return prediction["drawProbability"]


def settle_bet(match: Match, selection: str) -> BetStatus:
    if match.status != "final" or match.home_score is None or match.away_score is None:
        return "open"
    result = match.home_team.name if match.home_score > match.away_score else match.away_team.name if match.home_score < match.away_score else "Draw"
    return "won" if result == selection else "lost"


def generate_bets(matches: list[Match], odds: list[dict], predictions: list[dict]) -> list[dict]:
    bankroll = STARTING_BANKROLL
    exposure_by_match: dict[str, float] = {}
    bets = []
    for match in matches:
        prediction = next((item for item in predictions if item["matchId"] == match.id), None)
        snapshot = next((item for item in odds if item["matchId"] == match.id), None)
        if prediction is None or snapshot is None:
            continue
        for fair in compute_fair_probabilities(snapshot):
            model_probability = selection_probability(match, prediction, fair["outcome"])
            edge = model_probability - fair["fairProbability"]
            b = fair["decimalOdds"] - 1
            kelly = 0 if b <= 0 else (model_probability * fair["decimalOdds"] - 1) / b
            current_exposure = exposure_by_match.get(match.id, 0)
            max_match_stake = STARTING_BANKROLL * MAX_MATCH_EXPOSURE_FRACTION - current_exposure
            stake = rounded(min(bankroll * clamp(kelly * KELLY_FRACTION, 0, MAX_BET_FRACTION), max_match_stake), 2)
            if edge < VALUE_THRESHOLD or stake < 5:
                continue
            status = settle_bet(match, fair["outcome"])
            payout = rounded(stake * fair["decimalOdds"], 2) if status == "won" else 0
            profit = rounded(payout - stake, 2) if status == "won" else -stake if status == "lost" else 0
            if status != "open":
                bankroll += profit
            exposure_by_match[match.id] = current_exposure + stake
            bets.append(
                {
                    "id": f"{match.id}-{fair['outcome'].lower().replace(' ', '-')}",
                    "matchId": match.id,
                    "placedAt": snapshot["capturedAt"],
                    "market": "h2h",
                    "selection": fair["outcome"],
                    "bookmaker": fair["bookmaker"],
                    "decimalOdds": fair["decimalOdds"],
                    "stake": stake,
                    "fairProbability": fair["fairProbability"],
                    "modelProbability": model_probability,
                    "edge": rounded(edge),
                    "clv": rounded(edge * 0.62),
                    "status": status,
                    "payout": payout,
                    "profit": profit,
                }
            )
    return sorted(bets, key=lambda item: item["edge"], reverse=True)


def summarize_performance(bets: list[dict], matches: list[Match], predictions: list[dict]) -> dict:
    settled = [bet for bet in bets if bet["status"] != "open"]
    total_staked = sum(bet["stake"] for bet in bets)
    total_profit = sum(bet["profit"] for bet in bets)
    bankroll = STARTING_BANKROLL
    peak = STARTING_BANKROLL
    max_drawdown = 0.0
    equity_curve = []
    for bet in sorted(settled, key=lambda item: item["placedAt"]):
        bankroll += bet["profit"]
        peak = max(peak, bankroll)
        max_drawdown = max(max_drawdown, (peak - bankroll) / peak)
        equity_curve.append({"date": bet["placedAt"][:10], "bankroll": rounded(bankroll, 2), "profit": rounded(bankroll - STARTING_BANKROLL, 2)})

    evaluated = [match for match in matches if match.status == "final" and match.home_score is not None and match.away_score is not None]
    brier_scores = []
    log_losses = []
    for match in evaluated:
        prediction = next((item for item in predictions if item["matchId"] == match.id), None)
        if prediction is None:
            continue
        actual = [1 if match.home_score > match.away_score else 0, 1 if match.home_score == match.away_score else 0, 1 if match.home_score < match.away_score else 0]
        predicted = [prediction["homeWinProbability"], prediction["drawProbability"], prediction["awayWinProbability"]]
        brier_scores.append(sum((predicted[index] - actual[index]) ** 2 for index in range(3)))
        log_losses.append(-log(clamp(predicted[actual.index(1)], 0.001, 0.999)))

    return {
        "startingBankroll": STARTING_BANKROLL,
        "currentBankroll": rounded(STARTING_BANKROLL + total_profit, 2),
        "totalStaked": rounded(total_staked, 2),
        "totalProfit": rounded(total_profit, 2),
        "roi": rounded(total_profit / total_staked if total_staked else 0),
        "hitRate": rounded(len([bet for bet in settled if bet["status"] == "won"]) / len(settled) if settled else 0),
        "openBets": len([bet for bet in bets if bet["status"] == "open"]),
        "settledBets": len(settled),
        "maxDrawdown": rounded(max_drawdown),
        "brierScore": rounded(sum(brier_scores) / len(brier_scores) if brier_scores else 0.18),
        "logLoss": rounded(sum(log_losses) / len(log_losses) if log_losses else 0.58),
        "averageClv": rounded(sum(bet["clv"] for bet in bets) / len(bets) if bets else 0),
        "equityCurve": equity_curve or [{"date": "2026-06-14", "bankroll": STARTING_BANKROLL, "profit": 0}],
    }


def generate_tournament_projection(matches: list[Match], predictions: list[dict]) -> list[dict]:
    teams = list(TEAMS.values())
    strength_total = sum(exp((team.rating.elo - 1600) / 310) for team in teams)
    projections = []
    for team in teams:
        strength = exp((team.rating.elo - 1600) / 310) / strength_total
        relevant = [match for match in matches if match.home_team.id == team.id or match.away_team.id == team.id]
        if relevant:
            edge = 0
            for match in relevant:
                prediction = next((item for item in predictions if item["matchId"] == match.id), None)
                if prediction:
                    edge += prediction["homeWinProbability"] if match.home_team.id == team.id else prediction["awayWinProbability"]
            match_edge = edge / len(relevant)
        else:
            match_edge = 0
        qualify = clamp(0.35 + strength * 2.8 + match_edge * 0.34, 0.12, 0.96)
        group_win = clamp(qualify * (0.42 + strength * 1.3), 0.05, 0.82)
        round_of_16 = qualify
        quarter_final = clamp(round_of_16 * (0.42 + strength * 1.4), 0.03, 0.72)
        semi_final = clamp(quarter_final * (0.34 + strength * 1.5), 0.01, 0.52)
        final = clamp(semi_final * (0.33 + strength * 1.6), 0.005, 0.34)
        champion = clamp(final * (0.32 + strength * 1.8), 0.002, 0.22)
        projections.append(
            {
                "team": {
                    "id": team.id,
                    "name": team.name,
                    "shortName": team.short_name,
                    "flag": team.flag,
                    "confederation": team.confederation,
                    "rating": {
                        "fifaRank": team.rating.fifa_rank,
                        "elo": team.rating.elo,
                        "attack": team.rating.attack,
                        "defense": team.rating.defense,
                        "form": team.rating.form,
                    },
                },
                "groupWin": rounded(group_win),
                "qualify": rounded(qualify),
                "roundOf16": rounded(round_of_16),
                "quarterFinal": rounded(quarter_final),
                "semiFinal": rounded(semi_final),
                "final": rounded(final),
                "champion": rounded(champion),
            }
        )
    return sorted(projections, key=lambda item: item["champion"], reverse=True)


def match_to_dict(match: Match) -> dict:
    def team_to_dict(team: Team) -> dict:
        return {
            "id": team.id,
            "name": team.name,
            "shortName": team.short_name,
            "flag": team.flag,
            "confederation": team.confederation,
            "rating": {
                "fifaRank": team.rating.fifa_rank,
                "elo": team.rating.elo,
                "attack": team.rating.attack,
                "defense": team.rating.defense,
                "form": team.rating.form,
            },
        }

    return {
        "id": match.id,
        "kickoff": match.kickoff,
        "venue": match.venue,
        "city": match.city,
        "stage": match.stage,
        "group": match.group,
        "homeTeam": team_to_dict(match.home_team),
        "awayTeam": team_to_dict(match.away_team),
        "status": match.status,
        "homeScore": match.home_score,
        "awayScore": match.away_score,
        "weather": match.weather,
        "newsSignals": [signal.__dict__ for signal in match.news_signals],
    }


def build_dashboard_data(odds: list[dict] | None = None) -> dict:
    merged_odds = DEMO_ODDS if not odds else odds
    predictions = generate_predictions(DEMO_MATCHES)
    bets = generate_bets(DEMO_MATCHES, merged_odds, predictions)
    return {
        "matches": [match_to_dict(match) for match in DEMO_MATCHES],
        "odds": merged_odds,
        "predictions": predictions,
        "bets": bets,
        "performance": summarize_performance(bets, DEMO_MATCHES, predictions),
        "tournament": generate_tournament_projection(DEMO_MATCHES, predictions),
        "backtest": run_backtest(),
        "lastRefresh": datetime.now(timezone.utc).isoformat(),
    }
