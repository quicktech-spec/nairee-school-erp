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
    <header className="sticky top-0 z-40 bg-[#0c1f2c]/95 backdrop-blur-md border-b border-teal-900/50 px-6 py-3 text-white shadow-lg">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Branding with Official Nairee Logo */}
        <div className="flex items-center gap-3">
          <img 
            src="/nairee-logo-white.png" 
            alt="Nairee" 
            className="h-8 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity" 
          />
          <div className="hidden sm:block pl-3 border-l border-teal-800/60">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                ERP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Single Shared Database &bull; Connected Portals</p>
          </div>
        </div>

        {/* Middle / Right: Quick Command Palette Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPalette}
            className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs text-slate-300 transition-all cursor-pointer shadow-sm group"
          >
            <Search className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform" />
            <span className="text-slate-400 group-hover:text-slate-200">Search commands...</span>
            <kbd className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">Ctrl K</kbd>
          </button>

          {/* Active User Info Card */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate max-w-[140px]">{user?.full_name}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-[10px] text-teal-300 font-mono">@{user?.username}</p>
            </div>
          </div>

          {/* Switch Role Quick Drawer for Testing */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsRoleDropdownOpen(prev => !prev)}
              title="Test another role directly"
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isRoleDropdownOpen 
                  ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-sm' 
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden md:inline">Switch Role</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180 text-teal-400' : ''}`} />
            </button>

            {/* Quick Demo Accounts Menu */}
            {isRoleDropdownOpen && (
              <div className="absolute right-0 top-full pt-1.5 w-64 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="bg-[#122837] rounded-2xl shadow-2xl border border-teal-800/80 p-2 text-white">
                  <div className="px-3 py-1.5 border-b border-slate-700/60 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Instant Role Switch
                    </span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300">
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
                              ? 'bg-teal-500/20 text-teal-200 border border-teal-500/40' 
                              : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold">{item.name}</span>
                              {isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
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
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
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
