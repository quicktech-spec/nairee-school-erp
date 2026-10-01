import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  CheckSquare, 
  Award, 
  Receipt, 
  BookOpen, 
  Sparkles,
  School
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, activeRole }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, badge: null, roles: ['admin', 'faculty'] },
    { id: 'portal', label: "Nairee's Portal", icon: Sparkles, badge: 'Active', roles: ['student', 'admin', 'faculty'] },
    { id: 'students', label: 'Students Directory', icon: Users, badge: 'tabStudent', roles: ['admin', 'faculty'] },
    { id: 'attendance', label: 'Attendance Tool', icon: CheckSquare, badge: 'Tool', roles: ['admin', 'faculty'] },
    { id: 'schedule', label: 'Course Timetable', icon: CalendarDays, badge: 'Weekly', roles: ['admin', 'faculty', 'student'] },
    { id: 'gradebook', label: 'Gradebook & Exams', icon: Award, badge: 'tabResults', roles: ['admin', 'faculty', 'student'] },
    { id: 'fees', label: 'Fee Management', icon: Receipt, badge: 'tabFees', roles: ['admin', 'faculty', 'student'] },
  ];

  // Filter based on role
  const visibleItems = menuItems.filter(item => item.roles.includes(activeRole));

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        {/* Workspace indicator */}
        <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-100 text-brand-700">
            <School className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-800 truncate">Academic Session</p>
            <p className="text-[11px] text-slate-500 font-medium">2026-2027 • Term 1</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Modules & Workflows
          </p>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive 
                        ? 'bg-brand-700 text-brand-100' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
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
      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 px-3">
        <p className="font-semibold text-slate-600">Frappe Education Core</p>
        <p className="mt-0.5">SQLite Mirror Engine</p>
        <div className="mt-2 flex items-center gap-1.5 text-emerald-600 font-medium text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Windows & Android Ready
        </div>
      </div>
    </aside>
  );
}
