import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage.jsx';
import AppLayout from './components/AppLayout.jsx';
import AdminPortalView from './components/AdminPortalView.jsx';
import TeacherPortalView from './components/TeacherPortalView.jsx';
import StudentPortalView from './components/StudentPortalView.jsx';
import ParentPortalView from './components/ParentPortalView.jsx';
import DatabaseStudioView from './components/DatabaseStudioView.jsx';
import CommandPaletteModal from './components/CommandPaletteModal.jsx';
import TenantOnboardingModal from './components/TenantOnboardingModal.jsx';
import TenantSwitchModal from './components/TenantSwitchModal.jsx';
import { TenantProvider, useTenant } from './context/TenantContext.jsx';
import { api } from './api.js';

function MainApp() {
  const { isOnboardingModalOpen, setIsOnboardingModalOpen, isSwitchModalOpen, setIsSwitchModalOpen } = useTenant();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
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
    setActiveTab('dashboard');
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

  return (
    <>
      {/* Global White-Label Onboarding Wizard Modal */}
      <TenantOnboardingModal 
        isOpen={isOnboardingModalOpen} 
        onClose={() => setIsOnboardingModalOpen(false)} 
      />

      {/* Global Multi-Tenant Switcher Modal */}
      <TenantSwitchModal 
        isOpen={isSwitchModalOpen} 
        onClose={() => setIsSwitchModalOpen(false)} 
        onOpenOnboarding={() => setIsOnboardingModalOpen(true)} 
      />

      {/* If not logged in, show the universal white-label login page */}
      {!currentUser ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="min-h-screen bg-[#f4f7fb]">
          {/* Global Command Palette (Ctrl+K) */}
          <CommandPaletteModal
            isOpen={isPaletteOpen}
            onClose={() => setIsPaletteOpen(false)}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.dispatchEvent(new CustomEvent('nairee_navigate', { detail: tab }));
            }}
            onSwitchUser={handleSwitchUser}
            currentRole={currentUser.role}
          />

          {/* Main ERP Layout matching media_1790867008790.png */}
          <AppLayout
            user={currentUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            onSwitchUser={handleSwitchUser}
            onOpenPalette={() => setIsPaletteOpen(true)}
          >
            {activeTab === 'database' && (
              <DatabaseStudioView />
            )}

            {activeTab !== 'database' && currentUser.role === 'admin' && (
              <AdminPortalView user={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} />
            )}

            {activeTab !== 'database' && currentUser.role === 'teacher' && (
              <TeacherPortalView user={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} />
            )}

            {activeTab !== 'database' && currentUser.role === 'student' && (
              <StudentPortalView user={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} />
            )}

            {activeTab !== 'database' && currentUser.role === 'parent' && (
              <ParentPortalView user={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} />
            )}
          </AppLayout>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <TenantProvider>
      <MainApp />
    </TenantProvider>
  );
}

