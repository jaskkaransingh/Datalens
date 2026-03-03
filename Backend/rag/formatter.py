def format_snapshot(snapshot_json: dict) -> str:
    dataset_info = snapshot_json["dataset_info"]
    quality = snapshot_json["data_quality_overview"]
    columns = snapshot_json["column_statistics"]
    correlations = snapshot_json["correlation_analysis"]

    text = []

    text.append(f"Dataset Name: {snapshot_json['dataset_name']}")
    text.append(f"Total Rows: {dataset_info['total_rows']}")
    text.append(f"Total Columns: {dataset_info['total_columns']}")
    text.append(f"Overall Quality Score: {quality['overall_quality_score']}")
    text.append(f"Worst Column: {quality['worst_column']}")
    text.append(f"Best Column: {quality['best_column']}")
    text.append("")

    for col, stats in columns.items():
        text.append(f"Column: {col}")
        text.append(f"Type: {stats['dtype']}")
        text.append(f"Missing Percentage: {stats['missing_percentage']}%")
        text.append(f"Mean: {stats.get('mean', 'N/A')}")
        text.append(f"Standard Deviation: {stats.get('standard_deviation', 'N/A')}")
        text.append(f"Outlier Percentage: {stats.get('outlier_percentage', 0)}%")
        text.append("")

    text.append("Correlation Summary:")
    for pair in correlations["strongest_positive_pairs"]:
        cols = pair["columns"]
        val = pair["correlation_value"]
        text.append(f"Strong positive correlation between {cols[0]} and {cols[1]}: {val}")

    return "\n".join(text)

def format_cleaning_update(cleaning_json: dict) -> str:
    before = cleaning_json["before_state"]
    after = cleaning_json["after_state"]
    overall = cleaning_json["overall_dataset_quality_change"]

    text = []

    text.append(f"Cleaning Action on Column: {cleaning_json['column_affected']}")
    text.append(f"Action Type: {cleaning_json['action_type']}")
    text.append(f"Method Used: {cleaning_json['method_used']}")
    text.append("")

    text.append("Before Cleaning:")
    text.append(f"- Missing Percentage: {before['missing_percentage']}%")
    text.append(f"- Mean: {before.get('mean', 'N/A')}")
    text.append(f"- Standard Deviation: {before.get('standard_deviation', 'N/A')}")
    text.append(f"- Column Quality Score: {before['quality_score']}")
    text.append("")

    text.append("After Cleaning:")
    text.append(f"- Missing Percentage: {after['missing_percentage']}%")
    text.append(f"- Mean: {after.get('mean', 'N/A')}")
    text.append(f"- Standard Deviation: {after.get('standard_deviation', 'N/A')}")
    text.append(f"- Column Quality Score: {after['quality_score']}")
    text.append("")

    text.append("Overall Dataset Quality Change:")
    text.append(f"- Before: {overall['quality_score_before']}")
    text.append(f"- After: {overall['quality_score_after']}")

    return "\n".join(text)

def format_visualization_event(viz_json: dict) -> str:
    text = []

    text.append("Visualization Event:")
    text.append(f"Chart Type: {viz_json['chart_type']}")
    text.append("")
    text.append(f"Dataset X: {viz_json['dataset_x']}")
    text.append(f"Column X: {viz_json['column_x']}")
    text.append("")
    text.append(f"Dataset Y: {viz_json['dataset_y']}")
    text.append(f"Column Y: {viz_json['column_y']}")
    text.append("")
    text.append("Correlation Analysis:")
    text.append(f"Method: {viz_json['correlation_analysis']['correlation_method']}")
    text.append(f"Correlation Value: {viz_json['correlation_analysis']['correlation_value']}")
    text.append(f"Strength: {viz_json['correlation_analysis']['correlation_strength']}")
    text.append(f"Sample Size: {viz_json['correlation_analysis']['sample_size']}")

    return "\n".join(text)