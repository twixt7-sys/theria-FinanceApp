import React, { useState, useEffect, useMemo } from 'react';
import { CompactFormModal } from './CompactFormModal';
import { Input } from './ui/input';
import { useData } from '../contexts/DataContext';
import { useAlert } from '../contexts/AlertContext';
import { IconComponent } from './IconComponent';
import { Tag, TrendingUp, TrendingDown } from 'lucide-react';
import { IconColorSubModal, SelectionSubModal, NoteModal } from './submodals';
import { motion, AnimatePresence } from 'motion/react';

// Function to get opposite color based on hex color
const getOppositeColor = (hexColor: string): string => {
  // Remove # if present
  const color = hexColor.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  // Calculate opposite color
  const oppositeR = (255 - r).toString(16).padStart(2, '0');
  const oppositeG = (255 - g).toString(16).padStart(2, '0');
  const oppositeB = (255 - b).toString(16).padStart(2, '0');
  
  return `#${oppositeR}${oppositeG}${oppositeB}`;
};

interface AddStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'income' | 'expense';
  highZIndex?: boolean;
}

export const AddStreamModal: React.FC<AddStreamModalProps> = ({ isOpen, onClose, initialType, highZIndex = false }) => {
  const { categories, addStream } = useData();
  const { showAddAlert } = useAlert();
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [iconName, setIconName] = useState('Target');
  const [color, setColor] = useState('#10B981');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [showIconModal, setShowIconModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const oppositeColor = useMemo(() => getOppositeColor(color), [color]);

  const streamCategories = categories.filter((c) => c.scope === 'stream');

  useEffect(() => {
    if (isOpen && initialType) {
      setType(initialType);
      setColor(initialType === 'income' ? '#10B981' : '#EF4444');
    }
  }, [initialType, isOpen]);

  const getCategoryDetails = () => {
    const category = streamCategories.find(cat => cat.id === categoryId);
    return category || { iconName: 'Tag', color: '#6B7280', name: 'Category' };
  };

  const getCategoryName = () => {
    const category = streamCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Category';
  };

  const handleSelectCategory = (id: string) => {
    setCategoryId(id);
    setShowCategoryModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) return;

    addStream({ name, type, iconName, color, categoryId, note });

    // Show alert
    showAddAlert(`${type === 'income' ? 'Income' : 'Expense'} Stream "${name}"`, note ? `With note: ${note}` : undefined);

    // Reset
    setName('');
    setType('income');
    setIconName('Target');
    setColor('#10B981');
    setCategoryId('');
    setNote('');
    onClose();
  };

  const StreamPreview = () => (
    <div className="flex items-center justify-center p-3 rounded-lg border transition-all duration-300">
      <div 
        className="relative group cursor-pointer min-h-[80px] max-w-[280px] w-full"
      >
        {/* Main Stream Container */}
        <div 
          className="relative rounded-2xl p-4 border-2 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-4"
          style={{ 
            borderColor: color,
            backgroundColor: `${color}08`,
            boxShadow: `0 8px 24px ${color}20, 0 4px 12px ${color}15, inset 0 1px 0 ${color}30`
          }}
        >
          {/* Background Pattern */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, ${color} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${color} 0%, transparent 40%), radial-gradient(circle at 40% 40%, ${color} 0%, transparent 30%)`
            }}
          />
          
          {/* Icon Circle - Left Side */}
          <div className="relative z-10 flex-shrink-0">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110"
              style={{ 
                backgroundColor: color,
                boxShadow: `0 6px 12px ${color}40, 0 3px 6px ${color}30`
              }}
            >
              <IconComponent 
                name={iconName} 
                size={24} 
                style={{ color: 'white' }}
              />
            </div>
            
            {/* Icon Glow */}
            <div 
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md -z-10"
              style={{ backgroundColor: color }}
            />
          </div>
          
          {/* Content - Right Side */}
          <div className="relative z-10 flex-1 flex flex-col justify-center space-y-2">
            {/* Stream Name */}
            <div>
              <h3 
                className="font-bold text-lg transition-colors duration-300"
                style={{ color }}
              >
                {name || 'Stream Name'}
              </h3>
            </div>
            
            {/* Note Display */}
            {note && (
              <p className="text-sm text-muted-foreground line-clamp-2 max-w-[160px]">
                {note}
              </p>
            )}
            
            {/* Stream Badge */}
            <div className="flex items-center gap-2">
              <div 
                className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-md"
                style={{ backgroundColor: color }}
              >
                {type === 'income' ? 'Income Stream' : 'Expense Stream'}
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full opacity-60" style={{ backgroundColor: color }} />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full opacity-60" style={{ backgroundColor: color }} />
          <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full opacity-60" style={{ backgroundColor: color }} />
          <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full opacity-60" style={{ backgroundColor: color }} />
        </div>
        
        {/* Container Glow Effect on Hover */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {highZIndex && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[75]"
            />
          )}
          <div className={highZIndex ? "fixed inset-0 z-[80] flex items-center justify-center p-2" : ""}>
            <CompactFormModal
              isOpen={isOpen && !highZIndex}
              onClose={onClose}
              onSubmit={handleSubmit}
              title="Add Stream"
            >
              <div className="space-y-4">
                {/* Stream Preview */}
                <StreamPreview />

                <div className="my-2 h-px w-full bg-border/80" />

                {/* Stream Name and Icon */}
                <div className="grid grid-cols-12">
                  <Input
                    className="flex items-center gap-2 h-8 rounded-xl border border-border px-3 bg-input-background text-sm shadow-sm grid col-span-10"
                    placeholder='Stream Name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <div className="grid col-span-2">
                    <button
                      type="button"
                      onClick={() => setShowIconModal(true)}
                      className="h-full ml-1.5 rounded-xl border border-border hover:bg-muted transition-colors flex flex-col items-center justify-center gap-1 text-sm font-semibold shadow-sm"
                      title="Choose icon"
                      style={{ backgroundColor: (iconName !== 'Target' || color !== '#10B981') ? color : undefined, borderColor: (iconName !== 'Target' || color !== '#10B981') ? color : undefined }}
                    >
                      {iconName !== 'Target' || color !== '#10B981' ? (
                        <IconComponent name={iconName} size={14} style={{ color: '#ffffff' }} />
                      ) : (
                        <IconComponent name="Target" size={14} className="text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="my-2 h-px w-full bg-border/80" />
                
                {/* Type and Category */}
                <div className='grid grid-cols-2 gap-2'>
                  {/* Type */}
                  <button
                    type="button"
                    onClick={() => {
                      setType(type === 'income' ? 'expense' : 'income');
                      setColor(type === 'income' ? '#EF4444' : '#10B981');
                    }}
                    className={`flex items-center px-3 h-14 rounded-xl text-center border border-border text-[10px] shadow-sm w-full transition-colors ${
                      type === 'income' ? 'bg-green-500/10 border-green-500/20 hover:bg-green-500/15' : 'bg-red-500/10 border-red-500/20 hover:bg-red-500/15'
                    }`}
                  >
                    <div className="pl-6">
                      <IconComponent 
                        name={type === 'income' ? "TrendingUp" : "TrendingDown"} 
                        className={`mr-3 ${type === 'income' ? 'text-green-500' : 'text-red-500'}`} 
                        size={18} 
                      />
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-[8px] text-muted-foreground mb-0.5">Type</span>
                      <span className={`text-[10px] font-medium ${type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </div>
                  </button>

                  {/* Category */}
                  {streamCategories.length > 0 && (
                    <button
                      className="flex items-center px-3 h-14 rounded-xl text-center border border-border text-[10px] shadow-sm w-full"
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      style={{ backgroundColor: categoryId ? getCategoryDetails().color + '20' : undefined, borderColor: categoryId ? getCategoryDetails().color : undefined }}
                    >
                      <div className="pl-6">
                        {categoryId ? (
                          <IconComponent name={getCategoryDetails().iconName || 'Tag'} className='mr-3' size={18} style={{ color: getCategoryDetails().color }} />
                        ) : (
                          <Tag className='mr-3' size={18} />
                        )}
                      </div>
                      <div className="flex flex-col items-center flex-1">
                        <span className="text-[8px] text-muted-foreground mb-0.5">Category</span>
                        <span className="text-[10px] font-medium truncate">{getCategoryName()}</span>
                      </div>
                    </button>
                  )}
                </div>

                <div className="my-2 h-px w-full bg-border/80" />
                
                {/* Note Button */}
                <button
                  type="button"
                  onClick={() => setShowNoteModal(true)}
                  className={`w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded-xl border border-border transition-all shadow-md ${
                    note ? 'bg-green-500/10 border-green-500/20' : 'bg-card hover:bg-muted'
                  }`}
                  title="Add note"
                >
                  <IconComponent 
                    name="MessageSquare" 
                    size={14} 
                    className={note ? 'text-green-500' : 'text-muted-foreground'}
                  />
                  <span className={`text-[10px] font-semibold ${note ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {note ? 'Edit note' : 'Add note'}
                  </span>
                </button>
              </div>

              {/* Note Modal */}
              <NoteModal
                isOpen={showNoteModal}
                onClose={() => setShowNoteModal(false)}
                note={note}
                onNoteChange={setNote}
              />

              {/* Category Modal */}
              {streamCategories.length > 0 && (
                <SelectionSubModal
                  isOpen={showCategoryModal}
                  onClose={() => setShowCategoryModal(false)}
                  onSubmit={() => {}}
                  title="Choose Category"
                  items={streamCategories}
                  selectedItem={categoryId}
                  onSelectItem={handleSelectCategory}
                />
              )}

              {/* Icon Modal */}
              <IconColorSubModal
                isOpen={showIconModal}
                onClose={() => setShowIconModal(false)}
                title="Icon"
                selectedIcon={iconName}
                selectedColor={color}
                onIconChange={setIconName}
                onColorChange={setColor}
              />
            </CompactFormModal>
            
            {highZIndex && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[95vh] overflow-hidden flex flex-col shadow-2xl"
              >
                {/* Header */}
                <motion.div
                  className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/50 shrink-0"
                >
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors text-foreground"
                  >
                    ×
                  </button>

                  <h2 className="font-bold text-base text-center flex-1">Add Stream</h2>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors text-primary"
                  >
                    ✓
                  </button>
                </motion.div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  <StreamPreview />

                  <div className="my-2 h-px w-full bg-border/80" />

                  {/* Stream Name and Icon */}
                  <div className="grid grid-cols-12">
                    <Input
                      className="flex items-center gap-2 h-8 rounded-xl border border-border px-3 bg-input-background text-sm shadow-sm grid col-span-10"
                      placeholder='Stream Name'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <div className="grid col-span-2">
                      <button
                        type="button"
                        onClick={() => setShowIconModal(true)}
                        className="h-full ml-1.5 rounded-xl border border-border hover:bg-muted transition-colors flex flex-col items-center justify-center gap-1 text-sm font-semibold shadow-sm"
                        title="Choose icon"
                        style={{ backgroundColor: (iconName !== 'Target' || color !== '#10B981') ? color : undefined, borderColor: (iconName !== 'Target' || color !== '#10B981') ? color : undefined }}
                      >
                        {iconName !== 'Target' || color !== '#10B981' ? (
                          <IconComponent name={iconName} size={14} style={{ color: '#ffffff' }} />
                        ) : (
                          <IconComponent name="Target" size={14} className="text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="my-2 h-px w-full bg-border/80" />
                  
                  {/* Type and Category */}
                  <div className='grid grid-cols-2 gap-2'>
                    {/* Type */}
                    <button
                      type="button"
                      onClick={() => {
                        setType(type === 'income' ? 'expense' : 'income');
                        setColor(type === 'income' ? '#EF4444' : '#10B981');
                      }}
                      className={`flex items-center px-3 h-14 rounded-xl text-center border border-border text-[10px] shadow-sm w-full transition-colors ${
                        type === 'income' ? 'bg-green-500/10 border-green-500/20 hover:bg-green-500/15' : 'bg-red-500/10 border-red-500/20 hover:bg-red-500/15'
                      }`}
                    >
                      <div className="pl-6">
                        <IconComponent 
                          name={type === 'income' ? "TrendingUp" : "TrendingDown"} 
                          className={`mr-3 ${type === 'income' ? 'text-green-500' : 'text-red-500'}`} 
                          size={18} 
                        />
                      </div>
                      <div className="flex flex-col items-center flex-1">
                        <span className="text-[8px] text-muted-foreground mb-0.5">Type</span>
                        <span className={`text-[10px] font-medium ${type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                          {type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </div>
                    </button>

                    {/* Category */}
                    {streamCategories.length > 0 && (
                      <button
                        className="flex items-center px-3 h-14 rounded-xl text-center border border-border text-[10px] shadow-sm w-full"
                        type="button"
                        onClick={() => setShowCategoryModal(true)}
                        style={{ backgroundColor: categoryId ? getCategoryDetails().color + '20' : undefined, borderColor: categoryId ? getCategoryDetails().color : undefined }}
                      >
                        <div className="pl-6">
                          {categoryId ? (
                            <IconComponent name={getCategoryDetails().iconName || 'Tag'} className='mr-3' size={18} style={{ color: getCategoryDetails().color }} />
                          ) : (
                            <Tag className='mr-3' size={18} />
                          )}
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-[8px] text-muted-foreground mb-0.5">Category</span>
                          <span className="text-[10px] font-medium truncate">{getCategoryName()}</span>
                        </div>
                      </button>
                    )}
                  </div>

                  <div className="my-2 h-px w-full bg-border/80" />
                  
                  {/* Note Button */}
                  <button
                    type="button"
                    onClick={() => setShowNoteModal(true)}
                    className={`w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded-xl border border-border transition-all shadow-md ${
                      note ? 'bg-green-500/10 border-green-500/20' : 'bg-card hover:bg-muted'
                    }`}
                    title="Add note"
                  >
                    <IconComponent 
                      name="MessageSquare" 
                      size={14} 
                      className={note ? 'text-green-500' : 'text-muted-foreground'}
                    />
                    <span className={`text-[10px] font-semibold ${note ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {note ? 'Edit note' : 'Add note'}
                    </span>
                  </button>
                </motion.div>

                {/* Note Modal */}
                <NoteModal
                  isOpen={showNoteModal}
                  onClose={() => setShowNoteModal(false)}
                  note={note}
                  onNoteChange={setNote}
                />

                {/* Category Modal */}
                {streamCategories.length > 0 && (
                  <SelectionSubModal
                    isOpen={showCategoryModal}
                    onClose={() => setShowCategoryModal(false)}
                    onSubmit={() => {}}
                    title="Choose Category"
                    items={streamCategories}
                    selectedItem={categoryId}
                    onSelectItem={handleSelectCategory}
                  />
                )}

                {/* Icon Modal */}
                <IconColorSubModal
                  isOpen={showIconModal}
                  onClose={() => setShowIconModal(false)}
                  title="Icon"
                  selectedIcon={iconName}
                  selectedColor={color}
                  onIconChange={setIconName}
                  onColorChange={setColor}
                />
              </motion.div>
            )}
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
