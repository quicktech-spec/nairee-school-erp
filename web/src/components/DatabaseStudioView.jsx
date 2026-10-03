import React, { useState, useEffect } from 'react';
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
  HardDrive
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { INITIAL_DB_STORE } from '../fallbackData.js';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export default function DatabaseStudioView() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('Student List');
  const [tableData, setTableData] = useState({ rows: [], total: 0, columns: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // In-memory fallback DB storage state
  const [dbStore, setDbStore] = useState(INITIAL_DB_STORE);

  // Row Edit / Create Modals
  const [editingRow, setEditingRow] = useState(null);
  const [isCreatingRow, setIsCreatingRow] = useState(false);
  const [formData, setFormData] = useState({});
  const [toastMessage, setToastMessage] = useState('');

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
    const currentDb = { ...INITIAL_DB_STORE };
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

    // Fallback table data from in-memory DB store
    const localTbl = INITIAL_DB_STORE[tName] || dbStore[tName] || { columns: [], rows: [] };
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
  }, [selectedTable, dbStore]);

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

  const handleExportCurrentTable = () => {
    try {
      const rows = tableData.rows.length > 0 ? tableData.rows : [{}];
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      const safeSheetName = selectedTable.replace(/[\\/?*:[\]]/g, '').slice(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
      const filename = `${selectedTable.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, filename);
      showToast(`📊 Exported ${tableData.rows.length} rows from "${selectedTable}" to Excel!`);
    } catch (err) {
      showToast('❌ Failed to export table: ' + err.message);
    }
  };

  const handleSaveRow = async (e) => {
    e.preventDefault();
    try {
      if (isCreatingRow) {
        const res = await fetch(`${API_BASE}/database/table/${selectedTable}/row`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          showToast(`Row added to ${selectedTable} successfully!`);
          setIsCreatingRow(false);
          setFormData({});
          loadTableData(selectedTable);
          loadTables();
          return;
        }
      } else if (editingRow) {
        const pkCol = tableData.columns.find(c => c.pk === 1) || tableData.columns.find(c => c.name === 'name' || c.name === 'id') || tableData.columns[0];
        const res = await fetch(`${API_BASE}/database/table/${selectedTable}/row`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            primaryKey: pkCol.name,
            primaryValue: editingRow[pkCol.name],
            data: formData
          })
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          showToast(`Row updated in ${selectedTable}!`);
          setEditingRow(null);
          setFormData({});
          loadTableData(selectedTable);
          return;
        }
      }
    } catch (err) {
      console.warn('Saving row to local in-memory DB store');
    }

    // Fallback local save
    const currentTbl = dbStore[selectedTable] || { columns: [], rows: [] };
    const pkCol = (currentTbl.columns || []).find(c => c.pk === 1) || { name: 'name' };
    
    if (isCreatingRow) {
      const newRow = { [pkCol.name]: `REC-${Date.now().toString().slice(-4)}`, ...formData };
      setDbStore(prev => ({
        ...prev,
        [selectedTable]: {
          ...currentTbl,
          rows: [newRow, ...(currentTbl.rows || [])]
        }
      }));
      showToast(`Row added to ${selectedTable}!`);
      setIsCreatingRow(false);
      setFormData({});
    } else if (editingRow) {
      const pkVal = editingRow[pkCol.name];
      setDbStore(prev => ({
        ...prev,
        [selectedTable]: {
          ...currentTbl,
          rows: (currentTbl.rows || []).map(r => r[pkCol.name] === pkVal ? { ...r, ...formData } : r)
        }
      }));
      showToast(`Row updated in ${selectedTable}!`);
      setEditingRow(null);
      setFormData({});
    }
  };

  const handleDeleteRow = async (row) => {
    const pkCol = tableData.columns.find(c => c.pk === 1) || tableData.columns.find(c => c.name === 'name' || c.name === 'id') || tableData.columns[0];
    const pkVal = row[pkCol.name];
    
    if (!window.confirm(`Are you sure you want to delete row with ${pkCol.name}="${pkVal}" from ${selectedTable}?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/database/table/${selectedTable}/row`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryKey: pkCol.name,
          primaryValue: pkVal
        })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        showToast(`Row deleted from ${selectedTable}!`);
        loadTableData(selectedTable);
        loadTables();
        return;
      }
    } catch (err) {
      console.warn('Deleting row from local in-memory DB store');
    }

    // Fallback local delete
    const currentTbl = dbStore[selectedTable] || { columns: [], rows: [] };
    setDbStore(prev => ({
      ...prev,
      [selectedTable]: {
        ...currentTbl,
        rows: (currentTbl.rows || []).filter(r => r[pkCol.name] !== pkVal)
      }
    }));
    showToast(`Row deleted from ${selectedTable}!`);
  };

  // Lookup maps for clean foreign keys
  const studentMap = {
    'STU 001': 'Devon Patel',
    'STU 002': 'Aarav Sharma',
    'STU 003': 'Diya Gupta',
    'STU 004': 'Rohan Mehta',
    'STU 005': 'Ananya Iyer',
    'STU 006': 'Kabir Singh'
  };

  const teacherMap = {
    'TEA 001': 'Prof. Sarah Jenkins',
    'TEA 002': 'Dr. Evelyn Reed',
    'TEA 003': 'Mr. Robert Chen',
    'TEA 004': 'Ms. Clara Oswald'
  };

  const classMap = {
    'CLS 10A': 'Class 10A (Room 204)',
    'CLS 10B': 'Class 10B (Room 205)',
    'CLS 11A': 'Class 11A (Room 301)'
  };

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
                Click Edit on any row to modify its values, Add Row to insert new records, or export this sheet to Excel.
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

              {/* Export Current Table to Excel */}
              <button
                onClick={handleExportCurrentTable}
                className="px-3 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                title="Export this table to Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Export Sheet</span>
              </button>

              {/* Add Row Button */}
              <button
                onClick={() => {
                  const initial = {};
                  tableData.columns.forEach(c => { initial[c.name] = ''; });
                  setFormData(initial);
                  setIsCreatingRow(true);
                }}
                className="px-3.5 py-2 rounded-2xl bg-[#00a884] hover:bg-[#009172] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#00a884]/20 cursor-pointer flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
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
              <p className="text-xs text-slate-400 font-medium">Loading table rows from SQLite database...</p>
            </div>
          ) : tableData.rows.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold">No records found in {selectedTable}</p>
              <p className="text-[11px]">Click "Add Row" to insert the first record.</p>
            </div>
          ) : (
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

                        // Foreign key badge for student
                        if ((col.name === 'child' || col.name === 'student' || col.name === 'student_id') && studentMap[val]) {
                          return (
                            <td key={col.name} className="py-2.5 px-3 max-w-[220px] truncate text-[11px]">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-bold">
                                <span className="font-mono text-teal-600">{val}</span>
                                <span className="text-slate-700 font-semibold">• {studentMap[val]}</span>
                              </span>
                            </td>
                          );
                        }

                        // Foreign key badge for teacher
                        if ((col.name === 'teacher' || col.name === 'class_teacher' || col.name === 'assigned_by') && teacherMap[val]) {
                          return (
                            <td key={col.name} className="py-2.5 px-3 max-w-[220px] truncate text-[11px]">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold">
                                <span className="font-mono text-indigo-600">{val}</span>
                                <span className="text-slate-700 font-semibold">• {teacherMap[val]}</span>
                              </span>
                            </td>
                          );
                        }

                        // Foreign key badge for class
                        if ((col.name === 'class_batch' || col.name === 'batch_id') && classMap[val]) {
                          return (
                            <td key={col.name} className="py-2.5 px-3 max-w-[200px] truncate text-[11px]">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-bold">
                                <span className="font-mono text-purple-600">{val}</span>
                                <span className="text-slate-600">({classMap[val]})</span>
                              </span>
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

      {/* CREATE / EDIT ROW MODAL */}
      {(isCreatingRow || editingRow) && (
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
                  <p className="text-xs text-slate-400">Changes will be saved directly into SQLite database.</p>
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
            <form onSubmit={handleSaveRow} className="flex-1 overflow-y-auto pr-1 py-4 space-y-3">
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
