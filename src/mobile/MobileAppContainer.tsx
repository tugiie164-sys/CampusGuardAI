import React from 'react';
import {
  Smartphone,
  Maximize2,
  Minimize2,
  Monitor,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useCampusStore } from '../store/useCampusStore';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileSpeedTestView } from './views/MobileSpeedTestView';
import { MobileReportView } from './views/MobileReportView';
import { MobileTicketsView } from './views/MobileTicketsView';
import { MobileCampusPulseView } from './views/MobileCampusPulseView';
import { MobileAssistantView } from './views/MobileAssistantView';
import { MobileFieldQueueView } from './views/MobileFieldQueueView';
import { MobileEquipmentScannerView } from './views/MobileEquipmentScannerView';
import { UserRole } from '../../shared/types';
import { Button } from '../design-system/Button';

export const MobileAppContainer: React.FC = () => {
  const {
    mobileActiveTab,
    mobileDeviceFrame,
    setMobileDeviceFrame,
    setPlatformMode,
    currentSession,
    triggerHaptic,
  } = useCampusStore();

  const renderActiveTabContent = () => {
    switch (mobileActiveTab) {
      case 'speedtest':
        return <MobileSpeedTestView />;
      case 'report':
        return <MobileReportView />;
      case 'tickets':
        return <MobileTicketsView />;
      case 'pulse':
        return <MobileCampusPulseView />;
      case 'assistant':
        return <MobileAssistantView />;
      case 'field-queue':
        return <MobileFieldQueueView />;
      case 'scanner':
        return <MobileEquipmentScannerView />;
      default:
        return <MobileSpeedTestView />;
    }
  };

  // If frame is disabled or on mobile screens, render full viewport
  if (!mobileDeviceFrame) {
    return (
      <div className="min-h-screen max-w-md mx-auto flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-2xl relative">
        {/* Floating return to NOC header button */}
        <div className="bg-slate-900 text-white text-xs px-3 py-1.5 flex items-center justify-between">
          <span className="font-medium text-[11px]">CampusGuard Mobile App (Full Screen)</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic();
                setMobileDeviceFrame(true);
              }}
              className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Smartphone className="w-3 h-3" /> iPhone Frame
            </button>
            <button
              onClick={() => {
                triggerHaptic();
                setPlatformMode('web');
              }}
              className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Monitor className="w-3 h-3" /> Web NOC
            </button>
          </div>
        </div>

        <MobileHeader />
        <main className="flex-1 p-3.5 overflow-y-auto">{renderActiveTabContent()}</main>
        <MobileBottomNav />
      </div>
    );
  }

  // Otherwise, render within the authentic iPhone 16 Pro simulator frame
  return (
    <div className="w-full flex flex-col items-center justify-center py-6 px-4">
      {/* Simulator Control Toolbar */}
      <div className="mb-4 flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
          <Smartphone className="w-4 h-4 text-blue-600" />
          <span>iPhone 16 Pro Simulator</span>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

        <button
          onClick={() => {
            triggerHaptic();
            setMobileDeviceFrame(false);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Expand to edge-to-edge full width"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Full Width</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic();
            setPlatformMode('web');
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Return to NOC Console</span>
        </button>
      </div>

      {/* iPhone 16 Pro Physical Chassis */}
      <div className="relative w-[390px] h-[830px] bg-slate-900 dark:bg-black rounded-[52px] p-3 shadow-2xl border-[6px] border-slate-400 dark:border-slate-700 select-none flex flex-col ring-1 ring-slate-900/10">
        {/* Hardware side buttons (simulated) */}
        <div className="absolute -left-2.5 top-28 w-1 h-12 bg-slate-400 dark:bg-slate-600 rounded-l-md" />
        <div className="absolute -left-2.5 top-44 w-1 h-12 bg-slate-400 dark:bg-slate-600 rounded-l-md" />
        <div className="absolute -right-2.5 top-36 w-1 h-16 bg-slate-400 dark:bg-slate-600 rounded-r-md" />

        {/* Inner OLED Display Container */}
        <div className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[44px] overflow-hidden flex flex-col relative border border-slate-950/40 dark:border-slate-900 shadow-inner">
          {/* Top Dynamic Island Notch */}
          <div className="absolute top-2.5 inset-x-0 flex justify-center z-50 pointer-events-none">
            <div className="w-28 h-6 bg-black rounded-full flex items-center justify-between px-3 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500/80 animate-pulse" />
            </div>
          </div>

          {/* Mobile Header (Includes iOS status bar) */}
          <MobileHeader />

          {/* Screen Content Viewport */}
          <main className="flex-1 p-3.5 overflow-y-auto overscroll-contain">
            {renderActiveTabContent()}
          </main>

          {/* Bottom iOS Navigation Bar */}
          <MobileBottomNav />
        </div>
      </div>
    </div>
  );
};
