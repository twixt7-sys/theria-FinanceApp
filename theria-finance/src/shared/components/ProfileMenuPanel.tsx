import React, { useMemo } from 'react';
import { Flame, FileText, Settings, Sparkles, User, Wallet } from 'lucide-react';
import { useAuth } from '../../core/state/AuthContext';
import { useData } from '../../core/state/DataContext';
import { computeProfileScore } from '../../features/profile/components/ProfileHeroCard';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
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

  const profileScore = useMemo(
    () => computeProfileScore(STREAK_DAYS, records.length, accounts.length),
    [records.length, accounts.length],
  );

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

  return (
    <div className="w-56">
      <div className="border-b border-border/60 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent px-2 pt-2 pb-2.5">
        <DropdownMenuItem
          onSelect={onViewProfile}
          className="mb-1.5 cursor-pointer gap-2.5 rounded-lg px-2 py-2 focus:bg-sidebar-accent/60"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-md ring-2 ring-primary/15">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1 flex-col items-start">
            <span className="truncate text-sm font-semibold">{user?.username ?? 'Guest'}</span>
            <span className="truncate text-[10px] text-muted-foreground">
              {user?.email ?? 'Not signed in'}
            </span>
          </div>
        </DropdownMenuItem>

        <div className="grid grid-cols-3 gap-1 px-0.5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <DropdownMenuItem
                key={stat.id}
                onSelect={stat.onSelect}
                className="cursor-pointer flex-col items-center gap-2 rounded-lg border border-transparent bg-transparent px-1 py-1.5 text-center focus:bg-muted/50"
              >
                <div
                  className={cn(
                    'flex h-11 w-11 flex-col items-center justify-center rounded-full',
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

        <div className="mx-0.5 mt-1.5 flex items-center gap-1.5 rounded-md bg-muted/40 px-2 py-1 pointer-events-none">
          <Wallet size={11} className="shrink-0 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">
            <span className="font-semibold text-foreground">{accounts.length}</span>
            {' '}
            {accounts.length === 1 ? 'account' : 'accounts'} linked
          </span>
        </div>
      </div>

      <DropdownMenuSeparator className="my-0" />

      <div className="p-1">
        <DropdownMenuItem onSelect={onViewProfile} className="cursor-pointer rounded-md">
          <User size={16} />
          View profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onViewStreak} className="cursor-pointer rounded-md">
          <Flame size={16} className="text-orange-500" />
          Streak
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onViewSettings} className="cursor-pointer rounded-md">
          <Settings size={16} />
          Settings
        </DropdownMenuItem>
      </div>
    </div>
  );
};
