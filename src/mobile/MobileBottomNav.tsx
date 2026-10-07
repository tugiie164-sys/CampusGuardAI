import React from 'react';
import {
  Gauge,
  PlusCircle,
  Clock,
  Radio,
  Sparkles,
  ClipboardList,
  QrCode,
  Bell,
  Activity,
} from 'lucide-react';
import { useCampusStore, MobileTab } from '../store/useCampusStore';
import { UserRole } from '../../shared/types';

export const MobileBottomNav: React.FC = () => {
  const {
    currentSession,
    mobileActiveTab,
    setMobileActiveTab,
    studentReports,
    incidents,
    triggerHaptic,
  } = useCampusStore();

  const isStudent = currentSession.role === UserRole.STUDENT;

  // Badge counts
  const pendingReportsCount = studentReports.filter(
    (r) => r.status === 'REPORTED' || r.status === 'ASSIGNED' || r.status === 'INVESTIGATING'
  ).length;

  const openIncidentsCount = incidents.filter(
    (i) => i.status === 'REPORTED' || i.status === 'ASSIGNED' || i.status === 'INVESTIGATING'
  ).length;

  const studentTabs: Array<{ id: MobileTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }> = [
    { id: 'speedtest', label: 'Speed Test', icon: Gauge },
    { id: 'report', label: 'Report', icon: PlusCircle },
    { id: 'tickets', label: 'My Tickets', icon: Clock, badge: pendingReportsCount },
    { id: 'pulse', label: 'Campus Pulse', icon: Radio },
    { id: 'assistant', label: 'AI Support', icon: Sparkles },
  ];

  const technicianTabs: Array<{ id: MobileTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }> = [
    { id: 'field-queue', label: 'Field Queue', icon: ClipboardList, badge: openIncidentsCount },
    { id: 'speedtest', label: 'Roaming Probe', icon: Activity },
    { id: 'scanner', label: 'QR Scanner', icon: QrCode },
    { id: 'pulse', label: 'Campus Pulse', icon: Radio },
    { id: 'assistant', label: 'Diagnostics', icon: Sparkles },
  ];

  const tabs = isStudent ? studentTabs : technicianTabs;

  const handleTabClick = (tabId: MobileTab) => {
    triggerHaptic();
    setMobileActiveTab(tabId);
  };

  return (
    <nav className="sticky bottom-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 py-1.5 px-2 select-none">
      <div className="grid grid-cols-5 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = mobileActiveTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`} />
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold font-mono flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full font-medium">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
      {/* iOS Home Indicator bar space */}
      <div className="h-1 flex justify-center mt-1">
        <div className="w-24 h-1 rounded-full bg-slate-300 dark:bg-slate-700 opacity-60" />
      </div>
    </nav>
  );
};
