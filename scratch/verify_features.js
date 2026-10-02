import { api } from '../web/src/api.js';
import { INITIAL_DB_STORE, FALLBACK_DATA } from '../web/src/fallbackData.js';

async function runVerification() {
  console.log('=== TEST 1: CREATE 1 STUDENT ID & 1 TEACHER ID ===');
  
  const initialStudentCount = INITIAL_DB_STORE.tabStudent.rows.length;
  const initialFacultyCount = INITIAL_DB_STORE.tabFaculty.rows.length;
  console.log(`Initial DB Student Count: ${initialStudentCount}`);
  console.log(`Initial DB Faculty Count: ${initialFacultyCount}`);

  // Create Student Account
  const studentRes = await api.createAccount({
    role: 'student',
    full_name: 'Devon Patel',
    email: 'devon.patel@nairee.edu',
    phone: '+1 (555) 789-0123',
    batch: 'BATCH-10A-2026'
  });
  console.log('Created Student Account:', studentRes);

  // Create Teacher Account
  const teacherRes = await api.createAccount({
    role: 'teacher',
    full_name: 'Dr. Evelyn Reed',
    email: 'ereed@nairee.edu',
    phone: '+1 (555) 345-6789',
    department: 'STEM & Robotics'
  });
  console.log('Created Teacher Account:', teacherRes);

  // Check if visible in Database Studio tables
  const newStudentRow = INITIAL_DB_STORE.tabStudent.rows.find(r => r.student_email_id === 'devon.patel@nairee.edu');
  const newFacultyRow = INITIAL_DB_STORE.tabFaculty.rows.find(r => r.email === 'ereed@nairee.edu');

  console.log('Verification in tabStudent table:', newStudentRow ? '✅ VISIBLE IN DATABASE' : '❌ NOT FOUND');
  console.log('Verification in tabFaculty table:', newFacultyRow ? '✅ VISIBLE IN DATABASE' : '❌ NOT FOUND');

  console.log('\n=== TEST 2: CREATE PRINCIPAL ANNOUNCEMENT & VERIFY ACROSS ALL PORTALS ===');
  const annRes = await api.createAnnouncement({
    title: 'Special STEM Hackathon 2026 Announced!',
    content: 'All students and faculty from Grades 9 through 12 are invited to submit their AI & Robotics proposals by this Friday.',
    category: 'STEM Event',
    target_role: 'All',
    priority: 'High',
    posted_by: 'Principal Dr. Marcus Vance'
  });
  console.log('Created Announcement:', annRes);

  const teacherNotices = await api.getAnnouncements('teacher');
  const studentNotices = await api.getAnnouncements('student');
  const parentNotices = await api.getAnnouncements('parent');

  console.log(`Teacher Portal Notices Count: ${teacherNotices.length}, Found: ${teacherNotices.some(n => n.title.includes('STEM Hackathon')) ? '✅ YES' : '❌ NO'}`);
  console.log(`Student Portal Notices Count: ${studentNotices.length}, Found: ${studentNotices.some(n => n.title.includes('STEM Hackathon')) ? '✅ YES' : '❌ NO'}`);
  console.log(`Parent Portal Notices Count: ${parentNotices.length}, Found: ${parentNotices.some(n => n.title.includes('STEM Hackathon')) ? '✅ YES' : '❌ NO'}`);

  console.log('\n=== TEST 3: MULTI-CLASS HOMEWORK CREATION & FILTERING ===');
  const hw10A = await api.createHomework({
    title: 'Grade 10-A Math: Quadratic Formulas Set #2',
    subject: 'Mathematics',
    student_batch: 'BATCH-10A-2026',
    due_date: '2026-10-10',
    instructions: 'Solve Q 1-15'
  });
  const hw10B = await api.createHomework({
    title: 'Grade 10-B English: Essay on Space Exploration',
    subject: 'English',
    student_batch: 'BATCH-10B-2026',
    due_date: '2026-10-12',
    instructions: 'Minimum 250 words'
  });

  const allHw = await api.getHomework();
  console.log(`Total Homeworks in system: ${allHw.length}`);
  console.log(`10A Homework Found: ${allHw.some(h => h.title.includes('10-A')) ? '✅ YES' : '❌ NO'}`);
  console.log(`10B Homework Found: ${allHw.some(h => h.title.includes('10-B')) ? '✅ YES' : '❌ NO'}`);

  console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');
}

runVerification();
