import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Lock, Mail, LogIn, Zap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLE_HINTS = {
  recruiter: {
    email: 'recruiter@prism.ai',
    label: 'Recruiter',
    color: '#14b8a6',
    gradient: 'from-teal-500/20 to-teal-600/5',
    border: 'border-teal-500/30',
    emoji: '🎯',
    desc: 'Rank candidates, analyze JDs, generate outreach',
  },
  candidate: {
    email: 'candidate@prism.ai',
    label: 'Candidate',
    color: '#8b5cf6',
    gradient: 'from-violet-500/20 to-violet-600/5',
    border: 'border-violet-500/30',
    emoji: '👤',
    desc: 'Build profile, analyze resume, track readiness',
  }
};

export default function LoginPage({ onBack, onSuccess, defaultRole }) {
  const { login } = useAuth();
  const [email, setEmail]       = useState(defaultRole ? ROLE_HINTS[defaultRole].email : '');
  const [password, setPassword] = useState('demo123');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [activeRole, setActiveRole] = useState(defaultRole || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500)); // simulate network
      const user = login(email, password);
      onSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    setActiveRole(role);
    setEmail(ROLE_HINTS[role].email);
    setPassword('demo123');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[80px]"
             style={{ background: 'radial-gradient(circle, #14b8a6, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[80px]"
             style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-[0.03] blur-[120px]"
             style={{ background: 'radial-gradient(ellipse, #7c3aed, transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full max-w-md">

        {/* Back */}
        <button onClick={onBack}
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </button>

        {/* Logo + Heading */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center">
              <img src="/logo.jpg" alt="Prism Logo" className="w-full h-full object-cover rounded-2xl" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-black text-slate-100">Welcome Back</h1>
          <p className="text-sm text-slate-500 mt-1.5">Sign in to your Prism workspace</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl border border-white/8 overflow-hidden">
          {/* Demo Role Selector */}
          <div className="p-6 pb-0">
            <div className="text-[10px] text-slate-500 mb-3 font-bold uppercase tracking-widest text-center">
              Quick Demo Access — Pick a Role
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ROLE_HINTS).map(([role, h]) => (
                <button
                  key={role}
                  onClick={() => fillDemo(role)}
                  className={`rounded-xl p-3 text-center transition-all duration-200 border group relative overflow-hidden
                    ${activeRole === role ? h.border : 'border-slate-700/40 hover:border-slate-600/60'}`}
                  style={{
                    background: activeRole === role ? `${h.color}18` : 'rgba(255,255,255,0.02)',
                  }}>
                  {activeRole === role && (
                    <CheckCircle2 size={12} className="absolute top-1.5 right-1.5" style={{ color: h.color }} />
                  )}
                  <div className="text-lg mb-1">{h.emoji}</div>
                  <div className="text-[11px] font-bold" style={{ color: activeRole === role ? h.color : '#94a3b8' }}>
                    {h.label}
                  </div>
                </button>
              ))}
            </div>

            {activeRole && (
              <motion.div
                key={activeRole}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2.5 px-3 py-2 rounded-xl text-[10px] text-slate-400 text-center"
                style={{ background: `${ROLE_HINTS[activeRole].color}0a` }}>
                {ROLE_HINTS[activeRole].desc}
              </motion.div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 px-6 py-4">
            <div className="flex-1 h-px bg-slate-700/50" />
            <span className="text-[10px] text-slate-600 uppercase tracking-widest">or enter manually</span>
            <div className="flex-1 h-px bg-slate-700/50" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setActiveRole(null); }}
                  placeholder="you@company.com"
                  className="input-dark pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-dark pl-9 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="text-[10px] text-slate-600 mt-1.5 text-right">
                Demo password: <code className="text-teal-500 font-mono">demo123</code>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs glass rounded-xl px-4 py-3 border border-red-500/20 flex items-center gap-2">
                <span className="text-red-500">⚠️</span> {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm mt-1">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
              ) : (
                <><LogIn size={15} /> Sign In to Prism</>
              )}
            </button>

            <div className="text-center">
              <span className="text-[10px] text-slate-600">
                <Zap size={9} className="inline mr-1 opacity-60" />
                Auth is mock — all data stored locally in your browser
              </span>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
