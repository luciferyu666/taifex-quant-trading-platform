from fastapi import APIRouter, HTTPException, status

from app.domain.data_versions import DataVersionRecord, RegisterDataVersionRequest
from app.services.data_version_registry import DataVersionRegistry

router = APIRouter(prefix="/api/data", tags=["data-version-registry"])

_registry = DataVersionRegistry()


@router.get("/versions", response_model=list[DataVersionRecord])
def list_data_versions() -> list[DataVersionRecord]:
    return _registry.list_versions()


@router.post(
    "/versions/register",
    response_model=DataVersionRecord,
    status_code=status.HTTP_201_CREATED,
)
def register_data_version(request: RegisterDataVersionRequest) -> DataVersionRecord:
    return _registry.register(request)


@router.get("/versions/{version_id}", response_model=DataVersionRecord)
def get_data_version(version_id: str) -> DataVersionRecord:
    record = _registry.get(version_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Data version not found")
    return record
