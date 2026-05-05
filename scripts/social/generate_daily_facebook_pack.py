#!/usr/bin/env python3
"""Generate a manual Facebook daily publishing pack.

This script prepares copy-paste assets only. It never logs in to Facebook,
never calls Facebook APIs, never opens a browser, and never publishes posts.
"""

from __future__ import annotations

import csv
from datetime import date
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse


REPO_ROOT = Path(__file__).resolve().parents[2]
QUEUE_PATH = REPO_ROOT / "data/social/facebook-post-queue.csv"
OUT_DIR = REPO_ROOT / "out/social"
DEFAULT_LIMIT = 6


def add_utm(url: str, campaign: str, content: str) -> str:
    parsed = urlparse(url)
    query = dict(parse_qsl(parsed.query, keep_blank_values=True))
    query.update(
        {
            "utm_source": "facebook",
            "utm_medium": "social",
            "utm_campaign": campaign or "fb_growth_30d",
            "utm_content": content,
        }
    )
    return urlunparse(parsed._replace(query=urlencode(query, doseq=True)))


def read_draft_rows() -> list[dict[str, str]]:
    if not QUEUE_PATH.exists():
        raise SystemExit(f"Missing queue: {QUEUE_PATH}")
    with QUEUE_PATH.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    return [row for row in rows if row.get("status", "").strip().lower() == "draft"]


def build_post_copy(row: dict[str, str]) -> str:
    tagged_url = add_utm(
        row["url"],
        row.get("utm_campaign", "fb_growth_30d"),
        row.get("utm_content", row["id"]),
    )
    return "\n".join(
        [
            row["hook"],
            "",
            row["body"],
            "",
            f"CTA：{row['cta']}",
            tagged_url,
            "",
            row["compliance_footer"],
        ]
    )


def render_pack(rows: list[dict[str, str]], pack_date: date) -> str:
    lines: list[str] = [
        f"# Facebook Daily Publishing Pack - {pack_date.isoformat()}",
        "",
        "Do not auto-post to Facebook. Manual review and publishing only.",
        "",
        "## Compliance Checklist",
        "",
        "- [ ] One CTA only.",
        "- [ ] Paper Only / 不構成投資建議 boundary is visible where relevant.",
        "- [ ] ENABLE_LIVE_TRADING=false remains true.",
        "- [ ] No broker credentials, no real order, no live trading, no investment advice.",
        "- [ ] Third-party group rules were reviewed manually before posting.",
        "",
        "## Manual Publishing Checklist",
        "",
        "- [ ] Open Facebook Page manually.",
        "- [ ] Open Facebook Group manually.",
        "- [ ] Adapt copy before any approved external group post.",
        "- [ ] Publish manually from the authorized account owner only.",
        "- [ ] Record published URL in `data/social/facebook-published-log.csv`.",
        "",
    ]

    for index, row in enumerate(rows, start=1):
        tagged_url = add_utm(
            row["url"],
            row.get("utm_campaign", "fb_growth_30d"),
            row.get("utm_content", row["id"]),
        )
        lines.extend(
            [
                f"## Post {index}: {row['id']} - {row['title']}",
                "",
                f"- Channel recommendation: {row['channel']}",
                f"- Pillar: {row['pillar']}",
                f"- Visual suggestion: {row['visual_brief']}",
                f"- UTM-tagged URL: {tagged_url}",
                "",
                "### Copy-Paste Draft",
                "",
                "```text",
                build_post_copy(row),
                "```",
                "",
            ]
        )

    lines.extend(
        [
            "## Warning",
            "",
            "Do not auto-post to Facebook. Do not use bots. Do not mass-spam groups.",
            "The account owner must manually review and publish every post.",
            "Live trading remains disabled by default.",
            "",
        ]
    )
    return "\n".join(lines)


def main() -> None:
    rows = read_draft_rows()
    selected = rows[:DEFAULT_LIMIT]
    if not selected:
        raise SystemExit("No draft Facebook posts found in queue.")

    today = date.today()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUT_DIR / f"facebook-daily-pack-{today.isoformat()}.md"
    output_path.write_text(render_pack(selected, today), encoding="utf-8")
    print(output_path.relative_to(REPO_ROOT))


if __name__ == "__main__":
    main()
