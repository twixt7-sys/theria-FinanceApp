import React from 'react';
import * as Icons from 'lucide-react';

interface IconComponentProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}

export const IconComponent: React.FC<IconComponentProps> = ({ name, className, style, size = 24 }) => {
  const IconElement = (Icons as any)[name] || Icons.Circle;
  return <IconElement className={className} style={style} size={size} />;
};
