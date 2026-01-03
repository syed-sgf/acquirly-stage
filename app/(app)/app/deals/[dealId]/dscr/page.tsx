export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

function fmtMoney(n: number) {
  if (!Number.isFinite(n)) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function fmtNum(n: number, digits = 2) {
  if (!Number.isFinite(n)) return '-';
  return n.toFixed(digits);
}

function classifyDSCR(dscr: number) {
  // User-specified thresholds:
  // High Risk: ≤ 1.15
  // Marginal: 1.16 – 1.24
  // Bankable: ≥ 1.25
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

function Tooltip({ title, children }: { title: string; children: React.ReactNode }) {
  // No-JS “popover”: click to open, click again to close
  return (
    <details className="inline-block relative">
      <summary
        className="list-none inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs cursor-pointer select-none"
        aria-label={title}
        title={title}
      >
        ?
      </summary>
      <div className="absolute z-10 mt-2 w-72 rounded-lg border border-emerald-200 bg-white p-3 shadow-sm text-sm text-gray-700">
        <div className="font-semibold text-gray-900 mb-1">What this means</div>
        <div>{children}</div>
      </div>
    </details>
  );
}

export default async function DscrPage({
  params,
}: {
  params: { dealId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/');

  // Confirm deal ownership
  const deal = await prisma.deal.findFirst({
    where: { id: params.dealId, userId: session.user.id },
  });
  if (!deal) redirect('/app');

  const dealId = deal.id;

  // Pull latest DSCR analysis for display (this fixes “no calculation shown” UX)
  const latest = await prisma.analysis.findFirst({
    where: { dealId, type: 'dscr' },
    orderBy: { createdAt: 'desc' },
  });

  const latestInputs = (latest?.inputs ?? null) as any;
  const latestOutputs = (latest?.outputs ?? null) as any;

  const latestDscr = typeof latestOutputs?.dscr === 'number' ? latestOutputs.dscr : null;
  const latestTier = latestDscr !== null ? classifyDSCR(latestDscr) : null;

  async function runDscr(formData: FormData) {
    'use server';

    const grossRevenue = Number(formData.get('grossRevenue'));
    const operatingExpenses = Number(formData.get('operatingExpenses'));

    const loanAmount = Number(formData.get('loanAmount'));
    const interestRate = Number(formData.get('interestRate')); // annual %
    const loanTermYears = Number(formData.get('loanTermYears'));

    // Basic validation
    if (!Number.isFinite(grossRevenue) || grossRevenue <= 0) throw new Error('Gross revenue is required');
    if (!Number.isFinite(operatingExpenses) || operatingExpenses < 0) throw new Error('Operating expenses must be 0 or greater');
    if (!Number.isFinite(loanAmount) || loanAmount <= 0) throw new Error('Loan amount is required');
    if (!Number.isFinite(interestRate) || interestRate <= 0) throw new Error('Interest rate is required');
    if (!Number.isFinite(loanTermYears) || loanTermYears <= 0) throw new Error('Loan term is required');

    const cashFlow = grossRevenue - operatingExpenses;

    // Amortized payment
    const r = interestRate / 100 / 12;           // monthly rate
    const n = Math.round(loanTermYears * 12);    // months

    // Monthly payment formula:
    // PMT = P * r / (1 - (1+r)^-n)
    const monthlyPayment =
      r === 0 ? loanAmount / n : (loanAmount * r) / (1 - Math.pow(1 + r, -n));

    const annualDebtService = monthlyPayment * 12;

    // DSCR
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
        outputs: {
          dscr,
        },
      },
    });

    // Redirect back to same page so the latest analysis renders (and persists)
    redirect(`/app/deals/${dealId}/dscr`);
  }

  return (
    <div className="min-h-screen bg-emerald-50/60">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="text-sm text-gray-600">
            Deal: <span className="font-medium text-gray-900">{deal.name}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">DSCR Calculator</h1>
          <p className="text-gray-600">
            Underwrite cash flow against modeled debt payments to determine bankability.
          </p>
        </div>

        {/* DSCR Result (shows latest saved calculation) */}
        <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">3) DSCR Result</h2>
              <p className="text-sm text-gray-600 mt-1">
                Saved results appear here after you calculate.
              </p>
            </div>

            {latestDscr !== null && latestTier && (
              <div className={`rounded-xl border px-4 py-3 ${latestTier.card}`}>
                <div className={`text-sm font-semibold ${latestTier.text}`}>
                  {latestTier.tier}
                </div>
                <div className="text-xs text-gray-700">{latestTier.range}</div>
                <div className="text-xs text-gray-700 mt-1">{latestTier.verdict}</div>
              </div>
            )}
          </div>

          {latestDscr !== null ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                <div className="text-xs text-gray-600">DSCR</div>
                <div className="text-3xl font-bold text-gray-900">{fmtNum(latestDscr)}x</div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-white p-4">
                <div className="text-xs text-gray-600">Cash Flow (Net Profit)</div>
                <div className="text-lg font-semibold text-gray-900">
                  {fmtMoney(Number(latestInputs?.cashFlow))}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-white p-4">
                <div className="text-xs text-gray-600">Annual Debt Service</div>
                <div className="text-lg font-semibold text-gray-900">
                  {fmtMoney(Number(latestInputs?.annualDebtService))}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-white p-4">
                <div className="text-xs text-gray-600">Monthly Payment</div>
                <div className="text-lg font-semibold text-gray-900">
                  {fmtMoney(Number(latestInputs?.monthlyPayment))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 text-sm text-gray-600">
              No DSCR analysis saved yet. Complete sections 1 and 2 below, then click Calculate DSCR.
            </div>
          )}

          {/* Benchmarks table */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <div className="font-semibold text-rose-800">High Risk</div>
              <div className="text-sm text-rose-800">≤ 1.15</div>
              <div className="text-sm text-gray-700 mt-1">Likely loan decline</div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="font-semibold text-amber-800">Marginal</div>
              <div className="text-sm text-amber-800">1.16 – 1.24</div>
              <div className="text-sm text-gray-700 mt-1">May need restructuring</div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="font-semibold text-emerald-800">Bankable</div>
              <div className="text-sm text-emerald-800">≥ 1.25</div>
              <div className="text-sm text-gray-700 mt-1">Meets lender requirements</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form action={runDscr} className="space-y-6">
          {/* Section 1 */}
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm hover:border-emerald-400 hover:shadow-md transition">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">1) Business Cash Flow</h2>
              <Tooltip title="Business Cash Flow">
                This section estimates net profit available to service debt. Cash Flow (Net Profit) is calculated as Gross Annual Revenue minus Operating Expenses.
              </Tooltip>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block font-medium text-gray-900 mb-1">
                  Gross Annual Revenue <span className="text-rose-600">*</span>
                </label>
                <input
                  name="grossRevenue"
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 500000"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <div className="mt-2 text-xs text-gray-500">
                  Total annual sales / revenue before expenses.
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-900 mb-1">
                  Operating Expenses (Annual)
                </label>
                <input
                  name="operatingExpenses"
                  type="number"
                  step="any"
                  defaultValue="0"
                  placeholder="e.g. 320000"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <div className="mt-2 text-xs text-gray-500">
                  Rent, payroll, COGS, utilities, insurance, etc.
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-900 mb-1">
                  Cash Flow (Net Profit)
                </label>
                <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-gray-900">
                  Auto-calculated after you submit
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Gross Revenue − Operating Expenses.
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm hover:border-emerald-400 hover:shadow-md transition">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">2) Debt Assumptions</h2>
              <Tooltip title="Debt Assumptions">
                This section models your monthly payment and annual debt service using standard amortization based on Loan Amount, Interest Rate, and Term.
              </Tooltip>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block font-medium text-gray-900 mb-1">
                  Loan Amount <span className="text-rose-600">*</span>
                </label>
                <input
                  name="loanAmount"
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 400000"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <div className="mt-2 text-xs text-gray-500">
                  Proposed principal borrowed.
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-900 mb-1">
                  Interest Rate (Annual %) <span className="text-rose-600">*</span>
                </label>
                <input
                  name="interestRate"
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 10.5"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <div className="mt-2 text-xs text-gray-500">
                  Nominal APR used for amortization.
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-900 mb-1">
                  Loan Term (Years) <span className="text-rose-600">*</span>
                </label>
                <input
                  name="loanTermYears"
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 10"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <div className="mt-2 text-xs text-gray-500">
                  Amortization term in years.
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              We will calculate: <span className="font-medium">Monthly Payment</span> and <span className="font-medium">Annual Debt Service</span> after submission.
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-6 py-3 text-white font-semibold hover:bg-emerald-700 transition"
            >
              Calculate DSCR
            </button>

            <a
              href={`/app/deals/${dealId}`}
              className="rounded-lg border border-emerald-200 bg-white px-6 py-3 hover:border-emerald-400 transition"
            >
              Back to Deal
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
