import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageSquare,
  PlayCircle,
  Award,
  Calendar,
  Bus,
  FileText,
  CheckCircle2,
  Clock,
  CreditCard,
  AlertTriangle,
  Send,
  Download,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  ArrowRightLeft,
  X,
  UserCheck,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Database,
  QrCode,
  Smartphone,
  School,
  TrendingUp,
  Package,
  Briefcase,
  Building2,
  Plus
} from 'lucide-react';
import naireeLogo from '../assets/nairee-logo.png';
import webMobileQr from '../assets/web_mobile_qr.png';
import { api, subscribeLiveEvents } from '../api.js';
import { FALLBACK_DATA } from '../fallbackData.js';
import { useTenant } from '../context/TenantContext.jsx';
import TenantOnboardingModal from './TenantOnboardingModal.jsx';
import TenantSwitchModal from './TenantSwitchModal.jsx';

const TAB_FEATURE_MAPPING = {
  homework: 'homework',
  materials: 'academics',
  messages: 'communication',
  communication: 'communication',
  timetable: 'timetable',
  results: 'gradebook',
  progress: 'gradebook',
  transport: 'transport',
  attendance: 'attendance',
  syllabus: 'academics',
  database: 'database',
  fees: 'fees',
  class_manager: 'academics',
  tc_generator: 'transfer_certificates',
  financial_pl: 'fees',
  students: 'academics',
  teachers: 'academics',
  accounts: 'academics',
  announcements: 'communication',
  inventory_mgmt: 'academics',
  alumni_mgmt: 'academics',
  reports: 'reports'
};

const NAV_CONFIG = {
  student: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'homework', label: 'Assignment', icon: BookOpen },
    { id: 'materials', label: 'Teachers', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'timetable', label: 'Live classrooms', icon: PlayCircle },
    { id: 'results', label: 'Exams', icon: Award },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'transport', label: 'Bus & Route', icon: Bus },
  ],
  teacher: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: UserCheck },
    { id: 'homework', label: 'Multi-Class HW', icon: BookOpen },
    { id: 'syllabus', label: 'Syllabus', icon: CheckCircle2 },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'materials', label: 'Study Notes', icon: FileText },
    { id: 'messages', label: 'Parent Chat', icon: MessageSquare },
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'database', label: 'School Records', icon: Database },
    { id: 'fees', label: 'Fee Governance', icon: CreditCard },
    { id: 'class_manager', label: 'Class & Staff Manager', icon: School },
    { id: 'tc_generator', label: 'Document Generator', icon: Award },
    { id: 'financial_pl', label: 'Executive P&L Analytics', icon: TrendingUp },
    { id: 'students', label: 'Student Performance', icon: AlertTriangle },
    { id: 'teachers', label: 'Teacher Workload', icon: BookOpen },
    { id: 'accounts', label: 'Accounts & Logins', icon: Users },
    { id: 'announcements', label: 'Announcements', icon: Send },
    { id: 'inventory_mgmt', label: 'Lab & Asset Tracker', icon: Package },
    { id: 'alumni_mgmt', label: 'Alumni Mentorship Hub', icon: Briefcase },
    { id: 'reports', label: 'Reports & Exports', icon: Download },
  ],
  parent: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'progress', label: 'Academic Grades', icon: Award },
    { id: 'attendance', label: 'Attendance', icon: UserCheck },
    { id: 'fees', label: 'Fees & Payment', icon: CreditCard },
    { id: 'syllabus', label: 'Live Syllabus', icon: CheckCircle2 },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'transport', label: 'Bus Route', icon: Bus },
    { id: 'communication', label: 'Messages', icon: MessageSquare },
  ]
};

const SAMPLE_NOTIFICATIONS = [
  // Nairee International School (tenant-default)
  {
    id: 'sn-nis-1',
    tenant_id: 'tenant-default',
    title: 'Due to heavy rainfall next 2 days (December 10 & 11) holidays',
    category: 'Weather Circular',
    time: '2 hours ago',
    unread: true
  },
  {
    id: 'sn-nis-2',
    tenant_id: 'tenant-default',
    title: 'Mid-term examination schedule released for Grades 9 through 12',
    category: 'Academics',
    time: '5 hours ago',
    unread: true
  },
  {
    id: 'sn-nis-3',
    tenant_id: 'tenant-default',
    title: 'Parent-Teacher interactive conference registrations open',
    category: 'Administration',
    time: '1 day ago',
    unread: true
  },
  {
    id: 'sn-nis-4',
    tenant_id: 'tenant-default',
    title: 'Annual Science Exhibition & STEM robotics project entries due',
    category: 'Events',
    time: '2 days ago',
    unread: false
  },
  {
    id: 'sn-nis-5',
    tenant_id: 'tenant-default',
    title: 'New homework assigned in Mathematics & English literature',
    category: 'Homework',
    time: '3 days ago',
    unread: false
  },
  {
    id: 'sn-nis-6',
    tenant_id: 'tenant-default',
    title: 'North City Express Route 04 school bus timing updated',
    category: 'Transport',
    time: '3 days ago',
    unread: false
  },
  {
    id: 'sn-nis-7',
    tenant_id: 'tenant-default',
    title: 'Term 1 tuition fee remittance window closes this Friday',
    category: 'Finance',
    time: '4 days ago',
    unread: false
  },

  // Delhi Public School, Ranchi (dps-ranchi)
  {
    id: 'sn-dps-1',
    tenant_id: 'dps-ranchi',
    title: 'DPS Ranchi: Annual Athletic Meet & Inter-House Football Trials this Friday',
    category: 'Sports Circular',
    time: '1 hour ago',
    unread: true
  },
  {
    id: 'sn-dps-2',
    tenant_id: 'dps-ranchi',
    title: 'DPS Ranchi: CBSE Class 10 & 12 Pre-Board Timetable and Project Guidelines Released',
    category: 'Academics',
    time: '3 hours ago',
    unread: true
  },
  {
    id: 'sn-dps-3',
    tenant_id: 'dps-ranchi',
    title: 'DPS Ranchi: School Bus Route 08 (Dhurwa & Sail Township) Morning Timing Revised',
    category: 'Transport',
    time: '1 day ago',
    unread: false
  },

  // St. Xavier's Senior Academy (st-xaviers)
  {
    id: 'sn-sxa-1',
    tenant_id: 'st-xaviers',
    title: 'St. Xavier\'s: Annual Diocesan Cultural Festival & Carol Choir Auditions Open',
    category: 'Cultural Circular',
    time: '2 hours ago',
    unread: true
  },
  {
    id: 'sn-sxa-2',
    tenant_id: 'st-xaviers',
    title: 'St. Xavier\'s: ICSE & ISC Laboratory Practical Assessment Schedule Published',
    category: 'Academics',
    time: '5 hours ago',
    unread: false
  },

  // Greenfield Global School (greenfield-global)
  {
    id: 'sn-ggs-1',
    tenant_id: 'greenfield-global',
    title: 'Greenfield Global: Cambridge IGCSE Mock Assessment Series Timetable Announced',
    category: 'Cambridge Academics',
    time: '1 hour ago',
    unread: true
  },
  {
    id: 'sn-ggs-2',
    tenant_id: 'greenfield-global',
    title: 'Greenfield Global: STEM Innovation Robotics Expo & Global University Fair',
    category: 'STEM & Career Hub',
    time: '1 day ago',
    unread: false
  }
];

const getReadNotifIds = () => {
  try {
    const raw = localStorage.getItem('nairee_read_notification_ids');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveAllReadNotifIds = (ids) => {
  try {
    const existing = getReadNotifIds();
    const updated = Array.from(new Set([...existing, ...ids.map(String)]));
    localStorage.setItem('nairee_read_notification_ids', JSON.stringify(updated));
  } catch (e) {
    console.warn(e);
  }
};

const isNotificationForUser = (item, currentUser, currentTenant) => {
  // 0. Tenant Data Isolation: Verify announcement belongs strictly to active tenant
  const activeTenantId = currentTenant?.tenant_id || 'tenant-default';
  const itemTenantId = item.tenant_id || 'tenant-default';
  if (itemTenantId !== 'all_tenants' && itemTenantId !== activeTenantId) {
    return false;
  }

  if (!currentUser) return true;
  const userRole = (currentUser.role || '').toLowerCase();
  const userName = (currentUser.full_name || currentUser.student_name || '').toLowerCase();
  const username = (currentUser.username || '').toLowerCase();

  // 1. Role-based targeting
  if (item.target_role && item.target_role !== 'All' && item.target_role !== 'all') {
    const roles = Array.isArray(item.target_role) 
      ? item.target_role.map(r => r.toLowerCase()) 
      : [item.target_role.toLowerCase()];
    if (!roles.includes(userRole) && userRole !== 'admin') {
      return false;
    }
  }

  // 2. Personal Student / Parent Privacy Protection
  // If notification is about personal Fee dues, receipts, or Absent attendance:
  if (item.student_name || item.target_student) {
    const targetStudent = (item.student_name || item.target_student).toLowerCase();
    
    // Principal & Admin can supervise all records
    if (userRole === 'admin') return true;

    // Student sees only their own personal records
    if (userRole === 'student') {
      if (!userName.includes(targetStudent) && !targetStudent.includes(userName) && !username.includes(targetStudent)) {
        return false;
      }
    }

    // Parent sees only their own child's personal records
    if (userRole === 'parent') {
      const childName = (currentUser.child_name || 'nairee').toLowerCase();
      if (!childName.includes(targetStudent) && !targetStudent.includes(childName)) {
        return false;
      }
    }

    // Teachers do not see private family tuition fee notices
    if (userRole === 'teacher' && (item.category === 'Finance' || item.category === 'Fee Due')) {
      return false;
    }
  }

  return true;
};

export default function AppLayout({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onSwitchUser,
  onOpenPalette,
  children
}) {
  const { 
    tenant, 
    isMasterTenant, 
    isFeatureEnabled, 
    isOnboardingModalOpen,
    setIsOnboardingModalOpen, 
    isSwitchModalOpen,
    setIsSwitchModalOpen 
  } = useTenant();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showNoticesModal, setShowNoticesModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [liveToast, setLiveToast] = useState(null);
  const lastKnownIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  const [notifications, setNotifications] = useState(() => {
    const readIds = getReadNotifIds();
    return SAMPLE_NOTIFICATIONS.map(s => ({
      ...s,
      unread: !readIds.includes(String(s.id)) && s.unread
    })).filter(n => isNotificationForUser(n, user, tenant));
  });
  const dropdownRef = useRef(null);

  // Filter navigation items based on Tenant Enabled Features
  const rawNavItems = NAV_CONFIG[user?.role] || NAV_CONFIG.student;
  const navItems = rawNavItems.filter(item => {
    if (item.id === 'dashboard') return true;
    const featureKey = TAB_FEATURE_MAPPING[item.id];
    if (!featureKey) return true;
    return isFeatureEnabled(featureKey);
  });

  // Sync live announcements into notifications with strict user privacy & tenant isolation filters
  const loadLiveNotifications = async () => {
    try {
      const readIds = getReadNotifIds();
      const currentTenantId = tenant?.tenant_id || 'tenant-default';
      const annList = await api.getAnnouncements(user?.role || 'all', currentTenantId).catch(() => []);
      const fallbackList = (FALLBACK_DATA.announcements || []).filter(a => (a.tenant_id || 'tenant-default') === currentTenantId || a.tenant_id === 'all_tenants');
      const activeList = annList && annList.length > 0 ? annList : fallbackList;

      const combined = activeList.map((ann, idx) => {
        const id = ann.id || `ann_${idx}`;
        return {
          id: id,
          tenant_id: ann.tenant_id || currentTenantId,
          title: ann.title,
          content: ann.content || '',
          category: ann.category || 'Announcement',
          target_role: ann.target_role || 'All',
          target_student: ann.target_student || ann.student_name || null,
          time: ann.created_at || 'Just now',
          unread: !readIds.includes(String(id))
        };
      });

      const samples = SAMPLE_NOTIFICATIONS.filter(s => (s.tenant_id || 'tenant-default') === currentTenantId).map(s => ({
        ...s,
        unread: !readIds.includes(String(s.id)) && s.unread
      }));

      const allMerged = [
        ...combined,
        ...samples.filter(s => !combined.some(c => c.title === s.title))
      ];

      // Filter strictly for the logged-in user's role and personal identity and active tenant
      const userFiltered = allMerged.filter(item => isNotificationForUser(item, user, tenant));

      // If a new unread notice for this user drops in real-time, show animated live toast!
      if (!isInitialLoadRef.current) {
        const newlyAdded = userFiltered.find(item => item.unread && !lastKnownIdsRef.current.has(String(item.id)));
        if (newlyAdded) {
          setLiveToast({
            title: newlyAdded.title,
            category: newlyAdded.category || 'Live Notice',
            content: newlyAdded.content || '',
            id: newlyAdded.id
          });
          setTimeout(() => setLiveToast(null), 7000);
        }
      }

      userFiltered.forEach(item => lastKnownIdsRef.current.add(String(item.id)));
      isInitialLoadRef.current = false;

      setNotifications(userFiltered);
    } catch (err) {
      console.warn('Error syncing notifications with announcements:', err);
    }
  };

  useEffect(() => {
    loadLiveNotifications();

    // 1. Subscribe to real-time events across tabs & in-app with tenant check
    const unsubscribe = subscribeLiveEvents((event) => {
      loadLiveNotifications();
      if (event?.type === 'announcement_created' && event?.payload) {
        const currentTenantId = tenant?.tenant_id || 'tenant-default';
        const noticeTenantId = event.payload.tenant_id || 'tenant-default';
        if (noticeTenantId === currentTenantId || noticeTenantId === 'all_tenants') {
          setLiveToast({
            title: event.payload.title,
            category: event.payload.category || 'Broadcast Circular',
            content: event.payload.content || '',
            id: event.payload.id
          });
          setTimeout(() => setLiveToast(null), 7000);
        }
      }
    });

    // 2. High-frequency 2.5s live polling heartbeat (Zero-refresh real-time sync)
    const pollTimer = setInterval(() => {
      loadLiveNotifications();
    }, 2500);

    return () => {
      unsubscribe();
      clearInterval(pollTimer);
    };
  }, [user, tenant]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(prev => {
      const allIds = prev.map(n => String(n.id));
      saveAllReadNotifIds(allIds);
      return prev.map(n => ({ ...n, unread: false }));
    });
  };

  const markSingleAsRead = (id) => {
    saveAllReadNotifIds([String(id)]);
    setNotifications(prev => prev.map(n => String(n.id) === String(id) ? { ...n, unread: false } : n));
  };

  const triggerLiveDemoPing = () => {
    const titles = [
      '🔥 LIVE ALERT: Annual Inter-School Tech & Sports Championship dates officially declared!',
      '🔴 FLASH CIRCULAR: Science Olympiad registrations extended till Sunday evening',
      '🌦️ WEATHER UPDATE: School transport timing updated due to heavy rain forecast',
      '📝 ACADEMICS: Revised Mid-Term Mathematics sample question papers released',
      '🏆 SPORTS: Annual Athletic Meet selections start Friday at Main Ground'
    ];
    const pickedTitle = titles[Math.floor(Math.random() * titles.length)];
    const currentTenantId = tenant?.tenant_id || 'tenant-default';
    const newNotice = {
      id: `ANN-LIVE-${Date.now()}`,
      tenant_id: currentTenantId,
      title: pickedTitle,
      content: 'Official circular broadcasted live from Principal Office. All students, teachers, and parents please take note.',
      category: 'Live Broadcast',
      created_at: 'Just now',
      sender: `Office of the Principal (${tenant?.school_name || 'School'})`
    };

    // Add to API and broadcast across tabs
    api.createAnnouncement(newNotice);

    // Trigger immediate local toast & notifications
    setLiveToast({
      title: newNotice.title,
      category: newNotice.category,
      content: newNotice.content,
      id: newNotice.id
    });
    setTimeout(() => setLiveToast(null), 8000);
    loadLiveNotifications();
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex font-sans text-slate-800">
      
      {/* 1. LEFT SIDEBAR (Desktop Fixed, Mobile Slide-Over) */}
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* White-Label School Brand Header in Sidebar */}
          <div className="flex items-center justify-between px-2 mb-6">
            <div 
              className={`flex items-center gap-2.5 min-w-0 ${
                isMasterTenant ? 'cursor-pointer hover:opacity-90 transition-opacity' : 'cursor-default'
              }`}
              onClick={isMasterTenant ? () => setIsSwitchModalOpen(true) : undefined}
              title={isMasterTenant ? "Click to switch white-label school instance" : undefined}
            >
              <img
                src={tenant?.logo_url || naireeLogo}
                alt={tenant?.school_name || 'Nairee School ERP'}
                className="h-9 w-9 object-contain rounded-xl border border-slate-200/80 bg-white p-1 shadow-xs shrink-0"
                onError={(e) => { e.target.src = naireeLogo; }}
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-xs font-black text-slate-800 truncate leading-tight">
                  {tenant?.school_name || 'Nairee School'}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span 
                    className="text-[9px] font-black text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs shrink-0"
                    style={{ backgroundColor: tenant?.accent_color || '#10b981' }}
                  >
                    {tenant?.school_code || 'ERP'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 truncate">
                    {isMasterTenant ? 'Master Platform' : (tenant?.board_affiliation?.split('#')[0]?.trim() || 'School Portal')}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items Stack with Dynamic Active Brand Pill */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    backgroundColor: isActive ? (tenant?.primary_color || '#00a884') : undefined
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-100 px-2 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">&copy; {new Date().getFullYear()} {tenant?.school_name?.split(' ')[0] || 'Nairee'}</span>
            <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-600">
              {tenant?.plan_tier || 'SaaS'}
            </span>
          </div>
          <div className="text-[10px] text-teal-700 font-semibold truncate flex items-center justify-between">
            <span className="truncate">{user?.full_name} ({user?.role?.toUpperCase()})</span>
            {isMasterTenant ? (
              <button 
                onClick={() => setIsSwitchModalOpen(true)}
                className="text-[10px] text-indigo-600 hover:underline font-bold cursor-pointer shrink-0 ml-1"
              >
                Switch
              </button>
            ) : (
              <button 
                onClick={() => window.location.href = window.location.pathname}
                className="text-[10px] text-indigo-600 hover:underline font-bold cursor-pointer shrink-0 ml-1"
                title="Return to master platform"
              >
                Master
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Notification Banner when switched to a client school tenant */}
        {!isMasterTenant && (
          <div className="bg-slate-800 text-white px-4 sm:px-6 py-2 flex items-center justify-between text-xs font-semibold shadow-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="truncate">
                Viewing <b>{tenant?.school_name}</b> ({tenant?.subdomain}.nairee.app)
              </span>
            </div>
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('tenant');
                window.location.href = url.pathname;
              }}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all cursor-pointer shrink-0 ml-2"
            >
              &larr; Back to Master Platform
            </button>
          </div>
        )}

        {/* Top Header Bar matching media_1790863408009.png */}
        <header className="px-4 sm:px-6 py-4 sm:py-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-transparent">
          {/* Left: Hamburger (mobile) + Greeting */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
            {/* 3-Dash Circular Hamburger Button for Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#d7dfe9] hover:bg-[#cbd5e1] border border-slate-300 flex flex-col items-center justify-center gap-[4px] cursor-pointer shadow-sm active:scale-95 shrink-0"
              title="Open Navigation Menu"
            >
              <span className="w-5 h-[3px] bg-[#111827] rounded-full"></span>
              <span className="w-5 h-[3px] bg-[#111827] rounded-full"></span>
              <span className="w-5 h-[3px] bg-[#111827] rounded-full"></span>
            </button>

            {/* Greeting */}
            <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-slate-800 tracking-tight truncate">
              Welcome back <span style={{ color: tenant?.primary_color || '#00a884' }}>{user?.full_name || user?.username || 'User'}!</span>
            </h1>
          </div>

          {/* Right: Tenant Switcher + Onboard + DB Studio + Search + Notification Bell + Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Master Platform Only Controls (Hidden on Client School Websites) */}
            {isMasterTenant && (
              <>
                <button
                  onClick={() => setIsSwitchModalOpen(true)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  title="Switch School Tenant Instance"
                >
                  <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="hidden sm:inline">{tenant?.school_code || 'Schools'}</span>
                </button>

                {user?.role === 'admin' && (
                  <button
                    onClick={() => setIsOnboardingModalOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
                    title="Onboard New White-Label School"
                  >
                    <Plus className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="hidden sm:inline">+ Onboard School</span>
                    <span className="sm:hidden">+ School</span>
                  </button>
                )}
              </>
            )}

            {/* Quick School Records Button (ADMIN ONLY) */}
            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('database')}
                className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'database'
                    ? 'bg-[#00a884] text-white border-[#00a884] shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
                }`}
                title="Open School Records"
              >
                <Database className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden lg:inline">Records</span>
              </button>
            )}

            {/* Mobile App Scan QR Button */}
            <button
              onClick={() => setShowQrModal(true)}
              className="hidden sm:flex px-3 py-1.5 rounded-full border border-indigo-200 bg-indigo-50/90 hover:bg-indigo-100 text-indigo-700 text-xs font-bold items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Open Mobile App QR Code & Setup"
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              <span>Mobile</span>
            </button>

            {/* Search Icon Button */}
            <button
              onClick={onOpenPalette}
              className="w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
              title="Search commands (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Bell with Dynamic Unread Badge */}
            <button
              onClick={() => {
                setShowNoticesModal(true);
                markAllAsRead();
              }}
              className="relative w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
              title="Notifications & Circulars"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-sm border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Avatar Capsule with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 shadow-sm transition-all cursor-pointer"
              >
                <img
                  src={user?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user?.full_name}
                  className="w-7 h-7 rounded-full object-cover border border-teal-500"
                />
                <span className="text-xs font-bold text-slate-800 hidden sm:inline truncate max-w-[160px]">
                  {user?.full_name || user?.username}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-3 z-50 animate-fadeIn">
                  {/* Active User Card */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                    <div className="text-xs font-bold text-slate-800">{user?.full_name}</div>
                    <div className="text-[11px] text-teal-700 font-mono font-semibold">@{user?.username}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold uppercase">
                      {user?.role} Portal
                    </span>
                  </div>

                  {/* Switch Role Quick Switcher */}
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Instant Switch Role (Demo)
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 my-1">
                    <button
                      onClick={() => { onSwitchUser('student_emma', 'student123'); setIsProfileDropdownOpen(false); }}
                      className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-teal-50 hover:text-teal-800 text-[11px] font-bold text-left transition-colors cursor-pointer"
                    >
                      🎓 Student
                    </button>
                    <button
                      onClick={() => { onSwitchUser('teacher_sarah', 'teacher123'); setIsProfileDropdownOpen(false); }}
                      className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-teal-50 hover:text-teal-800 text-[11px] font-bold text-left transition-colors cursor-pointer"
                    >
                      👩‍🏫 Teacher
                    </button>
                    <button
                      onClick={() => { onSwitchUser('admin', 'admin123'); setIsProfileDropdownOpen(false); }}
                      className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-teal-50 hover:text-teal-800 text-[11px] font-bold text-left transition-colors cursor-pointer"
                    >
                      🛡️ Principal
                    </button>
                    <button
                      onClick={() => { onSwitchUser('parent_roberts', 'parent123'); setIsProfileDropdownOpen(false); }}
                      className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-teal-50 hover:text-teal-800 text-[11px] font-bold text-left transition-colors cursor-pointer"
                    >
                      👨‍👩‍👧 Parent
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="pt-2 border-t border-slate-100 mt-2">
                    <button
                      onClick={() => { onLogout(); setIsProfileDropdownOpen(false); }}
                      className="w-full py-2 px-3 rounded-xl hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Render Area */}
        <main className="flex-1 px-6 pb-8">
          {children}
        </main>
      </div>

      {/* REAL-TIME FLOATING LIVE TOAST (Zero-Refresh Instant Notification) */}
      {liveToast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-teal-500/40 p-4 animate-bounce flex items-start gap-3.5 transition-all">
          <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-500/30 animate-pulse">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                {liveToast.category || 'Live Update'}
              </span>
              <span className="text-[10px] text-teal-600 font-bold animate-pulse">● Live Now</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">{liveToast.title}</h4>
            {liveToast.content && (
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{liveToast.content}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => {
                  setLiveToast(null);
                  setShowNoticesModal(true);
                  markAllAsRead();
                }}
                className="text-[11px] font-bold text-teal-600 hover:text-teal-700 underline cursor-pointer flex items-center gap-1"
              >
                <span>Open Notice</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
          <button
            onClick={() => setLiveToast(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. NOTIFICATIONS MODAL (Triggered by Bell Icon) */}
      {showNoticesModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowNoticesModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">School Notices & Notifications</h3>
                  <p className="text-xs text-slate-400">
                    {unreadCount > 0 ? `${unreadCount} unread announcements` : 'All announcements caught up'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Mark All as Read
                  </button>
                )}
                <button
                  onClick={() => setShowNoticesModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[60vh]">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No notifications right now.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markSingleAsRead(n.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      n.unread 
                        ? 'bg-teal-50/60 border-teal-300 shadow-xs' 
                        : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-teal-800 border border-teal-200">
                          {n.category}
                        </span>
                        {n.unread && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">{n.title}</h4>
                    {n.content && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{n.content}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  markAllAsRead();
                  setShowNoticesModal(false);
                  setActiveTab('announcements');
                }}
                className="text-teal-700 hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Notice Board</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  markAllAsRead();
                  setShowNoticesModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile App QR Code Modal */}
      {showQrModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowQrModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Nairee Mobile App</h3>
                  <p className="text-xs text-slate-400">Scan with phone camera or browser</p>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Image */}
            <div className="flex flex-col items-center justify-center py-2 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={webMobileQr}
                alt="Nairee Mobile Direct QR Code"
                className="w-56 h-56 rounded-xl shadow-md bg-white p-2"
              />
              <span className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ✅ Direct Mobile App (0 Installs Required)
              </span>
            </div>

            <div className="text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
              <p className="font-bold text-slate-800">📱 How to open & install on your phone:</p>
              <p>1. Open your phone's <b>Camera</b> or <b>Chrome/Safari</b>.</p>
              <p>2. Point camera at the QR code above or type:</p>
              <p><code className="bg-white px-2 py-1 rounded border border-slate-200 font-mono text-[11px] text-teal-700 font-bold block text-center">http://192.168.29.29:5173</code></p>
              <p className="text-[11px] text-slate-500 pt-1">
                💡 <b>Install to Home Screen</b>: In your mobile browser, tap <b>Menu (⋮)</b> &rarr; <b>Add to Home Screen</b>.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setShowQrModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#009172] text-white font-bold text-xs shadow-md shadow-teal-500/20"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
