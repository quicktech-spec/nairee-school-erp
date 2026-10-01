import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  DollarSign, 
  BookOpen, 
  Calendar, 
  ArrowUpRight, 
  Clock, 
  CheckSquare, 
  Award, 
  TrendingUp,
  CreditCard,
  UserPlus
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
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-200 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
            Academic Term 2026-2027 Active
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Nairee International School
          </h1>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Welcome to the centralized Frappe Education Management System. Seamlessly orchestrating student records, timetable schedules, attendance, assessments, and fee management across Windows & Android.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('attendance')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs shadow-lg shadow-brand-500/30 transition-all cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              Open Attendance Tool
            </button>
            <button
              onClick={() => onNavigate('students')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Browse Students Directory
            </button>
            <button
              onClick={() => onNavigate('portal')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 font-bold text-xs backdrop-blur-sm transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              Nairee's Student Portal
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Students */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-brand-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{students}</h3>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>{batches} Active Batches</span>
              <span className="font-semibold text-emerald-600">100% Enrolled</span>
            </div>
          </div>
        </div>

        {/* Card 2: Attendance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{attendanceRate}%</h3>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${attendanceRate}%` }}
              ></div>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 text-right">Across all classes</p>
          </div>
        </div>

        {/* Card 3: Fee Collections */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Collection</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ${(finance.totalCollected || 0).toLocaleString()}
            </h3>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${finance.collectionRate || 0}%` }}
              ></div>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Billed: ${(finance.totalBilled || 0).toLocaleString()}</span>
              <span className="font-semibold text-amber-600">{finance.collectionRate || 0}% Paid</span>
            </div>
          </div>
        </div>

        {/* Card 4: Faculty & Academics */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Staff</span>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{faculty}</h3>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>{courses} Taught Courses</span>
              <span className="font-semibold text-sky-600">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Activity & Timetable Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Exam & Assessment Submissions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Recent Assessments & Marks</h3>
              <p className="text-xs text-slate-500">Latest examination grades from tabAssessmentResult</p>
            </div>
            <button
              onClick={() => onNavigate('gradebook')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
            >
              Gradebook <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentAssessments.map((res, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-extrabold text-sm">
                    {res.grade}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{res.student_name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{res.course}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-slate-900">
                    {res.score} / {res.maximum_score}
                  </span>
                  <p className="text-[10px] text-slate-400">{Math.round((res.score / res.maximum_score) * 100)}% Score</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Attendance Records Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Recent Attendance Logs</h3>
              <p className="text-xs text-slate-500">Live records from tabStudentAttendance</p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
            >
              Attendance Tool <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentAttendance.map((att, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-200/70 text-slate-700">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{att.student_name}</h4>
                    <p className="text-[11px] text-slate-500">Date: {att.date}</p>
                  </div>
                </div>
                <div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      att.status === 'Present'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : att.status === 'Late'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {att.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
