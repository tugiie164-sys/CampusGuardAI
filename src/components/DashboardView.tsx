import React from 'react';
import {
  Activity,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Radio,
  Wifi,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useCampusStore } from '../store/useCampusStore';
import { ScenarioType, SeverityLevel } from '../../shared/types';

const SCENARIOS: { id: ScenarioType; label: string; target: string; desc: string }[] = [
  {
    id: 'AP_FAILURE',
    label: 'Access Point Failure',
    target: 'Block C · Floor 2 (AP-ICTLab4-C204)',
    desc: 'PoE keepalive drops, client spillover to Floor 3, heatmap cell turns Critical.',
  },
  {
    id: 'ABNORMAL_TRAFFIC',
    label: 'Abnormal Traffic',
    target: 'Workstation C204-PC12',
    desc: '740 Mbps east-west port recon scan detected by defensive rule engine.',
  },
  {
    id: 'HIGH_BANDWIDTH',
    label: 'High Bandwidth Usage',
    target: 'North Residence · Floor 3',
    desc: 'Evening peak streaming saturation with 245 concurrent student clients.',
  },
  {
    id: 'MULTIPLE_STUDENT_REPORTS',
    label: 'Multiple Student Reports',
    target: 'Block C Study Areas',
    desc: '3 concurrent student Wi-Fi complaints converge into a single prioritized P1 ticket.',
  },
  {
    id: 'IOT_SENSOR_FAILURE',
    label: 'IoT Sensor Offline',
    target: 'Biotech Cleanroom Sensor',
    desc: 'MQTT telemetry frames drop, triggering automated environmental alert.',
  },
];

export const DashboardView: React.FC = () => {
  const {
    overview,
    heatmap,
    incidents,
    alerts,
    recentMetrics,
    currentScenario,
    triggerScenario,
    resetScenario,
    setPresentationMode,
    setActiveTab,
  } = useCampusStore();

  if (!overview) return null;

  const isCrit = overview.overallStatus === SeverityLevel.CRITICAL;
  const isHigh = overview.overallStatus === SeverityLevel.HIGH;

  const chartData = (recentMetrics || []).slice(0, 15).reverse().map((m, i) => ({
    time: m.timestamp.slice(11, 16),
    latency: m.latencyMs,
    throughput: m.downloadMbps,
  }));

  return (
    <div className="space-y-6">
      {/* 1. Overview Header & Natural Language Summary */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-4xl">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Campus Status:</span>
              <span
                className={`font-semibold ${
                  isCrit
                    ? 'text-rose-600 dark:text-rose-400'
                    : isHigh
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {overview.overallStatus}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400">
                Active Scenario: {currentScenario}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white leading-snug">
              {overview.naturalLanguageSummary}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setPresentationMode(true, 1)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start 3-Min Demo Sequence</span>
            </button>
            <button
              onClick={resetScenario}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Baseline</span>
            </button>
          </div>
        </div>

        {/* 8 Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-xs text-slate-500">Connected Clients</div>
            <div className="text-lg font-mono font-semibold tabular-nums text-slate-900 dark:text-white mt-0.5">
              {overview.connectedClients.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">Active Sessions</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Active APs</div>
            <div className="text-lg font-mono font-semibold tabular-nums text-slate-900 dark:text-white mt-0.5">
              {overview.activeAPs} / {overview.totalAPs}
            </div>
            <div className="text-[11px] text-slate-400">Wi-Fi 6 Fleet</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Throughput</div>
            <div className="text-lg font-mono font-semibold tabular-nums text-slate-900 dark:text-white mt-0.5">
              {overview.totalBandwidthGbps} Gbps
            </div>
            <div className="text-[11px] text-slate-400">Aggregate Traffic</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Open Incidents</div>
            <div className="text-lg font-mono font-semibold tabular-nums text-slate-900 dark:text-white mt-0.5">
              {overview.unresolvedIncidents}
            </div>
            <div className="text-[11px] text-slate-400">Assigned Queue</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Security Alerts</div>
            <div className="text-lg font-mono font-semibold tabular-nums text-slate-900 dark:text-white mt-0.5">
              {overview.securityAlertsCount}
            </div>
            <div className="text-[11px] text-slate-400">Defensive SOC</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">IoT Fleet Health</div>
            <div className="text-lg font-mono font-semibold tabular-nums text-slate-900 dark:text-white mt-0.5">
              {overview.iotFleetHealthPct}%
            </div>
            <div className="text-[11px] text-slate-400">Sensors Online</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Statistical Risk</div>
            <div
              className={`text-lg font-mono font-semibold tabular-nums mt-0.5 ${
                overview.aiRiskScore >= 70
                  ? 'text-rose-600 dark:text-rose-400'
                  : overview.aiRiskScore >= 40
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {overview.aiRiskScore}/100
            </div>
            <div className="text-[11px] text-slate-400">Z-Score Engine</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Data Pipeline</div>
            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
              Dual Layer
            </div>
            <div className="text-[11px] text-slate-400">Measured + Sim</div>
          </div>
        </div>
      </div>

      {/* 2. Scenario Trigger Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs">
          <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-slate-900 dark:text-white">
            Interactive Demo Scenario Injector (Labeled Simulated Data)
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">
            Triggers deterministic state changes in backend database & anomaly engine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {SCENARIOS.map((scen) => {
            const isActive = currentScenario === scen.id;
            return (
              <button
                key={scen.id}
                onClick={() => triggerScenario(scen.id)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 ring-1 ring-amber-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                  <span>{scen.label}</span>
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                    Simulated
                  </span>
                </div>
                <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                  {scen.target}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{scen.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Split View: AI Detections & Recommendations (Left 7) + Live Heatmap / Trends (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Explainable AI Alerts */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="text-xs text-slate-500">
                  Statistical Detection & Correlation (Non-autonomous Decision Support)
                </div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                  AI Anomaly Findings, Root Cause & Recommended Actions
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-500">{alerts.length} Active Finding(s)</span>
            </div>

            {alerts.length === 0 ? (
              <div className="py-8 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  Zero Critical Anomalies Active
                </div>
                <p className="text-xs text-slate-500">
                  All telemetry streams within normal statistical baseline range.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alt) => (
                  <div
                    key={alt.id}
                    className={`rounded-xl border p-4 space-y-3 ${
                      alt.severity === SeverityLevel.CRITICAL
                        ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20'
                        : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {alt.title}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-slate-500">Confidence {alt.confidence}%</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">
                        Rule: {alt.ruleId}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-white">Probable Cause:</strong>{' '}
                      {alt.probableCause}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-white/60 dark:bg-slate-900/60 p-3 rounded-lg">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white mb-1">
                          Observed Evidence:
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                          {alt.observedEvidence.map((ev, i) => (
                            <li key={i}>{ev}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white mb-1">
                          Investigation Steps:
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                          {alt.investigationSteps.map((st, i) => (
                            <li key={i}>{st}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">
                        <strong className="text-slate-900 dark:text-white">Remediation:</strong>{' '}
                        {alt.remediation}
                      </span>
                      <button
                        onClick={() => setActiveTab('incidents')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shrink-0 ml-3"
                      >
                        Inspect Incident →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Spatial Matrix & Telemetry Trends */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Campus Quality Heatmap Preview
                </h2>
                <p className="text-xs text-slate-500">Live floor quality across academic complexes</p>
              </div>
              <button
                onClick={() => setActiveTab('heatmap')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Full Matrix →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {heatmap.slice(0, 9).map((cell) => {
                let border = 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20';
                if (cell.status === SeverityLevel.CRITICAL) {
                  border = 'border-rose-300 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/40';
                } else if (cell.status === SeverityLevel.HIGH) {
                  border = 'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30';
                }

                return (
                  <button
                    key={`${cell.locationId}-${cell.floor}`}
                    onClick={() => setActiveTab('heatmap')}
                    className={`p-3 rounded-xl border text-left transition-opacity hover:opacity-90 cursor-pointer ${border}`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                      <span>{cell.shortCode} F{cell.floor}</span>
                      <span className="font-mono tabular-nums">{cell.qualityScore}/100</span>
                    </div>
                    <div className="text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-300 mt-1">
                      {cell.avgLatencyMs}ms · {cell.avgDownloadMbps}M
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RTT Latency Trend Chart */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Probe Latency (ms) & Throughput Trend
            </h2>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="latency" name="RTT (ms)" stroke="#d97706" fill="#f59e0b" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="throughput" name="Download (Mbps)" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
