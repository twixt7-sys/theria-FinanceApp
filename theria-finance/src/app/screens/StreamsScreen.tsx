import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Edit2, Trash2, Check, X } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { IconComponent } from '../components/IconComponent';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';

const ICON_OPTIONS = ['Briefcase', 'Code', 'ShoppingCart', 'Car', 'Film', 'Home', 'Coffee', 'Heart', 'Zap', 'Gift', 'Book', 'Music', 'Smartphone', 'Utensils', 'Plane'];
const COLOR_OPTIONS = ['#10B981', '#059669', '#34D399', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#6366F1'];

export const StreamsScreen: React.FC = () => {
  const { streams, addStream, updateStream, deleteStream } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterType, setFilterType] = useState<'income' | 'expense'>('income');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [iconName, setIconName] = useState('Zap');
  const [color, setColor] = useState('#10B981');

  const filteredStreams = streams
    .filter(s => !s.isSystem && s.type === filterType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateStream(editingId, { name, type, iconName, color });
      setEditingId(null);
    } else {
      addStream({ name, type, iconName, color });
    }

    // Reset form
    setName('');
    setType('income');
    setIconName('Zap');
    setColor('#10B981');
    setIsAddOpen(false);
  };

  const handleEdit = (streamId: string) => {
    const stream = streams.find(s => s.id === streamId);
    if (stream) {
      setName(stream.name);
      setType(stream.type as 'income' | 'expense');
      setIconName(stream.iconName);
      setColor(stream.color);
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
    setIsAddOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">
          Income & Expense Streams
        </h1>
        <p className="text-muted-foreground mt-1">Manage your money flow categories</p>
      </div>

      {/* Top Navigation Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex items-center gap-1 p-1 bg-muted/50 rounded-xl border border-border backdrop-blur-sm">
          <button
            onClick={() => setFilterType('income')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium ${
              filterType === 'income'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-card'
            }`}
          >
            <TrendingUp size={18} />
            <span>Income</span>
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium ${
              filterType === 'expense'
                ? 'bg-destructive text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-card'
            }`}
          >
            <TrendingDown size={18} />
            <span>Expense</span>
          </button>
        </div>

        <Button onClick={handleOpenAdd} className="bg-primary hover:opacity-90 text-white shadow-md">
          <Plus size={20} className="mr-2" />
          Add {filterType === 'income' ? 'Income' : 'Expense'}
        </Button>
      </div>

      {/* Streams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStreams.map((stream) => (
          <div
            key={stream.id}
            className={`${
              stream.type === 'income'
                ? 'bg-primary/10 border-primary/30'
                : 'bg-destructive/10 border-destructive/30'
            } backdrop-blur-sm border rounded-2xl p-5 hover:shadow-lg transition-all group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md"
                style={{ backgroundColor: `${stream.color}40` }}
              >
                <IconComponent name={stream.iconName} style={{ color: stream.color }} size={24} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(stream.id)}
                  className="p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => setDeleteId(stream.id)}
                  className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-lg mb-1 text-foreground">{stream.name}</h3>
            <p className="text-sm text-muted-foreground capitalize">{stream.type} stream</p>
          </div>
        ))}

        {filteredStreams.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p className="text-lg">No {filterType} streams yet</p>
            <p className="text-sm mt-1">Click the button above to create one</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'Create'} {type === 'income' ? 'Income' : 'Expense'} Stream</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update' : 'Add'} a new source or destination for your money flow
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder={type === 'income' ? 'e.g., Salary, Freelance' : 'e.g., Groceries, Transport'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Icon *</Label>
              <div className="grid grid-cols-5 gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setIconName(icon)}
                    className={`p-3 rounded-xl border-2 transition-all ${
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

            <div className="space-y-2">
              <Label>Color *</Label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-12 rounded-xl border-2 transition-all ${
                      color === c
                        ? 'border-foreground scale-105 shadow-md'
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="mx-auto text-white" size={20} strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                {editingId ? 'Update' : 'Create'} Stream
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
