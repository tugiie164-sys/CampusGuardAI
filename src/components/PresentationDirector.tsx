import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { useCampusStore } from '../store/useCampusStore';
import { IncidentStatus, UserRole } from '../../shared/types';

const PRESENTATION_STAGES = [
  {
    step: 1,
    time: '0:00 – 0:30',
    title: '1. Nominal Campus Baseline',
    desc: 'Observatory monitors 6 academic complexes. Dual data layer separation clearly active.',
    action: 'NORMAL',
  },
  {
    step: 2,
    time: '0:30 – 1:00',
    title: '2. AP Failure & Student Report Injection',
    desc: 'AP-ICTLab4-C204 goes offline. Measured probe and student complaints converge on Block C.',
    action: 'AP_FAILURE',
  },
  {
    step: 3,
    time: '1:00 – 1:30',
    title: '3. Anomaly Detection & AI Correlation',
    desc: 'Z-score deviation + root cause hypothesis generated. Correlated P1 ticket opened.',
    action: null,
  },
  {
    step: 4,
    time: '1:30 – 2:10',
    title: '4. Technician Assigns & Investigates',
    desc: 'Role switched to ICT Technician. Audit trail records investigation of PoE switchport.',
    action: null,
  },
  {
    step: 5,
    time: '2:10 – 3:00',
    title: '5. Remediation & Clean Recovery',
    desc: 'PoE power reset applied. Verification probe confirms recovery back to 95/100.',
    action: 'RESET',
  },
];

export const PresentationDirector: React.FC = () => {
  const {
    presentationActive,
    presentationStep,
    presentationTimerSec,
    setPresentationMode,
    triggerScenario,
    resetScenario,
    updateIncidentStatus,
    switchRole,
    incidents,
    setActiveTab,
  } = useCampusStore();

  useEffect(() => {
    if (!presentationActive) return;

    const interval = setInterval(() => {
      useCampusStore.setState((s) => ({
        presentationTimerSec: s.presentationTimerSec + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [presentationActive]);

  if (!presentationActive) return null;

  const currentStage = PRESENTATION_STAGES.find((s) => s.step === presentationStep) || PRESENTATION_STAGES[0];
  const mm = String(Math.floor(presentationTimerSec / 60)).padStart(2, '0');
  const ss = String(presentationTimerSec % 60).padStart(2, '0');

  const handleStepJump = async (step: number) => {
    useCampusStore.setState({ presentationStep: step });
    if (step === 1) {
      await resetScenario();
      setActiveTab('dashboard');
    } else if (step === 2) {
      await triggerScenario('AP_FAILURE');
      setActiveTab('heatmap');
    } else if (step === 3) {
      setActiveTab('incidents');
    } else if (step === 4) {
      await switchRole(UserRole.ICT_TECHNICIAN);
      const topInc = incidents[0];
      if (topInc) {
        await updateIncidentStatus(topInc.id, IncidentStatus.INVESTIGATING, 'Field tech evaluating PoE switchport in IDF C101.');
      }
      setActiveTab('incidents');
    } else if (step === 5) {
      const topInc = incidents[0];
      if (topInc) {
        await updateIncidentStatus(topInc.id, IncidentStatus.RESOLVED, 'PoE port power cycled and 5GHz channel plan restored.', true);
      }
      await resetScenario();
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="bg-slate-900 border-b border-blue-900/60 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600 font-mono text-xs font-semibold tabular-nums">
            <Clock className="w-3.5 h-3.5" />
            <span>{mm}:{ss} / 03:00</span>
          </div>
          <div>
            <div className="text-xs text-blue-300 font-medium">
              Guided 3-Minute Presentation Sequence · Stage {presentationStep} of 5
            </div>
            <div className="text-sm font-semibold">{currentStage.title}</div>
            <div className="text-xs text-slate-300 mt-0.5">{currentStage.desc}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
            {PRESENTATION_STAGES.map((s) => (
              <button
                key={s.step}
                onClick={() => handleStepJump(s.step)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  presentationStep === s.step ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                S{s.step}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleStepJump(Math.min(5, presentationStep + 1))}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white transition-colors"
          >
            <span>Next Stage</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setPresentationMode(false);
              resetScenario();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Exit Presentation Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
