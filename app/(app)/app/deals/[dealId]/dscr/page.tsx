export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export default async function DscrPage({
  params,
}: {
  params: { dealId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/');
  }

  // Verify deal ownership
  const deal = await prisma.deal.findFirst({
    where: {
      id: params.dealId,
      userId: session.user.id,
    },
  });

  if (!deal) {
    redirect('/app');
  }

  // Type-safe: deal is guaranteed beyond this point
  const dealId = deal.id;

  async function createDscrAnalysis(formData: FormData) {
    'use server';

    const noi = Number(formData.get('noi'));
    const debtService = Number(formData.get('debtService'));

    if (!noi || !debtService || debtService === 0) {
      throw new Error('Invalid DSCR inputs');
    }

    const dscr = Number((noi / debtService).toFixed(2));

    await prisma.analysis.create({
      data: {
        type: 'dscr',
        dealId: dealId,
        inputs: {
          noi,
          debtService,
        },
        outputs: {
          dscr,
        },
      },
    });

    redirect(`/app/deals/${dealId}`);
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">DSCR Calculator</h1>

      <form action={createDscrAnalysis} className="space-y-6">
        <div>
          <label className="block font-medium mb-1">
            Net Operating Income (Annual)
          </label>
          <input
            name="noi"
            type="number"
            step="any"
            required
            className="w-full border rounded px-3 py-2"
          />
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
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
          >
            Calculate DSCR
          </button>

          <a
            href={`/app/deals/${dealId}`}
            className="px-5 py-2 border rounded"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
