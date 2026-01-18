// lib/analyses/constants.ts

export const ANALYSIS_TYPES = {
  DSCR: "dscr",
  BUSINESS_LOAN: "business-loan",
  ACQUISITION: "acquisition",
  VALUATION: "valuation",
  CRE_ACQUISITION: "cre-acquisition",
  CRE_LOAN_SIZER: "cre-loan-sizer",
} as const;

export type AnalysisType =
  (typeof ANALYSIS_TYPES)[keyof typeof ANALYSIS_TYPES];

export const DEFAULT_ANALYSIS_NAMES: Record<AnalysisType, string> = {
  dscr: "DSCR Analysis",
  "business-loan": "Business Loan Analysis",
  acquisition: "Acquisition Analysis",
  valuation: "Valuation Analysis",
  "cre-acquisition": "CRE Acquisition Analysis",
  "cre-loan-sizer": "CRE Loan Sizer",
};

export function resolveAnalysisName(
  type: AnalysisType,
  inputs?: Record<string, any>
): string {
  return (
    inputs?.analysisName ||
    inputs?.scenarioName ||
    DEFAULT_ANALYSIS_NAMES[type]
  );
}
