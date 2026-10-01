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
  UserCheck,
  Printer
} from 'lucide-react';
import { api } from '../api.js';

export default function StudentPortalView({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [student, setStudent] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [syllabus, setSyllabus] = useState([]);
  const [homeworkList, setHomeworkList] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Submit Homework Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedHw, setSelectedHw] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const studentId = user?.student_id || user?.student?.name || 'EDU-STU-2026-00001';

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

      const batch = sData.student_batch || 'BATCH-10A-2026';
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

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c1f2c] border border-teal-500/60 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span>{toastMessage}</span>
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
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">Welcome back, {student.student_name}!</h1>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                  Active Student
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Student ID: <code className="font-mono text-cyan-300 font-bold">{student.name}</code> &bull; Roll #{student.roll_no}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                {student.batch_name} &bull; {student.program_name}
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md p-3 rounded-2xl border border-teal-500/20">
            <div className="text-center px-3 border-r border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Attendance</span>
              <p className="text-xl font-black text-emerald-400">{student.attendance?.percentage || 100}%</p>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Term Average</span>
              <p className="text-xl font-black text-amber-400">{averageScore}% (A+)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-teal-900/40 overflow-x-auto gap-2 pb-2">
        {[
          { id: 'dashboard', label: 'Student Dashboard' },
          { id: 'homework', label: `Homework & Submit (${homeworkList.length})` },
          { id: 'materials', label: `Study Notes & PDFs (${materials.length})` },
          { id: 'results', label: `Grades & Report Card (${student.assessments?.length || 0})` },
          { id: 'timetable', label: 'Full Weekly Timetable' },
          { id: 'syllabus', label: 'Live Syllabus Progress' },
          { id: 'transport', label: 'Bus Route & Timings' },
          { id: 'calendar', label: 'School Calendar' }
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

      {/* TAB 1: STUDENT DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Today's Schedule & Deadlines */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-teal-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Today's Classes ({todayName})</span>
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700">
                  {todaysClasses.length} Scheduled Sessions
                </span>
              </div>

              <div className="space-y-3">
                {todaysClasses.map((sc, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:border-teal-300 transition-all">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex flex-col items-center justify-center font-bold text-xs">
                        <span>{sc.from_time?.split(':')[0]}</span>
                        <span className="text-[9px] font-normal text-slate-500">HRS</span>
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{sc.title || sc.subject}</div>
                        <div className="text-[11px] text-slate-500">{sc.room} &bull; {sc.faculty_name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-700">{sc.from_time} - {sc.to_time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines & Circulars */}
            <div className="bg-white rounded-2xl border border-teal-100 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span>Notice Board & Deadlines</span>
              </h3>

              <div className="space-y-3">
                {announcements.slice(0, 3).map((a) => (
                  <div key={a.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{a.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-700">
                        {a.category}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-normal">{a.content}</p>
                    <div className="text-[10px] text-slate-400">By {a.posted_by}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Digital Student Pass */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-[#0c1f2c] via-[#0f2c3d] to-[#0a1b26] text-white rounded-3xl p-6 shadow-xl border border-teal-800/40 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center text-white">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold tracking-wider uppercase text-teal-300">Digital Student Pass</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">2026-27</span>
              </div>

              <div className="py-5 text-center">
                <img
                  src={student.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  alt="Student"
                  className="w-20 h-20 rounded-2xl mx-auto object-cover ring-2 ring-teal-400 shadow-md mb-3"
                />
                <h3 className="text-base font-extrabold">{student.student_name}</h3>
                <p className="text-xs text-teal-300 font-medium">Roll #{student.roll_no} &bull; {student.name}</p>
                <p className="text-[11px] text-slate-400 mt-1">{student.batch_name}</p>

                {/* QR Code Mockup */}
                <div className="mt-4 p-3 bg-white rounded-xl inline-block shadow-inner">
                  <QrCode className="w-24 h-24 text-slate-900 mx-auto" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-mono">Scan for Campus Gates & Library Access</p>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full mt-3 py-2 px-3 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Official Student ID Pass</span>
                </button>
              </div>

              <div className="pt-3 border-t border-white/10 text-center">
                <span className="text-[11px] text-teal-400 font-semibold">Strictly Personal &bull; Protected Access</span>
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
                <div key={hw.id} className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                        {hw.subject} &bull; Assigned by {hw.faculty_name}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm mt-0.5">{hw.title}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        hw.submission?.status === 'Graded' ? 'bg-emerald-100 text-emerald-800' :
                        isSubmitted ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {hw.submission?.status || 'Pending Submission'}
                      </span>
                      <span className="text-xs text-rose-600 font-semibold">Due: {hw.due_date}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {hw.instructions}
                  </p>

                  {/* Submission and Grade Status */}
                  {hw.submission ? (
                    <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-900">Your Submitted Work:</span>
                        {hw.submission.score !== null && (
                          <span className="font-black text-emerald-700">
                            Score: {hw.submission.score} / {hw.max_points}
                          </span>
                        )}
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-teal-100 font-mono text-[11px] text-slate-700">
                        {hw.submission.submission_text}
                      </div>
                      {hw.submission.feedback && (
                        <div className="text-[11px] text-teal-800 font-medium">
                          <strong>Teacher Feedback:</strong> {hw.submission.feedback}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          setSelectedHw(hw);
                          setShowSubmitModal(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs shadow-md shadow-teal-500/20 flex items-center space-x-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Submit Work</span>
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
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Official Academic Report Card</h3>
              <p className="text-xs text-slate-500">Evaluated marks, percentiles, and comments from faculty</p>
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
      )}

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
                  {transport?.route_name || 'Route 04 — North City Express'}
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

      {/* TAB 8: SCHOOL CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Academic Calendar & Upcoming Events</h3>
              <p className="text-xs text-slate-500">Term 1 holidays, examination milestones, and school exhibitions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-teal-100 shadow-sm space-y-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                Exam Schedule
              </span>
              <h4 className="font-bold text-slate-800 text-sm">Mid-Term Theoretical Examinations</h4>
              <p className="text-slate-600">October 14 &ndash; October 22, 2026. Hall tickets available in portal.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-teal-100 shadow-sm space-y-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px]">
                School Exhibition
              </span>
              <h4 className="font-bold text-slate-800 text-sm">Annual STEM & Robotics Exhibition 2026</h4>
              <p className="text-slate-600">November 5, 2026. Project registration open until October 25.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-teal-100 shadow-sm space-y-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                Parent-Teacher Conference
              </span>
              <h4 className="font-bold text-slate-800 text-sm">Grade 10 Parent-Teacher Meeting (PTM)</h4>
              <p className="text-slate-600">October 10, 2026 (09:00 AM &ndash; 01:30 PM).</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-teal-100 shadow-sm space-y-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                Holiday Notice
              </span>
              <h4 className="font-bold text-slate-800 text-sm">Fall Semester Mid-Term Recess</h4>
              <p className="text-slate-600">October 26 &ndash; October 30, 2026. School re-opens November 2.</p>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT HOMEWORK MODAL */}
      {showSubmitModal && selectedHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
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
    </div>
  );
}
