from pydantic import BaseModel
from typing import List, Dict, Optional


class DatasetInfo(BaseModel):
    total_rows: int
    total_columns: int
    numeric_columns: List[str]
    categorical_columns: List[str]
    datetime_columns: List[str]


class DataQualityOverview(BaseModel):
    overall_quality_score: float
    total_missing_cells: int
    total_duplicate_rows: int
    columns_with_missing: List[str]
    columns_with_outliers: List[str]
    worst_column: Optional[str]
    best_column: Optional[str]


class ColumnStatistics(BaseModel):
    dtype: str
    missing_percentage: float
    mean: Optional[float]
    median: Optional[float]
    standard_deviation: Optional[float]
    minimum: Optional[float]
    maximum: Optional[float]
    skewness: Optional[float]
    outlier_percentage: Optional[float]
    unique_values: int


class DatasetSnapshotResponse(BaseModel):
    document_type: str
    snapshot_id: str
    dataset_name: str
    created_at: str
    dataset_info: DatasetInfo
    data_quality_overview: DataQualityOverview
    column_statistics: Dict[str, ColumnStatistics]


class CleaningState(BaseModel):
    missing_percentage: float
    mean: float
    standard_deviation: float
    quality_score: float


class CleaningUpdateResponse(BaseModel):
    document_type: str
    event_id: str
    timestamp: str
    dataset_name: str
    column_affected: str
    action_type: str
    method_used: str
    before_state: CleaningState
    after_state: CleaningState


class VisualizationEventResponse(BaseModel):
    document_type: str
    event_id: str
    timestamp: str
    dataset_name: str
    chart_type: str
    x_column: str
    y_column: str
    correlation_value: float


class UploadResponse(BaseModel):
    dataset_name: str
    rows: int
    columns: int
    column_names: List[str]