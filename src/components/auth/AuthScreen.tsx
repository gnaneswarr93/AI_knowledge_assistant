import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Building2, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, signup } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState<string>('employee@enterprise.com');
  const [signInPassword, setSignInPassword] = useState<string>('enterprise123');
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState<string>('');
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const [signUpPassword, setSignUpPassword] = useState<string>('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState<string>('');
  const [signUpDepartment, setSignUpDepartment] = useState<string>('Engineering');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!signInEmail || !signInEmail.includes('@')) {
      setErrorMsg('Please enter a valid work email address.');
      showToast('Please enter a valid email.', 'error');
      return;
    }

    if (!signInPassword) {
      setErrorMsg('Password is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(signInEmail, signInPassword);
      showToast(`Welcome back, ${user.name}!`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!signUpName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!signUpEmail || !signUpEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      showToast('Please enter a valid email.', 'error');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      showToast('Password does not match.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await signup(signUpName, signUpEmail, signUpPassword, signUpDepartment);
      showToast(`Account created successfully. Welcome, ${user.name}!`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create account';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (role: 'employee' | 'admin') => {
    if (role === 'employee') {
      setSignInEmail('employee@enterprise.com');
      setSignInPassword('enterprise123');
    } else {
      setSignInEmail('admin@enterprise.com');
      setSignInPassword('enterprise123');
    }
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-[#0F1115] px-4 py-12 transition-colors">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Enterprise AI Knowledge Assistant
        </h1>
        <p className="text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold mt-1">
          RAG &amp; Multi-Agent AI
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#1D2129] rounded-xl border border-slate-200/90 dark:border-[#2A2F38] shadow-sm p-6 sm:p-8 transition-colors">
        {/* Toggle SIGN IN | SIGN UP */}
        <div className="flex border-b border-slate-200 dark:border-[#2A2F38] mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'signin'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'signup'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            SIGN UP
          </button>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-medium flex items-start gap-2">
            <span>•</span>
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {mode === 'signin' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Welcome back</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Sign in to access your enterprise knowledge assistant.
              </p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="name@enterprise.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#171A21] border border-slate-300 dark:border-[#2A2F38] rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-white dark:bg-[#171A21] border border-slate-300 dark:border-[#2A2F38] rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-[#2A2F38] text-blue-600 focus:ring-blue-500"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => showToast('Password reset link sent to registered email.', 'info')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </div>

            {/* Quick Demo Switcher for Evaluation */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[#2A2F38]">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center mb-2.5">
                Quick Demo Accounts (Evaluation)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('employee')}
                  className="py-1.5 px-2.5 rounded border border-slate-200 dark:border-[#2A2F38] bg-slate-50 dark:bg-[#171A21] hover:bg-slate-100 dark:hover:bg-[#252B36] text-slate-700 dark:text-slate-300 text-xs font-medium text-left flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Kalyan Ram</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Employee</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin')}
                  className="py-1.5 px-2.5 rounded border border-slate-200 dark:border-[#2A2F38] bg-slate-50 dark:bg-[#171A21] hover:bg-slate-100 dark:hover:bg-[#252B36] text-slate-700 dark:text-slate-300 text-xs font-medium text-left flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Admin User</div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Administrator</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Create your account</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Create an account to access your organization&apos;s knowledge.
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#171A21] border border-slate-300 dark:border-[#2A2F38] rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="name@enterprise.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#171A21] border border-slate-300 dark:border-[#2A2F38] rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <select
                    value={signUpDepartment}
                    onChange={(e) => setSignUpDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#171A21] border border-slate-300 dark:border-[#2A2F38] rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product &amp; Design</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Security & IT">Security &amp; IT</option>
                    <option value="Legal & Compliance">Legal &amp; Compliance</option>
                    <option value="Finance & Operations">Finance &amp; Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-white dark:bg-[#171A21] border border-slate-300 dark:border-[#2A2F38] rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-white dark:bg-[#171A21] border border-slate-300 dark:border-[#2A2F38] rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Assigned Role: <strong className="text-slate-700 dark:text-slate-300 font-medium">Employee</strong></span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
        Enterprise AI Knowledge Assistant • Academic Project Demonstration
      </div>
    </div>
  );
};
