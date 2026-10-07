import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  User,
  MapPin,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useCampusStore } from '../../store/useCampusStore';
import { IncidentStatus } from '../../../shared/types';
import { Badge } from '../../design-system/Badge';
import { Button } from '../../design-system/Button';

export const MobileTicketsView: React.FC = () => {
  const { studentReports, incidents, fetchState, triggerHaptic, setMobileActiveTab } =
    useCampusStore();

  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const filteredReports = studentReports.filter((report) => {
    if (filter === 'active') {
      return (
        report.status === IncidentStatus.REPORTED ||
        report.status === IncidentStatus.ASSIGNED ||
        report.status === IncidentStatus.INVESTIGATING
      );
    }
    if (filter === 'resolved') {
      return report.status === IncidentStatus.RESOLVED || report.status === IncidentStatus.CLOSED;
    }
    return true;
  });

  const getTimelineSteps = (status: IncidentStatus) => {
    const steps = [
      { id: IncidentStatus.REPORTED, label: 'Reported' },
      { id: IncidentStatus.ASSIGNED, label: 'Assigned' },
      { id: IncidentStatus.INVESTIGATING, label: 'In Progress' },
      { id: IncidentStatus.RESOLVED, label: 'Resolved' },
    ];

    const order = [
      IncidentStatus.REPORTED,
      IncidentStatus.ASSIGNED,
      IncidentStatus.INVESTIGATING,
      IncidentStatus.RESOLVED,
      IncidentStatus.CLOSED,
    ];

    const currentIndex = order.indexOf(status);

    return steps.map((step, idx) => ({
      ...step,
      completed: currentIndex >= idx,
      current: currentIndex === idx,
    }));
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header & Filter */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">My Support Tickets</h2>
          <p className="text-xs text-slate-500">Live SLA status & technician notes</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
          {(['all', 'active', 'resolved'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                triggerHaptic();
                setFilter(mode);
              }}
              className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                filter === mode
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket List */}
      {filteredReports.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No tickets found in this view
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Experience slow or dropped Wi-Fi? Submit a 30-second report.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              triggerHaptic();
              setMobileActiveTab('report');
            }}
            className="rounded-xl"
          >
            Report Wi-Fi Issue
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const isExpanded = selectedTicketId === report.id;
            const timeline = getTimelineSteps(report.status);

            // Find correlated incident if available
            const correlatedIncident = report.linkedIncidentId
              ? incidents.find((inc) => inc.id === report.linkedIncidentId)
              : null;

            return (
              <div
                key={report.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs transition-all"
              >
                {/* Header Row */}
                <div
                  onClick={() => {
                    triggerHaptic();
                    setSelectedTicketId(isExpanded ? null : report.id);
                  }}
                  className="p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge status={report.status} size="xs" />
                        <span className="text-[11px] font-mono text-slate-400">
                          {report.incidentNumber || `TKT-${report.id.slice(-6).toUpperCase()}`}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {report.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="font-mono text-[11px]">
                        {new Date(report.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-90 text-blue-600' : ''
                        }`}
                      />
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span>
                        {report.locationId} F{report.floor}
                        {report.roomLabel ? ` · ${report.roomLabel}` : ''}
                      </span>
                    </span>
                  </div>

                  {/* Visual Step Timeline */}
                  <div className="mt-3 grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    {timeline.map((step) => (
                      <div key={step.id} className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            step.completed
                              ? 'bg-blue-600'
                              : 'bg-slate-100 dark:bg-slate-800'
                          }`}
                        />
                        <div
                          className={`text-[9px] font-medium truncate ${
                            step.current
                              ? 'text-blue-600 font-bold'
                              : step.completed
                              ? 'text-slate-700 dark:text-slate-300'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs animate-in fade-in">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                        Reported Details
                      </div>
                      <p className="mt-1 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                        {report.description}
                      </p>
                    </div>

                    {correlatedIncident && (
                      <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-1.5">
                        <div className="flex items-center justify-between text-blue-900 dark:text-blue-300 font-semibold text-[11px]">
                          <span>Correlated Incident: #{correlatedIncident.incidentNumber}</span>
                          <span className="font-mono text-[10px]">
                            Priority: {correlatedIncident.priority}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300">
                          {correlatedIncident.title}
                        </div>
                        {correlatedIncident.rootCauseHypothesis && (
                          <div className="text-[10px] text-blue-700 dark:text-blue-400 italic">
                            AI Engine: {correlatedIncident.rootCauseHypothesis}
                          </div>
                        )}
                        {correlatedIncident.assignedTo && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1">
                            <User className="w-3 h-3" /> Assigned Field Tech:{' '}
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {correlatedIncident.assignedTo}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Submitted via CampusGuard Mobile</span>
                      <span className="font-mono">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
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
