'use client';
/**
 * DSCR Calculator - Public Lead Generation Tool
 * 
 * Calculates Debt Service Coverage Ratio for business acquisitions.
 * This is a public calculator that drives leads to Starting Gate Financial.
 */
import { useState, useMemo } from 'react';

interface DSCRInputs {
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  netOperatingIncome: number;
}

interface DSCROutputs {
  monthlyPayment: number;
  annualDebtService: number;
  dscr: number;
  dscrStatus: 'excellent' | 'good' | 'marginal' | 'insufficient';
  maxLoanAmount: number;
}

export default function DSCRCalculatorPage() {
  const [inputs, setInputs] = useState<DSCRInputs>({
    loanAmount: 500000,
    interestRate: 7.5,
    loanTermYears: 10,
    netOperatingIncome: 150000,
  });

  const updateInput = <K extends keyof DSCRInputs>(field: K, value: DSCRInputs[K]) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Calculate outputs
  const outputs = useMemo((): DSCROutputs | null => {
    const { loanAmount, interestRate, loanTermYears, netOperatingIncome } = inputs;
    
    if (loanAmount <= 0 || interestRate <= 0 || loanTermYears <= 0 || netOperatingIncome <= 0) {
      return null;
    }

    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTermYears * 12;
    
    // Monthly payment calculation (PMT formula)
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    const annualDebtService = monthlyPayment * 12;
    const dscr = netOperatingIncome / annualDebtService;

    // Determine DSCR status
    let dscrStatus: DSCROutputs['dscrStatus'];
    if (dscr >= 1.35) dscrStatus = 'excellent';
    else if (dscr >= 1.25) dscrStatus = 'good';
    else if (dscr >= 1.0) dscrStatus = 'marginal';
    else dscrStatus = 'insufficient';

    // Calculate max loan amount at 1.25 DSCR
    const targetDSCR = 1.25;
    const maxAnnualDebtService = netOperatingIncome / targetDSCR;
    const maxMonthlyPayment = maxAnnualDebtService / 12;
    const maxLoanAmount = maxMonthlyPayment * (Math.pow(1 + monthlyRate, numPayments) - 1) / 
                         (monthlyRate * Math.pow(1 + monthlyRate, numPayments));

    return {
      monthlyPayment,
      annualDebtService,
      dscr,
      dscrStatus,
      maxLoanAmount,
    };
  }, [inputs]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">DSCR Calculator</h1>
          <p className="text-xl text-green-100">
            Calculate your Debt Service Coverage Ratio to understand loan affordability
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Educational Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Understanding DSCR</h2>
          <p className="text-gray-600 mb-4">
            The Debt Service Coverage Ratio (DSCR) measures a business&apos;s ability to cover its debt payments 
            with its operating income. Lenders typically require a minimum DSCR of 1.25x for business acquisitions.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-semibold text-green-800">1.35x+</div>
              <div className="text-green-600">Excellent</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-semibold text-green-800">1.25x - 1.35x</div>
              <div className="text-green-600">Good</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="font-semibold text-yellow-800">1.0x - 1.25x</div>
              <div className="text-yellow-600">Marginal</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="font-semibold text-red-800">Below 1.0x</div>
              <div className="text-red-600">Insufficient</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Loan Details</h2>
            
            <div className="space-y-4">
              <InputField
                label="Loan Amount"
                value={inputs.loanAmount}
                onChange={(v) => updateInput('loanAmount', Number(v))}
                prefix="$"
                type="number"
              />
              <InputField
                label="Interest Rate (Annual)"
                value={inputs.interestRate}
                onChange={(v) => updateInput('interestRate', Number(v))}
                suffix="%"
                type="number"
                step="0.1"
              />
              <InputField
                label="Loan Term"
                value={inputs.loanTermYears}
                onChange={(v) => updateInput('loanTermYears', Number(v))}
                suffix="years"
                type="number"
              />
              <InputField
                label="Net Operating Income (Annual)"
                value={inputs.netOperatingIncome}
                onChange={(v) => updateInput('netOperatingIncome', Number(v))}
                prefix="$"
                type="number"
              />
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Results</h2>
            
            {outputs ? (
              <div className="space-y-6">
                {/* DSCR Display */}
                <div className={`rounded-lg p-6 text-center ${
                  outputs.dscrStatus === 'excellent' ? 'bg-green-50 border-2 border-green-200' :
                  outputs.dscrStatus === 'good' ? 'bg-green-50 border-2 border-green-200' :
                  outputs.dscrStatus === 'marginal' ? 'bg-yellow-50 border-2 border-yellow-200' :
                  'bg-red-50 border-2 border-red-200'
                }`}>
                  <div className="text-sm font-medium text-gray-600 mb-1">Debt Service Coverage Ratio</div>
                  <div className={`text-5xl font-bold ${
                    outputs.dscrStatus === 'excellent' || outputs.dscrStatus === 'good' ? 'text-green-700' :
                    outputs.dscrStatus === 'marginal' ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    {outputs.dscr.toFixed(2)}x
                  </div>
                  <div className={`text-sm font-medium mt-2 capitalize ${
                    outputs.dscrStatus === 'excellent' || outputs.dscrStatus === 'good' ? 'text-green-600' :
                    outputs.dscrStatus === 'marginal' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {outputs.dscrStatus}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Monthly Payment</span>
                    <span className="font-semibold">{formatCurrency(outputs.monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Annual Debt Service</span>
                    <span className="font-semibold">{formatCurrency(outputs.annualDebtService)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Net Operating Income</span>
                    <span className="font-semibold">{formatCurrency(inputs.netOperatingIncome)}</span>
                  </div>
                  <div className="flex justify-between py-2 bg-gray-50 rounded-lg px-3">
                    <span className="text-gray-600">Max Loan @ 1.25x DSCR</span>
                    <span className="font-semibold text-[#2E7D32]">{formatCurrency(outputs.maxLoanAmount)}</span>
                  </div>
                </div>

                {/* Alert based on DSCR */}
                {outputs.dscrStatus === 'insufficient' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-1">⚠️ Insufficient Coverage</h4>
                    <p className="text-sm text-red-700">
                      This loan structure does not generate enough income to cover debt payments. 
                      Consider a larger down payment or lower loan amount.
                    </p>
                  </div>
                )}
                {outputs.dscrStatus === 'marginal' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-1">⚠️ Marginal Coverage</h4>
                    <p className="text-sm text-yellow-700">
                      This DSCR may be below lender requirements (typically 1.25x). 
                      You may need additional collateral or a larger down payment.
                    </p>
                  </div>
                )}
                {(outputs.dscrStatus === 'excellent' || outputs.dscrStatus === 'good') && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-1">✓ Strong Coverage</h4>
                    <p className="text-sm text-green-700">
                      This loan structure has healthy debt coverage and should meet most lender requirements.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Enter valid values to see results
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-8 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] rounded-lg p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Finance Your Business Acquisition?</h2>
            <p className="text-lg mb-6 text-green-100">
              Starting Gate Financial offers competitive SBA and conventional financing solutions. 
              Our team can help structure the optimal deal for your situation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://startinggatefinancial.com/apply"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#D4AF37] hover:bg-[#B8941F] text-gray-900 font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                Apply for Financing
              </a>
              <a 
                href="https://startinggatefinancial.com/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-lg transition-colors border border-white/30"
              >
                Schedule a Consultation
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by <strong>ACQUIRELY</strong> by Starting Gate Financial</p>
          <p className="mt-1">Richardson, TX | Professional Business Acquisition Tools</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface InputFieldProps {
  label: string;
  value: number | string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
  step?: string;
}

function InputField({ label, value, onChange, prefix, suffix, type = 'text', step }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          step={step}
          className={`
            block w-full rounded-md border-gray-300 shadow-sm
            focus:border-[#2E7D32] focus:ring-[#2E7D32]
            ${prefix ? 'pl-7' : 'pl-3'}
            ${suffix ? 'pr-16' : 'pr-3'}
            py-2 border
          `}
        />
        {suffix && (
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
