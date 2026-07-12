import React, { useMemo, useState } from 'react';
import { Folder, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../../../core/state/DataContext';
import { useAlert } from '../../../core/state/AlertContext';
import { IconComponent } from '../../../shared/components/IconComponent';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/components/ui/alert-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { DetailsModal } from '../../../shared/components/DetailsModal';
import { SimpleModeHint } from '../../../shared/components/SimpleModeHint';
import { EmptyState } from '../../../shared/components/EmptyState';
import { AddCategoryModal } from '../components/AddCategoryModal';
import { FinanceBuddy, type BuddyMood } from '../../../shared/components/FinanceBuddy';
type CategoriesScreenProps = {
  filterOpen: boolean;
  onToggleFilter: () => void;
};

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  filterOpen,
}) => {
  const { categories, deleteCategory } = useData();
  const { showDeleteAlert } = useAlert();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterScope, setFilterScope] = useState<'account' | 'stream'>('account');
  const [filterIcon, setFilterIcon] = useState<string>('all');
  const [iconPage, setIconPage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  // Session-only: Terry returns the next time the page is opened.
  const [buddyDismissed, setBuddyDismissed] = useState(false);

  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const matchesScope = c.scope === filterScope;
      const matchesIcon = filterIcon === 'all' || c.iconName === filterIcon;
      return matchesScope && matchesIcon;
    });
  }, [categories, filterScope, filterIcon]);

  // Get unique icons for filters
  const uniqueIcons = useMemo(() => {
    const icons = [...new Set(categories.map(c => c.iconName))];
    return icons.sort();
  }, [categories]);

  // Pagination for icons
  const ICONS_PER_PAGE = 8;
  const totalIconPages = Math.ceil(uniqueIcons.length / ICONS_PER_PAGE);
  const currentIcons = uniqueIcons.slice(
    iconPage * ICONS_PER_PAGE,
    (iconPage + 1) * ICONS_PER_PAGE
  );

  const handleEdit = (categoryId: string) => {
    setEditingId(categoryId);
    setIsAddOpen(true);
  };

  const closeCategoryModal = () => {
    setIsAddOpen(false);
    setEditingId(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      const category = categories.find(c => c.id === deleteId);
      deleteCategory(deleteId);
      if (category) {
        showDeleteAlert(`Category "${category.name}"`, 'Deleted successfully');
      }
      setDeleteId(null);
    }
  };

  const accountCategoryCount = categories.filter((c) => c.scope === 'account').length;
  const streamCategoryCount = categories.filter((c) => c.scope === 'stream').length;

  // Terry appreciates a tidy filing system
  const buddyMood: BuddyMood = categories.length === 0 ? 'neutral' : 'happy';
  const buddyLines: string[] = [];
  if (categories.length === 0) {
    buddyLines.push('No categories yet — they keep your accounts and streams tidy!');
    buddyLines.push('Tap the + button to make your first drawer. "Cash & Bank" is a classic.');
  } else {
    buddyLines.push(
      `Your filing system: **${accountCategoryCount}** account ${accountCategoryCount === 1 ? 'category' : 'categories'} and **${streamCategoryCount}** for streams.`,
    );
    buddyLines.push('Tap a category to peek inside — colors and icons are all editable.');
    buddyLines.push('Tip: fewer, clearer categories beat a drawer for everything.');
  }

  return (
    <div className="space-y-4 pb-6">
      <SimpleModeHint page="categories" />

      {/* Terry keeps things tidy */}
      {!buddyDismissed && (
        <FinanceBuddy lines={buddyLines} mood={buddyMood} onDismiss={() => setBuddyDismissed(true)} />
      )}
            {/* Icon Filter - Retracted above nav */}
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
                                  ? 'bg-primary text-white shadow'
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
                                    ? 'bg-primary text-white shadow'
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

      {/* Categories overview — violet take on the dashboard balance widget */}
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-violet-100/80 p-4 shadow-sm dark:bg-violet-950/40 sm:p-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-violet-500/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-12 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl"
        />

        <div className="relative flex items-center gap-4 sm:gap-5">
          {/* Category count circle */}
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <div className="rounded-full border border-border/40 bg-card/40 p-1.5 shadow-sm">
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-[6px] border-violet-500 bg-card px-3 text-center shadow-inner sm:h-32 sm:w-32">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Categories
                </span>
                <span className="mt-0.5 text-2xl font-bold tabular-nums text-foreground">
                  {categories.length}
                </span>
              </div>
            </div>
            <p className="max-w-32 text-center text-[10px] font-medium leading-tight text-muted-foreground sm:max-w-36">
              {filteredCategories.length} in this view
            </p>
          </div>

          {/* Account / Stream category counts */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center justify-between gap-2 rounded-2xl bg-amber-600/10 px-3 py-2">
              <div className="min-w-0">
                <p className="text-[11px] font-medium leading-tight text-muted-foreground">For accounts</p>
                <p className="text-sm font-bold tabular-nums text-amber-700 dark:text-amber-400">
                  {accountCategoryCount}
                </p>
              </div>
              <Wallet size={16} className="shrink-0 text-amber-600" aria-hidden />
            </div>
            <div className="flex items-center justify-between gap-2 rounded-2xl bg-violet-500/10 px-3 py-2">
              <div className="min-w-0">
                <p className="text-[11px] font-medium leading-tight text-muted-foreground">For streams</p>
                <p className="text-sm font-bold tabular-nums text-violet-600 dark:text-violet-400">
                  {streamCategoryCount}
                </p>
              </div>
              <Folder size={16} className="shrink-0 text-violet-500" aria-hidden />
            </div>
          </div>
        </div>
      </div>

      {/* Account / Stream capsule nav */}
      <div className="flex w-full rounded-full bg-card border border-border shadow-sm p-0.5">
        {(
          [
            { key: 'account', label: 'Accounts', icon: Wallet, activeClass: 'bg-amber-600 text-white shadow' },
            { key: 'stream', label: 'Streams', icon: Folder, activeClass: 'bg-violet-500 text-white shadow' },
          ] as const
        ).map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.key}
              onClick={() => setFilterScope(option.key)}
              className={`flex-1 px-2 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                filterScope === option.key
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

      {/* Categories Grid - Similar to Streams */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => setDetailsId(category.id)}
              className="flex items-center gap-2.5 bg-card border border-border rounded-full p-2 pr-3 transition-all duration-200 group cursor-pointer hover:shadow-md hover:border-primary/25"
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
              <div className="space-y-0.5 min-w-0">
                <h3 className="font-semibold text-foreground truncate text-sm tracking-tight">{category.name}</h3>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize inline-flex w-fit ${
                  category.scope === 'account' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                }`}>
                  {category.scope}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <EmptyState
            title={`No ${filterScope} categories yet`}
            hint="Use the + button to add one"
          />
        )}
      </div>

      <AddCategoryModal
        isOpen={isAddOpen}
        onClose={closeCategoryModal}
        editId={editingId}
        scope={filterScope}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
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

      {/* Details Modal */}
      {detailsId && (() => {
        const category = categories.find(c => c.id === detailsId);
        if (!category) return null;
        
        return (
          <DetailsModal
            isOpen={!!detailsId}
            onClose={() => setDetailsId(null)}
            title={category.name}
            onEdit={() => {
              setDetailsId(null);
              handleEdit(category.id);
            }}
            onDelete={() => {
              setDetailsId(null);
              setDeleteId(category.id);
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center shadow-md"
                  style={{ backgroundColor: `${category.color}22` }}
                >
                  {category.customSvg ? (
                    <div dangerouslySetInnerHTML={{ __html: category.customSvg }} className="w-8 h-8" />
                  ) : (
                    <IconComponent name={category.iconName} size={32} style={{ color: category.color }} />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-semibold capitalize">{category.scope}</p>
                </div>
              </div>
              
              {category.customSvg && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Custom SVG</p>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-xs">{category.customSvg}</code>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-6 h-6 rounded border border-border"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-mono text-sm">{category.color}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Icon</p>
                  <p className="font-semibold">{category.iconName}</p>
                </div>
              </div>
            </div>
          </DetailsModal>
        );
      })()}
    </div>
  );
};
