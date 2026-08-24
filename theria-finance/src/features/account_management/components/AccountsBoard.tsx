import React from 'react';
import { Plus } from '@/shared/icons';
import { AccountCardVisual } from '../../../shared/components/AccountCardVisual';
import { SortableCategoryBoard, type BoardGroup } from '../../../shared/components/SortableCategoryBoard';
import type { AccountView } from '../../../core/state/DataContext';

/** The slimmed-down category shape the board needs to draw a group. */
export interface BoardCategory {
  id: string;
  name: string;
  color: string;
}

export interface AccountGroup {
  category: BoardCategory;
  accounts: AccountView[];
}

interface AccountsBoardProps {
  groups: AccountGroup[];
  formatCurrency: (amount: number, currencyCode?: AccountView['currency']) => string;
  categoryNameFor: (account: AccountView) => string | undefined;
  collapsedGroupIds: Set<string>;
  onToggleCollapse: (id: string) => void;
  onCardClick: (id: string) => void;
  onAddClick: (categoryId: string) => void;
  /** Opens a category's edit / archive / delete panel (its name is tapped). */
  onCategoryClick?: (categoryId: string) => void;
  /** Persists the final arrangement: categoryId → ordered account ids. */
  onCommit: (containers: Record<string, string[]>) => void;
  /** Persists a new category order after dragging a group header. */
  onReorderCategories?: (orderedCategoryIds: string[]) => void;
}

/**
 * The live accounts view as a drag-and-drop board. Each category is a droppable
 * column whose header can be reordered by its handle; account cards can be
 * reordered within a category and dragged across categories. Ordering +
 * category changes are persisted through `onCommit` once the drag settles.
 */
export const AccountsBoard: React.FC<AccountsBoardProps> = ({
  groups,
  formatCurrency,
  categoryNameFor,
  collapsedGroupIds,
  onToggleCollapse,
  onCardClick,
  onAddClick,
  onCategoryClick,
  onCommit,
  onReorderCategories,
}) => {
  const boardGroups: BoardGroup<AccountView>[] = groups.map((g) => ({
    category: g.category,
    items: g.accounts,
  }));

  const renderCard = (account: AccountView) => (
    <div
      onClick={() => onCardClick(account.id)}
      className="cursor-grab transition-transform active:scale-[0.98] active:cursor-grabbing"
    >
      <AccountCardVisual
        size="full"
        displayStyle={account.displayStyle}
        name={account.name}
        bankName={account.bankName}
        balanceText={formatCurrency(account.balance, account.currency)}
        categoryName={categoryNameFor(account)}
        accountNumber={account.accountNumber}
        iconName={account.iconName}
        color={account.color}
        cardType={account.cardType}
        isSavings={account.isSavings}
      />
    </div>
  );

  return (
    <SortableCategoryBoard
      groups={boardGroups}
      collapsedGroupIds={collapsedGroupIds}
      onToggleCollapse={onToggleCollapse}
      onCategoryClick={onCategoryClick}
      onCommitItems={onCommit}
      onReorderCategories={onReorderCategories}
      canReorderCategories
      itemsClassName="grid grid-cols-2 gap-3"
      renderItem={renderCard}
      renderOverlayItem={(account) => (
        <AccountCardVisual
          size="full"
          displayStyle={account.displayStyle}
          name={account.name}
          bankName={account.bankName}
          balanceText={formatCurrency(account.balance, account.currency)}
          categoryName={categoryNameFor(account)}
          accountNumber={account.accountNumber}
          iconName={account.iconName}
          color={account.color}
          cardType={account.cardType}
          isSavings={account.isSavings}
        />
      )}
      renderAddTile={(categoryId) => (
        <button
          key="add"
          type="button"
          onClick={() => onAddClick(categoryId)}
          title="Add account"
          className="flex min-h-[104px] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus size={24} />
          <span className="text-[11px] font-semibold">Add</span>
        </button>
      )}
    />
  );
};
