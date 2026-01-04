export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/format';

const CALCULATORS = [
  {
    id: 'dscr',
    name: 'DSCR Calculator',
    description: 'Debt Service Coverage Ratio Analysis',
    icon: '📊',
    color: 'emerald',
    href: 'dscr',
  },
  {
    id: 'acquisition',
    name: 'Business Acquisition Analyzer',
    description: 'Complete deal analysis with ROI, equity, and scenarios',
    icon: '💼',
    color: 'emerald',
    href: 'acquisition',
    comingSoon: true,
  },
  {
    id: 'valuation',
    name: 'Business Valuation Calculator',
    description: 'Multiple valuation methods and industry benchmarks',
    icon: '💰',
    color: 'amber',
    href: 'valuation',
    comingSoon: true,
  },
  {
    id: 'reAcquisition',
    name: 'Real Estate Acquisition Analyzer',
    description: 'Commercial real estate deal analysis',
    icon: '🏢',
    color: 'emerald',
    href: 're-acquisition',
    comingSoon: true,
  },
  {
    id: 'loanCapacity',
    name: 'Loan Capacity Calculator',
    description: 'Determine maximum borrowing power',
    icon: '🎯',
    color: 'blue',
    href: 'loan-capacity',
    comingSoon: true,
  },
];

export default async function DealOverviewPage({ params }: { params: { dealId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/');

  const deal = await prisma.deal.findFirst({
    where: { id: params.dealId, userId: session.user.id },
    include: {
      analyses: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!deal) redirect('/app');

  // Count analyses by type
  const analysisCounts = deal.analyses.reduce((acc, analysis) => {
    acc[analysis.type] = (acc[analysis.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/app" className="hover:text-emerald-600 transition">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/app/deals" className="hover:text-emerald-600 transition">
            Deals
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{deal.name}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/app/deals"
              className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition group"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{deal.name}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Created {formatDate(deal.createdAt, 'long')} • Last updated {formatDate(deal.updatedAt, 'relative')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Analyses</div>
                <div className="text-3xl font-bold text-gray-900">{deal.analyses.length}</div>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">DSCR Calculations</div>
                <div className="text-3xl font-bold text-gray-900">{analysisCounts.dscr || 0}</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Last Activity</div>
                <div className="text-lg font-bold text-gray-900">
                  {deal.analyses.length > 0 
                    ? formatDate(deal.analyses[0].createdAt, 'relative')
                    : 'No activity yet'
                  }
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Calculators Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Calculators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CALCULATORS.map((calc) => {
              const analysisCount = analysisCounts[calc.id] || 0;
              const isComingSoon = calc.comingSoon;

              return (
                <Link
                  key={calc.id}
                  href={isComingSoon ? '#' : `/app/deals/${deal.id}/${calc.href}`}
                  className={`
                    block bg-white rounded-2xl border-2 p-6 transition-all
                    ${isComingSoon 
                      ? 'border-gray-200 opacity-60 cursor-not-allowed' 
                      : 'border-gray-200 hover:border-emerald-300 hover:shadow-lg cursor-pointer'
                    }
                  `}
                  onClick={(e) => isComingSoon && e.preventDefault()}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{calc.icon}</div>
                    {isComingSoon ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                        Coming Soon
                      </span>
                    ) : analysisCount > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {analysisCount} {analysisCount === 1 ? 'analysis' : 'analyses'}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{calc.name}</h3>
                  <p className="text-sm text-gray-600">{calc.description}</p>
                  {!isComingSoon && (
                    <div className="mt-4 flex items-center text-emerald-600 font-medium text-sm">
                      Open Calculator
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Analyses */}
        {deal.analyses.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Analyses</h2>
            <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Results
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deal.analyses.map((analysis) => {
                      const calc = CALCULATORS.find(c => c.id === analysis.type);
                      const outputs = analysis.outputs as any;
                      
                      return (
                        <tr key={analysis.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{calc?.icon || '📊'}</span>
                              <div className="text-sm font-medium text-gray-900">{calc?.name || analysis.type}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(analysis.createdAt, 'long')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {analysis.type === 'dscr' && outputs?.dscr && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                outputs.dscr >= 1.25 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : outputs.dscr >= 1.16
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}>
                                DSCR: {outputs.dscr}x
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Link 
                              href={`/app/deals/${deal.id}/${calc?.href || analysis.type}`}
                              className="text-emerald-600 hover:text-emerald-800 font-medium"
                            >
                              View →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Empty State for No Analyses */}
        {deal.analyses.length === 0 && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Analyze This Deal?</h3>
            <p className="text-gray-600 mb-6">Choose a calculator above to get started with your analysis</p>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Link 
            href="/app/deals"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Deals
          </Link>
          <div className="text-xs text-gray-500">
            Deal ID: <span className="font-mono">{deal.id.substring(0, 12)}...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
