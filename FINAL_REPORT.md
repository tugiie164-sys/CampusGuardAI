# CampusGuard AI · Final Engineering & Audit Report

## 1. Current Architecture
CampusGuard AI operates as a full-stack, modular TypeScript application on Express and React 19. It runs as a single service on Port 3000 handling HTTP API routes, Server-Sent Events (SSE) live push notifications, and client SPA routing.

## 2. Changes Made
- Transformed monolithic prototype into clean modular packages: `shared/`, `db/`, `services/`, `engines/`, `src/components/`, `src/store/`.
- Replaced mock stubs with active backend database models, session management, and role-based access control (RBAC).
- Implemented real browser speed tests in the Student PWA posting to `/api/measurements` with automatic live heatmap updating.
- Built a deterministic 5-stage incident lifecycle (`REPORTED → ASSIGNED → INVESTIGATING → RESOLVED → CLOSED`) with audit trail logging.
- Created 5 reversible scenarios (`AP_FAILURE`, `ABNORMAL_TRAFFIC`, `HIGH_BANDWIDTH`, `MULTIPLE_STUDENT_REPORTS`, `IOT_SENSOR_FAILURE`) with clean baseline recovery.
- Integrated an automated 3-minute Presentation Mode sequence with a presenter panel and stage timer.

## 3. Functional Features
- **Real Wi-Fi Quality Test:** Active HTTP ping/download probe against `/api/probe/ping` computing RTT, jitter, and throughput.
- **Unified Ingestion:** Ingests live telemetry labeled `Measured` and updates spatial heatmaps.
- **Incident State Machine:** Workflow transitions with operator notes, audit logging, and remediation triggers.
- **Defensive Security Timeline:** Maps simulated UNSW-NB15 flow characteristics to MITRE ATT&CK and NIST CSF tags.
- **Student Assistant:** Controlled natural language command lookup for labs, hours, and connectivity.

## 4. Simulated Features
- Wider campus infrastructure (Core BGP router, distribution switches, Wi-Fi 6 access points, IoT sensors).
- Background NetFlow and MQTT environmental telemetry.
- Demonstration threat scenarios for defensive NOC operations.

## 5. Security & Privacy Controls
- Zero GPS location tracking (building and floor picker only).
- No traffic payload inspection or client MAC address tracking.
- Session tokens with 24-hour expiration and role authorization on mutation endpoints.
- Rate limiting on API routes and parameterized data mutations.

## 6. Test Results
- All 6 automated test suites passed (`npm test`):
  1. Password Hashing & Authentication
  2. Telemetry & Quality Score Calculation
  3. AP Failure Scenario & Anomaly Detection
  4. Incident Correlation & Audit Trail
  5. Student Assistant Controlled Lookup
  6. Baseline Recovery & Scenario Reversibility
