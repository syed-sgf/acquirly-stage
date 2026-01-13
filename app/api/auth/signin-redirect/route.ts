import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL!));
  }

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
  }

  // IMPORTANT: Check for callbackUrl query parameter first
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get('callbackUrl');
  
  if (callbackUrl) {
    return NextResponse.redirect(new URL(callbackUrl, process.env.NEXTAUTH_URL!));
  }

  // Default behavior: redirect to first deal or /app
  const firstDeal = await prisma.deal.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
  });

  if (firstDeal) {
    return NextResponse.redirect(new URL(`/app/deals/${firstDeal.id}`, process.env.NEXTAUTH_URL!));
  }

  return NextResponse.redirect(new URL('/app', process.env.NEXTAUTH_URL!));
}
