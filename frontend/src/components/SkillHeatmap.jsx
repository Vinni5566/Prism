import React from 'react';
import { getSkillStatus } from '../utils/helpers';

export default function SkillHeatmap({ results, requiredSkills }) {
  if (!results?.length || !requiredSkills?.length) return null;
  const top = results.slice(0, 8);
  const skills = requiredSkills.slice(0, 12);

  const getCell = (candidate, skillName) => {
    const gapArr = candidate.skill_gap;
    if (!Array.isArray(gapArr)) return 'missing';
    const item = gapArr.find(g => g.skill?.toLowerCase() === skillName.toLowerCase());
    if (!item) {
      // Fallback: check candidate skills list
      const has = (candidate.skills || []).some(s =>
        s.toLowerCase().includes(skillName.toLowerCase())
      );
      return has ? 'full' : 'missing';
    }
    return getSkillStatus(item);
  };

  const cellStyle = (status) => {
    switch (status) {
      case 'full':    return 'bg-emerald-500/25 border-emerald-500/40 text-emerald-400';
      case 'partial': return 'bg-amber-500/20  border-amber-500/30  text-amber-400';
      default:        return 'bg-red-500/10    border-red-500/20    text-red-400/60';
    }
  };

  const cellIcon = (status) => {
    switch (status) {
      case 'full':    return '✓';
      case 'partial': return '~';
      default:        return '✗';
    }
  };

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="section-header">Skill Gap Heatmap</div>
        <div className="flex gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500/40 inline-block"/>Full</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500/30 inline-block"/>Partial</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500/20 inline-block"/>Missing</span>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left text-slate-500 font-normal pb-2 pr-3 min-w-[100px]">Candidate</th>
              {skills.map(skill => (
                <th key={skill} className="text-center text-slate-500 font-normal pb-2 px-1 whitespace-nowrap" style={{ minWidth: '64px' }}>
                  <span className="inline-block max-w-[60px] truncate text-[10px]">{skill}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="space-y-1">
            {top.map((cand, ri) => (
              <tr key={cand.candidate_id || ri} className="group">
                <td className="pr-3 py-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-600">#{cand.rank}</span>
                    <span className="text-slate-300 truncate max-w-[80px]">{cand.name?.split(' ')[0]}</span>
                  </div>
                </td>
                {skills.map(skill => {
                  const status = getCell(cand, skill);
                  return (
                    <td key={skill} className="px-1 py-1 text-center">
                      <div className={`inline-flex items-center justify-center w-7 h-7 rounded-md border text-[11px] font-bold transition-all duration-150 ${cellStyle(status)}`}
                           title={`${cand.name} — ${skill}: ${status}`}>
                        {cellIcon(status)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
