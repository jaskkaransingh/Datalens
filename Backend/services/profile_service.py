import pandas as pd
import numpy as np
import uuid
from datetime import datetime
from services.health_service import calculate_health
from services.health_service import column_health_score
from services.model_analysis_service import analyze_model_readiness

def detect_outliers(series):
    """
    Detect outliers using IQR method
    """

    q1 = series.quantile(0.25)
    q3 = series.quantile(0.75)

    iqr = q3 - q1

    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr

    outliers = ((series < lower) | (series > upper)).sum()

    return outliers


def column_statistics(df):

    stats = {}

    for col in df.columns:

        series = df[col]

        col_stat = {
            "dtype": str(series.dtype),
            "missing_percentage": float(series.isnull().mean() * 100),
            "unique_values": int(series.nunique())
        }

        if pd.api.types.is_numeric_dtype(series):

            outlier_count = detect_outliers(series)

            col_stat.update({
                "mean": float(series.mean()),
                "median": float(series.median()),
                "standard_deviation": float(series.std()),
                "minimum": float(series.min()),
                "maximum": float(series.max()),
                "skewness": float(series.skew()),
                "outlier_percentage": float(outlier_count / len(series) * 100)
            })

        stats[col] = col_stat

    return stats


def correlation_analysis(df):

    numeric_df = df.select_dtypes(include=np.number)

    if numeric_df.shape[1] < 2:
        return None

    corr_matrix = numeric_df.corr(method="pearson")

    strongest_positive = None
    strongest_negative = None

    max_corr = -1
    min_corr = 1

    for i in corr_matrix.columns:
        for j in corr_matrix.columns:

            if i == j:
                continue

            value = corr_matrix.loc[i, j]

            if value > max_corr:
                max_corr = value
                strongest_positive = (i, j)

            if value < min_corr:
                min_corr = value
                strongest_negative = (i, j)

    return {
        "method": "pearson",
        "strongest_positive_pairs": [{
            "columns": list(strongest_positive),
            "correlation_value": float(max_corr)
        }],
        "strongest_negative_pairs": [{
            "columns": list(strongest_negative),
            "correlation_value": float(min_corr)
        }],
        "correlation_matrix_available": True
    }


def generate_dataset_snapshot(df, dataset_name):

    numeric_columns = df.select_dtypes(include=np.number).columns.tolist()
    categorical_columns = df.select_dtypes(include="object").columns.tolist()

    col_stats = column_statistics(df)
    column_health = column_health_score(df)
    model_analysis = analyze_model_readiness(df)

    missing_columns = [
        col for col, val in col_stats.items()
        if val["missing_percentage"] > 0
    ]

    outlier_columns = [
        col for col, val in col_stats.items()
        if val.get("outlier_percentage", 0) > 0
    ]

    worst_column = None
    best_column = None

    if len(col_stats) > 0:

        worst_column = max(
            col_stats,
            key=lambda c: col_stats[c]["missing_percentage"]
        )

        best_column = min(
            col_stats,
            key=lambda c: col_stats[c]["missing_percentage"]
        )

    snapshot = {

        "document_type": "dataset_snapshot",

        "snapshot_id": f"snapshot_{uuid.uuid4().hex[:6]}",

        "dataset_name": dataset_name,

        "created_at": datetime.utcnow().isoformat(),

        "dataset_info": {
            "total_rows": int(df.shape[0]),
            "total_columns": int(df.shape[1]),
            "numeric_columns": numeric_columns,
            "categorical_columns": categorical_columns,
            "datetime_columns": []
        },

        "data_quality_overview": {
            "overall_quality_score": calculate_health(df),
            "total_missing_cells": int(df.isnull().sum().sum()),
            "total_duplicate_rows": int(df.duplicated().sum()),
            "columns_with_missing": missing_columns,
            "columns_with_outliers": outlier_columns,
            "worst_column": worst_column,
            "best_column": best_column
        },

        "column_statistics": col_stats,

        "correlation_analysis": correlation_analysis(df)

    }
    snapshot["column_health"] = column_health
    snapshot["model_analysis"] = model_analysis

    return snapshot