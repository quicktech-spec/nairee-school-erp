// Master Centralized Relational Database Store for Nairee School ERP
// Single Source of Truth for all Portals, Database Studio, and Management Views

export const INITIAL_DB_STORE = {
  'Student List': {
    columns: [
      { name: 'student_id', type: 'VARCHAR(50)', pk: 1 },
      { name: 'name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'roll_no', type: 'VARCHAR(50)', pk: 0 },
      { name: 'class_batch', type: 'VARCHAR(100) [Link to Class & Batch List]', pk: 0 },
      { name: 'stream', type: 'VARCHAR(150)', pk: 0 },
      { name: 'gender', type: 'VARCHAR(20)', pk: 0 },
      { name: 'dob', type: 'DATE', pk: 0 },
      { name: 'blood_group', type: 'VARCHAR(10)', pk: 0 },
      { name: 'aadhaar_no', type: 'VARCHAR(50)', pk: 0 },
      { name: 'phone', type: 'VARCHAR(50)', pk: 0 },
      { name: 'email', type: 'VARCHAR(255)', pk: 0 },
      { name: 'residential_address', type: 'TEXT', pk: 0 },
      { name: 'permanent_address', type: 'TEXT', pk: 0 },
      { name: 'fee_status', type: 'VARCHAR(50)', pk: 0 },
      { name: 'father_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'father_phone', type: 'VARCHAR(50)', pk: 0 },
      { name: 'father_occupation', type: 'VARCHAR(255)', pk: 0 },
      { name: 'mother_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'mother_phone', type: 'VARCHAR(50)', pk: 0 },
      { name: 'mother_occupation', type: 'VARCHAR(255)', pk: 0 },
      { name: 'status', type: 'VARCHAR(50)', pk: 0 }
    ],
    rows: [
      { 
        student_id: 'STU-001', 
        name: 'Nairee Patel', 
        roll_no: '101', 
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        dob: '2011-04-12',
        religion: 'Hindu',
        nationality: 'Indian',
        blood_group: 'O+',
        class_batch: 'Class 10 - Section A',
        batch_id: 'CLS 10A',
        stream: 'Computer Applications & Advanced Math',
        aadhaar_no: '9876 5432 1091',
        gender: 'Female',
        admission_date: '2024-06-15',
        residential_address: 'Flat 402, Green Meadows Residency, 14th Main, Indiranagar, Bengaluru - 560038',
        permanent_address: 'Flat 402, Green Meadows Residency, 14th Main, Indiranagar, Bengaluru - 560038',
        phone: '+91 98765 00001',
        email: 'syalfreelance@gmail.com',
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
        sibling_roll_no: '108',
        status: 'Active'
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
        batch_id: 'CLS 10A',
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
        has_siblings: false,
        status: 'Active'
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
        batch_id: 'CLS 10A',
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
        sibling_roll_no: '104',
        status: 'Active'
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
        batch_id: 'CLS 10A',
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
        has_siblings: false,
        status: 'Active'
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
        batch_id: 'CLS 10A',
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
        has_siblings: false,
        status: 'Active'
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
        batch_id: 'CLS 10B',
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
        has_siblings: false,
        status: 'Active'
      },
      {
        student_id: 'STU-008',
        name: 'Riya Patel',
        roll_no: '108',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        dob: '2015-02-10',
        religion: 'Hindu',
        nationality: 'Indian',
        blood_group: 'O+',
        class_batch: 'Class 6 - Section A',
        batch_id: 'CLS 6A',
        stream: 'General Science & Arts',
        aadhaar_no: '9876 5432 1098',
        gender: 'Female',
        admission_date: '2024-06-15',
        residential_address: 'Flat 402, Green Meadows Residency, 14th Main, Indiranagar, Bengaluru - 560038',
        permanent_address: 'Flat 402, Green Meadows Residency, 14th Main, Indiranagar, Bengaluru - 560038',
        phone: '+91 98765 43212',
        email: 'riya.patel@student.nairee.edu',
        fee_status: 'Paid',
        father_name: 'Rajesh Patel',
        father_occupation: 'Senior Software Director',
        father_phone: '+91 98765 43212',
        mother_name: 'Meera Patel',
        mother_occupation: 'Professor of Economics',
        mother_phone: '+91 98765 43213',
        has_previous_school: false,
        has_siblings: true,
        sibling_id: 'STU-001',
        sibling_name: 'Nairee Patel',
        sibling_class: 'Class 10 - Section A',
        sibling_roll_no: '101',
        status: 'Active'
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
      { name: 'mother_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'workload_hours', type: 'INT', pk: 0 },
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
      },
      {
        teacher_number: 'TEA 005',
        name: 'Ms. Priya Deshmukh',
        photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150',
        gender: 'Female',
        dob: '1991-08-12',
        blood_group: 'B+',
        aadhaar_no: '4390 1289 7711',
        email: 'pdeshmukh@nairee.edu',
        phone: '+91 98765 43215',
        department: 'Languages & Humanities',
        designation: 'Hindi & Sanskrit Faculty',
        qualification: 'M.A. Hindi, B.Ed',
        workload_hours: 16,
        monthly_salary: 58000,
        joining_date: '2022-06-15',
        residential_address: 'Flat 12B, Salarpuria Sattva, Marathahalli, Bengaluru - 560037',
        permanent_address: 'House #4, Model Colony, Pune - 411016',
        father_name: 'Anand Deshmukh',
        father_occupation: 'Senior Geologist',
        mother_name: 'Sunanda Deshmukh',
        mother_occupation: 'Educator',
        emergency_contact_phone: '+91 98765 43288',
        bank_name: 'Kotak Mahindra Bank',
        bank_account_no: '4819203948',
        bank_ifsc: 'KKBK0008123',
        bank_holder_name: 'Priya Deshmukh',
        pan_no: 'UVWXY7890Z',
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
      { batch_id: 'CLS 10A', batch_name: 'Class 10 - Section A', class_teacher: 'TEA 001', room_no: 'Room 204', capacity: 35 },
      { batch_id: 'CLS 10B', batch_name: 'Class 10 - Section B', class_teacher: 'TEA 002', room_no: 'Room 205', capacity: 35 },
      { batch_id: 'CLS 11A', batch_name: 'Class 11 - Section A', class_teacher: 'TEA 003', room_no: 'Room 301', capacity: 30 },
      { batch_id: 'CLS 12A', batch_name: 'Class 12 - Section A (Science)', class_teacher: 'TEA 004', room_no: 'Room 302', capacity: 30 }
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
      { subject_id: 'SUB 004', subject_name: 'English & World Literature', subject_code: 'ENG 105', teacher: 'TEA 004', credit_hours: 3, department: 'Humanities & English' },
      { subject_id: 'SUB 005', subject_name: 'Hindi Literature & Grammar', subject_code: 'HIN 106', teacher: 'TEA 005', credit_hours: 3, department: 'Languages & Humanities' }
    ]
  },

  'Assessment Plans': {
    columns: [
      { name: 'plan_id', type: 'VARCHAR(50)', pk: 1 },
      { name: 'assessment_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'course_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'subject', type: 'VARCHAR(255)', pk: 0 },
      { name: 'maximum_score', type: 'INT', pk: 0 },
      { name: 'date', type: 'DATE', pk: 0 },
      { name: 'class_batch', type: 'VARCHAR(50)', pk: 0 }
    ],
    rows: [
      { plan_id: 'PLAN-01', assessment_name: 'Mid-Term Examinations 2026', course_name: 'Advanced Mathematics', subject: 'Mathematics', maximum_score: 100, date: '2026-10-15', class_batch: 'CLS 10A' },
      { plan_id: 'PLAN-02', assessment_name: 'Lab Dynamics Practical Evaluation', course_name: 'Physics & Dynamics', subject: 'Physics', maximum_score: 50, date: '2026-10-20', class_batch: 'CLS 10A' },
      { plan_id: 'PLAN-03', assessment_name: 'AI & Python Coding Assessment', course_name: 'Computer Science & AI', subject: 'Computer Science', maximum_score: 100, date: '2026-10-28', class_batch: 'CLS 10A' },
      { plan_id: 'PLAN-04', assessment_name: 'English Essay & Creative Composition', course_name: 'English & World Literature', subject: 'English', maximum_score: 50, date: '2026-11-05', class_batch: 'CLS 10A' }
    ]
  },

  'Assessment Results': {
    columns: [
      { name: 'result_id', type: 'VARCHAR(50)', pk: 1 },
      { name: 'student_id', type: 'VARCHAR(50) [Link to Student List]', pk: 0 },
      { name: 'student_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'plan_id', type: 'VARCHAR(50) [Link to Assessment Plans]', pk: 0 },
      { name: 'assessment_plan', type: 'VARCHAR(255)', pk: 0 },
      { name: 'course', type: 'VARCHAR(255)', pk: 0 },
      { name: 'score', type: 'DECIMAL(5,2)', pk: 0 },
      { name: 'maximum_score', type: 'DECIMAL(5,2)', pk: 0 },
      { name: 'percentage', type: 'DECIMAL(5,2)', pk: 0 },
      { name: 'grade', type: 'VARCHAR(10)', pk: 0 },
      { name: 'comment', type: 'TEXT', pk: 0 }
    ],
    rows: [
      { result_id: 'RES-001', student_id: 'STU-001', student_name: 'Nairee Patel', plan_id: 'PLAN-01', assessment_plan: 'Mid-Term Examinations 2026', course: 'Mathematics', score: 98, maximum_score: 100, percentage: 98, grade: 'A+', comment: 'Exceptional mathematical rigor and step-by-step proofs.' },
      { result_id: 'RES-002', student_id: 'STU-002', student_name: 'Aarav Sharma', plan_id: 'PLAN-01', assessment_plan: 'Mid-Term Examinations 2026', course: 'Mathematics', score: 88, maximum_score: 100, percentage: 88, grade: 'A', comment: 'Strong analytical skills, minor accuracy slip in trigonometry.' },
      { result_id: 'RES-003', student_id: 'STU-003', student_name: 'Diya Gupta', plan_id: 'PLAN-01', assessment_plan: 'Mid-Term Examinations 2026', course: 'Mathematics', score: 94, maximum_score: 100, percentage: 94, grade: 'A+', comment: 'Brilliant conceptual grasp across algebra and calculus.' },
      { result_id: 'RES-004', student_id: 'STU-004', student_name: 'Rohan Mehta', plan_id: 'PLAN-01', assessment_plan: 'Mid-Term Examinations 2026', course: 'Mathematics', score: 84, maximum_score: 100, percentage: 84, grade: 'B+', comment: 'Good effort, needs further practice in geometric proofs.' },
      { result_id: 'RES-005', student_id: 'STU-005', student_name: 'Ananya Iyer', plan_id: 'PLAN-01', assessment_plan: 'Mid-Term Examinations 2026', course: 'Mathematics', score: 96, maximum_score: 100, percentage: 96, grade: 'A+', comment: 'Outstanding performance, consistent distinction scorer.' },
      { result_id: 'RES-006', student_id: 'STU-006', student_name: 'Kabir Singh', plan_id: 'PLAN-01', assessment_plan: 'Mid-Term Examinations 2026', course: 'Mathematics', score: 78, maximum_score: 100, percentage: 78, grade: 'B', comment: 'Solid foundation, recommended remedial session for quadratic equations.' },
      { result_id: 'RES-007', student_id: 'STU-001', student_name: 'Nairee Patel', plan_id: 'PLAN-02', assessment_plan: 'Lab Dynamics Practical Evaluation', course: 'Physics', score: 48, maximum_score: 50, percentage: 96, grade: 'A+', comment: 'Precise circuit assembly and accurate data plotting.' },
      { result_id: 'RES-008', student_id: 'STU-002', student_name: 'Aarav Sharma', plan_id: 'PLAN-02', assessment_plan: 'Lab Dynamics Practical Evaluation', course: 'Physics', score: 44, maximum_score: 50, percentage: 88, grade: 'A', comment: 'Well documented experimental observations.' }
    ]
  },

  'Attendance Records': {
    columns: [
      { name: 'attendance_id', type: 'VARCHAR(50)', pk: 1 },
      { name: 'student_id', type: 'VARCHAR(50) [Link to Student List]', pk: 0 },
      { name: 'student_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'date', type: 'DATE', pk: 0 },
      { name: 'status', type: 'VARCHAR(50)', pk: 0 },
      { name: 'class_batch', type: 'VARCHAR(50) [Link to Class & Batch List]', pk: 0 }
    ],
    rows: [
      { attendance_id: 'ATT-001', student_id: 'STU-001', student_name: 'Nairee Patel', date: '2026-10-01', status: 'Present', class_batch: 'CLS 10A' },
      { attendance_id: 'ATT-002', student_id: 'STU-002', student_name: 'Aarav Sharma', date: '2026-10-01', status: 'Present', class_batch: 'CLS 10A' },
      { attendance_id: 'ATT-003', student_id: 'STU-003', student_name: 'Diya Gupta', date: '2026-10-01', status: 'Absent', class_batch: 'CLS 10A' },
      { attendance_id: 'ATT-004', student_id: 'STU-004', student_name: 'Rohan Mehta', date: '2026-10-01', status: 'Present', class_batch: 'CLS 10A' },
      { attendance_id: 'ATT-005', student_id: 'STU-005', student_name: 'Ananya Iyer', date: '2026-10-01', status: 'Present', class_batch: 'CLS 10A' },
      { attendance_id: 'ATT-006', student_id: 'STU-006', student_name: 'Kabir Singh', date: '2026-10-01', status: 'Absent', class_batch: 'CLS 10B' },
      { attendance_id: 'ATT-007', student_id: 'STU-001', student_name: 'Nairee Patel', date: '2026-10-02', status: 'Present', class_batch: 'CLS 10A' },
      { attendance_id: 'ATT-008', student_id: 'STU-002', student_name: 'Aarav Sharma', date: '2026-10-02', status: 'Present', class_batch: 'CLS 10A' },
      { attendance_id: 'ATT-009', student_id: 'STU-003', student_name: 'Diya Gupta', date: '2026-10-02', status: 'Present', class_batch: 'CLS 10A' },
      { attendance_id: 'ATT-010', student_id: 'STU-004', student_name: 'Rohan Mehta', date: '2026-10-02', status: 'Present', class_batch: 'CLS 10A' },
      { attendance_id: 'ATT-011', student_id: 'STU-005', student_name: 'Ananya Iyer', date: '2026-10-02', status: 'Present', class_batch: 'CLS 10A' },
      { attendance_id: 'ATT-012', student_id: 'STU-006', student_name: 'Kabir Singh', date: '2026-10-02', status: 'Present', class_batch: 'CLS 10B' }
    ]
  },

  'Teacher Attendance': {
    columns: [
      { name: 'punch_id', type: 'VARCHAR(50)', pk: 1 },
      { name: 'teacher_number', type: 'VARCHAR(50) [Link to Teacher List]', pk: 0 },
      { name: 'name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'date', type: 'DATE', pk: 0 },
      { name: 'punch_in', type: 'VARCHAR(20)', pk: 0 },
      { name: 'punch_out', type: 'VARCHAR(20)', pk: 0 },
      { name: 'status', type: 'VARCHAR(50)', pk: 0 },
      { name: 'hours_recorded', type: 'DECIMAL(4,2)', pk: 0 }
    ],
    rows: [
      { punch_id: 'TP-001', teacher_number: 'TEA 001', name: 'Prof. Sarah Jenkins', date: '2026-10-04', punch_in: '08:15 AM', punch_out: '04:15 PM', status: 'On Duty', hours_recorded: 8.0 },
      { punch_id: 'TP-002', teacher_number: 'TEA 002', name: 'Dr. Evelyn Reed', date: '2026-10-04', punch_in: '08:20 AM', punch_out: '04:20 PM', status: 'On Duty', hours_recorded: 8.0 },
      { punch_id: 'TP-003', teacher_number: 'TEA 003', name: 'Mr. Robert Chen', date: '2026-10-04', punch_in: '08:10 AM', punch_out: '04:10 PM', status: 'On Duty', hours_recorded: 8.0 },
      { punch_id: 'TP-004', teacher_number: 'TEA 004', name: 'Ms. Clara Oswald', date: '2026-10-04', punch_in: '08:25 AM', punch_out: '04:25 PM', status: 'On Duty', hours_recorded: 8.0 }
    ]
  },

  'Classes Conducted Log': {
    columns: [
      { name: 'log_id', type: 'VARCHAR(50)', pk: 1 },
      { name: 'teacher_number', type: 'VARCHAR(50) [Link to Teacher List]', pk: 0 },
      { name: 'teacher_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'class_batch', type: 'VARCHAR(50) [Link to Class & Batch List]', pk: 0 },
      { name: 'subject', type: 'VARCHAR(255)', pk: 0 },
      { name: 'topic_covered', type: 'VARCHAR(255)', pk: 0 },
      { name: 'period_slot', type: 'VARCHAR(50)', pk: 0 },
      { name: 'date', type: 'DATE', pk: 0 }
    ],
    rows: [
      { log_id: 'LOG-001', teacher_number: 'TEA 001', teacher_name: 'Prof. Sarah Jenkins', class_batch: 'CLS 10A', subject: 'Advanced Mathematics', topic_covered: 'Quadratic Polynomial Factorization & Real Roots', period_slot: '08:30 AM - 09:30 AM', date: '2026-10-04' },
      { log_id: 'LOG-002', teacher_number: 'TEA 002', teacher_name: 'Dr. Evelyn Reed', class_batch: 'CLS 10A', subject: 'Physics & Dynamics', topic_covered: 'Electromagnetic Inductance & Faraday Law Verification', period_slot: '09:40 AM - 10:40 AM', date: '2026-10-04' }
    ]
  },

  'Teacher Substitution': {
    columns: [
      { name: 'sub_id', type: 'VARCHAR(50)', pk: 1 },
      { name: 'original_teacher', type: 'VARCHAR(255)', pk: 0 },
      { name: 'substitute_teacher', type: 'VARCHAR(255)', pk: 0 },
      { name: 'class_batch', type: 'VARCHAR(50)', pk: 0 },
      { name: 'subject', type: 'VARCHAR(255)', pk: 0 },
      { name: 'period_slot', type: 'VARCHAR(50)', pk: 0 },
      { name: 'date', type: 'DATE', pk: 0 },
      { name: 'reason', type: 'TEXT', pk: 0 },
      { name: 'status', type: 'VARCHAR(50)', pk: 0 }
    ],
    rows: [
      { sub_id: 'SUBST-001', original_teacher: 'Prof. Sarah Jenkins', substitute_teacher: 'Dr. Evelyn Reed', class_batch: 'CLS 10A', subject: 'Advanced Mathematics', period_slot: '02:00 PM - 03:00 PM', date: '2026-10-05', reason: 'CBSE Mathematics Workshop Attendance', status: 'Approved' }
    ]
  },

  'Fee Invoices & Ledger': {
    columns: [
      { name: 'invoice_id', type: 'VARCHAR(50)', pk: 1 },
      { name: 'student_id', type: 'VARCHAR(50) [Link to Student List]', pk: 0 },
      { name: 'student_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'title', type: 'VARCHAR(255)', pk: 0 },
      { name: 'fee_type', type: 'VARCHAR(100)', pk: 0 },
      { name: 'amount', type: 'DECIMAL(10,2)', pk: 0 },
      { name: 'due_date', type: 'DATE', pk: 0 },
      { name: 'status', type: 'VARCHAR(50)', pk: 0 },
      { name: 'payment_date', type: 'DATE', pk: 0 },
      { name: 'receipt_no', type: 'VARCHAR(50)', pk: 0 }
    ],
    rows: [
      { invoice_id: 'INV-2026-001', student_id: 'STU-001', student_name: 'Nairee Patel', title: 'Term 1 Tuition & Academic Fee', fee_type: 'Tuition Fee', amount: 35000, due_date: '2026-10-15', status: 'Paid', payment_date: '2026-09-28', receipt_no: 'REC-2026-9041' },
      { invoice_id: 'INV-2026-002', student_id: 'STU-001', student_name: 'Nairee Patel', title: 'STEM & Robotics Lab Instrumentation Fee', fee_type: 'Laboratory Fee', amount: 8500, due_date: '2026-10-25', status: 'Paid', payment_date: '2026-09-28', receipt_no: 'REC-2026-9042' },
      { invoice_id: 'INV-2026-003', student_id: 'STU-002', student_name: 'Aarav Sharma', title: 'Term 1 Tuition & Academic Fee', fee_type: 'Tuition Fee', amount: 35000, due_date: '2026-10-15', status: 'Paid', payment_date: '2026-09-29', receipt_no: 'REC-2026-9043' },
      { invoice_id: 'INV-2026-004', student_id: 'STU-003', student_name: 'Diya Gupta', title: 'Term 1 Tuition & Academic Fee', fee_type: 'Tuition Fee', amount: 35000, due_date: '2026-10-15', status: 'Pending', payment_date: null, receipt_no: null },
      { invoice_id: 'INV-2026-005', student_id: 'STU-004', student_name: 'Rohan Mehta', title: 'Term 1 Tuition & Academic Fee', fee_type: 'Tuition Fee', amount: 35000, due_date: '2026-10-15', status: 'Paid', payment_date: '2026-09-30', receipt_no: 'REC-2026-9044' },
      { invoice_id: 'INV-2026-006', student_id: 'STU-005', student_name: 'Ananya Iyer', title: 'Term 1 Tuition & Academic Fee', fee_type: 'Tuition Fee', amount: 35000, due_date: '2026-10-15', status: 'Paid', payment_date: '2026-09-29', receipt_no: 'REC-2026-9045' },
      { invoice_id: 'INV-2026-007', student_id: 'STU-006', student_name: 'Kabir Singh', title: 'Term 1 Tuition & Academic Fee', fee_type: 'Tuition Fee', amount: 35000, due_date: '2026-10-15', status: 'Pending', payment_date: null, receipt_no: null },
      { invoice_id: 'INV-2026-008', student_id: 'STU-008', student_name: 'Riya Patel', title: 'Term 1 Junior Primary Fee', fee_type: 'Tuition Fee', amount: 28000, due_date: '2026-10-15', status: 'Paid', payment_date: '2026-09-28', receipt_no: 'REC-2026-9046' }
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
      { homework_id: 'HW 002', class_batch: 'CLS 10A', subject: 'SUB 002', title: 'Newtonian Dynamics Mechanics Simulation', instructions: 'Complete virtual lab friction parameters chart.', due_date: 'Friday 11:59 PM', assigned_by: 'TEA 002' },
      { homework_id: 'HW 003', class_batch: 'CLS 10A', subject: 'SUB 003', title: 'Python Recursion & Linked Lists Exercise', instructions: 'Write recursive solutions for binary tree traversal and submit code file.', due_date: 'Monday 10:00 AM', assigned_by: 'TEA 003' }
    ]
  },

  'Homework Submissions': {
    columns: [
      { name: 'submission_id', type: 'VARCHAR(50)', pk: 1 },
      { name: 'homework_id', type: 'VARCHAR(50) [Link to Homework List]', pk: 0 },
      { name: 'student_id', type: 'VARCHAR(50) [Link to Student List]', pk: 0 },
      { name: 'student_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'submission_text', type: 'TEXT', pk: 0 },
      { name: 'attachment_url', type: 'VARCHAR(255)', pk: 0 },
      { name: 'submitted_at', type: 'VARCHAR(50)', pk: 0 },
      { name: 'status', type: 'VARCHAR(50)', pk: 0 },
      { name: 'marks_awarded', type: 'INT', pk: 0 },
      { name: 'teacher_feedback', type: 'TEXT', pk: 0 }
    ],
    rows: [
      { submission_id: 'SUBM-001', homework_id: 'HW 001', student_id: 'STU-001', student_name: 'Nairee Patel', submission_text: 'Attached solved PDF for Trigonometric Integrals Exercise 4.2 with verified derivatives.', attachment_url: 'https://cdn.nairee.edu/uploads/trig_ex_4_2_nairee.pdf', submitted_at: '2026-10-03 04:30 PM', status: 'Graded', marks_awarded: 100, teacher_feedback: 'Flawless proofs and neat layout!' },
      { submission_id: 'SUBM-002', homework_id: 'HW 002', student_id: 'STU-001', student_name: 'Nairee Patel', submission_text: 'Completed interactive simulation friction parameter table.', attachment_url: 'https://cdn.nairee.edu/uploads/newtonian_sim_nairee.pdf', submitted_at: '2026-10-04 02:15 PM', status: 'Submitted', marks_awarded: null, teacher_feedback: '' }
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
      { parent_id: 'PAR 001', name: 'Rajesh Patel', phone: '+91 98765 43212', email: 'rpatel@family.com', child: 'STU-001', relationship: 'Father', children_ids: ['STU-001', 'STU-008'] },
      { parent_id: 'PAR 002', name: 'Sunita Sharma', phone: '+91 98765 43215', email: 'sunita.sharma@family.com', child: 'STU-002', relationship: 'Mother', children_ids: ['STU-002'] },
      { parent_id: 'PAR 003', name: 'Vikram Gupta', phone: '+91 98765 43216', email: 'vikram.gupta@family.com', child: 'STU-003', relationship: 'Father', children_ids: ['STU-003'] }
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

  'Transfer Certificates': {
    columns: [
      { name: 'tc_id', type: 'VARCHAR(50)', pk: 1 },
      { name: 'student_id', type: 'VARCHAR(50)', pk: 0 },
      { name: 'student_name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'class_batch', type: 'VARCHAR(50)', pk: 0 },
      { name: 'leaving_date', type: 'DATE', pk: 0 },
      { name: 'reason', type: 'VARCHAR(255)', pk: 0 },
      { name: 'conduct', type: 'VARCHAR(50)', pk: 0 },
      { name: 'status', type: 'VARCHAR(50)', pk: 0 }
    ],
    rows: [
      { tc_id: 'TC-2026-001', student_id: 'STU-007', student_name: 'Sameer Kulkarni', class_batch: 'Class 10 - Section B', leaving_date: '2026-08-30', reason: 'Parent Relocated to Mumbai', conduct: 'Exemplary', status: 'Issued' }
    ]
  },

  'Alumni Network': {
    columns: [
      { name: 'alumni_id', type: 'VARCHAR(50)', pk: 1 },
      { name: 'name', type: 'VARCHAR(255)', pk: 0 },
      { name: 'passing_year', type: 'VARCHAR(20)', pk: 0 },
      { name: 'higher_education', type: 'VARCHAR(255)', pk: 0 },
      { name: 'current_profession', type: 'VARCHAR(255)', pk: 0 },
      { name: 'email', type: 'VARCHAR(255)', pk: 0 }
    ],
    rows: [
      { alumni_id: 'ALUM-2025-01', name: 'Tanvi Deshmukh', passing_year: 'Batch of 2025', higher_education: 'B.Tech Computer Science, IIT Bombay', current_profession: 'AI Research Intern', email: 'tanvi.deshmukh@alumni.nairee.edu' },
      { alumni_id: 'ALUM-2024-02', name: 'Karan Mehra', passing_year: 'Batch of 2024', higher_education: 'MBBS, AIIMS New Delhi', current_profession: 'Medical Scholar', email: 'karan.mehra@alumni.nairee.edu' }
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
INITIAL_DB_STORE['tabAttendance'] = INITIAL_DB_STORE['Attendance Records'];
INITIAL_DB_STORE['tabTeacherAttendance'] = INITIAL_DB_STORE['Teacher Attendance'];
INITIAL_DB_STORE['tabAssessmentPlan'] = INITIAL_DB_STORE['Assessment Plans'];
INITIAL_DB_STORE['tabAssessmentResult'] = INITIAL_DB_STORE['Assessment Results'];
INITIAL_DB_STORE['tabFeeInvoice'] = INITIAL_DB_STORE['Fee Invoices & Ledger'];
INITIAL_DB_STORE['tabHomework'] = INITIAL_DB_STORE['Homework List'];
INITIAL_DB_STORE['tabHomeworkSubmission'] = INITIAL_DB_STORE['Homework Submissions'];
INITIAL_DB_STORE['tabAdmin'] = INITIAL_DB_STORE['Admin List'];
INITIAL_DB_STORE['tabTransferCertificate'] = INITIAL_DB_STORE['Transfer Certificates'];
INITIAL_DB_STORE['tabAlumni'] = INITIAL_DB_STORE['Alumni Network'];

// Synchronized Fallback Object mapped directly to master tables
export const FALLBACK_DATA = {
  users: [
    { id: 'admin 1', username: 'admin', full_name: 'Dr. Marcus Vance', role: 'admin', email: 'admin@nairee.edu', status: 'Active', department: 'Executive Board', phone: '+91 98765 43210' },
    { id: 'teacher 1', username: 'teacher_jenkins', full_name: 'Prof. Sarah Jenkins', role: 'teacher', email: 'sjenkins@nairee.edu', status: 'Active', department: 'Mathematics & Science', phone: '+91 98765 43211', teacher_number: 'TEA 001' },
    { id: 'STU-001', username: 'nairee', full_name: 'Nairee Patel', role: 'student', email: 'syalfreelance@gmail.com', status: 'Active', batch_name: 'Class 10 - Section A', roll_number: '101', student_id: 'STU-001' },
    { id: 'STU-002', username: 'aarav', full_name: 'Aarav Sharma', role: 'student', email: 'aarav.sharma@example.com', status: 'Active', batch_name: 'Class 10 - Section A', roll_number: '102', student_id: 'STU-002' },
    { id: 'parent 1', username: 'parent_patel', full_name: 'Rajesh Patel', role: 'parent', email: 'rpatel@family.com', status: 'Active', phone: '+91 98765 43212', children: [{ id: 'STU-001', name: 'Nairee Patel', class_batch: 'Class 10 - Section A' }, { id: 'STU-008', name: 'Riya Patel', class_batch: 'Class 6 - Section A' }] }
  ],
  stats: {
    total_students: 840,
    total_teachers: 48,
    attendance_rate: '96.4%',
    fee_collection_rate: '94.2%',
    active_courses: 14,
    pending_homework: 3
  },
  schedule: [
    { id: 'SCH 01', day: 'Monday', time_slot: '08:30 AM to 09:30 AM', course_name: 'Advanced Mathematics', instructor: 'Prof. Sarah Jenkins', room: 'Room 204' },
    { id: 'SCH 02', day: 'Monday', time_slot: '09:40 AM to 10:40 AM', course_name: 'Physics & Dynamics', instructor: 'Dr. Evelyn Reed', room: 'Lab 2' },
    { id: 'SCH 03', day: 'Tuesday', time_slot: '08:30 AM to 09:30 AM', course_name: 'Computer Science & AI', instructor: 'Mr. Robert Chen', room: 'Lab 1' }
  ],
  syllabus: [
    { id: 'SYL 01', subject: 'Mathematics', topic: 'Quadratic Equations & Polynomials', total_topics: 10, completed_topics: 8, status: 'In Progress' },
    { id: 'SYL 02', subject: 'Physics', topic: 'Electromagnetism & Waves', total_topics: 8, completed_topics: 6, status: 'In Progress' },
    { id: 'SYL 03', subject: 'Computer Science', topic: 'Data Structures & Recursion', total_topics: 12, completed_topics: 9, status: 'In Progress' }
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

// Backward compatibility export aliases mapped directly to master tables
export const FALLBACK_STUDENTS = INITIAL_DB_STORE['Student List'].rows.map(s => ({
  name: s.student_id,
  student_name: s.name,
  roll_no: s.roll_no,
  student_batch: s.class_batch,
  guardian_name: s.father_name || s.mother_name || 'Guardian',
  guardian_mobile: s.father_phone || s.mother_phone || s.phone,
  attendancePct: 98,
  avgGrade: 96,
  feeDues: s.fee_status === 'Paid' ? 0 : 35000,
  fee_status: s.fee_status
}));

export const FALLBACK_FACULTY = INITIAL_DB_STORE['Teacher List'].rows.map(t => ({
  name: t.teacher_number,
  full_name: t.name,
  department: t.department,
  designation: t.designation,
  email: t.email,
  salary: t.monthly_salary
}));

export const FALLBACK_BATCHES = INITIAL_DB_STORE['Class & Batch List'].rows.map(b => ({
  name: b.batch_id,
  batch_name: b.batch_name,
  grade_level: b.batch_name.split('-')[0]?.trim() || 'Grade 10',
  section: b.batch_name.split('Section')[1]?.trim() || 'A',
  class_teacher: b.class_teacher,
  room_no: b.room_no
}));
