/**
 * Express Full-Stack Server & API Routes
 * Modular routes: Auth, Telemetry Ingestion, Incidents, Student Reports,
 * Assistant, Scenarios, Analytics, Devices, and Real-Time SSE Stream.
 */

import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { db } from './db/campus-db.js';
import { authService } from './services/auth-service.js';
import { scenarioService } from './services/scenario-service.js';
import { analyticsService } from './services/analytics-service.js';
import { studentAssistantService } from './services/assistant-service.js';
import { computeWifiQualityScore, telemetryPipeline } from './engines/telemetry-pipeline.js';
import {
  DataSourceType,
  DeviceStatus,
  IncidentPriority,
  IncidentStatus,
  ScenarioType,
  SeverityLevel,
  UserRole,
} from './shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// 1. Structured Logging with Request IDs
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqId = `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  (req as any).requestId = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
});

// 2. Simple In-Memory Rate Limiter
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
function rateLimiter(limit: number = 300, windowMs: number = 60_000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || '127.0.0.1';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now - entry.windowStart > windowMs) {
      rateLimitMap.set(ip, { count: 1, windowStart: now });
      return next();
    }
    entry.count += 1;
    if (entry.count > limit) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please retry in a moment.' });
    }
    next();
  };
}

app.use('/api', rateLimiter());

// 3. Auth Middleware
function requireAuth(allowedRoles?: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.cg_token ||
      (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined);

    const session = authService.validateToken(token);
    if (!session) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }

    if (allowedRoles && !allowedRoles.includes(session.role)) {
      return res.status(403).json({
        error: `Forbidden: role ${session.role} is not authorized for this resource.`,
      });
    }

    (req as any).userSession = session;
    next();
  };
}

// SSE Connection Manager
const sseClients = new Set<Response>();
function broadcastStateUpdate() {
  const overview = analyticsService.computeOverviewMetrics();
  const heatmap = analyticsService.computeHeatmap('ALL');
  const payload = JSON.stringify({
    type: 'CAMPUS_UPDATE',
    timestamp: new Date().toISOString(),
    overview,
    heatmap,
  });

  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// Health & Readiness
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    mode: 'SIMULATION',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Ping endpoint for Real Wi-Fi speed & latency test (Campus Connectivity Observatory)
app.get('/api/probe/ping', (_req, res) => {
  // Send 32KB payload for realistic client throughput & RTT measurement
  const chunk = 'CAMPUSGUARD_OBSERVATORY_MEASURED_FRAME_'.repeat(850);
  res.json({
    status: 'ok',
    source: 'Measured',
    serverTimestamp: Date.now(),
    payload: chunk,
  });
});

// Server-Sent Events (SSE) Live Feed
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseClients.add(res);

  // Send initial frame
  const overview = analyticsService.computeOverviewMetrics();
  const heatmap = analyticsService.computeHeatmap('ALL');
  res.write(
    `data: ${JSON.stringify({
      type: 'INIT',
      timestamp: new Date().toISOString(),
      overview,
      heatmap,
    })}\n\n`
  );

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required.' });
  }

  const result = authService.authenticate(username, password);
  if (!result) {
    return res.status(401).json({ error: 'Invalid credentials. Demo accounts: student/student123, tech/tech123, netadmin/admin123, sysadmin/sysadmin123' });
  }

  res.cookie('cg_token', result.session.token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({
    user: {
      id: result.user.id,
      username: result.user.username,
      name: result.user.name,
      role: result.user.role,
    },
    session: result.session,
  });
});

app.post('/api/auth/demo-switch', (req, res) => {
  const { role } = req.body || {};
  const validRoles = Object.values(UserRole);
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }

  const session = authService.createDemoSessionForRole(role);
  res.cookie('cg_token', session.token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ session });
});

app.get('/api/auth/me', (req, res) => {
  const token =
    req.cookies?.cg_token ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined);

  const session = authService.validateToken(token) || authService.createDemoSessionForRole(UserRole.NETWORK_ADMIN);
  res.json({ session });
});

// Full Campus Overview State
app.get('/api/state', (_req, res) => {
  const overview = analyticsService.computeOverviewMetrics();
  const heatmap = analyticsService.computeHeatmap('ALL');
  const incidents = Array.from(db.incidents.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const alerts = db.alerts.slice(0, 10);
  const devices = Array.from(db.devices.values());
  const iotDevices = Array.from(db.iotDevices.values());
  const studentReports = Array.from(db.studentReports.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const securityEvents = db.securityEvents.slice(0, 8);
  const notifications = db.notifications.slice(0, 12);
  const recentMetrics = db.metrics.slice(0, 20);

  res.json({
    overview,
    heatmap,
    incidents,
    alerts,
    devices,
    iotDevices,
    studentReports,
    securityEvents,
    notifications,
    recentMetrics,
    currentScenario: scenarioService.currentScenario,
  });
});

// Ingest Measurements (Both Measured from PWA/Probe and Simulated from background)
app.post('/api/measurements', (req, res) => {
  const {
    sessionId,
    probeId,
    source,
    locationId,
    floor,
    latencyMs,
    jitterMs,
    downloadMbps,
    uploadMbps,
    packetLossPct,
    signalDbm,
  } = req.body || {};

  if (!locationId || typeof floor !== 'number' || typeof latencyMs !== 'number') {
    return res.status(400).json({ error: 'Validation error: locationId, floor, and latencyMs are required.' });
  }

  const qualityScore = computeWifiQualityScore({
    latencyMs: Number(latencyMs),
    jitterMs: Number(jitterMs ?? 4),
    downloadMbps: Number(downloadMbps ?? 60),
    packetLossPct: Number(packetLossPct ?? 0),
  });

  const measurement = {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    source: source === DataSourceType.SIMULATED ? DataSourceType.SIMULATED : DataSourceType.MEASURED,
    sessionId: String(sessionId || 'anon-pwa'),
    probeId: probeId ? String(probeId) : undefined,
    locationId,
    floor: Number(floor),
    latencyMs: Math.round(Number(latencyMs)),
    jitterMs: Math.round(Number(jitterMs ?? 4)),
    downloadMbps: Number(Number(downloadMbps ?? 50).toFixed(1)),
    uploadMbps: Number(Number(uploadMbps ?? 20).toFixed(1)),
    packetLossPct: Number(Number(packetLossPct ?? 0).toFixed(1)),
    signalDbm: signalDbm !== undefined ? Number(signalDbm) : -60,
    qualityScore,
  };

  db.metrics.unshift(measurement);
  if (db.metrics.length > 200) db.metrics.pop();

  telemetryPipeline.evaluateAnomalies();
  broadcastStateUpdate();

  res.status(201).json({ measurement });
});

// Student Issue Report Submission
app.post('/api/reports', (req, res) => {
  const { sessionId, category, locationId, floor, roomLabel, description } = req.body || {};
  if (!category || !locationId || typeof floor !== 'number' || !description) {
    return res.status(400).json({ error: 'Validation error: category, locationId, floor, description are required.' });
  }

  const now = new Date().toISOString();
  const incNum = `INC-2026-0${400 + db.incidents.size + 1}`;

  // Find or create incident
  let incident = Array.from(db.incidents.values()).find(
    (inc) =>
      inc.locationId === locationId &&
      inc.floor === floor &&
      inc.status !== IncidentStatus.RESOLVED &&
      inc.status !== IncidentStatus.CLOSED
  );

  if (!incident) {
    incident = {
      id: `inc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      incidentNumber: incNum,
      title: `${category} · ${locationId} Floor ${floor}`,
      summary: `Student reported in ${roomLabel || `${locationId} F${floor}`}: "${description}"`,
      source: DataSourceType.MEASURED,
      severity: category === 'No Connection' ? SeverityLevel.HIGH : SeverityLevel.MEDIUM,
      priority: category === 'No Connection' ? IncidentPriority.P2_HIGH : IncidentPriority.P3_MEDIUM,
      status: IncidentStatus.REPORTED,
      locationId,
      floor,
      assignedTo: 'Tariq Mensah (ICT Field Technician)',
      assignedUserId: 'usr-technician',
      affectedDeviceIds: [],
      studentReportCount: 1,
      alertIds: [],
      createdAt: now,
      updatedAt: now,
    };
    db.incidents.set(incident.id, incident);

    db.incidentUpdates.push({
      id: `upd-${Date.now()}`,
      incidentId: incident.id,
      timestamp: now,
      userId: 'student-session',
      userName: 'Student Reporter',
      userRole: UserRole.STUDENT,
      action: 'CREATED_BY_STUDENT',
      newStatus: IncidentStatus.REPORTED,
      note: `${category}: ${description}`,
    });
  } else {
    incident.studentReportCount += 1;
    incident.updatedAt = now;
    if (incident.studentReportCount >= 3) {
      incident.severity = SeverityLevel.CRITICAL;
      incident.priority = IncidentPriority.P1_CRITICAL;
    }
  }

  const report = {
    id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    incidentNumber: incident.incidentNumber,
    sessionId: String(sessionId || 'anon-student'),
    source: DataSourceType.MEASURED,
    category,
    locationId,
    floor: Number(floor),
    roomLabel,
    description: String(description).slice(0, 500),
    status: incident.status,
    linkedIncidentId: incident.id,
    createdAt: now,
    updatedAt: now,
  };

  db.studentReports.set(report.id, report);

  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    timestamp: now,
    title: `New Student Report: ${incident.incidentNumber}`,
    message: `${locationId} Floor ${floor}: ${category} ("${description.slice(0, 60)}")`,
    severity: incident.severity,
    source: DataSourceType.MEASURED,
    read: false,
    incidentId: incident.id,
  });

  broadcastStateUpdate();

  res.status(201).json({ report, incident });
});

// Update Incident Workflow (Role Protected)
app.patch('/api/incidents/:id/status', requireAuth([UserRole.ICT_TECHNICIAN, UserRole.NETWORK_ADMIN, UserRole.SYSTEM_ADMIN]), (req, res) => {
  const { id } = req.params;
  const { newStatus, note, applyRemediation } = req.body || {};
  const user = (req as any).userSession;

  const incident = db.incidents.get(id);
  if (!incident) return res.status(404).json({ error: 'Incident not found.' });

  const prevStatus = incident.status;
  incident.status = newStatus;
  incident.updatedAt = new Date().toISOString();

  db.incidentUpdates.push({
    id: `upd-${Date.now()}`,
    incidentId: incident.id,
    timestamp: incident.updatedAt,
    userId: user.userId,
    userName: user.name,
    userRole: user.role,
    action: applyRemediation ? 'APPLIED_REMEDIATION_AND_STATUS_CHANGE' : 'TRANSITION_STATUS',
    previousStatus: prevStatus,
    newStatus,
    note: note || `Transitioned status to ${newStatus}`,
  });

  // If resolved or remediation applied, heal affected devices
  if (applyRemediation || newStatus === IncidentStatus.RESOLVED || newStatus === IncidentStatus.CLOSED) {
    for (const dev of db.devices.values()) {
      if (incident.affectedDeviceIds.includes(dev.id) || (dev.locationId === incident.locationId && dev.status !== DeviceStatus.ONLINE)) {
        dev.status = DeviceStatus.ONLINE;
        dev.packetLossPct = 0.1;
        dev.latencyMs = 15;
        dev.bandwidthMbps = Math.min(140, dev.bandwidthMbps);
      }
    }
  }

  broadcastStateUpdate();
  res.json({ incident });
});

// Trigger Demo Scenario
app.post('/api/scenarios/:name', (req, res) => {
  const scenario = req.params.name.toUpperCase() as ScenarioType;
  const result = scenarioService.applyScenario(scenario);
  broadcastStateUpdate();
  res.json(result);
});

// Reset Demo to Baseline
app.post('/api/scenarios/reset', (_req, res) => {
  scenarioService.resetToNormalBaseline();
  broadcastStateUpdate();
  res.json({ status: 'ok', scenario: 'NORMAL' });
});

// Student Assistant
app.post('/api/assistant/query', (req, res) => {
  const { query, sessionId } = req.body || {};
  if (!query) return res.status(400).json({ error: 'Query string required.' });

  const result = studentAssistantService.handleQuery(String(query), sessionId);
  res.json(result);
});

// Mark all notifications read
app.post('/api/notifications/read-all', (_req, res) => {
  for (const n of db.notifications) {
    n.read = true;
  }
  res.json({ status: 'ok' });
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function startServer() {
  // AI Studio requires the dev server to run on port 3000
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true' ? { port: 24679 } : false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`  VITE v8.3.0 ready in 150 ms`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/`);
    console.log(`[CampusGuard AI] Server running on http://0.0.0.0:${PORT}`);
  });

  process.on('SIGTERM', () => {
    server.close();
    process.exit(0);
  });
  process.on('SIGINT', () => {
    server.close();
    process.exit(0);
  });
}

startServer();
