// lib/plans/gating.ts
import { prisma } from '@/lib/db';
import { getEffectivePlan, getPlanLimits } from './limits';

export interface GateResult {
  allowed: boolean;
  reason?: string;
  limitHit?: string;
  currentPlan?: string;
  upgradeTo?: string;
}

export async function getUserWithPlan(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, plan: true, pilotUser: true, pilotExpiresAt: true },
  });
}

export async function gateDealCreation(userId: string): Promise<GateResult> {
  const user = await getUserWithPlan(userId);
  if (!user) return { allowed: false, reason: 'User not found' };
  const effectivePlan = getEffectivePlan(user as any);
  const limits = getPlanLimits(effectivePlan);
  if (limits.maxDeals === -1) return { allowed: true, currentPlan: effectivePlan };
  const dealCount = await prisma.deal.count({ where: { userId } });
  if (dealCount >= limits.maxDeals) {
    return {
      allowed: false, limitHit: 'deals', currentPlan: effectivePlan,
      upgradeTo: effectivePlan === 'free' ? 'core' : 'pro',
      reason: effectivePlan === 'free'
        ? `Free plan is limited to ${limits.maxDeals} deal. You have ${dealCount}. Upgrade to Core for up to 5 deals.`
        : `Your plan is limited to ${limits.maxDeals} deals. Upgrade to Pro for unlimited deals.`,
    };
  }
  return { allowed: true, currentPlan: effectivePlan };
}

export async function gateAnalysisCreation(userId: string, dealId: string): Promise<GateResult> {
  const user = await getUserWithPlan(userId);
  if (!user) return { allowed: false, reason: 'User not found' };
  const effectivePlan = getEffectivePlan(user as any);
  const limits = getPlanLimits(effectivePlan);
  if (limits.maxAnalysesPerDeal === -1) return { allowed: true, currentPlan: effectivePlan };
  const analysisCount = await prisma.analysis.count({ where: { dealId } });
  if (analysisCount >= limits.maxAnalysesPerDeal) {
    return {
      allowed: false, limitHit: 'analyses', currentPlan: effectivePlan, upgradeTo: 'core',
      reason: `Free plan is limited to ${limits.maxAnalysesPerDeal} analyses per deal. Upgrade to Core for unlimited analyses.`,
    };
  }
  return { allowed: true, currentPlan: effectivePlan };
}

export async function gateCalculatorAccess(userId: string, calculatorType: string): Promise<GateResult> {
  const user = await getUserWithPlan(userId);
  if (!user) return { allowed: false, reason: 'User not found' };
  const effectivePlan = getEffectivePlan(user as any);
  const limits = getPlanLimits(effectivePlan);
  if (!limits.calculators.includes(calculatorType)) {
    return {
      allowed: false, limitHit: 'calculator', currentPlan: effectivePlan, upgradeTo: 'core',
      reason: `The ${calculatorType} calculator requires a Core plan or above.`,
    };
  }
  return { allowed: true, currentPlan: effectivePlan };
}

export async function gatePDFExport(userId: string): Promise<GateResult> {
  const user = await getUserWithPlan(userId);
  if (!user) return { allowed: false, reason: 'User not found' };
  const effectivePlan = getEffectivePlan(user as any);
  const limits = getPlanLimits(effectivePlan);
  if (!limits.canExportPDF) {
    return {
      allowed: false, limitHit: 'pdf', currentPlan: effectivePlan, upgradeTo: 'core',
      reason: 'PDF export is available on Core and above. Upgrade to export professional reports.',
    };
  }
  return { allowed: true, currentPlan: effectivePlan };
}

export function gateResponse(gate: GateResult) {
  return Response.json(
    {
      error: 'Plan limit reached',
      reason: gate.reason,
      limitHit: gate.limitHit,
      currentPlan: gate.currentPlan,
      upgradeTo: gate.upgradeTo,
      upgradeUrl: '/pricing',
    },
    { status: 403 }
  );
}
