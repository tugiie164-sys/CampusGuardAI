import React, { useState } from 'react';
import {
  QrCode,
  ScanLine,
  Wifi,
  Server,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { useCampusStore } from '../../store/useCampusStore';
import { DeviceStatus } from '../../../shared/types';
import { Badge } from '../../design-system/Badge';
import { Button } from '../../design-system/Button';

interface ScannedDevice {
  tagId: string;
  name: string;
  type: 'Access Point' | 'Switch' | 'IoT Sensor';
  location: string;
  status: DeviceStatus;
  ip: string;
  mac: string;
  clients: number;
  channel: number;
  uptime: string;
  firmware: string;
}

const SAMPLE_TAGS: ScannedDevice[] = [
  {
    tagId: 'AP-BLK-C-02',
    name: 'Block C 2nd Floor AP #2',
    type: 'Access Point',
    location: 'Block C, Floor 2 (Ceiling Mount C204)',
    status: DeviceStatus.DEGRADED,
    ip: '10.20.12.44',
    mac: '74:83:C2:59:E1:92',
    clients: 42,
    channel: 6,
    uptime: '14d 6h 12m',
    firmware: 'v5.8.2-campus',
  },
  {
    tagId: 'SW-BLK-C-01',
    name: 'Block C Distribution Switch',
    type: 'Switch',
    location: 'Block C IDF Closet Room C101',
    status: DeviceStatus.ONLINE,
    ip: '10.20.10.1',
    mac: '28:6F:7F:41:09:A3',
    clients: 128,
    channel: 0,
    uptime: '89d 14h 02m',
    firmware: 'v16.12.04',
  },
  {
    tagId: 'IOT-ENV-C204',
    name: 'Lab C204 Environment Probe',
    type: 'IoT Sensor',
    location: 'ICT Lab 4 (C204)',
    status: DeviceStatus.ONLINE,
    ip: '10.20.40.88',
    mac: 'A4:C1:38:12:F0:2B',
    clients: 0,
    channel: 1,
    uptime: '31d 2h 45m',
    firmware: 'v2.1.0-esp32',
  },
];

export const MobileEquipmentScannerView: React.FC = () => {
  const { triggerHaptic } = useCampusStore();
  const [activeDevice, setActiveDevice] = useState<ScannedDevice | null>(SAMPLE_TAGS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleScanSample = (device: ScannedDevice) => {
    triggerHaptic();
    setIsScanning(true);
    setActionMessage(null);
    setTimeout(() => {
      setActiveDevice(device);
      setIsScanning(false);
      triggerHaptic();
    }, 600);
  };

  const handleReboot = () => {
    triggerHaptic();
    setActionMessage('Hardware diagnostic command dispatched: Radio reset triggered. Reloading in 30s.');
  };

  const handleChannelHop = () => {
    triggerHaptic();
    setActionMessage('Channel optimization command dispatched: Switched to 5GHz Channel 36 (Clean).');
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Equipment QR Scanner
          </h2>
          <p className="text-xs text-slate-500">Fast field hardware inspection & control</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold">
          NFC / QR / Barcode
        </span>
      </div>

      {/* Simulated Camera Viewfinder */}
      <div className="relative w-full h-44 rounded-3xl bg-slate-950 overflow-hidden border border-slate-800 flex flex-col items-center justify-center text-center p-4 shadow-md">
        {/* Viewfinder crosshairs */}
        <div className="w-36 h-36 border-2 border-dashed border-blue-500/70 rounded-2xl relative flex items-center justify-center animate-pulse">
          <ScanLine className="w-28 h-28 text-blue-400/40" />
        </div>

        <div className="absolute bottom-2 inset-x-0 text-center">
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
            {isScanning ? 'Decoding QR barcode payload...' : 'Align device asset QR tag in view'}
          </span>
        </div>
      </div>

      {/* Sample QR Tags to tap */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-slate-400 px-1">
          Tap Equipment Tag to Scan:
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {SAMPLE_TAGS.map((tag) => (
            <button
              key={tag.tagId}
              onClick={() => handleScanSample(tag)}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                activeDevice?.tagId === tag.tagId
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <div className="text-[11px] font-mono font-bold truncate">{tag.tagId}</div>
              <div className="text-[9px] text-slate-400 truncate">{tag.type}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Scanned Equipment Telemetry Card */}
      {activeDevice && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-4 space-y-3.5 shadow-xs animate-in fade-in">
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeDevice.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    activeDevice.status === DeviceStatus.ONLINE
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                  }`}
                >
                  {activeDevice.status}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{activeDevice.location}</div>
            </div>
            <div className="text-xs font-mono font-bold text-slate-400">
              Tag: {activeDevice.tagId}
            </div>
          </div>

          {/* Diagnostic specs grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-sans">IP Address</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {activeDevice.ip}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-sans">MAC Address</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                {activeDevice.mac}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-sans">Connected Clients</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {activeDevice.clients} active
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-sans">Uptime</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {activeDevice.uptime}
              </span>
            </div>
          </div>

          {/* Feedback Banner */}
          {actionMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionMessage}</span>
            </div>
          )}

          {/* Rapid Field Diagnostics Actions */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Quick Field Actions
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleReboot}
                className="rounded-xl text-xs"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Reboot Radio
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleChannelHop}
                className="rounded-xl text-xs"
                icon={<Sliders className="w-3.5 h-3.5" />}
              >
                Optimize Channel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
