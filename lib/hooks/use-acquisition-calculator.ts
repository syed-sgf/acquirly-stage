// Acqyrly - Acquisition Calculator React Hook
// Manages state, calculations, and autosave

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  AcquisitionInputs,
  CalculatedMetrics,
  DEFAULT_INPUTS,
  calculateAcquisitionAnalysis,
} from '@/lib/calculations/acquisition-analysis';

interface UseAcquisitionCalculatorOptions {
  dealId: string;
  initialData?: Partial<AcquisitionInputs>;
  onSave?: (inputs: AcquisitionInputs, outputs: CalculatedMetrics) => Promise<void>;
  autosaveDelay?: number;
}

interface UseAcquisitionCalculatorReturn {
  inputs: AcquisitionInputs;
  outputs: CalculatedMetrics | null;
  updateInput: <K extends keyof AcquisitionInputs>(key: K, value: AcquisitionInputs[K]) => void;
  updateInputs: (updates: Partial<AcquisitionInputs>) => void;
  resetToDefaults: () => void;
  calculate: () => void;
  save: () => Promise<void>;
  isCalculating: boolean;
  isSaving: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
}

export function useAcquisitionCalculator({
  dealId,
  initialData,
  onSave,
  autosaveDelay = 2000,
}: UseAcquisitionCalculatorOptions): UseAcquisitionCalculatorReturn {
  // State
  const [inputs, setInputs] = useState<AcquisitionInputs>({
    ...DEFAULT_INPUTS,
    ...initialData,
  });
  const [outputs, setOutputs] = useState<CalculatedMetrics | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for autosave
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedInputsRef = useRef<string>('');
  
  // Calculate on mount and when inputs change
  useEffect(() => {
    const result = calculateAcquisitionAnalysis(inputs);
    setOutputs(result);
  }, [inputs]);
  
  // Autosave logic
  useEffect(() => {
    const currentInputsString = JSON.stringify(inputs);
    
    // Check if inputs have changed since last save
    if (currentInputsString !== lastSavedInputsRef.current) {
      setHasUnsavedChanges(true);
      
      // Clear existing timer
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
      
      // Set new autosave timer
      if (onSave && outputs) {
        autosaveTimerRef.current = setTimeout(async () => {
          try {
            setSaveStatus('saving');
            setIsSaving(true);
            await onSave(inputs, outputs);
            lastSavedInputsRef.current = currentInputsString;
            setLastSaved(new Date());
            setSaveStatus('saved');
            setHasUnsavedChanges(false);
            setError(null);
            
            // Reset to idle after 3 seconds
            setTimeout(() => setSaveStatus('idle'), 3000);
          } catch (err) {
            setSaveStatus('error');
            setError(err instanceof Error ? err.message : 'Failed to save');
          } finally {
            setIsSaving(false);
          }
        }, autosaveDelay);
      }
    }
    
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [inputs, outputs, onSave, autosaveDelay]);
  
  // Update single input
  const updateInput = useCallback(<K extends keyof AcquisitionInputs>(
    key: K,
    value: AcquisitionInputs[K]
  ) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);
  
  // Update multiple inputs
  const updateInputs = useCallback((updates: Partial<AcquisitionInputs>) => {
    setInputs(prev => ({ ...prev, ...updates }));
  }, []);
  
  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    setError(null);
  }, []);
  
  // Manual calculate
  const calculate = useCallback(() => {
    setIsCalculating(true);
    try {
      const result = calculateAcquisitionAnalysis(inputs);
      setOutputs(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation error');
    } finally {
      setIsCalculating(false);
    }
  }, [inputs]);
  
  // Manual save
  const save = useCallback(async () => {
    if (!onSave || !outputs) return;
    
    try {
      setSaveStatus('saving');
      setIsSaving(true);
      await onSave(inputs, outputs);
      lastSavedInputsRef.current = JSON.stringify(inputs);
      setLastSaved(new Date());
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      setError(null);
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [inputs, outputs, onSave]);
  
  return {
    inputs,
    outputs,
    updateInput,
    updateInputs,
    resetToDefaults,
    calculate,
    save,
    isCalculating,
    isSaving,
    saveStatus,
    lastSaved,
    hasUnsavedChanges,
    error,
  };
}

// ============================================
// DEBOUNCE HOOK
// ============================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================
// LOCAL STORAGE HOOK (for public calculators)
// ============================================

export function useLocalStorageInputs(key: string, initialValue: AcquisitionInputs) {
  const [storedValue, setStoredValue] = useState<AcquisitionInputs>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value: AcquisitionInputs | ((val: AcquisitionInputs) => AcquisitionInputs)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}
