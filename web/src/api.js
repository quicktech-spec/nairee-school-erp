const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export const api = {
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to load dashboard stats');
    return res.json();
  },

  async getStudents(batch = '', search = '') {
    const params = new URLSearchParams();
    if (batch) params.append('batch', batch);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/students?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load students');
    return res.json();
  },

  async getStudentDetail(id) {
    const res = await fetch(`${API_BASE}/students/${id}`);
    if (!res.ok) throw new Error('Failed to load student details');
    return res.json();
  },

  async createStudent(studentData) {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    if (!res.ok) throw new Error('Failed to create student');
    return res.json();
  },

  async getBatches() {
    const res = await fetch(`${API_BASE}/batches`);
    if (!res.ok) throw new Error('Failed to load batches');
    return res.json();
  },

  async getCourses() {
    const res = await fetch(`${API_BASE}/courses`);
    if (!res.ok) throw new Error('Failed to load courses');
    return res.json();
  },

  async getFaculty() {
    const res = await fetch(`${API_BASE}/faculty`);
    if (!res.ok) throw new Error('Failed to load faculty');
    return res.json();
  },

  async getSchedule(batch = '', day = '') {
    const params = new URLSearchParams();
    if (batch) params.append('batch', batch);
    if (day) params.append('day', day);
    const res = await fetch(`${API_BASE}/schedule?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load schedule');
    return res.json();
  },

  async getAttendance(batch = 'BATCH-10A-2026', date = '') {
    const params = new URLSearchParams();
    if (batch) params.append('batch', batch);
    if (date) params.append('date', date);
    const res = await fetch(`${API_BASE}/attendance?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load attendance');
    return res.json();
  },

  async submitBulkAttendance(batch, date, records) {
    const res = await fetch(`${API_BASE}/attendance/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch, date, records }),
    });
    if (!res.ok) throw new Error('Failed to save attendance');
    return res.json();
  },

  async getAssessmentPlans() {
    const res = await fetch(`${API_BASE}/assessments/plans`);
    if (!res.ok) throw new Error('Failed to load assessment plans');
    return res.json();
  },

  async getAssessmentResults(params = {}) {
    const q = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/assessments/results?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to load assessment results');
    return res.json();
  },

  async submitGrade(data) {
    const res = await fetch(`${API_BASE}/assessments/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit grade');
    return res.json();
  },

  async getFees(params = {}) {
    const q = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/fees?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to load fees');
    return res.json();
  },

  async payFee(feeId, paymentMethod = 'Credit Card / Online') {
    const res = await fetch(`${API_BASE}/fees/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fee_id: feeId, payment_method: paymentMethod }),
    });
    if (!res.ok) throw new Error('Failed to process payment');
    return res.json();
  },

  // Auth
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  // Admin Account & Performance
  async getUsers(role = '') {
    const params = new URLSearchParams();
    if (role && role !== 'all') params.append('role', role);
    const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load users');
    return res.json();
  },

  async toggleUserStatus(id, status) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async createAccount(data) {
    const res = await fetch(`${API_BASE}/admin/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || 'Failed to create account');
    return resData;
  },

  async getTeacherPerformance() {
    const res = await fetch(`${API_BASE}/admin/teacher-performance`);
    if (!res.ok) throw new Error('Failed to load teacher performance');
    return res.json();
  },

  async getStudentPerformance(batch = '') {
    const params = new URLSearchParams();
    if (batch && batch !== 'all') params.append('batch', batch);
    const res = await fetch(`${API_BASE}/admin/student-performance?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load student performance');
    return res.json();
  },

  // Syllabus
  async getSyllabus(params = {}) {
    const q = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/syllabus?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to load syllabus');
    return res.json();
  },

  async updateSyllabus(id, data) {
    const res = await fetch(`${API_BASE}/syllabus/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update syllabus');
    return res.json();
  },

  async createSyllabus(data) {
    const res = await fetch(`${API_BASE}/syllabus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add syllabus chapter');
    return res.json();
  },

  // Homework & Assignments
  async getHomework(params = {}) {
    const q = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/homework?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to load homework');
    return res.json();
  },

  async createHomework(data) {
    const res = await fetch(`${API_BASE}/homework`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create homework');
    return res.json();
  },

  async getHomeworkSubmissions(id) {
    const res = await fetch(`${API_BASE}/homework/${id}/submissions`);
    if (!res.ok) throw new Error('Failed to load submissions');
    return res.json();
  },

  async submitHomework(data) {
    const res = await fetch(`${API_BASE}/homework/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit homework');
    return res.json();
  },

  async gradeHomework(data) {
    const res = await fetch(`${API_BASE}/homework/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to grade homework');
    return res.json();
  },

  // Study Materials
  async getStudyMaterials(params = {}) {
    const q = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/study-materials?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to load study materials');
    return res.json();
  },

  async uploadStudyMaterial(data) {
    const res = await fetch(`${API_BASE}/study-materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to upload study material');
    return res.json();
  },

  // Announcements
  async getAnnouncements(role = '', batch = '') {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (batch) params.append('batch', batch);
    const res = await fetch(`${API_BASE}/announcements?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load announcements');
    return res.json();
  },

  async createAnnouncement(data) {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to publish announcement');
    return res.json();
  },

  // Transport
  async getTransport(studentId) {
    const res = await fetch(`${API_BASE}/transport/${studentId}`);
    if (!res.ok) throw new Error('Failed to load transport info');
    return res.json();
  },

  // Messages
  async getMessages(username = '', role = '') {
    const params = new URLSearchParams();
    if (username) params.append('username', username);
    if (role) params.append('role', role);
    const res = await fetch(`${API_BASE}/messages?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load messages');
    return res.json();
  },

  async sendMessage(data) {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  // Parent Child Full Snapshot
  async getParentChildSummary(studentId) {
    const res = await fetch(`${API_BASE}/parent/child/${studentId}/summary`);
    if (!res.ok) throw new Error('Failed to load child summary');
    return res.json();
  },

  // File Upload
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload file');
    return res.json();
  }
};

