import React, { useState, useEffect } from 'react';
import { PullRequest, User } from '../types';
import { api } from '../api';
import {
  CheckCircle2,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Plus,
} from 'lucide-react';

interface PullRequestsViewProps {
  user: User;
}

export const PullRequestsView: React.FC<PullRequestsViewProps> = ({ user }) => {
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [selectedPr, setSelectedPr] = useState<PullRequest | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [mergingId, setMergingId] = useState<string | null>(null);

  // New PR form
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newBranch, setNewBranch] = useState('');

  const loadPRs = async () => {
    try {
      const data = await api.getPullRequests();
      setPrs(data);
      if (data.length > 0 && !selectedPr) {
        setSelectedPr(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPRs();
  }, []);

  const handleMerge = async (prId: string) => {
    if (user.role !== 'Developer' && user.role !== 'Manager') {
      alert('Only Software Developers and Team Managers can officially approve and merge changes.');
      return;
    }

    setMergingId(prId);
    try {
      const res = await api.mergePullRequest(prId);
      setPrs((prev) =>
        prev.map((p) => (p.id === prId ? res.pullRequest : p))
      );
      if (selectedPr?.id === prId) {
        setSelectedPr(res.pullRequest);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to approve change');
    } finally {
      setMergingId(null);
    }
  };

  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await api.createPullRequest({
        title: newTitle.trim(),
        summary: newSummary.trim() || 'New feature proposed by team member.',
        branch: newBranch.trim() || undefined,
        targetBranch: 'main',
      });
      setPrs((prev) => [created, ...prev]);
      setSelectedPr(created);
      setShowNewModal(false);
      setNewTitle('');
      setNewSummary('');
      setNewBranch('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit proposal');
    }
  };

  const canMerge = user.role === 'Developer' || user.role === 'Manager';

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
              <span>TEAM COLLABORATION · CODE & FEATURE PROPOSALS</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Proposed Changes & Reviews
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              When teammates build a new feature or fix a bug, they submit it here for review. Once verified, developers or managers can approve it into the main app.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Propose New Change</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: PR List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                All Proposed Changes
              </span>
              <span className="text-[11px] text-slate-400">
                {prs.length} items
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {prs.map((pr) => {
                const isSelected = selectedPr?.id === pr.id;
                const isMerged = pr.status === 'merged';

                return (
                  <div
                    key={pr.id}
                    onClick={() => setSelectedPr(pr)}
                    className={`p-3 text-xs cursor-pointer rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-slate-800 font-medium'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isMerged ? (
                          <GitMerge className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                        ) : (
                          <GitPullRequest className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        <span className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                          {pr.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {pr.id}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Proposed by @{pr.author}</span>
                      <span>·</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        +{pr.diffStats.additions} lines
                      </span>
                      <span className="text-rose-600 dark:text-rose-400">
                        -{pr.diffStats.deletions} lines
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className={`px-2 py-0.5 rounded font-medium ${
                        isMerged
                          ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}>
                        {isMerged ? 'APPROVED & APPLIED' : 'OPEN FOR REVIEW'}
                      </span>

                      <span className="text-slate-400">
                        Safety Check: {pr.ciStatus === 'success' ? 'Passed' : 'Checking'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected PR Details */}
        <div className="lg:col-span-7 space-y-6">
          {selectedPr ? (
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs space-y-5">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <span>{selectedPr.id}</span>
                    <span>·</span>
                    <span>Proposed by @{selectedPr.author} ({selectedPr.role})</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedPr.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <GitBranch className="h-3.5 w-3.5" />
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-[11px]">
                      {selectedPr.branch}
                    </span>
                    <span>into main application</span>
                  </div>
                </div>

                {/* Approve & Merge Button */}
                <div>
                  {selectedPr.status === 'merged' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-800">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approved into Main App</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMerge(selectedPr.id)}
                      disabled={!canMerge || mergingId === selectedPr.id}
                      title={!canMerge ? 'Software Developers and Managers can approve changes' : ''}
                      className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md shadow-xs transition-colors ${
                        canMerge
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <GitMerge className="h-3.5 w-3.5" />
                      <span>
                        {mergingId === selectedPr.id
                          ? 'Applying changes...'
                          : canMerge
                          ? 'Approve & Apply to Main App'
                          : 'Approve (Dev / Manager Only)'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Why this change is needed
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                  {selectedPr.summary}
                </p>
              </div>

              {/* Safety Checks & Scope */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Automated Quality Check</span>
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>All Safety Checks Passed (3/3)</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Lines of Code Changed</span>
                  <div className="text-slate-700 dark:text-slate-300 font-semibold">
                    {selectedPr.diffStats.filesChanged} files (<span className="text-emerald-600">+{selectedPr.diffStats.additions} added</span> / <span className="text-rose-600">-{selectedPr.diffStats.deletions} removed</span>)
                  </div>
                </div>
              </div>

              {/* Code Changes Inspector */}
              <div className="rounded-lg bg-slate-950 p-4 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto shadow-inner">
                <div className="text-[10px] text-slate-400 pb-2 mb-2 border-b border-slate-800 flex justify-between font-sans">
                  <span>PREVIEW OF CODE CHANGES</span>
                  <span>Branch: {selectedPr.branch}</span>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-500">// Comparing original code vs new proposed feature</div>
                  <div className="text-slate-400">   function handleUserRequests(request) &#123;</div>
                  <div className="text-rose-400">-    const allowed = oldSlowCheck(request);</div>
                  <div className="text-emerald-400">+    // Improved fast rate check with instant caching</div>
                  <div className="text-emerald-400">+    const allowed = fastSmartCheck(request);</div>
                  <div className="text-slate-400">     return allowed;</div>
                  <div className="text-slate-400">   &#125;</div>
                </div>
              </div>

            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-8 text-center text-xs text-slate-400">
              Select a change proposal on the left to see what changed and approve it.
            </div>
          )}
        </div>

      </div>

      {/* New PR Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Propose a New Feature or Fix
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreatePR} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title of your change
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Add dark mode toggle for nighttime reading"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Draft Branch Name (Optional)
                </label>
                <input
                  type="text"
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
                  placeholder="e.g. feature-dark-mode"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Why is this change helpful?
                </label>
                <textarea
                  rows={3}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Explain what was improved or fixed in everyday language..."
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold rounded"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
