# Infrastructure

Purpose: hold future deployment, Kubernetes, observability, and infrastructure-as-code assets.

Current local infrastructure is defined in `docker-compose.yml`:

- PostgreSQL/Timescale-compatible database.
- Redis.
- ClickHouse.
- FastAPI backend.
- Next.js frontend.

## Phase 1 Scaffold

This directory now includes placeholders for future cloud-native deployment planning:

- `k8s/`: non-production Kubernetes placeholder manifests.
- `vault/`: future secrets-management notes.
- `observability/`: future metrics, logs, traces, and audit visibility notes.

Do not deploy these placeholders directly to production. They intentionally do not contain secrets, real broker credentials, or live-trading configuration.
