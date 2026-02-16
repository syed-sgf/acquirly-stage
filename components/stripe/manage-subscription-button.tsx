'use client';

import { useState } from 'react';

interface ManageSubscriptionButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function ManageSubscriptionButton({ className = '', children }: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        px-4 py-2 rounded-lg font-medium
        border border-gray-300 text-gray-700
        hover:bg-gray-50
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
    >
      {loading ? 'Loading...' : children || 'Manage Subscription'}
    </button>
  );
}