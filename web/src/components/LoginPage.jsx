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
    <div className="min-h-screen bg-gradient-to-br from-[#0c1f2c] via-[#0f2d3d] to-[#0a1824] flex flex-col justify-between text-slate-100 selection:bg-teal-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-teal-900/40 bg-[#0c1f2c]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">Nairee International School</span>
                <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/30">
                  Nairee ERP
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Unified Role-Based Education Management Platform</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-6 text-xs text-slate-400">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-300 font-medium">Term 1 (2026-2027) Live</span>
            </div>
            <div className="flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Frappe DocType Standard</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: School Vision & Features */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>One Single Portal for Everyone</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
              One Login.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-sky-400">
                Four Connected Portals.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Log in with your school-issued ID and password. Nairee automatically detects whether you are an 
              <span className="text-white font-semibold"> Admin</span>, 
              <span className="text-white font-semibold"> Teacher</span>, 
              <span className="text-white font-semibold"> Student</span>, or 
              <span className="text-white font-semibold"> Parent</span> and delivers your custom-built digital campus.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
                <div className="text-teal-400 font-semibold text-xs mb-1">⚡ Live Sync Database</div>
                <div className="text-slate-400 text-xs leading-normal">
                  Teacher marks attendance or exam grades &rarr; instantly reflected to students & parents.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
                <div className="text-cyan-400 font-semibold text-xs mb-1">🛡️ Scoped Security</div>
                <div className="text-slate-400 text-xs leading-normal">
                  Zero manual role picking. Every student & parent sees strictly their own records.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Unified Login Form Card */}
          <div className="lg:col-span-6">
            <div className="bg-[#122837]/90 border border-teal-800/50 shadow-2xl shadow-black/50 rounded-2xl p-6 sm:p-8 backdrop-blur-xl relative">
              
              <div className="mb-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Account Sign In</h2>
                <p className="text-xs text-slate-400 mt-1">Enter your school-issued Username or ID</p>
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="mb-5 p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">&bull;</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* The Single Generic Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Username or User ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. admin, teacher_jenkins, nairee, parent_patel"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-900 w-3.5 h-3.5"
                    />
                    <span>Remember this session</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Auto-Role Detection</span>
                </div>

                {/* Primary Call to Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-teal-500/25 flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Nairee Portal</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Quick Demo Accounts Drawer */}
              <div className="mt-6 pt-5 border-t border-slate-700/60">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Demo Credentials (1-Click Fill)
                  </span>
                  <span className="text-[10px] text-teal-400">Click to test role routing</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.username}
                      type="button"
                      onClick={() => handleFillCredentials(acc.username, acc.pass)}
                      className={`text-left p-2.5 rounded-lg border transition-all duration-150 ${
                        username === acc.username 
                          ? 'bg-teal-500/20 border-teal-400 shadow-sm' 
                          : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-white truncate">{acc.name}</span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${acc.badge}`}>
                          {acc.role.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <code className="text-teal-300 font-mono text-[10px]">{acc.username}</code>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#122837] border border-teal-800/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
              <HelpCircle className="w-5 h-5" />
            </div>

            <h3 className="text-lg font-bold text-white">Reset Account Password</h3>
            <p className="text-xs text-slate-300 mt-1 mb-4 leading-relaxed">
              Enter your registered school email address or mobile number. Our administrator security service will dispatch a one-time verification link.
            </p>

            {forgotSent ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>Password reset link sent to <strong>{forgotEmail}</strong>. Please check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registered Email or Phone Number
                  </label>
                  <input
                    type="text"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. rajesh.patel@gmail.com or s.jenkins@school.edu"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-xs font-semibold shadow-md shadow-teal-500/20"
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
      <footer className="border-t border-teal-900/30 px-6 py-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Nairee International School &bull; Nairee Engine</span>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-400 transition-colors">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 transition-colors">Role Scoping Rules</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 transition-colors">Security Protocol</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
