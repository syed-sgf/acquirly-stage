export type YesNo="yes"|"no";
export type DealAssumptions={targetClosingDate?:string;askingOrOfferPrice:number;annualRevenue:number;annualCashFlow:number;ffeValue:number;ffeIncludedInAsking:YesNo;inventoryValue:number;inventoryIncludedInAsking:YesNo;realEstateValue:number;realEstateIncludedInAsking:YesNo;acquiringRealEstate:YesNo;annualRentsPaidToOwnerRE:number;purchasePriceOverride?:number|null;};
export type BusinessAssumptions={buyersMinimumSalary:number;workingCapitalRequirement:number;annualCapexMaintenance:number;annualCapexNewInvestments:number;notes1?:string;notes2?:string;};
export type FinancingInputs={buyerEquity:number;sellerFinancing:number;termLoan:number;revolvingLOC:number;closingCosts:number;};
export type LenderAnalysisInputs={interestRateTermLoanAPR:number;termYears:number;interestRateLOCAPR:number;locUtilizationPct:number;usesSDE:boolean;};
export type ProInputs={deal:DealAssumptions;biz:BusinessAssumptions;financing:FinancingInputs;lender:LenderAnalysisInputs;};
export type ProDerived={purchasePrice:number;purchasePriceToSDEMultiple:number|null;purchasePriceToRevenueMultiple:number|null;sourcesTotal:number;usesDueToSellerBusinessFFEInv:number;usesDueToSellerRE:number;usesTotalDueToSeller:number;usesCashAtClosingToSeller:number;usesSellerFinancingFuture:number;usesWorkingCapital:number;usesClosingCosts:number;usesTotal:number;termLoanMonthlyPmt:number;termLoanAnnualDebtService:number;locAssumedAverageBalance:number;locAnnualInterestOnly:number;totalAnnualDebtService:number;lendableCashFlowBeforeDebt:number;netCashFlowAfterDebt:number;dscr:number|null;};
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
export function pmtMonthly(apr:number,nYears:number,principal:number){ if(principal<=0||nYears<=0)return 0; const r=apr/12; const n=Math.round(nYears*12); if(r===0)return principal/n; return (r*principal)/(1-Math.pow(1+r,-n)); }
export function computePurchasePrice(d:DealAssumptions){ let price=d.purchasePriceOverride??d.askingOrOfferPrice; if(d.ffeIncludedInAsking==="no")price+=d.ffeValue; if(d.inventoryIncludedInAsking==="no")price+=d.inventoryValue; if(d.realEstateIncludedInAsking==="no"&&d.acquiringRealEstate==="yes")price+=d.realEstateValue; return Math.max(0,price); }
export function computePro(inputs:ProInputs):ProDerived{
  const{deal,biz,financing,lender}=inputs;
  const purchasePrice=computePurchasePrice(deal);
  const sdeMultiple=deal.annualCashFlow>0?purchasePrice/deal.annualCashFlow:null;
  const revenueMultiple=deal.annualRevenue>0?purchasePrice/deal.annualRevenue:null;
  const usesDueToSellerBusinessFFEInv=(deal.ffeIncludedInAsking==="yes"?0:deal.ffeValue)+(deal.inventoryIncludedInAsking==="yes"?0:deal.inventoryValue)+(purchasePrice-(deal.acquiringRealEstate==="yes"?deal.realEstateValue:0));
  const usesDueToSellerRE=deal.acquiringRealEstate==="yes"?deal.realEstateValue:0;
  const usesTotalDueToSeller=usesDueToSellerBusinessFFEInv+usesDueToSellerRE;
  const usesSellerFinancingFuture=financing.sellerFinancing;
  const usesCashAtClosingToSeller=Math.max(0,usesTotalDueToSeller-usesSellerFinancingFuture);
  const usesWorkingCapital=biz.workingCapitalRequirement;
  const usesClosingCosts=financing.closingCosts;
  const usesTotal=usesCashAtClosingToSeller+usesSellerFinancingFuture+usesWorkingCapital+usesClosingCosts;
  const sourcesTotal=financing.buyerEquity+financing.sellerFinancing+financing.termLoan+financing.revolvingLOC;
  const termLoanMonthlyPmt=pmtMonthly(lender.interestRateTermLoanAPR,lender.termYears,financing.termLoan);
  const termLoanAnnualDebtService=termLoanMonthlyPmt*12;
  const util=clamp(lender.locUtilizationPct??0,0,1);
  const locAssumedAverageBalance=financing.revolvingLOC*util;
  const locAnnualInterestOnly=locAssumedAverageBalance*lender.interestRateLOCAPR;
  const totalAnnualDebtService=termLoanAnnualDebtService+locAnnualInterestOnly;
  const baseCF=deal.annualCashFlow;
  const lendableCF=baseCF-biz.buyersMinimumSalary-(biz.annualCapexMaintenance+biz.annualCapexNewInvestments)+(deal.annualRentsPaidToOwnerRE||0);
  const netCF=lendableCF-totalAnnualDebtService;
  const dscr=totalAnnualDebtService>0?lendableCF/totalAnnualDebtService:null;
  return {purchasePrice,purchasePriceToSDEMultiple:sdeMultiple,purchasePriceToRevenueMultiple:revenueMultiple,sourcesTotal,usesDueToSellerBusinessFFEInv,usesDueToSellerRE,usesTotalDueToSeller,usesCashAtClosingToSeller,usesSellerFinancingFuture,usesWorkingCapital,usesClosingCosts,usesTotal,termLoanMonthlyPmt,termLoanAnnualDebtService,locAssumedAverageBalance,locAnnualInterestOnly,totalAnnualDebtService,lendableCashFlowBeforeDebt:lendableCF,netCashFlowAfterDebt:netCF,dscr};
}
