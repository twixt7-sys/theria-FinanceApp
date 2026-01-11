import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  HelpCircle, 
  FileText, 
  Database,
  Smartphone,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';

export const SettingsScreen: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(theme === 'dark');
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [biometric, setBiometric] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    toggleTheme();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Profile Section */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
            <span className="text-xl font-semibold">
              {user?.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{user?.username}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge variant="outline" className="mt-1">Free Plan</Badge>
          </div>
        </div>
        <Button variant="outline" className="w-full">
          <User size={16} className="mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Appearance */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Palette size={20} />
          Appearance
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
            </div>
            <Switch 
              checked={darkMode} 
              onCheckedChange={handleDarkModeToggle}
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Bell size={20} />
          Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive push notifications</p>
            </div>
            <Switch 
              checked={notifications} 
              onCheckedChange={setNotifications}
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield size={20} />
          Security
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Biometric Authentication</Label>
              <p className="text-sm text-muted-foreground">Use fingerprint or face ID</p>
            </div>
            <Switch 
              checked={biometric} 
              onCheckedChange={setBiometric}
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Globe size={20} />
          Preferences
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium mb-2 block">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-base font-medium mb-2 block mt-4">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Data & Storage */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Database size={20} />
          Data & Storage
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Auto Backup</Label>
              <p className="text-sm text-muted-foreground">Automatically backup your data</p>
            </div>
            <Switch 
              checked={autoBackup} 
              onCheckedChange={setAutoBackup}
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Database size={16} className="mr-2" />
              Export Data
            </Button>
            <Button variant="outline" className="flex-1">
              <Database size={16} className="mr-2" />
              Import Data
            </Button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <HelpCircle size={20} />
          About
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Version</span>
            <span className="text-sm font-medium">1.0.0</span>
          </div>
          <Separator />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <FileText size={14} className="mr-2" />
              Terms of Service
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <FileText size={14} className="mr-2" />
              Privacy Policy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
