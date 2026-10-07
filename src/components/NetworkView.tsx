import React, { useState } from 'react';
import { Network, Server, Shield, Radio, Search, Filter } from 'lucide-react';
import { useCampusStore } from '../store/useCampusStore';
import { CAMPUS_LOCATIONS } from '../../shared/locations';
import { DeviceCategory, DeviceStatus } from '../../shared/types';

export const NetworkView: React.FC = () => {
  const { devices } = useCampusStore();
  const [filterLoc, setFilterLoc] = useState('ALL');
  const [filterCat, setFilterCat] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = devices.filter((d) => {
    if (filterLoc !== 'ALL' && d.locationId !== filterLoc) return false;
    if (filterCat !== 'ALL' && d.category !== filterCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return d.name.toLowerCase().includes(q) || d.ipAddress.toLowerCase().includes(q) || d.room.toLowerCase().includes(q);
    }
    return true;
  });

  const coreRouter = devices.find((d) => d.category === DeviceCategory.ROUTER);
  const switches = devices.filter((d) => d.category === DeviceCategory.SWITCH);
  const aps = devices.filter((d) => d.category === DeviceCategory.ACCESS_POINT);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="text-xs text-slate-500">Hierarchical Campus Topology & Inventory</div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
          Network Topology & Device Fleet
        </h1>
      </div>

      {/* 3-Tier Campus Topology Preview */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          3-Tier Campus Architecture (Core → Distribution → Access)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Core */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500">Tier 1 · Core Router</div>
            {coreRouter && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>{coreRouter.name}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">{coreRouter.status}</span>
                </div>
                <div className="text-xs font-mono text-slate-500">{coreRouter.ipAddress} · {coreRouter.locationId}</div>
                <div className="text-xs font-mono text-slate-700 dark:text-slate-300 pt-1">
                  CPU {coreRouter.cpuPct}% · {coreRouter.bandwidthMbps} Mbps · {coreRouter.connectedClients} clients
                </div>
              </div>
            )}
          </div>

          {/* Distribution */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500">Tier 2 · Building Distribution Switches</div>
            <div className="space-y-2">
              {switches.map((sw) => (
                <div key={sw.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{sw.name}</div>
                    <div className="text-[11px] font-mono text-slate-500">{sw.locationId} · {sw.ipAddress}</div>
                  </div>
                  <span className="font-mono text-emerald-600 font-semibold">{sw.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Access */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500">Tier 3 · Wi-Fi 6 Access Points</div>
            <div className="space-y-2">
              {aps.slice(0, 3).map((ap) => {
                const isOnline = ap.status === DeviceStatus.ONLINE;
                return (
                  <div key={ap.id} className={`rounded-xl border p-3 flex items-center justify-between text-xs ${isOnline ? 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40' : 'border-rose-300 bg-rose-50/80 dark:bg-rose-950/30'}`}>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{ap.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{ap.locationId} F{ap.floor}</div>
                    </div>
                    <span className={`font-mono font-semibold ${isOnline ? 'text-emerald-600' : 'text-rose-600'}`}>{ap.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filterable Device Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search host or IP..."
            className="pl-3 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
          />

          <select
            value={filterLoc}
            onChange={(e) => setFilterLoc(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Complexes</option>
            {CAMPUS_LOCATIONS.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Categories</option>
            <option value={DeviceCategory.ROUTER}>Routers</option>
            <option value={DeviceCategory.SWITCH}>Switches</option>
            <option value={DeviceCategory.ACCESS_POINT}>Access Points</option>
            <option value={DeviceCategory.WORKSTATION}>Workstations</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-2.5 font-medium">Device Name</th>
                <th className="py-2.5 font-medium">Category · Source</th>
                <th className="py-2.5 font-medium">Location</th>
                <th className="py-2.5 font-medium">IP Address</th>
                <th className="py-2.5 font-medium">Status</th>
                <th className="py-2.5 font-medium text-right">Clients</th>
                <th className="py-2.5 font-medium text-right">Bandwidth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-mono tabular-nums">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-sans font-semibold text-slate-900 dark:text-white">{d.name}</td>
                  <td className="py-3 font-sans text-slate-600 dark:text-slate-300">{d.category} · {d.source}</td>
                  <td className="py-3 font-sans text-slate-600 dark:text-slate-300">{d.locationId} F{d.floor}</td>
                  <td className="py-3 text-slate-500">{d.ipAddress}</td>
                  <td className="py-3 font-sans">
                    <span className={`font-semibold ${d.status === DeviceStatus.ONLINE ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">{d.connectedClients}</td>
                  <td className="py-3 text-right">{d.bandwidthMbps} Mbps</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
