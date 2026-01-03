/**
 * ACQUIRELY Design System
 * Based on Starting Gate Financial branding
 * Created: January 2025
 */

export const BRAND = {
  name: 'Acquirely',
  tagline: 'by Starting Gate Financial',
  company: 'Starting Gate Financial',
  location: 'Richardson, TX',
} as const;

export const COLORS = {
  // Primary Brand Colors (SGF)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Main green
    600: '#16a34a',
    700: '#15803d',  // SGF Dark Green #2E7D32 equivalent
    800: '#166534',
    900: '#14532d',
  },
  
  // Secondary/Accent (SGF Gold)
  accent: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#D4AF37',  // SGF Gold
    800: '#854d0e',
    900: '#713f12',
  },
  
  // Neutrals
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Status Colors
  success: {
    light: '#dcfce7',
    DEFAULT: '#22c55e',
    dark: '#15803d',
  },
  warning: {
    light: '#fef3c7',
    DEFAULT: '#f59e0b',
    dark: '#b45309',
  },
  danger: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#b91c1c',
  },
  info: {
    light: '#dbeafe',
    DEFAULT: '#3b82f6',
    dark: '#1e40af',
  },
} as const;

export const TYPOGRAPHY = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"SF Mono", "Roboto Mono", Consolas, monospace',
  },
  
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const SPACING = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

export const BORDERS = {
  radius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  width: {
    thin: '1px',
    medium: '2px',
    thick: '3px',
  },
} as const;

export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
} as const;

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const PLAN_TIERS = {
  free: {
    name: 'FREE',
    price: 0,
    color: COLORS.gray[600],
    dealLimit: 3,
    analysisLimit: 10,
    features: [
      'Basic DSCR Calculator',
      '3 deals maximum',
      'View-only advanced calculators',
      'SGF branding on exports',
    ],
  },
  core: {
    name: 'CORE',
    price: 79,
    priceYearly: 799,
    color: COLORS.primary[600],
    dealLimit: 10,
    features: [
      'All calculators unlocked',
      'Up to 10 deals',
      'Save & load analyses',
      'Basic PDF exports',
      'Email support',
    ],
  },
  pro: {
    name: 'PRO',
    price: 247,
    priceYearly: 2499,
    color: COLORS.accent[700],
    dealLimit: null, // unlimited
    features: [
      'Unlimited deals',
      'Advanced scenario modeling',
      'Custom branded exports',
      'Market data integration',
      'Priority support',
      'Team collaboration (up to 5)',
    ],
  },
  enterprise: {
    name: 'ENTERPRISE',
    price: 2000,
    priceYearly: 20000,
    color: COLORS.gray[900],
    dealLimit: null,
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'White-label options',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantees',
    ],
  },
} as const;

// Design Tokens for Components
export const COMPONENTS = {
  button: {
    sizes: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl',
    },
    variants: {
      primary: 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white',
      secondary: 'bg-white border-2 border-gray-300 hover:border-primary-500 hover:bg-primary-50 text-gray-700',
      accent: 'bg-gradient-to-r from-accent-700 to-accent-600 hover:from-accent-600 hover:to-accent-500 text-white',
      danger: 'bg-danger-DEFAULT hover:bg-danger-dark text-white',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
    },
  },
  
  card: {
    base: 'bg-white rounded-2xl border-2',
    variants: {
      default: 'border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all',
      primary: 'border-primary-200 bg-primary-50',
      accent: 'border-accent-200 bg-accent-50',
      interactive: 'border-gray-200 hover:border-primary-400 hover:shadow-xl transition-all cursor-pointer',
    },
  },
  
  input: {
    base: 'w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition',
    variants: {
      default: 'border-gray-300',
      error: 'border-danger-DEFAULT',
      success: 'border-success-DEFAULT',
    },
  },
  
  badge: {
    variants: {
      success: 'bg-success-light text-success-dark border border-success-DEFAULT',
      warning: 'bg-warning-light text-warning-dark border border-warning-DEFAULT',
      danger: 'bg-danger-light text-danger-dark border border-danger-DEFAULT',
      info: 'bg-info-light text-info-dark border border-info-DEFAULT',
      neutral: 'bg-gray-100 text-gray-700 border border-gray-300',
    },
  },
} as const;

export const CALCULATOR_TYPES = {
  dscr: {
    id: 'dscr',
    name: 'DSCR Calculator',
    description: 'Debt Service Coverage Ratio Analysis',
    icon: '📊',
    color: COLORS.primary[600],
    route: 'dscr',
  },
  acquisition: {
    id: 'acquisition',
    name: 'Business Acquisition Analyzer',
    description: 'Complete deal analysis with ROI, equity, and scenarios',
    icon: '💼',
    color: COLORS.primary[700],
    route: 'acquisition',
  },
  valuation: {
    id: 'valuation',
    name: 'Business Valuation Calculator',
    description: 'Multiple valuation methods and industry benchmarks',
    icon: '💰',
    color: COLORS.accent[700],
    route: 'valuation',
  },
  reAcquisition: {
    id: 'reAcquisition',
    name: 'Real Estate Acquisition Analyzer',
    description: 'Commercial real estate deal analysis',
    icon: '🏢',
    color: COLORS.primary[600],
    route: 're-acquisition',
  },
  loanCapacity: {
    id: 'loanCapacity',
    name: 'Loan Capacity Calculator',
    description: 'Determine maximum borrowing power',
    icon: '🎯',
    color: COLORS.info.DEFAULT,
    route: 'loan-capacity',
  },
} as const;

export const FEATURE_GATES = {
  'calculator:dscr': { plans: ['free', 'core', 'pro', 'enterprise'] },
  'calculator:acquisition': { plans: ['core', 'pro', 'enterprise'] },
  'calculator:valuation': { plans: ['core', 'pro', 'enterprise'] },
  'calculator:reAcquisition': { plans: ['pro', 'enterprise'] },
  'calculator:loanCapacity': { plans: ['pro', 'enterprise'] },
  'deals:save': { plans: ['core', 'pro', 'enterprise'] },
  'deals:limit': { 
    free: 3,
    core: 10,
    pro: null, // unlimited
    enterprise: null,
  },
  'export:pdf': { plans: ['core', 'pro', 'enterprise'] },
  'export:branded': { plans: ['pro', 'enterprise'] },
  'export:excel': { plans: ['pro', 'enterprise'] },
  'scenarios:advanced': { plans: ['pro', 'enterprise'] },
  'market-data:live': { plans: ['pro', 'enterprise'] },
  'team:collaboration': { plans: ['pro', 'enterprise'] },
  'white-label': { plans: ['enterprise'] },
  'api:access': { plans: ['enterprise'] },
} as const;

export const ANIMATION = {
  transition: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
  },
  
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Utility functions
export function getPlanColor(plan: keyof typeof PLAN_TIERS) {
  return PLAN_TIERS[plan].color;
}

export function hasFeature(userPlan: string, feature: keyof typeof FEATURE_GATES): boolean {
  const featureConfig = FEATURE_GATES[feature];
  if ('plans' in featureConfig) {
    return featureConfig.plans.includes(userPlan as any);
  }
  return false;
}

export function getDealLimit(plan: keyof typeof PLAN_TIERS): number | null {
  return PLAN_TIERS[plan].dealLimit;
}
