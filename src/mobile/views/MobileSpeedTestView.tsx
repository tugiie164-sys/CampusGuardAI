import React, { useState } from 'react';
import {
  Gauge,
  Wifi,
  ArrowDown,
  ArrowUp,
  Activity,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ShieldCheck,
} from 'lucide-react';
import { useCampusStore } from '../../store/useCampusStore';
import { CAMPUS_LOCATIONS } from '../../../shared/locations';
import { DataSourceType } from '../../../shared/types';
import { Badge } from '../../design-system/Badge';
import { Button } from '../../design-system/Button';
import { Card } from '../../design-system/Card';

export const MobileSpeedTestView: React.FC = () => {
  const { runSpeedTest, recentMetrics, triggerHaptic, setMobileActiveTab } = useCampusStore();

  const [selectedLoc, setSelectedLoc] = useState('BLK-C');
  const [selectedFloor, setSelectedFloor] = useState(2);
  const [isTesting, setIsTesting] = useState(false);
  const [testStage, setTestStage] = useState<'idle' | 'pinging' | 'download' | 'upload' | 'complete'>('idle');
  const [currentResult, setCurrentResult] = useState<any>(null);

  const currentLocation = CAMPUS_LOCATIONS.find((l) => l.id === selectedLoc) || CAMPUS_LOCATIONS[0];

  const handleStartTest = async () => {
    triggerHaptic();
    setIsTesting(true);
    setTestStage('pinging');

    try {
      // Simulate multi-stage visual progression while running real probe
      setTimeout(() => setTestStage('download'), 700);
      setTimeout(() => setTestStage('upload'), 1400);

      const res = await runSpeedTest(selectedLoc, selectedFloor);
      setCurrentResult(res);
      setTestStage('complete');
      triggerHaptic();
    } catch {
      setTestStage('idle');
    } finally {
      setIsTesting(false);
    }
  };

  const getQualityAssessment = (latency: number, throughput: number) => {
    if (latency > 65 || throughput < 15) {
      return {
        label: 'Degraded Connectivity',
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/30',
        icon: AlertTriangle,
        desc: 'High latency detected. Recommended to file a quick report.',
        canReport: true,
      };
    }
    if (latency > 35 || throughput < 40) {
      return {
        label: 'Fair Wi-Fi Quality',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        icon: Activity,
        desc: 'Acceptable for browsing; potential latency in real-time video calls.',
        canReport: false,
      };
    }
    return {
      label: 'Excellent Wi-Fi Performance',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      icon: CheckCircle2,
      desc: 'Optimal speed for video streaming, downloads, and laboratory work.',
      canReport: false,
    };
  };

  const assessment = currentResult
    ? getQualityAssessment(currentResult.latencyMs, currentResult.downloadMbps)
    : null;

  return (
    <div className="space-y-4 pb-4">
      {/* Privacy Notice Banner */}
      <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="font-medium text-[11px] leading-tight">
            Privacy by Design: User-selected room & floor only. Zero GPS tracking.
          </span>
        </div>
        <Badge variant="measured" size="xs">
          Measured
        </Badge>
      </div>

      {/* Building & Floor Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            Select Your Location
          </span>
          <span className="text-[11px] font-mono">Floor {selectedFloor}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Building</label>
            <select
              value={selectedLoc}
              onChange={(e) => {
                setSelectedLoc(e.target.value);
                const loc = CAMPUS_LOCATIONS.find((l) => l.id === e.target.value);
                if (loc && !loc.floors.includes(selectedFloor)) {
                  setSelectedFloor(loc.floors[0]);
                }
              }}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-2 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Floor</label>
            <div className="flex gap-1.5">
              {currentLocation.floors.map((fl) => (
                <button
                  key={fl}
                  onClick={() => setSelectedFloor(fl)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer ${
                    selectedFloor === fl
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  F{fl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Speedometer Gauge Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-xs">
        {/* Apple-style circular dial container */}
        <div className="relative w-52 h-52 flex items-center justify-center">
          {/* Outer ring track */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="6"
              className="text-slate-100 dark:text-slate-800"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={264}
              strokeDashoffset={
                isTesting
                  ? 80
                  : currentResult
                  ? Math.max(20, 264 - (currentResult.downloadMbps / 120) * 264)
                  : 264
              }
              strokeLinecap="round"
              className={`transition-all duration-700 ${
                isTesting
                  ? 'text-blue-500 animate-pulse'
                  : currentResult?.latencyMs > 60
                  ? 'text-rose-500'
                  : 'text-emerald-500'
              }`}
            />
          </svg>

          {/* Center Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            {isTesting ? (
              <div className="space-y-1 animate-pulse">
                <Gauge className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto animate-spin" />
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
                  {testStage === 'pinging'
                    ? 'Probing RTT...'
                    : testStage === 'download'
                    ? 'Testing Downlink...'
                    : 'Testing Uplink...'}
                </div>
              </div>
            ) : currentResult ? (
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Download
                </span>
                <div className="text-4xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">
                  {currentResult.downloadMbps}
                </div>
                <span className="text-xs font-mono font-medium text-slate-500">Mbps</span>
              </div>
            ) : (
              <div className="space-y-1">
                <Wifi className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <div className="text-xs font-medium text-slate-400">Ready to probe</div>
              </div>
            )}
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="text-[10px] text-slate-400 font-medium">Ping / RTT</div>
            <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {currentResult ? `${currentResult.latencyMs} ms` : '--'}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="text-[10px] text-slate-400 font-medium">Jitter</div>
            <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {currentResult ? `${currentResult.jitterMs} ms` : '--'}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="text-[10px] text-slate-400 font-medium">Upload</div>
            <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {currentResult ? `${currentResult.uploadMbps} M` : '--'}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full mt-4">
          <Button
            onClick={handleStartTest}
            isLoading={isTesting}
            size="lg"
            className="w-full py-3 rounded-2xl shadow-md text-sm font-semibold"
            icon={<Activity className="w-4 h-4" />}
          >
            {isTesting ? 'Running Probe...' : currentResult ? 'Run Test Again' : 'Start Wi-Fi Test'}
          </Button>
        </div>
      </div>

      {/* Quality Assessment & Direct Escalation */}
      {assessment && (
        <div className={`p-4 rounded-2xl border ${assessment.bg} space-y-2`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <assessment.icon className={`w-4 h-4 ${assessment.color}`} />
              <span className={`text-xs font-semibold ${assessment.color}`}>
                {assessment.label}
              </span>
            </div>
            <Badge variant="measured" size="xs">
              Live Probe
            </Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">{assessment.desc}</p>
          {assessment.canReport && (
            <button
              onClick={() => {
                triggerHaptic();
                setMobileActiveTab('report');
              }}
              className="mt-1 w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Wi-Fi Issue at {currentLocation.shortCode} F{selectedFloor}</span>
            </button>
          )}
        </div>
      )}

      {/* Recent Measurements Feed */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-900 dark:text-white px-1">
          Recent Campus Telemetry
        </div>
        <div className="space-y-1.5">
          {recentMetrics.slice(0, 3).map((m) => (
            <div
              key={m.id}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <Badge variant={m.source === DataSourceType.MEASURED ? 'measured' : 'simulated'} size="xs">
                  {m.source}
                </Badge>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {m.locationId} F{m.floor}
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
                <span>{m.latencyMs} ms</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {m.downloadMbps} Mbps
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
