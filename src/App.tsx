import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  Cpu,
  Layers,
  Lock,
  Moon,
  Network,
  Radio,
  Search,
  Settings,
  Shield,
  Smartphone,
  Sun,
  CheckCircle2,
  AlertTriangle,
  Monitor,
} from 'lucide-react';

import { useCampusStore, ActiveTab } from './store/useCampusStore';
import { UserRole } from '../shared/types';
import { PresentationDirector } from './components/PresentationDirector';
import { DashboardView } from './components/DashboardView';
import { HeatmapView } from './components/HeatmapView';
import { IncidentsView } from './components/IncidentsView';
import { StudentPWAView } from './components/StudentPWAView';
import { NetworkView } from './components/NetworkView';
import { SecurityView } from './components/SecurityView';
import { IoTView } from './components/IoTView';
import { AnalyticsView } from './components/AnalyticsView';
import { TechnicalStatusView } from './components/TechnicalStatusView';
import { ArchitectureView } from './components/ArchitectureView';
import { MobileAppContainer } from './mobile/MobileAppContainer';

const NAV_ITEMS: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'NOC Dashboard', icon: Activity },
  { id: 'heatmap', label: 'Wi-Fi Heatmap', icon: Radio },
  { id: 'incidents', label: 'Incident Workflow', icon: AlertCircle },
  { id: 'student-pwa', label: 'Student PWA & Probe', icon: Smartphone },
  { id: 'network', label: 'Network & Topology', icon: Network },
  { id: 'security', label: 'Security Operations', icon: Shield },
  { id: 'iot', label: 'IoT & Telemetry', icon: Cpu },
  { id: 'analytics', label: 'Analytics & SLA', icon: BarChart3 },
  { id: 'technical-status', label: 'Technical Status', icon: CheckCircle2 },
  { id: 'architecture', label: 'Architecture', icon: Layers },
];

export function App() {
  const {
    currentSession,
    switchRole,
    activeTab,
    setActiveTab,
    fetchState,
    notifications,
    markAllNotificationsRead,
    platformMode,
    setPlatformMode,
    triggerHaptic,
  } = useCampusStore();

  const [darkMode, setDarkMode] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    fetchState();

    // SSE connection for real-time updates
    const es = new EventSource('/api/stream');
    es.onmessage = () => {
      fetchState();
    };

    return () => es.close();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* 1. Guided 3-Minute Presentation Sequence Bar (when active) */}
      <PresentationDirector />

      {/* 2. Top Navigation Bar — Strict 3-Zone Contract with Multi-Platform Switcher */}
      <header className="sticky top-0 z-30 h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark & Platform Mode Selector */}
        <div className="flex items-center gap-3">
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              setPlatformMode('web');
              setActiveTab('dashboard');
            }}
            className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
          >
            CampusGuard AI
          </a>

          {/* Persistent SIMULATION MODE Badge (Honesty Rule) */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>SIMULATION MODE</span>
          </div>

          {/* Platform Ecosystem Switcher: Web Console vs Dedicated Mobile App */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <button
              onClick={() => {
                triggerHaptic();
                setPlatformMode('web');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                platformMode === 'web'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Web NOC</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic();
                setPlatformMode('mobile');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                platformMode === 'mobile'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile App</span>
              <span className="text-[9px] font-mono bg-blue-500/30 text-blue-200 px-1 rounded">iOS/PWA</span>
            </button>
          </div>
        </div>

        {/* Zone 2: Navigation Links (When Web Mode is active) */}
        {platformMode === 'web' ? (
          <nav className="hidden xl:flex items-center gap-5 text-xs font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer ${
                activeTab === 'dashboard' ? 'text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-4' : ''
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer ${
                activeTab === 'heatmap' ? 'text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-4' : ''
              }`}
            >
              Heatmap
            </button>
            <button
              onClick={() => setActiveTab('incidents')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer ${
                activeTab === 'incidents' ? 'text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-4' : ''
              }`}
            >
              Incidents
            </button>
            <button
              onClick={() => setActiveTab('student-pwa')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer ${
                activeTab === 'student-pwa' ? 'text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-4' : ''
              }`}
            >
              Student PWA
            </button>
            <button
              onClick={() => setActiveTab('technical-status')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer ${
                activeTab === 'technical-status' ? 'text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-4' : ''
              }`}
            >
              Technical Status
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono">Shared API & Database Sync Active</span>
          </div>
        )}

        {/* Zone 3: Actions (Role Switcher, Mobile switch button on small screens, Notifications, Dark mode) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mobile switcher on small screens */}
          <button
            onClick={() => {
              triggerHaptic();
              setPlatformMode(platformMode === 'web' ? 'mobile' : 'web');
            }}
            className="sm:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            {platformMode === 'web' ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
          </button>

          {/* Demo Role Switcher */}
          <select
            value={currentSession.role}
            onChange={(e) => switchRole(e.target.value as UserRole)}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            <option value={UserRole.STUDENT}>Role: Student</option>
            <option value={UserRole.ICT_TECHNICIAN}>Role: ICT Technician</option>
            <option value={UserRole.NETWORK_ADMIN}>Role: Network Admin</option>
            <option value={UserRole.SYSTEM_ADMIN}>Role: System Admin</option>
          </select>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-blue-600 text-[10px] font-mono font-semibold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-4 z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    Notifications ({unreadCount} unread)
                  </span>
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {notifications.slice(0, 6).map((n) => (
                    <div key={n.id} className="py-2 space-y-0.5">
                      <div className="font-semibold text-slate-900 dark:text-white">{n.title}</div>
                      <div className="text-slate-500">{n.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 3. Main Workspace Container: Switchable between Web NOC & Mobile Experience */}
      {platformMode === 'mobile' ? (
        <div className="flex-1 bg-slate-100/70 dark:bg-slate-950 flex flex-col items-center justify-center min-h-[calc(100vh-56px)]">
          <MobileAppContainer />
        </div>
      ) : (
        <div className="flex-1 flex">
          {/* Desktop Sidebar (240px) */}
          <aside className="hidden lg:flex w-60 shrink-0 flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400">Observatory Navigation</div>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Dedicated Mobile Client Quick Launcher */}
              <div className="pt-3">
                <button
                  onClick={() => {
                    triggerHaptic();
                    setPlatformMode('mobile');
                  }}
                  className="w-full p-2.5 rounded-xl border border-blue-500/30 bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100/60 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span>Launch Mobile App</span>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-600 text-white px-1.5 py-0.5 rounded-md">
                    iOS / PWA
                  </span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500 space-y-1">
              <div className="font-semibold text-slate-900 dark:text-white">Active Session</div>
              <div className="truncate font-mono">{currentSession.name}</div>
              <div className="text-[10px] text-slate-400">Role: {currentSession.role}</div>
            </div>
          </aside>

          {/* Content Viewport */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto w-full">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'heatmap' && <HeatmapView />}
            {activeTab === 'incidents' && <IncidentsView />}
            {activeTab === 'student-pwa' && <StudentPWAView />}
            {activeTab === 'network' && <NetworkView />}
            {activeTab === 'security' && <SecurityView />}
            {activeTab === 'iot' && <IoTView />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'technical-status' && <TechnicalStatusView />}
            {activeTab === 'architecture' && <ArchitectureView />}
          </main>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (When in Web Mode on small screens) */}
      {platformMode === 'web' && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 items-center">
          {[NAV_ITEMS[0], NAV_ITEMS[1], NAV_ITEMS[3], NAV_ITEMS[2], NAV_ITEMS[8]].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center min-h-[44px] cursor-pointer ${
                  isActive ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] mt-0.5">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

export default App;
