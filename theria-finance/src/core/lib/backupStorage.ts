import { STORAGE_KEYS } from '../constants/appStorage';
import { readJsonFromLocalStorage, writeJsonToLocalStorage } from './localStorageJson';
import { COLLECTION_KEYS } from '../domain/types';
import type { TheriaData } from '../domain/types';

/**
 * "Auto backup" here means Theria keeps a live "last saved" timestamp as the
 * user's data changes, so Settings can show them their data is safe on this
 * device. Actual persistence to localStorage always happens regardless (the
 * app couldn't function otherwise) — this toggle only controls whether that
 * timestamp is tracked and surfaced.
 */
export function isAutoBackupEnabled(): boolean {
  return readJsonFromLocalStorage<boolean>(STORAGE_KEYS.autoBackup) ?? true;
}

export function setAutoBackupEnabled(enabled: boolean): void {
  writeJsonToLocalStorage(STORAGE_KEYS.autoBackup, enabled);
}

export function getLastBackupAt(): string | null {
  return readJsonFromLocalStorage<string>(STORAGE_KEYS.lastBackupAt);
}

/** Stamps "now" as the last time local data was known-saved. Returns the stamp. */
export function markBackedUpNow(): string {
  const now = new Date().toISOString();
  writeJsonToLocalStorage(STORAGE_KEYS.lastBackupAt, now);
  return now;
}

const BACKUP_FILE_VERSION = 1;

interface BackupFile {
  app: 'theria';
  version: number;
  exportedAt: string;
  data: TheriaData;
}

/** Triggers a browser download of `data` as a portable JSON backup file. */
export function downloadBackupFile(data: TheriaData): void {
  const payload: BackupFile = {
    app: 'theria',
    version: BACKUP_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `theria-backup-${payload.exportedAt.slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Structural check only — malformed collections are rejected before touching state. */
function isTheriaData(value: unknown): value is TheriaData {
  if (!value || typeof value !== 'object') return false;
  return COLLECTION_KEYS.every((key) => Array.isArray((value as Record<string, unknown>)[key]));
}

export class BackupParseError extends Error {}

/** Reads and validates a user-selected file as a Theria backup. Throws `BackupParseError` on failure. */
export async function parseBackupFile(file: File): Promise<TheriaData> {
  let text: string;
  try {
    text = await file.text();
  } catch {
    throw new BackupParseError('Could not read that file.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BackupParseError('That file is not valid JSON.');
  }

  // Accept both the wrapped `{ data: TheriaData }` export format and a bare TheriaData object.
  const candidate =
    parsed && typeof parsed === 'object' && 'data' in (parsed as Record<string, unknown>)
      ? (parsed as { data: unknown }).data
      : parsed;

  if (!isTheriaData(candidate)) {
    throw new BackupParseError('That file is not a Theria backup.');
  }

  return candidate;
}
