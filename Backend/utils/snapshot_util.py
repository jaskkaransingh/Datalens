import pandas as pd
import numpy as np

def generate_lean_snapshot(df: pd.DataFrame, operation: str, column: str = None) -> dict:
    """
    Generates a lean summary of the dataset state for LLM analysis.
    """
    snapshot = {
        "operation": operation,
        "rows": len(df),
        "columns": len(df.columns),
        "column_names": list(df.columns),
        "missing_values_count": int(df.isnull().sum().sum()),
    }
    
    if column and column in df.columns:
        series = df[column]
        snapshot["target_column"] = column
        snapshot["target_column_missing"] = int(series.isnull().sum())
        
        if pd.api.types.is_numeric_dtype(series):
            snapshot["target_column_stats"] = {
                "mean": float(series.mean()) if not series.isnull().all() else None,
                "median": float(series.median()) if not series.isnull().all() else None,
            }
            
    return snapshot
