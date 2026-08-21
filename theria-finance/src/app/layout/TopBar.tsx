import React from 'react';
import { Bell, Flame } from '@/shared/icons';
import { useNavigate } from 'react-router';
import { useAuth } from '../../core/state/AuthContext';
import { TheriaBrandLogo } from '../../shared/components/TheriaBrandLogo';
import { ProfileMenuPanel } from '../../shared/components/ProfileMenuPanel';
import type { TimeFilterValue } from '../../shared/components/TimeFilter';
import { CURRENT_STREAK_DAYS } from '../../shared/lib/streak';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../../shared/components/ui/dropdown-menu';
import { useUi } from '../state/UiContext';
import { SCREEN_TITLES, TIME_FILTER_SCREENS, pathFor, type Screen } from '../routes';

/** Shared surface every floating circle/pill in the top nav sits on — the
 *  same recipe the bottom nav's pill uses, so the two read as one family. */
const FLOAT_SURFACE = 'bg-card/90 shadow-lg backdrop-blur-md';
const CIRCLE_BASE = `flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${FLOAT_SURFACE} transition-colors`;

/**
 * The center date reads coarsest-first: a primary line for whatever's more
 * granular than the active scope (day/month/quarter/week range), and the
 * year underneath. Year scope has nothing more granular to show, so it's
 * just the year on its own, larger.
 */
const formatNavDate = (scope: TimeFilterValue, date: Date): { primary: string | null; year: string } => {
  const year = date.getFullYear().toString();

  switch (scope) {
    case 'day':
      return { primary: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }), year };
    case 'week': {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
      const start = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = weekEnd.toLocaleDateString(
        'en-US',
        sameMonth ? { day: 'numeric' } : { month: 'short', day: 'numeric' },
      );
      return { primary: `${start} – ${end}`, year };
    }
    case 'month':
      return { primary: date.toLocaleDateString('en-US', { month: 'long' }), year };
    case 'quarter':
      return { primary: `Q${Math.floor(date.getMonth() / 3) + 1}`, year };
    case 'year':
      return { primary: null, year };
    case 'custom':
    default:
      return { primary: 'Custom range', year };
  }
};

/**
 * Two detached floating clusters — a left brand/label group and a right
 * action group — mirroring the bottom nav's floating pill (see
 * app/layout/bottom-nav/NavPill.tsx). The bar is `fixed`, not `sticky`, so
 * page content needs `.pt-top-nav` (see AppShell) to clear it.
 *
 * The time filter itself lives in AppShell now — an inline, full-width panel
 * below this bar — and each screen's own toolbar owns triggering it (e.g.
 * the filter button next to Records' search bar), so this bar carries no
 * filter control of its own — just a passive readout of the active period.
 */
export const TopBar: React.FC<{ screen: Screen }> = ({ screen }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sidebarOpen, setSidebarOpen, timeFilter, currentDate } = useUi();

  const showDate = TIME_FILTER_SCREENS.includes(screen);
  const navDate = formatNavDate(timeFilter, currentDate);

  return (
    <div className="fixed inset-x-0 top-0 z-40 pt-safe">
      {/* Fades page content into the row from above, mirroring BottomNav's
          upward scrim so both floating rows read as sitting on the same
          kind of shelf. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -bottom-20 bg-gradient-to-b from-slate-300/55 via-slate-200/55 to-transparent dark:from-black/35 dark:via-black/35 dark:to-transparent"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-2 px-3 top-nav-row sm:px-4 lg:px-6">
        {/* Left group: logo circle + page-label pill */}
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            data-tour="nav-menu"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`${CIRCLE_BASE} outline-none focus-visible:outline-none`}
            title="Menu"
          >
            <TheriaBrandLogo size="sm" className="h-6" />
          </button>

          <div
            className={`flex h-10 min-w-0 items-center rounded-full px-3.5 ${FLOAT_SURFACE}`}
          >
            <h2 className="min-w-0 truncate text-sm font-semibold text-foreground">
              {SCREEN_TITLES[screen]}
            </h2>
          </div>
        </div>

        {/* Center: subtle, passive readout of the active period — no
            background, just text. Lives in its own grid column (rather than
            an absolute overlay) so it claims real space between the left
            and right groups instead of floating over them on narrow
            screens, and shrinks/truncates gracefully if that space is
            tight. */}
        {showDate && (
          <div className="pointer-events-none flex min-w-0 flex-col items-center justify-self-center px-1 text-center leading-tight">
            {navDate.primary && (
              <span className="max-w-full truncate text-[11px] font-semibold text-muted-foreground sm:text-sm">
                {navDate.primary}
              </span>
            )}
            <span
              className={`max-w-full truncate ${
                navDate.primary
                  ? 'text-[9px] text-muted-foreground/70 sm:text-[11px]'
                  : 'text-[11px] font-semibold text-muted-foreground sm:text-sm'
              }`}
            >
              {navDate.year}
            </span>
          </div>
        )}

        {/* Right group: streak, notifications, profile */}
        <div className="relative flex shrink-0 items-center justify-self-end gap-1.5">
          <button
            type="button"
            onClick={() => navigate(pathFor('streak'))}
            className={`${CIRCLE_BASE} border-2 border-orange-500 bg-orange-500/10`}
            title="Streak"
          >
            <span className="text-xs font-bold tabular-nums text-orange-600 dark:text-orange-400">
              {CURRENT_STREAK_DAYS}
            </span>
            <span
              aria-hidden
              className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 shadow-sm"
            >
              <Flame size={10} strokeWidth={2.5} className="text-white" fill="currentColor" fillOpacity={0.35} />
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate(pathFor('notifications'))}
            className={`${CIRCLE_BASE} text-foreground hover:bg-muted ${
              screen === 'notifications' ? 'bg-primary/10' : ''
            }`}
            title="Notifications"
          >
            <Bell size={16} />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`${CIRCLE_BASE} bg-primary text-white outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                title="Profile menu"
                aria-label="Profile menu"
              >
                <span className="text-xs font-bold">{user?.username?.[0]?.toUpperCase()}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-auto overflow-hidden rounded-2xl border-border/50 p-0 shadow-xl"
            >
              <ProfileMenuPanel
                onViewProfile={() => navigate(pathFor('profile'))}
                onViewStreak={() => navigate(pathFor('streak'))}
                onViewSettings={() => navigate(pathFor('settings'))}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
