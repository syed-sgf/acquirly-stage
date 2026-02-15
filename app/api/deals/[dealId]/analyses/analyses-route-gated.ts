// app/api/deals/[dealId]/analyses/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ANALYSIS_TYPES, resolveAnalysisName } from "@/lib/analyses/constants";
import { gateAnalysisCreation, gateCalculatorAccess, gateResponse } from "@/lib/plans/gating";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dealId } = await params;
  const body = await req.json();

  // Verify user owns the deal
  const deal = await prisma.deal.findFirst({
    where: { id: dealId, userId: session.user.id },
  });
  if (!deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  const type = body.type || ANALYSIS_TYPES.DSCR;

  // 🔒 GATING: Check calculator access
  const calcGate = await gateCalculatorAccess(session.user.id, type);
  if (!calcGate.allowed) {
    return gateResponse(calcGate);
  }

  // 🔒 GATING: Check analysis count limit
  const analysisGate = await gateAnalysisCreation(session.user.id, dealId);
  if (!analysisGate.allowed) {
    return gateResponse(analysisGate);
  }

  const inputs = body.inputs || {};
  const outputs = body.outputs || {};
  const name = resolveAnalysisName(type, inputs);

  const analysis = await prisma.analysis.create({
    data: { dealId, type, name, inputs, outputs },
  });

  return NextResponse.json(analysis);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dealId } = await params;

  const deal = await prisma.deal.findFirst({
    where: { id: dealId, userId: session.user.id },
  });
  if (!deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  const analyses = await prisma.analysis.findMany({
    where: { dealId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(analyses);
}
