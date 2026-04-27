import csv
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.domain.continuous_futures import (
    ContinuousFuturesPreviewRequest,
    preview_continuous_futures,
)
from app.main import app

REPO_ROOT = Path(__file__).resolve().parents[2]
FIXTURE_DIR = REPO_ROOT / "data-pipeline" / "fixtures"


def _load_fixture(name: str) -> list[dict[str, str]]:
    with (FIXTURE_DIR / name).open(newline="", encoding="utf-8") as fixture_file:
        return list(csv.DictReader(fixture_file))


def _preview_payload(adjustment_method: str = "back_adjusted") -> dict[str, object]:
    return {
        "data_version": "fixture-v1",
        "adjustment_method": adjustment_method,
        "market_bars": _load_fixture("market_bars_valid.csv"),
        "rollover_events": _load_fixture("rollover_events_valid.csv"),
    }


def test_continuous_futures_preview_is_research_only() -> None:
    request = ContinuousFuturesPreviewRequest(**_preview_payload())

    preview = preview_continuous_futures(request)

    assert preview.research_only is True
    assert preview.execution_eligible is False
    assert preview.external_data_downloaded is False
    assert preview.broker_api_called is False
    assert len(preview.source_contracts) == 3
    assert len(preview.rollover_events_applied) == 1
    assert len(preview.adjusted_research_bars) == 3
    assert any("execution price path" in warning for warning in preview.warnings)


def test_back_adjusted_preview_applies_matching_rollover_factor() -> None:
    request = ContinuousFuturesPreviewRequest(**_preview_payload("back_adjusted"))

    preview = preview_continuous_futures(request)

    tx_bar = next(bar for bar in preview.adjusted_research_bars if bar.source_symbol == "TX")
    mtx_bar = next(bar for bar in preview.adjusted_research_bars if bar.source_symbol == "MTX")
    assert tx_bar.adjustment_applied is True
    assert tx_bar.open == 19987.5
    assert tx_bar.close == 19997.5
    assert mtx_bar.adjustment_applied is False
    assert mtx_bar.open == 20005


def test_ratio_adjusted_preview_applies_matching_rollover_factor() -> None:
    request = ContinuousFuturesPreviewRequest(**_preview_payload("ratio_adjusted"))

    preview = preview_continuous_futures(request)

    tmf_bar = next(bar for bar in preview.adjusted_research_bars if bar.source_symbol == "TMF")
    assert tmf_bar.adjustment_applied is True
    assert tmf_bar.open == 19999.9968
    assert tmf_bar.execution_eligible is False


def test_continuous_futures_preview_rejects_none_adjustment_method() -> None:
    with pytest.raises(ValidationError):
        ContinuousFuturesPreviewRequest(**_preview_payload("none"))


def test_continuous_futures_api_preview_returns_research_only_response() -> None:
    client = TestClient(app)

    response = client.post("/api/data/continuous-futures/preview", json=_preview_payload())

    assert response.status_code == 200
    payload = response.json()
    assert payload["research_only"] is True
    assert payload["execution_eligible"] is False
    assert payload["summary"]["research_bar_count"] == 3
