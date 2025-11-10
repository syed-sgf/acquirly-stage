import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

export type Terms = {
  borrower: string;
  business: string;
  program: "SBA7a" | "SBA504" | "Conventional";
  loanAmount: number;
  rateNote: string;
  termYears: number;
  amortYears?: number;
  feesNote?: string;
  collateral?: string;
  guarantors?: string;
  conditions?: string[];
  useOfFunds: { category: string; amount: number }[];
};

export default function IndicativeTermsPDF({ terms }: { terms: Terms }) {
  // … component body with only <Text> nodes for strings …
}