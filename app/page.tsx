import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-bg">
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-10 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-brand-slate-900">
          Unlock the Power of Smart Acquisitions
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-brand-slate-600">
          Acquirely by Starting Gate Financial provides the tools and insights you need to make informed decisions and
          accelerate your acquisition process. Start your journey today.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/core"
            className="rounded-xl bg-brand-green-600 px-5 py-3 text-white font-medium shadow-soft hover:brightness-95"
          >
            Start Free with Core
          </Link>

          {/* Fixed: add visible text for Pro CTA */}
          <Link
            href="/pro"
            className="rounded-xl border border-brand-green-600 px-5 py-3 text-brand-green-700 font-medium shadow-soft hover:bg-brand-green-50"
          >
            Explore Pro
          </Link>

          {/* New: quick link to the sample deal page */}
          <Link
            href="/deals/demo"
            className="rounded-xl border px-5 py-3 font-medium hover:bg-gray-50"
          >
            Try Sample Deal →
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
            <h3 className="text-lg font-semibold text-brand-slate-900">SBA-friendly analysis</h3>
            <p className="mt-2 text-sm text-brand-slate-600">DSCR, amortization, sources &amp; uses, and lender-ready summaries.</p>
          </div>
          <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
            <h3 className="text-lg font-semibold text-brand-slate-900">Pro deal model</h3>
            <p className="mt-2 text-sm text-brand-slate-600">Assumptions, financing, and returns (ROI, NPV, Payback) in minutes.</p>
          </div>
          <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
            <h3 className="text-lg font-semibold text-brand-slate-900">Built for buyers &amp; brokers</h3>
            <p className="mt-2 text-sm text-brand-slate-600">Fast, clear, and consistent—so decisions move forward, not sideways.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

