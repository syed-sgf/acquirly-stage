'use client';

import { useState, useMemo } from 'react';
import { DollarSign, Scale, BarChart3, FileText, MessageSquare, Save, TrendingUp, Building2, Factory, ShoppingBag, Utensils, Stethoscope, Laptop, Wrench } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import PremiumProductsCTA from '@/components/core/PremiumProductsCTA';

const industryMultiples = {
  restaurant: { sde: { low: 1.5, mid: 2.5, high: 3.5 }, ebitda: { low: 3.0, mid: 4.0, high: 5.0 }, icon: Utensils, label: 'Restaurant / Food Service', description: 'Restaurants, cafes, food trucks, catering' },
  retail: { sde: { low: 1.5, mid: 2.0, high: 3.0 }, ebitda: { low: 3.0, mid: 4.0, high: 5.0 }, icon: ShoppingBag, label: 'Retail', description: 'Retail stores, e-commerce, wholesale distribution' },
  manufacturing: { sde: { low: 2.5, mid: 3.5, high: 5.0 }, ebitda: { low: 4.0, mid: 5.0, high: 7.0 }, icon: Factory, label: 'Manufacturing', description: 'Production, fabrication, assembly operations' },
  services: { sde: { low: 2.0, mid: 3.0, high: 4.0 }, ebitda: { low: 3.5, mid: 4.5, high: 6.0 }, icon: Wrench, label: 'Professional Services', description: 'Consulting, agencies, B2B services' },
  healthcare: { sde: { low: 2.5, mid: 4.0, high: 6.0 }, ebitda: { low: 5.0, mid: 7.0, high: 10.0 }, icon: Stethoscope, label: 'Healthcare', description: 'Medical practices, dental, veterinary, home health' },
  technology: { sde: { low: 3.0, mid: 4.5, high: 7.0 }, ebitda: { low: 5.0, mid: 8.0, high: 12.0 }, icon: Laptop, label: 'Technology / SaaS', description: 'Software, IT services, SaaS, tech-enabled businesses' },
  construction: { sde: { low: 1.5, mid: 2.5, high: 3.5 }, ebitda: { low: 3.0, mid: 4.0, high: 5.0 }, icon: Building2, label: 'Construction / Trades', description: 'Contractors, HVAC, plumbing, electrical, trades' },
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

  const handleInputChange = (field: keyof ValuationInputs, value: string) => {
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

    const sdeLow = annualSDE * multiples.sde.low;
    const sdeMid = annualSDE * multiples.sde.mid;
    const sdeHigh = annualSDE * multiples.sde.high;

    const ebitdaLow = annualEBITDA * multiples.ebitda.low;
    const ebitdaMid = annualEBITDA * multiples.ebitda.mid;
    const ebitdaHigh = annualEBITDA * multiples.ebitda.high;

    const assetBasedValue = assetValue + inventory + realEstate;

    // DCF Calculation
    let dcfValue = 0;
    let projectedCashFlow = annualSDE;
    for (let year = 1; year <= 5; year++) {
      projectedCashFlow = projectedCashFlow * (1 + growthRate / 100);
      dcfValue += projectedCashFlow / Math.pow(1 + discountRate / 100, year);
    }
    const terminalGrowth = 2;
    const terminalValue = (projectedCashFlow * (1 + terminalGrowth / 100)) / ((discountRate / 100) - (terminalGrowth / 100));
    dcfValue += terminalValue / Math.pow(1 + discountRate / 100, 5);

    // Revenue multiple (rough benchmark)
    const revenueMultiple = annualRevenue * 0.5;

    const allMidValues = [sdeMid, ebitdaMid, dcfValue].filter(v => v > 0);
    const averageValuation = allMidValues.length > 0 ? allMidValues.reduce((a, b) => a + b, 0) / allMidValues.length : 0;

    const lowValuation = Math.min(sdeLow || Infinity, ebitdaLow || Infinity, assetBasedValue || Infinity);
    const highValuation = Math.max(sdeHigh, ebitdaHigh, dcfValue);

    return {
      sde: { low: sdeLow, mid: sdeMid, high: sdeHigh, multiple: multiples.sde },
      ebitda: { low: ebitdaLow, mid: ebitdaMid, high: ebitdaHigh, multiple: multiples.ebitda },
      assetBased: assetBasedValue,
      dcf: dcfValue,
      revenueMultiple,
      average: averageValuation,
      range: { low: lowValuation === Infinity ? 0 : lowValuation, high: highValuation },
      annualSDE,
      annualEBITDA,
      annualRevenue,
    };
  }, [inputs]);

  const handleSaveValuation = () => {
    if (!outputs) return;
    const valuationData = {
      type: 'valuation',
      inputs: { industry: inputs.industry, annualRevenue: parseCurrencyInput(inputs.annualRevenue), annualSDE: parseCurrencyInput(inputs.annualSDE), annualEBITDA: parseCurrencyInput(inputs.annualEBITDA) },
      outputs: { sdeValuation: outputs.sde.mid, ebitdaValuation: outputs.ebitda.mid, dcfValuation: outputs.dcf, averageValuation: outputs.average },
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('pendingValuationAnalysis', JSON.stringify(valuationData));
    window.location.href = '/api/auth/signin?callbackUrl=/app/deals/new';
  };

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
                Free Calculator
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Business Valuation Calculator</h1>
              <p className="text-sgf-green-100 mt-2 max-w-2xl mx-auto">Multiple valuation methods with industry-specific benchmarks</p>
            </div>
          </div>
        </div>

        {/* Industry Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold text-gray-900">Select Industry</h2>
            <Tooltip content="Different industries trade at different valuation multiples based on growth potential, risk profile, and market conditions. Select the industry that best matches your business." />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {(Object.entries(industryMultiples) as [IndustryType, typeof industryMultiples[IndustryType]][]).map(([key, data]) => {
              const Icon = data.icon;
              const isSelected = inputs.industry === key;
              return (
                <button key={key} onClick={() => handleIndustryChange(key)} className={`p-4 rounded-xl border-2 transition-all text-center ${isSelected ? 'border-sgf-green-500 bg-sgf-green-50' : 'border-gray-200 hover:border-sgf-green-300'}`}>
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-sgf-green-600' : 'text-gray-400'}`} />
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
              <span>SDE Multiple: {industryMultiples[inputs.industry].sde.low}x - {industryMultiples[inputs.industry].sde.high}x</span>
              <span className="hidden md:inline text-sgf-green-400">|</span>
              <span>EBITDA Multiple: {industryMultiples[inputs.industry].ebitda.low}x - {industryMultiples[inputs.industry].ebitda.high}x</span>
            </div>
            <p className="text-xs text-sgf-green-600 mt-2">{industryMultiples[inputs.industry].description}</p>
          </div>
        </div>

        {/* Input Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          
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
                  <Tooltip content="Total gross revenue (sales) for the trailing 12 months. Used to calculate revenue multiples and assess business scale. Not typically used as primary valuation method for small businesses." />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="text" value={inputs.annualRevenue} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'annualRevenue')} className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-green-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Annual SDE</label>
                  <Tooltip content="Seller's Discretionary Earnings = Net Profit + Owner Salary + Owner Benefits + One-time Expenses + Non-cash Expenses. This is the PRIMARY valuation metric for businesses under $5M. It represents total benefit to a working owner." />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="text" value={inputs.annualSDE} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'annualSDE')} className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-green-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Annual EBITDA</label>
                  <Tooltip content="Earnings Before Interest, Taxes, Depreciation & Amortization. Used for larger businesses ($5M+) where owner is replaced by management. EBITDA = SDE minus a market-rate manager salary." />
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
                  <Tooltip content="Furniture, Fixtures & Equipment. The fair market value of all business equipment, machinery, vehicles, computers, furniture, etc. Use depreciated value or recent appraisal, not original cost." />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="text" value={inputs.assetValue} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'assetValue')} className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-gold-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Inventory</label>
                  <Tooltip content="Value of inventory included in the sale at cost (not retail). Inventory is often handled separately from the business price or adjusted at closing based on actual count." />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="text" value={inputs.inventory} onChange={(e) => handleCurrencyChange(e.target.value, handleInputChange, 'inventory')} className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-gold-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Real Estate</label>
                  <Tooltip content="Value of any real estate included in the sale. Often real estate is sold separately or leased back. If included, get a professional appraisal. Leave at $0 if real estate is not part of the deal." />
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
                  <Tooltip content="Expected annual growth in cash flows. Conservative: 0-3%, Moderate: 3-5%, Aggressive: 5-10%. Higher growth = higher DCF valuation. Be realistic - most small businesses grow 0-5% annually." />
                </div>
                <div className="relative">
                  <input type="text" value={inputs.growthRate} onChange={(e) => handlePercentChangeUtil(e.target.value, handleInputChange, 'growthRate')} className="w-full pr-8 pl-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-green-500 focus:outline-none" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-gray-700">Discount Rate</label>
                  <Tooltip content="Required rate of return / cost of capital. Higher risk = higher discount rate. Small businesses typically use 15-25%. Lower discount rate = higher DCF valuation. This reflects the risk of the investment." />
                </div>
                <div className="relative">
                  <input type="text" value={inputs.discountRate} onChange={(e) => handlePercentChangeUtil(e.target.value, handleInputChange, 'discountRate')} className="w-full pr-8 pl-4 py-2.5 border-2 border-gray-200 rounded-lg font-mono focus:border-sgf-green-500 focus:outline-none" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">DCF uses a 5-year projection with 2% terminal growth rate. This method is more theoretical and less commonly used for small business valuations than SDE multiples.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {outputs && (
          <>
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 rounded-xl p-6 mb-8 text-white">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="text-sgf-green-100 text-sm">Valuation Range</div>
                    <Tooltip content="The spread between conservative (low) and aggressive (high) valuations across all methods. Use this to understand the negotiation range." />
                  </div>
                  <div className="text-xl font-bold">{formatCurrency(outputs.range.low)} - {formatCurrency(outputs.range.high)}</div>
                </div>
                <div className="border-l border-r border-white/20 px-6">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="text-sgf-green-100 text-sm">Recommended Valuation</div>
                    <Tooltip content="Average of the mid-point valuations from SDE, EBITDA, and DCF methods. This is a reasonable starting point for negotiations, but final price depends on deal terms, buyer competition, and market conditions." />
                  </div>
                  <div className="text-3xl font-bold">{formatCurrency(outputs.average)}</div>
                  <div className="text-xs text-sgf-green-100">Average of income methods</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="text-sgf-green-100 text-sm">Implied SDE Multiple</div>
                    <Tooltip content="The recommended valuation divided by SDE. Compare this to industry benchmarks to see if the valuation is reasonable. If this is outside the typical range, investigate why." />
                  </div>
                  <div className="text-xl font-bold">{outputs.annualSDE > 0 ? (outputs.average / outputs.annualSDE).toFixed(2) : '--'}x</div>
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
                    <Tooltip content="Most common method for businesses under $5M. Multiplies SDE by an industry-specific factor. This is what most buyers and lenders will use." />
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Low ({outputs.sde.multiple.low}x)</span>
                      <span className="font-mono">{formatCurrency(outputs.sde.low)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-sgf-green-600">
                      <span>Mid ({outputs.sde.multiple.mid}x)</span>
                      <span className="font-mono">{formatCurrency(outputs.sde.mid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">High ({outputs.sde.multiple.high}x)</span>
                      <span className="font-mono">{formatCurrency(outputs.sde.high)}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    Based on {formatCurrency(outputs.annualSDE)} SDE
                  </div>
                </div>
              </div>

              {/* EBITDA Multiple */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-sgf-gold-50 to-white">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">EBITDA Multiple</h3>
                    <Tooltip content="Used for larger businesses or those with professional management. EBITDA multiples are typically higher than SDE multiples because they assume you'll hire a manager." />
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Low ({outputs.ebitda.multiple.low}x)</span>
                      <span className="font-mono">{formatCurrency(outputs.ebitda.low)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-sgf-gold-600">
                      <span>Mid ({outputs.ebitda.multiple.mid}x)</span>
                      <span className="font-mono">{formatCurrency(outputs.ebitda.mid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">High ({outputs.ebitda.multiple.high}x)</span>
                      <span className="font-mono">{formatCurrency(outputs.ebitda.high)}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    Based on {formatCurrency(outputs.annualEBITDA)} EBITDA
                  </div>
                </div>
              </div>

              {/* DCF */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">DCF Method</h3>
                    <Tooltip content="Discounted Cash Flow analysis projects future cash flows and discounts them to present value. More theoretical - rarely used as primary method for small businesses, but useful as a sanity check." />
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
                    <Tooltip content="Sum of tangible assets (equipment + inventory + real estate). This is the 'floor' value - what you could liquidate the business for. Rarely used as primary method unless business is unprofitable." />
                  </div>
                </div>
                <div className="p-4 text-center py-6">
                  <div className="text-3xl font-bold font-mono text-gray-700">{formatCurrency(outputs.assetBased)}</div>
                  <p className="text-xs text-gray-500 mt-2">Total tangible assets</p>
                  <p className="text-xs text-gray-500">Floor / liquidation value</p>
                </div>
              </div>
            </div>

            {/* Save CTA */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Save This Valuation</h3>
                  <p className="text-sm text-gray-600">Create a free account to save, compare, and export professional reports</p>
                </div>
                <button onClick={handleSaveValuation} className="inline-flex items-center gap-2 bg-gradient-to-r from-sgf-green-600 to-sgf-green-700 hover:from-sgf-green-700 hover:to-sgf-green-800 text-white px-6 py-3 rounded-lg font-bold shadow-lg">
                  <Save className="w-5 h-5" />Save Valuation
                </button>
              </div>
            </div>
          </>
        )}

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