import { db, initDatabase } from './db.js';

export async function seedDatabase() {
  await initDatabase();

  console.log('Seeding Frappe Education database with realistic school data...');

  // Clear existing data cleanly
  await db.exec(`
    DELETE FROM tabMessage;
    DELETE FROM tabTransportRoute;
    DELETE FROM tabAnnouncement;
    DELETE FROM tabStudyMaterial;
    DELETE FROM tabHomeworkSubmission;
    DELETE FROM tabHomework;
    DELETE FROM tabSyllabus;
    DELETE FROM tabUser;
    DELETE FROM tabParentStudent;
    DELETE FROM tabParent;
    DELETE FROM tabFeeComponent;
    DELETE FROM tabFees;
    DELETE FROM tabAssessmentResult;
    DELETE FROM tabAssessmentPlan;
    DELETE FROM tabStudentAttendance;
    DELETE FROM tabSubjectSchedule;
    DELETE FROM tabGuardian;
    DELETE FROM tabStudent;
    DELETE FROM tabFaculty;
    DELETE FROM tabStudentBatch;
    DELETE FROM tabCourse;
    DELETE FROM tabProgram;
  `);

  // 1. Programs
  await db.run(`
    INSERT INTO tabProgram (name, program_name, department, description) VALUES
    ('PROG-HIGH-SCH', 'Senior High School Diploma', 'Secondary Education', 'Comprehensive high school curriculum with STEM & Arts streams'),
    ('PROG-STEM-TECH', 'STEM & Applied Computing', 'Computer Science & Tech', 'Specialized program focusing on Mathematics, Computing, and Physical Sciences')
  `);

  // 2. Courses
  await db.run(`
    INSERT INTO tabCourse (name, course_name, course_code, department, description) VALUES
    ('CRS-MATH-10', 'Advanced Mathematics', 'MATH-101', 'Mathematics', 'Calculus fundamentals, linear algebra, and trigonometry'),
    ('CRS-CS-10', 'Computer Science & Web Tech', 'CS-102', 'Computer Science', 'Modern programming concepts, web technologies, and algorithms'),
    ('CRS-PHY-10', 'Physics & Experimental Dynamics', 'PHY-103', 'Science', 'Classical mechanics, thermodynamics, and laboratory experiments'),
    ('CRS-CHEM-10', 'Organic & Inorganic Chemistry', 'CHEM-104', 'Science', 'Chemical bonding, molecular reactions, and lab techniques'),
    ('CRS-ENG-10', 'English Language & World Literature', 'ENG-105', 'Humanities', 'Rhetoric, composition, and classic/modern literature analysis'),
    ('CRS-BIO-10', 'Cellular Biology & Genetics', 'BIO-106', 'Science', 'Genetics, microbiology, and human physiology')
  `);

  // 3. Batches
  await db.run(`
    INSERT INTO tabStudentBatch (name, batch_name, program, academic_year, academic_term) VALUES
    ('BATCH-10A-2026', 'Grade 10-A (Honors)', 'PROG-STEM-TECH', '2026-2027', 'Term 1'),
    ('BATCH-10B-2026', 'Grade 10-B (Standard)', 'PROG-HIGH-SCH', '2026-2027', 'Term 1'),
    ('BATCH-11A-2026', 'Grade 11-A (Advanced)', 'PROG-STEM-TECH', '2026-2027', 'Term 1')
  `);

  // 4. Faculty
  await db.run(`
    INSERT INTO tabFaculty (name, faculty_name, email, department, designation, mobile_number, image) VALUES
    ('EDU-FAC-2026-00001', 'Dr. Robert Anderson', 'r.anderson@school.edu', 'Science', 'Senior Physics Professor & Lab Director', '+1 (555) 234-5678', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
    ('EDU-FAC-2026-00002', 'Prof. Sarah Jenkins', 's.jenkins@school.edu', 'Mathematics', 'Head of Mathematics Department', '+1 (555) 345-6789', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
    ('EDU-FAC-2026-00003', 'Ms. Elena Rostova', 'e.rostova@school.edu', 'Computer Science', 'Lead Computer Science Instructor', '+1 (555) 456-7890', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'),
    ('EDU-FAC-2026-00004', 'Mr. David Miller', 'd.miller@school.edu', 'Humanities', 'Literature & Creative Writing Faculty', '+1 (555) 567-8901', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')
  `);

  // 5. Students
  const students = [
    {
      name: 'EDU-STU-2026-00001',
      first_name: 'Nairee',
      middle_name: '',
      last_name: 'Patel',
      student_name: 'Nairee Patel',
      student_email_id: 'nairee.patel@student.school.edu',
      student_mobile_number: '+1 (555) 019-2831',
      date_of_birth: '2010-04-18',
      gender: 'Female',
      blood_group: 'O+',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      joining_date: '2024-09-01',
      student_batch: 'BATCH-10A-2026',
      roll_no: '101',
      status: 'Active',
      address_line_1: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      pincode: '62704',
      country: 'United States'
    },
    {
      name: 'EDU-STU-2026-00002',
      first_name: 'Aarav',
      middle_name: 'K.',
      last_name: 'Sharma',
      student_name: 'Aarav Sharma',
      student_email_id: 'aarav.sharma@student.school.edu',
      student_mobile_number: '+1 (555) 019-3321',
      date_of_birth: '2010-06-12',
      gender: 'Male',
      blood_group: 'B+',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
      joining_date: '2024-09-01',
      student_batch: 'BATCH-10A-2026',
      roll_no: '102',
      status: 'Active',
      address_line_1: '124 Conch Street',
      city: 'Springfield',
      state: 'IL',
      pincode: '62704',
      country: 'United States'
    },
    {
      name: 'EDU-STU-2026-00003',
      first_name: 'Maya',
      middle_name: '',
      last_name: 'Lin',
      student_name: 'Maya Lin',
      student_email_id: 'maya.lin@student.school.edu',
      student_mobile_number: '+1 (555) 019-8742',
      date_of_birth: '2010-09-24',
      gender: 'Female',
      blood_group: 'A+',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
      joining_date: '2024-09-01',
      student_batch: 'BATCH-10A-2026',
      roll_no: '103',
      status: 'Active',
      address_line_1: '522 Elm Boulevard',
      city: 'Springfield',
      state: 'IL',
      pincode: '62704',
      country: 'United States'
    },
    {
      name: 'EDU-STU-2026-00004',
      first_name: 'Jordan',
      middle_name: 'Lee',
      last_name: 'Taylor',
      student_name: 'Jordan Taylor',
      student_email_id: 'jordan.taylor@student.school.edu',
      student_mobile_number: '+1 (555) 019-5561',
      date_of_birth: '2010-02-15',
      gender: 'Non-Binary',
      blood_group: 'AB+',
      image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200',
      joining_date: '2024-09-01',
      student_batch: 'BATCH-10A-2026',
      roll_no: '104',
      status: 'Active',
      address_line_1: '89 Maple Avenue',
      city: 'Springfield',
      state: 'IL',
      pincode: '62704',
      country: 'United States'
    },
    {
      name: 'EDU-STU-2026-00005',
      first_name: 'Lucas',
      middle_name: 'G.',
      last_name: 'Martinez',
      student_name: 'Lucas Martinez',
      student_email_id: 'lucas.martinez@student.school.edu',
      student_mobile_number: '+1 (555) 019-6612',
      date_of_birth: '2010-11-05',
      gender: 'Male',
      blood_group: 'O-',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
      joining_date: '2024-09-01',
      student_batch: 'BATCH-10A-2026',
      roll_no: '105',
      status: 'Active',
      address_line_1: '310 Oak Ridge Path',
      city: 'Springfield',
      state: 'IL',
      pincode: '62704',
      country: 'United States'
    },
    {
      name: 'EDU-STU-2026-00006',
      first_name: 'Sophia',
      middle_name: '',
      last_name: 'Williams',
      student_name: 'Sophia Williams',
      student_email_id: 'sophia.w@student.school.edu',
      student_mobile_number: '+1 (555) 019-7788',
      date_of_birth: '2010-07-30',
      gender: 'Female',
      blood_group: 'A-',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      joining_date: '2024-09-01',
      student_batch: 'BATCH-10B-2026',
      roll_no: '106',
      status: 'Active',
      address_line_1: '402 Sunset Boulevard',
      city: 'Springfield',
      state: 'IL',
      pincode: '62704',
      country: 'United States'
    },
    {
      name: 'EDU-STU-2026-00007',
      first_name: 'Rohan',
      middle_name: 'R.',
      last_name: 'Patel',
      student_name: 'Rohan Patel',
      student_email_id: 'rohan.patel@student.school.edu',
      student_mobile_number: '+1 (555) 019-9912',
      date_of_birth: '2011-08-14',
      gender: 'Male',
      blood_group: 'O+',
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200',
      joining_date: '2025-09-01',
      student_batch: 'BATCH-10B-2026',
      roll_no: '107',
      status: 'Active',
      address_line_1: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      pincode: '62704',
      country: 'United States'
    }
  ];

  for (const s of students) {
    await db.run(`
      INSERT INTO tabStudent (
        name, first_name, middle_name, last_name, student_name, student_email_id,
        student_mobile_number, date_of_birth, gender, blood_group, image, joining_date,
        student_batch, roll_no, status, address_line_1, city, state, pincode, country
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      s.name, s.first_name, s.middle_name, s.last_name, s.student_name, s.student_email_id,
      s.student_mobile_number, s.date_of_birth, s.gender, s.blood_group, s.image, s.joining_date,
      s.student_batch, s.roll_no, s.status, s.address_line_1, s.city, s.state, s.pincode, s.country
    ]);
  }

  // 6. Guardians
  await db.run(`
    INSERT INTO tabGuardian (student, guardian_name, relation, email_address, mobile_number) VALUES
    ('EDU-STU-2026-00001', 'Rajesh Patel', 'Father', 'rajesh.patel@gmail.com', '+1 (555) 901-2234'),
    ('EDU-STU-2026-00001', 'Ananya Patel', 'Mother', 'ananya.patel@gmail.com', '+1 (555) 901-2235'),
    ('EDU-STU-2026-00002', 'Vikram Sharma', 'Father', 'v.sharma@gmail.com', '+1 (555) 902-3345'),
    ('EDU-STU-2026-00003', 'Hao Lin', 'Father', 'hao.lin@gmail.com', '+1 (555) 903-4456')
  `);

  // 7. Subject Schedules (Timetable)
  const schedules = [
    // Monday
    { name: 'SCH-MON-01', batch: 'BATCH-10A-2026', fac: 'EDU-FAC-2026-00002', fac_name: 'Prof. Sarah Jenkins', crs: 'CRS-MATH-10', sub: 'Mathematics', rm: 'Room 204', day: 'Monday', from: '08:30:00', to: '10:00:00', col: '#4F46E5', title: 'Calculus & Functions' },
    { name: 'SCH-MON-02', batch: 'BATCH-10A-2026', fac: 'EDU-FAC-2026-00003', fac_name: 'Ms. Elena Rostova', crs: 'CRS-CS-10', sub: 'Computer Science', rm: 'Lab B', day: 'Monday', from: '10:15:00', to: '11:45:00', col: '#0EA5E9', title: 'Fullstack App Architectures' },
    { name: 'SCH-MON-03', batch: 'BATCH-10A-2026', fac: 'EDU-FAC-2026-00001', fac_name: 'Dr. Robert Anderson', crs: 'CRS-PHY-10', sub: 'Physics', rm: 'Physics Lab 1', day: 'Monday', from: '12:30:00', to: '14:00:00', col: '#10B981', title: 'Electromagnetism Lab' },
    { name: 'SCH-MON-04', batch: 'BATCH-10A-2026', fac: 'EDU-FAC-2026-00004', fac_name: 'Mr. David Miller', crs: 'CRS-ENG-10', sub: 'English Literature', rm: 'Hall 101', day: 'Monday', from: '14:15:00', to: '15:30:00', col: '#F59E0B', title: 'Critical Essay Seminar' },

    // Tuesday
    { name: 'SCH-TUE-01', batch: 'BATCH-10A-2026', fac: 'EDU-FAC-2026-00001', fac_name: 'Dr. Robert Anderson', crs: 'CRS-PHY-10', sub: 'Physics', rm: 'Physics Lab 1', day: 'Tuesday', from: '08:30:00', to: '10:00:00', col: '#10B981', title: 'Optics & Wave Motion' },
    { name: 'SCH-TUE-02', batch: 'BATCH-10A-2026', fac: 'EDU-FAC-2026-00002', fac_name: 'Prof. Sarah Jenkins', crs: 'CRS-MATH-10', sub: 'Mathematics', rm: 'Room 204', day: 'Tuesday', from: '10:15:00', to: '11:45:00', col: '#4F46E5', title: 'Trigonometric Identities' },
    { name: 'SCH-TUE-03', batch: 'BATCH-10A-2026', fac: 'EDU-FAC-2026-00003', fac_name: 'Ms. Elena Rostova', crs: 'CRS-CS-10', sub: 'Computer Science', rm: 'Lab B', day: 'Tuesday', from: '12:30:00', to: '14:00:00', col: '#0EA5E9', title: 'Database Systems & SQL' },

    // Wednesday
    { name: 'SCH-WED-01', batch: 'BATCH-10A-2026', fac: 'EDU-FAC-2026-00003', fac_name: 'Ms. Elena Rostova', crs: 'CRS-CS-10', sub: 'Computer Science', rm: 'Lab B', day: 'Wednesday', from: '08:30:00', to: '10:00:00', col: '#0EA5E9', title: 'Mobile App Engineering' },
    { name: 'SCH-WED-02', batch: 'BATCH-10A-2026', fac: 'EDU-FAC-2026-00002', fac_name: 'Prof. Sarah Jenkins', crs: 'CRS-MATH-10', sub: 'Mathematics', rm: 'Room 204', day: 'Wednesday', from: '10:15:00', to: '11:45:00', col: '#4F46E5', title: 'Probability & Statistics' },
    { name: 'SCH-WED-03', batch: 'BATCH-10A-2026', fac: 'EDU-FAC-2026-00004', fac_name: 'Mr. David Miller', crs: 'CRS-ENG-10', sub: 'English Literature', rm: 'Hall 101', day: 'Wednesday', from: '12:30:00', to: '14:00:00', col: '#F59E0B', title: 'Poetry & Rhetoric' },

    // Thursday
    { name: 'SCH-THU-01', batch: 'BATCH-10A-2026', fac: 'EDU-FAC-2026-00001', fac_name: 'Dr. Robert Anderson', crs: 'CRS-PHY-10', sub: 'Physics', rm: 'Physics Lab 1', day: 'Thursday', from: '08:30:00', to: '10:00:00', col: '#10B981', title: 'Thermodynamics & Heat' },
    { name: 'SCH-THU-02', batch: 'BATCH-10A-2026', fac: 'EDU-FAC-2026-00003', fac_name: 'Ms. Elena Rostova', crs: 'CRS-CS-10', sub: 'Computer Science', rm: 'Lab B', day: 'Thursday', from: '10:15:00', to: '11:45:00', col: '#0EA5E9', title: 'Algorithms & Data Structures' },
    { name: 'SCH-THU-03', batch: 'BATCH-10A-2026', fac: 'EDU-FAC-2026-00002', fac_name: 'Prof. Sarah Jenkins', crs: 'CRS-MATH-10', sub: 'Mathematics', rm: 'Room 204', day: 'Thursday', from: '12:30:00', to: '14:00:00', col: '#4F46E5', title: 'Matrix Algebra Problem Solving' },

    // Friday
    { name: 'SCH-FRI-01', batch: 'BATCH-10A-2026', fac: 'EDU-FAC-2026-00003', fac_name: 'Ms. Elena Rostova', crs: 'CRS-CS-10', sub: 'Computer Science', rm: 'Lab B', day: 'Friday', from: '08:30:00', to: '10:00:00', col: '#0EA5E9', title: 'Project Exhibition & Code Review' },
    { name: 'SCH-FRI-02', batch: 'BATCH-10A-2026', fac: 'EDU-FAC-2026-00001', fac_name: 'Dr. Robert Anderson', crs: 'CRS-PHY-10', sub: 'Physics', rm: 'Physics Lab 1', day: 'Friday', from: '10:15:00', to: '11:45:00', col: '#10B981', title: 'Physics Research Seminar' }
  ];

  for (const sc of schedules) {
    await db.run(`
      INSERT INTO tabSubjectSchedule (
        name, student_batch, faculty, faculty_name, course, subject, room, day_of_week, from_time, to_time, color, title
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [sc.name, sc.batch, sc.fac, sc.fac_name, sc.crs, sc.sub, sc.rm, sc.day, sc.from, sc.to, sc.col, sc.title]);
  }

  // 8. Attendance Records
  // Generate historical attendance for the last 5 days for Grade 10-A students
  const dates = ['2026-09-24', '2026-09-25', '2026-09-26', '2026-09-29', '2026-09-30'];
  let attCount = 1;
  const batchStudents = students.filter(s => s.student_batch === 'BATCH-10A-2026');

  for (const date of dates) {
    for (const st of batchStudents) {
      // Nairee is always Present; others have realistic variance
      let status = 'Present';
      if (st.name === 'EDU-STU-2026-00004' && date === '2026-09-25') status = 'Absent';
      if (st.name === 'EDU-STU-2026-00002' && date === '2026-09-29') status = 'Late';
      if (st.name === 'EDU-STU-2026-00005' && date === '2026-09-26') status = 'Excused';

      const attName = `ATT-2026-${String(attCount++).padStart(5, '0')}`;
      await db.run(`
        INSERT INTO tabStudentAttendance (
          name, student, student_name, subject_schedule, student_batch, date, status, remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [attName, st.name, st.student_name, 'SCH-MON-01', st.student_batch, date, status, status === 'Present' ? 'On time' : status]);
    }
  }

  // 9. Assessment Plans
  await db.run(`
    INSERT INTO tabAssessmentPlan (name, course, subject, assessment_name, assessment_group, academic_year, academic_term, student_batch, maximum_score, weightage) VALUES
    ('ASM-MATH-MID', 'CRS-MATH-10', 'Mathematics', 'Midterm Calculus & Algebra Exam', 'Midterm Examinations', '2026-2027', 'Term 1', 'BATCH-10A-2026', 100, 30),
    ('ASM-CS-MID', 'CRS-CS-10', 'Computer Science', 'Practical Web & Mobile Dev Project', 'Practical Examinations', '2026-2027', 'Term 1', 'BATCH-10A-2026', 100, 40),
    ('ASM-PHY-MID', 'CRS-PHY-10', 'Physics', 'Mechanics & Dynamics Theory Test', 'Midterm Examinations', '2026-2027', 'Term 1', 'BATCH-10A-2026', 100, 30),
    ('ASM-ENG-MID', 'CRS-ENG-10', 'English Literature', 'Comparative Essay Portfolio', 'Midterm Examinations', '2026-2027', 'Term 1', 'BATCH-10A-2026', 100, 25)
  `);

  // 10. Assessment Results
  const results = [
    // Nairee Patel (Top Academic Distinction)
    { plan: 'ASM-MATH-MID', crs: 'CRS-MATH-10', stu: 'EDU-STU-2026-00001', name: 'Nairee Patel', batch: 'BATCH-10A-2026', score: 98, max: 100, pct: 98, grade: 'A+', comment: 'Outstanding algebraic proofs and speed.' },
    { plan: 'ASM-CS-MID', crs: 'CRS-CS-10', stu: 'EDU-STU-2026-00001', name: 'Nairee Patel', batch: 'BATCH-10A-2026', score: 100, max: 100, pct: 100, grade: 'A+', comment: 'Flawless full-stack web and mobile application design.' },
    { plan: 'ASM-PHY-MID', crs: 'CRS-PHY-10', stu: 'EDU-STU-2026-00001', name: 'Nairee Patel', batch: 'BATCH-10A-2026', score: 94, max: 100, pct: 94, grade: 'A', comment: 'Exemplary mechanics lab execution.' },
    { plan: 'ASM-ENG-MID', crs: 'CRS-ENG-10', stu: 'EDU-STU-2026-00001', name: 'Nairee Patel', batch: 'BATCH-10A-2026', score: 92, max: 100, pct: 92, grade: 'A', comment: 'Insightful literary critique and vocabulary.' },

    // Aarav Sharma
    { plan: 'ASM-MATH-MID', crs: 'CRS-MATH-10', stu: 'EDU-STU-2026-00002', name: 'Aarav Sharma', batch: 'BATCH-10A-2026', score: 88, max: 100, pct: 88, grade: 'B+', comment: 'Solid understanding of core functions.' },
    { plan: 'ASM-CS-MID', crs: 'CRS-CS-10', stu: 'EDU-STU-2026-00002', name: 'Aarav Sharma', batch: 'BATCH-10A-2026', score: 91, max: 100, pct: 91, grade: 'A', comment: 'Very clean code structure.' },

    // Maya Lin
    { plan: 'ASM-MATH-MID', crs: 'CRS-MATH-10', stu: 'EDU-STU-2026-00003', name: 'Maya Lin', batch: 'BATCH-10A-2026', score: 92, max: 100, pct: 92, grade: 'A', comment: 'Great geometric reasoning.' },
    { plan: 'ASM-CS-MID', crs: 'CRS-CS-10', stu: 'EDU-STU-2026-00003', name: 'Maya Lin', batch: 'BATCH-10A-2026', score: 95, max: 100, pct: 95, grade: 'A+', comment: 'Creative and interactive frontend work.' },

    // Jordan Taylor
    { plan: 'ASM-MATH-MID', crs: 'CRS-MATH-10', stu: 'EDU-STU-2026-00004', name: 'Jordan Taylor', batch: 'BATCH-10A-2026', score: 82, max: 100, pct: 82, grade: 'B', comment: 'Good effort, review polynomial factorization.' },
    { plan: 'ASM-CS-MID', crs: 'CRS-CS-10', stu: 'EDU-STU-2026-00004', name: 'Jordan Taylor', batch: 'BATCH-10A-2026', score: 87, max: 100, pct: 87, grade: 'B+', comment: 'Solid algorithmic implementation.' },

    // Rohan Patel
    { plan: 'ASM-MATH-MID', crs: 'CRS-MATH-10', stu: 'EDU-STU-2026-00007', name: 'Rohan Patel', batch: 'BATCH-10B-2026', score: 88, max: 100, pct: 88, grade: 'B+', comment: 'Very solid work on geometric proofs.' }
  ];

  let resCount = 1;
  for (const r of results) {
    const resName = `EDU-RES-2026-${String(resCount++).padStart(5, '0')}`;
    await db.run(`
      INSERT INTO tabAssessmentResult (
        name, assessment_plan, course, student, student_name, student_batch, score, maximum_score, percentage, grade, comment
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [resName, r.plan, r.crs, r.stu, r.name, r.batch, r.score, r.max, r.pct, r.grade, r.comment]);
  }

  // 11. Fees and Invoices
  const feesList = [
    {
      name: 'EDU-FEE-2026-00001',
      student: 'EDU-STU-2026-00001',
      student_name: 'Nairee Patel',
      program: 'PROG-STEM-TECH',
      batch: 'BATCH-10A-2026',
      year: '2026-2027',
      term: 'Term 1',
      posting: '2026-09-01',
      due: '2026-09-20',
      total: 1450.00,
      outstanding: 0.00,
      status: 'Paid',
      payment_date: '2026-09-15',
      payment_method: 'Credit Card / Stripe',
      receipt: 'REC-2026-90412',
      components: [
        { cat: 'Tuition Fee', desc: 'Term 1 Academic Tuition', amt: 1000.00 },
        { cat: 'Laboratory Fee', desc: 'STEM Computing & Physics Lab Access', amt: 250.00 },
        { cat: 'Library & Digital Resources', desc: 'E-Library and Software Licenses', amt: 100.00 },
        { cat: 'Student Activities', desc: 'Athletics & Club Membership', amt: 100.00 }
      ]
    },
    {
      name: 'EDU-FEE-2026-00002',
      student: 'EDU-STU-2026-00001',
      student_name: 'Nairee Patel',
      program: 'PROG-STEM-TECH',
      batch: 'BATCH-10A-2026',
      year: '2026-2027',
      term: 'Term 2',
      posting: '2026-10-01',
      due: '2026-10-25',
      total: 1450.00,
      outstanding: 1450.00,
      status: 'Unpaid',
      payment_date: null,
      payment_method: null,
      receipt: null,
      components: [
        { cat: 'Tuition Fee', desc: 'Term 2 Academic Tuition', amt: 1000.00 },
        { cat: 'Laboratory Fee', desc: 'STEM Computing & Physics Lab Access', amt: 250.00 },
        { cat: 'Library & Digital Resources', desc: 'E-Library and Software Licenses', amt: 100.00 },
        { cat: 'Student Activities', desc: 'Athletics & Club Membership', amt: 100.00 }
      ]
    },
    {
      name: 'EDU-FEE-2026-00003',
      student: 'EDU-STU-2026-00002',
      student_name: 'Aarav Sharma',
      program: 'PROG-STEM-TECH',
      batch: 'BATCH-10A-2026',
      year: '2026-2027',
      term: 'Term 1',
      posting: '2026-09-01',
      due: '2026-09-20',
      total: 1450.00,
      outstanding: 0.00,
      status: 'Paid',
      payment_date: '2026-09-18',
      payment_method: 'Bank Wire',
      receipt: 'REC-2026-90413',
      components: [
        { cat: 'Tuition Fee', desc: 'Term 1 Academic Tuition', amt: 1000.00 },
        { cat: 'Laboratory Fee', desc: 'STEM Computing & Physics Lab Access', amt: 250.00 },
        { cat: 'Library & Digital Resources', desc: 'E-Library and Software Licenses', amt: 100.00 },
        { cat: 'Student Activities', desc: 'Athletics & Club Membership', amt: 100.00 }
      ]
    },
    {
      name: 'EDU-FEE-2026-00004',
      student: 'EDU-STU-2026-00004',
      student_name: 'Jordan Taylor',
      program: 'PROG-STEM-TECH',
      batch: 'BATCH-10A-2026',
      year: '2026-2027',
      term: 'Term 1',
      posting: '2026-08-15',
      due: '2026-09-01',
      total: 1350.00,
      outstanding: 1350.00,
      status: 'Overdue',
      payment_date: null,
      payment_method: null,
      receipt: null,
      components: [
        { cat: 'Tuition Fee', desc: 'Term 1 Academic Tuition', amt: 1000.00 },
        { cat: 'Laboratory Fee', desc: 'STEM Computing & Physics Lab Access', amt: 200.00 },
        { cat: 'Library & Digital Resources', desc: 'E-Library Access', amt: 75.00 },
        { cat: 'Late Fee Surcharge', desc: 'Grace Period Expired', amt: 75.00 }
      ]
    }
  ];

  for (const fee of feesList) {
    await db.run(`
      INSERT INTO tabFees (
        name, student, student_name, program, student_batch, academic_year, academic_term,
        posting_date, due_date, grand_total, outstanding_amount, status, payment_date, payment_method, receipt_no
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      fee.name, fee.student, fee.student_name, fee.program, fee.batch, fee.year, fee.term,
      fee.posting, fee.due, fee.total, fee.outstanding, fee.status, fee.payment_date, fee.payment_method, fee.receipt
    ]);

    for (const comp of fee.components) {
      await db.run(`
        INSERT INTO tabFeeComponent (parent, fee_category, description, amount)
        VALUES (?, ?, ?, ?)
      `, [fee.name, comp.cat, comp.desc, comp.amt]);
    }
  }

  // 11. Parents & Multi-Child Linkage
  await db.run(`
    INSERT INTO tabParent (name, parent_name, relation, email, mobile_number, occupation) VALUES
    ('PAR-001', 'Rajesh Patel', 'Father', 'rajesh.patel@gmail.com', '+1 (555) 901-2234', 'Software Engineering Director'),
    ('PAR-002', 'Vikram Sharma', 'Father', 'v.sharma@gmail.com', '+1 (555) 902-3345', 'Architectural Consultant')
  `);

  await db.run(`
    INSERT INTO tabParentStudent (parent, student, relationship) VALUES
    ('PAR-001', 'EDU-STU-2026-00001', 'Father'),
    ('PAR-001', 'EDU-STU-2026-00007', 'Father'),
    ('PAR-002', 'EDU-STU-2026-00002', 'Father')
  `);

  // 12. Authentication Users (tabUser)
  // Demo accounts for each role:
  // Admin: admin / admin123
  // Teacher: teacher_jenkins / teacher123, teacher_anderson / teacher123
  // Student: nairee / student123, aarav / student123
  // Parent: parent_patel / parent123, parent_sharma / parent123
  await db.run(`
    INSERT INTO tabUser (name, username, password, role, full_name, email, phone, linked_id, status) VALUES
    ('USR-001', 'admin', 'admin123', 'admin', 'Dr. Marcus Vance (Principal)', 'principal@school.edu', '+1 (555) 100-2000', NULL, 'Active'),
    ('USR-002', 'teacher_jenkins', 'teacher123', 'teacher', 'Prof. Sarah Jenkins', 's.jenkins@school.edu', '+1 (555) 345-6789', 'EDU-FAC-2026-00002', 'Active'),
    ('USR-003', 'teacher_anderson', 'teacher123', 'teacher', 'Dr. Robert Anderson', 'r.anderson@school.edu', '+1 (555) 234-5678', 'EDU-FAC-2026-00001', 'Active'),
    ('USR-004', 'nairee', 'student123', 'student', 'Nairee Patel', 'nairee.patel@student.school.edu', '+1 (555) 019-2831', 'EDU-STU-2026-00001', 'Active'),
    ('USR-005', 'aarav', 'student123', 'student', 'Aarav Sharma', 'aarav.sharma@student.school.edu', '+1 (555) 019-3321', 'EDU-STU-2026-00002', 'Active'),
    ('USR-006', 'parent_patel', 'parent123', 'parent', 'Rajesh Patel', 'rajesh.patel@gmail.com', '+1 (555) 901-2234', 'PAR-001', 'Active'),
    ('USR-007', 'parent_sharma', 'parent123', 'parent', 'Vikram Sharma', 'v.sharma@gmail.com', '+1 (555) 902-3345', 'PAR-002', 'Active')
  `);

  // 13. Syllabus Tracking
  const syllabusItems = [
    { course: 'CRS-MATH-10', subject: 'Mathematics', batch: 'BATCH-10A-2026', ch: 1, title: 'Unit 1: Functions, Sequences & Polynomial Limits', tot: 10, comp: 10, status: 'Completed', fac: 'EDU-FAC-2026-00002', fac_name: 'Prof. Sarah Jenkins' },
    { course: 'CRS-MATH-10', subject: 'Mathematics', batch: 'BATCH-10A-2026', ch: 2, title: 'Unit 2: Differential Calculus & Chain Rule', tot: 12, comp: 10, status: 'In Progress', fac: 'EDU-FAC-2026-00002', fac_name: 'Prof. Sarah Jenkins' },
    { course: 'CRS-MATH-10', subject: 'Mathematics', batch: 'BATCH-10A-2026', ch: 3, title: 'Unit 3: Integral Calculus & Area Under Curves', tot: 14, comp: 4, status: 'In Progress', fac: 'EDU-FAC-2026-00002', fac_name: 'Prof. Sarah Jenkins' },
    { course: 'CRS-MATH-10', subject: 'Mathematics', batch: 'BATCH-10A-2026', ch: 4, title: 'Unit 4: Linear Algebra, Matrices & Determinants', tot: 10, comp: 0, status: 'Upcoming', fac: 'EDU-FAC-2026-00002', fac_name: 'Prof. Sarah Jenkins' },
    { course: 'CRS-CS-10', subject: 'Computer Science', batch: 'BATCH-10A-2026', ch: 1, title: 'Module 1: Relational Data Models & SQL Joins', tot: 8, comp: 8, status: 'Completed', fac: 'EDU-FAC-2026-00003', fac_name: 'Ms. Elena Rostova' },
    { course: 'CRS-CS-10', subject: 'Computer Science', batch: 'BATCH-10A-2026', ch: 2, title: 'Module 2: RESTful Web APIs, Middleware & Express', tot: 10, comp: 9, status: 'In Progress', fac: 'EDU-FAC-2026-00003', fac_name: 'Ms. Elena Rostova' },
    { course: 'CRS-CS-10', subject: 'Computer Science', batch: 'BATCH-10A-2026', ch: 3, title: 'Module 3: React Architecture, Hooks & Global State', tot: 10, comp: 7, status: 'In Progress', fac: 'EDU-FAC-2026-00003', fac_name: 'Ms. Elena Rostova' },
    { course: 'CRS-PHY-10', subject: 'Physics', batch: 'BATCH-10A-2026', ch: 1, title: 'Section 1: Classical Mechanics & Dynamic Motion', tot: 10, comp: 10, status: 'Completed', fac: 'EDU-FAC-2026-00001', fac_name: 'Dr. Robert Anderson' },
    { course: 'CRS-PHY-10', subject: 'Physics', batch: 'BATCH-10A-2026', ch: 2, title: 'Section 2: Electromagnetism & Field Induction', tot: 12, comp: 8, status: 'In Progress', fac: 'EDU-FAC-2026-00001', fac_name: 'Dr. Robert Anderson' },
    { course: 'CRS-PHY-10', subject: 'Physics', batch: 'BATCH-10A-2026', ch: 3, title: 'Section 3: Thermodynamics & Kinetic Energy', tot: 8, comp: 0, status: 'Upcoming', fac: 'EDU-FAC-2026-00001', fac_name: 'Dr. Robert Anderson' },
    { course: 'CRS-ENG-10', subject: 'English Literature', batch: 'BATCH-10A-2026', ch: 1, title: 'Part 1: Shakespearean Dramatic Rhetoric & Sonnets', tot: 6, comp: 6, status: 'Completed', fac: 'EDU-FAC-2026-00004', fac_name: 'Mr. David Miller' },
    { course: 'CRS-ENG-10', subject: 'English Literature', batch: 'BATCH-10A-2026', ch: 2, title: 'Part 2: Modernist Essays & Expository Composition', tot: 8, comp: 5, status: 'In Progress', fac: 'EDU-FAC-2026-00004', fac_name: 'Mr. David Miller' }
  ];

  for (const s of syllabusItems) {
    await db.run(`
      INSERT INTO tabSyllabus (course, subject, student_batch, chapter_number, chapter_title, total_topics, completed_topics, status, faculty, faculty_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [s.course, s.subject, s.batch, s.ch, s.title, s.tot, s.comp, s.status, s.fac, s.fac_name]);
  }

  // 14. Homework & Assignments
  await db.run(`
    INSERT INTO tabHomework (id, title, course, subject, student_batch, faculty, faculty_name, due_date, instructions, max_points) VALUES
    (1, 'Calculus Problem Set #4: Derivative Applications & Tangents', 'CRS-MATH-10', 'Mathematics', 'BATCH-10A-2026', 'EDU-FAC-2026-00002', 'Prof. Sarah Jenkins', '2026-10-06', 'Solve questions 1 through 15 from Chapter 2 Review. Show all algebraic substitution steps.', 100),
    (2, 'Fullstack React Architecture: Build Reusable Data Table', 'CRS-CS-10', 'Computer Science', 'BATCH-10A-2026', 'EDU-FAC-2026-00003', 'Ms. Elena Rostova', '2026-10-04', 'Create a responsive React table component with search filtering, sorting, and pagination props. Include test suite.', 100),
    (3, 'Physics Lab Report: Pendulum Damping & Gravitational Constant', 'CRS-PHY-10', 'Physics', 'BATCH-10A-2026', 'EDU-FAC-2026-00001', 'Dr. Robert Anderson', '2026-10-08', 'Compile the experimental dataset from Tuesday lab, compute standard deviation and error margin.', 100)
  `);

  await db.run(`
    INSERT INTO tabHomeworkSubmission (homework_id, student, student_name, submission_text, status, score, feedback) VALUES
    (2, 'EDU-STU-2026-00001', 'Nairee Patel', 'Repository URL: https://github.com/nairee/react-data-table. Implemented clean custom hooks and memoized row filters with 98% Jest code coverage.', 'Graded', 98, 'Flawless component structure and documentation. Outstanding work Nairee!'),
    (1, 'EDU-STU-2026-00001', 'Nairee Patel', 'Completed all 15 problems. Scanned derivations and algebraic steps uploaded.', 'Submitted', NULL, 'Under review by Prof. Jenkins'),
    (2, 'EDU-STU-2026-00002', 'Aarav Sharma', 'Submitted code with pagination and multi-column sorting features.', 'Graded', 92, 'Very solid implementation, ensure cleanup in useEffect hooks.')
  `);

  // 15. Study Material / Notes
  await db.run(`
    INSERT INTO tabStudyMaterial (title, course, subject, student_batch, material_type, url, description, uploaded_by) VALUES
    ('Unit 2: Differential Calculus Complete Formula Sheet & Theorems', 'CRS-MATH-10', 'Mathematics', 'BATCH-10A-2026', 'PDF', 'https://school.edu/materials/math-unit2-derivatives.pdf', 'Essential theorems, chain rule derivations, and 25 practice problems with full step-by-step solutions.', 'Prof. Sarah Jenkins'),
    ('Clean Code in Modern Web Development & State Patterns', 'CRS-CS-10', 'Computer Science', 'BATCH-10A-2026', 'Slides', 'https://school.edu/materials/cs10-react-patterns.pdf', 'Lecture slides covering unidirectional data flow, custom hooks, and architectural scalability.', 'Ms. Elena Rostova'),
    ('Electromagnetism Experimental Simulator & Maxwell Equations Guide', 'CRS-PHY-10', 'Physics', 'BATCH-10A-2026', 'Reference Link', 'https://school.edu/materials/physics-em-simulator.html', 'Interactive 3D magnetic field simulations and laboratory reference guidelines.', 'Dr. Robert Anderson'),
    ('Modern Shakespearean Analysis & Rhetorical Devices', 'CRS-ENG-10', 'English Literature', 'BATCH-10A-2026', 'PDF', 'https://school.edu/materials/eng10-shakespeare-rhetoric.pdf', 'Comprehensive study notes on dramatic irony, meter, and classical soliloquies.', 'Mr. David Miller')
  `);

  // 16. Announcements
  await db.run(`
    INSERT INTO tabAnnouncement (title, content, category, target_role, student_batch, posted_by, priority) VALUES
    ('Term 1 Mid-Term Examination Timetable & Guidelines', 'The official timetable for Term 1 examinations has been published. Exams commence on October 14, 2026. Hall tickets will be downloadable from student and parent portals starting October 7.', 'Exam', 'All', 'All', 'Principal Dr. Marcus Vance', 'High'),
    ('Annual Inter-School STEM & Robotics Fair 2026', 'Nairee International School is proud to host the 2026 STEM Fair on November 5th. Project submissions open next week. All students are invited to register projects.', 'Event', 'All', 'All', 'Prof. Sarah Jenkins', 'Normal'),
    ('Term 1 Parent-Teacher Meeting (PTM) Schedule', 'PTM for Grade 10-A and 10-B is scheduled for Saturday, October 10th from 09:00 AM to 01:30 PM. Parents can view their scheduled consultation slot in the portal.', 'PTM', 'parent', 'BATCH-10A-2026', 'Admin Office', 'High'),
    ('Mandatory Faculty Pedagogical Council & Syllabus Alignment', 'All department heads and faculty members are requested to attend the quarterly syllabus review meeting in Boardroom A on Friday at 03:45 PM.', 'Circular', 'teacher', 'All', 'Principal Dr. Marcus Vance', 'Normal')
  `);

  // 17. Transport Routes
  await db.run(`
    INSERT INTO tabTransportRoute (student, student_name, route_name, bus_number, driver_name, driver_phone, pickup_location, pickup_time, drop_location, drop_time) VALUES
    ('EDU-STU-2026-00001', 'Nairee Patel', 'Route 04 — North City Express', 'KA-04-E-8821', 'Mr. David K.', '+1 (555) 882-1920', 'Green Valley Stop (Gate 2)', '07:35 AM', 'Green Valley Stop (Gate 2)', '03:45 PM'),
    ('EDU-STU-2026-00007', 'Rohan Patel', 'Route 04 — North City Express', 'KA-04-E-8821', 'Mr. David K.', '+1 (555) 882-1920', 'Green Valley Stop (Gate 2)', '07:35 AM', 'Green Valley Stop (Gate 2)', '03:45 PM'),
    ('EDU-STU-2026-00002', 'Aarav Sharma', 'Route 02 — Westside Runner', 'KA-02-B-4412', 'Mr. Alan Torres', '+1 (555) 441-2980', 'West Sunset Boulevard #124', '07:45 AM', 'West Sunset Boulevard #124', '03:50 PM')
  `);

  // 18. Communication Messages
  await db.run(`
    INSERT INTO tabMessage (sender_username, sender_name, sender_role, recipient_username, recipient_name, recipient_role, student_batch, subject, message, is_read) VALUES
    ('teacher_jenkins', 'Prof. Sarah Jenkins', 'teacher', 'parent_patel', 'Rajesh Patel', 'parent', 'BATCH-10A-2026', 'Commendation: Nairee’s Performance in Advanced Mathematics', 'Dear Mr. Patel, I wanted to personally congratulate you on Nairee’s exceptional performance in the Calculus unit evaluation (98%). Her problem-solving skills and discipline in class are remarkable. We are recommending her for the National STEM Olympiad.', 1),
    ('parent_patel', 'Rajesh Patel', 'parent', 'teacher_jenkins', 'Prof. Sarah Jenkins', 'teacher', 'BATCH-10A-2026', 'Re: Commendation: Nairee’s Performance in Advanced Mathematics', 'Dear Prof. Jenkins, thank you so much for the encouraging note! Nairee enjoys your classes immensely and has already begun preparing for the Olympiad problem sets. We truly appreciate your mentorship.', 1),
    ('admin', 'Dr. Marcus Vance', 'admin', NULL, 'All Parents', 'parent', 'BATCH-10A-2026', 'Welcome to Academic Term 1 & Digital Portal Access', 'Dear Parents and Guardians, welcome to Academic Term 1 at Nairee International School. We have enabled live attendance tracking, fee receipts, and syllabus progress directly through the Nairee parent portal.', 1)
  `);

  // 19. Also add fees and attendance records for Rohan Patel (child #2 for Rajesh Patel)
  await db.run(`
    INSERT INTO tabFees (
      name, student, student_name, program, student_batch, academic_year, academic_term,
      posting_date, due_date, grand_total, outstanding_amount, status, payment_date, payment_method, receipt_no
    ) VALUES (
      'EDU-FEE-2026-00005', 'EDU-STU-2026-00007', 'Rohan Patel', 'PROG-HIGH-SCH', 'BATCH-10B-2026', '2026-2027', 'Term 1',
      '2026-08-15', '2026-10-15', 1250.00, 1250.00, 'Unpaid', NULL, NULL, NULL
    )
  `);

  await db.run(`
    INSERT INTO tabFeeComponent (parent, fee_category, description, amount) VALUES
    ('EDU-FEE-2026-00005', 'Tuition Fee', 'Grade 10 Academic Tuition', 1000.00),
    ('EDU-FEE-2026-00005', 'Extracurricular & Athletics', 'Sports Equipment & Clubs', 250.00)
  `);
}

// Run directly if invoked from CLI
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
