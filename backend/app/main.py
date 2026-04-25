from fastapi import FastAPI

from app.api.architecture_routes import router as architecture_router
from app.api.roadmap_routes import router as roadmap_router
from app.api.routes import router


def create_app() -> FastAPI:
    app = FastAPI(
        title="Taifex Quant Trading Platform API",
        version="0.1.0",
        description="Paper-first API skeleton for Taiwan Index Futures quantitative trading.",
    )
    app.include_router(router)
    app.include_router(roadmap_router)
    app.include_router(architecture_router)
    return app


app = create_app()
