import React from 'react';
import { Star, MapPin, Phone, ShieldCheck, Briefcase, IndianRupee, Calendar } from 'lucide-react';
import { CooperativeBadge } from './Badge';

export const WorkerCard = ({ worker, onBook }) => {
  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-200/80 hover:shadow-xl hover:border-brand-300 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Top Badges & Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <CooperativeBadge 
            isMember={worker.is_cooperative_member} 
            societyName={worker.society_name} 
            verificationStatus={worker.verification_status} 
          />
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span className="text-xs font-bold text-amber-900">{worker.rating || 4.8}</span>
            <span className="text-[10px] text-amber-700">({worker.review_count || 12})</span>
          </div>
        </div>

        {/* Worker Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white font-bold text-lg flex items-center justify-center shadow-md">
            {worker.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition">
              {worker.name}
            </h3>
            <p className="text-xs font-semibold text-brand-600 flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {worker.skill_type} • {worker.experience_years || 3}+ yrs exp
            </p>
          </div>
        </div>

        {/* Society Info if Cooperative */}
        {worker.society_name && (
          <div className="mb-3 bg-brand-50/70 rounded-xl p-2.5 border border-brand-100/80 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800 block">
              Cooperative Society:
            </span>
            <span className="font-semibold text-slate-800">{worker.society_name}</span>
          </div>
        )}

        {/* Bio */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4">
          {worker.bio || `Skilled ${worker.skill_type} offering top quality services.`}
        </p>

        {/* Meta Info */}
        <div className="space-y-1.5 text-xs text-slate-600 mb-4 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
            <span className="truncate">{worker.location} ({worker.district})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="font-mono text-slate-700">{worker.phone}</span>
          </div>
        </div>
      </div>

      {/* Footer Rate & Action */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Base Rate</span>
          <div className="flex items-baseline gap-0.5 text-slate-900 font-extrabold text-base">
            <span>₹{worker.hourly_rate}</span>
            <span className="text-[11px] font-normal text-slate-500">/hr</span>
          </div>
        </div>

        <button
          onClick={() => onBook(worker)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-bold shadow-md shadow-brand-600/20 hover:shadow-lg transition active:scale-95"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book Now</span>
        </button>
      </div>
    </div>
  );
};

export default WorkerCard;
