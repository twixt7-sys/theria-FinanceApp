import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { STORAGE_KEYS } from '../constants/appStorage';
import { CLOUD_WRITE_EVENT } from '../data/firestoreRepository';
import type { TheriaRepository } from '../data/repository';
import {
  readJsonFromLocalStorage,
  writeJsonToLocalStorage,
} from '../lib/localStorageJson';
import { deriveSyncState, type SyncStatus } from './syncStatus';

/** How often, at most, to re-confirm the cloud is caught up while signed in. */
const HEARTBEAT_MS = 30_000;
/** Collapses a burst of writes into one flush instead of one per keystroke. */
const WRITE_DEBOUNCE_MS = 800;

interface SyncStatusContextType extends SyncStatus {
  /** Force a flush now — the manual "sync" affordance. No-op for guests/offline. */
  syncNow: () => void;
}

const SyncStatusContext = createContext<SyncStatusContextType | undefined>(undefined);

const isOnline = () =>
  typeof navigator === 'undefined' || navigator.onLine !== false;

/**
 * Watches the health of cloud sync for the signed-in user and drives the
 * status indicator. It does not move data itself — Firestore's offline cache
 * already persists every write and flushes it on reconnect. This layer's job
 * is to (a) confirm those writes land, on a heartbeat and whenever one is
 * issued, and (b) surface online/offline and "last synced" so the guarantee is
 * visible rather than implied.
 *
 * `repository` is the cloud store when signed in, and null for a guest — in
 * which case the state is simply `disabled` ("saved on this device").
 */
export const SyncStatusProvider: React.FC<{
  repository: TheriaRepository | null;
  children: React.ReactNode;
}> = ({ repository, children }) => {
  // Only a store that can flush participates; a guest's local store cannot.
  const canFlush = typeof repository?.flush === 'function';

  const [online, setOnline] = useState<boolean>(isOnline);
  const [pending, setPending] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(() =>
    readJsonFromLocalStorage<number>(STORAGE_KEYS.lastCloudSyncAt),
  );

  // A single in-flight flush at a time; extra requests coalesce onto it.
  const flushing = useRef(false);
  const rerun = useRef(false);

  const runFlush = useCallback(async () => {
    if (!canFlush || !repository?.flush) return;
    if (flushing.current) {
      // Something changed mid-flush; make sure we confirm again afterwards.
      rerun.current = true;
      return;
    }
    flushing.current = true;
    try {
      do {
        rerun.current = false;
        // Resolves only once the backend has every queued write; offline it
        // stays pending, so `pending`/`offline` remain until reconnect.
        await repository.flush();
        if (isOnline()) {
          const now = Date.now();
          setLastSyncedAt(now);
          writeJsonToLocalStorage(STORAGE_KEYS.lastCloudSyncAt, now);
          setPending(false);
        }
      } while (rerun.current);
    } catch {
      // A failed flush is not fatal; the heartbeat will try again.
    } finally {
      flushing.current = false;
    }
  }, [canFlush, repository]);

  const syncNow = useCallback(() => {
    if (canFlush && isOnline()) void runFlush();
  }, [canFlush, runFlush]);

  // Track connectivity.
  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      // Reconnected — push whatever queued up while offline right away.
      if (canFlush) void runFlush();
    };
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [canFlush, runFlush]);

  // React to writes: mark pending, then debounce a confirming flush.
  useEffect(() => {
    if (!canFlush) return;
    let timer: number | undefined;
    const onWrite = () => {
      setPending(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (isOnline()) void runFlush();
      }, WRITE_DEBOUNCE_MS);
    };
    window.addEventListener(CLOUD_WRITE_EVENT, onWrite);
    return () => {
      window.removeEventListener(CLOUD_WRITE_EVENT, onWrite);
      window.clearTimeout(timer);
    };
  }, [canFlush, runFlush]);

  // Periodic heartbeat: re-confirm the cloud is caught up and refresh the
  // "last synced" stamp. This is the "periodically saves when there's
  // internet" guarantee, made continuous rather than write-triggered only.
  useEffect(() => {
    if (!canFlush) return;
    void runFlush(); // confirm once on sign-in / mount
    const id = window.setInterval(() => {
      if (isOnline()) void runFlush();
    }, HEARTBEAT_MS);
    return () => window.clearInterval(id);
  }, [canFlush, runFlush]);

  const value = useMemo<SyncStatusContextType>(() => {
    const state = deriveSyncState({ enabled: canFlush, online, pending });
    return { state, online, pending, lastSyncedAt, syncNow };
  }, [canFlush, online, pending, lastSyncedAt, syncNow]);

  return <SyncStatusContext.Provider value={value}>{children}</SyncStatusContext.Provider>;
};

export const useSyncStatus = (): SyncStatusContextType => {
  const context = useContext(SyncStatusContext);
  if (!context) {
    throw new Error('useSyncStatus must be used within SyncStatusProvider');
  }
  return context;
};
