from datetime import UTC, datetime
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field, ValidationError, computed_field, model_validator

from app.domain.contracts import CONTRACT_SPECS, ContractSpec


class DataLayer(StrEnum):
    BRONZE_RAW = "bronze_raw"
    SILVER_CLEAN = "silver_clean"
    GOLD_FEATURE = "gold_feature"


class PriceUsage(StrEnum):
    EXECUTION = "execution"
    RESEARCH = "research"


class AdjustmentMethod(StrEnum):
    NONE = "none"
    BACK_ADJUSTED = "back_adjusted"
    RATIO_ADJUSTED = "ratio_adjusted"


class QualitySeverity(StrEnum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"


class ContractMasterRecord(BaseModel):
    symbol: str
    product_name: str
    point_value_twd: int
    tx_equivalent_ratio: float
    exchange: str = "TAIFEX"
    session: str = "regular_and_after_hours"
    execution_enabled: bool = False
    research_enabled: bool = True
    notes: str


class MarketBar(BaseModel):
    symbol: str
    contract_month: str
    bar_start: datetime
    timeframe: str
    open: float = Field(ge=0)
    high: float = Field(ge=0)
    low: float = Field(ge=0)
    close: float = Field(ge=0)
    volume: int = Field(ge=0)
    data_version: str
    source: str = "manual-fixture"
    price_usage: PriceUsage = PriceUsage.EXECUTION
    adjustment_method: AdjustmentMethod = AdjustmentMethod.NONE

    @model_validator(mode="after")
    def validate_ohlc(self) -> "MarketBar":
        if self.high < self.low:
            raise ValueError("high must be greater than or equal to low")
        if not self.low <= self.open <= self.high:
            raise ValueError("open must be inside the low/high range")
        if not self.low <= self.close <= self.high:
            raise ValueError("close must be inside the low/high range")
        if (
            self.price_usage == PriceUsage.EXECUTION
            and self.adjustment_method != AdjustmentMethod.NONE
        ):
            raise ValueError("execution prices must use real contract prices without adjustment")
        return self


class RolloverEvent(BaseModel):
    root_symbol: str
    from_contract_month: str
    to_contract_month: str
    rollover_timestamp: datetime
    spread_points: float
    adjustment_method: AdjustmentMethod
    adjustment_factor: float = 0
    data_version: str
    research_only: bool = True
    notes: str = ""

    @model_validator(mode="after")
    def validate_rollover_scope(self) -> "RolloverEvent":
        if self.adjustment_method == AdjustmentMethod.NONE and self.adjustment_factor != 0:
            raise ValueError("none adjustment must use adjustment_factor 0")
        if not self.research_only:
            raise ValueError("rollover adjustment events are research-only in Phase 2")
        return self


class DataQualityCheck(BaseModel):
    name: str
    severity: QualitySeverity
    passed: bool
    message: str
    details: dict[str, Any] = Field(default_factory=dict)


class DataQualityReport(BaseModel):
    dataset_name: str
    data_version: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    checks: list[DataQualityCheck]

    @computed_field
    @property
    def passed(self) -> bool:
        return all(check.passed for check in self.checks if check.severity == QualitySeverity.ERROR)


class MarketBarRowValidation(BaseModel):
    row_number: int
    passed: bool
    dataset_name: str | None = None
    data_version: str | None = None
    checks: list[DataQualityCheck] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)


class MarketBarBatchValidationRequest(BaseModel):
    dataset_name: str = "market_bars_fixture"
    data_version: str
    rows: list[dict[str, Any]] = Field(min_length=1, max_length=500)


class MarketBarBatchValidationReport(BaseModel):
    dataset_name: str
    data_version: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    total_rows: int
    valid_rows: int
    invalid_rows: int
    passed: bool
    rows: list[MarketBarRowValidation]


class RolloverEventRowValidation(BaseModel):
    row_number: int
    passed: bool
    dataset_name: str | None = None
    data_version: str | None = None
    checks: list[DataQualityCheck] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)


class RolloverEventBatchValidationReport(BaseModel):
    dataset_name: str
    data_version: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    total_rows: int
    valid_rows: int
    invalid_rows: int
    passed: bool
    rows: list[RolloverEventRowValidation]


def contract_master_records() -> list[ContractMasterRecord]:
    specs = sorted(
        CONTRACT_SPECS.values(),
        key=lambda item: item.point_value_twd,
        reverse=True,
    )
    return [
        _contract_record(spec)
        for spec in specs
    ]


def _contract_record(spec: ContractSpec) -> ContractMasterRecord:
    return ContractMasterRecord(
        symbol=spec.symbol.value,
        product_name=spec.description,
        point_value_twd=spec.point_value_twd,
        tx_equivalent_ratio=spec.tx_equivalent_ratio,
        notes=(
            "Execution simulation must use real contract symbols and real-contract prices. "
            "Adjusted continuous prices are research/backtesting inputs only."
        ),
    )


def data_layer_plan() -> list[dict[str, str]]:
    return [
        {
            "layer": DataLayer.BRONZE_RAW.value,
            "purpose": (
                "Immutable raw source payloads from future vendors, Taifex files, "
                "or broker exports."
            ),
            "storage": "Future S3/MinIO-style object storage.",
        },
        {
            "layer": DataLayer.SILVER_CLEAN.value,
            "purpose": (
                "Cleaned real-contract bars, ticks, contract metadata, "
                "and data quality reports."
            ),
            "storage": "PostgreSQL / Timescale-compatible tables.",
        },
        {
            "layer": DataLayer.GOLD_FEATURE.value,
            "purpose": (
                "Research features, adjusted continuous futures, factors, "
                "and backtest analytics."
            ),
            "storage": "ClickHouse-style OLAP tables.",
        },
    ]


def validate_market_bar(bar: MarketBar) -> DataQualityReport:
    checks = [
        DataQualityCheck(
            name="symbol_supported",
            severity=QualitySeverity.ERROR,
            passed=bar.symbol in {spec.symbol.value for spec in CONTRACT_SPECS.values()},
            message="Symbol must be one of TX, MTX, or TMF.",
            details={"symbol": bar.symbol},
        ),
        DataQualityCheck(
            name="real_execution_price_boundary",
            severity=QualitySeverity.ERROR,
            passed=not (
                bar.price_usage == PriceUsage.EXECUTION
                and bar.adjustment_method != AdjustmentMethod.NONE
            ),
            message="Execution bars must use real contract prices without adjustment.",
            details={
                "price_usage": bar.price_usage.value,
                "adjustment_method": bar.adjustment_method.value,
            },
        ),
        DataQualityCheck(
            name="non_negative_volume",
            severity=QualitySeverity.ERROR,
            passed=bar.volume >= 0,
            message="Volume must be non-negative.",
            details={"volume": bar.volume},
        ),
        DataQualityCheck(
            name="version_present",
            severity=QualitySeverity.ERROR,
            passed=bool(bar.data_version.strip()),
            message="Every bar must carry a data_version for reproducibility.",
            details={"data_version": bar.data_version},
        ),
    ]
    return DataQualityReport(
        dataset_name=f"{bar.symbol}_{bar.contract_month}_{bar.timeframe}",
        data_version=bar.data_version,
        checks=checks,
    )


def validate_rollover_event(event: RolloverEvent) -> DataQualityReport:
    checks = [
        DataQualityCheck(
            name="root_symbol_supported",
            severity=QualitySeverity.ERROR,
            passed=event.root_symbol in {spec.symbol.value for spec in CONTRACT_SPECS.values()},
            message="Root symbol must be one of TX, MTX, or TMF.",
            details={"root_symbol": event.root_symbol},
        ),
        DataQualityCheck(
            name="contract_months_present",
            severity=QualitySeverity.ERROR,
            passed=bool(event.from_contract_month.strip())
            and bool(event.to_contract_month.strip()),
            message="from_contract_month and to_contract_month must both be present.",
            details={
                "from_contract_month": event.from_contract_month,
                "to_contract_month": event.to_contract_month,
            },
        ),
        DataQualityCheck(
            name="contract_months_different",
            severity=QualitySeverity.ERROR,
            passed=event.from_contract_month != event.to_contract_month,
            message="from_contract_month and to_contract_month must be different.",
            details={
                "from_contract_month": event.from_contract_month,
                "to_contract_month": event.to_contract_month,
            },
        ),
        DataQualityCheck(
            name="adjustment_factor_consistent",
            severity=QualitySeverity.ERROR,
            passed=not (
                event.adjustment_method == AdjustmentMethod.NONE
                and event.adjustment_factor != 0
            ),
            message="adjustment_method=none must use adjustment_factor 0.",
            details={
                "adjustment_method": event.adjustment_method.value,
                "adjustment_factor": event.adjustment_factor,
            },
        ),
        DataQualityCheck(
            name="research_only_boundary",
            severity=QualitySeverity.ERROR,
            passed=event.research_only is True,
            message="Rollover adjustment events are research-only in Phase 2.",
            details={"research_only": event.research_only},
        ),
        DataQualityCheck(
            name="version_present",
            severity=QualitySeverity.ERROR,
            passed=bool(event.data_version.strip()),
            message="Every rollover event must carry a data_version for reproducibility.",
            details={"data_version": event.data_version},
        ),
    ]
    return DataQualityReport(
        dataset_name=(
            f"{event.root_symbol}_{event.from_contract_month}_"
            f"{event.to_contract_month}_rollover"
        ),
        data_version=event.data_version,
        checks=checks,
    )


def validate_market_bar_rows(
    rows: list[dict[str, Any]],
    dataset_name: str,
    data_version: str,
) -> MarketBarBatchValidationReport:
    row_results: list[MarketBarRowValidation] = []
    for index, row in enumerate(rows, start=1):
        payload = {**row}
        payload.setdefault("data_version", data_version)
        try:
            bar = MarketBar.model_validate(payload)
        except ValidationError as exc:
            row_results.append(
                MarketBarRowValidation(
                    row_number=index,
                    passed=False,
                    data_version=str(payload.get("data_version", "")),
                    errors=[error["msg"] for error in exc.errors()],
                )
            )
            continue

        report = validate_market_bar(bar)
        row_results.append(
            MarketBarRowValidation(
                row_number=index,
                passed=report.passed,
                dataset_name=report.dataset_name,
                data_version=report.data_version,
                checks=report.checks,
                errors=[
                    check.message
                    for check in report.checks
                    if check.severity == QualitySeverity.ERROR and not check.passed
                ],
            )
        )

    valid_rows = sum(1 for row in row_results if row.passed)
    invalid_rows = len(row_results) - valid_rows
    return MarketBarBatchValidationReport(
        dataset_name=dataset_name,
        data_version=data_version,
        total_rows=len(row_results),
        valid_rows=valid_rows,
        invalid_rows=invalid_rows,
        passed=invalid_rows == 0,
        rows=row_results,
    )


def validate_rollover_event_rows(
    rows: list[dict[str, Any]],
    dataset_name: str,
    data_version: str,
) -> RolloverEventBatchValidationReport:
    row_results: list[RolloverEventRowValidation] = []
    for index, row in enumerate(rows, start=1):
        payload = {**row}
        payload.setdefault("data_version", data_version)
        try:
            event = RolloverEvent.model_validate(payload)
        except ValidationError as exc:
            row_results.append(
                RolloverEventRowValidation(
                    row_number=index,
                    passed=False,
                    data_version=str(payload.get("data_version", "")),
                    errors=[error["msg"] for error in exc.errors()],
                )
            )
            continue

        report = validate_rollover_event(event)
        row_results.append(
            RolloverEventRowValidation(
                row_number=index,
                passed=report.passed,
                dataset_name=report.dataset_name,
                data_version=report.data_version,
                checks=report.checks,
                errors=[
                    check.message
                    for check in report.checks
                    if check.severity == QualitySeverity.ERROR and not check.passed
                ],
            )
        )

    valid_rows = sum(1 for row in row_results if row.passed)
    invalid_rows = len(row_results) - valid_rows
    return RolloverEventBatchValidationReport(
        dataset_name=dataset_name,
        data_version=data_version,
        total_rows=len(row_results),
        valid_rows=valid_rows,
        invalid_rows=invalid_rows,
        passed=invalid_rows == 0,
        rows=row_results,
    )


def quality_rule_catalog() -> list[dict[str, str]]:
    return [
        {
            "name": "symbol_supported",
            "severity": QualitySeverity.ERROR.value,
            "description": "Only TX, MTX, and TMF are valid Phase 2 root symbols.",
        },
        {
            "name": "ohlc_range",
            "severity": QualitySeverity.ERROR.value,
            "description": "Open and close must be inside the high/low range.",
        },
        {
            "name": "real_execution_price_boundary",
            "severity": QualitySeverity.ERROR.value,
            "description": "Paper/live simulation must not use adjusted continuous prices.",
        },
        {
            "name": "version_present",
            "severity": QualitySeverity.ERROR.value,
            "description": "Every dataset row must carry a data version.",
        },
        {
            "name": "batch_fixture_validation",
            "severity": QualitySeverity.ERROR.value,
            "description": (
                "Local CSV fixture batches must report valid and invalid rows explicitly."
            ),
        },
        {
            "name": "rollover_event_version_binding",
            "severity": QualitySeverity.ERROR.value,
            "description": (
                "Every rollover event must be research-only and tied to an explicit "
                "data_version."
            ),
        },
    ]
