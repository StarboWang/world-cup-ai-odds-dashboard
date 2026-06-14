from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from math import exp, log

TRAINING_MODEL_VERSION = "trained-multiclass-logit-world-cup-v0.1"
FEATURE_NAMES = ["bias", "eloDiff", "rankDiff", "formDiff", "restDiff", "marketHome", "marketDraw", "marketAway", "neutralSite"]
LEARNING_RATE = 0.035
EPOCHS = 720
L2 = 0.018


@dataclass(frozen=True)
class HistoricalMatchSample:
    id: str
    played_at: str
    home_team: str
    away_team: str
    neutral_site: bool
    elo_diff: float
    rank_diff: float
    form_diff: float
    rest_diff: float
    market_home_probability: float
    market_draw_probability: float
    market_away_probability: float
    home_goals: int
    away_goals: int


HISTORICAL_MATCHES = [
    HistoricalMatchSample("2018-russia-saudi-arabia", "2018-06-14", "Russia", "Saudi Arabia", False, 155, 30, 0.04, 0, 0.58, 0.25, 0.17, 5, 0),
    HistoricalMatchSample("2018-portugal-spain", "2018-06-15", "Portugal", "Spain", True, -85, -6, -0.02, 0, 0.25, 0.29, 0.46, 3, 3),
    HistoricalMatchSample("2018-germany-mexico", "2018-06-17", "Germany", "Mexico", True, 170, 14, 0.02, 0, 0.63, 0.23, 0.14, 0, 1),
    HistoricalMatchSample("2018-brazil-switzerland", "2018-06-17", "Brazil", "Switzerland", True, 205, 4, 0.06, 0, 0.66, 0.22, 0.12, 1, 1),
    HistoricalMatchSample("2018-france-argentina", "2018-06-30", "France", "Argentina", True, 35, -2, 0.03, 1, 0.41, 0.29, 0.30, 4, 3),
    HistoricalMatchSample("2018-belgium-japan", "2018-07-02", "Belgium", "Japan", True, 245, 42, 0.08, 0, 0.69, 0.21, 0.10, 3, 2),
    HistoricalMatchSample("2018-croatia-england", "2018-07-11", "Croatia", "England", True, -40, -8, 0.02, -1, 0.28, 0.30, 0.42, 2, 1),
    HistoricalMatchSample("2018-france-croatia", "2018-07-15", "France", "Croatia", True, 90, 13, 0.05, 1, 0.52, 0.27, 0.21, 4, 2),
    HistoricalMatchSample("2022-qatar-ecuador", "2022-11-20", "Qatar", "Ecuador", False, -120, -24, -0.05, 0, 0.28, 0.31, 0.41, 0, 2),
    HistoricalMatchSample("2022-argentina-saudi-arabia", "2022-11-22", "Argentina", "Saudi Arabia", True, 320, 48, 0.12, 0, 0.78, 0.15, 0.07, 1, 2),
    HistoricalMatchSample("2022-germany-japan", "2022-11-23", "Germany", "Japan", True, 185, 13, 0.03, 0, 0.64, 0.23, 0.13, 1, 2),
    HistoricalMatchSample("2022-spain-germany", "2022-11-27", "Spain", "Germany", True, 15, 4, 0.04, 0, 0.38, 0.28, 0.34, 1, 1),
    HistoricalMatchSample("2022-netherlands-usa", "2022-12-03", "Netherlands", "USA", True, 140, 8, 0.05, 1, 0.55, 0.26, 0.19, 3, 1),
    HistoricalMatchSample("2022-morocco-spain", "2022-12-06", "Morocco", "Spain", True, -160, -15, 0.04, 0, 0.18, 0.30, 0.52, 0, 0),
    HistoricalMatchSample("2022-england-france", "2022-12-10", "England", "France", True, -25, -1, 0.01, 0, 0.34, 0.29, 0.37, 1, 2),
    HistoricalMatchSample("2022-argentina-france", "2022-12-18", "Argentina", "France", True, -20, 1, 0.03, 0, 0.36, 0.29, 0.35, 3, 3),
]


def outcome_index(sample: HistoricalMatchSample) -> int:
    if sample.home_goals > sample.away_goals:
        return 0
    if sample.home_goals == sample.away_goals:
        return 1
    return 2


def features(sample: HistoricalMatchSample) -> list[float]:
    return [
        1,
        sample.elo_diff / 300,
        sample.rank_diff / 50,
        sample.form_diff * 8,
        sample.rest_diff / 3,
        sample.market_home_probability,
        sample.market_draw_probability,
        sample.market_away_probability,
        1 if sample.neutral_site else 0,
    ]


def softmax(logits: list[float]) -> list[float]:
    max_value = max(logits)
    exp_values = [exp(value - max_value) for value in logits]
    total = sum(exp_values)
    return [value / total for value in exp_values]


def train_weights(samples: list[HistoricalMatchSample]) -> list[list[float]]:
    weights = [[0.0 for _ in FEATURE_NAMES] for _ in range(3)]
    for _epoch in range(EPOCHS):
        for sample in samples:
            x = features(sample)
            y = outcome_index(sample)
            probabilities = softmax([sum(weight * x[index] for index, weight in enumerate(row)) for row in weights])
            for class_index, row in enumerate(weights):
                target = 1 if class_index == y else 0
                for feature_index, weight in enumerate(row):
                    regularization = 0 if feature_index == 0 else L2 * weight
                    row[feature_index] = weight - LEARNING_RATE * ((probabilities[class_index] - target) * x[feature_index] + regularization)
    return weights


def predict(sample: HistoricalMatchSample, weights: list[list[float]]) -> list[float]:
    x = features(sample)
    return softmax([sum(weight * x[index] for index, weight in enumerate(row)) for row in weights])


def calibration_buckets(results: list[dict]) -> list[dict]:
    bucket_defs = [
        ("0-40%", 0, 0.4),
        ("40-55%", 0.4, 0.55),
        ("55-70%", 0.55, 0.7),
        ("70%+", 0.7, 1.01),
    ]
    buckets = []
    for label, lower, upper in bucket_defs:
        rows = [item for item in results if lower <= item["confidence"] < upper]
        predicted = sum(item["confidence"] for item in rows) / len(rows) if rows else 0
        observed = sum(1 for item in rows if item["correct"]) / len(rows) if rows else 0
        buckets.append({"label": label, "predicted": round(predicted, 4), "observed": round(observed, 4), "matches": len(rows)})
    return buckets


def calibration_line(results: list[dict]) -> tuple[float, float]:
    if len(results) < 2:
        return 1, 0
    xs = [item["confidence"] for item in results]
    ys = [1 if item["correct"] else 0 for item in results]
    mean_x = sum(xs) / len(xs)
    mean_y = sum(ys) / len(ys)
    denominator = sum((value - mean_x) ** 2 for value in xs)
    slope = 1 if denominator == 0 else sum((value - mean_x) * (ys[index] - mean_y) for index, value in enumerate(xs)) / denominator
    return slope, mean_y - slope * mean_x


def run_backtest(samples: list[HistoricalMatchSample] = HISTORICAL_MATCHES) -> dict:
    split_index = max(10, int(len(samples) * 0.7))
    training = samples[:split_index]
    testing = samples[split_index:]
    weights = train_weights(training)
    outcomes = []
    for sample in testing:
        probabilities = predict(sample, weights)
        y = outcome_index(sample)
        predicted_class = probabilities.index(max(probabilities))
        outcomes.append({"probabilities": probabilities, "y": y, "correct": predicted_class == y, "confidence": probabilities[predicted_class]})

    feature_weights = []
    for index, feature in enumerate(FEATURE_NAMES):
        home_weight = weights[0][index]
        draw_weight = weights[1][index]
        away_weight = weights[2][index]
        feature_weights.append(
            {
                "feature": feature,
                "homeWeight": round(home_weight, 4),
                "drawWeight": round(draw_weight, 4),
                "awayWeight": round(away_weight, 4),
                "importance": round(abs(home_weight) + abs(draw_weight) + abs(away_weight), 4),
            }
        )
    feature_weights.sort(key=lambda item: item["importance"], reverse=True)
    slope, intercept = calibration_line(outcomes)

    return {
        "modelVersion": TRAINING_MODEL_VERSION,
        "trainedMatches": len(training),
        "testedMatches": len(testing),
        "trainingWindow": f"{training[0].played_at} to {training[-1].played_at}",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "accuracy": round(sum(1 for item in outcomes if item["correct"]) / max(1, len(outcomes)), 4),
        "brierScore": round(sum(sum((probability - (1 if index == item["y"] else 0)) ** 2 for index, probability in enumerate(item["probabilities"])) for item in outcomes) / max(1, len(outcomes)), 4),
        "logLoss": round(sum(-log(min(0.999, max(0.001, item["probabilities"][item["y"]]))) for item in outcomes) / max(1, len(outcomes)), 4),
        "calibrationSlope": round(slope, 4),
        "calibrationIntercept": round(intercept, 4),
        "featureWeights": feature_weights,
        "calibrationBuckets": calibration_buckets(outcomes),
        "notes": [
            "训练集使用赛前可获得的 Elo、排名、状态、休息天数和去水市场概率。",
            "测试集按时间切分，避免未来比赛信息泄漏。",
            "生产化时可替换为 XGBoost/LightGBM，并把历史样本扩展到所有国际比赛。",
        ],
    }
