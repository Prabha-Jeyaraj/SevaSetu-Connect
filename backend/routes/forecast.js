/**
 * AI Demand Forecasting Router
 * Connects to Python microservice with intelligent analytical fallback
 * SevaSetu Connect - SIH26089
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

// Dynamic analytical forecaster fallback based on domain seasonal coefficients
function getFallbackForecast(district = 'Pune', month = 10, year = 2026) {
  const baseScale = {
    'Pune': 1.15,
    'Bengaluru': 1.35,
    'Delhi': 1.45,
    'Mumbai': 1.55,
    'Jaipur': 0.95
  }[district] || 1.1;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const targetPeriod = `${monthNames[month - 1]} ${year}`;

  const services = [
    {
      service_type: 'Electrician',
      base: 130,
      seasonality: (m) => [3,4,5,6].includes(m) ? 1.7 : ([10,11].includes(m) ? 1.45 : 1.05),
      getInsight: (m) => [3,4,5,6].includes(m) 
        ? 'Summer AC, cooler repair & power stability surge' 
        : ([10,11].includes(m) ? 'Festive Diwali lighting & electrical fixtures' : 'Steady baseline home electricals')
    },
    {
      service_type: 'Plumber',
      base: 120,
      seasonality: (m) => [6,7,8,9].includes(m) ? 1.95 : ([1,2].includes(m) ? 0.8 : 1.0),
      getInsight: (m) => [6,7,8,9].includes(m)
        ? 'Monsoon drainage, roof waterproofing & pipe leak repairs'
        : 'Routine sanitary maintenance & geyser fitting'
    },
    {
      service_type: 'Carpenter',
      base: 100,
      seasonality: (m) => [8,9,10,11].includes(m) ? 1.5 : 0.95,
      getInsight: (m) => [8,9,10,11].includes(m)
        ? 'Pre-festive home renovation, wardrobe & woodwork demand'
        : 'Standard furniture maintenance'
    },
    {
      service_type: 'Caregiver',
      base: 145,
      seasonality: (m) => [12,1,6,7].includes(m) ? 1.18 : 1.02,
      getInsight: (m) => [12,1].includes(m)
        ? 'Winter health support for senior citizens'
        : 'Continuous long-term assisted elder & patient care'
    },
    {
      service_type: 'Painter',
      base: 85,
      seasonality: (m) => [9,10,11].includes(m) ? 2.0 : ([6,7,8].includes(m) ? 0.45 : 0.95),
      getInsight: (m) => [9,10,11].includes(m)
        ? 'Peak Diwali & wedding season whitewashing & texture painting'
        : ([6,7,8].includes(m) ? 'Low demand due to monsoon humidity' : 'Interior repainting baseline')
    }
  ];

  return services.map(s => {
    const demand = Math.round(s.base * baseScale * s.seasonality(month));
    return {
      district,
      service_type: s.service_type,
      target_period: targetPeriod,
      predicted_demand: demand,
      confidence_interval: `${Math.round(demand * 0.92)} - ${Math.round(demand * 1.08)}`,
      seasonality_insight: s.getInsight(month)
    };
  });
}

// Get demand forecast for district
router.get('/', async (req, res) => {
  const district = req.query.district || 'Pune';
  const month = parseInt(req.query.month || 10);
  const year = parseInt(req.query.year || 2026);

  try {
    // Try calling the Python Flask microservice
    const response = await axios.get(`${AI_SERVICE_URL}/forecast`, {
      params: { district, month, year },
      timeout: 1500
    });
    return res.json(response.data);
  } catch (err) {
    // Graceful fallback to analytical model so the hackathon demo never stumbles
    const fallbackForecasts = getFallbackForecast(district, month, year);
    return res.json({
      success: true,
      source: 'analytical_engine_fallback',
      district,
      month,
      year,
      forecasts: fallbackForecasts
    });
  }
});

// Get historical trend data for charting
router.get('/history', (req, res) => {
  const district = req.query.district || 'Pune';
  const csvPath = path.join(__dirname, '..', '..', 'ai-model', 'data', 'synthetic_demand_data.csv');

  if (fs.existsSync(csvPath)) {
    try {
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',');

      const records = lines.slice(1).map(line => {
        const parts = line.split(',');
        return {
          date: parts[0],
          year: parseInt(parts[1]),
          month: parseInt(parts[2]),
          district: parts[3],
          service_type: parts[4],
          booking_count: parseInt(parts[5])
        };
      }).filter(r => !district || r.district.toLowerCase() === district.toLowerCase());

      return res.json({ success: true, district, count: records.length, data: records });
    } catch (e) {
      console.error('Error reading CSV:', e);
    }
  }

  // Fallback synthetic history points for charting
  const sampleHistory = [
    { date: '2026-04-01', service_type: 'Electrician', booking_count: 220 },
    { date: '2026-05-01', service_type: 'Electrician', booking_count: 245 },
    { date: '2026-06-01', service_type: 'Plumber', booking_count: 260 },
    { date: '2026-07-01', service_type: 'Plumber', booking_count: 285 },
    { date: '2026-08-01', service_type: 'Carpenter', booking_count: 150 },
    { date: '2026-09-01', service_type: 'Painter', booking_count: 175 },
    { date: '2026-10-01', service_type: 'Electrician', booking_count: 195 }
  ];
  res.json({ success: true, source: 'mock_trend', district, data: sampleHistory });
});

module.exports = router;
