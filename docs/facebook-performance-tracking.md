# Facebook Performance Tracking

## 1. Metrics Overview

Track awareness, education, demo activation, community conversion, and customer feedback. Do not track or promote trading results.

## 2. Daily Metrics

- impressions
- reach
- reactions
- comments
- shares
- link clicks
- Web App sessions
- demo_start
- demo_complete
- evidence_copy

## 3. Weekly Metrics

- group_join
- waitlist_signup
- demo_request
- post conversion rate
- qualified comments
- repeated questions
- safety boundary questions
- out-of-scope broker/live requests

## 4. Post-Level Tracking Fields

Use `data/social/facebook-published-log.csv`:

- date
- time
- channel
- post_id
- title
- published_url
- impressions
- reach
- reactions
- comments
- shares
- link_clicks
- demo_starts
- demo_completes
- notes

## 5. UTM Naming Convention

```text
utm_source=facebook
utm_medium=social
utm_campaign=fb_growth_30d
utm_content=<post_id>
```

## 6. Facebook Page Metrics

Use Page metrics to evaluate public awareness and traffic quality:

- impressions
- reach
- link clicks
- saves
- comments with product questions

## 7. Facebook Group Metrics

Use Group metrics to evaluate retention and learning:

- group_join
- post comments
- poll answers
- accepted research-task participation
- safety boundary questions

## 8. Web App Demo Metrics

When analytics are available, track:

- Web App sessions
- demo_start
- demo_complete
- evidence_copy
- CTA clicks to Group or website

Until analytics are implemented, use link clicks, comments, and manually reported evidence JSON as proxies.

## 9. Conversion Metrics

- post conversion rate = link clicks / reach
- demo completion rate = demo_complete / demo_start
- evidence copy rate = evidence_copy / demo_start
- community conversion = group_join / Web App sessions
- qualified demo request rate = demo_request / link clicks

## 10. Weekly Review Ritual

1. Export or record top posts.
2. Compare Page vs Group performance.
3. Identify the top CTA.
4. Identify the top content pillar.
5. Classify comments into feedback categories.
6. Update next week's queue.
7. Remove unclear or risky wording.

## 11. Decision Rules

- If education posts drive more link clicks, expand that pillar.
- If demo posts drive more evidence copies, produce short demo clips.
- If comments show confusion, add guided learning content.
- If live trading or credential questions increase, publish safety boundary reminders.
- If a third-party group produces low-quality engagement, stop posting there.

All tracked content must preserve Paper Only, 不構成投資建議, and ENABLE_LIVE_TRADING=false.
