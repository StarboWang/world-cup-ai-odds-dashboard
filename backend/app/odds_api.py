from __future__ import annotations

import os
import re
from datetime import datetime, timezone

import httpx

from .models import DEMO_MATCHES

ODDS_API_BASE = "https://api.the-odds-api.com/v4"
SPORT_KEY = "soccer_fifa_world_cup"


def normalize_name(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def find_match_id(event: dict) -> str | None:
    home = normalize_name(event.get("home_team", ""))
    away = normalize_name(event.get("away_team", ""))
    date = event.get("commence_time", "")[:10]
    for match in DEMO_MATCHES:
        match_home = normalize_name(match.home_team.name)
        match_away = normalize_name(match.away_team.name)
        if match.kickoff[:10] == date and ((home == match_home and away == match_away) or (home == match_away and away == match_home)):
            return match.id
    for match in DEMO_MATCHES:
        match_home = normalize_name(match.home_team.name)
        match_away = normalize_name(match.away_team.name)
        if (match_home in home or home in match_home) and (match_away in away or away in match_away):
            return match.id
    return None


async def fetch_world_cup_odds() -> list[dict]:
    api_key = os.getenv("ODDS_API_KEY")
    if not api_key:
        return []

    params = {
        "apiKey": api_key,
        "regions": os.getenv("ODDS_API_REGIONS", "us,uk,eu"),
        "markets": os.getenv("ODDS_API_MARKETS", "h2h,spreads,totals"),
        "oddsFormat": "decimal",
        "dateFormat": "iso",
    }
    bookmakers = os.getenv("ODDS_API_BOOKMAKERS")
    if bookmakers:
        params["bookmakers"] = bookmakers

    async with httpx.AsyncClient(timeout=12) as client:
        response = await client.get(f"{ODDS_API_BASE}/sports/{SPORT_KEY}/odds", params=params)
    if response.status_code >= 400:
        return []

    captured_at = datetime.now(timezone.utc).isoformat()
    snapshots = []
    for event in response.json():
        match_id = find_match_id(event)
        if not match_id:
            continue
        snapshots.append(
            {
                "matchId": match_id,
                "source": "the-odds-api",
                "stale": False,
                "capturedAt": captured_at,
                "bookmakers": [
                    {
                        "key": bookmaker["key"],
                        "title": bookmaker["title"],
                        "lastUpdate": bookmaker["last_update"],
                        "markets": [
                            {
                                "key": market["key"],
                                "lastUpdate": market["last_update"],
                                "outcomes": [
                                    {
                                        "name": outcome["name"],
                                        "price": outcome["price"],
                                        **({"point": outcome["point"]} if "point" in outcome else {}),
                                    }
                                    for outcome in market["outcomes"]
                                ],
                            }
                            for market in bookmaker["markets"]
                        ],
                    }
                    for bookmaker in event.get("bookmakers", [])
                ],
            }
        )
    return snapshots
