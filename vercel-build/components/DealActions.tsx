export default function DealActions() {
  return (
    <div className="flex gap-3">
      <button className="rounded-lg bg-brand-green-600 px-4 py-2 text-white hover:bg-brand-green-700">
        Save Deal
      </button>
      <button className="rounded-lg border px-4 py-2 hover:bg-gray-50">
        Export PDF
      </button>
    </div>
  );
}
