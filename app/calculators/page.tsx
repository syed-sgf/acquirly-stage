import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Calculators | ACQUIRELY',
  description: 'Free business acquisition calculators for DSCR, valuation, loan sizing, and deal analysis.',
};

export default function CalculatorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Business Calculators</h1>
        <p className="text-xl text-gray-600 mb-8">Professional tools for business acquisition analysis</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/core" className="bg-white rounded-2xl border-2 border-emerald-200 p-6 hover:border-emerald-500 hover:shadow-xl transition">
            <div className="text-4xl mb-3">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">DSCR Calculator</h2>
            <p className="text-gray-600">Calculate Debt Service Coverage Ratio for loan qualification</p>
          </Link>
          
          <Link href="/deals" className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-emerald-500 hover:shadow-xl transition">
            <div className="text-4xl mb-3">📈</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Deal Analyzer</h2>
            <p className="text-gray-600">Complete business acquisition analysis with ROI projections</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
