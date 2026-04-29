#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sqlite3
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.parse import quote


REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPO_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.core.config import get_settings  # noqa: E402


class EvidenceExportError(Exception):
    def __init__(self, message: str, exit_code: int = 1) -> None:
        super().__init__(message)
        self.exit_code = exit_code


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Export local Paper Only demo evidence from the paper execution SQLite "
            "audit store. This command is read-only and never uploads data."
        )
    )
    parser.add_argument(
        "--db-path",
        help="Local SQLite paper execution audit database path. Defaults to settings.",
    )
    parser.add_argument(
        "--workflow-run-id",
        help="Specific paper workflow_run_id to export. Defaults to latest run.",
    )
    parser.add_argument(
        "--format",
        choices=("json", "markdown"),
        default="json",
        help="Output format. Defaults to json.",
    )
    parser.add_argument(
        "--output",
        help="Optional local output path. Only .json or .md matching --format is allowed.",
    )
    args = parser.parse_args()

    try:
        settings = get_settings()
    except Exception as exc:
        print(
            f"Refusing to export evidence because settings are invalid: {exc}",
            file=sys.stderr,
        )
        return 2

    if (
        settings.trading_mode != "paper"
        or settings.enable_live_trading
        or settings.broker_provider != "paper"
    ):
        print(
            "Refusing to export evidence because runtime settings are not paper-only.",
            file=sys.stderr,
        )
        return 2

    try:
        db_path = resolve_local_path(args.db_path or settings.paper_execution_audit_db_path)
        output_path = resolve_output_path(args.output, args.format) if args.output else None
        evidence = build_evidence(
            db_path=db_path,
            workflow_run_id=args.workflow_run_id,
            export_persisted=output_path is not None,
        )
        validate_evidence_safety(evidence)
    except EvidenceExportError as exc:
        print(str(exc), file=sys.stderr)
        return exc.exit_code

    content = (
        json.dumps(evidence, ensure_ascii=False, indent=2, sort_keys=True)
        if args.format == "json"
        else render_markdown(evidence)
    )

    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(content + "\n", encoding="utf-8")
        print("Paper demo evidence exported.")
        print(f"output={output_path}")
        print(f"workflow_run_id={evidence['workflow_run_id']}")
        print(f"order_id={evidence['order_id']}")
        print("paper_only=True")
        print("live_trading_enabled=False")
        print("broker_api_called=False")
    else:
        print(content)
    return 0


def resolve_local_path(path_value: str) -> Path:
    if "://" in path_value:
        raise EvidenceExportError("Only local SQLite file paths are supported.", 2)
    path = Path(path_value)
    if not path.is_absolute():
        path = REPO_ROOT / path
    return path


def resolve_output_path(path_value: str, output_format: str) -> Path:
    path = resolve_local_path(path_value)
    expected_suffix = ".json" if output_format == "json" else ".md"
    if path.suffix.lower() != expected_suffix:
        raise EvidenceExportError(
            f"--output must end with {expected_suffix} when --format={output_format}.",
            2,
        )
    return path


def build_evidence(
    *,
    db_path: Path,
    workflow_run_id: str | None,
    export_persisted: bool,
) -> dict[str, Any]:
    if not db_path.exists():
        raise EvidenceExportError(
            f"No paper workflow records found at {db_path}. "
            "Run: make seed-paper-execution-demo"
        )

    with connect_readonly(db_path) as connection:
        run = select_run(connection, workflow_run_id)
        if run is None:
            detail = f"workflow_run_id={workflow_run_id}" if workflow_run_id else "latest run"
            raise EvidenceExportError(
                f"No paper workflow record found for {detail}. "
                "Run: make seed-paper-execution-demo"
            )

        approval_request = select_approval_request(connection, run["approval_id"])
        decisions = select_approval_decisions(connection, run["approval_id"])
        oms_events = select_oms_events(connection, run["workflow_run_id"])
        audit_events = select_audit_events(connection, run["workflow_run_id"])

    safety_flags = {
        "paper_only": bool_from_row(run, "paper_only"),
        "live_trading_enabled": bool_from_row(run, "live_trading_enabled"),
        "broker_api_called": bool_from_row(run, "broker_api_called"),
        "paper_broker_gateway_called": bool_from_row(
            run,
            "paper_broker_gateway_called",
        ),
        "local_sqlite_only": True,
        "external_db_written": False,
        "broker_credentials_collected": False,
        "real_order_created": False,
        "approval_for_live": False,
        "investment_advice": False,
    }

    return {
        "evidence_type": "paper_demo_evidence",
        "generated_at": datetime.now(UTC).isoformat(),
        "workflow_run_id": run["workflow_run_id"],
        "approval_request_id": run["approval_id"],
        "approval_request": approval_request,
        "reviewer_decisions": decisions,
        "order_id": run["order_id"],
        "final_oms_status": run["final_oms_status"],
        "source_signal_id": run["source_signal_id"],
        "strategy_id": run["strategy_id"],
        "strategy_version": run["strategy_version"],
        "persisted_at": run["persisted_at"],
        "oms_event_count": len(oms_events),
        "audit_event_count": len(audit_events),
        "oms_events": oms_events,
        "audit_events": audit_events,
        "safety_flags": safety_flags,
        "local_sqlite_path": str(db_path),
        "export_persisted": export_persisted,
        "warnings": [
            "This evidence is for Paper Only customer demo review.",
            "Local SQLite is not a production WORM ledger.",
            "This evidence is not investment advice and not live trading approval.",
        ],
    }


def connect_readonly(db_path: Path) -> sqlite3.Connection:
    uri_path = quote(str(db_path.resolve()), safe="/:")
    connection = sqlite3.connect(f"file:{uri_path}?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    return connection


def select_run(
    connection: sqlite3.Connection,
    workflow_run_id: str | None,
) -> sqlite3.Row | None:
    try:
        if workflow_run_id:
            return connection.execute(
                """
                SELECT * FROM paper_execution_runs
                WHERE workflow_run_id = ?
                """,
                (workflow_run_id,),
            ).fetchone()
        return connection.execute(
            """
            SELECT * FROM paper_execution_runs
            ORDER BY persisted_at DESC
            LIMIT 1
            """
        ).fetchone()
    except sqlite3.OperationalError as exc:
        raise EvidenceExportError(
            "Paper execution tables are missing. Run: make seed-paper-execution-demo"
        ) from exc


def select_approval_request(
    connection: sqlite3.Connection,
    approval_request_id: str,
) -> dict[str, Any] | None:
    try:
        row = connection.execute(
            """
            SELECT * FROM paper_approval_requests
            WHERE approval_request_id = ?
            """,
            (approval_request_id,),
        ).fetchone()
    except sqlite3.OperationalError:
        return None
    if row is None:
        return None
    return {
        "approval_request_id": row["approval_request_id"],
        "signal_id": row["signal_id"],
        "strategy_id": row["strategy_id"],
        "strategy_version": row["strategy_version"],
        "requested_action": row["requested_action"],
        "requester_id": row["requester_id"],
        "request_reason": row["request_reason"],
        "created_at": row["created_at"],
        "paper_only": bool_from_row(row, "paper_only"),
        "approval_for_live": bool_from_row(row, "approval_for_live"),
        "live_execution_eligible": bool_from_row(row, "live_execution_eligible"),
        "broker_api_called": bool_from_row(row, "broker_api_called"),
        "request_hash": row["request_hash"],
    }


def select_approval_decisions(
    connection: sqlite3.Connection,
    approval_request_id: str,
) -> list[dict[str, Any]]:
    try:
        rows = connection.execute(
            """
            SELECT * FROM paper_approval_decisions
            WHERE approval_request_id = ?
            ORDER BY sequence
            """,
            (approval_request_id,),
        ).fetchall()
    except sqlite3.OperationalError:
        return []
    return [
        {
            "approval_decision_id": row["approval_decision_id"],
            "approval_request_id": row["approval_request_id"],
            "sequence": row["sequence"],
            "decision": row["decision"],
            "reviewer_id": row["reviewer_id"],
            "reviewer_role": row["reviewer_role"],
            "decision_reason": row["decision_reason"],
            "decided_at": row["decided_at"],
            "paper_only": bool_from_row(row, "paper_only"),
            "approval_for_live": bool_from_row(row, "approval_for_live"),
            "broker_api_called": bool_from_row(row, "broker_api_called"),
            "previous_chain_hash": row["previous_chain_hash"],
            "decision_hash": row["decision_hash"],
        }
        for row in rows
    ]


def select_oms_events(
    connection: sqlite3.Connection,
    workflow_run_id: str,
) -> list[dict[str, Any]]:
    rows = connection.execute(
        """
        SELECT * FROM paper_oms_events
        WHERE workflow_run_id = ?
        ORDER BY sequence
        """,
        (workflow_run_id,),
    ).fetchall()
    return [
        {
            "event_id": row["event_id"],
            "sequence": row["sequence"],
            "event_type": row["event_type"],
            "status_after": row["status_after"],
            "timestamp": row["timestamp"],
            "reason": row["reason"],
        }
        for row in rows
    ]


def select_audit_events(
    connection: sqlite3.Connection,
    workflow_run_id: str,
) -> list[dict[str, Any]]:
    rows = connection.execute(
        """
        SELECT * FROM paper_audit_events
        WHERE workflow_run_id = ?
        ORDER BY timestamp, audit_id
        """,
        (workflow_run_id,),
    ).fetchall()
    return [
        {
            "audit_id": row["audit_id"],
            "actor": row["actor"],
            "action": row["action"],
            "resource": row["resource"],
            "timestamp": row["timestamp"],
            "paper_only": bool_from_row(row, "paper_only"),
        }
        for row in rows
    ]


def validate_evidence_safety(evidence: dict[str, Any]) -> None:
    flags = evidence["safety_flags"]
    if not flags["paper_only"]:
        raise EvidenceExportError("Refusing to export evidence for a non-paper run.", 3)
    if flags["live_trading_enabled"]:
        raise EvidenceExportError("Refusing to export evidence with live trading enabled.", 3)
    if flags["broker_api_called"]:
        raise EvidenceExportError("Refusing to export evidence with broker API calls.", 3)
    request = evidence.get("approval_request")
    if request is not None:
        if (
            not request["paper_only"]
            or request["approval_for_live"]
            or request["live_execution_eligible"]
            or request["broker_api_called"]
        ):
            raise EvidenceExportError(
                "Refusing to export evidence with unsafe approval request flags.",
                3,
            )
    for decision in evidence["reviewer_decisions"]:
        if (
            not decision["paper_only"]
            or decision["approval_for_live"]
            or decision["broker_api_called"]
        ):
            raise EvidenceExportError(
                "Refusing to export evidence with unsafe reviewer decision flags.",
                3,
            )
    for audit_event in evidence["audit_events"]:
        if not audit_event["paper_only"]:
            raise EvidenceExportError(
                "Refusing to export evidence with non-paper audit events.",
                3,
            )


def render_markdown(evidence: dict[str, Any]) -> str:
    decisions = "\n".join(
        (
            f"- {decision['sequence']}. {decision['decision']} by "
            f"{decision['reviewer_id']} ({decision['reviewer_role']}) "
            f"at {decision['decided_at']}"
        )
        for decision in evidence["reviewer_decisions"]
    )
    warnings = "\n".join(f"- {warning}" for warning in evidence["warnings"])
    flags = "\n".join(
        f"- {key}: {value}" for key, value in evidence["safety_flags"].items()
    )
    return f"""# Paper Demo Evidence

- Generated at: {evidence['generated_at']}
- Workflow run ID: {evidence['workflow_run_id']}
- Approval request ID: {evidence['approval_request_id']}
- Order ID: {evidence['order_id']}
- Final OMS status: {evidence['final_oms_status']}
- OMS event count: {evidence['oms_event_count']}
- Audit event count: {evidence['audit_event_count']}
- Local SQLite path: {evidence['local_sqlite_path']}

## Reviewer Decisions

{decisions or '- None recorded'}

## Safety Flags

{flags}

## Warnings

{warnings}
"""


def bool_from_row(row: sqlite3.Row, key: str) -> bool:
    return bool(row[key])


if __name__ == "__main__":
    raise SystemExit(main())
