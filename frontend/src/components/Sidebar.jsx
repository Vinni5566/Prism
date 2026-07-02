import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2, Users, Activity, Cpu, Shield, Layers, LogOut,
  ChevronLeft, ChevronRight, Settings, HelpCircle, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activePage, onPageChange, onNavigate }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart2 size={18} />, roles: ['recruiter'] },
    { id: 'pool', label: 'Candidate Pool', icon: <Users size={18} />, roles: ['recruiter'] },
    { id: 'analytics', label: 'Analytics', icon: <Activity size={18} />, roles: ['recruiter'] },
    { id: 'history', label: 'Run History', icon: <Cpu size={18} />, roles: ['recruiter'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <motion.aside
      animate={{ width: isCollapsed ? '72px' : '260px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="sticky top-0 h-screen glass border-r border-white/5 flex flex-col justify-between z-40 overflow-visible"
    >
      <div>
        {/* Logo / Header */}
        <div className={`h-[72px] flex items-center px-4 border-b border-white/5 relative`}>
          {/* Clickable Logo */}
          <div
            className="flex items-center gap-3 overflow-hidden cursor-pointer group flex-1"
            onClick={() => onNavigate?.('landing')}
          >
            <img src="/logo.jpg" alt="Prism Logo" className="w-7 h-7 object-contain flex-shrink-0 shadow-lg rounded-md group-hover:opacity-80 transition-opacity" />
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-shrink-0 whitespace-nowrap">
                <div className="text-lg font-black gradient-text leading-none mb-0.5 group-hover:opacity-80 transition-opacity">Prism</div>
                <div className="text-[9px] text-slate-500 font-mono leading-none tracking-widest">AI RECRUITER</div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Collapse Toggle — positioned outside header to avoid clip */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-[52px] w-7 h-7 rounded-full bg-slate-800 border border-white/10 shadow-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all hidden sm:flex z-50"
        >
          {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        {/* User Card */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold flex-shrink-0">
              {user?.name ? user.name[0].toUpperCase() : <User size={16} />}
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="overflow-hidden"
              >
                <h4 className="text-xs font-semibold text-slate-200 truncate">{user?.name}</h4>
                <p className="text-[10px] text-slate-500 truncate">{user?.company || 'Prism Demo'}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                activePage === item.id
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className={activePage === item.id ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Footer items */}
      <div className="p-3 border-t border-white/5 space-y-1">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all group"
        >
          <LogOut size={18} className="text-slate-500 group-hover:text-red-400" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
