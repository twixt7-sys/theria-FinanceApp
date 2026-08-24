import { describe, expect, it } from 'vitest';
import {
  deriveSyncState,
  formatLastSynced,
  syncStateLabel,
  type SyncStatus,
} from './syncStatus';

describe('deriveSyncState', () => {
  it('is disabled for a guest regardless of connection', () => {
    expect(deriveSyncState({ enabled: false, online: true, pending: true })).toBe('disabled');
    expect(deriveSyncState({ enabled: false, online: false, pending: false })).toBe('disabled');
  });

  it('is offline when signed in without a connection, even with pending writes', () => {
    expect(deriveSyncState({ enabled: true, online: false, pending: true })).toBe('offline');
  });

  it('is syncing when online with writes still pending', () => {
    expect(deriveSyncState({ enabled: true, online: true, pending: true })).toBe('syncing');
  });

  it('is synced when online with nothing pending', () => {
    expect(deriveSyncState({ enabled: true, online: true, pending: false })).toBe('synced');
  });
});

describe('formatLastSynced', () => {
  const now = 1_000_000_000_000;

  it('reports never as "not yet"', () => {
    expect(formatLastSynced(null, now)).toBe('not yet');
  });

  it('reports recent flushes as "just now"', () => {
    expect(formatLastSynced(now - 10_000, now)).toBe('just now');
  });

  it('rolls up into minutes, hours and days', () => {
    expect(formatLastSynced(now - 5 * 60_000, now)).toBe('5m ago');
    expect(formatLastSynced(now - 3 * 3_600_000, now)).toBe('3h ago');
    expect(formatLastSynced(now - 2 * 86_400_000, now)).toBe('2d ago');
  });

  it('never shows a negative time from a clock skew', () => {
    expect(formatLastSynced(now + 5_000, now)).toBe('just now');
  });
});

describe('syncStateLabel', () => {
  const base: SyncStatus = { state: 'synced', online: true, pending: false, lastSyncedAt: null };
  const now = 1_000_000_000_000;

  it('names the guest state', () => {
    expect(syncStateLabel({ ...base, state: 'disabled' }, now)).toBe('Saved on this device');
  });

  it('distinguishes offline-with-pending from plain offline', () => {
    expect(syncStateLabel({ ...base, state: 'offline', pending: true }, now)).toBe(
      'Offline — will sync later',
    );
    expect(syncStateLabel({ ...base, state: 'offline', pending: false }, now)).toBe('Offline');
  });

  it('shows a relative time once a flush has landed', () => {
    expect(
      syncStateLabel({ ...base, state: 'synced', lastSyncedAt: now - 60_000 }, now),
    ).toBe('Synced 1m ago');
  });
});
