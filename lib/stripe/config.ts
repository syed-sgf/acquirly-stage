// lib/stripe/config.ts

export const STRIPE_CONFIG = {
  prices: {
    core: { monthly: 'price_1T1BlUFersck1CUU0P9keS92' },
    pro: { monthly: 'price_1T1Bm8Fersck1CUUMOjl2ToK' },
    enterprise: { monthly: 'price_1T1BmbFersck1CUUh79HzO94' },
  },
  products: {
    core: 'prod_TzA5f1gtn9ypht',
    pro: 'prod_TzA6Ad3RkgKB0g',
    enterprise: 'prod_TzA65yYa5iXmF7',
  },
  plans: {
    free: {
      name: 'Free',
      price: 0,
      priceId: null,
      features: ['Basic DSCR Calculator', 'Business Loan Calculator', '3 saved calculations'],
      limits: { savedDeals: 3, pdfExports: 0, advancedAnalysis: false },
    },
    core: {
      name: 'Core',
      price: 79,
      priceId: 'price_1T1BlUFersck1CUU0P9keS92',
      features: ['All Free features', 'Acquisition Analyzer', '10 saved deals', 'PDF exports'],
      limits: { savedDeals: 10, pdfExports: 25, advancedAnalysis: false },
    },
    pro: {
      name: 'Pro',
      price: 247,
      priceId: 'price_1T1Bm8Fersck1CUUMOjl2ToK',
      features: ['All Core features', 'CRE Loan Sizer', 'Unlimited deals', 'Branded PDF reports'],
      limits: { savedDeals: -1, pdfExports: -1, advancedAnalysis: true },
    },
    enterprise: {
      name: 'Enterprise',
      price: 2000,
      priceId: 'price_1T1BmbFersck1CUUh79HzO94',
      features: ['All Pro features', 'White-label reports', 'API access', 'Dedicated support'],
      limits: { savedDeals: -1, pdfExports: -1, advancedAnalysis: true, whiteLabel: true, apiAccess: true },
    },
  },
} as const;

export type PlanType = keyof typeof STRIPE_CONFIG.plans;

export function getPriceId(plan: Exclude<PlanType, 'free'>): string {
  return STRIPE_CONFIG.prices[plan].monthly;
}

export function getPlanFromPriceId(priceId: string): PlanType | null {
  for (const [plan, prices] of Object.entries(STRIPE_CONFIG.prices)) {
    if (Object.values(prices).includes(priceId)) {
      return plan as PlanType;
    }
  }
  return null;
}