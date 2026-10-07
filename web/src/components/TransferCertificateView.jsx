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
  Star,
  Lock,
  ShieldAlert
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

  // 5 Character & Migration Templates (Matching uploaded reference designs)
  const [migrationTemplate, setMigrationTemplate] = useState('cbse_bilingual_migration');

  // 5 Domicile & Bonafide Templates
  const [domicileTemplate, setDomicileTemplate] = useState('statutory_residence_formal');

  // 5 Academic Report Card / Marksheet Templates (Matching uploaded reference designs)
  const [reportCardTemplate, setReportCardTemplate] = useState('salford_skyblue_quarterly');

  // 5 Exam Admit Card / Hall Ticket Templates (Matching uploaded reference designs)
  const [admitCardTemplate, setAdmitCardTemplate] = useState('ignou_term_end_admit');

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

  // Active student object & Fee clearance validation
  const activeStudent = studentList.find(s => s.id === selectedStudentId || s.name === selectedStudentId) || studentList[0] || {};
  const isFeePending = activeStudent.fee_status === 'Pending' || activeStudent.fee_status === 'Unpaid' || activeStudent.fee_status === 'Due' || (activeStudent.feeDues && activeStudent.feeDues > 0);

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
      borderStyle: 'border-amber-400',
      defaultConfig: {
        title: 'TRANSFER CERTIFICATE',
        subtitle: 'DISCIPLINE • KNOWLEDGE • EXCELLENCE',
        presentationLine: 'This is to certify that',
        recipientName: '',
        bodyText: 'This is to certify that the above named pupil was a bonafide student of this School and has successfully completed the prescribed course of study. He / She is hereby relieved of all dues and is permitted to join the new School / Institution.',
        awardDate: '07-Oct-2026',
        signatory1Name: 'Dr. Marcus Vance, Ph.D.',
        signatory1Title: 'Principal (Signature)',
        signatory2Name: 'Class Teacher',
        signatory2Title: '(Signature)'
      }
    },
    {
      id: 'royal_gold',
      title: 'Royal Navy & Gold Crest',
      tag: 'Landscape • Luxury Crest',
      desc: 'Ornate gold corners, ribbon motto header, gold embossed stamp',
      orientation: 'landscape',
      borderStyle: 'border-amber-400',
      defaultConfig: {
        title: 'Transfer & Character Certificate',
        subtitle: 'OFFICIAL GRADUATION RECORD',
        presentationLine: 'This is to officially certify that',
        recipientName: '',
        bodyText: 'All institutional dues and library books have been satisfactorily accounted for and returned. We wish the student all success in future academic endeavors.',
        awardDate: '07-Oct-2026',
        signatory1Name: 'Dr. Marcus Vance, Ph.D.',
        signatory1Title: 'Headmaster / Principal',
        signatory2Name: 'Class Teacher',
        signatory2Title: 'Prepared & Verified By'
      }
    },
    {
      id: 'cbse_statutory',
      title: 'CBSE Statutory 15-Point',
      tag: 'Portrait • Board Standard',
      desc: 'Affiliation & School Code, 15 statutory clauses, triple signatory',
      orientation: 'portrait',
      borderStyle: 'border-slate-800',
      defaultConfig: {
        title: 'TRANSFER CERTIFICATE',
        subtitle: 'Affiliated to CBSE, New Delhi',
        presentationLine: 'Statutory Student Record',
        recipientName: '',
        bodyText: 'Certified that all school dues and library loans have been accounted for and the pupil is hereby relieved with good moral conduct.',
        awardDate: '07-Oct-2026',
        signatory1Name: 'Dr. Marcus Vance, Ph.D.',
        signatory1Title: 'Principal & Official Seal',
        signatory2Name: 'Office Superintendent',
        signatory2Title: 'Checked By'
      }
    },
    {
      id: 'traditional_heritage',
      title: 'Traditional Heritage Leaving (St. Francis 23-Point)',
      tag: 'Portrait • 23-Point Leaving Record (Reference 3)',
      desc: 'St. Francis Xavier style vintage parchment texture, school crest, 23 numbered statutory items, triple signatories',
      orientation: 'portrait',
      borderStyle: 'border-stone-800',
      defaultConfig: {
        title: 'TRANSFER CERTIFICATE',
        subtitle: 'Affiliated to C.B.S.E., New Delhi',
        presentationLine: 'Statutory 23-Clause Leaving Record',
        recipientName: '',
        bodyText: 'He/She bears an exemplary moral character. All institutional records and accounts have been verified.',
        awardDate: '12 July 2019',
        signatory1Name: 'Dr. Marcus Vance, Ph.D.',
        signatory1Title: 'Principal (With Official Seal)',
        signatory2Name: 'Senior Registrar',
        signatory2Title: 'Checked by'
      }
    },
    {
      id: 'vintage_crimson',
      title: 'DPS Character Certificate (Reference 1)',
      tag: 'Portrait • Formal Character Certificate',
      desc: 'Delhi Public School Birgunj reference with school emblem, trust logo, serial/registration codes, and green principal stamp',
      orientation: 'portrait',
      borderStyle: 'border-emerald-800',
      defaultConfig: {
        title: 'Character Certificate',
        subtitle: 'BONAFIDE CONDUCT & MORAL STANDING',
        presentationLine: 'This is to certify that',
        recipientName: '',
        bodyText: 'His/Her conduct during the tenure of schooling has been good. He/She bears a good moral character. We wish him/her success in all his/her future endeavors.',
        awardDate: '23-05-2023',
        signatory1Name: 'Dr. Marcus Vance',
        signatory1Title: 'Principal (Official Stamp & Seal)',
        signatory2Name: 'Class Teacher',
        signatory2Title: 'Verified Record'
      }
    },
    {
      id: 'classic_ivory',
      title: 'Classic Ivory Filigree',
      tag: 'Landscape • Banknote Grade',
      desc: 'Intricate currency-grade filigree borders, gold rosette medallion',
      orientation: 'landscape',
      borderStyle: 'border-amber-600',
      defaultConfig: {
        title: 'Certificate of Transfer & Merit',
        subtitle: 'AUTONOMOUS ACADEMIC RECORD',
        presentationLine: 'This is to certify that',
        recipientName: '',
        bodyText: 'The candidate has been a regular and disciplined student of this institution and is hereby relieved with highest recommendation.',
        awardDate: '07-Oct-2026',
        signatory1Name: 'Dr. Marcus Vance, Ph.D.',
        signatory1Title: 'Head of Institution',
        signatory2Name: 'Office Registrar',
        signatory2Title: 'Prepared By'
      }
    },
    {
      id: 'modern_platinum',
      title: 'Modern Platinum & Cobalt (Application & Pass - Reference 2)',
      tag: 'Portrait • Cobalt & Cyan Geometry',
      desc: 'Modern angular cobalt/cyan vector corner accents, dedicated school logo, formal parent application & clearance release',
      orientation: 'portrait',
      borderStyle: 'border-blue-600',
      defaultConfig: {
        title: 'TRANSFER CERTIFICATE APPLICATION BY PARENTS',
        subtitle: 'OFFICIAL CLEARANCE & STUDENT RELOCATION PASS',
        presentationLine: 'Application for Transfer Certificate & Official Release',
        recipientName: '',
        bodyText: 'Due to our family relocation, we are unable to continue his/her studies at your institution. Therefore, I request you to kindly issue his/her Transfer Certificate so that he/she may secure admission to a new institution. We have cleared all dues and completed the required formalities. We shall be thankful for your cooperation.',
        awardDate: '07-Oct-2026',
        signatory1Name: 'Dr. Marcus Vance, Ph.D.',
        signatory1Title: 'Principal / Authorized Head',
        signatory2Name: 'Parent / Guardian',
        signatory2Title: 'Yours faithfully'
      }
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
      id: 'cbse_bilingual_migration',
      title: 'CBSE Statutory Bilingual (Central Board)',
      tag: 'Portrait • Bilingual Hindi & English Micro-Text',
      desc: 'Official CBSE bilingual migration certificate with central emblem watermark, S.No. Mig/2026, and statutory No-Objection clause',
      orientation: 'portrait',
      activeBg: 'from-blue-900/40 to-slate-900 border-amber-400 text-amber-200',
      defaultConfig: {
        title: 'केन्द्रीय माध्यमिक शिक्षा बोर्ड',
        subtitle: 'CENTRAL BOARD OF SECONDARY EDUCATION',
        presentationLine: 'प्रवास प्रमाण पत्र / MIGRATION CERTIFICATE',
        recipientName: '',
        eventTitle: 'ALL INDIA SR. SCHOOL CERTIFICATE EXAMINATION (AISSCE)',
        bodyText: 'उसके द्वारा किसी भी मान्यता प्राप्त महाविद्यालय/संस्था में प्रवेश लेने अथवा विधि द्वारा मान्य किसी भी विश्वविद्यालय या अन्य बोर्ड की परीक्षा देने में बोर्ड को कोई आपत्ति नहीं है।\nThis Board has no objection in his/her joining any recognised College/Institute or taking examination of any University or Board established by law.',
        awardDate: '15 June 2026',
        signatory1Name: 'Dr. Sanyam Bhardwaj',
        signatory1Title: 'Controller of Examinations',
        signatory2Name: 'Anurag Tripathi, IRPS',
        signatory2Title: 'Secretary',
        organizationName: 'CENTRAL BOARD OF SECONDARY EDUCATION'
      }
    },
    {
      id: 'ptu_state_technical_migration',
      title: 'State Technical University (PTU Standard)',
      tag: 'Portrait • Gurmukhi/English & 4-Tier Verification',
      desc: 'Punjabi + English university title, colored emblem, top EDP serial no., 2D QR barcode block, and 4-column signature row',
      orientation: 'portrait',
      activeBg: 'from-red-950/40 to-slate-900 border-red-400 text-red-200',
      defaultConfig: {
        title: 'ਆਈ.ਕੇ.ਗੁਜਰਾਲ ਪੰਜਾਬ ਟੈਕਨੀਕਲ ਯੂਨੀਵਰਸਿਟੀ',
        subtitle: 'I.K. Gujral Punjab Technical University',
        presentationLine: 'Migration Certificate',
        recipientName: 'Ratnesh Kumar',
        eventTitle: 'Bachelor of Technology (Computer Science & AI)',
        bodyText: 'has passed degree in the discipline of Computer Science & Engineering in the examination held under University Registration No. as a student of this affiliated institute.\nThis University has \'No Objection\', whatsoever, to his/her migration/admission to pursue further studies.',
        awardDate: '22/06/2026',
        signatory1Name: 'Prof. Harpreet Singh',
        signatory1Title: 'Officer Incharge',
        signatory2Name: 'Dr. Ranbir Sharma',
        signatory2Title: 'Controller of Examinations',
        organizationName: 'I.K. GUJRAL PUNJAB TECHNICAL UNIVERSITY'
      }
    },
    {
      id: 'delhi_univ_central_migration',
      title: 'Central University (University of Delhi Standard)',
      tag: 'Portrait • Purple Crest & Digital QR Code',
      desc: 'Clean central university layout with royal purple emblem, security verification QR code box, and statutory character clearance',
      orientation: 'portrait',
      activeBg: 'from-purple-950/40 to-slate-900 border-purple-400 text-purple-200',
      defaultConfig: {
        title: 'UNIVERSITY OF DELHI',
        subtitle: 'दिल्ली विश्वविद्यालय • DELHI - 110007',
        presentationLine: 'Migration Certificate',
        recipientName: 'SUNDER GOUTAM',
        eventTitle: 'Faculty of Inter-Disciplinary & Applied Sciences',
        bodyText: 'is informed that this University / Institution has no objection to his/her joining any other University. The Institution is not aware of anything against his/her character or conduct which should be bar to his/her admission to another University.',
        awardDate: '19/Oct/2026',
        signatory1Name: 'Prof. Ajay Kumar Arora',
        signatory1Title: 'Authorized Signatory',
        signatory2Name: 'Dr. Vikas Gupta',
        signatory2Title: 'Registrar',
        organizationName: 'UNIVERSITY OF DELHI'
      }
    },
    {
      id: 'statutory_board_character_migration',
      title: 'National Statutory Character & Conduct Clear-Pass',
      tag: 'Portrait • Board Conduct & Disciplinary Record',
      desc: 'Formal double-border character clearance certificate with institutional conduct endorsement, attendance grade, and gold seal',
      orientation: 'portrait',
      activeBg: 'from-emerald-900/40 to-slate-900 border-emerald-400 text-emerald-200',
      defaultConfig: {
        title: 'STATUTORY BOARD OF SECONDARY EDUCATION',
        subtitle: 'OFFICIAL CHARACTER & MIGRATION CLEARANCE',
        presentationLine: 'To Whomsoever It May Concern',
        recipientName: '',
        eventTitle: 'Senior Secondary Academic Clearance',
        bodyText: 'This is to certify that the student has completed their prescribed curriculum with exemplary moral conduct and discipline. This institution has NO OBJECTION to their migration or admission to any institution in India or abroad.',
        awardDate: '15 June 2026',
        signatory1Name: 'Dr. Marcus Vance',
        signatory1Title: 'Principal / Head of Institution',
        signatory2Name: 'Office Registrar',
        signatory2Title: 'Director of Admissions',
        organizationName: 'International Model Academy'
      }
    },
    {
      id: 'modern_cryptographic_qr_migration',
      title: 'Modern Cryptographic Digital QR Migration Pass',
      tag: 'Landscape • High-Security Anti-Tamper & Cryptographic QR',
      desc: 'Security anti-tamper guilloche borders, cryptographic QR verification token, clearance checklist, and barcode tracking',
      orientation: 'landscape',
      activeBg: 'from-cyan-900/40 to-slate-900 border-cyan-400 text-cyan-200',
      defaultConfig: {
        title: 'DEPARTMENT OF SCHOOL EDUCATION',
        subtitle: 'CRYPTOGRAPHIC MIGRATION & IDENTITY RECORD',
        presentationLine: 'OFFICIAL DIGITAL CLEARANCE PASS',
        recipientName: '',
        eventTitle: 'Secondary & Higher Secondary Board Standard',
        bodyText: 'Verified digital migration record. The student has satisfied all statutory, financial, and disciplinary requirements and is cleared for nationwide academic migration.',
        awardDate: '2026-06-15',
        signatory1Name: 'Chief Controller',
        signatory1Title: 'Digital Examination Wing',
        signatory2Name: 'Director General',
        signatory2Title: 'Statutory Education Council',
        organizationName: 'NATIONAL COUNCIL OF SECONDARY EDUCATION'
      }
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
      id: 'salford_skyblue_quarterly',
      title: 'Salford Sky-Blue Quarterly (Image 1)',
      tag: 'Portrait • 4 Quarters & Grading Scale',
      desc: 'Sky-blue graduation logo, 4-quarterly marks table for 10 subjects, percentage grading scale, and teacher comments box',
      orientation: 'portrait',
      activeBg: 'from-sky-700/30 to-blue-700/20 border-sky-400 text-sky-200',
      defaultConfig: {
        title: 'REPORT CARD',
        subtitle: 'Salford High School',
        presentationLine: 'Academic Performance & Term Evaluation Record',
        recipientName: '',
        eventTitle: 'High School / Senior Secondary',
        bodyText: 'Demonstrates consistent academic effort, excellent analytical skills, and exemplary classroom participation throughout all four academic quarters.',
        awardDate: 'Academic Session 2025-2026',
        signatory1Name: 'Mrs. Eleanor Vance',
        signatory1Title: 'Class Teacher',
        signatory2Name: 'Dr. Marcus Vance',
        signatory2Title: 'Principal',
        organizationName: 'Salford High School'
      }
    },
    {
      id: 'homeschool_holistic_habits',
      title: 'Homeschool & Habits Profile (Image 2)',
      tag: 'Portrait • 5-Star Habits & Term Focus',
      desc: 'Pastel yellow & clean double-border layout, subject evaluations, 5-star learning habits, term highlights, and next term focus',
      orientation: 'portrait',
      activeBg: 'from-amber-700/30 to-yellow-700/20 border-amber-400 text-amber-200',
      defaultConfig: {
        title: 'HOMESCHOOL REPORT CARD',
        subtitle: 'Comprehensive Student Evaluation & Learning Profile',
        presentationLine: 'Individualized Academic Growth & Habit Assessment',
        recipientName: '',
        eventTitle: 'Middle & Senior Years Curriculum',
        bodyText: 'Outstanding self-directed learning, thorough project documentation, and proactive problem-solving throughout the term.',
        awardDate: 'Academic Term 2025-2026',
        signatory1Name: 'Elena Rostova',
        signatory1Title: 'Instructor Signature',
        signatory2Name: 'Rajesh Patel',
        signatory2Title: 'Parent Signature',
        organizationName: 'Homeschool Academic Academy'
      }
    },
    {
      id: 'salford_maroon_quarterly',
      title: 'Salford Burgundy Laurel (Image 3)',
      tag: 'Portrait • Laurel Crest & Dual Corner Swooshes',
      desc: 'Rich burgundy header, laurel wreath crest, 4-quarter subject grading table, grading scale card, and dedicated comment box',
      orientation: 'portrait',
      activeBg: 'from-rose-900/40 to-red-950 border-rose-400 text-rose-200',
      defaultConfig: {
        title: 'REPORT CARD',
        subtitle: 'SALFORD HIGH SCHOOL',
        presentationLine: 'Comprehensive Scholastic Evaluation & Progress Record',
        recipientName: '',
        eventTitle: 'Secondary School Certification (Class 10)',
        bodyText: 'Shows outstanding scholastic progress, consistent homework completion, and great enthusiasm in STEM and language studies.',
        awardDate: 'Session 2025-2026',
        signatory1Name: 'Margaret Thatcher',
        signatory1Title: 'Academic Coordinator',
        signatory2Name: 'Harold McMillan',
        signatory2Title: 'Head of School',
        organizationName: 'SALFORD HIGH SCHOOL'
      }
    },
    {
      id: 'classic_ivy_slate_gold',
      title: 'Classic Ivy League Slate & Gold (Image 4)',
      tag: 'Portrait • Slate Blue Ribbons & Serif Typography',
      desc: 'Dark slate blue section banners with gold serif lettering, attendance record, subject grades, and teacher feedback',
      orientation: 'portrait',
      activeBg: 'from-slate-800/40 to-blue-950 border-amber-400 text-amber-200',
      defaultConfig: {
        title: 'REPORT CARD',
        subtitle: 'Ivy League Academic Standards & Transcript',
        presentationLine: 'Official Student Academic Record & Evaluation',
        recipientName: '',
        eventTitle: 'Senior Grade 10 Honors',
        bodyText: 'Exceptional academic discipline, intellectual curiosity, and top-tier performance across humanities and science subjects.',
        awardDate: 'Term Ending March 2026',
        signatory1Name: 'Prof. Alistair Finch',
        signatory1Title: 'Senior Master',
        signatory2Name: 'Dr. Rebecca Sterling',
        signatory2Title: 'Dean of Studies',
        organizationName: 'St. Jude International Academy'
      }
    },
    {
      id: 'borcelle_lavender_pill',
      title: 'Borcelle Lavender Pill Gradebook (Image 5)',
      tag: 'Portrait • Purple Banner, BLS Shield & Pill Badges',
      desc: 'Deep purple header with BLS shield crest, lavender rounded containers, white pill inputs for grades, and ruled comments area',
      orientation: 'portrait',
      activeBg: 'from-purple-800/30 to-violet-900/20 border-purple-400 text-purple-200',
      defaultConfig: {
        title: 'STUDENT REPORT CARD',
        subtitle: 'BORCELLE LANGUAGE SCHOOL',
        presentationLine: 'FIRST TERM EVALUATION',
        recipientName: '',
        eventTitle: 'Advanced English & Multilingual Studies',
        bodyText: 'Excellent linguistic competence, active participation in oral discussions, and high accuracy in written assignments.',
        awardDate: 'First Term 2025-2026',
        signatory1Name: 'Madame Clara Laurent',
        signatory1Title: 'Lead Teacher',
        signatory2Name: 'Dr. Antoine Borcelle',
        signatory2Title: 'School Director',
        organizationName: 'BORCELLE LANGUAGE SCHOOL'
      }
    }
  ];

  const admitCardTemplatesList = [
    {
      id: 'ignou_term_end_admit',
      title: 'IGNOU Term End Admit Card (Image 1)',
      tag: 'Landscape • Blue Spiral Emblem & Timetable',
      desc: 'National Open University layout with spiral logo, candidate photo, 6-course timetable, and verification QR code',
      orientation: 'landscape',
      activeBg: 'from-sky-800/30 to-blue-900/20 border-sky-400 text-sky-200',
      defaultConfig: {
        title: 'INDIRA GANDHI NATIONAL OPEN UNIVERSITY',
        subtitle: 'ADMIT CARD – Term End Examination',
        presentationLine: 'BACHELOR OF ARTS (BAG)',
        recipientName: 'Rahul Verma',
        eventTitle: 'Term End Examination 2026',
        bodyText: 'Candidate must bring this original Hall Ticket along with valid Student Identity Card to the Examination Centre on all days of examination.',
        awardDate: 'June 2026 Session',
        signatory1Name: 'Registrar (SED)',
        signatory1Title: 'Student Evaluation Division',
        signatory2Name: 'Regional Director',
        signatory2Title: 'Delhi-1 Regional Centre',
        organizationName: 'INDIRA GANDHI NATIONAL OPEN UNIVERSITY'
      }
    },
    {
      id: 'hpu_provisional_hall_ticket',
      title: 'State University Provisional Ticket (Image 2)',
      tag: 'Portrait • HPU Mountain Seal & 4-Paper Grid',
      desc: 'State university header, roll number bar, candidate details, appearing paper datesheet, address box, and controller signature',
      orientation: 'portrait',
      activeBg: 'from-emerald-800/30 to-teal-900/20 border-emerald-400 text-emerald-200',
      defaultConfig: {
        title: 'हिमाचल प्रदेश विश्वविद्यालय • Himachal Pradesh University',
        subtitle: 'Admit Card (Provisional) • Hall Ticket for Entry in Examination Hall',
        presentationLine: 'M.A. (Hindi) • Semester : Third(Fresh)',
        recipientName: 'PRAGTI',
        eventTitle: 'Post Graduate University Examination',
        bodyText: 'Certificate: No Dues / Subject Code Verified / Eligibility Permission granted by the Principal with institutional seal.',
        awardDate: 'NOV(2025-2026)',
        signatory1Name: 'Prof. J.S. Dhiman',
        signatory1Title: 'Controller Of Examinations',
        signatory2Name: 'Dr. S.K. Sharma',
        signatory2Title: 'Principal (With Seal)',
        organizationName: 'Himachal Pradesh University, Summer Hill Shimla'
      }
    },
    {
      id: 'aai_southern_e_admit_card',
      title: 'AAI Aviation E-Admit Card (Image 3)',
      tag: 'Portrait • Barcode, Shift Timings & Declaration',
      desc: 'Airports Authority of India official E-Admit Card with top 1D barcode, reporting & gate closing slots, center details, and candidate declaration box',
      orientation: 'portrait',
      activeBg: 'from-blue-800/30 to-slate-900/20 border-blue-400 text-blue-200',
      defaultConfig: {
        title: 'भारतीय विमानपत्तन प्राधिकरण / AIRPORTS AUTHORITY OF INDIA',
        subtitle: '[SCHEDULE – \'A\' MINI RATNA - CATEGORY-1 PUBLIC SECTOR ENTERPRISE] • REGIONAL HEADQUARTERS',
        presentationLine: 'E - ADMIT CARD',
        recipientName: 'DILIPKUMAR S',
        eventTitle: 'Junior Assistant (Fire Service) NE-4 Examination',
        bodyText: 'I do hereby declare that all the information furnished above are true to the best of my knowledge and I am the same candidate appearing in the exam whose photograph & sign appear above.',
        awardDate: '15th November 2026, Tuesday (12:30 PM - 2:30 PM)',
        signatory1Name: 'J. Edward Raj',
        signatory1Title: 'Examination Authority',
        signatory2Name: 'Senior Superintendent',
        signatory2Title: 'Invigilator Signature',
        organizationName: 'AIRPORTS AUTHORITY OF INDIA'
      }
    },
    {
      id: 'cbse_jee_main_hall_ticket',
      title: 'CBSE JEE (Main) National Pass (Image 4)',
      tag: 'Portrait • National Testing & 17 Candidate Rules',
      desc: 'Central Board / National Testing standard layout with large roll number banner, exam center box, candidate address, and comprehensive instructions',
      orientation: 'portrait',
      activeBg: 'from-slate-800/30 to-blue-950/20 border-sky-400 text-sky-200',
      defaultConfig: {
        title: 'CENTRAL BOARD OF SECONDARY EDUCATION, DELHI',
        subtitle: 'ADMIT CARD FOR JOINT ENTRANCE EXAMINATION JEE(MAIN)',
        presentationLine: 'JEE(Main) Paper - 1 (B.E./B.Tech.) Only',
        recipientName: 'SHAILENDRA KUMAR',
        eventTitle: 'Joint Entrance Examination (Main)',
        bodyText: 'Candidates must carry this admit card, black ball-point pen, and valid photo identification. Electronic devices and study notes are strictly prohibited.',
        awardDate: '10/04/2026 • Timings: 0930-1230 Hours (IST)',
        signatory1Name: 'Dr. S.K. Maheshwari',
        signatory1Title: 'Executive Director (JEE)',
        signatory2Name: 'Centre Superintendent',
        signatory2Title: 'Examination Center Head',
        organizationName: 'CENTRAL BOARD OF SECONDARY EDUCATION'
      }
    },
    {
      id: 'modern_cryptographic_qr_admit',
      title: 'Modern Cryptographic QR Hall Ticket Pass',
      tag: 'Landscape • High-Tech Security QR & Barcode',
      desc: 'High-resolution cryptographic verification QR pass with dynamic timetable, barcode strip, seat allocation tag, and anti-tamper security tokens',
      orientation: 'landscape',
      activeBg: 'from-teal-800/30 to-cyan-900/20 border-teal-400 text-teal-200',
      defaultConfig: {
        title: 'NATIONAL TESTING & EXAMINATION COUNCIL',
        subtitle: 'CRYPTOGRAPHIC ADMIT CARD & HALL TICKET',
        presentationLine: 'SECURE DIGITAL EXAMINATION PASS',
        recipientName: '',
        eventTitle: 'National Scholastic Assessment Standard',
        bodyText: 'Secure digital verification pass. Tampering or reproducing unauthorized copies is a punishable statutory offense. Verified via centralized database.',
        awardDate: 'Academic Session 2025-2026',
        signatory1Name: 'Chief Controller',
        signatory1Title: 'National Examination Board',
        signatory2Name: 'Dr. Rebecca Sterling',
        signatory2Title: 'Centre Superintendent',
        organizationName: 'NATIONAL TESTING COUNCIL'
      }
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

  // 9. Central Board Bilingual Emblem (for CBSE Migration Design)
  const CentralBoardSeal = ({ size = 80 }) => (
    <div className="relative inline-flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <circle cx="50" cy="50" r="46" fill="#1e3a8a" stroke="#d97706" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="41" fill="#ffffff" stroke="#1e3a8a" strokeWidth="1" />
        <circle cx="50" cy="50" r="35" fill="#f8fafc" stroke="#d97706" strokeWidth="1.2" strokeDasharray="3 1.5" />
        {/* Central Radiant Sun / Torch / Knowledge Book */}
        <path d="M 38,55 L 50,46 L 62,55 L 50,51 Z" fill="#1e3a8a" />
        <path d="M 42,62 Q 50,56 58,62 L 58,60 Q 50,54 42,60 Z" fill="#d97706" />
        {/* Radiating Rays */}
        <g stroke="#d97706" strokeWidth="1.2">
          {[220, 240, 260, 280, 300, 320].map(deg => (
            <line key={deg} x1="50" y1="36" x2="50" y2="44" transform={`rotate(${deg} 50 50)`} />
          ))}
        </g>
        {/* Micro Emblem Text */}
        <text x="50" y="32" textAnchor="middle" className="text-[5px] font-black fill-blue-950 uppercase tracking-tighter font-sans">
          केन्द्रीय माध्यमिक शिक्षा बोर्ड
        </text>
        <text x="50" y="72" textAnchor="middle" className="text-[4.5px] font-black fill-blue-900 uppercase tracking-tighter font-sans">
          असतो मा सद्गमय
        </text>
        <text x="50" y="78" textAnchor="middle" className="text-[4px] font-bold fill-amber-700 uppercase tracking-widest font-sans">
          भारत &bull; INDIA
        </text>
      </svg>
    </div>
  );

  // 10. University of Delhi Purple Seal (for DU Migration Design)
  const DelhiUniversitySeal = ({ size = 80 }) => (
    <div className="relative inline-flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <circle cx="50" cy="50" r="46" fill="#701a75" stroke="#fde047" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="41" fill="#fdf4ff" stroke="#701a75" strokeWidth="1.2" />
        <circle cx="50" cy="50" r="34" fill="#a21caf" stroke="#fde047" strokeWidth="1" strokeDasharray="3 1" />
        {/* Royal Elephant Crest & Lotus */}
        <g fill="#fef08a" transform="translate(32, 34) scale(0.36)">
          <path d="M 20,40 Q 10,20 30,10 Q 60,5 75,25 Q 90,30 95,50 Q 80,60 70,55 L 70,75 L 55,75 L 55,60 L 40,60 L 40,75 L 25,75 Z" />
          <circle cx="78" cy="28" r="4" fill="#701a75" />
        </g>
        <text x="50" y="27" textAnchor="middle" className="text-[4.5px] font-black fill-purple-950 uppercase tracking-wider font-sans">
          UNIVERSITY OF DELHI
        </text>
        <text x="50" y="72" textAnchor="middle" className="text-[4.5px] font-bold fill-white uppercase tracking-wider font-sans">
          निष्ठा धृतिः सत्यम्
        </text>
      </svg>
    </div>
  );

  // 11. State Technical University Emblem (for PTU Migration Design)
  const PunjabTechUnivSeal = ({ size = 80 }) => (
    <div className="relative inline-flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <circle cx="50" cy="50" r="46" fill="#dc2626" stroke="#fbbf24" strokeWidth="2" />
        <circle cx="50" cy="50" r="41" fill="#1e3a8a" stroke="#ffffff" strokeWidth="1" />
        <circle cx="50" cy="50" r="34" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.5" />
        {/* Gear Cog & Sunburst */}
        <circle cx="50" cy="48" r="18" fill="#fef08a" stroke="#b45309" strokeWidth="1.5" />
        <circle cx="50" cy="48" r="10" fill="#dc2626" />
        <g stroke="#dc2626" strokeWidth="1.5">
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <line key={deg} x1="50" y1="26" x2="50" y2="32" transform={`rotate(${deg} 50 48)`} />
          ))}
        </g>
        <text x="50" y="78" textAnchor="middle" className="text-[4.5px] font-black fill-white uppercase tracking-wider font-sans">
          KAPURTHALA
        </text>
      </svg>
    </div>
  );

  // 12. Salford High Sky-Blue Graduation Cap & Book Logo (for Report Card Image 1)
  const SalfordGraduationBookLogo = ({ size = 76 }) => (
    <div className="relative inline-flex items-center justify-center select-none shrink-0" style={{ width: size, height: size * 0.75 }}>
      <svg viewBox="0 0 100 75" fill="none" className="w-full h-full">
        {/* Open book green & blue wings */}
        <path d="M50 60 C35 55, 18 52, 6 62 C18 45, 36 48, 50 54 Z" fill="#48bb78" />
        <path d="M50 60 C65 55, 82 52, 94 62 C82 45, 64 48, 50 54 Z" fill="#2b6cb0" />
        <path d="M50 54 C35 48, 20 45, 12 50 C24 38, 38 41, 50 46 Z" fill="#319795" />
        <path d="M50 54 C65 48, 80 45, 88 50 C76 38, 62 41, 50 46 Z" fill="#3182ce" />
        {/* Graduation cap */}
        <path d="M50 10 L84 25 L50 40 L16 25 Z" fill="#2b6cb0" />
        <path d="M30 32 L30 46 C30 52, 70 52, 70 46 L70 32 C64 36, 36 36, 30 32 Z" fill="#1e4e8c" />
        {/* Tassel */}
        <path d="M16 25 L16 42" stroke="#2b6cb0" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="16" cy="43" r="2.5" fill="#2b6cb0" />
      </svg>
    </div>
  );

  // 13. Laurel Wreath Logo (for Report Card Image 3)
  const LaurelWreathLogo = ({ size = 68, color = "#881337" }) => (
    <div className="relative inline-flex items-center justify-center select-none shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        {/* Left wreath branch */}
        <path d="M50 90 C30 85, 14 65, 14 45 C14 30, 22 18, 32 10 C28 20, 28 35, 38 48 C42 42, 38 28, 42 20 C42 32, 48 40, 48 48 C42 55, 30 65, 35 78 C40 70, 48 65, 50 60" fill={color} />
        {/* Right wreath branch */}
        <path d="M50 90 C70 85, 86 65, 86 45 C86 30, 78 18, 68 10 C72 20, 72 35, 62 48 C58 42, 62 28, 58 20 C58 32, 52 40, 52 48 C58 55, 70 65, 65 78 C60 70, 52 65, 50 60" fill={color} />
        <text x="50" y="55" fill={color} fontSize="14" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="1">LOGO</text>
      </svg>
    </div>
  );

  // 14. Borcelle Shield Crest (for Report Card Image 5)
  const BorcelleShieldCrest = ({ size = 44 }) => (
    <div className="relative inline-flex items-center justify-center select-none shrink-0" style={{ width: size, height: size * 1.15 }}>
      <svg viewBox="0 0 100 115" fill="none" className="w-full h-full">
        <path d="M50 5 L90 22 C90 65, 75 95, 50 110 C25 95, 10 65, 10 22 Z" fill="#ffffff" stroke="#581c87" strokeWidth="6" />
        <path d="M50 12 L84 27 C84 62, 70 88, 50 102 C30 88, 16 62, 16 27 Z" fill="#581c87" />
        <text x="50" y="65" fill="#ffffff" fontSize="28" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">BLS</text>
      </svg>
    </div>
  );

  // 15. IGNOU Blue Spiral Logo (for Admit Card Image 1)
  const IgnouSpiralLogo = ({ size = 64 }) => (
    <div className="relative inline-flex items-center justify-center select-none shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="46" stroke="#0284c7" strokeWidth="6" fill="none" />
        <path d="M 50 14 C 70 14 86 30 86 50 C 86 70 70 86 50 86 C 30 86 14 70 14 50" stroke="#0284c7" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 50 26 C 63 26 74 37 74 50 C 74 63 63 74 50 74 C 37 74 26 63 26 50 C 26 37 37 26 50 26" stroke="#0284c7" strokeWidth="5" fill="none" />
        <path d="M 50 36 C 58 36 64 42 64 50 C 64 58 58 64 50 64 C 42 64 36 58 36 50" stroke="#0284c7" strokeWidth="5" fill="none" />
        <circle cx="50" cy="50" r="5" fill="#0284c7" />
      </svg>
    </div>
  );

  // 16. HPU Shimla Seal (for Admit Card Image 2)
  const HpuShimlaSeal = ({ size = 60 }) => (
    <div className="relative inline-flex items-center justify-center select-none shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        <circle cx="50" cy="50" r="46" fill="#15803d" stroke="#f59e0b" strokeWidth="3" />
        <circle cx="50" cy="50" r="39" fill="#ffffff" stroke="#15803d" strokeWidth="1" />
        {/* Mountain peaks */}
        <path d="M 20 65 L 40 40 L 60 65 Z" fill="#bbf7d0" stroke="#15803d" strokeWidth="1.5" />
        <path d="M 45 65 L 65 35 L 85 65 Z" fill="#86efac" stroke="#15803d" strokeWidth="1.5" />
        <circle cx="50" cy="30" r="8" fill="#f59e0b" />
        <text x="50" y="80" fill="#15803d" fontSize="6.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">H.P.U. SHIMLA</text>
      </svg>
    </div>
  );

  // 17. Airports Authority of India Aviation Logo (for Admit Card Image 3)
  const AaiAviationLogo = ({ size = 64 }) => (
    <div className="relative inline-flex items-center justify-center select-none shrink-0" style={{ width: size, height: size * 0.7 }}>
      <svg viewBox="0 0 120 80" fill="none" className="w-full h-full">
        <circle cx="60" cy="18" r="8" fill="#1d4ed8" />
        <path d="M 60 28 L 30 70 L 45 70 L 60 45 L 75 70 L 90 70 Z" fill="#1d4ed8" />
        <path d="M 15 52 L 105 52 L 60 42 Z" fill="#2563eb" opacity="0.9" />
        <line x1="10" y1="58" x2="110" y2="58" stroke="#1d4ed8" strokeWidth="2.5" />
      </svg>
    </div>
  );

  // 18. St. Francis Xavier's Crest Emblem (for Reference 3 Traditional TC)
  const StFrancisCrestLogo = ({ size = 68 }) => (
    <div className="relative inline-flex items-center justify-center select-none shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm">
        {/* Golden Ornate Laurel Ring */}
        <circle cx="50" cy="50" r="46" fill="#fef9c3" stroke="#b45309" strokeWidth="2" />
        <circle cx="50" cy="50" r="41" fill="#ffffff" stroke="#15803d" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="36" fill="#fef08a" stroke="#b45309" strokeWidth="1" strokeDasharray="2 1" />
        {/* Shield with Quad Split */}
        <path d="M 32 30 L 68 30 L 68 55 Q 68 70 50 78 Q 32 70 32 55 Z" fill="#b91c1c" stroke="#b45309" strokeWidth="1.5" />
        <path d="M 50 30 L 68 30 L 68 55 Q 68 70 50 78 Z" fill="#15803d" />
        {/* Gold Cross & Open Book */}
        <line x1="50" y1="34" x2="50" y2="70" stroke="#fef08a" strokeWidth="2" />
        <line x1="38" y1="46" x2="62" y2="46" stroke="#fef08a" strokeWidth="2" />
        <text x="50" y="88" fill="#1e3a8a" fontSize="5.5" fontWeight="900" textAnchor="middle" fontFamily="serif" letterSpacing="0.5">
          ST. FRANCIS
        </text>
      </svg>
    </div>
  );

  // 19. Delhi Public School Laurel Crest (for Reference 1 Character Certificate)
  const DpsBirgunjCrestLogo = ({ size = 68 }) => (
    <div className="relative inline-flex items-center justify-center select-none shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm">
        {/* Laurel Wreath */}
        <path d="M 50 92 C 28 85, 14 65, 14 42 C 14 26, 24 14, 34 8 C 30 18, 30 32, 40 44 C 44 38, 40 26, 44 18 C 44 28, 48 36, 48 44 C 42 50, 32 60, 36 72" fill="#15803d" />
        <path d="M 50 92 C 72 85, 86 65, 86 42 C 86 26, 76 14, 66 8 C 70 18, 70 32, 60 44 C 56 38, 60 26, 56 18 C 56 28, 52 36, 52 44 C 58 50, 68 60, 64 72" fill="#15803d" />
        {/* Central Shield with Knowledge Torch */}
        <path d="M 34 26 L 66 26 L 66 52 Q 66 68 50 76 Q 34 68 34 52 Z" fill="#ffffff" stroke="#15803d" strokeWidth="2" />
        {/* Torch flame */}
        <path d="M 50 32 Q 44 42 50 48 Q 56 42 50 32 Z" fill="#dc2626" />
        <path d="M 50 36 Q 46 42 50 46 Q 54 42 50 36 Z" fill="#f59e0b" />
        <rect x="46" y="48" width="8" height="12" fill="#15803d" rx="1" />
        {/* Ribbon Motto */}
        <path d="M 22 84 Q 50 92 78 84 L 74 94 Q 50 86 26 94 Z" fill="#15803d" />
        <text x="50" y="90" fill="#ffffff" fontSize="4.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          SERVICE BEFORE SELF
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
          <div className="flex items-center gap-2">
            {schoolInfo.customLogoUrl ? (
              <img src={schoolInfo.customLogoUrl} alt="Logo" className="w-12 h-12 object-contain rounded-lg border border-slate-300" />
            ) : (
              <GoldenSchoolSeal size={48} />
            )}
            <div>
              <div>UDISE Code: <span className="font-mono">{schoolInfo.udiseNo}</span></div>
              <div>School Code: <span className="font-mono">{schoolInfo.schoolCode}</span></div>
            </div>
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

  // =========================================================================
  // TEMPLATE 4: Traditional Heritage School Leaving Certificate (St. Francis 23-Point - Reference 3)
  // =========================================================================
  const renderTraditionalHeritageTC = (st) => {
    const regNo = getDocRegNo(st, 'tc');
    const isFeeCleared = st.fee_status === 'Paid' || (st.feeDues || 0) === 0;
    const dobWords = dateToWords(st.dob);
    const certRecipient = certConfig.recipientName || st.student_name || 'PRIYA VISHWAKARMA';
    const certTitle = certConfig.title || 'TRANSFER CERTIFICATE';
    const studentClass = customClassSection || st.class_batch || 'VIII';

    return (
      <div className="bg-[#f7f2e4] p-6 sm:p-9 rounded-2xl border-4 border-double border-stone-800 text-slate-900 space-y-4 shadow-xl relative overflow-hidden font-serif max-w-4xl mx-auto">
        {/* Top Header Grid with School Logo on Left & Affiliation on Right */}
        <div className="flex items-start justify-between border-b-2 border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            {schoolInfo.customLogoUrl ? (
              <img src={schoolInfo.customLogoUrl} alt="School Logo" className="w-16 h-16 object-contain rounded-xl border border-stone-400 bg-white p-1 shadow-sm" />
            ) : (
              <StFrancisCrestLogo size={66} />
            )}
            <div className="space-y-0.5">
              <h2 className="text-xl sm:text-2xl font-black text-stone-950 uppercase tracking-tight font-serif leading-none">
                {schoolInfo.schoolName || "St Francis Xavier's School"}
              </h2>
              <p className="text-[11px] font-sans text-stone-700 font-semibold">
                {schoolInfo.address || 'Tadiya Chakbihi, Sona Talab, Varanasi - 221007'}
              </p>
              <div className="text-[10px] font-sans font-bold text-stone-600 uppercase tracking-wide">
                Affiliated to C.B.S.E., New Delhi &bull; Code: {schoolInfo.schoolCode}
              </div>
            </div>
          </div>

          <div className="text-right text-xs font-mono font-bold text-stone-800">
            <div className="bg-stone-900 text-white px-3 py-1 rounded text-[10px] uppercase tracking-wider">
              AFF: {schoolInfo.affiliationNo || '2132868'}
            </div>
            <div className="mt-1 text-[10px] text-stone-600">School Code: {schoolInfo.schoolCode || '70142'}</div>
          </div>
        </div>

        {/* Big Underlined Title */}
        <div className="text-center pt-1">
          <h1 className="text-xl sm:text-2xl font-black text-stone-950 tracking-wider uppercase underline underline-offset-4 decoration-stone-900 font-serif">
            {certTitle}
          </h1>
        </div>

        {/* Sl. No & Admission No bar */}
        <div className="flex justify-between items-center text-xs font-serif font-bold text-stone-800 border-b border-stone-400 pb-1 px-1">
          <div>
            Sl. No: <span className="font-mono underline text-sm font-black text-stone-950">{regNo}</span>
          </div>
          <div>
            Admission No. <span className="font-mono underline text-sm font-black text-stone-950">{st.id || '2289'}</span>
          </div>
        </div>

        {/* 23 Numbered CBSE Standard Statutory Lines (Exact match to Reference 3) */}
        <div className="space-y-1.5 text-[11px] leading-tight text-stone-900 divide-y divide-stone-300/70 font-sans">
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">1. Name of Student :</span>
            <strong className="w-1/2 text-right uppercase font-serif text-xs font-black text-stone-950 border-b border-dotted border-stone-700 pb-0.5">{certRecipient}</strong>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">2. Father's / Guardian's Name :</span>
            <span className="w-1/2 text-right uppercase font-bold text-stone-950 border-b border-dotted border-stone-700 pb-0.5">{st.father_name}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">3. Mother's Name :</span>
            <span className="w-1/2 text-right uppercase font-bold text-stone-950 border-b border-dotted border-stone-700 pb-0.5">{st.mother_name}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">4. Nationality :</span>
            <span className="w-1/2 text-right italic font-semibold border-b border-dotted border-stone-700 pb-0.5">{st.nationality || 'Indian'}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-2/3 text-stone-800">5. Whether the candidate belongs to Schedule Caste or Schedule Tribe :</span>
            <span className="w-1/3 text-right font-bold border-b border-dotted border-stone-700 pb-0.5">{st.caste_category || 'NO'}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">6. Date of first admission in the School with class :</span>
            <span className="w-1/2 text-right font-semibold border-b border-dotted border-stone-700 pb-0.5">{st.admission_date}, {st.admission_class || 'Class 6'}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">7. Date of birth (in Christian Era) according to Admission Register :</span>
            <span className="w-1/2 text-right font-bold border-b border-dotted border-stone-700 pb-0.5">{st.dob} ({dobWords})</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">8. Class in which the student last studied :</span>
            <span className="w-1/2 text-right font-black text-stone-950 uppercase border-b border-dotted border-stone-700 pb-0.5">{studentClass}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">9. School/Board Annual examination last taken with result :</span>
            <span className="w-1/2 text-right font-bold text-emerald-900 border-b border-dotted border-stone-700 pb-0.5">{schoolInfo.schoolName}, {examResult}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">10. Whether failed, if so once/twice in the same class :</span>
            <span className="w-1/2 text-right font-semibold border-b border-dotted border-stone-700 pb-0.5">NA (Passed First Attempt)</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/3 text-stone-800">11. Subjects Studied :</span>
            <span className="w-2/3 text-right font-bold text-[10.5px] border-b border-dotted border-stone-700 pb-0.5">{subjectsStudied}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">12. Whether qualified for promotion to the higher class, if so, to which class :</span>
            <span className="w-1/2 text-right font-bold text-stone-950 border-b border-dotted border-stone-700 pb-0.5">{promotedTo}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">13. Month upto which the (student has paid) school dues paid :</span>
            <span className={`w-1/2 text-right font-bold border-b border-dotted border-stone-700 pb-0.5 ${isFeeCleared ? 'text-emerald-900' : 'text-rose-700'}`}>
              {isFeeCleared ? '31 March 2026 (Fully Cleared)' : 'Fee Dues Pending ₹35,000'}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">14. Any fee concession availed of; if so, the nature of such concession :</span>
            <span className="w-1/2 text-right font-semibold border-b border-dotted border-stone-700 pb-0.5">NO</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">15. Total No. of Working days :</span>
            <span className="w-1/2 text-right font-mono font-bold border-b border-dotted border-stone-700 pb-0.5">{totalWorkingDays} Days</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">16. Total No. of working days present :</span>
            <span className="w-1/2 text-right font-mono font-bold border-b border-dotted border-stone-700 pb-0.5">{totalDaysPresent} Days</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">17. Whether NCC Cadet / Boy Scout / Girl Guide (details may be given) :</span>
            <span className="w-1/2 text-right border-b border-dotted border-stone-700 pb-0.5">NA</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">18. Games played or extra curricular activities (mention achievement) :</span>
            <span className="w-1/2 text-right italic font-semibold border-b border-dotted border-stone-700 pb-0.5">Active participation in School Athletics &amp; Art</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">19. General Conduct :</span>
            <span className="w-1/2 text-right font-black uppercase text-teal-900 border-b border-dotted border-stone-700 pb-0.5">{conduct}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">20. Date of application for certificate :</span>
            <span className="w-1/2 text-right font-mono border-b border-dotted border-stone-700 pb-0.5">{issueDate}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">21. Date of issue of certificate :</span>
            <span className="w-1/2 text-right font-mono font-bold border-b border-dotted border-stone-700 pb-0.5">{issueDate}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">22. Reasons for leaving the school :</span>
            <span className="w-1/2 text-right font-black uppercase text-stone-950 border-b border-dotted border-stone-700 pb-0.5">{reasonForLeaving}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="w-1/2 text-stone-800">23. Any other remarks :</span>
            <span className="w-1/2 text-right border-b border-dotted border-stone-700 pb-0.5">{certConfig.bodyText || 'He/She bears an exemplary moral character.'}</span>
          </div>
        </div>

        {/* Triple Signatures matching Reference 3 */}
        <div className="pt-8 border-t-2 border-stone-800 grid grid-cols-3 gap-4 items-end text-center text-xs">
          <div className="space-y-1">
            <div className="border-b border-stone-600 pb-1 font-sans text-[11px] text-stone-600">Class Incharge</div>
            <div className="font-bold text-[10.5px] uppercase text-stone-900">Signature of Class Teacher</div>
          </div>
          <div className="space-y-1">
            <div className="border-b border-stone-600 pb-1 font-sans text-[11px] text-stone-600">Office Superintendent</div>
            <div className="font-bold text-[10.5px] uppercase text-stone-900">Checked by</div>
          </div>
          <div className="space-y-1">
            <div className="w-36 mx-auto border-b-2 border-stone-900 pb-1 font-serif italic text-amber-950 font-bold text-sm">
              {schoolInfo.principalName}
            </div>
            <div className="font-black text-[10.5px] uppercase text-stone-950">
              Principal (With Seal)
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // TEMPLATE 5: DPS Character Certificate (Reference 1 - Delhi Public School Birgunj)
  // =========================================================================
  const renderVintageCrimsonTC = (st) => {
    const regNo = getDocRegNo(st, 'tc');
    const certRecipient = certConfig.recipientName || st.student_name || 'RASHI AGRAWAL';
    const certTitle = certConfig.title || 'Character Certificate';
    const startYear = st.admission_date ? st.admission_date.split('-')[0] : '2013';
    const endYear = academicSession ? academicSession.split('-')[1]?.trim() || '2023' : '2023';

    return (
      <div className="bg-white p-7 sm:p-10 rounded-2xl border-2 border-emerald-800 text-slate-900 space-y-5 shadow-2xl relative overflow-hidden font-serif max-w-4xl mx-auto">
        {/* Top Header Row with School Crest on Left & CG Education on Right */}
        <div className="flex items-start justify-between border-b-2 border-emerald-900 pb-4">
          <div className="flex items-center gap-3">
            {schoolInfo.customLogoUrl ? (
              <img src={schoolInfo.customLogoUrl} alt="Logo" className="w-16 h-16 object-contain rounded-xl border border-emerald-200" />
            ) : (
              <DpsBirgunjCrestLogo size={68} />
            )}
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-emerald-900 uppercase font-serif leading-none">
                {schoolInfo.schoolName || 'Delhi Public School, Birgunj'}
              </h2>
              <p className="text-[11px] font-sans text-slate-600 font-semibold mt-1">
                {schoolInfo.address || 'Chainpur-3, Parwanipur, Bara, Nepal'}
              </p>
              <p className="text-[10px] font-sans text-slate-500">
                Phone: {schoolInfo.phone || '+977-051 411067, 411069'} &bull; E-mail: {schoolInfo.email || 'principal.dps@cgeducation.com.np'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-black text-slate-950 font-sans tracking-wider">
              CG <span className="text-emerald-700">EDUCATION</span>
            </div>
            <div className="text-[9px] font-mono text-slate-500">www.cgeducation.com.np</div>
            <div className="text-[9px] font-mono font-bold text-emerald-800 mt-1">AFF: {schoolInfo.affiliationNo}</div>
          </div>
        </div>

        {/* Reference Numbers Bar */}
        <div className="grid grid-cols-12 text-xs font-serif font-bold text-slate-800 border-b border-slate-200 pb-2">
          <div className="col-span-4">
            Serial No. : <span className="font-mono text-sm font-black text-emerald-900 underline">{regNo}</span>
          </div>
          <div className="col-span-5 text-center">
            Registration No. : <span className="font-mono text-[11px] underline">6/2/23/90089/0023</span>
          </div>
          <div className="col-span-3 text-right">
            Symbol No. : <span className="font-mono text-[11px] underline">27604273</span>
          </div>
        </div>

        {/* Central Circular Stamp Seal & Title with Flourish */}
        <div className="text-center space-y-1 relative py-2">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-indigo-700 text-indigo-800 flex items-center justify-center mx-auto text-[7px] font-black uppercase text-center p-1 leading-none shadow-xs rotate-[-8deg] bg-indigo-50/40">
            DELHI PUBLIC SCHOOL • BIRGUNJ • NEPAL
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-wide font-serif pt-1 italic" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            {certTitle}
          </h1>

          {/* Calligraphic Flourish Underline */}
          <div className="flex items-center justify-center gap-1 text-red-700">
            <span className="h-[1.5px] w-20 bg-red-600"></span>
            <span className="text-base leading-none">❧ ❦ ☙</span>
            <span className="h-[1.5px] w-20 bg-red-600"></span>
          </div>
        </div>

        {/* Main Certificate Prose Lines with Dotted Underlines (Exact Reference 1 format) */}
        <div className="space-y-4 text-xs sm:text-[13px] leading-loose text-slate-900 font-serif max-w-3xl mx-auto text-justify">
          <p>
            This is to certify that Mr./Ms. <strong className="font-bold underline text-slate-950 uppercase text-sm px-2">{certRecipient}</strong>
            son / daughter of Mr. <strong className="font-bold underline text-slate-950 uppercase px-2">{st.father_name}</strong> and
            Mrs. <strong className="font-bold underline text-slate-950 uppercase px-2">{st.mother_name}</strong> has been a bonafide student of
            this school from 20<strong className="underline px-1">{startYear.slice(-2)}</strong> to 20<strong className="underline px-1">{endYear.slice(-2)}</strong>.
          </p>

          <p>
            He/She has passed the <strong className="font-bold underline text-slate-950 px-2">{examResult || 'AISSCE, CBSE BOARD'}</strong> Examination held in the
            year 20<strong className="underline px-1">{endYear.slice(-2)}</strong>. His/Her conduct during the tenure of schooling has been <strong className="underline text-emerald-900 font-bold px-1">{conduct || 'good'}</strong>. He/She bears a
            good moral character.
          </p>

          <p>
            His/her date of birth according to our school register is <strong className="font-mono font-bold underline text-slate-950 px-2">{st.dob}</strong>.
          </p>

          <p className="italic text-slate-700 pt-1">
            We wish him/her success in all his/her future endeavors.
          </p>
        </div>

        {/* Date of Issue & Green Principal Signature + Stamp */}
        <div className="pt-8 border-t border-slate-300 flex items-end justify-between px-4">
          <div className="text-xs font-serif font-bold text-slate-800">
            Date of Issue : <span className="font-mono underline font-black">{issueDate || '23-05-2023'}</span>
          </div>

          <div className="text-center space-y-1">
            <HandWrittenSignature name="R. K. Sharma" color="#047857" />
            <div className="px-3 py-1 bg-emerald-50 border border-emerald-300 rounded text-center">
              <div className="font-black text-[10px] text-emerald-950 uppercase tracking-wider">
                PRINCIPAL
              </div>
              <div className="font-bold text-[9px] text-emerald-800 uppercase">
                {schoolInfo.schoolName || 'DELHI PUBLIC SCHOOL'}
              </div>
            </div>
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
      <div className="bg-amber-50/30 p-8 sm:p-10 rounded-2xl border-8 border-amber-600/90 text-slate-900 space-y-5 shadow-xl relative overflow-hidden font-serif max-w-4xl mx-auto">
        <div className="text-center space-y-2 border-b-2 border-amber-600/60 pb-4">
          <div className="flex justify-center mb-1">
            {schoolInfo.customLogoUrl ? (
              <img src={schoolInfo.customLogoUrl} alt="Logo" className="w-14 h-14 object-contain rounded-full border border-amber-400" />
            ) : (
              <GoldenSchoolSeal size={68} />
            )}
          </div>
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

  // =========================================================================
  // TEMPLATE 7: Modern Platinum & Cobalt (Parent Application & Clearance - Reference 2)
  // =========================================================================
  const renderModernPlatinumTC = (st) => {
    const regNo = getDocRegNo(st, 'tc');
    const isFeeCleared = st.fee_status === 'Paid' || (st.feeDues || 0) === 0;
    const certRecipient = certConfig.recipientName || st.student_name || 'Student Name';
    const certTitle = certConfig.title || 'TRANSFER CERTIFICATE APPLICATION BY PARENTS';
    const studentClass = customClassSection || st.class_batch || 'First Year (Pre-Medical)';

    return (
      <div className="bg-white p-8 sm:p-12 rounded-3xl border-2 border-blue-200 text-slate-900 space-y-6 shadow-2xl relative overflow-hidden font-sans max-w-3xl mx-auto">
        {/* Top-Left & Top-Right Cyan/Cobalt Geometry (Exact match to Reference 2) */}
        <div className="absolute top-0 left-0 w-32 h-20 pointer-events-none">
          <svg viewBox="0 0 120 80" className="w-full h-full">
            <polygon points="0,0 120,0 0,80" fill="#38bdf8" />
            <polygon points="0,0 60,0 0,60" fill="#2563eb" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-32 h-20 pointer-events-none">
          <svg viewBox="0 0 120 80" className="w-full h-full">
            <polygon points="0,0 120,0 120,80" fill="#38bdf8" />
            <polygon points="60,0 120,0 120,60" fill="#2563eb" />
          </svg>
        </div>

        {/* Bottom-Left & Bottom-Right Cyan/Cobalt Geometry */}
        <div className="absolute bottom-0 left-0 w-32 h-20 pointer-events-none">
          <svg viewBox="0 0 120 80" className="w-full h-full">
            <polygon points="0,80 120,80 0,0" fill="#38bdf8" />
            <polygon points="0,80 60,80 0,20" fill="#2563eb" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-20 pointer-events-none">
          <svg viewBox="0 0 120 80" className="w-full h-full">
            <polygon points="0,80 120,80 120,0" fill="#38bdf8" />
            <polygon points="60,80 120,80 120,20" fill="#2563eb" />
          </svg>
        </div>

        {/* Center Top Bold Title & School Logo */}
        <div className="text-center pt-2 space-y-3 relative z-10">
          <div className="flex justify-center">
            {schoolInfo.customLogoUrl ? (
              <img src={schoolInfo.customLogoUrl} alt="Logo" className="w-16 h-16 object-contain rounded-2xl border-2 border-blue-400 bg-white p-1 shadow-md" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-black text-2xl shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          <h1 className="text-lg sm:text-xl font-black text-[#2563eb] uppercase tracking-wider font-sans">
            {certTitle}
          </h1>
          <div className="text-[10px] font-mono text-slate-500 font-bold">
            DOC REF: {regNo} &bull; CODE: {schoolInfo.schoolCode}
          </div>
        </div>

        {/* Recipient Letter Block */}
        <div className="space-y-1 text-xs text-slate-800 font-medium relative z-10 leading-relaxed pt-2">
          <div>To,</div>
          <div className="font-bold text-slate-950">The Principal,</div>
          <div>{schoolInfo.schoolName || '[College Name]'}</div>
          <div>{schoolInfo.address || '[Address]'}</div>
          <div>Date: <span className="font-mono font-bold">{issueDate || '[Date]'}</span></div>
        </div>

        {/* Subject Line */}
        <div className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-2 relative z-10">
          Subject: <span className="underline">{certConfig.presentationLine || 'Application for Transfer Certificate'}</span>
        </div>

        {/* Body Paragraphs (Exact match to Reference 2) */}
        <div className="space-y-4 text-xs sm:text-[13px] text-slate-800 leading-relaxed relative z-10 text-justify">
          <div className="font-bold text-slate-950">Respected Sir/Madam,</div>

          <p className="indent-4">
            {certConfig.bodyText || `I am the father of ${certRecipient}, a ${studentClass} student (Roll No: #${st.roll_no}) in your esteemed institution. Due to our family relocation (${reasonForLeaving || 'outstation transfer'}), we are unable to continue his/her studies at your institution.`}
          </p>

          <p className="indent-4">
            Therefore, I request you to kindly issue his/her Transfer Certificate so that he/she may secure admission to a new college/school. We have cleared all dues ({isFeeCleared ? 'Fully Paid / No Dues Outstanding' : 'Dues Pending'}) and completed the required scholastic formalities.
          </p>

          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs font-semibold text-blue-950 grid grid-cols-2 gap-2">
            <div>Result: <strong className="text-emerald-800">{examResult}</strong></div>
            <div>Promotion: <strong>{promotedTo}</strong></div>
            <div>General Conduct: <strong className="text-blue-900">{conduct}</strong></div>
            <div>Attendance: <strong>{totalDaysPresent} of {totalWorkingDays} Days</strong></div>
          </div>

          <p>
            We shall be thankful for your kind cooperation.
          </p>
        </div>

        {/* Bottom Signatures (Parent on Right / Principal Authorization on Left) */}
        <div className="pt-8 flex justify-between items-end text-xs relative z-10">
          <div>
            <div className="text-[10px] font-mono text-slate-400 mb-1">Office Seal &amp; Attestation</div>
            <div className="font-serif italic font-bold text-slate-900 text-sm">{schoolInfo.principalName}</div>
            <div className="font-black text-[10px] text-blue-900 uppercase">{schoolInfo.principalTitle}</div>
          </div>

          <div className="text-right space-y-1">
            <div className="font-bold text-slate-800">Yours faithfully,</div>
            <div className="font-black text-slate-950 uppercase text-xs">{certConfig.signatory2Name || st.father_name || '[Parents Name]'}</div>
            <div className="text-[11px] text-slate-600">Class: {studentClass}</div>
            <div className="text-[11px] font-mono text-slate-600">Roll No: #{st.roll_no}</div>
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

  // =========================================================================
  // MIGRATION TEMPLATE 1: CBSE Statutory Bilingual (Central Board Standard - Image 1)
  // =========================================================================
  const renderCbseBilingualMigration = (st) => {
    const regNo = getDocRegNo(st, 'migration');
    const certRecipient = certConfig.recipientName || st.student_name || 'STUDENT NAME';
    const certTitle = certConfig.title || 'केन्द्रीय माध्यमिक शिक्षा बोर्ड';
    const certSubtitle = certConfig.subtitle || 'CENTRAL BOARD OF SECONDARY EDUCATION';
    const certPresentation = certConfig.presentationLine || 'प्रवास प्रमाण पत्र / MIGRATION CERTIFICATE';
    const certExam = certConfig.eventTitle || examName || 'ALL INDIA SR. SCHOOL CERTIFICATE EXAMINATION 2026';
    const certDate = certConfig.awardDate || issueDate || '15 June 2026';
    const certSig1Name = certConfig.signatory1Name || 'Dr. Sanyam Bhardwaj';
    const certSig1Title = certConfig.signatory1Title || 'Controller of Examinations';
    const certSig2Name = certConfig.signatory2Name || 'Anurag Tripathi, IRPS';
    const certSig2Title = certConfig.signatory2Title || 'Secretary';

    return (
      <div className="bg-[#fcfbf7] p-6 sm:p-10 rounded-2xl border-4 border-slate-400 text-slate-900 space-y-5 shadow-2xl relative overflow-hidden font-serif max-w-4xl mx-auto">
        {/* Security Microtext Watermark Background Pattern */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none select-none overflow-hidden flex flex-col justify-around leading-none text-[8px] font-sans font-bold tracking-widest text-slate-900">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="whitespace-nowrap -rotate-6">
              CENTRAL BOARD OF SECONDARY EDUCATION &bull; केन्द्रीय माध्यमिक शिक्षा बोर्ड &bull; MIGRATION CERTIFICATE &bull; OFFICIAL RECORD &bull; CENTRAL BOARD OF SECONDARY EDUCATION
            </div>
          ))}
        </div>

        {/* Top Header with CBSE Emblem */}
        <div className="text-center relative z-10 space-y-1">
          <div className="flex justify-center mb-1">
            <CentralBoardSeal size={76} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide font-sans">
            {certTitle}
          </h2>
          <h1 className="text-base sm:text-lg font-black text-slate-800 tracking-wider font-sans uppercase">
            {certSubtitle}
          </h1>
          
          <div className="flex justify-between items-center text-[11px] font-sans font-bold text-slate-700 pt-2 border-b border-slate-300 pb-1">
            <span>क्रम सं. प्रवास / S.No. Mig/2026/<strong className="text-blue-900 font-mono">{regNo}</strong></span>
            <span>बोर्ड कोड / Board Code: <strong className="font-mono text-slate-900">{schoolInfo.schoolCode}</strong></span>
          </div>

          <div className="py-2">
            <div className="text-sm font-bold text-slate-800 font-sans">प्रवास प्रमाण पत्र</div>
            <div className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-widest font-sans underline underline-offset-4 decoration-2">
              {certPresentation.includes('/') ? certPresentation.split('/')[1]?.trim() : certPresentation}
            </div>
          </div>
        </div>

        {/* Candidate & Academic Prose */}
        <div className="relative z-10 space-y-4 text-xs sm:text-[13px] leading-relaxed text-slate-800 font-sans">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="font-bold text-slate-700">प्रमाणित किया जाता है कि / This is to certify that:</span>
            <span className="font-black text-slate-950 text-sm sm:text-base border-b-2 border-blue-900 pb-0.5 px-2 bg-blue-50/60 uppercase">
              {certRecipient}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-slate-600 font-medium">अनुक्रमांक / Roll No.:</span>
              <strong className="font-mono text-slate-900 font-bold border-b border-slate-400 pb-0.5 px-1">{st.roll_no}</strong>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-slate-600 font-medium">पंजीकरण सं / Reg. ID:</span>
              <strong className="font-mono text-slate-900 font-bold border-b border-slate-400 pb-0.5 px-1">{st.id}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-slate-600 font-medium">आत्मज / आत्मजा श्रीमती / Son / Daughter of Smt.:</span>
              <strong className="text-slate-900 border-b border-slate-400 pb-0.5 px-1">{st.mother_name}</strong>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-slate-600 font-medium">एवं श्री / and Shri:</span>
              <strong className="text-slate-900 border-b border-slate-400 pb-0.5 px-1">{st.father_name}</strong>
            </div>
          </div>

          <div className="pt-1">
            <span className="text-slate-600 font-medium">Student of: </span>
            <strong className="text-slate-900 font-bold uppercase">{schoolInfo.schoolName}</strong>, an institution affiliated with the Board has been registered in the <strong className="text-blue-950 underline">{certExam}</strong> of the Board.
          </div>

          {/* Bilingual Statutory Clause */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-300 text-justify text-xs leading-relaxed space-y-2">
            <p className="font-medium text-slate-900">
              उसके द्वारा किसी भी मान्यता प्राप्त महाविद्यालय/संस्था में प्रवेश लेने अथवा विधि द्वारा मान्य किसी भी विश्वविद्यालय या अन्य बोर्ड की परीक्षा देने में बोर्ड को कोई आपत्ति नहीं है।
            </p>
            <p className="italic text-slate-700 font-serif">
              This Board has no objection in his/her joining any recognised College/Institute or taking examination of any University or Board established by law.
            </p>
          </div>
        </div>

        {/* Signatures & Location */}
        <div className="pt-6 border-t border-slate-300 flex items-end justify-between relative z-10 px-2 sm:px-6">
          <div className="space-y-1 text-xs font-sans">
            <div className="font-bold text-slate-800">दिल्ली / Delhi</div>
            <div className="text-[11px] text-slate-600 font-mono">दिनांक / Date: <strong>{certDate}</strong></div>
          </div>

          <div className="text-center space-y-1">
            <HandWrittenSignature name={certSig2Name} color="#1e3a8a" />
            <div className="w-36 border-b border-slate-700 pb-0.5 font-bold text-slate-900 text-xs">{certSig2Name}</div>
            <div className="text-[10px] text-slate-600 font-sans">{certSig2Title}</div>
          </div>

          <div className="text-center space-y-1">
            <HandWrittenSignature name={certSig1Name} color="#1e3a8a" />
            <div className="w-40 border-b-2 border-slate-900 pb-0.5 font-bold text-slate-900 text-xs">{certSig1Name}</div>
            <div className="text-[10px] font-black text-slate-900 uppercase font-sans">{certSig1Title}</div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // MIGRATION TEMPLATE 2: State Technical University (PTU Standard - Image 2)
  // =========================================================================
  const renderPtuStateTechnicalMigration = (st) => {
    const regNo = getDocRegNo(st, 'migration');
    const certRecipient = certConfig.recipientName || st.student_name || 'Ratnesh Kumar';
    const certTitle = certConfig.title || 'ਆਈ.ਕੇ.ਗੁਜਰਾਲ ਪੰਜਾਬ ਟੈਕਨੀਕਲ ਯੂਨੀਵਰਸਿਟੀ';
    const certSubtitle = certConfig.subtitle || 'I.K. Gujral Punjab Technical University';
    const certPresentation = certConfig.presentationLine || 'Migration Certificate';
    const certExam = certConfig.eventTitle || 'Bachelor of Technology (Computer Science & AI)';
    const certDate = certConfig.awardDate || issueDate || '22/06/2026';
    const certSig1Name = certConfig.signatory1Name || 'Prof. Harpreet Singh';
    const certSig1Title = certConfig.signatory1Title || 'Officer Incharge';
    const certSig2Name = certConfig.signatory2Name || 'Dr. Ranbir Sharma';
    const certSig2Title = certConfig.signatory2Title || 'Controller of Examinations';

    return (
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-300 text-slate-900 space-y-6 shadow-xl relative overflow-hidden font-serif max-w-4xl mx-auto">
        {/* Top University Header with Gurmukhi Punjabi Script & English */}
        <div className="text-center border-b border-slate-200 pb-4">
          <h3 className="text-lg sm:text-xl font-serif text-slate-800 tracking-wide font-normal">
            {certTitle}
          </h3>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-950 tracking-wider">
            {certSubtitle}
          </h2>
          <div className="text-[11px] text-slate-500 font-sans italic">Formerly Punjab Technical University</div>
        </div>

        {/* Top Row: EDP Serial No, University Emblem, and 2D QR Code */}
        <div className="flex items-center justify-between px-2 sm:px-6">
          <div className="text-left font-sans">
            <div className="text-[10px] font-bold text-slate-600 uppercase">EDP S. No.:</div>
            <div className="text-sm font-black font-mono text-slate-900">{regNo.replace(/\D/g, '') || '9255219'}</div>
          </div>

          <div className="text-center">
            <PunjabTechUnivSeal size={72} />
          </div>

          <div className="text-right">
            <div className="w-16 h-16 p-1 bg-white border border-slate-300 rounded flex items-center justify-center ml-auto">
              <QrCode className="w-14 h-14 text-slate-900" />
            </div>
            <div className="text-[8px] font-mono text-slate-400 mt-0.5">2D SECURITY QR</div>
          </div>
        </div>

        {/* Main Certificate Calligraphic Heading */}
        <div className="text-center py-1">
          <h1 className="text-3xl sm:text-4xl font-serif italic text-slate-900 font-normal tracking-wide" style={{ fontFamily: 'Playfair Display, "Brush Script MT", Georgia, serif' }}>
            {certPresentation}
          </h1>
        </div>

        {/* Body Paragraph */}
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-justify px-2 sm:px-6 font-sans">
          <p>
            This is to certify that Mr./Ms. <strong className="text-slate-950 font-bold underline px-1 text-[15px]">{certRecipient}</strong> son/daughter of <strong className="text-slate-950 font-bold px-1">{st.father_name}</strong> has passed <strong className="text-slate-950 font-bold">{st.class_batch}</strong> in the discipline of <strong className="text-slate-950 font-bold">{certExam}</strong> in the examination held in <strong className="text-slate-950 font-bold">{academicSession}</strong> under University Registration No. <strong className="font-mono font-bold text-slate-950">{st.id}</strong> as a student of <strong className="text-slate-950 font-bold">{schoolInfo.schoolName}</strong>.
          </p>
          <p className="pt-2 font-medium text-slate-800">
            This University has 'No Objection', whatsoever, to his/her migration/admission to pursue further studies.
          </p>
        </div>

        {/* 4-Tier Signatory Column Row */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 px-2 sm:px-4 text-center font-sans text-xs">
          <div className="space-y-1">
            <div className="font-bold text-slate-900 text-[11px]">E.D.P. CELL</div>
            <div className="text-[10px] text-slate-500">Prepared by</div>
          </div>

          <div className="space-y-1">
            <HandWrittenSignature name="Verifier" color="#475569" />
            <div className="text-[10px] text-slate-500">Checked by</div>
          </div>

          <div className="space-y-1">
            <HandWrittenSignature name={certSig1Name} color="#1e293b" />
            <strong className="block text-[11px] font-bold text-slate-900">{certSig1Name}</strong>
            <div className="text-[10px] text-slate-500">{certSig1Title}</div>
          </div>

          <div className="space-y-1">
            <HandWrittenSignature name={certSig2Name} color="#1e293b" />
            <strong className="block text-[11px] font-bold text-slate-900">{certSig2Name}</strong>
            <div className="text-[10px] text-slate-500 font-bold">{certSig2Title}</div>
          </div>
        </div>

        {/* Footer Notes & Security Instructions */}
        <div className="pt-3 border-t border-slate-100 text-[9px] text-slate-500 font-sans space-y-1 px-2">
          <div><strong>Date of issue:</strong> {certDate}</div>
          <div>Note: 1. This document is issued through the student portal and verified against central registry records.</div>
          <div>2. This document can be verified online by scanning 2D bar-code (top right corner) using internet verification.</div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // MIGRATION TEMPLATE 3: Central University (University of Delhi Standard - Image 3)
  // =========================================================================
  const renderDelhiUnivCentralMigration = (st) => {
    const regNo = getDocRegNo(st, 'migration');
    const certRecipient = certConfig.recipientName || st.student_name || 'SUNDER GOUTAM';
    const certTitle = certConfig.title || 'UNIVERSITY OF DELHI';
    const certSubtitle = certConfig.subtitle || 'दिल्ली विश्वविद्यालय • DELHI - 110007';
    const certPresentation = certConfig.presentationLine || 'Migration Certificate';
    const certDate = certConfig.awardDate || issueDate || '19/Oct/2026';
    const certSig1Name = certConfig.signatory1Name || 'Prof. Ajay Kumar Arora';
    const certSig1Title = certConfig.signatory1Title || 'Authorized Signatory';

    return (
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-300 text-slate-900 space-y-6 shadow-xl relative overflow-hidden font-serif max-w-4xl mx-auto">
        {/* Top Header */}
        <div className="text-center border-b border-slate-200 pb-3">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-wider font-sans uppercase">
            {certTitle}
          </h1>
          <h2 className="text-sm sm:text-base font-bold text-slate-700 tracking-wide font-sans">
            {certSubtitle}
          </h2>
        </div>

        {/* Certificate No & Date Metadata Bar */}
        <div className="flex justify-between items-center text-xs font-sans text-slate-700 border-b border-slate-100 pb-2">
          <div>Certificate No.: <strong className="text-slate-900 font-mono">MIC-{regNo}</strong></div>
          <div>Date: <strong className="text-slate-900">{certDate}</strong></div>
        </div>

        <div className="text-xs font-sans text-slate-700">
          Enrollment No.: <strong className="text-slate-900 font-mono">{st.id}</strong>
        </div>

        {/* University Crest & QR Verification Box */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-1">
          <div>
            <DelhiUniversitySeal size={74} />
          </div>

          <div>
            <div className="w-16 h-16 p-1 bg-white border border-slate-300 rounded flex items-center justify-center">
              <QrCode className="w-14 h-14 text-slate-900" />
            </div>
            <div className="text-[8px] font-mono text-slate-400 text-center mt-0.5">VERIFIED</div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center py-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans tracking-wide">
            {certPresentation}
          </h2>
        </div>

        {/* Official Statutory Proclamation */}
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-justify px-2 sm:px-8 font-sans">
          <p>
            Sh./Smt./Km. <strong className="text-slate-950 uppercase font-black underline">{certRecipient}</strong> Son/Daughter of Sh./Smt./Ms. <strong className="text-slate-900">{st.father_name}</strong> student of <strong className="text-slate-900 font-bold">{schoolInfo.schoolName}</strong> University Enrolment No <strong className="font-mono text-slate-900 font-bold">{st.id}</strong> is informed that this University has no objection to his/her joining any other University.
          </p>
          <p>
            The University is not aware of anything against his/her character or conduct which should be bar to his/her admission to another University.
          </p>
        </div>

        {/* Authorized Signatory */}
        <div className="pt-8 flex justify-end px-4 sm:px-12 font-sans">
          <div className="text-center space-y-1 min-w-[160px]">
            <HandWrittenSignature name={certSig1Name} color="#4a044e" />
            <div className="w-36 border-b border-slate-900 pb-0.5 mx-auto text-xs font-bold text-slate-900">{certSig1Name}</div>
            <div className="text-[10px] text-slate-600 font-bold uppercase">{certSig1Title}</div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 font-sans px-2">
          <strong>Note:</strong> This is an official digital migration certificate and is valid for all statutory purposes.
        </div>
      </div>
    );
  };

  // =========================================================================
  // MIGRATION TEMPLATE 4: National Statutory Character & Conduct Clear-Pass
  // =========================================================================
  const renderStatutoryBoardCharacterMigration = (st) => {
    const regNo = getDocRegNo(st, 'migration');
    const certRecipient = certConfig.recipientName || st.student_name || 'Candidate Name';
    const certTitle = certConfig.title || 'STATUTORY BOARD OF SECONDARY EDUCATION';
    const certSubtitle = certConfig.subtitle || 'OFFICIAL CHARACTER & MIGRATION CLEARANCE';
    const certPresentation = certConfig.presentationLine || 'To Whomsoever It May Concern';
    const certBody = certConfig.bodyText || 'This is to certify that the student has completed their prescribed curriculum with exemplary moral conduct and discipline. This institution has NO OBJECTION to their migration or admission to any institution in India or abroad.';
    const certDate = certConfig.awardDate || issueDate || '15 June 2026';
    const certSig1Name = certConfig.signatory1Name || 'Dr. Marcus Vance';
    const certSig1Title = certConfig.signatory1Title || 'Principal / Head of Institution';
    const certSig2Name = certConfig.signatory2Name || 'Office Registrar';
    const certSig2Title = certConfig.signatory2Title || 'Director of Admissions';

    return (
      <div className="bg-white p-6 sm:p-8 rounded-2xl border-4 border-double border-emerald-500 text-slate-800 space-y-5 shadow-xl text-xs relative overflow-hidden font-sans max-w-4xl mx-auto">
        <div className="text-center space-y-1 border-b-2 border-emerald-900 pb-4">
          <div className="text-[10px] font-bold tracking-widest text-emerald-800 uppercase">
            {certTitle}
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase font-serif">
            {schoolInfo.schoolName}
          </h2>
          <div className="inline-block mt-2 px-4 py-1 rounded-full bg-emerald-900 text-white font-bold text-xs uppercase tracking-wider">
            {certSubtitle}
          </div>
        </div>

        <div className="flex justify-between items-center text-xs font-mono border-b pb-2 text-slate-600">
          <span>Migration No: <strong className="text-emerald-900">{regNo}</strong></span>
          <span>Session: <strong className="text-slate-900">{academicSession}</strong></span>
          <span>Issue Date: <strong className="text-slate-900">{certDate}</strong></span>
        </div>

        <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 text-justify text-xs leading-relaxed space-y-3">
          <div className="text-center font-bold text-emerald-900 uppercase tracking-wider">{certPresentation}</div>
          <p>
            This is to certify that <strong className="text-slate-900 underline text-sm">{certRecipient}</strong>, 
            Student ID: <strong className="text-slate-900 font-mono">{st.id}</strong>, Roll No: <strong className="text-slate-900 font-mono">{st.roll_no}</strong>, 
            Son / Daughter of <strong className="text-slate-900">{st.father_name}</strong> and <strong className="text-slate-900">{st.mother_name}</strong>, 
            has been a regular student of this institution in <strong className="text-slate-900">{customClassSection || st.class_batch}</strong>.
          </p>
          <p>
            During his/her tenure at {schoolInfo.schoolName}, his/her character and conduct have been <strong className="text-emerald-800 font-bold">{conduct}</strong>.
          </p>
          <p className="font-medium text-slate-900">
            {certBody}
          </p>
        </div>

        <div className="pt-6 border-t border-slate-200 flex items-end justify-between px-4">
          <div className="text-center space-y-1">
            <HandWrittenSignature name={certSig2Name} color="#065f46" />
            <div className="w-36 border-b border-emerald-900 pb-0.5 font-bold text-slate-900 text-xs">{certSig2Name}</div>
            <div className="text-[10px] text-slate-600 uppercase">{certSig2Title}</div>
          </div>

          <div className="text-center">
            <GoldenSchoolSeal size={70} />
          </div>

          <div className="text-center space-y-1">
            <HandWrittenSignature name={certSig1Name} color="#065f46" />
            <div className="w-36 border-b-2 border-emerald-900 pb-0.5 font-serif italic text-emerald-900 font-bold text-sm">
              {certSig1Name}
            </div>
            <div className="font-black text-[10px] text-slate-900 uppercase">{certSig1Title}</div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // MIGRATION TEMPLATE 5: Modern Cryptographic Digital QR Migration Pass
  // =========================================================================
  const renderModernCryptographicQrMigration = (st) => {
    const regNo = getDocRegNo(st, 'migration');
    const certRecipient = certConfig.recipientName || st.student_name || 'Candidate Name';
    const certTitle = certConfig.title || 'DEPARTMENT OF SCHOOL EDUCATION';
    const certSubtitle = certConfig.subtitle || 'CRYPTOGRAPHIC MIGRATION & IDENTITY RECORD';
    const certPresentation = certConfig.presentationLine || 'OFFICIAL DIGITAL CLEARANCE PASS';
    const certBody = certConfig.bodyText || 'Verified digital migration record. The student has satisfied all statutory, financial, and disciplinary requirements and is cleared for nationwide academic migration.';
    const certDate = certConfig.awardDate || issueDate || '2026-06-15';
    const certSig1Name = certConfig.signatory1Name || 'Chief Controller';
    const certSig1Title = certConfig.signatory1Title || 'Digital Examination Wing';

    return (
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border-4 border-cyan-500 shadow-2xl relative overflow-hidden font-sans max-w-4xl mx-auto">
        <div className="flex justify-between items-center border-b border-cyan-800 pb-3">
          <div>
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{certTitle}</div>
            <h2 className="font-black text-xl text-white uppercase tracking-wider">{schoolInfo.schoolName}</h2>
            <div className="text-xs text-amber-300 font-bold">{certSubtitle}</div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs">
            NO OBJECTION ISSUED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs font-mono my-3">
          <div>Candidate: <strong className="block text-cyan-300 font-sans text-sm">{certRecipient}</strong></div>
          <div>Scholar ID / Roll: <strong className="block text-white">{st.id} / #{st.roll_no}</strong></div>
          <div>Class / Batch: <strong className="block text-white">{customClassSection || st.class_batch}</strong></div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">{certBody}</p>

        <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center">
              <QrCode className="w-10 h-10 text-slate-900" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-cyan-400">HASH: SHA256:{regNo}</div>
              <div className="text-[9px] text-slate-400">Verified Timestamp: {certDate}</div>
            </div>
          </div>

          <div className="text-right">
            <HandWrittenSignature name={certSig1Name} color="#38bdf8" />
            <div className="font-bold text-white text-xs">{certSig1Name}</div>
            <div className="text-[9px] text-slate-400 uppercase font-mono">{certSig1Title}</div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // REPORT CARD TEMPLATE 1: Salford High Sky-Blue Quarterly (Image 1)
  // =========================================================================
  const renderSalfordSkyblueQuarterlyReport = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'STUDENT NAME';
    const certTitle = certConfig.title || 'REPORT CARD';
    const certSubtitle = certConfig.subtitle || 'Salford High School';
    const studentClass = customClassSection || st.class_batch || 'Class 10 - Section A';
    const certLevel = certConfig.eventTitle || 'High School / Senior Secondary';
    const certBody = certConfig.bodyText || 'Demonstrates consistent academic effort, excellent analytical skills, and exemplary classroom participation throughout all four academic quarters.';

    const subjects = [
      { name: 'English', q1: '92%', q2: '94%', q3: '90%', q4: '95%' },
      { name: 'Economic', q1: '88%', q2: '85%', q3: '90%', q4: '92%' },
      { name: 'History', q1: '85%', q2: '89%', q3: '91%', q4: '93%' },
      { name: 'Biology', q1: '94%', q2: '91%', q3: '95%', q4: '96%' },
      { name: 'Math', q1: '98%', q2: '96%', q3: '99%', q4: '98%' },
      { name: 'Science', q1: '92%', q2: '90%', q3: '94%', q4: '93%' },
      { name: 'Social Studies', q1: '89%', q2: '92%', q3: '90%', q4: '91%' },
      { name: 'Art', q1: '95%', q2: '97%', q3: '96%', q4: '98%' },
      { name: 'Physical Education', q1: '96%', q2: '98%', q3: '97%', q4: '99%' },
      { name: 'Chemistry', q1: '91%', q2: '93%', q3: '90%', q4: '94%' }
    ];

    return (
      <div className="bg-white border border-sky-200 rounded-none shadow-2xl overflow-hidden max-w-3xl mx-auto font-sans text-slate-800 flex flex-col min-h-[950px]">
        {/* Sky-Blue Top Header Banner */}
        <div className="bg-[#dcf0fa] px-8 py-6 border-b border-sky-200">
          <div className="flex items-center gap-6">
            <SalfordGraduationBookLogo size={76} />
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#1f6390] tracking-tight uppercase leading-none">
                {certTitle}
              </h1>
              <p className="text-sm sm:text-base font-semibold text-[#3b7a9e] mt-1.5">
                {certSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Student Meta Details */}
        <div className="p-8 pb-4 space-y-3">
          <div className="flex items-center text-sm font-bold text-[#1f6390]">
            <span className="w-24 shrink-0 text-slate-800">Student</span>
            <span className="mr-2">:</span>
            <div className="flex-1 border-b border-slate-300 pb-0.5 font-extrabold text-slate-900 uppercase">
              {certRecipient}
            </div>
          </div>
          <div className="flex items-center text-sm font-bold text-[#1f6390]">
            <span className="w-24 shrink-0 text-slate-800">Level</span>
            <span className="mr-2">:</span>
            <div className="flex-1 border-b border-slate-300 pb-0.5 font-medium text-slate-700">
              {certLevel}
            </div>
          </div>
          <div className="flex items-center text-sm font-bold text-[#1f6390]">
            <span className="w-24 shrink-0 text-slate-800">Class</span>
            <span className="mr-2">:</span>
            <div className="flex-1 border-b border-slate-300 pb-0.5 font-bold text-slate-900">
              {studentClass}
            </div>
          </div>
        </div>

        {/* Quarterly Marks Table */}
        <div className="px-8 pb-6 flex-1">
          <div className="border border-[#5b97bc] overflow-hidden">
            <table className="w-full text-center text-xs">
              <thead className="bg-[#5b97bc] text-white font-bold text-xs uppercase">
                <tr>
                  <th className="py-3 px-4 text-left w-1/3 border-r border-[#4782a7]">Subject</th>
                  <th className="py-3 px-2 border-r border-[#4782a7]">1st Quarter</th>
                  <th className="py-3 px-2 border-r border-[#4782a7]">2nd Quarter</th>
                  <th className="py-3 px-2 border-r border-[#4782a7]">3rd Quarter</th>
                  <th className="py-3 px-2">4th Quarter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#7cb5d6] text-xs font-semibold text-slate-800">
                {subjects.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-sky-50/40">
                    <td className="py-2.5 px-4 text-left font-bold text-slate-900 border-r border-[#7cb5d6]">{sub.name}</td>
                    <td className="py-2.5 px-2 border-r border-[#7cb5d6]">{sub.q1}</td>
                    <td className="py-2.5 px-2 border-r border-[#7cb5d6]">{sub.q2}</td>
                    <td className="py-2.5 px-2 border-r border-[#7cb5d6]">{sub.q3}</td>
                    <td className="py-2.5 px-2 font-bold text-[#1f6390]">{sub.q4}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grading Scale Banner & Teacher Comment Box */}
        <div className="bg-[#dcf0fa] p-8 border-t border-sky-200 space-y-4">
          <div className="text-xs font-black text-[#1f6390] tracking-wider flex flex-wrap items-center justify-between">
            <span className="uppercase">GRADING SCALE :</span>
            <span>A = 90% -100%</span>
            <span>B = 80% - 89%</span>
            <span>C = 60% - 79%</span>
            <span>D = 0% - 59%</span>
          </div>

          <div className="bg-white border border-sky-300 p-4 min-h-[100px] text-xs">
            <div className="font-bold text-[#1f6390] mb-1">Comment :</div>
            <p className="text-slate-700 leading-relaxed font-medium">{certBody}</p>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // REPORT CARD TEMPLATE 2: Homeschool Holistic Learning Habits (Image 2)
  // =========================================================================
  const renderHomeschoolHolisticHabitsReport = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'STUDENT NAME';
    const certTitle = certConfig.title || 'HOMESCHOOL REPORT CARD';
    const certSubtitle = certConfig.subtitle || 'Individual Learning & Habit Assessment';
    const studentClass = customClassSection || st.class_batch || 'Class 10 - Section A';
    const certBody = certConfig.bodyText || 'Demonstrates exceptional focus, self-directed research initiative, and strong analytical problem-solving skills throughout the academic term.';
    const certDate = certConfig.awardDate || academicSession || '15 June 2026';
    const certSig1Name = certConfig.signatory1Name || 'Elena Rostova';
    const certSig2Name = certConfig.signatory2Name || 'Rajesh Patel';

    const subjects = [
      { name: 'Language Arts', grade: 'A', comment: 'Strong comprehension and written expression' },
      { name: 'Mathematics', grade: 'A-', comment: 'Confident with multi-step problem solving' },
      { name: 'Science', grade: 'A', comment: 'Curious and engaged in independent research' },
      { name: 'History', grade: 'B+', comment: 'Good understanding with developing analysis' },
      { name: 'Art', grade: 'A', comment: 'Creative, experimental, and highly engaged' },
      { name: 'Physical Education', grade: 'A-', comment: 'Consistent participation and effort' }
    ];

    const habits = [
      { title: 'INDEPENDENCE', desc: 'Completes familiar work with minimal guidance.', stars: 5 },
      { title: 'ORGANIZATION', desc: 'Maintains a consistent learning routine.', stars: 4 },
      { title: 'CURIOSITY', desc: 'Frequently explores topics beyond assigned lessons.', stars: 5 },
      { title: 'PROBLEM SOLVING', desc: 'Approaches unfamiliar tasks thoughtfully.', stars: 4 }
    ];

    return (
      <div className="bg-white border-2 border-slate-900 rounded-none shadow-2xl overflow-hidden max-w-3xl mx-auto font-sans text-slate-900">
        {/* Top Yellow Header Banner */}
        <div className="bg-[#fef9c3] p-6 border-b-2 border-slate-900 text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-wider uppercase">
            {certTitle}
          </h1>
          <div className="flex justify-between items-center text-xs font-bold text-slate-700 mt-2 px-2">
            <span>Student: <strong className="text-slate-950 underline">{certRecipient}</strong></span>
            <span>Class: <strong className="text-slate-950">{studentClass}</strong></span>
            <span>Date: <strong className="text-slate-950 font-mono">{certDate}</strong></span>
          </div>
        </div>

        {/* Academic Subjects Table */}
        <div className="border-b-2 border-slate-900">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-slate-900 font-bold">
              <tr>
                <th className="py-2 px-4 w-1/3 border-r border-slate-900">Subject</th>
                <th className="py-2 px-3 w-20 text-center border-r border-slate-900">Grade</th>
                <th className="py-2 px-4">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 font-medium">
              {subjects.map((sub, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-4 font-bold border-r border-slate-900">{sub.name}</td>
                  <td className="py-2 px-3 font-black text-center border-r border-slate-900">{sub.grade}</td>
                  <td className="py-2 px-4 text-slate-700 text-[11px]">{sub.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Learning Habits Section */}
        <div className="border-b-2 border-slate-900">
          <div className="px-4 py-2 font-black text-xs uppercase tracking-wider border-b border-slate-900">
            LEARNING HABITS
          </div>
          <div className="divide-y divide-slate-300">
            {habits.map((h, idx) => (
              <div key={idx} className="px-4 py-2 flex items-center justify-between text-xs">
                <div>
                  <strong className="block text-[11px] font-black uppercase text-slate-900">{h.title}</strong>
                  <span className="text-[10.5px] text-slate-600">{h.desc}</span>
                </div>
                <div className="flex text-slate-950 text-sm tracking-widest pl-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s}>{s <= h.stars ? '★' : '☆'}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Term Highlights vs Next Term Focus (2 Column Split) */}
        <div className="grid grid-cols-2 border-b-2 border-slate-900">
          {/* Term Highlights */}
          <div className="border-r border-slate-900">
            <div className="bg-[#fef9c3] px-3 py-1.5 font-black text-xs uppercase text-center border-b border-slate-900">
              TERM HIGHLIGHTS
            </div>
            <div className="p-3 text-xs space-y-1 font-semibold text-slate-800">
              <div>&bull; 18 Books Completed</div>
              <div>&bull; 05 Independent Projects</div>
              <div>&bull; 11 Major Assignments</div>
              <div>&bull; 94% On-Time Completion</div>
            </div>
          </div>

          {/* Next Term Focus */}
          <div>
            <div className="bg-[#fef9c3] px-3 py-1.5 font-black text-xs uppercase text-center border-b border-slate-900">
              NEXT TERM FOCUS
            </div>
            <div className="p-3 text-[11px] space-y-1 text-slate-800 font-medium">
              <div><strong>1. BUILD</strong> Advanced writing skills</div>
              <div><strong>2. EXPLORE</strong> Longer independent projects</div>
              <div><strong>3. STRENGTHEN</strong> Multi-step mathematical reasoning</div>
              <div><strong>4. MAINTAIN</strong> Consistent study routines</div>
            </div>
          </div>
        </div>

        {/* Term Assessment */}
        <div className="border-b-2 border-slate-900">
          <div className="bg-[#fef9c3] px-3 py-1.5 font-black text-xs uppercase text-center border-b border-slate-900">
            TERM ASSESSMENT
          </div>
          <div className="p-2.5 flex justify-around text-xs font-bold text-slate-900">
            <span>ACADEMIC PROGRESS &bull; <strong className="text-emerald-800 font-black">Strong</strong></span>
            <span>LEARNING HABITS &bull; <strong className="text-emerald-800 font-black">Excellent</strong></span>
            <span>INDEPENDENCE &bull; <strong className="text-emerald-800 font-black">Excellent</strong></span>
          </div>
        </div>

        {/* Instructor Notes */}
        <div className="border-b-2 border-slate-900">
          <div className="bg-[#fef9c3] px-3 py-1.5 font-black text-xs uppercase text-center border-b border-slate-900">
            INSTRUCTOR NOTES
          </div>
          <div className="p-4 text-xs leading-relaxed text-slate-800 min-h-[90px]">
            {certBody}
          </div>
        </div>

        {/* Signatures Row */}
        <div className="p-6 grid grid-cols-3 gap-6 text-xs text-center font-bold">
          <div>
            <div className="font-serif italic text-slate-800 text-sm mb-1">{certSig1Name}</div>
            <div className="border-t border-dotted border-slate-900 pt-1 text-[11px]">Instructor Signature</div>
          </div>
          <div>
            <div className="font-serif italic text-slate-800 text-sm mb-1">{certSig2Name}</div>
            <div className="border-t border-dotted border-slate-900 pt-1 text-[11px]">Parent Signature</div>
          </div>
          <div>
            <div className="font-mono text-slate-900 text-xs mb-1">{certDate}</div>
            <div className="border-t border-dotted border-slate-900 pt-1 text-[11px]">Date</div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // REPORT CARD TEMPLATE 3: Salford High Maroon / Burgundy Laurel (Image 3)
  // =========================================================================
  const renderSalfordMaroonQuarterlyReport = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'STUDENT NAME';
    const certTitle = certConfig.title || 'REPORT CARD';
    const certSubtitle = certConfig.subtitle || 'SALFORD HIGH SCHOOL';
    const studentClass = customClassSection || st.class_batch || 'Class 10 - Section A';
    const certLevel = certConfig.eventTitle || 'Senior Secondary';
    const certBody = certConfig.bodyText || 'Demonstrates outstanding academic focus, thorough project work, and great participation across all scholastic disciplines.';

    const subjects = [
      { name: 'English', q1: '92%', q2: '94%', q3: '90%', q4: '95%' },
      { name: 'Economic', q1: '88%', q2: '85%', q3: '90%', q4: '92%' },
      { name: 'Biology', q1: '94%', q2: '91%', q3: '95%', q4: '96%' },
      { name: 'History', q1: '85%', q2: '89%', q3: '91%', q4: '93%' },
      { name: 'Math', q1: '98%', q2: '96%', q3: '99%', q4: '98%' },
      { name: 'Science', q1: '92%', q2: '90%', q3: '94%', q4: '93%' },
      { name: 'Social Studies', q1: '89%', q2: '92%', q3: '90%', q4: '91%' },
      { name: 'Art', q1: '95%', q2: '97%', q3: '96%', q4: '98%' },
      { name: 'Physical Education', q1: '96%', q2: '98%', q3: '97%', q4: '99%' },
      { name: 'Chemistry', q1: '91%', q2: '93%', q3: '90%', q4: '94%' }
    ];

    return (
      <div className="bg-white border border-slate-300 rounded-none shadow-2xl overflow-hidden max-w-3xl mx-auto font-sans text-slate-800 relative flex flex-col min-h-[960px]">
        {/* Top-Left Burgundy Swoosh */}
        <div className="absolute top-0 left-0 w-44 h-16 bg-[#881337] [clip-path:polygon(0_0,100%_0,0_100%)] pointer-events-none" />
        
        {/* Bottom-Right Burgundy Swoosh */}
        <div className="absolute bottom-0 right-0 w-44 h-16 bg-[#881337] [clip-path:polygon(100%_100%,100%_0,0_100%)] pointer-events-none" />

        {/* Center Header */}
        <div className="pt-10 pb-6 text-center space-y-2 relative z-10">
          <div className="flex justify-center">
            <LaurelWreathLogo size={68} color="#881337" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#881337] tracking-wider uppercase font-sans">
            {certTitle}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#881337] tracking-widest uppercase">
            {certSubtitle}
          </p>
        </div>

        {/* Student Meta Details */}
        <div className="px-10 pb-4 space-y-3 relative z-10">
          <div className="flex items-center text-sm font-bold text-[#881337]">
            <span className="w-24 shrink-0 text-slate-800">Student</span>
            <span className="mr-2">:</span>
            <div className="flex-1 border-b border-slate-300 pb-0.5 font-extrabold text-slate-900 uppercase">
              {certRecipient}
            </div>
          </div>
          <div className="flex items-center text-sm font-bold text-[#881337]">
            <span className="w-24 shrink-0 text-slate-800">Level</span>
            <span className="mr-2">:</span>
            <div className="flex-1 border-b border-slate-300 pb-0.5 font-medium text-slate-700">
              {certLevel}
            </div>
          </div>
          <div className="flex items-center text-sm font-bold text-[#881337]">
            <span className="w-24 shrink-0 text-slate-800">Class</span>
            <span className="mr-2">:</span>
            <div className="flex-1 border-b border-slate-300 pb-0.5 font-bold text-slate-900">
              {studentClass}
            </div>
          </div>
        </div>

        {/* Quarterly Marks Table */}
        <div className="px-10 pb-6 flex-1 relative z-10">
          <div className="border border-[#881337] overflow-hidden">
            <table className="w-full text-center text-xs">
              <thead className="bg-[#881337] text-white font-bold text-xs uppercase">
                <tr>
                  <th className="py-3 px-4 text-left w-1/3 border-r border-rose-900">Subject</th>
                  <th className="py-3 px-2 border-r border-rose-900">1st Quarter</th>
                  <th className="py-3 px-2 border-r border-rose-900">2nd Quarter</th>
                  <th className="py-3 px-2 border-r border-rose-900">3rd Quarter</th>
                  <th className="py-3 px-2">4th Quarter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-xs font-semibold text-slate-800">
                {subjects.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-rose-50/40">
                    <td className="py-2.5 px-4 text-left font-bold text-slate-900 border-r border-slate-300">{sub.name}</td>
                    <td className="py-2.5 px-2 border-r border-slate-300">{sub.q1}</td>
                    <td className="py-2.5 px-2 border-r border-slate-300">{sub.q2}</td>
                    <td className="py-2.5 px-2 border-r border-slate-300">{sub.q3}</td>
                    <td className="py-2.5 px-2 font-bold text-[#881337]">{sub.q4}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section: Grading Scale Block & Comment Block */}
        <div className="px-10 pb-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch relative z-10">
          {/* Left Burgundy Box: Grading Scale */}
          <div className="md:col-span-4 bg-[#881337] text-white p-4 space-y-2 text-xs flex flex-col justify-center">
            <div className="font-black tracking-wider uppercase border-b border-rose-700/80 pb-1">
              GRADING SCALE :
            </div>
            <div className="space-y-1 font-bold text-[11px] pt-1 text-rose-100">
              <div>A = 90% -100%</div>
              <div>B = 80% - 89%</div>
              <div>C = 60% - 79%</div>
              <div>D = 0% - 59%</div>
            </div>
          </div>

          {/* Right Bordered Box: Comment */}
          <div className="md:col-span-8 border border-slate-400 p-3 min-h-[110px] relative flex flex-col">
            <div className="absolute -top-3 left-3 bg-[#881337] text-white text-[11px] font-bold px-3 py-0.5">
              Comment :
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium pt-2">
              {certBody}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // REPORT CARD TEMPLATE 4: Classic Ivy League Slate & Gold (Image 4)
  // =========================================================================
  const renderClassicIvySlateGoldReport = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'STUDENT NAME';
    const certTitle = certConfig.title || 'REPORT CARD';
    const studentClass = customClassSection || st.class_batch || 'GRADE 10 - A';
    const certTeacher = certConfig.signatory1Name || 'Mrs. Eleanor Vance';
    const certBody = certConfig.bodyText || 'Exhibits exemplary academic diligence, outstanding mastery of critical concepts, and a high degree of intellectual curiosity across all subjects.';

    const subjects = [
      { name: 'ARTS', grade: 'A+ (97)' },
      { name: 'ENGLISH', grade: 'A (93)' },
      { name: 'HISTORY', grade: 'A- (90)' },
      { name: 'MATH', grade: 'A+ (98)' },
      { name: 'MUSIC', grade: 'A (95)' },
      { name: 'SCIENCE', grade: 'A (94)' },
      { name: 'SOCIAL STUDIES', grade: 'A- (91)' },
      { name: 'PHYSICAL EDUCATION', grade: 'A+ (99)' }
    ];

    return (
      <div className="bg-white border border-slate-300 rounded-none shadow-2xl overflow-hidden max-w-3xl mx-auto font-serif text-slate-900">
        {/* Top Solid Navy Header Banner */}
        <div className="bg-[#264653] text-[#dfa251] py-5 text-center">
          <h1 className="text-2xl sm:text-3xl font-black tracking-[0.35em] uppercase font-serif">
            {certTitle.split('').join(' ')}
          </h1>
        </div>

        {/* Student Meta Details in 2-Columns */}
        <div className="p-8 pb-6 grid grid-cols-2 gap-y-4 gap-x-8 text-xs tracking-wider uppercase font-serif">
          <div className="flex justify-between border-b border-slate-300 pb-1">
            <span className="font-bold text-slate-700">NAME</span>
            <strong className="text-slate-950 font-black">{certRecipient}</strong>
          </div>
          <div className="flex justify-between border-b border-slate-300 pb-1">
            <span className="font-bold text-slate-700">GRADE</span>
            <strong className="text-slate-950 font-black">{studentClass}</strong>
          </div>
          <div className="flex justify-between border-b border-slate-300 pb-1">
            <span className="font-bold text-slate-700">TEACHER</span>
            <strong className="text-slate-950 font-black">{certTeacher}</strong>
          </div>
          <div className="flex justify-between border-b border-slate-300 pb-1">
            <span className="font-bold text-slate-700">ATTENDANCE</span>
            <strong className="text-slate-950 font-black">96.8% (182 / 188)</strong>
          </div>
        </div>

        {/* Section 1: SUBJECT & GRADE */}
        <div>
          <div className="bg-[#264653] text-[#dfa251] py-2 px-8 flex justify-between text-xs font-black tracking-[0.25em] uppercase font-serif">
            <span>SUBJECT</span>
            <span>GRADE</span>
          </div>
          <div className="p-8 py-4 divide-y divide-slate-200 text-xs tracking-wider uppercase font-serif">
            {subjects.map((sub, idx) => (
              <div key={idx} className="py-2.5 flex justify-between items-center">
                <span className="font-bold text-slate-800">{sub.name}</span>
                <span className="font-black text-[#264653] text-sm">{sub.grade}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: TEACHER'S COMMENTS AND FEEDBACK */}
        <div>
          <div className="bg-[#264653] text-[#dfa251] py-2 px-8 text-center text-xs font-black tracking-[0.25em] uppercase font-serif">
            TEACHER'S COMMENTS AND FEEDBACK
          </div>
          <div className="p-8 py-6 text-xs font-sans leading-relaxed text-slate-700 min-h-[90px]">
            {certBody}
          </div>
        </div>

        {/* Section 3: GRADING SCALE */}
        <div>
          <div className="bg-[#264653] text-[#dfa251] py-2 px-8 text-center text-xs font-black tracking-[0.25em] uppercase font-serif">
            GRADING SCALE
          </div>
          <div className="p-8 py-6 grid grid-cols-3 gap-6 text-xs text-center font-serif tracking-widest uppercase">
            <div className="space-y-1">
              <div>A &nbsp;&nbsp; 90 - 100</div>
              <div>B &nbsp;&nbsp; 80 - 89</div>
            </div>
            <div className="space-y-1">
              <div>C &nbsp;&nbsp; 70 - 79</div>
              <div>D &nbsp;&nbsp; 60 - 69</div>
            </div>
            <div className="space-y-1 font-bold">
              <div>FAIL</div>
              <div>59 AND BELOW</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // REPORT CARD TEMPLATE 5: Borcelle Modern Lavender Pill Gradebook (Image 5)
  // =========================================================================
  const renderBorcelleLavenderPillReport = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'STUDENT NAME';
    const certTitle = certConfig.title || 'STUDENT REPORT CARD';
    const certSubtitle = certConfig.subtitle || 'BORCELLE LANGUAGE SCHOOL';
    const studentClass = customClassSection || st.class_batch || 'Class 10 - Section A';
    const certTeacher = certConfig.signatory1Name || 'Madame Clara Laurent';
    const certCourse = certConfig.eventTitle || 'Language & Academic Studies';
    const certYear = certConfig.awardDate || academicSession || '2025 - 2026';
    const certBody = certConfig.bodyText || 'Shows exceptional linguistic proficiency, active oral participation, and consistently high marks on coursework and assignments.';

    const pillGrades = [
      { name: 'Reading', grade: '95% (A+)' },
      { name: 'Writing', grade: '92% (A)' },
      { name: 'Listening', grade: '98% (A+)' },
      { name: 'Speaking', grade: '94% (A)' },
      { name: 'Attendance', grade: '98% (185/188)' },
      { name: 'Assignments', grade: '96% (Grade A)' }
    ];

    return (
      <div className="bg-white border border-purple-200 rounded-none shadow-2xl overflow-hidden max-w-3xl mx-auto font-sans text-slate-900 pb-8">
        {/* Purple Top Header Banner */}
        <div className="bg-[#581c87] text-white px-8 py-5 flex items-center justify-between">
          <div className="border-2 border-white px-5 py-1 rounded-full text-xs font-mono font-black tracking-widest uppercase">
            FIRST TERM
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono font-black text-sm tracking-wider uppercase text-right">
              {certSubtitle}
            </span>
            <BorcelleShieldCrest size={44} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-5">
          <h1 className="text-2xl sm:text-3xl font-black text-[#581c87] font-mono tracking-widest uppercase">
            {certTitle}
          </h1>
        </div>

        {/* Student Meta Details Card (Lavender Rounded Container) */}
        <div className="mx-8 bg-[#f3e8ff] p-5 rounded-3xl border border-[#d8b4fe] space-y-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="w-28 font-bold text-[#581c87] shrink-0">Student's name</span>
            <div className="flex-1 bg-white py-2 px-4 rounded-full font-black text-slate-900 uppercase border border-purple-200 shadow-xs">
              {certRecipient}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-28 font-bold text-[#581c87] shrink-0">Teacher's name</span>
            <div className="flex-1 bg-white py-2 px-4 rounded-full font-bold text-slate-800 border border-purple-200 shadow-xs">
              {certTeacher}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3">
              <span className="w-28 font-bold text-[#581c87] shrink-0">Course/Level</span>
              <div className="flex-1 bg-white py-2 px-4 rounded-full font-semibold text-slate-800 border border-purple-200 shadow-xs truncate">
                {certCourse}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-12 font-bold text-[#581c87] shrink-0">Year</span>
              <div className="flex-1 bg-white py-2 px-4 rounded-full font-bold text-slate-800 border border-purple-200 shadow-xs font-mono">
                {certYear}
              </div>
            </div>
          </div>
        </div>

        {/* Section: GRADES */}
        <div className="mx-8 mt-6">
          <div className="text-center -mb-3 relative z-10">
            <span className="border-2 border-[#581c87] bg-white text-[#581c87] px-8 py-1 rounded-full font-mono font-black text-xs uppercase tracking-widest inline-block">
              GRADES
            </span>
          </div>
          <div className="bg-[#f3e8ff] p-6 pt-7 rounded-3xl border border-[#d8b4fe] grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Left Column: Pill Subject Badges */}
            <div className="md:col-span-7 space-y-2 text-xs">
              {pillGrades.map((g, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="font-bold text-[#581c87] w-28">{g.name}</span>
                  <div className="flex-1 bg-white py-1.5 px-4 rounded-full font-black text-[#581c87] text-center border border-purple-200 shadow-xs">
                    {g.grade}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Inset Grading System Card */}
            <div className="md:col-span-5 bg-[#e9d5ff] p-4 rounded-2xl border border-[#c084fc] text-center space-y-2 text-xs font-mono text-[#581c87]">
              <div className="font-black tracking-wider uppercase border-b border-purple-300 pb-1">
                GRADING SYSTEM
              </div>
              <div className="space-y-1 font-bold text-[11px] pt-1">
                <div className="flex justify-between px-4"><span>A</span><span>90 - 100</span></div>
                <div className="flex justify-between px-4"><span>B</span><span>80 - 89</span></div>
                <div className="flex justify-between px-4"><span>C</span><span>70 - 79</span></div>
                <div className="flex justify-between px-4"><span>D</span><span>60 - 69</span></div>
                <div className="flex justify-between px-4"><span>E</span><span>0 - 59</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: COMMENTS */}
        <div className="mx-8 mt-6">
          <div className="text-center -mb-3 relative z-10">
            <span className="border-2 border-[#581c87] bg-white text-[#581c87] px-8 py-1 rounded-full font-mono font-black text-xs uppercase tracking-widest inline-block">
              COMMENTS
            </span>
          </div>
          <div className="bg-[#f3e8ff] p-6 pt-7 rounded-3xl border border-[#d8b4fe]">
            <div className="bg-white p-4 rounded-2xl border border-purple-200 text-xs font-medium text-slate-700 leading-relaxed min-h-[90px] shadow-xs">
              {certBody}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // ADMIT CARD TEMPLATE 1: IGNOU National Open University Term End (Image 1)
  // =========================================================================
  const renderIgnouTermEndAdmit = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'Rahul Verma';
    const certTitle = certConfig.title || 'INDIRA GANDHI NATIONAL OPEN UNIVERSITY';
    const certSubtitle = certConfig.subtitle || 'ADMIT CARD – Term End Examination';
    const studentClass = customClassSection || st.class_batch || 'Class 10 - Section A';
    const certProgram = certConfig.presentationLine || (customClassSection ? `CLASS: ${customClassSection}` : (st.class_batch ? `CLASS: ${st.class_batch}` : 'BACHELOR OF ARTS (BAG)'));
    const certDob = st.dob || '15 Feb 2000';
    const certEnrollment = st.roll_no ? `${st.roll_no}2026` : '2201712401';
    const regNo = getDocRegNo(st, 'admit_card');

    const courses = [
      { code: 'BEVAE-181', date: '10/06/2026', time: 'Morning (10:00 AM)', centre: '0757D - Study Centre, Delhi' },
      { code: 'BHIC-131', date: '14/06/2026', time: 'Morning (10:00 AM)', centre: '0757D - Study Centre, Delhi' },
      { code: 'BPSC-131', date: '18/06/2026', time: 'Morning (10:00 AM)', centre: '0757D - Study Centre, Delhi' },
      { code: 'BHDLA-135', date: '22/06/2026', time: 'Morning (10:00 AM)', centre: '0757D - Study Centre, Delhi' },
      { code: 'BPAG-171', date: '26/06/2026', time: 'Morning (10:00 AM)', centre: '0757D - Study Centre, Delhi' },
      { code: 'BSOC-131', date: '30/06/2026', time: 'Morning (10:00 AM)', centre: '0757D - Study Centre, Delhi' }
    ];

    return (
      <div className="bg-[#fcfbf7] border-2 border-slate-900 rounded-none shadow-2xl overflow-hidden max-w-4xl mx-auto font-sans text-slate-900 p-6 sm:p-8 space-y-5">
        {/* Top Header Row with Spiral Logo */}
        <div className="flex items-center gap-5 border-b-2 border-slate-900 pb-4">
          <IgnouSpiralLogo size={68} />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight leading-tight">
              {certTitle}
            </h1>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 uppercase tracking-wide">
              {certSubtitle}
            </h2>
          </div>
        </div>

        {/* Candidate Meta Info & Photograph */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="md:col-span-8 space-y-1.5 text-xs font-semibold text-slate-800">
            <div className="text-sm">
              <span className="font-bold text-slate-700">Enrollment Number:</span>{' '}
              <strong className="font-mono text-base font-black text-slate-950 tracking-wider underline">{certEnrollment}</strong>
            </div>
            <div className="text-sm">
              <span className="font-bold text-slate-700">Candidate Name:</span>{' '}
              <strong className="font-black text-slate-950 uppercase">{certRecipient}</strong>
            </div>
            <div>
              <span className="font-bold text-slate-700">Programm:</span>{' '}
              <strong className="font-bold text-slate-900 uppercase">{certProgram}</strong>
            </div>
            <div>
              <span className="font-bold text-slate-700">Regional Centre:</span>{' '}
              <span className="font-bold text-slate-900">Delhi-1 (Code: 07)</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">Date of Birth:</span>{' '}
              <span className="font-mono font-bold text-slate-900">{certDob}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">Medium:</span>{' '}
              <span className="font-bold text-slate-900">English</span>
            </div>
          </div>

          <div className="md:col-span-4 flex justify-end">
            <div className="text-center">
              <img
                src={st.photo}
                alt={certRecipient}
                className="w-32 h-38 object-cover border-2 border-slate-900 shadow-md mx-auto"
              />
              <span className="text-[9px] font-mono text-slate-500 font-bold block mt-1">Verified Photo</span>
            </div>
          </div>
        </div>

        {/* Timetable Table & Embedded QR Code */}
        <div className="border border-slate-900 overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 border-b border-slate-900 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-900 w-28">Course Code</th>
                <th className="py-2.5 px-3 border-r border-slate-900 w-28">Exam Date</th>
                <th className="py-2.5 px-3 border-r border-slate-900 w-36">Exam Time</th>
                <th className="py-2.5 px-3">Exam Centre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-xs font-semibold">
              {courses.map((c, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-3 font-mono font-bold border-r border-slate-900">{c.code}</td>
                  <td className="py-2 px-3 font-mono border-r border-slate-900">{c.date}</td>
                  <td className="py-2 px-3 border-r border-slate-900">{c.time}</td>
                  <td className="py-2 px-3 flex items-center justify-between">
                    <span>{c.centre}</span>
                    {idx === courses.length - 1 && (
                      <div className="p-0.5 bg-white border border-slate-900 ml-2">
                        <QrCode className="w-8 h-8 text-slate-900" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Instructions / Footer Notice */}
        <div className="pt-2 text-[10px] text-slate-600 space-y-0.5 border-t border-slate-200">
          <p><strong>Important Note:</strong> {certConfig.bodyText || 'Candidate must bring this original Hall Ticket along with valid Student Identity Card to the Examination Centre on all days of examination.'}</p>
          <div className="flex justify-between font-mono text-slate-500 pt-1">
            <span>DOC-ID: {regNo}</span>
            <span>Issued by SED Central Examination Division</span>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // ADMIT CARD TEMPLATE 2: State University Provisional Ticket (Image 2)
  // =========================================================================
  const renderHpuProvisionalHallTicket = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'PRAGTI';
    const certTitle = certConfig.title || 'हिमाचल प्रदेश विश्वविद्यालय • Himachal Pradesh University';
    const certSubtitle = certConfig.subtitle || 'Admit Card (Provisional) • Hall Ticket for Entry in Examination Hall';
    const certExam = certConfig.presentationLine || 'M.A. (Hindi)';
    const studentClass = customClassSection || st.class_batch || 'Class 10 - Section A';
    const regNo = getDocRegNo(st, 'admit_card');

    const papers = [
      { sno: '1', code: 'MHN301', name: 'Bhartiya Kavya Shastra evam Sahityalochan', date: 'As per Datesheet' },
      { sno: '2', code: 'MHN302', name: 'Anuvaad Vigyaan', date: 'As per Datesheet' },
      { sno: '3', code: 'MHN303', name: 'Chhayavadi Kavya', date: 'As per Datesheet' },
      { sno: '4', code: 'MHN304', name: 'Lok Sahitya : Saidhantik Vivechan (Ek) / Upanyaas (Do)', date: 'As per Datesheet' }
    ];

    return (
      <div className="bg-white border-2 border-slate-900 rounded-none shadow-2xl overflow-hidden max-w-3xl mx-auto font-sans text-slate-900 text-xs">
        {/* Top Note */}
        <div className="border-b border-slate-900 text-center font-bold text-[10px] py-1 bg-slate-50">
          Note: Candidate should possess this Admit card while entering in the examination hall.
        </div>

        {/* 3-Part Header Banner */}
        <div className="grid grid-cols-12 border-b border-slate-900 p-3 items-center">
          <div className="col-span-4 flex items-center gap-2 border-r border-slate-900 pr-2">
            <HpuShimlaSeal size={48} />
            <div className="text-[9px] font-bold leading-tight">
              <span className="block text-emerald-900 font-black">हिमाचल प्रदेश विश्वविद्यालय</span>
              <span>Himachal Pradesh University</span>
            </div>
          </div>
          <div className="col-span-5 text-center px-2">
            <strong className="block font-black text-xs uppercase">Admit Card (Provisional)</strong>
            <span className="text-[10px] text-slate-600 block">Hall Ticket for Entry in Examination Hall</span>
          </div>
          <div className="col-span-3 text-right text-[9px] font-bold text-slate-700 pl-2">
            <div>Himachal Pradesh University</div>
            <div>Summer Hill Shimla 171005</div>
          </div>
        </div>

        {/* Roll Number Bar */}
        <div className="bg-slate-100 border-b border-slate-900 text-center py-1 font-mono font-black text-xs tracking-wider">
          Roll Number : <span className="underline">{st.id || 'D220171240111'}</span>
        </div>

        {/* Candidate Profile Details & Photo Box */}
        <div className="grid grid-cols-12 border-b border-slate-900">
          <div className="col-span-8 p-3 space-y-1.5 border-r border-slate-900 text-[11px] leading-tight">
            <div><strong>Name Of Examination (Class) :</strong> {certExam} ({studentClass})</div>
            <div><strong>Semester :</strong> Third(Fresh) &nbsp;&nbsp;&bull;&nbsp;&nbsp; <strong>Session :</strong> {academicSession}</div>
            <div><strong>Month/Year :</strong> November 2026</div>
            <div><strong>Exam Centre Name :</strong> Private Shimla (Dr. Ambedkar Bhawan, H.P. University)</div>
            <div><strong>Candidate's Name :</strong> <strong className="font-black text-slate-950 uppercase">{certRecipient}</strong></div>
            <div className="flex justify-between">
              <span><strong>Date Of Birth :</strong> {st.dob}</span>
              <span><strong>Capacity :</strong> PRIVATE / REGULAR</span>
            </div>
            <div><strong>College Name :</strong> {schoolInfo.schoolName}</div>
            <div><strong>Father's Name :</strong> {st.father_name}</div>
            <div><strong>Mother's Name :</strong> {st.mother_name}</div>
            <div><strong>Any Discrepancy :</strong> N/A</div>
          </div>

          <div className="col-span-4 p-3 flex flex-col items-center justify-between text-center bg-slate-50/50">
            <img src={st.photo} alt={certRecipient} className="w-24 h-28 object-cover border border-slate-900 shadow-xs" />
            <div className="w-full mt-2 border-t border-dotted border-slate-900 pt-1">
              <HandWrittenSignature name={certRecipient} color="#000000" />
              <div className="text-[9px] font-bold text-slate-600">Candidate's Signature</div>
            </div>
          </div>
        </div>

        {/* Appearing Paper Details Table */}
        <div className="border-b border-slate-900">
          <div className="bg-slate-100 py-1 px-3 font-bold text-[10.5px] border-b border-slate-900 text-center">
            Appearing Paper Details (with paper name and paper code)
          </div>
          <table className="w-full text-left text-[11px]">
            <thead className="border-b border-slate-900 bg-sky-50/50 text-[10px] uppercase font-bold">
              <tr>
                <th className="py-1 px-2 border-r border-slate-900 w-10 text-center">S.No.</th>
                <th className="py-1 px-3 border-r border-slate-900 w-24">papercode</th>
                <th className="py-1 px-3 border-r border-slate-900">papername</th>
                <th className="py-1 px-3 w-48 text-right">*Exam Date as Given in Datesheet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {papers.map((p) => (
                <tr key={p.sno}>
                  <td className="py-1 px-2 text-center font-bold border-r border-slate-900">{p.sno}</td>
                  <td className="py-1 px-3 font-mono font-bold border-r border-slate-900">{p.code}</td>
                  <td className="py-1 px-3 border-r border-slate-900">{p.name}</td>
                  <td className="py-1 px-3 text-right text-slate-600">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Contact Details */}
        <div className="border-b border-slate-900">
          <div className="bg-slate-100 py-0.5 px-3 font-bold text-[10px] border-b border-slate-900 text-center">
            Contact Details
          </div>
          <div className="grid grid-cols-2 text-[10px] divide-x divide-slate-900">
            <div className="p-2">
              <strong>Present Details :</strong>
              <div className="text-slate-700">{st.residential_address}</div>
            </div>
            <div className="p-2">
              <strong>Permanent Address :</strong>
              <div className="text-slate-700">{st.residential_address}</div>
            </div>
          </div>
        </div>

        {/* Signatures & Certification */}
        <div className="p-3 grid grid-cols-3 gap-4 border-b border-slate-900 text-center items-end">
          <div>
            <div className="border-b border-slate-900 pb-1 mb-1 h-6"></div>
            <div className="font-bold text-[10px]">Candidate's Signature</div>
          </div>
          <div>
            <HandWrittenSignature name="Controller" color="#1e3a8a" />
            <div className="font-bold text-[10px]">Controller Of Examinations</div>
            <div className="text-[8px] text-slate-500">Facsimile</div>
          </div>
          <div>
            <div className="font-serif italic font-bold text-xs">{schoolInfo.principalName}</div>
            <div className="font-bold text-[10px]">Principal</div>
            <div className="text-[8px] text-slate-500">(With Seal)</div>
          </div>
        </div>

        {/* Certificate Line */}
        <div className="p-2 text-[10px] text-slate-700 font-semibold bg-slate-50 flex justify-between">
          <span><strong>Certificate :</strong> No Dues / Subject Code Verified / Eligibility Permission</span>
          <span className="font-mono font-bold">{regNo}</span>
        </div>
      </div>
    );
  };

  // =========================================================================
  // ADMIT CARD TEMPLATE 3: AAI Aviation Official E-Admit Card (Image 3)
  // =========================================================================
  const renderAaiSouthernEAdmitCard = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'DILIPKUMAR S';
    const certTitle = certConfig.title || 'भारतीय विमानपत्तन प्राधिकरण / AIRPORTS AUTHORITY OF INDIA';
    const certSubtitle = certConfig.subtitle || '[SCHEDULE – \'A\' MINI RATNA - CATEGORY-1 PUBLIC SECTOR ENTERPRISE]';
    const certPost = certConfig.eventTitle || 'Junior Assistant (Fire Service) NE-4';
    const regNo = getDocRegNo(st, 'admit_card');

    return (
      <div className="bg-white border-2 border-slate-900 rounded-none shadow-2xl overflow-hidden max-w-3xl mx-auto font-sans text-slate-900 text-xs">
        {/* Top Header Banner with Plane Emblem */}
        <div className="bg-[#e2e8f0]/60 p-4 border-b-2 border-slate-900 text-center space-y-1">
          <div className="flex justify-center mb-1">
            <AaiAviationLogo size={56} />
          </div>
          <h1 className="text-sm sm:text-base font-black text-slate-950 uppercase">
            {certTitle}
          </h1>
          <p className="text-[10px] font-bold text-slate-700 uppercase">
            {certSubtitle}
          </p>
          <div className="text-[9.5px] font-bold text-slate-600 uppercase">
            REGIONAL HEADQUARTERS, SOUTHERN REGION &bull; RECRUITMENT CELL
          </div>
        </div>

        {/* Solid Blue E-ADMIT CARD Title Banner */}
        <div className="bg-[#0284c7] text-white py-2 text-center font-black text-sm tracking-widest uppercase">
          E - ADMIT CARD
        </div>

        {/* 1D Barcode Block */}
        <div className="py-3 px-6 text-center border-b border-slate-900 bg-white">
          <div className="flex justify-center">
            <div className="h-12 w-64 bg-slate-900 flex items-center justify-center text-white font-mono text-xs tracking-[0.5em]">
              ||||| | |||| || ||||| || |||
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-slate-800 tracking-widest mt-1 block">
            {st.roll_no ? `${st.roll_no}12130101449` : '12130101449'}
          </span>
        </div>

        {/* Structured Grid Layout with Candidate Photo on Right */}
        <div className="grid grid-cols-12 border-b-2 border-slate-900">
          {/* Left Details Grid */}
          <div className="col-span-8 border-r border-slate-900 divide-y divide-slate-300 text-[11px]">
            <div className="grid grid-cols-12 p-2">
              <span className="col-span-5 font-bold uppercase text-[10px] text-slate-600">NAME OF THE CANDIDATE</span>
              <strong className="col-span-7 font-black text-slate-950 uppercase">{certRecipient}</strong>
            </div>
            <div className="grid grid-cols-12 p-2">
              <span className="col-span-5 font-bold uppercase text-[10px] text-slate-600">Post Applied</span>
              <span className="col-span-7 font-bold text-slate-900">{certPost}</span>
            </div>
            <div className="grid grid-cols-12 p-2">
              <span className="col-span-5 font-bold uppercase text-[10px] text-slate-600">Candidate's Roll. No</span>
              <strong className="col-span-7 font-mono font-bold text-slate-900">{st.roll_no || '12130101449'}</strong>
            </div>
            <div className="grid grid-cols-12 p-2">
              <span className="col-span-5 font-bold uppercase text-[10px] text-slate-600">Application Ref No</span>
              <span className="col-span-7 font-mono font-bold text-slate-900">{st.id || 'AAI10053343'}</span>
            </div>
            <div className="grid grid-cols-12 p-2">
              <span className="col-span-5 font-bold uppercase text-[10px] text-slate-600">FATHER'S NAME</span>
              <span className="col-span-7 font-bold text-slate-900 uppercase">{st.father_name}</span>
            </div>
            <div className="grid grid-cols-12 p-2">
              <span className="col-span-5 font-bold uppercase text-[10px] text-slate-600">D.O.B. &bull; Gender</span>
              <span className="col-span-7 font-bold text-slate-900">{st.dob} &bull; {st.gender || 'Male'}</span>
            </div>
            <div className="p-2 space-y-0.5">
              <span className="font-bold uppercase text-[10px] text-slate-600 block">NAME &amp; ADDRESS OF EXAMINATION CENTRE</span>
              <div className="font-bold text-slate-900 text-[10.5px]">iON Digital Zone iDZ Kovilambakkam, Chennai - 600117</div>
            </div>
            <div className="grid grid-cols-2 p-2 text-[10.5px] bg-slate-50">
              <div><strong>Reporting Time:</strong> 11:00 AM</div>
              <div><strong>Gate Closing:</strong> 12:00 PM</div>
            </div>
          </div>

          {/* Right Photo & Signature Stack */}
          <div className="col-span-4 p-3 flex flex-col justify-between items-center text-center bg-slate-50/40">
            <img src={st.photo} alt={certRecipient} className="w-28 h-32 object-cover border border-slate-900 shadow-sm" />
            <div className="w-full border border-slate-400 p-1 bg-white mt-2">
              <HandWrittenSignature name={certRecipient} color="#000000" />
              <div className="text-[8.5px] font-bold text-slate-500">(Signature of the Candidate)</div>
            </div>
            <div className="w-full pt-2">
              <HandWrittenSignature name="J. Edward Raj" color="#1d4ed8" />
              <div className="text-[8.5px] font-black text-slate-700 uppercase">(Examination Authority)</div>
            </div>
          </div>
        </div>

        {/* Verbatim Paragraph Box & Candidate Declaration */}
        <div className="p-4 space-y-3 border-b-2 border-slate-900">
          <div className="text-[9px] font-bold text-slate-700 uppercase leading-tight">
            A PARAGRAPH WILL APPEAR ON YOUR COMPUTER SCREEN IMMEDIATELY BEFORE STARTING THE EXAM. THIS PARAGRAPH MAY BE REPRODUCED VERBATIM IN THE SPACE GIVEN BELOW :
          </div>
          <div className="border border-slate-400 p-3 h-16 bg-slate-50/30 text-[10px] text-slate-400 font-mono italic">
            [ Candidate must write the on-screen verification text in running handwriting ]
          </div>
          <div className="text-[9.5px] font-bold text-slate-800 leading-snug">
            Please write the statement: <em>"I do hereby declare that all the information furnished above are true to the best of my knowledge and I am the same candidate appearing in the exam whose photograph &amp; sign appearing above"</em>
          </div>
        </div>

        {/* Signature row */}
        <div className="grid grid-cols-2 p-4 text-center text-xs font-bold divide-x divide-slate-400">
          <div>
            <div className="border-b border-slate-400 pb-1 mb-1"></div>
            <div className="text-[10px] text-slate-700">(Signature of candidate - In presence of Invigilator)</div>
          </div>
          <div>
            <div className="border-b border-slate-400 pb-1 mb-1"></div>
            <div className="text-[10px] text-slate-700">(Invigilator Signature)</div>
          </div>
        </div>

        <div className="bg-slate-100 py-1 text-center font-bold text-[9px] text-slate-600 border-t border-slate-300">
          Admit Card to be collected by Invigilator &bull; Ref: {regNo}
        </div>
      </div>
    );
  };

  // =========================================================================
  // ADMIT CARD TEMPLATE 4: CBSE JEE (Main) National Pass (Image 4)
  // =========================================================================
  const renderCbseJeeMainHallTicket = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'SHAILENDRA KUMAR';
    const certTitle = certConfig.title || 'CENTRAL BOARD OF SECONDARY EDUCATION, DELHI';
    const certSubtitle = certConfig.subtitle || 'ADMIT CARD FOR JOINT ENTRANCE EXAMINATION JEE(MAIN) - 2026';
    const studentClass = customClassSection || st.class_batch || 'Class 10 - Section A';
    const certPaper = certConfig.presentationLine || (customClassSection ? `Grade: ${customClassSection} • Paper - 1 (B.E./B.Tech.)` : 'JEE(Main) Paper - 1 (B.E./B.Tech.) Only');
    const regNo = getDocRegNo(st, 'admit_card');

    return (
      <div className="bg-white border border-slate-400 rounded-none shadow-2xl overflow-hidden max-w-4xl mx-auto font-sans text-slate-900 text-xs p-6 space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
          <CentralBoardSeal size={58} />
          <div className="text-center flex-1 px-4">
            <h1 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
              {certTitle}
            </h1>
            <h2 className="text-xs sm:text-sm font-bold text-blue-900 uppercase tracking-wide">
              {certSubtitle}
            </h2>
          </div>
          <span className="font-mono text-[10px] text-slate-500 font-bold">PAGE 1/2</span>
        </div>

        {/* Structured Grid Table */}
        <div className="border border-slate-900">
          <div className="grid grid-cols-12 border-b border-slate-900 font-bold text-xs bg-slate-50 divide-x divide-slate-900">
            <div className="col-span-3 p-2">Center Number: <span className="font-mono font-black">752883</span></div>
            <div className="col-span-5 p-2 text-center text-blue-950">{certPaper}</div>
            <div className="col-span-4 p-2 text-right">Roll Number: <strong className="font-mono text-base font-black underline text-slate-950">{st.roll_no ? `${st.roll_no}7520147` : '75201475'}</strong></div>
          </div>

          <div className="grid grid-cols-12 divide-x divide-slate-900">
            {/* Left 8 Columns */}
            <div className="col-span-8 divide-y divide-slate-300 text-[11px]">
              <div className="p-2">
                <span className="font-bold text-slate-600 block text-[10px]">Center of Examination :</span>
                <strong className="text-slate-950 font-black">CORPORATE GROUP OF INSTITUTES, BHOPAL, MADHYA PRADESH - 462022</strong>
              </div>
              <div className="grid grid-cols-2 p-2">
                <div>Candidate's Name: <strong className="font-black text-slate-950 uppercase">{certRecipient}</strong></div>
                <div>Father's Name: <strong className="font-bold text-slate-900 uppercase">{st.father_name}</strong></div>
              </div>
              <div className="p-2 text-[10.5px]">
                <span className="font-bold text-slate-600">Candidate Mailing Address: </span>
                <span>{st.residential_address} &bull; Email: student@portal.edu &bull; Mobile: {st.phone || '+91 98765 00001'}</span>
              </div>
              <div className="grid grid-cols-3 p-2 text-[10.5px] bg-slate-50 font-bold">
                <div>Date of Exam: <span className="font-mono">10/04/2026</span></div>
                <div>Paper: <span>Paper - 1</span></div>
                <div>Timings: <span className="font-mono">0930-1230 IST</span></div>
              </div>
              <div className="grid grid-cols-3 p-2 text-[10px]">
                <div>Medium: <strong>ENGLISH</strong></div>
                <div>DOB: <strong>{st.dob}</strong></div>
                <div>App No: <strong className="font-mono">{st.id}</strong></div>
              </div>
            </div>

            {/* Right 4 Columns: Photo + Sign */}
            <div className="col-span-4 p-3 flex flex-col justify-between items-center text-center bg-slate-50/50">
              <img src={st.photo} alt={certRecipient} className="w-28 h-32 object-cover border border-slate-900 shadow-sm" />
              <div className="w-full mt-2 border-t border-dotted border-slate-900 pt-1">
                <HandWrittenSignature name={certRecipient} color="#000000" />
                <span className="text-[9px] font-bold text-slate-600 block">Signature of the Candidate</span>
              </div>
              <div className="mt-1">
                <HandWrittenSignature name="Director JEE" color="#1e3a8a" />
                <span className="text-[9px] font-black text-blue-950 uppercase block">Executive Director (JEE)</span>
              </div>
            </div>
          </div>
        </div>

        {/* DIRECTIONS FOR CANDIDATES (17 Points Official Summary) */}
        <div className="border border-slate-300 p-3 bg-slate-50 text-[9.5px] space-y-1 text-slate-700 leading-tight">
          <div className="font-black text-[10.5px] uppercase tracking-wider text-slate-900 text-center border-b border-slate-300 pb-1 mb-1">
            DIRECTIONS FOR CANDIDATES (IMPORTANT INSTRUCTIONS)
          </div>
          <ol className="list-decimal pl-4 space-y-0.5">
            <li>Please check Admit Card carefully for Name, Paper, Date of Birth, Gender, and Category.</li>
            <li>Candidates must bring a black ball-point pen to the examination hall.</li>
            <li>No candidate will be allowed to enter the exam hall without this original Admit Card and valid Government ID.</li>
            <li>Reporting time at venue: 08:30 AM. Gate closes at 09:15 AM sharp.</li>
            <li>Electronic devices, mobile phones, smartwatches, and study notes are strictly banned.</li>
            <li>Candidate must preserve this Admit Card till completion of admission formalities.</li>
          </ol>
        </div>
      </div>
    );
  };

  // =========================================================================
  // ADMIT CARD TEMPLATE 5: Modern Cryptographic QR Hall Ticket Pass
  // =========================================================================
  const renderModernCryptographicQrAdmit = (st) => {
    const certRecipient = certConfig.recipientName || st.student_name || 'Candidate Name';
    const certTitle = certConfig.title || 'NATIONAL TESTING & EXAMINATION COUNCIL';
    const certSubtitle = certConfig.subtitle || 'CRYPTOGRAPHIC ADMIT CARD & HALL TICKET';
    const regNo = getDocRegNo(st, 'admit_card');
    const studentClass = customClassSection || st.class_batch || 'Class 10 - Section A';

    return (
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-6 sm:p-8 rounded-3xl border-2 border-teal-500/50 text-white space-y-5 shadow-2xl relative overflow-hidden font-sans max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b border-teal-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-lg sm:text-xl text-teal-300 uppercase tracking-wider">{certTitle}</h1>
              <p className="text-xs text-slate-400 uppercase font-mono">{certSubtitle}</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-mono font-bold">
            TOKEN: {regNo}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-white/5 rounded-2xl border border-white/10">
          <img src={st.photo} alt={certRecipient} className="w-20 h-24 rounded-xl object-cover border border-teal-400/50 shadow-md" />
          <div className="md:col-span-8 space-y-1 text-xs">
            <div className="text-sm font-black text-white uppercase">{certRecipient}</div>
            <div className="text-teal-300 font-semibold">{studentClass} &bull; Roll #{st.roll_no}</div>
            <div className="text-slate-400 font-mono">Exam Center: Central Main Auditorium &bull; Slot: Morning Session</div>
          </div>
          <div className="md:col-span-3 flex justify-end">
            <div className="p-2 bg-white rounded-xl">
              <QrCode className="w-16 h-16 text-slate-950" />
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">{certConfig.bodyText}</p>

        <div className="pt-4 border-t border-white/10 flex justify-between items-end text-xs">
          <div>
            <div className="font-mono text-teal-400 text-[10px]">VERIFIED SECURITY HASH</div>
            <div className="text-slate-400 text-[9px]">Timestamp: {certConfig.awardDate || issueDate}</div>
          </div>
          <div className="text-right">
            <HandWrittenSignature name={certConfig.signatory1Name || 'Chief Controller'} color="#2dd4bf" />
            <div className="font-bold text-white text-xs">{certConfig.signatory1Name || 'Chief Controller'}</div>
            <div className="text-[9px] text-slate-400 uppercase font-mono">{certConfig.signatory1Title || 'National Examination Board'}</div>
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

      // 5. CHARACTER & CONDUCT MIGRATION CERTIFICATE (5 Master Design Layouts from User Upload)
      case 'migration': {
        switch (migrationTemplate) {
          case 'cbse_bilingual_migration': return renderCbseBilingualMigration(st);
          case 'ptu_state_technical_migration': return renderPtuStateTechnicalMigration(st);
          case 'delhi_univ_central_migration': return renderDelhiUnivCentralMigration(st);
          case 'statutory_board_character_migration': return renderStatutoryBoardCharacterMigration(st);
          case 'modern_cryptographic_qr_migration': return renderModernCryptographicQrMigration(st);
          default: return renderCbseBilingualMigration(st);
        }
      }

      // 6. ACADEMIC REPORT CARD (MARKSHEET - 5 Master Design Layouts from User Upload)
      case 'report_card': {
        switch (reportCardTemplate) {
          case 'salford_skyblue_quarterly': return renderSalfordSkyblueQuarterlyReport(st);
          case 'homeschool_holistic_habits': return renderHomeschoolHolisticHabitsReport(st);
          case 'salford_maroon_quarterly': return renderSalfordMaroonQuarterlyReport(st);
          case 'classic_ivy_slate_gold': return renderClassicIvySlateGoldReport(st);
          case 'borcelle_lavender_pill': return renderBorcelleLavenderPillReport(st);
          default: return renderSalfordSkyblueQuarterlyReport(st);
        }
      }

      // 7. EXAM ADMIT CARD (HALL TICKET - 5 Master Design Layouts from User Upload)
      case 'admit_card': {
        switch (admitCardTemplate) {
          case 'ignou_term_end_admit': return renderIgnouTermEndAdmit(st);
          case 'hpu_provisional_hall_ticket': return renderHpuProvisionalHallTicket(st);
          case 'aai_southern_e_admit_card': return renderAaiSouthernEAdmitCard(st);
          case 'cbse_jee_main_hall_ticket': return renderCbseJeeMainHallTicket(st);
          case 'modern_cryptographic_qr_admit': return renderModernCryptographicQrAdmit(st);
          default: return renderIgnouTermEndAdmit(st);
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
            {isFeePending ? (
              <button
                disabled={true}
                className="px-5 py-2.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center space-x-2 cursor-not-allowed opacity-80"
                title="Printing locked: Outstanding fee dues pending"
              >
                <Lock className="w-4 h-4 text-rose-400" />
                <span>Print Locked (Fee Due)</span>
              </button>
            ) : (
              <button
                onClick={() => { setViewMode('single'); setShowPrintModal(true); }}
                className="px-5 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/30 flex items-center space-x-2 transition-transform hover:scale-105 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
            )}
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
                  onClick={() => {
                    setDocType(dt.id);
                    if (dt.id === 'tc') {
                      const tpl = tcTemplatesList.find(t => t.id === tcTemplate);
                      if (tpl && tpl.defaultConfig) setCertConfig(prev => ({ ...prev, ...tpl.defaultConfig }));
                    } else if (dt.id === 'appreciation') {
                      const tpl = appreciationTemplatesList.find(t => t.id === appreciationTemplate);
                      if (tpl && tpl.defaultConfig) setCertConfig(prev => ({ ...prev, ...tpl.defaultConfig }));
                    } else if (dt.id === 'participation') {
                      const tpl = participationTemplatesList.find(t => t.id === participationTemplate);
                      if (tpl && tpl.defaultConfig) setCertConfig(prev => ({ ...prev, ...tpl.defaultConfig }));
                    } else if (dt.id === 'migration') {
                      const tpl = migrationTemplatesList.find(t => t.id === migrationTemplate);
                      if (tpl && tpl.defaultConfig) setCertConfig(prev => ({ ...prev, ...tpl.defaultConfig }));
                    } else if (dt.id === 'report_card') {
                      const tpl = reportCardTemplatesList.find(t => t.id === reportCardTemplate);
                      if (tpl && tpl.defaultConfig) setCertConfig(prev => ({ ...prev, ...tpl.defaultConfig }));
                    } else if (dt.id === 'admit_card') {
                      const tpl = admitCardTemplatesList.find(t => t.id === admitCardTemplate);
                      if (tpl && tpl.defaultConfig) setCertConfig(prev => ({ ...prev, ...tpl.defaultConfig }));
                    }
                  }}
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
                  onClick={() => {
                    setTcTemplate(tpl.id);
                    if (tpl.defaultConfig) {
                      setCertConfig(prev => ({ ...prev, ...tpl.defaultConfig }));
                    }
                  }}
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
                  onClick={() => {
                    setMigrationTemplate(tpl.id);
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
                  onClick={() => {
                    setReportCardTemplate(tpl.id);
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
                  onClick={() => {
                    setAdmitCardTemplate(tpl.id);
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

            {/* Full Live Customizer for Certificate of Appreciation, Participation, Migration, Report Card, Admit Card & TC */}
            {(docType === 'tc' || docType === 'appreciation' || docType === 'participation' || docType === 'migration' || docType === 'report_card' || docType === 'admit_card' || docType === 'domicile') && (
              <div className="space-y-3 p-4 bg-gradient-to-br from-amber-50/80 to-rose-50/60 rounded-2xl border-2 border-amber-300/80 shadow-sm">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                  <div className="flex items-center gap-1.5 font-black text-[11px] text-amber-950 uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>🎨 Live Document &amp; Admit Card Text Customizer</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (docType === 'tc') {
                        const tpl = tcTemplatesList.find(t => t.id === tcTemplate);
                        if (tpl && tpl.defaultConfig) {
                          setCertConfig(prev => ({ ...prev, ...tpl.defaultConfig }));
                        }
                      } else if (docType === 'appreciation') {
                        const tpl = appreciationTemplatesList.find(t => t.id === appreciationTemplate);
                        if (tpl && tpl.defaultConfig) {
                          setCertConfig(prev => ({ ...prev, ...tpl.defaultConfig }));
                        }
                      } else if (docType === 'participation') {
                        const tpl = participationTemplatesList.find(t => t.id === participationTemplate);
                        if (tpl && tpl.defaultConfig) {
                          setCertConfig(prev => ({ ...prev, ...tpl.defaultConfig }));
                        }
                      } else if (docType === 'migration') {
                        const tpl = migrationTemplatesList.find(t => t.id === migrationTemplate);
                        if (tpl && tpl.defaultConfig) {
                          setCertConfig(prev => ({ ...prev, ...tpl.defaultConfig }));
                        }
                      } else if (docType === 'report_card') {
                        const tpl = reportCardTemplatesList.find(t => t.id === reportCardTemplate);
                        if (tpl && tpl.defaultConfig) {
                          setCertConfig(prev => ({ ...prev, ...tpl.defaultConfig }));
                        }
                      } else if (docType === 'admit_card') {
                        const tpl = admitCardTemplatesList.find(t => t.id === admitCardTemplate);
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

                <div className="pt-2 border-t border-amber-200/50">
                  <label className="block font-bold text-slate-700 text-[10px] mb-0.5 flex items-center justify-between">
                    <span>School Crest / Logo URL</span>
                    <span className="text-[9px] text-slate-400 font-normal">Applies to all certificates &amp; TCs</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://... or paste image URL (leave empty for authentic crest)"
                    value={schoolInfo.customLogoUrl}
                    onChange={(e) => setSchoolInfo(prev => ({ ...prev, customLogoUrl: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 text-xs text-slate-900 bg-white"
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

            <div className="pt-2 space-y-2">
              {isFeePending ? (
                <>
                  <button
                    type="button"
                    disabled={true}
                    className="w-full py-2.5 rounded-xl bg-slate-100 border-2 border-dashed border-rose-300 text-rose-600 font-black text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-85 shadow-sm"
                  >
                    <Lock className="w-4 h-4 text-rose-500" />
                    <span>Download Locked &bull; Fee Due ₹{(activeStudent.feeDues || 35000).toLocaleString('en-IN')}</span>
                  </button>
                  <div className="p-3 bg-rose-50/90 rounded-2xl border border-rose-200 text-[10.5px] text-rose-800 flex items-start gap-2 shadow-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="leading-tight">
                      <strong>Fee Clearance Required:</strong> Clear outstanding dues in Accounts / Fee Portal to unlock high-resolution printable document &amp; PDF download.
                    </span>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => { setViewMode('single'); setShowPrintModal(true); }}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Open Printable View / Download PDF</span>
                </button>
              )}
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
              {isFeePending ? (
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1 shadow-xs">
                  <Lock className="w-3 h-3 text-rose-600" />
                  <span>Preview Locked (Fee Dues)</span>
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  {docTypesList.find(d => d.id === docType)?.title}
                </span>
              )}
              {docType === 'tc' && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {tcTemplatesList.find(t => t.id === tcTemplate)?.orientation}
                </span>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl">
            {/* The Document Content (Rendered crystal clear if paid, and heavily blurred if unpaid/fee pending) */}
            <div className={`transition-all duration-300 overflow-x-auto ${isFeePending ? 'filter blur-[8px] select-none pointer-events-none opacity-45' : ''}`}>
              {renderDocumentContent(activeStudent, docType)}
            </div>

            {/* Locked Fee Pending Security Shield Overlay (Only appears on unpaid students) */}
            {isFeePending && (
              <div className="absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 bg-slate-950/30 backdrop-blur-[2px]">
                <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-rose-400 text-center space-y-4 transform animate-fadeIn">
                  <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner border border-rose-200">
                    <Lock className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="inline-block px-3 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-widest border border-rose-300">
                      🔒 Official Issuance Restricted
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Document Access Locked
                    </h4>
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                      Outstanding fee dues of <strong className="text-rose-600 font-bold">₹{(activeStudent.feeDues || 35000).toLocaleString('en-IN')}</strong> are pending for <strong className="text-slate-900">{activeStudent.student_name}</strong>.
                    </p>
                  </div>

                  <div className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-200 text-[11px] text-rose-800 text-left space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-rose-900">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Institutional Clearance Policy:</span>
                    </div>
                    <p className="text-[10.5px] leading-snug text-slate-600">
                      As per statutory institution bylaws, Transfer Certificates, Academic Marksheets, and Official Hall Tickets cannot be viewed or downloaded until all outstanding school fees are settled.
                    </p>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono">
                    Candidate ID: {activeStudent.id} &bull; Roll #{activeStudent.roll_no}
                  </div>
                </div>
              </div>
            )}
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
            {/* Scrollable Printable Documents Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-100/60">
              {viewMode === 'all' ? (
                studentList.map((st, idx) => {
                  const isStFeePending = st.fee_status === 'Pending' || st.fee_status === 'Unpaid' || st.fee_status === 'Due' || (st.feeDues && st.feeDues > 0);
                  return (
                    <div key={st.id || idx} className="space-y-2 print:page-break-after-always">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1 print:hidden">
                        <span>Document #{idx + 1} of {studentList.length} &bull; {st.student_name}</span>
                        <div className="flex items-center gap-2">
                          {isStFeePending ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-300">
                              Fee Dues Pending (Locked)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-300">
                              Fee Cleared
                            </span>
                          )}
                          <span className="font-mono">{getDocRegNo(st, docType)}</span>
                        </div>
                      </div>
                      <div className="relative overflow-hidden rounded-2xl">
                        <div className={`${isStFeePending ? 'filter blur-[7px] select-none pointer-events-none opacity-40' : ''}`}>
                          {renderDocumentContent(st, docType)}
                        </div>
                        {isStFeePending && (
                          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-slate-950/20">
                            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border-2 border-rose-400 text-center space-y-2 shadow-xl max-w-sm">
                              <Lock className="w-7 h-7 text-rose-600 mx-auto" />
                              <h4 className="font-black text-slate-900 text-xs uppercase">Certificate Withheld &bull; Fee Due</h4>
                              <p className="text-[10.5px] text-slate-600">Accounts clearance required for {st.student_name} before official release.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                isFeePending ? (
                  <div className="p-12 text-center bg-white rounded-3xl border-2 border-rose-300 space-y-4 max-w-lg mx-auto my-8 shadow-xl">
                    <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner border border-rose-200">
                      <Lock className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-slate-900 text-lg">Official Print Restricted</h3>
                      <p className="text-xs text-slate-600">
                        Outstanding fee dues of <strong className="text-rose-600 font-bold">₹{(activeStudent.feeDues || 35000).toLocaleString('en-IN')}</strong> are pending for <strong className="text-slate-900">{activeStudent.student_name}</strong>.
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 bg-rose-50 p-3 rounded-xl border border-rose-200">
                      This certificate cannot be downloaded, printed, or saved as PDF until school dues are cleared in the accounts department.
                    </p>
                  </div>
                ) : (
                  renderDocumentContent(activeStudent, docType)
                )
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Includes dynamic verification QR code &amp; institutional seal</span>
              </div>
              <div className="flex items-center gap-3">
                {(!isFeePending || viewMode === 'all') ? (
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/25 flex items-center space-x-2 transition-transform hover:scale-105 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Document(s)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={true}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-400 font-bold text-xs flex items-center space-x-2 cursor-not-allowed opacity-80"
                  >
                    <Lock className="w-4 h-4 text-rose-500" />
                    <span>Print Disabled (Fee Due)</span>
                  </button>
                )}
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
