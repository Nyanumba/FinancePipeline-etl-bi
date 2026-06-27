from typing import List, Dict
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from models import ForexRate, TradeData, PopulationData


def load_forex(db: Session, records: List[Dict]) -> int:
    if not records:
        return 0

    for record in records:
        stmt = (
            insert(ForexRate)
            .values(**record)
            .on_conflict_do_update(
                constraint="uq_forex_base_currency",
                set_={"rate": record["rate"]},
            )
        )
        db.execute(stmt)
    db.commit()
    return len(records)


def load_trade(db: Session, records: List[Dict]) -> int:
    if not records:
        return 0

    for record in records:
        stmt = (
            insert(TradeData)
            .values(**record)
            .on_conflict_do_update(
                constraint="uq_trade_country_indicator_year",
                set_={"value": record["value"]},
            )
        )
        db.execute(stmt)
    db.commit()
    return len(records)


def load_population(db: Session, records: List[Dict]) -> int:
    if not records:
        return 0

    for record in records:
        stmt = (
            insert(PopulationData)
            .values(**record)
            .on_conflict_do_update(
                constraint="uq_population_country_year",
                set_={"value": record["value"]},
            )
        )
        db.execute(stmt)
    db.commit()
    return len(records)