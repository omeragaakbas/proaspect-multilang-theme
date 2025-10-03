import React from 'react';
import proaspectDark from '@/assets/ProAspectDark.jpeg';

interface ProAspectDarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-16'
};

export const ProAspectDark: React.FC<ProAspectDarkProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  return (
    <img 
      src={proaspectDark} 
      alt="ProAspect - Time & Invoicing" 
      className={`${sizeClasses[size]} object-contain ${className}`}
    />
  );
};