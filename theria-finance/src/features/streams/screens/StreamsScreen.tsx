import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Edit2, Trash2, List, Grid, Square, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { useData } from '../../../core/state/DataContext';
import { useCurrency } from '../../../core/state/CurrencyContext';
import { IconComponent } from '../../../shared/components/IconComponent';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/components/ui/alert-dialog';
import { Badge } from '../../../shared/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { DetailsModal } from '../../../shared/components/DetailsModal';
import { AddStreamModal } from '../components/AddStreamModal';
import { SimpleModeHint } from '../../../shared/components/SimpleModeHint';
import { EmptyState } from '../../../shared/components/EmptyState';
import { FinanceBuddy, type BuddyMood } from '../../../shared/components/FinanceBuddy';
import { formatCompactCurrency } from '../../../shared/lib/compactCurrency';

const CATEGORIES_PER_PAGE = 3;
interface StreamsScreenProps {
  filterOpen: boolean;
};

export const StreamsScreen: React.FC<StreamsScreenProps> = ({
  filterOpen,
}) => {
  const { streams, categories, records, deleteStream } = useData();
  const { formatMoney: formatCurrency } = useCurrency();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterType, setFilterType] = useState<'income' | 'expense'>('income');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [categoryPage, setCategoryPage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewLayout, setViewLayout] = useState<'list' | 'small' | 'full'>('small');
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(new Set());
  // Session-only: Terry returns the next time the page is opened.
  const [buddyDismissed, setBuddyDismissed] = useState(false);
  
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
  }, [totalCategoryPages, filterType]);

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
    .filter(s => !s.isSystem && s.type === filterType)
    .filter(s => filterCategoryId === 'all' ? true : s.categoryId === filterCategoryId);

  const groupedByCategory = useMemo(() => {
    const groups = streamCategories.map((cat) => ({
      category: cat,
      streams: filteredStreams.filter((s) => s.categoryId === cat.id),
    }));
    const uncategorized = filteredStreams.filter((s) => !streamCategories.find((c) => c.id === s.categoryId));
    if (uncategorized.length) {
      groups.push({
        category: { id: 'uncategorized', name: 'Other Streams', color: '#6B7280', iconName: 'Folder', scope: 'stream', createdAt: '' },
        streams: uncategorized,
      });
    }
    return groups.filter((g) => g.streams.length > 0);
  }, [filteredStreams, streamCategories]);

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

  const handleOpenAdd = () => {
    setEditingId(null);
    setIsAddOpen(true);
  };

  const closeStreamModal = () => {
    setIsAddOpen(false);
    setEditingId(null);
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

  const buddyMood: BuddyMood = totalStreamCount === 0 ? 'neutral' : 'happy';
  const buddyLines: string[] = [];
  if (totalStreamCount === 0) {
    buddyLines.push('No streams yet — they name where money comes from and where it goes!');
    buddyLines.push('Tap the + button and start with your salary and your groceries.');
  } else {
    buddyLines.push(
      `You track **${incomeStreams.length}** income ${incomeStreams.length === 1 ? 'stream' : 'streams'} and **${expenseStreams.length}** expense ${expenseStreams.length === 1 ? 'stream' : 'streams'}.`,
    );
    if (topStream) {
      buddyLines.push(
        `**${topStream.name}** is your busiest stream — **${formatCurrency(Math.abs(topStream.net))}** ${topStream.net >= 0 ? 'in' : 'out'} overall.`,
      );
    }
    buddyLines.push('Tip: a stream per habit beats one giant "Other" bucket.');
  }

  return (
    <div className="space-y-4 pb-6">
      <SimpleModeHint page="streams" />

      {/* Terry tracks the flow */}
      {!buddyDismissed && (
        <FinanceBuddy lines={buddyLines} mood={buddyMood} onDismiss={() => setBuddyDismissed(true)} />
      )}

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

      {/* Streams overview — yellow take on the dashboard balance widget */}
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-yellow-100/80 p-4 shadow-sm dark:bg-yellow-950/40 sm:p-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-yellow-500/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-12 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl"
        />

        <div className="relative flex items-center gap-4 sm:gap-5">
          {/* Stream count circle */}
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <div className="rounded-full border border-border/40 bg-card/40 p-1.5 shadow-sm">
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-[6px] border-yellow-500 bg-card px-3 text-center shadow-inner sm:h-32 sm:w-32">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Streams
                </span>
                <span className="mt-0.5 text-2xl font-bold tabular-nums text-foreground">
                  {totalStreamCount}
                </span>
              </div>
            </div>
            <p className="max-w-32 text-center text-[10px] font-medium leading-tight text-muted-foreground sm:max-w-36">
              across {streamCategories.length} {streamCategories.length === 1 ? 'category' : 'categories'}
            </p>
          </div>

          {/* Income / Expense stream counts */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center justify-between gap-2 rounded-2xl bg-emerald-500/10 px-3 py-2">
              <div className="min-w-0">
                <p className="text-[11px] font-medium leading-tight text-muted-foreground">Income streams</p>
                <p className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {incomeStreams.length}
                </p>
              </div>
              <TrendingUp size={16} className="shrink-0 text-emerald-500" aria-hidden />
            </div>
            <div className="flex items-center justify-between gap-2 rounded-2xl bg-destructive/10 px-3 py-2">
              <div className="min-w-0">
                <p className="text-[11px] font-medium leading-tight text-muted-foreground">Expense streams</p>
                <p className="text-sm font-bold tabular-nums text-destructive">{expenseStreams.length}</p>
              </div>
              <TrendingDown size={16} className="shrink-0 text-red-500" aria-hidden />
            </div>
            {topStream && (
              <p className="truncate px-1 text-[10px] font-medium text-muted-foreground">
                Busiest: {topStream.name} ·{' '}
                {formatCompactCurrency(Math.abs(topStream.net), formatCurrency)}{' '}
                {topStream.net >= 0 ? 'in' : 'out'}
              </p>
            )}
          </div>

          {/* Layout switcher — the single box */}
          <div className="flex shrink-0 flex-col justify-center gap-1.5 rounded-2xl bg-card/70 px-2 py-2 shadow-sm">
            {(
              [
                { key: 'list', icon: List, label: 'List view' },
                { key: 'small', icon: Grid, label: 'Small card view' },
                { key: 'full', icon: Square, label: 'Full card view' },
              ] as const
            ).map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.key}
                  onClick={() => setViewLayout(option.key)}
                  title={option.label}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                    viewLayout === option.key
                      ? 'bg-yellow-500 text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon size={13} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Income / Expense capsule nav */}
      <div className="flex w-full rounded-full bg-card border border-border shadow-sm p-0.5">
        {(
          [
            { key: 'income', label: 'Income', icon: TrendingUp, activeClass: 'bg-emerald-500 text-white shadow' },
            { key: 'expense', label: 'Expense', icon: TrendingDown, activeClass: 'bg-red-500 text-white shadow' },
          ] as const
        ).map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.key}
              onClick={() => setFilterType(option.key)}
              className={`flex-1 px-2 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                filterType === option.key
                  ? option.activeClass
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon size={14} />
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Streams grouped by category */}
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
                <Badge variant="outline" className="text-[11px]">
                  {group.streams.length} item{group.streams.length > 1 ? 's' : ''}
                </Badge>
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
                  key={`streams-group-${group.category.id}-${viewLayout}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
            {viewLayout === 'list' && (
              <div className="space-y-2">
                {group.streams.map((stream) => (
                  <div
                    key={stream.id}
                    onClick={() => setDetailsId(stream.id)}
                    className="flex items-center justify-between bg-card border border-border rounded-full p-2 pr-3 transition-all duration-200 cursor-pointer group hover:shadow-sm hover:border-primary/25"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ring-1 ring-black/5"
                        style={{ backgroundColor: stream.color }}
                      >
                        <IconComponent name={stream.iconName} size={18} style={{ color: 'white' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate tracking-tight">{stream.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${
                            stream.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                          }`}>
                            {stream.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleEdit(stream.id)}
                        className="p-1.5 rounded-full hover:bg-primary/10 text-primary transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(stream.id)}
                        className="p-1.5 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewLayout === 'small' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {group.streams.map((stream) => (
                  <div
                    key={stream.id}
                    onClick={() => setDetailsId(stream.id)}
                    className="flex items-center gap-2.5 bg-card border border-border rounded-full p-2 pr-3 transition-all duration-200 cursor-pointer group hover:shadow-md hover:border-primary/25"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ring-1 ring-black/5"
                      style={{ backgroundColor: stream.color }}
                    >
                      <IconComponent name={stream.iconName} size={18} style={{ color: 'white' }} />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h3 className="font-semibold truncate text-sm tracking-tight">{stream.name}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize inline-flex w-fit ${
                        stream.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {stream.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewLayout === 'full' && (
              <div className="grid grid-cols-1 gap-4">
                {group.streams.map((stream) => {
                  const net = streamNetById.get(stream.id) ?? 0;
                  const showAmount = stream.type === 'income' || stream.type === 'expense';
                  return (
                    <div
                      key={stream.id}
                      onClick={() => setDetailsId(stream.id)}
                      className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 min-h-[180px] overflow-hidden cursor-pointer group transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${stream.color}dd, ${stream.color}99)`,
                      }}
                    >
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-3 right-3 w-14 h-14 rounded-full border-2 border-white/20" />
                        <div className="absolute bottom-3 left-3 w-16 h-16 rounded-full border-2 border-white/15" />
                        <div className="absolute top-1/2 right-1/4 w-10 h-10 rounded-full border-2 border-white/10" />
                      </div>
                      <div className="absolute -top-6 right-2 w-24 h-24 opacity-8 transform translate-x-6 translate-y-1 scale-[2] rotate-12 pointer-events-none">
                        <IconComponent
                          name={stream.iconName}
                          size={96}
                          style={{ color: 'white', transform: 'scaleX(-1)' }}
                        />
                      </div>
                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg backdrop-blur-sm shrink-0"
                              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                            >
                              <IconComponent name={stream.iconName} size={16} style={{ color: 'white' }} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-white text-base truncate">{stream.name}</h3>
                              <p className="text-white/80 text-xs capitalize">{stream.type}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full font-medium capitalize">
                              {stream.type}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleEdit(stream.id)}
                                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteId(stream.id)}
                                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1" />
                        <div className="flex justify-between items-end gap-4">
                          {showAmount ? (
                            <div>
                              <p className="text-white/70 text-xs mb-1">Net activity</p>
                              <p className="text-white font-bold text-lg">
                                {stream.type === 'income' ? '+' : '-'}
                                {formatCurrency(Math.abs(net))}
                              </p>
                            </div>
                          ) : (
                            <Badge className="bg-white/20 text-white border-0 capitalize">{stream.type}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {filteredStreams.length === 0 && (
          <EmptyState
            title={`No ${filterType} streams yet`}
            hint="Use the + button to add one"
          />
        )}
      </div>

      <AddStreamModal
        isOpen={isAddOpen}
        onClose={closeStreamModal}
        editId={editingId}
        initialType={filterType}
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
