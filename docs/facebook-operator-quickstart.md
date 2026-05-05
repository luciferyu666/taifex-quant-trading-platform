# Facebook Operator Quickstart

## 1. 10-Minute Morning Workflow

1. Run safety check.
2. Generate today's post pack.
3. Open the manual Facebook workspace.
4. Review each post and CTA.
5. Publish manually from the authorized account.
6. Record published URLs.

## 2. Generate Today's Pack

```bash
make social-daily-pack
```

Open the generated file under:

```text
out/social/
```

## 3. Open Facebook Workspace

```bash
make social-open
```

This only opens or prints URLs. It does not log in, click, submit, publish, scrape, or automate Facebook.

## 4. Review And Publish Manually

For each post:

- confirm one CTA
- confirm Paper Only or education framing
- confirm 不構成投資建議 where product/demo appears
- confirm no broker credentials, no live trading, no real order language
- publish manually to the Page or Group

## 5. Log Published URLs

Update:

```text
data/social/facebook-published-log.csv
```

## 6. Reply To Comments Safely

Use safe educational replies. Do not provide personalized trading advice, account operation help, broker login guidance, or credential handling.

## 7. End-Of-Day Metrics Update

Record:

- impressions
- reach
- reactions
- comments
- shares
- link_clicks
- demo_starts
- demo_completes
- notes

Recommended commands:

```bash
make social-content-check
make social-daily-pack
make social-growth-status
```

Live trading remains disabled by default.
