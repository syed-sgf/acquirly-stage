import { HTMLAttributes, forwardRef } from 'react';
import { COMPONENTS } from '@/lib/design-system';

type BadgeVariant = keyof typeof COMPONENTS.badge.variants;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'neutral', className = '', children, ...props }, ref) => {
    const variantClasses = COMPONENTS.badge.variants[variant];
    
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${variantClasses}
          ${className}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
