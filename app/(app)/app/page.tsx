export const dynamic = "force-dynamic";

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/');
  }

  // Get user's first deal
  const firstDeal = await prisma.deal.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
  });

  // If user has a deal, redirect to it
  if (firstDeal) {
    redirect(`/app/deals/${firstDeal.id}`);
  }

  // Fallback: show loading (shouldn't reach here because of auto-create)
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Setting up your workspace...</h1>
        <p className="text-gray-600">Please wait a moment.</p>
      </div>
    </div>
  );
}
