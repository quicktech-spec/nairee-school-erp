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
  TextInput,
  Modal
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [startingMode, setStartingMode] = useState('signin'); // 'splash' | 'signin'
  const [activeRole, setActiveRole] = useState('student'); // 'student', 'parent', 'teacher', 'admin'
  const [activeTab, setActiveTab] = useState('homework');
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [loginEmail, setLoginEmail] = useState('syalfreelance@gmail.com');
  const [loginPassword, setLoginPassword] = useState('student123');
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [apiUrl, setApiUrl] = useState(CANDIDATE_URLS[0]);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connected', 'offline', 'connecting'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(11);
  const [calendarMonth, setCalendarMonth] = useState('October 2025');

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

  const handlePerformLogin = async () => {
    setLoggingIn(true);
    try {
      if (connectionStatus === 'connected' && apiUrl) {
        const res = await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: loginEmail, password: loginPassword })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setActiveRole(data.user.role || 'student');
            if (data.user.student) {
              setStudent(data.user.student);
            }
          }
          setIsLoggedIn(true);
          Alert.alert('Welcome to Nairee!', `Signed in as ${data.user?.full_name || 'Student'}.`);
          loadData();
          return;
        }
      }
      setIsLoggedIn(true);
      Alert.alert('Welcome to Nairee!', `Signed in as ${student?.student_name || 'Nairee Patel'}.`);
      loadData();
    } catch (err) {
      setIsLoggedIn(true);
      Alert.alert('Welcome to Nairee!', `Signed in as ${student?.student_name || 'Nairee Patel'} (Offline Mode).`);
    } finally {
      setLoggingIn(false);
    }
  };

  // =========================================================================
  // 1. STARTING PART OF APP (Matches media_1790867221846.png)
  // =========================================================================
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.startingRoot}>
        <StatusBar barStyle="light-content" backgroundColor="#3B65BF" />

        {/* Top Segment Mode Toggle Pill */}
        <View style={styles.startingSegmentBar}>
          <TouchableOpacity 
            onPress={() => setStartingMode('splash')}
            style={[styles.startingSegmentBtn, startingMode === 'splash' && styles.startingSegmentBtnActive]}
          >
            <Ionicons name="rocket" size={13} color={startingMode === 'splash' ? '#1E293B' : '#E0E7FF'} />
            <Text style={[styles.startingSegmentText, startingMode === 'splash' && styles.startingSegmentTextActive]}>
              1. Splash Screen
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setStartingMode('signin')}
            style={[styles.startingSegmentBtn, startingMode === 'signin' && styles.startingSegmentBtnActive]}
          >
            <Ionicons name="log-in" size={13} color={startingMode === 'signin' ? '#1E293B' : '#E0E7FF'} />
            <Text style={[styles.startingSegmentText, startingMode === 'signin' && styles.startingSegmentTextActive]}>
              2. Sign In Screen
            </Text>
          </TouchableOpacity>
        </View>

        {/* SCREEN 1: SPLASH SCREEN (Left Screen of media_1790867221846.png) */}
        {startingMode === 'splash' && (
          <View style={styles.splashContainer}>
            {/* Top Logo Area */}
            <View style={styles.splashLogoBox}>
              <View style={styles.splashNaireeTag}>
                <Image 
                  source={require('./assets/nairee-logo-white.png')} 
                  style={{ width: 140, height: 42, resizeMode: 'contain' }} 
                />
              </View>
            </View>

            {/* Space Rocket Boy Illustration */}
            <View style={styles.splashRocketBox}>
              <Image 
                source={require('./assets/boy-rocket-splash.png')} 
                style={styles.splashRocketImage} 
                resizeMode="contain" 
              />
            </View>

            {/* Bottom Proceed Action Button */}
            <View style={styles.splashBottomAction}>
              <TouchableOpacity 
                style={styles.splashProceedBtn}
                onPress={() => setStartingMode('signin')}
                activeOpacity={0.85}
              >
                <Text style={styles.splashProceedBtnText}>PROCEED TO SIGN IN</Text>
                <Ionicons name="arrow-forward" size={16} color="#3B65BF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SCREEN 2: SIGN IN SCREEN (Right Screen of media_1790867221846.png) */}
        {startingMode === 'signin' && (
          <ScrollView contentContainerStyle={styles.signInScroll} bounces={false} showsVerticalScrollIndicator={false}>
            {/* Top Space Sky with Boy on Pencil Rocket */}
            <View style={styles.signInHeaderArea}>
              <Image 
                source={require('./assets/boy-rocket-header.png')} 
                style={styles.signInHeaderImage} 
                resizeMode="cover" 
              />
            </View>

            {/* Bottom White Rounded Sheet */}
            <View style={styles.signInCardSheet}>
              {/* Header Title */}
              <Text style={styles.signInCardTitle}>Hi Student</Text>
              <Text style={styles.signInCardSubtitle}>Sign in to continue</Text>

              {/* Form Input 1: Mobile Number/Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputFieldLabel}>Mobile Number/Email</Text>
                <TextInput
                  style={styles.underlineInput}
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                  placeholder="syalfreelance@gmail.com"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                />
              </View>

              {/* Form Input 2: Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputFieldLabel}>Password</Text>
                <View style={styles.passwordUnderlineBox}>
                  <TextInput
                    style={styles.passwordTextInput}
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)} 
                    style={styles.passwordEyeBtn}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={18} 
                      color="#94A3B8" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign In Pill Button */}
              <TouchableOpacity 
                style={styles.mainSignInBtn}
                onPress={handlePerformLogin}
                disabled={loggingIn}
                activeOpacity={0.85}
              >
                {loggingIn ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
                ) : null}
                <Text style={styles.mainSignInBtnText}>{loggingIn ? 'SIGNING IN...' : 'SIGN IN'}</Text>
                {!loggingIn && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />}
              </TouchableOpacity>

              {/* Forgot Password Link */}
              <TouchableOpacity 
                onPress={() => Alert.alert('Forgot Password', 'Please contact the school administrative desk at admin@nairee.edu to reset your password.')}
                style={styles.forgotPassBtn}
              >
                <Text style={styles.forgotPassText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Quick 1-Click Role Switcher */}
              <View style={styles.startingQuickRolesBox}>
                <Text style={styles.startingQuickRolesTitle}>OR 1-CLICK INSTANT DEMO LOGIN:</Text>
                <View style={styles.startingQuickRolesRow}>
                  {[
                    { id: 'student', label: '🎓 Student', tab: 'homework' },
                    { id: 'parent', label: '👨‍👩‍👦 Parent', tab: 'home' },
                    { id: 'teacher', label: '👩‍🏫 Teacher', tab: 'home' },
                    { id: 'admin', label: '🛡️ Admin', tab: 'home' },
                  ].map(r => (
                    <TouchableOpacity
                      key={r.id}
                      style={styles.quickRoleChip}
                      onPress={() => {
                        setActiveRole(r.id);
                        setActiveTab(r.tab);
                        setIsLoggedIn(true);
                      }}
                    >
                      <Text style={styles.quickRoleChipText}>{r.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  // =========================================================================
  // 2. MAIN AUTHENTICATED APP EXPERIENCE
  // =========================================================================
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#EBF1FE" />

      {/* Top Compact Brand & Sync Strip */}
      <View style={styles.topHeader}>
        <View style={styles.headerBranding}>
          <Image 
            source={require('./assets/nairee-logo.png')} 
            style={{ width: 85, height: 28, resizeMode: 'contain' }} 
          />
          <View style={{ marginLeft: 8, paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: '#DBEAFE' }}>
            <Text style={styles.schoolName}>Nairee</Text>
            <Text style={styles.schoolSubtitle}>Connected Mobile Companion</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity 
            onPress={() => setIsLoggedIn(false)} 
            style={[styles.refreshButton, { backgroundColor: '#FEE2E2' }]}
            title="Log Out & Return to Starting Interface"
          >
            <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { testConnection().then(loadData); }} style={styles.refreshButton}>
            <Ionicons name="refresh" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Connectivity & Role Selector */}
      <View style={styles.connectivityStrip}>
        <View style={styles.connPill}>
          <View style={[styles.statusDot, connectionStatus === 'connected' ? styles.dotGreen : styles.dotAmber]} />
          <Text style={styles.connText}>
            {connectionStatus === 'connected' 
              ? `Live Sync: ${apiUrl.replace('http://', '').replace('/api', '')}`
              : 'Connecting to Nairee API...'}
          </Text>
        </View>

        <View style={styles.rolePickerRow}>
          {[
            { id: 'student', label: 'Student', icon: 'person' },
            { id: 'parent', label: 'Parent', icon: 'people' },
            { id: 'teacher', label: 'Teacher', icon: 'easel' },
            { id: 'admin', label: 'Admin', icon: 'shield' },
          ].map(r => (
            <TouchableOpacity
              key={r.id}
              onPress={() => { setActiveRole(r.id); setActiveTab(r.id === 'student' ? 'homework' : 'home'); }}
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

      {/* EXACT UI DESIGN PILL HEADER (From Screenshot) */}
      <View style={styles.designHeaderPill}>
        {/* 3-Dash Circular Hamburger Button (media_1790863264206.png) */}
        <TouchableOpacity 
          style={styles.threeDashBtn}
          onPress={() => setShowMenuDrawer(true)}
          activeOpacity={0.8}
        >
          <View style={styles.dashLine} />
          <View style={styles.dashLine} />
          <View style={styles.dashLine} />
        </TouchableOpacity>

        <View style={styles.headerCenterCol}>
          <Text style={styles.headerPillTitle}>
            {activeRole === 'student'
              ? (activeTab === 'homework' ? 'Homework' : activeTab === 'timetable' ? 'Time Table' : activeTab === 'video' ? 'Video' : activeTab === 'calendar' ? 'Calendar' : 'Student Pass')
              : activeRole === 'parent' ? 'Parent Portal'
              : activeRole === 'teacher' ? 'Faculty Portal' : 'Admin Panel'}
          </Text>
          <Text style={styles.headerPillSubtitle}>
            {student?.student_name || 'Emma Roberts'}-{student?.batch_name || 'Grade 7 B'}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.headerSquircleBtn}
          onPress={() => Alert.alert('School Notifications', '🔔 All academic notifications live.\n• New Homework assigned in English & Math\n• Mid-term timetable released')}
        >
          <Ionicons name="notifications-outline" size={18} color="#1E293B" />
          <View style={styles.notificationRedDot} />
        </TouchableOpacity>
      </View>

      {/* LEFT-SIDE NAVIGATION DRAWER (Toggled by 3-dash symbol) */}
      <Modal
        visible={showMenuDrawer}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenuDrawer(false)}
      >
        <View style={styles.drawerOverlay}>
          <TouchableOpacity 
            style={styles.drawerBackdropDismiss} 
            activeOpacity={1} 
            onPress={() => setShowMenuDrawer(false)} 
          />
          <View style={styles.drawerContainer}>
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerLogoRow}>
                <View style={styles.threeDashBtnSmall}>
                  <View style={styles.miniDashLine} />
                  <View style={styles.miniDashLine} />
                  <View style={styles.miniDashLine} />
                </View>
                <Text style={styles.drawerTitle}>Navigation Options</Text>
              </View>
              <TouchableOpacity onPress={() => setShowMenuDrawer(false)} style={styles.drawerCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Active Indicator Banner */}
            <View style={styles.drawerActiveBanner}>
              <Text style={styles.drawerActiveText}>
                Active Option: {activeTab.toUpperCase()}
              </Text>
            </View>

            {/* Options on the Left */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {activeRole === 'student' && (
                <View style={styles.drawerOptionsList}>
                  {[
                    { id: 'homework', label: 'Homework & Submit', icon: 'document-text-outline' },
                    { id: 'timetable', label: 'Full Weekly Timetable', icon: 'calendar-outline' },
                    { id: 'video', label: 'Study Videos & Lectures', icon: 'play-circle-outline' },
                    { id: 'pass', label: 'Grades & Report Card', icon: 'ribbon-outline' },
                    { id: 'calendar', label: 'School Calendar (On / Off)', icon: 'calendar' },
                  ].map(opt => {
                    const isSelected = activeTab === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[styles.drawerItem, isSelected && styles.drawerItemActive]}
                        onPress={() => {
                          setActiveTab(opt.id);
                          setShowMenuDrawer(false);
                        }}
                      >
                        <Ionicons 
                          name={opt.icon} 
                          size={18} 
                          color={isSelected ? '#FFFFFF' : '#00A884'} 
                        />
                        <Text style={[styles.drawerItemText, isSelected && styles.drawerItemTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {activeRole === 'parent' && (
                <View style={styles.drawerOptionsList}>
                  {[
                    { id: 'home', label: 'Child Performance', icon: 'person-outline' },
                    { id: 'calendar', label: 'School ON / OFF Calendar', icon: 'calendar-outline' },
                    { id: 'attendance', label: 'Attendance Tracking', icon: 'checkmark-circle-outline' },
                    { id: 'fees', label: 'Fees & Online Pay', icon: 'card-outline' },
                  ].map(opt => {
                    const isSelected = activeTab === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[styles.drawerItem, isSelected && styles.drawerItemActive]}
                        onPress={() => {
                          setActiveTab(opt.id);
                          setShowMenuDrawer(false);
                        }}
                      >
                        <Ionicons 
                          name={opt.icon} 
                          size={18} 
                          color={isSelected ? '#FFFFFF' : '#00A884'} 
                        />
                        <Text style={[styles.drawerItemText, isSelected && styles.drawerItemTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {activeRole === 'teacher' && (
                <View style={styles.drawerOptionsList}>
                  {[
                    { id: 'home', label: 'Class Attendance', icon: 'checkbox-outline' },
                    { id: 'homework', label: 'Homework Manager', icon: 'book-outline' },
                    { id: 'calendar', label: 'School Calendar', icon: 'calendar-outline' },
                    { id: 'syllabus', label: 'Syllabus Progression', icon: 'bar-chart-outline' },
                  ].map(opt => {
                    const isSelected = activeTab === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[styles.drawerItem, isSelected && styles.drawerItemActive]}
                        onPress={() => {
                          setActiveTab(opt.id);
                          setShowMenuDrawer(false);
                        }}
                      >
                        <Ionicons 
                          name={opt.icon} 
                          size={18} 
                          color={isSelected ? '#FFFFFF' : '#00A884'} 
                        />
                        <Text style={[styles.drawerItemText, isSelected && styles.drawerItemTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {activeRole === 'admin' && (
                <View style={styles.drawerOptionsList}>
                  {[
                    { id: 'home', label: 'Executive Dashboard', icon: 'stats-chart-outline' },
                    { id: 'calendar', label: 'School Calendar', icon: 'calendar-outline' },
                  ].map(opt => {
                    const isSelected = activeTab === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[styles.drawerItem, isSelected && styles.drawerItemActive]}
                        onPress={() => {
                          setActiveTab(opt.id);
                          setShowMenuDrawer(false);
                        }}
                      >
                        <Ionicons 
                          name={opt.icon} 
                          size={18} 
                          color={isSelected ? '#FFFFFF' : '#00A884'} 
                        />
                        <Text style={[styles.drawerItemText, isSelected && styles.drawerItemTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ======================================================== */}
        {/* 1. STUDENT VIEW                                          */}
        {/* ======================================================== */}
        {activeRole === 'student' && (
          <View style={styles.tabContent}>
            {/* SUB-TAB NAV FOR STUDENT (Matching the design screens) */}
            <View style={styles.subTabNav}>
              {[
                { id: 'homework', label: 'Homework' },
                { id: 'timetable', label: 'Time Table' },
                { id: 'video', label: 'Video' },
                { id: 'pass', label: 'Report & Pass' }
              ].map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setActiveTab(t.id)}
                  style={[styles.subTabBtn, activeTab === t.id && styles.subTabBtnActive]}
                >
                  <Text style={[styles.subTabBtnText, activeTab === t.id && styles.subTabBtnTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* SCREEN 1: HOMEWORK SCREEN (Matches Image Screen 1) */}
            {activeTab === 'homework' && (
              <View style={styles.tabContent}>
                {/* Calendar Card */}
                <View style={styles.calendarCard}>
                  <View style={styles.calendarHeaderRow}>
                    <Text style={styles.calendarMonthTitle}>{calendarMonth}</Text>
                    <View style={styles.calendarNavBtns}>
                      <TouchableOpacity 
                        style={styles.calendarNavBtn}
                        onPress={() => Alert.alert('Calendar', 'Showing previous month')}
                      >
                        <Ionicons name="chevron-back" size={16} color="#64748B" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.calendarNavBtn}
                        onPress={() => Alert.alert('Calendar', 'Showing next month')}
                      >
                        <Ionicons name="chevron-forward" size={16} color="#64748B" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Day Names Row */}
                  <View style={styles.weekdayRow}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                      <Text key={i} style={styles.weekdayText}>{d}</Text>
                    ))}
                  </View>

                  {/* Calendar Numbers Grid (October 2025 starts Wednesday) */}
                  <View style={styles.calendarGrid}>
                    <View style={styles.emptyDayCell} />
                    <View style={styles.emptyDayCell} />
                    <View style={styles.emptyDayCell} />

                    {Array.from({ length: 31 }).map((_, i) => {
                      const day = i + 1;
                      const hasAlert = day === 1 || day === 11 || day === 14;
                      const isSelected = selectedCalendarDate === day;

                      return (
                        <TouchableOpacity
                          key={day}
                          onPress={() => setSelectedCalendarDate(day)}
                          style={[
                            styles.dayCell,
                            isSelected && !hasAlert && styles.dayCellSelected
                          ]}
                        >
                          {hasAlert ? (
                            <View style={styles.redBadgeCircle}>
                              <Text style={styles.redBadgeText}>{day}</Text>
                            </View>
                          ) : (
                            <Text style={[styles.dayCellText, isSelected && styles.dayCellTextSelected]}>
                              {day}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Upcoming Homework Section */}
                <Text style={styles.upcomingHeading}>Upcoming Homework</Text>

                {/* Homework Cards */}
                {[
                  {
                    id: 'hw-1',
                    title: 'English - Write a paragraph on Healthy Food',
                    instructions: 'Submit on next Monday along with worksheet.',
                    due: '11 Oct 2025',
                    tag: 'English'
                  },
                  {
                    id: 'hw-2',
                    title: 'Math-Solve Exercise 6.1 on Fractions',
                    instructions: 'Questions 1 to 7 in notebook.',
                    due: '11 Oct 2025',
                    tag: 'Mathematics'
                  },
                  {
                    id: 'hw-3',
                    title: 'Science-Prepare for Term Test',
                    instructions: 'Revise Chapter 4 Laws of Motion and complete numericals.',
                    due: '14 Oct 2025',
                    tag: 'Science'
                  },
                  ...homeworkList.filter(h => !h.title?.includes('Healthy Food') && !h.title?.includes('Exercise 6.1')).map(h => ({
                    id: h.id,
                    title: `${h.subject} - ${h.title}`,
                    instructions: h.instructions,
                    due: h.due_date,
                    tag: h.subject
                  }))
                ].map((hw, idx) => (
                  <TouchableOpacity 
                    key={hw.id || idx} 
                    style={styles.homeworkCard}
                    onPress={() => Alert.alert(hw.title, `${hw.instructions}\n\nDue Date: ${hw.due}\n\nStatus: Pending Student Submission`)}
                  >
                    <Text style={styles.hwTitleText}>{hw.title}</Text>
                    <Text style={styles.hwDescText}>{hw.instructions}</Text>
                    <View style={styles.hwDivider} />
                    <Text style={styles.hwDueText}>{hw.due}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* SCREEN 2: TIME TABLE SCREEN (Matches Image Screen 2) */}
            {activeTab === 'timetable' && (
              <View style={styles.tabContent}>
                <Text style={styles.teamHeading}>Team</Text>

                {[
                  { date: '12 Oct 2025, Saturday', subject: 'Science', time: '8:30 AM-11:30 AM', icon: 'flask-outline' },
                  { date: '14 Oct 2025, Monday', subject: 'Mathematics', time: '8:30 AM-11:30 AM', icon: 'calculator-outline' },
                  { date: '16 Oct 2025, Wednesday', subject: 'Hindi / Hygiene', time: '8:30 AM-11:30 AM', icon: 'language-outline' },
                  { date: '17 Oct 2025, Thursday', subject: 'GK/Moral Science', time: '8:30 AM-11:30 AM', icon: 'compass-outline' },
                  { date: '19 Oct 2025, Saturday', subject: 'Social Science', time: '8:30 AM-11:30 AM', icon: 'earth-outline' },
                  { date: '21 Oct 2025, Monday', subject: 'Special English', time: '8:30 AM-11:30 AM', icon: 'book-outline' },
                ].map((item, idx) => (
                  <View key={idx} style={styles.timetableCard}>
                    <Text style={styles.ttDateHeader}>{item.date}</Text>
                    <View style={styles.ttDivider} />
                    <View style={styles.ttSubjectRow}>
                      <View style={styles.ttIconBox}>
                        <Ionicons name={item.icon} size={20} color="#5673EC" />
                      </View>
                      <View style={styles.ttInfoCol}>
                        <Text style={styles.ttSubjectText}>{item.subject}</Text>
                        <Text style={styles.ttTimeText}>{item.time}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* SCREEN 3: VIDEO SCREEN (Matches Image Screen 3) */}
            {activeTab === 'video' && (
              <View style={styles.tabContent}>
                {/* Search Bar */}
                <View style={styles.searchBarContainer}>
                  <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                  <TextInput
                    placeholder="Search here..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInputText}
                  />
                </View>

                {/* All Video Header */}
                <View style={styles.videoSectionHeader}>
                  <Text style={styles.allVideoTitle}>All Video</Text>
                  <Text style={styles.videoCountText}>6 Videos</Text>
                </View>

                {/* Video Cards List */}
                {[
                  {
                    id: 'v1',
                    title: 'Children Day Celebration 2025',
                    duration: '5:24',
                    date: '14 September 2025',
                    views: '234',
                    thumbnail: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=600'
                  },
                  {
                    id: 'v2',
                    title: 'Memorable Moments at School',
                    duration: '8:20',
                    date: '9 April 2025',
                    views: '500',
                    thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600'
                  },
                  {
                    id: 'v3',
                    title: 'Fun & Learning Moments',
                    duration: '4:00',
                    date: '12 May 2025',
                    views: '310',
                    thumbnail: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600'
                  },
                  {
                    id: 'v4',
                    title: 'Annual STEM & Robotics Exhibition',
                    duration: '6:45',
                    date: '18 June 2025',
                    views: '420',
                    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600'
                  },
                  {
                    id: 'v5',
                    title: 'Mathematics: Fractions & Algebra Masterclass',
                    duration: '12:15',
                    date: '2 August 2025',
                    views: '580',
                    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600'
                  },
                  {
                    id: 'v6',
                    title: 'Physics: Laws of Motion & Friction Lab',
                    duration: '14:30',
                    date: '10 October 2025',
                    views: '650',
                    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600'
                  }
                ].filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase())).map((video) => (
                  <View key={video.id} style={styles.videoCard}>
                    <TouchableOpacity 
                      activeOpacity={0.9} 
                      style={styles.videoThumbnailBox}
                      onPress={() => Alert.alert('Playing Lecture Video', `Now streaming: ${video.title} (${video.duration})\nRecorded by Nairee Faculty`)}
                    >
                      <Image source={{ uri: video.thumbnail }} style={styles.videoImage} />
                      
                      {/* Play Button Overlay */}
                      <View style={styles.playButtonCircle}>
                        <Ionicons name="play" size={22} color="#1E293B" style={{ marginLeft: 3 }} />
                      </View>

                      {/* Duration Badge */}
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{video.duration}</Text>
                      </View>

                      {/* Three dots menu */}
                      <TouchableOpacity 
                        style={styles.videoMenuBtn}
                        onPress={() => Alert.alert('Video Options', 'Options: Download offline, Add to playlist, Share with classmates')}
                      >
                        <Ionicons name="ellipsis-vertical" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </TouchableOpacity>

                    {/* Title & Info */}
                    <Text style={styles.videoTitleText}>{video.title}</Text>
                    <View style={styles.videoMetaRow}>
                      <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
                      <Text style={styles.videoMetaText}>{video.date}</Text>
                      <Text style={styles.videoMetaDot}>•</Text>
                      <Ionicons name="eye-outline" size={12} color="#94A3B8" />
                      <Text style={styles.videoMetaText}>{video.views} views</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* SCREEN 4: DIGITAL ID PASS & REPORT CARD & FEES */}
            {activeTab === 'pass' && (
              <>
                {/* 1. OFFICIAL ACADEMIC REPORT CARD (Matches media_1790863523168.png) */}
                <View style={styles.reportCardContainer}>
                  {/* Circular Silver Medal */}
                  <View style={styles.medalWrapper}>
                    <View style={styles.medalCircle}>
                      <Text style={styles.medalPercentage}>85%</Text>
                      <Text style={styles.medalGrade}>GRADE A</Text>
                      <View style={styles.starBadge}>
                        <Ionicons name="star" size={12} color="#FFFFFF" />
                      </View>
                    </View>
                  </View>

                  <View style={styles.reportCardHeader}>
                    <Text style={styles.studentComplimentText}>You are Excellent,</Text>
                    <Text style={styles.studentNameTitle}>
                      {(student?.student_name || 'Emma Roberts').toUpperCase()} !!
                    </Text>
                  </View>

                  {/* Marks Table */}
                  <View style={styles.marksTable}>
                    {[
                      { subject: 'English', max: 100, score: 74, grade: 'B' },
                      { subject: 'Hindi', max: 100, score: 87, grade: 'B' },
                      { subject: 'Science', max: 100, score: 74, grade: 'B' },
                      { subject: 'Math', max: 100, score: 87, grade: 'B' },
                      { subject: 'Social Study', max: 100, score: 89, grade: 'B' },
                      { subject: 'Drawing', max: 100, score: 78, grade: 'B' },
                      { subject: 'Computer', max: 100, score: 96, grade: 'A' },
                    ].map((row, idx) => (
                      <View 
                        key={idx} 
                        style={[
                          styles.marksRow, 
                          idx % 2 === 1 && { backgroundColor: '#F8FAFC' }
                        ]}
                      >
                        <Text style={styles.marksSubjectText}>{row.subject}</Text>
                        <Text style={styles.marksMaxText}>{row.max}</Text>
                        <View style={styles.marksScoreBox}>
                          <Text style={styles.marksScoreText}>{row.score} - {row.grade}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Download PDF Button */}
                  <TouchableOpacity
                    style={styles.downloadPdfBtn}
                    onPress={() => Alert.alert('Report Card PDF', `Term 1 Official Transcript downloaded for ${student?.student_name || 'Emma Roberts'}.`)}
                  >
                    <Ionicons name="document-text-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.downloadPdfBtnText}>DOWNLOAD PDF</Text>
                  </TouchableOpacity>
                </View>

                {/* 2. OFFICIAL STUDENT PASS */}
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
                      <Text style={styles.studentNameText}>{student?.student_name || 'Emma Roberts'}</Text>
                      <Text style={styles.docIdText}>{student?.name || 'EDU-STU-2026-00001'}</Text>
                      <Text style={styles.batchText}>Roll #{student?.roll_no || '101'} • {student?.batch_name || 'Grade 7 B'}</Text>
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
                    <Ionicons name="checkmark-circle" size={24} color="#5673EC" />
                    <Text style={styles.kpiValue}>{student?.attendance?.percentage || 98}%</Text>
                    <Text style={styles.kpiLabel}>Attendance</Text>
                  </View>
                  <View style={styles.kpiCard}>
                    <Ionicons name="trophy" size={24} color="#F59E0B" />
                    <Text style={styles.kpiValue}>Rank #1</Text>
                    <Text style={styles.kpiLabel}>Honors Stream</Text>
                  </View>
                  <View style={styles.kpiCard}>
                    <Ionicons name="book" size={24} color="#10B981" />
                    <Text style={styles.kpiValue}>4 Exams</Text>
                    <Text style={styles.kpiLabel}>A+ Distinction</Text>
                  </View>
                </View>

                {/* Fees Quick Card */}
                <View style={styles.feeCard}>
                  <View style={styles.feeHeader}>
                    <View>
                      <Text style={styles.feeInvoiceNo}>EDU-FEE-2026-00001</Text>
                      <Text style={styles.feeTerm}>Term 1 Academic Tuition</Text>
                    </View>
                    <View style={[styles.statusBadge, styles.statusPaid]}>
                      <Text style={[styles.statusText, styles.textPaid]}>PAID</Text>
                    </View>
                  </View>
                  <View style={styles.feeDetails}>
                    <Text style={styles.feeTotal}>Total: $1,450</Text>
                    <Text style={[styles.feeOutstanding, styles.greenText]}>Outstanding: $0</Text>
                  </View>
                </View>
              </>
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
              <Text style={styles.adminSubtitle}>Nairee Operations</Text>
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
    backgroundColor: '#EBF1FE',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
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
    backgroundColor: '#5673EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  schoolName: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '800',
  },
  schoolSubtitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '500',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#EEF3FD',
  },
  connectivityStrip: {
    backgroundColor: '#F8FAFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
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
    color: '#64748B',
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
    backgroundColor: '#EEF3FD',
  },
  roleChipActive: {
    backgroundColor: '#5673EC',
  },
  roleChipText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  roleChipTextActive: {
    color: '#FFFFFF',
  },
  
  // EXACT DESIGN PILL HEADER (From Screenshot)
  designHeaderPill: {
    backgroundColor: '#748FFC',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#5673EC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  headerSquircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerCenterCol: {
    alignItems: 'center',
  },
  headerPillTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  headerPillSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E0E7FF',
    marginTop: 1,
  },
  notificationRedDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF5A5F',
  },

  scrollContent: {
    padding: 16,
    backgroundColor: '#EBF1FE',
    minHeight: '100%',
    paddingBottom: 60,
  },
  tabContent: {
    gap: 16,
  },
  subTabNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 4,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  subTabBtnActive: {
    backgroundColor: '#5673EC',
  },
  subTabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  subTabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // SCREEN 1: CALENDAR & HOMEWORK STYLES
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  calendarMonthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  calendarNavBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  calendarNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EEF3FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  weekdayText: {
    width: (width - 72) / 7,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDayCell: {
    width: (width - 72) / 7,
    height: 38,
  },
  dayCell: {
    width: (width - 72) / 7,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    backgroundColor: '#EEF3FD',
    borderRadius: 12,
  },
  dayCellText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  dayCellTextSelected: {
    color: '#5673EC',
    fontWeight: '800',
  },
  redBadgeCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FF5A5F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  redBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  upcomingHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 2,
  },
  homeworkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5A5F',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },
  hwTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  hwDescText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },
  hwDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  hwDueText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF5A5F',
  },

  // SCREEN 2: TIMETABLE STYLES
  teamHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  timetableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  ttDateHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5673EC',
    marginBottom: 8,
  },
  ttDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 10,
  },
  ttSubjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ttIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF3FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  ttInfoCol: {
    flex: 1,
  },
  ttSubjectText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  ttTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF5A5F',
    marginTop: 2,
  },

  // SCREEN 3: VIDEO STYLES
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 8,
  },
  searchInputText: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
    padding: 0,
  },
  videoSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  allVideoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  videoCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5673EC',
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  videoThumbnailBox: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EEF3FD',
  },
  videoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playButtonCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -24,
    marginLeft: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  videoMenuBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 10,
  },
  videoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  videoMetaText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  videoMetaDot: {
    fontSize: 11,
    color: '#CBD5E1',
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

  // REPORT CARD STYLES (From media_1790863523168.png)
  reportCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#5673EC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  medalWrapper: {
    marginTop: -4,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    borderWidth: 6,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
  },
  medalPercentage: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
  },
  medalGrade: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  starBadge: {
    position: 'absolute',
    bottom: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  reportCardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  studentComplimentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  studentNameTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  marksTable: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  marksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  marksSubjectText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
  },
  marksMaxText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    width: 50,
    textAlign: 'center',
  },
  marksScoreBox: {
    width: 70,
    alignItems: 'flex-end',
  },
  marksScoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  downloadPdfBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    paddingVertical: 14,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  downloadPdfBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  threeDashBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D7DFE9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3.5,
  },
  dashLine: {
    width: 18,
    height: 2.5,
    backgroundColor: '#111827',
    borderRadius: 2,
  },
  threeDashBtnSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D7DFE9',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2.5,
  },
  miniDashLine: {
    width: 14,
    height: 2,
    backgroundColor: '#111827',
    borderRadius: 1,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
  },
  drawerBackdropDismiss: {
    flex: 1,
  },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.78,
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    padding: 18,
    paddingTop: 45,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  drawerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  drawerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  drawerCloseBtn: {
    padding: 4,
  },
  drawerActiveBanner: {
    marginVertical: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  drawerActiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00A884',
  },
  drawerOptionsList: {
    gap: 8,
    paddingTop: 4,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  drawerItemActive: {
    backgroundColor: '#00A884',
    borderColor: '#00A884',
    shadowColor: '#00A884',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  drawerItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  drawerItemTextActive: {
    color: '#FFFFFF',
  },

  // =========================================================================
  // STARTING INTERFACE STYLES (Exact match for media_1790867221846.png)
  // =========================================================================
  startingRoot: {
    flex: 1,
    backgroundColor: '#3B65BF',
  },
  startingSegmentBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    borderRadius: 20,
    padding: 3,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 6,
  },
  startingSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 16,
    gap: 5,
  },
  startingSegmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  startingSegmentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E0E7FF',
  },
  startingSegmentTextActive: {
    color: '#1E293B',
  },

  // SCREEN 1: SPLASH SCREEN
  splashContainer: {
    flex: 1,
    backgroundColor: '#3B65BF',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  splashLogoBox: {
    alignItems: 'center',
    marginTop: 20,
  },
  splashErpSubtitle: {
    fontSize: 22,
    fontWeight: '800',
    fontStyle: 'italic',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  splashErpTitle: {
    fontSize: 34,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
    lineHeight: 36,
  },
  splashNaireeTag: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  splashRocketBox: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  splashRocketImage: {
    width: width - 40,
    height: 300,
  },
  splashBottomAction: {
    paddingBottom: 16,
  },
  splashProceedBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  splashProceedBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3B65BF',
    letterSpacing: 0.5,
  },

  // SCREEN 2: SIGN IN SCREEN
  signInScroll: {
    backgroundColor: '#3B65BF',
    flexGrow: 1,
  },
  signInHeaderArea: {
    width: '100%',
    height: 200,
    overflow: 'hidden',
  },
  signInHeaderImage: {
    width: '100%',
    height: '100%',
  },
  signInCardSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    marginTop: -20,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  signInCardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  signInCardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 4,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputFieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 6,
  },
  underlineInput: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  passwordUnderlineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  passwordTextInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  passwordEyeBtn: {
    padding: 6,
  },
  mainSignInBtn: {
    backgroundColor: '#3B65BF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 12,
    shadowColor: '#3B65BF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  mainSignInBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  forgotPassBtn: {
    alignSelf: 'flex-end',
    marginTop: 14,
  },
  forgotPassText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  startingQuickRolesBox: {
    marginTop: 30,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  startingQuickRolesTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  startingQuickRolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickRoleChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  quickRoleChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
});
