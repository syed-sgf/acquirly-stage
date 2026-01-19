'use client';

/**
 * Business Acquisition Analyzer - Deal-Specific Route
 * 
 * This page allows users to analyze a business acquisition with:
 * - Complete financial input form
 * - Real-time calculations
 * - Database persistence with autosave
 * - Multiple analysis tabs
 * - Starting Gate Financial CTAs
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAcquisitionCalculator } from '@/lib/hooks/use-acquisition-calculator';
import type { AcquisitionAnalysis, AcquisitionInputs, CalculatedMetrics } from '@/lib/calculations/acquisition-analysis';

export default function AcquisitionAnalyzerPage() {
  const params = useParams();
  const dealId = params.dealId as string;
  const [activeTab, setActiveTab] = useState('inputs');
  const [isLoading, setIsLoading] = useState(true);

  // Save handler
  const handleSave = useCallback(async (inputs: AcquisitionInputs, outputs: CalculatedMetrics) => {
    const response = await fetch(`/api/deals/${dealId}/analyses/acquisition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs, outputs })
    });
    if (!response.ok) {
      throw new Error('Failed to save analysis');
    }
  }, [dealId]);
  }, [dealId]);

  // Initialize calculator
  const {
    inputs,
    outputs,
    error,
    isCalculating,
    saveStatus,
    updateInput,
  } = useAcquisitionCalculator({
    dealId,
    autosaveDelay: 2000,
    onSave: handleSave
  });

  // Load existing analysis on mount
  useEffect(() => {
    const loadExistingAnalysis = async () => {
      try {
        const response = await fetch(`/api/deals/${dealId}/analyses/acquisition`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.outputs) {
            (data.outputs);
          }
        }
      } catch (error) {
        console.log('No existing analysis found, starting fresh');
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingAnalysis();
  }, [dealId, ]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D32] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading outputs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Business Acquisition Analyzer
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive financial analysis for your business acquisition
            </p>
          </div>
          
          {/* Save Status Indicator */}
          <div className="flex items-center space-x-2">
            {saveStatus.status === 'saving' && (
              <div className="flex items-center text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                <span>Saving...</span>
              </div>
            )}
            {saveStatus.status === 'saved' && (
              <div className="flex items-center text-[#2E7D32]">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Saved</span>
              </div>
            )}
            {saveStatus.status === 'error' && (
              <div className="flex items-center text-red-600">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>Error saving</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h3>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'inputs', name: 'Deal Inputs' },
            { id: 'roi', name: 'ROI & Returns' },
            { id: 'equity', name: 'Equity Build-Up' },
            { id: 'scenarios', name: 'Scenarios' },
            { id: 'valuation', name: 'Valuation' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-[#2E7D32] text-[#2E7D32]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeTab === 'inputs' && (
          <InputsTab inputs={inputs} updateInput={updateInput} />
        )}
        
        {activeTab === 'roi' && outputs && (
          <ROITab analysis={analysis} formatCurrency={formatCurrency} formatPercent={formatPercent} />
        )}
        
        {activeTab === 'equity' && outputs && (
          <EquityTab analysis={analysis} formatCurrency={formatCurrency} />
        )}
        
        {activeTab === 'scenarios' && outputs && (
          <ScenariosTab analysis={analysis} formatCurrency={formatCurrency} formatPercent={formatPercent} />
        )}
        
        {activeTab === 'valuation' && outputs && (
          <ValuationTab analysis={analysis} formatCurrency={formatCurrency} />
        )}
      </div>

      {/* Starting Gate Financial CTA */}
      <div className="mt-8 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] rounded-lg p-8 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Finance This Deal?</h2>
          <p className="text-lg mb-6 text-green-100">
            Starting Gate Financial offers competitive financing solutions for business acquisitions.
            Let our team help you structure the best deal possible.
          </p>
          <a
            href="https://startinggatefinancial.com/apply"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#D4AF37] hover:bg-[#B8941F] text-gray-900 font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Apply for Financing Now
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB COMPONENTS
// ============================================================================

interface InputsTabProps {
  inputs: AcquisitionInputs;
  updateInput: <K extends keyof AcquisitionInputs>(field: K, value: AcquisitionInputs[K]) => void;
}

function InputsTab({ inputs, updateInput }: InputsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Purchase Structure</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Purchase Price"
            type="number"
            value={inputs.purchasePrice}
            onChange={(v: string) => updateInput('purchasePrice', Number(v))}
            prefix="$"
          />
          <InputField
            label="Down Payment"
            type="number"
            value={inputs.downPayment}
            onChange={(v: string) => updateInput('downPayment', Number(v))}
            prefix="$"
          />
          <InputField
            label="Seller Financing"
            type="number"
            value={inputs.sellerFinancing}
            onChange={(v: string) => updateInput('sellerFinancing', Number(v))}
            prefix="$"
          />
          <InputField
            label="Bank Interest Rate"
            type="number"
            value={inputs.bankInterestRate}
            onChange={(v: string) => updateInput('bankInterestRate', Number(v))}
            suffix="%"
            step="0.1"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Financials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Annual Revenue"
            type="number"
            value={inputs.annualRevenue}
            onChange={(v: string) => updateInput('annualRevenue', Number(v))}
            prefix="$"
          />
          <InputField
            label="Annual SDE"
            type="number"
            value={inputs.annualSDE}
            onChange={(v: string) => updateInput('annualSDE', Number(v))}
            prefix="$"
          />
        </div>
      </div>
    </div>
  );
}

interface ROITabProps {
  analysis: AcquisitionAnalysis;
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
}

function ROITab({ outputs, formatCurrency, formatPercent }: ROITabProps) {
  const { roiMetrics } = analysis;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Cash-on-Cash Return"
          value={formatPercent(roiMetrics.cashOnCashReturn)}
          description="Annual return on cash invested"
          color={roiMetrics.cashOnCashReturn >= 15 ? 'green' : roiMetrics.cashOnCashReturn >= 10 ? 'yellow' : 'red'}
        />
        <MetricCard
          title="DSCR"
          value={`${roiMetrics.dscr.toFixed(2)}x`}
          description="Debt service coverage ratio"
          color={roiMetrics.dscr >= 1.25 ? 'green' : roiMetrics.dscr >= 1.0 ? 'yellow' : 'red'}
        />
        <MetricCard
          title="Payback Period"
          value={`${roiMetrics.paybackPeriodYears.toFixed(1)} yrs`}
          description="Time to recover investment"
          color={roiMetrics.paybackPeriodYears <= 5 ? 'green' : roiMetrics.paybackPeriodYears <= 7 ? 'yellow' : 'red'}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Summary</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Cash Invested</span>
            <span className="font-semibold">{formatCurrency(roiMetrics.totalCashInvested)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Annual Pre-Tax Cash Flow</span>
            <span className="font-semibold">{formatCurrency(roiMetrics.annualPreTaxCashFlow)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Annual Debt Service</span>
            <span className="font-semibold">{formatCurrency(outputs.debtService.annualDebtService)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EquityTabProps {
  analysis: AcquisitionAnalysis;
  formatCurrency: (value: number) => string;
}

function EquityTab({ outputs, formatCurrency }: EquityTabProps) {
  const { equitySchedule } = analysis;
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">10-Year Equity Build-Up</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Business Value</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Debt</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Owner Equity</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Equity %</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {equitySchedule.slice(0, 11).map((year) => (
              <tr key={year.year}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{year.year}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(year.businessValue)}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(year.totalDebt)}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-[#2E7D32]">{formatCurrency(year.ownerEquity)}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">{year.equityPercentage.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ScenariosTabProps {
  analysis: AcquisitionAnalysis;
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
}

function ScenariosTab({ outputs, formatCurrency, formatPercent }: ScenariosTabProps) {
  const { scenarios } = analysis;
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Scenario Comparison</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((scenario) => (
          <div key={scenario.name} className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">{scenario.name}</h4>
            <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Cash-on-Cash:</span>
                <span className="font-semibold">{formatPercent(scenario.metrics.cashOnCashReturn)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">DSCR:</span>
                <span className="font-semibold">{scenario.metrics.dscr.toFixed(2)}x</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ValuationTabProps {
  analysis: AcquisitionAnalysis;
  formatCurrency: (value: number) => string;
}

function ValuationTab({ outputs, formatCurrency }: ValuationTabProps) {
  const { valuations } = analysis;
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Valuation Methods</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valuation</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">vs Ask Price</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Assessment</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {valuations.map((val) => (
              <tr key={val.method}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{val.method}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(val.value)}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">
                  {formatCurrency(val.vsAskPrice)} ({val.vsAskPricePercent > 0 ? '+' : ''}{val.vsAskPricePercent}%)
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    val.assessment === 'undervalued' ? 'bg-green-100 text-green-800' :
                    val.assessment === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {val.assessment}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface InputFieldProps {
  label: string;
  value: number | string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
  step?: string;
}

function InputField({ label, value, onChange, prefix, suffix, type = 'text', step }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          step={step}
          className={`
            block w-full rounded-md border-gray-300 shadow-sm
            focus:border-[#2E7D32] focus:ring-[#2E7D32]
            ${prefix ? 'pl-7' : 'pl-3'}
            ${suffix ? 'pr-12' : 'pr-3'}
            py-2
          `}
        />
        {suffix && (
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  color: 'green' | 'yellow' | 'red';
}

function MetricCard({ title, value, description, color }: MetricCardProps) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    red: 'bg-red-50 border-red-200 text-red-800'
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${colorClasses[color]}`}>
      <h3 className="text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-xs opacity-75">{description}</p>
    </div>
  );
}
