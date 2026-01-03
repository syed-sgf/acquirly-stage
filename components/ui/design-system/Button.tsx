import { ButtonHTMLAttributes, forwardRef } from 'react';
import { COMPONENTS } from '@/lib/design-system';

type ButtonSize = keyof typeof COMPONENTS.button.sizes;
type ButtonVariant = keyof typeof COMPONENTS.button.variants;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ size = 'md', variant = 'primary', fullWidth = false, className = '', children, ...props }, ref) => {
    const sizeClasses = COMPONENTS.button.sizes[size];
    const variantClasses = COMPONENTS.button.variants[variant];
    const widthClass = fullWidth ? 'w-full' : '';
    
    return (
      <button
        ref={ref}
        className={`
          ${sizeClasses}
          ${variantClasses}
          ${widthClass}
          rounded-lg font-semibold shadow-lg hover:shadow-xl 
          transition-all transform hover:-translate-y-0.5
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
