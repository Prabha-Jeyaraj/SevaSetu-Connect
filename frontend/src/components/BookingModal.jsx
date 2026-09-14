import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, FileText, CheckCircle2, ShieldCheck, IndianRupee } from 'lucide-react';
import { CooperativeBadge } from './Badge';

export const BookingModal = ({ worker, customer, isOpen, onClose, onBookingSuccess }) => {
  if (!isOpen || !worker) return null;

  const [bookingType, setBookingType] = useState('one-time');
  const [recurrenceDetail, setRecurrenceDetail] = useState('Repeat every 7 days');
  const [scheduledDate, setScheduledDate] = useState('2026-09-12 10:00 AM');
  const [location, setLocation] = useState(customer?.location || worker?.location || 'Pune');
  const [notes, setNotes] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const totalAmount = (worker.hourly_rate || 250) * estimatedHours;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const bookingPayload = {
      customer_id: customer?.id || 1,
      worker_id: worker.id,
      service_type: worker.skill_type,
      booking_type: bookingType,
      recurrence_detail: bookingType !== 'one-time' ? recurrenceDetail : null,
      scheduled_date: scheduledDate,
      location,
      notes,
      total_amount: totalAmount
    };

    try {
      await onBookingSuccess(bookingPayload);
      setSuccessData(bookingPayload);
    } catch (err) {
      alert('Failed to create booking: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
              Cooperative Booking System
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Book Service with {worker.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Worker Mini Summary */}
        <div className="my-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{worker.name}</span>
              <CooperativeBadge 
                isMember={worker.is_cooperative_member} 
                societyName={worker.society_name} 
                verificationStatus={worker.verification_status} 
              />
            </div>
            <span className="text-xs text-slate-500">{worker.skill_type} • ₹{worker.hourly_rate}/hr</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Cost</span>
            <span className="text-base font-extrabold text-brand-700">₹{totalAmount}</span>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Booking Type Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Booking Engagement Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'one-time', label: 'One-Time', desc: 'Single session fix' },
                { id: 'recurring', label: 'Recurring', desc: 'Repeat visits' },
                { id: 'fixed-term', label: 'Fixed-Term', desc: 'Multi-week contract' }
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setBookingType(t.id)}
                  className={`p-2.5 rounded-xl text-left border transition ${
                    bookingType === t.id
                      ? 'border-brand-600 bg-brand-50/70 ring-1 ring-brand-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className={`block text-xs font-bold ${bookingType === t.id ? 'text-brand-800' : 'text-slate-800'}`}>
                    {t.label}
                  </span>
                  <span className="text-[10px] text-slate-500 block">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recurrence Specification if not one-time */}
          {bookingType !== 'one-time' && (
            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100">
              <label className="block text-xs font-bold text-indigo-900 mb-1">
                Recurrence / Duration Details
              </label>
              <input
                type="text"
                value={recurrenceDetail}
                onChange={(e) => setRecurrenceDetail(e.target.value)}
                placeholder="e.g. Repeat every 7 days (or 2 weeks project)"
                className="w-full text-xs px-3 py-2 rounded-lg border border-indigo-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Scheduled Date & Time
              </label>
              <input
                type="text"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                placeholder="e.g. 2026-09-15 10:00 AM"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimated Duration (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="40"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseInt(e.target.value) || 1)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Service Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Service Location / Address
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Flat 402, Green Meadows, Kothrud, Pune"
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          {/* Notes & Job Specs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Job Requirements / Notes for Worker
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the issue (e.g. water leakage under kitchen sink, bring replacement PVC joint)."
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Cooperative Transparent 10% Fee Structure Breakdown */}
          <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 text-xs text-emerald-950 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Transparent Cooperative Fee Breakdown (100% Audited)</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Fair Wages
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>Direct Worker Payment (90%)</span>
                <span className="text-emerald-700 font-extrabold">₹{Math.round(totalAmount * 0.90)}</span>
              </div>

              <div className="pt-1 border-t border-emerald-200/40 text-slate-600 space-y-1">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Platform Operations (6%)
                  </span>
                  <span className="font-semibold text-slate-800">₹{Math.round(totalAmount * 0.06)}</span>
                </div>
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Govt Insurance Premium Fund (PMSBY/PMJJBY) (2%)
                  </span>
                  <span className="font-semibold text-slate-800">₹{Math.round(totalAmount * 0.02)}</span>
                </div>
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Training & Quality Upskilling Fund (2%)
                  </span>
                  <span className="font-semibold text-slate-800">₹{Math.round(totalAmount * 0.02)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 font-bold text-emerald-900 text-xs">
                <span>Total Amount Charged</span>
                <span className="text-slate-900 text-sm font-extrabold">₹{totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2">
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
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Confirming Booking...' : `Confirm & Request Booking (₹${totalAmount})`}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default BookingModal;
