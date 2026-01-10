import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Edit2, Trash2, Check, Filter } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { IconComponent } from '../components/IconComponent';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Badge } from '../components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { CompactFormModal } from '../components/CompactFormModal';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const ICON_OPTIONS = ['Briefcase', 'Code', 'ShoppingCart', 'Car', 'Film', 'Home', 'Coffee', 'Heart', 'Zap', 'Gift', 'Book', 'Music', 'Smartphone', 'Utensils', 'Plane'];
const COLOR_OPTIONS = ['#10B981', '#059669', '#34D399', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#6366F1'];
type StreamsScreenProps = {
  filterOpen: boolean;
  onToggleFilter: () => void;
};

export const StreamsScreen: React.FC<StreamsScreenProps> = ({
  filterOpen,
  onToggleFilter,
}) => {
  const { streams, categories, addStream, updateStream, deleteStream } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterType, setFilterType] = useState<'income' | 'expense'>('income');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
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
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/50">
                <Filter size={16} className="text-muted-foreground" />
                <Select value={filterCategoryId} onValueChange={setFilterCategoryId}>
                  <SelectTrigger className="h-9 min-w-[140px] bg-card text-sm shadow-sm">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {streamCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  className="flex flex-col bg-card border border-border rounded-2xl p-4 hover:shadow-lg transition-all group cursor-pointer shadow-sm min-h-[140px]"
                  style={{ boxShadow: `0 6px 20px ${stream.color}20`, backgroundColor: `${stream.color}12` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: `${stream.color}22` }}
                    >
                      <IconComponent name={stream.iconName} style={{ color: stream.color }} size={22} />
                    </div>
                    <div
                      className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleEdit(stream.id)}
                        className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteId(stream.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground truncate">{stream.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {streamCategories.find((c) => c.id === stream.categoryId)?.name || 'No category'}
                      </p>
                    </div>
                    <div className="mt-3">
                      <Badge
                        style={{ backgroundColor: `${stream.color}22`, color: stream.color }}
                        className="text-[11px] capitalize border-0 w-full justify-center"
                      >
                        {stream.type}
                      </Badge>
                    </div>
                  </div>
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
