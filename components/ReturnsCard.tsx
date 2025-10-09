"use client";
import { useMemo, useState } from "react";
import { parseCurrency, parsePercent, totalROI, annualizedROI, npv, paybackSimple, discountedPayback } from "@/lib/num";
type ExitMode="manual"|"multiple";
export default function ReturnsCard(){
  const [equity0,setEquity0]=useState<string>("$300,000");
  const [discount,setDiscount]=useState<string>("12%");
  const [flows,setFlows]=useState<string[]>(["50000","60000","70000","80000","90000"]);
  const [useExit,setUseExit]=useState<boolean>(true);
  const [exitYear,setExitYear]=useState<number>(6);
  const [mode,setMode]=useState<ExitMode>("multiple");
  const [exitProceedsInput,setExitProceedsInput]=useState<string>("$600,000");
  const [exitMultiple,setExitMultiple]=useState<string>("5.0");
  const [exitMetric,setExitMetric]=useState<string>("$500,000");
  const [exitDebtPayoff,setExitDebtPayoff]=useState<string>("$0");
  const [exitTxnCostPct,setExitTxnCostPct]=useState<string>("3%");
  const parsed=useMemo(()=>{
    const e0=parseCurrency(equity0);
    const r=parsePercent(discount);
    const baseFlows=flows.map(f=>parseCurrency(f));
    let exitNet=0;
    if(useExit){
      if(mode==="manual"){exitNet=parseCurrency(exitProceedsInput)}
      else{
        const mult=Number((exitMultiple||"").replace(/[^0-9.\-]/g,""))||0;
        const metric=parseCurrency(exitMetric);
        const gross=metric*mult;
        const txn=gross*parsePercent(exitTxnCostPct);
        const debt=parseCurrency(exitDebtPayoff);
        exitNet=gross-txn-debt;
      }
    }
    const ecf=[...baseFlows];
    const idx=Math.min(Math.max(1,exitYear),Math.max(1,ecf.length))-1;
    if(useExit) ecf[idx]=(ecf[idx]||0)+exitNet;
    return { e0, r, ecf };
  },[equity0,discount,flows,useExit,mode,exitProceedsInput,exitMultiple,exitMetric,exitDebtPayoff,exitTxnCostPct,exitYear]);
  const metrics=useMemo(()=>({
    roi: totalROI(parsed.e0,parsed.ecf),
    ar: annualizedROI(parsed.e0,parsed.ecf),
    v: npv(parsed.r,parsed.e0,parsed.ecf),
    pb: paybackSimple(parsed.e0,parsed.ecf),
    dpb: discountedPayback(parsed.e0,parsed.ecf,parsed.r),
  }),[parsed]);
  const setFlow=(i:number,val:string)=>setFlows(prev=>prev.map((x,idx)=>idx===i?val:x));
  const addFlow=()=>setFlows(prev=>[...prev,"0"]);
  const USD=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2});
  const PCT=new Intl.NumberFormat("en-US",{style:"percent",maximumFractionDigits:2});
  return (<div className="rounded-2xl border bg-white p-5">
    <div className="flex items-baseline justify-between"><h3 className="text-lg font-semibold">Returns (Equity)</h3></div>
    <div className="mt-3 grid gap-4 md:grid-cols-3">
      <label className="text-sm">Equity Invested (t0)<input className="mt-1 w-full rounded-lg border px-3 py-2" value={equity0} onChange={e=>setEquity0(e.target.value)} placeholder="$300,000"/></label>
      <label className="text-sm">Discount rate<input className="mt-1 w-full rounded-lg border px-3 py-2" value={discount} onChange={e=>setDiscount(e.target.value)} placeholder="12%"/></label>
      <div className="text-xs text-slate-500 flex items-end">Enter annual equity cash flows below. Exit is added to the selected year.</div>
    </div>
    <div className="mt-3 grid gap-2 md:grid-cols-3">{flows.map((f,i)=>(<label key={i} className="text-sm">Year {i+1} ECF<input className="mt-1 w-full rounded-lg border px-3 py-2" value={f} onChange={e=>setFlow(i,e.target.value)}/></label>))}</div>
    <div className="mt-2 flex items-center gap-3">
      <button onClick={addFlow} className="rounded-lg bg-slate-100 px-3 py-2 text-sm">+ Add year</button>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={useExit} onChange={e=>setUseExit(e.target.checked)}/> Include exit</label>
      {useExit&&(<label className="text-sm">Exit year<input type="number" min={1} className="ml-2 w-20 rounded border px-2 py-1" value={exitYear} onChange={e=>setExitYear(Number(e.target.value)||1)}/></label>)}
    </div>
    {useExit&&(<div className="mt-3 rounded-xl border p-3">
      <div className="flex items-center gap-3 text-sm">
        <span className={`cursor-pointer rounded px-2 py-1 ${mode==="manual"?"bg-slate-200":""}`} onClick={()=>setMode("manual")}>Manual exit</span>
        <span className={`cursor-pointer rounded px-2 py-1 ${mode==="multiple"?"bg-slate-200":""}`} onClick={()=>setMode("multiple")}>Multiple-based</span>
      </div>
      {mode==="manual"
        ? (<div className="mt-3 grid gap-3 md:grid-cols-3"><label className="text-sm">Exit proceeds (net)<input className="mt-1 w-full rounded-lg border px-3 py-2" value={exitProceedsInput} onChange={e=>setExitProceedsInput(e.target.value)}/></label></div>)
        : (<div className="mt-3 grid gap-3 md:grid-cols-4">
            <label className="text-sm">Exit multiple (x)<input className="mt-1 w-full rounded-lg border px-3 py-2" value={exitMultiple} onChange={e=>setExitMultiple(e.target.value)} placeholder="5.0"/></label>
            <label className="text-sm">Metric at exit (EBITDA/SDE)<input className="mt-1 w-full rounded-lg border px-3 py-2" value={exitMetric} onChange={e=>setExitMetric(e.target.value)} placeholder="$500,000"/></label>
            <label className="text-sm">Debt payoff at exit<input className="mt-1 w-full rounded-lg border px-3 py-2" value={exitDebtPayoff} onChange={e=>setExitDebtPayoff(e.target.value)} placeholder="$0"/></label>
            <label className="text-sm">Txn costs %<input className="mt-1 w-full rounded-lg border px-3 py-2" value={exitTxnCostPct} onChange={e=>setExitTxnCostPct(e.target.value)} placeholder="3%"/></label>
          </div>)}
      <p className="mt-2 text-xs text-slate-500">Exit (net) is added to that year’s ECF. Net = Metric × Multiple − Debt payoff − (Txn % × Metric × Multiple).</p>
    </div>)}
    <div className="mt-5 grid gap-4 md:grid-cols-5">
      <div className="rounded-xl bg-slate-50 p-3 text-sm"><div className="text-slate-500">Total ROI</div><div className="text-lg font-semibold">{parsed.e0>0?PCT.format((flows.map(f=>parseCurrency(f)).reduce((a,b)=>a+b,0))/parsed.e0):"—"}</div></div>
      <div className="rounded-xl bg-slate-50 p-3 text-sm"><div className="text-slate-500">Annualized ROI</div><div className="text-lg font-semibold">{metrics.ar==null?"—":PCT.format(metrics.ar)}</div></div>
      <div className="rounded-xl bg-slate-50 p-3 text-sm"><div className="text-slate-500">NPV</div><div className="text-lg font-semibold">{USD.format(metrics.v??0)}</div></div>
      <div className="rounded-xl bg-slate-50 p-3 text-sm"><div className="text-slate-500">Payback (yrs)</div><div className="text-lg font-semibold">{metrics.pb==null?"—":metrics.pb.toFixed(1)}</div></div>
      <div className="rounded-xl bg-slate-50 p-3 text-sm"><div className="text-slate-500">Discounted Payback</div><div className="text-lg font-semibold">{metrics.dpb==null?"—":metrics.dpb.toFixed(1)} yrs</div></div>
    </div>
  </div>);
}
