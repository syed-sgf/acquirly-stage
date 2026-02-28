'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  className?: string;
  decimals?: number;
  id?: string;
}

function formatDisplay(n: number, decimals: number): string {
  if (n === 0) return '';
  if (decimals === 0) {
    return Math.round(n).toLocaleString('en-US');
  }
  // Format with up to `decimals` places, dropping trailing zeros
  const fixed = n.toFixed(decimals);
  const trimmed = String(parseFloat(fixed)); // drops trailing zeros e.g. "7.50" -> "7.5"
  const [intPart, decPart] = trimmed.split('.');
  const formattedInt = parseInt(intPart, 10).toLocaleString('en-US');
  return decPart ? `${formattedInt}.${decPart}` : formattedInt;
}

function formatRaw(n: number): string {
  if (n === 0) return '';
  if (Number.isInteger(n)) return String(n);
  return String(n); // "7.5", "3.25" etc — no commas for editing
}

export default function CurrencyInput({
  value,
  onChange,
  prefix,
  suffix,
  placeholder = '0',
  className = '',
  decimals = 0,
  id,
}: CurrencyInputProps) {
  const [display, setDisplay] = useState<string>(() => formatDisplay(value, decimals));
  const [focused, setFocused] = useState(false);

  // Sync display when value changes from outside (e.g. prop reset)
  useEffect(() => {
    if (!focused) {
      setDisplay(formatDisplay(value, decimals));
    }
  }, [value, decimals, focused]);

  const handleFocus = useCallback(() => {
    setFocused(true);
    setDisplay(formatRaw(value));
  }, [value]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    const parsed = parseFloat(display.replace(/,/g, ''));
    const num = isNaN(parsed) ? 0 : parsed;
    setDisplay(formatDisplay(num, decimals));
    onChange(num);
  }, [display, decimals, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // Allow empty string
      if (raw === '') {
        setDisplay('');
        onChange(0);
        return;
      }

      // Allow only digits, one decimal point, optional leading minus
      // Reject commas and any other character
      if (!/^-?[0-9]*\.?[0-9]*$/.test(raw)) return;

      // Enforce decimal places limit
      const dotIdx = raw.indexOf('.');
      if (dotIdx !== -1 && decimals === 0) return; // no decimals allowed
      if (dotIdx !== -1 && raw.length - dotIdx - 1 > decimals) return; // too many decimal places

      setDisplay(raw);

      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        onChange(parsed);
      }
      // If partial (e.g. "5." or "-"), keep last valid value via no-op
    },
    [onChange, decimals]
  );

  const inputCls = [
    'w-full',
    prefix ? 'pl-8' : 'pl-4',
    suffix ? 'pr-12' : 'pr-4',
    'py-2.5 border-2 border-gray-200 rounded-lg font-mono',
    'focus:border-sgf-green-500 focus:outline-none transition-colors',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={inputCls}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}
