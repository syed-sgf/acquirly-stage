import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
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
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/app/deals"
          className="text-emerald-600 hover:text-emerald-700 mb-2 inline-block"
        >
          ← Back to Deals
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{deal.name}</h1>
            <p className="text-gray-600">Created {formatDate(deal.createdAt)}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/app/deals/${dealId}/edit`}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Edit Deal
            </Link>
            <Link
              href="/core"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              New Analysis
            </Link>
          </div>
        </div>
      </div>

      {/* Analyses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* DSCR Analysis Card */}
        <AnalysisCard
          title="DSCR Analysis"
          description="Debt Service Coverage Ratio"
          count={analysesByType['dscr']?.length || 0}
          href={`/app/deals/${dealId}/dscr`}
          icon="📊"
          color="emerald"
        />

        {/* Business Loan Card */}
        <AnalysisCard
          title="Business Loan"
          description="Loan payment calculator"
          count={analysesByType['business-loan']?.length || 0}
          href={`/app/deals/${dealId}/business-loan`}
          icon="💰"
          color="blue"
        />

        {/* Acquisition Analysis Card */}
        <AnalysisCard
          title="Acquisition Analysis"
          description="ROI & equity tracking"
          count={analysesByType['acquisition']?.length || 0}
          href={`/app/deals/${dealId}/acquisition`}
          icon="🎯"
          color="purple"
        />

        {/* Valuation Card */}
        <AnalysisCard
          title="Valuation"
          description="Business value assessment"
          count={analysesByType['valuation']?.length || 0}
          href={`/app/deals/${dealId}/valuation`}
          icon="💎"
          color="yellow"
          comingSoon
        />

        {/* CRE Acquisition Analyzer Card */}
        <AnalysisCard
          title="CRE Acquisition"
          description="Real estate deal analysis"
          count={analysesByType['cre-acquisition']?.length || 0}
          href={`/app/deals/${dealId}/cre-acquisition`}
          icon="🏢"
          color="indigo"
          comingSoon
        />

        {/* CRE Loan Sizer Card */}
        <AnalysisCard
          title="CRE Loan Sizer"
          description="Commercial loan capacity"
          count={analysesByType['cre-loan']?.length || 0}
          href={`/app/deals/${dealId}/cre-loan`}
          icon="🏗️"
          color="cyan"
          comingSoon
        />
      </div>

      {/* Recent Activity */}
      {deal.analyses.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {deal.analyses.slice(0, 5).map((analysis) => (
              <div key={analysis.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">
                    {analysis.type.toUpperCase().replace('-', ' ')} Analysis
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(analysis.createdAt)}
                  </p>
                </div>
                <Link
                  href={`/app/deals/${dealId}/${analysis.type}`}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {deal.analyses.length === 0 && (
        <div className="bg-white border rounded-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analyses Yet</h3>
          <p className="text-gray-600 mb-6">
            Start analyzing this deal with our suite of calculators.
          </p>
          <Link
            href="/core"
            className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition"
          >
            Run Your First Analysis →
          </Link>
        </div>
      )}
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
}: {
  title: string;
  description: string;
  count: number;
  href: string;
  icon: string;
  color: string;
  comingSoon?: boolean;
}) {
  const colorClasses = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-700',
  };

  const Content = (
    <>
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      {count > 0 && (
        <p className="text-sm font-medium text-gray-700">
          {count} {count === 1 ? 'analysis' : 'analyses'}
        </p>
      )}
      {comingSoon && (
        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded mt-2">
          Coming Soon
        </span>
      )}
    </>
  );

  if (comingSoon) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 opacity-60 cursor-not-allowed">
        {Content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`block border-2 rounded-lg p-6 transition hover:shadow-lg ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      {Content}
    </Link>
  );
}
