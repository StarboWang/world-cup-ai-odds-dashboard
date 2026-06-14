from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import build_dashboard_data, compute_fair_probabilities
from .odds_api import fetch_world_cup_odds

app = FastAPI(title="World Cup AI Odds Lab", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def dashboard() -> dict:
    odds = await fetch_world_cup_odds()
    return build_dashboard_data(odds or None)


@app.get("/api/data")
async def get_data():
    return await dashboard()


@app.get("/api/matches")
async def get_matches():
    data = await dashboard()
    return data["matches"]


@app.get("/api/matches/{match_id}")
async def get_match(match_id: str):
    data = await dashboard()
    match = next((item for item in data["matches"] if item["id"] == match_id), None)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    odds = next((item for item in data["odds"] if item["matchId"] == match_id), None)
    return {
        "match": match,
        "prediction": next((item for item in data["predictions"] if item["matchId"] == match_id), None),
        "odds": odds,
        "fairProbabilities": compute_fair_probabilities(odds) if odds else [],
        "bets": [item for item in data["bets"] if item["matchId"] == match_id],
    }


@app.get("/api/predictions/latest")
async def get_predictions():
    data = await dashboard()
    return data["predictions"]


@app.get("/api/bets/ledger")
async def get_bets():
    data = await dashboard()
    return data["bets"]


@app.get("/api/performance")
async def get_performance():
    data = await dashboard()
    return data["performance"]


@app.post("/api/jobs/refresh-odds")
async def refresh_odds():
    odds = await fetch_world_cup_odds()
    data = build_dashboard_data(odds or None)
    return {
        "refreshedAt": data["lastRefresh"],
        "source": "the-odds-api" if odds else "cached-demo",
        "snapshots": len(data["odds"]),
        "bookmakerCount": sum(len(snapshot["bookmakers"]) for snapshot in data["odds"]),
    }


@app.post("/api/jobs/run-predictions")
async def run_predictions():
    data = await dashboard()
    return {
        "generatedAt": data["lastRefresh"],
        "modelVersion": data["predictions"][0]["modelVersion"] if data["predictions"] else None,
        "predictions": len(data["predictions"]),
        "recommendedBets": len(data["bets"]),
        "performance": data["performance"],
    }
