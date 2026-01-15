import React from 'react';
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
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  currentScreen: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate, currentScreen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const primarySections = [
    {
      title: 'Overview',
      items: [
        { icon: Home, label: 'Home', screen: 'home', action: () => { onNavigate('home'); onClose(); } },
        { icon: Bell, label: 'Notifications', screen: 'notifications', action: () => { onNavigate('notifications'); onClose(); } },
        { icon: Clock, label: 'Recent Activity', screen: 'activity', action: () => { onNavigate('activity'); onClose(); } },
        { icon: BarChart3, label: 'Analysis', screen: 'analysis', action: () => { onNavigate('analysis'); onClose(); } },
      ],
    },
  ];

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
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-sidebar border-r border-sidebar-border z-[70] transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
                <DollarSign size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-semibold text-sidebar-foreground">Theria</h3>
                <p className="text-xs text-muted-foreground">
                  Smart finance overview
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
            >
              <X size={20} />
            </button>
          </div>

          {/* User summary */}
          <div className="px-6 pt-4 pb-3 border-b border-sidebar-border/80 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-md">
                  <span className="text-sm font-semibold">
                    {user?.username?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">
                    {user?.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-sidebar-accent text-sidebar-foreground hover:bg-primary hover:text-white transition-colors"
                title={theme === 'light' ? 'Dark mode' : 'Light mode'}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </div>
          </div>

          {/* Streak Section */}
          <div className="bg-orange-500/20 backdrop-blur-sm rounded-xl p-3 border border-orange-400/30 mx-4 mt-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-orange-500/30 p-1.5 rounded-lg">
                <Flame size={16} className="text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-sidebar-foreground/80 font-medium">Current Streak</p>
                <p className="text-lg font-bold text-sidebar-foreground">7 days</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 px-4 py-3 space-y-5 overflow-y-auto">
            {primarySections.map(section => (
              <div key={section.title} className="space-y-2">
                <p className="px-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                  {section.title}
                </p>
                {section.title === 'Money Management' ? (
                  <div className="grid grid-cols-2 gap-2">
                    {section.items.map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          onClick={item.action}
                          className="flex flex-col items-center gap-2 px-3 py-3 rounded-xl hover:bg-sidebar-accent transition-all text-sidebar-foreground group"
                        >
                          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <Icon size={16} />
                          </div>
                          <span className="font-medium text-xs text-center">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {section.items.map(item => {
                      const Icon = item.icon;
                      const isActive = currentScreen === item.screen;
                      return (
                        <button
                          key={item.label}
                          onClick={item.action}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sidebar-foreground group ${
                            isActive 
                              ? 'bg-sidebar-accent' 
                              : 'hover:bg-sidebar-accent'
                          }`}
                        >
                          <div className={`p-2 rounded-lg transition-all ${
                            isActive 
                              ? 'bg-primary text-white' 
                              : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                          }`}>
                            <Icon size={18} />
                          </div>
                          <span className="font-medium text-sm">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <button
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-sidebar-foreground group ${
                currentScreen === 'settings'
                  ? 'bg-sidebar-accent'
                  : 'bg-sidebar-accent/50 hover:bg-sidebar-accent'
              }`}
              onClick={() => { onNavigate('settings'); onClose(); }}
            >
              <div className={`p-1.5 rounded-lg transition-all ${
                currentScreen === 'settings'
                  ? 'bg-primary text-white'
                  : 'text-sidebar-foreground'
              }`}>
                <Settings size={18} />
              </div>
              <span className="font-medium text-sm">Settings</span>
            </button>
            <button
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-sidebar-foreground group ${
                currentScreen === 'profile'
                  ? 'bg-sidebar-accent'
                  : 'bg-sidebar-accent/50 hover:bg-sidebar-accent'
              }`}
              onClick={() => { onNavigate('profile'); onClose(); }}
            >
              <div className={`p-1.5 rounded-lg transition-all ${
                currentScreen === 'profile'
                  ? 'bg-primary text-white'
                  : 'text-sidebar-foreground'
              }`}>
                <User size={18} />
              </div>
              <span className="font-medium text-sm">Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-xl bg-destructive/10 hover:bg-destructive text-destructive hover:text-white transition-all group"
            >
              <div className="p-1.5 rounded-lg transition-all">
                <LogOut size={18} />
              </div>
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <p className="text-xs text-muted-foreground text-center">
              Theria Finance App
            </p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              © 2024 All rights reserved
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
