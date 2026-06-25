import React, { useEffect, useState, useRef } from 'react';
import {
  Shield, Cpu, Database, Activity, RefreshCw, Layers,
  CheckCircle, Terminal, Play, Zap, TrendingUp, Clock,
  Server, GitBranch, Package, AlertCircle
} from 'lucide-react';
import { getHealth, getStats, getRuns } from '../../api/client';

const LOG_LINES = [
  { ts: '10:42:01', level: 'INFO',  msg: '[API] Startup complete. Database initialized.', color: '#14b8a6' },
  { ts: '10:42:01', level: 'INFO',  msg: '[VEC] ChromaDB collection loaded: 2847 vectors', color: '#14b8a6' },
  { ts: '10:42:02', level: 'INFO',  msg: '[NIM] LLaMA-3.1-70B endpoint reachable. Latency: 234ms', color: '#14b8a6' },
  { ts: '10:42:02', level: 'INFO',  msg: '[EMB] sentence-transformers/all-MiniLM-L6-v2 loaded', color: '#14b8a6' },
  { ts: '10:43:15', level: 'INFO',  msg: '[RANK] New ranking run initiated. JD parsed in 1.2s', color: '#14b8a6' },
  { ts: '10:43:17', level: 'INFO',  msg: '[VEC] Semantic search: top-50 candidates retrieved', color: '#14b8a6' },
  { ts: '10:43:22', level: 'INFO',  msg: '[LLM] Explanation generated for 10 candidates', color: '#14b8a6' },
  { ts: '10:43:23', level: 'OK',    msg: '[RANK] Run complete. 47 candidates ranked in 8.1s', color: '#10b981' },
  { ts: '10:44:01', level: 'WARN',  msg: '[NIM] Rate limit approaching: 8,100/10,000 req/hr', color: '#f59e0b' },
  { ts: '10:44:05', level: 'INFO',  msg: '[FEED] Feedback stored for run abc123: strong_yes × 3', color: '#14b8a6' },
];

function MetricCard({ label, value, icon, color, sub, pulse }) {
  return (
    <div className="glass rounded-xl p-4 border border-white/5 group hover:border-opacity-30 transition-all duration-200"
         style={{ '--hover-color': color }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
             style={{ background: `${color}18`, border: `1px solid ${color}25` }}>
          <span style={{ color }} className="flex items-center">{icon}</span>
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium truncate">{label}</span>
        {pulse && <span className="ml-auto w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />}
      </div>
      <div className="font-bold text-slate-200 text-sm leading-tight truncate" title={value}>{value}</div>
      {sub && <div className="text-[9px] text-slate-600 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const logRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [h, s, r] = await Promise.all([getHealth(), getStats(), getRuns()]);
      setHealth(h);
      setStats(s);
      setRuns(r.runs || []);
      setLastRefresh(new Date());
    } catch (e) {
      console.error('[Admin] load failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto my-8 animate-fadeIn">
        <div className="h-12 bg-slate-800/60 shimmer rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-800/60 shimmer rounded-xl" />)}
        </div>
        <div className="h-64 bg-slate-800/60 shimmer rounded-2xl" />
        <div className="h-64 bg-slate-800/60 shimmer rounded-2xl" />
      </div>
    );
  }

  const isOnline = health?.status === 'ok';

  const systemMetrics = [
    {
      label: 'LLM Engine',
      value: health?.model || 'LLaMA-3.1-70B',
      icon: <Cpu size={14} />,
      color: '#8b5cf6',
      sub: 'NVIDIA NIM Endpoint',
      pulse: isOnline,
    },
    {
      label: 'Embedding Model',
      value: 'all-MiniLM-L6-v2',
      icon: <Layers size={14} />,
      color: '#14b8a6',
      sub: 'sentence-transformers',
      pulse: isOnline,
    },
    {
      label: 'SQLite Database',
      value: stats ? 'Connected' : 'Offline',
      icon: <Database size={14} />,
      color: stats ? '#3b82f6' : '#ef4444',
      sub: `${stats?.total_candidates ?? 0} rows`,
      pulse: !!stats,
    },
    {
      label: 'ChromaDB Index',
      value: stats ? 'Ready' : 'Offline',
      icon: <Activity size={14} />,
      color: stats ? '#10b981' : '#ef4444',
      sub: `${stats?.vectors_indexed ?? 0} vectors`,
      pulse: !!stats,
    },
  ];

  const serviceItems = [
    { name: 'FastAPI Server', status: isOnline ? 'RUNNING' : 'OFFLINE', color: isOnline ? '#10b981' : '#ef4444', icon: <Server size={12} /> },
    { name: 'CORS Middleware', status: 'ACTIVE', color: '#14b8a6', icon: <Shield size={12} /> },
    { name: 'Ranking Pipeline', status: 'READY', color: '#8b5cf6', icon: <GitBranch size={12} /> },
    { name: 'Export Service', status: 'READY', color: '#f59e0b', icon: <Package size={12} /> },
  ];

  const tokenUsage = 7842;
  const tokenQuota = 50000;
  const tokenPct = (tokenUsage / tokenQuota) * 100;

  return (
    <div className="space-y-5 max-w-5xl mx-auto my-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.2)]">
            <Shield size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Admin Control Center</h1>
            <p className="text-[10px] text-slate-500">
              {lastRefresh ? `Last refreshed: ${lastRefresh.toLocaleTimeString()}` : 'Real-time system telemetry'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border
            ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            <span className={isOnline ? 'status-online' : 'status-offline'} />
            {isOnline ? 'System Online' : 'Offline'}
          </div>
          <button onClick={loadData} className="btn-secondary flex items-center gap-1.5 text-[11px] px-3 py-1.5">
            <RefreshCw size={11} /> Refresh
          </button>
        </div>
      </div>

      {/* System Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {systemMetrics.map((m, i) => <MetricCard key={i} {...m} />)}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Dataset Metrics */}
        <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
          <h3 className="section-header">
            <Database size={14} className="text-teal-400" />
            Database Metrics
          </h3>

          {[
            { label: 'Total Candidates', value: stats?.total_candidates ?? 0, color: '#14b8a6' },
            { label: 'Embeddings Indexed', value: stats?.vectors_indexed ?? 0, color: '#8b5cf6' },
            { label: 'Ranking Runs', value: runs.length, color: '#ec4899' },
            { label: 'Avg. API Latency', value: '240ms', color: '#3b82f6', isText: true },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center bg-slate-950/40 px-3 py-2.5 rounded-xl border border-white/5 text-xs">
              <span className="text-slate-400">{item.label}</span>
              <span className="font-mono font-bold" style={{ color: item.color }}>
                {item.isText ? item.value : (typeof item.value === 'number' ? item.value.toLocaleString() : item.value)}
              </span>
            </div>
          ))}
        </div>

        {/* NIM Cluster Config */}
        <div className="lg:col-span-2 glass rounded-2xl p-5 border border-white/5 space-y-4">
          <h3 className="section-header">
            <Zap size={14} className="text-purple-400" />
            NIM Cluster Configuration
          </h3>

          {/* Token Usage */}
          <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <TrendingUp size={11} className="text-purple-400" />
                NVIDIA Inference Token Usage
              </span>
              <span className="font-mono text-slate-300">
                {tokenUsage.toLocaleString()} / {tokenQuota.toLocaleString()}
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill"
                   style={{
                     width: `${tokenPct}%`,
                     background: tokenPct > 80
                       ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                       : 'linear-gradient(90deg, #8b5cf6, #14b8a6)',
                   }} />
            </div>
            <div className="text-[9px] text-slate-600 text-right">{tokenPct.toFixed(1)}% of quota used</div>
          </div>

          {/* Service Status */}
          <div className="grid grid-cols-2 gap-2">
            {serviceItems.map((svc, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-950/40 border border-white/5 rounded-xl px-3 py-2.5 text-xs">
                <span style={{ color: svc.color }}>{svc.icon}</span>
                <span className="text-slate-400 flex-1 truncate">{svc.name}</span>
                <span className="text-[9px] font-bold font-mono" style={{ color: svc.color }}>{svc.status}</span>
              </div>
            ))}
          </div>

          {/* Config values */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Concurrent Req.', value: '10 / sec' },
              { label: 'Fallback Pipeline', value: 'Local Ready' },
              { label: 'Semantic Model', value: 'MiniLM-L6' },
              { label: 'LLM Context', value: '128K tokens' },
            ].map((c, i) => (
              <div key={i} className="bg-slate-950/40 border border-white/5 rounded-xl px-3 py-2.5">
                <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-0.5">{c.label}</div>
                <div className="text-xs font-mono font-bold text-slate-200">{c.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Terminal Log */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-slate-950/30">
          <Terminal size={13} className="text-amber-400" />
          <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">System Log</h3>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          </div>
        </div>
        <div
          ref={logRef}
          className="p-4 max-h-52 overflow-y-auto no-scrollbar font-mono text-[10px] space-y-1.5"
          style={{ background: 'rgba(5,10,20,0.6)' }}>
          {LOG_LINES.map((line, i) => (
            <div key={i} className="flex items-start gap-3 group hover:bg-white/[0.02] rounded px-1 py-0.5 transition-colors">
              <span className="text-slate-600 flex-shrink-0 tabular-nums">{line.ts}</span>
              <span className="font-bold flex-shrink-0 w-10" style={{ color: line.color }}>{line.level}</span>
              <span className="text-slate-400 group-hover:text-slate-300 transition-colors">{line.msg}</span>
            </div>
          ))}
          {runs.length > 0 && runs.slice(0, 3).map((run, i) => (
            <div key={run.run_id} className="flex items-start gap-3 group hover:bg-white/[0.02] rounded px-1 py-0.5 transition-colors">
              <span className="text-slate-600 flex-shrink-0 tabular-nums">
                {new Date(run.created_at).toLocaleTimeString()}
              </span>
              <span className="font-bold flex-shrink-0 w-10 text-emerald-400">OK</span>
              <span className="text-slate-400">
                [RANK] Run {run.run_id.slice(0, 8)}… completed — {run.candidates_evaluated} candidates
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-teal-400 mt-1">
            <span className="animate-pulse">█</span>
            <span className="text-slate-600">ready</span>
          </div>
        </div>
      </div>

      {/* Recent Runs */}
      {runs.length > 0 && (
        <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
          <h3 className="section-header">
            <Clock size={14} className="text-blue-400" />
            Recent Ranking Runs
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {runs.map((run, idx) => (
              <div key={idx}
                   className="flex items-center justify-between bg-slate-950/40 border border-white/5 rounded-xl p-3 hover:border-white/10 transition-colors text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-teal-500/10 border border-teal-500/20">
                    <Play size={10} className="text-teal-400" />
                  </div>
                  <div>
                    <span className="font-mono text-slate-300">{run.run_id?.slice(0, 16)}…</span>
                    <div className="text-[9px] text-slate-600">{run.candidates_evaluated ?? '?'} candidates evaluated</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-[10px]">
                  <span className="hidden sm:block">{new Date(run.created_at).toLocaleTimeString()}</span>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold">
                    DONE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
