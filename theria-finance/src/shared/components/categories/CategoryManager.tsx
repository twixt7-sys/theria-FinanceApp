import React, { useEffect, useMemo, useState } from 'react';
import { Archive, ChevronLeft, ChevronRight, Plus } from '@/shared/icons';
import { motion, AnimatePresence } from 'motion/react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useData } from '../../../core/state/DataContext';
import {
  CATEGORY_SCOPE_CONFIG,
  streamCategoryMatchesKind,
} from '../../../core/domain/categoryScopes';
import type { Category, CategoryScope } from '../../../core/domain/types';
import { accentVars } from '../../theme/moduleAccents';
import { IconComponent } from '../IconComponent';
import { EmptyState } from '../EmptyState';
import { AddCategoryModal } from './AddCategoryModal';
import { CategoryDetailsModal } from './CategoryDetailsModal';

const ICONS_PER_PAGE = 8;

interface CategoryManagerProps {
  scope: CategoryScope;
  /** For stream scope: restrict to income or expense categories, so the two
   *  tabs keep separate sets. New categories inherit this kind. */
  streamKind?: 'income' | 'expense';
  /** Icon-filter bar expansion, driven by the owning screen's existing
   *  filter toggle so Categories behaves like every other tab there. */
  filterOpen?: boolean;
  /** Free-text filter on the category name, supplied by the owning screen's
   *  search bar (Accounts). Case-insensitive; empty means no text filter. */
  searchQuery?: string;
}

/** Sort key for categories with no manual order yet — keeps them last, stably. */
const ORDER_LAST = Number.MAX_SAFE_INTEGER;
const byOrder = (a: Category, b: Category) => (a.order ?? ORDER_LAST) - (b.order ?? ORDER_LAST);

/**
 * The category grid/details/delete surface, lifted out of the old standalone
 * CategoriesScreen and parameterized by scope so every owning module (Records,
 * Accounts, Streams, Budget, Savings) gets the same view for its own slice of
 * categories. Color comes from the scope's owner screen via moduleAccents —
 * never redeclared here.
 */
export const CategoryManager: React.FC<CategoryManagerProps> = ({
  scope,
  streamKind,
  filterOpen = false,
  searchQuery = '',
}) => {
  const { categories, updateCategory } = useData();
  const config = CATEGORY_SCOPE_CONFIG[scope];

  const sensors = useSensors(
    // A little travel/hold before a drag so a tap still opens the details modal.
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterIcon, setFilterIcon] = useState('all');
  const [iconPage, setIconPage] = useState(0);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Categories in this scope (and, for streams, this kind), split into the
  // active set and the archived set — each ordered by manual drag position.
  const inScope = useMemo(
    () =>
      categories.filter((c) =>
        scope === 'stream' && streamKind
          ? streamCategoryMatchesKind(c, streamKind)
          : c.scope === scope,
      ),
    [categories, scope, streamKind],
  );
  const activeCategories = useMemo(() => inScope.filter((c) => !c.archived).sort(byOrder), [inScope]);
  const archivedCategories = useMemo(() => inScope.filter((c) => c.archived).sort(byOrder), [inScope]);

  // Fall back to the active view if the archived set empties out.
  useEffect(() => {
    if (showArchived && archivedCategories.length === 0) setShowArchived(false);
  }, [showArchived, archivedCategories.length]);

  const scopedCategories = showArchived ? archivedCategories : activeCategories;

  const uniqueIcons = useMemo(() => {
    const icons = [...new Set(scopedCategories.map((c) => c.iconName))];
    return icons.sort();
  }, [scopedCategories]);

  const totalIconPages = Math.max(1, Math.ceil(uniqueIcons.length / ICONS_PER_PAGE));
  const currentIcons = uniqueIcons.slice(iconPage * ICONS_PER_PAGE, (iconPage + 1) * ICONS_PER_PAGE);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return scopedCategories.filter(
      (c) =>
        (filterIcon === 'all' || c.iconName === filterIcon) &&
        (query === '' || c.name.toLowerCase().includes(query)),
    );
  }, [scopedCategories, filterIcon, searchQuery]);

  // Reordering only makes sense over the full, unfiltered list.
  const dndEnabled = filterIcon === 'all' && searchQuery.trim() === '';

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const ids = scopedCategories.map((c) => c.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    // Renumber everyone so the persisted order is dense and unambiguous.
    arrayMove(scopedCategories, oldIndex, newIndex).forEach((category, index) => {
      if (category.order !== index) updateCategory(category.id, { order: index });
    });
  };

  const detailsCategory = detailsId ? inScope.find((c) => c.id === detailsId) ?? null : null;

  return (
    <div style={accentVars(config.ownerScreen)} className="space-y-4">
      {/* Icon filter, expands with the screen's existing filter toggle */}
      <AnimatePresence initial={false}>
        {filterOpen && uniqueIcons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex w-full rounded-xl bg-card border border-border shadow-sm p-0.5">
              <div className="flex items-center gap-1 flex-1">
                <button
                  type="button"
                  onClick={() => setIconPage(Math.max(0, iconPage - 1))}
                  disabled={iconPage === 0}
                  className="p-1 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={12} />
                </button>

                <div className="flex gap-1 flex-1 justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`icon-page-${iconPage}`}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="flex gap-1"
                    >
                      <motion.button
                        key="all-icons"
                        type="button"
                        onClick={() => setFilterIcon('all')}
                        className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center justify-center gap-1 ${
                          filterIcon === 'all'
                            ? 'module-accent-solid shadow'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                        title="All icons"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        All
                      </motion.button>
                      {currentIcons.map((icon) => (
                        <motion.button
                          key={icon}
                          type="button"
                          onClick={() => setFilterIcon(icon)}
                          className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center justify-center gap-1 ${
                            filterIcon === icon
                              ? 'module-accent-solid shadow'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                          title={icon}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <IconComponent name={icon} size={12} />
                        </motion.button>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={() => setIconPage(Math.min(totalIconPages - 1, iconPage + 1))}
                  disabled={iconPage === totalIconPages - 1}
                  className="p-1 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            {scopedCategories.length} {config.noun}{' '}
            {scopedCategories.length === 1 ? 'category' : 'categories'}
          </p>
          {archivedCategories.length > 0 && (
            <button
              type="button"
              onClick={() => setShowArchived((v) => !v)}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold transition-colors ${
                showArchived
                  ? 'border-transparent bg-muted text-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted'
              }`}
              title={showArchived ? 'Show active categories' : 'Show archived categories'}
            >
              <Archive size={12} strokeWidth={2.5} />
              {showArchived ? 'Active' : `Archived (${archivedCategories.length})`}
            </button>
          )}
        </div>
        {!showArchived && (
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 rounded-full module-accent-solid px-3 py-1.5 text-xs font-semibold shadow-sm transition-transform hover:scale-[1.03] active:scale-95"
          >
            <Plus size={14} strokeWidth={2.5} />
            Add category
          </button>
        )}
      </div>

      {dndEnabled ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredCategories.map((c) => c.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {filteredCategories.map((category) => (
                <SortableCategoryPill
                  key={category.id}
                  category={category}
                  onClick={() => setDetailsId(category.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {filteredCategories.map((category) => (
            <CategoryPill
              key={category.id}
              category={category}
              onClick={() => setDetailsId(category.id)}
            />
          ))}
        </div>
      )}

      {filteredCategories.length === 0 && (
        <EmptyState
          title={
            showArchived
              ? `No archived ${config.noun} categories`
              : `No ${config.noun} categories yet`
          }
          hint={showArchived ? 'Archived categories show up here' : 'Use the button above to add one'}
        />
      )}

      <AddCategoryModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        scope={scope}
        streamKind={streamKind}
      />

      <CategoryDetailsModal
        category={detailsCategory}
        isOpen={!!detailsCategory}
        onClose={() => setDetailsId(null)}
      />
    </div>
  );
};

/** The pill body — shared by the static and draggable renders. */
const CategoryPill = React.forwardRef<
  HTMLDivElement,
  {
    category: Category;
    onClick: () => void;
    style?: React.CSSProperties;
    dragging?: boolean;
  } & React.HTMLAttributes<HTMLDivElement>
>(({ category, onClick, style, dragging, ...rest }, ref) => (
  <div
    ref={ref}
    onClick={onClick}
    style={style}
    className={`flex items-center gap-2.5 bg-card border border-border rounded-full p-2 pr-3 transition-shadow duration-200 group cursor-pointer hover:shadow-md module-accent-border ${
      dragging ? 'opacity-40' : ''
    }`}
    {...rest}
  >
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ring-1 ring-black/5"
      style={{ backgroundColor: category.color }}
    >
      {category.customSvg ? (
        <div dangerouslySetInnerHTML={{ __html: category.customSvg }} className="w-6 h-6 text-white" />
      ) : (
        <IconComponent name={category.iconName} style={{ color: 'white' }} size={18} />
      )}
    </div>
    <h3 className="min-w-0 flex-1 truncate font-semibold text-foreground text-sm tracking-tight">
      {category.name}
    </h3>
  </div>
));
CategoryPill.displayName = 'CategoryPill';

/** A draggable category pill; a tap still falls through to `onClick`. */
const SortableCategoryPill: React.FC<{ category: Category; onClick: () => void }> = ({
  category,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });
  return (
    <CategoryPill
      ref={setNodeRef}
      category={category}
      onClick={onClick}
      dragging={isDragging}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: 'manipulation',
      }}
      {...attributes}
      {...listeners}
    />
  );
};
