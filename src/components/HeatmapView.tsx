import React, { useState } from 'react';
import { Radio, Wifi, Filter, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useCampusStore } from '../store/useCampusStore';
import { CAMPUS_LOCATIONS } from '../../shared/locations';
import { DataSourceType, SeverityLevel } from '../../shared/types';

export const HeatmapView: React.FC = () => {
  const { heatmap, sourceFilter, setSourceFilter, runSpeedTest, setActiveTab } = useCampusStore();
  const [selectedLocation, setSelectedLocation] = useState('BLK-C');
  const [selectedFloor, setSelectedFloor] = useState(2);
  const [isTesting, setIsTesting] = useState(false);

  const selectedCell = heatmap.find(
    (c) => c.locationId === selectedLocation && c.floor === selectedFloor
  ) || heatmap[0];

  const handleProbeTest = async () => {
    setIsTesting(true);
    try {
      await runSpeedTest(selectedLocation, selectedFloor);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Source Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs text-slate-500">
            Spatial Connectivity Observatory · Building & Floor Resolution (Zero GPS)
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
            Live Wi-Fi Quality Heatmap Matrix
          </h1>
        </div>

        {/* Source Filter segmented controls */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(['ALL', DataSourceType.MEASURED, DataSourceType.SIMULATED] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSourceFilter(mode)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                sourceFilter === mode
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {mode === 'ALL'
                ? 'All Sources'
                : mode === DataSourceType.MEASURED
                ? 'Measured Only (PWA / Probes)'
                : 'Simulated Only'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 6 Campus Complexes */}
        <div className="lg:col-span-8 space-y-4">
          {CAMPUS_LOCATIONS.map((loc) => {
            const locCells = heatmap
              .filter((c) => c.locationId === loc.id)
              .sort((a, b) => a.floor - b.floor);

            return (
              <div
                key={loc.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                      {loc.name}
                    </h2>
                    <p className="text-xs text-slate-500">{loc.description}</p>
                  </div>
                  <span className="font-mono text-xs text-slate-400">{loc.floors.length} Floors</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {locCells.map((cell) => {
                    const isSelected = selectedLocation === cell.locationId && selectedFloor === cell.floor;
                    let style = 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200';
                    if (cell.status === SeverityLevel.CRITICAL) {
                      style = 'border-rose-300 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200';
                    } else if (cell.status === SeverityLevel.HIGH) {
                      style = 'border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200';
                    }

                    return (
                      <button
                        key={`${cell.locationId}-F${cell.floor}`}
                        onClick={() => {
                          setSelectedLocation(cell.locationId);
                          setSelectedFloor(cell.floor);
                        }}
                        className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${style} ${
                          isSelected ? 'ring-2 ring-blue-600 dark:ring-blue-400' : 'hover:opacity-90'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span>Floor {cell.floor}</span>
                          <span className="font-mono tabular-nums">{cell.qualityScore}/100</span>
                        </div>
                        <div className="mt-2 text-[11px] font-mono tabular-nums space-y-0.5 opacity-90">
                          <div>RTT: {cell.avgLatencyMs}ms</div>
                          <div>Down: {cell.avgDownloadMbps}M</div>
                          <div>Loss: {cell.avgPacketLossPct}%</div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-current/10 flex items-center justify-between text-[10px] font-mono">
                          <span>{cell.status}</span>
                          <span>M:{cell.measuredCount} S:{cell.simulatedCount}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Inspector & Live Probe Injection */}
        <div className="lg:col-span-4 space-y-4">
          {selectedCell && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 sticky top-20">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="text-xs text-slate-500">Selected Zone Telemetry</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedCell.shortCode} · Floor {selectedCell.floor}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>Status: <strong>{selectedCell.status}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Active Reports: <strong>{selectedCell.activeReports}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-slate-500">Quality Score</div>
                  <div className="text-xl font-mono font-semibold tabular-nums mt-0.5">
                    {selectedCell.qualityScore}/100
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-slate-500">Latency / Jitter</div>
                  <div className="text-xl font-mono font-semibold tabular-nums mt-0.5">
                    {selectedCell.avgLatencyMs}ms / {selectedCell.avgJitterMs}ms
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-slate-500">Throughput</div>
                  <div className="text-sm font-mono font-semibold tabular-nums mt-0.5">
                    {selectedCell.avgDownloadMbps} / {selectedCell.avgUploadMbps} Mbps
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-slate-500">Packet Loss</div>
                  <div className="text-sm font-mono font-semibold tabular-nums mt-0.5">
                    {selectedCell.avgPacketLossPct}%
                  </div>
                </div>
              </div>

              <button
                onClick={handleProbeTest}
                disabled={isTesting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Wifi className="w-4 h-4" />
                <span>
                  {isTesting ? 'Measuring RTT & Throughput...' : `Inject Real Probe Test into ${selectedCell.shortCode} Floor ${selectedCell.floor}`}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('student-pwa')}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Submit Student Report for this Zone →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
