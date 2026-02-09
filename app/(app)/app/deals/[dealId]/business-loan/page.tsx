'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calculator, DollarSign, Percent, Clock, RefreshCw, TrendingUp } from 'lucide-react';
import BusinessLoanExportButton from '@/components/calculators/BusinessLoanExportButton';

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
  const dealId = params.dealId as string;
  const [analysis, setAnalysis] = useState<BusinessLoanAnalysis | null>(null);
  const [dealName, setDealName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch deal info
        const dealResponse = await fetch(`/api/deals/${dealId}`);
        if (dealResponse.ok) {
          const dealData = await dealResponse.json();
          setDealName(dealData.name || '');
        }

        // Fetch analyses
        const response = await fetch(`/api/deals/${dealId}/analyses`);
        if (!response.ok) throw new Error('Failed to fetch analyses');
        const analyses = await response.json();
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
    fetchData();
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
          <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700">
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
        <Link href={`/app/deals/${dealId}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Deal
        </Link>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Calculator className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Business Loan Analysis Yet</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Calculate loan payments and view amortization schedule.</p>
          <Link href="/business-loan" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition">
            <Calculator className="w-5 h-5" />
            Calculate Business Loan
          </Link>
        </div>
      </div>
    );
  }

  const { inputs, outputs } = analysis;

  // Prepare PDF data
  const pdfData = {
    businessName: dealName,
    reportDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    loanAmount: inputs.loanAmount,
    interestRate: inputs.interestRate,
    loanTerm: inputs.loanTerm,
    loanType: 'Business Acquisition Loan', // Default loan type
    monthlyPayment: outputs.monthlyPayment,
    totalPayments: outputs.totalPayments,
    totalInterest: outputs.totalInterest,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href={`/app/deals/${dealId}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Deal
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Calculator className="w-7 h-7 text-emerald-600" />
            Business Loan Analysis
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* PDF Export Button */}
          <BusinessLoanExportButton data={pdfData} />
          
          <Link href="/business-loan" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-medium">
            <RefreshCw className="w-4 h-4" />
            New Calculation
          </Link>
        </div>
      </div>

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
        </div>
        <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 opacity-80" />
            <span className="text-sm font-medium opacity-90">Total Cost</span>
          </div>
          <div className="text-3xl font-bold">{formatCurrencyShort(outputs.totalPaid)}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 opacity-80" />
            <span className="text-sm font-medium opacity-90">Annual Payment</span>
          </div>
          <div className="text-3xl font-bold">{formatCurrencyShort(outputs.monthlyPayment * 12)}</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold mb-1">Need Financing for This Deal?</h3>
            <p className="opacity-90">Starting Gate Financial can help you secure the best terms.</p>
          </div>
          <a href="https://startinggatefinancial.com/apply" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-lg font-bold hover:bg-emerald-50 transition whitespace-nowrap">Apply for Financing</a>
        </div>
      </div>
    </div>
  );
}
