import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db, initDatabase } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Frappe Education Backend running on http://localhost:${PORT}`);
});
