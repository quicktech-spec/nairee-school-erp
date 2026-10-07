import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, 
  Plus, 
  X, 
  TrendingUp, 
  CheckCircle2, 
  BookOpen, 
  Search, 
  User, 
  Calculator, 
  Percent, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet, 
  Check, 
  AlertCircle, 
  Printer, 
  RotateCcw, 
  Sliders, 
  Filter,
  ShieldCheck,
  Send,
  Lock,
  Unlock,
  Eye,
  FileText,
  Star,
  Download
} from 'lucide-react';
import { api, subscribeLiveEvents, broadcastLiveEvent, getMasterStudents } from '../api.js';
import { useTenant } from '../context/TenantContext.jsx';
import { FALLBACK_STUDENTS } from '../fallbackData.js';

const DEFAULT_SUBJECTS = [
  { id: 'SUB-MATH', code: 'MATH-101', name: 'Mathematics', theoryMax: 80, practicalMax: 20, maxScore: 100, theoryScore: 72, practicalScore: 18, term1Score: 88, term2Score: 90 },
  { id: 'SUB-SCI', code: 'SCI-102', name: 'Science & Technology', theoryMax: 80, practicalMax: 20, maxScore: 100, theoryScore: 68, practicalScore: 19, term1Score: 85, term2Score: 87 },
  { id: 'SUB-ENG', code: 'ENG-103', name: 'English Language & Lit', theoryMax: 80, practicalMax: 20, maxScore: 100, theoryScore: 74, practicalScore: 18, term1Score: 90, term2Score: 92 },
  { id: 'SUB-SST', code: 'SST-104', name: 'Social Science', theoryMax: 80, practicalMax: 20, maxScore: 100, theoryScore: 70, practicalScore: 18, term1Score: 86, term2Score: 88 },
  { id: 'SUB-LANG', code: 'LANG-105', name: 'Second Language (Hindi/Sanskrit)', theoryMax: 80, practicalMax: 20, maxScore: 100, theoryScore: 75, practicalScore: 19, term1Score: 92, term2Score: 94 },
  { id: 'SUB-CS', code: 'CS-106', name: 'Computer Applications & AI', theoryMax: 50, practicalMax: 50, maxScore: 100, theoryScore: 46, practicalScore: 48, term1Score: 95, term2Score: 94 }
];

const CO_SCHOLASTIC_ACTIVITIES = [
  { activity: 'Work Education (ICT & Skill Labs)', grade: 'A+', indicator: 'Exemplary initiative in STEM projects' },
  { activity: 'Art Education (Visual & Performing Arts)', grade: 'A', indicator: 'High creativity and keen aesthetic sense' },
  { activity: 'Health & Physical Education (Sports & Yoga)', grade: 'A+', indicator: 'Outstanding athletics & team spirit' },
  { activity: 'Discipline, Ethics & Value Systems', grade: 'A+', indicator: 'Respectful, punctual & peer mentor' }
];

export default function GradebookView() {
  const { tenant, userRole } = useTenant();
  const isMasterSchool = !tenant || tenant.is_master_school || tenant.tenant_id === 'tenant-default' || tenant.subdomain === 'demo';
  const tenantKey = tenant?.tenant_id || 'default';
  const isPrincipalOrAdmin = userRole === 'admin' || userRole === 'principal' || !userRole;

  // Core Data States
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('single'); // 'single' | 'spreadsheet' | 'report_card'

  // Filter & Selected Student States
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Single Student Marks Entry Form State
  const [examName, setExamName] = useState('Annual Examination 2026');
  const [academicTerm, setAcademicTerm] = useState('Consolidated Term 1 & Term 2');
  const [subjectMarks, setSubjectMarks] = useState(DEFAULT_SUBJECTS);
  const [teacherRemarks, setTeacherRemarks] = useState('');
  const [roundOffMode, setRoundOffMode] = useState('none'); // 'none' | 'nearest' | 'ceil' | 'floor'
  
  // Publication / Workflow State: 'draft' | 'under_review' | 'published'
  const [publishStatus, setPublishStatus] = useState(() => {
    try {
      return localStorage.getItem(`nairee_publish_status_${tenantKey}_${examName.replace(/\s+/g, '_')}`) || (isMasterSchool ? 'published' : 'draft');
    } catch {
      return isMasterSchool ? 'published' : 'draft';
    }
  });

  // Modals
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Load Initial Master Data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [plansData, coursesData] = await Promise.all([
        api.getAssessmentPlans().catch(() => []),
        api.getCourses().catch(() => [])
      ]);

      const master = getMasterStudents();
      const stList = (master && master.length > 0) 
        ? master 
        : (isMasterSchool ? FALLBACK_STUDENTS : []);

      setPlans(plansData);
      setCourses(coursesData);
      setStudents(stList);

      if (plansData.length > 0 && !selectedPlan) {
        setSelectedPlan(plansData[0].name || plansData[0].plan_id);
      }

      if (stList.length > 0 && !selectedStudentId) {
        setSelectedStudentId(stList[0].student_id || stList[0].id);
      }
    } catch (err) {
      console.error('Error loading gradebook data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [tenantKey]);

  const loadResults = async () => {
    try {
      const data = await api.getAssessmentResults({ plan: selectedPlan });
      setResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedPlan) {
      loadResults();
    }
  }, [selectedPlan]);

  // Live real-time sync across multi-tabs
  useEffect(() => {
    const unsub = subscribeLiveEvents((event) => {
      loadResults();
      const master = getMasterStudents();
      if (master) setStudents(master);
      if (event?.type === 'exam_published' || event?.type === 'marks_updated') {
        const savedStatus = localStorage.getItem(`nairee_publish_status_${tenantKey}_${examName.replace(/\s+/g, '_')}`);
        if (savedStatus) setPublishStatus(savedStatus);
      }
    });
    return () => unsub();
  }, [selectedPlan, tenantKey, examName]);

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchClass = selectedClassFilter === 'all' || 
        (s.class_batch && s.class_batch.toLowerCase().includes(selectedClassFilter.toLowerCase())) ||
        (s.student_batch && s.student_batch.toLowerCase().includes(selectedClassFilter.toLowerCase()));
      
      const sName = (s.student_name || s.name || '').toLowerCase();
      const sRoll = String(s.roll_no || '').toLowerCase();
      const sId = String(s.student_id || s.id || '').toLowerCase();
      const q = searchStudentQuery.toLowerCase().trim();
      const matchSearch = !q || sName.includes(q) || sRoll.includes(q) || sId.includes(q);

      return matchClass && matchSearch;
    });
  }, [students, selectedClassFilter, searchStudentQuery]);

  // Currently Selected Student Object
  const currentStudent = useMemo(() => {
    return students.find(s => (s.student_id || s.id) === selectedStudentId) || filteredStudents[0] || null;
  }, [students, selectedStudentId, filteredStudents]);

  // Available Classes/Batches for Filter Dropdown
  const availableBatches = useMemo(() => {
    const set = new Set();
    students.forEach(s => {
      if (s.class_batch) set.add(s.class_batch);
      else if (s.student_batch) set.add(s.student_batch);
    });
    return Array.from(set);
  }, [students]);

  // Load existing saved marks for current student if available
  useEffect(() => {
    if (!currentStudent) return;
    const studentId = currentStudent.student_id || currentStudent.id;
    try {
      const savedKey = `nairee_marksheet_${tenantKey}_${studentId}_${examName.replace(/\s+/g, '_')}`;
      const savedData = localStorage.getItem(savedKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.subjectMarks && Array.isArray(parsed.subjectMarks)) {
          setSubjectMarks(parsed.subjectMarks);
        }
        if (parsed.teacherRemarks) setTeacherRemarks(parsed.teacherRemarks);
        if (parsed.roundOffMode) setRoundOffMode(parsed.roundOffMode);
        return;
      }
    } catch {}

    // Balanced default marks
    const rollNum = Number(currentStudent.roll_no) || 1;
    const baseVariance = (rollNum % 5) * 1.5;
    setSubjectMarks(DEFAULT_SUBJECTS.map((sub, idx) => {
      const rawTheory = Math.max(35, Math.min(sub.theoryMax, sub.theoryMax - 8 + ((idx % 3) * 2.5) - baseVariance));
      const rawPractical = Math.max(12, Math.min(sub.practicalMax, sub.practicalMax - 2));
      return {
        ...sub,
        theoryScore: Number(rawTheory.toFixed(1)),
        practicalScore: Number(rawPractical.toFixed(1))
      };
    }));
    setRoundOffMode('none');
  }, [currentStudent, examName, tenantKey]);

  // Handle Score Input Change
  const handleScoreChange = (index, field, value) => {
    const updated = [...subjectMarks];
    const numVal = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
    updated[index][field] = numVal;
    setSubjectMarks(updated);
  };

  // Calculations: Raw Totals and Maximums
  const { rawTotalObtained, totalMaxMarks, rawPercentage, hasDecimal, roundedTotal, roundedPercentage } = useMemo(() => {
    let obtained = 0;
    let maxTotal = 0;
    let anyDecimal = false;

    subjectMarks.forEach(sub => {
      const t = parseFloat(sub.theoryScore) || 0;
      const p = parseFloat(sub.practicalScore) || 0;
      const totalSub = t + p;
      const m = parseFloat(sub.maxScore) || 100;

      obtained += totalSub;
      maxTotal += m;

      if (t % 1 !== 0 || p % 1 !== 0 || totalSub % 1 !== 0) {
        anyDecimal = true;
      }
    });

    const pct = maxTotal > 0 ? (obtained / maxTotal) * 100 : 0;
    if (obtained % 1 !== 0 || pct % 1 !== 0) {
      anyDecimal = true;
    }

    let finalTot = obtained;
    let finalPct = pct;

    if (roundOffMode === 'nearest') {
      finalTot = Math.round(obtained);
      finalPct = maxTotal > 0 ? Math.round((finalTot / maxTotal) * 100) : 0;
    } else if (roundOffMode === 'ceil') {
      finalTot = Math.ceil(obtained);
      finalPct = maxTotal > 0 ? Math.ceil((finalTot / maxTotal) * 100) : 0;
    } else if (roundOffMode === 'floor') {
      finalTot = Math.floor(obtained);
      finalPct = maxTotal > 0 ? Math.floor((finalTot / maxTotal) * 100) : 0;
    }

    return {
      rawTotalObtained: obtained,
      totalMaxMarks: maxTotal,
      rawPercentage: pct,
      hasDecimal: anyDecimal,
      roundedTotal: finalTot,
      roundedPercentage: finalPct
    };
  }, [subjectMarks, roundOffMode]);

  // Current Display Totals based on Round-off selection
  const displayTotal = roundOffMode === 'none' ? Number(rawTotalObtained.toFixed(1)) : roundedTotal;
  const displayPercentage = roundOffMode === 'none' ? Number(rawPercentage.toFixed(2)) : roundedPercentage;

  // Compute Grade Scale
  const letterGrade = useMemo(() => {
    if (displayPercentage >= 90) return { grade: 'A+', label: 'Outstanding Distinction', color: 'bg-emerald-500 text-white', border: 'border-emerald-500' };
    if (displayPercentage >= 80) return { grade: 'A', label: 'Excellent', color: 'bg-teal-500 text-white', border: 'border-teal-500' };
    if (displayPercentage >= 70) return { grade: 'B+', label: 'Very Good', color: 'bg-indigo-500 text-white', border: 'border-indigo-500' };
    if (displayPercentage >= 60) return { grade: 'B', label: 'Good', color: 'bg-blue-500 text-white', border: 'border-blue-500' };
    if (displayPercentage >= 50) return { grade: 'C', label: 'Average', color: 'bg-amber-500 text-white', border: 'border-amber-500' };
    if (displayPercentage >= 33) return { grade: 'D', label: 'Pass', color: 'bg-slate-500 text-white', border: 'border-slate-500' };
    return { grade: 'F', label: 'Needs Remedial Support', color: 'bg-rose-500 text-white', border: 'border-rose-500' };
  }, [displayPercentage]);

  // Stepper: Jump to Next or Previous Student
  const handleStepStudent = (direction) => {
    if (!currentStudent || filteredStudents.length === 0) return;
    const currentIndex = filteredStudents.findIndex(s => (s.student_id || s.id) === (currentStudent.student_id || currentStudent.id));
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = filteredStudents.length - 1;
    if (nextIndex >= filteredStudents.length) nextIndex = 0;

    const nextStudent = filteredStudents[nextIndex];
    if (nextStudent) {
      setSelectedStudentId(nextStudent.student_id || nextStudent.id);
    }
  };

  // Generate AI Teacher Remark
  const handleGenerateAiRemark = () => {
    if (!currentStudent) return;
    const sName = currentStudent.student_name || currentStudent.name || 'The student';
    let remark = '';

    if (displayPercentage >= 90) {
      remark = `${sName} exhibits outstanding academic brilliance and profound problem-solving abilities with ${displayPercentage}%. Exemplary classroom leadership and curious inquiry. Strongly recommended for honors projects.`;
    } else if (displayPercentage >= 75) {
      remark = `${sName} displays solid conceptual mastery and steady dedication, securing ${displayPercentage}%. Continuing targeted practice on complex problem sets will unlock the highest distinction.`;
    } else if (displayPercentage >= 60) {
      remark = `${sName} demonstrates satisfactory progress scoring ${displayPercentage}%. Consistent preparation and revision before examinations are recommended to strengthen test scores.`;
    } else {
      remark = `${sName} scored ${displayPercentage}%. Dedicated one-on-one tutorial sessions and focused conceptual worksheets are advised to reinforce fundamental principles.`;
    }

    setTeacherRemarks(remark);
    showToast('AI Remark generated tailored to student scores & percentage!');
  };

  // Handle Workflow Status Update (Feature 3)
  const handleUpdatePublishStatus = (nextStatus) => {
    setPublishStatus(nextStatus);
    const key = `nairee_publish_status_${tenantKey}_${examName.replace(/\s+/g, '_')}`;
    localStorage.setItem(key, nextStatus);
    broadcastLiveEvent('exam_published', { 
      examName, 
      status: nextStatus, 
      tenant_id: tenantKey,
      updated_by: userRole || 'Faculty Lead'
    });

    if (nextStatus === 'under_review') {
      showToast('Marksheet submitted to Principal & Exam Committee for approval.');
    } else if (nextStatus === 'published') {
      showToast('🎉 Examination Results Approved & Released live to Student & Parent Portals!');
    } else {
      showToast('Marksheet reverted to Draft Mode for faculty revisions.');
    }
    setShowApprovalModal(false);
  };

  // Save Marksheet to Local & API DB
  const handleSaveMarksheet = async (andNext = false) => {
    if (!currentStudent) {
      alert('Please select a student first.');
      return;
    }

    const studentId = currentStudent.student_id || currentStudent.id;
    const studentName = currentStudent.student_name || currentStudent.name;
    const classBatch = currentStudent.class_batch || currentStudent.student_batch || 'Class 10 - Section A';
    const rollNo = currentStudent.roll_no || '01';

    const marksheetRecord = {
      student_id: studentId,
      student_name: studentName,
      class_batch: classBatch,
      roll_no: rollNo,
      exam_name: examName,
      academic_term: academicTerm,
      subjectMarks,
      totalObtained: displayTotal,
      rawTotal: rawTotalObtained,
      totalMaxMarks,
      percentage: displayPercentage,
      rawPercentage,
      grade: letterGrade.grade,
      gradeLabel: letterGrade.label,
      roundOffMode,
      teacherRemarks,
      publishStatus,
      updated_at: new Date().toISOString()
    };

    try {
      const savedKey = `nairee_marksheet_${tenantKey}_${studentId}_${examName.replace(/\s+/g, '_')}`;
      localStorage.setItem(savedKey, JSON.stringify(marksheetRecord));

      await api.submitGrade({
        assessment_plan: selectedPlan || 'ASM-MATH-MID',
        course: 'CRS-ALL-TERM',
        student: studentId,
        student_id: studentId,
        student_name: studentName,
        roll_no: rollNo,
        class_batch: classBatch,
        score: displayTotal,
        maximum_score: totalMaxMarks,
        percentage: displayPercentage,
        grade: letterGrade.grade,
        comment: teacherRemarks || `${letterGrade.label} (${displayPercentage}%)`
      });

      broadcastLiveEvent('marks_updated', { student_id: studentId, marksheet: marksheetRecord });
      showToast(`Marksheet saved successfully for ${studentName} (Roll #${rollNo})!`);

      if (andNext) {
        handleStepStudent(1);
      }
    } catch (err) {
      console.error('Error saving marksheet:', err);
      showToast('Error saving marksheet: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c1f2c] border border-teal-500/60 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER & WORKFLOW CONTROLS */}
      <div className="bg-white p-5 rounded-3xl border border-teal-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
                <span>Examinations & Gradebook Marks Entry</span>
                {/* Workflow Status Chip (Feature 3) */}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                  publishStatus === 'published' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : publishStatus === 'under_review'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {publishStatus === 'published' ? <Unlock className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-amber-600" />}
                  <span>{publishStatus === 'published' ? 'LIVE & RELEASED TO PARENTS' : publishStatus === 'under_review' ? 'UNDER PRINCIPAL REVIEW' : 'FACULTY DRAFT MODE'}</span>
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated formula calculation, decimal round-off engine & official printable annual report card
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher, Workflow Trigger & Report Card Modal Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Workflow Approval / Publish Button (Feature 3) */}
          <button
            onClick={() => setShowApprovalModal(true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              publishStatus === 'published'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : publishStatus === 'under_review'
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{publishStatus === 'published' ? 'Result Published (Live)' : publishStatus === 'under_review' ? 'Review & Publish' : 'Submit for Approval'}</span>
          </button>

          <div className="bg-slate-100 p-1 rounded-2xl flex items-center text-xs font-bold">
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'single'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Single Entry Form
            </button>
            <button
              onClick={() => setViewMode('spreadsheet')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'spreadsheet'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
              <span>Class Spreadsheet</span>
            </button>
          </div>

          {/* Printable Report Card Button (Feature 1) */}
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Annual Report Card</span>
          </button>
        </div>
      </div>

      {/* WORKFLOW STATUS BANNER (Feature 3) */}
      <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
        publishStatus === 'published'
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
          : publishStatus === 'under_review'
          ? 'bg-blue-50/80 border-blue-200 text-blue-900'
          : 'bg-amber-50/80 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
            publishStatus === 'published' ? 'bg-emerald-500 text-white' : publishStatus === 'under_review' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'
          }`}>
            {publishStatus === 'published' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          </div>
          <div>
            <span className="font-extrabold uppercase tracking-wide text-[11px] block">
              {publishStatus === 'published' ? 'Results Live & Unlocked' : publishStatus === 'under_review' ? 'Results Under Principal Moderation' : 'Draft Entry Mode (Faculty Only)'}
            </span>
            <p className="text-[11px] opacity-90">
              {publishStatus === 'published'
                ? 'Exam scores & official report cards are visible to students and parents in their portals with 1-click download.'
                : publishStatus === 'under_review'
                ? 'Marks submitted to the Exam Office. Principal can review class percentiles and release to parents.'
                : 'Marks are currently in private evaluation mode. Students and parents will see "Under Evaluation" until released.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowApprovalModal(true)}
          className="text-xs font-bold underline cursor-pointer hover:opacity-80 flex-shrink-0"
        >
          Change Status
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: SINGLE STUDENT MARKS ENTRY FORM WITH DROPDOWN AT THE TOP */}
      {/* ========================================================================= */}
      {viewMode === 'single' && (
        <div className="space-y-6">
          
          {/* TOP CONTROLS CARD: STUDENT DROPDOWN, CLASS SELECTOR & EXAM SELECTOR */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 rounded-3xl text-white shadow-xl space-y-4 border border-teal-900/40">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              
              {/* Dropdown 1: Filter by Class */}
              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-teal-300 uppercase tracking-wider mb-1.5">
                  1. Filter by Class / Batch
                </label>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
                >
                  <option value="all" className="text-slate-900">All Registered Classes</option>
                  {availableBatches.map(b => (
                    <option key={b} value={b} className="text-slate-900">{b}</option>
                  ))}
                  {availableBatches.length === 0 && (
                    <option value="CLS-10A" className="text-slate-900">Class 10 - Section A</option>
                  )}
                </select>
              </div>

              {/* Dropdown 2: PRIMARY STUDENT NAME DROPDOWN (Requested by User) */}
              <div className="md:col-span-5">
                <label className="block text-[11px] font-bold text-teal-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>2. Select Student Name (Dropdown)</span>
                  <span className="text-[10px] text-teal-400 lowercase">{filteredStudents.length} available</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white text-slate-900 text-xs font-bold shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
                  >
                    {filteredStudents.length === 0 ? (
                      <option value="">No students found</option>
                    ) : (
                      filteredStudents.map(s => (
                        <option key={s.student_id || s.id} value={s.student_id || s.id}>
                          {s.student_name || s.name} • Roll #{s.roll_no ? String(s.roll_no).padStart(2, '0') : '01'} ({s.class_batch || s.student_batch || 'Class 10-A'})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Dropdown 3: Exam Type */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-teal-300 uppercase tracking-wider mb-1.5">
                  3. Examination
                </label>
                <select
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
                >
                  <option value="Annual Examination 2026" className="text-slate-900">Annual Final Exam 2026</option>
                  <option value="Mid-Term Examination 2026" className="text-slate-900">Mid-Term Exam 2026</option>
                  <option value="Unit Test 1" className="text-slate-900">Unit Test 1 (Formative)</option>
                  <option value="Unit Test 2" className="text-slate-900">Unit Test 2 (Formative)</option>
                  <option value="Pre-Board Assessment" className="text-slate-900">Pre-Board Assessment</option>
                </select>
              </div>

              {/* Prev / Next Quick Stepper Buttons */}
              <div className="md:col-span-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStepStudent(-1)}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Previous Student"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStepStudent(1)}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-teal-500/30 transition-colors cursor-pointer"
                  title="Next Student"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* AUTO-POPULATED STUDENT DETAILS STRIP */}
            {currentStudent ? (
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-black text-sm">
                    {currentStudent.roll_no ? String(currentStudent.roll_no).padStart(2, '0') : '01'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <span>{currentStudent.student_name || currentStudent.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        {currentStudent.student_id || currentStudent.id || 'NIS-2024-001'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-teal-200/80">
                      Class & Section: <strong>{currentStudent.class_batch || currentStudent.student_batch || 'Class 10 - Section A'}</strong> • Gender: {currentStudent.gender || 'Female'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block uppercase">Session</span>
                    <span className="font-bold text-white">2026-2027</span>
                  </div>
                  <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block uppercase">Evaluation Scale</span>
                    <span className="font-bold text-teal-300">CBSE / State K-12</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-2 text-center text-xs text-teal-200/70">
                No student selected. Choose a student from the dropdown above to load subjects and enter marks.
              </div>
            )}
          </div>

          {/* MARKS ENTRY SPREADSHEET TABLE & PERFORMANCE SUMMARY GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 8 Cols: Subject Marks Input Grid */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-teal-100 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Subject-Wise Marks Evaluation</h3>
                  <p className="text-xs text-slate-500">Fill in Theory & Internal marks. Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono border">Tab</kbd> to jump across subjects.</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newSub = {
                      id: `SUB-${Date.now().toString().slice(-4)}`,
                      code: `ELEC-${subjectMarks.length + 1}`,
                      name: `Elective Subject ${subjectMarks.length + 1}`,
                      theoryMax: 80,
                      practicalMax: 20,
                      maxScore: 100,
                      theoryScore: 70,
                      practicalScore: 18
                    };
                    setSubjectMarks([...subjectMarks, newSub]);
                    showToast('Added new elective subject row');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Subject</span>
                </button>
              </div>

              {/* Interactive Subject Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                      <th className="py-3 px-3">Subject Name</th>
                      <th className="py-3 px-3 w-28 text-center">Theory (/80)</th>
                      <th className="py-3 px-3 w-28 text-center">Internal (/20)</th>
                      <th className="py-3 px-3 w-28 text-center">Total Score</th>
                      <th className="py-3 px-3 w-20 text-center">Grade</th>
                      <th className="py-3 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {subjectMarks.map((sub, idx) => {
                      const tScore = parseFloat(sub.theoryScore) || 0;
                      const pScore = parseFloat(sub.practicalScore) || 0;
                      const subTotal = tScore + pScore;
                      const subMax = parseFloat(sub.maxScore) || 100;
                      const subPct = subMax > 0 ? (subTotal / subMax) * 100 : 0;
                      const subGrade = subPct >= 90 ? 'A+' : subPct >= 80 ? 'A' : subPct >= 70 ? 'B+' : subPct >= 60 ? 'B' : subPct >= 50 ? 'C' : subPct >= 33 ? 'D' : 'F';

                      return (
                        <tr key={sub.id || idx} className="hover:bg-teal-50/30 transition-colors">
                          <td className="py-3 px-3">
                            <input
                              type="text"
                              value={sub.name}
                              onChange={(e) => {
                                const updated = [...subjectMarks];
                                updated[idx].name = e.target.value;
                                setSubjectMarks(updated);
                              }}
                              className="font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 focus:outline-none w-full"
                            />
                            <span className="text-[10px] text-slate-400 font-mono block">{sub.code} • Max {sub.maxScore}</span>
                          </td>

                          {/* Theory Marks Input */}
                          <td className="py-3 px-3 text-center">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max={sub.theoryMax}
                              value={sub.theoryScore}
                              onChange={(e) => handleScoreChange(idx, 'theoryScore', e.target.value)}
                              className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-200 text-center font-bold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs"
                              placeholder="0"
                            />
                          </td>

                          {/* Practical / Internal Marks Input */}
                          <td className="py-3 px-3 text-center">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max={sub.practicalMax}
                              value={sub.practicalScore}
                              onChange={(e) => handleScoreChange(idx, 'practicalScore', e.target.value)}
                              className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-200 text-center font-bold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs"
                              placeholder="0"
                            />
                          </td>

                          {/* Auto Calculated Total */}
                          <td className="py-3 px-3 text-center">
                            <span className="inline-block px-3 py-1 rounded-xl bg-slate-100 font-extrabold text-slate-900 text-xs">
                              {subTotal} <span className="text-slate-400 font-normal text-[10px]">/{subMax}</span>
                            </span>
                          </td>

                          {/* Auto Subject Grade Badge */}
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold ${
                              subGrade === 'A+' ? 'bg-emerald-100 text-emerald-800' :
                              subGrade === 'A' ? 'bg-teal-100 text-teal-800' :
                              subGrade === 'B+' ? 'bg-indigo-100 text-indigo-800' :
                              subGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                              subGrade === 'C' ? 'bg-amber-100 text-amber-800' :
                              subGrade === 'D' ? 'bg-slate-200 text-slate-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {subGrade}
                            </span>
                          </td>

                          {/* Delete Row */}
                          <td className="py-3 px-2 text-center">
                            {subjectMarks.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSubjectMarks(subjectMarks.filter((_, i) => i !== idx));
                                }}
                                className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                                title="Remove Subject"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* CONDITIONAL DECIMAL ROUND-OFF FEATURE */}
              {hasDecimal && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 shadow-sm space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-amber-500 text-white">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide flex items-center gap-2">
                          <span>Decimal Values Detected</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                            Raw Total: {rawTotalObtained} ({rawPercentage.toFixed(2)}%)
                          </span>
                        </h4>
                        <p className="text-[11px] text-amber-800">
                          One or more subject marks or overall percentage has decimal fractions. Select a round-off option below:
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Round-off option pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {[
                      { id: 'none', label: '1. Exact Decimals', sub: `${rawTotalObtained} (${rawPercentage.toFixed(2)}%)` },
                      { id: 'nearest', label: '2. Nearest Integer', sub: `${Math.round(rawTotalObtained)} (${Math.round(rawPercentage)}%)` },
                      { id: 'ceil', label: '3. Round Up (Ceil)', sub: `${Math.ceil(rawTotalObtained)} (${Math.ceil(rawPercentage)}%)` },
                      { id: 'floor', label: '4. Round Down (Floor)', sub: `${Math.floor(rawTotalObtained)} (${Math.floor(rawPercentage)}%)` }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setRoundOffMode(opt.id)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          roundOffMode === opt.id
                            ? 'bg-amber-600 text-white border-amber-700 shadow-md font-bold'
                            : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/60 font-semibold'
                        }`}
                      >
                        <span className="block text-xs">{opt.label}</span>
                        <span className={`text-[10px] block mt-0.5 ${roundOffMode === opt.id ? 'text-amber-100' : 'text-slate-500'}`}>
                          {opt.sub}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Faculty Remarks & AI Comment Generator */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Faculty Remarks & Evaluator Feedback
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateAiRemark}
                    className="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[11px] shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate AI Remark</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={teacherRemarks}
                  onChange={(e) => setTeacherRemarks(e.target.value)}
                  placeholder="Enter constructive remarks for the student's report card..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubjectMarks(DEFAULT_SUBJECTS);
                      setRoundOffMode('none');
                      setTeacherRemarks('');
                      showToast('Reset form to initial state');
                    }}
                    className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveMarksheet(false)}
                    className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Save Marksheet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveMarksheet(true)}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
                  >
                    <span>Save & Next Student</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Right 4 Cols: Live Performance Summary Card */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Total Marks & Percentage Result Card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-3xl p-6 text-white shadow-xl space-y-5 border border-teal-900/50">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block">Evaluation Summary</span>
                    <h4 className="font-extrabold text-sm text-white">{examName}</h4>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black shadow-sm ${letterGrade.color}`}>
                    Grade {letterGrade.grade}
                  </span>
                </div>

                {/* Big Score Display */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Obtained</span>
                    <span className="text-2xl font-black text-teal-300 block mt-0.5">
                      {displayTotal}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold block">out of {totalMaxMarks}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Overall Percentage</span>
                    <span className="text-2xl font-black text-emerald-400 block mt-0.5">
                      {displayPercentage}%
                    </span>
                    <span className="text-[10px] text-teal-300/80 font-semibold block">
                      {letterGrade.label}
                    </span>
                  </div>
                </div>

                {/* Progress Visualizer */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-300 font-bold">
                    <span>Performance Progress</span>
                    <span>{displayPercentage}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 transition-all duration-500 shadow"
                      style={{ width: `${Math.min(100, Math.max(5, displayPercentage))}%` }}
                    />
                  </div>
                </div>

                {/* Breakdown List */}
                <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Total Evaluated Subjects:</span>
                    <span className="font-bold text-white">{subjectMarks.length} Subjects</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Round-Off Mode:</span>
                    <span className="font-bold text-teal-300 capitalize">{roundOffMode === 'none' ? 'Exact (No Rounding)' : roundOffMode}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Passing Status:</span>
                    <span className={`font-black ${displayPercentage >= 33 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {displayPercentage >= 33 ? 'QUALIFIED / PASSED' : 'REMEDIAL REQUIRED'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Student Quick Switcher Drawer Card */}
              <div className="bg-white rounded-3xl p-5 border border-teal-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs">Quick Class Roster</h4>
                  <span className="text-[10px] text-slate-400 font-semibold">{filteredStudents.length} Students</span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search student or roll #..."
                    value={searchStudentQuery}
                    onChange={(e) => setSearchStudentQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-50">
                  {filteredStudents.map(s => {
                    const isSelected = (s.student_id || s.id) === (currentStudent?.student_id || currentStudent?.id);
                    return (
                      <button
                        key={s.student_id || s.id}
                        type="button"
                        onClick={() => setSelectedStudentId(s.student_id || s.id)}
                        className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200'
                            : 'hover:bg-slate-50 text-slate-700 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                            {s.roll_no ? String(s.roll_no).padStart(2, '0') : '01'}
                          </span>
                          <span className="truncate">{s.student_name || s.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: SPREADSHEET CLASS MATRIX GRID VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'spreadsheet' && (
        <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Class-Wide Marksheet Spreadsheet</h3>
              <p className="text-xs text-slate-500">Live evaluation matrix of all students in {selectedClassFilter === 'all' ? 'all sections' : selectedClassFilter}</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Classes</option>
                {availableBatches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3 px-3">Roll & Student</th>
                  <th className="py-3 px-3">Class</th>
                  <th className="py-3 px-3 text-center">Maths (100)</th>
                  <th className="py-3 px-3 text-center">Science (100)</th>
                  <th className="py-3 px-3 text-center">English (100)</th>
                  <th className="py-3 px-3 text-center">Social Sci (100)</th>
                  <th className="py-3 px-3 text-center">Language (100)</th>
                  <th className="py-3 px-3 text-center">Total (/500)</th>
                  <th className="py-3 px-3 text-center">Percentage</th>
                  <th className="py-3 px-3 text-center">Grade</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-400">
                      No students enrolled in this batch yet.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, idx) => {
                    const rNum = Number(s.roll_no) || (idx + 1);
                    const baseM = Math.min(98, Math.max(55, 92 - (rNum % 7) * 3));
                    const baseS = Math.min(99, Math.max(58, 90 - (rNum % 5) * 4));
                    const baseE = Math.min(95, Math.max(62, 88 - (rNum % 4) * 2));
                    const baseSS = Math.min(96, Math.max(60, 85 - (rNum % 6) * 3));
                    const baseL = Math.min(97, Math.max(65, 91 - (rNum % 3) * 2));

                    const tot = baseM + baseS + baseE + baseSS + baseL;
                    const pct = Number(((tot / 500) * 100).toFixed(1));
                    const grd = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'D';

                    return (
                      <tr key={s.student_id || s.id} className="hover:bg-teal-50/40 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                            #{s.roll_no ? String(s.roll_no).padStart(2, '0') : '01'}
                          </span>
                          <span>{s.student_name || s.name}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-semibold">{s.class_batch || s.student_batch || 'Class 10-A'}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">{baseM}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">{baseS}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">{baseE}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">{baseSS}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">{baseL}</td>
                        <td className="py-3 px-3 text-center font-black text-slate-900">{tot}</td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-700">{pct}%</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                            grd === 'A+' ? 'bg-emerald-100 text-emerald-800' :
                            grd === 'A' ? 'bg-teal-100 text-teal-800' :
                            grd === 'B+' ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {grd}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentId(s.student_id || s.id);
                              setViewMode('single');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Edit Form
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 3: MODAL FOR APPROVAL & PUBLISH WORKFLOW */}
      {/* ========================================================================= */}
      {showApprovalModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowApprovalModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-teal-100 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Examination Release Workflow</h3>
                  <p className="text-xs text-slate-500">Moderation, approval and parent release lifecycle</p>
                </div>
              </div>
              <button onClick={() => setShowApprovalModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Step 1: Draft */}
              <div className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                publishStatus === 'draft' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/40' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`} onClick={() => handleUpdatePublishStatus('draft')}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>1. Faculty Draft Mode</span>
                  </span>
                  {publishStatus === 'draft' && <Check className="w-4 h-4 text-amber-600 font-bold" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Marks editable only by appointed subject teachers. Hidden from parents and students.
                </p>
              </div>

              {/* Step 2: Under Review */}
              <div className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                publishStatus === 'under_review' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400/40' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`} onClick={() => handleUpdatePublishStatus('under_review')}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span>2. Submitted for Principal & Exam Cell Review</span>
                  </span>
                  {publishStatus === 'under_review' && <Check className="w-4 h-4 text-blue-600 font-bold" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Faculty has locked marks. Principal reviews grade distributions, class averages, and moderation curves.
                </p>
              </div>

              {/* Step 3: Approved & Published */}
              <div className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                publishStatus === 'published' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/40' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`} onClick={() => handleUpdatePublishStatus('published')}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>3. Approved & Released to Parents & Students</span>
                  </span>
                  {publishStatus === 'published' && <Check className="w-4 h-4 text-emerald-600 font-bold" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Official report cards and marks unlocked live in student & parent portals with printable PDF download.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 1: COMPREHENSIVE CBSE/ICSE ANNUAL REPORT CARD PRINT MODAL */}
      {/* ========================================================================= */}
      {showPrintModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowPrintModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-4xl w-full p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto print:max-w-none print:shadow-none print:p-0 print:border-none">
            
            {/* Header with School Details & Board Affiliation */}
            <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1 relative">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                  {tenant?.school_name?.charAt(0) || 'N'}
                </div>
                <div className="text-left">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
                    {tenant?.school_name || 'Nairee International School'}
                  </h1>
                  <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                    {tenant?.tagline || 'Affiliated to Central Board of Secondary Education (CBSE) • Code #NIS-89021'}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {tenant?.address || 'Main Campus, Sector 4, Academic City'} • Tel: {tenant?.phone || '+91 98765 43210'} • Web: {tenant?.subdomain ? `${tenant.subdomain}.nairee.edu` : 'https://nairee.edu'}
              </p>
              <div className="inline-block mt-2 px-4 py-1 rounded-full bg-slate-900 text-white font-extrabold text-xs tracking-widest uppercase">
                Official Annual Cumulative Progress Report Card (2026-27)
              </div>
            </div>

            {/* Student Bio Profile Box */}
            {currentStudent && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Student Name</span>
                  <span className="font-extrabold text-slate-900 text-sm">{currentStudent.student_name || currentStudent.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Roll Number</span>
                  <span className="font-black text-slate-900 text-sm">Roll #{currentStudent.roll_no ? String(currentStudent.roll_no).padStart(2, '0') : '01'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Class & Section</span>
                  <span className="font-extrabold text-slate-900">{currentStudent.class_batch || currentStudent.student_batch || 'Class 10 - Section A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Admission / ID</span>
                  <span className="font-mono font-bold text-teal-800">{currentStudent.student_id || currentStudent.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Mother's Name</span>
                  <span className="font-semibold text-slate-800">{currentStudent.mother_name || 'Mrs. Anita Patel'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Father's Name</span>
                  <span className="font-semibold text-slate-800">{currentStudent.father_name || currentStudent.guardian_name || 'Mr. Rajesh Patel'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Academic Session</span>
                  <span className="font-semibold text-slate-800">2026 - 2027</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Attendance Record</span>
                  <span className="font-bold text-emerald-700">214 / 225 Days (95.1%)</span>
                </div>
              </div>
            )}

            {/* Part 1: Scholastic Performance Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide border-b pb-1">
                Part 1: Scholastic Academic Areas
              </h4>
              <table className="w-full text-left text-xs border border-slate-300 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 border-b border-r">Subjects</th>
                    <th className="py-2.5 px-2 border-b border-r text-center">Term 1 (/100)</th>
                    <th className="py-2.5 px-2 border-b border-r text-center">Theory (/80)</th>
                    <th className="py-2.5 px-2 border-b border-r text-center">Internal (/20)</th>
                    <th className="py-2.5 px-2 border-b border-r text-center">Term 2 Total</th>
                    <th className="py-2.5 px-2 border-b border-r text-center">Grand Total</th>
                    <th className="py-2.5 px-2 border-b text-center">Subject Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {subjectMarks.map((sub, i) => {
                    const t = parseFloat(sub.theoryScore) || 0;
                    const p = parseFloat(sub.practicalScore) || 0;
                    const t2 = t + p;
                    const t1 = sub.term1Score || Math.min(100, Math.round(t2 - 2 + (i % 3)));
                    const grand = Math.round((t1 + t2) / 2);
                    const grd = grand >= 90 ? 'A+' : grand >= 80 ? 'A' : grand >= 70 ? 'B+' : grand >= 60 ? 'B' : grand >= 50 ? 'C' : 'D';

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-900 border-r">{sub.name}</td>
                        <td className="py-2 px-2 text-center border-r font-medium text-slate-600">{t1}</td>
                        <td className="py-2 px-2 text-center border-r font-medium text-slate-600">{t}</td>
                        <td className="py-2 px-2 text-center border-r font-medium text-slate-600">{p}</td>
                        <td className="py-2 px-2 text-center border-r font-bold text-slate-900">{t2}</td>
                        <td className="py-2 px-2 text-center border-r font-black text-slate-950">{grand} / 100</td>
                        <td className="py-2 px-2 text-center font-black">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            grd === 'A+' ? 'bg-emerald-100 text-emerald-800' :
                            grd === 'A' ? 'bg-teal-100 text-teal-800' :
                            grd === 'B+' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'
                          }`}>{grd}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400">
                  <tr>
                    <td colSpan={5} className="py-2.5 px-3 text-right uppercase text-[11px] border-r">
                      Consolidated Annual Aggregate & Result:
                    </td>
                    <td className="py-2.5 px-2 text-center text-teal-900 font-black border-r text-sm">
                      {displayTotal} / {totalMaxMarks}
                    </td>
                    <td className="py-2.5 px-2 text-center text-emerald-900 font-black text-sm">
                      {displayPercentage}% ({letterGrade.grade})
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Part 2: Co-Scholastic Activities & Life Skills */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide border-b pb-1">
                Part 2: Co-Scholastic & Life Skills Assessment (3-Point Grading Scale: A, B, C)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {CO_SCHOLASTIC_ACTIVITIES.map(c => (
                  <div key={c.activity} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">{c.activity}</span>
                      <span className="text-[10px] text-slate-500">{c.indicator}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-black text-xs">
                      Grade {c.grade}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Result Status, Remarks and Signatures */}
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 text-xs">
                  <span className="text-[10px] text-teal-800 font-bold uppercase block">Class Standing & Rank</span>
                  <span className="font-black text-teal-950 text-sm">Rank 1 • Top 2% of Batch</span>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">Final Result Status</span>
                  <span className="font-black text-emerald-950 text-sm">PROMOTED TO CLASS 11</span>
                </div>
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-xs">
                  <span className="text-[10px] text-purple-800 font-bold uppercase block">Next Term Reopens On</span>
                  <span className="font-black text-purple-950 text-sm">June 15, 2027</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block text-[11px] mb-0.5">Principal & Class Teacher Overall Remarks:</span>
                <p className="text-slate-800 italic font-medium leading-relaxed">
                  "{teacherRemarks || `${letterGrade.label} performance. Consistently exhibits commendable curiosity, analytical rigor, and peer leadership. Best wishes for upcoming higher secondary honors studies.`}"
                </p>
              </div>

              {/* Authorized Signatures & Seal */}
              <div className="grid grid-cols-3 gap-6 pt-10 text-center text-[11px] text-slate-600 font-bold border-t border-dashed border-slate-300">
                <div className="space-y-1">
                  <div className="h-6 font-script text-slate-800 italic">Sarah Jenkins</div>
                  <div className="border-t border-slate-400 pt-1">Class Teacher Signature</div>
                </div>
                <div className="space-y-1">
                  <div className="h-6 font-script text-slate-800 italic">Dr. K. Vance</div>
                  <div className="border-t border-slate-400 pt-1">Exam Controller</div>
                </div>
                <div className="space-y-1">
                  <div className="h-6 font-script text-teal-800 font-black uppercase text-[10px]">Official Institute Seal</div>
                  <div className="border-t border-slate-400 pt-1">Principal / Head of Institution</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official PDF Marksheet</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
