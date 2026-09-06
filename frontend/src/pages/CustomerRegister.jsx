import React, { useState } from 'react';
import { UserPlus, UserCheck, CheckCircle2, Phone, MapPin, Mail } from 'lucide-react';
import api from '../services/api';

export const CustomerRegister = ({ onCustomerRegistered, setCurrentTab }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 98');
  const [location, setLocation] = useState('Kothrud, Pune');
  const [district, setDistrict] = useState('Pune');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.registerCustomer({
        name,
        phone,
        location,
        district,
        email
      });

      if (res.data.success) {
        setSuccessResult(res.data);
        if (onCustomerRegistered) onCustomerRegistered(res.data.data);
      }
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-4">
      <div className="glass-card rounded-3xl p-8 border border-slate-200/90 shadow-lg">
        
        <div className="text-center mb-6 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold mx-auto mb-3 shadow-md">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Customer Registration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access verified cooperative gig professionals in your neighborhood.
          </p>
        </div>

        {successResult ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-4 animate-fadeIn">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h2 className="text-base font-extrabold text-emerald-900">
              Welcome, {successResult.data?.name}!
            </h2>
            <p className="text-xs text-emerald-800">
              Your customer profile is active. You can now search verified workers and post job requirements.
            </p>
            <button
              onClick={() => setCurrentTab('search')}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition"
            >
              Explore Verified Workers Now →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arjun Mehta"
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
                placeholder="+91 98900 12345"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Address / Locality
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
                District / City
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-brand-400 font-extrabold text-xs shadow-md transition active:scale-98 disabled:opacity-50"
              >
                {submitting ? 'Creating Profile...' : 'Complete Customer Registration'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default CustomerRegister;
