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
  Tag
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge, CooperativeBadge } from '../components/Badge';

export const BookingTracker = ({ currentCustomer, activeWorker }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all'); // 'all', 'customer', 'worker'
  const [statusFilter, setStatusFilter] = useState('all');

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

  return (
    <div className="space-y-6">
      
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

              {/* Status Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 mt-auto">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-slate-400 font-medium">Total:</span>
                  <span className="text-base font-extrabold text-slate-900">₹{b.total_amount}</span>
                  <span className="text-[10px] text-brand-600 font-semibold">(95% Worker / 5% Co-op Pool)</span>
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
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Fulfilled & Settled
                    </span>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default BookingTracker;
