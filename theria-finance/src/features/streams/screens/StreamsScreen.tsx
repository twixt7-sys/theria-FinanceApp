import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, ChevronUp, Plus, Layers, FolderOpen } from '@/shared/icons';
import { useData } from '../../../core/state/DataContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { IconComponent } from '../../../shared/components/IconComponent';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/components/ui/alert-dialog';
import { Badge } from '../../../shared/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { DetailsModal } from '../../../shared/components/DetailsModal';
import { AddStreamModal } from '../components/AddStreamModal';
import { AddCategoryModal } from '../../../shared/components/categories/AddCategoryModal';
import { CapsuleSelector } from '../../../shared/components/CapsuleSelector';
import { SimpleModeHint } from '../../../shared/components/SimpleModeHint';
import { EmptyState } from '../../../shared/components/EmptyState';
import { TerryPanel } from '../../../features/terry/TerryPanel';
import { buildStreamsTerry } from '../../../features/terry/terryLines';
import { TerryToggle } from '../../../shared/components/TerryToggle';
import { formatCompactCurrency } from '../../../shared/lib/compactCurrency';

const CATEGORIES_PER_PAGE = 3;
type StreamsTab = 'income' | 'expense';
interface StreamsScreenProps {
  filterOpen: boolean;
};

export const StreamsScreen: React.FC<StreamsScreenProps> = ({
  filterOpen,
}) => {
  const { streams, categories, records, deleteStream } = useData();
  const { formatMoney: formatCurrency } = useCurrency();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<StreamsTab>('income');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [categoryPage, setCategoryPage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addCategoryId, setAddCategoryId] = useState<string | undefined>(undefined);
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(new Set());
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  
  const streamCategories = useMemo(
    () => categories.filter((c) => c.scope === 'stream'),
    [categories],
  );

  const totalCategoryPages = Math.max(1, Math.ceil(streamCategories.length / CATEGORIES_PER_PAGE));
  const pagedStreamCategories = streamCategories.slice(
    categoryPage * CATEGORIES_PER_PAGE,
    (categoryPage + 1) * CATEGORIES_PER_PAGE,
  );

  useEffect(() => {
    setCategoryPage((p) => Math.min(p, totalCategoryPages - 1));
  }, [totalCategoryPages, activeTab]);

  const streamNetById = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of records) {
      if (!r.streamId) continue;
      if (r.type === 'income') m.set(r.streamId, (m.get(r.streamId) || 0) + r.amount);
      else if (r.type === 'expense') m.set(r.streamId, (m.get(r.streamId) || 0) - r.amount);
    }
    return m;
  }, [records]);

  const filteredStreams = streams
    .filter(s => !s.isSystem && s.type === activeTab)
    .filter(s => filterCategoryId === 'all' ? true : s.categoryId === filterCategoryId);

  const groupedByCategory = useMemo(() => {
    // Show every category (even empty) so each has an inline "+" add tile.
    const cats =
      filterCategoryId === 'all'
        ? streamCategories
        : streamCategories.filter((c) => c.id === filterCategoryId);
    const groups = cats.map((cat) => ({
      category: cat,
      streams: filteredStreams.filter((s) => s.categoryId === cat.id),
    }));
    const uncategorized = filteredStreams.filter((s) => !streamCategories.find((c) => c.id === s.categoryId));
    if (uncategorized.length && filterCategoryId === 'all') {
      groups.push({
        category: { id: 'uncategorized', name: 'Other Streams', color: '#6B7280', iconName: 'Folder', scope: 'stream', createdAt: '' },
        streams: uncategorized,
      });
    }
    return groups;
  }, [filteredStreams, streamCategories, filterCategoryId]);

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

  const openAddForCategory = (categoryId?: string) => {
    setEditingId(null);
    setAddCategoryId(categoryId && categoryId !== 'uncategorized' ? categoryId : undefined);
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

  const incomeStreams = streams.filter((s) => !s.isSystem && s.type === 'income');
  const expenseStreams = streams.filter((s) => !s.isSystem && s.type === 'expense');
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

  return (
    <div className="space-y-4 pb-6">
      <SimpleModeHint page="streams" />

      {/* Terry tracks the flow */}
      <TerryPanel content={terry} />

      {/* Category Filter - Retracted above nav */}
      <AnimatePresence initial={false}>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex w-full rounded-xl bg-card border border-border shadow-sm p-0.5">
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setCategoryPage((p) => Math.max(0, p - 1))}
                  disabled={categoryPage === 0}
                  aria-label="Previous categories"
                  className="shrink-0 z-10 p-1.5 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <ChevronLeft size={14} />
                </button>
                
                <div className="flex gap-1 flex-1 justify-center overflow-hidden min-w-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`category-page-${categoryPage}`}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="flex gap-1 flex-nowrap"
                    >
                      <motion.button
                        key="all"
                        type="button"
                        onClick={() => setFilterCategoryId('all')}
                        className={`shrink-0 whitespace-nowrap px-2 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center justify-center gap-1 ${
                          filterCategoryId === 'all'
                            ? 'bg-primary text-white shadow'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                        title="All categories"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        All
                      </motion.button>
                      {pagedStreamCategories.map((cat) => (
                        <motion.button
                          key={cat.id}
                          type="button"
                          onClick={() => setFilterCategoryId(cat.id)}
                          className={`shrink-0 whitespace-nowrap px-2 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center justify-center gap-1 ${
                            filterCategoryId === cat.id
                              ? 'bg-primary text-white shadow'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                          title={cat.name}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <IconComponent name={cat.iconName || 'Folder'} size={12} className="shrink-0" />
                          <span>{cat.name}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                <button
                  type="button"
                  onClick={() => setCategoryPage((p) => Math.min(totalCategoryPages - 1, p + 1))}
                  disabled={categoryPage >= totalCategoryPages - 1}
                  aria-label="Next categories"
                  className="shrink-0 z-10 p-1.5 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streams overview — income/total/expense stat row, mirrors the Records toolbar */}
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
      </div>

      {/* Income / Expense tab nav */}
      <CapsuleSelector
        id="streams-tab"
        value={activeTab}
        onChange={setActiveTab}
        options={[
          { value: 'income', label: 'Income', icon: <TrendingUp size={14} />, color: '#10b981' },
          { value: 'expense', label: 'Expense', icon: <TrendingDown size={14} />, color: '#ef4444' },
        ]}
      />

      <div className="space-y-4">
        {groupedByCategory.map((group) => (
          <div key={group.category.id}>
            <button
              type="button"
              onClick={() => toggleGroupCollapse(group.category.id)}
              className="w-full flex items-center justify-between gap-2 px-1 mb-1.5"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: group.category.color || '#6B7280' }} />
                <span className="text-xs font-semibold text-foreground">{group.category.name}</span>
                {group.streams.length > 0 && (
                  <Badge variant="outline" className="text-[11px]">
                    {group.streams.length} item{group.streams.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </span>
              <motion.div
                animate={{ rotate: collapsedGroupIds.has(group.category.id) ? 180 : 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <ChevronUp size={14} className="text-muted-foreground" />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {!collapsedGroupIds.has(group.category.id) && (
                <motion.div
                  key={`streams-group-${group.category.id}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
            <div className="grid grid-cols-5 gap-x-1 gap-y-3 px-1 pt-1">
              {group.streams.map((stream) => {
                const net = streamNetById.get(stream.id) ?? 0;
                return (
                  <button
                    key={stream.id}
                    type="button"
                    onClick={() => setDetailsId(stream.id)}
                    className="group flex min-w-0 flex-col items-center gap-1.5"
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
                  </button>
                );
              })}

              {/* Add a stream to this category */}
              <button
                type="button"
                onClick={() => openAddForCategory(group.category.id)}
                className="group flex min-w-0 flex-col items-center gap-1.5"
                title={`Add ${activeTab} stream`}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
                  <Plus size={22} />
                </span>
                <span className="block w-full truncate text-center text-[11px] font-medium text-muted-foreground">Add</span>
              </button>
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {streamCategories.length === 0 && (
          <EmptyState
            title="No stream categories yet"
            hint="Use the button below to add one"
          />
        )}

        {/* Broken-line add-category shortcut — jumps straight to the modal
            without leaving the Streams tab. */}
        <button
          type="button"
          onClick={() => setIsAddCategoryOpen(true)}
          title="Add a new stream category"
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
      />

      {detailsId && (() => {
        const stream = streams.find((s) => s.id === detailsId);
        if (!stream) return null;
        const net = streamNetById.get(stream.id) ?? 0;
        const streamCategory = streamCategories.find((c) => c.id === stream.categoryId);

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
                <div>
                  <p className="font-semibold text-sm">{stream.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{stream.type}</p>
                </div>
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
