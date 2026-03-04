import os
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import io

app = Flask(__name__)
CORS(app)

# Global store for the current dataset (in-memory)
current_df = None

@app.route('/api/upload', methods=['POST'])
def upload_file():
    global current_df
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        try:
            # Load CSV into pandas
            stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
            current_df = pd.read_csv(stream)
            
            # Prepare metadata
            columns = current_df.columns.tolist()
            rows_count = len(current_df)
            
            # Preview first 50 rows
            preview = current_df.head(50).replace({np.nan: None}).to_dict(orient='records')
            
            return jsonify({
                "message": "File uploaded successfully",
                "columns": columns,
                "rows_count": rows_count,
                "preview": preview
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500

from sklearn.preprocessing import StandardScaler, MinMaxScaler

@app.route('/api/analyze', methods=['GET'])
def analyze_data():
    global current_df
    if current_df is None:
        return jsonify({"error": "No data uploaded"}), 404
    
    health_report = {}
    deep_stats = {}
    num_cols = current_df.select_dtypes(include=[np.number]).columns.tolist()
    
    for col in current_df.columns:
        missing = int(current_df[col].isnull().sum())
        total = len(current_df)
        missing_pct = round((missing / total) * 100, 1) if total > 0 else 0
        
        # Anomaly detection (Z-score based for numeric)
        outliers_count = 0
        if col in num_cols:
            col_data = current_df[col].dropna()
            if len(col_data) > 0:
                z_scores = np.abs((col_data - col_data.mean()) / col_data.std())
                outliers_count = int((z_scores > 3).sum())
                
                # Descriptive Deep Stats
                deep_stats[col] = {
                    "mean": float(col_data.mean()),
                    "std": float(col_data.std()),
                    "min": float(col_data.min()),
                    "max": float(col_data.max()),
                    "median": float(col_data.median()),
                    "outliers": outliers_count
                }
        
        health_report[col] = {
            "missing": missing,
            "missing_pct": missing_pct,
            "outliers": outliers_count,
            "clean_pct": 100 - missing_pct - (round((outliers_count/total)*100, 1) if total > 0 else 0)
        }
    
    # Global stats
    stats = {
        "rows": len(current_df),
        "columns": len(current_df.columns),
        "missing": int(current_df.isnull().sum().sum()),
        "clean_avg": round(sum(v['clean_pct'] for v in health_report.values()) / len(health_report), 1) if health_report else 0
    }
    
    return jsonify({
        "health": health_report,
        "deep_stats": deep_stats,
        "stats": stats
    })

@app.route('/api/correlation', methods=['GET'])
def get_correlation():
    global current_df
    if current_df is None:
        return jsonify({"error": "No data uploaded"}), 404
    
    num_df = current_df.select_dtypes(include=[np.number])
    if num_df.empty:
        return jsonify({"error": "No numeric data for correlation"}), 400
    
    corr_matrix = num_df.corr().round(2).replace({np.nan: 0}).to_dict()
    return jsonify(corr_matrix)

from sklearn.linear_model import LinearRegression
from flask import send_file

@app.route('/api/transform', methods=['POST'])
def transform_data():
    global current_df
    if current_df is None:
        return jsonify({"error": "No data uploaded"}), 404
    
    action = request.json.get('action') # 'fill_missing', 'drop_column', 'clip_outliers', 'create_column'
    column = request.json.get('column')
    target_col = request.json.get('targetCol')
    val = request.json.get('value')
    
    try:
        if action == 'fill_missing':
            method = request.json.get('method', 'mean') # mean, median, mode
            if method == 'mean' and pd.api.types.is_numeric_dtype(current_df[column]):
                current_df[column] = current_df[column].fillna(current_df[column].mean())
            elif method == 'median' and pd.api.types.is_numeric_dtype(current_df[column]):
                current_df[column] = current_df[column].fillna(current_df[column].median())
            else:
                current_df[column] = current_df[column].fillna(current_df[column].mode()[0])
        elif action == 'drop_column':
            current_df = current_df.drop(columns=[column])
        elif action == 'clip_outliers':
            if pd.api.types.is_numeric_dtype(current_df[column]):
                m = current_df[column].mean()
                s = current_df[column].std()
                current_df[column] = current_df[column].clip(lower=m-3*s, upper=m+3*s)
        elif action == 'create_column':
            # Simplified logic: NewCol = Col1 + val
            # In a real app, this could be more complex
            current_df[target_col] = current_df[column] + float(val)

        # Refresh preview and metadata for frontend
        columns = current_df.columns.tolist()
        preview = current_df.head(50).replace({np.nan: None}).to_dict(orient='records')
        
        return jsonify({
            "success": True, 
            "message": f"Applied {action} to {column}",
            "columns": columns,
            "preview": preview
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/predict', methods=['GET'])
def predict_data():
    global current_df
    if current_df is None:
        return jsonify({"error": "No data uploaded"}), 404
    
    x_col = request.args.get('xAxis')
    y_col = request.args.get('yAxis')
    
    if not x_col or not y_col:
        return jsonify({"error": "X and Y columns required"}), 400
    
    try:
        # Filter for numeric only
        clean_df = current_df[[x_col, y_col]].dropna()
        X = clean_df[[x_col]].values
        y = clean_df[y_col].values
        
        model = LinearRegression()
        model.fit(X, y)
        
        r2 = model.score(X, y)
        coef = model.coef_[0]
        intercept = model.intercept_
        
        # Generated trend line points
        x_min, x_max = float(X.min()), float(X.max())
        line_x = np.linspace(x_min, x_max, 50)
        line_y = model.predict(line_x.reshape(-1, 1))
        
        return jsonify({
            "r2": round(float(r2), 4),
            "coef": round(float(coef), 4),
            "intercept": round(float(intercept), 4),
            "trend": {
                "x": line_x.tolist(),
                "y": line_y.tolist()
            },
            "scatter": {
                "x": X.flatten().tolist(),
                "y": y.tolist()
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/export/excel', methods=['GET'])
def export_excel():
    global current_df
    if current_df is None: return jsonify({"error": "No data uploaded"}), 404
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        current_df.to_excel(writer, index=False, sheet_name='Production_Dataset')
        summary_data = {
            "Metric": ["Total Rows", "Total Columns", "Missing Fragments", "Logic Stability"],
            "Value": [len(current_df), len(current_df.columns), int(current_df.isnull().sum().sum()), "STABILIZED"]
        }
        pd.DataFrame(summary_data).to_excel(writer, index=False, sheet_name='Analytical_Summary')
    output.seek(0)
    return send_file(output, as_attachment=True, download_name=f"datalens_master_{pd.Timestamp.now().strftime('%Y%H%M')}.xlsx", mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

@app.route('/api/export/csv', methods=['GET'])
def export_csv():
    global current_df
    if current_df is None: return jsonify({"error": "No data uploaded"}), 404
    output = io.StringIO()
    current_df.to_csv(output, index=False)
    output.seek(0)
    return send_file(io.BytesIO(output.getvalue().encode('utf-8')), as_attachment=True, download_name=f"datalens_prod_{pd.Timestamp.now().strftime('%Y%H%M')}.csv", mimetype='text/csv')

@app.route('/api/export/json', methods=['GET'])
def export_json():
    global current_df
    if current_df is None: return jsonify({"error": "No data uploaded"}), 404
    output = current_df.to_json(orient='records')
    return send_file(io.BytesIO(output.encode('utf-8')), as_attachment=True, download_name=f"datalens_system_{pd.Timestamp.now().strftime('%Y%H%M')}.json", mimetype='application/json')

@app.route('/api/viz', methods=['GET'])
def get_viz_data():
    global current_df
    if current_df is None: return jsonify({"error": "No data uploaded"}), 404
    x_axis = request.args.get('xAxis')
    y_axis = request.args.get('yAxis')
    obj_cols = current_df.select_dtypes(include=['object']).columns.tolist()
    num_cols = current_df.select_dtypes(include=['number', 'int64', 'float64']).columns.tolist()
    if not x_axis or x_axis not in current_df.columns:
        x_axis = obj_cols[0] if obj_cols else current_df.columns[0]
    if not y_axis or y_axis not in current_df.columns:
        y_axis = num_cols[0] if num_cols else current_df.columns[-1]
    try:
        if pd.api.types.is_numeric_dtype(current_df[y_axis]):
            agg_df = current_df.groupby(x_axis)[y_axis].mean().reset_index().sort_values(by=y_axis, ascending=False).head(15)
            labels, values = agg_df[x_axis].tolist(), agg_df[y_axis].tolist()
        else:
            counts = current_df[x_axis].value_counts().head(15)
            labels, values = counts.index.tolist(), counts.values.tolist()
            y_axis = "Count"
        return jsonify({
            "labels": [str(l) for l in labels],
            "values": [float(v) if isinstance(v, (np.float64, np.int64)) else v for v in values],
            "group_col": x_axis, "val_col": y_axis
        })
    except Exception as e: return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
