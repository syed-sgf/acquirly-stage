import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

/**
 * GET /api/deals/[dealId]/analyses/acquisition
 * 
 * Retrieves the most recent acquisition analysis for a deal
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  try {
    // Await params (Next.js 15+ requirement)
    const { dealId } = await params;

    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the deal and verify ownership
    const deal = await prisma.deal.findUnique({
      where: { id: dealId }
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    if (deal.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the most recent acquisition analysis for this deal
    const analysis = await prisma.analysis.findFirst({
      where: {
        dealId: dealId,
        type: 'acquisition'
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error fetching acquisition analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/deals/[dealId]/analyses/acquisition
 * 
 * Creates or updates an acquisition analysis for a deal
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  try {
    // Await params (Next.js 15+ requirement)
    const { dealId } = await params;

    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the deal and verify ownership
    const deal = await prisma.deal.findUnique({
      where: { id: dealId }
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    if (deal.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { inputs } = body;

    if (!inputs) {
      return NextResponse.json({ error: 'Inputs are required' }, { status: 400 });
    }

    // Import the calculation function
    const { analyzeAcquisition } = await import('@/lib/calculations/acquisition-analysis');
    
    // Calculate the analysis
    const analysis = analyzeAcquisition(inputs);

    // Find existing analysis
    const existingAnalysis = await prisma.analysis.findFirst({
      where: {
        dealId: dealId,
        type: 'acquisition'
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    let savedAnalysis;

    if (existingAnalysis) {
      // Update existing analysis
      savedAnalysis = await prisma.analysis.update({
        where: {
          id: existingAnalysis.id
        },
        data: {
          inputs: inputs as unknown as Prisma.InputJsonValue,
          outputs: analysis as unknown as Prisma.InputJsonValue,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new analysis
      savedAnalysis = await prisma.analysis.create({
        data: {
          dealId: dealId,
          type: 'acquisition',
          inputs: inputs as unknown as Prisma.InputJsonValue,
          outputs: analysis as unknown as Prisma.InputJsonValue
        }
      });
    }

    return NextResponse.json(savedAnalysis);
  } catch (error) {
    console.error('Error saving acquisition analysis:', error);
    return NextResponse.json(
      { error: 'Failed to save analysis' },
      { status: 500 }
    );
  }
}
