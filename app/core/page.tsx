"use client";
import DSCRCard from "@/components/DSCRCard";
export default function Core(){
  const dscrValue:number|null=1.18;
  return (<main className="mx-auto max-w-6xl px-6 py-10">
    <h1 className="text-3xl font-bold">Core Calculator</h1>
    <p className="mt-2 text-brand.slate-600 text-sm">Quick view of DSCR and basic deal metrics. (Demo values)</p>
    <div className="mt-6 grid gap-4 md:grid-cols-2"><DSCRCard value={dscrValue}/>
      <div className="rounded-2xl border bg-white p-5"><h2 className="text-xl font-semibold">What’s next?</h2>
        <p className="mt-2 text-sm text-brand.slate-600">Upgrade to Pro to access Sources & Uses, Loan Amortization, and the full Lender Analysis.</p>
      </div>
    </div>
  </main>);
}
