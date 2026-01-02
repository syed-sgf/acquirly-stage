import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL!));
  }

  // Get user's first deal
  const firstDeal = await prisma.deal.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
  });

  if (firstDeal) {
    return NextResponse.redirect(new URL(`/app/deals/${firstDeal.id}`, process.env.NEXTAUTH_URL!));
  }

  return NextResponse.redirect(new URL('/app', process.env.NEXTAUTH_URL!));
}
