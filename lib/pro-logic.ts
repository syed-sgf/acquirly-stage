export type YesNo = "yes" | "no";

export type DealAssumptions = {
  targetClosingDate?: string;
  askingOrOfferPrice: number;
  annualRevenue: number;
  annualCashFlow: number; // SDE or EBITDA
  ffeValue: number;
  ffeIncludedInAsking: YesNo;
  inventoryValue: number;
  inventoryIncludedInAsking: YesNo;
  realEstateValue: number;
  realEstateIncludedInAsking: YesNo;
  acquiringRealEstate: YesNo;
  annualRentsPaidToOwnerRE: number;
  purchasePriceOverride?: number | null;
};

export type BusinessAssumptions = {
  buyersMinimumSalary: number;
  workingCapitalRequirement: number;
  annualCapexMaintenance: number;
  annualCapexNewInvestments: number;
  expectedRevenueGrowthRate?: number; // Annual growth %
  notes1?: string;
  notes2?: string;
};

export type FinancingInputs = {
  buyerEquity: number;
  sellerFinancing: number;
  termLoan: number;
  revolvingLOC: number;
  closingCosts: number;
};

export type LenderAnalysisInputs = {
  interestRateTermLoanAPR: number;
  termYears: number;
  interestRateLOCAPR: number;
  locUtilizationPct: number;
  usesSDE: boolean;
};

export type ProInputs = {
  deal: DealAssumptions;
  biz: BusinessAssumptions;
  financing: FinancingInputs;
  lender: LenderAnalysisInputs;
};

export type ProDerived = {
  // Purchase Price
  purchasePrice: number;
  purchasePriceToSDEMultiple: number | null;
  purchasePriceToRevenueMultiple: number | null;

  // Sources & Uses
  sourcesTotal: number;
  usesDueToSellerBusinessFFEInv: number;
  usesDueToSellerRE: number;
  usesTotalDueToSeller: number;
  usesCashAtClosingToSeller: number;
  usesSellerFinancingFuture: number;
  usesWorkingCapital: number;
  usesClosingCosts: number;
  usesTotal: number;

  // Debt Service
  termLoanMonthlyPmt: number;
  termLoanAnnualDebtService: number;
  locAssumedAverageBalance: number;
  locAnnualInterestOnly: number;
  totalAnnualDebtService: number;

  // Cash Flow Analysis
  lendableCashFlowBeforeDebt: number;
  netCashFlowAfterDebt: number;
  dscr: number | null;

  // Return Metrics (NEW!)
  cashOnCashReturn: number | null; // Year 1 cash return / equity
  returnOnInvestment: number | null; // Net profit / total investment
  equityCaptureRate: number | null; // Equity / purchase price
  debtServiceCoverageRatio: number | null; // Same as DSCR but explicit
  
  // Additional Metrics (NEW!)
  totalCashRequired: number; // Equity + closing costs
  leverageRatio: number | null; // Total debt / equity
  breakEvenDSCR: number; // DSCR at break-even
  excessCashFlow: number; // Cash available after debt service
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function pmtMonthly(apr: number, nYears: number, principal: number) {
  if (principal <= 0 || nYears <= 0) return 0;
  const r = apr / 12;
  const n = Math.round(nYears * 12);
  if (r === 0) return principal / n;
  return (r * principal) / (1 - Math.pow(1 + r, -n));
}

export function computePurchasePrice(d: DealAssumptions) {
  let price = d.purchasePriceOverride ?? d.askingOrOfferPrice;
  if (d.ffeIncludedInAsking === "no") price += d.ffeValue;
  if (d.inventoryIncludedInAsking === "no") price += d.inventoryValue;
  if (d.realEstateIncludedInAsking === "no" && d.acquiringRealEstate === "yes")
    price += d.realEstateValue;
  return Math.max(0, price);
}

export function computePro(inputs: ProInputs): ProDerived {
  const { deal, biz, financing, lender } = inputs;

  // Purchase Price Calculations
  const purchasePrice = computePurchasePrice(deal);
  const sdeMultiple = deal.annualCashFlow > 0 ? purchasePrice / deal.annualCashFlow : null;
  const revenueMultiple = deal.annualRevenue > 0 ? purchasePrice / deal.annualRevenue : null;

  // Sources & Uses
  const usesDueToSellerBusinessFFEInv =
    (deal.ffeIncludedInAsking === "yes" ? 0 : deal.ffeValue) +
    (deal.inventoryIncludedInAsking === "yes" ? 0 : deal.inventoryValue) +
    (purchasePrice - (deal.acquiringRealEstate === "yes" ? deal.realEstateValue : 0));
  const usesDueToSellerRE = deal.acquiringRealEstate === "yes" ? deal.realEstateValue : 0;
  const usesTotalDueToSeller = usesDueToSellerBusinessFFEInv + usesDueToSellerRE;
  const usesSellerFinancingFuture = financing.sellerFinancing;
  const usesCashAtClosingToSeller = Math.max(0, usesTotalDueToSeller - usesSellerFinancingFuture);
  const usesWorkingCapital = biz.workingCapitalRequirement;
  const usesClosingCosts = financing.closingCosts;
  const usesTotal =
    usesCashAtClosingToSeller + usesSellerFinancingFuture + usesWorkingCapital + usesClosingCosts;
  const sourcesTotal =
    financing.buyerEquity + financing.sellerFinancing + financing.termLoan + financing.revolvingLOC;

  // Debt Service Calculations
  const termLoanMonthlyPmt = pmtMonthly(
    lender.interestRateTermLoanAPR,
    lender.termYears,
    financing.termLoan
  );
  const termLoanAnnualDebtService = termLoanMonthlyPmt * 12;
  const util = clamp(lender.locUtilizationPct ?? 0, 0, 1);
  const locAssumedAverageBalance = financing.revolvingLOC * util;
  const locAnnualInterestOnly = locAssumedAverageBalance * lender.interestRateLOCAPR;
  const totalAnnualDebtService = termLoanAnnualDebtService + locAnnualInterestOnly;

  // Cash Flow Analysis
  const baseCF = deal.annualCashFlow;
  const lendableCF =
    baseCF -
    biz.buyersMinimumSalary -
    (biz.annualCapexMaintenance + biz.annualCapexNewInvestments) +
    (deal.annualRentsPaidToOwnerRE || 0);
  const netCF = lendableCF - totalAnnualDebtService;
  const dscr = totalAnnualDebtService > 0 ? lendableCF / totalAnnualDebtService : null;

  // NEW: Return Metrics
  const cashOnCashReturn = financing.buyerEquity > 0 ? netCF / financing.buyerEquity : null;
  
  const totalInvestment = financing.buyerEquity + financing.closingCosts;
  const returnOnInvestment = totalInvestment > 0 ? netCF / totalInvestment : null;
  
  const equityCaptureRate = purchasePrice > 0 ? financing.buyerEquity / purchasePrice : null;
  
  const totalCashRequired = financing.buyerEquity + financing.closingCosts;
  
  const totalDebt = financing.termLoan + financing.revolvingLOC + financing.sellerFinancing;
  const leverageRatio = financing.buyerEquity > 0 ? totalDebt / financing.buyerEquity : null;
  
  const breakEvenDSCR = 1.0; // Standard break-even
  
  const excessCashFlow = netCF; // Cash available after all debt service

  return {
    // Purchase Price
    purchasePrice,
    purchasePriceToSDEMultiple: sdeMultiple,
    purchasePriceToRevenueMultiple: revenueMultiple,

    // Sources & Uses
    sourcesTotal,
    usesDueToSellerBusinessFFEInv,
    usesDueToSellerRE,
    usesTotalDueToSeller,
    usesCashAtClosingToSeller,
    usesSellerFinancingFuture,
    usesWorkingCapital,
    usesClosingCosts,
    usesTotal,

    // Debt Service
    termLoanMonthlyPmt,
    termLoanAnnualDebtService,
    locAssumedAverageBalance,
    locAnnualInterestOnly,
    totalAnnualDebtService,

    // Cash Flow
    lendableCashFlowBeforeDebt: lendableCF,
    netCashFlowAfterDebt: netCF,
    dscr,

    // Return Metrics
    cashOnCashReturn,
    returnOnInvestment,
    equityCaptureRate,
    debtServiceCoverageRatio: dscr,
    
    // Additional Metrics
    totalCashRequired,
    leverageRatio,
    breakEvenDSCR,
    excessCashFlow,
  };
}

// Helper function to format percentages
export function formatPercent(value: number | null, decimals: number = 2): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(decimals)}%`;
}
