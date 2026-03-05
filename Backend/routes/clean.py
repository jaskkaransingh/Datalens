from fastapi import APIRouter, HTTPException

from services.file_service import get_current_df, get_dataset_name
from services.clean_service import impute_missing_median

from events.event_dispatcher import dispatch_event

router = APIRouter()


@router.post("/clean/{column}")
def clean_column(column: str):

    df = get_current_df()
    dataset_name = get_dataset_name()

    if df is None:
        raise HTTPException(
            status_code=400,
            detail="No dataset uploaded"
        )

    try:

        df, event = impute_missing_median(df, column, dataset_name)

        # Send event to RAG pipeline
        dispatch_event(event)

        return event

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )