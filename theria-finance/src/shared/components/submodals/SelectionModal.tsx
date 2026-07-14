import React from 'react';
import { IconComponent } from '../IconComponent';
import { X, Check, ChevronDown } from 'lucide-react';
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
    /** Display name of the collapsible group this item belongs to. */
    category?: string;
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
    const categoryKey = item.category || item.type || 'default';
    if (!acc[categoryKey]) {
      acc[categoryKey] = [];
    }
    acc[categoryKey].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const hasItems = items.length > 0;
  const entityName = getSelectionEntityName(title, resolvedAddLabel);
  const layer = useModalStackLayer(isOpen);

  // Per-category collapse state (categories start expanded).
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});
  const toggleCategory = (key: string) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

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
                className="flex-1 overflow-y-auto p-4 space-y-2"
              >
                {hasItems ? (
                  <div className="space-y-2.5">
                    {Object.entries(groupedItems).map(([category, categoryItems]) => {
                      const showHeader = showCategories && category !== 'default';
                      const isCollapsed = showHeader && Boolean(collapsed[category]);
                      const accent = categoryItems[0]?.color || '#6B7280';

                      return (
                        <div key={category} className="space-y-2">
                          {showHeader && (
                            <button
                              type="button"
                              onClick={() => toggleCategory(category)}
                              className="flex w-full items-center gap-2 rounded-lg px-1 py-1 transition-colors hover:bg-muted/60"
                            >
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: accent }}
                              />
                              <span className="text-sm font-semibold capitalize text-foreground">
                                {category}
                              </span>
                              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                {categoryItems.length}
                              </span>
                              <ChevronDown
                                size={16}
                                className={`ml-auto text-muted-foreground transition-transform ${
                                  isCollapsed ? '-rotate-90' : ''
                                }`}
                              />
                            </button>
                          )}

                          {!isCollapsed && (
                            <div className="grid grid-cols-2 gap-2">
                              {categoryItems.map(item => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => onSelectItem(item.id)}
                                  className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all active:scale-[0.98] ${
                                    selectedItem === item.id ? 'ring-2 ring-primary/60' : ''
                                  }`}
                                  style={{
                                    backgroundColor: item.color ? `${item.color}26` : 'var(--muted)',
                                  }}
                                >
                                  {item.iconName && (
                                    <span
                                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm"
                                      style={{ backgroundColor: item.color || 'var(--primary)' }}
                                    >
                                      <IconComponent
                                        name={item.iconName}
                                        size={16}
                                        style={{ color: '#ffffff' }}
                                      />
                                    </span>
                                  )}
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate text-xs font-semibold text-foreground">
                                      {item.name}
                                    </span>
                                    {item.balance !== undefined && (
                                      <span className="block truncate text-[10px] font-medium text-muted-foreground">
                                        ${item.balance.toLocaleString()}
                                      </span>
                                    )}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

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
