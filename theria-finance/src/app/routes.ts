import {
  FileText,
  FolderOpen,
  Home,
  PiggyBank,
  Target,
  Wallet,
  Waves,
  type LucideIcon,
} from 'lucide-react';

/**
 * Screen ids double as URL segments and as the keys used by the guided
 * tutorial (TutorialTourId) and the simple-mode FAB guides, so they must not
 * be renamed without updating those maps.
 */
export const SCREENS = [
  'home',
  'records',
  'budget',
  'savings',
  'streams',
  'accounts',
  'categories',
  'analysis',
  'profile',
  'activity',
  'notifications',
  'settings',
  'streak',
  'about',
] as const;

export type Screen = (typeof SCREENS)[number];

export const pathFor = (screen: Screen): string => (screen === 'home' ? '/' : `/${screen}`);

/** Unknown paths fall back to home, matching the old switch's default branch. */
export const screenFromPath = (pathname: string): Screen => {
  const segment = pathname.split('/')[1] ?? '';
  if (segment === '') return 'home';
  return (SCREENS as readonly string[]).includes(segment) ? (segment as Screen) : 'home';
};

export const SCREEN_TITLES: Record<Screen, string> = {
  home: 'Dashboard',
  records: 'Records',
  budget: 'Budget',
  savings: 'Savings',
  streams: 'Streams',
  accounts: 'Accounts',
  categories: 'Categories',
  analysis: 'Analysis',
  profile: 'Profile',
  activity: 'Recent Activity',
  notifications: 'Notifications',
  settings: 'Settings',
  streak: 'Streak',
  about: 'About',
};

/** Screens whose header offers the filter toggle. */
export const FILTERABLE_SCREENS: readonly Screen[] = [
  'home',
  'budget',
  'analysis',
  'records',
  'activity',
  'streams',
  'categories',
  'accounts',
];

/** Screens where the filter panel shows the time range control. */
export const TIME_FILTER_SCREENS: readonly Screen[] = [
  'home',
  'budget',
  'analysis',
  'records',
  'activity',
  'accounts',
];

/** Screens that manage their own scrolling instead of the page scrolling. */
export const SCROLL_LOCK_SCREENS: readonly Screen[] = ['records'];

export type NavItem = { id: Screen; icon: LucideIcon; label: string; color: string };

export const NAV_ITEMS: NavItem[] = [
  { id: 'records', icon: FileText, label: 'Records', color: 'blue' },
  { id: 'streams', icon: Waves, label: 'Streams', color: 'yellow' },
  { id: 'budget', icon: Target, label: 'Budget', color: 'peach' },
  { id: 'home', icon: Home, label: 'Home', color: 'primary' },
  { id: 'savings', icon: PiggyBank, label: 'Savings', color: 'pink' },
  { id: 'categories', icon: FolderOpen, label: 'Categories', color: 'violet' },
  { id: 'accounts', icon: Wallet, label: 'Accounts', color: 'brown' },
];

/** Hidden with the secondary features toggle in the sidebar. */
export const SECONDARY_NAV_IDS: readonly Screen[] = ['budget', 'savings'];
