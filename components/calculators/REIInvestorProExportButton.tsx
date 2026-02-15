'use client';
import { useState } from 'react';
import { Download, Loader2, FileText } from 'lucide-react';

export interface REIInvestorProPDFData {
  propertyName?: string;
  propertyAddress?: string;
  preparedFor?: string;
  reportDate: string;
  strategy: 'buy-hold' | 'fix-flip' | 'brrrr';
  // Property
  purchasePrice: number;
  afterRepairValue: number;
  rehabCosts: number;
  // Income
  monthlyRent: number;
  vacancyRate: number;
  effectiveGrossIncome: number;
  // Expenses
  totalAnnualExpenses: number;
  expenseRatio: number;
  // NOI & Financing
  netOperatingIncome: number;
  capRate: number;
  downPayment: number;
  loanAmount: number;
  monthlyMortgage: number;
  annualDebtService: number;
  dscr: number;
  // Returns
  annualCashFlow: number;
  monthlyCashFlow: number;
  cashOnCashReturn: number;
  totalCashInvested: number;
  grossRentMultiplier: number;
  breakEvenRatio: number;
  // Buy & Hold specific
  irr?: number;
  exitValue?: number;
  exitEquity?: number;
  equitySchedule?: Array<{ year: number; propertyValue: number; loanBalance: number; equity: number; equityPercent: number }>;
  // Fix & Flip specific
  actualProfit?: number;
  roi?: number;
  annualizedROI?: number;
  profitMargin?: number;
  meetsRule70?: boolean;
  maxPurchasePrice70?: number;
  totalHoldingCosts?: number;
  // BRRRR specific
  refinanceAmount?: number;
  cashOutFromRefi?: number;
  cashLeftInDeal?: number;
  annualCashFlowAfterRefi?: number;
  cashOnCashAfterRefi?: number;
  infiniteReturn?: boolean;
  dscrAfterRefi?: number;
}

interface ExportButtonProps {
  data: REIInvestorProPDFData | null;
  disabled?: boolean;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const formatPercent = (value: number): string => value.toFixed(2) + '%';

const strategyLabel = (s: string) => {
  if (s === 'buy-hold') return 'Buy & Hold';
  if (s === 'fix-flip') return 'Fix & Flip';
  if (s === 'brrrr') return 'BRRRR';
  return s;
};

function generatePDFHTML(data: REIInvestorProPDFData): string {
  const dscrColor = data.dscr >= 1.25 ? '#16a34a' : data.dscr >= 1.15 ? '#D4AF37' : '#dc2626';

  const equityRows = data.equitySchedule?.map(row => `
    <tr>
      <td style="text-align:center">Year ${row.year}</td>
      <td style="text-align:right;font-family:monospace">${formatCurrency(row.propertyValue)}</td>
      <td style="text-align:right;font-family:monospace">${formatCurrency(row.loanBalance)}</td>
      <td style="text-align:right;font-family:monospace">${formatCurrency(row.equity)}</td>
      <td style="text-align:right;font-family:monospace">${row.equityPercent.toFixed(1)}%</td>
    </tr>
  `).join('') || '';

  const strategySection = () => {
    if (data.strategy === 'buy-hold') return `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0">
        <h3 style="color:#15803d;margin:0 0 12px">Buy & Hold Results</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#555">IRR</td><td style="text-align:right;font-weight:bold;color:#15803d">${data.irr?.toFixed(1)}%</td></tr>
          <tr><td style="padding:4px 0;color:#555">Exit Value</td><td style="text-align:right;font-weight:bold">${formatCurrency(data.exitValue || 0)}</td></tr>
          <tr><td style="padding:4px 0;color:#555">Exit Equity</td><td style="text-align:right;font-weight:bold">${formatCurrency(data.exitEquity || 0)}</td></tr>
          <tr><td style="padding:4px 0;color:#555">Annual Cash Flow</td><td style="text-align:right;font-weight:bold">${formatCurrency(data.annualCashFlow)}</td></tr>
          <tr><td style="padding:4px 0;color:#555">Cash-on-Cash Return</td><td style="text-align:right;font-weight:bold">${formatPercent(data.cashOnCashReturn)}</td></tr>
        </table>
      </div>
      ${data.equitySchedule ? `
      <h3 style="color:#1a1a1a;margin:16px 0 8px">Equity Build Schedule</h3>
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead><tr style="background:#2E7D32;color:white">
          <th style="padding:6px;text-align:center">Year</th>
          <th style="padding:6px;text-align:right">Property Value</th>
          <th style="padding:6px;text-align:right">Loan Balance</th>
          <th style="padding:6px;text-align:right">Equity</th>
          <th style="padding:6px;text-align:right">Equity %</th>
        </tr></thead>
        <tbody>${equityRows}</tbody>
      </table>` : ''}
    `;
    if (data.strategy === 'fix-flip') return `
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0">
        <h3 style="color:#92400e;margin:0 0 12px">Fix & Flip Results</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#555">Net Profit</td><td style="text-align:right;font-weight:bold;color:${(data.actualProfit||0)>=0?'#15803d':'#dc2626'}">${formatCurrency(data.actualProfit || 0)}</td></tr>
          <tr><td style="padding:4px 0;color:#555">ROI</td><td style="text-align:right;font-weight:bold">${formatPercent(data.roi || 0)}</td></tr>
          <tr><td style="padding:4px 0;color:#555">Annualized ROI</td><td style="text-align:right;font-weight:bold">${formatPercent(data.annualizedROI || 0)}</td></tr>
          <tr><td style="padding:4px 0;color:#555">Profit Margin</td><td style="text-align:right;font-weight:bold">${formatPercent(data.profitMargin || 0)}</td></tr>
          <tr><td style="padding:4px 0;color:#555">Total Holding Costs</td><td style="text-align:right;font-weight:bold">${formatCurrency(data.totalHoldingCosts || 0)}</td></tr>
          <tr><td style="padding:4px 0;color:#555">70% Rule</td><td style="text-align:right;font-weight:bold;color:${data.meetsRule70?'#15803d':'#dc2626'}">${data.meetsRule70?'✅ Passes':'❌ Fails'} (Max: ${formatCurrency(data.maxPurchasePrice70||0)})</td></tr>
        </table>
      </div>
    `;
    if (data.strategy === 'brrrr') return `
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:16px 0">
        <h3 style="color:#1d4ed8;margin:0 0 12px">BRRRR Results</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#555">Refinance Amount</td><td style="text-align:right;font-weight:bold">${formatCurrency(data.refinanceAmount || 0)}</td></tr>
          <tr><td style="padding:4px 0;color:#555">Cash Out from Refi</td><td style="text-align:right;font-weight:bold">${formatCurrency(data.cashOutFromRefi || 0)}</td></tr>
          <tr><td style="padding:4px 0;color:#555">Cash Left in Deal</td><td style="text-align:right;font-weight:bold">${formatCurrency(data.cashLeftInDeal || 0)}</td></tr>
          <tr><td style="padding:4px 0;color:#555">Cash Flow After Refi</td><td style="text-align:right;font-weight:bold">${formatCurrency(data.annualCashFlowAfterRefi || 0)}</td></tr>
          <tr><td style="padding:4px 0;color:#555">Cash-on-Cash After Refi</td><td style="text-align:right;font-weight:bold;color:#15803d">${data.infiniteReturn ? '∞ Infinite Return!' : formatPercent(data.cashOnCashAfterRefi || 0)}</td></tr>
          <tr><td style="padding:4px 0;color:#555">DSCR After Refi</td><td style="text-align:right;font-weight:bold">${data.dscrAfterRefi?.toFixed(2)}x</td></tr>
        </table>
      </div>
    `;
    return '';
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Real Estate Investor Pro Analysis - ${data.propertyName || 'Property'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; background: white; }
    .page { max-width: 800px; margin: 0 auto; padding: 32px; }
    table { width: 100%; border-collapse: collapse; }
    tr:nth-child(even) { background: #f9fafb; }
    td, th { padding: 6px 8px; }
  </style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#2E7D32,#1B5E20);color:white;padding:24px;border-radius:12px;margin-bottom:24px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div style="font-size:11px;opacity:0.8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Starting Gate Financial</div>
        <div style="font-size:22px;font-weight:bold">Real Estate Investor Pro Analysis</div>
        <div style="font-size:14px;opacity:0.9;margin-top:4px">${strategyLabel(data.strategy)} Strategy</div>
        ${data.propertyName ? `<div style="font-size:13px;opacity:0.8;margin-top:2px">${data.propertyName}</div>` : ''}
        ${data.propertyAddress ? `<div style="font-size:12px;opacity:0.7">${data.propertyAddress}</div>` : ''}
      </div>
      <div style="text-align:right;font-size:11px;opacity:0.8">
        <div>${data.reportDate}</div>
        ${data.preparedFor ? `<div>Prepared for: ${data.preparedFor}</div>` : ''}
        <div style="margin-top:8px;background:rgba(255,255,255,0.2);padding:4px 8px;border-radius:4px">
          ${strategyLabel(data.strategy).toUpperCase()} ANALYSIS
        </div>
      </div>
    </div>
  </div>

  <!-- Key Metrics Row -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:11px;color:#666;margin-bottom:4px">Purchase Price</div>
      <div style="font-size:18px;font-weight:bold;color:#15803d">${formatCurrency(data.purchasePrice)}</div>
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:11px;color:#666;margin-bottom:4px">Cap Rate</div>
      <div style="font-size:18px;font-weight:bold;color:#15803d">${formatPercent(data.capRate)}</div>
    </div>
    <div style="background:${data.dscr>=1.25?'#f0fdf4':data.dscr>=1.15?'#fefce8':'#fef2f2'};border:1px solid ${data.dscr>=1.25?'#bbf7d0':data.dscr>=1.15?'#fde68a':'#fecaca'};border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:11px;color:#666;margin-bottom:4px">DSCR</div>
      <div style="font-size:18px;font-weight:bold;color:${dscrColor}">${data.dscr.toFixed(2)}x</div>
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:11px;color:#666;margin-bottom:4px">Cash-on-Cash</div>
      <div style="font-size:18px;font-weight:bold;color:#15803d">${formatPercent(data.cashOnCashReturn)}</div>
    </div>
  </div>

  <!-- Two Column Layout -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
    <!-- Income & Expenses -->
    <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <div style="background:#2E7D32;color:white;padding:8px 12px;font-weight:bold;font-size:12px">INCOME & EXPENSES</div>
      <div style="padding:12px">
        <table style="font-size:12px">
          <tr><td style="color:#555;padding:3px 0">Monthly Rent</td><td style="text-align:right">${formatCurrency(data.monthlyRent)}</td></tr>
          <tr><td style="color:#555;padding:3px 0">Vacancy Rate</td><td style="text-align:right">${data.vacancyRate}%</td></tr>
          <tr><td style="color:#555;padding:3px 0">Effective Gross Income</td><td style="text-align:right">${formatCurrency(data.effectiveGrossIncome)}</td></tr>
          <tr><td style="color:#555;padding:3px 0">Total Annual Expenses</td><td style="text-align:right;color:#dc2626">(${formatCurrency(data.totalAnnualExpenses)})</td></tr>
          <tr style="border-top:1px solid #e5e7eb"><td style="color:#15803d;font-weight:bold;padding:4px 0">Net Operating Income</td><td style="text-align:right;font-weight:bold;color:#15803d">${formatCurrency(data.netOperatingIncome)}</td></tr>
          <tr><td style="color:#555;padding:3px 0">Expense Ratio</td><td style="text-align:right">${formatPercent(data.expenseRatio)}</td></tr>
        </table>
      </div>
    </div>

    <!-- Financing -->
    <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <div style="background:#D4AF37;color:white;padding:8px 12px;font-weight:bold;font-size:12px">FINANCING</div>
      <div style="padding:12px">
        <table style="font-size:12px">
          <tr><td style="color:#555;padding:3px 0">Down Payment</td><td style="text-align:right">${formatCurrency(data.downPayment)}</td></tr>
          <tr><td style="color:#555;padding:3px 0">Loan Amount</td><td style="text-align:right">${formatCurrency(data.loanAmount)}</td></tr>
          <tr><td style="color:#555;padding:3px 0">Monthly Mortgage</td><td style="text-align:right">${formatCurrency(data.monthlyMortgage)}</td></tr>
          <tr><td style="color:#555;padding:3px 0">Annual Debt Service</td><td style="text-align:right">${formatCurrency(data.annualDebtService)}</td></tr>
          <tr style="border-top:1px solid #e5e7eb"><td style="color:#555;font-weight:bold;padding:4px 0">DSCR</td><td style="text-align:right;font-weight:bold;color:${dscrColor}">${data.dscr.toFixed(2)}x</td></tr>
          <tr><td style="color:#555;padding:3px 0">Total Cash Invested</td><td style="text-align:right;font-weight:bold">${formatCurrency(data.totalCashInvested)}</td></tr>
        </table>
      </div>
    </div>
  </div>

  <!-- Key Ratios -->
  <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:16px">
    <div style="background:#374151;color:white;padding:8px 12px;font-weight:bold;font-size:12px">KEY RATIOS</div>
    <div style="padding:12px">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;text-align:center">
        <div><div style="font-size:11px;color:#666">Monthly Cash Flow</div><div style="font-weight:bold;color:${data.monthlyCashFlow>=0?'#15803d':'#dc2626'}">${formatCurrency(data.monthlyCashFlow)}</div></div>
        <div><div style="font-size:11px;color:#666">GRM</div><div style="font-weight:bold">${data.grossRentMultiplier.toFixed(1)}x</div></div>
        <div><div style="font-size:11px;color:#666">Break-Even Ratio</div><div style="font-weight:bold">${formatPercent(data.breakEvenRatio)}</div></div>
        <div><div style="font-size:11px;color:#666">After Repair Value</div><div style="font-weight:bold">${formatCurrency(data.afterRepairValue)}</div></div>
      </div>
    </div>
  </div>

  <!-- Strategy Specific Results -->
  ${strategySection()}

  <!-- Footer -->
  <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center">
    <div>
      <div style="font-weight:bold;color:#2E7D32;font-size:13px">Starting Gate Financial</div>
      <div style="color:#666;font-size:11px">startinggatefinancial.com | Richardson, TX</div>
    </div>
    <div style="font-size:10px;color:#9ca3af;max-width:400px;text-align:right">
      This analysis is for informational purposes only and does not constitute financial advice. 
      Consult with a qualified financial advisor before making investment decisions.
    </div>
  </div>
</div>
</body>
</html>`;
}

export default function REIInvestorProExportButton({ data, disabled }: ExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [preparedFor, setPreparedFor] = useState('');

  const handleGenerate = async () => {
    if (!data) return;
    setIsGenerating(true);
    try {
      const pdfData: REIInvestorProPDFData = {
        ...data,
        propertyName: propertyName || data.propertyName,
        propertyAddress: propertyAddress || data.propertyAddress,
        preparedFor: preparedFor || data.preparedFor,
      };
      const htmlContent = generatePDFHTML(pdfData);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CRE-Acquisition-Analysis-${(propertyName || 'Property').replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setShowModal(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={disabled || !data}
        className="inline-flex items-center gap-2 bg-sgf-gold-500 hover:bg-sgf-gold-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm"
      >
        <FileText className="w-4 h-4" />
        Export PDF
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-sgf-green-600 to-sgf-green-700 p-6 rounded-t-2xl text-white">
              <h2 className="text-xl font-bold">Export Real Estate Investor Pro Report</h2>
              <p className="text-sgf-green-100 text-sm mt-1">{data ? strategyLabel(data.strategy) : ''} Strategy Analysis</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Property Name</label>
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="e.g. 123 Main St Duplex"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-sgf-green-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Property Address</label>
                <input
                  type="text"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  placeholder="e.g. 123 Main St, Dallas, TX 75201"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-sgf-green-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Prepared For</label>
                <input
                  type="text"
                  value={preparedFor}
                  onChange={(e) => setPreparedFor(e.target.value)}
                  placeholder="Client name (optional)"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-sgf-green-500 focus:outline-none text-sm"
                />
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sgf-green-600 to-sgf-green-700 hover:from-sgf-green-700 hover:to-sgf-green-800 text-white px-4 py-2.5 rounded-lg font-bold transition-all text-sm disabled:opacity-50"
              >
                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Download className="w-4 h-4" />Generate PDF</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
