import React from 'react';
import { Layers, Network, Radio, Cpu, Cloud, Database } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="text-xs text-slate-500">System Design & Vendor-Compatible Integration Roadmap</div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
          Open Architecture & Future Vendor Integration Path
        </h1>
      </div>

      <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 p-4 text-xs text-slate-700 dark:text-slate-300">
        <div className="font-semibold text-slate-900 dark:text-white mb-0.5">
          Engineering Honesty: Vendor-Compatible Adapter Interface
        </div>
        <p>
          No proprietary hardware or closed vendor API keys are required for this MVP. All enterprise network controllers (such as Huawei iMaster NCE-Campus) exist behind swappable interfaces in the <code>adapters/</code> module.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
            <Radio className="w-4 h-4" />
            <h2>1. Observatory Layer</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Student PWA browser speed tests and low-cost ESP32 Wi-Fi probes measure real latency and throughput tagged strictly by Building and Floor.
          </p>
          <div className="text-[11px] font-mono text-emerald-600">Status: Fully Operational (Measured)</div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
            <Network className="w-4 h-4" />
            <h2>2. SDN & WLAN Adapters</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Interfaces for OpenConfig gNMI, SNMPv3, and REST-based wireless controller telemetry ingestion.
          </p>
          <div className="text-[11px] font-mono text-slate-500">Status: Future Integration Path</div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
            <Layers className="w-4 h-4" />
            <h2>3. AI Correlation Engine</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Rolling EWMA Z-score detector and deterministic correlation grouping packet drops, AP offline alerts, and student reports into unified tickets.
          </p>
          <div className="text-[11px] font-mono text-emerald-600">Status: Active Rule/Statistical Engine</div>
        </div>
      </div>
    </div>
  );
};
