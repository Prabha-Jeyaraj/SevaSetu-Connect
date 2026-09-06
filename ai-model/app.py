"""
Flask AI Demand Forecasting Microservice
SevaSetu Connect - Smart India Hackathon (SIH26089)
"""

import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from train_predict import forecast_next_month, train_demand_model

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'SevaSetu AI Demand Forecaster',
        'version': '1.0.0'
    })

@app.route('/forecast', methods=['GET', 'POST'])
def get_forecast():
    district = request.args.get('district') or (request.json.get('district') if request.is_json else None)
    month = int(request.args.get('month', 10))
    year = int(request.args.get('year', 2026))

    try:
        results = forecast_next_month(district=district, target_month=month, target_year=year)
        return jsonify({
            'success': True,
            'district': district or 'All Districts',
            'month': month,
            'year': year,
            'forecasts': results
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/retrain', methods=['POST'])
def retrain():
    try:
        metadata = train_demand_model()
        return jsonify({
            'success': True,
            'message': 'Model retrained successfully',
            'trained_at': metadata['trained_at']
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"🚀 AI Demand Forecasting Service starting on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
