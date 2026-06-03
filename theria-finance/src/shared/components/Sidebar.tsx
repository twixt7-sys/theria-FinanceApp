import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  LogOut,
  User,
  Moon,
  Sun,
  Wallet,
  FolderOpen,
  Clock,
  Target,
  PiggyBank,
  BarChart3,
  Flame,
  FileText,
  Home,
  Newspaper,
  Bell,
  Settings,
  Info,
  ChevronDown,
  ChevronUp,
  FileText as RecordsIcon,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  Minimize2,
} from 'lucide-react';
import { useAuth } from '../../core/state/AuthContext';
import { useTheme } from '../../core/state/ThemeContext';
import { useSimpleMode } from '../../core/state/SimpleModeContext';
import { TheriaBrandLogo, TheriaBrandWordmark } from './TheriaBrandLogo';
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  currentScreen: string;
  showSecondaryFeatures: boolean;
  onToggleSecondaryFeatures: () => void;
  homeTab?: 'dashboard' | 'newsfeed' | 'analysis';
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentScreen,
  showSecondaryFeatures,
  onToggleSecondaryFeatures,
  homeTab = 'dashboard',
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { simpleMode, toggleSimpleMode } = useSimpleMode();
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

  const featureColorStyles: Record<
    string,
    { idle: string; active: string; iconIdle: string; labelIdle: string }
  > = {
    records: {
      idle: 'bg-blue-500/12 hover:bg-blue-500/18',
      active: 'bg-blue-600 text-white shadow-sm',
      iconIdle: 'text-blue-600 dark:text-blue-400',
      labelIdle: 'text-blue-700 dark:text-blue-300',
    },
    streams: {
      idle: 'bg-yellow-500/12 hover:bg-yellow-500/18',
      active: 'bg-yellow-500 text-white shadow-sm',
      iconIdle: 'text-yellow-600 dark:text-yellow-400',
      labelIdle: 'text-yellow-700 dark:text-yellow-300',
    },
    categories: {
      idle: 'bg-violet-500/12 hover:bg-violet-500/18',
      active: 'bg-violet-600 text-white shadow-sm',
      iconIdle: 'text-violet-600 dark:text-violet-400',
      labelIdle: 'text-violet-700 dark:text-violet-300',
    },
    accounts: {
      idle: 'bg-amber-600/12 hover:bg-amber-600/18',
      active: 'bg-amber-700 text-white shadow-sm',
      iconIdle: 'text-amber-700 dark:text-amber-400',
      labelIdle: 'text-amber-800 dark:text-amber-300',
    },
    budget: {
      idle: 'bg-orange-500/12 hover:bg-orange-500/18',
      active: 'bg-orange-500 text-white shadow-sm',
      iconIdle: 'text-orange-600 dark:text-orange-400',
      labelIdle: 'text-orange-700 dark:text-orange-300',
    },
    savings: {
      idle: 'bg-pink-500/12 hover:bg-pink-500/18',
      active: 'bg-pink-500 text-white shadow-sm',
      iconIdle: 'text-pink-600 dark:text-pink-400',
      labelIdle: 'text-pink-700 dark:text-pink-300',
    },
  };

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

  const renderIconGridItem = (item: SidebarGridItem) => {
    const Icon = item.icon;
    const isActive =
      item.screen === 'newsfeed'
        ? currentScreen === 'home' && homeTab === 'newsfeed'
        : item.screen === 'home'
          ? currentScreen === 'home' && homeTab !== 'newsfeed'
          : currentScreen === item.screen;
    const themed = item.featureColor ? featureColorStyles[item.featureColor] : null;

    return (
      <button
        key={item.screen}
        onClick={() => { onNavigate(item.screen); onClose(); }}
        className={`w-full flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 transition-colors ${
          themed
            ? isActive
              ? themed.active
              : themed.idle
            : isActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-sidebar-accent text-muted-foreground hover:text-sidebar-foreground'
        }`}
      >
        <div className="rounded-md p-1.5">
          <Icon
            size={16}
            className={
              themed
                ? isActive
                  ? 'text-white'
                  : themed.iconIdle
                : isActive
                  ? 'text-primary-foreground'
                  : 'text-primary'
            }
          />
        </div>
        <span
          className={`text-[9px] font-medium leading-tight ${
            themed ? (isActive ? 'text-white' : themed.labelIdle) : ''
          }`}
        >
          {item.label}
        </span>
      </button>
    );
  };

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
            <div className="flex items-start gap-3">
              <TheriaBrandLogo size="md" className="mt-0.5" />
              <TheriaBrandWordmark showSlogan layout="inline" />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
            >
              <X size={18} />
            </button>
          </div>

          {/* User summary */}
          <div className="px-4 pt-3 pb-2.5 border-b border-sidebar-border/80 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-md">
                  <span className="text-xs font-semibold">
                    {user?.username?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-sidebar-foreground truncate">
                    {user?.username}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-xl bg-sidebar-accent text-sidebar-foreground hover:bg-primary hover:text-white transition-colors"
                title={theme === 'light' ? 'Dark mode' : 'Light mode'}
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            </div>
          </div>

          {/* Streak Section */}
          <button
            onClick={() => { onNavigate('streak'); onClose(); }}
            className="flex items-center gap-3 px-4 mt-3 mb-2 py-2 rounded-lg bg-orange-500/25 mx-4 hover:bg-orange-500/35 transition-colors"
          >
            <Flame size={16} className="text-orange-400" />
            <div className="w-px h-6 bg-orange-400/50" />
            <div className="flex-1 text-left">
              <p className="text-xs text-orange-600 dark:text-orange-400">Current Streak</p>
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">7 days</p>
            </div>
          </button>

          {/* Menu Items */}
          <div className="flex-1 min-h-0 flex flex-col px-3 py-2.5">
            <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setOverviewOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-2 text-[10px] uppercase tracking-wide text-muted-foreground"
              >
                <span>Overview</span>
                <motion.div
                  animate={{ rotate: overviewOpen ? 0 : 180 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <ChevronUp size={14} />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {overviewOpen && (
                  <motion.div
                    key="overview-grid"
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                      {overviewItems.map(renderIconGridItem)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setFeaturesOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-2 text-[10px] uppercase tracking-wide text-muted-foreground"
              >
                <span>Features</span>
                <motion.div
                  animate={{ rotate: featuresOpen ? 0 : 180 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <ChevronUp size={14} />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {featuresOpen && (
                  <motion.div
                    key="features-grid"
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-5 gap-1.5 justify-items-start">
                        {featurePrimaryItems.map(renderIconGridItem)}
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-sidebar-accent/30 px-2.5 py-1.5">
                        <p className="text-[10px] text-muted-foreground">
                          Bottom nav: Budget & Savings
                          {simpleMode && (
                            <span className="text-primary/70"> · overrides simple mode</span>
                          )}
                        </p>
                        <motion.button
                          type="button"
                          onClick={onToggleSecondaryFeatures}
                          whileTap={{ scale: 0.94 }}
                          className="text-primary hover:text-primary/80 transition-colors"
                          title={
                            showSecondaryFeatures
                              ? simpleMode
                                ? 'Hide Budget & Savings from bottom nav (simple mode stays on)'
                                : 'Hide Budget & Savings from bottom navigation'
                              : simpleMode
                                ? 'Show Budget & Savings in bottom nav — overrides simple mode'
                                : 'Show Budget & Savings in bottom navigation'
                          }
                        >
                          <motion.div
                            animate={{ scale: showSecondaryFeatures ? 1 : 0.96 }}
                            transition={{ duration: 0.16, ease: 'easeOut' }}
                          >
                            {showSecondaryFeatures ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </motion.div>
                        </motion.button>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 justify-items-start">
                        {featureSecondaryItems.map(renderIconGridItem)}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            </div>

            <div className="shrink-0 pt-2 mt-2 border-t border-sidebar-border/50">
              <div className="flex items-center justify-between rounded-lg bg-sidebar-accent px-2.5 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Minimize2 size={14} className="shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-[11px] font-medium text-sidebar-foreground">Simple mode</p>
                    <p className="text-[9px] text-muted-foreground">Streamlined navigation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    toggleSimpleMode();
                    onNavigate('home');
                    onClose();
                  }}
                  className="shrink-0 text-primary hover:text-primary/80 transition-colors"
                  title={simpleMode ? 'Turn off simple mode' : 'Turn on simple mode'}
                  aria-pressed={simpleMode}
                >
                  {simpleMode ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                </button>
              </div>
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
          </div>
        </div>
      </div>
    </>
  );
};
