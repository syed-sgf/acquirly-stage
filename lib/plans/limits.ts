// lib/plans/limits.ts
// =============================================================================
// Acqyrly - Plan Limits & Feature Gating
// =============================================================================

export type Plan = 'free' | 'core' | 'pro' | 'enterprise' | 'pilot';

export interface PlanLimits {
  maxDeals: number;           // -1 = unlimited
  maxAnalysesPerDeal: number; // -1 = unlimited
  maxExportsPerMonth: number; // -1 = unlimited
  canExportPDF: boolean;
  canSaveToDeal: boolean;
  canAccessMarketIntel: boolean;
  canAccessBuyerRisk: boolean;
  canWhiteLabel: boolean;
  canAccessAPI: boolean;
  canManageTeam: boolean;
  calculators: string[];      // which calculators are accessible
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxDeals: 1,
    maxAnalysesPerDeal: 3,
    maxExportsPerMonth: 0,
    canExportPDF: false,
    canSaveToDeal: true,
    canAccessMarketIntel: false,
    canAccessBuyerRisk: false,
    canWhiteLabel: false,
    canAccessAPI: false,
    canManageTeam: false,
    calculators: ['dscr', 'business-loan', 'acquisition'],
  },
  core: {
    maxDeals: 5,
    maxAnalysesPerDeal: -1,
    maxExportsPerMonth: 20,
    canExportPDF: true,
    canSaveToDeal: true,
    canAccessMarketIntel: false,
    canAccessBuyerRisk: false,
    canWhiteLabel: false,
    canAccessAPI: false,
    canManageTeam: false,
    calculators: ['dscr', 'business-loan', 'acquisition', 'valuation', 'rei-pro', 'cre-loan-sizer', 'commercial-property'],
  },
  pro: {
    maxDeals: -1,
    maxAnalysesPerDeal: -1,
    maxExportsPerMonth: -1,
    canExportPDF: true,
    canSaveToDeal: true,
    canAccessMarketIntel: true,
    canAccessBuyerRisk: true,
    canWhiteLabel: false,
    canAccessAPI: false,
    canManageTeam: false,
    calculators: ['dscr', 'business-loan', 'acquisition', 'valuation', 'rei-pro', 'cre-loan-sizer', 'commercial-property'],
  },
  enterprise: {
    maxDeals: -1,
    maxAnalysesPerDeal: -1,
    maxExportsPerMonth: -1,
    canExportPDF: true,
    canSaveToDeal: true,
    canAccessMarketIntel: true,
    canAccessBuyerRisk: true,
    canWhiteLabel: true,
    canAccessAPI: true,
    canManageTeam: true,
    calculators: ['dscr', 'business-loan', 'acquisition', 'valuation', 'rei-pro', 'cre-loan-sizer', 'commercial-property'],
  },
  pilot: {
    // Pilot users get full Pro access
    maxDeals: -1,
    maxAnalysesPerDeal: -1,
    maxExportsPerMonth: -1,
    canExportPDF: true,
    canSaveToDeal: true,
    canAccessMarketIntel: true,
    canAccessBuyerRisk: true,
    canWhiteLabel: false,
    canAccessAPI: false,
    canManageTeam: false,
    calculators: ['dscr', 'business-loan', 'acquisition', 'valuation', 'rei-pro', 'cre-loan-sizer', 'commercial-property'],
  },
};

export const PLAN_NAMES: Record<Plan, string> = {
  free: 'Free',
  core: 'Core',
  pro: 'Pro',
  enterprise: 'Enterprise',
  pilot: 'Pilot',
};

export const PLAN_PRICES: Record<Plan, string> = {
  free: '$0/mo',
  core: '$79/mo',
  pro: '$247/mo',
  enterprise: '$2,000+/mo',
  pilot: 'Pilot Access',
};

// =============================================================================
// GATING HELPER FUNCTIONS
// =============================================================================

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan as Plan] || PLAN_LIMITS.free;
}

export function canUserCreateDeal(plan: string, currentDealCount: number): boolean {
  const limits = getPlanLimits(plan);
  if (limits.maxDeals === -1) return true;
  return currentDealCount < limits.maxDeals;
}

export function canUserCreateAnalysis(plan: string, currentAnalysisCount: number): boolean {
  const limits = getPlanLimits(plan);
  if (limits.maxAnalysesPerDeal === -1) return true;
  return currentAnalysisCount < limits.maxAnalysesPerDeal;
}

export function canUserExportPDF(plan: string): boolean {
  return getPlanLimits(plan).canExportPDF;
}

export function canUserAccessCalculator(plan: string, calculatorType: string): boolean {
  const limits = getPlanLimits(plan);
  return limits.calculators.includes(calculatorType);
}

export function canUserAccessFeature(plan: string, feature: keyof PlanLimits): boolean {
  const limits = getPlanLimits(plan);
  const value = limits[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === -1 || value > 0;
  return false;
}

export function getUpgradeMessage(plan: string, limitHit: string): { title: string; message: string; upgradeTo: Plan } {
  const messages: Record<string, { title: string; message: string; upgradeTo: Plan }> = {
    deals: {
      title: 'Deal Limit Reached',
      message: plan === 'free'
        ? 'Free accounts are limited to 1 deal. Upgrade to Core for up to 5 deals.'
        : 'You\'ve reached your deal limit. Upgrade to Pro for unlimited deals.',
      upgradeTo: plan === 'free' ? 'core' : 'pro',
    },
    analyses: {
      title: 'Analysis Limit Reached',
      message: 'You\'ve reached the maximum analyses for this deal. Upgrade to Core for unlimited analyses.',
      upgradeTo: 'core',
    },
    pdf: {
      title: 'PDF Export is a Paid Feature',
      message: 'Export professional PDF reports with your analysis. Upgrade to Core to unlock PDF exports.',
      upgradeTo: 'core',
    },
    calculator: {
      title: 'Calculator Requires Upgrade',
      message: 'This calculator is available on Core and above. Upgrade to access all 7 professional calculators.',
      upgradeTo: 'core',
    },
    marketIntel: {
      title: 'Market Intelligence is a Pro Feature',
      message: 'Access live market data, cap rate trends, and industry analysis. Upgrade to Pro.',
      upgradeTo: 'pro',
    },
    buyerRisk: {
      title: 'Buyer Risk Analysis is a Pro Feature',
      message: 'Get the Survivability Score and 3-scenario stress testing. Upgrade to Pro.',
      upgradeTo: 'pro',
    },
  };

  return messages[limitHit] || {
    title: 'Upgrade Required',
    message: 'This feature requires a paid plan. Upgrade to continue.',
    upgradeTo: 'core',
  };
}

// =============================================================================
// EFFECTIVE PLAN (accounts for pilot users)
// =============================================================================

export function getEffectivePlan(user: {
  plan: string;
  pilotUser?: boolean;
  pilotExpiresAt?: Date | null;
}): Plan {
  // Pilot users get pro access unless expired
  if (user.pilotUser) {
    if (!user.pilotExpiresAt || user.pilotExpiresAt > new Date()) {
      return 'pilot';
    }
  }
  return (user.plan as Plan) || 'free';
}
