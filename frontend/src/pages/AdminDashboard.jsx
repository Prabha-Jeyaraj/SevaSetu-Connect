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
  Lock
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
          {/* Operations Metrics */}
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
                <span>Active Society Bookings</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{stats.activeBookings || 0}</div>
                <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                  {stats.completedBookings || 0} completed
                </span>
              </div>
            </div>

            <div className="glass-card p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                <span>Society Welfare Pool</span>
                <IndianRupee className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-brand-700">₹{stats.cooperativeWelfarePool || 0}</div>
                <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                  5% worker healthcare & emergency pool
                </span>
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
