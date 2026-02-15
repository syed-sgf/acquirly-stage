"use client";
import Link from "next/link";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try the core tools with no commitment.",
    cta: "Start Free",
    href: "/sign-in",
    highlight: false,
    features: [
      "1 deal workspace",
      "3 analyses per deal",
      "DSCR, Business Loan & Acquisition calculators",
      "Basic results view",
      "SGF financing CTA",
    ],
    limitations: [
      "No PDF export",
      "No Valuation or RE calculators",
      "No market intelligence",
    ],
  },
  {
    name: "Core",
    price: "$79",
    period: "per month",
    description: "For brokers and consultants who need professional tools.",
    cta: "Start Core",
    href: "/sign-in?plan=core",
    highlight: true,
    badge: "Most Popular",
    features: [
      "5 deal workspaces",
      "Unlimited analyses",
      "All 7 professional calculators",
      "PDF export with SGF branding",
      "Business Valuation calculator",
      "Real Estate Investor Pro",
      "Commercial Property Analyzer",
      "CRE Loan Sizer",
      "Email support",
    ],
    limitations: [],
  },
  {
    name: "Pro",
    price: "$247",
    period: "per month",
    description: "For power users who need unlimited deal flow and market data.",
    cta: "Start Pro",
    href: "/sign-in?plan=pro",
    highlight: false,
    features: [
      "Unlimited deal workspaces",
      "Everything in Core",
      "Market intelligence & benchmarks",
      "Buyer Risk & Survivability Score",
      "3-scenario stress testing",
      "Priority support",
      "Early access to new features",
    ],
    limitations: [],
  },
  {
    name: "Enterprise",
    price: "$2,000+",
    period: "per month",
    description: "For brokerages and institutions with teams and custom needs.",
    cta: "Contact Us",
    href: "mailto:syed@startinggatefinancial.com",
    highlight: false,
    features: [
      "Everything in Pro",
      "Team seats & collaboration",
      "White-label PDF branding",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "SGF referral dashboard",
      "SLA & priority support",
    ],
    limitations: [],
  },
];

export default function PricingPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional deal analysis tools for brokers, consultants, and investors. 
            Start free, upgrade when you're ready.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl bg-white shadow-sm border-2 p-6 flex flex-col ${
                tier.highlight
                  ? "border-sgf-green-600 shadow-lg"
                  : "border-gray-200"
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-sgf-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">{tier.name}</h2>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-sm text-gray-500 mb-1">/{tier.period}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{tier.description}</p>
              </div>

              <Link
                href={tier.href}
                className={`w-full text-center py-2.5 px-4 rounded-lg font-semibold text-sm mb-6 transition-colors ${
                  tier.highlight
                    ? "bg-sgf-green-600 text-white hover:bg-sgf-green-700"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {tier.cta}
              </Link>

              <ul className="space-y-3 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-sgf-green-600 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* SGF Financing Note */}
        <div className="mt-12 bg-sgf-green-50 border border-sgf-green-200 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-bold text-sgf-green-900 mb-2">
            Need financing for your deal?
          </h3>
          <p className="text-sgf-green-700 text-sm mb-4">
            Starting Gate Financial offers SBA loans, conventional business loans, and commercial real estate financing.
          </p>
          

            href="https://startinggatefinancial.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-sgf-green-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-sgf-green-700 transition-colors"
          >
            Apply for Financing
          </a>
        </div>
      </div>
    </main>
  );
}
