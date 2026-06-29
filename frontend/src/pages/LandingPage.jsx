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
  {
    id: 'admin',
    icon: <Shield size={28} />,
    title: 'Admin Portal',
    description: 'System health, model status, ranking logs, and dataset configuration.',
    color: '#f59e0b',
    gradient: 'from-amber-500/20 to-amber-600/5',
    border: 'border-amber-500/30',
    features: ['System Health', 'Model Config', 'API Logs', 'Dataset Stats'],
    badge: null,
  },
];

const FEATURES = [
  { icon: <Brain size={20} />, title: 'Semantic AI Matching', desc: 'Goes beyond keywords — understands context, intent, and role alignment.', color: '#14b8a6' },
  { icon: <Layers size={20} />, title: '5-Dimensional Scoring', desc: 'Semantic, Skill Depth, Career Trajectory, Behavioral Signals, Domain Relevance.', color: '#8b5cf6' },
  { icon: <Target size={20} />, title: 'Explainable Rankings', desc: 'Every rank comes with a human-readable AI explanation. No black boxes.', color: '#ec4899' },
  { icon: <TrendingUp size={20} />, title: 'Feedback Learning', desc: 'Re-rank based on your yes/no decisions. The engine gets smarter with you.', color: '#f59e0b' },
  { icon: <Cpu size={20} />, title: 'NVIDIA NIM Powered', desc: 'LLaMA-3.1-70B for JD parsing, explanations, and outreach generation.', color: '#3b82f6' },
  { icon: <Database size={20} />, title: 'Vector Intelligence', desc: 'ChromaDB semantic search across the full candidate pool instantly.', color: '#10b981' },
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

export default function LandingPage({ onNavigate }) {
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
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('login')}
                    className="btn-secondary text-sm px-4 py-2">
              Sign In
            </button>
            <button onClick={() => onNavigate('register')}
                    className="btn-primary text-sm px-5 py-2">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
               style={{ background: 'radial-gradient(circle, #14b8a6, transparent)' }} />
          <div className="absolute top-40 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
               style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 opacity-20 blur-3xl"
               style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
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
              <button onClick={() => onNavigate('register')}
                      className="btn-primary flex items-center gap-2 px-8 py-4 text-base">
                Start Ranking Candidates
                <ArrowRight size={18} />
              </button>
              <button onClick={() => onNavigate('login')}
                      className="btn-secondary flex items-center gap-2 px-8 py-4 text-base">
                Sign In to Dashboard
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <div key={i} className="glass rounded-2xl p-5 text-center">
                <div className="text-3xl font-black gradient-text-teal font-mono">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Portal Selection ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-100 mb-3">Choose Your Portal</h2>
            <p className="text-slate-500">Three specialized experiences built for every stakeholder.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PORTALS.map((portal, i) => (
              <motion.div
                key={portal.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onHoverStart={() => setHoveredPortal(portal.id)}
                onHoverEnd={() => setHoveredPortal(null)}
                className={`relative glass rounded-3xl p-7 cursor-pointer border ${portal.border} transition-all duration-300 group`}
                style={{
                  background: hoveredPortal === portal.id
                    ? `radial-gradient(circle at 50% 0%, ${portal.color}15, rgba(15,23,42,0.8))`
                    : undefined,
                  boxShadow: hoveredPortal === portal.id ? `0 20px 60px ${portal.color}20` : undefined,
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
      <section className="py-24 px-6 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-100 mb-3">Why Prism?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Traditional ATS keyword matching misses the best candidates. Prism understands them.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3 }}
                className="glass-hover rounded-2xl p-6">
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
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
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
                  className="flex items-center gap-2.5 glass rounded-xl px-4 py-2.5 border border-white/10 opacity-60 hover:opacity-90 transition-opacity cursor-default">
                  <span style={{ color: integ.color }}>{integ.icon}</span>
                  <span className="text-sm text-slate-300 font-medium">{integ.name}</span>
                  <span className="text-[9px] text-slate-600 px-1.5 py-0.5 rounded-full bg-slate-800 border border-slate-700">SOON</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <img src="/logo.jpg" alt="Prism Logo" className="w-4 h-4 object-contain" />
            <span className="text-slate-600 text-sm">Prism AI</span>
          </div>
          <div className="text-xs text-slate-700">Built with NVIDIA NIM · LLaMA-3.1-70B · sentence-transformers · ChromaDB</div>
        </div>
      </footer>
    </div>
  );
}
