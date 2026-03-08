from fastapi import APIRouter, HTTPException, Query
import pandas as pd
import numpy as np

from services.file_service import get_current_df
from services.rag_service import RAGService
from utils.snapshot_util import generate_lean_snapshot

router = APIRouter()
rag_service = RAGService()

@router.get("/viz")
async def get_viz_data(
    type: str = Query("bar"),
    xAxis: str = Query(None),
    yAxis: str = Query(None)
):
    """
    Generate visualization data and provide proactive RAG insights.
    """
    df = get_current_df()
    if df is None:
        raise HTTPException(status_code=404, detail="No dataset uploaded")

    # If axes aren't provided, pick defaults
    obj_cols = df.select_dtypes(include=['object']).columns.tolist()
    num_cols = df.select_dtypes(include=['number']).columns.tolist()
    
    if not xAxis or xAxis not in df.columns:
        xAxis = obj_cols[0] if obj_cols else df.columns[0]
    if not yAxis or yAxis not in df.columns:
        yAxis = num_cols[0] if num_cols else df.columns[-1]

    try:
        # Simple aggregation for chart labels/values
        if pd.api.types.is_numeric_dtype(df[yAxis]):
            agg_df = df.groupby(xAxis)[yAxis].mean().reset_index().sort_values(by=yAxis, ascending=False).head(15)
            labels, values = agg_df[xAxis].tolist(), agg_df[yAxis].tolist()
        else:
            counts = df[xAxis].value_counts().head(15)
            labels, values = counts.index.tolist(), counts.values.tolist()
            yAxis = "Count"

        # Generate insights
        snapshot = generate_lean_snapshot(df, f"visualize_{type}", xAxis)
        snapshot["y_axis"] = yAxis
        insights = rag_service.generate_action_insights(snapshot)

        return {
            "labels": [str(l) for l in labels],
            "values": [float(v) if isinstance(v, (np.float64, np.int64)) else v for v in values],
            "group_col": xAxis,
            "val_col": yAxis,
            "insights": insights
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
