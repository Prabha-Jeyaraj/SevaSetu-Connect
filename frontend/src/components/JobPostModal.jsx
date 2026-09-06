import React, { useState } from 'react';
import { X, Briefcase, PlusCircle, Users, Sparkles, Send } from 'lucide-react';

export const JobPostModal = ({ isOpen, onClose, onPostCreated, currentPersona }) => {
  if (!isOpen) return null;

  const [postType, setPostType] = useState(
    currentPersona?.type === 'worker' ? 'worker_collab' : 'job_request'
  );
  const [serviceType, setServiceType] = useState('Plumber');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Kothrud, Pune');
  const [district, setDistrict] = useState('Pune');
  const [preferredDate, setPreferredDate] = useState('2026-09-15');
  const [budgetOrRate, setBudgetOrRate] = useState('₹500 - ₹800');
  const [recurrenceType, setRecurrenceType] = useState('one-time');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      posted_by_type: currentPersona?.type || 'customer',
      posted_by_id: currentPersona?.id || 1,
      posted_by_name: currentPersona?.name || 'Community Member',
      post_type: postType,
      service_type: serviceType,
      title,
      description,
      location,
      district,
      preferred_date: preferredDate,
      budget_or_rate: budgetOrRate,
      recurrence_type: recurrenceType
    };

    try {
      await onPostCreated(payload);
      onClose();
    } catch (err) {
      alert('Failed to publish post: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              Bidirectional Marketplace Board
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Create Community Post
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Post Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Post Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { 
                  id: 'job_request', 
                  label: 'Customer Job Request', 
                  desc: 'Need a service worker' 
                },
                { 
                  id: 'worker_collab', 
                  label: 'Worker Collab Request', 
                  desc: 'Worker seeking another worker (e.g. Plumber seeking Electrician)' 
                },
                { 
                  id: 'availability_offer', 
                  label: 'Worker Availability', 
                  desc: 'Worker offering slots' 
                }
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setPostType(t.id)}
                  className={`p-2 rounded-xl text-left border transition ${
                    postType === t.id
                      ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className={`block text-xs font-bold ${postType === t.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {t.label}
                  </span>
                  <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Service & District */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Skill / Service
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
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
                District / Region
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Pune">Pune (Maharashtra)</option>
                <option value="Bengaluru">Bengaluru (Karnataka)</option>
                <option value="Delhi">Delhi (Delhi NCR)</option>
                <option value="Mumbai">Mumbai (Maharashtra)</option>
                <option value="Jaipur">Jaipur (Rajasthan)</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Post Title / Summary
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                postType === 'worker_collab'
                  ? 'e.g. Plumber seeking Electrician partner for 3-BHK bathroom remodel'
                  : (postType === 'job_request' ? 'e.g. Urgent kitchen faucet pipe leak repair' : 'e.g. Available for pre-Diwali deep house painting slots')
              }
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Description
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, required tools, timeline, and exact scope..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Location & Budget / Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Locality / Area
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kothrud, Pune"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Budget / Estimated Rate
              </label>
              <input
                type="text"
                value={budgetOrRate}
                onChange={(e) => setBudgetOrRate(e.target.value)}
                placeholder="e.g. ₹400 - ₹700 or ₹350/hr"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Date & Recurrence */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Date / Timeline
              </label>
              <input
                type="text"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                placeholder="e.g. 2026-09-18 or Immediate"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Engagement Type
              </label>
              <select
                value={recurrenceType}
                onChange={(e) => setRecurrenceType(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="one-time">One-time Task</option>
                <option value="recurring">Recurring (Weekly/Daily)</option>
                <option value="fixed-term">Fixed-term Project</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Publishing...' : 'Publish to Feed'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default JobPostModal;
