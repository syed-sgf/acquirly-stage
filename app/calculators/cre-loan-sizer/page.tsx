'use client';

import { useState, useMemo } from 'react';
import { DollarSign, Building2, Calculator, BarChart3, FileText, MessageSquare, Save, Percent, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import PremiumProductsCTA from '@/components/core/PremiumProductsCTA';

interface CREInputs {
  // Property Details
  propertyValue: string;
  purchasePrice: string;
  // Income
  grossPotentialRent: string;
  otherIncome: string;
  vacancyRate: string;
  // Expenses
  operatingExpenses: string;
  propertyTaxes: string;
  insurance: string;
  managementFee: string;
  reserves: string;
  // Loan Terms
  interestRate: string;
  amortization: string;
  loanTerm: string;
  // Lender Requirements
  targetDSCR: string;
  maxLTV: string;
}

const defaultInputs: CREInputs = {
  propertyValue: '2,000,000',
  purchasePrice: '1,900,000',
  grossPotentialRent: '240,000',
  otherIncome: '12,000',
  vacancyRate: '5',
  operatingExpenses: '48,000',
  propertyTaxes: '24,000',
  insurance: '8,000',
  managementFee: '5',
  reserves: '3',
  interestRate: '7.5',
  amortization: '25',
  loanTerm: '10',
  targetDSCR: '1.25',
  maxLTV: '75',
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const parseCurrencyInput = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
};

const formatInputValue = (value: string): string => {
  const num = parseCurrencyInput(value);
  if (isNaN(num) || num === 0) return value.replace(/[^0-9]/g, '');
  return num.toLocaleString('en-US');
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

  const handleCurrencyInput = (field: keyof CREInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: formatInputValue(value) }));
  };

  const handlePercentInput = (field: keyof CREInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const outputs = useMemo(() => {
    const propertyValue = parseCurrencyInput(inputs.propertyValue);
    const purchasePrice = parseCurrencyInput(inputs.purchasePrice);
    const grossPotentialRent = parseCurrencyInput(inputs.grossPotentialRent);
    const otherIncome = parseCurrencyInput(inputs.otherIncome);
    const vacancyRate = parseFloat(inputs.vacancyRate) || 0;
    const operatingExpenses = parseCurrencyInput(inputs.operatingExpenses);
    const propertyTaxes = parseCurrencyInput(inputs.propertyTaxes);
    const insurance = parseCurrencyInput(inputs.insurance);
    const managementFee = parseFloat(inputs.managementFee) || 0;
    const reserves = parseFloat(inputs.reserves) || 0;
    const interestRate = parseFloat(inputs.interestRate) || 0;
    const amortization = parseInt(inputs.amortization) || 25;
    const targetDSCR = parseFloat(inputs.targetDSCR) || 1.25;
    const maxLTV = parseFloat(inputs.maxLTV) || 75;

    if (!grossPotentialRent || !propertyValue) return null;

    // Income Calculations
    const effectiveGrossIncome = (grossPotentialRent + otherIncome) * (1 - vacancyRate / 100);
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
    const maxLoanByDSCR = maxMonthlyPayment * (Math.pow(1 + monthlyRate, numPayments) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, numPayments));

    // Max Loan based on LTV
    const maxLoanByLTV = propertyValue * (maxLTV / 100);

    // Constrained Max Loan (lower of DSCR or LTV)
    const maxLoanAmount = Math.min(maxLoanByDSCR, maxLoanByLTV);
    const constrainingFactor = maxLoanByDSCR < maxLoanByLTV ? 'DSCR' : 'LTV';

    // Actual loan metrics at max loan
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
      // Income
      grossPotentialIncome: grossPotentialRent + otherIncome,
      vacancyLoss: (grossPotentialRent + otherIncome) * (vacancyRate / 100),
      effectiveGrossIncome,
      // Expenses
      totalOperatingExpenses,
      managementExpense,
      reserveExpense,
      expenseRatio,
      // NOI
      netOperatingIncome,
      capRate,
      // Loan Sizing
      maxLoanByDSCR,
      maxLoanByLTV,
      maxLoanAmount,
      constrainingFactor,
      // Loan Metrics
      monthlyPayment,
      annualDebtService,
      actualDSCR,
      actualLTV,
      // Investment
      downPaymentRequired,
      cashFlowAfterDebt,
      cashOnCash,
      // Property
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
              <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
              <span className="font-semibold text-gray-900">Property</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Property Value</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="text" value={inputs.propertyValue} onChange={(e) => handleCurrencyInput('propertyValue', e.target.value)} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Purchase Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="text" value={inputs.purchasePrice} onChange={(e) => handleCurrencyInput('purchasePrice', e.target.value)} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Income */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center"><DollarSign className="w-5 h-5 text-white" /></div>
              <span className="font-semibold text-gray-900">Income</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Gross Potential Rent</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="text" value={inputs.grossPotentialRent} onChange={(e) => handleCurrencyInput('grossPotentialRent', e.target.value)} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Other Income</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="text" value={inputs.otherIncome} onChange={(e) => handleCurrencyInput('otherIncome', e.target.value)} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Vacancy Rate</label>
                <div className="relative">
                  <input type="text" value={inputs.vacancyRate} onChange={(e) => handlePercentInput('vacancyRate', e.target.value)} className="w-full pr-7 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center"><BarChart3 className="w-5 h-5 text-white" /></div>
              <span className="font-semibold text-gray-900">Expenses</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Operating Expenses</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="text" value={inputs.operatingExpenses} onChange={(e) => handleCurrencyInput('operatingExpenses', e.target.value)} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Property Taxes</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="text" value={inputs.propertyTaxes} onChange={(e) => handleCurrencyInput('propertyTaxes', e.target.value)} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Insurance</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="text" value={inputs.insurance} onChange={(e) => handleCurrencyInput('insurance', e.target.value)} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Mgmt %</label>
                  <div className="relative">
                    <input type="text" value={inputs.managementFee} onChange={(e) => handlePercentInput('managementFee', e.target.value)} className="w-full pr-6 pl-2 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none" />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Reserves %</label>
                  <div className="relative">
                    <input type="text" value={inputs.reserves} onChange={(e) => handlePercentInput('reserves', e.target.value)} className="w-full pr-6 pl-2 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none" />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loan Terms */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center"><Calculator className="w-5 h-5 text-white" /></div>
              <span className="font-semibold text-gray-900">Loan Terms</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Interest Rate</label>
                <div className="relative">
                  <input type="text" value={inputs.interestRate} onChange={(e) => handlePercentInput('interestRate', e.target.value)} className="w-full pr-7 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Amortization (yrs)</label>
                <input type="text" value={inputs.amortization} onChange={(e) => handlePercentInput('amortization', e.target.value)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Target DSCR</label>
                <input type="text" value={inputs.targetDSCR} onChange={(e) => handlePercentInput('targetDSCR', e.target.value)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Max LTV</label>
                <div className="relative">
                  <input type="text" value={inputs.maxLTV} onChange={(e) => handlePercentInput('maxLTV', e.target.value)} className="w-full pr-7 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {outputs && (
          <>
            {/* Max Loan Summary */}
            <div className="bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 rounded-xl p-6 mb-8 text-white">
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-sgf-green-100 text-sm mb-1">Max Loan Amount</div>
                  <div className="text-3xl font-bold">{formatCurrency(outputs.maxLoanAmount)}</div>
                  <div className="text-xs text-sgf-green-100 mt-1">Constrained by {outputs.constrainingFactor}</div>
                </div>
                <div>
                  <div className="text-sgf-green-100 text-sm mb-1">Net Operating Income</div>
                  <div className="text-2xl font-bold">{formatCurrency(outputs.netOperatingIncome)}</div>
                </div>
                <div>
                  <div className="text-sgf-green-100 text-sm mb-1">DSCR</div>
                  <div className="text-2xl font-bold">{outputs.actualDSCR.toFixed(2)}x</div>
                </div>
                <div>
                  <div className="text-sgf-green-100 text-sm mb-1">LTV</div>
                  <div className="text-2xl font-bold">{outputs.actualLTV.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Income Statement */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-sgf-green-50 to-white">
                  <h3 className="font-semibold text-gray-900">Income Statement</h3>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Gross Potential Income</span><span className="font-mono">{formatCurrency(outputs.grossPotentialIncome)}</span></div>
                  <div className="flex justify-between text-red-600"><span>Less: Vacancy</span><span className="font-mono">({formatCurrency(outputs.vacancyLoss)})</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="text-gray-900 font-semibold">Effective Gross Income</span><span className="font-mono font-semibold">{formatCurrency(outputs.effectiveGrossIncome)}</span></div>
                  <div className="flex justify-between text-red-600"><span>Less: Operating Expenses</span><span className="font-mono">({formatCurrency(outputs.totalOperatingExpenses)})</span></div>
                  <div className="flex justify-between border-t pt-2 bg-sgf-green-50 px-2 py-1 rounded">
                    <span className="text-sgf-green-700 font-bold">Net Operating Income</span>
                    <span className="font-mono font-bold text-sgf-green-700">{formatCurrency(outputs.netOperatingIncome)}</span>
                  </div>
                </div>
              </div>

              {/* Loan Sizing */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-sgf-gold-50 to-white">
                  <h3 className="font-semibold text-gray-900">Loan Sizing</h3>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Max by DSCR ({inputs.targetDSCR}x)</span><span className="font-mono">{formatCurrency(outputs.maxLoanByDSCR)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Max by LTV ({inputs.maxLTV}%)</span><span className="font-mono">{formatCurrency(outputs.maxLoanByLTV)}</span></div>
                  <div className="flex justify-between border-t pt-2 bg-sgf-gold-50 px-2 py-1 rounded">
                    <span className="text-sgf-gold-700 font-bold">Max Loan</span>
                    <span className="font-mono font-bold text-sgf-gold-700">{formatCurrency(outputs.maxLoanAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-2"><span className="text-gray-600">Monthly Payment</span><span className="font-mono">{formatCurrency(outputs.monthlyPayment)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Annual Debt Service</span><span className="font-mono">{formatCurrency(outputs.annualDebtService)}</span></div>
                </div>
              </div>

              {/* Investment Returns */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                  <h3 className="font-semibold text-gray-900">Investment Returns</h3>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Down Payment Required</span><span className="font-mono font-semibold">{formatCurrency(outputs.downPaymentRequired)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Cash Flow After Debt</span><span className={`font-mono font-semibold ${outputs.cashFlowAfterDebt >= 0 ? 'text-sgf-green-600' : 'text-red-600'}`}>{formatCurrency(outputs.cashFlowAfterDebt)}</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="text-gray-600">Cash-on-Cash Return</span><span className={`font-mono font-semibold ${getStatusColor(outputs.cashOnCash, 8)}`}>{outputs.cashOnCash.toFixed(1)}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Cap Rate</span><span className="font-mono font-semibold">{outputs.capRate.toFixed(2)}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Expense Ratio</span><span className="font-mono">{outputs.expenseRatio.toFixed(1)}%</span></div>
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
              <p className="text-sgf-green-100 max-w-lg">Starting Gate Financial offers competitive commercial real estate financing including bridge loans, permanent financing, and SBA 504 loans.</p>
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
