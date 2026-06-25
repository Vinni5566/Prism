import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Shield, Star, BookOpen, AlertCircle, ArrowUpRight,
  TrendingUp, Award, Layers, Globe, Compass, ExternalLink
} from 'lucide-react';
import ProgressRing from '../../components/ProgressRing';
import ResumeAnalyzer from './ResumeAnalyzer';
import ProfileBuilder from './ProfileBuilder';

export default function CandidateHome() {
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'builder' | 'resume'
  
  // Mock candidate profile data (tied to candidate@prism.ai)
  const [profile, setProfile] = useState({
    name: 'Jordan Smith',
    title: 'Software Engineer',
    skills: ['React', 'JavaScript', 'Node.js', 'Git', 'HTML5', 'CSS3'],
    experienceYears: 2.5,
    education: [{ degree: 'B.Tech Computer Science', school: 'Delhi Technological University', year: '2023' }],
    certifications: ['AWS Certified Cloud Practitioner'],
    github: 'https://github.com/jordansmith-demo',
    linkedin: 'https://linkedin.com/in/jordansmith-demo',
  });

  const [scores, setScores] = useState({
    profileCompletion: 65,
    resumeScore: 78,
    interviewReadiness: 72,
    marketReadiness: 80,
  });

  const missingSkills = ['TypeScript', 'Docker', 'FastAPI', 'PostgreSQL'];
  
  const recommendations = {
    projects: [
      { name: 'Serverless REST API', desc: 'Build an API using AWS Lambda, API Gateway, and DynamoDB.', skill: 'AWS' },
      { name: 'Dockerized Microservices', desc: 'Containerize a Node.js and Python FastAPI app with Docker Compose.', skill: 'Docker' }
    ],
    certifications: [
      { name: 'AWS Certified Developer - Associate', provider: 'Amazon Web Services' },
      { name: 'Docker Certified Associate (DCA)', provider: 'Docker' }
    ]
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    // Dynamically increase completion score
    const newCompletion = Math.min(100, scores.profileCompletion + 15);
    setScores(prev => ({ ...prev, profileCompletion: newCompletion }));
    setActiveSubTab('overview');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass rounded-3xl p-6 md:p-8 border border-white/5 bg-gradient-to-r from-violet-500/10 via-slate-900 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-[radial-gradient(circle_at_right,rgba(139,92,246,0.15)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/25 text-[10px] text-violet-400 font-bold uppercase tracking-wider">
              <Star size={11} className="fill-violet-400" /> Candidate Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-100">Welcome, {profile.name}</h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Track your profile metrics, analyze resume structure against real job postings, and elevate your interview readiness.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeSubTab === 'overview'
                  ? 'bg-violet-500/20 border-violet-500/40 text-violet-400'
                  : 'border-slate-700/40 text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSubTab('builder')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeSubTab === 'builder'
                  ? 'bg-violet-500/20 border-violet-500/40 text-violet-400'
                  : 'border-slate-700/40 text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              Profile Builder
            </button>
            <button
              onClick={() => setActiveSubTab('resume')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeSubTab === 'resume'
                  ? 'bg-violet-500/20 border-violet-500/40 text-violet-400'
                  : 'border-slate-700/40 text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              Resume Analyzer
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'builder' && (
        <ProfileBuilder profile={profile} onSave={handleProfileUpdate} />
      )}

      {activeSubTab === 'resume' && (
        <ResumeAnalyzer onAnalysisFinished={(score) => {
          setScores(prev => ({ ...prev, resumeScore: score }));
          setActiveSubTab('overview');
        }} />
      )}

      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Visual Metrics & Score Cards */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Visual Progress Rings Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass rounded-2xl p-5 border border-white/5 flex flex-col items-center text-center space-y-3">
                <ProgressRing value={scores.profileCompletion} size={70} strokeWidth={6} color="#8b5cf6" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Profile Completion</h4>
                  <span className="text-[9px] text-slate-500">Completeness metrics</span>
                </div>
              </div>

              <div className="glass rounded-2xl p-5 border border-white/5 flex flex-col items-center text-center space-y-3">
                <ProgressRing value={scores.resumeScore} size={70} strokeWidth={6} color="#14b8a6" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Resume Score</h4>
                  <span className="text-[9px] text-slate-500">Based on parsed PDF</span>
                </div>
              </div>

              <div className="glass rounded-2xl p-5 border border-white/5 flex flex-col items-center text-center space-y-3">
                <ProgressRing value={scores.interviewReadiness} size={70} strokeWidth={6} color="#ec4899" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Interview Readiness</h4>
                  <span className="text-[9px] text-slate-500">Algorithm assessment</span>
                </div>
              </div>

              <div className="glass rounded-2xl p-5 border border-white/5 flex flex-col items-center text-center space-y-3">
                <ProgressRing value={scores.marketReadiness} size={70} strokeWidth={6} color="#3b82f6" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Market Readiness</h4>
                  <span className="text-[9px] text-slate-500">Relative pool scoring</span>
                </div>
              </div>
            </div>

            {/* Recruiter View Simulator */}
            <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass size={13} className="text-violet-400" /> How Recruiters View Your Profile
                </h3>
                <span className="text-[10px] text-slate-500">Prism AI Engine projection</span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Projected AI Explanation</span>
                  <p className="text-slate-300 leading-relaxed italic">
                    "Candidate shows strong execution capabilities in modern Javascript frameworks ({profile.skills.slice(0, 3).join(', ')}). 
                    Tenure suggests rapid growth potential. Would benefit from adding back-end integrations or containerization skills."
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Perceived Strengths</span>
                    <div className="flex flex-wrap gap-1">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">Framework Depth</span>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">Academic Foundation</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Perceived Gaps</span>
                    <div className="flex flex-wrap gap-1">
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px]">Containerization</span>
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px]">API Security</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Projects & Study Pathway */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={13} className="text-teal-400" /> Recommended Projects
                </h4>
                <div className="space-y-2 text-xs">
                  {recommendations.projects.map((proj, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-white/5 p-3 rounded-xl hover:bg-slate-900/60 transition-colors">
                      <div className="flex justify-between items-center font-semibold text-slate-200">
                        <span>{proj.name}</span>
                        <span className="bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded text-[9px] font-mono">{proj.skill}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">{proj.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={13} className="text-pink-400" /> Suggested Certifications
                </h4>
                <div className="space-y-2 text-xs">
                  {recommendations.certifications.map((cert, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-white/5 p-3 rounded-xl hover:bg-slate-900/60 transition-colors">
                      <div className="font-semibold text-slate-200">{cert.name}</div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{cert.provider}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Mini profile summary, links & missing skills */}
          <div className="space-y-6">
            
            {/* Quick Profile Summary */}
            <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-lg font-bold">
                  JS
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{profile.name}</h3>
                  <span className="text-[10px] text-slate-500">{profile.title}</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Experience</span>
                  <span className="font-mono text-slate-200">{profile.experienceYears} years</span>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span>Certs</span>
                  <span className="font-mono text-slate-200">{profile.certifications.length} Active</span>
                </div>

                <div className="flex gap-2.5 pt-2">
                  {profile.github && (
                    <a href={profile.github} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-300">
                      <Globe size={15} />
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-300">
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Skill Inventory & Gaps */}
            <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Current Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {profile.skills.map(s => (
                    <span key={s} className="bg-slate-800 text-slate-300 border border-slate-700/60 px-2 py-0.5 rounded text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/5 pt-3 space-y-2">
                <h4 className="text-xs font-bold text-red-400/80 uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle size={12} /> High-Demand Missing Skills
                </h4>
                <div className="flex flex-wrap gap-1">
                  {missingSkills.map(s => (
                    <span key={s} className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
