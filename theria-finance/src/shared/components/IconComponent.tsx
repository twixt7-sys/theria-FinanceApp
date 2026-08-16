import React from 'react';
// Primitive that the `@/shared/icons` barrel builds on — imports lucide-react
// directly to avoid a circular import with the barrel.
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface IconComponentProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}

const iconsByName = Icons as unknown as Record<string, LucideIcon | undefined>;

export const IconComponent: React.FC<IconComponentProps> = ({ name, className, style, size = 24 }) => {
  const IconElement = iconsByName[name] ?? Icons.Circle;
  return <IconElement className={className} style={style} size={size} />;
};
