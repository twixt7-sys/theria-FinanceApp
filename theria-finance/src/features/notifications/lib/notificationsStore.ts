/**
 * Notification persistence + live state.
 *
 * Notifications carry two orthogonal pieces of lifecycle: whether the user has
 * `read` them (a click, or "mark all as read") and where they sit in the
 * active → seen → archived → deleted flow driven by swipes. Both live in
 * localStorage so the list survives reloads, and every write dispatches a
 * change event so any live `useNotifications` (screen, future badge) re-reads
 * and stays in agreement within the tab.
 */
import { STORAGE_KEYS } from '../../../core/constants/appStorage';

export type NotificationType = 'warning' | 'success' | 'info';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  time: string;
  /** Clicked, or swept up by "mark all as read". */
  read: boolean;
  /** Swiped once while active — the gate that the next left-swipe archives. */
  seen: boolean;
  /** Moved out of the active list into the archive. */
  archived: boolean;
}

/** Seed content for a fresh install — mirrors the previous demo list. */
const seedNotifications = (): AppNotification[] => [
  {
    id: '1',
    title: 'Budget nearing limit',
    message: 'Groceries budget is at 85% for this month.',
    type: 'warning',
    time: '2h ago',
    read: false,
    seen: false,
    archived: false,
  },
  {
    id: '2',
    title: 'Savings milestone',
    message: 'You hit 75% of your annual savings goal.',
    type: 'success',
    time: '1d ago',
    read: false,
    seen: false,
    archived: false,
  },
  {
    id: '3',
    title: 'New record added',
    message: 'Expense of $120 was logged to Transportation.',
    type: 'info',
    time: '3d ago',
    read: false,
    seen: false,
    archived: false,
  },
];

const isNotification = (value: unknown): value is AppNotification =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as AppNotification).id === 'string' &&
  typeof (value as AppNotification).title === 'string';

const normalize = (n: AppNotification): AppNotification => ({
  id: n.id,
  title: n.title,
  message: n.message ?? '',
  type: n.type === 'warning' || n.type === 'success' ? n.type : 'info',
  time: n.time ?? '',
  read: !!n.read,
  seen: !!n.seen,
  archived: !!n.archived,
});

export function readNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.notifications);
    if (raw === null) return seedNotifications();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return seedNotifications();
    return parsed.filter(isNotification).map(normalize);
  } catch {
    return seedNotifications();
  }
}

/**
 * Fired after any notification write so every live `useNotifications`
 * subscriber re-reads and stays in agreement within the tab.
 */
export const NOTIFICATIONS_CHANGED_EVENT = 'theria:notifications-changed';

export function writeNotifications(list: AppNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(list));
    window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
  } catch {
    /* session-only — non-fatal */
  }
}

// --- Pure transitions ---------------------------------------------------------
// Each returns the same reference when nothing changes, so callers can skip a
// needless write, mirroring the streak store's idempotent style.

/** Click a notification → mark it read. */
export function markRead(list: AppNotification[], id: string): AppNotification[] {
  const target = list.find((n) => n.id === id);
  if (!target || target.read) return list;
  return list.map((n) => (n.id === id ? { ...n, read: true } : n));
}

/**
 * Active-list swipe. An unseen item (either direction) becomes seen; a
 * left-swipe on an already-seen item archives it. A right-swipe on a seen item
 * is a no-op — it is already seen.
 */
export function swipeActive(
  list: AppNotification[],
  id: string,
  direction: 'left' | 'right',
): AppNotification[] {
  const target = list.find((n) => n.id === id);
  if (!target || target.archived) return list;
  if (target.seen) {
    if (direction !== 'left') return list;
    return list.map((n) => (n.id === id ? { ...n, archived: true } : n));
  }
  return list.map((n) => (n.id === id ? { ...n, seen: true, read: true } : n));
}

/**
 * Archive-list swipe. Left deletes the notification outright; right returns it
 * to the active list (fresh, so its two-stage swipe works again).
 */
export function swipeArchived(
  list: AppNotification[],
  id: string,
  direction: 'left' | 'right',
): AppNotification[] {
  const target = list.find((n) => n.id === id);
  if (!target || !target.archived) return list;
  if (direction === 'left') return list.filter((n) => n.id !== id);
  return list.map((n) =>
    n.id === id ? { ...n, archived: false, seen: false } : n,
  );
}

/** Mark every active notification read. */
export function markAllRead(list: AppNotification[]): AppNotification[] {
  if (list.every((n) => n.archived || n.read)) return list;
  return list.map((n) => (n.archived || n.read ? n : { ...n, read: true }));
}

/** Move every active notification into the archive. */
export function archiveAll(list: AppNotification[]): AppNotification[] {
  if (list.every((n) => n.archived)) return list;
  return list.map((n) => (n.archived ? n : { ...n, archived: true }));
}

/** Permanently drop every archived notification. */
export function deleteAllArchived(list: AppNotification[]): AppNotification[] {
  if (!list.some((n) => n.archived)) return list;
  return list.filter((n) => !n.archived);
}
