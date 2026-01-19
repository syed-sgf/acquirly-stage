// ACQUIRELY - Business Acquisition Analysis Engine
// Complete calculation library matching Technical Specification

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface AcquisitionInputs {
  // Deal Identification
  dealName: string;
  businessType: BusinessType;
  
  // Purchase Structure
  purchasePrice: number;
  downPayment: number;
  sellerFinancing: number;
  sellerFinancingRate: number;
  sellerFinancingTerm: number;
  bankLoanRate: number;
  bankLoanTerm: number;
  
  // Business Financials
  annualRevenue: number;
  annualSDE: number;
  annualEBITDA: number;
  
  // Additional Parameters
  workingCapital: number;
  closingCosts: number;
  ffeValue: number;
  inventoryValue: number;
  annualCapex: number;
  buyerSalary: number;
  
  // Projections
  revenueGrowthRate: number;
  expenseGrowthRate: number;
  exitTimeline: number;
}

export type BusinessType = 
  | 'restaurant'
  | 'retail'
  | 'manufacturing'
  | 'services'
  | 'healthcare'
  | 'technology'
  | 'real_estate'
  | 'other';

export interface CalculatedMetrics {
  // Derived Values
  downPaymentPercent: number;
  bankLoan: number;
  totalCashInvested: number;
  
  // Debt Service
  monthlyBankPayment: number;
  monthlySellerPayment: number;
  annualDebtService: number;
  
  // ROI Metrics
  annualPreTaxCashFlow: number;
  cashOnCashReturn: number;
  dscr: number;
  dscrRating: 'excellent' | 'good' | 'marginal' | 'insufficient';
  paybackPeriodYears: number;
  paybackPeriodMonths: number;
  
  // Multi-Year ROI
  multiYearROI: MultiYearROI[];
  
  // Equity Schedule
  equitySchedule: EquityYearData[];
  
  // Valuations
  valuations: ValuationResults;
  
  // Scenarios
  scenarios: ScenarioResults;
}

export interface MultiYearROI {
  year: number;
  annualCashFlow: number;
  cumulativeCashFlow: number;
  cumulativeROI: number;
  annualizedROI: number;
}

export interface EquityYearData {
  year: number;
  businessValue: number;
  bankLoanBalance: number;
  sellerNoteBalance: number;
  totalDebt: number;
  ownerEquity: number;
  equityPercent: number;
  principalPaidBank: number;
  principalPaidSeller: number;
  interestPaidBank: number;
  interestPaidSeller: number;
}

export interface ValuationResults {
  sdeMultiple: ValuationMethod;
  ebitdaMultiple: ValuationMethod;
  revenueMultiple: ValuationMethod;
  assetBased: ValuationMethod;
  impliedSdeMultiple: number;
  impliedEbitdaMultiple: number;
  impliedRevenueMultiple: number;
}

export interface ValuationMethod {
  value: number;
  multiple: number;
  industryBenchmark: number;
  vsPurchasePrice: number;
  vsPurchasePricePercent: number;
  assessment: 'undervalued' | 'fair' | 'overvalued';
}

export interface ScenarioResults {
  baseCase: ScenarioData;
  bestCase: ScenarioData;
  worstCase: ScenarioData;
  higherDownPayment: ScenarioData;
  sensitivityAnalysis: SensitivityPoint[];
  breakEven: BreakEvenAnalysis;
}

export interface ScenarioData {
  name: string;
  assumptions: {
    revenueGrowth: number;
    expenseGrowth: number;
    downPayment: number;
  };
  cashOnCashReturn: number;
  fiveYearReturn: number;
  tenYearEquity: number;
  dscr: number;
}

export interface SensitivityPoint {
  revenueChangePercent: number;
  annualCashFlow: number;
  cashOnCashReturn: number;
}

export interface BreakEvenAnalysis {
  paybackYears: number;
  paybackMonths: number;
  breakEvenRevenue: number;
  currentRevenue: number;
  safetyMarginPercent: number;
}

// ============================================
// INDUSTRY MULTIPLES
// ============================================

export const INDUSTRY_MULTIPLES: Record<BusinessType, {
  sde: number;
  ebitda: number;
  revenue: number;
  description: string;
}> = {
  restaurant: { sde: 2.5, ebitda: 4.0, revenue: 0.5, description: 'Restaurant/Food Service' },
  retail: { sde: 2.0, ebitda: 3.5, revenue: 0.4, description: 'Retail' },
  manufacturing: { sde: 3.5, ebitda: 5.5, revenue: 0.7, description: 'Manufacturing' },
  services: { sde: 3.0, ebitda: 5.0, revenue: 0.8, description: 'Professional Services' },
  healthcare: { sde: 4.0, ebitda: 6.0, revenue: 0.6, description: 'Healthcare' },
  technology: { sde: 4.5, ebitda: 7.0, revenue: 1.5, description: 'Technology' },
  real_estate: { sde: 3.0, ebitda: 5.0, revenue: 0.5, description: 'Real Estate' },
  other: { sde: 2.5, ebitda: 4.0, revenue: 0.5, description: 'Other/General' },
};

// ============================================
// CORE CALCULATION FUNCTIONS
// ============================================

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
  if (annualRate <= 0) return principal / (termYears * 12);
  
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  
  const payment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  return payment;
}

/**
 * Calculate principal paid in a specific year
 */
export function calculatePrincipalInYear(
  principal: number,
  annualRate: number,
  termYears: number,
  year: number
): number {
  if (year <= 0 || principal <= 0 || termYears <= 0) return 0;
  if (year > termYears) return 0;
  
  const monthlyRate = annualRate / 100 / 12;
  const totalPayments = termYears * 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears);
  
  let balance = principal;
  let principalThisYear = 0;
  
  const startMonth = (year - 1) * 12 + 1;
  const endMonth = Math.min(year * 12, totalPayments);
  
  // Simulate payments up to the start of this year
  for (let month = 1; month < startMonth && balance > 0; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
  }
  
  // Calculate principal paid this year
  for (let month = startMonth; month <= endMonth && balance > 0; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = Math.min(monthlyPayment - interestPayment, balance);
    principalThisYear += principalPayment;
    balance -= principalPayment;
  }
  
  return principalThisYear;
}

/**
 * Calculate interest paid in a specific year
 */
export function calculateInterestInYear(
  principal: number,
  annualRate: number,
  termYears: number,
  year: number
): number {
  if (year <= 0 || principal <= 0 || termYears <= 0) return 0;
  if (year > termYears) return 0;
  
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears);
  const principalPaid = calculatePrincipalInYear(principal, annualRate, termYears, year);
  
  // Total payments in the year minus principal = interest
  const paymentsInYear = year <= termYears ? 12 : Math.max(0, (termYears * 12) - ((year - 1) * 12));
  const totalPayments = monthlyPayment * Math.min(12, paymentsInYear);
  
  return Math.max(0, totalPayments - principalPaid);
}

/**
 * Calculate remaining loan balance at end of year
 */
export function calculateLoanBalance(
  principal: number,
  annualRate: number,
  termYears: number,
  afterYear: number
): number {
  if (principal <= 0 || termYears <= 0 || afterYear <= 0) return principal;
  if (afterYear >= termYears) return 0;
  
  let balance = principal;
  for (let year = 1; year <= afterYear; year++) {
    const principalPaid = calculatePrincipalInYear(principal, annualRate, termYears, year);
    balance -= principalPaid;
  }
  
  return Math.max(0, balance);
}

/**
 * Get DSCR rating based on value
 */
export function getDSCRRating(dscr: number): 'excellent' | 'good' | 'marginal' | 'insufficient' {
  if (dscr >= 1.35) return 'excellent';
  if (dscr >= 1.25) return 'good';
  if (dscr >= 1.0) return 'marginal';
  return 'insufficient';
}

/**
 * Get Cash-on-Cash rating
 */
export function getCashOnCashRating(coc: number): 'excellent' | 'very_good' | 'good' | 'fair' | 'poor' {
  if (coc >= 20) return 'excellent';
  if (coc >= 15) return 'very_good';
  if (coc >= 10) return 'good';
  if (coc >= 5) return 'fair';
  return 'poor';
}

/**
 * Get valuation assessment
 */
export function getValuationAssessment(
  valuationDiffPercent: number
): 'undervalued' | 'fair' | 'overvalued' {
  if (valuationDiffPercent > 10) return 'undervalued';
  if (valuationDiffPercent > -10) return 'fair';
  return 'overvalued';
}

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================

export function calculateAcquisitionAnalysis(inputs: AcquisitionInputs): CalculatedMetrics {
  // ---- DERIVED VALUES ----
  const downPaymentPercent = inputs.purchasePrice > 0 
    ? (inputs.downPayment / inputs.purchasePrice) * 100 
    : 0;
  
  const bankLoan = Math.max(0, inputs.purchasePrice - inputs.downPayment - inputs.sellerFinancing);
  const totalCashInvested = inputs.downPayment + inputs.workingCapital + inputs.closingCosts;
  
  // ---- DEBT SERVICE ----
  const monthlyBankPayment = calculateMonthlyPayment(bankLoan, inputs.bankLoanRate, inputs.bankLoanTerm);
  const monthlySellerPayment = calculateMonthlyPayment(
    inputs.sellerFinancing, 
    inputs.sellerFinancingRate, 
    inputs.sellerFinancingTerm
  );
  const annualDebtService = (monthlyBankPayment + monthlySellerPayment) * 12;
  
  // ---- ROI METRICS ----
  const annualPreTaxCashFlow = inputs.annualSDE - annualDebtService - inputs.annualCapex - inputs.buyerSalary;
  const cashOnCashReturn = totalCashInvested > 0 
    ? (annualPreTaxCashFlow / totalCashInvested) * 100 
    : 0;
  
  const dscr = annualDebtService > 0 ? inputs.annualSDE / annualDebtService : 999;
  const dscrRating = getDSCRRating(dscr);
  
  const paybackPeriodYears = annualPreTaxCashFlow > 0 
    ? totalCashInvested / annualPreTaxCashFlow 
    : 999;
  const paybackPeriodMonths = paybackPeriodYears * 12;
  
  // ---- MULTI-YEAR ROI ----
  const multiYearROI = calculateMultiYearROI(inputs, totalCashInvested, annualDebtService);
  
  // ---- EQUITY SCHEDULE ----
  const equitySchedule = calculateEquitySchedule(inputs, bankLoan);
  
  // ---- VALUATIONS ----
  const valuations = calculateValuations(inputs);
  
  // ---- SCENARIOS ----
  const scenarios = calculateScenarios(inputs, totalCashInvested, annualDebtService);
  
  return {
    downPaymentPercent,
    bankLoan,
    totalCashInvested,
    monthlyBankPayment,
    monthlySellerPayment,
    annualDebtService,
    annualPreTaxCashFlow,
    cashOnCashReturn,
    dscr,
    dscrRating,
    paybackPeriodYears,
    paybackPeriodMonths,
    multiYearROI,
    equitySchedule,
    valuations,
    scenarios,
  };
}

// ============================================
// MULTI-YEAR ROI CALCULATIONS
// ============================================

function calculateMultiYearROI(
  inputs: AcquisitionInputs,
  totalCashInvested: number,
  annualDebtService: number
): MultiYearROI[] {
  const years = [1, 3, 5, 7, 10];
  const results: MultiYearROI[] = [];
  let cumulativeCashFlow = 0;
  
  for (let y = 1; y <= 10; y++) {
    // Project SDE with growth
    const yearSDE = inputs.annualSDE * Math.pow(1 + inputs.revenueGrowthRate / 100, y);
    const yearCashFlow = yearSDE - annualDebtService - inputs.annualCapex - inputs.buyerSalary;
    cumulativeCashFlow += yearCashFlow;
    
    if (years.includes(y)) {
      const cumulativeROI = totalCashInvested > 0 
        ? (cumulativeCashFlow / totalCashInvested) * 100 
        : 0;
      const annualizedROI = cumulativeROI / y;
      
      results.push({
        year: y,
        annualCashFlow: yearCashFlow,
        cumulativeCashFlow,
        cumulativeROI,
        annualizedROI,
      });
    }
  }
  
  return results;
}

// ============================================
// EQUITY SCHEDULE CALCULATIONS
// ============================================

function calculateEquitySchedule(
  inputs: AcquisitionInputs,
  bankLoan: number
): EquityYearData[] {
  const schedule: EquityYearData[] = [];
  
  // Year 0 - Acquisition
  schedule.push({
    year: 0,
    businessValue: inputs.purchasePrice,
    bankLoanBalance: bankLoan,
    sellerNoteBalance: inputs.sellerFinancing,
    totalDebt: bankLoan + inputs.sellerFinancing,
    ownerEquity: inputs.downPayment,
    equityPercent: inputs.purchasePrice > 0 ? (inputs.downPayment / inputs.purchasePrice) * 100 : 0,
    principalPaidBank: 0,
    principalPaidSeller: 0,
    interestPaidBank: 0,
    interestPaidSeller: 0,
  });
  
  // Years 1 through exit timeline
  for (let year = 1; year <= inputs.exitTimeline; year++) {
    const prevYear = schedule[year - 1];
    
    // Business value appreciation
    const businessValue = inputs.purchasePrice * Math.pow(1 + inputs.revenueGrowthRate / 100, year);
    
    // Loan balances
    const bankLoanBalance = calculateLoanBalance(bankLoan, inputs.bankLoanRate, inputs.bankLoanTerm, year);
    const sellerNoteBalance = calculateLoanBalance(
      inputs.sellerFinancing, 
      inputs.sellerFinancingRate, 
      inputs.sellerFinancingTerm, 
      year
    );
    
    // Principal and interest paid this year
    const principalPaidBank = calculatePrincipalInYear(bankLoan, inputs.bankLoanRate, inputs.bankLoanTerm, year);
    const principalPaidSeller = calculatePrincipalInYear(
      inputs.sellerFinancing, 
      inputs.sellerFinancingRate, 
      inputs.sellerFinancingTerm, 
      year
    );
    const interestPaidBank = calculateInterestInYear(bankLoan, inputs.bankLoanRate, inputs.bankLoanTerm, year);
    const interestPaidSeller = calculateInterestInYear(
      inputs.sellerFinancing, 
      inputs.sellerFinancingRate, 
      inputs.sellerFinancingTerm, 
      year
    );
    
    const totalDebt = bankLoanBalance + sellerNoteBalance;
    const ownerEquity = businessValue - totalDebt;
    const equityPercent = businessValue > 0 ? (ownerEquity / businessValue) * 100 : 0;
    
    schedule.push({
      year,
      businessValue,
      bankLoanBalance,
      sellerNoteBalance,
      totalDebt,
      ownerEquity,
      equityPercent,
      principalPaidBank,
      principalPaidSeller,
      interestPaidBank,
      interestPaidSeller,
    });
  }
  
  return schedule;
}

// ============================================
// VALUATION CALCULATIONS
// ============================================

function calculateValuations(inputs: AcquisitionInputs): ValuationResults {
  const industryMultiples = INDUSTRY_MULTIPLES[inputs.businessType];
  
  // SDE Multiple Valuation
  const sdeValue = inputs.annualSDE * industryMultiples.sde;
  const sdeVsPurchase = sdeValue - inputs.purchasePrice;
  const sdeVsPurchasePercent = inputs.purchasePrice > 0 ? (sdeVsPurchase / inputs.purchasePrice) * 100 : 0;
  
  // EBITDA Multiple Valuation
  const ebitdaValue = inputs.annualEBITDA * industryMultiples.ebitda;
  const ebitdaVsPurchase = ebitdaValue - inputs.purchasePrice;
  const ebitdaVsPurchasePercent = inputs.purchasePrice > 0 ? (ebitdaVsPurchase / inputs.purchasePrice) * 100 : 0;
  
  // Revenue Multiple Valuation
  const revenueValue = inputs.annualRevenue * industryMultiples.revenue;
  const revenueVsPurchase = revenueValue - inputs.purchasePrice;
  const revenueVsPurchasePercent = inputs.purchasePrice > 0 ? (revenueVsPurchase / inputs.purchasePrice) * 100 : 0;
  
  // Asset-Based Valuation
  const assetValue = inputs.ffeValue + inputs.inventoryValue;
  const assetVsPurchase = assetValue - inputs.purchasePrice;
  const assetVsPurchasePercent = inputs.purchasePrice > 0 ? (assetVsPurchase / inputs.purchasePrice) * 100 : 0;
  
  // Implied Multiples
  const impliedSdeMultiple = inputs.annualSDE > 0 ? inputs.purchasePrice / inputs.annualSDE : 0;
  const impliedEbitdaMultiple = inputs.annualEBITDA > 0 ? inputs.purchasePrice / inputs.annualEBITDA : 0;
  const impliedRevenueMultiple = inputs.annualRevenue > 0 ? inputs.purchasePrice / inputs.annualRevenue : 0;
  
  return {
    sdeMultiple: {
      value: sdeValue,
      multiple: industryMultiples.sde,
      industryBenchmark: industryMultiples.sde,
      vsPurchasePrice: sdeVsPurchase,
      vsPurchasePricePercent: sdeVsPurchasePercent,
      assessment: getValuationAssessment(sdeVsPurchasePercent),
    },
    ebitdaMultiple: {
      value: ebitdaValue,
      multiple: industryMultiples.ebitda,
      industryBenchmark: industryMultiples.ebitda,
      vsPurchasePrice: ebitdaVsPurchase,
      vsPurchasePricePercent: ebitdaVsPurchasePercent,
      assessment: getValuationAssessment(ebitdaVsPurchasePercent),
    },
    revenueMultiple: {
      value: revenueValue,
      multiple: industryMultiples.revenue,
      industryBenchmark: industryMultiples.revenue,
      vsPurchasePrice: revenueVsPurchase,
      vsPurchasePricePercent: revenueVsPurchasePercent,
      assessment: getValuationAssessment(revenueVsPurchasePercent),
    },
    assetBased: {
      value: assetValue,
      multiple: 1,
      industryBenchmark: 1,
      vsPurchasePrice: assetVsPurchase,
      vsPurchasePricePercent: assetVsPurchasePercent,
      assessment: getValuationAssessment(assetVsPurchasePercent),
    },
    impliedSdeMultiple,
    impliedEbitdaMultiple,
    impliedRevenueMultiple,
  };
}

// ============================================
// SCENARIO CALCULATIONS
// ============================================

function calculateScenarios(
  inputs: AcquisitionInputs,
  totalCashInvested: number,
  baseAnnualDebtService: number
): ScenarioResults {
  // Base Case
  const baseCase = calculateScenarioData('Base Case', inputs, totalCashInvested, baseAnnualDebtService, {
    revenueGrowth: inputs.revenueGrowthRate,
    expenseGrowth: inputs.expenseGrowthRate,
    downPayment: inputs.downPayment,
  });
  
  // Best Case - 50% higher revenue growth, 20% lower expense growth
  const bestCase = calculateScenarioData('Best Case', inputs, totalCashInvested, baseAnnualDebtService, {
    revenueGrowth: inputs.revenueGrowthRate * 1.5,
    expenseGrowth: inputs.expenseGrowthRate * 0.8,
    downPayment: inputs.downPayment,
  });
  
  // Worst Case - 50% lower revenue growth, 20% higher expense growth
  const worstCase = calculateScenarioData('Worst Case', inputs, totalCashInvested, baseAnnualDebtService, {
    revenueGrowth: inputs.revenueGrowthRate * 0.5,
    expenseGrowth: inputs.expenseGrowthRate * 1.2,
    downPayment: inputs.downPayment,
  });
  
  // Higher Down Payment - 25% more equity
  const higherDP = inputs.downPayment * 1.25;
  const higherDPBankLoan = Math.max(0, inputs.purchasePrice - higherDP - inputs.sellerFinancing);
  const higherDPMonthlyPayment = calculateMonthlyPayment(higherDPBankLoan, inputs.bankLoanRate, inputs.bankLoanTerm);
  const higherDPSellerPayment = calculateMonthlyPayment(inputs.sellerFinancing, inputs.sellerFinancingRate, inputs.sellerFinancingTerm);
  const higherDPAnnualDebt = (higherDPMonthlyPayment + higherDPSellerPayment) * 12;
  const higherDPCashInvested = higherDP + inputs.workingCapital + inputs.closingCosts;
  
  const higherDownPayment = calculateScenarioData('Higher Down Payment', inputs, higherDPCashInvested, higherDPAnnualDebt, {
    revenueGrowth: inputs.revenueGrowthRate,
    expenseGrowth: inputs.expenseGrowthRate,
    downPayment: higherDP,
  });
  
  // Sensitivity Analysis
  const sensitivityAnalysis = calculateSensitivityAnalysis(inputs, totalCashInvested, baseAnnualDebtService);
  
  // Break-Even Analysis
  const breakEven = calculateBreakEven(inputs, totalCashInvested, baseAnnualDebtService);
  
  return {
    baseCase,
    bestCase,
    worstCase,
    higherDownPayment,
    sensitivityAnalysis,
    breakEven,
  };
}

function calculateScenarioData(
  name: string,
  inputs: AcquisitionInputs,
  cashInvested: number,
  annualDebtService: number,
  assumptions: { revenueGrowth: number; expenseGrowth: number; downPayment: number }
): ScenarioData {
  // Year 1 cash flow
  const year1CashFlow = inputs.annualSDE - annualDebtService - inputs.annualCapex - inputs.buyerSalary;
  const cashOnCashReturn = cashInvested > 0 ? (year1CashFlow / cashInvested) * 100 : 0;
  
  // 5-year cumulative return
  let cumulative5 = 0;
  for (let y = 1; y <= 5; y++) {
    const yearSDE = inputs.annualSDE * Math.pow(1 + assumptions.revenueGrowth / 100, y);
    cumulative5 += yearSDE - annualDebtService - inputs.annualCapex - inputs.buyerSalary;
  }
  const fiveYearReturn = cashInvested > 0 ? (cumulative5 / cashInvested) * 100 : 0;
  
  // 10-year equity position
  const bankLoan = inputs.purchasePrice - assumptions.downPayment - inputs.sellerFinancing;
  const businessValue10 = inputs.purchasePrice * Math.pow(1 + assumptions.revenueGrowth / 100, 10);
  const bankBalance10 = calculateLoanBalance(bankLoan, inputs.bankLoanRate, inputs.bankLoanTerm, 10);
  const sellerBalance10 = calculateLoanBalance(inputs.sellerFinancing, inputs.sellerFinancingRate, inputs.sellerFinancingTerm, 10);
  const tenYearEquity = businessValue10 - bankBalance10 - sellerBalance10;
  
  // DSCR
  const dscr = annualDebtService > 0 ? inputs.annualSDE / annualDebtService : 999;
  
  return {
    name,
    assumptions,
    cashOnCashReturn,
    fiveYearReturn,
    tenYearEquity,
    dscr,
  };
}

function calculateSensitivityAnalysis(
  inputs: AcquisitionInputs,
  totalCashInvested: number,
  annualDebtService: number
): SensitivityPoint[] {
  const revenueChanges = [-20, -10, 0, 10, 20, 30];
  
  return revenueChanges.map(changePercent => {
    const adjustedSDE = inputs.annualSDE * (1 + changePercent / 100);
    const cashFlow = adjustedSDE - annualDebtService - inputs.annualCapex - inputs.buyerSalary;
    const coc = totalCashInvested > 0 ? (cashFlow / totalCashInvested) * 100 : 0;
    
    return {
      revenueChangePercent: changePercent,
      annualCashFlow: cashFlow,
      cashOnCashReturn: coc,
    };
  });
}

function calculateBreakEven(
  inputs: AcquisitionInputs,
  totalCashInvested: number,
  annualDebtService: number
): BreakEvenAnalysis {
  const annualCashFlow = inputs.annualSDE - annualDebtService - inputs.annualCapex - inputs.buyerSalary;
  
  const paybackYears = annualCashFlow > 0 ? totalCashInvested / annualCashFlow : 999;
  const paybackMonths = paybackYears * 12;
  
  // Revenue break-even
  const fixedCosts = annualDebtService + inputs.annualCapex + inputs.buyerSalary;
  const grossMargin = inputs.annualRevenue > 0 ? inputs.annualSDE / inputs.annualRevenue : 0;
  const breakEvenRevenue = grossMargin > 0 ? fixedCosts / grossMargin : 0;
  
  const safetyMarginPercent = inputs.annualRevenue > 0 
    ? ((inputs.annualRevenue - breakEvenRevenue) / inputs.annualRevenue) * 100 
    : 0;
  
  return {
    paybackYears,
    paybackMonths,
    breakEvenRevenue,
    currentRevenue: inputs.annualRevenue,
    safetyMarginPercent,
  };
}

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_INPUTS: AcquisitionInputs = {
  dealName: '',
  businessType: 'services',
  purchasePrice: 500000,
  downPayment: 100000,
  sellerFinancing: 50000,
  sellerFinancingRate: 6.0,
  sellerFinancingTerm: 5,
  bankLoanRate: 7.5,
  bankLoanTerm: 10,
  annualRevenue: 800000,
  annualSDE: 150000,
  annualEBITDA: 120000,
  workingCapital: 25000,
  closingCosts: 15000,
  ffeValue: 75000,
  inventoryValue: 30000,
  annualCapex: 10000,
  buyerSalary: 0,
  revenueGrowthRate: 5,
  expenseGrowthRate: 3,
  exitTimeline: 10,
};

// ============================================
// FORMATTING UTILITIES
// ============================================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatMultiple(value: number): string {
  return `${value.toFixed(2)}x`;
}

export function formatYears(years: number): string {
  if (years >= 999) return 'N/A';
  const wholeYears = Math.floor(years);
  const months = Math.round((years - wholeYears) * 12);
  if (months === 0) return `${wholeYears} years`;
  return `${wholeYears} years, ${months} months`;
}

// Type alias for backwards compatibility
export type AcquisitionAnalysis = CalculatedMetrics;


