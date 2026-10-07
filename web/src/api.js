import { FALLBACK_DATA, INITIAL_DB_STORE, generateSeedDbForSchool } from './fallbackData.js';
import { supabase } from './supabaseClient.js';

const API_BASE = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api').replace(/\/$/, '');

// Safe fetch wrapper that handles HTML 404s gracefully
async function safeFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API request failed');
      return data;
    }
  } catch (err) {
    // Graceful fallback to client unified store
  }
  return null;
}

// Real-time Event Hub & Broadcast Engine (Across Tabs and Live Reactive UI)
let liveChannel = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    liveChannel = new BroadcastChannel('nairee_live_sync_channel');
  }
} catch (e) {
  console.warn('BroadcastChannel init notice:', e);
}

// Global Supabase Cloud WebSocket Channel for Cross-Device Sync
let supabaseChannel = null;
try {
  if (supabase) {
    supabaseChannel = supabase.channel('nairee_school_cloud_sync', {
      config: { broadcast: { self: false } }
    });

    supabaseChannel
      .on('broadcast', { event: 'live_sync' }, ({ payload }) => {
        if (payload) {
          if (payload.type === 'db_store_updated' && payload.payload) {
            saveStoredDb(payload.payload, false);
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nairee_live_sync', { detail: payload }));
          }
        }
      })
      .on('broadcast', { event: 'request_db_sync' }, () => {
        const currentDb = getStoredDb();
        if (supabaseChannel) {
          supabaseChannel.send({
            type: 'broadcast',
            event: 'live_sync',
            payload: { type: 'db_store_updated', payload: currentDb }
          }).catch(() => {});
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          supabaseChannel.send({
            type: 'broadcast',
            event: 'request_db_sync',
            payload: {}
          }).catch(() => {});
        }
      });
  }
} catch (err) {
  console.warn('Supabase realtime init warning:', err);
}

export function broadcastLiveEvent(type, payload = {}) {
  const currentDb = getStoredDb();
  const eventData = { 
    type, 
    payload, 
    dbStore: currentDb,
    timestamp: Date.now() 
  };

  try {
    if (liveChannel) {
      liveChannel.postMessage(eventData);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nairee_live_sync', { detail: eventData }));
    }
    if (supabaseChannel) {
      supabaseChannel.send({
        type: 'broadcast',
        event: 'live_sync',
        payload: eventData
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('Broadcast error:', err);
  }
}

export function subscribeLiveEvents(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleCustom = (e) => {
    if (e && e.detail) callback(e.detail);
  };

  const handleChannelMessage = (e) => {
    if (e && e.data) callback(e.data);
  };

  window.addEventListener('nairee_live_sync', handleCustom);
  if (liveChannel) {
    liveChannel.addEventListener('message', handleChannelMessage);
  }

  return () => {
    window.removeEventListener('nairee_live_sync', handleCustom);
    if (liveChannel) {
      liveChannel.removeEventListener('message', handleChannelMessage);
    }
  };
}

/**
 * Enterprise Database Error Formatter:
 * Converts raw PostgreSQL / Supabase codes into user-friendly messages.
 */
export function formatDbError(err) {
  if (!err) return 'An unexpected error occurred.';
  if (typeof err === 'string') return err;
  
  const msg = (err.message || '').toLowerCase();
  const code = err.code || '';
  const details = (err.details || '').toLowerCase();

  // 1. Unique violations (23505)
  if (code === '23505' || msg.includes('duplicate key') || msg.includes('unique constraint')) {
    if (msg.includes('admission_no') || details.includes('admission_no')) {
      return 'A student with this Admission Number already exists in the institution.';
    }
    if (msg.includes('uq_students_batch_roll') || details.includes('roll_no') || msg.includes('roll_no')) {
      return 'This Roll Number is already assigned to another student in this class section.';
    }
    if (msg.includes('tc_number') || details.includes('tc_number')) {
      return 'This Transfer Certificate (TC) number has already been recorded.';
    }
    if (msg.includes('uq_timetable_teacher_period') || msg.includes('timetable') || details.includes('teacher')) {
      return 'Scheduling Conflict: This teacher is already assigned to another lecture during this period.';
    }
    if (msg.includes('uq_id_cards') || details.includes('card_number')) {
      return 'An ID card with this card number already exists.';
    }
    if (msg.includes('uq_subscriptions_active_tenant')) {
      return 'This school tenant already has an active subscription plan.';
    }
    return 'A record with these unique details already exists in the system.';
  }

  // 2. Foreign key violations (23503)
  if (code === '23503' || msg.includes('foreign key constraint') || msg.includes('violates foreign key')) {
    return 'Cannot complete operation: The referenced record does not exist or belongs to another school tenant.';
  }

  // 3. Check constraint violations (23514)
  if (code === '23514' || msg.includes('check constraint')) {
    if (msg.includes('amount') || msg.includes('payment') || msg.includes('exceeds')) {
      return 'Payment error: The payment amount cannot exceed the pending invoice balance.';
    }
    if (msg.includes('end_time') || msg.includes('chk_timetable_times')) {
      return 'Lecture time error: End time must be later than the start time.';
    }
    if (msg.includes('chk_timetable_period')) {
      return 'Invalid timetable period: Period must be between 1 and 12.';
    }
    if (msg.includes('chk_certificates_not_transfer')) {
      return 'Transfer certificates cannot be issued here. Please use the Transfer Certificate module.';
    }
    if (msg.includes('chk_certificates_single_issuer')) {
      return 'Certificate authorization error: Exactly one issuer (Admin or Teacher) must be specified.';
    }
    return 'Input validation failed: One or more fields violate school policy rules.';
  }

  // 4. RLS / Permission Denied (42501)
  if (code === '42501' || msg.includes('permission denied') || msg.includes('row-level security') || msg.includes('violates row-level')) {
    return 'Permission Denied: Your account role does not have authorization to view or modify this record.';
  }

  // 5. Restrict Delete Violations (23000 / 23504)
  if (code === '23504' || msg.includes('restrict') || msg.includes('still referenced')) {
    return 'Cannot delete record: Financial transactions, fee invoices, or certificates are linked to this record.';
  }

  return err.message || 'Database request failed. Please try again.';
}

// Central Student ID Generator: [School Code]-[Year of Admission]-[Aadhaar Card Last 3 Digits]-[Sequence]

// Central Teacher ID Generator: [School Code]-[Year of Employment]-[Aadhaar Card Last 3 Digits]-[Sequence]
export function generateTeacherId({ schoolCode = 'NIS', joiningDate = '', joiningYear = '', aadhaarNo = '', sequence = 1 } = {}) {
  const code = (schoolCode || 'NIS').toUpperCase().trim();
  let year = '';
  if (joiningYear) {
    year = String(joiningYear).trim();
  } else if (joiningDate) {
    const d = new Date(joiningDate);
    year = !isNaN(d.getFullYear()) ? String(d.getFullYear()) : '2022';
  } else {
    year = '2022';
  }
  
  const cleanAadhaar = String(aadhaarNo || '').replace(/\D/g, '');
  const aadhaarLast3 = cleanAadhaar.length >= 3 ? cleanAadhaar.slice(-3) : String(aadhaarNo || '800').slice(-3).padStart(3, '0');
  const seqStr = String(sequence || 1).padStart(3, '0');

  return `${code}-${year}-${aadhaarLast3}-${seqStr}`;
}

export function generateStudentId({ schoolCode = 'NIS', admissionDate = '', admissionYear = '', aadhaarNo = '', sequence = 1 } = {}) {
  const code = (schoolCode || 'NIS').toUpperCase().trim();
  let year = '';
  if (admissionYear) {
    year = String(admissionYear).trim();
  } else if (admissionDate) {
    const d = new Date(admissionDate);
    year = !isNaN(d.getFullYear()) ? String(d.getFullYear()) : '2024';
  } else {
    year = '2024';
  }
  const cleanAadhaar = String(aadhaarNo || '').replace(/\D/g, '');
  const aadhaarLast3 = cleanAadhaar.length >= 3 ? cleanAadhaar.slice(-3) : String(aadhaarNo || '000').slice(-3).padStart(3, '0');
  const seqStr = String(sequence || 1).padStart(3, '0');

  return `${code}-${year}-${aadhaarLast3}-${seqStr}`;
}

export function isIdUnique(tableName, idValue, excludeCurrentId = null) {
  if (!idValue) return false;
  const db = getStoredDb();
  const rows = db[tableName]?.rows || [];
  const pkField = PK_MAP[tableName];
  if (!pkField) return true;

  const targetId = String(idValue).trim().toLowerCase();
  const excludeId = excludeCurrentId ? String(excludeCurrentId).trim().toLowerCase() : null;

  return !rows.some(r => {
    const rowId = String(r[pkField] || r.id || r.admission_no || r.student_id || r.teacher_number || r.teacher_id || '').trim().toLowerCase();
    if (excludeId && rowId === excludeId) return false;
    return rowId === targetId;
  });
}

// Generate Guaranteed Globally Unique Student ID (Auto-resolves collisions)
export function getGuaranteedUniqueStudentId({ schoolCode = 'NIS', admissionDate = '', admissionYear = '', aadhaarNo = '', startSequence = 1 } = {}) {
  let seq = startSequence || 1;
  while (seq <= 9999) {
    const candidateId = generateStudentId({ schoolCode, admissionDate, admissionYear, aadhaarNo, sequence: seq });
    if (isIdUnique('Student List', candidateId)) {
      return candidateId;
    }
    seq++;
  }
  return generateStudentId({ schoolCode, admissionDate, admissionYear, aadhaarNo, sequence: Date.now() % 1000 });
}

// Generate Guaranteed Globally Unique Teacher ID (Auto-resolves collisions)
export function getGuaranteedUniqueTeacherId({ schoolCode = 'NIS', joiningDate = '', joiningYear = '', aadhaarNo = '', startSequence = 1 } = {}) {
  let seq = startSequence || 1;
  while (seq <= 9999) {
    const candidateId = generateTeacherId({ schoolCode, joiningDate, joiningYear, aadhaarNo, sequence: seq });
    if (isIdUnique('Teacher List', candidateId)) {
      return candidateId;
    }
    seq++;
  }
  return generateTeacherId({ schoolCode, joiningDate, joiningYear, aadhaarNo, sequence: Date.now() % 1000 });
}

// --- CENTRALIZED RELATIONAL DATABASE STORAGE ENGINE ---
const DB_VERSION_KEY = 'nairee_db_v13_hardened_security';

export function maskAadhaar(aadhaar) {
  if (!aadhaar) return '•••• •••• ••••';
  const clean = String(aadhaar).replace(/\D/g, '');
  const last4 = clean.slice(-4) || '1091';
  return `•••• •••• ${last4}`;
}

export function maskBank(acc) {
  if (!acc) return '•••• •••• ••••';
  const clean = String(acc).replace(/\D/g, '');
  const last4 = clean.slice(-4) || '4321';
  return `•••• •••• ${last4}`;
}

export function maskPan(pan) {
  if (!pan) return '••••••••••';
  const str = String(pan).trim();
  const last4 = str.slice(-4) || '901A';
  return `••••••${last4}`;
}

// Pre-save Timetable collision guard (matching uq_timetable_teacher_slot constraint)
export function validateTimetableSlot({ teacher_number, day_of_week, period_number, slot_id = null }) {
  const db = getStoredDb();
  const slots = db['timetable_slots']?.rows || db['Timetable Schedule']?.rows || [];
  const collision = slots.find(s => 
    s.teacher_number === teacher_number && 
    s.day_of_week === day_of_week && 
    Number(s.period_number) === Number(period_number) &&
    s.slot_id !== slot_id
  );
  if (collision) {
    throw new Error(`Teacher conflict: Selected faculty is already scheduled for Period ${period_number} on ${day_of_week}.`);
  }
  return true;
}

const PK_MAP = {
  'Tenants & Multi-Tenant Schools': 'tenant_id',
  'Tenants': 'tenant_id',
  'Student List': 'student_id',
  'Teacher List': 'teacher_number',
  'staff_faculty': 'teacher_number',
  'Staff & Faculty': 'teacher_number',
  'employees': 'teacher_number',
  'Staff & Personnel': 'staff_id',
  'staff': 'staff_id',
  'Class & Batch List': 'batch_id',
  'Subjects List': 'subject_id',
  'Assessment Plans': 'plan_id',
  'Assessment Results': 'result_id',
  'Attendance Records': 'attendance_id',
  'Teacher Attendance': 'punch_id',
  'Classes Conducted Log': 'log_id',
  'Teacher Substitution': 'sub_id',
  'Fee Invoices & Ledger': 'invoice_id',
  'Homework List': 'homework_id',
  'Homework Submissions': 'submission_id',
  'Parent List': 'parent_id',
  'Admin List': 'admin_id',
  'Transfer Certificates': 'tc_id',
  'Certificates & Credentials': 'certificate_id',
  'certificates': 'certificate_id',
  'ID Cards & Badges': 'id_card_id',
  'id_cards': 'id_card_id',
  'Operational Expenses (P&L)': 'expense_id',
  'expenses': 'expense_id',
  'SaaS Subscriptions & Billing': 'subscription_id',
  'subscriptions': 'subscription_id',
  'Alumni Network': 'alumni_id'
};

export function getActiveTenantId() {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const qTenant = params.get('tenant') || params.get('school') || params.get('subdomain');
    if (qTenant) return qTenant.toLowerCase();
    const storedTenant = localStorage.getItem('nairee_active_tenant_id');
    if (storedTenant) return storedTenant.toLowerCase();
  }
  return 'tenant-default';
}

export function isMasterOrDemoTenant(tenantId) {
  if (!tenantId) return true;
  const tid = String(tenantId).toLowerCase();
  return tid === 'tenant-default' || tid === 'demo';
}

export function getTenantMeta(tenantId) {
  const codeMap = {
    'tenant-default': { code: 'NIS', name: 'Nairee International School' },
    'demo': { code: 'NIS', name: 'Nairee International School' },
    'dps-ranchi': { code: 'DPS', name: 'Delhi Public School, Ranchi' },
    'st-xaviers': { code: 'SXA', name: "St. Xavier's Senior Academy" },
    'greenfield-global': { code: 'GGS', name: 'Greenfield Global School' },
    'bishop-cotton': { code: 'BCS', name: "Bishop Cotton Boys' School" },
    'doon-school': { code: 'TDS', name: 'The Doon School, Dehradun' },
    'oakridge-intl': { code: 'OIS', name: 'Oakridge International School' },
    'ryan-intl': { code: 'RIS', name: 'Ryan International Academy' },
    'mayo-college': { code: 'MCA', name: 'Mayo College, Ajmer' }
  };

  if (tenantId && codeMap[tenantId]) return codeMap[tenantId];

  try {
    const saved = localStorage.getItem('nairee_tenants_store');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const found = parsed.find(t => t?.tenant_id === tenantId || t?.subdomain === tenantId);
        if (found) {
          return {
            code: found.school_code || (found.subdomain || 'SCH').slice(0, 4).toUpperCase(),
            name: found.school_name || `${tenantId} School`
          };
        }
      }
    }
  } catch (e) {}

  const clean = String(tenantId || 'SCH').replace(/^tenant-/, '').slice(0, 4).toUpperCase();
  return { code: clean || 'SCH', name: `${clean} Academy` };
}

export function createEmptyTenantDbStore() {
  const emptyStore = {};
  Object.keys(INITIAL_DB_STORE).forEach(tableName => {
    emptyStore[tableName] = {
      columns: INITIAL_DB_STORE[tableName].columns || [],
      rows: []
    };
  });
  return emptyStore;
}

export function getStoredDb(explicitTenantId = null) {
  const tenantId = explicitTenantId || getActiveTenantId();
  const isDemo = isMasterOrDemoTenant(tenantId);
  const storageKey = isDemo ? 'nairee_db_store' : `nairee_db_store_${tenantId}`;
  const meta = getTenantMeta(tenantId);
  const baseTemplate = isDemo ? INITIAL_DB_STORE : generateSeedDbForSchool(tenantId, meta.code, meta.name);

  if (typeof localStorage === 'undefined') {
    return baseTemplate;
  }

  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        const merged = { ...baseTemplate };
        
        // If the saved store has 0 students or 0 teachers (e.g. stale empty store from previous session),
        // re-populate with the 10 students and 2 teachers seed
        const savedStudents = parsed['Student List']?.rows || [];
        const savedTeachers = parsed['Teacher List']?.rows || [];
        if (savedStudents.length === 0 && savedTeachers.length === 0 && baseTemplate['Student List']?.rows?.length > 0) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(baseTemplate));
          } catch (e) {}
          return baseTemplate;
        }

        // Use user saved tables as authoritative single source of truth
        Object.keys(baseTemplate).forEach(tableName => {
          const initTable = baseTemplate[tableName];
          const savedTable = parsed[tableName];

          if (savedTable && Array.isArray(savedTable.rows) && savedTable.rows.length > 0) {
            merged[tableName] = {
              ...initTable,
              columns: savedTable.columns || initTable?.columns || [],
              rows: savedTable.rows
            };
          } else {
            merged[tableName] = initTable;
          }
        });

        // Retain any newly created custom tables
        Object.keys(parsed).forEach(tableName => {
          if (!merged[tableName] && parsed[tableName]) {
            merged[tableName] = parsed[tableName];
          }
        });

        return merged;
      }
    }
  } catch (e) {
    console.warn('Error reading tenant db store:', e);
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(baseTemplate));
  } catch (e) {}
  return baseTemplate;
}

export function saveStoredDb(newDbStore, shouldBroadcast = true, explicitTenantId = null) {
  if (!newDbStore) return;
  const tenantId = explicitTenantId || getActiveTenantId();
  const isDemo = isMasterOrDemoTenant(tenantId);
  const storageKey = isDemo ? 'nairee_db_store' : `nairee_db_store_${tenantId}`;

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(newDbStore));
    }
  } catch (e) {
    console.warn('Error writing tenant db store:', e);
  }
  if (shouldBroadcast) {
    broadcastLiveEvent('db_store_updated', { newDbStore, tenantId });
  }
}

export function normalizeBatchAndClass(inputClassOrBatch) {
  const raw = String(inputClassOrBatch || 'Class 10 - Section A').trim();
  
  const match = raw.match(/(?:Class|Grade)?\s*(\d+|Nursery|LKG|UKG|KG)\s*(?:-|\/)?\s*(?:Section)?\s*([A-Z])?/i);
  
  let grade = 'Class 10';
  let section = 'A';
  let batchId = 'CLS-10A';
  let className = raw;

  if (match && match[1]) {
    const num = match[1];
    const sec = (match[2] || 'A').toUpperCase();
    grade = `Class ${num}`;
    section = sec;
    const paddedNum = !isNaN(num) ? String(num).padStart(2, '0') : num.toUpperCase();
    batchId = `CLS-${paddedNum}${sec}`;
    className = `Class ${num} - Section ${sec}`;
  } else if (raw.toUpperCase().startsWith('CLS-')) {
    batchId = raw.toUpperCase();
    const cleanNum = raw.replace(/\D/g, '');
    const cleanSec = raw.slice(-1).toUpperCase();
    grade = `Class ${cleanNum || '10'}`;
    section = cleanSec || 'A';
    className = `Class ${cleanNum || '10'} - Section ${cleanSec || 'A'}`;
  }

  return {
    batch_id: batchId,
    class_batch: className,
    grade,
    section
  };
}

// Cascading Relational Trigger Engine for Students:
// When any student detail (id, name, roll_no, class_batch) updates, it triggers
// instantaneous cascading updates across Attendance, Invoices, Results, Classes, and Portals.
export function cascadeStudentUpdates(updatedStudentsList, dbStore) {
  if (!dbStore || !Array.isArray(updatedStudentsList)) return dbStore;

  const studentMap = new Map();
  const detectedClasses = new Map();

  updatedStudentsList.forEach(s => {
    if (s && (s.student_id || s.id)) {
      const sid = String(s.student_id || s.id).trim();
      const sname = String(s.name || s.student_name || '').trim();
      const roll = String(s.roll_no || '').padStart(2, '0');
      
      const norm = normalizeBatchAndClass(s.class_batch || s.student_batch || s.batch_id);
      s.batch_id = s.batch_id || norm.batch_id;
      s.class_batch = s.class_batch || norm.class_batch;

      const payload = {
        student_id: sid,
        student_name: sname,
        roll_no: roll,
        class_batch: norm.class_batch,
        batch_id: norm.batch_id,
        grade: norm.grade,
        section: norm.section
      };

      studentMap.set(sid.toLowerCase(), payload);
      if (sname) studentMap.set(sname.toLowerCase(), payload);

      if (!detectedClasses.has(norm.batch_id)) {
        detectedClasses.set(norm.batch_id, {
          batch_id: norm.batch_id,
          batch_name: norm.class_batch,
          grade: norm.grade,
          section: norm.section,
          room_no: `Room ${(parseInt(norm.grade.replace(/\D/g, '')) || 1) * 100 + 1}`,
          class_teacher_id: 'NIS-2020-811-001',
          class_teacher: 'Prof. Sarah Jenkins',
          capacity: 35
        });
      }
    }
  });

  // 0. Ensure Class & Batch List contains all active classes
  if (dbStore['Class & Batch List'] && Array.isArray(dbStore['Class & Batch List'].rows)) {
    const existingBatchIds = new Set(dbStore['Class & Batch List'].rows.map(r => r.batch_id));
    detectedClasses.forEach((clsObj, bId) => {
      if (!existingBatchIds.has(bId)) {
        dbStore['Class & Batch List'].rows.push(clsObj);
      }
    });
  }

  // 1. Cascade to Attendance Records
  if (dbStore['Attendance Records'] && Array.isArray(dbStore['Attendance Records'].rows)) {
    dbStore['Attendance Records'].rows = dbStore['Attendance Records'].rows.map(att => {
      const sid = String(att.student_id || att.student || '').toLowerCase().trim();
      const sname = String(att.student_name || '').toLowerCase().trim();
      const matched = studentMap.get(sid) || studentMap.get(sname);
      if (matched) {
        return {
          ...att,
          student_id: matched.student_id,
          student_name: matched.student_name,
          roll_no: matched.roll_no || att.roll_no,
          class_batch: matched.class_batch || att.class_batch
        };
      }
      return att;
    });
  }

  // 2. Cascade to Fee Invoices & Ledger
  if (dbStore['Fee Invoices & Ledger'] && Array.isArray(dbStore['Fee Invoices & Ledger'].rows)) {
    dbStore['Fee Invoices & Ledger'].rows = dbStore['Fee Invoices & Ledger'].rows.map(inv => {
      const sid = String(inv.student_id || inv.student || '').toLowerCase().trim();
      const sname = String(inv.student_name || '').toLowerCase().trim();
      const matched = studentMap.get(sid) || studentMap.get(sname);
      if (matched) {
        return {
          ...inv,
          student_id: matched.student_id,
          student_name: matched.student_name,
          roll_no: matched.roll_no || inv.roll_no,
          class_batch: matched.class_batch || inv.class_batch
        };
      }
      return inv;
    });
  }

  // 3. Cascade to Assessment Results (Marks)
  if (dbStore['Assessment Results'] && Array.isArray(dbStore['Assessment Results'].rows)) {
    dbStore['Assessment Results'].rows = dbStore['Assessment Results'].rows.map(res => {
      const sid = String(res.student_id || res.student || '').toLowerCase().trim();
      const sname = String(res.student_name || '').toLowerCase().trim();
      const matched = studentMap.get(sid) || studentMap.get(sname);
      if (matched) {
        return {
          ...res,
          student_id: matched.student_id,
          student_name: matched.student_name,
          roll_no: matched.roll_no || res.roll_no,
          class_batch: matched.class_batch || res.class_batch
        };
      }
      return res;
    });
  }

  // 4. Cascade to Homework Submissions
  if (dbStore['Homework Submissions'] && Array.isArray(dbStore['Homework Submissions'].rows)) {
    dbStore['Homework Submissions'].rows = dbStore['Homework Submissions'].rows.map(sub => {
      const sid = String(sub.student_id || sub.student || '').toLowerCase().trim();
      const sname = String(sub.student_name || '').toLowerCase().trim();
      const matched = studentMap.get(sid) || studentMap.get(sname);
      if (matched) {
        return {
          ...sub,
          student_id: matched.student_id,
          student_name: matched.student_name,
          class_batch: matched.class_batch || sub.class_batch
        };
      }
      return sub;
    });
  }

  // 5. Cascade to Parent List
  if (dbStore['Parent List'] && Array.isArray(dbStore['Parent List'].rows)) {
    dbStore['Parent List'].rows = dbStore['Parent List'].rows.map(par => {
      const childId = String(par.child || '').toLowerCase().trim();
      const matched = studentMap.get(childId);
      if (matched) {
        return {
          ...par,
          child: matched.student_id
        };
      }
      return par;
    });
  }

  // 6. Cascade to Transfer Certificates
  if (dbStore['Transfer Certificates'] && Array.isArray(dbStore['Transfer Certificates'].rows)) {
    dbStore['Transfer Certificates'].rows = dbStore['Transfer Certificates'].rows.map(tc => {
      const sid = String(tc.student_id || '').toLowerCase().trim();
      const sname = String(tc.student_name || '').toLowerCase().trim();
      const matched = studentMap.get(sid) || studentMap.get(sname);
      if (matched) {
        return {
          ...tc,
          student_id: matched.student_id,
          student_name: matched.student_name,
          class_batch: matched.class_batch || tc.class_batch
        };
      }
      return tc;
    });
  }

  return dbStore;
}

// Master Helpers for Students & Teachers
export function getMasterStudents() {
  const db = getStoredDb();
  if (db['Student List'] && Array.isArray(db['Student List'].rows)) {
    return db['Student List'].rows;
  }
  return isMasterOrDemoTenant(getActiveTenantId()) ? INITIAL_DB_STORE['Student List'].rows : [];
}

export function saveMasterStudents(updatedStudentsList) {
  let currentDb = getStoredDb();
  const currentTbl = currentDb['Student List'] || INITIAL_DB_STORE['Student List'];
  currentDb = {
    ...currentDb,
    'Student List': {
      ...currentTbl,
      rows: updatedStudentsList
    }
  };

  // Trigger Automatic Cascading Updates Across All Dependent Relational Sections
  currentDb = cascadeStudentUpdates(updatedStudentsList, currentDb);

  saveStoredDb(currentDb);
  broadcastLiveEvent('student_updated', { students: updatedStudentsList });
  broadcastLiveEvent('student_cascaded_update', { dbStore: currentDb });
}

// Bi-directional / Multi-directional Unified Student Synchronizer
export function syncStudentAcrossAllDatasets(studentIdentifier, studentUpdates = {}) {
  let db = getStoredDb();
  const students = [...(db['Student List']?.rows || INITIAL_DB_STORE['Student List'].rows)];
  const cleanId = String(studentIdentifier || '').toLowerCase().trim();

  let targetStudent = null;
  const updatedStudents = students.map(s => {
    const sid = String(s.student_id || s.id || '').toLowerCase().trim();
    const sname = String(s.name || s.student_name || '').toLowerCase().trim();
    const sroll = String(s.roll_no || '').toLowerCase().trim();

    if (sid === cleanId || sname === cleanId || sroll === cleanId || (cleanId && (sid.includes(cleanId) || cleanId.includes(sid)))) {
      targetStudent = {
        ...s,
        ...studentUpdates,
        student_id: studentUpdates.student_id || s.student_id,
        name: studentUpdates.name || studentUpdates.student_name || s.name,
        roll_no: studentUpdates.roll_no ? String(studentUpdates.roll_no).replace(/\D/g, '') : s.roll_no,
        class_batch: studentUpdates.class_batch || studentUpdates.student_batch || s.class_batch
      };
      return targetStudent;
    }
    return s;
  });

  if (targetStudent) {
    db['Student List'].rows = updatedStudents;
    db = cascadeStudentUpdates(updatedStudents, db);
    saveStoredDb(db);
    broadcastLiveEvent('student_updated', { student: targetStudent, students: updatedStudents });
    broadcastLiveEvent('student_cascaded_update', { dbStore: db });
  }

  return { success: true, student: targetStudent, dbStore: db };
}

export function getMasterTeachers() {
  const db = getStoredDb();
  if (db['Teacher List'] && Array.isArray(db['Teacher List'].rows)) {
    return db['Teacher List'].rows;
  }
  return isMasterOrDemoTenant(getActiveTenantId()) ? INITIAL_DB_STORE['Teacher List'].rows : [];
}

export function cascadeTeacherUpdates(updatedTeachersList, dbStore) {
  if (!dbStore || !Array.isArray(updatedTeachersList)) return dbStore;

  const teacherMap = new Map();
  updatedTeachersList.forEach(t => {
    const tid = String(t.teacher_number || t.teacher_id || t.id || '').toLowerCase().trim();
    const tname = String(t.name || t.full_name || '').toLowerCase().trim();
    const data = {
      teacher_id: t.teacher_number || t.teacher_id || t.id,
      teacher_name: t.name || t.full_name,
      department: t.department || ''
    };
    if (tid) teacherMap.set(tid, data);
    if (tname) teacherMap.set(tname, data);
  });

  // 1. Cascade to Class & Batch List
  if (dbStore['Class & Batch List'] && Array.isArray(dbStore['Class & Batch List'].rows)) {
    dbStore['Class & Batch List'].rows = dbStore['Class & Batch List'].rows.map(b => {
      const tid = String(b.class_teacher_id || '').toLowerCase().trim();
      const tname = String(b.class_teacher || '').toLowerCase().trim();
      const matched = teacherMap.get(tid) || teacherMap.get(tname);
      if (matched) {
        return {
          ...b,
          class_teacher_id: matched.teacher_id,
          class_teacher: matched.teacher_name
        };
      }
      return b;
    });
  }

  // 2. Cascade to Subjects List
  if (dbStore['Subjects List'] && Array.isArray(dbStore['Subjects List'].rows)) {
    dbStore['Subjects List'].rows = dbStore['Subjects List'].rows.map(sub => {
      const tid = String(sub.default_teacher_id || '').toLowerCase().trim();
      const tname = String(sub.teacher || sub.teacher_name || '').toLowerCase().trim();
      const matched = teacherMap.get(tid) || teacherMap.get(tname);
      if (matched) {
        return {
          ...sub,
          default_teacher_id: matched.teacher_id,
          teacher: matched.teacher_name
        };
      }
      return sub;
    });
  }

  // 3. Cascade to Teacher Attendance
  if (dbStore['Teacher Attendance'] && Array.isArray(dbStore['Teacher Attendance'].rows)) {
    dbStore['Teacher Attendance'].rows = dbStore['Teacher Attendance'].rows.map(att => {
      const tid = String(att.teacher_number || '').toLowerCase().trim();
      const tname = String(att.teacher_name || '').toLowerCase().trim();
      const matched = teacherMap.get(tid) || teacherMap.get(tname);
      if (matched) {
        return {
          ...att,
          teacher_number: matched.teacher_id,
          teacher_name: matched.teacher_name
        };
      }
      return att;
    });
  }

  // 4. Cascade to Teacher Substitution
  if (dbStore['Teacher Substitution'] && Array.isArray(dbStore['Teacher Substitution'].rows)) {
    dbStore['Teacher Substitution'].rows = dbStore['Teacher Substitution'].rows.map(s => {
      const orig = String(s.original_teacher || '').toLowerCase().trim();
      const subst = String(s.substitute_teacher || '').toLowerCase().trim();
      const matchOrig = teacherMap.get(orig);
      const matchSub = teacherMap.get(subst);
      return {
        ...s,
        original_teacher: matchOrig ? matchOrig.teacher_id : s.original_teacher,
        substitute_teacher: matchSub ? matchSub.teacher_id : s.substitute_teacher
      };
    });
  }

  // 5. Cascade to Homework List
  if (dbStore['Homework List'] && Array.isArray(dbStore['Homework List'].rows)) {
    dbStore['Homework List'].rows = dbStore['Homework List'].rows.map(hw => {
      const assigned = String(hw.assigned_by || '').toLowerCase().trim();
      const matched = teacherMap.get(assigned);
      if (matched) {
        return {
          ...hw,
          assigned_by: matched.teacher_id
        };
      }
      return hw;
    });
  }

  return dbStore;
}

export function saveMasterTeachers(updatedTeachersList) {
  let currentDb = getStoredDb();
  const currentTbl = currentDb['Teacher List'] || INITIAL_DB_STORE['Teacher List'];
  currentDb = {
    ...currentDb,
    'Teacher List': {
      ...currentTbl,
      rows: updatedTeachersList
    }
  };

  // Trigger Automatic Cascading Updates Across All Dependent Relational Sections
  currentDb = cascadeTeacherUpdates(updatedTeachersList, currentDb);

  saveStoredDb(currentDb);
  broadcastLiveEvent('teacher_updated', { teachers: updatedTeachersList });
  broadcastLiveEvent('teacher_cascaded_update', { dbStore: currentDb });
}

// Synchronize Teacher across all datasets and dependent relations
export function syncTeacherAcrossAllDatasets(teacherIdentifier, teacherUpdates = {}) {
  let db = getStoredDb();
  const teachers = [...(db['Teacher List']?.rows || INITIAL_DB_STORE['Teacher List'].rows)];
  const cleanId = String(teacherIdentifier || '').toLowerCase().trim();

  let targetTeacher = null;
  const updatedTeachers = teachers.map(t => {
    const tid = String(t.teacher_number || t.teacher_id || t.id || '').toLowerCase().trim();
    const tname = String(t.name || t.full_name || '').toLowerCase().trim();
    if (tid === cleanId || tname === cleanId || tid.includes(cleanId) || cleanId.includes(tid)) {
      targetTeacher = {
        ...t,
        ...teacherUpdates,
        teacher_number: teacherUpdates.teacher_number || t.teacher_number || t.id,
        name: teacherUpdates.name || teacherUpdates.full_name || t.name
      };
      return targetTeacher;
    }
    return t;
  });

  if (targetTeacher) {
    db['Teacher List'].rows = updatedTeachers;
    db = cascadeTeacherUpdates(updatedTeachers, db);
    saveStoredDb(db);
    broadcastLiveEvent('teacher_updated', { teacher: targetTeacher, teachers: updatedTeachers });
    broadcastLiveEvent('teacher_cascaded_update', { dbStore: db });
  }

  return { success: true, teacher: targetTeacher, dbStore: db };
}

// Master Helpers for Non-Teaching Staff & Personnel
export function getMasterStaff() {
  const db = getStoredDb();
  if (db['Staff & Personnel'] && Array.isArray(db['Staff & Personnel'].rows)) {
    return db['Staff & Personnel'].rows;
  }
  return isMasterOrDemoTenant(getActiveTenantId()) ? INITIAL_DB_STORE['Staff & Personnel'].rows : [];
}

export function cascadeStaffUpdates(updatedStaffList, dbStore) {
  if (!dbStore || !Array.isArray(updatedStaffList)) return dbStore;
  if (dbStore['employees'] && Array.isArray(dbStore['employees'].rows)) {
    dbStore['employees'].rows = updatedStaffList;
  }
  return dbStore;
}

export function saveMasterStaff(updatedStaffList) {
  let currentDb = getStoredDb();
  const currentTbl = currentDb['Staff & Personnel'] || INITIAL_DB_STORE['Staff & Personnel'];
  currentDb = {
    ...currentDb,
    'Staff & Personnel': {
      ...currentTbl,
      rows: updatedStaffList
    }
  };
  currentDb = cascadeStaffUpdates(updatedStaffList, currentDb);
  saveStoredDb(currentDb);
  broadcastLiveEvent('staff_updated', { staff: updatedStaffList });
  broadcastLiveEvent('db_store_updated', currentDb);
}

export function syncStaffAcrossAllDatasets(staffIdentifier, staffUpdates = {}) {
  let db = getStoredDb();
  const staffList = [...(db['Staff & Personnel']?.rows || (isMasterOrDemoTenant(getActiveTenantId()) ? INITIAL_DB_STORE['Staff & Personnel'].rows : []))];
  const cleanId = String(staffIdentifier || '').toLowerCase().trim();

  let targetStaff = null;
  const updated = staffList.map(s => {
    const sid = String(s.staff_id || s.id || '').toLowerCase().trim();
    const sname = String(s.name || '').toLowerCase().trim();
    if (sid === cleanId || sname === cleanId || sid.includes(cleanId) || cleanId.includes(sid)) {
      targetStaff = {
        ...s,
        ...staffUpdates,
        staff_id: staffUpdates.staff_id || s.staff_id,
        name: staffUpdates.name || s.name
      };
      return targetStaff;
    }
    return s;
  });

  if (targetStaff) {
    db['Staff & Personnel'].rows = updated;
    db = cascadeStaffUpdates(updated, db);
    saveStoredDb(db);
    broadcastLiveEvent('staff_updated', { staffMember: targetStaff, staff: updated });
  }

  return { success: true, staff: targetStaff, dbStore: db };
}

// Master Helpers for School Administrators
export function getMasterAdmins() {
  const db = getStoredDb();
  if (db['Admin List'] && Array.isArray(db['Admin List'].rows)) {
    return db['Admin List'].rows;
  }
  return isMasterOrDemoTenant(getActiveTenantId()) ? INITIAL_DB_STORE['Admin List'].rows : [];
}

export function cascadeAdminUpdates(updatedAdminsList, dbStore) {
  if (!dbStore || !Array.isArray(updatedAdminsList)) return dbStore;
  return dbStore;
}

export function saveMasterAdmins(updatedAdminsList) {
  let currentDb = getStoredDb();
  const currentTbl = currentDb['Admin List'] || INITIAL_DB_STORE['Admin List'];
  currentDb = {
    ...currentDb,
    'Admin List': {
      ...currentTbl,
      rows: updatedAdminsList
    }
  };
  currentDb = cascadeAdminUpdates(updatedAdminsList, currentDb);
  saveStoredDb(currentDb);
  broadcastLiveEvent('admin_updated', { admins: updatedAdminsList });
  broadcastLiveEvent('db_store_updated', currentDb);
}

export function syncAdminAcrossAllDatasets(adminIdentifier, adminUpdates = {}) {
  let db = getStoredDb();
  const adminList = [...(db['Admin List']?.rows || (isMasterOrDemoTenant(getActiveTenantId()) ? INITIAL_DB_STORE['Admin List'].rows : []))];
  const cleanId = String(adminIdentifier || '').toLowerCase().trim();

  let targetAdmin = null;
  const updated = adminList.map(a => {
    const aid = String(a.admin_id || a.id || '').toLowerCase().trim();
    const aname = String(a.name || '').toLowerCase().trim();
    if (aid === cleanId || aname === cleanId || aid.includes(cleanId) || cleanId.includes(aid)) {
      targetAdmin = {
        ...a,
        ...adminUpdates,
        admin_id: adminUpdates.admin_id || a.admin_id,
        name: adminUpdates.name || a.name
      };
      return targetAdmin;
    }
    return a;
  });

  if (targetAdmin) {
    db['Admin List'].rows = updated;
    saveStoredDb(db);
    broadcastLiveEvent('admin_updated', { admin: targetAdmin, admins: updated });
  }

  return { success: true, admin: targetAdmin, dbStore: db };
}

// Master Helpers for Parents & Guardians
export function getMasterParents() {
  const db = getStoredDb();
  if (db['Parent List'] && Array.isArray(db['Parent List'].rows)) {
    return db['Parent List'].rows;
  }
  return isMasterOrDemoTenant(getActiveTenantId()) ? INITIAL_DB_STORE['Parent List'].rows : [];
}

export function cascadeParentUpdates(updatedParentsList, dbStore) {
  if (!dbStore || !Array.isArray(updatedParentsList)) return dbStore;
  const parentMap = new Map();
  updatedParentsList.forEach(p => {
    const pid = String(p.parent_id || p.id || '').toLowerCase().trim();
    const pname = String(p.name || '').toLowerCase().trim();
    const childId = String(p.child || '').toLowerCase().trim();
    const data = {
      parent_id: p.parent_id || p.id,
      name: p.name,
      phone: p.phone,
      email: p.email,
      child: p.child,
      relation: p.relation
    };
    if (pid) parentMap.set(pid, data);
    if (pname) parentMap.set(pname, data);
    if (childId) parentMap.set(childId, data);
  });

  // Cascade parent updates to student father/mother details
  if (dbStore['Student List'] && Array.isArray(dbStore['Student List'].rows)) {
    dbStore['Student List'].rows = dbStore['Student List'].rows.map(stu => {
      const sid = String(stu.student_id || stu.id || '').toLowerCase().trim();
      const pid = String(stu.parent_id || '').toLowerCase().trim();
      const matched = parentMap.get(sid) || parentMap.get(pid);
      if (matched) {
        const isMother = matched.relation && matched.relation.toLowerCase().includes('mother');
        return {
          ...stu,
          father_name: !isMother ? matched.name : stu.father_name,
          father_phone: !isMother ? matched.phone : stu.father_phone,
          mother_name: isMother ? matched.name : stu.mother_name,
          mother_phone: isMother ? matched.phone : stu.mother_phone,
          parent_id: matched.parent_id || stu.parent_id
        };
      }
      return stu;
    });
  }
  return dbStore;
}

export function saveMasterParents(updatedParentsList) {
  let currentDb = getStoredDb();
  const currentTbl = currentDb['Parent List'] || INITIAL_DB_STORE['Parent List'];
  currentDb = {
    ...currentDb,
    'Parent List': {
      ...currentTbl,
      rows: updatedParentsList
    }
  };
  currentDb = cascadeParentUpdates(updatedParentsList, currentDb);
  saveStoredDb(currentDb);
  broadcastLiveEvent('parent_updated', { parents: updatedParentsList });
  broadcastLiveEvent('db_store_updated', currentDb);
}

export function syncParentAcrossAllDatasets(parentIdentifier, parentUpdates = {}) {
  let db = getStoredDb();
  const parentList = [...(db['Parent List']?.rows || (isMasterOrDemoTenant(getActiveTenantId()) ? INITIAL_DB_STORE['Parent List'].rows : []))];
  const cleanId = String(parentIdentifier || '').toLowerCase().trim();

  let targetParent = null;
  const updated = parentList.map(p => {
    const pid = String(p.parent_id || p.id || '').toLowerCase().trim();
    const pname = String(p.name || '').toLowerCase().trim();
    if (pid === cleanId || pname === cleanId || pid.includes(cleanId) || cleanId.includes(pid)) {
      targetParent = {
        ...p,
        ...parentUpdates,
        parent_id: parentUpdates.parent_id || p.parent_id,
        name: parentUpdates.name || p.name
      };
      return targetParent;
    }
    return p;
  });

  if (targetParent) {
    db['Parent List'].rows = updated;
    db = cascadeParentUpdates(updated, db);
    saveStoredDb(db);
    broadcastLiveEvent('parent_updated', { parent: targetParent, parents: updated });
  }

  return { success: true, parent: targetParent, dbStore: db };
}

// Master Helpers for Classes & Batches
export function getMasterClasses() {
  const db = getStoredDb();
  if (db['Class & Batch List'] && Array.isArray(db['Class & Batch List'].rows)) {
    return db['Class & Batch List'].rows;
  }
  return isMasterOrDemoTenant(getActiveTenantId()) ? INITIAL_DB_STORE['Class & Batch List'].rows : [];
}

export function saveMasterClasses(updatedClassesList) {
  let currentDb = getStoredDb();
  const currentTbl = currentDb['Class & Batch List'] || INITIAL_DB_STORE['Class & Batch List'];
  currentDb = {
    ...currentDb,
    'Class & Batch List': {
      ...currentTbl,
      rows: updatedClassesList
    }
  };
  saveStoredDb(currentDb);
  broadcastLiveEvent('class_updated', { classes: updatedClassesList });
  broadcastLiveEvent('db_store_updated', currentDb);
}

export function syncClassAcrossAllDatasets(batchIdentifier, classUpdates = {}) {
  let db = getStoredDb();
  const classesList = [...(db['Class & Batch List']?.rows || (isMasterOrDemoTenant(getActiveTenantId()) ? INITIAL_DB_STORE['Class & Batch List'].rows : []))];
  const cleanId = String(batchIdentifier || '').toLowerCase().trim();

  let targetClass = null;
  const updated = classesList.map(c => {
    const bid = String(c.batch_id || c.id || '').toLowerCase().trim();
    const bname = String(c.batch_name || c.name || '').toLowerCase().trim();
    if (bid === cleanId || bname === cleanId || bid.includes(cleanId) || cleanId.includes(bid)) {
      targetClass = {
        ...c,
        ...classUpdates,
        batch_id: classUpdates.batch_id || c.batch_id,
        batch_name: classUpdates.batch_name || classUpdates.name || c.batch_name
      };
      return targetClass;
    }
    return c;
  });

  if (targetClass) {
    db['Class & Batch List'].rows = updated;
    saveStoredDb(db);
    broadcastLiveEvent('class_updated', { batch: targetClass, classes: updated });
  }

  return { success: true, batch: targetClass, dbStore: db };
}

// Master Helpers for Operational Expenses & P&L (Profit & Loss)
export function getMasterExpenses() {
  const db = getStoredDb();
  if (db['Operational Expenses (P&L)'] && Array.isArray(db['Operational Expenses (P&L)'].rows)) {
    return db['Operational Expenses (P&L)'].rows;
  }
  return isMasterOrDemoTenant(getActiveTenantId()) ? INITIAL_DB_STORE['Operational Expenses (P&L)'].rows : [];
}

export function saveMasterExpenses(updatedExpensesList) {
  let currentDb = getStoredDb();
  const currentTbl = currentDb['Operational Expenses (P&L)'] || INITIAL_DB_STORE['Operational Expenses (P&L)'];
  currentDb = {
    ...currentDb,
    'Operational Expenses (P&L)': {
      ...currentTbl,
      rows: updatedExpensesList
    }
  };
  saveStoredDb(currentDb);
  broadcastLiveEvent('expense_updated', { expenses: updatedExpensesList });
  broadcastLiveEvent('db_store_updated', currentDb);
}

export function syncExpenseAcrossAllDatasets(expenseIdentifier, expenseUpdates = {}) {
  let db = getStoredDb();
  const expenses = [...(db['Operational Expenses (P&L)']?.rows || INITIAL_DB_STORE['Operational Expenses (P&L)'].rows)];
  const cleanId = String(expenseIdentifier || '').toLowerCase().trim();

  let targetExp = null;
  const updated = expenses.map(e => {
    const eid = String(e.expense_id || e.id || '').toLowerCase().trim();
    const ename = String(e.title || e.category || e.description || '').toLowerCase().trim();
    if (eid === cleanId || ename === cleanId || eid.includes(cleanId) || cleanId.includes(eid)) {
      targetExp = {
        ...e,
        ...expenseUpdates,
        expense_id: expenseUpdates.expense_id || e.expense_id,
        amount: expenseUpdates.amount !== undefined ? Number(expenseUpdates.amount) : e.amount
      };
      return targetExp;
    }
    return e;
  });

  if (targetExp) {
    db['Operational Expenses (P&L)'].rows = updated;
    saveStoredDb(db);
    broadcastLiveEvent('expense_updated', { expense: targetExp, expenses: updated });
  }

  return { success: true, expense: targetExp, dbStore: db };
}

// Comprehensive Live P&L (Profit & Loss) Metric Evaluator
export function calculatePnLMetrics() {
  const db = getStoredDb();
  const students = db['Student List']?.rows || [];
  const teachers = db['Teacher List']?.rows || [];
  const staff = db['Staff & Personnel']?.rows || [];
  const invoices = db['Fee Invoices & Ledger']?.rows || [];
  const expenses = db['Operational Expenses (P&L)']?.rows || [];
  const subscriptions = db['SaaS Subscriptions & Billing']?.rows || [];

  // 1. Fee Invoices Revenue Breakdown
  const paidInvoicesTotal = invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const totalBilledFees = invoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const pendingFees = invoices
    .filter(i => i.status === 'Pending' || i.status === 'Unpaid')
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  // Student base tuition
  const calculatedTuitionRevenue = students.length * 35000;
  const grossRevenue = paidInvoicesTotal > 0 ? paidInvoicesTotal : calculatedTuitionRevenue;

  // 2. Operational Expenses Breakdown
  const facultyPayroll = teachers.reduce((sum, t) => sum + (Number(t.monthly_salary) || 60000), 0);
  const staffPayroll = staff.reduce((sum, s) => sum + (Number(s.salary) || 28000), 0);
  const totalPayroll = facultyPayroll + staffPayroll;

  const operationalExpensesTotal = expenses
    .filter(e => e.status === 'Paid' || e.type === 'operational')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const saasSubscriptionsTotal = subscriptions
    .reduce((sum, s) => sum + (Number(s.monthly_cost || s.amount) || 0), 0);

  const totalOperatingExpenses = totalPayroll + operationalExpensesTotal + saasSubscriptionsTotal;
  const netProfitLoss = grossRevenue - totalOperatingExpenses;
  const operatingMargin = grossRevenue > 0 ? Number(((netProfitLoss / grossRevenue) * 100).toFixed(1)) : 0;

  return {
    grossRevenue,
    paidInvoicesTotal,
    totalBilledFees,
    pendingFees,
    totalOperatingExpenses,
    facultyPayroll,
    staffPayroll,
    totalPayroll,
    operationalExpensesTotal,
    saasSubscriptionsTotal,
    netProfitLoss,
    operatingMargin,
    expensesList: expenses,
    invoicesList: invoices,
    teachersCount: teachers.length,
    studentsCount: students.length,
    staffCount: staff.length
  };
}

export function transferStudentClass(studentIdentifier, newClassId, newClassName) {
  const students = [...getMasterStudents()];
  const cleanId = String(studentIdentifier || '').toLowerCase().trim();
  
  let found = false;
  const updatedStudents = students.map(s => {
    const sid = String(s.student_id || s.id || '').toLowerCase().trim();
    const sname = String(s.name || s.student_name || '').toLowerCase().trim();
    const sroll = String(s.roll_no || '').toLowerCase().trim();
    
    if (sid === cleanId || sname === cleanId || sroll === cleanId || sid.includes(cleanId) || cleanId.includes(sid)) {
      found = true;
      return {
        ...s,
        class_batch: newClassName || newClassId,
        batch_id: newClassId
      };
    }
    return s;
  });

  if (found) {
    saveMasterStudents(updatedStudents);
    broadcastLiveEvent('student_transferred', {
      student_id: studentIdentifier,
      new_class_id: newClassId,
      new_class_name: newClassName
    });
  }
  return updatedStudents;
}

// Calculate dynamic attendance rate for a student from live attendance logs
export function calculateStudentAttendanceRate(studentId, defaultRate = 96.5) {
  const db = getStoredDb();
  const records = db['Attendance Records']?.rows || [];
  const cleanId = String(studentId || '').toLowerCase().replace(/\s+/g, '');
  const studentRecords = records.filter(r => {
    const rSid = String(r.student_id || r.student || '').toLowerCase().replace(/\s+/g, '');
    return rSid === cleanId || cleanId.includes(rSid) || rSid.includes(cleanId);
  });

  if (studentRecords.length === 0) return defaultRate;
  const presentCount = studentRecords.filter(r => r.status === 'Present').length;
  return Number(((presentCount / studentRecords.length) * 100).toFixed(1));
}

// Calculate dynamic fee dues for a student from live fee invoice ledger
export function calculateStudentFeeDues(studentId, studentName = '') {
  const db = getStoredDb();
  const invoices = db['Fee Invoices & Ledger']?.rows || [];
  const cleanId = String(studentId || '').toLowerCase().replace(/\s+/g, '');
  const cleanName = String(studentName || '').toLowerCase().trim();

  const studentInvoices = invoices.filter(inv => {
    const invSid = String(inv.student_id || '').toLowerCase().replace(/\s+/g, '');
    const invName = String(inv.student_name || '').toLowerCase().trim();
    return (cleanId && invSid === cleanId) || (cleanName && invName === cleanName);
  });

  const unpaidInvoices = studentInvoices.filter(inv => inv.status === 'Pending' || inv.status === 'Unpaid');
  const totalDue = unpaidInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const isPaid = studentInvoices.length > 0 ? unpaidInvoices.length === 0 : true;

  return {
    totalDue,
    fee_status: isPaid ? 'Paid' : 'Pending',
    invoices: studentInvoices
  };
}

// --- UNIFIED API OBJECT ---
export const api = {
  // Auth
  async login(username, password) {
    const result = await safeFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (result && result.user) return result;

    const u = (username || '').toLowerCase().trim();
    
    // Check master users
    const fallbackUser = FALLBACK_DATA.users.find(acc => 
      acc.username?.toLowerCase() === u || 
      acc.id?.toLowerCase() === u || 
      acc.student_id?.toLowerCase() === u
    );

    if (fallbackUser) {
      return {
        user: fallbackUser,
        token: 'mock-jwt-token-' + fallbackUser.role
      };
    }

    // Dynamic Student Lookup from Master DB
    const masterStudents = getMasterStudents();
    const matchedStudent = masterStudents.find(s => {
      const sId = String(s.student_id || s.id || '').toLowerCase().trim();
      const sName = String(s.name || s.student_name || '').toLowerCase().trim();
      const sFirstName = sName.split(' ')[0];
      const sRoll = String(s.roll_no || '').toLowerCase().trim();
      const sEmail = String(s.email || '').toLowerCase().trim();
      return u === sId || u === sName || u === sFirstName || u === sRoll || u === sEmail;
    });

    if (matchedStudent) {
      const feeInfo = calculateStudentFeeDues(matchedStudent.student_id, matchedStudent.name);
      const studentUser = {
        id: matchedStudent.student_id,
        student_id: matchedStudent.student_id,
        username: (matchedStudent.name || 'student').toLowerCase().replace(/\s+/g, ''),
        full_name: matchedStudent.name,
        role: 'student',
        email: matchedStudent.email || 'student@nairee.edu',
        status: matchedStudent.status || 'Active',
        batch_name: matchedStudent.class_batch || 'Class 10 - Section A',
        student_batch: matchedStudent.class_batch || 'Class 10 - Section A',
        roll_number: matchedStudent.roll_no || '01',
        fee_status: feeInfo.fee_status,
        balance_due: feeInfo.totalDue,
        student: {
          name: matchedStudent.student_id,
          student_name: matchedStudent.name,
          roll_no: matchedStudent.roll_no,
          student_batch: matchedStudent.class_batch
        }
      };
      return { user: studentUser, token: 'mock-jwt-token-student' };
    }

    // Dynamic Teacher Lookup from Master DB
    const masterTeachers = getMasterTeachers();
    const matchedTeacher = masterTeachers.find(t => {
      const tNum = String(t.teacher_number || '').toLowerCase().replace(/\s+/g, '');
      const tName = String(t.name || '').toLowerCase().trim();
      const tEmail = String(t.email || '').toLowerCase().trim();
      const cleanU = u.replace(/\s+/g, '');
      return cleanU === tNum || u === tName || u === tEmail || tName.includes(u);
    });

    if (matchedTeacher) {
      const teacherUser = {
        id: matchedTeacher.teacher_number,
        teacher_number: matchedTeacher.teacher_number,
        username: matchedTeacher.name.toLowerCase().replace(/\s+/g, '_'),
        full_name: matchedTeacher.name,
        role: 'teacher',
        email: matchedTeacher.email,
        department: matchedTeacher.department,
        designation: matchedTeacher.designation,
        status: matchedTeacher.status || 'Active'
      };
      return { user: teacherUser, token: 'mock-jwt-token-teacher' };
    }

    if (u === 'admin' || u === 'principal') {
      return { user: FALLBACK_DATA.users[0], token: 'mock-jwt-admin' };
    }

    throw new Error('Invalid credentials. Use "admin", "teacher_jenkins", "nairee", or student ID "NIS-2024-091-001".');
  },

  // Dashboard Metrics & Live Aggregations
  async getDashboardStats() {
    const data = await safeFetch('/dashboard/stats');
    if (data) return data;

    const db = getStoredDb();
    const students = db['Student List']?.rows || [];
    const teachers = db['Teacher List']?.rows || [];
    const invoices = db['Fee Invoices & Ledger']?.rows || [];
    const attendance = db['Attendance Records']?.rows || [];

    const totalStudents = students.length;
    const totalTeachers = teachers.length;

    const totalBilled = invoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const totalCollected = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const totalOutstanding = invoices.filter(i => i.status === 'Pending' || i.status === 'Unpaid').reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

    const presentAttendance = attendance.filter(a => a.status === 'Present').length;
    const attendanceRate = attendance.length > 0 ? ((presentAttendance / attendance.length) * 100).toFixed(1) + '%' : '0%';

    return {
      students: totalStudents,
      teachers: totalTeachers,
      total_students: totalStudents,
      total_teachers: totalTeachers,
      attendance_rate: attendanceRate,
      fee_collection_rate: `${collectionRate}%`,
      active_courses: db['Subjects List']?.rows?.length || 0,
      pending_homework: db['Homework List']?.rows?.length || 0,
      finance: {
        totalBilled,
        totalCollected,
        totalOutstanding,
        collectionRate
      }
    };
  },

  // Master Students with Live Aggregated Calculations
  async getStudents(batch = '', search = '') {
    const params = new URLSearchParams();
    if (batch) params.append('batch', batch);
    if (search) params.append('search', search);
    const data = await safeFetch(`/students?${params.toString()}`);
    if (data) return data;

    let list = getMasterStudents();
    if (batch && batch !== 'all') {
      const normQuery = normalizeBatchAndClass(batch);
      const cleanBId = normQuery.batch_id.toLowerCase();
      const cleanBName = normQuery.class_batch.toLowerCase();
      const cleanRaw = batch.toLowerCase().replace(/[^a-z0-9]/g, '');

      list = list.filter(s => {
        const sNorm = normalizeBatchAndClass(s.class_batch || s.student_batch || s.batch_id);
        const sBId = sNorm.batch_id.toLowerCase();
        const sBName = sNorm.class_batch.toLowerCase();
        const sRaw = (s.batch_id || s.class_batch || '').toLowerCase().replace(/[^a-z0-9]/g, '');

        return sBId === cleanBId || sBName === cleanBName || sRaw === cleanRaw;
      });
    }
    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(s => 
        (s.name || '').toLowerCase().includes(q) || 
        (s.roll_no || '').toLowerCase().includes(q) ||
        (s.student_id || '').toLowerCase().includes(q) ||
        (s.class_batch || '').toLowerCase().includes(q)
      );
    }

    return list.map(s => {
      const feeInfo = calculateStudentFeeDues(s.student_id, s.name);
      const attRate = calculateStudentAttendanceRate(s.student_id);
      return {
        ...s,
        id: s.student_id,
        name: s.name,
        student_name: s.name,
        roll_no: s.roll_no,
        roll_number: s.roll_no,
        student_batch: s.class_batch,
        batch_name: s.class_batch,
        attendance_percentage: attRate,
        fee_status: feeInfo.fee_status,
        balance_due: feeInfo.totalDue,
        fee_due: feeInfo.totalDue,
        fee_paid: feeInfo.totalDue === 0 ? 43500 : 0
      };
    });
  },

  async getStudentDetail(id) {
    const data = await safeFetch(`/students/${id}`);
    if (data) return data;

    const cleanId = String(id || '').toLowerCase().trim();
    const master = getMasterStudents();
    const found = master.find(s => {
      const sId = String(s.student_id || '').toLowerCase().trim();
      const sName = String(s.name || '').toLowerCase().trim();
      const sFirstName = sName.split(' ')[0];
      const sRoll = String(s.roll_no || '').toLowerCase().trim();
      return cleanId === sId || cleanId === sName || cleanId === sFirstName || cleanId === sRoll || cleanId.includes(sId) || sId.includes(cleanId);
    }) || master[0];

    if (found) {
      const feeInfo = calculateStudentFeeDues(found.student_id, found.name);
      const attRate = calculateStudentAttendanceRate(found.student_id);
      const db = getStoredDb();
      const allResults = db['Assessment Results']?.rows || [];
      const studentResults = allResults.filter(
        r => r.student_id === found.student_id || r.student_name === found.name
      ).map(r => ({
        ...r,
        name: r.result_id,
        id: r.result_id
      }));

      return {
        ...found,
        id: found.student_id,
        student_id: found.student_id,
        full_name: found.name,
        student_name: found.name,
        roll_number: found.roll_no,
        student_batch: found.class_batch,
        batch_name: found.class_batch,
        attendance: { percentage: attRate },
        attendance_percentage: attRate,
        fee_status: feeInfo.fee_status,
        balance_due: feeInfo.totalDue,
        feeDues: feeInfo.totalDue,
        assessments: studentResults,
        guardian_name: found.father_name || found.mother_name || 'Guardian',
        guardian_mobile: found.father_phone || found.mother_phone || found.phone
      };
    }
    return master[0];
  },

  async createStudent(studentData) {
    const data = await safeFetch('/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    if (data) return data;

    const master = getMasterStudents();
    const nextNum = master.length + 1;
    const admissionYear = studentData.admission_year || (studentData.admission_date ? new Date(studentData.admission_date).getFullYear() : '2024');
    const aadhaar = studentData.aadhaar_no || `9876 5432 109${nextNum}`;
    const newStudentId = (studentData.student_id && isIdUnique('Student List', studentData.student_id))
      ? studentData.student_id
      : getGuaranteedUniqueStudentId({
          schoolCode: studentData.school_code || 'NIS',
          admissionYear: admissionYear,
          aadhaarNo: aadhaar,
          startSequence: nextNum
        });
    const newRoll = studentData.roll_no || String(nextNum).padStart(2, '0');

    const newStudent = {
      student_id: newStudentId,
      name: studentData.student_name || studentData.full_name || `${studentData.first_name || 'New'} ${studentData.last_name || 'Student'}`.trim(),
      roll_no: studentData.roll_no || newRoll,
      class_batch: studentData.class_batch || studentData.student_batch || 'Class 10 - Section A',
      batch_id: 'CLS-10A',
      stream: studentData.stream || 'Computer Applications & Math',
      gender: studentData.gender || 'Female',
      dob: studentData.date_of_birth || studentData.dob || '2011-05-15',
      blood_group: studentData.blood_group || 'O+',
      aadhaar_no: aadhaar,
      phone: studentData.phone || studentData.student_mobile_number || '+91 98765 00000',
      email: studentData.email || studentData.student_email_id || `${(studentData.student_name || 'student').toLowerCase().replace(/\s+/g, '')}@student.nairee.edu`,
      residential_address: studentData.residential_address || studentData.address_line_1 || 'Bengaluru',
      permanent_address: studentData.permanent_address || studentData.address_line_1 || 'Bengaluru',
      fee_status: 'Pending',
      father_name: studentData.father_name || studentData.parent_name || 'Father',
      father_phone: studentData.father_phone || studentData.parent_phone || '+91 98765 00000',
      father_occupation: studentData.father_occupation || 'Professional',
      mother_name: studentData.mother_name || 'Mother',
      mother_phone: studentData.mother_phone || '+91 98765 00000',
      mother_occupation: studentData.mother_occupation || 'Homemaker',
      status: 'Active'
    };

    const updated = [newStudent, ...master];
    saveMasterStudents(updated);

    // Direct Supabase PostgreSQL Insertion
    try {
      if (supabase) {
        const activeTenantId = (typeof localStorage !== 'undefined' ? localStorage.getItem('nairee_active_tenant_id') : 'tenant-default') || 'tenant-default';
        const dbPayload = {
          admission_no: newStudentId,
          tenant_id: activeTenantId,
          name: newStudent.name,
          roll_no: String(newStudent.roll_no),
          class: studentData.class || 'Class 10',
          section: studentData.section || 'A',
          gender: newStudent.gender || 'Female',
          dob: newStudent.dob || '2011-05-15',
          admission_date: new Date().toISOString().split('T')[0],
          residential_address: newStudent.residential_address || 'Bengaluru',
          permanent_address: newStudent.permanent_address || 'Bengaluru',
          phone: newStudent.phone,
          email: newStudent.email,
          fee_status: 'Pending',
          status: 'Active'
        };

        const { data: dbData, error: dbErr } = await supabase
          .from('students')
          .insert([dbPayload])
          .select()
          .single();

        if (dbErr) {
          console.warn('Supabase student insert notice:', dbErr);
        }
      }
    } catch (dbEx) {
      console.warn('Supabase direct insert exception:', dbEx);
    }

    // Create default tuition fee invoice
    const db = getStoredDb();
    const invoices = db['Fee Invoices & Ledger']?.rows || [];
    invoices.unshift({
      invoice_id: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
      student_id: newStudentId,
      student_name: newStudent.name,
      title: 'Term 1 Tuition & Academic Fee',
      fee_type: 'Tuition Fee',
      amount: 35000,
      due_date: '2026-10-15',
      status: 'Pending',
      payment_date: null,
      receipt_no: null
    });
    db['Fee Invoices & Ledger'].rows = invoices;
    saveStoredDb(db);
    broadcastLiveEvent('student_created', newStudent);

    return newStudent;
  },

  async updateStudent(studentId, updates) {
    const data = await safeFetch(`/students/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (data) return data;

    const res = syncStudentAcrossAllDatasets(studentId, updates);
    return res.student;
  },

  async updateTeacher(teacherId, updates) {
    const data = await safeFetch(`/teachers/${teacherId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (data) return data;

    const master = getMasterTeachers();
    const cleanId = String(teacherId || '').toLowerCase().trim();
    let targetTeacher = null;
    const updated = master.map(t => {
      const tid = String(t.teacher_number || t.teacher_id || t.id || '').toLowerCase().trim();
      const tname = String(t.name || '').toLowerCase().trim();
      if (tid === cleanId || tname === cleanId || tid.includes(cleanId) || cleanId.includes(tid)) {
        targetTeacher = { ...t, ...updates };
        return targetTeacher;
      }
      return t;
    });

    if (targetTeacher) {
      saveMasterTeachers(updated);
    }
    return targetTeacher;
  },

  async createTeacher(teacherData) {
    const data = await safeFetch('/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacherData),
    });
    if (data) return data;

    const master = getMasterTeachers();
    const nextNum = master.length + 1;
    const joiningYear = teacherData.joining_year || (teacherData.joining_date ? new Date(teacherData.joining_date).getFullYear() : '2022');
    const aadhaar = teacherData.aadhaar_no || `9876 5432 8${nextNum.toString().padStart(2, '0')}`;
    const newTeacherId = (teacherData.teacher_number && isIdUnique('Teacher List', teacherData.teacher_number))
      ? teacherData.teacher_number
      : getGuaranteedUniqueTeacherId({
          schoolCode: teacherData.school_code || 'NIS',
          joiningYear: joiningYear,
          aadhaarNo: aadhaar,
          startSequence: nextNum
        });

    const newTeacher = {
      teacher_number: newTeacherId,
      name: teacherData.name || teacherData.full_name || 'Faculty Member',
      photo: teacherData.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      gender: teacherData.gender || 'Female',
      dob: teacherData.dob || '1990-05-15',
      blood_group: teacherData.blood_group || 'O+',
      aadhaar_no: aadhaar,
      email: teacherData.email || `${(teacherData.name || 'teacher').toLowerCase().replace(/\s+/g, '')}@nairee.edu`,
      phone: teacherData.phone || '+91 98765 00000',
      department: teacherData.department || 'Mathematics & Science',
      designation: teacherData.designation || 'Faculty Lead',
      qualification: teacherData.qualification || 'M.Sc., B.Ed',
      workload_hours: Number(teacherData.workload_hours) || 20,
      monthly_salary: Number(teacherData.monthly_salary) || 60000,
      joining_date: teacherData.joining_date || new Date().toISOString().split('T')[0],
      residential_address: teacherData.residential_address || 'Bengaluru',
      permanent_address: teacherData.permanent_address || 'Bengaluru',
      father_name: teacherData.father_name || '',
      father_occupation: teacherData.father_occupation || '',
      mother_name: teacherData.mother_name || '',
      mother_occupation: teacherData.mother_occupation || '',
      emergency_contact_phone: teacherData.emergency_contact_phone || '+91 98765 00000',
      bank_name: teacherData.bank_name || 'State Bank of India',
      bank_account_no: teacherData.bank_account_no || '',
      bank_ifsc: teacherData.bank_ifsc || '',
      bank_holder_name: teacherData.bank_holder_name || teacherData.name || '',
      pan_no: teacherData.pan_no || '',
      status: teacherData.status || 'Active'
    };

    const updated = [newTeacher, ...master];
    saveMasterTeachers(updated);
    return newTeacher;
  },

  // Classes & Batches
  async getBatches() {
    const data = await safeFetch('/batches');
    if (data) return data;
    const db = getStoredDb();
    const rows = db['Class & Batch List']?.rows || [];
    return rows.map(b => ({
      ...b,
      id: b.batch_id,
      name: b.batch_name,
      grade: b.batch_name.split('-')[0]?.trim() || 'Class 10',
      section: b.batch_name.split('Section')[1]?.trim() || 'A',
      room: b.room_no
    }));
  },

  // Courses & Subjects
  async getCourses() {
    const data = await safeFetch('/courses');
    if (data) return data;
    const db = getStoredDb();
    const rows = db['Subjects List']?.rows || [];
    return rows.map(c => ({
      ...c,
      id: c.subject_id,
      name: c.subject_name,
      code: c.subject_code,
      instructor: c.teacher
    }));
  },

  // Teachers & Faculty
  async getFaculty() {
    const data = await safeFetch('/faculty');
    if (data) return data;
    const teachers = getMasterTeachers();
    return teachers.map(t => ({
      ...t,
      id: t.teacher_number,
      full_name: t.name,
      salary: t.monthly_salary
    }));
  },

  async getTeachers() {
    return this.getFaculty();
  },

  // Schedule & Timetable
  async getSchedule(batch = '', day = '') {
    const params = new URLSearchParams();
    if (batch) params.append('batch', batch);
    if (day) params.append('day', day);
    const data = await safeFetch(`/schedule?${params.toString()}`);
    return data || FALLBACK_DATA.schedule;
  },

  // Attendance Records & Bulk Marking
  async getAttendance(batch = 'CLS-10A', date = '') {
    const params = new URLSearchParams();
    if (batch) params.append('batch', batch);
    if (date) params.append('date', date);
    const data = await safeFetch(`/attendance?${params.toString()}`);
    if (data) return data;

    const db = getStoredDb();
    const records = db['Attendance Records']?.rows || [];
    const masterStudents = getMasterStudents();
    const targetDate = date || '2026-10-05';

    // Filter students belonging to this batch/class
    const filteredStudents = masterStudents.filter(s => {
      if (!batch || batch === 'all') return true;
      const bLower = batch.toLowerCase().trim();
      const sBatchId = (s.batch_id || '').toLowerCase().trim();
      const sClassBatch = (s.class_batch || '').toLowerCase().trim();
      return sBatchId === bLower || sClassBatch === bLower || sClassBatch.includes(bLower) || bLower.includes(sBatchId);
    });

    const studentsWithAttendance = filteredStudents.map(s => {
      const sid = s.student_id;
      const existing = records.find(
        r => (r.student_id === sid || r.student_name === s.name) && r.date === targetDate
      );

      return {
        id: s.student_id,
        name: s.student_id,
        student: s.student_id,
        student_id: s.student_id,
        student_name: s.name,
        roll_no: s.roll_no || '01',
        roll_number: s.roll_no || '01',
        class_batch: s.class_batch || 'Class 10 - Section A',
        batch_id: s.batch_id || 'CLS-10A',
        image: s.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        status: existing ? existing.status : 'Present',
        remarks: existing?.remarks || ''
      };
    });

    const matchedRecords = records.filter(r => {
      const matchBatch = !batch || batch === 'all' || r.class_batch === batch || r.class_batch?.includes(batch);
      const matchDate = !date || r.date === targetDate;
      return matchBatch && matchDate;
    });

    return {
      students: studentsWithAttendance,
      records: matchedRecords,
      total: studentsWithAttendance.length,
      present_count: studentsWithAttendance.filter(s => s.status === 'Present').length,
      absent_count: studentsWithAttendance.filter(s => s.status === 'Absent').length
    };
  },

  async submitBulkAttendance(batch, date, records) {
    const data = await safeFetch('/attendance/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch, date, records }),
    });
    if (data) return data;

    const db = getStoredDb();
    const attTbl = db['Attendance Records'] || { rows: [], columns: [] };
    const currentRows = [...(attTbl.rows || [])];
    const targetDate = date || new Date().toISOString().split('T')[0];
    const masterStudents = getMasterStudents();

    if (Array.isArray(records)) {
      records.forEach(r => {
        const studentId = r.student_id || r.student || r.name;
        const studentName = r.student_name || r.name;
        const status = r.status || 'Present';
        const cleanSid = String(studentId).toLowerCase().trim();

        // Match student in master to ensure accurate roll_no and class_batch
        const matchedStudent = masterStudents.find(
          s => String(s.student_id).toLowerCase().trim() === cleanSid || String(s.name).toLowerCase().trim() === String(studentName).toLowerCase().trim()
        );

        const rollNo = matchedStudent ? matchedStudent.roll_no : (r.roll_no || '01');
        const classBatch = matchedStudent ? matchedStudent.class_batch : (r.class_batch || batch || 'Class 10 - Section A');
        const finalStudentId = matchedStudent ? matchedStudent.student_id : studentId;
        const finalStudentName = matchedStudent ? matchedStudent.name : studentName;

        const existingIdx = currentRows.findIndex(
          row => (String(row.student_id).toLowerCase().trim() === cleanSid || String(row.student_name).toLowerCase().trim() === String(finalStudentName).toLowerCase().trim()) && row.date === targetDate
        );

        if (existingIdx >= 0) {
          currentRows[existingIdx] = {
            ...currentRows[existingIdx],
            student_id: finalStudentId,
            student_name: finalStudentName,
            roll_no: rollNo,
            class_batch: classBatch,
            status,
            remarks: r.remarks || currentRows[existingIdx].remarks || ''
          };
        } else {
          currentRows.push({
            attendance_id: `ATT-${Date.now().toString().slice(-4)}-${Math.floor(Math.random()*100)}`,
            student_id: finalStudentId,
            student_name: finalStudentName,
            roll_no: rollNo,
            class_batch: classBatch,
            date: targetDate,
            status,
            remarks: r.remarks || ''
          });
        }
      });
    }

    db['Attendance Records'].rows = currentRows;
    saveStoredDb(db);
    broadcastLiveEvent('attendance_updated', { batch, date: targetDate, count: records.length });
    return { success: true, count: Array.isArray(records) ? records.length : 0 };
  },

  // Assessment Plans & Results
  async getAssessmentPlans() {
    const data = await safeFetch('/assessments/plans');
    if (data) return data;
    const db = getStoredDb();
    const rows = db['Assessment Plans']?.rows || [];
    return rows.map(p => ({
      ...p,
      name: p.plan_id,
      id: p.plan_id
    }));
  },

  async getAssessmentResults(params = {}) {
    const q = new URLSearchParams(params);
    const data = await safeFetch(`/assessments/results?${q.toString()}`);
    if (data) return data;

    const db = getStoredDb();
    const rows = db['Assessment Results']?.rows || [];
    const masterStudents = getMasterStudents();
    const planFilter = params.plan;

    let filtered = rows;
    if (planFilter && planFilter !== 'all') {
      filtered = rows.filter(r => r.plan_id === planFilter || r.assessment_plan === planFilter);
    }

    return filtered.map(r => {
      const matchedStudent = masterStudents.find(
        s => String(s.student_id).toLowerCase().trim() === String(r.student_id).toLowerCase().trim() ||
             String(s.name).toLowerCase().trim() === String(r.student_name).toLowerCase().trim()
      );

      const rollNo = matchedStudent ? matchedStudent.roll_no : (r.roll_no || '01');
      const classBatch = matchedStudent ? matchedStudent.class_batch : (r.class_batch || 'Class 10 - Section A');
      const studentName = matchedStudent ? matchedStudent.name : r.student_name;
      const studentId = matchedStudent ? matchedStudent.student_id : r.student_id;

      return {
        ...r,
        id: r.result_id,
        name: r.result_id,
        student_id: studentId,
        student: studentId,
        student_name: studentName,
        roll_no: rollNo,
        class_batch: classBatch,
        student_batch: classBatch
      };
    });
  },

  async submitGrade(data) {
    const res = await safeFetch('/assessments/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res) return res;

    const db = getStoredDb();
    const resTbl = db['Assessment Results'] || { rows: [], columns: [] };
    const currentRows = [...(resTbl.rows || [])];
    const masterStudents = getMasterStudents();

    const studentId = data.student || data.student_id || 'NIS-2024-091-001';
    const matchedStudent = masterStudents.find(
      s => String(s.student_id).toLowerCase().trim() === String(studentId).toLowerCase().trim() ||
           String(s.name).toLowerCase().trim() === String(data.student_name || '').toLowerCase().trim()
    );

    const finalStudentId = matchedStudent ? matchedStudent.student_id : studentId;
    const finalStudentName = matchedStudent ? matchedStudent.name : (data.student_name || 'Student');
    const rollNo = matchedStudent ? matchedStudent.roll_no : (data.roll_no || '01');
    const classBatch = matchedStudent ? matchedStudent.class_batch : (data.class_batch || 'Class 10 - Section A');

    const score = Number(data.score) || 0;
    const maxScore = Number(data.maximum_score) || 100;
    const pct = Number(((score / maxScore) * 100).toFixed(1));
    let grade = 'B';
    if (pct >= 90) grade = 'A+';
    else if (pct >= 80) grade = 'A';
    else if (pct >= 70) grade = 'B+';
    else if (pct >= 60) grade = 'B';
    else if (pct >= 50) grade = 'C';
    else grade = 'D';

    const newResult = {
      result_id: `RES-${Date.now().toString().slice(-4)}`,
      student_id: finalStudentId,
      student_name: finalStudentName,
      roll_no: rollNo,
      class_batch: classBatch,
      plan_id: data.assessment_plan || 'PLAN-001',
      assessment_plan: data.assessment_plan_name || data.assessment_plan || 'Mid-Term Examinations 2026',
      course: data.course || 'Mathematics',
      score,
      maximum_score: maxScore,
      percentage: pct,
      grade,
      comment: data.comment || 'Performance evaluated.'
    };

    const existingIdx = currentRows.findIndex(
      r => r.student_id === finalStudentId && r.plan_id === newResult.plan_id
    );

    if (existingIdx >= 0) {
      currentRows[existingIdx] = { ...currentRows[existingIdx], ...newResult };
    } else {
      currentRows.unshift(newResult);
    }

    db['Assessment Results'].rows = currentRows;
    saveStoredDb(db);
    broadcastLiveEvent('grade_updated', newResult);
    return { success: true, ...newResult };
  },

  // Fees & Financial Ledger
  async getFees(params = {}) {
    const q = new URLSearchParams(params);
    const data = await safeFetch(`/fees?${q.toString()}`);
    if (data) return data;

    const db = getStoredDb();
    const invoices = db['Fee Invoices & Ledger']?.rows || [];
    const masterStudents = getMasterStudents();
    const statusFilter = params.status;

    let filtered = invoices;
    if (statusFilter && statusFilter !== 'all') {
      filtered = invoices.filter(i => i.status === statusFilter);
    }

    return filtered.map(i => {
      const matchedStudent = masterStudents.find(
        s => String(s.student_id).toLowerCase().trim() === String(i.student_id).toLowerCase().trim() ||
             String(s.name).toLowerCase().trim() === String(i.student_name).toLowerCase().trim()
      );

      const rollNo = matchedStudent ? matchedStudent.roll_no : (i.roll_no || '01');
      const classBatch = matchedStudent ? matchedStudent.class_batch : (i.class_batch || 'Class 10 - Section A');
      const studentName = matchedStudent ? matchedStudent.name : i.student_name;
      const studentId = matchedStudent ? matchedStudent.student_id : i.student_id;

      return {
        ...i,
        id: i.invoice_id,
        name: i.invoice_id,
        student_id: studentId,
        student: studentId,
        student_name: studentName,
        roll_no: rollNo,
        student_batch: classBatch,
        class_batch: classBatch,
        grand_total: Number(i.amount) || 0,
        outstanding_amount: i.status === 'Paid' ? 0 : (Number(i.amount) || 0),
        components: [
          { id: 'FC-1', fee_category: i.fee_type || 'Tuition Fee', amount: Number(i.amount) || 35000 }
        ]
      };
    });
  },

  async payFee(invoiceId, paymentMethod = 'Online Gateway / UPI') {
    const data = await safeFetch('/fees/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fee_id: invoiceId, payment_method: paymentMethod }),
    });
    if (data) return data;

    const db = getStoredDb();
    const invoices = db['Fee Invoices & Ledger']?.rows || [];
    const receiptNo = `REC-2026-${Date.now().toString().slice(-4)}`;
    const paymentDate = new Date().toISOString().split('T')[0];

    const cleanInvId = String(invoiceId).toLowerCase().trim();
    let updatedStudentId = null;

    const updatedInvoices = invoices.map(inv => {
      if (String(inv.invoice_id).toLowerCase().trim() === cleanInvId) {
        updatedStudentId = inv.student_id;
        return {
          ...inv,
          status: 'Paid',
          payment_date: paymentDate,
          receipt_no: receiptNo
        };
      }
      return inv;
    });

    db['Fee Invoices & Ledger'].rows = updatedInvoices;

    // Recheck student fee status
    if (updatedStudentId) {
      const remainingUnpaid = updatedInvoices.filter(
        i => i.student_id === updatedStudentId && (i.status === 'Pending' || i.status === 'Unpaid')
      );
      const students = db['Student List']?.rows || [];
      db['Student List'].rows = students.map(s => {
        if (s.student_id === updatedStudentId) {
          return { ...s, fee_status: remainingUnpaid.length === 0 ? 'Paid' : 'Pending' };
        }
        return s;
      });
    }

    saveStoredDb(db);
    broadcastLiveEvent('fee_updated', { invoice_id: invoiceId, status: 'Paid', receipt_no: receiptNo });
    return {
      success: true,
      invoice_id: invoiceId,
      status: 'Paid',
      receipt_no: receiptNo,
      payment_date: paymentDate
    };
  },

  async settleStudentFee(studentIdentifier, amount = 0, paymentMethod = 'Online Gateway') {
    const db = getStoredDb();
    const cleanId = String(studentIdentifier || '').toLowerCase().trim();
    const invoices = db['Fee Invoices & Ledger']?.rows || [];
    const receiptNo = `REC-2026-${Date.now().toString().slice(-4)}`;
    const paymentDate = new Date().toISOString().split('T')[0];

    let studentName = '';
    const updatedInvoices = invoices.map(inv => {
      const invSid = String(inv.student_id || '').toLowerCase().trim();
      const invName = String(inv.student_name || '').toLowerCase().trim();
      if (invSid === cleanId || invName === cleanId || cleanId.includes(invSid) || cleanId.includes(invName)) {
        studentName = inv.student_name;
        return {
          ...inv,
          status: 'Paid',
          payment_date: paymentDate,
          receipt_no: receiptNo
        };
      }
      return inv;
    });

    db['Fee Invoices & Ledger'].rows = updatedInvoices;

    const students = db['Student List']?.rows || [];
    db['Student List'].rows = students.map(s => {
      const sid = String(s.student_id || '').toLowerCase().trim();
      const sname = String(s.name || '').toLowerCase().trim();
      if (sid === cleanId || sname === cleanId || cleanId.includes(sid) || cleanId.includes(sname)) {
        return { ...s, fee_status: 'Paid' };
      }
      return s;
    });

    saveStoredDb(db);
    broadcastLiveEvent('fee_updated', {
      student_id: studentIdentifier,
      student_name: studentName,
      status: 'Paid',
      receipt_no: receiptNo
    });

    return {
      success: true,
      student_name: studentName,
      receipt_no: receiptNo,
      status: 'Paid'
    };
  },

  // Teacher Attendance & Punch In/Out
  async getTeacherAttendance(date = '') {
    const db = getStoredDb();
    const rows = db['Teacher Attendance']?.rows || [];
    const targetDate = date || new Date().toISOString().split('T')[0];
    return rows.filter(r => !date || r.date === targetDate);
  },

  async punchTeacher(teacherNumber, teacherName, action = 'toggle') {
    const db = getStoredDb();
    const attTbl = db['Teacher Attendance'] || { rows: [], columns: [] };
    const currentRows = [...(attTbl.rows || [])];
    const today = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const cleanTNum = String(teacherNumber || 'NIS-2020-811-001').toUpperCase().trim();
    const existingIdx = currentRows.findIndex(r => r.teacher_number === cleanTNum && r.date === today);

    let status = 'On Duty';
    if (existingIdx >= 0) {
      if (currentRows[existingIdx].status === 'On Duty') {
        currentRows[existingIdx].punch_out = timeStr;
        currentRows[existingIdx].status = 'Completed Shift';
        status = 'Completed Shift';
      } else {
        currentRows[existingIdx].punch_in = timeStr;
        currentRows[existingIdx].status = 'On Duty';
        status = 'On Duty';
      }
    } else {
      currentRows.unshift({
        punch_id: `TP-${Date.now().toString().slice(-4)}`,
        teacher_number: cleanTNum,
        name: teacherName || 'Prof. Sarah Jenkins',
        date: today,
        punch_in: timeStr,
        punch_out: null,
        status: 'On Duty',
        hours_recorded: 8.0
      });
    }

    db['Teacher Attendance'].rows = currentRows;
    saveStoredDb(db);
    broadcastLiveEvent('teacher_punched', { teacher_number: cleanTNum, time: timeStr, status });
    return { success: true, status, time: timeStr };
  },

  // Performance Analysis
  async getStudentPerformance(batch = '') {
    const params = new URLSearchParams();
    if (batch && batch !== 'all') params.append('batch', batch);
    const data = await safeFetch(`/admin/student-performance?${params.toString()}`);
    if (data) return data;

    const students = await this.getStudents(batch);
    const db = getStoredDb();
    const marks = db['Assessment Results']?.rows || [];

    return students.map((s, idx) => {
      const stuMarks = marks.filter(m => m.student_id === s.student_id || m.student_name === s.name);
      const avgScore = stuMarks.length > 0 
        ? Math.round(stuMarks.reduce((sum, m) => sum + (Number(m.score) || 0), 0) / stuMarks.length)
        : (idx === 0 ? 98 : idx === 1 ? 88 : idx === 2 ? 94 : 85);

      const isFeePending = s.fee_status === 'Pending' || s.balance_due > 0;
      const isAttLow = s.attendance_percentage < 85;
      const isGradeLow = avgScore < 60;
      const isAtRisk = isFeePending || isAttLow || isGradeLow;

      const riskReasons = [];
      if (isFeePending) riskReasons.push(`Fee Due (₹${s.balance_due || 35000})`);
      if (isAttLow) riskReasons.push(`Low Attendance (${s.attendance_percentage}%)`);
      if (isGradeLow) riskReasons.push(`Low Grade (${avgScore}%)`);

      return {
        id: s.student_id,
        name: s.student_id,
        student_name: s.name,
        roll_no: s.roll_no,
        student_batch: s.class_batch,
        batch_name: s.class_batch,
        attendancePct: s.attendance_percentage,
        avgGrade: avgScore,
        feeDues: s.balance_due || 0,
        fee_status: s.fee_status,
        guardian_name: s.father_name || s.mother_name || 'Parent',
        guardian_mobile: s.father_phone || s.mother_phone || s.phone,
        isAtRisk,
        riskReasons
      };
    });
  },

  async getTeacherPerformance() {
    const data = await safeFetch('/admin/teacher-performance');
    if (data) return data;

    const teachers = getMasterTeachers();
    return teachers.map((t, idx) => ({
      id: t.teacher_number,
      name: t.name,
      department: t.department,
      designation: t.designation,
      assignedClasses: idx === 0 ? 3 : 2,
      syllabusCompletionRate: idx === 0 ? 90 : 85,
      studentAverageScore: idx === 0 ? 94 : 88,
      rating: 4.8 + (idx * 0.05),
      attendance_avg: '98%',
      syllabus_progress: `${idx === 0 ? 90 : 85}%`
    }));
  },

  // Parent Child Summary
  async getParentChildSummary(studentId) {
    const sDetail = await this.getStudentDetail(studentId);
    const db = getStoredDb();
    const invoices = db['Fee Invoices & Ledger']?.rows || [];
    const childInvoices = invoices.filter(i => i.student_id === sDetail.student_id || i.student_name === sDetail.name);

    return {
      student: sDetail,
      attendance: { rate: sDetail.attendance_percentage, total_days: 42, present_days: Math.round(42 * (sDetail.attendance_percentage / 100)) },
      fees: {
        status: sDetail.fee_status,
        totalDue: sDetail.balance_due,
        invoices: childInvoices
      },
      academics: {
        overall_gpa: '3.9',
        rank: '2nd in Class 10-A'
      }
    };
  },

  // Homework & Materials
  async getHomework(batch = '') {
    const db = getStoredDb();
    const rows = db['Homework List']?.rows || [];
    return rows;
  },

  async getHomeworkSubmissions(homeworkId = '') {
    const db = getStoredDb();
    const rows = db['Homework Submissions']?.rows || [];
    if (homeworkId) return rows.filter(r => r.homework_id === homeworkId);
    return rows;
  },

  async submitHomework(submissionData) {
    const db = getStoredDb();
    const subTbl = db['Homework Submissions'] || { rows: [], columns: [] };
    const rows = [...(subTbl.rows || [])];

    const newSubm = {
      submission_id: `SUBM-${Date.now().toString().slice(-4)}`,
      homework_id: submissionData.homework_id || 'HW-001',
      student_id: submissionData.student_id || 'NIS-2024-091-001',
      student_name: submissionData.student_name || 'Nairee Patel',
      submission_text: submissionData.submission_text || '',
      attachment_url: submissionData.attachment_url || '',
      submitted_at: new Date().toLocaleString(),
      status: 'Submitted',
      marks_awarded: null,
      teacher_feedback: ''
    };

    rows.unshift(newSubm);
    db['Homework Submissions'].rows = rows;
    saveStoredDb(db);
    broadcastLiveEvent('homework_submitted', newSubm);
    return { success: true, ...newSubm };
  },

  // Users & System Administration (Dynamic Unified Directory)
  async getUsers(role = '') {
    const params = new URLSearchParams();
    if (role && role !== 'all') params.append('role', role);
    const data = await safeFetch(`/admin/users?${params.toString()}`);
    if (data) return data;

    const db = getStoredDb();
    const admins = (db['Admin List']?.rows || []).map(a => ({
      id: a.admin_id || a.id,
      name: a.admin_id || a.id,
      username: (a.name || 'admin').toLowerCase().replace(/\s+/g, '_'),
      full_name: a.name,
      role: 'admin',
      email: a.email || 'admin@nairee.edu',
      status: a.status || 'Active',
      department: a.department || 'Administration'
    }));

    const teachers = (db['Teacher List']?.rows || []).map(t => ({
      id: t.teacher_number || t.id,
      name: t.teacher_number || t.id,
      username: (t.name || 'teacher').toLowerCase().replace(/\s+/g, '_'),
      full_name: t.name,
      role: 'teacher',
      email: t.email || `${t.name.toLowerCase().replace(/\s+/g, '')}@nairee.edu`,
      status: t.status || 'Active',
      department: t.department || 'Academics',
      phone: t.phone
    }));

    const staff = (db['Staff & Personnel']?.rows || []).map(s => ({
      id: s.staff_id || s.id,
      name: s.staff_id || s.id,
      username: (s.name || 'staff').toLowerCase().replace(/\s+/g, '_'),
      full_name: s.name,
      role: 'staff',
      email: s.email || `${s.name.toLowerCase().replace(/\s+/g, '')}@staff.nairee.edu`,
      status: s.status || 'Active',
      department: s.department || 'Support Operations',
      phone: s.phone
    }));

    const students = (db['Student List']?.rows || []).map(s => ({
      id: s.student_id || s.id,
      name: s.student_id || s.id,
      username: (s.name || 'student').toLowerCase().replace(/\s+/g, ''),
      full_name: s.name,
      role: 'student',
      email: s.email || `${s.name.toLowerCase().replace(/\s+/g, '')}@student.nairee.edu`,
      status: s.status || 'Active',
      batch_name: s.class_batch || 'Class 10 - Section A',
      phone: s.phone
    }));

    const parents = (db['Parent List']?.rows || []).map(p => ({
      id: p.parent_id || p.id,
      name: p.parent_id || p.id,
      username: (p.name || 'parent').toLowerCase().replace(/\s+/g, '_'),
      full_name: p.name,
      role: 'parent',
      email: p.email || `${p.name.toLowerCase().replace(/\s+/g, '')}@parent.nairee.edu`,
      status: 'Active',
      child: p.child,
      phone: p.phone
    }));

    let allUsers = [...admins, ...teachers, ...staff, ...students, ...parents];
    if (role && role !== 'all') {
      allUsers = allUsers.filter(u => u.role.toLowerCase() === role.toLowerCase());
    }
    return allUsers;
  },

  async toggleUserStatus(id, status) {
    const data = await safeFetch(`/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    
    // Update live database tables
    const db = getStoredDb();
    ['Admin List', 'Teacher List', 'Staff & Personnel', 'Student List'].forEach(tblName => {
      if (db[tblName] && Array.isArray(db[tblName].rows)) {
        db[tblName].rows = db[tblName].rows.map(r => {
          const rId = String(r.student_id || r.teacher_number || r.admin_id || r.staff_id || r.id || '');
          if (rId === String(id) || r.name === id) {
            return { ...r, status };
          }
          return r;
        });
      }
    });
    saveStoredDb(db);
    return data || { success: true, id, status };
  },

  async createAccount(data) {
    const usernameGenerated = data.email ? data.email.split('@')[0] : (data.full_name || 'user').toLowerCase().replace(/\s+/g, '_');
    const role = (data.role || 'student').toLowerCase();
    
    if (role === 'teacher') {
      const newTeacher = await this.createTeacher({
        name: data.full_name,
        email: data.email,
        phone: data.phone,
        department: data.department || 'Academics',
        designation: data.designation || 'Faculty Instructor'
      });
      return {
        message: `Faculty account created for ${data.full_name}!`,
        username: usernameGenerated,
        password: 'Welcome@123',
        role: 'teacher',
        user: newTeacher
      };
    } else if (role === 'admin') {
      const admins = getMasterAdmins();
      const newAdmin = {
        admin_id: `ADM-${String(admins.length + 1).padStart(3, '0')}`,
        name: data.full_name,
        role: 'School Administrator',
        department: data.department || 'Administration',
        email: data.email || `${usernameGenerated}@nairee.edu`,
        status: 'Active'
      };
      saveMasterAdmins([newAdmin, ...admins]);
      return {
        message: `Administrator account created for ${data.full_name}!`,
        username: usernameGenerated,
        password: 'Welcome@123',
        role: 'admin',
        user: newAdmin
      };
    } else if (role === 'staff') {
      const staffList = getMasterStaff();
      const newStaff = {
        staff_id: `STF-${String(staffList.length + 1).padStart(3, '0')}`,
        name: data.full_name,
        designation: data.designation || 'Support Personnel',
        department: data.department || 'Operations',
        phone: data.phone || '+91 98765 00000',
        email: data.email || `${usernameGenerated}@staff.nairee.edu`,
        salary: 28000,
        status: 'Active'
      };
      saveMasterStaff([newStaff, ...staffList]);
      return {
        message: `Staff personnel account created for ${data.full_name}!`,
        username: usernameGenerated,
        password: 'Welcome@123',
        role: 'staff',
        user: newStaff
      };
    } else {
      const newStu = await this.createStudent({
        student_name: data.full_name,
        email: data.email,
        phone: data.phone,
        class_batch: data.batch || 'Class 10 - Section A'
      });
      return {
        message: `Student account created for ${data.full_name}!`,
        username: usernameGenerated,
        password: 'Welcome@123',
        role: 'student',
        user: newStu
      };
    }
  },

  // Staff & Non-Teaching Personnel Endpoints
  async getStaff() {
    return getMasterStaff();
  },

  async updateStaff(staffId, updates) {
    const res = syncStaffAcrossAllDatasets(staffId, updates);
    return res.staff;
  },

  // Admin Endpoints
  async getAdmins() {
    return getMasterAdmins();
  },

  async updateAdmin(adminId, updates) {
    const res = syncAdminAcrossAllDatasets(adminId, updates);
    return res.admin;
  },

  // Parent Endpoints
  async getParents() {
    return getMasterParents();
  },

  async updateParent(parentId, updates) {
    const res = syncParentAcrossAllDatasets(parentId, updates);
    return res.parent;
  },

  // Operational Expenses & P&L (Profit & Loss) Endpoints
  async getExpenses() {
    return getMasterExpenses();
  },

  async createExpense(expenseData) {
    const currentExpenses = getMasterExpenses();
    const newId = `EXP-${String(currentExpenses.length + 1).padStart(3, '0')}`;
    const newExp = {
      expense_id: newId,
      id: newId,
      title: expenseData.title || expenseData.description || expenseData.category || 'Operational Expense',
      category: expenseData.category || 'Operational Expense',
      description: expenseData.description || expenseData.title || '',
      amount: Number(expenseData.amount) || 0,
      date: expenseData.date || new Date().toISOString().split('T')[0],
      status: expenseData.status || 'Paid',
      type: expenseData.type || 'operational'
    };
    saveMasterExpenses([newExp, ...currentExpenses]);
    return newExp;
  },

  async updateExpense(expenseId, updates) {
    const res = syncExpenseAcrossAllDatasets(expenseId, updates);
    return res.expense;
  },

  async deleteExpense(expenseId) {
    const currentExpenses = getMasterExpenses();
    const cleanId = String(expenseId).toLowerCase().trim();
    const filtered = currentExpenses.filter(e => {
      const eid = String(e.expense_id || e.id || '').toLowerCase().trim();
      return eid !== cleanId;
    });
    saveMasterExpenses(filtered);
    return { success: true };
  },

  async getPnLReport() {
    return calculatePnLMetrics();
  },

  async getAnnouncements(targetRole = '', tenantId = '') {
    const activeTenantId = tenantId || (typeof localStorage !== 'undefined' ? localStorage.getItem('nairee_active_tenant_id') : 'tenant-default') || 'tenant-default';
    const isDemo = isMasterOrDemoTenant(activeTenantId);
    
    let list = [];
    try {
      const saved = localStorage.getItem(`nairee_announcements_${activeTenantId}`);
      if (saved) {
        list = JSON.parse(saved);
      } else if (isDemo) {
        list = (FALLBACK_DATA.announcements || []).filter(a => {
          const aTenant = a.tenant_id || 'tenant-default';
          return aTenant === 'tenant-default' || aTenant === 'all_tenants';
        });
      }
    } catch {
      list = isDemo ? (FALLBACK_DATA.announcements || []) : [];
    }

    if (targetRole && targetRole !== 'all' && targetRole !== 'All') {
      const tr = targetRole.toLowerCase();
      list = list.filter(a => {
        if (!a.target_role || a.target_role === 'All' || a.target_role === 'all') return true;
        if (Array.isArray(a.target_role)) return a.target_role.map(r => r.toLowerCase()).includes(tr);
        return a.target_role.toLowerCase() === tr;
      });
    }

    return list;
  },

  async postAnnouncement(notice) {
    const activeTenantId = notice.tenant_id || (typeof localStorage !== 'undefined' ? localStorage.getItem('nairee_active_tenant_id') : 'tenant-default') || 'tenant-default';
    const newNotice = {
      id: notice.id || `ANN-${Date.now().toString().slice(-4)}`,
      tenant_id: activeTenantId,
      title: notice.title,
      content: notice.content,
      category: notice.category || 'General',
      target_role: notice.target_role || 'All',
      target_student: notice.target_student || notice.student_name || null,
      created_at: 'Just now',
      sender: notice.posted_by || notice.sender || 'Principal Office'
    };

    let list = [];
    try {
      const saved = localStorage.getItem(`nairee_announcements_${activeTenantId}`);
      if (saved) list = JSON.parse(saved);
      else if (isMasterOrDemoTenant(activeTenantId)) list = [...(FALLBACK_DATA.announcements || [])];
    } catch {}

    list.unshift(newNotice);
    try {
      localStorage.setItem(`nairee_announcements_${activeTenantId}`, JSON.stringify(list));
    } catch {}

    broadcastLiveEvent('announcement_created', newNotice);
    return { success: true, announcement: newNotice };
  },

  async createAnnouncement(notice) {
    return this.postAnnouncement(notice);
  },

  async getMessages(username, role) {
    return FALLBACK_DATA.messages;
  },

  async sendMessage(msg) {
    FALLBACK_DATA.messages.unshift({
      id: `MSG-${Date.now().toString().slice(-4)}`,
      sender: msg.sender || 'Staff',
      content: msg.content || msg.message,
      timestamp: 'Just now'
    });
    return { success: true };
  },

  async getSyllabus() {
    return FALLBACK_DATA.syllabus;
  },

  async updateSyllabus(id, data) {
    return { success: true, id, ...data };
  },

  async getStudyMaterials() {
    return FALLBACK_DATA.study_materials;
  },

  async getTransportInfo() {
    return FALLBACK_DATA.transport;
  },

  async uploadFile(file) {
    return { url: URL.createObjectURL(file), name: file.name };
  },

  // ---------------------------------------------------------
  // ENTERPRISE HARDENED DATABASE INTEGRATION METHODS (v3.2)
  // ---------------------------------------------------------

  // Dynamic Student Fee Status from Database View
  async getStudentFeeStatus(studentId = '') {
    try {
      if (supabase) {
        let query = supabase.from('student_fee_status').select('*');
        if (studentId) {
          query = query.or(`student_id.eq.${studentId},admission_no.eq.${studentId}`);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      }
    } catch (e) {
      console.warn('student_fee_status view fallback:', e);
    }
    return [];
  },

  // Expenses & Operational Outflows
  async getExpenses() {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .order('expense_date', { ascending: false });
        if (!error && data) return data;
      }
    } catch (e) {
      console.warn('getExpenses fallback:', e);
    }
    const db = getStoredDb();
    return db['School Expenses & Accounts']?.rows || [];
  },

  async createExpense(expenseData) {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('expenses')
          .insert([expenseData])
          .select()
          .single();
        if (error) throw new Error(formatDbError(error));
        broadcastLiveEvent('expense_created', data);
        return { success: true, ...data };
      }
    } catch (err) {
      throw new Error(formatDbError(err));
    }
  },

  // Admins List
  async getAdmins() {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data) return data;
      }
    } catch (e) {
      console.warn('getAdmins fallback:', e);
    }
    return [];
  },

  // Teaching Faculty (PII Secured)
  async getTeachers() {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('teachers')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data) return data;
      }
    } catch (e) {
      console.warn('getTeachers fallback:', e);
    }
    const db = getStoredDb();
    return db['Faculty & Teachers']?.rows || [];
  },

  // Non-Teaching Staff
  async getStaff() {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data) return data;
      }
    } catch (e) {
      console.warn('getStaff fallback:', e);
    }
    const db = getStoredDb();
    return db['Staff Members']?.rows || [];
  },

  // Parents (Consolidated from Guardians)
  async getParents() {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('parents')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data) return data;
      }
    } catch (e) {
      console.warn('getParents fallback:', e);
    }
    const db = getStoredDb();
    return db['Parents & Guardians']?.rows || [];
  },

  // -------------------------------------------------------------
  // ADMISSION LEADS & STUDENT SELF-REGISTRATION LINK SYSTEM
  // -------------------------------------------------------------
  async getAdmissionApplications(tenantId = 'all') {
    const db = getStoredDb();
    const rows = db['Admission Applications & Leads']?.rows || [];
    if (!tenantId || tenantId === 'all') return rows;
    return rows.filter(r => !r.tenant_id || r.tenant_id === tenantId || r.tenant_id === 'tenant-default');
  },

  async dispatchAdmissionLead(leadData) {
    const db = getStoredDb();
    if (!db['Admission Applications & Leads']) {
      db['Admission Applications & Leads'] = {
        columns: [
          { name: 'application_id', type: 'VARCHAR(50)', pk: 1 },
          { name: 'student_name', type: 'VARCHAR(150)', pk: 0 },
          { name: 'age', type: 'VARCHAR(20)', pk: 0 },
          { name: 'dob', type: 'DATE', pk: 0 },
          { name: 'target_class', type: 'VARCHAR(100)', pk: 0 },
          { name: 'guardian_name', type: 'VARCHAR(150)', pk: 0 },
          { name: 'guardian_phone', type: 'VARCHAR(50)', pk: 0 },
          { name: 'guardian_email', type: 'VARCHAR(200)', pk: 0 },
          { name: 'status', type: 'VARCHAR(50)', pk: 0 },
          { name: 'dispatched_by', type: 'VARCHAR(150)', pk: 0 },
          { name: 'dispatched_at', type: 'VARCHAR(50)', pk: 0 },
          { name: 'submitted_at', type: 'VARCHAR(50)', pk: 0 },
          { name: 'tenant_id', type: 'VARCHAR(50)', pk: 0 },
          { name: 'stream', type: 'VARCHAR(100)', pk: 0 },
          { name: 'previous_school', type: 'VARCHAR(200)', pk: 0 },
          { name: 'residential_address', type: 'TEXT', pk: 0 },
          { name: 'bus_required', type: 'VARCHAR(20)', pk: 0 }
        ],
        rows: []
      };
    }

    const appId = leadData.application_id || `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    
    const newLead = {
      application_id: appId,
      student_name: leadData.student_name || 'Prospective Student',
      age: leadData.age ? String(leadData.age).includes('Year') ? leadData.age : `${leadData.age} Years` : '14 Years',
      dob: leadData.dob || '2012-05-15',
      target_class: leadData.target_class || leadData.class_batch || 'Class 10 - Section A',
      guardian_name: leadData.guardian_name || 'Parent / Guardian',
      guardian_phone: leadData.guardian_phone || leadData.phone || '',
      guardian_email: leadData.guardian_email || leadData.email || '',
      status: leadData.status || 'Link Dispatched',
      dispatched_by: leadData.dispatched_by || 'Office of Admissions',
      dispatched_at: nowStr,
      submitted_at: '',
      tenant_id: leadData.tenant_id || 'tenant-default',
      stream: leadData.stream || 'General Academics & Foundational STEM',
      previous_school: leadData.previous_school || '',
      residential_address: leadData.residential_address || '',
      bus_required: leadData.bus_required || 'No'
    };

    // Remove existing if duplicate application_id
    db['Admission Applications & Leads'].rows = db['Admission Applications & Leads'].rows.filter(r => r.application_id !== appId);
    db['Admission Applications & Leads'].rows.unshift(newLead);
    saveStoredDb(db);

    // Build the shareable direct link
    let origin = typeof window !== 'undefined' ? window.location.origin : 'https://quicktech-spec.github.io';
    let pathname = typeof window !== 'undefined' ? window.location.pathname : '/nairee-school-erp/';
    if (!pathname.endsWith('/')) pathname += '/';
    
    const params = new URLSearchParams({
      mode: 'admission',
      appId: newLead.application_id,
      name: newLead.student_name,
      age: newLead.age,
      dob: newLead.dob,
      class: newLead.target_class,
      parent: newLead.guardian_name,
      phone: newLead.guardian_phone,
      tenant: newLead.tenant_id
    });

    const directLink = `${origin}${pathname}?${params.toString()}`;
    const cleanPhone = (newLead.guardian_phone || '').replace(/\D/g, '');
    const schoolName = leadData.school_name || 'Nairee International School';
    
    const whatsappText = `Dear ${newLead.guardian_name},\n\nGreetings from *${schoolName}*!\n\nWe have initiated the official Student Admission & Enrollment application for *${newLead.student_name}* for *${newLead.target_class}*.\n\nPlease complete the brief admission registration form by clicking your direct link below:\n👉 ${directLink}\n\nOnce submitted, our academic board will confirm the admission and release the student portal credentials.\n\nFor any queries, please reply directly or call our admissions office.\n\nWarm regards,\n*Admissions Directorate*\n${schoolName}`;
    
    const whatsappUrl = `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(whatsappText)}`;

    broadcastLiveEvent('admission_lead_dispatched', { lead: newLead, directLink, whatsappUrl });

    return {
      success: true,
      lead: newLead,
      directLink,
      whatsappUrl,
      whatsappText
    };
  },

  async submitAdmissionApplication(appData) {
    const db = getStoredDb();
    const appId = appData.application_id || `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    const targetClass = appData.target_class || appData.class_batch || 'Class 10 - Section A';
    const norm = normalizeBatchAndClass(targetClass);

    // 1. Update/Add Admission Lead Record
    if (!db['Admission Applications & Leads']) {
      db['Admission Applications & Leads'] = { columns: [], rows: [] };
    }
    
    const updatedLead = {
      application_id: appId,
      student_name: appData.student_name,
      age: appData.age || '14 Years',
      dob: appData.dob || '2012-05-15',
      target_class: norm.class_batch,
      guardian_name: appData.father_name || appData.guardian_name || 'Parent',
      guardian_phone: appData.father_phone || appData.guardian_phone || appData.phone || '',
      guardian_email: appData.father_email || appData.guardian_email || appData.email || '',
      status: 'Submitted by Parent',
      dispatched_by: appData.dispatched_by || 'Online Self-Registration',
      dispatched_at: appData.dispatched_at || nowStr,
      submitted_at: nowStr,
      tenant_id: appData.tenant_id || 'tenant-default',
      stream: appData.stream || 'Science & Advanced Mathematics',
      previous_school: appData.previous_school || '',
      residential_address: appData.residential_address || '',
      bus_required: appData.bus_required || 'No'
    };

    db['Admission Applications & Leads'].rows = db['Admission Applications & Leads'].rows.filter(r => r.application_id !== appId);
    db['Admission Applications & Leads'].rows.unshift(updatedLead);

    // 2. Generate and Register Official Student into Student Directory
    const existingStudents = db['Student Master Directory']?.rows || db['Student List']?.rows || [];
    const seq = existingStudents.length + 1;
    const studentId = appData.student_id || generateStudentId({
      schoolCode: 'NIS',
      year: new Date().getFullYear(),
      classNum: norm.grade.replace(/\D/g, '') || '10',
      sequence: seq
    });

    const rollNo = String(seq).padStart(2, '0');
    const studentUsername = appData.student_name.toLowerCase().replace(/[^a-z0-9]/g, '') || `student_${seq}`;
    const studentPassword = `${studentUsername}123`;

    const newStudentMaster = {
      student_id: studentId,
      name: appData.student_name,
      student_name: appData.student_name,
      roll_no: rollNo,
      class: norm.grade,
      section: `Section ${norm.section}`,
      class_batch: norm.class_batch,
      batch_id: norm.batch_id,
      stream: appData.stream || 'Science & Mathematics',
      photo: appData.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      dob: appData.dob || '2012-05-15',
      gender: appData.gender || 'Male',
      blood_group: appData.blood_group || 'O+',
      aadhaar_no: appData.aadhaar_no || '9876 5432 1099',
      religion: appData.religion || 'General',
      nationality: appData.nationality || 'Indian',
      admission_date: new Date().toISOString().split('T')[0],
      phone: appData.phone || appData.father_phone || '+91 98765 00000',
      email: `${studentUsername}@student.nairee.edu`,
      residential_address: appData.residential_address || 'Bengaluru, India',
      permanent_address: appData.residential_address || 'Bengaluru, India',
      father_name: appData.father_name || appData.guardian_name || 'Father',
      father_phone: appData.father_phone || appData.guardian_phone || '+91 98765 43210',
      father_occupation: appData.father_occupation || 'Business / Professional',
      mother_name: appData.mother_name || 'Mother',
      mother_phone: appData.mother_phone || '+91 98765 43211',
      mother_occupation: appData.mother_occupation || 'Homemaker / Professional',
      fee_status: 'Paid',
      feeDues: 0,
      status: 'Active'
    };

    if (db['Student Master Directory']) {
      db['Student Master Directory'].rows = db['Student Master Directory'].rows.filter(s => s.student_id !== studentId);
      db['Student Master Directory'].rows.push(newStudentMaster);
    }
    if (db['Student List']) {
      db['Student List'].rows = db['Student List'].rows.filter(s => s.student_id !== studentId);
      db['Student List'].rows.push(newStudentMaster);
    }

    // 3. Register Parent in Parent List
    const parentId = `PAR-${String(seq).padStart(3, '0')}`;
    const parentUsername = `parent_${studentUsername}`;
    const parentPassword = `${parentUsername}123`;
    if (db['Parent List']) {
      db['Parent List'].rows = db['Parent List'].rows.filter(p => p.parent_id !== parentId);
      db['Parent List'].rows.push({
        parent_id: parentId,
        father_name: newStudentMaster.father_name,
        mother_name: newStudentMaster.mother_name,
        email: appData.father_email || `${parentUsername}@family.com`,
        phone: newStudentMaster.father_phone,
        child: studentId,
        child_name: newStudentMaster.name,
        residential_address: newStudentMaster.residential_address
      });
    }

    // 4. Create Login Credentials for both Student and Parent
    if (db['User Logins & Credentials']) {
      db['User Logins & Credentials'].rows.push({
        name: studentId,
        username: studentUsername,
        full_name: newStudentMaster.name,
        role: 'student',
        email: newStudentMaster.email,
        phone: newStudentMaster.phone,
        status: 'Active',
        linked_id: studentId,
        password: studentPassword
      });
      db['User Logins & Credentials'].rows.push({
        name: parentId,
        username: parentUsername,
        full_name: newStudentMaster.father_name,
        role: 'parent',
        email: appData.father_email || `${parentUsername}@family.com`,
        phone: newStudentMaster.father_phone,
        status: 'Active',
        linked_id: parentId,
        password: parentPassword
      });
    }

    // 5. Trigger Database Trigger Cascade across Classes & Attendance
    triggerStudentCascadeTriggers(db, [newStudentMaster]);
    saveStoredDb(db);

    broadcastLiveEvent('student_registered', {
      application_id: appId,
      student_id: studentId,
      student: newStudentMaster,
      credentials: {
        student: { username: studentUsername, password: studentPassword },
        parent: { username: parentUsername, password: parentPassword }
      }
    });

    return {
      success: true,
      application_id: appId,
      student_id: studentId,
      student: newStudentMaster,
      credentials: {
        student: { username: studentUsername, password: studentPassword },
        parent: { username: parentUsername, password: parentPassword }
      },
      message: `Admission application #${appId} submitted successfully for ${newStudentMaster.name}!`
    };
  },

  async approveAndEnrollStudent(appId) {
    const db = getStoredDb();
    if (db['Admission Applications & Leads']) {
      db['Admission Applications & Leads'].rows = db['Admission Applications & Leads'].rows.map(a => {
        if (a.application_id === appId) {
          return { ...a, status: 'Enrolled & Approved' };
        }
        return a;
      });
      saveStoredDb(db);
      broadcastLiveEvent('student_enrolled', { application_id: appId });
      return { success: true, message: `Application #${appId} has been officially approved & enrolled.` };
    }
    return { success: false };
  }
};
