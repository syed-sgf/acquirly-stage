'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calculator,
  Building2,
  Landmark,
  BookmarkCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const products = [
  {
    id: 'business-loan',
    title: 'Business Loan Calculator',
    description: 'Analyze loan scenarios with complete amortization schedules.',
    icon: Calculator,
    href: '/calculators/business-loan',
    features: ['Full amortization tables', 'Multiple loan comparison', 'PDF export'],
    badge: 'Popular',
  },
  {
    id: 'business-acquisition',
    title: 'Business Acquisition Analyzer',
    description: 'Complete deal analysis with ROI projections and scenarios.',
    icon: Landmark,
    href: '/calculators/acquisition',
    features: ['10-year projections', 'Valuation methods', 'Scenario analysis'],
    badge: 'Pro',
  },
  {
    id: 'rei-pro',
    title: 'CRE Loan Sizer',
    description: 'Commercial real estate analysis with cap rates and NOI.',
    icon: Building2,
    href: '/calculators/cre',
    features: ['Cap rate analysis', 'NOI calculator', 'Debt yield metrics'],
    badge: null,
  },
  {
    id: 'saved-calculations',
    title: 'Saved Calculations',
    description: 'Access saved analyses and compare deals side-by-side.',
    icon: BookmarkCheck,
    href: '/dashboard/saved',
    features: ['Unlimited saves', 'Deal comparison', 'Export & share'],
    badge: null,
  },
];

export default function PremiumProductsCTA() {
  return (
    <section className="mt-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-sgf-gold-50 text-sgf-gold-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" />
          <span>Premium Tools</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Unlock the Full Suite of Deal Analysis Tools
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Take your deal analysis to the next level with our comprehensive calculator suite.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const IconComponent = product.icon;
          return (
            <Link
              key={product.id}
              href={product.href}
              className="group relative bg-white rounded-xl border border-gray-200 p-6 hover:border-sgf-green-500 hover:shadow-lg transition-all duration-300"
            >
              {product.badge && (
                <span
                  className={
                    product.badge === 'Popular'
                      ? 'absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold bg-sgf-gold-500 text-white'
                      : 'absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold bg-sgf-green-500 text-white'
                  }
                >
                  {product.badge}
                </span>
              )}

              <div className="w-12 h-12 bg-sgf-green-50 rounded-xl flex items-center justify-center text-sgf-green-600 mb-4 group-hover:bg-sgf-green-500 group-hover:text-white transition-colors">
                <IconComponent className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-sgf-green-600 transition-colors">
                {product.title}
              </h3>

              <p className="text-sm text-gray-600 mb-4">{product.description}</p>

              <ul className="space-y-2 mb-4">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-1.5 h-1.5 bg-sgf-gold-500 rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 text-sm font-semibold text-sgf-green-600 group-hover:text-sgf-green-700">
                <span>Explore</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-4">
          All premium tools included with Starting Gate Financial Pro subscription
        </p>

        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 bg-sgf-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sgf-green-600 transition-colors"
        >
          View Pricing Plans
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
