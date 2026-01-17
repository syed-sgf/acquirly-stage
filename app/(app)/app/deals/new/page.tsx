'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export default function NewDealPage() {
  const router = useRouter();
  const [dealName, setDealName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for pending analyses
    const pendingDSCR = localStorage.getItem('pendingDSCRAnalysis');
    const pendingBusinessLoan = localStorage.getItem('pendingBusinessLoanAnalysis');
    
    if (pendingDSCR) {
      try {
        const data = JSON.parse(pendingDSCR);
        console.log('Found pending DSCR analysis:', data);
        
        if (data.dscr) {
          const date = new Date().toLocaleDateString();
          setDealName(`DSCR Analysis - ${data.dscr.toFixed(2)}x - ${date}`);
        }
      } catch (err) {
        console.error('Error parsing pending DSCR:', err);
      }
    } else if (pendingBusinessLoan) {
      try {
        const data = JSON.parse(pendingBusinessLoan);
        console.log('Found pending Business Loan analysis:', data);
        
        const date = new Date().toLocaleDateString();
        const amount = data.inputs.loanAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
        setDealName(`Business Loan - ${amount} - ${date}`);
      } catch (err) {
        console.error('Error parsing pending Business Loan:', err);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Creating deal with name:', dealName);

      // Step 1: Create the deal
      const dealResponse = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: dealName || 'Untitled Deal' }),
      });

      console.log('Deal response status:', dealResponse.status);

      if (!dealResponse.ok) {
        const errorData = await dealResponse.json();
        console.error('Deal creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create deal');
      }

      const deal = await dealResponse.json();
      console.log('Deal created:', deal.id);

      // Step 2: Check for pending DSCR analysis
      const pendingDSCR = localStorage.getItem('pendingDSCRAnalysis');
      if (pendingDSCR) {
        console.log('Saving DSCR analysis to deal...');
        const dscrData = JSON.parse(pendingDSCR);

        const analysisResponse = await fetch(`/api/deals/${deal.id}/analyses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'dscr',
            inputs: dscrData.inputs,
            outputs: dscrData.outputs,
          }),
        });

        if (!analysisResponse.ok) {
          console.error('DSCR analysis save failed');
          throw new Error('Failed to save DSCR analysis');
        }

        console.log('DSCR analysis saved successfully');
        localStorage.removeItem('pendingDSCRAnalysis');
      }

      // Step 3: Check for pending Business Loan analysis
      const pendingBusinessLoan = localStorage.getItem('pendingBusinessLoanAnalysis');
      if (pendingBusinessLoan) {
        console.log('Saving Business Loan analysis to deal...');
        const loanData = JSON.parse(pendingBusinessLoan);

        const analysisResponse = await fetch(`/api/deals/${deal.id}/analyses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'business-loan',
            inputs: loanData.inputs,
            outputs: loanData.outputs,
          }),
        });

        if (!analysisResponse.ok) {
          console.error('Business Loan analysis save failed');
          throw new Error('Failed to save Business Loan analysis');
        }

        console.log('Business Loan analysis saved successfully');
        localStorage.removeItem('pendingBusinessLoanAnalysis');
      }

      // Redirect to the deal page
      router.push(`/app/deals/${deal.id}`);

    } catch (err) {
      console.error('Error creating deal:', err);
      setError(err instanceof Error ? err.message : 'Failed to create deal');
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-2">Create New Deal</h1>
        <p className="text-gray-600 mb-6">
          Start analyzing a new business acquisition opportunity
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="dealName">Deal Name</Label>
            <Input
              id="dealName"
              value={dealName}
              onChange={(e) => setDealName(e.target.value)}
              placeholder="Enter deal name"
              className="mt-1"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Creating...' : 'Create Deal'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
