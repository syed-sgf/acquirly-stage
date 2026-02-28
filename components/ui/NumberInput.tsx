'use client';

import { useState, useEffect, useCallback } from 'react';

interface NumberInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  className?: string;
  decimals?: number;
  id?: string;
}

function formatWithCommas(num: number, decimals: number): string {
  if (decimals > 0) {
    // For decimal fields, preserve the actual decimal places up to max
    const parts = num.toString().split('.');
    const intPart = parseInt(parts[0], 10).toLocaleString('en-US');
    if (parts[1]) {
      return `${intPart}.${parts[1].slice(0, decimals)}`;
    }
    return intPart;
  }
  return Math.round(num).toLocaleString('en-US');
}

export default function NumberInput({
  value,
  onChange,
  prefix,
  suffix,
  placeholder = '0',
  className = '',
  decimals = 0,
  id,
}: NumberInputProps) {
  const [focused, setFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState('');

  // Sync display value from prop when not focused
  useEffect(() => {
    if (!focused) {
      if (value === null || value === undefined) {
        setDisplayValue('');
      } else {
        setDisplayValue(formatWithCommas(value, decimals));
      }
    }
  }, [value, focused, decimals]);

  const handleFocus = useCallback(() => {
    setFocused(true);
    if (value !== null && value !== undefined) {
      // Show raw number for editing
      if (decimals > 0) {
        const parts = value.toString().split('.');
        if (parts[1]) {
          setDisplayValue(`${parts[0]}.${parts[1].slice(0, decimals)}`);
        } else {
          setDisplayValue(parts[0]);
        }
      } else {
        setDisplayValue(String(Math.round(value)));
      }
    } else {
      setDisplayValue('');
    }
  }, [value, decimals]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    // Re-format will happen via useEffect
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // Allow empty
      if (raw === '') {
        setDisplayValue('');
        onChange(null);
        return;
      }

      // Allow only digits, one decimal point, and optional leading minus
      const cleaned = raw.replace(/[^0-9.-]/g, '');

      // Validate structure
      const parts = cleaned.split('.');
      if (parts.length > 2) return; // multiple decimals
      if (decimals === 0 && parts.length > 1) return; // no decimals allowed
      if (parts[1] && parts[1].length > decimals) return; // too many decimal places

      // Check for multiple minus signs or minus not at start
      if ((cleaned.match(/-/g) || []).length > 1) return;
      if (cleaned.indexOf('-') > 0) return;

      setDisplayValue(cleaned);

      // Parse and fire onChange
      const num = parseFloat(cleaned);
      if (!isNaN(num)) {
        onChange(num);
      } else if (cleaned === '' || cleaned === '-' || cleaned === '.') {
        // Partial input, don't fire onChange yet (keep previous value)
      }
    },
    [onChange, decimals]
  );

  const inputClassName = `w-full ${prefix ? 'pl-8' : 'pl-4'} ${suffix ? 'pr-12' : 'pr-4'} py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-green-500 focus:outline-none transition-colors ${className}`;

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={inputClassName}
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
          {suffix}
        </span>
      )}
    </div>
  );
}
