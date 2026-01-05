import React from 'react';
import { X, Settings, Database, LogOut, Power, User, Moon, Sun, Wallet, Zap, FolderOpen, DollarSign, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const menuItems = [
    { icon: Clock, label: 'Recent Activity', action: () => { onNavigate('activity'); onClose(); } },
    { icon: Wallet, label: 'Accounts', action: () => { onNavigate('accounts'); onClose(); } },
    { icon: Zap, label: 'Streams', action: () => { onNavigate('streams'); onClose(); } },
    { icon: FolderOpen, label: 'Categories', action: () => { onNavigate('categories'); onClose(); } },
    { icon: User, label: 'Profile', action: () => { onNavigate('profile'); onClose(); } },
    { icon: Settings, label: 'Settings', action: () => { onNavigate('profile'); onClose(); } },
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
                <p className="text-sm text-muted-foreground">Finance</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
            >
              <X size={20} />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sidebar-accent transition-all text-sidebar-foreground group"
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Icon size={20} />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sidebar-accent transition-all text-sidebar-foreground group"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <span className="font-medium">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 hover:bg-destructive text-destructive hover:text-white transition-all group"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};