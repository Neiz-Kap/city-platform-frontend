import React, { ReactNode } from 'react';
import { View, Text } from '@react-pdf/renderer';
import { commonStyles } from "./styles"

export interface PdfTableColumn {
  header: string;
  flex?: number;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
}

export type PdfTableCell = string | number | ReactNode;

export interface PdfTableRowStyle {
  backgroundColor?: string;
}

export interface PdfTableProps {
  columns: PdfTableColumn[];
  rows: PdfTableCell[][];
  rowStyles?: PdfTableRowStyle[];
}

/**
 * Generic reusable PDF table component
 * Supports custom column widths, alignment, bold text, custom cell rendering, and row styling
 */
export const PdfTable: React.FC<PdfTableProps> = ({
  columns,
  rows,
  rowStyles = [],
}) => {
  const getCellStyle = (column: PdfTableColumn) => {
    // Style array for react-pdf/renderer
    // Note: react-pdf has complex style typing, using array composition pattern
    const styles: any[] = [commonStyles.tableCell];

    if (column.flex) {
      styles.push({ flex: column.flex });
    }

    if (column.align === 'center') {
      styles.push(commonStyles.tableCellCenter);
    } else if (column.align === 'right') {
      styles.push(commonStyles.tableCellRight);
    }

    if (column.bold) {
      styles.push(commonStyles.tableCellBold);
    }

    return styles;
  };

  const renderCell = (cell: PdfTableCell, column: PdfTableColumn) => {
    // If cell is already a React element, render it directly
    if (React.isValidElement(cell)) {
      return <View style={getCellStyle(column)}>{cell}</View>;
    }

    // Otherwise render as text
    return (
      <Text style={getCellStyle(column)}>
        {cell === null || cell === undefined ? '' : String(cell)}
      </Text>
    );
  };

  return (
    <View style={commonStyles.table}>
      {/* Header Row */}
      <View style={[commonStyles.tableRow, commonStyles.tableHeader]}>
        {columns.map((column, idx) => (
          <Text
            key={idx}
            style={[...getCellStyle(column), commonStyles.tableCellBold]}
          >
            {column.header}
          </Text>
        ))}
      </View>

      {/* Data Rows */}
      {rows.map((row, rowIdx) => {
        const rowStyle = rowStyles[rowIdx] || {};
        const rowViewStyle = rowStyle.backgroundColor
          ? [
              commonStyles.tableRow,
              { backgroundColor: rowStyle.backgroundColor },
            ]
          : commonStyles.tableRow;
        return (
          <View key={rowIdx} style={rowViewStyle}>
            {row.map((cell, cellIdx) => (
              <React.Fragment key={cellIdx}>
                {renderCell(cell, columns[cellIdx])}
              </React.Fragment>
            ))}
          </View>
        );
      })}
    </View>
  );
};
