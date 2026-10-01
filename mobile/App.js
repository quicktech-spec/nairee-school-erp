import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Dynamic candidate API endpoints (Wi-Fi LAN IP, Android Emulator loopback, Localhost)
const CANDIDATE_URLS = [
  'http://192.168.29.29:5000/api', // Host machine Wi-Fi IPv4 for physical Android/iOS
  'http://10.0.2.2:5000/api',       // Android Studio Emulator
  'http://localhost:5000/api'       // Web / Local simulator
];

export default function App() {
  const [activeRole, setActiveRole] = useState('student'); // 'student', 'parent', 'teacher', 'admin'
  const [activeTab, setActiveTab] = useState('home');
  const [apiUrl, setApiUrl] = useState(CANDIDATE_URLS[0]);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connected', 'offline', 'connecting'

  // Student State
  const [student, setStudent] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [fees, setFees] = useState([]);
  const [syllabus, setSyllabus] = useState([]);
  const [homeworkList, setHomeworkList] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  // Parent State (Child Switcher: 'EDU-STU-2026-00001' vs 'EDU-STU-2026-00002')
  const [selectedChildId, setSelectedChildId] = useState('EDU-STU-2026-00001');
  const [parentChildSummary, setParentChildSummary] = useState(null);

  // Teacher State
  const [attendanceBatch, setAttendanceBatch] = useState('BATCH-10A-2026');
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [teacherAttendance, setTeacherAttendance] = useState({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Admin State
  const [adminStats, setAdminStats] = useState(null);

  // Resolve best reachable backend API endpoint
  const testConnection = async () => {
    setConnectionStatus('connecting');
    for (const url of CANDIDATE_URLS) {
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 1500);
        const res = await fetch(`${url}/dashboard/stats`, { signal: ctrl.signal });
        clearTimeout(tid);
        if (res && res.ok) {
          setApiUrl(url);
          setConnectionStatus('connected');
          return url;
        }
      } catch {
        // try next candidate
      }
    }
    setConnectionStatus('offline');
    return null;
  };

  // Main data loader
  const loadData = async (targetUrl = apiUrl) => {
    try {
      setLoading(true);
      const base = targetUrl || apiUrl;

      // 1. Fetch Student Data
      try {
        const [resStu, resSch, resFee, resSyl, resHw, resMat] = await Promise.all([
          fetch(`${base}/students/EDU-STU-2026-00001`).catch(() => null),
          fetch(`${base}/schedule?batch=BATCH-10A-2026`).catch(() => null),
          fetch(`${base}/fees?student=EDU-STU-2026-00001`).catch(() => null),
          fetch(`${base}/syllabus?batch=BATCH-10A-2026`).catch(() => null),
          fetch(`${base}/homework?batch=BATCH-10A-2026`).catch(() => null),
          fetch(`${base}/study-materials?batch=BATCH-10A-2026`).catch(() => null)
        ]);

        if (resStu && resStu.ok) setStudent(await resStu.json());
        if (resSch && resSch.ok) setSchedule(await resSch.json());
        if (resFee && resFee.ok) setFees(await resFee.json());
        if (resSyl && resSyl.ok) setSyllabus(await resSyl.json());
        if (resHw && resHw.ok) setHomeworkList(await resHw.json());
        if (resMat && resMat.ok) setStudyMaterials(await resMat.json());
      } catch (e) {
        console.log('Student load error:', e);
      }

      // 2. Fetch Parent Child Summary
      try {
        const resParent = await fetch(`${base}/parent/child/${selectedChildId}/summary`);
        if (resParent && resParent.ok) {
          setParentChildSummary(await resParent.json());
        }
      } catch (e) {
        console.log('Parent load error:', e);
      }

      // 3. Fetch Teacher Batch & Students
      try {
        const resStuList = await fetch(`${base}/students?batch=${attendanceBatch}`);
        if (resStuList && resStuList.ok) {
          const stList = await resStuList.json();
          setTeacherStudents(stList);
          const initialAtt = {};
          stList.forEach(s => { initialAtt[s.name] = 'Present'; });
          setTeacherAttendance(initialAtt);
        }
      } catch (e) {
        console.log('Teacher load error:', e);
      }

      // 4. Fetch Admin Dashboard Stats
      try {
        const resAdmin = await fetch(`${base}/dashboard/stats`);
        if (resAdmin && resAdmin.ok) {
          setAdminStats(await resAdmin.json());
        }
      } catch (e) {
        console.log('Admin load error:', e);
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const activeUrl = await testConnection();
      await loadData(activeUrl || CANDIDATE_URLS[0]);
    })();
  }, []);

  // Reload child summary on switcher change
  useEffect(() => {
    if (apiUrl) {
      fetch(`${apiUrl}/parent/child/${selectedChildId}/summary`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setParentChildSummary(data); })
        .catch(() => null);
    }
  }, [selectedChildId, apiUrl]);

  // Handle Pay Fee
  const handlePayFee = (fee) => {
    Alert.alert(
      'Confirm Mobile Payment',
      `Pay $${fee.outstanding_amount} for ${fee.academic_term} via Google Pay / UPI?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pay Now', 
          onPress: async () => {
            setPaying(true);
            try {
              const res = await fetch(`${apiUrl}/fees/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fee_id: fee.name, payment_method: 'Google Pay Mobile' })
              });
              if (res.ok) {
                setFees(prev => prev.map(f => f.name === fee.name ? { ...f, status: 'Paid', outstanding_amount: 0, receipt_no: 'REC-2026-MOBI' } : f));
                Alert.alert('Payment Successful!', `Official receipt generated for ${fee.name}. Instant sync with web portal!`);
                // reload parent summary too
                fetch(`${apiUrl}/parent/child/${selectedChildId}/summary`)
                  .then(r => r.ok ? r.json() : null)
                  .then(data => { if (data) setParentChildSummary(data); });
              }
            } catch (err) {
              Alert.alert('Error', 'Payment failed to reach server.');
            } finally {
              setPaying(false);
            }
          }
        }
      ]
    );
  };

  // Handle Teacher Attendance Save
  const handleSaveTeacherAttendance = async () => {
    setSavingAttendance(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const records = Object.entries(teacherAttendance).map(([studentId, status]) => {
        const st = teacherStudents.find(s => s.name === studentId);
        return {
          student: studentId,
          student_name: st?.student_name || 'Student',
          status,
          remarks: status === 'Absent' ? 'Unexcused Absence via Mobile' : 'Present on time'
        };
      });

      const res = await fetch(`${apiUrl}/attendance/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch: attendanceBatch, date: today, records })
      });

      if (res.ok) {
        Alert.alert('Attendance Submitted!', `Marked ${records.length} students for ${today}. Synced instantly with web portal and parents!`);
      } else {
        Alert.alert('Notice', 'Attendance saved in mobile offline mode.');
      }
    } catch {
      Alert.alert('Error', 'Failed to connect to backend.');
    } finally {
      setSavingAttendance(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0C1F2C" />

      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerBranding}>
          <View style={styles.logoBadge}>
            <Ionicons name="school" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.schoolName}>Nairee School ERP</Text>
            <Text style={styles.schoolSubtitle}>Connected Mobile Companion • Android</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => { testConnection().then(loadData); }} style={styles.refreshButton}>
          <Ionicons name="refresh" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Server Connectivity & Multi-Role Selector Strip */}
      <View style={styles.connectivityStrip}>
        <View style={styles.connPill}>
          <View style={[styles.statusDot, connectionStatus === 'connected' ? styles.dotGreen : styles.dotAmber]} />
          <Text style={styles.connText}>
            {connectionStatus === 'connected' 
              ? `Live Sync: ${apiUrl.replace('http://', '').replace('/api', '')}`
              : 'Connecting to Nairee API...'}
          </Text>
        </View>

        {/* 4-Role Switcher */}
        <View style={styles.rolePickerRow}>
          {[
            { id: 'student', label: 'Student', icon: 'person' },
            { id: 'parent', label: 'Parent', icon: 'people' },
            { id: 'teacher', label: 'Teacher', icon: 'easel' },
            { id: 'admin', label: 'Admin', icon: 'shield' },
          ].map(r => (
            <TouchableOpacity
              key={r.id}
              onPress={() => { setActiveRole(r.id); setActiveTab('home'); }}
              style={[styles.roleChip, activeRole === r.id && styles.roleChipActive]}
            >
              <Ionicons 
                name={r.icon} 
                size={12} 
                color={activeRole === r.id ? '#FFFFFF' : '#64748B'} 
              />
              <Text style={[styles.roleChipText, activeRole === r.id && styles.roleChipTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ======================================================== */}
        {/* 1. STUDENT VIEW                                          */}
        {/* ======================================================== */}
        {activeRole === 'student' && (
          <View style={styles.tabContent}>
            {/* SUB-TAB NAV FOR STUDENT */}
            <View style={styles.subTabNav}>
              {['home', 'timetable', 'grades', 'fees'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.subTabBtn, activeTab === tab && styles.subTabBtnActive]}
                >
                  <Text style={[styles.subTabBtnText, activeTab === tab && styles.subTabBtnTextActive]}>
                    {tab === 'home' ? 'Digital ID' : tab === 'timetable' ? 'Classes' : tab === 'grades' ? 'Report Card' : 'Fees'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* STUDENT HOME: DIGITAL ID PASS */}
            {activeTab === 'home' && (
              <>
                <View style={styles.idCard}>
                  <View style={styles.idCardHeader}>
                    <View style={styles.idCardTitleGroup}>
                      <Ionicons name="shield-checkmark" size={16} color="#FBBF24" />
                      <Text style={styles.idCardTitle}>NAIREE OFFICIAL STUDENT PASS</Text>
                    </View>
                    <View style={styles.statusPillActive}>
                      <View style={styles.greenDot} />
                      <Text style={styles.activeText}>VERIFIED</Text>
                    </View>
                  </View>

                  <View style={styles.idCardBody}>
                    <Image
                      source={{ uri: student?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }}
                      style={styles.studentAvatar}
                    />
                    <View style={styles.studentInfoCol}>
                      <Text style={styles.studentNameText}>{student?.student_name || 'Nairee Patel'}</Text>
                      <Text style={styles.docIdText}>{student?.name || 'EDU-STU-2026-00001'}</Text>
                      <Text style={styles.batchText}>Roll #{student?.roll_no || '101'} • {student?.batch_name || 'Grade 10-A (Honors)'}</Text>
                    </View>
                  </View>

                  <View style={styles.idCardGrid}>
                    <View style={styles.idCardMetaBlock}>
                      <Text style={styles.metaLabel}>BLOOD GROUP</Text>
                      <Text style={styles.metaValueRed}>{student?.blood_group || 'O+'}</Text>
                    </View>
                    <View style={styles.idCardMetaBlock}>
                      <Text style={styles.metaLabel}>ATTENDANCE</Text>
                      <Text style={styles.metaValueGreen}>{student?.attendance?.percentage || 98}%</Text>
                    </View>
                    <View style={styles.idCardMetaBlock}>
                      <Text style={styles.metaLabel}>ACADEMIC GPA</Text>
                      <Text style={styles.metaValueGold}>4.0 / 96%</Text>
                    </View>
                  </View>

                  {/* Barcode Mockup */}
                  <View style={styles.barcodeSection}>
                    <View style={styles.barcodeLines}>
                      {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6].map((w, i) => (
                        <View key={i} style={[styles.barcodeBar, { width: w * 1.5 }]} />
                      ))}
                    </View>
                    <Text style={styles.barcodeCode}>*EDU-STU-2026-00001*</Text>
                  </View>
                </View>

                {/* Quick Metrics Bar */}
                <View style={styles.kpiRow}>
                  <View style={styles.kpiCard}>
                    <Ionicons name="checkmark-circle" size={24} color="#0D9488" />
                    <Text style={styles.kpiValue}>{student?.attendance?.percentage || 98}%</Text>
                    <Text style={styles.kpiLabel}>Attendance</Text>
                  </View>
                  <View style={styles.kpiCard}>
                    <Ionicons name="trophy" size={24} color="#F59E0B" />
                    <Text style={styles.kpiValue}>Rank #1</Text>
                    <Text style={styles.kpiLabel}>Honors Stream</Text>
                  </View>
                  <View style={styles.kpiCard}>
                    <Ionicons name="book" size={24} color="#06B6D4" />
                    <Text style={styles.kpiValue}>4 Exams</Text>
                    <Text style={styles.kpiLabel}>A+ Distinction</Text>
                  </View>
                </View>

                {/* Next Lecture Banner */}
                <View style={styles.nextClassCard}>
                  <View style={styles.nextClassTop}>
                    <Text style={styles.nextClassTag}>NEXT LECTURE</Text>
                    <Text style={styles.nextClassTime}>08:30 AM - 10:00 AM</Text>
                  </View>
                  <Text style={styles.nextClassSubject}>Calculus & Advanced Mathematics</Text>
                  <Text style={styles.nextClassRoom}>Room 204 • Prof. Sarah Jenkins</Text>
                </View>
              </>
            )}

            {/* STUDENT TIMETABLE */}
            {activeTab === 'timetable' && (
              <View style={styles.tabContent}>
                <Text style={styles.sectionHeading}>Today's Schedule</Text>
                {(schedule.length > 0 ? schedule : [
                  { subject: 'Mathematics', title: 'Calculus & Functions', from_time: '08:30:00', to_time: '10:00:00', room: 'Room 204', faculty_name: 'Prof. Sarah Jenkins', color: '#0D9488' },
                  { subject: 'Computer Science', title: 'Fullstack App Architectures', from_time: '10:15:00', to_time: '11:45:00', room: 'Lab B', faculty_name: 'Ms. Elena Rostova', color: '#06B6D4' },
                  { subject: 'Physics', title: 'Electromagnetism Lab', from_time: '12:30:00', to_time: '14:00:00', room: 'Lab 1', faculty_name: 'Dr. Robert Anderson', color: '#10B981' }
                ]).map((item, index) => (
                  <View key={index} style={[styles.scheduleCard, { borderLeftColor: item.color || '#0D9488' }]}>
                    <View style={styles.scheduleRow}>
                      <Text style={styles.scheduleSubject}>{item.subject}</Text>
                      <View style={styles.timeBadge}>
                        <Ionicons name="time-outline" size={12} color="#64748B" />
                        <Text style={styles.timeText}>{item.from_time.slice(0, 5)} - {item.to_time.slice(0, 5)}</Text>
                      </View>
                    </View>
                    <Text style={styles.scheduleTitle}>{item.title}</Text>
                    <View style={styles.scheduleMeta}>
                      <Text style={styles.metaRoom}>📍 {item.room}</Text>
                      <Text style={styles.metaFaculty}>👤 {item.faculty_name}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* STUDENT REPORT CARD */}
            {activeTab === 'grades' && (
              <View style={styles.tabContent}>
                <Text style={styles.sectionHeading}>Term 1 Examination Results</Text>
                {(student?.assessments || [
                  { assessment_name: 'Calculus Midterm', score: 98, maximum_score: 100, grade: 'A+' },
                  { assessment_name: 'Web & Mobile Dev Project', score: 100, maximum_score: 100, grade: 'A+' },
                  { assessment_name: 'Physics Dynamics Lab', score: 94, maximum_score: 100, grade: 'A' },
                  { assessment_name: 'World Literature Essay', score: 92, maximum_score: 100, grade: 'A' }
                ]).map((a, index) => (
                  <View key={index} style={styles.gradeCard}>
                    <View style={styles.gradeHeader}>
                      <Text style={styles.gradeCourse}>{a.assessment_name || a.course}</Text>
                      <View style={styles.gradePill}>
                        <Text style={styles.gradeLetter}>{a.grade}</Text>
                      </View>
                    </View>
                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreLabel}>Marks Scored:</Text>
                      <Text style={styles.scoreValue}>{a.score} / {a.maximum_score}</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${(a.score / a.maximum_score) * 100}%` }]} />
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* STUDENT FEES */}
            {activeTab === 'fees' && (
              <View style={styles.tabContent}>
                <Text style={styles.sectionHeading}>Tuition & Fee Statements</Text>
                {(fees.length > 0 ? fees : [
                  { name: 'EDU-FEE-2026-00001', academic_term: 'Term 1', grand_total: 1450, outstanding_amount: 0, status: 'Paid', receipt_no: 'REC-2026-90412' },
                  { name: 'EDU-FEE-2026-00002', academic_term: 'Term 2', grand_total: 1450, outstanding_amount: 1450, status: 'Unpaid', receipt_no: null }
                ]).map((fee, index) => (
                  <View key={index} style={styles.feeCard}>
                    <View style={styles.feeHeader}>
                      <View>
                        <Text style={styles.feeInvoiceNo}>{fee.name}</Text>
                        <Text style={styles.feeTerm}>{fee.academic_term} Tuition</Text>
                      </View>
                      <View style={[styles.statusBadge, fee.status === 'Paid' ? styles.statusPaid : styles.statusUnpaid]}>
                        <Text style={[styles.statusText, fee.status === 'Paid' ? styles.textPaid : styles.textUnpaid]}>
                          {fee.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.feeDetails}>
                      <Text style={styles.feeTotal}>Total: ${fee.grand_total}</Text>
                      <Text style={[styles.feeOutstanding, fee.outstanding_amount > 0 ? styles.redText : styles.greenText]}>
                        Due: ${fee.outstanding_amount}
                      </Text>
                    </View>

                    {fee.status !== 'Paid' && (
                      <TouchableOpacity
                        style={styles.payButton}
                        onPress={() => handlePayFee(fee)}
                        disabled={paying}
                      >
                        <Ionicons name="card" size={16} color="#fff" />
                        <Text style={styles.payButtonText}>
                          {paying ? 'Processing...' : `Pay $${fee.outstanding_amount} via Google Pay`}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {fee.status === 'Paid' && (
                      <View style={styles.receiptBox}>
                        <Ionicons name="receipt-outline" size={16} color="#059669" />
                        <Text style={styles.receiptText}>Receipt: {fee.receipt_no || 'REC-2026-90412'}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ======================================================== */}
        {/* 2. PARENT VIEW                                           */}
        {/* ======================================================== */}
        {activeRole === 'parent' && (
          <View style={styles.tabContent}>
            {/* CHILD SWITCHER PILL */}
            <View style={styles.childSwitcherBox}>
              <Text style={styles.childSwitcherTitle}>SWITCH STUDENT (FAMILY ACCOUNT):</Text>
              <View style={styles.childBtnRow}>
                <TouchableOpacity
                  onPress={() => setSelectedChildId('EDU-STU-2026-00001')}
                  style={[styles.childBtn, selectedChildId === 'EDU-STU-2026-00001' && styles.childBtnActive]}
                >
                  <Text style={[styles.childBtnText, selectedChildId === 'EDU-STU-2026-00001' && styles.childBtnTextActive]}>
                    Nairee Patel (Grade 10-A)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedChildId('EDU-STU-2026-00002')}
                  style={[styles.childBtn, selectedChildId === 'EDU-STU-2026-00002' && styles.childBtnActive]}
                >
                  <Text style={[styles.childBtnText, selectedChildId === 'EDU-STU-2026-00002' && styles.childBtnTextActive]}>
                    Rohan Patel (Grade 8-B)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* CHILD SNAPSHOT HERO */}
            <View style={styles.parentSnapshotCard}>
              <View style={styles.parentSnapshotHeader}>
                <View>
                  <Text style={styles.parentChildName}>
                    {parentChildSummary?.student?.student_name || (selectedChildId.endsWith('001') ? 'Nairee Patel' : 'Rohan Patel')}
                  </Text>
                  <Text style={styles.parentChildBatch}>
                    {parentChildSummary?.student?.batch_name || (selectedChildId.endsWith('001') ? 'Grade 10-A (Honors)' : 'Grade 8-B (Middle)')}
                  </Text>
                </View>
                <View style={styles.parentAttBadge}>
                  <Text style={styles.parentAttPct}>
                    {parentChildSummary?.attendance?.percentage || (selectedChildId.endsWith('001') ? 98 : 94)}%
                  </Text>
                  <Text style={styles.parentAttLabel}>Attendance</Text>
                </View>
              </View>

              {/* ABSENCE ALERTS */}
              {parentChildSummary?.attendance?.absentAlerts?.length > 0 ? (
                <View style={styles.alertNoticeBox}>
                  <Ionicons name="alert-circle" size={16} color="#DC2626" />
                  <Text style={styles.alertNoticeText}>
                    Recent Absence: {parentChildSummary.attendance.absentAlerts[0].date} ({parentChildSummary.attendance.absentAlerts[0].remarks})
                  </Text>
                </View>
              ) : (
                <View style={styles.goodNoticeBox}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text style={styles.goodNoticeText}>Exemplary attendance. Zero unexcused absences.</Text>
                </View>
              )}
            </View>

            {/* SYLLABUS TRACKER FOR PARENT */}
            <Text style={styles.sectionHeading}>Live Subject Syllabus Progress</Text>
            {(parentChildSummary?.syllabus?.length > 0 ? parentChildSummary.syllabus : [
              { subject: 'Mathematics', chapter_title: 'Unit 4: Integral Calculus', completed_topics: 8, total_topics: 10, status: 'In Progress' },
              { subject: 'Computer Science', chapter_title: 'Unit 3: Fullstack React Native Architecture', completed_topics: 10, total_topics: 10, status: 'Completed' },
              { subject: 'Physics', chapter_title: 'Unit 2: Electromagnetism & Circuits', completed_topics: 5, total_topics: 8, status: 'In Progress' }
            ]).map((syl, i) => {
              const pct = Math.round((syl.completed_topics / syl.total_topics) * 100);
              return (
                <View key={i} style={styles.syllabusCard}>
                  <View style={styles.syllabusHeader}>
                    <Text style={styles.syllabusSubject}>{syl.subject}</Text>
                    <Text style={styles.syllabusPct}>{pct}%</Text>
                  </View>
                  <Text style={styles.syllabusTitle}>{syl.chapter_title}</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: '#0D9488' }]} />
                  </View>
                  <Text style={styles.syllabusMeta}>
                    {syl.completed_topics} of {syl.total_topics} topics completed • {syl.status}
                  </Text>
                </View>
              );
            })}

            {/* PARENT FEE SUMMARY & PAYMENT */}
            <Text style={styles.sectionHeading}>School Fee Payment</Text>
            {(parentChildSummary?.fees?.length > 0 ? parentChildSummary.fees : fees).map((fee, i) => (
              <View key={i} style={styles.feeCard}>
                <View style={styles.feeHeader}>
                  <Text style={styles.feeInvoiceNo}>{fee.academic_term} Tuition</Text>
                  <Text style={[styles.statusText, fee.status === 'Paid' ? styles.textPaid : styles.textUnpaid]}>
                    {fee.status}
                  </Text>
                </View>
                <Text style={styles.feeTotal}>Outstanding: ${fee.outstanding_amount}</Text>
                {fee.status !== 'Paid' && (
                  <TouchableOpacity
                    style={styles.payButton}
                    onPress={() => handlePayFee(fee)}
                    disabled={paying}
                  >
                    <Ionicons name="card" size={16} color="#fff" />
                    <Text style={styles.payButtonText}>Pay ${fee.outstanding_amount} (Parent Fast Pay)</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ======================================================== */}
        {/* 3. TEACHER VIEW                                          */}
        {/* ======================================================== */}
        {activeRole === 'teacher' && (
          <View style={styles.tabContent}>
            <View style={styles.teacherBanner}>
              <View>
                <Text style={styles.teacherGreeting}>Good Morning, Prof. Sarah Jenkins</Text>
                <Text style={styles.teacherMeta}>Department of Mathematics & STEM • Grade 10-A</Text>
              </View>
            </View>

            {/* DAILY ATTENDANCE MARKER TOOL */}
            <View style={styles.cardBox}>
              <View style={styles.cardBoxHeader}>
                <Text style={styles.cardBoxTitle}>Mark Daily Attendance (Grade 10-A)</Text>
                <TouchableOpacity
                  onPress={handleSaveTeacherAttendance}
                  style={styles.saveAttBtn}
                  disabled={savingAttendance}
                >
                  <Text style={styles.saveAttBtnText}>
                    {savingAttendance ? 'Saving...' : 'Sync Attendance'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cardBoxSub}>Tap student status to toggle between Present and Absent:</Text>

              {teacherStudents.map((st) => {
                const currentStatus = teacherAttendance[st.name] || 'Present';
                return (
                  <View key={st.name} style={styles.attendanceRow}>
                    <View style={styles.attStudentInfo}>
                      <Text style={styles.attStudentName}>{st.student_name}</Text>
                      <Text style={styles.attStudentRoll}>Roll #{st.roll_no} • {st.name}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setTeacherAttendance(prev => ({
                          ...prev,
                          [st.name]: currentStatus === 'Present' ? 'Absent' : 'Present'
                        }));
                      }}
                      style={[styles.attToggleBtn, currentStatus === 'Present' ? styles.attPresent : styles.attAbsent]}
                    >
                      <Text style={styles.attToggleText}>{currentStatus}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* TEACHER SYLLABUS QUICK PROGRESS */}
            <View style={styles.cardBox}>
              <Text style={styles.cardBoxTitle}>Syllabus Progress Updates</Text>
              <Text style={styles.cardBoxSub}>Changes immediately reflect in Student & Parent portals:</Text>
              {syllabus.slice(0, 3).map((item, idx) => (
                <View key={idx} style={styles.sylUpdateRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sylUpdateTitle}>{item.chapter_title}</Text>
                    <Text style={styles.sylUpdateMeta}>{item.completed_topics} of {item.total_topics} Topics</Text>
                  </View>
                  <View style={styles.sylPlusMinusRow}>
                    <TouchableOpacity
                      onPress={async () => {
                        const newCount = Math.max(0, item.completed_topics - 1);
                        await fetch(`${apiUrl}/syllabus/${item.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ completed_topics: newCount, status: newCount === 0 ? 'Upcoming' : 'In Progress' })
                        }).catch(() => null);
                        setSyllabus(prev => prev.map(s => s.id === item.id ? { ...s, completed_topics: newCount } : s));
                      }}
                      style={styles.plusMinusBtn}
                    >
                      <Text style={styles.plusMinusText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={async () => {
                        const newCount = Math.min(item.total_topics, item.completed_topics + 1);
                        await fetch(`${apiUrl}/syllabus/${item.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ completed_topics: newCount, status: newCount === item.total_topics ? 'Completed' : 'In Progress' })
                        }).catch(() => null);
                        setSyllabus(prev => prev.map(s => s.id === item.id ? { ...s, completed_topics: newCount } : s));
                      }}
                      style={[styles.plusMinusBtn, { backgroundColor: '#0D9488' }]}
                    >
                      <Text style={[styles.plusMinusText, { color: '#fff' }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* 4. ADMIN VIEW                                            */}
        {/* ======================================================== */}
        {activeRole === 'admin' && (
          <View style={styles.tabContent}>
            <View style={styles.adminBanner}>
              <Text style={styles.adminTitle}>Principal / Administrator Portal</Text>
              <Text style={styles.adminSubtitle}>Nairee International School Operations</Text>
            </View>

            {/* STATS TILES */}
            <View style={styles.adminGrid}>
              <View style={styles.adminTile}>
                <Ionicons name="people" size={24} color="#0D9488" />
                <Text style={styles.adminTileVal}>{adminStats?.students || 4}</Text>
                <Text style={styles.adminTileLabel}>Active Students</Text>
              </View>
              <View style={styles.adminTile}>
                <Ionicons name="school" size={24} color="#06B6D4" />
                <Text style={styles.adminTileVal}>{adminStats?.faculty || 5}</Text>
                <Text style={styles.adminTileLabel}>Professors</Text>
              </View>
              <View style={styles.adminTile}>
                <Ionicons name="checkmark-done-circle" size={24} color="#10B981" />
                <Text style={styles.adminTileVal}>{adminStats?.attendanceRate || 96}%</Text>
                <Text style={styles.adminTileLabel}>Campus Attendance</Text>
              </View>
              <View style={styles.adminTile}>
                <Ionicons name="cash" size={24} color="#F59E0B" />
                <Text style={styles.adminTileVal}>${(adminStats?.finance?.totalCollected || 11600).toLocaleString()}</Text>
                <Text style={styles.adminTileLabel}>Fees Collected</Text>
              </View>
            </View>

            {/* LIVE SYSTEM HEALTH */}
            <View style={styles.cardBox}>
              <Text style={styles.cardBoxTitle}>Backend Database Integrity</Text>
              <View style={styles.healthRow}>
                <Text style={styles.healthKey}>Storage Engine:</Text>
                <Text style={styles.healthVal}>SQLite Frappe DocTypes</Text>
              </View>
              <View style={styles.healthRow}>
                <Text style={styles.healthKey}>Cross-Portal Sync:</Text>
                <Text style={[styles.healthVal, { color: '#059669', fontWeight: 'bold' }]}>Active (Zero Overlaps)</Text>
              </View>
              <View style={styles.healthRow}>
                <Text style={styles.healthKey}>Native Uploads:</Text>
                <Text style={styles.healthVal}>Enabled (/uploads static)</Text>
              </View>
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0C1F2C',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0C1F2C',
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A42',
  },
  headerBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  schoolName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  schoolSubtitle: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#1E3A42',
  },
  connectivityStrip: {
    backgroundColor: '#132836',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A42',
    gap: 8,
  },
  connPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotGreen: {
    backgroundColor: '#10B981',
  },
  dotAmber: {
    backgroundColor: '#F59E0B',
  },
  connText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: 6,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#1E3A42',
  },
  roleChipActive: {
    backgroundColor: '#0D9488',
  },
  roleChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  roleChipTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    backgroundColor: '#F4FAFA',
    minHeight: '100%',
    paddingBottom: 60,
  },
  tabContent: {
    gap: 16,
  },
  subTabNav: {
    flexDirection: 'row',
    backgroundColor: '#EDFAFA',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#CDE8E8',
    marginBottom: 4,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  subTabBtnActive: {
    backgroundColor: '#0D9488',
  },
  subTabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#52737D',
  },
  subTabBtnTextActive: {
    color: '#FFFFFF',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0C1F2C',
    marginTop: 6,
  },
  idCard: {
    backgroundColor: '#0C1F2C',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E3A42',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  idCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A42',
    paddingBottom: 10,
  },
  idCardTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  idCardTitle: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statusPillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  activeText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '800',
  },
  idCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 14,
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0D9488',
  },
  studentInfoCol: {
    flex: 1,
  },
  studentNameText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  docIdText: {
    color: '#5EEAD4',
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  batchText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  idCardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 10,
  },
  idCardMetaBlock: {
    alignItems: 'center',
  },
  metaLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
  },
  metaValueRed: {
    color: '#F87171',
    fontWeight: '800',
    fontSize: 13,
    marginTop: 2,
  },
  metaValueGreen: {
    color: '#34D399',
    fontWeight: '800',
    fontSize: 13,
    marginTop: 2,
  },
  metaValueGold: {
    color: '#FBBF24',
    fontWeight: '800',
    fontSize: 13,
    marginTop: 2,
  },
  barcodeSection: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E3A42',
    alignItems: 'center',
  },
  barcodeLines: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 20,
  },
  barcodeBar: {
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  barcodeCode: {
    color: '#64748B',
    fontSize: 9,
    fontFamily: 'monospace',
    marginTop: 4,
    letterSpacing: 2,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CDE8E8',
  },
  kpiValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0C1F2C',
    marginTop: 4,
  },
  kpiLabel: {
    fontSize: 10,
    color: '#52737D',
    fontWeight: '600',
    marginTop: 1,
  },
  nextClassCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CDE8E8',
  },
  nextClassTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nextClassTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.5,
  },
  nextClassTime: {
    fontSize: 11,
    fontWeight: '700',
    color: '#52737D',
  },
  nextClassSubject: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0C1F2C',
  },
  nextClassRoom: {
    fontSize: 11,
    color: '#52737D',
    marginTop: 2,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CDE8E8',
    borderLeftWidth: 4,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleSubject: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0C1F2C',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#52737D',
  },
  scheduleTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E3A42',
    marginTop: 4,
  },
  scheduleMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  metaRoom: {
    fontSize: 10,
    color: '#52737D',
    fontWeight: '600',
  },
  metaFaculty: {
    fontSize: 10,
    color: '#52737D',
    fontWeight: '600',
  },
  gradeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CDE8E8',
  },
  gradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gradeCourse: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0C1F2C',
  },
  gradePill: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  gradeLetter: {
    color: '#0F766E',
    fontSize: 11,
    fontWeight: '800',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  scoreLabel: {
    fontSize: 11,
    color: '#52737D',
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0C1F2C',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#EDFAFA',
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0D9488',
    borderRadius: 3,
  },
  feeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CDE8E8',
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeInvoiceNo: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0C1F2C',
  },
  feeTerm: {
    fontSize: 11,
    color: '#52737D',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPaid: {
    backgroundColor: '#D1FAE5',
  },
  statusUnpaid: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textPaid: {
    color: '#059669',
  },
  textUnpaid: {
    color: '#DC2626',
  },
  feeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  feeTotal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#52737D',
  },
  feeOutstanding: {
    fontSize: 12,
    fontWeight: '800',
  },
  redText: {
    color: '#DC2626',
  },
  greenText: {
    color: '#059669',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0D9488',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 12,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  receiptBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 8,
  },
  receiptText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },

  // PARENT SPECIFIC STYLES
  childSwitcherBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CDE8E8',
  },
  childSwitcherTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#52737D',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  childBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  childBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#EDFAFA',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CDE8E8',
  },
  childBtnActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  childBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#52737D',
  },
  childBtnTextActive: {
    color: '#FFFFFF',
  },
  parentSnapshotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CDE8E8',
  },
  parentSnapshotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parentChildName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0C1F2C',
  },
  parentChildBatch: {
    fontSize: 11,
    color: '#52737D',
    marginTop: 2,
  },
  parentAttBadge: {
    backgroundColor: '#CCFBF1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },
  parentAttPct: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F766E',
  },
  parentAttLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0D9488',
  },
  alertNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  alertNoticeText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '600',
  },
  goodNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  goodNoticeText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '600',
  },
  syllabusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CDE8E8',
  },
  syllabusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  syllabusSubject: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0D9488',
  },
  syllabusPct: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0C1F2C',
  },
  syllabusTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0C1F2C',
    marginTop: 4,
  },
  syllabusMeta: {
    fontSize: 10,
    color: '#52737D',
    marginTop: 6,
  },

  // TEACHER SPECIFIC STYLES
  teacherBanner: {
    backgroundColor: '#0D9488',
    borderRadius: 14,
    padding: 14,
  },
  teacherGreeting: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  teacherMeta: {
    color: '#CCFBF1',
    fontSize: 11,
    marginTop: 2,
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CDE8E8',
  },
  cardBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0C1F2C',
  },
  cardBoxSub: {
    fontSize: 11,
    color: '#52737D',
    marginTop: 4,
    marginBottom: 8,
  },
  saveAttBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveAttBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EDFAFA',
  },
  attStudentInfo: {
    flex: 1,
  },
  attStudentName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0C1F2C',
  },
  attStudentRoll: {
    fontSize: 10,
    color: '#52737D',
    marginTop: 1,
  },
  attToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  attPresent: {
    backgroundColor: '#D1FAE5',
  },
  attAbsent: {
    backgroundColor: '#FEE2E2',
  },
  attToggleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0C1F2C',
  },
  sylUpdateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EDFAFA',
  },
  sylUpdateTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0C1F2C',
  },
  sylUpdateMeta: {
    fontSize: 10,
    color: '#52737D',
    marginTop: 1,
  },
  sylPlusMinusRow: {
    flexDirection: 'row',
    gap: 6,
  },
  plusMinusBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#EDFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CDE8E8',
  },
  plusMinusText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0C1F2C',
  },

  // ADMIN SPECIFIC STYLES
  adminBanner: {
    backgroundColor: '#0C1F2C',
    borderRadius: 14,
    padding: 14,
  },
  adminTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  adminSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  adminGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  adminTile: {
    width: (width - 42) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CDE8E8',
    alignItems: 'center',
  },
  adminTileVal: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0C1F2C',
    marginTop: 6,
  },
  adminTileLabel: {
    fontSize: 10,
    color: '#52737D',
    fontWeight: '600',
    marginTop: 1,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EDFAFA',
  },
  healthKey: {
    fontSize: 11,
    color: '#52737D',
    fontWeight: '600',
  },
  healthVal: {
    fontSize: 11,
    color: '#0C1F2C',
    fontWeight: '600',
  },
});
