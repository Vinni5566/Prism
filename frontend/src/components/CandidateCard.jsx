import React, { useState, useEffect } from 'react';
import {
  ChevronDown, ChevronUp, Copy, Mail, ExternalLink,
  Award, Briefcase, MapPin, Star, Sparkles
} from 'lucide-react';
import PrismViz from './PrismViz';
import BehaviorSignals from './BehaviorSignals';
import CareerTimeline from './CareerTimeline';
import FeedbackPanel from './FeedbackPanel';
import { getCandidateById } from '../api/client';
import {
  normalizeScore, getFitLabel, getFitClass,
  initials, formatYears, truncate, copyToClipboard,
} from '../utils/helpers';

const SIGNAL_COLORS = {
  semantic: '#14b8a6', skill: '#8b5cf6', trajectory: '#f59e0b', behavioral: '#ec4899', domain: '#3b82f6',
};
const SIGNAL_LABELS = {
  semantic: 'Semantic', skill: 'Skill', trajectory: 'Traj', behavioral: 'Behav', domain: 'Domain',
};

function ScoreBar({ label, value, color }) {
  const pct = normalizeScore(value);
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between items-center text-[10px]">
        <span className="text-slate-500">{label}</span>
        <span className="font-mono" style={{ color }}>{pct.toFixed(0)}</span>
      </div>
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
             style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function CandidateCard({ candidate, rank, runId, onFeedbackGiven, isComparing, onToggleCompare, onOpenOutreach }) {
  const [expanded, setExpanded] = useState(rank === 1);
  const [fullProfile, setFullProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const {
    candidate_id, name, email,
    location, skills = [], explanation,
    composite_score, score_breakdown = {},
    skill_gap = [],
  } = candidate;

  const current_role = candidate.current_role || candidate.current_title;
  const company = candidate.company || candidate.current_company;
  const experience_years = candidate.experience_years ?? candidate.years_experience;
  const outreach_message = candidate.outreach_message || candidate.outreach_msg;

  const score     = normalizeScore(composite_score);
  const fitLabel  = getFitLabel(composite_score);
  const fitClass  = getFitClass(composite_score);

  const matchedSkills = skill_gap.filter(g => g.status === 'full' || g.match_level >= 0.8);
  const gapSkills     = skill_gap.filter(g => g.status === 'missing' || g.match_level < 0.3);
  const partialSkills = skill_gap.filter(g => g.status === 'partial' || (g.match_level >= 0.3 && g.match_level < 0.8));

  // Fallback: use raw skills list if no skill_gap
  const displaySkills = skills.slice(0, 8);

  useEffect(() => {
    if (expanded && !fullProfile && candidate_id) {
      setLoadingProfile(true);
      getCandidateById(candidate_id)
        .then(data => {
          setFullProfile(data);
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingProfile(false));
    }
  }, [expanded, fullProfile, candidate_id]);

  return (
    <div className={`glass-hover rounded-2xl overflow-hidden transition-all duration-300
      ${rank <= 3 ? 'border border-teal-500/15' : ''}`}>

      {/* Top strip for top-3 */}
      {rank <= 3 && (
        <div className="h-0.5 w-full"
             style={{ background: rank === 1
               ? 'linear-gradient(90deg,#14b8a6,#8b5cf6)'
               : rank === 2 ? 'linear-gradient(90deg,#64748b,#94a3b8)'
               : 'linear-gradient(90deg,#78350f,#d97706)' }} />
      )}

      {/* Main header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Rank + Avatar */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
            <div className="rank-badge text-white">
              {rank <= 3
                ? rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'
                : `#${rank}`}
            </div>
            {/* Avatar circle */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                 style={{ background: `hsl(${(rank * 47) % 360}, 60%, 40%)` }}>
              {initials(name)}
            </div>
          </div>

          {/* Candidate info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="text-base font-semibold text-slate-100">{name || 'Unknown Candidate'}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  {current_role && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Briefcase size={10}/> {current_role}
                    </span>
                  )}
                  {company && (
                    <span className="text-xs text-slate-500">@ {company}</span>
                  )}
                  {experience_years != null && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Award size={10}/> {formatYears(experience_years)}
                    </span>
                  )}
                  {location && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={10}/> {location}
                    </span>
                  )}
                </div>
              </div>
              {/* Score + badge */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono gradient-text-teal">{score.toFixed(0)}</div>
                  <div className="text-[10px] text-slate-500">/ 100</div>
                </div>
                <span className={fitClass}>{fitLabel}</span>
              </div>
            </div>

            {/* Score bars (always shown) */}
            {Object.keys(score_breakdown).length > 0 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {Object.entries(score_breakdown).slice(0, 5).map(([key, val]) => (
                  <ScoreBar key={key} label={SIGNAL_LABELS[key] || key} value={val} color={SIGNAL_COLORS[key] || '#14b8a6'}/>
                ))}
              </div>
            )}

            {/* Skills chips (top 5, always visible) */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {displaySkills.map(skill => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
              {skills.length > 8 && (
                <span className="text-xs text-slate-600 flex items-center">+{skills.length - 8} more</span>
              )}
            </div>
          </div>

          {/* Compare toggle */}
          <button onClick={onToggleCompare}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all duration-150 mr-1
                    ${isComparing
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-400'
                      : 'border-slate-700/40 text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
            {isComparing ? '✓ Compare' : '+ Compare'}
          </button>

          {/* Expand toggle */}
          <button onClick={() => setExpanded(e => !e)}
                  className="flex-shrink-0 p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all">
            {expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          </button>
        </div>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-slate-700/30 p-5 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: 3D rotating Prism Radar + Skill gap analysis */}
            <div className="space-y-4">
              {Object.keys(score_breakdown).length > 0 && (
                <div>
                  <div className="section-header text-sm mb-2">Prism Score Profile</div>
                  <PrismViz breakdown={score_breakdown} />
                </div>
              )}

              {/* Skill gaps */}
              {skill_gap.length > 0 && (
                <div className="space-y-2">
                  <div className="section-header text-sm">Skill Analysis</div>
                  {matchedSkills.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-600 uppercase tracking-wide">Matched</div>
                      <div className="flex flex-wrap gap-1.5">
                        {matchedSkills.map(g => (
                          <span key={g.skill} className="badge-excellent text-[10px] px-2 py-0.5">{g.skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {partialSkills.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-600 uppercase tracking-wide">Partial</div>
                      <div className="flex flex-wrap gap-1.5">
                        {partialSkills.map(g => (
                          <span key={g.skill} className="badge-moderate text-[10px] px-2 py-0.5">{g.skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {gapSkills.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-600 uppercase tracking-wide">Missing</div>
                      <div className="flex flex-wrap gap-1.5">
                        {gapSkills.map(g => (
                          <span key={g.skill} className="badge-weak text-[10px] px-2 py-0.5">{g.skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: AI explanation + Career Timeline / Behavior signals */}
            <div className="space-y-4">
              {explanation && (
                <div>
                  <div className="section-header text-sm mb-2 flex items-center gap-1.5">
                    <Star size={13} className="text-yellow-400"/> AI Explanation
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/20 border border-white/5 p-3 rounded-2xl">
                    {explanation}
                  </p>
                </div>
              )}

              {loadingProfile ? (
                <div className="h-28 bg-slate-800 animate-pulse rounded-2xl" />
              ) : (
                <>
                  {/* Behavioral Telemetry signals */}
                  <BehaviorSignals candidate={fullProfile || candidate} />
                  
                  {/* Career Timeline progression */}
                  <CareerTimeline history={fullProfile?.career_history} />
                </>
              )}

              {outreach_message && onOpenOutreach && (
                <button
                  onClick={() => onOpenOutreach(candidate)}
                  className="w-full btn-secondary text-xs flex items-center justify-center gap-1.5 py-3 hover:border-purple-500/30"
                >
                  <Sparkles size={12} className="text-purple-400 animate-pulse" />
                  Generate Personalized Outreach
                </button>
              )}

              {/* Email link */}
              {email && (
                <a href={`mailto:${email}`}
                   className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 transition-colors">
                  <ExternalLink size={11}/> {email}
                </a>
              )}
            </div>
          </div>

          {/* Feedback */}
          {runId && (
            <div className="pt-3 border-t border-slate-700/20">
              <div className="text-xs font-medium text-slate-500 mb-2">Recruiter Feedback</div>
              <FeedbackPanel
                runId={runId}
                candidateId={candidate_id}
                onFeedbackGiven={onFeedbackGiven}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
