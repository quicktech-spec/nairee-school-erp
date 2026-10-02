import React, { useState } from 'react';
import {
  GraduationCap,
  Briefcase,
  Users,
  Search,
  Sparkles,
  Calendar,
  MessageSquare,
  Award,
  BookOpen,
  MapPin,
  ExternalLink,
  CheckCircle2,
  X
} from 'lucide-react';

export default function AlumniNetworkView() {
  const [alumni, setAlumni] = useState([
    {
      id: 'ALM-2022-01',
      name: 'Dr. Elena Rostova',
      batch: 'Class of 2022',
      degree: 'B.S. Biomedical Engineering & Neuroscience',
      currentRole: 'Research Scientist at Genentech / Stanford Med',
      location: 'San Francisco, CA',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      mentorshipTopics: ['Medical School Prep', 'Bio-tech Careers', 'SAT Biology'],
      availableSlots: 'Thursdays 5:00 PM EST'
    },
    {
      id: 'ALM-2023-04',
      name: 'Rohan Mehta',
      batch: 'Class of 2023',
      degree: 'B.S. Computer Science & AI',
      currentRole: 'Software Engineer at Google DeepMind',
      location: 'London, UK / Mountain View',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      mentorshipTopics: ['Competitive Coding', 'Ivy League Admissions', 'AI Systems'],
      availableSlots: 'Saturdays 11:00 AM EST'
    },
    {
      id: 'ALM-2021-08',
      name: 'Sophia Chen',
      batch: 'Class of 2021',
      degree: 'B.A. Economics & International Relations',
      currentRole: 'Investment Analyst at Goldman Sachs',
      location: 'New York, NY',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      mentorshipTopics: ['Finance & Consulting', 'College Essays', 'Debate Coaching'],
      availableSlots: 'Sundays 4:00 PM EST'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlumnus, setSelectedAlumnus] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const filteredAlumni = alumni.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.currentRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.batch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookSession = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedAlumnus(null);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nairee Global Alumni & Career Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Alumni Career Mentorship & College Guidance Hub
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Connect high school seniors with prestigious alumni attending top Ivy League universities and global tech & medical institutions for 1-on-1 career guidance.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] text-slate-400 font-semibold block">Active Global Alumni</span>
            <span className="text-2xl font-black text-white mt-1 block">450+ Graduates</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] text-slate-400 font-semibold block">University Placements</span>
            <span className="text-2xl font-black text-teal-300 mt-1 block">98.2% Top Tier</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] text-slate-400 font-semibold block">Mentorship Sessions</span>
            <span className="text-2xl font-black text-amber-300 mt-1 block">120 Completed</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search alumni by name, company, university..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>

      {/* Alumni Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlumni.map((a) => (
          <div key={a.id} className="bg-white rounded-3xl p-6 border border-teal-100 shadow-sm space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-3.5">
                <img
                  src={a.avatar}
                  alt={a.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-500/20 shadow-sm"
                />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{a.name}</h3>
                  <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                    {a.batch}
                  </span>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{a.location}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{a.currentRole}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <span>{a.degree}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Mentorship Topics</span>
                <div className="flex flex-wrap gap-1.5">
                  {a.mentorshipTopics.map((topic, idx) => (
                    <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[10px] text-slate-500">
                <span>Slots: <strong>{a.availableSlots}</strong></span>
              </div>
              <button
                onClick={() => setSelectedAlumnus(a)}
                className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20"
              >
                Book 1-on-1 Session
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* BOOKING MODAL */}
      {selectedAlumnus && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedAlumnus(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-teal-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Schedule Mentorship Session</h3>
              <button onClick={() => setSelectedAlumnus(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-6 text-center space-y-2 text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Session Booked Successfully!</h4>
                <p className="text-xs text-emerald-600">
                  Meeting link and calendar invite sent to both student & mentor ({selectedAlumnus.name}).
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookSession} className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-3">
                  <img src={selectedAlumnus.avatar} alt={selectedAlumnus.name} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <div className="font-bold text-slate-800">{selectedAlumnus.name}</div>
                    <div className="text-[11px] text-slate-500">{selectedAlumnus.currentRole}</div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Mentorship Topic</label>
                  <select className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold">
                    {selectedAlumnus.mentorshipTopics.map((t, idx) => (
                      <option key={idx} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Name & Grade</label>
                  <input
                    type="text"
                    required
                    defaultValue="Alex Johnson (Grade 10-A)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Questions / Focus Areas for Session</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Tips for SAT Bio and high-school research internships..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="pt-2 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedAlumnus(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-md"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
