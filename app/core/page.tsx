"use client";
import { useMemo, useState } from "react";
import { fmtDSCR, fmtUSD, dscrBand, dscrBadgeClass } from "@/lib/num";
import { pmtMonthly } from "@/lib/pro-logic";

export default function Core(){
  // Defaults are editable
  const [sde,setSde]=useState<string>("450000");
  const [salary,setSalary]=useState<string>("120000");
  const [capex,setCapex]=useState<string>("50000");
  const [rentAddback,setRentAddback]=useState<string>("120000");
  const [termAmt,setTermAmt]=useState<string>("1300000");
  const [termApr,setTermApr]=useState<string>("10.5");
  const [termYears,setTermYears]=useState<string>("10");
  const [locAmt,setLocAmt]=useState<string>("200000");
  const [locUtil,setLocUtil]=useState<string>("35");
  const [locApr,setLocApr]=useState<string>("12");

  const num=(v:string)=>Number(String(v).replace(/[^0-9.\-]/g,""))||0;

  const calc = useMemo(()=>{
    const _sde=num(sde), _sal=num(salary), _cap=num(capex), _rent=num(rentAddback);
    const _termAmt=num(termAmt), _termApr=num(termApr)/100, _yrs=num(termYears);
    const _locAmt=num(locAmt), _util=Math.min(1,Math.max(0,num(locUtil)/100)), _locApr=num(locApr)/100;

    const lendable=_sde - _sal - _cap + _rent;
    const termPmtMo=pmtMonthly(_termApr,_yrs,_termAmt);
    const termDebt=termPmtMo*12;
    const locInterest=_locAmt*_util*_locApr;
    const debtTotal=termDebt + locInterest;
    const dscr = debtTotal>0 ? lendable/debtTotal : null;

    return { lendable, termDebt, locInterest, debtTotal, dscr };
  },[sde,salary,capex,rentAddback,termAmt,termApr,termYears,locAmt,locUtil,locApr]);

  const band=dscrBand(calc.dscr ?? null);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold">Core Calculator</h1>
      <p className="mt-2 text-brand.slate-600 text-sm">
        Enter your numbers. DSCR colors: ≤1.15 <span className="text-red-600 font-medium">red</span> ·
        1.16–1.24 <span className="text-amber-600 font-medium">amber</span> · ≥1.25 <span className="text-green-600 font-medium">green</span>.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-xl font-semibold">Business Cash Flow</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <label>Annual SDE/EBITDA
              <input className="mt-1 w-full rounded-lg border px-3 py-2" value={sde} onChange={e=>setSde(e.target.value)} />
            </label>
            <label>Buyer salary (min)
              <input className="mt-1 w-full rounded-lg border px-3 py-2" value={salary} onChange={e=>setSalary(e.target.value)} />
            </label>
            <label>Annual CAPEX (maint+new)
              <input className="mt-1 w-full rounded-lg border px-3 py-2" value={capex} onChange={e=>setCapex(e.target.value)} />
            </label>
            <label>Rents paid to owner (add-back)
              <input className="mt-1 w-full rounded-lg border px-3 py-2" value={rentAddback} onChange={e=>setRentAddback(e.target.value)} />
            </label>
          </div>
          <div className="mt-4 rounded bg-gray-50 p-3 text-sm">
            Lendable CF: <b>{fmtUSD(calc.lendable)}</b>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-xl font-semibold">Debt Assumptions</h2>
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <label>Term amt
              <input className="mt-1 w-full rounded-lg border px-3 py-2" value={termAmt} onChange={e=>setTermAmt(e.target.value)} />
            </label>
            <label>APR %
              <input className="mt-1 w-full rounded-lg border px-3 py-2" value={termApr} onChange={e=>setTermApr(e.target.value)} />
            </label>
            <label>Years
              <input className="mt-1 w-full rounded-lg border px-3 py-2" value={termYears} onChange={e=>setTermYears(e.target.value)} />
            </label>

            <label>LOC limit
              <input className="mt-1 w-full rounded-lg border px-3 py-2" value={locAmt} onChange={e=>setLocAmt(e.target.value)} />
            </label>
            <label>Utilization %
              <input className="mt-1 w-full rounded-lg border px-3 py-2" value={locUtil} onChange={e=>setLocUtil(e.target.value)} />
            </label>
            <label>LOC APR %
              <input className="mt-1 w-full rounded-lg border px-3 py-2" value={locApr} onChange={e=>setLocApr(e.target.value)} />
            </label>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 rounded bg-gray-50 p-3 text-sm">
            <div>Annual term loan debt service: <b>{fmtUSD(calc.termDebt)}</b></div>
            <div>LOC interest (annual): <b>{fmtUSD(calc.locInterest)}</b></div>
            <div>Total annual debt service: <b>{fmtUSD(calc.debtTotal)}</b></div>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">DSCR</h2>
          <span className={`rounded-md px-2 py-1 text-xs font-medium ${dscrBadgeClass(band)}`}>{fmtDSCR(calc.dscr)}</span>
        </div>
        <p className="mt-2 text-sm text-brand.slate-600">
          DSCR = Lendable CF ÷ Total annual debt service
        </p>
      </section>
    </main>
  );
}
