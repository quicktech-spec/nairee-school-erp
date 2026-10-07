import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Calendar,
  User,
  Users,
  Phone,
  Mail,
  MapPin,
  Bus,
  FileText,
  ShieldCheck,
  QrCode,
  Printer,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  School,
  Copy,
  Check,
  Download,
  Building2,
  AlertCircle,
  Clock,
  IdCard,
  Upload,
  Scroll
} from 'lucide-react';
import { useTenant } from '../context/TenantContext.jsx';
import { api } from '../api.js';
import naireeLogo from '../assets/nairee-logo.png';

export default function OnlineAdmissionView({ initialData = {}, onBackToLogin, onApplicationSubmitted }) {
  const { tenant } = useTenant();

  // Read URL query params if any
  const [paramsData, setParamsData] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return {
        appId: urlParams.get('appId') || '',
        name: urlParams.get('name') || '',
        age: urlParams.get('age') || '',
        dob: urlParams.get('dob') || '',
        targetClass: urlParams.get('class') || '',
        parent: urlParams.get('parent') || '',
        phone: urlParams.get('phone') || '',
        tenant: urlParams.get('tenant') || ''
      };
    }
    return {};
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    application_id: paramsData.appId || initialData.application_id || `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    student_name: paramsData.name || initialData.student_name || '',
    age: paramsData.age || initialData.age || '14 Years',
    dob: paramsData.dob || initialData.dob || '2012-04-15',
    gender: initialData.gender || 'Male',
    blood_group: initialData.blood_group || 'O+',
    aadhaar_no: initialData.aadhaar_no || '',
    religion: initialData.religion || 'General',
    nationality: initialData.nationality || 'Indian',
    caste_category: initialData.caste_category || 'General / Unreserved',
    photo: initialData.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',

    // Academic & Previous School
    target_class: paramsData.targetClass || initialData.target_class || 'Class 10 - Section A',
    stream: initialData.stream || 'Science & Advanced Mathematics',
    previous_school: initialData.previous_school || '',
    previous_class_passed: initialData.previous_class_passed || 'Class 9',
    previous_marks_percentage: initialData.previous_marks_percentage || '92%',
    tc_available: initialData.tc_available || 'Yes (Issued)',

    // Parents & Guardian
    father_name: paramsData.parent || initialData.father_name || '',
    father_occupation: initialData.father_occupation || 'Business / Corporate',
    father_phone: paramsData.phone || initialData.father_phone || '',
    father_email: initialData.father_email || '',
    mother_name: initialData.mother_name || '',
    mother_occupation: initialData.mother_occupation || 'Professional / Homemaker',
    mother_phone: initialData.mother_phone || '',
    emergency_contact_person: initialData.emergency_contact_person || '',
    emergency_contact_phone: initialData.emergency_contact_phone || '',

    // Residential & Transport
    residential_address: initialData.residential_address || '',
    city: initialData.city || 'Bengaluru',
    state: initialData.state || 'Karnataka',
    pincode: initialData.pincode || '560038',
    bus_required: initialData.bus_required || 'No',
    bus_route: initialData.bus_route || 'Route 14 (Green Valley to Campus)'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-calculate age if DOB changes
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

  const handleNext = (e) => {
    e?.preventDefault();
    if (currentStep === 1) {
      if (!formData.student_name.trim()) {
        showToast('Please enter the student / child full name');
        return;
      }
      if (!formData.dob) {
        showToast('Please select the date of birth');
        return;
      }
    }
    if (currentStep === 3) {
      if (!formData.father_name.trim() && !formData.mother_name.trim()) {
        showToast('Please provide at least one parent or guardian name');
        return;
      }
      if (!formData.father_phone.trim() && !formData.mother_phone.trim()) {
        showToast('Please provide a parent contact mobile number');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.submitAdmissionApplication({
        ...formData,
        tenant_id: tenant?.tenant_id || 'tenant-default'
      });
      setSubmissionResult(res);
      showToast('Admission application submitted successfully!');
      if (onApplicationSubmitted) onApplicationSubmitted(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      showToast(err.message || 'Failed to submit admission application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const primaryColor = tenant?.primary_color || '#00a884';
  const schoolName = tenant?.school_name || 'Nairee International School';
  const affiliation = tenant?.board_affiliation || 'CBSE Affiliated #1930481';
  const schoolPhone = tenant?.phone || '+91 98765 00000';
  const schoolEmail = tenant?.email || 'admissions@nairee.edu';

  return (
    <div className="min-h-screen bg-[#f0f4f9] py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c1f2c] border border-teal-500/60 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header Card with School Branding */}
        <header className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 right-0 h-2.5"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <img
                src={tenant?.logo_url || naireeLogo}
                alt={schoolName}
                className="w-16 h-16 object-contain rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xs shrink-0"
                onError={(e) => { e.target.src = naireeLogo; }}
              />
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Official Online Admission &amp; Student Self-Registration Portal</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {schoolName}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {affiliation} &bull; Academic Session 2026-27 Admissions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
              {onBackToLogin && (
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  ← Return to Login
                </button>
              )}
              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Admissions Desk</span>
                <span className="text-xs font-mono font-bold text-slate-700">{schoolPhone}</span>
              </div>
            </div>
          </div>
        </header>

        {/* If Application is Submitted Successfully -> Display Official Acknowledgment Slip */}
        {submissionResult ? (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200 shadow-xl space-y-8 animate-fadeIn">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Admission Application Submitted!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Thank you, <strong>{submissionResult.student?.name}</strong>. Your official admission application has been registered into the school's central ERP database.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white font-mono text-xs font-bold">
                <span>Application ID:</span>
                <span className="text-emerald-400">{submissionResult.application_id}</span>
              </div>
            </div>

            {/* Official Admission Slip Card */}
            <div className="border-2 border-dashed border-slate-300 rounded-3xl p-6 sm:p-8 bg-slate-50/70 space-y-6 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h3 className="text-base font-black text-slate-900">{schoolName}</h3>
                  <p className="text-xs text-slate-500">Provisional Student Enrollment Acknowledgment</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                    ● PROVISIONALLY ENROLLED
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Student ID</span>
                  <p className="font-mono font-black text-sm text-teal-700 mt-0.5">{submissionResult.student_id}</p>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Candidate Name</span>
                  <p className="font-bold text-sm text-slate-800 mt-0.5">{submissionResult.student?.name}</p>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Class</span>
                  <p className="font-bold text-sm text-slate-800 mt-0.5">{submissionResult.student?.class_batch}</p>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Roll Number</span>
                  <p className="font-mono font-black text-sm text-slate-800 mt-0.5">#{submissionResult.student?.roll_no}</p>
                </div>
              </div>

              {/* Login Credentials Box */}
              {submissionResult.credentials && (
                <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl p-5 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                      <IdCard className="w-4 h-4" />
                      <span>Instant Portal Access Credentials</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const txt = `Nairee School ERP Login Credentials:\nStudent: ${submissionResult.credentials.student.username} (Pass: ${submissionResult.credentials.student.password})\nParent: ${submissionResult.credentials.parent.username} (Pass: ${submissionResult.credentials.parent.password})`;
                        navigator.clipboard?.writeText(txt);
                        setCopiedCreds(true);
                        setTimeout(() => setCopiedCreds(false), 3000);
                        showToast('Credentials copied to clipboard!');
                      }}
                      className="px-3 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedCreds ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCreds ? 'Copied' : 'Copy Credentials'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Student Login</span>
                      <div className="font-mono mt-1">Username: <strong className="text-teal-300">{submissionResult.credentials.student.username}</strong></div>
                      <div className="font-mono text-slate-300">Password: {submissionResult.credentials.student.password}</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Parent Login</span>
                      <div className="font-mono mt-1">Username: <strong className="text-teal-300">{submissionResult.credentials.parent.username}</strong></div>
                      <div className="font-mono text-slate-300">Password: {submissionResult.credentials.parent.password}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-slate-500">
                <div>
                  <span>Submission Date: <strong>{new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-md"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Admission Slip</span>
                  </button>
                  {onBackToLogin && (
                    <button
                      type="button"
                      onClick={onBackToLogin}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-md"
                    >
                      <span>Proceed to ERP Login →</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Multi-Step Admission Form */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-8">
            {/* Step Progression Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span className={currentStep >= 1 ? 'text-teal-700 font-black' : ''}>1. Student Details</span>
                <span className={currentStep >= 2 ? 'text-teal-700 font-black' : ''}>2. Academic &amp; Previous School</span>
                <span className={currentStep >= 3 ? 'text-teal-700 font-black' : ''}>3. Parents / Guardian</span>
                <span className={currentStep >= 4 ? 'text-teal-700 font-black' : ''}>4. Address &amp; Transport</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>

            <form onSubmit={currentStep === 4 ? handleSubmit : handleNext} className="space-y-6">
              
              {/* STEP 1: STUDENT PERSONAL DETAILS */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-teal-600" />
                      <span>Step 1: Student Demographics &amp; Identity</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Enter official student details as per birth certificate / Aadhaar card.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Student Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aarav Sharma"
                        value={formData.student_name}
                        onChange={(e) => handleInputChange('student_name', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Date of Birth <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dob}
                        onChange={(e) => handleInputChange('dob', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Calculated Age
                      </label>
                      <input
                        type="text"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50"
                        placeholder="e.g. 14 Years"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                      <select
                        value={formData.blood_group}
                        onChange={(e) => handleInputChange('blood_group', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Aadhaar / National ID No</label>
                      <input
                        type="text"
                        placeholder="e.g. 9876 5432 1099"
                        value={formData.aadhaar_no}
                        onChange={(e) => handleInputChange('aadhaar_no', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Category / Religion</label>
                      <select
                        value={formData.religion}
                        onChange={(e) => handleInputChange('religion', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="General">General / Unreserved</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="EWS">EWS</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: ACADEMIC PROGRAM & PREVIOUS SCHOOL */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-teal-600" />
                      <span>Step 2: Admission Grade &amp; Academic Background</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Select target class batch and previous school education credentials.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Class / Grade Applying For <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.target_class}
                        onChange={(e) => handleInputChange('target_class', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-teal-900 bg-teal-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="Class 10 - Section A">Class 10 - Section A</option>
                        <option value="Class 10 - Section B">Class 10 - Section B</option>
                        <option value="Class 11 - Section A">Class 11 - Section A (Senior Secondary)</option>
                        <option value="Class 12 - Section A">Class 12 - Section A</option>
                        <option value="Class 9 - Section A">Class 9 - Section A</option>
                        <option value="Class 8 - Section A">Class 8 - Section A</option>
                        <option value="Class 7 - Section A">Class 7 - Section A</option>
                        <option value="Class 6 - Section A">Class 6 - Section A</option>
                        <option value="Class 5 - Section A">Class 5 - Section A</option>
                        <option value="Class 4 - Section A">Class 4 - Section A</option>
                        <option value="Class 3 - Section A">Class 3 - Section A</option>
                        <option value="Class 2 - Section A">Class 2 - Section A</option>
                        <option value="Class 1 - Section A">Class 1 - Section A (Primary)</option>
                        <option value="UKG - Section A">UKG (Kindergarten)</option>
                        <option value="LKG - Section A">LKG</option>
                        <option value="Nursery - Section A">Nursery</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Academic Stream / Electives
                      </label>
                      <select
                        value={formData.stream}
                        onChange={(e) => handleInputChange('stream', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="Science & Advanced Mathematics">Science (Physics, Chem, Advanced Maths, AI)</option>
                        <option value="Science & Biology (Pre-Med)">Science &amp; Biology (Physics, Chem, Biology, Bio-Tech)</option>
                        <option value="Commerce & Financial Analytics">Commerce (Accounts, Business, Economics, Applied Maths)</option>
                        <option value="Humanities & Social Sciences">Humanities (History, Pol Sci, Psychology, Literature)</option>
                        <option value="General Foundational Curriculum">General Comprehensive School Curriculum</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Previous School Attended (If any)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. St. Joseph Senior Academy / Bishop Cotton"
                        value={formData.previous_school}
                        onChange={(e) => handleInputChange('previous_school', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Last Class Passed</label>
                      <input
                        type="text"
                        placeholder="e.g. Class 9 (CBSE / ICSE)"
                        value={formData.previous_class_passed}
                        onChange={(e) => handleInputChange('previous_class_passed', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Transfer Certificate (TC) Status</label>
                      <select
                        value={formData.tc_available}
                        onChange={(e) => handleInputChange('tc_available', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                      >
                        <option value="Yes (Issued & Ready)">Yes (Issued &amp; Ready)</option>
                        <option value="Applied (Awaiting from School)">Applied (Awaiting from Previous School)</option>
                        <option value="Not Applicable (First Admission)">Not Applicable (First Admission)</option>
                      </select>
                    </div>

                    {/* Official Document & Certificate Attachments */}
                    <div className="sm:col-span-2 pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-center gap-2">
                        <Scroll className="w-4 h-4 text-teal-600" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Attach Required Certificates &amp; Documents
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-2xl border border-dashed border-teal-300 bg-teal-50/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-teal-950">1. Transfer Certificate (TC)</span>
                            <span className="text-[10px] text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full font-semibold">PDF / Image</span>
                          </div>
                          <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-50 transition-colors cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Previous School TC</span>
                            <input type="file" accept=".pdf,image/*" className="hidden" />
                          </label>
                        </div>

                        <div className="p-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">2. Previous Class Marksheet</span>
                            <span className="text-[10px] text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full font-semibold">PDF / Image</span>
                          </div>
                          <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Report Card / Marksheet</span>
                            <input type="file" accept=".pdf,image/*" className="hidden" />
                          </label>
                        </div>

                        <div className="p-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">3. Birth / Domicile Certificate</span>
                            <span className="text-[10px] text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full font-semibold">Mandatory</span>
                          </div>
                          <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Birth Certificate</span>
                            <input type="file" accept=".pdf,image/*" className="hidden" />
                          </label>
                        </div>

                        <div className="p-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">4. Migration / Character Cert</span>
                            <span className="text-[10px] text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full font-semibold">Optional</span>
                          </div>
                          <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Migration / Character Cert</span>
                            <input type="file" accept=".pdf,image/*" className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PARENTS & GUARDIANS */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-teal-600" />
                      <span>Step 3: Parents &amp; Guardian Contact Information</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Primary contacts for fee receipts, emergency circulars, and teacher communication.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Father's Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajesh Patel"
                        value={formData.father_name}
                        onChange={(e) => handleInputChange('father_name', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Father's Mobile / WhatsApp Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98765 43212"
                        value={formData.father_phone}
                        onChange={(e) => handleInputChange('father_phone', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Father's Occupation</label>
                      <input
                        type="text"
                        placeholder="e.g. Software Architect / Business Director"
                        value={formData.father_occupation}
                        onChange={(e) => handleInputChange('father_occupation', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Father's Email</label>
                      <input
                        type="email"
                        placeholder="e.g. rpatel@example.com"
                        value={formData.father_email}
                        onChange={(e) => handleInputChange('father_email', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                      />
                    </div>

                    <div className="sm:col-span-2 border-t border-slate-100 pt-3">
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">Mother's Details</h4>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mother's Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Meera Patel"
                        value={formData.mother_name}
                        onChange={(e) => handleInputChange('mother_name', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mother's Contact Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 98765 43213"
                        value={formData.mother_phone}
                        onChange={(e) => handleInputChange('mother_phone', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: RESIDENTIAL ADDRESS & BUS TRANSPORT */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-teal-600" />
                      <span>Step 4: Residential Address &amp; Transport Logistics</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Official address for postal correspondence and GPS school bus routing.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Residential Street Address <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. Flat 402, Green Meadows Residency, 100ft Indiranagar Road"
                        value={formData.residential_address}
                        onChange={(e) => handleInputChange('residential_address', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">PIN / Postal Code</label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Require School Bus Transport?</label>
                      <select
                        value={formData.bus_required}
                        onChange={(e) => handleInputChange('bus_required', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                      >
                        <option value="No">No (Self Transport / Parent Drop)</option>
                        <option value="Yes">Yes (School Bus Pick-up & Drop)</option>
                      </select>
                    </div>

                    {formData.bus_required === 'Yes' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Bus Route / Stop</label>
                        <select
                          value={formData.bus_route}
                          onChange={(e) => handleInputChange('bus_route', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                        >
                          <option value="Route 14 (Green Valley to Campus)">Route 14 (Green Valley to Campus)</option>
                          <option value="Route 08 (Dhurwa & Sail Township)">Route 08 (Dhurwa &amp; Sail Township)</option>
                          <option value="Route 02 (Indiranagar & Koramangala)">Route 02 (Indiranagar &amp; Koramangala)</option>
                          <option value="Route 05 (Whitefield & ITPL Main)">Route 05 (Whitefield &amp; ITPL Main)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Declaration Acceptance */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer font-medium">
                      <input type="checkbox" defaultChecked required className="mt-0.5 rounded text-teal-600 focus:ring-teal-500" />
                      <span>
                        I hereby certify that all information submitted in this application is accurate and true to the best of my knowledge. I consent to school terms and code of conduct.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous Step</span>
                  </button>
                ) : <div />}

                {currentStep < 4 ? (
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-teal-600/20 transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>Continue to Step {currentStep + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Registering Student Application...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Submit Admission Application →</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
