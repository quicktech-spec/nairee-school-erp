import React, { useState, useEffect, useMemo } from 'react';
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
  Receipt,
  Wallet,
  Coins,
  RefreshCw,
  Trash2,
  Tag,
  AlertCircle
} from 'lucide-react';
import { FALLBACK_FACULTY, FALLBACK_STUDENTS } from '../fallbackData.js';
import { api, subscribeLiveEvents, broadcastLiveEvent, getMasterStudents, getMasterExpenses, saveMasterExpenses, syncStudentAcrossAllDatasets, saveMasterStudents } from '../api.js';
import { useTenant } from '../context/TenantContext.jsx';

const INITIAL_PETTY_CASH = [
  { id: 'PC-001', voucher_no: 'VCH-801', title: 'Science Lab Glassware Cleaning Solvents & Reagents', category: 'Lab Consumables', amount: 1250, date: '2026-10-02', claimant: 'Dr. Evelyn Reed', status: 'Disbursed', receipt_attached: true },
  { id: 'PC-002', voucher_no: 'VCH-802', title: 'Emergency First Aid Kit & Antiseptic Bandages Refill', category: 'Medical & First Aid', amount: 840, date: '2026-10-03', claimant: 'Campus Health Nurse', status: 'Disbursed', receipt_attached: true },
  { id: 'PC-003', voucher_no: 'VCH-803', title: 'Staff Room Tea, Coffee, Biscuits & Guest Refreshments', category: 'Hospitality & Pantry', amount: 1650, date: '2026-10-04', claimant: 'Admin Office Pantry', status: 'Disbursed', receipt_attached: false },
  { id: 'PC-004', voucher_no: 'VCH-804', title: 'Inter-School Sports Meet Whistles & Stopwatch Batteries', category: 'Sports Logistics', amount: 920, date: '2026-10-05', claimant: 'Mr. Arjun Kapoor', status: 'Disbursed', receipt_attached: true },
  { id: 'PC-005', voucher_no: 'VCH-805', title: 'Speed Post & Statutory Board Certificates Courier', category: 'Postage & Courier', amount: 480, date: '2026-10-06', claimant: 'Registrar Directorate', status: 'Disbursed', receipt_attached: true }
];

export default function FinancialPnLView() {
  const { tenant } = useTenant();
  const isMasterSchool = !tenant || tenant.is_master_school || tenant.tenant_id === 'tenant-default' || tenant.subdomain === 'demo';
  const tenantKey = tenant?.tenant_id || 'default';

  // Reactive Student Fee Records State from Master DB
  const [studentRecords, setStudentRecords] = useState(() => {
    try {
      const master = getMasterStudents();
      if (master && Array.isArray(master)) {
        return master;
      }
      return isMasterSchool ? FALLBACK_STUDENTS : [];
    } catch {
      return isMasterSchool ? FALLBACK_STUDENTS : [];
    }
  });

  // Base constants in Indian Rupees (₹)
  const tuitionPerStudent = 35000;
  const labTechFees = isMasterSchool ? 45000 : 0;
  const transportFees = isMasterSchool ? 60000 : 0;

  // Faculty Payroll calculation
  const termPayrollDisbursed = isMasterSchool ? 185000 : 0;

  // Operational Expenses State in INR from Master DB
  const [expenses, setExpenses] = useState(() => {
    try {
      const masterExp = getMasterExpenses();
      if (masterExp && Array.isArray(masterExp)) {
        return masterExp;
      }
      return isMasterSchool ? [
        { id: 'EXP 001', expense_id: 'EXP-001', category: 'Teacher Payroll', description: 'Term 1 Faculty & Staff Disbursal', amount: termPayrollDisbursed, date: '2026-09-28', status: 'Paid', type: 'operational' },
        { id: 'EXP 002', expense_id: 'EXP-002', category: 'Campus Lease & Rent', description: 'Academic Block A & B Lease', amount: 48000, date: '2026-09-01', status: 'Paid', type: 'operational' },
        { id: 'EXP 003', expense_id: 'EXP-003', category: 'Utilities & Power', description: 'Electricity, High Speed Fiber & Water Bill', amount: 14500, date: '2026-10-02', status: 'Pending', type: 'operational' },
        { id: 'EXP 004', expense_id: 'EXP-004', category: 'Annual Function 2026', description: 'Auditorium Lighting, Sound & Stage Decor', amount: 18500, date: '2026-10-03', status: 'Pending', type: 'event' },
        { id: 'EXP 005', expense_id: 'EXP-005', category: 'Sports Day Meet', description: 'Medals, Track Equipment & Refreshments', amount: 9200, date: '2026-10-04', status: 'Pending', type: 'event' },
        { id: 'EXP 006', expense_id: 'EXP-006', category: 'STEM Lab Upgrades', description: 'Robotics Sensors & Microcontroller Kits', amount: 12000, date: '2026-09-25', status: 'Paid', type: 'facility' }
      ] : [];
    } catch {
      return isMasterSchool ? [
        { id: 'EXP 001', expense_id: 'EXP-001', category: 'Teacher Payroll', description: 'Term 1 Faculty & Staff Disbursal', amount: termPayrollDisbursed, date: '2026-09-28', status: 'Paid', type: 'operational' }
      ] : [];
    }
  });

  // --- PETTY CASH FUND STATE (Integrated directly with P&L) ---
  const [pettyCashImprest, setPettyCashImprest] = useState(() => {
    try {
      const saved = localStorage.getItem(`nairee_petty_cash_imprest_${tenantKey}`);
      if (saved) return Number(saved);
      return isMasterSchool ? 25000 : 0;
    } catch {
      return isMasterSchool ? 25000 : 0;
    }
  });

  const [pettyCashLedger, setPettyCashLedger] = useState(() => {
    try {
      const saved = localStorage.getItem(`nairee_petty_cash_ledger_${tenantKey}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return isMasterSchool ? INITIAL_PETTY_CASH : [];
  });

  const [selectedExpenseIds, setSelectedExpenseIds] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [pettyCashCategoryFilter, setPettyCashCategoryFilter] = useState('all');
  const [feeSearch, setFeeSearch] = useState('');
  const [feeStatusFilter, setFeeStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddPettyCashModal, setShowAddPettyCashModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [newExp, setNewExp] = useState({
    category: 'Annual Function',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'event'
  });

  const [newPettyCash, setNewPettyCash] = useState({
    title: '',
    category: 'Lab Consumables',
    amount: '',
    claimant: 'Faculty Staff',
    date: new Date().toISOString().split('T')[0],
    receipt_attached: true
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Sync Petty Cash changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`nairee_petty_cash_ledger_${tenantKey}`, JSON.stringify(pettyCashLedger));
      localStorage.setItem(`nairee_petty_cash_imprest_${tenantKey}`, String(pettyCashImprest));
    } catch (e) {}
  }, [pettyCashLedger, pettyCashImprest, tenantKey]);

  // Listen to live fee & database updates across all portals
  useEffect(() => {
    const unsubscribe = subscribeLiveEvents((event) => {
      const freshStudents = getMasterStudents();
      if (freshStudents) {
        setStudentRecords(freshStudents);
      }
      const freshExpenses = getMasterExpenses();
      if (freshExpenses) {
        setExpenses(freshExpenses);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- DYNAMIC P&L FORMULAS LINKED WITH PETTY CASH ---
  // 1. Gross Revenue = Total Tuition Collected + Lab Tech Fees + Transport Subscriptions
  const totalStudents = studentRecords.length;
  const totalPendingTuition = studentRecords.reduce((sum, s) => sum + (Number(s.feeDues || s.balance_due) || 0), 0);
  const totalPotentialTuition = totalStudents * tuitionPerStudent;
  const collectedTuition = totalPotentialTuition - totalPendingTuition;
  const grossRevenue = collectedTuition + labTechFees + transportFees;

  // 2. Direct Regular Operational Expenses
  const pendingExpenses = expenses.filter(e => e.status === 'Pending');
  const selectedPendingExpenses = pendingExpenses.filter(e => selectedExpenseIds.includes(e.id) || selectedExpenseIds.includes(e.expense_id));
  const selectedTotalAmount = selectedPendingExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalPaidExpenses = expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + Number(e.amount), 0);

  // 3. Petty Cash Fund Calculations
  const totalPettyCashSpent = useMemo(() => {
    return pettyCashLedger.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [pettyCashLedger]);

  const pettyCashRemainingFloat = pettyCashImprest - totalPettyCashSpent;
  const pettyCashUtilizationPct = pettyCashImprest > 0 ? ((totalPettyCashSpent / pettyCashImprest) * 100).toFixed(1) : '0.0';

  // 4. Combined Total Operating Outflows = Paid Regular Expenses + Total Petty Cash Spent
  const totalCombinedOutflows = totalPaidExpenses + totalPettyCashSpent;

  // 5. Net Institutional Profit (P&L Surplus) Formula:
  // Net Profit = Gross Revenue - (Paid Regular OPEX + Total Petty Cash Disbursements)
  const netProfit = grossRevenue - totalCombinedOutflows;
  const marginPct = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : '0.0';

  // Settle single student fee
  const handleCollectStudentFee = async (student) => {
    const sId = student.student_id || student.id || student.name;
    const amount = Number(student.feeDues || student.balance_due) > 0 ? Number(student.feeDues || student.balance_due) : tuitionPerStudent;
    await api.settleStudentFee(sId, amount);
    
    syncStudentAcrossAllDatasets(sId, { fee_status: 'Paid', balance_due: 0, fee_due: 0, feeDues: 0 });
    const fresh = getMasterStudents();
    setStudentRecords(fresh);
    showToast(`🎉 Fee payment of ₹${amount.toLocaleString('en-IN')} received for ${student.name || student.student_name}! Gross Revenue & Net Profit increased.`);
  };

  // 1-Click Collect All Pending Student Fees
  const handleCollectAllStudentFees = async () => {
    const pendingStudents = studentRecords.filter(s => Number(s.feeDues || s.balance_due) > 0);
    if (pendingStudents.length === 0) return;

    const totalCollected = pendingStudents.reduce((sum, s) => sum + Number(s.feeDues || s.balance_due), 0);
    for (const s of pendingStudents) {
      const sId = s.student_id || s.id || s.name;
      await api.settleStudentFee(sId, Number(s.feeDues || s.balance_due));
      syncStudentAcrossAllDatasets(sId, { fee_status: 'Paid', balance_due: 0, fee_due: 0, feeDues: 0 });
    }

    const fresh = getMasterStudents();
    setStudentRecords(fresh);
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
      setSelectedExpenseIds(pendingExpenses.map(e => e.id || e.expense_id));
    }
  };

  const handlePayIndividual = (id) => {
    const target = expenses.find(e => e.id === id || e.expense_id === id);
    if (!target) return;
    const updated = expenses.map(e => (e.id === id || e.expense_id === id) ? { ...e, status: 'Paid', date: new Date().toISOString().split('T')[0] } : e);
    setExpenses(updated);
    saveMasterExpenses(updated);
    setSelectedExpenseIds(prev => prev.filter(x => x !== id));
    showToast(`Expense (${target.category} • ₹${Number(target.amount).toLocaleString('en-IN')}) settled successfully!`);
  };

  const handlePayAllSelected = () => {
    if (selectedExpenseIds.length === 0) return;
    const count = selectedExpenseIds.length;
    const total = selectedTotalAmount;
    const updated = expenses.map(e => (selectedExpenseIds.includes(e.id) || selectedExpenseIds.includes(e.expense_id)) ? { ...e, status: 'Paid', date: new Date().toISOString().split('T')[0] } : e);
    setExpenses(updated);
    saveMasterExpenses(updated);
    setSelectedExpenseIds([]);
    showToast(`🎉 1-Click Pay All: Settled ${count} pending expenses (₹${total.toLocaleString('en-IN')})!`);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExp.amount || !newExp.description) return;
    const nextNum = expenses.length + 1;
    const added = {
      id: `EXP 00${nextNum}`,
      expense_id: `EXP-${String(nextNum).padStart(3, '0')}`,
      title: newExp.description || newExp.category,
      category: newExp.category,
      description: newExp.description,
      amount: parseFloat(newExp.amount),
      date: newExp.date,
      status: 'Pending',
      type: newExp.type
    };
    const updated = [added, ...expenses];
    setExpenses(updated);
    saveMasterExpenses(updated);
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

  // --- PETTY CASH VOUCHER HANDLERS ---
  const handleAddPettyCash = (e) => {
    e.preventDefault();
    if (!newPettyCash.title || !newPettyCash.amount) return;
    const voucherNum = `VCH-${800 + pettyCashLedger.length + 1}`;
    const newEntry = {
      id: `PC-00${pettyCashLedger.length + 1}`,
      voucher_no: voucherNum,
      title: newPettyCash.title,
      category: newPettyCash.category,
      amount: parseFloat(newPettyCash.amount),
      date: newPettyCash.date,
      claimant: newPettyCash.claimant || 'Staff Member',
      status: 'Disbursed',
      receipt_attached: Boolean(newPettyCash.receipt_attached)
    };

    const updated = [newEntry, ...pettyCashLedger];
    setPettyCashLedger(updated);
    setShowAddPettyCashModal(false);
    showToast(`🪙 Petty Cash Voucher ${voucherNum} (₹${Number(newPettyCash.amount).toLocaleString('en-IN')}) recorded & deducted from P&L Surplus!`);
    broadcastLiveEvent('pnl_updated', { type: 'petty_cash_added', entry: newEntry });

    setNewPettyCash({
      title: '',
      category: 'Lab Consumables',
      amount: '',
      claimant: 'Faculty Staff',
      date: new Date().toISOString().split('T')[0],
      receipt_attached: true
    });
  };

  const handleDeletePettyCash = (id) => {
    const target = pettyCashLedger.find(p => p.id === id);
    if (!target) return;
    const updated = pettyCashLedger.filter(p => p.id !== id);
    setPettyCashLedger(updated);
    showToast(`Removed Petty Cash voucher ${target.voucher_no} (₹${target.amount}). P&L surplus adjusted.`);
    broadcastLiveEvent('pnl_updated', { type: 'petty_cash_deleted', id });
  };

  const handleReplenishFloat = () => {
    const addedAmount = 15000;
    setPettyCashImprest(prev => prev + addedAmount);
    showToast(`⚡ Imprest Float topped up by ₹${addedAmount.toLocaleString('en-IN')}! Total Float: ₹${(pettyCashImprest + addedAmount).toLocaleString('en-IN')}`);
  };

  const filteredExpenses = expenses.filter(e => {
    if (filterType === 'all') return true;
    return e.type === filterType;
  });

  const filteredPettyCash = pettyCashLedger.filter(p => {
    if (pettyCashCategoryFilter === 'all') return true;
    return p.category === pettyCashCategoryFilter;
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
    csv += "\n--- PETTY CASH DISBURSEMENTS LEDGER ---\n";
    csv += "Voucher No,Expense Title,Category,Claimant,Amount (₹),Date,Status\n";
    pettyCashLedger.forEach(p => {
      csv += `${p.voucher_no},"${p.title}","${p.category}","${p.claimant}",${p.amount},${p.date},${p.status}\n`;
    });
    csv += `\nTotal Gross Revenue,₹${grossRevenue}\n`;
    csv += `Regular Paid Expenses,₹${totalPaidExpenses}\n`;
    csv += `Total Petty Cash Disbursed,₹${totalPettyCashSpent}\n`;
    csv += `Total Combined Operational Outflows,₹${totalCombinedOutflows}\n`;
    csv += `Net Institutional Profit (P&L Surplus),₹${netProfit}\n`;
    csv += `Profit Margin,${marginPct}%\n`;
    csv += `Petty Cash Imprest Float Remaining,₹${pettyCashRemainingFloat}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tenant?.school_code || 'Nairee'}_Financial_PL_with_PettyCash_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast("Financial P&L Report with Petty Cash exported successfully!");
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
              <span className="uppercase tracking-wider">{tenant?.school_name || 'Nairee'} &bull; Audited Financial P&L</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Executive Profit &amp; Loss (P&amp;L) Statement</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-normal">
                ● Petty Cash Linked
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Centralized financial governance linking fee collections, operational expenses, and <strong>daily petty cash disbursements</strong> directly into institutional net surplus.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => setShowAddPettyCashModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md flex items-center space-x-1.5 cursor-pointer active:scale-95"
            >
              <Coins className="w-4 h-4" />
              <span>+ Record Petty Cash</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-[#00a884] hover:bg-[#009272] text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Log Major Outflow</span>
            </button>
            <button
              onClick={exportCSV}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export P&L CSV</span>
            </button>
          </div>
        </div>

        {/* 5-COLUMN HIGHLIGHT KPI GRID (Including Direct Petty Cash Integration) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8 pt-6 border-t border-white/10">
          
          {/* Card 1: Gross Revenue */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-0">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span className="truncate">Gross Revenue (Collected)</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-2 font-mono truncate">
              ₹{grossRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              Tuition (₹{collectedTuition.toLocaleString('en-IN')}) + Labs + Bus
            </div>
          </div>

          {/* Card 2: Fixed OPEX */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-0">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span className="truncate">Fixed Operational Outflow</span>
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-400 mt-2 font-mono truncate">
              ₹{totalPaidExpenses.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              Payroll (₹{termPayrollDisbursed.toLocaleString('en-IN')}) + Lease + Events
            </div>
          </div>

          {/* Card 3: PETTY CASH DISBURSEMENTS (NEW PART) */}
          <div className="bg-amber-500/10 backdrop-blur-md rounded-2xl p-4 border border-amber-400/30 min-w-0">
            <div className="flex items-center justify-between text-amber-300 text-xs font-semibold">
              <span className="truncate">🪙 Petty Cash Disbursed</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-2 font-mono truncate">
              ₹{totalPettyCashSpent.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-amber-200/80 mt-1 flex items-center justify-between">
              <span className="truncate">{pettyCashLedger.length} Vouchers</span>
              <span className="font-mono font-bold">Float: ₹{pettyCashRemainingFloat.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Card 4: Net Institution Profit (Calculated via Formula: Revenue - (Fixed OPEX + Petty Cash)) */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-0">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span className="truncate">Net Institutional Profit</span>
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-xl sm:text-2xl font-black mt-2 font-mono truncate ${netProfit >= 0 ? 'text-teal-300' : 'text-rose-400'}`}>
              ₹{netProfit.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-teal-400 mt-1 flex items-center space-x-1 truncate">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{netProfit >= 0 ? 'Surplus (Post Petty Cash)' : 'Deficit Outflow'}</span>
            </div>
          </div>

          {/* Card 5: Profit Margin */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-0">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span className="truncate">Net Surplus Margin</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-2 font-mono truncate">
              {marginPct}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              Receivables Due: ₹{totalPendingTuition.toLocaleString('en-IN')}
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 1: DEDICATED PETTY CASH FUND & DISCRETIONARY EXPENSE TRACKER (NEW INTEGRATED SECTION) */}
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm overflow-hidden p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base">Petty Cash Fund &amp; Daily Discretionary Ledger</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold uppercase">
                  P&amp;L Linked
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tracks day-to-day cash disbursements (science consumables, medical kits, pantry, postage, and local transport) and auto-deducts from P&amp;L surplus.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleReplenishFloat}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Replenish Monthly Imprest Float"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>+ Top Up Float (₹15,000)</span>
            </button>
            <button
              onClick={() => setShowAddPettyCashModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Record Petty Cash Voucher</span>
            </button>
          </div>
        </div>

        {/* Petty Cash Imprest Fund Analytics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60">
          <div className="p-3 bg-white rounded-xl border border-amber-100 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Imprest Float</span>
            <div className="text-lg font-black text-slate-800 mt-0.5 font-mono">
              ₹{pettyCashImprest.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-500">Allocated Discretionary Pool</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-amber-100 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-rose-500 block">Total Disbursed (Spent)</span>
            <div className="text-lg font-black text-rose-600 mt-0.5 font-mono">
              ₹{totalPettyCashSpent.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-rose-600/80">{pettyCashUtilizationPct}% of Fund Consumed</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-amber-100 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Cash Balance in Hand</span>
            <div className="text-lg font-black text-emerald-600 mt-0.5 font-mono">
              ₹{pettyCashRemainingFloat.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-700">Available for Daily Vouchers</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-amber-100 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">P&amp;L Deduction Formula</span>
            <div className="text-xs font-bold text-indigo-900 mt-1 font-mono">
              NOP = Rev - (OPEX + PC)
            </div>
            <span className="text-[10px] text-teal-700 font-medium">Auto-deducted from Profit</span>
          </div>
        </div>

        {/* Filter Chips & Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span>Category:</span>
            </span>
            {['all', 'Lab Consumables', 'Medical & First Aid', 'Hospitality & Pantry', 'Sports Logistics', 'Postage & Courier'].map((cat) => (
              <button
                key={cat}
                onClick={() => setPettyCashCategoryFilter(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  pettyCashCategoryFilter === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat === 'all' ? `All Vouchers (${pettyCashLedger.length})` : cat}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-slate-800">{filteredPettyCash.length}</strong> reconciled disbursements
          </div>
        </div>

        {/* Petty Cash Vouchers Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Voucher No</th>
                <th className="py-3 px-4">Expense Title &amp; Purpose</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Claimant / Staff</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Receipt Proof</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPettyCash.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-xs text-slate-400">
                    No petty cash vouchers logged under this filter category.
                  </td>
                </tr>
              ) : (
                filteredPettyCash.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                        {p.voucher_no}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{p.title}</div>
                      <div className="text-[10px] text-slate-400">Status: {p.status} &bull; Linked to P&amp;L</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        p.category === 'Lab Consumables' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
                        p.category === 'Medical & First Aid' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        p.category === 'Hospitality & Pantry' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        p.category === 'Sports Logistics' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {p.claimant}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {p.date}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.receipt_attached ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Attached</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                          <span>Physical Memo</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-black font-mono text-rose-600">
                      -₹{Number(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeletePettyCash(p.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Voucher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: DEDICATED STUDENT FEE GOVERNANCE & RECEIVABLES TABLE */}
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
              Receive student term payments with 1-click. Settled amounts instantly boost Gross Revenue &amp; Net Institutional Surplus.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {pendingStudentsCount > 0 && (
              <button
                onClick={handleCollectAllStudentFees}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Zap className="w-4 h-4" />
                <span>1-Click Collect All Pending Fees</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFeeStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                feeStatusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              All Students ({studentRecords.length})
            </button>
            <button
              onClick={() => setFeeStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                feeStatusFilter === 'pending'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
              }`}
            >
              Pending Dues ({pendingStudentsCount})
            </button>
            <button
              onClick={() => setFeeStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                feeStatusFilter === 'paid'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
              }`}
            >
              Cleared ({studentRecords.length - pendingStudentsCount})
            </button>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search student or class..."
              value={feeSearch}
              onChange={(e) => setFeeSearch(e.target.value)}
              className="w-full px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>

        {/* Student Fee Records Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Student ID &amp; Name</th>
                <th className="py-3.5 px-4">Class Batch</th>
                <th className="py-3.5 px-4">Guardian Contact</th>
                <th className="py-3.5 px-4">Term Amount</th>
                <th className="py-3.5 px-4">Fee Status</th>
                <th className="py-3.5 px-4 text-center">Settlement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudentFees.map((s) => {
                const isPending = Number(s.feeDues) > 0 || s.fee_status === 'Pending';
                return (
                  <tr key={s.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{s.student_name || s.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{s.name} &bull; Roll #{s.roll_no}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {s.student_batch || s.class_batch}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{s.guardian_name || 'Guardian'}</div>
                      <div className="text-[11px] text-teal-600 font-mono">{s.guardian_mobile || '+91 98765 00000'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ₹{tuitionPerStudent.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                          <span>Due: ₹{Number(s.feeDues || tuitionPerStudent).toLocaleString('en-IN')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Paid &amp; Cleared</span>
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

      {/* SECTION 3: EXPENSE & DISBURSEMENT LEDGER */}
      <div className="bg-white rounded-3xl border border-teal-100 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <TrendingDown className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Major Operational Expense &amp; Disbursement Hub</h3>
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
              <option value="operational">Operational &amp; Payroll</option>
              <option value="event">School Events (Annual Day, Sports)</option>
              <option value="facility">Facility &amp; Lab Upgrades</option>
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
                <th className="py-3.5 px-4">Category &amp; Purpose</th>
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
                          <span>Paid &amp; Settled</span>
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

      {/* Add Major Expense Modal */}
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
                    <option value="operational">Operational &amp; Bills</option>
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

      {/* Add Petty Cash Voucher Modal */}
      {showAddPettyCashModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Record Petty Cash Voucher</h3>
                  <p className="text-[11px] text-slate-400">Instantly links and deducts from P&amp;L surplus</p>
                </div>
              </div>
              <button onClick={() => setShowAddPettyCashModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPettyCash} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Expense Title / Purpose *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Lab Test Tubes Cleaning Brush & Acid"
                  value={newPettyCash.title}
                  onChange={(e) => setNewPettyCash({ ...newPettyCash, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Disbursement Category *</label>
                  <select
                    value={newPettyCash.category}
                    onChange={(e) => setNewPettyCash({ ...newPettyCash, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-slate-700"
                  >
                    <option value="Lab Consumables">Lab Consumables</option>
                    <option value="Medical & First Aid">Medical &amp; First Aid</option>
                    <option value="Hospitality & Pantry">Hospitality &amp; Pantry</option>
                    <option value="Sports Logistics">Sports Logistics</option>
                    <option value="Postage & Courier">Postage &amp; Courier</option>
                    <option value="Stationery & Printing">Stationery &amp; Printing</option>
                    <option value="Minor Repairs & Plumbing">Minor Repairs &amp; Plumbing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1250"
                    value={newPettyCash.amount}
                    onChange={(e) => setNewPettyCash({ ...newPettyCash, amount: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Staff Member / Claimant</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Evelyn Reed"
                    value={newPettyCash.claimant}
                    onChange={(e) => setNewPettyCash({ ...newPettyCash, claimant: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Disbursement Date</label>
                  <input
                    type="date"
                    required
                    value={newPettyCash.date}
                    onChange={(e) => setNewPettyCash({ ...newPettyCash, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-bold text-xs">
                  <input
                    type="checkbox"
                    checked={newPettyCash.receipt_attached}
                    onChange={(e) => setNewPettyCash({ ...newPettyCash, receipt_attached: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                  />
                  <span>Physical Receipt / Cash Bill Attached</span>
                </label>
                <span className="text-[10px] text-amber-800 font-semibold font-mono">Tax Audit Ready</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddPettyCashModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Confirm &amp; Disburse Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
