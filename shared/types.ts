/**
 * CampusGuard AI - Shared Data Models and Types
 * Covers all entities: Users, Roles, Locations, Devices, IoTDevices, NetworkMetrics,
 * SecurityEvents, Alerts, Incidents, IncidentUpdates, StudentReports, Notifications, AuditLogs.
 */

export enum UserRole {
  STUDENT = 'Student',
  ICT_TECHNICIAN = 'ICT Technician',
  NETWORK_ADMIN = 'Network Administrator',
  SYSTEM_ADMIN = 'System Administrator',
}

export enum DataSourceType {
  MEASURED = 'Measured',     // Real browser / hardware probe measurements
  SIMULATED = 'Simulated',   // Synthetic campus telemetry generator
}

export enum DeviceCategory {
  ROUTER = 'Router',
  SWITCH = 'Switch',
  ACCESS_POINT = 'Access Point',
  SERVER = 'Server',
  WORKSTATION = 'Workstation',
}

export enum IoTDeviceCategory {
  ENVIRONMENT_SENSOR = 'Environment Sensor',
  SMART_CLASSROOM = 'Smart Classroom',
  CCTV_CAMERA = 'CCTV Camera',
  ENERGY_METER = 'Energy Meter',
  PROBE_AGENT = 'Hardware Probe',
}

export enum DeviceStatus {
  ONLINE = 'Online',
  DEGRADED = 'Degraded',
  OFFLINE = 'Offline',
  QUARANTINED = 'Quarantined',
}

export enum SeverityLevel {
  INFO = 'INFO',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum IncidentStatus {
  REPORTED = 'REPORTED',
  ASSIGNED = 'ASSIGNED',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum IncidentPriority {
  P1_CRITICAL = 'P1',
  P2_HIGH = 'P2',
  P3_MEDIUM = 'P3',
  P4_LOW = 'P4',
}

export type ScenarioType =
  | 'NORMAL'
  | 'AP_FAILURE'
  | 'ABNORMAL_TRAFFIC'
  | 'HIGH_BANDWIDTH'
  | 'MULTIPLE_STUDENT_REPORTS'
  | 'IOT_SENSOR_FAILURE';

export interface Location {
  id: string;
  name: string;
  shortCode: string;
  floors: number[];
  description: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
}

export interface UserSession {
  token: string;
  userId: string;
  role: UserRole;
  name: string;
  expiresAt: number;
}

export interface Device {
  id: string;
  name: string;
  category: DeviceCategory;
  source: DataSourceType;
  locationId: string;
  floor: number;
  room: string;
  ipAddress: string;
  macAddress: string;
  status: DeviceStatus;
  cpuPct: number;
  memoryPct: number;
  temperatureC: number;
  connectedClients: number;
  bandwidthMbps: number;
  latencyMs: number;
  packetLossPct: number;
  uptimeHours: number;
  firmware: string;
  lastSeen: string;
  parentDeviceId?: string;
}

export interface IoTDevice {
  id: string;
  name: string;
  category: IoTDeviceCategory;
  source: DataSourceType;
  locationId: string;
  floor: number;
  room: string;
  ipAddress: string;
  status: DeviceStatus;
  temperatureC?: number;
  humidityPct?: number;
  co2Ppm?: number;
  powerKw?: number;
  occupancy?: number;
  lastSeen: string;
  batteryPct?: number;
}

export interface NetworkMetric {
  id: string;
  timestamp: string;
  source: DataSourceType;
  sessionId: string;
  probeId?: string;
  locationId: string;
  floor: number;
  latencyMs: number;
  jitterMs: number;
  downloadMbps: number;
  uploadMbps: number;
  packetLossPct: number;
  signalDbm?: number | null;
  qualityScore: number; // 0 - 100
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  source: DataSourceType;
  eventType: string;
  severity: SeverityLevel;
  locationId: string;
  deviceId?: string;
  deviceIp: string;
  description: string;
  defensiveGuidance: string;
  mitreTechnique: string;
  nistFunction: 'IDENTIFY' | 'PROTECT' | 'DETECT' | 'RESPOND' | 'RECOVER';
  anomalyScore: number;
  resolved: boolean;
}

export interface Alert {
  id: string;
  timestamp: string;
  source: DataSourceType;
  title: string;
  severity: SeverityLevel;
  locationId: string;
  floor?: number;
  deviceId?: string;
  confidence: number; // 0 - 100
  observedEvidence: string[];
  probableCause: string;
  affectedSystems: string[];
  investigationSteps: string[];
  remediation: string;
  ruleId: string;
  acknowledged: boolean;
}

export interface Incident {
  id: string;
  incidentNumber: string;
  title: string;
  summary: string;
  source: DataSourceType;
  severity: SeverityLevel;
  priority: IncidentPriority;
  status: IncidentStatus;
  locationId: string;
  floor: number;
  assignedTo?: string;
  assignedUserId?: string;
  affectedDeviceIds: string[];
  studentReportCount: number;
  rootCauseHypothesis?: string;
  remediationAction?: string;
  alertIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  previousStatus?: IncidentStatus;
  newStatus?: IncidentStatus;
  note: string;
}

export interface StudentReport {
  id: string;
  incidentNumber: string;
  sessionId: string;
  source: DataSourceType;
  category: 'No Connection' | 'Slow Speeds' | 'High Latency / Drops' | 'Authentication Failure' | 'Lab Equipment / IoT';
  locationId: string;
  floor: number;
  roomLabel?: string;
  description: string;
  status: IncidentStatus;
  linkedIncidentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  severity: SeverityLevel;
  source: DataSourceType;
  read: boolean;
  linkTab?: string;
  incidentId?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  requestId?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
}

export interface CampusOverviewMetrics {
  overallStatus: SeverityLevel;
  simulationModeActive: boolean;
  connectedClients: number;
  activeAPs: number;
  totalAPs: number;
  totalBandwidthGbps: number;
  unresolvedIncidents: number;
  securityAlertsCount: number;
  iotFleetHealthPct: number;
  aiRiskScore: number; // 0 - 100
  naturalLanguageSummary: string;
}

export interface HeatmapCell {
  locationId: string;
  locationName: string;
  shortCode: string;
  floor: number;
  measuredCount: number;
  simulatedCount: number;
  avgLatencyMs: number;
  avgJitterMs: number;
  avgDownloadMbps: number;
  avgUploadMbps: number;
  avgPacketLossPct: number;
  qualityScore: number;
  status: SeverityLevel;
  activeReports: number;
  activeApCount: number;
  degradedApCount: number;
}
