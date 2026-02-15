'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, CheckCircle, DollarSign, Building2,
  Calculator, TrendingUp, BarChart3, FileText, MessageSquare,
  Search, Users, MapPin
} from 'lucide-react';
import CommercialPropertyExportButton from '@/components/calculators/CommercialPropertyExportButton';

type PropertyType = 'Office' | 'Retail' | 'Industrial' | 'Mixed-Use' | 'Multifamily (5+)' | 'Self-Storage' | 'NNN Lease' | 'Medical Office' | 'Warehouse';
type LeaseType = 'Gross' | 'Modified Gross' | 'NNN' | 'Double Net' | 'Absolute NNN';

interface CPAInputs {
  // Property
  purchasePrice: string; squareFootage: string; yearBuilt: string;
  // Income
  baseRentPerSqFt: string; camPerSqFt: string; otherIncome: string; vacancyRate: string;
  // NNN (tenant pays)
  tenantPaysCAM: string; tenantPaysTaxes: string; tenantPaysInsurance: string;
  // Expenses (landlord)
  propertyTaxes: string; insurance: string; maintenance: string;
  propertyManagement: string; utilities: string; reserves: string;
  // Financing
  downPaymentPct: string; interestRate: string; loanTerm: string; amortization: string;
  // Assumptions
  appreciationRate: string; holdPeriodYears: string; sellingCostsPct: string;
  // Tenant
  tenantName: string; leaseType: LeaseType; leaseTerm: string; leaseExpiration: string; rentEscalation: string;
}

const defaultInputs: CPAInputs = {
  purchasePrice: '2,000,000', squareFootage: '10,000', yearBuilt: '2005',
  baseRentPerSqFt: '25', camPerSqFt: '5', otherIncome: '0', vacancyRate: '5',
  tenantPaysCAM: '0', tenantPaysTaxes: '0', tenantPaysInsurance: '0',
  propertyTaxes: '20,000', insurance: '8,000', maintenance: '15,000',
  propertyManagement: '4', utilities: '0', reserves: '1',
  downPaymentPct: '30', interestRate: '7.25', loanTerm: '10', amortization: '25',
  appreciationRate: '3', holdPeriodYears: '10', sellingCostsPct: '4',
  tenantName: '', leaseType: 'NNN', leaseTerm: '10', leaseExpiration: '', rentEscalation: '2',
};

const PROPERTY_TYPES: PropertyType[] = ['Office', 'Retail', 'Industrial', 'Mixed-Use', 'Multifamily (5+)', 'Self-Storage', 'NNN Lease', 'Medical Office', 'Warehouse'];
const LEASE_TYPES: LeaseType[] = ['Gross', 'Modified Gross', 'NNN', 'Double Net', 'Absolute NNN'];

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

// Vacancy benchmarks by property type
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

export default function CommercialPropertyAnalyzerPage() {
  const params = useParams();
  const dealId = params?.dealId as string;
  const [dealName, setDealName] = useState('Commercial Property Analysis');
  const [propertyType, setPropertyType] = useState<PropertyType>('Retail');
  const [inputs, setInputs] = useState<CPAInputs>(defaultInputs);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'property' | 'tenant' | 'market'>('property');

  const isNNN = propertyType === 'NNN Lease' || inputs.leaseType === 'NNN' || inputs.leaseType === 'Absolute NNN';

  const setField = (field: keyof CPAInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    setSaveStatus('idle');
  };

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

  useEffect(() => {
    if (!dealId) return;
    const fetch_ = async () => {
      try {
        const dr = await fetch(`/api/deals/${dealId}`);
        if (dr.ok) { const d = await dr.json(); setDealName(d.name || 'Commercial Property'); }
        const ar = await fetch(`/api/deals/${dealId}/analyses`);
        if (ar.ok) {
          const analyses = await ar.json();
          const ex = analyses.find((a: { type: string }) => a.type === 'commercial-property');
          if (ex) {
            setAnalysisId(ex.id);
            if (ex.inputs) setInputs(prev => ({ ...prev, ...ex.inputs }));
            if (ex.propertyType) setPropertyType(ex.propertyType);
          }
        }
      } catch (e) { console.error(e); }
    };
    fetch_();
  }, [dealId]);

  const outputs = useMemo(() => {
    const pp = parse(inputs.purchasePrice);
    const sqft = parse(inputs.squareFootage);
    const baseRentSF = parse(inputs.baseRentPerSqFt);
    const camSF = parse(inputs.camPerSqFt);
    const otherInc = parse(inputs.otherIncome);
    const vacancy = parseFloat(inputs.vacancyRate) || 0;
    const tCAM = parse(inputs.tenantPaysCAM);
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
    const loanTerm = parseInt(inputs.loanTerm) || 10;
    const amort = parseInt(inputs.amortization) || 25;
    const appRate = parseFloat(inputs.appreciationRate) || 0;
    const holdYrs = parseInt(inputs.holdPeriodYears) || 10;
    const sellCostsPct = parseFloat(inputs.sellingCostsPct) || 4;
    const rentEsc = parseFloat(inputs.rentEscalation) || 0;

    if (!pp || !sqft) return null;

    // Income
    const annualBaseRent = baseRentSF * sqft;
    const annualCAM = camSF * sqft;
    const grossPotential = annualBaseRent + annualCAM + otherInc;
    const vacancyLoss = grossPotential * (vacancy / 100);
    const egi = grossPotential - vacancyLoss;

    // NNN pass-throughs (tenant pays directly, reduce landlord expenses)
    const nnnPassthrough = tCAM + tTax + tIns;

    // Landlord Expenses
    const mgmtExp = egi * (mgmtPct / 100);
    const resExp = egi * (resPct / 100);
    const landlordExp = Math.max(0, taxes - tTax) + Math.max(0, ins - tIns) + maint + mgmtExp + utils + resExp;
    const totalExp = landlordExp;
    const expRatio = egi > 0 ? (totalExp / egi) * 100 : 0;

    // NOI
    const noi = egi - totalExp;

    // Valuation
    const pricePerSqFt = sqft > 0 ? pp / sqft : 0;
    const noiPerSqFt = sqft > 0 ? noi / sqft : 0;
    const capRate = pp > 0 ? (noi / pp) * 100 : 0;
    const valuationByCapRate = capRate > 0 ? noi / (capRate / 100) : 0;

    // Financing
    const dp = pp * (dpPct / 100);
    const loanAmt = pp - dp;
    const monthlyPmt = calcPayment(loanAmt, rate, amort);
    const ads = monthlyPmt * 12;
    const dscr = ads > 0 ? noi / ads : 0;
    const debtYield = loanAmt > 0 ? (noi / loanAmt) * 100 : 0;
    const ltv = pp > 0 ? (loanAmt / pp) * 100 : 0;

    // Cash Flow
    const acf = noi - ads;
    const mcf = acf / 12;
    const totalCashIn = dp;
    const coc = totalCashIn > 0 ? (acf / totalCashIn) * 100 : 0;

    // Equity Build Schedule
    const schedule = [];
    let pv = pp;
    let bal = loanAmt;
    const mr = (rate / 100) / 12;
    for (let y = 0; y <= holdYrs; y++) {
      const eq = pv - bal;
      schedule.push({ year: y, propertyValue: pv, loanBalance: bal, equity: eq, equityPercent: pv > 0 ? (eq / pv) * 100 : 0 });
      pv = pv * (1 + appRate / 100);
      for (let m = 0; m < 12; m++) {
        if (bal > 0) { const ip = bal * mr; bal = Math.max(0, bal - (monthlyPmt - ip)); }
      }
    }

    const exitYear = schedule[holdYrs];
    const sellCosts = exitYear.propertyValue * (sellCostsPct / 100);
    const saleProceeds = exitYear.propertyValue - exitYear.loanBalance - sellCosts;
    const totalReturn = (acf * holdYrs) + saleProceeds - dp;
    const totalROI = dp > 0 ? (totalReturn / dp) * 100 : 0;

    // Rent growth projection
    const rentIn5yrs = annualBaseRent * Math.pow(1 + rentEsc / 100, 5);
    const rentIn10yrs = annualBaseRent * Math.pow(1 + rentEsc / 100, 10);

    return {
      annualBaseRent, annualCAM, grossPotential, vacancyLoss, egi,
      nnnPassthrough, totalExp, expRatio, noi, pricePerSqFt, noiPerSqFt,
      capRate, valuationByCapRate, dp, loanAmt, monthlyPmt, ads, dscr,
      debtYield, ltv, acf, mcf, totalCashIn, coc, schedule,
      exitYear, saleProceeds, totalReturn, totalROI,
      rentIn5yrs, rentIn10yrs, pp, sqft,
    };
  }, [inputs, propertyType]);

  const handleSave = async () => {
    if (!outputs || !dealId) return;
    setSaveStatus('saving');
    try {
      const payload = {
        type: 'commercial-property', propertyType,
        inputs,
        outputs: { noi: outputs.noi, capRate: outputs.capRate, dscr: outputs.dscr, coc: outputs.coc, acf: outputs.acf },
      };
      const url = analysisId ? `/api/deals/${dealId}/analyses/${analysisId}` : `/api/deals/${dealId}/analyses`;
      const res = await fetch(url, { method: analysisId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { const d = await res.json(); if (!analysisId) setAnalysisId(d.id); setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 3000); }
      else setSaveStatus('error');
    } catch { setSaveStatus('error'); }
  };

  const pdfData = outputs ? {
    propertyName: dealName, reportDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    propertyType, isNNN,
    purchasePrice: outputs.pp, squareFootage: outputs.sqft, pricePerSqFt: outputs.pricePerSqFt,
    baseRent: outputs.annualBaseRent, camRecoveries: outputs.annualCAM, otherIncome: parse(inputs.otherIncome),
    vacancyRate: parseFloat(inputs.vacancyRate) || 0, effectiveGrossIncome: outputs.egi,
    totalExpenses: outputs.totalExp, expenseRatio: outputs.expRatio,
    noi: outputs.noi, capRate: outputs.capRate, valuationByCapRate: outputs.valuationByCapRate,
    loanAmount: outputs.loanAmt, downPayment: outputs.dp, monthlyPayment: outputs.monthlyPmt,
    annualDebtService: outputs.ads, dscr: outputs.dscr, debtYield: outputs.debtYield,
    annualCashFlow: outputs.acf, monthlyCashFlow: outputs.mcf, cashOnCash: outputs.coc, totalCashInvested: outputs.totalCashIn,
    equitySchedule: outputs.schedule,
    tenantName: inputs.tenantName || undefined, leaseType: inputs.leaseType,
    leaseTerm: parseInt(inputs.leaseTerm) || undefined, leaseExpiration: inputs.leaseExpiration || undefined,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <Link href={`/app/deals/${dealId}`} className="inline-flex items-center gap-2 text-sgf-green-600 hover:text-sgf-green-700 font-medium mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" />Back to Deal
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-sgf-green-600 via-sgf-green-700 to-sgf-green-800 rounded-2xl p-6 shadow-xl relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-2">
                <Building2 className="w-3 h-3" />Commercial Property
              </div>
              <h1 className="text-2xl font-bold text-white">Commercial Property Analyzer</h1>
              <p className="text-sgf-green-100 text-sm mt-1">{dealName} · {propertyType}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {saveStatus === 'saved' && <div className="flex items-center gap-1 text-sgf-green-100 text-sm"><CheckCircle className="w-4 h-4" />Saved</div>}
              <CommercialPropertyExportButton data={pdfData} />
              <button onClick={handleSave} disabled={saveStatus === 'saving' || !outputs}
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50">
                <Save className="w-4 h-4" />{saveStatus === 'saving' ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Property Type Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-sgf-green-600" />
            <span className="text-sm font-semibold text-gray-700">Property Type</span>
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
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500 border-t pt-3">
              <span>📊 Market Vacancy: <strong className="text-gray-700">{VACANCY_BENCHMARKS[propertyType]}</strong></span>
              <span>📈 Market Cap Rate: <strong className="text-gray-700">{CAP_RATE_BENCHMARKS[propertyType]}</strong></span>
              <span className={`font-semibold ${outputs.capRate >= parseFloat(CAP_RATE_BENCHMARKS[propertyType].split('-')[0]) ? 'text-sgf-green-600' : 'text-yellow-600'}`}>
                Your Cap Rate: {outputs.capRate.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'property', label: 'Property & Financials', icon: <Calculator className="w-4 h-4" /> },
            { id: 'tenant', label: 'Tenant & Lease', icon: <Users className="w-4 h-4" /> },
            { id: 'market', label: 'Market Intelligence', icon: <Search className="w-4 h-4" /> },
          ].map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id as typeof activeSection)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSection === s.id ? 'bg-sgf-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {s.icon}{s.label}
            </button>
          ))}
        </div>

        {/* Property & Financials Section */}
        {activeSection === 'property' && (
          <div className="grid lg:grid-cols-4 gap-6 mb-6">
            {/* Property Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
                <div className="w-8 h-8 bg-sgf-green-500 rounded-lg flex items-center justify-center"><Building2 className="w-4 h-4 text-white" /></div>
                <span className="font-semibold text-gray-900 text-sm">Property Details</span>
              </div>
              <div className="p-4 space-y-3">
                <IField label="Purchase Price" value={inputs.purchasePrice} field="purchasePrice" />
                <IField label="Square Footage" value={inputs.squareFootage} field="squareFootage" type="decimal" suffix="sqft" />
                <IField label="Year Built" value={inputs.yearBuilt} field="yearBuilt" type="decimal" />
                <IField label="Down Payment %" value={inputs.downPaymentPct} field="downPaymentPct" type="decimal" suffix="%" />
                <IField label="Interest Rate" value={inputs.interestRate} field="interestRate" type="decimal" suffix="%" />
                <IField label="Amortization" value={inputs.amortization} field="amortization" type="decimal" suffix="yrs" />
              </div>
            </div>

            {/* Income */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
                <div className="w-8 h-8 bg-sgf-gold-500 rounded-lg flex items-center justify-center"><DollarSign className="w-4 h-4 text-white" /></div>
                <span className="font-semibold text-gray-900 text-sm">Income</span>
              </div>
              <div className="p-4 space-y-3">
                <IField label="Base Rent ($/sqft/yr)" value={inputs.baseRentPerSqFt} field="baseRentPerSqFt" type="decimal" suffix="$/sf" />
                <IField label="CAM ($/sqft/yr)" value={inputs.camPerSqFt} field="camPerSqFt" type="decimal" suffix="$/sf" />
                <IField label="Other Income (Annual)" value={inputs.otherIncome} field="otherIncome" />
                <IField label="Vacancy Rate" value={inputs.vacancyRate} field="vacancyRate" type="decimal" suffix="%" />
                {isNNN && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                    <div className="text-xs font-bold text-blue-700 mb-2">NNN - Tenant Pays:</div>
                    <IField label="CAM (Annual)" value={inputs.tenantPaysCAM} field="tenantPaysCAM" />
                    <div className="mt-2"><IField label="Taxes (Annual)" value={inputs.tenantPaysTaxes} field="tenantPaysTaxes" /></div>
                    <div className="mt-2"><IField label="Insurance (Annual)" value={inputs.tenantPaysInsurance} field="tenantPaysInsurance" /></div>
                  </div>
                )}
              </div>
            </div>

            {/* Expenses */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
                <div className="w-8 h-8 bg-sgf-green-500 rounded-lg flex items-center justify-center"><BarChart3 className="w-4 h-4 text-white" /></div>
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
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
                <div className="w-8 h-8 bg-sgf-gold-500 rounded-lg flex items-center justify-center"><TrendingUp className="w-4 h-4 text-white" /></div>
                <span className="font-semibold text-gray-900 text-sm">Assumptions</span>
              </div>
              <div className="p-4 space-y-3">
                <IField label="Appreciation Rate" value={inputs.appreciationRate} field="appreciationRate" type="decimal" suffix="%" />
                <IField label="Hold Period" value={inputs.holdPeriodYears} field="holdPeriodYears" type="decimal" suffix="yrs" />
                <IField label="Selling Costs" value={inputs.sellingCostsPct} field="sellingCostsPct" type="decimal" suffix="%" />
              </div>
            </div>
          </div>
        )}

        {/* Tenant & Lease Section */}
        {activeSection === 'tenant' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-8 h-8 bg-sgf-green-500 rounded-lg flex items-center justify-center"><Users className="w-4 h-4 text-white" /></div>
              <span className="font-semibold text-gray-900">Tenant & Lease Analysis</span>
            </div>
            <div className="p-6 grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 text-sm border-b pb-2">Tenant Info</h3>
                <IField label="Tenant Name" value={inputs.tenantName} field="tenantName" type="text" />
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Lease Type</label>
                  <select value={inputs.leaseType} onChange={e => setField('leaseType', e.target.value as LeaseType)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-sgf-green-500 focus:outline-none">
                    {LEASE_TYPES.map(lt => <option key={lt} value={lt}>{lt}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 text-sm border-b pb-2">Lease Terms</h3>
                <IField label="Lease Term (years)" value={inputs.leaseTerm} field="leaseTerm" type="decimal" suffix="yrs" />
                <IField label="Lease Expiration" value={inputs.leaseExpiration} field="leaseExpiration" type="text" />
                <IField label="Rent Escalation" value={inputs.rentEscalation} field="rentEscalation" type="decimal" suffix="%" />
              </div>
              {outputs && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 text-sm border-b pb-2">Rent Projections</h3>
                  <div className="bg-sgf-green-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Annual Rent</span>
                      <span className="font-bold text-sgf-green-700">{fmt(outputs.annualBaseRent)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rent in Year 5</span>
                      <span className="font-bold">{fmt(outputs.rentIn5yrs)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rent in Year 10</span>
                      <span className="font-bold">{fmt(outputs.rentIn10yrs)}</span>
                    </div>
                    <div className="border-t pt-2 text-xs text-gray-500">
                      Based on {inputs.rentEscalation}% annual escalation
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Market Intelligence Section */}
        {activeSection === 'market' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-sgf-green-50 to-white">
              <div className="w-8 h-8 bg-sgf-green-500 rounded-lg flex items-center justify-center"><Search className="w-4 h-4 text-white" /></div>
              <span className="font-semibold text-gray-900">Market Intelligence</span>
              <span className="ml-auto text-xs bg-sgf-gold-100 text-sgf-gold-700 px-2 py-1 rounded-full font-bold">Pro Feature</span>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-sgf-green-600" />Market Benchmarks</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Property Type</span><span className="font-bold">{propertyType}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Market Vacancy</span><span className="font-bold">{VACANCY_BENCHMARKS[propertyType]}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Market Cap Rates</span><span className="font-bold">{CAP_RATE_BENCHMARKS[propertyType]}</span></div>
                    {outputs && <div className="flex justify-between border-t pt-2"><span className="text-gray-600">Your Cap Rate</span><span className={`font-bold ${outputs.capRate >= 5 ? 'text-sgf-green-600' : 'text-yellow-600'}`}>{outputs.capRate.toFixed(2)}%</span></div>}
                    {outputs && <div className="flex justify-between"><span className="text-gray-600">Your Price/SqFt</span><span className="font-bold">{fmt(outputs.pricePerSqFt)}/sqft</span></div>}
                  </div>
                </div>
                <div className="bg-sgf-gold-50 rounded-xl p-5 border border-sgf-gold-200">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Search className="w-4 h-4 text-sgf-gold-600" />Live Market Search</h3>
                  <p className="text-sm text-gray-600 mb-4">Search for current market trends, comparable sales, and cap rate data for your specific market.</p>
                  <div className="space-y-3">
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(`${propertyType} commercial real estate cap rates 2025 trends`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors w-full">
                      <Search className="w-4 h-4 text-sgf-green-600" />Search {propertyType} Cap Rates 2025
                    </a>
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(`${propertyType} commercial real estate market trends investment 2025`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors w-full">
                      <TrendingUp className="w-4 h-4 text-sgf-gold-500" />Search {propertyType} Market Trends
                    </a>
                    <a href="https://www.costar.com" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors w-full">
                      <Building2 className="w-4 h-4 text-blue-600" />CoStar Market Data
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Banner */}
        {outputs && (
          <>
            <div className="bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 rounded-xl p-6 mb-6 text-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div><div className="text-sgf-green-100 text-sm mb-1">NOI</div><div className="text-2xl font-bold">{fmt(outputs.noi)}</div></div>
                <div><div className="text-sgf-green-100 text-sm mb-1">Cap Rate</div><div className="text-2xl font-bold">{outputs.capRate.toFixed(2)}%</div></div>
                <div><div className="text-sgf-green-100 text-sm mb-1">DSCR</div><div className="text-2xl font-bold">{outputs.dscr.toFixed(2)}x</div></div>
                <div><div className="text-sgf-green-100 text-sm mb-1">Cash-on-Cash</div><div className="text-2xl font-bold">{outputs.coc.toFixed(1)}%</div></div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b bg-gradient-to-r from-sgf-green-50 to-white"><h3 className="font-semibold text-gray-900 text-sm">Income Statement</h3></div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Annual Base Rent</span><span className="font-mono">{fmt(outputs.annualBaseRent)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">CAM Income</span><span className="font-mono">{fmt(outputs.annualCAM)}</span></div>
                  <div className="flex justify-between text-red-600"><span>Vacancy Loss</span><span className="font-mono">({fmt(outputs.vacancyLoss)})</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="font-semibold">EGI</span><span className="font-mono font-semibold">{fmt(outputs.egi)}</span></div>
                  <div className="flex justify-between text-red-600"><span>Less: Expenses</span><span className="font-mono">({fmt(outputs.totalExp)})</span></div>
                  <div className="flex justify-between border-t pt-2 bg-sgf-green-50 px-2 py-1 rounded"><span className="text-sgf-green-700 font-bold">NOI</span><span className="font-mono font-bold text-sgf-green-700">{fmt(outputs.noi)}</span></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b bg-gradient-to-r from-sgf-gold-50 to-white"><h3 className="font-semibold text-gray-900 text-sm">Valuation Metrics</h3></div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Purchase Price</span><span className="font-mono">{fmt(outputs.pp)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Price per SqFt</span><span className="font-mono">{fmt(outputs.pricePerSqFt)}/sf</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">NOI per SqFt</span><span className="font-mono">{fmt(outputs.noiPerSqFt)}/sf</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Implied Value @ Cap</span><span className="font-mono">{fmt(outputs.valuationByCapRate)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">DSCR</span><span className={`font-mono font-bold ${outputs.dscr >= 1.25 ? 'text-sgf-green-600' : outputs.dscr >= 1.15 ? 'text-yellow-600' : 'text-red-600'}`}>{outputs.dscr.toFixed(2)}x</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Debt Yield</span><span className="font-mono">{outputs.debtYield.toFixed(2)}%</span></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-white"><h3 className="font-semibold text-gray-900 text-sm">Investment Returns</h3></div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Annual Cash Flow</span><span className={`font-mono font-semibold ${outputs.acf >= 0 ? 'text-sgf-green-600' : 'text-red-600'}`}>{fmt(outputs.acf)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Monthly Cash Flow</span><span className={`font-mono ${outputs.mcf >= 0 ? 'text-sgf-green-600' : 'text-red-600'}`}>{fmt(outputs.mcf)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Cash-on-Cash</span><span className="font-mono font-semibold">{outputs.coc.toFixed(2)}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Exit Value</span><span className="font-mono">{fmt(outputs.exitYear.propertyValue)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Sale Proceeds</span><span className="font-mono text-sgf-green-600">{fmt(outputs.saleProceeds)}</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="font-semibold">Total ROI</span><span className="font-mono font-bold text-sgf-green-600">{outputs.totalROI.toFixed(1)}%</span></div>
                </div>
              </div>
            </div>

            {/* Equity Schedule */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="px-4 py-3 border-b bg-gradient-to-r from-sgf-green-50 to-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sgf-green-600" />
                <h3 className="font-semibold text-gray-900 text-sm">{inputs.holdPeriodYears}-Year Equity Build Schedule</h3>
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
                    {outputs.schedule.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 text-center font-semibold">Year {row.year}</td>
                        <td className="px-4 py-2 text-right font-mono">{fmt(row.propertyValue)}</td>
                        <td className="px-4 py-2 text-right font-mono text-red-600">{fmt(row.loanBalance)}</td>
                        <td className="px-4 py-2 text-right font-mono text-sgf-green-600 font-semibold">{fmt(row.equity)}</td>
                        <td className="px-4 py-2 text-right font-mono">{row.equityPercent.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Financing CTA */}
        <div className="bg-gradient-to-r from-sgf-green-600 to-sgf-green-800 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />Ready to Finance?
              </div>
              <h2 className="text-2xl font-bold mb-2">Commercial Real Estate Financing</h2>
              <p className="text-sgf-green-100 max-w-lg text-sm">Starting Gate Financial specializes in commercial real estate loans — office, retail, industrial, NNN, and mixed-use properties.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="https://startinggatefinancial.com/apply" className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-sgf-gold-600 transition-colors shadow-lg">
                <FileText className="w-4 h-4" />Apply for CRE Loan
              </a>
              <a href="https://startinggatefinancial.com/contact" className="inline-flex items-center gap-2 bg-white/10 border-2 border-white/30 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-white/20 transition-colors">
                <MessageSquare className="w-4 h-4" />Talk to a Lender
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
