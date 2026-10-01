import React from 'react';
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

export default function Navbar({ user, onLogout, onSwitchUser }) {
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

  return (
    <header className="sticky top-0 z-40 bg-[#0c1f2c]/95 backdrop-blur-md border-b border-teal-900/50 px-6 py-3 text-white shadow-lg">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-500 via-teal-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                Nairee <span className="text-teal-400">International</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                Nairee ERP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Single Shared Database &bull; Connected Portals</p>
          </div>
        </div>

        {/* Right: User Profile Pill & Quick Switch / Logout */}
        <div className="flex items-center gap-3">
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
          <div className="relative group">
            <button
              title="Test another role directly"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden md:inline">Switch Role</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Quick Demo Accounts Menu */}
            <div className="absolute right-0 mt-2 w-56 bg-[#122837] rounded-2xl shadow-2xl border border-teal-800/60 py-2 hidden group-hover:block z-50">
              <div className="px-3.5 py-1.5 border-b border-slate-700/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Instant Role Switching (Testing)
              </div>
              <div className="p-1 space-y-1">
                {[
                  { role: 'admin', label: 'Admin (Dr. Vance)', user: 'admin', pass: 'admin123' },
                  { role: 'teacher', label: 'Teacher (Prof. Jenkins)', user: 'teacher_jenkins', pass: 'teacher123' },
                  { role: 'student', label: 'Student (Nairee Patel)', user: 'nairee', pass: 'student123' },
                  { role: 'parent', label: 'Parent (Rajesh Patel)', user: 'parent_patel', pass: 'parent123' }
                ].map((item) => (
                  <button
                    key={item.role}
                    onClick={() => onSwitchUser(item.user, item.pass)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] text-teal-400">&rarr;</span>
                  </button>
                ))}
              </div>
            </div>
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
