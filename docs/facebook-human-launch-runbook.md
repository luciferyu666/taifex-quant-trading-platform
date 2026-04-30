# Facebook Human Launch Runbook

## Purpose

This runbook gives the authorized Facebook account owner a concise checklist for manually launching the first Facebook surfaces for the Taifex Quant Trading Platform:

- Facebook Page: `台指期量化交易平台`
- Facebook Group: `台指期量化交易研究社`
- First education post: TX / MTX / TMF exposure conversion

All Facebook public actions must be completed manually by the authorized account owner.

## What Codex Must Not Do

Codex must not:

- automate Facebook browser actions
- create the Page or Group
- publish posts, comments, stories, reels, or livestream announcements
- ask for or store Facebook credentials
- collect broker credentials, API keys, account IDs, certificates, or secrets
- provide investment advice or individualized futures recommendations
- imply live trading readiness, real order submission, broker login, or credential upload
- write copy that promises outcomes, claims alpha, minimizes risk, or presents the platform as production trading ready

Codex may prepare reviewed copy, checklists, and safety gates in this repository only.

## Facebook Page Creation Checklist

Human owner steps:

1. Open Facebook in the browser while logged in as the authorized owner.
2. Create a new Page.
3. Set Page name:

```text
台指期量化交易平台
```

4. Set preferred handle if available:

```text
taifex.quant.platform
```

5. Choose categories:

```text
Software company
Education website
Technology service
```

6. Avoid categories that imply licensed advisory, managed accounts, brokerage, discretionary trading, real account operation, or signal service.
7. Paste the exact Page intro copy below.
8. Set the Page CTA to:

```text
Learn More
```

9. Set CTA target:

```text
https://taifex-quant-trading-platform-websi.vercel.app/zh/
```

10. Do not use CTA labels that imply opening an account, enabling live trading, broker login, or real order submission.

## Exact Page Intro Copy

```text
台指期量化交易平台是一個聚焦 TX / MTX / TMF 研究、資料治理、回測、紙上交易、風險控管、OMS 與稽核流程的技術基礎設施專案。本頁內容僅供教育與產品展示，不構成投資建議。Live trading remains disabled by default.
```

## Facebook Group Creation Checklist

Human owner steps:

1. Create a new Facebook Group.
2. Set Group name:

```text
台指期量化交易研究社
```

3. Set privacy:

```text
Private, visible
```

4. Paste the exact Group description copy below.
5. Add the Group rules below.
6. Add the member questions below.
7. Pin the first safety post after the Group is created.
8. Review join requests daily during the first two weeks.

## Exact Group Description Copy

```text
本社團討論台指期 TX / MTX / TMF 的資料治理、回測、換月、紙上交易、風險控管與量化研究流程。社團不提供投資建議、不進行帳戶操作、不鼓勵實盤跟單。所有產品展示均為 Paper Only / research-only workflow。
```

## Group Rules

1. Educational discussion only.
2. No investment advice or individualized trade recommendations.
3. No profit-promise copy, screenshots used as claims, or signal-selling language.
4. No broker credentials, API keys, certificates, account IDs, or personal financial data.
5. No live order instructions or request for real account operation.
6. Product screenshots must be labeled Paper Only or research-only when order workflow appears.
7. Moderators may remove posts that blur the line between research infrastructure and regulated financial services.

## Member Questions

1. Do you understand that this group does not provide investment advice or live trading instructions?
2. Do you agree not to post profit promises, referral links, broker credentials, account screenshots, or personal financial data?
3. Which topic are you most interested in: data quality, rollover, backtesting, paper trading, risk controls, or Web Command Center demos?

## First Pinned Safety Post

Publish this as the first pinned Page and Group safety post:

```text
歡迎加入台指期量化交易研究社。

這裡討論 TX / MTX / TMF 的資料治理、回測、換月、紙上交易、風險控管、OMS 與量化研究流程。

重要邊界：
- 本社群內容僅供教育與產品展示。
- 本社群不提供投資建議或個別交易建議。
- 目前產品展示均為 Paper Only / research-only workflow。
- 不收 broker credentials、API keys、account IDs、certificates 或任何私密金融資料。
- 不示範實盤下單、不提供券商登入、不建立真實委託。
- ENABLE_LIVE_TRADING=false，Live trading remains disabled by default.

如果你想了解平台功能，請先看 Web Command Center demo 與客戶測試指南。
```

Post checklist:

- [ ] Pin this post to the Page if supported.
- [ ] Pin this post to the Group.
- [ ] Confirm comments do not ask for live order instructions.
- [ ] Remove any comment that shares credentials, account data, or private financial data.

## Week 1 Post 1 Publishing Checklist

Topic:

```text
TX / MTX / TMF exposure conversion
```

Format:

```text
Image teaching post
```

Visual brief:

```text
Three-column card: TX / MTX / TMF, point value, TX-equivalent ratio, and a simple bar scale showing 1 TX = 20 TMF units.
```

Post copy:

```text
台指期不是只有「口數」問題，還有曝險單位問題。

TX / MTX / TMF 的每點價值：
- TX：每點 200 TWD
- MTX：每點 50 TWD
- TMF：每點 10 TWD

換算關係：
- 1 TX = 4 MTX = 20 TMF
- 1 MTX = 5 TMF

如果策略只說「做 1 口」，其實沒有說清楚風險曝險。較穩的方式是先用 TX-equivalent 統一曝險，再由平台轉換成合約組合。

這也是為什麼量化平台需要 Risk Engine 與 OMS 邊界，而不是讓策略直接下單。
```

CTA:

```text
想看更多台指期量化基礎設施筆記，可以追蹤粉專並加入「台指期量化交易研究社」。
```

Required footer:

```text
本內容僅供教育與產品展示，不構成投資建議。平台目前以 Paper Only / research-only workflow 為主，ENABLE_LIVE_TRADING=false，Live trading remains disabled by default.
```

Publish steps:

1. Review the image and confirm no private data appears.
2. Paste the post copy.
3. Paste the CTA.
4. Paste the required footer.
5. Publish first to the Page.
6. Share or repost to the Group after confirming the Page post renders correctly.

## Pre-Publish Compliance Checklist

Before any Facebook public action, confirm:

- [ ] The post is education, infrastructure, or Paper Only demo content.
- [ ] The post does not provide individualized futures trading recommendations.
- [ ] The post does not imply real order submission, broker login, or live trading readiness.
- [ ] The post does not collect credentials, account IDs, certificates, API keys, or private financial data.
- [ ] Product screenshots are labeled Paper Only when order workflow appears.
- [ ] The post includes the required footer.
- [ ] The post does not imply the platform is production trading ready.
- [ ] The post has been checked against `docs/compliance-boundary.md`.

Local repo check before publishing:

```bash
make social-content-check
make facebook-launch-check
```

## Post-Publish Verification Checklist

After publishing:

- [ ] Confirm the Page name is `台指期量化交易平台`.
- [ ] Confirm the Group name is `台指期量化交易研究社`.
- [ ] Confirm Page intro includes `不構成投資建議`.
- [ ] Confirm Group description includes `Paper Only / research-only workflow`.
- [ ] Confirm the pinned safety post is visible.
- [ ] Confirm Week 1 Post 1 includes TX / MTX / TMF point values.
- [ ] Confirm Week 1 Post 1 includes the required safety footer.
- [ ] Confirm CTA does not imply broker login, account opening, real order submission, or live trading approval.
- [ ] Save the Page URL and Group URL into the operating notes outside this repository if they include account-specific metadata.

## Comment Moderation Guidance

Remove or hide comments that request or provide:

- direct buy or sell instructions
- real account operation
- broker credentials, API keys, account IDs, or certificates
- account screenshots with private financial data
- signal-selling or copy-service promotion
- managed account service
- performance guarantees
- spam, referral links, or unrelated solicitation

Safe reply template:

```text
我們目前僅討論研究、資料治理與 Paper Only demo workflow，不提供個別交易建議、跟單服務、帳戶操作或實盤委託操作。若你想了解平台功能，可以先看 Web Command Center demo 與客戶測試指南。
```

Escalate to human review before replying if a comment asks about:

- legal or regulatory status
- broker partnership
- paid signal service
- managed account service
- external capital
- performance-based service
- real account onboarding

## Final Operator Reminder

All Facebook public actions must be completed manually by the authorized account owner.

Live trading remains disabled by default.
