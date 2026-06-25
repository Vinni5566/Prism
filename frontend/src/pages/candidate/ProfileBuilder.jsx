import React, { useState } from 'react';
import { Sparkles, Save, User, Briefcase, Award, Globe, Link } from 'lucide-react';

export default function ProfileBuilder({ profile, onSave }) {
  const [name, setName] = useState(profile.name || '');
  const [title, setTitle] = useState(profile.title || '');
  const [experience, setExperience] = useState(profile.experienceYears || 0);
  const [skillsStr, setSkillsStr] = useState(profile.skills ? profile.skills.join(', ') : '');
  const [github, setGithub] = useState(profile.github || '');
  const [linkedin, setLinkedin] = useState(profile.linkedin || '');
  const [certsStr, setCertsStr] = useState(profile.certifications ? profile.certifications.join(', ') : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const skillsList = skillsStr.split(',').map(s => s.trim()).filter(s => s);
    const certsList = certsStr.split(',').map(c => c.trim()).filter(c => c);

    onSave({
      name,
      title,
      experienceYears: parseFloat(experience),
      skills: skillsList,
      github,
      linkedin,
      certifications: certsList,
    });
  };

  return (
    <div className="glass rounded-3xl p-6 border border-white/5 max-w-2xl mx-auto my-4 animate-fadeIn">
      <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
        <Sparkles className="text-violet-400" size={18} />
        <div>
          <h2 className="text-lg font-bold text-slate-100">Update Profile details</h2>
          <p className="text-[10px] text-slate-500">Add credentials to recalculate AI matching readiness</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 mb-1">Full Name</label>
            <div className="relative">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-dark pl-9 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Professional Title</label>
            <div className="relative">
              <Briefcase size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="input-dark pl-9 py-2"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 mb-1">Years of Experience</label>
            <div className="relative">
              <Award size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="number"
                step="0.5"
                value={experience}
                onChange={e => setExperience(e.target.value)}
                className="input-dark pl-9 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Certifications (comma separated)</label>
            <div className="relative">
              <Sparkles size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={certsStr}
                onChange={e => setCertsStr(e.target.value)}
                placeholder="AWS Certified Practitioner, CKA"
                className="input-dark pl-9 py-2"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Skills (comma separated)</label>
          <input
            type="text"
            value={skillsStr}
            onChange={e => setSkillsStr(e.target.value)}
            placeholder="React, Javascript, Python, FastAPI"
            className="input-dark py-2"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 mb-1">GitHub URL</label>
            <div className="relative">
              <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="url"
                value={github}
                onChange={e => setGithub(e.target.value)}
                placeholder="https://github.com/..."
                className="input-dark pl-9 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">LinkedIn URL</label>
            <div className="relative">
              <Link size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="url"
                value={linkedin}
                onChange={e => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="input-dark pl-9 py-2"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-xs mt-4"
        >
          <Save size={13} />
          Save Changes
        </button>
      </form>
    </div>
  );
}
