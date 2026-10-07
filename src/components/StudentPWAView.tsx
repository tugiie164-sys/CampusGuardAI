import React, { useState } from 'react';
import { Wifi, Send, MessageSquare, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { useCampusStore } from '../store/useCampusStore';
import { CAMPUS_LOCATIONS } from '../../shared/locations';

const PROMPTS = [
  'Where is ICT Lab 4?',
  'Report Wi-Fi problems in Block C',
  'Is the library open?',
  'How do I connect to campus Wi-Fi?',
  'Show my reported incidents',
  'Where can I access ICT certification resources?',
];

export const StudentPWAView: React.FC = () => {
  const { runSpeedTest, submitStudentReport, studentReports, setActiveTab } = useCampusStore();
  const [selectedLoc, setSelectedLoc] = useState('BLK-C');
  const [selectedFloor, setSelectedFloor] = useState(2);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Report state
  const [category, setCategory] = useState<'No Connection' | 'Slow Speeds' | 'High Latency / Drops' | 'Authentication Failure' | 'Lab Equipment / IoT'>('High Latency / Drops');
  const [room, setRoom] = useState('ICT Lab 4 (C204)');
  const [desc, setDesc] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; action?: any }>>([
    {
      sender: 'bot',
      text: 'Hello! I am your Campus Student Assistant. Ask me about ICT labs, library hours, eduroam Wi-Fi, or report an issue.',
    },
  ]);

  const handleTestWifi = async () => {
    setIsTesting(true);
    try {
      const res = await runSpeedTest(selectedLoc, selectedFloor);
      setTestResult(res);
    } finally {
      setIsTesting(false);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return;
    const res = await submitStudentReport({
      category,
      locationId: selectedLoc,
      floor: selectedFloor,
      roomLabel: room,
      description: desc.trim(),
    });
    if (res?.incident?.incidentNumber) {
      setSubmittedTicket(res.incident.incidentNumber);
      setDesc('');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = { sender: 'user' as const, text };
    setMessages((m) => [...m, userMsg]);
    setChatInput('');

    try {
      const res = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { sender: 'bot', text: data.answer, action: data.suggestedAction }]);
    } catch {
      setMessages((m) => [...m, { sender: 'bot', text: 'Error connecting to student assistant service.' }]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="text-xs text-slate-500">
          Student Observatory Layer · Privacy by Design (User-selected location only, zero GPS)
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
          Student Wi-Fi Probe & Support Assistant
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Test Wi-Fi & Submit Report */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Test My Wi-Fi */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            <div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                Real Ingestion Probe · Labeled: Measured
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-0.5">
                Test My Campus Wi-Fi Quality
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Campus Location (No GPS)
                </label>
                <select
                  value={selectedLoc}
                  onChange={(e) => setSelectedLoc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
                >
                  {CAMPUS_LOCATIONS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Floor Level
                </label>
                <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {[1, 2, 3, 4].map((fl) => (
                    <button
                      key={fl}
                      onClick={() => setSelectedFloor(fl)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        selectedFloor === fl ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      Floor {fl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleTestWifi}
              disabled={isTesting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              <Wifi className={`w-4 h-4 ${isTesting ? 'animate-ping' : ''}`} />
              <span>{isTesting ? 'Measuring RTT & Throughput...' : 'Test My Wi-Fi in this Zone'}</span>
            </button>

            {testResult && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-2 text-xs">
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ Measured Probe Telemetry Streamed to Live Heatmap
                </div>
                <div className="grid grid-cols-4 gap-2 font-mono tabular-nums pt-1 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-slate-500 block font-sans">Latency</span>
                    {testResult.latencyMs} ms
                  </div>
                  <div>
                    <span className="text-slate-500 block font-sans">Jitter</span>
                    {testResult.jitterMs} ms
                  </div>
                  <div>
                    <span className="text-slate-500 block font-sans">Download</span>
                    {testResult.downloadMbps} Mbps
                  </div>
                  <div>
                    <span className="text-slate-500 block font-sans">Score</span>
                    {testResult.qualityScore} / 100
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. One-Tap Issue Reporting */}
          <form
            onSubmit={handleReport}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Student Issue Submission</div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-0.5">
                  Report Wi-Fi or Lab Connectivity Issue
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedLoc('BLK-C');
                  setSelectedFloor(2);
                  setCategory('High Latency / Drops');
                  setRoom('ICT Lab 4 (C204)');
                  setDesc('Block C Wi-Fi is bad — ping spikes over 200ms in Lab 4.');
                }}
                className="text-xs text-blue-600 hover:underline cursor-pointer"
              >
                Quick-fill: &ldquo;Block C Wi-Fi is bad&rdquo;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
                >
                  <option value="High Latency / Drops">High Latency / Drops</option>
                  <option value="No Connection">No Connection</option>
                  <option value="Slow Speeds">Slow Speeds</option>
                  <option value="Authentication Failure">Authentication Failure</option>
                  <option value="Lab Equipment / IoT">Lab Equipment / IoT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Room Label (Optional)
                </label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. ICT Lab 4"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Issue Description
              </label>
              <textarea
                rows={2}
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="What connectivity issue are you experiencing?"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">
                Location: <strong>{selectedLoc} · Floor {selectedFloor}</strong>
              </span>
              <button
                type="submit"
                disabled={!desc.trim()}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
              >
                Submit Issue Ticket
              </button>
            </div>

            {submittedTicket && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Logged ticket <strong className="font-mono">{submittedTicket}</strong>. Auto-correlated into NOC incident queue.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('incidents')}
                  className="underline font-semibold cursor-pointer"
                >
                  Track Status →
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Controlled Student AI Assistant */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-[640px]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                <MessageSquare className="w-4 h-4" />
                <span>Campus Student Assistant</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Controlled command & assistance system (Strict privacy boundary)
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="text-[11px] text-slate-500 font-medium">Verified Campus Questions:</div>
              <div className="flex flex-wrap gap-1.5">
                {PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSendMessage(p)}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-blue-500 transition-colors text-left"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    <p>{m.text}</p>
                    {m.action?.type === 'REPORT_ISSUE' && (
                      <button
                        onClick={() => {
                          setSelectedLoc('BLK-C');
                          setSelectedFloor(2);
                          setCategory('High Latency / Drops');
                          setRoom('Block C · Floor 2');
                          setDesc('Reported via Assistant: Wi-Fi problems in Block C.');
                        }}
                        className="mt-2 w-full py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700 cursor-pointer"
                      >
                        Auto-fill Block C Report
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(chatInput);
              }}
              className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about ICT Lab 4, Block C, library hours..."
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
