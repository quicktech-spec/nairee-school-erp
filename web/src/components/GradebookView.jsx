import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Plus, 
  X, 
  TrendingUp, 
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { api, subscribeLiveEvents } from '../api.js';

export default function GradebookView() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);

  const [gradeForm, setGradeForm] = useState({
    assessment_plan: '',
    course: '',
    student: '',
    score: 95,
    maximum_score: 100,
    comment: ''
  });

  const loadInitialData = () => {
    Promise.all([
      api.getAssessmentPlans(),
      api.getStudents('CLS-10A'),
      api.getCourses()
    ]).then(([plansData, studentsData, coursesData]) => {
      setPlans(plansData);
      setStudents(studentsData);
      setCourses(coursesData);
      if (plansData.length > 0 && !selectedPlan) {
        setSelectedPlan(plansData[0].name);
        setGradeForm(prev => ({
          ...prev,
          assessment_plan: plansData[0].name,
          course: plansData[0].course,
          student: studentsData[0]?.student_id || studentsData[0]?.name || ''
        }));
      }
    }).catch(console.error);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await api.getAssessmentResults({ plan: selectedPlan });
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPlan) {
      loadResults();
    }
  }, [selectedPlan]);

  // Subscribe to live multi-tab & cross-component database sync events
  useEffect(() => {
    const unsub = subscribeLiveEvents((event) => {
      loadResults();
      api.getStudents('CLS-10A').then(setStudents);
    });
    return () => unsub();
  }, [selectedPlan]);

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    try {
      const studentObj = students.find(s => s.student_id === gradeForm.student || s.name === gradeForm.student || s.student_name === gradeForm.student);
      await api.submitGrade({
        ...gradeForm,
        student_id: studentObj ? (studentObj.student_id || studentObj.id) : gradeForm.student,
        student_name: studentObj ? (studentObj.student_name || studentObj.name) : '',
        roll_no: studentObj ? studentObj.roll_no : '01',
        class_batch: studentObj ? (studentObj.class_batch || studentObj.student_batch) : 'Class 10 - Section A',
        student_batch: 'CLS-10A'
      });
      setShowAddGradeModal(false);
      loadResults();
    } catch (err) {
      alert('Error submitting grade: ' + err.message);
    }
  };

  const currentPlan = plans.find(p => p.name === selectedPlan);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#cde8e8] shadow-swift-card">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-swift-dark">Examinations & Gradebook</h2>
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              <span className="badge-dot !bg-emerald-500"></span>
              tabAssessmentResult
            </span>
          </div>
          <p className="text-xs text-swift-muted mt-1">
            Standard evaluation scales, course weightages, and auto-letter grading
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPlan}
            onChange={(e) => {
              setSelectedPlan(e.target.value);
              const p = plans.find(x => x.name === e.target.value);
              if (p) setGradeForm(f => ({ ...f, assessment_plan: p.name, course: p.course }));
            }}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-[#edfafa] border border-[#cde8e8] text-swift-dark focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            {plans.map((p) => (
              <option key={p.name} value={p.name}>
                {p.assessment_name} ({p.subject})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddGradeModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-swift-teal transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Enter Marks
          </button>
        </div>
      </div>

      {/* Plan Details Card */}
      {currentPlan && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-[#edfafa] border border-[#cde8e8] flex flex-wrap items-center justify-between gap-4 shadow-swift-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-600 text-white shadow-swift-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-swift-dark">{currentPlan.assessment_name}</h3>
              <p className="text-xs text-swift-muted">
                Course: {currentPlan.course_name} • Group: {currentPlan.assessment_group}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold text-swift-body">
            <div>
              <span className="text-swift-muted block text-[10px] uppercase">Max Marks</span>
              <span className="text-swift-dark font-extrabold text-sm">{currentPlan.maximum_score}</span>
            </div>
            <div>
              <span className="text-swift-muted block text-[10px] uppercase">Weightage</span>
              <span className="text-brand-600 font-extrabold text-sm">{currentPlan.weightage}%</span>
            </div>
            <div>
              <span className="text-swift-muted block text-[10px] uppercase">Session</span>
              <span className="text-swift-dark">{currentPlan.academic_year}</span>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-[#cde8e8] shadow-swift-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-swift-muted text-xs">Loading grade records...</div>
        ) : results.length === 0 ? (
          <div className="p-12 text-center text-swift-muted text-xs">No marks recorded yet for this examination.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#edfafa]/80 border-b border-[#cde8e8] text-[11px] font-bold text-swift-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student & ID</th>
                  <th className="py-3.5 px-4">Roll No & Section</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Percentage</th>
                  <th className="py-3.5 px-4">Letter Grade</th>
                  <th className="py-3.5 px-4">Faculty Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-swift-body">
                {results.map((r) => (
                  <tr key={r.result_id || r.name} className="hover:bg-[#edfafa]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-swift-dark flex items-center gap-1.5">
                        {r.student_name}
                        {r.student_name && r.student_name.includes('Nairee') && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            ★ Top Scorer
                          </span>
                        )}
                      </p>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 inline-block mt-0.5">
                        {r.student_id || r.student}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-800 text-xs px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200">
                          Roll #{r.roll_no ? String(r.roll_no).padStart(2, '0') : '01'}
                        </span>
                        <span className="text-[11px] font-bold text-teal-700 bg-teal-50/60 px-2 py-0.5 rounded-lg border border-teal-100">
                          {r.class_batch || r.student_batch || 'Class 10 - Section A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-swift-dark">
                      {r.score} <span className="text-swift-muted font-normal">/ {r.maximum_score}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#edfafa] rounded-full h-1.5 overflow-hidden border border-[#cde8e8]">
                          <div
                            className="bg-brand-500 h-1.5 rounded-full"
                            style={{ width: `${r.percentage}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-swift-dark">{r.percentage}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md ${
                        r.grade === 'A+' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        r.grade === 'A' ? 'bg-teal-100 text-teal-800 border border-teal-300' :
                        r.grade === 'B+' ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {r.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-swift-muted italic">
                      "{r.comment || 'Satisfactory'}"
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ENTER GRADE MODAL */}
      {showAddGradeModal && (
        <div className="fixed inset-0 z-50 bg-swift-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#cde8e8] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-swift-dark to-brand-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Enter Assessment Score</h3>
                <p className="text-xs text-brand-100">Auto-computes percentage & Frappe letter grade</p>
              </div>
              <button onClick={() => setShowAddGradeModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitGrade} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-swift-dark block mb-1">Student</label>
                <select
                  value={gradeForm.student}
                  onChange={(e) => setGradeForm({ ...gradeForm, student: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#cde8e8] bg-[#f4fafa] focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  {students.map((s) => (
                    <option key={s.name} value={s.name}>{s.student_name} (#{s.roll_no})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-swift-dark block mb-1">Marks Scored</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={gradeForm.score}
                    onChange={(e) => setGradeForm({ ...gradeForm, score: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#cde8e8] bg-[#f4fafa] focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-bold text-base"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-swift-dark block mb-1">Max Marks</label>
                  <input
                    type="number"
                    readOnly
                    value={gradeForm.maximum_score}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#cde8e8] bg-slate-100 text-swift-muted font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-swift-dark block mb-1">Faculty Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Excellent conceptual grasp"
                  value={gradeForm.comment}
                  onChange={(e) => setGradeForm({ ...gradeForm, comment: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#cde8e8] bg-[#f4fafa] focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#cde8e8]">
                <button
                  type="button"
                  onClick={() => setShowAddGradeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-swift-muted hover:bg-[#edfafa] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-swift-teal cursor-pointer"
                >
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
