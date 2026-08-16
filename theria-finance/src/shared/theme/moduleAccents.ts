import type { CSSProperties } from 'react';

/**
 * Single source of truth for per-module accent color, replacing the eight
 * independent color maps that used to live in routes.ts, BottomNav.tsx,
 * AppShell.tsx, FloatingActionButton.tsx, SimpleDashboard.tsx and
 * featureColors.ts (several of which disagreed with each other — e.g. the
 * FAB rendered Streams as blue in its menu and yellow as the direct action).
 *
 * The actual color values live in CSS (`theme.css`, `--accent-<key>` /
 * `-fg` / `-text`) so light/dark mode need no JS branching. This module only
 * knows the *keys* and how to point a component's `--module-accent*`
 * variables at one of them — see the `.module-accent-*` utilities in
 * `index.css`.
 */
export const MODULE_ACCENT_KEYS = [
  'home',
  'records',
  'streams',
  'accounts',
  'savings',
  'budget',
  'analysis',
  'activity',
  'notifications',
  'streak',
  'categories',
] as const;

export type ModuleAccentKey = (typeof MODULE_ACCENT_KEYS)[number];

export const isModuleAccentKey = (value: string): value is ModuleAccentKey =>
  (MODULE_ACCENT_KEYS as readonly string[]).includes(value);

/**
 * Inline style that points the `.module-accent-*` utility classes at one
 * module's palette. Spread onto the element (or an ancestor) that should
 * carry the accent:
 *
 *   <div style={accentVars('records')} className="module-accent-solid" />
 */
export const accentVars = (key: ModuleAccentKey): CSSProperties =>
  ({
    '--module-accent': `var(--accent-${key})`,
    '--module-accent-fg': `var(--accent-${key}-fg)`,
    '--module-accent-text': `var(--accent-${key}-text)`,
  }) as CSSProperties;

/** Raw `var(...)` reference, for consumers that need a color string directly
 *  (recharts fills/strokes, inline SVG, non-DOM contexts). */
export const accentValue = (key: ModuleAccentKey): string => `var(--accent-${key})`;
export const accentFgValue = (key: ModuleAccentKey): string => `var(--accent-${key}-fg)`;
export const accentTextValue = (key: ModuleAccentKey): string => `var(--accent-${key}-text)`;
