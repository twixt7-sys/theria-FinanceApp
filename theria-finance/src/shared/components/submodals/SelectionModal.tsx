import React from 'react';
import { Badge } from '../ui/badge';
import { IconComponent } from '../IconComponent';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useModalStackLayer } from '../../../core/state/ModalStackContext';
import { modalBackdropProps, modalShellProps } from '../../lib/modalLayer';
import { SelectionAddItemButton, getSelectionEntityName } from './SelectionAddItemButton';

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: Array<{
    id: string;
    name: string;
    color?: string;
    iconName?: string;
    type?: string;
    balance?: number;
  }>;
  selectedItem: string;
  onSelectItem: (id: string) => void;
  showCategories?: boolean;
  onAddItem?: () => void;
  addItemLabel?: string;
  /** Header check — defaults to onClose */
  onConfirm?: () => void;
  /** @deprecated Use onAddItem */
  onAddCategory?: () => void;
}

export const SelectionModal: React.FC<SelectionModalProps> = ({
  isOpen,
  onClose,
  title,
  items,
  selectedItem,
  onSelectItem,
  showCategories = false,
  onAddItem,
  addItemLabel,
  onConfirm,
  onAddCategory,
}) => {
  const handleAddItem = onAddItem ?? onAddCategory;
  const resolvedAddLabel =
    addItemLabel ?? (handleAddItem ? `Add ${getSelectionEntityName(title)}` : undefined);

  const groupedItems = items.reduce((acc, item) => {
    const categoryKey = item.type || 'default';
    if (!acc[categoryKey]) {
      acc[categoryKey] = [];
    }
    acc[categoryKey].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const hasItems = items.length > 0;
  const entityName = getSelectionEntityName(title, resolvedAddLabel);
  const layer = useModalStackLayer(isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            {...modalBackdropProps(layer)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            {...modalShellProps(layer)}
          >
            <div className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
              <motion.div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/50 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors text-foreground"
                >
                  <X size={16} />
                </button>

                <h2 className="font-bold text-base text-center flex-1">{title}</h2>

                <button
                  type="button"
                  onClick={onConfirm ?? onClose}
                  className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors text-primary"
                >
                  <Check size={16} />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 overflow-y-auto p-3 space-y-2"
              >
                {hasItems ? (
                  <div className="space-y-3">
                    {Object.entries(groupedItems).map(([category, categoryItems]) => (
                      <div key={category}>
                        {showCategories && categoryItems.length > 0 && (
                          <div className="flex items-center gap-2 px-1 mb-1.5">
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: categoryItems[0]?.color || '#6B7280' }}
                            />
                            <p className="text-xs font-semibold text-muted-foreground capitalize">
                              {category}
                            </p>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {categoryItems.length}
                            </Badge>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          {categoryItems.map(item => {
                            const isSelected = selectedItem === item.id;
                            const accent = item.color || '#6B7280';
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => onSelectItem(item.id)}
                                className={`flex w-full items-center gap-3 rounded-xl border px-2.5 py-2 text-left transition-all ${
                                  isSelected
                                    ? 'border-primary ring-2 ring-primary/30'
                                    : 'border-border hover:bg-muted'
                                }`}
                                style={{
                                  backgroundColor: isSelected ? `${accent}14` : `${accent}0d`,
                                }}
                              >
                                <div
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm"
                                  style={{ backgroundColor: accent }}
                                >
                                  <IconComponent
                                    name={item.iconName || 'Circle'}
                                    size={18}
                                    style={{ color: '#ffffff' }}
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-foreground">
                                    {item.name}
                                  </p>
                                  {item.balance !== undefined && (
                                    <p className="truncate text-xs text-muted-foreground">
                                      ${item.balance.toLocaleString()}
                                    </p>
                                  )}
                                </div>

                                {item.type && (
                                  <Badge
                                    className="shrink-0 text-[10px] capitalize border-0"
                                    style={{ backgroundColor: `${accent}22`, color: accent }}
                                  >
                                    {item.type}
                                  </Badge>
                                )}

                                {isSelected && (
                                  <Check size={16} className="shrink-0 text-primary" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {handleAddItem && resolvedAddLabel && (
                      <SelectionAddItemButton
                        label={resolvedAddLabel}
                        onClick={handleAddItem}
                        variant="footer"
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="text-center space-y-6 max-w-sm"
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 1, -1, 0]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="relative"
                      >
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto border border-primary/20 shadow-lg">
                          <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <IconComponent name="Folder" size={36} className="text-primary" />
                          </motion.div>
                        </div>
                        <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-primary/20 blur-xl mx-auto -z-10 scale-110" />
                      </motion.div>

                      <div className="space-y-3">
                        <motion.h3 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-xl font-bold text-foreground"
                        >
                          No {entityName} Yet
                        </motion.h3>
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-sm text-muted-foreground leading-relaxed px-4"
                        >
                          Create your first {entityName.toLowerCase()} to continue
                        </motion.p>
                      </div>

                      {handleAddItem && resolvedAddLabel && (
                        <SelectionAddItemButton
                          label={resolvedAddLabel}
                          onClick={handleAddItem}
                          variant="empty"
                        />
                      )}
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
