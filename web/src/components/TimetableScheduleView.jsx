import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  User, 
  Filter, 
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api.js';

export default function TimetableScheduleView() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('BATCH-10A-2026');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('All');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    api.getBatches().then(setBatches).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getSchedule(selectedBatch, selectedDay === 'All' ? '' : selectedDay)
      .then(setSchedules)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedBatch, selectedDay]);

  const grouped = days.reduce((acc, d) => {
    acc[d] = schedules.filter(s => s.day_of_week === d);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Nairee Timetable Header & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#cde8e8] shadow-swift-card">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-swift-dark">Smart AI Timetable</h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              <span className="badge-dot"></span>
              Conflict-Free Scheduler
            </span>
          </div>
          <p className="text-xs text-swift-muted mt-1">
            Weekly academic periods, teacher workload allocation, and classroom assignments
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Batch Selector */}
          <div className="flex items-center gap-2 bg-[#edfafa] px-3 py-1.5 rounded-xl border border-[#cde8e8]">
            <Filter className="w-4 h-4 text-swift-muted" />
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

          {/* Day Filter Pills */}
          <div className="flex items-center gap-1 bg-[#edfafa] p-1 rounded-xl border border-[#cde8e8]">
            {['All', ...days].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedDay === d
                    ? 'bg-brand-600 text-white shadow-swift-sm'
                    : 'text-swift-muted hover:text-swift-dark'
                }`}
              >
                {d === 'All' ? 'Week View' : d.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nairee AI Optimization Suggestion Box (.ai-suggestion style) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 via-emerald-50 to-[#f0fdfa] border border-brand-200 shadow-swift-sm flex items-start gap-3 text-xs text-swift-body">
        <div className="p-2 rounded-xl bg-brand-600 text-white shrink-0 mt-0.5 shadow-swift-sm">
          <Zap className="w-4 h-4 text-swift-electric" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-brand-900 uppercase tracking-wide text-[10px]">
              AI Schedule Optimization Active
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Zero Conflicts
            </span>
          </div>
          <p className="mt-1 text-swift-body leading-relaxed">
            All periods for <span className="font-bold text-swift-dark">Grade 10-A (Honors)</span> have been calibrated. Computer Science lab sessions in Lab B follow morning Calculus classes without instructor overlaps.
          </p>
        </div>
      </div>

      {/* Nairee Timetable Shell (.tt-shell & cards) */}
      {loading ? (
        <div className="p-12 text-center text-swift-muted text-xs bg-white rounded-2xl border border-[#cde8e8]">
          Loading timetable grid...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {days
            .filter(d => selectedDay === 'All' || selectedDay === d)
            .map((day) => {
              const daySlots = grouped[day] || [];
              const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;

              return (
                <div
                  key={day}
                  className={`bg-white rounded-2xl border p-4 shadow-swift-card flex flex-col transition-all ${
                    isToday ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-[#cde8e8]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#cde8e8]">
                    <span className="font-extrabold text-sm text-swift-dark">{day}</span>
                    {isToday && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
                        Today
                      </span>
                    )}
                    <span className="text-[11px] font-medium text-swift-muted">
                      {daySlots.length} Periods
                    </span>
                  </div>

                  <div className="space-y-3 flex-1">
                    {daySlots.length === 0 ? (
                      <div className="h-32 flex items-center justify-center text-swift-muted text-xs italic">
                        No periods scheduled
                      </div>
                    ) : (
                      daySlots.map((slot) => {
                        // Nairee pastel slot chip styling
                        let badgeBg = 'bg-teal-50 text-teal-800 border-teal-200';
                        if (slot.subject.includes('Math')) badgeBg = 'bg-indigo-50 text-indigo-800 border-indigo-200';
                        if (slot.subject.includes('Computer')) badgeBg = 'bg-sky-50 text-sky-800 border-sky-200';
                        if (slot.subject.includes('Physics')) badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                        if (slot.subject.includes('English')) badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';

                        return (
                          <div
                            key={slot.name}
                            className="p-3.5 rounded-xl border border-[#cde8e8] bg-[#f4fafa]/60 hover:bg-white hover:shadow-swift-sm transition-all group"
                            style={{
                              borderLeftWidth: '4px',
                              borderLeftColor: slot.color || '#0d9488'
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${badgeBg}`}>
                                {slot.subject}
                              </span>
                              <div className="flex items-center gap-1 text-[11px] font-bold text-swift-muted">
                                <Clock className="w-3 h-3 text-brand-600" />
                                <span>{slot.from_time.slice(0, 5)} - {slot.to_time.slice(0, 5)}</span>
                              </div>
                            </div>

                            <h4 className="font-bold text-xs text-swift-dark mt-2 group-hover:text-brand-600 transition-colors">
                              {slot.title || slot.subject}
                            </h4>

                            <div className="mt-2.5 pt-2 border-t border-[#cde8e8]/60 flex flex-col gap-1 text-[11px] text-swift-muted">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-brand-500" />
                                <span className="font-semibold text-swift-body">{slot.room}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <User className="w-3 h-3 text-brand-500" />
                                <span className="font-medium text-swift-body">{slot.faculty_name}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
