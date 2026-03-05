from pydantic import BaseModel


class CleanRequest(BaseModel):
    column: str
    method: str = "median"


class VisualizationRequest(BaseModel):
    x_column: str
    y_column: str
    chart_type: str


class ValidationRequest(BaseModel):
    column: str
    validation_type: str