# Local Development

## Setup

```bash
bash scripts/bootstrap.sh
make check
```

The bootstrap script is idempotent. It copies `.env.example` to `.env` only when `.env` does not already exist, creates `backend/.venv` when needed, installs backend dependencies, and installs frontend dependencies when `npm` is available.

## VS Code Dev Container

Open the repository in VS Code and choose **Reopen in Container**. The Dev Container provides Python 3.12, Node.js LTS, Git, Make, and Docker CLI integration when the host supports Docker.

The Dev Container runs:

```bash
bash scripts/bootstrap.sh
```

after creation.

## Docker Compose

Use Docker Compose for local infrastructure and full-stack runs:

```bash
make infra
make dev
```

If Docker is unavailable in WSL, enable Docker Desktop WSL integration and rerun the command.

## Ports

- Frontend: `3000`
- Backend: `8000`
- PostgreSQL: `5432`
- Redis: `6379`
- ClickHouse HTTP: `8123`

## Local URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Health: http://localhost:8000/health
- Manifest: http://localhost:8000/api/system/manifest
- Risk config: http://localhost:8000/api/risk/config

## Commands

```bash
make init
make infra
make backend
make frontend
make dev
make check
```
