import React, { ReactNode } from "react"

import { Text, View } from "@react-pdf/renderer"
import type { Style } from "@react-pdf/types"

import { commonStyles } from "./styles"

export interface PdfTableColumn {
  header: string
  flex?: number
  align?: "left" | "center" | "right"
  /** Жирный текст в ячейках тела (не заголовка) */
  cellBold?: boolean
}

export type PdfTableCell = string | number | ReactNode

export interface PdfTableRowStyle {
  backgroundColor?: string
}

export interface PdfTableProps {
  columns: PdfTableColumn[]
  rows: PdfTableCell[][]
  rowStyles?: PdfTableRowStyle[]
}

/**
 * Generic reusable PDF table component
 * Supports custom column widths, alignment, bold text, custom cell rendering, and row styling
 */
export const PdfTable: React.FC<PdfTableProps> = ({ columns, rows, rowStyles = [] }) => {
  const getCellStyle = (column: PdfTableColumn, body?: boolean) => {
    const styles: Style[] = [commonStyles.tableCell]

    if (column.flex) {
      styles.push({ flex: column.flex })
    }

    if (column.align === "center") {
      styles.push(commonStyles.tableCellCenter)
    } else if (column.align === "right") {
      styles.push(commonStyles.tableCellRight)
    }

    if (body && column.cellBold) {
      styles.push(commonStyles.tableCellBold)
    }

    return styles
  }

  const renderCell = (cell: PdfTableCell, column: PdfTableColumn) => {
    if (React.isValidElement(cell)) {
      return <View style={getCellStyle(column, true)}>{cell}</View>
    }

    return (
      <Text style={getCellStyle(column, true)}>
        {cell === null || cell === undefined ? "" : String(cell)}
      </Text>
    )
  }

  return (
    <View style={commonStyles.table}>
      {/* Header Row */}
      <View style={[commonStyles.tableRow, commonStyles.tableHeader]}>
        {columns.map((column, idx) => (
          <Text key={idx} style={[...getCellStyle(column, false), commonStyles.tableCellBold]}>
            {column.header}
          </Text>
        ))}
      </View>

      {/* Data Rows */}
      {rows.map((row, rowIdx) => {
        const rowStyle = rowStyles[rowIdx] || {}
        const rowViewStyle = rowStyle.backgroundColor
          ? [commonStyles.tableRow, { backgroundColor: rowStyle.backgroundColor }]
          : commonStyles.tableRow
        return (
          <View key={rowIdx} style={rowViewStyle}>
            {row.map((cell, cellIdx) => (
              <React.Fragment key={cellIdx}>{renderCell(cell, columns[cellIdx])}</React.Fragment>
            ))}
          </View>
        )
      })}
    </View>
  )
}
