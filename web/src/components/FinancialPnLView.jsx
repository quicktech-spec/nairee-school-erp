import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
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
  X
} from 'lucide-react';
import { FALLBACK_FACULTY, FALLBACK_STUDENTS } from '../fallbackData.js';

export default function FinancialPnLView() {
  // Base Tuition fee calculations
  const totalStudents = FALLBACK_STUDENTS.length || 7;
  const tuitionPerStudent = 4200;
  const collectedTuition = 24800; // actual collected
  const pendingTuition = totalStudents * tuitionPerStudent - collectedTuition; // ~ 4,600
  const labTechFees = 5600;
  const transportFees = 7400;
  const grossRevenue = collectedTuition + labTechFees + transportFees; // ~ 37,800

  // Faculty Payroll calculation
  const totalSalaries = FALLBACK_FACULTY.reduce((acc, f) => acc + (f.salary || 65000), 0); // e.g. 5 teachers * ~65k/year or ~27k/term
  const termPayrollDisbursed = 21500;

  // Operational Expenses State
  const [expenses, setExpenses] = useState([
    { id: 'EXP-001', category: 'Teacher Payroll', description: 'Term 1 Faculty & Staff Disbursal', amount: termPayrollDisbursed, date: '2026-09-28', status: 'Disbursed', type: 'operational' },
    { id: 'EXP-002', category: 'Campus Lease & Rent', description: 'Academic Block A & B Lease', amount: 4800, date: '2026-09-01', status: 'Paid', type: 'operational' },
    { id: 'EXP-003', category: 'Utilities & Power', description: 'Electricity, High-speed Fiber & Water', amount: 1450, date: '2026-09-15', status: 'Paid', type: 'operational' },
    { id: 'EXP-004', category: 'Annual Function 2026', description: 'Auditorium Lighting, Sound & Stage Decor', amount: 1850, date: '2026-09-20', status: 'Paid', type: 'event' },
    { id: 'EXP-005', category: 'Sports Day Meet', description: 'Medals, Track Equipment & Refreshments', amount: 920, date: '2026-09-22', status: 'Paid', type: 'event' },
    { id: 'EXP-006', category: 'STEM Lab Upgrades', description: 'Robotics Sensors & Microcontroller Kits', amount: 1200, date: '2026-09-25', status: 'Paid', type: 'facility' }
  ]);

  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [newExp, setNewExp] = useState({
    category: 'Annual Function',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'event'
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfit = grossRevenue - totalExpenses;
  const marginPct = ((netProfit / grossRevenue) * 100).toFixed(1);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExp.amount || !newExp.description) return;
    const added = {
      id: `EXP-00${expenses.length + 1}`,
      category: newExp.category,
      description: newExp.description,
      amount: parseFloat(newExp.amount),
      date: newExp.date,
      status: 'Paid',
      type: newExp.type
    };
    setExpenses([added, ...expenses]);
    setShowAddModal(false);
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

  const exportCSV = () => {
    let csv = "ID,Category,Description,Amount ($),Date,Status,Type\n";
    expenses.forEach(e => {
      csv += `${e.id},"${e.category}","${e.description}",${e.amount},${e.date},${e.status},${e.type}\n`;
    });
    csv += `\nTotal Gross Revenue,$${grossRevenue}\n`;
    csv += `Total Expenses,$${totalExpenses}\n`;
    csv += `Net Profit,$${netProfit}\n`;
    csv += `Profit Margin,${marginPct}%\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nairee_Executive_PL_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Principal & Executive Leadership Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              School Financial P&L & Profit Analytics
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Real-time audit of gross institutional revenue, teacher payroll disbursements, campus utilities, and event expenditures with live net margin calculation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/30 flex items-center space-x-2 transition-transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Log School Expense</span>
            </button>
            <button
              onClick={exportCSV}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 flex items-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export P&L Statement</span>
            </button>
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 flex items-center space-x-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Audit Sheet</span>
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
            <div className="text-2xl font-black text-emerald-400 mt-2">
              ${grossRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
              <span>Tuition (${collectedTuition.toLocaleString()}) + Labs + Bus</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Operational Expenses</span>
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-400 mt-2">
              ${totalExpenses.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Payroll (${termPayrollDisbursed.toLocaleString()}) + Rent + Events
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Net Institution Profit</span>
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-teal-300 mt-2">
              ${netProfit.toLocaleString()}
            </div>
            <div className="text-[11px] text-teal-400 mt-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Positive Surplus Margin</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Annual Profit Margin</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-300 mt-2">
              {marginPct}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Outstanding Dues: ${pendingTuition.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Cards & Visual Analytics */}
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
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              ${grossRevenue.toLocaleString()}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Student Tuition & Enrollment Fees</span>
                <span>${collectedTuition.toLocaleString()} (65.6%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: '65.6%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>North City Transport & Bus Fleet Subscriptions</span>
                <span>${transportFees.toLocaleString()} (19.5%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" style={{ width: '19.5%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Science, Robotics & Smart Classroom Lab Fees</span>
                <span>${labTechFees.toLocaleString()} (14.9%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '14.9%' }} />
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Online Payment Gateway Sync: Active (Stripe & Bank NEFT)</span>
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
            <span className="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
              ${totalExpenses.toLocaleString()}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Faculty Salaries & Staff Remuneration</span>
                <span>${termPayrollDisbursed.toLocaleString()} (69.9%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full" style={{ width: '69.9%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Campus Building Lease & Ground Rent</span>
                <span>$4,800 (15.6%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full" style={{ width: '15.6%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Annual Function, Sports Day & Facility Upgrades</span>
                <span>$4,420 (14.5%)</span>
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

      {/* Detailed Expense Ledger Table */}
      <div className="bg-white rounded-3xl border border-teal-100 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Detailed Expense & Outflow Ledger</h3>
            <p className="text-xs text-slate-400">All registered debits, salary payments, event costs and campus investments</p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
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

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Expense ID</th>
                <th className="py-3.5 px-4">Category & Purpose</th>
                <th className="py-3.5 px-4">Classification</th>
                <th className="py-3.5 px-4">Date Logged</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-teal-50/20 transition-colors">
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
                  <td className="py-3 px-4 text-slate-500">{e.date}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center space-x-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{e.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-rose-600">
                    -${Number(e.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD EXPENSE MODAL */}
      {showAddModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-teal-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Log New Institutional Expense</h3>
                  <p className="text-xs text-slate-400">Record event, utility, campus or facility outflows</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expense Type</label>
                  <select
                    value={newExp.type}
                    onChange={(e) => {
                      const type = e.target.value;
                      let defaultCat = 'Annual Function 2026';
                      if (type === 'operational') defaultCat = 'Utilities & Maintenance';
                      if (type === 'facility') defaultCat = 'Smart Classroom Upgrade';
                      setNewExp({ ...newExp, type, category: defaultCat });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="event">School Event (Function / Sports)</option>
                    <option value="facility">Facility & Lab Equipment</option>
                    <option value="operational">Operational & Utilities</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={newExp.category}
                    onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                    placeholder="e.g. Annual Function / Sports Day"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expense Description / Vendor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sound system & stage rental for Annual Day"
                  value={newExp.description}
                  onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1250"
                    value={newExp.amount}
                    onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date Incurred</label>
                  <input
                    type="date"
                    required
                    value={newExp.date}
                    onChange={(e) => setNewExp({ ...newExp, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT AUDIT SHEET MODAL */}
      {showPrintModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowPrintModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-teal-100 space-y-6 text-slate-800">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">NAIREE INTERNATIONAL ACADEMY</h2>
                <p className="text-xs text-slate-500 font-semibold">Official Executive Financial Profit & Loss Statement</p>
                <p className="text-[10px] text-slate-400 font-mono">Academic Year 2026-2027 &bull; Ref: NAIREE-AUDIT-2026-Q3</p>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="font-bold text-emerald-900 uppercase tracking-wider text-[10px]">Gross Revenue</div>
                <div className="text-lg font-black text-emerald-700">${grossRevenue.toLocaleString()}</div>
                <div className="text-[10px] text-emerald-600 mt-1">Tuition + Transport + STEM Labs</div>
              </div>

              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-100">
                <div className="font-bold text-rose-900 uppercase tracking-wider text-[10px]">Total Outflows</div>
                <div className="text-lg font-black text-rose-700">${totalExpenses.toLocaleString()}</div>
                <div className="text-[10px] text-rose-600 mt-1">Payroll + Rent + Utilities + Events</div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">Net Institutional Surplus</span>
                <div className="text-2xl font-black text-teal-300">${netProfit.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Profit Margin</span>
                <div className="text-2xl font-black text-amber-400">{marginPct}%</div>
              </div>
            </div>

            <div className="border-t pt-4 flex items-center justify-between text-[11px] text-slate-400">
              <div>Certified by: <strong>Office of the Principal & Board of Governors</strong></div>
              <div>Generated: {new Date().toLocaleDateString()}</div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Send to Printer</span>
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
