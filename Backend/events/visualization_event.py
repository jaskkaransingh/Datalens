import uuid
from datetime import datetime

def create_visualization_event(dataset_name, x_col, y_col, corr):

    return {
        "document_type": "visualization_event",
        "event_id": f"viz_{uuid.uuid4().hex[:6]}",
        "timestamp": datetime.utcnow().isoformat(),
        "dataset_name": dataset_name,
        "chart_type": "scatter",
        "x_column": x_col,
        "y_column": y_col,
        "correlation": corr
    }