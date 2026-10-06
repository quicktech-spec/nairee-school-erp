import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DB_STORE } from '../fallbackData.js';
import { getStoredDb, saveStoredDb, broadcastLiveEvent, subscribeLiveEvents } from '../api.js';

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
    tenant_id: 'doon-school',
    school_name: 'The Doon School, Dehradun',
    school_code: 'TDS',
    subdomain: 'doon-school',
    custom_domain: '',
    logo_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150',
    logo_white_url: '',
    favicon_url: '',
    primary_color: '#1e3a8a',
    secondary_color: '#3b82f6',
    accent_color: '#f59e0b',
    bg_gradient: 'from-[#1e3a8a] via-[#3b82f6] to-[#1e3a8a]',
    tagline: 'Leadership, Honor & Intellectual Rigour • All-India Board',
    board_affiliation: 'IB & ICSE All-India Board',
    address: 'Mall Road, Dehradun, Uttarakhand - 248001',
    phone: '+91 135 252 6400',
    email: 'admissions@doonschool.com',
    plan_tier: 'Enterprise',
    max_students: 600,
    max_staff: 85,
    enabled_features: [
      'academics', 'attendance', 'fees', 'gradebook', 'timetable', 'homework', 'library', 'transport', 'communication', 'payroll', 'reports', 'database', 'parent_portal', 'student_portal', 'teacher_portal', 'id_cards', 'transfer_certificates'
    ],
    status: 'Active',
    created_at: '2024-06-15T08:00:00.000Z'
  },
  {
    tenant_id: 'oakridge-intl',
    school_name: 'Oakridge International IB World School',
    school_code: 'OIS',
    subdomain: 'oakridge',
    custom_domain: '',
    logo_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150',
    logo_white_url: '',
    favicon_url: '',
    primary_color: '#581c87',
    secondary_color: '#7e22ce',
    accent_color: '#06b6d4',
    bg_gradient: 'from-[#581c87] via-[#7e22ce] to-[#581c87]',
    tagline: 'World-Class IB Continuum & Cambridge Education',
    board_affiliation: 'IB Continuum & Cambridge IGCSE',
    address: 'Khajaguda, Nanakramguda Road, Gachibowli, Hyderabad - 500008',
    phone: '+91 40 6813 4500',
    email: 'hyderabad@oakridge.in',
    plan_tier: 'Enterprise',
    max_students: 2200,
    max_staff: 160,
    enabled_features: [
      'academics', 'attendance', 'fees', 'gradebook', 'timetable', 'homework', 'library', 'communication', 'reports', 'database', 'parent_portal', 'student_portal', 'teacher_portal', 'id_cards'
    ],
    status: 'Active',
    created_at: '2024-07-01T10:00:00.000Z'
  },
  {
    tenant_id: 'ryan-intl',
    school_name: 'Ryan International Academy',
    school_code: 'RIS',
    subdomain: 'ryan-intl',
    custom_domain: '',
    logo_url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=150',
    logo_white_url: '',
    favicon_url: '',
    primary_color: '#b45309',
    secondary_color: '#d97706',
    accent_color: '#1e3a8a',
    bg_gradient: 'from-[#b45309] via-[#d97706] to-[#b45309]',
    tagline: 'Excellence in Education & Character Building • CBSE',
    board_affiliation: 'CBSE Affiliated #1130129',
    address: 'Evershine Nagar, Malad West, Mumbai, Maharashtra - 400064',
    phone: '+91 22 2893 1111',
    email: 'info@ryangroup.org',
    plan_tier: 'Standard',
    max_students: 3200,
    max_staff: 180,
    enabled_features: [
      'academics', 'attendance', 'fees', 'gradebook', 'timetable', 'homework', 'library', 'transport', 'communication', 'reports', 'parent_portal', 'student_portal', 'teacher_portal', 'id_cards'
    ],
    status: 'Active',
    created_at: '2024-07-15T12:00:00.000Z'
  },
  {
    tenant_id: 'mayo-college',
    school_name: 'Mayo College, Ajmer',
    school_code: 'MCA',
    subdomain: 'mayo-college',
    custom_domain: '',
    logo_url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150',
    logo_white_url: '',
    favicon_url: '',
    primary_color: '#0f766e',
    secondary_color: '#14b8a6',
    accent_color: '#f59e0b',
    bg_gradient: 'from-[#0f766e] via-[#14b8a6] to-[#0f766e]',
    tagline: 'Let There Be Light • Historic Heritage Boarding',
    board_affiliation: 'CBSE & Cambridge Board',
    address: 'Srinagar Road, Alwar Gate, Ajmer, Rajasthan - 305001',
    phone: '+91 145 266 1154',
    email: 'principal@mayocollege.net',
    plan_tier: 'Enterprise',
    max_students: 900,
    max_staff: 110,
    enabled_features: [
      'academics', 'attendance', 'fees', 'gradebook', 'timetable', 'homework', 'library', 'transport', 'communication', 'payroll', 'reports', 'database', 'parent_portal', 'student_portal', 'teacher_portal', 'id_cards', 'transfer_certificates'
    ],
    status: 'Active',
    created_at: '2024-08-01T09:30:00.000Z'
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

export function resolveTenantFromLocation(tenantsList = DEFAULT_TENANTS) {
  let list = tenantsList;
  if (!list || list.length === 0) {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('nairee_tenants_store');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
        }
      } catch (e) {}
    }
  }
  if (!list || list.length === 0) list = DEFAULT_TENANTS;
  if (typeof window === 'undefined') return list[0];

  const params = new URLSearchParams(window.location.search);
  const queryTenant = params.get('tenant') || params.get('school') || params.get('subdomain');
  if (queryTenant) {
    const match = list.find(t => 
      t.tenant_id.toLowerCase() === queryTenant.toLowerCase() || 
      t.subdomain.toLowerCase() === queryTenant.toLowerCase()
    );
    if (match) return match;
  }

  // 2. Subdomain check from hostname (e.g. dps-ranchi.nairee.app -> dps-ranchi)
  const hostname = window.location.hostname;
  if (hostname && !hostname.includes('github.io') && !hostname.includes('localhost') && hostname.includes('.')) {
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      const sub = parts[0].toLowerCase();
      const subMatch = list.find(t => t.subdomain.toLowerCase() === sub);
      if (subMatch) return subMatch;
    }
  }

  // 3. Custom domain check (e.g. erp.dpsranchi.com)
  const customDomainMatch = list.find(t => t.custom_domain && t.custom_domain.toLowerCase() === hostname.toLowerCase());
  if (customDomainMatch) return customDomainMatch;

  // 4. Default Fallback: Root URL on master site ALWAYS opens Master Tenant (list[0])
  return list[0];
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
    } catch (e) {
      console.warn('Tenant store parse notice:', e);
    }
    return DEFAULT_TENANTS;
  });

  const [activeTenant, setActiveTenant] = useState(() => resolveTenantFromLocation(tenantsList));
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);

  // Apply Dynamic Theme Colors & Branding to Document Root
  useEffect(() => {
    if (!activeTenant) return;

    try {
      const root = document.documentElement;
      root.style.setProperty('--tenant-primary', activeTenant.primary_color || '#5673ec');
      root.style.setProperty('--tenant-secondary', activeTenant.secondary_color || '#6c8cff');
      root.style.setProperty('--tenant-accent', activeTenant.accent_color || '#10b981');
      
      // Update HTML Document Title dynamically
      document.title = `${activeTenant.school_name} | Smart ERP System`;

      // Update Favicon if provided
      if (activeTenant.favicon_url) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = activeTenant.favicon_url;
      }

      // Persist active tenant ID
      localStorage.setItem('nairee_active_tenant_id', activeTenant.tenant_id);
    } catch (e) {
      console.error('Failed to apply tenant styling:', e);
    }
  }, [activeTenant]);

  // Listen to cross-tab live events for tenant creations/updates
  useEffect(() => {
    const unsubscribe = subscribeLiveEvents((event) => {
      if (event?.type === 'tenant_created' || event?.type === 'tenant_updated') {
        if (event.payload?.tenantsList) {
          setTenantsList(event.payload.tenantsList);
        }
        if (event.payload?.activeTenantId === activeTenant?.tenant_id && event.payload?.updatedTenant) {
          setActiveTenant(event.payload.updatedTenant);
        }
      }
    });
    return unsubscribe;
  }, [activeTenant]);

  const switchTenant = (tenantIdOrSubdomain) => {
    const match = tenantsList.find(t => 
      t.tenant_id === tenantIdOrSubdomain || 
      t.subdomain === tenantIdOrSubdomain
    );
    if (match) {
      setActiveTenant(match);
      try {
        localStorage.setItem('nairee_active_tenant_id', match.tenant_id);
        // Cleanly update URL search param without reload
        const url = new URL(window.location.href);
        if (match.tenant_id === 'tenant-default') {
          url.searchParams.delete('tenant');
        } else {
          url.searchParams.set('tenant', match.subdomain || match.tenant_id);
        }
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}
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
      enabled_features: tenantData.enabled_features || [
        'academics', 'attendance', 'fees', 'gradebook', 'timetable', 'homework', 'reports', 'parent_portal', 'student_portal', 'teacher_portal'
      ],
      status: 'Active',
      created_at: new Date().toISOString()
    };

    const updatedList = [...tenantsList.filter(t => t.tenant_id !== newTenant.tenant_id), newTenant];
    setTenantsList(updatedList);
    try {
      localStorage.setItem('nairee_tenants_store', JSON.stringify(updatedList));
      
      // Also sync into Central Database Store table 'Tenants & Multi-Tenant Schools'
      const currentDb = getStoredDb();
      if (currentDb) {
        const tableKey = currentDb['Tenants & Multi-Tenant Schools'] ? 'Tenants & Multi-Tenant Schools' : (currentDb['Tenants'] ? 'Tenants' : null);
        if (tableKey && currentDb[tableKey]) {
          const existingRows = currentDb[tableKey].rows || [];
          const newRow = {
            tenant_id: newTenant.tenant_id,
            school_name: newTenant.school_name,
            school_code: newTenant.school_code,
            subdomain: newTenant.subdomain,
            board_affiliation: newTenant.board_affiliation,
            plan_tier: newTenant.plan_tier,
            primary_color: newTenant.primary_color,
            secondary_color: newTenant.secondary_color,
            accent_color: newTenant.accent_color,
            phone: newTenant.phone,
            email: newTenant.email,
            status: newTenant.status,
            portal_url: `https://quicktech-spec.github.io/nairee-school-erp/?tenant=${newTenant.subdomain}`
          };
          currentDb[tableKey].rows = [...existingRows.filter(r => r.tenant_id !== newTenant.tenant_id), newRow];
          saveStoredDb(currentDb);
        }
      }

      broadcastLiveEvent('tenant_created', { tenantsList: updatedList, newTenant });
    } catch (e) {}

    // Automatically switch to the newly created tenant instance
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

  const isMasterTenant = activeTenant?.tenant_id === 'tenant-default';

  return (
    <TenantContext.Provider
      value={{
        tenant: activeTenant,
        activeTenant,
        isMasterTenant,
        tenantsList,
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
