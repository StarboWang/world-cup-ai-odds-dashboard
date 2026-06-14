import unittest

from backend.app.models import DEMO_MATCHES, DEMO_ODDS, build_dashboard_data, compute_fair_probabilities, generate_bets, generate_predictions
from backend.app.training import run_backtest


class ModelTests(unittest.TestCase):
    def test_prediction_probabilities_sum_to_one(self):
        predictions = generate_predictions(DEMO_MATCHES)
        for prediction in predictions:
            total = prediction["homeWinProbability"] + prediction["drawProbability"] + prediction["awayWinProbability"]
            self.assertAlmostEqual(total, 1.0, places=3)

    def test_fair_probabilities_remove_vig(self):
        fair = compute_fair_probabilities(DEMO_ODDS[0])
        total = sum(item["fairProbability"] for item in fair)
        self.assertAlmostEqual(total, 1.0, places=3)
        self.assertTrue(all(item["decimalOdds"] > 1 for item in fair))

    def test_bets_respect_value_threshold_and_stake_cap(self):
        predictions = generate_predictions(DEMO_MATCHES)
        bets = generate_bets(DEMO_MATCHES, DEMO_ODDS, predictions)
        self.assertTrue(all(bet["edge"] >= 0.03 for bet in bets))
        self.assertTrue(all(bet["stake"] <= 150 for bet in bets))

    def test_final_match_settlement_has_profit_or_loss(self):
        predictions = generate_predictions(DEMO_MATCHES)
        bets = generate_bets(DEMO_MATCHES, DEMO_ODDS, predictions)
        settled = [bet for bet in bets if bet["matchId"] == "2026-06-11-mexico-south-africa"]
        self.assertTrue(all(bet["status"] in {"won", "lost"} for bet in settled))
        self.assertTrue(all(bet["profit"] != 0 for bet in settled))

    def test_backtest_reports_training_evidence(self):
        report = run_backtest()
        self.assertGreaterEqual(report["trainedMatches"], 10)
        self.assertGreater(report["testedMatches"], 0)
        self.assertGreaterEqual(report["accuracy"], 0)
        self.assertLessEqual(report["accuracy"], 1)
        self.assertGreater(report["brierScore"], 0)
        self.assertGreater(report["logLoss"], 0)
        self.assertGreater(report["featureWeights"][0]["importance"], report["featureWeights"][-1]["importance"])

    def test_dashboard_contains_model_and_tournament_reports(self):
        data = build_dashboard_data()
        self.assertIn("backtest", data)
        self.assertIn("tournament", data)
        self.assertGreater(len(data["tournament"]), 0)
        self.assertEqual(data["backtest"]["modelVersion"], "trained-multiclass-logit-world-cup-v0.1")


if __name__ == "__main__":
    unittest.main()
