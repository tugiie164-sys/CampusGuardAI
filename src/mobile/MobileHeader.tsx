import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Battery,
  Radio,
  RefreshCw,
  CloudOff,
  CheckCircle2,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { useCampusStore } from '../store/useCampusStore';
import { UserRole } from '../../shared/types';
import { Badge } from '../design-system/Badge';

export const MobileHeader: React.FC = () => {
  const {
    currentSession,
    switchRole,
    offlineQueue,
    flushOfflineQueue,
    fetchState,
    isLoading,
    isOnline,
  } = useCampusStore();

  const [currentTime, setCurrentTime] = useState('9:41');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await flushOfflineQueue();
    await fetchState();
    setIsSyncing(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 select-none">
      {/* 1. iOS Status Bar */}
      <div className="px-5 pt-2 pb-1 flex items-center justify-between text-[13px] font-semibold tracking-tight text-slate-800 dark:text-slate-200">
        <span className="font-mono">{currentTime}</span>

        {/* Dynamic Island Pill / Status Pill */}
        <div className="px-2.5 py-0.5 rounded-full bg-slate-950 text-white dark:bg-slate-800 text-[10px] font-medium flex items-center gap-1.5 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-wide font-mono">Observatory Live</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* 2. CampusGuard Mobile App Header Bar */}
      <div className="px-4 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                CampusGuard
              </span>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded-md">
                MOBILE
              </span>
            </div>
            <div className="text-[10px] text-slate-400 -mt-0.5">Campus Observatory</div>
          </div>
        </div>

        {/* Badges & Actions */}
        <div className="flex items-center gap-2">
          {/* SIMULATION MODE badge */}
          <div className="hidden xs:flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[9px] font-mono font-bold">
            <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
            <span>SIMULATION</span>
          </div>

          {/* Offline Queue Sync Indicator */}
          {offlineQueue.length > 0 && (
            <button
              onClick={handleManualSync}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-[10px] font-medium"
              title="Click to sync offline reports"
            >
              <CloudOff className="w-3 h-3" />
              <span>{offlineQueue.length} queued</span>
            </button>
          )}

          {/* Quick Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <span className="truncate max-w-[90px]">
                {currentSession.role === UserRole.STUDENT
                  ? 'Student'
                  : currentSession.role === UserRole.ICT_TECHNICIAN
                  ? 'Technician'
                  : 'Admin'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-1.5 w-48 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 text-xs space-y-0.5">
                <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Mobile Role
                </div>
                <button
                  onClick={() => {
                    switchRole(UserRole.STUDENT);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                    currentSession.role === UserRole.STUDENT
                      ? 'bg-blue-600 text-white font-medium'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>Student View</span>
                  {currentSession.role === UserRole.STUDENT && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    switchRole(UserRole.ICT_TECHNICIAN);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                    currentSession.role === UserRole.ICT_TECHNICIAN
                      ? 'bg-blue-600 text-white font-medium'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>Field Technician</span>
                  {currentSession.role === UserRole.ICT_TECHNICIAN && (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => {
                    switchRole(UserRole.NETWORK_ADMIN);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                    currentSession.role === UserRole.NETWORK_ADMIN
                      ? 'bg-blue-600 text-white font-medium'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>Network Admin</span>
                  {currentSession.role === UserRole.NETWORK_ADMIN && (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Sync status button */}
          <button
            onClick={handleManualSync}
            disabled={isSyncing || isLoading}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh state"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isSyncing || isLoading ? 'animate-spin text-blue-600' : ''}`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
