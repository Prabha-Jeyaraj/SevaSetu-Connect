import React from 'react';
import { ShieldCheck, UserCheck, AlertCircle, Clock } from 'lucide-react';

export const CooperativeBadge = ({ isMember, societyName, verificationStatus }) => {
  if (isMember) {
    if (verificationStatus === 'verified') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm" title={`Verified member of ${societyName || 'Cooperative Society'}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Cooperative Verified</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300" title="Application under review by cooperative society">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Verification Pending</span>
        </span>
      );
    }
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
      <span>Independent Worker</span>
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const styles = {
    requested: 'bg-blue-100 text-blue-800 border-blue-200',
    accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    in_progress: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    completed: 'bg-purple-100 text-purple-800 border-purple-200',
    cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
    open: 'bg-teal-100 text-teal-800 border-teal-200'
  };

  const labels = {
    requested: 'Requested',
    accepted: 'Accepted / Confirmed',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    open: 'Open for Applications'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.open}`}>
      {labels[status] || status}
    </span>
  );
};

export default CooperativeBadge;
