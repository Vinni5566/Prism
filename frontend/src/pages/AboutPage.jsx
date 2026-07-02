import React from 'react';
import { motion } from 'framer-motion';
import { Target, Layers, TrendingUp, Zap, Database, Brain, ArrowRight, Github, Linkedin } from 'lucide-react';

const SIGNALS = [
  {
    title: "① Semantic Similarity (30%)",
    desc: "Vector embeddings find candidates who mean the right things — even with different words. 'Drove top-line expansion' matches 'revenue growth'. Keyword search would miss this entirely.",
    icon: <Brain size={24} className="text-teal-400" />,
    color: "teal"
  },
  {
    title: "② Skill Depth & Coverage (25%)",
    desc: "Not just 'do they have it' but 'how deeply?' Skills backed by multiple projects get a 1.2× credibility multiplier. Skills listed with no evidence get 0.6×.",
    icon: <Layers size={24} className="text-violet-400" />,
    color: "violet"
  },
  {
    title: "③ Career Trajectory (20%)",
    desc: "Analyses career history to detect upward momentum: title progression, internal promotions, career velocity, and tenure health.",
    icon: <TrendingUp size={24} className="text-amber-400" />,
    color: "amber"
  },
  {
    title: "④ Behavioral Intent (15%)",
    desc: "Answers 'are they actually looking right now?' using metadata signals that cannot be faked like days since last active and native platform activity.",
    icon: <Target size={24} className="text-pink-400" />,
    color: "pink"
  },
  {
    title: "⑤ Domain Relevance (10%)",
    desc: "Industry overlap between candidate history and the target role. Never zero — transferable skills exist.",
    icon: <Database size={24} className="text-blue-400" />,
    color: "blue"
  }
];

const FEATURES = [
  { problem: "Black box — no one knows why a candidate was rejected", solution: "Glass Box Explainability — every rank has an AI-written reason" },
  { problem: "Keyword matching — misses semantic meaning", solution: "Semantic Vector Search — finds meaning, not just matching words" },
  { problem: "Fixed scoring — can't adjust for role priorities", solution: "Dynamic Weight Sliders — recruiter controls what matters" },
  { problem: "Ignores behavioral signals — dormant = active", solution: "Intent Scoring — recent activity boosts rank" },
  { problem: "No career trajectory view", solution: "Trajectory Momentum — detects upward career velocity" },
  { problem: "Open stack — runs locally, zero licensing cost", solution: "Enterprise-ready — fully local, no vendor lock-in" },
  { problem: "Fooled by AI-inflated resumes", solution: "AI-Resistant Signals — metadata ChatGPT can't fake" },
  { problem: "Manual recruiter outreach", solution: "Auto Outreach Drafts — personalised messages for top 5" }
];

export default function AboutPage({ onNavigate, isAuthenticated, user }) {
  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden relative">
  {/* Animated moving dots background */}
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {Array.from({ length: 12 }).map((_, i) => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-white rounded-full opacity-30 absolute"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
        }}
        animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{
          repeat: Infinity,
          duration: 5 + i,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-teal-500/10 to-transparent" />
        <motion.div animate={{ y: [0, -30, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-violet-500/10 blur-[150px] rounded-full" />
        <motion.div animate={{ y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-0 -left-40 w-[600px] h-[600px] bg-teal-500/5 blur-[150px] rounded-full" />

        {/* Animated prism conic light-ray bg */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] opacity-[0.05]"
          style={{ background: 'conic-gradient(from 0deg, #14b8a6, #8b5cf6, #ec4899, #f59e0b, #3b82f6, #10b981, #14b8a6)' }}
        />

        {/* Animated Rings */}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }} className="absolute top-[20%] -right-[20%] w-[800px] h-[800px] border border-white/5 border-dashed rounded-full" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }} className="absolute bottom-[10%] -left-[10%] w-[700px] h-[700px] border border-teal-500/10 border-dotted rounded-full" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_100%_at_50%_0%,#000_10%,transparent_100%)]" />
      </div>

      {/* Navbar (Same as Landing Page) */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => onNavigate('landing')}
          >
            <img src="/logo.jpg" alt="Prism Logo" className="w-5 h-5 object-contain" />
            <div>
              <div className="text-lg font-bold gradient-text leading-none group-hover:opacity-80 transition-opacity">Prism</div>
              <div className="text-[10px] text-slate-500 font-mono leading-none">AI RECRUITMENT INTELLIGENCE</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <button onClick={() => onNavigate(user?.role === 'candidate' ? 'candidate' : 'dashboard')}
                className="btn-primary text-sm px-5 py-2">
                Go to Dashboard
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <motion.button whileHover={{ scale: 1.08 }} onClick={() => onNavigate('login')}
                  className="btn-secondary text-sm px-4 py-2">
                  Sign In
                </motion.button>
                <motion.button whileHover={{ scale: 1.08 }} onClick={() => onNavigate('register')}
                  className="btn-primary text-sm px-5 py-2">
                  Get Started
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-24 space-y-24">

        {/* Header */}
        <section className="text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-5xl md:text-6xl font-black gradient-text tracking-tight mb-6">
              See every candidate <br /> in their true light.
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              A prism doesn't change light — it reveals what was always there. Traditional recruiting tools see candidates as flat keyword lists. Prism breaks that surface apart.
            </p>
          </motion.div>
        </section>

        {/* The Problem We Solve */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass rounded-3xl p-10 border border-white/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[80px] rounded-full" />
            <h2 className="text-3xl font-bold text-slate-100 mb-6 text-center">The Problem We Solve</h2>
            <div className="max-w-4xl mx-auto text-center mb-10">
              <p className="text-slate-400 leading-relaxed mb-6">
                Recruiters are drowning in profiles. Traditional AI tools match keywords, not meaning. They give scores with zero explanation, treat dormant profiles the same as active ones, and are easily fooled by AI-polished resumes.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-sm font-semibold">
                Prism fixes all of this in one open, explainable system.
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FEATURES.map((f, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02, x: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex flex-col p-4 rounded-2xl bg-slate-900/50 border border-white/5 hover:bg-slate-800/80 cursor-pointer"
                  >
                    <div className="text-xs text-red-400 font-semibold mb-1 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" /> {f.problem}
                    </div>
                    <div className="text-sm text-teal-400 font-medium flex items-center gap-2">
                      <ArrowRight size={12} /> {f.solution}
                    </div>
                  </motion.div>
                ))}
              </div>
          </motion.div>
        </section>

        {/* The 5 Scoring Signals */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">The 5 Scoring Signals</h2>
            <p className="text-slate-400">The Prism Spectrum — a complete, multi-angle view of every person in your talent pool.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            {SIGNALS.map((signal, i) => {
              // Asymmetrical Grid Layout: First two take 50% (3 cols), last three take 33% (2 cols)
              const colSpan = i < 2 ? 'md:col-span-3' : 'md:col-span-2';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`glass rounded-2xl p-8 border border-white/5 hover:border-white/20 transition-colors group relative overflow-hidden ${colSpan}`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-${signal.color}-500/5 blur-[50px] rounded-full group-hover:bg-${signal.color}-500/10 transition-colors pointer-events-none`} />

                  <div className={`w-14 h-14 rounded-2xl bg-${signal.color}-500/10 flex items-center justify-center mb-6 border border-${signal.color}-500/20 shadow-[0_0_15px_rgba(var(--color-${signal.color}),0.1)]`}>
                    {signal.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-200 mb-3">{signal.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed relative z-10">{signal.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-12 border-t border-white/10">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Ready to upgrade your hiring?</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('register')}
            className="btn-primary px-8 py-4 text-base shadow-[0_0_40px_rgba(20,184,166,0.3)] hover:shadow-[0_0_60px_rgba(20,184,166,0.5)] transition-shadow"
          >
            Start Ranking Candidates
          </motion.button>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="pt-20 pb-10 px-6 border-t border-white/5 bg-slate-950/50 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
            <div>
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
