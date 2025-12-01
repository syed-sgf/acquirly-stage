import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-gradient-to-b from-white to-sgf-green-50">
      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-12 text-center">
        <div className="inline-block mb-4 rounded-full bg-sgf-green-100 px-4 py-1.5 text-sm font-medium text-sgf-green-700">
          🚀 Professional Deal Analysis Platform
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
          Analyze Any Business Deal<br />
          <span className="text-sgf-green-600">in Minutes, Not Days</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600 leading-relaxed">
          Professional acquisition intelligence for <span className="font-semibold text-sgf-green-700">business buyers</span>, <span className="font-semibold text-sgf-green-700">brokers</span>, and <span className="font-semibold text-sgf-green-700">lenders</span>.
          SBA-compliant calculations, instant valuations, and lender-ready reports—all in one platform.
        </p>
        
        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/core"
            className="w-full sm:w-auto rounded-xl bg-sgf-green-600 px-8 py-4 text-lg text-white font-semibold shadow-lg hover:bg-sgf-green-700 transition-all hover:scale-105"
          >
            Start Free with Core →
          </Link>
          <Link
            href="/pro"
            className="w-full sm:w-auto rounded-xl border-2 border-sgf-green-600 px-8 py-4 text-lg text-sgf-green-700 font-semibold hover:bg-sgf-green-50 transition-all"
          >
            Explore Pro Features
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          No credit card required • Get started in 30 seconds
        </p>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-sgf-green-600">500+</div>
            <div className="text-sm text-gray-600 mt-1">Deals Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-sgf-green-600">$50M+</div>
            <div className="text-sm text-gray-600 mt-1">Financing Secured</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-sgf-green-600">95%</div>
            <div className="text-sm text-gray-600 mt-1">User Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-sgf-green-600">24/7</div>
            <div className="text-sm text-gray-600 mt-1">Access Anywhere</div>
          </div>
        </div>
      </section>

      {/* Feature Cards - Enhanced */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
          Built for Acquisition Professionals
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Whether you're buying your first business or managing a portfolio, Acquirely delivers the insights you need to move deals forward with confidence.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Business Buyers & Real Estate Investors */}
          <div className="rounded-2xl bg-white p-8 ring-2 ring-gray-200 hover:ring-sgf-green-400 transition-all hover:shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-sgf-green-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-sgf-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Business Buyers & Real Estate Investors</h3>
            <p className="text-gray-600 text-sm mb-4">Make confident acquisition decisions with comprehensive financial analysis</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-sgf-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Cash-on-Cash return & ROI calculator</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-sgf-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>10-year wealth projection & equity build-up</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-sgf-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Scenario modeling (best/worst case)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-sgf-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Professional PDF reports for investors</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-sgf-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Break-even analysis & payback period</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Business & Commercial Loan Brokers */}
          <div className="rounded-2xl bg-white p-8 ring-2 ring-sgf-green-400 hover:shadow-xl transition-all relative">
            <div className="absolute -top-3 right-4 bg-sgf-gold-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              MOST POPULAR
            </div>
            <div className="w-12 h-12 rounded-xl bg-sgf-gold-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-sgf-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Business & Commercial Loan Brokers</h3>
            <p className="text-gray-600 text-sm mb-4">Close deals faster with client-ready presentations and instant analysis</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-sgf-gold-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Instant valuation using 6 methods</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-sgf-gold-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>White-label reports with your branding</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-sgf-gold-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Deal comparison tools for buyers</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-sgf-gold-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Save & manage multiple deals</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-sgf-gold-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Client presentation mode</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Commercial Lenders & Financial Institutions */}
          <div className="rounded-2xl bg-white p-8 ring-2 ring-gray-200 hover:ring-sgf-green-400 transition-all hover:shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Commercial Lenders & Financial Institutions</h3>
            <p className="text-gray-600 text-sm mb-4">Streamline underwriting with compliant calculations and risk assessment tools</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>SBA 7(a) & 504 compliant analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Automated debt service coverage calculations</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Global cash flow & collateral analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Risk-weighted capital assessment</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Loan committee presentation packages</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Get Started in 3 Simple Steps
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-sgf-green-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Enter Deal Details</h3>
            <p className="text-sm text-gray-600">
              Input asking price, revenue, cash flow, and financing structure in minutes
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-sgf-green-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Instant Analysis</h3>
            <p className="text-sm text-gray-600">
              Get DSCR, ROI, cash-on-cash returns, and comprehensive metrics instantly
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-sgf-green-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Export & Share</h3>
            <p className="text-sm text-gray-600">
              Generate professional PDF reports ready for lenders, partners, or clients
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-2xl bg-gradient-to-r from-sgf-green-600 to-sgf-green-700 p-12 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to Analyze Your Next Deal?
            </h2>
            <p className="text-lg mb-8 text-sgf-green-100">
              Join hundreds of buyers, brokers, and lenders making smarter acquisition decisions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/core"
                className="rounded-xl bg-sgf-gold-500 px-8 py-4 text-lg text-white font-semibold hover:bg-sgf-gold-600 transition-all inline-block shadow-lg"
              >
                Start Free Now →
              </Link>
              <Link
                href="/deals/demo"
                className="rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg text-white font-semibold hover:bg-white/20 transition-all inline-block"
              >
                View Sample Deal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}