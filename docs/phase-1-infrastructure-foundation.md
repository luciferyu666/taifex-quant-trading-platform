# Phase 1: Infrastructure Foundation

## Objective

Prepare local and future cloud infrastructure boundaries while preserving paper-only execution.

## Deliverables

- Docker Compose local stack remains the default local runtime.
- Kubernetes placeholder manifests under `infra/k8s/`.
- Vault placeholder documentation under `infra/vault/`.
- Observability placeholder documentation under `infra/observability/`.
- Roadmap status script.

## Acceptance Criteria

- Placeholder files are clearly labeled non-production.
- No secrets are stored in source.
- `make roadmap-status` reports required roadmap and scaffold files.

## Safety Constraints

- Do not deploy Kubernetes from this repo during Phase 1.
- Do not store tokens or cloud credentials.
- Do not add real broker integrations.

## Suggested Commands

```bash
bash scripts/roadmap-status.sh
make roadmap-status
docker compose config
make check
```

## Next Implementation Notes

Future work can add Helm or Kustomize only after service boundaries and environment policies are stable.
