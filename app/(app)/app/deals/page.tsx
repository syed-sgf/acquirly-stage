export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/format';

export default async function DealsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/');

  const deals = await prisma.deal.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { analyses: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Deals</h1>
            <p className="text-gray-600 mt-1">Manage and analyze your business opportunities</p>
          </div>
          <Link
            href="/app/deals/new"
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            + New Deal
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Total Deals</div>
            <div className="text-3xl font-bold text-gray-900">{deals.length}</div>
          </div>
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Total Analyses</div>
            <div className="text-3xl font-bold text-gray-900">
              {deals.reduce((sum, deal) => sum + deal._count.analyses, 0)}
            </div>
          </div>
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Recent Activity</div>
            <div className="text-3xl font-bold text-gray-900">
              {deals.filter(d => {
                const daysSinceUpdate = (Date.now() - new Date(d.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
                return daysSinceUpdate <= 7;
              }).length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Last 7 days</div>
          </div>
        </div>

        {/* Deals List */}
        {deals.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No deals yet</h3>
            <p className="text-gray-600 mb-6">Create your first deal to start analyzing opportunities</p>
            <Link
              href="/app/deals/new"
              className="inline-block bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Create Your First Deal
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {deals.map((deal) => (
              <Link
                key={deal.id}
                href={`/app/deals/${deal.id}`}
                className="block bg-white rounded-2xl border-2 border-gray-200 hover:border-emerald-400 hover:shadow-lg transition-all p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{deal.name}</h3>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>{deal._count.analyses} analyses</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Updated {formatDate(deal.updatedAt, 'relative')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      Open
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="flex items-center justify-center pt-4">
          <Link 
            href="/app"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
