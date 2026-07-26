import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createLocalRepository } from '../data/localRepository';
import { createFirestoreRepository } from '../data/firestoreRepository';
import { mergeData, planMigration, remapIds } from '../data/migration';
import type { TheriaRepository } from '../data/repository';
import { emptyData } from '../domain/types';
import type { TheriaData } from '../domain/types';
import { getDb } from '../firebase/firestore';
import { DataProvider } from './DataContext';
import { useAuth } from './AuthContext';
import { MigrationChoiceModal } from '../../shared/components/MigrationChoiceModal';

type Phase = 'ready' | 'migrating' | 'conflict' | 'failed';

/**
 * Chooses where data lives: localStorage while signed out, Firestore once
 * signed in, and carries this device's data into the account on first
 * sign-in. DataProvider is remounted per identity so no state leaks across.
 */
export const SyncedDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const uid = user?.id ?? null;

  const localRepo = useMemo(() => createLocalRepository(), []);
  const cloudRepo = useMemo<TheriaRepository | null>(() => {
    // Signed out, Firestore is never initialised — no cache, no listeners.
    if (!uid) return null;
    const db = getDb();
    return db ? createFirestoreRepository(db, uid) : null;
  }, [uid]);

  const [phase, setPhase] = useState<Phase>('ready');
  const [guestData, setGuestData] = useState<TheriaData | null>(null);
  const [noticeVisible, setNoticeVisible] = useState(false);

  // Notices are transient: they must never sit on top of the header.
  useEffect(() => {
    if (phase !== 'migrating' && phase !== 'failed') {
      setNoticeVisible(false);
      return;
    }
    setNoticeVisible(true);
    if (phase === 'migrating') return;
    const timer = window.setTimeout(() => setNoticeVisible(false), 5000);
    return () => window.clearTimeout(timer);
  }, [phase]);

  /** Guest data is cleared once adopted, so signing in again does not re-import. */
  const clearGuestData = useCallback(
    () => localRepo.replaceAll(emptyData()),
    [localRepo],
  );

  useEffect(() => {
    if (!cloudRepo) {
      setPhase('ready');
      return;
    }

    let cancelled = false;
    setPhase('migrating');

    (async () => {
      try {
        const [local, cloud] = await Promise.all([localRepo.load(), cloudRepo.load()]);
        if (cancelled) return;

        const plan = planMigration(local, cloud);
        if (plan.kind === 'adopt-cloud') {
          setPhase('ready');
          return;
        }
        if (plan.kind === 'upload') {
          await cloudRepo.replaceAll(remapIds(local));
          await clearGuestData();
          if (!cancelled) setPhase('ready');
          return;
        }

        setGuestData(local);
        setPhase('conflict');
      } catch {
        // Keep the local copy untouched so nothing is lost; the user stays
        // signed in and can retry by reloading.
        if (!cancelled) setPhase('failed');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cloudRepo, localRepo, clearGuestData]);

  const resolveConflict = useCallback(
    async (choice: 'merge' | 'keep-cloud') => {
      if (!cloudRepo) return;
      setPhase('migrating');
      try {
        if (choice === 'merge' && guestData) {
          const cloud = await cloudRepo.load();
          await cloudRepo.replaceAll(mergeData(cloud, remapIds(guestData)));
        }
        await clearGuestData();
        setGuestData(null);
        setPhase('ready');
      } catch {
        setPhase('failed');
      }
    },
    [cloudRepo, guestData, clearGuestData],
  );

  // If the cloud could not be reached, keep working against this device
  // rather than showing an empty account.
  const repository = phase === 'failed' ? localRepo : cloudRepo ?? localRepo;

  return (
    <DataProvider key={phase === 'failed' ? 'local-fallback' : uid ?? 'guest'} repository={repository}>
      {noticeVisible && (
        <SyncNotice
          message={
            phase === 'migrating'
              ? 'Bringing your data across…'
              : "Couldn't sync just now — still saving to this device."
          }
          onDismiss={() => setNoticeVisible(false)}
        />
      )}
      <MigrationChoiceModal
        isOpen={phase === 'conflict'}
        onMerge={() => void resolveConflict('merge')}
        onKeepCloud={() => void resolveConflict('keep-cloud')}
      />
      {children}
    </DataProvider>
  );
};

/** Sits above the bottom nav, clear of the header, and can be tapped away. */
const SyncNotice: React.FC<{ message: string; onDismiss: () => void }> = ({
  message,
  onDismiss,
}) => (
  <div className="fixed inset-x-0 bottom-24 z-40 flex justify-center px-4">
    <button
      type="button"
      onClick={onDismiss}
      className="pointer-events-auto rounded-full border border-border bg-card/95 px-3.5 py-1.5 text-xs font-medium text-foreground shadow-lg backdrop-blur"
    >
      {message}
    </button>
  </div>
);
