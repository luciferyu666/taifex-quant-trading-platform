import csv
from datetime import UTC, datetime
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.domain.market_data import (
    AdjustmentMethod,
    MarketBar,
    RolloverEvent,
    contract_master_records,
    validate_market_bar,
    validate_market_bar_rows,
    validate_rollover_event_rows,
)
from app.main import app

REPO_ROOT = Path(__file__).resolve().parents[2]
FIXTURE_DIR = REPO_ROOT / "data-pipeline" / "fixtures"


def _valid_bar_payload() -> dict[str, object]:
    return {
        "symbol": "TX",
        "contract_month": "202606",
        "bar_start": "2026-04-25T09:00:00+08:00",
        "timeframe": "1m",
        "open": 20000,
        "high": 20020,
        "low": 19990,
        "close": 20010,
        "volume": 100,
        "data_version": "fixture-v1",
        "source": "manual-fixture",
        "price_usage": "execution",
        "adjustment_method": "none",
    }


def _load_fixture(name: str) -> list[dict[str, str]]:
    with (FIXTURE_DIR / name).open(newline="", encoding="utf-8") as fixture_file:
        return list(csv.DictReader(fixture_file))


def test_contract_master_records_include_tx_mtx_tmf() -> None:
    records = contract_master_records()

    ratios = {record.symbol: record.tx_equivalent_ratio for record in records}
    assert ratios == {"TX": 1.0, "MTX": 0.25, "TMF": 0.05}
    assert all(record.research_enabled for record in records)
    assert all(not record.execution_enabled for record in records)


def test_market_bar_quality_report_passes_for_real_contract_price() -> None:
    bar = MarketBar(**_valid_bar_payload())

    report = validate_market_bar(bar)

    assert report.passed is True
    assert report.dataset_name == "TX_202606_1m"


def test_execution_market_bar_rejects_adjusted_price() -> None:
    payload = _valid_bar_payload()
    payload["adjustment_method"] = "back_adjusted"

    with pytest.raises(ValidationError):
        MarketBar(**payload)


def test_rollover_event_is_research_only() -> None:
    with pytest.raises(ValidationError):
        RolloverEvent(
            root_symbol="TX",
            from_contract_month="202606",
            to_contract_month="202607",
            rollover_timestamp=datetime.now(UTC),
            spread_points=12.5,
            adjustment_method=AdjustmentMethod.BACK_ADJUSTED,
            adjustment_factor=-12.5,
            data_version="fixture-v1",
            research_only=False,
        )


def test_data_manifest_returns_phase_2_paper_only() -> None:
    client = TestClient(app)

    response = client.get("/api/data/manifest")

    assert response.status_code == 200
    payload = response.json()
    assert payload["phase"] == 2
    assert payload["safety_mode"] == "paper-only"
    assert payload["live_trading_enabled"] is False
    assert "data-pipeline/migrations/001_phase_2_data_platform.sql" in payload["schemas"]


def test_contract_master_route_returns_contract_metadata() -> None:
    client = TestClient(app)

    response = client.get("/api/data/contracts/master")

    assert response.status_code == 200
    payload = response.json()
    symbols = {item["symbol"] for item in payload}
    assert symbols == {"TX", "MTX", "TMF"}
    assert all("Adjusted continuous prices" in item["notes"] for item in payload)


def test_quality_validate_bar_route_returns_passed_checks() -> None:
    client = TestClient(app)

    response = client.post("/api/data/quality/validate-bar", json=_valid_bar_payload())

    assert response.status_code == 200
    payload = response.json()
    assert payload["dataset_name"] == "TX_202606_1m"
    assert all(check["passed"] for check in payload["checks"])


def test_quality_validate_bar_route_rejects_adjusted_execution_bar() -> None:
    client = TestClient(app)
    payload = _valid_bar_payload()
    payload["adjustment_method"] = "ratio_adjusted"

    response = client.post("/api/data/quality/validate-bar", json=payload)

    assert response.status_code == 422


def test_rollover_policy_separates_research_and_execution_paths() -> None:
    client = TestClient(app)

    response = client.get("/api/data/rollover/policy")

    assert response.status_code == 200
    payload = response.json()
    assert "research" in payload["research_adjusted_contracts"].lower()
    assert "real contract" in payload["execution_contracts"].lower()


def test_valid_csv_fixture_batch_passes() -> None:
    report = validate_market_bar_rows(
        rows=_load_fixture("market_bars_valid.csv"),
        dataset_name="market_bars_valid",
        data_version="fixture-v1",
    )

    assert report.passed is True
    assert report.total_rows == 3
    assert report.valid_rows == 3
    assert report.invalid_rows == 0


def test_invalid_csv_fixture_batch_reports_row_errors() -> None:
    report = validate_market_bar_rows(
        rows=_load_fixture("market_bars_invalid.csv"),
        dataset_name="market_bars_invalid",
        data_version="fixture-v1",
    )

    assert report.passed is False
    assert report.total_rows == 4
    assert report.invalid_rows == 4
    assert any("Symbol must be one of TX, MTX, or TMF." in row.errors for row in report.rows)


def test_valid_rollover_fixture_batch_passes() -> None:
    report = validate_rollover_event_rows(
        rows=_load_fixture("rollover_events_valid.csv"),
        dataset_name="rollover_events_valid",
        data_version="fixture-v1",
    )

    assert report.passed is True
    assert report.total_rows == 3
    assert report.valid_rows == 3
    assert report.invalid_rows == 0


def test_invalid_rollover_fixture_batch_reports_version_and_scope_errors() -> None:
    report = validate_rollover_event_rows(
        rows=_load_fixture("rollover_events_invalid.csv"),
        dataset_name="rollover_events_invalid",
        data_version="fixture-v1",
    )

    assert report.passed is False
    assert report.total_rows == 6
    assert report.invalid_rows == 6
    all_errors = [error for row in report.rows for error in row.errors]
    assert "Root symbol must be one of TX, MTX, or TMF." in all_errors
    assert "Every rollover event must carry a data_version for reproducibility." in all_errors


def test_quality_validate_bars_route_reports_batch_summary() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/data/quality/validate-bars",
        json={
            "dataset_name": "market_bars_invalid",
            "data_version": "fixture-v1",
            "rows": _load_fixture("market_bars_invalid.csv"),
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["passed"] is False
    assert payload["total_rows"] == 4
    assert payload["invalid_rows"] == 4
