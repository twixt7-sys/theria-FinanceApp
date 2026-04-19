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
    iconWrap: 'bg-primary/15 text-primary ring-1 ring-primary/20',
    titleColor: 'text-foreground',
    messageColor: 'text-muted-foreground',
  },
  error: {
    icon: X,
    accent: 'bg-destructive',
    iconWrap: 'bg-destructive/15 text-destructive ring-1 ring-destructive/20',
    titleColor: 'text-foreground',
    messageColor: 'text-muted-foreground',
  },
  warning: {
    icon: AlertTriangle,
    accent: 'bg-amber-500',
    iconWrap: 'bg-amber-500/12 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/25',
    titleColor: 'text-foreground',
    messageColor: 'text-muted-foreground',
  },
  info: {
    icon: Info,
    accent: 'bg-sky-500',
    iconWrap: 'bg-sky-500/12 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/25',
    titleColor: 'text-foreground',
    messageColor: 'text-muted-foreground',
  },
  add: {
    icon: Plus,
    accent: 'bg-primary',
    iconWrap: 'bg-primary/15 text-primary ring-1 ring-primary/20',
    titleColor: 'text-foreground',
    messageColor: 'text-muted-foreground',
  },
  update: {
    icon: Edit,
    accent: 'bg-blue-500',
    iconWrap: 'bg-blue-500/12 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/25',
    titleColor: 'text-foreground',
    messageColor: 'text-muted-foreground',
  },
  delete: {
    icon: Trash2,
    accent: 'bg-destructive',
    iconWrap: 'bg-destructive/15 text-destructive ring-1 ring-destructive/20',
    titleColor: 'text-foreground',
    messageColor: 'text-muted-foreground',
  },
};

export const Alert: React.FC<AlertProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
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
    }, 220);
  };

  return (
    <div
      className={cn(
        'relative max-w-sm w-full overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-xl shadow-black/5 backdrop-blur-md transition-all duration-300 ease-out',
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100 scale-100'
          : '-translate-x-4 opacity-0 scale-[0.98]',
      )}
    >
      <div className={cn('absolute left-0 top-0 h-full w-1 rounded-l-2xl', config.accent)} aria-hidden />
      <div className="p-3.5 pl-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              config.iconWrap,
            )}
          >
            <Icon size={18} strokeWidth={2} />
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h4 className={cn('text-sm font-semibold leading-snug tracking-tight', config.titleColor)}>
              {title}
            </h4>
            {message && (
              <p className={cn('text-xs mt-1.5 leading-relaxed', config.messageColor, 'line-clamp-3')}>
                {message}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Dismiss alert"
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>
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
    <div className="pointer-events-none fixed left-4 z-[100] space-y-2.5 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] max-w-[min(100vw-2rem,24rem)]">
      {alerts.map((alert) => (
        <div key={alert.id} className="pointer-events-auto">
          <Alert {...alert} onClose={onRemove} />
        </div>
      ))}
    </div>
  );
};
