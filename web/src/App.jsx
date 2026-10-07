import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage.jsx';
import AppLayout from './components/AppLayout.jsx';
import AdminPortalView from './components/AdminPortalView.jsx';
import TeacherPortalView from './components/TeacherPortalView.jsx';
import StudentPortalView from './components/StudentPortalView.jsx';
import ParentPortalView from './components/ParentPortalView.jsx';
import DatabaseStudioView from './components/DatabaseStudioView.jsx';
import OnlineAdmissionView from './components/OnlineAdmissionView.jsx';
import AdmissionLeadDispatcherModal from './components/AdmissionLeadDispatcherModal.jsx';
import CommandPaletteModal from './components/CommandPaletteModal.jsx';
import TenantOnboardingModal from './components/TenantOnboardingModal.jsx';
import TenantSwitchModal from './components/TenantSwitchModal.jsx';
import { TenantProvider, useTenant } from './context/TenantContext.jsx';
import { api } from './api.js';

function MainApp() {
  const { tenant, isOnboardingModalOpen, setIsOnboardingModalOpen, isSwitchModalOpen, setIsSwitchModalOpen } = useTenant();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isAdmissionDispatcherOpen, setIsAdmissionDispatcherOpen] = useState(false);
  
  // Detect if opened via public admission link (?mode=admission or ?mode=register or #admission)
  const [isAdmissionPublicMode, setIsAdmissionPublicMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search || '';
      const hash = window.location.hash || '';
      return search.includes('mode=admission') || search.includes('mode=register') || hash.includes('admission');
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nairee_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Strict Multi-Tenant Boundary Security Guard:
  // Prevents session bleed across different schools / subdomains
  useEffect(() => {
    if (currentUser && tenant?.tenant_id) {
      const userTenant = currentUser.tenant_id || currentUser.tenant;
      const activeTenantId = tenant.tenant_id;
      const activeSubdomain = tenant.subdomain;

      if (
        userTenant &&
        userTenant !== 'tenant-default' &&
        userTenant !== 'demo' &&
        userTenant !== activeTenantId &&
        userTenant !== activeSubdomain
      ) {
        console.warn(`[Security Guard] Tenant mismatch: User from (${userTenant}) accessed (${activeTenantId}). Clearing session.`);
        setCurrentUser(null);
        try {
          localStorage.removeItem('nairee_user');
          localStorage.removeItem('nairee_token');
        } catch (e) {}
      }
    }
  }, [tenant?.tenant_id, tenant?.subdomain, currentUser]);

  useEffect(() => {
    const handleOpenDispatcher = () => setIsAdmissionDispatcherOpen(true);
    const handleOpenPublicAdmission = () => setIsAdmissionPublicMode(true);
    
    window.addEventListener('nairee_open_admission_dispatcher', handleOpenDispatcher);
    window.addEventListener('nairee_open_public_admission', handleOpenPublicAdmission);
    
    return () => {
      window.removeEventListener('nairee_open_admission_dispatcher', handleOpenDispatcher);
      window.removeEventListener('nairee_open_public_admission', handleOpenPublicAdmission);
    };
  }, []);

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
    setIsAdmissionPublicMode(false);
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

      {/* Global Quick-Lead Admission & WhatsApp Dispatcher Modal */}
      <AdmissionLeadDispatcherModal
        isOpen={isAdmissionDispatcherOpen}
        onClose={() => setIsAdmissionDispatcherOpen(false)}
      />

      {/* Public Online Student Admission & Self-Registration Page */}
      {isAdmissionPublicMode ? (
        <OnlineAdmissionView 
          onBackToLogin={() => setIsAdmissionPublicMode(false)}
          onApplicationSubmitted={() => {
            // Can choose to return or stay on acknowledgment
          }}
        />
      ) : !currentUser ? (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess}
          onOpenAdmissionForm={() => setIsAdmissionPublicMode(true)}
        />
      ) : (
        <div className="min-h-screen bg-[#f4f7fb]">
          {/* Global Command Palette (Ctrl+K) */}
          <CommandPaletteModal
            isOpen={isPaletteOpen}
            onClose={() => setIsPaletteOpen(false)}
            onNavigate={(tab) => {
              if (tab === 'admission_dispatcher') {
                setIsAdmissionDispatcherOpen(true);
              } else if (tab === 'public_admission_form') {
                setIsAdmissionPublicMode(true);
              } else {
                setActiveTab(tab);
                window.dispatchEvent(new CustomEvent('nairee_navigate', { detail: tab }));
              }
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

            {activeTab === 'admissions' && (
              <OnlineAdmissionView onBackToLogin={() => setActiveTab('dashboard')} />
            )}

            {activeTab !== 'database' && activeTab !== 'admissions' && (
              (currentUser?.role || '').toLowerCase() === 'teacher' ? (
                <TeacherPortalView user={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} />
              ) : (currentUser?.role || '').toLowerCase() === 'student' ? (
                <StudentPortalView user={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} />
              ) : (currentUser?.role || '').toLowerCase() === 'parent' ? (
                <ParentPortalView user={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} />
              ) : (
                <AdminPortalView user={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} />
              )
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

