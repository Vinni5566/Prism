import React from 'react';
import { X, Award, Briefcase, MapPin, Mail, Star } from 'lucide-react';
import { ScoreRadar } from './ScoreChart';
import { normalizeScore, getFitLabel, getFitClass, formatYears, initials } from '../utils/helpers';

export default function CompareModal({ candidates, onClose }) {
  if (!candidates || candidates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto glass rounded-2xl p-6 border border-white/10 shadow-2xl no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold gradient-text">Candidate Comparison</h2>
          <p className="text-xs text-slate-500 mt-1">
            Comparing {candidates.length} of max 3 selected candidates side-by-side
          </p>
        </div>

        {/* Side-by-side Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-${candidates.length} gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-800`}>
          {candidates.map((cand, idx) => {
            const score = normalizeScore(cand.composite_score);
            const fitLabel = getFitLabel(cand.composite_score);
            const fitClass = getFitClass(cand.composite_score);

            const matchedSkills = (cand.skill_gap || []).filter(g => g.status === 'full' || g.match_level >= 0.8);
            const partialSkills = (cand.skill_gap || []).filter(g => g.status === 'partial' || (g.match_level >= 0.3 && g.match_level < 0.8));
            const gapSkills = (cand.skill_gap || []).filter(g => g.status === 'missing' || g.match_level < 0.3);

            return (
              <div key={cand.candidate_id || idx} className={`space-y-6 ${idx > 0 ? 'md:pl-6' : ''}`}>
                {/* Column Candidate Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white"
                       style={{ background: `hsl(${(idx * 137) % 360}, 60%, 40%)` }}>
                    {initials(cand.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200 text-sm">{cand.name || 'Unknown'}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono text-slate-400">Rank #{cand.rank}</span>
                      <span className={`text-[10px] ${fitClass}`}>{fitLabel}</span>
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-xl font-bold font-mono gradient-text-teal">{score.toFixed(0)}</span>
                    <span className="text-[9px] text-slate-500 block">/ 100</span>
                  </div>
                </div>

                {/* Score profile radar chart */}
                {cand.score_breakdown && (
                  <div className="bg-slate-900/30 border border-slate-800/40 rounded-xl p-3">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 text-center">Score Profile</div>
                    <ScoreRadar breakdown={cand.score_breakdown} />
                  </div>
                )}

                {/* Experience Details */}
                <div className="space-y-2 text-xs">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Experience Profile</div>
                  <div className="grid grid-cols-2 gap-2 bg-slate-900/20 rounded-xl p-3 border border-slate-800/20">
                    <div className="space-y-1">
                      <div className="text-slate-500 text-[10px]">Role</div>
                      <div className="text-slate-300 font-medium truncate flex items-center gap-1">
                        <Briefcase size={10} className="text-teal-400" />
                        {cand.current_role || cand.current_title || 'N/A'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-slate-500 text-[10px]">Company</div>
                      <div className="text-slate-300 font-medium truncate">
                        {cand.company || cand.current_company || 'N/A'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-slate-500 text-[10px]">Experience</div>
                      <div className="text-slate-300 font-medium flex items-center gap-1">
                        <Award size={10} className="text-purple-400" />
                        {formatYears(cand.experience_years ?? cand.years_experience)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-slate-500 text-[10px]">Location</div>
                      <div className="text-slate-300 font-medium truncate flex items-center gap-1">
                        <MapPin size={10} className="text-yellow-400" />
                        {cand.location || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skill Gaps comparison */}
                <div className="space-y-2">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Skill Gap Analysis</div>
                  <div className="space-y-2 bg-slate-900/20 rounded-xl p-3 border border-slate-800/20 text-xs">
                    {matchedSkills.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[9px] text-emerald-400 uppercase tracking-wide">Matched</div>
                        <div className="flex flex-wrap gap-1">
                          {matchedSkills.map(g => (
                            <span key={g.skill} className="badge-excellent text-[9px] px-1.5 py-0.5">{g.skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {partialSkills.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[9px] text-amber-400 uppercase tracking-wide">Partial</div>
                        <div className="flex flex-wrap gap-1">
                          {partialSkills.map(g => (
                            <span key={g.skill} className="badge-moderate text-[9px] px-1.5 py-0.5">{g.skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {gapSkills.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[9px] text-red-400 uppercase tracking-wide">Missing</div>
                        <div className="flex flex-wrap gap-1">
                          {gapSkills.map(g => (
                            <span key={g.skill} className="badge-weak text-[9px] px-1.5 py-0.5">{g.skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Explanation Summary */}
                {cand.explanation && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Star size={10} className="text-yellow-400" />
                      AI Evaluation
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans bg-slate-900/10 rounded-xl p-3 border border-slate-800/20">
                      {cand.explanation}
                    </p>
                  </div>
                )}

                {/* AI Outreach Draft */}
                {cand.outreach_msg && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Mail size={10} className="text-purple-400" />
                      Outreach Draft
                    </div>
                    <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-3 text-[10px] font-mono text-slate-400 leading-relaxed max-h-32 overflow-y-auto no-scrollbar">
                      {cand.outreach_msg}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
