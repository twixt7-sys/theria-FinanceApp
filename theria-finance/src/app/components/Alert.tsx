import React, { useEffect, useState } from 'react';
import { Check, X, AlertTriangle, Info, Plus, Edit, Trash2 } from 'lucide-react';

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
    bgColor: 'bg-background',
    borderColor: 'border-primary/30',
    iconColor: 'text-primary',
    titleColor: 'text-foreground',
    messageColor: 'text-muted-foreground',
  },
  error: {
    icon: X,
    bgColor: 'bg-background',
    borderColor: 'border-destructive/30',
    iconColor: 'text-destructive',
    titleColor: 'text-foreground',
    messageColor: 'text-muted-foreground',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-background',
    borderColor: 'border-border',
    iconColor: 'text-muted-foreground',
    titleColor: 'text-foreground',
    messageColor: 'text-muted-foreground',
  },
  info: {
    icon: Info,
    bgColor: 'bg-background',
    borderColor: 'border-border',
    iconColor: 'text-muted-foreground',
    titleColor: 'text-foreground',
    messageColor: 'text-muted-foreground',
  },
  add: {
    icon: Plus,
    bgColor: 'bg-background',
    borderColor: 'border-primary/30',
    iconColor: 'text-primary',
    titleColor: 'text-foreground',
    messageColor: 'text-muted-foreground',
  },
  update: {
    icon: Edit,
    bgColor: 'bg-background',
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-600',
    titleColor: 'text-foreground',
    messageColor: 'text-muted-foreground',
  },
  delete: {
    icon: Trash2,
    bgColor: 'bg-background',
    borderColor: 'border-destructive/30',
    iconColor: 'text-destructive',
    titleColor: 'text-foreground',
    messageColor: 'text-muted-foreground',
  },
};

export const Alert: React.FC<AlertProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000, // Default to 5 seconds
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const config = alertConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    // Trigger enter animation
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // Auto-dismiss after duration
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
    }, 200); // Match exit animation duration
  };

  return (
    <div
      className={`
        relative max-w-sm w-full rounded-lg border shadow-sm
        transform transition-all duration-200 ease-out
        ${config.bgColor} ${config.borderColor}
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : '-translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${config.iconColor}`}>
            <Icon size={18} strokeWidth={2} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium ${config.titleColor}`}>
              {title}
            </h4>
            {message && (
              <p className={`text-xs mt-1 ${config.messageColor} line-clamp-2`}>
                {message}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className={`flex-shrink-0 p-1 rounded-md ${config.iconColor} hover:bg-muted transition-colors`}
            aria-label="Dismiss alert"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Alert container component for managing multiple alerts
export interface AlertContainerProps {
  alerts: AlertProps[];
  onRemove: (id: string) => void;
}

export const AlertContainer: React.FC<AlertContainerProps> = ({ alerts, onRemove }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-4 z-50 space-y-2 pointer-events-none">
      {alerts.map((alert) => (
        <div key={alert.id} className="pointer-events-auto">
          <Alert {...alert} onClose={onRemove} />
        </div>
      ))}
    </div>
  );
};
