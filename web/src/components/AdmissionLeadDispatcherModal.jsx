import React, { useState, useEffect } from 'react';
import {
  Send,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  MessageCircle,
  Phone,
  User,
  Users,
  GraduationCap,
  Calendar,
  Clock,
  X,
  Share2,
  AlertCircle,
  RefreshCw,
  Search,
  Eye,
  FileText
} from 'lucide-react';
import { useTenant } from '../context/TenantContext.jsx';
import { api, subscribeLiveEvents } from '../api.js';

export default function AdmissionLeadDispatcherModal({ isOpen, onClose, defaultClass = 'Class 10 - Section A', onLeadCreated }) {
  const { tenant } = useTenant();
  
  const [formData, setFormData] = useState({
    student_name: '',
    age: '14 Years',
    dob: '2012-05-15',
    target_class: defaultClass,
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    stream: 'Science & Advanced Mathematics',
    remarks: 'Walk-in / Phone inquiry'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchedResult, setDispatchedResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [recentLeads, setRecentLeads] = useState([]);
  const [activeTab, setActiveTab] = useState('dispatch'); // 'dispatch' | 'roster'
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadLeads = async () => {
    try {
      const currentTenantId = tenant?.tenant_id || 'tenant-default';
      const data = await api.getAdmissionApplications(currentTenantId);
      setRecentLeads(data || []);
    } catch (err) {
      console.warn('Failed to load admission leads:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLeads();
    }
  }, [isOpen, tenant]);

  useEffect(() => {
    const unsub = subscribeLiveEvents((event) => {
      if (
        event?.type === 'admission_lead_dispatched' || 
        event?.type === 'student_registered' || 
        event?.type === 'student_enrolled' ||
        event?.type === 'db_store_updated'
      ) {
        loadLeads();
      }
    });
    return () => unsub();
  }, [tenant]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'dob' && value) {
        try {
          const birthDate = new Date(value);
          const diffMs = Date.now() - birthDate.getTime();
          const ageDt = new Date(diffMs);
          const calculatedAge = Math.abs(ageDt.getUTCFullYear() - 1970);
          if (!isNaN(calculatedAge) && calculatedAge > 0) {
            updated.age = `${calculatedAge} Years`;
          }
        } catch {}
      }
      return updated;
    });
  };

  const handleDispatch = async (e) => {
    e?.preventDefault();
    if (!formData.student_name.trim()) {
      showToast('Please enter the student / child name');
      return;
    }
    if (!formData.guardian_phone.trim()) {
      showToast('Please enter parent mobile / WhatsApp number');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.dispatchAdmissionLead({
        ...formData,
        tenant_id: tenant?.tenant_id || 'tenant-default',
        school_name: tenant?.school_name || 'Nairee International School',
        dispatched_by: 'Tutor / Admissions Desk'
      });

      setDispatchedResult(res);
      showToast('Admission form link generated! Opening WhatsApp...');
      
      // Auto open WhatsApp in new tab
      if (res.whatsappUrl) {
        window.open(res.whatsappUrl, '_blank');
      }

      loadLeads();
      if (onLeadCreated) onLeadCreated(res.lead);
    } catch (err) {
      showToast(err.message || 'Failed to dispatch admission link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveEnroll = async (appId) => {
    try {
      await api.approveAndEnrollStudent(appId);
      showToast(`Application #${appId} officially enrolled into active class roster!`);
      loadLeads();
    } catch (err) {
      showToast('Failed to approve application');
    }
  };

  const filteredLeads = recentLeads.filter(lead => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (lead.student_name || '').toLowerCase().includes(q) ||
      (lead.guardian_name || '').toLowerCase().includes(q) ||
      (lead.target_class || '').toLowerCase().includes(q) ||
      (lead.application_id || '').toLowerCase().includes(q)
    );
  });

  const schoolName = tenant?.school_name || 'Nairee International School';

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn font-sans"
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c1f2c] border border-teal-500/60 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-teal-100 max-h-[92vh] overflow-y-auto space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">
                Admission Quick-Lead &amp; WhatsApp Form Dispatcher
              </h3>
              <p className="text-xs text-slate-500">
                1-Click personalized admission link generator for students &amp; parents
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: [Dispatch New Lead | Live Leads Roster] */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('dispatch'); setDispatchedResult(null); }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'dispatch' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            + Dispatch Admission Link
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'roster' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Live Leads &amp; Applications</span>
            <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
              {recentLeads.length}
            </span>
          </button>
        </div>

        {/* TAB 1: DISPATCH NEW ADMISSION LEAD */}
        {activeTab === 'dispatch' && (
          <>
            {dispatchedResult ? (
              /* Success / Dispatched Card with WhatsApp Link & Direct Copy */
              <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200 space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                      Link Dispatched Successfully
                    </span>
                    <h4 className="text-base font-black text-slate-900 mt-0.5">
                      Admission Form Sent for {dispatchedResult.lead?.student_name}
                    </h4>
                    <p className="text-xs text-slate-600">
                      Application ID: <code className="font-bold text-emerald-800 font-mono">{dispatchedResult.lead?.application_id}</code>
                    </p>
                  </div>
                </div>

                {/* Direct Link Share Box */}
                <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-700 block">Unique Pre-filled Form URL:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={dispatchedResult.directLink}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(dispatchedResult.directLink);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 3000);
                        showToast('Direct admission link copied to clipboard!');
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-transform active:scale-95 cursor-pointer shadow-sm"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* WhatsApp & SMS Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={dispatchedResult.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-transform hover:scale-[1.02] cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-slate-950 stroke-white" />
                    <span>Open WhatsApp Message</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(dispatchedResult.whatsappText);
                      setCopiedText(true);
                      setTimeout(() => setCopiedText(false), 3000);
                      showToast('SMS / Text invitation message copied!');
                    }}
                    className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
                  >
                    {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedText ? 'Copied SMS Text' : 'Copy SMS Message'}</span>
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-emerald-200/80 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        student_name: '',
                        age: '14 Years',
                        dob: '2012-05-15',
                        target_class: defaultClass,
                        guardian_name: '',
                        guardian_phone: '',
                        guardian_email: '',
                        stream: 'Science & Advanced Mathematics',
                        remarks: 'Walk-in / Phone inquiry'
                      });
                      setDispatchedResult(null);
                    }}
                    className="text-emerald-800 font-bold hover:underline cursor-pointer"
                  >
                    + Dispatch Another Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('roster')}
                    className="text-slate-600 font-bold hover:text-slate-900 cursor-pointer"
                  >
                    View All Leads Roster →
                  </button>
                </div>
              </div>
            ) : (
              /* Quick Form for Tutor / Admission Officer */
              <form onSubmit={handleDispatch} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-center gap-3 text-xs text-teal-900">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>
                    Enter candidate student details below. Clicking the <strong>Green Button</strong> will generate a direct admission link and drop the WhatsApp message to the parent's phone.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Student Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Student / Kid Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={formData.student_name}
                      onChange={(e) => handleInputChange('student_name', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleInputChange('dob', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Age (or Auto-calculated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 14 Years"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                    />
                  </div>

                  {/* Desired Admission Class */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Class Seeking Admission In <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.target_class}
                      onChange={(e) => handleInputChange('target_class', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-teal-900 bg-teal-50/40 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Class 10 - Section A">Class 10 - Section A</option>
                      <option value="Class 10 - Section B">Class 10 - Section B</option>
                      <option value="Class 11 - Section A">Class 11 - Section A</option>
                      <option value="Class 12 - Section A">Class 12 - Section A</option>
                      <option value="Class 9 - Section A">Class 9 - Section A</option>
                      <option value="Class 8 - Section A">Class 8 - Section A</option>
                      <option value="Class 7 - Section A">Class 7 - Section A</option>
                      <option value="Class 6 - Section A">Class 6 - Section A</option>
                      <option value="Class 5 - Section A">Class 5 - Section A</option>
                      <option value="Class 4 - Section A">Class 4 - Section A</option>
                      <option value="Class 3 - Section A">Class 3 - Section A</option>
                      <option value="Class 2 - Section A">Class 2 - Section A</option>
                      <option value="Class 1 - Section A">Class 1 - Section A</option>
                      <option value="UKG - Section A">UKG</option>
                      <option value="LKG - Section A">LKG</option>
                      <option value="Nursery - Section A">Nursery</option>
                    </select>
                  </div>

                  {/* Parent / Guardian Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Parent / Guardian Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mr. Sunil Sharma"
                      value={formData.guardian_name}
                      onChange={(e) => handleInputChange('guardian_name', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                    />
                  </div>

                  {/* Parent Mobile / WhatsApp Number */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Parent WhatsApp / Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98765 43210"
                        value={formData.guardian_phone}
                        onChange={(e) => handleInputChange('guardian_phone', e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <MessageCircle className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>

                {/* PROMINENT GREEN BUTTON (Requested by User) */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black text-sm flex items-center justify-center space-x-2.5 shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <MessageCircle className="w-5 h-5 fill-slate-950 stroke-white" />
                    <span>
                      {isSubmitting ? 'Generating & Dispatching...' : '📲 Send Admission Form Link to Parent (WhatsApp)'}
                    </span>
                  </button>
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    Generates a pre-filled admission link and opens WhatsApp directly to parent contact.
                  </p>
                </div>
              </form>
            )}
          </>
        )}

        {/* TAB 2: LIVE LEADS & APPLICATIONS ROSTER */}
        {activeTab === 'roster' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by student, parent, or class..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <button
                type="button"
                onClick={loadLeads}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                title="Refresh Roster"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3.5">Candidate / Student</th>
                    <th className="py-3 px-3.5">Class Seeking</th>
                    <th className="py-3 px-3.5">Parent Contact</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-xs text-slate-400">
                        No admission leads found. Dispatch a new link to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.application_id} className="hover:bg-teal-50/20 transition-colors">
                        <td className="py-3 px-3.5">
                          <div className="font-bold text-slate-800">{lead.student_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {lead.application_id} &bull; Age: {lead.age || '14 Y'}
                          </div>
                        </td>

                        <td className="py-3 px-3.5 font-semibold text-slate-700">
                          {lead.target_class}
                        </td>

                        <td className="py-3 px-3.5">
                          <div className="font-semibold text-slate-800">{lead.guardian_name || 'Parent'}</div>
                          <div className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{lead.guardian_phone || '—'}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            lead.status === 'Enrolled & Approved' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : lead.status === 'Submitted by Parent'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {lead.status === 'Enrolled & Approved' ? '● Enrolled' : lead.status === 'Submitted by Parent' ? '✓ Form Filled' : '📲 Link Sent'}
                          </span>
                        </td>

                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {lead.status !== 'Enrolled & Approved' && (
                              <button
                                type="button"
                                onClick={() => handleApproveEnroll(lead.application_id)}
                                className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px] transition-colors cursor-pointer"
                              >
                                Approve &amp; Enroll
                              </button>
                            )}

                            {lead.guardian_phone && (
                              <a
                                href={`https://wa.me/${(lead.guardian_phone || '').replace(/\D/g, '')}?text=Dear%20${encodeURIComponent(lead.guardian_name || 'Parent')},%20Greetings%20from%20${encodeURIComponent(schoolName)}.%20Please%20complete%20the%20admission%20form%20for%20${encodeURIComponent(lead.student_name)}.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                                title="Resend WhatsApp Message"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
