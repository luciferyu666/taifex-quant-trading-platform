#!/usr/bin/env python3
"""Generate a 4-post manual Facebook publishing pack.

This script prepares exactly two Page drafts and two Group drafts for manual
review. It never logs in to Facebook, never calls Facebook APIs, never opens a
browser, and never publishes posts.
"""

from __future__ import annotations

import csv
from datetime import date
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse


REPO_ROOT = Path(__file__).resolve().parents[2]
QUEUE_PATH = REPO_ROOT / "data/social/facebook-post-queue.csv"
OUT_DIR = REPO_ROOT / "out/social"
PAGE_URL = "https://www.facebook.com/profile.php?id=61589020471520"
GROUP_URL = "https://www.facebook.com/groups/1323940496297459"


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


def channel_has(row: dict[str, str], token: str) -> bool:
    return token in row.get("channel", "").strip().lower()


def is_web_app_url(row: dict[str, str]) -> bool:
    return "taifex-quant-trading-platform-front.vercel.app" in row.get("url", "")


def is_website_url(row: dict[str, str]) -> bool:
    return "taifex-quant-trading-platform-website" in row.get("url", "")


def is_group_url(row: dict[str, str]) -> bool:
    return "facebook.com/groups/" in row.get("url", "")


def first_matching(
    rows: list[dict[str, str]],
    used_ids: set[str],
    label: str,
    predicate,
) -> dict[str, str]:
    for row in rows:
        if row["id"] not in used_ids and predicate(row):
            used_ids.add(row["id"])
            return row
    raise SystemExit(f"Missing draft row for {label} in data/social/facebook-post-queue.csv")


def select_rows(rows: list[dict[str, str]]) -> list[tuple[str, str, dict[str, str]]]:
    used_ids: set[str] = set()
    page_website = first_matching(
        rows,
        used_ids,
        "Facebook Page website awareness",
        lambda row: channel_has(row, "page") and is_website_url(row),
    )
    page_demo = first_matching(
        rows,
        used_ids,
        "Facebook Page Web App demo conversion",
        lambda row: channel_has(row, "page") and is_web_app_url(row),
    )
    group_discussion = first_matching(
        rows,
        used_ids,
        "Facebook Group discussion or checklist conversion",
        lambda row: channel_has(row, "group") and is_group_url(row),
    )
    group_demo = first_matching(
        rows,
        used_ids,
        "Facebook Group Web App demo conversion",
        lambda row: channel_has(row, "group") and is_web_app_url(row),
    )
    return [
        ("Facebook Page", "Website awareness and positioning", page_website),
        ("Facebook Page", "Web App Interactive Demo start", page_demo),
        ("Facebook Group", "Community discussion and checklist request", group_discussion),
        ("Facebook Group", "Community-to-demo conversion", group_demo),
    ]


def safety_footer(row: dict[str, str]) -> str:
    footer = row.get("compliance_footer", "").strip().rstrip("。")
    required_terms = ["Paper Only", "不構成投資建議", "ENABLE_LIVE_TRADING=false"]
    parts = [part.strip() for part in footer.split("；") if part.strip()]
    for term in required_terms:
        if term not in footer:
            parts.append(term)
    return "；".join(parts) + "。"


def render_post_copy(row: dict[str, str]) -> str:
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
            safety_footer(row),
        ]
    )


def landing_target(row: dict[str, str]) -> str:
    if is_web_app_url(row):
        return "Web App Interactive Demo"
    if is_website_url(row):
        return "Official Website"
    if is_group_url(row):
        return "Facebook Group"
    return "Checklist or manual follow-up"


def conversion_event(row: dict[str, str]) -> str:
    if is_web_app_url(row):
        return "demo_start"
    if is_website_url(row):
        return "website_click"
    if is_group_url(row):
        return "group_comment_or_join"
    return "manual_follow_up"


def click_through_note(row: dict[str, str]) -> str:
    if is_web_app_url(row):
        return "Make the first sentence show that the user can open the browser and run the Paper Only demo immediately."
    if is_website_url(row):
        return "Use the visual to explain the product category before asking the reader to visit the website."
    if is_group_url(row):
        return "Frame this as a research discussion so the comment action feels natural and non-promotional."
    return "Keep one clear action and avoid extra links."


def render_pack(selected: list[tuple[str, str, dict[str, str]]], pack_date: date) -> str:
    lines: list[str] = [
        f"# Facebook 4-Post Manual Publishing Pack - {pack_date.isoformat()}",
        "",
        "This pack is for manual account-owner review and publishing only. It is designed to move readers from Facebook awareness into the official website, Web App Interactive Demo, and moderated community discussion without automated posting.",
        "",
        "Targets:",
        "",
        f"- Facebook Page: {PAGE_URL}",
        f"- Facebook Group: {GROUP_URL}",
        "",
        "## Conversion Design",
        "",
        "- Post 1 uses the Page to explain the product category and drive official website clicks.",
        "- Post 2 uses the Page to send warmed readers directly into the Web App Interactive Demo.",
        "- Post 3 uses the Group to start a research-oriented checklist discussion.",
        "- Post 4 uses the Group to turn discussion into a Paper Only demo start.",
        "- Each post keeps exactly one CTA and one UTM-tagged destination.",
        "- Record published URLs and downstream metrics in `data/social/facebook-published-log.csv`.",
        "",
        "## Non-Automation Boundary",
        "",
        "- Do not auto-post to Facebook.",
        "- Do not use bots.",
        "- Do not scrape Facebook.",
        "- Do not ask for or store Facebook credentials, cookies, sessions, tokens, or passwords.",
        "- Do not mass-spam groups.",
        "- Manual review is required before every post.",
        "",
        "## Compliance Checklist",
        "",
        "- [ ] Exactly one CTA per post.",
        "- [ ] Paper Only appears where product/demo workflow is discussed.",
        "- [ ] 不構成投資建議 appears where product/demo workflow is discussed.",
        "- [ ] ENABLE_LIVE_TRADING=false remains true.",
        "- [ ] No broker credentials, no real order, no live trading, no investment advice.",
        "- [ ] Group posts are discussion-oriented and suitable for the owned Group.",
        "- [ ] Landing link matches the post objective and opens the expected destination.",
        "- [ ] Link preview, visual, and first sentence reinforce the same action.",
        "",
    ]

    for index, (target, objective, row) in enumerate(selected, start=1):
        tagged_url = add_utm(
            row["url"],
            row.get("utm_campaign", "fb_growth_30d"),
            row.get("utm_content", row["id"]),
        )
        lines.extend(
            [
                f"## Post {index}: {target} - {row['id']}",
                "",
                f"- Title: {row['title']}",
                f"- Pillar: {row['pillar']}",
                f"- Channel recommendation: {row['channel']}",
                f"- Conversion objective: {objective}",
                f"- Landing target: {landing_target(row)}",
                f"- Primary conversion event: {conversion_event(row)}",
                f"- Visual suggestion: {row['visual_brief']}",
                f"- UTM-tagged URL: {tagged_url}",
                f"- Click-through note: {click_through_note(row)}",
                "",
                "### Copy-Paste Draft",
                "",
                "```text",
                render_post_copy(row),
                "```",
                "",
                "### Manual Publish Checklist",
                "",
                "- [ ] Review copy against compliance checklist.",
                "- [ ] Confirm target page/group manually.",
                "- [ ] Confirm link preview and visual match the conversion objective.",
                "- [ ] Publish from the authorized account owner only.",
                "- [ ] Record published URL in `data/social/facebook-published-log.csv`.",
                "- [ ] After publishing, track reach, link clicks, comments, and demo starts if available.",
                "",
            ]
        )

    lines.extend(
        [
            "## Final Reminder",
            "",
            "Do not auto-post to Facebook. The account owner must manually review and publish all four posts.",
            "Live trading remains disabled by default.",
            "",
        ]
    )
    return "\n".join(lines)


def main() -> None:
    rows = read_draft_rows()
    selected = select_rows(rows)
    today = date.today()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUT_DIR / f"facebook-4-post-manual-pack-{today.isoformat()}.md"
    output_path.write_text(render_pack(selected, today), encoding="utf-8")
    print(output_path.relative_to(REPO_ROOT))


if __name__ == "__main__":
    main()
