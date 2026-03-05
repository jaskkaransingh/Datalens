import pandas as pd
import numpy as np


def auto_convert_types(df):
    """
    Automatically convert numeric-like columns
    stored as object into numeric
    """

    for col in df.columns:

        if df[col].dtype == "object":

            converted = pd.to_numeric(df[col], errors="ignore")

            df[col] = converted

    return df


def detect_invalid_numeric(df):

    invalid_report = {}

    for col in df.columns:

        if pd.api.types.is_numeric_dtype(df[col]):

            invalid_count = df[col].isna().sum()

            if invalid_count > 0:

                invalid_report[col] = int(invalid_count)

    return invalid_report


def detect_negative_values(df):

    issues = {}

    for col in df.select_dtypes(include=np.number):

        negative_count = (df[col] < 0).sum()

        if negative_count > 0:

            issues[col] = int(negative_count)

    return issues


def normalize_categories(df):

    """
    Remove case inconsistencies
    """

    for col in df.select_dtypes(include="object"):

        df[col] = df[col].str.strip().str.lower()

    return df


def validation_summary(df):

    report = {}

    invalid_numeric = detect_invalid_numeric(df)
    negative_values = detect_negative_values(df)

    report["invalid_numeric_values"] = invalid_numeric
    report["negative_values"] = negative_values

    return report