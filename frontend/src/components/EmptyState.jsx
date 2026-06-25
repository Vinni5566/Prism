import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function EmptyState({ title, description, icon, action }) {
  return (
    <div className="glass rounded-3xl p-12 text-center border border-white/5 max-w-lg mx-auto my-12">
      <div className="w-16 h-16 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-center mx-auto mb-6 text-slate-400">
        {icon || <HelpCircle size={28} />}
      </div>
      <h3 className="text-lg font-bold text-slate-200 mb-2">{title || 'No data found'}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed mb-6">
        {description || 'There are no items matching the query or configuration.'}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-secondary text-xs px-4 py-2 hover:border-teal-500/30"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
