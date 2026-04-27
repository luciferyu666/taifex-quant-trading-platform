from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field, ValidationError, computed_field, field_validator

from app.domain.market_data import (
    AdjustmentMethod,
    MarketBar,
    PriceUsage,
    RolloverEvent,
    validate_market_bar,
    validate_rollover_event,
)


class ContinuousFuturesPreviewRequest(BaseModel):
    data_version: str = Field(min_length=1)
    adjustment_method: AdjustmentMethod
    market_bars: list[dict[str, Any]] = Field(min_length=1, max_length=500)
    rollover_events: list[dict[str, Any]] = Field(min_length=1, max_length=200)

    @field_validator("adjustment_method")
    @classmethod
    def reject_none_adjustment(cls, value: AdjustmentMethod) -> AdjustmentMethod:
        if value == AdjustmentMethod.NONE:
            raise ValueError("continuous futures preview requires back_adjusted or ratio_adjusted")
        return value


class ContinuousFuturesSourceContract(BaseModel):
    symbol: str
    contract_month: str


class ContinuousFuturesRolloverApplied(BaseModel):
    root_symbol: str
    from_contract_month: str
    to_contract_month: str
    rollover_timestamp: datetime
    spread_points: float
    adjustment_method: AdjustmentMethod
    adjustment_factor: float
    data_version: str


class ContinuousFuturesResearchBar(BaseModel):
    continuous_symbol: str
    source_symbol: str
    contract_month: str
    bar_start: datetime
    timeframe: str
    open: float
    high: float
    low: float
    close: float
    volume: int
    data_version: str
    adjustment_method: AdjustmentMethod
    adjustment_applied: bool
    research_only: bool = True
    execution_eligible: bool = False


class ContinuousFuturesPreview(BaseModel):
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    data_version: str
    adjustment_method: AdjustmentMethod
    research_only: bool = True
    execution_eligible: bool = False
    external_data_downloaded: bool = False
    broker_api_called: bool = False
    source_contracts: list[ContinuousFuturesSourceContract]
    rollover_events_applied: list[ContinuousFuturesRolloverApplied]
    adjusted_research_bars: list[ContinuousFuturesResearchBar]
    warnings: list[str] = Field(default_factory=list)

    @computed_field
    @property
    def summary(self) -> dict[str, int | str | bool]:
        return {
            "source_contract_count": len(self.source_contracts),
            "rollover_event_count": len(self.rollover_events_applied),
            "research_bar_count": len(self.adjusted_research_bars),
            "data_version": self.data_version,
            "adjustment_method": self.adjustment_method.value,
            "research_only": self.research_only,
            "execution_eligible": self.execution_eligible,
        }


def preview_continuous_futures(
    request: ContinuousFuturesPreviewRequest,
) -> ContinuousFuturesPreview:
    bars = [_parse_market_bar(row, request.data_version) for row in request.market_bars]
    rollover_events = [
        _parse_rollover_event(row, request.data_version)
        for row in request.rollover_events
    ]

    matching_events = [
        event for event in rollover_events if event.adjustment_method == request.adjustment_method
    ]
    event_by_symbol_month = {
        (event.root_symbol, event.from_contract_month): event
        for event in matching_events
    }

    warnings: list[str] = []
    if any(bar.price_usage == PriceUsage.EXECUTION for bar in bars):
        warnings.append(
            "Input bars use the execution price path. Preview output is research-only "
            "and execution_eligible=false."
        )
    if not matching_events:
        warnings.append(
            f"No rollover events matched adjustment_method={request.adjustment_method.value}."
        )

    source_contracts = sorted(
        {
            (bar.symbol, bar.contract_month)
            for bar in bars
        }
    )

    adjusted_bars = [
        _to_research_bar(
            bar=bar,
            event=event_by_symbol_month.get((bar.symbol, bar.contract_month)),
            adjustment_method=request.adjustment_method,
            data_version=request.data_version,
        )
        for bar in bars
    ]

    return ContinuousFuturesPreview(
        data_version=request.data_version,
        adjustment_method=request.adjustment_method,
        source_contracts=[
            ContinuousFuturesSourceContract(symbol=symbol, contract_month=contract_month)
            for symbol, contract_month in source_contracts
        ],
        rollover_events_applied=[
            ContinuousFuturesRolloverApplied(
                root_symbol=event.root_symbol,
                from_contract_month=event.from_contract_month,
                to_contract_month=event.to_contract_month,
                rollover_timestamp=event.rollover_timestamp,
                spread_points=event.spread_points,
                adjustment_method=event.adjustment_method,
                adjustment_factor=event.adjustment_factor,
                data_version=event.data_version,
            )
            for event in matching_events
        ],
        adjusted_research_bars=adjusted_bars,
        warnings=warnings,
    )


def _parse_market_bar(row: dict[str, Any], data_version: str) -> MarketBar:
    payload = {**row}
    payload.setdefault("data_version", data_version)
    try:
        bar = MarketBar.model_validate(payload)
    except ValidationError as exc:
        raise ValueError(f"invalid market bar row: {exc}") from exc
    report = validate_market_bar(bar)
    if not report.passed:
        errors = [
            check.message
            for check in report.checks
            if not check.passed
        ]
        raise ValueError(f"invalid market bar row: {'; '.join(errors)}")
    return bar


def _parse_rollover_event(row: dict[str, Any], data_version: str) -> RolloverEvent:
    payload = {**row}
    payload.setdefault("data_version", data_version)
    try:
        event = RolloverEvent.model_validate(payload)
    except ValidationError as exc:
        raise ValueError(f"invalid rollover event row: {exc}") from exc
    report = validate_rollover_event(event)
    if not report.passed:
        errors = [
            check.message
            for check in report.checks
            if not check.passed
        ]
        raise ValueError(f"invalid rollover event row: {'; '.join(errors)}")
    return event


def _to_research_bar(
    bar: MarketBar,
    event: RolloverEvent | None,
    adjustment_method: AdjustmentMethod,
    data_version: str,
) -> ContinuousFuturesResearchBar:
    prices = [bar.open, bar.high, bar.low, bar.close]
    adjusted = _adjust_prices(prices, event, adjustment_method)
    return ContinuousFuturesResearchBar(
        continuous_symbol=f"{bar.symbol}_CONT",
        source_symbol=bar.symbol,
        contract_month=bar.contract_month,
        bar_start=bar.bar_start,
        timeframe=bar.timeframe,
        open=adjusted[0],
        high=adjusted[1],
        low=adjusted[2],
        close=adjusted[3],
        volume=bar.volume,
        data_version=data_version,
        adjustment_method=adjustment_method,
        adjustment_applied=event is not None,
    )


def _adjust_prices(
    prices: list[float],
    event: RolloverEvent | None,
    adjustment_method: AdjustmentMethod,
) -> list[float]:
    if event is None:
        return [round(price, 4) for price in prices]
    if adjustment_method == AdjustmentMethod.BACK_ADJUSTED:
        return [round(price + event.adjustment_factor, 4) for price in prices]
    if adjustment_method == AdjustmentMethod.RATIO_ADJUSTED:
        return [round(price * event.adjustment_factor, 4) for price in prices]
    raise ValueError("continuous futures preview requires back_adjusted or ratio_adjusted")
