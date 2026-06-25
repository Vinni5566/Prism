import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressRing({ value, size = 60, strokeWidth = 5, color = '#14b8a6', glow = true }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(100, Math.max(0, parseFloat(value || 0)));
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
          style={{
            filter: glow ? `drop-shadow(0 0 4px ${color}80)` : 'none'
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xs font-bold font-mono text-slate-100">{Math.round(progress)}</span>
      </div>
    </div>
  );
}
