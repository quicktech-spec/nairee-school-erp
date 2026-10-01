import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'frappe_education.db');
const sqlite = sqlite3.verbose();

export const rawDb = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to Frappe Education SQLite database at', dbPath);
  }
});

// Promisified database helpers
export const db = {
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      rawDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      rawDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      rawDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },

  exec(sql) {
    return new Promise((resolve, reject) => {
      rawDb.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

export async function initDatabase() {
  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS tabProgram (
      name TEXT PRIMARY KEY,
      program_name TEXT NOT NULL,
      department TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tabCourse (
      name TEXT PRIMARY KEY,
      course_name TEXT NOT NULL,
      course_code TEXT,
      department TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tabStudentBatch (
      name TEXT PRIMARY KEY,
      batch_name TEXT NOT NULL,
      program TEXT,
      academic_year TEXT,
      academic_term TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (program) REFERENCES tabProgram(name)
    );

    CREATE TABLE IF NOT EXISTS tabFaculty (
      name TEXT PRIMARY KEY,
      faculty_name TEXT NOT NULL,
      email TEXT,
      department TEXT,
      designation TEXT,
      mobile_number TEXT,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tabStudent (
      name TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      middle_name TEXT,
      last_name TEXT,
      student_name TEXT NOT NULL,
      student_email_id TEXT,
      student_mobile_number TEXT,
      date_of_birth TEXT,
      gender TEXT,
      blood_group TEXT,
      image TEXT,
      joining_date TEXT,
      student_batch TEXT,
      roll_no TEXT,
      status TEXT DEFAULT 'Active',
      address_line_1 TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      country TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_batch) REFERENCES tabStudentBatch(name)
    );

    CREATE TABLE IF NOT EXISTS tabGuardian (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student TEXT NOT NULL,
      guardian_name TEXT NOT NULL,
      relation TEXT,
      email_address TEXT,
      mobile_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student) REFERENCES tabStudent(name)
    );

    CREATE TABLE IF NOT EXISTS tabSubjectSchedule (
      name TEXT PRIMARY KEY,
      student_batch TEXT NOT NULL,
      faculty TEXT NOT NULL,
      faculty_name TEXT,
      course TEXT NOT NULL,
      subject TEXT,
      room TEXT,
      day_of_week TEXT NOT NULL,
      from_time TEXT NOT NULL,
      to_time TEXT NOT NULL,
      color TEXT,
      title TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_batch) REFERENCES tabStudentBatch(name),
      FOREIGN KEY (faculty) REFERENCES tabFaculty(name),
      FOREIGN KEY (course) REFERENCES tabCourse(name)
    );

    CREATE TABLE IF NOT EXISTS tabStudentAttendance (
      name TEXT PRIMARY KEY,
      student TEXT NOT NULL,
      student_name TEXT,
      subject_schedule TEXT,
      student_batch TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student) REFERENCES tabStudent(name),
      FOREIGN KEY (subject_schedule) REFERENCES tabSubjectSchedule(name),
      FOREIGN KEY (student_batch) REFERENCES tabStudentBatch(name)
    );

    CREATE TABLE IF NOT EXISTS tabAssessmentPlan (
      name TEXT PRIMARY KEY,
      course TEXT NOT NULL,
      subject TEXT,
      assessment_name TEXT NOT NULL,
      assessment_group TEXT,
      academic_year TEXT,
      academic_term TEXT,
      student_batch TEXT,
      maximum_score REAL DEFAULT 100,
      weightage REAL DEFAULT 20,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course) REFERENCES tabCourse(name),
      FOREIGN KEY (student_batch) REFERENCES tabStudentBatch(name)
    );

    CREATE TABLE IF NOT EXISTS tabAssessmentResult (
      name TEXT PRIMARY KEY,
      assessment_plan TEXT NOT NULL,
      course TEXT NOT NULL,
      student TEXT NOT NULL,
      student_name TEXT,
      student_batch TEXT,
      score REAL NOT NULL,
      maximum_score REAL DEFAULT 100,
      percentage REAL,
      grade TEXT,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assessment_plan) REFERENCES tabAssessmentPlan(name),
      FOREIGN KEY (course) REFERENCES tabCourse(name),
      FOREIGN KEY (student) REFERENCES tabStudent(name)
    );

    CREATE TABLE IF NOT EXISTS tabFees (
      name TEXT PRIMARY KEY,
      student TEXT NOT NULL,
      student_name TEXT,
      program TEXT,
      student_batch TEXT,
      academic_year TEXT,
      academic_term TEXT,
      posting_date TEXT,
      due_date TEXT,
      grand_total REAL NOT NULL,
      outstanding_amount REAL NOT NULL,
      status TEXT DEFAULT 'Unpaid',
      payment_date TEXT,
      payment_method TEXT,
      receipt_no TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student) REFERENCES tabStudent(name)
    );

    CREATE TABLE IF NOT EXISTS tabFeeComponent (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent TEXT NOT NULL,
      fee_category TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      FOREIGN KEY (parent) REFERENCES tabFees(name) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tabParent (
      name TEXT PRIMARY KEY,
      parent_name TEXT NOT NULL,
      relation TEXT DEFAULT 'Father',
      email TEXT,
      mobile_number TEXT,
      occupation TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tabParentStudent (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent TEXT NOT NULL,
      student TEXT NOT NULL,
      relationship TEXT DEFAULT 'Parent',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent) REFERENCES tabParent(name),
      FOREIGN KEY (student) REFERENCES tabStudent(name)
    );

    CREATE TABLE IF NOT EXISTS tabUser (
      name TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      linked_id TEXT,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tabSyllabus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course TEXT NOT NULL,
      subject TEXT NOT NULL,
      student_batch TEXT NOT NULL,
      chapter_number INTEGER NOT NULL,
      chapter_title TEXT NOT NULL,
      total_topics INTEGER DEFAULT 10,
      completed_topics INTEGER DEFAULT 0,
      status TEXT DEFAULT 'In Progress',
      faculty TEXT,
      faculty_name TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tabHomework (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      course TEXT NOT NULL,
      subject TEXT NOT NULL,
      student_batch TEXT NOT NULL,
      faculty TEXT,
      faculty_name TEXT NOT NULL,
      due_date TEXT NOT NULL,
      instructions TEXT,
      max_points REAL DEFAULT 100,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tabHomeworkSubmission (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      homework_id INTEGER NOT NULL,
      student TEXT NOT NULL,
      student_name TEXT NOT NULL,
      submission_text TEXT,
      attachment_url TEXT,
      submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'Submitted',
      score REAL,
      feedback TEXT,
      FOREIGN KEY (homework_id) REFERENCES tabHomework(id),
      FOREIGN KEY (student) REFERENCES tabStudent(name)
    );

    CREATE TABLE IF NOT EXISTS tabStudyMaterial (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      course TEXT NOT NULL,
      subject TEXT NOT NULL,
      student_batch TEXT NOT NULL,
      material_type TEXT DEFAULT 'PDF',
      url TEXT,
      description TEXT,
      uploaded_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tabAnnouncement (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'Circular',
      target_role TEXT DEFAULT 'All',
      student_batch TEXT DEFAULT 'All',
      posted_by TEXT NOT NULL,
      priority TEXT DEFAULT 'Normal',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tabTransportRoute (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student TEXT NOT NULL,
      student_name TEXT NOT NULL,
      route_name TEXT NOT NULL,
      bus_number TEXT NOT NULL,
      driver_name TEXT NOT NULL,
      driver_phone TEXT NOT NULL,
      pickup_location TEXT NOT NULL,
      pickup_time TEXT NOT NULL,
      drop_location TEXT NOT NULL,
      drop_time TEXT NOT NULL,
      FOREIGN KEY (student) REFERENCES tabStudent(name)
    );

    CREATE TABLE IF NOT EXISTS tabMessage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_username TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      recipient_username TEXT,
      recipient_name TEXT,
      recipient_role TEXT,
      student_batch TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    await db.exec(`ALTER TABLE tabHomeworkSubmission ADD COLUMN attachment_url TEXT;`);
  } catch (err) {
    // Column already exists, safe to ignore
  }

  console.log('Frappe Education SQLite database schema initialized successfully.');
}

