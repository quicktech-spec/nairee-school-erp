import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage.jsx';
import Navbar from './components/Navbar.jsx';
import AdminPortalView from './components/AdminPortalView.jsx';
import TeacherPortalView from './components/TeacherPortalView.jsx';
import StudentPortalView from './components/StudentPortalView.jsx';
import ParentPortalView from './components/ParentPortalView.jsx';
import CommandPaletteModal from './components/CommandPaletteModal.jsx';
import { api } from './api.js';

export default function App() {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nairee_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('nairee_user', JSON.stringify(user));
      if (token) localStorage.setItem('nairee_token', token);
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('nairee_user');
      localStorage.removeItem('nairee_token');
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  };

  const handleSwitchUser = async (username, password) => {
    try {
      const data = await api.login(username, password);
      handleLoginSuccess(data.user, data.token);
    } catch (err) {
      console.error('Failed to switch user:', err);
    }
  };

  // If not logged in, show the single universal homepage & login page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Once authenticated, route strictly to the user's role-dedicated portal
  return (
    <div className="min-h-screen bg-[#f4fafa] flex flex-col font-sans text-[#1e3a42]">
      {/* Top Universal Navbar with Active User Profile & Sign Out */}
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        onOpenPalette={() => setIsPaletteOpen(true)}
      />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPaletteModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onNavigate={(tab) => {
          // If in admin portal or generic navigation, trigger custom event or scroll
          window.dispatchEvent(new CustomEvent('nairee_navigate', { detail: tab }));
        }}
        onSwitchUser={handleSwitchUser}
        currentRole={currentUser.role}
      />

      {/* Scoped Role Portal View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {currentUser.role === 'admin' && (
          <AdminPortalView user={currentUser} />
        )}

        {currentUser.role === 'teacher' && (
          <TeacherPortalView user={currentUser} />
        )}

        {currentUser.role === 'student' && (
          <StudentPortalView user={currentUser} />
        )}

        {currentUser.role === 'parent' && (
          <ParentPortalView user={currentUser} />
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-[#cde8e8] py-4 px-6 text-center text-xs text-slate-500 bg-white/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Nairee &bull; School ERP</span>
          <span className="text-[11px] text-teal-700 font-semibold">
            Logged in as {currentUser.full_name} ({currentUser.role.toUpperCase()})
          </span>
        </div>
      </footer>
    </div>
  );
}
