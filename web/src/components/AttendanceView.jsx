import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Calendar, 
  Users, 
  Check, 
  X, 
  Clock, 
  AlertCircle, 
  Save, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { api } from '../api.js';

export default function AttendanceView() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('BATCH-10A-2026');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    api.getBatches().then(setBatches).catch(console.error);
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const data = await api.getAttendance(selectedBatch, selectedDate);
      setStudents(data.students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBatch && selectedDate) {
      loadAttendance();
    }
  }, [selectedBatch, selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setStudents(prev => prev.map(s => {
      if (s.name === studentId) {
        return { ...s, status };
      }
      return s;
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setStudents(prev => prev.map(s => {
      if (s.name === studentId) {
        return { ...s, remarks };
      }
      return s;
    }));
  };

  const markAll = (status) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const records = students.map(s => ({
        student: s.name,
        student_name: s.student_name,
        status: s.status,
        remarks: s.remarks || ''
      }));

      await api.submitBulkAttendance(selectedBatch, selectedDate, records);
      setToastMessage(`✅ Successfully recorded attendance for ${records.length} students on ${selectedDate}!`);
      setTimeout(() => setToastMessage(''), 4000);
      loadAttendance();
    } catch (err) {
      alert('Error saving attendance: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Metrics
  const presentCount = students.filter(s => s.status === 'Present').length;
  const absentCount = students.filter(s => s.status === 'Absent').length;
  const lateCount = students.filter(s => s.status === 'Late').length;
  const excusedCount = students.filter(s => s.status === 'Excused').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-between animate-in fade-in duration-200">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Bar: Frappe Bulk Attendance Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">Student Attendance Tool</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold border border-brand-200">
                tabStudentAttendance
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Frappe bulk attendance workflow with live percentage calculations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Batch Selector */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Users className="w-4 h-4 text-slate-400" />
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="text-xs font-bold bg-transparent text-slate-800 focus:outline-none cursor-pointer"
              >
                {batches.map((b) => (
                  <option key={b.name} value={b.name}>{b.batch_name}</option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-bold bg-transparent text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Submit Attendance'}
            </button>
          </div>
        </div>

        {/* Quick Batch Actions & Summary Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold mr-1">Quick Actions:</span>
            <button
              onClick={() => markAll('Present')}
              className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer"
            >
              ✓ Mark All Present
            </button>
            <button
              onClick={() => markAll('Absent')}
              className="px-3 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
            >
              ✗ Mark All Absent
            </button>
          </div>

          {/* Counts */}
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {presentCount} Present
            </span>
            <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
              {absentCount} Absent
            </span>
            <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              {lateCount} Late
            </span>
            <span className="text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
              {excusedCount} Excused
            </span>
          </div>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading batch roster...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Roll No</th>
                  <th className="py-3.5 px-4 text-center">Attendance Status</th>
                  <th className="py-3.5 px-4">Teacher's Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {students.map((student) => (
                  <tr key={student.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={student.student_name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            {student.student_name}
                            {student.name === 'EDU-STU-2026-00001' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                Nairee
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">{student.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      #{student.roll_no}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {['Present', 'Absent', 'Late', 'Excused'].map((status) => {
                          const isSelected = student.status === status;
                          let style = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                          if (isSelected) {
                            if (status === 'Present') style = 'bg-emerald-600 text-white shadow-sm';
                            else if (status === 'Absent') style = 'bg-rose-600 text-white shadow-sm';
                            else if (status === 'Late') style = 'bg-amber-500 text-white shadow-sm';
                            else if (status === 'Excused') style = 'bg-sky-600 text-white shadow-sm';
                          }

                          return (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(student.name, status)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${style}`}
                            >
                              {status}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <input
                        type="text"
                        placeholder="Optional remarks..."
                        value={student.remarks || ''}
                        onChange={(e) => handleRemarksChange(student.name, e.target.value)}
                        className="w-full text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
