import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Filter, 
  Sparkles
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

  // Group by Day
  const grouped = days.reduce((acc, d) => {
    acc[d] = schedules.filter(s => s.day_of_week === d);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">Course Schedule & Timetable</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold border border-sky-200">
              tabSubjectSchedule
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Weekly academic scheduling, room allocations, and faculty assignments
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Batch Selector */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-400" />
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

          {/* Day Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['All', ...days].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedDay === d
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {d === 'All' ? 'Full Week' : d.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timetable Calendar Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-2xl">Loading schedule...</div>
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
                  className={`bg-white rounded-2xl border p-4 shadow-sm flex flex-col ${
                    isToday ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <span className="font-extrabold text-sm text-slate-900">{day}</span>
                    {isToday && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
                        Today
                      </span>
                    )}
                    <span className="text-[11px] font-medium text-slate-400">
                      {daySlots.length} Classes
                    </span>
                  </div>

                  <div className="space-y-3 flex-1">
                    {daySlots.length === 0 ? (
                      <div className="h-32 flex items-center justify-center text-slate-400 text-xs italic">
                        No classes scheduled
                      </div>
                    ) : (
                      daySlots.map((slot) => (
                        <div
                          key={slot.name}
                          className="p-3.5 rounded-xl border border-slate-100/80 hover:shadow-md transition-all group"
                          style={{
                            borderLeftWidth: '4px',
                            borderLeftColor: slot.color || '#4F46E5',
                            backgroundColor: `${slot.color || '#4F46E5'}08`
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="text-[10px] font-extrabold px-2 py-0.5 rounded"
                              style={{
                                color: slot.color || '#4F46E5',
                                backgroundColor: `${slot.color || '#4F46E5'}15`
                              }}
                            >
                              {slot.subject || slot.course}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{slot.from_time.slice(0, 5)} - {slot.to_time.slice(0, 5)}</span>
                            </div>
                          </div>

                          <h4 className="font-bold text-xs text-slate-900 mt-2 group-hover:text-brand-600 transition-colors">
                            {slot.title || slot.subject}
                          </h4>

                          <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex flex-col gap-1 text-[11px] text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span className="font-medium text-slate-700">{slot.room}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-slate-400" />
                              <span className="font-medium text-slate-700">{slot.faculty_name}</span>
                            </div>
                          </div>
                        </div>
                      ))
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
