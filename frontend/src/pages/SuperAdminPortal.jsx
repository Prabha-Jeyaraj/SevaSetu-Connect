import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  IndianRupee, 
  PlusCircle, 
  Search, 
  TrendingUp,
  MapPin,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';

export const SuperAdminPortal = () => {
  const [stats, setStats] = useState(null);
  const [societies, setSocieties] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState('societies'); // 'societies', 'workers', 'customers'
  const [loading, setLoading] = useState(true);
  
  // New Society Modal
  const [isNewSocModalOpen, setIsNewSocModalOpen] = useState(false);
  const [newSocName, setNewSocName] = useState('');
  const [newSocDistrict, setNewSocDistrict] = useState('Jaipur');
  const [newSocState, setNewSocState] = useState('Rajasthan');
  const [newSocReg, setNewSocReg] = useState('');
  const [newSocPhone, setNewSocPhone] = useState('');
  const [newSocEmail, setNewSocEmail] = useState('');
  const [newSocDesc, setNewSocDesc] = useState('');
  const [submittingSoc, setSubmittingSoc] = useState(false);

  const [notification, setNotification] = useState(null);

  const fetchPlatformData = async () => {
    setLoading(true);
    try {
      const [ovRes, socRes, wRes, cRes] = await Promise.all([
        api.getPlatformOverview(),
        api.getPlatformSocieties(),
        api.getPlatformWorkers(),
        api.getPlatformCustomers()
      ]);

      if (ovRes.data.success) setStats(ovRes.data.stats);
      if (socRes.data.success) setSocieties(socRes.data.data || []);
      if (wRes.data.success) setWorkers(wRes.data.data || []);
      if (cRes.data.success) setCustomers(cRes.data.data || []);
    } catch (err) {
      console.error('Error loading platform data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatformData();
  }, []);

  const handleUpdateStatus = async (societyId, status) => {
    try {
      const res = await api.updateSocietyApproval(societyId, status);
      if (res.data.success) {
        setNotification(`Society status updated to '${status}'!`);
        fetchPlatformData();
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCreateSociety = async (e) => {
    e.preventDefault();
    setSubmittingSoc(true);
    try {
      const res = await api.registerSociety({
        name: newSocName,
        district: newSocDistrict,
        state: newSocState,
        registration_number: newSocReg,
        contact_phone: newSocPhone,
        contact_email: newSocEmail,
        description: newSocDesc
      });
      if (res.data.success) {
        setNotification(`🎉 New cooperative society "${newSocName}" registered into federation!`);
        setIsNewSocModalOpen(false);
        setNewSocName('');
        setNewSocReg('');
        fetchPlatformData();
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmittingSoc(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Super Admin Banner */}
      <div className="glass-dark text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-coop-blue flex items-center justify-center text-white shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-400 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                Federation Governance Authority
              </span>
              <span className="text-xs text-slate-400">Platform Super Admin Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1">
              National Cooperative Gig Federation
            </h1>
            <p className="text-xs text-slate-400">
              Cross-society oversight, cooperative society credentialing, and multi-district welfare tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewSocModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-extrabold shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Charter New Society</span>
          </button>

          <button
            onClick={fetchPlatformData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-lg flex items-center justify-between animate-fadeIn">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* National Platform Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Societies</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">{stats?.totalSocieties || 0}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">{stats?.approvedSocieties || 0} Chartered</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-amber-200 bg-amber-50/40">
          <span className="text-[10px] font-bold text-amber-800 uppercase block">Pending Charters</span>
          <span className="text-xl font-extrabold text-amber-900 mt-1 block">{stats?.pendingSocieties || 0}</span>
          <span className="text-[10px] text-amber-700 font-semibold">Needs Approval</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Workers</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">{stats?.totalWorkers || 0}</span>
          <span className="text-[10px] text-indigo-600 font-semibold">{stats?.verifiedWorkers || 0} Verified</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Customers</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">{stats?.totalCustomers || 0}</span>
          <span className="text-[10px] text-slate-500 font-semibold">Pan-India Users</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Platform GMV</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">₹{stats?.platformGmv || 0}</span>
          <span className="text-[10px] text-brand-600 font-semibold">95% to Workers</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Federation Welfare</span>
          <span className="text-xl font-extrabold text-brand-800 mt-1 block">₹{stats?.federationWelfarePool || 0}</span>
          <span className="text-[10px] text-emerald-700 font-semibold">5% Collective Pool</span>
        </div>
      </div>

      {/* Main Registry Tabs */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        
        {/* Tab Headers */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'societies', label: `Federation Societies (${societies.length})` },
              { id: 'workers', label: `National Worker Registry (${workers.length})` },
              { id: 'customers', label: `Customer Accounts (${customers.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* SOCIETIES TAB */}
        {activeTab === 'societies' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Society Name</th>
                  <th className="pb-3">District & State</th>
                  <th className="pb-3">Registration No.</th>
                  <th className="pb-3">Members</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Super Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {societies.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 font-bold text-slate-900">
                      <div>{s.name}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{s.contact_email}</span>
                    </td>
                    <td className="py-3 text-slate-700">
                      {s.district}, {s.state}
                    </td>
                    <td className="py-3 font-mono text-[11px] text-slate-600">
                      {s.registration_number}
                    </td>
                    <td className="py-3 font-semibold text-slate-800">
                      {s.total_workers || 0} workers ({s.verified_workers || 0} verified)
                    </td>
                    <td className="py-3">
                      {s.approval_status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Approved
                        </span>
                      )}
                      {s.approval_status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Pending Review
                        </span>
                      )}
                      {s.approval_status === 'suspended' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right space-x-1.5">
                      {s.approval_status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(s.id, 'approved')}
                          className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                        >
                          Approve Society
                        </button>
                      )}
                      {s.approval_status === 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(s.id, 'suspended')}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold text-xs border border-slate-200 transition"
                        >
                          Suspend
                        </button>
                      )}
                      {s.approval_status === 'suspended' && (
                        <button
                          onClick={() => handleUpdateStatus(s.id, 'approved')}
                          className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200 hover:bg-emerald-100 transition"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* WORKERS TAB */}
        {activeTab === 'workers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Worker Name</th>
                  <th className="pb-3">Trade</th>
                  <th className="pb-3">District</th>
                  <th className="pb-3">Affiliated Society</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workers.map(w => (
                  <tr key={w.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 font-bold text-slate-900">
                      <div>{w.name}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{w.phone}</span>
                    </td>
                    <td className="py-3 font-semibold text-indigo-700">
                      {w.skill_type}
                    </td>
                    <td className="py-3 text-slate-600">
                      {w.district}
                    </td>
                    <td className="py-3 text-slate-700">
                      {w.society_name || <span className="text-slate-400 italic">Independent</span>}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        w.verification_status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {w.verification_status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-amber-900">
                      ★ {w.rating} ({w.review_count})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3 text-right">Total Bookings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3 text-slate-600">{c.phone}</td>
                    <td className="py-3 text-slate-600">{c.location} ({c.district})</td>
                    <td className="py-3 text-right font-bold text-brand-700">{c.total_bookings || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Create New Society Modal */}
      {isNewSocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-sm text-slate-900">Charter New Cooperative Society</h3>
              <button onClick={() => setIsNewSocModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateSociety} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Society Legal Name</label>
                <input
                  type="text"
                  value={newSocName}
                  onChange={(e) => setNewSocName(e.target.value)}
                  placeholder="e.g. Ahmedabad Shramik Sangha"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={newSocDistrict}
                    onChange={(e) => setNewSocDistrict(e.target.value)}
                    placeholder="Ahmedabad"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={newSocState}
                    onChange={(e) => setNewSocState(e.target.value)}
                    placeholder="Gujarat"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">State Registration Number</label>
                <input
                  type="text"
                  value={newSocReg}
                  onChange={(e) => setNewSocReg(e.target.value)}
                  placeholder="GJ/AHM/COOP/2024/9912"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newSocPhone}
                    onChange={(e) => setNewSocPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={newSocEmail}
                    onChange={(e) => setNewSocEmail(e.target.value)}
                    placeholder="admin@soc.coop"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Charter Description</label>
                <textarea
                  rows="2"
                  value={newSocDesc}
                  onChange={(e) => setNewSocDesc(e.target.value)}
                  placeholder="Scope of trades covered and operational areas..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewSocModalOpen(false)}
                  className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSoc}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submittingSoc ? 'Chartering...' : 'Approve & Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminPortal;
