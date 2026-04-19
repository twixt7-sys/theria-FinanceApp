import type { TheriaUser } from './user';

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

export function isTheriaUser(value: unknown): value is TheriaUser {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return (
    isNonEmptyString(o.id) &&
    isNonEmptyString(o.username) &&
    isNonEmptyString(o.email) &&
    isNonEmptyString(o.createdAt)
  );
}

export function normalizeTheriaUser(raw: unknown): TheriaUser | null {
  if (!isTheriaUser(raw)) return null;
  return {
    id: raw.id.trim(),
    username: raw.username.trim(),
    email: raw.email.trim().toLowerCase(),
    createdAt: raw.createdAt,
  };
}
