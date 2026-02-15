'use client';
import { useState } from 'react';
import { Download, Loader2, FileText } from 'lucide-react';

export interface CommercialPropertyPDFData {
  propertyName?: string;
  propertyAddress?: string;
  preparedFor?: string;
  reportDate: string;
  propertyType: string;
  // Property Details
  purchasePrice: number;
  squareFootage: number;
  pricePerSqFt: number;
  yearBuilt?: number;
  // Income
  baseRent: number;
  camRecoveries: number;
  otherIncome: number;
  vacancyRate: number;
  effectiveGrossIncome: number;
  // NNN
  isNNN: boolean;
  tenantPaysCAM?: number;
  tenantPaysTaxes?: number;
  tenantPaysInsurance?: number;
  // Expenses
  totalExpenses: number;
  expenseRatio: number;
  // NOI & Valuation
  noi: number;
  capRate: number;
  valuationByCapRate: number;
  // Financing
  loanAmount: number;
  downPayment: number;
  monthlyPayment: number;
  annualDebtService: number;
  dscr: number;
  debtYield: number;
  // Returns
  annualCashFlow: number;
  monthlyCashFlow: number;
  cashOnCash: number;
  totalCashInvested: number;
  // Equity Schedule
  equitySchedule?: Array<{ year: number; propertyValue: number; loanBalance: number; equity: number; equityPercent: number }>;
  // Tenant
  tenantName?: string;
  leaseType?: string;
  leaseTerm?: number;
  leaseExpiration?: string;
  rentEscalation?: number;
}

const formatCurrency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
const formatPercent = (v: number) => v.toFixed(2) + '%';

function generateHTML(data: CommercialPropertyPDFData): string {
  const dscrColor = data.dscr >= 1.25 ? '#16a34a' : data.dscr >= 1.15 ? '#D4AF37' : '#dc2626';
  const equityRows = data.equitySchedule?.map(r => `
    <tr style="background:${r.year % 2 === 0 ? '#f9fafb' : 'white'}">
      <td style="padding:5px 8px;text-align:center">Year ${r.year}</td>
      <td style="padding:5px 8px;text-align:right;font-family:monospace">${formatCurrency(r.propertyValue)}</td>
      <td style="padding:5px 8px;text-align:right;font-family:monospace;color:#dc2626">${formatCurrency(r.loanBalance)}</td>
      <td style="padding:5px 8px;text-align:right;font-family:monospace;color:#15803d;font-weight:bold">${formatCurrency(r.equity)}</td>
      <td style="padding:5px 8px;text-align:right;font-family:monospace">${r.equityPercent.toFixed(1)}%</td>
    </tr>
  `).join('') || '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Commercial Property Analysis - ${data.propertyName || 'Property'}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:Arial,sans-serif; font-size:13px; color:#1a1a1a; background:white; }
    .page { max-width:800px; margin:0 auto; padding:32px; }
    table { width:100%; border-collapse:collapse; }
  </style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#2E7D32,#1B5E20);color:white;padding:24px;border-radius:12px;margin-bottom:24px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div style="font-size:11px;opacity:0.8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Starting Gate Financial</div>
        <div style="font-size:22px;font-weight:bold">Commercial Property Analysis</div>
        <div style="font-size:14px;opacity:0.9;margin-top:4px">${data.propertyType} ${data.isNNN ? '| Triple Net (NNN)' : ''}</div>
        ${data.propertyName ? `<div style="font-size:13px;opacity:0.8;margin-top:2px">${data.propertyName}</div>` : ''}
        ${data.propertyAddress ? `<div style="font-size:12px;opacity:0.7">${data.propertyAddress}</div>` : ''}
      </div>
      <div style="text-align:right;font-size:11px;opacity:0.8">
        <div>${data.reportDate}</div>
        ${data.preparedFor ? `<div>Prepared for: ${data.preparedFor}</div>` : ''}
        <div style="margin-top:8px;background:rgba(212,175,55,0.4);padding:4px 10px;border-radius:20px;font-weight:bold">COMMERCIAL ANALYSIS</div>
      </div>
    </div>
  </div>

  <!-- Key Metrics -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:11px;color:#666;margin-bottom:4px">Purchase Price</div>
      <div style="font-size:16px;font-weight:bold;color:#15803d">${formatCurrency(data.purchasePrice)}</div>
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:11px;color:#666;margin-bottom:4px">Cap Rate</div>
      <div style="font-size:16px;font-weight:bold;color:#15803d">${formatPercent(data.capRate)}</div>
    </div>
    <div style="background:${data.dscr>=1.25?'#f0fdf4':data.dscr>=1.15?'#fefce8':'#fef2f2'};border:1px solid ${data.dscr>=1.25?'#bbf7d0':data.dscr>=1.15?'#fde68a':'#fecaca'};border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:11px;color:#666;margin-bottom:4px">DSCR</div>
      <div style="font-size:16px;font-weight:bold;color:${dscrColor}">${data.dscr.toFixed(2)}x</div>
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:11px;color:#666;margin-bottom:4px">Price/SqFt</div>
      <div style="font-size:16px;font-weight:bold;color:#15803d">${formatCurrency(data.pricePerSqFt)}</div>
    </div>
  </div>

  <!-- Two Column -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
    <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <div style="background:#2E7D32;color:white;padding:8px 12px;font-weight:bold;font-size:12px">INCOME & NOI</div>
      <div style="padding:12px">
        <table style="font-size:12px">
          <tr><td style="color:#555;padding:3px 0">Base Rent (Annual)</td><td style="text-align:right">${formatCurrency(data.baseRent)}</td></tr>
          <tr><td style="color:#555;padding:3px 0">CAM Recoveries</td><td style="text-align:right">${formatCurrency(data.camRecoveries)}</td></tr>
          <tr><td style="color:#555;padding:3px 0">Other Income</td><td style="text-align:right">${formatCurrency(data.otherIncome)}</td></tr>
          <tr><td style="color:#555;padding:3px 0">Vacancy (${data.vacancyRate}%)</td><td style="text-align:right;color:#dc2626">(${formatCurrency(data.effectiveGrossIncome * data.vacancyRate / (100 - data.vacancyRate))})</td></tr>
          <tr><td style="color:#555;padding:3px 0">Total Expenses</td><td style="text-align:right;color:#dc2626">(${formatCurrency(data.totalExpenses)})</td></tr>
          <tr style="border-top:1px solid #e5e7eb"><td style="color:#15803d;font-weight:bold;padding:4px 0">NOI</td><td style="text-align:right;font-weight:bold;color:#15803d">${formatCurrency(data.noi)}</td></tr>
          <tr><td style="color:#555;padding:3px 0">Expense Ratio</td><td style="text-align:right">${formatPercent(data.expenseRatio)}</td></tr>
        </table>
      </div>
    </div>
    <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <div style="background:#D4AF37;color:white;padding:8px 12px;font-weight:bold;font-size:12px">FINANCING & RETURNS</div>
      <div style="padding:12px">
        <table style="font-size:12px">
          <tr><td style="color:#555;padding:3px 0">Down Payment</td><td style="text-align:right">${formatCurrency(data.downPayment)}</td></tr>
          <tr><td style="color:#555;padding:3px 0">Loan Amount</td><td style="text-align:right">${formatCurrency(data.loanAmount)}</td></tr>
          <tr><td style="color:#555;padding:3px 0">Annual Debt Service</td><td style="text-align:right">${formatCurrency(data.annualDebtService)}</td></tr>
          <tr><td style="color:#555;padding:3px 0">Debt Yield</td><td style="text-align:right">${formatPercent(data.debtYield)}</td></tr>
          <tr style="border-top:1px solid #e5e7eb"><td style="color:#555;font-weight:bold;padding:4px 0">Annual Cash Flow</td><td style="text-align:right;font-weight:bold;color:${data.annualCashFlow>=0?'#15803d':'#dc2626'}">${formatCurrency(data.annualCashFlow)}</td></tr>
          <tr><td style="color:#555;padding:3px 0">Cash-on-Cash Return</td><td style="text-align:right;font-weight:bold">${formatPercent(data.cashOnCash)}</td></tr>
        </table>
      </div>
    </div>
  </div>

  ${data.tenantName ? `
  <!-- Tenant Info -->
  <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:16px">
    <div style="background:#374151;color:white;padding:8px 12px;font-weight:bold;font-size:12px">TENANT INFORMATION</div>
    <div style="padding:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px;text-align:center;font-size:12px">
      <div><div style="color:#666">Tenant</div><div style="font-weight:bold">${data.tenantName}</div></div>
      <div><div style="color:#666">Lease Type</div><div style="font-weight:bold">${data.leaseType || 'N/A'}</div></div>
      <div><div style="color:#666">Lease Term</div><div style="font-weight:bold">${data.leaseTerm || 'N/A'} years</div></div>
      <div><div style="color:#666">Rent Escalation</div><div style="font-weight:bold">${data.rentEscalation || 0}% annually</div></div>
    </div>
  </div>` : ''}

  ${data.equitySchedule ? `
  <!-- Equity Schedule -->
  <h3 style="color:#1a1a1a;margin:16px 0 8px;font-size:14px">10-Year Equity Build Schedule</h3>
  <table style="font-size:12px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
    <thead><tr style="background:#2E7D32;color:white">
      <th style="padding:6px 8px;text-align:center">Year</th>
      <th style="padding:6px 8px;text-align:right">Property Value</th>
      <th style="padding:6px 8px;text-align:right">Loan Balance</th>
      <th style="padding:6px 8px;text-align:right">Equity</th>
      <th style="padding:6px 8px;text-align:right">Equity %</th>
    </tr></thead>
    <tbody>${equityRows}</tbody>
  </table>` : ''}

  <!-- Footer -->
  <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center">
    <div>
      <div style="font-weight:bold;color:#2E7D32;font-size:13px">Starting Gate Financial</div>
      <div style="color:#666;font-size:11px">startinggatefinancial.com | Richardson, TX</div>
    </div>
    <div style="font-size:10px;color:#9ca3af;max-width:380px;text-align:right">
      For informational purposes only. Not financial advice. Consult a qualified advisor before investing.
    </div>
  </div>
</div>
</body>
</html>`;
}

export default function CommercialPropertyExportButton({ data, disabled }: { data: CommercialPropertyPDFData | null; disabled?: boolean }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [preparedFor, setPreparedFor] = useState('');

  const handleGenerate = async () => {
    if (!data) return;
    setIsGenerating(true);
    try {
      const html = generateHTML({ ...data, propertyName: propertyName || data.propertyName, propertyAddress: propertyAddress || data.propertyAddress, preparedFor: preparedFor || data.preparedFor });
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Commercial-Property-Analysis-${(propertyName || 'Property').replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setShowModal(false);
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} disabled={disabled || !data}
        className="inline-flex items-center gap-2 bg-sgf-gold-500 hover:bg-sgf-gold-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm">
        <FileText className="w-4 h-4" />Export PDF
      </button>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-sgf-green-600 to-sgf-green-700 p-6 rounded-t-2xl text-white">
              <h2 className="text-xl font-bold">Export Commercial Property Report</h2>
              <p className="text-sgf-green-100 text-sm mt-1">{data?.propertyType} Analysis</p>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Property Name', value: propertyName, set: setPropertyName, placeholder: 'e.g. Main Street Retail Center' },
                { label: 'Property Address', value: propertyAddress, set: setPropertyAddress, placeholder: 'e.g. 456 Main St, Dallas, TX' },
                { label: 'Prepared For', value: preparedFor, set: setPreparedFor, placeholder: 'Client name (optional)' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
                  <input type="text" value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-sgf-green-500 focus:outline-none text-sm" />
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={handleGenerate} disabled={isGenerating}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sgf-green-600 to-sgf-green-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm disabled:opacity-50">
                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Download className="w-4 h-4" />Generate PDF</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
