import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  PlusCircle, 
  UserPlus, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import WorkerCard from '../components/WorkerCard';
import BookingModal from '../components/BookingModal';
import JobPostModal from '../components/JobPostModal';

export const SearchBrowse = ({ currentCustomer, onWorkerRegisteredClick }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [coopFilter, setCoopFilter] = useState('all'); // 'all', 'coop', 'independent'

  // Booking Modal State
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Post Job Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Success Notification banner
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState(null);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSkill !== 'all') params.skill = selectedSkill;
      if (selectedDistrict !== 'all') params.district = selectedDistrict;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (coopFilter === 'coop') params.is_cooperative = '1';
      if (coopFilter === 'independent') params.is_cooperative = '0';

      const res = await api.getWorkers(params);
      if (res.data.success) {
        setWorkers(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching workers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [selectedSkill, selectedDistrict, coopFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWorkers();
  };

  const handleOpenBooking = (worker) => {
    setSelectedWorkerForBooking(worker);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = async (bookingData) => {
    const res = await api.createBooking(bookingData);
    setIsBookingModalOpen(false);
    setBookingSuccessMsg(`🎉 Booking request submitted for ${selectedWorkerForBooking.name}! (Status: Requested)`);
    setTimeout(() => setBookingSuccessMsg(null), 6000);
  };

  const handlePostCreated = async (postData) => {
    await api.createPost(postData);
    setBookingSuccessMsg('🎉 Your job requirement has been published to the community board!');
    setTimeout(() => setBookingSuccessMsg(null), 6000);
  };

  const skillsList = ['all', 'Electrician', 'Plumber', 'Carpenter', 'Caregiver', 'Painter'];
  const districtsList = ['all', 'Pune', 'Bengaluru', 'Delhi', 'Mumbai', 'Jaipur'];

  return (
    <div className="space-y-6">
      
      {/* Top Search & Filter Bar */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        
        {/* Title & Post Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>Verified Cooperative Worker Marketplace</span>
              <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                {workers.length} Available
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Direct bookings with fair wages and verified cooperative society trust.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Job Requirement</span>
            </button>

            <button
              onClick={onWorkerRegisteredClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-brand-400 text-xs font-bold shadow-sm transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register as Worker</span>
            </button>
          </div>
        </div>

        {/* Search Query Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by worker name, skill, neighborhood, or keywords (e.g. 'Ramesh', 'wiring', 'pipe leak', 'Kothrud')..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Skill Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" />
            Skill:
          </span>
          {skillsList.map((sk) => (
            <button
              key={sk}
              onClick={() => setSelectedSkill(sk)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition ${
                selectedSkill === sk
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sk === 'all' ? 'All Skills' : sk}
            </button>
          ))}
        </div>

        {/* District & Cooperative Badging Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          
          {/* District Dropdown */}
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-xs font-bold text-slate-600">Location District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Districts (Pan-India)</option>
              {districtsList.filter(d => d !== 'all').map((dist) => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>

          {/* Cooperative Member Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'all', label: 'All Workers' },
              { id: 'coop', label: 'Cooperative Verified' },
              { id: 'independent', label: 'Independent' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setCoopFilter(opt.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  coopFilter === opt.id
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Success Notification Banner */}
      {bookingSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center justify-between animate-fadeIn">
          <span>{bookingSuccessMsg}</span>
          <button 
            onClick={() => setBookingSuccessMsg(null)}
            className="text-white/80 hover:text-white text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Worker Grid Results */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 font-medium">Fetching verified cooperative workers...</p>
        </div>
      ) : workers.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No workers found matching your criteria</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            Try loosening your filters or post a job requirement to let available workers apply directly.
          </p>
          <button
            onClick={() => {
              setSelectedSkill('all');
              setSelectedDistrict('all');
              setCoopFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workers.map((w) => (
            <WorkerCard
              key={w.id}
              worker={w}
              onBook={handleOpenBooking}
            />
          ))}
        </div>
      )}

      {/* Booking Modal Component */}
      <BookingModal
        worker={selectedWorkerForBooking}
        customer={currentCustomer}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Post Job Modal Component */}
      <JobPostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPostCreated={handlePostCreated}
        currentPersona={{ type: 'customer', id: currentCustomer?.id || 1, name: currentCustomer?.name || 'Arjun Mehta' }}
      />

    </div>
  );
};

export default SearchBrowse;
