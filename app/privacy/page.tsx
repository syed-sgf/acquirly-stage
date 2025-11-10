export default function Privacy(){
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold">Privacy</h1>
      <p className="mt-2 text-brand-slate-600">© {new Date().getFullYear()} Starting Gate Financial.</p>
      <div className="mt-4 space-y-3 text-sm text-brand-slate-700">
        <p>Stage does not store personal data server-side; inputs remain in your session. Don’t enter SSNs, bank account numbers, or other sensitive identifiers.</p>
        <p>Production will add Stripe billing and a database with appropriate safeguards and regional compliance.</p>
      </div>
    </main>
  );
}
