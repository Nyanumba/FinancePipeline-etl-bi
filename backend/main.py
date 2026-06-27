from fastapi import FastAPI, Depends, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc
from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager
import logging

from database import get_db, engine, SessionLocal
import models
from schemas import ForexRateSchema, TradeIndicatorResponse, PopulationDataPoint, PipelineRunSchema
from pipeline.runner import run_pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

models.Base.metadata.create_all(bind=engine)

scheduler = BackgroundScheduler()


def scheduled_pipeline():
    db = SessionLocal()
    try:
        logger.info("Scheduled pipeline run starting...")
        result = run_pipeline(db)
        logger.info(f"Scheduled pipeline complete: {result}")
    except Exception as e:
        logger.error(f"Scheduled pipeline error: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(scheduled_pipeline, "interval", hours=1, id="etl_pipeline")
    scheduler.start()
    logger.info("APScheduler started — pipeline runs every hour")
    yield
    scheduler.shutdown()
    logger.info("APScheduler stopped")


app = FastAPI(
    title="ETL Pipeline + BI Dashboard API",
    description="Forex, trade, and population data pipeline with hourly scheduling",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "ETL Pipeline BI API", "status": "running"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/pipeline/run", summary="Trigger pipeline manually")
def trigger_pipeline(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    def _run():
        d = SessionLocal()
        try:
            run_pipeline(d)
        finally:
            d.close()
    background_tasks.add_task(_run)
    return {"message": "Pipeline triggered — check /api/pipeline/runs for status"}


@app.get("/api/pipeline/runs", response_model=list[PipelineRunSchema])
def get_pipeline_runs(limit: int = 20, db: Session = Depends(get_db)):
    return db.query(models.PipelineRun).order_by(desc(models.PipelineRun.started_at)).limit(limit).all()


@app.get("/api/pipeline/latest", response_model=PipelineRunSchema)
def get_latest_run(db: Session = Depends(get_db)):
    run = db.query(models.PipelineRun).order_by(desc(models.PipelineRun.started_at)).first()
    if not run:
        raise HTTPException(status_code=404, detail="No pipeline runs yet. POST /api/pipeline/run to start.")
    return run


@app.get("/api/forex", response_model=list[ForexRateSchema])
def get_forex(db: Session = Depends(get_db)):
    rates = db.query(models.ForexRate).order_by(models.ForexRate.currency).all()
    if not rates:
        raise HTTPException(status_code=404, detail="No forex data yet. Trigger the pipeline first.")
    return rates


@app.get("/api/trade/{indicator_code}", response_model=TradeIndicatorResponse)
def get_trade(indicator_code: str, db: Session = Depends(get_db)):
    records = (
        db.query(models.TradeData)
        .filter(models.TradeData.indicator_code == indicator_code)
        .order_by(models.TradeData.country_code, models.TradeData.year)
        .all()
    )
    if not records:
        raise HTTPException(status_code=404, detail=f"No trade data for indicator '{indicator_code}'.")

    return {
        "indicator_code": indicator_code,
        "indicator_name": records[0].indicator_name,
        "data": [
            {"country_code": r.country_code, "country_name": r.country_name, "year": r.year, "value": r.value}
            for r in records
        ],
    }


@app.get("/api/trade", summary="List available trade indicators")
def list_trade_indicators(db: Session = Depends(get_db)):
    from sqlalchemy import distinct
    codes = db.query(distinct(models.TradeData.indicator_code), models.TradeData.indicator_name).all()
    return [{"code": c, "name": n} for c, n in codes]


@app.get("/api/population", response_model=list[PopulationDataPoint])
def get_population(db: Session = Depends(get_db)):
    records = (
        db.query(models.PopulationData)
        .order_by(models.PopulationData.country_code, models.PopulationData.year)
        .all()
    )
    if not records:
        raise HTTPException(status_code=404, detail="No population data yet. Trigger the pipeline first.")
    return records


@app.get("/api/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Single call for the React dashboard — returns counts and latest pipeline status."""
    latest_run = db.query(models.PipelineRun).order_by(desc(models.PipelineRun.started_at)).first()
    forex_count = db.query(models.ForexRate).count()
    trade_count = db.query(models.TradeData).count()
    pop_count = db.query(models.PopulationData).count()

    return {
        "forex_currencies": forex_count,
        "trade_records": trade_count,
        "population_records": pop_count,
        "latest_run": {
            "status": latest_run.status if latest_run else None,
            "started_at": latest_run.started_at.isoformat() if latest_run else None,
            "rows_total": (
                (latest_run.rows_forex or 0) + (latest_run.rows_trade or 0) + (latest_run.rows_population or 0)
            ) if latest_run else 0,
        },
    }