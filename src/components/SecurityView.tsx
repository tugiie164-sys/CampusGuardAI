import React from 'react';
import { Shield, ShieldAlert, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useCampusStore } from '../store/useCampusStore';
import { SeverityLevel } from '../../shared/types';

export const SecurityView: React.FC = () => {
  const { securityEvents, overview, triggerScenario } = useCampusStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs text-slate-500">
            Defensive Security Monitoring (Defensive Monitoring Only, No Offensive Scanning)
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
            Security Operations & Defensive Event Timeline
          </h1>
        </div>

        <button
          onClick={() => triggerScenario('ABNORMAL_TRAFFIC')}
          className="px-3.5 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:opacity-90 cursor-pointer"
        >
          Inject Abnormal Traffic Event (Simulated)
        </button>
      </div>

      {/* Honest Prototype Banner */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs text-slate-600 dark:text-slate-300 space-y-1">
        <div className="font-semibold text-slate-900 dark:text-white">
          Honesty Rule: Simulated Threat Events & Statistical Decision Support
        </div>
        <p>
          Events in this log are synthetic simulations modeled on UNSW-NB15 flow characteristics. The platform performs purely defensive telemetry correlation and never claims autonomous real-world attack mitigation.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Defensive Security Events ({securityEvents.length})
        </h2>

        <div className="space-y-3">
          {securityEvents.map((ev) => (
            <div key={ev.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${ev.severity === SeverityLevel.CRITICAL || ev.severity === SeverityLevel.HIGH ? 'text-rose-600' : 'text-amber-600'}`}>
                    {ev.severity}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{ev.eventType}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-500">Source: {ev.source}</span>
                </div>
                <span className="font-mono text-slate-400">Score {ev.anomalyScore}</span>
              </div>

              <p className="text-slate-600 dark:text-slate-300">{ev.description}</p>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white">Defensive Response Guidance:</div>
                <p className="text-slate-600 dark:text-slate-400">{ev.defensiveGuidance}</p>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{ev.mitreTechnique} · NIST CSF: {ev.nistFunction}</span>
                <span>Host: {ev.deviceIp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
