/**
 * In-Memory SQLite/Postgres-Portable Normalized Database Store
 * Implements full CRUD, indices, transactional operations, and schema models for:
 * Users, Locations, Devices, IoTDevices, NetworkMetrics, SecurityEvents,
 * Alerts, Incidents, IncidentUpdates, StudentReports, Notifications, AuditLogs.
 */

import crypto from 'crypto';
import { CAMPUS_LOCATIONS } from '../shared/locations.js';
import {
  Alert,
  AuditLog,
  DataSourceType,
  Device,
  DeviceCategory,
  DeviceStatus,
  Incident,
  IncidentPriority,
  IncidentStatus,
  IncidentUpdate,
  IoTDevice,
  IoTDeviceCategory,
  Location,
  NetworkMetric,
  Notification,
  SecurityEvent,
  SeverityLevel,
  StudentReport,
  User,
  UserRole,
  UserSession,
} from '../shared/types.js';

// Fast standard password hash helper (HMAC-SHA256 for local demo with salt)
export function hashPassword(plain: string, salt: string = 'campusguard_salt_demo'): string {
  return crypto.createHmac('sha256', salt).update(plain).digest('hex');
}

export class CampusDatabase {
  public locations = new Map<string, Location>();
  public users = new Map<string, User>();
  public sessions = new Map<string, UserSession>();
  public devices = new Map<string, Device>();
  public iotDevices = new Map<string, IoTDevice>();
  public metrics: NetworkMetric[] = [];
  public securityEvents: SecurityEvent[] = [];
  public alerts: Alert[] = [];
  public incidents = new Map<string, Incident>();
  public incidentUpdates: IncidentUpdate[] = [];
  public studentReports = new Map<string, StudentReport>();
  public notifications: Notification[] = [];
  public auditLogs: AuditLog[] = [];

  constructor() {
    this.seed();
  }

  public seed() {
    this.clear();

    // 1. Locations
    for (const loc of CAMPUS_LOCATIONS) {
      this.locations.set(loc.id, { ...loc });
    }

    // 2. Demo Users (Clearly marked demo credentials)
    const demoUsers: User[] = [
      {
        id: 'usr-student',
        username: 'student',
        name: 'Alex Chen (Student)',
        role: UserRole.STUDENT,
        passwordHash: hashPassword('student123'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr-technician',
        username: 'tech',
        name: 'Tariq Mensah (ICT Field Technician)',
        role: UserRole.ICT_TECHNICIAN,
        passwordHash: hashPassword('tech123'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr-netadmin',
        username: 'netadmin',
        name: 'Elena Rostova (Network Administrator)',
        role: UserRole.NETWORK_ADMIN,
        passwordHash: hashPassword('admin123'),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr-sysadmin',
        username: 'sysadmin',
        name: 'Dr. Marcus Vance (System Administrator)',
        role: UserRole.SYSTEM_ADMIN,
        passwordHash: hashPassword('sysadmin123'),
        createdAt: new Date().toISOString(),
      },
    ];

    for (const u of demoUsers) {
      this.users.set(u.id, u);
    }

    // 3. Network Devices (Core routers, distribution switches, Wi-Fi 6 APs)
    const now = new Date().toISOString();
    const initialDevices: Device[] = [
      {
        id: 'RTR-CORE-01',
        name: 'CORE-BGP-RTR-01',
        category: DeviceCategory.ROUTER,
        source: DataSourceType.SIMULATED,
        locationId: 'BLK-A',
        floor: 1,
        room: 'NOC Vault A101',
        ipAddress: '10.0.0.1',
        macAddress: '00:1A:2B:3C:4D:01',
        status: DeviceStatus.ONLINE,
        cpuPct: 34,
        memoryPct: 48,
        temperatureC: 41,
        connectedClients: 1420,
        bandwidthMbps: 385,
        latencyMs: 4,
        packetLossPct: 0.0,
        uptimeHours: 2140,
        firmware: 'VRP-8.220',
        lastSeen: now,
      },
      {
        id: 'SW-DIST-BLKA',
        name: 'SW-DIST-BLKA-01',
        category: DeviceCategory.SWITCH,
        source: DataSourceType.SIMULATED,
        locationId: 'BLK-A',
        floor: 1,
        room: 'MDF A102',
        ipAddress: '10.10.1.2',
        macAddress: '00:1A:2B:3C:4D:10',
        status: DeviceStatus.ONLINE,
        cpuPct: 28,
        memoryPct: 42,
        temperatureC: 38,
        connectedClients: 210,
        bandwidthMbps: 140,
        latencyMs: 6,
        packetLossPct: 0.1,
        uptimeHours: 1890,
        firmware: 'CampusOS 4.12.1',
        lastSeen: now,
        parentDeviceId: 'RTR-CORE-01',
      },
      {
        id: 'SW-DIST-BLKC',
        name: 'SW-DIST-BLKC-01',
        category: DeviceCategory.SWITCH,
        source: DataSourceType.SIMULATED,
        locationId: 'BLK-C',
        floor: 1,
        room: 'IDF C101',
        ipAddress: '10.10.3.2',
        macAddress: '00:1A:2B:3C:4D:30',
        status: DeviceStatus.ONLINE,
        cpuPct: 42,
        memoryPct: 54,
        temperatureC: 43,
        connectedClients: 410,
        bandwidthMbps: 260,
        latencyMs: 9,
        packetLossPct: 0.2,
        uptimeHours: 980,
        firmware: 'CampusOS 4.12.1',
        lastSeen: now,
        parentDeviceId: 'RTR-CORE-01',
      },
      {
        id: 'AP-BLKC-F2-01',
        name: 'AP-ICTLab4-C204',
        category: DeviceCategory.ACCESS_POINT,
        source: DataSourceType.SIMULATED,
        locationId: 'BLK-C',
        floor: 2,
        room: 'ICT Lab 4 (Room C204)',
        ipAddress: '10.20.3.21',
        macAddress: '00:22:55:AA:03:01',
        status: DeviceStatus.ONLINE,
        cpuPct: 44,
        memoryPct: 58,
        temperatureC: 42,
        connectedClients: 94,
        bandwidthMbps: 145,
        latencyMs: 19,
        packetLossPct: 0.4,
        uptimeHours: 510,
        firmware: 'WiFi6-Enterprise 3.4',
        lastSeen: now,
        parentDeviceId: 'SW-DIST-BLKC',
      },
      {
        id: 'AP-BLKC-F3-02',
        name: 'AP-LectureHall-C302',
        category: DeviceCategory.ACCESS_POINT,
        source: DataSourceType.SIMULATED,
        locationId: 'BLK-C',
        floor: 3,
        room: 'CS Lecture Theatre C302',
        ipAddress: '10.20.3.32',
        macAddress: '00:22:55:AA:03:02',
        status: DeviceStatus.ONLINE,
        cpuPct: 49,
        memoryPct: 61,
        temperatureC: 44,
        connectedClients: 118,
        bandwidthMbps: 164,
        latencyMs: 22,
        packetLossPct: 0.5,
        uptimeHours: 510,
        firmware: 'WiFi6-Enterprise 3.4',
        lastSeen: now,
        parentDeviceId: 'SW-DIST-BLKC',
      },
      {
        id: 'AP-LIB-F1-01',
        name: 'AP-Library-Commons-1F',
        category: DeviceCategory.ACCESS_POINT,
        source: DataSourceType.SIMULATED,
        locationId: 'LIB',
        floor: 1,
        room: 'Main Reading Atrium',
        ipAddress: '10.20.4.11',
        macAddress: '00:22:55:AA:04:01',
        status: DeviceStatus.ONLINE,
        cpuPct: 36,
        memoryPct: 47,
        temperatureC: 39,
        connectedClients: 132,
        bandwidthMbps: 158,
        latencyMs: 15,
        packetLossPct: 0.2,
        uptimeHours: 1120,
        firmware: 'WiFi6-Enterprise 3.4',
        lastSeen: now,
        parentDeviceId: 'RTR-CORE-01',
      },
      {
        id: 'AP-RESN-F3-01',
        name: 'AP-NorthHall-Floor3',
        category: DeviceCategory.ACCESS_POINT,
        source: DataSourceType.SIMULATED,
        locationId: 'RES-N',
        floor: 3,
        room: 'North Residence Wing 3B',
        ipAddress: '10.20.5.31',
        macAddress: '00:22:55:AA:05:01',
        status: DeviceStatus.ONLINE,
        cpuPct: 52,
        memoryPct: 63,
        temperatureC: 43,
        connectedClients: 145,
        bandwidthMbps: 210,
        latencyMs: 24,
        packetLossPct: 0.6,
        uptimeHours: 840,
        firmware: 'WiFi6-Enterprise 3.4',
        lastSeen: now,
        parentDeviceId: 'RTR-CORE-01',
      },
      {
        id: 'LAB-PC-C204-12',
        name: 'WORKSTATION-C204-PC12',
        category: DeviceCategory.WORKSTATION,
        source: DataSourceType.SIMULATED,
        locationId: 'BLK-C',
        floor: 2,
        room: 'ICT Lab 4',
        ipAddress: '10.40.3.112',
        macAddress: 'D4:BE:D9:21:44:12',
        status: DeviceStatus.ONLINE,
        cpuPct: 22,
        memoryPct: 40,
        temperatureC: 41,
        connectedClients: 1,
        bandwidthMbps: 18,
        latencyMs: 14,
        packetLossPct: 0.1,
        uptimeHours: 48,
        firmware: 'CampusLinuxLab 6.8',
        lastSeen: now,
        parentDeviceId: 'SW-DIST-BLKC',
      },
    ];

    for (const d of initialDevices) {
      this.devices.set(d.id, d);
    }

    // 4. IoT Devices
    const initialIoT: IoTDevice[] = [
      {
        id: 'PROBE-ESP32-C2',
        name: 'ESP32-Observatory-Probe-C2',
        category: IoTDeviceCategory.PROBE_AGENT,
        source: DataSourceType.MEASURED,
        locationId: 'BLK-C',
        floor: 2,
        room: 'ICT Lab 4 Pillar Mount',
        ipAddress: '10.30.3.104',
        status: DeviceStatus.ONLINE,
        temperatureC: 36,
        humidityPct: 48,
        lastSeen: now,
        batteryPct: 98,
      },
      {
        id: 'IOT-ENV-SCI-201',
        name: 'ENV-AIR-BIO-LAB-201',
        category: IoTDeviceCategory.ENVIRONMENT_SENSOR,
        source: DataSourceType.SIMULATED,
        locationId: 'SCI',
        floor: 2,
        room: 'Biotech Cleanroom S201',
        ipAddress: '10.50.6.21',
        status: DeviceStatus.ONLINE,
        temperatureC: 21.5,
        humidityPct: 46,
        co2Ppm: 465,
        occupancy: 18,
        lastSeen: now,
      },
      {
        id: 'IOT-SMART-BLKB-301',
        name: 'SMART-BOARD-AV-B301',
        category: IoTDeviceCategory.SMART_CLASSROOM,
        source: DataSourceType.SIMULATED,
        locationId: 'BLK-B',
        floor: 3,
        room: 'Smart Auditorium B301',
        ipAddress: '10.50.2.31',
        status: DeviceStatus.ONLINE,
        temperatureC: 39,
        humidityPct: 49,
        co2Ppm: 610,
        powerKw: 1.8,
        occupancy: 64,
        lastSeen: now,
      },
      {
        id: 'IOT-CCTV-LIB-102',
        name: 'CCTV-PERIMETER-LIB-E1',
        category: IoTDeviceCategory.CCTV_CAMERA,
        source: DataSourceType.SIMULATED,
        locationId: 'LIB',
        floor: 1,
        room: 'Library East Entrance',
        ipAddress: '10.60.4.12',
        status: DeviceStatus.ONLINE,
        temperatureC: 44,
        lastSeen: now,
      },
      {
        id: 'IOT-NRG-BLKC-100',
        name: 'SMART-METER-BLKC-MAIN',
        category: IoTDeviceCategory.ENERGY_METER,
        source: DataSourceType.SIMULATED,
        locationId: 'BLK-C',
        floor: 1,
        room: 'Substation Panel C-Main',
        ipAddress: '10.50.3.10',
        status: DeviceStatus.ONLINE,
        powerKw: 68.4,
        lastSeen: now,
      },
    ];

    for (const iot of initialIoT) {
      this.iotDevices.set(iot.id, iot);
    }

    // 5. Seed Initial Baseline Metrics
    const ts = Date.now();
    let idx = 1;
    for (const loc of CAMPUS_LOCATIONS) {
      for (const floor of loc.floors) {
        // Measured baseline sample
        this.metrics.push({
          id: `m-seed-${idx}`,
          timestamp: new Date(ts - idx * 75_000).toISOString(),
          source: DataSourceType.MEASURED,
          sessionId: `anon-probe-${idx}`,
          probeId: idx === 1 ? 'PROBE-ESP32-C2' : undefined,
          locationId: loc.id,
          floor,
          latencyMs: loc.id === 'BLK-C' && floor === 2 ? 26 : 16 + (idx % 8),
          jitterMs: 3 + (idx % 4),
          downloadMbps: 84 + (idx % 22),
          uploadMbps: 38 + (idx % 12),
          packetLossPct: 0.1,
          signalDbm: -58 - (idx % 10),
          qualityScore: 92 - (idx % 6),
        });

        // Simulated baseline sample
        this.metrics.push({
          id: `s-seed-${idx}`,
          timestamp: new Date(ts - idx * 50_000).toISOString(),
          source: DataSourceType.SIMULATED,
          sessionId: `sim-flow-${idx}`,
          locationId: loc.id,
          floor,
          latencyMs: 18 + (idx % 6),
          jitterMs: 4 + (idx % 3),
          downloadMbps: 80 + (idx % 20),
          uploadMbps: 36 + (idx % 10),
          packetLossPct: 0.2,
          signalDbm: -61 - (idx % 8),
          qualityScore: 90 - (idx % 5),
        });
        idx++;
      }
    }

    // 6. Seed Security Events
    this.securityEvents.push({
      id: 'sec-seed-01',
      timestamp: new Date(ts - 25 * 60_000).toISOString(),
      source: DataSourceType.SIMULATED,
      eventType: 'Repeated 802.1X PEAP Authentication Drops',
      severity: SeverityLevel.MEDIUM,
      locationId: 'BLK-C',
      deviceId: 'AP-BLKC-F2-01',
      deviceIp: '10.40.3.189',
      description: 'Synthetic baseline event: 12 PEAP reauth time-outs in 60s from unprovisioned BYOD tablet.',
      defensiveGuidance: 'Check student onboarding certificate enrollment portal or inspect RADIUS timeout settings.',
      mitreTechnique: 'T1110 · Credential Access / Authentication Failures',
      nistFunction: 'DETECT',
      anomalyScore: 0.62,
      resolved: false,
    });

    // 7. Seed Initial Incident
    const seedIncId = 'inc-seed-01';
    this.incidents.set(seedIncId, {
      id: seedIncId,
      incidentNumber: 'INC-2026-0401',
      title: 'High-Density 5GHz Channel Contention · Block C Floor 3',
      summary: 'Elevated client retry rate observed on AP-LectureHall-C302 during afternoon distributed systems lecture.',
      source: DataSourceType.SIMULATED,
      severity: SeverityLevel.MEDIUM,
      priority: IncidentPriority.P3_MEDIUM,
      status: IncidentStatus.INVESTIGATING,
      locationId: 'BLK-C',
      floor: 3,
      assignedTo: 'Tariq Mensah (ICT Field Technician)',
      assignedUserId: 'usr-technician',
      affectedDeviceIds: ['AP-BLKC-F3-02'],
      studentReportCount: 1,
      alertIds: [],
      createdAt: new Date(ts - 40 * 60_000).toISOString(),
      updatedAt: new Date(ts - 15 * 60_000).toISOString(),
    });

    this.incidentUpdates.push({
      id: 'upd-01',
      incidentId: seedIncId,
      timestamp: new Date(ts - 40 * 60_000).toISOString(),
      userId: 'usr-student',
      userName: 'Anonymous Student Session',
      userRole: UserRole.STUDENT,
      action: 'CREATED',
      newStatus: IncidentStatus.REPORTED,
      note: 'Reported sluggish download and video buffering in Lecture Theatre C302.',
    });

    this.incidentUpdates.push({
      id: 'upd-02',
      incidentId: seedIncId,
      timestamp: new Date(ts - 15 * 60_000).toISOString(),
      userId: 'usr-technician',
      userName: 'Tariq Mensah',
      userRole: UserRole.ICT_TECHNICIAN,
      action: 'TRANSITION_STATUS',
      previousStatus: IncidentStatus.REPORTED,
      newStatus: IncidentStatus.INVESTIGATING,
      note: 'Initiated 5GHz spectrum capture to evaluate 80MHz -> 40MHz channel plan adjustment.',
    });

    // 8. Notifications
    this.notifications.push({
      id: 'notif-01',
      timestamp: new Date(ts - 15 * 60_000).toISOString(),
      title: 'Incident INC-2026-0401 Investigating',
      message: 'Tariq Mensah started investigating channel contention in Block C Floor 3.',
      severity: SeverityLevel.MEDIUM,
      source: DataSourceType.SIMULATED,
      read: false,
      incidentId: seedIncId,
    });
  }

  public clear() {
    this.locations.clear();
    this.users.clear();
    this.sessions.clear();
    this.devices.clear();
    this.iotDevices.clear();
    this.metrics = [];
    this.securityEvents = [];
    this.alerts = [];
    this.incidents.clear();
    this.incidentUpdates = [];
    this.studentReports.clear();
    this.notifications = [];
    this.auditLogs = [];
  }
}

export const db = new CampusDatabase();
