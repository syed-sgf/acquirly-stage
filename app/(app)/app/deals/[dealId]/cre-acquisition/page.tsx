'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  DollarSign, Building2, Calculator, TrendingUp, BarChart3,
  FileText, MessageSquare, Save, ArrowLeft, CheckCircle,
  Home, Hammer, RefreshCw, Target
} from 'lucide-react';
import CREAcquisitionExportButton from '@/components/calculators/CREAcquisitionExportButton';

type StrategyType = 'buy-hold' | 'fix-flip' | 'brrrr';

interface CREAcquisitionInputs {
  purchasePrice: string; afterRepairValue: string; rehabCosts: string;
  closingCostsBuy: string; closingCostsSell: string;
  monthlyRent: string; otherMonthlyIncome: string; vacancyRate: string;
  propertyTaxes: string; insurance: string; maintenance: string;
  propertyManagement: string; utilities: string; hoa: string; otherExpenses: string;
  downPaymentPercent: string; loanInterestRate: string; loanTermYears: string;
  refinanceLTV: string; refinanceRate: string; refinanceTermYears: string;
  appreciationRate: string; rentGrowthRate: string; holdPeriodYears: string;
  sellingCostsPercent: string; holdMonths: string; hardMoneyRate: string; hardMoneyPoints: string;
}

const defaultInputs: CREAcquisitionInputs = {
  purchasePrice: '250,000', afterRepairValue: '320,000', rehabCosts: '40,000',
  closingCostsBuy: '5,000', closingCostsSell: '3,000',
  monthlyRent: '2,200', otherMonthlyIncome: '100', vacancyRate: '5',
  propertyTaxes: '3,000', insurance: '1,200', maintenance: '1,500',
  propertyManagement: '8', utilities: '0', hoa: '0', otherExpenses: '500',
  downPaymentPercent: '25', loanInterestRate: '7.5', loanTermYears: '30',
  refinanceLTV: '75', refinanceRate: '7.0', refinanceTermYears: '30',
  appreciationRate: '3', rentGrowthRate: '2', holdPeriodYears: '5',
  sellingCostsPercent: '8', holdMonths: '6', hardMoneyRate: '12', hardMoneyPoints: '2',
};

const formatCurrency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
const parseCurrency = (v: string) => parseFloat(v.replace(/[^0-9.-]/g, '')) || 0;
const formatCommas = (v: number) => isNaN(v) || v === 0 ? '0' : v.toLocaleString('en-US');

const calcMonthlyPayment = (principal: number, annualRate: number, years: number) => {
  if (!principal || !annualRate || !years) return 0;
  const r = (annualRate / 100) / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

const calcIRR = (cashFlows: number[], guess = 0.1) => {
  let rate = guess;
  for (let i = 0; i < 100; i++) {
    let npv = 0, d = 0;
    for (let j = 0; j < cashFlows.length; j++) {
      npv += cashFlows[j] / Math.pow(1 + rate, j);
      if (j > 0) d -= j * cashFlows[j] / Math.pow(1 + rate, j + 1);
    }
    if (Math.abs(d) < 0.0001) break;
    const nr = rate - npv / d;
    if (Math.abs(nr - rate) < 0.0001) return nr * 100;
    rate = nr;
    if (rate < -0.99 || rate > 10) break;
  }
  return rate * 100;
};

export default function CREAcquisitionDealPage() {
  const params = useParams();
  const dealId = params?.dealId as string;
  const [dealName, setDealName] = useState('CRE Acquisition Analysis');
  const [inputs, setInputs] = useState<CREAcquisitionInputs>(defaultInputs);
  const [strategy, setStrategy] = useState<StrategyType>('buy-hold');
  const [activeTab, setActiveTab] = useState<'inputs' | 'results'>('inputs');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const setField = (field: keyof CREAcquisitionInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    setSaveStatus('idle');
  };

  const handleCurrency = (value: string, field: keyof CREAcquisitionInputs) => {
    if (value === '' || value === '$') { setField(field, '0'); return; }
    const n = parseInt(value.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(n)) setField(field, formatCommas(n));
  };

  const handlePercent = (value: string, field: keyof CREAcquisitionInputs) => {
    if (value === '') { setField(field, '0'); return; }
    const c = value.replace(/[^0-9.]/g, '');
    const p = c.split('.');
    if (p.length > 2 || (p[1] && p[1].length > 2)) return;
    setField(field, c);
  };

  useEffect(() => {
    if (!dealId) return;
    const fetchData = async () => {
      try {
        const dealRes = await fetch(`/api/deals/${dealId}`);
        if (dealRes.ok) { const d = await dealRes.json(); setDealName(d.name || 'CRE Acquisition'); }
        const analysisRes = await fetch(`/api/deals/${dealId}/analyses`);
        if (analysisRes.ok) {
          const analyses = await analysisRes.json();
          const existing = analyses.find((a: { type: string }) => a.type === 'cre-acquisition');
          if (existing) {
            setAnalysisId(existing.id);
            if (existing.inputs) setInputs(prev => ({ ...prev, ...existing.inputs }));
            if (existing.strategy) setStrategy(existing.strategy);
          }
        }
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, [dealId]);

  const outputs = useMemo(() => {
    const pp = parseCurrency(inputs.purchasePrice);
    const arv = parseCurrency(inputs.afterRepairValue);
    const rehab = parseCurrency(inputs.rehabCosts);
    const ccBuy = parseCurrency(inputs.closingCostsBuy);
    const ccSell = parseCurrency(inputs.closingCostsSell);
    const rent = parseCurrency(inputs.monthlyRent);
    const otherInc = parseCurrency(inputs.otherMonthlyIncome);
    const vacancy = parseFloat(inputs.vacancyRate) || 0;
    const taxes = parseCurrency(inputs.propertyTaxes);
    const ins = parseCurrency(inputs.insurance);
    const maint = parseCurrency(inputs.maintenance);
    const mgmt = parseFloat(inputs.propertyManagement) || 0;
    const utils = parseCurrency(inputs.utilities);
    const hoa = parseCurrency(inputs.hoa);
    const other = parseCurrency(inputs.otherExpenses);
    const dpPct = parseFloat(inputs.downPaymentPercent) || 0;
    const rate = parseFloat(inputs.loanInterestRate) || 0;
    const term = parseInt(inputs.loanTermYears) || 30;
    const refiLTV = parseFloat(inputs.refinanceLTV) || 75;
    const refiRate = parseFloat(inputs.refinanceRate) || 7;
    const refiTerm = parseInt(inputs.refinanceTermYears) || 30;
    const appRate = parseFloat(inputs.appreciationRate) || 0;
    const rentGrowth = parseFloat(inputs.rentGrowthRate) || 0;
    const holdYears = parseInt(inputs.holdPeriodYears) || 5;
    const sellCostsPct = parseFloat(inputs.sellingCostsPercent) || 8;
    const holdMonths = parseInt(inputs.holdMonths) || 6;
    const hmRate = parseFloat(inputs.hardMoneyRate) || 12;
    const hmPoints = parseFloat(inputs.hardMoneyPoints) || 2;

    if (!pp) return null;

    const gpi = (rent + otherInc) * 12;
    const vacLoss = gpi * (vacancy / 100);
    const egi = gpi - vacLoss;
    const mgmtExp = egi * (mgmt / 100);
    const totalExp = taxes + ins + maint + mgmtExp + utils + (hoa * 12) + other;
    const noi = egi - totalExp;
    const expRatio = egi > 0 ? (totalExp / egi) * 100 : 0;

    const dp = pp * (dpPct / 100);
    const loan = pp - dp;
    const monthly = calcMonthlyPayment(loan, rate, term);
    const ads = monthly * 12;

    const capRate = pp > 0 ? (noi / pp) * 100 : 0;
    const grm = (rent * 12) > 0 ? pp / (rent * 12) : 0;
    const dscr = ads > 0 ? noi / ads : 0;
    const acf = noi - ads;
    const mcf = acf / 12;
    const totalCash = dp + ccBuy + (strategy !== 'buy-hold' ? rehab : 0);
    const coc = totalCash > 0 ? (acf / totalCash) * 100 : 0;
    const ber = egi > 0 ? ((totalExp + ads) / egi) * 100 : 0;

    let strategyResults: Record<string, unknown> = {};

    if (strategy === 'buy-hold') {
      const schedule = [];
      const cfs: number[] = [-totalCash];
      let pv = pp, bal = loan, r = rent;
      const mr = (rate / 100) / 12;
      for (let y = 0; y <= holdYears; y++) {
        const eq = pv - bal;
        if (y > 0) {
          const yEGI = r * 12 * (1 - vacancy / 100);
          const yExp = totalExp * Math.pow(1.02, y - 1);
          const yCF = yEGI - yExp - ads;
          if (y === holdYears) {
            const sellCosts = pv * (sellCostsPct / 100);
            cfs.push(yCF + (pv - bal - sellCosts));
          } else cfs.push(yCF);
        }
        schedule.push({ year: y, propertyValue: pv, loanBalance: bal, equity: eq, equityPercent: pv > 0 ? (eq / pv) * 100 : 0 });
        pv = pv * (1 + appRate / 100);
        r = r * (1 + rentGrowth / 100);
        for (let m = 0; m < 12; m++) {
          if (bal > 0) { const ip = bal * mr; bal = Math.max(0, bal - (monthly - ip)); }
        }
      }
      const irr = calcIRR(cfs);
      strategyResults = { equitySchedule: schedule, irr, exitValue: schedule[holdYears]?.propertyValue || 0, exitEquity: schedule[holdYears]?.equity || 0, totalCashInvested: totalCash };
    }

    if (strategy === 'fix-flip') {
      const hmLoan = pp * 0.9;
      const hmPtsCost = hmLoan * (hmPoints / 100);
      const holdCostMo = (hmLoan * (hmRate / 100) / 12) + (taxes / 12) + (ins / 12) + 500;
      const totalHold = holdCostMo * holdMonths;
      const cashNeeded = (pp - hmLoan) + rehab + ccBuy + hmPtsCost + totalHold;
      const sellCosts = arv * (sellCostsPct / 100);
      const netSale = arv - sellCosts - ccSell;
      const profit = netSale - cashNeeded - hmLoan;
      const roi = cashNeeded > 0 ? (profit / cashNeeded) * 100 : 0;
      strategyResults = {
        totalHoldingCosts: totalHold, cashNeeded, actualProfit: profit,
        roi, annualizedROI: holdMonths > 0 ? (roi / holdMonths) * 12 : 0,
        profitMargin: arv > 0 ? (profit / arv) * 100 : 0,
        meetsRule70: pp <= (arv * 0.7) - rehab,
        maxPurchasePrice70: (arv * 0.7) - rehab,
      };
    }

    if (strategy === 'brrrr') {
      const refiAmt = arv * (refiLTV / 100);
      const cashOut = refiAmt - loan;
      const cashLeft = totalCash - cashOut;
      const newPmt = calcMonthlyPayment(refiAmt, refiRate, refiTerm);
      const newADS = newPmt * 12;
      const cfAfterRefi = noi - newADS;
      strategyResults = {
        refinanceAmount: refiAmt, cashOutFromRefi: cashOut, cashLeftInDeal: cashLeft,
        newMonthlyPayment: newPmt, newAnnualDebtService: newADS,
        annualCashFlowAfterRefi: cfAfterRefi, monthlyCashFlowAfterRefi: cfAfterRefi / 12,
        cashOnCashAfterRefi: cashLeft > 0 ? (cfAfterRefi / cashLeft) * 100 : Infinity,
        infiniteReturn: cashLeft <= 0,
        dscrAfterRefi: newADS > 0 ? noi / newADS : 0,
      };
    }

    return { gpi, vacLoss, egi, totalExp, mgmtExp, expRatio, noi, dp, loan, monthly, ads, capRate, grm, dscr, acf, mcf, totalCash, coc, ber, pp, arv, rehab, ...strategyResults };
  }, [inputs, strategy]) as any;

  const handleSave = async () => {
    if (!outputs || !dealId) return;
    setSaveStatus('saving');
    try {
      const payload = {
        type: 'cre-acquisition', strategy,
        inputs, outputs: { noi: outputs.noi, capRate: outputs.capRate, dscr: outputs.dscr, coc: outputs.coc, acf: outputs.acf },
      };
      const url = analysisId ? `/api/deals/${dealId}/analyses/${analysisId}` : `/api/deals/${dealId}/analyses`;
      const res = await fetch(url, { method: analysisId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { const d = await res.json(); if (!analysisId) setAnalysisId(d.id); setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 3000); }
      else setSaveStatus('error');
    } catch { setSaveStatus('error'); }
  };

  const pdfData = outputs ? {
    propertyName: dealName,
    reportDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    strategy,
    purchasePrice: outputs.pp as number,
    afterRepairValue: outputs.arv as number,
    rehabCosts: outputs.rehab as number,
    monthlyRent: parseCurrency(inputs.monthlyRent),
    vacancyRate: parseFloat(inputs.vacancyRate) || 0,
    effectiveGrossIncome: outputs.egi as number,
    totalAnnualExpenses: outputs.totalExp as number,
    expenseRatio: outputs.expRatio as number,
    netOperatingIncome: outputs.noi as number,
    capRate: outputs.capRate as number,
    downPayment: outputs.dp as number,
    loanAmount: outputs.loan as number,
    monthlyMortgage: outputs.monthly as number,
    annualDebtService: outputs.ads as number,
    dscr: outputs.dscr as number,
    annualCashFlow: outputs.acf as number,
    monthlyCashFlow: outputs.mcf as number,
    cashOnCashReturn: outputs.coc as number,
    totalCashInvested: outputs.totalCash as number,
    grossRentMultiplier: outputs.grm as number,
    breakEvenRatio: outputs.ber as number,
    // Buy & Hold
    irr: outputs.irr as number,
    exitValue: outputs.exitValue as number,
    exitEquity: outputs.exitEquity as number,
    equitySchedule: outputs.equitySchedule as Array<{ year: number; propertyValue: number; loanBalance: number; equity: number; equityPercent: number }>,
    // Fix & Flip
    actualProfit: outputs.actualProfit as number,
    roi: outputs.roi as number,
    annualizedROI: outputs.annualizedROI as number,
    profitMargin: outputs.profitMargin as number,
    meetsRule70: outputs.meetsRule70 as boolean,
    maxPurchasePrice70: outputs.maxPurchasePrice70 as number,
    totalHoldingCosts: outputs.totalHoldingCosts as number,
    // BRRRR
    refinanceAmount: outputs.refinanceAmount as number,
    cashOutFromRefi: outputs.cashOutFromRefi as number,
    cashLeftInDeal: outputs.cashLeftInDeal as number,
    annualCashFlowAfterRefi: outputs.annualCashFlowAfterRefi as number,
    cashOnCashAfterRefi: outputs.cashOnCashAfterRefi as number,
    infiniteReturn: outputs.infiniteReturn as boolean,
    dscrAfterRefi: outputs.dscrAfterRefi as number,
  } : null;

  const InputField = ({ label, value, field, type = 'currency' }: { label: string; value: string; field: keyof CREAcquisitionInputs; type?: 'currency' | 'percent' | 'number' }) => (
    <div>
      <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
      <div className="relative">
        {type === 'currency' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>}
        <input
          type="text"
          value={value}
          onChange={(e) => type === 'currency' ? handleCurrency(e.target.value, field) : handlePercent(e.target.value, field)}
          className={`w-full ${type === 'currency' ? 'pl-7' : 'pl-3'} ${type === 'percent' ? 'pr-7' : 'pr-3'} py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none`}
        />
        {type === 'percent' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sgf-green-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back Link */}
        <Link href={`/app/deals/${dealId}`} className="inline-flex items-center gap-2 text-sgf-green-600 hover:text-sgf-green-700 font-medium mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" />Back to Deal
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-sgf-green-600 via-sgf-green-700 to-sgf-green-800 rounded-2xl p-6 shadow-xl relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-2">
                <Building2 className="w-3 h-3" />CRE Acquisition
              </div>
              <h1 className="text-2xl font-bold text-white">CRE Acquisition Analyzer</h1>
              <p className="text-sgf-green-100 text-sm mt-1">{dealName}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {saveStatus === 'saved' && <div className="flex items-center gap-1 text-sgf-green-100 text-sm"><CheckCircle className="w-4 h-4" />Saved</div>}
              <CREAcquisitionExportButton data={pdfData} />
              <button onClick={handleSave} disabled={saveStatus === 'saving' || !outputs} className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50">
                <Save className="w-4 h-4" />{saveStatus === 'saving' ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Strategy Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-700 mr-2">Strategy:</span>
            {[
              { id: 'buy-hold', label: 'Buy & Hold', icon: <Home className="w-4 h-4" /> },
              { id: 'fix-flip', label: 'Fix & Flip', icon: <Hammer className="w-4 h-4" /> },
              { id: 'brrrr', label: 'BRRRR', icon: <RefreshCw className="w-4 h-4" /> },
            ].map(s => (
              <button key={s.id} onClick={() => setStrategy(s.id as StrategyType)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${strategy === s.id ? 'bg-sgf-green-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s.icon}{s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid lg:grid-cols-4 gap-6 mb-6">
          {/* Property */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-8 h-8 bg-sgf-green-500 rounded-lg flex items-center justify-center"><Building2 className="w-4 h-4 text-white" /></div>
              <span className="font-semibold text-gray-900 text-sm">Property</span>
            </div>
            <div className="p-4 space-y-3">
              <InputField label="Purchase Price" value={inputs.purchasePrice} field="purchasePrice" />
              <InputField label="After Repair Value" value={inputs.afterRepairValue} field="afterRepairValue" />
              <InputField label="Rehab Costs" value={inputs.rehabCosts} field="rehabCosts" />
              <InputField label="Closing Costs (Buy)" value={inputs.closingCostsBuy} field="closingCostsBuy" />
            </div>
          </div>

          {/* Income */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-8 h-8 bg-sgf-gold-500 rounded-lg flex items-center justify-center"><DollarSign className="w-4 h-4 text-white" /></div>
              <span className="font-semibold text-gray-900 text-sm">Income</span>
            </div>
            <div className="p-4 space-y-3">
              <InputField label="Monthly Rent" value={inputs.monthlyRent} field="monthlyRent" />
              <InputField label="Other Monthly Income" value={inputs.otherMonthlyIncome} field="otherMonthlyIncome" />
              <InputField label="Vacancy Rate" value={inputs.vacancyRate} field="vacancyRate" type="percent" />
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-8 h-8 bg-sgf-green-500 rounded-lg flex items-center justify-center"><BarChart3 className="w-4 h-4 text-white" /></div>
              <span className="font-semibold text-gray-900 text-sm">Expenses</span>
            </div>
            <div className="p-4 space-y-3">
              <InputField label="Property Taxes" value={inputs.propertyTaxes} field="propertyTaxes" />
              <InputField label="Insurance" value={inputs.insurance} field="insurance" />
              <InputField label="Maintenance" value={inputs.maintenance} field="maintenance" />
              <InputField label="Property Mgmt %" value={inputs.propertyManagement} field="propertyManagement" type="percent" />
              <InputField label="Other Expenses" value={inputs.otherExpenses} field="otherExpenses" />
            </div>
          </div>

          {/* Financing */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-8 h-8 bg-sgf-gold-500 rounded-lg flex items-center justify-center"><Calculator className="w-4 h-4 text-white" /></div>
              <span className="font-semibold text-gray-900 text-sm">Financing</span>
            </div>
            <div className="p-4 space-y-3">
              <InputField label="Down Payment %" value={inputs.downPaymentPercent} field="downPaymentPercent" type="percent" />
              <InputField label="Interest Rate" value={inputs.loanInterestRate} field="loanInterestRate" type="percent" />
              <InputField label="Loan Term (yrs)" value={inputs.loanTermYears} field="loanTermYears" type="number" />
              {strategy === 'brrrr' && <>
                <InputField label="Refi LTV %" value={inputs.refinanceLTV} field="refinanceLTV" type="percent" />
                <InputField label="Refi Rate %" value={inputs.refinanceRate} field="refinanceRate" type="percent" />
              </>}
              {strategy === 'fix-flip' && <>
                <InputField label="Hold Months" value={inputs.holdMonths} field="holdMonths" type="number" />
                <InputField label="Hard Money Rate %" value={inputs.hardMoneyRate} field="hardMoneyRate" type="percent" />
              </>}
              {strategy === 'buy-hold' && <>
                <InputField label="Hold Period (yrs)" value={inputs.holdPeriodYears} field="holdPeriodYears" type="number" />
                <InputField label="Appreciation %" value={inputs.appreciationRate} field="appreciationRate" type="percent" />
              </>}
            </div>
          </div>
        </div>

        {/* Results */}
        {outputs && (
          <>
            {/* Key Metrics Banner */}
            <div className="bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 rounded-xl p-6 mb-6 text-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-sgf-green-100 text-sm mb-1">NOI</div>
                  <div className="text-2xl font-bold">{formatCurrency(outputs.noi as number)}</div>
                </div>
                <div>
                  <div className="text-sgf-green-100 text-sm mb-1">Cap Rate</div>
                  <div className="text-2xl font-bold">{(outputs.capRate as number).toFixed(2)}%</div>
                </div>
                <div>
                  <div className="text-sgf-green-100 text-sm mb-1">DSCR</div>
                  <div className="text-2xl font-bold">{(outputs.dscr as number).toFixed(2)}x</div>
                </div>
                <div>
                  <div className="text-sgf-green-100 text-sm mb-1">Cash-on-Cash</div>
                  <div className="text-2xl font-bold">{(outputs.coc as number).toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Income Statement */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-sgf-green-50 to-white">
                  <h3 className="font-semibold text-gray-900 text-sm">Income Statement</h3>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Gross Potential Income</span><span className="font-mono">{formatCurrency(outputs.gpi as number)}</span></div>
                  <div className="flex justify-between text-red-600"><span>Less: Vacancy</span><span className="font-mono">({formatCurrency(outputs.vacLoss as number)})</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="font-semibold">Effective Gross Income</span><span className="font-mono font-semibold">{formatCurrency(outputs.egi as number)}</span></div>
                  <div className="flex justify-between text-red-600"><span>Less: Expenses</span><span className="font-mono">({formatCurrency(outputs.totalExp as number)})</span></div>
                  <div className="flex justify-between border-t pt-2 bg-sgf-green-50 px-2 py-1 rounded"><span className="text-sgf-green-700 font-bold">NOI</span><span className="font-mono font-bold text-sgf-green-700">{formatCurrency(outputs.noi as number)}</span></div>
                </div>
              </div>

              {/* Financing */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-sgf-gold-50 to-white">
                  <h3 className="font-semibold text-gray-900 text-sm">Financing</h3>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Down Payment</span><span className="font-mono">{formatCurrency(outputs.dp as number)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Loan Amount</span><span className="font-mono">{formatCurrency(outputs.loan as number)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Monthly Payment</span><span className="font-mono">{formatCurrency(outputs.monthly as number)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Annual Debt Service</span><span className="font-mono">{formatCurrency(outputs.ads as number)}</span></div>
                  <div className="flex justify-between border-t pt-2 bg-sgf-gold-50 px-2 py-1 rounded"><span className="text-sgf-gold-700 font-bold">Total Cash In</span><span className="font-mono font-bold text-sgf-gold-700">{formatCurrency(outputs.totalCash as number)}</span></div>
                </div>
              </div>

              {/* Returns */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                  <h3 className="font-semibold text-gray-900 text-sm">Returns</h3>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Annual Cash Flow</span><span className={`font-mono font-semibold ${(outputs.acf as number) >= 0 ? 'text-sgf-green-600' : 'text-red-600'}`}>{formatCurrency(outputs.acf as number)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Monthly Cash Flow</span><span className={`font-mono ${(outputs.mcf as number) >= 0 ? 'text-sgf-green-600' : 'text-red-600'}`}>{formatCurrency(outputs.mcf as number)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Cash-on-Cash</span><span className="font-mono font-semibold">{(outputs.coc as number).toFixed(2)}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">GRM</span><span className="font-mono">{(outputs.grm as number).toFixed(1)}x</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Break-Even Ratio</span><span className="font-mono">{(outputs.ber as number).toFixed(1)}%</span></div>
                  {strategy === 'buy-hold' && outputs.irr && <div className="flex justify-between border-t pt-2"><span className="text-gray-600 font-semibold">IRR</span><span className="font-mono font-bold text-sgf-green-600">{(outputs.irr as number).toFixed(1)}%</span></div>}
                </div>
              </div>
            </div>

            {/* Strategy Specific Results */}
            {strategy === 'buy-hold' && outputs.equitySchedule && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-sgf-green-50 to-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sgf-green-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">Equity Build Schedule</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-sgf-green-600 text-white">
                      <th className="px-4 py-2 text-center">Year</th>
                      <th className="px-4 py-2 text-right">Property Value</th>
                      <th className="px-4 py-2 text-right">Loan Balance</th>
                      <th className="px-4 py-2 text-right">Equity</th>
                      <th className="px-4 py-2 text-right">Equity %</th>
                    </tr></thead>
                    <tbody>
                      {(outputs.equitySchedule as Array<{ year: number; propertyValue: number; loanBalance: number; equity: number; equityPercent: number }>).map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-center font-semibold">Year {row.year}</td>
                          <td className="px-4 py-2 text-right font-mono">{formatCurrency(row.propertyValue)}</td>
                          <td className="px-4 py-2 text-right font-mono text-red-600">{formatCurrency(row.loanBalance)}</td>
                          <td className="px-4 py-2 text-right font-mono text-sgf-green-600 font-semibold">{formatCurrency(row.equity)}</td>
                          <td className="px-4 py-2 text-right font-mono">{row.equityPercent.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {strategy === 'fix-flip' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-white flex items-center gap-2">
                  <Hammer className="w-4 h-4 text-yellow-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">Fix & Flip Results</h3>
                </div>
                <div className="p-4 grid md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-500 text-xs mb-1">Net Profit</div>
                    <div className={`text-xl font-bold ${(outputs.actualProfit as number) >= 0 ? 'text-sgf-green-600' : 'text-red-600'}`}>{formatCurrency(outputs.actualProfit as number)}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-500 text-xs mb-1">ROI</div>
                    <div className="text-xl font-bold text-sgf-green-600">{(outputs.roi as number).toFixed(1)}%</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-500 text-xs mb-1">70% Rule</div>
                    <div className={`text-xl font-bold ${outputs.meetsRule70 ? 'text-sgf-green-600' : 'text-red-600'}`}>{outputs.meetsRule70 ? '✅ Passes' : '❌ Fails'}</div>
                    <div className="text-xs text-gray-500">Max: {formatCurrency(outputs.maxPurchasePrice70 as number)}</div>
                  </div>
                </div>
              </div>
            )}

            {strategy === 'brrrr' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">BRRRR Results</h3>
                </div>
                <div className="p-4 grid md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-500 text-xs mb-1">Cash Out from Refi</div>
                    <div className="text-xl font-bold text-blue-600">{formatCurrency(outputs.cashOutFromRefi as number)}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-500 text-xs mb-1">Cash Left in Deal</div>
                    <div className="text-xl font-bold text-sgf-green-600">{formatCurrency(outputs.cashLeftInDeal as number)}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-500 text-xs mb-1">Cash-on-Cash After Refi</div>
                    <div className="text-xl font-bold text-sgf-green-600">{(outputs.infiniteReturn as boolean) ? '∞ Infinite!' : `${(outputs.cashOnCashAfterRefi as number).toFixed(1)}%`}</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Financing CTA */}
        <div className="mt-4 bg-gradient-to-r from-sgf-green-600 via-sgf-green-700 to-sgf-green-800 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />Ready to Finance?
              </div>
              <h2 className="text-2xl font-bold mb-2">Finance This Property</h2>
              <p className="text-sgf-green-100 max-w-lg text-sm">Starting Gate Financial offers competitive CRE financing including bridge loans, fix & flip loans, permanent financing, and BRRRR strategies.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="https://startinggatefinancial.com/apply" className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-sgf-gold-600 transition-colors shadow-lg">
                <FileText className="w-4 h-4" />Apply for Financing
              </a>
              <a href="https://startinggatefinancial.com/contact" className="inline-flex items-center gap-2 bg-white/10 border-2 border-white/30 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-white/20 transition-colors">
                <MessageSquare className="w-4 h-4" />Schedule Call
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
