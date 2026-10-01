import React from 'react';
import { 
  GraduationCap, 
  Search, 
  Bell, 
  ShieldCheck, 
  UserCheck, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ activeRole, setActiveRole, searchQuery, setSearchQuery }) {
  const roles = [
    { id: 'admin', label: 'School Admin', icon: ShieldCheck, desc: 'Full institutional control' },
    { id: 'faculty', label: 'Faculty / Teacher', icon: UserCheck, desc: 'Attendance & Gradebook' },
    { id: 'student', label: 'Student (Nairee)', icon: Sparkles, desc: 'Student Portal & Grades' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Branding */}
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-brand-500/25 text-white">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-brand-900 to-indigo-700 bg-clip-text text-transparent">
                Frappe Education
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                v2026.1
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Nairee International School System</p>
          </div>
        </div>

        {/* Middle: Quick Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search students, roll no, courses, or invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100/80 border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Right: Role Switcher & System Status */}
        <div className="flex items-center gap-3">
          {/* Live Backend Connection Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>API Online :5000</span>
          </div>

          {/* Interactive Role Switcher */}
          <div className="relative group">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 cursor-pointer transition-all">
              <div className="w-2 h-2 rounded-full bg-brand-600"></div>
              <div className="text-left">
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Viewing As</p>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  {roles.find(r => r.id === activeRole)?.label}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </p>
              </div>
            </div>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 hidden group-hover:block animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Switch Perspective</p>
                <p className="text-[11px] text-slate-500">Experience Frappe workflows by role</p>
              </div>
              <div className="p-1 space-y-1">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = activeRole === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setActiveRole(r.id)}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                        isSelected 
                          ? 'bg-brand-50 text-brand-900 border border-brand-200' 
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{r.label}</p>
                        <p className="text-[11px] text-slate-500">{r.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* User Avatar */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
              alt="Profile"
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-brand-500/30"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
        </div>
      </div>
    </header>
  );
}
