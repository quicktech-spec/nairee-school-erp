-- ==============================================================================
-- NAIREE SCHOOL ERP — ENTERPRISE MASTER DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- Version: 2.0 (Relational, Normalized 3NF, Row-Level Security Ready)
-- ==============================================================================

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

-- ==============================================================================
-- 2. CORE MASTER TABLES
-- ==============================================================================

-- 2.1 SCHOOL MASTER (Multi-Tenancy)
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
    year_name VARCHAR(50) NOT NULL, -- e.g. '2026-2027'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3 EMPLOYEES / TEACHERS / STAFF
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'TEA-001'
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
    grade_name VARCHAR(50) NOT NULL, -- e.g. 'Class 10'
    numeric_order INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.5 SECTIONS & CLASS TEACHERS
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    batch_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'CLS 10A'
    section_name VARCHAR(50) NOT NULL, -- e.g. 'Section A'
    full_batch_name VARCHAR(100) NOT NULL, -- e.g. 'Class 10 - Section A'
    class_teacher_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    room_no VARCHAR(50),
    capacity INT DEFAULT 35,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.6 SUBJECTS
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    subject_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'MATH 101'
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

-- ==============================================================================
-- 3. STUDENT & GUARDIAN MASTER
-- ==============================================================================

-- 3.1 STUDENTS
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    student_id_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'STU-001'
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
    enrollment_status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Transferred', 'Graduated'
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

-- ==============================================================================
-- 4. ATTENDANCE & BIOMETRIC LOGS
-- ==============================================================================

-- 4.1 STUDENT DAILY ATTENDANCE
CREATE TABLE student_daily_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'Present', 'Absent', 'Late', 'Excused'
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
    status VARCHAR(50) DEFAULT 'On Duty', -- 'On Duty', 'Completed Shift', 'Leave'
    hours_worked DECIMAL(4,2) DEFAULT 8.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, punch_date)
);

-- ==============================================================================
-- 5. EXAMINATIONS & GRADEBOOK RESULTS
-- ==============================================================================

-- 5.1 ASSESSMENT / EXAM PLANS
CREATE TABLE exam_terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    plan_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'PLAN-01'
    assessment_name VARCHAR(255) NOT NULL, -- e.g. 'Mid-Term Examinations 2026'
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
    grade VARCHAR(10) NOT NULL, -- 'A+', 'A', 'B+', 'B', 'C', 'F'
    teacher_comment TEXT,
    graded_by_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exam_schedule_id, student_id)
);

-- ==============================================================================
-- 6. FEE MANAGEMENT & FINANCIAL LEDGER
-- ==============================================================================

-- 6.1 STUDENT FEE INVOICES
CREATE TABLE student_fee_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'INV-2026-001'
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    fee_type VARCHAR(100) DEFAULT 'Tuition Fee', -- 'Tuition Fee', 'Lab Fee', 'Transport Fee'
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Paid', 'Partially_Paid'
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
    payment_mode VARCHAR(50) NOT NULL, -- 'UPI', 'Credit Card', 'Cash', 'NetBanking'
    transaction_ref_no VARCHAR(100),
    payment_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 7. TIMETABLE, LECTURES & PROXIES
-- ==============================================================================

CREATE TABLE timetable_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL, -- 'Monday', 'Tuesday', etc.
    period_number INT NOT NULL, -- 1 to 8
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

-- ==============================================================================
-- 8. HOMEWORK & LMS SUBMISSIONS
-- ==============================================================================

CREATE TABLE homework_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    homework_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'HW 001'
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
    status VARCHAR(50) DEFAULT 'Submitted', -- 'Submitted', 'Graded'
    marks_awarded INT,
    teacher_feedback TEXT
);

-- ==============================================================================
-- 9. TRANSITIONS (TC & ALUMNI)
-- ==============================================================================

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

-- ==============================================================================
-- 10. INDEXES FOR LIGHTNING FAST QUERIES (B-TREE)
-- ==============================================================================
CREATE INDEX idx_students_section ON students(section_id);
CREATE INDEX idx_students_roll ON students(roll_no);
CREATE INDEX idx_attendance_date ON student_daily_attendance(attendance_date);
CREATE INDEX idx_attendance_student ON student_daily_attendance(student_id);
CREATE INDEX idx_marks_student ON exam_marks_entries(student_id);
CREATE INDEX idx_invoices_student ON student_fee_invoices(student_id);
CREATE INDEX idx_invoices_status ON student_fee_invoices(status);
CREATE INDEX idx_teacher_punch_date ON employee_attendance_punch(punch_date);

-- Schema setup complete! Ready for Supabase SQL Editor execution.
