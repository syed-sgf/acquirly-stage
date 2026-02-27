'use client';

import { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Building2, 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  FileText, 
  MessageSquare, 
  Save, 
  Home,
  Hammer,
  RefreshCw,
  PieChart,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Percent
} from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import PremiumProductsCTA from '@/components/core/PremiumProductsCTA';
import GatedCalculator from '@/components/core/GatedCalculator';

type StrategyType = 'buy-hold' | 'fix-flip' | 'brrrr';

interface REIInvestorProInputs {
  // Property Details
  purchasePrice: string;
  afterRepairValue: string;
  rehabCosts: string;
  closingCostsBuy: string;
  closingCostsSell: string;
  
  // Rental Income
  monthlyRent: string;
  otherMonthlyIncome: string;
  vacancyRate: string;
  
  // Operating Expenses
  propertyTaxes: string;
  insurance: string;
  maintenance: string;
  propertyManagement: string;
  utilities: string;
  hoa: string;
  otherExpenses: string;
  
  // Financing - Purchase
  downPaymentPercent: string;
  loanInterestRate: string;
  loanTermYears: string;
  
  // Financing - Refinance (BRRRR)
  refinanceLTV: string;
  refinanceRate: string;
  refinanceTermYears: string;
  
  // Assumptions
  appreciationRate: string;
  rentGrowthRate: string;
  holdPeriodYears: string;
  sellingCostsPercent: string;
  
  // Fix & Flip
  holdMonths: string;
  hardMoneyRate: string;
  hardMoneyPoints: string;
}

const defaultInputs: REIInvestorProInputs = {
  purchasePrice: '250,000',
  afterRepairValue: '320,000',
  rehabCosts: '40,000',
  closingCostsBuy: '5,000',
  closingCostsSell: '3,000',
  
  monthlyRent: '2,200',
  otherMonthlyIncome: '100',
  vacancyRate: '5',
  
  propertyTaxes: '3,000',
  insurance: '1,200',
  maintenance: '1,500',
  propertyManagement: '8',
  utilities: '0',
  hoa: '0',
  otherExpenses: '500',
  
  downPaymentPercent: '25',
  loanInterestRate: '7.5',
  loanTermYears: '30',
  
  refinanceLTV: '75',
  refinanceRate: '7.0',
  refinanceTermYears: '30',
  
  appreciationRate: '3',
  rentGrowthRate: '2',
  holdPeriodYears: '5',
  sellingCostsPercent: '8',
  
  holdMonths: '6',
  hardMoneyRate: '12',
  hardMoneyPoints: '2',
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const formatCurrencyDetailed = (value: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const parseCurrencyInput = (value: string): number => {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
};

const formatNumberWithCommas = (value: number): string => {
  if (isNaN(value) || value === 0) return '0';
  return value.toLocaleString('en-US');
};

const handleCurrencyChange = (
  value: string,
  setter: (field: keyof REIInvestorProInputs, value: string) => void,
  field: keyof REIInvestorProInputs
) => {
  if (value === '' || value === '$') {
    setter(field, '0');
    return;
  }
  const numericValue = value.replace(/[^0-9]/g, '');
  const number = parseInt(numericValue, 10);
  if (!isNaN(number)) {
    setter(field, formatNumberWithCommas(number));
  }
};

const handlePercentChange = (
  value: string,
  setter: (field: keyof REIInvestorProInputs, value: string) => void,
  field: keyof REIInvestorProInputs
) => {
  if (value === '') {
    setter(field, '0');
    return;
  }
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) return;
  if (parts[1] && parts[1].length > 2) return;
  setter(field, cleaned);
};

const calculateMonthlyPayment = (principal: number, annualRate: number, years: number): number => {
  if (!principal || !annualRate || !years) return 0;
  const monthlyRate = (annualRate / 100) / 12;
  const numPayments = years * 12;
  if (monthlyRate === 0) return principal / numPayments;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
};

// IRR Calculation
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

    if (Math.abs(derivativeNpv) < 0.0001) break;
    
    const newRate = rate - npv / derivativeNpv;
    
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate * 100;
    }
    
    rate = newRate;
    
    if (rate < -0.99 || rate > 10) break;
  }
  
  return rate * 100;
};

export default function REIInvestorProAnalyzerPage() {
  const [inputs, setInputs] = useState<REIInvestorProInputs>(defaultInputs);
  const [strategy, setStrategy] = useState<StrategyType>('buy-hold');
  const [activeTab, setActiveTab] = useState<'summary' | 'cashflow' | 'returns' | 'equity'>('summary');

  const handleInputChange = (field: keyof REIInvestorProInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const outputs = useMemo(() => {
    const purchasePrice = parseCurrencyInput(inputs.purchasePrice);
    const afterRepairValue = parseCurrencyInput(inputs.afterRepairValue);
    const rehabCosts = parseCurrencyInput(inputs.rehabCosts);
    const closingCostsBuy = parseCurrencyInput(inputs.closingCostsBuy);
    const closingCostsSell = parseCurrencyInput(inputs.closingCostsSell);
    
    const monthlyRent = parseCurrencyInput(inputs.monthlyRent);
    const otherMonthlyIncome = parseCurrencyInput(inputs.otherMonthlyIncome);
    const vacancyRate = parseFloat(inputs.vacancyRate) || 0;
    
    const propertyTaxes = parseCurrencyInput(inputs.propertyTaxes);
    const insurance = parseCurrencyInput(inputs.insurance);
    const maintenance = parseCurrencyInput(inputs.maintenance);
    const propertyManagement = parseFloat(inputs.propertyManagement) || 0;
    const utilities = parseCurrencyInput(inputs.utilities);
    const hoa = parseCurrencyInput(inputs.hoa);
    const otherExpenses = parseCurrencyInput(inputs.otherExpenses);
    
    const downPaymentPercent = parseFloat(inputs.downPaymentPercent) || 0;
    const loanInterestRate = parseFloat(inputs.loanInterestRate) || 0;
    const loanTermYears = parseInt(inputs.loanTermYears) || 30;
    
    const refinanceLTV = parseFloat(inputs.refinanceLTV) || 75;
    const refinanceRate = parseFloat(inputs.refinanceRate) || 7;
    const refinanceTermYears = parseInt(inputs.refinanceTermYears) || 30;
    
    const appreciationRate = parseFloat(inputs.appreciationRate) || 0;
    const rentGrowthRate = parseFloat(inputs.rentGrowthRate) || 0;
    const holdPeriodYears = parseInt(inputs.holdPeriodYears) || 5;
    const sellingCostsPercent = parseFloat(inputs.sellingCostsPercent) || 8;
    
    const holdMonths = parseInt(inputs.holdMonths) || 6;
    const hardMoneyRate = parseFloat(inputs.hardMoneyRate) || 12;
    const hardMoneyPoints = parseFloat(inputs.hardMoneyPoints) || 2;

    if (!purchasePrice) return null;

    // === COMMON CALCULATIONS ===
    
    // Annual Income
    const grossAnnualRent = monthlyRent * 12;
    const grossAnnualOther = otherMonthlyIncome * 12;
    const grossPotentialIncome = grossAnnualRent + grossAnnualOther;
    const vacancyLoss = grossPotentialIncome * (vacancyRate / 100);
    const effectiveGrossIncome = grossPotentialIncome - vacancyLoss;
    
    // Annual Expenses
    const managementExpense = effectiveGrossIncome * (propertyManagement / 100);
    const totalAnnualExpenses = propertyTaxes + insurance + maintenance + managementExpense + utilities + (hoa * 12) + otherExpenses;
    
    // NOI
    const netOperatingIncome = effectiveGrossIncome - totalAnnualExpenses;
    
    // Loan Calculations
    const downPayment = purchasePrice * (downPaymentPercent / 100);
    const loanAmount = purchasePrice - downPayment;
    const monthlyMortgage = calculateMonthlyPayment(loanAmount, loanInterestRate, loanTermYears);
    const annualDebtService = monthlyMortgage * 12;
    
    // Key Metrics
    const capRate = purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0;
    const grossRentMultiplier = grossAnnualRent > 0 ? purchasePrice / grossAnnualRent : 0;
    const dscr = annualDebtService > 0 ? netOperatingIncome / annualDebtService : 0;
    
    // Cash Flow
    const annualCashFlow = netOperatingIncome - annualDebtService;
    const monthlyCashFlow = annualCashFlow / 12;
    
    // Total Cash Invested
    const totalCashInvested = downPayment + closingCostsBuy + (strategy !== 'buy-hold' ? rehabCosts : 0);
    
    // Cash-on-Cash Return
    const cashOnCashReturn = totalCashInvested > 0 ? (annualCashFlow / totalCashInvested) * 100 : 0;
    
    // Break-Even Ratio
    const breakEvenRatio = effectiveGrossIncome > 0 ? ((totalAnnualExpenses + annualDebtService) / effectiveGrossIncome) * 100 : 0;
    
    // Expense Ratio
    const expenseRatio = effectiveGrossIncome > 0 ? (totalAnnualExpenses / effectiveGrossIncome) * 100 : 0;

    // === STRATEGY-SPECIFIC CALCULATIONS ===
    
    let strategyResults: any = {};
    
    if (strategy === 'buy-hold') {
      // Build equity schedule and cash flows for IRR
      const equitySchedule = [];
      const annualCashFlows: number[] = [-totalCashInvested];
      
      let currentPropertyValue = purchasePrice;
      let currentLoanBalance = loanAmount;
      let currentRent = monthlyRent;
      const monthlyRate = (loanInterestRate / 100) / 12;
      
      for (let year = 0; year <= holdPeriodYears; year++) {
        const equity = currentPropertyValue - currentLoanBalance;
        const equityPercent = currentPropertyValue > 0 ? (equity / currentPropertyValue) * 100 : 0;
        
        if (year > 0) {
          // Calculate this year's cash flow
          const yearGrossRent = currentRent * 12;
          const yearEGI = yearGrossRent * (1 - vacancyRate / 100);
          const yearExpenses = totalAnnualExpenses * Math.pow(1.02, year - 1); // 2% expense growth
          const yearNOI = yearEGI - yearExpenses;
          const yearCashFlow = yearNOI - annualDebtService;
          
          if (year === holdPeriodYears) {
            // Exit year - add sale proceeds
            const sellingCosts = currentPropertyValue * (sellingCostsPercent / 100);
            const saleProceeds = currentPropertyValue - currentLoanBalance - sellingCosts;
            annualCashFlows.push(yearCashFlow + saleProceeds);
          } else {
            annualCashFlows.push(yearCashFlow);
          }
        }
        
        equitySchedule.push({
          year,
          propertyValue: currentPropertyValue,
          loanBalance: currentLoanBalance,
          equity,
          equityPercent,
        });
        
        // Update for next year
        currentPropertyValue = currentPropertyValue * (1 + appreciationRate / 100);
        currentRent = currentRent * (1 + rentGrowthRate / 100);
        
        // Pay down loan
        for (let month = 0; month < 12; month++) {
          if (currentLoanBalance > 0) {
            const interestPayment = currentLoanBalance * monthlyRate;
            const principalPayment = monthlyMortgage - interestPayment;
            currentLoanBalance = Math.max(0, currentLoanBalance - principalPayment);
          }
        }
      }
      
      const irr = calculateIRR(annualCashFlows);
      const totalCashFlowsReceived = annualCashFlows.slice(1).reduce((sum, cf) => sum + cf, 0);
      const totalROI = totalCashInvested > 0 ? ((totalCashFlowsReceived - totalCashInvested) / totalCashInvested) * 100 : 0;
      
      const exitYear = equitySchedule[holdPeriodYears];
      
      strategyResults = {
        equitySchedule,
        irr,
        totalROI,
        exitValue: exitYear?.propertyValue || 0,
        exitEquity: exitYear?.equity || 0,
        totalCashInvested,
      };
    }
    
    if (strategy === 'fix-flip') {
      // Fix & Flip Calculations
      const totalProjectCost = purchasePrice + rehabCosts + closingCostsBuy;
      const hardMoneyLoanAmount = purchasePrice * 0.9; // 90% of purchase
      const hardMoneyPointsCost = hardMoneyLoanAmount * (hardMoneyPoints / 100);
      const holdingCostsMonthly = (hardMoneyLoanAmount * (hardMoneyRate / 100) / 12) + (propertyTaxes / 12) + (insurance / 12) + 500; // Utilities/misc
      const totalHoldingCosts = holdingCostsMonthly * holdMonths;
      
      const cashNeeded = (purchasePrice - hardMoneyLoanAmount) + rehabCosts + closingCostsBuy + hardMoneyPointsCost + totalHoldingCosts;
      
      const salePrice = afterRepairValue;
      const sellingCosts = salePrice * (sellingCostsPercent / 100);
      const netSaleProceeds = salePrice - sellingCosts - closingCostsSell;
      
      const grossProfit = netSaleProceeds - totalProjectCost - totalHoldingCosts - hardMoneyPointsCost;
      const netProfit = grossProfit - hardMoneyLoanAmount + hardMoneyLoanAmount; // Pay back loan
      const actualProfit = netSaleProceeds - cashNeeded - hardMoneyLoanAmount;
      
      const roi = cashNeeded > 0 ? (actualProfit / cashNeeded) * 100 : 0;
      const annualizedROI = holdMonths > 0 ? (roi / holdMonths) * 12 : 0;
      
      // Profit margin
      const profitMargin = salePrice > 0 ? (actualProfit / salePrice) * 100 : 0;
      
      // 70% Rule Check
      const maxPurchasePrice70 = (afterRepairValue * 0.7) - rehabCosts;
      const meetsRule70 = purchasePrice <= maxPurchasePrice70;
      
      strategyResults = {
        totalProjectCost,
        cashNeeded,
        totalHoldingCosts,
        hardMoneyPointsCost,
        salePrice,
        sellingCosts,
        netSaleProceeds,
        grossProfit,
        actualProfit,
        roi,
        annualizedROI,
        profitMargin,
        maxPurchasePrice70,
        meetsRule70,
      };
    }
    
    if (strategy === 'brrrr') {
      // BRRRR Calculations
      const initialCashInvested = downPayment + closingCostsBuy + rehabCosts;
      
      // After rehab, refinance based on ARV
      const refinanceAmount = afterRepairValue * (refinanceLTV / 100);
      const cashOutFromRefi = refinanceAmount - loanAmount;
      const cashLeftInDeal = initialCashInvested - cashOutFromRefi;
      
      // New loan payment after refi
      const newMonthlyPayment = calculateMonthlyPayment(refinanceAmount, refinanceRate, refinanceTermYears);
      const newAnnualDebtService = newMonthlyPayment * 12;
      
      // Cash flow after refi
      const annualCashFlowAfterRefi = netOperatingIncome - newAnnualDebtService;
      const monthlyCashFlowAfterRefi = annualCashFlowAfterRefi / 12;
      
      // Cash-on-Cash after refi (based on cash left in deal)
      const cashOnCashAfterRefi = cashLeftInDeal > 0 ? (annualCashFlowAfterRefi / cashLeftInDeal) * 100 : Infinity;
      
      // If cash out >= initial investment, infinite return!
      const infiniteReturn = cashLeftInDeal <= 0;
      
      // DSCR after refi
      const dscrAfterRefi = newAnnualDebtService > 0 ? netOperatingIncome / newAnnualDebtService : 0;
      
      strategyResults = {
        initialCashInvested,
        refinanceAmount,
        cashOutFromRefi,
        cashLeftInDeal,
        newMonthlyPayment,
        newAnnualDebtService,
        annualCashFlowAfterRefi,
        monthlyCashFlowAfterRefi,
        cashOnCashAfterRefi,
        infiniteReturn,
        dscrAfterRefi,
      };
    }

    return {
      // Income
      grossPotentialIncome,
      vacancyLoss,
      effectiveGrossIncome,
      
      // Expenses
      totalAnnualExpenses,
      managementExpense,
      expenseRatio,
      
      // NOI
      netOperatingIncome,
      
      // Financing
      downPayment,
      loanAmount,
      monthlyMortgage,
      annualDebtService,
      
      // Key Metrics
      capRate,
      grossRentMultiplier,
      dscr,
      cashOnCashReturn,
      breakEvenRatio,
      
      // Cash Flow
      annualCashFlow,
      monthlyCashFlow,
      
      // Total Investment
      totalCashInvested,
      
      // Strategy Results
      ...strategyResults,
      
      // Input values for display
      purchasePrice,
      afterRepairValue,
      rehabCosts,
    };
  }, [inputs, strategy]);

  const handleSaveAnalysis = () => {
    if (!outputs) return;
    const analysisData = {
      type: 'rei-pro',
      strategy,
      inputs: { 
        purchasePrice: outputs.purchasePrice, 
        afterRepairValue: outputs.afterRepairValue,
        monthlyRent: parseCurrencyInput(inputs.monthlyRent),
      },
      outputs: { 
        capRate: outputs.capRate, 
        cashOnCash: outputs.cashOnCashReturn,
        noi: outputs.netOperatingIncome,
        irr: outputs.irr,
      },
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('pendingREIInvestorProAnalysis', JSON.stringify(analysisData));
    window.location.href = '/api/auth/signin?callbackUrl=/app/deals/new';
  };

  const getMetricStatus = (value: number, good: number, great: number, isHigherBetter: boolean = true) => {
    if (isHigherBetter) {
      if (value >= great) return 'text-sgf-green-600';
      if (value >= good) return 'text-sgf-gold-600';
      return 'text-red-600';
    } else {
      if (value <= great) return 'text-sgf-green-600';
      if (value <= good) return 'text-sgf-gold-600';
      return 'text-red-600';
    }
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
              <h1 className="text-2xl md:text-3xl font-bold text-white">Real Estate Investor Pro</h1>
              <p className="text-sgf-green-100 mt-2 max-w-2xl mx-auto">Comprehensive real estate investment analysis for Buy & Hold, Fix & Flip, and BRRRR strategies</p>
            </div>
          </div>
        </div>

        {/* Strategy Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold text-gray-900">Investment Strategy</h2>
            <Tooltip content="Select your investment approach. Each strategy has different metrics and analysis tailored to that specific exit plan." />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => setStrategy('buy-hold')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                strategy === 'buy-hold' 
                  ? 'border-sgf-green-500 bg-sgf-green-50' 
                  : 'border-gray-200 hover:border-sgf-green-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${strategy === 'buy-hold' ? 'bg-sgf-green-500' : 'bg-gray-200'}`}>
                  <Home className={`w-5 h-5 ${strategy === 'buy-hold' ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <span className={`font-semibold ${strategy === 'buy-hold' ? 'text-sgf-green-700' : 'text-gray-700'}`}>Buy & Hold</span>
              </div>
              <p className="text-xs text-gray-500">Long-term rental investment with cash flow and appreciation</p>
            </button>
            
            <button
              onClick={() => setStrategy('fix-flip')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                strategy === 'fix-flip' 
                  ? 'border-sgf-gold-500 bg-sgf-gold-50' 
                  : 'border-gray-200 hover:border-sgf-gold-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${strategy === 'fix-flip' ? 'bg-sgf-gold-500' : 'bg-gray-200'}`}>
                  <Hammer className={`w-5 h-5 ${strategy === 'fix-flip' ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <span className={`font-semibold ${strategy === 'fix-flip' ? 'text-sgf-gold-700' : 'text-gray-700'}`}>Fix & Flip</span>
              </div>
              <p className="text-xs text-gray-500">Rehab and resell for quick profit</p>
            </button>
            
            <button
              onClick={() => setStrategy('brrrr')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                strategy === 'brrrr' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${strategy === 'brrrr' ? 'bg-blue-500' : 'bg-gray-200'}`}>
                  <RefreshCw className={`w-5 h-5 ${strategy === 'brrrr' ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <span className={`font-semibold ${strategy === 'brrrr' ? 'text-blue-700' : 'text-gray-700'}`}>BRRRR</span>
              </div>
              <p className="text-xs text-gray-500">Buy, Rehab, Rent, Refinance, Repeat</p>
            </button>
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
                  <label className="text-xs font-semibold text-gray-600">Purchase Price</label>
                  <Tooltip content="The price you're paying for the property. For flips/BRRRR, this should be below market value to allow profit margin." />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="text" value={inputs.purchasePrice} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'purchasePrice')} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none" />
                </div>
              </div>
              
              {(strategy === 'fix-flip' || strategy === 'brrrr') && (
                <>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <label className="text-xs font-semibold text-gray-600">After Repair Value (ARV)</label>
                      <Tooltip content="Estimated market value after all renovations are complete. Research comparable sales (comps) in the area. This is critical for determining profit potential." />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input type="text" value={inputs.afterRepairValue} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'afterRepairValue')} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <label className="text-xs font-semibold text-gray-600">Rehab Costs</label>
                      <Tooltip content="Total renovation budget including materials, labor, permits, and 10-15% contingency. Get contractor bids before making offers." />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input type="text" value={inputs.rehabCosts} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'rehabCosts')} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none" />
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs font-semibold text-gray-600">Closing Costs (Buy)</label>
                  <Tooltip content="Costs to purchase: title insurance, escrow fees, inspections, appraisal, loan origination. Typically 2-5% of purchase price." />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="text" value={inputs.closingCostsBuy} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'closingCostsBuy')} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Income */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Rental Income</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs font-semibold text-gray-600">Monthly Rent</label>
                  <Tooltip content="Expected monthly rent. Research comparable rentals in the area. For BRRRR/Buy-Hold, this should support positive cash flow after all expenses." />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="text" value={inputs.monthlyRent} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'monthlyRent')} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs font-semibold text-gray-600">Other Monthly Income</label>
                  <Tooltip content="Additional income: parking, storage, laundry, pet fees, etc." />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="text" value={inputs.otherMonthlyIncome} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'otherMonthlyIncome')} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs font-semibold text-gray-600">Vacancy Rate</label>
                  <Tooltip content="Expected vacancy percentage. 5-8% is typical. Higher for student housing or less desirable areas. Accounts for turnover time and collection loss." />
                </div>
                <div className="relative">
                  <input type="text" value={inputs.vacancyRate} onChange={(e) => handlePercentChange(e.target.value, handleInputChange, 'vacancyRate')} className="w-full pr-7 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Annual Expenses</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="text-xs font-semibold text-gray-600">Property Taxes</label>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                    <input type="text" value={inputs.propertyTaxes} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'propertyTaxes')} className="w-full pl-5 pr-2 py-2 border-2 border-gray-200 rounded-lg font-mono text-xs focus:border-sgf-green-500 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="text-xs font-semibold text-gray-600">Insurance</label>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                    <input type="text" value={inputs.insurance} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'insurance')} className="w-full pl-5 pr-2 py-2 border-2 border-gray-200 rounded-lg font-mono text-xs focus:border-sgf-green-500 focus:outline-none" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="text-xs font-semibold text-gray-600">Maintenance</label>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                    <input type="text" value={inputs.maintenance} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'maintenance')} className="w-full pl-5 pr-2 py-2 border-2 border-gray-200 rounded-lg font-mono text-xs focus:border-sgf-green-500 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="text-xs font-semibold text-gray-600">Mgmt %</label>
                  </div>
                  <div className="relative">
                    <input type="text" value={inputs.propertyManagement} onChange={(e) => handlePercentChange(e.target.value, handleInputChange, 'propertyManagement')} className="w-full pr-5 pl-2 py-2 border-2 border-gray-200 rounded-lg font-mono text-xs focus:border-sgf-green-500 focus:outline-none" />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="text-xs font-semibold text-gray-600">HOA (Monthly)</label>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                    <input type="text" value={inputs.hoa} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'hoa')} className="w-full pl-5 pr-2 py-2 border-2 border-gray-200 rounded-lg font-mono text-xs focus:border-sgf-green-500 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label className="text-xs font-semibold text-gray-600">Other</label>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                    <input type="text" value={inputs.otherExpenses} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'otherExpenses')} className="w-full pl-5 pr-2 py-2 border-2 border-gray-200 rounded-lg font-mono text-xs focus:border-sgf-green-500 focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financing */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Financing</span>
            </div>
            <div className="p-4 space-y-3">
              {strategy === 'fix-flip' ? (
                <>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <label className="text-xs font-semibold text-gray-600">Hard Money Rate</label>
                      <Tooltip content="Annual interest rate on hard money loan. Typically 10-15%. Used for short-term flips." />
                    </div>
                    <div className="relative">
                      <input type="text" value={inputs.hardMoneyRate} onChange={(e) => handlePercentChange(e.target.value, handleInputChange, 'hardMoneyRate')} className="w-full pr-7 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <label className="text-xs font-semibold text-gray-600">Points</label>
                      <Tooltip content="Upfront loan origination fee. 1-3 points typical. 1 point = 1% of loan amount." />
                    </div>
                    <div className="relative">
                      <input type="text" value={inputs.hardMoneyPoints} onChange={(e) => handlePercentChange(e.target.value, handleInputChange, 'hardMoneyPoints')} className="w-full pr-7 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">pts</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <label className="text-xs font-semibold text-gray-600">Hold Period</label>
                      <Tooltip content="Expected time from purchase to sale. Include rehab time + listing time + closing. Shorter = less holding costs." />
                    </div>
                    <div className="relative">
                      <input type="text" value={inputs.holdMonths} onChange={(e) => handlePercentChange(e.target.value, handleInputChange, 'holdMonths')} className="w-full pr-12 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">mos</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <label className="text-xs font-semibold text-gray-600">Selling Costs</label>
                      <Tooltip content="Total costs to sell: agent commission (5-6%), closing costs, staging, etc. Typically 8-10% of sale price." />
                    </div>
                    <div className="relative">
                      <input type="text" value={inputs.sellingCostsPercent} onChange={(e) => handlePercentChange(e.target.value, handleInputChange, 'sellingCostsPercent')} className="w-full pr-7 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <label className="text-xs font-semibold text-gray-600">Down Payment</label>
                      <Tooltip content="Percentage of purchase price as down payment. Investment properties typically require 20-25% down." />
                    </div>
                    <div className="relative">
                      <input type="text" value={inputs.downPaymentPercent} onChange={(e) => handlePercentChange(e.target.value, handleInputChange, 'downPaymentPercent')} className="w-full pr-7 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <label className="text-xs font-semibold text-gray-600">Interest Rate</label>
                      <Tooltip content="Annual mortgage interest rate. Investment property rates are typically 0.5-0.75% higher than primary residence rates." />
                    </div>
                    <div className="relative">
                      <input type="text" value={inputs.loanInterestRate} onChange={(e) => handlePercentChange(e.target.value, handleInputChange, 'loanInterestRate')} className="w-full pr-7 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <label className="text-xs font-semibold text-gray-600">Loan Term</label>
                      <Tooltip content="Mortgage term in years. 30-year is most common for investment properties. 15-year has higher payments but builds equity faster." />
                    </div>
                    <div className="relative">
                      <input type="text" value={inputs.loanTermYears} onChange={(e) => handlePercentChange(e.target.value, handleInputChange, 'loanTermYears')} className="w-full pr-10 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">yrs</span>
                    </div>
                  </div>
                  
                  {strategy === 'brrrr' && (
                    <>
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs font-semibold text-blue-600 mb-2">Refinance Terms</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <label className="text-xs font-semibold text-gray-600">Refi LTV</label>
                          <Tooltip content="Loan-to-Value for refinance based on ARV. 70-75% typical for investment cash-out refi." />
                        </div>
                        <div className="relative">
                          <input type="text" value={inputs.refinanceLTV} onChange={(e) => handlePercentChange(e.target.value, handleInputChange, 'refinanceLTV')} className="w-full pr-7 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-blue-500 focus:outline-none" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <label className="text-xs font-semibold text-gray-600">Refi Rate</label>
                          <Tooltip content="Interest rate on refinanced loan. May be slightly higher than purchase rate for cash-out refi." />
                        </div>
                        <div className="relative">
                          <input type="text" value={inputs.refinanceRate} onChange={(e) => handlePercentChange(e.target.value, handleInputChange, 'refinanceRate')} className="w-full pr-7 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-blue-500 focus:outline-none" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {strategy === 'buy-hold' && (
                    <>
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs font-semibold text-sgf-green-600 mb-2">Hold Assumptions</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">Hold Years</label>
                          <input type="text" value={inputs.holdPeriodYears} onChange={(e) => handlePercentChange(e.target.value, handleInputChange, 'holdPeriodYears')} className="w-full px-2 py-2 border-2 border-gray-200 rounded-lg font-mono text-xs focus:border-sgf-green-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">Apprec. %</label>
                          <input type="text" value={inputs.appreciationRate} onChange={(e) => handlePercentChange(e.target.value, handleInputChange, 'appreciationRate')} className="w-full px-2 py-2 border-2 border-gray-200 rounded-lg font-mono text-xs focus:border-sgf-green-500 focus:outline-none" />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <GatedCalculator requiredPlan="core" calculatorSlug="rei-pro">
        {outputs && (
          <>
            {/* Key Metrics Summary */}
            {strategy === 'buy-hold' && (
              <div className="grid md:grid-cols-6 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-xs font-medium text-gray-600">Cap Rate</div>
                    <Tooltip content="NOI ÷ Purchase Price. Measures property's unleveraged return. 5-10% typical depending on market." />
                  </div>
                  <div className={`text-2xl font-bold font-mono ${getMetricStatus(outputs.capRate, 5, 7)}`}>{outputs.capRate.toFixed(2)}%</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-xs font-medium text-gray-600">Cash-on-Cash</div>
                    <Tooltip content="Annual cash flow ÷ cash invested. Shows return on actual cash. 8-12% is good for rentals." />
                  </div>
                  <div className={`text-2xl font-bold font-mono ${getMetricStatus(outputs.cashOnCashReturn, 8, 12)}`}>{outputs.cashOnCashReturn.toFixed(1)}%</div>
                </div>
                
                <div className="bg-gradient-to-br from-sgf-green-50 to-sgf-green-100 rounded-xl p-4 border border-sgf-green-200">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-xs font-medium text-sgf-green-700">IRR</div>
                    <Tooltip content="Internal Rate of Return. Annualized return including cash flow, appreciation, and equity paydown. 15%+ is excellent." />
                  </div>
                  <div className="text-2xl font-bold font-mono text-sgf-green-700">{outputs.irr?.toFixed(1) || '--'}%</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-xs font-medium text-gray-600">Monthly Cash Flow</div>
                    <Tooltip content="Monthly income after all expenses and mortgage payment. Positive cash flow is essential for buy & hold." />
                  </div>
                  <div className={`text-2xl font-bold font-mono ${outputs.monthlyCashFlow >= 0 ? 'text-sgf-green-600' : 'text-red-600'}`}>{formatCurrency(outputs.monthlyCashFlow)}</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-xs font-medium text-gray-600">DSCR</div>
                    <Tooltip content="Debt Service Coverage Ratio. NOI ÷ Annual Debt Service. Lenders want 1.2x+. Higher = safer." />
                  </div>
                  <div className={`text-2xl font-bold font-mono ${getMetricStatus(outputs.dscr, 1.2, 1.4)}`}>{outputs.dscr.toFixed(2)}x</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-xs font-medium text-gray-600">GRM</div>
                    <Tooltip content="Gross Rent Multiplier. Price ÷ Annual Rent. Lower is better. Quick way to compare properties." />
                  </div>
                  <div className="text-2xl font-bold font-mono text-gray-900">{outputs.grossRentMultiplier.toFixed(1)}</div>
                </div>
              </div>
            )}
            
            {strategy === 'fix-flip' && (
              <div className="grid md:grid-cols-5 gap-4 mb-8">
                <div className={`rounded-xl p-4 border-2 ${outputs.meetsRule70 ? 'bg-sgf-green-50 border-sgf-green-300' : 'bg-red-50 border-red-300'}`}>
                  <div className="flex items-center gap-1 mb-1">
                    <div className={`text-xs font-medium ${outputs.meetsRule70 ? 'text-sgf-green-700' : 'text-red-700'}`}>70% Rule</div>
                    <Tooltip content="Max purchase = (ARV × 70%) - Rehab. Conservative rule to ensure profit margin. Passing = good deal." />
                  </div>
                  <div className={`text-xl font-bold ${outputs.meetsRule70 ? 'text-sgf-green-700' : 'text-red-700'}`}>{outputs.meetsRule70 ? '✓ PASS' : '✗ FAIL'}</div>
                  <div className="text-xs text-gray-500 mt-1">Max: {formatCurrency(outputs.maxPurchasePrice70)}</div>
                </div>
                
                <div className="bg-gradient-to-br from-sgf-gold-50 to-sgf-gold-100 rounded-xl p-4 border border-sgf-gold-200">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-xs font-medium text-sgf-gold-700">Net Profit</div>
                    <Tooltip content="Total profit after all costs, holding costs, and selling costs. This is your actual take-home." />
                  </div>
                  <div className={`text-2xl font-bold font-mono ${outputs.actualProfit >= 0 ? 'text-sgf-gold-700' : 'text-red-600'}`}>{formatCurrency(outputs.actualProfit)}</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-xs font-medium text-gray-600">ROI</div>
                    <Tooltip content="Return on Investment. Profit ÷ Cash Invested. Shows return on your actual cash in the deal." />
                  </div>
                  <div className={`text-2xl font-bold font-mono ${getMetricStatus(outputs.roi, 15, 25)}`}>{outputs.roi.toFixed(1)}%</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-xs font-medium text-gray-600">Annualized ROI</div>
                    <Tooltip content="ROI adjusted to annual basis. Useful for comparing to other investments or longer holds." />
                  </div>
                  <div className={`text-2xl font-bold font-mono ${getMetricStatus(outputs.annualizedROI, 30, 50)}`}>{outputs.annualizedROI.toFixed(1)}%</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-xs font-medium text-gray-600">Cash Needed</div>
                    <Tooltip content="Total cash required to complete the flip. Down payment + rehab + closing + holding costs." />
                  </div>
                  <div className="text-2xl font-bold font-mono text-gray-900">{formatCurrency(outputs.cashNeeded)}</div>
                </div>
              </div>
            )}
            
            {strategy === 'brrrr' && (
              <div className="grid md:grid-cols-5 gap-4 mb-8">
                <div className={`rounded-xl p-4 border-2 ${outputs.infiniteReturn ? 'bg-sgf-green-50 border-sgf-green-300' : 'bg-blue-50 border-blue-300'}`}>
                  <div className="flex items-center gap-1 mb-1">
                    <div className={`text-xs font-medium ${outputs.infiniteReturn ? 'text-sgf-green-700' : 'text-blue-700'}`}>Cash Left in Deal</div>
                    <Tooltip content="Cash remaining after refinance. If $0 or negative, you've pulled all your cash out = infinite return!" />
                  </div>
                  <div className={`text-xl font-bold ${outputs.infiniteReturn ? 'text-sgf-green-700' : 'text-blue-700'}`}>
                    {outputs.infiniteReturn ? '∞ INFINITE!' : formatCurrency(outputs.cashLeftInDeal)}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-xs font-medium text-blue-700">Cash Out from Refi</div>
                    <Tooltip content="Cash received from refinance. New loan amount minus original loan balance. Use to fund next deal!" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-blue-700">{formatCurrency(outputs.cashOutFromRefi)}</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-xs font-medium text-gray-600">Cash-on-Cash (Post-Refi)</div>
                    <Tooltip content="Annual cash flow ÷ cash left in deal after refi. Can be very high or infinite if you pulled all cash out." />
                  </div>
                  <div className={`text-2xl font-bold font-mono ${outputs.infiniteReturn ? 'text-sgf-green-600' : getMetricStatus(outputs.cashOnCashAfterRefi, 10, 20)}`}>
                    {outputs.infiniteReturn ? '∞' : `${outputs.cashOnCashAfterRefi.toFixed(1)}%`}
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-xs font-medium text-gray-600">Monthly Cash Flow</div>
                    <Tooltip content="Monthly cash flow after refinance. New payment will be higher due to larger loan amount." />
                  </div>
                  <div className={`text-2xl font-bold font-mono ${outputs.monthlyCashFlowAfterRefi >= 0 ? 'text-sgf-green-600' : 'text-red-600'}`}>
                    {formatCurrency(outputs.monthlyCashFlowAfterRefi)}
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-xs font-medium text-gray-600">DSCR (Post-Refi)</div>
                    <Tooltip content="Debt coverage after refinance. Must stay above 1.0x to cover payments. Watch this carefully!" />
                  </div>
                  <div className={`text-2xl font-bold font-mono ${getMetricStatus(outputs.dscrAfterRefi, 1.1, 1.25)}`}>{outputs.dscrAfterRefi.toFixed(2)}x</div>
                </div>
              </div>
            )}

            {/* Detailed Analysis Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {[
                    { id: 'summary', label: 'Summary', icon: Target },
                    { id: 'cashflow', label: 'Cash Flow', icon: DollarSign },
                    ...(strategy === 'buy-hold' ? [{ id: 'equity', label: 'Equity Build-Up', icon: TrendingUp }] : []),
                    ...(strategy !== 'fix-flip' ? [{ id: 'returns', label: 'Returns', icon: Percent }] : []),
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
                      <h3 className="font-semibold text-gray-900 mb-4">Investment Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                          <span className="text-gray-600">Purchase Price</span>
                          <span className="font-mono font-semibold">{formatCurrency(outputs.purchasePrice)}</span>
                        </div>
                        {(strategy === 'fix-flip' || strategy === 'brrrr') && (
                          <>
                            <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                              <span className="text-gray-600">Rehab Costs</span>
                              <span className="font-mono font-semibold">{formatCurrency(outputs.rehabCosts)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                              <span className="text-gray-600">After Repair Value</span>
                              <span className="font-mono font-semibold text-sgf-green-600">{formatCurrency(outputs.afterRepairValue)}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                          <span className="text-gray-600">Down Payment</span>
                          <span className="font-mono font-semibold">{formatCurrency(outputs.downPayment)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                          <span className="text-gray-600">Loan Amount</span>
                          <span className="font-mono font-semibold">{formatCurrency(outputs.loanAmount)}</span>
                        </div>
                        <div className="flex justify-between py-2 bg-gray-50 rounded px-2">
                          <span className="font-semibold text-gray-900">Total Cash Invested</span>
                          <span className="font-mono font-bold text-sgf-green-600">{formatCurrency(outputs.totalCashInvested)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Key Ratios</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                          <span className="text-gray-600">Cap Rate</span>
                          <span className="font-mono font-semibold">{outputs.capRate.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                          <span className="text-gray-600">Gross Rent Multiplier</span>
                          <span className="font-mono font-semibold">{outputs.grossRentMultiplier.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                          <span className="text-gray-600">DSCR</span>
                          <span className="font-mono font-semibold">{outputs.dscr.toFixed(2)}x</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                          <span className="text-gray-600">Break-Even Ratio</span>
                          <span className="font-mono font-semibold">{outputs.breakEvenRatio.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                          <span className="text-gray-600">Expense Ratio</span>
                          <span className="font-mono font-semibold">{outputs.expenseRatio.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'cashflow' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Annual Income</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                          <span className="text-gray-600">Gross Potential Rent</span>
                          <span className="font-mono">{formatCurrency(outputs.grossPotentialIncome)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200 text-red-600">
                          <span>Less: Vacancy</span>
                          <span className="font-mono">({formatCurrency(outputs.vacancyLoss)})</span>
                        </div>
                        <div className="flex justify-between py-2 bg-sgf-green-50 rounded px-2">
                          <span className="font-semibold text-sgf-green-700">Effective Gross Income</span>
                          <span className="font-mono font-bold text-sgf-green-700">{formatCurrency(outputs.effectiveGrossIncome)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Annual Expenses & Cash Flow</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200 text-red-600">
                          <span>Operating Expenses</span>
                          <span className="font-mono">({formatCurrency(outputs.totalAnnualExpenses)})</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                          <span className="font-semibold text-gray-900">Net Operating Income</span>
                          <span className="font-mono font-semibold">{formatCurrency(outputs.netOperatingIncome)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-dashed border-gray-200 text-red-600">
                          <span>Debt Service</span>
                          <span className="font-mono">({formatCurrency(outputs.annualDebtService)})</span>
                        </div>
                        <div className="flex justify-between py-2 bg-sgf-green-50 rounded px-2">
                          <span className="font-semibold text-sgf-green-700">Annual Cash Flow</span>
                          <span className={`font-mono font-bold ${outputs.annualCashFlow >= 0 ? 'text-sgf-green-700' : 'text-red-600'}`}>{formatCurrency(outputs.annualCashFlow)}</span>
                        </div>
                        <div className="flex justify-between py-2 mt-2">
                          <span className="text-gray-600">Monthly Cash Flow</span>
                          <span className={`font-mono font-semibold ${outputs.monthlyCashFlow >= 0 ? 'text-sgf-green-600' : 'text-red-600'}`}>{formatCurrency(outputs.monthlyCashFlow)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'equity' && strategy === 'buy-hold' && outputs.equitySchedule && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Year</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Property Value</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Loan Balance</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Equity</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Equity %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {outputs.equitySchedule.map((row: any) => (
                          <tr key={row.year} className={`hover:bg-gray-50 ${row.year === parseInt(inputs.holdPeriodYears) ? 'bg-sgf-green-50' : ''}`}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {row.year === 0 ? 'Start' : `Year ${row.year}`}
                              {row.year === parseInt(inputs.holdPeriodYears) && <span className="ml-2 text-xs bg-sgf-green-200 text-sgf-green-800 px-2 py-0.5 rounded">Exit</span>}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-mono">{formatCurrency(row.propertyValue)}</td>
                            <td className="px-4 py-3 text-sm text-right font-mono text-red-600">{formatCurrency(row.loanBalance)}</td>
                            <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-sgf-green-600">{formatCurrency(row.equity)}</td>
                            <td className="px-4 py-3 text-sm text-right font-mono">{row.equityPercent.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'returns' && strategy !== 'fix-flip' && (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-sgf-green-50 rounded-xl p-6 border border-sgf-green-200">
                      <h3 className="font-semibold text-sgf-green-800 mb-2">IRR (Annual Return)</h3>
                      <div className="text-4xl font-bold font-mono text-sgf-green-700 mb-2">{outputs.irr?.toFixed(1) || (strategy === 'brrrr' && outputs.infiniteReturn ? '∞' : '--')}%</div>
                      <p className="text-sm text-sgf-green-600">Annualized return over hold period</p>
                    </div>
                    <div className="bg-sgf-gold-50 rounded-xl p-6 border border-sgf-gold-200">
                      <h3 className="font-semibold text-sgf-gold-800 mb-2">Total ROI</h3>
                      <div className="text-4xl font-bold font-mono text-sgf-gold-700 mb-2">{outputs.totalROI?.toFixed(0) || '--'}%</div>
                      <p className="text-sm text-sgf-gold-600">Cumulative return on investment</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <h3 className="font-semibold text-blue-800 mb-2">Exit Equity</h3>
                      <div className="text-4xl font-bold font-mono text-blue-700 mb-2">{formatCurrency(outputs.exitEquity || 0)}</div>
                      <p className="text-sm text-blue-600">Equity at exit (Year {inputs.holdPeriodYears})</p>
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
                  <p className="text-sm text-gray-600">Create a free account to save, compare deals, and export reports</p>
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
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />Real Estate Financing
              </div>
              <h2 className="text-2xl font-bold mb-3">Finance Your Investment Property</h2>
              <p className="text-sgf-green-100 max-w-lg">Starting Gate Financial offers investment property loans, DSCR loans, bridge financing, and commercial real estate solutions for all investor strategies.</p>
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