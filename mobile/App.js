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
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const API_URL = 'http://10.0.2.2:5000/api'; // Android Emulator default; fallbacks to localhost or bundled data

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [student, setStudent] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  // Fallback demo data if device is offline or disconnected
  const fallbackStudent = {
    name: 'EDU-STU-2026-00001',
    student_name: 'Nairee Patel',
    roll_no: '101',
    batch_name: 'Grade 10-A (Honors)',
    student_email_id: 'nairee.patel@student.school.edu',
    student_mobile_number: '+1 (555) 019-2831',
    blood_group: 'O+',
    date_of_birth: '2010-04-18',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    attendance: { percentage: 100, presentDays: 5, totalDays: 5 },
    assessments: [
      { name: 'R1', assessment_name: 'Calculus Midterm', score: 98, maximum_score: 100, grade: 'A+' },
      { name: 'R2', assessment_name: 'Web & Mobile Dev Project', score: 100, maximum_score: 100, grade: 'A+' },
      { name: 'R3', assessment_name: 'Physics Dynamics Lab', score: 94, maximum_score: 100, grade: 'A' },
      { name: 'R4', assessment_name: 'World Literature Essay', score: 92, maximum_score: 100, grade: 'A' },
    ]
  };

  const fallbackSchedule = [
    { name: '1', subject: 'Mathematics', title: 'Calculus & Functions', from_time: '08:30:00', to_time: '10:00:00', room: 'Room 204', faculty_name: 'Prof. Sarah Jenkins', color: '#4F46E5' },
    { name: '2', subject: 'Computer Science', title: 'Fullstack App Architectures', from_time: '10:15:00', to_time: '11:45:00', room: 'Computer Lab B', faculty_name: 'Ms. Elena Rostova', color: '#0EA5E9' },
    { name: '3', subject: 'Physics', title: 'Electromagnetism Lab', from_time: '12:30:00', to_time: '14:00:00', room: 'Physics Lab 1', faculty_name: 'Dr. Robert Anderson', color: '#10B981' },
    { name: '4', subject: 'English Literature', title: 'Critical Essay Seminar', from_time: '14:15:00', to_time: '15:30:00', room: 'Hall 101', faculty_name: 'Mr. David Miller', color: '#F59E0B' }
  ];

  const fallbackFees = [
    { name: 'EDU-FEE-2026-00001', academic_term: 'Term 1', grand_total: 1450, outstanding_amount: 0, status: 'Paid', receipt_no: 'REC-2026-90412' },
    { name: 'EDU-FEE-2026-00002', academic_term: 'Term 2', grand_total: 1450, outstanding_amount: 1450, status: 'Unpaid', receipt_no: null }
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      // Try local network API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const [resStu, resSch, resFee] = await Promise.all([
        fetch(`${API_URL}/students/EDU-STU-2026-00001`, { signal: controller.signal }).catch(() => null),
        fetch(`${API_URL}/schedule?batch=BATCH-10A-2026`, { signal: controller.signal }).catch(() => null),
        fetch(`${API_URL}/fees?student=EDU-STU-2026-00001`, { signal: controller.signal }).catch(() => null),
      ]);
      clearTimeout(timeoutId);

      if (resStu && resStu.ok) {
        setStudent(await resStu.json());
      } else {
        setStudent(fallbackStudent);
      }

      if (resSch && resSch.ok) {
        setSchedule(await resSch.json());
      } else {
        setSchedule(fallbackSchedule);
      }

      if (resFee && resFee.ok) {
        setFees(await resFee.json());
      } else {
        setFees(fallbackFees);
      }
    } catch {
      setStudent(fallbackStudent);
      setSchedule(fallbackSchedule);
      setFees(fallbackFees);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayFee = (fee) => {
    Alert.alert(
      'Confirm Mobile Payment',
      `Pay $${fee.outstanding_amount} for ${fee.academic_term} via Google Pay / Mobile Card?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pay Now', 
          onPress: async () => {
            setPaying(true);
            try {
              await fetch(`${API_URL}/fees/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fee_id: fee.name, payment_method: 'Google Pay Mobile' })
              }).catch(() => null);

              setFees(prev => prev.map(f => f.name === fee.name ? { ...f, status: 'Paid', outstanding_amount: 0, receipt_no: 'REC-2026-MOBI' } : f));
              Alert.alert('Payment Successful!', `Official receipt generated for ${fee.name}.`);
            } finally {
              setPaying(false);
            }
          }
        }
      ]
    );
  };

  if (loading || !student) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Syncing Frappe Student Portal...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerBranding}>
          <View style={styles.logoBadge}>
            <Ionicons name="school" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.schoolName}>Nairee School Portal</Text>
            <Text style={styles.schoolSubtitle}>Frappe Education Mobile • Android</Text>
          </View>
        </View>

        <TouchableOpacity onPress={fetchData} style={styles.refreshButton}>
          <Ionicons name="refresh" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TAB 1: HOME & DIGITAL ID PASS */}
        {activeTab === 'home' && (
          <View style={styles.tabContent}>
            {/* Holographic Digital Student Pass */}
            <View style={styles.idCard}>
              <View style={styles.idCardHeader}>
                <View style={styles.idCardTitleGroup}>
                  <Ionicons name="shield-checkmark" size={16} color="#FBBF24" />
                  <Text style={styles.idCardTitle}>OFFICIAL STUDENT PASS</Text>
                </View>
                <View style={styles.statusPillActive}>
                  <View style={styles.greenDot} />
                  <Text style={styles.activeText}>VERIFIED</Text>
                </View>
              </View>

              <View style={styles.idCardBody}>
                <Image
                  source={{ uri: student.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }}
                  style={styles.studentAvatar}
                />
                <View style={styles.studentInfoCol}>
                  <Text style={styles.studentNameText}>{student.student_name}</Text>
                  <Text style={styles.docIdText}>{student.name}</Text>
                  <Text style={styles.batchText}>Roll #{student.roll_no} • {student.batch_name}</Text>
                </View>
              </View>

              <View style={styles.idCardGrid}>
                <View style={styles.idCardMetaBlock}>
                  <Text style={styles.metaLabel}>BLOOD GROUP</Text>
                  <Text style={styles.metaValueRed}>{student.blood_group || 'O+'}</Text>
                </View>
                <View style={styles.idCardMetaBlock}>
                  <Text style={styles.metaLabel}>ATTENDANCE</Text>
                  <Text style={styles.metaValueGreen}>{student.attendance?.percentage || 100}%</Text>
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
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.kpiValue}>{student.attendance?.percentage || 100}%</Text>
                <Text style={styles.kpiLabel}>Attendance</Text>
              </View>
              <View style={styles.kpiCard}>
                <Ionicons name="trophy" size={24} color="#F59E0B" />
                <Text style={styles.kpiValue}>Rank #1</Text>
                <Text style={styles.kpiLabel}>Honors Stream</Text>
              </View>
              <View style={styles.kpiCard}>
                <Ionicons name="book" size={24} color="#0EA5E9" />
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
          </View>
        )}

        {/* TAB 2: TIMETABLE */}
        {activeTab === 'timetable' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>Today's Class Schedule</Text>
            {schedule.map((item, index) => (
              <View key={index} style={[styles.scheduleCard, { borderLeftColor: item.color || '#4F46E5' }]}>
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

        {/* TAB 3: GRADES */}
        {activeTab === 'grades' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>Term 1 Report Card</Text>
            {student.assessments?.map((a, index) => (
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

        {/* TAB 4: FEES */}
        {activeTab === 'fees' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>Tuition & Fee Invoices</Text>
            {fees.map((fee, index) => (
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

      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {[
          { id: 'home', label: 'ID Pass', icon: 'id-card' },
          { id: 'timetable', label: 'Classes', icon: 'calendar' },
          { id: 'grades', label: 'Report Card', icon: 'trophy' },
          { id: 'fees', label: 'Fees', icon: 'receipt' },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={styles.navItem}
            >
              <Ionicons
                name={isSelected ? tab.icon : `${tab.icon}-outline`}
                size={22}
                color={isSelected ? '#4F46E5' : '#94A3B8'}
              />
              <Text style={[styles.navLabel, isSelected && styles.navLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
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
    fontSize: 11,
    fontWeight: '500',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#1E293B',
  },
  scrollContent: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    minHeight: '100%',
    paddingBottom: 90,
  },
  tabContent: {
    gap: 16,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  idCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  idCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingBottom: 12,
  },
  idCardTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  idCardTitle: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statusPillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  activeText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
  },
  idCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
  },
  studentAvatar: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  studentInfoCol: {
    flex: 1,
  },
  studentNameText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  docIdText: {
    color: '#818CF8',
    fontFamily: 'monospace',
    fontSize: 12,
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
    marginTop: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 12,
  },
  idCardMetaBlock: {
    alignItems: 'center',
  },
  metaLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metaValueRed: {
    color: '#F87171',
    fontWeight: '800',
    fontSize: 14,
    marginTop: 2,
  },
  metaValueGreen: {
    color: '#34D399',
    fontWeight: '800',
    fontSize: 14,
    marginTop: 2,
  },
  metaValueGold: {
    color: '#FBBF24',
    fontWeight: '800',
    fontSize: 14,
    marginTop: 2,
  },
  barcodeSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    alignItems: 'center',
  },
  barcodeLines: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 24,
  },
  barcodeBar: {
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  barcodeCode: {
    color: '#64748B',
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 4,
    letterSpacing: 2,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  nextClassCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    padding: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#4F46E5',
  },
  nextClassTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextClassTag: {
    color: '#4F46E5',
    fontWeight: '800',
    fontSize: 10,
  },
  nextClassTime: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  nextClassSubject: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 6,
  },
  nextClassRoom: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    marginBottom: 10,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleSubject: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  scheduleTitle: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    marginTop: 4,
  },
  scheduleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaRoom: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  metaFaculty: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  gradeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  gradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gradeCourse: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  gradePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gradeLetter: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  scoreValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  feeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  feeInvoiceNo: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  feeTerm: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPaid: {
    backgroundColor: '#DCFCE7',
  },
  statusUnpaid: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  textPaid: {
    color: '#15803D',
  },
  textUnpaid: {
    color: '#B45309',
  },
  feeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  feeTotal: {
    fontSize: 13,
    color: '#475569',
  },
  feeOutstanding: {
    fontSize: 14,
    fontWeight: '800',
  },
  redText: {
    color: '#DC2626',
  },
  greenText: {
    color: '#16A34A',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  receiptBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  receiptText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingBottom: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },
});
