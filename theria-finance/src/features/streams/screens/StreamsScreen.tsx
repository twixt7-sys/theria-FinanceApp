import React, { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ChevronUp,
  Plus,
  Layers,
  FolderOpen,
  SlidersHorizontal,
  Archive,
  ArchiveRestore,
  GripVertical,
} from '@/shared/icons';
import { useData } from '../../../core/state/DataContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { streamCategoryMatchesKind } from '../../../core/domain/categoryScopes';
import type { Stream } from '../../../core/domain/types';
import { IconComponent } from '../../../shared/components/IconComponent';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/components/ui/alert-dialog';
import { Badge } from '../../../shared/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { DetailsModal } from '../../../shared/components/DetailsModal';
import { AddStreamModal } from '../components/AddStreamModal';
import { AddCategoryModal } from '../../../shared/components/categories/AddCategoryModal';
import { CategoryDetailsModal } from '../../../shared/components/categories/CategoryDetailsModal';
import { CategoriesManagerModal } from '../../../shared/components/categories/CategoriesManagerModal';
import { CategoryFilterCarousel } from '../../../shared/components/CategoryFilterCarousel';
import { SortableCategoryBoard, type BoardGroup } from '../../../shared/components/SortableCategoryBoard';
import { CapsuleSelector } from '../../../shared/components/CapsuleSelector';
import { SimpleModeHint } from '../../../shared/components/SimpleModeHint';
import { EmptyState } from '../../../shared/components/EmptyState';
import { TerryPanel } from '../../../features/terry/TerryPanel';
import { buildStreamsTerry } from '../../../features/terry/terryLines';
import { TerryToggle } from '../../../shared/components/TerryToggle';
import { formatCompactCurrency } from '../../../shared/lib/compactCurrency';

type StreamsTab = 'income' | 'expense';
/** Sort key for streams with no manual order yet — keeps them last, stably. */
const ORDER_LAST = Number.MAX_SAFE_INTEGER;

interface StreamsScreenProps {
  filterOpen: boolean;
}

export const StreamsScreen: React.FC<StreamsScreenProps> = ({ filterOpen: filterOpenProp }) => {
  const { streams, categories, records, deleteStream, updateStream, updateCategory } = useData();
  const { formatMoney: formatCurrency } = useCurrency();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<StreamsTab>('income');
  // Local filter open state, driven by the toggle next to the stat row.
  const [filterOpen, setFilterOpen] = useState(filterOpenProp);
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addCategoryId, setAddCategoryId] = useState<string | undefined>(undefined);
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(new Set());
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [categoryDetailsId, setCategoryDetailsId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Income and expense keep separate category sets (see streamKind).
  const streamCategories = useMemo(
    () =>
      categories
        .filter((c) => streamCategoryMatchesKind(c, activeTab) && !c.archived)
        .sort((a, b) => (a.order ?? ORDER_LAST) - (b.order ?? ORDER_LAST)),
    [categories, activeTab],
  );
  const streamCategoryIds = useMemo(() => new Set(streamCategories.map((c) => c.id)), [streamCategories]);

  const streamNetById = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of records) {
      if (!r.streamId) continue;
      if (r.type === 'income') m.set(r.streamId, (m.get(r.streamId) || 0) + r.amount);
      else if (r.type === 'expense') m.set(r.streamId, (m.get(r.streamId) || 0) - r.amount);
    }
    return m;
  }, [records]);

  const tabStreams = useMemo(
    () => streams.filter((s) => !s.isSystem && s.type === activeTab),
    [streams, activeTab],
  );
  const activeStreams = useMemo(() => tabStreams.filter((s) => !s.archived), [tabStreams]);
  const archivedStreams = useMemo(() => tabStreams.filter((s) => s.archived), [tabStreams]);

  const orderStreams = (list: Stream[]): Stream[] =>
    [...list].sort((a, b) => (a.order ?? ORDER_LAST) - (b.order ?? ORDER_LAST));

  // Live (non-archived) streams for this tab, narrowed by the category filter.
  const filteredStreams = useMemo(
    () =>
      activeStreams.filter((s) =>
        filterCategoryId === 'all' ? true : s.categoryId === filterCategoryId,
      ),
    [activeStreams, filterCategoryId],
  );

  // Real-category groups feed the draggable board; the leftover "uncategorized"
  // bucket is shown statically below (dropping onto it has no valid target).
  const boardGroups = useMemo<BoardGroup<Stream>[]>(() => {
    const cats =
      filterCategoryId === 'all'
        ? streamCategories
        : streamCategories.filter((c) => c.id === filterCategoryId);
    return cats.map((category) => ({
      category,
      items: orderStreams(filteredStreams.filter((s) => s.categoryId === category.id)),
    }));
  }, [streamCategories, filteredStreams, filterCategoryId]);

  const uncategorizedStreams = useMemo(
    () => orderStreams(filteredStreams.filter((s) => !streamCategoryIds.has(s.categoryId ?? ''))),
    [filteredStreams, streamCategoryIds],
  );

  // Reordering + cross-category moves only make sense on the unfiltered view.
  const dndEnabled = filterCategoryId === 'all';

  useEffect(() => {
    // A fresh tab has its own categories, so reset the category filter.
    setFilterCategoryId('all');
    setShowArchived(false);
  }, [activeTab]);

  const handleEdit = (streamId: string) => {
    setEditingId(streamId);
    setIsAddOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteStream(deleteId);
      setDeleteId(null);
    }
  };

  const setStreamArchived = (streamId: string, archived: boolean) => {
    updateStream(streamId, { archived });
    setDetailsId(null);
  };

  // Persist a drag: each stream's category + position (0-based) within it.
  const commitStreamOrder = (containers: Record<string, string[]>) => {
    Object.entries(containers).forEach(([categoryId, ids]) => {
      ids.forEach((id, index) => {
        const stream = streams.find((s) => s.id === id);
        if (!stream) return;
        const patch: Partial<Stream> = {};
        if (stream.categoryId !== categoryId) patch.categoryId = categoryId;
        if (stream.order !== index) patch.order = index;
        if (Object.keys(patch).length > 0) updateStream(id, patch);
      });
    });
  };

  const commitCategoryOrder = (orderedIds: string[]) => {
    orderedIds.forEach((id, index) => {
      const category = streamCategories.find((c) => c.id === id);
      if (category && category.order !== index) updateCategory(id, { order: index });
    });
  };

  const openAddForCategory = (categoryId?: string) => {
    setEditingId(null);
    setAddCategoryId(categoryId && streamCategoryIds.has(categoryId) ? categoryId : undefined);
    setIsAddOpen(true);
  };

  const closeStreamModal = () => {
    setIsAddOpen(false);
    setEditingId(null);
    setAddCategoryId(undefined);
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const incomeStreams = streams.filter((s) => !s.isSystem && s.type === 'income' && !s.archived);
  const expenseStreams = streams.filter((s) => !s.isSystem && s.type === 'expense' && !s.archived);
  const totalStreamCount = incomeStreams.length + expenseStreams.length;

  // Terry knows the busiest streams
  const topStream = useMemo(() => {
    let best: { name: string; net: number } | null = null;
    for (const s of streams) {
      if (s.isSystem) continue;
      const net = streamNetById.get(s.id) ?? 0;
      if (!best || Math.abs(net) > Math.abs(best.net)) best = { name: s.name, net };
    }
    return best && best.net !== 0 ? best : null;
  }, [streams, streamNetById]);

  const terry = buildStreamsTerry({
    totalStreamCount,
    incomeCount: incomeStreams.length,
    expenseCount: expenseStreams.length,
    topStream,
    money: formatCurrency,
  });

  const renderStreamTile = (stream: Stream) => {
    const net = streamNetById.get(stream.id) ?? 0;
    return <StreamTile stream={stream} net={net} formatCurrency={formatCurrency} onClick={() => setDetailsId(stream.id)} />;
  };

  return (
    <div className="space-y-4 pb-6">
      <SimpleModeHint page="streams" />

      {/* Terry tracks the flow */}
      <TerryPanel content={terry} />

      {/* Category filter — a horizontally scrollable carousel of pills */}
      <AnimatePresence initial={false}>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="w-full rounded-xl bg-card border border-border shadow-sm p-1.5">
              <CategoryFilterCarousel
                categories={streamCategories}
                value={filterCategoryId}
                onChange={setFilterCategoryId}
                fallbackIcon="Folder"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streams overview — income/total/expense stat row + filter toggle */}
      <div className="flex items-center gap-2">
        <TerryToggle className="shrink-0" />
        <div className="flex min-w-0 flex-1 gap-1">
          <StatSegment
            icon={TrendingUp}
            label="Income streams"
            value={String(incomeStreams.length)}
            tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            rounding="rounded-md rounded-l-2xl"
          />
          <StatSegment
            icon={Layers}
            label="Total streams"
            value={String(totalStreamCount)}
            tone="bg-muted text-foreground"
            rounding="rounded-md"
          />
          <StatSegment
            icon={TrendingDown}
            label="Expense streams"
            value={String(expenseStreams.length)}
            tone="bg-red-500/10 text-red-600 dark:text-red-400"
            rounding="rounded-md rounded-r-2xl"
          />
        </div>
        {/* Filter toggle — sits at the right of the expense stream count pill */}
        <button
          type="button"
          onClick={() => setFilterOpen((open) => !open)}
          aria-pressed={filterOpen}
          title={filterOpen ? 'Hide category filter' : 'Filter by category'}
          aria-label={filterOpen ? 'Hide category filter' : 'Filter by category'}
          className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border border-border shadow-sm transition-colors ${
            filterOpen ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-muted'
          }`}
        >
          <SlidersHorizontal size={14} />
        </button>
      </div>

      {/* Income / Expense tab nav + round category-manager button */}
      <div className="flex items-center gap-2">
        <CapsuleSelector
          id="streams-tab"
          className="flex-1"
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { value: 'income', label: 'Income', icon: <TrendingUp size={14} />, color: '#10b981' },
            { value: 'expense', label: 'Expense', icon: <TrendingDown size={14} />, color: '#ef4444' },
          ]}
        />
        <button
          type="button"
          onClick={() => setIsCategoriesOpen(true)}
          title={`Manage ${activeTab} categories`}
          aria-label={`Manage ${activeTab} categories`}
          className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
        >
          <FolderOpen size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {dndEnabled ? (
          <>
            {activeStreams.length > 0 && (
              <p className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-muted-foreground">
                <GripVertical size={12} strokeWidth={2.25} className="shrink-0" />
                Drag streams to reorder or move them between categories.
              </p>
            )}
            <SortableCategoryBoard
              groups={boardGroups}
              collapsedGroupIds={collapsedGroupIds}
              onToggleCollapse={toggleGroupCollapse}
              onCategoryClick={setCategoryDetailsId}
              onCommitItems={commitStreamOrder}
              onReorderCategories={commitCategoryOrder}
              canReorderCategories
              renderItem={renderStreamTile}
              renderOverlayItem={(stream) => (
                <StreamTile
                  stream={stream}
                  net={streamNetById.get(stream.id) ?? 0}
                  formatCurrency={formatCurrency}
                  onClick={() => {}}
                />
              )}
              renderAddTile={(categoryId) => (
                <AddStreamTile key="add" onClick={() => openAddForCategory(categoryId)} label={`Add ${activeTab} stream`} />
              )}
              itemsClassName="grid grid-cols-5 gap-x-1 gap-y-3 px-1 pt-1"
            />
          </>
        ) : (
          boardGroups.map((group) => (
            <StaticStreamGroup
              key={group.category.id}
              category={group.category}
              streams={group.items}
              collapsed={collapsedGroupIds.has(group.category.id)}
              onToggleCollapse={() => toggleGroupCollapse(group.category.id)}
              onCategoryClick={() => setCategoryDetailsId(group.category.id)}
              onStreamClick={setDetailsId}
              onAddClick={() => openAddForCategory(group.category.id)}
              streamNetById={streamNetById}
              formatCurrency={formatCurrency}
              addLabel={`Add ${activeTab} stream`}
            />
          ))
        )}

        {/* Streams whose category is gone / of the other kind */}
        {uncategorizedStreams.length > 0 && (
          <StaticStreamGroup
            category={{ id: 'uncategorized', name: 'Other Streams', color: '#6B7280' }}
            streams={uncategorizedStreams}
            collapsed={collapsedGroupIds.has('uncategorized')}
            onToggleCollapse={() => toggleGroupCollapse('uncategorized')}
            onStreamClick={setDetailsId}
            streamNetById={streamNetById}
            formatCurrency={formatCurrency}
          />
        )}

        {streamCategories.length === 0 && uncategorizedStreams.length === 0 && (
          <EmptyState
            title={`No ${activeTab} stream categories yet`}
            hint="Use the button below to add one"
          />
        )}

        {/* Archived streams for this tab */}
        {archivedStreams.length > 0 && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowArchived((v) => !v)}
              className="flex w-full items-center justify-between gap-2 px-1"
            >
              <span className="flex items-center gap-2">
                <Archive size={13} strokeWidth={2.5} className="text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">Archived</span>
                <Badge variant="outline" className="text-[11px]">
                  {archivedStreams.length}
                </Badge>
              </span>
              <motion.div animate={{ rotate: showArchived ? 0 : 180 }} transition={{ duration: 0.2 }}>
                <ChevronUp size={14} className="text-muted-foreground" />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {showArchived && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-5 gap-x-1 gap-y-3 px-1 pt-1">
                    {orderStreams(archivedStreams).map((stream) => (
                      <StreamTile
                        key={stream.id}
                        stream={stream}
                        net={streamNetById.get(stream.id) ?? 0}
                        formatCurrency={formatCurrency}
                        onClick={() => setDetailsId(stream.id)}
                        muted
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Broken-line add-category shortcut — jumps straight to the modal
            without leaving the Streams tab. */}
        <button
          type="button"
          onClick={() => setIsAddCategoryOpen(true)}
          title={`Add a new ${activeTab} stream category`}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-muted-foreground/30 py-3 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <FolderOpen size={16} />
          Add category
        </button>
      </div>

      <AddStreamModal
        isOpen={isAddOpen}
        onClose={closeStreamModal}
        editId={editingId}
        initialType={activeTab}
        initialCategoryId={addCategoryId}
      />

      {/* Add Category modal — reachable directly from the Streams tab */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        scope="stream"
        streamKind={activeTab}
      />

      {/* Category management pop-up (round button beside the tabs) */}
      <CategoriesManagerModal
        isOpen={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
        scope="stream"
        streamKind={activeTab}
        title={`${activeTab === 'income' ? 'Income' : 'Expense'} Categories`}
      />

      {/* Tapping a category name opens its edit / archive / delete panel */}
      <CategoryDetailsModal
        category={categoryDetailsId ? categories.find((c) => c.id === categoryDetailsId) ?? null : null}
        isOpen={!!categoryDetailsId}
        onClose={() => setCategoryDetailsId(null)}
      />

      {detailsId && (() => {
        const stream = streams.find((s) => s.id === detailsId);
        if (!stream) return null;
        const net = streamNetById.get(stream.id) ?? 0;
        const streamCategory = categories.find((c) => c.id === stream.categoryId);
        const isArchived = !!stream.archived;

        return (
          <DetailsModal
            isOpen={!!detailsId}
            onClose={() => setDetailsId(null)}
            title="Stream Details"
            onEdit={() => {
              setDetailsId(null);
              handleEdit(stream.id);
            }}
            onDelete={() => {
              setDetailsId(null);
              setDeleteId(stream.id);
            }}
          >
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: stream.color }}
                >
                  <IconComponent name={stream.iconName} size={16} style={{ color: 'white' }} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{stream.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{stream.type}</p>
                </div>
                {isArchived && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    <Archive size={11} strokeWidth={2.5} />
                    Archived
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg border border-border p-2.5">
                  <p className="text-muted-foreground text-xs">Type</p>
                  <p className="font-semibold capitalize">{stream.type}</p>
                </div>
                <div className="rounded-lg border border-border p-2.5">
                  <p className="text-muted-foreground text-xs">Net activity</p>
                  <p className={`font-semibold ${stream.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                    {stream.type === 'income' ? '+' : '-'}
                    {formatCurrency(Math.abs(net))}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-2.5 col-span-2">
                  <p className="text-muted-foreground text-xs">Category</p>
                  <p className="font-semibold">{streamCategory?.name || 'Uncategorized'}</p>
                </div>
              </div>

              {/* Archive / restore toggle */}
              <button
                type="button"
                onClick={() => setStreamArchived(stream.id, !isArchived)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {isArchived ? (
                  <>
                    <ArchiveRestore size={16} />
                    Restore stream
                  </>
                ) : (
                  <>
                    <Archive size={16} />
                    Archive stream
                  </>
                )}
              </button>
            </div>
          </DetailsModal>
        );
      })()}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stream</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this stream? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/** One stream, drawn as a circular icon + name + net. */
const StreamTile: React.FC<{
  stream: Stream;
  net: number;
  formatCurrency: (amount: number) => string;
  onClick: () => void;
  muted?: boolean;
}> = ({ stream, net, formatCurrency, onClick, muted }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
    className={`group flex min-w-0 cursor-pointer flex-col items-center gap-1.5 ${muted ? 'opacity-60' : ''}`}
  >
    <span
      className="flex h-14 w-14 items-center justify-center rounded-full shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-105 group-active:scale-95"
      style={{ backgroundColor: stream.color }}
    >
      <IconComponent name={stream.iconName} size={22} style={{ color: 'white' }} />
    </span>
    <span className="w-full text-center leading-tight">
      <span className="block truncate text-[11px] font-semibold text-foreground">{stream.name}</span>
      <span
        className={`block truncate text-[9px] font-medium tabular-nums ${
          net > 0
            ? 'text-emerald-600 dark:text-emerald-400'
            : net < 0
            ? 'text-destructive'
            : 'text-muted-foreground'
        }`}
      >
        {net === 0
          ? stream.type === 'income'
            ? 'Income'
            : 'Expense'
          : `${net > 0 ? '+' : '-'}${formatCompactCurrency(Math.abs(net), formatCurrency)}`}
      </span>
    </span>
  </div>
);

/** The dashed "add a stream to this category" tile. */
const AddStreamTile: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex min-w-0 flex-col items-center gap-1.5"
    title={label}
  >
    <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
      <Plus size={22} />
    </span>
    <span className="block w-full truncate text-center text-[11px] font-medium text-muted-foreground">Add</span>
  </button>
);

/**
 * A non-draggable stream group — used for filtered views and the "Other
 * Streams" bucket, where reordering / cross-category moves aren't offered.
 */
const StaticStreamGroup: React.FC<{
  category: { id: string; name: string; color?: string };
  streams: Stream[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onCategoryClick?: () => void;
  onStreamClick: (id: string) => void;
  onAddClick?: () => void;
  streamNetById: Map<string, number>;
  formatCurrency: (amount: number) => string;
  addLabel?: string;
}> = ({
  category,
  streams,
  collapsed,
  onToggleCollapse,
  onCategoryClick,
  onStreamClick,
  onAddClick,
  streamNetById,
  formatCurrency,
  addLabel = 'Add stream',
}) => (
  <div>
    <div className="mb-1.5 flex w-full items-center justify-between gap-2 px-1">
      <span className="flex min-w-0 items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: category.color || '#6B7280' }} />
        <button
          type="button"
          onClick={onCategoryClick}
          disabled={!onCategoryClick}
          className="min-w-0 truncate text-left text-xs font-semibold text-foreground transition-colors enabled:hover:text-primary disabled:cursor-default"
          title={onCategoryClick ? `Manage ${category.name}` : category.name}
        >
          {category.name}
        </button>
        {streams.length > 0 && (
          <Badge variant="outline" className="shrink-0 text-[11px]">
            {streams.length} item{streams.length > 1 ? 's' : ''}
          </Badge>
        )}
      </span>
      <button type="button" onClick={onToggleCollapse} aria-label={collapsed ? 'Expand' : 'Collapse'} className="shrink-0 p-0.5">
        <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
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
          <div className="grid grid-cols-5 gap-x-1 gap-y-3 px-1 pt-1">
            {streams.map((stream) => (
              <StreamTile
                key={stream.id}
                stream={stream}
                net={streamNetById.get(stream.id) ?? 0}
                formatCurrency={formatCurrency}
                onClick={() => onStreamClick(stream.id)}
              />
            ))}
            {onAddClick && <AddStreamTile onClick={onAddClick} label={addLabel} />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const StatSegment: React.FC<{
  icon: typeof TrendingUp;
  label: string;
  value: string;
  tone: string;
  rounding: string;
}> = ({ icon: Icon, label, value, tone, rounding }) => (
  <div
    title={label}
    aria-label={`${label}: ${value}`}
    className={`flex h-8 min-w-0 flex-1 items-center justify-center gap-1 px-1.5 text-[11px] font-bold tabular-nums ${rounding} ${tone}`}
  >
    <Icon size={12} strokeWidth={2.5} className="shrink-0" aria-hidden />
    <span className="truncate">{value}</span>
  </div>
);
