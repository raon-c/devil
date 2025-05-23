import React from 'react';
import { Card as CardType } from '@/types/game';

interface CardProps {
  card?: CardType;
  isRevealed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  isRevealed = true, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-12 h-16 text-xs',
    md: 'w-16 h-20 text-sm', 
    lg: 'w-20 h-28 text-base'
  };

  if (!isRevealed || !card) {
    // 뒷면 카드
    return (
      <div className={`
        ${sizeClasses[size]} 
        bg-gradient-to-br from-blue-600 to-blue-800 
        dark:from-blue-700 dark:to-blue-900
        rounded-lg border-2 border-gray-300 dark:border-gray-600
        flex items-center justify-center 
        shadow-md hover:shadow-lg transition-shadow
        ${className}
      `}>
        <div className="text-white font-bold text-lg">?</div>
      </div>
    );
  }

  // 숫자만 표시 (문양 없음)
  return (
    <div className={`
      ${sizeClasses[size]} 
      bg-white dark:bg-gray-800
      rounded-lg border-2 border-gray-300 dark:border-gray-600
      flex items-center justify-center 
      p-2 shadow-md hover:shadow-lg transition-shadow
      ${className}
    `}>
      {/* 숫자만 크게 표시 */}
      <div className="font-bold text-2xl text-gray-900 dark:text-gray-100">
        {card.number}
      </div>
    </div>
  );
}; 