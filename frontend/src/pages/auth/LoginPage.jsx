import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Lock, Mail, LogIn, Zap, CheckCircle2, Target, Rocket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLE_HINTS = {
  recruiter: {
    email: 'recruiter@prism.ai',
    label: 'Recruiter',
    color: '#14b8a6',
    gradient: 'from-teal-500/20 to-teal-600/5',
    border: 'border-teal-500/30',
    icon: <Target size={24} />,
    desc: 'Rank candidates, analyze JDs, generate outreach',
  },
  candidate: {
    email: 'candidate@prism.ai',
    label: 'Candidate',
    color: '#8b5cf6',
    gradient: 'from-violet-500/20 to-violet-600/5',
    border: 'border-violet-500/30',
    icon: <Rocket size={24} />,
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
    <div className="h-screen w-full flex overflow-hidden bg-slate-950">
      
      {/* Mobile-only Top Left Logo (Clickable -> back) */}
      <div 
        onClick={onBack} 
        className="absolute top-6 left-6 z-50 cursor-pointer flex lg:hidden items-center gap-3 group"
      >
        <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg border border-white/10">
          <img src="/logo.jpg" alt="Prism Logo" className="w-full h-full object-cover" />
        </div>
        <ArrowLeft size={14} className="text-slate-400 group-hover:text-white transition-colors" />
      </div>

      {/* Left Panel - Branding & Design (Distinct Section) */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 border-r border-white/5 items-center justify-center overflow-hidden">
        {/* Left Panel Ambient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-slate-900 to-purple-500/10" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent_100%)]" />
        
        {/* Massive Orbital Rings to add depth */}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} className="absolute w-[600px] h-[600px] rounded-full border border-teal-500/10 border-dashed opacity-50" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }} className="absolute w-[800px] h-[800px] rounded-full border border-violet-500/10 border-dotted opacity-30" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }} className="absolute w-[1000px] h-[1000px] rounded-full border border-white/5 border-dashed opacity-20" />

        {/* Floating UI Elements to fill space */}
        <motion.div 
          animate={{ y: [-15, 15, -15] }} 
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[10%] glass px-4 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 z-10"
        >
          <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
            <Target size={16} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Match Score</div>
            <div className="text-lg font-black text-white">98.5%</div>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [10, -10, 10], x: [5, -5, 5] }} 
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[15%] glass px-3 py-2 rounded-xl border border-white/10 shadow-xl flex items-center gap-3 z-10"
        >
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600" />
            <div className="w-6 h-6 rounded-full bg-slate-600 border border-slate-500" />
            <div className="w-6 h-6 rounded-full bg-teal-500 border border-teal-400 flex items-center justify-center text-[9px] font-bold text-white">+5</div>
          </div>
          <span className="text-[10px] text-slate-300 font-medium">New Matches</span>
        </motion.div>

        <motion.div 
          animate={{ y: [15, -15, 15] }} 
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[12%] glass px-4 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 z-10"
        >
          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
            <Rocket size={16} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Candidates</div>
            <div className="text-lg font-black text-white">50/50 Processed</div>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [-12, 12, -12], rotate: [-2, 2, -2] }} 
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[12%] left-[18%] glass px-3 py-2 rounded-xl border border-white/10 shadow-xl flex items-center gap-2 z-10"
        >
           <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
           </div>
           <div>
             <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Engine Status</div>
             <div className="text-xs font-semibold text-slate-200">Semantic Matching Online</div>
           </div>
        </motion.div>

        {/* Ambient Abstract Blobs */}
        <motion.div animate={{ y: [-20, 20, -20] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[35%] left-[10%] w-24 h-24 rounded-full bg-gradient-to-tr from-teal-500/5 to-emerald-400/5 backdrop-blur-3xl border border-white/5 shadow-2xl" />
        <motion.div animate={{ y: [20, -20, 20] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[40%] right-[8%] w-16 h-16 rounded-2xl rotate-12 bg-gradient-to-tr from-violet-500/5 to-fuchsia-400/5 backdrop-blur-3xl border border-white/5 shadow-xl" />

        {/* The Central Logo acting as Back Button */}
        <div 
          onClick={onBack}
          className="relative cursor-pointer group flex flex-col items-center z-20"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-48 h-48 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(20,184,166,0.2)] border border-white/10 relative z-10 group-hover:shadow-[0_0_120px_rgba(20,184,166,0.3)] transition-shadow duration-500"
          >
            <img src="/logo.jpg" alt="Prism Logo" className="w-full h-full object-cover" />
          </motion.div>
          
          <div className="mt-8 text-center relative z-10">
            <h1 className="text-4xl font-black gradient-text tracking-tight group-hover:opacity-80 transition-opacity">Prism</h1>
            <div className="text-sm text-slate-400 mt-2 font-mono tracking-widest uppercase">AI Recruiter</div>
          </div>

          {/* Glow behind logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-teal-500/20 blur-[80px] rounded-full pointer-events-none -z-10 group-hover:bg-teal-500/30 transition-colors" />
        </div>
      </div>

      {/* Right Panel - Form (Distinct Section) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative bg-slate-950 px-6 z-10 overflow-hidden">
        
        {/* Right Panel Decorative Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Subtle Corner Glows */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full" />
          
          {/* Subtle Radial Dot Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
          
          {/* Floating Abstract Ring on Right Side */}
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }} className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full border border-white/[0.03] border-dashed" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 180, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full border border-white/[0.02] border-dotted" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-[400px] relative z-10"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-100">Welcome Back</h1>
            <p className="text-sm text-slate-500 mt-1.5">Sign in to your Prism workspace</p>
          </div>

          <div className="glass rounded-3xl border border-white/8 overflow-hidden shadow-2xl bg-slate-900/60 backdrop-blur-xl">
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
                    <div className="flex justify-center mb-1">{h.icon}</div>
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
                <div className="text-[10px] text-slate-600 mt-1.5 text-right flex justify-between">
                  <span className="cursor-pointer hover:text-slate-400 transition-colors">Forgot Password?</span>
                  <span>Demo: <code className="text-teal-500 font-mono">demo123</code></span>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs glass rounded-xl px-4 py-3 border border-red-500/20 flex items-center gap-2">
                  <span className="text-red-500 font-bold">!</span> {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm mt-1">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                ) : (
                  <><LogIn size={15} /> Sign In</>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
