import pandas as pd
import numpy as np


def analyze_model_readiness(df, target_column=None):

    result = {
        "recommended_model": None,
        "analysis_type": None,
        "confidence_score": 0,
        "reasons": []
    }

    numeric_cols = df.select_dtypes(include=np.number).columns.tolist()
    categorical_cols = df.select_dtypes(include="object").columns.tolist()

    # If user specifies target column
    if target_column and target_column in df.columns:

        if pd.api.types.is_numeric_dtype(df[target_column]):

            result["analysis_type"] = "regression"
            result["recommended_model"] = "Linear Regression"
            result["confidence_score"] = 0.8
            result["reasons"].append(
                "Target column is numeric"
            )

        else:

            unique_values = df[target_column].nunique()

            if unique_values < 20:

                result["analysis_type"] = "classification"
                result["recommended_model"] = "Logistic Regression"
                result["confidence_score"] = 0.8
                result["reasons"].append(
                    "Target column has limited categories"
                )

    else:

        # Automatic inference
        if len(numeric_cols) > len(categorical_cols):

            result["analysis_type"] = "regression"
            result["recommended_model"] = "Linear Regression"
            result["confidence_score"] = 0.6
            result["reasons"].append(
                "Majority of features are numeric"
            )

        else:

            result["analysis_type"] = "classification"
            result["recommended_model"] = "Random Forest Classifier"
            result["confidence_score"] = 0.6
            result["reasons"].append(
                "Dataset contains categorical features"
            )

    # Detect time-series
    datetime_cols = df.select_dtypes(include=["datetime"]).columns.tolist()

    if len(datetime_cols) > 0:

        result["analysis_type"] = "time_series"
        result["recommended_model"] = "ARIMA / LSTM"
        result["confidence_score"] = 0.7
        result["reasons"].append(
            "Datetime column detected"
        )

    return result