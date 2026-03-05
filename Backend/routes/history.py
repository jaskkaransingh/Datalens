from fastapi import APIRouter
from storage.event_history import get_dataset_history

router = APIRouter()


@router.get("/history/{dataset_name}")

def dataset_history(dataset_name: str):

    history = get_dataset_history(dataset_name)

    return {
        "dataset_name": dataset_name,
        "event_count": len(history),
        "events": history
    }