'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { DollarSign, Calculator, BarChart3, FileText, MessageSquare, Calendar, TrendingDown, Save, Download } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import PremiumProductsCTA from '@/components/core/PremiumProductsCTA';

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const formatCurrencyDetailed = (value: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const parseCurrencyInput = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
};

const formatInputValue = (value: string): string => {
  const num = parseCurrencyInput(value);
  if (isNaN(num) || num === 0) return value.replace(/[^0-9]/g, '');
  return num.toLocaleString('en-US');
};

export default function BusinessLoanCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState<string>('500,000');
  const [interestRate, setInterestRate] = useState<string>('7.5');
  const [loanTerm, setLoanTerm] = useState<string>('10');
  const [showFullSchedule, setShowFullSchedule] = useState<boolean>(false);

  const handleCurrencyInput = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter(formatInputValue(value));
  };

  // Calculate loan details
  const loanDetails = useMemo(() => {
    const principal = parseCurrencyInput(loanAmount);
    const rate = parseFloat(interestRate) || 0;
    const years = parseInt(loanTerm) || 0;

    if (!principal || !rate || !years) {
      return null;
    }

    const monthlyRate = (rate / 100) / 12;
    const numPayments = years * 12;
    
    // Monthly payment calculation
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    const totalPayments = monthlyPayment * numPayments;
    const totalInterest = totalPayments - principal;

    // Generate amortization schedule
    const schedule: AmortizationRow[] = [];
    let balance = principal;
    
    for (let month = 1; month <= numPayments; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance = Math.max(0, balance - principalPayment);
      
      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance,
      });
    }

    // Calculate yearly summaries
    const yearlySummary = [];
    for (let year = 1; year <= years; year++) {
      const startMonth = (year - 1) * 12;
      const endMonth = year * 12;
      const yearRows = schedule.slice(startMonth, endMonth);
      
      yearlySummary.push({
        year,
        totalPrincipal: yearRows.reduce((sum, row) => sum + row.principal, 0),
        totalInterest: yearRows.reduce((sum, row) => sum + row.interest, 0),
        endingBalance: yearRows[yearRows.length - 1]?.balance || 0,
      });
    }

    return {
      monthlyPayment,
      totalPayments,
      totalInterest,
      schedule,
      yearlySummary,
      principal,
      rate,
      years,
    };
  }, [loanAmount, interestRate, loanTerm]);

  const handleSaveLoan = () => {
    if (!loanDetails) {
      alert('Please enter loan details first');
      return;
    }

    const loanData = {
      type: 'business-loan',
      inputs: {
        loanAmount: loanDetails.principal,
        interestRate: loanDetails.rate,
        loanTerm: loanDetails.years,
      },
      outputs: {
        monthlyPayment: loanDetails.monthlyPayment,
        totalPayments: loanDetails.totalPayments,
        totalInterest: loanDetails.totalInterest,
      },
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('pendingLoanAnalysis', JSON.stringify(loanData));
    window.location.href = '/api/auth/signin?callbackUrl=/app/deals/new';
  };

  const exportToCSV = () => {
    if (!loanDetails) return;

    const headers = ['Month', 'Payment', 'Principal', 'Interest', 'Balance'];
    const rows = loanDetails.schedule.map(row => [
      row.month,
      row.payment.toFixed(2),
      row.principal.toFixed(2),
      row.interest.toFixed(2),
      row.balance.toFixed(2),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amortization-schedule-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
              <h1 className="text-2xl md:text-3xl font-bold text-white">Business Loan Calculator</h1>
              <p className="text-sgf-green-100 mt-2 max-w-2xl mx-auto">
                Calculate payments, total interest, and view full amortization schedules
              </p>
            </div>
          </div>
        </div>

        {/* Calculator Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Loan Details */}
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
                <div className="flex items-center gap-2 mb-2">
                  <label htmlFor="loanAmount" className="text-sm font-semibold text-gray-700">Loan Amount</label>
                  <Tooltip content="Total principal amount of the loan" />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <input
                    id="loanAmount"
                    type="text"
                    value={loanAmount}
                    onChange={(e) => handleCurrencyInput(e.target.value, setLoanAmount)}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg font-mono text-lg focus:border-sgf-green-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label htmlFor="interestRate" className="text-sm font-semibold text-gray-700">Interest Rate</label>
                  <Tooltip content="Annual interest rate (APR)" />
                </div>
                <div className="relative">
                  <input
                    id="interestRate"
                    type="text"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="0.00"
                    className="w-full pr-8 pl-4 py-3 border-2 border-gray-200 rounded-lg font-mono text-lg focus:border-sgf-green-500 focus:outline-none transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label htmlFor="loanTerm" className="text-sm font-semibold text-gray-700">Loan Term</label>
                  <Tooltip content="Loan amortization period in years" />
                </div>
                <div className="relative">
                  <input
                    id="loanTerm"
                    type="text"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                    placeholder="10"
                    className="w-full pr-16 pl-4 py-3 border-2 border-gray-200 rounded-lg font-mono text-lg focus:border-sgf-green-500 focus:outline-none transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">years</span>
                </div>
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
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">RESULT</span>
            </div>
            <div className="p-6">
              {loanDetails ? (
                <div className="space-y-4">
                  <div className="bg-sgf-green-50 rounded-xl p-6 text-center border border-sgf-green-200">
                    <span className="text-4xl font-bold font-mono text-sgf-green-600">
                      {formatCurrencyDetailed(loanDetails.monthlyPayment)}
                    </span>
                    <div className="text-sm font-semibold text-sgf-green-700 mt-1">Monthly Payment</div>
                  </div>
                  
                  <div className="space-y-3 pt-4">
                    <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                      <span className="text-sm text-gray-600">Loan Amount</span>
                      <span className="font-mono font-semibold">{formatCurrency(loanDetails.principal)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                      <span className="text-sm text-gray-600">Total Interest</span>
                      <span className="font-mono font-semibold text-sgf-gold-600">{formatCurrency(loanDetails.totalInterest)}</span>
                    </div>
                    <div className="flex justify-between py-2 bg-gray-50 rounded-lg px-3">
                      <span className="text-sm font-semibold text-gray-900">Total Payments</span>
                      <span className="font-mono font-bold text-sgf-green-600">{formatCurrency(loanDetails.totalPayments)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Enter loan details to see payment summary
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Actions</span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <button 
                onClick={handleSaveLoan}
                disabled={!loanDetails}
                className="w-full bg-gradient-to-r from-sgf-green-600 to-sgf-green-700 hover:from-sgf-green-700 hover:to-sgf-green-800 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 px-6 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save This Analysis
              </button>
              <p className="text-xs text-center text-gray-500">
                Create a free account to save unlimited calculations
              </p>
              
              <div className="border-t border-gray-200 pt-4">
                <button 
                  onClick={exportToCSV}
                  disabled={!loanDetails}
                  className="w-full bg-white border-2 border-sgf-gold-500 text-sgf-gold-600 hover:bg-sgf-gold-50 disabled:border-gray-300 disabled:text-gray-400 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export Amortization (CSV)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Amortization Schedule */}
        {loanDetails && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Amortization Schedule</span>
              </div>
              <button
                onClick={() => setShowFullSchedule(!showFullSchedule)}
                className="text-sm font-semibold text-sgf-green-600 hover:text-sgf-green-700"
              >
                {showFullSchedule ? 'Show Yearly Summary' : 'Show Full Schedule'}
              </button>
            </div>
            
            <div className="overflow-x-auto">
              {showFullSchedule ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Month</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Payment</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Principal</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Interest</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loanDetails.schedule.map((row) => (
                      <tr key={row.month} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.month}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono">{formatCurrencyDetailed(row.payment)}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono text-sgf-green-600">{formatCurrencyDetailed(row.principal)}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono text-sgf-gold-600">{formatCurrencyDetailed(row.interest)}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono font-semibold">{formatCurrencyDetailed(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Year</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Principal Paid</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Interest Paid</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ending Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loanDetails.yearlySummary.map((row) => (
                      <tr key={row.year} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Year {row.year}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono text-sgf-green-600">{formatCurrency(row.totalPrincipal)}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono text-sgf-gold-600">{formatCurrency(row.totalInterest)}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono font-semibold">{formatCurrency(row.endingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

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
