import React from 'react';
import { Check } from 'lucide-react';
import { IconComponent } from '../IconComponent';
import { CompactFormModal } from '../CompactFormModal';

interface IconColorSubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  selectedIcon: string;
  selectedColor: string;
  onIconChange: (icon: string) => void;
  onColorChange: (color: string) => void;
}

const ICON_OPTIONS = ['FolderOpen', 'Briefcase', 'Code', 'ShoppingCart', 'Car', 'Film', 'Home', 'Coffee', 'Heart', 'Zap', 'Gift', 'Book', 'Music', 'Smartphone', 'Utensils', 'Plane'];
const COLOR_OPTIONS = ['#10B981', '#059669', '#34D399', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#6366F1'];

export const IconColorSubModal: React.FC<IconColorSubModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  selectedIcon,
  selectedColor,
  onIconChange,
  onColorChange
}) => {
  return (
    <CompactFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
    >
      {/* Color Selection */}
      <div className="space-y-2 mb-6">
        <div className="grid grid-cols-4 gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onColorChange(c)}
              className={`h-10 rounded-lg border-2 transition-all shadow-sm ${
                selectedColor === c
                  ? 'border-foreground scale-105 shadow-md'
                  : 'border-border hover:scale-105'
              }`}
              style={{ backgroundColor: c }}
            >
              {selectedColor === c && <Check className="mx-auto text-white" size={16} strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>

      {/* Icon Selection */}
      <div className="space-y-2">
        <div className="grid grid-cols-5 gap-2">
          {ICON_OPTIONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => onIconChange(icon)}
              className={`p-3 rounded-xl border-2 transition-all shadow-sm ${
                selectedIcon === icon
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-border hover:border-primary/50 hover:bg-muted'
              }`}
            >
              <IconComponent className='mx-3' name={icon} size={20} />
            </button>
          ))}
        </div>
      </div>
    </CompactFormModal>
  );
};
