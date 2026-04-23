from fastapi import FastAPI

from app.api.routes import router


def create_app() -> FastAPI:
    app = FastAPI(
        title="Taifex Quant Trading Platform API",
        version="0.1.0",
        description="Paper-first API skeleton for Taiwan Index Futures quantitative trading.",
    )
    app.include_router(router)
    return app


app = create_app()
