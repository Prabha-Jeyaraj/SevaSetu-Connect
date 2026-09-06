"""
Synthetic Dataset Generator for Gig-Work Demand Forecasting
SevaSetu Connect - Smart India Hackathon (SIH26089)

Generates realistic monthly gig-work demand across districts with seasonal patterns:
- Plumber: High surge during Monsoon (June-Sept) due to waterlogging and leakages.
- Electrician: Surge in Summer (March-May) for ACs/coolers and Diwali festive lighting (Oct-Nov).
- Carpenter: Surge during pre-festive renovation months (Aug-Nov).
- Caregiver: Consistent high baseline with steady growth.
- Painter: Sharp surge in pre-Diwali / pre-wedding seasons (Sept-Nov).
"""

import os
import random
import pandas as pd
import numpy as np
from datetime import datetime

def generate_demand_dataset():
    np.random.seed(42)
    random.seed(42)

    districts = {
        'Pune': {'base_scale': 1.1, 'growth': 0.08},
        'Bengaluru': {'base_scale': 1.3, 'growth': 0.10},
        'Delhi': {'base_scale': 1.4, 'growth': 0.07},
        'Mumbai': {'base_scale': 1.5, 'growth': 0.09},
        'Jaipur': {'base_scale': 0.9, 'growth': 0.06}
    }

    services = ['Electrician', 'Plumber', 'Carpenter', 'Caregiver', 'Painter']
    
    # 32 Months from Jan 2024 to Aug 2026
    start_date = pd.to_datetime('2024-01-01')
    end_date = pd.to_datetime('2026-08-01')
    date_range = pd.date_range(start=start_date, end=end_date, freq='MS')

    records = []

    for dt in date_range:
        month = dt.month
        year = dt.year
        year_idx = year - 2024

        for district, d_meta in districts.items():
            base_d_multiplier = d_meta['base_scale'] * (1 + year_idx * d_meta['growth'])

            for service in services:
                # Base counts by service
                if service == 'Electrician':
                    base_count = 120
                    # Summer peak (March-May) & Diwali peak (Oct-Nov)
                    if month in [3, 4, 5, 6]:
                        seasonal_mult = 1.65 + np.random.uniform(0.05, 0.25)
                    elif month in [10, 11]:
                        seasonal_mult = 1.40 + np.random.uniform(0.05, 0.15)
                    elif month in [12, 1]:
                        seasonal_mult = 0.85
                    else:
                        seasonal_mult = 1.05

                elif service == 'Plumber':
                    base_count = 110
                    # Monsoon peak (June-Sept)
                    if month in [6, 7, 8, 9]:
                        seasonal_mult = 1.85 + np.random.uniform(0.10, 0.35)
                    elif month in [1, 2]:
                        seasonal_mult = 0.80
                    else:
                        seasonal_mult = 1.0

                elif service == 'Carpenter':
                    base_count = 95
                    # Autumn / Post-monsoon renovation (Aug-Nov)
                    if month in [8, 9, 10, 11]:
                        seasonal_mult = 1.45 + np.random.uniform(0.05, 0.20)
                    else:
                        seasonal_mult = 0.95

                elif service == 'Caregiver':
                    base_count = 140
                    # Stable with slight winter / seasonal fluctuation
                    if month in [12, 1, 6, 7]:
                        seasonal_mult = 1.15 + np.random.uniform(0.02, 0.08)
                    else:
                        seasonal_mult = 1.0 + np.random.uniform(-0.04, 0.05)

                elif service == 'Painter':
                    base_count = 80
                    # Pre-Diwali / Wedding season (Sept-Nov)
                    if month in [9, 10, 11]:
                        seasonal_mult = 1.90 + np.random.uniform(0.10, 0.30)
                    elif month in [6, 7, 8]: # Monsoon is very low for painting
                        seasonal_mult = 0.45
                    else:
                        seasonal_mult = 0.90

                # Calculate final booking demand with natural gaussian noise
                noise = np.random.normal(1.0, 0.05)
                final_demand = int(round(base_count * base_d_multiplier * seasonal_mult * noise))
                final_demand = max(10, final_demand)

                records.append({
                    'date': dt.strftime('%Y-%m-%d'),
                    'year': year,
                    'month': month,
                    'district': district,
                    'service_type': service,
                    'booking_count': final_demand
                })

    df = pd.DataFrame(records)

    # Save to CSV
    os.makedirs(os.path.join(os.path.dirname(__file__), 'data'), exist_ok=True)
    csv_path = os.path.join(os.path.dirname(__file__), 'data', 'synthetic_demand_data.csv')
    df.to_csv(csv_path, index=False)
    
    print(f"Generated {len(df)} rows of synthetic demand dataset.")
    print(f"Saved to: {csv_path}")
    print("\nSample Preview:")
    print(df.head(10))
    print(f"\nUnique Districts: {df['district'].unique().tolist()}")
    print(f"Unique Services: {df['service_type'].unique().tolist()}")
    print(f"Date Range: {df['date'].min()} to {df['date'].max()}")
    return df

if __name__ == '__main__':
    generate_demand_dataset()
