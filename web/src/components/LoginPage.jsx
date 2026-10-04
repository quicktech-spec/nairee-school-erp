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
import naireeLogo from '../assets/nairee-logo.png';
import loginCartoon from '../assets/login-cartoon.png';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [activePolicyModal, setActivePolicyModal] = useState(null);

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
              src={naireeLogo} 
              alt="Nairee" 
              className="h-10 w-auto object-contain" 
            />
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

      {/* Main Login Area - Matches media_1790867259798.png */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl shadow-indigo-100/70 border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center">
          
          {/* Left Column: Exact Cartoon Illustration from media_1790867259798.png */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col items-center justify-center bg-white border-b lg:border-b-0 lg:border-r border-slate-100">
            <img 
              src={loginCartoon} 
              alt="Nairee School Admin Cartoon" 
              className="w-full max-w-md h-auto object-contain"
            />
          </div>

          {/* Right Column: Sleek Login Card (Matches media_1790867259798.png) */}
          <div className="lg:col-span-6 p-6 sm:p-10 md:p-12">
            <div className="max-w-md mx-auto">
              
              {/* Logo on Top & Login Title */}
              <div className="mb-6 text-center">
                <img 
                  src={naireeLogo} 
                  alt="Nairee" 
                  className="h-11 mx-auto mb-3 object-contain" 
                />
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Login</h2>
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">&bull;</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Username Input with User Icon on Right */}
                <div className="relative">
                  <label htmlFor="username" className="sr-only">
                    Username or Email
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    aria-label="Username or Email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username or School ID"
                    className="w-full px-5 py-3.5 rounded-xl bg-[#f2f4f7] border border-transparent text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:bg-white transition-all pr-12 font-medium"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-800">
                    <User className="w-5 h-5 fill-slate-800 text-slate-800" />
                  </div>
                </div>

                {/* Password Input with Eye Icon on Right */}
                <div>
                  <div className="relative">
                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      aria-label="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-5 py-3.5 rounded-xl bg-[#f2f4f7] border border-transparent text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:bg-white transition-all pr-12 font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="text-right mt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs text-[#3b82f6] hover:underline font-semibold cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                {/* Large Blue Pill Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 py-3.5 px-6 rounded-full bg-[#4f8df9] hover:bg-[#3b82f6] text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 tracking-wide"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Login</span>
                  )}
                </button>

                {/* Don't have account footer link */}
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-600 font-medium">
                    Don't have account? Let's{' '}
                    <button
                      type="button"
                      onClick={() => setErrorMessage('Student & Parent accounts are issued by the School Admissions Office.')}
                      className="text-[#3b82f6] hover:underline font-bold"
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
                  <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered Email or Phone Number
                  </label>
                  <input
                    id="forgot-email"
                    name="forgot-email"
                    type="text"
                    autoComplete="email"
                    aria-label="Registered Email or Phone Number"
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

      {/* Policy & Compliance Modal */}
      {activePolicyModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setActivePolicyModal(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {activePolicyModal === 'privacy' && 'Student Data Privacy Policy'}
                    {activePolicyModal === 'roles' && 'Role-Based Access & Scoping Rules'}
                    {activePolicyModal === 'security' && 'Institution Security Protocol'}
                  </h3>
                  <p className="text-xs text-slate-400">Nairee Institutional Compliance & Governance</p>
                </div>
              </div>
              <button
                onClick={() => setActivePolicyModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 text-xs text-slate-600 space-y-3 leading-relaxed">
              {activePolicyModal === 'privacy' && (
                <>
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
                    🔒 <strong>Zero Third-Party Tracking:</strong> All student identities, Aadhaar numbers, and guardian financial records are stored securely with strict data isolation.
                  </div>
                  <p>
                    Nairee School ERP complies with educational data privacy standards. Student academic records, personal photographs, and attendance logs remain strictly within the institution's private cloud tenant.
                  </p>
                  <p>
                    Parents and legal guardians retain full rights to inspect and request verification of stored educational records at any time through the Parent Portal.
                  </p>
                </>
              )}

              {activePolicyModal === 'roles' && (
                <>
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 font-medium">
                    👥 <strong>Strict Role Isolation:</strong> 4 distinct security tiers safeguard administrative controls from student/parent accounts.
                  </div>
                  <ul className="space-y-2 list-disc pl-4 text-slate-700">
                    <li><strong>Principal / Admin:</strong> Unrestricted access to master database, fee ledgers, staff payroll, and class transfers.</li>
                    <li><strong>Faculty / Teacher:</strong> Scoped exclusively to assigned classrooms, subject gradebooks, and attendance registers.</li>
                    <li><strong>Student:</strong> Read-only access to enrolled timetable, syllabus, report cards, and fee status.</li>
                    <li><strong>Parent:</strong> Restricted view of enrolled ward(s), fee payment gateway, and official circulars.</li>
                  </ul>
                </>
              )}

              {activePolicyModal === 'security' && (
                <>
                  <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 font-medium">
                    🛡️ <strong>Bank-Grade Infrastructure:</strong> Powered by 256-bit TLS encryption and Supabase Row Level Security (RLS).
                  </div>
                  <p>
                    All API transactions, database updates, and UPI payment notifications are transmitted over encrypted HTTPS channels. Passwords and session tokens utilize salted cryptographic hashing.
                  </p>
                  <p>
                    Automated hourly snapshots and dual-engine offline caching ensure uninterrupted campus operations even during network disruptions.
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActivePolicyModal(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 cursor-pointer"
              >
                Understood &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-indigo-100 px-6 py-4 text-center text-xs text-slate-500 bg-white/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Nairee &bull; School ERP</span>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setActivePolicyModal('privacy')}
              className="hover:text-indigo-600 transition-colors cursor-pointer font-medium hover:underline underline-offset-4"
            >
              Privacy Policy
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => setActivePolicyModal('roles')}
              className="hover:text-indigo-600 transition-colors cursor-pointer font-medium hover:underline underline-offset-4"
            >
              Role Scoping Rules
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => setActivePolicyModal('security')}
              className="hover:text-indigo-600 transition-colors cursor-pointer font-medium hover:underline underline-offset-4"
            >
              Security Protocol
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
