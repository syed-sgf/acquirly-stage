export default function Footer(){
  const y=new Date().getFullYear();
  return (<footer className="mx-auto max-w-6xl px-6 py-12 text-center text-sm text-brand-slate-600">
    <p>© {y} Acqyrly. All rights reserved.</p>
    <p className="mt-1 text-xs">Acqyrly™ — Deal Intelligence Platform.</p>
    <p className="mt-3"><a href="/terms" className="underline">Terms</a> · <a href="/privacy" className="underline">Privacy</a></p>
  </footer>);
}
