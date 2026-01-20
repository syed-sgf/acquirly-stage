'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Trash2, AlertCircle } from 'lucide-react';

export default function EditDealPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.dealId as string;

  const [dealName, setDealName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load deal data
  useEffect(() => {
    const loadDeal = async () => {
      try {
        const response = await fetch(`/api/deals/${dealId}`);
        if (response.ok) {
          const deal = await response.json();
          setDealName(deal.name);
        } else {
          setError('Failed to load deal');
        }
      } catch (err) {
        setError('Failed to load deal');
      } finally {
        setIsLoading(false);
      }
    };
    loadDeal();
  }, [dealId]);

  // Save deal
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealName.trim()) {
      setError('Deal name is required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: dealName.trim() }),
      });

      if (response.ok) {
        router.push(`/app/deals/${dealId}`);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save deal');
      }
    } catch (err) {
      setError('Failed to save deal');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete deal
  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/app/deals');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete deal');
      }
    } catch (err) {
      setError('Failed to delete deal');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sgf-green-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-sgf-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading deal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sgf-green-50/30">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Back Navigation */}
        <Link 
          href={`/app/deals/${dealId}`}
          className="inline-flex items-center gap-2 text-sgf-green-600 hover:text-sgf-green-700 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Deal
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-sgf-green-500 via-sgf-green-600 to-sgf-green-700 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Edit Deal</h1>
            <p className="text-sgf-green-100 mt-2">
              Update your deal information
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Edit Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="font-semibold text-gray-900">Deal Information</h2>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-6">
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:border-sgf-green-500 focus:outline-none transition-colors"
                disabled={isSaving}
              />
              <p className="text-sm text-gray-500 mt-2">
                Give your deal a descriptive name to easily identify it later.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 hover:from-sgf-green-600 hover:to-sgf-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
              <Link
                href={`/app/deals/${dealId}`}
                className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50">
            <h2 className="font-semibold text-red-800">Danger Zone</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Deleting this deal will permanently remove all associated analyses and data. This action cannot be undone.
            </p>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-2 bg-white border-2 border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Deal
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 mb-3">
                  Are you sure you want to delete this deal? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Yes, Delete
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
