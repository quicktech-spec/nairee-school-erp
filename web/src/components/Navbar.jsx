import React from 'react';
import { 
  GraduationCap, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  Sparkles,
  ChevronDown,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function Navbar({ activeRole, setActiveRole, searchQuery, setSearchQuery }) {
  const roles = [
    { id: 'admin', label: 'Principal / Admin', icon: ShieldCheck, desc: 'Institutional oversight & finance' },
    { id: 'faculty', label: 'Faculty / Teacher', icon: UserCheck, desc: 'Attendance & Gradebook tools' },
    { id: 'student', label: 'Student Portal (Nairee)', icon: Sparkles, desc: 'ID Pass, Timetable & Fees' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#cde8e8] px-6 py-3.5">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: SwiftCampus Branding */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-swift-electric flex items-center justify-center shadow-swift-teal text-white">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-swift-dark">
                Swift<span className="text-brand-600">Campus</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                <span className="badge-dot"></span>
                School ERP
              </span>
            </div>
            <p className="text-xs text-swift-muted font-medium">Nairee International Campus</p>
          </div>
        </div>

        {/* Middle: SwiftCampus Quick Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-swift-muted" />
            <input
              type="text"
              placeholder="Search student roll, courses, fee vouchers, or schedule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#edfafa] border border-[#cde8e8] text-swift-dark placeholder:text-swift-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right: Role Switcher & Live API Status */}
        <div className="flex items-center gap-3">
          {/* Live System Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
            <span className="badge-dot"></span>
            <span>API Connected :5000</span>
          </div>

          {/* Role Switcher Dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#edfafa] hover:bg-[#d5f5f5] border border-[#cde8e8] cursor-pointer transition-all">
              <div className="w-2 h-2 rounded-full bg-brand-600"></div>
              <div className="text-left">
                <p className="text-[9px] text-swift-muted font-bold uppercase leading-none">Perspective</p>
                <p className="text-xs font-bold text-swift-dark flex items-center gap-1.5 mt-0.5">
                  {roles.find(r => r.id === activeRole)?.label}
                  <ChevronDown className="w-3 h-3 text-swift-muted" />
                </p>
              </div>
            </div>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-swift-lg border border-[#cde8e8] py-2 hidden group-hover:block animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-swift-dark">Switch User Role</p>
                <p className="text-[11px] text-swift-muted">Experience full school workflows</p>
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
                          : 'hover:bg-slate-50 text-swift-dark'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-brand-600 text-white' : 'bg-[#edfafa] text-brand-700'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{r.label}</p>
                        <p className="text-[11px] text-swift-muted">{r.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* User Profile Avatar */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
              alt="Profile"
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-brand-500/30"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-brand-500 border-2 border-white rounded-full"></span>
          </div>
        </div>
      </div>
    </header>
  );
}
