import React, { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, Plus } from '@/shared/icons';
import { Badge } from '../../../shared/components/ui/badge';
import { AccountCardVisual } from '../../../shared/components/AccountCardVisual';
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
  /** Persists the final arrangement: categoryId → ordered account ids. */
  onCommit: (containers: Record<string, string[]>) => void;
}

type Containers = Record<string, string[]>;

const buildContainers = (groups: AccountGroup[]): Containers =>
  Object.fromEntries(groups.map((g) => [g.category.id, g.accounts.map((a) => a.id)]));

/**
 * The live accounts view as a drag-and-drop board. Each category is a droppable
 * column; account cards can be reordered within a category and dragged across
 * categories. Ordering + category changes are persisted through `onCommit` once
 * the drag settles.
 */
export const AccountsBoard: React.FC<AccountsBoardProps> = ({
  groups,
  formatCurrency,
  categoryNameFor,
  collapsedGroupIds,
  onToggleCollapse,
  onCardClick,
  onAddClick,
  onCommit,
}) => {
  const [containers, setContainers] = useState<Containers>(() => buildContainers(groups));
  const [activeId, setActiveId] = useState<string | null>(null);

  // Every account by id, so the board can draw a card wherever it lands.
  const accountById = useMemo(() => {
    const map = new Map<string, AccountView>();
    groups.forEach((g) => g.accounts.forEach((a) => map.set(a.id, a)));
    return map;
  }, [groups]);

  // Re-sync from the source of truth whenever it changes and we aren't dragging.
  useEffect(() => {
    if (!activeId) setContainers(buildContainers(groups));
  }, [groups, activeId]);

  const sensors = useSensors(
    // A little travel/hold before a drag starts so a tap still opens details.
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const findContainer = (id: string): string | undefined => {
    if (id in containers) return id;
    return Object.keys(containers).find((key) => containers[key].includes(id));
  };

  const handleDragStart = ({ active }: DragStartEvent) => setActiveId(String(active.id));

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const activeContainer = findContainer(String(active.id));
    const overContainer = findContainer(String(over.id));
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setContainers((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.indexOf(String(active.id));
      if (activeIndex === -1) return prev;

      // Drop before the item we're hovering, or at the end of an empty column.
      const overIndex = overItems.indexOf(String(over.id));
      const insertAt = overIndex === -1 ? overItems.length : overIndex;

      return {
        ...prev,
        [activeContainer]: activeItems.filter((id) => id !== String(active.id)),
        [overContainer]: [
          ...overItems.slice(0, insertAt),
          String(active.id),
          ...overItems.slice(insertAt),
        ],
      };
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const activeContainer = findContainer(String(active.id));
    const overContainer = over ? findContainer(String(over.id)) : undefined;

    let next = containers;
    if (activeContainer && overContainer && activeContainer === overContainer) {
      const items = containers[activeContainer];
      const oldIndex = items.indexOf(String(active.id));
      const newIndex = items.indexOf(String(over!.id));
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        next = { ...containers, [activeContainer]: arrayMove(items, oldIndex, newIndex) };
        setContainers(next);
      }
    }
    setActiveId(null);
    onCommit(next);
  };

  const activeAccount = activeId ? accountById.get(activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="space-y-4">
        {groups.map((group) => {
          const ids = containers[group.category.id] ?? [];
          const collapsed = collapsedGroupIds.has(group.category.id);
          return (
            <BoardColumn
              key={group.category.id}
              id={group.category.id}
              category={group.category}
              count={ids.length}
              collapsed={collapsed}
              onToggleCollapse={() => onToggleCollapse(group.category.id)}
            >
              <SortableContext items={ids} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 gap-3">
                  {ids.map((id) => {
                    const account = accountById.get(id);
                    if (!account) return null;
                    return (
                      <SortableAccountCard
                        key={id}
                        id={id}
                        account={account}
                        balanceText={formatCurrency(account.balance, account.currency)}
                        categoryName={categoryNameFor(account)}
                        onClick={() => onCardClick(id)}
                      />
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => onAddClick(group.category.id)}
                    title={`Add account to ${group.category.name}`}
                    className="flex min-h-[104px] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Plus size={24} />
                    <span className="text-[11px] font-semibold">Add</span>
                  </button>
                </div>
              </SortableContext>
            </BoardColumn>
          );
        })}
      </div>

      <DragOverlay>
        {activeAccount ? (
          <div className="opacity-95">
            <AccountCardVisual
              size="full"
              displayStyle={activeAccount.displayStyle}
              name={activeAccount.name}
              bankName={activeAccount.bankName}
              balanceText={formatCurrency(activeAccount.balance, activeAccount.currency)}
              categoryName={categoryNameFor(activeAccount)}
              accountNumber={activeAccount.accountNumber}
              iconName={activeAccount.iconName}
              color={activeAccount.color}
              cardType={activeAccount.cardType}
              isSavings={activeAccount.isSavings}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

/** A category column: collapsible header + a droppable body for its cards. */
const BoardColumn: React.FC<{
  id: string;
  category: BoardCategory;
  count: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  children: React.ReactNode;
}> = ({ id, category, count, collapsed, onToggleCollapse, children }) => {
  // The whole column accepts drops, so a card can land on a collapsed group too.
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`space-y-2 rounded-2xl transition-colors ${isOver ? 'bg-primary/5 ring-1 ring-primary/30' : ''}`}
    >
      <button
        type="button"
        onClick={onToggleCollapse}
        className="w-full flex items-center justify-between gap-2 px-1"
      >
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color || '#6B7280' }} />
          <span className="text-xs font-semibold text-foreground">{category.name}</span>
          {count > 0 && (
            <Badge variant="outline" className="text-[11px]">
              {count} item{count > 1 ? 's' : ''}
            </Badge>
          )}
        </span>
        <motion.div
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <ChevronUp size={14} className="text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/** One draggable account card. A short travel/hold starts the drag; a plain
 *  tap falls through to `onClick` (open details). */
const SortableAccountCard: React.FC<{
  id: string;
  account: AccountView;
  balanceText: string;
  categoryName?: string;
  onClick: () => void;
}> = ({ id, account, balanceText, categoryName, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    touchAction: 'manipulation',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="cursor-grab transition-transform active:scale-[0.98] active:cursor-grabbing"
    >
      <AccountCardVisual
        size="full"
        displayStyle={account.displayStyle}
        name={account.name}
        bankName={account.bankName}
        balanceText={balanceText}
        categoryName={categoryName}
        accountNumber={account.accountNumber}
        iconName={account.iconName}
        color={account.color}
        cardType={account.cardType}
        isSavings={account.isSavings}
      />
    </div>
  );
};
