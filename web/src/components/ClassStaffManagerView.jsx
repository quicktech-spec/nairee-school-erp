import React, { useState, useEffect } from 'react';
import {
  School,
  Users,
  GraduationCap,
  UserCheck,
  UserPlus,
  ArrowRightLeft,
  Trash2,
  Edit3,
  CreditCard,
  IndianRupee,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  X,
  ChevronRight,
  BookOpen,
  Send,
  Building,
  Check,
  RefreshCw,
  Phone,
  Mail,
  Receipt
} from 'lucide-react';
import { getMasterStudents, saveMasterStudents, getMasterTeachers, transferStudentClass, subscribeLiveEvents, getStoredDb, saveStoredDb } from '../api.js';

function mapMasterToMgmtStudents(masterList) {
  return masterList.map((s, idx) => ({
    id: s.student_id || s.id || `STU-${String(idx + 1).padStart(3, '0')}`,
    name: s.name || s.student_name,
    roll_no: s.roll_no || `${101 + idx}`,
    class_id: s.batch_id || (s.class_batch?.includes('10B') || s.class_batch?.includes('Section B') ? 'CLS-10B' : 'CLS-10A'),
    class_name: s.class_batch || 'Class 10 - Section A',
    email: s.email || `${(s.name || s.student_name || 'student').toLowerCase().replace(/\s+/g, '')}@student.nairee.edu`,
    phone: s.phone || '+91 98765 00000',
    parent_name: s.father_name || s.mother_name || 'Parent',
    parent_phone: s.father_phone || s.mother_phone || s.phone || '+91 98765 00000',
    attendance: 96.5,
    fee_total: 43500,
    fee_paid: (s.fee_status === 'Paid' || s.fee_status === 'Cleared') ? 43500 : (s.fee_paid !== undefined ? s.fee_paid : (s.fee_status === 'Pending' ? 0 : 43500)),
    fee_due: (s.fee_status === 'Paid' || s.fee_status === 'Cleared') ? 0 : (s.fee_due !== undefined ? s.fee_due : (s.fee_status === 'Pending' ? 35000 : 0)),
    fee_status: s.fee_status || 'Paid'
  }));
}

function getClassesFromDb() {
  const db = getStoredDb();
  const rows = db['Class & Batch List']?.rows || [];
  return rows.map(b => ({
    id: b.batch_id,
    name: b.batch_name,
    grade: b.batch_name.split('-')[0]?.trim() || 'Class 10',
    section: b.batch_name.split('Section')[1]?.trim() || 'A',
    room: b.room_no || 'Room 204',
    class_teacher_id: b.class_teacher_id || 'TEA-001',
    class_teacher_name: b.class_teacher || 'Prof. Sarah Jenkins',
    capacity: Number(b.capacity) || 35,
    subjects: [
      { subject: 'Advanced Mathematics', teacher: 'Prof. Sarah Jenkins' },
      { subject: 'Physics & Dynamics', teacher: 'Dr. Evelyn Reed' },
      { subject: 'Computer Science & AI', teacher: 'Mr. Robert Chen' }
    ]
  }));
}

function getTeachersFromDb() {
  const masterT = getMasterTeachers();
  return masterT.map(t => ({
    id: t.teacher_number || t.id,
    name: t.name,
    department: t.department,
    email: t.email,
    phone: t.phone,
    base_salary: Number(t.monthly_salary) || 65000,
    bonus: 5000,
    deductions: 2500,
    salary_status: 'Paid',
    paid_date: '2026-09-30',
    assigned_classes: ['Class 10 - Section A']
  }));
}

export default function ClassStaffManagerView() {
  const [activeSubTab, setActiveSubTab] = useState('classes'); // 'classes' | 'students' | 'payroll'
  
  // Persistent State
  const [classes, setClasses] = useState(() => getClassesFromDb());
  const [teachers, setTeachers] = useState(() => getTeachersFromDb());
  const [students, setStudents] = useState(() => mapMasterToMgmtStudents(getMasterStudents()));

  const [selectedClassId, setSelectedClassId] = useState('CLS-10A');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(null); // student obj
  const [showAppointTeacherModal, setShowAppointTeacherModal] = useState(null); // class obj
  const [showCollectFeeModal, setShowCollectFeeModal] = useState(null); // student obj
  const [showSalaryModal, setShowSalaryModal] = useState(null); // teacher obj
  const [receiptData, setReceiptData] = useState(null);

  // Form States
  const [newClass, setNewClass] = useState({
    grade: 'Grade 10',
    section: 'C',
    room: 'Room 206',
    teacher_id: 'TEA-001',
    capacity: 35
  });

  const [newStudent, setNewStudent] = useState({
    name: '',
    roll_no: '',
    class_id: 'CLS-10A',
    email: '',
    phone: '',
    parent_name: '',
    parent_phone: '',
    fee_total: 43500,
    fee_paid: 43500
  });

  const [transferTargetClassId, setTransferTargetClassId] = useState('');
  const [feeCollectAmount, setFeeCollectAmount] = useState('');
  const [feePaymentMethod, setFeePaymentMethod] = useState('UPI / QR Code');
  const [salaryPaymentMethod, setSalaryPaymentMethod] = useState('Direct Bank Transfer (NEFT)');

  // Save to LocalStorage whenever state updates
  useEffect(() => {
    try {
      localStorage.setItem('nairee_mgmt_classes', JSON.stringify(classes));
      localStorage.setItem('nairee_mgmt_teachers', JSON.stringify(teachers));
      localStorage.setItem('nairee_mgmt_students', JSON.stringify(students));
    } catch (e) {
      console.error('Failed to persist manager state:', e);
    }
  }, [classes, teachers, students]);

  // Subscribe to live multi-tab & cross-component database sync events
  useEffect(() => {
    const unsub = subscribeLiveEvents((event) => {
      const freshMaster = getMasterStudents();
      if (freshMaster && freshMaster.length > 0) {
        setStudents(mapMasterToMgmtStudents(freshMaster));
      }
    });
    return () => unsub();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // --- Handlers: Classes & Appoint Teachers ---
  const handleCreateClass = (e) => {
    e.preventDefault();
    const classTeacher = teachers.find(t => t.id === newClass.teacher_id) || teachers[0];
    const className = `${newClass.grade} - Section ${newClass.section}`;
    const newClassObj = {
      id: `CLS-${newClass.grade.replace(/\D/g, '')}${newClass.section}`,
      name: className,
      grade: newClass.grade,
      section: newClass.section,
      room: newClass.room || 'Room 101',
      class_teacher_id: classTeacher.id,
      class_teacher_name: classTeacher.name,
      capacity: Number(newClass.capacity) || 35,
      subjects: [
        { subject: 'Mathematics', teacher: classTeacher.name },
        { subject: 'Science & Lab', teacher: 'Dr. Marcus Vance' }
      ]
    };

    setClasses(prev => [newClassObj, ...prev]);
    showToast(`Class "${className}" created with appointed teacher ${classTeacher.name}!`);
    setShowAddClassModal(false);
  };

  const handleAppointTeacher = (classObj, newTeacherId) => {
    const selectedTeacher = teachers.find(t => t.id === newTeacherId);
    if (!selectedTeacher) return;

    setClasses(prev => prev.map(c => {
      if (c.id === classObj.id) {
        return {
          ...c,
          class_teacher_id: selectedTeacher.id,
          class_teacher_name: selectedTeacher.name
        };
      }
      return c;
    }));

    showToast(`Appointed ${selectedTeacher.name} as Head Class Teacher for ${classObj.name}!`);
    setShowAppointTeacherModal(null);
  };

  const handleDeleteClass = (classId, className) => {
    if (!window.confirm(`Are you sure you want to delete class "${className}"? Students in this class will need reallocation.`)) {
      return;
    }
    setClasses(prev => prev.filter(c => c.id !== classId));
    showToast(`Class "${className}" deleted.`);
  };

  // --- Handlers: Student Roster, Transfer & Delete ---
  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.name.trim()) {
      alert('Please enter student name');
      return;
    }

    const targetClass = classes.find(c => c.id === newStudent.class_id) || classes[0];
    const total = Number(newStudent.fee_total) || 43500;
    const paid = Number(newStudent.fee_paid) || 0;
    const due = Math.max(0, total - paid);

    const newNum = students.length + 1;
    const studentObj = {
      id: `STU-${String(newNum).padStart(3, '0')}`,
      name: newStudent.name.trim(),
      roll_no: newStudent.roll_no.trim() || String(100 + newNum),
      class_id: targetClass.id,
      class_name: targetClass.name,
      email: newStudent.email || `${newStudent.name.toLowerCase().replace(/\s+/g, '')}@student.nairee.edu`,
      phone: newStudent.phone || '+91 98765 00000',
      parent_name: newStudent.parent_name || 'Parent / Guardian',
      parent_phone: newStudent.parent_phone || '+91 98765 00000',
      attendance: 100.0,
      fee_total: total,
      fee_paid: paid,
      fee_due: due,
      fee_status: due === 0 ? 'Paid' : 'Pending'
    };

    setStudents(prev => [studentObj, ...prev]);

    // Sync to Central Master Database
    const currentMaster = getMasterStudents();
    const newMasterRow = {
      student_id: studentObj.id,
      name: studentObj.name,
      roll_no: studentObj.roll_no.replace(/\D/g, '') || '108',
      class_batch: targetClass.name,
      batch_id: targetClass.id,
      phone: studentObj.phone,
      email: studentObj.email,
      father_name: studentObj.parent_name,
      father_phone: studentObj.parent_phone,
      fee_status: studentObj.fee_status,
      dob: '2011-01-01',
      gender: 'Male',
      religion: 'Hindu',
      nationality: 'Indian',
      blood_group: 'O+',
      stream: 'Computer Applications & Math'
    };
    saveMasterStudents([newMasterRow, ...currentMaster]);

    showToast(`Student "${studentObj.name}" added to ${targetClass.name}!`);
    setShowAddStudentModal(false);
    setNewStudent({
      name: '',
      roll_no: '',
      class_id: selectedClassId,
      email: '',
      phone: '',
      parent_name: '',
      parent_phone: '',
      fee_total: 43500,
      fee_paid: 43500
    });
  };

  const handleTransferSection = () => {
    if (!showTransferModal || !transferTargetClassId) return;
    const targetClass = classes.find(c => c.id === transferTargetClassId);
    if (!targetClass) return;

    const studentIdentifier = showTransferModal.id || showTransferModal.name;
    // Central database transfer & broadcast
    transferStudentClass(studentIdentifier, targetClass.id, targetClass.name);

    setStudents(prev => prev.map(s => {
      if (s.id === showTransferModal.id || s.name === showTransferModal.name) {
        return {
          ...s,
          class_id: targetClass.id,
          class_name: targetClass.name,
          roll_no: `${targetClass.section}-${(s.roll_no || '').split('-')[1] || '01'}`
        };
      }
      return s;
    }));

    showToast(`Transferred ${showTransferModal.name} to ${targetClass.name} successfully!`);
    setShowTransferModal(null);
  };

  const handleDeleteStudent = (student) => {
    if (!window.confirm(`Are you sure you want to delete student "${student.name}" (Roll No: ${student.roll_no}) from the school roster?`)) {
      return;
    }
    setStudents(prev => prev.filter(s => s.id !== student.id && s.name !== student.name));
    const currentMaster = getMasterStudents();
    const updatedMaster = currentMaster.filter(s => (s.student_id || s.id) !== student.id && (s.name || s.student_name) !== student.name);
    saveMasterStudents(updatedMaster);
    showToast(`Removed student "${student.name}" from class.`);
  };

  // --- Handlers: Fee Collection ---
  const handleCollectFee = (e) => {
    e.preventDefault();
    if (!showCollectFeeModal) return;
    const amount = Number(feeCollectAmount) || showCollectFeeModal.fee_due;

    setStudents(prev => prev.map(s => {
      if (s.id === showCollectFeeModal.id) {
        const newPaid = s.fee_paid + amount;
        const newDue = Math.max(0, s.fee_total - newPaid);
        return {
          ...s,
          fee_paid: newPaid,
          fee_due: newDue,
          fee_status: newDue === 0 ? 'Paid' : 'Pending'
        };
      }
      return s;
    }));

    const receipt = {
      receipt_no: `REC-${Date.now().toString().slice(-6)}`,
      student_name: showCollectFeeModal.name,
      roll_no: showCollectFeeModal.roll_no,
      class_name: showCollectFeeModal.class_name,
      amount_paid: amount,
      payment_method: feePaymentMethod,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setReceiptData(receipt);
    setShowCollectFeeModal(null);
    showToast(`Fee payment of ₹${amount.toLocaleString()} recorded for ${showCollectFeeModal.name}! Receipt generated.`);
  };

  // --- Handlers: Teacher Salary Disbursal ---
  const handleDisburseSalary = (teacher) => {
    const netPay = teacher.base_salary + teacher.bonus - teacher.deductions;
    setTeachers(prev => prev.map(t => {
      if (t.id === teacher.id) {
        return {
          ...t,
          salary_status: 'Paid',
          paid_date: new Date().toISOString().split('T')[0]
        };
      }
      return t;
    }));

    const payslip = {
      payslip_no: `PAY-${Date.now().toString().slice(-6)}`,
      teacher_name: teacher.name,
      department: teacher.department,
      base_salary: teacher.base_salary,
      bonus: teacher.bonus,
      deductions: teacher.deductions,
      net_salary: netPay,
      method: salaryPaymentMethod,
      disbursal_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setReceiptData(payslip);
    setShowSalaryModal(null);
    showToast(`Monthly salary of ₹${netPay.toLocaleString()} disbursed to ${teacher.name}! Official payslip generated.`);
  };

  // Filtered Students
  const displayedStudents = students.filter(s => {
    const matchesClass = selectedClassId === 'all' || s.class_id === selectedClassId;
    const matchesSearch = searchQuery === '' || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.roll_no.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const totalFeesInSelectedClass = displayedStudents.reduce((acc, s) => acc + s.fee_total, 0);
  const totalCollectedInSelectedClass = displayedStudents.reduce((acc, s) => acc + s.fee_paid, 0);
  const totalDueInSelectedClass = displayedStudents.reduce((acc, s) => acc + s.fee_due, 0);

  const totalPayroll = teachers.reduce((acc, t) => acc + (t.base_salary + t.bonus - t.deductions), 0);
  const totalPaidPayroll = teachers.filter(t => t.salary_status === 'Paid').reduce((acc, t) => acc + (t.base_salary + t.bonus - t.deductions), 0);
  const totalPendingPayroll = totalPayroll - totalPaidPayroll;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c1f2c] border border-teal-500/60 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#00a884] via-[#009172] to-[#3b65bf] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-100 mb-1">
            <School className="w-4 h-4" />
            <span className="uppercase tracking-wider">Administrative Operations Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Class, Student Roster & Payroll Manager</span>
          </h1>
          <p className="text-xs text-emerald-50 mt-1 max-w-2xl">
            Create classes, appoint head & subject teachers, transfer students between sections, collect term fees, and disburse faculty salaries.
          </p>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl backdrop-blur-md">
          <button
            onClick={() => setActiveSubTab('classes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'classes' ? 'bg-white text-teal-900 shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            <School className="w-4 h-4" />
            <span>Classes & Staff ({classes.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'students' ? 'bg-white text-teal-900 shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Roster & Fees ({students.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('payroll')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'payroll' ? 'bg-white text-teal-900 shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Teacher Payroll</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: CLASSES & APPOINTED TEACHERS */}
      {activeSubTab === 'classes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Active Classes & Appointed Faculty</h3>
              <p className="text-xs text-slate-500">Overview of all active classrooms, appointed class teachers, and subject instructors.</p>
            </div>

            <button
              onClick={() => setShowAddClassModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#00a884] hover:bg-[#009172] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#00a884]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Class / Section</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map(cls => {
              const classStudents = students.filter(s => s.class_id === cls.id);
              const totalDue = classStudents.reduce((acc, s) => acc + s.fee_due, 0);

              return (
                <div key={cls.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                        {cls.room}
                      </span>
                      <h4 className="text-lg font-black text-slate-900 mt-1.5">{cls.name}</h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setShowAppointTeacherModal(cls)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
                        title="Change Appointed Teacher"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id, cls.name)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600"
                        title="Delete Class"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Appointed Head Class Teacher */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Appointed Class Teacher
                    </span>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                          {cls.class_teacher_name?.charAt(0)}
                        </div>
                        <span className="text-xs font-black text-slate-800">{cls.class_teacher_name}</span>
                      </div>
                      <button
                        onClick={() => setShowAppointTeacherModal(cls)}
                        className="text-[11px] font-bold text-teal-700 hover:underline"
                      >
                        Reappoint
                      </button>
                    </div>
                  </div>

                  {/* Subject Teachers */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Subject Faculty
                    </span>
                    <div className="space-y-1 text-xs">
                      {cls.subjects?.map((sub, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600 py-0.5">
                          <span className="font-semibold">{sub.subject}</span>
                          <span className="text-slate-500">{sub.teacher}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Class Stats & Quick Navigation */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400">Enrolled: </span>
                      <span className="font-black text-slate-800">{classStudents.length} / {cls.capacity}</span>
                    </div>
                    {totalDue > 0 ? (
                      <span className="text-[11px] font-bold text-amber-600">₹{totalDue.toLocaleString()} Due</span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600">All Fees Paid</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      setActiveSubTab('students');
                    }}
                    className="w-full py-2.5 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>Manage Roster & Fees ({classStudents.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: STUDENT ROSTER, SECTION TRANSFERS & FEE COLLECTION */}
      {activeSubTab === 'students' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Filter Class:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="px-3.5 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="all">All Classes & Sections ({students.length})</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({students.filter(s => s.class_id === c.id).length} Students)</option>
                  ))}
                </select>

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search student or roll no..."
                    className="pl-8 pr-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 w-48 sm:w-64"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <button
                onClick={() => setShowAddStudentModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-[#00a884] hover:bg-[#009172] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#00a884]/20 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Student to Class</span>
              </button>
            </div>

            {/* Class Financial Snapshot Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Class Tuition Value:</span>
                <span className="font-black text-slate-800">₹{totalFeesInSelectedClass.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-between border border-emerald-200/60">
                <span className="font-medium">Total Fees Collected:</span>
                <span className="font-black">₹{totalCollectedInSelectedClass.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-between border border-amber-200/60">
                <span className="font-medium">Outstanding Dues:</span>
                <span className="font-black">₹{totalDueInSelectedClass.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm overflow-hidden space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-sm font-black text-slate-900">
                Enrolled Students ({displayedStudents.length})
              </h4>
              <span className="text-xs text-slate-400">Click actions to transfer section or record fee payment</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Roll No</th>
                    <th className="py-3 px-3">Student & Contact</th>
                    <th className="py-3 px-3">Section</th>
                    <th className="py-3 px-3">Attendance</th>
                    <th className="py-3 px-3">Fee Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {displayedStudents.map((stu) => (
                    <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-mono font-bold text-[11px]">
                          {stu.roll_no}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div>
                          <p className="font-bold text-slate-900">{stu.name}</p>
                          <p className="text-[11px] text-slate-400">{stu.email} • {stu.phone}</p>
                          <p className="text-[10px] text-slate-500">Parent: {stu.parent_name} ({stu.parent_phone})</p>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-bold text-[11px] border border-teal-200">
                          {stu.class_name}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-bold ${stu.attendance >= 95 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {stu.attendance}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {stu.fee_status === 'Paid' ? (
                          <div className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Paid in Full</span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-amber-600 font-bold text-[11px] block">
                              ₹{stu.fee_due.toLocaleString()} Due
                            </span>
                            <button
                              onClick={() => {
                                setShowCollectFeeModal(stu);
                                setFeeCollectAmount(String(stu.fee_due));
                              }}
                              className="text-[10px] font-black text-teal-700 hover:underline"
                            >
                              + Collect Now
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Transfer Section Button */}
                          <button
                            onClick={() => {
                              setShowTransferModal(stu);
                              setTransferTargetClassId(classes.find(c => c.id !== stu.class_id)?.id || '');
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Transfer / Change Student Section"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>Transfer</span>
                          </button>

                          {/* Delete Student Button */}
                          <button
                            onClick={() => handleDeleteStudent(stu)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                            title="Delete Student Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* SUBTAB 3: TEACHER SALARY MANAGEMENT & PAYROLL DISBURSAL */}
      {activeSubTab === 'payroll' && (
        <div className="space-y-6">
          {/* Payroll Overview Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500">Monthly Faculty Payroll</span>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">₹{totalPayroll.toLocaleString()}</p>
                <span className="text-[11px] text-slate-400">Total Staff: {teachers.length} Faculty Members</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500">Disbursed This Month</span>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">₹{totalPaidPayroll.toLocaleString()}</p>
                <span className="text-[11px] text-emerald-600 font-bold">
                  {teachers.filter(t => t.salary_status === 'Paid').length} of {teachers.length} Staff Paid
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500">Pending Salary Disbursal</span>
                <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">₹{totalPendingPayroll.toLocaleString()}</p>
                <span className="text-[11px] text-amber-600 font-bold">
                  {teachers.filter(t => t.salary_status === 'Pending').length} Pending Approval
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Teacher Salary Disbursal Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Faculty Payroll & Salary Sheet</h3>
                <p className="text-xs text-slate-400">Click "Disburse Salary" to release payments and generate digital salary payslips.</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Teacher & Department</th>
                    <th className="py-3 px-3">Assigned Classes</th>
                    <th className="py-3 px-3">Base Pay</th>
                    <th className="py-3 px-3">Bonus / Allowances</th>
                    <th className="py-3 px-3">Deductions</th>
                    <th className="py-3 px-3 font-black">Net Salary</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {teachers.map(teacher => {
                    const netSalary = teacher.base_salary + teacher.bonus - teacher.deductions;
                    const isPaid = teacher.salary_status === 'Paid';

                    return (
                      <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white font-bold text-xs flex items-center justify-center">
                              {teacher.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{teacher.name}</p>
                              <p className="text-[11px] text-slate-400">{teacher.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex flex-wrap gap-1">
                            {teacher.assigned_classes?.map((c, i) => (
                              <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-mono">₹{teacher.base_salary.toLocaleString()}</td>
                        <td className="py-3.5 px-3 font-mono text-emerald-600">+₹{teacher.bonus.toLocaleString()}</td>
                        <td className="py-3.5 px-3 font-mono text-rose-500">-₹{teacher.deductions.toLocaleString()}</td>
                        <td className="py-3.5 px-3 font-mono font-black text-slate-900 text-sm">
                          ₹{netSalary.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3">
                          {isPaid ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Paid ({teacher.paid_date || 'Today'})</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1 w-max">
                              <Clock className="w-3 h-3" />
                              <span>Pending Disbursal</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {isPaid ? (
                            <button
                              onClick={() => {
                                setReceiptData({
                                  payslip_no: `PAY-${Date.now().toString().slice(-6)}`,
                                  teacher_name: teacher.name,
                                  department: teacher.department,
                                  base_salary: teacher.base_salary,
                                  bonus: teacher.bonus,
                                  deductions: teacher.deductions,
                                  net_salary: netSalary,
                                  method: 'Direct Bank Transfer',
                                  disbursal_date: teacher.paid_date || 'Oct 2026'
                                });
                              }}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Payslip</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setShowSalaryModal(teacher)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 ml-auto cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay Salary</span>
                            </button>
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

      {/* MODAL 1: ADD NEW CLASS */}
      {showAddClassModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddClassModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Add New Class & Section</h3>
                  <p className="text-xs text-slate-400">Assign classroom and appoint head teacher</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddClassModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Grade Level</label>
                <select
                  value={newClass.grade}
                  onChange={(e) => setNewClass({ ...newClass, grade: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                >
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    required
                    value={newClass.section}
                    onChange={(e) => setNewClass({ ...newClass, section: e.target.value.toUpperCase() })}
                    placeholder="e.g. A, B, C"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room No.</label>
                  <input
                    type="text"
                    required
                    value={newClass.room}
                    onChange={(e) => setNewClass({ ...newClass, room: e.target.value })}
                    placeholder="e.g. Room 206"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Appoint Head Class Teacher</label>
                <select
                  value={newClass.teacher_id}
                  onChange={(e) => setNewClass({ ...newClass, teacher_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00a884] hover:bg-[#009172] text-white font-bold shadow-md shadow-teal-500/20"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD STUDENT TO CLASS */}
      {showAddStudentModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddStudentModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Enroll New Student</h3>
                  <p className="text-xs text-slate-400">Assign to class section and configure term fees</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    placeholder="e.g. Siddharth Verma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={newStudent.roll_no}
                    onChange={(e) => setNewStudent({ ...newStudent, roll_no: e.target.value })}
                    placeholder="e.g. 10A-08"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign Class & Section</label>
                <select
                  value={newStudent.class_id}
                  onChange={(e) => setNewStudent({ ...newStudent, class_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.room})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Email</label>
                  <input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="student@nairee.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Phone</label>
                  <input
                    type="text"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">Parent Details & Term Fee</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Parent Name</label>
                    <input
                      type="text"
                      value={newStudent.parent_name}
                      onChange={(e) => setNewStudent({ ...newStudent, parent_name: e.target.value })}
                      placeholder="e.g. Ramesh Verma"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Parent Mobile</label>
                    <input
                      type="text"
                      value={newStudent.parent_phone}
                      onChange={(e) => setNewStudent({ ...newStudent, parent_phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Total Fee (₹)</label>
                    <input
                      type="number"
                      value={newStudent.fee_total}
                      onChange={(e) => setNewStudent({ ...newStudent, fee_total: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Initial Paid (₹)</label>
                    <input
                      type="number"
                      value={newStudent.fee_paid}
                      onChange={(e) => setNewStudent({ ...newStudent, fee_paid: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00a884] hover:bg-[#009172] text-white font-bold shadow-md shadow-teal-500/20"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TRANSFER STUDENT SECTION */}
      {showTransferModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowTransferModal(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Transfer Student Section</h3>
                  <p className="text-xs text-slate-400">Reallocate student to another class</p>
                </div>
              </div>
              <button
                onClick={() => setShowTransferModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1 text-xs text-slate-600">
              <p><b>Student:</b> {showTransferModal.name} (Roll No: {showTransferModal.roll_no})</p>
              <p><b>Current Class:</b> {showTransferModal.class_name}</p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700">Select New Class / Section</label>
              <select
                value={transferTargetClassId}
                onChange={(e) => setTransferTargetClassId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-xs"
              >
                {classes.filter(c => c.id !== showTransferModal.class_id).map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.room}) | Teacher: {c.class_teacher_name}</option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setShowTransferModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferSection}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: APPOINT HEAD TEACHER */}
      {showAppointTeacherModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowAppointTeacherModal(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Appoint Class Teacher</h3>
                  <p className="text-xs text-slate-400">Assign head teacher for {showAppointTeacherModal.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAppointTeacherModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700">Select Faculty Member</label>
              {teachers.map(teacher => (
                <div
                  key={teacher.id}
                  onClick={() => handleAppointTeacher(showAppointTeacherModal, teacher.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    showAppointTeacherModal.class_teacher_id === teacher.id
                      ? 'bg-teal-50 border-teal-300 text-teal-900'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-700 text-white font-bold flex items-center justify-center text-xs">
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold">{teacher.name}</p>
                      <p className="text-[11px] text-slate-500">{teacher.department}</p>
                    </div>
                  </div>
                  {showAppointTeacherModal.class_teacher_id === teacher.id && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-600 text-white">Current</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: COLLECT STUDENT FEE */}
      {showCollectFeeModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowCollectFeeModal(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Record Fee Collection</h3>
                  <p className="text-xs text-slate-400">Collect term fee for {showCollectFeeModal.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCollectFeeModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectFee} className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
                <p><b>Student:</b> {showCollectFeeModal.name} ({showCollectFeeModal.roll_no})</p>
                <p><b>Total Fee:</b> ₹{showCollectFeeModal.fee_total.toLocaleString()} | <b>Outstanding Due:</b> ₹{showCollectFeeModal.fee_due.toLocaleString()}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Collection Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={feeCollectAmount}
                  onChange={(e) => setFeeCollectAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-base font-black text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={feePaymentMethod}
                  onChange={(e) => setFeePaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                >
                  <option value="UPI / QR Code">UPI / QR Code</option>
                  <option value="Cash at Fee Counter">Cash at Fee Counter</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                  <option value="Net Banking / NEFT">Net Banking / NEFT</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCollectFeeModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00a884] hover:bg-[#009172] text-white font-bold shadow-md shadow-teal-500/20"
                >
                  Record Payment & Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: DISBURSE TEACHER SALARY */}
      {showSalaryModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowSalaryModal(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Disburse Monthly Faculty Salary</h3>
                  <p className="text-xs text-slate-400">Release payroll for {showSalaryModal.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSalaryModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Base Salary:</span>
                <span className="font-mono font-bold">₹{showSalaryModal.base_salary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Performance Bonus:</span>
                <span className="font-mono font-bold">+₹{showSalaryModal.bonus.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-500">
                <span>Tax & Deductions:</span>
                <span className="font-mono font-bold">-₹{showSalaryModal.deductions.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                <span>Net Disbursal:</span>
                <span>₹{(showSalaryModal.base_salary + showSalaryModal.bonus - showSalaryModal.deductions).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700">Payment Gateway / Disbursal Method</label>
              <select
                value={salaryPaymentMethod}
                onChange={(e) => setSalaryPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
              >
                <option value="Direct Bank Transfer (NEFT)">Direct Bank Transfer (NEFT)</option>
                <option value="Direct Deposit / Wire">Direct Deposit / Wire</option>
                <option value="Official School Cheque">Official School Cheque</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setShowSalaryModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDisburseSalary(showSalaryModal)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20"
              >
                Approve & Pay Salary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: OFFICIAL RECEIPT / PAYSLIP MODAL */}
      {receiptData && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setReceiptData(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center font-bold">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Official Nairee School Document
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {receiptData.receipt_no ? 'Fee Collection Receipt' : 'Monthly Salary Payslip'}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Ref ID: {receiptData.receipt_no || receiptData.payslip_no}
              </p>
            </div>

            <div className="text-left bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              {receiptData.student_name ? (
                <>
                  <div className="flex justify-between"><span className="text-slate-500">Student:</span><span className="font-bold text-slate-900">{receiptData.student_name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Roll No & Class:</span><span className="font-bold text-slate-900">{receiptData.roll_no} • {receiptData.class_name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Amount Paid:</span><span className="font-black text-emerald-600">₹{receiptData.amount_paid.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Payment Mode:</span><span className="font-bold text-slate-900">{receiptData.payment_method}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Date:</span><span className="font-bold text-slate-900">{receiptData.date}</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between"><span className="text-slate-500">Teacher:</span><span className="font-bold text-slate-900">{receiptData.teacher_name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Department:</span><span className="font-bold text-slate-900">{receiptData.department}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Net Disbursed:</span><span className="font-black text-emerald-600">₹{receiptData.net_salary.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Disbursal Method:</span><span className="font-bold text-slate-900">{receiptData.method}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Period:</span><span className="font-bold text-slate-900">{receiptData.disbursal_date}</span></div>
                </>
              )}
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Download PDF</span>
              </button>
              <button
                onClick={() => setReceiptData(null)}
                className="px-5 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#009172] text-white font-bold text-xs shadow-md shadow-teal-500/20 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
