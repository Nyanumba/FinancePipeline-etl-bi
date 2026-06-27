from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ForexRateSchema(BaseModel):
    currency: str
    rate: float

    class Config:
        from_attributes = True


class TradeDataPoint(BaseModel):
    country_code: str
    country_name: str
    year: int
    value: float

    class Config:
        from_attributes = True


class TradeIndicatorResponse(BaseModel):
    indicator_code: str
    indicator_name: str
    data: List[TradeDataPoint]


class PopulationDataPoint(BaseModel):
    country_code: str
    country_name: str
    year: int
    value: float

    class Config:
        from_attributes = True


class PipelineRunSchema(BaseModel):
    id: int
    status: str
    rows_forex: int
    rows_trade: int
    rows_population: int
    error_message: Optional[str]
    started_at: datetime
    finished_at: Optional[datetime]

    class Config:
        from_attributes = True