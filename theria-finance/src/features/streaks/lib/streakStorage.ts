/**
 * Streak-freeze persistence. Freezes are the one part of the streak that can't
 * be derived from records alone — they record a deliberate choice ("protect
 * this day") and a running balance — so they live in localStorage.
 *
 * Everything else about a streak is derived live from logged activity; this
 * module only stores the freeze ledger and hands it to the engine as input.
 */
import { STORAGE_KEYS } from '../../../core/constants/appStorage';

export interface FreezeState {
  /** Freeze tokens the user can still spend. */
  remaining: number;
  /** Day keys (`YYYY-MM-DD`) a freeze has been spent on. */
  frozenDays: string[];
  /**
   * The longest streak we've already granted freezes for, so grants are handed
   * out once per milestone crossed rather than on every render.
   */
  grantedForLongest: number;
}

/** New users start with a small buffer so the mechanic is discoverable. */
export const STARTER_FREEZES = 2;
/** Ceiling on banked freezes — scarcity keeps them meaningful. */
export const MAX_FREEZES = 3;
/** One freeze earned per this many days of best-ever streak. */
export const FREEZE_EARN_INTERVAL = 7;

export const defaultFreezeState = (): FreezeState => ({
  remaining: STARTER_FREEZES,
  frozenDays: [],
  grantedForLongest: 0,
});

const isState = (value: unknown): value is FreezeState =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as FreezeState).remaining === 'number' &&
  Array.isArray((value as FreezeState).frozenDays);

export function readFreezeState(): FreezeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.streakFreezes);
    if (!raw) return defaultFreezeState();
    const parsed = JSON.parse(raw) as unknown;
    if (!isState(parsed)) return defaultFreezeState();
    return {
      remaining: Math.max(0, Math.min(MAX_FREEZES, Math.floor(parsed.remaining))),
      frozenDays: parsed.frozenDays.filter((d) => typeof d === 'string'),
      grantedForLongest:
        typeof parsed.grantedForLongest === 'number' ? parsed.grantedForLongest : 0,
    };
  } catch {
    return defaultFreezeState();
  }
}

/**
 * Fired after any freeze write so every live `useStreak` (nav badge, profile
 * menu, streak screen) re-reads and stays in agreement within the tab.
 */
export const FREEZE_CHANGED_EVENT = 'theria:streak-freezes-changed';

export function writeFreezeState(state: FreezeState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.streakFreezes, JSON.stringify(state));
    window.dispatchEvent(new Event(FREEZE_CHANGED_EVENT));
  } catch {
    /* session-only — non-fatal */
  }
}

/** Content equality — lets subscribers skip needless re-renders. */
export function freezeStateEquals(a: FreezeState, b: FreezeState): boolean {
  return (
    a.remaining === b.remaining &&
    a.grantedForLongest === b.grantedForLongest &&
    a.frozenDays.length === b.frozenDays.length &&
    a.frozenDays.every((d, i) => d === b.frozenDays[i])
  );
}

/**
 * Top up freeze tokens for any new `FREEZE_EARN_INTERVAL` boundary the best-ever
 * streak has crossed. Pure and idempotent: called again with the same longest
 * streak, it returns an unchanged state (same reference) so callers can skip a
 * needless write.
 */
export function grantEarnedFreezes(state: FreezeState, longest: number): FreezeState {
  const earnedBoundary = Math.floor(longest / FREEZE_EARN_INTERVAL) * FREEZE_EARN_INTERVAL;
  if (earnedBoundary <= state.grantedForLongest) return state;

  const newBoundaries =
    (earnedBoundary - state.grantedForLongest) / FREEZE_EARN_INTERVAL;
  const remaining = Math.min(MAX_FREEZES, state.remaining + newBoundaries);
  return { ...state, remaining, grantedForLongest: earnedBoundary };
}

/**
 * Spend one freeze to protect `dayKey`. Returns the same reference (no change)
 * when there is nothing to spend or the day is already protected.
 */
export function spendFreeze(state: FreezeState, dayKey: string): FreezeState {
  if (state.remaining <= 0 || state.frozenDays.includes(dayKey)) return state;
  return {
    ...state,
    remaining: state.remaining - 1,
    frozenDays: [...state.frozenDays, dayKey],
  };
}
