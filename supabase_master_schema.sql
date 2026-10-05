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

-- 2.3 EMPLOYEES / TEACHERS / STAFF FACULTY
CREATE TABLE employees (
    teacher_id VARCHAR(50) PRIMARY KEY,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
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
    class_teacher_id VARCHAR(50) REFERENCES employees(teacher_id) ON UPDATE CASCADE ON DELETE SET NULL,
    room_no VARCHAR(50),
    capacity INT DEFAULT 35,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.6 SUBJECTS
CREATE TABLE subjects (
    subject_code VARCHAR(50) PRIMARY KEY,
    subject_name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    credit_hours INT DEFAULT 4,
    default_teacher_id VARCHAR(50) REFERENCES employees(teacher_id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.7 SECTION SUBJECT TEACHER ALLOCATION
CREATE TABLE section_subject_teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    subject_id VARCHAR(50) REFERENCES subjects(subject_code) ON DELETE CASCADE,
    teacher_id VARCHAR(50) REFERENCES employees(teacher_id) ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE(section_id, subject_id, teacher_id)
);

/* ==============================================================================
   3. STUDENT & GUARDIAN MASTER
============================================================================== */

-- 3.1 STUDENTS
CREATE TABLE students (
    admission_no VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(50) NOT NULL,
    class VARCHAR(50) NOT NULL,
    section VARCHAR(20) NOT NULL,
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
    status VARCHAR(50) DEFAULT 'Active',
    has_siblings BOOLEAN DEFAULT FALSE,
    sibling_student_id VARCHAR(50) REFERENCES students(admission_no) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2 GUARDIANS / PARENTS
CREATE TABLE guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) REFERENCES students(admission_no) ON UPDATE CASCADE ON DELETE CASCADE,
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
    student_id VARCHAR(50) REFERENCES students(admission_no) ON UPDATE CASCADE ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    marked_by_employee_id VARCHAR(50) REFERENCES employees(teacher_id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, attendance_date)
);

-- 4.2 EMPLOYEE / TEACHER PUNCH LOGS
CREATE TABLE employee_attendance_punch (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) REFERENCES employees(teacher_id) ON UPDATE CASCADE ON DELETE CASCADE,
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
    subject_id VARCHAR(50) REFERENCES subjects(subject_code) ON DELETE CASCADE,
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
    student_id VARCHAR(50) REFERENCES students(admission_no) ON UPDATE CASCADE ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL,
    maximum_score DECIMAL(5,2) DEFAULT 100.0,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS (ROUND((score / maximum_score) * 100, 2)) STORED,
    grade VARCHAR(10) NOT NULL,
    teacher_comment TEXT,
    graded_by_employee_id VARCHAR(50) REFERENCES employees(teacher_id) ON UPDATE CASCADE ON DELETE SET NULL,
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
    student_id VARCHAR(50) REFERENCES students(admission_no) ON UPDATE CASCADE ON DELETE CASCADE,
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
    student_id VARCHAR(50) REFERENCES students(admission_no) ON UPDATE CASCADE ON DELETE CASCADE,
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
    subject_id VARCHAR(50) REFERENCES subjects(subject_code) ON DELETE CASCADE,
    teacher_id VARCHAR(50) REFERENCES employees(teacher_id) ON UPDATE CASCADE ON DELETE CASCADE,
    room_no VARCHAR(50)
);

CREATE TABLE daily_class_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id VARCHAR(50) REFERENCES employees(teacher_id) ON UPDATE CASCADE ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    subject_id VARCHAR(50) REFERENCES subjects(subject_code) ON DELETE CASCADE,
    topic_covered VARCHAR(255) NOT NULL,
    period_slot VARCHAR(50),
    log_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE teacher_substitutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_teacher_id VARCHAR(50) REFERENCES employees(teacher_id) ON UPDATE CASCADE ON DELETE CASCADE,
    substitute_teacher_id VARCHAR(50) REFERENCES employees(teacher_id) ON UPDATE CASCADE ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    subject_id VARCHAR(50) REFERENCES subjects(subject_code) ON DELETE CASCADE,
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
    subject_id VARCHAR(50) REFERENCES subjects(subject_code) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    instructions TEXT,
    due_date VARCHAR(50) NOT NULL,
    assigned_by_employee_id VARCHAR(50) REFERENCES employees(teacher_id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE homework_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    homework_id UUID REFERENCES homework_assignments(id) ON DELETE CASCADE,
    student_id VARCHAR(50) REFERENCES students(admission_no) ON UPDATE CASCADE ON DELETE CASCADE,
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
    student_id VARCHAR(50) REFERENCES students(admission_no) ON UPDATE CASCADE ON DELETE CASCADE,
    leaving_date DATE NOT NULL,
    reason VARCHAR(255),
    conduct VARCHAR(50) DEFAULT 'Exemplary',
    status VARCHAR(50) DEFAULT 'Issued',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE alumni (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) REFERENCES students(admission_no) ON UPDATE CASCADE ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    passing_year VARCHAR(50) NOT NULL,
    higher_education VARCHAR(255),
    current_profession VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

/* ==============================================================================
   10. INDEXES & REACTIVE CASCADING TRIGGERS
============================================================================== */
CREATE INDEX idx_students_class_section ON students(class, section);
CREATE INDEX idx_students_roll ON students(roll_no);
CREATE INDEX idx_attendance_date ON student_daily_attendance(attendance_date);
CREATE INDEX idx_attendance_student ON student_daily_attendance(student_id);
CREATE INDEX idx_marks_student ON exam_marks_entries(student_id);
CREATE INDEX idx_invoices_student ON student_fee_invoices(student_id);
CREATE INDEX idx_invoices_status ON student_fee_invoices(status);
CREATE INDEX idx_teacher_punch_date ON employee_attendance_punch(punch_date);

-- Trigger 1: Automatically recalculate student fee status when fee invoices or payments change
CREATE OR REPLACE FUNCTION fn_sync_student_fee_status()
RETURNS TRIGGER AS $$
DECLARE
    target_student_id VARCHAR(50);
    has_unpaid BOOLEAN;
BEGIN
    target_student_id := COALESCE(NEW.student_id, OLD.student_id);
    IF target_student_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM student_fee_invoices 
            WHERE student_id = target_student_id AND status != 'Paid'
        ) INTO has_unpaid;
        
        UPDATE students 
        SET fee_status = CASE WHEN has_unpaid THEN 'Pending' ELSE 'Paid' END
        WHERE admission_no = target_student_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_fee_status ON student_fee_invoices;
CREATE TRIGGER trg_sync_fee_status
AFTER INSERT OR UPDATE OR DELETE ON student_fee_invoices
FOR EACH ROW
EXECUTE FUNCTION fn_sync_student_fee_status();

-- Trigger 2: Auto-compute grade letter and percentage on exam_marks_entries
CREATE OR REPLACE FUNCTION fn_calculate_exam_grade()
RETURNS TRIGGER AS $$
DECLARE
    pct DECIMAL(5,2);
BEGIN
    IF NEW.maximum_score > 0 THEN
        pct := ROUND((NEW.score / NEW.maximum_score) * 100, 2);
    ELSE
        pct := 0;
    END IF;
    
    IF pct >= 90 THEN NEW.grade := 'A+';
    ELSIF pct >= 80 THEN NEW.grade := 'A';
    ELSIF pct >= 70 THEN NEW.grade := 'B+';
    ELSIF pct >= 60 THEN NEW.grade := 'B';
    ELSIF pct >= 50 THEN NEW.grade := 'C';
    ELSE NEW.grade := 'D';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calc_exam_grade ON exam_marks_entries;
CREATE TRIGGER trg_calc_exam_grade
BEFORE INSERT OR UPDATE OF score, maximum_score ON exam_marks_entries
FOR EACH ROW
EXECUTE FUNCTION fn_calculate_exam_grade();

/* ==============================================================================
   11. INITIAL SAMPLE SEED DATA (10 RECORDS PER TABLE)
============================================================================== */
INSERT INTO schools (id, school_code, name, affiliation_board, contact_phone, contact_email)
VALUES ('11111111-1111-1111-1111-111111111111', 'NAIREE-01', 'Nairee International School', 'CBSE', '+91 98765 43210', 'admin@nairee.edu')
ON CONFLICT (id) DO NOTHING;

INSERT INTO academic_years (id, school_id, year_name, start_date, end_date, is_current)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '2026-2027', '2026-04-01', '2027-03-31', true)
ON CONFLICT (id) DO NOTHING;

-- 10 EMPLOYEES / TEACHERS
INSERT INTO employees (teacher_id, name, gender, email, phone, department, designation, monthly_salary, aadhaar_no, joining_date, status)
VALUES ('NIS-2020-811-001', 'Prof. Sarah Jenkins', 'Female', 'sjenkins@nairee.edu', '+91 98765 43211', 'Mathematics & Science', 'Senior Faculty Lead', 68000, '8765 4321 0811', '2020-06-15', 'Active')
ON CONFLICT (teacher_id) DO NOTHING;

INSERT INTO employees (teacher_id, name, gender, email, phone, department, designation, monthly_salary, aadhaar_no, joining_date, status)
VALUES ('NIS-2019-812-002', 'Dr. Evelyn Reed', 'Female', 'ereed@nairee.edu', '+91 98765 34567', 'STEM & Robotics', 'Head of STEM Academics', 75000, '8765 4321 0812', '2019-07-01', 'Active')
ON CONFLICT (teacher_id) DO NOTHING;

INSERT INTO employees (teacher_id, name, gender, email, phone, department, designation, monthly_salary, aadhaar_no, joining_date, status)
VALUES ('NIS-2021-813-003', 'Mr. Robert Chen', 'Male', 'rchen@nairee.edu', '+91 98765 23456', 'Computer Science', 'AI Systems Instructor', 62000, '8765 4321 0813', '2021-08-10', 'Active')
ON CONFLICT (teacher_id) DO NOTHING;

INSERT INTO employees (teacher_id, name, gender, email, phone, department, designation, monthly_salary, aadhaar_no, joining_date, status)
VALUES ('NIS-2022-814-004', 'Ms. Clara Oswald', 'Female', 'coswald@nairee.edu', '+91 98765 12345', 'Humanities & English', 'Literature Lead', 58000, '8765 4321 0814', '2022-04-12', 'Active')
ON CONFLICT (teacher_id) DO NOTHING;

INSERT INTO employees (teacher_id, name, gender, email, phone, department, designation, monthly_salary, aadhaar_no, joining_date, status)
VALUES ('NIS-2021-815-005', 'Ms. Priya Deshmukh', 'Female', 'pdeshmukh@nairee.edu', '+91 98765 43215', 'Languages & Humanities', 'Hindi & Sanskrit Faculty', 58000, '8765 4321 0815', '2021-06-18', 'Active')
ON CONFLICT (teacher_id) DO NOTHING;

INSERT INTO employees (teacher_id, name, gender, email, phone, department, designation, monthly_salary, aadhaar_no, joining_date, status)
VALUES ('NIS-2018-816-006', 'Dr. Alok Chatterjee', 'Male', 'achatterjee@nairee.edu', '+91 98765 43230', 'Chemistry & Science', 'Head of Chemistry', 72000, '8765 4321 0816', '2018-03-20', 'Active')
ON CONFLICT (teacher_id) DO NOTHING;

INSERT INTO employees (teacher_id, name, gender, email, phone, department, designation, monthly_salary, aadhaar_no, joining_date, status)
VALUES ('NIS-2020-817-007', 'Mrs. Meenakshi Sundaram', 'Female', 'msundaram@nairee.edu', '+91 98765 43232', 'Life Sciences', 'Senior Biology Lead', 64000, '8765 4321 0817', '2020-09-05', 'Active')
ON CONFLICT (teacher_id) DO NOTHING;

INSERT INTO employees (teacher_id, name, gender, email, phone, department, designation, monthly_salary, aadhaar_no, joining_date, status)
VALUES ('NIS-2019-818-008', 'Mr. Vikramaditya Rao', 'Male', 'vrao@nairee.edu', '+91 98765 43234', 'Social Sciences', 'History & Civics Chair', 61000, '8765 4321 0818', '2019-11-15', 'Active')
ON CONFLICT (teacher_id) DO NOTHING;

INSERT INTO employees (teacher_id, name, gender, email, phone, department, designation, monthly_salary, aadhaar_no, joining_date, status)
VALUES ('NIS-2023-819-009', 'Mr. Arjun Kapoor', 'Male', 'akapoor@nairee.edu', '+91 98765 43236', 'Sports & Physical Education', 'Athletics & Sports Director', 56000, '8765 4321 0819', '2023-01-10', 'Active')
ON CONFLICT (teacher_id) DO NOTHING;

INSERT INTO employees (teacher_id, name, gender, email, phone, department, designation, monthly_salary, aadhaar_no, joining_date, status)
VALUES ('NIS-2021-820-010', 'Mrs. Anita Desai', 'Female', 'adesai@nairee.edu', '+91 98765 43238', 'Commerce & Economics', 'Senior Commerce Faculty', 60000, '8765 4321 0820', '2021-05-25', 'Active')
ON CONFLICT (teacher_id) DO NOTHING;

-- 10 CLASSES & SECTIONS
INSERT INTO classes (id, school_id, grade_name, numeric_order)
VALUES ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', 'Class 10', 10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO classes (id, school_id, grade_name, numeric_order)
VALUES ('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', 'Class 11', 11)
ON CONFLICT (id) DO NOTHING;

INSERT INTO classes (id, school_id, grade_name, numeric_order)
VALUES ('44444444-4444-4444-4444-444444444443', '11111111-1111-1111-1111-111111111111', 'Class 12', 12)
ON CONFLICT (id) DO NOTHING;

INSERT INTO classes (id, school_id, grade_name, numeric_order)
VALUES ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Class 9', 9)
ON CONFLICT (id) DO NOTHING;

INSERT INTO classes (id, school_id, grade_name, numeric_order)
VALUES ('44444444-4444-4444-4444-444444444445', '11111111-1111-1111-1111-111111111111', 'Class 8', 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO classes (id, school_id, grade_name, numeric_order)
VALUES ('44444444-4444-4444-4444-444444444446', '11111111-1111-1111-1111-111111111111', 'Class 6', 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sections (id, class_id, batch_code, section_name, full_batch_name, class_teacher_id, room_no, capacity)
VALUES ('55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', 'CLS-10A', 'Section A', 'Class 10 - Section A', 'NIS-2020-811-001', 'Room 204', 35)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sections (id, class_id, batch_code, section_name, full_batch_name, class_teacher_id, room_no, capacity)
VALUES ('55555555-5555-5555-5555-555555555552', '44444444-4444-4444-4444-444444444441', 'CLS-10B', 'Section B', 'Class 10 - Section B', 'NIS-2019-812-002', 'Room 205', 35)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sections (id, class_id, batch_code, section_name, full_batch_name, class_teacher_id, room_no, capacity)
VALUES ('55555555-5555-5555-5555-555555555553', '44444444-4444-4444-4444-444444444442', 'CLS-11A', 'Section A', 'Class 11 - Section A', 'NIS-2021-813-003', 'Room 301', 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sections (id, class_id, batch_code, section_name, full_batch_name, class_teacher_id, room_no, capacity)
VALUES ('55555555-5555-5555-5555-555555555554', '44444444-4444-4444-4444-444444444442', 'CLS-11B', 'Section B', 'Class 11 - Section B', 'NIS-2018-816-006', 'Room 302', 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sections (id, class_id, batch_code, section_name, full_batch_name, class_teacher_id, room_no, capacity)
VALUES ('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444443', 'CLS-12A', 'Section A', 'Class 12 - Section A', 'NIS-2022-814-004', 'Room 303', 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sections (id, class_id, batch_code, section_name, full_batch_name, class_teacher_id, room_no, capacity)
VALUES ('55555555-5555-5555-5555-555555555556', '44444444-4444-4444-4444-444444444443', 'CLS-12B', 'Section B', 'Class 12 - Section B', 'NIS-2021-820-010', 'Room 304', 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sections (id, class_id, batch_code, section_name, full_batch_name, class_teacher_id, room_no, capacity)
VALUES ('55555555-5555-5555-5555-555555555557', '44444444-4444-4444-4444-444444444444', 'CLS-09A', 'Section A', 'Class 9 - Section A', 'NIS-2021-815-005', 'Room 104', 35)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sections (id, class_id, batch_code, section_name, full_batch_name, class_teacher_id, room_no, capacity)
VALUES ('55555555-5555-5555-5555-555555555558', '44444444-4444-4444-4444-444444444444', 'CLS-09B', 'Section B', 'Class 9 - Section B', 'NIS-2020-817-007', 'Room 105', 35)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sections (id, class_id, batch_code, section_name, full_batch_name, class_teacher_id, room_no, capacity)
VALUES ('55555555-5555-5555-5555-555555555559', '44444444-4444-4444-4444-444444444445', 'CLS-08A', 'Section A', 'Class 8 - Section A', 'NIS-2019-818-008', 'Room 102', 35)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sections (id, class_id, batch_code, section_name, full_batch_name, class_teacher_id, room_no, capacity)
VALUES ('55555555-5555-5555-5555-555555555560', '44444444-4444-4444-4444-444444444446', 'CLS-06A', 'Section A', 'Class 6 - Section A', 'NIS-2023-819-009', 'Room 101', 35)
ON CONFLICT (id) DO NOTHING;

-- 10 SUBJECTS
INSERT INTO subjects (subject_code, subject_name, department, credit_hours)
VALUES 
('MATH-101', 'Advanced Mathematics', 'Mathematics & Science', 4),
('PHYS-102', 'Physics & Dynamics', 'Physics & STEM', 4),
('CS-104', 'Computer Science & AI', 'Computer Science', 3),
('ENG-105', 'English & World Literature', 'Humanities & English', 3),
('HIN-106', 'Hindi Literature & Grammar', 'Languages & Humanities', 3),
('CHEM-103', 'Organic & Inorganic Chemistry', 'Chemistry & Science', 4),
('BIO-107', 'Genetics & Cellular Biology', 'Life Sciences', 4),
('HIST-108', 'Modern World History & Civics', 'Social Sciences', 3),
('PE-109', 'Physical Education & Athletics', 'Sports & Physical Education', 2),
('ECON-110', 'Macroeconomics & Financial Markets', 'Commerce & Economics', 4)
ON CONFLICT (subject_code) DO NOTHING;

-- 10 STUDENTS
INSERT INTO students (admission_no, name, roll_no, class, section, stream, gender, dob, admission_date, phone, email, residential_address, permanent_address, fee_status, status)
VALUES ('NIS-2024-091-001', 'Nairee Patel', '01', 'Class 10', 'Section A', 'Computer Applications & Math', 'Female', '2011-04-12', '2024-06-15', '+91 98765 00001', 'syalfreelance@gmail.com', 'Indiranagar, Bengaluru - 560038', 'Indiranagar, Bengaluru - 560038', 'Paid', 'Active')
ON CONFLICT (admission_no) DO NOTHING;

INSERT INTO students (admission_no, name, roll_no, class, section, stream, gender, dob, admission_date, phone, email, residential_address, permanent_address, fee_status, status)
VALUES ('NIS-2024-092-002', 'Aarav Sharma', '02', 'Class 10', 'Section A', 'Hindi & Applied Science', 'Male', '2011-08-25', '2024-06-16', '+91 98765 00002', 'aarav.sharma@example.com', 'Koramangala, Bengaluru - 560034', 'Koramangala, Bengaluru - 560034', 'Paid', 'Active')
ON CONFLICT (admission_no) DO NOTHING;

INSERT INTO students (admission_no, name, roll_no, class, section, stream, gender, dob, admission_date, phone, email, residential_address, permanent_address, fee_status, status)
VALUES ('NIS-2024-093-003', 'Diya Gupta', '03', 'Class 10', 'Section A', 'Sanskrit & Pure Science', 'Female', '2011-11-10', '2024-06-18', '+91 98765 00003', 'diya.gupta@example.com', 'Thanisandra, Bengaluru - 560077', 'Thanisandra, Bengaluru - 560077', 'Pending', 'Active')
ON CONFLICT (admission_no) DO NOTHING;

INSERT INTO students (admission_no, name, roll_no, class, section, stream, gender, dob, admission_date, phone, email, residential_address, permanent_address, fee_status, status)
VALUES ('NIS-2024-094-004', 'Rohan Mehta', '04', 'Class 10', 'Section A', 'Physical Education (PE) & Math', 'Male', '2011-02-18', '2024-06-20', '+91 98765 00004', 'rohan.mehta@example.com', 'Malleshwaram, Bengaluru - 560055', 'Malleshwaram, Bengaluru - 560055', 'Paid', 'Active')
ON CONFLICT (admission_no) DO NOTHING;

INSERT INTO students (admission_no, name, roll_no, class, section, stream, gender, dob, admission_date, phone, email, residential_address, permanent_address, fee_status, status)
VALUES ('NIS-2024-095-005', 'Ananya Iyer', '05', 'Class 10', 'Section A', 'Computer Applications & STEM', 'Female', '2011-09-04', '2024-06-21', '+91 98765 00005', 'ananya.iyer@example.com', 'Murugeshpalya, Bengaluru - 560017', 'Murugeshpalya, Bengaluru - 560017', 'Paid', 'Active')
ON CONFLICT (admission_no) DO NOTHING;

INSERT INTO students (admission_no, name, roll_no, class, section, stream, gender, dob, admission_date, phone, email, residential_address, permanent_address, fee_status, status)
VALUES ('NIS-2024-096-006', 'Kabir Singh', '06', 'Class 10', 'Section B', 'Physical Education (PE) & Hindi', 'Male', '2011-05-19', '2024-06-22', '+91 98765 00006', 'kabir.singh@example.com', 'Domlur, Bengaluru - 560071', 'Domlur, Bengaluru - 560071', 'Pending', 'Active')
ON CONFLICT (admission_no) DO NOTHING;

INSERT INTO students (admission_no, name, roll_no, class, section, stream, gender, dob, admission_date, phone, email, residential_address, permanent_address, fee_status, status)
VALUES ('NIS-2024-097-007', 'Sameer Kulkarni', '07', 'Class 10', 'Section B', 'Commerce & Computer Applications', 'Male', '2011-07-30', '2024-06-25', '+91 98765 00007', 'sameer.kulkarni@example.com', 'Sahakar Nagar, Bengaluru - 560092', 'Sahakar Nagar, Bengaluru - 560092', 'Paid', 'Active')
ON CONFLICT (admission_no) DO NOTHING;

INSERT INTO students (admission_no, name, roll_no, class, section, stream, gender, dob, admission_date, phone, email, residential_address, permanent_address, fee_status, status)
VALUES ('NIS-2024-098-008', 'Riya Patel', '08', 'Class 6', 'Section A', 'General Science & Arts', 'Female', '2015-02-10', '2024-06-15', '+91 98765 43212', 'riya.patel@student.nairee.edu', 'Indiranagar, Bengaluru - 560038', 'Indiranagar, Bengaluru - 560038', 'Paid', 'Active')
ON CONFLICT (admission_no) DO NOTHING;

INSERT INTO students (admission_no, name, roll_no, class, section, stream, gender, dob, admission_date, phone, email, residential_address, permanent_address, fee_status, status)
VALUES ('NIS-2024-099-009', 'Kavya Gupta', '09', 'Class 8', 'Section A', 'Foundational STEM & Sanskrit', 'Female', '2016-06-14', '2024-06-18', '+91 98765 43216', 'kavya.gupta@student.nairee.edu', 'Thanisandra, Bengaluru - 560077', 'Thanisandra, Bengaluru - 560077', 'Paid', 'Active')
ON CONFLICT (admission_no) DO NOTHING;

INSERT INTO students (admission_no, name, roll_no, class, section, stream, gender, dob, admission_date, phone, email, residential_address, permanent_address, fee_status, status)
VALUES ('NIS-2024-100-010', 'Vihaan Reddy', '10', 'Class 11', 'Section A', 'Pure Science & Artificial Intelligence', 'Male', '2010-01-20', '2024-06-10', '+91 98765 00010', 'vihaan.reddy@student.nairee.edu', 'Whitefield, Bengaluru - 560066', 'Whitefield, Bengaluru - 560066', 'Paid', 'Active')
ON CONFLICT (admission_no) DO NOTHING;

-- 10 GUARDIANS
INSERT INTO guardians (student_id, father_name, father_occupation, father_phone, mother_name, mother_occupation, mother_phone, primary_guardian_email)
VALUES ('NIS-2024-091-001', 'Rajesh Patel', 'Senior Software Director', '+91 98765 43212', 'Meera Patel', 'Professor of Economics', '+91 98765 43213', 'syalfreelance@gmail.com')
ON CONFLICT DO NOTHING;

INSERT INTO guardians (student_id, father_name, father_occupation, father_phone, mother_name, mother_occupation, mother_phone, primary_guardian_email)
VALUES ('NIS-2024-092-002', 'Suresh Sharma', 'Chartered Accountant', '+91 98765 43214', 'Sunita Sharma', 'Senior Bank Manager', '+91 98765 43215', 'aarav.sharma@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO guardians (student_id, father_name, father_occupation, father_phone, mother_name, mother_occupation, mother_phone, primary_guardian_email)
VALUES ('NIS-2024-093-003', 'Vikram Gupta', 'Civil Infrastructure Engineer', '+91 98765 43216', 'Pooja Gupta', 'Interior Architect', '+91 98765 43217', 'diya.gupta@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO guardians (student_id, father_name, father_occupation, father_phone, mother_name, mother_occupation, mother_phone, primary_guardian_email)
VALUES ('NIS-2024-094-004', 'Manish Mehta', 'Industrial Manufacturer', '+91 98765 43218', 'Nisha Mehta', 'Graphic Designer', '+91 98765 43219', 'rohan.mehta@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO guardians (student_id, father_name, father_occupation, father_phone, mother_name, mother_occupation, mother_phone, primary_guardian_email)
VALUES ('NIS-2024-095-005', 'Karthik Iyer', 'Aviation Consultant', '+91 98765 43220', 'Shalini Iyer', 'Carnatic Music Faculty', '+91 98765 43221', 'ananya.iyer@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO guardians (student_id, father_name, father_occupation, father_phone, mother_name, mother_occupation, mother_phone, primary_guardian_email)
VALUES ('NIS-2024-096-006', 'Harpreet Singh', 'Automobile Dealership Owner', '+91 98765 43222', 'Jaspreet Kaur', 'Nutritionist', '+91 98765 43223', 'kabir.singh@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO guardians (student_id, father_name, father_occupation, father_phone, mother_name, mother_occupation, mother_phone, primary_guardian_email)
VALUES ('NIS-2024-097-007', 'Nitin Kulkarni', 'Investment Banker', '+91 98765 43224', 'Anjali Kulkarni', 'Senior Corporate Lawyer', '+91 98765 43225', 'sameer.kulkarni@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO guardians (student_id, father_name, father_occupation, father_phone, mother_name, mother_occupation, mother_phone, primary_guardian_email)
VALUES ('NIS-2024-098-008', 'Rajesh Patel', 'Senior Software Director', '+91 98765 43212', 'Meera Patel', 'Professor of Economics', '+91 98765 43213', 'riya.patel@student.nairee.edu')
ON CONFLICT DO NOTHING;

INSERT INTO guardians (student_id, father_name, father_occupation, father_phone, mother_name, mother_occupation, mother_phone, primary_guardian_email)
VALUES ('NIS-2024-099-009', 'Vikram Gupta', 'Civil Infrastructure Engineer', '+91 98765 43216', 'Pooja Gupta', 'Interior Architect', '+91 98765 43217', 'kavya.gupta@student.nairee.edu')
ON CONFLICT DO NOTHING;

INSERT INTO guardians (student_id, father_name, father_occupation, father_phone, mother_name, mother_occupation, mother_phone, primary_guardian_email)
VALUES ('NIS-2024-100-010', 'Venkat Reddy', 'Fintech Founder', '+91 98765 43226', 'Lakshmi Reddy', 'Pediatric Surgeon', '+91 98765 43227', 'vihaan.reddy@student.nairee.edu')
ON CONFLICT DO NOTHING;

-- 10 ATTENDANCE RECORDS
INSERT INTO student_daily_attendance (student_id, section_id, attendance_date, status, marked_by_employee_id)
VALUES ('NIS-2024-091-001', '55555555-5555-5555-5555-555555555551', CURRENT_DATE, 'Present', 'NIS-2020-811-001')
ON CONFLICT (student_id, attendance_date) DO NOTHING;

INSERT INTO student_daily_attendance (student_id, section_id, attendance_date, status, marked_by_employee_id)
VALUES ('NIS-2024-092-002', '55555555-5555-5555-5555-555555555551', CURRENT_DATE, 'Present', 'NIS-2020-811-001')
ON CONFLICT (student_id, attendance_date) DO NOTHING;

INSERT INTO student_daily_attendance (student_id, section_id, attendance_date, status, marked_by_employee_id)
VALUES ('NIS-2024-093-003', '55555555-5555-5555-5555-555555555551', CURRENT_DATE, 'Absent', 'NIS-2020-811-001')
ON CONFLICT (student_id, attendance_date) DO NOTHING;

INSERT INTO student_daily_attendance (student_id, section_id, attendance_date, status, marked_by_employee_id)
VALUES ('NIS-2024-094-004', '55555555-5555-5555-5555-555555555551', CURRENT_DATE, 'Present', 'NIS-2020-811-001')
ON CONFLICT (student_id, attendance_date) DO NOTHING;

INSERT INTO student_daily_attendance (student_id, section_id, attendance_date, status, marked_by_employee_id)
VALUES ('NIS-2024-095-005', '55555555-5555-5555-5555-555555555551', CURRENT_DATE, 'Present', 'NIS-2020-811-001')
ON CONFLICT (student_id, attendance_date) DO NOTHING;

INSERT INTO student_daily_attendance (student_id, section_id, attendance_date, status, marked_by_employee_id)
VALUES ('NIS-2024-096-006', '55555555-5555-5555-5555-555555555552', CURRENT_DATE, 'Absent', 'NIS-2019-812-002')
ON CONFLICT (student_id, attendance_date) DO NOTHING;

INSERT INTO student_daily_attendance (student_id, section_id, attendance_date, status, marked_by_employee_id)
VALUES ('NIS-2024-097-007', '55555555-5555-5555-5555-555555555552', CURRENT_DATE, 'Present', 'NIS-2019-812-002')
ON CONFLICT (student_id, attendance_date) DO NOTHING;

INSERT INTO student_daily_attendance (student_id, section_id, attendance_date, status, marked_by_employee_id)
VALUES ('NIS-2024-098-008', '55555555-5555-5555-5555-555555555560', CURRENT_DATE, 'Present', 'NIS-2023-819-009')
ON CONFLICT (student_id, attendance_date) DO NOTHING;

INSERT INTO student_daily_attendance (student_id, section_id, attendance_date, status, marked_by_employee_id)
VALUES ('NIS-2024-099-009', '55555555-5555-5555-5555-555555555559', CURRENT_DATE, 'Present', 'NIS-2019-818-008')
ON CONFLICT (student_id, attendance_date) DO NOTHING;

INSERT INTO student_daily_attendance (student_id, section_id, attendance_date, status, marked_by_employee_id)
VALUES ('NIS-2024-100-010', '55555555-5555-5555-5555-555555555553', CURRENT_DATE, 'Present', 'NIS-2021-813-003')
ON CONFLICT (student_id, attendance_date) DO NOTHING;

-- 10 EXAM ASSESSMENTS & MARKS
INSERT INTO exam_terms (id, school_id, plan_code, assessment_name, academic_year_id, start_date, end_date)
VALUES ('88888888-8888-8888-8888-888888888881', '11111111-1111-1111-1111-111111111111', 'EXAM-T1-2026', 'Mid-Term Examination 2026', '22222222-2222-2222-2222-222222222222', '2026-09-10', '2026-09-25')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exam_schedules (id, exam_term_id, subject_id, class_id, exam_date, maximum_score, passing_score)
VALUES ('99999999-9999-9999-9999-999999999991', '88888888-8888-8888-8888-888888888881', 'MATH-101', '44444444-4444-4444-4444-444444444441', '2026-09-15', 100.0, 40.0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO exam_schedules (id, exam_term_id, subject_id, class_id, exam_date, maximum_score, passing_score)
VALUES ('99999999-9999-9999-9999-999999999992', '88888888-8888-8888-8888-888888888881', 'PHYS-102', '44444444-4444-4444-4444-444444444441', '2026-09-18', 100.0, 40.0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO exam_schedules (id, exam_term_id, subject_id, class_id, exam_date, maximum_score, passing_score)
VALUES ('99999999-9999-9999-9999-999999999993', '88888888-8888-8888-8888-888888888881', 'CS-104', '44444444-4444-4444-4444-444444444441', '2026-09-21', 100.0, 40.0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO exam_marks_entries (exam_schedule_id, student_id, score, maximum_score, grade, teacher_comment, graded_by_employee_id)
VALUES ('99999999-9999-9999-9999-999999999991', 'NIS-2024-091-001', 98.0, 100.0, 'A+', 'Outstanding performance in calculus & geometry', 'NIS-2020-811-001')
ON CONFLICT (exam_schedule_id, student_id) DO NOTHING;

INSERT INTO exam_marks_entries (exam_schedule_id, student_id, score, maximum_score, grade, teacher_comment, graded_by_employee_id)
VALUES ('99999999-9999-9999-9999-999999999991', 'NIS-2024-092-002', 88.0, 100.0, 'A', 'Strong analytical understanding', 'NIS-2020-811-001')
ON CONFLICT (exam_schedule_id, student_id) DO NOTHING;

INSERT INTO exam_marks_entries (exam_schedule_id, student_id, score, maximum_score, grade, teacher_comment, graded_by_employee_id)
VALUES ('99999999-9999-9999-9999-999999999991', 'NIS-2024-093-003', 94.0, 100.0, 'A+', 'Brilliant proofs and algebraic rigor', 'NIS-2020-811-001')
ON CONFLICT (exam_schedule_id, student_id) DO NOTHING;

INSERT INTO exam_marks_entries (exam_schedule_id, student_id, score, maximum_score, grade, teacher_comment, graded_by_employee_id)
VALUES ('99999999-9999-9999-9999-999999999991', 'NIS-2024-094-004', 84.0, 100.0, 'B+', 'Good conceptual clarity, needs speed improvement', 'NIS-2020-811-001')
ON CONFLICT (exam_schedule_id, student_id) DO NOTHING;

INSERT INTO exam_marks_entries (exam_schedule_id, student_id, score, maximum_score, grade, teacher_comment, graded_by_employee_id)
VALUES ('99999999-9999-9999-9999-999999999991', 'NIS-2024-095-005', 96.0, 100.0, 'A+', 'Consistently high distinction score', 'NIS-2020-811-001')
ON CONFLICT (exam_schedule_id, student_id) DO NOTHING;

INSERT INTO exam_marks_entries (exam_schedule_id, student_id, score, maximum_score, grade, teacher_comment, graded_by_employee_id)
VALUES ('99999999-9999-9999-9999-999999999991', 'NIS-2024-096-006', 78.0, 100.0, 'B', 'Solid effort, recommended remedial guidance', 'NIS-2020-811-001')
ON CONFLICT (exam_schedule_id, student_id) DO NOTHING;

INSERT INTO exam_marks_entries (exam_schedule_id, student_id, score, maximum_score, grade, teacher_comment, graded_by_employee_id)
VALUES ('99999999-9999-9999-9999-999999999991', 'NIS-2024-097-007', 91.0, 100.0, 'A', 'Very thorough calculations', 'NIS-2020-811-001')
ON CONFLICT (exam_schedule_id, student_id) DO NOTHING;

INSERT INTO exam_marks_entries (exam_schedule_id, student_id, score, maximum_score, grade, teacher_comment, graded_by_employee_id)
VALUES ('99999999-9999-9999-9999-999999999992', 'NIS-2024-091-001', 48.0, 50.0, 'A+', 'Superb lab simulation and data graphing', 'NIS-2019-812-002')
ON CONFLICT (exam_schedule_id, student_id) DO NOTHING;

INSERT INTO exam_marks_entries (exam_schedule_id, student_id, score, maximum_score, grade, teacher_comment, graded_by_employee_id)
VALUES ('99999999-9999-9999-9999-999999999993', 'NIS-2024-091-001', 99.0, 100.0, 'A+', 'Exceptional algorithm and unit test quality', 'NIS-2021-813-003')
ON CONFLICT (exam_schedule_id, student_id) DO NOTHING;

INSERT INTO exam_marks_entries (exam_schedule_id, student_id, score, maximum_score, grade, teacher_comment, graded_by_employee_id)
VALUES ('99999999-9999-9999-9999-999999999993', 'NIS-2024-100-010', 95.0, 100.0, 'A+', 'Superb problem solving speed and clean code', 'NIS-2021-813-003')
ON CONFLICT (exam_schedule_id, student_id) DO NOTHING;

-- 10 FEE INVOICES
INSERT INTO student_fee_invoices (invoice_code, student_id, title, fee_type, amount, due_date, status, payment_date, receipt_no)
VALUES ('INV-2026-001', 'NIS-2024-091-001', 'Term 1 Tuition & Lab Fee', 'Tuition Fee', 35000.00, '2026-10-15', 'Paid', '2026-09-28', 'REC-2026-9041')
ON CONFLICT (invoice_code) DO NOTHING;

INSERT INTO student_fee_invoices (invoice_code, student_id, title, fee_type, amount, due_date, status, payment_date, receipt_no)
VALUES ('INV-2026-002', 'NIS-2024-092-002', 'Term 1 Tuition & Lab Fee', 'Tuition Fee', 35000.00, '2026-10-15', 'Paid', '2026-09-29', 'REC-2026-9042')
ON CONFLICT (invoice_code) DO NOTHING;

INSERT INTO student_fee_invoices (invoice_code, student_id, title, fee_type, amount, due_date, status, payment_date, receipt_no)
VALUES ('INV-2026-003', 'NIS-2024-093-003', 'Term 1 Tuition & Lab Fee', 'Tuition Fee', 35000.00, '2026-10-15', 'Pending', NULL, NULL)
ON CONFLICT (invoice_code) DO NOTHING;

INSERT INTO student_fee_invoices (invoice_code, student_id, title, fee_type, amount, due_date, status, payment_date, receipt_no)
VALUES ('INV-2026-004', 'NIS-2024-094-004', 'Term 1 Tuition & Lab Fee', 'Tuition Fee', 35000.00, '2026-10-15', 'Paid', '2026-09-30', 'REC-2026-9043')
ON CONFLICT (invoice_code) DO NOTHING;

INSERT INTO student_fee_invoices (invoice_code, student_id, title, fee_type, amount, due_date, status, payment_date, receipt_no)
VALUES ('INV-2026-005', 'NIS-2024-095-005', 'Term 1 Tuition & Lab Fee', 'Tuition Fee', 35000.00, '2026-10-15', 'Paid', '2026-09-29', 'REC-2026-9044')
ON CONFLICT (invoice_code) DO NOTHING;

INSERT INTO student_fee_invoices (invoice_code, student_id, title, fee_type, amount, due_date, status, payment_date, receipt_no)
VALUES ('INV-2026-006', 'NIS-2024-096-006', 'Term 1 Tuition & Lab Fee', 'Tuition Fee', 35000.00, '2026-10-15', 'Pending', NULL, NULL)
ON CONFLICT (invoice_code) DO NOTHING;

INSERT INTO student_fee_invoices (invoice_code, student_id, title, fee_type, amount, due_date, status, payment_date, receipt_no)
VALUES ('INV-2026-007', 'NIS-2024-097-007', 'Term 1 Tuition & Lab Fee', 'Tuition Fee', 35000.00, '2026-10-15', 'Paid', '2026-09-27', 'REC-2026-9045')
ON CONFLICT (invoice_code) DO NOTHING;

INSERT INTO student_fee_invoices (invoice_code, student_id, title, fee_type, amount, due_date, status, payment_date, receipt_no)
VALUES ('INV-2026-008', 'NIS-2024-098-008', 'Term 1 Junior Primary Fee', 'Tuition Fee', 28000.00, '2026-10-15', 'Paid', '2026-09-28', 'REC-2026-9046')
ON CONFLICT (invoice_code) DO NOTHING;

INSERT INTO student_fee_invoices (invoice_code, student_id, title, fee_type, amount, due_date, status, payment_date, receipt_no)
VALUES ('INV-2026-009', 'NIS-2024-099-009', 'Term 1 Middle School Fee', 'Tuition Fee', 30000.00, '2026-10-15', 'Paid', '2026-09-28', 'REC-2026-9047')
ON CONFLICT (invoice_code) DO NOTHING;

INSERT INTO student_fee_invoices (invoice_code, student_id, title, fee_type, amount, due_date, status, payment_date, receipt_no)
VALUES ('INV-2026-010', 'NIS-2024-100-010', 'Term 1 Senior Science Fee', 'Tuition Fee', 42000.00, '2026-10-15', 'Paid', '2026-09-26', 'REC-2026-9048')
ON CONFLICT (invoice_code) DO NOTHING;

-- 10 TEACHER ATTENDANCE PUNCHES
INSERT INTO employee_attendance_punch (employee_id, punch_date, punch_in_time, punch_out_time, status, hours_worked)
VALUES ('NIS-2020-811-001', CURRENT_DATE, '07:48 AM', '04:15 PM', 'On Duty', 8.0)
ON CONFLICT (employee_id, punch_date) DO NOTHING;

INSERT INTO employee_attendance_punch (employee_id, punch_date, punch_in_time, punch_out_time, status, hours_worked)
VALUES ('NIS-2019-812-002', CURRENT_DATE, '07:55 AM', '04:20 PM', 'On Duty', 8.0)
ON CONFLICT (employee_id, punch_date) DO NOTHING;

INSERT INTO employee_attendance_punch (employee_id, punch_date, punch_in_time, punch_out_time, status, hours_worked)
VALUES ('NIS-2021-813-003', CURRENT_DATE, '08:02 AM', '04:10 PM', 'On Duty', 8.0)
ON CONFLICT (employee_id, punch_date) DO NOTHING;

INSERT INTO employee_attendance_punch (employee_id, punch_date, punch_in_time, punch_out_time, status, hours_worked)
VALUES ('NIS-2022-814-004', CURRENT_DATE, '08:12 AM', '04:25 PM', 'On Duty', 8.0)
ON CONFLICT (employee_id, punch_date) DO NOTHING;

INSERT INTO employee_attendance_punch (employee_id, punch_date, punch_in_time, punch_out_time, status, hours_worked)
VALUES ('NIS-2021-815-005', CURRENT_DATE, '08:05 AM', '04:00 PM', 'On Duty', 8.0)
ON CONFLICT (employee_id, punch_date) DO NOTHING;

INSERT INTO employee_attendance_punch (employee_id, punch_date, punch_in_time, punch_out_time, status, hours_worked)
VALUES ('NIS-2018-816-006', CURRENT_DATE, '07:50 AM', '04:15 PM', 'On Duty', 8.0)
ON CONFLICT (employee_id, punch_date) DO NOTHING;

INSERT INTO employee_attendance_punch (employee_id, punch_date, punch_in_time, punch_out_time, status, hours_worked)
VALUES ('NIS-2020-817-007', CURRENT_DATE, '08:10 AM', '04:10 PM', 'On Duty', 8.0)
ON CONFLICT (employee_id, punch_date) DO NOTHING;

INSERT INTO employee_attendance_punch (employee_id, punch_date, punch_in_time, punch_out_time, status, hours_worked)
VALUES ('NIS-2019-818-008', CURRENT_DATE, '08:15 AM', '04:15 PM', 'On Duty', 8.0)
ON CONFLICT (employee_id, punch_date) DO NOTHING;

INSERT INTO employee_attendance_punch (employee_id, punch_date, punch_in_time, punch_out_time, status, hours_worked)
VALUES ('NIS-2023-819-009', CURRENT_DATE, '07:30 AM', '04:00 PM', 'On Duty', 8.5)
ON CONFLICT (employee_id, punch_date) DO NOTHING;

INSERT INTO employee_attendance_punch (employee_id, punch_date, punch_in_time, punch_out_time, status, hours_worked)
VALUES ('NIS-2021-820-010', CURRENT_DATE, '08:00 AM', '04:15 PM', 'On Duty', 8.0)
ON CONFLICT (employee_id, punch_date) DO NOTHING;

-- 10 DAILY CLASS CONDUCTED LOGS
INSERT INTO daily_class_logs (teacher_id, section_id, subject_id, topic_covered, period_slot, log_date)
VALUES ('NIS-2020-811-001', '55555555-5555-5555-5555-555555555551', 'MATH-101', 'Quadratic Polynomial Factorization & Real Roots', '08:30 - 09:30', CURRENT_DATE);

INSERT INTO daily_class_logs (teacher_id, section_id, subject_id, topic_covered, period_slot, log_date)
VALUES ('NIS-2019-812-002', '55555555-5555-5555-5555-555555555551', 'PHYS-102', 'Electromagnetic Inductance & Faraday Law', '09:40 - 10:40', CURRENT_DATE);

INSERT INTO daily_class_logs (teacher_id, section_id, subject_id, topic_covered, period_slot, log_date)
VALUES ('NIS-2021-813-003', '55555555-5555-5555-5555-555555555551', 'CS-104', 'Neural Network Architecture & Backpropagation', '11:00 - 12:00', CURRENT_DATE);

INSERT INTO daily_class_logs (teacher_id, section_id, subject_id, topic_covered, period_slot, log_date)
VALUES ('NIS-2022-814-004', '55555555-5555-5555-5555-555555555551', 'ENG-105', 'Shakespearean Sonnets & Metaphorical Analysis', '12:00 - 01:00', CURRENT_DATE);

INSERT INTO daily_class_logs (teacher_id, section_id, subject_id, topic_covered, period_slot, log_date)
VALUES ('NIS-2021-815-005', '55555555-5555-5555-5555-555555555551', 'HIN-106', 'Samas & Sandhi Applications in Modern Prose', '01:30 - 02:30', CURRENT_DATE);

INSERT INTO daily_class_logs (teacher_id, section_id, subject_id, topic_covered, period_slot, log_date)
VALUES ('NIS-2018-816-006', '55555555-5555-5555-5555-555555555554', 'CHEM-103', 'Benzene Ring Resonance & Electrophilic Substitution', '08:30 - 09:30', CURRENT_DATE);

INSERT INTO daily_class_logs (teacher_id, section_id, subject_id, topic_covered, period_slot, log_date)
VALUES ('NIS-2020-817-007', '55555555-5555-5555-5555-555555555558', 'BIO-107', 'Mendelian Genetics & Monohybrid Cross Experiments', '09:40 - 10:40', CURRENT_DATE);

INSERT INTO daily_class_logs (teacher_id, section_id, subject_id, topic_covered, period_slot, log_date)
VALUES ('NIS-2019-818-008', '55555555-5555-5555-5555-555555555559', 'HIST-108', 'The French Revolution & Drafting of Human Rights', '11:00 - 12:00', CURRENT_DATE);

INSERT INTO daily_class_logs (teacher_id, section_id, subject_id, topic_covered, period_slot, log_date)
VALUES ('NIS-2023-819-009', '55555555-5555-5555-5555-555555555552', 'PE-109', 'Track Athletics Sprint Mechanics & High Jump', '02:30 - 03:30', CURRENT_DATE);

INSERT INTO daily_class_logs (teacher_id, section_id, subject_id, topic_covered, period_slot, log_date)
VALUES ('NIS-2021-820-010', '55555555-5555-5555-5555-555555555556', 'ECON-110', 'RBI Monetary Policies, Repo Rates & Inflation Control', '01:30 - 02:30', CURRENT_DATE);


