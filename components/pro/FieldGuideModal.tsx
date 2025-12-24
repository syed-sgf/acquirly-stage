import { useState } from 'react';
import { X, BookOpen, TrendingUp, Search } from 'lucide-react';
import { FIELD_DEFINITIONS, INDUSTRY_BENCHMARKS, QUICK_RULES, searchFieldDefinitions } from '@/lib/field-definitions';

interface FieldGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FieldGuideModal({ isOpen, onClose }: FieldGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'definitions' | 'benchmarks' | 'rules'>('definitions');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const searchResults = searchQuery ? searchFieldDefinitions(searchQuery) : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sgf-green-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-sgf-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Field Guide & Best Practices</h2>
                <p className="text-sm text-gray-500">Reference guide for deal analysis</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('definitions')}
                className={`py-3 px-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'definitions'
                    ? 'border-sgf-green-500 text-sgf-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Field Definitions
              </button>
              <button
                onClick={() => setActiveTab('benchmarks')}
                className={`py-3 px-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'benchmarks'
                    ? 'border-sgf-green-500 text-sgf-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Industry Benchmarks
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                className={`py-3 px-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'rules'
                    ? 'border-sgf-green-500 text-sgf-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Quick Rules
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            {activeTab === 'definitions' && (
              <div className="p-6">
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search field definitions..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sgf-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Search Results or All Definitions */}
                <div className="space-y-4">
                  {searchQuery && searchResults.length > 0 ? (
                    // Search Results
                    searchResults.map(({ field, label, definition, category }) => (
                      <div
                        key={field}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-sgf-green-200 hover:bg-sgf-green-50/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-semibold text-gray-900">{label}</h3>
                          <span className="text-xs px-2 py-1 bg-sgf-green-100 text-sgf-green-700 rounded">
                            {category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{definition}</p>
                      </div>
                    ))
                  ) : searchQuery && searchResults.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No results found for "{searchQuery}"
                    </div>
                  ) : (
                    // All Definitions by Category
                    <>
                      <div className="space-y-3">
                        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                          <div className="w-1 h-6 bg-sgf-green-500 rounded" />
                          Deal Structure
                        </h3>
                        {Object.entries(FIELD_DEFINITIONS)
                          .filter(([key]) => [
                            'askingOrOfferPrice',
                            'annualRevenue',
                            'annualCashFlow',
                            'ffeValue',
                            'inventoryValue',
                            'realEstateValue',
                          ].includes(key))
                          .map(([key, definition]) => (
                            <div key={key} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </h4>
                              <p className="text-sm text-gray-600">{definition}</p>
                            </div>
                          ))}
                      </div>

                      <div className="space-y-3 mt-6">
                        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                          <div className="w-1 h-6 bg-blue-500 rounded" />
                          Operating Assumptions
                        </h3>
                        {Object.entries(FIELD_DEFINITIONS)
                          .filter(([key]) => [
                            'buyersMinimumSalary',
                            'workingCapitalRequirement',
                            'annualCapexMaintenance',
                            'annualCapexNewInvestments',
                          ].includes(key))
                          .map(([key, definition]) => (
                            <div key={key} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </h4>
                              <p className="text-sm text-gray-600">{definition}</p>
                            </div>
                          ))}
                      </div>

                      <div className="space-y-3 mt-6">
                        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                          <div className="w-1 h-6 bg-amber-500 rounded" />
                          Financing
                        </h3>
                        {Object.entries(FIELD_DEFINITIONS)
                          .filter(([key]) => [
                            'buyerEquity',
                            'sellerFinancing',
                            'termLoan',
                            'revolvingLOC',
                            'closingCosts',
                            'interestRateTermLoanAPR',
                            'termYears',
                            'interestRateLOCAPR',
                          ].includes(key))
                          .map(([key, definition]) => (
                            <div key={key} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </h4>
                              <p className="text-sm text-gray-600">{definition}</p>
                            </div>
                          ))}
                      </div>

                      <div className="space-y-3 mt-6">
                        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                          <div className="w-1 h-6 bg-purple-500 rounded" />
                          Return Metrics
                        </h3>
                        {Object.entries(FIELD_DEFINITIONS)
                          .filter(([key]) => [
                            'dscr',
                            'cashOnCashReturn',
                            'returnOnInvestment',
                            'leverageRatio',
                            'excessCashFlow',
                          ].includes(key))
                          .map(([key, definition]) => (
                            <div key={key} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </h4>
                              <p className="text-sm text-gray-600">{definition}</p>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'benchmarks' && (
              <div className="p-6 space-y-6">
                {Object.entries(INDUSTRY_BENCHMARKS).map(([key, benchmark]) => (
                  <div key={key} className="p-4 bg-gradient-to-br from-sgf-green-50 to-white rounded-lg border border-sgf-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-sgf-green-600" />
                      <h3 className="font-bold text-gray-900">{benchmark.description}</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(benchmark)
                        .filter(([k]) => k !== 'description')
                        .map(([level, value]) => (
                          <div key={level} className="text-center p-3 bg-white rounded border border-gray-200">
                            <div className="text-xs text-gray-500 uppercase mb-1">
                              {level.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="text-lg font-bold text-sgf-green-600">
                              {typeof value === 'number' 
                                ? value < 1 
                                  ? `${(value * 100).toFixed(0)}%`
                                  : `${value.toFixed(2)}x`
                                : value}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="p-6 space-y-6">
                {Object.entries(QUICK_RULES).map(([category, rules]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      <div className="w-1 h-6 bg-sgf-green-500 rounded" />
                      {category}
                    </h3>
                    <ul className="space-y-2">
                      {rules.map((rule, idx) => (
                        <li 
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-sgf-green-50 transition-colors"
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-sgf-green-100 text-sgf-green-600 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                            {idx + 1}
                          </div>
                          <span className="text-gray-700">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
