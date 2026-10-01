import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Award, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Receipt, 
  ArrowRight,
  ShieldCheck,
  QrCode,
  BookOpen
} from 'lucide-react';
import { api } from '../api.js';

export default function StudentPortalView({ onNavigate }) {
  const [student, setStudent] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getStudentDetail('EDU-STU-2026-00001'), // Nairee Patel
      api.getSchedule('BATCH-10A-2026')
    ]).then(([sData, scData]) => {
      setStudent(sData);
      setSchedule(scData);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading || !student) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // Filter today's classes
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysClasses = schedule.filter(s => s.day_of_week === (todayName === 'Saturday' || todayName === 'Sunday' ? 'Monday' : todayName));

  const averageScore = student.assessments?.length > 0
    ? Math.round(student.assessments.reduce((acc, a) => acc + (a.percentage || 0), 0) / student.assessments.length)
    : 96;

  return (
    <div className="space-y-6">
      {/* Student Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={student.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                alt="Nairee"
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow">
                ★ #1
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight">Welcome, {student.student_name}!</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Enrolled & Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Student ID: <code className="font-mono text-amber-300 font-bold">{student.name}</code> • Roll #{student.roll_no}
              </p>
              <p className="text-xs text-brand-200 mt-0.5 font-medium">
                {student.batch_name} • {student.program_name}
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <div className="text-center px-3 border-r border-white/10">
              <span className="text-[10px] text-slate-300 uppercase font-bold">Attendance</span>
              <p className="text-xl font-extrabold text-emerald-400">{student.attendance?.percentage || 100}%</p>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-300 uppercase font-bold">Academic Avg</span>
              <p className="text-xl font-extrabold text-amber-300">{averageScore}% (A+)</p>
            </div>
          </div>
        </div>

        {/* Glow */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Digital Student ID Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-brand-950 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-extrabold tracking-wider uppercase text-slate-200">Digital Student ID</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-white/10 px-2 py-0.5 rounded text-slate-300">
                2026-2027
              </span>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <img
                src={student.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                alt={student.student_name}
                className="w-16 h-16 rounded-xl object-cover ring-2 ring-amber-400"
              />
              <div>
                <h3 className="text-base font-extrabold">{student.student_name}</h3>
                <p className="text-xs text-brand-300 font-mono mt-0.5">{student.name}</p>
                <p className="text-[11px] text-slate-400">{student.batch_name}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Blood Group</span>
                <span className="font-bold text-rose-400">{student.blood_group}</span>
              </div>
              <div className="bg-white/5 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Emergency</span>
                <span className="font-bold text-slate-200">+1 (555) 901-2234</span>
              </div>
            </div>

            {/* QR Mockup */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-7 h-7 text-slate-300" />
                <span className="text-[10px] text-slate-400 font-mono leading-tight">
                  VALID STUDENT PASS<br />CAMPUS ACCESS
                </span>
              </div>
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
          </div>

          {/* Pending Fees Alert Card */}
          {student.fees?.some(f => f.status !== 'Paid') && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                    Tuition Notice
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-2">Term 2 Fee Due</h4>
                  <p className="text-xs text-slate-600 mt-1">Outstanding balance of $1,450.00</p>
                </div>
                <Receipt className="w-6 h-6 text-amber-600" />
              </div>

              <button
                onClick={() => onNavigate('fees')}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Pay Outstanding Fees <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right 2 Columns: Classes & Grade Performance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-base text-slate-900">Today's Class Schedule ({todayName})</h3>
              </div>
              <button
                onClick={() => onNavigate('schedule')}
                className="text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                Full Week
              </button>
            </div>

            <div className="space-y-3">
              {todaysClasses.length > 0 ? (
                todaysClasses.map((c) => (
                  <div
                    key={c.name}
                    className="p-4 rounded-xl border border-slate-100 flex items-center justify-between hover:shadow-sm transition-all"
                    style={{ borderLeftWidth: '4px', borderLeftColor: c.color || '#4F46E5' }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{c.subject}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {c.room}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{c.title}</p>
                      <p className="text-[11px] text-slate-400">Instructor: {c.faculty_name}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1 justify-end">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {c.from_time.slice(0, 5)} - {c.to_time.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No classes scheduled for today. Check the full week schedule!
                </div>
              )}
            </div>
          </div>

          {/* Academic Report Card Snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-slate-900">Academic Report Card (Term 1)</h3>
              </div>
              <button
                onClick={() => onNavigate('gradebook')}
                className="text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                View Details
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {student.assessments?.map((a) => (
                <div key={a.name} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{a.assessment_name || a.course}</h5>
                    <p className="text-[11px] text-slate-400">{a.comment}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900">{a.score}/{a.maximum_score}</span>
                    <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {a.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
