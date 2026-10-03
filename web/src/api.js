import { FALLBACK_DATA, INITIAL_DB_STORE } from './fallbackData.js';
import { supabase } from './supabaseClient.js';

const API_BASE = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api').replace(/\/$/, '');

// Initialize from LocalStorage if available for real-time cross-tab persistence
try {
  if (typeof localStorage !== 'undefined') {
    const savedUsers = localStorage.getItem('nairee_users');
    if (savedUsers) FALLBACK_DATA.users = JSON.parse(savedUsers);

    const savedStudents = localStorage.getItem('nairee_students');
    if (savedStudents) {
      FALLBACK_DATA.students = JSON.parse(savedStudents);
      INITIAL_DB_STORE.tabStudent.rows = JSON.parse(savedStudents);
    }

    const savedFaculty = localStorage.getItem('nairee_faculty');
    if (savedFaculty) {
      FALLBACK_DATA.faculty = JSON.parse(savedFaculty);
      INITIAL_DB_STORE.tabFaculty.rows = JSON.parse(savedFaculty);
    }

    const savedAnnouncements = localStorage.getItem('nairee_announcements');
    if (savedAnnouncements) FALLBACK_DATA.announcements = JSON.parse(savedAnnouncements);

    const savedHomework = localStorage.getItem('nairee_homework');
    if (savedHomework) FALLBACK_DATA.homework = JSON.parse(savedHomework);
  }
} catch (e) {
  console.warn('LocalStorage initialization warning:', e);
}

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
    console.warn(`Live API call to ${endpoint} failed, falling back to local client state:`, err.message);
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
          // If receiving a cloud store update, apply it to local storage & broadcast to React components
          if (payload.type === 'db_store_updated' && payload.payload) {
            try {
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem('nairee_db_store', JSON.stringify(payload.payload));
                if (payload.payload['Student List']?.rows) {
                  localStorage.setItem('nairee_students', JSON.stringify(payload.payload['Student List'].rows));
                }
              }
            } catch (e) {}
            if (payload.payload['Student List']?.rows) {
              INITIAL_DB_STORE['Student List'].rows = payload.payload['Student List'].rows;
            }
          }

          if (payload.type === 'student_updated' && payload.payload?.students) {
            try {
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem('nairee_students', JSON.stringify(payload.payload.students));
              }
            } catch (e) {}
            INITIAL_DB_STORE['Student List'].rows = payload.payload.students;
          }

          if (payload.type === 'student_transferred' && payload.payload) {
            const { student_id, new_class_id, new_class_name } = payload.payload;
            const currentDb = getStoredDb();
            const students = currentDb['Student List']?.rows || [];
            const cleanId = String(student_id || '').toLowerCase().trim();
            const updated = students.map(s => {
              const sid = String(s.student_id || s.id || '').toLowerCase().trim();
              const sname = String(s.name || s.student_name || '').toLowerCase().trim();
              if (sid === cleanId || sname === cleanId || sid.includes(cleanId) || cleanId.includes(sid)) {
                return { ...s, class_batch: new_class_name || new_class_id, batch_id: new_class_id };
              }
              return s;
            });
            const updatedDb = { ...currentDb, 'Student List': { ...(currentDb['Student List'] || {}), rows: updated } };
            try {
              localStorage.setItem('nairee_db_store', JSON.stringify(updatedDb));
              localStorage.setItem('nairee_students', JSON.stringify(updated));
            } catch (e) {}
            INITIAL_DB_STORE['Student List'].rows = updated;
          }

          if (payload.type === 'fee_updated' && payload.payload) {
            const sName = payload.payload.student_name;
            const currentDb = getStoredDb();
            const students = currentDb['Student List']?.rows || [];
            const updated = students.map(s => (s.name === sName || s.student_name === sName) ? { ...s, fee_status: 'Paid' } : s);
            const updatedDb = { ...currentDb, 'Student List': { ...(currentDb['Student List'] || {}), rows: updated } };
            try {
              localStorage.setItem('nairee_db_store', JSON.stringify(updatedDb));
              localStorage.setItem('nairee_students', JSON.stringify(updated));
            } catch (e) {}
            INITIAL_DB_STORE['Student List'].rows = updated;
          }

          // Notify all local React components & views immediately without page refresh
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nairee_live_sync', { detail: payload }));
          }
        }
      })
      .on('broadcast', { event: 'request_db_sync' }, () => {
        // Send current db store to newly joined device
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
          console.log('⚡ Connected to Supabase Cloud Realtime Sync!');
          // Request latest db from active peers
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
    // Broadcast live across all laptops, phones, and devices worldwide via Supabase!
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

// --- CENTRALIZED DATABASE STORAGE & SYNC ENGINE ---
export function getStoredDb() {
  if (typeof localStorage === 'undefined') return INITIAL_DB_STORE;
  try {
    const saved = localStorage.getItem('nairee_db_store');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...INITIAL_DB_STORE, ...parsed };
    }
  } catch (e) {
    console.warn('Error reading nairee_db_store:', e);
  }
  return INITIAL_DB_STORE;
}

export function saveStoredDb(newDbStore) {
  if (!newDbStore) return;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('nairee_db_store', JSON.stringify(newDbStore));
      if (newDbStore['Student List']?.rows) {
        localStorage.setItem('nairee_students', JSON.stringify(newDbStore['Student List'].rows));
      }
    }
  } catch (e) {
    console.warn('Error writing nairee_db_store:', e);
  }
  if (newDbStore['Student List']?.rows) {
    INITIAL_DB_STORE['Student List'].rows = newDbStore['Student List'].rows;
  }
  broadcastLiveEvent('db_store_updated', newDbStore);
}

export function getMasterStudents() {
  const db = getStoredDb();
  const rows = db['Student List']?.rows;
  if (Array.isArray(rows) && rows.length > 0) {
    return rows;
  }
  return INITIAL_DB_STORE['Student List'].rows;
}

export function saveMasterStudents(updatedStudentsList) {
  const currentDb = getStoredDb();
  const currentTbl = currentDb['Student List'] || INITIAL_DB_STORE['Student List'];
  const updatedDb = {
    ...currentDb,
    'Student List': {
      ...currentTbl,
      rows: updatedStudentsList
    }
  };
  saveStoredDb(updatedDb);

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('nairee_students', JSON.stringify(updatedStudentsList));
      // Sync to ClassStaffManager local state cache
      const mgmtStudents = updatedStudentsList.map((s, idx) => ({
        id: s.student_id || s.id || `EDU-STU-2026-0000${idx + 1}`,
        name: s.name || s.student_name,
        roll_no: s.roll_no ? `${s.class_batch?.includes('10 - Section B') || s.class_batch?.includes('10B') ? '10B' : '10A'}-${s.roll_no}` : `10A-0${idx + 1}`,
        class_id: (s.class_batch?.includes('Section B') || s.class_batch?.includes('10B')) ? 'BATCH-10B-2026' : 'BATCH-10A-2026',
        class_name: s.class_batch || 'Class 10 - Section A',
        email: s.email || `${(s.name || s.student_name || 'student').toLowerCase().replace(/\s+/g, '')}@student.nairee.edu`,
        phone: s.phone || '+91 98765 00000',
        parent_name: s.father_name || s.mother_name || 'Parent',
        parent_phone: s.father_phone || s.mother_phone || s.phone || '+91 98765 00000',
        attendance: 96.5,
        fee_total: 43500,
        fee_paid: s.fee_status === 'Paid' ? 43500 : 0,
        fee_due: s.fee_status === 'Paid' ? 0 : 43500,
        fee_status: s.fee_status || 'Paid'
      }));
      localStorage.setItem('nairee_mgmt_students', JSON.stringify(mgmtStudents));
    }
  } catch (e) {
    console.warn('Error syncing mgmt students:', e);
  }

  broadcastLiveEvent('student_updated', { students: updatedStudentsList });
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

export const api = {
  // Auth
  async login(username, password) {
    const result = await safeFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (result && result.user) {
      return result;
    }

    // Client-side fallback authentication for static GitHub Pages / Netlify standalone
    const u = (username || '').toLowerCase().trim();
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

    // Dynamic master student lookup
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
      const studentUser = {
        id: matchedStudent.student_id || matchedStudent.id || `STU-${matchedStudent.roll_no || '002'}`,
        student_id: matchedStudent.student_id || matchedStudent.id || `STU-${matchedStudent.roll_no || '002'}`,
        username: (matchedStudent.name || 'student').toLowerCase().replace(/\s+/g, ''),
        full_name: matchedStudent.name || matchedStudent.student_name,
        role: 'student',
        email: matchedStudent.email || `${(matchedStudent.name || 'student').toLowerCase().replace(/\s+/g, '')}@example.com`,
        status: 'Active',
        batch_name: matchedStudent.class_batch || 'Class 3 - Section A',
        student_batch: matchedStudent.class_batch || 'Class 3 - Section A',
        roll_number: matchedStudent.roll_no || '102',
        student: {
          name: matchedStudent.student_id || matchedStudent.id || `STU-${matchedStudent.roll_no || '002'}`,
          student_name: matchedStudent.name || matchedStudent.student_name,
          roll_no: matchedStudent.roll_no || '102',
          student_batch: matchedStudent.class_batch || 'Class 3 - Section A'
        }
      };
      return {
        user: studentUser,
        token: 'mock-jwt-token-student'
      };
    }

    // Default to admin if testing
    if (u === 'admin' || u === 'principal') {
      return { user: FALLBACK_DATA.users[0], token: 'mock-jwt-admin' };
    }

    throw new Error('Invalid credentials. Use student ID "STU-002" or username "aarav" (password: student123)');
  },

  async getDashboardStats() {
    const data = await safeFetch('/dashboard/stats');
    if (data) return data;
    const students = getMasterStudents();
    const totalCount = students.length;
    const pendingCount = students.filter(s => s.fee_status === 'Pending' || (s.feeDues || 0) > 0).length;
    const paidCount = totalCount - pendingCount;
    const billed = totalCount * 35000;
    const collected = paidCount * 35000;
    const outstanding = pendingCount * 35000;
    return {
      ...FALLBACK_DATA.stats,
      students: totalCount,
      teachers: FALLBACK_DATA.faculty.length || 4,
      total_students: 840,
      finance: {
        totalBilled: billed,
        totalCollected: collected,
        totalOutstanding: outstanding,
        collectionRate: totalCount > 0 ? Math.round((collected / billed) * 100) : 100
      }
    };
  },

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
      list = list.filter(s => (s.name || s.student_name || '').toLowerCase().includes(search.toLowerCase()));
    }
    return list.map(s => ({
      ...s,
      id: s.student_id || s.id || s.name,
      name: s.name || s.student_name,
      student_name: s.name || s.student_name || 'Student',
      roll_no: s.roll_no || '101',
      student_batch: s.class_batch || 'Class 10 - Section A'
    }));
  },

  async getStudentDetail(id) {
    const data = await safeFetch(`/students/${id}`);
    if (data) return data;
    const cleanId = String(id || '').toLowerCase().trim();
    const master = getMasterStudents();
    const found = master.find(s => {
      const sId = String(s.student_id || s.id || '').toLowerCase().trim();
      const sName = String(s.name || s.student_name || '').toLowerCase().trim();
      const sFirstName = sName.split(' ')[0];
      const sRoll = String(s.roll_no || '').toLowerCase().trim();
      return cleanId === sId || cleanId === sName || cleanId === sFirstName || cleanId === sRoll || cleanId.includes(sId) || sId.includes(cleanId);
    }) || master[0];

    if (found) {
      const classBatch = found.class_batch || found.student_batch || found.batch_name || 'Class 10 - Section A';
      const isPaid = found.fee_status === 'Paid' || found.fee_status === 'Cleared';
      return {
        id: found.student_id || found.id || 'STU-001',
        student_id: found.student_id || found.id || 'STU-001',
        name: found.student_id || found.id || 'STU-001',
        full_name: found.name || found.student_name || 'Devon Patel',
        student_name: found.name || found.student_name || 'Devon Patel',
        roll_number: found.roll_no || '101',
        roll_no: found.roll_no || '101',
        batch_id: found.batch_id || ((classBatch.includes('Section B') || classBatch.includes('10B')) ? 'BATCH-10B-2026' : 'BATCH-10A-2026'),
        batch_name: classBatch,
        student_batch: classBatch,
        class_batch: classBatch,
        program_name: found.stream || 'Senior Secondary Academic Stream',
        stream: found.stream || 'Computer Applications & Advanced Math',
        dob: found.dob || '2011-04-12',
        religion: found.religion || 'Hindu',
        nationality: found.nationality || 'Indian',
        blood_group: found.blood_group || 'O+',
        gender: found.gender || 'Male',
        admission_date: found.admission_date || '2024-06-15',
        residential_address: found.residential_address || 'Indiranagar, Bengaluru - 560038',
        permanent_address: found.permanent_address || 'Indiranagar, Bengaluru - 560038',
        photo: found.photo || found.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        image: found.photo || found.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        email: found.email || `${(found.name || 'student').toLowerCase().replace(/\s+/g, '')}@student.nairee.edu`,
        phone: found.phone || '+91 98765 00001',
        father_name: found.father_name || 'Rajesh Patel',
        father_phone: found.father_phone || '+91 98765 43212',
        mother_name: found.mother_name || 'Meera Patel',
        mother_phone: found.mother_phone || '+91 98765 43213',
        guardian_name: found.father_name || found.mother_name || 'Mr. Rajesh Patel',
        guardian_mobile: found.father_phone || found.mother_phone || '+91 98765 43212',
        attendance: { percentage: 98.5 },
        attendance_percentage: 98.5,
        fee_status: isPaid ? 'Paid' : 'Pending',
        balance_due: isPaid ? 0 : 35000,
        feeDues: isPaid ? 0 : 35000
      };
    }
    return FALLBACK_DATA.students[0];
  },

  async createStudent(studentData) {
    const data = await safeFetch('/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    if (data) return data;
    const newId = `EDU-STU-2026-${String(FALLBACK_DATA.students.length + 1).padStart(5, '0')}`;
    const newStudent = { 
      id: newId,
      name: newId,
      full_name: studentData.full_name || studentData.student_name,
      student_name: studentData.full_name || studentData.student_name,
      roll_number: studentData.roll_number || `10A-0${FALLBACK_DATA.students.length + 1}`,
      roll_no: studentData.roll_no || `10${FALLBACK_DATA.students.length + 1}`,
      batch_id: studentData.batch_id || studentData.student_batch || 'BATCH-10A-2026',
      student_batch: studentData.student_batch || studentData.batch_id || 'Grade 10-A',
      email: studentData.email || 'student@nairee.edu',
      phone: studentData.phone || '+1 (555) 901-2234',
      attendance_percentage: 100,
      fee_status: 'Paid',
      balance_due: 0
    };
    FALLBACK_DATA.students.push(newStudent);
    INITIAL_DB_STORE.tabStudent.rows.push({
      name: newId,
      first_name: newStudent.student_name.split(' ')[0],
      last_name: newStudent.student_name.split(' ').slice(1).join(' ') || '',
      student_email_id: newStudent.email,
      student_mobile_number: newStudent.phone,
      batch_id: newStudent.batch_id,
      roll_number: newStudent.roll_number,
      attendance_percentage: 100.0,
      fee_status: 'Paid'
    });
    try {
      localStorage.setItem('nairee_students', JSON.stringify(FALLBACK_DATA.students));
    } catch {}
    return newStudent;
  },

  async getBatches() {
    const data = await safeFetch('/batches');
    return data || FALLBACK_DATA.batches;
  },

  async getCourses() {
    const data = await safeFetch('/courses');
    return data || FALLBACK_DATA.courses;
  },

  async getFaculty() {
    const data = await safeFetch('/faculty');
    return data || FALLBACK_DATA.faculty;
  },

  async getSchedule(batch = '', day = '') {
    const params = new URLSearchParams();
    if (batch) params.append('batch', batch);
    if (day) params.append('day', day);
    const data = await safeFetch(`/schedule?${params.toString()}`);
    return data || FALLBACK_DATA.schedule;
  },

  async getAttendance(batch = 'BATCH-10A-2026', date = '') {
    const params = new URLSearchParams();
    if (batch) params.append('batch', batch);
    if (date) params.append('date', date);
    const data = await safeFetch(`/attendance?${params.toString()}`);
    return data || FALLBACK_DATA.attendance;
  },

  async submitBulkAttendance(batch, date, records) {
    const data = await safeFetch('/attendance/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch, date, records }),
    });
    if (data) return data;
    
    // In-memory sync to DB table tabStudentAttendance
    if (Array.isArray(records)) {
      records.forEach(r => {
        const studentId = r.student || r.student_id || r.name;
        const status = r.status || 'Present';
        const existingIdx = INITIAL_DB_STORE.tabStudentAttendance.rows.findIndex(
          row => row.student_id === studentId && row.attendance_date === date
        );
        if (existingIdx >= 0) {
          INITIAL_DB_STORE.tabStudentAttendance.rows[existingIdx].status = status;
        } else {
          INITIAL_DB_STORE.tabStudentAttendance.rows.push({
            name: `ATT-${Date.now().toString().slice(-4)}`,
            student_id: studentId,
            attendance_date: date || new Date().toISOString().split('T')[0],
            status,
            batch_id: batch || 'BATCH-10A-2026'
          });
        }
      });
    }
    return { success: true, count: Array.isArray(records) ? records.length : 0 };
  },

  async getAssessmentPlans() {
    const data = await safeFetch('/assessments/plans');
    return data || [
      { id: 'PLAN-01', name: 'Mid-Term Examinations 2026', course_name: 'Advanced Mathematics', date: '2026-10-15', max_score: 100 }
    ];
  },

  async getAssessmentResults(params = {}) {
    const q = new URLSearchParams(params);
    const data = await safeFetch(`/assessments/results?${q.toString()}`);
    return data || [
      { id: 'RES-01', student_name: 'Nairee Patel', roll_number: '10A-01', score: 95, grade: 'A+', course: 'Mathematics', assessment_plan: 'Mid-Term Exam', percentage: 95, maximum_score: 100, comment: 'Exceptional analytical proofs and thorough presentation.' },
      { id: 'RES-02', student_name: 'Aarav Sharma', roll_number: '10A-02', score: 88, grade: 'A', course: 'Physics', assessment_plan: 'Lab Dynamics', percentage: 88, maximum_score: 100, comment: 'Good understanding of experimental parameters.' }
    ];
  },

  async submitGrade(data) {
    const res = await safeFetch('/assessments/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res || { success: true, ...data };
  },

  async getFees(params = {}) {
    const q = new URLSearchParams(params);
    const data = await safeFetch(`/fees?${q.toString()}`);
    return data || FALLBACK_DATA.fees;
  },

  async payFee(feeId, paymentMethod = 'Credit Card / Online') {
    const data = await safeFetch('/fees/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fee_id: feeId, payment_method: paymentMethod }),
    });
    if (data) return data;
    const item = FALLBACK_DATA.fees.find(f => f.id === feeId);
    if (item) item.status = 'Paid';
    broadcastLiveEvent('fee_updated', { fee_id: feeId, status: 'Paid' });
    return { 
      success: true, 
      fee_id: feeId, 
      status: 'Paid',
      receipt_no: `REC 2026 ${Date.now().toString().slice(-4)}`,
      amountPaid: item ? item.amount : 1450,
      payment_date: new Date().toISOString().split('T')[0]
    };
  },

  async settleStudentFee(studentIdentifier, amount = 0, paymentMethod = 'Online Gateway') {
    const student = FALLBACK_STUDENTS.find(s => 
      s.name === studentIdentifier || 
      s.student_name === studentIdentifier ||
      s.roll_no === studentIdentifier
    );
    if (student) {
      student.feeDues = 0;
      student.fee_status = 'Paid';
    }

    const dataStu = FALLBACK_DATA.students.find(s => 
      s.id === studentIdentifier || 
      s.name === studentIdentifier || 
      s.full_name === studentIdentifier || 
      s.student_name === studentIdentifier
    );
    if (dataStu) {
      dataStu.balance_due = 0;
      dataStu.fee_status = 'Paid';
    }

    try {
      localStorage.setItem('nairee_students', JSON.stringify(FALLBACK_DATA.students));
      localStorage.setItem('nairee_fallback_students', JSON.stringify(FALLBACK_STUDENTS));
    } catch {}

    const receiptNo = `REC 2026 ${Date.now().toString().slice(-4)}`;
    const studentName = student?.student_name || dataStu?.full_name || studentIdentifier;

    FALLBACK_DATA.fees.unshift({
      id: `FEE ${Date.now().toString().slice(-4)}`,
      title: `Term 1 Tuition Fee (${studentName})`,
      amount: amount || 35000,
      due_date: new Date().toISOString().split('T')[0],
      status: 'Paid',
      payment_date: new Date().toISOString().split('T')[0],
      student_name: studentName,
      receipt_no: receiptNo
    });

    try {
      localStorage.setItem('nairee_fees', JSON.stringify(FALLBACK_DATA.fees));
    } catch {}

    broadcastLiveEvent('fee_updated', {
      student_id: studentIdentifier,
      student_name: studentName,
      amount: amount || 35000,
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
    const user = FALLBACK_DATA.users.find(u => u.name === id || u.id === id);
    if (user) user.status = status;
    try {
      localStorage.setItem('nairee_users', JSON.stringify(FALLBACK_DATA.users));
    } catch {}
    return data || { success: true, id, status };
  },

  async createAccount(data) {
    const res = await safeFetch('/admin/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res) return res;

    const usernameGenerated = data.email ? data.email.split('@')[0] : (data.full_name || 'user').toLowerCase().replace(/\s+/g, '_');
    const newId = `usr_${Date.now().toString().slice(-6)}`;
    const newAcc = { 
      id: newId, 
      name: newId,
      full_name: data.full_name,
      username: usernameGenerated,
      role: data.role,
      email: data.email || `${usernameGenerated}@nairee.edu`,
      phone: data.phone || '+1 (555) 901-2234',
      status: 'Active',
      department: data.department || 'Academics',
      batch: data.batch || 'BATCH-10A-2026'
    };

    FALLBACK_DATA.users.push(newAcc);

    // Sync to respective Database Studio tables
    if (data.role === 'student') {
      const studentId = `EDU-STU-2026-${String(FALLBACK_DATA.students.length + 1).padStart(5, '0')}`;
      const newStu = {
        id: studentId,
        name: studentId,
        full_name: data.full_name,
        student_name: data.full_name,
        roll_number: `10A-0${FALLBACK_DATA.students.length + 1}`,
        roll_no: `10${FALLBACK_DATA.students.length + 1}`,
        batch_id: data.batch || 'BATCH-10A-2026',
        student_batch: data.batch || 'Grade 10-A',
        email: data.email,
        phone: data.phone || '+1 (555) 901-2234',
        attendance_percentage: 100,
        fee_status: 'Paid',
        balance_due: 0
      };
      FALLBACK_DATA.students.push(newStu);
      INITIAL_DB_STORE.tabStudent.rows.push({
        name: studentId,
        first_name: data.full_name.split(' ')[0],
        last_name: data.full_name.split(' ').slice(1).join(' ') || '',
        student_email_id: data.email,
        student_mobile_number: data.phone || '+1 (555) 901-2234',
        batch_id: data.batch || 'BATCH-10A-2026',
        roll_number: `10A-0${INITIAL_DB_STORE.tabStudent.rows.length + 1}`,
        attendance_percentage: 100.0,
        fee_status: 'Paid'
      });
      try {
        localStorage.setItem('nairee_students', JSON.stringify(FALLBACK_DATA.students));
      } catch {}
    } else if (data.role === 'teacher') {
      const facId = `FAC-00${FALLBACK_DATA.faculty.length + 1}`;
      const newFac = {
        id: facId,
        name: facId,
        full_name: data.full_name,
        department: data.department || 'Mathematics & Science',
        email: data.email,
        phone: data.phone || '+1 (555) 901-2234',
        workload_hours: 20
      };
      FALLBACK_DATA.faculty.push(newFac);
      INITIAL_DB_STORE.tabFaculty.rows.push({
        name: facId,
        full_name: data.full_name,
        department: data.department || 'Mathematics & Science',
        email: data.email,
        mobile_number: data.phone || '+1 (555) 901-2234',
        workload_hours: 20
      });
      if (INITIAL_DB_STORE.tabTeacher) {
        INITIAL_DB_STORE.tabTeacher.rows.push({
          teacher_id: `TEA-00${INITIAL_DB_STORE.tabTeacher.rows.length + 1}`,
          full_name: data.full_name,
          department: data.department || 'Mathematics & Science',
          designation: data.designation || 'Faculty Lead',
          email: data.email,
          phone: data.phone || '+1 (555) 901-2234',
          assigned_classes: data.batch || 'Grade 10-A',
          monthly_salary: 5800,
          status: 'Active'
        });
      }
      try {
        localStorage.setItem('nairee_faculty', JSON.stringify(FALLBACK_DATA.faculty));
      } catch {}
    }

    try {
      localStorage.setItem('nairee_users', JSON.stringify(FALLBACK_DATA.users));
    } catch {}

    return {
      message: `Account created for ${data.full_name}! User can log in with username "${usernameGenerated}"`,
      username: usernameGenerated,
      password: 'Welcome@123',
      role: data.role,
      user: newAcc
    };
  },

  async getTeacherPerformance() {
    const data = await safeFetch('/admin/teacher-performance');
    return data || [
      { id: 'FAC-001', name: 'Prof. Sarah Jenkins', department: 'Mathematics', designation: 'Senior Faculty', assignedClasses: 3, syllabusCompletionRate: 85, studentAverageScore: 92, rating: 4.9, attendance_avg: '98%', syllabus_progress: '85%' },
      { id: 'FAC-002', name: 'Dr. Marcus Vance', department: 'Physics & STEM', designation: 'Head of STEM', assignedClasses: 2, syllabusCompletionRate: 90, studentAverageScore: 94, rating: 4.8, attendance_avg: '97%', syllabus_progress: '90%' },
      { id: 'FAC-003', name: 'Mr. Robert Chen', department: 'Computer Science', designation: 'AI Instructor', assignedClasses: 2, syllabusCompletionRate: 78, studentAverageScore: 88, rating: 4.7, attendance_avg: '96%', syllabus_progress: '78%' }
    ];
  },

  async getStudentPerformance(batch = '') {
    const params = new URLSearchParams();
    if (batch && batch !== 'all') params.append('batch', batch);
    const data = await safeFetch(`/admin/student-performance?${params.toString()}`);
    if (data) return data;

    const sourceList = (FALLBACK_DATA.students && FALLBACK_DATA.students.length >= 6) ? FALLBACK_DATA.students : FALLBACK_STUDENTS;
    return sourceList.map((s, idx) => {
      const isPending = idx === 2 || idx === 5 || s.fee_status === 'Pending' || s.balance_due > 0 || (s.feeDues || 0) > 0;
      const feeAmount = isPending ? 35000 : 0;
      const guardianMobile = idx === 2 ? '+91 98765 43216' : idx === 5 ? '+91 98765 43222' : (s.phone || `+91 98765 0000${idx + 1}`);
      const guardianName = idx === 2 ? 'Mr. Vikram Gupta' : idx === 5 ? 'Mr. Harpreet Singh' : (s.guardian_name || 'Parent');

      return {
        id: s.id || s.name,
        name: s.id || s.name,
        student_name: s.full_name || s.student_name,
        roll_no: s.roll_number || s.roll_no || `${101 + idx}`,
        student_batch: s.batch_id || s.student_batch || (idx === 5 ? 'Class 10 - Section B' : 'Class 10 - Section A'),
        batch_name: s.batch_name || s.student_batch || (idx === 5 ? 'Class 10 - Section B' : 'Class 10 - Section A'),
        attendancePct: s.attendance_percentage || s.attendancePct || (idx === 5 ? 89 : 96),
        avgGrade: idx === 2 ? 62 : idx === 5 ? 78 : 92,
        feeDues: feeAmount,
        fee_status: isPending ? 'Pending' : 'Paid',
        guardian_name: guardianName,
        guardian_mobile: guardianMobile,
        isAtRisk: isPending,
        riskReasons: isPending ? ['Term Fee Pending (₹35,000)'] : []
      };
    });
  },

  async getSyllabus(params = {}) {
    const q = new URLSearchParams(params);
    const data = await safeFetch(`/syllabus?${q.toString()}`);
    return data || [
      { id: 'SYL-01', subject: 'Mathematics', course: 'CRS-MATH-10', chapter_number: 1, chapter_title: 'Real Numbers & Polynomials', total_topics: 10, completed_topics: 10, status: 'Completed' },
      { id: 'SYL-02', subject: 'Mathematics', course: 'CRS-MATH-10', chapter_number: 2, chapter_title: 'Quadratic Equations & Arithmetic Progressions', total_topics: 12, completed_topics: 9, status: 'In Progress' },
      { id: 'SYL-03', subject: 'Mathematics', course: 'CRS-MATH-10', chapter_number: 3, chapter_title: 'Differential Calculus & Geometry', total_topics: 15, completed_topics: 6, status: 'In Progress' },
      { id: 'SYL-04', subject: 'Physics', course: 'CRS-PHYS-10', chapter_number: 1, chapter_title: 'Electromagnetism & Waves', total_topics: 8, completed_topics: 6, status: 'In Progress' }
    ];
  },

  async updateSyllabus(id, data) {
    const res = await safeFetch(`/syllabus/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res || { success: true, id, ...data };
  },

  async createSyllabus(data) {
    const res = await safeFetch('/syllabus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res || { id: `SYL-${Date.now()}`, ...data };
  },

  async getHomework(params = {}) {
    const q = new URLSearchParams(params);
    const data = await safeFetch(`/homework?${q.toString()}`);
    if (data) return data;
    
    let list = [...FALLBACK_DATA.homework];
    if (params.batch && params.batch !== 'all') {
      list = list.filter(hw => hw.student_batch === params.batch || hw.course?.includes(params.batch.split('-')[1]?.substring(0, 2) || ''));
    }
    return list;
  },

  async createHomework(data) {
    const res = await safeFetch('/homework', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const newHw = {
      id: `HW-0${FALLBACK_DATA.homework.length + 1}`,
      title: data.title,
      course: data.course || 'CRS-MATH-10',
      subject: data.subject || 'Mathematics',
      student_batch: data.student_batch || 'BATCH-10A-2026',
      due_date: data.due_date || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      instructions: data.instructions || '',
      max_points: data.max_points || 100,
      status: 'Assigned',
      submissionCount: 0
    };
    FALLBACK_DATA.homework.unshift(newHw);
    try {
      localStorage.setItem('nairee_homework', JSON.stringify(FALLBACK_DATA.homework));
    } catch {}
    return res || newHw;
  },

  async getHomeworkSubmissions(id) {
    const data = await safeFetch(`/homework/${id}/submissions`);
    return data || [
      { id: 'sub_1', student_id: 'EDU-STU-2026-00001', student: 'EDU-STU-2026-00001', student_name: 'Nairee Patel', submitted_at: 'Yesterday', status: 'Graded', score: 98, submission_text: 'Attached solved problem set 4.1 to 4.5 along with step-by-step calculus proofs.', feedback: 'Outstanding rigor and clear explanations!' },
      { id: 'sub_2', student_id: 'EDU-STU-2026-00002', student: 'EDU-STU-2026-00002', student_name: 'Aarav Sharma', submitted_at: '2 hours ago', status: 'Submitted', score: null, submission_text: 'Calculus derivatives worksheet completed. Page 42 questions 1-12.', feedback: null }
    ];
  },

  async submitHomework(data) {
    const res = await safeFetch('/homework/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res || { success: true, ...data };
  },

  async gradeHomework(data) {
    const res = await safeFetch('/homework/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res || { success: true, ...data };
  },

  async getStudyMaterials(params = {}) {
    const q = new URLSearchParams(params);
    const data = await safeFetch(`/study-materials?${q.toString()}`);
    return data || FALLBACK_DATA.study_materials;
  },

  async uploadStudyMaterial(data) {
    const res = await safeFetch('/study-materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const newMat = {
      id: `MAT-0${FALLBACK_DATA.study_materials.length + 1}`,
      title: data.title,
      subject: data.subject || 'Mathematics',
      material_type: data.material_type || 'PDF Document',
      description: data.description || '',
      url: data.url || '#',
      uploaded_by: data.uploaded_by || 'Prof. Sarah Jenkins',
      created_at: new Date().toISOString().split('T')[0]
    };
    FALLBACK_DATA.study_materials.unshift(newMat);
    return res || newMat;
  },

  async getAnnouncements(role = '', batch = '') {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (batch) params.append('batch', batch);
    const data = await safeFetch(`/announcements?${params.toString()}`);
    if (data) return data;

    let list = [...FALLBACK_DATA.announcements];
    if (role && role !== 'all' && role !== 'All') {
      list = list.filter(a => !a.target_role || a.target_role === 'All' || a.target_role.toLowerCase() === role.toLowerCase());
    }
    return list;
  },

  async createAnnouncement(data) {
    const res = await safeFetch('/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const newAnn = {
      id: `ANN-0${FALLBACK_DATA.announcements.length + 1}`,
      title: data.title,
      content: data.content,
      category: data.category || 'General Circular',
      target_role: data.target_role || 'All',
      priority: data.priority || 'Normal',
      created_at: new Date().toISOString(),
      posted_by: data.posted_by || 'Office of Principal'
    };
    FALLBACK_DATA.announcements.unshift(newAnn);
    try {
      localStorage.setItem('nairee_announcements', JSON.stringify(FALLBACK_DATA.announcements));
    } catch {}
    broadcastLiveEvent('announcement_created', newAnn);
    return res || newAnn;
  },

  async getTransport(studentId) {
    const data = await safeFetch(`/transport/${studentId}`);
    return data || FALLBACK_DATA.transport;
  },

  async getMessages(username = '', role = '') {
    const params = new URLSearchParams();
    if (username) params.append('username', username);
    if (role) params.append('role', role);
    const data = await safeFetch(`/messages?${params.toString()}`);
    return data || [
      { id: 'MSG-01', sender_name: 'Prof. Sarah Jenkins (Math Lead)', recipient_name: 'Rajesh Patel', subject: 'Mathematics Term Progress & Honors Project', message: 'Hello Mr. Patel, Nairee is performing exceptionally well in Advanced Calculus. We would love to nominate her for the Regional STEM Olympiad.', created_at: new Date().toISOString() },
      { id: 'MSG-02', sender_name: 'Office of Administration', recipient_name: 'All Parents', subject: 'Annual Day Function Rehearsals', message: 'Dear Parents, Annual function rehearsals will commence this Friday from 2:00 PM to 4:00 PM.', created_at: new Date().toISOString() }
    ];
  },

  async sendMessage(data) {
    const res = await safeFetch('/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res || { success: true, id: `MSG-${Date.now()}`, ...data };
  },

  async getParentChildSummary(studentId) {
    const data = await safeFetch(`/parent/child/${studentId}/summary`);
    return data || {
      student: FALLBACK_DATA.students[0] || { student_name: 'Nairee Patel', roll_no: '101', student_batch: 'Grade 10-A' },
      attendance: {
        percentage: 97.5,
        totalClasses: 120,
        attended: 117,
        absentAlerts: []
      },
      fees: [
        { name: 'FEE-2026-001', grand_total: 1450, outstanding_amount: 0, status: 'Paid', due_date: 'Oct 20, 2026' }
      ],
      results: [
        { name: 'RES-01', course: 'Mathematics', assessment_plan: 'Mid-Term Exam', score: 98, maximum_score: 100, percentage: 98, grade: 'A+', comment: 'Exceptional analytical proofs and thorough presentation.' },
        { name: 'RES-02', course: 'Physics', assessment_plan: 'Lab Dynamics', score: 94, maximum_score: 100, percentage: 94, grade: 'A+', comment: 'Strong experimental problem-solving.' }
      ],
      transport: {
        route_name: 'Route 04 North City Express',
        bus_number: 'KA-04-E-8821',
        pickup_location: 'Green Valley Stop (Gate 2)',
        pickup_time: '07:35 AM',
        drop_location: 'Green Valley Stop (Gate 2)',
        drop_time: '03:45 PM',
        driver_name: 'Mr. David K.',
        driver_phone: '+1 (555) 882-1920'
      }
    };
  },

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const data = await safeFetch('/upload', {
      method: 'POST',
      body: formData,
    });
    return data || { url: URL.createObjectURL(file), name: file.name };
  }
};
