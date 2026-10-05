import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, 
  Table, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  FileSpreadsheet,
  Download,
  FileText, 
  Layers, 
  X,
  ExternalLink,
  ChevronRight,
  HardDrive,
  MessageCircle,
  QrCode,
  Send,
  PhoneCall,
  User,
  Calendar,
  Building2,
  BookOpen,
  Heart,
  GraduationCap,
  Users,
  CheckSquare,
  Home,
  Briefcase,
  ShieldCheck,
  CreditCard,
  Camera,
  Upload
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { INITIAL_DB_STORE } from '../fallbackData.js';
import { getStoredDb, saveStoredDb, saveMasterStudents, subscribeLiveEvents } from '../api.js';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

// Auto-calculate age from Date of Birth
function calculateAge(dobString) {
  if (!dobString) return '';
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return '';
  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
    years--;
    months = (12 + months) % 12;
  }
  return `${years} Years, ${months} Months`;
}

export default function DatabaseStudioView() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('Student List');
  const [tableData, setTableData] = useState({ rows: [], total: 0, columns: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Persistent DB storage state initialized from central sync engine
  const [dbStore, setDbStore] = useState(() => getStoredDb());

  // Row Edit / Create Modals
  const [editingRow, setEditingRow] = useState(null);
  const [isCreatingRow, setIsCreatingRow] = useState(false);
  const [formData, setFormData] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  // WhatsApp Fee Reminder Modal State
  const [whatsAppFeeModal, setWhatsAppFeeModal] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadTables = async () => {
    try {
      const res = await fetch(`${API_BASE}/database/tables`);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        const filtered = (data.tables || []).filter(t => !t.name.startsWith('sqlite_') && !t.name.startsWith('tab'));
        if (filtered.length > 0) {
          setTables(filtered);
          if (!selectedTable) setSelectedTable(filtered[0].name);
          return;
        }
      }
    } catch (err) {
      console.warn('Live database unreachable, using built-in schema store');
    }

    // Clean tables list (hide tab-prefixed aliases from table selector)
    const currentDb = getStoredDb();
    const cleanNames = Object.keys(currentDb).filter(name => !name.startsWith('tab'));
    const fallbackList = cleanNames.map(name => ({
      name,
      type: 'table',
      count: (currentDb[name]?.rows || []).length
    }));
    setTables(fallbackList);
    if (!selectedTable && fallbackList.length > 0) {
      setSelectedTable(fallbackList[0].name);
    }
  };

  const loadTableData = async (tName = selectedTable, search = searchQuery) => {
    if (!tName) return;
    setLoading(true);
    try {
      const url = `${API_BASE}/database/table/${tName}?limit=100&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setTableData(data);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Using local table data fallback for', tName);
    }

    // Centralized persistent store fallback
    const currentDb = getStoredDb();
    const localTbl = currentDb[tName] || INITIAL_DB_STORE[tName] || { columns: [], rows: [] };
    let filteredRows = [...(localTbl.rows || [])];
    if (search) {
      const q = search.toLowerCase();
      filteredRows = filteredRows.filter(r => 
        Object.values(r).some(val => String(val).toLowerCase().includes(q))
      );
    }

    setTableData({
      columns: localTbl.columns || [],
      rows: filteredRows,
      total: filteredRows.length
    });
    setLoading(false);
  };

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable, searchQuery);
    }
  }, [selectedTable]);

  // Subscribe to live multi-tab & cross-component database sync events
  useEffect(() => {
    const unsub = subscribeLiveEvents((event) => {
      const freshDb = getStoredDb();
      setDbStore(freshDb);
      loadTableData(selectedTable, searchQuery);
      loadTables();
    });
    return () => unsub();
  }, [selectedTable, searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTableData(selectedTable, searchQuery);
  };

  // Convert & Export entire School Records to an Excel Spreadsheet (.xlsx)
  const handleExportAllToExcel = async () => {
    try {
      setExportingExcel(true);
      showToast('Compiling all School Records into Excel...');

      const wb = XLSX.utils.book_new();

      const tableNames = tables.length > 0 
        ? tables.map(t => t.name) 
        : Object.keys(INITIAL_DB_STORE).filter(k => !k.startsWith('tab'));

      let exportedSheetsCount = 0;
      let totalRecordsCount = 0;

      for (const tName of tableNames) {
        let rows = [];

        try {
          const res = await fetch(`${API_BASE}/database/table/${tName}?limit=2000`);
          if (res.ok) {
            const data = await res.json();
            if (data.rows && data.rows.length > 0) {
              rows = data.rows;
            }
          }
        } catch (e) {
          // Local fallback
        }

        if (rows.length === 0) {
          const localTbl = dbStore[tName] || INITIAL_DB_STORE[tName];
          rows = localTbl?.rows || [];
        }

        // Clean sheet name: Excel allows max 31 chars and no []*/\?:
        let safeSheetName = tName.replace(/[\\/?*:[\]]/g, '').slice(0, 31);
        if (!safeSheetName) safeSheetName = `Sheet_${exportedSheetsCount + 1}`;

        if (rows.length > 0) {
          const ws = XLSX.utils.json_to_sheet(rows);
          XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
          exportedSheetsCount++;
          totalRecordsCount += rows.length;
        } else {
          const localTbl = dbStore[tName] || INITIAL_DB_STORE[tName] || { columns: [] };
          const emptyRow = {};
          (localTbl.columns || []).forEach(c => { emptyRow[c.name] = ''; });
          const ws = XLSX.utils.json_to_sheet([emptyRow]);
          XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
          exportedSheetsCount++;
        }
      }

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `Nairee_School_Records_${dateStr}.xlsx`;
      XLSX.writeFile(wb, filename);
      setExportingExcel(false);
      showToast(`📊 Successfully downloaded ${totalRecordsCount} records across ${exportedSheetsCount} tables to ${filename}!`);
    } catch (err) {
      console.error('Error generating Excel:', err);
      setExportingExcel(false);
      showToast('❌ Error generating Excel file: ' + err.message);
    }
  };

  const openStudentModal = (studentRow = null) => {
    if (studentRow) {
      setEditingRow(studentRow);
      setFormData({
        student_id: studentRow.student_id || studentRow.roll_number || `STU-${studentRow.roll_no || '101'}`,
        name: studentRow.name || studentRow.student_name || '',
        roll_no: studentRow.roll_no || (studentRow.roll_number ? studentRow.roll_number.replace(/\D/g, '') : '101'),
        photo: studentRow.photo || studentRow.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        dob: studentRow.dob || '2011-04-12',
        religion: studentRow.religion || 'Hindu',
        nationality: studentRow.nationality || 'Indian',
        blood_group: studentRow.blood_group || 'O+',
        class_batch: studentRow.class_batch || studentRow.student_batch || 'Class 10 - Section A',
        stream: studentRow.stream || 'Computer Applications & Math',
        aadhaar_no: studentRow.aadhaar_no || '9876 5432 1091',
        gender: studentRow.gender || 'Male',
        admission_date: studentRow.admission_date || '2024-06-15',
        residential_address: studentRow.residential_address || 'Flat 402, Green Meadows Residency, Indiranagar, Bengaluru - 560038',
        permanent_address: studentRow.permanent_address || 'Flat 402, Green Meadows Residency, Indiranagar, Bengaluru - 560038',
        phone: studentRow.phone || studentRow.student_mobile_number || '+91 98765 00001',
        email: studentRow.email || studentRow.student_email_id || 'student@nairee.edu',
        fee_status: studentRow.fee_status || 'Paid',
        father_name: studentRow.father_name || 'Rajesh Patel',
        father_occupation: studentRow.father_occupation || 'Senior Software Director',
        father_phone: studentRow.father_phone || '+91 98765 43212',
        father_photo: studentRow.father_photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        father_address: studentRow.father_address || 'Flat 402, Green Meadows Residency, Indiranagar, Bengaluru - 560038',
        mother_name: studentRow.mother_name || 'Meera Patel',
        mother_occupation: studentRow.mother_occupation || 'Professor of Economics',
        mother_phone: studentRow.mother_phone || '+91 98765 43213',
        mother_photo: studentRow.mother_photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
        mother_address: studentRow.mother_address || 'Flat 402, Green Meadows Residency, Indiranagar, Bengaluru - 560038',
        has_previous_school: studentRow.has_previous_school || false,
        prev_school_name: studentRow.prev_school_name || '',
        prev_school_board: studentRow.prev_school_board || 'CBSE',
        prev_studied_class: studentRow.prev_studied_class || 'Class 9',
        has_siblings: studentRow.has_siblings || false,
        sibling_id: studentRow.sibling_id || '',
        sibling_name: studentRow.sibling_name || '',
        sibling_class: studentRow.sibling_class || 'Class 8 - Section A',
        sibling_roll_no: studentRow.sibling_roll_no || ''
      });
    } else {
      // New Student Entry
      const nextIdx = (tableData.rows?.length || 0) + 1;
      const newRoll = 100 + nextIdx;
      setIsCreatingRow(true);
      setFormData({
        student_id: `STU-${String(nextIdx).padStart(3, '0')}`,
        name: '',
        roll_no: String(newRoll),
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        dob: '2011-01-01',
        religion: 'Hindu',
        nationality: 'Indian',
        blood_group: 'O+',
        class_batch: 'Class 10 - Section A',
        stream: 'Computer Applications & Math',
        aadhaar_no: '',
        gender: 'Male',
        admission_date: new Date().toISOString().split('T')[0],
        residential_address: '',
        permanent_address: '',
        phone: '',
        email: '',
        fee_status: 'Pending',
        father_name: '',
        father_occupation: '',
        father_phone: '',
        father_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        father_address: '',
        mother_name: '',
        mother_occupation: '',
        mother_phone: '',
        mother_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
        mother_address: '',
        has_previous_school: false,
        prev_school_name: '',
        prev_school_board: 'CBSE',
        prev_studied_class: 'Class 9',
        has_siblings: false,
        sibling_id: '',
        sibling_name: '',
        sibling_class: 'Class 8 - Section A',
        sibling_roll_no: ''
      });
    }
  };

  const openTeacherModal = (teacherRow = null) => {
    if (teacherRow) {
      setEditingRow(teacherRow);
      setFormData({
        teacher_number: teacherRow.teacher_number || teacherRow.id || 'TEA-001',
        name: teacherRow.name || '',
        photo: teacherRow.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        gender: teacherRow.gender || 'Female',
        dob: teacherRow.dob || '1988-03-14',
        blood_group: teacherRow.blood_group || 'O+',
        aadhaar_no: teacherRow.aadhaar_no || '',
        email: teacherRow.email || '',
        phone: teacherRow.phone || '',
        department: teacherRow.department || 'Mathematics & Science',
        designation: teacherRow.designation || 'Senior Faculty Lead',
        qualification: teacherRow.qualification || 'M.Sc., B.Ed',
        workload_hours: teacherRow.workload_hours || 20,
        monthly_salary: teacherRow.monthly_salary || 65000,
        joining_date: teacherRow.joining_date || '2021-06-01',
        residential_address: teacherRow.residential_address || '',
        permanent_address: teacherRow.permanent_address || '',
        father_name: teacherRow.father_name || '',
        father_occupation: teacherRow.father_occupation || '',
        mother_name: teacherRow.mother_name || '',
        mother_occupation: teacherRow.mother_occupation || '',
        emergency_contact_phone: teacherRow.emergency_contact_phone || '',
        bank_name: teacherRow.bank_name || 'State Bank of India',
        bank_account_no: teacherRow.bank_account_no || '',
        bank_ifsc: teacherRow.bank_ifsc || '',
        bank_holder_name: teacherRow.bank_holder_name || teacherRow.name || '',
        pan_no: teacherRow.pan_no || '',
        status: teacherRow.status || 'Active'
      });
      setIsCreatingRow(false);
    } else {
      const nextNum = (tableData.rows?.length || 0) + 1;
      const formattedNum = `TEA-${String(nextNum).padStart(3, '0')}`;
      setIsCreatingRow(true);
      setEditingRow(null);
      setFormData({
        teacher_number: formattedNum,
        name: '',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        gender: 'Female',
        dob: '1990-05-15',
        blood_group: 'O+',
        aadhaar_no: '',
        email: '',
        phone: '+91 ',
        department: 'Mathematics & Science',
        designation: 'Faculty Lead',
        qualification: 'M.Sc., B.Ed',
        workload_hours: 20,
        monthly_salary: 60000,
        joining_date: new Date().toISOString().split('T')[0],
        residential_address: '',
        permanent_address: '',
        father_name: '',
        father_occupation: '',
        mother_name: '',
        mother_occupation: '',
        emergency_contact_phone: '+91 ',
        bank_name: 'State Bank of India',
        bank_account_no: '',
        bank_ifsc: '',
        bank_holder_name: '',
        pan_no: '',
        status: 'Active'
      });
    }
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    const isNew = isCreatingRow;
    const isTeacher = selectedTable === 'Teacher List' || selectedTable === 'staff_faculty';
    const sName = formData.name || (isTeacher ? 'Faculty Member' : 'Student');

    const cleanRecord = isTeacher ? {
      ...formData,
      teacher_number: formData.teacher_number || `TEA-${String((tableData.rows || []).length + 1).padStart(3, '0')}`,
      name: formData.name || 'Faculty Member',
      phone: formData.phone || '+91 98765 00000',
      email: formData.email || `${(formData.name || 'teacher').toLowerCase().replace(/\s+/g, '')}@nairee.edu`,
      monthly_salary: Number(formData.monthly_salary) || 60000,
      workload_hours: Number(formData.workload_hours) || 20,
      status: formData.status || 'Active'
    } : {
      ...formData,
      roll_number: formData.student_id || `STU-${formData.roll_no || '101'}`,
      roll_no: formData.roll_no ? String(formData.roll_no).replace(/\D/g, '') : '101',
      phone: formData.phone || formData.father_phone || '+91 98765 00000',
      fee_status: formData.fee_status || 'Pending'
    };

    try {
      if (isNew) {
        const res = await fetch(`${API_BASE}/database/table/${selectedTable}/row`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanRecord)
        });
        if (res.ok) {
          showToast(`✅ Record saved to ${selectedTable} successfully!`);
        }
      } else {
        const res = await fetch(`${API_BASE}/database/table/${selectedTable}/row`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            primaryKey: isTeacher ? 'teacher_number' : 'name',
            primaryValue: isTeacher ? (editingRow?.teacher_number || editingRow?.id) : (editingRow?.name || editingRow?.student_name),
            data: cleanRecord
          })
        });
        if (res.ok) {
          showToast(`✅ Record updated in ${selectedTable} successfully!`);
        }
      }
    } catch (err) {
      console.warn('Saving record locally');
    }

    // Centralized persistent storage update
    const currentDb = getStoredDb();
    const currentTbl = currentDb[selectedTable] || { columns: [], rows: [] };
    let updatedRows = [];
    if (isNew) {
      updatedRows = [cleanRecord, ...(currentTbl.rows || [])];
    } else {
      const origTeacherKey = isTeacher ? (editingRow?.teacher_number || editingRow?.id || editingRow?.name) : null;
      const origName = editingRow?.name || editingRow?.student_name || editingRow?.id;
      const origId = editingRow?.student_id || editingRow?.id;
      updatedRows = (currentTbl.rows || []).map(r => {
        if (isTeacher) {
          const rTKey = r.teacher_number || r.id || r.name;
          if (origTeacherKey && rTKey === origTeacherKey) return cleanRecord;
        } else {
          const rName = r.name || r.student_name;
          const rId = r.student_id || r.id;
          if ((origName && rName === origName) || (origId && rId === origId)) {
            return cleanRecord;
          }
        }
        return r;
      });
    }

    const updatedDb = {
      ...currentDb,
      [selectedTable]: {
        ...currentTbl,
        rows: updatedRows
      }
    };

    setDbStore(updatedDb);
    setTableData(prev => ({ ...prev, rows: updatedRows, total: updatedRows.length }));
    saveStoredDb(updatedDb);
    if (selectedTable === 'Student List') {
      saveMasterStudents(updatedRows);
    }
    showToast(isNew ? `✅ Record saved to ${selectedTable}!` : `✅ Record updated in ${selectedTable}!`);
    setIsCreatingRow(false);
    setEditingRow(null);
    setFormData({});
  };

  const handleDeleteRow = async (row) => {
    const isTeacher = selectedTable === 'Teacher List' || selectedTable === 'staff_faculty';
    const sName = isTeacher ? (row.name || row.teacher_number || 'Faculty') : (row.name || row.student_name || row.roll_number || row.id);
    if (!window.confirm(`Are you sure you want to delete record for "${sName}" from ${selectedTable}?`)) {
      return;
    }

    try {
      await fetch(`${API_BASE}/database/table/${selectedTable}/row`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryKey: isTeacher ? 'teacher_number' : 'name',
          primaryValue: isTeacher ? (row.teacher_number || row.id || row.name) : sName
        })
      });
    } catch (err) {
      console.warn('Deleting row locally');
    }

    const currentDb = getStoredDb();
    const currentTbl = currentDb[selectedTable] || { columns: [], rows: [] };
    const rowTKey = isTeacher ? (row.teacher_number || row.id || row.name) : null;
    const updatedRows = (currentTbl.rows || []).filter(r => {
      if (isTeacher) {
        return (r.teacher_number || r.id || r.name) !== rowTKey;
      }
      return (r.name || r.student_name || r.roll_number || r.id) !== sName;
    });
    const updatedDb = {
      ...currentDb,
      [selectedTable]: {
        ...currentTbl,
        rows: updatedRows
      }
    };

    setDbStore(updatedDb);
    setTableData(prev => ({ ...prev, rows: updatedRows, total: updatedRows.length }));
    saveStoredDb(updatedDb);
    if (selectedTable === 'Student List') {
      saveMasterStudents(updatedRows);
    }
    showToast(`Record for ${sName} deleted from ${selectedTable}!`);
  };

  // Check if active table is Student List or Teacher List
  const isStudentListTable = selectedTable === 'Student List';
  const isTeacherListTable = selectedTable === 'Teacher List' || selectedTable === 'staff_faculty';

  // Calculate stream options based on selected class
  const classGradeNum = useMemo(() => {
    const cb = formData.class_batch || '';
    const match = cb.match(/\d+/);
    return match ? parseInt(match[0], 10) : 10;
  }, [formData.class_batch]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c1f2c] border border-teal-500/60 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0c1f2c] via-[#112a3a] to-[#0c1f2c] rounded-3xl p-6 border border-teal-800/40 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            School Records
          </h1>
        </div>

        {/* Excel Sheet Download Option */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportAllToExcel}
            disabled={exportingExcel}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 flex items-center gap-2.5 transition-all cursor-pointer hover:scale-105 active:scale-95 border border-emerald-400/40 disabled:opacity-50"
            title="Convert and download entire School Records data into a multi-sheet Excel spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>{exportingExcel ? 'Converting to Excel...' : 'Download Excel Sheet'}</span>
            <Download className="w-3.5 h-3.5 text-emerald-200" />
          </button>
        </div>
      </div>

      {/* SCHOOL RECORDS BROWSER & LIVE EDITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Tables Inventory List */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Database Tables ({tables.length})
            </span>
            <button 
              onClick={loadTables} 
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Refresh Table List"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
            {tables.map(t => {
              const isSelected = selectedTable === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => {
                    setSelectedTable(t.name);
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                    isSelected 
                      ? 'bg-[#00a884] text-white shadow-md shadow-[#00a884]/20' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Table className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-teal-600'}`} />
                    <span className="truncate">{t.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Table Data Grid & Controls */}
        <div className="lg:col-span-9 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          
          {/* Table Header Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{selectedTable}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {tableData.total} Records
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isStudentListTable 
                  ? 'Showing Student Name, Phone Number, Class & Section, and Fee Status with WhatsApp Reminders.'
                  : isTeacherListTable
                  ? 'Showing Faculty Profiles, Photos, Aadhaar Numbers, Residential & Permanent Addresses, Bank Details & Payroll.'
                  : 'Click Edit on any row to modify its values, Add Row to insert new records, or export this sheet to Excel.'
                }
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              {/* Search in Table */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-56">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in table..."
                  className="w-full pl-9 pr-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </form>

              {/* Add Student / Teacher / Row Button */}
              <button
                onClick={() => {
                  if (isStudentListTable) {
                    openStudentModal(null);
                  } else if (isTeacherListTable) {
                    openTeacherModal(null);
                  } else {
                    const initial = {};
                    tableData.columns.forEach(c => { initial[c.name] = ''; });
                    setFormData(initial);
                    setIsCreatingRow(true);
                  }
                }}
                className="px-3.5 py-2 rounded-2xl bg-[#00a884] hover:bg-[#009172] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#00a884]/20 cursor-pointer flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isStudentListTable ? 'Add Student' : (isTeacherListTable ? 'Add Teacher' : 'Add Row')}</span>
              </button>

              {/* Reload Button */}
              <button
                onClick={() => loadTableData(selectedTable, searchQuery)}
                className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer flex-shrink-0"
                title="Reload Table Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Data Table */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium">Loading table rows from database...</p>
            </div>
          ) : tableData.rows.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold">No records found in {selectedTable}</p>
              <p className="text-[11px]">Click "Add {isStudentListTable ? 'Student' : (isTeacherListTable ? 'Teacher' : 'Row')}" to insert the first record.</p>
            </div>
          ) : isStudentListTable ? (
            /* SPECIAL DEDICATED VIEW FOR STUDENT LIST TABLE */
            <div className="overflow-x-auto rounded-2xl border border-slate-100 max-h-[550px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-16 text-center">Actions</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Phone Number</th>
                    <th className="py-3 px-3">Class & Section</th>
                    <th className="py-3 px-3">Fee Status & WhatsApp Reminder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {tableData.rows.map((row, idx) => {
                    const studentName = row.name || row.student_name || 'Student';
                    const phone = row.phone || row.student_mobile_number || row.guardian_mobile || '+91 98765 00000';
                    const classBatch = row.class_batch || row.student_batch || row.batch_id || 'Class 10 - Section A';
                    const isPaid = row.fee_status === 'Paid' || row.fee_status === 'Cleared';
                    const photo = row.photo || row.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';

                    return (
                      <tr key={idx} className="hover:bg-teal-50/40 transition-colors group">
                        {/* Action buttons */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openStudentModal(row)}
                              className="p-1 rounded-lg hover:bg-teal-100 text-teal-700 transition-colors cursor-pointer"
                              title="Edit Full Student Profile"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRow(row)}
                              className="p-1 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                              title="Delete Student Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Student Name & Avatar */}
                        <td className="py-3 px-3 font-bold text-slate-900 text-xs">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={photo}
                              alt={studentName}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 flex-shrink-0"
                            />
                            <div>
                              <span>{studentName}</span>
                              <div className="text-[10px] font-mono text-slate-400 font-normal">
                                {row.student_id || `STU-${row.roll_no || 101}`} &bull; Roll #{row.roll_no || '101'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Phone Number */}
                        <td className="py-3 px-3 font-mono text-slate-600 text-xs">
                          {phone}
                        </td>

                        {/* Class & Section */}
                        <td className="py-3 px-3 text-slate-700 font-semibold text-xs">
                          <span className="inline-block px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold">
                            {classBatch}
                          </span>
                        </td>

                        {/* Fee Status & WhatsApp Message Action */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Paid (Cleared)</span>
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Pending (Due ₹35,000)</span>
                              </span>

                              {/* WhatsApp Reminder Button with QR Code Modal Trigger */}
                              <button
                                onClick={() => setWhatsAppFeeModal(row)}
                                className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#25D366]/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                                title="Send WhatsApp Fee Reminder with Payment QR Code"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Message (WhatsApp)</span>
                                <QrCode className="w-3 h-3 text-emerald-100" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : isTeacherListTable ? (
            /* SPECIAL CLEAN DEDICATED VIEW FOR TEACHER / FACULTY LIST TABLE */
            <div className="overflow-x-auto rounded-2xl border border-slate-100 max-h-[550px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-16 text-center">Actions</th>
                    <th className="py-3 px-4">Teacher Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Designation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {tableData.rows.map((row, idx) => {
                    const teacherName = row.name || 'Faculty Member';
                    const photo = row.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100';
                    const email = row.email || `${teacherName.toLowerCase().replace(/\s+/g, '')}@nairee.edu`;
                    const dept = row.department || 'Mathematics & Science';
                    const designation = row.designation || 'Senior Faculty Lead';

                    return (
                      <tr key={idx} className="hover:bg-teal-50/40 transition-colors group">
                        {/* Action buttons */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openTeacherModal(row)}
                              className="p-1.5 rounded-lg hover:bg-teal-100 text-teal-700 transition-colors cursor-pointer"
                              title="Edit Full Faculty Profile (All Details)"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRow(row)}
                              className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                              title="Delete Faculty Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                        {/* Teacher Name & Photo Avatar */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 text-xs whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={photo}
                              alt={teacherName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm flex-shrink-0"
                            />
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">{teacherName}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                          <span className="text-slate-600">{email}</span>
                        </td>

                        {/* Department */}
                        <td className="py-3.5 px-4 text-xs">
                          <span className="inline-block px-3 py-1 rounded-xl bg-teal-50/80 border border-teal-200/80 text-teal-800 font-bold text-xs">
                            {dept}
                          </span>
                        </td>

                        {/* Designation */}
                        <td className="py-3.5 px-4 text-xs font-bold text-slate-800">
                          {designation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* GENERAL DYNAMIC TABLE VIEW FOR OTHER TABLES */
            <div className="overflow-x-auto rounded-2xl border border-slate-100 max-h-[550px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-16 text-center">Actions</th>
                    {tableData.columns.map(col => (
                      <th key={col.name} className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span>{col.name}</span>
                          {col.pk === 1 && (
                            <span className="text-[9px] font-mono px-1 rounded bg-amber-100 text-amber-800 font-bold">PK</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {tableData.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-teal-50/40 transition-colors group">
                      {/* Action buttons */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingRow(row);
                              setFormData({ ...row });
                            }}
                            className="p-1 rounded-lg hover:bg-teal-100 text-teal-700 transition-colors cursor-pointer"
                            title="Edit Row"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRow(row)}
                            className="p-1 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="Delete Row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Row Data Cells */}
                      {tableData.columns.map(col => {
                        const val = row[col.name];
                        if (val === null || val === undefined) {
                          return (
                            <td key={col.name} className="py-2.5 px-3 text-slate-300 italic text-[11px]">
                              NULL
                            </td>
                          );
                        }

                        return (
                          <td key={col.name} className="py-2.5 px-3 max-w-[200px] truncate text-[11px]">
                            {typeof val === 'string' && val.startsWith('http') ? (
                              <a href={val} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline flex items-center gap-1">
                                <span className="truncate">{val}</span>
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                            ) : (
                              <span className={col.pk === 1 ? 'font-bold font-mono text-slate-900' : ''}>
                                {String(val)}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* WHATSAPP FEE REMINDER & PAYMENT QR CODE MODAL */}
      {whatsAppFeeModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setWhatsAppFeeModal(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center font-bold">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">WhatsApp Fee Notice & Payment QR</h3>
                  <p className="text-xs text-slate-400">Direct reminder for {whatsAppFeeModal.name || whatsAppFeeModal.student_name}</p>
                </div>
              </div>
              <button
                onClick={() => setWhatsAppFeeModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student & Due Summary */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-rose-700">Fee Payment Overdue</span>
                <h4 className="font-extrabold text-slate-900 text-sm">{whatsAppFeeModal.name || whatsAppFeeModal.student_name}</h4>
                <p className="text-xs text-slate-500">{whatsAppFeeModal.class_batch || 'Class 10 - Section A'} &bull; Phone: {whatsAppFeeModal.phone || '+91 98765 00000'}</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-rose-600">₹35,000</span>
                <p className="text-[10px] font-bold text-rose-500">Term Tuition Due</p>
              </div>
            </div>

            {/* UPI Payment QR Code */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2.5">
              <div className="inline-block p-2.5 rounded-2xl bg-white border border-slate-200 shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=accounts@naireeschool.upi&pn=Nairee%20International%20School&am=35000&cu=INR&tn=Term%20Fee%20Payment%20${whatsAppFeeModal.name || whatsAppFeeModal.student_name}`)}`}
                  alt="UPI QR Code"
                  className="w-32 h-32 mx-auto rounded-lg"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-teal-600" />
                  Official School UPI QR Code
                </span>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">UPI ID: accounts@naireeschool.upi</p>
              </div>
            </div>

            {/* WhatsApp Message Preview */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase">Message Preview (Dispatched to Parent)</label>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed font-sans whitespace-pre-line max-h-28 overflow-y-auto">
                {`📢 *Nairee School Fee Due Notice*\n\nDear Parent,\nThis is a notification from Nairee Accounts Office that the term fee of *₹35,000* for your ward *${whatsAppFeeModal.name || whatsAppFeeModal.student_name}* (${whatsAppFeeModal.class_batch || 'Class 10'}) is currently *PENDING*.\n\n📱 *Instant UPI Payment*: Scan the attached UPI QR Code or pay via Nairee Parent Portal.\n\n⚠️ *Note*: Academic marksheets and exam report cards are withheld until fee clearance.\n\nAccounts Helpline: +91 98765 00001`}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  const sName = whatsAppFeeModal.name || whatsAppFeeModal.student_name;
                  const currentDb = getStoredDb();
                  const currentTbl = currentDb['Student List'] || { columns: [], rows: [] };
                  const updatedRows = (currentTbl.rows || []).map(r => (r.name === sName || r.student_name === sName) ? { ...r, fee_status: 'Paid' } : r);
                  const updatedDb = {
                    ...currentDb,
                    'Student List': {
                      ...currentTbl,
                      rows: updatedRows
                    }
                  };
                  setDbStore(updatedDb);
                  setTableData(prev => ({ ...prev, rows: updatedRows }));
                  saveStoredDb(updatedDb);
                  saveMasterStudents(updatedRows);
                  showToast(`✅ Fee marked as Paid for ${sName}! Marksheet is now released.`);
                  setWhatsAppFeeModal(null);
                }}
                className="w-full sm:flex-1 py-2.5 rounded-xl border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold text-xs transition-colors cursor-pointer text-center"
              >
                Mark as Paid (Release Marksheet)
              </button>
              <a
                href={`https://wa.me/${(whatsAppFeeModal.phone || '919876500000').replace(/\D/g, '')}?text=${encodeURIComponent(
                  `📢 *Nairee School Fee Due Notice*\n\nDear Parent,\nThis is a notification from Nairee Accounts Office that the term fee of *₹35,000* for your ward *${whatsAppFeeModal.name || whatsAppFeeModal.student_name}* (${whatsAppFeeModal.class_batch || 'Class 10'}) is currently *PENDING*.\n\n📱 *Instant Payment*: Scan the UPI QR Code (UPI: accounts@naireeschool.upi) or pay via Nairee Parent Portal.\n\n⚠️ *Note*: Academic marksheets and exam report cards are withheld until fee clearance.\n\nAccounts Helpline: +91 98765 00001`
                )}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  showToast(`📱 WhatsApp Fee Reminder with QR Code sent to parents of ${whatsAppFeeModal.name || whatsAppFeeModal.student_name}!`);
                  setWhatsAppFeeModal(null);
                }}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md shadow-[#25D366]/30 flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send WhatsApp Notice</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE STUDENT PROFILE & ADMISSION MODAL (FOR STUDENT LIST) */}
      {(isCreatingRow || editingRow) && isStudentListTable && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) { setIsCreatingRow(false); setEditingRow(null); } }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            
            {/* Top Header with Student Image, ID & Name */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <img
                    src={formData.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt="Student"
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-4 ring-teal-500/20 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-teal-600 text-white text-[9px] font-bold p-1 rounded-full shadow">
                    <Camera className="w-3 h-3" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-mono text-xs font-black border border-teal-200">
                      {formData.student_id || 'STU-2026-AUTOGEN'}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">
                      Roll #{formData.roll_no ? String(formData.roll_no).replace(/\D/g, '') : '101'}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                    {formData.name ? formData.name : (isCreatingRow ? 'New Student Admission Form' : 'Student Profile Record')}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    {formData.class_batch || 'Class 10 - Section A'} &bull; Frappe DocType: tabStudent
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setIsCreatingRow(false); setEditingRow(null); }}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Comprehensive Form Sections */}
            <form onSubmit={handleSaveStudent} className="flex-1 overflow-y-auto pr-2 py-4 space-y-6 text-xs">
              
              {/* SECTION 1: STUDENT DETAILS */}
              <div className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <User className="w-4 h-4 text-teal-600" />
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    1. Student Personal & Academic Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Student Photo Upload */}
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                      Student Photo <span className="text-teal-600 font-semibold">(Upload Image)</span>
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                      <div className="relative shrink-0">
                        <img
                          src={formData.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt="Student Preview"
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm ring-2 ring-teal-500/20"
                        />
                        {formData.photo && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, photo: '' })}
                            className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 shadow transition-colors"
                            title="Remove Photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1 w-full">
                        <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-teal-300 bg-teal-50/50 hover:bg-teal-50 text-teal-800 font-bold text-xs cursor-pointer transition-all shadow-sm">
                          <Upload className="w-4 h-4 text-teal-600" />
                          <span>Click to Upload Student Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setFormData(prev => ({ ...prev, photo: event.target.result }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        <span className="block text-[10px] text-slate-400 mt-1 text-center sm:text-left">
                          Supports JPG, PNG, WEBP &bull; Converts automatically for database storage
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Student Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Devon Patel"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Roll Number (Numbers Only) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Roll Number (Numbers Only) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.roll_no || ''}
                      onChange={(e) => setFormData({ ...formData, roll_no: e.target.value.replace(/\D/g, '') })}
                      placeholder="e.g. 101"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Class & Section */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Class & Section <span className="text-rose-500">*</span></label>
                    <select
                      value={formData.class_batch || 'Class 10 - Section A'}
                      onChange={(e) => setFormData({ ...formData, class_batch: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Class 1 - Section A">Class 1 - Section A</option>
                      <option value="Class 2 - Section A">Class 2 - Section A</option>
                      <option value="Class 3 - Section A">Class 3 - Section A</option>
                      <option value="Class 4 - Section A">Class 4 - Section A</option>
                      <option value="Class 5 - Section A">Class 5 - Section A</option>
                      <option value="Class 6 - Section A">Class 6 - Section A</option>
                      <option value="Class 7 - Section A">Class 7 - Section A</option>
                      <option value="Class 8 - Section A">Class 8 - Section A</option>
                      <option value="Class 9 - Section A">Class 9 - Section A</option>
                      <option value="Class 9 - Section B">Class 9 - Section B</option>
                      <option value="Class 10 - Section A">Class 10 - Section A</option>
                      <option value="Class 10 - Section B">Class 10 - Section B</option>
                      <option value="Class 11 - Section A">Class 11 - Section A (Senior)</option>
                      <option value="Class 12 - Section A">Class 12 - Section A (Senior)</option>
                    </select>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Date of Birth (DOB) <span className="text-rose-500">*</span></label>
                    <input
                      type="date"
                      required
                      value={formData.dob || '2011-04-12'}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Age (Auto-calculated from DOB) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Age <span className="text-teal-600 font-mono text-[10px]">(Auto-calculated)</span>
                    </label>
                    <div className="w-full px-3.5 py-2 rounded-xl border border-teal-200 bg-teal-50/50 text-xs font-bold text-teal-900 flex items-center justify-between">
                      <span>{calculateAge(formData.dob) || 'Enter DOB above'}</span>
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={formData.gender || 'Male'}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Religion */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Religion</label>
                    <select
                      value={formData.religion || 'Hindu'}
                      onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Hindu">Hindu</option>
                      <option value="Muslim">Muslim</option>
                      <option value="Christian">Christian</option>
                      <option value="Sikh">Sikh</option>
                      <option value="Jain">Jain</option>
                      <option value="Buddhist">Buddhist</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Nationality */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nationality</label>
                    <input
                      type="text"
                      value={formData.nationality || 'Indian'}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={formData.blood_group || 'O+'}
                      onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  {/* Stream (Conditional based on Class) */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Academic Stream & Elective
                      <span className="text-slate-400 font-normal ml-1">
                        {classGradeNum <= 8 && '(Default for Kids: General Foundation)'}
                        {classGradeNum >= 9 && classGradeNum <= 10 && '(Class 9-10 Elective options)'}
                        {classGradeNum >= 11 && '(Class 11-12 Higher Secondary Streams)'}
                      </span>
                    </label>
                    {classGradeNum <= 8 ? (
                      <input
                        type="text"
                        readOnly
                        value="General Foundation (Primary & Middle Core)"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-xs font-medium cursor-not-allowed"
                      />
                    ) : classGradeNum >= 9 && classGradeNum <= 10 ? (
                      <select
                        value={formData.stream || 'Computer Applications & Math'}
                        onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="Computer Applications & Advanced Math">Secondary Core with Computer Applications</option>
                        <option value="Hindi & Applied Science">Secondary Core with Hindi</option>
                        <option value="Sanskrit & Pure Science">Secondary Core with Sanskrit</option>
                        <option value="Physical Education (PE) & Health Science">Secondary Core with Physical Education (PE)</option>
                      </select>
                    ) : (
                      <select
                        value={formData.stream || 'Science (Physics, Chemistry, Math / Bio)'}
                        onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="Science (Physics, Chemistry, Math - PCM)">Senior Science (PCM - Engineering)</option>
                        <option value="Science (Physics, Chemistry, Biology - PCB)">Senior Science (PCB - Medical)</option>
                        <option value="Commerce (Accountancy, Economics, Business Studies)">Senior Commerce (with Maths)</option>
                        <option value="Commerce (Applied)">Senior Commerce (Applied)</option>
                        <option value="Arts & Humanities (History, Psychology, Political Science)">Arts & Humanities</option>
                      </select>
                    )}
                  </div>

                  {/* Aadhaar Card Number */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Aadhaar Card Number (12 Digits)</label>
                    <input
                      type="text"
                      maxLength={14}
                      value={formData.aadhaar_no || ''}
                      onChange={(e) => setFormData({ ...formData, aadhaar_no: e.target.value })}
                      placeholder="9876 5432 1091"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Date of Admission */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Date of Admission</label>
                    <input
                      type="date"
                      value={formData.admission_date || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Student Phone / WhatsApp */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Student Phone / Mobile</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 00001"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Fee Status */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Fee Payment Status</label>
                    <select
                      value={formData.fee_status || 'Pending'}
                      onChange={(e) => setFormData({ ...formData, fee_status: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        formData.fee_status === 'Paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      <option value="Paid">Paid (Dues Cleared & Marksheet Released)</option>
                      <option value="Pending">Pending (Due ₹35,000 & Marksheet Withheld)</option>
                    </select>
                  </div>

                  {/* Residential Address */}
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Residential Address</label>
                    <textarea
                      rows={2}
                      value={formData.residential_address || ''}
                      onChange={(e) => setFormData({ ...formData, residential_address: e.target.value })}
                      placeholder="Enter flat/house no, apartment, street, city, pin code..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Permanent Address with Checkbox */}
                  <div className="sm:col-span-2 md:col-span-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">Permanent Address</label>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-teal-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.permanent_address === formData.residential_address && Boolean(formData.residential_address)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, permanent_address: formData.residential_address });
                            }
                          }}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span>Same as Residential Address</span>
                      </label>
                    </div>
                    <textarea
                      rows={2}
                      value={formData.permanent_address || ''}
                      onChange={(e) => setFormData({ ...formData, permanent_address: e.target.value })}
                      placeholder="Enter permanent address..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PARENTS DETAILS */}
              <div className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    2. Parents & Guardian Details
                  </h3>
                </div>

                {/* Father's Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Father's Information
                    </h4>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-teal-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.father_address === formData.residential_address && Boolean(formData.residential_address)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, father_address: formData.residential_address });
                          }
                        }}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span>Address same as student</span>
                    </label>
                  </div>

                  {/* Father's Photo Upload */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Father's Photo (Upload Image)</label>
                    <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="relative shrink-0">
                        <img
                          src={formData.father_photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                          alt="Father Preview"
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm"
                        />
                        {formData.father_photo && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, father_photo: '' })}
                            className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 shadow"
                            title="Remove Photo"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-colors shadow-sm">
                          <Upload className="w-3.5 h-3.5 text-blue-600" />
                          <span>Upload Father's Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setFormData(prev => ({ ...prev, father_photo: event.target.result }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        <span className="block text-[10px] text-slate-400 mt-0.5">Supports JPG, PNG, WEBP</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Father's Name</label>
                      <input
                        type="text"
                        value={formData.father_name || ''}
                        onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                        placeholder="e.g. Rajesh Patel"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Father's Occupation</label>
                      <input
                        type="text"
                        value={formData.father_occupation || ''}
                        onChange={(e) => setFormData({ ...formData, father_occupation: e.target.value })}
                        placeholder="e.g. Software Engineer"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Father's Phone (WhatsApp)</label>
                      <input
                        type="tel"
                        value={formData.father_phone || ''}
                        onChange={(e) => setFormData({ ...formData, father_phone: e.target.value })}
                        placeholder="+91 98765 43212"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Father's Residential Address</label>
                      <input
                        type="text"
                        value={formData.father_address || ''}
                        onChange={(e) => setFormData({ ...formData, father_address: e.target.value })}
                        placeholder="Enter father's address..."
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Mother's Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                      Mother's Information
                    </h4>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-teal-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.mother_address === formData.residential_address && Boolean(formData.residential_address)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, mother_address: formData.residential_address });
                          }
                        }}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span>Address same as student</span>
                    </label>
                  </div>

                  {/* Mother's Photo Upload */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Mother's Photo (Upload Image)</label>
                    <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="relative shrink-0">
                        <img
                          src={formData.mother_photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}
                          alt="Mother Preview"
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm"
                        />
                        {formData.mother_photo && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, mother_photo: '' })}
                            className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 shadow"
                            title="Remove Photo"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-colors shadow-sm">
                          <Upload className="w-3.5 h-3.5 text-pink-600" />
                          <span>Upload Mother's Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setFormData(prev => ({ ...prev, mother_photo: event.target.result }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        <span className="block text-[10px] text-slate-400 mt-0.5">Supports JPG, PNG, WEBP</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Mother's Name</label>
                      <input
                        type="text"
                        value={formData.mother_name || ''}
                        onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                        placeholder="e.g. Meera Patel"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Mother's Occupation</label>
                      <input
                        type="text"
                        value={formData.mother_occupation || ''}
                        onChange={(e) => setFormData({ ...formData, mother_occupation: e.target.value })}
                        placeholder="e.g. Professor / Doctor"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Mother's Phone (WhatsApp)</label>
                      <input
                        type="tel"
                        value={formData.mother_phone || ''}
                        onChange={(e) => setFormData({ ...formData, mother_phone: e.target.value })}
                        placeholder="+91 98765 43213"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Mother's Residential Address</label>
                      <input
                        type="text"
                        value={formData.mother_address || ''}
                        onChange={(e) => setFormData({ ...formData, mother_address: e.target.value })}
                        placeholder="Enter mother's address..."
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: PREVIOUS SCHOOL (CLICK OPTION) */}
              <div className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal-600" />
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                      3. Previous School History
                    </h3>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold text-teal-800 cursor-pointer bg-teal-100/60 px-3 py-1 rounded-xl">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.has_previous_school)}
                      onChange={(e) => setFormData({ ...formData, has_previous_school: e.target.checked })}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span>Has Previous School History (If Any)</span>
                  </label>
                </div>

                {formData.has_previous_school && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 animate-fadeIn">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Last School Name</label>
                      <input
                        type="text"
                        value={formData.prev_school_name || ''}
                        onChange={(e) => setFormData({ ...formData, prev_school_name: e.target.value })}
                        placeholder="e.g. Delhi Public School"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Board of Education</label>
                      <select
                        value={formData.prev_school_board || 'CBSE'}
                        onChange={(e) => setFormData({ ...formData, prev_school_board: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                      >
                        <option value="CBSE">CBSE (Central Board)</option>
                        <option value="ICSE">ICSE / ISC</option>
                        <option value="State Board">State Board</option>
                        <option value="IB">IB (International Baccalaureate)</option>
                        <option value="Cambridge">Cambridge IGCSE</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Studied Till Class</label>
                      <select
                        value={formData.prev_studied_class || 'Class 9'}
                        onChange={(e) => setFormData({ ...formData, prev_studied_class: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                      >
                        <option value="Class 1">Class 1</option>
                        <option value="Class 2">Class 2</option>
                        <option value="Class 3">Class 3</option>
                        <option value="Class 4">Class 4</option>
                        <option value="Class 5">Class 5</option>
                        <option value="Class 6">Class 6</option>
                        <option value="Class 7">Class 7</option>
                        <option value="Class 8">Class 8</option>
                        <option value="Class 9">Class 9</option>
                        <option value="Class 10">Class 10</option>
                        <option value="Class 11">Class 11</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 4: SIBLING DETAILS (CLICK OPTION) */}
              <div className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-teal-600" />
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                      4. Sibling Details
                    </h3>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold text-teal-800 cursor-pointer bg-teal-100/60 px-3 py-1 rounded-xl">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.has_siblings)}
                      onChange={(e) => setFormData({ ...formData, has_siblings: e.target.checked })}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span>Has Sibling(s) in this School (If Any)</span>
                  </label>
                </div>

                {formData.has_siblings && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 animate-fadeIn">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Sibling Student ID</label>
                      <input
                        type="text"
                        value={formData.sibling_id || ''}
                        onChange={(e) => setFormData({ ...formData, sibling_id: e.target.value })}
                        placeholder="e.g. STU-008"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Sibling Name</label>
                      <input
                        type="text"
                        value={formData.sibling_name || ''}
                        onChange={(e) => setFormData({ ...formData, sibling_name: e.target.value })}
                        placeholder="e.g. Riya Patel"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Class & Section</label>
                      <input
                        type="text"
                        value={formData.sibling_class || ''}
                        onChange={(e) => setFormData({ ...formData, sibling_class: e.target.value })}
                        placeholder="e.g. Class 6 - Section A"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Roll No (Numbers Only)</label>
                      <input
                        type="number"
                        value={formData.sibling_roll_no || ''}
                        onChange={(e) => setFormData({ ...formData, sibling_roll_no: e.target.value.replace(/\D/g, '') })}
                        placeholder="e.g. 106"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Action Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
                <button
                  type="button"
                  onClick={() => { setIsCreatingRow(false); setEditingRow(null); }}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#00a884] hover:bg-[#009172] text-white font-bold text-xs shadow-lg shadow-[#00a884]/25 cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{isCreatingRow ? 'Enroll & Save Student' : 'Update Student Details'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE TEACHER PROFILE & SERVICE RECORD MODAL (FOR TEACHER LIST) */}
      {(isCreatingRow || editingRow) && isTeacherListTable && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) { setIsCreatingRow(false); setEditingRow(null); } }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            
            {/* Top Header with Teacher Image, ID & Name */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <img
                    src={formData.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                    alt="Teacher"
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-4 ring-teal-500/20 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-teal-600 text-white text-[9px] font-bold p-1 rounded-full shadow">
                    <Camera className="w-3 h-3" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-mono text-xs font-black border border-teal-200">
                      {formData.teacher_number || 'TEA-001'}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">
                      {formData.department || 'Mathematics & Science'}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                    {formData.name ? formData.name : (isCreatingRow ? 'New Faculty Onboarding Form' : 'Teacher Service Record')}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    {formData.designation || 'Senior Faculty Lead'} &bull; Status: <span className="font-bold text-emerald-600">{formData.status || 'Active'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setIsCreatingRow(false); setEditingRow(null); }}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Comprehensive Form Sections */}
            <form onSubmit={handleSaveStudent} className="flex-1 overflow-y-auto pr-2 py-4 space-y-6 text-xs">
              
              {/* SECTION 1: PERSONAL & IDENTITY DETAILS */}
              <div className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <User className="w-4 h-4 text-teal-600" />
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    1. Faculty Personal & Identity Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Teacher Photo Upload */}
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                      Teacher Profile Photo <span className="text-teal-600 font-semibold">(Upload Image or Avatar URL)</span>
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                      <div className="relative shrink-0">
                        <img
                          src={formData.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                          alt="Teacher Preview"
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm ring-2 ring-teal-500/20"
                        />
                        {formData.photo && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, photo: '' })}
                            className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 shadow transition-colors"
                            title="Remove Photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1 w-full space-y-1.5">
                        <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-teal-300 bg-teal-50/50 hover:bg-teal-50 text-teal-800 font-bold text-xs cursor-pointer transition-all shadow-sm">
                          <Upload className="w-4 h-4 text-teal-600" />
                          <span>Click to Upload Teacher Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setFormData(prev => ({ ...prev, photo: event.target.result }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        <input
                          type="text"
                          value={formData.photo || ''}
                          onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                          placeholder="Or paste image URL (e.g. https://images.unsplash.com/...)"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] bg-slate-50 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Faculty Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Prof. Sarah Jenkins"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Teacher Code / Number (PK) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Teacher ID / Code (PK) <span className="text-amber-500 font-mono">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!isCreatingRow}
                      value={formData.teacher_number || ''}
                      onChange={(e) => setFormData({ ...formData, teacher_number: e.target.value })}
                      placeholder="e.g. TEA-001"
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono font-bold ${
                        !isCreatingRow ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500'
                      }`}
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={formData.gender || 'Female'}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Date of Birth & Calculated Age */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">Date of Birth</label>
                      {formData.dob && (
                        <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md">
                          {calculateAge(formData.dob)}
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      value={formData.dob || ''}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    />
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={formData.blood_group || 'O+'}
                      onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  {/* Aadhaar Card Number */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Aadhaar Card Number</span>
                      <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> UIDAI Gov
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.aadhaar_no || ''}
                      onChange={(e) => setFormData({ ...formData, aadhaar_no: e.target.value })}
                      placeholder="e.g. 5421 8890 1234"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Official / Personal Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. sjenkins@nairee.edu"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Mobile Number</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43211"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Highest Qualification */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Highest Qualification & Degrees</label>
                    <input
                      type="text"
                      value={formData.qualification || ''}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      placeholder="e.g. M.Sc. Mathematics, B.Ed, NET"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: RESIDENTIAL & PERMANENT ADDRESS */}
              <div className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-teal-600" />
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                      2. Residential & Permanent Address
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.residential_address) {
                        setFormData({ ...formData, permanent_address: formData.residential_address });
                        showToast('✅ Copied Residential Address to Permanent Address!');
                      }
                    }}
                    className="px-3 py-1 rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-800 font-bold text-[11px] cursor-pointer transition-colors"
                  >
                    ⚡ Same as Residential Address
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Residential Address */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Current / Residential Address
                    </label>
                    <textarea
                      rows="3"
                      value={formData.residential_address || ''}
                      onChange={(e) => setFormData({ ...formData, residential_address: e.target.value })}
                      placeholder="Enter house/flat number, street, landmark, city, state and PIN code..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Permanent Address */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Permanent Home Address
                    </label>
                    <textarea
                      rows="3"
                      value={formData.permanent_address || ''}
                      onChange={(e) => setFormData({ ...formData, permanent_address: e.target.value })}
                      placeholder="Enter permanent domicile / hometown address with PIN code..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: PARENTS & FAMILY DETAILS */}
              <div className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    3. Parents & Family Background
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Father's Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Father's Full Name</label>
                    <input
                      type="text"
                      value={formData.father_name || ''}
                      onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                      placeholder="e.g. Arthur Jenkins"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    />
                  </div>

                  {/* Father's Occupation */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Father's Occupation</label>
                    <input
                      type="text"
                      value={formData.father_occupation || ''}
                      onChange={(e) => setFormData({ ...formData, father_occupation: e.target.value })}
                      placeholder="e.g. Retired Civil Architect / Engineer"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    />
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Emergency Contact Number</label>
                    <input
                      type="tel"
                      value={formData.emergency_contact_phone || ''}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                      placeholder="e.g. +91 98765 43299"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800"
                    />
                  </div>

                  {/* Mother's Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Mother's Full Name</label>
                    <input
                      type="text"
                      value={formData.mother_name || ''}
                      onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                      placeholder="e.g. Martha Jenkins"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    />
                  </div>

                  {/* Mother's Occupation */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Mother's Occupation</label>
                    <input
                      type="text"
                      value={formData.mother_occupation || ''}
                      onChange={(e) => setFormData({ ...formData, mother_occupation: e.target.value })}
                      placeholder="e.g. Senior Academician / Professor"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: BANK ACCOUNT & STATUTORY DETAILS */}
              <div className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <CreditCard className="w-4 h-4 text-teal-600" />
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    4. Bank Account & Statutory Payroll Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Bank Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bank_name || ''}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      placeholder="e.g. State Bank of India / HDFC Bank"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    />
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      value={formData.bank_account_no || ''}
                      onChange={(e) => setFormData({ ...formData, bank_account_no: e.target.value })}
                      placeholder="e.g. 30492817462"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  {/* IFSC Code */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Bank IFSC Code</label>
                    <input
                      type="text"
                      value={formData.bank_ifsc || ''}
                      onChange={(e) => setFormData({ ...formData, bank_ifsc: e.target.value.toUpperCase() })}
                      placeholder="e.g. SBIN0004512"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold uppercase text-slate-900"
                    />
                  </div>

                  {/* Account Holder Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={formData.bank_holder_name || ''}
                      onChange={(e) => setFormData({ ...formData, bank_holder_name: e.target.value })}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    />
                  </div>

                  {/* PAN Card Number */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">PAN Card Number</label>
                    <input
                      type="text"
                      value={formData.pan_no || ''}
                      onChange={(e) => setFormData({ ...formData, pan_no: e.target.value.toUpperCase() })}
                      placeholder="e.g. ABCDE1234F"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold uppercase text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: DEPARTMENT, WORKLOAD & REMUNERATION */}
              <div className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Briefcase className="w-4 h-4 text-teal-600" />
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    5. Academic Department, Workload & Remuneration
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Department */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Department</label>
                    <select
                      value={formData.department || 'Mathematics & Science'}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    >
                      <option value="Mathematics & Science">Mathematics & Science</option>
                      <option value="STEM & Robotics">STEM & Robotics</option>
                      <option value="Computer Science">Computer Science & AI</option>
                      <option value="Humanities & English">Humanities & English</option>
                      <option value="Languages & Sanskrit">Languages & Sanskrit</option>
                      <option value="Commerce & Economics">Commerce & Economics</option>
                      <option value="Physical Education & Sports">Physical Education & Sports</option>
                      <option value="Performing Arts & Music">Performing Arts & Music</option>
                    </select>
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Designation / Role</label>
                    <input
                      type="text"
                      value={formData.designation || ''}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Senior Faculty Lead / PGT Teacher"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    />
                  </div>

                  {/* Workload Hours */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Weekly Workload (Hours)</label>
                    <input
                      type="number"
                      value={formData.workload_hours || 20}
                      onChange={(e) => setFormData({ ...formData, workload_hours: Number(e.target.value) })}
                      placeholder="e.g. 20"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800"
                    />
                  </div>

                  {/* Monthly Salary */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Monthly Salary CTC (₹)</label>
                    <input
                      type="number"
                      value={formData.monthly_salary || 65000}
                      onChange={(e) => setFormData({ ...formData, monthly_salary: Number(e.target.value) })}
                      placeholder="e.g. 68000"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-emerald-700"
                    />
                  </div>

                  {/* Date of Joining */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Date of Joining</label>
                    <input
                      type="date"
                      value={formData.joining_date || '2021-06-01'}
                      onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Employment Status</label>
                    <select
                      value={formData.status || 'Active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Probation">Probation</option>
                      <option value="Resigned">Resigned</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Action Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
                <button
                  type="button"
                  onClick={() => { setIsCreatingRow(false); setEditingRow(null); }}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#00a884] hover:bg-[#009172] text-white font-bold text-xs shadow-lg shadow-[#00a884]/25 cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{isCreatingRow ? 'Onboard & Save Faculty' : 'Update Faculty Details'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERIC CREATE / EDIT ROW MODAL (FOR OTHER TABLES) */}
      {(isCreatingRow || editingRow) && !isStudentListTable && !isTeacherListTable && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) { setIsCreatingRow(false); setEditingRow(null); } }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  {isCreatingRow ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {isCreatingRow ? `Insert New Row into ${selectedTable}` : `Edit Row in ${selectedTable}`}
                  </h3>
                  <p className="text-xs text-slate-400">Changes will be saved directly into database.</p>
                </div>
              </div>
              <button
                onClick={() => { setIsCreatingRow(false); setEditingRow(null); }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dynamic Form Fields */}
            <form onSubmit={handleSaveStudent} className="flex-1 overflow-y-auto pr-1 py-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tableData.columns.map(col => {
                  const isPk = col.pk === 1 && !isCreatingRow;
                  return (
                    <div key={col.name} className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 truncate">
                        {col.name} {col.pk === 1 && <span className="text-amber-500 font-mono">(PK)</span>}
                      </label>
                      <input
                        type="text"
                        disabled={isPk}
                        value={formData[col.name] !== undefined ? formData[col.name] : ''}
                        onChange={(e) => setFormData({ ...formData, [col.name]: e.target.value })}
                        placeholder={`Enter ${col.name}...`}
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                          isPk ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsCreatingRow(false); setEditingRow(null); }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#009172] text-white font-bold text-xs shadow-md shadow-[#00a884]/20 cursor-pointer"
                >
                  {isCreatingRow ? 'Insert Row' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
