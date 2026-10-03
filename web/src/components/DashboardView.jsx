import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  IndianRupee, 
  BookOpen, 
  Calendar, 
  ArrowUpRight, 
  Clock, 
  CheckSquare, 
  Award, 
  Sparkles,
  UserPlus,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Layers,
  Cpu
} from 'lucide-react';

export default function DashboardView({ stats, onNavigate }) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const { students = 0, batches = 0, faculty = 0, courses = 0, attendanceRate = 0, finance = {}, recentAssessments = [], recentAttendance = [] } = stats;

  return (
    <div className="space-y-8">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-[#cde8e8] p-8 md:p-10 shadow-swift-card">
        {/* Subtle background gradient & dots */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-brand-100/60 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          {/* Pill Badge with Pulsing Dot */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="badge-dot"></span>
            School ERP • Flagship Campus System
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-swift-dark leading-tight">
            Run your entire school<br />
            from <span className="text-brand-600">one dashboard.</span>
          </h1>

          <p className="mt-4 text-swift-body text-sm sm:text-base leading-relaxed">
            Nairee gives principals, teachers, parents, and students a single connected platform, powered by Frappe Education workflows, built natively for Windows and Android.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('attendance')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-swift-teal transition-all cursor-pointer"
            >
              <span>Take Daily Attendance →</span>
            </button>
            <button
              onClick={() => onNavigate('students')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#edfafa] hover:bg-[#d5f5f5] border border-[#cde8e8] text-swift-dark font-bold text-xs transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-brand-600" />
              <span>Student Directory</span>
            </button>
            <button
              onClick={() => onNavigate('portal')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-50 to-swift-soft border border-brand-300 text-brand-800 font-extrabold text-xs transition-all cursor-pointer hover:shadow-swift-sm"
            >
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Nairee's Portal View</span>
            </button>
          </div>

          {/* Nairee Hero Stats Counter Strip */}
          <div className="mt-8 pt-6 border-t border-[#cde8e8] grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-600">50K+</div>
              <div className="text-xs text-swift-muted font-medium mt-0.5">Students Managed</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-swift-dark">100%</div>
              <div className="text-xs text-swift-muted font-medium mt-0.5">Frappe Workflows</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-swift-dark">{attendanceRate}%</div>
              <div className="text-xs text-swift-muted font-medium mt-0.5">Average Attendance</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-swift-dark">99.9%</div>
              <div className="text-xs text-swift-muted font-medium mt-0.5">Real-time Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Nairee Group Dashboard Section (.grp-shell style) ── */}
      <div className="bg-white rounded-3xl border border-[#cde8e8] overflow-hidden shadow-swift-md">
        {/* Topbar gradient */}
        <div className="bg-gradient-to-r from-swift-dark via-brand-900 to-brand-700 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-swift-electric" />
            <div>
              <h3 className="text-sm font-bold text-white leading-none">Campus Multi-Batch Academic Monitor</h3>
              <p className="text-[11px] text-brand-200 mt-1">Live metrics across Grade 10-A, 10-B, and 11-A</p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold bg-white/10 px-3 py-1 rounded-full border border-white/15">
            Frappe DocType: tabStudentBatch
          </span>
        </div>

        {/* Nairee Integrated KPI Row (.grp-kpi-row) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#cde8e8] bg-white border-b border-[#cde8e8]">
          <div className="p-5 text-center">
            <p className="text-2xl font-extrabold text-brand-600">{students}</p>
            <p className="text-xs text-swift-muted font-semibold mt-1">Enrolled Students</p>
          </div>
          <div className="p-5 text-center">
            <p className="text-2xl font-extrabold text-brand-600">{attendanceRate}%</p>
            <p className="text-xs text-swift-muted font-semibold mt-1">Daily Attendance</p>
          </div>
          <div className="p-5 text-center">
            <p className="text-2xl font-extrabold text-brand-600">₹{(finance.totalCollected || 0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-swift-muted font-semibold mt-1">Fees Collected ({finance.collectionRate || 0}%)</p>
          </div>
          <div className="p-5 text-center">
            <p className="text-2xl font-extrabold text-brand-600">{faculty}</p>
            <p className="text-xs text-swift-muted font-semibold mt-1">Academic Professors</p>
          </div>
        </div>

        {/* Batch Progress Cards (.branch-cards style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-[#edfafa]/50">
          {/* Grade 10-A Honors */}
          <div className="p-4 rounded-2xl bg-white border border-[#cde8e8] shadow-swift-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-swift-dark">Grade 10-A (Honors) • STEM</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                98% Attendance
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-swift-muted">
                <span className="w-16">Attendance</span>
                <div className="flex-1 h-2 bg-[#edfafa] rounded-full overflow-hidden border border-[#cde8e8]">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: '98%' }}></div>
                </div>
                <span className="font-bold text-swift-dark">98%</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-swift-muted">
                <span className="w-16">Academics</span>
                <div className="flex-1 h-2 bg-[#edfafa] rounded-full overflow-hidden border border-[#cde8e8]">
                  <div className="h-full bg-swift-electric rounded-full" style={{ width: '94%' }}></div>
                </div>
                <span className="font-bold text-swift-dark">94%</span>
              </div>
            </div>
          </div>

          {/* Grade 10-B Standard */}
          <div className="p-4 rounded-2xl bg-white border border-[#cde8e8] shadow-swift-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-swift-dark">Grade 10-B (Standard) • High School</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
                85% Attendance
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-swift-muted">
                <span className="w-16">Attendance</span>
                <div className="flex-1 h-2 bg-[#edfafa] rounded-full overflow-hidden border border-[#cde8e8]">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="font-bold text-swift-dark">85%</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-swift-muted">
                <span className="w-16">Academics</span>
                <div className="flex-1 h-2 bg-[#edfafa] rounded-full overflow-hidden border border-[#cde8e8]">
                  <div className="h-full bg-swift-electric rounded-full" style={{ width: '88%' }}></div>
                </div>
                <span className="font-bold text-swift-dark">88%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Nairee 6-Card Module Grid (.module-grid & .mod style) ── */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="badge-dot inline-block mb-1"></span>
          <h2 className="text-2xl font-extrabold text-swift-dark">Comprehensive School Modules</h2>
          <p className="text-xs text-swift-muted mt-1">Everything needed to run the institution smoothly</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              tab: 'students',
              title: 'Admissions & Students',
              desc: 'Complete student lifecycle with Frappe DocType schema, guardian linking, and bio records.',
              icon: Users,
              color: '#0d9488'
            },
            {
              tab: 'attendance',
              title: 'Attendance Automation',
              desc: 'Rapid bulk attendance tool with one-click marking, absence SMS triggers, and percentage counters.',
              icon: CheckSquare,
              color: '#10b981'
            },
            {
              tab: 'schedule',
              title: 'AI Timetable Scheduling',
              desc: 'Smart weekly classroom and teacher matrix avoiding time slot and laboratory conflicts.',
              icon: Calendar,
              color: '#06b6d4'
            },
            {
              tab: 'gradebook',
              title: 'Examinations & Report Cards',
              desc: 'Exam weightage plans, score recording, automated GPA calculation, and distinction rankings.',
              icon: Award,
              color: '#f59e0b'
            },
            {
              tab: 'fees',
              title: 'Fee Management & Collections',
              desc: 'Itemized fee components, payment gateway receipts, and automated outstanding balance tracking.',
              icon: CreditCard,
              color: '#4f46e5'
            },
            {
              tab: 'portal',
              title: 'Student & Parent Companion',
              desc: 'Personalized digital student ID pass, daily schedule timeline, and mobile payment actions.',
              icon: Smartphone,
              color: '#0d9488'
            }
          ].map((mod, i) => {
            const Icon = mod.icon;
            return (
              <div
                key={i}
                onClick={() => onNavigate(mod.tab)}
                className="p-6 rounded-2xl bg-white border border-[#cde8e8] shadow-swift-card hover:border-brand-400 hover:-translate-y-1 hover:shadow-swift-teal transition-all cursor-pointer group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3 shadow-swift-sm"
                  style={{ backgroundColor: mod.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-swift-dark group-hover:text-brand-600 transition-colors">
                  {mod.title}
                </h4>
                <p className="text-xs text-swift-muted mt-2 leading-relaxed">
                  {mod.desc}
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-brand-600 group-hover:translate-x-1 transition-transform">
                  <span>Open Module</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Nairee Integrations Strip (.int-strip & .int-chip style) ── */}
      <div className="p-6 rounded-2xl bg-white border border-[#cde8e8] text-center shadow-swift-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-swift-muted">
          Platform Architecture & Standards
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
          {[
            'Frappe DocType Engine',
            'SQLite Embedded Storage',
            'React Native Android App',
            'Stripe & Card Payments',
            'Bulk Attendance Tool',
            'Automated Grade Reports',
            'Full Windows Native Support'
          ].map((chip, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#edfafa] border border-[#cde8e8] text-xs font-semibold text-swift-body hover:bg-brand-50 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
              <span>{chip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
