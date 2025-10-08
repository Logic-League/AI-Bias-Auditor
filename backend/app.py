from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import os
from datetime import datetime

app = Flask(__name__)

@app.route("/")
def home():
    return {"message": "AI Bias Audit Backend running."}

@app.route("/run_audit", methods=["POST"])
def run_audit():
    """
    Request JSON:
    {
        "dataset_path": "/content/drive/MyDrive/Colab_Models/bias_audit.xlsx",
        "sensitive_features": ["Gender", "AgeGroup"],
        "outcome_col": "Prediction",
        "true_label_col": "True_Label"
    }
    """
    data = request.get_json()
    dataset_path = data.get("dataset_path")
    sensitive_features = data.get("sensitive_features", [])
    outcome_col = data.get("outcome_col", "Prediction")
    true_label_col = data.get("true_label_col", None)

    if not os.path.exists(dataset_path):
        return jsonify({"error": f"Dataset not found: {dataset_path}"}), 400

    df = pd.read_excel(dataset_path)
    results = {}
    for col in sensitive_features:
        gp = df.groupby(col)[outcome_col].value_counts(normalize=True).unstack().fillna(0)
        results[col] = gp.to_dict()

    # Save results file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f"bias_audit_results_{timestamp}.xlsx"
    df.to_excel(output_file, index=False)

    return jsonify({
        "message": "Bias audit completed.",
        "results": results,
        "output_file": output_file
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
