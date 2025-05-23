import React from 'react';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  message, 
  onDismiss,
  type = 'error',
  className = '' 
}) => {
  const typeClasses = {
    error: 'alert-error',
    warning: 'alert-warning', 
    info: 'alert-info'
  };

  const typeIcons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className={`alert ${typeClasses[type]} shadow-lg ${className}`}>
      <div className="flex items-start justify-between w-full">
        <div className="flex items-start space-x-2">
          <span className="text-lg">{typeIcons[type]}</span>
          <div>
            <p className="font-medium">
              {type === 'error' && '오류가 발생했습니다'}
              {type === 'warning' && '주의가 필요합니다'}
              {type === 'info' && '알림'}
            </p>
            <p className="text-sm opacity-90">{message}</p>
          </div>
        </div>
        {onDismiss && (
          <button 
            className="btn btn-ghost btn-sm ml-4" 
            onClick={onDismiss}
            aria-label="닫기"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}; 