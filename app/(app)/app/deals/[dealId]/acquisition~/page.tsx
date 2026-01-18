
// ACQUIRELY - Business Acquisition Analyzer
// Complete deal analysis with ROI, Equity, Scenarios, Valuations, and Charts
// Location: app/(app)/app/deals/[dealId]/acquisition/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  AcquisitionInputs,
  CalculatedMetrics,
  DEFAULT_INPUTS,
  calculateAcquisitionAnalysis,
  formatCurrency,
  formatPercent,
  formatMultiple,
  formatYears,
  INDUSTRY_MULTIPLES,
  BusinessType,
  getCashOnCashRating,
} from '@/lib/calculations/acquisition-analysis';

// ============================================
// MAIN COMPONENT
// ============================================

export default function AcquisitionAnalyzerPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const dealId = params.dealId as string;
  
  // State
  const [inputs, setInputs] = useState<AcquisitionInputs>(DEFAULT_INPUTS);
  const [outputs, setOutputs] = useState<CalculatedMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [dealName, setDealName] = useState('');
  
  // Load existing analysis
  useEffect(() => {
    async function loadAnalysis() {
      if (!dealId || status !== 'authenticated') return;
      
      try {
        const res = await fetch(`/api/deals/${dealId}/analyses/acquisition`);
        const data = await res.json();
        
        if (data.exists && data.data) {
          setInputs(data.data.inputs);
          setOutputs(calculateAcquisitionAnalysis(data.data.inputs));
          setLastSaved(new Date(data.data.updatedAt));
        } else {
          setOutputs(calculateAcquisitionAnalysis(DEFAULT_INPUTS));
        }
        
        const dealRes = await fetch(`/api/deals/${dealId}`);
        if (dealRes.ok) {
          const dealData = await dealRes.json();
          if (dealData.name) setDealName(dealData.name);
        }
      } catch (error) {
        console.error('Error loading analysis:', error);
        setOutputs(calculateAcquisitionAnalysis(DEFAULT_INPUTS));
      } finally {
        setIsLoading(false);
      }
    }
    
    loadAnalysis();
  }, [dealId, status]);
  
  // Recalculate when inputs change
  useEffect(() => {
    const result = calculateAcquisitionAnalysis(inputs);
    setOutputs(result);
  }, [inputs]);
  
  // Autosave with debounce
  useEffect(() => {
    if (!outputs || isLoading) return;
    
    const timer = setTimeout(async () => {
      await saveAnalysis();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [inputs]);
  
  // Save function
  const saveAnalysis = useCallback(async () => {
    if (!outputs || !dealId) return;
    
    try {
      setSaveStatus('saving');
      setIsSaving(true);
      
      const res = await fetch(`/api/deals/${dealId}/analyses/acquisition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs, outputs }),
      });
      
      if (res.ok) {
        setSaveStatus('saved');
        setLastSaved(new Date());
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }, [inputs, outputs, dealId]);
  
  // Update input handler
  const updateInput = useCallback(<K extends keyof AcquisitionInputs>(
    key: K,
    value: AcquisitionInputs[K]
  ) => {
    setInputs(prev => ({ ...prev, [key]: value }));
    setSaveStatus('idle');
  }, []);
  
  const tabs = [
    { id: 0, name: 'Deal Inputs', icon: '📝' },
    { id: 1, name: 'ROI & Returns', icon: '💰' },
    { id: 2, name: 'Equity Build-Up', icon: '📈' },
    { id: 3, name: 'Scenarios', icon: '🔄' },
    { id: 4, name: 'Valuation', icon: '🏷️' },
    { id: 5, name: 'Charts', icon: '📊' },
  ];
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analyzer...</p>
        </div>
      </div>
    );
  }
  
  if (!session) {
    router.push('/');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/app/deals/${dealId}`)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Business Acquisition Analyzer</h1>
                <p className="text-sm text-slate-500">{dealName || 'Deal Analysis'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-2 text-amber-600 text-sm">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-2 text-emerald-600 text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Saved
                </span>
              )}
              {lastSaved && saveStatus === 'idle' && (
                <span className="text-xs text-slate-400">
                  Last saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={saveAnalysis}
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Tab Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 0 && <DealInputsTab inputs={inputs} updateInput={updateInput} outputs={outputs} />}
        {activeTab === 1 && outputs && <ROIReturnsTab outputs={outputs} inputs={inputs} />}
        {activeTab === 2 && outputs && <EquityBuildUpTab outputs={outputs} />}
        {activeTab === 3 && outputs && <ScenariosTab outputs={outputs} />}
        {activeTab === 4 && outputs && <ValuationTab outputs={outputs} inputs={inputs} />}
        {activeTab === 5 && outputs && <ChartsTab outputs={outputs} inputs={inputs} />}
      </main>
      
      {/* SGF CTA Footer */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Ready to Finance Your Acquisition?</h3>
              <p className="text-emerald-100">Starting Gate Financial offers competitive SBA, conventional, and seller financing solutions.</p>
            </div>
            <div className="flex gap-4">
              <a
                href="https://startinggatefinancial.com/apply"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white text-emerald-700 font-bold rounded-lg hover:bg-emerald-50 transition-colors shadow-lg"
              >
                Apply for Financing →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TAB 1: DEAL INPUTS
// ============================================

function DealInputsTab({ inputs, updateInput, outputs }: { 
  inputs: AcquisitionInputs;
  updateInput: <K extends keyof AcquisitionInputs>(key: K, value: AcquisitionInputs[K]) => void;
  outputs: CalculatedMetrics | null;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Business Information */}
        <Card title="Business Information" icon="🏢">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Deal Name" value={inputs.dealName} onChange={(v) => updateInput('dealName', v)} placeholder="e.g., ABC Restaurant" />
            <SelectField
              label="Business Type"
              value={inputs.businessType}
              onChange={(v) => updateInput('businessType', v as BusinessType)}
              options={Object.entries(INDUSTRY_MULTIPLES).map(([key, val]) => ({ value: key, label: val.description }))}
            />
          </div>
        </Card>
        
        {/* Purchase Structure */}
        <Card title="Purchase Structure" icon="💵">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CurrencyField label="Purchase Price" value={inputs.purchasePrice} onChange={(v) => updateInput('purchasePrice', v)} />
            <CurrencyField label="Down Payment" value={inputs.downPayment} onChange={(v) => updateInput('downPayment', v)} hint={outputs ? `${outputs.downPaymentPercent.toFixed(1)}% of purchase` : ''} />
            <CurrencyField label="Seller Financing" value={inputs.sellerFinancing} onChange={(v) => updateInput('sellerFinancing', v)} />
            <div className="grid grid-cols-2 gap-2">
              <PercentField label="Seller Rate" value={inputs.sellerFinancingRate} onChange={(v) => updateInput('sellerFinancingRate', v)} />
              <NumberField label="Term (Yrs)" value={inputs.sellerFinancingTerm} onChange={(v) => updateInput('sellerFinancingTerm', v)} />
            </div>
            <ReadOnlyField label="Bank Loan (Calculated)" value={outputs ? formatCurrency(outputs.bankLoan) : '-'} />
            <div className="grid grid-cols-2 gap-2">
              <PercentField label="Bank Rate" value={inputs.bankLoanRate} onChange={(v) => updateInput('bankLoanRate', v)} />
              <NumberField label="Term (Yrs)" value={inputs.bankLoanTerm} onChange={(v) => updateInput('bankLoanTerm', v)} />
            </div>
          </div>
        </Card>
        
        {/* Business Financials */}
        <Card title="Business Financials" icon="📊">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CurrencyField label="Annual Revenue" value={inputs.annualRevenue} onChange={(v) => updateInput('annualRevenue', v)} />
            <CurrencyField label="Annual SDE" value={inputs.annualSDE} onChange={(v) => updateInput('annualSDE', v)} hint="Seller's Discretionary Earnings" />
            <CurrencyField label="Annual EBITDA" value={inputs.annualEBITDA} onChange={(v) => updateInput('annualEBITDA', v)} />
          </div>
        </Card>
        
        {/* Additional Parameters */}
        <Card title="Additional Parameters" icon="⚙️">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CurrencyField label="Working Capital" value={inputs.workingCapital} onChange={(v) => updateInput('workingCapital', v)} />
            <CurrencyField label="Closing Costs" value={inputs.closingCosts} onChange={(v) => updateInput('closingCosts', v)} />
            <CurrencyField label="Annual CAPEX" value={inputs.annualCapex} onChange={(v) => updateInput('annualCapex', v)} />
            <CurrencyField label="FF&E Value" value={inputs.ffeValue} onChange={(v) => updateInput('ffeValue', v)} hint="Furniture, Fixtures & Equipment" />
            <CurrencyField label="Inventory Value" value={inputs.inventoryValue} onChange={(v) => updateInput('inventoryValue', v)} />
            <CurrencyField label="Buyer's Salary" value={inputs.buyerSalary} onChange={(v) => updateInput('buyerSalary', v)} hint="Your required salary" />
          </div>
        </Card>
        
        {/* Projections */}
        <Card title="Growth Projections" icon="🚀">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PercentField label="Revenue Growth Rate" value={inputs.revenueGrowthRate} onChange={(v) => updateInput('revenueGrowthRate', v)} hint="Annual growth" />
            <PercentField label="Expense Growth Rate" value={inputs.expenseGrowthRate} onChange={(v) => updateInput('expenseGrowthRate', v)} />
            <NumberField label="Exit Timeline (Years)" value={inputs.exitTimeline} onChange={(v) => updateInput('exitTimeline', v)} hint="When you plan to sell" />
          </div>
        </Card>
      </div>
      
      {/* Quick Metrics Sidebar */}
      <div className="space-y-4 sticky top-36">
        <h3 className="text-lg font-bold text-slate-900">Quick Metrics</h3>
        {outputs && (
          <>
            <MetricCard label="Cash-on-Cash Return" value={formatPercent(outputs.cashOnCashReturn)} status={outputs.cashOnCashReturn >= 15 ? 'success' : outputs.cashOnCashReturn >= 10 ? 'warning' : 'danger'} />
            <MetricCard label="DSCR" value={formatMultiple(outputs.dscr)} status={outputs.dscr >= 1.25 ? 'success' : outputs.dscr >= 1.0 ? 'warning' : 'danger'} />
            <MetricCard label="Total Cash Invested" value={formatCurrency(outputs.totalCashInvested)} />
            <MetricCard label="Annual Cash Flow" value={formatCurrency(outputs.annualPreTaxCashFlow)} status={outputs.annualPreTaxCashFlow >= 0 ? 'success' : 'danger'} />
            <MetricCard label="Payback Period" value={formatYears(outputs.paybackPeriodYears)} />
            <MetricCard label="Annual Debt Service" value={formatCurrency(outputs.annualDebtService)} />
          </>
        )}
      </div>
    </div>
  );
}

// ============================================
// TAB 2: ROI & RETURNS
// ============================================

function ROIReturnsTab({ outputs, inputs }: { outputs: CalculatedMetrics; inputs: AcquisitionInputs }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Cash-on-Cash Return" value={formatPercent(outputs.cashOnCashReturn)} status={outputs.cashOnCashReturn >= 15 ? 'success' : outputs.cashOnCashReturn >= 10 ? 'warning' : 'danger'} description="Annual return on cash invested" />
        <MetricCard label="DSCR" value={formatMultiple(outputs.dscr)} status={outputs.dscr >= 1.25 ? 'success' : outputs.dscr >= 1.0 ? 'warning' : 'danger'} description="Debt Service Coverage Ratio" />
        <MetricCard label="Payback Period" value={formatYears(outputs.paybackPeriodYears)} status={outputs.paybackPeriodYears <= 5 ? 'success' : outputs.paybackPeriodYears <= 7 ? 'warning' : 'danger'} description="Time to recover investment" />
        <MetricCard label="Total Cash Invested" value={formatCurrency(outputs.totalCashInvested)} description="Down payment + WC + Closing" />
      </div>
      
      {outputs.dscr < 1.25 && (
        <div className={`p-4 rounded-xl ${outputs.dscr < 1.0 ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{outputs.dscr < 1.0 ? '⚠️' : '⚡'}</span>
            <div>
              <h4 className={`font-bold ${outputs.dscr < 1.0 ? 'text-red-700' : 'text-amber-700'}`}>
                {outputs.dscr < 1.0 ? 'Insufficient Cash Flow' : 'Marginal DSCR'}
              </h4>
              <p className={`text-sm ${outputs.dscr < 1.0 ? 'text-red-600' : 'text-amber-600'}`}>
                {outputs.dscr < 1.0 
                  ? 'The business does not generate enough cash to cover debt payments.'
                  : 'DSCR is below 1.25x which may make financing difficult.'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Card title="Multi-Year ROI Projections" icon="📈">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Year</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Annual Cash Flow</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Cumulative Cash</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Cumulative ROI</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Annualized ROI</th>
              </tr>
            </thead>
            <tbody>
              {outputs.multiYearROI.map((row) => (
                <tr key={row.year} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">Year {row.year}</td>
                  <td className={`text-right py-3 px-4 ${row.annualCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(row.annualCashFlow)}</td>
                  <td className={`text-right py-3 px-4 ${row.cumulativeCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(row.cumulativeCashFlow)}</td>
                  <td className={`text-right py-3 px-4 font-semibold ${row.cumulativeROI >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatPercent(row.cumulativeROI)}</td>
                  <td className="text-right py-3 px-4 text-slate-600">{formatPercent(row.annualizedROI)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Investment Breakdown" icon="💰">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Down Payment</span>
              <span className="font-semibold">{formatCurrency(inputs.downPayment)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Working Capital</span>
              <span className="font-semibold">{formatCurrency(inputs.workingCapital)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Closing Costs</span>
              <span className="font-semibold">{formatCurrency(inputs.closingCosts)}</span>
            </div>
            <div className="flex justify-between py-2 bg-emerald-50 -mx-4 px-4 rounded-lg">
              <span className="font-bold text-emerald-700">Total Cash Invested</span>
              <span className="font-bold text-emerald-700">{formatCurrency(outputs.totalCashInvested)}</span>
            </div>
          </div>
        </Card>
        
        <Card title="Annual Cash Flow" icon="💵">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Annual SDE</span>
              <span className="font-semibold text-emerald-600">+{formatCurrency(inputs.annualSDE)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Annual Debt Service</span>
              <span className="font-semibold text-red-600">-{formatCurrency(outputs.annualDebtService)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Annual CAPEX</span>
              <span className="font-semibold text-red-600">-{formatCurrency(inputs.annualCapex)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Buyer's Salary</span>
              <span className="font-semibold text-red-600">-{formatCurrency(inputs.buyerSalary)}</span>
            </div>
            <div className={`flex justify-between py-2 -mx-4 px-4 rounded-lg ${outputs.annualPreTaxCashFlow >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <span className={`font-bold ${outputs.annualPreTaxCashFlow >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Net Annual Cash Flow</span>
              <span className={`font-bold ${outputs.annualPreTaxCashFlow >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatCurrency(outputs.annualPreTaxCashFlow)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// TAB 3: EQUITY BUILD-UP
// ============================================

function EquityBuildUpTab({ outputs }: { outputs: CalculatedMetrics }) {
  const lastYear = outputs.equitySchedule[outputs.equitySchedule.length - 1];
  const firstYear = outputs.equitySchedule[0];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Starting Equity" value={formatCurrency(firstYear?.ownerEquity || 0)} description="Year 0 (Acquisition)" />
        <MetricCard label="Year 5 Equity" value={formatCurrency(outputs.equitySchedule[5]?.ownerEquity || 0)} status="success" />
        <MetricCard label="Year 10 Equity" value={formatCurrency(outputs.equitySchedule[10]?.ownerEquity || lastYear?.ownerEquity || 0)} status="success" />
        <MetricCard label="Equity Growth" value={formatCurrency((lastYear?.ownerEquity || 0) - (firstYear?.ownerEquity || 0))} status="success" description="Total wealth created" />
      </div>
      
      <Card title="10-Year Equity Build-Up Schedule" icon="📊">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-600">Year</th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-slate-600">Business Value</th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-slate-600">Bank Balance</th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-slate-600">Seller Balance</th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-slate-600">Total Debt</th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-slate-600">Owner Equity</th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-slate-600">Equity %</th>
              </tr>
            </thead>
            <tbody>
              {outputs.equitySchedule.map((row, index) => (
                <tr key={row.year} className={`border-b border-slate-100 hover:bg-emerald-50/50 ${index === 0 ? 'bg-slate-50' : ''}`}>
                  <td className="py-3 px-3 font-medium">{row.year === 0 ? 'Acquisition' : `Year ${row.year}`}</td>
                  <td className="text-right py-3 px-3">{formatCurrency(row.businessValue)}</td>
                  <td className="text-right py-3 px-3 text-red-600">{formatCurrency(row.bankLoanBalance)}</td>
                  <td className="text-right py-3 px-3 text-red-600">{formatCurrency(row.sellerNoteBalance)}</td>
                  <td className="text-right py-3 px-3 text-red-600 font-medium">{formatCurrency(row.totalDebt)}</td>
                  <td className="text-right py-3 px-3 text-emerald-600 font-bold">{formatCurrency(row.ownerEquity)}</td>
                  <td className="text-right py-3 px-3">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, row.equityPercent)}%` }}></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{row.equityPercent.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4">💰 Total Wealth Creation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-emerald-200 text-sm">Initial Investment</div>
            <div className="text-2xl font-bold">{formatCurrency(outputs.totalCashInvested)}</div>
          </div>
          <div>
            <div className="text-emerald-200 text-sm">Ending Equity (Year {outputs.equitySchedule.length - 1})</div>
            <div className="text-2xl font-bold">{formatCurrency(lastYear?.ownerEquity || 0)}</div>
          </div>
          <div>
            <div className="text-emerald-200 text-sm">Total Return Multiple</div>
            <div className="text-2xl font-bold">{((lastYear?.ownerEquity || 0) / outputs.totalCashInvested).toFixed(1)}x</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TAB 4: SCENARIOS
// ============================================

function ScenariosTab({ outputs }: { outputs: CalculatedMetrics }) {
  const scenarios = [
    { ...outputs.scenarios.baseCase, color: 'slate', icon: '📊' },
    { ...outputs.scenarios.bestCase, color: 'emerald', icon: '🚀' },
    { ...outputs.scenarios.worstCase, color: 'red', icon: '⚠️' },
    { ...outputs.scenarios.higherDownPayment, color: 'blue', icon: '💰' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map((scenario) => (
          <div key={scenario.name} className={`p-5 rounded-xl border-2 ${
            scenario.color === 'emerald' ? 'border-emerald-200 bg-emerald-50' :
            scenario.color === 'red' ? 'border-red-200 bg-red-50' :
            scenario.color === 'blue' ? 'border-blue-200 bg-blue-50' :
            'border-slate-200 bg-white'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{scenario.icon}</span>
              <h4 className="font-bold text-slate-900">{scenario.name}</h4>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-slate-500">Cash-on-Cash</div>
                <div className={`text-xl font-bold ${scenario.cashOnCashReturn >= 15 ? 'text-emerald-600' : scenario.cashOnCashReturn >= 10 ? 'text-amber-600' : 'text-red-600'}`}>
                  {formatPercent(scenario.cashOnCashReturn)}
                </div>
              </div>
              <div>
                <div className="text-slate-500">5-Year Return</div>
                <div className="font-semibold">{formatPercent(scenario.fiveYearReturn)}</div>
              </div>
              <div>
                <div className="text-slate-500">10-Year Equity</div>
                <div className="font-semibold text-emerald-600">{formatCurrency(scenario.tenYearEquity)}</div>
              </div>
              <div>
                <div className="text-slate-500">DSCR</div>
                <div className="font-semibold">{formatMultiple(scenario.dscr)}</div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500">
              <div>Revenue Growth: {scenario.assumptions.revenueGrowth.toFixed(1)}%</div>
              <div>Down Payment: {formatCurrency(scenario.assumptions.downPayment)}</div>
            </div>
          </div>
        ))}
      </div>
      
      <Card title="Revenue Sensitivity Analysis" icon="📉">
        <p className="text-sm text-slate-600 mb-4">How does your annual cash flow change if revenue increases or decreases?</p>
        <div className="grid grid-cols-6 gap-2">
          {outputs.scenarios.sensitivityAnalysis.map((point) => (
            <div key={point.revenueChangePercent} className={`p-3 rounded-lg text-center ${point.annualCashFlow >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <div className={`text-xs font-medium ${point.revenueChangePercent === 0 ? 'text-blue-600' : 'text-slate-500'}`}>
                {point.revenueChangePercent >= 0 ? '+' : ''}{point.revenueChangePercent}%
              </div>
              <div className={`text-sm font-bold ${point.annualCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(point.annualCashFlow)}
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <Card title="Break-Even Analysis" icon="⚖️">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <div className="text-sm text-slate-500 mb-1">Investment Payback</div>
            <div className="text-2xl font-bold text-slate-900">{formatYears(outputs.scenarios.breakEven.paybackYears)}</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <div className="text-sm text-slate-500 mb-1">Break-Even Revenue</div>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(outputs.scenarios.breakEven.breakEvenRevenue)}</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-xl">
            <div className="text-sm text-emerald-600 mb-1">Safety Margin</div>
            <div className={`text-2xl font-bold ${outputs.scenarios.breakEven.safetyMarginPercent >= 20 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {formatPercent(outputs.scenarios.breakEven.safetyMarginPercent)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================
// TAB 5: VALUATION
// ============================================

function ValuationTab({ outputs, inputs }: { outputs: CalculatedMetrics; inputs: AcquisitionInputs }) {
  const valuationMethods = [
    { name: 'SDE Multiple', data: outputs.valuations.sdeMultiple, base: inputs.annualSDE },
    { name: 'EBITDA Multiple', data: outputs.valuations.ebitdaMultiple, base: inputs.annualEBITDA },
    { name: 'Revenue Multiple', data: outputs.valuations.revenueMultiple, base: inputs.annualRevenue },
    { name: 'Asset-Based', data: outputs.valuations.assetBased, base: inputs.ffeValue + inputs.inventoryValue },
  ];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border-2 border-slate-200 bg-white">
          <div className="text-sm text-slate-500">Purchase Price</div>
          <div className="text-3xl font-bold text-slate-900">{formatCurrency(inputs.purchasePrice)}</div>
        </div>
        <div className="p-5 rounded-xl border-2 border-emerald-200 bg-emerald-50">
          <div className="text-sm text-emerald-600">Implied SDE Multiple</div>
          <div className="text-3xl font-bold text-emerald-700">{formatMultiple(outputs.valuations.impliedSdeMultiple)}</div>
          <div className="text-xs text-emerald-500">Industry avg: {formatMultiple(INDUSTRY_MULTIPLES[inputs.businessType].sde)}</div>
        </div>
        <div className="p-5 rounded-xl border-2 border-blue-200 bg-blue-50">
          <div className="text-sm text-blue-600">Implied EBITDA Multiple</div>
          <div className="text-3xl font-bold text-blue-700">{formatMultiple(outputs.valuations.impliedEbitdaMultiple)}</div>
          <div className="text-xs text-blue-500">Industry avg: {formatMultiple(INDUSTRY_MULTIPLES[inputs.businessType].ebitda)}</div>
        </div>
      </div>
      
      <Card title="Valuation Comparison" icon="🏷️">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Method</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Multiple</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Calculated Value</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">vs Purchase Price</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Assessment</th>
              </tr>
            </thead>
            <tbody>
              {valuationMethods.map((method) => (
                <tr key={method.name} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">{method.name}</div>
                    <div className="text-xs text-slate-500">{formatCurrency(method.base)} × {formatMultiple(method.data.multiple)}</div>
                  </td>
                  <td className="text-right py-3 px-4">{formatMultiple(method.data.multiple)}</td>
                  <td className="text-right py-3 px-4 font-semibold">{formatCurrency(method.data.value)}</td>
                  <td className={`text-right py-3 px-4 font-medium ${method.data.vsPurchasePrice >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {method.data.vsPurchasePrice >= 0 ? '+' : ''}{formatCurrency(method.data.vsPurchasePrice)} ({formatPercent(method.data.vsPurchasePricePercent)})
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      method.data.assessment === 'undervalued' ? 'text-emerald-600 bg-emerald-50' :
                      method.data.assessment === 'fair' ? 'text-amber-600 bg-amber-50' :
                      'text-red-600 bg-red-50'
                    }`}>
                      {method.data.assessment === 'undervalued' ? '✓ Undervalued' : method.data.assessment === 'fair' ? '○ Fair Value' : '⚠ Overvalued'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      <Card title={`Industry Benchmarks: ${INDUSTRY_MULTIPLES[inputs.businessType].description}`} icon="📊">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <div className="text-sm text-slate-500 mb-1">SDE Multiple</div>
            <div className="text-2xl font-bold text-slate-900">{formatMultiple(INDUSTRY_MULTIPLES[inputs.businessType].sde)}</div>
            <div className={`text-xs mt-1 ${outputs.valuations.impliedSdeMultiple <= INDUSTRY_MULTIPLES[inputs.businessType].sde ? 'text-emerald-500' : 'text-red-500'}`}>
              You're paying: {formatMultiple(outputs.valuations.impliedSdeMultiple)}
            </div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <div className="text-sm text-slate-500 mb-1">EBITDA Multiple</div>
            <div className="text-2xl font-bold text-slate-900">{formatMultiple(INDUSTRY_MULTIPLES[inputs.businessType].ebitda)}</div>
            <div className={`text-xs mt-1 ${outputs.valuations.impliedEbitdaMultiple <= INDUSTRY_MULTIPLES[inputs.businessType].ebitda ? 'text-emerald-500' : 'text-red-500'}`}>
              You're paying: {formatMultiple(outputs.valuations.impliedEbitdaMultiple)}
            </div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <div className="text-sm text-slate-500 mb-1">Revenue Multiple</div>
            <div className="text-2xl font-bold text-slate-900">{formatMultiple(INDUSTRY_MULTIPLES[inputs.businessType].revenue)}</div>
            <div className={`text-xs mt-1 ${outputs.valuations.impliedRevenueMultiple <= INDUSTRY_MULTIPLES[inputs.businessType].revenue ? 'text-emerald-500' : 'text-red-500'}`}>
              You're paying: {formatMultiple(outputs.valuations.impliedRevenueMultiple)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================
// TAB 6: CHARTS
// ============================================

function ChartsTab({ outputs, inputs }: { outputs: CalculatedMetrics; inputs: AcquisitionInputs }) {
  return (
    <div className="space-y-6">
      <Card title="Equity Growth Over Time" icon="📈">
        <div className="h-80 flex items-end gap-2 px-4">
          {outputs.equitySchedule.map((row) => {
            const maxValue = Math.max(...outputs.equitySchedule.map(r => r.businessValue));
            const equityHeight = maxValue > 0 ? (row.ownerEquity / maxValue) * 100 : 0;
            const debtHeight = maxValue > 0 ? (row.totalDebt / maxValue) * 100 : 0;
            
            return (
              <div key={row.year} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col-reverse h-64">
                  <div className="w-full bg-emerald-500 rounded-t transition-all" style={{ height: `${equityHeight}%` }} title={`Equity: ${formatCurrency(row.ownerEquity)}`}></div>
                  <div className="w-full bg-red-400 transition-all" style={{ height: `${debtHeight}%` }} title={`Debt: ${formatCurrency(row.totalDebt)}`}></div>
                </div>
                <div className="text-xs mt-2 text-slate-500">Y{row.year}</div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded"></div>
            <span className="text-sm text-slate-600">Owner Equity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span className="text-sm text-slate-600">Total Debt</span>
          </div>
        </div>
      </Card>
      
      <Card title="Cumulative ROI" icon="📊">
        <div className="h-64 flex items-end gap-3 px-4">
          {outputs.multiYearROI.map((row) => {
            const maxROI = Math.max(...outputs.multiYearROI.map(r => r.cumulativeROI));
            const height = maxROI > 0 ? (row.cumulativeROI / maxROI) * 100 : 0;
            
            return (
              <div key={row.year} className="flex-1 flex flex-col items-center">
                <div className="text-xs font-bold text-emerald-600 mb-1">{formatPercent(row.cumulativeROI)}</div>
                <div className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all" style={{ height: `${height}%`, minHeight: '4px' }}></div>
                <div className="text-xs mt-2 text-slate-500">Year {row.year}</div>
              </div>
            );
          })}
        </div>
      </Card>
      
      <Card title="Annual Cash Flow Projection" icon="💵">
        <div className="h-64 flex items-end gap-3 px-4">
          {outputs.multiYearROI.map((row) => {
            const maxFlow = Math.max(...outputs.multiYearROI.map(r => Math.abs(r.annualCashFlow)));
            const height = maxFlow > 0 ? (Math.abs(row.annualCashFlow) / maxFlow) * 100 : 0;
            
            return (
              <div key={row.year} className="flex-1 flex flex-col items-center">
                <div className="text-xs font-medium text-slate-600 mb-1">{formatCurrency(row.annualCashFlow)}</div>
                <div className={`w-full rounded-t transition-all ${row.annualCashFlow >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ height: `${height}%`, minHeight: '4px' }}></div>
                <div className="text-xs mt-2 text-slate-500">Year {row.year}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ============================================
// REUSABLE UI COMPONENTS
// ============================================

function Card({ title, icon, children }: { title: string; icon?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function MetricCard({ label, value, description, status }: { label: string; value: string; description?: string; status?: 'success' | 'warning' | 'danger' }) {
  const statusColors = { success: 'border-emerald-200 bg-emerald-50', warning: 'border-amber-200 bg-amber-50', danger: 'border-red-200 bg-red-50' };
  return (
    <div className={`p-4 rounded-xl border-2 ${status ? statusColors[status] : 'border-slate-200 bg-white'}`}>
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`text-2xl font-bold ${status === 'success' ? 'text-emerald-600' : status === 'warning' ? 'text-amber-600' : status === 'danger' ? 'text-red-600' : 'text-slate-900'}`}>{value}</div>
      {description && <div className="text-xs text-slate-400 mt-1">{description}</div>}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, hint }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </div>
  );
}

function CurrencyField({ label, value, onChange, hint }: { label: string; value: number; onChange: (v: number) => void; hint?: string }) {
  const [displayValue, setDisplayValue] = useState(formatCurrency(value));
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.-]/g, '');
    setDisplayValue(e.target.value);
    const num = parseFloat(raw);
    if (!isNaN(num)) onChange(num);
  };
  const handleBlur = () => setDisplayValue(formatCurrency(value));
  const handleFocus = () => setDisplayValue(value.toString());
  
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
        <input type="text" value={displayValue} onChange={handleChange} onBlur={handleBlur} onFocus={handleFocus} className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
      </div>
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </div>
  );
}

function PercentField({ label, value, onChange, hint }: { label: string; value: number; onChange: (v: number) => void; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <input type="number" step="0.1" value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className="w-full pr-8 pl-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
      </div>
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </div>
  );
}

function NumberField({ label, value, onChange, hint }: { label: string; value: number; onChange: (v: number) => void; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white">
        {options.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
      </select>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600">{value}</div>
    </div>
  );
}
