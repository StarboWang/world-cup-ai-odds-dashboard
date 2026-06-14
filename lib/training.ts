import type { BacktestReport, HistoricalMatchSample } from "@/lib/types";

const TRAINING_MODEL_VERSION = "trained-multiclass-logit-world-cup-v0.1";
const LEARNING_RATE = 0.035;
const EPOCHS = 720;
const L2 = 0.018;

type OutcomeIndex = 0 | 1 | 2;

const FEATURE_NAMES = ["bias", "eloDiff", "rankDiff", "formDiff", "restDiff", "marketHome", "marketDraw", "marketAway", "neutralSite"];

export const HISTORICAL_MATCHES: HistoricalMatchSample[] = [
  {
    id: "2018-russia-saudi-arabia",
    playedAt: "2018-06-14",
    homeTeam: "Russia",
    awayTeam: "Saudi Arabia",
    neutralSite: false,
    eloDiff: 155,
    rankDiff: 30,
    formDiff: 0.04,
    restDiff: 0,
    marketHomeProbability: 0.58,
    marketDrawProbability: 0.25,
    marketAwayProbability: 0.17,
    homeGoals: 5,
    awayGoals: 0
  },
  {
    id: "2018-portugal-spain",
    playedAt: "2018-06-15",
    homeTeam: "Portugal",
    awayTeam: "Spain",
    neutralSite: true,
    eloDiff: -85,
    rankDiff: -6,
    formDiff: -0.02,
    restDiff: 0,
    marketHomeProbability: 0.25,
    marketDrawProbability: 0.29,
    marketAwayProbability: 0.46,
    homeGoals: 3,
    awayGoals: 3
  },
  {
    id: "2018-germany-mexico",
    playedAt: "2018-06-17",
    homeTeam: "Germany",
    awayTeam: "Mexico",
    neutralSite: true,
    eloDiff: 170,
    rankDiff: 14,
    formDiff: 0.02,
    restDiff: 0,
    marketHomeProbability: 0.63,
    marketDrawProbability: 0.23,
    marketAwayProbability: 0.14,
    homeGoals: 0,
    awayGoals: 1
  },
  {
    id: "2018-brazil-switzerland",
    playedAt: "2018-06-17",
    homeTeam: "Brazil",
    awayTeam: "Switzerland",
    neutralSite: true,
    eloDiff: 205,
    rankDiff: 4,
    formDiff: 0.06,
    restDiff: 0,
    marketHomeProbability: 0.66,
    marketDrawProbability: 0.22,
    marketAwayProbability: 0.12,
    homeGoals: 1,
    awayGoals: 1
  },
  {
    id: "2018-france-argentina",
    playedAt: "2018-06-30",
    homeTeam: "France",
    awayTeam: "Argentina",
    neutralSite: true,
    eloDiff: 35,
    rankDiff: -2,
    formDiff: 0.03,
    restDiff: 1,
    marketHomeProbability: 0.41,
    marketDrawProbability: 0.29,
    marketAwayProbability: 0.3,
    homeGoals: 4,
    awayGoals: 3
  },
  {
    id: "2018-belgium-japan",
    playedAt: "2018-07-02",
    homeTeam: "Belgium",
    awayTeam: "Japan",
    neutralSite: true,
    eloDiff: 245,
    rankDiff: 42,
    formDiff: 0.08,
    restDiff: 0,
    marketHomeProbability: 0.69,
    marketDrawProbability: 0.21,
    marketAwayProbability: 0.1,
    homeGoals: 3,
    awayGoals: 2
  },
  {
    id: "2018-croatia-england",
    playedAt: "2018-07-11",
    homeTeam: "Croatia",
    awayTeam: "England",
    neutralSite: true,
    eloDiff: -40,
    rankDiff: -8,
    formDiff: 0.02,
    restDiff: -1,
    marketHomeProbability: 0.28,
    marketDrawProbability: 0.3,
    marketAwayProbability: 0.42,
    homeGoals: 2,
    awayGoals: 1
  },
  {
    id: "2018-france-croatia",
    playedAt: "2018-07-15",
    homeTeam: "France",
    awayTeam: "Croatia",
    neutralSite: true,
    eloDiff: 90,
    rankDiff: 13,
    formDiff: 0.05,
    restDiff: 1,
    marketHomeProbability: 0.52,
    marketDrawProbability: 0.27,
    marketAwayProbability: 0.21,
    homeGoals: 4,
    awayGoals: 2
  },
  {
    id: "2022-qatar-ecuador",
    playedAt: "2022-11-20",
    homeTeam: "Qatar",
    awayTeam: "Ecuador",
    neutralSite: false,
    eloDiff: -120,
    rankDiff: -24,
    formDiff: -0.05,
    restDiff: 0,
    marketHomeProbability: 0.28,
    marketDrawProbability: 0.31,
    marketAwayProbability: 0.41,
    homeGoals: 0,
    awayGoals: 2
  },
  {
    id: "2022-argentina-saudi-arabia",
    playedAt: "2022-11-22",
    homeTeam: "Argentina",
    awayTeam: "Saudi Arabia",
    neutralSite: true,
    eloDiff: 320,
    rankDiff: 48,
    formDiff: 0.12,
    restDiff: 0,
    marketHomeProbability: 0.78,
    marketDrawProbability: 0.15,
    marketAwayProbability: 0.07,
    homeGoals: 1,
    awayGoals: 2
  },
  {
    id: "2022-germany-japan",
    playedAt: "2022-11-23",
    homeTeam: "Germany",
    awayTeam: "Japan",
    neutralSite: true,
    eloDiff: 185,
    rankDiff: 13,
    formDiff: 0.03,
    restDiff: 0,
    marketHomeProbability: 0.64,
    marketDrawProbability: 0.23,
    marketAwayProbability: 0.13,
    homeGoals: 1,
    awayGoals: 2
  },
  {
    id: "2022-spain-germany",
    playedAt: "2022-11-27",
    homeTeam: "Spain",
    awayTeam: "Germany",
    neutralSite: true,
    eloDiff: 15,
    rankDiff: 4,
    formDiff: 0.04,
    restDiff: 0,
    marketHomeProbability: 0.38,
    marketDrawProbability: 0.28,
    marketAwayProbability: 0.34,
    homeGoals: 1,
    awayGoals: 1
  },
  {
    id: "2022-netherlands-usa",
    playedAt: "2022-12-03",
    homeTeam: "Netherlands",
    awayTeam: "USA",
    neutralSite: true,
    eloDiff: 140,
    rankDiff: 8,
    formDiff: 0.05,
    restDiff: 1,
    marketHomeProbability: 0.55,
    marketDrawProbability: 0.26,
    marketAwayProbability: 0.19,
    homeGoals: 3,
    awayGoals: 1
  },
  {
    id: "2022-morocco-spain",
    playedAt: "2022-12-06",
    homeTeam: "Morocco",
    awayTeam: "Spain",
    neutralSite: true,
    eloDiff: -160,
    rankDiff: -15,
    formDiff: 0.04,
    restDiff: 0,
    marketHomeProbability: 0.18,
    marketDrawProbability: 0.3,
    marketAwayProbability: 0.52,
    homeGoals: 0,
    awayGoals: 0
  },
  {
    id: "2022-england-france",
    playedAt: "2022-12-10",
    homeTeam: "England",
    awayTeam: "France",
    neutralSite: true,
    eloDiff: -25,
    rankDiff: -1,
    formDiff: 0.01,
    restDiff: 0,
    marketHomeProbability: 0.34,
    marketDrawProbability: 0.29,
    marketAwayProbability: 0.37,
    homeGoals: 1,
    awayGoals: 2
  },
  {
    id: "2022-argentina-france",
    playedAt: "2022-12-18",
    homeTeam: "Argentina",
    awayTeam: "France",
    neutralSite: true,
    eloDiff: -20,
    rankDiff: 1,
    formDiff: 0.03,
    restDiff: 0,
    marketHomeProbability: 0.36,
    marketDrawProbability: 0.29,
    marketAwayProbability: 0.35,
    homeGoals: 3,
    awayGoals: 3
  }
];

function outcomeIndex(sample: HistoricalMatchSample): OutcomeIndex {
  if (sample.homeGoals > sample.awayGoals) return 0;
  if (sample.homeGoals === sample.awayGoals) return 1;
  return 2;
}

function features(sample: HistoricalMatchSample) {
  return [
    1,
    sample.eloDiff / 300,
    sample.rankDiff / 50,
    sample.formDiff * 8,
    sample.restDiff / 3,
    sample.marketHomeProbability,
    sample.marketDrawProbability,
    sample.marketAwayProbability,
    sample.neutralSite ? 1 : 0
  ];
}

function softmax(logits: number[]) {
  const max = Math.max(...logits);
  const expValues = logits.map((value) => Math.exp(value - max));
  const total = expValues.reduce((sum, value) => sum + value, 0);
  return expValues.map((value) => value / total);
}

function trainWeights(samples: HistoricalMatchSample[]) {
  const weights = Array.from({ length: 3 }, () => Array.from({ length: FEATURE_NAMES.length }, () => 0));

  for (let epoch = 0; epoch < EPOCHS; epoch += 1) {
    samples.forEach((sample) => {
      const x = features(sample);
      const y = outcomeIndex(sample);
      const probabilities = softmax(weights.map((row) => row.reduce((sum, weight, index) => sum + weight * x[index], 0)));

      weights.forEach((row, classIndex) => {
        const target = classIndex === y ? 1 : 0;
        row.forEach((weight, featureIndex) => {
          const regularization = featureIndex === 0 ? 0 : L2 * weight;
          row[featureIndex] = weight - LEARNING_RATE * ((probabilities[classIndex] - target) * x[featureIndex] + regularization);
        });
      });
    });
  }

  return weights;
}

function predict(sample: HistoricalMatchSample, weights: number[][]) {
  const x = features(sample);
  return softmax(weights.map((row) => row.reduce((sum, weight, index) => sum + weight * x[index], 0)));
}

function brier(probabilities: number[], y: OutcomeIndex) {
  return probabilities.reduce((sum, probability, index) => sum + (probability - (index === y ? 1 : 0)) ** 2, 0);
}

function logLoss(probabilities: number[], y: OutcomeIndex) {
  return -Math.log(Math.min(0.999, Math.max(0.001, probabilities[y])));
}

function calibrationBuckets(results: Array<{ confidence: number; correct: boolean }>) {
  const buckets = [
    { label: "0-40%", min: 0, max: 0.4 },
    { label: "40-55%", min: 0.4, max: 0.55 },
    { label: "55-70%", min: 0.55, max: 0.7 },
    { label: "70%+", min: 0.7, max: 1.01 }
  ];

  return buckets.map((bucket) => {
    const rows = results.filter((result) => result.confidence >= bucket.min && result.confidence < bucket.max);
    const predicted = rows.length ? rows.reduce((sum, result) => sum + result.confidence, 0) / rows.length : 0;
    const observed = rows.length ? rows.filter((result) => result.correct).length / rows.length : 0;

    return {
      label: bucket.label,
      predicted: Number(predicted.toFixed(4)),
      observed: Number(observed.toFixed(4)),
      matches: rows.length
    };
  });
}

function calibrationLine(results: Array<{ confidence: number; correct: boolean }>) {
  if (results.length < 2) return { slope: 1, intercept: 0 };
  const xs = results.map((result) => result.confidence);
  const ys: number[] = results.map((result) => (result.correct ? 1 : 0));
  const meanX = xs.reduce((sum, value) => sum + value, 0) / xs.length;
  const meanY = ys.reduce((sum, value) => sum + value, 0) / ys.length;
  const numerator = xs.reduce((sum, value, index) => sum + (value - meanX) * (ys[index] - meanY), 0);
  const denominator = xs.reduce((sum, value) => sum + (value - meanX) ** 2, 0);
  const slope = denominator === 0 ? 1 : numerator / denominator;
  return { slope, intercept: meanY - slope * meanX };
}

export function runBacktest(samples: HistoricalMatchSample[] = HISTORICAL_MATCHES): BacktestReport {
  const splitIndex = Math.max(10, Math.floor(samples.length * 0.7));
  const training = samples.slice(0, splitIndex);
  const testing = samples.slice(splitIndex);
  const weights = trainWeights(training);
  const outcomes = testing.map((sample) => {
    const probabilities = predict(sample, weights);
    const y = outcomeIndex(sample);
    const predictedClass = probabilities.indexOf(Math.max(...probabilities));
    return {
      probabilities,
      y,
      correct: predictedClass === y,
      confidence: probabilities[predictedClass]
    };
  });

  const featureWeights = FEATURE_NAMES.map((feature, index) => {
    const homeWeight = weights[0][index];
    const drawWeight = weights[1][index];
    const awayWeight = weights[2][index];
    return {
      feature,
      homeWeight: Number(homeWeight.toFixed(4)),
      drawWeight: Number(drawWeight.toFixed(4)),
      awayWeight: Number(awayWeight.toFixed(4)),
      importance: Number((Math.abs(homeWeight) + Math.abs(drawWeight) + Math.abs(awayWeight)).toFixed(4))
    };
  }).sort((a, b) => b.importance - a.importance);
  const line = calibrationLine(outcomes);

  return {
    modelVersion: TRAINING_MODEL_VERSION,
    trainedMatches: training.length,
    testedMatches: testing.length,
    trainingWindow: `${training[0].playedAt} to ${training[training.length - 1].playedAt}`,
    generatedAt: new Date().toISOString(),
    accuracy: Number((outcomes.filter((item) => item.correct).length / Math.max(1, outcomes.length)).toFixed(4)),
    brierScore: Number((outcomes.reduce((sum, item) => sum + brier(item.probabilities, item.y), 0) / Math.max(1, outcomes.length)).toFixed(4)),
    logLoss: Number((outcomes.reduce((sum, item) => sum + logLoss(item.probabilities, item.y), 0) / Math.max(1, outcomes.length)).toFixed(4)),
    calibrationSlope: Number(line.slope.toFixed(4)),
    calibrationIntercept: Number(line.intercept.toFixed(4)),
    featureWeights,
    calibrationBuckets: calibrationBuckets(outcomes),
    notes: [
      "训练集使用赛前可获得的 Elo、排名、状态、休息天数和去水市场概率。",
      "测试集按时间切分，避免未来比赛信息泄漏。",
      "生产化时可替换为 XGBoost/LightGBM，并把历史样本扩展到所有国际比赛。"
    ]
  };
}
