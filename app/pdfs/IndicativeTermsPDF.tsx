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

// Styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 15,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  text: {
    marginBottom: 3,
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    paddingVertical: 5,
  },
  tableHeader: {
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
  },
  tableCell: {
    flex: 1,
    padding: 5,
  },
});

export default function IndicativeTermsPDF({ terms }: { terms: Terms }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.header}>Indicative Loan Terms</Text>
        
        {/* Borrower Information */}
        <View style={styles.section}>
          <Text style={styles.label}>Borrower:</Text>
          <Text style={styles.text}>{terms.borrower}</Text>
        </View>
        
        {/* Business Information */}
        <View style={styles.section}>
          <Text style={styles.label}>Business:</Text>
          <Text style={styles.text}>{terms.business}</Text>
        </View>
        
        {/* Loan Program */}
        <View style={styles.section}>
          <Text style={styles.label}>Program:</Text>
          <Text style={styles.text}>{terms.program}</Text>
        </View>
        
        {/* Loan Amount */}
        <View style={styles.section}>
          <Text style={styles.label}>Loan Amount:</Text>
          <Text style={styles.text}>
            ${terms.loanAmount.toLocaleString()}
          </Text>
        </View>
        
        {/* Interest Rate */}
        <View style={styles.section}>
          <Text style={styles.label}>Interest Rate:</Text>
          <Text style={styles.text}>{terms.rateNote}</Text>
        </View>
        
        {/* Term */}
        <View style={styles.section}>
          <Text style={styles.label}>Term:</Text>
          <Text style={styles.text}>{terms.termYears} years</Text>
          {terms.amortYears && (
            <Text style={styles.text}>
              Amortization: {terms.amortYears} years
            </Text>
          )}
        </View>
        
        {/* Fees */}
        {terms.feesNote && (
          <View style={styles.section}>
            <Text style={styles.label}>Fees:</Text>
            <Text style={styles.text}>{terms.feesNote}</Text>
          </View>
        )}
        
        {/* Collateral */}
        {terms.collateral && (
          <View style={styles.section}>
            <Text style={styles.label}>Collateral:</Text>
            <Text style={styles.text}>{terms.collateral}</Text>
          </View>
        )}
        
        {/* Guarantors */}
        {terms.guarantors && (
          <View style={styles.section}>
            <Text style={styles.label}>Guarantors:</Text>
            <Text style={styles.text}>{terms.guarantors}</Text>
          </View>
        )}
        
        {/* Use of Funds */}
        {terms.useOfFunds && terms.useOfFunds.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Use of Funds:</Text>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Category</Text>
                <Text style={styles.tableCell}>Amount</Text>
              </View>
              {/* Table Rows */}
              {terms.useOfFunds.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{item.category}</Text>
                  <Text style={styles.tableCell}>
                    ${item.amount.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Conditions */}
        {terms.conditions && terms.conditions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Conditions:</Text>
            {terms.conditions.map((condition, index) => (
              <Text key={index} style={styles.text}>
                • {condition}
              </Text>
            ))}
          </View>
        )}
        
        {/* Footer */}
        <View style={{ marginTop: 30, paddingTop: 20, borderTopWidth: 1, borderTopColor: "#cccccc" }}>
          <Text style={{ fontSize: 9, color: "#666666", textAlign: "center" }}>
            This is an indicative term sheet and does not constitute a commitment to lend.
            Final terms subject to credit approval and due diligence.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
