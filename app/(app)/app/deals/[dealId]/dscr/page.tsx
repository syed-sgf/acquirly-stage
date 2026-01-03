export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

function dscrMeta(dscr: number) {
  if (dscr >= 1.25) {
    return {
      label: 'STRONG',
      color: 'text-green-700',
      bg: 'bg-green-50 border-green-300',
      message: 'Meets or exceeds most lender DSCR requirements',
    };
  }
  if (dscr >= 1.15) {
    return {
      label: 'MARGINAL',
      color: 'text-yellow-700',
      bg: 'bg-yellow-50 border-yellow-300',
      message: 'May qualify with compensating factors',
    };
  }
  return {
    label: 'WEAK',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-300',
    message: 'Below typical lender minimums',
  };
}

export default async function DscrPage({
  params,
}: {
  params: { dealId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/');

  const deal = await prisma.deal.findFirst({
    where: { id: params.dealId, userId: session.user.id },
  });

  if (!deal) redirect('/app');

  const dealId = deal.id;

  async function runDscr(formData: FormData) {
    'use server';

    const grossRevenue = Number(formData.get('grossRevenue'));
    const operatingExpenses = Number(formData.get('operatingExpenses'));
    const annualDebtService = Number(formData.get('annualDebtService'));

    if (!grossRevenue || !annualDebtService) {
      throw new Error('Missing inputs');
    }

    const noi = grossRevenue - operatingExpenses;
    const dscr = Number((noi / annualDebtService).toFixed(2));

    await prisma.analysis.create({
      data: {
        type: 'dscr',
        dealId,
        inputs: {
          grossRevenue,
          operatingExpenses,
          annualDebtService,
          noi,
        },
        outputs: {
          dscr,
        },
      },
    });

    redirect(`/app/deals/${dealId}?dscr=${dscr}`);
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">DSCR Analysis</h1>
        <p className="text-gray-600 mt-1">
          Lender-style cash flow and debt service coverage analysis
        </p>
      </div>

      {/* SECTION 1 — BUSINESS CASH FLOW */}
      <div className="border rounded-xl p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          1️⃣ Business Cash Flow
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">
              Gross Annual Revenue
            </label>
            <input
              name="grossRevenue"
              type="number"
              form="dscr-form"
              placeholder="e.g. 500000"
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Operating Expenses (Annual)
            </label>
            <input
              name="operatingExpenses"
              type="number"
              form="dscr-form"
              placeholder="e.g. 320000"
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-3">
          Excludes debt service, depreciation, and owner distributions
        </p>
      </div>

      {/* SECTION 2 — DEBT ASSUMPTIONS */}
      <div className="border rounded-xl p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          2️⃣ Debt Assumptions
        </h2>

        <div className="max-w-md">
          <label className="block font-medium mb-1">
            Annual Debt Service
          </label>
          <input
            name="annualDebtService"
            type="number"
            form="dscr-form"
            placeholder="e.g. 150000"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <p className="text-sm text-gray-500 mt-3">
          Principal + interest payments for all loans
        </p>
      </div>

      {/* ACTION */}
      <form id="dscr-form" action={runDscr}>
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Calculate DSCR
          </button>

          <a
            href={`/app/deals/${dealId}`}
            className="px-6 py-3 border rounded-lg"
          >
            Back to Deal
          </a>
        </div>
      </form>

      {/* SECTION 3 — RESULT (Shown after submit via redirect param later) */}
      <div className="border rounded-xl p-6 bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">
          3️⃣ DSCR Result
        </h2>
        <p className="text-gray-600">
          Result will appear here after calculation and is saved to the deal.
        </p>
      </div>

      {/* LENDER BENCHMARKS */}
      <div className="border rounded-xl p-6 bg-slate-50">
        <h3 className="font-semibold mb-2">Typical Lender Benchmarks</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• ≥ 1.25x — Strong / Preferred</li>
          <li>• 1.15x – 1.24x — Marginal</li>
          <li>• &lt; 1.15x — Weak</li>
        </ul>
      </div>
    </div>
  );
}
