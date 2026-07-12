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
  Code2,
  Sparkles,
  Lightbulb,
  BellRing,
  Trash2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../../../core/state/AuthContext';
import { useAlert } from '../../../core/state/AlertContext';
import { useTheme } from '../../../core/state/ThemeContext';
import { ColorThemePicker } from '../../../shared/components/ColorThemePicker';
import { useData } from '../../../core/state/DataContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { getCurrencyLabel } from '../../../shared/lib/currencies';
import {
  SettingsGroup,
  SettingsPageHeader,
  SettingsRow,
  SettingsToggleRow,
} from '../components/SettingsNav';
import { SettingsCurrencyPage } from './SettingsCurrencyPage';
import { readReminderSchedule, requestGuidedSetup } from '../../../core/lib/onboardingStorage';
import { clearAllDismissedHints } from '../../../core/lib/simpleModeHintStorage';
import { clearAllDismissedFabGuides } from '../../../core/lib/simpleModeFabGuideStorage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../shared/components/ui/alert-dialog';

type SettingsPage =
  | 'hub'
  | 'account'
  | 'appearance'
  | 'notifications'
  | 'security'
  | 'regional'
  | 'currency'
  | 'data'
  | 'about'
  | 'developer';

const pageMotion = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
  transition: { duration: 0.18 },
};

export const SettingsScreen: React.FC = () => {
  const { user } = useAuth();
  const {
    appearanceHint,
    backgroundStyle,
    colorTheme,
    setBackgroundStyle,
    setColorTheme,
    setThemeMode,
    themeMode,
  } = useTheme();
  const { accounts, streams, categories, records, budgets, savings, clearDatabase, populateDatabase } =
    useData();
  const { mainCurrency, enabledCurrencies } = useCurrency();
  const { showDeleteAlert, showSuccessAlert } = useAlert();

  const [page, setPage] = useState<SettingsPage>('hub');
  const [devConfirm, setDevConfirm] = useState<'clear' | 'populate' | 'factory' | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [language, setLanguage] = useState('en');

  const languageLabel =
    { en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch', zh: '中文' }[language] ??
    'English';

  const regionalHint = `${languageLabel} · ${mainCurrency}${
    enabledCurrencies.length > 1 ? ` +${enabledCurrencies.length - 1}` : ''
  }`;

  const goHub = () => setPage('hub');

  const handleDevConfirm = () => {
    if (devConfirm === 'clear') {
      clearDatabase();
      showDeleteAlert('Database cleared', 'All local accounts, records, budgets, and savings were removed.');
    } else if (devConfirm === 'populate') {
      populateDatabase();
      showSuccessAlert('Database populated', 'Rich sample data is loaded and ready to explore.');
    } else if (devConfirm === 'factory') {
      Object.keys(localStorage)
        .filter((key) => key.startsWith('theria-'))
        .forEach((key) => localStorage.removeItem(key));
      window.location.reload();
      return;
    }
    setDevConfirm(null);
  };

  const handleResetHints = () => {
    clearAllDismissedHints();
    clearAllDismissedFabGuides();
    showSuccessAlert('Hints reset', 'Simple mode hints and FAB guides will show again on each screen.');
  };

  const renderHub = () => (
    <motion.div key="hub" {...pageMotion} className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/40 px-3.5 py-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/90 text-sm font-semibold text-primary-foreground">
          {user?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-foreground">{user?.username}</p>
          <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
        </div>
        <span className="rounded-md border border-border/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          Free
        </span>
      </div>

      <SettingsGroup>
        <SettingsRow
          icon={User}
          label="Account"
          hint="Profile and plan"
          onClick={() => setPage('account')}
        />
        <SettingsRow
          icon={Palette}
          label="Appearance"
          hint={appearanceHint}
          onClick={() => setPage('appearance')}
        />
        <SettingsRow
          icon={Bell}
          label="Notifications"
          hint={notifications ? 'On' : 'Off'}
          onClick={() => setPage('notifications')}
        />
        <SettingsRow
          icon={Shield}
          label="Security"
          hint="Biometrics and privacy"
          onClick={() => setPage('security')}
        />
        <SettingsRow
          icon={Globe}
          label="Regional"
          hint={regionalHint}
          onClick={() => setPage('regional')}
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          icon={Database}
          label="Data & backup"
          hint={autoBackup ? 'Auto backup on' : 'Manual only'}
          onClick={() => setPage('data')}
        />
        <SettingsRow
          icon={HelpCircle}
          label="About"
          hint="Version 1.0.0"
          onClick={() => setPage('about')}
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          icon={Code2}
          label="Developer"
          hint="Local testing tools"
          onClick={() => setPage('developer')}
        />
      </SettingsGroup>
    </motion.div>
  );

  const renderAccount = () => (
    <motion.div key="account" {...pageMotion}>
      <SettingsPageHeader title="Account" onBack={goHub} />
      <SettingsGroup>
        <SettingsRow label="Edit profile" hint="Coming soon" showChevron={false} />
        <SettingsRow label="Email" hint={user?.email} showChevron={false} />
        <SettingsRow label="Plan" hint="Free" showChevron={false} />
      </SettingsGroup>
    </motion.div>
  );

  const renderAppearance = () => (
    <motion.div key="appearance" {...pageMotion}>
      <SettingsPageHeader title="Appearance" subtitle="Theme and display" onBack={goHub} />
      <div className="rounded-xl border border-border/50 bg-card/40 p-3.5">
        <ColorThemePicker
          colorTheme={colorTheme}
          themeMode={themeMode}
          backgroundStyle={backgroundStyle}
          onColorThemeChange={setColorTheme}
          onThemeModeChange={setThemeMode}
          onBackgroundChange={setBackgroundStyle}
        />
      </div>
    </motion.div>
  );

  const renderNotifications = () => (
    <motion.div key="notifications" {...pageMotion}>
      <SettingsPageHeader title="Notifications" onBack={goHub} />
      <SettingsGroup>
        <SettingsToggleRow
          label="Push notifications"
          hint="Alerts for activity and goals"
          checked={notifications}
          onCheckedChange={setNotifications}
        />
      </SettingsGroup>
    </motion.div>
  );

  const renderSecurity = () => (
    <motion.div key="security" {...pageMotion}>
      <SettingsPageHeader title="Security" onBack={goHub} />
      <SettingsGroup>
        <SettingsToggleRow
          label="Biometric unlock"
          hint="Fingerprint or face ID"
          checked={biometric}
          onCheckedChange={setBiometric}
        />
      </SettingsGroup>
    </motion.div>
  );

  const renderRegional = () => (
    <motion.div key="regional" {...pageMotion}>
      <SettingsPageHeader title="Regional" subtitle="Language and money" onBack={goHub} />
      <SettingsGroup title="Language">
        <div className="px-3.5 py-3">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="h-9 border-border/60 bg-muted/20 text-[13px] shadow-none">
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
      </SettingsGroup>

      <div className="mt-4">
        <SettingsGroup title="Money">
          <SettingsRow
            icon={Globe}
            label="Currencies"
            hint={`Main: ${mainCurrency} · ${getCurrencyLabel(mainCurrency)}`}
            onClick={() => setPage('currency')}
          />
        </SettingsGroup>
      </div>
    </motion.div>
  );

  const renderData = () => (
    <motion.div key="data" {...pageMotion}>
      <SettingsPageHeader title="Data & backup" onBack={goHub} />
      <SettingsGroup>
        <SettingsToggleRow
          label="Auto backup"
          hint="Save data locally on changes"
          checked={autoBackup}
          onCheckedChange={setAutoBackup}
        />
        <SettingsRow label="Export data" hint="Download a backup file" showChevron={false} />
        <SettingsRow label="Import data" hint="Restore from a file" showChevron={false} />
      </SettingsGroup>
    </motion.div>
  );

  const renderAbout = () => (
    <motion.div key="about" {...pageMotion}>
      <SettingsPageHeader title="About" onBack={goHub} />
      <SettingsGroup>
        <SettingsRow label="Version" hint="1.0.0" showChevron={false} />
        <SettingsRow icon={FileText} label="Terms of service" showChevron={false} />
        <SettingsRow icon={FileText} label="Privacy policy" showChevron={false} />
      </SettingsGroup>
    </motion.div>
  );

  const renderDeveloper = () => {
    const storageBytes = Object.keys(localStorage)
      .filter((key) => key.startsWith('theria-'))
      .reduce((total, key) => total + (localStorage.getItem(key)?.length ?? 0), 0);
    const reminder = readReminderSchedule();
    const reminderHint = reminder
      ? reminder.enabled
        ? `${reminder.frequency} at ${reminder.time}`
        : 'Saved, but disabled'
      : 'Not set';

    const dataStats = [
      { label: 'Accounts', value: accounts.length },
      { label: 'Streams', value: streams.length },
      { label: 'Categories', value: categories.length },
      { label: 'Records', value: records.length },
      { label: 'Budgets', value: budgets.length },
      { label: 'Savings', value: savings.length },
    ];

    return (
      <motion.div key="developer" {...pageMotion} className="space-y-4">
        <SettingsPageHeader
          title="Developer"
          subtitle="Frontend-only tools for local testing"
          onBack={goHub}
        />

        <SettingsGroup title="Onboarding">
          <SettingsRow
            icon={Sparkles}
            label="Run guided setup"
            hint="Re-launch Terry's setup wizard; picked templates are added on top of existing data"
            onClick={requestGuidedSetup}
          />
          <SettingsRow
            icon={Lightbulb}
            label="Reset simple mode hints"
            hint="Show all dismissed hints and FAB guides again"
            onClick={handleResetHints}
            showChevron={false}
          />
          <SettingsRow
            icon={BellRing}
            label="Reminder schedule"
            hint={reminderHint}
            showChevron={false}
          />
        </SettingsGroup>

        <SettingsGroup title="Database">
          <div className="px-3.5 py-3">
            <div className="grid grid-cols-3 gap-2">
              {dataStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-border/40 bg-muted/20 px-2 py-1.5 text-center"
                >
                  <p className="text-[13px] font-semibold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Local storage: {(storageBytes / 1024).toFixed(1)} KB across theria-* keys
            </p>
          </div>
          <div className="flex gap-2 px-3.5 py-3">
            <button
              type="button"
              onClick={() => setDevConfirm('clear')}
              className="flex-1 rounded-xl border border-border/60 py-2.5 text-[12px] font-medium text-foreground transition-colors hover:bg-muted/50"
            >
              Clear database
            </button>
            <button
              type="button"
              onClick={() => setDevConfirm('populate')}
              className="flex-1 rounded-xl bg-primary py-2.5 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Populate database
            </button>
          </div>
        </SettingsGroup>

        <SettingsGroup title="Danger zone">
          <SettingsRow
            icon={Trash2}
            label="Factory reset"
            hint="Wipe every theria-* key (session, data, preferences) and reload"
            onClick={() => setDevConfirm('factory')}
            showChevron={false}
          />
        </SettingsGroup>
      </motion.div>
    );
  };

  const renderPage = () => {
    switch (page) {
      case 'hub':
        return renderHub();
      case 'account':
        return renderAccount();
      case 'appearance':
        return renderAppearance();
      case 'notifications':
        return renderNotifications();
      case 'security':
        return renderSecurity();
      case 'regional':
        return renderRegional();
      case 'currency':
        return (
          <motion.div key="currency" {...pageMotion}>
            <SettingsCurrencyPage onBack={() => setPage('regional')} />
          </motion.div>
        );
      case 'data':
        return renderData();
      case 'about':
        return renderAbout();
      case 'developer':
        return renderDeveloper();
      default:
        return renderHub();
    }
  };

  return (
    <div className="pb-6 max-w-lg mx-auto">
      <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>

      <AlertDialog open={devConfirm !== null} onOpenChange={() => setDevConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {devConfirm === 'clear'
                ? 'Clear database?'
                : devConfirm === 'factory'
                  ? 'Factory reset?'
                  : 'Populate database?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {devConfirm === 'clear'
                ? 'This removes all local finance data (accounts, records, streams, budgets, and savings). This cannot be undone.'
                : devConfirm === 'factory'
                  ? 'This wipes ALL Theria storage on this device — session, finance data, theme, currencies, and hints — then reloads the app to the login screen. This cannot be undone.'
                  : 'This loads rich sample data into the app and replaces your current local dataset.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDevConfirm}
              className={
                devConfirm === 'clear' || devConfirm === 'factory'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : undefined
              }
            >
              {devConfirm === 'clear'
                ? 'Clear everything'
                : devConfirm === 'factory'
                  ? 'Wipe and reload'
                  : 'Populate sample data'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
