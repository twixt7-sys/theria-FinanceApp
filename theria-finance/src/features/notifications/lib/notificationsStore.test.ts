import { describe, it, expect } from 'vitest';
import {
  markRead,
  swipeActive,
  swipeArchived,
  markAllRead,
  archiveAll,
  deleteAllArchived,
  type AppNotification,
} from './notificationsStore';

const make = (over: Partial<AppNotification> = {}): AppNotification => ({
  id: '1',
  title: 'T',
  message: 'M',
  type: 'info',
  time: 'now',
  read: false,
  seen: false,
  archived: false,
  ...over,
});

describe('markRead', () => {
  it('marks the clicked notification read', () => {
    const next = markRead([make({ id: 'a' })], 'a');
    expect(next[0].read).toBe(true);
  });

  it('is a no-op (same reference) when already read or missing', () => {
    const list = [make({ id: 'a', read: true })];
    expect(markRead(list, 'a')).toBe(list);
    expect(markRead(list, 'nope')).toBe(list);
  });
});

describe('swipeActive', () => {
  it('marks an unseen item seen (and read) on either direction', () => {
    expect(swipeActive([make({ id: 'a' })], 'a', 'left')[0]).toMatchObject({
      seen: true,
      read: true,
      archived: false,
    });
    expect(swipeActive([make({ id: 'a' })], 'a', 'right')[0]).toMatchObject({
      seen: true,
      read: true,
    });
  });

  it('archives a seen item swiped left', () => {
    const next = swipeActive([make({ id: 'a', seen: true, read: true })], 'a', 'left');
    expect(next[0].archived).toBe(true);
  });

  it('leaves a seen item unchanged when swiped right', () => {
    const list = [make({ id: 'a', seen: true, read: true })];
    expect(swipeActive(list, 'a', 'right')).toBe(list);
  });

  it('ignores an archived item', () => {
    const list = [make({ id: 'a', archived: true })];
    expect(swipeActive(list, 'a', 'left')).toBe(list);
  });
});

describe('swipeArchived', () => {
  it('deletes an archived item swiped left', () => {
    const next = swipeArchived([make({ id: 'a', archived: true })], 'a', 'left');
    expect(next).toHaveLength(0);
  });

  it('returns an archived item to active when swiped right', () => {
    const next = swipeArchived(
      [make({ id: 'a', archived: true, seen: true })],
      'a',
      'right',
    );
    expect(next[0]).toMatchObject({ archived: false, seen: false });
  });

  it('ignores a non-archived item', () => {
    const list = [make({ id: 'a' })];
    expect(swipeArchived(list, 'a', 'left')).toBe(list);
  });
});

describe('bulk actions', () => {
  it('marks every active item read, leaving archived ones alone', () => {
    const next = markAllRead([
      make({ id: 'a' }),
      make({ id: 'b', archived: true }),
    ]);
    expect(next[0].read).toBe(true);
    expect(next[1].read).toBe(false);
  });

  it('archives every active item', () => {
    const next = archiveAll([make({ id: 'a' }), make({ id: 'b' })]);
    expect(next.every((n) => n.archived)).toBe(true);
  });

  it('deletes every archived item, keeping active ones', () => {
    const next = deleteAllArchived([
      make({ id: 'a' }),
      make({ id: 'b', archived: true }),
    ]);
    expect(next).toHaveLength(1);
    expect(next[0].id).toBe('a');
  });

  it('bulk actions are no-ops when nothing qualifies', () => {
    const readOnly = [make({ id: 'a', read: true })];
    expect(markAllRead(readOnly)).toBe(readOnly);
    const archivedOnly = [make({ id: 'a', archived: true })];
    expect(archiveAll(archivedOnly)).toBe(archivedOnly);
    const activeOnly = [make({ id: 'a' })];
    expect(deleteAllArchived(activeOnly)).toBe(activeOnly);
  });
});
