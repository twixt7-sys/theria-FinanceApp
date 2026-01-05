import React, { useState } from 'react';
import { Plus, Folder, Wallet, Edit2, Trash2, Check, Upload } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { IconComponent } from '../components/IconComponent';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Textarea } from '../components/ui/textarea';

const ICON_OPTIONS = ['Wallet', 'TrendingUp', 'Utensils', 'Car', 'Home', 'ShoppingBag', 'Coffee', 'Heart', 'Briefcase', 'Gift', 'Book', 'Music', 'Smartphone', 'Plane', 'Dumbbell'];
const COLOR_OPTIONS = ['#10B981', '#059669', '#34D399', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#6366F1'];

export const CategoriesScreen: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterScope, setFilterScope] = useState<'account' | 'stream'>('account');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [scope, setScope] = useState<'account' | 'stream'>('account');
  const [iconName, setIconName] = useState('Wallet');
  const [color, setColor] = useState('#10B981');
  const [customSvg, setCustomSvg] = useState('');

  const filteredCategories = categories.filter(c => c.scope === filterScope);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateCategory(editingId, { name, scope, iconName, color, customSvg });
      setEditingId(null);
    } else {
      addCategory({ name, scope, iconName, color, customSvg });
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
      deleteCategory(deleteId);
      setDeleteId(null);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setScope(filterScope);
    setIconName('Wallet');
    setColor('#10B981');
    setCustomSvg('');
    setIsAddOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">
          Categories
        </h1>
        <p className="text-muted-foreground mt-1">Organize your accounts and streams</p>
      </div>

      {/* Top Navigation Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex items-center gap-1 p-1 bg-muted/50 rounded-xl border border-border backdrop-blur-sm">
          <button
            onClick={() => setFilterScope('account')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium ${
              filterScope === 'account'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-card'
            }`}
          >
            <Wallet size={18} />
            <span>Account</span>
          </button>
          <button
            onClick={() => setFilterScope('stream')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium ${
              filterScope === 'stream'
                ? 'bg-secondary text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-card'
            }`}
          >
            <Folder size={18} />
            <span>Stream</span>
          </button>
        </div>

        <Button onClick={handleOpenAdd} className="bg-primary hover:opacity-90 text-white shadow-md">
          <Plus size={20} className="mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md"
                style={{ backgroundColor: `${category.color}40` }}
              >
                {category.customSvg ? (
                  <div dangerouslySetInnerHTML={{ __html: category.customSvg }} className="w-6 h-6" />
                ) : (
                  <IconComponent name={category.iconName} style={{ color: category.color }} size={24} />
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(category.id)}
                  className="p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => setDeleteId(category.id)}
                  className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-lg mb-1 text-foreground">{category.name}</h3>
            <p className="text-sm text-muted-foreground capitalize">{category.scope} category</p>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p className="text-lg">No {filterScope} categories yet</p>
            <p className="text-sm mt-1">Click the button above to create one</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'Create'} Category</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update' : 'Add'} a category to organize your {scope === 'account' ? 'accounts' : 'streams'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="e.g., Cash & Bank, Investments"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Scope *</Label>
              <Select value={scope} onValueChange={(v: any) => setScope(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="stream">Stream</SelectItem>
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
              <Label>Custom SVG Icon (Optional)</Label>
              <Textarea
                placeholder='<svg viewBox="0 0 24 24">...</svg>'
                value={customSvg}
                onChange={(e) => setCustomSvg(e.target.value)}
                rows={3}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">Paste your custom SVG code here. Leave empty to use icon above.</p>
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
                {editingId ? 'Update' : 'Create'} Category
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
    </div>
  );
};
