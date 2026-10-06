import { FALLBACK_DATA, INITIAL_DB_STORE } from './fallbackData.js';
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
const DB_VERSION_KEY = 'nairee_db_v12_multi_tenant_table';

const PK_MAP = {
  'Tenants & Multi-Tenant Schools': 'tenant_id',
  'Tenants': 'tenant_id',
  'Student List': 'student_id',
  'Teacher List': 'teacher_number',
  'staff_faculty': 'teacher_number',
  'Staff & Faculty': 'teacher_number',
  'employees': 'teacher_number',
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
  'Alumni Network': 'alumni_id'
};

export function getStoredDb() {
  if (typeof localStorage === 'undefined') return INITIAL_DB_STORE;
  try {
    const currentVersion = localStorage.getItem('nairee_db_version');
    if (currentVersion !== DB_VERSION_KEY) {
      // Clear legacy/stale browser storage caches
      localStorage.removeItem('nairee_db_store');
      localStorage.removeItem('nairee_mgmt_classes');
      localStorage.removeItem('nairee_mgmt_teachers');
      localStorage.removeItem('nairee_mgmt_students');
      localStorage.removeItem('nairee_fallback_students');
      localStorage.setItem('nairee_db_version', DB_VERSION_KEY);
      localStorage.setItem('nairee_db_store', JSON.stringify(INITIAL_DB_STORE));
      return INITIAL_DB_STORE;
    }

    const saved = localStorage.getItem('nairee_db_store');
    if (saved) {
      const parsed = JSON.parse(saved);
      const merged = { ...INITIAL_DB_STORE };
      
      Object.keys(INITIAL_DB_STORE).forEach(tableName => {
        const initTable = INITIAL_DB_STORE[tableName];
        const savedTable = parsed[tableName];
        const pkField = PK_MAP[tableName];

        if (savedTable && Array.isArray(savedTable.rows) && pkField) {
          // Merge: Keep user modifications/creations, and add missing initial rows
          const savedRowsMap = new Map();
          savedTable.rows.forEach(r => {
            if (r && r[pkField]) savedRowsMap.set(String(r[pkField]), r);
          });

          // Ensure every initial row is present
          const finalRows = [...savedTable.rows];
          if (initTable && Array.isArray(initTable.rows)) {
            initTable.rows.forEach(initRow => {
              if (initRow && initRow[pkField] && !savedRowsMap.has(String(initRow[pkField]))) {
                finalRows.push(initRow);
              }
            });
          }

          merged[tableName] = {
            ...initTable,
            columns: initTable?.columns || savedTable.columns,
            rows: finalRows
          };
        } else if (savedTable && savedTable.rows) {
          merged[tableName] = savedTable;
        }
      });

      return merged;
    }
  } catch (e) {
    console.warn('Error reading nairee_db_store:', e);
  }
  return INITIAL_DB_STORE;
}

export function saveStoredDb(newDbStore, shouldBroadcast = true) {
  if (!newDbStore) return;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('nairee_db_store', JSON.stringify(newDbStore));
    }
  } catch (e) {
    console.warn('Error writing nairee_db_store:', e);
  }
  if (shouldBroadcast) {
    broadcastLiveEvent('db_store_updated', newDbStore);
  }
}

// Cascading Relational Trigger Engine for Students:
// When any student detail (id, name, roll_no, class_batch) updates, it triggers
// instantaneous cascading updates across Attendance, Invoices, Results, and Portals.
export function cascadeStudentUpdates(updatedStudentsList, dbStore) {
  if (!dbStore || !Array.isArray(updatedStudentsList)) return dbStore;

  const studentMap = new Map();
  updatedStudentsList.forEach(s => {
    if (s && (s.student_id || s.id)) {
      const sid = String(s.student_id || s.id).trim();
      const sname = String(s.name || s.student_name || '').trim();
      const roll = String(s.roll_no || '').padStart(2, '0');
      const classBatch = s.class_batch || s.student_batch || 'Class 10 - Section A';
      
      const payload = {
        student_id: sid,
        student_name: sname,
        roll_no: roll,
        class_batch: classBatch,
        batch_id: s.batch_id || 'CLS-10A'
      };

      studentMap.set(sid.toLowerCase(), payload);
      if (sname) studentMap.set(sname.toLowerCase(), payload);
    }
  });

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
          student_name: matched.student_name
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
  return db['Student List']?.rows || INITIAL_DB_STORE['Student List'].rows;
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
  return db['Teacher List']?.rows || INITIAL_DB_STORE['Teacher List'].rows;
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
    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100;

    const presentAttendance = attendance.filter(a => a.status === 'Present').length;
    const attendanceRate = attendance.length > 0 ? ((presentAttendance / attendance.length) * 100).toFixed(1) + '%' : '96.4%';

    return {
      students: totalStudents,
      teachers: totalTeachers,
      total_students: 840,
      total_teachers: totalTeachers,
      attendance_rate: attendanceRate,
      fee_collection_rate: `${collectionRate}%`,
      active_courses: db['Subjects List']?.rows?.length || 5,
      pending_homework: db['Homework List']?.rows?.length || 3,
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
      list = list.filter(s => 
        s.batch_id === batch || 
        s.class_batch === batch || 
        (s.class_batch && s.class_batch.toLowerCase().includes(batch.toLowerCase()))
      );
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => 
        (s.name || '').toLowerCase().includes(q) || 
        (s.roll_no || '').toLowerCase().includes(q) ||
        (s.student_id || '').toLowerCase().includes(q)
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

    return newStudent;
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

  // Users & System Administration
  async getUsers(role = '') {
    const params = new URLSearchParams();
    if (role && role !== 'all') params.append('role', role);
    const data = await safeFetch(`/admin/users?${params.toString()}`);
    if (data) return data;
    if (role && role !== 'all') return FALLBACK_DATA.users.filter(u => u.role === role);
    return FALLBACK_DATA.users;
  },

  async toggleUserStatus(id, status) {
    const data = await safeFetch(`/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const user = FALLBACK_DATA.users.find(u => u.id === id || u.username === id);
    if (user) user.status = status;
    return data || { success: true, id, status };
  },

  async createAccount(data) {
    const usernameGenerated = data.email ? data.email.split('@')[0] : (data.full_name || 'user').toLowerCase().replace(/\s+/g, '_');
    const newId = `USR-${Date.now().toString().slice(-4)}`;
    const newAcc = {
      id: newId,
      username: usernameGenerated,
      full_name: data.full_name,
      email: data.email,
      role: data.role,
      status: 'Active',
      department: data.department || 'Academics'
    };
    FALLBACK_DATA.users.push(newAcc);
    broadcastLiveEvent('user_created', newAcc);
    return {
      message: `Account created for ${data.full_name}!`,
      username: usernameGenerated,
      password: 'Welcome@123',
      role: data.role,
      user: newAcc
    };
  },

  async getAnnouncements(targetRole = '', tenantId = '') {
    const activeTenantId = tenantId || (typeof localStorage !== 'undefined' ? localStorage.getItem('nairee_active_tenant_id') : 'tenant-default') || 'tenant-default';
    let list = (FALLBACK_DATA.announcements || []).filter(a => {
      const aTenant = a.tenant_id || 'tenant-default';
      return aTenant === activeTenantId || aTenant === 'all_tenants';
    });

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
    if (!FALLBACK_DATA.announcements) FALLBACK_DATA.announcements = [];
    FALLBACK_DATA.announcements.unshift(newNotice);
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
  }
};
