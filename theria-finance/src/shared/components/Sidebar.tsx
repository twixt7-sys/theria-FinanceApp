import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  LogOut,
  User,
  Wallet,
  FolderOpen,
  Clock,
  Target,
  PiggyBank,
  BarChart3,
  Flame,
  Home,
  Newspaper,
  Bell,
  Settings,
  Info,
  ChevronUp,
  FileText as RecordsIcon,
  TrendingUp,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../../core/state/AuthContext';
import { useTheme } from '../../core/state/ThemeContext';
import { useSimpleMode } from '../../core/state/SimpleModeContext';
import { FEATURE_COLORS } from '../lib/featureColors';
import { ThemeModeToggle } from './ThemeModeToggle';
import { TheriaBrandLogo, TheriaBrandWordmark } from './TheriaBrandLogo';
import { cn } from './ui/utils';
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  currentScreen: string;
  /** Legacy props — Budget & Savings are always shown now. */
  showSecondaryFeatures?: boolean;
  onToggleSecondaryFeatures?: () => void;
  homeTab?: 'dashboard' | 'newsfeed' | 'analysis';
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentScreen,
  homeTab = 'dashboard',
}) => {
  const { logout } = useAuth();
  const { cycleThemeMode, themeMode } = useTheme();
  const { simpleMode, toggleSimpleMode } = useSimpleMode();
  // Both sections start expanded; the user can collapse what they don't need.
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [featuresOpen, setFeaturesOpen] = useState(true);

  const handleLogout = () => {
    logout();
    onClose();
  };

  const overviewItems = [
    { icon: Home, label: 'Home', screen: 'home' },
    { icon: Newspaper, label: 'Newsfeed', screen: 'newsfeed' },
    { icon: Bell, label: 'Notifs', screen: 'notifications' },
    { icon: Clock, label: 'Activity', screen: 'activity' },
    { icon: BarChart3, label: 'Analysis', screen: 'analysis' },
  ];

  const featureColorStyles = FEATURE_COLORS;

  type SidebarGridItem = {
    icon: React.ElementType;
    label: string;
    screen: string;
    featureColor?: keyof typeof featureColorStyles;
  };

  const featurePrimaryItems: SidebarGridItem[] = [
    { icon: RecordsIcon, label: 'Records', screen: 'records', featureColor: 'records' },
    { icon: TrendingUp, label: 'Streams', screen: 'streams', featureColor: 'streams' },
    { icon: FolderOpen, label: 'Categories', screen: 'categories', featureColor: 'categories' },
    { icon: Wallet, label: 'Accounts', screen: 'accounts', featureColor: 'accounts' },
  ];

  const featureSecondaryItems: SidebarGridItem[] = [
    { icon: Target, label: 'Budget', screen: 'budget', featureColor: 'budget' },
    { icon: PiggyBank, label: 'Savings', screen: 'savings', featureColor: 'savings' },
  ];

  const isItemActive = (screen: string) =>
    screen === 'newsfeed'
      ? currentScreen === 'home' && homeTab === 'newsfeed'
      : screen === 'home'
        ? currentScreen === 'home' && homeTab !== 'newsfeed'
        : currentScreen === screen;

  const navigateTo = (screen: string) => {
    onNavigate(screen);
    onClose();
  };

  const renderOverviewIcon = (item: SidebarGridItem) => {
    const Icon = item.icon;
    const isActive = isItemActive(item.screen);

    return (
      <motion.button
        key={item.screen}
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => navigateTo(item.screen)}
        aria-current={isActive ? 'page' : undefined}
        aria-label={item.label}
        title={item.label}
        className={cn(
          'flex h-9 flex-1 items-center justify-center rounded-full transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
        )}
      >
        <Icon size={16} strokeWidth={2.25} />
      </motion.button>
    );
  };

  const renderFeatureTile = (item: SidebarGridItem) => {
    const Icon = item.icon;
    const isActive = isItemActive(item.screen);
    const themed = item.featureColor ? featureColorStyles[item.featureColor] : null;

    return (
      <motion.button
        key={item.screen}
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => navigateTo(item.screen)}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'group relative flex w-full items-center gap-2 rounded-xl border px-2 py-2 text-left transition-all',
          'hover:border-sidebar-border/80 hover:bg-sidebar-accent/50 active:bg-sidebar-accent/70',
          isActive
            ? 'border-sidebar-border/80 bg-sidebar-accent shadow-sm'
            : 'border-transparent',
        )}
        style={
          isActive && themed
            ? { boxShadow: `inset 2px 0 0 0 ${themed.accent}` }
            : undefined
        }
      >
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
            isActive && themed ? 'text-white shadow-sm' : themed?.iconBg,
          )}
          style={
            isActive && themed
              ? { backgroundColor: themed.accent }
              : undefined
          }
        >
          <Icon
            size={15}
            strokeWidth={2.25}
            className={cn(isActive ? 'text-white' : themed?.iconText ?? 'text-primary')}
          />
        </div>
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-[10px] font-semibold leading-tight',
            isActive ? 'text-sidebar-foreground' : 'text-muted-foreground group-hover:text-sidebar-foreground',
          )}
        >
          {item.label}
        </span>
      </motion.button>
    );
  };

  const renderSectionHeader = (label: string, isOpen: boolean, onToggle: () => void) => (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-md px-1.5 py-1 text-left transition-colors hover:bg-sidebar-accent/40"
    >
      <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/90">
        {label}
      </span>
      <motion.div
        animate={{ rotate: isOpen ? 0 : 180 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="text-muted-foreground/70"
      >
        <ChevronUp size={13} strokeWidth={2.5} />
      </motion.div>
    </button>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-[70] h-full w-80 max-w-[85vw] border-r border-sidebar-border bg-sidebar pt-safe shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <TheriaBrandLogo size="md" />
              <TheriaBrandWordmark showSlogan layout="inline" size="lg" />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
            >
              <X size={18} />
            </button>
          </div>

          {/* Streak + theme toggle */}
          <div className="mx-4 mt-3 mb-2 flex items-center gap-2">
            <button
              onClick={() => { onNavigate('streak'); onClose(); }}
              className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2 rounded-lg bg-orange-500/25 hover:bg-orange-500/35 transition-colors"
            >
              <Flame size={16} className="text-orange-400" />
              <div className="w-px h-6 bg-orange-400/50" />
              <div className="flex-1 text-left">
                <p className="text-xs text-orange-600 dark:text-orange-400">Current Streak</p>
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">7 days</p>
              </div>
            </button>
            <ThemeModeToggle
              themeMode={themeMode}
              onCycle={cycleThemeMode}
              size="sm"
              className="shrink-0 rounded-xl border-sidebar-border bg-sidebar-accent shadow-none"
            />
          </div>

          {/* Navigation */}
          <div className="flex-1 min-h-0 flex flex-col px-3 py-2">
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-2.5 pr-0.5">
              <section className="px-0.5">
                {renderSectionHeader('Overview', overviewOpen, () => setOverviewOpen((p) => !p))}
                <AnimatePresence initial={false}>
                  {overviewOpen && (
                    <motion.div
                      key="overview-nav"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 flex items-center gap-1">
                        {overviewItems.map(renderOverviewIcon)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              <section className="px-0.5">
                {renderSectionHeader('Features', featuresOpen, () => setFeaturesOpen((p) => !p))}
                <AnimatePresence initial={false}>
                  {featuresOpen && (
                    <motion.div
                      key="features-nav"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 grid grid-cols-2 gap-1">
                        {[...featurePrimaryItems, ...featureSecondaryItems].map(renderFeatureTile)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>

          </div>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-sidebar-border space-y-1.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`flex-1 min-w-0 flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all text-sidebar-foreground group ${
                  currentScreen === 'profile'
                    ? 'bg-sidebar-accent'
                    : 'bg-sidebar-accent/50 hover:bg-sidebar-accent'
                }`}
                onClick={() => { onNavigate('profile'); onClose(); }}
              >
                <div
                  className={`p-1 rounded-lg transition-all shrink-0 ${
                    currentScreen === 'profile'
                      ? 'bg-primary text-white'
                      : 'text-sidebar-foreground'
                  }`}
                >
                  <User size={16} />
                </div>
                <span className="font-medium text-xs">Profile</span>
              </button>
              <button
                type="button"
                onClick={() => { onNavigate('settings'); onClose(); }}
                title="Settings"
                aria-label="Settings"
                className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                  currentScreen === 'settings'
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-sidebar-border bg-sidebar-accent/50 text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary'
                }`}
              >
                <Settings size={16} />
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-xl bg-destructive/10 hover:bg-destructive text-destructive hover:text-white transition-all group"
            >
              <div className="p-1 rounded-lg transition-all">
                <LogOut size={16} />
              </div>
              <span className="font-medium text-xs">Logout</span>
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 p-3 border-t border-sidebar-border">
            <button
              type="button"
              onClick={() => {
                onNavigate('about');
                onClose();
              }}
              title="About the project & developers"
              aria-label="About the project and developers"
              className={`group shrink-0 flex h-10 w-10 items-center justify-center rounded-xl border transition-all shadow-sm ${
                currentScreen === 'about'
                  ? 'border-primary bg-primary text-white shadow-primary/25'
                  : 'border-sidebar-border bg-sidebar-accent/80 text-primary hover:border-primary/40 hover:bg-primary hover:text-white hover:shadow-md'
              }`}
            >
              <Info size={18} strokeWidth={2.25} className="transition-transform group-hover:scale-105" />
            </button>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[10px] font-medium text-sidebar-foreground leading-tight">
                Theria Finance App
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                © {new Date().getFullYear()} All rights reserved
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                toggleSimpleMode();
                onNavigate('home');
                onClose();
              }}
              title={simpleMode ? 'Switch to advanced mode' : 'Switch to simple mode'}
              aria-label={simpleMode ? 'Switch to advanced mode' : 'Switch to simple mode'}
              aria-pressed={simpleMode}
              className={cn(
                'group shrink-0 flex h-10 w-10 items-center justify-center rounded-xl border transition-all shadow-sm',
                simpleMode
                  ? 'border-primary bg-primary text-white shadow-primary/25'
                  : 'border-sidebar-border bg-sidebar-accent/80 text-muted-foreground hover:border-primary/40 hover:text-primary',
              )}
            >
              {simpleMode ? (
                <Sparkles size={16} strokeWidth={2.25} className="transition-transform group-hover:scale-105" />
              ) : (
                <SlidersHorizontal size={16} strokeWidth={2.25} className="transition-transform group-hover:scale-105" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
