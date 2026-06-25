import React from 'react';
import { Activity, Users, Cpu, Wifi, WifiOff, BarChart2, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ backendStatus, stats, activePage, onPageChange }) {
  const isOnline = backendStatus?.status === 'ok';
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo + tagline */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onPageChange('landing')}>
              <div className="relative w-9 h-9 rounded-xl flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg,#0d9488,#7c3aed)' }}>
                <span className="text-lg">🔮</span>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950"
                     style={{ display: isOnline ? 'block' : 'none' }} />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text leading-none">Prism</h1>
                <div className="text-[10px] text-slate-500 leading-none mt-0.5 font-mono">AI RECRUITER</div>
              </div>
            </div>

            {/* Nav - Only show when authenticated and role is recruiter or admin */}
            {isAuthenticated && (user.role === 'recruiter' || user.role === 'admin') && (
              <nav className="hidden sm:flex ml-4 gap-1">
                {[
                  { id: 'dashboard', label: 'Dashboard',      icon: <BarChart2 size={14}/> },
                  { id: 'pool',      label: 'Candidate Pool', icon: <Users size={14}/>     },
                  { id: 'analytics', label: 'Analytics',      icon: <Activity size={14}/>  },
                  { id: 'history',   label: 'Run History',    icon: <Cpu size={14}/>       },
                ].map(({ id, label, icon }) => (
                  <button key={id}
                          onClick={() => onPageChange(id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                            ${activePage === id
                              ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                    {icon}{label}
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* Right side stats + status */}
          <div className="flex items-center gap-3">
            {/* Stats chips */}
            {isAuthenticated && stats && (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/40">
                  <Users size={12} className="text-teal-400" />
                  <span className="text-xs text-slate-400 font-mono">
                    {stats.total_candidates?.toLocaleString() ?? '—'} candidates
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/40">
                  <Cpu size={12} className="text-purple-400" />
                  <span className="text-xs text-slate-400 font-mono">
                    {stats.vectors_indexed?.toLocaleString() ?? '—'} vectors
                  </span>
                </div>
              </div>
            )}

            {/* Backend status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-300
              ${isOnline
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {isOnline
                ? <><span className="status-online"/><span className="hidden sm:block">Connected</span></>
                : <><WifiOff size={12}/><span className="hidden sm:block">Offline</span></>}
            </div>

            {/* User profile dropdown / logout */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                <div className="flex flex-col text-right hidden sm:block">
                  <span className="text-xs font-medium text-slate-200">{user.name}</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider">{user.role}</span>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onPageChange('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
              >
                <User size={12} />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
