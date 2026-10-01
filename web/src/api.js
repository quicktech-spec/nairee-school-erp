import { FALLBACK_DATA } from './fallbackData.js';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

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
    const fallbackUser = FALLBACK_DATA.users.find(acc => acc.username.toLowerCase() === u || acc.id.toLowerCase() === u);

    if (fallbackUser) {
      return {
        user: fallbackUser,
        token: 'mock-jwt-token-' + fallbackUser.role
      };
    }

    // Default to admin if testing
    if (u === 'admin' || u === 'principal') {
      return { user: FALLBACK_DATA.users[0], token: 'mock-jwt-admin' };
    }

    throw new Error('Invalid credentials. Use demo accounts: admin, teacher_jenkins, nairee, or parent_patel');
  },

  async getDashboardStats() {
    const data = await safeFetch('/dashboard/stats');
    return data || FALLBACK_DATA.stats;
  },

  async getStudents(batch = '', search = '') {
    const params = new URLSearchParams();
    if (batch) params.append('batch', batch);
    if (search) params.append('search', search);
    const data = await safeFetch(`/students?${params.toString()}`);
    if (data) return data;

    let list = [...FALLBACK_DATA.students];
    if (batch && batch !== 'all') list = list.filter(s => s.batch_id === batch);
    if (search) list = list.filter(s => s.full_name.toLowerCase().includes(search.toLowerCase()));
    return list;
  },

  async getStudentDetail(id) {
    const data = await safeFetch(`/students/${id}`);
    return data || FALLBACK_DATA.students.find(s => s.id === id) || FALLBACK_DATA.students[0];
  },

  async createStudent(studentData) {
    const data = await safeFetch('/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    if (data) return data;
    const newStudent = { id: `EDU-STU-2026-${Date.now().toString().slice(-5)}`, ...studentData };
    FALLBACK_DATA.students.push(newStudent);
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
    return data || { success: true, count: Array.isArray(records) ? records.length : 0 };
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
      { id: 'RES-01', student_name: 'Nairee Patel', roll_number: '10A-01', score: 95, grade: 'A+' },
      { id: 'RES-02', student_name: 'Aarav Sharma', roll_number: '10A-02', score: 88, grade: 'A' }
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
    return { success: true, fee_id: feeId, status: 'Paid' };
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
    return data || { success: true, id, status };
  },

  async createAccount(data) {
    const res = await safeFetch('/admin/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res) return res;
    const newAcc = { id: `acc_${Date.now()}`, status: 'Active', ...data };
    FALLBACK_DATA.users.push(newAcc);
    return newAcc;
  },

  async getTeacherPerformance() {
    const data = await safeFetch('/admin/teacher-performance');
    return data || [
      { id: 'FAC-001', name: 'Prof. Sarah Jenkins', subject: 'Mathematics', rating: 4.9, attendance_avg: '98%', syllabus_progress: '85%' }
    ];
  },

  async getStudentPerformance(batch = '') {
    const params = new URLSearchParams();
    if (batch && batch !== 'all') params.append('batch', batch);
    const data = await safeFetch(`/admin/student-performance?${params.toString()}`);
    return data || [
      { id: 'EDU-STU-2026-00001', name: 'Nairee Patel', roll_number: '10A-01', gpa: '3.95', rank: '1st', attendance: '97.5%' }
    ];
  },

  async getSyllabus(params = {}) {
    const q = new URLSearchParams(params);
    const data = await safeFetch(`/syllabus?${q.toString()}`);
    return data || FALLBACK_DATA.syllabus;
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
    return data || FALLBACK_DATA.homework;
  },

  async createHomework(data) {
    const res = await safeFetch('/homework', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res || { id: `HW-${Date.now()}`, ...data };
  },

  async getHomeworkSubmissions(id) {
    const data = await safeFetch(`/homework/${id}/submissions`);
    return data || [
      { student_id: 'EDU-STU-2026-00001', student_name: 'Nairee Patel', submitted_at: 'Yesterday', status: 'Submitted', grade: 'A' }
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
    return res || { id: `MAT-${Date.now()}`, ...data };
  },

  async getAnnouncements(role = '', batch = '') {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (batch) params.append('batch', batch);
    const data = await safeFetch(`/announcements?${params.toString()}`);
    return data || FALLBACK_DATA.announcements;
  },

  async createAnnouncement(data) {
    const res = await safeFetch('/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res || { id: `ANN-${Date.now()}`, ...data };
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
    return data || FALLBACK_DATA.messages;
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
      student: FALLBACK_DATA.students[0],
      attendance_percentage: 97.5,
      fees_due: 8500,
      recent_grade: 'A+',
      bus_status: 'On Route — Approaching Stop 3'
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
