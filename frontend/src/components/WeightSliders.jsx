import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { normalizeWeights } from '../utils/helpers';

const SIGNALS = [
  { key: 'semantic',    label: 'Semantic Fit',       color: '#14b8a6', desc: 'Vector similarity between JD and profile' },
  { key: 'skill',       label: 'Skill Match',        color: '#8b5cf6', desc: 'Skill depth & coverage vs required skills' },
  { key: 'trajectory',  label: 'Career Trajectory',  color: '#f59e0b', desc: 'Career momentum & upward progression' },
  { key: 'behavioral',  label: 'Behavioral Intent',  color: '#ec4899', desc: 'Activity recency & job-seeking signals' },
  { key: 'domain',      label: 'Domain Relevance',   color: '#3b82f6', desc: 'Industry & domain overlap' },
];

export const DEFAULT_WEIGHTS = {
  semantic: 30, skill: 25, trajectory: 20, behavioral: 15, domain: 10,
};

const PRESETS = {
  balanced:    { semantic: 30, skill: 25, trajectory: 20, behavioral: 15, domain: 10 },
  skillFocus:  { semantic: 20, skill: 40, trajectory: 15, behavioral: 10, domain: 15 },
  experience:  { semantic: 20, skill: 20, trajectory: 40, behavioral: 10, domain: 10 },
  intent:      { semantic: 25, skill: 20, trajectory: 15, behavioral: 30, domain: 10 },
};

export default function WeightSliders({ weights, onChange }) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const normalized = normalizeWeights(weights);

  const handleSlider = (key, rawVal) => {
    const val = parseInt(rawVal, 10);
    onChange({ ...weights, [key]: val });
  };

  const applyPreset = (presetKey) => onChange({ ...PRESETS[presetKey] });

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
            <SlidersHorizontal size={15} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Scoring Weights</h2>
            <p className="text-xs text-slate-500">Tune what matters for this role</p>
          </div>
        </div>
        <button onClick={() => onChange({ ...DEFAULT_WEIGHTS })}
                className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3">
          <RotateCcw size={11}/> Reset
        </button>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries({ balanced: 'Balanced', skillFocus: 'Skills-Heavy', experience: 'Experience', intent: 'Intent-Bias' }).map(([k, label]) => (
          <button key={k} onClick={() => applyPreset(k)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-slate-200 hover:border-teal-500/30">
            {label}
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        {SIGNALS.map(({ key, label, color, desc }) => {
          const pct = (weights[key] / Math.max(total, 1)) * 100;
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-300">{label}</div>
                  <div className="text-[10px] text-slate-600">{desc}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 w-8 text-right">{weights[key]}</span>
                  <span className="text-[10px] text-slate-600 w-8 text-right">({pct.toFixed(0)}%)</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={weights[key]}
                onChange={e => handleSlider(key, e.target.value)}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  accentColor: color,
                  background: `linear-gradient(to right, ${color} 0%, ${color} ${weights[key]}%, rgb(51,65,85) ${weights[key]}%, rgb(51,65,85) 100%)`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Weight total indicator */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/40">
        <span className="text-xs text-slate-500">Total weight</span>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300"
                 style={{ width: `${Math.min(100, total)}%`, background: 'linear-gradient(90deg,#14b8a6,#8b5cf6)' }} />
          </div>
          <span className="text-xs font-mono text-slate-400">{total}</span>
        </div>
      </div>

      {/* Normalized preview */}
      <div className="text-[10px] text-slate-600 font-mono break-words whitespace-normal">
        Backend: {Object.entries(normalized).map(([k, v]) => `${k}=${v}`).join(' · ')}
      </div>
    </div>
  );
}
