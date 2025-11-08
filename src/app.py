# src/app.py
from flask import Flask, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # Allow requests from React frontend

# Path to your properties.json
PROPERTIES_FILE = os.path.join(os.path.dirname(__file__), "properties.json")

@app.route("/properties")
def get_properties():
    try:
        with open(PROPERTIES_FILE, "r") as f:
            data = json.load(f)
        return jsonify(data)  # Return full list
    except FileNotFoundError:
        return jsonify({"error": "properties.json not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON"}), 500

if __name__ == "__main__":
    app.run(debug=True)
