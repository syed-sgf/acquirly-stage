export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

function fmtMoney(n: number) {
  if (!Number.isFinite(n)) return '-';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtPercent(n: number) {
  if (!Number.isFinite(n)) return '-';
  return n.toFixed(2) + '%';
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
    <details className="inline-block relative group">
      <summary className="list-none inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs cursor-pointer hover:bg-emerald-200 transition">
        ?
      </summary>
      <div className="absolute z-10 mt-2 w-72 rounded-lg border border-emerald-200 bg-white p-3 shadow-lg text-sm text-gray-700 hidden group-open:block">
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

  const inputs = latest?.inputs as any || {};
  const outputs = latest?.outputs as any || {};
  const dscr = typeof outputs?.dscr === 'number' ? outputs.dscr : null;
  const tier = dscr !== null ? classifyDSCR(dscr) : null;

  // Pre-calculate values for display
  const cashFlow = inputs.cashFlow || 0;
  const monthlyPayment = inputs.monthlyPayment || 0;
  const annualDebtService = inputs.annualDebtService || 0;

  async function runDscr(formData: FormData) {
    'use server';

    const grossRevenue = Number(formData.get('grossRevenue')) || 0;
    const operatingExpenses = Number(formData.get('operatingExpenses')) || 0;
    const loanAmount = Number(formData.get('loanAmount')) || 0;
    const interestRate = Number(formData.get('interestRate')) || 0;
    const loanTermYears = Number(formData.get('loanTermYears')) || 0;

    // Validation
    if (grossRevenue <= 0 || loanAmount <= 0 || interestRate <= 0 || loanTermYears <= 0) {
      throw new Error('All fields must have positive values');
    }

    const cashFlow = grossRevenue - operatingExpenses;

    if (cashFlow <= 0) {
      throw new Error('Cash flow must be positive (revenue must exceed expenses)');
    }

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/app" className="hover:text-emerald-600 transition">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/app/deals" className="hover:text-emerald-600 transition">
            Deals
          </Link>
          <span>/</span>
          <Link href={`/app/deals/${dealId}`} className="hover:text-emerald-600 transition">
            {deal.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">DSCR Calculator</span>
        </nav>

        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href={`/app/deals/${dealId}`}
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition group"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">DSCR Calculator</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">Debt Service Coverage Ratio Analysis</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link 
              href={`/app/deals/${dealId}`}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition text-sm font-medium"
            >
              View Deal Overview
            </Link>
          </div>
        </div>

        {/* FORM */}
        <form action={runDscr} className="space-y-6 md:space-y-8">
          {/* 1) BUSINESS CASH FLOW */}
          <div className="rounded-2xl border-2 border-emerald-200 bg-white p-4 md:p-6 hover:border-emerald-400 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">1) Business Cash Flow</h2>
              <Tooltip>
                <strong>Net Operating Income (NOI)</strong> is the cash available to service debt before loan payments.
                <br /><br />
                Formula: Gross Revenue - Operating Expenses = Cash Flow
              </Tooltip>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gross Annual Revenue
                </label>
                <input 
                  name="grossRevenue" 
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={inputs.grossRevenue || ''}
                  placeholder="$500,000" 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operating Expenses
                </label>
                <input 
                  name="operatingExpenses" 
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={inputs.operatingExpenses || ''}
                  placeholder="$350,000" 
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Net Cash Flow
                </label>
                <div className="border border-emerald-300 rounded-lg px-3 py-2 bg-emerald-50 text-gray-900 font-semibold flex items-center justify-between">
                  {cashFlow > 0 ? fmtMoney(cashFlow) : 'Calculated on submit'}
                  {cashFlow > 0 && (
                    <span className="text-xs text-emerald-700">
                      {fmtPercent((cashFlow / inputs.grossRevenue) * 100)} margin
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2) DEBT ASSUMPTIONS */}
          <div className="rounded-2xl border-2 border-emerald-200 bg-white p-4 md:p-6 hover:border-emerald-400 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">2) Debt Assumptions</h2>
              <Tooltip>
                <strong>Loan terms</strong> used to calculate annual debt service.
                <br /><br />
                Monthly payment is calculated using standard amortization formula, then multiplied by 12 for annual debt service.
              </Tooltip>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Amount
                </label>
                <input 
                  name="loanAmount" 
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={inputs.loanAmount || ''}
                  placeholder="$400,000" 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (%)
                </label>
                <input 
                  name="interestRate" 
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue={inputs.interestRate || ''}
                  placeholder="7.5" 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Term (Years)
                </label>
                <input 
                  name="loanTermYears" 
                  type="number"
                  step="1"
                  min="1"
                  max="30"
                  defaultValue={inputs.loanTermYears || ''}
                  placeholder="10" 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
                />
              </div>
            </div>

            {/* Show calculated debt service if we have previous data */}
            {annualDebtService > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Monthly Payment:</span>
                    <span className="ml-2 font-semibold">{fmtMoney(monthlyPayment)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Annual Debt Service:</span>
                    <span className="ml-2 font-semibold">{fmtMoney(annualDebtService)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit"
            className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            Calculate DSCR
          </button>
        </form>

        {/* 3) DSCR RESULT */}
        <div className="rounded-2xl border-2 border-emerald-200 bg-white p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">3) DSCR Result</h2>
            <Tooltip>
              <strong>DSCR = Net Operating Income ÷ Annual Debt Service</strong>
              <br /><br />
              • ≥1.25: Bankable (meets most lender requirements)
              <br />
              • 1.16-1.24: Marginal (may need restructuring)
              <br />
              • ≤1.15: High risk (likely decline)
            </Tooltip>
          </div>

          {dscr !== null && tier ? (
            <div className="space-y-4">
              {/* Main DSCR Card */}
              <div className={`rounded-xl border-2 p-6 ${tier.card}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`text-2xl font-bold ${tier.text}`}>{tier.tier}</div>
                  <div className={`text-3xl font-bold ${tier.text}`}>{dscr}x</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={tier.text}>Range: {tier.range}</span>
                  <span className={tier.text}>{tier.verdict}</span>
                </div>
              </div>

              {/* Calculation Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-gray-600 mb-1">Net Cash Flow</div>
                  <div className="text-xl font-bold text-gray-900">{fmtMoney(cashFlow)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-gray-600 mb-1">Annual Debt Service</div>
                  <div className="text-xl font-bold text-gray-900">{fmtMoney(annualDebtService)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-gray-600 mb-1">Excess Cash Flow</div>
                  <div className={`text-xl font-bold ${cashFlow - annualDebtService > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {fmtMoney(cashFlow - annualDebtService)}
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              {latest?.createdAt && (
                <div className="text-xs text-gray-500 text-right">
                  Last calculated: {new Date(latest.createdAt).toLocaleString()}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 font-medium">No calculation yet</p>
              <p className="text-gray-500 text-sm mt-1">Complete sections 1 and 2 above to calculate DSCR</p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Need Financing for This Deal?
              </h3>
              <p className="text-sm text-gray-600">
                Let Starting Gate Financial help structure the optimal loan for your business acquisition.
              </p>
            </div>
            <a 
              href="https://startinggatefinancial.com/apply"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-[#D4AF37] to-[#C4A137] hover:from-[#C4A137] hover:to-[#B49127] text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
            >
              Apply Now
            </a>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Link 
            href={`/app/deals/${dealId}`}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Deal Overview
          </Link>
          <div className="text-xs text-gray-500">
            Deal ID: <span className="font-mono">{dealId.substring(0, 12)}...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
