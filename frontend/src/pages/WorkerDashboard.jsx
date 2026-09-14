import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  BookOpen, 
  Award,
  RefreshCw,
  Info,
  Layers,
  Lock,
  LogIn,
  UserCheck,
  GraduationCap,
  Check,
  X,
  PlayCircle,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CooperativeBadge, StatusBadge } from '../components/Badge';

export const WorkerDashboard = ({ activeWorker, onOpenAuth }) => {
  const { user, isWorker, isAuthenticated, login } = useAuth();
  
  // Requirement 4: Visible only to the logged-in worker
  const isAuthorizedWorker = isAuthenticated && (isWorker || user?.role === 'worker');
  const effectiveWorkerId = user?.worker_id || activeWorker?.worker_id || (isAuthorizedWorker ? 1 : null);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggingInAs, setLoggingInAs] = useState(null);

  // Retraining Flow State
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [completingTraining, setCompletingTraining] = useState(false);
  const [completedSuccessMsg, setCompletedSuccessMsg] = useState(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  const trainingModules = [
    {
      title: "Module 1: Professional Customer Communication & Punctuality",
      duration: "10 mins",
      topics: [
        "Call customer 30 minutes prior to arrival with confirmed ETA",
        "Explain inspection findings and itemized spare-parts cost before starting work",
        "Maintain courteous, respectful, and transparent communication at all times"
      ]
    },
    {
      title: "Module 2: Worksite Safety Standards & Quality Verification",
      duration: "15 mins",
      topics: [
        "Use certified ISI safety equipment, insulated tools, and personal protection gear",
        "Inspect supply mains, valves, and wiring before disassembly",
        "Perform standardized pressure, voltage, and leak integrity tests"
      ]
    },
    {
      title: "Module 3: Service Walkthrough, Cleanliness & Customer Sign-off",
      duration: "10 mins",
      topics: [
        "Clean up worksite debris, wiping down all surrounding fixtures",
        "Demonstrate the completed repair or installation directly to the homeowner",
        "Guide customer through transparent digital invoicing and rating submission"
      ]
    }
  ];

  const handleCompleteRetraining = async () => {
    const targetWorkerId = dashboardData?.worker?.id || effectiveWorkerId;
    if (!targetWorkerId) return;
    setCompletingTraining(true);
    try {
      await api.updateWorkerRetraining(targetWorkerId, 'Completed');
      setDashboardData(prev => ({
        ...prev,
        worker: { ...prev.worker, retraining_status: 'Completed' },
        retraining: {
          ...prev.retraining,
          status: 'Completed',
          isMandatoryRetraining: false,
          isCompleted: true
        }
      }));
      setCompletedSuccessMsg('🎉 Retraining completed successfully! Your status is now "Completed" and visible to your Society Admin.');
      setIsTrainingModalOpen(false);
      setTimeout(() => setCompletedSuccessMsg(null), 8000);
    } catch (err) {
      alert('Failed to update retraining status: ' + (err.response?.data?.error || err.message));
    } finally {
      setCompletingTraining(false);
    }
  };

  const handleDemoWorkerLogin = async (email, workerName) => {
    setLoggingInAs(workerName);
    try {
      await login({
        emailOrPhone: email,
        password: 'worker123'
      });
    } catch (err) {
      alert('Login failed: ' + err.message);
    } finally {
      setLoggingInAs(null);
    }
  };

  const fetchWorkerDashboard = async () => {
    if (!effectiveWorkerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.getWorkerDashboard(effectiveWorkerId);
      if (res.data.success) {
        setDashboardData(res.data.data);
      } else {
        setError(res.data.error || 'Failed to load worker dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerDashboard();
  }, [effectiveWorkerId]);

  // If not logged in as a worker, show the Worker Portal Access Guard
  if (!isAuthorizedWorker && !activeWorker) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-fadeIn">
        <div className="glass-card rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Worker Confidential Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Worker Personal Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              This dashboard is <strong>visible only to the logged-in service worker</strong>. Sign in to view your verified 90% direct earnings, monthly jobs fulfilled, historical 6-month rating trend, and cooperative upskilling status.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenAuth ? onOpenAuth('login', 'worker') : null}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Worker Account</span>
            </button>
            <button
              onClick={() => onOpenAuth ? onOpenAuth('signup', 'worker') : null}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
            >
              Register New Worker
            </button>
          </div>

          {/* Quick Demo Logins for Hackathon Testing */}
          <div className="pt-6 border-t border-slate-100 text-left">
            <span className="text-[11px] uppercase font-extrabold text-slate-400 block mb-3 text-center">
              Quick Test Login as Seeded Worker:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoWorkerLogin('ramesh.shinde@example.com', 'Ramesh Shinde')}
                disabled={!!loggingInAs}
                className="p-3 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 text-left transition group"
              >
                <div className="text-xs font-bold text-emerald-950 group-hover:text-emerald-800">
                  Ramesh Shinde
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                  ★ 4.9 • Electrician
                </div>
                <div className="text-[9.5px] text-emerald-600 mt-1 font-medium">
                  {loggingInAs === 'Ramesh Shinde' ? 'Signing in...' : 'Active Status →'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoWorkerLogin('ganesh.shinde@example.com', 'Ganesh Shinde')}
                disabled={!!loggingInAs}
                className="p-3 rounded-2xl bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 text-left transition group"
              >
                <div className="text-xs font-bold text-amber-950 group-hover:text-amber-800">
                  Ganesh Shinde
                </div>
                <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                  ★ 3.6 • Plumber
                </div>
                <div className="text-[9.5px] text-amber-800 mt-1 font-extrabold">
                  {loggingInAs === 'Ganesh Shinde' ? 'Signing in...' : 'Retraining Assigned →'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoWorkerLogin('kavita.more@example.com', 'Kavita More')}
                disabled={!!loggingInAs}
                className="p-3 rounded-2xl bg-rose-50/80 hover:bg-rose-100/80 border border-rose-200 text-left transition group"
              >
                <div className="text-xs font-bold text-rose-950 group-hover:text-rose-800">
                  Kavita More
                </div>
                <div className="text-[10px] text-rose-700 font-semibold mt-0.5">
                  ★ 3.5 • Painter
                </div>
                <div className="text-[9.5px] text-rose-800 mt-1 font-extrabold">
                  {loggingInAs === 'Kavita More' ? 'Signing in...' : 'Manual Review Flag →'}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const worker = dashboardData?.worker;
  const stats = dashboardData?.stats;
  const ratingTrend = dashboardData?.ratingTrend || [];
  const retraining = dashboardData?.retraining;
  const recentBookings = dashboardData?.recentBookings || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              {worker?.name ? worker.name.charAt(0) : 'W'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-800 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
                  Worker Personal Portal
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active & Available for Bookings
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                {worker?.name || 'Worker Profile'}
              </h1>
              <p className="text-xs text-slate-500">
                {worker?.skill_type} • {worker?.society_name || 'Pune Shramik Sahakari Sanstha'} • Base Rate: ₹{worker?.hourly_rate}/hr
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchWorkerDashboard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 font-medium">Loading personal earnings & rating trend metrics...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <strong>Error loading dashboard:</strong> {error}
        </div>
      ) : (
        <>
          {/* Success Banner upon Retraining Completion */}
          {completedSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{completedSuccessMsg}</span>
              </div>
              <button onClick={() => setCompletedSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900 font-bold px-2 py-1">✕</button>
            </div>
          )}

          {/* REQUIREMENT 3: Retraining Banner (Actionable for Assigned, Celebratory for Completed) */}
          {retraining?.status === 'Completed' || dashboardData?.worker?.retraining_status === 'Completed' ? (
            <div className="p-5 rounded-3xl border bg-emerald-50/90 border-emerald-300 text-emerald-950 transition shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-2xl text-white bg-emerald-600 shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-emerald-950">
                        Retraining Status: Completed
                      </h3>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white border border-emerald-300 text-emerald-800">
                        Rating: {worker?.rating} / 5.0 • Verified
                      </span>
                    </div>
                    <p className="text-xs mt-1 leading-relaxed text-emerald-900">
                      You have successfully completed your cooperative refresher upskilling modules. 
                      Your status is marked as <strong>Completed</strong> and is fully visible to your Society Admin. 
                      You continue to receive democratic marketplace job allocations without restriction.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center">
                  <div className="px-3 py-1.5 rounded-xl bg-white text-xs font-bold shadow-xs border border-emerald-200 text-emerald-800 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Status: Completed</span>
                  </div>
                  <button
                    onClick={() => setIsTrainingModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    Review Modules
                  </button>
                </div>
              </div>
            </div>
          ) : (retraining?.isMandatoryRetraining || retraining?.status === 'Assigned' || retraining?.status === 'Still Below Threshold') && (
            <div className={`p-5 rounded-3xl border transition ${
              retraining.isStillBelowThreshold 
                ? 'bg-amber-50/90 border-amber-300 text-amber-950' 
                : 'bg-indigo-50/90 border-indigo-200 text-indigo-950'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-2xl text-white ${retraining.isStillBelowThreshold ? 'bg-amber-600' : 'bg-indigo-600'}`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold">
                        {retraining.isStillBelowThreshold 
                          ? 'Retraining Status: Still Below Threshold (Society Review in Progress)' 
                          : 'Mandatory Skill Refresher: Assigned'}
                      </h3>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/80 border border-current">
                        Rating: {worker.rating} / 5.0 (Threshold: 3.8)
                      </span>
                    </div>
                    <p className="text-xs mt-1 leading-relaxed text-slate-700">
                      <strong>Important Protection:</strong> Your account is <strong>NOT blocked or suspended</strong>. 
                      You can continue accepting new service jobs. SevaSetu cooperatives believe in continuous worker upskilling 
                      over arbitrary algorithmic punishment.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center">
                  <div className="px-3 py-1.5 rounded-xl bg-white text-xs font-bold shadow-xs border border-slate-200 text-slate-800">
                    Status: <span className="text-indigo-700 font-extrabold">{retraining.status}</span>
                  </div>

                  {/* Actionable Training Button */}
                  <button
                    onClick={() => setIsTrainingModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition active:scale-95 whitespace-nowrap"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Start Training</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* REQUIREMENT 4: Key KPI Metrics (Earnings, Jobs, MoM Growth, Rating) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Total Earnings This Month (90% Net Direct Payout) */}
            <div className="glass-card p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                <span>Net Earnings (Sep 2026)</span>
                <IndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  ₹{stats?.currentMonthEarnings || 0}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    90% Net Direct Payout
                  </span>
                  <span className="text-[10.5px] text-slate-400">
                    Gross: ₹{stats?.currentMonthGross || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Number of Jobs Completed This Month */}
            <div className="glass-card p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                <span>Jobs Completed (This Month)</span>
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {stats?.jobsCompletedThisMonth || 0}
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-1.5 block">
                  Fulfilled & customer confirmed
                </span>
              </div>
            </div>

            {/* 3. Month-over-Month Growth % */}
            <div className="glass-card p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                <span>MoM Earnings Growth</span>
                {(stats?.momEarningsGrowth || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                )}
              </div>
              <div>
                <div className={`text-2xl sm:text-3xl font-black ${(stats?.momEarningsGrowth || 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {(stats?.momEarningsGrowth || 0) >= 0 ? `+${stats?.momEarningsGrowth}%` : `${stats?.momEarningsGrowth}%`}
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-1.5 block">
                  vs previous month (₹{stats?.prevMonthEarnings || 0})
                </span>
              </div>
            </div>

            {/* 4. Average Rating & Reviews */}
            <div className="glass-card p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                <span>Average Rating</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-1.5">
                  <span>★ {worker?.rating || 4.8}</span>
                  <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-1.5 block">
                  Based on {worker?.review_count || 12} customer reviews
                </span>
              </div>
            </div>

          </div>

          {/* REQUIREMENT 4: Rating Trend Over Time (Interactive Line Chart) */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span>Rating Trend Over Time (Last 6 Months)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track quality trajectory and see where you stand relative to the 3.8 cooperative benchmark.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-brand-700">
                  <span className="w-3 h-1 bg-brand-600 rounded"></span>
                  Your Rating
                </span>
                <span className="flex items-center gap-1.5 text-rose-600">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-rose-500"></span>
                  3.8 Benchmark
                </span>
              </div>
            </div>

            {/* Custom SVG Line Chart for Rating Trend */}
            <div className="w-full bg-slate-50/70 p-4 sm:p-6 rounded-2xl border border-slate-200/70">
              <div className="relative h-48 w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160">
                  <defs>
                    <linearGradient id="workerRatingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines for Y-axis (3.0 to 5.0) */}
                  {[3.0, 3.5, 3.8, 4.0, 4.5, 5.0].map((yVal, idx) => {
                    const yPos = 140 - ((yVal - 3.0) / 2.0) * 120;
                    const isBenchmark = yVal === 3.8;
                    return (
                      <g key={idx}>
                        <line 
                          x1="40" 
                          y1={yPos} 
                          x2="580" 
                          y2={yPos} 
                          stroke={isBenchmark ? '#f43f5e' : '#e2e8f0'} 
                          strokeDasharray={isBenchmark ? '4 4' : 'none'} 
                          strokeWidth={isBenchmark ? '1.5' : '1'} 
                        />
                        <text 
                          x="32" 
                          y={yPos + 3} 
                          fontSize="10" 
                          fill={isBenchmark ? '#e11d48' : '#94a3b8'} 
                          textAnchor="end" 
                          fontWeight={isBenchmark ? 'bold' : 'normal'}
                        >
                          {yVal.toFixed(1)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Rating Trend Line and Fill */}
                  {ratingTrend.length > 1 && (() => {
                    const points = ratingTrend.map((pt, i) => {
                      const x = 60 + (i * (500 / (ratingTrend.length - 1)));
                      const y = 140 - (((pt.rating || 4.5) - 3.0) / 2.0) * 120;
                      return { x, y, pt };
                    });

                    const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
                    const areaD = `${pathD} L ${points[points.length - 1].x} 140 L ${points[0].x} 140 Z`;

                    return (
                      <g>
                        <path d={areaD} fill="url(#workerRatingGradient)" />
                        <path d={pathD} fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        {points.map((p, idx) => (
                          <g key={idx} className="group cursor-pointer">
                            <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#059669" strokeWidth="2.5" />
                            <text 
                              x={p.x} 
                              y={p.y - 10} 
                              fontSize="11" 
                              fontWeight="bold" 
                              fill="#065f46" 
                              textAnchor="middle"
                            >
                              {p.pt.rating}
                            </text>
                            <text 
                              x={p.x} 
                              y="155" 
                              fontSize="10.5" 
                              fontWeight="600" 
                              fill="#64748b" 
                              textAnchor="middle"
                            >
                              {p.pt.month}
                            </text>
                          </g>
                        ))}
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </div>

          {/* Audited 10% Platform Social Security & Safety Pool Breakdown */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Where Your 10% Platform Fee Goes (100% Social Security Backing)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Unlike corporate gig apps extracting 25–30% profits, your 10% is split transparently into three protected funds:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-blue-900">Platform Operations (6%)</span>
                    <span className="text-xs font-black text-blue-700">₹{stats?.feeBreakdown?.platformOps || 0}</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Maintains cloud infrastructure, SMS gateways, customer verification, and democratic cooperative app development.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-blue-600 mt-3 block">Non-profit cost recovery</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-emerald-900">Govt Insurance Fund (2%)</span>
                    <span className="text-xs font-black text-emerald-700">₹{stats?.feeBreakdown?.insuranceFund || 0}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Auto-funds your <strong>PMSBY & PMJJBY</strong> premiums, providing comprehensive accidental disability and life coverage.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 mt-3 block">Govt Social Security Enrolled</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-amber-900">Training & Quality Fund (2%)</span>
                    <span className="text-xs font-black text-amber-700">₹{stats?.feeBreakdown?.trainingFund || 0}</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Funds vocational toolkits, safety equipment, and free cooperative retraining modules to continuously upgrade your craft.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-amber-600 mt-3 block">Upskilling & Toolkit Grant</span>
              </div>
            </div>
          </div>

          {/* Recent Completed Bookings */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-900 mb-4">
              Your Recent Jobs & Direct Payouts ({recentBookings.length})
            </h2>

            {recentBookings.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl text-xs text-slate-500">
                No recent bookings recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((b) => (
                  <div 
                    key={b.id} 
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={b.status} />
                        <span className="font-bold text-slate-900">#{b.id} • {b.service_type}</span>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded capitalize">
                          {b.booking_type}
                        </span>
                      </div>
                      <div className="text-slate-600">
                        Customer: <strong className="text-slate-900">{b.customer_name}</strong> | Location: {b.location}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Date: {b.scheduled_date}
                      </div>
                    </div>

                    <div className="text-right sm:self-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Your Net Payout (90%)</div>
                      <div className="text-base font-black text-emerald-700">₹{Math.round((b.total_amount || 0) * 0.90)}</div>
                      <span className="text-[9px] text-slate-400">Total Billed: ₹{b.total_amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Retraining Flow Modal */}
      {isTrainingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-brand-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <GraduationCap className="w-6 h-6 text-brand-300" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold">Cooperative Upskilling & Quality Refresher</h2>
                  <p className="text-xs text-indigo-200">
                    Mandatory vocational modules for worker ratings below 3.8
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsTrainingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Cooperative Quality Refresher Program</strong>
                  <span>
                    In accordance with democratic cooperative rules, this 3-module refresher restores your high-satisfaction rating standards. 
                    Review each module below and click <strong>Mark as Complete</strong> to certify your completion with your Society Admin.
                  </span>
                </div>
              </div>

              {/* Module Selector Tabs */}
              <div className="grid grid-cols-3 gap-2">
                {trainingModules.map((m, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveModuleIndex(idx)}
                    className={`p-3 rounded-2xl text-left border text-xs transition ${
                      activeModuleIndex === idx
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[10px] opacity-80 font-bold uppercase">Module {idx + 1}</div>
                    <div className="font-extrabold truncate mt-0.5">Part {idx + 1}</div>
                    <div className="text-[10px] mt-1 opacity-90">{m.duration}</div>
                  </button>
                ))}
              </div>

              {/* Active Module Details */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Module {activeModuleIndex + 1} of 3
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                      {trainingModules[activeModuleIndex].title}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    ⏱️ {trainingModules[activeModuleIndex].duration}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Key Learning Outcomes:</h4>
                  <ul className="space-y-2">
                    {trainingModules[activeModuleIndex].topics.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span className="leading-relaxed">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500">
                  💡 <strong>Tip for Society Verification:</strong> Once completed, your Society Admin will see the status update in real time on their society dashboard.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Worker: <strong className="text-slate-800">{worker?.name || 'Logged-in Worker'}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTrainingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleCompleteRetraining}
                  disabled={completingTraining}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold shadow-md transition active:scale-95"
                >
                  {completingTraining ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Complete</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default WorkerDashboard;
