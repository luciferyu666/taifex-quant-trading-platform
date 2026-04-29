from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.architecture_routes import router as architecture_router
from app.api.backtest_artifact_comparison_routes import (
    router as backtest_artifact_comparison_router,
)
from app.api.backtest_artifact_index_routes import router as backtest_artifact_index_router
from app.api.backtest_artifact_routes import router as backtest_artifact_router
from app.api.backtest_preview_routes import router as backtest_preview_router
from app.api.backtest_research_bundle_index_routes import (
    router as backtest_research_bundle_index_router,
)
from app.api.backtest_research_bundle_routes import (
    router as backtest_research_bundle_router,
)
from app.api.backtest_result_routes import router as backtest_result_router
from app.api.continuous_futures_routes import router as continuous_futures_router
from app.api.data_routes import router as data_router
from app.api.data_version_routes import router as data_version_router
from app.api.feature_manifest_routes import router as feature_manifest_router
from app.api.paper_execution_routes import router as paper_execution_router
from app.api.release_baseline_routes import router as release_baseline_router
from app.api.research_review_decision_index_routes import (
    router as research_review_decision_index_router,
)
from app.api.research_review_decision_routes import (
    router as research_review_decision_router,
)
from app.api.research_review_packet_routes import (
    router as research_review_packet_router,
)
from app.api.research_review_queue_routes import router as research_review_queue_router
from app.api.roadmap_routes import router as roadmap_router
from app.api.routes import router
from app.api.strategy_research_routes import router as strategy_research_router
from app.api.toy_backtest_routes import router as toy_backtest_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="Taifex Quant Trading Platform API",
        version="0.1.0",
        description="Paper-first API skeleton for Taiwan Index Futures quantitative trading.",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://taifex-quant-trading-platform-front.vercel.app",
        ],
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["content-type"],
    )
    app.include_router(router)
    app.include_router(roadmap_router)
    app.include_router(architecture_router)
    app.include_router(data_router)
    app.include_router(data_version_router)
    app.include_router(continuous_futures_router)
    app.include_router(feature_manifest_router)
    app.include_router(strategy_research_router)
    app.include_router(backtest_preview_router)
    app.include_router(backtest_result_router)
    app.include_router(toy_backtest_router)
    app.include_router(backtest_artifact_router)
    app.include_router(backtest_artifact_index_router)
    app.include_router(backtest_artifact_comparison_router)
    app.include_router(backtest_research_bundle_router)
    app.include_router(backtest_research_bundle_index_router)
    app.include_router(research_review_queue_router)
    app.include_router(research_review_decision_router)
    app.include_router(research_review_decision_index_router)
    app.include_router(research_review_packet_router)
    app.include_router(paper_execution_router)
    app.include_router(release_baseline_router)
    return app


app = create_app()
