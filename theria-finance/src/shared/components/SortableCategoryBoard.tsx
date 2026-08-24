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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, GripVertical } from '@/shared/icons';
import { Badge } from './ui/badge';

export interface BoardItem {
  id: string;
}

export interface BoardCategory {
  id: string;
  name: string;
  color?: string;
}

export interface BoardGroup<T extends BoardItem> {
  category: BoardCategory;
  items: T[];
}

type Containers = Record<string, string[]>;
const GROUP_PREFIX = 'group:';

interface SortableCategoryBoardProps<T extends BoardItem> {
  groups: BoardGroup<T>[];
  collapsedGroupIds: Set<string>;
  onToggleCollapse: (categoryId: string) => void;
  /** Tapping a category's name (not the drag handle or chevron). */
  onCategoryClick?: (categoryId: string) => void;
  /** Persists the item arrangement: categoryId → ordered item ids. */
  onCommitItems: (containers: Containers) => void;
  /** Persists a new category order (only fired when category dragging is on). */
  onReorderCategories?: (orderedCategoryIds: string[]) => void;
  /** Whole-group drag handle is shown only when this is true. */
  canReorderCategories?: boolean;
  renderItem: (item: T) => React.ReactNode;
  renderOverlayItem: (item: T) => React.ReactNode;
  renderAddTile?: (categoryId: string) => React.ReactNode;
  /** Grid layout for the items inside each group. */
  itemsClassName?: string;
}

const buildContainers = <T extends BoardItem>(groups: BoardGroup<T>[]): Containers =>
  Object.fromEntries(groups.map((g) => [g.category.id, g.items.map((i) => i.id)]));

/**
 * A two-level drag-and-drop board. Category groups can be reordered by their
 * drag handle (when enabled), while the items inside can be reordered within a
 * group and moved across groups. Both interactions are touch-friendly and share
 * one DndContext, told apart by the dragged element's `type`.
 */
export function SortableCategoryBoard<T extends BoardItem>({
  groups,
  collapsedGroupIds,
  onToggleCollapse,
  onCategoryClick,
  onCommitItems,
  onReorderCategories,
  canReorderCategories = false,
  renderItem,
  renderOverlayItem,
  renderAddTile,
  itemsClassName = 'grid grid-cols-2 gap-3',
}: SortableCategoryBoardProps<T>) {
  const [containers, setContainers] = useState<Containers>(() => buildContainers(groups));
  const [groupIds, setGroupIds] = useState<string[]>(() => groups.map((g) => g.category.id));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'item' | 'group' | null>(null);

  const itemById = useMemo(() => {
    const map = new Map<string, T>();
    groups.forEach((g) => g.items.forEach((i) => map.set(i.id, i)));
    return map;
  }, [groups]);

  const categoryById = useMemo(() => {
    const map = new Map<string, BoardCategory>();
    groups.forEach((g) => map.set(g.category.id, g.category));
    return map;
  }, [groups]);

  // Re-sync from the source of truth whenever it changes and we aren't dragging.
  useEffect(() => {
    if (!activeId) {
      setContainers(buildContainers(groups));
      setGroupIds(groups.map((g) => g.category.id));
    }
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

  const handleDragStart = ({ active }: DragStartEvent) => {
    const type = (active.data.current?.type as 'item' | 'group') ?? 'item';
    setActiveType(type);
    setActiveId(String(active.id));
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || active.data.current?.type !== 'item') return;
    const activeContainer = findContainer(String(active.id));
    const overRaw = String(over.id);
    // When hovering a group header (or its column), resolve to that container.
    const overContainer = overRaw.startsWith(GROUP_PREFIX)
      ? overRaw.slice(GROUP_PREFIX.length)
      : findContainer(overRaw);
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setContainers((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer] ?? [];
      const activeIndex = activeItems.indexOf(String(active.id));
      if (activeIndex === -1) return prev;
      const overIndex = overItems.indexOf(overRaw);
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

  const finishDrag = () => {
    setActiveId(null);
    setActiveType(null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.data.current?.type === 'group') {
      if (over) {
        const oldIndex = groupIds.indexOf(String(active.id).replace(GROUP_PREFIX, ''));
        const newIndex = groupIds.indexOf(String(over.id).replace(GROUP_PREFIX, ''));
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const next = arrayMove(groupIds, oldIndex, newIndex);
          setGroupIds(next);
          onReorderCategories?.(next);
        }
      }
      finishDrag();
      return;
    }

    const activeContainer = findContainer(String(active.id));
    const overRaw = over ? String(over.id) : undefined;
    const overContainer = overRaw
      ? overRaw.startsWith(GROUP_PREFIX)
        ? overRaw.slice(GROUP_PREFIX.length)
        : findContainer(overRaw)
      : undefined;

    let next = containers;
    if (activeContainer && overContainer && activeContainer === overContainer && overRaw) {
      const items = containers[activeContainer];
      const oldIndex = items.indexOf(String(active.id));
      const newIndex = items.indexOf(overRaw);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        next = { ...containers, [activeContainer]: arrayMove(items, oldIndex, newIndex) };
        setContainers(next);
      }
    }
    finishDrag();
    onCommitItems(next);
  };

  const orderedGroupIds = groupIds.filter((id) => categoryById.has(id));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={finishDrag}
    >
      <SortableContext
        items={orderedGroupIds.map((id) => `${GROUP_PREFIX}${id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {orderedGroupIds.map((categoryId) => {
            const category = categoryById.get(categoryId)!;
            const ids = containers[categoryId] ?? [];
            const collapsed = collapsedGroupIds.has(categoryId);
            return (
              <BoardColumn
                key={categoryId}
                category={category}
                count={ids.length}
                collapsed={collapsed}
                canReorder={canReorderCategories}
                onToggleCollapse={() => onToggleCollapse(categoryId)}
                onCategoryClick={onCategoryClick ? () => onCategoryClick(categoryId) : undefined}
              >
                <SortableContext items={ids} strategy={rectSortingStrategy}>
                  <div className={itemsClassName}>
                    {ids.map((id) => {
                      const item = itemById.get(id);
                      if (!item) return null;
                      return (
                        <SortableItem key={id} id={id}>
                          {renderItem(item)}
                        </SortableItem>
                      );
                    })}
                    {renderAddTile?.(categoryId)}
                  </div>
                </SortableContext>
              </BoardColumn>
            );
          })}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeType === 'item' && activeId && itemById.get(activeId) ? (
          <div className="opacity-95">{renderOverlayItem(itemById.get(activeId)!)}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

/** A category column: sortable header (via handle) + a droppable body. */
const BoardColumn: React.FC<{
  category: BoardCategory;
  count: number;
  collapsed: boolean;
  canReorder: boolean;
  onToggleCollapse: () => void;
  onCategoryClick?: () => void;
  children: React.ReactNode;
}> = ({ category, count, collapsed, canReorder, onToggleCollapse, onCategoryClick, children }) => {
  const groupId = `${GROUP_PREFIX}${category.id}`;
  const {
    setNodeRef: setSortRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: groupId, data: { type: 'group' } });
  // The column body also accepts item drops (under the plain category id, kept
  // distinct from the group's sortable id) so a card can land on an empty or
  // collapsed group.
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: category.id,
    data: { type: 'column' },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setSortRef} style={style}>
      <div
        ref={setDropRef}
        className={`space-y-2 rounded-2xl transition-colors ${isOver ? 'bg-primary/5 ring-1 ring-primary/30' : ''}`}
      >
        <div className="flex w-full items-center justify-between gap-2 px-1">
          <span className="flex min-w-0 items-center gap-1.5">
            {canReorder && (
              <button
                type="button"
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                aria-label={`Reorder ${category.name}`}
                title="Drag to reorder category"
                className="shrink-0 cursor-grab touch-none rounded p-0.5 text-muted-foreground/60 hover:text-muted-foreground active:cursor-grabbing"
              >
                <GripVertical size={14} />
              </button>
            )}
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: category.color || '#6B7280' }}
            />
            <button
              type="button"
              onClick={onCategoryClick}
              disabled={!onCategoryClick}
              className="min-w-0 truncate text-left text-xs font-semibold text-foreground transition-colors enabled:hover:text-primary disabled:cursor-default"
              title={onCategoryClick ? `Manage ${category.name}` : category.name}
            >
              {category.name}
            </button>
            {count > 0 && (
              <Badge variant="outline" className="shrink-0 text-[11px]">
                {count} item{count > 1 ? 's' : ''}
              </Badge>
            )}
          </span>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand category' : 'Collapse category'}
            className="shrink-0 p-0.5"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <ChevronUp size={14} className="text-muted-foreground" />
            </motion.div>
          </button>
        </div>

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
    </div>
  );
};

/** One draggable item; a plain tap falls through to its own click handler. */
const SortableItem: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { type: 'item' },
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    touchAction: 'manipulation',
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};
