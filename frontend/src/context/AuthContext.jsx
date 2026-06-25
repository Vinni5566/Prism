import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const DEMO_USERS = {
  'recruiter@prism.ai': { password: 'demo123', role: 'recruiter', name: 'Alex Chen', company: 'TechHire Inc.' },
  'candidate@prism.ai': { password: 'demo123', role: 'candidate', name: 'Jordan Smith', title: 'Software Engineer' },
  'admin@prism.ai':     { password: 'demo123', role: 'admin',     name: 'Sam Rivera', level: 'Super Admin' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('prism_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const login = useCallback((email, password) => {
    const match = DEMO_USERS[email.toLowerCase()];
    if (!match || match.password !== password) {
      throw new Error('Invalid credentials. Use demo accounts below.');
    }
    const userData = {
      email,
      role: match.role,
      name: match.name,
      company: match.company,
      title: match.title,
      level: match.level,
      token: `prism_mock_${Date.now()}`,
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem('prism_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback((name, email, password, role) => {
    const userData = {
      email,
      role,
      name,
      token: `prism_mock_${Date.now()}`,
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem('prism_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('prism_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
