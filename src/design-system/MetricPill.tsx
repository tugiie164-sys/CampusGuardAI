import React from 'react';

interface MetricPillProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  icon?: React.ReactNode;
  status?: 'nominal' | 'warning' | 'critical' | 'neutral';
  subtext?: string;
  className?: string;
}

export const MetricPill: React.FC<MetricPillProps> = ({
  label,
  value,
  unit,
  icon,
  status = 'neutral',
  subtext,
  className = '',
}) => {
  const statusColor = {
    nominal: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    critical: 'text-rose-600 dark:text-rose-400',
    neutral: 'text-slate-900 dark:text-white',
  }[status];

  return (
    <div
      className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
        <span className="truncate font-medium">{label}</span>
        {icon && <span className="shrink-0">{icon}</span>}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`text-lg sm:text-xl font-bold font-mono tracking-tight ${statusColor}`}>
          {value}
        </span>
        {unit && <span className="text-[11px] font-mono text-slate-400 font-medium">{unit}</span>}
      </div>
      {subtext && <div className="text-[10px] text-slate-400 mt-0.5 truncate">{subtext}</div>}
    </div>
  );
};
