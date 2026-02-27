'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    <div className="min-h-screen bg-gray-50">
      {/* SGF Branded Header */}
      <div className="bg-gradient-to-r from-sgf-green-600 to-sgf-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SGF</span>
              </div>
              <div>
                <span className="text-white font-bold text-xl">Acqyrly</span>
                <span className="text-sgf-gold-400 text-sm block">by Starting Gate Financial</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              {status === 'authenticated' ? (
                <Link
                  href="/app"
                  className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="bg-sgf-gold-500 text-white px-4 py-2 rounded-lg hover:bg-sgf-gold-600 transition-colors font-semibold"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your deal flow. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 ${
                plan.popular
                  ? 'bg-gradient-to-br from-sgf-green-600 to-sgf-green-700 text-white ring-4 ring-sgf-gold-500'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-sgf-gold-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className={`text-xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mt-1 ${plan.popular ? 'text-sgf-green-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <div className="mt-4">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className={plan.popular ? 'text-sgf-green-100' : 'text-gray-500'}>/month</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-sgf-gold-400' : 'text-sgf-green-500'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={`text-sm ${plan.popular ? 'text-white' : 'text-gray-600'}`}>{feature}</span>
                  </li>
                ))}
              </ul>

              <div>
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
                    className={`w-full ${plan.popular ? 'bg-sgf-gold-500 hover:bg-sgf-gold-600 text-white' : 'bg-sgf-green-600 hover:bg-sgf-green-700'}`}
                  >
                    {plan.cta}
                  </UpgradeButton>
                ) : (
                  <button
                    onClick={() => router.push('/sign-in')}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      plan.popular
                        ? 'bg-sgf-gold-500 hover:bg-sgf-gold-600 text-white'
                        : 'bg-sgf-green-600 text-white hover:bg-sgf-green-700'
                    }`}
                  >
                    Sign In to Subscribe
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Section */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 mb-6">
            All plans include a 14-day money-back guarantee. Cancel anytime.
          </p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Powered by Stripe</span>
            </div>
          </div>
        </div>

        {/* SGF CTA */}
        <div className="mt-16 bg-gradient-to-r from-sgf-green-600 via-sgf-green-700 to-sgf-green-800 rounded-2xl p-8 md:p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-4">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Need Financing?
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Get Your Deal Funded Today</h2>
              <p className="text-sgf-green-100 max-w-lg">
                Connect with Starting Gate Financial for competitive business acquisition loans, 
                SBA 7(a) financing, and commercial real estate solutions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="https://startinggatefinancial.com/apply" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-sgf-gold-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-sgf-gold-600 transition-colors shadow-lg"
              >
                Apply for Financing
              </a>
              <a 
                href="https://startinggatefinancial.com/contact"
                target="_blank"
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center gap-2 bg-white/10 border-2 border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                Schedule Call
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}