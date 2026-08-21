import { describe, expect, it } from 'vitest';
import { computeStreak, shiftKey, MILESTONES } from './streakEngine';

/** Fixed "now" so every case is deterministic. */
const NOW = new Date('2026-08-21T12:00:00Z');
const TODAY = '2026-08-21';
const day = (delta: number) => shiftKey(TODAY, delta);

/** Build the last `n` consecutive days ending `endDelta` days from today. */
const run = (n: number, endDelta = 0) =>
  Array.from({ length: n }, (_, i) => day(endDelta - i));

describe('computeStreak', () => {
  it('reports an inactive streak when nothing is logged', () => {
    const s = computeStreak({ activeDays: [], now: NOW });
    expect(s.current).toBe(0);
    expect(s.longest).toBe(0);
    expect(s.status).toBe('inactive');
    expect(s.loggedToday).toBe(false);
    expect(s.atRisk).toBe(false);
    expect(s.nextMilestone?.days).toBe(3);
  });

  it('counts today plus consecutive prior days', () => {
    const s = computeStreak({ activeDays: run(7), now: NOW });
    expect(s.current).toBe(7);
    expect(s.longest).toBe(7);
    expect(s.status).toBe('logged-today');
    expect(s.loggedToday).toBe(true);
    expect(s.totalDaysLogged).toBe(7);
  });

  it('keeps the streak alive but flags at-risk when today is pending', () => {
    // Logged through yesterday, nothing today yet.
    const s = computeStreak({ activeDays: run(4, -1), now: NOW });
    expect(s.current).toBe(4);
    expect(s.atRisk).toBe(true);
    expect(s.status).toBe('at-risk');
    expect(s.loggedToday).toBe(false);
  });

  it('breaks the streak once two days are missed', () => {
    // Last activity was the day before yesterday.
    const s = computeStreak({ activeDays: run(5, -2), now: NOW });
    expect(s.current).toBe(0);
    expect(s.status).toBe('inactive');
    // ...but the best run ever is still remembered.
    expect(s.longest).toBe(5);
  });

  it('deduplicates multiple logs on the same day', () => {
    const s = computeStreak({ activeDays: [TODAY, TODAY, day(-1), day(-1)], now: NOW });
    expect(s.current).toBe(2);
    expect(s.totalDaysLogged).toBe(2);
  });

  it('tracks the longest run independent of the current one', () => {
    const past = run(10, -20); // a 10-day run that ended weeks ago
    const s = computeStreak({ activeDays: [...past, ...run(3)], now: NOW });
    expect(s.current).toBe(3);
    expect(s.longest).toBe(10);
  });

  it('bridges a gap with a frozen day', () => {
    // Logged today and two days ago; yesterday missing but frozen.
    const s = computeStreak({
      activeDays: [TODAY, day(-2), day(-3)],
      frozenDays: [day(-1)],
      now: NOW,
    });
    expect(s.current).toBe(4);
    expect(s.frozenDaysUsed).toBe(1);
    // Freezes do not inflate the count of days actually logged.
    expect(s.totalDaysLogged).toBe(3);
  });

  it('surfaces yesterday as repairable when it is the only gap', () => {
    // Streak through the day before yesterday, gap yesterday, nothing today.
    const s = computeStreak({ activeDays: run(3, -2), now: NOW });
    expect(s.repairableDay).toBe(day(-1));
    expect(s.current).toBe(0);
  });

  it('offers no repair when there is no prior run to save', () => {
    const s = computeStreak({ activeDays: [day(-5)], now: NOW });
    expect(s.repairableDay).toBeNull();
  });

  it('computes milestone progress toward the next rung', () => {
    const s = computeStreak({ activeDays: run(10), now: NOW });
    expect(s.currentMilestone?.days).toBe(7);
    expect(s.nextMilestone?.days).toBe(14);
    expect(s.daysToNextMilestone).toBe(4);
    // 10 is 3/7 of the way from 7 to 14.
    expect(s.milestoneProgress).toBeCloseTo(3 / 7, 5);
  });

  it('caps milestones at the top rung', () => {
    const top = MILESTONES[MILESTONES.length - 1].days;
    const s = computeStreak({ activeDays: run(top + 5), now: NOW });
    expect(s.nextMilestone).toBeNull();
    expect(s.milestoneProgress).toBe(1);
    expect(s.reachedMilestones).toHaveLength(MILESTONES.length);
  });

  it('builds a Mon→Sun week with today flagged', () => {
    const s = computeStreak({ activeDays: [TODAY], now: NOW });
    expect(s.week).toHaveLength(7);
    const today = s.week.find((d) => d.isToday);
    expect(today?.key).toBe(TODAY);
    expect(today?.active).toBe(true);
    // 2026-08-21 is a Friday → future days (Sat, Sun) should be flagged.
    expect(s.week.filter((d) => d.isFuture).length).toBeGreaterThan(0);
  });

  it('builds a heatmap grid of the requested number of weeks', () => {
    const s = computeStreak({ activeDays: run(3), now: NOW, heatmapWeeks: 4 });
    expect(s.heatmap).toHaveLength(4);
    expect(s.heatmap.every((w) => w.length === 7)).toBe(true);
  });
});
