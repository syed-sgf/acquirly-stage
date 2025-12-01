'use client';

import { Info } from 'lucide-react';

interface LegendItem {
  color: 'red' | 'amber' | 'green';
  label: string;
  range: string;
  meaning: string;
}

const legendItems: LegendItem[] = [
  { color: 'red', label: 'High Risk', range: '≤ 1.15', meaning: 'Likely loan decline' },
  { color: 'amber', label: 'Marginal', range: '1.16 – 1.24', meaning: 'May need restructuring' },
  { color: 'green', label: 'Bankable', range: '≥ 1.25', meaning: 'Meets lender requirements' }
];

const getColorClasses = (color: string) => {
  switch (color) {
    case 'red': return 'bg-red-500';
    case 'amber': return 'bg-sgf-gold-500';
    case 'green': return 'bg-sgf-green-500';
    default: return 'bg-gray-400';
  }
};

export default function DSCRLegend() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <Info className="w-5 h-5 text-sgf-green-500" />
          <span>DSCR Lending Guidelines</span>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {legendItems.map((item) => (
            <div key={item.color} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2.5">
              <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${getColorClasses(item.color)}`} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{item.label}</span>
                  <span className="text-xs font-mono text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">{item.range}</span>
                </div>
                <div className="text-xs text-gray-500 italic">{item.meaning}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
