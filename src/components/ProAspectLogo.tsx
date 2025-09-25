import React from 'react';
import proaspectLogo from '@/assets/proaspect-logo.jpg';

interface ProAspectLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-16'
};

export const ProAspectLogo: React.FC<ProAspectLogoProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  return (
    <img 
      src={proaspectLogo} 
      alt="ProAspect - Time & Invoicing" 
      className={`${sizeClasses[size]} object-contain ${className}`}
    />
  );
};