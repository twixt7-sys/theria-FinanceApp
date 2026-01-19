import React from 'react';
import { Badge } from '../ui/badge';
import { IconComponent } from '../IconComponent';
import { SubModal } from '../SubModal';

interface SelectionSubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
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
}

export const SelectionSubModal: React.FC<SelectionSubModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  items,
  selectedItem,
  onSelectItem,
  showCategories = false
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

  return (
    <SubModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
    >
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
    </SubModal>
  );
};
