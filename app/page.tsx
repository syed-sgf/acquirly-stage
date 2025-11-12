import Link from "next/link";

export default function Home(){
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
          <Link
            href="/pro"
            className="rounded-xl bg-white px-5 py-3 text-brand-slate-900 ring-1 ring-brand-slate-900 font-medium hover:bg-slate-50"
          >
            Upgrade to Pro
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
            <h3 className="text-lg font-semibold text-brand-slate-900">SBA-friendly analysis</h3>
            <p className="mt-2 text-sm text-brand-slate-600">DSCR, amortization, sources & uses, and lender-ready summaries.</p>
          </div>
          <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
            <h3 className="text-lg font-semibold text-brand-slate-900">Pro deal model</h3>
            <p className="mt-2 text-sm text-brand-slate-600">Assumptions, financing, and returns (ROI, NPV, Payback) in minutes.</p>
          </div>
          <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
            <h3 className="text-lg font-semibold text-brand-slate-900">Built for buyers & brokers</h3>
            <p className="mt-2 text-sm text-brand-slate-600">Fast, clear, and consistent—so decisions move forward, not sideways.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
