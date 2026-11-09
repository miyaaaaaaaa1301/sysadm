import React, { useState, useEffect } from 'react';
import { MetricSnapshot } from '../types';
import { api } from '../api';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  HardDrive,
  Network,
  RefreshCw,
  Zap,
} from 'lucide-react';

export const MetricsView: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricSnapshot | null>(null);
  const [history, setHistory] = useState<Array<{ time: string; cpu: number; latency: number; memory: number }>>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.getMetrics();
      setMetrics(res.current);
      setHistory(res.history);
    } catch (err) {
      console.error('Failed to fetch telemetry metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    if (!autoRefresh) return;
    const interval = setInterval(fetchMetrics, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
              <span>LIVE SYSTEM HEALTH · SERVER PERFORMANCE (SIMULATED)</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              System Health & Performance
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Live look at computer speed, memory usage, response times, and server stability. Everything is updated automatically.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-refresh toggle */}
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-slate-900 focus:ring-0"
              />
              <span>Auto-refresh (every 4s)</span>
            </label>

            {/* Manual refresh button */}
            <button
              onClick={fetchMetrics}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row - Plain Non-technical Labels */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* CPU / Computer Workload */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold">Computer Load</span>
              <Cpu className="h-4 w-4 text-slate-500" />
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {metrics.cpuUsagePercent}%
            </div>
            <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              Running smoothly
            </div>
          </div>

          {/* Memory Usage */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold">Memory Used</span>
              <Activity className="h-4 w-4 text-slate-500" />
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {metrics.memoryUsagePercent}%
            </div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Plenty of room free
            </div>
          </div>

          {/* Response Time (Latency) */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold">Response Speed</span>
              <Zap className="h-4 w-4 text-slate-500" />
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {metrics.latencyP95Ms} <span className="text-xs font-normal text-slate-400">ms</span>
            </div>
            <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              Very fast response
            </div>
          </div>

          {/* Internet Traffic */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold">Traffic Flow</span>
              <Network className="h-4 w-4 text-slate-500" />
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {metrics.networkThroughputMbps} <span className="text-xs font-normal text-slate-400">Mbps</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Data flowing smoothly
            </div>
          </div>

          {/* Hard Drive Activity */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold">Storage Speed</span>
              <HardDrive className="h-4 w-4 text-slate-500" />
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {metrics.diskIoPercent}%
            </div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Saving data safely
            </div>
          </div>

          {/* Error Rate */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold">Error Rate</span>
              <AlertTriangle className="h-4 w-4 text-slate-500" />
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {metrics.errorRatePercent}%
            </div>
            <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              Almost zero errors
            </div>
          </div>

        </div>
      )}

      {/* Historical Telemetry Sparkline & Bar Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Computer Load History */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Computer Load Over Last Minute
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Shows how much work the servers are doing every 5 seconds
              </p>
            </div>
            <span className="text-[11px] text-slate-400">
              {history.length} recent checks
            </span>
          </div>

          <div className="h-40 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
            {history.map((pt, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                <div className="absolute -top-7 hidden group-hover:block bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap z-10 font-mono">
                  {pt.cpu}% load at {pt.time}
                </div>
                <div
                  className="w-full bg-slate-900 dark:bg-slate-200 rounded-xs transition-all duration-300 hover:opacity-80"
                  style={{ height: `${Math.max(8, pt.cpu)}%` }}
                />
                <span className="text-[9px] text-slate-400 truncate w-full text-center">
                  {pt.time.slice(3)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 pt-2">
            <span>1 minute ago</span>
            <span>Just now</span>
          </div>
        </div>

        {/* Response Speed History */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Screen Loading Speed (Milliseconds)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Lower bars mean users experience faster, snappier loading
              </p>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Fast
            </span>
          </div>

          <div className="h-40 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
            {history.map((pt, i) => {
              const heightPct = Math.min(100, Math.max(10, (pt.latency / 45) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                  <div className="absolute -top-7 hidden group-hover:block bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap z-10 font-mono">
                    {pt.latency}ms at {pt.time}
                  </div>
                  <div
                    className="w-full bg-indigo-600 dark:bg-indigo-400 rounded-xs transition-all duration-300 hover:opacity-80"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[9px] text-slate-400 truncate w-full text-center">
                    {pt.time.slice(3)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 pt-2">
            <span>1 minute ago</span>
            <span>Just now</span>
          </div>
        </div>

      </div>

      {/* Server Computers Status Table */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
          Server Computers Overview
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-2">Server Name</th>
                <th className="pb-2">Function</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Workload</th>
                <th className="pb-2 text-right">Uptime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-2.5 font-semibold text-slate-900 dark:text-slate-100">Main Coordinator Server</td>
                <td className="py-2.5 text-slate-500">Coordinates team tasks</td>
                <td className="py-2.5 text-emerald-600 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Running smoothly
                </td>
                <td className="py-2.5 text-slate-600 dark:text-slate-400">8 active tasks</td>
                <td className="py-2.5 text-right text-slate-500">42 days online</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-2.5 font-semibold text-slate-900 dark:text-slate-100">Application Worker A</td>
                <td className="py-2.5 text-slate-500">Handles user web traffic</td>
                <td className="py-2.5 text-emerald-600 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Running smoothly
                </td>
                <td className="py-2.5 text-slate-600 dark:text-slate-400">14 active tasks</td>
                <td className="py-2.5 text-right text-slate-500">42 days online</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-2.5 font-semibold text-slate-900 dark:text-slate-100">Application Worker B</td>
                <td className="py-2.5 text-slate-500">Handles user web traffic</td>
                <td className="py-2.5 text-emerald-600 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Running smoothly
                </td>
                <td className="py-2.5 text-slate-600 dark:text-slate-400">12 active tasks</td>
                <td className="py-2.5 text-right text-slate-500">19 days online</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
