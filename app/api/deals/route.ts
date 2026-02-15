import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkDealLimit, upgradeResponse } from '@/lib/plans/gating';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const deals = await prisma.deal.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(deals);
  } catch (error) {
    console.error('Error in GET /api/deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // =========================================================
    // GATING: Check deal limit before creating
    // =========================================================
    const gate = await checkDealLimit(session.user.id);
    if (!gate.allowed) {
      return upgradeResponse('deals', gate.currentCount, gate.limit, gate.plan, gate.upgradeRequired!);
    }
    // =========================================================

    const body = await req.json();
    const { name } = body;

    // Find or create organization
    let membership = await prisma.membership.findFirst({
      where: { userId: session.user.id },
      include: { organization: true }
    });

    if (!membership) {
      const userName = session.user.name || session.user.email || 'User';
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

    if (!membership) {
      return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
    }

    const deal = await prisma.deal.create({
      data: {
        name: name || 'Untitled Deal',
        userId: session.user.id,
        organizationId: membership.organizationId,
      },
    });

    return NextResponse.json(deal);
  } catch (error) {
    console.error('Error in POST /api/deals:', error);
    return NextResponse.json(
      { error: 'Failed to create deal', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
