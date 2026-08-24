import React, { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw, Smartphone, type LucideIcon } from '@/shared/icons';
import { useSyncStatus } from '../../core/state/SyncStatusContext';
import { syncStateLabel, type SyncState } from '../../core/state/syncStatus';
import { cn } from './ui/utils';

const ICONS: Record<SyncState, LucideIcon> = {
  disabled: Smartphone,
  offline: CloudOff,
  syncing: RefreshCw,
  synced: Cloud,
};

const TONE: Record<SyncState, string> = {
  disabled: 'text-muted-foreground',
  offline: 'text-amber-600 dark:text-amber-400',
  syncing: 'text-blue-600 dark:text-blue-400',
  synced: 'text-primary',
};

/**
 * Compact cloud-sync badge. Shows where data currently lives and how fresh the
 * cloud copy is, and doubles as a manual "sync now" button when signed in.
 * The relative "last synced" phrase re-renders on a slow tick so it stays
 * honest without a render on every second.
 */
export const SyncStatusIndicator: React.FC<{ className?: string }> = ({ className }) => {
  const status = useSyncStatus();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (status.state !== 'synced') return;
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, [status.state]);

  const Icon = ICONS[status.state];
  const label = syncStateLabel(status, now);
  const interactive = status.state !== 'disabled';

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={() => status.syncNow()}
      aria-label={interactive ? `${label}. Tap to sync now.` : label}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold',
        'bg-card/60 transition-colors',
        interactive && 'hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        TONE[status.state],
        className,
      )}
    >
      <Icon
        size={11}
        strokeWidth={2.5}
        className={cn('shrink-0', status.state === 'syncing' && 'animate-spin')}
      />
      <span className="truncate">{label}</span>
    </button>
  );
};
