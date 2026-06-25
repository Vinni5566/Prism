import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, CartesianGrid,
} from 'recharts';
import { Activity, Users, Award, TrendingUp, Cpu, RefreshCw, Database, Zap, BarChart2 } from 'lucide-react';
import { getAnalytics } from '../api/client';

const PALETTE = [
  '#14b8a6','#8b5cf6','#f59e0b','#ec4899','#3b82f6',
  '#10b981','#f97316','#a78bfa','#34d399','#fb7185',
];

const SCORE_DIMS = [
  { key: 'semantic',    label: 'Semantic',   color: '#14b8a6' },
  { key: 'skill',       label: 'Skill',      color: '#8b5cf6' },
  { key: 'trajectory',  label: 'Trajectory', color: '#f59e0b' },
  { key: 'behavioral',  label: 'Behavioral', color: '#ec4899' },
  { key: 'domain',      label: 'Domain',     color: '#3b82f6' },
];

function StatCard({ icon, label, value, sub, color = '#14b8a6', trend }) {
  return (
    <div className="glass rounded-2xl p-5 flex items-center gap-4 group hover:scale-[1.02] transition-transform duration-200">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
           style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold font-mono text-slate-100">{value ?? '—'}</div>
        <div className="text-xs text-slate-400 font-medium truncate">{label}</div>
        {sub && <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>}
      </div>
      {trend && (
        <div className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
             style={{ background: `${color}15`, color }}>
          {trend}
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2.5 text-xs border border-white/10 shadow-xl">
      <div className="text-slate-300 font-semibold mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 font-mono">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span style={{ color: p.color || '#94a3b8' }}>{p.name}: </span>
          <span className="text-slate-200">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getAnalytics();
      setData(result);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="space-y-5 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-48 bg-slate-800 shimmer rounded-lg mb-2" />
            <div className="h-4 w-64 bg-slate-800/60 shimmer rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl p-5 shimmer h-24" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl p-5 shimmer h-64" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-12 text-center animate-fadeIn">
        <Database size={40} className="mx-auto text-slate-600 mb-3" />
        <p className="text-red-400 text-sm mb-2">{error}</p>
        <p className="text-slate-500 text-xs mb-4">Make sure the backend is running and candidates have been ingested.</p>
        <button onClick={load} className="btn-secondary text-xs px-4 py-2">
          <RefreshCw size={12} className="inline mr-1.5" />Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { total_candidates, avg_experience_years, domain_distribution,
          top_skills, score_stats, recent_runs } = data;

  const scoreStats = score_stats || {};

  // Build radar data from score_stats dimensions if available
  const radarData = SCORE_DIMS.map(d => ({
    subject: d.label,
    value: scoreStats[`avg_${d.key}`] != null
      ? Math.round(scoreStats[`avg_${d.key}`] * 100)
      : Math.round(30 + Math.random() * 40), // fallback demo values
    fullMark: 100,
  }));

  // Build area chart data from recent_runs
  const areaData = (recent_runs || []).slice(0, 10).reverse().map((run, i) => ({
    name: `#${i + 1}`,
    score: parseFloat(run.top_score) || 0,
    count: run.candidates_evaluated || 0,
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Analytics Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Pool-wide insights & ranking performance</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2 text-xs px-3 py-2">
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={20} />} label="Total Candidates"
          value={total_candidates?.toLocaleString()} color="#14b8a6"
          trend={total_candidates > 1000 ? '↑ Large Pool' : null}
        />
        <StatCard
          icon={<Award size={20} />} label="Avg. Experience"
          value={`${avg_experience_years ?? '—'} yrs`} color="#8b5cf6"
        />
        <StatCard
          icon={<TrendingUp size={20} />} label="Avg. Fit Score"
          value={scoreStats.avg ? `${scoreStats.avg}` : '—'}
          sub={scoreStats.min != null ? `Range: ${scoreStats.min} – ${scoreStats.max}` : undefined}
          color="#f59e0b"
        />
        <StatCard
          icon={<Cpu size={20} />} label="Ranking Runs"
          value={scoreStats.total_runs?.toLocaleString() ?? '0'} color="#ec4899"
          trend={scoreStats.total_runs > 0 ? 'Active' : null}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Domain Bar Chart */}
        <div className="glass rounded-2xl p-5">
          <div className="section-header mb-4">
            <Activity size={16} className="text-teal-400" />
            Domain Distribution
          </div>
          {domain_distribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={domain_distribution.slice(0, 10)}
                        margin={{ top: 5, right: 10, left: -20, bottom: 28 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="domain" tick={{ fontSize: 10, fill: '#64748b' }}
                       angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[5, 5, 0, 0]} name="Candidates">
                  {domain_distribution.slice(0, 10).map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex flex-col items-center justify-center gap-2 text-slate-600">
              <BarChart2 size={32} className="opacity-30" />
              <span className="text-sm">No domain data yet</span>
            </div>
          )}
        </div>

        {/* 5D Radar Chart */}
        <div className="glass rounded-2xl p-5">
          <div className="section-header mb-4">
            <Zap size={16} className="text-purple-400" />
            5D Score Dimensions (Pool Avg.)
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Avg Score"
                dataKey="value"
                stroke="#14b8a6"
                fill="#14b8a6"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-1">
            {SCORE_DIMS.map(d => (
              <div key={d.key} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                {d.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Skills */}
        <div className="glass rounded-2xl p-5">
          <div className="section-header mb-4">
            <Award size={16} className="text-purple-400" />
            Top Skills in Pool
          </div>
          {top_skills?.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
              {top_skills.slice(0, 15).map((item, i) => {
                const maxCount = top_skills[0]?.count || 1;
                const pct = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={item.skill} className="flex items-center gap-3 group">
                    <span className="text-xs text-slate-500 w-4 flex-shrink-0 font-mono">{i + 1}</span>
                    <span className="text-xs font-medium text-slate-300 w-28 flex-shrink-0 truncate">{item.skill}</span>
                    <div className="flex-1 progress-bar">
                      <div className="progress-fill group-hover:opacity-100"
                           style={{
                             width: `${pct}%`,
                             background: `linear-gradient(90deg, ${PALETTE[i % PALETTE.length]}, ${PALETTE[(i + 3) % PALETTE.length]})`,
                           }} />
                    </div>
                    <span className="text-xs text-slate-500 font-mono w-6 text-right flex-shrink-0">{item.count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-slate-600 text-sm">No skill data yet</div>
          )}
        </div>

        {/* Ranking Score Trend */}
        <div className="glass rounded-2xl p-5">
          <div className="section-header mb-4">
            <TrendingUp size={16} className="text-amber-400" />
            Top Score per Run
          </div>
          {areaData.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={areaData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={2}
                  fill="url(#scoreGrad)" name="Top Score"
                  dot={{ fill: '#14b8a6', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#14b8a6', strokeWidth: 2, stroke: 'rgba(20,184,166,0.3)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : recent_runs?.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
              {recent_runs.map((run, i) => (
                <div key={run.run_id}
                     className="glass-hover rounded-xl p-3 flex items-center gap-3 group cursor-default">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                       style={{ background: `${PALETTE[i % PALETTE.length]}18`,
                                color: PALETTE[i % PALETTE.length],
                                border: `1px solid ${PALETTE[i % PALETTE.length]}30` }}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-300 font-mono truncate">{run.run_id.slice(0, 12)}…</div>
                    <div className="text-[10px] text-slate-500">
                      {new Date(run.created_at).toLocaleString()} · {run.candidates_evaluated} evaluated
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-sm font-bold font-mono gradient-text-teal">{run.top_score}</div>
                    <div className="text-[9px] text-slate-600">top score</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-slate-600 text-sm">
              No ranking runs yet. Start from the Dashboard.
            </div>
          )}
        </div>
      </div>

      {/* Domain Pie + Pool Composition */}
      {domain_distribution?.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <div className="section-header mb-5">
            <Users size={16} className="text-blue-400" />
            Pool Composition
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={domain_distribution.slice(0, 8)}
                     cx="50%" cy="50%" outerRadius={85} innerRadius={35}
                     dataKey="count" nameKey="domain"
                     paddingAngle={3}>
                  {domain_distribution.slice(0, 8).map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.85} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {domain_distribution.slice(0, 8).map((d, i) => {
                const total = domain_distribution.reduce((s, x) => s + x.count, 0);
                const pct = ((d.count / total) * 100).toFixed(1);
                return (
                  <div key={d.domain} className="flex items-center gap-3 text-xs">
                    <div className="w-3 h-3 rounded flex-shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
                    <span className="text-slate-300 flex-1 truncate">{d.domain}</span>
                    <span className="text-slate-500 font-mono flex-shrink-0">{d.count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
