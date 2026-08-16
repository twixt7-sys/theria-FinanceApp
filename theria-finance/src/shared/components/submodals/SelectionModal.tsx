import React from 'react';
import { IconComponent } from '../IconComponent';
import { X, Check, ChevronUp, Plus, FolderPlus } from '@/shared/icons';
import { motion, AnimatePresence } from 'motion/react';
import { useModalStackLayer } from '../../../core/state/ModalStackContext';
import { modalBackdropProps, modalShellProps } from '../../lib/modalLayer';
import { SelectionAddItemButton, getSelectionEntityName } from './SelectionAddItemButton';

export interface SelectionModalItem {
  id: string;
  name: string;
  color?: string;
  iconName?: string;
  type?: string;
  balance?: number;
  /** Display name of the collapsible group this item belongs to. */
  category?: string;
  /** Id of the category this item belongs to — lets the inline "+" preselect it. */
  categoryId?: string;
  /** Optional pre-formatted subtitle (e.g. a currency-aware balance). */
  subtitle?: string;
}

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: SelectionModalItem[];
  selectedItem: string;
  onSelectItem: (id: string) => void;
  showCategories?: boolean;
  /**
   * Adds an item. Rendered as the subtle inline "+" tile at the end of every
   * category (mirrors the streams module), and as the fallback button when the
   * list is empty. Receives the category id of the group it was tapped in.
   */
  onAddItem?: (categoryId?: string) => void;
  addItemLabel?: string;
  /** Bottom "Add category" button — mirrors the streams module footer. */
  onAddCategory?: () => void;
  addCategoryLabel?: string;
  /** Header check — defaults to onClose */
  onConfirm?: () => void;
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
  onAddCategory,
  addCategoryLabel = 'Add category',
  onConfirm,
}) => {
  const handleAddItem = onAddItem;
  const resolvedAddLabel =
    addItemLabel ?? (handleAddItem ? `Add ${getSelectionEntityName(title)}` : undefined);

  const groupedItems = items.reduce((acc, item) => {
    const categoryKey = item.category || item.type || 'default';
    if (!acc[categoryKey]) {
      acc[categoryKey] = [];
    }
    acc[categoryKey].push(item);
    return acc;
  }, {} as Record<string, SelectionModalItem[]>);

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
                  <div className="space-y-4">
                    {Object.entries(groupedItems).map(([category, categoryItems]) => {
                      const showHeader = showCategories && category !== 'default';
                      const isCollapsed = showHeader && Boolean(collapsed[category]);
                      const accent = categoryItems[0]?.color || '#6B7280';
                      const groupCategoryId = categoryItems[0]?.categoryId;

                      return (
                        <div key={category}>
                          {showHeader && (
                            <button
                              type="button"
                              onClick={() => toggleCategory(category)}
                              className="mb-1.5 flex w-full items-center justify-between gap-2 px-1"
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: accent }}
                                />
                                <span className="text-xs font-semibold capitalize text-foreground">
                                  {category}
                                </span>
                                <span className="rounded-full border border-border px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                                  {categoryItems.length} item{categoryItems.length > 1 ? 's' : ''}
                                </span>
                              </span>
                              <motion.div
                                animate={{ rotate: isCollapsed ? 180 : 0 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                              >
                                <ChevronUp size={14} className="text-muted-foreground" />
                              </motion.div>
                            </button>
                          )}

                          <AnimatePresence initial={false}>
                            {!isCollapsed && (
                              <motion.div
                                key={`selection-group-${category}`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                className="overflow-hidden"
                              >
                                <div className="grid grid-cols-5 gap-x-1 gap-y-3 px-1 pt-1">
                                  {categoryItems.map(item => {
                                    const isSelected = selectedItem === item.id;
                                    const subtitle =
                                      item.subtitle ??
                                      (item.balance !== undefined
                                        ? item.balance.toLocaleString()
                                        : item.type);

                                    return (
                                      <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => onSelectItem(item.id)}
                                        className="group flex min-w-0 flex-col items-center gap-1.5"
                                        title={item.name}
                                      >
                                        <span
                                          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-sm transition-transform group-hover:scale-105 group-active:scale-95 ${
                                            isSelected
                                              ? 'ring-2 ring-primary ring-offset-2 ring-offset-card'
                                              : 'ring-1 ring-black/5'
                                          }`}
                                          style={{ backgroundColor: item.color || 'var(--primary)' }}
                                        >
                                          <IconComponent
                                            name={item.iconName || 'Folder'}
                                            size={22}
                                            style={{ color: '#ffffff' }}
                                          />
                                        </span>
                                        <span className="w-full text-center leading-tight">
                                          <span
                                            className={`block truncate text-[11px] font-semibold ${
                                              isSelected ? 'text-primary' : 'text-foreground'
                                            }`}
                                          >
                                            {item.name}
                                          </span>
                                          {subtitle && (
                                            <span className="block truncate text-[9px] font-medium capitalize tabular-nums text-muted-foreground">
                                              {subtitle}
                                            </span>
                                          )}
                                        </span>
                                      </button>
                                    );
                                  })}

                                  {/* Subtle inline add for this category */}
                                  {handleAddItem && (
                                    <button
                                      type="button"
                                      onClick={() => handleAddItem(groupCategoryId)}
                                      className="group flex min-w-0 flex-col items-center gap-1.5"
                                      title={resolvedAddLabel}
                                    >
                                      <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
                                        <Plus size={22} />
                                      </span>
                                      <span className="block w-full truncate text-center text-[11px] font-medium text-muted-foreground">
                                        Add
                                      </span>
                                    </button>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}

                    {/* Add a new category */}
                    {onAddCategory && (
                      <button
                        type="button"
                        onClick={onAddCategory}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <FolderPlus size={16} strokeWidth={2.25} />
                        {addCategoryLabel}
                      </button>
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
                          onClick={() => handleAddItem(undefined)}
                          variant="empty"
                        />
                      )}

                      {onAddCategory && (
                        <button
                          type="button"
                          onClick={onAddCategory}
                          className="mx-auto flex w-full max-w-[16rem] items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                          <FolderPlus size={16} strokeWidth={2.25} />
                          {addCategoryLabel}
                        </button>
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
