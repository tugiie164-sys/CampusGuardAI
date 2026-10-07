/**
 * CampusGuard AI Design System Tokens
 * Unified design tokens following Apple Human Interface Guidelines (HIG):
 * Subdued surfaces, crisp typography, translucent materials, and tactile interactions.
 */

export const DS = {
  // Border radius scale
  radii: {
    xs: 'rounded-md',
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    full: 'rounded-full',
  },
  // Apple-inspired backdrop blur and surface materials
  surfaces: {
    glassLight: 'bg-white/85 backdrop-blur-xl border border-slate-200/80 shadow-sm',
    glassDark: 'dark:bg-slate-900/85 dark:backdrop-blur-xl dark:border-slate-800/80 dark:shadow-md',
    cardLight: 'bg-white border border-slate-200/80 shadow-xs',
    cardDark: 'dark:bg-slate-900 dark:border-slate-800/80',
    elevatedLight: 'bg-white shadow-lg border border-slate-200/60',
    elevatedDark: 'dark:bg-slate-900 dark:shadow-2xl dark:border-slate-800/60',
    subtle: 'bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/40',
  },
  // Typography styling
  typography: {
    fontSans: "font-['Plus_Jakarta_Sans',system-ui,sans-serif]",
    fontMono: "font-['JetBrains_Mono',monospace] tabular-nums",
  },
  // Semantic colors
  colors: {
    primary: 'blue',
    measured: 'emerald',
    simulated: 'amber',
    critical: 'rose',
    warning: 'amber',
    success: 'emerald',
    info: 'blue',
  },
} as const;
