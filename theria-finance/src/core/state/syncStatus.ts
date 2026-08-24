/**
 * Pure sync-status logic, kept out of the React layer so it can be reasoned
 * about and tested on its own. The provider in `SyncStatusContext` owns the
 * effects (listeners, timers, Firestore flush); everything here is a function
 * of plain inputs.
 */

export type SyncState =
  /** No cloud store — a guest, saving only to this device. */
  | 'disabled'
  /** Signed in but no connection; writes are queued locally. */
  | 'offline'
  /** Online with writes still on their way to the cloud. */
  | 'syncing'
  /** Online and the cloud is caught up. */
  | 'synced';

export interface SyncStatus {
  state: SyncState;
  /** Whether the browser currently reports a connection. */
  online: boolean;
  /** Whether local writes are still waiting to reach the cloud. */
  pending: boolean;
  /** Epoch ms of the last confirmed cloud flush, or null if never. */
  lastSyncedAt: number | null;
}

export interface SyncStateInputs {
  /** A cloud store exists (the user is signed in). */
  enabled: boolean;
  online: boolean;
  pending: boolean;
}

/**
 * The single source of truth for the badge. Offline outranks pending (there is
 * nothing to do but wait), and with a cloud store and no pending writes the
 * account is, by definition, caught up.
 */
export function deriveSyncState({ enabled, online, pending }: SyncStateInputs): SyncState {
  if (!enabled) return 'disabled';
  if (!online) return 'offline';
  if (pending) return 'syncing';
  return 'synced';
}

/** Short, human phrase for a "last synced" moment — mirrors casual relative time. */
export function formatLastSynced(lastSyncedAt: number | null, now: number = Date.now()): string {
  if (lastSyncedAt == null) return 'not yet';
  const seconds = Math.max(0, Math.round((now - lastSyncedAt) / 1000));
  if (seconds < 45) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

/** One-line label for each state, used by the indicator. */
export function syncStateLabel(status: SyncStatus, now: number = Date.now()): string {
  switch (status.state) {
    case 'disabled':
      return 'Saved on this device';
    case 'offline':
      return status.pending ? 'Offline — will sync later' : 'Offline';
    case 'syncing':
      return 'Syncing…';
    case 'synced':
      return status.lastSyncedAt
        ? `Synced ${formatLastSynced(status.lastSyncedAt, now)}`
        : 'Synced';
  }
}
