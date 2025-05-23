import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "로딩 중...", 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <span className={`loading loading-spinner text-primary ${sizeClasses[size]}`}></span>
      <p className="mt-4 text-gray-600 dark:text-gray-400 text-center">{message}</p>
    </div>
  );
}; 