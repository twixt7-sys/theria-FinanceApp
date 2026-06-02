import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  LogOut,
  User,
  Moon,
  Sun,
  Wallet,
  Zap,
  FolderOpen,
  DollarSign,
  Clock,
  Target,
  PiggyBank,
  BarChart3,
  Flame,
  FileText,
  Home,
  Bell,
  Settings,
  Info,
  ChevronDown,
  ChevronUp,
  FileText as RecordsIcon,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useAuth } from '../../core/state/AuthContext';
import { useTheme } from '../../core/state/ThemeContext';
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  currentScreen: string;
  showSecondaryFeatures: boolean;
  onToggleSecondaryFeatures: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentScreen,
  showSecondaryFeatures,
  onToggleSecondaryFeatures,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [featuresOpen, setFeaturesOpen] = useState(true);

  const handleLogout = () => {
    logout();
    onClose();
  };

  const overviewItems = [
    { icon: Home, label: 'Home', screen: 'home' },
    { icon: Bell, label: 'Notifs', screen: 'notifications' },
    { icon: Clock, label: 'Activity', screen: 'activity' },
    { icon: BarChart3, label: 'Analysis', screen: 'analysis' },
  ];

  const featurePrimaryItems = [
    { icon: RecordsIcon, label: 'Records', screen: 'records' },
    { icon: TrendingUp, label: 'Streams', screen: 'streams' },
    { icon: FolderOpen, label: 'Categories', screen: 'categories' },
    { icon: Wallet, label: 'Accounts', screen: 'accounts' },
  ];

  const featureSecondaryItems = [
    { icon: Target, label: 'Budget', screen: 'budget' },
    { icon: PiggyBank, label: 'Savings', screen: 'savings' },
  ];

  const renderIconGridItem = (item: { icon: React.ElementType; label: string; screen: string }) => {
    const Icon = item.icon;
    const isActive = currentScreen === item.screen;
    return (
      <button
        key={item.screen}
        onClick={() => { onNavigate(item.screen); onClose(); }}
        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 transition-all ${
          isActive
            ? 'text-primary'
            : 'text-sidebar-foreground hover:text-primary'
        }`}
      >
        <div className={`rounded-lg p-1.5 transition-all ${isActive ? 'bg-primary text-white shadow-sm' : 'text-primary'}`}>
          <Icon size={14} />
        </div>
        <span className="text-[9px] font-medium leading-tight">{item.label}</span>
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
                <DollarSign size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-semibold text-sidebar-foreground text-sm">Theria</h3>
                <p className="text-xs text-muted-foreground">
                  Smart finance overview
                </p>
              </div>
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
          <div className="flex-1 px-3 py-2.5 space-y-4 overflow-y-auto">
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
                    <div className="grid grid-cols-4 gap-2 pt-1">
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
                      <div className="grid grid-cols-4 gap-2">
                        {featurePrimaryItems.map(renderIconGridItem)}
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-sidebar-accent/30 px-2.5 py-1.5">
                        <p className="text-[10px] text-muted-foreground">Show Budget & Savings</p>
                        <motion.button
                          type="button"
                          onClick={onToggleSecondaryFeatures}
                          whileTap={{ scale: 0.94 }}
                          className="text-primary hover:text-primary/80 transition-colors"
                          title={showSecondaryFeatures ? 'Hide secondary features' : 'Show secondary features'}
                        >
                          <motion.div
                            animate={{ scale: showSecondaryFeatures ? 1 : 0.96 }}
                            transition={{ duration: 0.16, ease: 'easeOut' }}
                          >
                            {showSecondaryFeatures ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </motion.div>
                        </motion.button>
                      </div>
                      <AnimatePresence initial={false}>
                        {showSecondaryFeatures && (
                          <motion.div
                            key="secondary-features"
                            initial={{ opacity: 0, height: 0, y: -3 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -3 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-4 gap-2">
                              {featureSecondaryItems.map(renderIconGridItem)}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-sidebar-border space-y-1.5">
            <button
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all text-sidebar-foreground group ${
                currentScreen === 'settings'
                  ? 'bg-sidebar-accent'
                  : 'bg-sidebar-accent/50 hover:bg-sidebar-accent'
              }`}
              onClick={() => { onNavigate('settings'); onClose(); }}
            >
              <div className={`p-1 rounded-lg transition-all ${
                currentScreen === 'settings'
                  ? 'bg-primary text-white'
                  : 'text-sidebar-foreground'
              }`}>
                <Settings size={16} />
              </div>
              <span className="font-medium text-xs">Settings</span>
            </button>
            <button
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all text-sidebar-foreground group ${
                currentScreen === 'profile'
                  ? 'bg-sidebar-accent'
                  : 'bg-sidebar-accent/50 hover:bg-sidebar-accent'
              }`}
              onClick={() => { onNavigate('profile'); onClose(); }}
            >
              <div className={`p-1 rounded-lg transition-all ${
                currentScreen === 'profile'
                  ? 'bg-primary text-white'
                  : 'text-sidebar-foreground'
              }`}>
                <User size={16} />
              </div>
              <span className="font-medium text-xs">Profile</span>
            </button>

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
