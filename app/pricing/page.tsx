'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UpgradeButton } from '@/components/stripe/upgrade-button';

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Get started with basic tools',
    features: [
      'Basic DSCR Calculator',
      'Business Loan Calculator',
      '3 saved calculations',
      'Community support',
    ],
    cta: 'Get Started',
    plan: null,
  },
  {
    name: 'Core',
    price: 79,
    description: 'For individual professionals',
    features: [
      'All Free features',
      'Acquisition Analyzer',
      'Business Valuation',
      '10 saved deals',
      'PDF exports',
      'Email support',
    ],
    cta: 'Start Core',
    plan: 'core' as const,
  },
  {
    name: 'Pro',
    price: 247,
    description: 'For serious deal makers',
    features: [
      'All Core features',
      'CRE Loan Sizer',
      'Unlimited deals',
      'Advanced risk analysis',
      'Branded PDF reports',
      'Priority support',
    ],
    cta: 'Start Pro',
    plan: 'pro' as const,
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 2000,
    description: 'For teams and brokerages',
    features: [
      'All Pro features',
      'White-label reports',
      'Team collaboration',
      'API access',
      'Custom integrations',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    plan: 'enterprise' as const,
  },
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleFreePlan = () => {
    if (status === 'authenticated') {
      router.push('/app');
    } else {
      router.push('/sign-in');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your deal flow. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`
                relative rounded-2xl p-6 
                ${plan.popular 
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-600 ring-opacity-50' 
                  : 'bg-white border border-gray-200'
                }
              `}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className={`text-xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mt-1 ${plan.popular ? 'text-emerald-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <div className="mt-4">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className={plan.popular ? 'text-emerald-100' : 'text-gray-500'}>
                      /month
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        plan.popular ? 'text-emerald-300' : 'text-emerald-600'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={`text-sm ${plan.popular ? 'text-white' : 'text-gray-600'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {!plan.plan ? (
                  <button
                    onClick={handleFreePlan}
                    className="w-full py-3 px-4 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {plan.cta}
                  </button>
                ) : status === 'authenticated' ? (
                  <UpgradeButton
                    plan={plan.plan}
                    className={`w-full ${plan.popular ? 'bg-white text-emerald-600 hover:bg-gray-100' : ''}`}
                  >
                    {plan.cta}
                  </UpgradeButton>
                ) : (
                  <button
                    onClick={() => router.push('/sign-in')}
                    className={`
                      w-full py-3 px-4 rounded-lg font-semibold transition-colors
                      ${plan.popular
                        ? 'bg-white text-emerald-600 hover:bg-gray-100'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }
                    `}
                  >
                    Sign In to Subscribe
                  </button>
                )}
              </div>
            </div>