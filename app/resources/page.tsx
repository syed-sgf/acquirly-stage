"use client";
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
