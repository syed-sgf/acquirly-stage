"use client";
import { useMemo, useState } from "react";
import { computePro, type ProInputs } from "@/lib/pro-logic";
import { fmtUSD, fmtMult, fmtDSCR } from "@/lib/num";
import ReturnsCard from "@/components/ReturnsCard";
export default function ProPage(){
  const [inputs] = useState<ProInputs>({
    deal:{askingOrOfferPrice:1500000,annualRevenue:2500000,annualCashFlow:450000,ffeValue:80000,ffeIncludedInAsking:"yes",inventoryValue:120000,inventoryIncludedInAsking:"no",realEstateValue:900000,realEstateIncludedInAsking:"no",acquiringRealEstate:"yes",annualRentsPaidToOwnerRE:120000},
    biz:{buyersMinimumSalary:120000,workingCapitalRequirement:100000,annualCapexMaintenance:30000,annualCapexNewInvestments:20000},
    financing:{buyerEquity:300000,sellerFinancing:200000,termLoan:1300000,revolvingLOC:200000,closingCosts:60000},
    lender:{interestRateTermLoanAPR:0.105,termYears:10,interestRateLOCAPR:0.12,locUtilizationPct:0.35,usesSDE:true}
  });
  const out = useMemo(()=>computePro(inputs),[inputs]);
  return (<main className="mx-auto max-w-6xl px-6 py-10">
    <h1 className="text-3xl font-bold">Acquirely Pro — Deal Model</h1>
    <section className="mt-6 grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border bg-white p-5">
        <h2 className="text-xl font-semibold">Deal Assumptions</h2>
        <ul className="mt-3 space-y-1 text-sm">
          <li>Asking/Offer: <b>{fmtUSD(inputs.deal.askingOrOfferPrice)}</b></li>
          <li>Revenue: <b>{fmtUSD(inputs.deal.annualRevenue)}</b></li>
          <li>Cash Flow (SDE/EBITDA): <b>{fmtUSD(inputs.deal.annualCashFlow)}</b></li>
        </ul>
        <div className="mt-3 rounded bg-gray-50 p-3 text-sm">
          <div>Computed Purchase Price: <b>{fmtUSD(out.purchasePrice)}</b></div>
          <div>Price / SDE: <b>{fmtMult(out.purchasePriceToSDEMultiple)}</b></div>
          <div>Price / Revenue: <b>{fmtMult(out.purchasePriceToRevenueMultiple)}</b></div>
        </div>
      </div>
      <div className="rounded-2xl border bg-white p-5">
        <h2 className="text-xl font-semibold">Sources & Uses</h2>
        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium">Sources</h3>
            <ul className="mt-2 space-y-1">
              <li>Buyer Equity (1): <b>{fmtUSD(inputs.financing.buyerEquity)}</b></li>
              <li>Seller Financing (2): <b>{fmtUSD(inputs.financing.sellerFinancing)}</b></li>
              <li>Term Loan: <b>{fmtUSD(inputs.financing.termLoan)}</b></li>
              <li>Revolving LOC: <b>{fmtUSD(inputs.financing.revolvingLOC)}</b></li>
            </ul>
            <div className="mt-2">Total Sources: <b>{fmtUSD(out.sourcesTotal)}</b></div>
          </div>
          <div>
            <h3 className="font-medium">Uses</h3>
            <ul className="mt-2 space-y-1">
              <li>Due to Seller (Biz/FF&E/Inv): <b>{fmtUSD(out.usesDueToSellerBusinessFFEInv)}</b></li>
              <li>Due to Seller (RE): <b>{fmtUSD(out.usesDueToSellerRE)}</b></li>
              <li className="mt-1">Total Due to Seller: <b>{fmtUSD(out.usesTotalDueToSeller)}</b></li>
              <li>Cash @ Closing to Seller: <b>{fmtUSD(out.usesCashAtClosingToSeller)}</b></li>
              <li>Seller Financing (Future): <b>{fmtUSD(out.usesSellerFinancingFuture)}</b></li>
              <li>Working Capital: <b>{fmtUSD(out.usesWorkingCapital)}</b></li>
              <li>Closing Costs (3): <b>{fmtUSD(out.usesClosingCosts)}</b></li>
            </ul>
            <div className="mt-2">Total Uses: <b>{fmtUSD(out.usesTotal)}</b></div>
          </div>
        </div>
      </div>
    </section>
    <section className="mt-6 rounded-2xl border bg-white p-5">
      <h2 className="text-xl font-semibold">Lender Analysis</h2>
      <div className="mt-2 grid gap-6 md:grid-cols-3 text-sm">
        <div><div>Term Loan Payment (mo): <b>{fmtUSD(out.termLoanMonthlyPmt)}</b></div><div>Annual Debt Service (term): <b>{fmtUSD(out.termLoanAnnualDebtService)}</b></div></div>
        <div><div>Avg LOC Balance: <b>{fmtUSD(out.locAssumedAverageBalance)}</b></div><div>LOC Interest (annual): <b>{fmtUSD(out.locAnnualInterestOnly)}</b></div></div>
        <div><div>Total Borrowings: <b>{fmtUSD(inputs.financing.termLoan+inputs.financing.revolvingLOC)}</b></div><div>Total Annual Debt Service: <b>{fmtUSD(out.totalAnnualDebtService)}</b></div></div>
      </div>
      <div className="mt-4 rounded bg-gray-50 p-4">
        <div>Business CF (SDE/EBITDA): <b>{fmtUSD(inputs.deal.annualCashFlow)}</b></div>
        <div>Less: Buyer Salary: <b>-{fmtUSD(inputs.biz.buyersMinimumSalary)}</b></div>
        <div>Less: CAPEX (Maint + New): <b>-{fmtUSD(inputs.biz.annualCapexMaintenance+inputs.biz.annualCapexNewInvestments)}</b></div>
        <div>Plus: Rents paid to owner (5): <b>+{fmtUSD(inputs.deal.annualRentsPaidToOwnerRE)}</b></div>
        <div className="mt-1">“Lendable” Cash Flow: <b>{fmtUSD(out.lendableCashFlowBeforeDebt)}</b></div>
        <div>Less: Debt Service: <b>-{fmtUSD(out.totalAnnualDebtService)}</b></div>
        <div className="mt-1">Net Cash Flow: <b>{fmtUSD(out.netCashFlowAfterDebt)}</b></div>
        <div>DSCR (6): <b>{fmtDSCR(out.dscr)}</b></div>
      </div>
      <p className="mt-4 text-xs text-gray-500">Footnotes: (1) Equity from buyer/investors. (2) Seller note may require standby per lender/SBA. (3) Includes SBA guarantee, bank/legal/appraisal fees. (5) Add-back of seller-landlord rent. (6) DSCR = Lendable CF ÷ Annual Debt Service.</p>
    </section>
    <section className="mt-6"><ReturnsCard/></section>
  </main>);
}
