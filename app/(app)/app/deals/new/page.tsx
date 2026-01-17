'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewDealPage() {
  const router = useRouter();
  const [dealName, setDealName] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState<{
    type: string;
    data: any;
  } | null>(null);

  useEffect(() => {
    // Check for any pending calculator analysis
    const dscrData = localStorage.getItem('pendingDSCRAnalysis');
    const businessLoanData = localStorage.getItem('pendingBusinessLoanAnalysis');

    if (dscrData) {
      try {
        const data = JSON.parse(dscrData);
        const name = `DSCR Analysis - ${data.outputs.dscr.toFixed(2)}x - ${new Date().toLocaleDateString()}`;
        setDealName(name);
        setPendingAnalysis({ type: 'dscr', data });
      } catch (e) {
        console.error('Failed to parse DSCR data:', e);
      }
    } else if (businessLoanData) {
      try {
        const data = JSON.parse(businessLoanData);
        const loanAmount = data.inputs.loanAmount;
        const formattedAmount = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
        }).format(loanAmount);
        const name = `Business Loan Analysis - ${formattedAmount} - ${new Date().toLocaleDateString()}`;
        setDealName(name);
        setPendingAnalysis({ type: 'business-loan', data });
      } catch (e) {
        console.error('Failed to parse Business Loan data:', e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Create the deal
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: dealName || 'Untitled Deal' }),
      });

      if (!response.ok) throw new Error('Failed to create deal');

      const deal = await response.json();

      // Step 2: Save any pending analysis
      if (pendingAnalysis) {
        const analysisResponse = await fetch(`/api/deals/${deal.id}/analyses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: pendingAnalysis.type,
            name: pendingAnalysis.type === 'dscr' ? 'DSCR Analysis' : 'Business Loan Analysis',
            inputs: pendingAnalysis.data.inputs,
            outputs: pendingAnalysis.data.outputs,
          }),
        });

        if (!analysisResponse.ok) {
          console.error('Failed to save analysis');
        }

        // Clear localStorage based on type
        if (pendingAnalysis.type === 'dscr') {
          localStorage.removeItem('pendingDSCRAnalysis');
        } else if (pendingAnalysis.type === 'business-loan') {
          localStorage.removeItem('pendingBusinessLoanAnalysis');
        }
      }

      // Step 3: Redirect to the deal page
      router.push(`/app/deals/${deal.id}`);
    } catch (error) {
      console.error('Error creating deal:', error);
      alert('Failed to create deal. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Deal</h1>
          <p className="text-gray-600 mb-6">
            {pendingAnalysis
              ? `Your ${pendingAnalysis.type === 'dscr' ? 'DSCR' : 'Business Loan'} analysis will be saved to this deal.`
              : 'Start analyzing a new business acquisition opportunity.'}
          </p>

          {pendingAnalysis && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-emerald-700 font-medium mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Analysis Ready to Save
              </div>
              <div className="text-sm text-emerald-600">
                {pendingAnalysis.type === 'dscr' && (
                  <span>DSCR: {pendingAnalysis.data.outputs.dscr.toFixed(2)}x</span>
                )}
                {pendingAnalysis.type === 'business-loan' && (
                  <span>
                    Monthly Payment: {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(pendingAnalysis.data.outputs.monthlyPayment)}
                  </span>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="dealName" className="block text-sm font-semibold text-gray-700 mb-2">
                Deal Name
              </label>
              <input
                id="dealName"
                type="text"
                value={dealName}
                onChange={(e) => setDealName(e.target.value)}
                placeholder="Enter deal name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-6 rounded-lg font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Deal...
                </span>
              ) : (
                'Create Deal & Save Analysis'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/app" className="text-gray-500 hover:text-emerald-600 text-sm transition-colors">
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
