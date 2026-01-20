export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  BarChart3, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  Briefcase,
  Activity,
  TrendingUp,
  FolderOpen
} from 'lucide-react';
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

  const totalAnalyses = deals.reduce((sum, deal) => sum + deal._count.analyses, 0);
  const recentActivity = deals.filter(d => {
    const daysSinceUpdate = (Date.now() - new Date(d.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate <= 7;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sgf-green-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sgf-green-500 via-sgf-green-600 to-sgf-green-700 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                <Briefcase className="w-3 h-3" />
                Deal Portfolio
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">My Deals</h1>
              <p className="text-sgf-green-100 mt-2">
                Manage and analyze your business opportunities
              </p>
            </div>
            <Link
              href="/app/deals/new"
              className="inline-flex items-center justify-center gap-2 bg-sgf-gold-500 hover:bg-sgf-gold-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              New Deal
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Deals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Total Deals</span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-4xl font-bold text-gray-900">{deals.length}</p>
              <p className="text-sm text-gray-500 mt-1">Active opportunities</p>
            </div>
          </div>

          {/* Total Analyses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Total Analyses</span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-4xl font-bold text-gray-900">{totalAnalyses}</p>
              <p className="text-sm text-gray-500 mt-1">Completed calculations</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Recent Activity</span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-4xl font-bold text-gray-900">{recentActivity}</p>
              <p className="text-sm text-gray-500 mt-1">Updated in last 7 days</p>
            </div>
          </div>
        </div>

        {/* Deals List */}
        {deals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-sgf-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-sgf-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No deals yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create your first deal to start analyzing business acquisition opportunities
              </p>
              <Link
                href="/app/deals/new"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 hover:from-sgf-green-600 hover:to-sgf-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Your First Deal
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">All Deals</span>
              </div>
              <span className="text-sm text-gray-500">{deals.length} total</span>
            </div>
            <div className="divide-y divide-gray-100">
              {deals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/app/deals/${deal.id}`}
                  className="block px-6 py-5 hover:bg-sgf-green-50/50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-sgf-green-600 transition-colors">
                          {deal.name}
                        </h3>
                        {deal._count.analyses > 0 && (
                          <span className="inline-flex items-center gap-1 bg-sgf-green-50 text-sgf-green-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                            <BarChart3 className="w-3 h-3" />
                            {deal._count.analyses} {deal._count.analyses === 1 ? 'analysis' : 'analyses'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Updated {formatDate(deal.updatedAt, 'relative')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sgf-green-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Open
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="flex items-center justify-center pt-8">
          <Link 
            href="/app"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-sgf-green-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-8 bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Need Financing for Your Deal?</h2>
              <p className="text-sgf-green-100 max-w-lg">
                Starting Gate Financial offers competitive business acquisition loans and SBA financing solutions.
              </p>
            </div>
            <a
              href="https://startinggatefinancial.com/apply"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-sgf-gold-500 hover:bg-sgf-gold-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
            >
              Apply for Financing
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
