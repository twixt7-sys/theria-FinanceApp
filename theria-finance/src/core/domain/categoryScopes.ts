import { FileText, PiggyBank, Target, Wallet, Waves, type LucideIcon } from '@/shared/icons';
import type { Screen } from '../../app/routes';
import type { ModuleAccentKey } from '../../shared/theme/moduleAccents';
import type { Category, CategoryScope } from './types';

export interface CategoryScopeConfig {
  /** Plural, shown as a tab/section label — "Categories" tab inside Streams. */
  label: string;
  /** Singular, for copy like "Add {noun} category". */
  noun: string;
  /**
   * The screen that owns and manages this scope's categories. Also the
   * lookup key into shared/theme/moduleAccents.ts — a scope's color is
   * always its owning screen's color, never declared separately. Must be
   * both a real route and a registered accent key.
   */
  ownerScreen: Screen & ModuleAccentKey;
  icon: LucideIcon;
  /**
   * True when an entity of this scope must carry a category, so deleting a
   * category with dependents has to be blocked (and reassigned) rather than
   * silently leaving a required field empty. Only Accounts is required
   * today — Account.categoryId is non-optional in the data model.
   */
  required: boolean;
}

/**
 * One entry per categorizable entity. Adding a sixth one is a single entry
 * here plus one optional `categoryId` field on that entity's type — nothing
 * else needs to change (see shared/components/categories/CategoryManager.tsx,
 * which is driven entirely by this config).
 */
export const CATEGORY_SCOPE_CONFIG: Record<CategoryScope, CategoryScopeConfig> = {
  account: {
    label: 'Categories',
    noun: 'account',
    ownerScreen: 'accounts',
    icon: Wallet,
    required: true,
  },
  stream: {
    label: 'Categories',
    noun: 'stream',
    ownerScreen: 'streams',
    icon: Waves,
    required: false,
  },
  record: {
    label: 'Categories',
    noun: 'record',
    ownerScreen: 'records',
    icon: FileText,
    required: false,
  },
  budget: {
    label: 'Categories',
    noun: 'budget',
    ownerScreen: 'budget',
    icon: Target,
    required: false,
  },
  savings: {
    label: 'Categories',
    noun: 'savings',
    ownerScreen: 'savings',
    icon: PiggyBank,
    required: false,
  },
};

/**
 * Income and expense streams keep separate category sets, distinguished by
 * `Category.streamKind`. Legacy/shared stream categories carry no kind, so
 * they surface under both tabs rather than vanishing.
 */
export const streamCategoryMatchesKind = (
  category: Category,
  kind: 'income' | 'expense',
): boolean =>
  category.scope === 'stream' &&
  (category.streamKind === undefined || category.streamKind === kind);
