import React, { useState } from 'react';
import { 
  UserPlus, 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight, 
  Briefcase, 
  Phone, 
  MapPin, 
  IndianRupee 
} from 'lucide-react';
import api from '../services/api';

export const WorkerRegister = ({ societies = [], onWorkerRegistered, setCurrentTab }) => {
  const [membershipType, setMembershipType] = useState('cooperative'); // 'cooperative' or 'independent'
  const [selectedSocietyId, setSelectedSocietyId] = useState(societies[0]?.id || 1);
  const [name, setName] = useState('');
  const [skillType, setSkillType] = useState('Electrician');
  const [phone, setPhone] = useState('+91 98');
  const [location, setLocation] = useState('Kothrud, Pune');
  const [district, setDistrict] = useState('Pune');
  const [hourlyRate, setHourlyRate] = useState(300);
  const [experienceYears, setExperienceYears] = useState(4);
  const [bio, setBio] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name,
      skill_type: skillType,
      phone,
      location,
      district,
      society_id: membershipType === 'cooperative' ? selectedSocietyId : null,
      is_cooperative_member: membershipType === 'cooperative',
      hourly_rate: hourlyRate,
      experience_years: experienceYears,
      bio: bio || `Skilled ${skillType} with ${experienceYears} years of experience in domestic and commercial works.`
    };

    try {
      const res = await api.registerWorker(payload);
      if (res.data.success) {
        setSuccessResult(res.data);
        if (onWorkerRegistered) onWorkerRegistered(res.data.data);
      }
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="glass-card rounded-3xl p-8 border border-slate-200/90 shadow-lg">
        
        {/* Header */}
        <div className="text-center mb-8 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold mx-auto mb-3 shadow-md">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Join SevaSetu Connect
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Democratic Gig-Worker Registration — Retain 95-100% of your hard-earned revenue
          </p>
        </div>

        {successResult ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-extrabold text-emerald-900">
              {membershipType === 'cooperative' 
                ? 'Cooperative Affiliation Application Submitted!' 
                : 'Independent Worker Account Ready!'}
            </h2>
            <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
              {successResult.message}
            </p>

            <div className="p-4 bg-white/90 rounded-2xl text-left text-xs space-y-1.5 border border-emerald-100 text-slate-700">
              <div><strong>Registered Name:</strong> {successResult.data?.name}</div>
              <div><strong>Trade:</strong> {successResult.data?.skill_type}</div>
              <div><strong>Status:</strong> <span className="font-bold text-amber-600">{successResult.data?.verification_status}</span></div>
              {successResult.data?.society_name && (
                <div><strong>Society:</strong> {successResult.data?.society_name}</div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setCurrentTab('admin')}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-brand-400 text-xs font-bold shadow-md hover:bg-slate-800 transition"
              >
                Go to Society Admin to Approve →
              </button>
              <button
                onClick={() => setCurrentTab('search')}
                className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md hover:bg-brand-700 transition"
              >
                View Marketplace
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Membership Choice Cards */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Choose Worker Affiliation Mode
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setMembershipType('cooperative')}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    membershipType === 'cooperative'
                      ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs text-slate-900">Cooperative Member</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Full verification badge, access to welfare fund, collective bargaining, and society referral priority.
                  </p>
                </div>

                <div
                  onClick={() => setMembershipType('independent')}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    membershipType === 'independent'
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <UserCheck className="w-4 h-4 text-slate-600" />
                    <span className="font-bold text-xs text-slate-900">Independent Worker</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Basic marketplace profile with standard independent tag.
                  </p>
                </div>
              </div>
            </div>

            {/* Cooperative Society Selection Dropdown */}
            {membershipType === 'cooperative' && (
              <div className="p-4 bg-brand-50/60 rounded-2xl border border-brand-100/90 animate-fadeIn">
                <label className="block text-xs font-bold text-brand-900 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-brand-700" />
                  Select Registered Cooperative Society
                </label>
                <select
                  value={selectedSocietyId}
                  onChange={(e) => setSelectedSocietyId(parseInt(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-brand-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {societies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.district}, {s.state})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-brand-800 mt-1">
                  * New cooperative registrations will enter the admin verification queue for approval.
                </p>
              </div>
            )}

            {/* Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Shinde"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98220 12345"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            {/* Skill & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Skill / Trade
                </label>
                <select
                  value={skillType}
                  onChange={(e) => setSkillType(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Caregiver">Caregiver</option>
                  <option value="Painter">Painter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(parseInt(e.target.value) || 1)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hourly Rate (₹)
                </label>
                <input
                  type="number"
                  min="100"
                  max="2000"
                  step="50"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseInt(e.target.value) || 200)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Location & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Locality / Area
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kothrud, Pune"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  District
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Pune">Pune</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Jaipur">Jaipur</option>
                </select>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Professional Bio & Specializations
              </label>
              <textarea
                rows="2"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your expertise, certifications, specialized tools, or experience..."
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-extrabold text-sm shadow-md shadow-brand-600/25 transition active:scale-98 disabled:opacity-50"
              >
                {submitting ? 'Registering Worker...' : 'Submit Worker Registration'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

export default WorkerRegister;
