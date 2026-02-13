import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit3, 
  Plus, 
  BarChart3, 
  DollarSign, 
  TrendingUp,
  Diamond,
  Building2,
  Landmark,
  Clock,
  ArrowRight,
  Calculator,
  FileText
} from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/format';

export default async function DealPage({ 
  params 
}: { 
  params: Promise<{ dealId: string }> 
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  const { dealId } = await params;

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: {
      analyses: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!deal) {
    redirect('/app/deals');
  }

  // Group analyses by type
  const analysesByType = deal.analyses.reduce((acc, analysis) => {
    if (!acc[analysis.type]) acc[analysis.type] = [];
    acc[analysis.type].push(analysis);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sgf-green-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Back Navigation */}
        <Link 
          href="/app/deals"
          className="inline-flex items-center gap-2 text-sgf-green-600 hover:text-sgf-green-700 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Deals
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-sgf-green-500 via-sgf-green-600 to-sgf-green-700 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                <FileText className="w-3 h-3" />
                Deal Analysis
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{deal.name}</h1>
              <p className="text-sgf-green-100 mt-2">
                Created {formatDate(deal.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/app/deals/${dealId}/edit`}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-5 py-2.5 rounded-lg font-semibold transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Edit Deal
              </Link>
              <Link
                href={`/app/deals/${dealId}/acquisition`}
                className="inline-flex items-center justify-center gap-2 bg-sgf-gold-500 hover:bg-sgf-gold-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                New Analysis
              </Link>
            </div>
          </div>
        </div>

        {/* Analyses Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* DSCR Analysis Card */}
            <AnalysisCard
              title="DSCR Analysis"
              description="Debt Service Coverage Ratio"
              count={analysesByType['dscr']?.length || 0}
              href={`/app/deals/${dealId}/dscr`}
              icon={<BarChart3 className="w-6 h-6" />}
              color="green"
            />

            {/* Business Loan Card */}
            <AnalysisCard
              title="Business Loan"
              description="Loan payment calculator"
              count={analysesByType['business-loan']?.length || 0}
              href={`/app/deals/${dealId}/business-loan`}
              icon={<DollarSign className="w-6 h-6" />}
              color="gold"
            />

            {/* Acquisition Analysis Card */}
            <AnalysisCard
              title="Acquisition Analysis"
              description="ROI & equity tracking"
              count={analysesByType['acquisition']?.length || 0}
              href={`/app/deals/${dealId}/acquisition`}
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
              highlight
            />

            {/* Valuation Card */}
            <AnalysisCard
              title="Valuation"
              description="Business value assessment"
              count={analysesByType['valuation']?.length || 0}
              href={`/app/deals/${dealId}/valuation`}
              icon={<Diamond className="w-6 h-6" />}
              color="gray"
              comingSoon
            />

            {/* CRE Acquisition Analyzer Card */}
            <AnalysisCard
              title="CRE Acquisition"
              description="Real estate deal analysis"
              count={analysesByType['cre-acquisition']?.length || 0}
              href={`/app/deals/${dealId}/cre-acquisition`}
              icon={<Building2 className="w-6 h-6" />}
              color="gray"
              comingSoon
            />

            {/* CRE Loan Sizer Card */}
            <AnalysisCard
              title="CRE Loan Sizer"
              description="Commercial loan capacity"
              count={analysesByType['cre-loan']?.length || 0}
              href={`/app/deals/${dealId}/cre-loan-sizer`}
              icon={<Landmark className="w-6 h-6" />}
              color="gray"
              comingSoon
            />
          </div>
        </div>

        {/* Recent Activity */}
        {deal.analyses.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Recent Activity</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {deal.analyses.slice(0, 5).map((analysis) => (
                <Link
                  key={analysis.id}
                  href={`/app/deals/${dealId}/${analysis.type}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-sgf-green-50/50 transition-colors group"
                >
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-sgf-green-600 transition-colors">
                      {analysis.type.toUpperCase().replace('-', ' ')} Analysis
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(analysis.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sgf-green-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    View
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {deal.analyses.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-sgf-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calculator className="w-10 h-10 text-sgf-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Analyses Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start analyzing this deal with our comprehensive suite of business calculators.
              </p>
              <Link
                href={`/app/deals/${dealId}/acquisition`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 hover:from-sgf-green-600 hover:to-sgf-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                Run Your First Analysis
              </Link>
            </div>
          </div>
        )}

        {/* Financing CTA */}
        <div className="mt-8 bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Ready to Finance This Deal?</h2>
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

function AnalysisCard({
  title,
  description,
  count,
  href,
  icon,
  color,
  comingSoon = false,
  highlight = false,
}: {
  title: string;
  description: string;
  count: number;
  href: string;
  icon: React.ReactNode;
  color: string;
  comingSoon?: boolean;
  highlight?: boolean;
}) {
  const colorClasses = {
    green: {
      card: 'bg-white border-2 border-sgf-green-200 hover:border-sgf-green-400',
      icon: 'bg-sgf-green-500 text-white',
      badge: 'bg-sgf-green-50 text-sgf-green-600',
    },
    gold: {
      card: 'bg-white border-2 border-sgf-gold-200 hover:border-sgf-gold-400',
      icon: 'bg-sgf-gold-500 text-white',
      badge: 'bg-sgf-gold-50 text-sgf-gold-600',
    },
    gray: {
      card: 'bg-white border-2 border-gray-200',
      icon: 'bg-gray-400 text-white',
      badge: 'bg-gray-100 text-gray-600',
    },
  };

  const classes = colorClasses[color as keyof typeof colorClasses] || colorClasses.gray;

  const Content = (
    <div className="p-6">
      <div className={`w-12 h-12 ${classes.icon} rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      {count > 0 && (
        <span className={`inline-flex items-center gap-1 ${classes.badge} px-2.5 py-1 rounded-full text-xs font-semibold`}>
          {count} {count === 1 ? 'analysis' : 'analyses'}
        </span>
      )}
      {comingSoon && (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full">
          Coming Soon
        </span>
      )}
    </div>
  );

  if (comingSoon) {
    return (
      <div className={`${classes.card} rounded-xl opacity-60 cursor-not-allowed transition-all`}>
        {Content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`block ${classes.card} rounded-xl hover:shadow-lg transition-all ${highlight ? 'ring-2 ring-sgf-green-500 ring-offset-2' : ''}`}
    >
      {Content}
    </Link>
  );
}
