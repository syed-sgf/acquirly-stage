'use client';

import { useState, useCallback, useEffect } from 'react';
import { DollarSign, Calculator, BarChart3, FileText, MessageSquare, AlertCircle, CheckCircle, AlertTriangle, Save } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import DSCRLegend from '@/components/core/DSCRLegend';
import FlowIndicator from '@/components/core/FlowIndicator';
import PremiumProductsCTA from '@/components/core/PremiumProductsCTA';

interface DSCRResult {
  value: number;
  colorClass: 'red' | 'amber' | 'green';
  status: string;
  statusDescription: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
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
  e: React.ChangeEvent<HTMLInputElement>,
  setter: React.Dispatch<React.SetStateAction<string>>
) => {
  const rawValue = e.target.value;
  
  // Allow empty input to become "0"
  if (rawValue === '' || rawValue === '$') {
    setter('0');
    return;
  }
  
  // Remove all non-numeric characters except decimal
  const numericValue = rawValue.replace(/[^0-9]/g, '');
  
  // Parse to number and format with commas
  const number = parseInt(numericValue, 10);
  if (!isNaN(number)) {
    setter(formatNumberWithCommas(number));
  }
};

const handlePercentChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setter: React.Dispatch<React.SetStateAction<string>>
) => {
  const rawValue = e.target.value;
  
  // Allow empty to become "0"
  if (rawValue === '') {
    setter('0');
    return;
  }
  
  // Allow numbers and one decimal point
  const cleaned = rawValue.replace(/[^0-9.]/g, '');
  
  // Prevent multiple decimal points
  const parts = cleaned.split('.');
  if (parts.length > 2) return;
  
  // Limit decimal places to 2
  if (parts[1] && parts[1].length > 2) return;
  
  setter(cleaned);
};

const handleYearChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setter: React.Dispatch<React.SetStateAction<string>>
) => {
  const rawValue = e.target.value;
  
  if (rawValue === '') {
    setter('0');
    return;
  }
  
  const numericValue = rawValue.replace(/[^0-9]/g, '');
  const number = parseInt(numericValue, 10);
  
  if (!isNaN(number) && number <= 30) {
    setter(number.toString());
  }
};

const calculateMonthlyPayment = (principal: number, annualRate: number, years: number): number => {
  if (!principal || !annualRate || !years) return 0;
  const monthlyRate = (annualRate / 100) / 12;
  const numPayments = years * 12;
  if (monthlyRate === 0) return principal / numPayments;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
};

const getDSCRResult = (dscr: number): DSCRResult => {
  if (dscr <= 1.15) {
    return { value: dscr, colorClass: 'red', status: 'High Risk', statusDescription: 'Likely loan decline - insufficient cash flow coverage' };
  }
  if (dscr <= 1.24) {
    return { value: dscr, colorClass: 'amber', status: 'Marginal', statusDescription: 'May need restructuring - consider higher down payment or longer term' };
  }
  return { value: dscr, colorClass: 'green', status: 'Bankable', statusDescription: 'Meets lender requirements - strong debt coverage' };
};

export default function DSCRCalculatorPage() {
  const [sde, setSde] = useState<string>('0');
  const [capex, setCapex] = useState<string>('0');
  const [loanAmount, setLoanAmount] = useState<string>('0');
  const [interestRate, setInterestRate] = useState<string>('0');
  const [loanTerm, setLoanTerm] = useState<string>('10');
  const [lendableCF, setLendableCF] = useState<number>(0);
  const [annualDebtService, setAnnualDebtService] = useState<number>(0);
  const [dscrResult, setDscrResult] = useState<DSCRResult | null>(null);

  const calculateDSCR = useCallback(() => {
    const sdeValue = parseCurrencyInput(sde);
    const capexValue = parseCurrencyInput(capex);
    const loanAmountValue = parseCurrencyInput(loanAmount);
    const interestRateValue = parseFloat(interestRate) || 0;
    const loanTermValue = parseInt(loanTerm) || 0;
    
    const lcf = sdeValue - capexValue;
    setLendableCF(lcf);
    
    const monthlyPayment = calculateMonthlyPayment(loanAmountValue, interestRateValue, loanTermValue);
    const ads = monthlyPayment * 12;
    setAnnualDebtService(ads);
    
    if (lcf > 0 && ads > 0) {
      setDscrResult(getDSCRResult(lcf / ads));
    } else {
      setDscrResult(null);
    }
  }, [sde, capex, loanAmount, interestRate, loanTerm]);

  const handleSaveDSCR = () => {
    if (!dscrResult) {
      alert('Please calculate DSCR first');
      return;
    }

    const dscrData = {
      dscr: dscrResult.value,
      inputs: {
        revenue: parseCurrencyInput(sde),
        expenses: parseCurrencyInput(capex),
        loanAmount: parseCurrencyInput(loanAmount),
        interestRate: parseFloat(interestRate) || 0,
        loanTerm: parseInt(loanTerm) || 0,
      },
      outputs: {
        netCashFlow: lendableCF,
        annualDebtService: annualDebtService,
        dscr: dscrResult.value,
        status: dscrResult.status,
      },
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('pendingDSCRAnalysis', JSON.stringify(dscrData));
    window.location.href = '/api/auth/signin?callbackUrl=/app/deals/new';
  };

  useEffect(() => { calculateDSCR(); }, [calculateDSCR]);

  const getStatusIcon = (colorClass: string) => {
    switch (colorClass) {
      case 'red': return <AlertCircle className="w-5 h-5" />;
      case 'amber': return <AlertTriangle className="w-5 h-5" />;
      case 'green': return <CheckCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  const getColorClass = (colorClass: string) => {
    switch (colorClass) {
      case 'red': return 'text-red-600';
      case 'amber': return 'text-sgf-gold-500';
      case 'green': return 'text-sgf-green-500';
      default: return 'text-gray-500';
    }
  };

  const getBadgeClass = (colorClass: string) => {
    switch (colorClass) {
      case 'red': return 'bg-red-50 text-red-700 border border-red-200';
      case 'amber': return 'bg-sgf-gold-50 text-sgf-gold-700 border border-sgf-gold-200';
      case 'green': return 'bg-sgf-green-50 text-sgf-green-700 border border-sgf-green-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sgf-green-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="bg-gradient-to-r from-sgf-green-600 via-sgf-green-700 to-sgf-green-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Free Calculator
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">DSCR Calculator</h1>
              <p className="text-sgf-green-100 mt-2 max-w-2xl mx-auto">
                Debt Service Coverage Ratio Analysis
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <DSCRLegend />

        {/* Flow Indicator */}
        <FlowIndicator />

        {/* Calculator Cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Card 1: Business Cash Flow */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Business Cash Flow</span>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">STEP 1</span>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label htmlFor="sde" className="text-sm font-semibold text-gray-700">Annual SDE / EBITDA</label>
                  <Tooltip content="Seller's Discretionary Earnings (SDE) or EBITDA represents the total cash flow available to service debt. This includes net profit plus owner salary, benefits, and one-time expenses added back." />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <input
                    id="sde"
                    type="text"
                    value={sde}
                    onChange={(e) => handleCurrencyChange(e, setSde)}
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg font-mono text-lg focus:border-sgf-green-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label htmlFor="capex" className="text-sm font-semibold text-gray-700">Less: Annual CAPEX</label>
                  <Tooltip content="Capital Expenditures (CAPEX) are funds used to acquire, upgrade, or maintain physical assets like equipment, vehicles, or property improvements. Lenders subtract this from cash flow." />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <input
                    id="capex"
                    type="text"
                    value={capex}
                    onChange={(e) => handleCurrencyChange(e, setCapex)}
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg font-mono text-lg focus:border-sgf-green-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="pt-4 border-t-2 border-dashed border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Lendable Cash Flow</span>
                    <Tooltip content="The cash flow amount lenders use to determine loan qualification. Calculated as SDE/EBITDA minus CAPEX. This is the money available to make loan payments." />
                  </div>
                  <span className="text-xl font-bold font-mono text-sgf-green-600">{formatCurrency(lendableCF)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Debt Assumptions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Debt Assumptions</span>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">STEP 2</span>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label htmlFor="loanAmount" className="text-sm font-semibold text-gray-700">Loan Amount</label>
                  <Tooltip content="The total principal amount you're borrowing. This includes bank loans, SBA loans, and seller financing combined. Higher loan amounts increase your debt service payments." />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <input
                    id="loanAmount"
                    type="text"
                    value={loanAmount}
                    onChange={(e) => handleCurrencyChange(e, setLoanAmount)}
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg font-mono text-lg focus:border-sgf-gold-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label htmlFor="interestRate" className="text-sm font-semibold text-gray-700">Interest Rate</label>
                  <Tooltip content="The annual interest rate (APR) on your loan. SBA loans typically range from Prime + 2.25% to Prime + 2.75%. Conventional loans may be higher. Enter as a percentage (e.g., 8.5)." />
                </div>
                <div className="relative">
                  <input
                    id="interestRate"
                    type="text"
                    value={interestRate}
                    onChange={(e) => handlePercentChange(e, setInterestRate)}
                    placeholder="0.00"
                    className="w-full pr-8 pl-4 py-3 border-2 border-gray-200 rounded-lg font-mono text-lg focus:border-sgf-gold-500 focus:outline-none transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label htmlFor="loanTerm" className="text-sm font-semibold text-gray-700">Loan Term (Years)</label>
                  <Tooltip content="The amortization period in years. SBA 7(a) loans typically amortize over 10 years for business acquisitions. Longer terms mean lower monthly payments but more total interest paid." />
                </div>
                <input
                  id="loanTerm"
                  type="text"
                  value={loanTerm}
                  onChange={(e) => handleYearChange(e, setLoanTerm)}
                  placeholder="10"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-mono text-lg focus:border-sgf-gold-500 focus:outline-none transition-colors"
                />
              </div>
              <div className="pt-4 border-t-2 border-dashed border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Annual Debt Service</span>
                    <Tooltip content="Total annual loan payments (principal + interest). This is calculated by multiplying the monthly payment by 12. Lenders compare this to your cash flow to determine DSCR." />
                  </div>
                  <span className="text-xl font-bold font-mono text-sgf-gold-600">{formatCurrency(annualDebtService)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: DSCR Result */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${dscrResult ? (dscrResult.colorClass === 'green' ? 'bg-sgf-green-500' : dscrResult.colorClass === 'amber' ? 'bg-sgf-gold-500' : 'bg-red-500') : 'bg-gray-400'}`}>
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">DSCR Result</span>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">RESULT</span>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <span className={`text-5xl md:text-6xl font-bold font-mono ${dscrResult ? getColorClass(dscrResult.colorClass) : 'text-gray-300'}`}>
                  {dscrResult ? `${dscrResult.value.toFixed(2)}x` : '--'}
                </span>
                <div className="flex items-center justify-center gap-2 mt-2 mb-4">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Debt Service Coverage Ratio</span>
                  <Tooltip content="DSCR measures how many times your cash flow can cover your debt payments. Lenders typically require 1.25x or higher. Below 1.0x means you can't cover payments from business cash flow alone." />
                </div>
                {dscrResult && (
                  <>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getBadgeClass(dscrResult.colorClass)}`}>
                      {getStatusIcon(dscrResult.colorClass)}
                      {dscrResult.status}
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-200 text-left space-y-3">
                      <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                        <span className="text-sm text-gray-600">Lendable Cash Flow</span>
                        <span className="font-mono font-semibold text-sgf-green-600">{formatCurrency(lendableCF)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                        <span className="text-sm text-gray-600">÷ Total Annual Debt Service</span>
                        <span className="font-mono font-semibold text-sgf-gold-600">{formatCurrency(annualDebtService)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-semibold text-gray-900">= DSCR</span>
                        <span className={`font-mono font-bold text-xl ${getColorClass(dscrResult.colorClass)}`}>{dscrResult.value.toFixed(2)}x</span>
                      </div>
                    </div>
                    <div className="mt-4 bg-sgf-green-50 border border-sgf-green-200 rounded-lg px-4 py-3">
                      <p className="text-xs font-mono text-sgf-green-700">DSCR = Lendable CF ÷ Total Annual Debt Service</p>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">{dscrResult.statusDescription}</p>
                    
                    {/* Save Analysis CTA */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <button 
                        onClick={handleSaveDSCR}
                        className="block w-full bg-gradient-to-r from-sgf-green-600 to-sgf-green-700 hover:from-sgf-green-700 hover:to-sgf-green-800 text-white text-center py-3 px-6 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all group"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          Save This Analysis
                        </div>
                      </button>
                      <p className="mt-2 text-xs text-center text-gray-500">
                        Create a free account to save unlimited calculations
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Premium Products CTA */}
        <PremiumProductsCTA />

        {/* Financing CTA Section */}
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