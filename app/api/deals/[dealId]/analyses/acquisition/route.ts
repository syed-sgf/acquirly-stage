// ACQUIRELY - Acquisition Analysis API Route
// GET: Load existing analysis
// POST: Save/update analysis

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// ============================================
// VALIDATION SCHEMAS
// ============================================

const AcquisitionInputsSchema = z.object({
  dealName: z.string().optional(),
  businessType: z.enum([
    'restaurant', 'retail', 'manufacturing', 'services',
    'healthcare', 'technology', 'real_estate', 'other'
  ]),
  purchasePrice: z.number().min(0),
  downPayment: z.number().min(0),
  sellerFinancing: z.number().min(0),
  sellerFinancingRate: z.number().min(0).max(100),
  sellerFinancingTerm: z.number().min(1).max(30),
  bankLoanRate: z.number().min(0).max(100),
  bankLoanTerm: z.number().min(1).max(30),
  annualRevenue: z.number().min(0),
  annualSDE: z.number(),
  annualEBITDA: z.number(),
  workingCapital: z.number().min(0),
  closingCosts: z.number().min(0),
  ffeValue: z.number().min(0),
  inventoryValue: z.number().min(0),
  annualCapex: z.number().min(0),
  buyerSalary: z.number().min(0),
  revenueGrowthRate: z.number().min(-100).max(100),
  expenseGrowthRate: z.number().min(-100).max(100),
  exitTimeline: z.number().min(1).max(30),
});

const SaveAnalysisSchema = z.object({
  inputs: AcquisitionInputsSchema,
  outputs: z.record(z.any()), // Flexible for calculated outputs
});

// ============================================
// GET - Load Analysis
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { dealId } = params;
    
    // Verify deal ownership
    const deal = await prisma.deal.findFirst({
      where: {
        id: dealId,
        userId: session.user.id,
      },
    });
    
    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }
    
    // Find existing acquisition analysis
    const analysis = await prisma.analysis.findFirst({
      where: {
        dealId: dealId,
        type: 'acquisition',
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    
    if (!analysis) {
      return NextResponse.json({
        exists: false,
        data: null,
      });
    }
    
    return NextResponse.json({
      exists: true,
      data: {
        id: analysis.id,
        inputs: analysis.inputs,
        outputs: analysis.outputs,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      },
    });
    
  } catch (error) {
    console.error('Error loading acquisition analysis:', error);
    return NextResponse.json(
      { error: 'Failed to load analysis' },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Save/Update Analysis
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { dealId } = params;
    
    // Verify deal ownership
    const deal = await prisma.deal.findFirst({
      where: {
        id: dealId,
        userId: session.user.id,
      },
    });
    
    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validation = SaveAnalysisSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.flatten() },
        { status: 400 }
      );
    }
    
    const { inputs, outputs } = validation.data;
    
    // Check for existing analysis
    const existingAnalysis = await prisma.analysis.findFirst({
      where: {
        dealId: dealId,
        type: 'acquisition',
      },
    });
    
    let analysis;
    
    if (existingAnalysis) {
      // Update existing
      analysis = await prisma.analysis.update({
        where: {
          id: existingAnalysis.id,
        },
        data: {
          inputs: inputs as any,
          outputs: outputs as any,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new
      analysis = await prisma.analysis.create({
        data: {
          dealId: dealId,
          type: 'acquisition',
          name: inputs.dealName || 'Business Acquisition Analysis',
          inputs: inputs as any,
          outputs: outputs as any,
        },
      });
    }
    
    // Also update the deal with key metrics
    await prisma.deal.update({
      where: { id: dealId },
      data: {
        purchasePrice: inputs.purchasePrice,
        annualRevenue: inputs.annualRevenue,
        annualSDE: inputs.annualSDE,
        businessType: inputs.businessType,
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json({
      success: true,
      analysisId: analysis.id,
      updatedAt: analysis.updatedAt,
    });
    
  } catch (error) {
    console.error('Error saving acquisition analysis:', error);
    return NextResponse.json(
      { error: 'Failed to save analysis' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Remove Analysis
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { dealId } = params;
    
    // Verify deal ownership
    const deal = await prisma.deal.findFirst({
      where: {
        id: dealId,
        userId: session.user.id,
      },
    });
    
    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }
    
    // Delete all acquisition analyses for this deal
    await prisma.analysis.deleteMany({
      where: {
        dealId: dealId,
        type: 'acquisition',
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Analysis deleted',
    });
    
  } catch (error) {
    console.error('Error deleting acquisition analysis:', error);
    return NextResponse.json(
      { error: 'Failed to delete analysis' },
      { status: 500 }
    );
  }
}
