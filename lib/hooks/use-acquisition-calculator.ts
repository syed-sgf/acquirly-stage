/**
 * useAcquisitionCalculator Hook
 * 
 * React hook that manages acquisition analysis state and calculations
 * Provides autosave functionality and real-time calculation updates
 */

import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './use-debounce';
import type { 
  AcquisitionInputs, 
  AcquisitionAnalysis 
} from '@/lib/calculations/acquisition-analysis';
import { analyzeAcquisition, validateInputs } from '@/lib/calculations/acquisition-analysis';

interface UseAcquisitionCalculatorOptions {
  dealId?: string;
  initialInputs?: Partial<AcquisitionInputs>;
  autoSave?: boolean;
  onSave?: (analysis: AcquisitionAnalysis) => Promise<void>;
}

interface SaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  message?: string;
  lastSaved?: Date;
}

export function useAcquisitionCalculator(options: UseAcquisitionCalculatorOptions = {}) {
  const { dealId, initialInputs, autoSave = true, onSave } = options;

  // Default inputs
  const defaultInputs: AcquisitionInputs = {
    dealName: '',
    businessType: 'other',
    purchasePrice: 500000,
    downPayment: 125000,
    sellerFinancing: 0,
    sellerFinancingRate: 6.0,
    sellerFinancingTerm: 5,
    bankLoan: 375000,
    bankInterestRate: 7.5,
    bankLoanTerm: 10,
    annualRevenue: 1000000,
    annualSDE: 200000,
    annualEBITDA: 180000,
    workingCapital: 25000,
    closingCosts: 15000,
    ffeValue: 100000,
    inventoryValue: 50000,
    annualCapex: 10000,
    buyerSalary: 0,
    revenueGrowth: 5,
    expenseGrowth: 3,
    exitTimeline: 10,
    ...initialInputs
  };

  // State
  const [inputs, setInputs] = useState<AcquisitionInputs>(defaultInputs);
  const [analysis, setAnalysis] = useState<AcquisitionAnalysis | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ status: 'idle' });
  const [isCalculating, setIsCalculating] = useState(false);

  // Debounced inputs for autosave (wait 1 second after user stops typing)
  const debouncedInputs = useDebounce(inputs, 1000);

  /**
   * Calculate analysis from current inputs
   */
  const calculate = useCallback(() => {
    setIsCalculating(true);
    
    try {
      // Validate inputs
      const validationErrors = validateInputs(inputs);
      setErrors(validationErrors);
      
      if (validationErrors.length === 0) {
        // Calculate bank loan (derived field)
        const calculatedInputs = {
          ...inputs,
          bankLoan: inputs.purchasePrice - inputs.downPayment - inputs.sellerFinancing
        };
        
        // Run analysis
        const result = analyzeAcquisition(calculatedInputs);
        setAnalysis(result);
      } else {
        setAnalysis(null);
      }
    } catch (error) {
      console.error('Calculation error:', error);
      setErrors(['An error occurred during calculation']);
      setAnalysis(null);
    } finally {
      setIsCalculating(false);
    }
  }, [inputs]);

  /**
   * Update a single input field
   */
  const updateInput = useCallback(<K extends keyof AcquisitionInputs>(
    field: K,
    value: AcquisitionInputs[K]
  ) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  /**
   * Update multiple input fields at once
   */
  const updateInputs = useCallback((updates: Partial<AcquisitionInputs>) => {
    setInputs(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  /**
   * Reset to default inputs
   */
  const reset = useCallback(() => {
    setInputs(defaultInputs);
    setAnalysis(null);
    setErrors([]);
    setSaveStatus({ status: 'idle' });
  }, [defaultInputs]);

  /**
   * Load inputs from a saved analysis
   */
  const loadAnalysis = useCallback((savedAnalysis: AcquisitionAnalysis) => {
    setInputs(savedAnalysis.inputs);
    setAnalysis(savedAnalysis);
    setErrors([]);
  }, []);

  /**
   * Save current analysis
   */
  const save = useCallback(async () => {
    if (!analysis || !onSave) return;

    setSaveStatus({ status: 'saving', message: 'Saving...' });

    try {
      await onSave(analysis);
      setSaveStatus({
        status: 'saved',
        message: 'Saved successfully',
        lastSaved: new Date()
      });

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setSaveStatus(prev => ({
          ...prev,
          status: 'idle'
        }));
      }, 3000);
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to save'
      });
    }
  }, [analysis, onSave]);

  /**
   * Auto-save when debounced inputs change
   */
  useEffect(() => {
    if (autoSave && analysis && dealId && onSave) {
      save();
    }
  }, [debouncedInputs, autoSave, analysis, dealId, onSave, save]);

  /**
   * Recalculate whenever inputs change
   */
  useEffect(() => {
    calculate();
  }, [calculate]);

  return {
    // State
    inputs,
    analysis,
    errors,
    isCalculating,
    saveStatus,
    
    // Actions
    updateInput,
    updateInputs,
    calculate,
    reset,
    loadAnalysis,
    save,
    
    // Computed
    hasErrors: errors.length > 0,
    isValid: errors.length === 0 && analysis !== null,
    canSave: analysis !== null && errors.length === 0
  };
}
