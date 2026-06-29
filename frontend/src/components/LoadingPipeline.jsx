import React from 'react';
import { Cpu, Database, Activity, Zap } from 'lucide-react';

const STEPS = [
  { id: 1, icon: <Zap size={18}/>,      label: 'Understanding job description',    detail: 'NVIDIA NIM LLaMA 3.1 extracting skills, domain, and seniority…' },
  { id: 2, icon: <Database size={18}/>, label: 'Searching candidate vectors',      detail: 'ChromaDB semantic search across full candidate pool…' },
  { id: 3, icon: <Cpu size={18}/>,      label: 'Calculating multi-signal scores',  detail: 'Running all 5 scoring dimensions: semantic, skill, trajectory, behavioral, domain…' },
  { id: 4, icon: <Activity size={18}/>, label: 'Generating AI explanations',       detail: 'NVIDIA NIM writing ranked explanations and outreach drafts…' },
  { id: 5, icon: <Zap size={18}/>,      label: 'Preparing ranked shortlist',       detail: 'Sorting, saving to DB and building final results…' },
];

export default function LoadingPipeline() {
  const [activeStep, setActiveStep] = React.useState(0);

  React.useEffect(() => {
    const timings = [0, 3000, 8000, 14000, 22000];
    const timers = timings.map((delay, i) =>
      setTimeout(() => setActiveStep(i + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="glass rounded-2xl p-8 text-center">
      {/* Animated prism logo */}
      <div className="relative flex justify-center mb-8">
        <div className="relative w-20 h-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-3xl flex items-center justify-center border-4 border-slate-900 shadow-xl mx-auto z-10 relative">
            <img src="/logo.jpg" alt="Prism Logo" className="w-full h-full object-cover rounded-[1.2rem]" />
          </motion.div>
        </div>
      </div>

      <h2 className="text-2xl font-bold gradient-text mb-2">Prism is Analyzing</h2>
      <p className="text-slate-400 text-sm mb-8">
        Multi-signal AI ranking in progress — this takes 30–60 seconds
      </p>

      {/* Steps */}
      <div className="space-y-3 text-left max-w-md mx-auto">
        {STEPS.map((step, idx) => {
          const done    = activeStep > idx + 1;
          const current = activeStep === idx + 1;
          const pending = activeStep < idx + 1;
          return (
            <div key={step.id}
                 className={`flex items-start gap-3 rounded-xl p-3 transition-all duration-500
                   ${current ? 'bg-teal-500/10 border border-teal-500/30' : ''}
                   ${done    ? 'opacity-50' : ''}
                   ${pending ? 'opacity-30' : ''}`}>
              {/* Icon / check */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm
                ${current ? 'bg-teal-500/20 text-teal-400' : done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                {done ? '✓' : step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm ${current ? 'text-teal-300' : done ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {step.label}
                  {current && (
                    <span className="ml-2 inline-flex gap-0.5">
                      {[0,1,2].map(i => (
                        <span key={i} className="inline-block w-1 h-1 rounded-full bg-teal-400"
                              style={{ animation: `bounce 1s ease-in-out ${i*0.2}s infinite` }} />
                      ))}
                    </span>
                  )}
                </div>
                {current && (
                  <div className="text-xs text-slate-500 mt-0.5">{step.detail}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-8 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
             style={{
               width: `${(activeStep / STEPS.length) * 100}%`,
               background: 'linear-gradient(90deg, #0d9488, #7c3aed)',
             }} />
      </div>
      <div className="mt-2 text-xs text-slate-500">
        Step {Math.min(activeStep, STEPS.length)} of {STEPS.length}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
