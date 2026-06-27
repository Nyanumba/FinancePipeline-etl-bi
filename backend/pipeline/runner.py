from datetime import datetime, timezone
from sqlalchemy.orm import Session
from pipeline.extract import extract_forex, extract_trade, extract_population
from pipeline.transform import transform_forex, transform_trade, transform_population
from pipeline.load import load_forex, load_trade, load_population
from models import PipelineRun
import logging

logger = logging.getLogger(__name__)


def run_pipeline(db: Session) -> dict:
    run = PipelineRun(status="running", started_at=datetime.now(timezone.utc))
    db.add(run)
    db.commit()
    db.refresh(run)

    rows_forex = rows_trade = rows_population = 0
    errors = []

    try:
        logger.info("Pipeline: extracting forex...")
        raw_forex = extract_forex()
        clean_forex = transform_forex(raw_forex)
        rows_forex = load_forex(db, clean_forex)
        logger.info(f"Pipeline: forex done — {rows_forex} rows")
    except Exception as e:
        errors.append(f"Forex: {str(e)}")
        logger.error(f"Pipeline forex error: {e}")

    try:
        logger.info("Pipeline: extracting trade data...")
        raw_trade = extract_trade()
        clean_trade = transform_trade(raw_trade)
        rows_trade = load_trade(db, clean_trade)
        logger.info(f"Pipeline: trade done — {rows_trade} rows")
    except Exception as e:
        errors.append(f"Trade: {str(e)}")
        logger.error(f"Pipeline trade error: {e}")

    try:
        logger.info("Pipeline: extracting population data...")
        raw_population = extract_population()
        clean_population = transform_population(raw_population)
        rows_population = load_population(db, clean_population)
        logger.info(f"Pipeline: population done — {rows_population} rows")
    except Exception as e:
        errors.append(f"Population: {str(e)}")
        logger.error(f"Pipeline population error: {e}")

    status = "success" if not errors else ("failed" if rows_forex + rows_trade + rows_population == 0 else "partial")

    run.status = status
    run.rows_forex = rows_forex
    run.rows_trade = rows_trade
    run.rows_population = rows_population
    run.error_message = "; ".join(errors) if errors else None
    run.finished_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "status": status,
        "rows_forex": rows_forex,
        "rows_trade": rows_trade,
        "rows_population": rows_population,
        "errors": errors,
    }