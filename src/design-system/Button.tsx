import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'subtle' | 'destructive' | 'glass';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    xs: 'px-2 py-1 text-xs rounded-lg gap-1.5',
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-2 font-medium',
    md: 'px-4 py-2 text-sm rounded-xl gap-2 font-medium',
    lg: 'px-5 py-2.5 text-base rounded-2xl gap-2.5 font-semibold',
  }[size];

  const variantStyles = {
    primary:
      'bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white shadow-sm hover:shadow transition-all duration-150',
    secondary:
      'bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all duration-150',
    outline:
      'border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] text-slate-800 dark:text-slate-200 transition-all duration-150',
    subtle:
      'bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-all duration-150',
    destructive:
      'bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white shadow-sm transition-all duration-150',
    glass:
      'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900 text-slate-900 dark:text-white transition-all duration-150',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : icon ? <span className="shrink-0">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
};
