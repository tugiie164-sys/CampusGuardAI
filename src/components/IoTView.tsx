import React from 'react';
import { Cpu, RefreshCw, Radio, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useCampusStore } from '../store/useCampusStore';
import { DeviceStatus, IoTDeviceCategory } from '../../shared/types';

export const IoTView: React.FC = () => {
  const { iotDevices, triggerScenario } = useCampusStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs text-slate-500">
            Smart Classrooms, Environmental Cleanrooms & ESP32 Probes
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
            IoT & Smart Campus Telemetry Fleet
          </h1>
        </div>

        <button
          onClick={() => triggerScenario('IOT_SENSOR_FAILURE')}
          className="px-3.5 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:opacity-90 cursor-pointer"
        >
          Inject IoT Sensor Failure (Simulated)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {iotDevices.map((d) => {
          const isOnline = d.status === DeviceStatus.ONLINE;
          return (
            <div key={d.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-500">{d.category} · {d.source}</div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">{d.name}</h3>
                  <div className="text-xs text-slate-400">{d.locationId} F{d.floor} · {d.room}</div>
                </div>
                <span className={`text-xs font-semibold font-mono ${isOnline ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {d.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <div>
                  <span className="text-slate-500 block font-sans">IP Address</span>
                  {d.ipAddress}
                </div>
                <div>
                  <span className="text-slate-500 block font-sans">Temperature</span>
                  {d.temperatureC ? `${d.temperatureC}°C` : 'N/A'}
                </div>
                <div>
                  <span className="text-slate-500 block font-sans">Telemetry</span>
                  {d.co2Ppm ? `${d.co2Ppm} ppm CO2` : d.powerKw ? `${d.powerKw} kW` : 'Nominal'}
                </div>
                <div>
                  <span className="text-slate-500 block font-sans">Battery/Uptime</span>
                  {d.batteryPct ? `${d.batteryPct}%` : 'Mains Power'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
