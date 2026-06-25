import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-5 border border-white/5 space-y-4 animate-pulse">
      <div className="flex items-start gap-4">
        {/* Rank / Avatar */}
        <div className="w-10 h-10 bg-slate-800 rounded-xl" />
        
        {/* Profile info */}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-800 rounded w-1/3" />
          <div className="flex gap-2">
            <div className="h-3 bg-slate-800 rounded w-1/4" />
            <div className="h-3 bg-slate-800 rounded w-1/4" />
          </div>
        </div>

        {/* Score indicator */}
        <div className="w-14 h-10 bg-slate-800 rounded-xl" />
      </div>

      {/* Grid of score indicators */}
      <div className="grid grid-cols-5 gap-2 pt-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-1 bg-slate-800 rounded" />
        ))}
      </div>

      {/* Skills */}
      <div className="flex gap-2 flex-wrap pt-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-5 bg-slate-800 rounded-md w-16" />
        ))}
      </div>
    </div>
  );
}
