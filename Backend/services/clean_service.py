import uuid
from datetime import datetime
import pandas as pd

from services.health_service import calculate_health


def impute_missing_median(df, column, dataset_name):
    """
    Replace missing values using median
    Generates cleaning update event
    """

    if column not in df.columns:
        raise ValueError("Column not found in dataset")

    # Capture BEFORE state
    before_state = {
        "missing_percentage": float(df[column].isnull().mean() * 100),
        "mean": float(df[column].mean()),
        "standard_deviation": float(df[column].std()),
        "quality_score": calculate_health(df)
    }

    # Apply cleaning
    median_value = df[column].median()
    df[column].fillna(median_value, inplace=True)

    # Capture AFTER state
    after_state = {
        "missing_percentage": float(df[column].isnull().mean() * 100),
        "mean": float(df[column].mean()),
        "standard_deviation": float(df[column].std()),
        "quality_score": calculate_health(df)
    }

    # Cleaning event
    event = {
        "document_type": "cleaning_update",
        "event_id": f"clean_{uuid.uuid4().hex[:4]}",
        "timestamp": datetime.utcnow().isoformat(),
        "dataset_name": dataset_name,
        "column_affected": column,
        "action_type": "impute_missing",
        "method_used": "median",
        "reason_for_action": "User cleaning request",
        "before_state": before_state,
        "after_state": after_state,
        "overall_dataset_quality_change": {
            "quality_score_before": before_state["quality_score"],
            "quality_score_after": after_state["quality_score"]
        }
    }

    return df, event