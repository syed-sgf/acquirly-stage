import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db/client';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deals = await prisma.deal.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(deals);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name } = body;

  // Find or create organization
  let membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    include: { organization: true }
  });
  
  if (!membership) {
    const userName = session.user.name || session.user.email;
    const orgName = `${userName}'s Organization`;
    const slug = `org-${session.user.id.slice(0, 8)}`;
    
    await prisma.organization.create({
      data: {
        name: orgName,
        slug: slug,
        members: {
          create: { userId: session.user.id, role: 'owner' }
        }
      }
    });
    
    membership = await prisma.membership.findFirst({
      where: { userId: session.user.id },
      include: { organization: true }
    });
  }

  const deal = await prisma.deal.create({
    data: {
      name: name || 'Untitled Deal',
      userId: session.user.id,
      organizationId: membership!.organizationId,
    },
  });

  return NextResponse.json(deal);
}
