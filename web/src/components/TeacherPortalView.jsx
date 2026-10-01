import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  UserCheck,
  BookOpen,
  FileText,
  Award,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Plus,
  Send,
  Upload,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Users,
  AlertCircle,
  MessageCircle,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../api.js';

export default function TeacherPortalView({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [schedule, setSchedule] = useState([]);
  const [syllabusList, setSyllabusList] = useState([]);
  const [homeworkList, setHomeworkList] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [messages, setMessages] = useState([]);
  const [assessmentPlans, setAssessmentPlans] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBatch, setSelectedBatch] = useState('BATCH-10A-2026');
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  // Modals & Drawers
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedHomeworkForGrading, setSelectedHomeworkForGrading] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const [whatsAppModalStudent, setWhatsAppModalStudent] = useState(null);
  const [whatsAppTemplate, setWhatsAppTemplate] = useState('absent');
  const [copiedText, setCopiedText] = useState(false);
  const [showBulkWhatsAppModal, setShowBulkWhatsAppModal] = useState(false);

  // Form states
  const [newHomework, setNewHomework] = useState({
    title: '',
    course: 'CRS-MATH-10',
    subject: 'Mathematics',
    student_batch: 'BATCH-10A-2026',
    due_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    instructions: '',
    max_points: 100
  });

  const [newMaterial, setNewMaterial] = useState({
    title: '',
    course: 'CRS-MATH-10',
    subject: 'Mathematics',
    student_batch: 'BATCH-10A-2026',
    material_type: 'PDF',
    url: '',
    description: ''
  });

  const [newGrade, setNewGrade] = useState({
    assessment_plan: 'ASM-MATH-MID',
    course: 'CRS-MATH-10',
    student: 'EDU-STU-2026-00001',
    student_name: 'Nairee Patel',
    student_batch: 'BATCH-10A-2026',
    score: 95,
    maximum_score: 100,
    comment: 'Exceptional analytical proofs and thorough presentation.'
  });

  const [newMessage, setNewMessage] = useState({
    recipient_username: 'parent_patel',
    recipient_name: 'Rajesh Patel (Nairee\'s Father)',
    recipient_role: 'parent',
    student_batch: 'BATCH-10A-2026',
    subject: '',
    message: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadData = async () => {
    try {
      const [sch, syl, hw, mat, msg, plans, stuList] = await Promise.all([
        api.getSchedule(selectedBatch).catch(() => []),
        api.getSyllabus({ batch: selectedBatch }).catch(() => []),
        api.getHomework({ batch: selectedBatch }).catch(() => []),
        api.getStudyMaterials({ batch: selectedBatch }).catch(() => []),
        api.getMessages(user?.username, 'teacher').catch(() => []),
        api.getAssessmentPlans().catch(() => []),
        api.getStudents(selectedBatch).catch(() => [])
      ]);
      setSchedule(sch);
      setSyllabusList(syl);
      setHomeworkList(hw);
      setStudyMaterials(mat);
      setMessages(msg);
      setAssessmentPlans(plans);
      setStudents(stuList);

      // Default attendance records to Present
      const initialAtt = {};
      stuList.forEach(s => {
        initialAtt[s.name] = 'Present';
      });
      setAttendanceRecords(initialAtt);
    } catch (err) {
      console.error('Error loading teacher data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBatch]);

  // Update Syllabus Topic Completion
  const handleUpdateSyllabus = async (item, newCompleted) => {
    const safeCompleted = Math.max(0, Math.min(item.total_topics, newCompleted));
    const newStatus = safeCompleted === item.total_topics ? 'Completed' : safeCompleted > 0 ? 'In Progress' : 'Upcoming';
    try {
      await api.updateSyllabus(item.id, { completed_topics: safeCompleted, status: newStatus });
      setSyllabusList(prev => prev.map(s => s.id === item.id ? { ...s, completed_topics: safeCompleted, status: newStatus } : s));
      showToast(`Updated "${item.chapter_title}" &rarr; ${safeCompleted}/${item.total_topics} topics. (Live in Student & Parent portals)`);
    } catch (err) {
      showToast('Failed to update syllabus');
    }
  };

  // Submit Attendance
  const handleSaveAttendance = async () => {
    const records = Object.entries(attendanceRecords).map(([studentId, status]) => {
      const st = students.find(s => s.name === studentId);
      return {
        student: studentId,
        student_name: st?.student_name || 'Student',
        status,
        remarks: status === 'Absent' ? 'Unexcused Absence - Alert Dispatched to Parent' : 'Present on time'
      };
    });

    try {
      await api.submitBulkAttendance(selectedBatch, attendanceDate, records);
      showToast(`✅ Attendance successfully marked for ${records.length} students! Instantly visible in Student & Parent portals.`);
    } catch (err) {
      showToast('Failed to save attendance');
    }
  };

  // Submit Homework
  const handleCreateHomework = async (e) => {
    e.preventDefault();
    try {
      await api.createHomework({
        ...newHomework,
        faculty: user?.faculty_id || 'EDU-FAC-2026-00002',
        faculty_name: user?.full_name || 'Prof. Sarah Jenkins'
      });
      showToast('Homework assigned! Students can now submit solutions via their portal.');
      setShowHomeworkModal(false);
      api.getHomework({ batch: selectedBatch }).then(setHomeworkList);
    } catch (err) {
      showToast(err.message || 'Failed to create homework');
    }
  };

  // Handle Native File Upload for Study Materials
  const handleMaterialFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingMaterial(true);
      const res = await api.uploadFile(file);
      const fileType = file.name.endsWith('.pdf') ? 'PDF' : (file.name.endsWith('.pptx') || file.name.endsWith('.ppt')) ? 'Slides' : 'PDF';
      setNewMaterial(prev => ({
        ...prev,
        url: res.url,
        material_type: fileType,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "")
      }));
      showToast(`File "${file.name}" uploaded successfully!`);
    } catch (err) {
      showToast('File upload failed: ' + err.message);
    } finally {
      setUploadingMaterial(false);
    }
  };

  // Upload Study Material
  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    try {
      await api.uploadStudyMaterial({
        ...newMaterial,
        uploaded_by: user?.full_name || 'Prof. Sarah Jenkins'
      });
      showToast('Study material published to Student Portal successfully!');
      setShowMaterialModal(false);
      api.getStudyMaterials({ batch: selectedBatch }).then(setStudyMaterials);
    } catch (err) {
      showToast(err.message || 'Failed to upload study material');
    }
  };

  // Grade Assessment
  const handleSubmitExamGrade = async (e) => {
    e.preventDefault();
    try {
      await api.submitGrade(newGrade);
      showToast(`Grade submitted for ${newGrade.student_name}! Automatically updated in Student & Parent report cards.`);
      setShowGradeModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to submit grade');
    }
  };

  // View Submissions for Homework
  const handleViewSubmissions = async (hw) => {
    setSelectedHomeworkForGrading(hw);
    try {
      const subs = await api.getHomeworkSubmissions(hw.id);
      setSubmissionsList(subs);
    } catch (err) {
      setSubmissionsList([]);
    }
  };

  const handleGradeSubmission = async (subId, score, feedback) => {
    try {
      await api.gradeHomework({ submission_id: subId, score, feedback });
      showToast('Homework submission graded! Score and feedback sent to student.');
      if (selectedHomeworkForGrading) {
        api.getHomeworkSubmissions(selectedHomeworkForGrading.id).then(setSubmissionsList);
      }
    } catch (err) {
      showToast('Failed to grade submission');
    }
  };

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await api.sendMessage({
        sender_username: user?.username || 'teacher_jenkins',
        sender_name: user?.full_name || 'Prof. Sarah Jenkins',
        sender_role: 'teacher',
        ...newMessage
      });
      showToast(`Message dispatched directly to ${newMessage.recipient_name}!`);
      setShowMessageModal(false);
      setNewMessage({
        recipient_username: 'parent_patel',
        recipient_name: 'Rajesh Patel (Nairee\'s Father)',
        recipient_role: 'parent',
        student_batch: 'BATCH-10A-2026',
        subject: '',
        message: ''
      });
      api.getMessages(user?.username, 'teacher').then(setMessages);
    } catch (err) {
      showToast('Failed to send message');
    }
  };

  const cleanPhone = (phone) => {
    if (!phone) return '15559012234';
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 ? digits : '15559012234';
  };

  const getWhatsAppMessage = (student, templateKey) => {
    const sName = student?.student_name || 'Student';
    const gName = student?.guardian_name || 'Parent';
    if (templateKey === 'late') {
      return `⏰ Nairee: Dear ${gName}, your ward ${sName} arrived LATE to morning lectures today (${attendanceDate}). Please ensure on-time arrival for tomorrow's 08:30 AM assembly.`;
    }
    if (templateKey === 'sick') {
      return `🩺 Nairee: Dear ${gName}, we noted ${sName} is absent today due to illness. We wish them a speedy recovery! Please let us know if any lecture materials should be sent over.`;
    }
    return `🚨 Official Attendance Notice: Dear ${gName}, your ward ${sName} was recorded ABSENT today (${attendanceDate}) for Grade 10-A at Nairee. Please reply with the reason for absence or call our office at +1 (555) 019-2000.`;
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

      {/* Teacher Profile Banner */}
      <div className="bg-gradient-to-r from-[#0c1f2c] via-[#122e3f] to-[#0c1f2c] rounded-2xl p-6 border border-teal-800/40 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-teal-500/20">
            {user?.full_name?.charAt(0) || 'T'}
          </div>
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-teal-400 mb-0.5">
              <span className="uppercase tracking-wider">Faculty Portal &bull; Head of Department</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {user?.full_name || 'Prof. Sarah Jenkins'}
            </h1>
            <p className="text-xs text-slate-300">
              Department of Mathematics & STEM &bull; Assigned: Grade 10-A (Honors) & Grade 11-A
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('attendance')}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/20 flex items-center space-x-1.5 transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>

          <button
            onClick={() => setShowGradeModal(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
          >
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Enter Test Marks</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-teal-900/40 overflow-x-auto gap-2 pb-2">
        {[
          { id: 'dashboard', label: 'Teacher Dashboard' },
          { id: 'attendance', label: 'Mark Attendance' },
          { id: 'syllabus', label: `Live Syllabus Tracker (${syllabusList.length} Units)` },
          { id: 'homework', label: `Homework & Grading (${homeworkList.length})` },
          { id: 'materials', label: `Study Notes & PDFs (${studyMaterials.length})` },
          { id: 'messages', label: `Parent Messages (${messages.length})` }
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

      {/* TAB 1: TEACHER DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Schedule Today */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-teal-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Today's Class Schedule (Monday)</span>
                </h3>
                <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                  4 Teaching Periods
                </span>
              </div>

              <div className="space-y-3">
                {schedule.slice(0, 4).map((sc, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:border-teal-300 transition-all">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex flex-col items-center justify-center font-bold text-xs">
                        <span>{sc.from_time?.split(':')[0]}</span>
                        <span className="text-[9px] font-normal text-slate-500">HRS</span>
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{sc.title || sc.subject}</div>
                        <div className="text-[11px] text-slate-500">{sc.student_batch} &bull; {sc.room}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-700">{sc.from_time} - {sc.to_time}</span>
                      <div className="text-[10px] text-teal-600 font-semibold">{sc.faculty_name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Items & Actionables */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-teal-100 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Pending Teacher Action Items</span>
                </h3>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">Unreviewed Homework</div>
                      <div className="text-[11px] text-slate-500">2 submissions awaiting grading & feedback</div>
                    </div>
                    <button
                      onClick={() => setActiveTab('homework')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-semibold"
                    >
                      Review
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">Syllabus Milestone Due</div>
                      <div className="text-[11px] text-slate-500">Unit 2: Differential Calculus at 83%</div>
                    </div>
                    <button
                      onClick={() => setActiveTab('syllabus')}
                      className="px-2.5 py-1 rounded-lg bg-teal-500 text-white text-[11px] font-semibold"
                    >
                      Update
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">Parent Query Pending</div>
                      <div className="text-[11px] text-slate-500">Rajesh Patel replied regarding Calculus Olympiad</div>
                    </div>
                    <button
                      onClick={() => setActiveTab('messages')}
                      className="px-2.5 py-1 rounded-lg bg-blue-500 text-white text-[11px] font-semibold"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-center">
                <span className="text-[11px] text-slate-400">Everything saved propagates immediately across all portals.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MARK ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Select Class Batch</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="BATCH-10A-2026">Grade 10-A (Honors STEM)</option>
                  <option value="BATCH-10B-2026">Grade 10-B (Standard)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Date</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const allPres = {};
                  students.forEach(s => allPres[s.name] = 'Present');
                  setAttendanceRecords(allPres);
                  showToast('Set all students to Present');
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Mark All Present
              </button>

              {/* Bulk WhatsApp Button */}
              {Object.values(attendanceRecords).filter(st => st === 'Absent').length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowBulkWhatsAppModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center space-x-1.5 transition-all cursor-pointer animate-pulse"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Absentees ({Object.values(attendanceRecords).filter(st => st === 'Absent').length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveAttendance}
                className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs shadow-md shadow-teal-500/20 flex items-center space-x-1.5 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Sync Attendance</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Roll Number</th>
                    <th className="py-3.5 px-4">Batch</th>
                    <th className="py-3.5 px-4 text-center">Attendance Status</th>
                    <th className="py-3.5 px-4 text-right">Data Connection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {students.map((s) => {
                    const currentStatus = attendanceRecords[s.name] || 'Present';
                    return (
                      <tr key={s.name} className="hover:bg-teal-50/20 transition-colors">
                        <td className="py-3 px-4 flex items-center space-x-3">
                          <img
                            src={s.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={s.student_name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-800">{s.student_name}</div>
                            <div className="text-[10px] text-slate-400">{s.name}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          #{s.roll_no}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-600">
                          {s.batch_name || s.student_batch}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            {['Present', 'Absent', 'Late'].map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => setAttendanceRecords(prev => ({ ...prev, [s.name]: st }))}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                  currentStatus === st
                                    ? st === 'Present'
                                      ? 'bg-emerald-500 text-white shadow-sm'
                                      : st === 'Absent'
                                      ? 'bg-rose-500 text-white shadow-sm'
                                      : 'bg-amber-500 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-[11px] font-medium">
                          {currentStatus === 'Absent' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setWhatsAppModalStudent(s);
                                setCopiedText(false);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp Parent</span>
                            </button>
                          ) : (
                            <span className="text-teal-600">Syncs to Student & Parent</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE SYLLABUS TRACKER */}
      {activeTab === 'syllabus' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Course Syllabus Progression Tracker</h3>
              <p className="text-xs text-slate-500">
                Updating topic counts instantly updates the "% syllabus completed" visible to students and parents.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700">
              Live Two-Way Sync Active
            </span>
          </div>

          <div className="space-y-4">
            {syllabusList.map((item) => {
              const pct = Math.round((item.completed_topics / item.total_topics) * 100);
              return (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                        {item.subject} &bull; {item.course} &bull; Chapter {item.chapter_number}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm mt-0.5">{item.chapter_title}</h4>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        item.status === 'In Progress' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-sm font-black text-slate-800">{pct}%</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        pct === 100 ? 'bg-emerald-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Interactive Topic Adjustment */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-500 font-medium">
                      Topics Taught: <strong>{item.completed_topics}</strong> of <strong>{item.total_topics}</strong> total
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateSyllabus(item, item.total_topics)}
                        disabled={item.completed_topics >= item.total_topics}
                        title="Mark all topics in chapter completed"
                        className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-[10px] border border-teal-200 disabled:opacity-40 transition-colors"
                      >
                        ✓ Finish Chapter
                      </button>
                      <button
                        onClick={() => handleUpdateSyllabus(item, item.completed_topics - 1)}
                        disabled={item.completed_topics <= 0}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center disabled:opacity-30"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleUpdateSyllabus(item, item.completed_topics + 1)}
                        disabled={item.completed_topics >= item.total_topics}
                        className="w-7 h-7 rounded-lg bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs flex items-center justify-center shadow-sm disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: HOMEWORK & ASSIGNMENTS */}
      {activeTab === 'homework' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Class Homework & Submissions</h3>
              <p className="text-xs text-slate-500">Create assignments, inspect student solutions, and enter grades/feedback</p>
            </div>
            <button
              onClick={() => setShowHomeworkModal(true)}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Homework</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {homeworkList.map((hw) => (
              <div key={hw.id} className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                      {hw.subject} &bull; Max {hw.max_points} Pts
                    </span>
                    <span className="text-[11px] font-semibold text-rose-600">
                      Due: {hw.due_date}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mt-1">{hw.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{hw.instructions}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    {hw.submissionCount || 1} Student Submission(s)
                  </span>
                  <button
                    onClick={() => handleViewSubmissions(hw)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-500 hover:text-white text-slate-700 font-bold text-xs transition-colors"
                  >
                    Inspect & Grade
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Submissions Review Drawer */}
          {selectedHomeworkForGrading && (
            <div className="bg-white rounded-2xl border border-teal-200 p-6 shadow-md mt-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Submissions for: {selectedHomeworkForGrading.title}
                  </h3>
                  <p className="text-xs text-slate-500">Review student work, award scores and write mentoring feedback</p>
                </div>
                <button
                  onClick={() => setSelectedHomeworkForGrading(null)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Close Drawer
                </button>
              </div>

              {submissionsList.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No submissions recorded yet for this homework.
                </div>
              ) : (
                <div className="space-y-4">
                  {submissionsList.map((sub) => (
                    <div key={sub.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-800 text-xs">{sub.student_name} ({sub.student})</div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sub.status === 'Graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {sub.status} {sub.score !== null ? `(${sub.score}/100)` : ''}
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 font-mono">
                        {sub.submission_text}
                      </div>

                      {sub.feedback && (
                        <div className="text-xs text-teal-800 bg-teal-50 p-2.5 rounded-lg border border-teal-200">
                          <strong>Teacher Feedback:</strong> {sub.feedback}
                        </div>
                      )}

                      <div className="flex items-center space-x-2 pt-1">
                        <input
                          type="number"
                          placeholder="Score"
                          defaultValue={sub.score || 95}
                          id={`score-${sub.id}`}
                          className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-center font-bold"
                        />
                        <input
                          type="text"
                          placeholder="Teacher Feedback..."
                          defaultValue={sub.feedback || 'Well done! Excellent clarity.'}
                          id={`feedback-${sub.id}`}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                        />
                        <button
                          onClick={() => {
                            const sc = document.getElementById(`score-${sub.id}`).value;
                            const fb = document.getElementById(`feedback-${sub.id}`).value;
                            handleGradeSubmission(sub.id, Number(sc), fb);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs shadow-sm"
                        >
                          Save Grade
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: STUDY NOTES & MATERIALS */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Study Material & Notes Repository</h3>
              <p className="text-xs text-slate-500">Upload notes, formula sheets, and PDF links for your students</p>
            </div>
            <button
              onClick={() => setShowMaterialModal(true)}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Material</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyMaterials.map((mat) => (
              <div key={mat.id} className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-700 text-[10px] font-bold">
                    {mat.material_type} &bull; {mat.subject}
                  </span>
                  <span className="text-[11px] text-slate-400">{mat.created_at?.split('T')[0] || 'Today'}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{mat.title}</h4>
                <p className="text-xs text-slate-600">{mat.description}</p>
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Uploaded by {mat.uploaded_by}</span>
                  <a
                    href={mat.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-600 hover:text-teal-700 font-bold flex items-center space-x-1"
                  >
                    <span>Open Resource</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: MESSAGES */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Parent Communication & Inquiries</h3>
              <p className="text-xs text-slate-500">Communicate directly with parents or post guidance notes to your class</p>
            </div>
            <button
              onClick={() => setShowMessageModal(true)}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 flex items-center space-x-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Compose Message</span>
            </button>
          </div>

          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800 text-xs">From: {m.sender_name}</span>
                    <span className="text-slate-400">&rarr;</span>
                    <span className="font-bold text-teal-700 text-xs">To: {m.recipient_name || 'All Class Parents'}</span>
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

      {/* CREATE HOMEWORK MODAL */}
      {showHomeworkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-teal-100">
            <h3 className="font-bold text-slate-800 text-base mb-4">Assign New Homework</h3>
            <form onSubmit={handleCreateHomework} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Homework Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calculus Problem Set #5 — Integration Rules"
                  value={newHomework.title}
                  onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={newHomework.subject}
                    onChange={(e) => setNewHomework({ ...newHomework, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newHomework.due_date}
                    onChange={(e) => setNewHomework({ ...newHomework, due_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Provide instructions, questions, and submission expectations..."
                  value={newHomework.instructions}
                  onChange={(e) => setNewHomework({ ...newHomework, instructions: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHomeworkModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs shadow-md shadow-teal-500/20"
                >
                  Publish Homework
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD STUDY MATERIAL MODAL */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-teal-100">
            <h3 className="font-bold text-slate-800 text-base mb-4">Upload Study Material</h3>
            <form onSubmit={handleUploadMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3: Integration Formula Reference Card"
                  value={newMaterial.title}
                  onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {/* Native File Upload Area */}
              <div className="border-2 border-dashed border-teal-200 hover:border-teal-400 rounded-2xl p-4 text-center bg-teal-50/50 transition-colors">
                <input
                  type="file"
                  id="teacher-material-file"
                  className="hidden"
                  onChange={handleMaterialFileUpload}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                />
                <label htmlFor="teacher-material-file" className="cursor-pointer block">
                  <Upload className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                  <span className="text-xs font-bold text-teal-800 block">
                    {uploadingMaterial 
                      ? 'Uploading file to server...' 
                      : newMaterial.url 
                        ? `File attached: ${newMaterial.url.split('/').pop()}` 
                        : 'Click to select and upload document / PDF'}
                  </span>
                  <span className="text-[10px] text-teal-600/80 block mt-0.5">
                    Supports PDF, Word, PowerPoint slides up to 25MB
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Format</label>
                  <select
                    value={newMaterial.material_type}
                    onChange={(e) => setNewMaterial({ ...newMaterial, material_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="Slides">Presentation Slides</option>
                    <option value="Reference Link">Web Reference Link</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Resource URL</label>
                  <input
                    type="url"
                    placeholder="https://school.edu/materials/..."
                    value={newMaterial.url}
                    onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of notes, solved exercises, or diagrams..."
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs shadow-md shadow-teal-500/20"
                >
                  Upload & Distribute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENTER TEST MARKS MODAL */}
      {showGradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-teal-100">
            <h3 className="font-bold text-slate-800 text-base mb-1">Enter Examination Marks</h3>
            <p className="text-xs text-slate-500 mb-4">
              Submitting marks instantly updates the student's report card and rolls up to parent & admin portals.
            </p>
            <form onSubmit={handleSubmitExamGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Student</label>
                <select
                  value={newGrade.student}
                  onChange={(e) => {
                    const st = students.find(s => s.name === e.target.value);
                    setNewGrade({
                      ...newGrade,
                      student: e.target.value,
                      student_name: st?.student_name || 'Nairee Patel'
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  {students.map((s) => (
                    <option key={s.name} value={s.name}>{s.student_name} (Roll #{s.roll_no})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Course</label>
                  <input
                    type="text"
                    value={newGrade.course}
                    onChange={(e) => setNewGrade({ ...newGrade, course: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Score Obtained</label>
                  <input
                    type="number"
                    max={100}
                    min={0}
                    required
                    value={newGrade.score}
                    onChange={(e) => setNewGrade({ ...newGrade, score: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teacher Evaluative Remarks</label>
                <textarea
                  rows={2}
                  value={newGrade.comment}
                  onChange={(e) => setNewGrade({ ...newGrade, comment: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGradeModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs shadow-md shadow-teal-500/20"
                >
                  Publish Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MESSAGE PARENT MODAL */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-teal-100">
            <h3 className="font-bold text-slate-800 text-base mb-4">Direct Message to Parent</h3>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recipient</label>
                <select
                  value={newMessage.recipient_username}
                  onChange={(e) => {
                    const rName = e.target.value === 'parent_patel' ? "Rajesh Patel (Nairee's Father)" : "Vikram Sharma (Aarav's Father)";
                    setNewMessage({ ...newMessage, recipient_username: e.target.value, recipient_name: rName });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="parent_patel">Rajesh Patel (Nairee & Rohan's Father)</option>
                  <option value="parent_sharma">Vikram Sharma (Aarav's Father)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Update on Calculus Progress & Exam Preparation"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write clear, supportive guidance or commendation for the parents..."
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500"
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
                  Send to Parent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INDIVIDUAL WHATSAPP MODAL */}
      {whatsAppModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-emerald-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">WhatsApp Parent Notification</h3>
                  <p className="text-xs text-slate-500">
                    Direct notification to <span className="font-bold text-slate-700">{whatsAppModalStudent.guardian_name || 'Guardian'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsAppModalStudent(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Student & Phone Badge */}
            <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={whatsAppModalStudent.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={whatsAppModalStudent.student_name}
                  className="w-10 h-10 rounded-xl object-cover border border-emerald-200"
                />
                <div>
                  <p className="text-xs font-extrabold text-slate-800">{whatsAppModalStudent.student_name}</p>
                  <p className="text-[11px] text-slate-500">Roll #{whatsAppModalStudent.roll_no} &bull; {whatsAppModalStudent.batch_name || selectedBatch}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Guardian Phone</span>
                <span className="font-mono text-xs font-black text-emerald-700">
                  {whatsAppModalStudent.guardian_mobile || whatsAppModalStudent.student_mobile_number || '+1 (555) 901-2234'}
                </span>
              </div>
            </div>

            {/* Template Selector Pills */}
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Message Template:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'absent', label: '🚨 Absence' },
                  { id: 'late', label: '⏰ Late Arrival' },
                  { id: 'sick', label: '🩺 Medical Leave' }
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => { setWhatsAppTemplate(tpl.id); setCopiedText(false); }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      whatsAppTemplate === tpl.id
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Preview Box */}
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">Message Preview:</label>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans min-h-[90px]">
                {getWhatsAppMessage(whatsAppModalStudent, whatsAppTemplate)}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const text = getWhatsAppMessage(whatsAppModalStudent, whatsAppTemplate);
                  navigator.clipboard.writeText(text);
                  setCopiedText(true);
                  showToast('Copied message text to clipboard!');
                  setTimeout(() => setCopiedText(false), 3000);
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copiedText ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <a
                href={`https://wa.me/${cleanPhone(whatsAppModalStudent.guardian_mobile || whatsAppModalStudent.student_mobile_number)}?text=${encodeURIComponent(getWhatsAppMessage(whatsAppModalStudent, whatsAppTemplate))}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => setWhatsAppModalStudent(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp Direct &rarr;</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* BULK WHATSAPP ABSENTEES DRAWER */}
      {showBulkWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Bulk Absentees WhatsApp Dispatcher</h3>
                  <p className="text-xs text-slate-500">
                    {students.filter(s => attendanceRecords[s.name] === 'Absent').length} student(s) marked absent today ({attendanceDate})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkWhatsAppModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto divide-y divide-slate-100 my-4 flex-1 pr-1">
              {students.filter(s => attendanceRecords[s.name] === 'Absent').map((st) => {
                const phone = st.guardian_mobile || st.student_mobile_number || '+1 (555) 901-2234';
                const msg = getWhatsAppMessage(st, 'absent');
                return (
                  <div key={st.name} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={st.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={st.student_name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{st.student_name}</p>
                        <p className="text-[11px] text-slate-500">
                          Guardian: <span className="font-semibold text-slate-700">{st.guardian_name || 'Parent'}</span> &bull; {phone}
                        </p>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(msg)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer shrink-0"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Send WhatsApp</span>
                    </a>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowBulkWhatsAppModal(false)}
                className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close Dispatcher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
