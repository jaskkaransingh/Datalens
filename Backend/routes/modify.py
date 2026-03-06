from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.file_service import get_current_df

router = APIRouter()

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
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")
