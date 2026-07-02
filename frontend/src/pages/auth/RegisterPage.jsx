import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, UserPlus, Target, Rocket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
  { id: 'recruiter', label: 'Recruiter', desc: 'I hire candidates', color: '#14b8a6', icon: <Target size={24} /> },
  { id: 'candidate', label: 'Candidate', desc: 'I\'m looking for a job', color: '#8b5cf6', icon: <Rocket size={24} /> },
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
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-slate-900 to-fuchsia-500/10" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent_100%)]" />
        
        {/* Massive Orbital Rings to add depth */}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} className="absolute w-[600px] h-[600px] rounded-full border border-violet-500/10 border-dashed opacity-50" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }} className="absolute w-[800px] h-[800px] rounded-full border border-teal-500/10 border-dotted opacity-30" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }} className="absolute w-[1000px] h-[1000px] rounded-full border border-white/5 border-dashed opacity-20" />

        {/* Floating UI Elements to fill space */}
        <motion.div 
          animate={{ y: [-15, 15, -15] }} 
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[10%] glass px-4 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 z-10"
        >
          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
            <Target size={16} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Candidate Score</div>
            <div className="text-lg font-black text-white">Top 1%</div>
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
            <div className="w-6 h-6 rounded-full bg-violet-500 border border-violet-400 flex items-center justify-center text-[9px] font-bold text-white">HR</div>
          </div>
          <span className="text-[10px] text-slate-300 font-medium">Recruiters Online</span>
        </motion.div>

        <motion.div 
          animate={{ y: [15, -15, 15] }} 
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[12%] glass px-4 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 z-10"
        >
          <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
            <Rocket size={16} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Interviews</div>
            <div className="text-lg font-black text-white">12 Scheduled</div>
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
             <div className="text-xs font-semibold text-slate-200">Profile Optimized</div>
           </div>
        </motion.div>

        {/* Ambient Abstract Blobs */}
        <motion.div animate={{ y: [-20, 20, -20] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[35%] left-[10%] w-24 h-24 rounded-full bg-gradient-to-tr from-violet-500/5 to-fuchsia-400/5 backdrop-blur-3xl border border-white/5 shadow-2xl" />
        <motion.div animate={{ y: [20, -20, 20] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[40%] right-[8%] w-16 h-16 rounded-2xl rotate-12 bg-gradient-to-tr from-teal-500/5 to-emerald-400/5 backdrop-blur-3xl border border-white/5 shadow-xl" />

        {/* The Central Logo acting as Back Button */}
        <div 
          onClick={onBack}
          className="relative cursor-pointer group flex flex-col items-center z-20"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-48 h-48 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(139,92,246,0.2)] border border-white/10 relative z-10 group-hover:shadow-[0_0_120px_rgba(139,92,246,0.3)] transition-shadow duration-500"
          >
            <img src="/logo.jpg" alt="Prism Logo" className="w-full h-full object-cover" />
          </motion.div>
          
          <div className="mt-8 text-center relative z-10">
            <h1 className="text-4xl font-black gradient-text tracking-tight group-hover:opacity-80 transition-opacity">Prism</h1>
            <div className="text-sm text-slate-400 mt-2 font-mono tracking-widest uppercase">AI Recruiter</div>
          </div>

          {/* Glow behind logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-violet-500/20 blur-[80px] rounded-full pointer-events-none -z-10 group-hover:bg-violet-500/30 transition-colors" />
        </div>
      </div>

      {/* Right Panel - Form (Distinct Section) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative bg-slate-950 px-6 z-10 overflow-hidden">
        
        {/* Right Panel Decorative Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Subtle Corner Glows */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/5 blur-[120px] rounded-full" />
          
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
            <h1 className="text-3xl font-black text-slate-100">Create your account</h1>
            <p className="text-sm text-slate-500 mt-1.5">Join Prism AI Recruitment Intelligence</p>
          </div>

          <div className="glass rounded-3xl p-8 border border-white/8 shadow-2xl bg-slate-900/60 backdrop-blur-xl">
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
                    <div className="flex justify-center mb-1">{r.icon}</div>
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
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input value={name} onChange={e => setName(e.target.value)}
                         placeholder="Your full name" className="input-dark pl-9" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                         placeholder="you@company.com" className="input-dark pl-9" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
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
                            className="text-red-400 text-xs glass rounded-xl px-4 py-3 border border-red-500/20 flex items-center gap-2">
                  <span className="text-red-500 font-bold">!</span> {error}
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

            <div className="mt-6 text-center text-xs text-slate-600">
              Already have an account?{' '}
              <button onClick={onBack} className="text-teal-400 hover:text-teal-300 transition-colors">
                Sign in instead
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
