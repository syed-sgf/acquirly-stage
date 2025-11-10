"use client";
import { useEffect, useState } from "react";

type Tier = {
  name: string; price: string; id: "core"|"starter"|"pro";
  cta: { label: string; href?: string; action?: () => void };
  features: string[];
  ring: string;  // ring color class
  button: string; // button color class
};

export default function Pricing(){
  const [banner,setBanner]=useState<string|null>(null);
  useEffect(()=>{
    const p=new URLSearchParams(window.location.search);
    if(p.get("plan")==="proRequired") setBanner("Pro is required to access that page. You can simulate an upgrade for Stage.");
  },[]);

  const activatePro=()=>{ const exp=new Date(Date.now()+30*24*60*60*1000).toUTCString();
    document.cookie=`plan=pro; path=/; expires=${exp}`; window.location.href="/pro"; };

  const tiers: Tier[] = [
    {
      name:"Core", price:"Free", id:"core",
      cta:{ label:"Get Started", href:"/core" },
      ring:"ring-brand-green-600", button:"bg-brand-green-600 text-white"
      ,features:["DSCR & amortization","Deal snapshot (watermarked)","2 active deals","SBA 7(a)/504 checklist"]
    },
    {
      name:"Starter", price:"$19/mo", id:"starter",
      cta:{ label:"Start Starter", href:"/core" },
      ring:"ring-brand-gold-500", button:"bg-brand-gold-500 text-black"
      ,features:["Deal Room (view-only)","Use-of-Funds PDF","10 active deals"]
    },
    {
      name:"Pro", price:"$59/mo", id:"pro",
      cta:{ label:"Activate Pro (demo)", action: activatePro },
      ring:"ring-brand-green-600", button:"bg-brand-green-600 text-white"
      ,features:["Pro Logic model","Loan Amortization & DSCR","Docs Hub & Teaser Pack","50 active deals"]
    }
  ];

  return (
    <main className="bg-bg px-6 py-16">
      {banner && <div className="mx-auto mb-6 max-w-6xl rounded-xl bg-amber-100 p-4 text-amber-900 ring-1 ring-amber-200">{banner}</div>}
      <h1 className="mb-8 text-center text-4xl font-bold text-brand-slate-900">Simple, transparent pricing</h1>

      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        {tiers.map(t=>(
          <div key={t.name} className={`rounded-2xl bg-white p-6 shadow-soft ring-1 ${t.ring}`}>
            <h3 className="text-xl font-semibold">{t.name}</h3>
            <p className="mt-2 text-3xl font-bold">{t.price}</p>
            <ul className="mt-4 space-y-2 text-sm text-brand-slate-600">
              {t.features.map(f=><li key={f}>• {f}</li>)}
            </ul>

            {t.cta.action
              ? <button onClick={t.cta.action} className={`mt-6 w-full rounded-xl px-4 py-2 font-medium ${t.button}`}>{t.cta.label}</button>
              : <a href={t.cta.href} className={`mt-6 block rounded-xl px-4 py-2 text-center font-medium ${t.button}`}>{t.cta.label}</a>
            }
          </div>
        ))}
      </div>

      <p className="mx-auto mt-6 max-w-6xl text-center text-xs text-slate-500">
        Stage demo paywall uses a cookie. Real billing via Stripe will replace this in Prod.
      </p>
    </main>
  );
}
