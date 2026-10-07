import React, { useState } from 'react';
import {
  Radio,
  Building2,
  Activity,
  Wifi,
  ChevronDown,
  Layers,
  MapPin,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useCampusStore } from '../../store/useCampusStore';
import { CAMPUS_LOCATIONS } from '../../../shared/locations';
import { DataSourceType } from '../../../shared/types';
import { Badge } from '../../design-system/Badge';

export const MobileCampusPulseView: React.FC = () => {
  const { heatmap, overview, sourceFilter, setSourceFilter, triggerHaptic } = useCampusStore();
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('BLK-C');

  const selectedBuilding =
    CAMPUS_LOCATIONS.find((b) => b.id === selectedBuildingId) || CAMPUS_LOCATIONS[0];

  // Group heatmap cells by location
  const buildingHeatmapCells = heatmap.filter(
    (cell) => cell.locationId === selectedBuildingId
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', label: 'Good' };
    if (score >= 55) return { bg: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', label: 'Fair' };
    return { bg: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', label: 'Poor' };
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header and Source filter */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Campus Pulse</h2>
          <p className="text-xs text-slate-500">Live Wi-Fi quality across facilities</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge
            variant={sourceFilter === DataSourceType.MEASURED ? 'measured' : 'neutral'}
            size="xs"
            className="cursor-pointer"
          >
            <button
              onClick={() => {
                triggerHaptic();
                setSourceFilter(sourceFilter === 'ALL' ? DataSourceType.MEASURED : 'ALL');
              }}
              className="cursor-pointer"
            >
              {sourceFilter === DataSourceType.MEASURED ? 'Measured Only' : 'All Data'}
            </button>
          </Badge>
        </div>
      </div>

      {/* Campus Summary Scorecard */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-200 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              Observatory Health
            </span>
          </div>
          <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full">
            100% Real-Time
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/15 text-center">
          <div>
            <div className="text-[10px] text-blue-100">Connected Users</div>
            <div className="text-2xl font-extrabold font-mono mt-0.5">
              {overview?.connectedClients ?? 142}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-blue-100">Active APs</div>
            <div className="text-2xl font-extrabold font-mono mt-0.5">
              {overview?.activeAPs ?? 23}/{overview?.totalAPs ?? 24}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-blue-100">AI Risk Index</div>
            <div className="text-2xl font-extrabold font-mono mt-0.5">
              {overview?.aiRiskScore ?? 12}%
            </div>
          </div>
        </div>
      </div>

      {/* Building Selector Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CAMPUS_LOCATIONS.map((loc) => {
          const isSelected = selectedBuildingId === loc.id;
          return (
            <button
              key={loc.id}
              onClick={() => {
                triggerHaptic();
                setSelectedBuildingId(loc.id);
              }}
              className={`px-3 py-2 rounded-2xl whitespace-nowrap text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-semibold'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>{loc.name.split(' (')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Building Floor-by-Floor Heatmap Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-4 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {selectedBuilding.name}
            </h3>
            <p className="text-xs text-slate-500">{selectedBuilding.description}</p>
          </div>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {selectedBuilding.shortCode}
          </span>
        </div>

        {/* Floor Cards */}
        <div className="space-y-2.5">
          {selectedBuilding.floors.map((floor) => {
            const cell = buildingHeatmapCells.find((c) => c.floor === floor);
            const score = cell ? Math.round(cell.qualityScore) : 85;
            const latency = cell ? cell.avgLatencyMs : 22;
            const throughput = cell ? cell.avgDownloadMbps : 78;
            const evaluation = getScoreColor(score);

            return (
              <div
                key={floor}
                className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold flex items-center justify-center text-slate-800 dark:text-slate-200">
                      F{floor}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Floor {floor} Level
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {cell ? `${cell.measuredCount + cell.simulatedCount} real/sim probes` : 'Active Wi-Fi Zone'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold font-mono ${evaluation.text}`}>
                      {score}/100 ({evaluation.label})
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${evaluation.bg}`} />
                  </div>
                </div>

                {/* Progress Quality Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${evaluation.bg}`}
                    style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
                  />
                </div>

                {/* Micro Metric row */}
                <div className="grid grid-cols-2 gap-2 pt-0.5 text-[11px] font-mono text-slate-500">
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span>Latency RTT</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {latency} ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span>Downlink</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {throughput} Mbps
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
