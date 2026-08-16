import {
  BarChart3,
  FileText,
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
  'analysis',
  'profile',
  'activity',
  'notifications',
  'settings',
  'streak',
  'about',
  'chat',
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
  analysis: 'Analysis',
  profile: 'Profile',
  activity: 'Recent Activity',
  notifications: 'Notifications',
  settings: 'Settings',
  streak: 'Streak',
  about: 'About',
  chat: 'Ask Terry',
};

/** Screens whose header offers the filter toggle. */
export const FILTERABLE_SCREENS: readonly Screen[] = [
  'home',
  'budget',
  'analysis',
  'records',
  'activity',
  'streams',
  'accounts',
  'savings',
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
export const SCROLL_LOCK_SCREENS: readonly Screen[] = ['records', 'chat'];

export type NavItem = { id: Screen; icon: LucideIcon; label: string };
export type NavGroup = { id: string; label: string; items: readonly NavItem[] };

/** Pinned as the pill's first slot; never swaps out with a group. */
export const NAV_HOME_ITEM: NavItem = { id: 'home', icon: Home, label: 'Home' };

/**
 * The bottom nav's two swappable groups. Both hold exactly three items so
 * the pill's width stays stable across a switch-toggle. Accent colors are
 * NOT declared here — they live in shared/theme/moduleAccents.ts, keyed by
 * the same `id`, so there is exactly one place a module's color is defined.
 */
export const NAV_GROUPS: readonly NavGroup[] = [
  {
    id: 'core',
    label: 'Core',
    items: [
      { id: 'records', icon: FileText, label: 'Records' },
      { id: 'streams', icon: Waves, label: 'Streams' },
      { id: 'accounts', icon: Wallet, label: 'Accounts' },
    ],
  },
  {
    id: 'planning',
    label: 'Planning',
    items: [
      { id: 'savings', icon: PiggyBank, label: 'Savings' },
      { id: 'budget', icon: Target, label: 'Budget' },
      { id: 'analysis', icon: BarChart3, label: 'Analysis' },
    ],
  },
];

/** Index of the group holding a screen, or -1 if the screen isn't in the pill. */
export const navGroupIndexForScreen = (screen: Screen): number =>
  NAV_GROUPS.findIndex((group) => group.items.some((item) => item.id === screen));
