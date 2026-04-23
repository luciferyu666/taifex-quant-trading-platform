# Local Runbook

## Start Local Dependencies

```bash
make infra
```

## Start the Backend

```bash
make backend
```

Backend health is available at:

```text
http://localhost:8000/health
```

## Start the Frontend

```bash
make frontend
```

Frontend is available at:

```text
http://localhost:3000
```

## Start Full Stack with Docker Compose

```bash
make dev
```

## Stop Docker Compose Services

```bash
docker compose down
```

## Reset Local Volumes

This removes local database and ClickHouse volumes. Use it only for local development resets.

```bash
docker compose down -v
```

## Troubleshooting

- If `backend/.venv/bin/python` is missing, run `bash scripts/bootstrap.sh`.
- If backend import errors occur, run `cd backend && .venv/bin/python -m pytest`.
- If frontend checks fail because dependencies are missing, run `cd frontend && npm install`.
- If frontend build fails, run `cd frontend && npm run typecheck && npm run build`.
- If Docker Compose is unavailable, install Docker Desktop or Docker Engine with Compose v2.
- If a port is already in use, stop the existing process or change the exposed port in `docker-compose.yml`.
