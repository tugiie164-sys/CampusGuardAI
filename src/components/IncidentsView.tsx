import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Search, Filter, ShieldCheck, Wrench } from 'lucide-react';
import { useCampusStore } from '../store/useCampusStore';
import { IncidentStatus, UserRole } from '../../shared/types';

const STATUS_PIPELINE: IncidentStatus[] = [
  IncidentStatus.REPORTED,
  IncidentStatus.ASSIGNED,
  IncidentStatus.INVESTIGATING,
  IncidentStatus.RESOLVED,
  IncidentStatus.CLOSED,
];

export const IncidentsView: React.FC = () => {
  const { incidents, currentSession, updateIncidentStatus } = useCampusStore();
  const [selectedIncId, setSelectedIncId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [transitionNote, setTransitionNote] = useState('');

  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        inc.incidentNumber.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.locationId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeIncident =
    filteredIncidents.find((i) => i.id === selectedIncId) || filteredIncidents[0] || incidents[0];

  const canManage = currentSession.role !== UserRole.STUDENT;

  const handleStatusChange = async (targetStatus: IncidentStatus, applyRemediation: boolean = false) => {
    if (!activeIncident) return;
    await updateIncidentStatus(
      activeIncident.id,
      targetStatus,
      transitionNote || `Status updated to ${targetStatus} by ${currentSession.role}`,
      applyRemediation
    );
    setTransitionNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs text-slate-500">
            Closed-Loop Workflow · Full Audit Trail & Remediation Tracking
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
            Campus Incident Management Queue
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search incidents..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            {STATUS_PIPELINE.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Incidents List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredIncidents.length === 0 ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center text-xs text-slate-500">
              No incidents match filter.
            </div>
          ) : (
            filteredIncidents.map((inc) => {
              const isSelected = activeIncident?.id === inc.id;
              return (
                <button
                  key={inc.id}
                  onClick={() => setSelectedIncId(inc.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 dark:border-blue-400 bg-blue-50/30 dark:bg-blue-950/20 ring-1 ring-blue-600'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      {inc.incidentNumber}
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {inc.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                    {inc.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{inc.summary}</p>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {inc.locationId} F{inc.floor} · {inc.priority}
                    </span>
                    <span>Source: {inc.source}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Column: Incident Detail & 5-Stage Lifecycle Action */}
        <div className="lg:col-span-7">
          {activeIncident && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {activeIncident.incidentNumber}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Priority {activeIncident.priority}</span>
                    <span aria-hidden="true">·</span>
                    <span>Source: {activeIncident.source}</span>
                  </div>
                  <span>Updated {activeIncident.updatedAt.slice(11, 16)}</span>
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {activeIncident.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">{activeIncident.summary}</p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                  <span>
                    Location: <strong>{activeIncident.locationId} Floor {activeIncident.floor}</strong>
                  </span>
                  <span>
                    Assigned: <strong>{activeIncident.assignedTo || 'Unassigned'}</strong>
                  </span>
                  <span>
                    Reports: <strong>{activeIncident.studentReportCount} student tickets</strong>
                  </span>
                </div>
              </div>

              {/* 5-Stage Lifecycle Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Workflow Pipeline Stage ({activeIncident.status})
                  </span>
                  {!canManage && (
                    <span className="text-amber-600 text-xs">
                      Read-only in Student Role. Switch to ICT Tech or NetAdmin to transition.
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {STATUS_PIPELINE.map((st, idx) => {
                    const isCurrent = activeIncident.status === st;
                    const isPast = STATUS_PIPELINE.indexOf(activeIncident.status) >= idx;
                    return (
                      <button
                        key={st}
                        disabled={!canManage || isCurrent}
                        onClick={() => handleStatusChange(st, st === IncidentStatus.RESOLVED)}
                        className={`py-2 px-1 text-center text-xs font-semibold rounded-lg border transition-colors ${
                          isCurrent
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : isPast
                            ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500'
                        } ${canManage && !isCurrent ? 'hover:border-blue-500 cursor-pointer' : ''}`}
                      >
                        {idx + 1}. {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Diagnostic Card */}
              {activeIncident.rootCauseHypothesis && (
                <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-2 text-xs">
                  <div className="font-semibold text-blue-900 dark:text-blue-200">
                    AI Correlation Hypothesis & Investigation Guidance
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{activeIncident.rootCauseHypothesis}</p>
                  <div className="pt-2 border-t border-blue-200/50 dark:border-blue-900/40 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      <strong>Remediation:</strong> {activeIncident.remediationAction}
                    </span>
                    {canManage && activeIncident.status !== IncidentStatus.RESOLVED && (
                      <button
                        onClick={() => handleStatusChange(IncidentStatus.RESOLVED, true)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shrink-0 ml-3"
                      >
                        Apply Fix & Resolve
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
