import React, { useState } from 'react';
import {
  AlertTriangle,
  Send,
  Camera,
  MapPin,
  CheckCircle2,
  CloudOff,
  Clock,
  Sparkles,
  WifiOff,
} from 'lucide-react';
import { useCampusStore } from '../../store/useCampusStore';
import { CAMPUS_LOCATIONS } from '../../../shared/locations';
import { Button } from '../../design-system/Button';
import { Badge } from '../../design-system/Badge';

const CATEGORIES = [
  { id: 'High Latency / Drops', label: 'Drops / Slow', icon: AlertTriangle },
  { id: 'No Connection', label: 'No Wi-Fi Signal', icon: WifiOff },
  { id: 'Slow Speeds', label: 'Very Slow Video', icon: Clock },
  { id: 'Authentication Failure', label: 'Login / Eduroam', icon: Sparkles },
  { id: 'Lab Equipment / IoT', label: 'Lab PC / Hardware', icon: AlertTriangle },
] as const;

export const MobileReportView: React.FC = () => {
  const {
    submitStudentReport,
    enqueueOfflineReport,
    isOnline,
    triggerHaptic,
    setMobileActiveTab,
  } = useCampusStore();

  const [category, setCategory] = useState<string>('High Latency / Drops');
  const [selectedLoc, setSelectedLoc] = useState('BLK-C');
  const [selectedFloor, setSelectedFloor] = useState(2);
  const [room, setRoom] = useState('ICT Lab 4 (C204)');
  const [description, setDescription] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    incidentNumber: string;
    correlationExplanation?: string;
  } | null>(null);

  const currentLocation = CAMPUS_LOCATIONS.find((l) => l.id === selectedLoc) || CAMPUS_LOCATIONS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    triggerHaptic();
    setIsSubmitting(true);

    const payload = {
      category: category as any,
      locationId: selectedLoc,
      floor: selectedFloor,
      roomLabel: room.trim() || undefined,
      description: description.trim(),
    };

    try {
      if (!isOnline) {
        enqueueOfflineReport(payload);
        setSubmittedTicket({
          incidentNumber: 'QUEUED_OFFLINE',
          correlationExplanation: 'Saved to local queue. Will sync automatically once online.',
        });
        setDescription('');
        return;
      }

      const res = await submitStudentReport(payload);
      if (res?.incident?.incidentNumber) {
        setSubmittedTicket({
          incidentNumber: res.incident.incidentNumber,
          correlationExplanation: res.incident.correlationExplanation,
        });
        setDescription('');
      } else {
        setSubmittedTicket({
          incidentNumber: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
        });
        setDescription('');
      }
      triggerHaptic();
    } catch {
      enqueueOfflineReport(payload);
      setSubmittedTicket({
        incidentNumber: 'QUEUED_OFFLINE',
        correlationExplanation: 'Server connection timeout. Queued for background sync.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateClick = (text: string) => {
    triggerHaptic();
    setDescription(text);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header Info */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Report Connectivity Issue
          </h2>
          <p className="text-xs text-slate-500">Fast 30-second mobile submission</p>
        </div>
        {!isOnline && (
          <span className="flex items-center gap-1 text-[11px] font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200">
            <CloudOff className="w-3 h-3" /> Offline Queue Active
          </span>
        )}
      </div>

      {/* Success State Notification */}
      {submittedTicket && (
        <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Ticket Dispatched to ICT Operations
              </div>
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                Ticket #{submittedTicket.incidentNumber}
              </div>
              {submittedTicket.correlationExplanation && (
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {submittedTicket.correlationExplanation}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                triggerHaptic();
                setMobileActiveTab('tickets');
              }}
              className="flex-1 rounded-xl text-xs"
            >
              Track in My Tickets
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSubmittedTicket(null)}
              className="rounded-xl text-xs"
            >
              Submit Another
            </Button>
          </div>
        </div>
      )}

      {/* Report Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Category Pills */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3.5 space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            What problem are you experiencing?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setCategory(cat.id);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Location & Room */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3.5 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Location (Privacy-Safe Building & Floor)</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Building</label>
              <select
                value={selectedLoc}
                onChange={(e) => {
                  setSelectedLoc(e.target.value);
                  const loc = CAMPUS_LOCATIONS.find((l) => l.id === e.target.value);
                  if (loc && !loc.floors.includes(selectedFloor)) {
                    setSelectedFloor(loc.floors[0]);
                  }
                }}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-2 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Floor</label>
              <div className="flex gap-1">
                {currentLocation.floors.map((fl) => (
                  <button
                    key={fl}
                    type="button"
                    onClick={() => setSelectedFloor(fl)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer ${
                      selectedFloor === fl
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    F{fl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Room / Area Description</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. ICT Lab 4 (C204) or Study Pod 3"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Description & Quick Templates */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Details
            </label>
            <span className="text-[10px] text-slate-400">Quick taps below</span>
          </div>

          {/* Quick template chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              'Wi-Fi keeps dropping during lecture',
              'Zoom calls freezing frequently',
              'Cannot authenticate with eduroam credentials',
              'Lab PCs cannot reach campus gateway',
            ].map((tmpl) => (
              <button
                key={tmpl}
                type="button"
                onClick={() => handleTemplateClick(tmpl)}
                className="text-[10px] py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors cursor-pointer text-left"
              >
                + {tmpl}
              </button>
            ))}
          </div>

          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened or how many students are affected..."
            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none"
          />

          {/* Optional Attachment Toggle */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setHasPhoto(!hasPhoto);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                hasPhoto
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{hasPhoto ? 'Screenshot Attached ✓' : 'Attach Screenshot'}</span>
            </button>
            <span className="text-[10px] text-slate-400 font-mono">
              Anonymous Session Tagged
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          isLoading={isSubmitting}
          size="lg"
          className="w-full py-3.5 rounded-2xl shadow-md text-sm font-semibold"
          icon={<Send className="w-4 h-4" />}
        >
          {isSubmitting ? 'Dispatching...' : 'Submit Incident Report'}
        </Button>
      </form>
    </div>
  );
};
