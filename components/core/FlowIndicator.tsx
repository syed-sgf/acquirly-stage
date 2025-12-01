'use client';

import { ChevronRight } from 'lucide-react';

const flowSteps = [
  { number: 1, label: 'Business Cash Flow' },
  { number: 2, label: 'Debt Assumptions' },
  { number: 3, label: 'DSCR Result' }
];

export default function FlowIndicator() {
  return (
    <div className="bg-gradient-to-r from-sgf-green-50 to-transparent border-l-4 border-sgf-green-500 rounded-lg p-4 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {flowSteps.map((step, index) => (
            <div key={step.number} className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 bg-sgf-green-500 text-white rounded-full text-xs font-bold">
                  {step.number}
                </span>
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{step.label}</span>
              </div>
              {index < flowSteps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-sgf-gold-500 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
        <div className="sm:ml-auto text-xs text-gray-500">
          Complete Steps 1 & 2 to calculate your Debt Service Coverage Ratio
        </div>
      </div>
    </div>
  );
}
