'use client';

import { useState, useCallback, useEffect } from 'react';
import { DollarSign, Calculator, FileText, MessageSquare, Save, Download, Table, TrendingUp } from 'lucide-react';

interface LoanResult {
  monthlyPayment: number;
  totalPayments: number;
  totalInterest: number;
  totalPaid: number;
}

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(value);
};

const parseCurrencyInput = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
};

const formatInputValue = (value: string): string => {
  const num = parseCurrencyInput(value);
  if (isNaN(num) || num === 0) return value.replace(/[^0-9]/g, '');
  return num.toLocaleString('en-US');
};

const calculateLoan = (principal: number, annualRate: number, years: number): LoanResult | null => {
  if (!principal || !annualRate || !years) return null;
  
  const monthlyRate = (annualRate / 100) / 12;
  const numPayments = years * 12;
  
  if (monthlyRate === 0) {
    const monthlyPayment = principal / numPayments;
    return {
      monthlyPayment,
      totalPayments: numPayments,
      totalInterest: 0,
      totalPaid: principal,
    };
  }
  
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const totalPaid = monthlyPayment * numPayments;
  const totalInterest = totalPaid - principal;
  
  return {
    monthlyPayment,
    totalPayments: numPayments,
    totalInterest,
    totalPaid,
  };
};

const generateAmortization = (principal: number, annualRate: number, years: number): AmortizationRow[] => {
  const monthlyRate = (annualRate / 100) / 12;
  const numPayments = years * 12;
  
  if (monthlyRate === 0) {
    const monthlyPayment = principal / numPayments;
    const schedule: AmortizationRow[] = [];
    let balance = principal;
    
    for (let month = 1; month <= numPayments; month++) {
      balance -= monthlyPayment;
      schedule.push({
        month,
        payment: monthlyPayment,
        principal: monthlyPayment,
        interest: 0,
        balance: Math.max(0, balance),
      });
    }
    return schedule;
  }
  
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const schedule: AmortizationRow[] = [];
  let balance = principal;
  
  for (let month = 1; month <= numPayments; month++) {
    const interest = balance * monthlyRate;
    const principalPayment = monthlyPayment - interest;
    balance -= principalPayment;
    
    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest,
      balance: Math.max(0, balance),
    });
  }
  
  return schedule;
};

export default function BusinessLoanCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [loanTerm, setLoanTerm] = useState<string>('');
  const [result, setResult] = useState<LoanResult | null>(null);
  const [amortization, setAmortization] = useState<AmortizationRow[]>([]);
  const [showFullTable, setShowFullTable] = useState(false);

  const calculate = useCallback(() => {
    const principal = parseCurrencyInput(loanAmount);
    const rate = parseFloat(interestRate) || 0;
    const years = parseInt(loanTerm) || 0;
    
    const loanResult = calculateLoan(principal, rate, years);
    setResult(loanResult);
    
    if (loanResult) {
      const schedule = generateAmortization(principal, rate, years);
      setAmortization(schedule);
    } else {
      setAmortization([]);
    }
  }, [loanAmount, interestRate, loanTerm]);

  useEffect(() => { calculate(); }, [calculate]);

  const handleCurrencyInput = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter(formatInputValue(value));
  };

  const handleSaveLoan = () => {
    if (!result) {
      alert('Please calculate loan first');
      return;
    }

    const loanData = {
      inputs: {
        loanAmount: parseCurrencyInput(loanAmount),
        interestRate: parseFloat(interestRate) || 0,
        loanTerm: parseInt(loanTerm) || 0,
      },
      outputs: {
        monthlyPayment: result.monthlyPayment,
        totalPayments: result.totalPayments,
        totalInterest: result.totalInterest,
        totalPaid: result.totalPaid,
      },
      amortization: amortization,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('pendingBusinessLoanAnalysis', JSON.stringify(loanData));
    console.log('Business Loan data saved to localStorage:', loanData);
    window.location.href = '/api/auth/signin?callbackUrl=/app/deals/new';
  };

  const handleExportCSV = () => {
    if (amortization.length === 0) return;
    
    let csv = 'Month,Payment,Principal,Interest,Balance\n';
    amortization.forEach(row => {
      csv += `${row.month},${row.payment.toFixed(2)},${row.principal.toFixed(2)},${row.interest.toFixed(2)},${row.balance.toFixed(2)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan-amortization-${Date.now()}.csv`;
    a.click();
  };

  const displayRows = showFullTable ? amortization : amortization.slice(0, 12);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sgf-green-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="bg-gradient-to-r from-sgf-green-500 via-sgf-green-600 to-sgf-green-700 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Free Calculator
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Business Loan Calculator</h1>
              <p className="text-sgf-green-100 mt-2 max-w-2xl mx-auto">
                Calculate monthly payments, total interest, and view complete amortization schedule
              </p>
            </div>
          </div>
        </div>

        {/* Calculator Cards - 3 Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Card 1: Loan Input */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Loan Details</span>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">STEP 1</span>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="loanAmount" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Loan Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <input
                    id="loanAmount"
                    type="text"
                    value={loanAmount}
                    onChange={(e) => handleCurrencyInput(e.target.value, setLoanAmount)}
                    placeholder="500,000"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg font-mono text-lg focus:border-sgf-green-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="interestRate" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Interest Rate (Annual %)
                </label>
                <div className="relative">
                  <input
                    id="interestRate"
                    type="text"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="7.5"
                    className="w-full pr-8 pl-4 py-3 border-2 border-gray-200 rounded-lg font-mono text-lg focus:border-sgf-green-500 focus:outline-none transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                </div>
              </div>
              <div>
                <label htmlFor="loanTerm" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Loan Term (Years)
                </label>
                <input
                  id="loanTerm"
                  type="text"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  placeholder="10"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-mono text-lg focus:border-sgf-green-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Payment Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Payment Summary</span>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">STEP 2</span>
            </div>
            <div className="p-6">
              {result ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <span className="text-4xl md:text-5xl font-bold font-mono text-sgf-green-500">
                      {formatCurrency(result.monthlyPayment)}
                    </span>
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-2">Monthly Payment</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                      <span className="text-sm text-gray-600">Number of Payments</span>
                      <span className="font-mono font-semibold text-gray-900">{result.totalPayments}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                      <span className="text-sm text-gray-600">Total Amount Paid</span>
                      <span className="font-mono font-semibold text-gray-900">{formatCurrency(result.totalPaid)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm font-semibold text-gray-900">Total Interest</span>
                      <span className="font-mono font-bold text-xl text-red-600">{formatCurrency(result.totalInterest)}</span>
                    </div>
                  </div>

                  <div className="mt-4 bg-sgf-green-50 border border-sgf-green-200 rounded-lg px-4 py-3">
                    <p className="text-xs text-sgf-green-700">
                      Interest is {((result.totalInterest / parseCurrencyInput(loanAmount)) * 100).toFixed(1)}% of your loan amount
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Enter loan details to calculate</p>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${result ? 'bg-sgf-green-500' : 'bg-gray-400'}`}>
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Actions</span>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">RESULT</span>
            </div>
            <div className="p-6">
              {result ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <div className="text-sm text-gray-600 mb-3">Ready to save and analyze</div>
                    <div className="space-y-3">
                      <button 
                        onClick={handleSaveLoan}
                        className="block w-full bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 hover:from-sgf-green-600 hover:to-sgf-green-700 text-white text-center py-3 px-6 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all group"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          Save This Analysis
                        </div>
                      </button>
                      
                      {amortization.length > 0 && (
                        <button 
                          onClick={handleExportCSV}
                          className="block w-full bg-white border-2 border-gray-300 text-gray-700 text-center py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Download className="w-5 h-5" />
                            Export Table (CSV)
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-center text-gray-500">
                    Create a free account to save unlimited calculations
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-sm text-gray-500">Calculate loan to enable actions</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amortization Table */}
        {amortization.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                  <Table className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Amortization Schedule</span>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                {amortization.length} PAYMENTS
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Month</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Payment</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Principal</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Interest</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayRows.map((row, index) => (
                    <tr key={row.month} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{row.month}</td>
                      <td className="px-6 py-3 text-sm font-mono text-right text-gray-900">{formatCurrency(row.payment)}</td>
                      <td className="px-6 py-3 text-sm font-mono text-right text-sgf-green-600 font-semibold">{formatCurrency(row.principal)}</td>
                      <td className="px-6 py-3 text-sm font-mono text-right text-red-600">{formatCurrency(row.interest)}</td>
                      <td className="px-6 py-3 text-sm font-mono text-right font-bold text-gray-900">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {amortization.length > 12 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
                <button
                  onClick={() => setShowFullTable(!showFullTable)}
                  className="text-sgf-green-500 hover:text-sgf-green-600 font-semibold text-sm transition-colors"
                >
                  {showFullTable ? '← Show First Year Only' : `View All ${amortization.length} Payments →`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Financing CTA */}
        <div className="mt-12 bg-gradient-to-r from-sgf-green-500 via-sgf-green-600 to-sgf-green-700 rounded-2xl p-8 md:p-10 text-white relative overflow-hidden">
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
