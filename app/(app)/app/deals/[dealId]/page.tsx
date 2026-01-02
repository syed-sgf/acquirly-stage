import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function DealPage({ 
  params 
}: { 
  params: { dealId: string } 
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/');
  }

  const deal = await prisma.deal.findFirst({
    where: {
      id: params.dealId,
      userId: session.user.id,
    },
  });

  if (!deal) {
    redirect('/app');
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{deal.name}</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">🎉 Welcome to ACQUIRELY!</h2>
        <p className="text-gray-700 mb-4">
          This is your first deal workspace. Here you will be able to:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Run DSCR calculations</li>
          <li>Analyze business acquisitions</li>
          <li>Model different scenarios</li>
          <li>Export professional reports</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">📊 DSCR Calculator</h3>
          <p className="text-gray-600 mb-4">
            Calculate debt service coverage ratio for loan qualification
          </p>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Calculate DSCR →
          </button>
        </div>

        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">💼 Acquisition Analysis</h3>
          <p className="text-gray-600 mb-4">
            Complete business acquisition financial modeling
          </p>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Analyze Deal →
          </button>
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>Deal ID: {deal.id}</p>
        <p>Created: {deal.createdAt.toLocaleDateString()}</p>
      </div>
    </div>
  );
}
