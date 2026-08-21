/**
 * `useStreak` — the app-wide entry point for streak data. It joins the user's
 * real logged activity (from the data layer) with the freeze ledger (from
 * localStorage), runs the pure engine, and exposes the summary plus the one
 * action that mutates freeze state (spending a freeze to rescue a streak).
 *
 * Every surface that shows a streak — the nav badge, the profile menu, the
 * profile and streak screens — reads it from here, so they can never disagree.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useData } from '../../../core/state/DataContext';
import { computeStreak, type StreakSummary } from './streakEngine';
import {
  grantEarnedFreezes,
  readFreezeState,
  spendFreeze as spendFreezeState,
  writeFreezeState,
  freezeStateEquals,
  FREEZE_CHANGED_EVENT,
  MAX_FREEZES,
  type FreezeState,
} from './streakStorage';

export interface UseStreakResult extends StreakSummary {
  /** Freeze tokens available to spend. */
  freezesRemaining: number;
  /** Ceiling on banked freezes. */
  freezesMax: number;
  /** True when a freeze exists and there is a gap it could rescue. */
  canRepair: boolean;
  /** Spend a freeze on `repairableDay` to reconnect a broken streak. */
  repairStreak: () => void;
}

export function useStreak(): UseStreakResult {
  const { records } = useData();
  const [freezes, setFreezes] = useState<FreezeState>(() => readFreezeState());

  // Every distinct day the user logged a record — the raw streak signal.
  const activeDays = useMemo(() => {
    const set = new Set<string>();
    for (const r of records) if (r.date) set.add(r.date.slice(0, 10));
    return set;
  }, [records]);

  const summary = useMemo(
    () => computeStreak({ activeDays, frozenDays: freezes.frozenDays }),
    [activeDays, freezes.frozenDays],
  );

  // Hand out freezes earned by crossing new streak milestones. Idempotent:
  // grantEarnedFreezes returns the same state when nothing new is owed, so this
  // settles after one pass and never loops.
  useEffect(() => {
    setFreezes((prev) => {
      const next = grantEarnedFreezes(prev, summary.longest);
      if (next === prev) return prev;
      writeFreezeState(next);
      return next;
    });
  }, [summary.longest]);

  // Keep every mounted instance (nav badge, profile menu, this screen) in sync
  // when one of them spends or earns a freeze, and across tabs via 'storage'.
  useEffect(() => {
    const sync = () =>
      setFreezes((prev) => {
        const next = readFreezeState();
        return freezeStateEquals(prev, next) ? prev : next;
      });
    window.addEventListener(FREEZE_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(FREEZE_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const repairStreak = useCallback(() => {
    setFreezes((prev) => {
      if (!summary.repairableDay) return prev;
      const next = spendFreezeState(prev, summary.repairableDay);
      if (next === prev) return prev;
      writeFreezeState(next);
      return next;
    });
  }, [summary.repairableDay]);

  return {
    ...summary,
    freezesRemaining: freezes.remaining,
    freezesMax: MAX_FREEZES,
    canRepair: summary.repairableDay !== null && freezes.remaining > 0,
    repairStreak,
  };
}
