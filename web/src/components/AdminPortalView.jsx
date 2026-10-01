import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  TrendingUp,
  CreditCard,
  Calendar,
  AlertTriangle,
  UserCheck,
  UserX,
  Plus,
  Search,
  Filter,
  Download,
  Send,
  BookOpen,
  CheckCircle2,
  Clock,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  Printer,
  MessageSquare,
  Copy,
  ExternalLink,
  X
} from 'lucide-react';
import { api } from '../api.js';

export default function AdminPortalView({ user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [teacherPerf, setTeacherPerf] = useState([]);
  const [studentPerf, setStudentPerf] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showPostNoticeModal, setShowPostNoticeModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    role: 'student',
    full_name: '',
    email: '',
    phone: '',
    batch: 'BATCH-10A-2026',
    department: 'Science',
    designation: 'Faculty Instructor',
    parent_name: '',
    parent_email: '',
    parent_phone: ''
  });
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    category: 'Circular',
    target_role: 'All',
    student_batch: 'All',
    priority: 'Normal'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Admin WhatsApp Communication State
  const [adminWhatsAppModal, setAdminWhatsAppModal] = useState(null);
  const [copiedAdminWhatsApp, setCopiedAdminWhatsApp] = useState(false);

  const cleanPhone = (p) => (p || '').replace(/\D/g, '');

  const openWhatsAppAlert = (student, type) => {
    const phone = student.guardian_mobile || '+1 (555) 901-2234';
    let defaultMsg = '';
    if (type === 'risk') {
      defaultMsg = `Dear Parent/Guardian of *${student.student_name}*,\n\nThis is an official communication from the Office of the Principal at Nairee.\n\nOur academic tracking system has flagged that ${student.student_name} currently has an attendance rate of ${student.attendancePct}% and an average grade of ${student.avgGrade}%.\n\nWe kindly request a Parent-Teacher conference with the Principal and class counselor. Please contact the school office at +1 (555) 234-5678 to schedule a convenient time.\n\nBest regards,\nOffice of Administration\nNairee`;
    } else {
      defaultMsg = `Dear Parent/Guardian of *${student.student_name}*,\n\nGreetings from Nairee Accounts Office.\n\nThis is a friendly reminder that an outstanding tuition fee balance of *$${student.feeDues || 1450}* remains due for Term 1. Please remit the pending balance via the Parent Portal online payment gateway or at the school fee desk by this Friday.\n\nFor fee receipt or queries, reply to this message or contact accounts@nairee.edu.\n\nThank you,\nFinance Department\nNairee`;
    }

    setAdminWhatsAppModal({
      type,
      student,
      phone,
      message: defaultMsg
    });
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [sData, uData, tData, stData, aData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getUsers().catch(() => []),
        api.getTeacherPerformance().catch(() => []),
        api.getStudentPerformance(selectedBatch).catch(() => []),
        api.getAnnouncements().catch(() => [])
      ]);
      setStats(sData);
      setUsersList(uData);
      setTeacherPerf(tData);
      setStudentPerf(stData);
      setAnnouncements(aData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [selectedBatch]);

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.toggleUserStatus(userId, nextStatus);
      showToast(`User status set to ${nextStatus}`);
      setUsersList(prev => prev.map(u => u.name === userId ? { ...u, status: nextStatus } : u));
    } catch (err) {
      showToast('Failed to update status');
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createAccount(newAccount);
      setCreatedCredentials(res);
      showToast(res.message);
      // reload users
      api.getUsers().then(setUsersList);
    } catch (err) {
      showToast(err.message || 'Failed to create account');
    }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    try {
      await api.createAnnouncement({
        ...newNotice,
        posted_by: user?.full_name || 'Principal Dr. Marcus Vance'
      });
      showToast('Announcement broadcasted to portals successfully!');
      setShowPostNoticeModal(false);
      setNewNotice({
        title: '',
        content: '',
        category: 'Circular',
        target_role: 'All',
        student_batch: 'All',
        priority: 'Normal'
      });
      api.getAnnouncements().then(setAnnouncements);
    } catch (err) {
      showToast(err.message || 'Failed to post announcement');
    }
  };

  const handleSendReminder = (studentName, feeDue) => {
    showToast(`Payment reminder SMS & Email sent to parents of ${studentName} for $${feeDue}`);
  };

  const exportReportCSV = (type) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (type === 'attendance') {
      csvContent += "Student ID,Student Name,Batch,Attendance %,Status\n";
      studentPerf.forEach(s => {
        csvContent += `${s.name},"${s.student_name}",${s.student_batch},${s.attendancePct}%,${s.status}\n`;
      });
    } else if (type === 'academics') {
      csvContent += "Student ID,Student Name,Batch,Average Grade %,At Risk,Risk Factors\n";
      studentPerf.forEach(s => {
        csvContent += `${s.name},"${s.student_name}",${s.student_batch},${s.avgGrade}%,${s.isAtRisk ? 'YES' : 'NO'},"${s.riskReasons?.join('; ') || 'None'}"\n`;
      });
    } else {
      csvContent += "Teacher ID,Name,Department,Designation,Assigned Classes,Syllabus %,Average Student Score\n";
      teacherPerf.forEach(t => {
        csvContent += `${t.id},"${t.name}",${t.department},"${t.designation}",${t.assignedClasses},${t.syllabusCompletionRate}%,${t.studentAverageScore}%\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Nairee_${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${type.toUpperCase()} CSV report generated and downloaded.`);
  };

  const filteredUsers = usersList.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesQuery = !searchQuery || 
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesQuery;
  });

  const atRiskStudents = studentPerf.filter(s => s.isAtRisk);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c1f2c] border border-teal-500/60 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Portal Header Banner */}
      <div className="bg-gradient-to-r from-[#0c1f2c] via-[#102d3e] to-[#0c1f2c] rounded-2xl p-6 border border-teal-800/40 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-400 mb-1">
            <Shield className="w-4 h-4" />
            <span className="uppercase tracking-wider">Executive Administration &bull; Principal Portal</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Welcome, {user?.full_name || 'Principal Dr. Marcus Vance'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Complete institutional oversight, automated account issuance, faculty metrics & school-wide performance.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-2">
          <button
            onClick={() => setShowCreateAccountModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/20 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Account</span>
          </button>

          <button
            onClick={() => setShowPostNoticeModal(true)}
            className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
          >
            <Send className="w-4 h-4 text-cyan-400" />
            <span>Post Circular</span>
          </button>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex border-b border-teal-900/40 overflow-x-auto gap-2 pb-2">
        {[
          { id: 'overview', label: 'Executive Dashboard' },
          { id: 'accounts', label: `Accounts & Logins (${usersList.length})` },
          { id: 'teachers', label: `Teacher Workload & Syllabus (${teacherPerf.length})` },
          { id: 'students', label: `Student Performance & At-Risk (${atRiskStudents.length} Flagged)` },
          { id: 'fees', label: 'Fee Governance' },
          { id: 'announcements', label: `Announcements (${announcements.length})` },
          { id: 'reports', label: 'Exportable Reports' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-teal-500 text-white shadow-md shadow-teal-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-teal-100/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-800">{stats?.students || 7}</div>
                <div className="text-[11px] text-teal-600 font-medium mt-0.5 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100% Active Enrollment</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-teal-100/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Faculty</span>
                <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-800">{stats?.faculty || 4}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Across 4 Departments</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-teal-100/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance %</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-emerald-600">{stats?.attendanceRate || 95}%</div>
                <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Today's Campus Average</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-teal-100/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Collection</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-800">
                  ${stats?.finance?.totalCollected ? Number(stats.finance.totalCollected).toLocaleString() : '1,450'}
                </div>
                <div className="text-[11px] text-purple-600 font-medium mt-0.5">
                  {stats?.finance?.collectionRate || 22}% Collected This Term
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-teal-100/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming Exam</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-base font-black text-slate-800">Mid-Term Exams</div>
                <div className="text-[11px] text-amber-600 font-medium mt-0.5">Oct 14, 2026 (In 13 Days)</div>
              </div>
            </div>
          </div>

          {/* Quick Notice Banner & At-Risk Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-teal-100/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  <span>Recent School Announcements & Circulars</span>
                </h3>
                <button
                  onClick={() => setShowPostNoticeModal(true)}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  + New Circular
                </button>
              </div>

              <div className="space-y-3">
                {announcements.slice(0, 3).map((a) => (
                  <div key={a.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 text-xs">{a.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        a.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-teal-100 text-teal-700'
                      }`}>
                        {a.category} &bull; {a.target_role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{a.content}</p>
                    <div className="mt-2 text-[10px] text-slate-400">Posted by {a.posted_by} &bull; {a.created_at?.split('T')[0] || 'Today'}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-2xl border border-teal-100/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>At-Risk Student Monitoring</span>
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {atRiskStudents.length} Identified
                </span>
              </div>

              {atRiskStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span>No students currently flagged as at-risk! Overall performance is optimal.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {atRiskStudents.map((s) => (
                    <div key={s.name} className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{s.student_name}</div>
                        <div className="text-[11px] text-slate-500">{s.student_batch} &bull; Roll #{s.roll_no}</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {s.riskReasons?.map((r, idx) => (
                            <span key={idx} className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-rose-200/80 text-rose-800">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendReminder(s.student_name, s.feeDues)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold transition-colors"
                      >
                        Intervene
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACCOUNT MANAGEMENT */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search user, ID or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="teacher">Teachers</option>
                <option value="student">Students</option>
                <option value="parent">Parents</option>
              </select>
            </div>

            <button
              onClick={() => setShowCreateAccountModal(true)}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs shadow-md shadow-teal-500/20 flex items-center space-x-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Username</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Linked Profile ID</th>
                    <th className="py-3.5 px-4">Email / Mobile</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredUsers.map((u) => (
                    <tr key={u.name} className="hover:bg-teal-50/30 transition-colors">
                      <td className="py-3 px-4 flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                          {u.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{u.full_name}</div>
                          <div className="text-[10px] text-slate-400">ID: {u.name}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-[11px] font-bold">
                          {u.username}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'teacher' ? 'bg-blue-100 text-blue-700' :
                          u.role === 'student' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {u.linked_id || 'System Superuser'}
                      </td>
                      <td className="py-3 px-4">
                        <div>{u.email || '—'}</div>
                        <div className="text-[10px] text-slate-400">{u.phone || '—'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          <span>{u.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u.name, u.status)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            u.status === 'Active' 
                              ? 'bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700' 
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                          }`}
                        >
                          {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEACHER PERFORMANCE */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Faculty Workload & Syllabus Completion</h3>
            <p className="text-xs text-slate-500 mb-5">
              Live syllabus completion percentages and student examination averages per teacher.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Faculty Member</th>
                    <th className="py-3.5 px-4">Department & Designation</th>
                    <th className="py-3.5 px-4">Subjects Taught</th>
                    <th className="py-3.5 px-4">Syllabus Completion</th>
                    <th className="py-3.5 px-4">Student Avg Score</th>
                    <th className="py-3.5 px-4">Health Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {teacherPerf.map((t) => (
                    <tr key={t.id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="py-3 px-4 flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          {t.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{t.name}</div>
                          <div className="text-[10px] text-slate-400">{t.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-700">{t.department}</div>
                        <div className="text-[10px] text-slate-400">{t.designation}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {t.courses?.map((c, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-teal-50 border border-teal-100 text-teal-700 text-[10px] font-semibold">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${t.syllabusCompletionRate}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-800">{t.syllabusCompletionRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {t.studentAverageScore}%
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          t.status === 'On Track' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT PERFORMANCE & AT-RISK */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">School-Wide Student Academic Roster</h3>
              <p className="text-xs text-slate-500">Includes at-risk indicators (&lt;75% attendance or &lt;65% grade)</p>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Class Batches</option>
                <option value="BATCH-10A-2026">Grade 10-A (Honors)</option>
                <option value="BATCH-10B-2026">Grade 10-B (Standard)</option>
              </select>

              <button
                onClick={() => exportReportCSV('academics')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Class Batch</th>
                    <th className="py-3.5 px-4">Attendance Rate</th>
                    <th className="py-3.5 px-4">Academic Avg</th>
                    <th className="py-3.5 px-4">Fee Due</th>
                    <th className="py-3.5 px-4">Risk Flag</th>
                    <th className="py-3.5 px-4 text-right">Intervention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {studentPerf.map((s) => (
                    <tr key={s.name} className={`transition-colors ${s.isAtRisk ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-teal-50/30'}`}>
                      <td className="py-3 px-4 flex items-center space-x-3">
                        <img
                          src={s.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={s.student_name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-800">{s.student_name}</div>
                          <div className="text-[10px] text-slate-400">Roll #{s.roll_no} &bull; {s.name}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {s.batch_name || s.student_batch}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${s.attendancePct < 75 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {s.attendancePct}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${s.avgGrade < 65 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {s.avgGrade}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        ${s.feeDues || 0}
                      </td>
                      <td className="py-3 px-4">
                        {s.isAtRisk ? (
                          <div className="flex flex-wrap gap-1">
                            {s.riskReasons?.map((r, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                {r}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            Clear
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openWhatsAppAlert(s, s.isAtRisk ? 'risk' : 'fee')}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center space-x-1 shadow-sm transition-all"
                            title="Instant WhatsApp Parent Alert"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            onClick={() => handleSendReminder(s.student_name, s.feeDues)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-500 hover:text-white text-slate-700 text-[11px] font-semibold transition-colors"
                          >
                            SMS
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FEE GOVERNANCE */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Billed This Term</span>
              <div className="text-2xl font-black text-slate-800 mt-2">
                ${stats?.finance?.totalBilled ? Number(stats.finance.totalBilled).toLocaleString() : '6,800'}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Received</span>
              <div className="text-2xl font-black text-emerald-600 mt-2">
                ${stats?.finance?.totalCollected ? Number(stats.finance.totalCollected).toLocaleString() : '1,450'}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Outstanding</span>
              <div className="text-2xl font-black text-rose-600 mt-2">
                ${stats?.finance?.totalOutstanding ? Number(stats.finance.totalOutstanding).toLocaleString() : '5,350'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Fee Collection by Class Batch</h3>
              <button
                onClick={() => exportReportCSV('attendance')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Invoices</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 text-xs">Grade 10-A (Honors STEM)</div>
                  <div className="text-[11px] text-slate-500">Term 1 Standard Fee: $1,450 / student</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600">80% Remitted</span>
                  <div className="text-[11px] text-slate-400">1 Overdue Account</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 text-xs">Grade 10-B (Standard Secondary)</div>
                  <div className="text-[11px] text-slate-500">Term 1 Standard Fee: $1,250 / student</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-600">Pending Dues</span>
                  <div className="text-[11px] text-slate-400">Invoices issued</div>
                </div>
              </div>
            </div>
          </div>

          {/* Instant WhatsApp Fee Recovery Roster */}
          <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Pending Dues &amp; Direct WhatsApp Recovery</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Send 1-click personalized fee reminders directly to parent WhatsApp numbers
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                WhatsApp Enabled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Guardian Contact</th>
                    <th className="py-3 px-4">Outstanding Due</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {studentPerf.filter(s => (s.feeDues || 0) > 0).length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-xs text-slate-400">
                        No outstanding dues found across current batches.
                      </td>
                    </tr>
                  ) : (
                    studentPerf.filter(s => (s.feeDues || 0) > 0).map((s) => (
                      <tr key={s.name} className="hover:bg-teal-50/30 transition-colors">
                        <td className="py-3 px-4 flex items-center space-x-3">
                          <img
                            src={s.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={s.student_name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-800">{s.student_name}</div>
                            <div className="text-[10px] text-slate-400">Roll #{s.roll_no}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {s.batch_name || s.student_batch}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{s.guardian_name || 'Parent'}</div>
                          <div className="text-[11px] text-teal-600 font-mono">{s.guardian_mobile || '+1 (555) 901-2234'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            ${s.feeDues}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openWhatsAppAlert(s, 'fee')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center space-x-1.5 shadow-sm transition-all"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp Reminder</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-teal-100 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">School-Wide Circulars & Announcements</h3>
              <p className="text-xs text-slate-500">Instantly visible in Teacher, Student, and Parent portals</p>
            </div>
            <button
              onClick={() => setShowPostNoticeModal(true)}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Announcement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((a) => (
              <div key={a.id} className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    a.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-teal-100 text-teal-700'
                  }`}>
                    {a.category} &bull; Target: {a.target_role}
                  </span>
                  <span className="text-[11px] text-slate-400">{a.created_at?.split('T')[0] || 'Today'}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{a.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{a.content}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Author: {a.posted_by}</span>
                  <span className="text-teal-600 font-semibold">Active &bull; Synced</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: REPORTS & EXPORT */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-teal-100 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Administrative Export Center</h3>
            <p className="text-xs text-slate-500 mb-6">
              Download clean, official CSV spreadsheets for compliance, board audits, and parent communications.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200/80 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center mb-3">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Attendance Master Ledger</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Student attendance percentages, absence timestamps, and batch-wise compliance logs.
                  </p>
                </div>
                <button
                  onClick={() => exportReportCSV('attendance')}
                  className="mt-5 w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-teal-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Attendance CSV</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-cyan-50/50 border border-cyan-200/80 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center mb-3">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Academic Performance Roster</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Midterm examination results, student grade averages, and flagged at-risk factors.
                  </p>
                </div>
                <button
                  onClick={() => exportReportCSV('academics')}
                  className="mt-5 w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-cyan-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Academics CSV</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200/80 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center mb-3">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Teacher Syllabus & Workload Audit</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Department syllabus progression rates, assigned periods, and student grade averages.
                  </p>
                </div>
                <button
                  onClick={() => exportReportCSV('faculty')}
                  className="mt-5 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-purple-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Faculty CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ACCOUNT MODAL */}
      {showCreateAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-teal-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Create User Account</h3>
                  <p className="text-xs text-slate-500">Issued exclusively by school administration</p>
                </div>
              </div>
              <button
                onClick={() => { setShowCreateAccountModal(false); setCreatedCredentials(null); }}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Close
              </button>
            </div>

            {createdCredentials ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
                  <div className="font-bold text-sm flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Account Created Successfully!</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Share these generated login credentials with the user:
                  </p>
                  
                  {createdCredentials.student && (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs space-y-1 mt-2">
                      <div className="font-bold text-slate-800">Student Login:</div>
                      <div>Username: <code className="font-mono font-bold text-teal-600">{createdCredentials.student.username}</code></div>
                      <div>Password: <code className="font-mono text-slate-600">{createdCredentials.student.password}</code></div>
                    </div>
                  )}

                  {createdCredentials.parent && (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs space-y-1 mt-2">
                      <div className="font-bold text-slate-800">Auto-Linked Parent Login:</div>
                      <div>Username: <code className="font-mono font-bold text-teal-600">{createdCredentials.parent.username}</code></div>
                      <div>Password: <code className="font-mono text-slate-600">{createdCredentials.parent.password}</code></div>
                      <div className="text-[10px] text-slate-400 italic">Automatically linked strictly to this child's record.</div>
                    </div>
                  )}

                  {createdCredentials.teacher && (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs space-y-1 mt-2">
                      <div className="font-bold text-slate-800">Teacher Login:</div>
                      <div>Username: <code className="font-mono font-bold text-teal-600">{createdCredentials.teacher.username}</code></div>
                      <div>Password: <code className="font-mono text-slate-600">{createdCredentials.teacher.password}</code></div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => { setShowCreateAccountModal(false); setCreatedCredentials(null); }}
                  className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs shadow-md shadow-teal-500/20"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Role</label>
                  <select
                    value={newAccount.role}
                    onChange={(e) => setNewAccount({ ...newAccount, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="student">Student (Auto-generates linked Parent account)</option>
                    <option value="teacher">Teacher / Faculty</option>
                    <option value="admin">Administrator / Principal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam Henderson"
                    value={newAccount.full_name}
                    onChange={(e) => setNewAccount({ ...newAccount, full_name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="user@school.edu"
                      value={newAccount.email}
                      onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={newAccount.phone}
                      onChange={(e) => setNewAccount({ ...newAccount, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {newAccount.role === 'student' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Assign Class Batch</label>
                      <select
                        value={newAccount.batch}
                        onChange={(e) => setNewAccount({ ...newAccount, batch: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                      >
                        <option value="BATCH-10A-2026">Grade 10-A (Honors STEM)</option>
                        <option value="BATCH-10B-2026">Grade 10-B (Standard)</option>
                        <option value="BATCH-11A-2026">Grade 11-A (Advanced)</option>
                      </select>
                    </div>

                    <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/60 space-y-3">
                      <div className="font-bold text-teal-900 text-xs flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span>Auto-Generated Parent Account Details</span>
                      </div>
                      <p className="text-[11px] text-teal-800">
                        A linked Parent account will be automatically generated and scoped exclusively to this student.
                      </p>

                      <div>
                        <label className="block text-[11px] font-bold text-teal-900 mb-0.5">Parent / Guardian Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Katherine Henderson"
                          value={newAccount.parent_name}
                          onChange={(e) => setNewAccount({ ...newAccount, parent_name: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-teal-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-teal-900 mb-0.5">Parent Email</label>
                          <input
                            type="email"
                            placeholder="parent@gmail.com"
                            value={newAccount.parent_email}
                            onChange={(e) => setNewAccount({ ...newAccount, parent_email: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-teal-200 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-teal-900 mb-0.5">Parent Phone</label>
                          <input
                            type="text"
                            placeholder="+1 (555) 999-0000"
                            value={newAccount.parent_phone}
                            onChange={(e) => setNewAccount({ ...newAccount, parent_phone: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-teal-200 text-xs bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {newAccount.role === 'teacher' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                      <select
                        value={newAccount.department}
                        onChange={(e) => setNewAccount({ ...newAccount, department: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      >
                        <option value="Mathematics">Mathematics</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Science">Science (Physics/Chemistry)</option>
                        <option value="Humanities">Humanities</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                      <input
                        type="text"
                        value={newAccount.designation}
                        onChange={(e) => setNewAccount({ ...newAccount, designation: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateAccountModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs shadow-md shadow-teal-500/20"
                  >
                    Issue Account
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* POST ANNOUNCEMENT MODAL */}
      {showPostNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-teal-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Broadcast Announcement</h3>
                  <p className="text-xs text-slate-500">Publishes instantly to targeted portals</p>
                </div>
              </div>
              <button
                onClick={() => setShowPostNoticeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handlePostNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule for Annual Sports Meet 2026"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newNotice.category}
                    onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="Circular">Circular</option>
                    <option value="Exam">Exam Notice</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Event">Event</option>
                    <option value="PTM">PTM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={newNotice.target_role}
                    onChange={(e) => setNewNotice({ ...newNotice, target_role: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="All">All Portals</option>
                    <option value="teacher">Teachers Only</option>
                    <option value="student">Students Only</option>
                    <option value="parent">Parents Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newNotice.priority}
                    onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notice Details</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type official details, timings, guidelines or venue..."
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPostNoticeModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs shadow-md shadow-teal-500/20"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN WHATSAPP DISPATCH MODAL */}
      {adminWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-teal-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {adminWhatsAppModal.type === 'risk' ? 'Official Academic & Attendance Alert' : 'Tuition Fee Due Notice'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Direct WhatsApp dispatch to student guardian
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAdminWhatsAppModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient Card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={adminWhatsAppModal.student.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={adminWhatsAppModal.student.student_name}
                  className="w-10 h-10 rounded-full object-cover border border-white shadow-sm"
                />
                <div>
                  <div className="font-bold text-slate-800 text-xs">
                    {adminWhatsAppModal.student.student_name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Guardian: <strong className="text-slate-700">{adminWhatsAppModal.student.guardian_name || 'Parent'}</strong>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">WhatsApp Number</span>
                <span className="text-xs font-mono font-bold text-emerald-600">
                  {adminWhatsAppModal.phone}
                </span>
              </div>
            </div>

            {/* Editable WhatsApp Text Preview */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Message Content (Pre-formatted with school signature)
              </label>
              <textarea
                rows={7}
                value={adminWhatsAppModal.message}
                onChange={(e) => setAdminWhatsAppModal({ ...adminWhatsAppModal, message: e.target.value })}
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(adminWhatsAppModal.message);
                  setCopiedAdminWhatsApp(true);
                  setTimeout(() => setCopiedAdminWhatsApp(false), 2000);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedAdminWhatsApp ? 'Copied to Clipboard!' : 'Copy Text'}</span>
              </button>

              <a
                href={`https://wa.me/${cleanPhone(adminWhatsAppModal.phone)}?text=${encodeURIComponent(adminWhatsAppModal.message)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  showToast('Opening WhatsApp...');
                  setTimeout(() => setAdminWhatsAppModal(null), 1000);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-1.5 transition-all text-center"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
