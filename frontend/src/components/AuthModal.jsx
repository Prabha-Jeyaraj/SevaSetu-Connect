import React, { useState } from 'react';
import { 
  X, 
  User, 
  Briefcase, 
  Building2, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  CheckCircle2, 
  KeyRound, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const AuthModal = ({ isOpen, onClose, defaultMode = 'login', defaultRole = 'customer', societies = [] }) => {
  if (!isOpen) return null;

  const { login, register } = useAuth();
  const [mode, setMode] = useState(defaultMode); // 'login' or 'signup'
  const [activeRole, setActiveRole] = useState(defaultRole); // 'customer', 'worker', 'society_admin', 'super_admin'
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign up form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('Kothrud, Pune');
  const [district, setDistrict] = useState('Pune');
  
  // Worker-specific signup state
  const [skillType, setSkillType] = useState('Electrician');
  const [isCooperativeMember, setIsCooperativeMember] = useState(true);
  const [selectedSocietyId, setSelectedSocietyId] = useState(societies[0]?.id || 1);
  const [hourlyRate, setHourlyRate] = useState(300);
  const [experienceYears, setExperienceYears] = useState(4);

  // OTP Verification Simulation
  const [otpStep, setOtpStep] = useState(false);
  const [otpValue, setOtpValue] = useState('123456');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Quick fill helper for review
  const handleQuickFill = (roleType) => {
    setErrorMsg(null);
    if (roleType === 'super_admin') {
      setActiveRole('super_admin');
      setLoginIdentifier('superadmin@sevasetu.coop');
      setLoginPassword('superadmin123');
    } else if (roleType === 'society_admin') {
      setActiveRole('society_admin');
      setLoginIdentifier('admin@puneshramik.coop');
      setLoginPassword('society123');
    } else if (roleType === 'worker') {
      setActiveRole('worker');
      setLoginIdentifier('ramesh.shinde@example.com');
      setLoginPassword('worker123');
    } else {
      setActiveRole('customer');
      setLoginIdentifier('arjun.mehta@example.com');
      setLoginPassword('customer123');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await login({
        emailOrPhone: loginIdentifier,
        password: loginPassword,
        requiredPortal: activeRole === 'super_admin' ? 'super_admin' : (activeRole === 'society_admin' ? 'society_admin' : undefined)
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    // Proceed to OTP verification step
    setOtpStep(true);
  };

  const handleVerifyOtpAndRegister = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (otpValue !== '123456' && otpValue !== '999999') {
        throw new Error('Invalid code. Please enter demo OTP: 123456');
      }

      await register({
        name,
        email,
        phone,
        password,
        role: activeRole,
        location,
        district,
        skill_type: activeRole === 'worker' ? skillType : undefined,
        hourly_rate: activeRole === 'worker' ? hourlyRate : undefined,
        experience_years: activeRole === 'worker' ? experienceYears : undefined,
        society_id: activeRole === 'worker' && isCooperativeMember ? selectedSocietyId : undefined,
        is_cooperative_member: activeRole === 'worker' ? isCooperativeMember : undefined
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
              Secure Platform Access
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              {mode === 'login' ? 'Sign In to SevaSetu' : 'Create an Account'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl my-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setOtpStep(false); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-xl transition ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setOtpStep(false); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-xl transition ${
              mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            New Registration
          </button>
        </div>

        {/* Role Type Selector */}
        {!otpStep && (
          <div className="mb-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Select Account Role:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
              {[
                { id: 'customer', label: 'Customer', icon: User },
                { id: 'worker', label: 'Worker', icon: Briefcase },
                { id: 'society_admin', label: 'Society Admin', icon: Building2 },
                { id: 'super_admin', label: 'Super Admin', icon: ShieldCheck }
              ].map(r => {
                const Icon = r.icon;
                const isSelected = activeRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { setActiveRole(r.id); setErrorMsg(null); }}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/80 text-brand-900 font-bold ring-1 ring-brand-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span className="text-[11px] truncate">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. arjun.mehta@example.com or +91 98220..."
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : `Sign In as ${activeRole.replace('_', ' ').toUpperCase()}`}
            </button>

            {/* Quick Fill Credentials Bar for Evaluation */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                Quick Test Credentials:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('customer')}
                  className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg"
                >
                  Customer Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('worker')}
                  className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg"
                >
                  Worker Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('society_admin')}
                  className="text-[10px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg"
                >
                  Society Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('super_admin')}
                  className="text-[10px] font-semibold bg-slate-900 hover:bg-slate-800 text-brand-300 px-2 py-1 rounded-lg"
                >
                  Platform Super Admin
                </button>
              </div>
            </div>
          </form>
        )}

        {/* SIGNUP FORM */}
        {mode === 'signup' && !otpStep && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Patil"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Create Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            {/* If Worker, extra fields */}
            {activeRole === 'worker' && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Professional Worker Profile
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Trade / Skill</label>
                    <select
                      value={skillType}
                      onChange={(e) => setSkillType(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="Electrician">Electrician</option>
                      <option value="Plumber">Plumber</option>
                      <option value="Carpenter">Carpenter</option>
                      <option value="Caregiver">Caregiver</option>
                      <option value="Painter">Painter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hourly Rate (₹)</label>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(parseInt(e.target.value) || 250)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cooperative Affiliation</label>
                  <select
                    value={selectedSocietyId}
                    onChange={(e) => setSelectedSocietyId(parseInt(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  >
                    {societies.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.district})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-md transition"
            >
              Continue to OTP Verification →
            </button>
          </form>
        )}

        {/* OTP VERIFICATION STEP */}
        {mode === 'signup' && otpStep && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-center space-y-1">
              <KeyRound className="w-8 h-8 text-indigo-600 mx-auto" />
              <h3 className="font-bold text-xs text-indigo-950">Enter Verification Code</h3>
              <p className="text-[11px] text-indigo-800">
                We sent a simulated 6-digit code to <strong>{phone}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                Enter 6-Digit OTP (Dev OTP: 123456)
              </label>
              <input
                type="text"
                maxLength="6"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                className="w-48 mx-auto block text-center tracking-widest font-mono text-lg font-bold py-2 rounded-xl border-2 border-indigo-300 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOtpStep(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleVerifyOtpAndRegister}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-md disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Confirm & Complete'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthModal;
