// lib/entitlements/types.ts

export type Plan = "free" | "core" | "pro" | "enterprise";

export interface Entitlements {
  canSaveAnalyses: boolean;
  canExportPdf: boolean;
  canCompareScenarios: boolean;
  canUseCreLoanSizer: boolean;
}
