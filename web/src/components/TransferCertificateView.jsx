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
  Barcode,
  Palette,
  Settings2,
  Upload,
  RefreshCw,
  Stamp,
  Sliders,
  Check,
  Trophy,
  Medal,
  Star
} from 'lucide-react';
import { FALLBACK_STUDENTS } from '../fallbackData.js';
import { getMasterStudents, subscribeLiveEvents, generateStudentId } from '../api.js';
import { useTenant } from '../context/TenantContext.jsx';

// Utility: Convert number to English words
function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
  return String(num);
}

// Utility: Convert standard Date string (YYYY-MM-DD) to full English words (e.g. "Twelfth of April Two Thousand Eleven")
function dateToWords(dateStr) {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  if (isNaN(year) || isNaN(monthIdx) || isNaN(day)) return dateStr;

  const dayOrdinals = [
    '', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth',
    'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth',
    'Twenty-First', 'Twenty-Second', 'Twenty-Third', 'Twenty-Fourth', 'Twenty-Fifth', 'Twenty-Sixth', 'Twenty-Seventh', 'Twenty-Eighth', 'Twenty-Ninth', 'Thirtieth', 'Thirty-First'
  ];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayWord = dayOrdinals[day] || String(day);
  const monthWord = months[monthIdx] || '';
  const yearWord = numberToWords(year);
  
  return `${dayWord} of ${monthWord} ${yearWord}`;
}

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
      religion: s.religion || 'General',
      caste_category: s.caste_category || 'General / Unreserved',
      nationality: s.nationality || 'Indian',
      blood_group: s.blood_group || 'O+',
      gender: s.gender || 'Male',
      aadhaar_no: s.aadhaar_no || '9876 5432 1091',
      admission_date: s.admission_date || '2024-06-15',
      admission_class: s.admission_class || 'Class 9',
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
  const { tenant } = useTenant();
  
  // Document Type: 'tc', 'appreciation', 'participation', 'domicile', 'migration', 'report_card', 'admit_card', 'id_card'
  const [docType, setDocType] = useState('tc');
  
  // 7 Transfer Certificate Templates
  // 'sunrise_chevron' | 'royal_gold' | 'cbse_statutory' | 'traditional_heritage' | 'vintage_crimson' | 'classic_ivory' | 'modern_platinum'
  const [tcTemplate, setTcTemplate] = useState('sunrise_chevron');

  // Appreciation / Merit Templates
  // 'imperial_arch' | 'modern_teal_geometric' | 'royal_gold_merit'
  const [appreciationTemplate, setAppreciationTemplate] = useState('imperial_arch');
  
  const [studentList, setStudentList] = useState(() => getSynchronizedStudents());
  const [selectedStudentId, setSelectedStudentId] = useState(() => {
    const list = getSynchronizedStudents();
    return list[0]?.id || 'NIS-2024-091-001';
  });
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'all'
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  
  // School Branding & Customizer State (Initialized from active school tenant, fully customizable)
  const [schoolInfo, setSchoolInfo] = useState({
    schoolName: tenant?.school_name || 'International Model Academy',
    motto: tenant?.tagline || 'Learn • Grow • Lead',
    affiliationNo: tenant?.board_affiliation ? tenant.board_affiliation.replace(/[^0-9]/g, '') || '123456' : '123456',
    schoolCode: tenant?.school_code || '654321',
    udiseNo: '29280601244',
    bookNo: '042',
    address: tenant?.address || '100 Knowledge Boulevard, Indiranagar, Bengaluru - 560038',
    phone: tenant?.phone || '+91 98765 00000',
    email: tenant?.email || 'principal@school.edu',
    principalName: 'Dr. Marcus Vance, Ph.D.',
    principalTitle: 'Principal / Head of Institution',
    customLogoUrl: tenant?.logo_url || '',
    watermarkText: 'OFFICIAL SCHOOL RECORD'
  });

  // Keep schoolInfo in sync when active tenant changes
  useEffect(() => {
    if (tenant) {
      setSchoolInfo(prev => ({
        ...prev,
        schoolName: tenant.school_name || prev.schoolName,
        motto: tenant.tagline || prev.motto,
        affiliationNo: tenant.board_affiliation ? tenant.board_affiliation.replace(/[^0-9]/g, '') || prev.affiliationNo : prev.affiliationNo,
        schoolCode: tenant.school_code || prev.schoolCode,
        address: tenant.address || prev.address,
        phone: tenant.phone || prev.phone,
        email: tenant.email || prev.email,
        customLogoUrl: tenant.logo_url || prev.customLogoUrl
      }));
    }
  }, [tenant]);

  // Customizable Document Parameters
  const [academicSession, setAcademicSession] = useState('2025 - 2026');
  const [examName, setExamName] = useState('All India Secondary School Examination (AISSE 2026)');
  const [examResult, setExamResult] = useState('Passed with First Class & Distinction (94.2%)');
  const [conduct, setConduct] = useState('Exemplary, Diligent & Obedient');
  const [reasonForLeaving, setReasonForLeaving] = useState('Parent Transfer / Higher Secondary Admission');
  const [promotedTo, setPromotedTo] = useState('Promoted to Senior Secondary Grade 11 (Science)');
  const [subjectsStudied, setSubjectsStudied] = useState('English Core, Mathematics, Physics, Chemistry, Computer Science / AI');
  const [totalWorkingDays, setTotalWorkingDays] = useState('220');
  const [totalDaysPresent, setTotalDaysPresent] = useState('214 (97.2%)');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);

  // Appreciation & Competition Fields
  const [awardTitle, setAwardTitle] = useState('Marvellous Performer');
  const [eventName, setEventName] = useState('Annual Fitness & Sports Championship');
  const [organizerName, setOrganizerName] = useState('Faculty of Co-Curricular & Sports');

  // Active student object
  const activeStudent = studentList.find(s => s.id === selectedStudentId || s.name === selectedStudentId) || studentList[0] || {};

  // Auto-sync updates across app (transfers, admissions, fee clearances)
  useEffect(() => {
    const unsub = subscribeLiveEvents(() => {
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
      subtitle: '7 Interchangeable Official TC Designs',
      icon: GraduationCap,
      color: 'teal'
    },
    {
      id: 'appreciation',
      num: '2',
      title: 'Certificate of Appreciation',
      subtitle: 'Imperial Arch & Merit Recognition',
      icon: Trophy,
      color: 'amber'
    },
    {
      id: 'participation',
      num: '3',
      title: 'Certificate of Participation',
      subtitle: 'Modern Geometric Contest & Event Record',
      icon: Medal,
      color: 'emerald'
    },
    {
      id: 'domicile',
      num: '4',
      title: 'Domicile / Bonafide',
      subtitle: 'Institutional Residence & Identity Record',
      icon: Building,
      color: 'blue'
    },
    {
      id: 'migration',
      num: '5',
      title: 'Character & Migration',
      subtitle: 'Conduct & Board Clearance Certificate',
      icon: ShieldCheck,
      color: 'emerald'
    },
    {
      id: 'report_card',
      num: '6',
      title: 'Academic Report Card',
      subtitle: 'Cumulative Marksheet & Evaluation',
      icon: BookOpen,
      color: 'purple'
    },
    {
      id: 'admit_card',
      num: '7',
      title: 'Exam Admit Card',
      subtitle: 'Examination Hall Ticket with Timetable',
      icon: Calendar,
      color: 'amber'
    },
    {
      id: 'id_card',
      num: '8',
      title: 'Student Smart ID Card',
      subtitle: 'Front & Back RFID Photo Identity Card',
      icon: Award,
      color: 'rose'
    }
  ];

  const tcTemplatesList = [
    {
      id: 'sunrise_chevron',
      title: 'Sunrise Golden Chevron',
      tag: 'Landscape • Geometric Chevron',
      desc: 'Angular gold/charcoal corners, laurel crest, structured clean lines',
      orientation: 'landscape',
      borderStyle: 'border-amber-400'
    },
    {
      id: 'royal_gold',
      title: 'Royal Navy & Gold Crest',
      tag: 'Landscape • Luxury Crest',
      desc: 'Ornate gold corners, ribbon motto header, gold embossed stamp',
      orientation: 'landscape',
      borderStyle: 'border-amber-400'
    },
    {
      id: 'cbse_statutory',
      title: 'CBSE Statutory 15-Point',
      tag: 'Portrait • Board Standard',
      desc: 'Affiliation & School Code, 15 statutory clauses, triple signatory',
      orientation: 'portrait',
      borderStyle: 'border-slate-800'
    },
    {
      id: 'traditional_heritage',
      title: 'Traditional Heritage Leaving',
      tag: 'Portrait • Classical Filigree',
      desc: 'Double border, central watermark emblem, formal certification prose',
      orientation: 'portrait',
      borderStyle: 'border-blue-900'
    },
    {
      id: 'vintage_crimson',
      title: 'Vintage Crimson Guilloche',
      tag: 'Portrait • Elegant Burgundy',
      desc: 'Crimson guilloche filigree border, parchment texture, wax seal',
      orientation: 'portrait',
      borderStyle: 'border-red-900'
    },
    {
      id: 'classic_ivory',
      title: 'Classic Ivory Filigree',
      tag: 'Landscape • Banknote Grade',
      desc: 'Intricate currency-grade filigree borders, gold rosette medallion',
      orientation: 'landscape',
      borderStyle: 'border-amber-600'
    },
    {
      id: 'modern_platinum',
      title: 'Modern Platinum & Cobalt',
      tag: 'Landscape • High-Tech Security',
      desc: 'Angular modern geometric frames, digital QR badge, barcode security',
      orientation: 'landscape',
      borderStyle: 'border-blue-700'
    }
  ];

  // Helper for generating document registration numbers
  const getDocRegNo = (st, type) => {
    const r = st.roll_no || '101';
    const code = schoolInfo.schoolCode || 'SCH';
    switch (type) {
      case 'tc': return `TC/${code}/${academicSession.replace(/\s+/g, '')}/${r}`;
      case 'appreciation': return `APPR/${code}/2026/${r}`;
      case 'participation': return `PART/${code}/2026/${r}`;
      case 'domicile': return `DOM/${code}/2026/${r}`;
      case 'migration': return `MIG/${code}/2026/${r}`;
      case 'report_card': return `MARK/${code}/2026/${r}`;
      case 'admit_card': return `HT/${code}/2026/${r}`;
      case 'id_card': return `ID-${st.id || 'STU'}-${r}`;
      default: return `DOC/${code}/2026/${r}`;
    }
  };

  // Reusable Golden School Seal SVG Component
  const GoldenSchoolSeal = ({ size = 84 }) => (
    <div className="relative inline-flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md text-amber-600">
        <circle cx="50" cy="50" r="46" fill="#fef3c7" stroke="#b45309" strokeWidth="2.5" strokeDasharray="3 1.5" />
        <circle cx="50" cy="50" r="41" fill="none" stroke="#d97706" strokeWidth="1" />
        <circle cx="50" cy="50" r="34" fill="#fffbeb" stroke="#b45309" strokeWidth="1.5" />
        
        <path id={`sealPath-${size}`} d="M 50,50 m -30,0 a 30,30 0 1,1 60,0 a 30,30 0 1,1 -60,0" fill="none" />
        <text className="text-[6.5px] font-black uppercase tracking-widest fill-amber-900">
          <textPath href={`#sealPath-${size}`} startOffset="50%" textAnchor="middle">
            ★ OFFICIAL INSTITUTION SEAL ★
          </textPath>
        </text>
        
        <g transform="translate(50, 50)">
          <path
            d="M 0,-14 L 3.5,-4 L 14,-4 L 6,2 L 9,12 L 0,6 L -9,12 L -6,2 L -14,-4 L -3.5,-4 Z"
            fill="#d97706"
            stroke="#92400e"
            strokeWidth="0.8"
          />
          <circle cx="0" cy="0" r="4" fill="#fef3c7" />
        </g>
      </svg>
      <span className="absolute bottom-2 text-[7px] font-bold font-mono uppercase text-amber-950 tracking-tighter">
        VERIFIED
      </span>
    </div>
  );

  // Triple-Star Gold Medallion SVG Component (for Appreciation Certificate)
  const GoldStarMedallion = ({ size = 96 }) => (
    <div className="relative inline-flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
        {/* Outer Radiant Sunburst / Star Polygon */}
        <polygon
          points="50,2 62,14 78,8 84,24 100,26 98,42 108,54 98,66 100,82 84,84 78,100 62,94 50,106 38,94 22,100 16,84 0,82 2,66 -8,54 2,42 0,26 16,24 22,8 38,14"
          fill="#d97706"
          stroke="#78350f"
          strokeWidth="1.5"
          transform="scale(0.85) translate(8, 8)"
        />
        <circle cx="50" cy="50" r="38" fill="url(#goldGrad)" stroke="#fef3c7" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="32" fill="#7f1d1d" stroke="#f59e0b" strokeWidth="1.5" />
        
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
        </defs>

        {/* 3 Stars at the Top */}
        <g fill="#fef08a" transform="translate(0, -6)">
          <polygon points="50,25 52,30 57,30 53,33 55,38 50,35 45,38 47,33 43,30 48,30" />
          <polygon points="38,28 39.5,32 44,32 40.5,34.5 42,38.5 38,36 34,38.5 35.5,34.5 32,32 36.5,32" transform="scale(0.8) translate(10, 8)" />
          <polygon points="62,28 63.5,32 68,32 64.5,34.5 66,38.5 62,36 58,38.5 59.5,34.5 56,32 60.5,32" transform="scale(0.8) translate(16, 8)" />
        </g>

        {/* Large Center Star */}
        <polygon
          points="50,38 53.5,49 65,49 56,56 59.5,67 50,60 40.5,67 44,56 35,49 46.5,49"
          fill="#fef08a"
          stroke="#b45309"
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );

  // Modern Multi-Ring Hologram Seal (for Participation Certificate)
  const ModernHologramSeal = ({ size = 80 }) => (
    <div className="relative inline-flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <circle cx="50" cy="50" r="46" fill="#fef3c7" stroke="#b45309" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="38" fill="#1e293b" stroke="#0ea5e9" strokeWidth="2" />
        <circle cx="50" cy="50" r="28" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
        
        {/* Modern aperture / energy iris icon */}
        <g stroke="#38bdf8" strokeWidth="2" fill="none" transform="translate(50, 50)">
          <circle cx="0" cy="0" r="14" stroke="#f97316" strokeWidth="2.5" />
          <line x1="-12" y1="0" x2="12" y2="0" stroke="#06b6d4" />
          <line x1="0" y1="-12" x2="0" y2="12" stroke="#06b6d4" />
          <circle cx="0" cy="0" r="4" fill="#38bdf8" />
        </g>
      </svg>
    </div>
  );

  // Reusable Red Wax / Stamp SVG Component
  const CrimsonStampSeal = ({ size = 80 }) => (
    <div className="relative inline-flex items-center justify-center select-none rotate-[-6deg]" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full text-rose-700 opacity-90">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="6 2" />
        <circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="32" fill="#fff1f2" stroke="currentColor" strokeWidth="2" />
        <text x="50" y="38" textAnchor="middle" className="text-[7px] font-black uppercase tracking-wider fill-rose-900">
          OFFICIAL SEAT
        </text>
        <text x="50" y="52" textAnchor="middle" className="text-[10px] font-black tracking-widest fill-rose-950">
          APPROVED
        </text>
        <text x="50" y="66" textAnchor="middle" className="text-[6.5px] font-bold uppercase fill-rose-800">
          {new Date().getFullYear()} ACADEMIC
        </text>
      </svg>
    </div>
  );

  // ==========================================
  // RENDER TRANSFER CERTIFICATE TEMPLATES
  // ==========================================

  // Template 1: Sunrise Golden Chevron TC (Landscape - EXACT MATCH to Image 1)
  const renderSunriseChevronTC = (st) => {
    const regNo = getDocRegNo(st, 'tc');
    const dobWords = dateToWords(st.dob);

    return (
      <div className="bg-white p-8 sm:p-10 rounded-2xl border-4 border-amber-400/90 text-slate-900 space-y-6 shadow-xl relative overflow-hidden font-serif">
        {/* Top-Left Charcoal & Gold Chevron Corner Banner */}
        <div className="absolute top-0 left-0 w-28 h-28 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="0,0 100,0 0,100" fill="#1e293b" />
            <polygon points="0,0 70,0 0,70" fill="#0f172a" />
            <polygon points="70,0 100,0 0,100 0,70" fill="#f59e0b" opacity="0.9" />
          </svg>
        </div>

        {/* Bottom-Right Charcoal & Gold Chevron Corner Banner */}
        <div className="absolute bottom-0 right-0 w-28 h-28 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="100,100 0,100 100,0" fill="#1e293b" />
            <polygon points="100,100 30,100 100,30" fill="#0f172a" />
            <polygon points="30,100 0,100 100,0 100,30" fill="#f59e0b" opacity="0.9" />
          </svg>
        </div>

        {/* Top Header Bar */}
        <div className="flex justify-between items-start pt-2 px-6">
          <div className="text-[10px] font-sans font-bold tracking-widest text-slate-600 uppercase pl-8">
            DISCIPLINE &nbsp;|&nbsp; KNOWLEDGE &nbsp;|&nbsp; EXCELLENCE
          </div>
          <div className="text-right text-[11px] font-sans font-semibold text-slate-700 pr-4">
            <div>Affiliation No. : <strong className="font-mono text-slate-900">{schoolInfo.affiliationNo}</strong></div>
            <div>School Code &nbsp; : <strong className="font-mono text-slate-900">{schoolInfo.schoolCode}</strong></div>
          </div>
        </div>

        {/* Center Crest & School Name */}
        <div className="text-center space-y-1 relative">
          <div className="flex items-center justify-center mb-1">
            {schoolInfo.customLogoUrl ? (
              <img src={schoolInfo.customLogoUrl} alt="Logo" className="w-14 h-14 object-contain rounded-full border-2 border-amber-400" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 text-amber-100 flex items-center justify-center font-black text-xl border-2 border-amber-300 shadow-md">
                <BookOpen className="w-7 h-7 text-amber-200" />
              </div>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-wider text-slate-950 uppercase font-serif">
            {schoolInfo.schoolName}
          </h2>
          <div className="text-xs font-sans tracking-widest text-slate-600 uppercase font-bold">
            {schoolInfo.motto}
          </div>

          <div className="pt-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-slate-950 uppercase font-serif">
              TRANSFER CERTIFICATE
            </h1>
            {/* Gold Flourish Divider */}
            <div className="flex items-center justify-center gap-2 text-amber-600 my-1">
              <span className="h-[1.5px] w-24 bg-gradient-to-r from-transparent to-amber-500"></span>
              <span className="text-sm">✦ ❦ ✦</span>
              <span className="h-[1.5px] w-24 bg-gradient-to-l from-transparent to-amber-500"></span>
            </div>
          </div>

          <p className="text-sm italic text-slate-800 font-serif pt-1">
            This is to certify that
          </p>
        </div>

        {/* Clean Structured Fill-In Form Lines */}
        <div className="max-w-2xl mx-auto space-y-3.5 text-xs font-sans px-4">
          <div className="flex items-baseline gap-2">
            <span className="w-36 text-slate-700 font-medium">Name of the Pupil</span>
            <span className="text-slate-400">:</span>
            <span className="flex-1 border-b border-slate-400 pb-0.5 font-bold text-slate-950 text-sm uppercase">
              {st.student_name}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="w-36 text-slate-700 font-medium">Admission No.</span>
            <span className="text-slate-400">:</span>
            <span className="flex-1 border-b border-slate-400 pb-0.5 font-mono font-bold text-slate-900">
              {st.id} &bull; Roll No: #{st.roll_no}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="w-36 text-slate-700 font-medium">Date of Birth</span>
            <span className="text-slate-400">:</span>
            <span className="w-40 border-b border-slate-400 pb-0.5 font-bold text-slate-900">
              {st.dob}
            </span>
            <span className="text-slate-500 italic text-[11px]">(in words)</span>
            <span className="flex-1 border-b border-slate-400 pb-0.5 italic font-serif text-slate-900 text-[11.5px]">
              {dobWords}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="w-36 text-slate-700 font-medium">Class / Grade</span>
            <span className="text-slate-400">:</span>
            <span className="flex-1 border-b border-slate-400 pb-0.5 font-bold text-slate-900">
              {st.class_batch}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="w-36 text-slate-700 font-medium">Date of Issue</span>
            <span className="text-slate-400">:</span>
            <span className="flex-1 border-b border-slate-400 pb-0.5 font-mono font-bold text-slate-900">
              {issueDate}
            </span>
          </div>
        </div>

        {/* Official Statutory Relief Paragraph */}
        <div className="max-w-2xl mx-auto pt-2 text-justify text-xs font-serif leading-relaxed text-slate-800 indent-6">
          This is to certify that the above named pupil was a bonafide student of this School and has successfully completed the prescribed course of study. He / She is hereby relieved of all dues and is permitted to join the new School / Institution.
        </div>

        {/* Dual Signatures and Golden Circular Seal */}
        <div className="pt-6 border-t border-slate-200 flex items-end justify-between px-6">
          <div className="text-center space-y-1">
            <div className="w-40 border-b border-slate-600 pb-1 font-sans text-xs text-slate-700 font-medium">
              Class Teacher
            </div>
            <div className="text-[10px] text-slate-500 font-sans">(Signature)</div>
          </div>

          <div className="text-center">
            <GoldenSchoolSeal size={84} />
          </div>

          <div className="text-center space-y-1">
            <div className="w-40 border-b-2 border-slate-900 pb-1 font-serif italic text-amber-950 font-bold text-sm">
              {schoolInfo.principalName}
            </div>
            <div className="font-sans font-bold text-[10px] text-slate-900 uppercase">
              Principal (Signature)
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Template 2: Royal Navy & Gold Luxury Crest (Landscape)
  const renderRoyalGoldTC = (st) => {
    const regNo = getDocRegNo(st, 'tc');
    const isFeeCleared = st.fee_status === 'Paid' || (st.feeDues || 0) === 0;
    const dobWords = dateToWords(st.dob);

    return (
      <div className="bg-gradient-to-b from-amber-50/60 via-white to-amber-50/40 p-8 sm:p-10 rounded-2xl border-8 border-double border-amber-500/80 text-slate-900 space-y-6 shadow-xl relative overflow-hidden font-serif">
        <div className="absolute top-2 left-2 w-14 h-14 border-t-4 border-l-4 border-amber-600 pointer-events-none" />
        <div className="absolute top-2 right-2 w-14 h-14 border-t-4 border-r-4 border-amber-600 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-14 h-14 border-b-4 border-l-4 border-amber-600 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-14 h-14 border-b-4 border-r-4 border-amber-600 pointer-events-none" />

        <div className="text-center space-y-2 border-b-2 border-amber-400/60 pb-5 relative">
          <div className="flex items-center justify-center gap-3">
            {schoolInfo.customLogoUrl ? (
              <img src={schoolInfo.customLogoUrl} alt="Logo" className="w-14 h-14 object-contain rounded-full border border-amber-400 shadow-sm" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-amber-100 flex items-center justify-center font-black text-xl shadow-md border-2 border-amber-300">
                {schoolInfo.schoolName.charAt(0)}
              </div>
            )}
            <div>
              <div className="text-[11px] font-sans font-extrabold tracking-widest text-amber-800 uppercase">
                Affiliation No: {schoolInfo.affiliationNo} &bull; School Code: {schoolInfo.schoolCode}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-wider text-slate-950 uppercase font-serif">
                {schoolInfo.schoolName}
              </h2>
              <p className="text-xs font-sans text-slate-600 font-medium italic">
                {schoolInfo.address}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <div className="inline-block px-8 py-1.5 rounded-full bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-amber-300 font-sans font-extrabold text-xs uppercase tracking-widest shadow-md border border-amber-400/50">
              ✦ Transfer &amp; Character Certificate ✦
            </div>
          </div>
          
          <p className="text-[11px] text-amber-900 font-sans tracking-wide">
            {schoolInfo.motto}
          </p>
        </div>

        <div className="flex justify-between items-center text-xs font-mono border-b border-amber-200 pb-2 text-slate-700 px-2">
          <span>Certificate No: <strong className="text-amber-900 font-bold">{regNo}</strong></span>
          <span>Admission ID: <strong className="text-slate-900">{st.id}</strong></span>
          <span>Session: <strong className="text-slate-900">{academicSession}</strong></span>
          <span>Date: <strong className="text-slate-900">{issueDate}</strong></span>
        </div>

        <div className="space-y-4 px-2 font-serif text-sm leading-relaxed text-slate-800">
          <p className="text-justify indent-8">
            This is to officially certify that <strong className="text-slate-950 text-base underline underline-offset-4 decoration-amber-500 font-sans font-bold">{st.student_name}</strong>, 
            Son / Daughter of <strong className="text-slate-900">{st.father_name}</strong> and <strong className="text-slate-900">{st.mother_name}</strong>, 
            residing at <span className="text-slate-800 italic">{st.residential_address}</span>, 
            was admitted to this institution on <strong className="text-slate-900 font-sans">{st.admission_date}</strong> and was a bonafide student of this school.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 py-2 px-4 bg-amber-50/50 rounded-xl border border-amber-200/80 font-sans text-xs">
            <p>1. Date of Birth (in Figures): <strong className="text-slate-900 font-bold">{st.dob}</strong></p>
            <p>2. Date of Birth (in Words): <strong className="text-amber-950 italic">{dobWords}</strong></p>
            <p>3. Class in which Last Studied: <strong className="text-slate-900 font-bold">{st.class_batch}</strong></p>
            <p>4. Board / School Annual Result: <strong className="text-emerald-800 font-bold">{examResult}</strong></p>
            <p>5. Subjects Studied: <strong className="text-slate-900">{subjectsStudied}</strong></p>
            <p>6. Whether Promoted to Higher Grade: <strong className="text-slate-900 font-bold">{promotedTo}</strong></p>
            <p>7. School Dues Clearance Status: <strong className={isFeeCleared ? 'text-emerald-800 font-bold' : 'text-rose-700 font-bold'}>{isFeeCleared ? 'Cleared (Nil Dues Outstanding)' : 'Dues Pending'}</strong></p>
            <p>8. Total Attendance: <strong className="text-slate-900">{totalDaysPresent} of {totalWorkingDays} Working Days</strong></p>
            <p className="sm:col-span-2">9. Reason for School Leaving: <strong className="text-slate-900">{reasonForLeaving}</strong></p>
            <p className="sm:col-span-2">10. Moral Character &amp; Conduct: <strong className="text-teal-900 font-bold">{conduct}</strong></p>
          </div>
        </div>

        <div className="pt-6 border-t-2 border-amber-300/80 flex items-end justify-between px-2">
          <div className="text-center space-y-1">
            <div className="w-36 border-b border-slate-700 pb-1 font-sans text-xs text-slate-600 font-medium">
              Class Teacher
            </div>
            <div className="font-sans font-bold text-[10px] text-slate-800 uppercase tracking-wider">
              Prepared &amp; Verified By
            </div>
          </div>

          <div className="text-center">
            <GoldenSchoolSeal size={88} />
          </div>

          <div className="text-center space-y-1">
            <div className="w-44 border-b-2 border-slate-900 pb-1 font-serif italic text-amber-950 font-bold text-base">
              {schoolInfo.principalName}
            </div>
            <div className="font-sans font-black text-[10px] text-slate-900 uppercase tracking-wider">
              {schoolInfo.principalTitle}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Template 3: CBSE Statutory 15-Point Transfer Certificate (Portrait)
  const renderCbseStatutoryTC = (st) => {
    const regNo = getDocRegNo(st, 'tc');
    const isFeeCleared = st.fee_status === 'Paid' || (st.feeDues || 0) === 0;
    const dobWords = dateToWords(st.dob);

    return (
      <div className="bg-white p-7 sm:p-9 rounded-2xl border-4 border-slate-900 text-slate-900 space-y-4 shadow-sm text-xs relative font-sans">
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 text-[11px] font-bold">
          <div>
            <div>UDISE Code: <span className="font-mono">{schoolInfo.udiseNo}</span></div>
            <div>School Code: <span className="font-mono">{schoolInfo.schoolCode}</span></div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-bold tracking-widest text-slate-700 uppercase">
              Affiliated to CBSE, New Delhi &bull; Affiliation No: {schoolInfo.affiliationNo}
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase mt-0.5">
              {schoolInfo.schoolName}
            </h2>
            <p className="text-[10px] text-slate-600 font-normal">
              {schoolInfo.address} &bull; Ph: {schoolInfo.phone}
            </p>
          </div>
          <div className="text-right">
            <div>Book No: <span className="font-mono">{schoolInfo.bookNo}</span></div>
            <div>Sr. No: <span className="font-mono font-bold text-red-700">{st.roll_no ? String(st.roll_no).padStart(4, '0') : '0101'}</span></div>
          </div>
        </div>

        <div className="text-center py-1 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded">
          TRANSFER CERTIFICATE
        </div>

        <div className="flex justify-between items-center text-[11px] font-mono border-b pb-1 text-slate-700">
          <span>TC Number: <strong>{regNo}</strong></span>
          <span>Admission / General Register No: <strong>{st.id}</strong></span>
        </div>

        <div className="space-y-2 text-[11.5px] leading-relaxed text-slate-800 divide-y divide-slate-100">
          <div className="flex justify-between pt-1">
            <span className="w-2/3">1. Name of the Pupil:</span>
            <strong className="w-1/3 text-right uppercase text-slate-950 font-bold">{st.student_name}</strong>
          </div>
          <div className="flex justify-between pt-1">
            <span className="w-2/3">2. Mother's Name:</span>
            <strong className="w-1/3 text-right uppercase">{st.mother_name}</strong>
          </div>
          <div className="flex justify-between pt-1">
            <span className="w-2/3">3. Father's / Guardian's Name:</span>
            <strong className="w-1/3 text-right uppercase">{st.father_name}</strong>
          </div>
          <div className="flex justify-between pt-1">
            <span className="w-2/3">4. Nationality &amp; Religion:</span>
            <strong className="w-1/3 text-right">{st.nationality} &bull; {st.religion}</strong>
          </div>
          <div className="flex justify-between pt-1">
            <span className="w-2/3">5. Whether candidate belongs to SC / ST / OBC:</span>
            <strong className="w-1/3 text-right">{st.caste_category || 'General Category'}</strong>
          </div>
          <div className="flex justify-between pt-1">
            <span className="w-2/3">6. Date of First Admission in School with Class:</span>
            <strong className="w-1/3 text-right">{st.admission_date} ({st.admission_class || 'Class 9'})</strong>
          </div>
          <div className="flex justify-between pt-1">
            <span className="w-1/2">7. Date of Birth according to Admission Register:</span>
            <div className="w-1/2 text-right">
              <div><strong>{st.dob}</strong> (in figures)</div>
              <div className="text-[10.5px] italic text-slate-600 font-serif">"{dobWords}" (in words)</div>
            </div>
          </div>
          <div className="flex justify-between pt-1">
            <span className="w-2/3">8. Class in which the pupil last studied:</span>
            <strong className="w-1/3 text-right font-bold">{st.class_batch}</strong>
          </div>
          <div className="flex justify-between pt-1">
            <span className="w-2/3">9. School / Board Annual Examination last taken:</span>
            <strong className="w-1/3 text-right text-emerald-800 font-bold">{examResult}</strong>
          </div>
          <div className="flex justify-between pt-1">
            <span className="w-2/3">10. Whether failed, if so once/twice in the same class:</span>
            <strong className="w-1/3 text-right">No (Passed in First Attempt)</strong>
          </div>
          <div className="flex justify-between pt-1">
            <span className="w-1/3">11. Subjects Studied:</span>
            <strong className="w-2/3 text-right text-[11px]">{subjectsStudied}</strong>
          </div>
          <div className="flex justify-between pt-1">
            <span className="w-2/3">12. Whether qualified for promotion to higher class:</span>
            <strong className="w-1/3 text-right font-bold text-slate-900">{promotedTo}</strong>
          </div>
          <div className="flex justify-between pt-1">
            <span className="w-2/3">13. Month up to which the school dues have been paid:</span>
            <strong className={`w-1/3 text-right font-bold ${isFeeCleared ? 'text-emerald-800' : 'text-rose-700'}`}>
              {isFeeCleared ? 'March 2026 (Fully Cleared)' : 'Dues Pending ₹35,000'}
            </strong>
          </div>
          <div className="flex justify-between pt-1">
            <span className="w-2/3">14. Total No. of working days &amp; days present:</span>
            <strong className="w-1/3 text-right">{totalDaysPresent} / {totalWorkingDays} Days</strong>
          </div>
          <div className="flex justify-between pt-1">
            <span className="w-2/3">15. Reasons for leaving the school:</span>
            <strong className="w-1/3 text-right">{reasonForLeaving}</strong>
          </div>
          <div className="flex justify-between pt-1">
            <span className="w-2/3">16. General Conduct:</span>
            <strong className="w-1/3 text-right text-teal-800 font-bold">{conduct}</strong>
          </div>
        </div>

        <div className="pt-6 border-t-2 border-slate-800 grid grid-cols-3 gap-4 items-end text-center">
          <div className="space-y-1">
            <div className="border-b border-slate-500 pb-1 font-mono text-[10px] text-slate-600">Class Teacher</div>
            <div className="font-bold text-[10px] uppercase">Prepared By</div>
          </div>
          <div className="space-y-1">
            <div className="border-b border-slate-500 pb-1 font-mono text-[10px] text-slate-600">Head Clerk / Admin</div>
            <div className="font-bold text-[10px] uppercase">Checked By</div>
          </div>
          <div className="space-y-1">
            <div className="border-b-2 border-slate-900 pb-1 font-serif italic font-bold text-slate-950 text-sm">
              {schoolInfo.principalName}
            </div>
            <div className="font-black text-[10px] uppercase text-slate-900">Principal &amp; Official Seal</div>
          </div>
        </div>
      </div>
    );
  };

  // Template 4: Traditional Heritage School Leaving Certificate (Portrait)
  const renderTraditionalHeritageTC = (st) => {
    const regNo = getDocRegNo(st, 'tc');
    const dobWords = dateToWords(st.dob);

    return (
      <div className="bg-amber-50/20 p-8 sm:p-10 rounded-2xl border-8 border-double border-blue-950 text-slate-900 space-y-5 shadow-md relative overflow-hidden font-serif">
        <div className="text-center space-y-1.5 border-b-2 border-blue-950 pb-4">
          <div className="text-[10px] font-sans font-bold tracking-widest text-blue-900 uppercase">
            Recognized by Department of Public Instruction &bull; Code: {schoolInfo.schoolCode}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-blue-950 uppercase font-serif">
            {schoolInfo.schoolName}
          </h2>
          <p className="text-xs text-slate-700 italic">
            {schoolInfo.address}
          </p>
          <div className="inline-block mt-2 px-6 py-1 rounded bg-blue-950 text-white font-sans font-bold text-xs uppercase tracking-widest">
            School Leaving Certificate
          </div>
        </div>

        <div className="flex justify-between items-center text-xs font-sans font-semibold border-b border-slate-300 pb-2">
          <span>Serial No: <strong className="text-blue-950 font-mono">{regNo}</strong></span>
          <span>Date of Issue: <strong className="text-slate-900 font-mono">{issueDate}</strong></span>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-slate-800 text-justify">
          <p className="indent-8">
            This is to certify that Master / Kumari <strong className="text-blue-950 font-sans text-base underline decoration-blue-900 decoration-2">{st.student_name}</strong>, 
            Admission No: <strong className="font-mono text-slate-900">{st.id}</strong>, 
            Son / Daughter of <strong className="text-slate-900">{st.father_name}</strong> and <strong className="text-slate-900">{st.mother_name}</strong>, 
            was admitted into this institution on <strong className="font-sans">{st.admission_date}</strong> and left on <strong className="font-sans">{issueDate}</strong>.
          </p>

          <p>
            His / Her Date of Birth according to the General Admission Register is <strong className="text-slate-950 font-sans font-bold">{st.dob}</strong> (in words: <span className="italic font-bold text-blue-950">"{dobWords}"</span>).
          </p>

          <div className="p-4 bg-white/80 rounded-xl border border-blue-900/30 space-y-2 text-xs font-sans">
            <div className="grid grid-cols-2 gap-2">
              <div>Class last studied: <strong className="text-slate-950">{st.class_batch}</strong></div>
              <div>Academic Record: <strong className="text-emerald-800">{examResult}</strong></div>
              <div>Character &amp; Conduct: <strong className="text-blue-950 font-bold">{conduct}</strong></div>
              <div>Reasons for leaving: <strong className="text-slate-950">{reasonForLeaving}</strong></div>
            </div>
          </div>

          <p>
            All institutional dues and library books have been satisfactorily accounted for and returned. We wish the student all success in future academic endeavors.
          </p>
        </div>

        <div className="pt-6 border-t-2 border-blue-950 flex items-end justify-between">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-200 mx-auto mb-1">
              <QrCode className="w-12 h-12 text-blue-950" />
            </div>
            <span className="text-[9px] font-sans text-slate-500 font-mono">Institutional Verification</span>
          </div>

          <div className="text-center">
            <GoldenSchoolSeal size={78} />
          </div>

          <div className="text-center space-y-1">
            <div className="w-40 border-b-2 border-blue-950 pb-1 font-serif italic text-blue-950 font-bold text-sm">
              {schoolInfo.principalName}
            </div>
            <div className="font-sans font-black text-[10px] text-blue-950 uppercase tracking-wider">
              Headmaster / Principal
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Template 5: Vintage Crimson Guilloche TC (Portrait)
  const renderVintageCrimsonTC = (st) => {
    const regNo = getDocRegNo(st, 'tc');
    const dobWords = dateToWords(st.dob);

    return (
      <div className="bg-rose-50/30 p-8 sm:p-10 rounded-2xl border-8 border-red-900 text-slate-900 space-y-5 shadow-lg relative overflow-hidden font-serif">
        <div className="text-center space-y-2 border-b-2 border-red-900/60 pb-4">
          <div className="text-[10px] font-sans font-extrabold tracking-widest text-red-900 uppercase">
            Autonomous Educational Board &bull; Code: {schoolInfo.schoolCode}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-red-950 uppercase font-serif">
            {schoolInfo.schoolName}
          </h2>
          <p className="text-xs text-slate-600 font-sans italic">
            {schoolInfo.address}
          </p>
          <div className="inline-block px-6 py-1 rounded bg-red-900 text-rose-100 font-sans font-bold text-xs uppercase tracking-widest shadow">
            Official Transfer &amp; Graduation Record
          </div>
        </div>

        <div className="flex justify-between items-center text-xs font-mono border-b border-red-200 pb-2 text-red-950 font-bold">
          <span>Certificate No: {regNo}</span>
          <span>Admission ID: {st.id}</span>
          <span>Issued: {issueDate}</span>
        </div>

        <div className="space-y-3.5 text-sm leading-relaxed text-slate-800">
          <p className="text-justify indent-6">
            This instrument certifies that <strong className="text-red-950 font-sans font-bold text-base">{st.student_name}</strong>, 
            Child of <strong className="text-slate-900">{st.father_name}</strong> &amp; <strong className="text-slate-900">{st.mother_name}</strong>, 
            completed studies in <strong className="text-slate-900 font-sans">{st.class_batch}</strong> during academic session <strong className="font-sans">{academicSession}</strong>.
          </p>

          <div className="grid grid-cols-2 gap-3 p-4 bg-white/90 rounded-xl border border-red-200 font-sans text-xs">
            <div>DOB (Figures): <strong className="text-slate-900">{st.dob}</strong></div>
            <div>DOB (Words): <strong className="text-red-900 italic">{dobWords}</strong></div>
            <div>Examination Result: <strong className="text-emerald-800 font-bold">{examResult}</strong></div>
            <div>Promotion Status: <strong className="text-slate-900 font-bold">{promotedTo}</strong></div>
            <div>Reason for Leaving: <strong className="text-slate-900">{reasonForLeaving}</strong></div>
            <div>General Character: <strong className="text-red-950 font-bold">{conduct}</strong></div>
          </div>
        </div>

        <div className="pt-6 border-t-2 border-red-900 flex items-end justify-between">
          <div className="text-center space-y-1">
            <div className="w-32 border-b border-slate-500 pb-1 font-sans text-[10px] text-slate-600">Class Incharge</div>
            <div className="font-sans font-bold text-[10px] text-slate-800 uppercase">Verified By</div>
          </div>

          <CrimsonStampSeal size={84} />

          <div className="text-center space-y-1">
            <div className="w-40 border-b-2 border-red-950 pb-1 font-serif italic text-red-950 font-bold text-sm">
              {schoolInfo.principalName}
            </div>
            <div className="font-sans font-black text-[10px] text-red-950 uppercase">Principal Signature</div>
          </div>
        </div>
      </div>
    );
  };

  // Template 6: Classic Ivory Filigree TC (Landscape)
  const renderClassicIvoryTC = (st) => {
    const regNo = getDocRegNo(st, 'tc');
    const dobWords = dateToWords(st.dob);

    return (
      <div className="bg-amber-50/30 p-8 sm:p-10 rounded-2xl border-8 border-amber-600/90 text-slate-900 space-y-5 shadow-xl relative overflow-hidden font-serif">
        <div className="text-center space-y-2 border-b-2 border-amber-600/60 pb-4">
          <div className="text-[10px] font-sans font-black tracking-widest text-amber-900 uppercase">
            Affiliation No: {schoolInfo.affiliationNo} &bull; School Code: {schoolInfo.schoolCode}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-wider text-slate-950 uppercase font-serif">
            {schoolInfo.schoolName}
          </h2>
          <p className="text-xs text-slate-700 italic font-sans">{schoolInfo.address}</p>
          <div className="inline-block px-6 py-1 rounded bg-amber-800 text-amber-100 font-sans font-bold text-xs uppercase tracking-widest">
            Certificate of Transfer &amp; Merit
          </div>
        </div>

        <div className="flex justify-between items-center text-xs font-mono border-b border-amber-300 pb-2 text-slate-700">
          <span>Certificate ID: <strong className="text-amber-900 font-bold">{regNo}</strong></span>
          <span>Admission ID: <strong>{st.id}</strong></span>
          <span>Date of Issue: <strong>{issueDate}</strong></span>
        </div>

        <div className="space-y-3 font-serif text-sm leading-relaxed text-slate-800">
          <p className="indent-8 text-justify">
            This is to certify that <strong className="text-slate-950 text-base font-sans font-bold underline decoration-amber-600">{st.student_name}</strong>, 
            Son / Daughter of <strong className="text-slate-900">{st.father_name}</strong> and <strong className="text-slate-900">{st.mother_name}</strong>, 
            has been a regular and disciplined student of this academy in <strong className="text-slate-950 font-sans">{st.class_batch}</strong>.
          </p>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 p-3 bg-amber-100/40 rounded-xl border border-amber-300 text-xs font-sans">
            <p>Date of Birth: <strong>{st.dob} ({dobWords})</strong></p>
            <p>Annual Examination: <strong className="text-emerald-800">{examResult}</strong></p>
            <p>Promotion Status: <strong className="text-slate-900">{promotedTo}</strong></p>
            <p>Character &amp; Conduct: <strong className="text-amber-950 font-bold">{conduct}</strong></p>
            <p className="col-span-2">Reason for Leaving: <strong>{reasonForLeaving}</strong></p>
          </div>
        </div>

        <div className="pt-6 border-t-2 border-amber-600/70 flex items-end justify-between">
          <div className="text-center space-y-1">
            <div className="w-32 border-b border-slate-600 pb-1 font-sans text-xs text-slate-600">Prepared By</div>
            <div className="font-sans font-bold text-[10px] text-slate-800 uppercase">Office Registrar</div>
          </div>
          <GoldenSchoolSeal size={84} />
          <div className="text-center space-y-1">
            <div className="w-40 border-b-2 border-slate-900 pb-1 font-serif italic text-amber-950 font-bold text-sm">
              {schoolInfo.principalName}
            </div>
            <div className="font-sans font-black text-[10px] text-slate-900 uppercase">{schoolInfo.principalTitle}</div>
          </div>
        </div>
      </div>
    );
  };

  // Template 7: Modern Platinum & Cobalt (Landscape)
  const renderModernPlatinumTC = (st) => {
    const regNo = getDocRegNo(st, 'tc');
    const dobWords = dateToWords(st.dob);

    return (
      <div className="bg-slate-50/70 p-8 sm:p-10 rounded-2xl border-4 border-blue-700 text-slate-900 space-y-5 shadow-xl relative overflow-hidden font-sans">
        <div className="flex items-center justify-between border-b-2 border-blue-700 pb-4">
          <div className="flex items-center gap-4">
            {schoolInfo.customLogoUrl ? (
              <img src={schoolInfo.customLogoUrl} alt="Logo" className="w-14 h-14 object-contain rounded-xl border border-blue-300" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-2xl shadow-md">
                {schoolInfo.schoolName.charAt(0)}
              </div>
            )}
            <div>
              <div className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">
                International School Code: {schoolInfo.schoolCode} &bull; Affiliation #{schoolInfo.affiliationNo}
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
                {schoolInfo.schoolName}
              </h2>
              <p className="text-xs text-slate-500">{schoolInfo.address}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-black text-xs uppercase tracking-wider border border-blue-300">
              Transfer Certificate
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1">ID: {regNo}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Candidate Name</span>
            <strong className="text-slate-900 text-sm font-black">{st.student_name}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Scholar ID / Roll No</span>
            <strong className="font-mono text-slate-900">{st.id} / #{st.roll_no}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Birth</span>
            <strong className="text-slate-900">{st.dob} ({dobWords})</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Father's Name</span>
            <strong className="text-slate-900">{st.father_name}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Mother's Name</span>
            <strong className="text-slate-900">{st.mother_name}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Class Last Studied</span>
            <strong className="text-blue-700 font-bold">{st.class_batch}</strong>
          </div>
        </div>

        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs space-y-1.5">
          <div>Academic Evaluation: <strong className="text-emerald-800 font-bold">{examResult}</strong></div>
          <div>Promotion Qualification: <strong className="text-slate-900 font-bold">{promotedTo}</strong></div>
          <div>Reason for Withdrawal: <strong className="text-slate-900">{reasonForLeaving}</strong></div>
          <div>Moral Character &amp; Conduct: <strong className="text-blue-900 font-bold">{conduct}</strong></div>
        </div>

        <div className="pt-4 border-t border-slate-300 flex items-end justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg border border-slate-300 flex items-center justify-center">
              <QrCode className="w-9 h-9 text-slate-800" />
            </div>
            <div>
              <div className="font-bold text-slate-700 text-[10px]">Digital Verification</div>
              <div className="font-mono text-[9px] text-slate-400">{regNo}</div>
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="w-36 border-b-2 border-blue-900 pb-1 font-serif italic text-blue-900 font-bold text-sm">
              {schoolInfo.principalName}
            </div>
            <div className="font-black text-[10px] text-slate-900 uppercase tracking-wider">
              {schoolInfo.principalTitle}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // CERTIFICATE OF APPRECIATION (EXACT MATCH to Image 3 - Imperial Crimson Arch)
  // =========================================================================
  const renderImperialArchAppreciation = (st) => {
    return (
      <div className="bg-white p-7 sm:p-10 rounded-3xl border-8 border-amber-400 text-slate-900 space-y-5 shadow-2xl relative overflow-hidden font-sans">
        {/* Left & Right Crimson Gradient Borders with Gold Trims */}
        <div className="absolute top-0 left-0 bottom-0 w-6 sm:w-8 bg-gradient-to-b from-amber-400 via-rose-900 to-amber-500 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-6 sm:w-8 bg-gradient-to-b from-amber-400 via-rose-900 to-amber-500 pointer-events-none" />
        
        {/* Top & Bottom Arch Curves */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-amber-400 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-r from-amber-500 via-rose-950 to-amber-500 pointer-events-none" />

        {/* Top Crest / Logo */}
        <div className="text-center space-y-1 relative pt-2">
          <div className="flex items-center justify-center">
            {schoolInfo.customLogoUrl ? (
              <img src={schoolInfo.customLogoUrl} alt="Logo" className="w-16 h-16 object-contain rounded-full border-2 border-amber-400 p-1 shadow-md bg-white" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 text-amber-200 flex items-center justify-center border-2 border-amber-400 shadow-md">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-blue-950 uppercase font-serif">
            {schoolInfo.schoolName}
          </h2>
          <p className="text-[11px] text-slate-600 font-medium">
            {schoolInfo.address}
          </p>
        </div>

        {/* Cursive Red Script Title */}
        <div className="text-center py-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-wide text-rose-700 italic font-serif">
            Certificate of Appreciation
          </h1>
          <div className="w-24 h-0.5 bg-rose-300 mx-auto mt-1 rounded-full"></div>
        </div>

        {/* Certificate Text with Clean Underline Fields */}
        <div className="space-y-4 text-center px-4 font-serif text-sm leading-loose text-slate-800">
          <div className="flex flex-wrap items-baseline justify-center gap-2">
            <span className="italic text-base">This is to certify that</span>
            <span className="font-sans font-black text-slate-950 text-xl border-b-2 border-slate-900 px-4 pb-0.5">
              {st.student_name}
            </span>
          </div>

          <div className="flex flex-wrap items-baseline justify-center gap-2">
            <span className="italic">of</span>
            <span className="font-sans font-bold text-slate-900 text-sm border-b-2 border-slate-800 px-4 pb-0.5">
              {st.class_batch}
            </span>
            <span className="italic">has been adjudged as the</span>
          </div>

          <div className="flex flex-wrap items-baseline justify-center gap-2">
            <span className="font-sans font-black text-rose-800 text-lg border-b-2 border-rose-800 px-6 pb-0.5 uppercase tracking-wide">
              {awardTitle}
            </span>
          </div>

          <div className="flex flex-wrap items-baseline justify-center gap-2">
            <span className="italic">in the</span>
            <span className="font-sans font-extrabold text-blue-950 text-base border-b-2 border-blue-950 px-6 pb-0.5">
              {eventName}
            </span>
          </div>

          <p className="italic text-slate-700 pt-2 text-xs font-sans max-w-lg mx-auto leading-relaxed">
            We appreciate his / her exemplary efforts, discipline, and dedication, and wish him / her continued success in all future endeavours.
          </p>
        </div>

        {/* Bottom Signatures and Golden 3-Star Medallion */}
        <div className="pt-6 relative flex items-end justify-between px-6 pb-4">
          <div className="text-center space-y-1">
            <div className="w-32 border-b-2 border-dotted border-slate-800 pb-1 font-mono font-bold text-xs text-slate-900">
              {issueDate}
            </div>
            <div className="font-sans font-bold text-[10px] text-slate-700 uppercase tracking-wider">
              Date
            </div>
          </div>

          {/* Central 3-Star Gold Medallion */}
          <div className="text-center -mb-2">
            <GoldStarMedallion size={92} />
          </div>

          <div className="text-center space-y-1">
            <div className="w-36 border-b-2 border-dotted border-slate-800 pb-1 font-serif italic text-blue-950 font-bold text-sm">
              {schoolInfo.principalName}
            </div>
            <div className="font-sans font-bold text-[10px] text-slate-700 uppercase tracking-wider">
              Principal
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // CERTIFICATE OF PARTICIPATION (EXACT MATCH to Image 2 - Modern Teal Geometric)
  // =========================================================================
  const renderModernTealParticipation = (st) => {
    return (
      <div className="bg-white p-7 sm:p-10 rounded-2xl border-4 border-teal-600 text-slate-900 space-y-6 shadow-2xl relative overflow-hidden font-sans">
        {/* Modern Teal / Emerald Faceted Geometric Side Polygons */}
        <div className="absolute top-0 left-0 bottom-0 w-12 sm:w-16 pointer-events-none opacity-90">
          <svg viewBox="0 0 100 800" preserveAspectRatio="none" className="w-full h-full">
            <polygon points="0,0 80,0 0,160" fill="#0f766e" />
            <polygon points="0,160 100,260 0,380" fill="#0d9488" />
            <polygon points="0,380 90,520 0,660" fill="#047857" />
            <polygon points="0,660 100,800 0,800" fill="#065f46" />
          </svg>
        </div>

        <div className="absolute top-0 right-0 bottom-0 w-12 sm:w-16 pointer-events-none opacity-90">
          <svg viewBox="0 0 100 800" preserveAspectRatio="none" className="w-full h-full">
            <polygon points="100,0 20,0 100,160" fill="#0f766e" />
            <polygon points="100,160 0,260 100,380" fill="#0d9488" />
            <polygon points="100,380 10,520 100,660" fill="#047857" />
            <polygon points="100,660 0,800 100,800" fill="#065f46" />
          </svg>
        </div>

        {/* Institution / Brand Top Header */}
        <div className="text-center space-y-1 relative pl-6 pr-6">
          <h2 className="text-2xl font-black tracking-widest text-teal-900 uppercase">
            {schoolInfo.schoolName}
          </h2>
          <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            ANNUAL CO-CURRICULAR &amp; DIGITAL EXCELLENCE
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1 pt-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-widest text-slate-950 uppercase font-sans">
            CERTIFICATE
          </h1>
          <div className="text-lg font-serif italic text-slate-700">
            of PARTICIPATION
          </div>
          <div className="inline-block mt-1 px-4 py-0.5 rounded-full bg-teal-50 text-teal-900 font-extrabold text-[11px] uppercase tracking-widest border border-teal-200">
            {eventName}
          </div>
        </div>

        {/* Award Presentation Callout */}
        <div className="text-center space-y-2 pt-2 px-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
            THIS CERTIFICATE IS PROUDLY PRESENTED TO
          </p>
          <p className="text-xs font-serif italic text-slate-500">Mr. / Miss.</p>
          
          <div className="py-1">
            <div className="text-2xl sm:text-3xl font-serif italic font-black text-slate-950 tracking-wide underline decoration-teal-500 decoration-2 underline-offset-4">
              {st.student_name}
            </div>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed max-w-lg mx-auto font-sans pt-2">
            For being declared as <strong className="text-teal-900 uppercase font-bold">"{awardTitle}"</strong>. 
            He / She participated and exhibited tremendous creativity and talent in the official event. 
            We wish him / her a prosperous and successful future.
          </p>
        </div>

        {/* Center Modern Hologram Seal */}
        <div className="text-center">
          <ModernHologramSeal size={74} />
        </div>

        {/* 4-Way Signatures Grid */}
        <div className="pt-4 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 items-end text-center px-6">
          <div className="space-y-1">
            <div className="border-b border-slate-400 pb-1 font-serif italic font-bold text-xs text-slate-800">
              Prof. Anil Kushwaha
            </div>
            <div className="text-[9px] font-bold text-slate-600 uppercase">Event Organiser</div>
          </div>
          <div className="space-y-1">
            <div className="border-b border-slate-400 pb-1 font-serif italic font-bold text-xs text-slate-800">
              Dr. S. K. Nair
            </div>
            <div className="text-[9px] font-bold text-slate-600 uppercase">Faculty Head</div>
          </div>
          <div className="space-y-1">
            <div className="border-b border-slate-400 pb-1 font-serif italic font-bold text-xs text-slate-800">
              Dr. J. Kaur
            </div>
            <div className="text-[9px] font-bold text-slate-600 uppercase">Dean of Arts</div>
          </div>
          <div className="space-y-1">
            <div className="border-b-2 border-teal-900 pb-1 font-serif italic font-bold text-xs text-teal-950">
              {schoolInfo.principalName}
            </div>
            <div className="text-[9px] font-black text-teal-950 uppercase">{schoolInfo.principalTitle}</div>
          </div>
        </div>
      </div>
    );
  };

  // Helper to render individual printable document
  const renderDocumentContent = (st, type) => {
    const regNo = getDocRegNo(st, type);

    switch (type) {
      // 1. TRANSFER CERTIFICATE (TC) - Switches between the 7 Templates!
      case 'tc':
        switch (tcTemplate) {
          case 'sunrise_chevron': return renderSunriseChevronTC(st);
          case 'royal_gold': return renderRoyalGoldTC(st);
          case 'cbse_statutory': return renderCbseStatutoryTC(st);
          case 'traditional_heritage': return renderTraditionalHeritageTC(st);
          case 'vintage_crimson': return renderVintageCrimsonTC(st);
          case 'classic_ivory': return renderClassicIvoryTC(st);
          case 'modern_platinum': return renderModernPlatinumTC(st);
          default: return renderSunriseChevronTC(st);
        }

      // 2. CERTIFICATE OF APPRECIATION
      case 'appreciation':
        return renderImperialArchAppreciation(st);

      // 3. CERTIFICATE OF PARTICIPATION
      case 'participation':
        return renderModernTealParticipation(st);

      // 4. DOMICILE & BONAFIDE CERTIFICATE
      case 'domicile':
        return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-4 border-double border-blue-300 text-slate-800 space-y-5 shadow-sm text-xs relative overflow-hidden">
            <div className="text-center space-y-1 border-b-2 border-blue-900 pb-4">
              <div className="text-[10px] font-bold tracking-widest text-blue-800 uppercase">
                Department of Public Instruction &bull; Code: {schoolInfo.schoolCode}
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                {schoolInfo.schoolName}
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
                As per the official school admission records, the candidate is a permanent resident residing at:
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
                  {schoolInfo.principalName}
                </div>
                <div className="font-black text-[10px] text-slate-900 uppercase">{schoolInfo.principalTitle}</div>
              </div>
            </div>
          </div>
        );

      // 5. CHARACTER & CONDUCT MIGRATION CERTIFICATE
      case 'migration':
        return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-4 border-double border-emerald-300 text-slate-800 space-y-5 shadow-sm text-xs relative overflow-hidden">
            <div className="text-center space-y-1 border-b-2 border-emerald-900 pb-4">
              <div className="text-[10px] font-bold tracking-widest text-emerald-800 uppercase">
                Board of Secondary &amp; Senior Secondary Education
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                {schoolInfo.schoolName}
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
                During his/her tenure at {schoolInfo.schoolName}, his/her character and conduct have been <strong className="text-emerald-800 font-bold">{conduct}</strong>. 
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
                  {schoolInfo.principalName}
                </div>
                <div className="font-black text-[10px] text-slate-900 uppercase">Authorized Signatory</div>
              </div>
            </div>
          </div>
        );

      // 6. ACADEMIC REPORT CARD (MARKSHEET)
      case 'report_card':
        return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-4 border-double border-purple-300 text-slate-800 space-y-4 shadow-sm text-xs relative overflow-hidden">
            <div className="text-center space-y-1 border-b-2 border-purple-900 pb-3">
              <div className="text-[10px] font-bold tracking-widest text-purple-800 uppercase">
                Annual Academic Performance &amp; Evaluation Statement
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-950 uppercase">
                {schoolInfo.schoolName}
              </h2>
              <div className="inline-block mt-1 px-4 py-0.5 rounded-full bg-purple-900 text-white font-bold text-[11px] uppercase tracking-wider">
                Official Report Card &bull; Academic Year {academicSession}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-purple-50/50 p-3 rounded-xl border border-purple-100">
              <div>Student Name: <strong className="block text-slate-900 font-bold text-xs">{st.student_name}</strong></div>
              <div>Roll No: <strong className="block text-slate-900 font-mono font-bold">{st.roll_no}</strong></div>
              <div>Class &amp; Section: <strong className="block text-slate-900 font-bold">{st.class_batch}</strong></div>
              <div>Attendance: <strong className="block text-emerald-700 font-bold">{totalDaysPresent}</strong></div>
            </div>

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
                  {schoolInfo.principalName}
                </div>
                <div className="font-black text-[9px] text-slate-900 uppercase">Principal Signature &amp; Stamp</div>
              </div>
            </div>
          </div>
        );

      // 7. EXAM ADMIT CARD (HALL TICKET)
      case 'admit_card':
        return (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-4 border-double border-amber-300 text-slate-800 space-y-4 shadow-sm text-xs relative overflow-hidden">
            <div className="text-center space-y-1 border-b-2 border-amber-900 pb-3">
              <div className="text-[10px] font-bold tracking-widest text-amber-800 uppercase">
                Central Examination Cell &bull; Hall Ticket {academicSession}
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-950 uppercase">
                {schoolInfo.schoolName}
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
                <div>Exam Center: <strong className="text-slate-900">Main Examination Hall, {schoolInfo.schoolName}</strong></div>
              </div>
              <img src={st.photo} alt={st.student_name} className="w-16 h-16 rounded-lg object-cover border-2 border-amber-300 shadow-sm" />
            </div>

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

      // 8. STUDENT SMART ID CARD (FRONT & BACK)
      case 'id_card':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FRONT SIDE */}
            <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-5 rounded-2xl border-2 border-teal-500/40 shadow-lg relative overflow-hidden flex flex-col justify-between h-72">
              <div className="flex items-center justify-between border-b border-teal-500/30 pb-2">
                <div>
                  <div className="font-black tracking-wider text-xs text-teal-300 uppercase">{schoolInfo.schoolName}</div>
                  <div className="text-[8px] text-slate-300">STUDENT IDENTITY CARD</div>
                </div>
                <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-black text-[10px]">
                  {schoolInfo.schoolCode?.slice(0, 3) || 'SCH'}
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
                <span>Valid: {academicSession}</span>
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
                <span className="text-[8px] text-slate-400">If found, return to {schoolInfo.schoolName}</span>
                <div className="text-center font-serif italic font-bold text-slate-900">{schoolInfo.principalName}</div>
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
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-black uppercase tracking-wider border border-teal-500/30">
                Official Certification Hub
              </span>
              <span className="text-xs text-slate-400">&bull; {schoolInfo.schoolName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Transfer Certificate &amp; Document Generator
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Generate Board-compliant Transfer Certificates, Certificates of Appreciation, and Participation awards with dynamic school branding
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs border flex items-center space-x-2 transition-all cursor-pointer ${
                showCustomizer ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md' : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <Settings2 className="w-4 h-4 text-amber-300" />
              <span>{showCustomizer ? 'Hide Customizer' : '🎨 Customize School Branding'}</span>
            </button>
            <button
              onClick={() => { setViewMode('all'); setShowPrintModal(true); }}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span>Bulk Print ({studentList.length})</span>
            </button>
            <button
              onClick={() => { setViewMode('single'); setShowPrintModal(true); }}
              className="px-5 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/30 flex items-center space-x-2 transition-transform hover:scale-105 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Certificate</span>
            </button>
          </div>
        </div>

        {/* 8 Supported Document Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mt-6 pt-6 border-t border-white/10">
          {docTypesList.map((dt) => {
            const Icon = dt.icon;
            const isSelected = docType === dt.id;
            return (
              <button
                key={dt.id}
                onClick={() => setDocType(dt.id)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-500/25 border-teal-400 text-white shadow-inner scale-[1.02]'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-teal-300">
                    Doc #{dt.num}
                  </span>
                  <Icon className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="text-xs font-black truncate">{dt.title}</div>
                <div className="text-[9px] text-slate-400 mt-0.5 truncate">{dt.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* EXPANDABLE SCHOOL BRANDING & CERTIFICATE CUSTOMIZER PANEL */}
      {showCustomizer && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white border-2 border-amber-400/40 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-400" />
              <h3 className="font-black text-sm text-white">School Branding &amp; Certificate Customizer</h3>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold border border-amber-400/30">
                Live Dynamic Overrides
              </span>
            </div>
            <button
              onClick={() => {
                if (tenant) {
                  setSchoolInfo({
                    schoolName: tenant.school_name || 'International Model Academy',
                    motto: tenant.tagline || 'Learn • Grow • Lead',
                    affiliationNo: tenant.board_affiliation ? tenant.board_affiliation.replace(/[^0-9]/g, '') || '123456' : '123456',
                    schoolCode: tenant.school_code || '654321',
                    udiseNo: '29280601244',
                    bookNo: '042',
                    address: tenant.address || '100 Knowledge Boulevard, Indiranagar, Bengaluru - 560038',
                    phone: tenant.phone || '+91 98765 00000',
                    email: tenant.email || 'principal@school.edu',
                    principalName: 'Dr. Marcus Vance, Ph.D.',
                    principalTitle: 'Principal / Head of Institution',
                    customLogoUrl: tenant.logo_url || '',
                    watermarkText: 'OFFICIAL SCHOOL RECORD'
                  });
                }
              }}
              className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 font-bold cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset to School Defaults</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Institution / School Name</label>
              <input
                type="text"
                value={schoolInfo.schoolName}
                onChange={(e) => setSchoolInfo(prev => ({ ...prev, schoolName: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-bold outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">School Motto / Tagline</label>
              <input
                type="text"
                value={schoolInfo.motto}
                onChange={(e) => setSchoolInfo(prev => ({ ...prev, motto: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-semibold outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Affiliation / Reg No.</label>
              <input
                type="text"
                value={schoolInfo.affiliationNo}
                onChange={(e) => setSchoolInfo(prev => ({ ...prev, affiliationNo: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-mono outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">School Code / UDISE No.</label>
              <input
                type="text"
                value={schoolInfo.schoolCode}
                onChange={(e) => setSchoolInfo(prev => ({ ...prev, schoolCode: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-mono outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-bold mb-1">Campus Address &amp; Location</label>
              <input
                type="text"
                value={schoolInfo.address}
                onChange={(e) => setSchoolInfo(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-medium outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Principal / Signatory Name</label>
              <input
                type="text"
                value={schoolInfo.principalName}
                onChange={(e) => setSchoolInfo(prev => ({ ...prev, principalName: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-bold outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Official School Crest / Logo URL</label>
              <input
                type="text"
                placeholder="https://... (or leave blank for generated gold seal)"
                value={schoolInfo.customLogoUrl}
                onChange={(e) => setSchoolInfo(prev => ({ ...prev, customLogoUrl: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* 7 TC TEMPLATE CAROUSEL SWITCHER (When Doc Type is 'tc') */}
      {docType === 'tc' && (
        <div className="bg-white rounded-3xl p-5 border border-amber-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                Select Certificate Design Template (7 Official Layouts)
              </h3>
            </div>
            <span className="text-[10px] text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold border border-amber-200">
              Active: {tcTemplatesList.find(t => t.id === tcTemplate)?.title}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {tcTemplatesList.map((tpl) => {
              const isSelected = tcTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => setTcTemplate(tpl.id)}
                  className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-400/50 scale-[1.03]'
                      : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider">{tpl.tag.split('•')[0]}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 font-bold" />}
                    </div>
                    <div className="text-xs font-black text-slate-900 leading-tight">{tpl.title}</div>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{tpl.desc}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span>{tpl.orientation}</span>
                    <span className="text-amber-700 font-bold">Apply</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Left Settings & Right Live Document Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Student Selector & Parameters */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-teal-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Candidate Record &amp; Variables</span>
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
                  <div className="text-[10px] text-slate-400 font-mono">DOB: {activeStudent.dob} &bull; Category: {activeStudent.caste_category || 'General'}</div>
                </div>
              </div>
              <div>
                {activeStudent.fee_status === 'Paid' ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                    Fee Cleared
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
                    Fee Due ₹35k
                  </span>
                )}
              </div>
            </div>

            {/* Event & Appreciation Specific Fields */}
            {(docType === 'appreciation' || docType === 'participation') && (
              <div className="space-y-3 p-3 bg-amber-50/60 rounded-2xl border border-amber-200">
                <div className="text-[11px] font-bold text-amber-900 uppercase">Award &amp; Event Details</div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Award / Honor Title</label>
                  <input
                    type="text"
                    value={awardTitle}
                    onChange={(e) => setAwardTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Competition / Event Name</label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                  />
                </div>
              </div>
            )}

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

            {docType === 'tc' && (
              <>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reason for Leaving</label>
                  <input
                    type="text"
                    value={reasonForLeaving}
                    onChange={(e) => setReasonForLeaving(e.target.value)}
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
              </>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">General Conduct / Evaluation</label>
              <input
                type="text"
                value={conduct}
                onChange={(e) => setConduct(e.target.value)}
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
                <span>Open Printable View / Download PDF</span>
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
                Official Live Document Preview
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                {docTypesList.find(d => d.id === docType)?.title}
              </span>
              {docType === 'tc' && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {tcTemplatesList.find(t => t.id === tcTemplate)?.orientation}
                </span>
              )}
            </div>
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
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">
                    {viewMode === 'all' 
                      ? `Bulk Print: ${docTypesList.find(d => d.id === docType)?.title} (All ${studentList.length} Students)` 
                      : `Official Print: ${docTypesList.find(d => d.id === docType)?.title} - ${activeStudent.student_name}`}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    High-resolution Board-compliant layout &bull; Ready for physical printer or saving as PDF
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
                  <div key={st.id || idx} className="space-y-2 print:page-break-after-always">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1 print:hidden">
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
                <span>Includes dynamic verification QR code &amp; institutional seal</span>
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
