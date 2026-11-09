import React, { useState, useEffect } from 'react';
import { ReleasePipeline, User } from '../types';
import { api } from '../api';
import {
  CheckCircle2,
  Clock,
  Rocket,
  Shield,
  Users,
} from 'lucide-react';

interface WorkspaceManagerProps {
  user: User;
  onCreateTask: (title: string, description: string) => void;
}

export const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({
  user,
  onCreateTask,
}) => {
  const [team, setTeam] = useState<User[]>([]);
  const [releases, setReleases] = useState<ReleasePipeline[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Release form state
  const [version, setVersion] = useState('Version 2.1');
  const [environment, setEnvironment] = useState<'canary' | 'production'>('production');
  const [releaseNotes, setReleaseNotes] = useState('Official team update: includes improved button readability, faster logins, and clean task management.');
  const [deploying, setDeploying] = useState(false);
  const [releaseSuccess, setReleaseSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setLoadingTeam(true);
    try {
      const [teamData, releaseData] = await Promise.all([
        api.getTeam(),
        api.getReleases(),
      ]);
      setTeam(teamData);
      setReleases(releaseData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTeam(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyMember = async (targetId: string) => {
    setVerifyingId(targetId);
    try {
      const res = await api.verifyTeamMember(targetId);
      setTeam((prev) =>
        prev.map((m) => (m.id === targetId ? { ...m, verified: true } : m))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleTriggerRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!version.trim()) return;

    setDeploying(true);
    setReleaseSuccess(null);

    try {
      const newRelease = await api.triggerRelease(version.trim(), environment, releaseNotes.trim());
      setReleases((prev) => [newRelease, ...prev]);
      setReleaseSuccess(`Update "${newRelease.version}" has been successfully launched!`);
      setVersion('');
      setReleaseNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to launch update');
    } finally {
      setDeploying(false);
    }
  };

  const unverifiedCount = team.filter((m) => !m.verified).length;

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1">
              <span>TEAM LEAD · APPROVALS & RELEASES</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Team Manager Workspace
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Review and approve newly registered teammates, supervise team progress, and officially launch new app updates for all users.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700">
              Waiting for Approval:{' '}
              <strong className={unverifiedCount > 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-emerald-600 font-bold'}>
                {unverifiedCount} team members
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Team Roster & Approvals */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Team Members List */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>Team Roster & Member Approvals</span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  As manager, approve new team members so only legitimate teammates can contribute
                </p>
              </div>

              <span className="text-[11px] text-slate-400">
                {team.length} Total Teammates
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-2">Teammate / Name</th>
                    <th className="pb-2">Team Role</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Manager Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                  {team.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {member.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          @{member.username}
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          member.role === 'Manager' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' :
                          member.role === 'Developer' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                          member.role === 'QA' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
                          'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        }`}>
                          {member.role === 'QA' ? 'Quality Tester' : member.role === 'Designer' ? 'Product Designer' : member.role === 'Developer' ? 'Software Developer' : 'Team Manager'}
                        </span>
                      </td>
                      <td className="py-2.5">
                        {member.verified ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approved</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Needs Approval</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        {member.verified ? (
                          <span className="text-slate-400 text-[11px]">Active</span>
                        ) : (
                          <button
                            onClick={() => handleVerifyMember(member.id)}
                            disabled={verifyingId === member.id}
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded transition-colors disabled:opacity-50"
                          >
                            {verifyingId === member.id ? 'Approving...' : 'Approve Teammate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Launch Official Update Form */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <Rocket className="h-4 w-4 text-purple-600" />
              <span>Launch Official App Update (Manager Only)</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
              When quality testing is complete, make new software changes live for all users
            </p>

            {releaseSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{releaseSuccess}</span>
              </div>
            )}

            <form onSubmit={handleTriggerRelease} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Update Name / Version
                  </label>
                  <input
                    type="text"
                    required
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="e.g. Version 2.2"
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Audience
                  </label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as any)}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="production">All Users (100% of people)</option>
                    <option value="canary">Pilot Test Group (10% of users first)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  What's new in this update?
                </label>
                <textarea
                  rows={2}
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  placeholder="Explain the new features or bug fixes in simple words..."
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={deploying}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors shadow-xs disabled:opacity-50"
              >
                {deploying ? 'Publishing update to users...' : `Launch Update to ${environment === 'production' ? 'All Users' : 'Test Group'}`}
              </button>
            </form>
          </div>

        </div>

        {/* Right Col: Past Updates History */}
        <div className="space-y-6">
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <span>Update Launch History</span>
            </h3>

            <div className="space-y-3">
              {releases.map((rel) => (
                <div
                  key={rel.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {rel.version}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold uppercase">
                      RUNNING SMOOTHLY
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {rel.notes}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span>Audience: {rel.environment === 'production' ? 'All Users' : 'Test Group'}</span>
                    <span>Approved by @{rel.triggeredBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Manager Task */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
              Add Manager Task to Board
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => onCreateTask('Review team member access and password security', 'Check team member roster to make sure every developer and designer is confirmed.')}
                className="w-full text-left p-2.5 text-xs rounded-lg border border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 transition-colors bg-slate-50/60 dark:bg-slate-800/30"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  + Team Access Audit Task
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Confirm approved teammates
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
