export default function StageRibbon(){
  const env=process.env.NEXT_PUBLIC_APP_ENV??(process.env.NODE_ENV==="development"?"dev":"prod");
  if(env==="prod")return null;
  const label=env==="stage"?"STAGE":env==="preprod"?"PRE-PROD":"DEV";
  const bg=env==="stage"?"bg-amber-500":env==="preprod"?"bg-sky-600":"bg-fuchsia-600";
  const text=env==="stage"?"text-black":"text-white";
  return(<div className={`fixed left-1/2 top-0 z-50 -translate-x-1/2 rounded-b-xl px-3 py-1.5 text-xs font-semibold shadow ${bg} ${text}`}>You’re on {label}</div>);
}
