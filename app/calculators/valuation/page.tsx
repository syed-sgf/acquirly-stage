'use client';

import { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Scale, 
  BarChart3, 
  FileText, 
  MessageSquare, 
  Save, 
  TrendingUp, 
  Building2, 
  Factory, 
  ShoppingBag, 
  Utensils, 
  Stethoscope, 
  Laptop, 
  Wrench,
  Leaf,
  Sparkles,
  Car,
  Truck,
  Home,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import PremiumProductsCTA from '@/components/core/PremiumProductsCTA';
import GatedCalculator from '@/components/core/GatedCalculator';
import ValuationExportButton from '@/components/calculators/ValuationExportButton';

const industryMultiples = {
  restaurant: { 
    sde: { low: 1.5, mid: 2.5, high: 3.5 }, 
    ebitda: { low: 3.0, mid: 4.0, high: 5.0 }, 
    icon: Utensils, 
    label: 'Restaurant / Food Service', 
    description: 'Restaurants, cafes, food trucks, catering, QSR' 
  },
  retail: { 
    sde: { low: 1.5, mid: 2.0, high: 3.0 }, 
    ebitda: { low: 3.0, mid: 4.0, high: 5.0 }, 
    icon: ShoppingBag, 
    label: 'Retail', 
    description: 'Retail stores, e-commerce, wholesale distribution' 
  },
  manufacturing: { 
    sde: { low: 2.5, mid: 3.5, high: 5.0 }, 
    ebitda: { low: 4.0, mid: 5.0, high: 7.0 }, 
    icon: Factory, 
    label: 'Manufacturing', 
    description: 'Production, fabrication, assembly operations' 
  },
  services: { 
    sde: { low: 2.0, mid: 3.0, high: 4.0 }, 
    ebitda: { low: 3.5, mid: 4.5, high: 6.0 }, 
    icon: Wrench, 
    label: 'Professional Services', 
    description: 'Consulting, agencies, B2B services, staffing' 
  },
  healthcare: { 
    sde: { low: 2.5, mid: 4.0, high: 6.0 }, 
    ebitda: { low: 5.0, mid: 7.0, high: 10.0 }, 
    icon: Stethoscope, 
    label: 'Healthcare', 
    description: 'Medical practices, dental, veterinary, home health' 
  },
  technology: { 
    sde: { low: 3.0, mid: 4.5, high: 7.0 }, 
    ebitda: { low: 5.0, mid: 8.0, high: 12.0 }, 
    icon: Laptop, 
    label: 'Technology / SaaS', 
    description: 'Software, IT services, SaaS, MSP, tech-enabled' 
  },
  construction: { 
    sde: { low: 1.5, mid: 2.5, high: 3.5 }, 
    ebitda: { low: 3.0, mid: 4.0, high: 5.0 }, 
    icon: Building2, 
    label: 'Construction / Trades', 
    description: 'General contractors, specialty trades, builders' 
  },
  lawncare: { 
    sde: { low: 2.0, mid: 2.5, high: 3.0 }, 
    ebitda: { low: 3.0, mid: 4.0, high: 5.0 }, 
    icon: Leaf, 
    label: 'Lawn Care / Landscaping', 
    description: 'Lawn maintenance, landscaping, irrigation, tree service' 
  },
  janitorial: { 
    sde: { low: 2.0, mid: 2.5, high: 3.5 }, 
    ebitda: { low: 3.0, mid: 4.0, high: 5.5 }, 
    icon: Sparkles, 
    label: 'Janitorial / Cleaning', 
    description: 'Commercial cleaning, janitorial, residential cleaning' 
  },
  autorepair: { 
    sde: { low: 1.5, mid: 2.5, high: 3.5 }, 
    ebitda: { low: 3.0, mid: 4.0, high: 5.0 }, 
    icon: Car, 
    label: 'Auto Repair / Services', 
    description: 'Auto repair, tire shops, oil change, body shops, detailing' 
  },
  logistics: { 
    sde: { low: 2.0, mid: 3.0, high: 4.0 }, 
    ebitda: { low: 3.5, mid: 4.5, high: 6.0 }, 
    icon: Truck, 
    label: 'Logistics / Transportation', 
    description: 'Trucking, freight, delivery, moving, courier services' 
  },
  homeservices: { 
    sde: { low: 2.0, mid: 2.5, high: 3.5 }, 
    ebitda: { low: 3.0, mid: 4.0, high: 5.0 }, 
    icon: Home, 
    label: 'Home Services', 
    description: 'HVAC, plumbing, electrical, pest control, roofing, garage doors' 
  },
};

type IndustryType = keyof typeof industryMultiples;

interface ValuationInputs {
  industry: IndustryType;
  annualRevenue: string;
  annualSDE: string;
  annualEBITDA: string;
  assetValue: string;
  inventory: string;
  realEstate: string;
  growthRate: string;
  discountRate: string;
  businessAge: 'under3' | '3to10' | 'over10';
  revenueType: 'project' | 'mixed' | 'recurring';
  contractQuality: 'monthToMonth' | 'annual' | 'multiYear';
  ownerDependency: 'high' | 'medium' | 'low';
  locationMarket: 'rural' | 'suburban' | 'urban';
  equipmentCondition: 'poor' | 'fair' | 'good' | 'excellent';
}

const defaultInputs: ValuationInputs = {
  industry: 'services',
  annualRevenue: '1,500,000',
  annualSDE: '300,000',
  annualEBITDA: '250,000',
  assetValue: '150,000',
  inventory: '50,000',
  realEstate: '0',
  growthRate: '3',
  discountRate: '15',
  businessAge: '3to10',
  revenueType: 'mixed',
  contractQuality: 'annual',
  ownerDependency: 'medium',
  locationMarket: 'suburban',
  equipmentCondition: 'good',
};

const adjustmentFactors = {
  businessAge: {
    under3: { value: -0.15, label: 'Under 3 Years', description: 'Higher risk, unproven track record' },
    '3to10': { value: 0, label: '3-10 Years', description: 'Established business, standard multiple' },
    over10: { value: 0.10, label: '10+ Years', description: 'Long track record, stability premium' },
  },
  revenueType: {
    project: { value: -0.10, label: 'Project-Based', description: 'One-time projects, unpredictable revenue' },
    mixed: { value: 0, label: 'Mixed', description: 'Combination of recurring and project revenue' },
    recurring: { value: 0.15, label: 'Recurring/Contracts', description: 'Predictable, subscription-like revenue' },
  },
  contractQuality: {
    monthToMonth: { value: -0.10, label: 'Month-to-Month', description: 'Customers can leave anytime' },
    annual: { value: 0, label: 'Annual Contracts', description: 'Standard annual agreements' },
    multiYear: { value: 0.10, label: 'Multi-Year Contracts', description: 'Locked in revenue for 2+ years' },
  },
  ownerDependency: {
    high: { value: -0.15, label: 'High (Owner-Operated)', description: 'Business relies heavily on owner' },
    medium: { value: 0, label: 'Medium', description: 'Some key employees, owner involved' },
    low: { value: 0.10, label: 'Low (Managed)', description: 'Management team in place, owner passive' },
  },
  locationMarket: {
    rural: { value: -0.05, label: 'Rural', description: 'Smaller market, limited buyer pool' },
    suburban: { value: 0, label: 'Suburban', description: 'Standard market conditions' },
    urban: { value: 0.05, label: 'Urban/Metro', description: 'Larger market, more buyers, premium' },
  },
};

const equipmentConditionMultiplier = {
  poor: { value: 0.40, label: 'Poor', description: 'Needs significant repair/replacement' },
  fair: { value: 0.60, label: 'Fair', description: 'Functional but showing age' },
  good: { value: 0.80, label: 'Good', description: 'Well maintained, some wear' },
  excellent: { value: 0.95, label: 'Excellent', description: 'Like new or recently updated' },
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const parseCurrencyInput = (value: string): number => {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
};

const formatNumberWithCommas = (value: number): string => {
  if (isNaN(value) || value === 0) return '0';
  return value.toLocaleString('en-US');
};

const handleCurrencyChange = (
  value: string,
  setter: (field: keyof ValuationInputs, value: string) => void,
  field: keyof ValuationInputs
) => {
  if (value === '' || value === '$') {
    setter(field, '0');
    return;
  }
  const numericValue = value.replace(/[^0-9]/g, '');
  const number = parseInt(numericValue, 10);
  if (!isNaN(number)) {
    setter(field, formatNumberWithCommas(number));
  }
};

const handlePercentChangeUtil = (
  value: string,
  setter: (field: keyof ValuationInputs, value: string) => void,
  field: keyof ValuationInputs
) => {
  if (value === '') {
    setter(field, '0');
    return;
  }
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) return;
  if (parts[1] && parts[1].length > 2) return;
  setter(field, cleaned);
};

export default function ValuationCalculatorPage() {
  const [inputs, setInputs] = useState<ValuationInputs>(defaultInputs);
  const [showAdjustments, setShowAdjustments] = useState<boolean>(true);

  const handleInputChange = (field: keyof ValuationInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: keyof ValuationInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleIndustryChange = (industry: IndustryType) => {
    setInputs(prev => ({ ...prev, industry }));
  };

  const outputs = useMemo(() => {
    const annualRevenue = parseCurrencyInput(inputs.annualRevenue);
    const annualSDE = parseCurrencyInput(inputs.annualSDE);
    const annualEBITDA = parseCurrencyInput(inputs.annualEBITDA);
    const assetValue = parseCurrencyInput(inputs.assetValue);
    const inventory = parseCurrencyInput(inputs.inventory);
    const realEstate = parseCurrencyInput(inputs.realEstate);
    const growthRate = parseFloat(inputs.growthRate) || 0;
    const discountRate = parseFloat(inputs.discountRate) || 15;

    if (!annualSDE && !annualEBITDA) return null;

    const multiples = industryMultiples[inputs.industry];

    const ageAdj = adjustmentFactors.businessAge[inputs.businessAge].value;
    const revenueAdj = adjustmentFactors.revenueType[inputs.revenueType].value;
    const contractAdj = adjustmentFactors.contractQuality[inputs.contractQuality].value;
    const ownerAdj = adjustmentFactors.ownerDependency[inputs.ownerDependency].value;
    const locationAdj = adjustmentFactors.locationMarket[inputs.locationMarket].value;
    
    const totalAdjustment = ageAdj + revenueAdj + contractAdj + ownerAdj + locationAdj;
    const adjustmentMultiplier = 1 + totalAdjustment;

    const adjustedSdeMultiple = {
      low: multiples.sde.low * adjustmentMultiplier,
      mid: multiples.sde.mid * adjustmentMultiplier,
      high: multiples.sde.high * adjustmentMultiplier,
    };

    const adjustedEbitdaMultiple = {
      low: multiples.ebitda.low * adjustmentMultiplier,
      mid: multiples.ebitda.mid * adjustmentMultiplier,
      high: multiples.ebitda.high * adjustmentMultiplier,
    };

    const sdeLow = annualSDE * adjustedSdeMultiple.low;
    const sdeMid = annualSDE * adjustedSdeMultiple.mid;
    const sdeHigh = annualSDE * adjustedSdeMultiple.high;

    const ebitdaLow = annualEBITDA * adjustedEbitdaMultiple.low;
    const ebitdaMid = annualEBITDA * adjustedEbitdaMultiple.mid;
    const ebitdaHigh = annualEBITDA * adjustedEbitdaMultiple.high;

    const equipmentMultiplier = equipmentConditionMultiplier[inputs.equipmentCondition].value;
    const adjustedAssetValue = assetValue * equipmentMultiplier;
    const assetBasedValue = adjustedAssetValue + inventory + realEstate;

    let dcfValue = 0;
    let projectedCashFlow = annualSDE;
    for (let year = 1; year <= 5; year++) {
      projectedCashFlow = projectedCashFlow * (1 + growthRate / 100);
      dcfValue += projectedCashFlow / Math.pow(1 + discountRate / 100, year);
    }
    const terminalGrowth = 2;
    const terminalValue = (projectedCashFlow * (1 + terminalGrowth / 100)) / ((discountRate / 100) - (terminalGrowth / 100));
    dcfValue += terminalValue / Math.pow(1 + discountRate / 100, 5);

    const revenueMultiple = annualRevenue * 0.5;

    const allMidValues = [sdeMid, ebitdaMid, dcfValue].filter(v => v > 0);
    const averageValuation = allMidValues.length > 0 ? allMidValues.reduce((a, b) => a + b, 0) / allMidValues.length : 0;

    const lowValuation = Math.min(sdeLow || Infinity, ebitdaLow || Infinity, assetBasedValue || Infinity);
    const highValuation = Math.max(sdeHigh, ebitdaHigh, dcfValue);

    const adjustmentDetails = [
      { label: 'Business Age', factor: adjustmentFactors.businessAge[inputs.businessAge], value: ageAdj },
      { label: 'Revenue Type', factor: adjustmentFactors.revenueType[inputs.revenueType], value: revenueAdj },
      { label: 'Contract Quality', factor: adjustmentFactors.contractQuality[inputs.contractQuality], value: contractAdj },
      { label: 'Owner Dependency', factor: adjustmentFactors.ownerDependency[inputs.ownerDependency], value: ownerAdj },
      { label: 'Location/Market', factor: adjustmentFactors.locationMarket[inputs.locationMarket], value: locationAdj },
    ];

    return {
      sde: { low: sdeLow, mid: sdeMid, high: sdeHigh, multiple: adjustedSdeMultiple, baseMultiple: multiples.sde },
      ebitda: { low: ebitdaLow, mid: ebitdaMid, high: ebitdaHigh, multiple: adjustedEbitdaMultiple, baseMultiple: multiples.ebitda },
      assetBased: assetBasedValue,
      adjustedAssetValue,
      dcf: dcfValue,
      revenueMultiple,
      average: averageValuation,
      range: { low: lowValuation === Infinity ? 0 : lowValuation, high: highValuation },
      annualSDE,
      annualEBITDA,
      annualRevenue,
      totalAdjustment,
      adjustmentMultiplier,
      adjustmentDetails,
    };
  }, [inputs]);

  const handleSaveValuation = () => {
    if (!outputs) return;
    const valuationData = {
      type: 'valuation',
      inputs: { 
        industry: inputs.industry, 
        annualRevenue: parseCurrencyInput(inputs.annualRevenue), 
        annualSDE: parseCurrencyInput(inputs.annualSDE), 
        annualEBITDA: parseCurrencyInput(inputs.annualEBITDA),
        adjustments: {
          businessAge: inputs.businessAge,
          revenueType: inputs.revenueType,
          contractQuality: inputs.contractQuality,
          ownerDependency: inputs.ownerDependency,
          locationMarket: inputs.locationMarket,
        }
      },
      outputs: { 
        sdeValuation: outputs.sde.mid, 
        ebitdaValuation: outputs.ebitda.mid, 
        dcfValuation: outputs.dcf, 
        averageValuation: outputs.average,
        totalAdjustment: outputs.totalAdjustment,
      },
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('pendingValuationAnalysis', JSON.stringify(valuationData));
    window.location.href = '/api/auth/signin?callbackUrl=/app/deals/new';
  };

  const formatPercent = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${(value * 100).toFixed(0)}%`;
  };

  const getAdjustmentColor = (value: number): string => {
    if (value > 0) return 'text-sgf-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  // Prepare PDF export data
  const pdfExportData = outputs ? {
    industry: inputs.industry,
    industryLabel: industryMultiples[inputs.industry].label,
    reportDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    annualRevenue: outputs.annualRevenue,
    annualSDE: outputs.annualSDE,
    annualEBITDA: outputs.annualEBITDA,
    assetValue: parseCurrencyInput(inputs.assetValue),
    adjustedAssetValue: outputs.adjustedAssetValue,
    inventory: parseCurrencyInput(inputs.inventory),
    realEstate: parseCurrencyInput(inputs.realEstate),
    growthRate: parseFloat(inputs.growthRate) || 0,
    discountRate: parseFloat(inputs.discountRate) || 15,
    adjustments: {
      businessAge: { label: adjustmentFactors.businessAge[inputs.businessAge].label, value: adjustmentFactors.businessAge[inputs.businessAge].value },
      revenueType: { label: adjustmentFactors.revenueType[inputs.revenueType].label, value: adjustmentFactors.revenueType[inputs.revenueType].value },
      contractQuality: { label: adjustmentFactors.contractQuality[inputs.contractQuality].label, value: adjustmentFactors.contractQuality[inputs.contractQuality].value },
      ownerDependency: { label: adjustmentFactors.ownerDependency[inputs.ownerDependency].label, value: adjustmentFactors.ownerDependency[inputs.ownerDependency].value },
      locationMarket: { label: adjustmentFactors.locationMarket[inputs.locationMarket].label, value: adjustmentFactors.locationMarket[inputs.locationMarket].value },
    },
    totalAdjustment: outputs.totalAdjustment,
    equipmentCondition: { label: equipmentConditionMultiplier[inputs.equipmentCondition].label, multiplier: equipmentConditionMultiplier[inputs.equipmentCondition].value },
    sdeValuation: outputs.sde,
    ebitdaValuation: outputs.ebitda,
    dcfValuation: outputs.dcf,
    assetBasedValuation: outputs.assetBased,
    recommendedValuation: outputs.average,
    valuationRange: outputs.range,
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sgf-green-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-sgf-green-600 via-sgf-green-700 to-sgf-green-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Enhanced Calculator
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Business Valuation Calculator</h1>
              <p className="text-sgf-green-100 mt-2 max-w-2xl mx-auto">Multiple valuation methods with industry-specific benchmarks and adjustment factors</p>
            </div>
          </div>
        </div>

        {/* Industry Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold text-gray-900">Select Industry</h2>
            <Tooltip content="Different industries trade at different valuation multiples based on growth potential, risk profile, and market conditions. Select the industry that best matches your business." />
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {(Object.entries(industryMultiples) as [IndustryType, typeof industryMultiples[IndustryType]][]).map(([key, data]) => {
              const Icon = data.icon;
              const isSelected = inputs.industry === key;
              return (
                <button 
                  key={key} 
                  onClick={() => handleIndustryChange(key)} 
                  className={`p-3 rounded-xl border-2 transition-all text-center ${isSelected ? 'border-sgf-green-500 bg-sgf-green-50' : 'border-gray-200 hover:border-sgf-green-300'}`}
                >
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-sgf-green-600' : 'text-gray-400'}`} />
                  <div className={`text-xs font-semibold ${isSelected ? 'text-sgf-green-700' : 'text-gray-600'}`}>{data.label.split(' / ')[0]}</div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 p-4 bg-sgf-green-50 rounded-lg border border-sgf-green-200">
            <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-sgf-green-700">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4" />
                <span className="font-semibold">{industryMultiples[inputs.industry].label}</span>
              </div>
              <span className="hidden md:inline text-sgf-green-400">|</span>
              <span>Base SDE Multiple: {industryMultiples[inputs.industry].sde.low}x - {industryMultiples[inputs.industry].sde.high}x</span>
              <span className="hidden md:inline text-sgf-green-400">|</span>
              <span>Base EBITDA Multiple: {industryMultiples[inputs.industry].ebitda.low}x - {industryMultiples[inputs.industry].ebitda.high}x</span>
            </div>
            <p className="text-xs text-sgf-green-600 mt-2">{industryMultiples[inputs.industry].description}</p>
          </div>
        </div>

        {/* Input Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          
          {/* Income Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Income Metrics</span>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Annual Revenue</label>
                  <Tooltip content="Total gross revenue (sales) for the trailing 12 months. Used to calculate revenue multiples and assess business scale." />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="text" value={inputs.annualRevenue} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'annualRevenue')} className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-green-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Annual SDE</label>
                  <Tooltip content="Seller's Discretionary Earnings = Net Profit + Owner Salary + Owner Benefits + One-time Expenses. PRIMARY valuation metric for businesses under $5M." />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="text" value={inputs.annualSDE} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'annualSDE')} className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-green-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Annual EBITDA</label>
                  <Tooltip content="Earnings Before Interest, Taxes, Depreciation & Amortization. Used for larger businesses ($5M+) with professional management." />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="text" value={inputs.annualEBITDA} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'annualEBITDA')} className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-green-500 focus:outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Assets */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">Assets</span>
                <span className="text-xs text-gray-500">(Optional)</span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">FF&E / Equipment</label>
                  <Tooltip content="Furniture, Fixtures & Equipment at book value. Will be adjusted based on condition below." />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="text" value={inputs.assetValue} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'assetValue')} className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-gold-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Equipment Condition</label>
                  <Tooltip content="Adjusts equipment value based on actual condition. Buyers rarely pay full book value for older equipment." />
                </div>
                <select 
                  value={inputs.equipmentCondition} 
                  onChange={(e) => handleSelectChange('equipmentCondition', e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-sgf-gold-500 focus:outline-none bg-white"
                >
                  {Object.entries(equipmentConditionMultiplier).map(([key, data]) => (
                    <option key={key} value={key}>{data.label} ({(data.value * 100).toFixed(0)}% of book)</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Inventory</label>
                  <Tooltip content="Value of inventory at cost (not retail)." />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="text" value={inputs.inventory} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'inventory')} className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-gold-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Real Estate</label>
                  <Tooltip content="Value of real estate if included in sale. Leave $0 if leased or sold separately." />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="text" value={inputs.realEstate} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'realEstate')} className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-gold-500 focus:outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* DCF Assumptions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-sgf-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">DCF Assumptions</span>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Growth Rate</label>
                  <Tooltip content="Expected annual growth in cash flows. Conservative: 0-3%, Moderate: 3-5%, Aggressive: 5-10%." />
                </div>
                <div className="relative">
                  <input type="text" value={inputs.growthRate} onChange={(e) => handlePercentChangeUtil(e.target.value, handleInputChange, 'growthRate')} className="w-full pr-8 pl-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-green-500 focus:outline-none" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Discount Rate</label>
                  <Tooltip content="Required rate of return. Small businesses typically use 15-25%. Higher risk = higher discount rate." />
                </div>
                <div className="relative">
                  <input type="text" value={inputs.discountRate} onChange={(e) => handlePercentChangeUtil(e.target.value, handleInputChange, 'discountRate')} className="w-full pr-8 pl-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-green-500 focus:outline-none" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">DCF uses 5-year projection with 2% terminal growth rate.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Valuation Adjustment Factors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div 
            className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-sgf-gold-50 to-white cursor-pointer"
            onClick={() => setShowAdjustments(!showAdjustments)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sgf-gold-500 rounded-lg flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-semibold text-gray-900">Valuation Adjustment Factors</span>
                <p className="text-xs text-gray-500">Fine-tune the multiple based on business characteristics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {outputs && (
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                  outputs.totalAdjustment > 0 
                    ? 'bg-sgf-green-100 text-sgf-green-700' 
                    : outputs.totalAdjustment < 0 
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {formatPercent(outputs.totalAdjustment)} adjustment
                </span>
              )}
              <span className="text-gray-400">{showAdjustments ? '▼' : '▶'}</span>
            </div>
          </div>
          
          {showAdjustments && (
            <div className="p-6">
              <div className="grid md:grid-cols-5 gap-4">
                {/* Business Age */}
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <label className="text-xs font-semibold text-gray-700">Business Age</label>
                    <Tooltip content="Older businesses with proven track records command premium multiples. Newer businesses have more risk." />
                  </div>
                  <select 
                    value={inputs.businessAge} 
                    onChange={(e) => handleSelectChange('businessAge', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-sgf-gold-500 focus:outline-none bg-white text-sm"
                  >
                    {Object.entries(adjustmentFactors.businessAge).map(([key, data]) => (
                      <option key={key} value={key}>{data.label}</option>
                    ))}
                  </select>
                  <p className={`text-xs mt-1 font-semibold ${getAdjustmentColor(adjustmentFactors.businessAge[inputs.businessAge].value)}`}>
                    {formatPercent(adjustmentFactors.businessAge[inputs.businessAge].value)}
                  </p>
                </div>

                {/* Revenue Type */}
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <label className="text-xs font-semibold text-gray-700">Revenue Type</label>
                    <Tooltip content="Recurring revenue (contracts, subscriptions) is worth more than one-time project revenue." />
                  </div>
                  <select 
                    value={inputs.revenueType} 
                    onChange={(e) => handleSelectChange('revenueType', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-sgf-gold-500 focus:outline-none bg-white text-sm"
                  >
                    {Object.entries(adjustmentFactors.revenueType).map(([key, data]) => (
                      <option key={key} value={key}>{data.label}</option>
                    ))}
                  </select>
                  <p className={`text-xs mt-1 font-semibold ${getAdjustmentColor(adjustmentFactors.revenueType[inputs.revenueType].value)}`}>
                    {formatPercent(adjustmentFactors.revenueType[inputs.revenueType].value)}
                  </p>
                </div>

                {/* Contract Quality */}
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <label className="text-xs font-semibold text-gray-700">Contract Quality</label>
                    <Tooltip content="Multi-year contracts provide revenue certainty and command premium valuations." />
                  </div>
                  <select 
                    value={inputs.contractQuality} 
                    onChange={(e) => handleSelectChange('contractQuality', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-sgf-gold-500 focus:outline-none bg-white text-sm"
                  >
                    {Object.entries(adjustmentFactors.contractQuality).map(([key, data]) => (
                      <option key={key} value={key}>{data.label}</option>
                    ))}
                  </select>
                  <p className={`text-xs mt-1 font-semibold ${getAdjustmentColor(adjustmentFactors.contractQuality[inputs.contractQuality].value)}`}>
                    {formatPercent(adjustmentFactors.contractQuality[inputs.contractQuality].value)}
                  </p>
                </div>

                {/* Owner Dependency */}
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <label className="text-xs font-semibold text-gray-700">Owner Dependency</label>
                    <Tooltip content="Businesses that run without the owner are more valuable. High owner dependency = more risk for buyer." />
                  </div>
                  <select 
                    value={inputs.ownerDependency} 
                    onChange={(e) => handleSelectChange('ownerDependency', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-sgf-gold-500 focus:outline-none bg-white text-sm"
                  >
                    {Object.entries(adjustmentFactors.ownerDependency).map(([key, data]) => (
                      <option key={key} value={key}>{data.label}</option>
                    ))}
                  </select>
                  <p className={`text-xs mt-1 font-semibold ${getAdjustmentColor(adjustmentFactors.ownerDependency[inputs.ownerDependency].value)}`}>
                    {formatPercent(adjustmentFactors.ownerDependency[inputs.ownerDependency].value)}
                  </p>
                </div>

                {/* Location/Market */}
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <label className="text-xs font-semibold text-gray-700">Location/Market</label>
                    <Tooltip content="Urban markets have more buyers and stronger economies. Rural markets have smaller buyer pools." />
                  </div>
                  <select 
                    value={inputs.locationMarket} 
                    onChange={(e) => handleSelectChange('locationMarket', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-sgf-gold-500 focus:outline-none bg-white text-sm"
                  >
                    {Object.entries(adjustmentFactors.locationMarket).map(([key, data]) => (
                      <option key={key} value={key}>{data.label}</option>
                    ))}
                  </select>
                  <p className={`text-xs mt-1 font-semibold ${getAdjustmentColor(adjustmentFactors.locationMarket[inputs.locationMarket].value)}`}>
                    {formatPercent(adjustmentFactors.locationMarket[inputs.locationMarket].value)}
                  </p>
                </div>
              </div>

              {/* Adjustment Summary */}
              {outputs && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">Adjustment Summary</span>
                  </div>
                  <div className="grid md:grid-cols-6 gap-4 text-xs">
                    {outputs.adjustmentDetails.map((adj, idx) => (
                      <div key={idx} className="text-center">
                        <div className="text-gray-500">{adj.label}</div>
                        <div className={`font-bold ${getAdjustmentColor(adj.value)}`}>{formatPercent(adj.value)}</div>
                      </div>
                    ))}
                    <div className="text-center border-l-2 border-gray-300 pl-4">
                      <div className="text-gray-700 font-semibold">Total</div>
                      <div className={`font-bold text-lg ${getAdjustmentColor(outputs.totalAdjustment)}`}>
                        {formatPercent(outputs.totalAdjustment)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <GatedCalculator requiredPlan="core" calculatorSlug="valuation">
        {outputs && (
          <>
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 rounded-xl p-6 mb-8 text-white">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="text-sgf-green-100 text-sm">Valuation Range</div>
                    <Tooltip content="The spread between conservative (low) and aggressive (high) valuations across all methods." />
                  </div>
                  <div className="text-xl font-bold">{formatCurrency(outputs.range.low)} - {formatCurrency(outputs.range.high)}</div>
                </div>
                <div className="border-l border-r border-white/20 px-6">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="text-sgf-green-100 text-sm">Recommended Valuation</div>
                    <Tooltip content="Average of mid-point valuations from SDE, EBITDA, and DCF methods with adjustments applied." />
                  </div>
                  <div className="text-3xl font-bold">{formatCurrency(outputs.average)}</div>
                  <div className="text-xs text-sgf-green-100">
                    Includes {formatPercent(outputs.totalAdjustment)} adjustment
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="text-sgf-green-100 text-sm">Adjusted SDE Multiple</div>
                    <Tooltip content="The recommended valuation divided by SDE, reflecting all adjustment factors applied." />
                  </div>
                  <div className="text-xl font-bold">{outputs.annualSDE > 0 ? (outputs.average / outputs.annualSDE).toFixed(2) : '--'}x</div>
                  <div className="text-xs text-sgf-green-100">
                    Base: {industryMultiples[inputs.industry].sde.mid}x
                  </div>
                </div>
              </div>
            </div>

            {/* Valuation Methods */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              
              {/* SDE Multiple */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-sgf-green-50 to-white">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">SDE Multiple</h3>
                    <Tooltip content="Most common method for businesses under $5M. Multiplies SDE by an industry-specific and adjusted factor." />
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Low ({outputs.sde.multiple.low.toFixed(2)}x)</span>
                      <span className="font-mono">{formatCurrency(outputs.sde.low)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-sgf-green-600">
                      <span>Mid ({outputs.sde.multiple.mid.toFixed(2)}x)</span>
                      <span className="font-mono">{formatCurrency(outputs.sde.mid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">High ({outputs.sde.multiple.high.toFixed(2)}x)</span>
                      <span className="font-mono">{formatCurrency(outputs.sde.high)}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    Based on {formatCurrency(outputs.annualSDE)} SDE<br/>
                    <span className={getAdjustmentColor(outputs.totalAdjustment)}>
                      Base {outputs.sde.baseMultiple.mid}x → Adjusted {outputs.sde.multiple.mid.toFixed(2)}x
                    </span>
                  </div>
                </div>
              </div>

              {/* EBITDA Multiple */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-sgf-gold-50 to-white">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">EBITDA Multiple</h3>
                    <Tooltip content="Used for larger businesses or those with professional management." />
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Low ({outputs.ebitda.multiple.low.toFixed(2)}x)</span>
                      <span className="font-mono">{formatCurrency(outputs.ebitda.low)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-sgf-gold-600">
                      <span>Mid ({outputs.ebitda.multiple.mid.toFixed(2)}x)</span>
                      <span className="font-mono">{formatCurrency(outputs.ebitda.mid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">High ({outputs.ebitda.multiple.high.toFixed(2)}x)</span>
                      <span className="font-mono">{formatCurrency(outputs.ebitda.high)}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    Based on {formatCurrency(outputs.annualEBITDA)} EBITDA<br/>
                    <span className={getAdjustmentColor(outputs.totalAdjustment)}>
                      Base {outputs.ebitda.baseMultiple.mid}x → Adjusted {outputs.ebitda.multiple.mid.toFixed(2)}x
                    </span>
                  </div>
                </div>
              </div>

              {/* DCF */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">DCF Method</h3>
                    <Tooltip content="Discounted Cash Flow analysis projects future cash flows and discounts them to present value." />
                  </div>
                </div>
                <div className="p-4 text-center py-6">
                  <div className="text-3xl font-bold font-mono text-blue-600">{formatCurrency(outputs.dcf)}</div>
                  <p className="text-xs text-gray-500 mt-2">@ {inputs.discountRate}% discount rate</p>
                  <p className="text-xs text-gray-500">{inputs.growthRate}% annual growth</p>
                </div>
              </div>

              {/* Asset-Based */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">Asset-Based</h3>
                    <Tooltip content="Sum of tangible assets adjusted for equipment condition. This is the 'floor' value." />
                  </div>
                </div>
                <div className="p-4 text-center py-6">
                  <div className="text-3xl font-bold font-mono text-gray-700">{formatCurrency(outputs.assetBased)}</div>
                  <p className="text-xs text-gray-500 mt-2">
                    Equipment ({equipmentConditionMultiplier[inputs.equipmentCondition].label}): {formatCurrency(outputs.adjustedAssetValue)}
                  </p>
                  <p className="text-xs text-gray-500">Floor / liquidation value</p>
                </div>
              </div>
            </div>

            {/* Save & Export CTA */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Save or Export This Valuation</h3>
                  <p className="text-sm text-gray-600">Download a professional PDF report or save to your account</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <ValuationExportButton data={pdfExportData} />
                  <button onClick={handleSaveValuation} className="inline-flex items-center gap-2 bg-gradient-to-r from-sgf-green-600 to-sgf-green-700 hover:from-sgf-green-700 hover:to-sgf-green-800 text-white px-6 py-3 rounded-lg font-bold shadow-lg">
                    <Save className="w-5 h-5" />Save Analysis
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        </GatedCalculator>

        <PremiumProductsCTA />

        {/* Financing CTA */}
        <div className="mt-12 bg-gradient-to-r from-sgf-green-600 via-sgf-green-700 to-sgf-green-800 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-4">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />Ready to Buy?
              </div>
              <h2 className="text-2xl font-bold mb-3">Finance Your Acquisition</h2>
              <p className="text-sgf-green-100 max-w-lg">Starting Gate Financial can help structure financing for your business acquisition with competitive SBA 7(a) loans and conventional financing options.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://startinggatefinancial.com/apply" className="inline-flex items-center gap-2 bg-sgf-gold-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-sgf-gold-600"><FileText className="w-5 h-5" />Apply for Financing</a>
              <a href="https://startinggatefinancial.com/contact" className="inline-flex items-center gap-2 bg-white/10 border-2 border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20"><MessageSquare className="w-5 h-5" />Schedule Call</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}