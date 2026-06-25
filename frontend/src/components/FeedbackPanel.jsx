import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Minus, MessageSquare, CheckCircle, Loader } from 'lucide-react';
import { submitFeedback } from '../api/client';

const TYPES = [
  { id: 'strong_yes', label: 'Strong Yes', icon: <ThumbsUp size={13}/>,   cls: 'hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:text-emerald-400', activeCls: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' },
  { id: 'maybe',      label: 'Maybe',      icon: <Minus size={13}/>,       cls: 'hover:bg-amber-500/20  hover:border-amber-500/40  hover:text-amber-400',   activeCls: 'bg-amber-500/20  border-amber-500/40  text-amber-400'   },
  { id: 'not_a_fit',  label: 'Not a Fit',  icon: <ThumbsDown size={13}/>,  cls: 'hover:bg-red-500/20    hover:border-red-500/40    hover:text-red-400',     activeCls: 'bg-red-500/20    border-red-500/40    text-red-400'     },
];

export default function FeedbackPanel({ runId, candidateId, onFeedbackGiven }) {
  const [selected, setSelected]     = useState(null);
  const [notes, setNotes]           = useState('');
  const [showNotes, setShowNotes]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async () => {
    if (!selected || !runId || !candidateId || loading) return;
    setLoading(true);
    setError('');
    try {
      await submitFeedback({ run_id: runId, candidate_id: candidateId, feedback_type: selected, notes });
      setSubmitted(true);
      onFeedbackGiven?.({ candidateId, type: selected });
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
        <CheckCircle size={13}/>
        Feedback recorded — affects future re-ranking
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {TYPES.map(t => (
          <button key={t.id}
                  onClick={() => setSelected(t.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150
                    ${selected === t.id ? t.activeCls : `border-slate-700/40 text-slate-500 ${t.cls}`}`}>
            {t.icon} {t.label}
          </button>
        ))}
        <button onClick={() => setShowNotes(s => !s)}
                className="ml-auto p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
          <MessageSquare size={13}/>
        </button>
      </div>

      {showNotes && (
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Optional notes (e.g., 'Great communicator but overqualified')"
          className="input-dark text-xs resize-none"
          rows={2}
        />
      )}

      {error && <div className="text-xs text-red-400">{error}</div>}

      {selected && (
        <button onClick={handleSubmit}
                disabled={loading}
                className="w-full py-1.5 rounded-lg text-xs font-medium bg-teal-500/15 border border-teal-500/25 text-teal-400
                           hover:bg-teal-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
          {loading
            ? <><Loader size={11} className="animate-spin"/> Submitting…</>
            : <>Submit Feedback</>}
        </button>
      )}
    </div>
  );
}
