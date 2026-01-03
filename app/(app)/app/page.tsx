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

  // Dashboard metrics
  const [dealCount, analysisCount, firstDeal] = await Promise.all([
    prisma.deal.count({
      where: { userId },
    }),
    prisma.analysis.count({
      where: {
        deal: { userId },
      },
    }),
    prisma.deal.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2">
        Welcome, {session.user.name || "there"}!
      </h1>
      <p className="text-gray-600 mb-8">
        Manage your deals and analyze acquisitions
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
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {firstDeal && (
          <Link
            href={`/app/deals/${firstDeal.id}`}
            className="block bg-green-600 text-white rounded-lg p-6 hover:bg-green-700 transition"
          >
            <h2 className="text-xl font-semibold mb-1">
              Continue Your Deal
            </h2>
            <p className="opacity-90">{firstDeal.name}</p>
          </Link>
        )}

        <Link
          href="/app/deals/new"
          className="block bg-white border rounded-lg p-6 hover:border-green-600 transition"
        >
          <h2 className="text-xl font-semibold mb-1">
            Create New Deal
          </h2>
          <p className="text-gray-600">
            Start a new business acquisition analysis
          </p>
        </Link>
      </div>
    </div>
  );
}
