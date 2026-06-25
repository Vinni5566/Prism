import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2, Users, Activity, Cpu, Shield, Layers, LogOut,
  ChevronLeft, ChevronRight, Settings, HelpCircle, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activePage, onPageChange }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart2 size={18} />, roles: ['recruiter', 'admin'] },
    { id: 'pool', label: 'Candidate Pool', icon: <Users size={18} />, roles: ['recruiter', 'admin'] },
    { id: 'analytics', label: 'Analytics', icon: <Activity size={18} />, roles: ['recruiter', 'admin'] },
    { id: 'history', label: 'Run History', icon: <Cpu size={18} />, roles: ['recruiter', 'admin'] },
    { id: 'integrations', label: 'Integrations', icon: <Layers size={18} />, roles: ['recruiter', 'admin'] },
    { id: 'admin', label: 'Admin Portal', icon: <Shield size={18} />, roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <motion.aside
      animate={{ width: isCollapsed ? '72px' : '260px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="sticky top-0 h-screen glass border-r border-white/5 flex flex-col justify-between z-40"
    >
      <div>
        {/* Logo / Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-teal-500 to-purple-600 text-white font-bold">
                  🔮
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-100 leading-none">Prism AI</h2>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">RECRUITER</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-teal-500 to-purple-600 text-white font-bold mx-auto">
              🔮
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all ml-auto hidden sm:block"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

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
