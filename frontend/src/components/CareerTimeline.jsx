import React from 'react';
import { Calendar, Briefcase, ChevronRight } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function CareerTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-4 text-center text-slate-500 text-xs italic">
        No career history details available.
      </div>
    );
  }

  // Sort history by start date descending if dates exist
  const sortedHistory = [...history].sort((a, b) => {
    if (!a.start_date) return 1;
    if (!b.start_date) return -1;
    return new Date(b.start_date) - new Date(a.start_date);
  });

  return (
    <div className="space-y-3 bg-slate-900/40 border border-white/5 rounded-2xl p-4.5">
      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
        <Briefcase size={12} className="text-teal-400" /> Career Timeline
      </h4>

      <div className="relative pl-4 border-l border-slate-700/50 space-y-4 ml-2.5 py-1">
        {sortedHistory.map((job, idx) => {
          const title = job.title || job.current_title || 'Unknown Title';
          const company = job.company || job.company_name || job.current_company || 'Unknown Company';
          const start = job.start_date ? formatDate(job.start_date) : 'N/A';
          const end = job.end_date ? formatDate(job.end_date) : (job.is_current ? 'Present' : 'N/A');
          const duration = job.duration_months ? `${job.duration_months} mos` : '';

          return (
            <div key={idx} className="relative group">
              {/* Timeline marker */}
              <span className="absolute -left-[21px] top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-slate-950 border-2 border-teal-500 group-hover:scale-125 transition-transform" />

              <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h5 className="text-xs font-semibold text-slate-200 group-hover:text-teal-400 transition-colors">
                    {title}
                  </h5>
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Calendar size={9} />
                    {start} – {end}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span>{company}</span>
                  {duration && (
                    <>
                      <ChevronRight size={10} className="text-slate-600" />
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                        {duration}
                      </span>
                    </>
                  )}
                </div>
                {job.description && (
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    {job.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
