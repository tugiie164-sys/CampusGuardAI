/**
 * Student Assistant Service
 * Controlled command system:
 * - report issue
 * - find location (e.g. "Where is ICT Lab 4?")
 * - check service status (e.g. "Is the library open?", campus Wi-Fi)
 * - view own incidents
 * - certification resources
 * Strict boundaries: never exposes administrative passwords/internals.
 */

import { CAMPUS_LOCATIONS } from '../shared/locations.js';
import { db } from '../db/campus-db.js';

export interface AssistantResponse {
  answer: string;
  suggestedAction?: {
    type: 'REPORT_ISSUE' | 'VIEW_HEATMAP' | 'NAVIGATE';
    payload: Record<string, any>;
  };
}

export class StudentAssistantService {
  public handleQuery(query: string, sessionId?: string): AssistantResponse {
    const q = query.trim().toLowerCase();

    // 1. Where is ICT Lab 4?
    if (q.includes('lab 4') || q.includes('ict lab') || (q.includes('where') && q.includes('lab'))) {
      return {
        answer:
          'ICT Lab 4 is located in Block C (Computer Science & ICT Complex), Floor 2, Room C204. It contains 40 development workstations and the ESP32 Observatory Probe C2.',
        suggestedAction: {
          type: 'VIEW_HEATMAP',
          payload: { locationId: 'BLK-C', floor: 2 },
        },
      };
    }

    // 2. Report Wi-Fi problems in Block C
    if (q.includes('report') || q.includes('block c') || q.includes('bad') || q.includes('slow')) {
      return {
        answer:
          'I can help you log an issue for Block C Floor 2. Click the quick button below or open the "Test My Wi-Fi" tab to measure your latency and submit an anonymous ticket.',
        suggestedAction: {
          type: 'REPORT_ISSUE',
          payload: {
            locationId: 'BLK-C',
            floor: 2,
            category: 'High Latency / Drops',
            roomLabel: 'Block C · Floor 2',
          },
        },
      };
    }

    // 3. Is the library open?
    if (q.includes('library') || q.includes('open') || q.includes('hours')) {
      return {
        answer:
          'Yes, the Central Library & Learning Commons is OPEN. The Ground Floor 24/7 Study Atrium is continuously accessible with student ID badge, and Research Pods on Floors 2–3 operate from 07:30 to 23:00.',
        suggestedAction: {
          type: 'VIEW_HEATMAP',
          payload: { locationId: 'LIB', floor: 1 },
        },
      };
    }

    // 4. How do I connect to campus Wi-Fi?
    if (q.includes('connect') || q.includes('eduroam') || q.includes('wifi') || q.includes('wi-fi')) {
      return {
        answer:
          'To connect to Campus Wi-Fi: 1) Select SSID "CampusGuard-Eduroam". 2) Log in using your campus email credentials with WPA2/WPA3 Enterprise (PEAP/MSCHAPv2). 3) Accept the server certificate issued by SRV-RADIUS-EDUROAM-01. For IoT/hardware lab devices, request VLAN 40 onboarding via your ICT technician.',
      };
    }

    // 5. Show my reported incidents
    if (q.includes('my incident') || q.includes('my report') || q.includes('status') || q.includes('track')) {
      const reports = Array.from(db.studentReports.values());
      if (reports.length === 0) {
        return {
          answer: 'You have no open Wi-Fi reports logged under this session. You can submit one anytime using the Student PWA tab.',
        };
      }
      const list = reports
        .slice(0, 3)
        .map((r) => `Ticket ${r.incidentNumber} (${r.locationId} F${r.floor} · Status: ${r.status})`)
        .join('; ');
      return {
        answer: `Found your recent reports: ${list}. Updates from ICT staff sync in real-time.`,
      };
    }

    // 6. Where can I access ICT certification resources?
    if (q.includes('certification') || q.includes('resources') || q.includes('study') || q.includes('exam')) {
      return {
        answer:
          'ICT Certification learning paths (Enterprise Routing & Switching, WLAN Engineering, Cloud Computing, and NIST Defensive Security Fundamentals) are available on the Campus Learning Portal and via physical practice racks in Block C Room C208.',
        suggestedAction: {
          type: 'NAVIGATE',
          payload: { tab: 'architecture' },
        },
      };
    }

    // Default Fallback
    return {
      answer:
        'I am the CampusGuard Student Assistant. You can ask me: "Where is ICT Lab 4?", "Report Wi-Fi problems in Block C", "Is the library open?", "How do I connect to campus Wi-Fi?", or "Where can I access ICT certification resources?".',
    };
  }
}

export const studentAssistantService = new StudentAssistantService();
