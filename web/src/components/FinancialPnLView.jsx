import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  PieChart,
  Calendar,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Percent,
  Sparkles,
  Zap,
  Printer,
  ChevronRight,
  Filter,
  X,
  UserCheck,
  Receipt
} from 'lucide-react';
import { FALLBACK_FACULTY, FALLBACK_STUDENTS } from '../fallbackData.js';
import { api, subscribeLiveEvents } from '../api.js';

export default function FinancialPnLView() {
  // Reactive Student Fee Records State
  const [studentRecords, setStudentRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('nairee_fallback_students');
      return saved ? JSON.parse(saved) : FALLBACK_STUDENTS;
    } catch {
      return FALLBACK_STUDENTS;
    }
  });

  // Base constants in Indian Rupees (₹)
  const tuitionPerStudent = 35000;
  const labTechFees = 45000;
  const transportFees = 60000;

  // Faculty Payroll calculation
  const totalSalaries = FALLBACK_FACULTY.reduce((acc, f) => acc + (f.salary || 65000), 0);
  const termPayrollDisbursed = 185000;

  // Operational Expenses State in INR
  const [expenses, setExpenses] = useState([
    { id: 'EXP 001', category: 'Teacher Payroll', description: 'Term 1 Faculty & Staff Disbursal', amount: termPayrollDisbursed, date: '2026-09-28', status: 'Paid', type: 'operational' },
    { id: 'EXP 002', category: 'Campus Lease & Rent', description: 'Academic Block A & B Lease', amount: 48000, date: '2026-09-01', status: 'Paid', type: 'operational' },
    { id: 'EXP 003', category: 'Utilities & Power', description: 'Electricity, High Speed Fiber & Water Bill', amount: 14500, date: '2026-10-02', status: 'Pending', type: 'operational' },
    { id: 'EXP 004', category: 'Annual Function 2026', description: 'Auditorium Lighting, Sound & Stage Decor', amount: 18500, date: '2026-10-03', status: 'Pending', type: 'event' },
    { id: 'EXP 005', category: 'Sports Day Meet', description: 'Medals, Track Equipment & Refreshments', amount: 9200, date: '2026-10-04', status: 'Pending', type: 'event' },
    { id: 'EXP 006', category: 'STEM Lab Upgrades', description: 'Robotics Sensors & Microcontroller Kits', amount: 12000, date: '2026-09-25', status: 'Paid', type: 'facility' }
  ]);

  const [selectedExpenseIds, setSelectedExpenseIds] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [feeSearch, setFeeSearch] = useState('');
  const [feeStatusFilter, setFeeStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [newExp, setNewExp] = useState({
    category: 'Annual Function',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'event'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Listen to live fee updates across all portals
  useEffect(() => {
    const unsubscribe = subscribeLiveEvents((event) => {
      if (event.type === 'fee_updated') {
        try {
          const saved = localStorage.getItem('nairee_fallback_students');
          if (saved) setStudentRecords(JSON.parse(saved));
        } catch {}
      }
    });
    return () => unsubscribe();
  }, []);

  // Dynamic Financial Calculations directly connected to student fee records
  const totalStudents = studentRecords.length;
  const totalPendingTuition = studentRecords.reduce((sum, s) => sum + (Number(s.feeDues) || 0), 0);
  const totalPotentialTuition = totalStudents * tuitionPerStudent;
  const collectedTuition = totalPotentialTuition - totalPendingTuition;
  const grossRevenue = collectedTuition + labTechFees + transportFees;

  const pendingExpenses = expenses.filter(e => e.status === 'Pending');
  const selectedPendingExpenses = pendingExpenses.filter(e => selectedExpenseIds.includes(e.id));
  const selectedTotalAmount = selectedPendingExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalPaidExpenses = expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + Number(e.amount), 0);
  const totalPendingExpenses = pendingExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  
  // Net Institution Profit = Gross Collected Revenue - Paid Expenses
  const netProfit = grossRevenue - totalPaidExpenses;
  const marginPct = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : '0.0';

  // Settle single student fee
  const handleCollectStudentFee = async (student) => {
    const amount = Number(student.feeDues) > 0 ? Number(student.feeDues) : tuitionPerStudent;
    await api.settleStudentFee(student.name, amount);
    
    // Update local reactive state
    setStudentRecords(prev => prev.map(s => 
      s.name === student.name ? { ...s, feeDues: 0, fee_status: 'Paid' } : s
    ));
    showToast(`🎉 Fee payment of ₹${amount.toLocaleString('en-IN')} received for ${student.student_name}! Gross Revenue & Net Profit increased.`);
  };

  // 1-Click Collect All Pending Student Fees
  const handleCollectAllStudentFees = async () => {
    const pendingStudents = studentRecords.filter(s => Number(s.feeDues) > 0);
    if (pendingStudents.length === 0) return;

    const totalCollected = pendingStudents.reduce((sum, s) => sum + Number(s.feeDues), 0);
    for (const s of pendingStudents) {
      await api.settleStudentFee(s.name, Number(s.feeDues));
    }

    setStudentRecords(prev => prev.map(s => ({ ...s, feeDues: 0, fee_status: 'Paid' })));
    showToast(`🎉 1-Click Fee Collection: Received ₹${totalCollected.toLocaleString('en-IN')} across ${pendingStudents.length} students! Revenue & Profit fully updated.`);
  };

  const handleToggleSelect = (id) => {
    setSelectedExpenseIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedExpenseIds.length === pendingExpenses.length) {
      setSelectedExpenseIds([]);
    } else {
      setSelectedExpenseIds(pendingExpenses.map(e => e.id));
    }
  };

  const handlePayIndividual = (id) => {
    const target = expenses.find(e => e.id === id);
    if (!target) return;
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'Paid', date: new Date().toISOString().split('T')[0] } : e));
    setSelectedExpenseIds(prev => prev.filter(x => x !== id));
    showToast(`Expense ${id} (${target.category} • ₹${Number(target.amount).toLocaleString('en-IN')}) settled successfully!`);
  };

  const handlePayAllSelected = () => {
    if (selectedExpenseIds.length === 0) return;
    const count = selectedExpenseIds.length;
    const total = selectedTotalAmount;
    setExpenses(prev => prev.map(e => selectedExpenseIds.includes(e.id) ? { ...e, status: 'Paid', date: new Date().toISOString().split('T')[0] } : e));
    setSelectedExpenseIds([]);
    showToast(`🎉 1-Click Pay All: Settled ${count} pending expenses (₹${total.toLocaleString('en-IN')})!`);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExp.amount || !newExp.description) return;
    const added = {
      id: `EXP 00${expenses.length + 1}`,
      category: newExp.category,
      description: newExp.description,
      amount: parseFloat(newExp.amount),
      date: newExp.date,
      status: 'Pending',
      type: newExp.type
    };
    setExpenses([added, ...expenses]);
    setShowAddModal(false);
    showToast(`Logged new pending expense for ${newExp.category} (₹${Number(newExp.amount).toLocaleString('en-IN')})`);
    setNewExp({
      category: 'Annual Function',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      type: 'event'
    });
  };

  const filteredExpenses = expenses.filter(e => {
    if (filterType === 'all') return true;
    return e.type === filterType;
  });

  const filteredStudentFees = studentRecords.filter(s => {
    const matchesSearch = !feeSearch || 
      s.student_name?.toLowerCase().includes(feeSearch.toLowerCase()) ||
      s.name?.toLowerCase().includes(feeSearch.toLowerCase()) ||
      s.student_batch?.toLowerCase().includes(feeSearch.toLowerCase());
    const isPending = Number(s.feeDues) > 0 || s.fee_status === 'Pending';
    if (feeStatusFilter === 'pending') return matchesSearch && isPending;
    if (feeStatusFilter === 'paid') return matchesSearch && !isPending;
    return matchesSearch;
  });

  const pendingStudentsCount = studentRecords.filter(s => Number(s.feeDues) > 0 || s.fee_status === 'Pending').length;

  const exportCSV = () => {
    let csv = "ID,Category,Description,Amount (₹),Date,Status,Type\n";
    expenses.forEach(e => {
      csv += `${e.id},"${e.category}","${e.description}",${e.amount},${e.date},${e.status},${e.type}\n`;
    });
    csv += `\nTotal Gross Revenue,₹${grossRevenue}\n`;
    csv += `Total Expenses,₹${totalExpenses}\n`;
    csv += `Net Profit,₹${netProfit}\n`;
    csv += `Profit Margin,${marginPct}%\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nairee_Financial_PL_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast("Financial P&L Report exported successfully!");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c1f2c] border border-teal-500/60 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* TOP EXECUTIVE HERO BANNER */}
      <div className="bg-gradient-to-r from-[#0c1f2c] via-[#112a3a] to-[#0c1f2c] rounded-3xl p-6 sm:p-8 border border-teal-800/40 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-teal-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="uppercase tracking-wider">Fee Governance & Institutional Profit & Loss</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Financial P&L and Fee Governance</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-normal">
                ● Live Real-Time Sync
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Centralized financial overview linking student fee collections directly to gross revenue, operational disbursements, and institutional net surplus.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-[#00a884] hover:bg-[#009272] text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Log Outflow</span>
            </button>
            <button
              onClick={exportCSV}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export P&L</span>
            </button>
          </div>
        </div>

        {/* Highlight KPI Grid inside Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Gross Revenue (Collected)</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
              ₹{grossRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
              <span>Tuition (₹{collectedTuition.toLocaleString('en-IN')}) + Labs + Bus</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Operational Expenses</span>
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-400 mt-2 font-mono">
              ₹{totalPaidExpenses.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Payroll (₹{termPayrollDisbursed.toLocaleString('en-IN')}) + Rent + Events
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Net Institution Profit</span>
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-2xl font-black mt-2 font-mono ${netProfit >= 0 ? 'text-teal-300' : 'text-rose-400'}`}>
              ₹{netProfit.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-teal-400 mt-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{netProfit >= 0 ? 'Positive Operating Surplus' : 'Deficit Outflow'}</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Profit Margin</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-300 mt-2 font-mono">
              {marginPct}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Outstanding Dues: ₹{totalPendingTuition.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: DEDICATED STUDENT FEE GOVERNANCE & RECEIVABLES TABLE */}
      <div className="bg-white rounded-3xl border border-teal-100 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Student Fee Governance & Tuition Receivables</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                pendingStudentsCount > 0 
                  ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {pendingStudentsCount > 0 ? `${pendingStudentsCount} Pending Students` : 'All Fees Collected (100%)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Every fee collected directly increases institutional Gross Revenue and Net Profit across all connected portals.
            </p>
          </div>

          {/* Search, Filter & 1-Click Collect All */}
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              placeholder="Search student or roll..."
              value={feeSearch}
              onChange={(e) => setFeeSearch(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-teal-500 w-44"
            />
            <select
              value={feeStatusFilter}
              onChange={(e) => setFeeStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Students ({studentRecords.length})</option>
              <option value="pending">Pending Dues Only ({pendingStudentsCount})</option>
              <option value="paid">Fully Paid ({studentRecords.length - pendingStudentsCount})</option>
            </select>

            {pendingStudentsCount > 0 && (
              <button
                onClick={handleCollectAllStudentFees}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>1-Click Collect All ({pendingStudentsCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Student Fee Ledger Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Roll Number</th>
                <th className="py-3.5 px-4">Class & Batch</th>
                <th className="py-3.5 px-4">Term Total Fee</th>
                <th className="py-3.5 px-4">Pending Due</th>
                <th className="py-3.5 px-4">Fee Status</th>
                <th className="py-3.5 px-4 text-center">Settlement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudentFees.map((s) => {
                const isPending = Number(s.feeDues) > 0 || s.fee_status === 'Pending';
                const dueAmount = Number(s.feeDues) > 0 ? Number(s.feeDues) : (isPending ? tuitionPerStudent : 0);
                return (
                  <tr key={s.name} className={`transition-colors ${isPending ? 'bg-amber-50/20 hover:bg-amber-50/40' : 'hover:bg-slate-50/60'}`}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-black text-xs flex items-center justify-center">
                          {s.student_name?.[0] || 'S'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900">{s.student_name}</span>
                          <div className="text-[10px] text-slate-400">{s.guardian_name || 'Parent on Record'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{s.roll_no || s.roll_number || s.name}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{s.student_batch || 'Grade 10 Section A'}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">₹{tuitionPerStudent.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {isPending ? (
                        <span className="text-rose-600 font-black">₹{dueAmount.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">₹0 (Cleared)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                          <span>Pending</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Paid & Verified</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isPending ? (
                        <button
                          onClick={() => handleCollectStudentFee(s)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 mx-auto cursor-pointer active:scale-95"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Receive Payment</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Receipt Generated</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: BREAKDOWN CARDS & VISUAL ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Breakdown */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-teal-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Income & Revenue Channels</h3>
                <p className="text-[11px] text-slate-400">Total institutional collections for Academic Year 2026</p>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-mono">
              ₹{grossRevenue.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Student Tuition & Enrollment Fees</span>
                <span>₹{collectedTuition.toLocaleString('en-IN')} ({((collectedTuition / grossRevenue) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${((collectedTuition / grossRevenue) * 100).toFixed(1)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>North City Transport & Bus Fleet Subscriptions</span>
                <span>₹{transportFees.toLocaleString('en-IN')} ({((transportFees / grossRevenue) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" style={{ width: `${((transportFees / grossRevenue) * 100).toFixed(1)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Science, Robotics & Smart Classroom Lab Fees</span>
                <span>₹{labTechFees.toLocaleString('en-IN')} ({((labTechFees / grossRevenue) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${((labTechFees / grossRevenue) * 100).toFixed(1)}%` }} />
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Online Payment Gateway Sync: Active (Razorpay & UPI & Bank NEFT)</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 font-bold">100% Verified</span>
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-teal-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Institutional Cost Outflows</h3>
                <p className="text-[11px] text-slate-400">Payroll, maintenance, campus lease & functions</p>
              </div>
            </div>
            <span className="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full font-mono">
              ₹{totalPaidExpenses.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Faculty Salaries & Staff Remuneration</span>
                <span>₹{termPayrollDisbursed.toLocaleString('en-IN')} (69.9%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full" style={{ width: '69.9%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Campus Building Lease & Ground Rent</span>
                <span>₹48,000 (15.6%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full" style={{ width: '15.6%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Annual Function, Sports Day & Facility Upgrades</span>
                <span>₹44,200 (14.5%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: '14.5%' }} />
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-700 font-semibold">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>Campus Rent Lease Lock: Verified till Dec 2028</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 font-bold">Auto-Debited</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: DETAILED EXPENSE LEDGER & SETTLEMENT HUB */}
      <div className="bg-white rounded-3xl border border-teal-100 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <TrendingDown className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Institutional Expense & Disbursement Hub</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                {pendingExpenses.length} Pending Approval
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage operational bills, teacher salaries, event costs with 1-Click bulk settlement or individual payments.
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="all">All Outflows</option>
              <option value="operational">Operational & Payroll</option>
              <option value="event">School Events (Annual Day, Sports)</option>
              <option value="facility">Facility & Lab Upgrades</option>
            </select>
          </div>
        </div>

        {/* 1-CLICK BULK PAY DISBURSEMENTS */}
        {pendingExpenses.length > 0 && (
          <div className="bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-emerald-500/10 rounded-2xl p-4 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={pendingExpenses.length > 0 && selectedExpenseIds.length === pendingExpenses.length}
                  onChange={handleSelectAll}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                />
                <span>Select All Pending ({pendingExpenses.length})</span>
              </label>

              <div className="text-xs">
                <span className="text-slate-500">Selected: </span>
                <strong className="text-slate-900 font-mono font-black">{selectedExpenseIds.length} Expenses</strong>
                {selectedExpenseIds.length > 0 && (
                  <span className="text-emerald-700 font-bold ml-1.5 font-mono">
                    (₹{selectedTotalAmount.toLocaleString('en-IN')})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={handlePayAllSelected}
                disabled={selectedExpenseIds.length === 0}
                className={`w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md transition-all ${
                  selectedExpenseIds.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 cursor-pointer active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>1-Click Pay All Selected ({selectedExpenseIds.length})</span>
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-3 w-10 text-center">
                  <span className="sr-only">Select</span>
                </th>
                <th className="py-3.5 px-4">Expense ID</th>
                <th className="py-3.5 px-4">Category & Purpose</th>
                <th className="py-3.5 px-4">Classification</th>
                <th className="py-3.5 px-4">Date Logged</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredExpenses.map((e) => {
                const isPending = e.status === 'Pending';
                const isSelected = selectedExpenseIds.includes(e.id);
                return (
                  <tr key={e.id} className={`transition-colors ${isSelected ? 'bg-teal-50/50' : 'hover:bg-slate-50/60'}`}>
                    <td className="py-3 px-3 text-center">
                      {isPending ? (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(e.id)}
                          className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                        />
                      ) : (
                        <span className="text-slate-300 font-mono text-[10px]">✓</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{e.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{e.category}</div>
                      <div className="text-[11px] text-slate-400">{e.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        e.type === 'operational' ? 'bg-blue-100 text-blue-800' :
                        e.type === 'event' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {e.type === 'operational' ? 'Operational' : e.type === 'event' ? 'School Event' : 'Facility Asset'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{e.date}</td>
                    <td className="py-3 px-4">
                      {isPending ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                          <span>Pending Payment</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Paid & Settled</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-black font-mono text-rose-600">
                      -₹{Number(e.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isPending ? (
                        <button
                          onClick={() => handlePayIndividual(e.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 hover:text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-1 mx-auto cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Now</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 flex items-center justify-center gap-1 font-mono">
                          <span>Settled</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Record Operational Expense</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Expense Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Lab Chemical Reagents"
                  value={newExp.category}
                  onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Purpose of disbursement..."
                  value={newExp.description}
                  onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="25000"
                    value={newExp.amount}
                    onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Category Type</label>
                  <select
                    value={newExp.type}
                    onChange={(e) => setNewExp({ ...newExp, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-700"
                  >
                    <option value="operational">Operational & Bills</option>
                    <option value="event">School Event</option>
                    <option value="facility">Facility Asset</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md shadow-teal-600/20"
                >
                  Record Outflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
