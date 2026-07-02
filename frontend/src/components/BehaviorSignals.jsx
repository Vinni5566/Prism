import React from 'react';
import { Calendar, UserCheck, Flame, RefreshCw, Zap, AlertTriangle } from 'lucide-react';
import { normalizeScore } from '../utils/helpers';

export default function BehaviorSignals({ candidate }) {
  // Extract or simulate candidate's behavioral sub-signals
  const completeness = normalizeScore(candidate.profile_completeness || candidate.activity_score || 70);
  
  // Calculate relative recency rating
  const lastActiveStr = candidate.last_active || "3 months ago";
  let activityRecency = 65; // default moderate
  let isStale = false;
  if (lastActiveStr) {
    const dateLower = String(lastActiveStr).toLowerCase();
    if (dateLower.includes('today') || dateLower.includes('hour') || dateLower.includes('1 day ago') || dateLower.includes('2026-06')) {
      activityRecency = 95;
    } else if (dateLower.includes('week') || dateLower.includes('2026-05')) {
      activityRecency = 75;
    } else if (dateLower.includes('month') || dateLower.includes('2026-04')) {
      activityRecency = 45;
    } else {
      activityRecency = 25;
      isStale = true;
    }
  }

  // Engage rate / response behavior
  const responseRate = normalizeScore(candidate.recruiter_response_rate || 80);
  
  // Overall Hiring Likelihood / Interview Completion
  const hiringLikelihood = Math.round((completeness * 0.4 + activityRecency * 0.4 + responseRate * 0.2));

  const signals = [
    { label: 'Profile Freshness', value: activityRecency, icon: <Calendar size={13} />, color: '#14b8a6', desc: 'Recency of candidate updates & platform logins' },
    { label: 'Profile Completeness', value: completeness, icon: <UserCheck size={13} />, color: '#8b5cf6', desc: 'Percentage of optional profile details filled out' },
    { label: 'Response Rate', value: responseRate, icon: <RefreshCw size={13} />, color: '#3b82f6', desc: 'Average response rate to recruiter messaging' },
    { label: 'Hiring Likelihood', value: hiringLikelihood, icon: <Flame size={13} />, color: '#ec4899', desc: 'Active job seeking intent signal calculation' },
  ];

  return (
    <div className="space-y-3.5 bg-slate-900/40 border border-white/5 rounded-2xl p-4.5">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Zap size={12} className="text-pink-400" /> Behavioral Signals (AI-Resistant)
        </h4>
        <span className="text-[10px] text-slate-500 font-mono">Real-time telemetry</span>
      </div>
      
      {isStale && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2.5 flex items-start gap-2 animate-pulse">
          <AlertTriangle size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-orange-400">Freshness Decay Warning</div>
            <div className="text-[10px] text-slate-400">This candidate's profile hasn't been updated in &gt;90 days. Their behavioral signal score has been heavily penalized.</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {signals.map((sig, idx) => (
          <div key={idx} className="space-y-1 bg-slate-950/40 border border-white/5 rounded-xl p-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <span style={{ color: sig.color }}>{sig.icon}</span>
                {sig.label}
              </span>
              <span className="font-mono font-bold" style={{ color: sig.color }}>
                {sig.value}%
              </span>
            </div>
            
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${sig.value}%`, backgroundColor: sig.color }}
              />
            </div>
            <p className="text-[9px] text-slate-500 italic mt-1 leading-normal">{sig.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
