import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, useNavigate } from 'react-router';
import { AppShell } from './layout/AppShell';
import { useScreenFilterProps, useUi } from './state/UiContext';
import { pathFor, type Screen } from './routes';

/**
 * Each screen is its own chunk, so a route downloads only what it renders.
 * Naming the export keeps the component's prop types intact, which is what
 * type-checks the adapters below.
 */
const HomeScreen = lazy(() => import('./screens/HomeScreen').then((m) => ({ default: m.HomeScreen })));
const RecordsScreen = lazy(() => import('../features/records/screens/RecordsScreen').then((m) => ({ default: m.RecordsScreen })));
const BudgetScreen = lazy(() => import('../features/budgets/screens/BudgetScreen').then((m) => ({ default: m.BudgetScreen })));
const SavingsScreen = lazy(() => import('../features/savings/screens/SavingsScreen').then((m) => ({ default: m.SavingsScreen })));
const StreamsScreen = lazy(() => import('../features/streams/screens/StreamsScreen').then((m) => ({ default: m.StreamsScreen })));
const AccountsScreen = lazy(() => import('../features/account_management/screens/AccountsScreen').then((m) => ({ default: m.AccountsScreen })));
const AnalysisScreen = lazy(() => import('../features/analysis/screens/AnalysisScreen').then((m) => ({ default: m.AnalysisScreen })));
const ProfileScreen = lazy(() => import('../features/profile/screens/ProfileScreen').then((m) => ({ default: m.ProfileScreen })));
const RecentActivityScreen = lazy(() => import('../features/activity_logging/screens/RecentActivityScreen').then((m) => ({ default: m.RecentActivityScreen })));
const NotificationsScreen = lazy(() => import('../features/notifications/screens/NotificationsScreen').then((m) => ({ default: m.NotificationsScreen })));
const SettingsScreen = lazy(() => import('../features/settings/screens/SettingsScreen').then((m) => ({ default: m.SettingsScreen })));
const StreakScreen = lazy(() => import('../features/streaks/screens/StreakScreen').then((m) => ({ default: m.StreakScreen })));
const AboutScreen = lazy(() => import('../features/about/screens/AboutScreen').then((m) => ({ default: m.AboutScreen })));
const AuthScreen = lazy(() => import('../features/authentication/screens/AuthScreen').then((m) => ({ default: m.AuthScreen })));
const ChatScreen = lazy(() => import('../features/terry/chat/ChatScreen').then((m) => ({ default: m.ChatScreen })));

/* Adapters: feed shell state to the screens so the screens stay unchanged. */

const HomeRoute = () => {
  const navigate = useNavigate();
  const ui = useUi();
  return (
    <HomeScreen
      onNavigate={(screen: string) => navigate(pathFor(screen as Screen))}
      timeFilter={ui.timeFilter}
      onTimeFilterChange={ui.setTimeFilter}
      currentDate={ui.currentDate}
      onNavigateDate={ui.navigateDate}
      activeTab={ui.homeTab}
      onActiveTabChange={ui.setHomeTab}
      onOpenTimeFilter={ui.openTimeFilter}
      onQuickAddRecord={(type) => ui.openAdd('record', type)}
    />
  );
};

const AnalysisRoute = () => <AnalysisScreen {...useScreenFilterProps()} />;
const ActivityRoute = () => <RecentActivityScreen {...useScreenFilterProps()} />;

const RecordsRoute = () => {
  const filterProps = useScreenFilterProps();
  const { filterOpen } = useUi();
  return <RecordsScreen {...filterProps} filterOpen={filterOpen} />;
};

const BudgetRoute = () => {
  const filterProps = useScreenFilterProps();
  const { filterOpen } = useUi();
  return <BudgetScreen {...filterProps} filterOpen={filterOpen} />;
};

const SavingsRoute = () => {
  const filterProps = useScreenFilterProps();
  const { filterOpen } = useUi();
  return <SavingsScreen {...filterProps} filterOpen={filterOpen} />;
};

const AccountsRoute = () => {
  const filterProps = useScreenFilterProps();
  const { filterOpen } = useUi();
  return <AccountsScreen {...filterProps} filterOpen={filterOpen} />;
};

const StreamsRoute = () => <StreamsScreen filterOpen={useUi().filterOpen} />;

export const router = createBrowserRouter([
  // Sign-in is full-screen, outside the app chrome.
  {
    path: '/auth',
    element: (
      <Suspense fallback={null}>
        <AuthScreen />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: 'records', element: <RecordsRoute /> },
      { path: 'budget', element: <BudgetRoute /> },
      { path: 'savings', element: <SavingsRoute /> },
      { path: 'analysis', element: <AnalysisRoute /> },
      { path: 'activity', element: <ActivityRoute /> },
      { path: 'accounts', element: <AccountsRoute /> },
      { path: 'streams', element: <StreamsRoute /> },
      // Categories is no longer its own screen — each category now lives
      // inside the module that owns it (Accounts, Streams, Records, Budget,
      // Savings). Send old links/bookmarks somewhere sensible.
      { path: 'categories', element: <Navigate to="/accounts" replace /> },
      { path: 'profile', element: <ProfileScreen /> },
      { path: 'notifications', element: <NotificationsScreen /> },
      { path: 'settings', element: <SettingsScreen /> },
      { path: 'streak', element: <StreakScreen /> },
      { path: 'about', element: <AboutScreen /> },
      { path: 'chat', element: <ChatScreen /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
