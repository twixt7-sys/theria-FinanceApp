import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Edit2, Trash2, Check, Filter, List, Grid, Square, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { IconComponent } from '../components/IconComponent';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Badge } from '../components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { CompactFormModal } from '../components/CompactFormModal';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const ICON_OPTIONS = ['Briefcase', 'Code', 'ShoppingCart', 'Car', 'Film', 'Home', 'Coffee', 'Heart', 'Zap', 'Gift', 'Book', 'Music', 'Smartphone', 'Utensils', 'Plane'];
const COLOR_OPTIONS = ['#10B981', '#059669', '#34D399', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#6366F1'];
interface StreamsScreenProps {
  filterOpen: boolean;
};

export const StreamsScreen: React.FC<StreamsScreenProps> = ({
  filterOpen,
}) => {
  const { streams, categories, addStream, updateStream, deleteStream } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterType, setFilterType] = useState<'income' | 'expense'>('income');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [categoryPage, setCategoryPage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewLayout, setViewLayout] = useState<'list' | 'small' | 'full'>('small');
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [iconName, setIconName] = useState('Zap');
  const [color, setColor] = useState('#10B981');
  const [categoryId, setCategoryId] = useState('');

  const streamCategories = useMemo(
    () => categories.filter((c) => c.scope === 'stream'),
    [categories],
  );

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateStream(editingId, { name, type, iconName, color, categoryId });
      setEditingId(null);
    } else {
      addStream({ name, type, iconName, color, categoryId });
    }

    // Reset form
    setName('');
    setType('income');
    setIconName('Zap');
    setColor('#10B981');
    setCategoryId('');
    setIsAddOpen(false);
  };

  const handleEdit = (streamId: string) => {
    const stream = streams.find(s => s.id === streamId);
    if (stream) {
      setName(stream.name);
      setType(stream.type as 'income' | 'expense');
      setIconName(stream.iconName);
      setColor(stream.color);
      setCategoryId(stream.categoryId || '');
      setEditingId(streamId);
      setIsAddOpen(true);
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteStream(deleteId);
      setDeleteId(null);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setType(filterType);
    setIconName('Zap');
    setColor(filterType === 'income' ? '#10B981' : '#EF4444');
    setCategoryId(streamCategories[0]?.id || '');
    setIsAddOpen(true);
  };

  return (
    <div className="space-y-6">

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
            <div className="rounded-xl bg-card border border-border p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryPage(Math.max(0, categoryPage - 1))}
                  disabled={categoryPage === 0}
                  className="p-1.5 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="flex gap-2 flex-1 justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`category-page-${categoryPage}`}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="flex gap-2"
                    >
                      <motion.button
                        key="all"
                        type="button"
                        onClick={() => setFilterCategoryId('all')}
                        className={`flex items-center gap-1 px-2.5 py-2 rounded-md text-xs font-medium capitalize transition-all ${
                          filterCategoryId === 'all'
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        title="All categories"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        All
                      </motion.button>
                      {streamCategories.map((cat) => (
                        <motion.button
                          key={cat.id}
                          type="button"
                          onClick={() => setFilterCategoryId(cat.id)}
                          className={`flex items-center gap-1 px-2.5 py-2 rounded-md text-xs font-medium capitalize transition-all ${
                            filterCategoryId === cat.id
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                          title={cat.name}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <IconComponent name={cat.iconName || 'Folder'} size={16} />
                          {cat.name}
                        </motion.button>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                <button
                  type="button"
                  onClick={() => setCategoryPage(Math.min(0, categoryPage + 1))}
                  disabled={true}
                  className="p-1.5 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streams Overview Card */}
      <div 
        className="relative bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white overflow-hidden transition-all"
        style={{ 
          background: 'linear-gradient(135deg, #eab308dd, #ca8a0499)'
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full border-2 border-white/20"></div>
          <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full border-2 border-white/15"></div>
          <div className="absolute top-1/2 right-1/4 w-12 h-12 rounded-full border-2 border-white/10"></div>
        </div>
        
        {/* Background icon */}
        <div className="absolute -top-8 right-2 w-32 h-32 opacity-8 transform translate-x-6 translate-y-1 scale-[2] rotate-12">
          <TrendingUp size={128} style={{ color: 'white', transform: 'scaleX(-1)' }} />
        </div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-white/80 mb-2">Total Streams</p>
            <h2 className="text-4xl font-bold mb-2">{filteredStreams.length}</h2>
            <p className="text-white/70">{streamCategories.length} categories</p>
          </div>
          
          {/* Layout Selection Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setViewLayout('list')}
              className={`p-2 rounded-lg transition-all backdrop-blur-sm ${
                viewLayout === 'list'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewLayout('small')}
              className={`p-2 rounded-lg transition-all backdrop-blur-sm ${
                viewLayout === 'small'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
              }`}
              title="Small Card View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewLayout('full')}
              className={`p-2 rounded-lg transition-all backdrop-blur-sm ${
                viewLayout === 'full'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
              }`}
              title="Full Card View"
            >
              <Square size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Income/Expense Navigation */}
      <div className="flex w-full rounded-xl bg-card border border-border shadow-sm p-1">
        {(['income', 'expense'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold capitalize transition-all flex items-center justify-center gap-2 ${
              filterType === type
                ? type === 'income'
                  ? 'bg-primary text-white shadow'
                  : 'bg-destructive text-white shadow'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {type}
          </button>
        ))}
      </div>

      {/* Streams grouped by category */}
      <div className="space-y-4">
        {groupedByCategory.map((group) => (
          <div key={group.category.id}>
            <div className="flex items-center gap-2 px-1 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.category.color || '#6B7280' }} />
              <p className="text-sm font-semibold text-foreground">{group.category.name}</p>
              <Badge variant="outline" className="text-xs">
                {group.streams.length} item{group.streams.length > 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {group.streams.map((stream) => (
                <div
                  key={stream.id}
                  onClick={() => handleEdit(stream.id)}
                  className={`relative transition-all cursor-pointer group ${
                    viewLayout === 'full' 
                      ? 'bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 min-h-[200px] overflow-hidden'
                      : 'flex flex-col bg-card border border-border rounded-2xl p-4 transition-all group cursor-pointer min-h-[140px]'
                  }`}
                  style={{ 
                    ...(viewLayout === 'full' ? {
                      background: `linear-gradient(135deg, ${stream.color}dd, ${stream.color}99)`
                    } : {
                      backgroundColor: `${stream.color}12`
                    })
                  }}
                >
                  {viewLayout === 'full' && (
                    <>
                      {/* Full card decorative elements */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-4 w-16 h-16 rounded-full border-2 border-white/20"></div>
                        <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full border-2 border-white/15"></div>
                        <div className="absolute top-1/2 right-1/4 w-12 h-12 rounded-full border-2 border-white/10"></div>
                      </div>
                      
                      <div className="absolute -top-8 right-2 w-32 h-32 opacity-8 transform translate-x-6 translate-y-1 scale-[2] rotate-12">
                        <IconComponent
                          name={stream.iconName}
                          size={128}
                          style={{ color: 'white', transform: 'scaleX(-1)' }}
                        />
                      </div>
                    </>
                  )}
                  
                  <div className={`${
                    viewLayout === 'full' ? 'relative z-10 h-full flex flex-col justify-between' : 'flex items-start justify-between mb-3'
                  }`}>
                    <div className={`${
                      viewLayout === 'full' ? 'flex justify-between items-start mb-4' : ''
                    }`}>
                      <div className={`flex items-center gap-3 ${
                        viewLayout === 'full' ? '' : 'w-12 h-12 rounded-xl flex items-center justify-center'
                      }`}
                        style={viewLayout === 'full' ? {} : {
                          backgroundColor: `${stream.color}22`
                        }}
                      >
                        <IconComponent 
                          name={stream.iconName} 
                          size={viewLayout === 'full' ? 18 : 22} 
                          style={{ color: 'white' }} 
                        />
                      </div>
                      <div>
                        <h3 className={`${
                          viewLayout === 'full' ? 'font-bold text-white text-lg truncate' : 'font-semibold truncate'
                        }`}>{stream.name}</h3>
                        {viewLayout === 'full' && (
                          <p className="text-white/80 text-sm">{stream.type}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className={`${
                      viewLayout === 'full' ? 'flex flex-col items-end gap-2' : 'flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'
                    }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {viewLayout === 'full' && (
                        <>
                          {stream.type && (
                            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full font-medium">
                              {stream.type.charAt(0).toUpperCase() + stream.type.slice(1)}
                            </span>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => handleEdit(stream.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          viewLayout === 'full' 
                            ? 'hover:bg-white/20 text-white' 
                            : 'hover:bg-primary/10 text-primary'
                        }`}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteId(stream.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          viewLayout === 'full' 
                            ? 'hover:bg-white/20 text-white' 
                            : 'hover:bg-destructive/10 text-destructive'
                        }`}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {viewLayout !== 'full' && (
                    <div className="flex-1 flex flex-col justify-between">
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {stream.type}
                      </p>
                      <p className="text-lg font-bold">
                        {stream.type === 'income' ? '+' : '-'}{formatCurrency(stream.balance || 0)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredStreams.length === 0 && (
          <div className="text-center py-10 bg-card border border-border rounded-2xl shadow-sm">
            <p className="text-lg font-semibold">No {filterType} streams yet</p>
            <p className="text-sm text-muted-foreground mt-1">Use Add to create one</p>
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
        title={`${editingId ? 'Edit' : 'Add'} ${type === 'income' ? 'Income' : 'Expense'} Stream`}
      >
        <div className="space-y-4">
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setType('income');
                setColor('#10B981');
              }}
              className={`h-12 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                type === 'income'
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-foreground hover:bg-muted'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setColor('#EF4444');
              }}
              className={`h-12 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                type === 'expense'
                  ? 'bg-destructive text-white border-destructive'
                  : 'border-border text-foreground hover:bg-muted'
              }`}
            >
              Expense
            </button>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              placeholder={type === 'income' ? 'Salary, Freelance' : 'Groceries, Transport'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="shadow-sm"
            />
          </div>

          {/* Category */}
          {streamCategories.length > 0 && (
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {streamCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
        </div>
      </CompactFormModal>

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
