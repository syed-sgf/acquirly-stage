'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DollarSign, Building2, Calculator, BarChart3, FileText, MessageSquare, Save, ArrowLeft, CheckCircle } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import CRELoanSizerExportButton from '@/components/calculators/CRELoanSizerExportButton';

interface CREInputs {
  propertyType: string;
  propertyValue: string;
  purchasePrice: string;
  grossPotentialRent: string;
  otherIncome: string;
  vacancyRate: string;
  operatingExpenses: string;
  propertyTaxes: string;
  insurance: string;
  managementFee: string;
  reserves: string;
  interestRate: string;
  amortization: string;
  loanTerm: string;
  targetDSCR: string;
  maxLTV: string;
}

const defaultInputs: CREInputs = {
  propertyType: 'Multifamily',
  propertyValue: '2,000,000',
  purchasePrice: '1,900,000',
  grossPotentialRent: '240,000',
  otherIncome: '12,000',
  vacancyRate: '5',
  operatingExpenses: '48,000',
  propertyTaxes: '24,000',
  insurance: '8,000',
  managementFee: '5',
  reserves: '3',
  interestRate: '7.5',
  amortization: '25',
  loanTerm: '10',
  targetDSCR: '1.25',
  maxLTV: '75',
};

const PROPERTY_TYPES = [
  'Multifamily', 'Office', 'Retail', 'Industrial', 'Mixed-Use',
  'Self-Storage', 'Hospitality', 'Healthcare', 'Other'
];

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const parseCurrencyInput = (value: string): number =>
  parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;

const formatNumberWithCommas = (value: number): string =>
  isNaN(value) || value === 0 ? '0' : value.toLocaleString('en-US');

const handleCurrencyChange = (
  value: string,
  setter: (field: keyof CREInputs, value: string) => void,
  field: keyof CREInputs
) => {
  if (value === '' || value === '$') { setter(field, '0'); return; }
  const numericValue = value.replace(/[^0-9]/g, '');
  const number = parseInt(numericValue, 10);
  if (!isNaN(number)) setter(field, formatNumberWithCommas(number));
};

const handlePercentChangeUtil = (
  value: string,
  setter: (field: keyof CREInputs, value: string) => void,
  field: keyof CREInputs
) => {
  if (value === '') { setter(field, '0'); return; }
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) return;
  if (parts[1] && parts[1].length > 2) return;
  setter(field, cleaned);
};

const calculateMonthlyPayment = (principal: number, annualRate: number, years: number): number => {
  if (!principal || !annualRate || !years) return 0;
  const monthlyRate = (annualRate / 100) / 12;
  const numPayments = years * 12;
  if (monthlyRate === 0) return principal / numPayments;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
};

export default function CRELoanSizerDealPage() {
  const params = useParams();
  const dealId = params?.dealId as string;
  const [dealName, setDealName] = useState<string>('CRE Property Analysis');
  const [inputs, setInputs] = useState<CREInputs>(defaultInputs);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const handleInputChange = (field: keyof CREInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    setSaveStatus('idle');
  };

  // Fetch deal name and existing analysis
  useEffect(() => {
    if (!dealId) return;
    const fetchData = async () => {
      try {
        const dealRes = await fetch(`/api/deals/${dealId}`);
        if (dealRes.ok) {
          const deal = await dealRes.json();
          setDealName(deal.name || 'CRE Property Analysis');
        }
        const analysisRes = await fetch(`/api/deals/${dealId}/analyses`);
        if (analysisRes.ok) {
          const analyses = await analysisRes.json();
          const creAnalysis = analyses.find((a: { type: string }) => a.type === 'cre-loan-sizer');
          if (creAnalysis) {
            setAnalysisId(creAnalysis.id);
            if (creAnalysis.inputs) {
              setInputs(prev => ({ ...prev, ...creAnalysis.inputs }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [dealId]);

  const outputs = useMemo(() => {
    const propertyValue = parseCurrencyInput(inputs.propertyValue);
    const purchasePrice = parseCurrencyInput(inputs.purchasePrice);
    const grossPotentialRent = parseCurrencyInput(inputs.grossPotentialRent);
    const otherIncome = parseCurrencyInput(inputs.otherIncome);
    const vacancyRate = parseFloat(inputs.vacancyRate) || 0;
    const operatingExpenses = parseCurrencyInput(inputs.operatingExpenses);
    const propertyTaxes = parseCurrencyInput(inputs.propertyTaxes);
    const insurance = parseCurrencyInput(inputs.insurance);
    const managementFee = parseFloat(inputs.managementFee) || 0;
    const reserves = parseFloat(inputs.reserves) || 0;
    const interestRate = parseFloat(inputs.interestRate) || 0;
    const amortization = parseInt(inputs.amortization) || 25;
    const loanTerm = parseInt(inputs.loanTerm) || 10;
    const targetDSCR = parseFloat(inputs.targetDSCR) || 1.25;
    const maxLTV = parseFloat(inputs.maxLTV) || 75;

    if (!grossPotentialRent || !propertyValue) return null;

    const grossPotentialIncome = grossPotentialRent + otherIncome;
    const vacancyLoss = grossPotentialIncome * (vacancyRate / 100);
    const effectiveGrossIncome = grossPotentialIncome - vacancyLoss;
    const managementExpense = effectiveGrossIncome * (managementFee / 100);
    const reserveExpense = effectiveGrossIncome * (reserves / 100);
    const totalOperatingExpenses = operatingExpenses + propertyTaxes + insurance + managementExpense + reserveExpense;
    const netOperatingIncome = effectiveGrossIncome - totalOperatingExpenses;
    const capRate = propertyValue > 0 ? (netOperatingIncome / propertyValue) * 100 : 0;

    const maxAnnualDebtService = netOperatingIncome / targetDSCR;
    const maxMonthlyPayment = maxAnnualDebtService / 12;
    const monthlyRate = (interestRate / 100) / 12;
    const numPayments = amortization * 12;
    const maxLoanByDSCR = monthlyRate > 0
      ? maxMonthlyPayment * (Math.pow(1 + monthlyRate, numPayments) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, numPayments))
      : maxMonthlyPayment * numPayments;

    const maxLoanByLTV = propertyValue * (maxLTV / 100);
    const maxLoanAmount = Math.min(maxLoanByDSCR, maxLoanByLTV);
    const constrainingFactor = maxLoanByDSCR < maxLoanByLTV ? 'DSCR' : 'LTV';

    const monthlyPayment = calculateMonthlyPayment(maxLoanAmount, interestRate, amortization);
    const annualDebtService = monthlyPayment * 12;
    const actualDSCR = annualDebtService > 0 ? netOperatingIncome / annualDebtService : 0;
    const actualLTV = propertyValue > 0 ? (maxLoanAmount / propertyValue) * 100 : 0;
    const debtYield = maxLoanAmount > 0 ? (netOperatingIncome / maxLoanAmount) * 100 : 0;
    const downPaymentRequired = purchasePrice - maxLoanAmount;
    const cashFlowAfterDebt = netOperatingIncome - annualDebtService;
    const cashOnCash = downPaymentRequired > 0 ? (cashFlowAfterDebt / downPaymentRequired) * 100 : 0;
    const expenseRatio = effectiveGrossIncome > 0 ? (totalOperatingExpenses / effectiveGrossIncome) * 100 : 0;

    return {
      grossPotentialIncome, vacancyLoss, effectiveGrossIncome,
      totalOperatingExpenses, managementExpense, reserveExpense, expenseRatio,
      netOperatingIncome, capRate, maxLoanByDSCR, maxLoanByLTV, maxLoanAmount,
      constrainingFactor, monthlyPayment, annualDebtService, actualDSCR, actualLTV,
      debtYield, downPaymentRequired, cashFlowAfterDebt, cashOnCash,
      propertyValue, purchasePrice, loanTerm,
    };
  }, [inputs]);

  const handleSaveAnalysis = async () => {
    if (!outputs || !dealId) return;
    setSaveStatus('saving');
    try {
      const payload = {
        type: 'cre-loan-sizer',
        inputs: { ...inputs, propertyValue: outputs.propertyValue, purchasePrice: outputs.purchasePrice },
        outputs: {
          maxLoanAmount: outputs.maxLoanAmount, noi: outputs.netOperatingIncome,
          dscr: outputs.actualDSCR, ltv: outputs.actualLTV, capRate: outputs.capRate,
          constrainingFactor: outputs.constrainingFactor, monthlyPayment: outputs.monthlyPayment,
          annualDebtService: outputs.annualDebtService, debtYield: outputs.debtYield,
          cashOnCash: outputs.cashOnCash, cashFlowAfterDebt: outputs.cashFlowAfterDebt,
        },
      };
      const url = analysisId
        ? `/api/deals/${dealId}/analyses/${analysisId}`
        : `/api/deals/${dealId}/analyses`;
      const method = analysisId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        const data = await res.json();
        if (!analysisId) setAnalysisId(data.id);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
  };

  const getStatusColor = (value: number, goodThreshold: number, isHigherBetter: boolean = true) => {
    if (isHigherBetter) {
      return value >= goodThreshold ? 'text-sgf-green-600' : value >= goodThreshold * 0.9 ? 'text-sgf-gold-600' : 'text-red-600';
    }
    return value <= goodThreshold ? 'text-sgf-green-600' : value <= goodThreshold * 1.1 ? 'text-sgf-gold-600' : 'text-red-600';
  };

  // Prepare PDF data
  const pdfData = outputs ? {
    propertyName: dealName,
    reportDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    propertyType: inputs.propertyType,
    purchasePrice: outputs.purchasePrice,
    grossRentalIncome: parseCurrencyInput(inputs.grossPotentialRent),
    otherIncome: parseCurrencyInput(inputs.otherIncome),
    effectiveGrossIncome: outputs.effectiveGrossIncome,
    vacancyRate: parseFloat(inputs.vacancyRate) || 0,
    operatingExpenses: outputs.totalOperatingExpenses,
    expenseRatio: outputs.expenseRatio,
    noi: outputs.netOperatingIncome,
    capRate: outputs.capRate,
    maxLoanLTV: outputs.maxLoanByLTV,
    maxLoanDSCR: outputs.maxLoanByDSCR,
    maxLoanDebtYield: outputs.maxLoanAmount,
    constrainingFactor: outputs.constrainingFactor,
    recommendedLoan: outputs.maxLoanAmount,
    interestRate: parseFloat(inputs.interestRate) || 0,
    loanTerm: outputs.loanTerm,
    amortization: parseInt(inputs.amortization) || 25,
    monthlyPayment: outputs.monthlyPayment,
    annualDebtService: outputs.annualDebtService,
    actualDSCR: outputs.actualDSCR,
    actualLTV: outputs.actualLTV,
    debtYield: outputs.debtYield,
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sgf-green-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Header */}
        <div className="mb-8">
          <Link href={`/app/deals/${dealId}`} className="inline-flex items-center gap-2 text-sgf-green-600 hover:text-sgf-green-700 font-medium mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Deal
          </Link>
          <div className="bg-gradient-to-r from-sgf-green-600 via-sgf-green-700 to-sgf-green-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                  <Building2 className="w-3 h-3" />
                  CRE Analysis
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">CRE Loan Sizer</h1>
                <p className="text-sgf-green-100 mt-1">{dealName}</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Save Status */}
                {saveStatus === 'saved' && (
                  <div className="flex items-center gap-1 text-sgf-green-100 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Saved
                  </div>
                )}
                {/* PDF Export Button */}
                <CRELoanSizerExportButton data={pdfData} />
                {/* Save Button */}
                <button
                  onClick={handleSaveAnalysis}
                  disabled={saveStatus === 'saving' || !outputs}
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saveStatus === 'saving' ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Property Type Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-semibold text-gray-700">Property Type:</span>
            {PROPERTY_TYPES.map(type => (
              <button
                key={type}
                onClick={() => handleInputChange('propertyType', type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  inputs.propertyType === type
                    ? 'bg-sgf-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Input Cards */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">

          {/* Property Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Property</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Property Value</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="text" value={inputs.propertyValue} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'propertyValue')} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Purchase Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="text" value={inputs.purchasePrice} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'purchasePrice')} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Income */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Income</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Gross Potential Rent</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="text" value={inputs.grossPotentialRent} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'grossPotentialRent')} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Other Income</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="text" value={inputs.otherIncome} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'otherIncome')} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Vacancy Rate</label>
                <div className="relative">
                  <input type="text" value={inputs.vacancyRate} onChange={(e) => handlePercentChangeUtil(e.target.value, handleInputChange, 'vacancyRate')} className="w-full pr-7 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Expenses</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Operating Expenses</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="text" value={inputs.operatingExpenses} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'operatingExpenses')} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Property Taxes</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="text" value={inputs.propertyTaxes} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'propertyTaxes')} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Insurance</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="text" value={inputs.insurance} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'insurance')} className="w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Mgmt %</label>
                  <div className="relative">
                    <input type="text" value={inputs.managementFee} onChange={(e) => handlePercentChangeUtil(e.target.value, handleInputChange, 'managementFee')} className="w-full pr-6 pl-2 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none" />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Reserves</label>
                  <div className="relative">
                    <input type="text" value={inputs.reserves} onChange={(e) => handlePercentChangeUtil(e.target.value, handleInputChange, 'reserves')} className="w-full pr-6 pl-2 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-green-500 focus:outline-none" />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loan Terms */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Loan Terms</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Interest Rate</label>
                <div className="relative">
                  <input type="text" value={inputs.interestRate} onChange={(e) => handlePercentChangeUtil(e.target.value, handleInputChange, 'interestRate')} className="w-full pr-7 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Amortization (yrs)</label>
                <div className="relative">
                  <input type="text" value={inputs.amortization} onChange={(e) => handlePercentChangeUtil(e.target.value, handleInputChange, 'amortization')} className="w-full pr-10 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">yrs</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Loan Term (yrs)</label>
                <div className="relative">
                  <input type="text" value={inputs.loanTerm} onChange={(e) => handlePercentChangeUtil(e.target.value, handleInputChange, 'loanTerm')} className="w-full pr-10 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">yrs</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Target DSCR</label>
                <div className="relative">
                  <input type="text" value={inputs.targetDSCR} onChange={(e) => handlePercentChangeUtil(e.target.value, handleInputChange, 'targetDSCR')} className="w-full pr-7 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">x</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Max LTV</label>
                <div className="relative">
                  <input type="text" value={inputs.maxLTV} onChange={(e) => handlePercentChangeUtil(e.target.value, handleInputChange, 'maxLTV')} className="w-full pr-7 pl-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-sgf-gold-500 focus:outline-none" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {outputs && (
          <>
            {/* Max Loan Summary Banner */}
            <div className="bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 rounded-xl p-6 mb-8 text-white">
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-sgf-green-100 text-sm mb-1">Max Loan Amount</div>
                  <div className="text-3xl font-bold">{formatCurrency(outputs.maxLoanAmount)}</div>
                  <div className="text-xs text-sgf-green-100 mt-1">Constrained by {outputs.constrainingFactor}</div>
                </div>
                <div>
                  <div className="text-sgf-green-100 text-sm mb-1">Net Operating Income</div>
                  <div className="text-2xl font-bold">{formatCurrency(outputs.netOperatingIncome)}</div>
                </div>
                <div>
                  <div className="text-sgf-green-100 text-sm mb-1">DSCR</div>
                  <div className="text-2xl font-bold">{outputs.actualDSCR.toFixed(2)}x</div>
                </div>
                <div>
                  <div className="text-sgf-green-100 text-sm mb-1">LTV</div>
                  <div className="text-2xl font-bold">{outputs.actualLTV.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">

              {/* Income Statement */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-sgf-green-50 to-white">
                  <h3 className="font-semibold text-gray-900">Income Statement</h3>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross Potential Income</span>
                    <span className="font-mono">{formatCurrency(outputs.grossPotentialIncome)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Less: Vacancy ({inputs.vacancyRate}%)</span>
                    <span className="font-mono">({formatCurrency(outputs.vacancyLoss)})</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-gray-900">Effective Gross Income</span>
                    <span className="font-mono font-semibold">{formatCurrency(outputs.effectiveGrossIncome)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Less: Operating Expenses</span>
                    <span className="font-mono">({formatCurrency(outputs.totalOperatingExpenses)})</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 bg-sgf-green-50 px-2 py-1 rounded">
                    <span className="text-sgf-green-700 font-bold">Net Operating Income</span>
                    <span className="font-mono font-bold text-sgf-green-700">{formatCurrency(outputs.netOperatingIncome)}</span>
                  </div>
                </div>
              </div>

              {/* Loan Sizing */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-sgf-gold-50 to-white">
                  <h3 className="font-semibold text-gray-900">Loan Sizing</h3>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max by DSCR ({inputs.targetDSCR}x)</span>
                    <span className="font-mono">{formatCurrency(outputs.maxLoanByDSCR)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max by LTV ({inputs.maxLTV}%)</span>
                    <span className="font-mono">{formatCurrency(outputs.maxLoanByLTV)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 bg-sgf-gold-50 px-2 py-1 rounded">
                    <span className="text-sgf-gold-700 font-bold">Max Loan</span>
                    <span className="font-mono font-bold text-sgf-gold-700">{formatCurrency(outputs.maxLoanAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-gray-600">Monthly Payment</span>
                    <span className="font-mono">{formatCurrency(outputs.monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Debt Service</span>
                    <span className="font-mono">{formatCurrency(outputs.annualDebtService)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Debt Yield</span>
                    <span className="font-mono">{outputs.debtYield.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              {/* Investment Returns */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                  <h3 className="font-semibold text-gray-900">Investment Returns</h3>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Down Payment Required</span>
                    <span className="font-mono font-semibold">{formatCurrency(outputs.downPaymentRequired)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cash Flow After Debt</span>
                    <span className={`font-mono font-semibold ${outputs.cashFlowAfterDebt >= 0 ? 'text-sgf-green-600' : 'text-red-600'}`}>
                      {formatCurrency(outputs.cashFlowAfterDebt)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Cash-on-Cash Return</span>
                    <span className={`font-mono font-semibold ${getStatusColor(outputs.cashOnCash, 8)}`}>{outputs.cashOnCash.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cap Rate</span>
                    <span className="font-mono font-semibold">{outputs.capRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expense Ratio</span>
                    <span className="font-mono">{outputs.expenseRatio.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!outputs && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center mb-8">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Enter Property Details</h3>
            <p className="text-gray-500 text-sm">Fill in property value and income to size your CRE loan</p>
          </div>
        )}

        {/* Financing CTA */}
        <div className="mt-8 bg-gradient-to-r from-sgf-green-600 via-sgf-green-700 to-sgf-green-800 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-4">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                CRE Financing
              </div>
              <h2 className="text-2xl font-bold mb-3">Finance Your Commercial Property</h2>
              <p className="text-sgf-green-100 max-w-lg">
                Starting Gate Financial offers competitive CRE financing including bridge loans,
                permanent financing, and SBA 504 loans.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://startinggatefinancial.com/apply" className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-sgf-gold-600 transition-colors shadow-lg">
                <FileText className="w-5 h-5" />Apply for Financing
              </a>
              <a href="https://startinggatefinancial.com/contact" className="inline-flex items-center gap-2 bg-white/10 border-2 border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors">
                <MessageSquare className="w-5 h-5" />Schedule Call
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
