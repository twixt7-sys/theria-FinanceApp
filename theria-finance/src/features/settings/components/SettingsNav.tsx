import React from 'react';
import { ChevronRight, ChevronLeft, type LucideIcon } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';

export const SettingsGroup: React.FC<{
  title?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className }) => (
  <div className={cn('space-y-1.5', className)}>
    {title && (
      <p className="px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
        {title}
      </p>
    )}
    <div className="overflow-hidden rounded-xl border border-border/50 bg-card/40 divide-y divide-border/40">
      {children}
    </div>
  </div>
);

export const SettingsRow: React.FC<{
  icon?: LucideIcon;
  label: string;
  hint?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  showChevron?: boolean;
  /** Styles the row in the destructive/red palette for dangerous actions. */
  destructive?: boolean;
}> = ({
  icon: Icon,
  label,
  hint,
  onClick,
  trailing,
  showChevron = Boolean(onClick),
  destructive = false,
}) => {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors',
        onClick && (destructive ? 'hover:bg-destructive/10 active:bg-destructive/15' : 'hover:bg-muted/40 active:bg-muted/60'),
      )}
    >
      {Icon && (
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            destructive ? 'bg-destructive/10 text-destructive' : 'bg-muted/60 text-muted-foreground',
          )}
        >
          <Icon size={15} strokeWidth={1.75} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block text-[13px] font-medium',
            destructive ? 'text-destructive' : 'text-foreground',
          )}
        >
          {label}
        </span>
        {hint && (
          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{hint}</span>
        )}
      </span>
      {trailing}
      {showChevron && onClick && (
        <ChevronRight
          size={16}
          className={cn('shrink-0', destructive ? 'text-destructive/50' : 'text-muted-foreground/50')}
        />
      )}
    </Tag>
  );
};

export const SettingsPageHeader: React.FC<{
  title: string;
  subtitle?: string;
  onBack: () => void;
}> = ({ title, subtitle, onBack }) => (
  <div className="mb-4 flex items-center gap-2">
    <button
      type="button"
      onClick={onBack}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-card/50 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
      aria-label="Back to settings"
    >
      <ChevronLeft size={18} />
    </button>
    <div className="min-w-0">
      <h2 className="text-[15px] font-semibold tracking-tight text-foreground">{title}</h2>
      {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
    </div>
  </div>
);

export const SettingsToggleRow: React.FC<{
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}> = ({ label, hint, checked, onCheckedChange }) => (
  <div className="flex items-center justify-between gap-3 px-3.5 py-3">
    <div className="min-w-0">
      <p className="text-[13px] font-medium text-foreground">{label}</p>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative h-6 w-10 shrink-0 rounded-full transition-colors',
        checked ? 'bg-primary/90' : 'bg-muted',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
          checked && 'translate-x-4',
        )}
      />
    </button>
  </div>
);
