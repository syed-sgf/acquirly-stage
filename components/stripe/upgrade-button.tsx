'use client';

import { useState } from 'react';

interface UpgradeButtonProps {
  plan: 'core' | 'pro' | 'enterprise';
  className?: string;
  children?: React.ReactNode;
}

export function UpgradeButton({ plan, className = '', children }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  const planLabels = {
    core: 'Core - $79/mo',
    pro: 'Pro - $247/mo',
    enterprise: 'Enterprise - $2,000/mo',
  };

  const handleClick = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        px-6 py-3 rounded-lg font-semibold
        bg-emerald-600 text-white
        hover:bg-emerald-700
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
    >
      {loading ? 'Loading...' : children || `Upgrade to ${planLabels[plan]}`}
    </button>
  );
}