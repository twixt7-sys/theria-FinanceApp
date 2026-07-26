import {
  readJsonFromLocalStorage,
  writeJsonToLocalStorage,
} from '../../../core/lib/localStorageJson';

/**
 * Client-side throttling for the Gemini free tier. It is a courtesy limit, not
 * a security control — App Check is what actually stops other callers. Its job
 * is to keep ordinary use from exhausting the daily allowance by accident.
 */
export const DAILY_MESSAGE_LIMIT = 40;
export const MIN_GAP_MS = 3000;

const keyFor = (now: Date) => `theria-terry-quota-${now.toISOString().slice(0, 10)}`;

export function messagesSentToday(now: Date = new Date()): number {
  return readJsonFromLocalStorage<number>(keyFor(now)) ?? 0;
}

export function recordMessageSent(now: Date = new Date()): void {
  writeJsonToLocalStorage(keyFor(now), messagesSentToday(now) + 1);
}

export type SendVerdict =
  | { allowed: true }
  | { allowed: false; reason: 'daily-limit' | 'too-fast' | 'offline'; message: string };

export function canSend(options: {
  now?: Date;
  lastSentAt: number | null;
  online: boolean;
}): SendVerdict {
  const { now = new Date(), lastSentAt, online } = options;

  if (!online) {
    return {
      allowed: false,
      reason: 'offline',
      message: "I need a connection to think. Your records still work offline!",
    };
  }

  if (messagesSentToday(now) >= DAILY_MESSAGE_LIMIT) {
    return {
      allowed: false,
      reason: 'daily-limit',
      message: "I've done a lot of thinking today — let's pick this up tomorrow.",
    };
  }

  if (lastSentAt !== null && now.getTime() - lastSentAt < MIN_GAP_MS) {
    return {
      allowed: false,
      reason: 'too-fast',
      message: 'Give me a second to catch up!',
    };
  }

  return { allowed: true };
}
