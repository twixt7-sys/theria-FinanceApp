/**
 * Visual language for the streak module. The flame/orange identity is constant,
 * but tone shifts with status: confident when today is done, an amber warning
 * when the streak is at risk, a cooled ember when there's nothing running. One
 * place so every component reads the same story.
 */
import { Flame, Snowflake, Sparkles, type LucideIcon } from '@/shared/icons';
import type { StreakStatus } from './streakEngine';

export interface StreakTheme {
  /** Short status word for pills and headers. */
  label: string;
  /** Icon that rides with the status. */
  icon: LucideIcon;
  /** Hex ramp for the progress ring gradient (from → to). */
  ringFrom: string;
  ringTo: string;
  /** Tailwind classes for the flame glyph / accent text. */
  accentText: string;
  /** Soft tinted surface (chips, icon seats). */
  softBg: string;
  /** Border tint for framed elements. */
  softBorder: string;
  /** Solid accent used for filled cells / the active dot. */
  solid: string;
}

/**
 * The stable streak signature. Historical activity (heatmap, week strip) and
 * milestone fills always use this orange — a logged day shouldn't recolor just
 * because today's streak lapsed. Status tone (below) is reserved for the hero,
 * Terry and the nav badge, where "at risk" / "resting" actually mean something.
 */
export const STREAK_ACCENT = {
  solid: 'bg-orange-500',
  text: 'text-orange-600 dark:text-orange-400',
  softBg: 'bg-orange-500/10',
  softBorder: 'border-orange-500/40',
} as const;

export const STREAK_THEME: Record<StreakStatus, StreakTheme> = {
  'logged-today': {
    label: 'On fire',
    icon: Flame,
    ringFrom: '#FB923C',
    ringTo: '#F97316',
    accentText: 'text-orange-600 dark:text-orange-400',
    softBg: 'bg-orange-500/10',
    softBorder: 'border-orange-500/30',
    solid: 'bg-orange-500',
  },
  'at-risk': {
    label: 'At risk',
    icon: Sparkles,
    ringFrom: '#FBBF24',
    ringTo: '#F59E0B',
    accentText: 'text-amber-600 dark:text-amber-400',
    softBg: 'bg-amber-500/10',
    softBorder: 'border-amber-500/30',
    solid: 'bg-amber-500',
  },
  inactive: {
    label: 'Resting',
    icon: Snowflake,
    ringFrom: '#94A3B8',
    ringTo: '#64748B',
    accentText: 'text-slate-500 dark:text-slate-400',
    softBg: 'bg-slate-500/10',
    softBorder: 'border-slate-500/30',
    solid: 'bg-slate-400',
  },
};

/** Terry's mood mapped from streak status. */
export const streakMood = (status: StreakStatus) =>
  status === 'logged-today' ? 'happy' : status === 'at-risk' ? 'concerned' : 'neutral';
