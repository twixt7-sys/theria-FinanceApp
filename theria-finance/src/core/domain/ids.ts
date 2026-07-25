/**
 * Collision-free ids. The old `Date.now().toString()` scheme collided on rapid
 * adds and would collide across devices once data syncs.
 */
export const newId = (): string =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
