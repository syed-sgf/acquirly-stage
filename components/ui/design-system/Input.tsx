import { InputHTMLAttributes, forwardRef } from 'react';
import { COMPONENTS } from '@/lib/design-system';

type InputVariant = keyof typeof COMPONENTS.input.variants;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'default', label, error, helperText, className = '', ...props }, ref) => {
    const baseClasses = COMPONENTS.input.base;
    const variantClasses = COMPONENTS.input.variants[variant];
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`${baseClasses} ${variantClasses} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
