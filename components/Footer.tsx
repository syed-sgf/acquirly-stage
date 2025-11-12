export default function Footer(){
  const y=new Date().getFullYear();
  return (<footer className="mx-auto max-w-6xl px-6 py-12 text-center text-sm text-brand-slate-600">
    <p>© {y} Starting Gate Financial. All rights reserved.</p>
    <p className="mt-1 text-xs">Acquirely™ is a product of Starting Gate Financial.</p>
    <p className="mt-3"><a href="/terms" className="underline">Terms</a> · <a href="/privacy" className="underline">Privacy</a></p>
  </footer>);
}
