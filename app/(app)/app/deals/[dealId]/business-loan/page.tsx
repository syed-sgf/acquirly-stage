'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calculator, DollarSign, Percent, Clock, RefreshCw, TrendingUp } from 'lucide-react';

interface BusinessLoanAnalysis {
  id: string;
  type: string;
  name: string;
  inputs: {
    loanAmount: number;
    interestRate: number;
    loanTerm: number;
  };
  outputs: {
    monthlyPayment: number;
    totalPayments: number;
    totalInterest: number;
    totalPaid: number;
  };
  createdAt: string;
  updatedAt: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatCurrencyShort = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function DealBusinessLoanPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.dealId as string;

  const [analysis, setAnalysis] = useState<BusinessLoanAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/deals/${dealId}/analyses`);
        if (!response.ok) {
          throw new Error('Failed to fetch analyses');
        }
        
        const analyses = await response.json();
        
        // Find the most recent business-loan analysis
        const businessLoanAnalysis = analyses
          .filter((a: BusinessLoanAnalysis) => a.type === 'business-loan')
          .sort((a: BusinessLoanAnalysis, b: BusinessLoanAnalysis) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];
        
        setAnalysis(businessLoanAnalysis || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [dealId]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading analysis...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href={`/app/deals/${dealId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Deal
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Calculator className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Business Loan Analysis Yet</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Calculate loan payments, total interest, and view a complete amortization schedule for this deal.
          </p>
          <Link
            href="/business-loan"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition"
          >
            <Calculator className="w-5 h-5" />
            Calculate Business Loan
          </Link>
        </div>
      </div>
    );
  }

  const { inputs, outputs } = analysis;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href={`/app/deals/${dealId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Deal
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Calculator className="w-7 h-7 text-emerald-600" />
            Business Loan Analysis
          </h1>
          <p className="text-gray-500 mt-1">
            Last updated: {new Date(analysis.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <Link
          href="/business-loan"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          New Calculation
        </Link>
      </div>

      {/* Loan Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          Loan Details
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Loan Amount</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrencyShort(inputs.loanAmount)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Interest Rate</div>
            <div className="text-2xl font-bold text-gray-900">{inputs.interestRate}%</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Loan Term</div>
            <div className="text-2xl font-bold text-gray-900">{inputs.loanTerm} years</div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 opacity-80" />
            <span className="text-sm font-medium opacity-90">Monthly Payment</span>
          </div>
          <div className="text-3xl font-bold">{formatCurrency(outputs.monthlyPayment)}</div>
          <div className="text-sm opacity-80 mt-1">{outputs.totalPayments} payments</div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-4 h-4 opacity-80" />
            <span className="text-sm font-medium opacity-90">Total Interest</span>
          </div>
          <div className="text-3xl font-bold">{formatCurrencyShort(outputs.totalInterest)}</div>
          <div className="text-sm opacity-80 mt-1">
            {((outputs.totalInterest / inputs.loanAmount) * 100).toFixed(1)}% of principal
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 opacity-80" />
            <span className="text-sm font-medium opacity-90">Total Cost</span>
          </div>
          <div className="text-3xl font-bold">{formatCurrencyShort(outputs.totalPaid)}</div>
          <div className="text-sm opacity-80 mt-1">Principal + Interest</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 opacity-80" />
            <span className="text-sm font-medium opacity-90">Annual Payment</span>
          </div>
          <div className="text-3xl font-bold">{formatCurrencyShort(outputs.monthlyPayment * 12)}</div>
          <div className="text-sm opacity-80 mt-1">For DSCR calculations</div>
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Breakdown</h3>
        <div className="flex items-center gap-8">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-200" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-emerald-500"
                strokeWidth="3"
                strokeDasharray={`${(inputs.loanAmount / outputs.totalPaid) * 100} 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {((inputs.loanAmount / outputs.totalPaid) * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500">Principal</div>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                <span className="text-gray-700">Principal</span>
              </div>
              <span className="font-bold text-gray-900">{formatCurrencyShort(inputs.loanAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded"></div>
                <span className="text-gray-700">Interest</span>
              </div>
              <span className="font-bold text-gray-900">{formatCurrencyShort(outputs.totalInterest)}</span>
            </div>
            <div className="border-t pt-3 flex items-center justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-xl text-gray-900">{formatCurrencyShort(outputs.totalPaid)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold mb-1">Need Financing for This Deal?</h3>
            <p className="opacity-90">Starting Gate Financial can help you secure the best terms.</p>
          </div>
          
            href="https://startinggatefinancial.com/apply"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-lg font-bold hover:bg-emerald-50 transition whitespace-nowrap"
          >
            Apply for Financing
          </a>
        </div>
      </div>
    </div>
  );
}
