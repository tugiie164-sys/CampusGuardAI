import React from 'react';
import { Download, Printer, BarChart2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useCampusStore } from '../store/useCampusStore';
import { CAMPUS_LOCATIONS } from '../../shared/locations';

export const AnalyticsView: React.FC = () => {
  const { heatmap, recentMetrics } = useCampusStore();

  const barData = CAMPUS_LOCATIONS.map((loc) => {
    const cells = heatmap.filter((c) => c.locationId === loc.id);
    const avgScore = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.qualityScore, 0) / cells.length) : 85;
    const avgLatency = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.avgLatencyMs, 0) / cells.length) : 18;
    return {
      name: loc.shortCode,
      score: avgScore,
      latency: avgLatency,
    };
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Source', 'LocationId', 'Floor', 'LatencyMs', 'DownloadMbps', 'PacketLossPct', 'QualityScore'];
    const rows = recentMetrics.map((m) =>
      [m.timestamp, m.source, m.locationId, m.floor, m.latencyMs, m.downloadMbps, m.packetLossPct, m.qualityScore].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campusguard_telemetry_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs text-slate-500">Service Level Agreement & Spatial Quality Trends</div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
            Campus SLA & Analytics Reports
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-xs text-slate-500">Core Network Uptime</div>
          <div className="text-2xl font-mono font-semibold tabular-nums mt-1">99.94%</div>
          <div className="text-xs text-emerald-600 mt-0.5">Meets 99.90% SLA</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-xs text-slate-500">Mean Time to Detect (MTTD)</div>
          <div className="text-2xl font-mono font-semibold tabular-nums mt-1">3.8 sec</div>
          <div className="text-xs text-slate-400 mt-0.5">Automated Z-score</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-xs text-slate-500">Mean Time to Resolve (MTTR)</div>
          <div className="text-2xl font-mono font-semibold tabular-nums mt-1">14.2 min</div>
          <div className="text-xs text-slate-400 mt-0.5">Field Dispatch Average</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-xs text-slate-500">Campus Energy Draw</div>
          <div className="text-2xl font-mono font-semibold tabular-nums mt-1">241.6 kW</div>
          <div className="text-xs text-emerald-600 mt-0.5">-12% Off-Peak AP Sleep</div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Average Wi-Fi Quality Score by Complex
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="score" name="Quality Score (/100)" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
