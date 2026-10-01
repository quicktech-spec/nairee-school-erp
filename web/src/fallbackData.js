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
    { id: 'EDU-STU-2026-00003', full_name: 'Diya Gupta', roll_number: '10A-03', batch_id: 'BATCH-10A-2026', batch_name: 'Grade 10 - Section A', email: 'diya.gupta@example.com', phone: '+91 98765 00003', attendance_percentage: 98.2, fee_status: 'Pending', balance_due: 12500 }
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
