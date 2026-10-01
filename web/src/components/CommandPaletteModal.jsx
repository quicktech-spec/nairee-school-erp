import React, { useState, useEffect } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  CalendarDays, 
  Award, 
  Receipt, 
  Sparkles, 
  Shield, 
  BookOpen, 
  Printer, 
  ArrowRight,
  X
} from 'lucide-react';

export default function CommandPaletteModal({ isOpen, onClose, onNavigate, onSwitchUser, currentRole }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    // Navigation Modules
    { id: 'dashboard', title: 'Go to Campus Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => { onNavigate('dashboard'); onClose(); } },
    { id: 'portal', title: "Go to Nairee's Student Portal", category: 'Navigation', icon: Sparkles, action: () => { onNavigate('portal'); onClose(); } },
    { id: 'attendance', title: 'Open Daily Attendance Tool', category: 'Navigation', icon: CheckSquare, action: () => { onNavigate('attendance'); onClose(); } },
    { id: 'schedule', title: 'Open Smart AI Timetable', category: 'Navigation', icon: CalendarDays, action: () => { onNavigate('schedule'); onClose(); } },
    { id: 'gradebook', title: 'Open Exam Results & Gradebook', category: 'Navigation', icon: Award, action: () => { onNavigate('gradebook'); onClose(); } },
    { id: 'fees', title: 'Open Fee Management & Collections', category: 'Navigation', icon: Receipt, action: () => { onNavigate('fees'); onClose(); } },
    { id: 'students', title: 'Open Student Admissions Roster', category: 'Navigation', icon: Users, action: () => { onNavigate('students'); onClose(); } },
    
    // Quick Role Switches
    { id: 'switch-admin', title: 'Switch Persona: Principal / Admin', category: 'Quick Role Switch', icon: Shield, action: () => { onSwitchUser('admin', 'admin123'); onClose(); } },
    { id: 'switch-teacher', title: 'Switch Persona: Prof. Sarah Jenkins (Teacher)', category: 'Quick Role Switch', icon: BookOpen, action: () => { onSwitchUser('teacher_jenkins', 'teacher123'); onClose(); } },
    { id: 'switch-student', title: 'Switch Persona: Nairee Patel (Student)', category: 'Quick Role Switch', icon: Sparkles, action: () => { onSwitchUser('nairee', 'student123'); onClose(); } },
    { id: 'switch-parent', title: 'Switch Persona: Rajesh Patel (Parent)', category: 'Quick Role Switch', icon: Users, action: () => { onSwitchUser('parent_patel', 'parent123'); onClose(); } },
    
    // Workload Actions
    { id: 'print-page', title: 'Print Current Screen / Official Document (Ctrl+P)', category: 'Productivity', icon: Printer, action: () => { window.print(); onClose(); } },
  ];

  const filtered = actions.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-teal-100 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-teal-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, module, student name, or role... (ESC to close)"
            className="w-full text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-50 flex-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching commands or actions found. Try "Attendance", "Fees", or "Teacher".
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full px-4 py-3 rounded-2xl flex items-center justify-between text-left hover:bg-teal-50/60 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-teal-900 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-600 font-bold">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-600 font-bold">K</kbd> anywhere to open</span>
          <span className="font-semibold text-teal-700">Nairee Power Tools</span>
        </div>
      </div>
    </div>
  );
}
