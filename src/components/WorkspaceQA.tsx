import React, { useState, useEffect } from 'react';
import { QATestRun, User } from '../types';
import { api } from '../api';
import {
  Bug,
  CheckCircle2,
  Clock,
  FlaskConical,
  Loader2,
  Play,
  XCircle,
} from 'lucide-react';

interface WorkspaceQAProps {
  user: User;
  onCreateTask: (title: string, description: string, priority?: 'critical' | 'high') => void;
}

const friendlyTestSuites = [
  'App Login & Navigation Safety Check',
  'Full User Journey & Screen Tests',
  'Security & Safe Data Check',
  'High Traffic & Speed Stress Check',
];

export const WorkspaceQA: React.FC<WorkspaceQAProps> = ({
  user,
  onCreateTask,
}) => {
  const [runs, setRuns] = useState<QATestRun[]>([]);
  const [selectedSuite, setSelectedSuite] = useState(friendlyTestSuites[0]);
  const [running, setRunning] = useState(false);
  const [activeRun, setActiveRun] = useState<QATestRun | null>(null);

  // Defect report state
  const [bugTitle, setBugTitle] = useState('');
  const [bugDetails, setBugDetails] = useState('');
  const [bugLoggedNotice, setBugLoggedNotice] = useState(false);

  const loadRuns = async () => {
    try {
      const data = await api.getQARuns();
      setRuns(data);
      if (data.length > 0 && !activeRun) {
        setActiveRun(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const handleRunSuite = async () => {
    setRunning(true);
    try {
      const newRun = await api.triggerQARun(selectedSuite);
      setRuns((prev) => [newRun, ...prev]);
      setActiveRun(newRun);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  const handleLogDefect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugTitle.trim()) return;

    onCreateTask(`[PROBLEM] ${bugTitle.trim()}`, bugDetails.trim() || 'Reported during quality checkup.', 'critical');
    setBugTitle('');
    setBugDetails('');
    setBugLoggedNotice(true);
    setTimeout(() => setBugLoggedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold mb-1">
              <span>QUALITY TESTING · HEALTH & ERROR CHECKUP</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Quality Tester Workspace
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Run automated health checks to make sure the app is working without errors, test app speed, and report problems directly to the team task board.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700">
              App Health Score: <strong className="text-emerald-600 dark:text-emerald-400">98% Good</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Automated Health Checkup Console */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-amber-600" />
                  <span>Run App Health Check (Simulated)</span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Runs tests on app buttons, user logins, and data security
                </p>
              </div>

              {/* Suite Selection & Trigger */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedSuite}
                  onChange={(e) => setSelectedSuite(e.target.value)}
                  className="text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-900 dark:text-slate-100 max-w-xs"
                >
                  {friendlyTestSuites.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <button
                  onClick={handleRunSuite}
                  disabled={running}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors disabled:opacity-50 shadow-xs shrink-0"
                >
                  {running ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Start Checkup</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Test Run Execution Card */}
            {activeRun ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Outcome</span>
                    <span className={`font-semibold ${activeRun.status === 'passed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {activeRun.status === 'passed' ? 'ALL PASSED' : 'FOUND ISSUE'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Checks Passed</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {activeRun.passedTests} of {activeRun.totalTests} checks
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Check Time</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {(activeRun.durationMs / 1000).toFixed(1)} seconds
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tested By</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      @{activeRun.triggeredBy}
                    </span>
                  </div>
                </div>

                {/* Details Log */}
                <div className="rounded-lg bg-slate-950 p-4 border border-slate-800 font-mono text-[11px] text-slate-300">
                  <div className="text-[10px] text-slate-400 pb-2 mb-2 border-b border-slate-800 flex justify-between font-sans">
                    <span>TEST CHECKLIST SUMMARY</span>
                    <span>{activeRun.suiteName}</span>
                  </div>
                  <div className="space-y-1">
                    {activeRun.details.map((item, idx) => (
                      <div
                        key={idx}
                        className={item.includes('FAIL') ? 'text-rose-400 font-semibold' : 'text-emerald-400'}
                      >
                        ✓ {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No checkups performed yet. Choose a checkup from the list and click Start Checkup.
              </div>
            )}

            {/* Run History */}
            <div className="mt-5">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Recent Quality Checkups
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                {runs.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setActiveRun(r)}
                    className={`flex items-center justify-between p-2.5 text-xs cursor-pointer transition-colors ${
                      activeRun?.id === r.id
                        ? 'bg-slate-100 dark:bg-slate-800 font-medium'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {r.status === 'passed' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {r.suiteName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {r.passedTests} of {r.totalTests} passed · {(r.durationMs / 1000).toFixed(1)}s
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-500">
                      @{r.triggeredBy}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Col: Report a Problem (Bug) */}
        <div className="space-y-6">
          
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <Bug className="h-4 w-4 text-rose-600" />
              <span>Report a Problem (Bug)</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
              Found an issue? Send it directly to your team's task board so developers can fix it.
            </p>

            {bugLoggedNotice && (
              <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200">
                Problem reported and placed on the task board!
              </div>
            )}

            <form onSubmit={handleLogDefect} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  What is the problem?
                </label>
                <input
                  type="text"
                  required
                  value={bugTitle}
                  onChange={(e) => setBugTitle(e.target.value)}
                  placeholder="e.g. Sign-in button freezes on mobile screen"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  What happened / Steps to see it
                </label>
                <textarea
                  rows={3}
                  value={bugDetails}
                  onChange={(e) => setBugDetails(e.target.value)}
                  placeholder="Describe what you clicked, what you saw, or what went wrong..."
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors shadow-xs"
              >
                Send Problem to Task Board
              </button>
            </form>
          </div>

          {/* Simple Quality Standards */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Team Quality Standards
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Checkup Pass Rate</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">100% required</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Screen Load Speed</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">Under 1 second</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Critical Security Flaws</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Zero Allowed</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">User Passwords</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Encrypted & Safe</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
