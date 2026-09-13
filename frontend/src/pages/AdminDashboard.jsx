import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  IndianRupee, 
  Calendar, 
  Phone, 
  RefreshCw,
  Lock,
  Award,
  AlertTriangle,
  Star,
  BookOpen
} from 'lucide-react';
import api from '../services/api';
import { CooperativeBadge, StatusBadge } from '../components/Badge';
import ForecastChart from '../components/ForecastChart';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard = ({ selectedSocietyId, setSelectedSocietyId, societies = [] }) => {
  const { user, isSocietyAdmin, isSuperAdmin } = useAuth();
  
  // If society admin is logged in, force their own society_id
  const effectiveSocietyId = isSocietyAdmin && user?.society_id ? user.society_id : (selectedSocietyId || 1);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingWorkerId, setUpdatingWorkerId] = useState(null);
  const [updatingRetrainingId, setUpdatingRetrainingId] = useState(null);
  const [leaderboardSort, setLeaderboardSort] = useState('rating'); // 'rating', 'jobs', 'earnings'
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getSocietyDashboard(effectiveSocietyId);
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching society dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [effectiveSocietyId]);

  // Flip worker verification status
  const handleToggleVerification = async (workerId, currentStatus) => {
    const nextStatus = currentStatus === 'verified' ? 'pending' : 'verified';
    setUpdatingWorkerId(workerId);
    try {
      const res = await api.verifyWorker(workerId, nextStatus);
      if (res.data.success) {
        setActionSuccess(`Worker #${workerId} verification status set to '${nextStatus}'.`);
        fetchDashboard();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      alert('Verification update failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setUpdatingWorkerId(null);
    }
  };

  // Update worker retraining status
  const handleUpdateRetraining = async (workerId, newStatus) => {
    setUpdatingRetrainingId(workerId);
    try {
      const res = await api.updateWorkerRetraining(workerId, newStatus);
      if (res.data.success) {
        setActionSuccess(`Worker #${workerId} retraining status set to '${newStatus}'.`);
        fetchDashboard();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      alert('Failed to update retraining status: ' + (err.response?.data?.error || err.message));
    } finally {
      setUpdatingRetrainingId(null);
    }
  };

  // Update booking status
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await api.updateBookingStatus(bookingId, newStatus);
      fetchDashboard();
    } catch (err) {
      alert('Status update failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const society = dashboardData?.society;
  const stats = dashboardData?.stats || {};
  const pendingWorkers = dashboardData?.pendingWorkers || [];
  const allWorkers = dashboardData?.allWorkers || [];
  const recentBookings = dashboardData?.recentBookings || [];

  const rawLeaderboard = dashboardData?.leaderboardWorkers || allWorkers.map(w => ({
    ...w,
    completed_jobs_count: w.review_count || 0,
    total_gross_earnings: (w.review_count || 0) * (w.hourly_rate || 250) * 2,
    total_net_payout: Math.round(((w.review_count || 0) * (w.hourly_rate || 250) * 2) * 0.85),
    is_retraining_flagged: w.rating < 3.8 || w.retraining_status === 'Assigned' || w.retraining_status === 'Still Below Threshold',
    requires_manual_review: w.retraining_status === 'Still Below Threshold'
  }));

  const leaderboardWorkers = rawLeaderboard.slice().sort((a, b) => {
    if (leaderboardSort === 'jobs') {
      return (b.completed_jobs_count || 0) - (a.completed_jobs_count || 0);
    }
    if (leaderboardSort === 'earnings') {
      return (b.total_gross_earnings || 0) - (a.total_gross_earnings || 0);
    }
    return (b.rating || 0) - (a.rating || 0);
  });

  return (
    <div className="space-y-8">
      
      {/* Society Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-700 to-coop-blue text-white flex items-center justify-center font-extrabold text-xl shadow-md">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                  Cooperative Society Portal
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Reg: {society?.registration_number}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                {society?.name || 'Loading Society...'}
              </h1>
              <p className="text-xs text-slate-500">
                {society?.district} District, {society?.state} • Contact: {society?.contact_phone} • {society?.contact_email}
              </p>
            </div>
          </div>

          {/* If Super Admin, allow switching society for audit. If Society Admin, show locked scope */}
          {isSuperAdmin ? (
            <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-brand-400">Auditing Society:</span>
              <select
                value={effectiveSocietyId}
                onChange={(e) => setSelectedSocietyId(parseInt(e.target.value))}
                className="bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700"
              >
                {societies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.district})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl px-4 py-2 text-right">
              <div className="text-[10px] uppercase font-bold text-indigo-900 flex items-center gap-1 justify-end">
                <Lock className="w-3 h-3 text-indigo-600" />
                <span>Isolated Society Tenant</span>
              </div>
              <span className="text-xs font-bold text-indigo-800">
                Logged in as {user?.name || 'Society Admin'}
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-lg flex items-center justify-between animate-fadeIn">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 font-medium">Loading society operations...</p>
        </div>
      ) : (
        <>
          {/* Operations & Revenue Metrics (15% Fee Structure & 85% Worker Payout) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="glass-card p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                <span>Affiliated Workers</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{stats.totalMembers || 0}</div>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                  {stats.verifiedMembers || 0} verified members
                </span>
              </div>
            </div>

            <div className="glass-card p-5 rounded-3xl border border-amber-200 bg-amber-50/40 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-800 text-xs font-semibold mb-2">
                <span>Pending Verifications</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-amber-900">{stats.pendingVerifications || 0}</div>
                <span className="text-[10px] text-amber-700 font-medium mt-1 block">
                  Awaiting society approval
                </span>
              </div>
            </div>

            <div className="glass-card p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                <span>Total GMV Volume</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">₹{stats.totalCooperativeGmv || 0}</div>
                <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                  {stats.completedBookings || 0} completed bookings
                </span>
              </div>
            </div>

            <div className="glass-card p-5 rounded-3xl border border-emerald-200 bg-emerald-50/30 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                <span>Worker Direct Payout (85%)</span>
                <IndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-emerald-700">₹{stats.workerDirectPayout || 0}</div>
                <span className="text-[10px] text-emerald-800 font-bold mt-1 block">
                  85% paid directly to workers
                </span>
              </div>
            </div>

          </div>

          {/* REQUIREMENT 1: Itemized 15% Platform Fee Component Breakdown */}
          <div className="p-4 rounded-3xl bg-slate-900 text-white shadow-sm border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-extrabold tracking-wide uppercase text-brand-300">
                  Tracked 15% Cooperative Platform Fee Allocation
                </span>
              </div>
              <span className="text-[10.5px] text-slate-400 font-mono">
                Total 15% Platform Retained: ₹{stats.totalPlatformFee || 0}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                <div className="flex items-center justify-between font-bold text-blue-300 mb-1">
                  <span>1. Platform Operations (8%)</span>
                  <span className="text-white text-sm font-black">₹{stats.platformOpsFund || 0}</span>
                </div>
                <p className="text-[10.5px] text-slate-400 leading-snug">
                  Server infrastructure, SMS gateways, matchmaker logic & non-profit administration.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                <div className="flex items-center justify-between font-bold text-emerald-300 mb-1">
                  <span>2. Govt Insurance Fund (5%)</span>
                  <span className="text-white text-sm font-black">₹{stats.insuranceFund || 0}</span>
                </div>
                <p className="text-[10.5px] text-slate-400 leading-snug">
                  PMSBY & PMJJBY accidental/life social security insurance premiums for all active members.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                <div className="flex items-center justify-between font-bold text-amber-300 mb-1">
                  <span>3. Training & Quality Fund (2%)</span>
                  <span className="text-white text-sm font-black">₹{stats.trainingQualityFund || 0}</span>
                </div>
                <p className="text-[10.5px] text-slate-400 leading-snug">
                  Dedicated pool for certified toolkits, apprenticeship workshops & low-rating retraining.
                </p>
              </div>
            </div>
          </div>

          {/* Pending Verification Queue */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Worker Verification Queue ({pendingWorkers.length})</span>
                  {pendingWorkers.length > 0 && (
                    <span className="animate-pulse w-2 h-2 rounded-full bg-amber-500"></span>
                  )}
                </h2>
                <p className="text-xs text-slate-500">
                  Review submitted registrations and grant the cooperative verification badge.
                </p>
              </div>
            </div>

            {pendingWorkers.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                All affiliated workers for this cooperative society are verified.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                      <th className="pb-3">Worker Name</th>
                      <th className="pb-3">Skill & Exp</th>
                      <th className="pb-3">Phone & Area</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingWorkers.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 font-bold text-slate-900">
                          {w.name}
                        </td>
                        <td className="py-3 text-slate-700">
                          <span className="font-semibold text-indigo-700">{w.skill_type}</span> • {w.experience_years} yrs exp
                        </td>
                        <td className="py-3 text-slate-600">
                          <div>{w.phone}</div>
                          <div className="text-[10px] text-slate-400">{w.location}</div>
                        </td>
                        <td className="py-3">
                          <CooperativeBadge isMember={true} verificationStatus={w.verification_status} />
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleToggleVerification(w.id, w.verification_status)}
                            disabled={updatingWorkerId === w.id}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95 disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{updatingWorkerId === w.id ? 'Approving...' : 'Approve & Verify'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* AI Seasonal Demand Forecaster */}
          <ForecastChart district={society?.district || 'Pune'} />

          {/* REQUIREMENT 5: Society Admin Internal Performance Leaderboard */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            {/* Header with Security Disclaimer */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                    <Award className="w-4 h-4" />
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Society Internal Worker Performance Leaderboard
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-900 text-brand-400 border border-slate-700">
                    Confidential Admin View Only
                  </span>
                </div>
                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                  <strong>Internal Governance:</strong> For administrative recognition, cooperative mentorship allocation, and upskilling triggers. 
                  This internal performance view is <em>strictly confidential</em>, is never exposed to customers, and does <strong>NOT</strong> determine public search result ordering (which maintains fair, democratic rotation).
                </p>
              </div>

              {/* Sort Control Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl self-start lg:self-center">
                <span className="text-[10.5px] uppercase font-bold text-slate-400 px-2 hidden sm:inline">Sort By:</span>
                {[
                  { id: 'rating', label: '★ Highest Rating', icon: Star },
                  { id: 'jobs', label: '💼 Jobs Completed', icon: CheckCircle2 },
                  { id: 'earnings', label: '💰 Top Volume', icon: IndianRupee }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setLeaderboardSort(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      leaderboardSort === s.id
                        ? 'bg-white text-indigo-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Review Alert for Workers with 'Still Below Threshold' */}
            {leaderboardWorkers.some(w => w.retraining_status === 'Still Below Threshold') && (
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-900">Manual Society Review Action Required:</strong>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    One or more affiliated workers are flagged as <em>"Still Below Threshold"</em>. As a democratic cooperative federation, accounts are <strong>NEVER blocked or suspended</strong>. Please schedule peer mentorship or 1-on-1 feedback to support their service quality improvement.
                  </p>
                </div>
              </div>
            )}

            {/* Leaderboard Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                    <th className="pb-3 w-12 text-center">Rank</th>
                    <th className="pb-3">Worker & Trade</th>
                    <th className="pb-3">Rating</th>
                    <th className="pb-3">Jobs Completed</th>
                    <th className="pb-3">Gross / Net (85%)</th>
                    <th className="pb-3">Retraining Status</th>
                    <th className="pb-3 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaderboardWorkers.map((w, idx) => {
                    const rankMedal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                    return (
                      <tr 
                        key={w.id} 
                        className={`transition ${w.retraining_status === 'Still Below Threshold' ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/80'}`}
                      >
                        <td className="py-3 text-center text-sm font-black">
                          {rankMedal}
                        </td>
                        <td className="py-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{w.name}</span>
                            <CooperativeBadge isMember={true} verificationStatus={w.verification_status} />
                          </div>
                          <div className="text-[10px] text-slate-500">{w.skill_type} • ₹{w.hourly_rate}/hr</div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1 font-bold text-amber-900">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span>{w.rating}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({w.review_count})</span>
                          </div>
                        </td>
                        <td className="py-3 font-semibold text-slate-800">
                          {w.completed_jobs_count || 0} jobs
                        </td>
                        <td className="py-3">
                          <span className="font-extrabold text-slate-900 block">₹{w.total_gross_earnings || 0}</span>
                          <span className="text-[10px] text-emerald-700 font-bold block">₹{w.total_net_payout || 0} (85% net)</span>
                        </td>
                        <td className="py-3">
                          {/* Retraining Visual Indicator Badge */}
                          {w.retraining_status === 'Still Below Threshold' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Manual Review Required</span>
                            </span>
                          ) : w.retraining_status === 'Assigned' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <BookOpen className="w-3 h-3 text-amber-700" />
                              <span>Mandatory Retraining</span>
                            </span>
                          ) : w.retraining_status === 'Completed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Retraining Completed</span>
                            </span>
                          ) : (
                            <span className="text-[10.5px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-100">
                              Not Required
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <select
                            value={w.retraining_status || 'Not Required'}
                            onChange={(e) => handleUpdateRetraining(w.id, e.target.value)}
                            disabled={updatingRetrainingId === w.id}
                            className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 shadow-xs"
                          >
                            <option value="Not Required">Not Required</option>
                            <option value="Assigned">Assigned</option>
                            <option value="Completed">Completed</option>
                            <option value="Still Below Threshold">Still Below Threshold</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Society Member Roster */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Affiliated Workers ({allWorkers.length} Members)
                </h2>
                <p className="text-xs text-slate-500">
                  Full roster of gig workers enrolled under {society?.name}.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                    <th className="pb-3">Worker</th>
                    <th className="pb-3">Trade</th>
                    <th className="pb-3">Rate</th>
                    <th className="pb-3">Rating</th>
                    <th className="pb-3">Badge</th>
                    <th className="pb-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allWorkers.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 font-bold text-slate-900">
                        {w.name}
                        <span className="block text-[10px] text-slate-400 font-normal">{w.phone}</span>
                      </td>
                      <td className="py-3 font-semibold text-slate-800">
                        {w.skill_type}
                      </td>
                      <td className="py-3 font-semibold text-slate-900">
                        ₹{w.hourly_rate}/hr
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-amber-900">★ {w.rating}</span>
                        <span className="text-[10px] text-slate-400 ml-1">({w.review_count})</span>
                      </td>
                      <td className="py-3">
                        <CooperativeBadge isMember={true} verificationStatus={w.verification_status} />
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleToggleVerification(w.id, w.verification_status)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                            w.verification_status === 'verified'
                              ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                              : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {w.verification_status === 'verified' ? 'Revoke Status' : 'Verify'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bookings Pipeline */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Society Service Bookings ({recentBookings.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Customer bookings fulfilled by members of {society?.name}.
                </p>
              </div>
            </div>

            {recentBookings.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                No active bookings recorded for this society yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((b) => (
                  <div 
                    key={b.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={b.status} />
                        <span className="font-bold text-xs text-slate-900">
                          {b.service_type} Service • #{b.id}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded capitalize">
                          {b.booking_type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600">
                        Worker: <strong className="text-slate-900">{b.worker_name}</strong> | Customer: <strong className="text-slate-900">{b.customer_name}</strong>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Scheduled: {b.scheduled_date} | Location: {b.location}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <div className="text-right mr-2">
                        <span className="text-xs font-extrabold text-slate-900">₹{b.total_amount}</span>
                        <span className="text-[9px] text-brand-600 block">5% to Co-op</span>
                      </div>

                      {b.status === 'requested' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'accepted')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                        >
                          Accept
                        </button>
                      )}
                      {b.status === 'accepted' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
};

export default AdminDashboard;
