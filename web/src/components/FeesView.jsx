import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Download, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { api } from '../api.js';

export default function FeesView() {
  const [fees, setFees] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [payingFee, setPayingFee] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card / Stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptModal, setReceiptModal] = useState(null);

  const loadFees = async () => {
    try {
      setLoading(true);
      const data = await api.getFees({ status: statusFilter });
      setFees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, [statusFilter]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!payingFee) return;

    try {
      setIsProcessing(true);
      const res = await api.payFee(payingFee.name, paymentMethod);
      setReceiptModal({
        ...payingFee,
        receipt_no: res.receipt_no,
        payment_date: res.payment_date,
        payment_method: paymentMethod
      });
      setPayingFee(null);
      loadFees();
    } catch (err) {
      alert('Payment failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalBilled = fees.reduce((sum, f) => sum + (f.grand_total || 0), 0);
  const totalPaid = fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + (f.grand_total || 0), 0);
  const totalOutstanding = fees.reduce((sum, f) => sum + (f.outstanding_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">Fee Invoicing & Payments</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
              tabFees & tabFeeComponent
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Student fee schedules, tuition breakdowns, and online payment collection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-bold bg-transparent text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Invoices</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Finance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Billed</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">${totalBilled.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">Across all registered terms</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-400">Collected Revenue</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">${totalPaid.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">Verified bank & card receipts</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Outstanding</p>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-1">${totalOutstanding.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">Due for collection</p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading fee records...</div>
        ) : fees.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No invoices found matching status.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Term & Program</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Fee Breakdown</th>
                  <th className="py-3.5 px-4">Total / Balance</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {fees.map((fee) => (
                  <tr key={fee.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {fee.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{fee.student_name}</p>
                      <p className="text-[11px] text-slate-400">{fee.student}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{fee.academic_term}</p>
                      <p className="text-[11px] text-slate-500">{fee.student_batch}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {fee.due_date}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {fee.components?.map((c) => (
                          <span
                            key={c.id}
                            className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                          >
                            {c.fee_category}: ${c.amount}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">${fee.grand_total}</p>
                      <p className={`text-[11px] font-bold ${fee.outstanding_amount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        Due: ${fee.outstanding_amount}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        fee.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : fee.status === 'Overdue'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {fee.status === 'Paid' ? (
                        <button
                          onClick={() => setReceiptModal(fee)}
                          className="px-3 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                        >
                          View Receipt
                        </button>
                      ) : (
                        <button
                          onClick={() => setPayingFee(fee)}
                          className="px-3 py-1 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-sm shadow-brand-500/20 transition-all cursor-pointer"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAY FEE MODAL */}
      {payingFee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-brand-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Process Fee Payment</h3>
                <p className="text-xs text-slate-300">Invoice {payingFee.name}</p>
              </div>
              <button onClick={() => setPayingFee(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePay} className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-brand-900 font-bold">{payingFee.student_name}</p>
                  <p className="text-[11px] text-brand-700">{payingFee.academic_term} Tuition & Services</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-brand-900">${payingFee.outstanding_amount}</span>
                  <span className="block text-[10px] text-brand-600 uppercase font-bold">Balance Due</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Payment Gateway</label>
                <div className="space-y-2">
                  {['Credit Card / Stripe', 'Apple Pay / Google Pay', 'Direct Bank Wire'].map((m) => (
                    <label
                      key={m}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === m ? 'border-brand-600 bg-brand-50/50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === m}
                        onChange={() => setPaymentMethod(m)}
                        className="text-brand-600"
                      />
                      <span className="text-xs font-bold text-slate-800">{m}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayingFee(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : `Confirm & Pay $${payingFee.outstanding_amount}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL RECEIPT MODAL */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500 text-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Official Payment Receipt</h3>
                  <p className="text-xs text-slate-400">Nairee International School Accounts</p>
                </div>
              </div>
              <button onClick={() => setReceiptModal(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Receipt Number</p>
                  <p className="text-sm font-mono font-bold text-brand-600">{receiptModal.receipt_no || 'REC-2026-90412'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Payment Date</p>
                  <p className="text-xs font-bold text-slate-800">{receiptModal.payment_date || '2026-10-01'}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Paid By</p>
                <p className="text-sm font-bold text-slate-900">{receiptModal.student_name}</p>
                <p className="text-xs text-slate-500 font-mono">{receiptModal.student} • {receiptModal.student_batch}</p>
              </div>

              {/* Breakdown */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                <p className="text-[11px] font-bold text-slate-600 uppercase">Itemized Fee Components</p>
                {receiptModal.components?.map((c) => (
                  <div key={c.id} className="flex justify-between text-xs text-slate-700">
                    <span>{c.fee_category}</span>
                    <span className="font-semibold">${c.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-extrabold text-slate-900">
                  <span>Grand Total Paid</span>
                  <span className="text-emerald-600">${receiptModal.grand_total.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500">Method: {receiptModal.payment_method || 'Credit Card / Stripe'}</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  ✓ Balance Cleared ($0.00)
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setReceiptModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800"
              >
                <Download className="w-4 h-4" />
                Print / Save Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
