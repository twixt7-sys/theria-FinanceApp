import React from 'react';
import * as Icons from 'lucide-react';

interface IconComponentProps {
  name: string;
  className?: string;
  size?: number;
}

export const IconComponent: React.FC<IconComponentProps> = ({ name, className, size = 24 }) => {
  const IconElement = (Icons as any)[name] || Icons.Circle;
  return <IconElement className={className} size={size} />;
};
