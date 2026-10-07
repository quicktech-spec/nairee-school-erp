import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Palette, 
  Globe, 
  Layers, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  School,
  Upload,
  Check,
  Zap,
  ExternalLink,
  BookOpen,
  Calendar,
  CreditCard,
  Award,
  Bus,
  Library,
  FileSpreadsheet,
  Users,
  Lock,
  ChevronRight,
  FileText,
  Trophy,
  GraduationCap,
  Clock,
  Scroll,
  Medal,
  IdCard
} from 'lucide-react';
import { useTenant } from '../context/TenantContext.jsx';

const PRESET_PALETTES = [
  { name: 'Royal Indigo (Default)', primary: '#5673ec', secondary: '#6c8cff', accent: '#10b981' },
  { name: 'Emerald Forest (DPS Style)', primary: '#006633', secondary: '#009944', accent: '#eab308' },
  { name: 'Crimson Maroon (St. Xavier Style)', primary: '#800020', secondary: '#b91c1c', accent: '#f59e0b' },
  { name: 'Deep Sapphire Navy', primary: '#1e3a8a', secondary: '#3b82f6', accent: '#06b6d4' },
  { name: 'Azure Ocean (Modern STEM)', primary: '#0284c7', secondary: '#0ea5e9', accent: '#10b981' },
  { name: 'Imperial Violet (Academy)', primary: '#6d28d9', secondary: '#8b5cf6', accent: '#f43f5e' }
];

const TC_TEMPLATES_ONBOARDING = [
  { id: 'traditional_heritage', title: 'Traditional Heritage Leaving (23-Point)', tag: 'St. Francis Model', desc: 'CBSE/ICSE statutory lines, double parchment border & triple signatures' },
  { id: 'vintage_crimson', title: 'Character Certificate (Emerald Seal)', tag: 'DPS Birgunj Model', desc: 'Authentic circular school stamp, calligraphic flourish & moral character prose' },
  { id: 'modern_platinum', title: 'Modern Platinum & Cobalt', tag: 'Parent Clearance Model', desc: 'Cyan & cobalt corner vectors, formal principal address block & dual sign-off' },
  { id: 'cbse_statutory', title: 'CBSE Statutory 15-Point', tag: 'CBSE Standard', desc: 'Affiliation & School Code, 15 statutory clauses, triple signatory' },
  { id: 'royal_gold', title: 'Royal Navy & Gold Crest', tag: 'Board Compliant', desc: 'Navy framed statutory layout with student photo slot & seals' },
  { id: 'sunrise_chevron', title: 'Sunrise Golden Chevron', tag: 'Classic Geometric', desc: 'Angular gold/charcoal corners, laurel crest, structured clean lines' },
  { id: 'classic_ivory', title: 'Classic Ivory Filigree', tag: 'Landscape Filigree', desc: 'Ornate gold filigree borders with formal registrar signatures' }
];

const APPRECIATION_TEMPLATES_ONBOARDING = [
  { id: 'mint_emerald_fluid_waves', title: 'Mint Emerald Fluid Waves', tag: 'Excellence Award', desc: 'Luxury emerald wave ribbons with silver-gold rosette medal' },
  { id: 'modern_navy_gold_badge', title: 'Royal Gold Guilloche & Seal', tag: 'Merit Trophy', desc: 'Gold guilloche frame, navy contrast with authentic wax seal badge' },
  { id: 'royal_navy_gold_geometric', title: 'Royal Navy & Gold Filigree', tag: 'Honors Award', desc: 'Ivory background, navy & gold diagonal angular bands' },
  { id: 'cyan_emerald_curved_sweep', title: 'Dynamic Cyan Curved Sweep', tag: 'Contest Award', desc: 'Vibrant modern geometric curves with clean certificate title' },
  { id: 'forest_lime_polygon_mosaic', title: 'Geometric Forest Mosaic', tag: 'Heritage Honor', desc: 'Olive, forest & lime green geometric triangle mosaic clusters' }
];

const ID_CARD_TEMPLATES_ONBOARDING = [
  { id: 'navy_chevron', title: 'Navy Modern Chevron', tag: 'Star Badge & Pill Header', desc: 'Top-left navy pennant ribbon, cyan geometric corners, bold blue Student Card pill banner' },
  { id: 'sage_khaki', title: 'Sage Khaki & Honeycomb', tag: 'Olive Crest & Watermark', desc: 'Refined olive/sage khaki header, diagonal hazard stripes, honeycomb watermark & signature overlay' },
  { id: 'terracotta_split', title: 'Minimalist Terracotta & Olive', tag: 'Dual Split & Grid', desc: 'Sage green sidebar with orange accent border line, clean 2-column student metadata grid' },
  { id: 'emerald_wave', title: 'Emerald & Cyan Wave Flow', tag: 'Guilloche Wave & Sine Flow', desc: 'Deep emerald/teal gradient curves, circular student portrait with glowing ring & sine wave patterns' },
  { id: 'terracotta_portrait', title: 'Borcelle Terracotta Heritage', tag: 'Portrait Vertical Card', desc: 'Vertical ID card with warm rust geometric banner, lotus insignia, hazard accent tabs & QR code' }
];

const ALL_CERTIFICATE_MODULES = [
  { id: 'tc', label: 'Transfer Certificate (TC)', desc: 'Official student transfer & statutory leaving record', tag: 'Statutory School Leaving', icon: Scroll },
  { id: 'appreciation', label: 'Certificate of Appreciation', desc: 'Merit, honors, and academic achievement awards', tag: 'Merit & Honors', icon: Trophy },
  { id: 'id_card', label: 'Student ID Cards', desc: 'Custom portrait & landscape photo ID badges with barcodes', tag: 'Smart Student Identity', icon: IdCard },
  { id: 'participation', label: 'Certificate of Participation', desc: 'Co-curricular, sports, and contest entry certificates', tag: 'Co-curricular & Sports', icon: Medal },
  { id: 'domicile', label: 'Domicile / Bonafide Certificate', desc: 'Official permanent residence and enrollment proof', tag: 'Statutory Residence Proof', icon: Building },
  { id: 'migration', label: 'Character & Migration Certificate', desc: 'Relocation clearances and character testimonials', tag: 'Board Relocation Clearance', icon: ShieldCheck },
  { id: 'report_card', label: 'Academic Report Card', desc: 'Quarterly & annual marksheet evaluations', tag: 'Gradebook Marksheet', icon: BookOpen },
  { id: 'admit_card', label: 'Exam Admit Card', desc: 'Hall tickets with timetable & exam center instructions', tag: 'Examination Entry Pass', icon: Clock }
];

const AVAILABLE_MODULES = [
  { id: 'academics', label: 'Academics & Curriculum', desc: 'Classes, batches, 72 CBSE subjects & faculty allocations', icon: BookOpen, recommended: true },
  { id: 'attendance', label: 'Daily School Attendance', desc: 'Real-time student & staff punch logs with SMS notifications', icon: Calendar, recommended: true },
  { id: 'fees', label: 'Fee Invoices & Billing Ledger', desc: 'Online fee collection, multi-term installments & receipts', icon: CreditCard, recommended: true },
  { id: 'gradebook', label: 'Exam Marks & Gradebook', desc: 'Auto grading triggers, report cards & CBSE marksheets', icon: Award, recommended: true },
  { id: 'timetable', label: 'Timetable & Class Schedules', desc: 'Weekly bell schedules, period slots & room allocations', icon: Calendar, recommended: true },
  { id: 'homework', label: 'Homework & Assignments', desc: 'Online submission uploads, feedback & grading tracker', icon: FileSpreadsheet, recommended: true },
  { id: 'library', label: 'Library Management', desc: 'Book cataloging, ISBN lookup, issue/return tracker', icon: Library, recommended: false },
  { id: 'transport', label: 'Transport & GPS Bus Fleet', desc: 'Live route tracking, pickup stops & driver directory', icon: Bus, recommended: false },
  { id: 'communication', label: 'Parent Communication Hub', desc: 'Direct circulars, SMS broadcasts & teacher chats', icon: Users, recommended: true },
  { id: 'payroll', label: 'Staff HR & Payroll', desc: 'Salary slip generator, deductions & leave tracker', icon: CreditCard, recommended: false },
  { id: 'reports', label: 'Financial & P&L Analytics', desc: 'Audited balance sheets, fee collections & cash flows', icon: Award, recommended: true },
  { id: 'database', label: 'Database Studio & Master Tables', desc: 'Direct table editor, CSV/Excel export & query runner', icon: Layers, recommended: true }
];

export default function TenantOnboardingModal({ isOpen, onClose }) {
  const { createTenant, switchTenant } = useTenant();
  const [step, setStep] = useState(1);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionSuccess, setProvisionSuccess] = useState(false);
  const [provisionedTenant, setProvisionedTenant] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [formData, setFormData] = useState({
    school_name: '',
    school_code: '',
    board_affiliation: 'CBSE Affiliated',
    tagline: 'Excellence in Connected Global Education',
    phone: '+91 98765 00000',
    email: 'admin@school.edu',
    address: 'City Campus, State, PIN',
    logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150',
    primary_color: '#006633',
    secondary_color: '#009944',
    accent_color: '#eab308',
    subdomain: '',
    custom_domain: '',
    enabled_certificates: ['tc', 'appreciation', 'id_card'],
    default_tc_template: 'traditional_heritage',
    default_appreciation_template: 'mint_emerald_fluid_waves',
    default_participation_template: 'classic_gold_filigree_frame',
    default_id_card_template: 'navy_chevron',
    default_report_card_template: 'salford_skyblue_quarterly',
    default_admit_card_template: 'ignou_term_end_admit',
    principal_name: 'Dr. Ramakant Sharma',
    principal_title: 'Principal / Head of Institution',
    enabled_features: [
      'academics', 'attendance', 'fees', 'gradebook', 'timetable', 'homework', 'communication', 'reports', 'database', 'id_cards', 'transfer_certificates'
    ],
    plan_tier: 'Enterprise',
    max_students: 2500,
    max_staff: 150,
    admin_name: 'Dr. Ramakant Sharma',
    admin_email: 'principal@school.edu',
    admin_pass: 'school123'
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Logo file size must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setFormData(prev => ({
          ...prev,
          logo_url: uploadEvent.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleNameChange = (name) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);
    const code = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4) || 'SCH';
    setFormData(prev => ({
      ...prev,
      school_name: name,
      subdomain: prev.subdomain === '' || prev.subdomain.startsWith('school') ? slug : prev.subdomain,
      school_code: prev.school_code === '' || prev.school_code === 'SCH' ? code : prev.school_code
    }));
  };

  const handleApplyPalette = (palette) => {
    setFormData(prev => ({
      ...prev,
      primary_color: palette.primary,
      secondary_color: palette.secondary,
      accent_color: palette.accent
    }));
  };

  const toggleModule = (moduleId) => {
    setFormData(prev => {
      const exists = prev.enabled_features.includes(moduleId);
      return {
        ...prev,
        enabled_features: exists 
          ? prev.enabled_features.filter(id => id !== moduleId)
          : [...prev.enabled_features, moduleId]
      };
    });
  };

  const handleSelectAllModules = () => {
    setFormData(prev => ({
      ...prev,
      enabled_features: AVAILABLE_MODULES.map(m => m.id)
    }));
  };

  const handleFinishProvisioning = () => {
    setIsProvisioning(true);
    setTimeout(() => {
      const created = createTenant(formData);
      setProvisionedTenant(created);
      setIsProvisioning(false);
      setProvisionSuccess(true);
    }, 1200);
  };

  const handleLaunchInstance = () => {
    if (provisionedTenant) {
      switchTenant(provisionedTenant.tenant_id);
    }
    onClose();
    // Reset modal
    setStep(1);
    setProvisionSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">White-Label School Onboarding Wizard</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Instant SaaS
                </span>
              </div>
              <p className="text-xs text-slate-300">Provision a branded, isolated School ERP instance in a few clicks</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-Step Progress Tracker */}
        {!provisionSuccess && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {[
                { s: 1, label: 'Identity' },
                { s: 2, label: 'Branding' },
                { s: 3, label: 'Certificates' },
                { s: 4, label: 'Subdomain' },
                { s: 5, label: 'Modules' },
                { s: 6, label: 'Tier' },
                { s: 7, label: 'Admin' },
                { s: 8, label: 'Provision' }
              ].map((item) => (
                <div key={item.s} className="flex items-center gap-1.5">
                  <div 
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                      step === item.s 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-600 ring-offset-2' 
                        : step > item.s 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {step > item.s ? <Check className="w-3.5 h-3.5" /> : item.s}
                  </div>
                  <span className={`text-[10.5px] font-semibold hidden lg:inline ${step === item.s ? 'text-indigo-900 font-bold' : 'text-slate-500'}`}>
                    {item.label}
                  </span>
                  {item.s < 8 && <ChevronRight className="w-3 h-3 text-slate-300 hidden md:inline" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Body: Step-by-Step Forms */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* Step 1: School Identity */}
          {step === 1 && (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="text-center pb-2">
                <h3 className="text-xl font-black text-slate-900">Step 1: School Profile & Identity</h3>
                <p className="text-xs text-slate-500 mt-1">Enter the official school details that will appear on marksheets, fee receipts, and portals.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    School / Institution Name *
                  </label>
                  <input
                    type="text"
                    value={formData.school_name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Delhi Public School, Ranchi"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold text-slate-900 outline-none"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      School Code / Acronym *
                    </label>
                    <input
                      type="text"
                      value={formData.school_code}
                      onChange={(e) => setFormData({ ...formData, school_code: e.target.value.toUpperCase() })}
                      placeholder="e.g. DPS, SXA, GGS"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-bold text-slate-900 uppercase"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Used for Student/Teacher ID prefixes (e.g. {formData.school_code || 'SCH'}-2024-091-001)</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Board / Affiliation *
                    </label>
                    <input
                      type="text"
                      value={formData.board_affiliation}
                      onChange={(e) => setFormData({ ...formData, board_affiliation: e.target.value })}
                      placeholder="e.g. CBSE Affiliated #3430012, ICSE, Cambridge"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    School Motto / Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="e.g. Service Before Self • Empowering Excellence"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Official Contact Phone
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 651 244 1125"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Official Admin Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="admissions@school.edu"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Campus Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Sector 4, Main Campus Road, City, State - PIN"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Branding & Appearance */}
          {step === 2 && (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="text-center pb-2">
                <h3 className="text-xl font-black text-slate-900">Step 2: Brand & Visual Customization</h3>
                <p className="text-xs text-slate-500 mt-1">Upload the school logo and choose colors that will instantly style the entire portal.</p>
              </div>

              {/* Live Branding Preview Card */}
              <div 
                className="p-6 rounded-2xl border text-white shadow-lg transition-all"
                style={{
                  background: `linear-gradient(135deg, ${formData.primary_color}, ${formData.secondary_color})`
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={formData.logo_url} 
                      alt="Logo Preview" 
                      className="w-12 h-12 rounded-xl object-contain bg-white/20 p-1 border border-white/30 backdrop-blur-sm"
                      onError={(e) => { e.target.src = '/nairee-logo.png'; }}
                    />
                    <div>
                      <h4 className="text-base font-black tracking-tight drop-shadow-sm">
                        {formData.school_name || 'Your School Name'}
                      </h4>
                      <p className="text-xs text-white/80 font-medium">
                        {formData.tagline || 'Excellence in Connected Education'}
                      </p>
                    </div>
                  </div>

                  <span 
                    className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm"
                    style={{ backgroundColor: formData.accent_color, color: '#ffffff' }}
                  >
                    {formData.school_code || 'ERP'}
                  </span>
                </div>
              </div>

              {/* School Logo Upload & Drag-Drop Zone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>School Crest / Logo Upload *</span>
                  <span className="text-[10px] text-slate-400 font-normal">PNG, JPG, SVG, WebP (Max 5MB)</span>
                </label>

                <div className="p-4 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/60 transition-colors flex flex-col sm:flex-row items-center gap-4">
                  {/* Current Logo Thumbnail */}
                  <div className="relative shrink-0">
                    <img 
                      src={formData.logo_url} 
                      alt="School Crest" 
                      className="w-16 h-16 rounded-xl object-contain bg-white p-1.5 border border-slate-200 shadow-sm"
                      onError={(e) => { e.target.src = '/nairee-logo.png'; }}
                    />
                    {formData.logo_url && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95">
                        <Upload className="w-4 h-4" />
                        <span>Choose / Upload File</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp, image/svg+xml"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span>{showUrlInput ? 'Hide URL Box' : 'Paste Image URL'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Upload the school's official PNG/SVG crest or logo from your computer.
                    </p>

                    {/* URL Input (Optional Dropdown) */}
                    {showUrlInput && (
                      <div className="pt-1.5 animate-in fade-in duration-150">
                        <input
                          type="text"
                          value={formData.logo_url}
                          onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                          placeholder="https://example.com/school-crest.png"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs font-mono bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Presets Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select a Curated Luxury School Color Palette:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRESET_PALETTES.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPalette(p)}
                      className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                        formData.primary_color === p.primary 
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/30' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800">{p.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: p.primary }}></span>
                        <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: p.secondary }}></span>
                        <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: p.accent }}></span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-9 h-9 rounded-lg cursor-pointer border border-slate-200"
                    />
                    <input
                      type="text"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="w-9 h-9 rounded-lg cursor-pointer border border-slate-200"
                    />
                    <input
                      type="text"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Accent Badge Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.accent_color}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                      className="w-9 h-9 rounded-lg cursor-pointer border border-slate-200"
                    />
                    <input
                      type="text"
                      value={formData.accent_color}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-mono text-xs uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Institutional Document & Certificate Suite */}
          {step === 3 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="text-center pb-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Official Institutional Certification Defaults</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">Step 3: Choose Default Certificate & ID Card Layouts</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">
                  Select the default styling for official documents. Every certificate, marksheet, and student ID generated in the ERP will automatically load with these designs and your school branding.
                </p>
              </div>

              {/* Document Suite Module Chooser (Choose which certificates are active for this school) */}
              <div className="p-5 rounded-3xl border-2 border-indigo-200 bg-indigo-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-700" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950">
                      Select Document &amp; Certificate Formats to Activate ({formData.enabled_certificates.length} of {ALL_CERTIFICATE_MODULES.length} Selected)
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100/80 px-2.5 py-0.5 rounded-full border border-indigo-300">
                    Custom Suite
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Select only the certificates your institution requires. Only the selected formats will appear in your school's certificate portal.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {ALL_CERTIFICATE_MODULES.map((mod) => {
                    const isEnabled = formData.enabled_certificates.includes(mod.id);
                    const Icon = mod.icon;
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => {
                          const next = isEnabled
                            ? (formData.enabled_certificates.length > 1 ? formData.enabled_certificates.filter(k => k !== mod.id) : formData.enabled_certificates)
                            : [...formData.enabled_certificates, mod.id];
                          setFormData({ ...formData, enabled_certificates: next });
                        }}
                        className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isEnabled
                            ? 'border-indigo-600 bg-indigo-100/90 shadow-sm ring-2 ring-indigo-400/40 text-indigo-950'
                            : 'border-slate-200 bg-white/80 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${isEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${isEnabled ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                              {isEnabled && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                          <div className="text-xs font-black leading-tight text-slate-900">{mod.label}</div>
                          <p className="text-[9.5px] text-slate-500 mt-1 line-clamp-2">{mod.desc}</p>
                        </div>
                        <div className="mt-2 pt-1 border-t border-indigo-200/50 text-[9px] font-bold text-indigo-700">
                          {isEnabled ? '✓ Activated' : 'Click to Enable'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 1. Transfer Certificate Default Layout (Rendered if TC is enabled) */}
              {formData.enabled_certificates.includes('tc') && (
                <div className="p-5 rounded-2xl border-2 border-amber-200 bg-amber-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scroll className="w-4 h-4 text-amber-700" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-950">
                        Default Transfer Certificate (TC) Design Template
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                      Active: {TC_TEMPLATES_ONBOARDING.find(t => t.id === formData.default_tc_template)?.title}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {TC_TEMPLATES_ONBOARDING.map((tpl) => {
                      const isSelected = formData.default_tc_template === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, default_tc_template: tpl.id })}
                          className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-amber-600 bg-amber-100/70 shadow-sm ring-2 ring-amber-500/30 scale-[1.02]'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] font-bold uppercase text-amber-800">{tpl.tag}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-amber-700 font-bold" />}
                            </div>
                            <div className="text-xs font-black text-slate-900 leading-tight">{tpl.title}</div>
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-tight">{tpl.desc}</p>
                          </div>
                          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px] font-semibold text-slate-400">
                            <span>A4 Format</span>
                            <span className={isSelected ? 'text-amber-800 font-bold' : 'text-slate-500'}>
                              {isSelected ? '✓ Default Selected' : 'Select'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Certificate of Appreciation & Merit Layout (Rendered if Appreciation is enabled) */}
              {formData.enabled_certificates.includes('appreciation') && (
                <div className="p-5 rounded-2xl border-2 border-rose-200 bg-rose-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-rose-700" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-rose-950">
                        Default Appreciation &amp; Merit Certificate Design
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-rose-800 bg-rose-100/80 px-2.5 py-0.5 rounded-full border border-rose-300">
                      Active: {APPRECIATION_TEMPLATES_ONBOARDING.find(t => t.id === formData.default_appreciation_template)?.title}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {APPRECIATION_TEMPLATES_ONBOARDING.map((tpl) => {
                      const isSelected = formData.default_appreciation_template === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, default_appreciation_template: tpl.id })}
                          className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-rose-600 bg-rose-100/70 shadow-sm ring-2 ring-rose-500/30 scale-[1.02]'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] font-bold uppercase text-rose-800">{tpl.tag}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-rose-700 font-bold" />}
                            </div>
                            <div className="text-xs font-black text-slate-900 leading-tight">{tpl.title}</div>
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-tight">{tpl.desc}</p>
                          </div>
                          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px] font-semibold text-slate-400">
                            <span>Landscape</span>
                            <span className={isSelected ? 'text-rose-800 font-bold' : 'text-slate-500'}>
                              {isSelected ? '✓ Default Selected' : 'Select'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Student ID Card Layout (Rendered if ID card is enabled) */}
              {formData.enabled_certificates.includes('id_card') && (
                <div className="p-5 rounded-2xl border-2 border-teal-200 bg-teal-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IdCard className="w-4 h-4 text-teal-700" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-teal-950">
                        Default Student ID Card Format
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full border border-teal-300">
                      Active: {ID_CARD_TEMPLATES_ONBOARDING.find(t => t.id === formData.default_id_card_template)?.title}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    {ID_CARD_TEMPLATES_ONBOARDING.map((tpl) => {
                      const isSelected = formData.default_id_card_template === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, default_id_card_template: tpl.id })}
                          className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-teal-600 bg-teal-100/70 shadow-sm ring-2 ring-teal-500/30 scale-[1.02]'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] font-bold uppercase text-teal-800">{tpl.tag}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-teal-700 font-bold" />}
                            </div>
                            <div className="text-xs font-black text-slate-900 leading-tight">{tpl.title}</div>
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-tight">{tpl.desc}</p>
                          </div>
                          <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] font-bold text-teal-800">
                            {isSelected ? '✓ Default Selected' : 'Select'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Principal Signatory Information */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  4. Principal / Head of Institution Signatory Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Principal / Signatory Name *</label>
                    <input
                      type="text"
                      value={formData.principal_name}
                      onChange={(e) => setFormData({ ...formData, principal_name: e.target.value })}
                      placeholder="e.g. Dr. Ramakant Sharma, Ph.D."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Signatory Title / Designation *</label>
                    <input
                      type="text"
                      value={formData.principal_title}
                      onChange={(e) => setFormData({ ...formData, principal_title: e.target.value })}
                      placeholder="Principal / Head of Institution"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Subdomain & Routing */}
          {step === 4 && (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="text-center pb-2">
                <h3 className="text-xl font-black text-slate-900">Step 4: Subdomain & Domain Routing</h3>
                <p className="text-xs text-slate-500 mt-1">Assign an isolated subdomain and optional custom domain for this school.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Subdomain *
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                    <input
                      type="text"
                      value={formData.subdomain}
                      onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      placeholder="dps-ranchi"
                      className="flex-1 px-4 py-2.5 text-sm font-bold text-indigo-900 outline-none"
                    />
                    <span className="px-4 py-2.5 bg-slate-100 text-slate-500 font-mono text-xs font-semibold border-l border-slate-200">
                      .nairee.app
                    </span>
                  </div>
                  <div className="mt-2 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs text-indigo-900 font-medium">
                    <span>Live Portal URL:</span>
                    <span className="font-mono font-bold text-indigo-700">
                      https://{formData.subdomain || 'schoolname'}.nairee.app
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Custom Domain (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.custom_domain}
                    onChange={(e) => setFormData({ ...formData, custom_domain: e.target.value.toLowerCase() })}
                    placeholder="e.g. erp.dpsranchi.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm font-mono text-slate-800"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Add a CNAME record in your DNS pointing to cname.nairee.app</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Modules & Feature Flags */}
          {step === 5 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="flex items-center justify-between pb-2">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Step 5: Module Selection & Feature Flags</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Toggle only the modules this school has purchased or needs enabled.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSelectAllModules}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Enable All 12 Modules
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AVAILABLE_MODULES.map((mod) => {
                  const isEnabled = formData.enabled_features.includes(mod.id);
                  const Icon = mod.icon;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                        isEnabled
                          ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600/30'
                          : 'border-slate-200 bg-white hover:border-slate-300 opacity-60'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isEnabled ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900">{mod.label}</h4>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            isEnabled ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                          }`}>
                            {isEnabled && <Check className="w-3 h-3" />}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">{mod.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 6: Plan & Limits */}
          {step === 6 && (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="text-center pb-2">
                <h3 className="text-xl font-black text-slate-900">Step 6: Subscription Plan & Resource Tier</h3>
                <p className="text-xs text-slate-500 mt-1">Define subscription level and maximum student/faculty capacity.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { tier: 'Basic', students: 500, staff: 40, price: '₹15,000 / mo', desc: 'Core Academics & Attendance' },
                  { tier: 'Standard', students: 1800, staff: 100, price: '₹35,000 / mo', desc: 'Fees, Gradebook & Portals' },
                  { tier: 'Enterprise', students: 5000, staff: 250, price: '₹75,000 / mo', desc: 'All Modules + Dedicated DB' }
                ].map((p) => (
                  <button
                    key={p.tier}
                    type="button"
                    onClick={() => setFormData({ 
                      ...formData, 
                      plan_tier: p.tier, 
                      max_students: p.students, 
                      max_staff: p.staff 
                    })}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      formData.plan_tier === p.tier
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase text-indigo-700">{p.tier}</span>
                      {formData.plan_tier === p.tier && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <div className="text-base font-black text-slate-900">{p.price}</div>
                    <p className="text-[11px] text-slate-500 mt-1">{p.desc}</p>
                    <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-600 font-semibold space-y-1">
                      <div>👥 Up to {p.students.toLocaleString()} Students</div>
                      <div>👨‍🏫 Up to {p.staff} Faculty/Staff</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Initial Admin Account */}
          {step === 7 && (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="text-center pb-2">
                <h3 className="text-xl font-black text-slate-900">Step 7: Super Admin / Principal Account</h3>
                <p className="text-xs text-slate-500 mt-1">Credentials for the school's principal or executive administrator to log in.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Principal / Executive Name *
                  </label>
                  <input
                    type="text"
                    value={formData.admin_name}
                    onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                    placeholder="e.g. Dr. Ramakant Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Admin Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.admin_email}
                      onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                      placeholder="principal@school.edu"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Default Master Password *
                    </label>
                    <input
                      type="password"
                      value={formData.admin_pass}
                      onChange={(e) => setFormData({ ...formData, admin_pass: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Review & Provision */}
          {step === 8 && !provisionSuccess && (
            <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="text-center pb-2">
                <h3 className="text-xl font-black text-slate-900">Step 8: Confirm & Provision Instance</h3>
                <p className="text-xs text-slate-500 mt-1">Review the white-label configuration before automatic provisioning.</p>
              </div>

              {/* Review Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                  <img 
                    src={formData.logo_url} 
                    alt="Logo" 
                    className="w-14 h-14 rounded-2xl object-contain bg-white border p-1"
                  />
                  <div>
                    <h4 className="text-base font-black text-slate-900">{formData.school_name}</h4>
                    <p className="text-xs text-indigo-700 font-mono font-semibold">
                      https://{formData.subdomain}.nairee.app
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800">
                      {formData.plan_tier} Plan &bull; {formData.enabled_features.length} Modules Active
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">School Code</span>
                    <span className="font-bold text-slate-800">{formData.school_code}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Board</span>
                    <span className="font-semibold text-slate-800">{formData.board_affiliation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Theme Primary</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: formData.primary_color }}></span>
                      <span className="font-mono text-[11px]">{formData.primary_color}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Capacity</span>
                    <span className="font-semibold text-slate-800">{formData.max_students} Students</span>
                  </div>
                </div>

                {/* Certificate Defaults Summary */}
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <div className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Configured Certificate & Document Presets</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Transfer Certificate</span>
                      <span className="font-bold text-slate-800 truncate block">
                        {TC_TEMPLATES_ONBOARDING.find(t => t.id === formData.default_tc_template)?.title || 'Traditional Heritage'}
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Appreciation Award</span>
                      <span className="font-bold text-slate-800 truncate block">
                        {APPRECIATION_TEMPLATES_ONBOARDING.find(t => t.id === formData.default_appreciation_template)?.title || 'Emerald Rosette'}
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Student ID Card</span>
                      <span className="font-bold text-slate-800 truncate block">
                        {ID_CARD_TEMPLATES_ONBOARDING.find(t => t.id === formData.default_id_card_template)?.title || 'Navy Hexagon'}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 italic">
                    Principal Signatory: <strong>{formData.principal_name}</strong> ({formData.principal_title})
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Automated Multi-Tenant Partitioning & Certificate Sync:</span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Clicking "Provision School Now" creates the tenant record, locks in certificate styling presets, configures Row-Level Isolation (RLS), and registers subdomain routing immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Provision Success View */}
          {provisionSuccess && (
            <div className="text-center py-8 space-y-6 max-w-md mx-auto animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">Instance Successfully Provisioned!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  <strong>{provisionedTenant?.school_name}</strong> is live and ready for staff & student logins with custom certificate styling pre-configured.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subdomain URL:</span>
                  <span className="font-mono font-bold text-indigo-600">https://{provisionedTenant?.subdomain}.nairee.app</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tenant ID:</span>
                  <span className="font-mono font-semibold">{provisionedTenant?.tenant_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Modules:</span>
                  <span className="font-semibold text-emerald-700">{provisionedTenant?.enabled_features?.length} Enabled</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5">
                  <span className="text-slate-500">Default TC Design:</span>
                  <span className="font-semibold text-amber-900">{provisionedTenant?.default_tc_template || 'Traditional Heritage'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLaunchInstance}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Switch to {provisionedTenant?.school_code || 'This School'} Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Bottom Navigation */}
        {!provisionSuccess && (
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                step === 1 
                  ? 'border-transparent text-slate-400 cursor-not-allowed' 
                  : 'border-slate-300 text-slate-700 hover:bg-white cursor-pointer'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2">
              {step < 8 ? (
                <button
                  type="button"
                  disabled={step === 1 && !formData.school_name.trim()}
                  onClick={() => setStep(prev => Math.min(8, prev + 1))}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isProvisioning}
                  onClick={handleFinishProvisioning}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isProvisioning ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Provisioning School Instance...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-yellow-300" />
                      <span>Provision School Now</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
