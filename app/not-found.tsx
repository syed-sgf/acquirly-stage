import Link from "next/link";
export default function NotFound(){
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-brand-slate-600">Let’s get you back on track.</p>
      <div className="mt-6">
        <Link href="/" className="rounded-xl bg-brand-green-600 px-5 py-3 text-white font-medium shadow-soft hover:brightness-95">Go to Home</Link>
      </div>
    </main>
  );
}
