// lib/stripe/config.ts
export const STRIPE_CONFIG = {
  prices: {
    core: { 
      monthly: 'price_1TJ2n2EGCpqaqrIu4mnnAlJ3',
      annual: 'price_1TJ2n2EGCpqaqrIuZGgHjtR4'
    },
    pro: { 
      monthly: 'price_1TJ2rgEGCpqaqrIugQ7p8G8A',
      annual: 'price_1TJ2swEGCpqaqrIuddPlwu5y'
    },
    enterprise: { 
      monthly: 'price_1TJ2vKEGCpqaqrIuPY01bIsN'
    },
  } as Record<string, { monthly: string; annual?: string }>,
  
  products: {
    core: 'prod_UHc1YnrfY0BTN1',
    pro: 'prod_UHc578tXzFlM7t',
    enterprise: 'prod_UHc578tXzFlM7t',
  },
  
  plans: {
    free: {
      name: 'Free',
      price: 0,
      priceId: null as string | null,
      features: ['Basic DSCR Calculator', 'Business Loan Calculator', '3 saved calculations'],
      limits: { savedDeals: 3, pdfExports: 0, advancedAnalysis: false },
    },
    core: {
      name: 'Core',
      price: 79,
      priceId: 'price_1TJ2n2EGCpqaqrIu4mnnAlJ3',
      features: ['All Free features', 'Acquisition Analyzer', '10 saved deals', 'PDF exports'],
      limits: { savedDeals: 10, pdfExports: 25, advancedAnalysis: false },
    },
    pro: {
      name: 'Pro',
      price: 247,
      priceId: 'price_1TJ2rgEGCpqaqrIugQ7p8G8A',
      features: ['All Core features', 'CRE Loan Sizer', 'Unlimited deals', 'Branded PDF reports'],
      limits: { savedDeals: -1, pdfExports: -1, advancedAnalysis: true },
    },
    enterprise: {
      name: 'Enterprise',
      price: 2000,
      priceId: 'price_1TJ2vKEGCpqaqrIuPY01bIsN',
      features: ['All Pro features', 'White-label reports', 'API access', 'Dedicated support'],
      limits: { savedDeals: -1, pdfExports: -1, advancedAnalysis: true, whiteLabel: true, apiAccess: true },
    },
  },
};

export type PlanType = keyof typeof STRIPE_CONFIG.plans;

export function getPriceId(plan: string, billing: 'monthly' | 'annual' = 'monthly'): string | null {
  const prices = STRIPE_CONFIG.prices[plan];
  return prices?.[billing] || prices?.monthly || null;
}

export function getPlanFromPriceId(priceId: string): PlanType | null {
  for (const [plan, prices] of Object.entries(STRIPE_CONFIG.prices)) {
    if (prices.monthly === priceId || prices.annual === priceId) {
      return plan as PlanType;
    }
  }
  return null;
}
