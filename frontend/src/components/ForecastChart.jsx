import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Info, 
  Zap, 
  Wrench, 
  Hammer, 
  HeartHandshake, 
  Paintbrush,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

const SERVICE_ICONS = {
  Electrician: Zap,
  Plumber: Wrench,
  Carpenter: Hammer,
  Caregiver: HeartHandshake,
  Painter: Paintbrush
};

const SERVICE_COLORS = {
  Electrician: 'from-amber-500 to-orange-500 border-amber-200 bg-amber-50/70 text-amber-900',
  Plumber: 'from-blue-500 to-cyan-500 border-blue-200 bg-blue-50/70 text-blue-900',
  Carpenter: 'from-amber-700 to-yellow-800 border-amber-300 bg-amber-50/80 text-amber-950',
  Caregiver: 'from-rose-500 to-pink-500 border-rose-200 bg-rose-50/70 text-rose-900',
  Painter: 'from-purple-500 to-indigo-500 border-purple-200 bg-purple-50/70 text-purple-900'
};

export const ForecastChart = ({ district = 'Pune' }) => {
  const [forecasts, setForecasts] = useState([]);
  const [targetMonth, setTargetMonth] = useState(10); // Oct 2026
  const [targetYear, setTargetYear] = useState(2026);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('ml_model');

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await api.getForecast(district, targetMonth, targetYear);
      if (res.data.success) {
        setForecasts(res.data.forecasts || []);
        setSource(res.data.source || 'Scikit-Learn Regression Engine');
      }
    } catch (err) {
      console.error('Error fetching AI forecast:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [district, targetMonth, targetYear]);

  // Max predicted demand for relative percentage bar scaling
  const maxDemand = Math.max(...forecasts.map(f => f.predicted_demand || 1), 250);

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-200/90 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-brand-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                AI Seasonal Demand Forecaster
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 uppercase">
                  {district} District
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Machine learning time-series regression trained on seasonal demand & monsoon/festive climate patterns
              </p>
            </div>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 hidden sm:block">Forecast Period:</label>
          <select
            value={targetMonth}
            onChange={(e) => setTargetMonth(parseInt(e.target.value))}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={9}>September 2026 (Monsoon/Pre-festive)</option>
            <option value={10}>October 2026 (Diwali / Festive Peak)</option>
            <option value={11}>November 2026 (Wedding / Winter Start)</option>
            <option value={12}>December 2026 (Winter Season)</option>
            <option value={3}>March 2027 (Summer AC/Electricals)</option>
            <option value={7}>July 2027 (Monsoon Plumbing Peak)</option>
          </select>
        </div>
      </div>

      {/* Grid of Predictions */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 font-medium">Running Scikit-Learn seasonal inference model...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {forecasts.map((fc, idx) => {
            const Icon = SERVICE_ICONS[fc.service_type] || Wrench;
            const colorClass = SERVICE_COLORS[fc.service_type] || 'from-slate-600 to-slate-700 bg-slate-50 border-slate-200';
            const percentage = Math.round((fc.predicted_demand / maxDemand) * 100);

            return (
              <div 
                key={idx} 
                className="rounded-2xl p-4 border border-slate-200/80 bg-white hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{fc.service_type}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-indigo-700">
                        {fc.predicted_demand}
                      </span>
                      <span className="text-[10px] text-slate-400 block -mt-0.5">bookings / mo</span>
                    </div>
                  </div>

                  {/* Relative Demand Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 my-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-brand-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Confidence Interval */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-3">
                    <span>95% Confidence Range:</span>
                    <span className="font-semibold text-slate-700">{fc.confidence_interval}</span>
                  </div>

                  {/* Seasonal Insight Tag */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <span>{fc.seasonality_insight}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span>Target: {fc.target_period}</span>
                  <span className="text-brand-600 font-bold">High Society Readiness</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Model Footnote & Society Action Tip */}
      <div className="mt-5 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 via-brand-50 to-indigo-50 border border-indigo-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span className="text-indigo-950 font-medium">
            <strong>Cooperative Federation Strategy:</strong> Based on the next-month demand surge in {district}, mobilize idle workers and schedule skill-refresh bootcamps.
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-white/80 px-2 py-1 rounded border border-slate-200">
          Source: Scikit-Learn GradientBoost (32-month history)
        </span>
      </div>
    </div>
  );
};

export default ForecastChart;
