'use client';
/**
 * Business Acquisition Analyzer - Deal-Specific Route
 * Professional UI with SGF Brand Colors (Emerald Green & Gold)
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Calculator,
  Building2,
  Percent,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Save
} from 'lucide-react';
import { useAcquisitionCalculator } from '@/lib/hooks/use-acquisition-calculator';
import CurrencyInput from '@/lib/components/CurrencyInput';
import type { AcquisitionInputs, CalculatedMetrics } from '@/lib/calculations/acquisition-analysis';
import AcquisitionExportButton from '@/components/calculators/AcquisitionExportButton';

export default function AcquisitionAnalyzerPage() {
  const params = useParams();
  const dealId = params.dealId as string;
  const [dealName, setDealName] = useState<string>('');
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

  // Initialize calculator
  const {
    inputs,
    outputs,
    error,
    saveStatus,
    updateInput,
  } = useAcquisitionCalculator({
    dealId,
    autosaveDelay: 2000,
    onSave: handleSave
  });

  // Load existing analysis and deal info on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch deal info
        const dealResponse = await fetch(`/api/deals/${dealId}`);
        if (dealResponse.ok) {
          const dealData = await dealResponse.json();
          setDealName(dealData.name || '');
        }

        // Fetch existing analysis
        const response = await fetch(`/api/deals/${dealId}/analyses/acquisition`);
        if (response.ok) {
          const data = await response.json();
          if (data.outputs) {
            console.log('Loaded existing analysis:', data.outputs);
          }
        }
      } catch (err) {
        console.log('No existing analysis found, starting fresh');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [dealId]);

  // Format helpers
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sgf-green-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-sgf-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'inputs', name: 'Deal Inputs', icon: Calculator },
    { id: 'roi', name: 'ROI & Returns', icon: TrendingUp },
    { id: 'equity', name: 'Equity Build-Up', icon: BarChart3 },
    { id: 'scenarios', name: 'Scenarios', icon: PieChart },
    { id: 'valuation', name: 'Valuation', icon: Building2 }
  ];

  // Prepare PDF data
  const pdfData = outputs ? {
    businessName: dealName,
    reportDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    // Business Info
    askingPrice: inputs.purchasePrice,
    annualRevenue: inputs.annualRevenue,
    annualSDE: inputs.annualSDE,
    // Deal Structure
    downPayment: inputs.downPayment,
    downPaymentPercent: (inputs.downPayment / inputs.purchasePrice) * 100,
    loanAmount: inputs.purchasePrice - inputs.downPayment,
    interestRate: inputs.bankLoanRate,
    loanTerm: 10, // Default 10 years, adjust if you have this in inputs
    // Calculated Results
    monthlyPayment: outputs.annualDebtService / 12,
    annualDebtService: outputs.annualDebtService,
    dscr: outputs.dscr,
    dscrStatus: outputs.dscrRating,
    // Returns
    annualCashFlow: outputs.annualPreTaxCashFlow,
    cashOnCashReturn: outputs.cashOnCashReturn,
    roi: outputs.cashOnCashReturn, // Using CoC as ROI
    paybackPeriod: outputs.paybackPeriodYears,
    // Multiples
    sdeMultiple: inputs.purchasePrice / inputs.annualSDE,
    revenueMultiple: inputs.purchasePrice / inputs.annualRevenue,
    // 5-Year Projections (map from equity schedule)
    projections: outputs.equitySchedule?.slice(0, 6).map(year => ({
      year: year.year,
      revenue: inputs.annualRevenue * Math.pow(1.05, year.year), // 5% growth assumption
      cashFlow: outputs.annualPreTaxCashFlow * Math.pow(1.05, year.year),
      equity: year.ownerEquity,
      cumulativeCashFlow: outputs.annualPreTaxCashFlow * year.year,
    })),
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sgf-green-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <Link 
          href={`/app/deals/${dealId}`}
          className="inline-flex items-center gap-2 text-sgf-green-500 hover:text-sgf-green-600 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Deal
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-sgf-green-500 via-sgf-green-600 to-sgf-green-700 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Pro Calculator
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Business Acquisition Analyzer</h1>
              <p className="text-sgf-green-100 mt-2">
                Comprehensive ROI, equity tracking & valuation analysis
              </p>
            </div>
            
            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* PDF Export Button */}
              {outputs && <AcquisitionExportButton data={pdfData} />}
              
              {/* Save Status */}
              {saveStatus === 'saving' && (
                <div className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Saving...</span>
                </div>
              )}
              {saveStatus === 'saved' && (
                <div className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Saved</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 bg-red-500/80 text-white px-4 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Error saving</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-sgf-green-500 text-sgf-green-600 bg-sgf-green-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'inputs' && (
            <InputsTab inputs={inputs} updateInput={updateInput} />
          )}
          
          {activeTab === 'roi' && outputs && (
            <ROITab outputs={outputs} formatCurrency={formatCurrency} formatPercent={formatPercent} />
          )}
          
          {activeTab === 'equity' && outputs && (
            <EquityTab outputs={outputs} formatCurrency={formatCurrency} />
          )}
          
          {activeTab === 'scenarios' && outputs && (
            <ScenariosTab outputs={outputs} formatCurrency={formatCurrency} formatPercent={formatPercent} />
          )}
          
          {activeTab === 'valuation' && outputs && (
            <ValuationTab outputs={outputs} formatCurrency={formatCurrency} />
          )}
        </div>

        {/* Starting Gate Financial CTA */}
        <div className="mt-8 bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Finance This Deal?</h2>
            <p className="text-lg mb-6 text-sgf-green-100">
              Starting Gate Financial offers competitive financing solutions for business acquisitions.
              Let our team help you structure the best deal possible.
            </p>
            <a 
              href="https://startinggatefinancial.com/apply"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-sgf-gold-500 hover:bg-sgf-gold-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg"
            >
              Apply for Financing Now
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB COMPONENTS (keeping all the existing tab components unchanged)
// ============================================================================

interface InputsTabProps {
  inputs: AcquisitionInputs;
  updateInput: <K extends keyof AcquisitionInputs>(field: K, value: AcquisitionInputs[K]) => void;
}

function InputsTab({ inputs, updateInput }: InputsTabProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Purchase Structure Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Purchase Structure</span>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">STEP 1</span>
        </div>
        <div className="p-6 space-y-4">
          <InputField
            label="Purchase Price"
            value={inputs.purchasePrice}
            onChange={(v) => updateInput('purchasePrice', v)}
            prefix="$"
            tooltip="Total acquisition cost including goodwill"
          />
          <InputField
            label="Down Payment"
            value={inputs.downPayment}
            onChange={(v) => updateInput('downPayment', v)}
            prefix="$"
            tooltip="Cash equity from buyer"
          />
          <InputField
            label="Seller Financing"
            value={inputs.sellerFinancing}
            onChange={(v) => updateInput('sellerFinancing', v)}
            prefix="$"
            tooltip="Amount financed by seller"
          />
          <InputField
            label="Bank Interest Rate"
            value={inputs.bankLoanRate}
            onChange={(v) => updateInput('bankLoanRate', v)}
            suffix="%"
            tooltip="Annual interest rate for bank loan"
          />
        </div>
      </div>

      {/* Business Financials Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Business Financials</span>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">STEP 2</span>
        </div>
        <div className="p-6 space-y-4">
          <InputField
            label="Annual Revenue"
            value={inputs.annualRevenue}
            onChange={(v) => updateInput('annualRevenue', v)}
            prefix="$"
            tooltip="Gross annual sales"
          />
          <InputField
            label="Annual SDE"
            value={inputs.annualSDE}
            onChange={(v) => updateInput('annualSDE', v)}
            prefix="$"
            tooltip="Seller's Discretionary Earnings"
          />
          <InputField
            label="Annual EBITDA"
            value={inputs.annualEBITDA}
            onChange={(v) => updateInput('annualEBITDA', v)}
            prefix="$"
            tooltip="Earnings before interest, taxes, depreciation & amortization"
          />
        </div>
      </div>
    </div>
  );
}

interface ROITabProps {
  outputs: CalculatedMetrics;
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
}

function ROITab({ outputs, formatCurrency, formatPercent }: ROITabProps) {
  const getDSCRColor = (dscr: number) => {
    if (dscr >= 1.25) return { bg: 'bg-sgf-green-50', border: 'border-sgf-green-200', text: 'text-sgf-green-700' };
    if (dscr >= 1.0) return { bg: 'bg-sgf-gold-50', border: 'border-sgf-gold-200', text: 'text-sgf-gold-700' };
    return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
  };

  const getCoCColor = (coc: number) => {
    if (coc >= 15) return { bg: 'bg-sgf-green-50', border: 'border-sgf-green-200', text: 'text-sgf-green-700' };
    if (coc >= 10) return { bg: 'bg-sgf-gold-50', border: 'border-sgf-gold-200', text: 'text-sgf-gold-700' };
    return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
  };

  const dscrColor = getDSCRColor(outputs.dscr);
  const cocColor = getCoCColor(outputs.cashOnCashReturn);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Cash-on-Cash Return */}
        <div className={`${cocColor.bg} border ${cocColor.border} rounded-xl p-6`}>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-1">Cash-on-Cash Return</p>
            <p className={`text-4xl font-bold ${cocColor.text} mb-2`}>
              {formatPercent(outputs.cashOnCashReturn)}
            </p>
            <p className="text-sm text-gray-500">Annual return on cash invested</p>
          </div>
        </div>

        {/* DSCR */}
        <div className={`${dscrColor.bg} border ${dscrColor.border} rounded-xl p-6`}>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-1">Debt Service Coverage</p>
            <p className={`text-4xl font-bold ${dscrColor.text} mb-2`}>
              {outputs.dscr.toFixed(2)}x
            </p>
            <p className="text-sm text-gray-500">{outputs.dscrRating}</p>
          </div>
        </div>

        {/* Payback Period */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-1">Payback Period</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">
              {outputs.paybackPeriodYears.toFixed(1)} yrs
            </p>
            <p className="text-sm text-gray-500">Time to recover investment</p>
          </div>
        </div>
      </div>

      {/* Cash Flow Summary */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="font-semibold text-gray-900">Cash Flow Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Cash Invested</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(outputs.totalCashInvested)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Annual Pre-Tax Cash Flow</p>
              <p className="text-2xl font-bold text-sgf-green-600">{formatCurrency(outputs.annualPreTaxCashFlow)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Annual Debt Service</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(outputs.annualDebtService)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EquityTabProps {
  outputs: CalculatedMetrics;
  formatCurrency: (value: number) => string;
}

function EquityTab({ outputs, formatCurrency }: EquityTabProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="font-semibold text-gray-900">10-Year Equity Build-Up</h3>
        <p className="text-sm text-gray-500 mt-1">Watch your ownership grow through debt paydown and appreciation</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Year</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Business Value</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Debt</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Owner Equity</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Equity %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {outputs.equitySchedule?.slice(0, 11).map((year, index) => (
              <tr key={year.year} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">Year {year.year}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">{formatCurrency(year.businessValue)}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">{formatCurrency(year.totalDebt)}</td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-sgf-green-600">{formatCurrency(year.ownerEquity)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-sgf-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(year.equityPercent, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">{year.equityPercent.toFixed(0)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Define the ScenarioData type for type guard
interface ScenarioData {
  cashOnCashReturn: number;
  dscr: number;
  annualPreTaxCashFlow: number;
}

interface ScenariosTabProps {
  outputs: CalculatedMetrics;
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
}

function ScenariosTab({ outputs, formatCurrency, formatPercent }: ScenariosTabProps) {
  const scenarios = [
    { key: 'baseCase', name: 'Base Case', color: 'gray', description: 'Current assumptions' },
    { key: 'bestCase', name: 'Best Case', color: 'green', description: 'Optimistic growth' },
    { key: 'worstCase', name: 'Worst Case', color: 'red', description: 'Conservative estimate' },
  ];

  const colorClasses = {
    gray: 'bg-white border-gray-200',
    green: 'bg-sgf-green-50 border-sgf-green-200',
    red: 'bg-red-50 border-red-200',
  };

  // Type guard function to check if data is ScenarioData
  const isScenarioData = (data: unknown): data is ScenarioData => {
    return (
      data !== null &&
      data !== undefined &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      'cashOnCashReturn' in data &&
      'dscr' in data &&
      'annualPreTaxCashFlow' in data
    );
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {scenarios.map((scenario) => {
        const data = outputs.scenarios?.[scenario.key as keyof typeof outputs.scenarios];
        
        // Type guard: skip if data is not ScenarioData
        if (!isScenarioData(data)) {
          return null;
        }

        return (
          <div key={scenario.key} className={`${colorClasses[scenario.color as keyof typeof colorClasses]} border rounded-xl overflow-hidden`}>
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
              <p className="text-sm text-gray-500">{scenario.description}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cash-on-Cash</span>
                <span className="text-lg font-bold text-gray-900">{formatPercent(data.cashOnCashReturn)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">DSCR</span>
                <span className="text-lg font-bold text-gray-900">{data.dscr.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Annual Cash Flow</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(data.annualPreTaxCashFlow)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ValuationTabProps {
  outputs: CalculatedMetrics;
  formatCurrency: (value: number) => string;
}

function ValuationTab({ outputs, formatCurrency }: ValuationTabProps) {
  const valuations = outputs.valuations;
  if (!valuations) return <div className="text-gray-500">No valuation data available</div>;

  const methods = [
    { key: 'sdeMultiple', name: 'SDE Multiple', data: valuations.sdeMultiple },
    { key: 'ebitdaMultiple', name: 'EBITDA Multiple', data: valuations.ebitdaMultiple },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="font-semibold text-gray-900">Valuation Analysis</h3>
        <p className="text-sm text-gray-500 mt-1">Compare purchase price against industry valuation methods</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Valuation</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">vs Purchase Price</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Assessment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {methods.map((method) => {
              const assessmentColors = {
                undervalued: 'bg-sgf-green-100 text-sgf-green-800',
                fair: 'bg-sgf-gold-100 text-sgf-gold-800',
                overvalued: 'bg-red-100 text-red-800',
              };
              
              return (
                <tr key={method.key}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{method.name}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">{formatCurrency(method.data.value)}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">
                    {formatCurrency(method.data.vsPurchasePrice)} ({method.data.vsPurchasePricePercent > 0 ? '+' : ''}{method.data.vsPurchasePricePercent.toFixed(1)}%)
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${assessmentColors[method.data.assessment as keyof typeof assessmentColors]}`}>
                      {method.data.assessment}
                    </span>
                  </td>
                </tr>
              );
            })}
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
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
}

function InputField({ label, value, onChange, prefix, suffix, tooltip }: InputFieldProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        {tooltip && (
          <div className="group relative">
            <div className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center cursor-help">?</div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <CurrencyInput
        prefix={prefix}
        suffix={suffix}
        decimals={suffix === '%' ? 2 : 0}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
