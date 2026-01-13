'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewDealPage() {
  const router = useRouter();
  const [dealName, setDealName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pendingData = localStorage.getItem('pendingDSCRAnalysis');
    if (pendingData) {
      try {
        const dscrData = JSON.parse(pendingData);
        const name = `DSCR Analysis - ${dscrData.outputs.dscr.toFixed(2)}x - ${new Date().toLocaleDateString()}`;
        setDealName(name);
      } catch (e) {
        console.error('Failed to parse DSCR data:', e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Creating deal with name:', dealName);
      
      const dealResponse = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dealName || 'Untitled Deal',
        }),
      });

      console.log('Deal response status:', dealResponse.status);
      
      if (!dealResponse.ok) {
        const errorData = await dealResponse.json();
        console.error('Deal creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create deal');
      }

      const deal = await dealResponse.json();
      console.log('Deal created:', deal);

      const pendingData = localStorage.getItem('pendingDSCRAnalysis');
      if (pendingData) {
        const dscrData = JSON.parse(pendingData);
        console.log('Saving DSCR analysis...');
        
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
          const errorData = await analysisResponse.json();
          console.error('Analysis save failed:', errorData);
        } else {
          console.log('Analysis saved successfully');
        }

        localStorage.removeItem('pendingDSCRAnalysis');
      }

      router.push(`/app/deals/${deal.id}`);
    } catch (error) {
      console.error('Error creating deal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create deal. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Deal</CardTitle>
          <CardDescription>
            Start analyzing a new business acquisition opportunity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="dealName">Deal Name</Label>
              <Input
                id="dealName"
                type="text"
                value={dealName}
                onChange={(e) => setDealName(e.target.value)}
                placeholder="Enter deal name..."
                required
              />
            </div>

            {typeof window !== 'undefined' && localStorage.getItem('pendingDSCRAnalysis') && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm text-emerald-800">
                  💡 Your DSCR calculation will be automatically saved with this deal.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create Deal'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
