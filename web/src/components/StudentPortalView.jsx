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
  BookOpen, 
  FileText, 
  Bus, 
  ExternalLink, 
  Upload, 
  Send, 
  User,
  UserCheck, 
  Printer, 
  GraduationCap, 
  Umbrella, 
  Users, 
  Bell, 
  Play, 
  Check, 
  AlertCircle, 
  LayoutDashboard, 
  Lock, 
  ShieldAlert 
} from 'lucide-react';
import { api, subscribeLiveEvents } from '../api.js';
import SchoolCalendarView from './SchoolCalendarView.jsx';

export default function StudentPortalView({ user, activeTab: propTab, setActiveTab: propSetTab }) {
  const [internalTab, setInternalTab] = useState('dashboard');
  const activeTab = propTab !== undefined ? propTab : internalTab;
  const setActiveTab = propSetTab || setInternalTab;
  const [student, setStudent] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [syllabus, setSyllabus] = useState([]);
  const [homeworkList, setHomeworkList] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Real-Time Timetable States
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day' | 'week'
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay()); // 0 = Sun, 1 = Mon, ...
  const [showLiveClassModal, setShowLiveClassModal] = useState(false);
  const [activeLiveClass, setActiveLiveClass] = useState(null);

  // 1-second real-time timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Submit Homework Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedHw, setSelectedHw] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const studentId = user?.student_id || user?.student?.name || 'STU-001';

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleAttachmentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAttachment(true);
      const res = await api.uploadFile(file);
      setAttachmentUrl(res.url);
      showToast(`Attached file "${file.name}"!`);
    } catch (err) {
      showToast('File upload failed: ' + err.message);
    } finally {
      setUploadingAttachment(false);
    }
  };

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const sData = await api.getStudentDetail(studentId);
      setStudent(sData);

      const batch = sData.batch_id || sData.student_batch || 'CLS-10A';
      const [scData, sylData, hwData, matData, annData, trData] = await Promise.all([
        api.getSchedule(batch).catch(() => []),
        api.getSyllabus({ batch }).catch(() => []),
        api.getHomework({ batch, student: studentId }).catch(() => []),
        api.getStudyMaterials({ batch }).catch(() => []),
        api.getAnnouncements('student', batch).catch(() => []),
        api.getTransport(studentId).catch(() => null)
      ]);

      setSchedule(scData);
      setSyllabus(sylData);
      setHomeworkList(hwData);
      setMaterials(matData);
      setAnnouncements(annData);
      setTransport(trData);
    } catch (err) {
      console.error('Failed to load student data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  // Live real-time sync for fee clearance, class transfer, and student profile updates
  useEffect(() => {
    const unsub = subscribeLiveEvents((event) => {
      if (
        event?.type === 'fee_updated' || 
        event?.type === 'student_transferred' || 
        event?.type === 'student_updated' || 
        event?.type === 'grade_updated' ||
        event?.type === 'attendance_updated' ||
        event?.type === 'announcement_created' ||
        event?.type === 'db_store_updated'
      ) {
        loadStudentData();
      }
    });
    return () => unsub();
  }, [studentId]);

  const handleSubmitHomework = async (e) => {
    e.preventDefault();
    if (!selectedHw || (!submissionText.trim() && !attachmentUrl)) return;

    try {
      await api.submitHomework({
        homework_id: selectedHw.id,
        student: studentId,
        student_name: student.student_name,
        submission_text: submissionText,
        attachment_url: attachmentUrl
      });
      showToast('Assignment submitted successfully! Notified your teacher for review.');
      setShowSubmitModal(false);
      setSubmissionText('');
      setAttachmentUrl('');
      // Reload homework to update submission status
      api.getHomework({ batch: student.student_batch, student: studentId }).then(setHomeworkList);
    } catch (err) {
      showToast(err.message || 'Submission failed');
    }
  };

  if (loading || !student) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysClasses = schedule.filter(s => s.day_of_week === (todayName === 'Saturday' || todayName === 'Sunday' ? 'Monday' : todayName));

  const averageScore = student.assessments?.length > 0
    ? Math.round(student.assessments.reduce((acc, a) => acc + (a.percentage || 0), 0) / student.assessments.length)
    : 96;

  const isFeePaid = student.fee_status === 'Paid' || (student.balance_due === 0 && (student.feeDues === undefined || student.feeDues === 0));

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c1f2c] border border-teal-500/60 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* PROMIMENT OVERDUE FEE RED ALERT BANNER ON TOP */}
      {!isFeePaid && (
        <div className="p-4 sm:p-5 rounded-3xl bg-rose-950/80 border-2 border-rose-500 text-white shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black flex-shrink-0 shadow-lg shadow-rose-600/40">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider">
                  ⚠️ Fee Not Paid — Marksheet Withheld
                </span>
                <span className="text-sm sm:text-base font-extrabold text-white">
                  Term Fee Due: ₹{student.balance_due || student.feeDues || 35000}
                </span>
              </div>
              <p className="text-xs text-rose-200 mt-1">
                Official marksheet and exam report card cannot be released automatically until pending fee dues are cleared.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('fees')}
            className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black text-xs shadow-lg shadow-rose-900/40 transition-all cursor-pointer flex-shrink-0 whitespace-nowrap"
          >
            Pay Term Fee (₹{student.balance_due || student.feeDues || 35000}) →
          </button>
        </div>
      )}

      {/* Student Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0c1f2c] via-[#102d3e] to-[#0c1f2c] p-6 sm:p-8 text-white shadow-xl border border-teal-800/40">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={student.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                alt={student.student_name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-teal-500/30 shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow">
                ★ Distinction
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">Welcome back, {student.student_name}!</h1>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                  Active Student
                </span>
                {/* Real-Time Fee Status Badge */}
                {isFeePaid ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Fee Paid (Receipt Active)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                    Fee Due ₹{student.balance_due || student.feeDues || 35000}
                  </span>
                )}
              </div>

              {/* Student Metadata Info Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {/* Class & Section Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold shadow-sm">
                  <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
                  <span>{student.class_batch || student.student_batch || student.batch_name || 'Class 10 - Section A'}</span>
                </span>

                {/* Student ID Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 text-xs font-mono font-bold shadow-sm">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ID: {student.student_id || student.id || student.name || 'STU-001'}</span>
                </span>

                {/* Roll Number */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 text-slate-200 border border-slate-700 text-xs font-bold shadow-sm">
                  <span>Roll #{student.roll_no || student.roll_number || '101'}</span>
                </span>

                {/* Stream / Subjects */}
                {student.stream && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs font-semibold shadow-sm">
                    <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                    <span>{student.stream}</span>
                  </span>
                )}
              </div>

              {/* Secondary Details: DOB, Blood Group & Parent */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 mt-2 font-medium">
                {student.dob && (
                  <span className="flex items-center gap-1 text-slate-300">
                    <Calendar className="w-3 h-3 text-teal-400" />
                    DOB: {student.dob}
                  </span>
                )}
                {student.blood_group && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                    Blood: {student.blood_group}
                  </span>
                )}
                {student.guardian_name && (
                  <span className="text-slate-400">
                    Guardian: <strong className="text-white">{student.guardian_name}</strong> {student.guardian_mobile ? `(${student.guardian_mobile})` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md p-3 rounded-2xl border border-teal-500/20">
            <div className="text-center px-3 border-r border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Attendance</span>
              <p className="text-xl font-black text-emerald-400">{student.attendance?.percentage || 100}%</p>
            </div>
            <div className="text-center px-3 border-r border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Term Average</span>
              <p className="text-xl font-black text-amber-400">{averageScore}% (A+)</p>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Fee Status</span>
              <p className={`text-sm font-black mt-1 ${isFeePaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isFeePaid ? 'Paid' : 'Pending'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: DASHBOARD (Matches media_1790863408009.png) */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top 3 Coral-Red Outline Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Top students */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500">Top students</span>
                <p className="text-3xl font-black text-[#ff5252] mt-1">146</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-[#ff5252]">
                <GraduationCap className="w-7 h-7 stroke-[1.75]" />
              </div>
            </div>

            {/* Card 2: Top teachers */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500">Top teachers</span>
                <p className="text-3xl font-black text-[#ff5252] mt-1">34</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-[#ff5252]">
                <Users className="w-7 h-7 stroke-[1.75]" />
              </div>
            </div>

            {/* Card 3: Top subjects */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500">Top subjects</span>
                <p className="text-3xl font-black text-[#ff5252] mt-1">7</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-[#ff5252]">
                <BookOpen className="w-7 h-7 stroke-[1.75]" />
              </div>
            </div>
          </div>

          {/* Center Area: Timetable Schedule Grid (Left) + Assignments & Status (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 8 Cols: Schedule / Timetable Card */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              {/* Header with Month Title and [Day | Week] toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-black text-slate-800">
                    {currentTime.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Live Academic Clock
                  </span>
                </div>

                {/* Day / Week Interactive Switcher */}
                <div className="flex items-center p-1 rounded-full bg-slate-100 text-xs font-bold shadow-inner">
                  <button
                    onClick={() => setViewMode('day')}
                    className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                      viewMode === 'day'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                      viewMode === 'week'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Week
                  </button>
                </div>
              </div>

              {/* ────────────────── 1. WEEK VIEW ────────────────── */}
              {viewMode === 'week' && (
                <div className="relative pt-2 select-none">
                  
                  {/* Real-Time Moving Red Dotted Timeline Indicator */}
                  {(() => {
                    const hours = currentTime.getHours();
                    const minutes = currentTime.getMinutes();
                    const seconds = currentTime.getSeconds();
                    const totalMins = hours * 60 + minutes + seconds / 60;
                    
                    // School timeline window: 8:30 AM (510 min) to 3:30 PM (930 min)
                    const startMins = 8.5 * 60; // 510
                    const endMins = 15.5 * 60;  // 930
                    const span = endMins - startMins; // 420 mins
                    
                    let percent = ((totalMins - startMins) / span) * 100;
                    if (percent < 8) percent = 8;
                    if (percent > 92) percent = 92;

                    const formattedTime = currentTime.toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    });

                    // Active column index (0 = Sun, 1 = Mon ... 6 = Sat)
                    const activeDayIdx = currentTime.getDay();

                    return (
                      <div 
                        className="absolute left-0 right-0 z-20 pointer-events-none flex items-center transition-all duration-1000 ease-linear"
                        style={{ top: `${percent}%` }}
                      >
                        {/* Live Running Time Pill */}
                        <div className="px-2 py-0.5 rounded-lg bg-slate-950 text-[10px] font-mono text-white font-black ml-0.5 mr-1.5 shadow-lg border border-slate-700 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                          <span>{formattedTime}</span>
                        </div>

                        {/* Red Dashed Moving Line with Glowing Marker */}
                        <div className="flex-1 border-t-2 border-dashed border-[#ff5252] relative">
                          <span 
                            className="w-3.5 h-3.5 rounded-full bg-[#ff5252] border-2 border-white shadow-md absolute -top-[7px] -ml-1.5 animate-pulse"
                            style={{ 
                              left: `${(activeDayIdx / 7) * 100 + 7}%` 
                            }}
                          ></span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 7-Day Timetable Grid */}
                  <div className="grid grid-cols-7 gap-2 text-center">
                    
                    {/* Sun (Holiday) */}
                    <div className={`rounded-2xl p-2 min-h-[340px] flex flex-col justify-between border ${
                      currentTime.getDay() === 0
                        ? 'bg-sky-50 border-2 border-sky-300 shadow-sm'
                        : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-400">Sun 7</span>
                        {currentTime.getDay() === 0 && (
                          <span className="px-2 py-0.5 mt-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <span className="text-slate-300 font-bold uppercase tracking-widest text-xs -rotate-90">
                          Holiday
                        </span>
                      </div>
                    </div>

                    {/* Mon 8 */}
                    <div className={`rounded-2xl p-2 min-h-[340px] flex flex-col space-y-2 border ${
                      currentTime.getDay() === 1
                        ? 'bg-sky-50/80 border-2 border-sky-300 shadow-sm'
                        : 'bg-slate-50/60 border-slate-100'
                    }`}>
                      <div className="flex flex-col items-center">
                        <span className={`text-xs font-bold ${currentTime.getDay() === 1 ? 'text-sky-900 font-black' : 'text-slate-700'}`}>
                          Mon 8
                        </span>
                        {currentTime.getDay() === 1 && (
                          <span className="px-2 py-0.5 mt-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="p-2 rounded-xl bg-slate-100 text-left text-[11px] text-slate-600 font-semibold mt-4">
                        <div className="font-bold text-slate-800 truncate">Social science</div>
                        <div className="text-[10px] text-slate-400">10:30 am - 12:30 pm</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-100 text-left text-[11px] text-slate-600 font-semibold">
                        <div className="font-bold text-slate-800 truncate">History</div>
                        <div className="text-[10px] text-slate-400">9 am - 10:30 am</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-100 text-left text-[11px] text-slate-600 font-semibold">
                        <div className="font-bold text-slate-800 truncate">English</div>
                      </div>
                    </div>

                    {/* Tue 9 */}
                    <div className={`rounded-2xl p-2 min-h-[340px] flex flex-col space-y-2 border ${
                      currentTime.getDay() === 2
                        ? 'bg-sky-50/80 border-2 border-sky-300 shadow-sm'
                        : 'bg-slate-50/60 border-slate-100'
                    }`}>
                      <div className="flex flex-col items-center">
                        <span className={`text-xs font-bold ${currentTime.getDay() === 2 ? 'text-sky-900 font-black' : 'text-slate-700'}`}>
                          Tue 9
                        </span>
                        {currentTime.getDay() === 2 && (
                          <span className="px-2 py-0.5 mt-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="p-2 rounded-xl bg-slate-100 text-left text-[11px] text-slate-600 font-semibold mt-2">
                        <div className="font-bold text-slate-800 truncate">English</div>
                        <div className="text-[10px] text-slate-400">9 am - 10:30 am</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-100 text-left text-[11px] text-slate-600 font-semibold">
                        <div className="font-bold text-slate-800 truncate">Science</div>
                        <div className="text-[10px] text-slate-400">10:50 am - 12:30 pm</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-100 text-left text-[11px] text-slate-600 font-semibold">
                        <div className="font-bold text-slate-800 truncate">History</div>
                      </div>
                    </div>

                    {/* Wed 10 (TODAY COLUMN - Matches media_1790870123637.png) */}
                    <div className={`rounded-2xl p-2 min-h-[340px] flex flex-col space-y-2 border-2 ${
                      currentTime.getDay() === 3 || currentTime.getDay() >= 3
                        ? 'bg-sky-50 border-sky-300 shadow-sm'
                        : 'bg-slate-50/60 border-slate-100'
                    } relative`}>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-extrabold text-sky-900">Wed 10</span>
                        <span className="px-2 py-0.5 mt-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold">
                          Today
                        </span>
                      </div>

                      {/* Cyan Class Card with "Go to class" button */}
                      <div className="p-2.5 rounded-xl bg-[#99f6e4] text-left text-[11px] text-teal-950 font-bold shadow-sm space-y-1.5 mt-1 border border-teal-300">
                        <div className="truncate">Tamil</div>
                        <div className="text-[10px] font-medium text-teal-800">9 am - 10:30 am</div>
                        <button 
                          onClick={() => {
                            setActiveLiveClass({
                              subject: 'Tamil Literature & Grammar',
                              period: 'Period 1 (09:00 AM - 10:30 AM)',
                              teacher: 'Mrs. Lakshmi Raman',
                              room: 'Language Room 102',
                              topic: 'Unit 3: Classical Tamil Poetry and Versification'
                            });
                            setShowLiveClassModal(true);
                          }}
                          className="w-full py-1 px-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-transform active:scale-95 shadow-sm"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Go to class</span>
                        </button>
                      </div>

                      {/* Yellow Class Card */}
                      <div className="p-2.5 rounded-xl bg-[#fef08a] text-left text-[11px] text-amber-950 font-bold shadow-sm space-y-0.5 border border-amber-300">
                        <div className="truncate">Science</div>
                        <div className="text-[10px] font-medium text-amber-800">10:50 am - 12:30 pm</div>
                      </div>

                      {/* Purple Class Card */}
                      <div className="p-2 rounded-xl bg-[#e9d5ff] text-left text-[11px] text-purple-950 font-bold shadow-sm border border-purple-300">
                        <div className="truncate">Maths</div>
                        <div className="text-[10px] font-medium text-purple-800">12:30 pm - 2:00 pm</div>
                      </div>
                    </div>

                    {/* Thu 11 */}
                    <div className={`rounded-2xl p-2 min-h-[340px] flex flex-col space-y-2 border ${
                      currentTime.getDay() === 4
                        ? 'bg-sky-50/80 border-2 border-sky-300 shadow-sm'
                        : 'bg-slate-50/60 border-slate-100'
                    }`}>
                      <div className="flex flex-col items-center">
                        <span className={`text-xs font-bold ${currentTime.getDay() === 4 ? 'text-sky-900 font-black' : 'text-slate-700'}`}>
                          Thu 11
                        </span>
                        {currentTime.getDay() === 4 && (
                          <span className="px-2 py-0.5 mt-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="p-2 rounded-xl bg-slate-100 text-left text-[11px] text-slate-600 font-semibold mt-8">
                        <div className="font-bold text-slate-800 truncate">Social science</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-100 text-left text-[11px] text-slate-600 font-semibold">
                        <div className="font-bold text-slate-800 truncate">Tamil</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-100 text-left text-[11px] text-slate-600 font-semibold">
                        <div className="font-bold text-slate-800 truncate">Maths</div>
                      </div>
                    </div>

                    {/* Fri 12 */}
                    <div className={`rounded-2xl p-2 min-h-[340px] flex flex-col space-y-2 border ${
                      currentTime.getDay() === 5
                        ? 'bg-sky-50/80 border-2 border-sky-300 shadow-sm'
                        : 'bg-slate-50/60 border-slate-100'
                    }`}>
                      <div className="flex flex-col items-center">
                        <span className={`text-xs font-bold ${currentTime.getDay() === 5 ? 'text-sky-900 font-black' : 'text-slate-700'}`}>
                          Fri 12
                        </span>
                        {currentTime.getDay() === 5 && (
                          <span className="px-2 py-0.5 mt-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="p-2 rounded-xl bg-slate-100 text-left text-[11px] text-slate-600 font-semibold mt-4">
                        <div className="font-bold text-slate-800 truncate">English</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-100 text-left text-[11px] text-slate-600 font-semibold">
                        <div className="font-bold text-slate-800 truncate">Science</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-100 text-left text-[11px] text-slate-600 font-semibold">
                        <div className="font-bold text-slate-800 truncate">Maths</div>
                      </div>
                    </div>

                    {/* Sat 13 (Holiday) */}
                    <div className={`rounded-2xl p-2 min-h-[340px] flex flex-col justify-between border ${
                      currentTime.getDay() === 6
                        ? 'bg-sky-50 border-2 border-sky-300 shadow-sm'
                        : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-400">Sat 13</span>
                        {currentTime.getDay() === 6 && (
                          <span className="px-2 py-0.5 mt-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <span className="text-slate-300 font-bold uppercase tracking-widest text-xs -rotate-90">
                          Holiday
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ────────────────── 2. DAY VIEW (Detailed Single-Day Agenda) ────────────────── */}
              {viewMode === 'day' && (
                <div className="space-y-4 pt-2">
                  {/* Day Navigation Bar */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDayIndex((prev) => (prev > 0 ? prev - 1 : 6))}
                        className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold text-sm shadow-xs cursor-pointer"
                      >
                        &larr;
                      </button>
                      <span className="text-sm font-black text-slate-800 px-2">
                        {['Sunday (Holiday)', 'Monday', 'Tuesday', 'Wednesday (Today)', 'Thursday', 'Friday', 'Saturday (Holiday)'][selectedDayIndex]}
                      </span>
                      <button
                        onClick={() => setSelectedDayIndex((prev) => (prev < 6 ? prev + 1 : 0))}
                        className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold text-sm shadow-xs cursor-pointer"
                      >
                        &rarr;
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedDayIndex(currentTime.getDay())}
                      className="px-3 py-1 rounded-xl bg-[#00a884] text-white text-xs font-bold hover:bg-[#009172] shadow-xs cursor-pointer"
                    >
                      Jump to Today
                    </button>
                  </div>

                  {/* Single Day Detailed Timeline with Real-Time Marker */}
                  <div className="relative pl-16 space-y-3 py-2 min-h-[380px]">
                    {/* Time Ruler (Hours on Left) */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-[11px] font-mono text-slate-400 py-1 select-none border-r border-slate-100">
                      <span>09:00</span>
                      <span>10:30</span>
                      <span>11:00</span>
                      <span>12:30</span>
                      <span>14:00</span>
                      <span>15:30</span>
                    </div>

                    {/* Real-time Moving Time Bar in Day View */}
                    {selectedDayIndex === currentTime.getDay() && (
                      <div 
                        className="absolute left-14 right-0 z-20 pointer-events-none flex items-center transition-all duration-1000"
                        style={{ 
                          top: `${(() => {
                            const hours = currentTime.getHours();
                            const minutes = currentTime.getMinutes();
                            const total = hours * 60 + minutes;
                            const start = 9 * 60;
                            const end = 15.5 * 60;
                            let p = ((total - start) / (end - start)) * 100;
                            return Math.max(5, Math.min(95, p));
                          })()}%` 
                        }}
                      >
                        <div className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-black shadow-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                          <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                        <div className="flex-1 border-t-2 border-dashed border-rose-500"></div>
                      </div>
                    )}

                    {/* Day Schedule Cards */}
                    {selectedDayIndex === 0 || selectedDayIndex === 6 ? (
                      <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                        <span className="text-3xl">🏖️</span>
                        <h4 className="font-bold text-slate-700 text-sm">Weekend Academic Holiday</h4>
                        <p className="text-xs text-slate-400">No scheduled periods today. Enjoy your rest or review study materials!</p>
                      </div>
                    ) : (
                      <>
                        {/* Period 1 */}
                        <div className="p-4 rounded-2xl bg-[#99f6e4]/40 border-2 border-teal-300 shadow-sm flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                                09:00 AM - 10:30 AM
                              </span>
                              <span className="text-xs font-bold text-teal-900">Period 1</span>
                            </div>
                            <h4 className="font-black text-slate-900 text-sm mt-1">Tamil Literature & Grammar</h4>
                            <p className="text-xs text-slate-500">Mrs. Lakshmi Raman • Language Room 102</p>
                          </div>
                          <button
                            onClick={() => {
                              setActiveLiveClass({
                                subject: 'Tamil Literature & Grammar',
                                period: 'Period 1 (09:00 AM - 10:30 AM)',
                                teacher: 'Mrs. Lakshmi Raman',
                                room: 'Language Room 102',
                                topic: 'Unit 3: Classical Tamil Poetry and Versification'
                              });
                              setShowLiveClassModal(true);
                            }}
                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Join Live Class</span>
                          </button>
                        </div>

                        {/* Recess Break */}
                        <div className="py-2 px-4 rounded-xl bg-amber-50/60 border border-amber-200 text-center text-xs font-semibold text-amber-800">
                          ☕ Morning Recess & Refreshment (10:30 AM - 10:50 AM)
                        </div>

                        {/* Period 2 */}
                        <div className="p-4 rounded-2xl bg-[#fef08a]/40 border border-amber-300 shadow-sm flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                10:50 AM - 12:30 PM
                              </span>
                              <span className="text-xs font-bold text-amber-900">Period 2</span>
                            </div>
                            <h4 className="font-black text-slate-900 text-sm mt-1">General Science & Chemistry Lab</h4>
                            <p className="text-xs text-slate-500">Dr. Alan Grant • Chemistry Lab 3</p>
                          </div>
                          <span className="text-xs font-bold px-3 py-1 rounded-lg bg-amber-100 text-amber-800">
                            Upcoming
                          </span>
                        </div>

                        {/* Period 3 */}
                        <div className="p-4 rounded-2xl bg-[#e9d5ff]/40 border border-purple-300 shadow-sm flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                                12:30 PM - 02:00 PM
                              </span>
                              <span className="text-xs font-bold text-purple-900">Period 3</span>
                            </div>
                            <h4 className="font-black text-slate-900 text-sm mt-1">Mathematics & Calculus</h4>
                            <p className="text-xs text-slate-500">Prof. Sarah Jenkins • Room 101</p>
                          </div>
                          <span className="text-xs font-bold px-3 py-1 rounded-lg bg-purple-100 text-purple-800">
                            Upcoming
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Right 4 Cols: Assignments Count & Status (Matches media_1790863408009.png) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Assignments Count Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Assignments</h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-semibold text-slate-500">Total assignments</span>
                    <span className="font-extrabold text-slate-900 text-sm">10</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-semibold text-slate-500">Class work assignments</span>
                    <span className="font-extrabold text-slate-900 text-sm">12</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-semibold text-slate-500">Home work assignments</span>
                    <span className="font-extrabold text-slate-900 text-sm">18</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-600">Completed</span>
                    <span className="font-black text-emerald-600 text-sm">20</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#ff5252]">Not completed</span>
                    <span className="font-black text-[#ff5252] text-sm">10</span>
                  </div>
                </div>
              </div>

              {/* Status List Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm">Status</h3>
                  <button 
                    onClick={() => setActiveTab('homework')}
                    className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
                  >
                    View all
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Social science */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <div>
                      <div className="font-bold text-xs text-slate-800">Social science</div>
                      <div className="text-[10px] text-slate-400">Last submission date: 23 June</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold whitespace-nowrap">
                      Yet to submit
                    </span>
                  </div>

                  {/* Science */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <div>
                      <div className="font-bold text-xs text-slate-800">Science</div>
                      <div className="text-[10px] text-slate-400">Last submission date: 23 June</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold whitespace-nowrap">
                      Yet to submit
                    </span>
                  </div>

                  {/* History */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <div>
                      <div className="font-bold text-xs text-slate-800">History</div>
                      <div className="text-[10px] text-slate-400">Submitted on 19 June</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold whitespace-nowrap">
                      Submitted
                    </span>
                  </div>

                  {/* English */}
                  <div className="flex items-center justify-between py-1.5">
                    <div>
                      <div className="font-bold text-xs text-slate-800">English</div>
                      <div className="text-[10px] text-slate-400">Submitted on 19 June</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold whitespace-nowrap">
                      Submitted
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Row of 3 Cards: Calendar, Attendance Donut, Announcements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Calendar */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Calendar</h3>
              
              {/* Day numbers */}
              <div className="flex items-center justify-between text-center pb-3 border-b border-slate-100">
                {[
                  { d: 'S', n: 7 },
                  { d: 'M', n: 8 },
                  { d: 'T', n: 9 },
                  { d: 'W', n: 10, active: true },
                  { d: 'T', n: 11 },
                  { d: 'F', n: 12 },
                  { d: 'S', n: 13 },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-[11px] font-bold text-slate-400">{item.d}</span>
                    <div className={`w-8 h-8 rounded-full flex flex-col items-center justify-center text-xs font-bold mt-1 ${
                      item.active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700'
                    }`}>
                      <span>{item.n}</span>
                      {item.active && <span className="w-1 h-1 rounded-full bg-purple-400 -mt-0.5"></span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Events list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">Morning prayer</div>
                    <div className="text-[10px] text-slate-400">Together in main hall</div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">30 mins</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">Social service</div>
                    <div className="text-[10px] text-slate-400">In Meenakshi temple</div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">30 mins</span>
                </div>
              </div>
            </div>

            {/* Card 2: Attendance Donut Chart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Attendance</h3>
                <div className="flex items-center space-x-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-[#22d3ee]"></span>
                    <span>Present 92%</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                    <span>Absent 8%</span>
                  </span>
                </div>
              </div>

              {/* Donut Chart SVG */}
              <div className="py-2 flex items-center justify-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {/* Background Ring (Absent) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="16"
                    />
                    {/* Progress Ring (Present 92%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#22d3ee"
                      strokeWidth="16"
                      strokeDasharray="238.7"
                      strokeDashoffset={238.7 * (1 - 0.92)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-800 leading-none">92%</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Present</span>
                  </div>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                172 Sessions Attended of 186 Total
              </div>
            </div>

            {/* Card 3: Announcements */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800 text-sm">Announcements</h3>
                  <button 
                    onClick={() => setActiveTab('calendar')}
                    className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
                  >
                    View all
                  </button>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
                  <div className="w-10 h-10 rounded-xl bg-[#ff5252] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Umbrella className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                      Due to heavy rainfall next 2 days (December, 10 and 11) holidays
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      Classes will remain suspended. Online study material & recorded lectures have been posted in your portal.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Issued by Office of Principal</span>
                <span className="font-semibold text-[#5673ec] cursor-pointer hover:underline" onClick={() => setActiveTab('calendar')}>
                  Open School Calendar &rarr;
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: HOMEWORK & SUBMIT */}
      {activeTab === 'homework' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Assigned Homework & Online Submissions</h3>
              <p className="text-xs text-slate-500">Submit homework solutions, project links, or answers for grading</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Active Term 1
            </span>
          </div>

          <div className="space-y-4">
            {homeworkList.map((hw) => {
              const isSubmitted = !!hw.submission;
              return (
                <div 
                  key={hw.id} 
                  className="bg-white p-5 rounded-3xl border border-indigo-100 shadow-sm space-y-3 border-l-4 border-l-[#ff5a5f] hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-[#5673ec] border border-indigo-100 uppercase tracking-wider">
                          {hw.subject}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Assigned by {hw.faculty_name}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{hw.title}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        hw.submission?.status === 'Graded' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        isSubmitted ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {hw.submission?.status || 'Pending Submission'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-indigo-50/40 p-3 rounded-2xl border border-indigo-100/70">
                    {hw.instructions}
                  </p>

                  {/* Submission and Grade Status */}
                  {hw.submission ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900">Your Submitted Work:</span>
                        {hw.submission.score !== null && (
                          <span className="font-black text-emerald-800">
                            Score: {hw.submission.score} / {hw.max_points}
                          </span>
                        )}
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-100 font-mono text-[11px] text-slate-700">
                        {hw.submission.submission_text}
                      </div>
                      {hw.submission.feedback && (
                        <div className="text-[11px] text-emerald-800 font-medium">
                          <strong>Teacher Feedback:</strong> {hw.submission.feedback}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#ff5a5f]">
                        Due: {hw.due_date}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedHw(hw);
                          setShowSubmitModal(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#5673ec] to-[#6c8cff] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-indigo-300/30 flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Submit Solution</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: STUDY NOTES & MATERIALS */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Course Notes & Digital Learning Resources</h3>
              <p className="text-xs text-slate-500">Materials assigned directly to your class by faculty</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{materials.length} Resources Available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materials.map((mat) => (
              <div key={mat.id} className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-700 text-[10px] font-bold">
                      {mat.material_type} &bull; {mat.subject}
                    </span>
                    <span className="text-[10px] text-slate-400">{mat.created_at?.split('T')[0] || 'Today'}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{mat.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{mat.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Instructor: {mat.uploaded_by}</span>
                  <a
                    href={mat.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-600 hover:text-teal-700 font-bold flex items-center space-x-1"
                  >
                    <span>Download / View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GRADES & REPORT CARD */}
      {activeTab === 'results' && (
        !isFeePaid ? (
          <div className="bg-white rounded-3xl border-2 border-rose-200 p-8 sm:p-12 text-center shadow-lg space-y-5 animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-10 h-10 stroke-[2.2]" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <span className="inline-block text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                🔒 Marksheet Withheld &bull; Fee Due Pending
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Automatic Marksheet Not Released
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                As per school administration policy, term evaluation marks, percentage scores, and official report cards for <strong>{student.student_name}</strong> are withheld until the outstanding fee balance of <strong>₹{student.balance_due || student.feeDues || 35000}</strong> is cleared.
              </p>
            </div>
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setActiveTab('fees')}
                className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-900/30 transition-all cursor-pointer hover:scale-105"
              >
                Pay Term Fee Online (Unlock Marksheet) →
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src="/nairee-logo.png" alt="Nairee" className="h-8 w-auto object-contain" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Official Academic Report Card</h3>
                  <p className="text-xs text-slate-500">Evaluated marks, percentiles, and comments from faculty</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-600" />
                  <span>Print Official Report Card</span>
                </button>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
                  GPA Distinction
                </span>
              </div>
            </div>

          <div className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4">Exam Plan</th>
                    <th className="py-3.5 px-4">Score</th>
                    <th className="py-3.5 px-4">Percentage</th>
                    <th className="py-3.5 px-4">Grade</th>
                    <th className="py-3.5 px-4">Instructor Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {student.assessments?.map((res) => (
                    <tr key={res.name} className="hover:bg-teal-50/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{res.course}</td>
                      <td className="py-3.5 px-4">{res.assessment_plan}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{res.score} / {res.maximum_score}</td>
                      <td className="py-3.5 px-4 font-bold text-teal-700">{res.percentage}%</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded font-bold text-xs bg-emerald-100 text-emerald-800">
                          {res.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 italic">"{res.comment}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}

      {/* TAB 5: TIMETABLE */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Full Weekly Timetable Schedule</h3>
              <p className="text-xs text-slate-500">Live timetable generated from academic master schedule</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedule.map((sc) => (
              <div key={sc.name} className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-bold text-[10px]">
                    {sc.day_of_week}
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    {sc.from_time?.slice(0, 5)} - {sc.to_time?.slice(0, 5)}
                  </span>
                </div>
                <div className="font-bold text-slate-800 text-sm">{sc.subject}</div>
                <div className="text-slate-500">{sc.title || sc.course} &bull; {sc.room}</div>
                <div className="text-teal-600 font-semibold pt-1 border-t border-slate-100">
                  {sc.faculty_name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SYLLABUS PROGRESS */}
      {activeTab === 'syllabus' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Real-Time Syllabus Progress Tracker</h3>
              <p className="text-xs text-slate-500">
                Track how much syllabus is completed vs. remaining for upcoming mid-term examinations.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700">
              Live Teacher Updates
            </span>
          </div>

          <div className="space-y-3">
            {syllabus.map((s) => {
              const pct = Math.round((s.completed_topics / s.total_topics) * 100);
              return (
                <div key={s.id} className="bg-white p-4 rounded-2xl border border-teal-100 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">{s.subject} &bull; Chapter {s.chapter_number}</span>
                      <h4 className="font-bold text-slate-800 text-xs mt-0.5">{s.chapter_title}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-teal-100 text-teal-700'
                      }`}>
                        {s.status}
                      </span>
                      <span className="font-black text-slate-800 text-xs">{pct}%</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${pct === 100 ? 'bg-emerald-500' : 'bg-teal-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>Teacher: {s.faculty_name}</span>
                    <span>{s.completed_topics} of {s.total_topics} topics completed</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: TRANSPORT ROUTE */}
      {activeTab === 'transport' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-teal-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Bus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  {transport?.route_name || 'Route 04 North City Express'}
                </h3>
                <p className="text-xs text-slate-500">
                  Bus Registration Number: <strong className="text-slate-700">{transport?.bus_number || 'KA-04-E-8821'}</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Morning Pickup Details</span>
                <div className="font-bold text-slate-800 text-sm">{transport?.pickup_location || 'Green Valley Stop (Gate 2)'}</div>
                <div className="text-teal-700 font-bold">Scheduled Arrival: {transport?.pickup_time || '07:35 AM'}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Afternoon Drop Details</span>
                <div className="font-bold text-slate-800 text-sm">{transport?.drop_location || 'Green Valley Stop (Gate 2)'}</div>
                <div className="text-teal-700 font-bold">Scheduled Arrival: {transport?.drop_time || '03:45 PM'}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Driver in Charge: <strong>{transport?.driver_name || 'Mr. David K.'}</strong></span>
                <div className="text-slate-700 mt-0.5">Emergency Mobile: <strong>{transport?.driver_phone || '+1 (555) 882-1920'}</strong></div>
              </div>
              <a
                href={`tel:${transport?.driver_phone || '+15558821920'}`}
                className="px-3 py-1.5 rounded-lg bg-teal-500 text-white font-bold text-xs"
              >
                Call Driver
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: SCHOOL CALENDAR (ON / OFF TRACKER) */}
      {activeTab === 'calendar' && (
        <SchoolCalendarView />
      )}

      {/* SUBMIT HOMEWORK MODAL */}
      {showSubmitModal && selectedHw && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowSubmitModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-teal-100">
            <h3 className="font-bold text-slate-800 text-base mb-1">Submit Assignment</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedHw.title}</p>
            <form onSubmit={handleSubmitHomework} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Submission Content (Repository URL, Solution Notes, or Essay Text)
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Paste your solution GitHub repository link, answers, or derivations..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              {/* Native File Upload Area for Student */}
              <div className="border-2 border-dashed border-teal-200 hover:border-teal-400 rounded-2xl p-4 text-center bg-teal-50/50 transition-colors">
                <input
                  type="file"
                  id="student-homework-file"
                  className="hidden"
                  onChange={handleAttachmentUpload}
                  accept=".pdf,.doc,.docx,.zip,.py,.js,.html,.png,.jpg"
                />
                <label htmlFor="student-homework-file" className="cursor-pointer block">
                  <Upload className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                  <span className="text-xs font-bold text-teal-800 block">
                    {uploadingAttachment 
                      ? 'Uploading file...' 
                      : attachmentUrl 
                        ? `Attached: ${attachmentUrl.split('/').pop()}` 
                        : 'Attach Homework File (PDF, Code, or Document)'}
                  </span>
                  <span className="text-[10px] text-teal-600/80 block mt-0.5">
                    Optional attachment up to 25MB
                  </span>
                </label>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs shadow-md shadow-teal-500/20"
                >
                  Submit for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Live Virtual Classroom Modal */}
      {showLiveClassModal && activeLiveClass && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowLiveClassModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
        >
          <div className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-700 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                  <Play className="w-5 h-5 fill-teal-400 text-teal-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                      LIVE CLASSROOM
                    </span>
                    <span className="text-xs text-slate-400">{activeLiveClass.period}</span>
                  </div>
                  <h3 className="font-extrabold text-white text-base mt-0.5">{activeLiveClass.subject}</h3>
                </div>
              </div>
              <button 
                onClick={() => setShowLiveClassModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Video / Blackboard Feed Area */}
            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 h-64 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none"></div>
              
              {/* Animated Audio/Video Waves */}
              <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-teal-400" />
              </div>

              <h4 className="font-bold text-white text-sm z-10">{activeLiveClass.teacher} is presenting</h4>
              <p className="text-xs text-slate-400 max-w-md mt-1 z-10">
                "{activeLiveClass.topic}"
              </p>

              <div className="mt-4 flex items-center gap-2 z-10">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Attendance Logged: Present
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
                  34 Students Online
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-slate-400 font-mono">
                Room: {activeLiveClass.room}
              </span>
              <button
                onClick={() => setShowLiveClassModal(false)}
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black shadow-lg shadow-teal-500/20 cursor-pointer"
              >
                Leave Classroom
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
