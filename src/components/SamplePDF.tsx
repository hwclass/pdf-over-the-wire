import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';

// Register a font for better styling
Font.register({
  family: 'Open Sans',
  src: 'https://fonts.gstatic.com/s/opensans/v34/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVQUwaEQbjB_mQ.woff'
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Open Sans',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 16,
    marginBottom: 20,
    color: '#1976d2',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    color: '#2196f3',
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 1.5,
  },
  table: {
    display: 'table',
    width: 'auto',
    marginVertical: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bdbdbd',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
  },
  tableCell: {
    padding: 5,
    borderWidth: 1,
    borderColor: '#bdbdbd',
  },
  headerCell: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  },
  col1: {
    width: '20%',
  },
  col2: {
    width: '50%',
  },
  col3: {
    width: '30%',
  },
  summaryBox: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#666',
    fontSize: 10,
  },
});

const salesData = [
  { product: 'Laptop Pro', description: 'High-performance laptop for professionals', price: '$1,299.99' },
  { product: 'Desktop Ultra', description: 'Powerful desktop workstation', price: '$1,899.99' },
  { product: 'Tablet Air', description: 'Lightweight tablet for creatives', price: '$799.99' },
  { product: 'Smart Monitor', description: '4K HDR Professional Display', price: '$699.99' },
  { product: 'Wireless Dock', description: 'Universal docking station', price: '$249.99' },
];

const performanceMetrics = [
  { metric: 'Sales Growth', value: '+25%', period: 'YoY' },
  { metric: 'Customer Satisfaction', value: '4.8/5', period: 'Q4 2024' },
  { metric: 'Market Share', value: '32%', period: 'Current' },
];

export const SamplePDF = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Quarterly Sales Report</Text>
        <Text style={styles.text}>
          Generated on: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </Text>

        <Text style={styles.subtitle}>Performance Overview</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCell, styles.headerCell, styles.col1]}>
              <Text>Metric</Text>
            </View>
            <View style={[styles.tableCell, styles.headerCell, styles.col2]}>
              <Text>Value</Text>
            </View>
            <View style={[styles.tableCell, styles.headerCell, styles.col3]}>
              <Text>Period</Text>
            </View>
          </View>
          {performanceMetrics.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCell, styles.col1]}>
                <Text>{item.metric}</Text>
              </View>
              <View style={[styles.tableCell, styles.col2]}>
                <Text>{item.value}</Text>
              </View>
              <View style={[styles.tableCell, styles.col3]}>
                <Text>{item.period}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.subtitle}>Product Catalog</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCell, styles.headerCell, styles.col1]}>
              <Text>Product</Text>
            </View>
            <View style={[styles.tableCell, styles.headerCell, styles.col2]}>
              <Text>Description</Text>
            </View>
            <View style={[styles.tableCell, styles.headerCell, styles.col3]}>
              <Text>Price</Text>
            </View>
          </View>
          {salesData.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCell, styles.col1]}>
                <Text>{item.product}</Text>
              </View>
              <View style={[styles.tableCell, styles.col2]}>
                <Text>{item.description}</Text>
              </View>
              <View style={[styles.tableCell, styles.col3]}>
                <Text>{item.price}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.text}>
            Summary: Our Q4 2024 performance shows strong growth across all key metrics.
            The introduction of new product lines has contributed to increased market share
            and customer satisfaction scores.
          </Text>
        </View>

        <Text style={styles.footer}>
          Confidential Document - For Internal Use Only
        </Text>
      </View>
    </Page>
  </Document>
);

// Static method to generate PDF blob
SamplePDF.generatePDF = async () => {
  const blob = await pdf(<SamplePDF />).toBlob();
  return blob;
};

export default SamplePDF;