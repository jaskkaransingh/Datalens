from fastapi import APIRouter, HTTPException

from services.file_service import get_current_df, get_dataset_name
from services.clean_service import impute_missing_median

from services.rag_service import RAGService
from utils.snapshot_util import generate_lean_snapshot
from events.event_dispatcher import dispatch_event

router = APIRouter()
rag_service = RAGService()


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

        # Generate lean snapshot for proactive insights
        snapshot = generate_lean_snapshot(df, "clean_missing", column)
        insights = rag_service.generate_action_insights(snapshot)

        event["insights"] = insights
        return event

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )