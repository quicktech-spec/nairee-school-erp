import React, { useState } from 'react';
import { 
  Smartphone, 
  RotateCcw, 
  ExternalLink, 
  Wifi, 
  Battery, 
  ChevronLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Shield,
  Send,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  LogOut
} from 'lucide-react';

export default function MobileAppSimulatorView({ onNavigate }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [startingMode, setStartingMode] = useState('splash'); // 'splash' | 'signin'
  const [email, setEmail] = useState('syalfreelance@gmail.com');
  const [password, setPassword] = useState('student123');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('homework');
  const [loggingIn, setLoggingIn] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleLogin = (e) => {
    e?.preventDefault();
    setLoggingIn(true);
    setTimeout(() => {
      setLoggingIn(false);
      setIsLoggedIn(true);
      showToast('Welcome back, Emma Roberts (Grade 7 B)!');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">Live Mobile App Simulator & Bundle</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                100% Operational
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive standalone preview of the Nairee Mobile Companion (Starting Screens & Live Student Experience)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsLoggedIn(false);
              setStartingMode('splash');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Mobile Screen</span>
          </button>
        </div>
      </div>

      {/* Main Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 6 Cols: Realistic Phone Device Mockup */}
        <div className="lg:col-span-6 flex justify-center py-2">
          <div className="w-[375px] h-[750px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden">
            
            {/* Phone Speaker & Dynamic Island */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full z-50 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-900 mr-2 border border-slate-800"></div>
              <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
            </div>

            {/* Phone Screen Area */}
            <div className="flex-1 bg-[#3B65BF] rounded-[38px] overflow-hidden flex flex-col relative">
              
              {/* Phone Status Bar */}
              <div className="pt-2 px-6 pb-1 flex items-center justify-between text-[11px] text-white font-bold z-40 select-none">
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-white" />
                  <span className="text-[10px]">5G</span>
                  <Battery className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Toast Notification in Simulator */}
              {toast && (
                <div className="absolute top-12 left-4 right-4 z-50 p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold text-center border border-slate-700 shadow-xl animate-fadeIn">
                  {toast}
                </div>
              )}

              {/* ────────────────── 1. STARTING SCREEN (SPLASH OR SIGNIN) ────────────────── */}
              {!isLoggedIn && (
                <div className="flex-1 flex flex-col justify-between bg-[#3B65BF] relative overflow-y-auto select-none">
                  
                  {/* Top Segment Mode Toggle */}
                  <div className="px-4 py-2">
                    <div className="flex items-center p-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white">
                      <button
                        onClick={() => setStartingMode('splash')}
                        className={`flex-1 py-1.5 rounded-full transition-all cursor-pointer ${
                          startingMode === 'splash' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 hover:text-white'
                        }`}
                      >
                        1. Splash Screen
                      </button>
                      <button
                        onClick={() => setStartingMode('signin')}
                        className={`flex-1 py-1.5 rounded-full transition-all cursor-pointer ${
                          startingMode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 hover:text-white'
                        }`}
                      >
                        2. Sign In Screen
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: Splash Screen (Matching media_1790867221846.png) */}
                  {startingMode === 'splash' && (
                    <div className="flex-1 flex flex-col justify-between p-6 text-center">
                      {/* Logo Area */}
                      <div className="pt-2">
                        <img 
                          src="/nairee-logo.png" 
                          alt="Nairee" 
                          className="h-10 mx-auto brightness-0 invert object-contain" 
                        />
                      </div>

                      {/* Rocket Boy Illustration */}
                      <div className="py-4">
                        <img 
                          src="/boy-rocket-splash.png" 
                          alt="Boy on Rocket" 
                          className="w-56 h-56 mx-auto object-contain drop-shadow-xl" 
                        />
                      </div>

                      {/* Proceed Button */}
                      <div className="pb-4">
                        <button
                          onClick={() => setStartingMode('signin')}
                          className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-slate-50 text-[#3B65BF] font-black text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
                        >
                          <span>Proceed to Sign In</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Sign In Screen (Matching media_1790867221846.png) */}
                  {startingMode === 'signin' && (
                    <div className="flex-1 flex flex-col justify-between">
                      {/* Top Sky Cartoon Header */}
                      <div className="h-44 relative flex items-center justify-center overflow-hidden">
                        <img 
                          src="/boy-rocket-header.png" 
                          alt="Rocket Sky Header" 
                          className="w-full h-full object-cover" 
                        />
                      </div>

                      {/* White Bottom Rounded Sheet */}
                      <div className="bg-white rounded-t-[36px] p-6 shadow-2xl flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-black text-slate-900">Hi Student</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Sign in to continue</p>

                          <form onSubmit={handleLogin} className="space-y-3.5 mt-5">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Mobile Number/Email
                              </label>
                              <input 
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pb-2 border-b border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3B65BF]"
                                required
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Password
                              </label>
                              <div className="relative border-b border-slate-200 flex items-center">
                                <input 
                                  type={showPassword ? 'text' : 'password'}
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  className="w-full pb-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3B65BF] pr-8"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  aria-label="Toggle password visibility"
                                  aria-pressed={showPassword}
                                  title={showPassword ? 'Hide password' : 'Show password'}
                                  className="absolute right-1 pb-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            <div className="pt-2">
                              <button
                                type="submit"
                                disabled={loggingIn}
                                className="w-full py-3 rounded-full bg-[#3B65BF] hover:bg-[#2d4fa5] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                              >
                                {loggingIn ? (
                                  <span>Signing In...</span>
                                ) : (
                                  <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                        </div>

                        <div className="text-center text-[10px] text-slate-400 pt-2">
                          Synced with Nairee Live Central Database
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ────────────────── 2. AUTHENTICATED APP EXPERIENCE ────────────────── */}
              {isLoggedIn && (
                <div className="flex-1 flex flex-col bg-[#ebf1fe] overflow-y-auto">
                  
                  {/* Top Bar */}
                  <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src="/nairee-logo.png" alt="Nairee" className="h-6 w-auto" />
                    </div>
                    <button
                      onClick={() => setIsLoggedIn(false)}
                      className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold"
                      title="Sign Out"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Header Pill */}
                  <div className="p-3">
                    <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-800">Homework & Periods</h4>
                        <p className="text-[10px] text-slate-400">Emma Roberts • Grade 7 B</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-200">
                        Live Sync
                      </span>
                    </div>
                  </div>

                  {/* Homework Cards List (Matching media_1790863072815.png) */}
                  <div className="px-3 space-y-2.5 pb-16">
                    {/* Item 1: English */}
                    <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[9px] font-bold">
                          English Literature
                        </span>
                        <span className="text-[9px] text-rose-500 font-bold">Due Today</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-800">Write an essay on 'My Favorite Season'</h5>
                      <p className="text-[10px] text-slate-400">Assigned by Mrs. Sarah Miller • 250 words minimum</p>
                      <button 
                        onClick={() => showToast('Submitted essay for review!')}
                        className="w-full py-1.5 rounded-xl bg-[#00a884] text-white font-bold text-[10px] cursor-pointer"
                      >
                        Submit Homework
                      </button>
                    </div>

                    {/* Item 2: Mathematics */}
                    <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[9px] font-bold">
                          Mathematics
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">Due Tomorrow</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-800">Complete Exercise 4.2: Linear Equations</h5>
                      <p className="text-[10px] text-slate-400">Prof. Jenkins • Questions 1 to 15</p>
                      <button 
                        onClick={() => showToast('Opening formula sheet & notes...')}
                        className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                      >
                        View Study Notes
                      </button>
                    </div>
                  </div>

                  {/* Bottom Navigation Tabs inside Phone */}
                  <div className="mt-auto bg-white border-t border-slate-200/80 px-4 py-2.5 flex items-center justify-around">
                    {[
                      { id: 'homework', label: 'Homework', icon: BookOpen },
                      { id: 'calendar', label: 'Schedule', icon: Calendar },
                      { id: 'profile', label: 'Pass', icon: User },
                    ].map(t => {
                      const Icon = t.icon;
                      const isActive = activeTab === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setActiveTab(t.id)}
                          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                            isActive ? 'text-[#3B65BF]' : 'text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[9px] font-bold">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right 6 Cols: Information & Direct Access */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <span>Full Mobile App Architecture</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                The mobile app is designed to give students, teachers, and parents immediate access to school workflows:
              </p>
              <ul className="space-y-2 pl-4 list-disc text-slate-700">
                <li><b>Starting Splash & Sign-In</b>: Exact cartoon rocket and pencil launcher interface from your reference designs.</li>
                <li><b>Live Student Workspace</b>: Homework tracker, realtime timetable, syllabus progress, and bus tracking.</li>
                <li><b>Parent Mode</b>: Instant family child switcher, fee pay, and live attendance push notifications.</li>
                <li><b>Faculty Attendance</b>: Mark daily batch presence in 2 taps with zero sync delay.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Preloaded Mobile Test Credentials
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="font-bold text-slate-800">Student Account</div>
                  <div className="text-slate-500 font-mono text-[11px]">syalfreelance@gmail.com</div>
                  <div className="text-slate-400 text-[10px]">Pass: student123</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="font-bold text-slate-800">Teacher Account</div>
                  <div className="text-slate-500 font-mono text-[11px]">teacher@school.com</div>
                  <div className="text-slate-400 text-[10px]">Pass: teacher123</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
