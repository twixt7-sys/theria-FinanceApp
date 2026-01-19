import React from 'react';
import { Badge } from '../ui/badge';
import { IconComponent } from '../IconComponent';
import { X, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  onAddCategory
}) => {
  // Group items by category if they have categoryId
  const groupedItems = items.reduce((acc, item) => {
    const categoryKey = item.type || 'default';
    if (!acc[categoryKey]) {
      acc[categoryKey] = [];
    }
    acc[categoryKey].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const hasItems = items.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[65]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-2"
          >
            <div className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
              {/* Header */}
              <motion.div
                className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/50 shrink-0"
              >
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
                  onClick={onClose}
                  className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors text-primary"
                >
                  <Check size={16} />
                </button>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 overflow-y-auto p-4 space-y-2"
              >
                {hasItems ? (
                  <div className="space-y-4">
                    {Object.entries(groupedItems).map(([category, categoryItems]) => (
                      <div key={category}>
                        {showCategories && categoryItems.length > 0 && (
                          <div className="flex items-center gap-2 px-1 mb-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: categoryItems[0]?.color || '#6B7280' }}
                            />
                            <p className="text-sm font-semibold text-foreground capitalize">
                              {category}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {categoryItems.length}
                            </Badge>
                          </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {categoryItems.map(item => (
                            <div
                              key={item.id}
                              onClick={() => onSelectItem(item.id)}
                              className={`flex flex-col bg-card border rounded-2xl p-4 cursor-pointer transition-all shadow-sm min-h-[120px]
                                ${
                                  selectedItem === item.id
                                    ? 'border-primary ring-2 ring-primary/30'
                                    : 'border-border hover:shadow-lg'
                                }`}
                              style={{
                                backgroundColor: item.color ? `${item.color}12` : undefined,
                                boxShadow: item.color ? `0 6px 20px ${item.color}20` : undefined
                              }}
                            >
                              {item.iconName && (
                                <div
                                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                                  style={{ backgroundColor: item.color ? `${item.color}22` : undefined }}
                                >
                                  <IconComponent
                                    name={item.iconName}
                                    size={22}
                                    style={{ color: item.color }}
                                  />
                                </div>
                              )}

                              <h3 className="font-semibold text-sm text-foreground truncate">
                                {item.name}
                              </h3>

                              {item.balance !== undefined && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  ${item.balance.toLocaleString()}
                                </p>
                              )}

                              {item.type && (
                                <Badge
                                  className="mt-auto text-[11px] capitalize border-0 justify-center"
                                  style={{ 
                                    backgroundColor: item.color ? `${item.color}22` : undefined, 
                                    color: item.color 
                                  }}
                                >
                                  {item.type}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="text-center space-y-6 max-w-sm"
                    >
                      {/* Animated Icon Container */}
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
                            animate={{ 
                              y: [0, -8, 0]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <IconComponent name="Folder" size={36} className="text-primary" />
                          </motion.div>
                        </div>
                        {/* Glow effect */}
                        <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-primary/20 blur-xl mx-auto -z-10 scale-110" />
                      </motion.div>

                      {/* Content */}
                      <div className="space-y-3">
                        <motion.h3 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-xl font-bold text-foreground"
                        >
                          No Categories Yet
                        </motion.h3>
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-sm text-muted-foreground leading-relaxed px-4"
                        >
                          Create your first category to organize your accounts and keep track of your finances better
                        </motion.p>
                      </div>

                      {/* Add Category Button */}
                      {onAddCategory && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <button
                            type="button"
                            onClick={onAddCategory}
                            className="group relative inline-flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                          >
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <Plus size={18} className="relative z-10" />
                            <span className="relative z-10">Add Category</span>
                          </button>
                        </motion.div>
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
