import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  glass?: boolean;
  className?: string;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  glass = false,
  className = '',
  bodyClassName = 'p-5 sm:p-6',
}) => {
  const surfaceClass = glass
    ? 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80'
    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80';

  return (
    <div className={`rounded-2xl shadow-xs overflow-hidden transition-all ${surfaceClass} ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="px-5 py-4 sm:px-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      <div className={bodyClassName}>{children}</div>

      {footer && (
        <div className="px-5 py-3 sm:px-6 bg-slate-50/60 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};
