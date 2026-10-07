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
  const [tcTemplate, setTcTemplate] = useState('sunrise_chevron');

  // 5 Appreciation & Merit Templates (Matching uploaded reference designs)
  const [appreciationTemplate, setAppreciationTemplate] = useState('modern_navy_gold_badge');

  // Fully customizable certificate text, citation, dates & signatories
  const [certConfig, setCertConfig] = useState({
    title: 'CERTIFICATE',
    subtitle: 'OF APPRECIATION',
    presentationLine: 'This certificate is presented to',
    recipientName: '', // empty means dynamically uses selected student name
    eventTitle: 'ANNUAL SCHOOL EXHIBITION',
    bodyText: 'For your participation and insightful contributions during the "ANNUAL SCHOOL EXHIBITION". Your creativity, curiosity, and enthusiasm have inspired others and greatly enriched the event.',
    awardDate: '10th of January, 2026',
    signatory1Name: 'Aaron Loeb',
    signatory1Title: 'School Principal',
    signatory2Name: 'Estelle Darcy',
    signatory2Title: 'Science Department Head',
    organizationName: 'Liceria & Co.'
  });

  // 5 Participation Templates (Matching uploaded reference designs)
  const [participationTemplate, setParticipationTemplate] = useState('classic_gold_filigree_frame');

  // 5 Student ID Card Templates
  const [idCardTemplate, setIdCardTemplate] = useState('navy_chevron');

  // 5 Character & Migration Templates
  const [migrationTemplate, setMigrationTemplate] = useState('cbse_official_migration');

  // 5 Domicile & Bonafide Templates
  const [domicileTemplate, setDomicileTemplate] = useState('statutory_residence_formal');

  // 5 Academic Report Card / Marksheet Templates
  const [reportCardTemplate, setReportCardTemplate] = useState('cbse_cce_holistic');

  // 5 Exam Admit Card / Hall Ticket Templates
  const [admitCardTemplate, setAdmitCardTemplate] = useState('statutory_hall_ticket');

  const [customClassSection, setCustomClassSection] = useState('');
  
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
      title: '🪪 Student ID Card (5 Templates)',
      subtitle: '5 Official Custom Layouts with Class/Section & Barcode',
      icon: IdCard,
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

  const idCardTemplatesList = [
    {
      id: 'navy_chevron',
      title: 'Navy Modern Chevron',
      tag: 'Landscape • Star Badge & Pill Header',
      desc: 'Top-left navy pennant ribbon, cyan geometric corners, bold blue Student Card pill banner',
      orientation: 'landscape',
      borderStyle: 'border-blue-800',
      activeBg: 'from-blue-600/30 to-indigo-600/20 border-blue-400 text-blue-200'
    },
    {
      id: 'sage_khaki',
      title: 'Sage Khaki & Honeycomb',
      tag: 'Landscape • Olive Crest & Signature',
      desc: 'Refined olive/sage khaki header, diagonal hazard stripes, honeycomb watermark & signature overlay',
      orientation: 'landscape',
      borderStyle: 'border-[#706e48]',
      activeBg: 'from-yellow-700/30 to-amber-700/20 border-yellow-500 text-yellow-200'
    },
    {
      id: 'terracotta_split',
      title: 'Minimalist Terracotta & Olive',
      tag: 'Landscape • Dual Color Split & Grid',
      desc: 'Sage green sidebar with orange accent border line, clean 2-column student metadata grid',
      orientation: 'landscape',
      borderStyle: 'border-orange-500',
      activeBg: 'from-orange-600/30 to-amber-600/20 border-orange-400 text-orange-200'
    },
    {
      id: 'emerald_wave',
      title: 'Emerald & Cyan Wave Flow',
      tag: 'Landscape • Guilloche Wave & Circular Photo',
      desc: 'Deep emerald/teal gradient curves, circular student portrait with glowing ring & sine wave patterns',
      orientation: 'landscape',
      borderStyle: 'border-teal-600',
      activeBg: 'from-teal-600/30 to-emerald-600/20 border-teal-400 text-teal-200'
    },
    {
      id: 'terracotta_portrait',
      title: 'Terracotta & Chocolate Heritage',
      tag: 'Portrait • Vertical Badge & Chevron',
      desc: 'Vertical ID card with warm rust geometric banner, lotus insignia, hazard accent tabs',
      orientation: 'portrait',
      borderStyle: 'border-[#9a4b27]',
      activeBg: 'from-amber-800/30 to-orange-800/20 border-amber-600 text-amber-200'
    }
  ];

  const appreciationTemplatesList = [
    {
      id: 'modern_navy_gold_badge',
      title: 'Modern Navy & Gold (Olivia Wilson)',
      tag: 'Landscape • Blue Rosette & Angled Chevron',
      desc: 'Deep navy borders, gold & silver chevron stripes, blue ribbon rosette, and graduation cap emblem',
      orientation: 'landscape',
      activeBg: 'from-blue-900/40 to-slate-900 border-amber-400 text-amber-200',
      defaultConfig: {
        title: 'CERTIFICATE',
        subtitle: 'OF APPRECIATION',
        presentationLine: 'This certificate is presented to',
        recipientName: '',
        eventTitle: 'ANNUAL SCHOOL EXHIBITION',
        bodyText: 'For your participation and insightful contributions during the "ANNUAL SCHOOL EXHIBITION". Your creativity, curiosity, and enthusiasm have inspired others and greatly enriched the event.',
        awardDate: '10th of January, 2026',
        signatory1Name: 'Aaron Loeb',
        signatory1Title: 'School Principal',
        signatory2Name: 'Estelle Darcy',
        signatory2Title: 'Science Department Head'
      }
    },
    {
      id: 'royal_navy_gold_geometric',
      title: 'Royal Navy & Gold Filigree (Noah Schumacher)',
      tag: 'Landscape • 3D Gold Medallion Rosette',
      desc: 'Ivory background, navy & gold diagonal angular bands, gold filigree flourishes, and large metallic gold seal',
      orientation: 'landscape',
      activeBg: 'from-amber-900/40 to-blue-950 border-amber-300 text-amber-200',
      defaultConfig: {
        title: 'CERTIFICATE OF',
        subtitle: 'APPRECIATION',
        presentationLine: 'PRESENTED TO',
        recipientName: '',
        eventTitle: 'Liceria & Co. Initiative',
        bodyText: 'In recognition of your outstanding dedication and invaluable contributions as a volunteer for Liceria & Co. Your commitment has significantly helped us achieve our goals.',
        awardDate: '10TH OF JANUARY, 2026',
        signatory1Name: 'MURAD NASER',
        signatory1Title: 'DIRECTOR',
        signatory2Name: '',
        signatory2Title: ''
      }
    },
    {
      id: 'mint_emerald_fluid_waves',
      title: 'Mint Emerald Fluid Waves (Alexander Aronowitz)',
      tag: 'Landscape • Fluid Waves & Silver/Gold Rosette',
      desc: 'Organic emerald & mint fluid ribbon sweeps in 4 corners, silver-gold rosette medal, green monogram logo, and dual script signatures',
      orientation: 'landscape',
      activeBg: 'from-emerald-900/40 to-teal-950 border-emerald-400 text-emerald-200',
      defaultConfig: {
        title: 'CERTIFICATE',
        subtitle: 'OF COMPLETION',
        presentationLine: 'This is to certify that',
        recipientName: '',
        eventTitle: 'Professional Training Program',
        bodyText: 'has successfully completed a professional training program conducted on January 15, 2026. Her dedication and commitment to the learning process are truly commendable.',
        awardDate: 'February 2, 2026',
        signatory1Name: 'Muhammad Patel',
        signatory1Title: 'Training Director',
        signatory2Name: 'Richard Sanchez',
        signatory2Title: 'Program Instructor'
      }
    },
    {
      id: 'cyan_emerald_curved_sweep',
      title: 'Dynamic Cyan & Emerald Sweep (Henrietta Mitchell)',
      tag: 'Landscape • Tech Lines & Hanging Gold Medal',
      desc: 'Layered forest green, emerald & cyan curved sweeps with fine raster lines, thin green border, and hanging golden medal',
      orientation: 'landscape',
      activeBg: 'from-cyan-900/40 to-emerald-950 border-cyan-400 text-cyan-200',
      defaultConfig: {
        title: 'CERTIFICATE',
        subtitle: 'OF PARTICIPATION',
        presentationLine: 'This Certificate Proudly Presented to:',
        recipientName: '',
        eventTitle: 'Wardiere Charity Run',
        bodyText: 'Actively participated in the Wardiere Charity Run, demonstrating dedication and enthusiasm. Your involvement helped make the event a resounding success. Presented on 20 Juni 2040.',
        awardDate: '20 Juni 2040',
        signatory1Name: 'SAMIRA HADID',
        signatory1Title: 'Event Director',
        signatory2Name: 'ALFREDO TORRES',
        signatory2Title: 'Co-Organizer'
      }
    },
    {
      id: 'forest_lime_polygon_mosaic',
      title: 'Geometric Forest & Lime Mosaic (Brigita Tsamara)',
      tag: 'Landscape • Geometric Triangle Mosaic',
      desc: 'Olive, forest & lime green geometric triangle mosaic clusters with zigzag lines, clover floral divider, and handwritten signature',
      orientation: 'landscape',
      activeBg: 'from-lime-900/40 to-emerald-950 border-lime-400 text-lime-200',
      defaultConfig: {
        title: 'CERTIFICATE',
        subtitle: 'OF PARTICIPATION',
        presentationLine: 'This certificate is proudly presented to',
        recipientName: '',
        eventTitle: 'Youth Engagement Program',
        bodyText: 'In recognition of active participation and meaningful contribution to the program. Your dedication and engagement are sincerely appreciated.',
        awardDate: '15th of March, 2026',
        signatory1Name: 'AVERY DAVIS',
        signatory1Title: 'Program Manager',
        signatory2Name: '',
        signatory2Title: ''
      }
    }
  ];

  const participationTemplatesList = [
    {
      id: 'classic_gold_filigree_frame',
      title: 'Classic Gold Filigree Frame (Benjamin Shah)',
      tag: 'Landscape • Ornate Baroque Frame & Bronze Seal',
      desc: 'Double thin gold border, dark navy/slate corner triangles with intricate baroque scrollwork, bronze-blue rosette seal',
      orientation: 'landscape',
      activeBg: 'from-amber-900/40 to-slate-900 border-amber-400 text-amber-200',
      defaultConfig: {
        title: 'CERTIFICATE OF',
        subtitle: 'PARTICIPATION',
        presentationLine: 'THIS IS PROUDLY PRESENTED TO',
        recipientName: '',
        eventTitle: 'Inter-School Art Competition',
        bodyText: 'for participating in the Inter-School Art Competition and demonstrating exceptional creative talent and artistic commitment.',
        awardDate: '14 August 2024',
        signatory1Name: 'Juliana Silva',
        signatory1Title: 'Art Coordinator',
        signatory2Name: 'Marceline Anderson',
        signatory2Title: 'School Principal'
      }
    },
    {
      id: 'modern_crystal_navy_angle',
      title: 'Modern Crystal & Navy Angle (Bartholomew Henderson)',
      tag: 'Landscape • Polygonal Facets & 3D Gold Medal',
      desc: 'Clean geometric crystal facets, navy diagonal wedge with double gold stripes, 3D gold rosette medal, and dual gold signatures',
      orientation: 'landscape',
      activeBg: 'from-blue-900/40 to-slate-900 border-amber-300 text-amber-200',
      defaultConfig: {
        title: 'CERTIFICATE',
        subtitle: 'OF PARTICIPATION',
        presentationLine: 'THIS CERTIFICATE IS PRESENTED TO',
        recipientName: '',
        eventTitle: 'Annual Science Fair 2024',
        bodyText: 'in recognition of their dedication, enthusiasm, and active participation in the Annual Science Fair 2024. Your curiosity and scientific acumen are truly commendable.',
        awardDate: '25 October 2024',
        signatory1Name: 'MUHAMMAD PATEL',
        signatory1Title: 'Event Organizer',
        signatory2Name: 'MORGAN MAXWELL',
        signatory2Title: 'Principal'
      }
    },
    {
      id: 'royal_purple_gold_arch',
      title: 'Royal Purple & Gold Arch (Henrietta Mitchell)',
      tag: 'Landscape • Scalloped Arch & Mandala Sunburst',
      desc: 'Royal purple Islamic scalloped arch & mandala crescent with gold trim, gold cursive calligraphy, and 3D gold sunburst medallion',
      orientation: 'landscape',
      activeBg: 'from-purple-900/40 to-slate-950 border-amber-400 text-amber-200',
      defaultConfig: {
        title: 'CERTIFICATE OF',
        subtitle: 'APPRECIATION',
        presentationLine: 'PROUDLY PRESENTED TO',
        recipientName: '',
        eventTitle: 'Youth Leadership Summit 2024',
        bodyText: 'in recognition of active participation and meaningful contribution to the Youth Leadership Summit. Your dedication and vision have inspired our entire community.',
        awardDate: '12 November 2024',
        signatory1Name: 'AVERY DAVIS',
        signatory1Title: 'Director',
        signatory2Name: 'YANIS PETROS',
        signatory2Title: 'Program Coordinator'
      }
    },
    {
      id: 'lavender_sunset_wave',
      title: 'Lavender & Sunset Waves (Estelle Darcy)',
      tag: 'Landscape • Fluid Waves & Amber Calligraphy',
      desc: 'Pastel lavender & violet fluid wave borders with warm sunset glow, vibrant amber cursive calligraphy, and signature lines',
      orientation: 'landscape',
      activeBg: 'from-purple-900/40 to-rose-950 border-purple-400 text-purple-200',
      defaultConfig: {
        title: 'CERTIFICATE',
        subtitle: 'OF PARTICIPATION',
        presentationLine: 'THIS CERTIFICATE IS PROUDLY PRESENTED TO',
        recipientName: '',
        eventTitle: 'Creative Writing Workshop',
        bodyText: 'for her enthusiastic participation and valuable contribution to the Creative Writing Workshop. Your passion for words and storytelling has enriched our sessions.',
        awardDate: '08 September 2024',
        signatory1Name: 'Daniel Gallego',
        signatory1Title: 'Workshop Mentor',
        signatory2Name: 'Sacha Dubois',
        signatory2Title: 'Department Head'
      }
    },
    {
      id: 'imperial_baroque_gold_crest',
      title: 'Imperial Baroque Gold Crest (Muhammad Patel)',
      tag: 'Landscape • Full Baroque Filigree Frame & Crown',
      desc: 'Antique warm ivory parchment framed in complete royal baroque gold scrollwork, crown top motif, and scalloped gold seal',
      orientation: 'landscape',
      activeBg: 'from-amber-950 to-stone-900 border-amber-400 text-amber-200',
      defaultConfig: {
        title: 'CERTIFICATE',
        subtitle: 'OF PARTICIPATION',
        presentationLine: 'THIS IS PROUDLY PRESENTED TO',
        recipientName: '',
        eventTitle: 'Community Service Initiative',
        bodyText: 'for their active involvement, dedication, and valuable contributions in the Community Service Initiative. Your tireless efforts made a profound positive difference.',
        awardDate: '20 December 2024',
        signatory1Name: 'Samira Hadid',
        signatory1Title: 'Project Lead',
        signatory2Name: 'Morgan Maxwell',
        signatory2Title: 'Managing Director'
      }
    }
  ];

  const migrationTemplatesList = [
    {
      id: 'cbse_official_migration',
      title: 'Statutory Board Clearance',
      tag: 'Portrait • CBSE/ICSE Standard',
      desc: 'Statutory numbered clauses, watermark emblem, double principal & exam in-charge seal',
      orientation: 'portrait',
      activeBg: 'from-emerald-700/30 to-teal-700/20 border-emerald-400 text-emerald-200'
    },
    {
      id: 'heritage_gold_seal',
      title: 'Heritage Golden Conduct Seal',
      tag: 'Portrait • Classical Filigree',
      desc: 'Formal serif typography, golden embossed crest, institutional good-conduct verdict',
      orientation: 'portrait',
      activeBg: 'from-amber-700/30 to-yellow-700/20 border-amber-400 text-amber-200'
    },
    {
      id: 'modern_security_qr',
      title: 'Modern High-Security Digital QR',
      tag: 'Landscape • QR Cryptographic',
      desc: 'Security anti-tamper guilloche borders, dynamic QR verification token, clearance checklist',
      orientation: 'landscape',
      activeBg: 'from-cyan-700/30 to-teal-700/20 border-cyan-400 text-cyan-200'
    },
    {
      id: 'classic_blue_parchment',
      title: 'Executive Navy & Ivory Leaving',
      tag: 'Portrait • Formal Parchment',
      desc: 'Navy formal headers, detailed disciplinary clearance checklist & character remarks',
      orientation: 'portrait',
      activeBg: 'from-blue-700/30 to-indigo-700/20 border-blue-400 text-blue-200'
    },
    {
      id: 'tri_color_statutory',
      title: 'National Statutory Clear-Pass',
      tag: 'Portrait • Interstate Transfer',
      desc: 'Formal bordered interstate migration certificate with registrar seal and character grade',
      orientation: 'portrait',
      activeBg: 'from-slate-700/30 to-slate-800/20 border-slate-400 text-slate-200'
    }
  ];

  const domicileTemplatesList = [
    {
      id: 'statutory_residence_formal',
      title: 'Official Statutory Residence',
      tag: 'Portrait • UIDAI & UDISE Record',
      desc: 'Government/institutional residency format with UIDAI & UDISE official verification',
      orientation: 'portrait',
      activeBg: 'from-blue-700/30 to-sky-700/20 border-blue-400 text-blue-200'
    },
    {
      id: 'heritage_academic_bonafide',
      title: 'Heritage Academic Enrollment',
      tag: 'Portrait • Attested Photograph',
      desc: 'Classic ornamental frame with student photograph, parent details, and registrar stamp',
      orientation: 'portrait',
      activeBg: 'from-indigo-700/30 to-blue-700/20 border-indigo-400 text-indigo-200'
    },
    {
      id: 'modern_digital_bonafide',
      title: 'Modern Digital Authenticated',
      tag: 'Landscape • Digital Barcode Pass',
      desc: 'Clean corporate design with digital signature stamp, barcode, and residency duration table',
      orientation: 'landscape',
      activeBg: 'from-teal-700/30 to-cyan-700/20 border-teal-400 text-teal-200'
    },
    {
      id: 'regal_navy_institutional',
      title: 'Regal Navy Campus Bonafide',
      tag: 'Portrait • Embossed Gold Crest',
      desc: 'Deep navy border with embossed gold seal and institutional head verification text',
      orientation: 'portrait',
      activeBg: 'from-slate-700/30 to-blue-900/20 border-blue-400 text-blue-200'
    },
    {
      id: 'minimalist_board_proof',
      title: 'Minimalist Board Verification',
      tag: 'Landscape • Institutional Clear',
      desc: 'Clean monochrome table layout with student credentials and fee clearance confirmation',
      orientation: 'landscape',
      activeBg: 'from-amber-700/30 to-orange-700/20 border-amber-400 text-amber-200'
    }
  ];

  const reportCardTemplatesList = [
    {
      id: 'cbse_cce_holistic',
      title: 'CBSE Holistic Term Marksheet',
      tag: 'Portrait • Scholastic & Co-Scholastic',
      desc: '8-subject table, attendance percentage, scholastic grades (A1-E), and teacher evaluation',
      orientation: 'portrait',
      activeBg: 'from-purple-700/30 to-indigo-700/20 border-purple-400 text-purple-200'
    },
    {
      id: 'modern_analytics_dashboard',
      title: 'Modern Visual Performance Matrix',
      tag: 'Landscape • Percentile & Progress',
      desc: 'Subject marks with visual progress bars, percentile graphs, rank badge, and grading breakdown',
      orientation: 'landscape',
      activeBg: 'from-cyan-700/30 to-purple-700/20 border-cyan-400 text-cyan-200'
    },
    {
      id: 'classic_heritage_transcript',
      title: 'Classic Academic Transcript',
      tag: 'Portrait • Distinction Honors',
      desc: 'Traditional double-border marksheet with maximum/minimum/obtained marks breakdown',
      orientation: 'portrait',
      activeBg: 'from-blue-700/30 to-slate-700/20 border-blue-400 text-blue-200'
    },
    {
      id: 'cambridge_igcse_gradebook',
      title: 'Cambridge IGCSE Gradebook',
      tag: 'Portrait • Letter Grade Scale',
      desc: 'International letter grades (A*, A, B...), component credits, GPA scale, and principal sign-off',
      orientation: 'portrait',
      activeBg: 'from-emerald-700/30 to-teal-700/20 border-emerald-400 text-emerald-200'
    },
    {
      id: 'executive_split_semester',
      title: 'Bi-Semester Comparative Sheet',
      tag: 'Landscape • Term 1 vs Term 2',
      desc: 'Side-by-side Term 1 vs Term 2 comparative performance table with cumulative CGPA',
      orientation: 'landscape',
      activeBg: 'from-rose-700/30 to-purple-700/20 border-rose-400 text-rose-200'
    }
  ];

  const admitCardTemplatesList = [
    {
      id: 'statutory_hall_ticket',
      title: 'Board Examination Hall Ticket',
      tag: 'Portrait • Timetable & Center',
      desc: 'Candidate photo, roll number barcode, statutory 6-exam timetable, and superintendent seal',
      orientation: 'portrait',
      activeBg: 'from-amber-700/30 to-orange-700/20 border-amber-400 text-amber-200'
    },
    {
      id: 'modern_qr_admit_pass',
      title: 'Modern Digital QR Hall Ticket',
      tag: 'Landscape • Dynamic QR Pass',
      desc: 'High-tech security layout with dynamic QR scanning box, seat number badge, and timetable',
      orientation: 'landscape',
      activeBg: 'from-cyan-700/30 to-blue-700/20 border-cyan-400 text-cyan-200'
    },
    {
      id: 'split_photo_admit_card',
      title: 'Dual-Photo Invigilator Pass',
      tag: 'Portrait • Invigilator Verification',
      desc: 'Candidate photograph, invigilator signature boxes, room allocation & identification checklist',
      orientation: 'portrait',
      activeBg: 'from-blue-700/30 to-indigo-700/20 border-blue-400 text-blue-200'
    },
    {
      id: 'compact_slip_format',
      title: 'Compact Slip Examination Pass',
      tag: 'Landscape • Pocket Laminated',
      desc: 'Pocket-sized laminated hall ticket format with subject dates, room slot, and candidate rules',
      orientation: 'landscape',
      activeBg: 'from-teal-700/30 to-emerald-700/20 border-teal-400 text-teal-200'
    },
    {
      id: 'executive_navy_hall_ticket',
      title: 'Executive Navy Hall Ticket & Rules',
      tag: 'Portrait • Full Regulations',
      desc: 'Full-page official admit card with comprehensive examination hall rules & statutory clauses',
      orientation: 'portrait',
      activeBg: 'from-slate-700/30 to-indigo-700/20 border-slate-400 text-slate-200'
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

  // 1. Blue Ribbon Rosette Badge (for Olivia Wilson Design)
  const BlueRosetteRibbonBadge = ({ size = 88 }) => (
    <div className="relative inline-flex items-center justify-center select-none" style={{ width: size, height: size * 1.25 }}>
      <svg viewBox="0 0 100 125" className="w-full h-full drop-shadow-xl">
        <defs>
          <linearGradient id="goldRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="80%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="blueDiscGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>
        {/* Ribbon tails */}
        <polygon points="32,65 32,120 45,108 45,65" fill="#1e3a8a" stroke="#d97706" strokeWidth="1.5" />
        <polygon points="68,65 68,120 55,108 55,65" fill="#1e3a8a" stroke="#d97706" strokeWidth="1.5" />
        <polygon points="36,65 36,114 45,108 45,65" fill="#2563eb" opacity="0.6" />
        <polygon points="64,65 64,114 55,108 55,65" fill="#2563eb" opacity="0.6" />

        {/* Fluted Starburst Rosette */}
        <polygon
          points="50,2 56,12 68,6 72,18 84,16 84,28 96,30 92,42 100,48 92,58 98,66 88,74 90,86 78,88 76,100 64,96 58,106 50,98 42,106 36,96 24,100 22,88 10,86 12,74 2,66 8,58 0,48 8,42 4,30 16,28 16,16 28,18 32,6 44,12"
          fill="url(#goldRibbonGrad)"
          stroke="#78350f"
          strokeWidth="1"
        />
        <circle cx="50" cy="50" r="38" fill="url(#goldRibbonGrad)" stroke="#fef08a" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="34" fill="#0f172a" />
        <circle cx="50" cy="50" r="32" fill="url(#blueDiscGrad)" stroke="#fef08a" strokeWidth="2" />
        <circle cx="50" cy="50" r="28" fill="none" stroke="#93c5fd" strokeWidth="1" strokeDasharray="2 1" />
      </svg>
    </div>
  );

  // 2. Gold Medallion Rosette with Ribbon (for Noah Schumacher Design)
  const GoldMedallionRosette = ({ size = 92 }) => (
    <div className="relative inline-flex items-center justify-center select-none" style={{ width: size, height: size * 1.3 }}>
      <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-xl">
        <defs>
          <linearGradient id="richGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="25%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="75%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <radialGradient id="goldRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </radialGradient>
        </defs>
        {/* Golden ribbon tails */}
        <polygon points="30,65 30,122 44,110 44,65" fill="url(#richGoldGrad)" stroke="#78350f" strokeWidth="1" />
        <polygon points="70,65 70,122 56,110 56,65" fill="url(#richGoldGrad)" stroke="#78350f" strokeWidth="1" />
        
        {/* Metallic disc & sunburst */}
        <circle cx="50" cy="46" r="44" fill="url(#richGoldGrad)" stroke="#78350f" strokeWidth="1.5" />
        <circle cx="50" cy="46" r="39" fill="#fffbeb" stroke="#b45309" strokeWidth="1" />
        <circle cx="50" cy="46" r="35" fill="url(#goldRadial)" stroke="#fef08a" strokeWidth="1.5" />
        <circle cx="50" cy="46" r="28" fill="url(#richGoldGrad)" />
        <g stroke="#fffbeb" strokeWidth="1" opacity="0.65">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
            <line key={deg} x1="50" y1="18" x2="50" y2="46" transform={`rotate(${deg} 50 46)`} />
          ))}
        </g>
        <circle cx="50" cy="46" r="12" fill="#fef08a" stroke="#b45309" strokeWidth="1" />
      </svg>
    </div>
  );

  // 3. Silver & Gold Rosette (for Alexander Aronowitz Design)
  const SilverGoldRosette = ({ size = 80 }) => (
    <div className="relative inline-flex items-center justify-center select-none" style={{ width: size, height: size * 1.25 }}>
      <svg viewBox="0 0 100 125" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="silverRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id="goldCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
        </defs>
        <polygon points="34,58 34,115 45,105 45,58" fill="url(#silverRibbonGrad)" stroke="#cbd5e1" strokeWidth="1" />
        <polygon points="66,58 66,115 55,105 55,58" fill="url(#silverRibbonGrad)" stroke="#cbd5e1" strokeWidth="1" />
        
        <circle cx="50" cy="44" r="38" fill="url(#silverRibbonGrad)" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="50" cy="44" r="32" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
        <circle cx="50" cy="44" r="26" fill="url(#goldCoreGrad)" stroke="#fde047" strokeWidth="2" />
        <circle cx="50" cy="44" r="18" fill="url(#silverRibbonGrad)" stroke="#ffffff" strokeWidth="1" />
      </svg>
    </div>
  );

  // 4. Hanging Gold Medal (for Henrietta Mitchell Design)
  const HangingGoldMedal = ({ size = 68 }) => (
    <div className="relative inline-flex items-center justify-center select-none" style={{ width: size, height: size * 1.35 }}>
      <svg viewBox="0 0 100 135" className="w-full h-full drop-shadow-xl">
        <defs>
          <linearGradient id="medalGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="80%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
        </defs>
        <polygon points="38,0 50,28 34,28 22,0" fill="#f59e0b" />
        <polygon points="62,0 50,28 66,28 78,0" fill="#d97706" />
        <polygon points="45,22 55,22 55,34 45,34" fill="#92400e" />

        <circle cx="50" cy="76" r="40" fill="#1e293b" />
        <circle cx="50" cy="76" r="38" fill="url(#medalGoldGrad)" stroke="#fef08a" strokeWidth="2" />
        <circle cx="50" cy="76" r="32" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
        <circle cx="50" cy="76" r="28" fill="url(#medalGoldGrad)" />
        <polygon points="50,64 53,72 61,72 55,77 57,85 50,80 43,85 45,77 39,72 47,72" fill="#fef3c7" stroke="#78350f" strokeWidth="0.8" />
      </svg>
    </div>
  );

  // 5. Baroque Corner Filigree
  const CornerBaroqueFiligree = ({ className = "" }) => (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
      <path d="M 5,5 Q 30,10 50,30 Q 70,10 95,5 Q 90,30 70,50 Q 90,70 95,95 Q 70,90 50,70 Q 30,90 5,95 Q 10,70 30,50 Q 10,30 5,5 Z M 50,42 Q 54,46 50,50 Q 46,46 50,42 Z" opacity="0.9" />
      <circle cx="20" cy="20" r="3" />
      <circle cx="80" cy="20" r="3" />
      <circle cx="20" cy="80" r="3" />
      <circle cx="80" cy="80" r="3" />
    </svg>
  );

  // 6. Realistic Cursive Handwriting Signature
  const HandWrittenSignature = ({ name = "Avery Davis", color = "#1e293b" }) => (
    <svg viewBox="0 0 200 60" className="w-28 sm:w-32 h-8 sm:h-10 mx-auto pointer-events-none select-none opacity-85">
      <path
        d="M 15 35 Q 35 10 55 25 T 85 40 Q 100 15 120 30 T 150 20 Q 170 45 185 25"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M 30 45 Q 90 40 170 38"
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );

  // 7. Bronze-Blue Rosette Seal (for Benjamin Shah Classic Filigree Design)
  const BronzeBlueRosetteSeal = ({ size = 80 }) => (
    <div className="relative inline-flex items-center justify-center select-none" style={{ width: size, height: size * 1.2 }}>
      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xl">
        <defs>
          <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="40%" stopColor="#b45309" />
            <stop offset="80%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          <linearGradient id="deepNavySealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
        </defs>
        {/* Ribbon Tails */}
        <polygon points="34,60 34,115 45,102 45,60" fill="#1e3a8a" stroke="#d97706" strokeWidth="1" />
        <polygon points="66,60 66,115 55,102 55,60" fill="#1e3a8a" stroke="#d97706" strokeWidth="1" />
        {/* Bronze Starburst Rosette */}
        <polygon
          points="50,4 55,12 65,8 68,18 78,16 79,26 89,27 87,37 95,41 90,50 96,57 88,63 90,73 80,76 78,86 68,84 64,93 55,88 50,96 45,88 36,93 32,84 22,86 20,76 10,73 12,63 4,57 10,50 5,41 13,37 11,27 21,26 22,16 32,18 35,8 45,12"
          fill="url(#bronzeGrad)"
          stroke="#451a03"
          strokeWidth="0.8"
        />
        <circle cx="50" cy="48" r="38" fill="url(#bronzeGrad)" stroke="#fef08a" strokeWidth="1" />
        <circle cx="50" cy="48" r="32" fill="url(#deepNavySealGrad)" stroke="#d97706" strokeWidth="1.5" />
        <circle cx="50" cy="48" r="28" fill="none" stroke="#fef08a" strokeWidth="0.8" strokeDasharray="3 1.5" />
        <polygon points="50,36 53,44 61,44 55,49 57,57 50,52 43,57 45,49 39,44 47,44" fill="#fef08a" stroke="#b45309" strokeWidth="0.5" />
      </svg>
    </div>
  );

  // 8. Scalloped Royal Gold Medallion (for Imperial Baroque & Royal Purple Designs)
  const ScallopedGoldMedallion = ({ size = 80 }) => (
    <div className="relative inline-flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
        <defs>
          <linearGradient id="scallopGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="25%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="85%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="url(#scallopGoldGrad)" stroke="#78350f" strokeWidth="1.2" />
        <circle cx="50" cy="50" r="40" fill="#fffbeb" stroke="#b45309" strokeWidth="1" />
        <circle cx="50" cy="50" r="36" fill="url(#scallopGoldGrad)" stroke="#fef08a" strokeWidth="1" />
        <circle cx="50" cy="50" r="28" fill="#1e293b" />
        <g stroke="#fef08a" strokeWidth="1" opacity="0.8">
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <line key={deg} x1="50" y1="24" x2="50" y2="50" transform={`rotate(${deg} 50 50)`} />
          ))}
        </g>
        <polygon points="50,38 53,46 61,46 55,51 57,59 50,54 43,59 45,51 39,46 47,46" fill="#fef08a" stroke="#b45309" strokeWidth="0.5" />
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
  // TEMPLATE 1: Modern Navy & Gold with Blue Rosette (Olivia Wilson Design)
  // =========================================================================
  const renderModernNavyGoldBadgeAppreciation = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'Olivia Wilson';
    const certTitle = certConfig.title || 'CERTIFICATE';
    const certSubtitle = certConfig.subtitle || 'OF APPRECIATION';
    const certPresentation = certConfig.presentationLine || 'This certificate is presented to';
    const certBody = certConfig.bodyText || `For your participation and insightful contributions during the "${certConfig.eventTitle || 'ANNUAL SCHOOL EXHIBITION'}". Your creativity, curiosity, and enthusiasm have inspired others and greatly enriched the event.`;
    const certSig1Name = certConfig.signatory1Name || 'Aaron Loeb';
    const certSig1Title = certConfig.signatory1Title || 'School Principal';
    const certSig2Name = certConfig.signatory2Name || 'Estelle Darcy';
    const certSig2Title = certConfig.signatory2Title || 'Science Department Head';

    return (
      <div className="bg-[#151c38] p-4 sm:p-6 rounded-3xl shadow-2xl relative overflow-hidden font-sans max-w-4xl mx-auto">
        {/* Left and Right Angled Yellow-Gold and Silver Chevron Stripes */}
        <div className="absolute top-0 left-0 bottom-0 w-20 pointer-events-none">
          <svg viewBox="0 0 100 500" preserveAspectRatio="none" className="w-full h-full">
            <polygon points="0,0 60,0 100,180 0,180" fill="#f59e0b" />
            <polygon points="0,180 100,180 40,340 0,340" fill="#e2e8f0" />
            <polygon points="0,340 40,340 80,500 0,500" fill="#f59e0b" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 bottom-0 w-20 pointer-events-none">
          <svg viewBox="0 0 100 500" preserveAspectRatio="none" className="w-full h-full">
            <polygon points="40,0 100,0 100,180 0,180" fill="#f59e0b" />
            <polygon points="0,180 100,180 100,340 60,340" fill="#e2e8f0" />
            <polygon points="60,340 100,340 100,500 20,500" fill="#f59e0b" />
          </svg>
        </div>

        {/* Main White Certificate Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 relative z-10 text-center shadow-lg border border-slate-100 overflow-hidden">
          {/* Top-Left Blue Rosette Badge */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
            <BlueRosetteRibbonBadge size={82} />
          </div>

          {/* Bottom-Right Halftone Dotted Triangle Grid */}
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 opacity-40 pointer-events-none">
            <div className="grid grid-cols-6 gap-1.5 w-16 h-16">
              {[...Array(21)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#151c38]"></div>
              ))}
            </div>
          </div>

          {/* Center Graduation Cap Emblem */}
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[#151c38]">
              <GraduationCap className="w-7 h-7 text-[#1e293b]" />
            </div>
          </div>

          {/* Certificate Title */}
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-wider uppercase font-sans">
            {certTitle}
          </h1>
          <div className="text-xs sm:text-sm font-bold text-slate-700 tracking-widest uppercase mt-0.5">
            {certSubtitle}
          </div>

          {/* Presentation Subtitle */}
          <p className="text-xs font-semibold text-slate-500 mt-4 tracking-wide">
            {certPresentation}
          </p>

          {/* Recipient Name in Elegant Gold Calligraphy */}
          <div className="my-2 max-w-md mx-auto">
            <h2 className="text-3xl sm:text-5xl font-serif italic text-[#c89229] font-normal tracking-wide capitalize" style={{ fontFamily: 'Playfair Display, "Brush Script MT", cursive, serif' }}>
              {certRecipient}
            </h2>
            <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-[#c89229] to-transparent mx-auto mt-1" />
          </div>

          {/* Class / Batch Indicator */}
          {st.class_batch && (
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Class &amp; Section: <span className="text-slate-800 font-extrabold">{customClassSection || st.class_batch}</span>
            </div>
          )}

          {/* Citation Body Text */}
          <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-xl mx-auto px-4 mt-2 font-sans font-normal">
            {certBody}
          </p>

          {/* Signatories (Left & Right with clean lines) */}
          <div className="pt-8 sm:pt-10 flex items-end justify-between px-4 sm:px-12">
            <div className="text-center min-w-[120px]">
              <div className="w-32 sm:w-40 h-0.5 bg-slate-900 mx-auto mb-1.5" />
              <strong className="text-xs font-black text-slate-900 block">{certSig1Name}</strong>
              <span className="text-[10px] text-slate-500 font-medium">{certSig1Title}</span>
            </div>

            <div className="text-center min-w-[120px]">
              <div className="w-32 sm:w-40 h-0.5 bg-slate-900 mx-auto mb-1.5" />
              <strong className="text-xs font-black text-slate-900 block">{certSig2Name}</strong>
              <span className="text-[10px] text-slate-500 font-medium">{certSig2Title}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // TEMPLATE 2: Royal Navy & Gold Geometric Filigree (Noah Schumacher Design)
  // =========================================================================
  const renderRoyalNavyGoldGeometricAppreciation = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'Noah Schumacher';
    const certTitle = certConfig.title || 'CERTIFICATE OF';
    const certSubtitle = certConfig.subtitle || 'APPRECIATION';
    const certPresentation = certConfig.presentationLine || 'PRESENTED TO';
    const certBody = certConfig.bodyText || 'In recognition of your outstanding dedication and invaluable contributions as a volunteer for Liceria & Co. Your commitment has significantly helped us achieve our goals.';
    const certDate = certConfig.awardDate || 'AWARDED THIS 10TH OF JANUARY, 2026';
    const certSig1Name = certConfig.signatory1Name || 'MURAD NASER';
    const certSig1Title = certConfig.signatory1Title || 'DIRECTOR';

    return (
      <div className="bg-[#fefcf6] p-6 sm:p-9 rounded-3xl shadow-2xl relative overflow-hidden font-serif max-w-4xl mx-auto border-4 border-[#d4af37]/60">
        {/* Left & Right Navy and Gold Geometric Angular Bands */}
        <div className="absolute top-0 left-0 bottom-0 w-28 pointer-events-none">
          <svg viewBox="0 0 120 500" preserveAspectRatio="none" className="w-full h-full">
            <polygon points="0,0 80,0 0,220" fill="#1e2547" />
            <polygon points="0,0 120,0 0,350" fill="#c99a3e" opacity="0.9" />
            <polygon points="0,150 100,500 0,500" fill="#1e2547" />
            <polygon points="0,280 60,500 0,500" fill="#c99a3e" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 bottom-0 w-28 pointer-events-none">
          <svg viewBox="0 0 120 500" preserveAspectRatio="none" className="w-full h-full">
            <polygon points="40,0 120,0 120,220" fill="#c99a3e" />
            <polygon points="0,0 120,0 120,350" fill="#1e2547" opacity="0.95" />
            <polygon points="20,500 120,150 120,500" fill="#c99a3e" />
            <polygon points="60,500 120,280 120,500" fill="#1e2547" />
          </svg>
        </div>

        {/* Inner Gold Thin Border */}
        <div className="absolute top-4 left-4 right-4 bottom-4 border border-[#c99a3e]/60 rounded-xl pointer-events-none" />

        {/* Baroque Corner Filigree Accents */}
        <div className="absolute top-6 right-6 w-12 h-12 text-[#c99a3e] pointer-events-none opacity-80">
          <CornerBaroqueFiligree />
        </div>
        <div className="absolute bottom-6 right-6 w-12 h-12 text-[#c99a3e] pointer-events-none opacity-80 rotate-90">
          <CornerBaroqueFiligree />
        </div>

        {/* Main Certificate Content */}
        <div className="relative z-10 text-center px-8 sm:px-14 py-4">
          {/* Left Gold Medallion Rosette */}
          <div className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <GoldMedallionRosette size={96} />
          </div>

          {/* Top Title */}
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#1e2547] tracking-wider uppercase">
            {certTitle}
          </h1>
          <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#1e2547] tracking-widest uppercase mt-0.5">
            {certSubtitle}
          </h2>

          {/* Subtitle Presentation */}
          <div className="text-[10px] font-bold tracking-widest text-[#1e2547] uppercase mt-4">
            {certPresentation}
          </div>

          {/* Recipient Name in Dark Navy Flowing Script */}
          <div className="my-2 max-w-lg mx-auto">
            <h3 className="text-4xl sm:text-5xl text-[#1e2547] font-serif italic tracking-wide" style={{ fontFamily: 'Playfair Display, "Brush Script MT", cursive, serif' }}>
              {certRecipient}
            </h3>
          </div>

          {/* Class / Batch Indicator */}
          {st.class_batch && (
            <div className="text-[10px] font-bold text-[#c99a3e] uppercase tracking-wider mb-1">
              Class &amp; Section: <span className="text-[#1e2547] font-extrabold">{customClassSection || st.class_batch}</span>
            </div>
          )}

          {/* Body Citation */}
          <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed max-w-md mx-auto px-4 mt-2 font-serif font-medium">
            {certBody}
          </p>

          {/* Award Date */}
          <div className="text-[10px] sm:text-[11px] font-bold text-[#1e2547] tracking-widest uppercase mt-6">
            {certDate.toUpperCase().includes('AWARDED') ? certDate : `AWARDED THIS ${certDate.toUpperCase()}`}
          </div>

          {/* Signatory Director */}
          <div className="pt-4 text-center">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              {certSig1Title}
            </div>
            <strong className="text-xs font-bold text-[#1e2547] uppercase tracking-wider block">
              {certSig1Name}
            </strong>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // TEMPLATE 3: Mint Emerald Fluid Ribbon Waves (Alexander Aronowitz Design)
  // =========================================================================
  const renderMintEmeraldFluidWavesAppreciation = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'Alexander Aronowitz';
    const certTitle = certConfig.title || 'CERTIFICATE';
    const certSubtitle = certConfig.subtitle || 'OF COMPLETION';
    const certPresentation = certConfig.presentationLine || 'This is to certify that';
    const certBody = certConfig.bodyText || `has successfully completed a professional training program conducted on January 15, 2026. Her dedication and commitment to the learning process are truly commendable.`;
    const certDate = certConfig.awardDate || 'February 2, 2026';
    const certSig1Name = certConfig.signatory1Name || 'Muhammad Patel';
    const certSig1Title = certConfig.signatory1Title || 'Training Director';
    const certSig2Name = certConfig.signatory2Name || 'Richard Sanchez';
    const certSig2Title = certConfig.signatory2Title || 'Program Instructor';

    return (
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden font-sans max-w-4xl mx-auto border-2 border-emerald-100">
        {/* Mint & Emerald Fluid Abstract Wave Curves on all 4 Corners */}
        <div className="absolute top-0 left-0 w-48 h-48 pointer-events-none opacity-85">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path d="M 0,0 C 80,20 120,60 160,0 L 0,0 Z" fill="#2dd4bf" opacity="0.6" />
            <path d="M 0,0 C 40,80 80,120 0,180 L 0,0 Z" fill="#0f766e" opacity="0.8" />
            <path d="M 0,0 C 60,60 100,100 0,140 Z" fill="#14b8a6" opacity="0.7" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none opacity-85">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path d="M 200,0 C 120,20 80,60 40,0 L 200,0 Z" fill="#0f766e" opacity="0.7" />
            <path d="M 200,0 C 160,80 120,120 200,180 L 200,0 Z" fill="#2dd4bf" opacity="0.8" />
            <path d="M 200,0 C 140,60 100,100 200,140 Z" fill="#14b8a6" opacity="0.6" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none opacity-85">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path d="M 0,200 C 40,120 80,80 0,20 L 0,200 Z" fill="#0f766e" opacity="0.7" />
            <path d="M 0,200 C 80,180 120,140 160,200 L 0,200 Z" fill="#2dd4bf" opacity="0.8" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none opacity-85">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path d="M 200,200 C 160,120 120,80 200,20 L 200,200 Z" fill="#2dd4bf" opacity="0.6" />
            <path d="M 200,200 C 120,180 80,140 40,200 L 200,200 Z" fill="#0f766e" opacity="0.8" />
          </svg>
        </div>

        {/* Top Header: Left Silver/Gold Rosette & Right Emerald Monogram Logo */}
        <div className="flex items-start justify-between relative z-10 px-2 sm:px-6">
          <SilverGoldRosette size={76} />
          
          <div className="flex items-center gap-2">
            {schoolInfo.customLogoUrl ? (
              <img src={schoolInfo.customLogoUrl} alt="Logo" className="w-12 h-12 object-contain" />
            ) : (
              <div className="text-right">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border-2 border-emerald-600 flex items-center justify-center font-black text-emerald-800 text-lg ml-auto shadow-sm">
                  S
                </div>
                <div className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest mt-0.5">LOGO</div>
              </div>
            )}
          </div>
        </div>

        {/* Center Main Title */}
        <div className="text-center relative z-10 -mt-6 sm:-mt-8">
          <h1 className="text-3xl sm:text-4xl font-sans font-black text-[#136f4b] tracking-wider uppercase">
            {certTitle}
          </h1>
          <div className="text-xs sm:text-sm font-bold text-[#136f4b] tracking-widest uppercase mt-0.5">
            {certSubtitle}
          </div>

          <p className="text-xs font-serif italic text-slate-500 mt-4">
            {certPresentation}
          </p>

          {/* Recipient Name in Refined Emerald Serif */}
          <div className="my-2 max-w-lg mx-auto">
            <h2 className="text-3xl sm:text-4xl font-serif text-[#136f4b] font-normal tracking-wide">
              {certRecipient}
            </h2>
            <div className="flex items-center justify-center gap-2 text-[#136f4b] my-1">
              <span className="w-16 h-0.5 bg-[#136f4b]"></span>
              <span className="text-xs">◆</span>
              <span className="w-16 h-0.5 bg-[#136f4b]"></span>
            </div>
          </div>

          {/* Class / Batch Indicator */}
          {st.class_batch && (
            <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
              Class &amp; Section: <span className="text-slate-900 font-extrabold">{customClassSection || st.class_batch}</span>
            </div>
          )}

          {/* Citation Body Text */}
          <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-xl mx-auto px-4 mt-2 font-sans font-normal">
            {certBody}
          </p>

          {/* Award Date */}
          <div className="text-xs font-bold text-slate-900 mt-4">
            {certDate.toLowerCase().includes('awarded') ? certDate : `Awarded on ${certDate}`}
          </div>

          {/* Signatories with Handwritten Signatures */}
          <div className="pt-6 sm:pt-8 flex items-end justify-between px-6 sm:px-14">
            <div className="text-center min-w-[120px]">
              <HandWrittenSignature name={certSig1Name} color="#0f766e" />
              <strong className="text-xs font-bold text-slate-900 block mt-1">{certSig1Name}</strong>
              <span className="text-[10px] text-slate-500 font-medium">{certSig1Title}</span>
            </div>

            <div className="text-center min-w-[120px]">
              <HandWrittenSignature name={certSig2Name} color="#0f766e" />
              <strong className="text-xs font-bold text-slate-900 block mt-1">{certSig2Name}</strong>
              <span className="text-[10px] text-slate-500 font-medium">{certSig2Title}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // TEMPLATE 4: Dynamic Cyan & Emerald Curved Sweep (Henrietta Mitchell Design)
  // =========================================================================
  const renderCyanEmeraldCurvedSweepAppreciation = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'Henrietta Mitchell';
    const certTitle = certConfig.title || 'CERTIFICATE';
    const certSubtitle = certConfig.subtitle || 'OF PARTICIPATION';
    const certPresentation = certConfig.presentationLine || 'This Certificate Proudly Presented to:';
    const certBody = certConfig.bodyText || `Actively participated in the ${certConfig.eventTitle || 'Wardiere Charity Run'}, demonstrating dedication and enthusiasm. Your involvement helped make the event a resounding success. Presented on ${certConfig.awardDate || '20 Juni 2040'}.`;
    const certSig1Name = certConfig.signatory1Name || 'SAMIRA HADID';
    const certSig2Name = certConfig.signatory2Name || 'ALFREDO TORRES';

    return (
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden font-sans max-w-4xl mx-auto border-2 border-emerald-500">
        {/* Dynamic Sweeping Curves on Top-Left & Bottom-Right */}
        <div className="absolute top-0 left-0 w-64 h-64 pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Tech horizontal raster lines */}
            <g stroke="#10b981" strokeWidth="0.8" opacity="0.35">
              {[10, 20, 30, 40, 50, 60, 70].map(y => (
                <line key={y} x1="0" y1={y} x2="160" y2={y} />
              ))}
            </g>
            <path d="M 0,0 C 100,20 140,80 200,0 L 0,0 Z" fill="#047857" />
            <path d="M 0,0 C 60,100 120,140 0,200 L 0,0 Z" fill="#06b6d4" opacity="0.85" />
            <path d="M 0,0 C 80,60 140,100 0,160 Z" fill="#10b981" opacity="0.75" />
          </svg>
        </div>

        <div className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Tech horizontal raster lines */}
            <g stroke="#06b6d4" strokeWidth="0.8" opacity="0.35">
              {[130, 140, 150, 160, 170, 180, 190].map(y => (
                <line key={y} x1="40" y1={y} x2="200" y2={y} />
              ))}
            </g>
            <path d="M 200,200 C 100,180 60,120 0,200 L 200,200 Z" fill="#06b6d4" />
            <path d="M 200,200 C 140,100 80,60 200,0 L 200,200 Z" fill="#047857" opacity="0.85" />
            <path d="M 200,200 C 120,140 60,100 200,40 Z" fill="#10b981" opacity="0.75" />
          </svg>
        </div>

        {/* Inner Green Border Box */}
        <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-emerald-500/70 pointer-events-none rounded-xl" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-12 py-4">
          <h1 className="text-4xl sm:text-5xl font-serif text-slate-900 tracking-wider uppercase font-bold">
            {certTitle}
          </h1>
          <div className="text-xs sm:text-sm font-serif text-slate-700 tracking-widest uppercase mt-0.5">
            {certSubtitle}
          </div>

          <p className="text-xs font-sans text-slate-500 mt-4">
            {certPresentation}
          </p>

          {/* Recipient in Flowing Cursive Script */}
          <div className="my-2 max-w-md mx-auto">
            <h2 className="text-3xl sm:text-4xl font-serif italic text-slate-900" style={{ fontFamily: 'Playfair Display, "Brush Script MT", cursive, serif' }}>
              {certRecipient}
            </h2>
            <div className="w-56 h-0.5 bg-slate-900 mx-auto mt-1" />
          </div>

          {/* Class / Batch Indicator */}
          {st.class_batch && (
            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
              Class &amp; Section: <span className="text-slate-900 font-extrabold">{customClassSection || st.class_batch}</span>
            </div>
          )}

          {/* Citation Body Text */}
          <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-lg mx-auto px-4 mt-2 font-sans font-normal">
            {certBody}
          </p>

          {/* Hanging Medal in Center with Left & Right Signatures */}
          <div className="pt-8 sm:pt-10 flex items-end justify-between px-4 sm:px-12">
            <div className="text-center min-w-[120px]">
              <div className="w-32 sm:w-36 h-0.5 bg-slate-900 mx-auto mb-1.5" />
              <strong className="text-xs font-bold text-slate-900 tracking-wider uppercase block">{certSig1Name}</strong>
            </div>

            <div className="text-center -mb-2">
              <HangingGoldMedal size={64} />
            </div>

            <div className="text-center min-w-[120px]">
              <div className="w-32 sm:w-36 h-0.5 bg-slate-900 mx-auto mb-1.5" />
              <strong className="text-xs font-bold text-slate-900 tracking-wider uppercase block">{certSig2Name}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // TEMPLATE 5: Geometric Forest & Lime Polygon Mosaic (Brigita Tsamara Design)
  // =========================================================================
  const renderForestLimePolygonMosaicAppreciation = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'Brigita Tsamara';
    const certTitle = certConfig.title || 'CERTIFICATE';
    const certSubtitle = certConfig.subtitle || 'OF PARTICIPATION';
    const certPresentation = certConfig.presentationLine || 'This certificate is proudly presented to';
    const certBody = certConfig.bodyText || 'In recognition of active participation and meaningful contribution to the program. Your dedication and engagement are sincerely appreciated.';
    const certSig1Name = certConfig.signatory1Name || 'AVERY DAVIS';
    const certSig1Title = certConfig.signatory1Title || 'Program Manager';

    return (
      <div className="bg-[#fbfaf5] p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden font-sans max-w-4xl mx-auto border-4 border-[#3d5a1f]/30">
        {/* Geometric Olive, Lime & Forest Triangle Clusters with Zigzags */}
        <div className="absolute top-0 left-0 w-44 h-44 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="0,0 60,0 0,70" fill="#3d5a1f" />
            <polygon points="0,0 40,0 15,35" fill="#84cc16" />
            <polygon points="20,10 50,25 35,45" fill="#ca8a04" />
            <polygon points="0,40 25,60 0,90" fill="#4d7c0f" />
            <polygon points="40,0 70,0 55,20" fill="#a3e635" opacity="0.8" />
          </svg>
        </div>

        <div className="absolute top-0 right-0 w-44 h-44 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="40,0 100,0 100,70" fill="#3d5a1f" />
            <polygon points="60,0 100,0 85,35" fill="#84cc16" />
            <polygon points="50,25 80,10 65,45" fill="#ca8a04" />
            <polygon points="75,60 100,40 100,90" fill="#4d7c0f" />
            <path d="M 30,15 L 45,5 L 60,15 L 75,5" fill="none" stroke="#2e5927" strokeWidth="2.5" />
          </svg>
        </div>

        <div className="absolute bottom-0 left-0 w-44 h-44 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="0,30 60,100 0,100" fill="#3d5a1f" />
            <polygon points="0,65 40,100 15,65" fill="#84cc16" />
            <polygon points="20,90 50,75 35,55" fill="#ca8a04" />
            <polygon points="0,10 25,40 0,60" fill="#4d7c0f" />
            <path d="M 15,85 L 30,95 L 45,85 L 60,95" fill="none" stroke="#2e5927" strokeWidth="2.5" />
          </svg>
        </div>

        <div className="absolute bottom-0 right-0 w-44 h-44 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="40,100 100,30 100,100" fill="#3d5a1f" />
            <polygon points="60,100 100,65 85,65" fill="#84cc16" />
            <polygon points="50,75 80,90 65,55" fill="#ca8a04" />
            <polygon points="75,40 100,10 100,60" fill="#4d7c0f" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 sm:px-14 py-4">
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#2e5927] tracking-wider uppercase">
            {certTitle}
          </h1>
          <div className="text-xs sm:text-sm font-sans font-bold text-[#2e5927] tracking-widest uppercase mt-0.5">
            {certSubtitle}
          </div>

          <p className="text-xs font-sans text-slate-600 mt-4">
            {certPresentation}
          </p>

          {/* Recipient in Flowing Calligraphy */}
          <div className="my-2 max-w-lg mx-auto">
            <h2 className="text-3xl sm:text-4xl text-[#2e5927] font-serif italic tracking-wide" style={{ fontFamily: 'Playfair Display, "Brush Script MT", cursive, serif' }}>
              {certRecipient}
            </h2>
            <div className="flex items-center justify-center gap-2 text-[#2e5927] my-1">
              <span className="w-20 h-0.5 bg-[#2e5927]"></span>
              <span className="text-sm">✦ ✤ ✦</span>
              <span className="w-20 h-0.5 bg-[#2e5927]"></span>
            </div>
          </div>

          {/* Class / Batch Indicator */}
          {st.class_batch && (
            <div className="text-[10px] font-bold text-[#2e5927] uppercase tracking-wider mb-1">
              Class &amp; Section: <span className="text-slate-900 font-extrabold">{customClassSection || st.class_batch}</span>
            </div>
          )}

          {/* Citation Body Text */}
          <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed max-w-md mx-auto px-4 mt-2 font-sans font-medium">
            {certBody}
          </p>

          {/* Center Signatory with Realistic Signature */}
          <div className="pt-6 sm:pt-8 text-center max-w-xs mx-auto">
            <HandWrittenSignature name={certSig1Name} color="#2e5927" />
            <div className="w-36 h-0.5 bg-[#2e5927] mx-auto mt-1 mb-1.5" />
            <strong className="text-xs font-black text-slate-900 uppercase tracking-wider block">
              {certSig1Name}
            </strong>
            <span className="text-[10px] text-[#2e5927] italic block font-serif">
              {certSig1Title}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // TEMPLATE 1 (Participation): Classic Gold Filigree Frame (Benjamin Shah)
  // =========================================================================
  const renderClassicGoldFiligreeFrameParticipation = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'Benjamin Shah';
    const certTitle = certConfig.title || 'CERTIFICATE OF';
    const certSubtitle = certConfig.subtitle || 'PARTICIPATION';
    const certPresentation = certConfig.presentationLine || 'THIS IS PROUDLY PRESENTED TO';
    const certBody = certConfig.bodyText || 'for participating in the Inter-School Art Competition and demonstrating exceptional creative talent and artistic commitment.';
    const certDate = certConfig.awardDate || '14 August 2024';
    const certSig1Name = certConfig.signatory1Name || 'Juliana Silva';
    const certSig1Title = certConfig.signatory1Title || 'Art Coordinator';
    const certSig2Name = certConfig.signatory2Name || 'Marceline Anderson';
    const certSig2Title = certConfig.signatory2Title || 'School Principal';

    return (
      <div className="bg-[#faf8f5] p-5 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden font-serif max-w-4xl mx-auto border-4 border-amber-600/40">
        {/* Navy Triangular Corner Wedges with Gold Filigree */}
        <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="0,0 100,0 0,100" fill="#0f172a" />
            <polygon points="0,0 70,0 0,70" fill="#1e293b" />
            <line x1="0" y1="100" x2="100" y2="0" stroke="#d97706" strokeWidth="2.5" />
            <line x1="0" y1="70" x2="70" y2="0" stroke="#fde047" strokeWidth="1" />
          </svg>
          <div className="absolute top-2 left-2 text-amber-300 w-12 h-12">
            <CornerBaroqueFiligree className="w-full h-full text-amber-300" />
          </div>
        </div>

        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="100,0 0,0 100,100" fill="#0f172a" />
            <polygon points="100,0 30,0 100,70" fill="#1e293b" />
            <line x1="100" y1="100" x2="0" y2="0" stroke="#d97706" strokeWidth="2.5" />
            <line x1="100" y1="70" x2="30" y2="0" stroke="#fde047" strokeWidth="1" />
          </svg>
          <div className="absolute top-2 right-2 text-amber-300 w-12 h-12 rotate-90">
            <CornerBaroqueFiligree className="w-full h-full text-amber-300" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="0,100 100,100 0,0" fill="#0f172a" />
            <polygon points="0,100 70,100 0,30" fill="#1e293b" />
            <line x1="0" y1="0" x2="100" y2="100" stroke="#d97706" strokeWidth="2.5" />
            <line x1="0" y1="30" x2="70" y2="100" stroke="#fde047" strokeWidth="1" />
          </svg>
          <div className="absolute bottom-2 left-2 text-amber-300 w-12 h-12 -rotate-90">
            <CornerBaroqueFiligree className="w-full h-full text-amber-300" />
          </div>
        </div>

        <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="100,100 0,100 100,0" fill="#0f172a" />
            <polygon points="100,100 30,100 100,30" fill="#1e293b" />
            <line x1="100" y1="0" x2="0" y2="100" stroke="#d97706" strokeWidth="2.5" />
            <line x1="100" y1="30" x2="30" y2="100" stroke="#fde047" strokeWidth="1" />
          </svg>
          <div className="absolute bottom-2 right-2 text-amber-300 w-12 h-12 rotate-180">
            <CornerBaroqueFiligree className="w-full h-full text-amber-300" />
          </div>
        </div>

        {/* Double Inner Gold Border */}
        <div className="border-2 border-amber-600/70 p-1.5 rounded-2xl relative z-10">
          <div className="border border-amber-500/50 p-6 sm:p-10 rounded-xl text-center space-y-3 relative">
            {/* Header / Title */}
            <div>
              <div className="text-xs sm:text-sm font-serif font-black tracking-[0.3em] text-slate-800 uppercase">
                {certTitle}
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-wider text-[#b45309] uppercase drop-shadow-sm mt-0.5">
                {certSubtitle}
              </h1>
              <div className="flex items-center justify-center gap-2 text-amber-600 my-2">
                <span className="w-16 h-0.5 bg-gradient-to-r from-transparent to-amber-600" />
                <span className="text-xs font-bold">★ ✦ ★</span>
                <span className="w-16 h-0.5 bg-gradient-to-l from-transparent to-amber-600" />
              </div>
            </div>

            {/* Presentation Line */}
            <p className="text-[11px] sm:text-xs font-sans font-bold tracking-widest text-slate-500 uppercase pt-1">
              {certPresentation}
            </p>

            {/* Recipient Name in Refined Serif */}
            <div className="my-2 max-w-lg mx-auto">
              <h2 className="text-3xl sm:text-4xl font-serif italic text-slate-900 font-bold tracking-wide">
                {certRecipient}
              </h2>
              <div className="w-64 h-0.5 bg-amber-600/60 mx-auto mt-1" />
            </div>

            {/* Class / Batch Indicator */}
            {st.class_batch && (
              <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                Class &amp; Section: <span className="text-slate-900 font-extrabold">{customClassSection || st.class_batch}</span>
              </div>
            )}

            {/* Citation Body Text */}
            <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed max-w-xl mx-auto px-4 font-serif italic">
              {certBody}
            </p>

            {/* Date & Signatures with Bronze Rosette Seal */}
            <div className="pt-6 sm:pt-8 flex items-end justify-between px-2 sm:px-8">
              <div className="text-center min-w-[120px]">
                <HandWrittenSignature name={certSig1Name} color="#0f172a" />
                <div className="w-32 sm:w-36 h-0.5 bg-slate-800 mx-auto mt-1 mb-1" />
                <strong className="text-xs font-bold text-slate-900 block">{certSig1Name}</strong>
                <span className="text-[10px] text-slate-500 font-medium">{certSig1Title}</span>
              </div>

              <div className="text-center -mb-2">
                <BronzeBlueRosetteSeal size={74} />
                <div className="text-[9px] font-mono text-slate-600 font-bold mt-0.5">{certDate}</div>
              </div>

              <div className="text-center min-w-[120px]">
                <HandWrittenSignature name={certSig2Name} color="#0f172a" />
                <div className="w-32 sm:w-36 h-0.5 bg-slate-800 mx-auto mt-1 mb-1" />
                <strong className="text-xs font-bold text-slate-900 block">{certSig2Name}</strong>
                <span className="text-[10px] text-slate-500 font-medium">{certSig2Title}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // TEMPLATE 2 (Participation): Modern Crystal Facets & Navy Angle (Bartholomew Henderson)
  // =========================================================================
  const renderModernCrystalNavyAngleParticipation = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'Bartholomew Henderson';
    const certTitle = certConfig.title || 'CERTIFICATE';
    const certSubtitle = certConfig.subtitle || 'OF PARTICIPATION';
    const certPresentation = certConfig.presentationLine || 'THIS CERTIFICATE IS PRESENTED TO';
    const certBody = certConfig.bodyText || 'in recognition of their dedication, enthusiasm, and active participation in the Annual Science Fair 2024. Your curiosity and scientific acumen are truly commendable.';
    const certDate = certConfig.awardDate || '25 October 2024';
    const certSig1Name = certConfig.signatory1Name || 'MUHAMMAD PATEL';
    const certSig1Title = certConfig.signatory1Title || 'Event Organizer';
    const certSig2Name = certConfig.signatory2Name || 'MORGAN MAXWELL';
    const certSig2Title = certConfig.signatory2Title || 'Principal';

    return (
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden font-sans max-w-4xl mx-auto border-2 border-slate-200">
        {/* Polygonal Crystal Facets / Low-Poly Corner Accents */}
        <div className="absolute top-0 left-0 w-64 h-64 pointer-events-none opacity-25">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <polygon points="0,0 120,0 60,80 0,60" fill="#94a3b8" />
            <polygon points="120,0 200,0 150,90 60,80" fill="#cbd5e1" />
            <polygon points="0,60 60,80 30,160 0,140" fill="#cbd5e1" />
            <polygon points="60,80 150,90 110,170 30,160" fill="#e2e8f0" />
            <polygon points="0,140 30,160 0,200" fill="#94a3b8" />
          </svg>
        </div>

        {/* Right-Angled Navy & Gold Diagonal Wedge */}
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <polygon points="60,0 200,0 200,160" fill="#0f172a" />
            <polygon points="90,0 200,0 200,130" fill="#1e293b" />
            <line x1="50" y1="0" x2="200" y2="170" stroke="#f59e0b" strokeWidth="3" />
            <line x1="40" y1="0" x2="200" y2="180" stroke="#d97706" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="absolute bottom-0 left-0 w-52 h-52 pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <polygon points="0,60 0,200 160,200" fill="#0f172a" />
            <line x1="0" y1="50" x2="170" y2="200" stroke="#f59e0b" strokeWidth="3" />
            <line x1="0" y1="40" x2="180" y2="200" stroke="#d97706" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-12 py-2">
          {/* Top Logo / School header */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-left">
              <span className="text-[10px] font-mono font-black text-amber-600 uppercase tracking-widest block">
                {schoolInfo.schoolName}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">EST. 2012 &bull; AFFILIATION #{schoolInfo.affiliationNo}</span>
            </div>
            {schoolInfo.customLogoUrl && (
              <img src={schoolInfo.customLogoUrl} alt="Logo" className="w-10 h-10 object-contain" />
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-sans font-black text-[#0f172a] tracking-wider uppercase">
            {certTitle}
          </h1>
          <div className="text-xs sm:text-sm font-bold text-amber-600 tracking-widest uppercase mt-0.5">
            {certSubtitle}
          </div>

          <p className="text-xs font-sans text-slate-500 mt-4 tracking-wide uppercase">
            {certPresentation}
          </p>

          {/* Recipient Name in Strong Navy Font */}
          <div className="my-2 max-w-lg mx-auto">
            <h2 className="text-3xl sm:text-4xl font-serif text-[#0f172a] font-black tracking-wide uppercase">
              {certRecipient}
            </h2>
            <div className="flex items-center justify-center gap-2 text-amber-500 my-1">
              <span className="w-24 h-0.5 bg-amber-500" />
              <span className="text-xs">◆</span>
              <span className="w-24 h-0.5 bg-amber-500" />
            </div>
          </div>

          {/* Class / Batch Indicator */}
          {st.class_batch && (
            <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Class &amp; Section: <span className="text-amber-800 font-extrabold">{customClassSection || st.class_batch}</span>
            </div>
          )}

          {/* Citation Body Text */}
          <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-xl mx-auto px-4 mt-2 font-sans font-medium">
            {certBody}
          </p>

          {/* Medal & Signatures */}
          <div className="pt-6 sm:pt-8 flex items-end justify-between px-4 sm:px-12">
            <div className="text-center min-w-[120px]">
              <HandWrittenSignature name={certSig1Name} color="#d97706" />
              <div className="w-32 sm:w-36 h-0.5 bg-slate-300 mx-auto mt-1 mb-1" />
              <strong className="text-xs font-bold text-slate-900 block uppercase">{certSig1Name}</strong>
              <span className="text-[10px] text-slate-500 font-medium">{certSig1Title}</span>
            </div>

            <div className="text-center -mb-2">
              <GoldMedallionRosette size={78} />
              <div className="text-[9px] font-mono text-slate-600 font-bold mt-0.5">{certDate}</div>
            </div>

            <div className="text-center min-w-[120px]">
              <HandWrittenSignature name={certSig2Name} color="#d97706" />
              <div className="w-32 sm:w-36 h-0.5 bg-slate-300 mx-auto mt-1 mb-1" />
              <strong className="text-xs font-bold text-slate-900 block uppercase">{certSig2Name}</strong>
              <span className="text-[10px] text-slate-500 font-medium">{certSig2Title}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // TEMPLATE 3 (Participation): Royal Purple & Gold Arch (Henrietta Mitchell)
  // =========================================================================
  const renderRoyalPurpleGoldArchParticipation = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'Henrietta Mitchell';
    const certTitle = certConfig.title || 'CERTIFICATE OF';
    const certSubtitle = certConfig.subtitle || 'APPRECIATION';
    const certPresentation = certConfig.presentationLine || 'PROUDLY PRESENTED TO';
    const certBody = certConfig.bodyText || 'in recognition of active participation and meaningful contribution to the Youth Leadership Summit. Your dedication and vision have inspired our entire community.';
    const certDate = certConfig.awardDate || '12 November 2024';
    const certSig1Name = certConfig.signatory1Name || 'AVERY DAVIS';
    const certSig1Title = certConfig.signatory1Title || 'Director';
    const certSig2Name = certConfig.signatory2Name || 'YANIS PETROS';
    const certSig2Title = certConfig.signatory2Title || 'Program Coordinator';

    return (
      <div className="bg-[#24133b] p-5 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden font-sans max-w-4xl mx-auto border-4 border-amber-400/80">
        {/* Royal Purple Scalloped Islamic Arch & Gold Mandala Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-28 pointer-events-none">
          <svg viewBox="0 0 500 100" preserveAspectRatio="none" className="w-full h-full">
            <path d="M 0,0 L 500,0 L 500,40 C 400,80 300,30 250,90 C 200,30 100,80 0,40 Z" fill="#3b1d60" />
            <path d="M 0,0 L 500,0 L 500,35 C 400,75 300,25 250,85 C 200,25 100,75 0,35 Z" fill="#4c1d95" opacity="0.6" />
            <path d="M 0,40 C 100,80 200,30 250,90 C 300,30 400,80 500,40" fill="none" stroke="#f59e0b" strokeWidth="3" />
          </svg>
        </div>

        {/* Inner Parchment Card */}
        <div className="bg-[#fffdfa] rounded-2xl p-6 sm:p-10 relative z-10 text-center shadow-lg border border-amber-200 mt-6">
          {/* Top Sunburst Medallion */}
          <div className="flex justify-center -mt-14 mb-2">
            <ScallopedGoldMedallion size={84} />
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#2e1065] tracking-wider uppercase">
            {certTitle}
          </h1>
          <div className="text-xs sm:text-sm font-bold text-amber-700 tracking-widest uppercase mt-0.5">
            {certSubtitle}
          </div>

          <p className="text-xs font-serif italic text-slate-500 mt-4">
            {certPresentation}
          </p>

          {/* Recipient in Flowing Gold/Purple Cursive Calligraphy */}
          <div className="my-2 max-w-lg mx-auto">
            <h2 className="text-3xl sm:text-4xl font-serif italic text-[#3b0764] font-bold tracking-wide" style={{ fontFamily: 'Playfair Display, "Brush Script MT", cursive, serif' }}>
              {certRecipient}
            </h2>
            <div className="flex items-center justify-center gap-2 text-amber-600 my-1">
              <span className="w-20 h-0.5 bg-amber-500" />
              <span className="text-xs">✦ ❖ ✦</span>
              <span className="w-20 h-0.5 bg-amber-500" />
            </div>
          </div>

          {/* Class / Batch Indicator */}
          {st.class_batch && (
            <div className="text-[10px] font-bold text-purple-900 uppercase tracking-wider mb-1">
              Class &amp; Section: <span className="text-amber-800 font-extrabold">{customClassSection || st.class_batch}</span>
            </div>
          )}

          {/* Citation Body Text */}
          <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed max-w-xl mx-auto px-4 mt-2 font-serif">
            {certBody}
          </p>

          {/* Award Date */}
          <div className="text-xs font-bold text-purple-950 mt-3 font-mono">
            {certDate}
          </div>

          {/* Signatories */}
          <div className="pt-6 sm:pt-8 flex items-end justify-between px-6 sm:px-14">
            <div className="text-center min-w-[120px]">
              <HandWrittenSignature name={certSig1Name} color="#4c1d95" />
              <div className="w-32 sm:w-36 h-0.5 bg-purple-900 mx-auto mt-1 mb-1" />
              <strong className="text-xs font-bold text-slate-900 block">{certSig1Name}</strong>
              <span className="text-[10px] text-slate-500 font-medium">{certSig1Title}</span>
            </div>

            <div className="text-center min-w-[120px]">
              <HandWrittenSignature name={certSig2Name} color="#4c1d95" />
              <div className="w-32 sm:w-36 h-0.5 bg-purple-900 mx-auto mt-1 mb-1" />
              <strong className="text-xs font-bold text-slate-900 block">{certSig2Name}</strong>
              <span className="text-[10px] text-slate-500 font-medium">{certSig2Title}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // TEMPLATE 4 (Participation): Lavender & Sunset Waves (Estelle Darcy)
  // =========================================================================
  const renderLavenderSunsetWaveParticipation = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'Estelle Darcy';
    const certTitle = certConfig.title || 'CERTIFICATE';
    const certSubtitle = certConfig.subtitle || 'OF PARTICIPATION';
    const certPresentation = certConfig.presentationLine || 'THIS CERTIFICATE IS PROUDLY PRESENTED TO';
    const certBody = certConfig.bodyText || 'for her enthusiastic participation and valuable contribution to the Creative Writing Workshop. Your passion for words and storytelling has enriched our sessions.';
    const certDate = certConfig.awardDate || '08 September 2024';
    const certSig1Name = certConfig.signatory1Name || 'Daniel Gallego';
    const certSig1Title = certConfig.signatory1Title || 'Workshop Mentor';
    const certSig2Name = certConfig.signatory2Name || 'Sacha Dubois';
    const certSig2Title = certConfig.signatory2Title || 'Department Head';

    return (
      <div className="bg-[#faf5ff] p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden font-sans max-w-4xl mx-auto border-2 border-purple-200">
        {/* Lavender & Warm Sunset Fluid Wave Top Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none opacity-90">
          <svg viewBox="0 0 600 120" preserveAspectRatio="none" className="w-full h-full">
            <path d="M 0,0 L 600,0 L 600,40 C 450,110 350,20 200,80 C 100,110 50,30 0,60 Z" fill="#c084fc" opacity="0.4" />
            <path d="M 0,0 L 600,0 L 600,20 C 480,90 320,10 180,60 C 80,90 30,20 0,40 Z" fill="#fb923c" opacity="0.6" />
            <path d="M 0,0 L 600,0 L 600,10 C 500,60 380,0 240,40 C 120,60 60,10 0,25 Z" fill="#7e22ce" opacity="0.7" />
          </svg>
        </div>

        {/* Bottom Lavender & Sunset Wave Ribbon */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none opacity-90">
          <svg viewBox="0 0 600 120" preserveAspectRatio="none" className="w-full h-full">
            <path d="M 0,120 L 600,120 L 600,80 C 450,10 350,100 200,40 C 100,10 50,90 0,60 Z" fill="#c084fc" opacity="0.4" />
            <path d="M 0,120 L 600,120 L 600,100 C 480,30 320,110 180,60 C 80,30 30,100 0,80 Z" fill="#fb923c" opacity="0.6" />
            <path d="M 0,120 L 600,120 L 600,110 C 500,60 380,120 240,80 C 120,60 60,110 0,95 Z" fill="#7e22ce" opacity="0.7" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-12 py-4">
          <h1 className="text-3xl sm:text-4xl font-sans font-black text-[#581c87] tracking-wider uppercase">
            {certTitle}
          </h1>
          <div className="text-xs sm:text-sm font-bold text-[#ea580c] tracking-widest uppercase mt-0.5">
            {certSubtitle}
          </div>

          <p className="text-xs font-sans font-semibold text-slate-500 mt-4 tracking-wide uppercase">
            {certPresentation}
          </p>

          {/* Recipient in Vibrant Amber Cursive Calligraphy */}
          <div className="my-2 max-w-lg mx-auto">
            <h2 className="text-3xl sm:text-4xl font-serif italic text-[#c2410c] font-bold tracking-wide" style={{ fontFamily: 'Playfair Display, "Brush Script MT", cursive, serif' }}>
              {certRecipient}
            </h2>
            <div className="w-64 h-0.5 bg-[#a855f7] mx-auto mt-1" />
          </div>

          {/* Class / Batch Indicator */}
          {st.class_batch && (
            <div className="text-[10px] font-bold text-purple-900 uppercase tracking-wider mb-1">
              Class &amp; Section: <span className="text-[#c2410c] font-extrabold">{customClassSection || st.class_batch}</span>
            </div>
          )}

          {/* Citation Body Text */}
          <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-xl mx-auto px-4 mt-2 font-sans font-medium">
            {certBody}
          </p>

          {/* Award Date */}
          <div className="text-xs font-bold text-purple-950 mt-4">
            Date: <span className="font-mono text-slate-700">{certDate}</span>
          </div>

          {/* Dual Signatures */}
          <div className="pt-6 sm:pt-8 flex items-end justify-between px-6 sm:px-16">
            <div className="text-center min-w-[120px]">
              <HandWrittenSignature name={certSig1Name} color="#7e22ce" />
              <div className="w-32 sm:w-36 h-0.5 bg-purple-700 mx-auto mt-1 mb-1" />
              <strong className="text-xs font-bold text-slate-900 block">{certSig1Name}</strong>
              <span className="text-[10px] text-slate-500 font-medium">{certSig1Title}</span>
            </div>

            <div className="text-center min-w-[120px]">
              <HandWrittenSignature name={certSig2Name} color="#7e22ce" />
              <div className="w-32 sm:w-36 h-0.5 bg-purple-700 mx-auto mt-1 mb-1" />
              <strong className="text-xs font-bold text-slate-900 block">{certSig2Name}</strong>
              <span className="text-[10px] text-slate-500 font-medium">{certSig2Title}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // TEMPLATE 5 (Participation): Imperial Baroque Gold Crest (Muhammad Patel)
  // =========================================================================
  const renderImperialBaroqueGoldCrestParticipation = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'Muhammad Patel';
    const certTitle = certConfig.title || 'CERTIFICATE';
    const certSubtitle = certConfig.subtitle || 'OF PARTICIPATION';
    const certPresentation = certConfig.presentationLine || 'THIS IS PROUDLY PRESENTED TO';
    const certBody = certConfig.bodyText || 'for their active involvement, dedication, and valuable contributions in the Community Service Initiative. Your tireless efforts made a profound positive difference.';
    const certDate = certConfig.awardDate || '20 December 2024';
    const certSig1Name = certConfig.signatory1Name || 'Samira Hadid';
    const certSig1Title = certConfig.signatory1Title || 'Project Lead';
    const certSig2Name = certConfig.signatory2Name || 'Morgan Maxwell';
    const certSig2Title = certConfig.signatory2Title || 'Managing Director';

    return (
      <div className="bg-[#fffdf8] p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden font-serif max-w-4xl mx-auto border-8 border-double border-amber-600/70">
        {/* Full Baroque Gold Corner Flourishes */}
        <div className="absolute top-2 left-2 w-16 h-16 text-amber-600 pointer-events-none">
          <CornerBaroqueFiligree className="w-full h-full" />
        </div>
        <div className="absolute top-2 right-2 w-16 h-16 text-amber-600 pointer-events-none rotate-90">
          <CornerBaroqueFiligree className="w-full h-full" />
        </div>
        <div className="absolute bottom-2 left-2 w-16 h-16 text-amber-600 pointer-events-none -rotate-90">
          <CornerBaroqueFiligree className="w-full h-full" />
        </div>
        <div className="absolute bottom-2 right-2 w-16 h-16 text-amber-600 pointer-events-none rotate-180">
          <CornerBaroqueFiligree className="w-full h-full" />
        </div>

        {/* Top Royal Crown / Crest Emblem */}
        <div className="relative z-10 text-center px-4 sm:px-12 py-2">
          <div className="flex justify-center mb-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 text-amber-100 flex items-center justify-center font-black text-xl border-2 border-amber-300 shadow-md">
              <Award className="w-7 h-7 text-amber-100" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-black text-slate-900 tracking-wider uppercase">
            {certTitle}
          </h1>
          <div className="text-xs sm:text-sm font-bold text-amber-700 tracking-widest uppercase mt-0.5">
            {certSubtitle}
          </div>

          <div className="flex items-center justify-center gap-2 text-amber-600 my-2">
            <span className="w-24 h-0.5 bg-gradient-to-r from-transparent to-amber-600" />
            <span className="text-sm">✦ ❦ ✦</span>
            <span className="w-24 h-0.5 bg-gradient-to-l from-transparent to-amber-600" />
          </div>

          <p className="text-xs font-serif italic text-slate-600 mt-2">
            {certPresentation}
          </p>

          {/* Recipient in Regal Dark Serif */}
          <div className="my-2 max-w-lg mx-auto">
            <h2 className="text-3xl sm:text-4xl font-serif text-slate-950 font-bold tracking-wide">
              {certRecipient}
            </h2>
            <div className="w-64 h-0.5 bg-amber-600/70 mx-auto mt-1" />
          </div>

          {/* Class / Batch Indicator */}
          {st.class_batch && (
            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">
              Class &amp; Section: <span className="text-slate-900 font-extrabold">{customClassSection || st.class_batch}</span>
            </div>
          )}

          {/* Citation Body Text */}
          <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed max-w-xl mx-auto px-4 mt-2 font-serif italic">
            {certBody}
          </p>

          {/* Seal & Signatures */}
          <div className="pt-6 sm:pt-8 flex items-end justify-between px-4 sm:px-12">
            <div className="text-center min-w-[120px]">
              <HandWrittenSignature name={certSig1Name} color="#1e293b" />
              <div className="w-32 sm:w-36 h-0.5 bg-slate-900 mx-auto mt-1 mb-1" />
              <strong className="text-xs font-bold text-slate-900 block">{certSig1Name}</strong>
              <span className="text-[10px] text-slate-500 font-medium">{certSig1Title}</span>
            </div>

            <div className="text-center -mb-2">
              <ScallopedGoldMedallion size={74} />
              <div className="text-[9px] font-mono text-slate-600 font-bold mt-0.5">{certDate}</div>
            </div>

            <div className="text-center min-w-[120px]">
              <HandWrittenSignature name={certSig2Name} color="#1e293b" />
              <div className="w-32 sm:w-36 h-0.5 bg-slate-900 mx-auto mt-1 mb-1" />
              <strong className="text-xs font-bold text-slate-900 block">{certSig2Name}</strong>
              <span className="text-[10px] text-slate-500 font-medium">{certSig2Title}</span>
            </div>
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

      // 2. CERTIFICATE OF APPRECIATION (5 Master Design Layouts from User Upload)
      case 'appreciation': {
        switch (appreciationTemplate) {
          case 'modern_navy_gold_badge': return renderModernNavyGoldBadgeAppreciation(st);
          case 'royal_navy_gold_geometric': return renderRoyalNavyGoldGeometricAppreciation(st);
          case 'mint_emerald_fluid_waves': return renderMintEmeraldFluidWavesAppreciation(st);
          case 'cyan_emerald_curved_sweep': return renderCyanEmeraldCurvedSweepAppreciation(st);
          case 'forest_lime_polygon_mosaic': return renderForestLimePolygonMosaicAppreciation(st);
          default: return renderModernNavyGoldBadgeAppreciation(st);
        }
      }

      // 3. CERTIFICATE OF PARTICIPATION (5 Master Design Layouts from User Upload)
      case 'participation': {
        switch (participationTemplate) {
          case 'classic_gold_filigree_frame': return renderClassicGoldFiligreeFrameParticipation(st);
          case 'modern_crystal_navy_angle': return renderModernCrystalNavyAngleParticipation(st);
          case 'royal_purple_gold_arch': return renderRoyalPurpleGoldArchParticipation(st);
          case 'lavender_sunset_wave': return renderLavenderSunsetWaveParticipation(st);
          case 'imperial_baroque_gold_crest': return renderImperialBaroqueGoldCrestParticipation(st);
          default: return renderClassicGoldFiligreeFrameParticipation(st);
        }
      }

      // 4. DOMICILE & BONAFIDE CERTIFICATE (5 Master Design Layouts)
      case 'domicile': {
        switch (domicileTemplate) {
          case 'statutory_residence_formal':
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
                    Official Statutory Residence &amp; Bonafide Certificate
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

          case 'heritage_academic_bonafide':
            return (
              <div className="bg-[#fffdf7] p-8 rounded-3xl border-4 border-amber-800 text-slate-900 space-y-5 shadow-xl font-serif text-xs">
                <div className="text-center border-b-2 border-amber-900 pb-3">
                  <h2 className="text-2xl font-black text-amber-950 uppercase">{schoolInfo.schoolName}</h2>
                  <div className="text-xs font-bold text-amber-800 uppercase tracking-widest">HERITAGE ACADEMIC ENROLLMENT CERTIFICATE</div>
                </div>
                <div className="space-y-3 leading-relaxed text-sm text-justify">
                  <p>
                    Certified that <strong className="text-amber-950 underline">{st.student_name}</strong> (Roll #{st.roll_no}) is duly enrolled in <strong className="text-amber-950">{st.class_batch}</strong> for session {academicSession}.
                  </p>
                  <p>Permanent Address on School Records: <strong>{st.residential_address}</strong>.</p>
                </div>
                <div className="pt-6 border-t border-amber-800/40 flex justify-between items-end">
                  <img src={st.photo} alt={st.student_name} className="w-16 h-16 rounded-xl border-2 border-amber-800" />
                  <div className="text-center font-bold text-amber-950 italic text-sm">{schoolInfo.principalName}</div>
                </div>
              </div>
            );

          case 'modern_digital_bonafide':
            return (
              <div className="bg-white p-7 rounded-3xl border-2 border-teal-600 shadow-xl space-y-4 text-xs font-sans">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h2 className="font-black text-lg text-teal-900 uppercase">{schoolInfo.schoolName}</h2>
                    <div className="text-[10px] font-bold text-teal-600 uppercase">DIGITAL BONAFIDE PASS</div>
                  </div>
                  <div className="font-mono text-teal-800 font-bold">{regNo}</div>
                </div>
                <div className="grid grid-cols-3 gap-3 p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                  <div>Candidate: <strong className="block text-slate-900">{st.student_name}</strong></div>
                  <div>Class: <strong className="block text-teal-800">{st.class_batch}</strong></div>
                  <div>Resident Status: <strong className="block text-emerald-700">Verified Permanent</strong></div>
                </div>
                <p className="text-slate-700 text-xs">Resident Address: {st.residential_address}</p>
                <div className="pt-3 border-t flex justify-between items-end">
                  <span className="font-mono text-[10px] text-slate-400">CODE128: {regNo}</span>
                  <div className="font-bold text-slate-900">{schoolInfo.principalName}</div>
                </div>
              </div>
            );

          case 'regal_navy_institutional':
            return (
              <div className="bg-gradient-to-br from-blue-950 to-slate-900 text-white p-8 rounded-3xl border-4 border-amber-400 shadow-2xl space-y-4 text-xs font-sans">
                <div className="text-center border-b border-white/20 pb-3">
                  <h2 className="text-xl font-black text-amber-300 uppercase">{schoolInfo.schoolName}</h2>
                  <div className="text-[10px] text-slate-300 uppercase">CAMPUS BONAFIDE &amp; IDENTITY ENDORSEMENT</div>
                </div>
                <p className="text-sm text-center leading-relaxed">
                  This document certifies that <strong className="text-amber-300 text-base">{st.student_name}</strong> is a registered student in <strong className="text-white">{st.class_batch}</strong>.
                </p>
                <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-center">
                  Address: {st.residential_address}
                </div>
                <div className="pt-4 border-t border-white/20 flex justify-between items-end">
                  <GoldenSchoolSeal size={64} />
                  <div className="text-right">
                    <div className="font-serif italic text-amber-200 text-sm">{schoolInfo.principalName}</div>
                    <div className="text-[9px] text-slate-400 uppercase">{schoolInfo.principalTitle}</div>
                  </div>
                </div>
              </div>
            );

          case 'minimalist_board_proof':
          default:
            return (
              <div className="bg-white p-6 rounded-2xl border-2 border-slate-300 text-slate-900 space-y-3 text-xs font-sans">
                <div className="border-b pb-2 flex justify-between items-center">
                  <h2 className="font-bold text-sm uppercase">{schoolInfo.schoolName}</h2>
                  <span className="font-mono text-[10px] text-slate-500">REF: {regNo}</span>
                </div>
                <p>Candidate <strong>{st.student_name}</strong> is an active bonafide student in <strong>{st.class_batch}</strong>.</p>
                <div className="p-2 bg-slate-50 border rounded text-[11px]">{st.residential_address}</div>
                <div className="pt-3 border-t flex justify-between text-[11px]">
                  <span>Date: {issueDate}</span>
                  <strong>{schoolInfo.principalName}</strong>
                </div>
              </div>
            );
        }
      }

      // 5. CHARACTER & CONDUCT MIGRATION CERTIFICATE (5 Master Design Layouts)
      case 'migration': {
        switch (migrationTemplate) {
          case 'cbse_official_migration':
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
                    Official Character &amp; Inter-State Migration Clearance
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

          case 'heritage_gold_seal':
            return (
              <div className="bg-[#faf8f0] p-8 rounded-3xl border-4 border-amber-700 shadow-xl space-y-4 text-xs font-serif">
                <div className="text-center border-b-2 border-amber-800 pb-3">
                  <h2 className="text-2xl font-black text-amber-950 uppercase">{schoolInfo.schoolName}</h2>
                  <h1 className="text-lg font-bold text-amber-900 italic">Conduct &amp; Character Certificate</h1>
                </div>
                <p className="text-sm leading-loose text-justify">
                  This certifies that <strong>{st.student_name}</strong> of <strong>{st.class_batch}</strong> has maintained an impeccable disciplinary record and exemplary moral character during their education at this institution.
                </p>
                <div className="pt-4 border-t border-amber-800/30 flex justify-between items-end">
                  <GoldenSchoolSeal size={74} />
                  <div className="text-center italic font-bold text-amber-950 text-sm">{schoolInfo.principalName}</div>
                </div>
              </div>
            );

          case 'modern_security_qr':
            return (
              <div className="bg-white p-7 rounded-3xl border-2 border-slate-400 shadow-xl space-y-4 text-xs font-sans">
                <div className="flex justify-between items-center border-b pb-3">
                  <h2 className="font-black text-lg text-slate-900 uppercase">{schoolInfo.schoolName}</h2>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">NO OBJECTION ISSUED</span>
                </div>
                <p>Candidate <strong>{st.student_name}</strong> ({st.id}) is granted full migration clearance with conduct: <strong>{conduct}</strong>.</p>
                <div className="pt-3 border-t flex justify-between items-end">
                  <div className="font-mono text-[10px] text-slate-400">HASH: {regNo}</div>
                  <div className="font-bold text-slate-900">{schoolInfo.principalName}</div>
                </div>
              </div>
            );

          case 'classic_blue_parchment':
            return (
              <div className="bg-slate-50 p-8 rounded-3xl border-4 border-blue-900 text-slate-900 space-y-4 text-xs font-sans">
                <div className="text-center border-b border-blue-200 pb-3">
                  <h2 className="text-xl font-black text-blue-950 uppercase">{schoolInfo.schoolName}</h2>
                  <div className="text-xs font-bold text-blue-800">DISCIPLINARY &amp; CHARACTER ENDORSEMENT</div>
                </div>
                <p className="leading-relaxed">Student <strong>{st.student_name}</strong> has cleared all institutional obligations and bears conduct: <strong>{conduct}</strong>.</p>
                <div className="pt-4 border-t flex justify-between items-end">
                  <span>Session: {academicSession}</span>
                  <strong>{schoolInfo.principalName}</strong>
                </div>
              </div>
            );

          case 'tri_color_statutory':
          default:
            return (
              <div className="bg-white p-7 rounded-2xl border-2 border-slate-300 text-slate-900 space-y-4 text-xs font-sans">
                <div className="text-center border-b pb-2">
                  <h2 className="font-black text-base uppercase">{schoolInfo.schoolName}</h2>
                  <div className="text-[10px] text-slate-500 uppercase">National Board Clearance Certificate</div>
                </div>
                <p>Certified that <strong>{st.student_name}</strong> ({st.class_batch}) is cleared for inter-state educational migration.</p>
                <div className="pt-3 border-t flex justify-between text-xs">
                  <span>Dated: {issueDate}</span>
                  <strong>{schoolInfo.principalName}</strong>
                </div>
              </div>
            );
        }
      }

      // 6. ACADEMIC REPORT CARD (MARKSHEET - 5 Master Design Layouts)
      case 'report_card': {
        switch (reportCardTemplate) {
          case 'cbse_cce_holistic':
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

          case 'modern_analytics_dashboard':
            return (
              <div className="bg-slate-900 text-white p-7 rounded-3xl border-2 border-cyan-500 shadow-2xl space-y-4 text-xs font-sans">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h2 className="font-black text-lg text-cyan-400 uppercase">{schoolInfo.schoolName}</h2>
                    <div className="text-[10px] text-slate-400">ANALYTIC PERFORMANCE MATRIX &bull; {academicSession}</div>
                  </div>
                  <div className="px-3 py-1 bg-cyan-500/20 text-cyan-300 font-bold rounded-full border border-cyan-500/40 text-xs">
                    CLASS RANK: #02 (94.6%)
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[10px]">CANDIDATE</span>
                    <strong className="text-white text-sm">{st.student_name}</strong>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[10px]">GRADE / SECTION</span>
                    <strong className="text-cyan-300 text-sm">{st.class_batch}</strong>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { sub: 'Advanced Mathematics', score: 97 },
                    { sub: 'Physics & Dynamics', score: 94 },
                    { sub: 'Chemistry & Applied Sciences', score: 91 },
                    { sub: 'Computer Applications & AI', score: 99 },
                    { sub: 'English Language', score: 92 }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span>{item.sub}</span>
                        <strong className="text-cyan-300">{item.score}/100</strong>
                      </div>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-500 to-teal-400 h-full rounded-full" style={{ width: `${item.score}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-white/10 flex justify-between text-xs text-slate-400">
                  <span>Status: <strong className="text-emerald-400">Promoted with Honors</strong></span>
                  <span>{schoolInfo.principalName}</span>
                </div>
              </div>
            );

          case 'classic_heritage_transcript':
            return (
              <div className="bg-[#fbf9f2] p-8 rounded-3xl border-4 border-slate-700 text-slate-900 space-y-4 text-xs font-serif shadow-xl">
                <div className="text-center border-b pb-3">
                  <h2 className="text-2xl font-black uppercase">{schoolInfo.schoolName}</h2>
                  <div className="text-xs font-bold italic">Official Transcript of Academic Record</div>
                </div>
                <div className="flex justify-between font-sans text-xs">
                  <span>Candidate: <strong>{st.student_name}</strong></span>
                  <span>Class: <strong>{st.class_batch}</strong></span>
                  <span>CGPA: <strong className="text-blue-900">9.46 / 10</strong></span>
                </div>
                <div className="pt-4 border-t flex justify-between items-end font-sans text-xs">
                  <span>Academic Clearance Confirmed</span>
                  <div className="text-center italic font-serif font-bold text-sm">{schoolInfo.principalName}</div>
                </div>
              </div>
            );

          case 'cambridge_igcse_gradebook':
            return (
              <div className="bg-white p-7 rounded-3xl border-4 border-emerald-900 text-slate-900 space-y-4 text-xs font-sans shadow-xl">
                <div className="text-center border-b pb-2">
                  <h2 className="text-xl font-black text-emerald-950 uppercase">{schoolInfo.schoolName}</h2>
                  <div className="text-[10px] font-bold text-emerald-800 uppercase">INTERNATIONAL CURRICULUM STATEMENT OF GRADES</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl flex justify-between items-center text-xs">
                  <span>Student: <strong>{st.student_name}</strong></span>
                  <span>Grade: <strong>{st.class_batch}</strong></span>
                  <span className="font-black text-emerald-900">OVERALL: A* (DISTINCTION)</span>
                </div>
                <div className="pt-4 border-t flex justify-between items-end">
                  <span className="font-mono text-[10px] text-slate-400">IGCSE-VERIFIED</span>
                  <div className="font-bold">{schoolInfo.principalName}</div>
                </div>
              </div>
            );

          case 'executive_split_semester':
          default:
            return (
              <div className="bg-white p-7 rounded-3xl border-2 border-slate-300 text-slate-900 space-y-4 text-xs font-sans shadow-md">
                <div className="flex justify-between items-center border-b pb-2">
                  <h2 className="font-black text-base uppercase">{schoolInfo.schoolName}</h2>
                  <span className="font-mono text-xs font-bold">BI-SEMESTER REPORT</span>
                </div>
                <p>Term 1 Score: <strong>94.2%</strong> &bull; Term 2 Score: <strong>95.0%</strong> &bull; Cumulative CGPA: <strong className="text-emerald-700 font-black">9.46</strong></p>
                <div className="pt-3 border-t flex justify-between text-xs">
                  <span>Result: <strong>PASSED WITH HONORS</strong></span>
                  <strong>{schoolInfo.principalName}</strong>
                </div>
              </div>
            );
        }
      }

      // 7. EXAM ADMIT CARD (HALL TICKET - 5 Master Design Layouts)
      case 'admit_card': {
        switch (admitCardTemplate) {
          case 'statutory_hall_ticket':
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

          case 'modern_qr_admit_pass':
            return (
              <div className="bg-white p-7 rounded-3xl border-2 border-blue-600 shadow-xl space-y-4 text-xs font-sans">
                <div className="flex justify-between items-center border-b pb-3">
                  <div>
                    <h2 className="font-black text-lg text-blue-950 uppercase">{schoolInfo.schoolName}</h2>
                    <div className="text-[10px] font-bold text-blue-600">DYNAMIC DIGITAL ADMIT CARD</div>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center border">
                    <QrCode className="w-6 h-6 text-slate-900" />
                  </div>
                </div>
                <div className="flex gap-4 items-center p-3 bg-blue-50/60 rounded-xl">
                  <img src={st.photo} alt={st.student_name} className="w-14 h-14 rounded-xl object-cover border" />
                  <div>
                    <div className="font-black text-sm text-slate-950">{st.student_name}</div>
                    <div className="text-xs text-blue-800 font-bold">Class: {st.class_batch} &bull; Seat: #{st.roll_no}</div>
                  </div>
                </div>
                <div className="pt-3 border-t flex justify-between text-xs">
                  <span>Reporting Time: 08:30 AM</span>
                  <strong>Exam In-Charge</strong>
                </div>
              </div>
            );

          case 'split_photo_admit_card':
            return (
              <div className="bg-white p-7 rounded-3xl border-4 border-slate-800 text-slate-900 space-y-4 text-xs font-sans shadow-xl">
                <div className="text-center border-b pb-2">
                  <h2 className="font-black text-base uppercase">{schoolInfo.schoolName}</h2>
                  <div className="text-[10px] text-slate-500 uppercase">DUAL-PHOTO VERIFIED ADMIT CARD</div>
                </div>
                <div className="flex justify-around items-center p-3 bg-slate-50 rounded-xl border">
                  <div className="text-center">
                    <img src={st.photo} alt={st.student_name} className="w-16 h-16 rounded-xl object-cover border mx-auto" />
                    <span className="text-[9px] text-slate-500 font-bold block mt-1">Candidate</span>
                  </div>
                  <div className="text-left space-y-1">
                    <div className="font-black text-sm">{st.student_name}</div>
                    <div className="text-xs text-slate-600">Class: {st.class_batch}</div>
                    <div className="text-xs font-mono font-bold text-blue-900">Roll #{st.roll_no}</div>
                  </div>
                </div>
                <div className="pt-3 border-t flex justify-between text-xs">
                  <span>Sign: _________________</span>
                  <strong>Invigilator Attestation</strong>
                </div>
              </div>
            );

          case 'compact_slip_format':
            return (
              <div className="bg-[#fafaf9] p-6 rounded-2xl border-2 border-slate-400 text-slate-900 space-y-3 text-xs font-sans">
                <div className="flex justify-between items-center border-b pb-1.5">
                  <strong className="text-xs uppercase">{schoolInfo.schoolName}</strong>
                  <span className="text-[10px] font-mono font-bold text-amber-800">SLIP #{st.roll_no}</span>
                </div>
                <div>Candidate: <strong>{st.student_name}</strong> ({st.class_batch})</div>
                <div className="p-2 bg-white rounded border text-[11px]">Center: Examination Hall B &bull; Slot: Morning</div>
                <div className="pt-2 border-t flex justify-between text-[10px]">
                  <span>Date: {issueDate}</span>
                  <strong>Authorized Controller</strong>
                </div>
              </div>
            );

          case 'executive_navy_hall_ticket':
          default:
            return (
              <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-7 rounded-3xl border-2 border-amber-400 shadow-2xl space-y-4 text-xs font-sans">
                <div className="text-center border-b border-white/20 pb-2">
                  <h2 className="text-lg font-black text-amber-300 uppercase">{schoolInfo.schoolName}</h2>
                  <div className="text-[10px] text-slate-300 uppercase">EXECUTIVE HALL TICKET &amp; REGULATIONS</div>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                  <div>
                    <div className="text-sm font-black text-white">{st.student_name}</div>
                    <div className="text-xs text-amber-300">Grade: {st.class_batch}</div>
                  </div>
                  <div className="font-mono text-xs font-bold bg-amber-400 text-slate-950 px-3 py-1 rounded-lg">
                    ROLL #{st.roll_no}
                  </div>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Rules: 1. Electronic gadgets strictly prohibited. 2. Arrive 30 mins before commencement. 3. Carry physical photo ID.
                </p>
                <div className="pt-3 border-t border-white/20 flex justify-between text-xs text-slate-400">
                  <span>Session: {academicSession}</span>
                  <span className="text-white font-bold">{schoolInfo.principalName}</span>
                </div>
              </div>
            );
        }
      }

      // 8. 5 SMART STUDENT ID CARD DESIGNS (Pixel-perfect matching reference images + Class/Section support)
      case 'id_card': {
        const studentClass = customClassSection || st.class_batch || 'Class 10 - Section A';
        
        switch (idCardTemplate) {
          // Template 1: Rimberio Navy Modern Chevron (Landscape) [Reference 1]
          case 'navy_chevron':
            return (
              <div className="w-full max-w-[620px] aspect-[1.58/1] bg-white rounded-3xl border-2 border-blue-900/40 shadow-2xl overflow-hidden relative font-sans flex flex-col justify-between p-5 mx-auto print:border-none">
                {/* Background Chevron Vector Shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 600 380" preserveAspectRatio="none">
                    <polygon points="0,0 220,0 120,240 0,160" fill="#0284c7" />
                    <polygon points="200,0 350,0 450,380 300,380" fill="#2563eb" />
                    <polygon points="400,0 600,0 600,200" fill="#38bdf8" />
                  </svg>
                </div>

                {/* Top Bar Header */}
                <div className="relative z-10 flex items-start justify-between">
                  {/* Left Pennant Shield with Cap Icon */}
                  <div className="flex items-start gap-4">
                    <div className="relative -mt-5 -ml-1">
                      <div className="w-16 h-20 bg-[#1a2e5a] shadow-lg flex flex-col items-center justify-center text-white relative" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)' }}>
                        <GraduationCap className="w-8 h-8 text-white mb-2" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-cyan-400 -z-10 rotate-45 transform"></div>
                    </div>

                    <div className="pt-0.5">
                      <h2 className="font-serif font-black text-xl sm:text-2xl text-[#1a2e5a] tracking-tight uppercase leading-none">
                        {schoolInfo.schoolName || 'RIMBERIO UNIVERSITY'}
                      </h2>
                      <p className="text-[10px] sm:text-xs text-slate-600 font-medium mt-1">
                        {schoolInfo.address || '123 Anywhere St., Any City, ST 12345'}
                      </p>
                    </div>
                  </div>

                  {/* Top Right Star Badge Tab */}
                  <div className="-mt-5 -mr-5 bg-[#0284c7] text-white w-14 h-14 rounded-bl-3xl flex items-center justify-center shadow-md">
                    <Star className="w-6 h-6 fill-white text-white translate-x-1 -translate-y-1" />
                  </div>
                </div>

                {/* Center Grid: Left Boxed Photo & Right Detail List */}
                <div className="relative z-10 grid grid-cols-12 gap-5 items-center my-auto">
                  {/* Framed Photo Box */}
                  <div className="col-span-4 flex justify-center">
                    <div className="p-1.5 bg-[#1a2e5a] rounded-2xl shadow-xl">
                      <img
                        src={st.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                        alt={st.student_name}
                        className="w-28 h-36 sm:w-32 sm:h-40 object-cover rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Right Info Section */}
                  <div className="col-span-8 space-y-2">
                    <div className="bg-gradient-to-r from-[#0284c7] to-[#1e40af] text-white font-black text-sm sm:text-base tracking-wider px-6 py-1.5 rounded-r-full inline-block shadow-md uppercase">
                      STUDENT CARD
                    </div>

                    <div className="space-y-1.5 text-xs sm:text-sm pl-1 font-semibold">
                      <div className="flex items-center">
                        <span className="w-20 font-black text-[#1a2e5a] uppercase text-[11px] sm:text-xs">NAME :</span>
                        <span className="font-black text-[#1a2e5a] uppercase text-xs sm:text-sm tracking-wide">{st.student_name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-20 font-black text-[#1a2e5a] uppercase text-[11px] sm:text-xs">CLASS :</span>
                        <span className="font-extrabold text-[#0284c7] bg-cyan-50 px-2.5 py-0.5 rounded-lg border border-cyan-200 text-xs sm:text-sm uppercase tracking-wide">
                          {studentClass}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-20 font-black text-[#1a2e5a] uppercase text-[11px] sm:text-xs">BIRTH :</span>
                        <span className="font-bold text-[#1a2e5a] text-xs sm:text-sm">{st.dob}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="w-20 font-black text-[#1a2e5a] uppercase text-[11px] sm:text-xs shrink-0">ADRESS :</span>
                        <span className="font-bold text-slate-700 text-[10px] sm:text-xs leading-tight line-clamp-1">
                          {st.residential_address || '123 ANYWHERE ST., ANY CITY'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-20 font-black text-[#1a2e5a] uppercase text-[11px] sm:text-xs">ID NO :</span>
                        <span className="font-mono font-black text-[#1a2e5a] text-xs sm:text-sm">{st.id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Barcode */}
                <div className="relative z-10 flex items-center justify-end border-t border-slate-100 pt-2">
                  <div className="text-right">
                    <div className="font-mono text-slate-800 font-bold tracking-widest text-[9px]">
                      |||||| |||| |||||||| ||| ||||||| || |||||||||||
                    </div>
                    <div className="text-[7.5px] font-mono text-slate-500 tracking-wider text-center">
                      0 35545 82336 78 1
                    </div>
                  </div>
                </div>
              </div>
            );

          // Template 2: Rimberio Sage Khaki & Honeycomb (Landscape) [Reference 2]
          case 'sage_khaki':
            return (
              <div className="w-full max-w-[620px] aspect-[1.58/1] bg-[#faf9f2] rounded-3xl border-2 border-[#8c8860] shadow-2xl overflow-hidden relative font-sans flex flex-col justify-between p-6 mx-auto print:border-none">
                {/* Honeycomb Watermark Vector */}
                <div className="absolute right-0 top-12 bottom-0 w-56 opacity-20 pointer-events-none">
                  <svg viewBox="0 0 200 240" className="w-full h-full stroke-[#706e48]" fill="none" strokeWidth="1.5">
                    <polygon points="100,20 130,37 130,73 100,90 70,73 70,37" />
                    <polygon points="160,55 190,72 190,108 160,125 130,108 130,72" />
                    <polygon points="100,92 130,109 130,145 100,162 70,145 70,109" />
                    <polygon points="160,127 190,144 190,180 160,197 130,180 130,144" />
                    <polygon points="40,55 70,72 70,108 40,125 10,108 10,72" />
                    <polygon points="40,127 70,144 70,180 40,197 10,180 10,144" />
                  </svg>
                </div>

                {/* Top Header */}
                <div className="relative z-10 flex items-center justify-between border-b border-[#8c8860]/30 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-[#706e48] bg-[#f0eee0] flex items-center justify-center text-[#706e48]">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current fill-none stroke-2">
                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                        <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)" />
                        <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)" />
                        <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(90 12 12)" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-black text-base sm:text-lg text-[#383724] tracking-wider uppercase leading-none">
                        {schoolInfo.schoolName || 'RIMBERIO'}
                      </h2>
                      <p className="text-[10px] font-black text-[#706e48] tracking-widest uppercase mt-0.5">
                        HIGH SCHOOL
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1.5 opacity-80">
                    {[1, 2, 3, 4].map(k => (
                      <div key={k} className="w-2.5 h-6 bg-[#8c8860] skew-x-[-25deg] rounded-sm"></div>
                    ))}
                  </div>
                </div>

                {/* Main Grid: Left Photo + Signature + Barcode, Right Info */}
                <div className="relative z-10 grid grid-cols-12 gap-6 items-center my-auto">
                  <div className="col-span-4 flex flex-col items-center">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-[#8c8860] bg-[#e8e6d5] w-28 h-36 sm:w-32 sm:h-40">
                      <img
                        src={st.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300'}
                        alt={st.student_name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 right-1 font-serif italic text-slate-900 font-extrabold text-sm opacity-90 drop-shadow-sm rotate-[-8deg] pointer-events-none select-none">
                        {st.student_name?.split(' ')[0] || 'Signature'}
                      </div>
                    </div>

                    <div className="mt-2 text-center">
                      <div className="font-mono text-[#383724] font-bold text-[8.5px] tracking-widest">
                        |||||||||||||||||||||||||||
                      </div>
                    </div>
                  </div>

                  <div className="col-span-8 space-y-3">
                    <h3 className="font-black text-2xl sm:text-3xl text-[#383724] uppercase tracking-wide">
                      STUDENT ID CARD
                    </h3>

                    <div className="space-y-1.5 text-xs sm:text-sm font-medium text-[#383724]">
                      <div className="grid grid-cols-12">
                        <span className="col-span-4 font-bold text-[#706e48]">Name</span>
                        <span className="col-span-1 text-center font-bold">:</span>
                        <span className="col-span-7 font-black text-[#2e2d1d] uppercase">{st.student_name}</span>
                      </div>
                      <div className="grid grid-cols-12">
                        <span className="col-span-4 font-bold text-[#706e48]">Class</span>
                        <span className="col-span-1 text-center font-bold">:</span>
                        <span className="col-span-7 font-extrabold text-[#706e48] bg-[#ebe9d8] px-2 py-0.5 rounded border border-[#8c8860]/40 inline-block uppercase text-xs">
                          {studentClass}
                        </span>
                      </div>
                      <div className="grid grid-cols-12">
                        <span className="col-span-4 font-bold text-[#706e48]">Student ID</span>
                        <span className="col-span-1 text-center font-bold">:</span>
                        <span className="col-span-7 font-mono font-bold text-[#2e2d1d]">{st.id}</span>
                      </div>
                      <div className="grid grid-cols-12">
                        <span className="col-span-4 font-bold text-[#706e48]">D.O.B</span>
                        <span className="col-span-1 text-center font-bold">:</span>
                        <span className="col-span-7 font-semibold text-[#2e2d1d]">{st.dob}</span>
                      </div>
                      <div className="grid grid-cols-12">
                        <span className="col-span-4 font-bold text-[#706e48]">Address</span>
                        <span className="col-span-1 text-center font-bold">:</span>
                        <span className="col-span-7 font-semibold text-[#2e2d1d] text-[10.5px] leading-tight line-clamp-1">
                          {st.residential_address || '123 Anywhere St., Any City'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between pt-2 border-t border-[#8c8860]/20">
                  <div className="flex gap-1 opacity-70">
                    {[1, 2, 3].map(k => (
                      <div key={k} className="w-3 h-2 bg-[#8c8860] skew-x-[-25deg] rounded-sm"></div>
                    ))}
                  </div>
                  <div className="text-[8.5px] font-bold text-[#706e48] uppercase tracking-wider">
                    Official Board Validated Identity Card
                  </div>
                </div>
              </div>
            );

          // Template 3: Borcelle Minimalist Terracotta & Olive Split (Landscape) [Reference 3]
          case 'terracotta_split':
            return (
              <div className="w-full max-w-[620px] aspect-[1.58/1] bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden relative font-sans flex flex-col justify-between p-5 mx-auto print:border-none">
                <div className="absolute top-0 bottom-0 left-0 w-28 bg-[#dbe4c6] -z-0"></div>

                <div className="relative z-10 flex items-start justify-between pl-28">
                  <div>
                    <h2 className="font-black text-sm sm:text-base text-slate-800 uppercase tracking-widest leading-none">
                      {schoolInfo.schoolName || 'BORCELLE'}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {schoolInfo.address || '123 Anywhere St., Any City'}
                    </p>
                  </div>

                  <div className="w-8 h-8 flex flex-col items-center justify-center">
                    <div className="w-5 h-2.5 bg-[#cbd5b1] rounded-t-md"></div>
                    <div className="w-5 h-2.5 bg-[#ea580c] rounded-b-md"></div>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-12 gap-5 items-center my-auto">
                  <div className="col-span-4 flex justify-start pl-2">
                    <div className="relative flex items-center">
                      <div className="w-3 h-36 sm:h-40 bg-[#ea580c] rounded-l-xl"></div>
                      <img
                        src={st.photo || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300'}
                        alt={st.student_name}
                        className="w-24 h-36 sm:w-28 sm:h-40 object-cover rounded-r-xl shadow-md"
                      />
                    </div>
                  </div>

                  <div className="col-span-8 space-y-2">
                    <div>
                      <h3 className="font-black text-2xl sm:text-3xl text-[#ea580c] uppercase tracking-wide">
                        STUDENT ID CARD
                      </h3>
                      <h4 className="font-black text-base sm:text-lg text-slate-800 uppercase tracking-wide mt-0.5">
                        {st.student_name}
                      </h4>
                    </div>

                    <div className="border-b-2 border-[#cbd5b1]/80 my-2"></div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] sm:text-xs">
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">DATE OF BIRTH</span>
                        <span className="font-extrabold text-slate-800">{st.dob}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">STUDENT ID</span>
                        <span className="font-black font-mono text-slate-800">{st.id}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">CLASS &amp; SEC</span>
                        <span className="font-black text-[#ea580c] uppercase bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 inline-block text-[10px] sm:text-xs">
                          {studentClass}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">PHONE</span>
                        <span className="font-bold text-slate-800">{st.father_phone || st.phone || '+91 98765 00000'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">ADDRESS</span>
                        <span className="font-bold text-slate-700 text-[9.5px] leading-tight line-clamp-1">
                          {st.residential_address || '123 Anywhere St., Any City'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between border-t border-slate-100 pt-2 pl-28 text-[9px] text-slate-400 font-mono">
                  <span>SESSION: {academicSession}</span>
                  <span className="text-[#ea580c] font-bold">RFID CHIP INTEGRATED</span>
                </div>
              </div>
            );

          // Template 4: Hanover Emerald & Cyan Wave Sine-Flow (Landscape) [Reference 4]
          case 'emerald_wave':
            return (
              <div className="w-full max-w-[620px] aspect-[1.58/1] bg-white rounded-3xl border-2 border-teal-800 shadow-2xl overflow-hidden relative font-sans flex flex-col justify-between p-0 mx-auto print:border-none">
                <div className="bg-gradient-to-r from-[#042f2e] via-[#0f766e] to-[#06b6d4] text-white px-6 py-3 flex items-center justify-between relative overflow-hidden">
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-teal-200" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-sm sm:text-base tracking-wide uppercase leading-none">
                        {schoolInfo.schoolName || 'HANOVER AND TYKE'}
                      </h2>
                      <p className="text-[9px] text-teal-200 font-medium tracking-wider uppercase mt-0.5">
                        ELEMENTARY &amp; HIGH SCHOOL
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-x-0 top-16 bottom-12 pointer-events-none opacity-25 overflow-hidden">
                  <svg viewBox="0 0 600 200" className="w-full h-full stroke-teal-600" fill="none" strokeWidth="1">
                    <path d="M 0,50 C 150,150 350,-50 600,80" />
                    <path d="M 0,65 C 150,165 350,-35 600,95" />
                    <path d="M 0,80 C 150,180 350,-20 600,110" />
                    <path d="M 0,95 C 150,195 350,-5 600,125" />
                    <path d="M 0,110 C 150,210 350,10 600,140" />
                  </svg>
                </div>

                <div className="relative z-10 p-5 grid grid-cols-12 gap-5 items-center my-auto">
                  <div className="col-span-4 flex flex-col items-center">
                    <div className="relative">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-teal-800 to-cyan-500 p-1 shadow-xl">
                        <img
                          src={st.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                          alt={st.student_name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    </div>
                    <div className="mt-3 font-mono text-[#042f2e] font-bold text-[8.5px] tracking-widest">
                      |||||||||||||||||||||||||||
                    </div>
                  </div>

                  <div className="col-span-8 space-y-2">
                    <h3 className="font-serif font-black text-2xl sm:text-3xl text-[#0f766e] uppercase tracking-wide leading-none">
                      STUDENT ID CARD
                    </h3>

                    <div className="space-y-1.5 text-xs sm:text-sm font-medium text-slate-800 pt-1">
                      <div className="grid grid-cols-12">
                        <span className="col-span-4 font-bold text-teal-900">Name</span>
                        <span className="col-span-1 text-center font-bold">:</span>
                        <span className="col-span-7 font-black text-slate-900 uppercase">{st.student_name}</span>
                      </div>
                      <div className="grid grid-cols-12">
                        <span className="col-span-4 font-bold text-teal-900">Class</span>
                        <span className="col-span-1 text-center font-bold">:</span>
                        <span className="col-span-7 font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block uppercase text-xs">
                          {studentClass}
                        </span>
                      </div>
                      <div className="grid grid-cols-12">
                        <span className="col-span-4 font-bold text-teal-900">Student ID</span>
                        <span className="col-span-1 text-center font-bold">:</span>
                        <span className="col-span-7 font-mono font-bold text-slate-900">{st.id}</span>
                      </div>
                      <div className="grid grid-cols-12">
                        <span className="col-span-4 font-bold text-teal-900">D.O.B</span>
                        <span className="col-span-1 text-center font-bold">:</span>
                        <span className="col-span-7 font-semibold text-slate-800">{st.dob}</span>
                      </div>
                      <div className="grid grid-cols-12">
                        <span className="col-span-4 font-bold text-teal-900">Address</span>
                        <span className="col-span-1 text-center font-bold">:</span>
                        <span className="col-span-7 font-semibold text-slate-700 text-[10.5px] leading-tight line-clamp-1">
                          {st.residential_address || '123 Anywhere St., Any City'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#042f2e] via-[#0f766e] to-[#06b6d4] text-white px-6 py-2 flex items-center justify-between text-[9px] font-mono">
                  <span>VALID: {academicSession}</span>
                  <span className="font-bold">VERIFIED CARD</span>
                </div>
              </div>
            );

          // Template 5: Borcelle Terracotta & Chocolate Heritage (Portrait / Vertical) [Reference 5]
          case 'terracotta_portrait':
          default:
            return (
              <div className="w-full max-w-[340px] aspect-[1/1.65] bg-[#fff6ee] rounded-3xl border-2 border-[#9a4b27] shadow-2xl overflow-hidden relative font-sans flex flex-col justify-between p-4 mx-auto print:border-none">
                <div className="bg-[#9a4b27] text-white p-3 rounded-2xl relative overflow-hidden shadow-md">
                  <div className="absolute right-0 top-0 w-16 h-16 opacity-30 pointer-events-none">
                    <svg viewBox="0 0 100 100" fill="currentColor">
                      <polygon points="100,0 0,0 100,100" />
                      <polygon points="100,50 50,0 100,0" fill="#f59e0b" />
                    </svg>
                  </div>

                  <div className="flex items-center gap-2.5 relative z-10">
                    <div className="w-9 h-9 rounded-full bg-white/10 ring-2 ring-amber-300/60 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h2 className="font-black text-sm tracking-wider uppercase leading-none text-white">
                        {schoolInfo.schoolName || 'BORCELLE'}
                      </h2>
                      <p className="text-[9px] font-black text-amber-200 tracking-widest uppercase mt-0.5">
                        HIGH SCHOOL
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 my-1.5 pl-2 opacity-80">
                  {[1, 2, 3, 4, 5, 6].map(k => (
                    <div key={k} className="w-2 h-1.5 bg-[#9a4b27] skew-x-[-25deg] rounded-xs"></div>
                  ))}
                </div>

                <div className="flex justify-center my-auto">
                  <div className="w-36 h-44 rounded-2xl overflow-hidden shadow-lg border-2 border-[#9a4b27]/30 bg-white">
                    <img
                      src={st.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                      alt={st.student_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-semibold text-[#4a2211] px-1">
                  <div className="grid grid-cols-12">
                    <span className="col-span-3 font-bold text-[#9a4b27]">Name</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-8 font-black text-[#4a2211] uppercase">{st.student_name}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-3 font-bold text-[#9a4b27]">Class</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-8 font-extrabold text-[#9a4b27] bg-amber-50 px-2 py-0.5 rounded border border-[#9a4b27]/30 inline-block uppercase text-xs">
                      {studentClass}
                    </span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-3 font-bold text-[#9a4b27]">ID</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-8 font-mono font-bold text-[#4a2211]">{st.id}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-3 font-bold text-[#9a4b27]">Email</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-8 font-medium text-[#4a2211] text-[10.5px] truncate">
                      {st.email || 'student@reallygreatsite.com'}
                    </span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-3 font-bold text-[#9a4b27]">Address</span>
                    <span className="col-span-1 text-center">:</span>
                    <span className="col-span-8 font-medium text-[#4a2211] text-[10px] leading-tight line-clamp-1">
                      {st.residential_address || '123 Anywhere St., Any City'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <div className="flex gap-1 opacity-80">
                    {[1, 2, 3, 4].map(k => (
                      <div key={k} className="w-2.5 h-2 bg-[#9a4b27] skew-x-[-25deg] rounded-xs"></div>
                    ))}
                  </div>
                </div>
              </div>
            );
        }
      }

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

        {/* Top Master Document & Certificate Type Selector (All 8 Institutional Documents) */}
        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h3 className="font-extrabold text-xs text-amber-300 uppercase tracking-wider">
                📜 Select Document / Certificate Type (8 Official Formats)
              </h3>
            </div>
            <span className="text-[10px] text-teal-300 bg-teal-950/60 px-2.5 py-0.5 rounded-full font-bold border border-teal-500/30">
              Active: {docTypesList.find(d => d.id === docType)?.title}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {docTypesList.map((dt) => {
              const Icon = dt.icon;
              const isSelected = docType === dt.id;
              return (
                <button
                  key={dt.id}
                  onClick={() => setDocType(dt.id)}
                  className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `bg-gradient-to-br ${dt.activeBg || 'from-teal-600/40 to-slate-900 border-teal-400 text-white'} shadow-lg ring-2 ring-white/30 scale-[1.04]`
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-amber-300'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white font-black" />}
                    </div>
                    <div className="text-xs font-black leading-tight text-white line-clamp-2">
                      {dt.title}
                    </div>
                    <p className="text-[9.5px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                      {dt.subtitle}
                    </p>
                  </div>
                  <div className="mt-2 pt-1 border-t border-white/10 text-[8.5px] font-bold text-teal-300 uppercase truncate">
                    {dt.tag || dt.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
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

      {/* 5 SMART STUDENT ID CARD CAROUSEL SWITCHER (When Doc Type is 'id_card') */}
      {docType === 'id_card' && (
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-5 text-white border-2 border-teal-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IdCard className="w-4 h-4 text-teal-300" />
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
                🪪 5 Official Student ID Card Layout Templates (With Class/Section)
              </h3>
            </div>
            <span className="text-[10px] text-teal-200 bg-teal-900/80 px-2.5 py-0.5 rounded-full font-bold border border-teal-500/40">
              Active: {idCardTemplatesList.find(t => t.id === idCardTemplate)?.title}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {idCardTemplatesList.map((tpl) => {
              const isSelected = idCardTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => setIdCardTemplate(tpl.id)}
                  className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `bg-gradient-to-br ${tpl.activeBg} shadow-lg ring-2 ring-white/40 scale-[1.03]`
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold text-teal-300 uppercase tracking-wider">{tpl.tag.split('•')[0]}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white font-bold" />}
                    </div>
                    <div className="text-xs font-black text-white leading-tight">{tpl.title}</div>
                    <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">{tpl.desc}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span className="capitalize">{tpl.orientation}</span>
                    <span className="text-teal-300 font-bold">Select</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5 APPRECIATION TEMPLATE SWITCHER (When Doc Type is 'appreciation') */}
      {docType === 'appreciation' && (
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 rounded-3xl p-5 text-white border-2 border-rose-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-rose-300" />
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
                🏆 5 Official Appreciation &amp; Merit Certificate Layouts
              </h3>
            </div>
            <span className="text-[10px] text-rose-200 bg-rose-900/80 px-2.5 py-0.5 rounded-full font-bold border border-rose-500/40">
              Active: {appreciationTemplatesList.find(t => t.id === appreciationTemplate)?.title}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {appreciationTemplatesList.map((tpl) => {
              const isSelected = appreciationTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => {
                    setAppreciationTemplate(tpl.id);
                    if (tpl.defaultConfig) {
                      setCertConfig(prev => ({ ...prev, ...tpl.defaultConfig }));
                    }
                  }}
                  className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `bg-gradient-to-br ${tpl.activeBg} shadow-lg ring-2 ring-white/40 scale-[1.03]`
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold text-rose-300 uppercase tracking-wider">{tpl.tag.split('•')[0]}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white font-bold" />}
                    </div>
                    <div className="text-xs font-black text-white leading-tight">{tpl.title}</div>
                    <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">{tpl.desc}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span className="capitalize">{tpl.orientation}</span>
                    <span className="text-rose-300 font-bold">Select</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5 PARTICIPATION TEMPLATE SWITCHER (When Doc Type is 'participation') */}
      {docType === 'participation' && (
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-cyan-950 rounded-3xl p-5 text-white border-2 border-teal-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Medal className="w-4 h-4 text-teal-300" />
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
                🏅 5 Official Participation &amp; Contest Award Layouts
              </h3>
            </div>
            <span className="text-[10px] text-teal-200 bg-teal-900/80 px-2.5 py-0.5 rounded-full font-bold border border-teal-500/40">
              Active: {participationTemplatesList.find(t => t.id === participationTemplate)?.title}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {participationTemplatesList.map((tpl) => {
              const isSelected = participationTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => {
                    setParticipationTemplate(tpl.id);
                    if (tpl.defaultConfig) {
                      setCertConfig(prev => ({ ...prev, ...tpl.defaultConfig }));
                    }
                  }}
                  className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `bg-gradient-to-br ${tpl.activeBg} shadow-lg ring-2 ring-white/40 scale-[1.03]`
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold text-teal-300 uppercase tracking-wider">{tpl.tag.split('•')[0]}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white font-bold" />}
                    </div>
                    <div className="text-xs font-black text-white leading-tight">{tpl.title}</div>
                    <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">{tpl.desc}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span className="capitalize">{tpl.orientation}</span>
                    <span className="text-teal-300 font-bold">Select</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5 DOMICILE & BONAFIDE TEMPLATE SWITCHER (When Doc Type is 'domicile') */}
      {docType === 'domicile' && (
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-5 text-white border-2 border-blue-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-300" />
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
                🏛️ 5 Official Domicile &amp; Bonafide Certificate Layouts
              </h3>
            </div>
            <span className="text-[10px] text-blue-200 bg-blue-900/80 px-2.5 py-0.5 rounded-full font-bold border border-blue-500/40">
              Active: {domicileTemplatesList.find(t => t.id === domicileTemplate)?.title}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {domicileTemplatesList.map((tpl) => {
              const isSelected = domicileTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => setDomicileTemplate(tpl.id)}
                  className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `bg-gradient-to-br ${tpl.activeBg} shadow-lg ring-2 ring-white/40 scale-[1.03]`
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold text-blue-300 uppercase tracking-wider">{tpl.tag.split('•')[0]}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white font-bold" />}
                    </div>
                    <div className="text-xs font-black text-white leading-tight">{tpl.title}</div>
                    <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">{tpl.desc}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span className="capitalize">{tpl.orientation}</span>
                    <span className="text-blue-300 font-bold">Select</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5 CHARACTER & MIGRATION TEMPLATE SWITCHER (When Doc Type is 'migration') */}
      {docType === 'migration' && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-5 text-white border-2 border-emerald-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scroll className="w-4 h-4 text-emerald-300" />
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
                📜 5 Official Character &amp; Migration Certificate Layouts
              </h3>
            </div>
            <span className="text-[10px] text-emerald-200 bg-emerald-900/80 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/40">
              Active: {migrationTemplatesList.find(t => t.id === migrationTemplate)?.title}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {migrationTemplatesList.map((tpl) => {
              const isSelected = migrationTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => setMigrationTemplate(tpl.id)}
                  className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `bg-gradient-to-br ${tpl.activeBg} shadow-lg ring-2 ring-white/40 scale-[1.03]`
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider">{tpl.tag.split('•')[0]}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white font-bold" />}
                    </div>
                    <div className="text-xs font-black text-white leading-tight">{tpl.title}</div>
                    <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">{tpl.desc}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span className="capitalize">{tpl.orientation}</span>
                    <span className="text-emerald-300 font-bold">Select</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5 ACADEMIC REPORT CARD / MARKSHEET TEMPLATE SWITCHER (When Doc Type is 'report_card') */}
      {docType === 'report_card' && (
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-5 text-white border-2 border-purple-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-300" />
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
                📊 5 Official Academic Report Card &amp; Marksheet Layouts
              </h3>
            </div>
            <span className="text-[10px] text-purple-200 bg-purple-900/80 px-2.5 py-0.5 rounded-full font-bold border border-purple-500/40">
              Active: {reportCardTemplatesList.find(t => t.id === reportCardTemplate)?.title}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {reportCardTemplatesList.map((tpl) => {
              const isSelected = reportCardTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => setReportCardTemplate(tpl.id)}
                  className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `bg-gradient-to-br ${tpl.activeBg} shadow-lg ring-2 ring-white/40 scale-[1.03]`
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold text-purple-300 uppercase tracking-wider">{tpl.tag.split('•')[0]}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white font-bold" />}
                    </div>
                    <div className="text-xs font-black text-white leading-tight">{tpl.title}</div>
                    <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">{tpl.desc}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span className="capitalize">{tpl.orientation}</span>
                    <span className="text-purple-300 font-bold">Select</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5 EXAM ADMIT CARD / HALL TICKET TEMPLATE SWITCHER (When Doc Type is 'admit_card') */}
      {docType === 'admit_card' && (
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-orange-950 rounded-3xl p-5 text-white border-2 border-amber-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-300" />
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
                🎫 5 Official Exam Admit Card &amp; Hall Ticket Layouts
              </h3>
            </div>
            <span className="text-[10px] text-amber-200 bg-amber-900/80 px-2.5 py-0.5 rounded-full font-bold border border-amber-500/40">
              Active: {admitCardTemplatesList.find(t => t.id === admitCardTemplate)?.title}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {admitCardTemplatesList.map((tpl) => {
              const isSelected = admitCardTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => setAdmitCardTemplate(tpl.id)}
                  className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `bg-gradient-to-br ${tpl.activeBg} shadow-lg ring-2 ring-white/40 scale-[1.03]`
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider">{tpl.tag.split('•')[0]}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white font-bold" />}
                    </div>
                    <div className="text-xs font-black text-white leading-tight">{tpl.title}</div>
                    <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">{tpl.desc}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span className="capitalize">{tpl.orientation}</span>
                    <span className="text-amber-300 font-bold">Select</span>
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
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  const found = studentList.find(s => s.id === e.target.value);
                  if (found) setCustomClassSection(found.class_batch || '');
                }}
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

            {/* Class / Section Editable Field (Key Requirement for ID Cards & Documents) */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Class / Grade &amp; Section</span>
                <span className="text-[10px] font-normal text-teal-600">Appears on ID Card &amp; Certificates</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Class 10 - Section A"
                value={customClassSection || activeStudent.class_batch || 'Class 10 - Section A'}
                onChange={(e) => setCustomClassSection(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-teal-200 bg-teal-50/40 text-slate-900 font-bold text-xs outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Full Live Customizer for Certificate of Appreciation & Participation */}
            {(docType === 'appreciation' || docType === 'participation') && (
              <div className="space-y-3 p-4 bg-gradient-to-br from-amber-50/80 to-rose-50/60 rounded-2xl border-2 border-amber-300/80 shadow-sm">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                  <div className="flex items-center gap-1.5 font-black text-[11px] text-amber-950 uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>🎨 Live Certificate Text &amp; Citation Customizer</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (docType === 'appreciation') {
                        const tpl = appreciationTemplatesList.find(t => t.id === appreciationTemplate);
                        if (tpl && tpl.defaultConfig) {
                          setCertConfig(prev => ({ ...prev, ...tpl.defaultConfig }));
                        }
                      } else if (docType === 'participation') {
                        const tpl = participationTemplatesList.find(t => t.id === participationTemplate);
                        if (tpl && tpl.defaultConfig) {
                          setCertConfig(prev => ({ ...prev, ...tpl.defaultConfig }));
                        }
                      }
                    }}
                    className="text-[10px] text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-0.5">Certificate Title</label>
                    <input
                      type="text"
                      placeholder="e.g. CERTIFICATE or CERTIFICATE OF"
                      value={certConfig.title}
                      onChange={(e) => setCertConfig(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 text-xs font-bold text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-0.5">Subtitle / Type</label>
                    <input
                      type="text"
                      placeholder="e.g. OF PARTICIPATION / OF APPRECIATION"
                      value={certConfig.subtitle}
                      onChange={(e) => setCertConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 text-xs font-bold text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-0.5">Presentation Line</label>
                  <input
                    type="text"
                    placeholder="e.g. THIS CERTIFICATE IS PROUDLY PRESENTED TO"
                    value={certConfig.presentationLine}
                    onChange={(e) => setCertConfig(prev => ({ ...prev, presentationLine: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 text-xs font-semibold text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-0.5 flex items-center justify-between">
                    <span>Recipient Name Override</span>
                    <span className="text-[9px] text-slate-400 font-normal">Leave blank to use selected candidate ({activeStudent.student_name})</span>
                  </label>
                  <input
                    type="text"
                    placeholder={activeStudent.student_name || 'Candidate Name'}
                    value={certConfig.recipientName}
                    onChange={(e) => setCertConfig(prev => ({ ...prev, recipientName: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 text-xs font-black text-amber-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-0.5">Citation / Recognition Body Paragraph</label>
                  <textarea
                    rows={3}
                    value={certConfig.bodyText}
                    onChange={(e) => setCertConfig(prev => ({ ...prev, bodyText: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 text-xs font-medium text-slate-800 bg-white leading-relaxed resize-y"
                    placeholder="Describe student achievements, contributions, or participation citation..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-0.5">Award / Presentation Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 14 August 2024"
                    value={certConfig.awardDate}
                    onChange={(e) => setCertConfig(prev => ({ ...prev, awardDate: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 text-xs font-semibold text-slate-900 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-200/50">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-0.5">Signatory 1 Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Juliana Silva"
                      value={certConfig.signatory1Name}
                      onChange={(e) => setCertConfig(prev => ({ ...prev, signatory1Name: e.target.value }))}
                      className="w-full px-2.5 py-1 rounded-lg border border-amber-200 text-[11px] font-bold text-slate-900 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="e.g. Art Coordinator"
                      value={certConfig.signatory1Title}
                      onChange={(e) => setCertConfig(prev => ({ ...prev, signatory1Title: e.target.value }))}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] text-slate-600 bg-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-0.5">Signatory 2 Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Marceline Anderson"
                      value={certConfig.signatory2Name}
                      onChange={(e) => setCertConfig(prev => ({ ...prev, signatory2Name: e.target.value }))}
                      className="w-full px-2.5 py-1 rounded-lg border border-amber-200 text-[11px] font-bold text-slate-900 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="e.g. School Principal"
                      value={certConfig.signatory2Title}
                      onChange={(e) => setCertConfig(prev => ({ ...prev, signatory2Title: e.target.value }))}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] text-slate-600 bg-white mt-1"
                    />
                  </div>
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
