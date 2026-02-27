'use client';

import { useState } from 'react';
import { Download, Loader2, FileText } from 'lucide-react';

export interface AcquisitionPDFData {
  businessName?: string;
  preparedFor?: string;
  reportDate: string;
  // Business Info
  askingPrice: number;
  annualRevenue: number;
  annualSDE: number;
  // Deal Structure
  downPayment: number;
  downPaymentPercent: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  // Calculated Results
  monthlyPayment: number;
  annualDebtService: number;
  dscr: number;
  dscrStatus: string;
  // Returns
  annualCashFlow: number;
  cashOnCashReturn: number;
  roi: number;
  irr?: number;
  paybackPeriod: number;
  // Multiples
  sdeMultiple: number;
  revenueMultiple: number;
  // 5-Year Projections (optional)
  projections?: Array<{
    year: number;
    revenue: number;
    cashFlow: number;
    equity: number;
    cumulativeCashFlow: number;
  }>;
}

interface ExportButtonProps {
  data: AcquisitionPDFData | null;
  disabled?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number): string {
  return value.toFixed(1) + '%';
}

function getDSCRColor(status: string): string {
  if (status.toLowerCase().includes('strong') || status.toLowerCase().includes('bankable')) return '#16a34a';
  if (status.toLowerCase().includes('marginal') || status.toLowerCase().includes('caution')) return '#D4AF37';
  return '#dc2626';
}

function generatePDFHTML(data: AcquisitionPDFData): string {
  const dscrColor = getDSCRColor(data.dscrStatus);
  
  const projectionRows = data.projections?.map(p => `
    <tr>
      <td style="text-align:center">Year ${p.year}</td>
      <td style="text-align:right;font-family:monospace">${formatCurrency(p.revenue)}</td>
      <td style="text-align:right;font-family:monospace">${formatCurrency(p.cashFlow)}</td>
      <td style="text-align:right;font-family:monospace">${formatCurrency(p.equity)}</td>
      <td style="text-align:right;font-family:monospace">${formatCurrency(p.cumulativeCashFlow)}</td>
    </tr>
  `).join('') || '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Business Acquisition Analysis</title>
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
    .summary-grid {
      display: flex;
      gap: 15px;
      margin-bottom: 25px;
    }
    .summary-card {
      flex: 1;
      background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
    }
    .summary-card.gold {
      background: linear-gradient(135deg, #D4AF37 0%, #B8960C 100%);
    }
    .summary-card .label { font-size: 9pt; opacity: 0.9; margin-bottom: 5px; }
    .summary-card .value { font-size: 24pt; font-weight: 700; }
    .summary-card .sub { font-size: 9pt; opacity: 0.8; margin-top: 5px; }
    .stats-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 25px;
    }
    .stat-box {
      flex: 1;
      min-width: 30%;
      background: #fafafa;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .stat-box .label { font-size: 8pt; color: #6b7280; margin-bottom: 4px; }
    .stat-box .value { font-size: 16pt; font-weight: 700; color: #2E7D32; }
    .stat-box .sub { font-size: 7pt; color: #9ca3af; }
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
    .dscr-badge {
      display: inline-block;
      background: ${dscrColor};
      color: white;
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 9pt;
      font-weight: 600;
    }
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
    <h1>Business Acquisition Analysis</h1>
    <div class="subtitle">${data.businessName || 'Deal Analysis Report'}</div>
    <div class="brand">Prepared by Acqyrly | Powered by Starting Gate Financial</div>
  </div>
  <div class="content">
    <div class="meta-bar">
      <div class="meta-item"><div class="meta-label">Report Date</div><div class="meta-value">${data.reportDate}</div></div>
      <div class="meta-item"><div class="meta-label">Prepared For</div><div class="meta-value">${data.preparedFor || 'Prospective Buyer'}</div></div>
      <div class="meta-item"><div class="meta-label">Asking Price</div><div class="meta-value">${formatCurrency(data.askingPrice)}</div></div>
    </div>

    <div class="summary-grid">
      <div class="summary-card">
        <div class="label">Annual Cash Flow</div>
        <div class="value">${formatCurrency(data.annualCashFlow)}</div>
        <div class="sub">After Debt Service</div>
      </div>
      <div class="summary-card gold">
        <div class="label">Cash-on-Cash Return</div>
        <div class="value">${formatPercent(data.cashOnCashReturn)}</div>
        <div class="sub">On ${formatCurrency(data.downPayment)} Down</div>
      </div>
      <div class="summary-card">
        <div class="label">DSCR</div>
        <div class="value">${data.dscr.toFixed(2)}x</div>
        <div class="sub"><span class="dscr-badge">${data.dscrStatus}</span></div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-box"><div class="label">ROI</div><div class="value">${formatPercent(data.roi)}</div></div>
      ${data.irr ? `<div class="stat-box"><div class="label">5-Year IRR</div><div class="value">${formatPercent(data.irr)}</div></div>` : ''}
      <div class="stat-box"><div class="label">Payback Period</div><div class="value">${data.paybackPeriod.toFixed(1)} yrs</div></div>
      <div class="stat-box"><div class="label">SDE Multiple</div><div class="value">${data.sdeMultiple.toFixed(2)}x</div></div>
      <div class="stat-box"><div class="label">Revenue Multiple</div><div class="value">${data.revenueMultiple.toFixed(2)}x</div></div>
    </div>

    <div class="section">
      <div class="section-title">Deal Structure</div>
      <table>
        <tr><td style="width:60%">Asking Price</td><td style="text-align:right;font-family:monospace">${formatCurrency(data.askingPrice)}</td></tr>
        <tr><td>Down Payment (${data.downPaymentPercent.toFixed(0)}%)</td><td style="text-align:right;font-family:monospace">${formatCurrency(data.downPayment)}</td></tr>
        <tr><td>Loan Amount</td><td style="text-align:right;font-family:monospace">${formatCurrency(data.loanAmount)}</td></tr>
        <tr><td>Interest Rate</td><td style="text-align:right;font-family:monospace">${data.interestRate.toFixed(2)}%</td></tr>
        <tr><td>Loan Term</td><td style="text-align:right;font-family:monospace">${data.loanTerm} years</td></tr>
        <tr class="highlight-row"><td><strong>Monthly Payment</strong></td><td style="text-align:right;font-family:monospace">${formatCurrency(data.monthlyPayment)}</td></tr>
        <tr class="highlight-row"><td><strong>Annual Debt Service</strong></td><td style="text-align:right;font-family:monospace">${formatCurrency(data.annualDebtService)}</td></tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Business Financials</div>
      <table>
        <tr><td style="width:60%">Annual Revenue</td><td style="text-align:right;font-family:monospace">${formatCurrency(data.annualRevenue)}</td></tr>
        <tr><td>Annual SDE</td><td style="text-align:right;font-family:monospace;color:#2E7D32;font-weight:600">${formatCurrency(data.annualSDE)}</td></tr>
        <tr><td>SDE Margin</td><td style="text-align:right;font-family:monospace">${((data.annualSDE / data.annualRevenue) * 100).toFixed(1)}%</td></tr>
        <tr><td>Less: Annual Debt Service</td><td style="text-align:right;font-family:monospace;color:#dc2626">-${formatCurrency(data.annualDebtService)}</td></tr>
        <tr class="highlight-row"><td><strong>Annual Cash Flow to Owner</strong></td><td style="text-align:right;font-family:monospace;color:#2E7D32">${formatCurrency(data.annualCashFlow)}</td></tr>
      </table>
    </div>

    ${data.projections && data.projections.length > 0 ? `
    <div class="section">
      <div class="section-title">5-Year Projections</div>
      <table>
        <thead>
          <tr>
            <th style="text-align:center">Year</th>
            <th style="text-align:right">Revenue</th>
            <th style="text-align:right">Cash Flow</th>
            <th style="text-align:right">Equity</th>
            <th style="text-align:right">Cumulative CF</th>
          </tr>
        </thead>
        <tbody>${projectionRows}</tbody>
      </table>
    </div>
    ` : ''}

    <div class="disclaimer"><strong>Important Disclaimer</strong>This acquisition analysis is for informational purposes only and should not be considered professional financial, legal, or investment advice. Actual results may vary based on market conditions, operational performance, due diligence findings, and other factors. Consult qualified professionals before making any acquisition decisions.</div>
    <div class="footer"><div><div class="footer-brand">Acqyrly</div><div>by Starting Gate Financial</div></div><div style="text-align:right">startinggatefinancial.com<br>Richardson, TX</div></div>
  </div>
</body>
</html>`;
}

export default function AcquisitionExportButton({ data, disabled }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [businessName, setBusinessName] = useState('');
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
      container.innerHTML = generatePDFHTML({ ...data, businessName: businessName || data.businessName, preparedFor: preparedFor || undefined, reportDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) });
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
      pdf.save(`Acquisition-Analysis-${businessName || 'Report'}-${new Date().toISOString().split('T')[0]}.pdf`);
      setShowModal(false);
      setBusinessName('');
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
              <div><h3 className="font-bold text-gray-900 text-lg">Export Acquisition Report</h3><p className="text-sm text-gray-500">Generate a professional PDF report</p></div>
            </div>
            <div className="space-y-4 mb-6">
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Business Name <span className="text-gray-400 font-normal">(optional)</span></label><input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business Name" className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-sgf-green-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Prepared For <span className="text-gray-400 font-normal">(optional)</span></label><input type="text" value={preparedFor} onChange={(e) => setPreparedFor(e.target.value)} placeholder="Prospective Buyer" className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-sgf-green-500 focus:outline-none" /></div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6"><p className="text-sm text-gray-600"><strong className="text-gray-900">Report includes:</strong><br/>• Deal structure summary<br/>• ROI, Cash-on-Cash, IRR, DSCR metrics<br/>• 5-year projections<br/>• Professional SGF branding</p></div>
            <div className="flex gap-3">
              <button onClick={() => { setShowModal(false); setBusinessName(''); setPreparedFor(''); }} className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-50">Cancel</button>
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
