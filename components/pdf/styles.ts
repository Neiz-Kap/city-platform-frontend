import { StyleSheet } from "@react-pdf/renderer"

/** Base font registered in `lib/pdf/register-report-fonts.ts` before rendering */
const font = "NotoSans"

export const commonStyles = StyleSheet.create({
  page: {
    fontFamily: font,
    fontSize: 10,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    color: "#111827",
  },
  header: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: "#4b5563",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: 14,
    marginBottom: 8,
  },
  body: {
    fontSize: 10,
    lineHeight: 1.45,
    marginBottom: 6,
  },
  muted: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 8,
  },
  warning: {
    fontSize: 9,
    color: "#b45309",
    backgroundColor: "#fffbeb",
    padding: 8,
    marginBottom: 10,
    borderRadius: 2,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
  },
  summary: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 2,
  },
  summaryText: {
    fontSize: 9,
    marginBottom: 4,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  summaryBold: {
    fontWeight: 700,
  },
  kpiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 3,
    fontSize: 9,
  },
  table: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    minHeight: 22,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
  },
  tableCell: {
    fontSize: 8,
    paddingVertical: 5,
    paddingHorizontal: 6,
    flex: 1,
  },
  tableCellCenter: {
    textAlign: "center",
  },
  tableCellRight: {
    textAlign: "right",
  },
  tableCellBold: {
    fontWeight: 700,
  },
})
