import os

# ============================================================
# 1. SIGN-IN PAGE
# ============================================================
signin = '''"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInContent() {
  const params = useSearchParams();
  const plan = params.get("plan");
  const callbackUrl = plan ? `/app?plan=${plan}` : "/app";

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sgf-green-600 to-sgf-gold-500" />
            <span className="text-xl font-bold text-gray-900">Acquirely</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 text-sm">Sign in to access your deal workspaces and analysis tools.</p>
        </div>

        {plan && (
          <div className="mb-6 bg-sgf-green-50 border border-sgf-green-200 rounded-xl p-4 text-center">
            <p className="text-sgf-green-700 text-sm font-semibold">
              You selected the <span className="uppercase">{plan}</span> plan
            </p>
            <p className="text-sgf-green-600 text-xs mt-1">Sign in to complete your upgrade</p>
          </div>
        )}

        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-6 py-3 font-semibold text-gray-700 hover:border-sgf-green-500 hover:bg-sgf-green-50 transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-xs text-gray-400 mt-6">
          By signing in, you agree to our{" "}
          <a href="/terms" className="text-sgf-green-600 hover:underline">Terms</a>{" "}
          and{" "}
          <a href="/privacy" className="text-sgf-green-600 hover:underline">Privacy Policy</a>.
        </p>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Powered by{" "}
            <a href="https://startinggatefinancial.com" target="_blank" rel="noopener noreferrer" className="text-sgf-green-600 font-semibold hover:underline">
              Starting Gate Financial
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>}>
      <SignInContent />
    </Suspense>
  );
}
'''

os.makedirs("app/sign-in", exist_ok=True)
with open("app/sign-in/page.tsx", "w") as f:
    f.write(signin)
print("✅ Sign-in page created!")

# ============================================================
# 2. PRODUCT PAGE
# ============================================================
product = '''"use client";
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
    href: "/calculators/acquisition", free: true,
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
              <div key={calc.name} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-sgf-green-300 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-sgf-green-50 rounded-xl flex items-center justify-center group-hover:bg-sgf-green-500 transition-colors">
                    <Icon className="w-5 h-5 text-sgf-green-600 group-hover:text-white transition-colors" />
                  </div>
                  {calc.free ? (
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
                <Link href={calc.href} className="flex items-center gap-1 text-sm font-semibold text-sgf-green-600 hover:text-sgf-green-700 group-hover:gap-2 transition-all">
                  Open Calculator <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
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
'''

os.makedirs("app/product", exist_ok=True)
with open("app/product/page.tsx", "w") as f:
    f.write(product)
print("✅ Product page created!")

# ============================================================
# 3. FIX NAVBAR - Product link → /product, Sign In link
# ============================================================
with open("components/Navbar.tsx", "r") as f:
    navbar = f.read()

navbar = navbar.replace(
    'href="/calculators"',
    'href="/product"'
)

with open("components/Navbar.tsx", "w") as f:
    f.write(navbar)
print("✅ Navbar product link fixed!")

print("\nAll done! Now fix pricing bullets and resources page separately.")

# ============================================================
# 4. RESOURCES / GLOSSARY PAGE
# ============================================================
resources = '''"use client";
import { useState } from "react";
import { Search, X, BookOpen, Calculator, Building2, TrendingUp } from "lucide-react";

const glossary = [
  { term: "DSCR", category: "financing", full: "Debt Service Coverage Ratio",
    short: "A ratio measuring cash flow available to cover debt payments.",
    detail: "DSCR = Net Operating Income / Total Debt Service. Lenders typically require a minimum DSCR of 1.25x, meaning the business generates 25% more cash flow than needed to cover loan payments. A DSCR below 1.0 means the business cannot cover its debt from operations alone." },
  { term: "SDE", category: "valuation", full: "Seller's Discretionary Earnings",
    short: "Total financial benefit a full-time owner-operator derives from a business.",
    detail: "SDE = Net Profit + Owner's Salary + Non-cash expenses + One-time expenses + Personal expenses run through the business. SDE is the most common metric used to value small businesses under $5M in value. Typical SDE multiples range from 1.5x to 3.5x depending on industry and business size." },
  { term: "EBITDA", category: "valuation", full: "Earnings Before Interest, Taxes, Depreciation & Amortization",
    short: "A measure of core business profitability excluding financing and accounting decisions.",
    detail: "EBITDA is used to value mid-market businesses typically over $1M in earnings. It removes the effects of financing decisions, tax environments, and non-cash accounting entries to show the true operating profitability. EBITDA multiples typically range from 3x to 8x for small-to-mid market businesses." },
  { term: "NOI", category: "real-estate", full: "Net Operating Income",
    short: "A property's annual income after operating expenses, before debt service.",
    detail: "NOI = Gross Rental Income - Vacancy Loss - Operating Expenses. NOI does not include mortgage payments, capital expenditures, or depreciation. It is the primary metric used to value commercial real estate and determine loan sizing through DSCR analysis." },
  { term: "Cap Rate", category: "real-estate", full: "Capitalization Rate",
    short: "The rate of return on a real estate investment based on expected income.",
    detail: "Cap Rate = NOI / Property Value. A higher cap rate generally indicates higher risk and higher potential return. Market cap rates vary significantly by property type and location. Office typically 6.5-8.5%, Industrial 4.5-6.5%, Retail 5.5-7.5%, NNN Lease 4.0-6.0%." },
  { term: "LTV", category: "financing", full: "Loan-to-Value Ratio",
    short: "The ratio of a loan amount to the appraised value of the asset.",
    detail: "LTV = Loan Amount / Appraised Value. SBA loans typically allow up to 90% LTV, while conventional commercial loans usually require 75-80% LTV. Higher LTV means less down payment required but higher risk for the lender, often resulting in higher interest rates." },
  { term: "SBA 7(a)", category: "financing", full: "Small Business Administration 7(a) Loan Program",
    short: "The SBA's primary loan program for small business acquisition and growth.",
    detail: "SBA 7(a) loans can be used for business acquisition, working capital, equipment, and real estate. Maximum loan amount is $5M. Down payment typically 10-30%. Terms up to 10 years for business acquisition, 25 years for real estate. Rates are Prime + 2.75% for loans over $50K." },
  { term: "DCF", category: "valuation", full: "Discounted Cash Flow",
    short: "A valuation method that estimates value based on projected future cash flows.",
    detail: "DCF analysis discounts future cash flows back to present value using a discount rate (typically WACC or required rate of return). More appropriate for businesses with predictable, growing cash flows. The terminal value often represents 60-80% of total DCF value for stable businesses." },
  { term: "GRM", category: "real-estate", full: "Gross Rent Multiplier",
    short: "A quick valuation metric comparing property price to gross annual rent.",
    detail: "GRM = Property Price / Gross Annual Rent. Used as a quick screening tool rather than a precise valuation method. A GRM of 8-12 is common in many markets. Lower GRM may indicate a better deal, but does not account for expenses or vacancy." },
  { term: "CoC", category: "real-estate", full: "Cash-on-Cash Return",
    short: "Annual pre-tax cash flow as a percentage of total cash invested.",
    detail: "CoC = Annual Pre-Tax Cash Flow / Total Cash Invested. Measures the return on the actual cash you put into the deal. A CoC of 8-12% is generally considered good for real estate. Unlike cap rate, CoC accounts for financing and is specific to your deal terms." },
  { term: "BRRRR", category: "real-estate", full: "Buy, Rehab, Rent, Refinance, Repeat",
    short: "A real estate investment strategy to recycle capital across multiple properties.",
    detail: "BRRRR investors buy undervalued properties, add value through renovation, rent them out, then refinance to pull out equity and repeat the process. The goal is to recapture most or all of the initial investment while retaining the rental property and cash flow." },
  { term: "NNN", category: "real-estate", full: "Triple Net Lease",
    short: "A lease where the tenant pays rent plus property taxes, insurance, and maintenance.",
    detail: "In a NNN lease, the landlord receives a true net income with minimal management responsibility. NNN properties are valued highly by investors for their passive income characteristics. Cap rates for NNN properties are typically lower (4-6%) due to the reduced risk and management burden." },
  { term: "Amortization", category: "financing", full: "Loan Amortization",
    short: "The process of paying off a loan through scheduled, regular payments over time.",
    detail: "Each payment covers both interest and principal. Early in the loan term, most of the payment goes toward interest. As the loan matures, more goes to principal. A 25-year amortization schedule is common for SBA and commercial real estate loans." },
  { term: "Working Capital", category: "financing", full: "Working Capital",
    short: "The difference between current assets and current liabilities.",
    detail: "Working Capital = Current Assets - Current Liabilities. Adequate working capital is essential for day-to-day business operations. Lenders often require borrowers to maintain minimum working capital ratios. In business acquisitions, sufficient working capital post-close is a key underwriting consideration." },
];

const categories = [
  { id: "all", label: "All Terms", icon: BookOpen },
  { id: "financing", label: "Financing", icon: Calculator },
  { id: "valuation", label: "Valuation", icon: TrendingUp },
  { id: "real-estate", label: "Real Estate", icon: Building2 },
];

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<typeof glossary[0] | null>(null);

  const filtered = glossary.filter(g => {
    const matchCat = category === "all" || g.category === category;
    const matchSearch = !search || 
      g.term.toLowerCase().includes(search.toLowerCase()) ||
      g.full.toLowerCase().includes(search.toLowerCase()) ||
      g.short.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resources & Glossary</h1>
          <p className="text-gray-600">Essential terms for business acquisition, valuation, and commercial financing.</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search terms..."
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-sgf-green-500 focus:outline-none text-sm"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  category === cat.id 
                    ? "bg-sgf-green-600 text-white" 
                    : "bg-white border border-gray-200 text-gray-600 hover:border-sgf-green-400"
                }`}>
                <Icon className="w-3.5 h-3.5" />{cat.label}
              </button>
            );
          })}
        </div>

        {/* Glossary Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(term => (
            <button key={term.term} onClick={() => setSelected(term)}
              className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-sgf-green-400 hover:shadow-sm transition-all group">
              <div className="flex items-start justify-between mb-2">
                <span className="text-lg font-black text-sgf-green-700 group-hover:text-sgf-green-800">{term.term}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  term.category === "financing" ? "bg-blue-100 text-blue-700" :
                  term.category === "valuation" ? "bg-purple-100 text-purple-700" :
                  "bg-amber-100 text-amber-700"
                }`}>{term.category}</span>
              </div>
              <p className="text-xs text-gray-500 font-medium mb-1">{term.full}</p>
              <p className="text-sm text-gray-700">{term.short}</p>
              <p className="text-xs text-sgf-green-600 font-semibold mt-2 group-hover:underline">Read more</p>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">No terms found for "{search}"</div>
        )}
      </div>

      {/* Term Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-black text-sgf-green-700">{selected.term}</h2>
                <p className="text-sm text-gray-500 font-medium">{selected.full}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-800 text-sm leading-relaxed mb-4">{selected.detail}</p>
            <div className="bg-sgf-green-50 rounded-xl p-4">
              <p className="text-xs text-sgf-green-700 font-semibold">Need financing for your deal?</p>
              <a href="https://startinggatefinancial.com" target="_blank" rel="noopener noreferrer"
                className="text-xs text-sgf-green-600 hover:underline">
                Contact Starting Gate Financial
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
'''

with open("app/resources/page.tsx", "w") as f:
    f.write(resources)
print("✅ Resources/Glossary page created!")

# ============================================================
# 5. FIX PRICING - Remove internal bullets
# ============================================================
with open("app/pricing/page.tsx", "r") as f:
    pricing = f.read()

# Remove these bullets from features lists
remove_bullets = [
    '"SGF financing CTA",\n',
    '"PDF export with SGF branding",\n', 
    '"SGF referral dashboard",\n',
    '      "SGF financing CTA",\n',
    '      "PDF export with SGF branding",\n',
    '      "SGF referral dashboard",\n',
]
for bullet in remove_bullets:
    pricing = pricing.replace(bullet, "")

with open("app/pricing/page.tsx", "w") as f:
    f.write(pricing)
print("✅ Pricing bullets cleaned!")
