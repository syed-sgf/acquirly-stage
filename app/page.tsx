import Link from "next/link";
export default function Home(){
  return (
    <main className="min-h-[70vh] bg-bg">
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-brand.slate-900 md:text-6xl">Unlock the Power of Smart Acquisitions</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-brand.slate-600">Acquirely provides the tools and insights you need to make informed decisions and accelerate your acquisition process. Start your journey today.</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/core" className="rounded-xl bg-brand.green-600 px-5 py-3 text-white font-medium shadow-soft hover:brightness-95">Start Free with Core</Link>
          <Link href="/pro" className="rounded-xl bg-white px-5 py-3 text-brand.slate-900 ring-1 ring-brand.slate-900 font-medium hover:bg-slate-50">Upgrade to Pro</Link>
        </div>
      </section>
    </main>
  );
}
