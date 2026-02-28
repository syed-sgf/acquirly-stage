"use client";
import Link from "next/link";
import { 
  BarChart3, Building2, TrendingUp, Calculator, 
  DollarSign, Home, ArrowRight, Check, Shield, Zap, Users
} from "lucide-react";

const calculators = [
  {
    icon: BarChart3, color: "sgf-green",
    name: "DSCR Calculator",
    description: "Calculate Debt Service Coverage Ratio to assess loan affordability and lender requirements.",
    features: ["Loan amortization", "Monthly payment breakdown", "DSCR benchmarking"],
    href: "/calculators/dscr", free: true,
  },
  {
    icon: DollarSign, color: "sgf-gold",
    name: "Business Loan Calculator",
    description: "Calculate monthly payments, total interest, and view full amortization schedules.",
    features: ["SBA 7(a) & 504 loans", "Conventional financing", "Payment schedules"],
    href: "/calculators/business-loan", free: true,
  },
  {
    icon: TrendingUp, color: "sgf-green",
    name: "Acquisition Analyzer",
    description: "Comprehensive deal analysis with ROI projections, equity build-up, and scenario modeling.",
    features: ["10-year equity schedule", "Cash-on-cash returns", "Scenario modeling"],
    href: "/calculators/acquisition", free: false, badge: "Pro",
  },
  {
    icon: Calculator, color: "sgf-gold",
    name: "Business Valuation",
    description: "Multiple valuation methods including SDE, EBITDA, revenue multiples, and DCF analysis.",
    features: ["SDE multiple method", "EBITDA analysis", "DCF valuation"],
    href: "/calculators/valuation", free: false,
  },
  {
    icon: Home, color: "sgf-green",
    name: "Real Estate Investor Pro",
    description: "Analyze Buy & Hold, Fix & Flip, and BRRRR investment strategies with full ROI modeling.",
    features: ["Buy & Hold analysis", "Fix & Flip calculator", "BRRRR strategy"],
    href: "/calculators/rei-pro", free: false,
  },
  {
    icon: Building2, color: "sgf-gold",
    name: "CRE Loan Sizer",
    description: "Size commercial real estate loans based on NOI, cap rates, and lender requirements.",
    features: ["NOI analysis", "Cap rate calculator", "Lender requirements"],
    href: "/calculators/cre-loan-sizer", free: false,
  },
  {
    icon: Building2, color: "sgf-green",
    name: "Commercial Property Analyzer",
    description: "Analyze office, retail, industrial, and NNN properties with market intelligence.",
    features: ["9 property types", "NNN lease calculator", "Market benchmarks"],
    href: "/calculators/commercial-property", free: false,
  },
];

const benefits = [
  { icon: Shield, title: "Lender-Grade Accuracy", description: "Built by financing professionals using the exact formulas lenders use to evaluate deals." },
  { icon: Zap, title: "Instant Results", description: "Real-time calculations as you type. No waiting, no page refreshes." },
  { icon: Users, title: "Client-Ready Reports", description: "Export professional PDF reports to share with clients, lenders, and partners." },
];

export default function ProductPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-sgf-green-700 to-sgf-green-900 text-white py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="inline-block bg-sgf-gold-500/20 text-sgf-gold-300 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            Professional Tools
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Every Tool You Need to<br />Close More Deals
          </h1>
          <p className="text-sgf-green-200 text-lg max-w-2xl mx-auto mb-8">
            7 professional calculators built for business brokers, M&A consultants, commercial loan brokers, and real estate investors.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/sign-in" className="bg-sgf-gold-500 hover:bg-sgf-gold-600 text-white px-6 py-3 rounded-xl font-bold transition-colors">
              Start Free
            </Link>
            <Link href="/pricing" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((b) => (
              <div key={b.title} className="text-center">
                <div className="w-12 h-12 bg-sgf-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <b.icon className="w-6 h-6 text-sgf-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{b.title}</h3>
                <p className="text-sm text-gray-600">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calculators Grid */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">All 7 Calculators</h2>
        <p className="text-gray-600 text-center mb-12">Free tools available without an account. Save and export with a paid plan.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 [&>*:last-child:nth-child(3n+1)]:lg:col-start-2">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            return (
              <Link href={calc.href} key={calc.name} className="block bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-sgf-green-300 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-sgf-green-50 rounded-xl flex items-center justify-center group-hover:bg-sgf-green-500 transition-colors">
                    <Icon className="w-5 h-5 text-sgf-green-600 group-hover:text-white transition-colors" />
                  </div>
                  {calc.badge === 'Pro' ? (
                    <span className="text-xs font-bold bg-sgf-gold-500 text-white px-2 py-1 rounded-full">Pro</span>
                  ) : calc.free ? (
                    <span className="text-xs font-bold bg-sgf-green-100 text-sgf-green-700 px-2 py-1 rounded-full">Free</span>
                  ) : (
                    <span className="text-xs font-bold bg-sgf-gold-100 text-sgf-gold-700 px-2 py-1 rounded-full">Core+</span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{calc.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{calc.description}</p>
                <ul className="space-y-1 mb-4">
                  {calc.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                      <Check className="w-3 h-3 text-sgf-green-500" />{f}
                    </li>
                  ))}
                </ul>
                <span className="flex items-center gap-1 text-sm font-semibold text-sgf-green-600 group-hover:text-sgf-green-700 group-hover:gap-2 transition-all">
                  Open Calculator <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-sgf-green-700 text-white py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to analyze your next deal?</h2>
          <p className="text-sgf-green-200 mb-8">Start free, upgrade when you need more. No credit card required.</p>
          <Link href="/sign-in" className="bg-sgf-gold-500 hover:bg-sgf-gold-600 text-white px-8 py-3 rounded-xl font-bold text-lg transition-colors inline-block">
            Get Started Free
          </Link>
        </div>
      </div>
    </main>
  );
}
