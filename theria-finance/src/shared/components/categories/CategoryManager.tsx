import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from '@/shared/icons';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../../../core/state/DataContext';
import { useAlert } from '../../../core/state/AlertContext';
import { CATEGORY_SCOPE_CONFIG } from '../../../core/domain/categoryScopes';
import type { CategoryScope } from '../../../core/domain/types';
import { accentVars } from '../../theme/moduleAccents';
import { IconComponent } from '../IconComponent';
import { DetailsModal } from '../DetailsModal';
import { EmptyState } from '../EmptyState';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { AddCategoryModal } from './AddCategoryModal';

const ICONS_PER_PAGE = 8;

interface CategoryManagerProps {
  scope: CategoryScope;
  /** Icon-filter bar expansion, driven by the owning screen's existing
   *  filter toggle so Categories behaves like every other tab there. */
  filterOpen?: boolean;
}

/**
 * The category grid/details/delete surface, lifted out of the old standalone
 * CategoriesScreen and parameterized by scope so every owning module (Records,
 * Accounts, Streams, Budget, Savings) gets the same view for its own slice of
 * categories. Color comes from the scope's owner screen via moduleAccents —
 * never redeclared here.
 */
export const CategoryManager: React.FC<CategoryManagerProps> = ({ scope, filterOpen = false }) => {
  const { categories, deleteCategory, getCategoryUsage } = useData();
  const { showDeleteAlert } = useAlert();
  const config = CATEGORY_SCOPE_CONFIG[scope];

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterIcon, setFilterIcon] = useState('all');
  const [iconPage, setIconPage] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const scopedCategories = useMemo(
    () => categories.filter((c) => c.scope === scope),
    [categories, scope],
  );

  const uniqueIcons = useMemo(() => {
    const icons = [...new Set(scopedCategories.map((c) => c.iconName))];
    return icons.sort();
  }, [scopedCategories]);

  const totalIconPages = Math.max(1, Math.ceil(uniqueIcons.length / ICONS_PER_PAGE));
  const currentIcons = uniqueIcons.slice(
    iconPage * ICONS_PER_PAGE,
    (iconPage + 1) * ICONS_PER_PAGE,
  );

  const filteredCategories = useMemo(
    () => scopedCategories.filter((c) => filterIcon === 'all' || c.iconName === filterIcon),
    [scopedCategories, filterIcon],
  );

  const handleEdit = (categoryId: string) => {
    setEditingId(categoryId);
    setIsAddOpen(true);
  };

  const closeCategoryModal = () => {
    setIsAddOpen(false);
    setEditingId(null);
  };

  const deleteTarget = deleteId ? scopedCategories.find((c) => c.id === deleteId) : null;
  const deleteUsage = deleteId ? getCategoryUsage(deleteId) : null;
  const deleteBlocked = Boolean(config.required && deleteUsage && deleteUsage.total > 0);

  const handleDelete = () => {
    if (!deleteId || !deleteTarget) return;
    const result = deleteCategory(deleteId);
    if (result.ok) {
      showDeleteAlert(
        `Category "${deleteTarget.name}"`,
        result.clearedCount > 0
          ? `Removed from ${result.clearedCount} ${result.clearedCount === 1 ? 'item' : 'items'}`
          : 'Deleted successfully',
      );
      setDeleteId(null);
    }
    // Blocked deletes leave the dialog open — the description already
    // explains why, and there's nothing else useful to click but Cancel.
  };

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

      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          {scopedCategories.length} {config.noun} {scopedCategories.length === 1 ? 'category' : 'categories'}
        </p>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 rounded-full module-accent-solid px-3 py-1.5 text-xs font-semibold shadow-sm transition-transform hover:scale-[1.03] active:scale-95"
        >
          <Plus size={14} strokeWidth={2.5} />
          Add category
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            onClick={() => setDetailsId(category.id)}
            className="flex items-center gap-2.5 bg-card border border-border rounded-full p-2 pr-3 transition-all duration-200 group cursor-pointer hover:shadow-md module-accent-border"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ring-1 ring-black/5"
              style={{ backgroundColor: category.color }}
            >
              {category.customSvg ? (
                <div
                  dangerouslySetInnerHTML={{ __html: category.customSvg }}
                  className="w-6 h-6 text-white"
                />
              ) : (
                <IconComponent name={category.iconName} style={{ color: 'white' }} size={18} />
              )}
            </div>
            <h3 className="min-w-0 flex-1 truncate font-semibold text-foreground text-sm tracking-tight">
              {category.name}
            </h3>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <EmptyState
          title={`No ${config.noun} categories yet`}
          hint="Use the button above to add one"
        />
      )}

      <AddCategoryModal
        isOpen={isAddOpen}
        onClose={closeCategoryModal}
        editId={editingId}
        scope={scope}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteBlocked
                ? `This category is still used by ${deleteUsage!.total} ${deleteUsage!.total === 1 ? config.noun : `${config.noun}s`}. Every ${config.noun} needs a category, so reassign or remove those first.`
                : deleteUsage && deleteUsage.total > 0
                  ? `This will remove it from ${deleteUsage.total} ${deleteUsage.total === 1 ? 'item' : 'items'}. This action cannot be undone.`
                  : 'Are you sure you want to delete this category? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{deleteBlocked ? 'Close' : 'Cancel'}</AlertDialogCancel>
            {!deleteBlocked && (
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {detailsId && (() => {
        const category = scopedCategories.find((c) => c.id === detailsId);
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
                  <p className="text-sm text-muted-foreground">Used by</p>
                  <p className="font-semibold capitalize">
                    {getCategoryUsage(category.id).total} {config.noun}
                    {getCategoryUsage(category.id).total === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

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
