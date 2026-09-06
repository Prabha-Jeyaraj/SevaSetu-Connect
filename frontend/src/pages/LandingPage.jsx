import React from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Search, 
  Briefcase, 
  IndianRupee, 
  HeartHandshake, 
  Zap, 
  Wrench, 
  Hammer, 
  Paintbrush 
} from 'lucide-react';

export const LandingPage = ({ onGetStarted, onOpenAuth }) => {
  return (
    <div className="space-y-16 py-4">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-16 border border-slate-800 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-bold mb-5 backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            <span>India's Democratic Cooperative Gig-Work Federation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mb-5">
            Fairer Gig Work,{' '}
            <span className="bg-gradient-to-r from-brand-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              Owned by the Workers
            </span>{' '}
            Who Power It.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed font-normal">
            SevaSetu Connect connects verified local service professionals with homeowners 
            and businesses through registered worker cooperatives. We replace 25–30% corporate 
            platform cuts with democratic governance, fair wages, and collective welfare.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onGetStarted('customer')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-brand-500/25 transition active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Find Verified Professionals</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenAuth('signup', 'worker')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition"
            >
              <Briefcase className="w-4 h-4 text-brand-400" />
              <span>Join as a Service Worker</span>
            </button>
          </div>

          {/* Social Proof Numbers */}
          <div className="grid grid-cols-3 gap-6 pt-10 mt-10 border-t border-slate-800 text-slate-300">
            <div>
              <div className="text-2xl font-extrabold text-white">95%+</div>
              <div className="text-xs text-slate-400">Direct Worker Revenue</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">5% Pool</div>
              <div className="text-xs text-slate-400">Health & Welfare Fund</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">100%</div>
              <div className="text-xs text-slate-400">Verified Cooperatives</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution Comparison */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-wider text-brand-800 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Why Cooperative Federation Matters
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            The Traditional Gig Trap vs The SevaSetu Model
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Gig workers in India face exorbitant commissions and zero social safety nets. 
            SevaSetu restores dignity and fair wages through cooperative federation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Corporate Platform Pitfalls */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-rose-200/80 bg-rose-50/20 space-y-4">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-base">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              Corporate Gig Platforms
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>25% to 30% commission cuts</strong> extracted from every single customer service payment.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Arbitrary algorithmic account deactivations without appeal or human grievance redressal.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Workers classified as disposable "partners" with zero healthcare or emergency relief pools.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Opaque pricing algorithms designed to maximize platform profit rather than fair wages.</span>
              </li>
            </ul>
          </div>

          {/* SevaSetu Cooperative Model */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-emerald-200/80 bg-emerald-50/20 space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              SevaSetu Cooperative Federation
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>95%+ retained by the worker.</strong> Fair, transparent compensation for their labor.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>5% Cooperative Welfare Pool:</strong> Funds member medical insurance and emergency loans.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Democratic Society Ownership:</strong> Each cooperative society votes on rules and rates.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>AI Seasonal Demand Forecasting:</strong> Equips societies to prepare for seasonal demand surges without predatory surge pricing.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-100/70 rounded-3xl p-8 sm:p-12 border border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Simple, Transparent Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            How SevaSetu Works for You
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-800 font-bold flex items-center justify-center mb-4 text-sm">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1.5">
                Browse or Post Job Needs
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter verified electricians, plumbers, carpenters, caregivers, or painters by district, 
                or post a customized job requirement to receive verified applications.
              </p>
            </div>
            <span className="text-[10px] font-bold text-brand-700 mt-4 block">Cooperative Verified Badge</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center mb-4 text-sm">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1.5">
                Flexible Bookings & Collabs
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Book for one-time repairs, recurring weekly maintenance, or fixed-term project contracts. 
                Workers can also collaborate with other trades on complex multi-skill renovations.
              </p>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 mt-4 block">Fair Transparent Rates</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center mb-4 text-sm">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1.5">
                Guaranteed Fair Completion
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review work, mark bookings completed, and support the cooperative ecosystem. 95% goes directly to 
                the professional and 5% funds the emergency worker healthcare pool.
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 mt-4 block">Collective Social Security</span>
          </div>
        </div>
      </section>

      {/* Featured Trades */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service Categories</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Top Services Available on SevaSetu
            </h2>
          </div>
          <button
            onClick={() => onGetStarted('customer')}
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            <span>View All Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { trade: 'Electrician', icon: Zap, count: 'Domestic, Inverter, 3-Phase', color: 'from-amber-500 to-orange-500' },
            { trade: 'Plumber', icon: Wrench, count: 'Sanitary, Piping, Pumps', color: 'from-blue-500 to-cyan-500' },
            { trade: 'Carpenter', icon: Hammer, count: 'Modular, Woodwork, Fittings', color: 'from-amber-700 to-yellow-800' },
            { trade: 'Caregiver', icon: HeartHandshake, count: 'Elder Care, Nursing Assist', color: 'from-rose-500 to-pink-500' },
            { trade: 'Painter', icon: Paintbrush, count: 'Interior, Texture, Weather', color: 'from-purple-500 to-indigo-500' }
          ].map((t, idx) => {
            const Icon = t.icon;
            return (
              <div 
                key={idx}
                onClick={() => onGetStarted('customer')}
                className="glass-card p-4 rounded-2xl border border-slate-200 hover:border-brand-500 hover:shadow-md cursor-pointer transition text-center group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} text-white flex items-center justify-center mx-auto mb-2.5 shadow-sm group-hover:scale-105 transition`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-700">{t.trade}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">{t.count}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="rounded-3xl bg-gradient-to-r from-brand-600 via-brand-700 to-coop-blue text-white p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
        <div className="relative max-w-xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to Support Fair Gig Work?
          </h2>
          <p className="text-xs sm:text-sm text-brand-100 font-normal leading-relaxed">
            Whether you need a master electrician for your home, or you are a skilled artisan 
            seeking 95%+ revenue retention with cooperative security, join SevaSetu Connect today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onGetStarted('customer')}
              className="px-6 py-3 rounded-2xl bg-white text-slate-900 font-extrabold text-xs shadow-md hover:bg-slate-50 transition active:scale-95"
            >
              Find a Professional
            </button>
            <button
              onClick={() => onOpenAuth('signup', 'worker')}
              className="px-6 py-3 rounded-2xl bg-slate-950/80 hover:bg-slate-950 text-white font-extrabold text-xs border border-white/20 transition"
            >
              Sign Up as a Worker
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
