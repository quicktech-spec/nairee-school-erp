import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Calendar,
  Clock,
  UserCheck,
  CreditCard,
  BookOpen,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Bus,
  ChevronDown,
  Sparkles,
  Download,
  Send,
  ExternalLink,
  ShieldCheck,
  Receipt,
  LayoutDashboard
} from 'lucide-react';
import { api } from '../api.js';
import SchoolCalendarView from './SchoolCalendarView.jsx';

export default function ParentPortalView({ user, activeTab: propTab, setActiveTab: propSetTab, onPaymentCompleted }) {
  const [internalTab, setInternalTab] = useState('dashboard');
  const activeTab = propTab !== undefined ? propTab : internalTab;
  const setActiveTab = propSetTab || setInternalTab;
  const isWrappedInLayout = propTab !== undefined;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [children, setChildren] = useState(user?.children || []);
  const [selectedChildId, setSelectedChildId] = useState(
    user?.children && user.children.length > 0 ? user.children[0].name : 'EDU-STU-2026-00001'
  );
  const [childSummary, setChildSummary] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card / Stripe');
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState({
    subject: '',
    message: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadChildData = async (studentId) => {
    setIsLoading(true);
    try {
      const [sum, notices, msgs] = await Promise.all([
        api.getParentChildSummary(studentId).catch(() => null),
        api.getAnnouncements('parent').catch(() => []),
        api.getMessages(user?.username, 'parent').catch(() => [])
      ]);
      setChildSummary(sum);
      setAnnouncements(notices);
      setMessages(msgs);
    } catch (err) {
      console.error('Error loading parent child data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChildId) {
      loadChildData(selectedChildId);
    }
  }, [selectedChildId]);

  const activeChild = children.find(c => c.name === selectedChildId) || children[0] || {
    name: 'EDU-STU-2026-00001',
    student_name: 'Nairee Patel',
    roll_no: '101',
    student_batch: 'BATCH-10A-2026'
  };

  const handlePayFee = async (e) => {
    e.preventDefault();
    if (!selectedFee) return;

    setIsProcessingPayment(true);
    try {
      const res = await api.payFee(selectedFee.name, paymentMethod);
      setPaymentSuccess(res);
      showToast('Fee payment confirmed! Official receipt generated.');
      if (onPaymentCompleted) onPaymentCompleted();
      // Reload child data to show updated fee status
      loadChildData(selectedChildId);
    } catch (err) {
      showToast(err.message || 'Payment processing failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSendMessageToTeacher = async (e) => {
    e.preventDefault();
    try {
      await api.sendMessage({
        sender_username: user?.username || 'parent_patel',
        sender_name: user?.full_name || 'Rajesh Patel',
        sender_role: 'parent',
        recipient_username: 'teacher_jenkins',
        recipient_name: 'Prof. Sarah Jenkins (Head of Mathematics)',
        recipient_role: 'teacher',
        student_batch: activeChild.student_batch || 'BATCH-10A-2026',
        subject: replyMessage.subject || `Inquiry regarding ${activeChild.student_name}`,
        message: replyMessage.message
      });
      showToast('Message sent to teacher successfully!');
      setShowMessageModal(false);
      setReplyMessage({ subject: '', message: '' });
      api.getMessages(user?.username, 'parent').then(setMessages);
    } catch (err) {
      showToast('Failed to send message');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c1f2c] border border-teal-500/60 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Parent Header Banner with Multi-Child Switcher */}
      <div className="bg-gradient-to-r from-[#0c1f2c] via-[#112a3a] to-[#0c1f2c] rounded-2xl p-6 border border-teal-800/40 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-400 mb-1">
            <Users className="w-4 h-4" />
            <span className="uppercase tracking-wider">Parent & Guardian Portal</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Welcome, {user?.full_name || 'Rajesh Patel'}
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Real-time tracking of attendance alerts, grades, syllabus completion, and online fee payments.
          </p>
        </div>

        {/* Multi-Child Switcher Dropdown */}
        <div className="bg-slate-800/90 border border-teal-500/40 rounded-2xl p-3 shadow-md">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-teal-300 mb-1">
            Active Child Portfolio (Switch Anytime)
          </label>
          <div className="flex items-center space-x-2">
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="bg-[#0c1f2c] border border-teal-600/50 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
            >
              {children && children.length > 0 ? (
                children.map((ch) => (
                  <option key={ch.name} value={ch.name}>
                    {ch.student_name} ({ch.student_batch})
                  </option>
                ))
              ) : (
                <>
                  <option value="EDU-STU-2026-00001">Nairee Patel (Grade 10-A Honors)</option>
                  <option value="EDU-STU-2026-00007">Rohan Patel (Grade 10-B Standard)</option>
                </>
              )}
            </select>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Synced
            </span>
          </div>
        </div>
      </div>

      {/* Top 3-Dash Control Bar (Matches media_1790863264206.png & media_1790863217016.png - only when not wrapped in AppLayout) */}
      {!isWrappedInLayout && (
        <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* THE 3 DASH SYMBOL (from media_1790863264206.png) */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(prev => !prev)}
              aria-label="Toggle navigation options"
              className="w-11 h-11 rounded-full bg-[#d7dfe9] hover:bg-[#cbd5e1] flex flex-col items-center justify-center gap-[4px] shadow-sm transition-all cursor-pointer active:scale-95 border border-slate-300 flex-shrink-0"
              title={isSidebarOpen ? "Collapse Left Menu" : "Show Left Menu"}
            >
              <span className="w-5 h-[3px] bg-[#111827] rounded-full"></span>
              <span className="w-5 h-[3px] bg-[#111827] rounded-full"></span>
              <span className="w-5 h-[3px] bg-[#111827] rounded-full"></span>
            </button>

            {/* Active Selected Option Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                Active Option:
              </span>
              <div className="px-4 py-2 rounded-2xl bg-[#00a884] text-white text-xs font-bold shadow-md shadow-[#00a884]/25 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                <span>
                  {[
                    { id: 'dashboard', label: 'Child Snapshot' },
                    { id: 'calendar', label: 'School ON / OFF Calendar' },
                    { id: 'progress', label: `Academic Grades (${childSummary?.results?.length || 0})` },
                    { id: 'attendance', label: `Attendance Tracking (${childSummary?.attendance?.percentage || 100}%)` },
                    { id: 'fees', label: 'Fees & Online Payment' },
                    { id: 'syllabus', label: 'Live Syllabus Progress' },
                    { id: 'timetable', label: 'Class Schedule & School Timing' },
                    { id: 'transport', label: 'School Bus & Route' },
                    { id: 'communication', label: `Teacher Messages (${messages.length})` }
                  ].find(t => t.id === activeTab)?.label || 'Child Snapshot'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Helper Badge */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 hidden md:inline">Click ☰ to toggle options on left</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono font-bold text-[11px]">
              {activeChild.student_name}
            </span>
          </div>
        </div>
      )}

      {/* Split Layout: Left-Side Navigation Options + Right-Side Main Screen Data */}
      <div className={`flex flex-col ${!isWrappedInLayout ? 'lg:flex-row' : ''} gap-6 items-start`}>
        {/* LEFT SIDE NAVIGATION MENU (Visible when 3-dash clicked / active) */}
        {!isWrappedInLayout && isSidebarOpen && (
          <aside className="w-full lg:w-72 flex-shrink-0 bg-white rounded-3xl p-4 border border-slate-200/90 shadow-md space-y-2 sticky top-20 z-10 transition-all animate-fadeIn">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#d7dfe9] flex flex-col items-center justify-center gap-[2px]">
                  <span className="w-3 h-[2px] bg-[#111827] rounded-full"></span>
                  <span className="w-3 h-[2px] bg-[#111827] rounded-full"></span>
                  <span className="w-3 h-[2px] bg-[#111827] rounded-full"></span>
                </div>
                <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">Parent Options</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
                title="Collapse Menu"
              >
                ✕
              </button>
            </div>

            <nav className="space-y-1.5">
              {[
                { id: 'dashboard', label: 'Child Snapshot', icon: LayoutDashboard },
                { id: 'calendar', label: 'School Calendar', icon: Calendar },
                { id: 'progress', label: 'Academic Grades', icon: GraduationCap, count: childSummary?.results?.length || 0 },
                { id: 'attendance', label: 'Attendance Tracking', icon: UserCheck, count: `${childSummary?.attendance?.percentage || 100}%` },
                { id: 'fees', label: 'Fees & Payment', icon: CreditCard },
                { id: 'syllabus', label: 'Live Syllabus Progress', icon: CheckCircle2 },
                { id: 'timetable', label: 'Class Schedule', icon: Clock },
                { id: 'transport', label: 'School Bus & Route', icon: Bus },
                { id: 'communication', label: 'Teacher Messages', icon: MessageSquare, count: messages.length }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (window.innerWidth < 1024) {
                        setIsSidebarOpen(false);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#00a884] text-white shadow-md shadow-[#00a884]/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{tab.label}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive 
                            ? 'bg-white/25 text-white' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>
        )}

        {/* RIGHT SIDE MAIN SCREEN (Displays data for the selected option) */}
        <div className="flex-1 w-full min-w-0 space-y-6">

      {/* TAB 1: CHILD SNAPSHOT */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Child Identity Card */}
          <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <img
                src={childSummary?.student?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={activeChild.student_name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-500 shadow-md shadow-teal-500/10"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-black text-slate-800">{activeChild.student_name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100">
                    Roll #{activeChild.roll_no || '101'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {childSummary?.student?.batch_name || activeChild.student_batch} &bull; {childSummary?.student?.program_name || 'Senior High School Diploma'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowMessageModal(true)}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs shadow-md shadow-teal-500/20 flex items-center space-x-1.5 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message Class Teacher</span>
              </button>
            </div>
          </div>

          {/* Quick Snapshot KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-emerald-600">
                  {childSummary?.attendance?.percentage || 100}%
                </span>
                <span className="text-xs text-slate-400 font-medium">Present</span>
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Optimal Attendance Record</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Latest Test Score</span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-800">
                  {childSummary?.results?.[0]?.percentage || 98}%
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                  Grade {childSummary?.results?.[0]?.grade || 'A+'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1 truncate">
                {childSummary?.results?.[0]?.course || 'Mathematics'} &bull; Midterm
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Term Fee Status</span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className={`text-2xl font-black ${
                  (childSummary?.fees?.[0]?.outstanding_amount || 0) > 0 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {(childSummary?.fees?.[0]?.outstanding_amount || 0) > 0
                    ? `$${childSummary?.fees?.[0]?.outstanding_amount} Due`
                    : 'All Paid'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Due by: {childSummary?.fees?.[0]?.due_date || 'Oct 20, 2026'}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bus Route</span>
              <div className="mt-2 text-base font-black text-slate-800 truncate">
                {childSummary?.transport?.route_name || 'Route 04 — North City'}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Pickup: {childSummary?.transport?.pickup_time || '07:35 AM'} &bull; Bus #{childSummary?.transport?.bus_number || 'KA-04'}
              </div>
            </div>
          </div>

          {/* Absence Alert & Notice Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white rounded-2xl border border-teal-100 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-teal-600" />
                <span>Attendance Health & Absence Alerts</span>
              </h3>

              {childSummary?.attendance?.absentAlerts?.length > 0 ? (
                <div className="space-y-3">
                  {childSummary.attendance.absentAlerts.map((abs, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-rose-900">Recorded Absence: {abs.date}</div>
                        <div className="text-rose-700 mt-0.5">{abs.remarks || 'Unexcused absence logged by teacher.'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-800 flex items-center space-x-3 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold">Zero Unexcused Absences!</div>
                    <div className="text-emerald-700 mt-0.5">{activeChild.student_name} has maintained 100% punctual attendance this academic month.</div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-6 bg-white rounded-2xl border border-teal-100 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span>Latest School Notices & Circulars</span>
              </h3>

              <div className="space-y-3">
                {announcements.slice(0, 2).map((a) => (
                  <div key={a.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{a.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-700">
                        {a.category}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-normal">{a.content}</p>
                    <div className="text-[10px] text-slate-400">Date: {a.created_at?.split('T')[0] || 'Today'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC GRADES */}
      {activeTab === 'progress' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Official Academic Progress & Examination Marks</h3>
              <p className="text-xs text-slate-500">Marks entered by teachers flow directly into this gradebook report card</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              GPA Distinction
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Subject / Course</th>
                    <th className="py-3.5 px-4">Assessment Plan</th>
                    <th className="py-3.5 px-4">Score Obtained</th>
                    <th className="py-3.5 px-4">Percentage</th>
                    <th className="py-3.5 px-4">Letter Grade</th>
                    <th className="py-3.5 px-4">Teacher Evaluative Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {childSummary?.results?.map((res) => (
                    <tr key={res.name} className="hover:bg-teal-50/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {res.course}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {res.assessment_plan}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {res.score} / {res.maximum_score}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-teal-700">
                        {res.percentage}%
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded font-bold text-xs ${
                          res.grade.startsWith('A') ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {res.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 italic">
                        "{res.comment || 'Consistent understanding demonstrated.'}"
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE TRACKING */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Monthly Attendance Record for {activeChild.student_name}</h3>
              <p className="text-xs text-slate-500">Live attendance marked daily by subject faculty & form tutor</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-600">
                {childSummary?.attendance?.percentage || 100}%
              </span>
              <div className="text-[10px] text-slate-400">Total Classes Attended</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-teal-100 text-xs space-y-2">
            <h4 className="font-bold text-slate-800">Attendance Policy Reminder</h4>
            <p className="text-slate-600 leading-relaxed">
              Minimum 75% attendance is mandatory as per board regulations for mid-term exam clearance. 
              Any unplanned absence will trigger an automated SMS/Notification to the registered parent contact.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: FEE STRUCTURE & PAYMENTS */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Term Billed Fee</span>
              <div className="text-2xl font-black text-slate-800 mt-2">
                ${childSummary?.fees?.[0]?.grand_total || '1,450.00'}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Outstanding Dues</span>
              <div className="text-2xl font-black text-rose-600 mt-2">
                ${childSummary?.fees?.[0]?.outstanding_amount || '0.00'}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Status</span>
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  (childSummary?.fees?.[0]?.outstanding_amount || 0) === 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {childSummary?.fees?.[0]?.status || 'Paid'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Fee Breakdown & Payment Action</h3>
              {(childSummary?.fees?.[0]?.outstanding_amount || 0) > 0 ? (
                <button
                  onClick={() => {
                    setSelectedFee(childSummary.fees[0]);
                    setShowPaymentModal(true);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold text-xs shadow-md shadow-teal-500/25 flex items-center space-x-1.5 transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Online (${childSummary.fees[0].outstanding_amount})</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Paid in Full &bull; Receipt: {childSummary?.fees?.[0]?.receipt_no || 'REC-2026-90412'}</span>
                </span>
              )}
            </div>

            <div className="space-y-2">
              {childSummary?.fees?.[0]?.components?.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{c.fee_category}</span>
                    <p className="text-slate-500 text-[11px]">{c.description}</p>
                  </div>
                  <span className="font-mono font-bold text-slate-800">${Number(c.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SYLLABUS PROGRESS */}
      {activeTab === 'syllabus' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Syllabus Progression Across All Subjects</h3>
              <p className="text-xs text-slate-500">
                Track exactly how much coursework has been taught vs. remaining for the upcoming mid-term exams.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700">
              Direct Teacher Feed
            </span>
          </div>

          <div className="space-y-3">
            {childSummary?.syllabus?.map((s) => {
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
                    <span>{s.completed_topics} / {s.total_topics} topics completed</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: TIMETABLE & SCHOOL TIMING */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Weekly Timetable & Daily School Hours</h3>
              <p className="text-xs text-slate-500">School Hours: 08:00 AM &ndash; 03:30 PM &bull; Monday through Friday</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              Grade 10-A Timetable
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {childSummary?.timetable?.slice(0, 6).map((sc, i) => (
              <div key={i} className="p-4 rounded-xl bg-white border border-teal-100 shadow-sm flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800 text-sm">{sc.subject}</div>
                  <div className="text-slate-500 mt-0.5">{sc.day_of_week} &bull; {sc.room}</div>
                  <div className="text-teal-600 font-semibold mt-1">Instructor: {sc.faculty_name}</div>
                </div>
                <div className="text-right font-mono font-bold text-slate-700">
                  {sc.from_time?.slice(0, 5)} - {sc.to_time?.slice(0, 5)}
                </div>
              </div>
            ))}
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
                  {childSummary?.transport?.route_name || 'Route 04 — North City Express'}
                </h3>
                <p className="text-xs text-slate-500">
                  Bus Registration Number: <strong className="text-slate-700">{childSummary?.transport?.bus_number || 'KA-04-E-8821'}</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Morning Pickup Details</span>
                <div className="font-bold text-slate-800 text-sm">{childSummary?.transport?.pickup_location || 'Green Valley Stop (Gate 2)'}</div>
                <div className="text-teal-700 font-bold">Scheduled Arrival: {childSummary?.transport?.pickup_time || '07:35 AM'}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Afternoon Drop Details</span>
                <div className="font-bold text-slate-800 text-sm">{childSummary?.transport?.drop_location || 'Green Valley Stop (Gate 2)'}</div>
                <div className="text-teal-700 font-bold">Scheduled Arrival: {childSummary?.transport?.drop_time || '03:45 PM'}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500">Assigned Driver: <strong>{childSummary?.transport?.driver_name || 'Mr. David K.'}</strong></span>
                <div className="text-slate-700 mt-0.5">Emergency Contact: <strong>{childSummary?.transport?.driver_phone || '+1 (555) 882-1920'}</strong></div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={`https://wa.me/${(childSummary?.transport?.driver_phone || '15558821920').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${childSummary?.transport?.driver_name || 'Driver'}, this is ${user?.full_name || 'Parent'} (Parent of ${activeChild?.student_name || 'Nairee'}). Regarding Bus ${childSummary?.transport?.bus_number || 'Route 04'}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Driver</span>
                </a>
                <a
                  href={`tel:${childSummary?.transport?.driver_phone || '+15558821920'}`}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors"
                >
                  Call
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: COMMUNICATION */}
      {activeTab === 'communication' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Parent-Teacher Communication</h3>
              <p className="text-xs text-slate-500">Direct message exchange with subject faculty & administration</p>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={`https://wa.me/15552345678?text=${encodeURIComponent(`Hello Prof. Sarah Jenkins, this is ${user?.full_name || 'Rajesh Patel'} (Parent of ${activeChild?.student_name || 'Nairee Patel'}). I would like to inquire about my child's coursework and progress.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Teacher</span>
              </a>
              <button
                onClick={() => setShowMessageModal(true)}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 flex items-center space-x-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Message Portal</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800 text-xs">From: {m.sender_name}</span>
                    <span className="text-slate-400">&rarr;</span>
                    <span className="font-bold text-teal-700 text-xs">To: {m.recipient_name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{m.created_at?.split('T')[0] || 'Today'}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{m.subject}</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {m.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: SCHOOL CALENDAR (ON / OFF TRACKER) */}
      {activeTab === 'calendar' && (
        <SchoolCalendarView />
      )}

        </div>
      </div>

      {/* ONLINE PAYMENT MODAL */}
      {showPaymentModal && selectedFee && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) { setShowPaymentModal(false); setPaymentSuccess(null); } }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-teal-100">
            <h3 className="font-bold text-slate-800 text-base mb-1">Online Fee Payment Portal</h3>
            <p className="text-xs text-slate-500 mb-4">
              Secure 256-bit encrypted school fee remittance for {activeChild.student_name}
            </p>

            {paymentSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 text-xs">
                <div className="flex items-center space-x-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Payment Successful!</span>
                </div>
                <div>Receipt Number: <strong className="font-mono">{paymentSuccess.receipt_no}</strong></div>
                <div>Amount Paid: <strong>${paymentSuccess.amountPaid}</strong></div>
                <div>Payment Date: {paymentSuccess.payment_date}</div>
                <p className="text-emerald-700 pt-1">
                  Status in school ledger updated to <strong>Paid</strong>. Instant notification sent to Admin Accounts.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentSuccess(null);
                  }}
                  className="w-full mt-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Close & View Updated Ledger
                </button>
              </div>
            ) : (
              <form onSubmit={handlePayFee} className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Invoice Amount:</span>
                    <span>${selectedFee.outstanding_amount}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Invoice ID: {selectedFee.name} &bull; Term 1 Academic Fee
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Payment Gateway</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="Credit Card / Stripe">Credit Card (Visa / Mastercard / Amex)</option>
                    <option value="UPI / QR Payment">Instant UPI & NetBanking</option>
                    <option value="Bank Wire / ACH">Direct School Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Card / Account Holder</label>
                  <input
                    type="text"
                    defaultValue={user?.full_name || 'Rajesh Patel'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs shadow-md shadow-teal-500/20 disabled:opacity-50 flex items-center justify-center space-x-1.5"
                  >
                    {isProcessingPayment ? 'Processing...' : `Confirm Pay $${selectedFee.outstanding_amount}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MESSAGE TEACHER MODAL */}
      {showMessageModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowMessageModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-teal-100">
            <h3 className="font-bold text-slate-800 text-base mb-4">Message Class Faculty</h3>
            <form onSubmit={handleSendMessageToTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Faculty</label>
                <input
                  type="text"
                  disabled
                  value="Prof. Sarah Jenkins (Head of Mathematics & Class Tutor)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-100 text-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. Question regarding ${activeChild.student_name}'s Olympiad Prep`}
                  value={replyMessage.subject}
                  onChange={(e) => setReplyMessage({ ...replyMessage, subject: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message Details</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type your question or message for the faculty instructor..."
                  value={replyMessage.message}
                  onChange={(e) => setReplyMessage({ ...replyMessage, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs shadow-md shadow-teal-500/20"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
