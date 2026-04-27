from fastapi import APIRouter, HTTPException

from app.domain.feature_manifest import (
    FeatureDatasetManifest,
    FeatureManifestPreviewRequest,
    build_feature_manifest,
)

router = APIRouter(prefix="/api/data/features", tags=["feature-manifest"])


@router.post("/manifest/preview", response_model=FeatureDatasetManifest)
def preview_feature_manifest(
    request: FeatureManifestPreviewRequest,
) -> FeatureDatasetManifest:
    try:
        return build_feature_manifest(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
