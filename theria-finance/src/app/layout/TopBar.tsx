import React from 'react';
import { Bell, Filter } from '@/shared/icons';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../core/state/AuthContext';
import { TheriaBrandLogo, TheriaBrandWordmark } from '../../shared/components/TheriaBrandLogo';
import { TimeFilter } from '../../shared/components/TimeFilter';
import { ProfileMenuPanel } from '../../shared/components/ProfileMenuPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../../shared/components/ui/dropdown-menu';
import { useUi } from '../state/UiContext';
import {
  FILTERABLE_SCREENS,
  SCREEN_TITLES,
  TIME_FILTER_SCREENS,
  pathFor,
  type Screen,
} from '../routes';

export const TopBar: React.FC<{ screen: Screen }> = ({ screen }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    filterOpen,
    toggleFilter,
    sidebarOpen,
    setSidebarOpen,
    timeFilter,
    setTimeFilter,
    currentDate,
    navigateDate,
    leaveCustomMode,
  } = useUi();

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-card/90 pt-safe shadow-md backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="flex flex-wrap items-center gap-2 py-1.5 sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center sm:max-w-md sm:flex-none">
            <button
              type="button"
              data-tour="nav-menu"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex min-w-0 max-w-full items-center gap-2.5 rounded-lg p-1 outline-none focus-visible:outline-none"
              title="Menu"
            >
              <TheriaBrandLogo size="sm" />
              <div className="flex min-w-0 items-center gap-2">
                <TheriaBrandWordmark />
                <span className="shrink-0 text-muted-foreground" aria-hidden>
                  •
                </span>
                <h2 className="min-w-0 truncate text-xs font-semibold text-muted-foreground sm:text-sm">
                  {SCREEN_TITLES[screen]}
                </h2>
              </div>
            </button>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:ml-auto">
            <div className="flex items-center gap-2">
              {FILTERABLE_SCREENS.includes(screen) && (
                <button
                  data-tour="nav-filter"
                  onClick={toggleFilter}
                  className={`p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground ${
                    filterOpen ? 'bg-primary/10' : ''
                  }`}
                  title="Toggle Filters"
                >
                  <Filter size={18} />
                </button>
              )}

              <button
                onClick={() => navigate(pathFor('notifications'))}
                className={`p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground ${
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
                    className="flex items-center gap-2 hover:bg-muted rounded-lg p-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title="Profile menu"
                    aria-label="Profile menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                      <span className="text-xs font-bold">{user?.username?.[0]?.toUpperCase()}</span>
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-foreground">
                      {user?.username}
                    </span>
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

        <AnimatePresence initial={false}>
          {TIME_FILTER_SCREENS.includes(screen) && filterOpen && (
            <motion.div
              key="time-filter"
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pb-2">
                <TimeFilter
                  value={timeFilter}
                  onChange={setTimeFilter}
                  currentDate={currentDate}
                  onNavigateDate={navigateDate}
                  onLeaveCustom={leaveCustomMode}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
