'use client';

import { useState } from 'react';
import { Download, Loader2, FileText } from 'lucide-react';

export interface BusinessLoanPDFData {
  businessName?: string;
  preparedFor?: string;
  reportDate: string;
  // Inputs
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  loanType: string;
  // Calculated
  monthlyPayment: number;
  totalPayments: number;
  totalInterest: number;
  // Amortization (first 12 months + summary)
  amortizationSchedule?: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

interface ExportButtonProps {
  data: BusinessLoanPDFData | null;
  disabled?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function formatCurrencyDetailed(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function generatePDFHTML(data: BusinessLoanPDFData): string {
  const amortRows = data.amortizationSchedule?.slice(0, 12).map(row => `
    <tr>
      <td style="text-align:center">${row.month}</td>
      <td style="text-align:right;font-family:monospace">${formatCurrencyDetailed(row.payment)}</td>
      <td style="text-align:right;font-family:monospace">${formatCurrencyDetailed(row.principal)}</td>
      <td style="text-align:right;font-family:monospace">${formatCurrencyDetailed(row.interest)}</td>
      <td style="text-align:right;font-family:monospace">${formatCurrency(row.balance)}</td>
    </tr>
  `).join('') || '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Business Loan Analysis Report</title>
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
    .summary-box {
      background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);
      color: white;
      padding: 25px 30px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 25px;
    }
    .summary-label { font-size: 10pt; opacity: 0.9; }
    .summary-value { font-size: 32pt; font-weight: 700; margin: 8px 0; }
    .summary-sub { font-size: 11pt; opacity: 0.9; }
    .stats-grid {
      display: flex;
      gap: 15px;
      margin-bottom: 25px;
    }
    .stat-card {
      flex: 1;
      background: #fafafa;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 15px;
      text-align: center;
    }
    .stat-card .label { font-size: 9pt; color: #6b7280; margin-bottom: 5px; }
    .stat-card .value { font-size: 18pt; font-weight: 700; color: #2E7D32; }
    .stat-card .sub { font-size: 8pt; color: #9ca3af; margin-top: 3px; }
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
    td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 9pt; }
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
    <h1>Business Loan Analysis</h1>
    <div class="subtitle">${data.businessName || 'Loan Payment Calculator'}</div>
    <div class="brand">Prepared by ACQUIRELY | Powered by Starting Gate Financial</div>
  </div>
  <div class="content">
    <div class="meta-bar">
      <div class="meta-item"><div class="meta-label">Report Date</div><div class="meta-value">${data.reportDate}</div></div>
      <div class="meta-item"><div class="meta-label">Prepared For</div><div class="meta-value">${data.preparedFor || 'Prospective Borrower'}</div></div>
      <div class="meta-item"><div class="meta-label">Loan Type</div><div class="meta-value">${data.loanType}</div></div>
    </div>

    <div class="summary-box">
      <div class="summary-label">Monthly Payment</div>
      <div class="summary-value">${formatCurrencyDetailed(data.monthlyPayment)}</div>
      <div class="summary-sub">for ${data.loanTerm * 12} months (${data.loanTerm} years)</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="label">Loan Amount</div>
        <div class="value">${formatCurrency(data.loanAmount)}</div>
        <div class="sub">Principal</div>
      </div>
      <div class="stat-card">
        <div class="label">Total Interest</div>
        <div class="value">${formatCurrency(data.totalInterest)}</div>
        <div class="sub">${((data.totalInterest / data.loanAmount) * 100).toFixed(1)}% of principal</div>
      </div>
      <div class="stat-card">
        <div class="label">Total Payments</div>
        <div class="value">${formatCurrency(data.totalPayments)}</div>
        <div class="sub">Over loan term</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Loan Terms</div>
      <table>
        <tr><td style="width:60%">Loan Amount</td><td style="text-align:right;font-family:monospace">${formatCurrency(data.loanAmount)}</td></tr>
        <tr><td>Interest Rate (APR)</td><td style="text-align:right;font-family:monospace">${data.interestRate.toFixed(2)}%</td></tr>
        <tr><td>Loan Term</td><td style="text-align:right;font-family:monospace">${data.loanTerm} years (${data.loanTerm * 12} payments)</td></tr>
        <tr><td>Payment Frequency</td><td style="text-align:right;font-family:monospace">Monthly</td></tr>
        <tr class="highlight-row"><td><strong>Monthly Payment</strong></td><td style="text-align:right;font-family:monospace;font-weight:600">${formatCurrencyDetailed(data.monthlyPayment)}</td></tr>
        <tr class="highlight-row"><td><strong>Annual Debt Service</strong></td><td style="text-align:right;font-family:monospace;font-weight:600">${formatCurrency(data.monthlyPayment * 12)}</td></tr>
      </table>
    </div>

    ${data.amortizationSchedule && data.amortizationSchedule.length > 0 ? `
    <div class="section">
      <div class="section-title">Amortization Schedule (First 12 Months)</div>
      <table>
        <thead>
          <tr>
            <th style="text-align:center">Month</th>
            <th style="text-align:right">Payment</th>
            <th style="text-align:right">Principal</th>
            <th style="text-align:right">Interest</th>
            <th style="text-align:right">Balance</th>
          </tr>
        </thead>
        <tbody>
          ${amortRows}
        </tbody>
      </table>
      <p style="font-size:8pt;color:#6b7280;margin-top:10px;text-align:center">Showing first 12 of ${data.loanTerm * 12} payments</p>
    </div>
    ` : ''}

    <div class="disclaimer"><strong>Important Disclaimer</strong>This loan analysis is for informational purposes only and should not be considered a loan commitment or guarantee of financing. Actual loan terms, rates, and approval are subject to lender underwriting, credit review, and current market conditions. Consult with a qualified lender before making any financing decisions.</div>
    <div class="footer"><div><div class="footer-brand">ACQUIRELY</div><div>by Starting Gate Financial</div></div><div style="text-align:right">startinggatefinancial.com<br>Richardson, TX</div></div>
  </div>
</body>
</html>`;
}

export default function BusinessLoanExportButton({ data, disabled }: ExportButtonProps) {
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
      container.innerHTML = generatePDFHTML({ ...data, businessName: businessName || undefined, preparedFor: preparedFor || undefined, reportDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) });
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
      pdf.save(`Loan-Analysis-${businessName || 'Report'}-${new Date().toISOString().split('T')[0]}.pdf`);
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
              <div><h3 className="font-bold text-gray-900 text-lg">Export Loan Report</h3><p className="text-sm text-gray-500">Generate a professional PDF report</p></div>
            </div>
            <div className="space-y-4 mb-6">
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Business Name <span className="text-gray-400 font-normal">(optional)</span></label><input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business Name" className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-sgf-green-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Prepared For <span className="text-gray-400 font-normal">(optional)</span></label><input type="text" value={preparedFor} onChange={(e) => setPreparedFor(e.target.value)} placeholder="Prospective Borrower" className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-sgf-green-500 focus:outline-none" /></div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6"><p className="text-sm text-gray-600"><strong className="text-gray-900">Report includes:</strong><br/>• Monthly payment calculation<br/>• Loan terms summary<br/>• Amortization schedule (first 12 months)<br/>• Professional SGF branding</p></div>
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
