import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, teardownRealtimeAndSession } from '../supabaseClient.js';
import { subscribeLiveEvents, broadcastLiveEvent } from '../api.js';

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
  }
];

/**
 * Resolves active tenant from subdomain or URL parameters.
 */
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
  const [tenantsList, setTenantsList] = useState(DEFAULT_TENANTS);
  const [activeTenant, setActiveTenant] = useState(() => resolveTenantFromLocation(DEFAULT_TENANTS));
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isBrandingLoading, setIsBrandingLoading] = useState(false);

  // 1. Fetch Tenant Branding before login via public RPC get_tenant_branding
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
      console.warn('Public branding lookup notice:', err);
    } finally {
      setIsBrandingLoading(false);
    }
  }, []);

  // Initialize branding on mount
  useEffect(() => {
    const subdomain = resolveSubdomainFromLocation();
    loadBrandingForSubdomain(subdomain);
  }, [loadBrandingForSubdomain]);

  // 2. Auth State & Strict JWT Tenant Cross-Verification
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        handleAuthSession(session);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await handleAuthSession(session);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        await teardownRealtimeAndSession();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [activeTenant.tenant_id]);

  const handleAuthSession = async (session) => {
    const user = session.user;
    setCurrentUser(user);

    // Extract tenant_id and role strictly from JWT app_metadata (set server-side)
    const jwtTenantId = user.app_metadata?.tenant_id;
    const jwtRole = user.app_metadata?.role;

    // Cross-tenant mismatch guard: Verify JWT tenant == subdomain tenant
    if (jwtTenantId && activeTenant?.tenant_id && jwtTenantId !== activeTenant.tenant_id && activeTenant.tenant_id !== 'tenant-default') {
      console.error(`Tenant mismatch detected! JWT Tenant: ${jwtTenantId} vs Domain Tenant: ${activeTenant.tenant_id}`);
      setAuthError('Security Alert: Your user account is associated with a different school domain. You have been signed out.');
      await supabase.auth.signOut();
      await teardownRealtimeAndSession();
      return;
    }

    setAuthError(null);

    // Fetch user profile securely (protected by RLS)
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

  // 3. Apply Dynamic Theme Styling
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
    } catch (e) {
      console.error('Failed to apply tenant styling:', e);
    }
  }, [activeTenant]);

  const switchTenant = async (tenantIdOrSubdomain) => {
    const match = tenantsList.find(t => 
      t.tenant_id === tenantIdOrSubdomain || 
      t.subdomain === tenantIdOrSubdomain
    );
    if (match) {
      // Clean up realtime and caches when switching tenant
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

  const isFeatureEnabled = (featureKey) => {
    if (!activeTenant || !Array.isArray(activeTenant.enabled_features)) return true;
    return activeTenant.enabled_features.includes(featureKey);
  };

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
        isFeatureEnabled
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
