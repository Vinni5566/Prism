import React from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';
import { normalizeScore, getScoreColor } from '../utils/helpers';

const COLORS = { semantic:'#14b8a6', skill:'#8b5cf6', trajectory:'#f59e0b', behavioral:'#ec4899', domain:'#3b82f6' };
const LABELS  = { semantic:'Semantic', skill:'Skill', trajectory:'Trajectory', behavioral:'Behavioral', domain:'Domain' };

function ScoreTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <div className="font-semibold text-slate-200">{d.name}</div>
      <div className="text-teal-400 font-mono">{d.value.toFixed(1)}</div>
    </div>
  );
}

/** Radar chart for one candidate's score breakdown */
export function ScoreRadar({ breakdown }) {
  if (!breakdown) return null;
  const data = Object.entries(breakdown).map(([key, val]) => ({
    subject: LABELS[key] || key,
    value: normalizeScore(val),
    fullMark: 100,
  }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Inter' }} />
        <Radar dataKey="value" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.15} strokeWidth={1.5} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/** Bar chart comparing top candidates composite scores */
export function CandidateCompareChart({ results }) {
  if (!results?.length) return null;
  const top5 = results.slice(0, 5).map(r => ({
    name: r.name?.split(' ')[0] ?? `#${r.rank}`,
    score: normalizeScore(r.composite_score),
    fill: getScoreColor(r.composite_score),
  }));
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={top5} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<ScoreTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
          {top5.map((d, i) => <Cell key={i} fill={d.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Default export wrapping both */
export default function ScoreChart({ results, breakdown }) {
  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      {breakdown && (
        <div>
          <div className="section-header text-sm mb-2">Score Profile</div>
          <ScoreRadar breakdown={breakdown} />
        </div>
      )}
      {results?.length > 1 && (
        <div>
          <div className="section-header text-sm mb-2">Top Candidates</div>
          <CandidateCompareChart results={results} />
        </div>
      )}
    </div>
  );
}
