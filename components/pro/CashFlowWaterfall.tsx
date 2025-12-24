'use client';

import { fmtUSD } from '@/lib/num';
import { Minus, Plus, ArrowDown } from 'lucide-react';

interface CashFlowStep {
  label: string;
  amount: number;
  type: 'start' | 'subtract' | 'add' | 'result' | 'final';
  icon?: 'minus' | 'plus';
}

interface CashFlowWaterfallProps {
  sde: number;
  buyerSalary: number;
  capex: number;
  debtService: number;
  lendableCashFlow: number;
  netCashFlow: number;
}

export default function CashFlowWaterfall({
  sde,
  buyerSalary,
  capex,
  debtService,
  lendableCashFlow,
  netCashFlow,
}: CashFlowWaterfallProps) {
  const steps: CashFlowStep[] = [
    {
      label: 'Business Cash Flow (SDE)',
      amount: sde,
      type: 'start',
    },
    {
      label: 'Less: Buyer Salary',
      amount: buyerSalary,
      type: 'subtract',
      icon: 'minus',
    },
    {
      label: 'Less: CAPEX',
      amount: capex,
      type: 'subtract',
      icon: 'minus',
    },
    {
      label: '"Lendable" Cash Flow',
      amount: lendableCashFlow,
      type: 'result',
    },
    {
      label: 'Less: Debt Service',
      amount: debtService,
      type: 'subtract',
      icon: 'minus',
    },
    {
      label: 'Net Cash Flow',
      amount: netCashFlow,
      type: 'final',
    },
  ];

  const getStepColor = (type: CashFlowStep['type']) => {
    switch (type) {
      case 'start':
        return 'bg-gradient-to-br from-brand-green-50 to-white border-brand-green-300';
      case 'subtract':
        return 'bg-gradient-to-br from-red-50 to-white border-red-300';
      case 'add':
        return 'bg-gradient-to-br from-brand-gold-50 to-white border-brand-gold-300';
      case 'result':
        return 'bg-gradient-to-br from-blue-50 to-white border-blue-300';
      case 'final':
        return netCashFlow >= 0
          ? 'bg-gradient-to-br from-green-50 to-white border-green-400'
          : 'bg-gradient-to-br from-red-50 to-white border-red-400';
    }
  };

  const getTextColor = (type: CashFlowStep['type']) => {
    switch (type) {
      case 'start':
        return 'text-brand-green-700';
      case 'subtract':
        return 'text-red-700';
      case 'add':
        return 'text-brand-gold-700';
      case 'result':
        return 'text-blue-700';
      case 'final':
        return netCashFlow >= 0 ? 'text-green-700' : 'text-red-700';
    }
  };

  const getAmountColor = (type: CashFlowStep['type']) => {
    switch (type) {
      case 'start':
        return 'text-brand-green-600';
      case 'subtract':
        return 'text-red-600';
      case 'add':
        return 'text-brand-gold-600';
      case 'result':
        return 'text-blue-600';
      case 'final':
        return netCashFlow >= 0 ? 'text-green-600' : 'text-red-600';
    }
  };

  return (
    <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 p-6">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-brand-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Cash Flow Analysis
      </h3>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index}>
            <div
              className={`rounded-lg border-2 p-4 transition-all hover:shadow-md ${getStepColor(
                step.type
              )}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {step.icon === 'minus' && (
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <Minus className="w-5 h-5 text-red-600" />
                    </div>
                  )}
                  {step.icon === 'plus' && (
                    <div className="w-8 h-8 rounded-full bg-brand-gold-100 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-brand-gold-600" />
                    </div>
                  )}
                  <span className={`font-medium ${getTextColor(step.type)}`}>
                    {step.label}
                  </span>
                </div>
                <div className={`text-xl font-bold ${getAmountColor(step.type)}`}>
                  {step.type === 'subtract' || step.type === 'add'
                    ? `${step.type === 'subtract' ? '-' : '+'}${fmtUSD(step.amount)}`
                    : fmtUSD(step.amount)}
                </div>
              </div>

              {step.type === 'result' && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <p className="text-xs text-blue-600">
                    Available to service debt obligations
                  </p>
                </div>
              )}

              {step.type === 'final' && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <p className={`text-xs font-medium ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {netCashFlow >= 0
                      ? '✓ Positive cash flow after all obligations'
                      : '⚠ Negative cash flow - insufficient coverage'}
                  </p>
                </div>
              )}
            </div>

            {/* Arrow connector between steps */}
            {index < steps.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Insight Box */}
      <div className="mt-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Cash Flow Insight</p>
            <p className="text-blue-700">
              {netCashFlow >= 0 ? (
                <>
                  This business generates <span className="font-semibold">{fmtUSD(netCashFlow)}</span> in
                  positive annual cash flow after covering all debt service and operational requirements.
                  {lendableCashFlow > 0 && debtService > 0 && (
                    <>
                      {' '}The debt service coverage ratio is{' '}
                      <span className="font-semibold">
                        {(lendableCashFlow / debtService).toFixed(2)}x
                      </span>
                      .
                    </>
                  )}
                </>
              ) : (
                <>
                  Warning: This structure results in a{' '}
                  <span className="font-semibold">{fmtUSD(Math.abs(netCashFlow))}</span> annual
                  shortfall. Consider reducing debt service, increasing down payment, or re-evaluating
                  salary requirements.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
