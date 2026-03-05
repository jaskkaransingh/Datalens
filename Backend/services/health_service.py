import pandas as pd
import numpy as np


def detect_outliers(series):

    if not pd.api.types.is_numeric_dtype(series):
        return 0

    q1 = series.quantile(0.25)
    q3 = series.quantile(0.75)

    iqr = q3 - q1

    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr

    outliers = ((series < lower) | (series > upper)).sum()

    return outliers


def column_health_score(df):

    column_health = {}

    for col in df.columns:

        series = df[col]

        missing_ratio = series.isnull().mean()

        outlier_ratio = 0

        if pd.api.types.is_numeric_dtype(series):

            outliers = detect_outliers(series)
            outlier_ratio = outliers / len(series)

        score = 100

        score -= missing_ratio * 50
        score -= outlier_ratio * 50

        score = max(score, 0)

        if score > 80:
            status = "green"

        elif score > 50:
            status = "orange"

        else:
            status = "red"

        column_health[col] = {
            "score": round(score, 2),
            "missing_percentage": round(missing_ratio * 100, 2),
            "outlier_percentage": round(outlier_ratio * 100, 2),
            "status": status
        }

    return column_health


def calculate_health(df):

    column_scores = column_health_score(df)

    scores = [v["score"] for v in column_scores.values()]

    dataset_score = sum(scores) / len(scores)

    return round(dataset_score, 2)