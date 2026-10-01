import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import DashboardView from './components/DashboardView.jsx';
import StudentsView from './components/StudentsView.jsx';
import AttendanceView from './components/AttendanceView.jsx';
import TimetableScheduleView from './components/TimetableScheduleView.jsx';
import GradebookView from './components/GradebookView.jsx';
import FeesView from './components/FeesView.jsx';
import StudentPortalView from './components/StudentPortalView.jsx';
import { api } from './api.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeRole, setActiveRole] = useState('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);

  const loadStats = () => {
    api.getDashboardStats().then(setStats).catch(console.error);
  };

  useEffect(() => {
    loadStats();
  }, []);

  // When role changes, set sensible default tab
  const handleRoleChange = (newRole) => {
    setActiveRole(newRole);
    if (newRole === 'student') {
      setActiveTab('portal');
    } else if (newRole === 'faculty') {
      setActiveTab('attendance');
    } else {
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeRole={activeRole}
        setActiveRole={handleRoleChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Body */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeRole={activeRole}
        />

        {/* Content View Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView stats={stats} onNavigate={setActiveTab} />
          )}

          {activeTab === 'portal' && (
            <StudentPortalView onNavigate={setActiveTab} />
          )}

          {activeTab === 'students' && (
            <StudentsView
              searchQuery={searchQuery}
              onSelectStudentPortal={() => {
                setActiveRole('student');
                setActiveTab('portal');
              }}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView onAttendanceSaved={loadStats} />
          )}

          {activeTab === 'schedule' && (
            <TimetableScheduleView />
          )}

          {activeTab === 'gradebook' && (
            <GradebookView />
          )}

          {activeTab === 'fees' && (
            <FeesView onPaymentCompleted={loadStats} />
          )}
        </main>
      </div>
    </div>
  );
}
