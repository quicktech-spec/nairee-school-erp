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
  X,
  CreditCard,
  User,
  Users,
  MapPin,
  CheckSquare,
  Layers,
  BookOpen,
  Clock,
  IdCard,
  Barcode
} from 'lucide-react';
import { INITIAL_DB_STORE, FALLBACK_STUDENTS } from '../fallbackData.js';
import { getMasterStudents, subscribeLiveEvents, generateStudentId } from '../api.js';

function getSynchronizedStudents() {
  const master = getMasterStudents();
  if (master && master.length > 0) {
    return master.map((s, idx) => ({
      id: s.student_id || s.id || generateStudentId({ sequence: idx + 1 }),
      name: s.name || s.student_name,
      student_name: s.name || s.student_name,
      roll_no: s.roll_no ? String(s.roll_no).replace(/\D/g, '') : String(idx + 1).padStart(2, '0'),
      student_batch: s.class_batch || 'Class 10 - Section A',
      class_batch: s.class_batch || 'Class 10 - Section A',
      stream: s.stream || 'Science & Advanced Mathematics',
      photo: s.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      dob: s.dob || '2011-04-12',
      religion: s.religion || 'Hindu',
      nationality: s.nationality || 'Indian',
      blood_group: s.blood_group || 'O+',
      gender: s.gender || 'Male',
      aadhaar_no: s.aadhaar_no || '9876 5432 1091',
      admission_date: s.admission_date || '2024-06-15',
      phone: s.phone || '+91 98765 00001',
      father_name: s.father_name || 'Rajesh Patel',
      father_phone: s.father_phone || '+91 98765 43212',
      mother_name: s.mother_name || 'Meera Patel',
      residential_address: s.residential_address || 'Flat 402, Green Meadows Residency, Indiranagar, Bengaluru - 560038',
      fee_status: s.fee_status || (idx === 2 || idx === 5 ? 'Pending' : 'Paid'),
      feeDues: (s.fee_status === 'Pending' || s.fee_status === 'Unpaid') ? 35000 : 0
    }));
  }
  return FALLBACK_STUDENTS;
}

export default function TransferCertificateView() {
  // 6 Supported Document Types: 'tc', 'domicile', 'migration', 'report_card', 'admit_card', 'id_card'
  const [docType, setDocType] = useState('tc');
  
  const [studentList, setStudentList] = useState(() => getSynchronizedStudents());
  const [selectedStudentId, setSelectedStudentId] = useState(() => {
    const list = getSynchronizedStudents();
    return list[0]?.id || 'NIS-2024-091-001';
  });
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'all'
  const [showPrintModal, setShowPrintModal] = useState(false);
  
  // Customizable Document Parameters
  const [academicSession, setAcademicSession] = useState('2025 - 2026');
  const [examName, setExamName] = useState('Annual Board & Mid-Term Examination 2026');
  const [conduct, setConduct] = useState('Exemplary, Diligent & Obedient');
  const [reasonForLeaving, setReasonForLeaving] = useState('Course Completion / Higher Education Migration');
  const [promotedTo, setPromotedTo] = useState('Promoted to Senior Secondary Grade 11');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);

  // Active student object
  const activeStudent = studentList.find(s => s.id === selectedStudentId || s.name === selectedStudentId) || studentList[0] || {};

  // Auto-sync updates across app (transfers, admissions, fee clearances)
  useEffect(() => {
    const unsub = subscribeLiveEvents((event) => {
      const freshList = getSynchronizedStudents();
      setStudentList(freshList);
    });
    return () => unsub();
  }, []);

  const docTypesList = [
    {
      id: 'tc',
      num: '1',
      title: 'Transfer Certificate (TC)',
      subtitle: 'Official School Leaving & Migration Record',
      icon: GraduationCap,
      color: 'teal'
    },
    {
      id: 'domicile',
      num: '2',
      title: 'Domicile / Bonafide',
      subtitle: 'State & Institutional Residence Certificate',
      icon: Building,
      color: 'blue'
    },
    {
      id: 'migration',
      num: '3',
      title: 'Character & Conduct',
      subtitle: 'Discipline & Board Migration Clearance',
      icon: ShieldCheck,
      color: 'emerald'
    },
    {
      id: 'report_card',
      num: '4',
      title: 'Academic Report Card',
      subtitle: 'Cumulative Marksheet & Performance Grade',
      icon: BookOpen,
      color: 'purple'
    },
    {
      id: 'admit_card',
      num: '5',
      title: 'Exam Admit Card',
      subtitle: 'Hall Ticket & Examination Timetable',
      icon: Calendar,
      color: 'amber'
    },
    {
      id: 'id_card',
      num: '6',
      title: 'Student Smart ID Card',
      subtitle: 'Front & Back RFID Photo Identity Card',
      icon: Award,
      color: 'rose'
    }
  ];

  // Helper for generating document numbers
  const getDocRegNo = (st, type) => {
    const r = st.roll_no || '101';
    switch (type) {
      case 'tc': return `NAIREE/TC/2026/${r}`;
      case 'domicile': return `DOM/NAIREE/2026/${r}`;
      case 'migration': return `MIG/CBSE/2026/${r}`;
      case 'report_card': return `MARK/2026/SEC/${r}`;
      case 'admit_card': return `HT/EXAM/2026/${r}`;
      case 'id_card': return `ID-${st.id || 'STU'}-${r}`;
      default: return `DOC/2026/${r}`;
    }
  };

  // Helper to render individual printable document
  const renderDocumentContent = (st, type) => {
    const regNo = getDocRegNo(st, type);
    const isFeeCleared = st.fee_status === 'Paid' || (st.feeDues || 0) === 0;

    switch (type) {
      // 1. TRANSFER CERTIFICATE (TC)
      case 'tc':
        return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-4 border-double border-slate-300 text-slate-800 space-y-5 shadow-sm text-xs relative overflow-hidden">
            <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
              <div className="text-[10px] font-bold tracking-widest text-teal-800 uppercase">
                CBSE Affiliation No: 88392 &bull; School Code: 14022
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                NAIREE INTERNATIONAL SCHOOL
              </h2>
              <p className="text-[11px] text-slate-600 font-medium">
                100 Knowledge Boulevard, Indiranagar, Bengaluru, Karnataka - 560038
              </p>
              <div className="inline-block mt-2 px-4 py-1 rounded-full bg-slate-900 text-amber-300 font-bold text-xs uppercase tracking-wider">
                Official School Leaving &amp; Transfer Certificate
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-mono border-b pb-2 text-slate-600">
              <span>TC No: <strong className="text-slate-900">{regNo}</strong></span>
              <span>Admission No: <strong className="text-slate-900">{st.id}</strong></span>
              <span>Issue Date: <strong className="text-slate-900">{issueDate}</strong></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 leading-relaxed">
              <p>1. Name of Pupil: <strong className="text-slate-900 text-sm">{st.student_name}</strong></p>
              <p>2. Father's / Guardian's Name: <strong className="text-slate-900">{st.father_name}</strong></p>
              <p>3. Mother's Name: <strong className="text-slate-900">{st.mother_name}</strong></p>
              <p>4. Nationality: <strong className="text-slate-900">{st.nationality}</strong> &bull; Religion: <strong>{st.religion}</strong></p>
              <p>5. Date of First Admission in School: <strong className="text-slate-900">{st.admission_date}</strong></p>
              <p>6. Date of Birth (DOB): <strong className="text-slate-900">{st.dob}</strong></p>
              <p>7. Class in which the pupil last studied: <strong className="text-slate-900">{st.class_batch}</strong></p>
              <p>8. School / Board Annual Exam Result: <strong className="text-emerald-700">Passed with Distinction (92.4%)</strong></p>
              <p>9. Whether qualified for promotion: <strong className="text-slate-900">{promotedTo}</strong></p>
              <p>10. Month up to which school dues paid: <strong className={isFeeCleared ? 'text-emerald-700' : 'text-rose-700'}>{isFeeCleared ? 'Cleared (No Dues)' : 'Clearance Pending'}</strong></p>
              <p>11. Total No. of Working Days: <strong className="text-slate-900">220 Days</strong></p>
              <p>12. Total Days Present: <strong className="text-slate-900">214 Days (97.2%)</strong></p>
              <p className="sm:col-span-2">13. Reason for Leaving School: <strong className="text-slate-900">{reasonForLeaving}</strong></p>
              <p className="sm:col-span-2">14. General Conduct &amp; Character: <strong className="text-teal-800">{conduct}</strong></p>
            </div>

            <div className="pt-6 border-t border-slate-200 flex items-end justify-between">
              <div className="text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center border mx-auto mb-1">
                  <QrCode className="w-10 h-10 text-slate-800" />
                </div>
                <span className="text-[9px] text-slate-400 font-mono">Scan for Verification</span>
              </div>
              <div className="text-center space-y-1">
                <div className="w-28 border-b border-slate-500 pb-1 font-mono text-[10px] text-slate-500">Class Teacher</div>
                <div className="font-bold text-[10px] text-slate-700">Prepared By</div>
              </div>
              <div className="text-center space-y-1">
                <div className="w-32 border-b-2 border-slate-900 pb-1 font-serif italic text-teal-800 font-bold text-sm">
                  Dr. Marcus Vance
                </div>
                <div className="font-black text-[10px] text-slate-900 uppercase">Principal Seal &amp; Signature</div>
              </div>
            </div>
          </div>
        );

      // 2. DOMICILE & BONAFIDE CERTIFICATE
      case 'domicile':
        return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-4 border-double border-blue-300 text-slate-800 space-y-5 shadow-sm text-xs relative overflow-hidden">
            <div className="text-center space-y-1 border-b-2 border-blue-900 pb-4">
              <div className="text-[10px] font-bold tracking-widest text-blue-800 uppercase">
                Government of Karnataka &bull; Department of Public Instruction
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                NAIREE INTERNATIONAL ACADEMY
              </h2>
              <div className="inline-block mt-2 px-4 py-1 rounded-full bg-blue-900 text-white font-bold text-xs uppercase tracking-wider">
                Bonafide &amp; Institutional Domicile Certificate
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-mono border-b pb-2 text-slate-600">
              <span>Certificate No: <strong className="text-blue-900">{regNo}</strong></span>
              <span>Academic Year: <strong className="text-slate-900">{academicSession}</strong></span>
              <span>Date: <strong className="text-slate-900">{issueDate}</strong></span>
            </div>

            <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100 text-justify text-xs leading-relaxed space-y-3">
              <p>
                This is to officially certify that Master / Miss <strong className="text-slate-900 underline text-sm">{st.student_name}</strong>, 
                Admission No: <strong className="text-slate-900 font-mono">{st.id}</strong>, Roll No: <strong className="text-slate-900 font-mono">{st.roll_no}</strong>, 
                Son / Daughter of <strong className="text-slate-900">{st.father_name}</strong> and <strong className="text-slate-900">{st.mother_name}</strong>, 
                is a bonafide continuous student of this institution studying in <strong className="text-slate-900">{st.class_batch}</strong>.
              </p>
              <p>
                As per the official school admission and revenue registrar records, the candidate is a permanent resident residing at:
              </p>
              <div className="p-3 bg-white rounded-lg border border-blue-200 font-semibold text-slate-800 text-[11px]">
                {st.residential_address}
              </div>
              <p>
                According to the admission register, the date of birth recorded is <strong className="text-slate-900">{st.dob}</strong>. 
                His/Her Aadhaar Identification number on record is <strong className="text-slate-900 font-mono">{st.aadhaar_no}</strong>. 
                To the best of our knowledge and belief, he/she bears an exemplary moral character.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200 flex items-end justify-between">
              <div className="flex items-center gap-3">
                <img src={st.photo} alt={st.student_name} className="w-14 h-14 rounded-lg object-cover border-2 border-blue-200 shadow-sm" />
                <div>
                  <div className="text-[10px] font-bold text-slate-700">Attested Photo</div>
                  <div className="text-[9px] text-slate-400 font-mono">Institutional Seal Affixed</div>
                </div>
              </div>
              <div className="text-center space-y-1">
                <div className="w-36 border-b-2 border-blue-900 pb-1 font-serif italic text-blue-900 font-bold text-sm">
                  Dr. Marcus Vance
                </div>
                <div className="font-black text-[10px] text-slate-900 uppercase">Headmaster / Principal Seal</div>
              </div>
            </div>
          </div>
        );

      // 3. CHARACTER & CONDUCT MIGRATION CERTIFICATE
      case 'migration':
        return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-4 border-double border-emerald-300 text-slate-800 space-y-5 shadow-sm text-xs relative overflow-hidden">
            <div className="text-center space-y-1 border-b-2 border-emerald-900 pb-4">
              <div className="text-[10px] font-bold tracking-widest text-emerald-800 uppercase">
                Board of Secondary &amp; Senior Secondary Education
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                NAIREE INTERNATIONAL SCHOOL
              </h2>
              <div className="inline-block mt-2 px-4 py-1 rounded-full bg-emerald-900 text-white font-bold text-xs uppercase tracking-wider">
                Character &amp; Inter-State Migration Clearance
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-mono border-b pb-2 text-slate-600">
              <span>Migration No: <strong className="text-emerald-900">{regNo}</strong></span>
              <span>Session: <strong className="text-slate-900">{academicSession}</strong></span>
              <span>Issue Date: <strong className="text-slate-900">{issueDate}</strong></span>
            </div>

            <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 text-justify text-xs leading-relaxed space-y-3">
              <p>
                This is to certify that <strong className="text-slate-900 underline text-sm">{st.student_name}</strong>, 
                Student ID: <strong className="text-slate-900 font-mono">{st.id}</strong>, Roll No: <strong className="text-slate-900 font-mono">{st.roll_no}</strong>, 
                has been a student of this school from <strong className="text-slate-900">{st.admission_date}</strong> to <strong className="text-slate-900">{issueDate}</strong>.
              </p>
              <p>
                During his/her tenure at Nairee International School, his/her character and conduct have been <strong className="text-emerald-800 font-bold">{conduct}</strong>. 
                He/She actively participated in academic workshops, sports, and institutional co-curricular events.
              </p>
              <p>
                This institution has <strong>NO OBJECTION</strong> to his/her admission to any authorized board, university, or college across India or abroad.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200 flex items-end justify-between">
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center border mx-auto mb-1">
                  <QrCode className="w-8 h-8 text-slate-800" />
                </div>
                <span className="text-[9px] text-slate-400 font-mono">Digital Signature</span>
              </div>
              <div className="text-center space-y-1">
                <div className="w-36 border-b-2 border-emerald-900 pb-1 font-serif italic text-emerald-900 font-bold text-sm">
                  Dr. Marcus Vance
                </div>
                <div className="font-black text-[10px] text-slate-900 uppercase">Authorized Signatory</div>
              </div>
            </div>
          </div>
        );

      // 4. ACADEMIC REPORT CARD (MARKSHEET)
      case 'report_card':
        return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-4 border-double border-purple-300 text-slate-800 space-y-4 shadow-sm text-xs relative overflow-hidden">
            <div className="text-center space-y-1 border-b-2 border-purple-900 pb-3">
              <div className="text-[10px] font-bold tracking-widest text-purple-800 uppercase">
                Annual Academic Performance &amp; Evaluation Statement
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-950 uppercase">
                NAIREE INTERNATIONAL ACADEMY
              </h2>
              <div className="inline-block mt-1 px-4 py-0.5 rounded-full bg-purple-900 text-white font-bold text-[11px] uppercase tracking-wider">
                Official Report Card &bull; Academic Year {academicSession}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-purple-50/50 p-3 rounded-xl border border-purple-100">
              <div>Student Name: <strong className="block text-slate-900 font-bold text-xs">{st.student_name}</strong></div>
              <div>Roll No: <strong className="block text-slate-900 font-mono font-bold">{st.roll_no}</strong></div>
              <div>Class &amp; Section: <strong className="block text-slate-900 font-bold">{st.class_batch}</strong></div>
              <div>Attendance: <strong className="block text-emerald-700 font-bold">96.8% (214/220 Days)</strong></div>
            </div>

            {/* Subject Marks Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-purple-900 text-white text-[10px] uppercase font-bold">
                  <tr>
                    <th className="py-2 px-3">Subject</th>
                    <th className="py-2 px-3">Theory (80)</th>
                    <th className="py-2 px-3">Practical (20)</th>
                    <th className="py-2 px-3">Total (100)</th>
                    <th className="py-2 px-3">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px] font-semibold">
                  <tr className="hover:bg-purple-50/30">
                    <td className="py-2 px-3 font-bold">Advanced Mathematics</td>
                    <td className="py-2 px-3">78</td>
                    <td className="py-2 px-3">19</td>
                    <td className="py-2 px-3 text-purple-900 font-black">97</td>
                    <td className="py-2 px-3 text-emerald-700 font-black">A1</td>
                  </tr>
                  <tr className="hover:bg-purple-50/30">
                    <td className="py-2 px-3 font-bold">Physics &amp; Dynamics</td>
                    <td className="py-2 px-3">75</td>
                    <td className="py-2 px-3">19</td>
                    <td className="py-2 px-3 text-purple-900 font-black">94</td>
                    <td className="py-2 px-3 text-emerald-700 font-black">A1</td>
                  </tr>
                  <tr className="hover:bg-purple-50/30">
                    <td className="py-2 px-3 font-bold">Chemistry &amp; Applied Sciences</td>
                    <td className="py-2 px-3">72</td>
                    <td className="py-2 px-3">19</td>
                    <td className="py-2 px-3 text-purple-900 font-black">91</td>
                    <td className="py-2 px-3 text-emerald-700 font-black">A1</td>
                  </tr>
                  <tr className="hover:bg-purple-50/30">
                    <td className="py-2 px-3 font-bold">Computer Applications &amp; AI</td>
                    <td className="py-2 px-3">79</td>
                    <td className="py-2 px-3">20</td>
                    <td className="py-2 px-3 text-purple-900 font-black">99</td>
                    <td className="py-2 px-3 text-emerald-700 font-black">A1</td>
                  </tr>
                  <tr className="hover:bg-purple-50/30">
                    <td className="py-2 px-3 font-bold">English Language &amp; Literature</td>
                    <td className="py-2 px-3">74</td>
                    <td className="py-2 px-3">18</td>
                    <td className="py-2 px-3 text-purple-900 font-black">92</td>
                    <td className="py-2 px-3 text-emerald-700 font-black">A1</td>
                  </tr>
                  <tr className="bg-purple-50 font-black text-slate-900">
                    <td className="py-2.5 px-3">Grand Total: 473 / 500</td>
                    <td colSpan="2" className="py-2.5 px-3 text-right">Aggregate Score: 94.6%</td>
                    <td colSpan="2" className="py-2.5 px-3 text-emerald-700 font-black text-right">RESULT: PASSED (DISTINCTION)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-end justify-between">
              <div className="text-[10px] text-slate-500">
                Teacher Remark: <strong className="text-slate-800">Outstanding academic aptitude and problem-solving skills!</strong>
              </div>
              <div className="text-center space-y-1">
                <div className="w-32 border-b-2 border-purple-900 pb-1 font-serif italic text-purple-900 font-bold text-sm">
                  Dr. Marcus Vance
                </div>
                <div className="font-black text-[9px] text-slate-900 uppercase">Principal Signature &amp; Stamp</div>
              </div>
            </div>
          </div>
        );

      // 5. EXAM ADMIT CARD (HALL TICKET)
      case 'admit_card':
        return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-4 border-double border-amber-300 text-slate-800 space-y-4 shadow-sm text-xs relative overflow-hidden">
            <div className="text-center space-y-1 border-b-2 border-amber-900 pb-3">
              <div className="text-[10px] font-bold tracking-widest text-amber-800 uppercase">
                Central Board Examination Cell &bull; Admit Card 2026
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-950 uppercase">
                NAIREE INTERNATIONAL ACADEMY
              </h2>
              <div className="inline-block mt-1 px-4 py-0.5 rounded-full bg-amber-900 text-amber-200 font-bold text-[11px] uppercase tracking-wider">
                Official Examination Hall Ticket &bull; Roll #{st.roll_no}
              </div>
            </div>

            <div className="flex items-start justify-between gap-4 p-3 bg-amber-50/50 rounded-xl border border-amber-200">
              <div className="space-y-1 text-xs">
                <div>Candidate Name: <strong className="text-slate-900 text-sm font-black">{st.student_name}</strong></div>
                <div>Registration ID: <strong className="font-mono text-slate-900 font-bold">{regNo}</strong></div>
                <div>Class &amp; Batch: <strong className="text-slate-900 font-bold">{st.class_batch}</strong></div>
                <div>Exam Center: <strong className="text-slate-900">Center #042 - Nairee Main Campus, Bengaluru</strong></div>
              </div>
              <img src={st.photo} alt={st.student_name} className="w-16 h-16 rounded-lg object-cover border-2 border-amber-300 shadow-sm" />
            </div>

            {/* Exam Timetable */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-amber-900 text-white text-[10px] uppercase font-bold">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Time Slot</th>
                    <th className="py-2 px-3">Subject Name</th>
                    <th className="py-2 px-3">Exam Hall</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px] font-medium">
                  <tr className="hover:bg-amber-50/30">
                    <td className="py-2 px-3 font-mono font-bold">14 Oct 2026</td>
                    <td className="py-2 px-3">09:00 AM - 12:00 PM</td>
                    <td className="py-2 px-3 font-bold text-slate-900">Advanced Mathematics (MATH-101)</td>
                    <td className="py-2 px-3">Room 204</td>
                  </tr>
                  <tr className="hover:bg-amber-50/30">
                    <td className="py-2 px-3 font-mono font-bold">16 Oct 2026</td>
                    <td className="py-2 px-3">09:00 AM - 12:00 PM</td>
                    <td className="py-2 px-3 font-bold text-slate-900">Physics &amp; Dynamics (PHYS-102)</td>
                    <td className="py-2 px-3">Lab 2</td>
                  </tr>
                  <tr className="hover:bg-amber-50/30">
                    <td className="py-2 px-3 font-mono font-bold">19 Oct 2026</td>
                    <td className="py-2 px-3">09:00 AM - 12:00 PM</td>
                    <td className="py-2 px-3 font-bold text-slate-900">Chemistry &amp; Applied Sciences (CHEM-103)</td>
                    <td className="py-2 px-3">Lab 1</td>
                  </tr>
                  <tr className="hover:bg-amber-50/30">
                    <td className="py-2 px-3 font-mono font-bold">21 Oct 2026</td>
                    <td className="py-2 px-3">09:00 AM - 12:00 PM</td>
                    <td className="py-2 px-3 font-bold text-slate-900">Computer Applications &amp; AI (CS-104)</td>
                    <td className="py-2 px-3">Computer Lab</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-end justify-between">
              <div className="text-center">
                <div className="w-24 border-b border-slate-400 pb-1 font-mono text-[10px] text-slate-400">Candidate Signature</div>
                <span className="text-[9px] text-slate-500">Sign before invigilator</span>
              </div>
              <div className="text-center space-y-1">
                <div className="w-32 border-b-2 border-amber-900 pb-1 font-serif italic text-amber-900 font-bold text-sm">
                  Controller of Exams
                </div>
                <div className="font-black text-[9px] text-slate-900 uppercase">Board Officer Stamp</div>
              </div>
            </div>
          </div>
        );

      // 6. STUDENT SMART ID CARD (FRONT & BACK)
      case 'id_card':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FRONT SIDE */}
            <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-5 rounded-2xl border-2 border-teal-500/40 shadow-lg relative overflow-hidden flex flex-col justify-between h-72">
              <div className="flex items-center justify-between border-b border-teal-500/30 pb-2">
                <div>
                  <div className="font-black tracking-wider text-xs text-teal-300 uppercase">NAIREE INTERNATIONAL</div>
                  <div className="text-[8px] text-slate-300">STUDENT IDENTITY CARD</div>
                </div>
                <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-black text-[10px]">
                  NIS
                </div>
              </div>

              <div className="flex items-center gap-4 my-auto">
                <img src={st.photo} alt={st.student_name} className="w-20 h-20 rounded-xl object-cover ring-2 ring-teal-400 shadow-md" />
                <div className="space-y-1 text-xs">
                  <div className="font-black text-sm text-white">{st.student_name}</div>
                  <div className="text-[10px] text-teal-300 font-mono">ID: {st.id} &bull; Roll: #{st.roll_no}</div>
                  <div className="text-[10px] text-slate-200">Class: <strong>{st.class_batch}</strong></div>
                  <div className="text-[10px] text-slate-200">Blood: <strong className="text-rose-400 font-bold">{st.blood_group}</strong> &bull; DOB: {st.dob}</div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-teal-500/30 pt-2 text-[9px] text-slate-300 font-mono">
                <span>Valid: 2025 - 2027</span>
                <span className="text-teal-300 font-bold">RFID ENCRYPTED</span>
              </div>
            </div>

            {/* BACK SIDE */}
            <div className="bg-white text-slate-800 p-5 rounded-2xl border-2 border-slate-300 shadow-lg flex flex-col justify-between h-72 text-[10px]">
              <div className="space-y-1.5 border-b pb-2">
                <div>Father's Name: <strong className="text-slate-900">{st.father_name}</strong></div>
                <div>Emergency Contact: <strong className="text-teal-700 font-mono">{st.father_phone || st.phone}</strong></div>
                <div>Address: <strong className="text-slate-700 block text-[9px] leading-tight">{st.residential_address}</strong></div>
              </div>

              <div className="text-center space-y-1">
                <div className="font-mono text-[9px] tracking-widest text-slate-500">||||||||||||||||||||||||||||||||||||||||</div>
                <div className="text-[8px] text-slate-400 font-mono">CODE128: {regNo}</div>
              </div>

              <div className="flex items-center justify-between border-t pt-2 text-[9px]">
                <span className="text-[8px] text-slate-400">If found, return to Nairee Office</span>
                <div className="text-center font-serif italic font-bold text-slate-900">Dr. Marcus Vance (Principal)</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Document Generator
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Select any student or generate all certificates, marksheet reports, and identity cards in high-resolution printable format
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setViewMode('all'); setShowPrintModal(true); }}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span>Bulk Print for All Students (6)</span>
            </button>
            <button
              onClick={() => { setViewMode('single'); setShowPrintModal(true); }}
              className="px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/30 flex items-center space-x-2 transition-transform hover:scale-105 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Current Document</span>
            </button>
          </div>
        </div>

        {/* 6 Supported Document Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-6 pt-6 border-t border-white/10">
          {docTypesList.map((dt) => {
            const Icon = dt.icon;
            const isSelected = docType === dt.id;
            return (
              <button
                key={dt.id}
                onClick={() => setDocType(dt.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-500/25 border-teal-400 text-white shadow-inner scale-[1.02]'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                    Doc #{dt.num}
                  </span>
                  <Icon className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-xs font-black truncate">{dt.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">{dt.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Settings & Right Document Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Student Selector & Parameters */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-teal-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Document &amp; Student Configuration</span>
            </h3>
            <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-bold border border-teal-200">
              {getDocRegNo(activeStudent, docType)}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Student Selector */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Candidate / Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer bg-slate-50/50"
              >
                {studentList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.student_name} ({s.class_batch}) &bull; Roll #{s.roll_no} &bull; {s.fee_status === 'Paid' ? 'Fee Cleared' : 'Fee Pending'}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Candidate Profile Card */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={activeStudent.photo} alt={activeStudent.student_name} className="w-12 h-12 rounded-xl object-cover border border-slate-300 shadow-sm" />
                <div>
                  <div className="font-bold text-slate-900 text-xs">{activeStudent.student_name}</div>
                  <div className="text-[11px] text-slate-500">{activeStudent.class_batch} &bull; Roll #{activeStudent.roll_no}</div>
                  <div className="text-[10px] text-slate-400 font-mono">Blood Group: {activeStudent.blood_group} &bull; DOB: {activeStudent.dob}</div>
                </div>
              </div>
              <div>
                {activeStudent.fee_status === 'Paid' ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                    Fee Paid
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
                    Fee Due ₹35,000
                  </span>
                )}
              </div>
            </div>

            {/* Configurable Parameters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Session</label>
                <input
                  type="text"
                  value={academicSession}
                  onChange={(e) => setAcademicSession(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date of Issue</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">General Conduct / Evaluation</label>
              <input
                type="text"
                value={conduct}
                onChange={(e) => setConduct(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Promotion / Status Remark</label>
              <input
                type="text"
                value={promotedTo}
                onChange={(e) => setPromotedTo(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => { setViewMode('single'); setShowPrintModal(true); }}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Open Printable Certificate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Document Preview */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-teal-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-slate-800 text-sm">
                Official Document Live Preview
              </h3>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              {docTypesList.find(d => d.id === docType)?.title}
            </span>
          </div>

          <div className="overflow-x-auto">
            {renderDocumentContent(activeStudent, docType)}
          </div>
        </div>
      </div>

      {/* FULL PRINT / BULK PRINT MODAL */}
      {showPrintModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowPrintModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">
                    {viewMode === 'all' ? `Bulk Print: ${docTypesList.find(d => d.id === docType)?.title} (All 6 Students)` : `Official Print: ${docTypesList.find(d => d.id === docType)?.title}`}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    High-resolution Board-compliant layout &bull; Ready for physical printer or PDF saving
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Printable Documents Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-100/60">
              {viewMode === 'all' ? (
                studentList.map((st, idx) => (
                  <div key={st.id || idx} className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                      <span>Document #{idx + 1} of {studentList.length} &bull; {st.student_name}</span>
                      <span className="font-mono">{getDocRegNo(st, docType)}</span>
                    </div>
                    {renderDocumentContent(st, docType)}
                  </div>
                ))
              ) : (
                renderDocumentContent(activeStudent, docType)
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Includes digital verification QR code &amp; institutional seal</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/25 flex items-center space-x-2 transition-transform hover:scale-105 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document(s)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
