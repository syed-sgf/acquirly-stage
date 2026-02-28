'use client';

import { useState, useMemo } from 'react';
import { DollarSign, Building2, Calculator, BarChart3, FileText, MessageSquare, Save, TrendingUp } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import PremiumProductsCTA from '@/components/core/PremiumProductsCTA';
import GatedCalculator from '@/components/core/GatedCalculator';
import CurrencyInput from '@/lib/components/CurrencyInput';

interface CREInputs {
  propertyValue: number;
  purchasePrice: number;
  grossPotentialRent: number;
  otherIncome: number;
  vacancyRate: number;
  operatingExpenses: number;
  propertyTaxes: number;
  insurance: number;
  managementFee: number;
  reserves: number;
  interestRate: number;
  amortization: number;
  loanTerm: number;
  targetDSCR: number;
  maxLTV: number;
}

const defaultInputs: CREInputs = {
  propertyValue: 2000000,
  purchasePrice: 1900000,
  grossPotentialRent: 240000,
  otherIncome: 12000,
  vacancyRate: 5,
  operatingExpenses: 48000,
  propertyTaxes: 24000,
  insurance: 8000,
  managementFee: 5,
  reserves: 3,
  interestRate: 7.5,
  amortization: 25,
  loanTerm: 10,
  targetDSCR: 1.25,
  maxLTV: 75,
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};


const calculateMonthlyPayment = (principal: number, annualRate: number, years: number): number => {
  if (!principal || !annualRate || !years) return 0;
  const monthlyRate = (annualRate / 100) / 12;
  const numPayments = years * 12;
  if (monthlyRate === 0) return principal / numPayments;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
};

export default function CRELoanSizerPage() {
  const [inputs, setInputs] = useState<CREInputs>(defaultInputs);

  const handleInputChange = (field: keyof CREInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const outputs = useMemo(() => {
    const { propertyValue, purchasePrice, grossPotentialRent, otherIncome, vacancyRate,
      operatingExpenses, propertyTaxes, insurance, interestRate } = inputs;
    const managementFee = inputs.managementFee;
    const reserves = inputs.reserves;
    const amortization = inputs.amortization || 25;
    const targetDSCR = inputs.targetDSCR || 1.25;
    const maxLTV = inputs.maxLTV || 75;

    if (!grossPotentialRent || !propertyValue) return null;

    // Income Calculations
    const grossPotentialIncome = grossPotentialRent + otherIncome;
    const vacancyLoss = grossPotentialIncome * (vacancyRate / 100);
    const effectiveGrossIncome = grossPotentialIncome - vacancyLoss;
    const managementExpense = effectiveGrossIncome * (managementFee / 100);
    const reserveExpense = effectiveGrossIncome * (reserves / 100);
    const totalOperatingExpenses = operatingExpenses + propertyTaxes + insurance + managementExpense + reserveExpense;
    const netOperatingIncome = effectiveGrossIncome - totalOperatingExpenses;

    // Cap Rate
    const capRate = propertyValue > 0 ? (netOperatingIncome / propertyValue) * 100 : 0;

    // Max Loan based on DSCR
    const maxAnnualDebtService = netOperatingIncome / targetDSCR;
    const maxMonthlyPayment = maxAnnualDebtService / 12;
    const monthlyRate = (interestRate / 100) / 12;
    const numPayments = amortization * 12;
    const maxLoanByDSCR = monthlyRate > 0 
      ? maxMonthlyPayment * (Math.pow(1 + monthlyRate, numPayments) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, numPayments))
      : maxMonthlyPayment * numPayments;

    // Max Loan based on LTV
    const maxLoanByLTV = propertyValue * (maxLTV / 100);

    // Constrained Max Loan
    const maxLoanAmount = Math.min(maxLoanByDSCR, maxLoanByLTV);
    const constrainingFactor = maxLoanByDSCR < maxLoanByLTV ? 'DSCR' : 'LTV';

    // Actual loan metrics
    const monthlyPayment = calculateMonthlyPayment(maxLoanAmount, interestRate, amortization);
    const annualDebtService = monthlyPayment * 12;
    const actualDSCR = annualDebtService > 0 ? netOperatingIncome / annualDebtService : 0;
    const actualLTV = propertyValue > 0 ? (maxLoanAmount / propertyValue) * 100 : 0;

    // Down Payment Required
    const downPaymentRequired = purchasePrice - maxLoanAmount;

    // Cash Flow After Debt Service
    const cashFlowAfterDebt = netOperatingIncome - annualDebtService;
    const cashOnCash = downPaymentRequired > 0 ? (cashFlowAfterDebt / downPaymentRequired) * 100 : 0;

    // Expense Ratio
    const expenseRatio = effectiveGrossIncome > 0 ? (totalOperatingExpenses / effectiveGrossIncome) * 100 : 0;

    return {
      grossPotentialIncome,
      vacancyLoss,
      effectiveGrossIncome,
      totalOperatingExpenses,
      managementExpense,
      reserveExpense,
      expenseRatio,
      netOperatingIncome,
      capRate,
      maxLoanByDSCR,
      maxLoanByLTV,
      maxLoanAmount,
      constrainingFactor,
      monthlyPayment,
      annualDebtService,
      actualDSCR,
      actualLTV,
      downPaymentRequired,
      cashFlowAfterDebt,
      cashOnCash,
      propertyValue,
      purchasePrice,
    };
  }, [inputs]);

  const handleSaveAnalysis = () => {
    if (!outputs) return;
    const analysisData = {
      type: 'cre-loan-sizer',
      inputs: { propertyValue: outputs.propertyValue, purchasePrice: outputs.purchasePrice, noi: outputs.netOperatingIncome },
      outputs: { maxLoanAmount: outputs.maxLoanAmount, dscr: outputs.actualDSCR, ltv: outputs.actualLTV, capRate: outputs.capRate },
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('pendingCREAnalysis', JSON.stringify(analysisData));
    window.location.href = '/api/auth/signin?callbackUrl=/app/deals/new';
  };

  const getStatusColor = (value: number, goodThreshold: number, isHigherBetter: boolean = true) => {
    if (isHigherBetter) {
      return value >= goodThreshold ? 'text-sgf-green-600' : value >= goodThreshold * 0.9 ? 'text-sgf-gold-600' : 'text-red-600';
    }
    return value <= goodThreshold ? 'text-sgf-green-600' : value <= goodThreshold * 1.1 ? 'text-sgf-gold-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sgf-green-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-sgf-green-600 via-sgf-green-700 to-sgf-green-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Free Calculator
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">CRE Loan Sizer</h1>
              <p className="text-sgf-green-100 mt-2 max-w-2xl mx-auto">Size commercial real estate loans based on NOI, DSCR, and LTV constraints</p>
            </div>
          </div>
        </div>

        {/* Input Cards */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          
          {/* Property Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Property</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs font-semibold text-gray-600">Property Value</label>
                  <Tooltip content="The appraised or estimated market value of the property. Lenders use this to calculate LTV (Loan-to-Value). Get a professional appraisal for accurate financing." />
                </div>
                <CurrencyInput prefix="$" value={inputs.propertyValue} onChange={(v) => handleInputChange('propertyValue', v)} />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs font-semibold text-gray-600">Purchase Price</label>
                  <Tooltip content="The negotiated purchase price. May differ from appraised value. If purchase price exceeds appraised value, lenders will use the lower value for LTV calculations." />
                </div>
                <CurrencyInput prefix="$" value={inputs.purchasePrice} onChange={(v) => handleInputChange('purchasePrice', v)} />
              </div>
            </div>
          </div>

          {/* Income */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Income</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs font-semibold text-gray-600">Gross Potential Rent</label>
                  <Tooltip content="Total annual rent if 100% occupied at market rates. Include all units at their scheduled or market rent. This is your maximum potential rental income." />
                </div>
                <CurrencyInput prefix="$" value={inputs.grossPotentialRent} onChange={(v) => handleInputChange('grossPotentialRent', v)} />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs font-semibold text-gray-600">Other Income</label>
                  <Tooltip content="Additional income beyond rent: parking fees, laundry, storage, vending, late fees, pet fees, application fees, etc. Be conservative - lenders may discount this." />
                </div>
                <CurrencyInput prefix="$" value={inputs.otherIncome} onChange={(v) => handleInputChange('otherIncome', v)} />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs font-semibold text-gray-600">Vacancy Rate</label>
                  <Tooltip content="Expected vacancy and collection loss percentage. Market standard is 5-10%. Lenders typically require minimum 5% even for fully occupied properties to account for turnover." />
                </div>
                <CurrencyInput suffix="%" decimals={2} value={inputs.vacancyRate} onChange={(v) => handleInputChange('vacancyRate', v)} />
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Expenses</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs font-semibold text-gray-600">Operating Expenses</label>
                  <Tooltip content="Annual operating costs: utilities, repairs, maintenance, landscaping, cleaning, supplies, advertising, legal, accounting, etc. Does NOT include debt service, depreciation, or income taxes." />
                </div>
                <CurrencyInput prefix="$" value={inputs.operatingExpenses} onChange={(v) => handleInputChange('operatingExpenses', v)} />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs font-semibold text-gray-600">Property Taxes</label>
                  <Tooltip content="Annual real estate property taxes. Check county assessor records. Note: taxes may increase after purchase based on new assessed value - factor this into projections." />
                </div>
                <CurrencyInput prefix="$" value={inputs.propertyTaxes} onChange={(v) => handleInputChange('propertyTaxes', v)} />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs font-semibold text-gray-600">Insurance</label>
                  <Tooltip content="Annual property insurance premium. Include hazard, liability, flood (if required), and any other required coverage. Get quotes - costs vary significantly by location and property type." />
                </div>
                <CurrencyInput prefix="$" value={inputs.insurance} onChange={(v) => handleInputChange('insurance', v)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="text-xs font-semibold text-gray-600">Mgmt %</label>
                    <Tooltip content="Property management fee as % of Effective Gross Income. Self-managed: 0%. Professional management: typically 4-10% depending on property size and type." />
                  </div>
                  <CurrencyInput suffix="%" decimals={2} value={inputs.managementFee} onChange={(v) => handleInputChange('managementFee', v)} />
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="text-xs font-semibold text-gray-600">Reserves</label>
                    <Tooltip content="Capital replacement reserves as % of EGI. Set aside for major repairs: roof, HVAC, parking lot, appliances. Lenders typically require 2-5%. Industry standard is 3%." />
                  </div>
                  <CurrencyInput suffix="%" decimals={2} value={inputs.reserves} onChange={(v) => handleInputChange('reserves', v)} />
                </div>
              </div>
            </div>
          </div>

          {/* Loan Terms */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Loan Terms</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs font-semibold text-gray-600">Interest Rate</label>
                  <Tooltip content="Expected annual interest rate. Commercial rates vary by property type, borrower strength, and market conditions. Currently ranging 6.5-9% for most commercial properties." />
                </div>
                <CurrencyInput suffix="%" decimals={2} value={inputs.interestRate} onChange={(v) => handleInputChange('interestRate', v)} />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs font-semibold text-gray-600">Amortization</label>
                  <Tooltip content="Loan amortization period in years. Commercial loans typically amortize over 20-30 years (longer = lower payments). Note: loan term may be shorter (e.g., 10-year term with 25-year amortization = balloon payment)." />
                </div>
                <CurrencyInput suffix="yrs" value={inputs.amortization} onChange={(v) => handleInputChange('amortization', v)} />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs font-semibold text-gray-600">Target DSCR</label>
                  <Tooltip content="Debt Service Coverage Ratio required by lender. Most lenders require 1.20-1.35x minimum. Higher DSCR = lower max loan amount but safer deal. SBA 504 requires 1.15x." />
                </div>
                <CurrencyInput suffix="x" decimals={2} value={inputs.targetDSCR} onChange={(v) => handleInputChange('targetDSCR', v)} />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs font-semibold text-gray-600">Max LTV</label>
                  <Tooltip content="Maximum Loan-to-Value ratio. Conventional: 65-75%. SBA 504: up to 90%. Lower LTV = more equity required but better rates. Lenders use lower of purchase price or appraised value." />
                </div>
                <CurrencyInput suffix="%" decimals={2} value={inputs.maxLTV} onChange={(v) => handleInputChange('maxLTV', v)} />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <GatedCalculator requiredPlan="core" calculatorSlug="cre-loan-sizer">
        {outputs && (
          <>
            {/* Max Loan Summary */}
            <div className="bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 rounded-xl p-6 mb-8 text-white">
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="text-sgf-green-100 text-sm">Max Loan Amount</div>
                    <Tooltip content="The maximum loan you can get based on BOTH DSCR and LTV constraints. Lenders will use the lower of the two calculations." />
                  </div>
                  <div className="text-3xl font-bold">{formatCurrency(outputs.maxLoanAmount)}</div>
                  <div className="text-xs text-sgf-green-100 mt-1">Constrained by {outputs.constrainingFactor}</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="text-sgf-green-100 text-sm">Net Operating Income</div>
                    <Tooltip content="NOI = Effective Gross Income - Total Operating Expenses. This is the property's income before debt service. The key metric lenders use to size loans." />
                  </div>
                  <div className="text-2xl font-bold">{formatCurrency(outputs.netOperatingIncome)}</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="text-sgf-green-100 text-sm">DSCR</div>
                    <Tooltip content="Actual Debt Service Coverage Ratio at max loan amount. Shows how many times NOI covers the annual debt payments. Should meet or exceed lender's target DSCR." />
                  </div>
                  <div className="text-2xl font-bold">{outputs.actualDSCR.toFixed(2)}x</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="text-sgf-green-100 text-sm">LTV</div>
                    <Tooltip content="Actual Loan-to-Value ratio at max loan amount. Shows what percentage of property value is being financed. Lower LTV = more equity / less risk." />
                  </div>
                  <div className="text-2xl font-bold">{outputs.actualLTV.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              
              {/* Income Statement */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-sgf-green-50 to-white">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">Income Statement</h3>
                    <Tooltip content="Pro forma operating statement showing how rental income flows to NOI after vacancy and expenses." />
                  </div>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross Potential Income</span>
                    <span className="font-mono">{formatCurrency(outputs.grossPotentialIncome)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Less: Vacancy ({inputs.vacancyRate}%)</span>
                    <span className="font-mono">({formatCurrency(outputs.vacancyLoss)})</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-900 font-semibold">Effective Gross Income</span>
                    <span className="font-mono font-semibold">{formatCurrency(outputs.effectiveGrossIncome)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Less: Operating Expenses</span>
                    <span className="font-mono">({formatCurrency(outputs.totalOperatingExpenses)})</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 bg-sgf-green-50 px-2 py-1 rounded">
                    <span className="text-sgf-green-700 font-bold">Net Operating Income</span>
                    <span className="font-mono font-bold text-sgf-green-700">{formatCurrency(outputs.netOperatingIncome)}</span>
                  </div>
                </div>
              </div>

              {/* Loan Sizing */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-sgf-gold-50 to-white">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">Loan Sizing</h3>
                    <Tooltip content="Shows how both DSCR and LTV constraints limit the maximum loan. The lower constraint wins." />
                  </div>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Max by DSCR ({inputs.targetDSCR}x)</span>
                      <Tooltip content="Maximum loan where NOI ÷ Annual Debt Service = Target DSCR" />
                    </div>
                    <span className="font-mono">{formatCurrency(outputs.maxLoanByDSCR)}</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Max by LTV ({inputs.maxLTV}%)</span>
                      <Tooltip content="Maximum loan = Property Value × Max LTV%" />
                    </div>
                    <span className="font-mono">{formatCurrency(outputs.maxLoanByLTV)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 bg-sgf-gold-50 px-2 py-1 rounded">
                    <span className="text-sgf-gold-700 font-bold">Max Loan</span>
                    <span className="font-mono font-bold text-sgf-gold-700">{formatCurrency(outputs.maxLoanAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-gray-600">Monthly Payment</span>
                    <span className="font-mono">{formatCurrency(outputs.monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Debt Service</span>
                    <span className="font-mono">{formatCurrency(outputs.annualDebtService)}</span>
                  </div>
                </div>
              </div>

              {/* Investment Returns */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">Investment Returns</h3>
                    <Tooltip content="Key return metrics showing the investment performance at the max loan amount." />
                  </div>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Down Payment Required</span>
                      <Tooltip content="Purchase Price minus Max Loan Amount. This is the equity you need to bring to close." />
                    </div>
                    <span className="font-mono font-semibold">{formatCurrency(outputs.downPaymentRequired)}</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Cash Flow After Debt</span>
                      <Tooltip content="NOI minus Annual Debt Service. This is your annual pre-tax cash flow from the property." />
                    </div>
                    <span className={`font-mono font-semibold ${outputs.cashFlowAfterDebt >= 0 ? 'text-sgf-green-600' : 'text-red-600'}`}>{formatCurrency(outputs.cashFlowAfterDebt)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Cash-on-Cash Return</span>
                      <Tooltip content="Annual Cash Flow ÷ Down Payment. Shows the return on your actual cash invested. 8-12% is typical for stabilized properties." />
                    </div>
                    <span className={`font-mono font-semibold ${getStatusColor(outputs.cashOnCash, 8)}`}>{outputs.cashOnCash.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Cap Rate</span>
                      <Tooltip content="NOI ÷ Property Value. Shows the property's unleveraged return. Lower cap rate = higher price relative to income. Market cap rates vary by location and property type." />
                    </div>
                    <span className="font-mono font-semibold">{outputs.capRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Expense Ratio</span>
                      <Tooltip content="Total Operating Expenses ÷ Effective Gross Income. Shows what percentage of income goes to expenses. Typical range: 35-50% depending on property type." />
                    </div>
                    <span className="font-mono">{outputs.expenseRatio.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save CTA */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Save This Analysis</h3>
                  <p className="text-sm text-gray-600">Create a free account to save and export professional reports</p>
                </div>
                <button onClick={handleSaveAnalysis} className="inline-flex items-center gap-2 bg-gradient-to-r from-sgf-green-600 to-sgf-green-700 hover:from-sgf-green-700 hover:to-sgf-green-800 text-white px-6 py-3 rounded-lg font-bold shadow-lg">
                  <Save className="w-5 h-5" />Save Analysis
                </button>
              </div>
            </div>
          </>
        )}
        </GatedCalculator>

        <PremiumProductsCTA />

        {/* Financing CTA */}
        <div className="mt-12 bg-gradient-to-r from-sgf-green-600 via-sgf-green-700 to-sgf-green-800 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-4">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />CRE Financing
              </div>
              <h2 className="text-2xl font-bold mb-3">Finance Your Commercial Property</h2>
              <p className="text-sgf-green-100 max-w-lg">Starting Gate Financial offers competitive commercial real estate financing including bridge loans, permanent financing, and SBA 504 loans for owner-occupied properties.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://startinggatefinancial.com/apply" className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-sgf-gold-600"><FileText className="w-5 h-5" />Apply for Financing</a>
              <a href="https://startinggatefinancial.com/contact" className="inline-flex items-center gap-2 bg-white/10 border-2 border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20"><MessageSquare className="w-5 h-5" />Schedule Call</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}