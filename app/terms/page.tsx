export default function Terms(){
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold">Terms of Use</h1>
      <p className="mt-2 text-brand-slate-600">© {new Date().getFullYear()} Starting Gate Financial.</p>
      <div className="mt-4 space-y-3 text-sm text-brand-slate-700">
        <p>Acqyrly by Starting Gate Financial is for informational purposes only and is not financial, legal, or tax advice. Verify results before making decisions.</p>
        <p>Do not upload sensitive personal data. You are responsible for compliance with applicable laws and lender rules.</p>
      </div>
    </main>
  );
}
