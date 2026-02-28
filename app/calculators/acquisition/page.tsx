'use client';

import { useState, useMemo } from 'react';
import { DollarSign, Calculator, TrendingUp, BarChart3, FileText, MessageSquare, Save, PieChart, Target, ArrowUpRight, ArrowDownRight, Percent } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import PremiumProductsCTA from '@/components/core/PremiumProductsCTA';
import GatedCalculator from '@/components/core/GatedCalculator';
import CurrencyInput from '@/lib/components/CurrencyInput';

interface AcquisitionInputs {
  purchasePrice: number;
  downPayment: number;
  sellerFinancing: number;
  sellerFinancingRate: number;
  sellerFinancingTerm: number;
  bankLoanRate: number;
  bankLoanTerm: number;
  annualRevenue: number;
  annualSDE: number;
  annualCapex: number;
  revenueGrowthRate: number;
  sdeMarginChange: number;
  businessAppreciationRate: number;
  holdPeriod: number;
}

const defaultInputs: AcquisitionInputs = {
  purchasePrice: 1000000,
  downPayment: 200000,
  sellerFinancing: 100000,
  sellerFinancingRate: 6,
  sellerFinancingTerm: 5,
  bankLoanRate: 8,
  bankLoanTerm: 10,
  annualRevenue: 1500000,
  annualSDE: 300000,
  annualCapex: 25000,
  revenueGrowthRate: 3,
  sdeMarginChange: 0,
  businessAppreciationRate: 3,
  holdPeriod: 5,
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

// IRR Calculation using Newton-Raphson method
const calculateIRR = (cashFlows: number[], guess: number = 0.1): number => {
  const maxIterations = 100;
  const tolerance = 0.0001;
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let derivativeNpv = 0;

    for (let j = 0; j < cashFlows.length; j++) {
      npv += cashFlows[j] / Math.pow(1 + rate, j);
      if (j > 0) {
        derivativeNpv -= j * cashFlows[j] / Math.pow(1 + rate, j + 1);
      }
    }

    const newRate = rate - npv / derivativeNpv;
    
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate * 100; // Return as percentage
    }
    
    rate = newRate;
  }
  
  return rate * 100; // Return as percentage
};

export default function AcquisitionAnalyzerPage() {
  const [inputs, setInputs] = useState<AcquisitionInputs>(defaultInputs);
  const [activeTab, setActiveTab] = useState<'summary' | 'equity' | 'scenarios' | 'returns'>('summary');

  const handleInputChange = (field: keyof AcquisitionInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const outputs = useMemo(() => {
    const { purchasePrice, downPayment, sellerFinancing, sellerFinancingRate, sellerFinancingTerm,
      bankLoanRate, bankLoanTerm, annualRevenue, annualSDE, annualCapex,
      revenueGrowthRate, businessAppreciationRate } = inputs;
    const holdPeriod = inputs.holdPeriod || 5;

    if (!purchasePrice || !annualSDE) return null;

    const bankLoanAmount = purchasePrice - downPayment - sellerFinancing;
    const bankMonthlyPayment = calculateMonthlyPayment(bankLoanAmount, bankLoanRate, bankLoanTerm);
    const sellerMonthlyPayment = calculateMonthlyPayment(sellerFinancing, sellerFinancingRate, sellerFinancingTerm);
    const bankAnnualDebtService = bankMonthlyPayment * 12;
    const sellerAnnualDebtService = sellerMonthlyPayment * 12;
    const totalAnnualDebtService = bankAnnualDebtService + sellerAnnualDebtService;

    const lendableCashFlow = annualSDE - annualCapex;
    const annualPreTaxCashFlow = lendableCashFlow - totalAnnualDebtService;

    const dscr = totalAnnualDebtService > 0 ? lendableCashFlow / totalAnnualDebtService : 0;
    const cashOnCashReturn = downPayment > 0 ? (annualPreTaxCashFlow / downPayment) * 100 : 0;
    const sdeMultiple = annualSDE > 0 ? purchasePrice / annualSDE : 0;
    const paybackPeriod = annualPreTaxCashFlow > 0 ? downPayment / annualPreTaxCashFlow : 0;

    // Generate equity schedule and cash flows for IRR
    const equitySchedule = [];
    const annualCashFlows: number[] = [-downPayment]; // Initial investment (negative)
    
    let currentBankBalance = bankLoanAmount;
    let currentSellerBalance = sellerFinancing;
    let currentBusinessValue = purchasePrice;
    let currentSDE = annualSDE;
    const bankMonthlyRate = (bankLoanRate / 100) / 12;
    const sellerMonthlyRate = (sellerFinancingRate / 100) / 12;

    for (let year = 0; year <= 10; year++) {
      const totalDebt = currentBankBalance + currentSellerBalance;
      const ownerEquity = currentBusinessValue - totalDebt;
      const equityPercent = currentBusinessValue > 0 ? (ownerEquity / currentBusinessValue) * 100 : 0;

      // Calculate this year's cash flow (for years 1+)
      if (year > 0) {
        const yearDebtService = 
          (year <= bankLoanTerm ? bankAnnualDebtService : 0) + 
          (year <= sellerFinancingTerm ? sellerAnnualDebtService : 0);
        const yearCashFlow = (currentSDE - annualCapex) - yearDebtService;
        
        // If this is the exit year, add sale proceeds
        if (year === holdPeriod) {
          const saleProceeds = currentBusinessValue - totalDebt;
          annualCashFlows.push(yearCashFlow + saleProceeds);
        } else if (year < holdPeriod) {
          annualCashFlows.push(yearCashFlow);
        }
      }

      equitySchedule.push({
        year,
        businessValue: currentBusinessValue,
        bankDebt: currentBankBalance,
        sellerDebt: currentSellerBalance,
        totalDebt,
        ownerEquity,
        equityPercent,
        annualCashFlow: year > 0 ? annualCashFlows[year] || 0 : 0,
      });

      // Calculate balances for next year
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
      
      currentBusinessValue = currentBusinessValue * (1 + businessAppreciationRate / 100);
      currentSDE = currentSDE * (1 + revenueGrowthRate / 100);
    }

    // Calculate IRR
    const irr = calculateIRR(annualCashFlows);

    // Calculate Total ROI
    const exitYear = equitySchedule[holdPeriod];
    const totalCashFlowsReceived = annualCashFlows.slice(1).reduce((sum, cf) => sum + cf, 0);
    const totalROI = downPayment > 0 ? ((totalCashFlowsReceived - downPayment) / downPayment) * 100 : 0;

    // Scenarios
    const baseCase = { cashOnCashReturn, dscr, annualPreTaxCashFlow, irr };
    
    const bestCaseSDE = annualSDE * 1.15;
    const bestCaseCashFlow = (bestCaseSDE - annualCapex) - totalAnnualDebtService;
    const bestCase = {
      cashOnCashReturn: downPayment > 0 ? (bestCaseCashFlow / downPayment) * 100 : 0,
      dscr: totalAnnualDebtService > 0 ? (bestCaseSDE - annualCapex) / totalAnnualDebtService : 0,
      annualPreTaxCashFlow: bestCaseCashFlow,
      irr: irr * 1.2, // Approximate
    };

    const worstCaseSDE = annualSDE * 0.85;
    const worstCaseCashFlow = (worstCaseSDE - annualCapex) - totalAnnualDebtService;
    const worstCase = {
      cashOnCashReturn: downPayment > 0 ? (worstCaseCashFlow / downPayment) * 100 : 0,
      dscr: totalAnnualDebtService > 0 ? (worstCaseSDE - annualCapex) / totalAnnualDebtService : 0,
      annualPreTaxCashFlow: worstCaseCashFlow,
      irr: irr * 0.7, // Approximate
    };

    return {
      purchasePrice,
      downPayment,
      bankLoanAmount,
      sellerFinancing,
      bankAnnualDebtService,
      sellerAnnualDebtService,
      totalAnnualDebtService,
      lendableCashFlow,
      annualPreTaxCashFlow,
      dscr,
      cashOnCashReturn,
      sdeMultiple,
      paybackPeriod,
      equitySchedule,
      scenarios: { baseCase, bestCase, worstCase },
      irr,
      totalROI,
      holdPeriod,
      exitValue: exitYear?.businessValue || 0,
      exitEquity: exitYear?.ownerEquity || 0,
    };
  }, [inputs]);

  const handleSaveAnalysis = () => {
    if (!outputs) return;
    const analysisData = {
      type: 'acquisition',
      inputs: { ...inputs },
      outputs: { dscr: outputs.dscr, cashOnCashReturn: outputs.cashOnCashReturn, annualPreTaxCashFlow: outputs.annualPreTaxCashFlow, sdeMultiple: outputs.sdeMultiple, irr: outputs.irr, totalROI: outputs.totalROI },
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
              <p className="text-sgf-green-100 mt-2 max-w-2xl mx-auto">Comprehensive deal analysis with ROI, IRR, equity build-up, and scenario modeling</p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          
          {/* Card 1: Purchase Structure */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Purchase Structure</span>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Purchase Price</label>
                  <Tooltip content="The total agreed-upon price for the business, including all assets, goodwill, and inventory. This is typically based on a multiple of SDE or EBITDA." />
                </div>
                <CurrencyInput prefix="$" value={inputs.purchasePrice} onChange={(v) => handleInputChange('purchasePrice', v)} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Down Payment</label>
                  <Tooltip content="Cash equity injection required at closing. SBA loans typically require 10-20% down. Higher down payments improve DSCR and reduce monthly payments." />
                </div>
                <CurrencyInput prefix="$" value={inputs.downPayment} onChange={(v) => handleInputChange('downPayment', v)} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Seller Financing</label>
                  <Tooltip content="Portion of purchase price financed by the seller, typically on a promissory note. Often 10-20% of deal value with favorable terms (lower rate, interest-only period, or standby)." />
                </div>
                <CurrencyInput prefix="$" value={inputs.sellerFinancing} onChange={(v) => handleInputChange('sellerFinancing', v)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="text-xs font-semibold text-gray-600">Seller Rate</label>
                    <Tooltip content="Interest rate on seller note. Typically 5-8%, often below bank rates as incentive." />
                  </div>
                  <CurrencyInput suffix="%" decimals={2} value={inputs.sellerFinancingRate} onChange={(v) => handleInputChange('sellerFinancingRate', v)} />
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="text-xs font-semibold text-gray-600">Seller Term</label>
                    <Tooltip content="Repayment period for seller note. Typically 3-7 years, often with balloon payment." />
                  </div>
                  <CurrencyInput suffix="yrs" value={inputs.sellerFinancingTerm} onChange={(v) => handleInputChange('sellerFinancingTerm', v)} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Bank Loan Terms */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Bank Loan Terms</span>
            </div>
            <div className="p-6 space-y-4">
              {outputs && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500 mb-1">Bank Loan Amount</div>
                    <Tooltip content="Calculated as: Purchase Price - Down Payment - Seller Financing. This is the amount you'll borrow from the bank." />
                  </div>
                  <div className="text-xl font-bold font-mono text-sgf-green-600">{formatCurrency(outputs.bankLoanAmount)}</div>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Interest Rate</label>
                  <Tooltip content="Annual interest rate on bank loan. SBA 7(a) rates are typically Prime + 2.25-2.75% (currently ~10-11%). Conventional loans may be 8-12%." />
                </div>
                <CurrencyInput suffix="%" decimals={2} value={inputs.bankLoanRate} onChange={(v) => handleInputChange('bankLoanRate', v)} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Loan Term</label>
                  <Tooltip content="Amortization period in years. SBA 7(a) business acquisition loans are typically 10 years. Longer terms lower payments but increase total interest." />
                </div>
                <CurrencyInput suffix="years" value={inputs.bankLoanTerm} onChange={(v) => handleInputChange('bankLoanTerm', v)} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Hold Period</label>
                  <Tooltip content="How many years you plan to own the business before selling. Used to calculate IRR and total ROI. Typical hold periods are 5-10 years." />
                </div>
                <CurrencyInput suffix="years" value={inputs.holdPeriod} onChange={(v) => handleInputChange('holdPeriod', v)} />
              </div>
            </div>
          </div>

          {/* Card 3: Business Financials */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Business Financials</span>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Annual Revenue</label>
                  <Tooltip content="Total gross revenue of the business. Used to calculate revenue multiples and assess business scale. Should match trailing 12 months (TTM) or projected." />
                </div>
                <CurrencyInput prefix="$" value={inputs.annualRevenue} onChange={(v) => handleInputChange('annualRevenue', v)} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Annual SDE / EBITDA</label>
                  <Tooltip content="Seller's Discretionary Earnings or EBITDA. SDE includes owner salary and perks added back. This is the cash flow available to pay yourself and service debt." />
                </div>
                <CurrencyInput prefix="$" value={inputs.annualSDE} onChange={(v) => handleInputChange('annualSDE', v)} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Annual CAPEX</label>
                  <Tooltip content="Capital expenditures required to maintain the business - equipment replacement, vehicle purchases, major repairs. Lenders subtract this from cash flow." />
                </div>
                <CurrencyInput prefix="$" value={inputs.annualCapex} onChange={(v) => handleInputChange('annualCapex', v)} />
              </div>
            </div>
          </div>

          {/* Card 4: Growth Assumptions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Growth Assumptions</span>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Revenue Growth Rate</label>
                  <Tooltip content="Expected annual revenue/SDE growth rate. Conservative: 0-3%, Moderate: 3-5%, Aggressive: 5-10%. Affects future cash flows and exit valuation." />
                </div>
                <CurrencyInput suffix="%" decimals={2} value={inputs.revenueGrowthRate} onChange={(v) => handleInputChange('revenueGrowthRate', v)} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Business Appreciation</label>
                  <Tooltip content="Expected annual appreciation in business value. Typically tied to SDE growth and multiple expansion. Used to calculate exit value and equity build-up." />
                </div>
                <CurrencyInput suffix="%" decimals={2} value={inputs.businessAppreciationRate} onChange={(v) => handleInputChange('businessAppreciationRate', v)} />
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <GatedCalculator requiredPlan="core" calculatorSlug="acquisition">
        {outputs && (
          <>
            {/* Key Metrics - Now includes IRR and Total ROI */}
            <div className="grid md:grid-cols-6 gap-4 mb-8">
              <div className={`rounded-xl p-4 border ${getDSCRStatus(outputs.dscr).bg} ${getDSCRStatus(outputs.dscr).border}`}>
                <div className="flex items-center gap-1 mb-1">
                  <div className="text-xs font-medium text-gray-600">DSCR</div>
                  <Tooltip content="Debt Service Coverage Ratio. Measures how many times cash flow covers debt payments. Lenders require 1.25x minimum. Higher is better." />
                </div>
                <div className={`text-2xl font-bold font-mono ${getDSCRStatus(outputs.dscr).color}`}>{outputs.dscr.toFixed(2)}x</div>
                <div className={`text-xs font-semibold ${getDSCRStatus(outputs.dscr).color}`}>{getDSCRStatus(outputs.dscr).label}</div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-1 mb-1">
                  <div className="text-xs font-medium text-gray-600">Cash-on-Cash</div>
                  <Tooltip content="Annual cash flow divided by cash invested (down payment). Shows the yearly return on your actual cash investment. 15%+ is excellent, 10-15% is good." />
                </div>
                <div className={`text-2xl font-bold font-mono ${outputs.cashOnCashReturn >= 15 ? 'text-sgf-green-600' : outputs.cashOnCashReturn >= 10 ? 'text-sgf-gold-600' : 'text-red-600'}`}>{outputs.cashOnCashReturn.toFixed(1)}%</div>
                <div className="text-xs text-gray-500">Year 1 Return</div>
              </div>

              <div className="bg-gradient-to-br from-sgf-green-50 to-sgf-green-100 rounded-xl p-4 border border-sgf-green-200">
                <div className="flex items-center gap-1 mb-1">
                  <div className="text-xs font-medium text-sgf-green-700">IRR</div>
                  <Tooltip content="Internal Rate of Return (Annual Return Rate). The annualized return accounting for all cash flows over the hold period including exit. This is the TRUE return on your investment. 20%+ is excellent." />
                </div>
                <div className="text-2xl font-bold font-mono text-sgf-green-700">{outputs.irr.toFixed(1)}%</div>
                <div className="text-xs text-sgf-green-600">Annual Return</div>
              </div>

              <div className="bg-gradient-to-br from-sgf-gold-50 to-sgf-gold-100 rounded-xl p-4 border border-sgf-gold-200">
                <div className="flex items-center gap-1 mb-1">
                  <div className="text-xs font-medium text-sgf-gold-700">Total ROI</div>
                  <Tooltip content="Total Return on Investment over the entire hold period. Calculated as (Total Returns - Initial Investment) / Initial Investment. Shows your cumulative profit as a percentage." />
                </div>
                <div className="text-2xl font-bold font-mono text-sgf-gold-700">{outputs.totalROI.toFixed(0)}%</div>
                <div className="text-xs text-sgf-gold-600">{outputs.holdPeriod}-Year Return</div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-1 mb-1">
                  <div className="text-xs font-medium text-gray-600">Annual Cash Flow</div>
                  <Tooltip content="Pre-tax cash flow after all debt payments. This is money in your pocket each year (before taxes). Negative means the business doesn't cash flow." />
                </div>
                <div className={`text-2xl font-bold font-mono ${outputs.annualPreTaxCashFlow >= 0 ? 'text-sgf-green-600' : 'text-red-600'}`}>{formatCurrency(outputs.annualPreTaxCashFlow)}</div>
                <div className="text-xs text-gray-500">Pre-Tax</div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-1 mb-1">
                  <div className="text-xs font-medium text-gray-600">SDE Multiple</div>
                  <Tooltip content="Purchase price divided by SDE. Shows how many years of earnings you're paying. Typical range: 2-4x for small businesses, higher for larger/growing companies." />
                </div>
                <div className="text-2xl font-bold font-mono text-gray-900">{outputs.sdeMultiple.toFixed(2)}x</div>
                <div className="text-xs text-gray-500">Valuation</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {[
                    { id: 'summary', label: 'Deal Summary', icon: Target },
                    { id: 'returns', label: 'Returns Analysis', icon: Percent },
                    { id: 'equity', label: 'Equity Build-Up', icon: TrendingUp },
                    { id: 'scenarios', label: 'Scenarios', icon: PieChart },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.id ? 'border-sgf-green-500 text-sgf-green-600 bg-sgf-green-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                        <Icon className="w-4 h-4" />{tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'summary' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        Sources of Funds
                        <Tooltip content="How the purchase is being financed - your cash plus borrowed money." />
                      </h3>
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
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        Annual Cash Flow
                        <Tooltip content="How cash flows from operations to your pocket after debt payments." />
                      </h3>
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
                          <span className={`font-mono font-bold ${outputs.annualPreTaxCashFlow >= 0 ? 'text-sgf-green-600' : 'text-red-600'}`}>{formatCurrency(outputs.annualPreTaxCashFlow)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'returns' && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-sgf-green-50 rounded-xl p-6 border border-sgf-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-sgf-green-800">IRR (Annual Return Rate)</h3>
                          <Tooltip content="The discount rate that makes the NPV of all cash flows equal to zero. This is the most accurate measure of your annualized return." />
                        </div>
                        <div className="text-4xl font-bold font-mono text-sgf-green-700 mb-2">{outputs.irr.toFixed(1)}%</div>
                        <p className="text-sm text-sgf-green-600">Annualized return over {outputs.holdPeriod}-year hold</p>
                      </div>
                      <div className="bg-sgf-gold-50 rounded-xl p-6 border border-sgf-gold-200">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-sgf-gold-800">Total ROI</h3>
                          <Tooltip content="Total return on your initial investment including all cash flows and exit proceeds." />
                        </div>
                        <div className="text-4xl font-bold font-mono text-sgf-gold-700 mb-2">{outputs.totalROI.toFixed(0)}%</div>
                        <p className="text-sm text-sgf-gold-600">Cumulative return over {outputs.holdPeriod} years</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-blue-800">Exit Value</h3>
                          <Tooltip content="Projected business value at the end of your hold period based on appreciation rate." />
                        </div>
                        <div className="text-4xl font-bold font-mono text-blue-700 mb-2">{formatCurrency(outputs.exitValue)}</div>
                        <p className="text-sm text-blue-600">Year {outputs.holdPeriod} business value</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Return Comparison</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">S&P 500 Average (10%)</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div className="bg-gray-500 h-2 rounded-full" style={{ width: '33%' }}></div>
                            </div>
                            <span className="font-mono text-sm">10%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Real Estate Average (8-12%)</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                            </div>
                            <span className="font-mono text-sm">12%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sgf-green-700 font-semibold">This Deal IRR</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div className="bg-sgf-green-500 h-2 rounded-full" style={{ width: `${Math.min(outputs.irr / 30 * 100, 100)}%` }}></div>
                            </div>
                            <span className="font-mono text-sm font-bold text-sgf-green-600">{outputs.irr.toFixed(1)}%</span>
                          </div>
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
                          <tr key={row.year} className={`hover:bg-gray-50 ${row.year === outputs.holdPeriod ? 'bg-sgf-green-50' : ''}`}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {row.year === 0 ? 'Start' : `Year ${row.year}`}
                              {row.year === outputs.holdPeriod && <span className="ml-2 text-xs bg-sgf-green-200 text-sgf-green-800 px-2 py-0.5 rounded">Exit</span>}
                            </td>
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
                        <div><div className="text-xs text-red-600 mb-1">Cash-on-Cash Return</div><div className="text-2xl font-bold font-mono text-red-700">{outputs.scenarios.worstCase.cashOnCashReturn.toFixed(1)}%</div></div>
                        <div><div className="text-xs text-red-600 mb-1">DSCR</div><div className="text-2xl font-bold font-mono text-red-700">{outputs.scenarios.worstCase.dscr.toFixed(2)}x</div></div>
                        <div><div className="text-xs text-red-600 mb-1">Annual Cash Flow</div><div className="text-xl font-bold font-mono text-red-700">{formatCurrency(outputs.scenarios.worstCase.annualPreTaxCashFlow)}</div></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">Base Case</h3>
                      </div>
                      <div className="space-y-3">
                        <div><div className="text-xs text-gray-500 mb-1">Cash-on-Cash Return</div><div className="text-2xl font-bold font-mono text-gray-900">{outputs.scenarios.baseCase.cashOnCashReturn.toFixed(1)}%</div></div>
                        <div><div className="text-xs text-gray-500 mb-1">DSCR</div><div className="text-2xl font-bold font-mono text-gray-900">{outputs.scenarios.baseCase.dscr.toFixed(2)}x</div></div>
                        <div><div className="text-xs text-gray-500 mb-1">Annual Cash Flow</div><div className="text-xl font-bold font-mono text-gray-900">{formatCurrency(outputs.scenarios.baseCase.annualPreTaxCashFlow)}</div></div>
                      </div>
                    </div>
                    <div className="bg-sgf-green-50 rounded-xl p-5 border border-sgf-green-200">
                      <div className="flex items-center gap-2 mb-4">
                        <ArrowUpRight className="w-5 h-5 text-sgf-green-600" />
                        <h3 className="font-semibold text-sgf-green-900">Best Case (+15% SDE)</h3>
                      </div>
                      <div className="space-y-3">
                        <div><div className="text-xs text-sgf-green-600 mb-1">Cash-on-Cash Return</div><div className="text-2xl font-bold font-mono text-sgf-green-700">{outputs.scenarios.bestCase.cashOnCashReturn.toFixed(1)}%</div></div>
                        <div><div className="text-xs text-sgf-green-600 mb-1">DSCR</div><div className="text-2xl font-bold font-mono text-sgf-green-700">{outputs.scenarios.bestCase.dscr.toFixed(2)}x</div></div>
                        <div><div className="text-xs text-sgf-green-600 mb-1">Annual Cash Flow</div><div className="text-xl font-bold font-mono text-sgf-green-700">{formatCurrency(outputs.scenarios.bestCase.annualPreTaxCashFlow)}</div></div>
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
                <button onClick={handleSaveAnalysis} className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sgf-green-600 to-sgf-green-700 hover:from-sgf-green-700 hover:to-sgf-green-800 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all">
                  <Save className="w-5 h-5" />Save Analysis
                </button>
              </div>
            </div>
          </>
        )}
        </GatedCalculator>

        {/* Premium Products CTA */}
        <PremiumProductsCTA />

        {/* Financing CTA */}
        <div className="mt-12 bg-gradient-to-r from-sgf-green-600 via-sgf-green-700 to-sgf-green-800 rounded-2xl p-8 md:p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-4">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />Ready to Finance?
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Get Your Deal Funded Today</h2>
              <p className="text-sgf-green-100 max-w-lg">Connect with Starting Gate Financial for competitive business acquisition loans, SBA 7(a) financing, and commercial real estate solutions.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://startinggatefinancial.com/apply" className="inline-flex items-center justify-center gap-2 bg-sgf-gold-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-sgf-gold-600 transition-colors shadow-lg"><FileText className="w-5 h-5" />Apply for Financing</a>
              <a href="https://startinggatefinancial.com/contact" className="inline-flex items-center justify-center gap-2 bg-white/10 border-2 border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"><MessageSquare className="w-5 h-5" />Schedule Call</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}