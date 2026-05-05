#!/usr/bin/env python3
"""Compliance guard for Facebook growth operations assets."""

from __future__ import annotations

import csv
import re
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]

DOC_FILES = [
    "docs/facebook-growth-ops-strategy.md",
    "docs/facebook-daily-publishing-sop.md",
    "docs/facebook-content-pillars.md",
    "docs/facebook-30-day-content-queue.md",
    "docs/facebook-daily-post-template.md",
    "docs/facebook-growth-loop-playbook.md",
    "docs/facebook-posting-compliance-checklist.md",
    "docs/facebook-performance-tracking.md",
]
QUEUE_FILE = "data/social/facebook-post-queue.csv"

REQUIRED_SAFE_TERMS = ["Paper Only", "不構成投資建議", "ENABLE_LIVE_TRADING=false"]
HIGH_RISK_TERMS = [
    "guaranteed profit",
    "risk-free",
    "fully automated money machine",
    "guaranteed alpha",
    "principal guaranteed",
    "no loss",
    "we trade for you",
    "copy our signals for profit",
    "保證獲利",
    "穩賺",
    "零風險",
    "自動賺錢",
    "跟單獲利",
    "代操",
    "本金保證",
    "不會虧損",
]
UNSAFE_CONCEPT_PATTERNS = [
    r"\binvestment advice\b",
    r"\bcopy trading\b",
    r"\bmanaged account",
    r"\blive trading enabled\b",
    r"\breal order submission\b",
    r"個別交易建議",
    r"實盤啟用",
    r"真實委託",
]

ALLOWED_SECTION_MARKERS = [
    "prohibited",
    "not allowed",
    "do not",
    "what automation is not allowed",
    "compliance",
    "guardrails",
    "boundary",
    "takedown",
    "emergency",
    "禁止",
    "不允許",
    "不得",
    "邊界",
    "合規",
    "風控",
    "下架",
]
NEGATIVE_CONTEXT_MARKERS = [
    "do not",
    "does not",
    "must not",
    "not ",
    "never",
    "avoid",
    "prohibited",
    "forbidden",
    "不",
    "不得",
    "禁止",
    "避免",
    "不是",
    "不提供",
    "不宣稱",
    "不允許",
]


def fail(message: str) -> None:
    print(message, file=sys.stderr)
    raise SystemExit(1)


def path(relative: str) -> Path:
    return REPO_ROOT / relative


def heading_allows(heading: str) -> bool:
    normalized = heading.lower()
    return any(marker in normalized for marker in ALLOWED_SECTION_MARKERS)


def line_has_negative_context(line: str) -> bool:
    normalized = line.lower()
    return any(marker in normalized for marker in NEGATIVE_CONTEXT_MARKERS)


def check_required_files() -> None:
    for relative in DOC_FILES + [QUEUE_FILE]:
        if not path(relative).exists():
            fail(f"Missing required Facebook growth file: {relative}")


def check_safe_terms() -> None:
    operational_docs = [
        "docs/facebook-growth-ops-strategy.md",
        "docs/facebook-daily-publishing-sop.md",
        "docs/facebook-content-pillars.md",
        "docs/facebook-posting-compliance-checklist.md",
    ]
    combined = "\n".join(path(relative).read_text(encoding="utf-8") for relative in operational_docs)
    for term in REQUIRED_SAFE_TERMS:
        if term not in combined:
            fail(f"Required safe term missing from Facebook operational docs: {term}")


def check_doc_high_risk_terms() -> None:
    for relative in DOC_FILES:
        current_heading = ""
        for line_number, line in enumerate(path(relative).read_text(encoding="utf-8").splitlines(), start=1):
            if line.lstrip().startswith("#"):
                current_heading = line.strip("# ").strip()
            normalized = line.lower()
            for term in HIGH_RISK_TERMS:
                if term.lower() in normalized:
                    if not (heading_allows(current_heading) or line_has_negative_context(line)):
                        fail(f"Unsafe wording outside allowed section: {relative}:{line_number}: {term}")
            for pattern in UNSAFE_CONCEPT_PATTERNS:
                if re.search(pattern, line, flags=re.IGNORECASE) and not (
                    heading_allows(current_heading) or line_has_negative_context(line)
                ):
                    fail(f"Unsafe concept without negative boundary: {relative}:{line_number}: {pattern}")


def check_queue_copy() -> None:
    with path(QUEUE_FILE).open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            searchable = " ".join(row.get(field, "") for field in row.keys())
            normalized = searchable.lower()
            for term in HIGH_RISK_TERMS:
                if term.lower() in normalized:
                    fail(f"Unsafe wording in queue row {row.get('id', '<missing id>')}: {term}")
            for pattern in UNSAFE_CONCEPT_PATTERNS:
                if re.search(pattern, searchable, flags=re.IGNORECASE) and not line_has_negative_context(searchable):
                    fail(f"Unsafe concept in queue row {row.get('id', '<missing id>')}: {pattern}")
            if "Paper" in searchable or "Demo" in searchable or "demo" in searchable:
                if "不構成投資建議" not in searchable and "Paper Only" not in searchable:
                    fail(f"Demo-related queue row lacks safety footer: {row.get('id', '<missing id>')}")


def main() -> None:
    check_required_files()
    check_safe_terms()
    check_doc_high_risk_terms()
    check_queue_copy()
    print("Facebook social content guard passed.")


if __name__ == "__main__":
    main()
