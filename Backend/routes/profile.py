from fastapi import APIRouter
from services.file_service import get_current_df
from services.profile_service import generate_dataset_snapshot
from services.file_service import get_dataset_name

router = APIRouter()

@router.get("/profile")

def profile():

    df = get_current_df()
    name = get_dataset_name()

    return generate_dataset_snapshot(df, name)