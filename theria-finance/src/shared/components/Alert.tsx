import React, { useEffect, useState } from 'react';
import { Check, X, AlertTriangle, Info, Plus, Edit, Trash2 } from 'lucide-react';
import { cn } from './ui/utils';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'add' | 'update' | 'delete';

export interface AlertProps {
  id: string;
  type: AlertType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: (id: string) => void;
}

const alertConfig = {
  success: {
    icon: Check,
    accent: 'bg-primary',
    iconWrap: 'bg-primary/12 text-primary',
  },
  error: {
    icon: X,
    accent: 'bg-destructive',
    iconWrap: 'bg-destructive/12 text-destructive',
  },
  warning: {
    icon: AlertTriangle,
    accent: 'bg-amber-500',
    iconWrap: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
  },
  info: {
    icon: Info,
    accent: 'bg-sky-500',
    iconWrap: 'bg-sky-500/12 text-sky-600 dark:text-sky-400',
  },
  add: {
    icon: Plus,
    accent: 'bg-primary',
    iconWrap: 'bg-primary/12 text-primary',
  },
  update: {
    icon: Edit,
    accent: 'bg-blue-500',
    iconWrap: 'bg-blue-500/12 text-blue-600 dark:text-blue-400',
  },
  delete: {
    icon: Trash2,
    accent: 'bg-destructive',
    iconWrap: 'bg-destructive/12 text-destructive',
  },
};

export const Alert: React.FC<AlertProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const config = alertConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose?.(id);
    }, 180);
  };

  return (
    <div
      className={cn(
        'relative w-full max-w-[17rem] overflow-hidden rounded-lg border border-border/70 bg-card/92 shadow-md shadow-black/5 backdrop-blur-sm transition-all duration-200 ease-out',
        isVisible && !isLeaving
          ? 'translate-y-0 opacity-100'
          : '-translate-y-2 opacity-0',
      )}
      role="status"
    >
      <div className={cn('absolute left-0 top-0 bottom-0 w-0.5', config.accent)} aria-hidden />
      <div className="flex items-center gap-2 py-2 pl-2.5 pr-1.5">
        <div
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
            config.iconWrap,
          )}
        >
          <Icon size={13} strokeWidth={2.25} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold leading-tight text-foreground">
            {title}
          </p>
          {message && (
            <p className="mt-0.5 truncate text-[10px] leading-tight text-muted-foreground">
              {message}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Dismiss"
        >
          <X size={11} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export interface AlertContainerProps {
  alerts: AlertProps[];
  onRemove: (id: string) => void;
}

export const AlertContainer: React.FC<AlertContainerProps> = ({ alerts, onRemove }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed left-3 z-[100] flex max-w-[min(calc(100vw-1.5rem),17rem)] flex-col gap-1.5 top-[calc(4.5rem+env(safe-area-inset-top,0px))]">
      {alerts.map((alert) => (
        <div key={alert.id} className="pointer-events-auto">
          <Alert {...alert} onClose={onRemove} />
        </div>
      ))}
    </div>
  );
};
