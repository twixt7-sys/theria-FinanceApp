import React from 'react';
import { cn } from './ui/utils';

interface EmptyStateProps {
  title: string;
  hint?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, hint, className }) => (
  <div className={cn('text-center py-12 text-muted-foreground', className)}>
    <p className="text-lg">{title}</p>
    {hint && <p className="text-sm mt-1">{hint}</p>}
  </div>
);
