
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

DB_FILE = "campus_emissions.json"

# Initialize DB
if not os.path.exists(DB_FILE):
    with open(DB_FILE, 'w') as f:
        json.dump([], f)

def get_db():
    with open(DB_FILE, 'r') as f:
        return json.load(f)

def save_db(data):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=4)

@app.route('/api/emissions', methods=['POST'])
def add_data():
    req = request.json
    try:
        electricity = float(req.get('dept_electricity', 0))
        transport = float(req.get('student_commute', 0))
        waste = float(req.get('canteen_waste', 0))

        # Campus calculation factors
        total_co2 = (electricity * 0.82) + (transport * 0.21) + (waste * 0.5)
        
        entry = {
            "date": datetime.now().isoformat(),
            "dept_electricity": electricity,
            "student_commute": transport,
            "canteen_waste": waste,
            "total_co2": round(total_co2, 2)
        }

        db = get_db()
        db.append(entry)
        save_db(db)
        
        return jsonify({"message": "Data Saved", "data": entry}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/emissions', methods=['GET'])
def fetch_data():
    return jsonify(get_db())

@app.route('/api/stats', methods=['GET'])
def get_stats():
    db = get_db()
    if not db:
        return jsonify({"total_co2": 0, "avg_co2": 0, "count": 0})
    
    total = sum(d['total_co2'] for d in db)
    avg = total / len(db)
    return jsonify({
        "total_co2": round(total, 2),
        "avg_co2": round(avg, 2),
        "count": len(db)
    })

if __name__ == '__main__':
    print("🚀 TCET Campus Backend running at http://localhost:5000")
    app.run(port=5000, debug=True)