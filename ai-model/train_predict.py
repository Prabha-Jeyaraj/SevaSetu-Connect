"""
Train & Predict AI Demand Forecasting Model
SevaSetu Connect - Smart India Hackathon (SIH26089)

Trains a Random Forest / Gradient Boosting regression model on historical gig-work demand
and outputs predictions for next-month demand per district per service type.
"""

import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score

DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'synthetic_demand_data.csv')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'data', 'trained_demand_model.joblib')

def prepare_features(df):
    """Engineers temporal and categorical features for time-series regression."""
    df = df.copy()
    df['date'] = pd.to_datetime(df['date'])
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month
    df['quarter'] = df['date'].dt.quarter
    
    # Cyclical month features for capturing annual seasonality
    df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
    df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
    
    # One-hot encoding for categorical variables
    df = pd.get_dummies(df, columns=['district', 'service_type'], drop_first=False)
    return df

def train_demand_model():
    if not os.path.exists(DATA_PATH):
        from generate_data import generate_demand_dataset
        generate_demand_dataset()

    raw_df = pd.read_csv(DATA_PATH)
    processed_df = prepare_features(raw_df)

    feature_cols = [col for col in processed_df.columns if col not in ['date', 'booking_count']]
    X = processed_df[feature_cols]
    y = processed_df['booking_count']

    # Train / Test split by date
    train_mask = processed_df['year'] <= 2025
    X_train, y_train = X[train_mask], y[train_mask]
    X_test, y_test = X[~train_mask], y[~train_mask]

    model = GradientBoostingRegressor(n_estimators=150, max_depth=4, learning_rate=0.08, random_state=42)
    model.fit(X_train, y_train)

    if len(X_test) > 0:
        y_pred = model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        print(f"Model Evaluation on 2026 Test Period:")
        print(f" - MAE: {mae:.2f} bookings")
        print(f" - R² Score: {r2:.4f}")

    # Retrain on full dataset for future forecasting
    model.fit(X, y)

    # Save model and metadata
    metadata = {
        'model': model,
        'feature_cols': feature_cols,
        'trained_at': datetime.now().isoformat(),
        'districts': raw_df['district'].unique().tolist(),
        'services': raw_df['service_type'].unique().tolist()
    }
    joblib.dump(metadata, MODEL_PATH)
    print(f"Trained model saved successfully to: {MODEL_PATH}")
    return metadata

def forecast_next_month(district=None, target_month=10, target_year=2026):
    """
    Generates forecast for a specific district (or all districts) and target month.
    """
    if not os.path.exists(MODEL_PATH):
        train_demand_model()

    metadata = joblib.load(MODEL_PATH)
    model = metadata['model']
    feature_cols = metadata['feature_cols']
    all_districts = metadata['districts']
    all_services = metadata['services']

    filter_districts = [district] if district and district in all_districts else all_districts

    forecast_records = []
    month_name = datetime(target_year, target_month, 1).strftime('%B %Y')

    for dist in filter_districts:
        for srv in all_services:
            # Build input feature row matching training columns
            row = {col: 0 for col in feature_cols}
            row['year'] = target_year
            row['month'] = target_month
            row['quarter'] = (target_month - 1) // 3 + 1
            row['month_sin'] = np.sin(2 * np.pi * target_month / 12)
            row['month_cos'] = np.cos(2 * np.pi * target_month / 12)

            dist_col = f"district_{dist}"
            srv_col = f"service_type_{srv}"
            if dist_col in row:
                row[dist_col] = 1
            if srv_col in row:
                row[srv_col] = 1

            X_input = pd.DataFrame([row])[feature_cols]
            predicted_demand = int(round(model.predict(X_input)[0]))

            # Determine seasonal indicator text
            insights = {
                'Plumber': 'Monsoon plumbing surge / pipe maintenance' if target_month in [6,7,8,9] else 'Normal baseline demand',
                'Electrician': 'Summer AC & fan repair peak' if target_month in [3,4,5,6] else ('Festive Diwali lighting demand' if target_month in [10,11] else 'Steady general electrical demand'),
                'Carpenter': 'Pre-festive home renovation / furniture works' if target_month in [8,9,10,11] else 'Standard carpentry works',
                'Caregiver': 'Consistent medical & elderly care baseline' if target_month in [12,1] else 'Routine daily assisted living',
                'Painter': 'High pre-festive Diwali & post-monsoon repaint demand' if target_month in [9,10,11] else ('Low demand due to rains' if target_month in [6,7,8] else 'Interior painting baseline')
            }

            forecast_records.append({
                'district': dist,
                'service_type': srv,
                'target_period': month_name,
                'predicted_demand': predicted_demand,
                'confidence_interval': f"{int(predicted_demand * 0.92)} - {int(predicted_demand * 1.08)}",
                'seasonality_insight': insights.get(srv, 'Standard trend')
            })

    return forecast_records

if __name__ == '__main__':
    train_demand_model()
    print("\n--- NEXT MONTH DEMAND FORECAST PREVIEW (Pune) ---")
    pune_forecast = forecast_next_month('Pune', target_month=10, target_year=2026)
    for fc in pune_forecast:
        print(f"Service: {fc['service_type']:<15} | Predicted Bookings: {fc['predicted_demand']:<4} | Reason: {fc['seasonality_insight']}")
