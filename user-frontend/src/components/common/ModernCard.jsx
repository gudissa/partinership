import React from 'react';

const ModernCard = ({ 
  children, 
  className = '', 
  hover = true,
  padding = 'p-6',
  ...props 
}) => {
  return (
    <div 
      className={`card-modern ${padding} ${hover ? 'hover:scale-[1.02]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default ModernCard;

