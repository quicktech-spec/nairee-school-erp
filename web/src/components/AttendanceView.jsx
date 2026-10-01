import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Calendar, 
  Users, 
  X, 
  Save, 
  Sparkles
} from 'lucide-react';
import { api } from '../api.js';

export default function AttendanceView({ onAttendanceSaved }) {
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
      if (onAttendanceSaved) onAttendanceSaved();
      loadAttendance();
    } catch (err) {
      alert('Error saving attendance: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter(s => s.status === 'Present').length;
  const absentCount = students.filter(s => s.status === 'Absent').length;
  const lateCount = students.filter(s => s.status === 'Late').length;
  const excusedCount = students.filter(s => s.status === 'Excused').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-brand-600 text-white font-bold text-xs shadow-swift-teal flex items-center justify-between animate-in fade-in duration-200">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Bar: Bulk Attendance Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#cde8e8] shadow-swift-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-swift-dark">Attendance Automation Tool</h2>
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold border border-brand-200">
                <span className="badge-dot"></span>
                tabStudentAttendance
              </span>
            </div>
            <p className="text-xs text-swift-muted mt-1">
              One-click classroom attendance marker with live cumulative statistics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Batch Selector */}
            <div className="flex items-center gap-2 bg-[#edfafa] px-3 py-1.5 rounded-xl border border-[#cde8e8]">
              <Users className="w-4 h-4 text-swift-muted" />
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="text-xs font-bold bg-transparent text-swift-dark focus:outline-none cursor-pointer"
              >
                {batches.map((b) => (
                  <option key={b.name} value={b.name}>{b.batch_name}</option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-[#edfafa] px-3 py-1.5 rounded-xl border border-[#cde8e8]">
              <Calendar className="w-4 h-4 text-swift-muted" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-bold bg-transparent text-swift-dark focus:outline-none cursor-pointer"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-swift-teal transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Submit Attendance'}
            </button>
          </div>
        </div>

        {/* Quick Batch Actions & Summary Bar */}
        <div className="pt-4 border-t border-[#cde8e8] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-swift-muted font-semibold mr-1">Batch Actions:</span>
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
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {presentCount} Present
            </span>
            <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
              {absentCount} Absent
            </span>
            <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              {lateCount} Late
            </span>
            <span className="text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
              {excusedCount} Excused
            </span>
          </div>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white rounded-2xl border border-[#cde8e8] shadow-swift-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-swift-muted text-xs">Loading batch roster...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#edfafa]/80 border-b border-[#cde8e8] text-[11px] font-bold text-swift-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Roll No</th>
                  <th className="py-3.5 px-4 text-center">Attendance Status</th>
                  <th className="py-3.5 px-4">Faculty Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-swift-body">
                {students.map((student) => (
                  <tr key={student.name} className="hover:bg-[#edfafa]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={student.student_name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#cde8e8]"
                        />
                        <div>
                          <p className="font-bold text-swift-dark flex items-center gap-1.5">
                            {student.student_name}
                            {student.name === 'EDU-STU-2026-00001' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                Nairee
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] font-mono text-swift-muted">{student.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-swift-dark">
                      #{student.roll_no}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {['Present', 'Absent', 'Late', 'Excused'].map((status) => {
                          const isSelected = student.status === status;
                          let style = 'bg-[#edfafa] text-swift-body hover:bg-[#d5f5f5]';
                          if (isSelected) {
                            if (status === 'Present') style = 'bg-emerald-600 text-white shadow-sm';
                            else if (status === 'Absent') style = 'bg-rose-600 text-white shadow-sm';
                            else if (status === 'Late') style = 'bg-amber-500 text-white shadow-sm';
                            else if (status === 'Excused') style = 'bg-teal-600 text-white shadow-sm';
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
                        className="w-full text-xs p-2 rounded-xl bg-[#f4fafa] border border-[#cde8e8] focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
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
