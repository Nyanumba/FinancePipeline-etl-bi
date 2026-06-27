import pandas as pd
from typing import List, Dict


def transform_forex(records: List[Dict]) -> List[Dict]:
    if not records:
        return []

    df = pd.DataFrame(records)
    df = df.dropna(subset=["rate"])
    df = df[df["rate"] > 0]
    df["rate"] = df["rate"].round(6)
    df = df.drop_duplicates(subset=["base", "currency"])
    return df.to_dict(orient="records")


def transform_trade(records: List[Dict]) -> List[Dict]:
    if not records:
        return []

    df = pd.DataFrame(records)
    df = df.dropna(subset=["value"])
    df["value"] = df["value"].round(4)
    df = df[df["value"] >= 0]
    df = df.drop_duplicates(subset=["country_code", "indicator_code", "year"])
    df = df.sort_values(["country_code", "indicator_code", "year"])
    return df.to_dict(orient="records")


def transform_population(records: List[Dict]) -> List[Dict]:
    if not records:
        return []

    df = pd.DataFrame(records)
    df = df.dropna(subset=["value"])
    df["value"] = df["value"].astype(float).round(0)
    df = df[df["value"] > 0]
    df = df.drop_duplicates(subset=["country_code", "year"])
    df = df.sort_values(["country_code", "year"])
    return df.to_dict(orient="records")