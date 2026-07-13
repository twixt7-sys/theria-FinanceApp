import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface SelectionAddItemButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'footer' | 'empty';
}

export const SelectionAddItemButton: React.FC<SelectionAddItemButtonProps> = ({
  label,
  onClick,
  variant = 'footer',
}) => {
  if (variant === 'footer') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-1 border border-dashed border-primary/40 rounded-xl text-sm text-primary font-semibold hover:bg-primary/10 transition-all active:scale-[0.98]"
      >
        <Plus size={16} />
        {label}
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <button
        type="button"
        onClick={onClick}
        className="group relative inline-flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Plus size={18} className="relative z-10" />
        <span className="relative z-10">{label}</span>
      </button>
    </motion.div>
  );
};

export function getSelectionEntityName(title: string, addItemLabel?: string): string {
  if (addItemLabel) {
    return addItemLabel.replace(/^Add\s+/i, '');
  }
  const match = title.match(/^Choose\s+(.+)$/i);
  return match?.[1] ?? 'item';
}
