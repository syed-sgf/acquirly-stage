export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

function getDscrStatus(dscr: number) {
  if (dscr >= 1.25) {
    return {
      label: 'Strong',
      color: 'text-green-700',
      bg: 'bg-green-50 border-green-200',
      note: 'Meets or exceeds most lender DSCR requirements',
    };
  }

  if (dscr >= 1.15) {
    return {
      label: 'Marginal',
      color: 'text-yellow-700',
      bg: 'bg-yellow-50 border-yellow-200',
      note: 'May qualify with compensating factors',
    };
  }

  return {
    label: 'Weak',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    note: 'Below typical lender minimums',
    };
}

export default async function DscrPage({
  params,
}: {
  params: { dealId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/');
  }

  const deal = await prisma.deal.findFirst({
    where: {
      id: params.dealId,
      userId: session.user.id,
    },
  });

  if (!deal) {
    redirect('/app');
  }

  const dealId = deal.id;

  async function createDscrAnalysis(formData: FormData) {
    'use server';

    const noi = Number(formData.get('noi'));
    const debtService = Number(formData.get('debtService'));

    if (!noi || !debtService || debtService <= 0) {
      throw new Error('Invalid DSCR inputs');
    }

    const dscr = Number((noi / debtService).toFixed(2));

    await prisma.analysis.create({
      data: {
        type: 'dscr',
        dealId,
        inputs: { noi, debtService },
        outputs: { dscr },
      },
    });

    redirect(`/app/deals/${dealId}?dscr=${dscr}`);
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">DSCR Calculator</h1>
        <p className="text-gray-600 mt-1">
          Measure whether this deal’s cash flow supports the proposed debt.
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Commonly used by SBA, DSCR, and bank lenders
        </p>
      </div>

      {/* Calculator */}
      <form action={createDscrAnalysis} className="space-y-6 border rounded-lg p-6">
        <div>
          <label className="block font-medium mb-1">
            Net Operating Income (Annual)
          </label>
          <input
            name="noi"
            type="number"
            step="any"
            required
            placeholder="e.g. 120000"
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            NOI after operating expenses, before debt service
          </p>
        </div>

        <div>
          <label className="block font-medium mb-1">
            Annual Debt Service
          </label>
          <input
            name="debtService"
            type="number"
            step="any"
            required
            placeholder="e.g. 90000"
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Total annual principal + interest payments
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Calculate DSCR
          </button>

          <a
            href={`/app/deals/${dealId}`}
            className="px-6 py-2 border rounded"
          >
            Cancel
          </a>
        </div>
      </form>

      {/* Lender Guidance */}
      <div className="border rounded-lg p-6 bg-gray-50">
        <h3 className="font-semibold mb-3">Typical Lender Guidelines</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• ≥ 1.25x — Strong / Preferred</li>
          <li>• 1.15x–1.24x — Marginal (compensating factors needed)</li>
          <li>• &lt; 1.15x — Weak / Likely decline</li>
        </ul>
      </div>

      {/* Roadmap Signals */}
      <div className="flex gap-3">
        <button
          disabled
          className="opacity-50 cursor-not-allowed border px-4 py-2 rounded"
        >
          Export PDF (Coming Soon)
        </button>
        <button
          disabled
          className="opacity-50 cursor-not-allowed border px-4 py-2 rounded"
        >
          Compare Scenarios (Coming Soon)
        </button>
      </div>
    </div>
  );
}
