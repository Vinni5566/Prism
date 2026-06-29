import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
  { id: 'recruiter', label: 'Recruiter', desc: 'I hire candidates', color: '#14b8a6', emoji: '🎯' },
  { id: 'candidate', label: 'Candidate', desc: 'I\'m looking for a job', color: '#8b5cf6', emoji: '🚀' },
];

export default function RegisterPage({ onBack, onSuccess }) {
  const { register } = useAuth();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [role, setRole]         = useState('recruiter');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      const user = register(name, email, password, role);
      onSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-8 blur-3xl"
             style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl"
             style={{ background: 'radial-gradient(circle, #14b8a6, transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md">

        <div className="text-center mb-8">
          <button onClick={onBack}
                  className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors">
            <ArrowLeft size={14} /> Back to Home
          </button>
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center">
              <img src="/logo.jpg" alt="Prism Logo" className="w-full h-full object-cover rounded-2xl" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1">Join Prism AI Recruitment Intelligence</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/8">
          {/* Role selector */}
          <div className="mb-6">
            <div className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">I am a…</div>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(r => (
                <button key={r.id} type="button"
                        onClick={() => setRole(r.id)}
                        className={`rounded-xl p-3 text-center text-xs font-medium transition-all border ${
                          role === r.id ? 'scale-105' : 'opacity-60 hover:opacity-80'
                        }`}
                        style={{
                          background: role === r.id ? `${r.color}20` : 'rgba(255,255,255,0.03)',
                          borderColor: role === r.id ? `${r.color}50` : 'rgba(255,255,255,0.07)',
                          color: role === r.id ? r.color : '#94a3b8',
                        }}>
                  <div className="text-lg mb-1">{r.emoji}</div>
                  <div>{r.label}</div>
                  <div className="text-[9px] opacity-70 mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={name} onChange={e => setName(e.target.value)}
                       placeholder="Your full name" className="input-dark pl-9" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                       placeholder="you@company.com" className="input-dark pl-9" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showPw ? 'text' : 'password'} value={password}
                       onChange={e => setPassword(e.target.value)}
                       placeholder="Min. 6 characters" className="input-dark pl-9 pr-10" required />
                <button type="button" onClick={() => setShowPw(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          className="text-red-400 text-xs glass rounded-xl px-4 py-3 border border-red-500/20">
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm mt-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account…</>
              ) : (
                <><UserPlus size={16} /> Create Account</>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <button onClick={onBack} className="text-teal-400 hover:text-teal-300 transition-colors">
              Sign in instead
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
