from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd

# services
from services.file_service import load_csv
from services.profile_service import generate_dataset_snapshot

# validation
from utils.validators import auto_convert_types, normalize_categories, validation_summary

# events
from events.dataset_snapshot_event import create_dataset_snapshot
from events.event_dispatcher import dispatch_event

router = APIRouter()


@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    """
    Upload CSV dataset
    Generates dataset snapshot for RAG system
    """

    # Validate file type
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are allowed"
        )

    try:

        # Load CSV
        df = load_csv(file.file, file.filename)

        # Auto data cleaning / normalization
        df = auto_convert_types(df)
        df = normalize_categories(df)

        # Run validation engine
        validation_report = validation_summary(df)

        # Generate dataset snapshot
        snapshot = generate_dataset_snapshot(df, file.filename)

        # Attach validation report
        snapshot["validation_report"] = validation_report

        # Create RAG dataset snapshot event
        event = create_dataset_snapshot(file.filename, snapshot)

        # Send event to dispatcher
        dispatch_event(event)

        # Response
        return {
            "status": "success",
            "dataset_name": file.filename,
            "rows": int(df.shape[0]),
            "columns": int(df.shape[1]),
            "column_names": list(df.columns),
            "snapshot": snapshot
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )