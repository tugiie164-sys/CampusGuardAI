import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Layers, ShieldCheck, Database, Radio, Cpu } from 'lucide-react';

export const TechnicalStatusView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="text-xs text-slate-500">Engineering Transparency & Audit Disclosure</div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
          Technical Status: Functional vs. Simulated vs. External Stubs
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Genuinely Functional */}
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <h2>1. Genuinely Functional (Live Code)</h2>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li>• <strong>Real Browser/Probe Speed Test:</strong> Active HTTP round-trip RTT and payload throughput test against <code>/api/probe/ping</code>.</li>
            <li>• <strong>Unified Ingestion API:</strong> <code>POST /api/measurements</code> accepts real payloads and updates live in-memory database.</li>
            <li>• <strong>Server-Sent Events (SSE):</strong> <code>GET /api/stream</code> pushes state updates to connected clients in real-time.</li>
            <li>• <strong>Auth & RBAC:</strong> Session cookies, role checks on endpoints, and IDOR protection.</li>
            <li>• <strong>Incident Workflow Engine:</strong> 5-stage lifecycle state machine with immutable audit trail.</li>
            <li>• <strong>Student Assistant:</strong> Controlled command system with safe location and status lookups.</li>
          </ul>
        </div>

        {/* 2. Simulated */}
        <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-white dark:bg-slate-900 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
            <Clock className="w-4 h-4" />
            <h2>2. Simulated (Synthetic Campus Layer)</h2>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li>• <strong>Wider Network Topology:</strong> Routers, distribution switches, and AP hardware models are synthetic in-memory state.</li>
            <li>• <strong>IoT Fleet Telemetry:</strong> Environmental sensors, smart classroom boards, and substation power meters.</li>
            <li>• <strong>Deterministic Scenarios:</strong> AP failure, abnormal traffic spike, and student complaint clusters.</li>
            <li>• <strong>Security Threat Events:</strong> Model-generated UNSW-NB15 flow characteristics for defensive SOC demonstration.</li>
          </ul>
        </div>

        {/* 3. Stubs & External Infrastructure */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
            <Layers className="w-4 h-4" />
            <h2>3. Stubs & Future Integration Paths</h2>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li>• <strong>Physical Vendor SDN Controllers:</strong> Huawei iMaster NCE-Campus / CloudCampus REST APIs (documented adapter interface).</li>
            <li>• <strong>Hardware Protocol Collectors:</strong> Native SNMPv3 polling daemon, NetFlow/IPFIX collectors, and Syslog UDP daemons.</li>
            <li>• <strong>Cloud PostgreSQL Persistence:</strong> Schema models and migrations ready; currently using portable database store for zero-dependency execution.</li>
            <li>• <strong>External LLM API:</strong> Safe server-side proxy pattern with deterministic local fallback.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
