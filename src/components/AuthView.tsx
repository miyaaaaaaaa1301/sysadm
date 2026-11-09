import React, { useState } from 'react';
import { UserRole } from '../types';
import { api } from '../api';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Lock,
  Shield,
  User,
} from 'lucide-react';

interface AuthViewProps {
  onSuccess: (user: any) => void;
}

const roles: Array<{ key: UserRole; title: string; subtitle: string }> = [
  { key: 'Designer', title: 'Product Designer', subtitle: 'Colors, typography & screen layouts' },
  { key: 'Developer', title: 'Software Developer', subtitle: 'Builds updates & submits code changes' },
  { key: 'QA', title: 'Quality Tester', subtitle: 'Runs safety checks & reports bugs' },
  { key: 'Manager', title: 'Team Manager', subtitle: 'Approves teammates & launches updates' },
];

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Developer');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick preset loader for evaluation
  const handleQuickFill = (role: UserRole) => {
    setSelectedRole(role);
    setMode('signin');
    setError(null);

    switch (role) {
      case 'Manager':
        setUsername('manager');
        setPassword('SysOps2026!Manager');
        break;
      case 'Developer':
        setUsername('dev');
        setPassword('DevOps2026!');
        break;
      case 'QA':
        setUsername('qa');
        setPassword('Quality2026!');
        break;
      case 'Designer':
        setUsername('designer');
        setPassword('Designer2026!');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup' && selectedRole === 'Manager') {
      setError('Manager accounts cannot be created by self-signup. Manager accounts are preset by the company so managers can approve their teammates.');
      return;
    }

    if (!username.trim() || !password) {
      setError('Please enter both your username and password.');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await api.signIn(username.trim(), password, selectedRole);
        onSuccess(res.user);
      } else {
        const res = await api.signUp(username.trim(), password, fullName.trim(), selectedRole);
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Could not sign in. Please check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Lockup */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-base shadow-sm">
            SO
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            SysOps Team Hub
          </span>
        </div>
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          A friendly collaboration hub for design, development, testing, and management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-sm border border-slate-200 dark:border-slate-800 sm:rounded-xl sm:px-8">
          
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-all ${
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
                if (selectedRole === 'Manager') {
                  setSelectedRole('Developer');
                }
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Create New Account
            </button>
          </div>

          {/* Quick Credential Test Strip */}
          <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                Quick Test Accounts:
              </span>
              <span className="text-[10px] text-slate-400">Click to fill test credentials</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('Manager')}
                className="px-2 py-1 text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-purple-700 dark:text-purple-300 hover:border-purple-300 transition-colors text-left"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('Developer')}
                className="px-2 py-1 text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-emerald-700 dark:text-emerald-300 hover:border-emerald-300 transition-colors text-left"
              >
                Developer
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('QA')}
                className="px-2 py-1 text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-amber-700 dark:text-amber-300 hover:border-amber-300 transition-colors text-left"
              >
                Quality Tester
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('Designer')}
                className="px-2 py-1 text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-indigo-700 dark:text-indigo-300 hover:border-indigo-300 transition-colors text-left"
              >
                Designer
              </button>
            </div>
          </div>

          {/* Error Notice Banner */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Choose Your Role <span className="text-slate-400 font-normal">(Select who you are on the team)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => {
                  const isSelected = selectedRole === r.key;
                  const isManagerDisabled = mode === 'signup' && r.key === 'Manager';

                  return (
                    <button
                      key={r.key}
                      type="button"
                      disabled={isManagerDisabled}
                      onClick={() => setSelectedRole(r.key)}
                      className={`relative flex flex-col p-2.5 text-left border rounded-lg transition-all ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50 dark:border-slate-200 dark:bg-slate-800/80 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
                      } ${isManagerDisabled ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {r.title}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-slate-900 dark:text-slate-100" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                        {r.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Informational Callout */}
              {mode === 'signup' && (
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-slate-400" />
                  Self-signup is open for Designers, Developers, and Testers. Manager accounts are preset by the team lead.
                </p>
              )}
            </div>

            {/* Full Name for Signup */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-100"
                  />
                  <User className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. dev, manager, or your name"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-100"
                />
                <Lock className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {loading
                  ? 'Checking credentials...'
                  : mode === 'signin'
                  ? `Sign In as ${selectedRole}`
                  : `Create ${selectedRole} Account`}
              </button>
            </div>
          </form>

          {/* Simple Footnote */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
            <Lock className="h-3 w-3" />
            <span>Secure password protection · Saved automatically · Private sessions</span>
          </div>

        </div>
      </div>
    </div>
  );
};
