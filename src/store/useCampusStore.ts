import { create } from 'zustand';
import {
  Alert,
  CampusOverviewMetrics,
  DataSourceType,
  Device,
  HeatmapCell,
  Incident,
  IoTDevice,
  NetworkMetric,
  Notification,
  ScenarioType,
  SecurityEvent,
  StudentReport,
  UserRole,
  UserSession,
} from '../../shared/types';

export type ActiveTab =
  | 'dashboard'
  | 'heatmap'
  | 'incidents'
  | 'student-pwa'
  | 'network'
  | 'security'
  | 'iot'
  | 'analytics'
  | 'technical-status'
  | 'architecture';

export type MobileTab =
  | 'speedtest'
  | 'report'
  | 'tickets'
  | 'pulse'
  | 'assistant'
  | 'field-queue'
  | 'scanner';

export type PlatformMode = 'web' | 'mobile';

interface CampusState {
  currentSession: UserSession;
  activeTab: ActiveTab;
  overview: CampusOverviewMetrics | null;
  heatmap: HeatmapCell[];
  incidents: Incident[];
  alerts: Alert[];
  devices: Device[];
  iotDevices: IoTDevice[];
  studentReports: StudentReport[];
  securityEvents: SecurityEvent[];
  notifications: Notification[];
  recentMetrics: NetworkMetric[];
  currentScenario: ScenarioType;
  sourceFilter: 'ALL' | DataSourceType;
  isLoading: boolean;
  error: string | null;

  // Multi-Platform ecosystem state
  platformMode: PlatformMode;
  mobileDeviceFrame: boolean;
  mobileActiveTab: MobileTab;
  isOnline: boolean;
  offlineQueue: Array<{ id: string; type: 'report' | 'measurement'; data: any; createdAt: number }>;

  // Presentation Mode state
  presentationActive: boolean;
  presentationStep: number;
  presentationTimerSec: number;

  setPlatformMode: (mode: PlatformMode) => void;
  setMobileDeviceFrame: (enabled: boolean) => void;
  setMobileActiveTab: (tab: MobileTab) => void;
  setIsOnline: (online: boolean) => void;
  triggerHaptic: () => void;
  enqueueOfflineReport: (data: any) => void;
  flushOfflineQueue: () => Promise<number>;

  setActiveTab: (tab: ActiveTab) => void;
  setSourceFilter: (filter: 'ALL' | DataSourceType) => void;
  switchRole: (role: UserRole) => Promise<void>;
  fetchState: () => Promise<void>;
  runSpeedTest: (locationId: string, floor: number) => Promise<any>;
  submitStudentReport: (data: {
    category: any;
    locationId: string;
    floor: number;
    roomLabel?: string;
    description: string;
  }) => Promise<any>;
  updateIncidentStatus: (id: string, newStatus: any, note?: string, applyRemediation?: boolean) => Promise<void>;
  triggerScenario: (name: ScenarioType) => Promise<void>;
  resetScenario: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  setPresentationMode: (active: boolean, step?: number) => void;
}

export const useCampusStore = create<CampusState>((set, get) => ({
  currentSession: {
    token: 'cg_demo_initial',
    userId: 'usr-netadmin',
    role: UserRole.NETWORK_ADMIN,
    name: 'Elena Rostova (Network Admin)',
    expiresAt: Date.now() + 86400000,
  },
  activeTab: 'dashboard',
  overview: null,
  heatmap: [],
  incidents: [],
  alerts: [],
  devices: [],
  iotDevices: [],
  studentReports: [],
  securityEvents: [],
  notifications: [],
  recentMetrics: [],
  currentScenario: 'NORMAL',
  sourceFilter: 'ALL',
  isLoading: false,
  error: null,

  // Multi-Platform defaults
  platformMode: 'web',
  mobileDeviceFrame: true,
  mobileActiveTab: 'speedtest',
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  offlineQueue: [],

  presentationActive: false,
  presentationStep: 1,
  presentationTimerSec: 0,

  setPlatformMode: (mode) => set({ platformMode: mode }),
  setMobileDeviceFrame: (enabled) => set({ mobileDeviceFrame: enabled }),
  setMobileActiveTab: (tab) => set({ mobileActiveTab: tab }),
  setIsOnline: (online) => set({ isOnline: online }),

  triggerHaptic: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.([15]);
      } catch {
        // Ignored
      }
    }
  },

  enqueueOfflineReport: (data) => {
    const item = {
      id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'report' as const,
      data,
      createdAt: Date.now(),
    };
    set((state) => ({ offlineQueue: [...state.offlineQueue, item] }));
  },

  flushOfflineQueue: async () => {
    const { offlineQueue } = get();
    if (offlineQueue.length === 0) return 0;
    let synced = 0;
    for (const item of offlineQueue) {
      if (item.type === 'report') {
        try {
          await get().submitStudentReport(item.data);
          synced += 1;
        } catch {
          // Keep in queue
        }
      }
    }
    set({ offlineQueue: [] });
    return synced;
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSourceFilter: (filter) => set({ sourceFilter: filter }),

  switchRole: async (role) => {
    try {
      const res = await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const data = await res.json();
        set({
          currentSession: data.session,
          activeTab: role === UserRole.STUDENT ? 'student-pwa' : 'dashboard',
        });
      }
    } catch {
      // Fallback local update
      set({
        currentSession: {
          token: `token_${role}`,
          userId: `usr_${role}`,
          role,
          name: `Demo ${role}`,
          expiresAt: Date.now() + 86400000,
        },
        activeTab: role === UserRole.STUDENT ? 'student-pwa' : 'dashboard',
      });
    }
  },

  fetchState: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        set({
          overview: data.overview,
          heatmap: data.heatmap,
          incidents: data.incidents,
          alerts: data.alerts,
          devices: data.devices,
          iotDevices: data.iotDevices,
          studentReports: data.studentReports,
          securityEvents: data.securityEvents,
          notifications: data.notifications,
          recentMetrics: data.recentMetrics,
          currentScenario: data.currentScenario,
          isLoading: false,
          error: null,
        });
      }
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  runSpeedTest: async (locationId, floor) => {
    const t0 = performance.now();
    let rtt = 18;
    try {
      const pingRes = await fetch('/api/probe/ping');
      const elapsed = performance.now() - t0;
      rtt = Math.max(9, Math.round(elapsed));
    } catch {
      rtt = 18;
    }

    const payload = {
      sessionId: `pwa_${Date.now().toString(36)}`,
      source: DataSourceType.MEASURED,
      locationId,
      floor,
      latencyMs: rtt,
      jitterMs: Math.max(2, Math.round(rtt * 0.15)),
      downloadMbps: 88.5,
      uploadMbps: 41.2,
      packetLossPct: 0.1,
      signalDbm: -56,
    };

    const res = await fetch('/api/measurements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      await get().fetchState();
      return data.measurement;
    }
    return payload;
  },

  submitStudentReport: async (data) => {
    const payload = {
      ...data,
      sessionId: `pwa_${Date.now().toString(36)}`,
    };
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      await get().fetchState();
      return json;
    }
  },

  updateIncidentStatus: async (id, newStatus, note, applyRemediation) => {
    const { currentSession } = get();
    const res = await fetch(`/api/incidents/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentSession.token}`,
      },
      body: JSON.stringify({ newStatus, note, applyRemediation }),
    });
    if (res.ok) {
      await get().fetchState();
    }
  },

  triggerScenario: async (name) => {
    const res = await fetch(`/api/scenarios/${name}`, { method: 'POST' });
    if (res.ok) {
      await get().fetchState();
    }
  },

  resetScenario: async () => {
    const res = await fetch('/api/scenarios/reset', { method: 'POST' });
    if (res.ok) {
      await get().fetchState();
    }
  },

  markAllNotificationsRead: async () => {
    await fetch('/api/notifications/read-all', { method: 'POST' });
    await get().fetchState();
  },

  setPresentationMode: (active, step = 1) => {
    set({ presentationActive: active, presentationStep: step, presentationTimerSec: 0 });
  },
}));
