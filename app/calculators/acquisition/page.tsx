'use client';

import { useState, useMemo } from 'react';
import { DollarSign, Calculator, TrendingUp, BarChart3, FileText, MessageSquare, Save, PieChart, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import PremiumProductsCTA from '@/components/core/PremiumProductsCTA';

interface AcquisitionInputs {
  // Purchase Structure
  purchasePrice: string;
  downPayment: string;
  sellerFinancing: string;
  sellerFinancingRate: string;
  sellerFinancingTerm: string;
  // Bank Loan
  bankLoanRate: string;
  bankLoanTerm: string;
  // Business Financials
  annualRevenue: string;
  annualSDE: string;
  annualCapex: string;
  // Growth Assumptions
  revenueGrowthRate: string;
  sdeMarginChange: string;
  businessAppreciationRate: string;
}

const defaultInputs: AcquisitionInputs = {
  purchasePrice: '1,000,000',
  downPayment: '200,000',
  sellerFinancing: '100,000',
  sellerFinancingRate: '6',
  sellerFinancingTerm: '5',
  bankLoanRate: '8',
  bankLoanTerm: '10',
  annualRevenue: '1,500,000',
  annualSDE: '300,000',
  annualCapex: '25,000',
  revenueGrowthRate: '3',
  sdeMarginChange: '0',
  businessAppreciationRate: '3',
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

export default function AcquisitionAnalyzerPage() {
  const [inputs, setInputs] = useState<AcquisitionInputs>(defaultInputs);
  const [activeTab, setActiveTab] = useState<'summary' | 'equity' | 'scenarios'>('summary');

  const handleCurrencyInput = (field: keyof AcquisitionInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: formatInputValue(value) }));
  };

  const handlePercentInput = (field: keyof AcquisitionInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Calculate all outputs
  const outputs = useMemo(() => {
    const purchasePrice = parseCurrencyInput(inputs.purchasePrice);
    const downPayment = parseCurrencyInput(inputs.downPayment);
    const sellerFinancing = parseCurrencyInput(inputs.sellerFinancing);
    const sellerFinancingRate = parseFloat(inputs.sellerFinancingRate) || 0;
    const sellerFinancingTerm = parseInt(inputs.sellerFinancingTerm) || 0;
    const bankLoanRate = parseFloat(inputs.bankLoanRate) || 0;
    const bankLoanTerm = parseInt(inputs.bankLoanTerm) || 0;
    const annualRevenue = parseCurrencyInput(inputs.annualRevenue);
    const annualSDE = parseCurrencyInput(inputs.annualSDE);
    const annualCapex = parseCurrencyInput(inputs.annualCapex);
    const revenueGrowthRate = parseFloat(inputs.revenueGrowthRate) || 0;
    const businessAppreciationRate = parseFloat(inputs.businessAppreciationRate) || 0;

    if (!purchasePrice || !annualSDE) return null;

    // Calculate loan amounts
    const bankLoanAmount = purchasePrice - downPayment - sellerFinancing;
    
    // Monthly payments
    const bankMonthlyPayment = calculateMonthlyPayment(bankLoanAmount, bankLoanRate, bankLoanTerm);
    const sellerMonthlyPayment = calculateMonthlyPayment(sellerFinancing, sellerFinancingRate, sellerFinancingTerm);
    
    // Annual debt service
    const bankAnnualDebtService = bankMonthlyPayment * 12;
    const sellerAnnualDebtService = sellerMonthlyPayment * 12;
    const totalAnnualDebtService = bankAnnualDebtService + sellerAnnualDebtService;

    // Cash flow
    const lendableCashFlow = annualSDE - annualCapex;
    const annualPreTaxCashFlow = lendableCashFlow - totalAnnualDebtService;

    // Key ratios
    const dscr = totalAnnualDebtService > 0 ? lendableCashFlow / totalAnnualDebtService : 0;
    const cashOnCashReturn = downPayment > 0 ? (annualPreTaxCashFlow / downPayment) * 100 : 0;
    const sdeMultiple = annualSDE > 0 ? purchasePrice / annualSDE : 0;
    const paybackPeriod = annualPreTaxCashFlow > 0 ? downPayment / annualPreTaxCashFlow : 0;

    // Generate 10-year equity schedule
    const equitySchedule = [];
    let currentBankBalance = bankLoanAmount;
    let currentSellerBalance = sellerFinancing;
    let currentBusinessValue = purchasePrice;
    const bankMonthlyRate = (bankLoanRate / 100) / 12;
    const sellerMonthlyRate = (sellerFinancingRate / 100) / 12;

    for (let year = 0; year <= 10; year++) {
      const totalDebt = currentBankBalance + currentSellerBalance;
      const ownerEquity = currentBusinessValue - totalDebt;
      const equityPercent = currentBusinessValue > 0 ? (ownerEquity / currentBusinessValue) * 100 : 0;

      equitySchedule.push({
        year,
        businessValue: currentBusinessValue,
        bankDebt: currentBankBalance,
        sellerDebt: currentSellerBalance,
        totalDebt,
        ownerEquity,
        equityPercent,
      });

      // Calculate balances for next year (12 months of payments)
      for (let month = 0; month < 12; month++) {
        if (currentBankBalance > 0 && year < bankLoanTerm) {
          const bankInterest = currentBankBalance * bankMonthlyRate;
          const bankPrincipal = bankMonthlyPayment - bankInterest;
          currentBankBalance = Math.max(0, currentBankBalance - bankPrincipal);
        }
        if (currentSellerBalance > 0 && year < sellerFinancingTerm) {
          const sellerInterest = currentSellerBalance * sellerMonthlyRate;
          const sellerPrincipal = sellerMonthlyPayment - sellerInterest;
          currentSellerBalance = Math.max(0, currentSellerBalance - sellerPrincipal);
        }
      }
      
      // Appreciate business value
      currentBusinessValue = currentBusinessValue * (1 + businessAppreciationRate / 100);
    }

    // Scenarios
    const baseCase = { cashOnCashReturn, dscr, annualPreTaxCashFlow };
    
    const bestCaseSDE = annualSDE * 1.15;
    const bestCaseCashFlow = (bestCaseSDE - annualCapex) - totalAnnualDebtService;
    const bestCase = {
      cashOnCashReturn: downPayment > 0 ? (bestCaseCashFlow / downPayment) * 100 : 0,
      dscr: totalAnnualDebtService > 0 ? (bestCaseSDE - annualCapex) / totalAnnualDebtService : 0,
      annualPreTaxCashFlow: bestCaseCashFlow,
    };

    const worstCaseSDE = annualSDE * 0.85;
    const worstCaseCashFlow = (worstCaseSDE - annualCapex) - totalAnnualDebtService;
    const worstCase = {
      cashOnCashReturn: downPayment > 0 ? (worstCaseCashFlow / downPayment) * 100 : 0,
      dscr: totalAnnualDebtService > 0 ? (worstCaseSDE - annualCapex) / totalAnnualDebtService : 0,
      annualPreTaxCashFlow: worstCaseCashFlow,
    };

    return {
      // Purchase Structure
      purchasePrice,
      downPayment,
      bankLoanAmount,
      sellerFinancing,
      // Debt Service
      bankAnnualDebtService,
      sellerAnnualDebtService,
      totalAnnualDebtService,
      // Cash Flow
      lendableCashFlow,
      annualPreTaxCashFlow,
      // Key Ratios
      dscr,
      cashOnCashReturn,
      sdeMultiple,
      paybackPeriod,
      // Equity Schedule
      equitySchedule,
      // Scenarios
      scenarios: { baseCase, bestCase, worstCase },
    };
  }, [inputs]);

  const handleSaveAnalysis = () => {
    if (!outputs) {
      alert('Please enter deal details first');
      return;
    }

    const analysisData = {
      type: 'acquisition',
      inputs: {
        ...inputs,
        // Convert string values to numbers for storage
        purchasePrice: parseCurrencyInput(inputs.purchasePrice),
        downPayment: parseCurrencyInput(inputs.downPayment),
      },
      outputs: {
        dscr: outputs.dscr,
        cashOnCashReturn: outputs.cashOnCashReturn,
        annualPreTaxCashFlow: outputs.annualPreTaxCashFlow,
        sdeMultiple: outputs.sdeMultiple,
      },
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('pendingAcquisitionAnalysis', JSON.stringify(analysisData));
    window.location.href = '/api/auth/signin?callbackUrl=/app/deals/new';
  };

  const getDSCRStatus = (dscr: number) => {
    if (dscr >= 1.25) return { color: 'text-sgf-green-600', bg: 'bg-sgf-green-50', border: 'border-sgf-green-200', label: 'Strong' };
    if (dscr >= 1.0) return { color: 'text-sgf-gold-600', bg: 'bg-sgf-gold-50', border: 'border-sgf-gold-200', label: 'Marginal' };
    return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Weak' };
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
                Pro Calculator
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Acquisition Analyzer</h1>
              <p className="text-sgf-green-100 mt-2 max-w-2xl mx-auto">
                Comprehensive deal analysis with ROI projections, equity build-up, and scenario modeling
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Purchase Structure */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Purchase Structure</span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Purchase Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="text"
                    value={inputs.purchasePrice}
                    onChange={(e) => handleCurrencyInput('purchasePrice', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-green-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Down Payment</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="text"
                    value={inputs.downPayment}
                    onChange={(e) => handleCurrencyInput('downPayment', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-green-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Seller Financing</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="text"
                    value={inputs.sellerFinancing}
                    onChange={(e) => handleCurrencyInput('sellerFinancing', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-green-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Seller Rate</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={inputs.sellerFinancingRate}
                      onChange={(e) => handlePercentInput('sellerFinancingRate', e.target.value)}
                      className="w-full pr-8 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Seller Term</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={inputs.sellerFinancingTerm}
                      onChange={(e) => handlePercentInput('sellerFinancingTerm', e.target.value)}
                      className="w-full pr-10 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">yrs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Loan Terms */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Bank Loan Terms</span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {outputs && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="text-xs text-gray-500 mb-1">Bank Loan Amount</div>
                  <div className="text-xl font-bold font-mono text-sgf-green-600">{formatCurrency(outputs.bankLoanAmount)}</div>
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Interest Rate</label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputs.bankLoanRate}
                    onChange={(e) => handlePercentInput('bankLoanRate', e.target.value)}
                    className="w-full pr-8 pl-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-gold-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Loan Term</label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputs.bankLoanTerm}
                    onChange={(e) => handlePercentInput('bankLoanTerm', e.target.value)}
                    className="w-full pr-12 pl-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-gold-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">years</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Business Financials */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Business Financials</span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Annual Revenue</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="text"
                    value={inputs.annualRevenue}
                    onChange={(e) => handleCurrencyInput('annualRevenue', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-green-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Annual SDE / EBITDA</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="text"
                    value={inputs.annualSDE}
                    onChange={(e) => handleCurrencyInput('annualSDE', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-green-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Annual CAPEX</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="text"
                    value={inputs.annualCapex}
                    onChange={(e) => handleCurrencyInput('annualCapex', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-green-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {outputs && (
          <>
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className={`rounded-xl p-5 border ${getDSCRStatus(outputs.dscr).bg} ${getDSCRStatus(outputs.dscr).border}`}>
                <div className="text-sm font-medium text-gray-600 mb-1">DSCR</div>
                <div className={`text-3xl font-bold font-mono ${getDSCRStatus(outputs.dscr).color}`}>
                  {outputs.dscr.toFixed(2)}x
                </div>
                <div className={`text-xs font-semibold mt-1 ${getDSCRStatus(outputs.dscr).color}`}>
                  {getDSCRStatus(outputs.dscr).label}
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="text-sm font-medium text-gray-600 mb-1">Cash-on-Cash Return</div>
                <div className={`text-3xl font-bold font-mono ${outputs.cashOnCashReturn >= 15 ? 'text-sgf-green-600' : outputs.cashOnCashReturn >= 10 ? 'text-sgf-gold-600' : 'text-red-600'}`}>
                  {outputs.cashOnCashReturn.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Annual return on cash invested</div>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="text-sm font-medium text-gray-600 mb-1">Pre-Tax Cash Flow</div>
                <div className={`text-3xl font-bold font-mono ${outputs.annualPreTaxCashFlow >= 0 ? 'text-sgf-green-600' : 'text-red-600'}`}>
                  {formatCurrency(outputs.annualPreTaxCashFlow)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Annual cash flow after debt service</div>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="text-sm font-medium text-gray-600 mb-1">SDE Multiple</div>
                <div className="text-3xl font-bold font-mono text-gray-900">
                  {outputs.sdeMultiple.toFixed(2)}x
                </div>
                <div className="text-xs text-gray-500 mt-1">Purchase price / SDE</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {[
                    { id: 'summary', label: 'Deal Summary', icon: Target },
                    { id: 'equity', label: 'Equity Build-Up', icon: TrendingUp },
                    { id: 'scenarios', label: 'Scenarios', icon: PieChart },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${
                          activeTab === tab.id
                            ? 'border-sgf-green-500 text-sgf-green-600 bg-sgf-green-50/50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'summary' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Sources of Funds</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                          <span className="text-gray-600">Down Payment</span>
                          <span className="font-mono font-semibold">{formatCurrency(outputs.downPayment)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                          <span className="text-gray-600">Bank Loan</span>
                          <span className="font-mono font-semibold">{formatCurrency(outputs.bankLoanAmount)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                          <span className="text-gray-600">Seller Financing</span>
                          <span className="font-mono font-semibold">{formatCurrency(outputs.sellerFinancing)}</span>
                        </div>
                        <div className="flex justify-between py-2 bg-gray-50 rounded px-2">
                          <span className="font-semibold text-gray-900">Total</span>
                          <span className="font-mono font-bold text-sgf-green-600">{formatCurrency(outputs.purchasePrice)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Annual Cash Flow</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                          <span className="text-gray-600">Lendable Cash Flow</span>
                          <span className="font-mono font-semibold text-sgf-green-600">{formatCurrency(outputs.lendableCashFlow)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                          <span className="text-gray-600">Bank Debt Service</span>
                          <span className="font-mono font-semibold text-red-500">({formatCurrency(outputs.bankAnnualDebtService)})</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                          <span className="text-gray-600">Seller Debt Service</span>
                          <span className="font-mono font-semibold text-red-500">({formatCurrency(outputs.sellerAnnualDebtService)})</span>
                        </div>
                        <div className="flex justify-between py-2 bg-gray-50 rounded px-2">
                          <span className="font-semibold text-gray-900">Pre-Tax Cash Flow</span>
                          <span className={`font-mono font-bold ${outputs.annualPreTaxCashFlow >= 0 ? 'text-sgf-green-600' : 'text-red-600'}`}>
                            {formatCurrency(outputs.annualPreTaxCashFlow)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'equity' && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Year</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Business Value</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total Debt</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Owner Equity</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Equity %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {outputs.equitySchedule.map((row) => (
                          <tr key={row.year} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.year === 0 ? 'Start' : `Year ${row.year}`}</td>
                            <td className="px-4 py-3 text-sm text-right font-mono">{formatCurrency(row.businessValue)}</td>
                            <td className="px-4 py-3 text-sm text-right font-mono text-red-600">{formatCurrency(row.totalDebt)}</td>
                            <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-sgf-green-600">{formatCurrency(row.ownerEquity)}</td>
                            <td className="px-4 py-3 text-sm text-right font-mono">{row.equityPercent.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'scenarios' && (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                      <div className="flex items-center gap-2 mb-4">
                        <ArrowDownRight className="w-5 h-5 text-red-600" />
                        <h3 className="font-semibold text-red-900">Worst Case (-15% SDE)</h3>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-red-600 mb-1">Cash-on-Cash Return</div>
                          <div className="text-2xl font-bold font-mono text-red-700">{outputs.scenarios.worstCase.cashOnCashReturn.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-red-600 mb-1">DSCR</div>
                          <div className="text-2xl font-bold font-mono text-red-700">{outputs.scenarios.worstCase.dscr.toFixed(2)}x</div>
                        </div>
                        <div>
                          <div className="text-xs text-red-600 mb-1">Annual Cash Flow</div>
                          <div className="text-xl font-bold font-mono text-red-700">{formatCurrency(outputs.scenarios.worstCase.annualPreTaxCashFlow)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">Base Case</h3>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Cash-on-Cash Return</div>
                          <div className="text-2xl font-bold font-mono text-gray-900">{outputs.scenarios.baseCase.cashOnCashReturn.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">DSCR</div>
                          <div className="text-2xl font-bold font-mono text-gray-900">{outputs.scenarios.baseCase.dscr.toFixed(2)}x</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Annual Cash Flow</div>
                          <div className="text-xl font-bold font-mono text-gray-900">{formatCurrency(outputs.scenarios.baseCase.annualPreTaxCashFlow)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-sgf-green-50 rounded-xl p-5 border border-sgf-green-200">
                      <div className="flex items-center gap-2 mb-4">
                        <ArrowUpRight className="w-5 h-5 text-sgf-green-600" />
                        <h3 className="font-semibold text-sgf-green-900">Best Case (+15% SDE)</h3>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-sgf-green-600 mb-1">Cash-on-Cash Return</div>
                          <div className="text-2xl font-bold font-mono text-sgf-green-700">{outputs.scenarios.bestCase.cashOnCashReturn.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-sgf-green-600 mb-1">DSCR</div>
                          <div className="text-2xl font-bold font-mono text-sgf-green-700">{outputs.scenarios.bestCase.dscr.toFixed(2)}x</div>
                        </div>
                        <div>
                          <div className="text-xs text-sgf-green-600 mb-1">Annual Cash Flow</div>
                          <div className="text-xl font-bold font-mono text-sgf-green-700">{formatCurrency(outputs.scenarios.bestCase.annualPreTaxCashFlow)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Save CTA */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Save This Analysis</h3>
                  <p className="text-sm text-gray-600">Create a free account to save, compare scenarios, and export reports</p>
                </div>
                <button 
                  onClick={handleSaveAnalysis}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sgf-green-600 to-sgf-green-700 hover:from-sgf-green-700 hover:to-sgf-green-800 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  <Save className="w-5 h-5" />
                  Save Analysis
                </button>
              </div>
            </div>
          </>
        )}

        {/* Premium Products CTA */}
        <PremiumProductsCTA />

        {/* Financing CTA */}
        <div className="mt-12 bg-gradient-to-r from-sgf-green-600 via-sgf-green-700 to-sgf-green-800 rounded-2xl p-8 md:p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-4">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Ready to Finance?
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Get Your Deal Funded Today</h2>
              <p className="text-sgf-green-100 max-w-lg">
                Connect with Starting Gate Financial for competitive business acquisition loans, 
                SBA 7(a) financing, and commercial real estate solutions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://startinggatefinancial.com/apply" className="inline-flex items-center justify-center gap-2 bg-sgf-gold-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-sgf-gold-600 transition-colors shadow-lg">
                <FileText className="w-5 h-5" />
                Apply for Financing
              </a>
              <a href="https://startinggatefinancial.com/contact" className="inline-flex items-center justify-center gap-2 bg-white/10 border-2 border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors">
                <MessageSquare className="w-5 h-5" />
                Schedule Call
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
