'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewDealPage() {
  const router = useRouter();
  const [dealName, setDealName] = useState('');
  const [loading, setLoading] = useState(false);

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

    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: dealName || 'Untitled Deal' }),
      });

      if (!response.ok) throw new Error('Failed to create deal');
      
      const deal = await response.json();

      const dscrData = localStorage.getItem('pendingDSCRAnalysis');
      if (dscrData) {
        await fetch(`/api/deals/${deal.id}/analyses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'dscr',
            name: 'DSCR Analysis',
            ...JSON.parse(dscrData),
          }),
        });
        
        localStorage.removeItem('pendingDSCRAnalysis');
      }

      router.push(`/app/deals/${deal.id}`);
    } catch (error) {
      console.error('Error creating deal:', error);
      alert('Failed to create deal. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Create New Deal</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Deal Name
          </label>
          <input
            type="text"
            id="name"
            value={dealName}
            onChange={(e) => setDealName(e.target.value)}
            required
            placeholder="e.g., Main Street Restaurant Acquisition"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-sm text-emerald-800">
            💡 Your DSCR calculation will be automatically saved with this deal.
          </p>
        </div>
        
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Deal'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/app/deals')}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
