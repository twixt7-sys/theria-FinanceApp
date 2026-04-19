import React, { useState } from 'react';
import { CompactFormModal } from '../../../shared/components/CompactFormModal';
import { Input } from '../../../shared/components/ui/input';
import { useData } from '../../../core/state/DataContext';
import { useAlert } from '../../../core/state/AlertContext';
import { MessageSquare } from 'lucide-react';
import { IconColorModal, NoteModal } from '../../../shared/components/submodals';
import { motion, AnimatePresence } from 'motion/react';
import { IconComponent } from '../../../shared/components/IconComponent';

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
