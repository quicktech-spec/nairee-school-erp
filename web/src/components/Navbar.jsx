import React, { useState, useEffect, useRef } from 'react';
import { 
  School, 
  Search, 
  ShieldCheck, 
  LogOut, 
  User, 
  ChevronDown,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';

export default function Navbar({ user, onLogout, onSwitchUser, onOpenPalette }) {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin / Principal', bg: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'teacher':
        return { label: 'Teacher / Faculty', bg: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'student':
        return { label: 'Student', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'parent':
        return { label: 'Parent / Guardian', bg: 'bg-amber-100 text-amber-700 border-amber-200' };
      default:
        return { label: role, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const badge = getRoleBadge(user?.role);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#5673ec] via-[#6c8cff] to-[#5673ec] backdrop-blur-md border-b border-indigo-300/40 px-6 py-3 text-white shadow-md">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Branding with Official Nairee Logo */}
        <div className="flex items-center gap-3">
          <img 
            src="/nairee-logo-white.png" 
            alt="Nairee" 
            className="h-8 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity drop-shadow-sm" 
          />
          <div className="hidden sm:block pl-3 border-l border-white/25">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                ERP
              </span>
            </div>
            <p className="text-[11px] text-indigo-100 font-medium">Single Shared Database &bull; Connected Portals</p>
          </div>
        </div>

        {/* Middle / Right: Quick Command Palette Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPalette}
            className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-xs text-white transition-all cursor-pointer shadow-sm group"
          >
            <Search className="w-3.5 h-3.5 text-indigo-100 group-hover:scale-110 transition-transform" />
            <span className="text-indigo-100 group-hover:text-white">Search commands...</span>
            <kbd className="text-[10px] font-mono bg-black/20 px-1.5 py-0.5 rounded border border-white/20 text-indigo-100">Ctrl K</kbd>
          </button>

          {/* Active User Info Card */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-white/15 border border-white/25 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-white text-[#5673ec] flex items-center justify-center font-extrabold text-xs shadow-sm">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate max-w-[140px]">{user?.full_name}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shadow-xs ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-[10px] text-indigo-100 font-mono">@{user?.username}</p>
            </div>
          </div>

          {/* Switch Role Quick Drawer for Testing */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsRoleDropdownOpen(prev => !prev)}
              title="Test another role directly"
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                isRoleDropdownOpen 
                  ? 'bg-white text-[#5673ec] border-white shadow-md' 
                  : 'bg-white/15 hover:bg-white/25 border-white/25 text-white'
              }`}
            >
              <ArrowRightLeft className={`w-3.5 h-3.5 ${isRoleDropdownOpen ? 'text-[#5673ec]' : 'text-indigo-100'}`} />
              <span className="hidden md:inline">Switch Role</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180 text-[#5673ec]' : 'text-indigo-100'}`} />
            </button>

            {/* Quick Demo Accounts Menu */}
            {isRoleDropdownOpen && (
              <div className="absolute right-0 top-full pt-1.5 w-64 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="bg-white rounded-2xl shadow-2xl border border-indigo-100 p-2 text-slate-800">
                  <div className="px-3 py-1.5 border-b border-indigo-50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Instant Role Switch
                    </span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">
                      Testing
                    </span>
                  </div>
                  <div className="p-1 space-y-1 mt-1">
                    {[
                      { role: 'admin', label: 'Admin (Dr. Vance)', name: 'Dr. Marcus Vance', user: 'admin', pass: 'admin123', badgeBg: 'bg-purple-100 text-purple-700' },
                      { role: 'teacher', label: 'Teacher (Prof. Jenkins)', name: 'Prof. Sarah Jenkins', user: 'teacher_jenkins', pass: 'teacher123', badgeBg: 'bg-blue-100 text-blue-700' },
                      { role: 'student', label: 'Student (Nairee Patel)', name: 'Nairee Patel', user: 'nairee', pass: 'student123', badgeBg: 'bg-emerald-100 text-emerald-700' },
                      { role: 'parent', label: 'Parent (Rajesh Patel)', name: 'Rajesh Patel', user: 'parent_patel', pass: 'parent123', badgeBg: 'bg-amber-100 text-amber-700' }
                    ].map((item) => {
                      const isActive = user?.username === item.user;
                      return (
                        <button
                          key={item.role}
                          onClick={() => {
                            onSwitchUser(item.user, item.pass);
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            isActive 
                              ? 'bg-indigo-50 text-[#5673ec] border border-indigo-200' 
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold">{item.name}</span>
                              {isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#5673ec] animate-pulse"></span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-normal">{item.label}</span>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.badgeBg}`}>
                            {item.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-white/15 hover:bg-rose-500 border border-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Sign out of current account"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
