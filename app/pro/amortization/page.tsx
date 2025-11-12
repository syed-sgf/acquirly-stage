"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { pmtMonthly } from "@/lib/pro-logic";
import { fmtUSD } from "@/lib/num";
export default function Amortization(){
  const [amount,setAmount]=useState("1300000");
  const [apr,setApr]=useState("10.5");
  const [years,setYears]=useState("10");
  const num=(v:string)=>Number(String(v).replace(/[^0-9.\-]/g,""))||0;
  const out = useMemo(()=>{
    const P=num(amount), r=num(apr)/100, n=num(years);
    const mo=pmtMonthly(r,n,P), total=mo*12*n, interest=Math.max(0,total-P);
    return { mo,total,interest };
  },[amount,apr,years]);
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-4 text-sm text-brand.slate-600"><Link href="/pro" className="underline">← Back to Pro</Link></div>
      <h1 className="text-3xl font-bold">Loan Amortization — Summary</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <label className="text-sm">Loan amount<input className="mt-1 w-full rounded-lg border px-3 py-2" value={amount} onChange={e=>setAmount(e.target.value)}/></label>
        <label className="text-sm">APR %<input className="mt-1 w-full rounded-lg border px-3 py-2" value={apr} onChange={e=>setApr(e.target.value)}/></label>
        <label className="text-sm">Term (years)<input className="mt-1 w-full rounded-lg border px-3 py-2" value={years} onChange={e=>setYears(e.target.value)}/></label>
      </div>
      <div className="mt-6 grid gap-3 rounded-2xl border bg-white p-5">
        <div className="text-sm text-brand.slate-600">Monthly payment</div>
        <div className="text-2xl font-semibold">{fmtUSD(out.mo)}</div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl bg-slate-50 p-3"><div className="text-brand.slate-600">Total payments</div><div className="text-lg font-semibold">{fmtUSD(out.total)}</div></div>
          <div className="rounded-xl bg-slate-50 p-3"><div className="text-brand.slate-600">Total principal</div><div className="text-lg font-semibold">{fmtUSD(num(amount))}</div></div>
          <div className="rounded-xl bg-slate-50 p-3"><div className="text-brand.slate-600">Total interest</div><div className="text-lg font-semibold">{fmtUSD(out.interest)}</div></div>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">Fixed, fully-amortizing schedule, monthly compounding.</p>
    </main>
  );
}
