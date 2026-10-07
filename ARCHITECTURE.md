# CampusGuard AI Architecture & ADR

## 1. System Architecture
CampusGuard AI is designed as a modular, privacy-preserving smart-campus operations platform.

```
┌────────────────────────────────────────────────────────┐
│               Campus Web & Student PWA                 │
│  - NOC Dashboard, Wi-Fi Heatmap, Incident Management   │
│  - Student PWA ("Test My Wi-Fi", 1-Tap Reports)        │
│  - Scripted Student Support Assistant                  │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP & SSE (Port 3000)
┌───────────────────────────▼────────────────────────────┐
│                    API Gateway (Node.js)               │
│  - Cookie / Bearer Token RBAC Auth Middleware          │
│  - In-Memory Rate Limiting & Structured Request IDs    │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
┌─────────────▼─────────────┐   ┌─────────▼──────────────┐
│    Observatory Ingestion   │   │ Telemetry & Scenario   │
│  - Measured (PWA & Probe) │   │  - Synthetic Generator │
│  - Z-Score Quality Scorer │   │  - 5 Scenarios         │
└─────────────┬─────────────┘   └─────────┬──────────────┘
              │                           │
┌─────────────▼───────────────────────────▼──────────────┐
│         Telemetry Pipeline & Anomaly Engine            │
│  - Rolling EWMA Baselines & Threshold Checks           │
│  - Multi-Signal Incident Correlation Engine            │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              Normalized Database Store                 │
│  - Devices, IoT, Metrics, Incidents, Audit Logs        │
└────────────────────────────────────────────────────────┘
```

## 2. Architecture Decision Records (ADRs)

### ADR-01: Explicit Separation of "Measured" vs "Simulated" Telemetry
- **Status:** Approved
- **Context:** Demonstrating an end-to-end smart campus platform requires both live browser verification and synthetic campus-wide device coverage.
- **Decision:** All metrics, alerts, and records are strictly tagged as `Measured` (real PWA probe measurements) or `Simulated` (synthetic campus infrastructure). Persistent "SIMULATION MODE" badges are rendered throughout the UI.

### ADR-02: Zero-GPS Spatial Resolution (Building & Floor Tagging)
- **Status:** Approved
- **Context:** Student privacy must be safeguarded; collecting background GPS coordinates or client MAC addresses is unacceptable.
- **Decision:** Students manually select their building and floor from a dropdown. Ephemeral rotating session tokens prevent cross-session user profiling.

### ADR-03: Explainable Rule/Statistical Anomaly Engine Over Black-Box AI
- **Status:** Approved
- **Context:** Network administrators must understand *why* an alert fired before taking consequential actions like port cycling.
- **Decision:** Detect anomalies via statistical Z-score deviations and rule thresholds, generating human-readable evidence, probable cause, and remediation steps.

### ADR-04: Unified Multi-Platform Ecosystem (Responsive Web NOC & Dedicated Mobile Application)
- **Status:** Approved
- **Context:** University campus stakeholders operate in two distinct modalities: NOC engineers managing enterprise networks on multi-monitor desktops/laptops, and students/field technicians on mobile phones troubleshooting Wi-Fi on the go.
- **Decision:** Provide one unified CampusGuard AI platform with multiple client experiences sharing the identical backend API, database, authentication, SSE stream, AI anomaly engine, and incident workflow:
  1. **Web Operations Center (Desktop/Laptop NOC):** High-density control center with full topology maps, interactive heatmaps, SLA analytics, security operations, and scenario injection.
  2. **Dedicated Mobile Application (iOS/PWA):** Apple HIG-inspired mobile client optimized for rapid roaming speed tests, 30-second student incident filing with offline queue fallback, ticket timeline tracking, field technician dispatch remediation, and equipment QR scanning. Includes an interactive iPhone 16 Pro simulator frame for seamless desktop testing.
