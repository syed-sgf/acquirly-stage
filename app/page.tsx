export default function Home(){
  return (<main className="min-h-[80vh] bg-bg">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-brand.green-500 to-brand.gold-500"/>
        <span className="text-lg font-semibold text-brand.slate-900">Acquirely</span>
        <span className="ml-2 rounded bg-brand.gold-500/10 px-2 py-0.5 text-xs font-medium text-brand.gold-500">by Starting Gate Financial</span>
      </div>
      <nav className="hidden gap-8 text-sm text-brand.slate-600 md:flex">
        <a href="/core">Product</a><a href="/pricing">Pricing</a><a href="/resources">Resources</a>
        <a href="/login" className="rounded-md border px-3 py-1.5">Log In</a>
      </nav>
    </header>
    <section className="mx-auto max-w-4xl px-6 py-16 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-brand.slate-900 md:text-6xl">Unlock the Power of Smart Acquisitions</h1>
      <p className="mx-auto mt-5 max-w-2xl text-lg text-brand.slate-600">Acquirely provides the tools and insights you need to make informed decisions and accelerate your acquisition process. Start your journey today.</p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <a href="/core" className="rounded-xl bg-brand.green-600 px-5 py-3 text-white shadow-soft">Start Free with Core</a>
        <a href="/stage" className="rounded-xl bg-white px-5 py-3 text-brand.green-600 ring-1 ring-brand.green-600">Try Stage</a>
        <a href="/pro" className="rounded-xl bg-white px-5 py-3 text-brand.slate-900 ring-1 ring-brand.slate-900">Upgrade to Pro</a>
      </div>
    </section>
  </main>);
}
