import React, { useMemo, useState } from 'react';
import { Folder, Wallet, List, Grid, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../../../core/state/DataContext';
import { useAlert } from '../../../core/state/AlertContext';
import { IconComponent } from '../../../shared/components/IconComponent';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/components/ui/alert-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { DetailsModal } from '../../../shared/components/DetailsModal';
import { SimpleModeHint } from '../../../shared/components/SimpleModeHint';
import { EmptyState } from '../../../shared/components/EmptyState';
import { AddCategoryModal } from '../components/AddCategoryModal';
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
  const [viewLayout, setViewLayout] = useState<'list' | 'small' | 'full'>('small');

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

  return (
    <div className="space-y-4 pb-6">
      <SimpleModeHint page="categories" />
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

      {/* Categories Overview Card */}
      <div 
        className="relative bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-4 text-white overflow-hidden transition-all"
        style={{ 
          background: 'linear-gradient(135deg, #9333eadd, #6b21a899)'
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-3 right-3 w-14 h-14 rounded-full border-2 border-white/20"></div>
          <div className="absolute bottom-3 left-3 w-16 h-16 rounded-full border-2 border-white/15"></div>
          <div className="absolute top-1/2 right-1/4 w-10 h-10 rounded-full border-2 border-white/10"></div>
        </div>
        
        {/* Background icon */}
        <div className="absolute -top-6 right-2 w-24 h-24 opacity-8 transform translate-x-6 translate-y-1 scale-[2] rotate-12">
          <Folder size={96} style={{ color: 'white', transform: 'scaleX(-1)' }} />
        </div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-white/80 mb-0.5 text-sm">Filtered Categories</p>
            <h2 className="text-2xl font-bold mb-0.5">{filteredCategories.length}</h2>
            <p className="text-white/70 text-sm">{categories.length} total</p>
          </div>
          
          {/* Layout Selection Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setViewLayout('list')}
              className={`p-1 rounded-lg transition-all backdrop-blur-sm ${
                viewLayout === 'list'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
              }`}
              title="List View"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewLayout('small')}
              className={`p-1 rounded-lg transition-all backdrop-blur-sm ${
                viewLayout === 'small'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
              }`}
              title="Small Card View"
            >
              <Grid size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Account/Stream Navigation */}
      <div className="flex w-full rounded-xl bg-card border border-border p-0.5">
        {(['account', 'stream'] as const).map((scope) => (
          <button
            key={scope}
            onClick={() => setFilterScope(scope)}
            className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center justify-center gap-1.5 ${
              filterScope === scope
                ? scope === 'account'
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-white'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {scope === 'account' ? <Wallet size={14} /> : <Folder size={14} />}
            {scope}
          </button>
        ))}
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
