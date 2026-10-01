import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Info, 
  AlertCircle,
  Sparkles,
  BookOpen,
  Coffee
} from 'lucide-react';

// Known academic holidays and breaks for 2025-2026
const ACADEMIC_EVENTS = {
  // Format: 'YYYY-MM-DD'
  '2026-10-02': { status: 'OFF', title: 'Gandhi Jayanti', type: 'Gazetted National Holiday', description: 'National holiday commemorating Mahatma Gandhi’s birth.' },
  '2026-10-10': { status: 'ON', title: 'Parent-Teacher Meeting (PTM)', type: 'Half Day / Event', description: '09:00 AM – 01:30 PM. Parents discuss Term 1 progress with class teachers.' },
  '2026-10-12': { status: 'OFF', title: 'Dussehra / Vijayadashami', type: 'Public Holiday', description: 'School closed in celebration of Dussehra.' },
  '2026-10-14': { status: 'ON', title: 'Mid-Term Exams Begin', type: 'Exam Day', description: 'Theory exams start at 08:30 AM. Bring verified admit card.' },
  '2026-10-22': { status: 'ON', title: 'Mid-Term Exams Conclude', type: 'Exam Day', description: 'Final paper for Term 1.' },
  '2026-10-26': { status: 'OFF', title: 'Fall Semester Mid-Term Recess', type: 'Term Break', description: 'Autumn break. School reopens on Monday, Nov 2.' },
  '2026-10-27': { status: 'OFF', title: 'Fall Semester Mid-Term Recess', type: 'Term Break', description: 'Autumn break.' },
  '2026-10-28': { status: 'OFF', title: 'Fall Semester Mid-Term Recess', type: 'Term Break', description: 'Autumn break.' },
  '2026-10-29': { status: 'OFF', title: 'Fall Semester Mid-Term Recess', type: 'Term Break', description: 'Autumn break.' },
  '2026-10-30': { status: 'OFF', title: 'Fall Semester Mid-Term Recess', type: 'Term Break', description: 'Autumn break.' },
  '2026-11-01': { status: 'OFF', title: 'Sunday Weekend', type: 'Weekend', description: 'Weekly off.' },
  '2026-11-02': { status: 'ON', title: 'School Reopens', type: 'Instructional Day', description: 'Regular school session 08:00 AM – 03:30 PM.' },
  '2026-11-08': { status: 'OFF', title: 'Diwali Festival Break', type: 'Public Holiday', description: 'Deepavali festivities.' },
  '2026-11-09': { status: 'OFF', title: 'Diwali Festival Break', type: 'Public Holiday', description: 'Deepavali festivities.' },
  '2026-11-10': { status: 'OFF', title: 'Govardhan Puja', type: 'Public Holiday', description: 'School closed.' },
  '2026-11-15': { status: 'OFF', title: 'Guru Nanak Jayanti', type: 'Public Holiday', description: 'Gazetted public holiday.' },
  '2026-12-25': { status: 'OFF', title: 'Christmas Day', type: 'Public Holiday', description: 'Christmas winter celebration.' },
  // 2025 mappings (matching mobile mockup year 2025)
  '2025-10-02': { status: 'OFF', title: 'Gandhi Jayanti', type: 'Gazetted National Holiday', description: 'National holiday commemorating Mahatma Gandhi’s birth.' },
  '2025-10-12': { status: 'OFF', title: 'Dussehra / Weekend', type: 'Public Holiday', description: 'Vijayadashami festive break.' },
  '2025-10-19': { status: 'OFF', title: 'Sunday Weekend', type: 'Weekend', description: 'Weekly off.' },
  '2025-10-26': { status: 'OFF', title: 'Sunday Weekend', type: 'Weekend', description: 'Weekly off.' }
};

export default function SchoolCalendarView({ initialDate = new Date(2026, 9, 1) }) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    // Default to today or 1st of viewed month
    return new Date(2026, 9, 14); // Mid-term exam date for demonstration
  });
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'on', 'off'

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  // Build days for month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Helper to format date string YYYY-MM-DD
  const formatDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Determine if a specific day is ON or OFF
  const getDayInfo = (dayNum) => {
    const d = new Date(year, month, dayNum);
    const key = formatDateKey(d);
    const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat

    // Check custom holiday / event registry
    if (ACADEMIC_EVENTS[key]) {
      return {
        ...ACADEMIC_EVENTS[key],
        date: d,
        dateKey: key,
        dayNum
      };
    }

    // Default rule: Sunday (0) and Saturday (6) are OFF
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        status: 'OFF',
        title: dayOfWeek === 0 ? 'Sunday Weekend' : 'Saturday Weekend',
        type: 'Weekend',
        description: 'School campus closed for weekend recess.',
        date: d,
        dateKey: key,
        dayNum
      };
    }

    // Regular weekday is ON
    return {
      status: 'ON',
      title: 'Regular Academic School Day',
      type: 'Instructional Day',
      description: 'Active instructional day (08:00 AM – 03:30 PM). Regular timetable, attendance mandatory.',
      date: d,
      dateKey: key,
      dayNum
    };
  };

  // Compute month stats
  let totalOnDays = 0;
  let totalOffDays = 0;
  for (let i = 1; i <= daysInMonth; i++) {
    const info = getDayInfo(i);
    if (info.status === 'ON') totalOnDays++;
    else totalOffDays++;
  }

  // Selected Day Information
  const selectedKey = formatDateKey(selectedDate);
  const selectedDayInfo = ACADEMIC_EVENTS[selectedKey] || (() => {
    const dow = selectedDate.getDay();
    if (dow === 0 || dow === 6) {
      return {
        status: 'OFF',
        title: dow === 0 ? 'Sunday Weekend' : 'Saturday Weekend',
        type: 'Weekend',
        description: 'School campus closed for weekend recess.'
      };
    }
    return {
      status: 'ON',
      title: 'Regular Academic School Day',
      type: 'Instructional Day',
      description: 'Active instructional day (08:00 AM – 03:30 PM). All classes in session.'
    };
  })();

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats */}
      <div className="bg-gradient-to-r from-[#5673ec] via-[#6c8cff] to-[#5673ec] rounded-3xl p-6 text-white shadow-lg shadow-indigo-200/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2 backdrop-blur-sm border border-white/25">
            <CalendarIcon className="w-3.5 h-3.5 text-white" />
            <span>Academic Attendance & Schedule Calendar</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">School ON / OFF Tracker</h2>
          <p className="text-xs text-indigo-100 mt-1 max-w-xl">
            Live schedule for active school days, gazetted public holidays, term breaks, and special school events.
          </p>
        </div>

        {/* Quick KPI Pills */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-center min-w-[90px]">
            <div className="text-xl font-extrabold text-white">{totalOnDays}</div>
            <div className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              School ON
            </div>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-center min-w-[90px]">
            <div className="text-xl font-extrabold text-white">{totalOffDays}</div>
            <div className="text-[10px] text-rose-200 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              School OFF
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid & Selected Day View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Calendar Card (Matches Screen 1 from image) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-indigo-100 shadow-sm space-y-4">
          
          {/* Calendar Header with Month & Controls */}
          <div className="flex items-center justify-between pb-2 border-b border-indigo-50">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                {monthNames[month]} {year}
              </h3>
              <p className="text-xs text-slate-400">Click any date to inspect school status & details</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter Buttons */}
              <div className="hidden sm:flex items-center bg-indigo-50/60 p-1 rounded-xl border border-indigo-100 text-xs">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterMode === 'all' ? 'bg-white text-[#5673ec] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterMode('on')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterMode === 'on' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500 hover:text-emerald-700'
                  }`}
                >
                  🟢 ON ({totalOnDays})
                </button>
                <button
                  onClick={() => setFilterMode('off')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterMode === 'off' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:text-rose-700'
                  }`}
                >
                  🔴 OFF ({totalOffDays})
                </button>
              </div>

              {/* Prev / Next buttons matching image */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="w-8 h-8 rounded-xl bg-indigo-50/60 hover:bg-indigo-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="w-8 h-8 rounded-xl bg-indigo-50/60 hover:bg-indigo-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400">
            {weekdays.map((day, idx) => (
              <div key={day} className={`py-1 ${idx === 0 || idx === 6 ? 'text-rose-400 font-bold' : ''}`}>
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Leading empty spaces */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-14 sm:h-16 rounded-2xl bg-slate-50/40 border border-transparent" />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const info = getDayInfo(dayNum);
              const isSelected = selectedDate.getDate() === dayNum && 
                                 selectedDate.getMonth() === month && 
                                 selectedDate.getFullYear() === year;
              const isFilteredOut = (filterMode === 'on' && info.status !== 'ON') || 
                                   (filterMode === 'off' && info.status !== 'OFF');

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDate(new Date(year, month, dayNum))}
                  disabled={isFilteredOut}
                  className={`h-14 sm:h-16 rounded-2xl p-1.5 flex flex-col justify-between items-center transition-all cursor-pointer relative group ${
                    isFilteredOut 
                      ? 'opacity-20 cursor-not-allowed bg-slate-50' 
                      : isSelected
                        ? 'bg-[#5673ec] text-white shadow-md shadow-indigo-300/50 ring-2 ring-[#5673ec] ring-offset-2'
                        : 'bg-white hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200 text-slate-700 shadow-xs'
                  }`}
                >
                  {/* Day Number */}
                  <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {dayNum}
                  </span>

                  {/* Status Indicator Badges */}
                  <div className="w-full flex items-center justify-center">
                    {info.status === 'ON' ? (
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                        isSelected 
                          ? 'bg-emerald-400 text-slate-900' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="hidden sm:inline">ON</span>
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                        isSelected 
                          ? 'bg-rose-400 text-white' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        <span className="hidden sm:inline">OFF</span>
                      </span>
                    )}
                  </div>

                  {/* Special dot badge on alert dates (matching image) */}
                  {info.type !== 'Weekend' && info.type !== 'Instructional Day' && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ff5a5f] animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="pt-3 border-t border-indigo-50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-semibold text-slate-700">School ON (Regular Classes)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="font-semibold text-slate-700">School OFF (Weekend / Holiday)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ff5a5f]"></span>
                <span className="font-semibold text-slate-700">Special Event / Exam</span>
              </div>
            </div>

            <button
              onClick={handleToday}
              className="text-[#5673ec] hover:underline font-bold text-xs cursor-pointer"
            >
              Jump to Current Date
            </button>
          </div>
        </div>

        {/* Selected Day Detail Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Selected Day Details
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                selectedDayInfo.status === 'ON' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {selectedDayInfo.status === 'ON' ? '🟢 SCHOOL IS ON' : '🔴 SCHOOL IS OFF'}
              </span>
            </div>

            <div>
              <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h4>
              <p className="text-sm font-bold text-[#5673ec] mt-1">
                {selectedDayInfo.title}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Type: {selectedDayInfo.type}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <Info className="w-4 h-4 text-[#5673ec] flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">{selectedDayInfo.description}</p>
              </div>
            </div>

            {/* Specific Instructions for ON vs OFF */}
            {selectedDayInfo.status === 'ON' ? (
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">School Hours:</span>
                  <span className="font-bold text-slate-800">08:00 AM &ndash; 03:30 PM</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Morning Assembly:</span>
                  <span className="font-bold text-slate-800">08:15 AM (Auditorium)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Uniform:</span>
                  <span className="font-bold text-slate-800">Regular Formal Uniform</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Attendance:</span>
                  <span className="font-bold text-emerald-600">Mandatory &bull; Marked Live</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Coffee className="w-4 h-4 text-rose-500" />
                    <span>Campus Closed</span>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    No physical lectures scheduled today. Students can complete pending assignments or revise class notes.
                  </p>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Transport / Bus:</span>
                  <span className="font-bold text-slate-800">No Service</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Next Working Day:</span>
                  <span className="font-bold text-[#5673ec]">Check following weekday</span>
                </div>
              </div>
            )}
          </div>

          {/* Upcoming Holiday Spotlight */}
          <div className="bg-white rounded-3xl p-5 border border-indigo-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff5a5f]" />
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Upcoming Academic Milestone
              </h4>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">Fall Semester Mid-Term Recess</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">5 Days OFF</span>
              </div>
              <p className="text-[11px] text-slate-500">
                October 26 &ndash; October 30, 2026. Regular classes resume Monday, November 2.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
