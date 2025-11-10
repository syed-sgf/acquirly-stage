import Link from "next/link";

export default function Navbar(){
  return (
    <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="Acquirely home">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-brand-green-600 to-brand-gold-500" />
          <span className="text-lg font-semibold text-brand-slate-900">Acquirely</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/core" className="text-brand-slate-600 hover:text-brand-slate-900">Product</Link>
          <Link href="/pricing" className="text-brand-slate-600 hover:text-brand-slate-900">Pricing</Link>
          <Link href="/resources" className="text-brand-slate-600 hover:text-brand-slate-900">Resources</Link>
          <Link
            href="/core"
            className="rounded-lg bg-brand-green-600 text-white px-3 py-1.5 font-medium shadow-soft hover:brightness-95"
            aria-label="Start Free with Core"
          >
            Start Free with Core
          </Link>
        </nav>
      </header>
    </div>
  );
}
