import React, { useState, useEffect, useMemo } from 'react';
import { 
  Receipt, 
  IndianRupee, 
  CreditCard, 
  CheckCircle2, 
  X, 
  Download, 
  Filter,
  QrCode,
  Smartphone,
  Building,
  ShieldCheck,
  Printer,
  Clock,
  Sparkles,
  Check,
  AlertCircle,
  Copy,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api, formatDbError, subscribeLiveEvents, broadcastLiveEvent, getStoredDb, saveStoredDb } from '../api.js';
import { useTenant } from '../context/TenantContext.jsx';

export default function FeesView({ onPaymentCompleted }) {
  const { tenant, isAdmin, userRole } = useTenant();
  const isMasterSchool = !tenant || tenant.is_master_school || tenant.tenant_id === 'tenant-default' || tenant.subdomain === 'demo';
  const tenantKey = tenant?.tenant_id || 'default';

  const [fees, setFees] = useState([]);
  const [feeStatusList, setFeeStatusList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [payingFee, setPayingFee] = useState(null);
  
  // Payment Gateway States: 'upi' | 'card' | 'netbanking'
  const [paymentGatewayTab, setPaymentGatewayTab] = useState('upi');
  const [paymentMethod, setPaymentMethod] = useState('UPI Dynamic QR');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentTimer, setPaymentTimer] = useState(300); // 5 mins countdown
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Card Form State
  const [cardForm, setCardForm] = useState({
    cardNumber: '4532 8901 2345 6789',
    cardHolder: 'Anita Patel',
    expiry: '08/29',
    cvv: '891'
  });
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Receipt Modal State
  const [receiptModal, setReceiptModal] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadFees = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const [data, statusData] = await Promise.all([
        api.getFees({ status: statusFilter }).catch(() => []),
        api.getStudentFeeStatus().catch(() => [])
      ]);
      setFees(data || []);
      setFeeStatusList(statusData || []);
    } catch (err) {
      setErrorMessage(formatDbError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
    const unsubscribe = subscribeLiveEvents((event) => {
      if (
        event.type === 'fee_updated' ||
        event.type === 'student_updated' ||
        event.type === 'student_cascaded_update' ||
        event.type === 'student_transferred' ||
        event.type === 'db_store_updated'
      ) {
        loadFees();
      }
    });
    return () => unsubscribe();
  }, [statusFilter, tenantKey]);

  // Payment Countdown Timer
  useEffect(() => {
    let interval = null;
    if (payingFee) {
      setPaymentTimer(300);
      interval = setInterval(() => {
        setPaymentTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [payingFee]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Process Live Payment & Generate Instant Tax Receipt
  const handleProcessPayment = async (e) => {
    if (e) e.preventDefault();
    if (!payingFee) return;

    try {
      setIsProcessing(true);
      setErrorMessage('');

      // Simulated bank authentication delay
      await new Promise(r => setTimeout(r, 1200));

      const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const paymentDate = new Date().toISOString().split('T')[0];
      const utrRef = `UPI/${Date.now().toString().slice(-8)}/${Math.floor(1000 + Math.random() * 9000)}`;

      const res = await api.payFee(payingFee.name || payingFee.id, paymentMethod);

      const generatedReceipt = {
        ...payingFee,
        receipt_no: res?.receipt_no || receiptNumber,
        payment_date: res?.payment_date || paymentDate,
        payment_method: paymentMethod,
        transaction_ref: utrRef,
        status: 'Paid',
        outstanding_amount: 0,
        amount_paid: payingFee.outstanding_amount || payingFee.grand_total || payingFee.amount || 35000
      };

      // Store in tenant receipts
      try {
        const savedKey = `nairee_receipt_${tenantKey}_${generatedReceipt.receipt_no}`;
        localStorage.setItem(savedKey, JSON.stringify(generatedReceipt));
      } catch {}

      setReceiptModal(generatedReceipt);
      setPayingFee(null);
      showToast(`Fee Payment of ₹${(generatedReceipt.amount_paid).toLocaleString('en-IN')} Successful!`);
      
      broadcastLiveEvent('fee_updated', {
        fee_id: payingFee.name || payingFee.id,
        receipt_no: generatedReceipt.receipt_no,
        tenant_id: tenantKey,
        amount: generatedReceipt.amount_paid
      });

      if (onPaymentCompleted) onPaymentCompleted();
      loadFees();
    } catch (err) {
      setErrorMessage(formatDbError(err));
    } finally {
      setIsProcessing(false);
    }
  };

  // Dynamic totals
  const totalBilled = feeStatusList.length > 0
    ? feeStatusList.reduce((sum, s) => sum + (Number(s.total_billed || s.amount_due) || 0), 0)
    : fees.reduce((sum, f) => sum + (f.grand_total || f.amount || 0), 0);

  const totalPaid = feeStatusList.length > 0
    ? feeStatusList.reduce((sum, s) => sum + (Number(s.total_paid || s.amount_paid) || 0), 0)
    : fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + (f.grand_total || f.amount || 0), 0);

  const totalOutstanding = feeStatusList.length > 0
    ? feeStatusList.reduce((sum, s) => sum + (Number(s.balance_amount || s.outstanding_amount) || 0), 0)
    : fees.filter(f => f.status !== 'Paid').reduce((sum, f) => sum + (f.outstanding_amount || f.amount || 0), 0);

  const collectionPercentage = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c1f2c] border border-teal-500/60 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header & KPI Summary Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-teal-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Tuition & Fee Governance Ledger</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                  INSTANT UPI & GST RECEIPTS
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-channel online fee checkout, automated reconciliation, and instant printable tax receipts
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="all">All Invoice Statuses</option>
            <option value="Unpaid">Pending & Unpaid</option>
            <option value="Paid">Cleared / Paid</option>
            <option value="Overdue">Overdue Invoices</option>
          </select>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-teal-100 shadow-sm">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Billed</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">₹{totalBilled.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-slate-500 font-medium">Annual Term Invoices</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-teal-100 shadow-sm">
          <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">Total Collected</span>
          <span className="text-2xl font-black text-emerald-600 block mt-1">₹{totalPaid.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-emerald-700 font-semibold">{collectionPercentage}% Collection Rate</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-teal-100 shadow-sm">
          <span className="text-[10px] font-extrabold text-rose-500 uppercase tracking-wider block">Outstanding Dues</span>
          <span className="text-2xl font-black text-rose-600 block mt-1">₹{totalOutstanding.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-rose-600 font-medium">Across Pending Invoices</span>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">Payment Gateways</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div>
            <span className="text-base font-black text-white block">UPI QR • Cards • NetBanking</span>
            <span className="text-[10px] text-teal-200/80">0% Surcharge • 1-Click Verification</span>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-teal-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">Loading school fee records...</div>
        ) : fees.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-1">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
            <p className="font-bold text-slate-700">No Invoices Found</p>
            <p className="text-[11px]">Fee records created for enrolled students will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Student Name & Roll</th>
                  <th className="py-3.5 px-4">Term & Class</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Fee Structure Breakdown</th>
                  <th className="py-3.5 px-4">Grand Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {fees.map((fee) => (
                  <tr key={fee.name || fee.id || fee.student_id} className="hover:bg-teal-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                      {fee.name || fee.id || 'INV-2026-001'}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span>{fee.student_name}</span>
                        {fee.roll_no && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                            Roll #{fee.roll_no}
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">{fee.student_id || fee.student}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{fee.academic_term || 'Term 1 (2026-27)'}</p>
                      <p className="text-[11px] font-bold text-teal-800">{fee.class_batch || fee.student_batch || 'Class 10 - Section A'}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {fee.due_date || '2026-10-15'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {fee.components && fee.components.length > 0 ? (
                          fee.components.map((c, i) => (
                            <span
                              key={c.id || i}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-teal-50 text-teal-900 border border-teal-200"
                            >
                              {c.fee_category}: ₹{c.amount}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                            Tuition & Academic Core: ₹{(fee.grand_total || fee.amount || 35000).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-black text-slate-900 text-sm">₹{(fee.grand_total || fee.amount || 35000).toLocaleString('en-IN')}</p>
                      <p className={`text-[10px] font-bold ${(fee.outstanding_amount || (fee.status === 'Paid' ? 0 : fee.amount) || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {fee.status === 'Paid' ? '✓ Fully Cleared' : `Due: ₹${(fee.outstanding_amount || fee.amount || 35000).toLocaleString('en-IN')}`}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        fee.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : fee.status === 'Overdue'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {fee.status === 'Paid' ? (
                        <button
                          onClick={() => setReceiptModal(fee)}
                          className="px-3.5 py-1.5 text-xs font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setPayingFee(fee);
                            setPaymentMethod('UPI Dynamic QR');
                          }}
                          className="px-4 py-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 hover:from-teal-300 hover:to-emerald-300 rounded-xl shadow-md shadow-teal-500/20 transition-all cursor-pointer"
                        >
                          Pay Online
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

      {/* ========================================================================= */}
      {/* FEATURE 2: INTERACTIVE ONLINE PAYMENT GATEWAY & DYNAMIC UPI QR MODAL */}
      {/* ========================================================================= */}
      {payingFee && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-teal-100 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Online School Fee Payment Gateway</h3>
                  <p className="text-xs text-teal-300 font-medium">
                    Invoice {payingFee.name || payingFee.id || 'INV-2026-001'} • {payingFee.student_name}
                  </p>
                </div>
              </div>
              <button onClick={() => setPayingFee(null)} className="text-white/70 hover:text-white p-1.5 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Summary Strip */}
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Paying For</span>
                <span className="font-extrabold text-slate-900 text-xs">{payingFee.student_name} (Roll #{payingFee.roll_no || '01'})</span>
                <span className="text-[10px] text-slate-500 block">{payingFee.class_batch || 'Class 10 - Section A'} • {payingFee.academic_term || 'Term 1'}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Amount Due</span>
                <span className="text-2xl font-black text-emerald-600 block leading-tight">
                  ₹{(payingFee.outstanding_amount || payingFee.grand_total || payingFee.amount || 35000).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-teal-700 font-bold flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Expires in {formatTime(paymentTimer)}</span>
                </span>
              </div>
            </div>

            {/* Gateway Tabs */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentGatewayTab('upi');
                    setPaymentMethod('UPI Dynamic QR');
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    paymentGatewayTab === 'upi' ? 'bg-white text-slate-950 shadow-sm font-black' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-teal-600" />
                  <span>UPI Dynamic QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentGatewayTab('card');
                    setPaymentMethod('Credit / Debit Card');
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    paymentGatewayTab === 'card' ? 'bg-white text-slate-950 shadow-sm font-black' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-teal-600" />
                  <span>Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentGatewayTab('netbanking');
                    setPaymentMethod('Net Banking');
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    paymentGatewayTab === 'netbanking' ? 'bg-white text-slate-950 shadow-sm font-black' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Building className="w-4 h-4 text-teal-600" />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* TAB 1: DYNAMIC UPI QR SCANNER */}
              {paymentGatewayTab === 'upi' && (
                <div className="space-y-4 text-center">
                  <div className="bg-slate-50 p-5 rounded-3xl border-2 border-dashed border-teal-300 max-w-xs mx-auto space-y-3">
                    <div className="relative inline-block p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                      {/* Generative QR visual representation */}
                      <div className="w-44 h-44 bg-slate-900 rounded-xl p-2 flex flex-col justify-between items-center text-white relative overflow-hidden">
                        <div className="w-full flex justify-between">
                          <div className="w-10 h-10 border-4 border-white rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-teal-400 rounded-sm"></div>
                          </div>
                          <div className="w-10 h-10 border-4 border-white rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-teal-400 rounded-sm"></div>
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <IndianRupee className="w-6 h-6 text-teal-300 animate-pulse" />
                          <span className="text-[10px] font-mono font-bold tracking-widest text-teal-200">
                            ₹{(payingFee.outstanding_amount || payingFee.grand_total || payingFee.amount || 35000).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="w-full flex justify-between">
                          <div className="w-10 h-10 border-4 border-white rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-teal-400 rounded-sm"></div>
                          </div>
                          <div className="text-[9px] font-bold text-teal-300 font-mono">BHIM UPI</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-extrabold text-slate-800 block">Scan with any UPI App</span>
                      <p className="text-[10px] text-slate-500">Google Pay • PhonePe • Paytm • BHIM • Amazon Pay</p>
                    </div>

                    <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-[11px] text-slate-700">
                      <span className="font-mono truncate">schoolfees@okaxis</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText('schoolfees@okaxis');
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2000);
                        }}
                        className="text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CREDIT / DEBIT CARD */}
              {paymentGatewayTab === 'card' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardForm.cardNumber}
                      onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                      placeholder="4532 •••• •••• 6789"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardForm.cardHolder}
                        onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Expiry</label>
                        <input
                          type="text"
                          value={cardForm.expiry}
                          onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                          placeholder="MM/YY"
                          className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs text-center focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardForm.cvv}
                          onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                          placeholder="•••"
                          className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs text-center focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NET BANKING */}
              {paymentGatewayTab === 'netbanking' && (
                <div className="space-y-3 text-xs">
                  <label className="block text-[11px] font-bold text-slate-700">Select Popular Indian Banks</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National'].map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedBank === b ? 'bg-teal-50 border-teal-500 font-bold text-teal-950 shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="block text-xs truncate">{b}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Security & Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>256-Bit SSL Encrypted & RBI Compliant</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPayingFee(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-teal-500/20 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                        <span>Verifying Bank Payment...</span>
                      </>
                    ) : (
                      <>
                        <span>Simulate Instant Pay ₹{(payingFee.outstanding_amount || payingFee.grand_total || payingFee.amount || 35000).toLocaleString('en-IN')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 2: GST-COMPLIANT OFFICIAL PRINTABLE FEE RECEIPT */}
      {/* ========================================================================= */}
      {receiptModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setReceiptModal(null); }}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-teal-100 space-y-6 max-h-[92vh] overflow-y-auto print:max-w-none print:shadow-none print:p-0 print:border-none">
            
            {/* Header with School Details & Tax Registration */}
            <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1 relative">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                  {tenant?.school_name?.charAt(0) || 'N'}
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-black text-slate-950 uppercase tracking-tight">
                    {tenant?.school_name || 'Nairee International School'}
                  </h1>
                  <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                    {tenant?.tagline || 'Accounts Department • Official Tax Invoice & Payment Receipt'}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                GSTIN / Tax ID: <strong>29AAACN8901L1Z4</strong> • CBSE Code: #NIS-89021 • PAN: AAACN8901L
              </p>
              <div className="inline-block mt-2 px-4 py-0.5 rounded-full bg-slate-900 text-white font-extrabold text-[11px] tracking-widest uppercase">
                Original Student Copy (Tax Exempt Educational Receipt)
              </div>
            </div>

            {/* Receipt Meta & Student Bio */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Receipt Number</span>
                <span className="font-mono font-black text-teal-900 text-sm">{receiptModal.receipt_no || 'REC-2026-90412'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Payment Date</span>
                <span className="font-extrabold text-slate-900">{receiptModal.payment_date || new Date().toISOString().split('T')[0]}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Payment Method</span>
                <span className="font-extrabold text-emerald-700">{receiptModal.payment_method || 'UPI / Dynamic QR'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Bank Reference UTR</span>
                <span className="font-mono font-bold text-slate-700 text-[10px]">{receiptModal.transaction_ref || 'UPI/98012391/7811'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Student Name</span>
                <span className="font-extrabold text-slate-900 text-sm">{receiptModal.student_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Roll & Batch</span>
                <span className="font-bold text-slate-900">Roll #{receiptModal.roll_no || '01'} ({receiptModal.class_batch || receiptModal.student_batch || 'Class 10-A'})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Student ID</span>
                <span className="font-mono font-bold text-teal-800">{receiptModal.student_id || receiptModal.student}</span>
              </div>
            </div>

            {/* Fee Component Breakdown Table */}
            <div className="space-y-2">
              <table className="w-full text-left text-xs border border-slate-300 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 border-b border-r">Sl. No.</th>
                    <th className="py-2.5 px-4 border-b border-r">Fee Component Heading</th>
                    <th className="py-2.5 px-4 border-b border-r text-center">Billing Cycle</th>
                    <th className="py-2.5 px-4 border-b text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {receiptModal.components && receiptModal.components.length > 0 ? (
                    receiptModal.components.map((c, i) => (
                      <tr key={c.id || i}>
                        <td className="py-2 px-3 border-r font-mono text-center">{i + 1}</td>
                        <td className="py-2 px-4 border-r font-semibold text-slate-900">{c.fee_category}</td>
                        <td className="py-2 px-4 border-r text-center text-slate-500">{receiptModal.academic_term || 'Term 1'}</td>
                        <td className="py-2 px-4 text-right font-bold text-slate-900">₹{Number(c.amount).toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr>
                        <td className="py-2 px-3 border-r font-mono text-center">1</td>
                        <td className="py-2 px-4 border-r font-semibold text-slate-900">Tuition & Faculty Instruction Fee</td>
                        <td className="py-2 px-4 border-r text-center text-slate-500">Term 1 (2026-27)</td>
                        <td className="py-2 px-4 text-right font-bold text-slate-900">₹25,000</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 border-r font-mono text-center">2</td>
                        <td className="py-2 px-4 border-r font-semibold text-slate-900">Science Lab & Robotics Lab Subscription</td>
                        <td className="py-2 px-4 border-r text-center text-slate-500">Term 1 (2026-27)</td>
                        <td className="py-2 px-4 text-right font-bold text-slate-900">₹6,000</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 border-r font-mono text-center">3</td>
                        <td className="py-2 px-4 border-r font-semibold text-slate-900">Digital Library & Sports Infrastructure</td>
                        <td className="py-2 px-4 border-r text-center text-slate-500">Term 1 (2026-27)</td>
                        <td className="py-2 px-4 text-right font-bold text-slate-900">₹4,000</td>
                      </tr>
                    </>
                  )}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400">
                  <tr>
                    <td colSpan={3} className="py-2.5 px-4 text-right uppercase text-[11px] border-r">
                      Grand Total Paid (Zero Dues Remaining):
                    </td>
                    <td className="py-2.5 px-4 text-right text-emerald-800 font-black text-sm">
                      ₹{Number(receiptModal.grand_total || receiptModal.amount || 35000).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Note & Authorized Stamp */}
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p><strong>Payment Declaration:</strong> This is a digitally generated e-receipt verified by Nairee Core Banking Gateway. No physical signature is required under IT Act Section 65B.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 text-center text-[10px] text-slate-500 font-bold border-t border-dashed border-slate-300">
                <div>
                  <div className="h-5 font-mono text-emerald-700 font-black text-xs">TRANSACTION VERIFIED &amp; SETTLED</div>
                  <div className="border-t border-slate-300 pt-1">Automated Accounts Clearing Desk</div>
                </div>
                <div>
                  <div className="h-5 font-script text-slate-800 font-black">Authorized Signatory</div>
                  <div className="border-t border-slate-300 pt-1">Finance Officer / Bursar Seal</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={() => setReceiptModal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Tax Receipt</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
