'use client';

import { useState } from 'react';
import { Download, Loader2, FileText } from 'lucide-react';

export interface CRELoanSizerPDFData {
  propertyName?: string;
  propertyAddress?: string;
  preparedFor?: string;
  reportDate: string;
  // Property Info
  propertyType: string;
  purchasePrice: number;
  // Income
  grossRentalIncome: number;
  otherIncome: number;
  effectiveGrossIncome: number;
  vacancyRate: number;
  // Expenses
  operatingExpenses: number;
  expenseRatio: number;
  // NOI
  noi: number;
  capRate: number;
  // Loan Sizing Results
  maxLoanLTV: number;
  maxLoanDSCR: number;
  maxLoanDebtYield: number;
  constrainingFactor: string;
  recommendedLoan: number;
  // Loan Terms
  interestRate: number;
  loanTerm: number;
  amortization: number;
  // Calculated
  monthlyPayment: number;
  annualDebtService: number;
  actualDSCR: number;
  actualLTV: number;
  debtYield: number;
}

interface ExportButtonProps {
  data: CRELoanSizerPDFData | null;
  disabled?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number): string {
  return value.toFixed(2) + '%';
}

function generatePDFHTML(data: CRELoanSizerPDFData): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CRE Loan Sizing Analysis</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #1f2937;
      background: white;
      width: 816px;
    }
    .header {
      background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);
      color: white;
      padding: 30px 40px;
    }
    .header h1 { font-size: 22pt; font-weight: 700; margin-bottom: 5px; }
    .header .subtitle { font-size: 12pt; opacity: 0.9; }
    .header .brand { font-size: 9pt; opacity: 0.75; margin-top: 8px; }
    .content { padding: 25px 40px 40px 40px; }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px 20px;
      margin-bottom: 25px;
    }
    .meta-item { text-align: center; flex: 1; }
    .meta-label { font-size: 8pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .meta-value { font-size: 11pt; font-weight: 600; color: #1e293b; margin-top: 3px; }
    .loan-box {
      background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);
      color: white;
      padding: 25px 30px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 25px;
    }
    .loan-label { font-size: 10pt; opacity: 0.9; }
    .loan-value { font-size: 36pt; font-weight: 700; margin: 8px 0; }
    .loan-constraint {
      display: inline-block;
      background: #D4AF37;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 9pt;
      font-weight: 600;
      margin-top: 8px;
    }
    .sizing-grid {
      display: flex;
      gap: 15px;
      margin-bottom: 25px;
    }
    .sizing-card {
      flex: 1;
      background: #fafafa;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 15px;
      text-align: center;
    }
    .sizing-card.active {
      background: #f0fdf4;
      border-color: #2E7D32;
      border-width: 2px;
    }
    .sizing-card .label { font-size: 9pt; color: #6b7280; margin-bottom: 5px; }
    .sizing-card .value { font-size: 18pt; font-weight: 700; color: #2E7D32; }
    .sizing-card .constraint { font-size: 8pt; color: #9ca3af; margin-top: 3px; }
    .metrics-row {
      display: flex;
      gap: 12px;
      margin-bottom: 25px;
    }
    .metric-box {
      flex: 1;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .metric-box .label { font-size: 8pt; color: #64748b; }
    .metric-box .value { font-size: 14pt; font-weight: 700; color: #1e293b; }
    .section { margin-bottom: 22px; }
    .section-title {
      font-size: 13pt;
      font-weight: 700;
      color: #2E7D32;
      border-bottom: 2px solid #2E7D32;
      padding-bottom: 8px;
      margin-bottom: 14px;
    }
    table { width: 100%; border-collapse: collapse; }
    th {
      background: #f1f5f9;
      padding: 10px 12px;
      text-align: left;
      font-weight: 600;
      font-size: 9pt;
      text-transform: uppercase;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
    }
    td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
    .highlight-row { background: #f0fdf4; }
    .highlight-row td { font-weight: 600; }
    .disclaimer {
      background: #fef9e7;
      border: 1px solid #f7dc6f;
      border-left: 4px solid #f4d03f;
      border-radius: 6px;
      padding: 14px 16px;
      margin-top: 25px;
      font-size: 8pt;
      color: #7d6608;
      line-height: 1.5;
    }
    .disclaimer strong { display: block; margin-bottom: 6px; font-size: 9pt; }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 2px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #6b7280;
    }
    .footer-brand { font-weight: 600; color: #2E7D32; font-size: 10pt; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CRE Loan Sizing Analysis</h1>
    <div class="subtitle">${data.propertyName || data.propertyType + ' Property'}</div>
    <div class="brand">Prepared by Acqyrly | Powered by Starting Gate Financial</div>
  </div>
  <div class="content">
    <div class="meta-bar">
      <div class="meta-item"><div class="meta-label">Report Date</div><div class="meta-value">${data.reportDate}</div></div>
      <div class="meta-item"><div class="meta-label">Property Type</div><div class="meta-value">${data.propertyType}</div></div>
      <div class="meta-item"><div class="meta-label">Purchase Price</div><div class="meta-value">${formatCurrency(data.purchasePrice)}</div></div>
    </div>

    <div class="loan-box">
      <div class="loan-label">Maximum Supportable Loan</div>
      <div class="loan-value">${formatCurrency(data.recommendedLoan)}</div>
      <div class="loan-constraint">Constrained by: ${data.constrainingFactor}</div>
    </div>

    <div class="sizing-grid">
      <div class="sizing-card ${data.constrainingFactor === 'LTV' ? 'active' : ''}">
        <div class="label">Max Loan (LTV)</div>
        <div class="value">${formatCurrency(data.maxLoanLTV)}</div>
        <div class="constraint">75% LTV Limit</div>
      </div>
      <div class="sizing-card ${data.constrainingFactor === 'DSCR' ? 'active' : ''}">
        <div class="label">Max Loan (DSCR)</div>
        <div class="value">${formatCurrency(data.maxLoanDSCR)}</div>
        <div class="constraint">1.25x DSCR Limit</div>
      </div>
      <div class="sizing-card ${data.constrainingFactor === 'Debt Yield' ? 'active' : ''}">
        <div class="label">Max Loan (Debt Yield)</div>
        <div class="value">${formatCurrency(data.maxLoanDebtYield)}</div>
        <div class="constraint">9% Min Yield</div>
      </div>
    </div>

    <div class="metrics-row">
      <div class="metric-box"><div class="label">Actual LTV</div><div class="value">${formatPercent(data.actualLTV)}</div></div>
      <div class="metric-box"><div class="label">Actual DSCR</div><div class="value">${data.actualDSCR.toFixed(2)}x</div></div>
      <div class="metric-box"><div class="label">Debt Yield</div><div class="value">${formatPercent(data.debtYield)}</div></div>
      <div class="metric-box"><div class="label">Cap Rate</div><div class="value">${formatPercent(data.capRate)}</div></div>
    </div>

    <div class="section">
      <div class="section-title">Property Income Analysis</div>
      <table>
        <tr><td style="width:60%">Gross Rental Income</td><td style="text-align:right;font-family:monospace">${formatCurrency(data.grossRentalIncome)}</td></tr>
        <tr><td>Other Income</td><td style="text-align:right;font-family:monospace">${formatCurrency(data.otherIncome)}</td></tr>
        <tr><td>Less: Vacancy (${data.vacancyRate}%)</td><td style="text-align:right;font-family:monospace;color:#dc2626">-${formatCurrency((data.grossRentalIncome + data.otherIncome) * (data.vacancyRate / 100))}</td></tr>
        <tr><td>Effective Gross Income</td><td style="text-align:right;font-family:monospace">${formatCurrency(data.effectiveGrossIncome)}</td></tr>
        <tr><td>Less: Operating Expenses (${data.expenseRatio.toFixed(0)}%)</td><td style="text-align:right;font-family:monospace;color:#dc2626">-${formatCurrency(data.operatingExpenses)}</td></tr>
        <tr class="highlight-row"><td><strong>Net Operating Income (NOI)</strong></td><td style="text-align:right;font-family:monospace;color:#2E7D32">${formatCurrency(data.noi)}</td></tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Loan Terms</div>
      <table>
        <tr><td style="width:60%">Loan Amount</td><td style="text-align:right;font-family:monospace">${formatCurrency(data.recommendedLoan)}</td></tr>
        <tr><td>Interest Rate</td><td style="text-align:right;font-family:monospace">${formatPercent(data.interestRate)}</td></tr>
        <tr><td>Loan Term</td><td style="text-align:right;font-family:monospace">${data.loanTerm} years</td></tr>
        <tr><td>Amortization</td><td style="text-align:right;font-family:monospace">${data.amortization} years</td></tr>
        <tr><td>Monthly Payment</td><td style="text-align:right;font-family:monospace">${formatCurrency(data.monthlyPayment)}</td></tr>
        <tr class="highlight-row"><td><strong>Annual Debt Service</strong></td><td style="text-align:right;font-family:monospace">${formatCurrency(data.annualDebtService)}</td></tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Equity Requirement</div>
      <table>
        <tr><td style="width:60%">Purchase Price</td><td style="text-align:right;font-family:monospace">${formatCurrency(data.purchasePrice)}</td></tr>
        <tr><td>Less: Loan Amount</td><td style="text-align:right;font-family:monospace;color:#dc2626">-${formatCurrency(data.recommendedLoan)}</td></tr>
        <tr class="highlight-row"><td><strong>Required Equity</strong></td><td style="text-align:right;font-family:monospace;color:#2E7D32">${formatCurrency(data.purchasePrice - data.recommendedLoan)}</td></tr>
      </table>
    </div>

    <div class="disclaimer"><strong>Important Disclaimer</strong>This loan sizing analysis is for informational purposes only and should not be considered a loan commitment or guarantee of financing. Actual loan terms, rates, and sizing are subject to lender underwriting, property appraisal, credit review, and current market conditions. Consult with a qualified commercial lender before making any financing decisions.</div>
    <div class="footer"><div><div class="footer-brand">Acqyrly</div><div>by Starting Gate Financial</div></div><div style="text-align:right">startinggatefinancial.com<br>Richardson, TX</div></div>
  </div>
</body>
</html>`;
}

export default function CRELoanSizerExportButton({ data, disabled }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [propertyName, setPropertyName] = useState('');
  const [preparedFor, setPreparedFor] = useState('');

  const handleExport = async () => {
    if (!data) return;
    setIsExporting(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas')]);
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '816px';
      container.innerHTML = generatePDFHTML({ ...data, propertyName: propertyName || data.propertyName, preparedFor: preparedFor || undefined, reportDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) });
      document.body.appendChild(container);
      await new Promise(resolve => setTimeout(resolve, 100));
      const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
      document.body.removeChild(container);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });
      const imgWidth = 8.5;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      if (imgHeight > 11) { let position = -11; while (position > -imgHeight) { pdf.addPage(); pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight); position -= 11; } }
      pdf.save(`CRE-Loan-Sizing-${propertyName || 'Report'}-${new Date().toISOString().split('T')[0]}.pdf`);
      setShowModal(false);
      setPropertyName('');
      setPreparedFor('');
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} disabled={disabled || !data || isExporting} className="inline-flex items-center gap-2 bg-white border-2 border-sgf-gold-500 text-sgf-gold-600 hover:bg-sgf-gold-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg font-semibold transition-all">
        {isExporting ? (<><Loader2 className="w-5 h-5 animate-spin" />Generating...</>) : (<><Download className="w-5 h-5" />Export PDF</>)}
      </button>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-sgf-green-100 rounded-xl flex items-center justify-center"><FileText className="w-6 h-6 text-sgf-green-600" /></div>
              <div><h3 className="font-bold text-gray-900 text-lg">Export Loan Sizing Report</h3><p className="text-sm text-gray-500">Generate a professional PDF report</p></div>
            </div>
            <div className="space-y-4 mb-6">
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Property Name <span className="text-gray-400 font-normal">(optional)</span></label><input type="text" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} placeholder="Property Name or Address" className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-sgf-green-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Prepared For <span className="text-gray-400 font-normal">(optional)</span></label><input type="text" value={preparedFor} onChange={(e) => setPreparedFor(e.target.value)} placeholder="Prospective Borrower" className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-sgf-green-500 focus:outline-none" /></div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6"><p className="text-sm text-gray-600"><strong className="text-gray-900">Report includes:</strong><br/>• Max loan by LTV, DSCR, Debt Yield<br/>• Property income analysis<br/>• Loan terms summary<br/>• Professional SGF branding</p></div>
            <div className="flex gap-3">
              <button onClick={() => { setShowModal(false); setPropertyName(''); setPreparedFor(''); }} className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-50">Cancel</button>
              <button onClick={handleExport} disabled={isExporting} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-sgf-green-600 to-sgf-green-700 text-white rounded-lg font-semibold hover:from-sgf-green-700 hover:to-sgf-green-800 disabled:from-gray-400 disabled:to-gray-500 flex items-center justify-center gap-2">
                {isExporting ? (<><Loader2 className="w-4 h-4 animate-spin" />Generating...</>) : (<><Download className="w-4 h-4" />Generate PDF</>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
