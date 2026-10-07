/**
 * Demo Scenario Controller & Ingestion Service
 * Deterministic and reversible scenarios:
 * NORMAL, AP_FAILURE, ABNORMAL_TRAFFIC, HIGH_BANDWIDTH, MULTIPLE_STUDENT_REPORTS, IOT_SENSOR_FAILURE
 */

import { CAMPUS_LOCATIONS } from '../shared/locations.js';
import {
  DataSourceType,
  DeviceStatus,
  Incident,
  IncidentPriority,
  IncidentStatus,
  NetworkMetric,
  ScenarioType,
  SeverityLevel,
} from '../shared/types.js';
import { db } from '../db/campus-db.js';
import { computeWifiQualityScore, telemetryPipeline } from '../engines/telemetry-pipeline.js';

export class ScenarioService {
  public currentScenario: ScenarioType = 'NORMAL';

  public resetToNormalBaseline() {
    this.currentScenario = 'NORMAL';
    db.seed();
    telemetryPipeline.evaluateAnomalies();
  }

  public applyScenario(scenario: ScenarioType): {
    scenario: ScenarioType;
    affectedDevices: string[];
    description: string;
  } {
    this.currentScenario = scenario;
    const now = new Date().toISOString();

    if (scenario === 'AP_FAILURE') {
      // 1. Fail AP-BLKC-F2-01 in Block C Floor 2
      const targetAp = db.devices.get('AP-BLKC-F2-01');
      if (targetAp) {
        targetAp.status = DeviceStatus.OFFLINE;
        targetAp.packetLossPct = 100;
        targetAp.latencyMs = 999;
        targetAp.connectedClients = 0;
        targetAp.bandwidthMbps = 0;
        targetAp.lastSeen = now;
      }

      // Neighbor AP C302 experiences client roaming spillover
      const neighbor = db.devices.get('AP-BLKC-F3-02');
      if (neighbor) {
        neighbor.status = DeviceStatus.DEGRADED;
        neighbor.connectedClients = 184;
        neighbor.latencyMs = 138;
        neighbor.packetLossPct = 7.8;
      }

      // Ingest degraded measurement sample
      db.metrics.unshift({
        id: `m-scen-ap-${Date.now()}`,
        timestamp: now,
        source: DataSourceType.SIMULATED,
        sessionId: 'sim-ap-fail-probe',
        locationId: 'BLK-C',
        floor: 2,
        latencyMs: 245,
        jitterMs: 42,
        downloadMbps: 4.8,
        uploadMbps: 1.2,
        packetLossPct: 28.4,
        signalDbm: -85,
        qualityScore: 22,
      });

      // Run pipeline
      telemetryPipeline.evaluateAnomalies();

      return {
        scenario,
        affectedDevices: ['AP-BLKC-F2-01', 'AP-BLKC-F3-02'],
        description: 'Simulated PoE heartbeat loss on AP-ICTLab4-C204 in Block C Floor 2 with neighbor AP spillover.',
      };
    }

    if (scenario === 'ABNORMAL_TRAFFIC') {
      const pc = db.devices.get('LAB-PC-C204-12');
      if (pc) {
        pc.status = DeviceStatus.DEGRADED;
        pc.bandwidthMbps = 740;
        pc.cpuPct = 94;
        pc.latencyMs = 124;
        pc.packetLossPct = 4.2;
        pc.lastSeen = now;
      }

      db.securityEvents.unshift({
        id: `sec-scen-${Date.now()}`,
        timestamp: now,
        source: DataSourceType.SIMULATED,
        eventType: 'High East-West Port Reconnaissance Spike',
        severity: SeverityLevel.HIGH,
        locationId: 'BLK-C',
        deviceId: 'LAB-PC-C204-12',
        deviceIp: '10.40.3.112',
        description: 'Simulated Scenario: Host WORKSTATION-C204-PC12 initiated 740 Mbps burst across 142 internal ports/min.',
        defensiveGuidance: 'Place switch port into isolation VLAN or apply rate-limit ACL on distribution switch.',
        mitreTechnique: 'T1046 · Network Service Discovery',
        nistFunction: 'RESPOND',
        anomalyScore: 0.93,
        resolved: false,
      });

      telemetryPipeline.evaluateAnomalies();

      return {
        scenario,
        affectedDevices: ['LAB-PC-C204-12'],
        description: 'Injected 740 Mbps east-west flow volume spike and port reconnaissance event on Workstation PC12.',
      };
    }

    if (scenario === 'HIGH_BANDWIDTH') {
      const ap = db.devices.get('AP-RESN-F3-01');
      if (ap) {
        ap.status = DeviceStatus.DEGRADED;
        ap.bandwidthMbps = 510;
        ap.connectedClients = 245;
        ap.latencyMs = 118;
        ap.packetLossPct = 5.8;
      }

      db.metrics.unshift({
        id: `m-scen-bw-${Date.now()}`,
        timestamp: now,
        source: DataSourceType.SIMULATED,
        sessionId: 'sim-bw-surge',
        locationId: 'RES-N',
        floor: 3,
        latencyMs: 124,
        jitterMs: 28,
        downloadMbps: 12.4,
        uploadMbps: 4.2,
        packetLossPct: 6.1,
        qualityScore: 48,
      });

      telemetryPipeline.evaluateAnomalies();

      return {
        scenario,
        affectedDevices: ['AP-RESN-F3-01'],
        description: 'Simulated evening peak bandwidth congestion (510 Mbps) in North Student Residences Floor 3.',
      };
    }

    if (scenario === 'MULTIPLE_STUDENT_REPORTS') {
      const reports = [
        { room: 'ICT Lab 4 (C204)', desc: 'Cannot connect to GitHub or download npm packages in Block C.' },
        { room: 'CS Seminar Room C208', desc: 'Frequent Wi-Fi disconnects during programming lecture.' },
        { room: 'Block C 2F Lobby', desc: 'Eduroam says connected but internet gateway is unreachable.' },
      ];

      for (const r of reports) {
        const reportId = `rep-sim-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
        db.studentReports.set(reportId, {
          id: reportId,
          incidentNumber: 'INC-2026-0412',
          sessionId: `sim-student-${Math.random().toString(36).slice(2, 6)}`,
          source: DataSourceType.SIMULATED,
          category: 'High Latency / Drops',
          locationId: 'BLK-C',
          floor: 2,
          roomLabel: r.room,
          description: r.desc,
          status: IncidentStatus.REPORTED,
          createdAt: now,
          updatedAt: now,
        });
      }

      // Ingest degraded measurement sample
      db.metrics.unshift({
        id: `m-scen-crowd-${Date.now()}`,
        timestamp: now,
        source: DataSourceType.SIMULATED,
        sessionId: 'sim-crowd-cluster',
        locationId: 'BLK-C',
        floor: 2,
        latencyMs: 188,
        jitterMs: 34,
        downloadMbps: 9.2,
        uploadMbps: 2.1,
        packetLossPct: 14.5,
        qualityScore: 34,
      });

      telemetryPipeline.evaluateAnomalies();

      return {
        scenario,
        affectedDevices: ['AP-BLKC-F2-01'],
        description: 'Simulated 3 concurrent student reports from Block C Floor 2 converging into a prioritized incident.',
      };
    }

    if (scenario === 'IOT_SENSOR_FAILURE') {
      const sensor = db.iotDevices.get('IOT-ENV-SCI-201');
      if (sensor) {
        sensor.status = DeviceStatus.OFFLINE;
        sensor.lastSeen = now;
      }

      return {
        scenario,
        affectedDevices: ['IOT-ENV-SCI-201'],
        description: 'Simulated MQTT telemetry frame drop on Biotech Cleanroom Environmental Sensor in Science Complex.',
      };
    }

    // Default NORMAL
    this.resetToNormalBaseline();
    return {
      scenario: 'NORMAL',
      affectedDevices: [],
      description: 'Campus telemetry reset to clean nominal baseline.',
    };
  }
}

export const scenarioService = new ScenarioService();
