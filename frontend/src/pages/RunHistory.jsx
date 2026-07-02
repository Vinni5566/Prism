import React, { useEffect, useState } from 'react';
import { Clock, ChevronDown, ChevronUp, Download, RefreshCw, Play, History, Trash2 } from 'lucide-react';
import { getRuns, getRunResults, clearRuns } from '../api/client';
import { downloadExport } from '../api/client';
import CandidateCard from '../components/CandidateCard';

function RunRow({ run, index }) {
  const [expanded, setExpanded] = useState(false);
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  const handleExpand = async () => {
    if (!expanded && results.length === 0) {
      setLoadingResults(true);
      try {
        const data = await getRunResults(run.run_id);
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoadingResults(false);
      }
    }
    setExpanded(e => !e);
  };

  const jd = run.jd_parsed || {};
  const jdPreview = run.jd_preview || run.jd_text?.slice(0, 200) || '';
  const weights = run.weights || {};

  const WEIGHT_COLORS = {
    semantic: '#14b8a6', skill: '#8b5cf6',
    trajectory: '#f59e0b', behavioral: '#ec4899', domain: '#3b82f6',
  };

  return (
    <div className={`glass-hover rounded-2xl overflow-hidden transition-all duration-300
                     ${index === 0 ? 'border border-teal-500/15' : ''}`}>
      {/* Header strip for latest run */}
      {index === 0 && (
        <div className="h-0.5 w-full"
             style={{ background: 'linear-gradient(90deg,#14b8a6,#8b5cf6)' }} />
      )}

      {/* Row header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Run number */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
               style={{ background: 'linear-gradient(135deg,#0d9488,#7c3aed)' }}>
            #{index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                {/* Run ID */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-slate-300">{run.run_id.slice(0, 8)}…</span>
                  {index === 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/15 text-teal-400 border border-teal-500/25">
                      Latest
                    </span>
                  )}
                </div>
                {/* Parsed JD metadata */}
                <div className="flex flex-wrap gap-2 mt-1">
                  {jd.job_title && (
                    <span className="text-xs text-slate-400">
                      <span className="text-slate-600">Role:</span> {jd.job_title}
                    </span>
                  )}
                  {jd.domain && (
                    <span className="text-xs text-slate-400">
                      <span className="text-slate-600">Domain:</span> {jd.domain}
                    </span>
                  )}
                  {jd.seniority_level && (
                    <span className="text-xs text-slate-400">
                      <span className="text-slate-600">Level:</span> {jd.seniority_level}
                    </span>
                  )}
                </div>
                {/* Timestamp */}
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock size={10} className="text-slate-600" />
                  <span className="text-[10px] text-slate-600">
                    {new Date(run.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => downloadExport(run.run_id)}
                  title="Download CSV"
                  className="btn-secondary p-2 flex items-center gap-1 text-xs">
                  <Download size={12} />
                </button>
                <button
                  onClick={handleExpand}
                  className="btn-secondary p-2 flex items-center gap-1 text-xs">
                  {loadingResults
                    ? <RefreshCw size={12} className="animate-spin" />
                    : expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            </div>

            {/* Weight chips */}
            {Object.keys(weights).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Object.entries(weights).map(([key, val]) => (
                  <span key={key}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium"
                        style={{
                          background: `${WEIGHT_COLORS[key] || '#64748b'}15`,
                          border: `1px solid ${WEIGHT_COLORS[key] || '#64748b'}25`,
                          color: WEIGHT_COLORS[key] || '#94a3b8',
                        }}>
                    {key}: {typeof val === 'number' ? (val * 100).toFixed(0) : val}%
                  </span>
                ))}
              </div>
            )}

            {/* JD preview */}
            <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
              {jdPreview}
            </p>
          </div>
        </div>
      </div>

      {/* Expanded results */}
      {expanded && (
        <div className="border-t border-slate-700/30 p-5 space-y-3">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Play size={10} className="text-teal-400" />
            Ranked Results ({results.length})
          </div>
          {loadingResults ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass rounded-xl p-4 shimmer h-16" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto no-scrollbar">
              {results.map((r, i) => (
                <CandidateCard
                  key={r.candidate_id || i}
                  candidate={{
                    ...r,
                    rank: r.rank_position || i + 1,
                    score_breakdown: {
                      semantic:    r.semantic_score,
                      skill:       r.skill_score,
                      trajectory:  r.trajectory_score,
                      behavioral:  r.behavioral_score,
                      domain:      r.domain_score,
                    },
                  }}
                  rank={r.rank_position || i + 1}
                  runId={run.run_id}
                  onFeedbackGiven={() => {}}
                  isComparing={false}
                  onToggleCompare={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-600 text-sm">
              No results found for this run.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RunHistory() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState('');

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear all run history? This cannot be undone.")) return;
    setClearing(true);
    try {
      await clearRuns();
      setRuns([]);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'Failed to clear runs');
    } finally {
      setClearing(false);
    }
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getRuns(50);
      setRuns(data.runs || []);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'Failed to load runs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <History size={22} />
            Run History
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            All past ranking runs — expand to see results and download CSVs
          </p>
        </div>
        <div className="flex items-center gap-2">
          {runs.length > 0 && (
            <button onClick={handleClear} disabled={loading || clearing}
                    className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors disabled:opacity-50">
              <Trash2 size={12} className={clearing ? 'animate-pulse' : ''} />
              Clear History
            </button>
          )}
          <button onClick={load} disabled={loading || clearing}
                  className="btn-secondary flex items-center gap-2 text-xs px-3 py-2 disabled:opacity-50">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 shimmer h-24" />
          ))}
        </div>
      ) : error ? (
        <div className="glass rounded-2xl p-12 text-center">
          <History size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-red-400 text-sm mb-2">{error}</p>
          <button onClick={load} className="btn-secondary mt-3 text-xs px-4 py-2">Retry</button>
        </div>
      ) : runs.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <History size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500 text-sm">No ranking runs yet.</p>
          <p className="text-slate-600 text-xs mt-1">
            Go to Dashboard, paste a job description, and click Analyze.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {runs.map((run, i) => (
            <RunRow key={run.run_id} run={run} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
