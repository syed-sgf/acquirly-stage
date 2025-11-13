"use client";
import { useState } from "react";
import { FIELD_CATEGORIES, FIELD_DEFINITIONS, INDUSTRY_BENCHMARKS } from "@/lib/field-definitions";

export default function LegendModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"fields" | "benchmarks">("fields");

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-brand-green-600 px-4 py-3 text-white shadow-lg hover:bg-brand-green-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="font-medium">Field Guide</span>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-10 lg:inset-20 z-50 bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Deal Analysis Field Guide</h2>
            <p className="text-sm text-gray-600 mt-1">
              Understand every metric and make informed decisions
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("fields")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "fields"
                ? "text-brand-green-600 border-b-2 border-brand-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Field Definitions
          </button>
          <button
            onClick={() => setActiveTab("benchmarks")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "benchmarks"
                ? "text-brand-green-600 border-b-2 border-brand-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Industry Benchmarks
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "fields" ? (
            <div className="space-y-8">
              {Object.entries(FIELD_CATEGORIES).map(([category, fields]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-brand-green-600 rounded" />
                    {category}
                  </h3>
                  <div className="space-y-4 ml-4">
                    {fields.map((field) => {
                      const definition = FIELD_DEFINITIONS[field as keyof typeof FIELD_DEFINITIONS];
                      const fieldName = field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
                      
                      return (
                        <div key={field} className="bg-gray-50 rounded-lg p-4">
                          <dt className="font-medium text-gray-900 mb-1">{fieldName}</dt>
                          <dd className="text-sm text-gray-600">{definition}</dd>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> These benchmarks are general guidelines. Your specific industry, market, and deal circumstances may vary significantly. Always consult with your financial advisor, lender, and M&A professional.
                </p>
              </div>

              {Object.entries(INDUSTRY_BENCHMARKS).map(([key, benchmark]) => (
                <div key={key} className="border rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-brand-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {benchmark.description}
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    {Object.entries(benchmark)
                      .filter(([k]) => k !== "description")
                      .map(([label, value]) => (
                        <div key={label} className="bg-gray-50 rounded p-3">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            {label.replace(/([A-Z])/g, " $1").trim()}
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {typeof value === "number"
                              ? key.includes("Return") || key.includes("Payment")
                                ? `${(value * 100).toFixed(0)}%`
                                : value.toFixed(2) + "x"
                              : value}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}

              <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-5">
                <h4 className="font-semibold text-amber-900 mb-2">Quick Reference Rules of Thumb</h4>
                <ul className="space-y-2 text-sm text-amber-900">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-green-600 mt-0.5">•</span>
                    <span><strong>DSCR &lt; 1.25:</strong> Likely won't qualify for SBA financing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-green-600 mt-0.5">•</span>
                    <span><strong>Down Payment:</strong> SBA requires minimum 10%, but 15-20% is typical</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-green-600 mt-0.5">•</span>
                    <span><strong>Valuation Multiple:</strong> Most small businesses sell for 2.5x-4.5x SDE</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-green-600 mt-0.5">•</span>
                    <span><strong>Working Capital:</strong> Typically 10-25% of revenue or 1-3 months of operating expenses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-green-600 mt-0.5">•</span>
                    <span><strong>Cash-on-Cash Return:</strong> Target 20-30% for acceptable risk-adjusted returns</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center">
            This guide is for informational purposes only. Consult with qualified advisors before making investment decisions.
          </p>
        </div>
      </div>
    </>
  );
}
