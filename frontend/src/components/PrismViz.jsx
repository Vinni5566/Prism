import React from 'react';
import { motion } from 'framer-motion';
import { normalizeScore } from '../utils/helpers';

const DIMENSIONS = [
  { key: 'semantic',   label: 'Semantic Match',     color: 'rgb(20, 184, 166)',  glow: 'rgba(20, 184, 166, 0.4)' },
  { key: 'skill',      label: 'Skill Depth',        color: 'rgb(139, 92, 246)',  glow: 'rgba(139, 92, 246, 0.4)' },
  { key: 'trajectory', label: 'Career Trajectory',  color: 'rgb(245, 158, 11)',  glow: 'rgba(245, 158, 11, 0.4)' },
  { key: 'behavioral', label: 'Behavioral Signals', color: 'rgb(236, 72, 153)',  glow: 'rgba(236, 72, 153, 0.4)' },
  { key: 'domain',     label: 'Domain Relevance',   color: 'rgb(59, 130, 246)',  glow: 'rgba(59, 130, 246, 0.4)' },
];

export default function PrismViz({ breakdown = {} }) {
  // Center of our 200x200 canvas is (100, 100)
  const cx = 100;
  const cy = 100;
  const rMax = 80;

  // Calculate coordinates for each vertex based on score (0 to 100)
  const points = DIMENSIONS.map((dim, idx) => {
    const rawVal = breakdown[dim.key] ?? breakdown[`${dim.key}_score`] ?? 50;
    const val = normalizeScore(rawVal); // 0-100
    const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2; // offset to point upwards
    const radius = (val / 100) * rMax;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    
    // Outer boundary guideline coordinates
    const outerX = cx + rMax * Math.cos(angle);
    const outerY = cy + rMax * Math.sin(angle);
    
    return {
      ...dim,
      val,
      x,
      y,
      outerX,
      outerY
    };
  });

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');
  const outerPolygonPath = points.map(p => `${p.outerX},${p.outerY}`).join(' ');

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900/20 rounded-2xl border border-white/5 relative overflow-hidden">
      {/* 3D Prism Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Decorative rotating prism glow */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-48 h-48 rounded-full border border-dashed border-indigo-500/10 pointer-events-none"
        />

        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          {/* Outer Guideline Web */}
          <polygon
            points={outerPolygonPath}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1.5"
          />
          {/* 50% Guideline Web */}
          <polygon
            points={points.map(p => {
              const angle = (points.indexOf(p) * 2 * Math.PI) / 5 - Math.PI / 2;
              const x = cx + (rMax * 0.5) * Math.cos(angle);
              const y = cy + (rMax * 0.5) * Math.sin(angle);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Web Spokes (Radial Axes) */}
          {points.map((p, idx) => (
            <line
              key={`spoke-${idx}`}
              x1={cx}
              y1={cy}
              x2={p.outerX}
              y2={p.outerY}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="1"
            />
          ))}

          {/* Score Area Polygon with holographic gradient */}
          <defs>
            <radialGradient id="prismGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(124, 58, 237, 0.3)" />
              <stop offset="80%" stopColor="rgba(20, 184, 166, 0.2)" />
              <stop offset="100%" stopColor="rgba(20, 184, 166, 0.0)" />
            </radialGradient>
          </defs>
          
          <motion.polygon
            points={polygonPath}
            fill="url(#prismGlow)"
            stroke="rgba(20, 184, 166, 0.8)"
            strokeWidth="2"
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Glowing Vertex Dots */}
          {points.map((p, idx) => (
            <g key={`vertex-${idx}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill={p.color}
                className="transition-all duration-300"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="8"
                fill={p.glow}
                className="animate-ping"
                style={{ animationDuration: '3s' }}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Dynamic Key Labels Grid */}
      <div className="grid grid-cols-2 gap-3 mt-2 w-full text-[11px]">
        {points.map(p => (
          <div key={p.key} className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-slate-800/30 border border-slate-700/20">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-slate-400 truncate">{p.label}</span>
            </div>
            <span className="font-mono font-bold ml-1" style={{ color: p.color }}>{p.val.toFixed(0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
