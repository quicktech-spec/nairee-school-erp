/*
==============================================================================
NAIREE SCHOOL ERP - ENTERPRISE MASTER DATABASE SCHEMA (SUPABASE / POSTGRESQL)
Version: 2.0 (Relational, Normalized 3NF, Row-Level Security Ready)
==============================================================================
*/

-- 1. EXTENSIONS & CLEANUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in reverse dependency order if resetting
DROP TABLE IF EXISTS homework_submissions CASCADE;
DROP TABLE IF EXISTS homework_assignments CASCADE;
DROP TABLE IF EXISTS exam_marks_entries CASCADE;
DROP TABLE IF EXISTS exam_schedules CASCADE;
DROP TABLE IF EXISTS exam_terms CASCADE;
DROP TABLE IF EXISTS student_daily_attendance CASCADE;
DROP TABLE IF EXISTS employee_attendance_punch CASCADE;
DROP TABLE IF EXISTS fee_payment_transactions CASCADE;
DROP TABLE IF EXISTS student_fee_invoices CASCADE;
DROP TABLE IF EXISTS fee_structures CASCADE;
DROP TABLE IF EXISTS fee_categories CASCADE;
DROP TABLE IF EXISTS timetable_slots CASCADE;
DROP TABLE IF EXISTS teacher_substitutions CASCADE;
DROP TABLE IF EXISTS daily_class_logs CASCADE;
DROP TABLE IF EXISTS transfer_certificates CASCADE;
DROP TABLE IF EXISTS alumni CASCADE;
DROP TABLE IF EXISTS guardians CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS section_subject_teachers CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS academic_years CASCADE;
DROP TABLE IF EXISTS schools CASCADE;
DROP TABLE IF EXISTS users CASCADE;

/* ==============================================================================
   2. CORE MASTER TABLES
============================================================================== */

-- 2.1 SCHOOL MASTER
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    affiliation_board VARCHAR(50) DEFAULT 'CBSE',
    address TEXT,
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 ACADEMIC YEARS
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    year_name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3 EMPLOYEES / TEACHERS / STAFF
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(20),
    dob DATE,
    blood_group VARCHAR(10),
    aadhaar_no VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    qualification VARCHAR(255),
    joining_date DATE,
    workload_hours INT DEFAULT 20,
    monthly_salary DECIMAL(12,2) NOT NULL,
    residential_address TEXT,
    permanent_address TEXT,
    bank_name VARCHAR(100),
    bank_account_no VARCHAR(50),
    bank_ifsc VARCHAR(50),
    bank_holder_name VARCHAR(255),
    pan_no VARCHAR(50),
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Active',
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 CLASSES
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    grade_name VARCHAR(50) NOT NULL,
    numeric_order INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.5 SECTIONS & CLASS TEACHERS
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    batch_code VARCHAR(50) UNIQUE NOT NULL,
    section_name VARCHAR(50) NOT NULL,
    full_batch_name VARCHAR(100) NOT NULL,
    class_teacher_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    room_no VARCHAR(50),
    capacity INT DEFAULT 35,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.6 SUBJECTS
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    subject_code VARCHAR(50) UNIQUE NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    credit_hours INT DEFAULT 4,
    default_teacher_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.7 SECTION SUBJECT TEACHER ALLOCATION
CREATE TABLE section_subject_teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE(section_id, subject_id, teacher_id)
);

/* ==============================================================================
   3. STUDENT & GUARDIAN MASTER
============================================================================== */

-- 3.1 STUDENTS
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    student_id_code VARCHAR(50) UNIQUE NOT NULL,
    admission_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(50) NOT NULL,
    section_id UUID REFERENCES sections(id) ON DELETE RESTRICT,
    stream VARCHAR(150),
    gender VARCHAR(20) NOT NULL,
    dob DATE NOT NULL,
    blood_group VARCHAR(10),
    religion VARCHAR(50),
    nationality VARCHAR(50) DEFAULT 'Indian',
    aadhaar_no VARCHAR(50),
    admission_date DATE NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    photo_url TEXT,
    residential_address TEXT NOT NULL,
    permanent_address TEXT NOT NULL,
    fee_status VARCHAR(50) DEFAULT 'Pending',
    enrollment_status VARCHAR(50) DEFAULT 'Active',
    has_siblings BOOLEAN DEFAULT FALSE,
    sibling_student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2 GUARDIANS / PARENTS
CREATE TABLE guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    father_name VARCHAR(255),
    father_occupation VARCHAR(255),
    father_phone VARCHAR(50),
    father_photo_url TEXT,
    father_address TEXT,
    mother_name VARCHAR(255),
    mother_occupation VARCHAR(255),
    mother_phone VARCHAR(50),
    mother_photo_url TEXT,
    mother_address TEXT,
    primary_guardian_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

/* ==============================================================================
   4. ATTENDANCE & BIOMETRIC LOGS
============================================================================== */

-- 4.1 STUDENT DAILY ATTENDANCE
CREATE TABLE student_daily_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    marked_by_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, attendance_date)
);

-- 4.2 EMPLOYEE / TEACHER PUNCH LOGS
CREATE TABLE employee_attendance_punch (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    punch_date DATE NOT NULL,
    punch_in_time VARCHAR(20),
    punch_out_time VARCHAR(20),
    status VARCHAR(50) DEFAULT 'On Duty',
    hours_worked DECIMAL(4,2) DEFAULT 8.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, punch_date)
);

/* ==============================================================================
   5. EXAMINATIONS & GRADEBOOK RESULTS
============================================================================== */

-- 5.1 ASSESSMENT / EXAM PLANS
CREATE TABLE exam_terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    plan_code VARCHAR(50) UNIQUE NOT NULL,
    assessment_name VARCHAR(255) NOT NULL,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE exam_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_term_id UUID REFERENCES exam_terms(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    exam_date DATE NOT NULL,
    maximum_score DECIMAL(5,2) DEFAULT 100.0,
    passing_score DECIMAL(5,2) DEFAULT 40.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.2 STUDENT MARKS & EVALUATIONS
CREATE TABLE exam_marks_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_schedule_id UUID REFERENCES exam_schedules(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL,
    maximum_score DECIMAL(5,2) DEFAULT 100.0,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS (ROUND((score / maximum_score) * 100, 2)) STORED,
    grade VARCHAR(10) NOT NULL,
    teacher_comment TEXT,
    graded_by_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exam_schedule_id, student_id)
);

/* ==============================================================================
   6. FEE MANAGEMENT & FINANCIAL LEDGER
============================================================================== */

-- 6.1 STUDENT FEE INVOICES
CREATE TABLE student_fee_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_code VARCHAR(50) UNIQUE NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    fee_type VARCHAR(100) DEFAULT 'Tuition Fee',
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    payment_date DATE,
    receipt_no VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6.2 FEE PAYMENT RECEIPTS
CREATE TABLE fee_payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES student_fee_invoices(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    receipt_no VARCHAR(50) UNIQUE NOT NULL,
    amount_paid DECIMAL(12,2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    transaction_ref_no VARCHAR(100),
    payment_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

/* ==============================================================================
   7. TIMETABLE, LECTURES & PROXIES
============================================================================== */

CREATE TABLE timetable_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    period_number INT NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    room_no VARCHAR(50)
);

CREATE TABLE daily_class_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    topic_covered VARCHAR(255) NOT NULL,
    period_slot VARCHAR(50),
    log_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE teacher_substitutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_teacher_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    substitute_teacher_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    period_slot VARCHAR(50),
    substitution_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'Approved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

/* ==============================================================================
   8. HOMEWORK & LMS SUBMISSIONS
============================================================================== */

CREATE TABLE homework_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    homework_code VARCHAR(50) UNIQUE NOT NULL,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    instructions TEXT,
    due_date VARCHAR(50) NOT NULL,
    assigned_by_employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE homework_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    homework_id UUID REFERENCES homework_assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    submission_text TEXT,
    attachment_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'Submitted',
    marks_awarded INT,
    teacher_feedback TEXT
);

/* ==============================================================================
   9. TRANSITIONS (TC & ALUMNI)
============================================================================== */

CREATE TABLE transfer_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tc_number VARCHAR(50) UNIQUE NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    leaving_date DATE NOT NULL,
    reason VARCHAR(255),
    conduct VARCHAR(50) DEFAULT 'Exemplary',
    status VARCHAR(50) DEFAULT 'Issued',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE alumni (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    passing_year VARCHAR(50) NOT NULL,
    higher_education VARCHAR(255),
    current_profession VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

/* ==============================================================================
   10. INDEXES FOR PERFORMANCE
============================================================================== */
CREATE INDEX idx_students_section ON students(section_id);
CREATE INDEX idx_students_roll ON students(roll_no);
CREATE INDEX idx_attendance_date ON student_daily_attendance(attendance_date);
CREATE INDEX idx_attendance_student ON student_daily_attendance(student_id);
CREATE INDEX idx_marks_student ON exam_marks_entries(student_id);
CREATE INDEX idx_invoices_student ON student_fee_invoices(student_id);
CREATE INDEX idx_invoices_status ON student_fee_invoices(status);
CREATE INDEX idx_teacher_punch_date ON employee_attendance_punch(punch_date);

/* ==============================================================================
   11. INITIAL SAMPLE SEED DATA
============================================================================== */
INSERT INTO schools (id, school_code, name, affiliation_board, contact_phone, contact_email)
VALUES ('11111111-1111-1111-1111-111111111111', 'NAIREE-01', 'Nairee International School', 'CBSE', '+91 98765 43210', 'admin@nairee.edu')
ON CONFLICT DO NOTHING;

INSERT INTO academic_years (id, school_id, year_name, start_date, end_date, is_current)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '2026-2027', '2026-04-01', '2027-03-31', true)
ON CONFLICT DO NOTHING;

INSERT INTO employees (id, school_id, employee_code, name, gender, email, phone, department, designation, monthly_salary, status)
VALUES 
('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'TEA-001', 'Prof. Sarah Jenkins', 'Female', 'sjenkins@nairee.edu', '+91 98765 43211', 'Mathematics & Science', 'Senior Faculty Lead', 68000, 'Active'),
('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'TEA-002', 'Dr. Evelyn Reed', 'Female', 'ereed@nairee.edu', '+91 98765 34567', 'STEM & Robotics', 'Head of STEM Academics', 75000, 'Active'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'TEA-003', 'Mr. Robert Chen', 'Male', 'rchen@nairee.edu', '+91 98765 23456', 'Computer Science', 'AI Systems Instructor', 62000, 'Active')
ON CONFLICT DO NOTHING;

INSERT INTO classes (id, school_id, grade_name, numeric_order)
VALUES 
('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', 'Class 10', 10),
('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', 'Class 11', 11)
ON CONFLICT DO NOTHING;

INSERT INTO sections (id, class_id, batch_code, section_name, full_batch_name, class_teacher_id, room_no, capacity)
VALUES 
('55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', 'CLS 10A', 'Section A', 'Class 10 - Section A', '33333333-3333-3333-3333-333333333331', 'Room 204', 35),
('55555555-5555-5555-5555-555555555552', '44444444-4444-4444-4444-444444444441', 'CLS 10B', 'Section B', 'Class 10 - Section B', '33333333-3333-3333-3333-333333333332', 'Room 205', 35)
ON CONFLICT DO NOTHING;

INSERT INTO subjects (id, school_id, subject_code, subject_name, department, credit_hours, default_teacher_id)
VALUES 
('66666666-6666-6666-6666-666666666661', '11111111-1111-1111-1111-111111111111', 'MATH 101', 'Advanced Mathematics', 'Mathematics & Science', 4, '33333333-3333-3333-3333-333333333331'),
('66666666-6666-6666-6666-666666666662', '11111111-1111-1111-1111-111111111111', 'PHYS 102', 'Physics & Dynamics', 'Physics & STEM', 4, '33333333-3333-3333-3333-333333333332'),
('66666666-6666-6666-6666-666666666663', '11111111-1111-1111-1111-111111111111', 'CS 104', 'Computer Science & AI', 'Computer Science', 3, '33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;

INSERT INTO students (id, school_id, student_id_code, admission_no, name, roll_no, section_id, stream, gender, dob, admission_date, phone, email, residential_address, permanent_address, fee_status, status)
VALUES 
('77777777-7777-7777-7777-777777777771', '11111111-1111-1111-1111-111111111111', 'STU-001', 'ADM-2024-001', 'Nairee Patel', '101', '55555555-5555-5555-5555-555555555551', 'Computer Applications & Math', 'Female', '2011-04-12', '2024-06-15', '+91 98765 00001', 'syalfreelance@gmail.com', 'Indiranagar, Bengaluru - 560038', 'Indiranagar, Bengaluru - 560038', 'Paid', 'Active'),
('77777777-7777-7777-7777-777777777772', '11111111-1111-1111-1111-111111111111', 'STU-002', 'ADM-2024-002', 'Aarav Sharma', '102', '55555555-5555-5555-5555-555555555551', 'Hindi & Applied Science', 'Male', '2011-08-25', '2024-06-16', '+91 98765 00002', 'aarav.sharma@example.com', 'Koramangala, Bengaluru - 560034', 'Koramangala, Bengaluru - 560034', 'Paid', 'Active'),
('77777777-7777-7777-7777-777777777773', '11111111-1111-1111-1111-111111111111', 'STU-003', 'ADM-2024-003', 'Diya Gupta', '103', '55555555-5555-5555-5555-555555555551', 'Sanskrit & Pure Science', 'Female', '2011-11-10', '2024-06-18', '+91 98765 00003', 'diya.gupta@example.com', 'Thanisandra, Bengaluru - 560077', 'Thanisandra, Bengaluru - 560077', 'Pending', 'Active')
ON CONFLICT DO NOTHING;
