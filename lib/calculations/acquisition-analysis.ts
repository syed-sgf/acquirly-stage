/**
 * Business Acquisition Analysis - Core Calculation Library
 * 
 * This module contains all the business logic for analyzing business acquisitions.
 * All functions are pure (no side effects) and fully tested.
 * 
 * Used by:
 * - /pro route (public calculator)
 * - /app/deals/[dealId]/acquisition route (authenticated)
 * - PDF export generators
 * - API endpoints
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AcquisitionInputs {
  // Deal Basics
  dealName?: string;
  businessType?: string;
  
  // Purchase Structure
  purchasePrice: number;
  downPayment: number;
  sellerFinancing: number;
  sellerFinancingRate: number;
  sellerFinancingTerm: number;
  
  // Bank Loan (calculated)
  bankLoan: number;
  bankInterestRate: number;
  bankLoanTerm: number;
  
  // Business Financials
  annualRevenue: number;
  annualSDE: number;
  annualEBITDA: number;
  
  // Additional Costs
  workingCapital: number;
  closingCosts: number;
  ffeValue: number;
  inventoryValue: number;
  annualCapex: number;
  buyerSalary: number;
  
  // Projections
  revenueGrowth: number;
  expenseGrowth: number;
  exitTimeline: number;
}

export interface DebtServiceResults {
  monthlyBankPayment: number;
  monthlySellerPayment: number;
  annualDebtService: number;
  totalMonthlyPayment: number;
}

export interface ROIMetrics {
  totalCashInvested: number;
  annualPreTaxCashFlow: number;
  cashOnCashReturn: number;
  dscr: number;
  paybackPeriodYears: number;
  paybackPeriodMonths: number;
}

export interface MultiYearProjection {
  year: number;
  revenue: number;
  sde: number;
  debtService: number;
  capex: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  cumulativeROI: number;
  annualizedROI: number;
}

export interface EquityScheduleYear {
  year: number;
  businessValue: number;
  bankLoanBalance: number;
  sellerNoteBalance: number;
  totalDebt: number;
  ownerEquity: number;
  equityPercentage: number;
  principalPaidThisYear: number;
}

export interface ValuationMethod {
  method: string;
  value: number;
  vsAskPrice: number;
  vsAskPricePercent: number;
  assessment: 'undervalued' | 'fair' | 'overvalued';
}

export interface Scenario {
  name: string;
  description: string;
  inputs: Partial<AcquisitionInputs>;
  metrics: ROIMetrics;
  fiveYearROI: number;
  tenYearEquity: number;
}

export interface AcquisitionAnalysis {
  inputs: AcquisitionInputs;
  debtService: DebtServiceResults;
  roiMetrics: ROIMetrics;
  projections: MultiYearProjection[];
  equitySchedule: EquityScheduleYear[];
  valuations: ValuationMethod[];
  scenarios: Scenario[];
  breakEven: {
    revenueBreakEven: number;
    revenueSafetyMargin: number;
  };
  impliedMultiples: {
    sdeMultiple: number;
    ebitdaMultiple: number;
    revenueMultiple: number;
  };
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate monthly loan payment using standard amortization formula
 * PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  if (principal <= 0 || termYears <= 0) return 0;
  if (annualRate === 0) return principal / (termYears * 12);
  
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  
  const payment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  return Math.round(payment * 100) / 100;
}

/**
 * Calculate debt service (total loan payments)
 */
export function calculateDebtService(inputs: AcquisitionInputs): DebtServiceResults {
  const monthlyBankPayment = calculateMonthlyPayment(
    inputs.bankLoan,
    inputs.bankInterestRate,
    inputs.bankLoanTerm
  );
  
  const monthlySellerPayment = calculateMonthlyPayment(
    inputs.sellerFinancing,
    inputs.sellerFinancingRate,
    inputs.sellerFinancingTerm
  );
  
  const totalMonthlyPayment = monthlyBankPayment + monthlySellerPayment;
  const annualDebtService = totalMonthlyPayment * 12;
  
  return {
    monthlyBankPayment,
    monthlySellerPayment,
    annualDebtService,
    totalMonthlyPayment
  };
}

/**
 * Calculate ROI metrics
 */
export function calculateROIMetrics(
  inputs: AcquisitionInputs,
  debtService: DebtServiceResults
): ROIMetrics {
  const totalCashInvested = 
    inputs.downPayment + 
    inputs.workingCapital + 
    inputs.closingCosts;
  
  const annualPreTaxCashFlow = 
    inputs.annualSDE - 
    debtService.annualDebtService - 
    inputs.annualCapex -
    inputs.buyerSalary;
  
  const cashOnCashReturn = totalCashInvested > 0
    ? (annualPreTaxCashFlow / totalCashInvested) * 100
    : 0;
  
  const dscr = debtService.annualDebtService > 0
    ? inputs.annualSDE / debtService.annualDebtService
    : 0;
  
  const paybackPeriodYears = annualPreTaxCashFlow > 0
    ? totalCashInvested / annualPreTaxCashFlow
    : 0;
  
  const paybackPeriodMonths = paybackPeriodYears * 12;
  
  return {
    totalCashInvested,
    annualPreTaxCashFlow,
    cashOnCashReturn,
    dscr,
    paybackPeriodYears,
    paybackPeriodMonths
  };
}

/**
 * Calculate principal paid in a specific year
 */
function calculatePrincipalInYear(
  principal: number,
  annualRate: number,
  termYears: number,
  year: number
): number {
  if (year === 0) return 0;
  if (principal <= 0 || termYears <= 0) return 0;
  
  const monthlyRate = annualRate / 100 / 12;
  const totalPayments = termYears * 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate * 100, termYears);
  
  let balance = principal;
  let principalThisYear = 0;
  
  const startMonth = (year - 1) * 12 + 1;
  const endMonth = Math.min(year * 12, totalPayments);
  
  for (let month = 1; month <= endMonth; month++) {
    const interest = balance * monthlyRate;
    const principalPayment = monthlyPayment - interest;
    
    if (month >= startMonth && month <= endMonth) {
      principalThisYear += principalPayment;
    }
    
    balance -= principalPayment;
    if (balance <= 0) break;
  }
  
  return Math.max(0, principalThisYear);
}

/**
 * Generate multi-year projections
 */
export function generateProjections(
  inputs: AcquisitionInputs,
  debtService: DebtServiceResults
): MultiYearProjection[] {
  const projections: MultiYearProjection[] = [];
  const years = [1, 3, 5, 7, 10];
  
  let cumulativeCashFlow = 0;
  
  for (const year of years) {
    const revenue = inputs.annualRevenue * Math.pow(1 + inputs.revenueGrowth / 100, year);
    const sde = inputs.annualSDE * Math.pow(1 + inputs.revenueGrowth / 100, year);
    const capex = inputs.annualCapex * Math.pow(1 + inputs.expenseGrowth / 100, year);
    
    const netCashFlow = sde - debtService.annualDebtService - capex - inputs.buyerSalary;
    cumulativeCashFlow += netCashFlow;
    
    const cumulativeROI = ((cumulativeCashFlow / (inputs.downPayment + inputs.workingCapital + inputs.closingCosts)) * 100);
    const annualizedROI = cumulativeROI / year;
    
    projections.push({
      year,
      revenue: Math.round(revenue),
      sde: Math.round(sde),
      debtService: Math.round(debtService.annualDebtService),
      capex: Math.round(capex),
      netCashFlow: Math.round(netCashFlow),
      cumulativeCashFlow: Math.round(cumulativeCashFlow),
      cumulativeROI: Math.round(cumulativeROI * 100) / 100,
      annualizedROI: Math.round(annualizedROI * 100) / 100
    });
  }
  
  return projections;
}

/**
 * Generate equity build-up schedule
 */
export function generateEquitySchedule(inputs: AcquisitionInputs): EquityScheduleYear[] {
  const schedule: EquityScheduleYear[] = [];
  const years = Array.from({ length: inputs.exitTimeline + 1 }, (_, i) => i);
  
  let bankBalance = inputs.bankLoan;
  let sellerBalance = inputs.sellerFinancing;
  
  for (const year of years) {
    const businessValue = inputs.purchasePrice * Math.pow(1 + inputs.revenueGrowth / 100, year);
    
    const bankPrincipal = year > 0 
      ? calculatePrincipalInYear(inputs.bankLoan, inputs.bankInterestRate, inputs.bankLoanTerm, year)
      : 0;
    
    const sellerPrincipal = year > 0
      ? calculatePrincipalInYear(inputs.sellerFinancing, inputs.sellerFinancingRate, inputs.sellerFinancingTerm, year)
      : 0;
    
    if (year > 0) {
      bankBalance = Math.max(0, bankBalance - bankPrincipal);
      sellerBalance = Math.max(0, sellerBalance - sellerPrincipal);
    }
    
    const totalDebt = bankBalance + sellerBalance;
    const ownerEquity = Math.max(0, businessValue - totalDebt);
    const equityPercentage = businessValue > 0 ? (ownerEquity / businessValue) * 100 : 0;
    
    schedule.push({
      year,
      businessValue: Math.round(businessValue),
      bankLoanBalance: Math.round(bankBalance),
      sellerNoteBalance: Math.round(sellerBalance),
      totalDebt: Math.round(totalDebt),
      ownerEquity: Math.round(ownerEquity),
      equityPercentage: Math.round(equityPercentage * 100) / 100,
      principalPaidThisYear: Math.round(bankPrincipal + sellerPrincipal)
    });
  }
  
  return schedule;
}

/**
 * Industry valuation multiples
 */
const INDUSTRY_MULTIPLES: Record<string, { sde: number; ebitda: number; revenue: number }> = {
  restaurant: { sde: 2.5, ebitda: 4.0, revenue: 0.5 },
  retail: { sde: 2.0, ebitda: 3.5, revenue: 0.4 },
  manufacturing: { sde: 3.5, ebitda: 5.5, revenue: 0.7 },
  services: { sde: 3.0, ebitda: 5.0, revenue: 0.8 },
  healthcare: { sde: 4.0, ebitda: 6.0, revenue: 0.6 },
  technology: { sde: 4.5, ebitda: 7.0, revenue: 1.5 },
  realestate: { sde: 3.0, ebitda: 5.0, revenue: 0.5 },
  other: { sde: 2.5, ebitda: 4.0, revenue: 0.5 }
};

/**
 * Calculate valuations using multiple methods
 */
export function calculateValuations(inputs: AcquisitionInputs): ValuationMethod[] {
  const businessType = (inputs.businessType || 'other').toLowerCase().replace(/\s+/g, '');
  const multiples = INDUSTRY_MULTIPLES[businessType] || INDUSTRY_MULTIPLES.other;
  
  const valuations: ValuationMethod[] = [];
  
  // SDE Multiple
  const sdeValuation = inputs.annualSDE * multiples.sde;
  valuations.push({
    method: 'SDE Multiple',
    value: Math.round(sdeValuation),
    vsAskPrice: Math.round(sdeValuation - inputs.purchasePrice),
    vsAskPricePercent: Math.round(((sdeValuation - inputs.purchasePrice) / inputs.purchasePrice) * 100 * 100) / 100,
    assessment: getAssessment(sdeValuation, inputs.purchasePrice)
  });
  
  // EBITDA Multiple
  const ebitdaValuation = inputs.annualEBITDA * multiples.ebitda;
  valuations.push({
    method: 'EBITDA Multiple',
    value: Math.round(ebitdaValuation),
    vsAskPrice: Math.round(ebitdaValuation - inputs.purchasePrice),
    vsAskPricePercent: Math.round(((ebitdaValuation - inputs.purchasePrice) / inputs.purchasePrice) * 100 * 100) / 100,
    assessment: getAssessment(ebitdaValuation, inputs.purchasePrice)
  });
  
  // Revenue Multiple
  const revenueValuation = inputs.annualRevenue * multiples.revenue;
  valuations.push({
    method: 'Revenue Multiple',
    value: Math.round(revenueValuation),
    vsAskPrice: Math.round(revenueValuation - inputs.purchasePrice),
    vsAskPricePercent: Math.round(((revenueValuation - inputs.purchasePrice) / inputs.purchasePrice) * 100 * 100) / 100,
    assessment: getAssessment(revenueValuation, inputs.purchasePrice)
  });
  
  // Asset-Based
  const assetValuation = inputs.ffeValue + inputs.inventoryValue;
  valuations.push({
    method: 'Asset-Based',
    value: Math.round(assetValuation),
    vsAskPrice: Math.round(assetValuation - inputs.purchasePrice),
    vsAskPricePercent: Math.round(((assetValuation - inputs.purchasePrice) / inputs.purchasePrice) * 100 * 100) / 100,
    assessment: getAssessment(assetValuation, inputs.purchasePrice)
  });
  
  return valuations;
}

function getAssessment(valuation: number, askPrice: number): 'undervalued' | 'fair' | 'overvalued' {
  const diff = ((valuation - askPrice) / askPrice) * 100;
  if (diff > 10) return 'undervalued';
  if (diff < -10) return 'overvalued';
  return 'fair';
}

/**
 * Calculate implied multiples from purchase price
 */
export function calculateImpliedMultiples(inputs: AcquisitionInputs) {
  return {
    sdeMultiple: Math.round((inputs.purchasePrice / inputs.annualSDE) * 100) / 100,
    ebitdaMultiple: Math.round((inputs.purchasePrice / inputs.annualEBITDA) * 100) / 100,
    revenueMultiple: Math.round((inputs.purchasePrice / inputs.annualRevenue) * 100) / 100
  };
}

/**
 * Generate scenario analysis
 */
export function generateScenarios(
  baseInputs: AcquisitionInputs,
  baseMetrics: ROIMetrics
): Scenario[] {
  const scenarios: Scenario[] = [];
  
  // Base Case
  scenarios.push({
    name: 'Base Case',
    description: 'Using actual input values',
    inputs: {},
    metrics: baseMetrics,
    fiveYearROI: 0, // Will be calculated
    tenYearEquity: 0 // Will be calculated
  });
  
  // Best Case
  const bestInputs = {
    ...baseInputs,
    revenueGrowth: baseInputs.revenueGrowth * 1.5,
    expenseGrowth: baseInputs.expenseGrowth * 0.8
  };
  const bestDebtService = calculateDebtService(bestInputs);
  const bestMetrics = calculateROIMetrics(bestInputs, bestDebtService);
  
  scenarios.push({
    name: 'Best Case',
    description: '50% higher growth, 20% lower expenses',
    inputs: { revenueGrowth: bestInputs.revenueGrowth, expenseGrowth: bestInputs.expenseGrowth },
    metrics: bestMetrics,
    fiveYearROI: 0,
    tenYearEquity: 0
  });
  
  // Worst Case
  const worstInputs = {
    ...baseInputs,
    revenueGrowth: baseInputs.revenueGrowth * 0.5,
    expenseGrowth: baseInputs.expenseGrowth * 1.2
  };
  const worstDebtService = calculateDebtService(worstInputs);
  const worstMetrics = calculateROIMetrics(worstInputs, worstDebtService);
  
  scenarios.push({
    name: 'Worst Case',
    description: '50% lower growth, 20% higher expenses',
    inputs: { revenueGrowth: worstInputs.revenueGrowth, expenseGrowth: worstInputs.expenseGrowth },
    metrics: worstMetrics,
    fiveYearROI: 0,
    tenYearEquity: 0
  });
  
  // Higher Down Payment
  const higherDownInputs = {
    ...baseInputs,
    downPayment: baseInputs.downPayment * 1.25,
    bankLoan: baseInputs.bankLoan - (baseInputs.downPayment * 0.25)
  };
  const higherDownDebtService = calculateDebtService(higherDownInputs);
  const higherDownMetrics = calculateROIMetrics(higherDownInputs, higherDownDebtService);
  
  scenarios.push({
    name: 'Higher Down Payment',
    description: '25% larger down payment',
    inputs: { downPayment: higherDownInputs.downPayment, bankLoan: higherDownInputs.bankLoan },
    metrics: higherDownMetrics,
    fiveYearROI: 0,
    tenYearEquity: 0
  });
  
  return scenarios;
}

/**
 * Calculate break-even analysis
 */
export function calculateBreakEven(
  inputs: AcquisitionInputs,
  debtService: DebtServiceResults
) {
  const fixedCosts = debtService.annualDebtService + inputs.annualCapex + inputs.buyerSalary;
  const grossMargin = inputs.annualRevenue > 0 ? inputs.annualSDE / inputs.annualRevenue : 0;
  const revenueBreakEven = grossMargin > 0 ? fixedCosts / grossMargin : 0;
  const revenueSafetyMargin = inputs.annualRevenue > 0
    ? ((inputs.annualRevenue - revenueBreakEven) / inputs.annualRevenue) * 100
    : 0;
  
  return {
    revenueBreakEven: Math.round(revenueBreakEven),
    revenueSafetyMargin: Math.round(revenueSafetyMargin * 100) / 100
  };
}

/**
 * Main analysis function - orchestrates all calculations
 */
export function analyzeAcquisition(inputs: AcquisitionInputs): AcquisitionAnalysis {
  // Calculate debt service
  const debtService = calculateDebtService(inputs);
  
  // Calculate ROI metrics
  const roiMetrics = calculateROIMetrics(inputs, debtService);
  
  // Generate projections
  const projections = generateProjections(inputs, debtService);
  
  // Generate equity schedule
  const equitySchedule = generateEquitySchedule(inputs);
  
  // Calculate valuations
  const valuations = calculateValuations(inputs);
  
  // Generate scenarios
  const scenarios = generateScenarios(inputs, roiMetrics);
  
  // Calculate break-even
  const breakEven = calculateBreakEven(inputs, debtService);
  
  // Calculate implied multiples
  const impliedMultiples = calculateImpliedMultiples(inputs);
  
  return {
    inputs,
    debtService,
    roiMetrics,
    projections,
    equitySchedule,
    valuations,
    scenarios,
    breakEven,
    impliedMultiples
  };
}

/**
 * Validate inputs and return errors
 */
export function validateInputs(inputs: Partial<AcquisitionInputs>): string[] {
  const errors: string[] = [];
  
  if (!inputs.purchasePrice || inputs.purchasePrice <= 0) {
    errors.push('Purchase price must be greater than 0');
  }
  
  if (!inputs.downPayment || inputs.downPayment <= 0) {
    errors.push('Down payment must be greater than 0');
  }
  
  if (inputs.downPayment && inputs.purchasePrice && inputs.downPayment > inputs.purchasePrice) {
    errors.push('Down payment cannot exceed purchase price');
  }
  
  if (!inputs.annualRevenue || inputs.annualRevenue <= 0) {
    errors.push('Annual revenue must be greater than 0');
  }
  
  if (!inputs.annualSDE || inputs.annualSDE <= 0) {
    errors.push('Annual SDE must be greater than 0');
  }
  
  if (inputs.bankInterestRate && (inputs.bankInterestRate < 0 || inputs.bankInterestRate > 25)) {
    errors.push('Bank interest rate must be between 0% and 25%');
  }
  
  if (inputs.bankLoanTerm && (inputs.bankLoanTerm < 1 || inputs.bankLoanTerm > 30)) {
    errors.push('Bank loan term must be between 1 and 30 years');
  }
  
  return errors;
}
