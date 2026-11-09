import React, { useState, useEffect } from 'react';
import { DockerBuild, User } from '../types';
import { api } from '../api';
import {
  CheckCircle2,
  Cpu,
  GitPullRequest,
  Loader2,
  Package,
  Play,
  Terminal,
} from 'lucide-react';

interface WorkspaceDeveloperProps {
  user: User;
  onOpenPRModal: () => void;
  onCreateTask: (title: string, description: string) => void;
}

const serviceOptions = [
  { id: 'api-gateway', name: 'Main Web API', desc: 'Handles requests from web & mobile users' },
  { id: 'auth-service', name: 'User Login Service', desc: 'Checks user passwords and access levels' },
  { id: 'worker-daemon', name: 'Background Worker', desc: 'Processes large tasks quietly in background' },
  { id: 'telemetry-hub', name: 'System Speed Tracker', desc: 'Monitors server speed and error alerts' },
];

export const WorkspaceDeveloper: React.FC<WorkspaceDeveloperProps> = ({
  user,
  onOpenPRModal,
  onCreateTask,
}) => {
  const [builds, setBuilds] = useState<DockerBuild[]>([]);
  const [selectedService, setSelectedService] = useState('api-gateway');
  const [tag, setTag] = useState('v2.14.0-update');
  const [building, setBuilding] = useState(false);
  const [activeLog, setActiveLog] = useState<string[]>([]);
  const [selectedBuild, setSelectedBuild] = useState<DockerBuild | null>(null);

  const loadBuilds = async () => {
    try {
      const data = await api.getDockerBuilds();
      setBuilds(data);
      if (data.length > 0 && !selectedBuild) {
        setSelectedBuild(data[0]);
        setActiveLog(data[0].logs);
      }
    } catch (err) {
      console.error('Failed to load builds', err);
    }
  };

  useEffect(() => {
    loadBuilds();
  }, []);

  const handleTriggerBuild = async () => {
    setBuilding(true);
    setActiveLog([
      `[SysOps Hub] Starting software packaging for: ${selectedService}...`,
      `[SysOps Hub] Checking source files and verifying dependencies...`,
    ]);

    try {
      setTimeout(() => {
        setActiveLog((prev) => [
          ...prev,
          `=> Step 1/3: Compiling application code cleanly...`,
          `=> Step 2/3: Bundling and verifying asset files...`,
          `=> Step 3/3: Running self-healthcheck probe...`,
        ]);
      }, 700);

      const newBuild = await api.triggerDockerBuild(selectedService, tag);

      setTimeout(() => {
        setBuilds((prev) => [newBuild, ...prev]);
        setSelectedBuild(newBuild);
        setActiveLog(newBuild.logs);
        setBuilding(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setBuilding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
              <span>SOFTWARE DEVELOPMENT · PACKAGING & REVIEWS</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Software Developer Workspace
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Prepare ready-to-use software packages for your team, test assembly steps, monitor server service health, and propose code updates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPRModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-xs"
            >
              <GitPullRequest className="h-3.5 w-3.5" />
              <span>Propose Feature Change</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Package Assembly Tool */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-600" />
                  <span>Prepare Software Update Package (Simulated)</span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Compiles and bundles the application so it can be safely deployed
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-900 dark:text-slate-100"
                >
                  {serviceOptions.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="text-xs w-28 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 text-slate-900 dark:text-slate-100 font-mono"
                  placeholder="e.g. v2.14"
                />

                <button
                  onClick={handleTriggerBuild}
                  disabled={building}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors disabled:opacity-50 shadow-xs"
                >
                  {building ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Packaging...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Prepare Package</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Terminal Log Viewer */}
            <div className="rounded-lg bg-slate-950 p-4 border border-slate-800 font-mono text-[11px] text-slate-300 shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                  <span>STEP-BY-STEP PACKAGING LOG</span>
                </div>
                {selectedBuild && (
                  <span className="text-slate-400">
                    Package ID: <span className="text-slate-200">{selectedBuild.imageDigest.slice(0, 16)}</span>
                  </span>
                )}
              </div>

              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                {activeLog.length === 0 ? (
                  <div className="text-slate-500 py-6 text-center font-sans">
                    No active package build. Click "Prepare Package" to simulate bundling this app.
                  </div>
                ) : (
                  activeLog.map((line, idx) => (
                    <div key={idx} className="leading-relaxed">
                      <span className="text-slate-600 select-none mr-2">[{String(idx + 1).padStart(2, '0')}]</span>
                      <span className={line.includes('Successfully') ? 'text-emerald-400 font-semibold' : ''}>
                        {line}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Build History Table */}
            <div className="mt-5">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Recent Software Packages Created
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                {builds.slice(0, 4).map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedBuild(b);
                      setActiveLog(b.logs);
                    }}
                    className={`flex items-center justify-between p-2.5 text-xs cursor-pointer transition-colors ${
                      selectedBuild?.id === b.id
                        ? 'bg-slate-100 dark:bg-slate-800/80 font-medium'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 mr-2">
                          {b.tag}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {b.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>Ready in {b.durationSec}s</span>
                      <span>·</span>
                      <span>Created by @{b.triggeredBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Col: App Services & Dev Tasks */}
        <div className="space-y-6">
          
          {/* App Services Status */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-slate-600" />
              <span>App Services Status</span>
            </h3>
            
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Main Web API</div>
                  <div className="text-[11px] text-slate-400">3 server copies running smoothly</div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  HEALTHY
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">User Login Service</div>
                  <div className="text-[11px] text-slate-400">2 server copies checking passwords</div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  HEALTHY
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Background Worker</div>
                  <div className="text-[11px] text-slate-400">4 workers processing jobs</div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  HEALTHY
                </span>
              </div>
            </div>
          </div>

          {/* Quick Developer Tasks */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
              Add Developer Task to Board
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => onCreateTask('Improve temporary data caching to speed up user logins', 'Add automatic smart caching so repeat user queries load almost instantly.')}
                className="w-full text-left p-2.5 text-xs rounded-lg border border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 transition-colors bg-slate-50/60 dark:bg-slate-800/30"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  + Add Data Caching Task
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Helps screens and queries load faster
                </div>
              </button>

              <button
                onClick={() => onCreateTask('Speed up software packaging time', 'Optimize packaging steps so new feature builds finish in under 30 seconds.')}
                className="w-full text-left p-2.5 text-xs rounded-lg border border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 transition-colors bg-slate-50/60 dark:bg-slate-800/30"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  + Speed Up Package Builds Task
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Saves developer time during updates
                </div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
