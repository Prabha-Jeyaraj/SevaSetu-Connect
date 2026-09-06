import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Search, 
  Briefcase, 
  CalendarCheck, 
  ShieldCheck, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import api from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import LandingPage from './pages/LandingPage';
import SearchBrowse from './pages/SearchBrowse';
import WorkerFeed from './pages/WorkerFeed';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminPortal from './pages/SuperAdminPortal';
import BookingTracker from './pages/BookingTracker';
import WorkerRegister from './pages/WorkerRegister';
import CustomerRegister from './pages/CustomerRegister';

function AppContent() {
  const { user, isAuthenticated, isSocietyAdmin, isSuperAdmin, isWorker, isCustomer } = useAuth();
  const [currentTab, setCurrentTab] = useState('landing');
  const [societies, setSocieties] = useState([]);
  const [selectedSocietyId, setSelectedSocietyId] = useState(1);
  const [globalNotice, setGlobalNotice] = useState(null);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [authModalRole, setAuthModalRole] = useState('customer');

  const fetchSocieties = async () => {
    try {
      const res = await api.getSocieties();
      if (res.data.success) {
        setSocieties(res.data.data || []);
      }
    } catch (err) {
      console.error('Error loading societies:', err);
    }
  };

  useEffect(() => {
    fetchSocieties();
  }, []);

  // When user logs in or role changes, gracefully navigate to appropriate default view
  useEffect(() => {
    if (user) {
      if (user.role === 'super_admin') {
        setCurrentTab('super-admin');
      } else if (user.role === 'society_admin') {
        setCurrentTab('society-admin');
      }
    }
  }, [user?.role]);

  const handleOpenAuth = (mode = 'login', role = 'customer') => {
    setAuthModalMode(mode);
    setAuthModalRole(role);
    setAuthModalOpen(true);
  };

  const handleGetStarted = (type = 'customer') => {
    if (type === 'customer') {
      setCurrentTab('search');
    } else {
      handleOpenAuth('signup', 'worker');
    }
  };

  // Re-seed Database back to original sample data without changing logged in session
  const handleReseedDataOnly = async () => {
    try {
      const res = await api.reseedDatabase();
      setGlobalNotice('🔄 Database reseeded with fresh sample data! (Your login session was preserved)');
      fetchSocieties();
      setTimeout(() => setGlobalNotice(null), 5000);
    } catch (err) {
      alert('Error reseeding database: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Top Main Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuth={handleOpenAuth}
      />

      {/* Global Notification Banner */}
      {globalNotice && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 text-center shadow-md animate-fadeIn flex items-center justify-center gap-2">
          <span>{globalNotice}</span>
          <button onClick={() => setGlobalNotice(null)} className="text-white/80 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {currentTab === 'landing' && (
          <LandingPage
            onGetStarted={handleGetStarted}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentTab === 'search' && (
          <SearchBrowse
            currentCustomer={user?.role === 'customer' ? user : null}
            onWorkerRegisteredClick={() => handleOpenAuth('signup', 'worker')}
          />
        )}

        {currentTab === 'worker-feed' && (
          <WorkerFeed
            activeWorker={user?.role === 'worker' ? user : null}
          />
        )}

        {currentTab === 'bookings' && (
          <BookingTracker
            currentCustomer={user?.role === 'customer' ? user : null}
            activeWorker={user?.role === 'worker' ? user : null}
          />
        )}

        {currentTab === 'society-admin' && (
          <AdminDashboard
            selectedSocietyId={selectedSocietyId}
            setSelectedSocietyId={setSelectedSocietyId}
            societies={societies}
          />
        )}

        {currentTab === 'super-admin' && (
          <SuperAdminPortal />
        )}

        {currentTab === 'worker-register' && (
          <WorkerRegister
            societies={societies}
            setCurrentTab={setCurrentTab}
            onWorkerRegistered={() => {
              fetchSocieties();
              setCurrentTab('search');
            }}
          />
        )}

        {currentTab === 'customer-register' && (
          <CustomerRegister
            setCurrentTab={setCurrentTab}
            onCustomerRegistered={() => {
              setCurrentTab('search');
            }}
          />
        )}

      </main>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
        defaultRole={authModalRole}
        societies={societies}
      />

      {/* Professional Product Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white/90 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
              <span className="font-extrabold text-slate-900 text-sm">SevaSetu Connect</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">National Cooperative Gig Work Federation</span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <button 
                onClick={() => setCurrentTab('search')}
                className="hover:text-slate-900"
              >
                Find Services
              </button>
              <button 
                onClick={() => setCurrentTab('worker-feed')}
                className="hover:text-slate-900"
              >
                Community Job Feed
              </button>
              <button 
                onClick={() => handleOpenAuth('login', 'society_admin')}
                className="text-indigo-700 font-bold hover:underline"
              >
                Society Admin Login
              </button>
              <button 
                onClick={() => handleOpenAuth('login', 'super_admin')}
                className="text-slate-900 font-bold hover:underline"
              >
                Super Admin Login
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            <div>
              © 2026 SevaSetu Connect Federation. Democratic ownership & fair labor compensation.
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleReseedDataOnly}
                className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition"
                title="Reset database tables to initial sample data (Preserves your active login session)"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Sample Data</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
