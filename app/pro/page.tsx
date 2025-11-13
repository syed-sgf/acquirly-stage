"use client";
import { useMemo, useState } from "react";
import { computePro, type ProInputs, formatPercent } from "@/lib/pro-logic";
import { fmtUSD, fmtMult, fmtDSCR } from "@/lib/num";
import ReturnsCard from "@/components/ReturnsCard";
import LegendModal from "@/components/LegendModal";
import Tooltip, { InfoIcon } from "@/components/Tooltip";
import { getFieldDefinition } from "@/lib/field-definitions";

export default function ProPage() {
  const [inputs] = useState<ProInputs>({
    deal: {
      askingOrOfferPrice: 1500000,
      annualRevenue: 2500000,
      annualCashFlow: 450000,
      ffeValue: 80000,
      ffeIncludedInAsking: "yes",
      inventoryValue: 120000,
      inventoryIncludedInAsking: "no",
      realEstateValue: 900000,
      realEstateIncludedInAsking: "no",
      acquiringRealEstate: "yes",
      annualRentsPaidToOwnerRE: 120000,
    },
    biz: {
      buyersMinimumSalary: 120000,
      workingCapitalRequirement: 100000,
      annualCapexMaintenance: 30000,
      annualCapexNewInvestments: 20000,
    },
    financing: {
      buyerEquity: 300000,
      sellerFinancing: 200000,
      termLoan: 1300000,
      revolvingLOC: 200000,
      closingCosts: 60000,
    },
    lender: {
      interestRateTermLoanAPR: 0.105,
      termYears: 10,
      interestRateLOCAPR: 0.12,
      locUtilizationPct: 0.35,
      usesSDE: true,
    },
  });

  const out = useMemo(() => computePro(inputs), [inputs]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          Acquirely Pro — Deal Model
          <Tooltip content="Comprehensive acquisition analysis with SBA-compliant calculations, return metrics, and lender analysis.">
            <InfoIcon className="w-5 h-5" />
          </Tooltip>
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Complete financial analysis with industry benchmarks and interactive field guide
        </p>
      </div>

      {/* Deal Summary - NEW! */}
      <section className="mb-6 rounded-2xl border-2 border-brand-green-600 bg-gradient-to-br from-brand-green-50 to-white p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-brand-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Deal Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Purchase Price</div>
            <div className="text-2xl font-bold text-brand-green-600">{fmtUSD(out.purchasePrice)}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              DSCR
              <Tooltip content={getFieldDefinition("dscr")}>
                <InfoIcon className="w-3 h-3" />
              </Tooltip>
            </div>
            <div className={`text-2xl font-bold ${
              out.dscr && out.dscr >= 1.35 ? "text-green-600" : 
              out.dscr && out.dscr >= 1.25 ? "text-yellow-600" : "text-red-600"
            }`}>
              {fmtDSCR(out.dscr)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              Cash-on-Cash
              <Tooltip content={getFieldDefinition("cashOnCashReturn")}>
                <InfoIcon className="w-3 h-3" />
              </Tooltip>
            </div>
            <div className="text-2xl font-bold text-brand-gold-500">
              {formatPercent(out.cashOnCashReturn, 1)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Total Cash Needed</div>
            <div className="text-2xl font-bold text-gray-900">{fmtUSD(out.totalCashRequired)}</div>
          </div>
        </div>
      </section>

      {/* Deal Assumptions & Sources/Uses */}
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
            Deal Assumptions
            <Tooltip content="Core business and deal structure assumptions">
              <InfoIcon />
            </Tooltip>
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-gray-600">Asking/Offer:</span>
              <b>{fmtUSD(inputs.deal.askingOrOfferPrice)}</b>
              <Tooltip content={getFieldDefinition("askingOrOfferPrice")}>
                <InfoIcon className="w-3 h-3" />
              </Tooltip>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gray-600">Revenue:</span>
              <b>{fmtUSD(inputs.deal.annualRevenue)}</b>
              <Tooltip content={getFieldDefinition("annualRevenue")}>
                <InfoIcon className="w-3 h-3" />
              </Tooltip>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gray-600">Cash Flow (SDE/EBITDA):</span>
              <b>{fmtUSD(inputs.deal.annualCashFlow)}</b>
              <Tooltip content={getFieldDefinition("annualCashFlow")}>
                <InfoIcon className="w-3 h-3" />
              </Tooltip>
            </li>
          </ul>
          <div className="mt-4 rounded bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Computed Purchase Price:</span>
              <b>{fmtUSD(out.purchasePrice)}</b>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-1">
                Price / SDE:
                <Tooltip content={getFieldDefinition("purchasePriceToSDEMultiple")}>
                  <InfoIcon className="w-3 h-3" />
                </Tooltip>
              </span>
              <b>{fmtMult(out.purchasePriceToSDEMultiple)}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price / Revenue:</span>
              <b>{fmtMult(out.purchasePriceToRevenueMultiple)}</b>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
            Sources & Uses
            <Tooltip content="Capital structure showing where money comes from (sources) and where it goes (uses)">
              <InfoIcon />
            </Tooltip>
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-1">
                Sources
                <Tooltip content={getFieldDefinition("sourcesTotal")}>
                  <InfoIcon className="w-3 h-3" />
                </Tooltip>
              </h3>
              <ul className="space-y-1">
                <li className="flex justify-between">
                  <span className="text-gray-600">Buyer Equity:</span>
                  <b>{fmtUSD(inputs.financing.buyerEquity)}</b>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Seller Note:</span>
                  <b>{fmtUSD(inputs.financing.sellerFinancing)}</b>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Term Loan:</span>
                  <b>{fmtUSD(inputs.financing.termLoan)}</b>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">LOC:</span>
                  <b>{fmtUSD(inputs.financing.revolvingLOC)}</b>
                </li>
              </ul>
              <div className="mt-2 pt-2 border-t font-semibold flex justify-between">
                <span>Total Sources:</span>
                <span className="text-brand-green-600">{fmtUSD(out.sourcesTotal)}</span>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2 flex items-center gap-1">
                Uses
                <Tooltip content={getFieldDefinition("usesTotal")}>
                  <InfoIcon className="w-3 h-3" />
                </Tooltip>
              </h3>
              <ul className="space-y-1">
                <li className="flex justify-between">
                  <span className="text-gray-600 text-xs">To Seller (Biz):</span>
                  <b className="text-xs">{fmtUSD(out.usesDueToSellerBusinessFFEInv)}</b>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 text-xs">To Seller (RE):</span>
                  <b className="text-xs">{fmtUSD(out.usesDueToSellerRE)}</b>
                </li>
                <li className="flex justify-between text-xs pt-1 border-t">
                  <span className="text-gray-600">Cash @ Close:</span>
                  <b>{fmtUSD(out.usesCashAtClosingToSeller)}</b>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Working Cap:</span>
                  <b>{fmtUSD(out.usesWorkingCapital)}</b>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Closing Costs:</span>
                  <b>{fmtUSD(out.usesClosingCosts)}</b>
                </li>
              </ul>
              <div className="mt-2 pt-2 border-t font-semibold flex justify-between">
                <span>Total Uses:</span>
                <span className="text-brand-green-600">{fmtUSD(out.usesTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Return Metrics - NEW ENHANCED SECTION! */}
      <section className="mt-6 rounded-2xl border-2 border-brand-gold-500 bg-white p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-brand-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Return Metrics
          <Tooltip content="Key return and risk metrics for evaluating this acquisition">
            <InfoIcon />
          </Tooltip>
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Cash-on-Cash Return */}
          <div className="rounded-xl bg-gradient-to-br from-green-50 to-white border border-green-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Cash-on-Cash Return
                <Tooltip content={getFieldDefinition("cashOnCashReturn")}>
                  <InfoIcon className="w-3 h-3" />
                </Tooltip>
              </div>
              {out.cashOnCashReturn && out.cashOnCashReturn >= 0.25 ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Good</span>
              ) : out.cashOnCashReturn && out.cashOnCashReturn >= 0.15 ? (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Fair</span>
              ) : (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Low</span>
              )}
            </div>
            <div className="text-3xl font-bold text-green-600">
              {formatPercent(out.cashOnCashReturn, 1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Year 1 cash / equity</div>
          </div>

          {/* Return on Investment */}
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Return on Investment
                <Tooltip content={getFieldDefinition("returnOnInvestment")}>
                  <InfoIcon className="w-3 h-3" />
                </Tooltip>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {formatPercent(out.returnOnInvestment, 1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Net cash / total invested</div>
          </div>

          {/* Leverage Ratio */}
          <div className="rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Leverage Ratio
                <Tooltip content={getFieldDefinition("leverageRatio")}>
                  <InfoIcon className="w-3 h-3" />
                </Tooltip>
              </div>
              {out.leverageRatio && out.leverageRatio <= 3 ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Low Risk</span>
              ) : out.leverageRatio && out.leverageRatio <= 5 ? (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Moderate</span>
              ) : (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">High Risk</span>
              )}
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {out.leverageRatio?.toFixed(2) ?? "—"}x
            </div>
            <div className="text-xs text-gray-500 mt-1">Total debt / equity</div>
          </div>

          {/* Equity Capture Rate */}
          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 p-4">
            <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              Equity Capture Rate
              <Tooltip content={getFieldDefinition("equityCaptureRate")}>
                <InfoIcon className="w-3 h-3" />
              </Tooltip>
            </div>
            <div className="text-3xl font-bold text-amber-600">
              {formatPercent(out.equityCaptureRate, 1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Your ownership stake</div>
          </div>

          {/* Excess Cash Flow */}
          <div className="rounded-xl bg-gradient-to-br from-teal-50 to-white border border-teal-200 p-4">
            <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              Excess Cash Flow
              <Tooltip content={getFieldDefinition("excessCashFlow")}>
                <InfoIcon className="w-3 h-3" />
              </Tooltip>
            </div>
            <div className={`text-3xl font-bold ${out.excessCashFlow >= 0 ? "text-teal-600" : "text-red-600"}`}>
              {fmtUSD(out.excessCashFlow)}
            </div>
            <div className="text-xs text-gray-500 mt-1">After debt service</div>
          </div>

          {/* Total Cash Required */}
          <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Total Cash Required</div>
            <div className="text-3xl font-bold text-gray-900">{fmtUSD(out.totalCashRequired)}</div>
            <div className="text-xs text-gray-500 mt-1">Equity + closing costs</div>
          </div>
        </div>
      </section>

      {/* Lender Analysis */}
      <section className="mt-6 rounded-2xl border bg-white p-5">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          Lender Analysis
          <Tooltip content="Debt service calculations and cash flow analysis for lender underwriting">
            <InfoIcon />
          </Tooltip>
        </h2>
        <div className="grid gap-6 md:grid-cols-3 text-sm mb-4">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-gray-600">Term Loan Payment (mo):</span>
              <Tooltip content="Monthly payment on the term loan based on rate and term">
                <InfoIcon className="w-3 h-3" />
              </Tooltip>
            </div>
            <b className="text-lg">{fmtUSD(out.termLoanMonthlyPmt)}</b>
            <div className="text-gray-600 mt-1">Annual Debt Service: <b>{fmtUSD(out.termLoanAnnualDebtService)}</b></div>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-gray-600">Avg LOC Balance:</span>
              <Tooltip content={getFieldDefinition("locUtilizationPct")}>
                <InfoIcon className="w-3 h-3" />
              </Tooltip>
            </div>
            <b className="text-lg">{fmtUSD(out.locAssumedAverageBalance)}</b>
            <div className="text-gray-600 mt-1">LOC Interest (annual): <b>{fmtUSD(out.locAnnualInterestOnly)}</b></div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Total Borrowings:</div>
            <b className="text-lg">{fmtUSD(inputs.financing.termLoan + inputs.financing.revolvingLOC)}</b>
            <div className="text-gray-600 mt-1">Total Annual Debt: <b>{fmtUSD(out.totalAnnualDebtService)}</b></div>
          </div>
        </div>

        {/* Cash Flow Waterfall */}
        <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            Cash Flow Analysis
            <Tooltip content="Step-by-step breakdown showing how cash flow covers debt service">
              <InfoIcon className="w-4 h-4" />
            </Tooltip>
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Business CF (SDE/EBITDA):</span>
              <b>{fmtUSD(inputs.deal.annualCashFlow)}</b>
            </div>
            <div className="flex justify-between text-red-600">
              <span className="flex items-center gap-1">
                Less: Buyer Salary
                <Tooltip content={getFieldDefinition("buyersMinimumSalary")}>
                  <InfoIcon className="w-3 h-3" />
                </Tooltip>
              </span>
              <b>-{fmtUSD(inputs.biz.buyersMinimumSalary)}</b>
            </div>
            <div className="flex justify-between text-red-600">
              <span className="flex items-center gap-1">
                Less: CAPEX (Maint + New)
                <Tooltip content="Capital expenditures for maintenance and growth">
                  <InfoIcon className="w-3 h-3" />
                </Tooltip>
              </span>
              <b>-{fmtUSD(inputs.biz.annualCapexMaintenance + inputs.biz.annualCapexNewInvestments)}</b>
            </div>
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-1">
                Plus: Owner Rent Add-back
                <Tooltip content={getFieldDefinition("annualRentsPaidToOwnerRE")}>
                  <InfoIcon className="w-3 h-3" />
                </Tooltip>
              </span>
              <b>+{fmtUSD(inputs.deal.annualRentsPaidToOwnerRE)}</b>
            </div>
            <div className="flex justify-between pt-2 border-t font-semibold">
              <span>"Lendable" Cash Flow:</span>
              <span className="text-brand-green-600">{fmtUSD(out.lendableCashFlowBeforeDebt)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Less: Debt Service</span>
              <b>-{fmtUSD(out.totalAnnualDebtService)}</b>
            </div>
            <div className="flex justify-between pt-2 border-t font-bold text-lg">
              <span>Net Cash Flow:</span>
              <span className={out.netCashFlowAfterDebt >= 0 ? "text-green-600" : "text-red-600"}>
                {fmtUSD(out.netCashFlowAfterDebt)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-semibold flex items-center gap-1">
                DSCR:
                <Tooltip content={getFieldDefinition("dscr")}>
                  <InfoIcon className="w-3 h-3" />
                </Tooltip>
              </span>
              <span className={`font-bold text-2xl ${
                out.dscr && out.dscr >= 1.35 ? "text-green-600" :
                out.dscr && out.dscr >= 1.25 ? "text-yellow-600" : "text-red-600"
              }`}>
                {fmtDSCR(out.dscr)}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          SBA typically requires DSCR ≥ 1.25x. Higher DSCR indicates stronger debt coverage and lower lender risk.
        </p>
      </section>

      {/* Additional Returns Analysis */}
      <section className="mt-6">
        <ReturnsCard />
      </section>

      {/* Legend Modal - Floating Button */}
      <LegendModal />
    </main>
  );
}
