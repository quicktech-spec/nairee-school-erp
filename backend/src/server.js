import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, initDatabase } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB limit
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// Generic file upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    filename: req.file.originalname,
    storedFilename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

// Initialize DB schema on startup
await initDatabase();

// -------------------------------------------------------------
// 1. DASHBOARD & SYSTEM OVERVIEW
// -------------------------------------------------------------
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const studentCount = await db.get("SELECT COUNT(*) as count FROM tabStudent WHERE status = 'Active'");
    const batchCount = await db.get("SELECT COUNT(*) as count FROM tabStudentBatch");
    const facultyCount = await db.get("SELECT COUNT(*) as count FROM tabFaculty");
    const courseCount = await db.get("SELECT COUNT(*) as count FROM tabCourse");

    // Attendance stats
    const totalAtt = await db.get("SELECT COUNT(*) as total FROM tabStudentAttendance");
    const presentAtt = await db.get("SELECT COUNT(*) as present FROM tabStudentAttendance WHERE status = 'Present'");
    const attendancePct = totalAtt.total > 0 ? Math.round((presentAtt.present / totalAtt.total) * 100) : 100;

    // Fees stats
    const feeTotals = await db.get(`
      SELECT 
        COALESCE(SUM(grand_total), 0) as totalBilled,
        COALESCE(SUM(CASE WHEN status = 'Paid' THEN grand_total ELSE 0 END), 0) as totalCollected,
        COALESCE(SUM(outstanding_amount), 0) as totalOutstanding
      FROM tabFees
    `);

    // Recent Activities Feed
    const recentAssessments = await db.all(`
      SELECT student_name, course, score, maximum_score, grade, created_at
      FROM tabAssessmentResult
      ORDER BY created_at DESC LIMIT 4
    `);

    const recentAttendance = await db.all(`
      SELECT student_name, date, status
      FROM tabStudentAttendance
      ORDER BY date DESC LIMIT 4
    `);

    res.json({
      students: studentCount.count,
      batches: batchCount.count,
      faculty: facultyCount.count,
      courses: courseCount.count,
      attendanceRate: attendancePct,
      finance: {
        totalBilled: feeTotals.totalBilled,
        totalCollected: feeTotals.totalCollected,
        totalOutstanding: feeTotals.totalOutstanding,
        collectionRate: feeTotals.totalBilled > 0 
          ? Math.round((feeTotals.totalCollected / feeTotals.totalBilled) * 100) 
          : 0
      },
      recentAssessments,
      recentAttendance
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 2. STUDENTS (tabStudent & tabGuardian)
// -------------------------------------------------------------
app.get('/api/students', async (req, res) => {
  try {
    const { batch, search } = req.query;
    let query = `
      SELECT s.*, b.batch_name, p.program_name
      FROM tabStudent s
      LEFT JOIN tabStudentBatch b ON s.student_batch = b.name
      LEFT JOIN tabProgram p ON b.program = p.name
      WHERE 1=1
    `;
    const params = [];

    if (batch && batch !== 'all') {
      query += ` AND s.student_batch = ?`;
      params.push(batch);
    }
    if (search) {
      query += ` AND (s.student_name LIKE ? OR s.name LIKE ? OR s.roll_no LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY s.roll_no ASC, s.name ASC`;
    const rows = await db.all(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await db.get(`
      SELECT s.*, b.batch_name, p.program_name, p.department
      FROM tabStudent s
      LEFT JOIN tabStudentBatch b ON s.student_batch = b.name
      LEFT JOIN tabProgram p ON b.program = p.name
      WHERE s.name = ? OR s.roll_no = ?
    `, [id, id]);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const guardians = await db.all(`SELECT * FROM tabGuardian WHERE student = ?`, [student.name]);
    
    // Attendance statistics
    const attendanceRecords = await db.all(`
      SELECT a.*, s.subject, s.from_time, s.to_time
      FROM tabStudentAttendance a
      LEFT JOIN tabSubjectSchedule s ON a.subject_schedule = s.name
      WHERE a.student = ?
      ORDER BY a.date DESC
    `, [student.name]);

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(a => a.status === 'Present').length;
    const attPercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    // Grades / Assessment Results
    const assessments = await db.all(`
      SELECT r.*, p.assessment_name, p.assessment_group
      FROM tabAssessmentResult r
      LEFT JOIN tabAssessmentPlan p ON r.assessment_plan = p.name
      WHERE r.student = ?
      ORDER BY r.created_at DESC
    `, [student.name]);

    // Fees
    const fees = await db.all(`
      SELECT * FROM tabFees WHERE student = ? ORDER BY posting_date DESC
    `, [student.name]);

    for (const f of fees) {
      f.components = await db.all(`SELECT * FROM tabFeeComponent WHERE parent = ?`, [f.name]);
    }

    res.json({
      ...student,
      guardians,
      attendance: {
        totalDays,
        presentDays,
        percentage: attPercentage,
        records: attendanceRecords
      },
      assessments,
      fees
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create student with Frappe naming series
app.post('/api/students', async (req, res) => {
  try {
    const {
      first_name, middle_name = '', last_name, student_email_id,
      student_mobile_number, date_of_birth, gender, blood_group = 'O+',
      image, student_batch, roll_no, address_line_1, city, state, pincode, country = 'United States'
    } = req.body;

    const student_name = `${first_name} ${middle_name ? middle_name + ' ' : ''}${last_name}`.trim();
    
    // Frappe auto-naming series: EDU-STU-YYYY-XXXXX
    const year = new Date().getFullYear();
    const countRow = await db.get('SELECT COUNT(*) as count FROM tabStudent');
    const nextSeq = String(countRow.count + 1).padStart(5, '0');
    const name = `EDU-STU-${year}-${nextSeq}`;

    await db.run(`
      INSERT INTO tabStudent (
        name, first_name, middle_name, last_name, student_name, student_email_id,
        student_mobile_number, date_of_birth, gender, blood_group, image, joining_date,
        student_batch, roll_no, status, address_line_1, city, state, pincode, country
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), ?, ?, 'Active', ?, ?, ?, ?, ?)
    `, [
      name, first_name, middle_name, last_name, student_name, student_email_id,
      student_mobile_number, date_of_birth, gender, blood_group, 
      image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      student_batch, roll_no || String(countRow.count + 101),
      address_line_1, city, state, pincode, country
    ]);

    res.status(201).json({ message: 'Student registered successfully', name, student_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 3. STUDENT BATCHES & COURSES
// -------------------------------------------------------------
app.get('/api/batches', async (req, res) => {
  try {
    const batches = await db.all(`
      SELECT b.*, p.program_name, COUNT(s.name) as student_count
      FROM tabStudentBatch b
      LEFT JOIN tabProgram p ON b.program = p.name
      LEFT JOIN tabStudent s ON s.student_batch = b.name
      GROUP BY b.name
      ORDER BY b.batch_name ASC
    `);
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/courses', async (req, res) => {
  try {
    const courses = await db.all(`SELECT * FROM tabCourse ORDER BY course_name ASC`);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/faculty', async (req, res) => {
  try {
    const faculty = await db.all(`SELECT * FROM tabFaculty ORDER BY faculty_name ASC`);
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 4. SUBJECT SCHEDULE (TIMETABLE)
// -------------------------------------------------------------
app.get('/api/schedule', async (req, res) => {
  try {
    const { batch, day } = req.query;
    let query = `
      SELECT s.*, c.course_name, b.batch_name
      FROM tabSubjectSchedule s
      LEFT JOIN tabCourse c ON s.course = c.name
      LEFT JOIN tabStudentBatch b ON s.student_batch = b.name
      WHERE 1=1
    `;
    const params = [];

    if (batch && batch !== 'all') {
      query += ` AND s.student_batch = ?`;
      params.push(batch);
    }
    if (day) {
      query += ` AND s.day_of_week = ?`;
      params.push(day);
    }

    query += ` ORDER BY CASE s.day_of_week
      WHEN 'Monday' THEN 1
      WHEN 'Tuesday' THEN 2
      WHEN 'Wednesday' THEN 3
      WHEN 'Thursday' THEN 4
      WHEN 'Friday' THEN 5
      ELSE 6 END, s.from_time ASC`;

    const schedules = await db.all(query, params);
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 5. ATTENDANCE WORKFLOW (FRAPPE BULK ATTENDANCE TOOL)
// -------------------------------------------------------------
app.get('/api/attendance', async (req, res) => {
  try {
    const { batch = 'BATCH-10A-2026', date = new Date().toISOString().split('T')[0] } = req.query;

    // Get all students enrolled in this batch
    const students = await db.all(`
      SELECT name, student_name, roll_no, image
      FROM tabStudent
      WHERE student_batch = ? AND status = 'Active'
      ORDER BY roll_no ASC
    `, [batch]);

    // Check existing attendance for this batch on this date
    const existing = await db.all(`
      SELECT student, status, remarks, name
      FROM tabStudentAttendance
      WHERE student_batch = ? AND date = ?
    `, [batch, date]);

    const attMap = {};
    existing.forEach(e => {
      attMap[e.student] = { status: e.status, remarks: e.remarks, attId: e.name };
    });

    const result = students.map(s => ({
      ...s,
      status: attMap[s.name] ? attMap[s.name].status : 'Present',
      remarks: attMap[s.name] ? attMap[s.name].remarks : '',
      isMarked: !!attMap[s.name]
    }));

    res.json({ batch, date, students: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/attendance/bulk', async (req, res) => {
  try {
    const { batch, date, records } = req.body;
    if (!batch || !date || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Missing batch, date or records array' });
    }

    const year = new Date().getFullYear();
    const countRow = await db.get('SELECT COUNT(*) as count FROM tabStudentAttendance');
    let seq = countRow.count + 1;

    for (const r of records) {
      const existing = await db.get(`
        SELECT name FROM tabStudentAttendance WHERE student = ? AND date = ?
      `, [r.student, date]);

      if (existing) {
        await db.run(`
          UPDATE tabStudentAttendance
          SET status = ?, remarks = ?
          WHERE name = ?
        `, [r.status, r.remarks || '', existing.name]);
      } else {
        const attName = `ATT-${year}-${String(seq++).padStart(5, '0')}`;
        await db.run(`
          INSERT INTO tabStudentAttendance (
            name, student, student_name, student_batch, date, status, remarks
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [attName, r.student, r.student_name, batch, date, r.status, r.remarks || '']);
      }
    }

    res.json({ message: 'Attendance recorded successfully', count: records.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 6. ASSESSMENTS & GRADING WORKFLOW
// -------------------------------------------------------------
app.get('/api/assessments/plans', async (req, res) => {
  try {
    const plans = await db.all(`
      SELECT p.*, c.course_name, b.batch_name
      FROM tabAssessmentPlan p
      LEFT JOIN tabCourse c ON p.course = c.name
      LEFT JOIN tabStudentBatch b ON p.student_batch = b.name
      ORDER BY p.assessment_name ASC
    `);
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/assessments/results', async (req, res) => {
  try {
    const { plan, student, batch } = req.query;
    let query = `
      SELECT r.*, p.assessment_name, p.assessment_group, c.course_name
      FROM tabAssessmentResult r
      LEFT JOIN tabAssessmentPlan p ON r.assessment_plan = p.name
      LEFT JOIN tabCourse c ON r.course = c.name
      WHERE 1=1
    `;
    const params = [];

    if (plan) {
      query += ` AND r.assessment_plan = ?`;
      params.push(plan);
    }
    if (student) {
      query += ` AND r.student = ?`;
      params.push(student);
    }
    if (batch) {
      query += ` AND r.student_batch = ?`;
      params.push(batch);
    }

    query += ` ORDER BY r.percentage DESC`;
    const results = await db.all(query, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assessments/results', async (req, res) => {
  try {
    const { assessment_plan, course, student, student_name, student_batch, score, maximum_score = 100, comment = '' } = req.body;
    
    const percentage = Math.round((score / maximum_score) * 100 * 10) / 10;
    let grade = 'F';
    if (percentage >= 95) grade = 'A+';
    else if (percentage >= 90) grade = 'A';
    else if (percentage >= 85) grade = 'B+';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';

    const year = new Date().getFullYear();
    const countRow = await db.get('SELECT COUNT(*) as count FROM tabAssessmentResult');
    const name = `EDU-RES-${year}-${String(countRow.count + 1).padStart(5, '0')}`;

    await db.run(`
      INSERT INTO tabAssessmentResult (
        name, assessment_plan, course, student, student_name, student_batch, score, maximum_score, percentage, grade, comment
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, assessment_plan, course, student, student_name, student_batch, score, maximum_score, percentage, grade, comment]);

    res.status(201).json({ message: 'Grade submitted successfully', name, grade, percentage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 7. FEES & INVOICING WORKFLOW
// -------------------------------------------------------------
app.get('/api/fees', async (req, res) => {
  try {
    const { student, status } = req.query;
    let query = `
      SELECT f.*, p.program_name
      FROM tabFees f
      LEFT JOIN tabProgram p ON f.program = p.name
      WHERE 1=1
    `;
    const params = [];

    if (student) {
      query += ` AND f.student = ?`;
      params.push(student);
    }
    if (status && status !== 'all') {
      query += ` AND f.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY f.due_date ASC`;
    const fees = await db.all(query, params);

    for (const f of fees) {
      f.components = await db.all(`SELECT * FROM tabFeeComponent WHERE parent = ?`, [f.name]);
    }

    res.json(fees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/fees/pay', async (req, res) => {
  try {
    const { fee_id, payment_method = 'Credit Card' } = req.body;
    const fee = await db.get('SELECT * FROM tabFees WHERE name = ?', [fee_id]);
    if (!fee) {
      return res.status(404).json({ error: 'Fee invoice not found' });
    }

    const receipt_no = `REC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const payment_date = new Date().toISOString().split('T')[0];

    await db.run(`
      UPDATE tabFees
      SET outstanding_amount = 0, status = 'Paid', payment_date = ?, payment_method = ?, receipt_no = ?
      WHERE name = ?
    `, [payment_date, payment_method, receipt_no, fee_id]);

    res.json({
      message: 'Payment processed successfully',
      receipt_no,
      payment_date,
      status: 'Paid',
      amountPaid: fee.outstanding_amount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// 8. AUTHENTICATION & SINGLE LOGIN ENDPOINT
// =============================================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await db.get(
      'SELECT * FROM tabUser WHERE LOWER(username) = LOWER(?) AND password = ?',
      [username.trim(), password.trim()]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ error: 'This account has been deactivated. Please contact the administrator.' });
    }

    const token = `tok_${user.role}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    let extraData = {};
    if (user.role === 'student') {
      const student = await db.get('SELECT * FROM tabStudent WHERE name = ?', [user.linked_id]);
      extraData = { student_id: user.linked_id, student };
    } else if (user.role === 'teacher') {
      const faculty = await db.get('SELECT * FROM tabFaculty WHERE name = ?', [user.linked_id]);
      extraData = { faculty_id: user.linked_id, faculty };
    } else if (user.role === 'parent') {
      const children = await db.all(`
        SELECT s.*, ps.relationship 
        FROM tabParentStudent ps
        JOIN tabStudent s ON ps.student = s.name
        WHERE ps.parent = ?
      `, [user.linked_id]);
      extraData = { parent_id: user.linked_id, children };
    }

    res.json({
      token,
      user: {
        id: user.name,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        ...extraData
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// 9. ADMIN / PRINCIPAL PORTAL ENDPOINTS
// =============================================================
// List all users
app.get('/api/admin/users', async (req, res) => {
  try {
    const { role } = req.query;
    let query = 'SELECT * FROM tabUser WHERE 1=1';
    const params = [];
    if (role && role !== 'all') {
      query += ' AND role = ?';
      params.push(role);
    }
    query += ' ORDER BY created_at DESC';
    const users = await db.all(query, params);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle user status
app.patch('/api/admin/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.run('UPDATE tabUser SET status = ? WHERE name = ?', [status, id]);
    res.json({ message: 'User status updated', status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create account with auto-parent generation for students
app.post('/api/admin/accounts', async (req, res) => {
  try {
    const { role, full_name, email, phone, batch, parent_name, parent_email, parent_phone, department, designation } = req.body;
    if (!role || !full_name) {
      return res.status(400).json({ error: 'Role and Full Name are required' });
    }

    const count = await db.get('SELECT COUNT(*) as c FROM tabUser');
    const userId = `USR-${String(count.c + 1).padStart(3, '0')}`;
    const cleanName = full_name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const username = `${cleanName}_${Math.floor(100 + Math.random() * 900)}`;
    const tempPassword = `${role}123`;

    if (role === 'student') {
      const stuCount = await db.get('SELECT COUNT(*) as c FROM tabStudent');
      const stuId = `EDU-STU-2026-${String(stuCount.c + 1).padStart(5, '0')}`;
      const rollNo = String(100 + stuCount.c + 1);

      await db.run(`
        INSERT INTO tabStudent (
          name, first_name, last_name, student_name, student_email_id, student_mobile_number,
          student_batch, roll_no, status, joining_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active', date('now'))
      `, [stuId, full_name.split(' ')[0], full_name.split(' ').slice(1).join(' ') || '', full_name, email, phone, batch || 'BATCH-10A-2026', rollNo]);

      await db.run(`
        INSERT INTO tabUser (name, username, password, role, full_name, email, phone, linked_id, status)
        VALUES (?, ?, ?, 'student', ?, ?, ?, ?, 'Active')
      `, [userId, username, tempPassword, full_name, email, phone, stuId]);

      // Auto-generate linked Parent account
      const parCount = await db.get('SELECT COUNT(*) as c FROM tabParent');
      const parId = `PAR-${String(parCount.c + 1).padStart(3, '0')}`;
      const pName = parent_name || `Parent of ${full_name}`;
      const pEmail = parent_email || `parent.${cleanName}@family.com`;
      const pPhone = parent_phone || phone;
      const pUsername = `parent_${cleanName}_${Math.floor(100 + Math.random() * 900)}`;
      const pUserId = `USR-${String(count.c + 2).padStart(3, '0')}`;

      await db.run(`
        INSERT INTO tabParent (name, parent_name, relation, email, mobile_number)
        VALUES (?, ?, 'Guardian', ?, ?)
      `, [parId, pName, pEmail, pPhone]);

      await db.run(`
        INSERT INTO tabParentStudent (parent, student, relationship)
        VALUES (?, ?, 'Guardian')
      `, [parId, stuId]);

      await db.run(`
        INSERT INTO tabUser (name, username, password, role, full_name, email, phone, linked_id, status)
        VALUES (?, ?, 'parent123', 'parent', ?, ?, ?, ?, 'Active')
      `, [pUserId, pUsername, pName, pEmail, pPhone, parId]);

      // Create fee invoice
      const feeId = `EDU-FEE-2026-${String(stuCount.c + 1).padStart(5, '0')}`;
      await db.run(`
        INSERT INTO tabFees (
          name, student, student_name, student_batch, academic_year, academic_term,
          posting_date, due_date, grand_total, outstanding_amount, status
        ) VALUES (?, ?, ?, ?, '2026-2027', 'Term 1', date('now'), date('now', '+30 days'), 1200.0, 1200.0, 'Unpaid')
      `, [feeId, stuId, full_name, batch || 'BATCH-10A-2026']);

      await db.run(`
        INSERT INTO tabFeeComponent (parent, fee_category, description, amount)
        VALUES (?, 'Tuition Fee', 'Term 1 Standard Tuition', 1200.0)
      `, [feeId]);

      return res.status(201).json({
        message: 'Student account created and linked Parent account auto-generated successfully',
        student: { id: stuId, username, password: tempPassword, full_name },
        parent: { id: parId, username: pUsername, password: 'parent123', parent_name: pName }
      });
    } else if (role === 'teacher') {
      const facCount = await db.get('SELECT COUNT(*) as c FROM tabFaculty');
      const facId = `EDU-FAC-2026-${String(facCount.c + 1).padStart(5, '0')}`;

      await db.run(`
        INSERT INTO tabFaculty (name, faculty_name, email, department, designation, mobile_number)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [facId, full_name, email, department || 'General', designation || 'Faculty Instructor', phone]);

      await db.run(`
        INSERT INTO tabUser (name, username, password, role, full_name, email, phone, linked_id, status)
        VALUES (?, ?, ?, 'teacher', ?, ?, ?, ?, 'Active')
      `, [userId, username, tempPassword, full_name, email, phone, facId]);

      return res.status(201).json({
        message: 'Teacher account created successfully',
        teacher: { id: facId, username, password: tempPassword, full_name }
      });
    } else {
      await db.run(`
        INSERT INTO tabUser (name, username, password, role, full_name, email, phone, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')
      `, [userId, username, tempPassword, role, full_name, email, phone]);

      return res.status(201).json({
        message: 'Account created successfully',
        user: { username, password: tempPassword, role, full_name }
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher Performance Rollup for Admin
app.get('/api/admin/teacher-performance', async (req, res) => {
  try {
    const faculty = await db.all('SELECT * FROM tabFaculty');
    const performanceList = [];

    for (const f of faculty) {
      const schedules = await db.all('SELECT DISTINCT student_batch, subject, course FROM tabSubjectSchedule WHERE faculty = ?', [f.name]);
      const syllabus = await db.all('SELECT total_topics, completed_topics FROM tabSyllabus WHERE faculty = ? OR faculty_name = ?', [f.name, f.faculty_name]);
      
      let totalTopics = 0;
      let compTopics = 0;
      for (const s of syllabus) {
        totalTopics += s.total_topics;
        compTopics += s.completed_topics;
      }
      const syllabusPct = totalTopics > 0 ? Math.round((compTopics / totalTopics) * 100) : 80;

      const coursesTaught = schedules.map(s => s.course);
      let avgScore = 88.5;
      if (coursesTaught.length > 0) {
        const placeholders = coursesTaught.map(() => '?').join(',');
        const gradeStats = await db.get(`SELECT AVG(score) as avgScore FROM tabAssessmentResult WHERE course IN (${placeholders})`, coursesTaught);
        if (gradeStats && gradeStats.avgScore) {
          avgScore = Math.round(gradeStats.avgScore * 10) / 10;
        }
      }

      performanceList.push({
        id: f.name,
        name: f.faculty_name,
        department: f.department,
        designation: f.designation,
        email: f.email,
        assignedClasses: schedules.length,
        courses: schedules.map(s => s.subject),
        syllabusCompletionRate: syllabusPct,
        studentAverageScore: avgScore,
        status: syllabusPct >= 65 ? 'On Track' : 'Needs Support'
      });
    }

    res.json(performanceList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student Performance & At-Risk Indicator for Admin
app.get('/api/admin/student-performance', async (req, res) => {
  try {
    const { batch } = req.query;
    let query = `
      SELECT s.name, s.student_name, s.student_batch, s.roll_no, s.image, s.status, b.batch_name
      FROM tabStudent s
      LEFT JOIN tabStudentBatch b ON s.student_batch = b.name
      WHERE 1=1
    `;
    const params = [];
    if (batch && batch !== 'all') {
      query += ' AND s.student_batch = ?';
      params.push(batch);
    }
    const students = await db.all(query, params);
    const enriched = [];

    for (const s of students) {
      const totalAtt = await db.get('SELECT COUNT(*) as t FROM tabStudentAttendance WHERE student = ?', [s.name]);
      const presAtt = await db.get("SELECT COUNT(*) as p FROM tabStudentAttendance WHERE student = ? AND status = 'Present'", [s.name]);
      const attendancePct = totalAtt.t > 0 ? Math.round((presAtt.p / totalAtt.t) * 100) : 92;

      const gradeRow = await db.get('SELECT AVG(percentage) as avgPct FROM tabAssessmentResult WHERE student = ?', [s.name]);
      const avgGrade = gradeRow && gradeRow.avgPct ? Math.round(gradeRow.avgPct * 10) / 10 : 84;

      const feeRow = await db.get('SELECT SUM(outstanding_amount) as due FROM tabFees WHERE student = ?', [s.name]);
      const feeDues = feeRow && feeRow.due ? feeRow.due : 0;

      const isAtRisk = attendancePct < 75 || avgGrade < 65;
      const riskReasons = [];
      if (attendancePct < 75) riskReasons.push(`Low Attendance (${attendancePct}%)`);
      if (avgGrade < 65) riskReasons.push(`Academic Concern (${avgGrade}%)`);
      if (feeDues > 1000) riskReasons.push(`Outstanding Dues ($${feeDues})`);

      enriched.push({
        ...s,
        attendancePct,
        avgGrade,
        feeDues,
        isAtRisk,
        riskReasons
      });
    }

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// 10. SYLLABUS TRACKER ENDPOINTS
// =============================================================
app.get('/api/syllabus', async (req, res) => {
  try {
    const { batch, course, faculty } = req.query;
    let query = 'SELECT * FROM tabSyllabus WHERE 1=1';
    const params = [];
    if (batch && batch !== 'all') {
      query += ' AND student_batch = ?';
      params.push(batch);
    }
    if (course) {
      query += ' AND course = ?';
      params.push(course);
    }
    if (faculty) {
      query += ' AND (faculty = ? OR faculty_name = ?)';
      params.push(faculty, faculty);
    }
    query += ' ORDER BY course, chapter_number ASC';
    const list = await db.all(query, params);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/syllabus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed_topics, status } = req.body;
    await db.run(
      'UPDATE tabSyllabus SET completed_topics = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [completed_topics, status, id]
    );
    res.json({ message: 'Syllabus chapter progress updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/syllabus', async (req, res) => {
  try {
    const { course, subject, student_batch, chapter_number, chapter_title, total_topics = 10, completed_topics = 0, status = 'Upcoming', faculty, faculty_name } = req.body;
    await db.run(`
      INSERT INTO tabSyllabus (course, subject, student_batch, chapter_number, chapter_title, total_topics, completed_topics, status, faculty, faculty_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [course, subject, student_batch, chapter_number, chapter_title, total_topics, completed_topics, status, faculty, faculty_name]);
    res.status(201).json({ message: 'Syllabus chapter added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// 11. HOMEWORK & ASSIGNMENTS ENDPOINTS
// =============================================================
app.get('/api/homework', async (req, res) => {
  try {
    const { batch, faculty, student } = req.query;
    let query = 'SELECT * FROM tabHomework WHERE 1=1';
    const params = [];
    if (batch && batch !== 'all') {
      query += ' AND student_batch = ?';
      params.push(batch);
    }
    if (faculty) {
      query += ' AND (faculty = ? OR faculty_name = ?)';
      params.push(faculty, faculty);
    }
    query += ' ORDER BY due_date ASC';
    const homework = await db.all(query, params);

    for (const h of homework) {
      if (student) {
        h.submission = await db.get('SELECT * FROM tabHomeworkSubmission WHERE homework_id = ? AND student = ?', [h.id, student]);
      }
      const subCount = await db.get('SELECT COUNT(*) as c FROM tabHomeworkSubmission WHERE homework_id = ?', [h.id]);
      h.submissionCount = subCount.c;
    }

    res.json(homework);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/homework', async (req, res) => {
  try {
    const { title, course, subject, student_batch, faculty, faculty_name, due_date, instructions, max_points = 100 } = req.body;
    await db.run(`
      INSERT INTO tabHomework (title, course, subject, student_batch, faculty, faculty_name, due_date, instructions, max_points)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, course, subject, student_batch, faculty, faculty_name, due_date, instructions, max_points]);
    res.status(201).json({ message: 'Homework assignment created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/homework/:id/submissions', async (req, res) => {
  try {
    const { id } = req.params;
    const submissions = await db.all('SELECT * FROM tabHomeworkSubmission WHERE homework_id = ?', [id]);
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/homework/submit', async (req, res) => {
  try {
    const { homework_id, student, student_name, submission_text, attachment_url } = req.body;
    const existing = await db.get('SELECT * FROM tabHomeworkSubmission WHERE homework_id = ? AND student = ?', [homework_id, student]);
    if (existing) {
      await db.run(
        "UPDATE tabHomeworkSubmission SET submission_text = ?, attachment_url = COALESCE(?, attachment_url), submission_date = CURRENT_TIMESTAMP, status = 'Submitted' WHERE id = ?",
        [submission_text, attachment_url, existing.id]
      );
    } else {
      await db.run(`
        INSERT INTO tabHomeworkSubmission (homework_id, student, student_name, submission_text, attachment_url, status)
        VALUES (?, ?, ?, ?, ?, 'Submitted')
      `, [homework_id, student, student_name, submission_text, attachment_url]);
    }
    res.json({ message: 'Homework submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/homework/grade', async (req, res) => {
  try {
    const { submission_id, score, feedback } = req.body;
    await db.run(`
      UPDATE tabHomeworkSubmission
      SET score = ?, feedback = ?, status = 'Graded'
      WHERE id = ?
    `, [score, feedback, submission_id]);
    res.json({ message: 'Submission graded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// 12. STUDY MATERIALS ENDPOINTS
// =============================================================
app.get('/api/study-materials', async (req, res) => {
  try {
    const { batch, course } = req.query;
    let query = 'SELECT * FROM tabStudyMaterial WHERE 1=1';
    const params = [];
    if (batch && batch !== 'all') {
      query += ' AND student_batch = ?';
      params.push(batch);
    }
    if (course) {
      query += ' AND course = ?';
      params.push(course);
    }
    query += ' ORDER BY created_at DESC';
    const materials = await db.all(query, params);
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/study-materials', async (req, res) => {
  try {
    const { title, course, subject, student_batch, material_type, url, description, uploaded_by } = req.body;
    await db.run(`
      INSERT INTO tabStudyMaterial (title, course, subject, student_batch, material_type, url, description, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, course, subject, student_batch, material_type || 'PDF', url, description, uploaded_by]);
    res.status(201).json({ message: 'Study material uploaded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// 13. ANNOUNCEMENTS, TRANSPORT & MESSAGING ENDPOINTS
// =============================================================
app.get('/api/announcements', async (req, res) => {
  try {
    const { role, batch } = req.query;
    let query = 'SELECT * FROM tabAnnouncement WHERE 1=1';
    const params = [];
    if (role && role !== 'admin') {
      query += ' AND (target_role = "All" OR target_role = ?)';
      params.push(role);
    }
    if (batch && batch !== 'all') {
      query += ' AND (student_batch = "All" OR student_batch = ?)';
      params.push(batch);
    }
    query += ' ORDER BY created_at DESC';
    const announcements = await db.all(query, params);
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    const { title, content, category = 'Circular', target_role = 'All', student_batch = 'All', posted_by, priority = 'Normal' } = req.body;
    await db.run(`
      INSERT INTO tabAnnouncement (title, content, category, target_role, student_batch, posted_by, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, content, category, target_role, student_batch, posted_by, priority]);
    res.status(201).json({ message: 'Announcement published successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/transport/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const transport = await db.get('SELECT * FROM tabTransportRoute WHERE student = ?', [studentId]);
    if (!transport) {
      return res.json({
        student: studentId,
        route_name: 'Route 04 — North City Express',
        bus_number: 'KA-04-E-8821',
        driver_name: 'Mr. David K.',
        driver_phone: '+1 (555) 882-1920',
        pickup_location: 'Central Campus Gate',
        pickup_time: '07:45 AM',
        drop_location: 'Central Campus Gate',
        drop_time: '03:45 PM'
      });
    }
    res.json(transport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const { username, role } = req.query;
    let query = `
      SELECT * FROM tabMessage 
      WHERE 1=1
    `;
    const params = [];
    if (username) {
      query += ` AND (sender_username = ? OR recipient_username = ? OR (recipient_role = ? AND recipient_username IS NULL))`;
      params.push(username, username, role || '');
    }
    query += ' ORDER BY created_at DESC';
    const messages = await db.all(query, params);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { sender_username, sender_name, sender_role, recipient_username, recipient_name, recipient_role, student_batch, subject, message } = req.body;
    await db.run(`
      INSERT INTO tabMessage (sender_username, sender_name, sender_role, recipient_username, recipient_name, recipient_role, student_batch, subject, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [sender_username, sender_name, sender_role, recipient_username, recipient_name, recipient_role, student_batch, subject, message]);
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// 14. PARENT CHILD FULL SNAPSHOT
// =============================================================
app.get('/api/parent/child/:studentId/summary', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await db.get(`
      SELECT s.*, b.batch_name, p.program_name 
      FROM tabStudent s 
      LEFT JOIN tabStudentBatch b ON s.student_batch = b.name 
      LEFT JOIN tabProgram p ON b.program = p.name 
      WHERE s.name = ?
    `, [studentId]);
    if (!student) return res.status(404).json({ error: 'Child not found' });

    const totalAtt = await db.get('SELECT COUNT(*) as total FROM tabStudentAttendance WHERE student = ?', [studentId]);
    const presentAtt = await db.get("SELECT COUNT(*) as pres FROM tabStudentAttendance WHERE student = ? AND status = 'Present'", [studentId]);
    const absentRecords = await db.all("SELECT date, remarks FROM tabStudentAttendance WHERE student = ? AND status = 'Absent' ORDER BY date DESC", [studentId]);
    const attendancePct = totalAtt.total > 0 ? Math.round((presentAtt.pres / totalAtt.total) * 100) : 100;

    const results = await db.all('SELECT * FROM tabAssessmentResult WHERE student = ? ORDER BY created_at DESC', [studentId]);

    const fees = await db.all('SELECT * FROM tabFees WHERE student = ? ORDER BY due_date ASC', [studentId]);
    for (const f of fees) {
      f.components = await db.all('SELECT * FROM tabFeeComponent WHERE parent = ?', [f.name]);
    }

    const transport = await db.get('SELECT * FROM tabTransportRoute WHERE student = ?', [studentId]);
    const syllabus = await db.all('SELECT * FROM tabSyllabus WHERE student_batch = ?', [student.student_batch]);
    const timetable = await db.all('SELECT * FROM tabSubjectSchedule WHERE student_batch = ? ORDER BY day_of_week, from_time ASC', [student.student_batch]);

    res.json({
      student,
      attendance: {
        total: totalAtt.total,
        present: presentAtt.pres,
        percentage: attendancePct,
        absentAlerts: absentRecords
      },
      results,
      fees,
      transport,
      syllabus,
      timetable
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Frappe Education Backend running on http://localhost:${PORT}`);
});

