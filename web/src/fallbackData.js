// Primary in-memory database store with clean relational table names
export const INITIAL_DB_STORE = {
  'Student List': {
    columns: [
      { name: 'name', type: 'VARCHAR(255)', pk: 1 },
      { name: 'phone', type: 'VARCHAR(50)', pk: 0 },
      { name: 'class_batch', type: 'VARCHAR(50) [Class & Section]', pk: 0 },
      { name: 'fee_status', type: 'VARCHAR(50)', pk: 0 }
    ],
    rows: [
      { 
        student_id: 'STU-001', 
        name: 'Devon Patel', 
        roll_no: '101', 
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        dob: '2011-04-12',
        religion: 'Hindu',
        nationality: 'Indian',
        blood_group: 'O+',
        class_batch: 'Class 10 - Section A',
        stream: 'Computer Applications & Advanced Math',
        aadhaar_no: '9876 5432 1091',
        gender: 'Male',
        admission_date: '2024-06-15',
        residential_address: 'Flat 402, Green Meadows Residency, 14th Main, Indiranagar, Bengaluru - 560038',
        permanent_address: 'Flat 402, Green Meadows Residency, 14th Main, Indiranagar, Bengaluru - 560038',
        phone: '+1 555 789 0123',
        email: 'devon.patel@nairee.edu',
        fee_status: 'Paid',
        father_name: 'Rajesh Patel',
        father_occupation: 'Senior Software Director',
        father_phone: '+91 98765 43212',
        father_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        father_address: 'Flat 402, Green Meadows Residency, 14th Main, Indiranagar, Bengaluru - 560038',
        mother_name: 'Meera Patel',
        mother_occupation: 'Professor of Economics',
        mother_phone: '+91 98765 43213',
        mother_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
        mother_address: 'Flat 402, Green Meadows Residency, 14th Main, Indiranagar, Bengaluru - 560038',
        has_previous_school: true,
        prev_school_name: 'Delhi Public School, East Campus',
        prev_school_board: 'CBSE',
        prev_studied_class: 'Class 9',
        has_siblings: true,
        sibling_id: 'STU-008',
        sibling_name: 'Riya Patel',
        sibling_class: 'Class 6 - Section A',
        sibling_roll_no: '106'
      },
      { 
        student_id: 'STU-002', 
        name: 'Aarav Sharma', 
        roll_no: '102', 
        photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        dob: '2011-08-25',
        religion: 'Hindu',
        nationality: 'Indian',
        blood_group: 'B+',
        class_batch: 'Class 10 - Section A',
        stream: 'Hindi & Applied Science',
        aadhaar_no: '9876 5432 1092',
        gender: 'Male',
        admission_date: '2024-06-16',
        residential_address: 'House #22, Palm Grove Enclave, Koramangala 4th Block, Bengaluru - 560034',
        permanent_address: 'House #22, Palm Grove Enclave, Koramangala 4th Block, Bengaluru - 560034',
        phone: '+91 98765 00002',
        email: 'aarav.sharma@example.com',
        fee_status: 'Paid',
        father_name: 'Suresh Sharma',
        father_occupation: 'Chartered Accountant',
        father_phone: '+91 98765 43214',
        father_photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        father_address: 'House #22, Palm Grove Enclave, Koramangala 4th Block, Bengaluru - 560034',
        mother_name: 'Sunita Sharma',
        mother_occupation: 'Senior Bank Manager',
        mother_phone: '+91 98765 43215',
        mother_photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
        mother_address: 'House #22, Palm Grove Enclave, Koramangala 4th Block, Bengaluru - 560034',
        has_previous_school: false,
        has_siblings: false
      },
      { 
        student_id: 'STU-003', 
        name: 'Diya Gupta', 
        roll_no: '103', 
        photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        dob: '2011-11-10',
        religion: 'Hindu',
        nationality: 'Indian',
        blood_group: 'A+',
        class_batch: 'Class 10 - Section A',
        stream: 'Sanskrit & Pure Science',
        aadhaar_no: '9876 5432 1093',
        gender: 'Female',
        admission_date: '2024-06-18',
        residential_address: 'Villa 12, Sobha City Heritage, Thanisandra Main Rd, Bengaluru - 560077',
        permanent_address: 'Villa 12, Sobha City Heritage, Thanisandra Main Rd, Bengaluru - 560077',
        phone: '+91 98765 00003',
        email: 'diya.gupta@example.com',
        fee_status: 'Pending',
        father_name: 'Vikram Gupta',
        father_occupation: 'Civil Infrastructure Engineer',
        father_phone: '+91 98765 43216',
        father_photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100',
        father_address: 'Villa 12, Sobha City Heritage, Thanisandra Main Rd, Bengaluru - 560077',
        mother_name: 'Pooja Gupta',
        mother_occupation: 'Interior Architect',
        mother_phone: '+91 98765 43217',
        mother_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        mother_address: 'Villa 12, Sobha City Heritage, Thanisandra Main Rd, Bengaluru - 560077',
        has_previous_school: true,
        prev_school_name: 'National Public School, Indiranagar',
        prev_school_board: 'ICSE',
        prev_studied_class: 'Class 9',
        has_siblings: true,
        sibling_id: 'STU-009',
        sibling_name: 'Kavya Gupta',
        sibling_class: 'Class 4 - Section B',
        sibling_roll_no: '104'
      },
      { 
        student_id: 'STU-004', 
        name: 'Rohan Mehta', 
        roll_no: '104', 
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
        dob: '2011-02-18',
        religion: 'Jain',
        nationality: 'Indian',
        blood_group: 'AB+',
        class_batch: 'Class 10 - Section A',
        stream: 'Physical Education (PE) & Math',
        aadhaar_no: '9876 5432 1094',
        gender: 'Male',
        admission_date: '2024-06-20',
        residential_address: 'B-601, Brigade Gateway, Malleshwaram, Bengaluru - 560055',
        permanent_address: 'B-601, Brigade Gateway, Malleshwaram, Bengaluru - 560055',
        phone: '+91 98765 00004',
        email: 'rohan.mehta@example.com',
        fee_status: 'Paid',
        father_name: 'Manish Mehta',
        father_occupation: 'Industrial Manufacturer',
        father_phone: '+91 98765 43218',
        father_photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        father_address: 'B-601, Brigade Gateway, Malleshwaram, Bengaluru - 560055',
        mother_name: 'Nisha Mehta',
        mother_occupation: 'Graphic Designer',
        mother_phone: '+91 98765 43219',
        mother_photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
        mother_address: 'B-601, Brigade Gateway, Malleshwaram, Bengaluru - 560055',
        has_previous_school: false,
        has_siblings: false
      },
      { 
        student_id: 'STU-005', 
        name: 'Ananya Iyer', 
        roll_no: '105', 
        photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
        dob: '2011-09-04',
        religion: 'Hindu',
        nationality: 'Indian',
        blood_group: 'O-',
        class_batch: 'Class 10 - Section A',
        stream: 'Computer Applications & STEM',
        aadhaar_no: '9876 5432 1095',
        gender: 'Female',
        admission_date: '2024-06-21',
        residential_address: 'Flat 101, Shriram Spandana, Wind Tunnel Road, Murugeshpalya, Bengaluru - 560017',
        permanent_address: 'Flat 101, Shriram Spandana, Wind Tunnel Road, Murugeshpalya, Bengaluru - 560017',
        phone: '+91 98765 00005',
        email: 'ananya.iyer@example.com',
        fee_status: 'Paid',
        father_name: 'Karthik Iyer',
        father_occupation: 'Aviation Consultant',
        father_phone: '+91 98765 43220',
        father_photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100',
        father_address: 'Flat 101, Shriram Spandana, Wind Tunnel Road, Murugeshpalya, Bengaluru - 560017',
        mother_name: 'Shalini Iyer',
        mother_occupation: 'Carnatic Music Faculty',
        mother_phone: '+91 98765 43221',
        mother_photo: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100',
        mother_address: 'Flat 101, Shriram Spandana, Wind Tunnel Road, Murugeshpalya, Bengaluru - 560017',
        has_previous_school: false,
        has_siblings: false
      },
      { 
        student_id: 'STU-006', 
        name: 'Kabir Singh', 
        roll_no: '106', 
        photo: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150',
        dob: '2011-05-19',
        religion: 'Sikh',
        nationality: 'Indian',
        blood_group: 'B+',
        class_batch: 'Class 10 - Section B',
        stream: 'Physical Education (PE) & Hindi',
        aadhaar_no: '9876 5432 1096',
        gender: 'Male',
        admission_date: '2024-06-22',
        residential_address: 'House #404, Defence Colony, Domlur, Bengaluru - 560071',
        permanent_address: 'House #404, Defence Colony, Domlur, Bengaluru - 560071',
        phone: '+91 98765 00006',
        email: 'kabir.singh@example.com',
        fee_status: 'Pending',
        father_name: 'Harpreet Singh',
        father_occupation: 'Automobile Dealership Owner',
        father_phone: '+91 98765 43222',
        father_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        father_address: 'House #404, Defence Colony, Domlur, Bengaluru - 560071',
        mother_name: 'Jaspreet Kaur',
        mother_occupation: 'Nutritionist & Wellness Consultant',
        mother_phone: '+91 98765 43223',
        mother_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
        mother_address: 'House #404, Defence Colony, Domlur, Bengaluru - 560071',
        has_previous_school: true,
        prev_school_name: 'Army Public School, ASC Center',
        prev_school_board: 'CBSE',
        prev_studied_class: 'Class 9',
        has_siblings: false
      }
    ]
  },
  'Teacher List': {
    columns: [
      { name: 'teacher_number', type: 'VARCHAR(50)', pk: 1 },
      { name: 'name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'phone', type: 'VARCHAR(50)', pk: 0 },
      { name: 'email', type: 'VARCHAR(255)', pk: 0 },
      { name: 'department', type: 'VARCHAR(255)', pk: 0 },
      { name: 'designation', type: 'VARCHAR(255)', pk: 0 },
      { name: 'aadhaar_no', type: 'VARCHAR(50)', pk: 0 },
      { name: 'residential_address', type: 'TEXT', pk: 0 },
      { name: 'permanent_address', type: 'TEXT', pk: 0 },
      { name: 'bank_name', type: 'VARCHAR(100)', pk: 0 },
      { name: 'bank_account_no', type: 'VARCHAR(50)', pk: 0 },
      { name: 'bank_ifsc', type: 'VARCHAR(50)', pk: 0 },
      { name: 'father_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'father_occupation', type: 'VARCHAR(255)', pk: 0 },
      { name: 'mother_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'mother_occupation', type: 'VARCHAR(255)', pk: 0 },
      { name: 'monthly_salary', type: 'DECIMAL(10,2)', pk: 0 },
      { name: 'status', type: 'VARCHAR(50)', pk: 0 }
    ],
    rows: [
      { 
        teacher_number: 'TEA 001', 
        name: 'Prof. Sarah Jenkins', 
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        gender: 'Female',
        dob: '1988-03-14',
        blood_group: 'A+',
        aadhaar_no: '5421 8890 1234',
        email: 'sjenkins@nairee.edu', 
        phone: '+91 98765 43211', 
        department: 'Mathematics & Science', 
        designation: 'Senior Faculty Lead', 
        qualification: 'M.Sc. Mathematics, B.Ed, NET Qualified',
        workload_hours: 24, 
        monthly_salary: 68000, 
        joining_date: '2020-07-01',
        residential_address: 'Flat 304, Palm Heights, 12th Cross, Indiranagar, Bengaluru - 560038',
        permanent_address: 'Flat 304, Palm Heights, 12th Cross, Indiranagar, Bengaluru - 560038',
        father_name: 'Arthur Jenkins',
        father_occupation: 'Retired Civil Architect',
        mother_name: 'Martha Jenkins',
        mother_occupation: 'Senior Academician & Author',
        emergency_contact_phone: '+91 98765 43299',
        bank_name: 'State Bank of India',
        bank_account_no: '30492817462',
        bank_ifsc: 'SBIN0004512',
        bank_holder_name: 'Sarah Jenkins',
        pan_no: 'ABCDE1234F',
        status: 'Active' 
      },
      { 
        teacher_number: 'TEA 002', 
        name: 'Dr. Evelyn Reed', 
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        gender: 'Female',
        dob: '1985-09-22',
        blood_group: 'O+',
        aadhaar_no: '6341 9920 4455',
        email: 'ereed@nairee.edu', 
        phone: '+91 98765 34567', 
        department: 'STEM & Robotics', 
        designation: 'Head of STEM Academics', 
        qualification: 'Ph.D in Robotics & Applied Mechatronics',
        workload_hours: 18, 
        monthly_salary: 75000, 
        joining_date: '2019-04-15',
        residential_address: 'Villa 45, Greenfield Enclave, Sarjapur Road, Bengaluru - 560102',
        permanent_address: 'House #12, Riverside Colony, Pune, Maharashtra - 411001',
        father_name: 'David Reed',
        father_occupation: 'Aerospace Systems Consultant',
        mother_name: 'Clara Reed',
        mother_occupation: 'Clinical Research Director',
        emergency_contact_phone: '+91 98765 34599',
        bank_name: 'HDFC Bank',
        bank_account_no: '50100239485123',
        bank_ifsc: 'HDFC0001042',
        bank_holder_name: 'Evelyn Reed',
        pan_no: 'EFGHI5678K',
        status: 'Active' 
      },
      { 
        teacher_number: 'TEA 003', 
        name: 'Mr. Robert Chen', 
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        gender: 'Male',
        dob: '1990-11-05',
        blood_group: 'B+',
        aadhaar_no: '7812 3456 9081',
        email: 'rchen@nairee.edu', 
        phone: '+91 98765 23456', 
        department: 'Computer Science', 
        designation: 'AI Systems Instructor', 
        qualification: 'M.Tech Computer Science & AI',
        workload_hours: 20, 
        monthly_salary: 62000, 
        joining_date: '2021-08-10',
        residential_address: 'Tower 4 - Apt 802, Prestige Lakeside Habitat, Varthur, Bengaluru - 560087',
        permanent_address: 'Tower 4 - Apt 802, Prestige Lakeside Habitat, Varthur, Bengaluru - 560087',
        father_name: 'Lawrence Chen',
        father_occupation: 'Financial Risk Analyst',
        mother_name: 'Grace Chen',
        mother_occupation: 'Senior Software Engineer',
        emergency_contact_phone: '+91 98765 23499',
        bank_name: 'ICICI Bank',
        bank_account_no: '001205018392',
        bank_ifsc: 'ICIC0000012',
        bank_holder_name: 'Robert Chen',
        pan_no: 'JKLMN9012P',
        status: 'Active' 
      },
      { 
        teacher_number: 'TEA 004', 
        name: 'Ms. Clara Oswald', 
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        gender: 'Female',
        dob: '1992-06-18',
        blood_group: 'AB+',
        aadhaar_no: '8923 4567 1122',
        email: 'coswald@nairee.edu', 
        phone: '+91 98765 12345', 
        department: 'Humanities & English', 
        designation: 'Literature Lead', 
        qualification: 'M.A. English Literature, B.Ed',
        workload_hours: 18, 
        monthly_salary: 58000, 
        joining_date: '2022-01-05',
        residential_address: 'B-201, Sobha Cinnamon, Harlur Road, Bengaluru - 560103',
        permanent_address: 'C-14, Mall Road, Shimla, Himachal Pradesh - 171001',
        father_name: 'George Oswald',
        father_occupation: 'Senior Advocate (High Court)',
        mother_name: 'Victoria Oswald',
        mother_occupation: 'School Principal (Retd.)',
        emergency_contact_phone: '+91 98765 12399',
        bank_name: 'Axis Bank',
        bank_account_no: '918020038475621',
        bank_ifsc: 'UTIB0000421',
        bank_holder_name: 'Clara Oswald',
        pan_no: 'OPQRS3456T',
        status: 'Active' 
      }
    ]
  },
  'Class & Batch List': {
    columns: [
      { name: 'batch_id', type: 'VARCHAR(50)', pk: 1 },
      { name: 'batch_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'class_teacher', type: 'VARCHAR(50) [Link to Teacher List]', pk: 0 },
      { name: 'room_no', type: 'VARCHAR(50)', pk: 0 },
      { name: 'capacity', type: 'INT', pk: 0 }
    ],
    rows: [
      { batch_id: 'CLS 10A', batch_name: 'Class 10A', class_teacher: 'TEA 001', room_no: 'Room 204', capacity: 35 },
      { batch_id: 'CLS 10B', batch_name: 'Class 10B', class_teacher: 'TEA 002', room_no: 'Room 205', capacity: 35 },
      { batch_id: 'CLS 11A', batch_name: 'Class 11A', class_teacher: 'TEA 003', room_no: 'Room 301', capacity: 30 }
    ]
  },
  'Subjects List': {
    columns: [
      { name: 'subject_id', type: 'VARCHAR(50)', pk: 1 },
      { name: 'subject_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'subject_code', type: 'VARCHAR(50)', pk: 0 },
      { name: 'teacher', type: 'VARCHAR(50) [Link to Teacher List]', pk: 0 },
      { name: 'credit_hours', type: 'INT', pk: 0 },
      { name: 'department', type: 'VARCHAR(255)', pk: 0 }
    ],
    rows: [
      { subject_id: 'SUB 001', subject_name: 'Advanced Mathematics', subject_code: 'MATH 101', teacher: 'TEA 001', credit_hours: 4, department: 'Mathematics & Science' },
      { subject_id: 'SUB 002', subject_name: 'Physics & Dynamics', subject_code: 'PHYS 102', teacher: 'TEA 002', credit_hours: 4, department: 'Physics & STEM' },
      { subject_id: 'SUB 003', subject_name: 'Computer Science & AI', subject_code: 'CS 104', teacher: 'TEA 003', credit_hours: 3, department: 'Computer Science' },
      { subject_id: 'SUB 004', subject_name: 'English & World Literature', subject_code: 'ENG 105', teacher: 'TEA 004', credit_hours: 3, department: 'Humanities & English' }
    ]
  },
  'Parent List': {
    columns: [
      { name: 'parent_id', type: 'VARCHAR(50)', pk: 1 },
      { name: 'name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'phone', type: 'VARCHAR(50)', pk: 0 },
      { name: 'email', type: 'VARCHAR(255)', pk: 0 },
      { name: 'child', type: 'VARCHAR(50) [Link to Student List]', pk: 0 },
      { name: 'relationship', type: 'VARCHAR(50)', pk: 0 }
    ],
    rows: [
      { parent_id: 'PAR 001', name: 'Rajesh Patel', phone: '+91 98765 43212', email: 'rpatel@family.com', child: 'STU 001', relationship: 'Father' },
      { parent_id: 'PAR 002', name: 'Sunita Sharma', phone: '+91 98765 43215', email: 'sunita.sharma@family.com', child: 'STU 002', relationship: 'Mother' },
      { parent_id: 'PAR 003', name: 'Vikram Gupta', phone: '+91 98765 43216', email: 'vikram.gupta@family.com', child: 'STU 003', relationship: 'Father' }
    ]
  },
  'Admin List': {
    columns: [
      { name: 'admin_id', type: 'VARCHAR(50)', pk: 1 },
      { name: 'name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'email', type: 'VARCHAR(255)', pk: 0 },
      { name: 'role', type: 'VARCHAR(50)', pk: 0 },
      { name: 'designation', type: 'VARCHAR(100)', pk: 0 }
    ],
    rows: [
      { admin_id: 'ADM 001', name: 'Dr. Marcus Vance', email: 'admin@nairee.edu', role: 'Principal', designation: 'Executive Principal & Academic Director' },
      { admin_id: 'ADM 002', name: 'Anita Verma', email: 'accounts@nairee.edu', role: 'Accountant', designation: 'Chief Financial Officer & Bursar' }
    ]
  },
  'Attendance Records': {
    columns: [
      { name: 'attendance_id', type: 'VARCHAR(50)', pk: 1 },
      { name: 'student', type: 'VARCHAR(50) [Link to Student List]', pk: 0 },
      { name: 'date', type: 'DATE', pk: 0 },
      { name: 'status', type: 'VARCHAR(50)', pk: 0 },
      { name: 'class_batch', type: 'VARCHAR(50) [Link to Class & Batch List]', pk: 0 }
    ],
    rows: [
      { attendance_id: 'ATT 001', student: 'STU 001', date: '2026-10-01', status: 'Present', class_batch: 'CLS 10A' },
      { attendance_id: 'ATT 002', student: 'STU 002', date: '2026-10-01', status: 'Present', class_batch: 'CLS 10A' },
      { attendance_id: 'ATT 003', student: 'STU 003', date: '2026-10-01', status: 'Absent', class_batch: 'CLS 10A' }
    ]
  },
  'Homework List': {
    columns: [
      { name: 'homework_id', type: 'VARCHAR(50)', pk: 1 },
      { name: 'class_batch', type: 'VARCHAR(50) [Link to Class & Batch List]', pk: 0 },
      { name: 'subject', type: 'VARCHAR(50) [Link to Subjects List]', pk: 0 },
      { name: 'title', type: 'VARCHAR(255)', pk: 0 },
      { name: 'instructions', type: 'TEXT', pk: 0 },
      { name: 'due_date', type: 'VARCHAR(50)', pk: 0 },
      { name: 'assigned_by', type: 'VARCHAR(50) [Link to Teacher List]', pk: 0 }
    ],
    rows: [
      { homework_id: 'HW 001', class_batch: 'CLS 10A', subject: 'SUB 001', title: 'Calculus Trigonometric Integrals Exercise 4.2', instructions: 'Solve problems 1 through 15 with step by step proofs.', due_date: 'Tomorrow 5:00 PM', assigned_by: 'TEA 001' },
      { homework_id: 'HW 002', class_batch: 'CLS 10A', subject: 'SUB 002', title: 'Newtonian Dynamics Mechanics Simulation', instructions: 'Complete virtual lab friction parameters chart.', due_date: 'Friday 11:59 PM', assigned_by: 'TEA 002' }
    ]
  }
};

// Aliases for compatibility
INITIAL_DB_STORE['tabStudent'] = INITIAL_DB_STORE['Student List'];
INITIAL_DB_STORE['tabTeacher'] = INITIAL_DB_STORE['Teacher List'];
INITIAL_DB_STORE['tabFaculty'] = INITIAL_DB_STORE['Teacher List'];
INITIAL_DB_STORE['tabClass'] = INITIAL_DB_STORE['Class & Batch List'];
INITIAL_DB_STORE['tabStudentBatch'] = INITIAL_DB_STORE['Class & Batch List'];
INITIAL_DB_STORE['tabSubject'] = INITIAL_DB_STORE['Subjects List'];
INITIAL_DB_STORE['tabCourse'] = INITIAL_DB_STORE['Subjects List'];
INITIAL_DB_STORE['tabParent'] = INITIAL_DB_STORE['Parent List'];
INITIAL_DB_STORE['tabStudentAttendance'] = INITIAL_DB_STORE['Attendance Records'];
INITIAL_DB_STORE['tabHomework'] = INITIAL_DB_STORE['Homework List'];
INITIAL_DB_STORE['tabAdmin'] = INITIAL_DB_STORE['Admin List'];

// Fallback data for static deployments (GitHub Pages, Netlify standalone)
export const FALLBACK_DATA = {
  users: [
    { id: 'admin 1', username: 'admin', full_name: 'Dr. Marcus Vance', role: 'admin', email: 'admin@nairee.edu', status: 'Active', department: 'Executive Board', phone: '+91 98765 43210' },
    { id: 'teacher 1', username: 'teacher_jenkins', full_name: 'Prof. Sarah Jenkins', role: 'teacher', email: 'sjenkins@nairee.edu', status: 'Active', department: 'Mathematics & Science', phone: '+91 98765 43211' },
    { id: 'EDU-STU-2026-00001', username: 'nairee', full_name: 'Nairee Patel', role: 'student', email: 'syalfreelance@gmail.com', status: 'Active', batch_name: 'Grade 10 Section A', roll_number: '101', student_id: 'STU-001' },
    { id: 'EDU-STU-2026-00002', username: 'aarav', full_name: 'Aarav Sharma', role: 'student', email: 'aarav.sharma@example.com', status: 'Active', batch_name: 'Class 3 - Section A', roll_number: '102', student_id: 'STU-002' },
    { id: 'parent 1', username: 'parent_patel', full_name: 'Rajesh Patel', role: 'parent', email: 'rpatel@family.com', status: 'Active', phone: '+91 98765 43212' }
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
    { id: 'EDU STU 2026 00001', full_name: 'Nairee Patel', roll_number: '10A 01', batch_id: 'BATCH 10A 2026', batch_name: 'Grade 10 Section A', email: 'syalfreelance@gmail.com', phone: '+91 98765 00001', attendance_percentage: 97.5, fee_status: 'Paid', balance_due: 0 },
    { id: 'EDU STU 2026 00002', full_name: 'Aarav Sharma', roll_number: '10A 02', batch_id: 'BATCH 10A 2026', batch_name: 'Grade 10 Section A', email: 'aarav.sharma@example.com', phone: '+91 98765 00002', attendance_percentage: 94.0, fee_status: 'Paid', balance_due: 0 },
    { id: 'EDU STU 2026 00003', full_name: 'Diya Gupta', roll_number: '10A 03', batch_id: 'BATCH 10A 2026', batch_name: 'Grade 10 Section A', email: 'diya.gupta@example.com', phone: '+91 98765 00003', attendance_percentage: 98.2, fee_status: 'Pending', balance_due: 35000 },
    { id: 'EDU STU 2026 00004', full_name: 'Rohan Mehta', roll_number: '10A 04', batch_id: 'BATCH 10A 2026', batch_name: 'Grade 10 Section A', email: 'rohan.mehta@example.com', phone: '+91 98765 00004', attendance_percentage: 91.5, fee_status: 'Paid', balance_due: 0 },
    { id: 'EDU STU 2026 00005', full_name: 'Ananya Iyer', roll_number: '10A 05', batch_id: 'BATCH 10A 2026', batch_name: 'Grade 10 Section A', email: 'ananya.iyer@example.com', phone: '+91 98765 00005', attendance_percentage: 99.0, fee_status: 'Paid', balance_due: 0 },
    { id: 'EDU STU 2026 00006', full_name: 'Kabir Singh', roll_number: '10B 06', batch_id: 'BATCH 10B 2026', batch_name: 'Grade 10 Section B', email: 'kabir.singh@example.com', phone: '+91 98765 00006', attendance_percentage: 89.0, fee_status: 'Pending', balance_due: 35000 }
  ],
  batches: [
    { id: 'BATCH 10A 2026', name: 'Grade 10 Section A', grade: '10', section: 'A', room: 'Room 204' },
    { id: 'BATCH 10B 2026', name: 'Grade 10 Section B', grade: '10', section: 'B', room: 'Room 205' }
  ],
  courses: [
    { id: 'CRS MATH 10', name: 'Advanced Mathematics', code: 'MATH 101', instructor: 'Prof. Sarah Jenkins' },
    { id: 'CRS PHYS 10', name: 'Physics & Lab Dynamics', code: 'PHYS 102', instructor: 'Dr. Marcus Vance' },
    { id: 'CRS CHEM 10', name: 'Organic & Applied Chemistry', code: 'CHEM 103', instructor: 'Dr. Marcus Vance' }
  ],
  faculty: [
    { id: 'FAC 001', name: 'Prof. Sarah Jenkins', department: 'Mathematics & Science', email: 'sjenkins@nairee.edu', phone: '+91 98765 43211', workload_hours: 24 },
    { id: 'FAC 002', name: 'Dr. Marcus Vance', department: 'Physics & STEM', email: 'admin@nairee.edu', phone: '+91 98765 43210', workload_hours: 18 }
  ],
  schedule: [
    { id: 'SCH 01', day: 'Monday', time_slot: '08:30 AM to 09:30 AM', course_name: 'Advanced Mathematics', instructor: 'Prof. Sarah Jenkins', room: 'Room 204' },
    { id: 'SCH 02', day: 'Monday', time_slot: '09:40 AM to 10:40 AM', course_name: 'Physics & Lab Dynamics', instructor: 'Dr. Marcus Vance', room: 'Lab 2' },
    { id: 'SCH 03', day: 'Tuesday', time_slot: '08:30 AM to 09:30 AM', course_name: 'Organic & Applied Chemistry', instructor: 'Dr. Marcus Vance', room: 'Lab 1' }
  ],
  attendance: [
    { id: 'ATT 001', student_id: 'EDU STU 2026 00001', student_name: 'Nairee Patel', date: '2026-10-01', status: 'Present' },
    { id: 'ATT 002', student_id: 'EDU STU 2026 00002', student_name: 'Aarav Sharma', date: '2026-10-01', status: 'Present' },
    { id: 'ATT 003', student_id: 'EDU STU 2026 00003', student_name: 'Diya Gupta', date: '2026-10-01', status: 'Absent' }
  ],
  fees: [
    { id: 'FEE 2026 001', title: 'Term 1 Tuition Fee', amount: 35000, due_date: '2026-10-15', status: 'Paid', payment_date: '2026-09-28', student_name: 'Nairee Patel' },
    { id: 'FEE 2026 002', title: 'Science Lab & STEM Materials Fee', amount: 8500, due_date: '2026-10-25', status: 'Pending', student_name: 'Nairee Patel' }
  ],
  syllabus: [
    { id: 'SYL 01', subject: 'Mathematics', topic: 'Quadratic Equations & Polynomials', total_topics: 10, completed_topics: 8, status: 'In Progress' },
    { id: 'SYL 02', subject: 'Physics', topic: 'Electromagnetism & Waves', total_topics: 8, completed_topics: 6, status: 'In Progress' }
  ],
  homework: [
    { id: 'HW 01', title: 'Calculus Trigonometric Integrals Exercise 4.2', subject: 'Mathematics', due_date: 'Tomorrow 5:00 PM', status: 'Assigned', instructions: 'Solve problems 1 through 15 with step by step proofs.' },
    { id: 'HW 02', title: 'Newtonian Dynamics Mechanics Simulation', subject: 'Physics', due_date: 'Friday 11:59 PM', status: 'Submitted', instructions: 'Complete virtual lab friction parameters chart.' }
  ],
  study_materials: [
    { id: 'MAT 01', title: 'Mathematics Formula Cheat Sheet 2026', subject: 'Mathematics', type: 'PDF Document', size: '2.4 MB' },
    { id: 'MAT 02', title: 'Electromagnetism Key Notes & Lab Manual', subject: 'Physics', type: 'PDF Document', size: '4.1 MB' }
  ],
  transport: {
    route_name: 'Route 14 Green Valley to Nairee Campus',
    bus_number: 'DL 01 NA 2026',
    driver_name: 'Rameshwar Singh',
    driver_phone: '+91 98765 11223',
    pickup_time: '07:40 AM',
    drop_time: '03:45 PM',
    status: 'On Route Approaching Stop 3'
  },
  announcements: [
    { id: 'ANN LIVE FLASH 999', title: 'LIVE ALERT: Annual Inter School Tech & Sports Championship dates officially declared', category: 'Breaking Announcement', created_at: 'Just now', sender: 'Executive Principal Office', content: 'Championship trials begin this Friday. All house captains and student athletes are invited to submit team rosters today.' },
    { id: 'ANN 2026 LIVE 01', title: 'Urgent Update: Science Olympiad registrations extended till Sunday & Inter School Sports Trials', category: 'Urgent Circular', created_at: '2 hours ago', sender: 'Principal Office', content: 'Registrations are now open for all students Grade 6 to 12. Contact the sports coordinator for trial slots.' },
    { id: 'ANN 01', title: 'Due to heavy rainfall next 2 days holidays declared', category: 'Weather Circular', created_at: '5 hours ago', sender: 'Principal Office' },
    { id: 'ANN 02', title: 'Mid term examination schedule released for Grades 9 through 12', category: 'Academics', created_at: '1 day ago', sender: 'Academic Cell' }
  ],
  messages: [
    { id: 'MSG 01', sender: 'Prof. Sarah Jenkins', content: 'Great effort on the recent Mathematics assignment test!', timestamp: '10:30 AM' }
  ]
};

export const FALLBACK_STUDENTS = [
  { name: 'EDU STU 2026 00001', student_name: 'Nairee Patel', roll_no: '101', student_batch: 'Grade 10 Section A', guardian_name: 'Mr. Rajesh Patel', guardian_mobile: '+91 98765 43212', attendancePct: 98, avgGrade: 96, feeDues: 0 },
  { name: 'EDU STU 2026 00002', student_name: 'Aarav Sharma', roll_no: '102', student_batch: 'Grade 10 Section A', guardian_name: 'Mr. Suresh Sharma', guardian_mobile: '+91 98765 43214', attendancePct: 94, avgGrade: 88, feeDues: 0 },
  { name: 'EDU STU 2026 00003', student_name: 'Diya Gupta', roll_no: '103', student_batch: 'Grade 10 Section A', guardian_name: 'Mr. Vikram Gupta', guardian_mobile: '+91 98765 43216', attendancePct: 99, avgGrade: 92, feeDues: 35000 },
  { name: 'EDU STU 2026 00004', student_name: 'Rohan Mehta', roll_no: '104', student_batch: 'Grade 10 Section A', guardian_name: 'Mr. Manish Mehta', guardian_mobile: '+91 98765 43218', attendancePct: 91, avgGrade: 84, feeDues: 0 },
  { name: 'EDU STU 2026 00005', student_name: 'Ananya Iyer', roll_no: '105', student_batch: 'Grade 10 Section A', guardian_name: 'Mr. Karthik Iyer', guardian_mobile: '+91 98765 43220', attendancePct: 97, avgGrade: 95, feeDues: 0 },
  { name: 'EDU STU 2026 00006', student_name: 'Kabir Singh', roll_no: '106', student_batch: 'Grade 10 Section B', guardian_name: 'Mr. Harpreet Singh', guardian_mobile: '+91 98765 43222', attendancePct: 89, avgGrade: 78, feeDues: 35000 }
];

export const FALLBACK_FACULTY = [
  { name: 'FAC 001', full_name: 'Prof. Sarah Jenkins', department: 'Mathematics & Science', designation: 'Senior Faculty Lead', email: 'sjenkins@nairee.edu', salary: 68000 },
  { name: 'FAC 002', full_name: 'Dr. Marcus Vance', department: 'Physics & STEM', designation: 'Head of STEM Academics', email: 'admin@nairee.edu', salary: 75000 },
  { name: 'FAC 003', full_name: 'Mr. Robert Chen', department: 'Computer Science', designation: 'AI Systems Instructor', email: 'rchen@nairee.edu', salary: 64000 },
  { name: 'FAC 004', full_name: 'Ms. Clara Oswald', department: 'Humanities & English', designation: 'Literature Lead', email: 'coswald@nairee.edu', salary: 60000 }
];

export const FALLBACK_BATCHES = [
  { name: 'BATCH 10A 2026', batch_name: 'Grade 10 Section A', grade_level: 'Grade 10', section: 'A', class_teacher: 'Prof. Sarah Jenkins', room_no: 'Room 204' },
  { name: 'BATCH 10B 2026', batch_name: 'Grade 10 Section B', grade_level: 'Grade 10', section: 'B', class_teacher: 'Dr. Marcus Vance', room_no: 'Room 205' },
  { name: 'BATCH 11A 2026', batch_name: 'Grade 11 Section A', grade_level: 'Grade 11', section: 'A', class_teacher: 'Mr. Robert Chen', room_no: 'Room 301' }
];
