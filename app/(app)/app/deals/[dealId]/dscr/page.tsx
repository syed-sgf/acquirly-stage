export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

function fmtMoney(n: number) {
  if (!Number.isFinite(n)) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function classifyDSCR(dscr: number) {
  if (dscr >= 1.25) {
    return {
      tier: 'Bankable',
      range: '≥ 1.25',
      verdict: 'Meets lender requirements',
      card: 'border-emerald-300 bg-emerald-50',
      text: 'text-emerald-800',
    };
  }
  if (dscr >= 1.16) {
    return {
      tier: 'Marginal',
      range: '1.16 – 1.24',
      verdict: 'May need restructuring',
      card: 'border-amber-300 bg-amber-50',
      text: 'text-amber-800',
    };
  }
  return {
    tier: 'High Risk',
    range: '≤ 1.15',
    verdict: 'Likely loan decline',
    card: 'border-rose-300 bg-rose-50',
    text: 'text-rose-800',
  };
}

function Tooltip({ children }: { children: React.ReactNode }) {
  return (
    <details className="inline-block relative">
      <summary className="list-none inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs cursor-pointer">
        ?
      </summary>
      <div className="absolute z-10 mt-2 w-72 rounded-lg border border-emerald-200 bg-white p-3 shadow-sm text-sm text-gray-700">
        {children}
      </div>
    </details>
  );
}

export default async function DscrPage({ params }: { params: { dealId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/');

  const deal = await prisma.deal.findFirst({
    where: { id: params.dealId, userId: session.user.id },
  });
  if (!deal) redirect('/app');

  const dealId = deal.id;

  const latest = await prisma.analysis.findFirst({
    where: { dealId, type: 'dscr' },
    orderBy: { createdAt: 'desc' },
  });

  const inputs = latest?.inputs as any;
  const outputs = latest?.outputs as any;
  const dscr = typeof outputs?.dscr === 'number' ? outputs.dscr : null;
  const tier = dscr !== null ? classifyDSCR(dscr) : null;

  async function runDscr(formData: FormData) {
    'use server';

    const grossRevenue = Number(formData.get('grossRevenue'));
    const operatingExpenses = Number(formData.get('operatingExpenses'));
    const loanAmount = Number(formData.get('loanAmount'));
    const interestRate = Number(formData.get('interestRate'));
    const loanTermYears = Number(formData.get('loanTermYears'));

    const cashFlow = grossRevenue - operatingExpenses;

    const r = interestRate / 100 / 12;
    const n = loanTermYears * 12;
    const monthlyPayment =
      r === 0 ? loanAmount / n : (loanAmount * r) / (1 - Math.pow(1 + r, -n));
    const annualDebtService = monthlyPayment * 12;
    const dscr = Number((cashFlow / annualDebtService).toFixed(2));

    await prisma.analysis.create({
      data: {
        type: 'dscr',
        dealId,
        inputs: {
          grossRevenue,
          operatingExpenses,
          cashFlow,
          loanAmount,
          interestRate,
          loanTermYears,
          monthlyPayment,
          annualDebtService,
        },
        outputs: { dscr },
      },
    });

    redirect(`/app/deals/${dealId}/dscr`);
  }

  return (
    <div className="min-h-screen bg-emerald-50/60">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        <h1 className="text-3xl font-bold">DSCR Calculator</h1>

        {/* FORM */}
        <form action={runDscr} className="space-y-8">
          {/* 1) BUSINESS CASH FLOW */}
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 hover:border-emerald-400 transition">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">1) Business Cash Flow</h2>
              <Tooltip>
                Cash available to service debt before loan payments.
              </Tooltip>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <input name="grossRevenue" placeholder="Gross Annual Revenue" required className="border rounded px-3 py-2" />
              <input name="operatingExpenses" placeholder="Operating Expenses" className="border rounded px-3 py-2" />
              <div className="border rounded px-3 py-2 bg-emerald-50 text-gray-700">
                Net Profit calculated after submit
              </div>
            </div>
          </div>

          {/* 2) DEBT ASSUMPTIONS */}
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 hover:border-emerald-400 transition">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">2) Debt Assumptions</h2>
              <Tooltip>
                Loan terms used to calculate annual debt service.
              </Tooltip>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <input name="loanAmount" placeholder="Loan Amount" required className="border rounded px-3 py-2" />
              <input name="interestRate" placeholder="Interest Rate %" required className="border rounded px-3 py-2" />
              <input name="loanTermYears" placeholder="Loan Term (Years)" required className="border rounded px-3 py-2" />
            </div>
          </div>

          <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg">
            Calculate DSCR
          </button>
        </form>

        {/* 3) DSCR RESULT */}
        <div className="rounded-2xl border border-emerald-200 bg-white p-6">
          <h2 className="text-xl font-semibold mb-2">3) DSCR Result</h2>

          {dscr !== null && tier ? (
            <div className={`rounded-xl border p-4 ${tier.card}`}>
              <div className={`font-bold ${tier.text}`}>{tier.tier}</div>
              <div>DSCR: {dscr}x</div>
              <div className="text-sm mt-1">{tier.verdict}</div>
            </div>
          ) : (
            <p className="text-gray-600">
              No calculation yet. Complete sections 1 and 2 above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
