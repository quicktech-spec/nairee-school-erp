const API_BASE = '/api';

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
  }
};
