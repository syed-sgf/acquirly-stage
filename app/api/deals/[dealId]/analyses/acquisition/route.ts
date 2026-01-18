import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

import {
  ANALYSIS_TYPES,
  resolveAnalysisName,
} from "@/lib/analyses/constants";

import { getEntitlements } from "@/lib/entitlements/get";

/* -----------------------------
   Schemas
----------------------------- */

const AcquisitionInputsSchema = z.object({
  dealName: z.string().optional(),
  businessType: z.enum([
    "restaurant",
    "retail",
    "manufacturing",
    "services",
    "healthcare",
    "technology",
    "real_estate",
    "other",
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
  outputs: z.record(z.string(), z.any()),
});

/* -----------------------------
   GET – Load latest acquisition analysis
----------------------------- */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  try {
    const { dealId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deal = await prisma.deal.findFirst({
      where: { id: dealId, userId: session.user.id },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    const analysis = await prisma.analysis.findFirst({
      where: { dealId, type: ANALYSIS_TYPES.ACQUISITION },
      orderBy: { updatedAt: "desc" },
    });

    if (!analysis) {
      return NextResponse.json({ exists: false, data: null });
    }

    return NextResponse.json({
      exists: true,
      data: {
        id: analysis.id,
        name: analysis.name,
        inputs: analysis.inputs,
        outputs: analysis.outputs,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error loading acquisition analysis:", error);
    return NextResponse.json(
      { error: "Failed to load analysis" },
      { status: 500 }
    );
  }
}

/* -----------------------------
   POST – Create or update acquisition analysis
----------------------------- */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  try {
    const { dealId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deal = await prisma.deal.findFirst({
      where: { id: dealId, userId: session.user.id },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = SaveAnalysisSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { inputs, outputs } = validation.data;

    /* -----------------------------
       Entitlement enforcement
    ----------------------------- */

    // TEMP: until org billing is wired
    const plan = (session.user as any)?.plan ?? "free";
    const entitlements = getEntitlements(plan);

    if (!entitlements.canSaveAnalyses) {
      return NextResponse.json(
        { error: "Upgrade required to save analyses" },
        { status: 402 }
      );
    }

    const type = ANALYSIS_TYPES.ACQUISITION;
    const name = resolveAnalysisName(type, inputs);

    const existingAnalysis = await prisma.analysis.findFirst({
      where: { dealId, type },
    });

    let analysis;

    if (existingAnalysis) {
      analysis = await prisma.analysis.update({
        where: { id: existingAnalysis.id },
        data: {
          name,
          inputs: inputs as any,
          outputs: outputs as any,
          updatedAt: new Date(),
        },
      });
    } else {
      analysis = await prisma.analysis.create({
        data: {
          dealId,
          type,
          name,
          inputs: inputs as any,
          outputs: outputs as any,
        },
      });
    }

    // Keep deal snapshot in sync
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
      name: analysis.name,
      updatedAt: analysis.updatedAt,
    });
  } catch (error) {
    console.error("Error saving acquisition analysis:", error);
    return NextResponse.json(
      { error: "Failed to save analysis" },
      { status: 500 }
    );
  }
}
