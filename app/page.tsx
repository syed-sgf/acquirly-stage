import Link from 'next/link';
import { 
  Calculator, 
  TrendingUp, 
  Building2, 
  Scale, 
  Landmark,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const calculators = [
  {
    id: 'dscr',
    name: 'DSCR Calculator',
    description: 'Calculate Debt Service Coverage Ratio to assess loan affordability and lender requirements.',
    icon: Calculator,
    href: '/calculators/dscr',
    color: 'sgf-green',
    badge: 'Most Popular',
  },
  {
    id: 'business-loan',
    name: 'Business Loan Calculator',
    description: 'Calculate monthly payments, total interest, and view full amortization schedules.',
    icon: Landmark,
    href: '/calculators/business-loan',
    color: 'sgf-gold',
    badge: null,
  },
  {
    id: 'acquisition',
    name: 'Acquisition Analyzer',
    description: 'Comprehensive deal analysis with ROI projections, equity build-up, and scenario modeling.',
    icon: TrendingUp,
    href: '/calculators/acquisition',
    color: 'sgf-green',
    badge: 'Pro Feature',
  },
  {
    id: 'valuation',
    name: 'Business Valuation',
    description: 'Multiple valuation methods including SDE multiple, EBITDA multiple, and DCF analysis.',
    icon: Scale,
    href: '/calculators/valuation',
    color: 'sgf-gold',
    badge: null,
  },
  {
    id: 'rei-pro',
    name: 'Real Estate Investor Pro',
    description: 'Analyze real estate investments with Buy & Hold, Fix & Flip, and BRRRR strategies.',
    icon: Building2,
    href: '/calculators/rei-pro',
    color: 'sgf-green',
    badge: 'Pro Feature',
  },
  {
    id: 'cre-loan-sizer',
    name: 'CRE Loan Sizer',
    description: 'Size commercial real estate loans based on NOI, cap rates, and lender requirements.',
    icon: Building2,
    href: '/calculators/cre-loan-sizer',
    color: 'sgf-green',
    badge: 'New',
  },
];

export default function CalculatorsIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sgf-green-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sgf-green-500 via-sgf-green-600 to-sgf-green-700 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
              <Sparkles className="w-3 h-3" />
              Professional Tools
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Business Acquisition Calculators
            </h1>
            <p className="text-sgf-green-100 max-w-2xl mx-auto text-lg">
              Free professional-grade tools for business brokers, M&A consultants, and entrepreneurs. 
              Analyze deals, calculate financing, and make data-driven decisions.
            </p>
          </div>
        </div>

        {/* Calculator Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            const isGreen = calc.color === 'sgf-green';
            
            return (
              <Link
                key={calc.id}
                href={calc.href}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className={`px-6 py-4 border-b border-gray-100 flex items-center justify-between ${
                  isGreen 
                    ? 'bg-gradient-to-r from-sgf-green-50 to-white' 
                    : 'bg-gradient-to-r from-sgf-gold-50 to-white'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isGreen ? 'bg-sgf-green-500' : 'bg-sgf-gold-500'
                    }`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">{calc.name}</span>
                  </div>
                  {calc.badge && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      calc.badge === 'Pro Feature' 
                        ? 'bg-sgf-gold-100 text-sgf-gold-700 border border-sgf-gold-200'
                        : calc.badge === 'New'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-sgf-green-100 text-sgf-green-700 border border-sgf-green-200'
                    }`}>
                      {calc.badge}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">
                    {calc.description}
                  </p>
                  <div className={`inline-flex items-center gap-2 font-semibold text-sm ${
                    isGreen ? 'text-sgf-green-600' : 'text-sgf-gold-600'
                  } group-hover:gap-3 transition-all`}>
                    Open Calculator
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Why Use Our Calculators */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Use ACQUIRELY Calculators?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-sgf-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-6 h-6 text-sgf-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Lender-Grade Accuracy</h3>
              <p className="text-sm text-gray-600">
                Built by financing professionals with the same formulas lenders use to evaluate deals.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-sgf-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-sgf-gold-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Save & Compare</h3>
              <p className="text-sm text-gray-600">
                Create a free account to save unlimited calculations and compare multiple scenarios.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-sgf-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Landmark className="w-6 h-6 text-sgf-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Financing Ready</h3>
              <p className="text-sm text-gray-600">
                Export professional reports to share with lenders and close deals faster.
              </p>
            </div>
          </div>
        </div>

        {/* Financing CTA */}
        <div className="bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Ready to Finance Your Deal?</h2>
              <p className="text-sgf-green-100 max-w-lg">
                Starting Gate Financial offers competitive SBA 7(a) loans, conventional financing, 
                and commercial real estate solutions for business acquisitions.
              </p>
            </div>
            <a
              href="https://startinggatefinancial.com/apply"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-sgf-gold-500 hover:bg-sgf-gold-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
            >
              Apply for Financing
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
