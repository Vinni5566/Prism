import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Star, Shield, ArrowUpRight, Github, Linkedin,
  Globe, Cpu, Database, Zap, CheckCircle, Clock, ExternalLink,
  Server, Box, Code2, Activity
} from 'lucide-react';

const INTEGRATIONS = [
  {
    name: 'LinkedIn Recruiter',
    category: 'Sourcing',
    icon: <Linkedin size={22} />,
    desc: 'One-click candidate profile sync & outreach pipeline directly into Prism.',
    color: '#0077B5',
    status: 'planned',
  },
  {
    name: 'GitHub Developer',
    category: 'Portfolio Eval',
    icon: <Github size={22} />,
    desc: 'Pull contribution graphs, repo stars, code quality signals, and stack info.',
    color: '#a78bfa',
    status: 'planned',
  },
  {
    name: 'Naukri Recruiter',
    category: 'Sourcing',
    icon: <Globe size={22} />,
    desc: 'Sync candidates directly from Naukri search alerts and resume database.',
    color: '#f97316',
    status: 'planned',
  },
  {
    name: 'Greenhouse ATS',
    category: 'ATS',
    icon: <Layers size={22} />,
    desc: 'Export Prism-ranked shortlists directly into Greenhouse pipeline stages.',
    color: '#14b8a6',
    status: 'planned',
  },
  {
    name: 'Lever ATS',
    category: 'ATS',
    icon: <Star size={22} />,
    desc: 'Pull applications and auto-rank all new candidates through Prism AI.',
    color: '#ec4899',
    status: 'planned',
  },
  {
    name: 'Workday HR',
    category: 'Enterprise ERP',
    icon: <Shield size={22} />,
    desc: 'Push Prism composite scores into your global employee record system.',
    color: '#3b82f6',
    status: 'planned',
  },
];

const TECH_STACK = [
  {
    name: 'NVIDIA NIM',
    subtitle: 'LLaMA-3.1-70B-Instruct',
    desc: 'Powers JD parsing, AI explanations, outreach generation, and behavioral signal extraction.',
    icon: <Cpu size={20} />,
    color: '#76b900',
    live: true,
    badge: 'LIVE',
    badgeColor: '#10b981',
    features: ['JD Analysis', 'AI Explanations', 'Outreach Drafts'],
    link: 'https://build.nvidia.com/meta/llama-3_1-70b-instruct',
  },
  {
    name: 'ChromaDB',
    subtitle: 'Vector Similarity Search',
    desc: 'Stores 768-dimensional candidate embeddings. Powers sub-second semantic search across the entire pool.',
    icon: <Database size={20} />,
    color: '#e8572a',
    live: true,
    badge: 'LIVE',
    badgeColor: '#10b981',
    features: ['Semantic Retrieval', 'Fast Similarity', 'Persistent Store'],
    link: 'https://trychroma.com',
  },
  {
    name: 'sentence-transformers',
    subtitle: 'all-MiniLM-L6-v2',
    desc: 'Generates 384-dim embeddings for candidate profiles and job descriptions — sub-100ms locally.',
    icon: <Box size={20} />,
    color: '#f59e0b',
    live: true,
    badge: 'LIVE',
    badgeColor: '#10b981',
    features: ['384-dim Vectors', 'Local Inference', 'SBERT Architecture'],
    link: 'https://huggingface.co/sentence-transformers',
  },
  {
    name: 'FastAPI + SQLite',
    subtitle: 'Python Backend Engine',
    desc: 'High-performance async API with persistent SQLite storage for runs, feedback, and candidate data.',
    icon: <Server size={20} />,
    color: '#059669',
    live: true,
    badge: 'LIVE',
    badgeColor: '#10b981',
    features: ['Async Endpoints', 'Run History', 'Feedback Storage'],
    link: 'https://fastapi.tiangolo.com',
  },
  {
    name: 'React + Vite',
    subtitle: 'Frontend Intelligence Layer',
    desc: 'Glassmorphic dark-mode SPA with Framer Motion animations, Recharts visualizations, and live re-ranking.',
    icon: <Code2 size={20} />,
    color: '#61dafb',
    live: true,
    badge: 'LIVE',
    badgeColor: '#10b981',
    features: ['Live Re-ranking', 'Framer Animations', 'Recharts Viz'],
    link: 'https://vitejs.dev',
  },
  {
    name: 'Redrob Dataset',
    subtitle: 'Competition-grade Data',
    desc: 'Built for the Redrob Data & AI Challenge — fully compatible with the official candidate pool and submission format.',
    icon: <Activity size={20} />,
    color: '#8b5cf6',
    live: true,
    badge: 'COMPATIBLE',
    badgeColor: '#8b5cf6',
    features: ['CSV Ingestion', 'Standard Schema', 'Export Format'],
    link: null,
  },
];

export default function Integrations() {
  const [activeTab, setActiveTab] = useState('stack'); // 'stack' | 'planned'
  const [hovered, setHovered] = useState(null);

  return (
    <div className="space-y-6 max-w-5xl mx-auto my-4 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass rounded-3xl p-7 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-full bg-[radial-gradient(circle_at_right,rgba(20,184,166,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-32 bg-[radial-gradient(circle,rgba(124,58,237,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center gap-5">
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[10px] text-teal-400 font-bold uppercase tracking-widest">
              <Zap size={10} /> AI Stack & Integrations
            </div>
            <h1 className="text-2xl font-black text-slate-100">
              Built on <span className="gradient-text">Best-in-Class</span> AI
            </h1>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
              Prism's intelligence layer combines NVIDIA NIM LLMs with vector search,
              semantic embeddings, and behavioral signal scoring — connected to your recruitment stack.
            </p>
          </div>

          {/* Live indicator */}
          <div className="flex-shrink-0 glass rounded-2xl p-4 border border-emerald-500/20 text-center min-w-[130px]">
            <div className="flex justify-center mb-1">
              <span className="status-online" />
            </div>
            <div className="text-lg font-black font-mono text-emerald-400">5 / 5</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Services Live</div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        {[
          { id: 'stack', label: '🔬 Live AI Stack', count: TECH_STACK.length },
          { id: 'planned', label: '🔗 Planned Integrations', count: INTEGRATIONS.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-teal-500/15 border-teal-500/30 text-teal-400'
                : 'border-slate-700/40 text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold
              ${activeTab === tab.id ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-500'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'stack' ? (
          <motion.div
            key="stack"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TECH_STACK.map((tech, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                onHoverStart={() => setHovered(tech.name)}
                onHoverEnd={() => setHovered(null)}
                className="glass rounded-2xl p-5 border border-white/5 flex flex-col gap-4 group transition-all duration-200 cursor-default"
                style={{
                  borderColor: hovered === tech.name ? `${tech.color}35` : undefined,
                  boxShadow: hovered === tech.name ? `0 8px 32px ${tech.color}12` : undefined,
                }}>

                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                       style={{ background: `${tech.color}15`, border: `1px solid ${tech.color}30`, color: tech.color }}>
                    {tech.icon}
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full font-mono"
                        style={{ background: `${tech.badgeColor}15`, color: tech.badgeColor, border: `1px solid ${tech.badgeColor}30` }}>
                    {tech.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    {tech.name}
                    {tech.link && (
                      <a href={tech.link} target="_blank" rel="noreferrer"
                         className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-slate-400"
                         onClick={e => e.stopPropagation()}>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </h3>
                  <div className="text-[10px] text-slate-500 mb-2" style={{ color: tech.color }}>{tech.subtitle}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{tech.desc}</p>
                </div>

                <div className="mt-auto flex flex-wrap gap-1.5">
                  {tech.features.map(f => (
                    <span key={f} className="inline-flex items-center gap-1 text-[9px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: `${tech.color}10`, color: tech.color, border: `1px solid ${tech.color}25` }}>
                      <CheckCircle size={8} /> {f}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="planned"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {INTEGRATIONS.map((integ, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="glass rounded-2xl p-5 border border-white/5 flex flex-col justify-between hover:border-slate-600/40 transition-all group cursor-default">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                           style={{ background: `${integ.color}15`, border: `1px solid ${integ.color}25`, color: integ.color }}>
                        {integ.icon}
                      </div>
                      <span className="bg-slate-800/60 border border-slate-700/50 text-slate-600 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                        Enterprise
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-200 group-hover:text-slate-100 transition-colors flex items-center gap-1">
                      {integ.name}
                      <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{integ.desc}</p>
                  </div>

                  <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[10px]">
                    <span className="text-slate-600">{integ.category}</span>
                    <span className="flex items-center gap-1 text-amber-400/80 font-mono font-bold">
                      <Clock size={9} /> PLANNED
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 glass rounded-2xl p-5 border border-white/5 text-center">
              <p className="text-xs text-slate-500">
                🚀 All integrations are on the product roadmap. Current version is built for the
                <span className="text-amber-400 font-semibold"> Redrob Data & AI Challenge</span> — 
                compatible with the official dataset & submission format.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
