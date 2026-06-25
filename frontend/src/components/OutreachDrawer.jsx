import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Mail, ExternalLink, Edit2, Check } from 'lucide-react';
import { copyToClipboard } from '../utils/helpers';

export default function OutreachDrawer({ candidate, onClose }) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(candidate?.outreach_msg || candidate?.outreach_message || '');

  if (!candidate) return null;

  const handleCopy = async () => {
    await copyToClipboard(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-lg h-full glass border-l border-white/10 p-6 flex flex-col justify-between overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Mail className="text-purple-400" size={18} />
              <h2 className="text-lg font-bold text-slate-100">Personalized Outreach</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Candidate Card Snippet */}
          <div className="glass bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">{candidate.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{candidate.current_title || 'Software Engineer'}</p>
              {candidate.email && (
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">{candidate.email}</span>
              )}
            </div>
            <div className="text-right">
              <span className="text-lg font-mono font-black text-purple-400">
                {Math.round(candidate.composite_score || 85)}
              </span>
              <span className="text-[10px] text-slate-500 block">score</span>
            </div>
          </div>

          {/* Message Area */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Outreach Template (LLaMA-3.1-70B)</span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1 text-[11px] hover:text-teal-400 transition-colors"
              >
                <Edit2 size={10} />
                {isEditing ? 'View Mode' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full h-80 bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-500/50"
              />
            ) : (
              <div className="w-full h-80 bg-slate-950/40 border border-white/5 rounded-2xl p-4 text-xs font-mono text-slate-300 leading-relaxed overflow-y-auto whitespace-pre-wrap select-all">
                {message || 'Outreach template not available.'}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-white/5 pt-4 space-y-2.5">
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 text-sm"
              disabled={!message}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied to Clipboard' : 'Copy Message'}
            </button>
            {candidate.email && (
              <a
                href={`mailto:${candidate.email}?subject=Exciting opportunity at Prism&body=${encodeURIComponent(message)}`}
                className="btn-secondary flex items-center justify-center p-3 rounded-xl hover:border-purple-500/30"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
          <p className="text-[10px] text-slate-500 text-center">
            Tip: You can paste this directly into LinkedIn or send via Email.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
