'use client';
import { useState, useMemo } from 'react';
import { DollarSign, Building2, Calculator, BarChart3, FileText, MessageSquare, Save, TrendingUp, Search, Users } from 'lucide-react';
import PremiumProductsCTA from '@/components/core/PremiumProductsCTA';
import GatedCalculator from '@/components/core/GatedCalculator';
import CommercialPropertyExportButton from '@/components/calculators/CommercialPropertyExportButton';

type PropertyType = 'Office' | 'Retail' | 'Industrial' | 'Mixed-Use' | 'Multifamily (5+)' | 'Self-Storage' | 'NNN Lease' | 'Medical Office' | 'Warehouse';

interface CPAInputs {
  purchasePrice: string; squareFootage: string;
  baseRentPerSqFt: string; camPerSqFt: string; otherIncome: string; vacancyRate: string;
  tenantPaysCAM: string; tenantPaysTaxes: string; tenantPaysInsurance: string;
  propertyTaxes: string; insurance: string; maintenance: string;
  propertyManagement: string; utilities: string; reserves: string;
  downPaymentPct: string; interestRate: string; amortization: string;
  appreciationRate: string; holdPeriodYears: string; sellingCostsPct: string;
  tenantName: string; leaseTerm: string; rentEscalation: string;
}

const defaultInputs: CPAInputs = {
  purchasePrice: '2,000,000', squareFootage: '10,000',
  baseRentPerSqFt: '25', camPerSqFt: '5', otherIncome: '0', vacancyRate: '5',
  tenantPaysCAM: '0', tenantPaysTaxes: '0', tenantPaysInsurance: '0',
  propertyTaxes: '20,000', insurance: '8,000', maintenance: '15,000',
  propertyManagement: '4', utilities: '0', reserves: '1',
  downPaymentPct: '30', interestRate: '7.25', amortization: '25',
  appreciationRate: '3', holdPeriodYears: '10', sellingCostsPct: '4',
  tenantName: '', leaseTerm: '10', rentEscalation: '2',
};

const PROPERTY_TYPES: PropertyType[] = ['Office', 'Retail', 'Industrial', 'Mixed-Use', 'Multifamily (5+)', 'Self-Storage', 'NNN Lease', 'Medical Office', 'Warehouse'];

const VACANCY_BENCHMARKS: Record<string, string> = {
  'Office': '10-15%', 'Retail': '5-8%', 'Industrial': '3-5%',
  'Mixed-Use': '5-8%', 'Multifamily (5+)': '3-5%', 'Self-Storage': '8-12%',
  'NNN Lease': '2-4%', 'Medical Office': '5-8%', 'Warehouse': '3-5%',
};

const CAP_RATE_BENCHMARKS: Record<string, string> = {
  'Office': '6.5-8.5%', 'Retail': '5.5-7.5%', 'Industrial': '4.5-6.5%',
  'Mixed-Use': '5.5-7.5%', 'Multifamily (5+)': '4.5-6.5%', 'Self-Storage': '5.5-7.5%',
  'NNN Lease': '4.5-6.5%', 'Medical Office': '5.5-7.0%', 'Warehouse': '4.5-6.0%',
};

const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
const parse = (v: string) => parseFloat(v.replace(/[^0-9.-]/g, '')) || 0;
const fmtCommas = (v: number) => isNaN(v) || v === 0 ? '0' : v.toLocaleString('en-US');

const calcPayment = (principal: number, annualRate: number, years: number) => {
  if (!principal || !annualRate || !years) return 0;
  const r = (annualRate / 100) / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

export default function CommercialPropertyPublicPage() {
  const [inputs, setInputs] = useState<CPAInputs>(defaultInputs);
  const [propertyType, setPropertyType] = useState<PropertyType>('Retail');
  const [activeTab, setActiveTab] = useState<'inputs' | 'results'>('inputs');

  const isNNN = propertyType === 'NNN Lease';

  const setField = (field: keyof CPAInputs, value: string) => setInputs(prev => ({ ...prev, [field]: value }));

  const handleCurrency = (value: string, field: keyof CPAInputs) => {
    if (value === '' || value === '$') { setField(field, '0'); return; }
    const n = parseInt(value.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(n)) setField(field, fmtCommas(n));
  };

  const handleDecimal = (value: string, field: keyof CPAInputs) => {
    const c = value.replace(/[^0-9.]/g, '');
    const p = c.split('.');
    if (p.length > 2 || (p[1] && p[1].length > 2)) return;
    setField(field, c);
  };

  const outputs = useMemo(() => {
    const pp = parse(inputs.purchasePrice);
    const sqft = parse(inputs.squareFootage);
    const baseRentSF = parse(inputs.baseRentPerSqFt);
    const camSF = parse(inputs.camPerSqFt);
    const otherInc = parse(inputs.otherIncome);
    const vacancy = parseFloat(inputs.vacancyRate) || 0;
    const tTax = parse(inputs.tenantPaysTaxes);
    const tIns = parse(inputs.tenantPaysInsurance);
    const taxes = parse(inputs.propertyTaxes);
    const ins = parse(inputs.insurance);
    const maint = parse(inputs.maintenance);
    const mgmtPct = parseFloat(inputs.propertyManagement) || 0;
    const utils = parse(inputs.utilities);
    const resPct = parseFloat(inputs.reserves) || 0;
    const dpPct = parseFloat(inputs.downPaymentPct) || 30;
    const rate = parseFloat(inputs.interestRate) || 0;
    const amort = parseInt(inputs.amortization) || 25;
    const appRate = parseFloat(inputs.appreciationRate) || 0;
    const holdYrs = parseInt(inputs.holdPeriodYears) || 10;
    const sellCostsPct = parseFloat(inputs.sellingCostsPct) || 4;
    const rentEsc = parseFloat(inputs.rentEscalation) || 0;

    if (!pp || !sqft) return null;

    const annualBaseRent = baseRentSF * sqft;
    const annualCAM = camSF * sqft;
    const grossPotential = annualBaseRent + annualCAM + otherInc;
    const vacancyLoss = grossPotential * (vacancy / 100);
    const egi = grossPotential - vacancyLoss;
    const mgmtExp = egi * (mgmtPct / 100);
    const resExp = egi * (resPct / 100);
    const landlordExp = Math.max(0, taxes - tTax) + Math.max(0, ins - tIns) + maint + mgmtExp + utils + resExp;
    const expRatio = egi > 0 ? (landlordExp / egi) * 100 : 0;
    const noi = egi - landlordExp;
    const pricePerSqFt = sqft > 0 ? pp / sqft : 0;
    const noiPerSqFt = sqft > 0 ? noi / sqft : 0;
    const capRate = pp > 0 ? (noi / pp) * 100 : 0;
    const valuationByCapRate = capRate > 0 ? noi / (capRate / 100) : 0;
    const dp = pp * (dpPct / 100);
    const loanAmt = pp - dp;
    const monthlyPmt = calcPayment(loanAmt, rate, amort);
    const ads = monthlyPmt * 12;
    const dscr = ads > 0 ? noi / ads : 0;
    const debtYield = loanAmt > 0 ? (noi / loanAmt) * 100 : 0;
    const acf = noi - ads;
    const mcf = acf / 12;
    const totalCashIn = dp;
    const coc = totalCashIn > 0 ? (acf / totalCashIn) * 100 : 0;

    const schedule = [];
    let pv = pp, bal = loanAmt;
    const mr = (rate / 100) / 12;
    for (let y = 0; y <= Math.min(holdYrs, 10); y++) {
      const eq = pv - bal;
      schedule.push({ year: y, propertyValue: pv, loanBalance: bal, equity: eq, equityPercent: pv > 0 ? (eq / pv) * 100 : 0 });
      pv = pv * (1 + appRate / 100);
      for (let m = 0; m < 12; m++) {
        if (bal > 0) { const ip = bal * mr; bal = Math.max(0, bal - (monthlyPmt - ip)); }
      }
    }

    const exitYear = schedule[schedule.length - 1];
    const sellCosts = exitYear.propertyValue * (sellCostsPct / 100);
    const saleProceeds = exitYear.propertyValue - exitYear.loanBalance - sellCosts;
    const rentIn5yrs = annualBaseRent * Math.pow(1 + rentEsc / 100, 5);
    const rentIn10yrs = annualBaseRent * Math.pow(1 + rentEsc / 100, 10);

    return {
      annualBaseRent, annualCAM, grossPotential, vacancyLoss, egi,
      landlordExp, expRatio, noi, pricePerSqFt, noiPerSqFt,
      capRate, valuationByCapRate, dp, loanAmt, monthlyPmt, ads, dscr,
      debtYield, acf, mcf, totalCashIn, coc, schedule, exitYear,
      saleProceeds, rentIn5yrs, rentIn10yrs, pp, sqft,
    };
  }, [inputs, propertyType]);

  const pdfData = outputs ? {
    propertyName: 'Commercial Property Analysis',
    reportDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    propertyType, isNNN,
    purchasePrice: outputs.pp, squareFootage: outputs.sqft, pricePerSqFt: outputs.pricePerSqFt,
    baseRent: outputs.annualBaseRent, camRecoveries: outputs.annualCAM, otherIncome: parse(inputs.otherIncome),
    vacancyRate: parseFloat(inputs.vacancyRate) || 0, effectiveGrossIncome: outputs.egi,
    totalExpenses: outputs.landlordExp, expenseRatio: outputs.expRatio,
    noi: outputs.noi, capRate: outputs.capRate, valuationByCapRate: outputs.valuationByCapRate,
    loanAmount: outputs.loanAmt, downPayment: outputs.dp, monthlyPayment: outputs.monthlyPmt,
    annualDebtService: outputs.ads, dscr: outputs.dscr, debtYield: outputs.debtYield,
    annualCashFlow: outputs.acf, monthlyCashFlow: outputs.mcf, cashOnCash: outputs.coc, totalCashInvested: outputs.totalCashIn,
    equitySchedule: outputs.schedule,
    tenantName: inputs.tenantName || undefined,
    rentEscalation: parseFloat(inputs.rentEscalation) || undefined,
  } : null;

  const IField = ({ label, value, field, type = 'currency', suffix }: { label: string; value: string; field: keyof CPAInputs; type?: 'currency' | 'decimal' | 'text'; suffix?: string }) => (
    <div>
      <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
      <div className="relative">
        {type === 'currency' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>}
        <input type="text" value={value}
          onChange={e => type === 'currency' ? handleCurrency(e.target.value, field) : type === 'text' ? setField(field, e.target.value) : handleDecimal(e.target.value, field)}
          className={`w-full ${type === 'currency' ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'} py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sgf-green-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Header */}
        <div className="bg-gradient-to-r from-sgf-green-500 via-sgf-green-600 to-sgf-green-700 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                <Building2 className="w-3 h-3" />Free Professional Tool
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Commercial Property Analyzer</h1>
              <p className="text-sgf-green-100 max-w-xl">Analyze Office, Retail, Industrial, NNN, and all commercial property types with professional-grade metrics.</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {['Cap Rate Analysis', 'NOI Calculator', 'NNN Lease', 'Equity Build', 'Tenant Analysis', 'Market Intel'].map(f => (
                  <span key={f} className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">{f}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <CommercialPropertyExportButton data={pdfData} />
              <a href="https://startinggatefinancial.com/apply" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-sgf-gold-500 hover:bg-sgf-gold-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg transition-all">
                <FileText className="w-4 h-4" />Get Financing
              </a>
            </div>
          </div>
        </div>

        {/* Property Type Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-sgf-green-600" />
            <span className="text-sm font-semibold text-gray-700">Select Property Type</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map(pt => (
              <button key={pt} onClick={() => setPropertyType(pt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${propertyType === pt ? 'bg-sgf-green-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {pt}
              </button>
            ))}
          </div>
          {outputs && (
            <div className="mt-3 flex flex-wrap gap-6 text-xs text-gray-500 border-t pt-3">
              <span>📊 Market Vacancy: <strong className="text-gray-700">{VACANCY_BENCHMARKS[propertyType]}</strong></span>
              <span>📈 Market Cap Rates: <strong className="text-gray-700">{CAP_RATE_BENCHMARKS[propertyType]}</strong></span>
              <span className={`font-semibold ${outputs.capRate >= 5 ? 'text-sgf-green-600' : 'text-yellow-600'}`}>
                ✓ Your Cap Rate: {outputs.capRate.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">

          {/* Left - Inputs */}
          <div className="lg:col-span-1 space-y-4">

            {/* Property & Financing */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b bg-gradient-to-r from-sgf-green-50 to-white flex items-center gap-2">
                <div className="w-7 h-7 bg-sgf-green-500 rounded-lg flex items-center justify-center"><Building2 className="w-3.5 h-3.5 text-white" /></div>
                <span className="font-semibold text-gray-900 text-sm">Property & Financing</span>
              </div>
              <div className="p-4 space-y-3">
                <IField label="Purchase Price" value={inputs.purchasePrice} field="purchasePrice" />
                <IField label="Square Footage" value={inputs.squareFootage} field="squareFootage" type="decimal" suffix="sqft" />
                <IField label="Down Payment %" value={inputs.downPaymentPct} field="downPaymentPct" type="decimal" suffix="%" />
                <IField label="Interest Rate" value={inputs.interestRate} field="interestRate" type="decimal" suffix="%" />
                <IField label="Amortization" value={inputs.amortization} field="amortization" type="decimal" suffix="yrs" />
              </div>
            </div>

            {/* Income */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b bg-gradient-to-r from-sgf-gold-50 to-white flex items-center gap-2">
                <div className="w-7 h-7 bg-sgf-gold-500 rounded-lg flex items-center justify-center"><DollarSign className="w-3.5 h-3.5 text-white" /></div>
                <span className="font-semibold text-gray-900 text-sm">Income</span>
              </div>
              <div className="p-4 space-y-3">
                <IField label="Base Rent ($/sqft/yr)" value={inputs.baseRentPerSqFt} field="baseRentPerSqFt" type="decimal" suffix="$/sf" />
                <IField label="CAM ($/sqft/yr)" value={inputs.camPerSqFt} field="camPerSqFt" type="decimal" suffix="$/sf" />
                <IField label="Other Income" value={inputs.otherIncome} field="otherIncome" />
                <IField label="Vacancy Rate" value={inputs.vacancyRate} field="vacancyRate" type="decimal" suffix="%" />
                {isNNN && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs font-bold text-blue-700 mb-2">NNN — Tenant Pays (Annual):</p>
                    <div className="space-y-2">
                      <IField label="CAM" value={inputs.tenantPaysCAM} field="tenantPaysCAM" />
                      <IField label="Taxes" value={inputs.tenantPaysTaxes} field="tenantPaysTaxes" />
                      <IField label="Insurance" value={inputs.tenantPaysInsurance} field="tenantPaysInsurance" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Expenses */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b bg-gradient-to-r from-gray-50 to-white flex items-center gap-2">
                <div className="w-7 h-7 bg-sgf-green-500 rounded-lg flex items-center justify-center"><BarChart3 className="w-3.5 h-3.5 text-white" /></div>
                <span className="font-semibold text-gray-900 text-sm">Expenses (Landlord)</span>
              </div>
              <div className="p-4 space-y-3">
                <IField label="Property Taxes" value={inputs.propertyTaxes} field="propertyTaxes" />
                <IField label="Insurance" value={inputs.insurance} field="insurance" />
                <IField label="Maintenance" value={inputs.maintenance} field="maintenance" />
                <IField label="Property Mgmt %" value={inputs.propertyManagement} field="propertyManagement" type="decimal" suffix="%" />
                <IField label="Utilities" value={inputs.utilities} field="utilities" />
                <IField label="Reserves %" value={inputs.reserves} field="reserves" type="decimal" suffix="%" />
              </div>
            </div>

            {/* Assumptions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b bg-gradient-to-r from-gray-50 to-white flex items-center gap-2">
                <div className="w-7 h-7 bg-sgf-gold-500 rounded-lg flex items-center justify-center"><TrendingUp className="w-3.5 h-3.5 text-white" /></div>
                <span className="font-semibold text-gray-900 text-sm">Assumptions</span>
              </div>
              <div className="p-4 space-y-3">
                <IField label="Appreciation Rate" value={inputs.appreciationRate} field="appreciationRate" type="decimal" suffix="%" />
                <IField label="Hold Period" value={inputs.holdPeriodYears} field="holdPeriodYears" type="decimal" suffix="yrs" />
                <IField label="Selling Costs" value={inputs.sellingCostsPct} field="sellingCostsPct" type="decimal" suffix="%" />
                <IField label="Rent Escalation" value={inputs.rentEscalation} field="rentEscalation" type="decimal" suffix="%" />
              </div>
            </div>
          </div>

          {/* Right - Results */}
          <div className="lg:col-span-2 space-y-4">
            <GatedCalculator requiredPlan="core" calculatorSlug="commercial-property">
            {outputs ? (
              <>
                {/* Key Metrics Banner */}
                <div className="bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 rounded-xl p-5 text-white">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div><div className="text-sgf-green-100 text-xs mb-1">NOI</div><div className="text-xl font-bold">{fmt(outputs.noi)}</div></div>
                    <div><div className="text-sgf-green-100 text-xs mb-1">Cap Rate</div><div className="text-xl font-bold">{outputs.capRate.toFixed(2)}%</div></div>
                    <div><div className="text-sgf-green-100 text-xs mb-1">DSCR</div>
                      <div className={`text-xl font-bold ${outputs.dscr >= 1.25 ? 'text-white' : outputs.dscr >= 1.15 ? 'text-yellow-300' : 'text-red-300'}`}>{outputs.dscr.toFixed(2)}x</div>
                    </div>
                    <div><div className="text-sgf-green-100 text-xs mb-1">Cash-on-Cash</div><div className="text-xl font-bold">{outputs.coc.toFixed(1)}%</div></div>
                  </div>
                </div>

                {/* Income & Valuation */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b bg-gradient-to-r from-sgf-green-50 to-white"><h3 className="font-semibold text-gray-900 text-sm">Income Statement</h3></div>
                    <div className="p-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">Base Rent</span><span className="font-mono">{fmt(outputs.annualBaseRent)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">CAM Income</span><span className="font-mono">{fmt(outputs.annualCAM)}</span></div>
                      <div className="flex justify-between text-red-500"><span>Vacancy Loss</span><span className="font-mono">({fmt(outputs.vacancyLoss)})</span></div>
                      <div className="flex justify-between border-t pt-1"><span className="font-semibold">EGI</span><span className="font-mono font-semibold">{fmt(outputs.egi)}</span></div>
                      <div className="flex justify-between text-red-500"><span>Expenses</span><span className="font-mono">({fmt(outputs.landlordExp)})</span></div>
                      <div className="flex justify-between bg-sgf-green-50 px-2 py-1 rounded"><span className="text-sgf-green-700 font-bold">NOI</span><span className="font-mono font-bold text-sgf-green-700">{fmt(outputs.noi)}</span></div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b bg-gradient-to-r from-sgf-gold-50 to-white"><h3 className="font-semibold text-gray-900 text-sm">Valuation Metrics</h3></div>
                    <div className="p-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">Price/SqFt</span><span className="font-mono">{fmt(outputs.pricePerSqFt)}/sf</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">NOI/SqFt</span><span className="font-mono">{fmt(outputs.noiPerSqFt)}/sf</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Cap Rate</span><span className="font-mono font-semibold text-sgf-green-600">{outputs.capRate.toFixed(2)}%</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Implied Value</span><span className="font-mono">{fmt(outputs.valuationByCapRate)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Debt Yield</span><span className="font-mono">{outputs.debtYield.toFixed(2)}%</span></div>
                      <div className="flex justify-between bg-sgf-gold-50 px-2 py-1 rounded"><span className="text-sgf-gold-700 font-bold">DSCR</span><span className={`font-mono font-bold ${outputs.dscr >= 1.25 ? 'text-sgf-green-600' : 'text-red-600'}`}>{outputs.dscr.toFixed(2)}x</span></div>
                    </div>
                  </div>
                </div>

                {/* Returns */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-white"><h3 className="font-semibold text-gray-900 text-sm">Investment Returns</h3></div>
                  <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-center">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Monthly Cash Flow</div>
                      <div className={`font-bold text-lg ${outputs.mcf >= 0 ? 'text-sgf-green-600' : 'text-red-600'}`}>{fmt(outputs.mcf)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Cash-on-Cash</div>
                      <div className="font-bold text-lg text-sgf-green-600">{outputs.coc.toFixed(1)}%</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Exit Value</div>
                      <div className="font-bold text-lg">{fmt(outputs.exitYear.propertyValue)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Sale Proceeds</div>
                      <div className="font-bold text-lg text-sgf-green-600">{fmt(outputs.saleProceeds)}</div>
                    </div>
                  </div>
                </div>

                {/* Equity Schedule */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b bg-gradient-to-r from-sgf-green-50 to-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-sgf-green-600" />
                    <h3 className="font-semibold text-gray-900 text-sm">{inputs.holdPeriodYears}-Year Equity Build</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-sgf-green-600 text-white text-xs">
                        <th className="px-3 py-2 text-center">Year</th>
                        <th className="px-3 py-2 text-right">Value</th>
                        <th className="px-3 py-2 text-right">Loan Bal</th>
                        <th className="px-3 py-2 text-right">Equity</th>
                        <th className="px-3 py-2 text-right">Equity %</th>
                      </tr></thead>
                      <tbody>
                        {outputs.schedule.map((row, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-1.5 text-center font-semibold text-xs">Yr {row.year}</td>
                            <td className="px-3 py-1.5 text-right font-mono text-xs">{fmt(row.propertyValue)}</td>
                            <td className="px-3 py-1.5 text-right font-mono text-xs text-red-500">{fmt(row.loanBalance)}</td>
                            <td className="px-3 py-1.5 text-right font-mono text-xs text-sgf-green-600 font-semibold">{fmt(row.equity)}</td>
                            <td className="px-3 py-1.5 text-right font-mono text-xs">{row.equityPercent.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Market Intel CTA */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b bg-gradient-to-r from-sgf-gold-50 to-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-sgf-gold-600" />
                      <h3 className="font-semibold text-gray-900 text-sm">Market Intelligence</h3>
                    </div>
                    <span className="text-xs bg-sgf-gold-100 text-sgf-gold-700 px-2 py-1 rounded-full font-bold">Live Data</span>
                  </div>
                  <div className="p-4 grid md:grid-cols-3 gap-3">
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(`${propertyType} commercial real estate cap rates 2025`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-sgf-green-50 border border-sgf-green-200 text-sgf-green-700 px-3 py-2.5 rounded-lg text-xs font-semibold hover:bg-sgf-green-100 transition-colors">
                      <Search className="w-3.5 h-3.5 flex-shrink-0" />{propertyType} Cap Rates 2025
                    </a>
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(`${propertyType} commercial real estate market trends 2025`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2.5 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                      <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />{propertyType} Market Trends
                    </a>
                    <a href="https://www.costar.com" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 px-3 py-2.5 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors">
                      <Building2 className="w-3.5 h-3.5 flex-shrink-0" />CoStar Market Data
                    </a>
                  </div>
                </div>

              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-sgf-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-sgf-green-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Enter Property Details</h3>
                <p className="text-gray-500 text-sm">Fill in the inputs on the left to see your commercial property analysis.</p>
              </div>
            )}
            </GatedCalculator>
          </div>
        </div>

        {/* Save to Deal CTA */}
        <div className="bg-gradient-to-r from-sgf-green-600 to-sgf-green-700 rounded-2xl p-8 text-white relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Save This Analysis to a Deal</h2>
              <p className="text-sgf-green-100 text-sm max-w-lg">Create a free account to save your analysis, track multiple properties, generate PDF reports, and get financing from Starting Gate Financial.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/api/auth/signin" className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-sgf-gold-600 transition-colors shadow-lg">
                <Save className="w-4 h-4" />Save Analysis Free
              </a>
              <a href="https://startinggatefinancial.com/apply" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 border-2 border-white/30 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-white/20 transition-colors">
                <MessageSquare className="w-4 h-4" />Talk to a Lender
              </a>
            </div>
          </div>
        </div>

        <PremiumProductsCTA />
      </div>
    </div>
  );
}
