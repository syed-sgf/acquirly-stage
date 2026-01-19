export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  BarChart3, 
  Calculator, 
  TrendingUp, 
  Crown,
  Plus,
  ArrowRight,
  Briefcase,
  Clock
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  const userId = session.user.id;

  const [dealCount, analysisCount, recentDeals] = await Promise.all([
    prisma.deal.count({
      where: { userId },
    }),
    prisma.analysis.count({
      where: {
        deal: { userId },
      },
    }),
    prisma.deal.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const primaryDeal = recentDeals[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sgf-green-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sgf-green-500 via-sgf-green-600 to-sgf-green-700 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Dashboard
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome back, {session.user.name || "there"} 👋
            </h1>
            <p className="text-sgf-green-100 mt-2 max-w-2xl">
              {dealCount > 0
                ? `You have ${dealCount} deal${dealCount > 1 ? "s" : ""} ready for analysis`
                : "Start your first deal to begin analyzing opportunities"}
            </p>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Deals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Total Deals</span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-4xl font-bold text-gray-900">{dealCount}</p>
              <p className="text-sm text-gray-500 mt-1">Active opportunities</p>
            </div>
          </div>

          {/* Analyses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Analyses</span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-4xl font-bold text-gray-900">{analysisCount}</p>
              <p className="text-sm text-gray-500 mt-1">Completed calculations</p>
            </div>
          </div>

          {/* Plan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Your Plan</span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-4xl font-bold text-gray-900 uppercase">
                {session.user.plan || "FREE"}
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 text-sm text-sgf-gold-600 hover:text-sgf-gold-700 font-semibold mt-2 transition-colors"
              >
                Upgrade to Pro
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {primaryDeal ? (
            <Link
              href={`/app/deals/${primaryDeal.id}`}
              className="block bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 text-white rounded-xl p-6 hover:from-sgf-green-600 hover:to-sgf-green-700 transition-all shadow-lg hover:shadow-xl group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                    <TrendingUp className="w-3 h-3" />
                    Continue Working
                  </div>
                  <h2 className="text-xl font-bold mb-2">
                    {primaryDeal.name}
                  </h2>
                  <p className="text-sgf-green-100">
                    Pick up where you left off
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          ) : (
            <Link
              href="/app/deals/new"
              className="block bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 text-white rounded-xl p-6 hover:from-sgf-green-600 hover:to-sgf-green-700 transition-all shadow-lg hover:shadow-xl group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                    <Plus className="w-3 h-3" />
                    Get Started
                  </div>
                  <h2 className="text-xl font-bold mb-2">
                    Create Your First Deal
                  </h2>
                  <p className="text-sgf-green-100">
                    Start analyzing a business acquisition
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          )}

          {dealCount > 0 && (
            <Link
              href="/app/deals/new"
              className="block bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-sgf-green-500 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 bg-sgf-green-50 text-sgf-green-600 px-3 py-1 rounded-full text-xs font-bold mb-3">
                    <Plus className="w-3 h-3" />
                    New Deal
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Create New Deal
                  </h2>
                  <p className="text-gray-600">
                    Add another opportunity to your portfolio
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-sgf-green-50 transition-colors">
                  <Plus className="w-6 h-6 text-gray-400 group-hover:text-sgf-green-500 transition-colors" />
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Recent Deals */}
        {recentDeals.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Recent Deals</span>
              </div>
              <Link 
                href="/app/deals"
                className="text-sm text-sgf-green-600 hover:text-sgf-green-700 font-semibold transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentDeals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/app/deals/${deal.id}`}
                  className="block px-6 py-4 hover:bg-sgf-green-50/50 transition-colors group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-sgf-green-600 transition-colors">
                        {deal.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Updated {deal.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sgf-green-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Open
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Access Tools */}
        <div className="mt-8 bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-4">Quick Access Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/core"
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">DSCR Calculator</p>
                    <p className="text-sm text-sgf-green-100">Debt coverage ratio</p>
                  </div>
                </div>
              </Link>
              
              <Link
                href="/business-loan"
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Business Loan</p>
                    <p className="text-sm text-sgf-green-100">Payment calculator</p>
                  </div>
                </div>
              </Link>
              
              <a
                href="https://startinggatefinancial.com/apply"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-sgf-gold-500 hover:bg-sgf-gold-600 rounded-lg p-4 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Apply for Financing</p>
                    <p className="text-sm text-sgf-gold-100">Get funded today</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
