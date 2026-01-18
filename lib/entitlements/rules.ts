// lib/entitlements/rules.ts

import { Entitlements, Plan } from "./types";

export const ENTITLEMENTS_BY_PLAN: Record<Plan, Entitlements> = {
  free: {
    canSaveAnalyses: false,
    canExportPdf: false,
    canCompareScenarios: false,
    canUseCreLoanSizer: false,
  },
  core: {
    canSaveAnalyses: true,
    canExportPdf: true,
    canCompareScenarios: false,
    canUseCreLoanSizer: false,
  },
  pro: {
    canSaveAnalyses: true,
    canExportPdf: true,
    canCompareScenarios: true,
    canUseCreLoanSizer: true,
  },
  enterprise: {
    canSaveAnalyses: true,
    canExportPdf: true,
    canCompareScenarios: true,
    canUseCreLoanSizer: true,
  },
};
