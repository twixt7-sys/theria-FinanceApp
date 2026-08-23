/**
 * `useNotifications` — the single entry point for notification data and the
 * actions that mutate it. Reads the persisted list, keeps every mounted
 * instance in sync (via the change event and cross-tab `storage`), and exposes
 * the small set of transitions the UI drives. The transitions themselves are
 * pure functions in the store; this hook just persists their results and
 * fans the change out to every subscriber.
 *
 *   • active  — swipe once → seen; swipe a seen item left → archived
 *   • archive — swipe left → deleted; swipe right → returned to active
 *   • click   — marked as read
 *   • bulk    — mark all read, archive all, delete all archived
 */
import { useCallback, useEffect, useState } from 'react';
import {
  NOTIFICATIONS_CHANGED_EVENT,
  readNotifications,
  writeNotifications,
  markRead as applyMarkRead,
  swipeActive as applySwipeActive,
  swipeArchived as applySwipeArchived,
  markAllRead as applyMarkAllRead,
  archiveAll as applyArchiveAll,
  deleteAllArchived as applyDeleteAllArchived,
  type AppNotification,
} from './notificationsStore';

const listsEqual = (a: AppNotification[], b: AppNotification[]): boolean =>
  a.length === b.length &&
  a.every((n, i) => {
    const m = b[i];
    return (
      n.id === m.id &&
      n.read === m.read &&
      n.seen === m.seen &&
      n.archived === m.archived
    );
  });

export interface UseNotificationsResult {
  active: AppNotification[];
  archived: AppNotification[];
  /** Unread count across active notifications — for a future nav badge. */
  unreadCount: number;
  /** Click a notification → mark it read. */
  markRead: (id: string) => void;
  /** Active swipe: unseen → seen; seen (left swipe) → archived. */
  swipeActive: (id: string, direction: 'left' | 'right') => void;
  /** Archive swipe: left → delete; right → return to active. */
  swipeArchived: (id: string, direction: 'left' | 'right') => void;
  markAllRead: () => void;
  archiveAll: () => void;
  deleteAllArchived: () => void;
}

export function useNotifications(): UseNotificationsResult {
  const [list, setList] = useState<AppNotification[]>(() => readNotifications());

  // Keep every mounted instance in sync when one of them mutates the list,
  // and across tabs via 'storage'.
  useEffect(() => {
    const sync = () =>
      setList((prev) => {
        const next = readNotifications();
        return listsEqual(prev, next) ? prev : next;
      });
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // Apply a pure transition, persist it, and fan the change out. When the
  // transition is a no-op (same reference) we skip the write entirely.
  const run = useCallback(
    (transition: (list: AppNotification[]) => AppNotification[]) =>
      setList((prev) => {
        const next = transition(prev);
        if (next === prev) return prev;
        writeNotifications(next);
        return next;
      }),
    [],
  );

  const markRead = useCallback(
    (id: string) => run((l) => applyMarkRead(l, id)),
    [run],
  );
  const swipeActive = useCallback(
    (id: string, direction: 'left' | 'right') =>
      run((l) => applySwipeActive(l, id, direction)),
    [run],
  );
  const swipeArchived = useCallback(
    (id: string, direction: 'left' | 'right') =>
      run((l) => applySwipeArchived(l, id, direction)),
    [run],
  );
  const markAllRead = useCallback(() => run(applyMarkAllRead), [run]);
  const archiveAll = useCallback(() => run(applyArchiveAll), [run]);
  const deleteAllArchived = useCallback(() => run(applyDeleteAllArchived), [run]);

  const active = list.filter((n) => !n.archived);
  const archived = list.filter((n) => n.archived);
  const unreadCount = active.reduce((sum, n) => (n.read ? sum : sum + 1), 0);

  return {
    active,
    archived,
    unreadCount,
    markRead,
    swipeActive,
    swipeArchived,
    markAllRead,
    archiveAll,
    deleteAllArchived,
  };
}
