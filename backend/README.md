# Backend

FastAPI backend skeleton for the Taifex Quant Trading Platform.

## Responsibilities

- Expose health and manifest endpoints.
- Keep paper trading as the default runtime mode.
- Own API boundaries for future control-plane and trading-plane services.

## Local Commands

```bash
.venv/bin/python -m uvicorn app.main:app --reload
.venv/bin/python -m pytest
.venv/bin/python -m ruff check .
```
