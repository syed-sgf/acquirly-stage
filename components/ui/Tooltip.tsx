'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
  title?: string;
  content: ReactNode;
  children?: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ 
  title, 
  content, 
  children, 
  position = 'top' 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className="inline-flex items-center justify-center w-[18px] h-[18px] bg-gray-100 border border-gray-300 rounded-full cursor-help text-[11px] font-semibold text-gray-500 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-label="More information"
      >
        {children || '?'}
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`absolute z-50 w-72 bg-gray-900 text-white p-4 rounded-lg shadow-xl text-sm leading-relaxed ${getPositionClasses()}`}
        >
          {title && (
            <div className="font-semibold text-amber-400 mb-2">{title}</div>
          )}
          <div className="text-gray-200">{content}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
        </div>
      )}
    </span>
  );
}
