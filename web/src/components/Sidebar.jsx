import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  CheckSquare, 
  Award, 
  Receipt, 
  Sparkles,
  School,
  Layers,
  Cpu
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, activeRole }) {
  const menuItems = [
    { id: 'dashboard', label: 'Campus Dashboard', icon: LayoutDashboard, badge: 'Overview', roles: ['admin', 'faculty'] },
    { id: 'portal', label: "Nairee's Portal", icon: Sparkles, badge: 'Student ID', roles: ['student', 'admin', 'faculty'] },
    { id: 'students', label: 'Admissions & Students', icon: Users, badge: 'tabStudent', roles: ['admin', 'faculty'] },
    { id: 'attendance', label: 'Attendance System', icon: CheckSquare, badge: 'Live Tool', roles: ['admin', 'faculty'] },
    { id: 'schedule', label: 'AI Timetable', icon: CalendarDays, badge: 'Smart', roles: ['admin', 'faculty', 'student'] },
    { id: 'gradebook', label: 'Exams & Gradebook', icon: Award, badge: 'Grading', roles: ['admin', 'faculty', 'student'] },
    { id: 'fees', label: 'Fee Management', icon: Receipt, badge: 'Finance', roles: ['admin', 'faculty', 'student'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(activeRole));

  return (
    <aside className="w-64 bg-white border-r border-[#cde8e8] p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        {/* SwiftCampus Institute Pill */}
        <div className="px-3.5 py-3 rounded-2xl bg-[#edfafa] border border-[#cde8e8] flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-600 text-white shadow-swift-sm">
            <School className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-swift-dark truncate">Main Campus</p>
            <p className="text-[11px] text-brand-700 font-semibold">Session 2026-27 • K-12</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-extrabold text-swift-muted uppercase tracking-wider mb-2.5">
            ERP Modules
          </p>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-swift-teal'
                    : 'text-swift-body hover:text-swift-dark hover:bg-[#edfafa]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-swift-muted'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isActive 
                        ? 'bg-brand-700/50 text-white' 
                        : 'bg-[#edfafa] text-brand-700 border border-[#cde8e8]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-[#cde8e8] text-[11px] px-3 space-y-1">
        <div className="flex items-center gap-1.5 text-brand-700 font-bold text-xs">
          <Cpu className="w-3.5 h-3.5 text-swift-electric" />
          <span>SwiftCampus ERP Engine</span>
        </div>
        <p className="text-swift-muted text-[10px]">Frappe DocType Schema • SQLite Core</p>
        <div className="pt-2 flex items-center gap-1.5 text-emerald-600 font-semibold text-[10px]">
          <span className="badge-dot !bg-emerald-500"></span>
          <span>Web & Android Companion Sync</span>
        </div>
      </div>
    </aside>
  );
}
