export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-1">
        Welcome back, {session.user.name || "there"} 👋
      </h1>
      <p className="text-gray-600 mb-8">
        {dealCount > 0
          ? `You have ${dealCount} deal${dealCount > 1 ? "s" : ""} ready for analysis`
          : "Start your first deal to begin analyzing opportunities"}
      </p>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-lg border p-6">
          <p className="text-sm text-gray-500">Total Deals</p>
          <p className="text-3xl font-bold">{dealCount}</p>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <p className="text-sm text-gray-500">Analyses</p>
          <p className="text-3xl font-bold">{analysisCount}</p>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <p className="text-sm text-gray-500">Plan</p>
          <p className="text-3xl font-bold uppercase">
            {session.user.plan || "FREE"}
          </p>
          <Link
            href="/pricing"
            className="text-sm text-green-600 hover:underline mt-1 inline-block"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {primaryDeal ? (
          <Link
            href={`/app/deals/${primaryDeal.id}`}
            className="block bg-green-600 text-white rounded-lg p-6 hover:bg-green-700 transition"
          >
            <h2 className="text-xl font-semibold mb-1">
              Continue Your Deal
            </h2>
            <p className="opacity-90">{primaryDeal.name}</p>
          </Link>
        ) : (
          <Link
            href="/app/deals/new"
            className="block bg-green-600 text-white rounded-lg p-6 hover:bg-green-700 transition"
          >
            <h2 className="text-xl font-semibold mb-1">
              Create Your First Deal
            </h2>
            <p className="opacity-90">
              Start analyzing a business acquisition
            </p>
          </Link>
        )}

        {dealCount > 0 && (
          <Link
            href="/app/deals/new"
            className="block bg-white border rounded-lg p-6 hover:border-green-600 transition"
          >
            <h2 className="text-xl font-semibold mb-1">
              Create New Deal
            </h2>
            <p className="text-gray-600">
              Add another opportunity to your portfolio
            </p>
          </Link>
        )}
      </div>

      {/* Recent Deals */}
      {recentDeals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Deals</h2>
          <div className="bg-white border rounded-lg divide-y">
            {recentDeals.map((deal) => (
              <Link
                key={deal.id}
                href={`/app/deals/${deal.id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{deal.name}</p>
                    <p className="text-sm text-gray-500">
                      Updated {deal.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-green-600 font-medium">
                    Open →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
