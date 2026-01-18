import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const deal = await prisma.deal.findFirst({
    where: { id: params.dealId, userId: session.user.id },
  });
  
  if (!deal) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  return NextResponse.json(deal);
}
