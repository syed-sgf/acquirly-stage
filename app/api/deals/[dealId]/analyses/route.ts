import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: { dealId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dealId = params.dealId;
  const body = await req.json();

  // Verify user owns this deal
  const deal = await prisma.deal.findFirst({
    where: {
      id: dealId,
      userId: session.user.id,
    },
  });

  if (!deal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
  }

  // Create the analysis
  const analysis = await prisma.analysis.create({
    data: {
      dealId: dealId,
      type: body.type || 'dscr',
      name: body.name || 'Analysis',
      inputs: body.inputs || {},
      outputs: body.outputs || {},
      metadata: body.metadata || {},
    },
  });

  return NextResponse.json(analysis);
}

export async function GET(
  req: Request,
  { params }: { params: { dealId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dealId = params.dealId;

  // Verify user owns this deal
  const deal = await prisma.deal.findFirst({
    where: {
      id: dealId,
      userId: session.user.id,
    },
  });

  if (!deal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
  }

  // Get all analyses for this deal
  const analyses = await prisma.analysis.findMany({
    where: { dealId: dealId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(analyses);
}
