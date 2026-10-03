import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  CheckCircle2,
  Award,
  Sparkles,
  Download,
  Search,
  ChevronRight,
  ShieldCheck,
  Building,
  GraduationCap,
  Calendar,
  AlertCircle,
  QrCode,
  X
} from 'lucide-react';
import { FALLBACK_STUDENTS } from '../fallbackData.js';
import { subscribeLiveEvents } from '../api.js';

export default function TransferCertificateView() {
  const [tcType, setTcType] = useState('10th'); // '10th', '12th', 'early'
  const [studentList, setStudentList] = useState(FALLBACK_STUDENTS);
  const [selectedStudentId, setSelectedStudentId] = useState(FALLBACK_STUDENTS[0]?.name || 'EDU STU 2026 00001');
  const [showPrintModal, setShowPrintModal] = useState(false);
  
  // Custom certificate fields
  const [reasonForLeaving, setReasonForLeaving] = useState('Completed Secondary High School Course (AISSE Board)');
  const [conduct, setConduct] = useState('Exemplary & Diligent');
  const [promotedTo, setPromotedTo] = useState('Promoted to Grade 11 (Senior Secondary)');
  const [duesCleared, setDuesCleared] = useState(true);
  const [lastExamResult, setLastExamResult] = useState('Passed with Distinction (92.4%)');
  const [academicSession, setAcademicSession] = useState('2025 to 2026');

  // Find active student
  const student = studentList.find(s => s.name === selectedStudentId) || studentList[0] || FALLBACK_STUDENTS[0];

  // Auto-sync dues clearance whenever selected student changes
  useEffect(() => {
    const isPaid = (student.feeDues || student.fee_due || 0) === 0 || student.fee_status === 'Paid';
    setDuesCleared(isPaid);
  }, [student]);

  // Live real-time sync when fees are paid anywhere across the platform
  useEffect(() => {
    const unsub = subscribeLiveEvents((event) => {
      if (event?.type === 'fee_updated') {
        setStudentList(prev => prev.map(s => {
          if (s.name === event.student_id || s.student_name === event.student_name) {
            return { ...s, feeDues: 0, fee_due: 0, fee_status: 'Paid' };
          }
          return s;
        }));
      }
    });
    return () => unsub();
  }, []);

  const handleTcTypeChange = (type) => {
    setTcType(type);
    if (type === '10th') {
      setReasonForLeaving('Completed Secondary High School Curriculum (Grade 10 Board)');
      setPromotedTo('Promoted to Senior Secondary Grade 11 (Science / Commerce / Humanities)');
      setLastExamResult('Passed Secondary School Board Exam with 92.4% (First Division)');
    } else if (type === '12th') {
      setReasonForLeaving('Completed Senior Secondary School Graduation (Grade 12 Board)');
      setPromotedTo('Graduated for Higher Education / University Entrance');
      setLastExamResult('Passed Senior Secondary Board Examinations (Distinction)');
    } else {
      setReasonForLeaving('Parent / Guardian relocation to another city / state');
      setPromotedTo('Eligible for mid-term admission to corresponding grade');
      setLastExamResult('Satisfactory progress recorded till Term 1');
    }
  };

  const tcNumber = `NAIREE/TC/2026/${tcType.toUpperCase()}/${student.roll_no || '101'}`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Institutional Registrar Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Transfer Certificate (TC) & Leaving Diploma Engine
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Generate, certify, and print authentic Board-compliant Transfer Certificates for Grade 10th Completion, Grade 12th Board Graduation, and Early/Mid-Term Relocation with digital QR verification.
            </p>
          </div>

          <button
            onClick={() => setShowPrintModal(true)}
            className="px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/30 flex items-center space-x-2 transition-transform hover:scale-105"
          >
            <Printer className="w-4 h-4" />
            <span>Generate & Print Certificate</span>
          </button>
        </div>

        {/* 3 Supported TC Types Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
          <button
            onClick={() => handleTcTypeChange('10th')}
            className={`p-4 rounded-2xl text-left border transition-all ${
              tcType === '10th'
                ? 'bg-teal-500/20 border-teal-400 text-white shadow-inner'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">Option 1</span>
              <GraduationCap className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-sm font-black">Grade 10th Completion TC</div>
            <div className="text-[11px] text-slate-400 mt-1">Secondary Board clearance & migration</div>
          </button>

          <button
            onClick={() => handleTcTypeChange('12th')}
            className={`p-4 rounded-2xl text-left border transition-all ${
              tcType === '12th'
                ? 'bg-teal-500/20 border-teal-400 text-white shadow-inner'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Option 2</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-sm font-black">Grade 12th Board TC</div>
            <div className="text-[11px] text-slate-400 mt-1">Senior secondary & university migration</div>
          </button>

          <button
            onClick={() => handleTcTypeChange('early')}
            className={`p-4 rounded-2xl text-left border transition-all ${
              tcType === 'early'
                ? 'bg-teal-500/20 border-teal-400 text-white shadow-inner'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Option 3</span>
              <Building className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-sm font-black">Early / Mid-Term TC</div>
            <div className="text-[11px] text-slate-400 mt-1">Family relocation or mid-session withdrawal</div>
          </button>
        </div>
      </div>

      {/* Configuration & Form Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-teal-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Student & Certificate Parameters</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400 font-bold">{tcNumber}</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Candidate / Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
              >
                {studentList.map(s => (
                  <option key={s.name} value={s.name}>
                    {s.student_name} ({s.student_batch}) &bull; {((s.feeDues || s.fee_due || 0) === 0 || s.fee_status === 'Paid') ? 'Paid (Dues Cleared)' : `Due $${s.feeDues || s.fee_due}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Session</label>
                <input
                  type="text"
                  value={academicSession}
                  onChange={(e) => setAcademicSession(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Institutional Conduct</label>
                <input
                  type="text"
                  value={conduct}
                  onChange={(e) => setConduct(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason for Leaving Institution</label>
              <input
                type="text"
                value={reasonForLeaving}
                onChange={(e) => setReasonForLeaving(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Promotion / Recommendation Status</label>
              <input
                type="text"
                value={promotedTo}
                onChange={(e) => setPromotedTo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Last Examination & Performance Record</label>
              <input
                type="text"
                value={lastExamResult}
                onChange={(e) => setLastExamResult(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-700">Tuition & Library Dues Clearance</span>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={duesCleared}
                  onChange={(e) => setDuesCleared(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-emerald-700">All Dues Cleared (Nil)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live Printable Certificate Preview */}
        <div className="lg:col-span-6 bg-amber-50/40 rounded-3xl p-6 border-2 border-amber-200/80 shadow-sm space-y-4 relative">
          <div className="text-center space-y-1 border-b border-amber-200 pb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">
              Official Transfer Certificate Preview
            </span>
            <h2 className="text-base font-black text-slate-900">NAIREE INTERNATIONAL ACADEMY</h2>
            <p className="text-[10px] text-slate-600">Affiliated to Central Board of Education &bull; Affiliation No: 882019</p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-amber-200 space-y-3 text-xs text-slate-700 shadow-inner">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-b pb-2">
              <span>TC No: <strong>{tcNumber}</strong></span>
              <span>Date: <strong>{new Date().toLocaleDateString()}</strong></span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div><strong>Student Name:</strong> {student.student_name}</div>
              <div><strong>Admission / Roll No:</strong> {student.roll_no || '101'}</div>
              <div><strong>Father/Guardian:</strong> {student.guardian_name || 'Mr. Michael Vance'}</div>
              <div><strong>Mother's Name:</strong> Mrs. Sarah Vance</div>
              <div><strong>Date of Birth:</strong> 14-Aug-2010</div>
              <div><strong>Nationality:</strong> American / International</div>
              <div><strong>Class Last Studied:</strong> {student.student_batch}</div>
              <div><strong>Session:</strong> {academicSession}</div>
            </div>

            <div className="pt-2 border-t space-y-1.5 text-[11px]">
              <div><strong>School / Board Exam Result:</strong> {lastExamResult}</div>
              <div><strong>Whether Qualified for Promotion:</strong> {promotedTo}</div>
              <div><strong>Month up to which fees paid:</strong> {duesCleared ? 'Full Session (Nil Balance)' : 'Pending clearance'}</div>
              <div><strong>Reason for Leaving School:</strong> {reasonForLeaving}</div>
              <div><strong>General Conduct & Character:</strong> <span className="text-emerald-700 font-bold">{conduct}</span></div>
            </div>

            <div className="pt-4 flex items-end justify-between border-t border-slate-200 text-[10px]">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border mx-auto mb-1">
                  <QrCode className="w-12 h-12 text-slate-800" />
                </div>
                <span className="text-slate-400">Scan to Verify TC</span>
              </div>

              <div className="text-center space-y-1">
                <div className="w-24 border-b border-slate-400 pb-1 font-serif italic text-teal-800 font-bold">
                  Dr. M. Vance
                </div>
                <div className="font-bold text-slate-700 uppercase">Principal Signature</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowPrintModal(true)}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2"
          >
            <Printer className="w-4 h-4 text-teal-400" />
            <span>Open High-Resolution Printable Certificate</span>
          </button>
        </div>
      </div>

      {/* FULL PRINT MODAL */}
      {showPrintModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowPrintModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl border-4 border-amber-100 space-y-6 text-slate-800">
            <div className="border-4 border-double border-slate-300 p-6 rounded-2xl bg-amber-50/20 space-y-4">
              <div className="text-center space-y-1">
                <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">Recognized by Department of Education</div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">NAIREE INTERNATIONAL ACADEMY</h1>
                <p className="text-xs text-slate-600 font-medium">100 Knowledge Boulevard, Academic District &bull; Tel: +1 (555) 234-5678</p>
                <div className="inline-block mt-2 px-4 py-1 rounded-full bg-slate-900 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  Official School Leaving & Transfer Certificate
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-mono border-b pb-2 text-slate-600 pt-2">
                <span>Certificate No: <strong>{tcNumber}</strong></span>
                <span>Issue Date: <strong>{new Date().toLocaleDateString()}</strong></span>
              </div>

              <div className="space-y-2 text-xs leading-relaxed">
                <p>1. Name of the Pupil: <strong className="text-sm underline">{student.student_name}</strong></p>
                <p>2. Father / Legal Guardian's Name: <strong>{student.guardian_name || 'Mr. Michael Vance'}</strong></p>
                <p>3. Mother's Name: <strong>Mrs. Sarah Vance</strong></p>
                <p>4. Nationality: <strong>American / International</strong></p>
                <p>5. Class in which the pupil last studied: <strong>{student.student_batch} ({tcType === '10th' ? 'Grade 10' : tcType === '12th' ? 'Grade 12' : 'Mid-Session'})</strong></p>
                <p>6. School / Board Annual Examination last taken: <strong>{lastExamResult}</strong></p>
                <p>7. Whether qualified for promotion to the higher class: <strong>{promotedTo}</strong></p>
                <p>8. Month up to which school dues were paid: <strong>{duesCleared ? 'Full Academic Year 2026 (No Dues)' : 'Clearance Pending'}</strong></p>
                <p>9. Reason for leaving the institution: <strong>{reasonForLeaving}</strong></p>
                <p>10. General Conduct & Character: <strong className="text-teal-800">{conduct}</strong></p>
              </div>

              <div className="pt-8 flex items-end justify-between text-xs">
                <div className="text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center border mx-auto mb-1">
                    <QrCode className="w-10 h-10 text-slate-800" />
                  </div>
                  <span className="text-[10px] text-slate-400">Digital QR Verification</span>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-32 border-b border-slate-600 pb-1 font-mono text-[11px] text-slate-500">
                    Registrar Officer
                  </div>
                  <div className="font-bold text-slate-700">Checked by</div>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-32 border-b-2 border-slate-900 pb-1 font-serif italic text-teal-800 font-bold text-sm">
                    Dr. Marcus Vance
                  </div>
                  <div className="font-black text-slate-900 uppercase">Principal Seal & Signature</div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Certificate</span>
              </button>
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
