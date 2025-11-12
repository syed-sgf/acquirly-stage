import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 24 },
  h1: { fontSize: 18, marginBottom: 12 },
  row: { marginBottom: 6, flexDirection: "row", gap: 6 },
  key: { fontSize: 12, fontWeight: 700 },
  val: { fontSize: 12 },
});

type Terms = Record<string, unknown>;

export default function IndicativeTermsPDF({ terms }: { terms: Terms }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Indicative Terms</Text>
        <View>
          {Object.entries(terms ?? {}).map(([k, v]) => (
            <View key={k} style={styles.row}>
              <Text style={styles.key}>{k}:</Text>
              <Text style={styles.val}>{String(v)}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
