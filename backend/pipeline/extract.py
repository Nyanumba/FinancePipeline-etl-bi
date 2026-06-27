import requests
import os
from typing import List, Dict

OPEN_EXCHANGE_APP_ID = os.getenv("OPEN_EXCHANGE_APP_ID", "")
WORLD_BANK_BASE = "https://api.worldbank.org/v2"

TRADE_INDICATORS = {
    "NE.EXP.GNFS.ZS": "Exports of goods and services (% of GDP)",
    "NE.IMP.GNFS.ZS": "Imports of goods and services (% of GDP)",
    "NE.TRD.GNFS.ZS": "Trade (% of GDP)",
}

COUNTRIES = ["KE", "NG", "ZA", "ET", "GH", "TZ", "UG"]
COUNTRY_NAMES = {
    "KE": "Kenya", "NG": "Nigeria", "ZA": "South Africa",
    "ET": "Ethiopia", "GH": "Ghana", "TZ": "Tanzania", "UG": "Uganda",
}


def extract_forex(base: str = "USD", symbols: List[str] = None) -> List[Dict]:
    """Fetch latest forex rates from Open Exchange Rates API."""
    if symbols is None:
        symbols = ["KES", "NGN", "ZAR", "ETB", "GHS", "TZS", "UGX", "EUR", "GBP", "JPY"]

    if not OPEN_EXCHANGE_APP_ID:
        # Return mock data if no API key provided (for demo purposes)
        mock_rates = {
            "KES": 129.50, "NGN": 1580.00, "ZAR": 18.20, "ETB": 56.80,
            "GHS": 15.40, "TZS": 2580.00, "UGX": 3750.00,
            "EUR": 0.92, "GBP": 0.79, "JPY": 149.50,
        }
        return [
            {"base": base, "currency": sym, "rate": mock_rates.get(sym, 1.0)}
            for sym in symbols
        ]

    url = f"https://openexchangerates.org/api/latest.json?app_id={OPEN_EXCHANGE_APP_ID}&base={base}&symbols={','.join(symbols)}"
    response = requests.get(url, timeout=15)
    response.raise_for_status()
    data = response.json()

    return [
        {"base": base, "currency": currency, "rate": rate}
        for currency, rate in data.get("rates", {}).items()
    ]


def extract_trade(countries: List[str] = None, start_year: int = 2010, end_year: int = 2023) -> List[Dict]:
    """Fetch trade indicators from World Bank API for African countries."""
    if countries is None:
        countries = COUNTRIES

    records = []
    for indicator_code, indicator_name in TRADE_INDICATORS.items():
        country_str = ";".join(countries)
        url = (
            f"{WORLD_BANK_BASE}/country/{country_str}/indicator/{indicator_code}"
            f"?format=json&date={start_year}:{end_year}&per_page=500"
        )
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        data = response.json()

        if not data or len(data) < 2 or not data[1]:
            continue

        for r in data[1]:
            if r.get("value") is not None:
                records.append({
                    "country_code": r["country"]["id"],
                    "country_name": r["country"]["value"],
                    "indicator_code": indicator_code,
                    "indicator_name": indicator_name,
                    "year": int(r["date"]),
                    "value": float(r["value"]),
                })

    return records


def extract_population(countries: List[str] = None, start_year: int = 2000, end_year: int = 2023) -> List[Dict]:
    """Fetch population data from World Bank API."""
    if countries is None:
        countries = COUNTRIES

    country_str = ";".join(countries)
    url = (
        f"{WORLD_BANK_BASE}/country/{country_str}/indicator/SP.POP.TOTL"
        f"?format=json&date={start_year}:{end_year}&per_page=500"
    )
    response = requests.get(url, timeout=15)
    response.raise_for_status()
    data = response.json()

    if not data or len(data) < 2 or not data[1]:
        return []

    return [
        {
            "country_code": r["country"]["id"],
            "country_name": r["country"]["value"],
            "year": int(r["date"]),
            "value": float(r["value"]) if r.get("value") is not None else None,
        }
        for r in data[1]
        if r.get("value") is not None
    ]