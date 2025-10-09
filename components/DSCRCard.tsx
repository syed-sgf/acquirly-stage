import { fmtDSCR, dscrBand, dscrBadgeClass, dscrBarClass } from "@/lib/num";
export default function DSCRCard({ value }:{value:number|null}){
  const band=dscrBand(value);
  const pct=Math.max(0,Math.min(1,((value??0)/2)));
  return(<div className="rounded-2xl border bg-white p-5">
    <div className="flex items-baseline justify-between"><h3 className="text-sm font-semibold text-slate-700">DSCR</h3>
      <span className={`rounded-md px-2 py-1 text-xs font-medium ${dscrBadgeClass(band)}`}>{fmtDSCR(value)}</span>
    </div>
    <div className="mt-3 h-2 w-full rounded-full bg-slate-200"><div className={`h-2 rounded-full ${dscrBarClass(band)}`} style={{width:`${pct*100}%`}}/></div>
    <p className="mt-2 text-xs text-slate-500"><span className="font-medium">Color bands:</span> ≤1.15 red · 1.16–1.24 amber · ≥1.25 green</p>
  </div>);
}
