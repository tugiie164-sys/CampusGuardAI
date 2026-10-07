import React, { useState } from 'react';
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  MapPin,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useCampusStore } from '../../store/useCampusStore';
import { IncidentPriority, IncidentStatus, SeverityLevel } from '../../../shared/types';
import { Badge } from '../../design-system/Badge';
import { Button } from '../../design-system/Button';

export const MobileFieldQueueView: React.FC = () => {
  const { incidents, updateIncidentStatus, triggerHaptic, currentSession } = useCampusStore();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [fieldNote, setFieldNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter for actionable field incidents
  const openIncidents = incidents.filter(
    (inc) =>
      inc.status === IncidentStatus.REPORTED ||
      inc.status === IncidentStatus.ASSIGNED ||
      inc.status === IncidentStatus.INVESTIGATING
  );

  const handleAction = async (
    id: string,
    newStatus: IncidentStatus,
    note?: string,
    applyRemediation?: boolean
  ) => {
    triggerHaptic();
    setIsUpdating(true);
    try {
      await updateIncidentStatus(
        id,
        newStatus,
        note || `Field technician update from mobile app (${currentSession.name})`,
        applyRemediation
      );
      setFieldNote('');
      triggerHaptic();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Field Dispatch Queue</h2>
          <p className="text-xs text-slate-500">
            {openIncidents.length} active incidents awaiting field resolution
          </p>
        </div>
        <Badge variant="severity" severity={SeverityLevel.HIGH} size="xs" pulse>
          Live Dispatch
        </Badge>
      </div>

      {openIncidents.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              All Campus Incidents Resolved
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              No outstanding field tickets in the queue.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {openIncidents.map((incident) => {
            const isExpanded = selectedIncidentId === incident.id;

            return (
              <div
                key={incident.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs transition-all"
              >
                {/* Header row */}
                <div
                  onClick={() => {
                    triggerHaptic();
                    setSelectedIncidentId(isExpanded ? null : incident.id);
                  }}
                  className="p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          incident.priority === IncidentPriority.P1_CRITICAL
                            ? 'bg-rose-500 text-white'
                            : incident.priority === IncidentPriority.P2_HIGH
                            ? 'bg-amber-500 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {incident.priority}
                      </span>
                      <Badge status={incident.status} size="xs" />
                      <span className="text-[11px] font-mono text-slate-400">
                        #{incident.incidentNumber}
                      </span>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90 text-blue-600' : ''
                      }`}
                    />
                  </div>

                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {incident.title}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span>{incident.locationId}</span>
                    </span>
                    <span className="font-mono text-[11px]">
                      {new Date(incident.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Expanded Field Controls */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 space-y-3.5 text-xs animate-in fade-in">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                        AI Root Cause & Incident Details
                      </div>
                      <p className="mt-1 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                        {incident.summary}
                      </p>
                      {incident.rootCauseHypothesis && (
                        <div className="mt-1.5 p-2 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 text-[11px]">
                          <strong>AI Hypothesis:</strong> {incident.rootCauseHypothesis}
                        </div>
                      )}
                    </div>

                    {/* Field Remediation Action Buttons */}
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                        Field Actions
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {incident.status === IncidentStatus.REPORTED && (
                          <Button
                            size="sm"
                            variant="secondary"
                            isLoading={isUpdating}
                            onClick={() =>
                              handleAction(
                                incident.id,
                                IncidentStatus.ASSIGNED,
                                `Technician ${currentSession.name} acknowledged dispatch on mobile`
                              )
                            }
                            className="rounded-xl text-xs py-2"
                          >
                            Acknowledge
                          </Button>
                        )}

                        {incident.status !== IncidentStatus.INVESTIGATING && (
                          <Button
                            size="sm"
                            variant="outline"
                            isLoading={isUpdating}
                            onClick={() =>
                              handleAction(
                                incident.id,
                                IncidentStatus.INVESTIGATING,
                                `Technician ${currentSession.name} is on-site investigating`
                              )
                            }
                            className="rounded-xl text-xs py-2"
                          >
                            Mark In Progress
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="primary"
                          isLoading={isUpdating}
                          onClick={() =>
                            handleAction(
                              incident.id,
                              IncidentStatus.RESOLVED,
                              'Automated remediation triggered from mobile terminal (radio channel reset / QoS re-balance).',
                              true
                            )
                          }
                          className="rounded-xl text-xs py-2 col-span-2 shadow-xs bg-indigo-600 hover:bg-indigo-500"
                          icon={<Wrench className="w-3.5 h-3.5" />}
                        >
                          Apply Auto-Remediation & Resolve
                        </Button>
                      </div>
                    </div>

                    {/* Optional Note & Direct Resolve */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                      <input
                        type="text"
                        value={fieldNote}
                        onChange={(e) => setFieldNote(e.target.value)}
                        placeholder="Add field resolution note..."
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        isLoading={isUpdating}
                        onClick={() =>
                          handleAction(
                            incident.id,
                            IncidentStatus.RESOLVED,
                            fieldNote || 'Hardware inspection complete. Issue resolved.'
                          )
                        }
                        className="w-full rounded-xl text-xs bg-emerald-600 hover:bg-emerald-500"
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Mark Resolved
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
