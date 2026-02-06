import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatCurrency, formatPercent } from '@/lib/format';
import DSCRExportButton from '@/components/calculators/DSCRExportButton';

export default async function DealDSCRPage({ 
  params 
}: { 
  params: Promise<{ dealId: string }> 
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  const { dealId } = await params;

  // Fetch the deal
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: {
      analyses: {
        where: { type: 'dscr' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!deal) {
    redirect('/app/deals');
  }

  const dscrAnalysis = deal.analyses[0];

  return (
    <div className="container mx-auto py-8">
      {/* Header with Export Button */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <Link 
            href={`/app/deals/${dealId}`}
            className="text-emerald-600 hover:text-emerald-700 mb-2 inline-block"
          >
            ← Back to Deal
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{deal.name}</h1>
          <p className="text-gray-600">Debt Service Coverage Ratio Analysis</p>
        </div>
        
        {/* PDF Export Button - Only show if analysis exists */}
        {dscrAnalysis && <PDFExportSection analysis={dscrAnalysis} dealName={deal.name} />}
      </div>

      {dscrAnalysis ? (
        <DSCRResults analysis={dscrAnalysis} />
      ) : (
        <EmptyState dealId={dealId} />
      )}
    </div>
  );
}

// New component to handle PDF export button
function PDFExportSection({ analysis, dealName }: { analysis: any; dealName: string }) {
  const inputs = analysis.inputs as any;
  const outputs = analysis.outputs as any;

  // Determine DSCR status for PDF
  const getDSCRStatus = (dscr: number) => {
    if (dscr >= 1.25) {
      return { 
        status: 'green' as const, 
        label: 'Bankable - Strong Coverage', 
        description: 'This DSCR meets or exceeds most lender requirements (1.25x minimum). Strong cash flow coverage for debt service.'
      };
    }
    if (dscr >= 1.15) {
      return { 
        status: 'amber' as const, 
        label: 'Marginal - Requires Review', 
        description: 'This DSCR is below typical lender requirements. Consider increasing down payment or reducing loan amount.'
      };
    }
    return { 
      status: 'red' as const, 
      label: 'Does Not Qualify', 
      description: 'Insufficient cash flow to cover debt service. This deal may not qualify for traditional financing without restructuring.'
    };
  };

  const dscrStatus = getDSCRStatus(outputs.dscr);

  // Prepare PDF data in the format the export button expects
  const pdfData = {
    businessName: dealName,
    preparedFor: undefined, // User can fill this in the modal
    reportDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    // Inputs
    annualSDE: inputs.revenue - inputs.expenses,
    annualCapex: inputs.capex || 0,
    loanAmount: inputs.loanAmount,
    interestRate: inputs.interestRate * 100, // Convert to percentage
    loanTerm: inputs.loanTerm,
    // Calculated outputs
    lendableCashFlow: outputs.netCashFlow,
    monthlyPayment: outputs.annualDebtService / 12,
    annualDebtService: outputs.annualDebtService,
    dscr: outputs.dscr,
    dscrStatus: dscrStatus.status,
    dscrLabel: dscrStatus.label,
    dscrDescription: dscrStatus.description,
  };

  return <DSCRExportButton data={pdfData} />;
}

function DSCRResults({ analysis }: { analysis: any }) {
  const inputs = analysis.inputs as any;
  const outputs = analysis.outputs as any;

  // Determine DSCR status color
  const getDSCRStatus = (dscr: number) => {
    if (dscr >= 1.35) return { color: 'emerald', label: 'Excellent', bg: 'bg-emerald-50', text: 'text-emerald-700' };
    if (dscr >= 1.25) return { color: 'emerald', label: 'Good', bg: 'bg-emerald-50', text: 'text-emerald-700' };
    if (dscr >= 1.0) return { color: 'yellow', label: 'Marginal', bg: 'bg-yellow-50', text: 'text-yellow-700' };
    return { color: 'red', label: 'Insufficient', bg: 'bg-red-50', text: 'text-red-700' };
  };

  const status = getDSCRStatus(outputs.dscr);

  return (
    <div className="space-y-6">
      {/* DSCR Result Card */}
      <div className={`${status.bg} border border-${status.color}-200 rounded-lg p-6`}>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 mb-1">Debt Service Coverage Ratio</p>
          <p className={`text-5xl font-bold ${status.text} mb-2`}>
            {outputs.dscr.toFixed(2)}x
          </p>
          <p className={`text-lg font-medium ${status.text}`}>{status.label}</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Net Cash Flow */}
        <div className="bg-white border rounded-lg p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Net Cash Flow</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(outputs.netCashFlow)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Annual</p>
        </div>

        {/* Annual Debt Service */}
        <div className="bg-white border rounded-lg p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Annual Debt Service</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(outputs.annualDebtService)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Total payments</p>
        </div>

        {/* Coverage Amount */}
        <div className="bg-white border rounded-lg p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Coverage Amount</p>
          <p className={`text-2xl font-bold ${status.text}`}>
            {formatCurrency(outputs.netCashFlow - outputs.annualDebtService)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Buffer</p>
        </div>
      </div>

      {/* Input Details */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Analysis Inputs</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Annual Revenue</p>
            <p className="text-lg font-medium">{formatCurrency(inputs.revenue)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Operating Expenses</p>
            <p className="text-lg font-medium">{formatCurrency(inputs.expenses)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Loan Amount</p>
            <p className="text-lg font-medium">{formatCurrency(inputs.loanAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Interest Rate</p>
            <p className="text-lg font-medium">{formatPercent(inputs.interestRate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Loan Term</p>
            <p className="text-lg font-medium">{inputs.loanTerm} years</p>
          </div>
        </div>
      </div>

      {/* Lender Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Lender Insights</h3>
        {outputs.dscr >= 1.25 ? (
          <p className="text-blue-800">
            Your DSCR of {outputs.dscr.toFixed(2)}x meets most lender requirements (typically 1.25x minimum). 
            This shows strong cash flow coverage for debt service.
          </p>
        ) : outputs.dscr >= 1.0 ? (
          <p className="text-yellow-800">
            Your DSCR of {outputs.dscr.toFixed(2)}x is marginal. Most lenders require 1.25x minimum. 
            Consider increasing down payment or negotiating a lower purchase price.
          </p>
        ) : (
          <p className="text-red-800">
            Your DSCR of {outputs.dscr.toFixed(2)}x indicates insufficient cash flow to cover debt service. 
            This deal may not qualify for traditional financing without restructuring.
          </p>
        )}
      </div>

      {/* CTA for SGF */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-emerald-900 mb-2">Need Financing Help?</h3>
        <p className="text-emerald-800 mb-4">
          Starting Gate Financial specializes in business acquisition loans with competitive rates.
        </p>
        
        <a
          href="https://startinggatefinancial.com/apply"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition"
        >
          Apply for Financing &rarr;
        </a>
      </div>
    </div>
  );
}

function EmptyState({ dealId }: { dealId: string }) {
  return (
    <div className="bg-white border rounded-lg p-12 text-center">
      <div className="text-gray-400 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No DSCR Analysis Yet</h3>
      <p className="text-gray-600 mb-6">
        Run a DSCR calculation to evaluate this deal's financing viability.
      </p>
      <Link
        href="/core"
        className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition"
      >
        Calculate DSCR &rarr;
      </Link>
    </div>
  );
}
