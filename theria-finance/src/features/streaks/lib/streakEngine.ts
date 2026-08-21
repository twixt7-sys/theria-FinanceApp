/**
 * Streak engine — the single, pure source of truth for every streak number the
 * app shows. Nothing here touches React, storage, or the DOM: it takes the raw
 * set of days the user logged activity (plus any days protected by a freeze)
 * and derives the whole picture. That keeps the top-nav badge, the profile
 * menu, the profile screen and the streak screen from ever disagreeing, and
 * makes the rules trivially unit-testable.
 *
 * A "day" is a local calendar day identified by its `YYYY-MM-DD` key — the same
 * shape records already store in `LedgerRecord.date`.
 */

const MS_PER_DAY = 86_400_000;

/** `YYYY-MM-DD` for a Date, matching how records stamp their `date`. */
export const dayKey = (date: Date): string => date.toISOString().slice(0, 10);

/** Today's key from a clock (injectable so tests are deterministic). */
export const todayKey = (now: Date = new Date()): string => dayKey(now);

/** A stable midday Date for a key — safe for labels and weekday math. */
export const keyToDate = (key: string): Date => new Date(`${key}T00:00:00Z`);

/** Shift a day key by whole days (negative = into the past). */
export const shiftKey = (key: string, deltaDays: number): string =>
  dayKey(new Date(keyToDate(key).getTime() + deltaDays * MS_PER_DAY));

/** UTC day-of-week for a key: 0 = Sunday … 6 = Saturday. */
const dowOf = (key: string): number => keyToDate(key).getUTCDay();

/** Monday-of-week for a key (weeks run Mon→Sun). */
const mondayOf = (key: string): string => shiftKey(key, -((dowOf(key) + 6) % 7));

export type StreakStatus = 'logged-today' | 'at-risk' | 'inactive';

export interface Milestone {
  days: number;
  label: string;
}

/** The rungs a streak climbs — benchmarked against habit apps (Duolingo, Calm). */
export const MILESTONES: readonly Milestone[] = [
  { days: 3, label: 'Spark' },
  { days: 7, label: 'One week' },
  { days: 14, label: 'Fortnight' },
  { days: 30, label: 'One month' },
  { days: 60, label: 'Two months' },
  { days: 100, label: 'Centurion' },
  { days: 180, label: 'Half year' },
  { days: 365, label: 'Year of Theria' },
] as const;

export interface DayCell {
  key: string;
  date: Date;
  active: boolean;
  frozen: boolean;
  isToday: boolean;
  isFuture: boolean;
}

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

export interface WeekDay extends DayCell {
  /** Single-letter Mon…Sun label. */
  label: string;
}

export interface StreakSummary {
  /** Consecutive days ending today, or ending yesterday while today is pending. */
  current: number;
  /** Best run ever recorded. */
  longest: number;
  /** Distinct days the user actually logged (freezes excluded). */
  totalDaysLogged: number;
  status: StreakStatus;
  loggedToday: boolean;
  /** Streak is alive off yesterday but today has no activity yet. */
  atRisk: boolean;
  /** First milestone still ahead of the current streak, or null past the top. */
  nextMilestone: Milestone | null;
  /** Highest milestone already cleared by the current streak. */
  currentMilestone: Milestone | null;
  /** 0…1 progress from the last cleared milestone to the next. */
  milestoneProgress: number;
  daysToNextMilestone: number;
  /** Milestones the best-ever run has unlocked. */
  reachedMilestones: Milestone[];
  /** This calendar week, Mon→Sun. */
  week: WeekDay[];
  /** Recent weeks as a Mon→Sun grid for the heatmap. */
  heatmap: DayCell[][];
  /** Days currently protected by a freeze. */
  frozenDaysUsed: number;
  /**
   * The single past day a freeze could bridge to rescue a broken streak
   * (yesterday, when it is the only gap between a prior run and now). Null when
   * nothing needs saving.
   */
  repairableDay: string | null;
}

export interface ComputeStreakInput {
  /** Day keys the user logged activity on (`YYYY-MM-DD`). */
  activeDays: Iterable<string>;
  /** Day keys protected by a spent freeze. */
  frozenDays?: Iterable<string>;
  /** Clock, injectable for tests. */
  now?: Date;
  /** Weeks of history for the heatmap grid. */
  heatmapWeeks?: number;
}

const clampKey = (raw: string) => raw.slice(0, 10);

/**
 * Derive the complete streak picture from logged days and freezes.
 */
export function computeStreak({
  activeDays,
  frozenDays = [],
  now = new Date(),
  heatmapWeeks = 5,
}: ComputeStreakInput): StreakSummary {
  const active = new Set<string>();
  for (const d of activeDays) active.add(clampKey(d));
  const frozen = new Set<string>();
  for (const d of frozenDays) frozen.add(clampKey(d));

  const held = (key: string) => active.has(key) || frozen.has(key);
  const today = todayKey(now);
  const yesterday = shiftKey(today, -1);
  const loggedToday = active.has(today);

  // Current run: anchor on today if logged, otherwise on yesterday (grace
  // period — the streak survives until midnight). Walk backwards while each
  // day is held (logged or frozen).
  let current = 0;
  const anchor = loggedToday ? today : yesterday;
  if (held(anchor)) {
    let cursor = anchor;
    while (held(cursor)) {
      current += 1;
      cursor = shiftKey(cursor, -1);
    }
  }
  const atRisk = !loggedToday && current > 0;
  const status: StreakStatus = loggedToday ? 'logged-today' : current > 0 ? 'at-risk' : 'inactive';

  // Longest run across every held day, sorted chronologically.
  const heldDays = [...new Set([...active, ...frozen])].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const key of heldDays) {
    run = prev !== null && shiftKey(prev, 1) === key ? run + 1 : 1;
    if (run > longest) longest = run;
    prev = key;
  }
  longest = Math.max(longest, current);

  // Milestone maths off the *current* run — that is what the user is chasing.
  const currentMilestone = [...MILESTONES].reverse().find((m) => current >= m.days) ?? null;
  const nextMilestone = MILESTONES.find((m) => m.days > current) ?? null;
  const floor = currentMilestone?.days ?? 0;
  const ceil = nextMilestone?.days ?? floor;
  const milestoneProgress = nextMilestone ? (current - floor) / (ceil - floor) : 1;
  const daysToNextMilestone = nextMilestone ? nextMilestone.days - current : 0;
  const reachedMilestones = MILESTONES.filter((m) => longest >= m.days);

  // A freeze can only rescue the streak when yesterday is the sole gap between
  // a still-standing prior run and now.
  const repairableDay =
    !held(yesterday) && held(shiftKey(yesterday, -1)) ? yesterday : null;

  // Week strip (Mon→Sun) for the current calendar week.
  const weekStart = mondayOf(today);
  const week: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const key = shiftKey(weekStart, i);
    return {
      key,
      date: keyToDate(key),
      active: active.has(key),
      frozen: frozen.has(key),
      isToday: key === today,
      isFuture: key > today,
      label: WEEKDAY_LABELS[i],
    };
  });

  // Heatmap grid: `heatmapWeeks` rows of Mon→Sun ending with the current week.
  const gridStart = shiftKey(weekStart, -(heatmapWeeks - 1) * 7);
  const heatmap: DayCell[][] = Array.from({ length: heatmapWeeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const key = shiftKey(gridStart, w * 7 + d);
      return {
        key,
        date: keyToDate(key),
        active: active.has(key),
        frozen: frozen.has(key),
        isToday: key === today,
        isFuture: key > today,
      };
    }),
  );

  return {
    current,
    longest,
    totalDaysLogged: active.size,
    status,
    loggedToday,
    atRisk,
    nextMilestone,
    currentMilestone,
    milestoneProgress,
    daysToNextMilestone,
    reachedMilestones,
    week,
    heatmap,
    frozenDaysUsed: frozen.size,
    repairableDay,
  };
}
