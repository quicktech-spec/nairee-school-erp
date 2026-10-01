import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Sparkles,
  HelpCircle,
  X,
  School
} from 'lucide-react';
import { api } from '../api.js';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const demoAccounts = [
    {
      role: 'Admin / Principal',
      username: 'admin',
      pass: 'admin123',
      name: 'Dr. Marcus Vance',
      badge: 'bg-purple-100 text-purple-700 border-purple-200',
      desc: 'Full school oversight, teacher/student performance, fees & accounts'
    },
    {
      role: 'Teacher',
      username: 'teacher_jenkins',
      pass: 'teacher123',
      name: 'Prof. Sarah Jenkins',
      badge: 'bg-blue-100 text-blue-700 border-blue-200',
      desc: 'Attendance marking, syllabus tracker, homework grading & exam marks'
    },
    {
      role: 'Student',
      username: 'nairee',
      pass: 'student123',
      name: 'Nairee Patel',
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      desc: 'Personal timetable, study notes, homework submit, syllabus & bus route'
    },
    {
      role: 'Parent',
      username: 'parent_patel',
      pass: 'parent123',
      name: 'Rajesh Patel',
      badge: 'bg-amber-100 text-amber-700 border-amber-200',
      desc: 'Multi-child switcher, live attendance alerts, grades, online fee pay'
    }
  ];

  const handleFillCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage('');
  };

  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both your Username/ID and Password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await api.login(username, password);
      // Pass the user and token up
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSent(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ebf1fe] via-[#f1f5fe] to-[#e4edfd] flex flex-col justify-between text-slate-800 selection:bg-[#5673ec] selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-indigo-100 bg-white/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <img 
              src="/nairee-logo.png" 
              alt="Nairee" 
              className="h-10 w-auto object-contain" 
            />
            <div className="hidden sm:block pl-3 border-l border-indigo-200">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-indigo-50 text-[#5673ec] rounded-full border border-indigo-200">
                  ERP
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Unified Role-Based Education Management Platform</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-6 text-xs text-slate-500">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-700 font-medium">Term 1 (2026-2027) Live</span>
            </div>
            <div className="flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-[#5673ec]" />
              <span>Frappe DocType Standard</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Area - Matches media_1790863645921.png */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl shadow-indigo-100/70 border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center">
          
          {/* Left Column: Vector Illustration (Matches media_1790863645921.png) */}
          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col items-center justify-center bg-gradient-to-b from-[#f8fafc] to-[#ffffff] border-b lg:border-b-0 lg:border-r border-slate-100">
            <svg 
              viewBox="0 0 500 420" 
              className="w-full max-w-md h-auto"
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Soft Background Clouds */}
              <path d="M70 200 C70 170 110 150 140 170 C160 140 210 140 230 170 C260 150 300 170 300 200 Z" fill="#ebf2fd" />
              <path d="M120 170 C120 130 170 110 200 130 C220 90 290 90 320 130 C350 110 390 130 390 170 Z" fill="#f0f5fe" opacity="0.8" />
              
              {/* Ground Platform */}
              <rect x="20" y="380" width="460" height="12" rx="6" fill="#0f172a" />

              {/* Desk Frame */}
              {/* Legs */}
              <line x1="75" y1="260" x2="60" y2="380" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
              <line x1="170" y1="260" x2="160" y2="380" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
              <line x1="330" y1="260" x2="340" y2="380" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
              <line x1="425" y1="260" x2="440" y2="380" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
              {/* Desk Top */}
              <rect x="50" y="250" width="400" height="10" rx="4" fill="#0f172a" />

              {/* Desk Chair */}
              <rect x="180" y="260" width="60" height="12" rx="4" fill="#ff5a5f" />
              <rect x="195" y="272" width="30" height="8" rx="2" fill="#e0484d" />
              <line x1="210" y1="280" x2="210" y2="380" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />

              {/* Character (Sitting at Desk) */}
              {/* Legs in Navy Trousers */}
              <path d="M200 270 L200 320 L270 320 L270 375 L285 375 L285 310 L215 310 L215 270 Z" fill="#1e293b" />
              {/* Shoes */}
              <rect x="260" y="370" width="36" height="12" rx="6" fill="#ff5a5f" />
              <rect x="260" y="378" width="36" height="4" rx="2" fill="#ffffff" />

              {/* Torso & Suit */}
              <path d="M190 190 C180 230 185 270 195 275 L255 275 C265 270 270 230 260 190 Z" fill="#1e293b" />
              {/* White Shirt Collar */}
              <polygon points="215,190 235,190 225,215" fill="#ffffff" />
              {/* Red Necktie */}
              <polygon points="222,205 228,205 231,250 225,260 219,250" fill="#ff5a5f" />

              {/* Left Arm on Laptop */}
              <path d="M255 210 Q285 240 270 255" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" />
              <circle cx="270" cy="255" r="7" fill="#fed7aa" />

              {/* Head & Face */}
              <circle cx="225" cy="160" r="28" fill="#fed7aa" />
              {/* Hair */}
              <path d="M198 155 C198 135 220 130 245 135 C255 145 255 160 252 165 C248 152 238 148 220 150 C205 152 200 160 198 155 Z" fill="#472f1f" />
              {/* Happy Eyes & Smile */}
              <circle cx="218" cy="160" r="2.5" fill="#1e293b" />
              <circle cx="236" cy="160" r="2.5" fill="#1e293b" />
              <path d="M222 170 Q227 175 232 170" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />

              {/* Laptop on Desk */}
              <rect x="250" y="244" width="70" height="6" rx="2" fill="#334155" />
              <path d="M260 244 L280 195 L345 195 L330 244 Z" fill="#1e293b" />
              <path d="M263 242 L282 198 L342 198 L327 242 Z" fill="#38bdf8" />

              {/* Speech Bubble */}
              <rect x="235" y="80" width="60" height="38" rx="8" fill="#ff5a5f" />
              <polygon points="245,118 245,128 255,118" fill="#ff5a5f" />
              <circle cx="253" cy="99" r="3.5" fill="#ffffff" />
              <circle cx="265" cy="99" r="3.5" fill="#ffffff" />
              <circle cx="277" cy="99" r="3.5" fill="#ffffff" />

              {/* Desk Lamp */}
              <line x1="370" y1="250" x2="370" y2="195" stroke="#94a3b8" strokeWidth="4" />
              <polygon points="370,170 350,205 390,205" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
              <line x1="370" y1="205" x2="370" y2="215" stroke="#cbd5e1" strokeWidth="3" />

              {/* Stack of Books (Left) */}
              <rect x="70" y="240" width="60" height="10" rx="2" fill="#ff5a5f" />
              <rect x="75" y="230" width="50" height="10" rx="2" fill="#3b82f6" />
              <rect x="72" y="222" width="55" height="8" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />

              {/* Potted Plant (Right) */}
              <path d="M395 250 L402 232 L428 232 L435 250 Z" fill="#0f172a" />
              <path d="M410 232 C405 210 395 200 395 190 C405 195 412 210 412 232 Z" fill="#ff5a5f" />
              <path d="M418 232 C418 205 425 195 435 185 C432 200 426 215 422 232 Z" fill="#ff5a5f" />
              <path d="M415 232 C415 210 412 195 415 180 C420 195 420 210 417 232 Z" fill="#e0484d" />
            </svg>
            <div className="mt-4 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Nairee Education Platform
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">Admin &bull; Teacher &bull; Student &bull; Parent</p>
            </div>
          </div>

          {/* Right Column: Sleek Login Card (Matches media_1790863645921.png) */}
          <div className="lg:col-span-6 p-6 sm:p-10 md:p-12">
            <div className="max-w-md mx-auto">
              
              <div className="mb-8 text-center">
                <img 
                  src="/nairee-logo.png" 
                  alt="Nairee" 
                  className="h-10 mx-auto mb-3 object-contain" 
                />
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Login</h2>
                <p className="text-xs text-slate-500 mt-1">Sign in with your school-issued ID</p>
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">&bull;</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Username Input with User Icon on Right */}
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="school"
                    className="w-full px-4 py-3 rounded-xl bg-slate-100/90 border border-slate-200/80 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:bg-white transition-all pr-11"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-700">
                    <User className="w-5 h-5 fill-slate-700 text-slate-700" />
                  </div>
                </div>

                {/* Password Input with Eye Icon on Right */}
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-slate-100/90 border border-slate-200/80 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:bg-white transition-all pr-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="text-right mt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs text-[#3b82f6] hover:underline font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                {/* Big Blue Login Pill Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-[#4f8df9] hover:bg-[#3b82f6] text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Login</span>
                  )}
                </button>

                {/* Don't have account footer link */}
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500">
                    Don't have account? Let's{' '}
                    <button
                      type="button"
                      onClick={() => setErrorMessage('Student & Parent accounts are issued by the School Admissions Office.')}
                      className="text-[#3b82f6] hover:underline font-semibold"
                    >
                      Get Started For Free
                    </button>
                  </p>
                </div>
              </form>

              {/* 1-Click Quick Demo Accounts Drawer */}
              <div className="mt-8 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Quick Demo Credentials (1-Click Fill)
                  </span>
                  <span className="text-[10px] text-[#3b82f6] font-medium">Click to test role</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.username}
                      type="button"
                      onClick={() => handleFillCredentials(acc.username, acc.pass)}
                      className={`text-left p-2.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                        username === acc.username 
                          ? 'bg-blue-50 border-[#3b82f6] shadow-xs' 
                          : 'bg-slate-50/80 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-slate-800 truncate">{acc.name}</span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${acc.badge}`}>
                          {acc.role.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                        <code className="text-[#3b82f6] font-mono text-[10px] font-bold">{acc.username}</code>
                        <span>/</span>
                        <span className="text-slate-400 text-[10px]">{acc.pass}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-indigo-100 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5673ec] flex items-center justify-center mb-3">
              <HelpCircle className="w-5 h-5" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Reset Account Password</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              Enter your registered school email address or mobile number. Our administrator security service will dispatch a one-time verification link.
            </p>

            {forgotSent ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Password reset link sent to <strong>{forgotEmail}</strong>. Please check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered Email or Phone Number
                  </label>
                  <input
                    type="text"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. rajesh.patel@gmail.com or s.jenkins@school.edu"
                    className="w-full px-3.5 py-2 bg-indigo-50/50 border border-indigo-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#5673ec]"
                    required
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#5673ec] to-[#6c8cff] hover:opacity-95 text-white text-xs font-semibold shadow-md shadow-indigo-300/30 cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-indigo-100 px-6 py-4 text-center text-xs text-slate-500 bg-white/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Nairee &bull; School ERP</span>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-700 transition-colors">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-slate-700 transition-colors">Role Scoping Rules</span>
            <span>&bull;</span>
            <span className="hover:text-slate-700 transition-colors">Security Protocol</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
