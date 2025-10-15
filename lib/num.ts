export const USD=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2,minimumFractionDigits:2});
export const PCT=new Intl.NumberFormat("en-US",{style:"percent",maximumFractionDigits:2,minimumFractionDigits:2});
export function parseCurrency(input:any){ if(typeof input==="number")return input||0; if(!input)return 0; const n=Number(String(input).replace(/[^0-9.\-]/g,"")); return Number.isFinite(n)?n:0; }
export function parsePercent(input:any){ if(typeof input==="number")return input; if(!input)return 0; const s=String(input).trim(); if(s.endsWith("%")){const n=Number(s.slice(0,-1).replace(/,/g,"")); return Number.isFinite(n)?n/100:0;} const n=Number(s.replace(/,/g,"")); return !Number.isFinite(n)?0:(n>1?n/100:n); }
export function fmtUSD(n:number){ return USD.format(Math.round((n+Number.EPSILON)*100)/100); }
export function fmtMult(n:number|null){ return n==null?"—":`${(Math.round((n+Number.EPSILON)*100)/100).toFixed(2)}x`; }
export function fmtDSCR(n:number|null){ return n==null?"—":`${(Math.round((n+Number.EPSILON)*100)/100).toFixed(2)}x`; }
export type Band="red"|"amber"|"green";
export function dscrBand(d:number|null|undefined):Band{ if(d==null||!Number.isFinite(d))return "red"; if(d<=1.15)return "red"; if(d<1.25)return "amber"; return "green"; }
export function dscrBadgeClass(b:Band){ return b==="red"?"bg-red-100 ring-1 ring-red-200 text-red-700":b==="amber"?"bg-amber-100 ring-1 ring-amber-200 text-amber-700":"bg-green-100 ring-1 ring-green-200 text-green-700"; }
export function dscrBarClass(b:Band){ return b==="red"?"bg-red-500":b==="amber"?"bg-amber-500":"bg-green-600"; }
export function totalROI(e0:number,ecf:number[]){ if(e0<=0)return null; return ecf.reduce((a,b)=>a+b,0)/e0; }
export function annualizedROI(e0:number,ecf:number[]){ if(e0<=0)return null; const T=ecf.length; const end=e0+ecf.reduce((a,b)=>a+b,0); if(end<=0)return null; return Math.pow(end/e0,1/T)-1; }
export function npv(r:number,e0:number,ecf:number[]){ let v=-e0; for(let t=1;t<=ecf.length;t++) v+=ecf[t-1]/Math.pow(1+r,t); return v; }
export function paybackSimple(e0:number,ecf:number[]){ if(e0<=0)return null; let cum=0; for(let t=0;t<ecf.length;t++){ const prev=cum; cum+=ecf[t]; if(cum>=e0){ const rem=e0-prev; const frac=ecf[t]!==0?rem/ecf[t]:1; return t+frac; } } return null; }
export function discountedPayback(e0:number,ecf:number[],r:number){ if(e0<=0)return null; let cum=0; for(let t=0;t<ecf.length;t++){ const disc=ecf[t]/Math.pow(1+r,t+1); const prev=cum; cum+=disc; if(cum>=e0){ const rem=e0-prev; const frac=disc!==0?rem/disc:1; return t+frac; } } return null; }
