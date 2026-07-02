import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2, Users, Shield, Zap, Brain, TrendingUp, Star,
  ChevronRight, Github, Linkedin, Globe, ArrowRight,
  Layers, Target, Cpu, Database, Lock, CheckCircle,
} from 'lucide-react';

const PORTALS = [
  {
    id: 'recruiter',
    icon: <BarChart2 size={28} />,
    title: 'Recruiter Portal',
    description: 'AI-powered candidate ranking, semantic matching, and behavioral signal analysis.',
    color: '#14b8a6',
    gradient: 'from-teal-500/20 to-teal-600/5',
    border: 'border-teal-500/30',
    features: ['JD Analysis', 'AI Ranking', 'Smart Outreach', 'Export Reports'],
    badge: 'Most Popular',
  },
  {
    id: 'candidate',
    icon: <Users size={28} />,
    title: 'Candidate Portal',
    description: 'Build your profile, analyze your resume, and understand how recruiters see you.',
    color: '#8b5cf6',
    gradient: 'from-violet-500/20 to-violet-600/5',
    border: 'border-violet-500/30',
    features: ['Profile Builder', 'Resume Analyzer', 'Skill Gap Report', 'Interview Readiness'],
    badge: null,
  },
];

const FEATURES = [
  { icon: <Brain size={20} />, title: 'Semantic Vector Search', desc: 'ChromaDB-powered vector search finds candidates who mean the right things, even with different words. Goes beyond keyword matching entirely.', color: '#14b8a6' },
  { icon: <Layers size={20} />, title: '5D Scoring Engine', desc: 'Every candidate is scored across 5 weighted dimensions: Semantic, Skill Depth, Career Trajectory, Behavioral Intent, and Domain Relevance.', color: '#8b5cf6' },
  { icon: <Target size={20} />, title: '"Why Not?" Rejection Explainer', desc: 'Every rank has an AI-written explanation. Recruiters know exactly why someone ranked where they did — no black boxes.', color: '#ec4899' },
  { icon: <TrendingUp size={20} />, title: 'Career Trajectory Scoring', desc: 'Detects upward momentum, title progression, internal promotions, and tenure health to surface candidates on the rise.', color: '#f59e0b' },
  { icon: <Zap size={20} />, title: 'Freshness Decay Telemetry', desc: 'Automatically penalizes stale profiles and boosts active, high-intent candidates using metadata signals that cannot be faked.', color: '#3b82f6' },
  { icon: <Shield size={20} />, title: 'JD Bias Scanner', desc: 'Auto-detects exclusionary language in job descriptions and suggests inclusive alternatives before you post.', color: '#10b981' },
  { icon: <Cpu size={20} />, title: 'AI Interview Prep', desc: 'Generates targeted, role-specific interview questions based on each candidate\'s exact skill gaps and experience level.', color: '#f97316' },
  { icon: <Database size={20} />, title: 'Auto Outreach Drafts', desc: 'Personalized recruiter outreach messages generated for the top 5 candidates — specific, warm, and ready to send.', color: '#a78bfa' },
];

const INTEGRATIONS = [
  { name: 'LinkedIn', icon: <Linkedin size={16} />, color: '#0077B5' },
  { name: 'GitHub', icon: <Github size={16} />, color: '#6e40c9' },
  { name: 'Naukri', icon: <Globe size={16} />, color: '#f97316' },
  { name: 'Greenhouse', icon: <Layers size={16} />, color: '#14b8a6' },
  { name: 'Lever', icon: <Target size={16} />, color: '#ec4899' },
  { name: 'Workday', icon: <Shield size={16} />, color: '#3b82f6' },
  { name: 'Indeed', icon: <Users size={16} />, color: '#2164f3' },
  { name: 'Glassdoor', icon: <Star size={16} />, color: '#0caa41' },
];

const STATS = [
  { value: '2,847', label: 'Candidates Indexed' },
  { value: '5D', label: 'Scoring Dimensions' },
  { value: '< 2s', label: 'Avg. Ranking Time' },
  { value: '94%', label: 'Recruiter Satisfaction' },
];

const PrismAnimation = () => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[820px] h-[820px] pointer-events-none z-0 flex items-center justify-center opacity-[0.18] mix-blend-screen">
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="w-full h-full relative"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 60px rgba(139,92,246,0.35)) drop-shadow(0 0 120px rgba(20,184,166,0.2))' }}>
          <defs>
            {/* Iridescent face gradients */}
            <linearGradient id="faceTL" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.9"/>
              <stop offset="40%" stopColor="#06b6d4" stopOpacity="0.7"/>
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.5"/>
            </linearGradient>
            <linearGradient id="faceTR" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.9"/>
              <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.7"/>
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.5"/>
            </linearGradient>
            <linearGradient id="faceBL" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5"/>
            </linearGradient>
            <linearGradient id="faceBR" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#eab308" stopOpacity="0.5"/>
            </linearGradient>
            {/* Specular shimmer sweep */}
            <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0"/>
              <stop offset="45%" stopColor="white" stopOpacity="0"/>
              <stop offset="50%" stopColor="white" stopOpacity="0.55"/>
              <stop offset="55%" stopColor="white" stopOpacity="0"/>
              <stop offset="100%" stopColor="white" stopOpacity="0"/>
            </linearGradient>
            {/* Core glow */}
            <radialGradient id="coreGlow" cx="50%" cy="57%" r="18%">
              <stop offset="0%" stopColor="white" stopOpacity="0.9"/>
              <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
            </radialGradient>
            {/* Edge highlight */}
            <filter id="edgeGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* ── Back depth faces ── */}
          <polygon points="100,20 170,130 100,180" fill="#3b82f6" opacity="0.2"/>
          <polygon points="100,20 30,130 100,180"  fill="#ec4899" opacity="0.2"/>

          {/* ── Front Left face ── */}
          <polygon points="100,20 65,75 100,115"  fill="url(#faceTL)" opacity="0.85"/>
          <polygon points="65,75 30,130 65,150"   fill="url(#faceBL)" opacity="0.8"/>
          <polygon points="65,75 100,115 65,150"  fill="#2563eb"      opacity="0.65"/>
          <polygon points="30,130 100,180 65,150" fill="url(#faceBL)" opacity="0.7"/>
          <polygon points="100,115 100,180 65,150" fill="#14b8a6"     opacity="0.6"/>

          {/* ── Front Right face ── */}
          <polygon points="100,20 135,75 100,115"   fill="url(#faceTR)" opacity="0.85"/>
          <polygon points="135,75 170,130 135,150"  fill="url(#faceBR)" opacity="0.8"/>
          <polygon points="135,75 100,115 135,150"  fill="#ef4444"       opacity="0.65"/>
          <polygon points="170,130 100,180 135,150" fill="url(#faceBR)"  opacity="0.7"/>
          <polygon points="100,115 100,180 135,150" fill="#eab308"       opacity="0.6"/>

          {/* ── Specular shimmer overlay ── */}
          <polygon points="100,20 170,130 100,180 30,130" fill="url(#shimmer)" opacity="0.8"/>

          {/* ── Edge highlight lines ── */}
          <line x1="100" y1="20"  x2="65"  y2="75"  stroke="white" strokeWidth="0.7" strokeOpacity="0.6" filter="url(#edgeGlow)"/>
          <line x1="100" y1="20"  x2="135" y2="75"  stroke="white" strokeWidth="0.7" strokeOpacity="0.6" filter="url(#edgeGlow)"/>
          <line x1="65"  y1="75"  x2="100" y2="115" stroke="white" strokeWidth="0.4" strokeOpacity="0.4"/>
          <line x1="135" y1="75"  x2="100" y2="115" stroke="white" strokeWidth="0.4" strokeOpacity="0.4"/>
          <line x1="30"  y1="130" x2="100" y2="180" stroke="#14b8a6" strokeWidth="0.6" strokeOpacity="0.5" filter="url(#edgeGlow)"/>
          <line x1="170" y1="130" x2="100" y2="180" stroke="#f59e0b" strokeWidth="0.6" strokeOpacity="0.5" filter="url(#edgeGlow)"/>
          <line x1="30"  y1="130" x2="65"  y2="150" stroke="white" strokeWidth="0.3" strokeOpacity="0.3"/>
          <line x1="170" y1="130" x2="135" y2="150" stroke="white" strokeWidth="0.3" strokeOpacity="0.3"/>

          {/* ── Refracted light rays from core ── */}
          <line x1="100" y1="115" x2="30"  y2="80"  stroke="#8b5cf6" strokeWidth="0.8" strokeOpacity="0.5"/>
          <line x1="100" y1="115" x2="170" y2="80"  stroke="#ec4899" strokeWidth="0.8" strokeOpacity="0.5"/>
          <line x1="100" y1="115" x2="100" y2="10"  stroke="#06b6d4" strokeWidth="0.6" strokeOpacity="0.4"/>
          <line x1="100" y1="115" x2="10"  y2="170" stroke="#14b8a6" strokeWidth="0.5" strokeOpacity="0.35"/>
          <line x1="100" y1="115" x2="190" y2="170" stroke="#f59e0b" strokeWidth="0.5" strokeOpacity="0.35"/>

          {/* ── Core glow ── */}
          <circle cx="100" cy="115" r="22" fill="url(#coreGlow)"/>

          {/* ── Apex sparkle ── */}
          <circle cx="100" cy="20" r="2.5" fill="white" opacity="0.9" filter="url(#edgeGlow)"/>
          <line x1="100" y1="14" x2="100" y2="8"  stroke="white" strokeWidth="0.8" strokeOpacity="0.7"/>
          <line x1="94"  y1="17" x2="88"  y2="13" stroke="white" strokeWidth="0.6" strokeOpacity="0.5"/>
          <line x1="106" y1="17" x2="112" y2="13" stroke="white" strokeWidth="0.6" strokeOpacity="0.5"/>
        </svg>
      </motion.div>

      {/* Outer halo rings */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.12, 0.25, 0.12] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full"
        style={{ background: 'conic-gradient(from 0deg, rgba(139,92,246,0.3), rgba(20,184,166,0.3), rgba(236,72,153,0.3), rgba(245,158,11,0.3), rgba(139,92,246,0.3))', filter: 'blur(30px)' }}
      />
      <motion.div
        animate={{ scale: [1.1, 0.95, 1.1], opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
        style={{ background: 'conic-gradient(from 180deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2), rgba(20,184,166,0.2), rgba(59,130,246,0.2))', filter: 'blur(50px)' }}
      />
    </div>
  );
};


export default function LandingPage({ onNavigate, isAuthenticated, user }) {
  const [hoveredPortal, setHoveredPortal] = useState(null);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="Prism Logo" className="w-5 h-5 object-contain" />
            <div>
              <div className="text-lg font-bold gradient-text leading-none">Prism</div>
              <div className="text-[10px] text-slate-500 font-mono leading-none">AI RECRUITMENT INTELLIGENCE</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('about')}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:block"
            >
              About
            </button>
            {isAuthenticated ? (
              <button onClick={() => onNavigate(user?.role === 'candidate' ? 'candidate' : 'dashboard')}
                      className="btn-primary text-sm px-5 py-2">
                Go to Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => onNavigate('login')}
                        className="btn-secondary text-sm px-4 py-2">
                  Sign In
                </button>
                <button onClick={() => onNavigate('register')}
                        className="btn-primary text-sm px-5 py-2">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-6 min-h-[90vh] flex flex-col justify-center overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
               style={{ background: 'radial-gradient(circle, #14b8a6, transparent)' }} />
          <div className="absolute top-40 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
               style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-60 opacity-20 blur-3xl"
               style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }} />
        </div>

        {/* Massive 3D Animated Prism Background */}
        <PrismAnimation />

        <div className="relative max-w-5xl mx-auto text-center z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-teal-500/30 text-xs text-teal-400 font-medium mb-8">
              <Zap size={12} className="text-teal-400" />
              Powered by NVIDIA NIM · LLaMA-3.1-70B
              <span className="px-1.5 py-0.5 rounded-full bg-teal-500/20 text-[10px]">NEW</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
              <span className="gradient-text">AI Recruitment</span>
              <br />
              <span className="text-slate-100">Intelligence Platform</span>
            </h1>

            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
              Prism goes beyond keyword matching — using semantic AI, behavioral signals,
              and explainable rankings to surface the candidates who will actually succeed in the role.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              {isAuthenticated ? (
                <button onClick={() => onNavigate(user?.role === 'candidate' ? 'candidate' : 'dashboard')}
                        className="btn-primary flex items-center gap-2 px-8 py-4 text-base">
                  Go to Dashboard
                  <ArrowRight size={18} />
                </button>
              ) : (
                <>
                  <button onClick={() => onNavigate('register')}
                          className="btn-primary flex items-center gap-2 px-8 py-4 text-base">
                    Start Ranking Candidates
                    <ArrowRight size={18} />
                  </button>
                  <button onClick={() => onNavigate('login')}
                          className="btn-secondary flex items-center gap-2 px-8 py-4 text-base">
                    Sign In to Dashboard
                  </button>
                </>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div key={i} className="glass rounded-2xl p-5 text-center" whileHover={{ scale: 1.05, y: -3 }} transition={{ type: 'spring', stiffness: 300 }}>
                <div className="text-3xl font-black gradient-text-teal font-mono">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Portal Selection ── */}
      <section className="relative py-24 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] bg-teal-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[10%] -right-[10%] w-[600px] h-[600px] bg-violet-500/5 blur-[120px] rounded-full" />
          {/* Moving prism light-ray pattern */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] opacity-[0.06]"
            style={{ background: 'conic-gradient(from 0deg, #14b8a6, #8b5cf6, #ec4899, #f59e0b, #3b82f6, #14b8a6)' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_20%,transparent_100%)]" />
        </div>

        <div className="relative max-w-6xl mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-100 mb-3">Choose Your Portal</h2>
            <p className="text-slate-500">Three specialized experiences built for every stakeholder.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {PORTALS.map((portal, i) => (
              <motion.div
                key={portal.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.03 }}
                onHoverStart={() => setHoveredPortal(portal.id)}
                onHoverEnd={() => setHoveredPortal(null)}
                className={`relative glass rounded-3xl p-7 cursor-pointer border ${portal.border} transition-all duration-300 group`}
                style={{
                  background: hoveredPortal === portal.id
                    ? `radial-gradient(circle at 50% 0%, ${portal.color}15, rgba(15,23,42,0.8))`
                    : undefined,
                  boxShadow: hoveredPortal === portal.id ? `0 20px 60px ${portal.color}25` : undefined,
                }}
                onClick={() => onNavigate('login', portal.id)}>

                {portal.badge && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold"
                       style={{ background: `${portal.color}25`, color: portal.color, border: `1px solid ${portal.color}40` }}>
                    {portal.badge}
                  </div>
                )}

                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                     style={{ background: `${portal.color}20`, border: `1px solid ${portal.color}30`, color: portal.color }}>
                  {portal.icon}
                </div>

                <h3 className="text-xl font-bold text-slate-100 mb-2">{portal.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">{portal.description}</p>

                <div className="space-y-2 mb-6">
                  {portal.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle size={12} style={{ color: portal.color }} />
                      {f}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold"
                     style={{ color: portal.color }}>
                  Enter Portal
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative py-24 px-6 bg-slate-900/30 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }} className="absolute -top-[50%] -right-[20%] w-[800px] h-[800px] border border-white/5 border-dashed rounded-full" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 200, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[50%] -left-[20%] w-[1000px] h-[1000px] border border-white/5 border-dotted rounded-full" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]" />
        </div>

        <div className="relative max-w-6xl mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-100 mb-3">Why Prism?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Traditional ATS keyword matching misses the best candidates. Prism understands them.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -6, scale: 1.03 }}
                className="glass-hover rounded-2xl p-6 cursor-default">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                     style={{ background: `${f.color}20`, color: f.color, border: `1px solid ${f.color}30` }}>
                  {f.icon}
                </div>
                <h4 className="font-semibold text-slate-200 mb-2">{f.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations (Coming Soon) ── */}
      <section className="relative py-24 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-gradient-to-r from-transparent via-purple-500/10 to-transparent blur-[80px]" />
           <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_20%,transparent_100%)]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 text-xs text-slate-400 mb-6">
              <Lock size={11} /> Enterprise Integrations — Coming Soon
            </div>
            <h2 className="text-3xl font-bold text-slate-100 mb-3">Connect Your Entire Stack</h2>
            <p className="text-slate-500 mb-10">Prism will integrate with every major recruitment platform, ATS, and sourcing channel.</p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {INTEGRATIONS.map((integ, i) => (
                <motion.div
                  key={integ.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-2.5 glass rounded-xl px-4 py-2.5 border border-white/10 opacity-70 hover:opacity-100 hover:border-white/30 transition-all cursor-pointer">
                  <span style={{ color: integ.color }}>{integ.icon}</span>
                  <span className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">{integ.name}</span>
                  <span className="text-[9px] text-slate-600 px-1.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-bold uppercase">SOON</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="pt-20 pb-10 px-6 border-t border-white/5 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-6">
                <img src="/logo.jpg" alt="Prism Logo" className="w-8 h-8 object-contain rounded-lg shadow-lg border border-white/10" />
                <span className="text-2xl font-black gradient-text">Prism</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
                The AI Recruitment Intelligence Platform. Beyond keywords — semantic AI, behavioral signals, and explainable rankings.
              </p>
              <div className="flex items-center gap-4">
                <motion.a whileHover={{ scale: 1.15 }} href="#" className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-slate-400 hover:text-violet-400 hover:border-violet-500/50 transition-colors">
                  <Linkedin size={16} />
                </motion.a>
                <motion.a whileHover={{ scale: 1.15 }} href="#" className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:border-slate-500/50 transition-colors">
                  <Github size={16} />
                </motion.a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-200 mb-5">Navigate</h4>
              <ul className="space-y-3">
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('landing'); }} className="text-sm text-slate-400 hover:text-teal-400 transition-colors cursor-pointer">Home</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('about'); }} className="text-sm text-slate-400 hover:text-teal-400 transition-colors cursor-pointer">About Prism</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login'); }} className="text-sm text-slate-400 hover:text-teal-400 transition-colors cursor-pointer">Recruiter Portal</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login'); }} className="text-sm text-slate-400 hover:text-teal-400 transition-colors cursor-pointer">Candidate Portal</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('register'); }} className="text-sm text-slate-400 hover:text-teal-400 transition-colors cursor-pointer">Create Account</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-200 mb-5">Platform Features</h4>
              <ul className="space-y-3">
                <li><span className="text-sm text-slate-500 flex items-center gap-1.5">Semantic Vector Search <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-500 border border-teal-500/20">LIVE</span></span></li>
                <li><span className="text-sm text-slate-500 flex items-center gap-1.5">5D Scoring Engine <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-500 border border-violet-500/20">AI</span></span></li>
                <li><span className="text-sm text-slate-500">AI Rejection Explainer</span></li>
                <li><span className="text-sm text-slate-500">Auto Outreach Drafts</span></li>
                <li><span className="text-sm text-slate-500">Career Trajectory Scoring</span></li>
                <li><span className="text-sm text-slate-500">JD Bias Scanner</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Prism Recruitment Intelligence. All rights reserved.
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-full border border-white/5">
              <Zap size={10} className="text-amber-400" />
              Built with NVIDIA NIM &middot; LLaMA-3.1-70B
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
