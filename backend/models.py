from sqlalchemy import Column, Integer, String, Float, DateTime, Text, UniqueConstraint
from sqlalchemy.sql import func
from database import Base


class ForexRate(Base):
    __tablename__ = "forex_rates"

    id = Column(Integer, primary_key=True, index=True)
    base = Column(String, nullable=False)
    currency = Column(String, nullable=False)
    rate = Column(Float, nullable=False)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("base", "currency", name="uq_forex_base_currency"),
    )


class TradeData(Base):
    __tablename__ = "trade_data"

    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String, nullable=False)
    country_name = Column(String, nullable=False)
    indicator_code = Column(String, nullable=False)
    indicator_name = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    value = Column(Float, nullable=True)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("country_code", "indicator_code", "year", name="uq_trade_country_indicator_year"),
    )


class PopulationData(Base):
    __tablename__ = "population_data"

    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String, nullable=False)
    country_name = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    value = Column(Float, nullable=True)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("country_code", "year", name="uq_population_country_year"),
    )


class PipelineRun(Base):
    __tablename__ = "pipeline_runs"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, nullable=False)  # success | failed | partial
    rows_forex = Column(Integer, default=0)
    rows_trade = Column(Integer, default=0)
    rows_population = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    finished_at = Column(DateTime(timezone=True), nullable=True)