import type { SimpleModePage } from './simpleModeHints';

export type SimpleModeFabAction =
  | 'record'
  | 'stream'
  | 'category'
  | 'account'
  | 'budget'
  | 'savings';

export type SimpleModeFabGuideScreen = Extract<
  SimpleModePage,
  'dashboard' | 'records' | 'streams' | 'categories' | 'accounts' | 'budget' | 'savings'
>;

/** Maps app routes to FAB guide config (home uses dashboard copy). */
export type SimpleModeFabRoute =
  | 'home'
  | 'records'
  | 'streams'
  | 'categories'
  | 'accounts'
  | 'budget'
  | 'savings';

export const SIMPLE_MODE_FAB_ACTION_LABELS: Record<SimpleModeFabAction, string> = {
  record: 'Add Record',
  stream: 'Add Stream',
  category: 'Add Category',
  account: 'Add Account',
  budget: 'Add Budget',
  savings: 'Add Savings',
};

export const SIMPLE_MODE_FAB_GUIDES: Record<
  SimpleModeFabRoute,
  { message: string; action: SimpleModeFabAction }
> = {
  home: {
    message: 'Add your first record today',
    action: 'record',
  },
  records: {
    message: 'Spent or earned something today? Add a record.',
    action: 'record',
  },
  streams: {
    message: 'Label spending with a new stream',
    action: 'stream',
  },
  categories: {
    message: 'Organize accounts and streams here',
    action: 'category',
  },
  accounts: {
    message: 'Connect a wallet or bank account',
    action: 'account',
  },
  budget: {
    message: 'Set a limit to stay on track',
    action: 'budget',
  },
  savings: {
    message: 'Start a goal or fund and watch it grow',
    action: 'savings',
  },
};

export function getFabGuideForScreen(screen: string): (typeof SIMPLE_MODE_FAB_GUIDES)[SimpleModeFabRoute] | null {
  if (screen in SIMPLE_MODE_FAB_GUIDES) {
    return SIMPLE_MODE_FAB_GUIDES[screen as SimpleModeFabRoute];
  }
  return null;
}
