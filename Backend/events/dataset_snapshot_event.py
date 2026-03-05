import uuid
from datetime import datetime

def create_dataset_snapshot(dataset_name, snapshot):

    event = {
        "document_type": "dataset_snapshot",
        "snapshot_id": f"snapshot_{uuid.uuid4().hex[:6]}",
        "dataset_name": dataset_name,
        "created_at": datetime.utcnow().isoformat(),
        "data": snapshot
    }

    return event