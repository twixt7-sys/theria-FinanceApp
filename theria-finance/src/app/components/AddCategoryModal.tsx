import React, { useState } from 'react';
import { CompactFormModal } from './CompactFormModal';
import { Input } from './ui/input';
import { useData } from '../contexts/DataContext';
import { useAlert } from '../contexts/AlertContext';
import { MessageSquare } from 'lucide-react';
import { IconColorModal, NoteModal } from './submodals';
import { motion, AnimatePresence } from 'motion/react';
import { IconComponent } from './IconComponent';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  highZIndex?: boolean;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose, highZIndex = false }) => {
  const [color, setColor] = useState('#10B981');
  const [iconName, setIconName] = useState('FolderOpen');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const { addCategory } = useData();
  const { showAddAlert } = useAlert();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) return;

    addCategory({
      name,
      color,
      iconName,
      scope: 'account',
      note
    });

    // Show alert
    showAddAlert(`Category "${name}"`, note ? `With note: ${note}` : undefined);

    // Reset
    setName('');
    setNote('');
    setColor('#10B981');
    setIconName('FolderOpen');
    onClose();
  };

  const CategoryPreview = () => (
    <div className="flex items-center justify-center p-3 rounded-lg border transition-all duration-300">
      <div 
        className="relative group cursor-pointer min-h-[80px] max-w-[280px] w-full"
      >
        {/* Main Category Container */}
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
            {/* Category Name */}
            <div>
              <h3 
                className="font-bold text-lg transition-colors duration-300"
                style={{ color }}
              >
                {name || 'Category Name'}
              </h3>
            </div>
            
            {/* Note Display */}
            {note && (
              <p className="text-sm text-muted-foreground line-clamp-2 max-w-[160px]">
                {note}
              </p>
            )}
            
            {/* Category Badge */}
            <div className="flex items-center gap-2">
              <div 
                className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-md"
                style={{ backgroundColor: color }}
              >
                Account Category
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
              title="Add Category"
            >
              <div className="space-y-4">
                {/* Category Preview */}
                <CategoryPreview />

                <div className="my-2 h-px w-full bg-border/80" />

                {/* Category Name and Icon */}
                <div className="grid grid-cols-12">
                  <Input
                    className="flex items-center gap-2 h-8 rounded-xl border border-border px-3 bg-input-background text-sm shadow-sm grid col-span-10"
                    placeholder='Category Name'
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
                      style={{ backgroundColor: (iconName !== 'FolderOpen' || color !== '#10B981') ? color : undefined, borderColor: (iconName !== 'FolderOpen' || color !== '#10B981') ? color : undefined }}
                    >
                      {iconName !== 'FolderOpen' || color !== '#10B981' ? (
                        <IconComponent name={iconName} size={14} style={{ color: '#ffffff' }} />
                      ) : (
                        <IconComponent name="FolderOpen" size={14} className="text-muted-foreground" />
                      )}
                    </button>
                  </div>
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
                  <MessageSquare 
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

              {/* Icon Modal */}
              <IconColorModal
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

                  <h2 className="font-bold text-base text-center flex-1">Add Category</h2>

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
                  <CategoryPreview />

                  <div className="my-2 h-px w-full bg-border/80" />

                  {/* Category Name and Icon */}
                  <div className="grid grid-cols-12">
                    <Input
                      className="flex items-center gap-2 h-8 rounded-xl border border-border px-3 bg-input-background text-sm shadow-sm grid col-span-10"
                      placeholder='Category Name'
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
                        style={{ backgroundColor: (iconName !== 'FolderOpen' || color !== '#10B981') ? color : undefined, borderColor: (iconName !== 'FolderOpen' || color !== '#10B981') ? color : undefined }}
                      >
                        {iconName !== 'FolderOpen' || color !== '#10B981' ? (
                          <IconComponent name={iconName} size={14} style={{ color: '#ffffff' }} />
                        ) : (
                          <IconComponent name="FolderOpen" size={14} className="text-muted-foreground" />
                        )}
                      </button>
                    </div>
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
                    <MessageSquare 
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

                {/* Icon Modal */}
                <IconColorModal
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
