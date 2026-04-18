import React from 'react';
import { Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';

interface NavFilterBarProps {
  leftButtons?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    active?: boolean;
    onClick: () => void;
    variant?: 'primary' | 'destructive' | 'default';
  }>;
  rightContent?: React.ReactNode;
  filterOptions?: Array<{
    value: string;
    label: string;
  }>;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterLabel?: string;
}

export const NavFilterBar: React.FC<NavFilterBarProps> = ({
  leftButtons = [],
  rightContent,
  filterOptions = [],
  filterValue,
  onFilterChange,
  filterLabel = 'Filter',
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 justify-between rounded-xl bg-card border border-border px-3 py-2 shadow-sm">
      {leftButtons.length > 0 && (
        <div className="flex items-center gap-2">
          {leftButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={btn.onClick}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                btn.active
                  ? btn.variant === 'destructive'
                    ? 'bg-destructive text-white'
                    : btn.variant === 'primary'
                    ? 'bg-primary text-white'
                    : 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              title={btn.label}
            >
              {btn.icon}
              <span className="hidden sm:inline">{btn.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        {filterOptions.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/50">
            <Filter size={16} className="text-muted-foreground" />
            <Select value={filterValue} onValueChange={onFilterChange}>
              <SelectTrigger className="h-9 min-w-[140px] bg-card text-sm shadow-sm">
                <SelectValue placeholder={filterLabel} />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {rightContent}
      </div>
    </div>
  );
};
