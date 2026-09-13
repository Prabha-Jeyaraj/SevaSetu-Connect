import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Clock, 
  MapPin, 
  IndianRupee, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Tag,
  Star,
  BookOpen
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge, CooperativeBadge } from '../components/Badge';

export const BookingTracker = ({ currentCustomer, activeWorker }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all'); // 'all', 'customer', 'worker'
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingModalBooking, setRatingModalBooking] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingNotice, setRatingNotice] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterRole === 'customer' && currentCustomer) params.customer_id = currentCustomer.id;
      if (filterRole === 'worker' && activeWorker) params.worker_id = activeWorker.id;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.getBookings(params);
      if (res.data.success) {
        setBookings(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filterRole, statusFilter]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await api.updateBookingStatus(bookingId, newStatus);
      fetchBookings();
    } catch (err) {
      alert('Failed to update booking status: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!ratingModalBooking) return;
    setSubmittingRating(true);
    try {
      const res = await api.rateBooking(ratingModalBooking.id, ratingValue);
      if (res.data.success) {
        setRatingNotice(res.data.message);
        setRatingModalBooking(null);
        fetchBookings();
        setTimeout(() => setRatingNotice(null), 8000);
      }
    } catch (err) {
      alert('Failed to submit rating: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {ratingNotice && (
        <div className="p-4 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>{ratingNotice}</span>
          </div>
          <button onClick={() => setRatingNotice(null)} className="text-white/80 hover:text-white font-bold ml-3">✕</button>
        </div>
      )}
      
      {/* Top Header & Filter Controls */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-md">
                <CalendarCheck className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">
                  Gig Service Booking Management Pipeline
                </h1>
                <p className="text-xs text-slate-500">
                  Track lifecycle from <em>Requested → Accepted → In Progress → Completed</em>.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchBookings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Pipeline</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'all', label: 'All Bookings' },
              { id: 'requested', label: 'Requested' },
              { id: 'accepted', label: 'Accepted' },
              { id: 'completed', label: 'Completed' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  statusFilter === st.id
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-bold text-slate-500">
            Total {bookings.length} Bookings Found
          </span>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 font-medium">Fetching bookings lifecycle data...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200">
          <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No bookings in this filter</h3>
          <p className="text-xs text-slate-500 mt-1">Book a verified worker to populate this pipeline.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="glass-card rounded-3xl p-6 border border-slate-200/80 hover:border-brand-300 hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
                      {b.booking_type}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      Booking #{b.id} • {b.service_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CooperativeBadge 
                      isMember={b.is_cooperative_member} 
                      societyName={b.society_name} 
                      verificationStatus={b.worker_verification} 
                    />
                  </div>
                </div>

                {/* Recurrence Banner if recurring */}
                {b.recurrence_detail && (
                  <div className="mb-3 p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-indigo-600" />
                    <span><strong>Recurrence Detail:</strong> {b.recurrence_detail}</span>
                  </div>
                )}

                {/* Participants Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 mb-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Worker</span>
                    <div className="font-bold text-slate-900 text-sm">{b.worker_name} ({b.worker_skill})</div>
                    <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>{b.worker_phone}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer</span>
                    <div className="font-bold text-slate-900 text-sm">{b.customer_name}</div>
                    <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>{b.customer_phone}</span>
                    </div>
                  </div>
                </div>

                {/* Schedule & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>Scheduled: <strong>{b.scheduled_date}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    <span className="truncate">Location: {b.location}</span>
                  </div>
                </div>

                {b.notes && (
                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 mb-3">
                    <strong className="text-slate-700">Notes:</strong> {b.notes}
                  </p>
                )}
              </div>

              {/* Itemized 15% Cooperative Fee Structure & Invoice Breakdown */}
              <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <IndianRupee className="w-3.5 h-3.5 text-brand-600" />
                    <span>Audited Payout & Fee Breakdown</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-200">
                    85% Worker / 15% Platform Split
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Worker Direct (85%)</span>
                    <span className="text-xs font-extrabold text-slate-900">₹{Math.round((b.total_amount || 0) * 0.85)}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-blue-700 block">Platform Ops (8%)</span>
                    <span className="text-xs font-bold text-slate-800">₹{Math.round((b.total_amount || 0) * 0.08)}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Govt Insurance (5%)</span>
                    <span className="text-xs font-bold text-slate-800">₹{Math.round((b.total_amount || 0) * 0.05)}</span>
                    <span className="text-[9px] text-slate-400 block">PMSBY/PMJJBY</span>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block">Training & Quality (2%)</span>
                    <span className="text-xs font-bold text-slate-800">₹{Math.round((b.total_amount || 0) * 0.02)}</span>
                  </div>
                </div>
              </div>

            {/* Status Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 mt-auto">
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-slate-400 font-medium">Total Bill:</span>
                <span className="text-base font-extrabold text-slate-900">₹{b.total_amount}</span>
                <span className="text-[10px] text-emerald-700 font-bold ml-1">(₹{Math.round((b.total_amount || 0) * 0.85)} paid directly to worker)</span>
              </div>

                <div className="flex items-center gap-2">
                  {b.status === 'requested' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'accepted')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                      >
                        Accept & Confirm
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {b.status === 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'completed')}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                    >
                      Mark as Completed
                    </button>
                  )}

                  {b.status === 'completed' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Fulfilled & Settled
                      </span>
                      <button
                        onClick={() => {
                          setRatingModalBooking(b);
                          setRatingValue(5);
                        }}
                        className="px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1 transition"
                        title="Submit customer rating to test rating calculation & retraining trigger"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>Rate Service</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Customer Rating Modal (Dynamic Demonstration of Rating & Retraining Trigger) */}
      {ratingModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Rate Service: {ratingModalBooking.worker_name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Booking #{ratingModalBooking.id} • {ratingModalBooking.service_type}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setRatingModalBooking(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 text-center">
                  Select Rating Score (1 to 5 Stars):
                </label>
                <div className="flex items-center justify-center gap-3 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingValue(star)}
                      className={`p-2 rounded-2xl transition ${
                        ratingValue >= star
                          ? 'bg-amber-100 text-amber-600 scale-110'
                          : 'bg-slate-100 text-slate-300 hover:text-slate-400'
                      }`}
                    >
                      <Star className={`w-7 h-7 ${ratingValue >= star ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                  ))}
                </div>
                <div className="text-center font-extrabold text-amber-900 text-sm mt-1">
                  {ratingValue} / 5 Stars
                  {ratingValue < 3.8 && (
                    <span className="block text-[10.5px] text-rose-600 font-bold mt-1">
                      ⚠️ Rating below 3.8 will automatically flag this worker for cooperative upskilling ("Mandatory Retraining") without blocking their account.
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRatingModalBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-md transition disabled:opacity-50"
                >
                  {submittingRating ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookingTracker;
