# Facebook Daily Publishing SOP

## 1. Purpose

This SOP gives the human operator a repeatable daily workflow for publishing Facebook content that promotes the Web App Interactive Demo and official website while preserving Paper Only, 不構成投資建議, and ENABLE_LIVE_TRADING=false boundaries.

## 2. What Automation Is Not Allowed To Do

- Do not auto-post.
- Do not use bots.
- Do not mass-spam groups.
- Do not scrape Facebook.
- Do not automate login, comments, reactions, sharing, or publishing.
- Do not post in groups where promotional posts are prohibited.
- Manual review is required before every post.
- Do not collect Facebook credentials, broker credentials, API keys, account IDs, certificates, or secrets.

## 3. Before Posting Checklist

- [ ] Run `make social-content-check`.
- [ ] Generate the daily pack with `make social-daily-pack`.
- [ ] Confirm the post has exactly one CTA.
- [ ] Confirm Demo posts say Paper Only or 不構成投資建議.
- [ ] Confirm no individualized trading instruction appears.
- [ ] Confirm no real broker, real order, credential, or live trading claim appears.
- [ ] Confirm `ENABLE_LIVE_TRADING=false` remains in the footer when relevant.

## 4. Open Chrome Developer Browser Workflow

Open the browser manually. If the operator wants a convenience URL list, run:

```bash
make social-open
```

This opens or prints URLs only. It does not log in, click, submit, scrape, or publish.

## 5. Open Target Facebook Page

Open:

```text
https://www.facebook.com/profile.php?id=61589020471520
```

Confirm you are using the authorized account owner profile. Do not share credentials with the repo or with Codex.

## 6. Open Target Facebook Group

Open:

```text
https://www.facebook.com/groups/1323940496297459
```

Confirm the post is suitable for the Group and discussion-focused.

## 7. Open Related Topic Groups

For each external group:

1. Read group rules manually.
2. Confirm educational posts are allowed.
3. Confirm promotional links are allowed before adding links.
4. Adapt the copy to the group's topic.
5. Do not post if rules are unclear.

## 8. Copy Post From Daily Queue

Open the generated file:

```text
out/social/facebook-daily-pack-YYYY-MM-DD.md
```

Copy one post at a time. Do not publish duplicate text across Page, Group, and related groups.

## 9. Review Compliance Checklist

Before publishing, verify:

- Paper Only boundary is clear.
- 不構成投資建議 appears in the footer for demo or product posts.
- No futures recommendation or trade instruction appears.
- No managed account, signal service, or copy trading claim appears.
- No profit promise appears.
- No credential collection appears.

## 10. Add UTM-Tagged Link

Use the UTM link generated in the daily pack. If editing manually, use:

```text
utm_source=facebook
utm_medium=social
utm_campaign=fb_growth_30d
utm_content=<post_id>
```

## 11. Publish To Page

Use the Page for public education, product demo clips, short value explanations, and website/Web App routing.

## 12. Publish To Own Group

Adapt the post into a discussion prompt. Prefer questions, polls, research tasks, and feedback requests.

## 13. Adapt Copy Before Posting To Approved External Groups

Do not paste the same content. Adjust:

- hook
- body
- CTA
- visual
- link usage

If the group disallows promotion, publish education without links or do not post.

## 14. Record Published URL

After publishing, record:

- date
- time
- channel
- post_id
- title
- published_url
- notes

Use:

```text
data/social/facebook-published-log.csv
```

## 15. Reply To Comments

Safe reply pattern:

```text
這裡只討論研究、教育與系統開發流程，不提供投資建議或個別交易判斷。你可以先用 Web App 的 Browser-only Demo 了解 Paper Only 流程。
```

## 16. Handle Investment-Advice Questions

If someone asks what to trade, whether to enter/exit, or how much to size:

1. Do not answer the trading question.
2. Restate the boundary.
3. Redirect to education or demo workflow.
4. Remove comments that request credentials, account operation, or unsafe instructions.

## 17. Daily Wrap-Up

- [ ] Update published log.
- [ ] Note best comments.
- [ ] Capture unclear UX questions.
- [ ] Record requests that mention broker/live/credentials as out-of-scope.
- [ ] Add follow-up content ideas to the queue.

## 18. Weekly Review

Review metrics and decide:

- which pillars drove Web App clicks
- which posts generated qualified comments
- which CTA worked best
- which topics need clearer educational copy
- whether unsafe questions increased

## 19. Emergency Takedown Process

Remove or edit a post if it:

- is interpreted as investment advice
- appears in a group where promotion is prohibited
- contains private data
- attracts unsafe credential or live-trading requests
- uses unclear wording that could be mistaken for production trading readiness

Manual review and publishing only. Live trading remains disabled by default.
