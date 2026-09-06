import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Briefcase, 
  Search, 
  CalendarCheck, 
  ShieldCheck, 
  Layers,
  LogIn,
  UserPlus,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ 
  currentTab, 
  setCurrentTab, 
  onOpenAuth
}) => {
  const { user, isAuthenticated, logout, isSocietyAdmin, isSuperAdmin, isWorker, isCustomer } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setCurrentTab('landing');
    setUserDropdownOpen(false);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-purple-200">Super Admin</span>;
      case 'society_admin':
        return <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-indigo-200">Society Admin</span>;
      case 'worker':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">Worker</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-slate-200">Customer</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => setCurrentTab('landing')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-coop-blue flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  SevaSetu
                </span>
                <span className="text-xs font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                  Connect
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Cooperative Gig Marketplace
              </p>
            </div>
          </div>

          {/* Main Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setCurrentTab('search')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                currentTab === 'search'
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Search className="w-4 h-4 text-brand-600" />
              <span>Find Services</span>
            </button>

            <button
              onClick={() => setCurrentTab('worker-feed')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                currentTab === 'worker-feed'
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Community Job Feed</span>
            </button>

            <button
              onClick={() => setCurrentTab('bookings')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                currentTab === 'bookings'
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <span>Bookings</span>
            </button>

            {/* Portal link for Society Admin */}
            {isSocietyAdmin && (
              <button
                onClick={() => setCurrentTab('society-admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  currentTab === 'society-admin'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Society Portal</span>
              </button>
            )}

            {/* Portal link for Super Admin */}
            {isSuperAdmin && (
              <button
                onClick={() => setCurrentTab('super-admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  currentTab === 'super-admin'
                    ? 'bg-slate-900 text-brand-400 shadow-sm'
                    : 'bg-slate-900 text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                <span>Super Admin</span>
              </button>
            )}
          </nav>

          {/* Right User Authentication Area */}
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold shadow-sm transition active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-coop-blue text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{user.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{user.role?.replace('_', ' ')}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1">{getRoleBadge(user.role)}</div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => { setCurrentTab('search'); setUserDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                        <span>Find Services</span>
                      </button>

                      <button
                        onClick={() => { setCurrentTab('bookings'); setUserDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Bookings</span>
                      </button>

                      {isSocietyAdmin && (
                        <button
                          onClick={() => { setCurrentTab('society-admin'); setUserDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs text-indigo-700 font-bold hover:bg-indigo-50 flex items-center gap-2"
                        >
                          <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Society Admin Portal</span>
                        </button>
                      )}

                      {isSuperAdmin && (
                        <button
                          onClick={() => { setCurrentTab('super-admin'); setUserDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-900 font-bold hover:bg-slate-100 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                          <span>Platform Super Admin</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 font-semibold hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
