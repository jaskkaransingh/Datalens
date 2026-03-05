import uuid
from datetime import datetime

def create_cleaning_event(dataset_name, column, before, after):

    return {
        "document_type": "cleaning_update",
        "event_id": f"clean_{uuid.uuid4().hex[:6]}",
        "timestamp": datetime.utcnow().isoformat(),
        "dataset_name": dataset_name,
        "column_affected": column,
        "before_state": before,
        "after_state": after
    }