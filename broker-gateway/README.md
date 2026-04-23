# Broker Gateway

Purpose: isolate all future broker integrations behind a paper-first adapter boundary.

Rules:

- Do not store real credentials in this repository.
- Do not expose broker SDK calls to strategies.
- All future order requests must come from OMS after Risk Engine approval.
- Keep paper broker behavior as the default local implementation.
