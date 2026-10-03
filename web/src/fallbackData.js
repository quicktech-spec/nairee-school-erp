// Fallback in-memory database store for static GitHub Pages / Netlify hosting
export const INITIAL_DB_STORE = {
  tabStudent: {
    columns: [
      { name: 'name', type: 'VARCHAR(255)', pk: 1 },
      { name: 'first_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'last_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'student_email_id', type: 'VARCHAR(255)', pk: 0 },
      { name: 'student_mobile_number', type: 'VARCHAR(50)', pk: 0 },
      { name: 'batch_id', type: 'VARCHAR(255)', pk: 0 },
      { name: 'roll_number', type: 'VARCHAR(50)', pk: 0 },
      { name: 'attendance_percentage', type: 'FLOAT', pk: 0 },
      { name: 'fee_status', type: 'VARCHAR(50)', pk: 0 }
    ],
    rows: [
      { name: 'EDU-STU-2026-00001', first_name: 'Nairee', last_name: 'Patel', student_email_id: 'syalfreelance@gmail.com', student_mobile_number: '+91 98765 00001', batch_id: 'BATCH-10A-2026', roll_number: '10A-01', attendance_percentage: 97.5, fee_status: 'Paid' },
      { name: 'EDU-STU-2026-00002', first_name: 'Aarav', last_name: 'Sharma', student_email_id: 'aarav.sharma@example.com', student_mobile_number: '+91 98765 00002', batch_id: 'BATCH-10A-2026', roll_number: '10A-02', attendance_percentage: 94.0, fee_status: 'Paid' },
      { name: 'EDU-STU-2026-00003', first_name: 'Diya', last_name: 'Gupta', student_email_id: 'diya.gupta@example.com', student_mobile_number: '+91 98765 00003', batch_id: 'BATCH-10A-2026', roll_number: '10A-03', attendance_percentage: 98.2, fee_status: 'Pending' },
      { name: 'EDU-STU-2026-00004', first_name: 'Rohan', last_name: 'Mehta', student_email_id: 'rohan.mehta@example.com', student_mobile_number: '+91 98765 00004', batch_id: 'BATCH-10A-2026', roll_number: '10A-04', attendance_percentage: 91.5, fee_status: 'Paid' },
      { name: 'EDU-STU-2026-00005', first_name: 'Ananya', last_name: 'Iyer', student_email_id: 'ananya.iyer@example.com', student_mobile_number: '+91 98765 00005', batch_id: 'BATCH-10A-2026', roll_number: '10A-05', attendance_percentage: 99.0, fee_status: 'Paid' },
      { name: 'EDU-STU-2026-00006', first_name: 'Kabir', last_name: 'Singh', student_email_id: 'kabir.singh@example.com', student_mobile_number: '+91 98765 00006', batch_id: 'BATCH-10B-2026', roll_number: '10B-01', attendance_percentage: 93.4, fee_status: 'Pending' }
    ]
  },
  tabCourse: {
    columns: [
      { name: 'name', type: 'VARCHAR(255)', pk: 1 },
      { name: 'course_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'course_code', type: 'VARCHAR(50)', pk: 0 },
      { name: 'department', type: 'VARCHAR(255)', pk: 0 },
      { name: 'default_instructor', type: 'VARCHAR(255)', pk: 0 }
    ],
    rows: [
      { name: 'CRS-MATH-10', course_name: 'Advanced Mathematics', course_code: 'MATH-101', department: 'Mathematics & Science', default_instructor: 'Prof. Sarah Jenkins' },
      { name: 'CRS-PHYS-10', course_name: 'Physics & Lab Dynamics', course_code: 'PHYS-102', department: 'Physics & STEM', default_instructor: 'Dr. Marcus Vance' },
      { name: 'CRS-CHEM-10', course_name: 'Organic & Applied Chemistry', course_code: 'CHEM-103', department: 'Chemistry & Bio', default_instructor: 'Dr. Marcus Vance' },
      { name: 'CRS-COMP-10', course_name: 'Computer Science & AI Basics', course_code: 'CS-104', department: 'Computer Science', default_instructor: 'Prof. Sarah Jenkins' }
    ]
  },
  tabStudentBatch: {
    columns: [
      { name: 'name', type: 'VARCHAR(255)', pk: 1 },
      { name: 'batch_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'grade_level', type: 'VARCHAR(50)', pk: 0 },
      { name: 'section', type: 'VARCHAR(10)', pk: 0 },
      { name: 'class_teacher', type: 'VARCHAR(255)', pk: 0 },
      { name: 'room_no', type: 'VARCHAR(50)', pk: 0 }
    ],
    rows: [
      { name: 'BATCH-10A-2026', batch_name: 'Grade 10 - Section A', grade_level: 'Grade 10', section: 'A', class_teacher: 'Prof. Sarah Jenkins', room_no: 'Room 204' },
      { name: 'BATCH-10B-2026', batch_name: 'Grade 10 - Section B', grade_level: 'Grade 10', section: 'B', class_teacher: 'Dr. Marcus Vance', room_no: 'Room 205' }
    ]
  },
  tabTeacher: {
    columns: [
      { name: 'teacher_id', type: 'VARCHAR(255)', pk: 1 },
      { name: 'full_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'department', type: 'VARCHAR(255)', pk: 0 },
      { name: 'designation', type: 'VARCHAR(255)', pk: 0 },
      { name: 'email', type: 'VARCHAR(255)', pk: 0 },
      { name: 'phone', type: 'VARCHAR(50)', pk: 0 },
      { name: 'assigned_classes', type: 'VARCHAR(255)', pk: 0 },
      { name: 'monthly_salary', type: 'DECIMAL(10,2)', pk: 0 },
      { name: 'status', type: 'VARCHAR(50)', pk: 0 }
    ],
    rows: [
      { teacher_id: 'TEA-001', full_name: 'Prof. Sarah Jenkins', department: 'Mathematics & Science', designation: 'Senior Faculty Lead', email: 'sjenkins@nairee.edu', phone: '+1 (555) 234-5671', assigned_classes: 'Grade 10-A, Grade 11-A', monthly_salary: 5600, status: 'Active' },
      { teacher_id: 'TEA-002', full_name: 'Dr. Marcus Vance', department: 'Physics & STEM', designation: 'Head of STEM Academics', email: 'admin@nairee.edu', phone: '+1 (555) 234-5672', assigned_classes: 'Grade 10-B, Grade 12-A', monthly_salary: 6250, status: 'Active' },
      { teacher_id: 'TEA-003', full_name: 'Mr. Robert Chen', department: 'Computer Science', designation: 'AI Systems Instructor', email: 'rchen@nairee.edu', phone: '+1 (555) 234-5673', assigned_classes: 'Grade 10-A, Grade 10-B', monthly_salary: 5300, status: 'Active' },
      { teacher_id: 'TEA-004', full_name: 'Ms. Clara Oswald', department: 'Humanities & English', designation: 'Literature Lead', email: 'coswald@nairee.edu', phone: '+1 (555) 234-5674', assigned_classes: 'Grade 10-A, Grade 11-A', monthly_salary: 5000, status: 'Active' }
    ]
  },
  tabFaculty: {
    columns: [
      { name: 'name', type: 'VARCHAR(255)', pk: 1 },
      { name: 'full_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'department', type: 'VARCHAR(255)', pk: 0 },
      { name: 'email', type: 'VARCHAR(255)', pk: 0 },
      { name: 'mobile_number', type: 'VARCHAR(50)', pk: 0 },
      { name: 'workload_hours', type: 'INT', pk: 0 }
    ],
    rows: [
      { name: 'FAC-001', full_name: 'Prof. Sarah Jenkins', department: 'Mathematics & Science', email: 'sjenkins@nairee.edu', mobile_number: '+91 98765 43211', workload_hours: 24 },
      { name: 'FAC-002', full_name: 'Dr. Marcus Vance', department: 'Physics & STEM', email: 'admin@nairee.edu', mobile_number: '+91 98765 43210', workload_hours: 18 },
      { name: 'FAC-003', full_name: 'Mr. Robert Chen', department: 'Computer Science', email: 'rchen@nairee.edu', mobile_number: '+91 98765 43212', workload_hours: 20 },
      { name: 'FAC-004', full_name: 'Ms. Clara Oswald', department: 'Humanities & English', email: 'coswald@nairee.edu', mobile_number: '+91 98765 43213', workload_hours: 18 }
    ]
  },
  tabFeeSchedule: {
    columns: [
      { name: 'name', type: 'VARCHAR(255)', pk: 1 },
      { name: 'student_id', type: 'VARCHAR(255)', pk: 0 },
      { name: 'fee_title', type: 'VARCHAR(255)', pk: 0 },
      { name: 'amount', type: 'DECIMAL(10,2)', pk: 0 },
      { name: 'due_date', type: 'DATE', pk: 0 },
      { name: 'status', type: 'VARCHAR(50)', pk: 0 }
    ],
    rows: [
      { name: 'FEE-2026-001', student_id: 'EDU-STU-2026-00001', fee_title: 'Term 1 Tuition Fee', amount: 35000, due_date: '2026-10-15', status: 'Paid' },
      { name: 'FEE-2026-002', student_id: 'EDU-STU-2026-00001', fee_title: 'Science Lab & STEM Materials Fee', amount: 8500, due_date: '2026-10-25', status: 'Pending' }
    ]
  },
  tabStudentAttendance: {
    columns: [
      { name: 'name', type: 'VARCHAR(255)', pk: 1 },
      { name: 'student_id', type: 'VARCHAR(255)', pk: 0 },
      { name: 'attendance_date', type: 'DATE', pk: 0 },
      { name: 'status', type: 'VARCHAR(50)', pk: 0 },
      { name: 'batch_id', type: 'VARCHAR(255)', pk: 0 }
    ],
    rows: [
      { name: 'ATT-001', student_id: 'EDU-STU-2026-00001', attendance_date: '2026-10-01', status: 'Present', batch_id: 'BATCH-10A-2026' },
      { name: 'ATT-002', student_id: 'EDU-STU-2026-00002', attendance_date: '2026-10-01', status: 'Present', batch_id: 'BATCH-10A-2026' },
      { name: 'ATT-003', student_id: 'EDU-STU-2026-00003', attendance_date: '2026-10-01', status: 'Absent', batch_id: 'BATCH-10A-2026' }
    ]
  },
  tabParent: {
    columns: [
      { name: 'parent_id', type: 'VARCHAR(255)', pk: 1 },
      { name: 'full_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'phone', type: 'VARCHAR(50)', pk: 0 },
      { name: 'email', type: 'VARCHAR(255)', pk: 0 },
      { name: 'child_id', type: 'VARCHAR(255)', pk: 0 },
      { name: 'relationship', type: 'VARCHAR(50)', pk: 0 }
    ],
    rows: [
      { parent_id: 'PAR-001', full_name: 'Rajesh Patel', phone: '+91 98765 43212', email: 'rpatel@family.com', child_id: 'EDU-STU-2026-00001', relationship: 'Father' },
      { parent_id: 'PAR-002', full_name: 'Sunita Sharma', phone: '+91 98765 43215', email: 'sunita.sharma@family.com', child_id: 'EDU-STU-2026-00002', relationship: 'Mother' },
      { parent_id: 'PAR-003', full_name: 'Vikram Gupta', phone: '+91 98765 43216', email: 'vikram.gupta@family.com', child_id: 'EDU-STU-2026-00003', relationship: 'Father' }
    ]
  },
  tabSubject: {
    columns: [
      { name: 'subject_id', type: 'VARCHAR(255)', pk: 1 },
      { name: 'subject_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'subject_code', type: 'VARCHAR(50)', pk: 0 },
      { name: 'teacher_id', type: 'VARCHAR(255)', pk: 0 },
      { name: 'credit_hours', type: 'INT', pk: 0 },
      { name: 'department', type: 'VARCHAR(255)', pk: 0 }
    ],
    rows: [
      { subject_id: 'SUB-001', subject_name: 'Advanced Mathematics', subject_code: 'MATH-101', teacher_id: 'TEA-001', credit_hours: 4, department: 'Mathematics & Science' },
      { subject_id: 'SUB-002', subject_name: 'Physics & Dynamics', subject_code: 'PHYS-102', teacher_id: 'TEA-002', credit_hours: 4, department: 'Physics & STEM' },
      { subject_id: 'SUB-003', subject_name: 'Computer Science & AI', subject_code: 'CS-104', teacher_id: 'TEA-003', credit_hours: 3, department: 'Computer Science' },
      { subject_id: 'SUB-004', subject_name: 'English & World Literature', subject_code: 'ENG-105', teacher_id: 'TEA-004', credit_hours: 3, department: 'Humanities & English' }
    ]
  },
  tabClass: {
    columns: [
      { name: 'batch_id', type: 'VARCHAR(255)', pk: 1 },
      { name: 'batch_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'grade_level', type: 'VARCHAR(50)', pk: 0 },
      { name: 'section', type: 'VARCHAR(10)', pk: 0 },
      { name: 'class_teacher_id', type: 'VARCHAR(255)', pk: 0 },
      { name: 'room_no', type: 'VARCHAR(50)', pk: 0 },
      { name: 'capacity', type: 'INT', pk: 0 }
    ],
    rows: [
      { batch_id: 'CLS-10A', batch_name: 'Class 10-A', grade_level: 'Grade 10', section: 'A', class_teacher_id: 'TEA-001', room_no: 'Room 204', capacity: 35 },
      { batch_id: 'CLS-10B', batch_name: 'Class 10-B', grade_level: 'Grade 10', section: 'B', class_teacher_id: 'TEA-002', room_no: 'Room 205', capacity: 35 },
      { batch_id: 'CLS-11A', batch_name: 'Class 11-A', grade_level: 'Grade 11', section: 'A', class_teacher_id: 'TEA-003', room_no: 'Room 301', capacity: 30 }
    ]
  },
  tabFeeRecord: {
    columns: [
      { name: 'fee_id', type: 'VARCHAR(255)', pk: 1 },
      { name: 'student_id', type: 'VARCHAR(255)', pk: 0 },
      { name: 'fee_title', type: 'VARCHAR(255)', pk: 0 },
      { name: 'amount', type: 'DECIMAL(10,2)', pk: 0 },
      { name: 'paid_amount', type: 'DECIMAL(10,2)', pk: 0 },
      { name: 'balance_due', type: 'DECIMAL(10,2)', pk: 0 },
      { name: 'due_date', type: 'DATE', pk: 0 },
      { name: 'status', type: 'VARCHAR(50)', pk: 0 }
    ],
    rows: [
      { fee_id: 'FEE-001', student_id: 'EDU-STU-2026-00001', fee_title: 'Term 1 Tuition Fee', amount: 35000, paid_amount: 35000, balance_due: 0, due_date: '2026-10-15', status: 'Paid' },
      { fee_id: 'FEE-002', student_id: 'EDU-STU-2026-00001', fee_title: 'Science Lab & STEM Fee', amount: 8500, paid_amount: 0, balance_due: 8500, due_date: '2026-10-25', status: 'Pending' },
      { fee_id: 'FEE-003', student_id: 'EDU-STU-2026-00003', fee_title: 'Annual Activity & Sports Fee', amount: 12500, paid_amount: 0, balance_due: 12500, due_date: '2026-10-30', status: 'Pending' }
    ]
  },
  tabHomework: {
    columns: [
      { name: 'homework_id', type: 'VARCHAR(255)', pk: 1 },
      { name: 'batch_id', type: 'VARCHAR(255)', pk: 0 },
      { name: 'subject_id', type: 'VARCHAR(255)', pk: 0 },
      { name: 'title', type: 'VARCHAR(255)', pk: 0 },
      { name: 'instructions', type: 'TEXT', pk: 0 },
      { name: 'due_date', type: 'VARCHAR(50)', pk: 0 },
      { name: 'assigned_by', type: 'VARCHAR(255)', pk: 0 }
    ],
    rows: [
      { homework_id: 'HW-001', batch_id: 'CLS-10A', subject_id: 'SUB-001', title: 'Calculus Trigonometric Integrals Exercise 4.2', instructions: 'Solve problems 1 through 15 with step-by-step proofs.', due_date: 'Tomorrow, 5:00 PM', assigned_by: 'TEA-001' },
      { homework_id: 'HW-002', batch_id: 'CLS-10A', subject_id: 'SUB-002', title: 'Newtonian Dynamics Mechanics Simulation', instructions: 'Complete virtual lab friction parameters chart.', due_date: 'Friday, 11:59 PM', assigned_by: 'TEA-002' }
    ]
  },
  tabAdmin: {
    columns: [
      { name: 'admin_id', type: 'VARCHAR(255)', pk: 1 },
      { name: 'full_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'email', type: 'VARCHAR(255)', pk: 0 },
      { name: 'role', type: 'VARCHAR(50)', pk: 0 },
      { name: 'designation', type: 'VARCHAR(100)', pk: 0 },
      { name: 'status', type: 'VARCHAR(50)', pk: 0 }
    ],
    rows: [
      { admin_id: 'ADM-001', full_name: 'Dr. Marcus Vance', email: 'admin@nairee.edu', role: 'Principal', designation: 'Executive Principal & Academic Director', status: 'Active' },
      { admin_id: 'ADM-002', full_name: 'Anita Verma', email: 'accounts@nairee.edu', role: 'Accountant', designation: 'Chief Financial Officer & Bursar', status: 'Active' }
    ]
  }
};

// Fallback data for static deployments (GitHub Pages, Netlify standalone)
export const FALLBACK_DATA = {
  users: [
    { id: 'admin_1', username: 'admin', full_name: 'Dr. Marcus Vance', role: 'admin', email: 'admin@nairee.edu', status: 'Active', department: 'Executive Board', phone: '+91 98765 43210' },
    { id: 'teacher_1', username: 'teacher_jenkins', full_name: 'Prof. Sarah Jenkins', role: 'teacher', email: 'sjenkins@nairee.edu', status: 'Active', department: 'Mathematics & Science', phone: '+91 98765 43211' },
    { id: 'EDU-STU-2026-00001', username: 'nairee', full_name: 'Nairee Patel', role: 'student', email: 'syalfreelance@gmail.com', status: 'Active', batch_name: 'Grade 10 - Section A', roll_number: '10A-01' },
    { id: 'parent_1', username: 'parent_patel', full_name: 'Rajesh Patel', role: 'parent', email: 'rpatel@family.com', status: 'Active', phone: '+91 98765 43212' }
  ],
  stats: {
    total_students: 840,
    total_teachers: 48,
    attendance_rate: '96.4%',
    fee_collection_rate: '94.2%',
    active_courses: 14,
    pending_homework: 3
  },
  students: [
    { id: 'EDU-STU-2026-00001', full_name: 'Nairee Patel', roll_number: '10A-01', batch_id: 'BATCH-10A-2026', batch_name: 'Grade 10 - Section A', email: 'syalfreelance@gmail.com', phone: '+91 98765 00001', attendance_percentage: 97.5, fee_status: 'Paid', balance_due: 0 },
    { id: 'EDU-STU-2026-00002', full_name: 'Aarav Sharma', roll_number: '10A-02', batch_id: 'BATCH-10A-2026', batch_name: 'Grade 10 - Section A', email: 'aarav.sharma@example.com', phone: '+91 98765 00002', attendance_percentage: 94.0, fee_status: 'Paid', balance_due: 0 },
    { id: 'EDU-STU-2026-00003', full_name: 'Diya Gupta', roll_number: '10A-03', batch_id: 'BATCH-10A-2026', batch_name: 'Grade 10 - Section A', email: 'diya.gupta@example.com', phone: '+91 98765 00003', attendance_percentage: 98.2, fee_status: 'Pending', balance_due: 12500 },
    { id: 'EDU-STU-2026-00004', full_name: 'Rohan Mehta', roll_number: '10A-04', batch_id: 'BATCH-10A-2026', batch_name: 'Grade 10 - Section A', email: 'rohan.mehta@example.com', phone: '+91 98765 00004', attendance_percentage: 91.5, fee_status: 'Paid', balance_due: 0 },
    { id: 'EDU-STU-2026-00005', full_name: 'Ananya Iyer', roll_number: '10A-05', batch_id: 'BATCH-10A-2026', batch_name: 'Grade 10 - Section A', email: 'ananya.iyer@example.com', phone: '+91 98765 00005', attendance_percentage: 99.0, fee_status: 'Paid', balance_due: 0 }
  ],
  batches: [
    { id: 'BATCH-10A-2026', name: 'Grade 10 - Section A', grade: '10', section: 'A', room: 'Room 204' },
    { id: 'BATCH-10B-2026', name: 'Grade 10 - Section B', grade: '10', section: 'B', room: 'Room 205' }
  ],
  courses: [
    { id: 'CRS-MATH-10', name: 'Advanced Mathematics', code: 'MATH-101', instructor: 'Prof. Sarah Jenkins' },
    { id: 'CRS-PHYS-10', name: 'Physics & Lab Dynamics', code: 'PHYS-102', instructor: 'Dr. Marcus Vance' },
    { id: 'CRS-CHEM-10', name: 'Organic & Applied Chemistry', code: 'CHEM-103', instructor: 'Dr. Marcus Vance' }
  ],
  faculty: [
    { id: 'FAC-001', name: 'Prof. Sarah Jenkins', department: 'Mathematics & Science', email: 'sjenkins@nairee.edu', phone: '+91 98765 43211', workload_hours: 24 },
    { id: 'FAC-002', name: 'Dr. Marcus Vance', department: 'Physics & STEM', email: 'admin@nairee.edu', phone: '+91 98765 43210', workload_hours: 18 }
  ],
  schedule: [
    { id: 'SCH-01', day: 'Monday', time_slot: '08:30 AM - 09:30 AM', course_name: 'Advanced Mathematics', instructor: 'Prof. Sarah Jenkins', room: 'Room 204' },
    { id: 'SCH-02', day: 'Monday', time_slot: '09:40 AM - 10:40 AM', course_name: 'Physics & Lab Dynamics', instructor: 'Dr. Marcus Vance', room: 'Lab 2' },
    { id: 'SCH-03', day: 'Tuesday', time_slot: '08:30 AM - 09:30 AM', course_name: 'Organic & Applied Chemistry', instructor: 'Dr. Marcus Vance', room: 'Lab 1' }
  ],
  attendance: [
    { id: 'ATT-001', student_id: 'EDU-STU-2026-00001', student_name: 'Nairee Patel', date: '2026-10-01', status: 'Present' },
    { id: 'ATT-002', student_id: 'EDU-STU-2026-00002', student_name: 'Aarav Sharma', date: '2026-10-01', status: 'Present' },
    { id: 'ATT-003', student_id: 'EDU-STU-2026-00003', student_name: 'Diya Gupta', date: '2026-10-01', status: 'Absent' }
  ],
  fees: [
    { id: 'FEE-2026-001', title: 'Term 1 Tuition Fee', amount: 35000, due_date: '2026-10-15', status: 'Paid', payment_date: '2026-09-28', student_name: 'Nairee Patel' },
    { id: 'FEE-2026-002', title: 'Science Lab & STEM Materials Fee', amount: 8500, due_date: '2026-10-25', status: 'Pending', student_name: 'Nairee Patel' }
  ],
  syllabus: [
    { id: 'SYL-01', subject: 'Mathematics', topic: 'Quadratic Equations & Polynomials', total_topics: 10, completed_topics: 8, status: 'In Progress' },
    { id: 'SYL-02', subject: 'Physics', topic: 'Electromagnetism & Waves', total_topics: 8, completed_topics: 6, status: 'In Progress' }
  ],
  homework: [
    { id: 'HW-01', title: 'Calculus Trigonometric Integrals Exercise 4.2', subject: 'Mathematics', due_date: 'Tomorrow, 5:00 PM', status: 'Assigned', instructions: 'Solve problems 1 through 15 with step-by-step proofs.' },
    { id: 'HW-02', title: 'Newtonian Dynamics Mechanics Simulation', subject: 'Physics', due_date: 'Friday, 11:59 PM', status: 'Submitted', instructions: 'Complete virtual lab friction parameters chart.' }
  ],
  study_materials: [
    { id: 'MAT-01', title: 'Mathematics Formula Cheat-Sheet 2026', subject: 'Mathematics', type: 'PDF Document', size: '2.4 MB' },
    { id: 'MAT-02', title: 'Electromagnetism Key Notes & Lab Manual', subject: 'Physics', type: 'PDF Document', size: '4.1 MB' }
  ],
  transport: {
    route_name: 'Route 14 — Green Valley to Nairee Campus',
    bus_number: 'DL-01-NA-2026',
    driver_name: 'Rameshwar Singh',
    driver_phone: '+91 98765 11223',
    pickup_time: '07:40 AM',
    drop_time: '03:45 PM',
    status: 'On Route — Approaching Stop 3'
  },
  announcements: [
    { id: 'ANN-01', title: 'Due to heavy rainfall next 2 days (October 2 & 3) holidays', category: 'Weather Circular', created_at: '2 hours ago', sender: 'Principal Office' },
    { id: 'ANN-02', title: 'Mid-term examination schedule released for Grades 9 through 12', category: 'Academics', created_at: '5 hours ago', sender: 'Academic Cell' }
  ],
  messages: [
    { id: 'MSG-01', sender: 'Prof. Sarah Jenkins', content: 'Great effort on the recent Mathematics assignment test!', timestamp: '10:30 AM' }
  ]
};

export const FALLBACK_STUDENTS = [
  { name: 'EDU-STU-2026-00001', student_name: 'Nairee Patel', roll_no: '101', student_batch: 'Grade 10-A', guardian_name: 'Mr. Rajesh Patel', guardian_mobile: '+1 (555) 901-2234', attendancePct: 98, avgGrade: 96, feeDues: 0 },
  { name: 'EDU-STU-2026-00002', student_name: 'Aarav Sharma', roll_no: '102', student_batch: 'Grade 10-A', guardian_name: 'Mrs. Sunita Sharma', guardian_mobile: '+1 (555) 901-2235', attendancePct: 94, avgGrade: 88, feeDues: 0 },
  { name: 'EDU-STU-2026-00003', student_name: 'Diya Gupta', roll_no: '103', student_batch: 'Grade 10-A', guardian_name: 'Mr. Vikram Gupta', guardian_mobile: '+1 (555) 901-2236', attendancePct: 99, avgGrade: 92, feeDues: 450 },
  { name: 'EDU-STU-2026-00004', student_name: 'Rohan Mehta', roll_no: '104', student_batch: 'Grade 10-A', guardian_name: 'Mr. Sanjay Mehta', guardian_mobile: '+1 (555) 901-2237', attendancePct: 91, avgGrade: 84, feeDues: 0 },
  { name: 'EDU-STU-2026-00005', student_name: 'Ananya Iyer', roll_no: '105', student_batch: 'Grade 10-A', guardian_name: 'Mrs. Meenakshi Iyer', guardian_mobile: '+1 (555) 901-2238', attendancePct: 97, avgGrade: 95, feeDues: 0 },
  { name: 'EDU-STU-2026-00006', student_name: 'Kabir Singh', roll_no: '106', student_batch: 'Grade 10-B', guardian_name: 'Mr. Jaswinder Singh', guardian_mobile: '+1 (555) 901-2239', attendancePct: 89, avgGrade: 78, feeDues: 800 }
];

export const FALLBACK_FACULTY = [
  { name: 'FAC-001', full_name: 'Prof. Sarah Jenkins', department: 'Mathematics & Science', designation: 'Senior Faculty Lead', email: 'sjenkins@nairee.edu', salary: 68000 },
  { name: 'FAC-002', full_name: 'Dr. Marcus Vance', department: 'Physics & STEM', designation: 'Head of STEM Academics', email: 'admin@nairee.edu', salary: 75000 },
  { name: 'FAC-003', full_name: 'Mr. Robert Chen', department: 'Computer Science', designation: 'AI Systems Instructor', email: 'rchen@nairee.edu', salary: 64000 },
  { name: 'FAC-004', full_name: 'Ms. Clara Oswald', department: 'Humanities & English', designation: 'Literature Lead', email: 'coswald@nairee.edu', salary: 60000 }
];

export const FALLBACK_BATCHES = [
  { name: 'BATCH-10A-2026', batch_name: 'Grade 10 - Section A', grade_level: 'Grade 10', section: 'A', class_teacher: 'Prof. Sarah Jenkins', room_no: 'Room 204' },
  { name: 'BATCH-10B-2026', batch_name: 'Grade 10 - Section B', grade_level: 'Grade 10', section: 'B', class_teacher: 'Dr. Marcus Vance', room_no: 'Room 205' },
  { name: 'BATCH-11A-2026', batch_name: 'Grade 11 - Section A', grade_level: 'Grade 11', section: 'A', class_teacher: 'Mr. Robert Chen', room_no: 'Room 301' }
];
