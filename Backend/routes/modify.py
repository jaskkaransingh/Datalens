from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.file_service import get_current_df
from services.rag_service import RAGService
from utils.snapshot_util import generate_lean_snapshot

router = APIRouter()
rag_service = RAGService()

class CellUpdate(BaseModel):
    row_index: int
    column_name: str
    new_value: str

@router.post("/update-cell")
async def update_cell(update: CellUpdate):
    """
    Update a single cell in the current in-memory dataset
    """
    df = get_current_df()
    if df is None:
        raise HTTPException(status_code=404, detail="No active dataset in backend session")
    
    try:
        # Update the cell using pandas .at accessor
        df.at[update.row_index, update.column_name] = update.new_value
        print(f"DEBUG: Updated {update.column_name} at index {update.row_index} to {update.new_value}")
        return {
            "status": "success", 
            "message": "Backend synchronized",
            "cell": {
                "row": update.row_index,
                "col": update.column_name,
                "val": update.new_value
            },
            "insights": rag_service.generate_action_insights(
                generate_lean_snapshot(df, "cell_update", update.column_name)
            )
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")
