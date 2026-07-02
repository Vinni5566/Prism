import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Return custom login message or handle redirect
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="glass rounded-3xl p-8 max-w-sm border border-white/10">
          <Lock size={48} className="mx-auto mb-4 text-slate-400" />
          <h2 className="text-xl font-bold text-slate-100 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-500 mb-6">
            Please sign in to view this page.
          </p>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="glass rounded-3xl p-8 max-w-sm border border-white/10">
          <ShieldAlert size={48} className="mx-auto mb-4 text-slate-400" />
          <h2 className="text-xl font-bold text-slate-100 mb-2">Permission Required</h2>
          <p className="text-sm text-slate-500 mb-6">
            This section is restricted to {allowedRoles.join(', ')} users only.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
