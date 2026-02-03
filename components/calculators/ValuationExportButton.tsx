'use client';

import { useState } from 'react';
import { Download, Loader2, FileText } from 'lucide-react';

export interface ValuationPDFData {
  businessName?: string;
  industry: string;
  industryLabel: string;
  preparedFor?: string;
  reportDate: string;
  annualRevenue: number;
  annualSDE: number;
  annualEBITDA: number;
  assetValue: number;
  adjustedAssetValue: number;
  inventory: number;
  realEstate: number;
  growthRate: number;
  discountRate: number;
  adjustments: {
    businessAge: { label: string; value: number };
    revenueType: { label: string; value: number };
    contractQuality: { label: string; value: number };
    ownerDependency: { label: string; value: number };
    locationMarket: { label: string; value: number };
  };
  totalAdjustment: number;
  equipmentCondition: { label: string; multiplier: number };
  sdeValuation: { low: number; mid: number; high: number; multiple: { low: number; mid: number; high: number } };
  ebitdaValuation: { low: number; mid: number; high: number; multiple: { low: number; mid: number; high: number } };
  dcfValuation: number;
  assetBasedValuation: number;
  recommendedValuation: number;
  valuationRange: { low: number; high: number };
}

interface ExportButtonProps {
  data: ValuationPDFData | null;
  disabled?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(0)}%`;
}

function generatePDFHTML(data: ValuationPDFData): string {
  const adjustmentRows = [
    { key: 'Business Age', ...data.adjustments.businessAge },
    { key: 'Revenue Type', ...data.adjustments.revenueType },
    { key: 'Contract Quality', ...data.adjustments.contractQuality },
    { key: 'Owner Dependency', ...data.adjustments.ownerDependency },
    { key: 'Location/Market', ...data.adjustments.locationMarket },
  ].map(adj => `
    <tr>
      <td>${adj.key}</td>
      <td>${adj.label}</td>
      <td class="${adj.value > 0 ? 'positive' : adj.value < 0 ? 'negative' : ''}" style="text-align: right; font-weight: 600;">
        ${formatPercent(adj.value)}
      </td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Business Valuation Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 10pt; line-height: 1.4; color: #1f2937; background: white; padding: 40px; width: 816px; }
    .header { background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%); color: white; padding: 30px 35px; margin: -40px -40px 25px -40px; }
    .header h1 { font-size: 22pt; font-weight: 700; margin-bottom: 5px; }
    .header .subtitle { font-size: 12pt; opacity: 0.9; }
    .header .brand { font-size: 9pt; opacity: 0.75; margin-top: 8px; }
    .meta-bar { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px 20px; margin-bottom: 25px; }
    .meta-item { text-align: center; flex: 1; }
    .meta-label { font-size: 8pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .meta-value { font-size: 11pt; font-weight: 600; color: #1e293b; margin-top: 3px; }
    .summary-box { background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%); color: white; padding: 25px 30px; border-radius: 12px; text-align: center; margin-bottom: 25px; }
    .summary-label { font-size: 10pt; opacity: 0.9; }
    .summary-value { font-size: 32pt; font-weight: 700; margin: 8px 0; }
    .summary-range { font-size: 11pt; opacity: 0.9; }
    .adjustment-badge { display: inline-block; background: #D4AF37; padding: 6px 16px; border-radius: 20px; font-size: 9pt; font-weight: 600; margin-top: 12px; }
    .section { margin-bottom: 22px; }
    .section-title { font-size: 13pt; font-weight: 700; color: #2E7D32; border-bottom: 2px solid #2E7D32; padding-bottom: 8px; margin-bottom: 14px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-weight: 600; font-size: 9pt; text-transform: uppercase; color: #475569; border-bottom: 2px solid #e2e8f0; }
    td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
    .positive { color: #16a34a; }
    .negative { color: #dc2626; }
    .valuation-grid { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px; }
    .valuation-card { flex: 1; min-width: 45%; background: #fafafa; border: 1px solid #e5e7eb; border-radius: 10px; padding: 15px; }
    .valuation-card h4 { font-size: 10pt; color: #374151; margin-bottom: 8px; }
    .valuation-card .value { font-size: 20pt; font-weight: 700; color: #2E7D32; margin-bottom: 6px; }
    .valuation-card .details { font-size: 8pt; color: #6b7280; line-height: 1.5; }
    .highlight-row { background: #f0fdf4 !important; }
    .highlight-row td { font-weight: 600; }
    .disclaimer { background: #fef9e7; border: 1px solid #f7dc6f; border-left: 4px solid #f4d03f; border-radius: 6px; padding: 14px 16px; margin-top: 25px; font-size: 8pt; color: #7d6608; line-height: 1.5; }
    .disclaimer strong { display: block; margin-bottom: 6px; font-size: 9pt; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 2px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 8pt; color: #6b7280; }
    .footer-brand { font-weight: 600; color: #2E7D32; font-size: 10pt; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Business Valuation Report</h1>
    <div class="subtitle">${data.businessName || data.industryLabel + ' Business'}</div>
    <div class="brand">Prepared by ACQUIRELY | Powered by Starting Gate Financial</div>
  </div>
  <div class="meta-bar">
    <div class="meta-item"><div class="meta-label">Industry</div><div class="meta-value">${data.industryLabel}</div></div>
    <div class="meta-item"><div class="meta-label">Report Date</div><div class="meta-value">${data.reportDate}</div></div>
    <div class="meta-item"><div class="meta-label">Prepared For</div><div class="meta-value">${data.preparedFor || 'Prospective Buyer'}</div></div>
  </div>
  <div class="summary-box">
    <div class="summary-label">Recommended Business Valuation</div>
    <div class="summary-value">${formatCurrency(data.recommendedValuation)}</div>
    <div class="summary-range">Range: ${formatCurrency(data.valuationRange.low)} - ${formatCurrency(data.valuationRange.high)}</div>
    <div class="adjustment-badge">${formatPercent(data.totalAdjustment)} Adjustment Applied</div>
  </div>
  <div class="section">
    <div class="section-title">Financial Summary</div>
    <table>
      <tr><td style="width: 60%;"><strong>Annual Revenue</strong></td><td style="text-align: right; font-family: monospace;">${formatCurrency(data.annualRevenue)}</td></tr>
      <tr><td><strong>Seller's Discretionary Earnings (SDE)</strong></td><td style="text-align: right; font-family: monospace; color: #2E7D32; font-weight: 600;">${formatCurrency(data.annualSDE)}</td></tr>
      <tr><td><strong>EBITDA</strong></td><td style="text-align: right; font-family: monospace;">${formatCurrency(data.annualEBITDA)}</td></tr>
      <tr><td><strong>SDE Margin</strong></td><td style="text-align: right; font-family: monospace;">${data.annualRevenue > 0 ? ((data.annualSDE / data.annualRevenue) * 100).toFixed(1) : 0}%</td></tr>
    </table>
  </div>
  <div class="section">
    <div class="section-title">Valuation Methods</div>
    <div class="valuation-grid">
      <div class="valuation-card"><h4>SDE Multiple Method</h4><div class="value">${formatCurrency(data.sdeValuation.mid)}</div><div class="details">Multiple: ${data.sdeValuation.multiple.mid.toFixed(2)}x | Range: ${formatCurrency(data.sdeValuation.low)} - ${formatCurrency(data.sdeValuation.high)}</div></div>
      <div class="valuation-card"><h4>EBITDA Multiple Method</h4><div class="value">${formatCurrency(data.ebitdaValuation.mid)}</div><div class="details">Multiple: ${data.ebitdaValuation.multiple.mid.toFixed(2)}x | Range: ${formatCurrency(data.ebitdaValuation.low)} - ${formatCurrency(data.ebitdaValuation.high)}</div></div>
      <div class="valuation-card"><h4>DCF Analysis</h4><div class="value">${formatCurrency(data.dcfValuation)}</div><div class="details">Growth: ${data.growthRate}% | Discount: ${data.discountRate}%</div></div>
      <div class="valuation-card"><h4>Asset-Based</h4><div class="value">${formatCurrency(data.assetBasedValuation)}</div><div class="details">Equipment (${data.equipmentCondition.label}): ${formatCurrency(data.adjustedAssetValue)}</div></div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Adjustment Factors</div>
    <table>
      <thead><tr><th>Factor</th><th>Selection</th><th style="text-align: right;">Adjustment</th></tr></thead>
      <tbody>
        ${adjustmentRows}
        <tr class="highlight-row"><td><strong>Total Adjustment</strong></td><td></td><td style="text-align: right; font-size: 14pt;" class="${data.totalAdjustment >= 0 ? 'positive' : 'negative'}"><strong>${formatPercent(data.totalAdjustment)}</strong></td></tr>
      </tbody>
    </table>
  </div>
  <div class="disclaimer"><strong>Important Disclaimer</strong>This valuation report is for informational purposes only and should not be considered professional financial, legal, or investment advice. Actual business value may vary based on market conditions, buyer pool, deal structure, due diligence findings, and negotiation. Consult qualified professionals before making acquisition decisions.</div>
  <div class="footer"><div><div class="footer-brand">ACQUIRELY</div><div>by Starting Gate Financial</div></div><div style="text-align: right;">startinggatefinancial.com<br>Richardson, TX</div></div>
</body>
</html>`;
}

export default function ValuationExportButton({ data, disabled }: ExportButtonProps) {
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
      pdf.save(`Valuation-Report-${businessName || data.industryLabel}-${new Date().toISOString().split('T')[0]}.pdf`);
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
              <div><h3 className="font-bold text-gray-900 text-lg">Export Valuation Report</h3><p className="text-sm text-gray-500">Generate a professional PDF report</p></div>
            </div>
            <div className="space-y-4 mb-6">
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Business Name <span className="text-gray-400 font-normal">(optional)</span></label><input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder={data ? `${data.industryLabel} Business` : 'Business Name'} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-sgf-green-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Prepared For <span className="text-gray-400 font-normal">(optional)</span></label><input type="text" value={preparedFor} onChange={(e) => setPreparedFor(e.target.value)} placeholder="Prospective Buyer" className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-sgf-green-500 focus:outline-none" /></div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6"><p className="text-sm text-gray-600"><strong className="text-gray-900">Report includes:</strong><br/>• Executive summary with recommended valuation<br/>• All 4 valuation methods with calculations<br/>• Adjustment factors breakdown<br/>• Professional SGF branding</p></div>
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
