/**
 * Field Guide Modal
 * Floating modal with comprehensive field definitions and industry benchmarks
 */

'use client';

import { useState } from 'react';
import { X, BookOpen, TrendingUp, Search } from 'lucide-react';
import { FIELD_DEFINITIONS, INDUSTRY_BENCHMARKS, QUICK_RULES, searchFieldDefinitions } from '@/lib/field-definitions';

interface FieldGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FieldGuideModal({ isOpen, onClose }: FieldGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'definitions' | 'benchmarks'>('definitions');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredDefinitions = searchQuery.trim() 
    ? searchFieldDefinitions(searchQuery)
    : Object.entries(FIELD_DEFINITIONS).map(([key, definition]) => ({ key, definition }));

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed right-4 top-4 bottom-4 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-sgf-green-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Field Guide</h2>
              <p className="text-sm text-gray-500">Definitions & Industry Benchmarks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close field guide"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6">
          <button
            onClick={() => setActiveTab('definitions')}
            className={`px-4 py-3 font-semibold text-sm transition-colors relative ${
              activeTab === 'definitions'
                ? 'text-sgf-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Field Definitions
            {activeTab === 'definitions' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sgf-green-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`px-4 py-3 font-semibold text-sm transition-colors relative ${
              activeTab === 'benchmarks'
                ? 'text-sgf-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Industry Benchmarks
            {activeTab === 'benchmarks' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sgf-green-600" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'definitions' && (
            <div className="p-6 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search fields..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-sgf-green-500 focus:border-sgf-green-500"
                />
              </div>

              {/* Field Definitions */}
              <div className="space-y-4">
                {filteredDefinitions.map(({ key, definition }) => (
                  <div
                    key={key}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-sgf-green-200 hover:bg-sgf-green-50/50 transition-colors"
                  >
                    <h3 className="font-bold text-gray-900 mb-2">{definition.title}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      {definition.description}
                    </p>
                    
                    {definition.formula && (
                      <div className="bg-white border border-sgf-gold-200 rounded px-3 py-2 mb-2">
                        <div className="text-xs font-semibold text-sgf-gold-600 mb-1">Formula</div>
                        <code className="text-xs font-mono text-gray-700">{definition.formula}</code>
                      </div>
                    )}
                    
                    {definition.example && (
                      <div className="text-xs text-gray-500">
                        <span className="font-semibold">Example:</span> {definition.example}
                      </div>
                    )}
                    
                    {definition.benchmark && (
                      <div className="mt-2 bg-sgf-green-50 border border-sgf-green-200 rounded px-3 py-2">
                        <div className="text-xs font-semibold text-sgf-green-700 mb-1">Benchmark</div>
                        <div className="text-xs text-sgf-green-600">{definition.benchmark}</div>
                      </div>
                    )}
                  </div>
                ))}

                {filteredDefinitions.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No fields found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'benchmarks' && (
            <div className="p-6 space-y-6">
              {/* Industry Benchmarks Table */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-sgf-green-600" />
                  <h3 className="font-bold text-gray-900">Industry Standards</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Metric</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Minimum</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Good</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Excellent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {INDUSTRY_BENCHMARKS.map((benchmark, index) => (
                        <tr key={index} className="border-b border-gray-200 hover:bg-sgf-green-50/30">
                          <td className="px-4 py-3 font-semibold text-gray-900">{benchmark.metric}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{benchmark.minimum}</td>
                          <td className="px-4 py-3 text-sm text-sgf-gold-600 font-semibold">{benchmark.good}</td>
                          <td className="px-4 py-3 text-sm text-sgf-green-600 font-semibold">{benchmark.excellent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Rules */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Quick Reference Rules</h3>
                <div className="space-y-2">
                  {QUICK_RULES.map((rule, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-sgf-gold-50 border border-sgf-gold-200 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-sgf-gold-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro Tip */}
              <div className="bg-gradient-to-r from-sgf-green-50 to-sgf-gold-50 border-2 border-sgf-green-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">💡</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Pro Tip</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      These benchmarks are industry averages. Your specific deal may vary based on 
                      industry, location, growth prospects, and risk factors. Always consult with 
                      your financial advisor or Starting Gate Financial for personalized guidance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {filteredDefinitions.length} {activeTab === 'definitions' ? 'fields' : 'benchmarks'} available
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-sgf-green-600 text-white rounded-lg font-semibold hover:bg-sgf-green-700 transition-colors"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
