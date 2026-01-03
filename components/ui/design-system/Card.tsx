import { HTMLAttributes, forwardRef } from 'react';
import { COMPONENTS } from '@/lib/design-system';

type CardVariant = keyof typeof COMPONENTS.card.variants;

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className = '', children, ...props }, ref) => {
    const variantClasses = COMPONENTS.card.variants[variant];
    const baseClasses = COMPONENTS.card.base;
    
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }[padding];
    
    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${paddingClasses} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
