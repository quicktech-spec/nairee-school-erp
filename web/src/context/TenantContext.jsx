import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, teardownRealtimeAndSession } from '../supabaseClient.js';
import { subscribeLiveEvents, broadcastLiveEvent, getStoredDb, saveStoredDb } from '../api.js';

const TenantContext = createContext(null);

export const DEFAULT_TENANTS = [
  {
    tenant_id: 'tenant-default',
    school_name: 'Nairee International School',
    school_code: 'NIS',
    subdomain: 'demo',
    custom_domain: '',
    logo_url: '/nairee-logo.png',
    logo_white_url: '/nairee-logo-white.png',
    favicon_url: '/favicon.ico',
    primary_color: '#5673ec',
    secondary_color: '#6c8cff',
    accent_color: '#10b981',
    bg_gradient: 'from-[#5673ec] via-[#6c8cff] to-[#5673ec]',
    tagline: 'Excellence in Connected Global Education',
    board_affiliation: 'CBSE Affiliated #1930481',
    address: 'Indiranagar Main Road, Bengaluru, Karnataka - 560038',
    phone: '+91 98765 00000',
    email: 'admissions@nairee.edu',
    plan_tier: 'Enterprise',
    max_students: 2500,
    max_staff: 150,
    enabled_features: [
      'academics', 'attendance', 'fees', 'gradebook', 'timetable', 'homework', 'library', 'transport', 'communication', 'payroll', 'reports', 'database', 'parent_portal', 'student_portal', 'teacher_portal', 'id_cards', 'transfer_certificates'
    ],
    status: 'Active',
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    tenant_id: 'dps-ranchi',
    school_name: 'Delhi Public School, Ranchi',
    school_code: 'DPS',
    subdomain: 'dps-ranchi',
    custom_domain: 'erp.dpsranchi.com',
    logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150',
    logo_white_url: '',
    favicon_url: '',
    primary_color: '#006633',
    secondary_color: '#009944',
    accent_color: '#eab308',
    bg_gradient: 'from-[#006633] via-[#009944] to-[#006633]',
    tagline: 'Service Before Self • CBSE Affiliated #3430012',
    board_affiliation: 'CBSE Affiliated #3430012',
    address: 'Sail Township, Dhurwa, Ranchi, Jharkhand - 834004',
    phone: '+91 651 244 1125',
    email: 'info@dpsranchi.com',
    plan_tier: 'Enterprise',
    max_students: 4000,
    max_staff: 220,
    enabled_features: [
      'academics', 'attendance', 'fees', 'gradebook', 'timetable', 'homework', 'library', 'transport', 'communication', 'payroll', 'reports', 'database', 'parent_portal', 'student_portal', 'teacher_portal', 'id_cards', 'transfer_certificates'
    ],
    status: 'Active',
    created_at: '2024-03-15T10:30:00.000Z'
  },
  {
    tenant_id: 'st-xaviers',
    school_name: "St. Xavier's Senior Academy",
    school_code: 'SXA',
    subdomain: 'st-xaviers',
    custom_domain: 'portal.stxaviers.org',
    logo_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150',
    logo_white_url: '',
    favicon_url: '',
    primary_color: '#800020',
    secondary_color: '#b91c1c',
    accent_color: '#f59e0b',
    bg_gradient: 'from-[#800020] via-[#991b1b] to-[#800020]',
    tagline: 'Lucet et Ardet • Catholic Diocesan Board',
    board_affiliation: 'ICSE & ISC Affiliated #KA042',
    address: 'Museum Road, Shanthala Nagar, Bengaluru - 560001',
    phone: '+91 80 2221 0044',
    email: 'office@stxaviers.org',
    plan_tier: 'Standard',
    max_students: 1800,
    max_staff: 95,
    enabled_features: [
      'academics', 'attendance', 'fees', 'gradebook', 'timetable', 'homework', 'communication', 'reports', 'parent_portal', 'student_portal', 'teacher_portal', 'id_cards'
    ],
    status: 'Active',
    created_at: '2024-05-10T14:00:00.000Z'
  },
  {
    tenant_id: 'greenfield-global',
    school_name: 'Greenfield Global School',
    school_code: 'GGS',
    subdomain: 'greenfield',
    custom_domain: '',
    logo_url: 'https://images.unsplash.com/photo-1594498653385-d5172c532c00?w=150',
    logo_white_url: '',
    favicon_url: '',
    primary_color: '#0284c7',
    secondary_color: '#0ea5e9',
    accent_color: '#10b981',
    bg_gradient: 'from-[#0284c7] via-[#0ea5e9] to-[#0284c7]',
    tagline: 'Empowering Future Leaders with STEM & Innovation',
    board_affiliation: 'Cambridge International (IGCSE)',
    address: 'Sarjapur Road, Outer Ring Road Junction, Bengaluru - 560103',
    phone: '+91 80 4910 2000',
    email: 'hello@greenfieldglobal.edu',
    plan_tier: 'Premium',
    max_students: 1200,
    max_staff: 80,
    enabled_features: [
      'academics', 'attendance', 'fees', 'gradebook', 'timetable', 'homework', 'library', 'reports', 'parent_portal', 'student_portal', 'teacher_portal'
    ],
    status: 'Active',
    created_at: '2024-06-01T09:00:00.000Z'
  },
  {
    tenant_id: 'bishop-cotton',
    school_name: "Bishop Cotton Boys' School",
    school_code: 'BCS',
    subdomain: 'bishop-cotton',
    custom_domain: '',
    logo_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=150',
    logo_white_url: '',
    favicon_url: '',
    primary_color: '#4c0519',
    secondary_color: '#9f1239',
    accent_color: '#eab308',
    bg_gradient: 'from-[#4c0519] via-[#9f1239] to-[#4c0519]',
    tagline: 'Nec Dextra Nec Sinistra • Founded 1865',
    board_affiliation: 'ICSE & ISC Affiliated #KA001',
    address: 'St. Mark\'s Road, Residency Road, Bengaluru - 560001',
    phone: '+91 80 2221 3608',
    email: 'principal@cottonboys.com',
    plan_tier: 'Enterprise',
    max_students: 2800,
    max_staff: 175,
    enabled_features: [
      'academics', 'attendance', 'fees', 'gradebook', 'timetable', 'homework', 'library', 'transport', 'communication', 'payroll', 'reports', 'database', 'parent_portal', 'student_portal', 'teacher_portal', 'id_cards'
    ],
    status: 'Active',
    created_at: '2024-08-10T11:00:00.000Z'
  }
];

export function resolveSubdomainFromLocation() {
  if (typeof window === 'undefined') return 'demo';

  const params = new URLSearchParams(window.location.search);
  const queryTenant = params.get('tenant') || params.get('school') || params.get('subdomain');
  if (queryTenant) return queryTenant.toLowerCase();

  const hostname = window.location.hostname;
  if (hostname && !hostname.includes('github.io') && !hostname.includes('localhost') && hostname.includes('.')) {
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      return parts[0].toLowerCase();
    }
  }

  return 'demo';
}

export function resolveTenantFromLocation(tenantsList = DEFAULT_TENANTS) {
  const subdomain = resolveSubdomainFromLocation();
  const match = tenantsList.find(t => 
    t.tenant_id.toLowerCase() === subdomain || 
    t.subdomain.toLowerCase() === subdomain
  );
  return match || tenantsList[0];
}

export function TenantProvider({ children }) {
  const [tenantsList, setTenantsList] = useState(() => {
    if (typeof localStorage === 'undefined') return DEFAULT_TENANTS;
    try {
      const saved = localStorage.getItem('nairee_tenants_store');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_TENANTS;
  });

  const [activeTenant, setActiveTenant] = useState(() => resolveTenantFromLocation(tenantsList));
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isBrandingLoading, setIsBrandingLoading] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);

  // Fetch Public Branding
  const loadBrandingForSubdomain = useCallback(async (subdomain) => {
    try {
      setIsBrandingLoading(true);
      const { data, error } = await supabase.rpc('get_tenant_branding', {
        p_subdomain: subdomain || 'demo'
      });

      if (!error && data && data.length > 0) {
        const brand = data[0];
        setActiveTenant(prev => ({
          ...prev,
          school_name: brand.school_name || prev.school_name,
          logo_url: brand.logo_url || prev.logo_url,
          logo_white_url: brand.logo_white_url || prev.logo_white_url,
          primary_color: brand.primary_color || prev.primary_color,
          secondary_color: brand.secondary_color || prev.secondary_color,
          accent_color: brand.accent_color || prev.accent_color,
          tagline: brand.tagline || prev.tagline
        }));
      }
    } catch (err) {
      // Fallback
    } finally {
      setIsBrandingLoading(false);
    }
  }, []);

  useEffect(() => {
    const subdomain = resolveSubdomainFromLocation();
    loadBrandingForSubdomain(subdomain);
  }, [loadBrandingForSubdomain]);

  // Auth Lifecycle & Security
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        handleAuthSession(session);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await handleAuthSession(session);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [activeTenant.tenant_id]);

  const handleAuthSession = async (session) => {
    const user = session.user;
    setCurrentUser(user);

    const jwtTenantId = user.app_metadata?.tenant_id;
    const jwtRole = user.app_metadata?.role;

    if (jwtTenantId && activeTenant?.tenant_id && jwtTenantId !== activeTenant.tenant_id && activeTenant.tenant_id !== 'tenant-default') {
      setAuthError('Security Alert: Your account belongs to a different school domain. You have been signed out.');
      await supabase.auth.signOut();
      await teardownRealtimeAndSession();
      return;
    }

    setAuthError(null);

    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (profile) {
        setUserProfile({
          ...profile,
          role: jwtRole || profile.role || 'Admin'
        });
      } else {
        setUserProfile({
          auth_user_id: user.id,
          tenant_id: jwtTenantId || activeTenant.tenant_id,
          role: jwtRole || 'Admin'
        });
      }
    } catch (e) {
      setUserProfile({
        auth_user_id: user.id,
        tenant_id: jwtTenantId || activeTenant.tenant_id,
        role: jwtRole || 'Admin'
      });
    }
  };

  // Dynamic Theme Colors
  useEffect(() => {
    if (!activeTenant) return;

    try {
      const root = document.documentElement;
      root.style.setProperty('--tenant-primary', activeTenant.primary_color || '#5673ec');
      root.style.setProperty('--tenant-secondary', activeTenant.secondary_color || '#6c8cff');
      root.style.setProperty('--tenant-accent', activeTenant.accent_color || '#10b981');
      
      document.title = `${activeTenant.school_name} | Smart ERP System`;

      if (activeTenant.favicon_url) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = activeTenant.favicon_url;
      }
      localStorage.setItem('nairee_active_tenant_id', activeTenant.tenant_id);
    } catch (e) {}
  }, [activeTenant]);

  const switchTenant = async (tenantIdOrSubdomain) => {
    const match = tenantsList.find(t => 
      t.tenant_id === tenantIdOrSubdomain || 
      t.subdomain === tenantIdOrSubdomain
    );
    if (match) {
      await teardownRealtimeAndSession();
      setActiveTenant(match);
      loadBrandingForSubdomain(match.subdomain);

      const url = new URL(window.location.href);
      if (match.tenant_id === 'tenant-default') {
        url.searchParams.delete('tenant');
      } else {
        url.searchParams.set('tenant', match.subdomain || match.tenant_id);
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  const createTenant = (tenantData) => {
    const slug = (tenantData.subdomain || tenantData.school_name.toLowerCase().replace(/[^a-z0-9]/g, '-')).toLowerCase();
    const newTenant = {
      tenant_id: `tenant-${slug}`,
      school_name: tenantData.school_name,
      school_code: tenantData.school_code || slug.slice(0, 3).toUpperCase(),
      subdomain: slug,
      custom_domain: tenantData.custom_domain || '',
      logo_url: tenantData.logo_url || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150',
      logo_white_url: tenantData.logo_white_url || '',
      favicon_url: tenantData.favicon_url || '',
      primary_color: tenantData.primary_color || '#1e3a8a',
      secondary_color: tenantData.secondary_color || '#3b82f6',
      accent_color: tenantData.accent_color || '#10b981',
      bg_gradient: `from-[${tenantData.primary_color || '#1e3a8a'}] via-[${tenantData.secondary_color || '#3b82f6'}] to-[${tenantData.primary_color || '#1e3a8a'}]`,
      tagline: tenantData.tagline || 'Excellence in Connected Education',
      board_affiliation: tenantData.board_affiliation || 'CBSE Affiliated',
      address: tenantData.address || '',
      phone: tenantData.phone || '',
      email: tenantData.email || '',
      plan_tier: tenantData.plan_tier || 'Standard',
      max_students: tenantData.max_students || 2000,
      max_staff: tenantData.max_staff || 100,
      enabled_features: [
        'academics', 'attendance', 'fees', 'gradebook', 'timetable', 'homework', 'reports', 'parent_portal', 'student_portal', 'teacher_portal'
      ],
      status: 'Active',
      created_at: new Date().toISOString()
    };

    const updatedList = [...tenantsList.filter(t => t.tenant_id !== newTenant.tenant_id), newTenant];
    setTenantsList(updatedList);
    try {
      localStorage.setItem('nairee_tenants_store', JSON.stringify(updatedList));
      broadcastLiveEvent('tenant_created', { tenantsList: updatedList, newTenant });
    } catch (e) {}

    setActiveTenant(newTenant);
    try {
      localStorage.setItem('nairee_active_tenant_id', newTenant.tenant_id);
      const url = new URL(window.location.href);
      url.searchParams.set('tenant', newTenant.subdomain || newTenant.tenant_id);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
    return newTenant;
  };

  const updateTenant = (tenantId, updates) => {
    const updatedList = tenantsList.map(t => {
      if (t.tenant_id === tenantId) {
        return { ...t, ...updates, updated_at: new Date().toISOString() };
      }
      return t;
    });
    setTenantsList(updatedList);
    try {
      localStorage.setItem('nairee_tenants_store', JSON.stringify(updatedList));
      const updatedTenant = updatedList.find(t => t.tenant_id === tenantId);
      if (activeTenant.tenant_id === tenantId) {
        setActiveTenant(updatedTenant);
      }
      broadcastLiveEvent('tenant_updated', { tenantsList: updatedList, updatedTenant, activeTenantId: tenantId });
    } catch (e) {}
  };

  const isFeatureEnabled = (featureKey) => {
    if (!activeTenant || !Array.isArray(activeTenant.enabled_features)) return true;
    return activeTenant.enabled_features.includes(featureKey);
  };

  const isMasterTenant = !activeTenant?.tenant_id || activeTenant?.tenant_id === 'tenant-default' || activeTenant?.subdomain === 'demo';
  const userRole = userProfile?.role || currentUser?.app_metadata?.role || 'Admin';
  const isAdmin = userRole === 'Admin' || userRole === 'SuperAdmin';
  const isTeacher = userRole === 'Teacher';
  const isParent = userRole === 'Parent';
  const isStudent = userRole === 'Student';

  return (
    <TenantContext.Provider
      value={{
        tenant: activeTenant,
        activeTenant,
        isMasterTenant,
        tenantsList,
        currentUser,
        userProfile,
        userRole,
        isAdmin,
        isTeacher,
        isParent,
        isStudent,
        authError,
        setAuthError,
        isBrandingLoading,
        switchTenant,
        createTenant,
        updateTenant,
        isFeatureEnabled,
        isOnboardingModalOpen,
        setIsOnboardingModalOpen,
        isSwitchModalOpen,
        setIsSwitchModalOpen
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
