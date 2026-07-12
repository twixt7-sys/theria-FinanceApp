import React, { useMemo } from 'react';
import { ChevronRight, Flame, FileText, Settings, Sparkles, User, Wallet } from 'lucide-react';
import { useAuth } from '../../core/state/AuthContext';
import { useData } from '../../core/state/DataContext';
import { useCurrency } from '../../core/state/CurrencyContext';
import { computeProfileScore } from '../../features/profile/components/ProfileHeroCard';
import { DropdownMenuItem, DropdownMenuSeparator } from './ui/dropdown-menu';
import { cn } from './ui/utils';

const STREAK_DAYS = 7;

type ProfileMenuPanelProps = {
  onViewProfile: () => void;
  onViewStreak: () => void;
  onViewSettings: () => void;
};

export const ProfileMenuPanel: React.FC<ProfileMenuPanelProps> = ({
  onViewProfile,
  onViewStreak,
  onViewSettings,
}) => {
  const { user } = useAuth();
  const { records, accounts } = useData();
  const { formatMoney: formatCurrency } = useCurrency();

  const profileScore = useMemo(
    () => computeProfileScore(STREAK_DAYS, records.length, accounts.length),
    [records.length, accounts.length],
  );

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const stats = [
    {
      id: 'streak',
      icon: Flame,
      value: String(STREAK_DAYS),
      label: 'day streak',
      circleClass: 'border-2 border-orange-500 bg-orange-500/5',
      contentClass: 'text-orange-600 dark:text-orange-400',
      labelClass: 'text-orange-600 dark:text-orange-400',
      onSelect: onViewStreak,
    },
    {
      id: 'records',
      icon: FileText,
      value: String(records.length),
      label: records.length === 1 ? 'record' : 'records',
      circleClass: 'border-2 border-blue-500 bg-blue-500/5',
      contentClass: 'text-blue-600 dark:text-blue-400',
      labelClass: 'text-blue-600 dark:text-blue-400',
      onSelect: onViewProfile,
    },
    {
      id: 'score',
      icon: Sparkles,
      value: `${profileScore}%`,
      label: 'strength',
      circleClass: 'border-2 border-primary bg-primary/5',
      contentClass: 'text-primary',
      labelClass: 'text-primary',
      onSelect: onViewProfile,
    },
  ];

  const menuItems = [
    {
      id: 'profile',
      icon: User,
      label: 'View profile',
      chipClass: 'bg-primary/10 text-primary',
      onSelect: onViewProfile,
    },
    {
      id: 'streak',
      icon: Flame,
      label: 'Streak',
      chipClass: 'bg-orange-500/10 text-orange-500',
      onSelect: onViewStreak,
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      chipClass: 'bg-slate-500/10 text-slate-500 dark:text-slate-400',
      onSelect: onViewSettings,
    },
  ];

  return (
    <div className="w-64">
      {/* Header — same visual language as the dashboard balance widget */}
      <div className="relative overflow-hidden border-b border-border/50 bg-slate-100 px-2.5 pb-2.5 pt-2.5 dark:bg-slate-800/60">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-12 -right-8 h-28 w-28 rounded-full bg-blue-500/5 blur-3xl"
        />

        <DropdownMenuItem
          onSelect={onViewProfile}
          className="relative mb-1.5 cursor-pointer gap-3 rounded-2xl px-2 py-2 focus:bg-card/60"
        >
          <div className="shrink-0 rounded-full border border-border/40 bg-card/40 p-1 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-primary bg-card text-base font-bold text-foreground shadow-inner">
              {user?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">
              {user?.username ?? 'Guest'}
            </span>
            <span className="block truncate text-[10px] text-muted-foreground">
              {user?.email ?? 'Not signed in'}
            </span>
            <span className="mt-1 inline-flex w-fit max-w-full items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-primary">
              <Wallet size={10} strokeWidth={2.5} className="shrink-0" aria-hidden />
              <span className="truncate">
                {formatCurrency(totalBalance)} · {accounts.length}{' '}
                {accounts.length === 1 ? 'account' : 'accounts'}
              </span>
            </span>
          </div>
        </DropdownMenuItem>

        <div className="relative grid grid-cols-3 gap-1 px-0.5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <DropdownMenuItem
                key={stat.id}
                onSelect={stat.onSelect}
                className="cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-transparent bg-transparent px-1 py-1.5 text-center focus:bg-card/60"
              >
                <div
                  className={cn(
                    'flex h-11 w-11 flex-col items-center justify-center rounded-full bg-card shadow-sm',
                    stat.circleClass,
                    stat.contentClass,
                  )}
                >
                  <Icon size={10} strokeWidth={2.5} className="mb-0.5" aria-hidden />
                  <span className="text-xs font-bold leading-none tabular-nums">{stat.value}</span>
                </div>
                <span
                  className={cn(
                    'text-[8px] font-semibold uppercase leading-tight tracking-wide',
                    stat.labelClass,
                  )}
                >
                  {stat.label}
                </span>
              </DropdownMenuItem>
            );
          })}
        </div>
      </div>

      <DropdownMenuSeparator className="my-0" />

      {/* Capsule menu rows with circular icon chips */}
      <div className="space-y-0.5 p-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem
              key={item.id}
              onSelect={item.onSelect}
              className="group cursor-pointer gap-2.5 rounded-full px-1.5 py-1.5"
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  item.chipClass,
                )}
              >
                <Icon size={14} strokeWidth={2.25} aria-hidden />
              </span>
              <span className="flex-1 text-xs font-medium text-foreground">{item.label}</span>
              <ChevronRight
                size={13}
                strokeWidth={2.5}
                className="shrink-0 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden
              />
            </DropdownMenuItem>
          );
        })}
      </div>
    </div>
  );
};
