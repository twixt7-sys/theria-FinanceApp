import React, { useMemo, useState } from 'react';
import { Folder, Wallet, Edit2, Trash2, Check, Filter, List, Grid, Square, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAlert } from '../contexts/AlertContext';
import { IconComponent } from '../components/IconComponent';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { CompactFormModal } from '../components/CompactFormModal';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DetailsModal } from '../components/DetailsModal';

const ICON_OPTIONS = ['Wallet', 'TrendingUp', 'Utensils', 'Car', 'Home', 'ShoppingBag', 'Coffee', 'Heart', 'Briefcase', 'Gift', 'Book', 'Music', 'Smartphone', 'Plane', 'Dumbbell'];
const COLOR_OPTIONS = ['#10B981', '#059669', '#34D399', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#6366F1'];
type CategoriesScreenProps = {
  filterOpen: boolean;
  onToggleFilter: () => void;
};

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  filterOpen,
  onToggleFilter,
}) => {
  const { categories, addCategory, updateCategory, deleteCategory } = useData();
  const { showAddAlert, showUpdateAlert, showDeleteAlert } = useAlert();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterScope, setFilterScope] = useState<'account' | 'stream'>('account');
  const [filterIcon, setFilterIcon] = useState<string>('all');
  const [iconPage, setIconPage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [viewLayout, setViewLayout] = useState<'list' | 'small' | 'full'>('small');
  
  // Form state
  const [name, setName] = useState('');
  const [scope, setScope] = useState<'account' | 'stream'>('account');
  const [iconName, setIconName] = useState('Wallet');
  const [color, setColor] = useState('#10B981');
  const [customSvg, setCustomSvg] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateCategory(editingId, { name, scope, iconName, color, customSvg });
      showUpdateAlert(`Category "${name}"`, 'Updated successfully');
      setEditingId(null);
    } else {
      addCategory({ name, scope, iconName, color, customSvg });
      showAddAlert(`Category "${name}"`, `Added to ${scope}`);
    }

    // Reset form
    setName('');
    setScope('account');
    setIconName('Wallet');
    setColor('#10B981');
    setCustomSvg('');
    setIsAddOpen(false);
  };

  const handleEdit = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setName(category.name);
      setScope(category.scope);
      setIconName(category.iconName);
      setColor(category.color);
      setCustomSvg(category.customSvg || '');
      setEditingId(categoryId);
      setIsAddOpen(true);
    }
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
    <div className="space-y-4">
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
            <button
              onClick={() => setViewLayout('full')}
              className={`p-1 rounded-lg transition-all backdrop-blur-sm ${
                viewLayout === 'full'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
              }`}
              title="Full Card View"
            >
              <Square size={15} />
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
              className="flex flex-col bg-card border border-border rounded-2xl p-3 transition-all group cursor-pointer min-h-[120px]"
              style={{ backgroundColor: `${category.color}12` }}
            >
              <div className="flex items-start justify-between mb-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}22` }}
                >
                  {category.customSvg ? (
                    <div dangerouslySetInnerHTML={{ __html: category.customSvg }} className="w-6 h-6" />
                  ) : (
                    <IconComponent name={category.iconName} style={{ color: category.color }} size={18} />
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(category.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(category.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground truncate text-sm">{category.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{category.scope} category</p>
                </div>
                <div className="mt-3">
                  <Badge
                    style={{ backgroundColor: `${category.color}22`, color: category.color }}
                    className="text-[11px] capitalize border-0 w-full justify-center"
                  >
                    {category.scope}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-10 bg-card border border-border rounded-2xl">
            <p className="text-lg font-semibold">No {filterScope} categories yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create one by clicking on a card</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <CompactFormModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditingId(null);
        }}
        onSubmit={handleSubmit}
        title={`${editingId ? 'Edit' : 'Add'} Category`}
      >
        <div className="space-y-4">
          {/* Scope Selection */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setScope('account')}
              className={`h-12 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                scope === 'account'
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-foreground hover:bg-muted'
              }`}
            >
              <Wallet size={16} />
              Account
            </button>
            <button
              type="button"
              onClick={() => setScope('stream')}
              className={`h-12 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                scope === 'stream'
                  ? 'bg-secondary text-white border-secondary'
                  : 'border-border text-foreground hover:bg-muted'
              }`}
            >
              <Folder size={16} />
              Stream
            </button>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              placeholder="e.g., Cash & Bank, Investments"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="shadow-sm"
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label>Icon *</Label>
            <div className="grid grid-cols-5 gap-2">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setIconName(icon)}
                  className={`p-3 rounded-xl border-2 transition-all shadow-sm ${
                    iconName === icon
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  <IconComponent name={icon} size={20} />
                </button>
              ))}
            </div>
          </div>

          {/* Custom SVG */}
          <div className="space-y-2">
            <Label>Custom SVG Icon (Optional)</Label>
            <Textarea
              placeholder='<svg viewBox="0 0 24 24">...</svg>'
              value={customSvg}
              onChange={(e) => setCustomSvg(e.target.value)}
              rows={3}
              className="font-mono text-xs shadow-sm"
            />
            <p className="text-xs text-muted-foreground">Paste your custom SVG code here. Leave empty to use icon above.</p>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color *</Label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-10 rounded-lg border-2 transition-all shadow-sm ${
                    color === c
                      ? 'border-foreground scale-105 shadow-md'
                      : 'border-border hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="mx-auto text-white" size={16} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CompactFormModal>

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
