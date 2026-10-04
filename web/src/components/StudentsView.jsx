import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Filter, 
  X, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  Receipt, 
  Clock,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { api, subscribeLiveEvents } from '../api.js';

export default function StudentsView({ searchQuery, onSelectStudentPortal }) {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('profile');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    student_email_id: '',
    student_mobile_number: '',
    date_of_birth: '2010-05-15',
    gender: 'Female',
    blood_group: 'O+',
    student_batch: 'BATCH-10A-2026',
    address_line_1: '',
    city: 'Springfield',
    pincode: '62704'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, batchesData] = await Promise.all([
        api.getStudents(selectedBatch === 'all' ? '' : selectedBatch, searchQuery),
        api.getBatches()
      ]);
      setStudents(studentsData);
      setBatches(batchesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBatch, searchQuery]);

  // Live real-time sync across tabs and P&L fee settlements
  useEffect(() => {
    const unsub = subscribeLiveEvents((event) => {
      if (event?.type === 'fee_updated' || event?.type === 'attendance_updated') {
        loadData();
      }
    });
    return () => unsub();
  }, [selectedBatch, searchQuery]);

  const handleOpenDetail = async (student) => {
    setSelectedStudent(student);
    setDetailLoading(true);
    setActiveModalTab('profile');
    try {
      const details = await api.getStudentDetail(student.name);
      setStudentDetails(details);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await api.createStudent(formData);
      setShowAddModal(false);
      setFormData({
        first_name: '',
        last_name: '',
        student_email_id: '',
        student_mobile_number: '',
        date_of_birth: '2010-05-15',
        gender: 'Female',
        blood_group: 'O+',
        student_batch: 'BATCH-10A-2026',
        address_line_1: '',
        city: 'Springfield',
        pincode: '62704'
      });
      loadData();
    } catch (err) {
      alert('Error registering student: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#cde8e8] shadow-swift-card">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-swift-dark">Student Directory</h2>
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold border border-brand-200">
              <span className="badge-dot"></span>
              {students.length} Enrolled
            </span>
          </div>
          <p className="text-xs text-swift-muted mt-1">
            Complete biographical, enrollment, and guardian records
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Batch Selector */}
          <div className="flex items-center gap-2 bg-[#edfafa] px-3 py-1.5 rounded-xl border border-[#cde8e8]">
            <Filter className="w-4 h-4 text-swift-muted" />
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="text-xs font-bold bg-transparent text-swift-dark focus:outline-none cursor-pointer"
            >
              <option value="all">All Batches</option>
              {batches.map((b) => (
                <option key={b.name} value={b.name}>{b.batch_name}</option>
              ))}
            </select>
          </div>

          {/* New Student Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-swift-teal transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Register Student
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-[#cde8e8] shadow-swift-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-swift-muted text-xs">Loading student records...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-swift-muted text-xs">No students found matching your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#edfafa]/80 border-b border-[#cde8e8] text-[11px] font-bold text-swift-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">DocType ID</th>
                  <th className="py-3.5 px-4">Batch / Class</th>
                  <th className="py-3.5 px-4">Roll No</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-swift-body">
                {students.map((s) => (
                  <tr
                    key={s.name}
                    className="hover:bg-[#edfafa]/50 transition-colors group cursor-pointer"
                    onClick={() => handleOpenDetail(s)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={s.student_name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#cde8e8]"
                        />
                        <div>
                          <div className="flex items-center flex-wrap gap-1.5">
                            <span className="font-bold text-swift-dark group-hover:text-brand-600 transition-colors">
                              {s.student_name}
                            </span>
                            {s.student_name.includes('Nairee') && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                Featured
                              </span>
                            )}
                            {/* LIVE FEE STATUS BADGE DIRECTLY ON SIDE OF STUDENT NAME */}
                            {(s.fee_status === 'Paid' || (s.balance_due === 0 && s.fee_due === 0)) ? (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Fee Paid
                              </span>
                            ) : (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                Due ₹{s.balance_due || s.fee_due || s.feeDues || 35000}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-swift-muted">{s.student_email_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <code className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#edfafa] text-brand-700 border border-[#cde8e8]">
                        {s.name}
                      </code>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-swift-dark">
                      {s.batch_name || s.student_batch}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-swift-dark">
                      #{s.roll_no}
                    </td>
                    <td className="py-3.5 px-4 text-swift-muted">
                      {s.student_mobile_number || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                        {s.blood_group}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(s);
                        }}
                        className="px-3 py-1 text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200 transition-all cursor-pointer"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* STUDENT DETAIL MODAL / DRAWER */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-swift-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#cde8e8] w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-swift-dark via-brand-900 to-brand-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudent.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  alt={selectedStudent.student_name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold">{selectedStudent.student_name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white">
                      {selectedStudent.name}
                    </span>
                  </div>
                  <p className="text-xs text-brand-100 mt-1">
                    Roll #{selectedStudent.roll_no} • {selectedStudent.batch_name || selectedStudent.student_batch}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-[#cde8e8] bg-[#edfafa]/80 px-6 gap-2">
              {[
                { id: 'profile', label: 'Bio & Guardians', icon: Users },
                { id: 'attendance', label: 'Attendance History', icon: Clock },
                { id: 'grades', label: 'Academic Grades', icon: Award },
                { id: 'fees', label: 'Fee Invoices', icon: Receipt },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeModalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveModalTab(tab.id)}
                    className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                      isActive
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-swift-muted hover:text-swift-dark'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {detailLoading ? (
                <div className="p-12 text-center text-swift-muted text-xs">Loading complete student dossier...</div>
              ) : studentDetails ? (
                <div>
                  {activeModalTab === 'profile' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="p-3.5 rounded-xl bg-[#edfafa]/60 border border-[#cde8e8]">
                          <p className="text-[10px] uppercase font-bold text-swift-muted">Date of Birth</p>
                          <p className="text-xs font-bold text-swift-dark mt-1">{studentDetails.date_of_birth}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#edfafa]/60 border border-[#cde8e8]">
                          <p className="text-[10px] uppercase font-bold text-swift-muted">Gender</p>
                          <p className="text-xs font-bold text-swift-dark mt-1">{studentDetails.gender}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#edfafa]/60 border border-[#cde8e8]">
                          <p className="text-[10px] uppercase font-bold text-swift-muted">Blood Group</p>
                          <p className="text-xs font-bold text-rose-600 mt-1">{studentDetails.blood_group}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#edfafa]/60 border border-[#cde8e8]">
                          <p className="text-[10px] uppercase font-bold text-swift-muted">Email Address</p>
                          <p className="text-xs font-bold text-swift-dark mt-1">{studentDetails.student_email_id}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#edfafa]/60 border border-[#cde8e8]">
                          <p className="text-[10px] uppercase font-bold text-swift-muted">Mobile Phone</p>
                          <p className="text-xs font-bold text-swift-dark mt-1">{studentDetails.student_mobile_number}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#edfafa]/60 border border-[#cde8e8]">
                          <p className="text-[10px] uppercase font-bold text-swift-muted">Admission Date</p>
                          <p className="text-xs font-bold text-swift-dark mt-1">{studentDetails.joining_date}</p>
                        </div>
                      </div>

                      {/* Guardians */}
                      <div>
                        <h4 className="text-xs font-bold text-swift-dark mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-brand-600" />
                          Guardians & Parent Records (tabGuardian)
                        </h4>
                        {studentDetails.guardians?.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {studentDetails.guardians.map((g) => (
                              <div key={g.id} className="p-3.5 rounded-xl bg-[#edfafa]/50 border border-[#cde8e8]">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold text-swift-dark">{g.guardian_name}</p>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                                    {g.relation}
                                  </span>
                                </div>
                                <p className="text-[11px] text-swift-muted mt-1">{g.email_address}</p>
                                <p className="text-[11px] text-swift-muted">{g.mobile_number}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-swift-muted">No guardian contacts recorded.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: ATTENDANCE */}
                  {activeModalTab === 'attendance' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-emerald-900">Attendance Summary</p>
                          <p className="text-xs text-emerald-700 mt-0.5">
                            {studentDetails.attendance?.presentDays} days present out of {studentDetails.attendance?.totalDays} school days
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-extrabold text-emerald-800">
                            {studentDetails.attendance?.percentage}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {studentDetails.attendance?.records?.map((r) => (
                          <div key={r.name} className="flex items-center justify-between p-3 rounded-xl bg-[#edfafa]/50 border border-[#cde8e8] text-xs">
                            <div>
                              <p className="font-bold text-swift-dark">{r.date}</p>
                              <p className="text-[11px] text-swift-muted">{r.subject || 'Full-Day Session'}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              r.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {r.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: GRADES */}
                  {activeModalTab === 'grades' && (
                    <div className="space-y-3">
                      {studentDetails.assessments?.length > 0 ? (
                        studentDetails.assessments.map((res) => (
                          <div key={res.name} className="flex items-center justify-between p-3.5 rounded-xl bg-[#edfafa]/50 border border-[#cde8e8] text-xs">
                            <div>
                              <p className="font-bold text-swift-dark">{res.assessment_name || res.course}</p>
                              <p className="text-[11px] text-swift-muted font-medium">{res.comment}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-swift-dark">
                                {res.score} / {res.maximum_score}
                              </span>
                              <span className="ml-2 font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800 text-[11px]">
                                {res.grade}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-swift-muted p-4">No examination records found for this student.</p>
                      )}
                    </div>
                  )}

                  {/* TAB 4: FEES */}
                  {activeModalTab === 'fees' && (
                    <div className="space-y-4">
                      {studentDetails.fees?.map((fee) => (
                        <div key={fee.name} className="p-4 rounded-2xl bg-[#edfafa]/50 border border-[#cde8e8]">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-mono text-[10px] font-bold text-swift-muted">{fee.name}</span>
                              <h5 className="font-bold text-xs text-swift-dark mt-0.5">{fee.academic_term} Tuition & Campus Fees</h5>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              fee.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {fee.status}
                            </span>
                          </div>

                          <div className="mt-3 pt-3 border-t border-[#cde8e8] flex items-center justify-between text-xs">
                            <span className="text-swift-muted">Total: ₹{Number(fee.grand_total || 0).toLocaleString('en-IN')}</span>
                            <span className="font-extrabold text-swift-dark">
                              Outstanding: ₹{Number(fee.outstanding_amount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* NEW STUDENT REGISTRATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-swift-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#cde8e8] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-swift-dark to-brand-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Register New Student</h3>
                <p className="text-xs text-brand-100">Creates new record with Frappe EDU-STU auto-series</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-swift-dark block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#cde8e8] bg-[#f4fafa] focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    placeholder="e.g. Liam"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-swift-dark block mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#cde8e8] bg-[#f4fafa] focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    placeholder="e.g. Vance"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-swift-dark block mb-1">Email ID</label>
                  <input
                    type="email"
                    value={formData.student_email_id}
                    onChange={(e) => setFormData({ ...formData, student_email_id: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#cde8e8] bg-[#f4fafa] focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    placeholder="student@school.edu"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-swift-dark block mb-1">Mobile</label>
                  <input
                    type="text"
                    value={formData.student_mobile_number}
                    onChange={(e) => setFormData({ ...formData, student_mobile_number: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#cde8e8] bg-[#f4fafa] focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    placeholder="+1 (555) 019-..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-swift-dark block mb-1">Batch</label>
                  <select
                    value={formData.student_batch}
                    onChange={(e) => setFormData({ ...formData, student_batch: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#cde8e8] bg-[#f4fafa] focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    {batches.map((b) => (
                      <option key={b.name} value={b.name}>{b.batch_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-swift-dark block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#cde8e8] bg-[#f4fafa] focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-Binary">Non-Binary</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-swift-dark block mb-1">Blood Group</label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#cde8e8] bg-[#f4fafa] focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#cde8e8]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-swift-muted hover:bg-[#edfafa] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-swift-teal cursor-pointer"
                >
                  Save & Generate ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
