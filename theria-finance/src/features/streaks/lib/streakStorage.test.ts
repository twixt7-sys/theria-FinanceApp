import { describe, expect, it } from 'vitest';
import {
  defaultFreezeState,
  grantEarnedFreezes,
  spendFreeze,
  freezeStateEquals,
  MAX_FREEZES,
  STARTER_FREEZES,
} from './streakStorage';

describe('grantEarnedFreezes', () => {
  it('grants nothing below the first interval', () => {
    const s = { ...defaultFreezeState(), remaining: 0 };
    expect(grantEarnedFreezes(s, 6)).toBe(s); // same reference — no change
  });

  it('grants one freeze at each new 7-day boundary', () => {
    const s = { remaining: 0, frozenDays: [], grantedForLongest: 0 };
    const at7 = grantEarnedFreezes(s, 9);
    expect(at7.remaining).toBe(1);
    expect(at7.grantedForLongest).toBe(7);
  });

  it('is idempotent for an unchanged longest streak', () => {
    const s = { remaining: 1, frozenDays: [], grantedForLongest: 7 };
    expect(grantEarnedFreezes(s, 9)).toBe(s);
  });

  it('caps banked freezes at the maximum', () => {
    const s = { remaining: 0, frozenDays: [], grantedForLongest: 0 };
    const at30 = grantEarnedFreezes(s, 30); // crossed 7,14,21,28 → 4 boundaries
    expect(at30.remaining).toBe(MAX_FREEZES);
  });
});

describe('spendFreeze', () => {
  it('spends a token and records the protected day', () => {
    const s = defaultFreezeState();
    const next = spendFreeze(s, '2026-08-20');
    expect(next.remaining).toBe(STARTER_FREEZES - 1);
    expect(next.frozenDays).toContain('2026-08-20');
  });

  it('refuses when no tokens remain', () => {
    const s = { remaining: 0, frozenDays: [], grantedForLongest: 0 };
    expect(spendFreeze(s, '2026-08-20')).toBe(s);
  });

  it('refuses to double-protect the same day', () => {
    const s = { remaining: 2, frozenDays: ['2026-08-20'], grantedForLongest: 0 };
    expect(spendFreeze(s, '2026-08-20')).toBe(s);
  });
});

describe('freezeStateEquals', () => {
  it('compares by content, not reference', () => {
    const a = { remaining: 1, frozenDays: ['x'], grantedForLongest: 7 };
    const b = { remaining: 1, frozenDays: ['x'], grantedForLongest: 7 };
    expect(freezeStateEquals(a, b)).toBe(true);
    expect(freezeStateEquals(a, { ...b, remaining: 2 })).toBe(false);
  });
});
