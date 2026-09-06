import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  MapPin, 
  Calendar, 
  Send, 
  PlusCircle, 
  Sparkles, 
  Tag, 
  IndianRupee, 
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import JobPostModal from '../components/JobPostModal';

export const WorkerFeed = ({ activeWorker }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'job_request', 'worker_collab', 'availability_offer'
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Applying state
  const [applyingPostId, setApplyingPostId] = useState(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [submittingApply, setSubmittingApply] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType !== 'all') params.post_type = filterType;
      if (selectedDistrict !== 'all') params.district = selectedDistrict;

      const res = await api.getPosts(params);
      if (res.data.success) {
        setPosts(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filterType, selectedDistrict]);

  const handleApply = async (postId) => {
    setSubmittingApply(true);
    try {
      const workerId = activeWorker?.id || 2; // Default to Santosh Deshmukh
      const res = await api.applyToPost(postId, workerId, applyMessage || 'I am ready for this gig.');
      setNotification(`🎉 Application submitted for post #${postId}! The creator will receive your contact.`);
      setApplyingPostId(null);
      setApplyMessage('');
      fetchPosts();
      setTimeout(() => setNotification(null), 6000);
    } catch (err) {
      alert('Application failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmittingApply(false);
    }
  };

  const handlePostCreated = async (postData) => {
    await api.createPost(postData);
    setNotification('🎉 Your post has been published to the community feed!');
    fetchPosts();
    setTimeout(() => setNotification(null), 6000);
  };

  const getPostTypeBadge = (type) => {
    switch (type) {
      case 'job_request':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            Customer Job Requirement
          </span>
        );
      case 'worker_collab':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
            <Users className="w-3 h-3 text-amber-700" />
            Worker-to-Worker Collab
          </span>
        );
      case 'availability_offer':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Worker Availability Slot
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-md">
                <Briefcase className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">
                  Bidirectional Gig & Worker Collaboration Board
                </h1>
                <p className="text-xs text-slate-500">
                  Direct gig requests from customers + peer-to-peer collaboration opportunities between cooperative workers.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-500 hover:to-brand-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Post / Collab</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Post Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'all', label: 'All Feeds' },
              { id: 'job_request', label: 'Customer Job Posts' },
              { id: 'worker_collab', label: 'Worker-to-Worker Collab' },
              { id: 'availability_offer', label: 'Availability Offers' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterType === tab.id
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* District Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500">District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Regions</option>
              <option value="Pune">Pune</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Delhi">Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Jaipur">Jaipur</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="p-4 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-lg flex items-center justify-between animate-fadeIn">
          <span>{notification}</span>
          <button 
            onClick={() => setNotification(null)}
            className="text-white/80 hover:text-white text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Posts List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 font-medium">Fetching community posts and job leads...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No posts in this category</h3>
          <p className="text-xs text-slate-500 mt-1">Be the first to post a job requirement or collaboration request!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="glass-card rounded-3xl p-6 border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                {/* Post Top Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {getPostTypeBadge(post.post_type)}
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {post.service_type}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">
                    Posted by: <strong className="text-slate-700">{post.posted_by_name}</strong>
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-extrabold text-slate-900 mb-2">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {post.description}
                </p>

                {/* Meta details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-2xl border border-slate-100 mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    <span className="truncate">{post.location} ({post.district})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{post.budget_or_rate || 'Negotiable'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>{post.preferred_date || 'Flexible'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span className="capitalize">{post.recurrence_type || 'One-time'}</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-slate-500">
                  <span>Applications received: </span>
                  <strong className="text-indigo-600">{post.applications_count || 0}</strong>
                </div>

                {/* Apply Button / Input */}
                {applyingPostId === post.id ? (
                  <div className="w-full sm:w-auto flex items-center gap-2 animate-fadeIn mt-2 sm:mt-0">
                    <input
                      type="text"
                      value={applyMessage}
                      onChange={(e) => setApplyMessage(e.target.value)}
                      placeholder="e.g. Available tomorrow, 8 yrs exp..."
                      className="text-xs px-3 py-1.5 rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                    />
                    <button
                      onClick={() => handleApply(post.id)}
                      disabled={submittingApply}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
                    >
                      {submittingApply ? 'Sending...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setApplyingPostId(null)}
                      className="px-2.5 py-1.5 rounded-xl text-xs text-slate-500 hover:bg-slate-100 transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setApplyingPostId(post.id);
                      setApplyMessage('I am available and interested in this opportunity.');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5 text-brand-400" />
                    <span>Apply / Express Interest</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      <JobPostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPostCreated={handlePostCreated}
        currentPersona={{
          type: 'worker',
          id: activeWorker?.id || 2,
          name: activeWorker ? `${activeWorker.name} (${activeWorker.skill_type})` : 'Santosh Deshmukh (Plumber)'
        }}
      />

    </div>
  );
};

export default WorkerFeed;
